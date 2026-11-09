/**
 * LiveryLab Academy v16 — public registration request when Auth signUp is disabled.
 * Made with 💙 from NyxAtheris (LiveryLab Studios)
 *
 * This Edge Function is an explicit server-side fallback: accounts are created
 * only as PENDING initially, never as administrators. Access requires the
 * administrator's approval unless server policy is explicitly in open mode.
 * Email ownership is NOT verified by this flow.
 * Never put service-role credentials in a browser or GitHub Pages assets.
 */
import {createClient} from 'npm:@supabase/supabase-js@2.81.1';

const allowedOrigins = new Set([
  'https://akraniss05.github.io',
  'https://liverylab-academy.dev',
  'https://github.liverylabacademy.app'
]);
const headersFor=(origin:string)=>({
  'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'https://akraniss05.github.io',
  'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Vary':'Origin',
  'Cache-Control':'no-store',
  'Content-Type':'application/json; charset=utf-8',
  'X-Content-Type-Options':'nosniff',
});
function respond(status:number,data:Record<string,unknown>,origin:string){
  return new Response(JSON.stringify(data),{status,headers:headersFor(origin)});
}
const errorMessage='Registrierung konnte nicht abgeschlossen werden. Prüfe die Angaben oder kontaktiere den Support.';
const hex=async(v:string)=>{
  const bytes=new TextEncoder().encode(v);
  const data=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
};
const validEmail=(e:string)=>e.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)&&!e.endsWith('@accounts.livery-lab.app');

Deno.serve(async (request:Request)=>{
  const origin=request.headers.get('origin')||'';
  if(request.method==='OPTIONS'){
    return new Response(null,{status:allowedOrigins.has(origin)?204:403,headers:headersFor(origin)});
  }
  if(!allowedOrigins.has(origin))return respond(403,{error:'Unbekannter Website-Ursprung.'},origin);
  if(request.method!=='POST')return respond(405,{error:'Nur POST ist erlaubt.'},origin);
  if((request.headers.get('content-type')||'').split(';')[0].trim()!=='application/json')
    return respond(415,{error:'Nur JSON wird akzeptiert.'},origin);
  if(Number(request.headers.get('content-length')||'0')>4096)
    return respond(413,{error:'Registrierungsdaten sind zu groß.'},origin);
  let body:Record<string,unknown>;
  try{body=await request.json();}catch{return respond(400,{error:'Ungültige Registrierungsdaten.'},origin);}
  if(!body||typeof body!=='object'||Array.isArray(body))
    return respond(400,{error:'Ungültige Registrierungsdaten.'},origin);
  if(Object.keys(body).length>5)return respond(400,{error:'Ungültige Anfrage.'},origin);
  if(body.action!=='policy'&&body.website){return respond(201,{ok:true,requires_approval:true},origin);}
  if(body.action==='policy'){
    const url=Deno.env.get('SUPABASE_URL')||'';
    const secret=Deno.env.get('SUPABASE_SECRET_KEY')||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
    if(!url||!secret)return respond(503,{error:'Registrierungsstatus nicht erreichbar.'},origin);
    try{
      const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      const {data:policy,error}=await admin.from('academy_registration_policy').select('mode').eq('id',true).single();
      if(error||!policy)return respond(503,{error:'Registrierungsstatus nicht erreichbar.'},origin);
      return respond(200,{ok:true,mode:policy.mode,requires_approval:policy.mode!=='open'},origin);
    }catch(_){return respond(503,{error:'Registrierungsstatus nicht erreichbar.'},origin);}
  }
  const email=String(body.email||'').trim().toLowerCase();
  const username=String(body.username||'').trim().toLowerCase();
  const password=typeof body.password==='string'?body.password:'';
  if(!validEmail(email)||!/^[a-z][a-z0-9_]{2,23}$/.test(username))
    return respond(400,{error:'Bitte eine gültige E-Mail-Adresse und einen Benutzernamen (3–24 Zeichen) verwenden.'},origin);
  if(password.length<7||password.length>256)
    return respond(400,{error:'Das Passwort muss mindestens 7 Zeichen lang sein.'},origin);
  const url=Deno.env.get('SUPABASE_URL')||'';
  const secret=Deno.env.get('SUPABASE_SECRET_KEY')||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  if(!url||!secret)return respond(503,{error:'Registrierung ist momentan nicht erreichbar.'},origin);
  try{
    const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    // Public requests always consult the server's authoritative default-closed policy.
    // The public browser cannot set the approval mode using request body fields.
    const {data:policy,error:policyError}=await admin.from('academy_registration_policy')
      .select('mode').eq('id',true).single();
    if(policyError||!policy||!['approval','open'].includes(policy.mode))
      return respond(503,{error:'Registrierung ist vorübergehend nicht erreichbar.'},origin);
    if(body.action==='policy')
      return respond(200,{ok:true,mode:policy.mode,requires_approval:policy.mode!=='open'},origin);
    const autoApprove=policy.mode==='open';
    // Hash contact/IP fingerprints before persistence; no passwords, emails or IPs are logged.
    // The globally serialized database quota is authoritative; IP limits are best effort
    // because forwarding headers can be influenced by upstream proxy configuration.
    const ip=String(request.headers.get('cf-connecting-ip')||request.headers.get('x-real-ip')||
      request.headers.get('x-forwarded-for')?.split(',')[0]||'unavailable').trim().slice(0,64);
    const ipHash=await hex(secret+':ip:'+ip);
    const emailHash=await hex(secret+':email:'+email);
    const {data:permitted,error:quotaError}=await admin.rpc('academy_signup_rate_limit',{
      p_ip_hash:ipHash,p_email_hash:emailHash
    });
    if(quotaError){
      console.error('Registration quota unavailable',quotaError.code||'unknown');
      return respond(503,{error:'Registrierung ist vorübergehend nicht erreichbar. Bitte später erneut versuchen.'},origin);
    }
    if(!permitted)return respond(429,{error:'Zu viele Registrierungsversuche. Bitte später erneut versuchen.'},origin);
    const {data:claimed,error:claimedError}=await admin.from('academy_profiles')
      .select('id').eq('username',username).maybeSingle();
    if(claimedError)return respond(503,{error:'Registrierung ist vorübergehend nicht erreichbar.'},origin);
    if(claimed)return respond(409,{error:'Diese E-Mail-Adresse oder dieser Benutzername wird bereits verwendet.'},origin);
    // Admin API bypasses globally disabled self-signups.
    // email_confirm is required for password login here, but DOES NOT prove
    // email ownership. The admin dashboard must disclose this to approvers.
    const {data:created,error:createError}=await admin.auth.admin.createUser({
      email,password,email_confirm:true,
      user_metadata:{username,name:username},
      app_metadata:{academy_signup_flow:autoApprove?'self_service':'manual_request'}
    });
    if(createError||!created?.user?.id){
      if(createError)console.error('Registration creation failed',createError.code||'auth_error');
      return respond(409,{error:errorMessage},origin);
    }
    const id=created.user.id;
    const {data:profile,error:profileError}=await admin.from('academy_profiles')
      .select('role,active,access_status,username').eq('id',id).maybeSingle();
    if(profileError||!profile||profile.role!=='student'||profile.active!==false||profile.access_status!=='pending'){
      await admin.auth.admin.deleteUser(id);
      console.error('Pending-account guard rejected registration');
      return respond(503,{error:'Die Anmeldung konnte nicht sicher eingerichtet werden. Bitte erneut versuchen.'},origin);
    }
    // The auth trigger created a disabled, pending student account.
    // In self-service mode approve only after a SECOND policy check: switching
    // back to manual approval during registration must not grant new access.
    let approved=false;
    if(autoApprove){
      const {data:latest,error:latestError}=await admin.from('academy_registration_policy')
        .select('mode').eq('id',true).single();
      if(latestError||!latest){
        await admin.auth.admin.deleteUser(id);
        return respond(503,{error:'Registrierungsstatus konnte nicht bestätigt werden.'},origin);
      }
      if(latest.mode==='open'){
        const {data:updated,error:updateError}=await admin.from('academy_profiles')
          .update({active:true,access_status:'approved'})
          .eq('id',id).eq('role','student').eq('active',false).eq('access_status','pending')
          .select('id,active,access_status').single();
        if(updateError||!updated||updated.active!==true||updated.access_status!=='approved'){
          await admin.auth.admin.deleteUser(id);
          return respond(503,{error:'Konto konnte nicht sicher freigeschaltet werden.'},origin);
        }
        approved=true;
      }
    }
    return respond(201,{
      ok:true,requires_approval:!approved,
      email_ownership_verified:false,
      message:approved
        ?'Konto erstellt! Du kannst dich jetzt anmelden und mit Free-Kursen beginnen.'
        :'Registrierungsanfrage eingegangen. Der Administrator prüft deinen Zugang.'
    },origin);
  }catch(err){
    console.error('Registration backend unavailable',err instanceof Error?err.name:'Error');
    return respond(503,{error:'Registrierung ist momentan nicht erreichbar. Bitte später erneut versuchen.'},origin);
  }
});
