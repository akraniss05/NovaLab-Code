/**
 * LiveryLab Academy account administration (Supabase Edge Function).
 * Made with 💙 by NyxAtheris (LiveryLab).
 * Requires SUPABASE_URL, SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY
 * and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY via Supabase secrets.
 * Never expose server secrets in the GitHub Pages frontend.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
const origin = Deno.env.get('ACADEMY_ORIGIN') || 'https://akraniss05.github.io';
const headers: Record<string,string> = {
  'Access-Control-Allow-Origin': origin,
  'Vary': 'Origin',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};
const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers});
const env=(n:string)=>Deno.env.get(n)||'';
const isUUID=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers});
  if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
  if(req.headers.get('Origin')&&req.headers.get('Origin')!==origin)return reply(403,{error:'Origin not allowed'});
  if(Number(req.headers.get('content-length')||'0')>8192)return reply(413,{error:'Request too large'});
  const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'').trim();
  if(!token)return reply(401,{error:'Authentication required'});
  const url=env('SUPABASE_URL');
  const publicKey=env('SUPABASE_PUBLISHABLE_KEY')||env('SUPABASE_ANON_KEY');
  const secret=env('SUPABASE_SECRET_KEY')||env('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!publicKey||!secret)return reply(503,{error:'Backend not configured'});
  try{
    const caller=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:{user},error:authError}=await caller.auth.getUser(token);
    if(authError||!user)return reply(401,{error:'Invalid session'});
    const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:profile,error:profileError}=await admin.from('academy_profiles').select('role,active,needs_password_change').eq('id',user.id).single();
    if(profileError||!profile)return reply(403,{error:'Account not enrolled'});
    let body:Record<string,unknown>;
    try{body=await req.json()}catch{return reply(400,{error:'Invalid JSON'})}
    if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,{error:'Invalid request'});

    if(body.action==='finishPasswordChange'){
      const next=String(body.password||'');
      if(!profile.active)return reply(403,{error:'Konto gesperrt'});
      if(!profile.needs_password_change)return reply(403,{error:'Temporärer Passwortwechsel nicht erforderlich'});
      if(next.length<14||next.length>256)return reply(400,{error:'Neues Passwort: 14 bis 256 Zeichen'});
      const {error:pwdError}=await admin.auth.admin.updateUserById(user.id,{password:next});
      if(pwdError)throw pwdError;
      const {error:profileError}=await admin.from('academy_profiles').update({needs_password_change:false}).eq('id',user.id);
      if(profileError)throw profileError;
      return reply(200,{ok:true});
    }
    if(body.action==='deleteSelf'){
      if(body.confirmation!=='KONTO LÖSCHEN')return reply(400,{error:'Confirmation required'});
      const {error}=await admin.auth.admin.deleteUser(user.id);
      if(error)throw error;
      return reply(200,{ok:true,deleted:true});
    }
    if(profile.role!=='admin'||!profile.active)return reply(403,{error:'Administrator only'});
    if(body.action==='list'){
      const page=Math.max(1,Math.min(100,Math.trunc(Number(body.page)||1)));
      const {data:members,error}=await admin.auth.admin.listUsers({page,perPage:100});
      if(error)throw error;
      const {data:profiles,error:pe}=await admin.from('academy_profiles').select('id,role,active,username,needs_password_change');
      if(pe)throw pe;
      const map=new Map((profiles||[]).map(p=>[p.id,p]));
      const users=members.users.filter(u=>map.has(u.id)).map(u=>({
        id:u.id,email:u.email||'',username:map.get(u.id)?.username||null,needs_password_change:map.get(u.id)?.needs_password_change||false,role:map.get(u.id)?.role||'student',active:map.get(u.id)?.active??true
      }));
      return reply(200,{users,page,hasMore:members.users.length===100});
    }

    if(body.action==='createUsername'){
      const username=String(body.username||'').trim();
      const pwd=String(body.password||'');
      if(!/^[A-Za-z][A-Za-z0-9_]{2,23}$/.test(username))return reply(400,{error:'Benutzername: 3-24 Zeichen, Buchstaben/Zahlen/Unterstrich'});
      if(pwd.length<14||pwd.length>256)return reply(400,{error:'Temporäres Passwort muss 14-256 Zeichen lang sein'});
      const safe=username.toLowerCase();
      const email=safe+'@accounts.livery-lab.app';
      const {data:created,error}=await admin.auth.admin.createUser({
        email,password:pwd,email_confirm:true,
        user_metadata:{name:username},
        app_metadata:{academy_username:safe,academy_managed:true}
      });
      if(error)return reply(400,{error:'Account konnte nicht erstellt werden: '+error.message});
      if(!created?.user?.id)return reply(500,{error:'Auth provider returned no user'});
      const userId=created.user.id;
      const {error:profileIssue}=await admin.from('academy_profiles')
        .update({username:safe,display_name:username,needs_password_change:true,role:'student',active:true})
        .eq('id',userId);
      if(profileIssue){
        await admin.auth.admin.deleteUser(userId);
        return reply(500,{error:'Profil konnte nicht eingerichtet werden'});
      }
      return reply(200,{ok:true,id:userId,username:safe,notice:'Einmalpasswort nur sicher an die Person geben. Passwortwechsel beim ersten Login erforderlich.'});
    }
    if(body.action==='resetUsernamePassword'){
      const id=String(body.userId||'');
      const pwd=String(body.password||'');
      if(!isUUID(id)||id===user.id)return reply(400,{error:'Ungültige Nutzer-ID'});
      if(pwd.length<14||pwd.length>256)return reply(400,{error:'Passwort muss 14-256 Zeichen lang sein'});
      const {data:target,error:lookupError}=await admin.from('academy_profiles').select('role,username').eq('id',id).single();
      if(lookupError||!target||target.role!=='student'||!target.username)return reply(403,{error:'Nur verwaltete Schülerkonten erlaubt'});
      const {error:resetError}=await admin.auth.admin.updateUserById(id,{password:pwd});
      if(resetError)throw resetError;
      const {error:flagError}=await admin.from('academy_profiles').update({needs_password_change:true}).eq('id',id);
      if(flagError)throw flagError;
      return reply(200,{ok:true});
    }
    if(body.action==='invite'){
      const email=String(body.email||'').trim().toLowerCase();
      if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return reply(400,{error:'Invalid email'});
      const redirect=env('ACADEMY_SITE_URL')||'https://akraniss05.github.io/liverylab-academy/';
      const {error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:redirect});
      if(error)return reply(400,{error:error.message});
      return reply(200,{ok:true,message:'Invitation sent if email delivery is enabled'});
    }
    if(body.action==='setActive'||body.action==='deleteStudent'){
      if(!isUUID(body.userId))return reply(400,{error:'Invalid user id'});
      const id=String(body.userId);
      if(id===user.id)return reply(403,{error:'Cannot manage your own admin account here'});
      const {data:target,error:te}=await admin.from('academy_profiles').select('role,active').eq('id',id).single();
      if(te||!target)return reply(404,{error:'Account not found'});
      if(target.role!=='student')return reply(403,{error:'Admin accounts protected'});
      if(body.action==='setActive'){
        if(typeof body.active!=='boolean')return reply(400,{error:'Invalid active state'});
        const {error:ban}=await admin.auth.admin.updateUserById(id,{ban_duration:body.active?'none':'876000h'});
        if(ban)throw ban;
        const {error:up}=await admin.from('academy_profiles').update({active:body.active}).eq('id',id);
        if(up)throw up;
        return reply(200,{ok:true,active:body.active});
      }
      if(body.confirmation!=='SCHÜLER LÖSCHEN')return reply(400,{error:'Exact confirmation required'});
      const {error:del}=await admin.auth.admin.deleteUser(id);
      if(del)throw del;
      return reply(200,{ok:true,deleted:true});
    }
    return reply(400,{error:'Unknown action'});
  }catch(e){
    console.error('Admin function failed',e);
    return reply(500,{error:'Server error (see Supabase logs)'});
  }
});
