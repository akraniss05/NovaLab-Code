/**
 * LiveryLab Academy account administration (Supabase Edge Function).
 * Made with 💙 by NyxAtheris (LiveryLab).
 * Requires SUPABASE_URL, SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY
 * and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY via Supabase secrets.
 * Never expose server secrets in the GitHub Pages frontend.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.81.1';
const origin = Deno.env.get('ACADEMY_ORIGIN') || 'https://akraniss05.github.io';
const allowedOrigins = new Set([origin,'https://akraniss05.github.io','https://liverylab-academy.dev']);
const headers: Record<string,string> = {
  'Access-Control-Allow-Origin': origin,
  'Vary': 'Origin',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};
const env=(n:string)=>Deno.env.get(n)||'';
const isUUID=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
Deno.serve(async(req:Request)=>{
  const requestOrigin=req.headers.get('Origin')||origin;
  const responseHeaders={...headers,'Access-Control-Allow-Origin':allowedOrigins.has(requestOrigin)?requestOrigin:origin};
  const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:responseHeaders});
  if(req.method==='OPTIONS')return new Response('ok',{status:allowedOrigins.has(requestOrigin)?200:403,headers:responseHeaders});
  if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
  if(!allowedOrigins.has(requestOrigin))return reply(403,{error:'Origin not allowed'});
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
    const {data:registeredFactors,error:mfaError}=await admin.auth.admin.mfa.listFactors({userId:user.id});
    if(mfaError)return reply(503,{error:'Authenticator verification unavailable'});
    const requiresMfa=(registeredFactors?.factors||[]).some((factor:{status?:string})=>factor.status==='verified');
    if(requiresMfa){
      let aal='aal1';
      try{
        const dataPart=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
        const jwtPayload=JSON.parse(atob(dataPart.padEnd(Math.ceil(dataPart.length/4)*4,'=')));
        aal=jwtPayload?.aal||'aal1';
      }catch(_err){}
      if(aal!=='aal2')return reply(403,{error:'Bitte zuerst den Authenticator-Code bestätigen.'});
    }
    const {data:profile,error:profileError}=await admin.from('academy_profiles').select('role,active,access_status,needs_password_change').eq('id',user.id).single();
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
    if(profile.role!=='admin'||!profile.active||profile.access_status!=='approved')return reply(403,{error:'Administrator only'});
    
    // Only the original account owner may delegate or revoke Administrator.
    // New administrators can approve, ban and manage students, but can never
    // promote themselves, remove the original owner or change another admin.
    const {data:ownerList,error:ownerError}=await admin.from('academy_owner_ids').select('user_id');
    if(ownerError)return reply(503,{error:'Eigentümerrechte konnten nicht geprüft werden'});
    const ownerIds=new Set((ownerList||[]).map((x:{user_id:string})=>x.user_id));
    const isOwner=ownerIds.has(user.id);
    // Registration policy is private data: only a verified admin can view it,
    // and only the original project owner can change it.
    if(body.action==='getRegistrationMode'||body.action==='setRegistrationMode'){
      if(body.action==='setRegistrationMode'){
        if(!isOwner)return reply(403,{error:'Nur der Eigentümer darf den Registrierungsmodus ändern.'});
        if(body.mode!=='approval'&&body.mode!=='open')return reply(400,{error:'Ungültiger Registrierungsmodus.'});
        const {data:updated,error:ue}=await admin.from('academy_registration_policy')
          .update({mode:body.mode,updated_at:new Date().toISOString(),updated_by:user.id})
          .eq('id',true).select('mode,updated_at').single();
        if(ue||!updated)return reply(503,{error:'Registrierungsmodus konnte nicht gespeichert werden.'});
        return reply(200,{ok:true,mode:updated.mode,updated_at:updated.updated_at});
      }
      const {data:policy,error:pe}=await admin.from('academy_registration_policy')
        .select('mode,updated_at').eq('id',true).single();
      if(pe||!policy)return reply(503,{error:'Registrierungsmodus konnte nicht gelesen werden.'});
      return reply(200,{ok:true,mode:policy.mode,updated_at:policy.updated_at,canChange:isOwner});
    }
    // A member's learning progress can be inspected ONLY after this function's
    // verified administrator + MFA checks. Never return drafts, code or notes.
    if(body.action==='studentProgress'){
      const id=String(body.userId||'');
      if(!isUUID(id))return reply(400,{error:'Ungültige Mitglieds-ID.'});
      const {data:student,error:se}=await admin.from('academy_profiles')
        .select('id,username,display_name,role,active,access_status')
        .eq('id',id).maybeSingle();
      if(se||!student)return reply(404,{error:'Mitglied wurde nicht gefunden.'});
      const {data:progress,error:re}=await admin.from('academy_progress')
        .select('payload,updated_at').eq('user_id',id)
        .eq('key','liverylab-v10').maybeSingle();
      if(re)return reply(503,{error:'Lernfortschritt konnte nicht gelesen werden.'});
      const saved=progress?.payload&&typeof progress.payload==='object'&&!Array.isArray(progress.payload)
        ?progress.payload:{};
      const completedIds=new Set(
        (Array.isArray(saved.done)?saved.done:[])
          .filter((value:unknown):value is string=>typeof value==='string'&&value.length<=128)
      );
      const lastId=typeof saved.lastLesson?.id==='string'?saved.lastLesson.id:'';
      const {data:courses,error:ce}=await admin.from('ll_courses')
        .select('id,name,category,level').order('name',{ascending:true});
      if(ce)return reply(503,{error:'Kursübersicht konnte nicht gelesen werden.'});
      // Supabase PostgREST limits response rows; page through the lesson index.
      const allLessons:Array<{id:string,course_id:string,title:string,chapter:string,position:number}>=[];
      for(let offset=0;offset<10000;offset+=500){
        const {data:page,error:le}=await admin.from('ll_lesson_index')
          .select('id,course_id,title,chapter,position')
          .order('course_id',{ascending:true}).order('position',{ascending:true})
          .order('id',{ascending:true}).range(offset,offset+499);
        if(le)return reply(503,{error:'Lektionen konnten nicht gelesen werden.'});
        const values=page||[];allLessons.push(...values);
        if(values.length<500)break;
        if(offset>=9500)return reply(503,{error:'Zu viele Lektionen für die Übersicht.'});
      }
      const lessonGroups=new Map<string,typeof allLessons>();
      const validIds=new Set<string>();
      for(const lesson of allLessons){
        // Keep the historic Lua lessons 31–70 available via deep links but
        // exclude them from the actual main path, exactly like the frontend.
        if(lesson.course_id==='lua'&&!/^lua-(0[1-9]|[12][0-9]|30)$/.test(lesson.id)&&
           !/^lua-path-[0-9]{3}$/.test(lesson.id))continue;
        validIds.add(lesson.id);
        if(!lessonGroups.has(lesson.course_id))lessonGroups.set(lesson.course_id,[]);
        lessonGroups.get(lesson.course_id)!.push(lesson);
      }
      const last=lastId&&validIds.has(lastId)?allLessons.find(l=>l.id===lastId):null;
      const courseStats=(courses||[]).map(course=>{
        const lessons=lessonGroups.get(course.id)||[];
        const count=lessons.filter(lesson=>completedIds.has(lesson.id)).length;
        const next=lessons.find(lesson=>!completedIds.has(lesson.id))||null;
        const current=last&&last.course_id===course.id?last:next;
        return {id:course.id,name:course.name,category:course.category,
          completed:count,total:lessons.length,
          percent:lessons.length?Math.round(count/lessons.length*100):0,
          last_opened:last&&last.course_id===course.id
            ?{id:last.id,title:last.title,chapter:last.chapter}:null,
          next:next?{id:next.id,title:next.title,chapter:next.chapter}:null,
          current:current?{id:current.id,title:current.title,chapter:current.chapter}:null};
      }).sort((a,b)=>((b.completed>0?1:0)-(a.completed>0?1:0))||
        (b.percent-a.percent)||a.name.localeCompare(b.name,'de'));
      const totalDone=courseStats.reduce((n,course)=>n+course.completed,0);
      return reply(200,{
        ok:true,student:{id:student.id,username:student.username,
          display_name:student.display_name,role:student.role,
          active:student.active,access_status:student.access_status},
        progress:{completed:totalDone,total:courseStats.reduce((n,c)=>n+c.total,0),
          started_courses:courseStats.filter(c=>c.completed>0||!!c.last_opened).length,
          finished_courses:courseStats.filter(c=>c.total>0&&c.completed===c.total).length,
          last_opened:last?{id:last.id,title:last.title,course_id:last.course_id,chapter:last.chapter}:null,
          updated_at:progress?.updated_at||null},
        courses:courseStats,
        has_cloud_record:!!progress
      });
    }
    if(body.action==='setRole'){
      if(!isOwner)return reply(403,{error:'Nur der Projekteigentümer darf Administratorrollen vergeben'});
      const id=String(body.userId||'');
      const role=String(body.role||'');
      if(!isUUID(id)||!['student','admin'].includes(role)||id===user.id||ownerIds.has(id))
        return reply(400,{error:'Dieses Konto oder diese Rolle darf nicht geändert werden'});
      const {data:target,error:targetError}=await admin.from('academy_profiles')
       .select('role,active,access_status').eq('id',id).maybeSingle();
      if(targetError||!target)return reply(404,{error:'Mitglied nicht gefunden'});
      if(!target.active||target.access_status!=='approved')
        return reply(409,{error:'Nur bereits freigegebene, aktive Mitglieder können Administrator werden'});
      const {error:updateError}=await admin.from('academy_profiles').update({role}).eq('id',id);
      if(updateError)throw updateError;
      return reply(200,{ok:true,role});
    }
    if(body.action==='setTier'||body.action==='adjustPlan'){
      const id=String(body.userId||'');
      if(!isUUID(id)||id===user.id||ownerIds.has(id))
        return reply(400,{error:'Ungültiges oder geschütztes Mitgliedskonto'});
      const {data:target,error:targetError}=await admin.from('academy_profiles')
        .select('role').eq('id',id).maybeSingle();
      if(targetError||!target||target.role!=='student')return reply(403,{error:'Nur Mitgliedertarife können geändert werden'});
      const {data:previous,error:readError}=await admin.from('academy_plans')
        .select('tier,expires_at').eq('user_id',id).maybeSingle();
      if(readError)throw readError;
      const now=Date.now(),nowIso=new Date(now).toISOString(),dayMs=86400000;
      let tier=String(previous?.tier||'free');
      let expiresAt:string|null=previous?.expires_at||null;
      if(body.action==='setTier'){
        const requested=String(body.tier||'');
        if(!['free','pro','ultimate','max'].includes(requested))return reply(400,{error:'Ungültiger Tarif'});
        if(requested==='free'){tier='free';expiresAt=nowIso;}
        else{
          const active=previous&&previous.tier!=='free'&&
            (previous.expires_at===null||Date.parse(previous.expires_at)>now);
          // Preserve existing remaining time on a paid-to-paid switch.
          // New or expired grants start with a transparent 30-day period.
          if(!active)expiresAt=new Date(now+30*dayMs).toISOString();
          tier=requested;
        }
      }else{
        const operation=String(body.operation||'');
        if(!['extend','reduce','set','end'].includes(operation))
          return reply(400,{error:'Ungültige Laufzeit-Aktion'});
        if(operation==='end'){tier='free';expiresAt=nowIso;}
        else{
          const days=Number(body.days);
          if(!Number.isInteger(days)||days<1||days>3650)
            return reply(400,{error:'Bitte 1 bis 3650 ganze Tage eingeben'});
          if(tier==='free'||!previous)return reply(409,{error:'Zuerst eine Plus- oder Ultimate-Mitgliedschaft vergeben'});
          if(expiresAt===null&&operation!=='set')
            return reply(409,{error:'Unbefristetes Abo: zuerst eine feste Laufzeit festlegen'});
          const baseline=operation==='set'?now:
            operation==='extend'?Math.max(now,Date.parse(expiresAt!)):
              Date.parse(expiresAt!);
          if(!Number.isFinite(baseline))return reply(409,{error:'Gespeichertes Ablaufdatum ist ungültig'});
          const result=operation==='reduce'?baseline-days*dayMs:baseline+days*dayMs;
          if(result>now+3650*dayMs)return reply(400,{error:'Maximale Restlaufzeit: 3650 Tage'});
          if(result<=now){tier='free';expiresAt=nowIso;}
          else expiresAt=new Date(result).toISOString();
        }
      }
      const {error:planError}=await admin.from('academy_plans').upsert({
        user_id:id,tier,granted_by:user.id,expires_at:expiresAt,updated_at:nowIso
      },{onConflict:'user_id'});
      if(planError)throw planError;
      return reply(200,{ok:true,userId:id,tier,expires_at:expiresAt,
        remaining_seconds:tier==='free'?0:expiresAt===null?null:
          Math.max(0,Math.ceil((Date.parse(expiresAt)-now)/1000)),
        ended:tier==='free'});
    }
    if(body.action==='list'){
      const page=Math.max(1,Math.min(100,Math.trunc(Number(body.page)||1)));
      const {data:members,error}=await admin.auth.admin.listUsers({page,perPage:100});
      if(error)throw error;
      const {data:profiles,error:pe}=await admin.from('academy_profiles').select('id,role,active,access_status,username,needs_password_change,created_at');
      if(pe)throw pe;
      const map=new Map((profiles||[]).map(p=>[p.id,p]));
      const users=members.users.filter(u=>map.has(u.id)).map(u=>({
        id:u.id,email:u.email||'',username:map.get(u.id)?.username||null,needs_password_change:map.get(u.id)?.needs_password_change||false,role:map.get(u.id)?.role||'student',is_owner:ownerIds.has(u.id),active:map.get(u.id)?.active??false,access_status:map.get(u.id)?.access_status||'blocked',plan_tier:'free',plan_expires_at:null as string|null,email_confirmed:!!u.email_confirmed_at&&u.app_metadata?.academy_signup_flow!=='manual_request',email_review_required:u.app_metadata?.academy_signup_flow==='manual_request',created_at:u.created_at
      }));
      // Include the real, server-read expiry for each visible member.
      // Never expose subscription details outside the authenticated admin action.
      const memberIds=users.map(u=>u.id);
      if(memberIds.length){
        const {data:plans,error:plansError}=await admin.from('academy_plans')
          .select('user_id,tier,expires_at').in('user_id',memberIds);
        if(plansError)throw plansError;
        const planMap=new Map((plans||[]).map(p=>[p.user_id,p]));
        for(const entry of users){
          const plan=planMap.get(entry.id);
          entry.plan_tier=plan?.tier||'free';
          entry.plan_expires_at=plan?.expires_at||null;
        }
      }
      users.sort((a,b)=>(a.access_status==='pending'?0:1)-(b.access_status==='pending'?0:1));
      return reply(200,{users,page,isOwner,hasMore:members.users.length===100,pendingCount:users.filter(u=>u.access_status==='pending').length});
    }

    if(body.action==='createEmail'){
      const email=String(body.email||'').trim().toLowerCase();
      const pwd=String(body.password||'');
      if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.endsWith('@accounts.livery-lab.app'))return reply(400,{error:'Bitte eine gültige eigene E-Mail-Adresse eingeben'});
      if(pwd.length<14||pwd.length>256)return reply(400,{error:'Startpasswort muss 14-256 Zeichen lang sein'});
      const name=String(body.displayName||email.split('@')[0]).trim().slice(0,40)||'Student';
      const {data:created,error:createError}=await admin.auth.admin.createUser({
        email,password:pwd,email_confirm:true,
        user_metadata:{name},
        app_metadata:{academy_managed:true}
      });
      if(createError)return reply(400,{error:'E-Mail-Konto konnte nicht erstellt werden: '+createError.message});
      if(!created?.user?.id)return reply(500,{error:'Auth provider returned no user'});
      const id=created.user.id;
      const {error:profileError}=await admin.from('academy_profiles')
        .upsert({id,display_name:name,role:'student',active:true,access_status:'approved',needs_password_change:true},{onConflict:'id'});
      if(profileError){
        await admin.auth.admin.deleteUser(id);
        return reply(500,{error:'Profil konnte nicht eingerichtet werden'});
      }
      return reply(200,{ok:true,id,email,notice:'E-Mail-Konto erstellt. Startpasswort sicher an die Person übermitteln. Benutzername kann im Profil ergänzt werden.'});
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
        .update({username:safe,display_name:username,needs_password_change:true,role:'student',active:true,access_status:'approved'})
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
      if(lookupError||!target||target.role!=='student')return reply(403,{error:'Nur Schülerkonten erlaubt'});
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
      const {data:target,error:te}=await admin.from('academy_profiles').select('role,active,access_status').eq('id',id).single();
      if(te||!target)return reply(404,{error:'Account not found'});
      if(target.role!=='student')return reply(403,{error:'Admin accounts protected'});
      if(body.action==='setActive'){
        if(body.active===true){
          const {data:record,error:re}=await admin.auth.admin.getUserById(id);
          if(re||!record?.user)return reply(409,{error:'Kontodaten konnten nicht geprüft werden.'});
          const manual=record.user.app_metadata?.academy_signup_flow==='manual_request';
          if(manual&&target.access_status==='pending'&&body.manualEmailReview!==true)return reply(409,{error:'Kontaktadresse nicht bestätigt. Bitte die manuelle Prüfung ausdrücklich bestätigen.'});
          if(!manual&&!record.user.email_confirmed_at)return reply(409,{error:'Bitte zuerst die E-Mail-Adresse bestätigen, dann kann der Account freigegeben werden.'});
        }
        if(typeof body.active!=='boolean')return reply(400,{error:'Invalid active state'});
        const {error:ban}=await admin.auth.admin.updateUserById(id,{ban_duration:body.active?'none':'876000h'});
        if(ban)throw ban;
        const {error:up}=await admin.from('academy_profiles').update({active:body.active,access_status:body.active?'approved':'blocked'}).eq('id',id);
        if(up)throw up;
        return reply(200,{ok:true,active:body.active,access_status:body.active?'approved':'blocked'});
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
