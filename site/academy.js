/* LiveryLab Academy v13 — focused learning, memberships and vouchers.
 * Made with 💙 from NyxAtheris (LiveryLab Studios)
 * The footer attribution remains visible; open-source code itself cannot be made tamper-proof.
 * No browser-side administrator secrets. Supabase Auth + RLS enforce access server-side.
 */
(function(){
'use strict';
var cfg=window.LL_CONFIG||{}, $=function(q,root){return (root||document).querySelector(q);};
var content=$('#content'), sidebar=$('#sidebar'), bottom=$('#bottom-nav'), toastNode=$('#toast');
var api=null, s={streakModalOpen:false,streakBusy:false,streakClockOffsetMs:0,streakRefreshBusy:false,loginStreak:null,friendTab:'friends',authScreen:'login',refLang:'lua',refSearch:'',refGroup:'Alle',daily:null,planExpires:null,discount:null,vouchers:[],lessonGate:null,user:null,profile:null,tier:'free',ready:false,courses:[],lessons:[],progress:{done:[],watched:[],exams:{}},route:'home',filter:'Alle',search:'',lesson:null,choice:null,videoChecked:false,videoLoaded:false,exam:null,examStatus:null,examGate:null,referenceData:null,social:null,socialMedia:{},isOwner:false,entitledCourses:null,members:[],memberPlans:{},adminPage:1,catalogLimit:9,practiceChecked:false,draft:'',prefs:null,projectTab:0,projectSource:'',projectLoading:false};
var plans={free:'Free',pro:'Plus',ultimate:'Pro / Ultimate'};
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c];});}
function safeLink(url){return /^https:\/\/[^\s<>"]+$/i.test(String(url||''))?esc(url):'#';}
function notice(message){toastNode.textContent=message;toastNode.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(function(){toastNode.classList.remove('show');},5000);}
function formatError(e){return (e&&e.message)||'Unbekannter Fehler';}
function safeNumber(n){return Number.isFinite(Number(n))?Number(n):0;}
function doneIds(){return new Set(s.progress.done||[]);}
function watchedIds(){return new Set(s.progress.watched||[]);}
function countDone(courseId){var d=doneIds();return s.lessons.filter(function(l){return l.course_id===courseId&&d.has(l.id);}).length;}
function lessonsOf(id){return s.lessons.filter(function(l){return l.course_id===id;}).sort(function(a,b){return a.position-b.position;});}
function courseOf(id){return s.courses.find(function(c){return c.id===id;});}
function pct(n,total){return total?Math.round(n/total*100):0;}
function tierLabel(t){return t==='plus'?'Plus':t==='pro'?'Pro':'Free';}
function allowed(l){return !!s.profile&&(s.profile.role==='admin'||(!s.entitledCourses||s.entitledCourses.includes(l.course_id))&&(l.required_plan==='free'||(l.required_plan==='plus'&&['pro','ultimate'].includes(s.tier))||(l.required_plan==='pro'&&s.tier==='ultimate')));}
function fullAccess(){return s.profile?.role==='admin'||s.tier==='ultimate';}
function hasScript(){return s.profile?.role==='admin'||s.tier==='pro'||s.tier==='ultimate';}
function examCap(){return fullAccess()?-1:s.tier==='pro'?4:2;}
function paywall(feature,tier,description){return '<section class="feature-gate"><span class="feature-lock">🔒</span><span class="eyebrow">'+esc(tier)+'-MITGLIEDSCHAFT</span><h1>'+esc(feature)+' ist gesperrt.</h1><p class="lede">'+esc(description)+'</p><div class="feature-gate-actions"><button type="button" data-go="plans" class="btn primary">Tarif ansehen →</button><a class="btn discord" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Auf Discord anfragen</a></div><p class="micro">Schreibe NyxAtheris eine DM oder eröffne im Discord ein Ticket und erwähne @nyxatheris mit dem Grund.</p></section>';}
function badge(t){return '<span class="chip '+esc(t)+'">'+tierLabel(t)+'</span>';}
function levelText(l){var x=String(l||'beginner').toLowerCase();return /beginner|anfänger/.test(x)?'Anfänger':/intermediate|mittelstufe/.test(x)?'Aufbau':'Fortgeschritten';}

function readDraft(id){try{return localStorage.getItem('liverylab-draft-'+id)||''}catch(_){return ''}}
function saveDraft(id,value){try{localStorage.setItem('liverylab-draft-'+id,String(value).slice(0,10000))}catch(_){}}
function setPreference(key,value){try{localStorage.setItem('liverylab-pref-'+key,value?'1':'0')}catch(_){}applyPreferences()}
function getPreference(key){try{return localStorage.getItem('liverylab-pref-'+key)==='1'}catch(_){return false}}
function getChoicePreference(key,fallback){
 try{return localStorage.getItem('liverylab-choice-'+key)||fallback;}catch(_){return fallback;}
}
function setChoicePreference(key,value){
 try{localStorage.setItem('liverylab-choice-'+key,value);}catch(_){}
 applyPreferences();
}
function applyPreferences(){
 document.body.classList.toggle('compact-cards',getPreference('compact'));
 document.body.classList.toggle('less-motion',getPreference('motion'));
 document.body.classList.toggle('large-typography',getPreference('largeTypography'));
 document.body.classList.toggle('high-contrast',getPreference('contrast'));
 document.body.classList.toggle('soft-corners',getPreference('softCorners'));
 document.body.classList.toggle('decorative-background',getPreference('backgroundArt'));
 const theme=getChoicePreference('theme','violet'),accent=getChoicePreference('accent','lavender');
 if(document.documentElement?.dataset){
  document.documentElement.dataset.theme=['violet','midnight','ocean','forest','rose','ember'].includes(theme)?theme:'violet';
  document.documentElement.dataset.accent=['lavender','sky','mint','pink','amber','white'].includes(accent)?accent:'lavender';
 }
}
function syncBackdrop(){var b=$('#nav-backdrop');if(b)b.classList.toggle('visible',sidebar.classList.contains('open'))}
function pageHeading(label,title,description){return '<header class="page-heading"><span class="eyebrow">'+esc(label)+'</span><h1>'+title+'</h1><p class="lede">'+esc(description)+'</p></header>'}
function planCounts(){var f=s.lessons.filter(l=>l.required_plan==='free').length;var pl=s.lessons.filter(l=>l.required_plan==='plus').length;return {free:f,plus:f+pl,pro:s.lessons.length}}
function courseAccent(c){return c.category==='3D & Blender'?'✦':c.category==='FiveM'||c.category==='Frameworks'?'⬡':'⌘'}
function videoInfo(id){var sources={
 'e6vPt_e9sRw':{name:'Python · Komplettkurs für Anfänger',author:'Fabian Rappert',language:'Deutsch'},
 'xcmGSRdCXc4':{name:'Lua in 30 Minuten · Grundlagen',author:'Programmieren lernen',language:'Deutsch'},
 'FtaQSdrl7YA':{name:'JavaScript Crash Course',author:'TechWorld with Nana',language:'Englisch'},
 '0VDmmgFRP-k':{name:'Responsive Webseite mit HTML und CSS',author:'Programmieren lernen',language:'Deutsch'},
 'A2E3FHoB33Q':{name:'CSS in 40 Minuten · Grundlagen',author:'Programmieren lernen',language:'Deutsch'},
 'Ci3Has4L5W4':{name:'Blender Tutorial für Anfänger',author:'Kevin Stratvert',language:'Englisch'}
};return sources[id]||{name:'Video-Tutorial',author:'YouTube',language:'Tutorial'}}

function navHTML(route){
 const items=[
  ['home','⌂','Startseite'],['courses','▦','Lernen'],['script','⌘',hasScript()?'Script':'Script 🔒'],
  ['exams','☆','Prüfung'],['reference','▤',fullAccess()?'Referenz':'Referenz 🔒'],['plans','✦','Free / Plus / Pro'],
  ['profile','◉','Mein Profil'],['friends','♡','Freunde'],['settings','⚙','Einstellungen']
 ];
 if(s.profile?.role==='admin')items.push(['admin','♢','Administration']);
 return items.map(([id,icon,label])=>{
  const active=route===id||((route==='track'||route==='lesson')&&id==='home')||(route==='exam'&&id==='exams');
  return '<button type="button" class="side-link'+(active?' active':'')+'" data-go="'+id+'">'+
   '<span class="side-icon" aria-hidden="true">'+icon+'</span><span>'+label+'</span></button>';
 }).join('');
}
function frame(){
 const authenticated=!!s.ready;
 document.body.classList.toggle('is-auth',!authenticated);
 const route=parseRoute().page;
 if(!authenticated){sidebar.innerHTML='';bottom.innerHTML='';}
 else{
  sidebar.innerHTML='<div class="sidebar-logo"><img class="ll-brand-symbol" src="./liverylab-symbol.svg" alt=""><span>LiveryLab<br><span class="gradient">Academy</span></span></div>'+
  '<div class="side-label">Navigation</div>'+navHTML(route)+
  '<div class="side-bottom"><span class="eyebrow">DEIN PROFIL</span><strong>'+
  esc(s.profile.display_name||s.profile.username||'Developer')+'</strong>'+
  '<small>'+esc(plans[s.tier]||'Free')+' · '+((s.progress.done||[]).length*30)+' XP</small>'+
  '<a class="discord-small" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Discord Community</a></div>';
  const nav=[['home','home','Home'],['courses','learn','Lernen'],['script','code','Script'],['exams','exam','Prüfung'],['profile','profile','Profil']];
  bottom.innerHTML=nav.map(([id,icon,label])=>'<button type="button" data-go="'+id+'" class="bottom-item'+
   ((route===id||(id==='courses'&&['track','lesson'].includes(route))||(id==='exams'&&route==='exam'))?' active':'')+
   '" aria-label="'+label+'"><span class="side-icon" aria-hidden="true">'+llIcon(icon)+'</span><span>'+label+'</span></button>').join('');
 }
 const head=$('#xp-head');if(head)head.textContent='✦ '+((s.progress.done||[]).length*30).toLocaleString('de-DE')+' XP';
 const st=$('#streak-head');if(st){st.innerHTML=llIcon('fire')+' '+Number(s.loginStreak?.current||0)+' Tage';st.classList.toggle('can-claim',!!s.loginStreak?.claimable);}
 const avatar=$('.avatar-btn');if(avatar)avatar.textContent=String(s.profile?.display_name||s.profile?.username||'N').slice(0,1).toUpperCase();
}

function login(){
 s.ready=false;frame();
 const brand='<img class="ll-login-banner" src="./liverylab-banner.webp" alt="Livery-Lab Premium FiveM Systems Banner"><div class="brandmark"><img class="ll-brand-symbol" src="./liverylab-symbol.svg" alt=""><span>LiveryLab <span class="gradient">Academy</span></span></div>';
 if(s.authScreen==='register'){
 content.innerHTML='<div class="auth-layout"><section class="auth-card">'+brand+
 '<span class="eyebrow">[ + ] BEWERBUNG</span><h1>Dein Weg in die <span class="gradient">Academy.</span></h1>'+
 '<p class="lede">Erstelle dein Konto. Die Academy ist noch in der Testphase: Erst nach Freigabe durch NyxAtheris erhältst du Zugang. Plus/Pro gibt es derzeit auf Anfrage über Discord.</p>'+
 '<form data-form="register"><div class="form-group"><label class="form-label" for="reg-email">E-Mail-Adresse</label>'+
 '<input class="input" type="email" id="reg-email" name="email" autocomplete="email" required maxlength="254" placeholder="du@beispiel.de"></div>'+
 '<div class="form-group"><label class="form-label" for="reg-user">Benutzername</label>'+
 '<input class="input" id="reg-user" name="username" autocomplete="username" required minlength="3" maxlength="24" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" placeholder="DeinBenutzername"></div>'+
 '<div class="form-group"><label class="form-label" for="reg-pass">Passwort (mind. 14 Zeichen)</label>'+
 '<input class="input" type="password" id="reg-pass" name="password" autocomplete="new-password" minlength="14" maxlength="256" required></div>'+
 '<div class="form-group"><label class="form-label" for="reg-confirm">Passwort wiederholen</label>'+
 '<input class="input" type="password" id="reg-confirm" name="confirm_password" autocomplete="new-password" minlength="14" required></div>'+
 '<button class="btn primary block" type="submit">Registrierungsanfrage senden →</button></form>'+
 '<p class="micro">Dein Passwort wird sicher über Supabase Auth verarbeitet. Deine Anmeldung wird vom Team geprüft; ohne Genehmigung erhältst du keinen Zugriff.</p>'+
 '<button type="button" class="btn ghost block" data-action="show-login">← Bereits registriert? Anmelden</button>'+
 '<p class="smallprint" style="text-align:center;margin-top:18px">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></section></div>';return;
 }
 if(s.authScreen==='sent'){
 content.innerHTML='<div class="auth-layout"><section class="auth-card auth-success">'+brand+
 '<span class="auth-check">✓</span><span class="eyebrow">ANFRAGE VERSENDET</span>'+
 '<h1>Registrierung <span class="gradient">eingegangen.</span></h1>'+
 '<p class="lede">'+(s.registrationManual?'Deine Registrierungsanfrage ist eingegangen. NyxAtheris muss deinen Zugang zunächst genehmigen. Deine Kontakt-E-Mail wurde bei dieser Anmeldung nicht automatisch überprüft.':'Deine Registrierungsanfrage wurde gesendet. Bestätige deine E-Mail-Adresse über den Link, den Supabase dir sendet. Erst nach der Freigabe kannst du die Academy benutzen.')+'</p>'+
 '<button class="btn primary block" type="button" data-action="show-login">Zur Anmeldung →</button>'+
 '<a class="btn ghost block" style="margin-top:10px" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Discord-Support</a></section></div>';return;
 }
 content.innerHTML='<div class="auth-layout"><section class="auth-card">'+brand+
 '<span class="eyebrow">[ 01 ] DEVELOPER ACADEMY</span><h1>Lernen. Entwickeln.<br><span class="gradient">Weiterkommen.</span></h1>'+
 '<p class="lede">Melde dich mit deinem Benutzernamen oder deiner E-Mail-Adresse an.</p>'+
 '<form data-form="login"><div class="form-group"><label class="form-label" for="username">Benutzername oder E-Mail</label>'+
 '<input class="input" id="username" name="username" autocomplete="username" required minlength="3" maxlength="254" placeholder="name@beispiel.de oder dein_name"></div>'+
 '<div class="form-group"><label class="form-label" for="password">Passwort</label>'+
 '<input class="input" type="password" id="password" name="password" autocomplete="current-password" required placeholder="Dein Passwort"></div>'+
 '<button class="btn primary block" type="submit">Anmelden →</button></form>'+
 '<div class="auth-secondary"><span>Noch kein Konto?</span><button type="button" class="btn" data-action="show-register">Jetzt registrieren →</button></div>'+
 '<p class="micro">LiveryLab ist aktuell eine betreute Test-Academy. Dein Konto muss freigegeben werden. Für Plus/Pro: Schreib NyxAtheris per Discord-DM oder eröffne ein Ticket mit dem Grund und erwähne @nyxatheris.</p>'+
 '<a class="btn discord block discord-block" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Discord beitreten</a>'+
 '<p class="smallprint" style="text-align:center;margin-top:19px">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></section></div>';
}
async function registerAccount(fd){
 const email=String(fd.get('email')||'').trim().toLowerCase();
 const username=String(fd.get('username')||'').trim().toLowerCase();
 const password=String(fd.get('password')||'');
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>254)throw Error('Bitte eine gültige E-Mail-Adresse eingeben.');
 if(!/^[a-z][a-z0-9_]{2,23}$/.test(username))throw Error('Benutzername: 3–24 Zeichen, Buchstaben, Zahlen und Unterstrich.');
 if(password.length<14||password.length>256)throw Error('Das Passwort muss 14–256 Zeichen lang sein.');
 if(password!==String(fd.get('confirm_password')||''))throw Error('Die beiden Passwörter stimmen nicht überein.');
 // Prefer the ordinary Supabase signup, including true email confirmation,
 // when public signups have been enabled by the project administrator.
 const normal=await api.auth.signUp({email,password,options:{
  data:{username,name:username},
  emailRedirectTo:'https://akraniss05.github.io/liverylab-academy/'
 }});
 let manual=false;
 if(normal.error){
  const message=String(normal.error.message||'').toLowerCase();
  const code=String(normal.error.code||'').toLowerCase();
  if(code!=='signup_disabled'&&!message.includes('signups not allowed for this instance')){
   throw normal.error;
  }
  // If Supabase public signups are disabled, a server-only Edge Function
  // creates a pending account. NO service-role credential goes to the browser.
  const fallback=await api.functions.invoke('academy-register',{
   body:{email,username,password}
  });
  if(fallback.error){
   let detail='';
   try{detail=(await fallback.error.context?.json())?.error||'';}catch(_){}
   throw Error(detail||'Registrierung derzeit nicht erreichbar. Versuche es später noch einmal.');
  }
  if(!fallback.data?.ok||fallback.data?.requires_approval!==true)
   throw Error(fallback.data?.error||'Registrierung konnte nicht abgeschlossen werden.');
  manual=true;
 }else if(normal.data?.session){
  await api.auth.signOut({scope:'local'});
 }
 s.registrationManual=manual;
 s.authScreen='sent';
 login();
}

function waitingApproval(status){
 s.ready=false;frame();
 const pending=status==='pending';
 content.innerHTML='<div class="auth-layout"><section class="auth-card auth-success"><span class="auth-check">'+(pending?'◷':'⛔')+'</span>'+
 '<span class="eyebrow">'+(pending?'ANFRAGE IN PRÜFUNG':'ZUGRIFF GESPERRT')+'</span>'+
 '<h1>'+(pending?'Warte auf deine <span class="gradient">Freigabe.</span>':'Dein Zugang ist <span class="gradient">gesperrt.</span>')+'</h1>'+
 '<p class="lede">'+(pending?'Dein Konto ist angelegt. Der Administrator muss deine Registrierungsanfrage zuerst genehmigen. Bitte kontrolliere außerdem, ob du deine E-Mail-Adresse bestätigt hast.':'Der Administrator hat den Zugriff auf dieses Konto gesperrt. Du kannst derzeit keine Lektionen, Prüfungen oder Projektdaten abrufen.')+'</p>'+
 '<button class="btn primary block" type="button" data-action="retry-access">Freigabe erneut prüfen →</button>'+
 '<button class="btn ghost block" style="margin-top:9px" type="button" data-action="logout">Abmelden</button>'+
 '<a class="btn discord block" style="margin-top:9px" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Support auf Discord</a></section></div>';
}
async function signIn(fd,button){
 var identifier=String(fd.get('username')||'').trim().toLowerCase();
 var password=String(fd.get('password')||'');
 var isEmail=identifier.includes('@');
 if(isEmail?!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier):!/^[a-z][a-z0-9_]{2,23}$/.test(identifier)){
  notice('Bitte einen gültigen Benutzernamen oder eine E-Mail-Adresse eingeben.');return;
 }
 if(button){button.disabled=true;button.textContent='Anmeldung prüfen …';}
 try{
  if(isEmail){
   var result=await api.auth.signInWithPassword({email:identifier,password:password});
   if(result.error)throw result.error;
  }else{
   // Only the dedicated server can resolve a username to a private Auth email.
   // It verifies the password via Supabase Auth and never exposes the account email.
   var reply=await api.functions.invoke('academy-signin',{body:{username:identifier,password:password}});
   if(reply.error||!reply.data?.access_token||!reply.data?.refresh_token)throw Error('Login fehlgeschlagen');
   var session=await api.auth.setSession({access_token:reply.data.access_token,refresh_token:reply.data.refresh_token});
   if(session.error)throw session.error;
  }
  await boot();
 }catch(e){
  notice('Anmeldung fehlgeschlagen. Prüfe Benutzername/E-Mail und Passwort.');
  if(button){button.disabled=false;button.textContent='Anmelden →';}
 }
}
async function adminCall(body){
 var result=await api.functions.invoke(cfg.adminFunctionName||'admin-users',{body:body});
 if(result.error){var text='';try{var ctx=result.error.context;if(ctx&&ctx.json){var j=await ctx.json();text=j.error||'';}}catch(_){}throw Error(text||result.error.message||'Admin-Server nicht erreichbar');}
 if(result.data?.error)throw Error(result.data.error);
 return result.data||{};
}
async function finishPassword(fd,button){
 var pw=String(fd.get('new_password')||'');if(pw.length<14){notice('Das neue Passwort benötigt mindestens 14 Zeichen.');return;}
 if(pw!==String(fd.get('confirm_password')||'')){notice('Die Passwörter stimmen nicht überein.');return;}
 button.disabled=true;
 try{await adminCall({action:'finishPasswordChange',password:pw});s.profile.needs_password_change=false;notice('Passwort erfolgreich geändert.');await loadData();}catch(e){notice(formatError(e));button.disabled=false;}
}
function passwordChangeRequired(){
 s.ready=false;frame();
 content.innerHTML='<div class="auth-layout"><section class="auth-card"><span class="eyebrow">SICHERHEIT</span><h1>Neues Passwort <span class="gradient">festlegen.</span></h1><p class="lede">Dein vorläufiges Passwort muss bei der ersten Anmeldung ersetzt werden. Wähle mindestens 14 Zeichen.</p><form data-form="first-password"><div class="form-group"><label class="form-label">Neues Passwort<input name="new_password" class="input" type="password" minlength="14" autocomplete="new-password" required></label></div><div class="form-group"><label class="form-label">Passwort wiederholen<input name="confirm_password" class="input" type="password" minlength="14" autocomplete="new-password" required></label></div><button class="btn primary block" type="submit">Passwort speichern</button></form><button class="btn ghost block" style="margin-top:12px" type="button" data-action="logout">Abmelden</button></section></div>';
}
async function boot(){
 var auth=await api.auth.getUser();if(auth.error||!auth.data?.user){s.user=null;login();return;}
 s.user=auth.data.user;
 try{
  await window.LLMFA.refresh(api);
  if(window.LLMFA.pending){s.ready=false;frame();content.className='content mfa-box';await window.LLMFA.renderGate(content,{client:api,onSuccess:async function(){content.className='content';await boot();},onLogout:logout});return;}
  content.className='content';
  var r=await api.from('academy_profiles').select('id,display_name,username,role,active,access_status,needs_password_change').eq('id',s.user.id).maybeSingle();
  if(r.error)throw r.error;
  if(!r.data)throw Error('Dein Konto wurde noch nicht eingerichtet.');
  if(!r.data.active||r.data.access_status!=='approved'){s.profile=r.data;waitingApproval(r.data.access_status||'blocked');return;}
  s.profile=r.data;
  if(s.profile.needs_password_change){passwordChangeRequired();return;}
  await loadData();
 }catch(e){s.ready=false;frame();content.innerHTML='<div class="auth-layout panel"><h2>Kein Zugriff</h2><p class="muted">'+esc(formatError(e))+'</p><a class="btn discord" href="https://discord.gg/livery-lab" target="_blank" rel="noopener">Discord-Support</a><button type="button" data-action="logout" class="btn ghost">Abmelden</button></div>';}
}
async function loadData(){
 var all=await Promise.all([
 api.from('ll_courses').select('id,name,category,level,icon,source_url'),
 api.from('ll_lesson_index').select('id,course_id,chapter,position,title,summary,minutes,required_plan').order('position',{ascending:true}),
 api.from('academy_plans').select('tier,expires_at').eq('user_id',s.user.id).maybeSingle(),
 api.from('academy_progress').select('payload').eq('user_id',s.user.id).eq('key','liverylab-v10').maybeSingle(),
 api.rpc('academy_voucher_status')
 ]);
 if(all[0].error)throw all[0].error;if(all[1].error)throw all[1].error;
 s.courses=all[0].data||[];s.lessons=all[1].data||[];
 s.tier=['free','pro','ultimate'].includes(all[4].data?.tier)?all[4].data.tier:'free';
 s.daily=all[4].error?null:all[4].data;
 s.planExpires=all[2].data?.expires_at||null;
 s.discount=s.daily?.discount||null;
 if(all[4].error)notice('Kontingent konnte nicht geladen werden: '+formatError(all[4].error));
 var data=all[3].data?.payload||{};
 s.progress={done:Array.isArray(data.done)?data.done:[],watched:Array.isArray(data.watched)?data.watched:[],exams:data.exams||{},practiced:Array.isArray(data.practiced)?data.practiced:[]};
 s.ready=true;
 try{const streak=await api.rpc('academy_streak_status');s.loginStreak=streak.error?null:streak.data;if(s.loginStreak?.server_now)s.streakClockOffsetMs=Date.parse(s.loginStreak.server_now)-Date.now();}catch(_){}
 try{const [exam,social,courses,media]=await Promise.all([api.rpc('academy_exam_status'),api.rpc('academy_social_list'),api.rpc('academy_entitled_courses'),api.rpc('academy_social_media_list')]);s.examStatus=exam.error?null:exam.data;s.social=social.error?null:social.data;s.entitledCourses=courses.error?null:courses.data;s.socialMedia=media.error?{}:media.data||{};}catch(_){}
 s.streakModalOpen=!!s.loginStreak?.claimable;
 frame();await navigateCurrent();
}
async function logout(){try{await api.auth.signOut();}catch(e){}s.authScreen='login';s.ready=false;s.streakModalOpen=false;s.loginStreak=null;paintStreakModal();s.user=null;s.profile=null;s.lesson=null;s.courses=[];s.lessons=[];location.hash='#home';login();}
async function saveProgress(){
 var res=await api.from('academy_progress').upsert({user_id:s.user.id,key:'liverylab-v10',payload:s.progress,updated_at:new Date().toISOString()},{onConflict:'user_id,key'});
 if(res.error)throw res.error;frame();
}
function go(path){var h='#'+path;if(location.hash===h){navigateCurrent();}else{location.hash=h;}sidebar.classList.remove('open');syncBackdrop();}
function parseRoute(){var raw=decodeURIComponent((location.hash||'#home').replace(/^#/,'')).split('/');return {page:raw[0]||'home',id:raw[1]||''};}
async function navigateCurrent(){
 if(!s.ready)return;
 var route=parseRoute();s.route=route.page;
 if(route.page==='lesson'){
   s.choice=null;s.videoChecked=watchedIds().has(route.id);s.practiceChecked=(s.progress.practiced||[]).includes(route.id);s.draft=readDraft(route.id);s.videoLoaded=false;s.lesson=null;s.lessonGate=null;
   frame();content.innerHTML='<div class="center-screen"><div class="spinner"></div><p>Geschützte Lektion wird geladen …</p></div>';
   var meta=s.lessons.find(function(l){return l.id===route.id;});
   if(meta&&allowed(meta)){var result=await api.rpc('academy_open_lesson',{p_lesson:route.id});if(result.error){s.lessonGate={reason:'error',error:formatError(result.error)};notice(formatError(result.error));}else if(result.data?.allowed){s.lesson=result.data;if(s.daily){s.daily.used_today=result.data.used;s.daily.remaining_today=result.data.remaining;}}else{s.lessonGate=result.data||{reason:'error'};}}
 }
 if(route.page==='admin'&&s.profile?.role==='admin'){try{await Promise.all([fetchMembers(),fetchVouchers()]);}catch(e){notice('Adminliste: '+formatError(e));}}
 if(route.page==='script'&&hasScript()){await loadProjectTab();}
 if(route.page==='reference'&&fullAccess()&&!s.referenceData){const ref=await api.rpc('academy_reference_get');if(!ref.error)s.referenceData=ref.data||{};}
 if(route.page==='friends'||route.page==='profile'){try{const r=await api.rpc('academy_social_list');if(!r.error)s.social=r.data;}catch(_){}}
 if(route.page==='exam'&&route.id){await loadExam(route.id);}
 render();window.scrollTo({top:0,behavior:'instant'});
}

function renderMFA(){
 const target=$('#mfa-settings');
 if(!target)return;
 if(!window.LLMFA||typeof window.LLMFA.renderSettings!=='function'){
  target.innerHTML='<div class="mfa-error-card"><strong>Authenticator konnte nicht geladen werden.</strong><p>Lade die Website neu, um 2FA zu öffnen.</p></div>';return;
 }
 Promise.resolve(window.LLMFA.renderSettings(target,api)).catch(err=>{
  target.innerHTML='<div class="mfa-error-card"><strong>2FA konnte nicht geladen werden.</strong><p>'+esc(formatError(err))+'</p></div>';
 });
}
function render(){
 if(!s.ready){login();return;}
 frame();const r=parseRoute();
 const pages={home:homePage,courses:coursesPage,track:()=>trackPage(r.id),lesson:()=>lessonPage(r.id),
  script:()=>hasScript()?scriptPage():paywall('Script-Werkstatt','Plus','Codebeispiele sind ab Plus verfügbar.'),plans:plansPage,exams:examsPage,exam:()=>examPage(r.id),
  reference:()=>fullAccess()?referencePage():paywall('Code-Referenzen','Pro / Ultimate','Die vollständige Sprachbibliothek gehört zum höchsten Tarif.'),profile:profilePage,friends:friendsPage,settings:settingsPage,admin:adminPage};
 content.innerHTML=(pages[r.page]||homePage)();
 if(r.page==='settings')renderMFA();
 paintStreakModal();
}


function stats(){
 const done=(s.progress.done||[]).length,available=s.lessons.filter(allowed).length,started=s.courses.filter(c=>countDone(c.id)>0).length;
 return '<div class="stats-grid">'+
  '<div class="stat-card"><strong>'+done+'<span class="stat-total">/'+available+'</span></strong><small>LEKTIONEN</small></div>'+
  '<div class="stat-card"><strong>'+done*30+'</strong><small>XP</small></div>'+
  '<div class="stat-card"><strong>'+started+'</strong><small>LERNPFADE</small></div>'+
  '<div class="stat-card"><strong>'+pct(done,available)+'%</strong><small>FORTSCHRITT</small></div>'+
  '</div>';
}

function courseCard(c){
 var lessons=lessonsOf(c.id),done=countDone(c.id),complete=lessons.length>0&&done===lessons.length,free=lessons.some(l=>l.required_plan==='free');
 return '<article class="course-card'+(complete?' is-complete':'')+'">'+
 '<div class="course-head"><span class="course-icon">'+esc(courseAccent(c))+'</span><span class="chip '+(complete||free?'free':'plus')+'">'+(complete?'✓ Abgeschlossen':free?'Einstieg frei':'Aufbaukurs')+'</span></div>'+
 '<div><span class="micro">'+esc(c.category)+' · '+levelText(c.level)+'</span><h3>'+esc(c.name)+'</h3></div>'+
 '<p>'+lessons.length+' Lektionen · Verständliche Schritte, Tutorials und Praxis.</p>'+
 '<div class="progress" role="progressbar" aria-valuenow="'+done+'" aria-valuemin="0" aria-valuemax="'+lessons.length+'" aria-label="Kursfortschritt"><span style="width:'+pct(done,lessons.length)+'%"></span></div>'+
 '<div class="meta-line"><span>'+done+' / '+lessons.length+' abgeschlossen</span><span>'+pct(done,lessons.length)+'%</span></div>'+
 '<button class="btn block" type="button" data-go="track/'+esc(c.id)+'">'+(complete?'Kurs ansehen ✓':done?'Weiterlernen →':'Lernpfad öffnen →')+'</button></article>';
}


function llIcon(name){
 const paths={
 home:'<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 learn:'<path d="m2 10 10-5 10 5-10 5zM6 12.5V18c4 3 8 3 12 0v-5.5M22 10v6"/>',
 code:'<path d="m8 5-6 7 6 7M16 5l6 7-6 7M14 3l-4 18"/>',
 exam:'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4h6V2H9zM9 12l2 2 4-4M9 18h6"/>',
 book:'<path d="M12 6c-3-2-7-2-10-1v15c4-2 7-1 10 1 3-2 6-3 10-1V5c-3-1-7-1-10 1zM12 6v15"/>',
 fire:'<path d="M12 22c-4.4 0-7-3.2-7-7.5 0-3.2 2-5.7 5-8.5 0 3 1.6 5 2.1 5.5C13.3 8.2 16 5 16 2c3.8 4 4.9 8.3 4 12.6-.7 4.7-3.4 9.4-8 9.4zM12 21c-2 0-3.2-1.7-3.2-3.6 0-2.2 1.2-3.5 2.4-4.4.1 1.8 1.2 2.5 1.5 2.7 1.1-1.1 1.7-2.2 1.9-3.2 3.4 1.9 8.5-2.6 8.5z"/>',
 friends:'<circle cx="9" cy="8" r="3"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6v1"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M10 2h4l.6 2.5 2 1L19 4l3 3-1.5 2.4.7 2.1L23 12v3l-2.5.8-1 2L21 20l-3 2-2.4-1.5-2.1.7L13 23h-3l-.8-2.5-2-.8L5 21l-3-3 1.5-2.4-.7-2.1L1 13v-3l2.5-.8 1-2L3 5l3-3 2.4 1.5L10 3z"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
 arrow:'<path d="m9 5 7 7-7 7"/>',check:'<path d="m4 12 5 5L20 6"/>',
 xp:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 close:'<path d="M5 5 19 19M19 5 5 19"/>'
 };
 return '<svg class="ll-icon ll-icon-'+esc(name)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.code)+'</svg>';
}
function streakRemaining(){
 const st=s.loginStreak;
 if(!st||!st.next_claim_at||st.claimable)return 0;
 return Math.max(0,Math.ceil((Date.parse(st.next_claim_at)-Date.now()-s.streakClockOffsetMs)/1000));
}
function durationDisplay(value){
 const n=Math.max(0,Math.ceil(Number(value)||0));
 return [Math.floor(n/3600),Math.floor(n%3600/60),n%60].map(x=>String(x).padStart(2,'0')).join(':');
}
async function refreshStreakStatus(){
 if(!api||!s.ready)return;
 const r=await api.rpc('academy_streak_status');if(r.error)throw r.error;
 s.loginStreak=r.data||null;
 if(s.loginStreak?.server_now)s.streakClockOffsetMs=Date.parse(s.loginStreak.server_now)-Date.now();
 return s.loginStreak;
}
function streakModalHtml(){
 if(!s.ready||!s.streakModalOpen)return '';
 const st=s.loginStreak||{current:0,best:0,claimable:false},ready=st.claimable===true,n=Number(st.current||0);
 return '<div class="ll-streak-backdrop" id="streak-overlay"><section role="dialog" aria-modal="true" aria-labelledby="streak-dialog-title" class="ll-streak-modal">'+
 '<button class="ll-modal-close" type="button" aria-label="Fenster schließen" data-streak-close>'+llIcon('close')+'</button>'+
 '<div class="ll-streak-emblem"><span class="ll-laurel">❧</span><span class="ll-fire-emblem">'+llIcon('fire')+'</span><span class="ll-laurel right">❧</span></div>'+
 '<span class="eyebrow ll-streak-kicker">DEINE TÄGLICHE BELOHNUNG</span>'+
 '<h2 id="streak-dialog-title">Daily <span class="gradient">Streak</span></h2>'+
 '<p class="ll-streak-lede">'+(ready?'Dein täglicher Claim ist bereit!':'Dein heutiger Claim ist gespeichert.')+'</p>'+
 '<div class="ll-streak-counter">'+llIcon('fire')+'<strong>'+n+' '+(n===1?'Tag':'Tage')+' Streak</strong><span>Rekord: '+Number(st.best||0)+'</span></div>'+
 (ready?'<p class="ll-streak-instructions">Drücke auf <strong>Claim</strong>, damit deine Streak weiterläuft. Danach startet die 24-Stunden-Wartezeit.</p>'+
 '<button class="ll-streak-claim" type="button" data-streak-claim '+(s.streakBusy?'disabled':'')+'>'+(s.streakBusy?'Wird eingelöst …':'Claim')+llIcon('arrow')+'</button>'+
 '<div class="ll-streak-next">'+llIcon('clock')+'<span>Nächster Claim nach dem Einlösen: <strong>24:00:00</strong></span></div>':
 '<p class="ll-streak-instructions">Komm morgen wieder und sichere deine Serie. Das nächste Zeitfenster öffnet nach 24 Stunden.</p>'+
 '<div class="ll-streak-claimed">'+llIcon('check')+' Für heute eingelöst</div>'+
 '<div class="ll-streak-next">'+llIcon('clock')+'<span>Nächster Claim in <strong data-streak-countdown>'+durationDisplay(streakRemaining())+'</strong></span></div>')+
 '<p class="ll-streak-timezone">Ein Claim pro Kalendertag (00:00–00:00 Uhr, Deutschland). Wird ein ganzer Tag übersprungen, startet die Serie wieder bei 1.</p></section></div>';
}
function paintStreakModal(){
 const root=document.querySelector('#streak-portal');if(!root)return;
 root.innerHTML=streakModalHtml();
 const opened=!!(s.ready&&s.streakModalOpen);
 document.body.classList.toggle('streak-modal-visible',opened);
 const shell=document.querySelector('#app');if(shell&&'inert' in shell)shell.inert=opened;
}
function updateStreakClocks(){
 if(!s.ready)return;
 const v=durationDisplay(streakRemaining());
 document.querySelectorAll('[data-streak-countdown]').forEach(x=>{if(x.textContent!==v)x.textContent=v;});
 if(s.loginStreak?.next_claim_at&&!s.loginStreak.claimable&&streakRemaining()===0&&!s.streakRefreshBusy){
  s.streakRefreshBusy=true;
  refreshStreakStatus().then(st=>{if(st?.claimable&&s.streakModalOpen)paintStreakModal();
    if(parseRoute().page==='home')render();
  }).catch(()=>{}).finally(()=>{s.streakRefreshBusy=false;});
 }
}
async function claimDailyStreak(){
 if(s.streakBusy||!s.loginStreak?.claimable)return;
 s.streakBusy=true;paintStreakModal();
 try{
  const r=await api.rpc('academy_streak_claim');if(r.error)throw r.error;
  if(r.data?.status){s.loginStreak=r.data.status;
   if(s.loginStreak.server_now)s.streakClockOffsetMs=Date.parse(s.loginStreak.server_now)-Date.now();
  }else await refreshStreakStatus();
  if(r.data?.ok){
   notice('🔥 Claim erfolgreich! '+Number(s.loginStreak?.current||0)+' Tage Streak.');
   try{const social=await api.rpc('academy_social_list');if(!social.error)s.social=social.data;}catch(_){}
  }else notice(r.data?.error||'Dein nächster Claim ist noch nicht bereit.');
 }catch(e){notice('Claim fehlgeschlagen: '+formatError(e));try{await refreshStreakStatus()}catch(_){}}
 finally{s.streakBusy=false;render();paintStreakModal();}
}


function homeShortcut(icon,label,description,route,locked,wide){
 return '<button type="button" class="ll-home-shortcut'+(wide?' wide':'')+(locked?' is-locked':'')+'" data-go="'+esc(route)+'">'+
 '<span class="ll-shortcut-symbol">'+llIcon(icon)+'</span>'+
 '<span class="ll-shortcut-text"><strong>'+esc(label)+(locked?' <span class="ll-shortcut-lock" aria-label="Tarif erforderlich">🔒</span>':'')+'</strong>'+
 '<small>'+esc(description)+'</small></span>'+llIcon('arrow')+'</button>';
}
function homePage(){
 const completed=doneIds(),available=s.lessons.filter(allowed);
 const next=available.find(l=>!completed.has(l.id)&&['coding-basics','lua','python','fivem'].includes(l.course_id))||
 available.find(l=>!completed.has(l.id));
 const nextCourse=next?courseOf(next.course_id):null;
 const currentDone=nextCourse?countDone(nextCourse.id):0,total=nextCourse?lessonsOf(nextCourse.id).length:0,progress=pct(currentDone,total);
 const xp=(s.progress.done||[]).length*30,level=Math.floor(xp/500)+1,levelXp=xp%500;
 const nickname=s.profile?.display_name||s.profile?.username||'Developer';
 const streak=Number(s.loginStreak?.current||0),ready=!!s.loginStreak?.claimable;
 const picks=['coding-basics','lua','python','javascript'].map(courseOf).filter(Boolean);
 return '<div class="ll-home-dashboard">'+
 '<section class="ll-home-brand-banner"><img src="./liverylab-banner.webp" alt="Livery-Lab – Premium FiveM Systems, violette Skyline" loading="eager" fetchpriority="high"></section>'+
 '<div class="ll-home-greeting"><div><span class="eyebrow">WILLKOMMEN ZURÜCK, '+esc(nickname.toUpperCase())+'</span>'+
 '<h1>Deine <span class="gradient">Developer Academy.</span></h1><p>Lerne programmieren, entwickle Projekte und erreiche deine nächsten Ziele.</p></div>'+
 '<div class="ll-home-level"><div class="ll-level-top">'+llIcon('xp')+'<span>Level '+level+'</span></div>'+
 '<small>'+levelXp+' / 500 XP bis Level '+(level+1)+'</small><div class="ll-level-bar"><span style="width:'+(levelXp/5)+'%"></span></div></div></div>'+
 '<section class="ll-home-continue"><div class="ll-continue-icon">'+llIcon('code')+'</div>'+
 '<div class="ll-continue-copy"><span class="eyebrow">WEITERLERNEN</span>'+
 '<h2>'+esc(nextCourse?.name||'Deine Lernreise beginnt hier')+'</h2>'+
 '<p>'+esc(next?.title||'Wähle deinen ersten Kurs und starte mit dem Programmieren.')+'</p>'+
 '<div class="ll-continue-progress"><div class="ll-level-bar"><span style="width:'+progress+'%"></span></div><strong>'+progress+' %</strong></div></div>'+
 '<button type="button" class="btn primary ll-continue-button" data-go="'+(next?'lesson/'+esc(next.id):'courses')+'">Jetzt fortsetzen '+llIcon('arrow')+'</button></section>'+
 '<div class="ll-home-heading"><span class="eyebrow">[ ✦ ] DEINE ACADEMY</span><h2>Was möchtest du heute machen?</h2><p>Alle wichtigen Bereiche auf einen Blick.</p></div>'+
 '<div class="ll-home-shortcuts">'+
 homeShortcut('learn','Lernen','Kurse, Tutorials und praxisnahe Projekte.','courses',false,false)+
 homeShortcut('code','Script','Fertige FiveM-Skripte Schritt für Schritt.','script',!hasScript(),false)+
 homeShortcut('exam','Prüfungen','Teste dein Wissen in passenden Kursprüfungen.','exams',false,false)+
 homeShortcut('book','Referenzen','Funktionen und APIs schnell nachschlagen.','reference',!fullAccess(),false)+
 '<button type="button" class="ll-home-shortcut ll-streak-shortcut" data-streak-open>'+
 '<span class="ll-shortcut-symbol fire">'+llIcon('fire')+'</span><span class="ll-shortcut-text"><strong>Daily Streak <span class="ll-streak-day-pill">'+streak+' '+(streak===1?'Tag':'Tage')+'</span></strong>'+
 '<small>'+(ready?'Dein Claim ist bereit – sichere deine Serie!':s.loginStreak?.next_claim_at?'Nächster Claim in <span data-streak-countdown>'+durationDisplay(streakRemaining())+'</span>':'Melde dich an und starte deine erste Serie.')+'</small></span>'+llIcon('arrow')+'</button>'+
 homeShortcut('friends','Freunde','Vernetze dich und vergleiche Lernfortschritte.','friends',false,false)+
 homeShortcut('settings','Einstellungen','Account, Sicherheit und persönliches Design.','settings',false,true)+
 homeShortcut('profile','Mein Profil','Bilder, Banner, Erfolgstitel und Bio.','profile',false,false)+
 homeShortcut('xp','Mitgliedschaften','Free, Plus und Pro vergleichen.','plans',false,false)+
 (s.profile?.role==='admin'?homeShortcut('settings','Administration','Freigaben, Mitglieder und Gutscheine verwalten.','admin',false,true):'')+'</div>'+
 '<section class="ll-home-more"><div class="section-heading"><div><span class="eyebrow">[ ▦ ] WEITERLERNEN</span><h2>Empfohlene Lernpfade</h2></div><button class="btn small" data-go="courses">Alle Kurse →</button></div>'+
 '<div class="course-grid">'+picks.map(courseCard).join('')+'</div></section>'+
 membershipHelp()+'</div>';
}

function filteredCourses(){
 return s.courses.filter(function(c){return (s.filter==='Alle'||c.category===s.filter)&&(!s.search||(c.name+' '+c.category).toLowerCase().includes(s.search.toLowerCase()));}).sort(function(a,b){var aP=['coding-basics','lua','python','javascript','html','css','blender-fundamentals','fivem'].indexOf(a.id),bP=['coding-basics','lua','python','javascript','html','css','blender-fundamentals','fivem'].indexOf(b.id);if(aP>=0||bP>=0)return (aP<0?99:aP)-(bP<0?99:bP);return a.name.localeCompare(b.name,'de');});
}
function catalogItems(){
 var all=filteredCourses();
 return '<div id="catalog-list" class="course-grid">'+
 (all.slice(0,s.catalogLimit).map(courseCard).join('')||'<div class="empty">Keine passenden Kurse gefunden.</div>')+
 '</div><div class="catalog-footer" id="catalog-footer">'+(all.length>s.catalogLimit?
 '<button class="btn" type="button" data-action="more-courses">Weitere '+Math.min(9,all.length-s.catalogLimit)+' Kurse anzeigen ↓</button><p class="micro">'+s.catalogLimit+' von '+all.length+' Kursen angezeigt</p>':'<p class="micro">'+all.length+' Kurse angezeigt</p>')+'</div>';
}
function coursesPage(){
 var cats=['Alle','Programmieren','Sprachen','FiveM','Frameworks','Webentwicklung','3D & Blender','Backend','Tools','Profi-Wissen'].filter(c=>c==='Alle'||s.courses.some(x=>x.category===c));
 return pageHeading('KURSBIBLIOTHEK','Dein Weg zum <span class="gradient">Developer.</span>',
 'Finde deinen Schwerpunkt. Wir zeigen zunächst die wichtigsten Lernpfade statt einer endlosen Liste.')+
 '<section class="section"><div class="catalog-toolbar"><input class="input searchbar" id="course-search" type="search" placeholder="Kurse durchsuchen …" value="'+esc(s.search)+'" aria-label="Kurse durchsuchen"><span class="chip">'+s.courses.length+' Lernpfade</span></div>'+
 '<div class="catalog-tags">'+cats.map(c=>'<button class="pill'+(s.filter===c?' active':'')+'" data-filter="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div>'+
 '<div class="section-heading" style="margin-top:22px"><div><h2>Passende Kurse</h2><p id="course-count">'+filteredCourses().length+' Ergebnisse · Schritt für Schritt</p></div></div>'+
 '<div id="catalog-container">'+catalogItems()+'</div></section>';
}

function trackPage(id){
 const course=courseOf(id);if(!course)return notFound();
 const all=lessonsOf(id),completed=doneIds(),done=countDone(id),next=all.find(l=>!completed.has(l.id)&&allowed(l));
 const chapters=[];
 for(const l of all){const last=chapters.at(-1);if(last?.title===l.chapter)last.items.push(l);else chapters.push({title:l.chapter,items:[l]});}
 let out='<a class="back" href="#courses">← Alle Kurse</a>'+
 '<section class="track-top"><span class="eyebrow">[ 00 ] LERNPFAD · '+all.length+' LEKTIONEN</span>'+
 '<h1>'+esc(course.name)+' <em>lernen.</em></h1>'+
 '<p class="lede">Jede Lektion erklärt ein Konzept. Danach schaust du ein passendes Tutorial an, löst eine Praxisaufgabe und überprüfst dein Wissen.</p></section>'+
 '<div class="stats-grid track-stats"><div class="stat-card"><strong>'+done+'/'+all.length+'</strong><small>LEKTIONEN</small></div>'+
 '<div class="stat-card"><strong>'+done*30+'</strong><small>XP</small></div>'+
 '<div class="stat-card"><strong>'+pct(done,all.length)+'%</strong><small>FORTSCHRITT</small></div>'+
 '<div class="stat-card"><strong>'+((s.progress.exams||{})[id]?'✓':'–')+'</strong><small>PRÜFUNG</small></div></div>';
 if(next)out+='<div class="next-lesson"><span class="eyebrow">NÄCHSTE LEKTION</span><h3>'+esc(next.title)+'</h3>'+
 '<p>'+esc(next.summary)+'</p><button class="btn primary" data-go="lesson/'+esc(next.id)+'">Jetzt starten →</button></div>';
 chapters.forEach((chapter,ci)=>{
  const complete=chapter.items.filter(l=>completed.has(l.id)).length;
  out+='<section class="chapter"><div class="chapter-title"><span>[ '+String(ci+1).padStart(2,'0')+' ] '+esc(chapter.title)+'</span>'+
   '<span class="chapter-count">'+complete+'/'+chapter.items.length+'</span></div><div class="lesson-list">'+
   chapter.items.map((l,i)=>{
     const ok=completed.has(l.id),unlocked=allowed(l);
     return '<button type="button" class="lesson-card '+(ok?'is-complete ':'')+(!unlocked?'locked':'')+
      '" data-go="lesson/'+esc(l.id)+'" aria-label="'+esc(l.title)+(ok?', abgeschlossen':!unlocked?', gesperrt':'')+'">'+
      '<span class="lesson-num">'+String(i+1).padStart(2,'0')+'</span><span class="lesson-main"><strong>'+esc(l.title)+'</strong>'+
      '<span class="lesson-summary">'+esc(l.summary)+'</span>'+
      '<span class="lesson-meta">'+l.minutes+' MIN · PRAXIS + QUIZ'+(!unlocked?' · '+tierLabel(l.required_plan).toUpperCase():'')+'</span></span>'+
      '<span class="status-ring">'+(ok?'✓':!unlocked?'⌑':'')+'</span></button>';
   }).join('')+'</div></section>';
 });
 out+='<section class="section exam-callout"><span class="eyebrow">[ ★ ] ABSCHLUSS</span>'+
 '<h2>Bereit für die Prüfung?</h2><p>Trainiere dein Wissen mit Fragen aus diesem Kurs.</p>'+
 '<button class="btn primary" data-go="exam/'+esc(id)+'">Prüfung ansehen →</button></section>';
 return out;
}

function notFound(){return '<div class="empty"><h2>Inhalt nicht gefunden</h2><p>Dieser Lernpfad ist nicht verfügbar.</p><button class="btn" data-go="courses">Zur Kursbibliothek</button></div>';}
function lessonPage(id){
 var l=s.lessons.find(x=>x.id===id);if(!l)return notFound();
 var c=courseOf(l.course_id),all=lessonsOf(l.course_id),index=all.findIndex(x=>x.id===id);
 var back='<a class="back" href="#track/'+esc(l.course_id)+'">← '+esc(c?.name||'Lernpfad')+'</a>';
 if(!allowed(l))return back+'<section class="panel locked-panel"><div class="lock-icon">🔒</div><span class="eyebrow">KURSINHALT GESCHÜTZT</span>'+
 '<h1>'+esc(l.title)+'</h1><p class="lede" style="margin:auto">'+esc(l.summary)+'</p>'+
 '<p>Diese Lektion ist mit <strong>'+tierLabel(l.required_plan)+'</strong> freigeschaltet.</p>'+
 '<div class="hero-actions" style="justify-content:center"><button class="btn primary" data-go="plans">Stufen vergleichen</button>'+
 '<a class="btn discord" rel="noopener noreferrer" target="_blank" href="https://discord.gg/livery-lab">Freischaltung anfragen</a></div></section>';
 if(!s.lesson){const daily=s.lessonGate?.reason==='daily_limit';return back+'<section class="lesson-gate"><span class="gate-icon">'+(daily?'◷':'🔒')+'</span><span class="eyebrow">'+(daily?'TAGESLIMIT ERREICHT':'LEKTION NICHT VERFÜGBAR')+'</span><h2>'+(daily?'Für heute geschafft.':'Lektion nicht geladen')+'</h2><p>'+(daily?'Du hast heute alle '+safeNumber(s.daily?.daily_limit)+' neuen Lernstationen geöffnet. Morgen geht es weiter. Bereits geöffnete Stationen bleiben zugänglich.':esc(s.lessonGate?.error||'Prüfe deine Freischaltung und Verbindung.'))+'</p><div class="actions-pair"><button class="btn" data-go="track/'+esc(l.course_id)+'">← Lernpfad</button><button class="btn primary" data-go="plans">Tarife ansehen →</button></div></section>';}
 var p=s.lesson.payload||{},video=s.lesson.video_id,info=videoInfo(video),options=Array.isArray(p.options)?p.options:[],finished=doneIds().has(id),isBlender=c?.category==='3D & Blender';
 var validVideo=video&&/^[a-zA-Z0-9_-]{11}$/.test(video),url=validVideo?'https://www.youtube.com/watch?v='+video+'&t='+Math.max(0,Number(s.lesson.video_start)||0)+'s':null;
 var search='https://www.youtube.com/results?search_query='+encodeURIComponent(c.name+' '+l.title+' Anleitung Tutorial deutsch');
 var next=all[index+1],d=esc(s.draft),isPracticeDone=s.practiceChecked||finished;
 return '<article class="lesson-article">'+back+
 '<header><span class="eyebrow">'+esc(c.name)+' · '+esc(l.chapter)+'</span><h1>'+esc(l.title)+'</h1>'+
 '<p>'+esc(p.goal||l.summary)+'</p><div class="chips"><span class="chip">'+(index+1)+' von '+all.length+'</span><span class="chip">'+l.minutes+' Minuten</span>'+
 '<span class="chip '+(finished?'free':'')+'">'+(finished?'✓ Abgeschlossen':'30 XP möglich')+'</span></div>'+
 '<div class="lesson-steps"><div class="lesson-step done"><span class="step-index">01</span>Verstehen</div>'+
 '<div class="lesson-step '+(s.videoChecked?'done':'')+'"><span class="step-index">02</span>Video</div>'+
 '<div class="lesson-step '+(isPracticeDone?'done':'')+'"><span class="step-index">03</span>Praxis</div>'+
 '<div class="lesson-step '+(finished?'done':'')+'"><span class="step-index">04</span>Quiz</div></div></header>'+
 (finished?'<div class="done-banner" style="margin:15px 0"><strong>✓ Lektion abgeschlossen</strong><p>Du hast diese Lektion bereits bearbeitet und 30 XP gesammelt.</p></div>':'')+
 '<section class="step-box"><span class="eyebrow">SCHRITT 01 · VERSTEHEN</span><h2>Die Idee dahinter.</h2>'+
 '<p>'+esc(p.theory||l.summary)+'</p>'+
 (Array.isArray(p.keyPoints)?'<ul>'+p.keyPoints.slice(0,4).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
 (p.mistake?'<div class="note"><strong>Typischer Fehler:</strong> '+esc(p.mistake)+'</div>':'')+
 (p.example?'<div class="codebox"><pre><code>'+esc(p.example)+'</code></pre></div>':'')+
 (p.resource?'<a href="'+safeLink(p.resource)+'" target="_blank" rel="noopener noreferrer">Offizielle Dokumentation ↗</a>':'')+
 '</section>'+
 '<section class="step-box"><span class="eyebrow">SCHRITT 02 · VIDEO-TUTORIAL</span><h2>Erklärung ansehen.</h2>'+
 (validVideo?
 '<p class="muted">Passender Videoguide: <strong>'+esc(info.name)+'</strong>. Wenn das Video länger ist, konzentriere dich auf das Kapitel zu dieser Lektion.</p>'+
 '<div class="video-frame" id="video-frame"><div class="video-placeholder"><div class="play">▶</div><strong>'+esc(info.name)+'</strong>'+
 '<small>'+esc(info.author)+' · '+esc(info.language)+' · YouTube</small>'+
 '<button type="button" class="btn primary" data-action="load-video">Video abspielen →</button>'+
 '<small>Der externe Player wird erst auf deinen Klick geladen.</small></div></div>'+
 '<div class="video-source"><p class="micro">Quelle: '+esc(info.author)+' · Start ab passendem Kapitel</p><a href="'+url+'" target="_blank" rel="noopener noreferrer">Auf YouTube öffnen ↗</a></div>':
 '<p class="muted">Für dieses Spezialthema gibt es noch keinen einzeln geprüften Videoguide. Öffne eine gezielte Suche, wähle ein Tutorial und arbeite das passende Thema durch.</p>'+
 '<div class="video-frame"><div class="video-placeholder"><div class="play">▷</div><strong>Ein Tutorial zum Thema finden</strong>'+
 '<small>'+esc(c.name)+' · '+esc(l.title)+'</small><a href="'+search+'" class="btn primary" target="_blank" rel="noopener noreferrer">Passendes Lernvideo suchen ↗</a></div></div>')+
 '<label class="video-check"><input type="checkbox" id="video-check" '+(s.videoChecked?'checked':'')+'><span>Ich habe die passende Erklärung angesehen und verstanden.'+
 '<small class="micro" style="display:block">Deine eigene Bestätigung – die Videowiedergabe lässt sich nicht verlässlich messen.</small></span></label></section>'+
 '<section class="step-box"><span class="eyebrow">SCHRITT 03 · SELBST AUSPROBIEREN</span><h2>'+(isBlender?'Dein Arbeitsschritt.':'Schreib selbst etwas Code.')+'</h2>'+
 '<p>'+esc(p.task||'Setze die Erklärung eigenständig in einem Beispiel um.')+'</p>'+
 '<div class="practice-workspace'+(isPracticeDone?' is-complete':'')+'" id="practice-workspace"><div class="practice-title"><strong>'+(isBlender?'Deine Umsetzung':'Dein Code-Entwurf')+'</strong>'+
 '<span class="practice-status" id="practice-status">'+(isPracticeDone?'✓ Praxis erledigt':'Noch nicht abgeschlossen')+'</span></div>'+
 '<label class="micro" for="practice-input">'+(isBlender?'Beschreibe, was du in Blender umgesetzt hast:':'Schreibe hier deinen eigenen Lösungsansatz:')+'</label>'+
 '<textarea class="exercise-textarea" id="practice-input" spellcheck="false" rows="7" maxlength="10000" placeholder="'+(isBlender?'Welche Schritte hast du ausgeführt und was ist dabei entstanden?':'// Deine eigene Lösung – erst überlegen, dann schreiben')+'">'+d+'</textarea>'+
 '<p class="practice-tip">Dein Entwurf wird nur auf diesem Gerät gespeichert. Die Academy führt ihn nicht automatisch aus. Teste '+(isBlender?'deine Szene in Blender.':'deinen Code in deiner eigenen Entwicklungsumgebung.')+'</p>'+
 (p.hint?'<details style="margin:15px 0 0"><summary class="micro" style="cursor:pointer;color:#c6a7ff">Hinweis zur Aufgabe ansehen</summary><p class="micro">'+esc(p.hint)+'</p></details>':'')+
 '<button class="btn '+(isPracticeDone?'':'primary')+'" type="button" data-action="complete-practice" '+(isPracticeDone?'disabled':'')+'>'+(isPracticeDone?'✓ Praxisschritt gespeichert':'Praxis als erledigt markieren ✓')+'</button>'+
 '</div></section>'+
 '<section class="step-box" id="quiz-area"><span class="eyebrow">SCHRITT 04 · WISSENSTEST</span><h2>Wissen anwenden.</h2><p>'+esc(p.quiz||'Hast du das Thema verstanden?')+'</p>'+
 options.map((answer,i)=>'<button type="button" class="quiz-choice'+(s.choice===i?' selected':'')+'" data-answer="'+i+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(answer)+'</button>').join('')+
 '<p class="quiz-feedback micro" id="answer-result" aria-live="polite">'+(finished?'✓ Bereits abgeschlossen.':'Wähle die richtige Antwort. Danach kannst du die Lektion abschließen.')+'</p>'+
 '<button class="btn primary" id="mark-lesson" data-action="finish-lesson" type="button" disabled>'+(finished?'✓ Lektion abgeschlossen':'Lektion abschließen →')+'</button></section>'+
 '<div class="btn-row"><button class="btn" data-go="track/'+esc(l.course_id)+'">← Kursübersicht</button>'+
 (next?'<button class="btn" data-go="lesson/'+esc(next.id)+'">Nächste Lektion →</button>':'<button class="btn" data-go="exam/'+esc(l.course_id)+'">Abschlussprüfung →</button>')+'</div></article>';
}
function updateLessonControls(){
 var id=parseRoute().id,l=s.lessons.find(x=>x.id===id);if(!l||!s.lesson)return;
 var correct=Number(s.lesson.payload?.correct)||0,finished=doneIds().has(id);
 var ready=s.videoChecked&&s.practiceChecked&&s.choice===correct;
 document.querySelectorAll('[data-answer]').forEach(b=>{
  var selected=Number(b.dataset.answer)===s.choice;
  b.classList.toggle('selected',selected);b.classList.toggle('good',selected&&s.choice===correct);
  b.classList.toggle('bad',selected&&s.choice!==correct);
 });
 var btn=$('#mark-lesson');if(btn)btn.disabled=finished||!ready;
 var status=$('#answer-result');
 if(status&&!finished)status.textContent=
  s.choice==null?'Wähle eine Antwort und löse die Schritte darüber.':
  s.choice!==correct?'Das ist noch nicht die richtige Antwort. Sieh dir die Erklärung erneut an.':
  !s.videoChecked?'Richtige Antwort ✓ · Sieh noch das Tutorial an und bestätige es.':
  !s.practiceChecked?'Richtige Antwort ✓ · Schließe noch deinen eigenen Praxisschritt ab.':
  '✓ Alle Schritte bearbeitet. Du kannst die Lektion abschließen.';
 var video=$('#video-check'),practice=$('#practice-workspace');
 if(video)video.checked=s.videoChecked;
 if(practice)practice.classList.toggle('is-complete',s.practiceChecked);
}
async function completePractice(){
 var id=parseRoute().id,box=$('#practice-input');if(!box||!s.lesson)return;
 var value=box.value.trim();
 if(value.length<15){notice('Schreibe zuerst eine eigene Lösung oder mindestens einen kurzen Bericht (15 Zeichen).');box.focus();return;}
 saveDraft(id,value);s.practiceChecked=true;
 if(!s.progress.practiced)s.progress.practiced=[];
 if(!s.progress.practiced.includes(id))s.progress.practiced.push(id);
 try{await saveProgress();}catch(e){s.practiceChecked=false;s.progress.practiced=s.progress.practiced.filter(x=>x!==id);notice('Praxis konnte nicht gespeichert werden: '+formatError(e));return;}
 var workspace=$('#practice-workspace'),status=$('#practice-status'),btn=$('[data-action="complete-practice"]');
 if(workspace)workspace.classList.add('is-complete');
 if(status)status.textContent='✓ Praxis erledigt';
 if(btn){btn.textContent='✓ Praxisschritt gespeichert';btn.disabled=true;}
 updateLessonControls();notice('Dein Praxisfortschritt wurde gespeichert.');
}
async function markLesson(){
 var id=parseRoute().id,l=s.lessons.find(x=>x.id===id);
 if(!l||!s.lesson||!allowed(l))return;
 if(!s.videoChecked||!s.practiceChecked||s.choice!==Number(s.lesson.payload.correct||0)){
  notice('Bitte Video, praktische Übung und Quiz abschließen.');return;
 }
 if(!s.progress.done.includes(id))s.progress.done.push(id);
 if(!s.progress.watched.includes(id))s.progress.watched.push(id);
 try{await saveProgress();notice('Lektion abgeschlossen! +30 XP ✓');render();}
 catch(e){s.progress.done=s.progress.done.filter(x=>x!==id);notice('Speichern fehlgeschlagen: '+formatError(e));}
}


function euro(cents){return (Number(cents||0)/100).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
async function fetchVouchers(){
 if(s.profile?.role!=='admin')return;
 const r=await api.rpc('academy_voucher_list');
 if(r.error)throw r.error;
 s.vouchers=Array.isArray(r.data)?r.data:[];
}
function dailyStrip(){
 const cap=Number(s.daily?.daily_limit??(s.tier==='ultimate'?-1:s.tier==='pro'?6:3)),used=Number(s.daily?.used_today)||0;
 return '<div class="daily-strip"><span class="daily-symbol">◷</span><div><strong>'+
 (cap<0?'Unbegrenztes Lernen':'Heute: '+Math.max(0,cap-used)+' von '+cap+' Stationen übrig')+'</strong>'+
 '<small>'+(cap<0?'Alle Lernstationen ohne tägliche Begrenzung.':'Einmal geöffnete Stationen bleiben jederzeit abrufbar.')+'</small></div></div>';
}

function membershipHelp(){
 return '<section class="membership-help-callout"><div class="membership-help-spark">✦</div><span class="eyebrow">LIVERYLAB STUDIOS · BETA</span><h2>Plus oder Pro testen?</h2>'+
 '<p>Schreib <strong>NyxAtheris</strong> eine Discord-DM oder eröffne ein <strong>Ticket</strong> auf dem LiveryLab-Server. Erwähne dort <strong>@nyxatheris</strong> und teile mit, warum du Zugang möchtest. Wir schalten Testmitglieder manuell frei.</p>'+
 '<div class="membership-help-actions"><a class="btn primary" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Ticket auf Discord eröffnen ↗</a>'+
 '<button class="btn" data-go="plans">Mitgliedschaften vergleichen →</button></div></section>';
}

function plansPage(){
 const own=s.tier,allCourseCount=s.courses.length||52;
 function tile(tier,name,cap,stations,price,desc,benefits){
  const current=own===tier,included=(tier==='free'&&own!=='free')||(tier==='pro'&&own==='ultimate');
  return '<article class="membership-card tier-'+tier+(current?' current':'')+'">'+
   '<div class="membership-top"><div><span class="eyebrow">'+(tier==='free'?'KOSTENLOS':tier==='pro'?'MEHR LERNEN':'VOLLER ZUGRIFF')+'</span><h2>'+name+'</h2></div>'+
   '<span class="membership-price">'+price+'<small>/Monat</small></span></div>'+
   '<div class="membership-limits"><span>▦ '+cap+' Kurse</span><span>◷ '+stations+'</span></div>'+
   '<p class="membership-desc">'+desc+'</p>'+
   '<ul class="membership-benefits">'+benefits.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+
   (current?'<div class="membership-own">✓ Dein aktueller Tarif</div>':
   included?'<div class="membership-included">✓ In deinem Tarif enthalten</div>':
   '<a class="btn primary block" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">'+name+' anfragen →</a>')+
   '</article>';
 }
 const quote=s.discount;
 return pageHeading('MITGLIEDSCHAFT','Dein <span class="gradient">Lernzugang.</span>',
 'Wähle deinen Lernumfang. Free: 2 Prüfungen pro Tag, Plus: 4 Prüfungen und Script, Pro/Ultimate: alles unbegrenzt.')+
 dailyStrip()+
 '<div class="membership-stack">'+
 tile('free','Free','10','3 pro Tag','0,00 €','Die wichtigsten Grundlagen für deinen Anfang.',[
  '10 Grundlagenkurse und 3 neue Lektionen pro Tag','2 Kursprüfungen pro Tag','Script-Werkstatt und Referenzen gesperrt'])+
 tile('pro','Plus','25','6 pro Tag','1,99 €','Mehr Themen und mehr Übungszeit.',[
  '25 Lernpfade, 6 Lektionen pro Tag','4 Prüfungen pro Tag','Script-Werkstatt freigeschaltet · Referenzen gesperrt'])+
 tile('ultimate','Pro','Alle '+allCourseCount,'Unbegrenzt','3,99 €','Der gesamte Kurskatalog.',[
  'Alle Kurse, Lektionen und Prüfungen unbegrenzt','Script-Werkstatt + vollständige Code-Referenzen','Sämtliche Lernfunktionen ohne Tageslimit'])+
 '</div>'+
 '<section class="voucher-panel"><div class="voucher-head"><div><span class="eyebrow">[ % ] GUTSCHEIN</span><h2>Code einlösen</h2></div><span class="voucher-icon">◇</span></div>'+
 '<p>Rabatt erhalten oder eine kostenlose Plus-/Pro-Mitgliedschaft freischalten.</p>'+
 '<form data-form="redeem-voucher" class="voucher-form"><label class="form-label" for="voucher-code">Dein Gutscheincode</label>'+
 '<div class="voucher-input-row"><input class="input" id="voucher-code" name="code" autocapitalize="characters" autocomplete="off" required maxlength="64" placeholder="LL-XXXXXXXXXXXX">'+
 '<button type="submit" class="btn primary">Einlösen →</button></div></form>'+
 (quote?'<div class="voucher-quote">✓ Dein reservierter Rabatt: <strong>'+Number(quote.percent)+' % auf '+(quote.tier==='pro'?'Plus':'Pro')+'</strong>'+
 '<div><s>'+euro(quote.original_cents)+'</s> <strong>'+euro(quote.final_cents)+'</strong> / Monat bei bestätigter Freischaltung</div>'+
 '<small>Für Zahlung und Aktivierung den LiveryLab-Support kontaktieren.</small></div>':'')+
 '<small>Rabattcodes sind Angebote, kein automatischer Kauf. Kostenpflichtige Mitgliedschaften werden derzeit vom Team nach Bestätigung aktiviert.</small></section>'+
 membershipHelp();
}
function examsPage(){
 const cap=Number(s.examStatus?.limit??examCap()),used=Number(s.examStatus?.used||0);
 const suitable=s.courses.filter(c=>{const ls=lessonsOf(c.id);return ls.length>0&&ls.every(l=>allowed(l));})
 .sort((a,b)=>(countDone(a.id)===lessonsOf(a.id).length?0:1)-(countDone(b.id)===lessonsOf(b.id).length?0:1)||a.name.localeCompare(b.name,'de'));
 return pageHeading('PRÜFUNGEN','Deine <span class="gradient">Kursprüfungen.</span>','Jede Prüfung gehört zu genau einem freigeschalteten Kurs. Schließe zuerst dessen Lektionen ab.')+
 '<div class="exam-quota"><strong>✦ '+(cap<0?'Unbegrenzt':Math.max(0,cap-used)+' von '+cap)+' Prüfungen heute übrig</strong><small>Free: 2 · Plus: 4 · Pro/Ultimate: unbegrenzt. Reset um Mitternacht (Berlin).</small><button class="btn small" data-go="plans">Tarife →</button></div>'+
 '<section class="section"><div class="section-heading"><div><span class="eyebrow">DEINE KURSE</span><h2>'+suitable.length+' passende Prüfungen</h2></div></div><div class="course-grid">'+suitable.map(c=>{
  const ls=lessonsOf(c.id),count=countDone(c.id),ready=count===ls.length,passed=!!s.progress.exams?.[c.id];
  return '<article class="course-card '+(passed?'is-complete':'')+'"><div class="course-head"><span class="course-icon">'+esc(courseAccent(c))+'</span><span class="chip '+(passed?'free':'plus')+'">'+(passed?'✓ Bestanden':ready?'Bereit':'Noch gesperrt')+'</span></div><span class="micro">'+esc(c.category)+'</span><h3>'+esc(c.name)+'</h3><p>'+count+' / '+ls.length+' Lektionen abgeschlossen</p><div class="progress"><span style="width:'+pct(count,ls.length)+'%"></span></div><button class="btn block" data-go="'+(ready?'exam/':'track/')+esc(c.id)+'">'+(ready?'Prüfung öffnen →':'Kurs fortsetzen →')+'</button></article>';
 }).join('')+'</div></section>';
}
async function loadExam(id){
 s.exam=null;s.examGate=null;
 const ls=lessonsOf(id);
 if(!ls.length||!ls.every(l=>allowed(l))){s.examGate={reason:'tier',error:'Diese Kursprüfung ist für deinen Tarif gesperrt.'};return;}
 if(ls.some(l=>!doneIds().has(l.id)))return;
 const r=await api.rpc('academy_exam_start',{p_course:id});
 if(r.error){s.examGate={reason:'error',error:formatError(r.error)};return;}
 if(!r.data?.ok){s.examGate=r.data||{reason:'error'};return;}
 const qs=(r.data.questions||[]).filter(x=>x.payload&&Array.isArray(x.payload.options)&&x.payload.options.length>1);
 s.examStatus={limit:r.data.limit,used:r.data.used,remaining:r.data.remaining};
 s.exam={items:qs,attemptId:r.data.attempt_id,at:0,answers:[],review:[],busy:false,result:null};
}
async function submitExamAnswer(answerIndex){
 const ex=s.exam,course=parseRoute().id;
 if(!ex||ex.busy||ex.at>=ex.items.length||!Number.isInteger(answerIndex))return;
 const q=ex.items[ex.at];if(answerIndex<0||answerIndex>=q.payload.options.length)return;
 ex.busy=true;ex.answers.push(answerIndex);ex.at++;
 if(ex.at>=ex.items.length){
  try{
   const r=await api.rpc('academy_exam_finish',{p_attempt:ex.attemptId,p_answers:ex.answers});
   if(r.error)throw r.error;if(!r.data?.ok)throw Error(r.data?.error||'Prüfung fehlgeschlagen');
   ex.result=r.data;ex.review=r.data.review||[];
   if(r.data.passed){s.progress.exams[course]={score:r.data.score,total:r.data.total,passed:true,at:new Date().toISOString()};
    try{await saveProgress()}catch(_){}
    try{const a=await api.rpc('academy_social_list');if(!a.error)s.social=a.data;}catch(_){}}
  }catch(e){ex.result={ok:false,error:formatError(e)};notice('Ergebnis: '+formatError(e))}
 }
 ex.busy=false;render();
}
function examPage(id){
 const course=courseOf(id);if(!course)return notFound();
 const all=lessonsOf(id),done=countDone(id),ready=done===all.length;
 const back='<a class="back" href="#exams">← Prüfungen</a>';
 if(!ready)return back+'<section class="exam-intro"><span class="eyebrow">[ ★ ] ABSCHLUSS</span>'+
 '<h1>Abschlussprüfung</h1><p class="lede">'+esc(course.name)+' · 20 Fragen maximal, bestanden ab 80 %.</p>'+
 '<div class="progress-pill">'+done+'/'+all.length+' Lektionen</div>'+
 '<div class="project-message"><strong>Dein Lernpfad ist noch nicht vollständig.</strong>'+
 '<p>Schließe zuerst alle '+all.length+' Lektionen ab, um die Abschlussprüfung zu starten.</p></div>'+
 '<button class="btn primary" data-go="track/'+esc(id)+'">Zum Lernpfad →</button></section>';
 if(s.examGate)return back+'<section class="feature-gate"><span class="feature-lock">◷</span><h2>'+esc(s.examGate.error||'Prüfung gesperrt')+'</h2><p>'+esc(s.examGate.reason==='daily_limit'?'Morgen sind neue Prüfungen verfügbar.':'Bitte deinen Tarif oder den Kurs prüfen.')+'</p><button class="btn primary" data-go="plans">Tarife ansehen →</button></section>';
 if(!s.exam||!s.exam.items.length)return back+'<div class="empty">Keine Prüfungsfragen hinterlegt.</div>';
 const ex=s.exam,finished=ex.at>=ex.items.length;
 if(finished){
  const score=Number(ex.result?.score||0),pass=!!ex.result?.passed;
  return back+'<section class="exam-result"><div class="award">'+(pass?'🏆':'◈')+'</div>'+
  '<span class="eyebrow">PRÜFUNG · '+esc(course.name)+'</span><h1>'+score+' von '+ex.items.length+' richtig</h1>'+
  '<p class="lede">'+(ex.result?.ok===false?'Auswertung fehlgeschlagen: '+esc(ex.result.error||'Fehler'):pass?'Prüfung bestanden! Ein neuer Profiltitel wurde möglicherweise freigeschaltet.':'Nicht bestanden. Übe weiter und versuche es erneut.')+'</p>'+
  '<div class="exam-breakdown"><strong>Deine Auswertung</strong><p>'+Math.round(score/ex.items.length*100)+' % richtig · '+(ex.items.length-score)+' Fehler</p>'+ex.review.filter(x=>!x.correct).slice(0,8).map(x=>'<div class="exam-mistake"><span>'+esc(x.quiz)+'</span><small>Richtig: '+esc(x.expected)+'</small></div>').join('')+'</div><div class="actions-pair"><button class="btn" data-go="exams">← Prüfungen</button><button class="btn primary" data-action="restart-exam">Erneut versuchen →</button></div></section>';
 }
 const q=ex.items[ex.at],p=q.payload;
 return back+'<section class="exam-intro"><span class="eyebrow">[ ★ ] ABSCHLUSS</span><h1>Abschlussprüfung</h1>'+
 '<p class="lede">'+esc(course.name)+' · '+ex.items.length+' Fragen, bestanden ab '+Math.ceil(ex.items.length*.8)+' richtigen Antworten.</p>'+
 '<div class="progress-pill">Aufgabe '+(ex.at+1)+' von '+ex.items.length+'</div></section>'+
 '<div class="exam-question"><div class="exam-question-head"><span>AUFGABE '+(ex.at+1)+' / '+ex.items.length+'</span>'+
 '<div class="exam-dots" aria-label="Fortschritt">'+ex.items.map((_,i)=>'<i class="'+(i===ex.at?'current':i<ex.at?'done':'')+'"></i>').join('')+'</div></div>'+
 '<div class="exam-question-content"><h2>'+esc(p.quiz||p.title||'Wähle die richtige Antwort.')+'</h2>'+
 p.options.map((answer,i)=>'<button class="exam-option" type="button" data-exam-answer="'+i+'">'+
 '<span>'+String.fromCharCode(65+i)+'</span><span>'+esc(answer)+'</span></button>').join('')+'</div></div>';
}


const PROJECT_FILES=[
 {name:'fxmanifest.lua',ids:[5]},
 {name:'config.lua',ids:[0,1,3,12]},
 {name:'shared/utils.lua',ids:[2,4]},
 {name:'client/main.lua',ids:[6,7]},
 {name:'server/main.lua',ids:[8,9,10,11]}
];
function projectLessons(){return lessonsOf('fivem').slice(0,13)}
function projectUnblocked(file){
 const all=projectLessons(),done=doneIds();
 return file.ids.map(i=>all[i]).filter(l=>l&&done.has(l.id)&&allowed(l));
}
function projectTotal(){return projectLessons().filter(l=>doneIds().has(l.id)).length}
async function loadProjectTab(){
 if(!hasScript()){s.projectSource='';return;}
 const file=PROJECT_FILES[s.projectTab]||PROJECT_FILES[0],unlocked=projectUnblocked(file);
 s.projectSource='';
 if(!unlocked.length)return;
 s.projectLoading=true;
 try{
  const r=await api.rpc('academy_project_examples',{p_lessons:unlocked.map(l=>l.id)});
  if(r.error)throw r.error;
  s.projectSource=(r.data||[]).map(row=>{
   const lesson=unlocked.find(l=>l.id===row.lesson_id);
   return '-- '+(lesson?.title||'Lernbeispiel')+'\n'+(row.example||'-- Kein Codebeispiel vorhanden.');
  }).join('\n\n');
 }catch(e){notice('Projektansicht: '+formatError(e))}
 finally{s.projectLoading=false}
}
function scriptPage(){
 const all=projectLessons(),done=projectTotal(),file=PROJECT_FILES[s.projectTab]||PROJECT_FILES[0],
 unlocked=projectUnblocked(file),code=s.projectSource||'';
 return '<section class="track-top"><span class="eyebrow">[ ++ ] DEIN PROJEKT</span>'+
 '<h1>sh_shop</h1><p class="lede">Ein FiveM-Lernprojekt, das mit deinen Lektionen wächst. Abgeschlossene Abschnitte schalten passende Codebeispiele frei.</p>'+
 '<span class="progress-pill">'+done+'/'+all.length+' Teile freigeschaltet</span></section>'+
 '<div class="file-tree"><div class="file-root">resources/[scripts]/<strong>sh_shop/</strong></div>'+
 PROJECT_FILES.map((f,i)=>'<button type="button" class="tree-file'+(s.projectTab===i?' selected':'')+'" data-project-tab="'+i+'">'+
 '<span class="tree-branch">├─</span><span>'+esc(f.name)+'</span><span class="tree-count">'+projectUnblocked(f).length+'/'+f.ids.filter(k=>all[k]).length+'</span></button>').join('')+'</div>'+
 '<div class="file-tabs" role="tablist" aria-label="Projektdateien">'+PROJECT_FILES.map((f,i)=>
 '<button type="button" role="tab" aria-selected="'+(s.projectTab===i)+'" class="file-tab'+(i===s.projectTab?' active':'')+'" data-project-tab="'+i+'">'+esc(f.name)+'</button>').join('')+'</div>'+
 '<div class="file-preview"><div class="file-preview-head"><span>'+esc(file.name)+'</span>'+
 (unlocked.length?'<button class="btn small" type="button" data-action="copy-project">Kopieren</button>':'<span class="lock-mini">🔒 Gesperrt</span>')+'</div>'+
 '<pre class="file-code"><code>'+(unlocked.length?esc(code||'-- Codebeispiele werden geladen …'):
 '-- 🔒 Zu diesem Teil fehlen noch bestandene Lektionen.\n-- Bearbeite die passenden Kapitel, um ihn freizuschalten.')+'</code></pre></div>'+
 '<div class="project-message"><strong>'+(unlocked.length?'Lernbeispiel freigeschaltet.':'Teile gesperrt.')+'</strong>'+
 '<p>'+(unlocked.length?'Die Beispiele sind zum Verstehen gedacht, nicht als fertiges Produktiv-Script.':
 'Schließe die zugehörigen Lektionen ab, um die Codebeispiele zu erhalten.')+'</p></div>'+
 '<div class="actions-pair"><button class="btn" data-go="home">← Übersicht</button>'+
 '<button class="btn primary" data-go="track/fivem">FiveM-Lernpfad →</button></div>';
}

function referenceLibrary(){
 return s.referenceData||{
  lua:{name:'Lua',url:'https://www.lua.org/manual/5.4/',
  groups:{'Grundlagen':[['local x = 1','Lokale Variable'],['print(x)','Wert ausgeben'],['if x > 1 then ... end','Bedingung']]}}
 };
}
function referenceResults(){
 const lib=referenceLibrary(),entry=lib[s.refLang]||lib.lua||Object.values(lib)[0];
 if(!entry)return {html:'<div class="empty">Keine Referenzen vorhanden.</div>',count:0};
 const query=String(s.refSearch||'').toLocaleLowerCase('de-DE').trim();
 let hits=0;
 const groups=Object.entries(entry.groups||{}).filter(([name])=>s.refGroup==='Alle'||s.refGroup===name);
 const html=groups.map(([name,items])=>{
  const matching=items.filter(row=>!query||[name,...row].some(v=>String(v).toLocaleLowerCase('de-DE').includes(query)));
  hits+=matching.length;
  if(!matching.length)return '';
  return '<section class="reference-section"><div class="ref-section-head"><h2>'+esc(name)+'</h2>'+
   '<span class="ref-result-count">'+matching.length+' Einträge</span></div>'+
   '<div class="reference-block"><div class="reference-head">SYNTAX / FUNKTION <span>ERKLÄRUNG</span></div>'+
   matching.map(([code,meaning])=>'<div class="reference-row"><code>'+esc(code)+'</code>'+
    '<span>'+esc(meaning)+'</span><button type="button" class="ref-copy" data-ref-copy="'+esc(code)+'" aria-label="Code kopieren: '+esc(meaning)+'" title="Kopieren">⧉</button></div>').join('')+
   '</div></section>';
 }).join('');
 return {html:html||'<div class="empty"><h3>Keine Treffer</h3><p>Versuche einen anderen Suchbegriff oder eine andere Kategorie.</p></div>',count:hits};
}
function referencePage(){
 if(!fullAccess())return paywall('Code-Referenzen','Pro / Ultimate','Die Referenzbibliothek gehört zum höchsten Tarif.');
 const lib=referenceLibrary(),entry=lib[s.refLang]||lib.lua||Object.values(lib)[0];
 const langs=Object.keys(lib),groups=Object.keys(entry?.groups||{}),allCount=Object.values(lib).reduce((sum,v)=>sum+Object.values(v.groups||{}).reduce((a,arr)=>a+arr.length,0),0);
 const results=referenceResults();
 return '<section class="track-top"><span class="eyebrow">[ ≡ ] PROGRAMMIER-REFERENZ</span>'+
 '<h1>Dein <em>Spickzettel.</em></h1>'+
 '<p class="lede">Alle wichtigen Grundlagen, Funktionen, Befehle und praktische Beispiele, nach Programmiersprache sortiert. Die komplette Sprachreferenz findest du zusätzlich in der offiziellen Dokumentation.</p>'+
 '<div class="ref-overview"><span>⌘ '+langs.length+' Sprachen & Tools</span><span>▦ '+allCount+' Referenzeinträge</span></div></section>'+
 '<section class="reference-picker" aria-label="Programmiersprache wählen">'+
 '<div class="form-row"><div class="form-group"><label class="form-label" for="reference-language">Programmiersprache auswählen</label>'+
 '<select id="reference-language" class="select" aria-label="Programmiersprache auswählen">'+
 langs.map(k=>'<option value="'+esc(k)+'" '+(k===s.refLang?'selected':'')+'>'+esc(lib[k].name)+'</option>').join('')+'</select></div>'+
 '<div class="form-group"><label class="form-label" for="reference-group">Themengebiet</label><select id="reference-group" class="select">'+
 '<option value="Alle">Alle Themen</option>'+groups.map(k=>'<option value="'+esc(k)+'" '+(k===s.refGroup?'selected':'')+'>'+esc(k)+'</option>').join('')+'</select></div></div>'+
 '<label class="form-label" for="reference-search">Funktionen, Befehle oder Begriffe suchen</label>'+
 '<div class="ref-search-row"><input class="input" id="reference-search" type="search" autocapitalize="off" spellcheck="false" placeholder="z. B. print, loops, array, event ..." value="'+esc(s.refSearch)+'">'+
 '<span id="reference-count" class="progress-pill">'+results.count+' Treffer</span></div>'+
 '<a class="ref-official" href="'+safeLink(entry?.url||'https://docs.fivem.net/')+'" target="_blank" rel="noopener noreferrer">Vollständige offizielle '+esc(entry?.name||'')+'-Dokumentation öffnen ↗</a></section>'+
 '<div id="reference-results">'+results.html+'</div>'+
 '<section class="section panel"><span class="eyebrow">LERNTIPP</span><h3>Selbst ausprobieren</h3>'+
 '<p>Nutze die Referenz als Nachschlagewerk und wende die Beispiele direkt in deinen Kursaufgaben an. Verwende bei echten Projekten immer auch die offizielle Dokumentation zur jeweiligen Version.</p>'+
 '<button type="button" class="btn primary" data-go="courses">Zu den Lernpfaden →</button></section>';
}


const AVATAR_STYLES=[['violet','Violett'],['blue','Oceanblau'],['emerald','Emerald'],['rose','Rose'],['amber','Gold'],['mono','Monochrom']];
const BANNER_STYLES=[['nebula','Nebula'],['aurora','Aurora'],['sunset','Sunset'],['ocean','Ozean'],['pixel','Pixel'],['midnight','Midnight'],['galaxy','Galaxy'],['cyber','Cyberpunk'],['cherry','Cherry'],['lavender','Lavender'],['carbon','Carbon'],['neon','Neon']];
const NAME_STYLES=[['classic','Klassisch'],['gradient','Gradient'],['glow','Glow'],['mono','Mono'],['bold','Bold']];
function selectStyle(name,values,current){
 return '<div class="style-picker" role="group" aria-label="'+esc(name)+'">'+values.map(([value,label])=>
 '<label class="style-choice '+esc(name)+'-option '+esc(value)+'"><input type="radio" name="'+esc(name)+'" value="'+esc(value)+'" '+(value===current?'checked':'')+'><span>'+esc(label)+'</span></label>').join('')+'</div>';
}
function avatarFor(card,name,size){
 const initial=esc(String(name||'D').slice(0,1).toUpperCase()),uid=card?.id||s.user?.id,
 image=socialImageUrl(uid,'avatar');
 return '<span class="social-avatar avatar-'+esc(card?.avatar_style||'violet')+' '+(size||'')+'">'+initial+
 (image?'<img class="social-avatar-image" src="'+safeLink(image)+'" alt="" loading="lazy">':'')+'</span>';
}
function socialBanner(card,name,editable){
 const style=card?.banner_style||'nebula',title=card?.title||'Developer',username=card?.username||s.profile?.username||'developer';
 const banner=socialImageUrl(card?.id||s.user?.id,'banner');
 return '<div class="social-banner banner-'+esc(style)+'">'+(banner?'<img class="social-banner-photo" src="'+safeLink(banner)+'" alt="" loading="lazy">':'')+'<span class="banner-glints">✦ ✧ ✦</span>'+
 '<div class="social-banner-identity">'+avatarFor(card,name,'large')+
 '<div><span class="social-title">✦ '+esc(title)+'</span><h2 class="social-name name-'+esc(card?.name_style||'classic')+'">'+esc(name||'Developer')+'</h2><span class="social-handle">@'+esc(username)+'</span></div></div>'+
 '<span class="social-banner-label">LIVERYLAB STUDIOS · DEVELOPER ACADEMY</span></div>';
}
function socialProfilePanel(){
 const card=s.social?.profile||{username:s.profile?.username,display_name:s.profile?.display_name},
 name=card.display_name||s.profile?.display_name||'Developer',
 titles=(s.social?.titles||['Developer']).filter(Boolean);
 return '<section class="section social-profile-panel"><span class="eyebrow">[ ✦ ] DEIN ÖFFENTLICHES AKADEMIE-PROFIL</span>'+
 socialBanner(card,name,true)+
 '<div class="social-profile-bottom"><p class="social-bio">'+esc(card.bio||'Noch keine Bio. Erzähl anderen Developern etwas über dich!')+'</p>'+
 '<div class="social-profile-metrics"><span>✦ '+Number(card.awards||0)+' bestandene Prüfungsreihen</span><span>▦ '+Number(card.lessons||0)+' abgeschlossene Lektionen</span><span>♡ '+(s.social?.friends?.length||0)+' Freunde</span></div></div>'+
 '<div class="panel social-customizer"><h3><icon>✎</icon> Profil gestalten</h3><p class="micro">Wähle dein Banner, dein Avatar-Design, deinen Namen-Stil und deine freigeschalteten Titel.</p>'+
 '<form data-form="social-profile"><div class="form-group"><label class="form-label">Über mich · Bio (max. 260 Zeichen)</label>'+
 '<textarea class="input social-bio-input" name="bio" maxlength="260" rows="3" placeholder="Ich entwickle gerade mein erstes FiveM-Script …">'+esc(card.bio||'')+'</textarea></div>'+
 '<div class="social-custom-label">Profilbild hochladen oder Avatar-Farbe wählen</div><div class="social-upload-row"><label class="btn small social-file-picker">Bild hochladen<input type="file" data-social-upload="avatar" accept="image/*,.heic,.heif,.avif" hidden></label><button class="btn small" type="button" data-social-remove="avatar" '+(!s.socialMedia?.[s.user?.id]?.avatar?'disabled':'')+'>Profilbild entfernen</button></div>'+selectStyle('avatar',AVATAR_STYLES,card.avatar_style||'violet')+
 '<div class="social-custom-label">Banner-Bild und Hintergrund</div><div class="social-upload-row"><label class="btn small social-file-picker">Banner hochladen<input type="file" data-social-upload="banner" accept="image/*,.heic,.heif,.avif" hidden></label><button class="btn small" type="button" data-social-remove="banner" '+(!s.socialMedia?.[s.user?.id]?.banner?'disabled':'')+'>Banner entfernen</button></div><p class="micro">JPG, PNG, WebP, GIF, AVIF, HEIC und weitere browserlesbare Bildformate bis 15 MB. Automatischer Zuschnitt und WebP-Umwandlung (GIFs als Standbild). Hochgeladene Bilder sind über ihre Bild-URL öffentlich sichtbar.</p>'+selectStyle('banner',BANNER_STYLES,card.banner_style||'nebula')+
 '<div class="social-custom-label">Namensstil</div>'+selectStyle('style',NAME_STYLES,card.name_style||'classic')+
 '<div class="form-group"><label class="form-label">Erfolgstitel auswählen</label><select class="select" name="title">'+titles.map(t=>'<option value="'+esc(t)+'" '+(card.title===t?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select></div>'+
 '<label class="settings-row social-privacy"><span><b>Fortschritt für Freunde sichtbar</b><small>Bestätigte Freunde sehen nur Lektionen und bestandene Prüfungen, niemals E-Mail oder Passwort.</small></span>'+
 '<input type="checkbox" name="show_progress" '+(card.show_progress!==false?'checked':'')+'></label>'+
 '<button class="btn primary" type="submit">Änderungen speichern ✓</button></form></div></section>';
}
function friendsPage(){
 const social=s.social||{},friends=social.friends||[],pending=social.requests||[];
 const incoming=pending.filter(v=>v.direction==='incoming'),outgoing=pending.filter(v=>v.direction==='outgoing');
 const tab=['friends','requests','search'].includes(s.friendTab)?s.friendTab:'friends';
 const card=(user,actions)=>{
  const banner=esc(user.banner_style||'nebula');
  return '<article class="friend-profile-card"><div class="friend-card-banner banner-'+banner+'"><span>✦ LIVERYLAB ACADEMY</span></div>'+
  '<div class="friend-card-body"><div class="friend-card-top">'+avatarFor(user,user.display_name||user.username,'')+
  '<div class="friend-identity"><strong class="name-'+esc(user.name_style||'classic')+'">'+esc(user.display_name||user.username||'Developer')+'</strong>'+
  '<span>@'+esc(user.username||'')+'</span></div><span class="social-title">✦ '+esc(user.title||'Developer')+'</span></div>'+
  (user.bio?'<p class="friend-card-bio">'+esc(user.bio)+'</p>':'')+
  (user.lessons===null?'<div class="friend-card-privacy">🔒 Lernfortschritt privat</div>':
   user.lessons===undefined?'':'<div class="friend-card-progress"><div><strong>'+Number(user.lessons||0)+'</strong><small>Lektionen</small></div>'+
   '<div><strong>'+Number(user.awards||0)+'</strong><small>Bestandene Prüfungen</small></div>'+
   '<div><strong>'+(user.streak===null?'–':Number(user.streak||0))+'</strong><small>Login-Streak</small></div></div>')+
  '<div class="friend-actions">'+actions+'</div></div></article>';
 };
 let content='';
 if(tab==='friends'){
  content='<section class="friends-tab-content"><div class="section-heading"><div><span class="eyebrow">[ ♡ ] BESTÄTIGTE FREUNDE</span><h2>Deine Developer</h2>'+
  '<p>Nur bestätigte Freunde erscheinen hier. Sie bestimmen selbst, ob du ihren Fortschritt sehen darfst.</p></div></div>'+
  (friends.length?'<div class="friend-profile-grid">'+friends.map(u=>card(u,
  '<button type="button" class="btn small danger" data-friend-action="remove" data-friend-id="'+esc(u.id)+'">Freund entfernen</button>')).join('')+'</div>':
  '<div class="empty friend-empty"><div class="empty-icon">♡</div><h3>Noch keine Freunde</h3>'+
  '<p>Du kannst Freunde per Benutzername suchen und ihnen eine Anfrage senden.</p>'+
  '<button class="btn primary" type="button" data-friend-tab="search">Freund hinzufügen →</button></div>')+'</section>';
 }else if(tab==='requests'){
  content='<section class="friends-tab-content"><div class="section-heading"><div><span class="eyebrow">[ ! ] DEINE ANFRAGEN</span>'+
  '<h2>Freundschaftsanfragen</h2><p>Hier kannst du Anfragen annehmen, ablehnen oder zurückziehen.</p></div></div>'+
  (incoming.length?'<h3>Neue Anfragen · '+incoming.length+'</h3><div class="friend-profile-grid">'+incoming.map(u=>card(u,
  '<button class="btn primary small" type="button" data-friend-action="accept" data-friend-id="'+esc(u.id)+'">✓ Annehmen</button>'+
  '<button class="btn small" type="button" data-friend-action="decline" data-friend-id="'+esc(u.id)+'">Ablehnen</button>')).join('')+'</div>':'<div class="empty">Keine eingegangenen Anfragen.</div>')+
  (outgoing.length?'<h3 class="friends-sent-title">Versendete Anfragen · '+outgoing.length+'</h3><div class="friend-profile-grid">'+outgoing.map(u=>card(u,
  '<button class="btn small" type="button" data-friend-action="cancel" data-friend-id="'+esc(u.id)+'">Anfrage zurückziehen</button>')).join('')+'</div>':'')+'</section>';
 }else{
  content='<section class="panel friends-search-panel"><span class="eyebrow">[ + ] ENTDECKEN</span><h2>Freund hinzufügen</h2>'+
  '<p class="muted">Suche nach dem exakten Benutzernamen. Private Angaben wie die E-Mail-Adresse werden nicht gezeigt.</p>'+
  '<form data-form="friend-search"><label class="form-label" for="friend-query">Benutzername</label>'+
  '<div class="voucher-input-row"><input class="input" id="friend-query" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" maxlength="24" placeholder="z. B. nyxatheris" required>'+
  '<button class="btn primary" type="submit">Suchen →</button></div></form><div id="friend-search-result"></div></section>';
 }
 return pageHeading('LIVERYLAB COMMUNITY','Deine Developer-<span class="gradient">Freunde.</span>',
 'Gemeinsam programmieren und Fortschritte teilen – ohne persönliche Daten anderer Mitglieder offenzulegen.')+
 '<section class="friends-overview"><div class="friends-counter"><span>♡</span><strong>'+friends.length+'</strong><small>Freunde</small></div>'+
 '<div class="friends-counter"><span>✉</span><strong>'+incoming.length+'</strong><small>Neue Anfragen</small></div>'+
 '<div class="friends-counter"><span>✦</span><strong>'+outgoing.length+'</strong><small>Gesendet</small></div></section>'+
 '<div class="friend-navigation" role="tablist" aria-label="Freundeverwaltung">'+
 [['friends','♡','Freundesliste',friends.length],['requests','✉','Anfragen',incoming.length],['search','+','Freund hinzufügen',null]]
 .map(([id,symbol,name,count])=>'<button role="tab" type="button" data-friend-tab="'+id+'" aria-selected="'+(tab===id)+'" class="friend-nav-tab '+(tab===id?'active':'')+'">'+
 '<span>'+symbol+'</span> '+name+(count!==null?'<em>'+count+'</em>':'')+'</button>').join('')+'</div>'+
 content;
}

async function refreshSocial(){const [r,media]=await Promise.all([api.rpc('academy_social_list'),api.rpc('academy_social_media_list')]);if(r.error)throw r.error;s.social=r.data;if(!media.error)s.socialMedia=media.data||{};return r.data;}
function socialImageUrl(uid,kind){
 if(!uid||!s.socialMedia?.[uid]?.[kind])return '';
 return api.storage.from('academy-profile-images').getPublicUrl(uid+'/'+kind+'.webp').data.publicUrl+'?v='+encodeURIComponent(String(s.social?.profile?.lessons||0))+'&stamp='+encodeURIComponent(String(s.imageRevision||'1'));
}
async function uploadSocialImage(kind,file){
 if(!s.user||!['avatar','banner'].includes(kind))throw Error('Ungültiger Bildtyp.');
 const supported=/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tiff?)$/i.test(file?.name||'');
 if(!file||!file.size||file.size>15*1024*1024||file.type==='image/svg+xml'||
    /\.svgz?$/i.test(file.name||'')||(!file.type.startsWith('image/')&&!supported)){
  throw Error('Bitte ein Bild bis 15 MB hochladen. SVG-Dateien sind aus Sicherheitsgründen nicht erlaubt.');
 }
 let image=null,revoke=null;
 try{
  // Browsers support different camera formats (HEIC/HEIF, GIF, AVIF, TIFF).
  // Try native image decoders first; fall back to an image element on Safari.
  try{if(typeof createImageBitmap==='function')image=await createImageBitmap(file);}
  catch(_){image=null;}
  if(!image){
    const url=URL.createObjectURL(file);revoke=url;
    const element=new Image();
    await new Promise((resolve,reject)=>{
      element.onload=resolve;
      element.onerror=()=>reject(Error('Dieses Bildformat wird auf deinem Gerät nicht unterstützt.'));
      element.src=url;
      if(element.complete&&element.naturalWidth>0)resolve();
    });
    image=element;
  }
  const iw=image.width||image.naturalWidth,ih=image.height||image.naturalHeight;
  if(!iw||!ih||iw*ih>65000000)throw Error('Das Bild ist beschädigt oder hat eine zu hohe Auflösung.');
  const canvas=document.createElement('canvas'),w=kind==='avatar'?480:1200,h=kind==='avatar'?480:440;
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Bildbearbeitung wird in diesem Browser nicht unterstützt.');
  const scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale,sx=(iw-sw)/2,sy=(ih-sh)/2;
  ctx.drawImage(image,sx,sy,sw,sh,0,0,w,h);
  let blob=null;
  for(const quality of [.85,.7,.55,.35]){
    blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
    if(blob?.type==='image/webp'&&blob.size<=1048576)break;
  }
  if(!blob||blob.type!=='image/webp')throw Error('Dein Browser kann das Bild nicht nach WebP umwandeln.');
  if(blob.size>1048576)throw Error('Das Bild ist auch nach Komprimierung zu groß.');
  const path=s.user.id+'/'+kind+'.webp';
  const {error}=await api.storage.from('academy-profile-images').upload(path,blob,
   {upsert:true,contentType:'image/webp',cacheControl:'120'});
  if(error)throw error;
  s.imageRevision=Date.now();await refreshSocial();
 }catch(error){
  if(error instanceof Error&&(/Das Bild|Bildbearbeitung|Browser|SVG|zu groß|WebP|supabase/i).test(error.message))throw error;
  throw Error('Das Bildformat konnte auf diesem Gerät nicht geöffnet oder gespeichert werden. Versuche JPG, PNG oder WebP.');
 }finally{
  if(image&&typeof image.close==='function')image.close();
  if(revoke)URL.revokeObjectURL(revoke);
 }
}

async function removeSocialImage(kind){
 if(!s.user||!['avatar','banner'].includes(kind))return;
 const {error}=await api.storage.from('academy-profile-images').remove([s.user.id+'/'+kind+'.webp']);
 if(error)throw error;
 s.imageRevision=Date.now();await refreshSocial();
}


const ALL_ACHIEVEMENTS=[["Developer","⌘","Dein Start als Developer."],["First Steps","✦","Schließe deine erste Lektion ab."],["Code Explorer","◇","Schließe 10 Lektionen ab."],["Script Apprentice","⌁","Schließe 25 Lektionen ab."],["Senior Developer","◆","Schließe 50 Lektionen ab."],["Code Legend","♛","Schließe 100 Lektionen ab."],["Certified Learner","★","Bestehe eine Kursprüfung."],["Exam Specialist","✪","Bestehe 3 verschiedene Prüfungen."],["Exam Master","🏆","Bestehe 5 verschiedene Prüfungen."],["Master Developer","♕","Bestehe 8 verschiedene Prüfungen."],["Friendly Developer","♡","Finde deinen ersten Freund."],["Community Builder","♧","Finde 5 Freunde."],["Network Star","✧","Finde 15 Freunde."],["3-Day Starter","🔥","3 aktive Tage hintereinander."],["Week Warrior","⚡","7 aktive Tage hintereinander."],["Monthly Legend","☄","30 aktive Tage hintereinander."],["Century Streak","🌟","100 aktive Tage hintereinander."],["Lua Explorer","☾","Bestehe die Lua-Kursprüfung."],["Python Coder","◈","Bestehe die Python-Kursprüfung."],["JavaScript Wizard","⚙","Bestehe die JavaScript-Kursprüfung."],["FiveM Scripter","⬡","Bestehe die FiveM-Kursprüfung."],["Web Creator","▣","Bestehe die HTML-Kursprüfung."],["Blender Artist","✿","Bestehe die Blender-Kursprüfung."]];
function achievementGallery(){
 const unlocked=new Set(s.social?.titles||['Developer']);
 const order=ALL_ACHIEVEMENTS.slice().sort((a,b)=>Number(unlocked.has(b[0]))-Number(unlocked.has(a[0])));
 return '<section class="section achievements-section"><div class="section-heading"><div><span class="eyebrow">[ ★ ] AUSZEICHNUNGEN</span>'+
 '<h2>Erfolge & Titel</h2><p>Jeder Titel wird durch echte Lektionen, Kursprüfungen, Freunde oder Login-Streaks freigeschaltet.</p></div>'+
 '<span class="chip free">'+unlocked.size+' / '+ALL_ACHIEVEMENTS.length+' freigeschaltet</span></div>'+
 '<div class="achievement-grid">'+order.map(([title,icon,condition])=>{
  const ok=unlocked.has(title);
  return '<article class="achievement-card '+(ok?'unlocked':'locked')+'"><div class="achievement-medal">'+(ok?icon:'🔒')+'</div>'+
   '<div><strong>'+esc(title)+'</strong><p>'+esc(condition)+'</p></div>'+
   '<span class="achievement-state">'+(ok?'✓ Freigeschaltet':'Gesperrt')+'</span></article>';
 }).join('')+'</div></section>';
}
function profilePage(){
 const name=s.profile?.display_name||s.profile?.username||'Developer';
 const streak=Number(s.loginStreak?.current||0),best=Number(s.loginStreak?.best||0);
 return pageHeading('DEIN PROFIL','Deine Developer-<span class="gradient">Identität.</span>',
 'Passe Bio, Profilbild, Banner, Titel und Namen an. Passwort, Login und 2FA findest du bei den Einstellungen.')+
 socialProfilePanel()+
 '<section class="profile-quick-stats"><div class="profile-quick-tile"><span>🔥</span><strong>'+streak+'</strong><small>Login-Streak in Tagen</small></div>'+
 '<div class="profile-quick-tile"><span>🏅</span><strong>'+best+'</strong><small>Bisheriger Rekord</small></div>'+
 '<div class="profile-quick-tile"><span>✦</span><strong>'+((s.progress.done||[]).length*30)+'</strong><small>Erlernte XP</small></div></section>'+
 '<p class="micro streak-explanation">Deine Streak zählt nur, wenn du täglich den Claim bestätigst. Nach dem Einlösen wartest du mindestens 24 Stunden. Der Kalendertag richtet sich nach Europe/Berlin.</p>'+
 '<section class="panel profile-name-panel"><span class="eyebrow">[ ✎ ] DEIN ÖFFENTLICHER NAME</span><h3>Anzeigename ändern</h3>'+
 '<p class="micro">Dein sichtbarer Name. Dein Anmelde-Benutzername wird dadurch nicht geändert.</p>'+
 '<form data-form="profile" class="profile-display-form"><div class="form-group"><label class="form-label">Anzeigename</label>'+
 '<input class="input" name="display_name" value="'+esc(name)+'" minlength="2" maxlength="40" required></div>'+
 '<button class="btn primary" type="submit">Namen speichern</button></form></section>'+
 achievementGallery()+
 '<section class="profile-friends-link"><div><span class="eyebrow">[ ♡ ] NETZWERK</span><h3>Freunde & gemeinsame Fortschritte</h3>'+
 '<p>Sieh den freiwillig freigegebenen Lernfortschritt deiner bestätigten Freunde.</p></div>'+
 '<button class="btn primary" data-go="friends">Freundesliste öffnen →</button></section>';
}


const COLOR_THEMES=[["violet","Mystic Purple","linear-gradient(130deg,#1c1534,#8550c9)"],["midnight","Midnight","linear-gradient(130deg,#0a1325,#394b88)"],["ocean","Deep Ocean","linear-gradient(130deg,#0b2339,#2588bc)"],["forest","Emerald","linear-gradient(130deg,#09281e,#328775)"],["rose","Rose","linear-gradient(130deg,#361431,#c25b96)"],["ember","Amber Dusk","linear-gradient(130deg,#2c1815,#bb743a)"]];
const ACCENT_THEMES=[["lavender","Violett","#b18cff"],["sky","Blau","#64b6ff"],["mint","Mint","#65dbb2"],["pink","Rosa","#ef8fc5"],["amber","Gold","#f1be73"],["white","Neutral","#e5e3f0"]];
function appearanceChoices(items,current,attribute){
 return '<div class="appearance-picker">'+items.map(([value,label,color])=>
  '<button type="button" class="appearance-choice '+(value===current?'selected':'')+'" data-'+attribute+'="'+esc(value)+'" aria-pressed="'+(value===current)+'">'+
  '<span class="appearance-color" style="background:'+esc(color)+'"></span><strong>'+esc(label)+'</strong>'+
  (value===current?'<span class="appearance-check">✓</span>':'')+'</button>').join('')+'</div>';
}
function settingsPage(){
 const name=s.profile?.display_name||s.profile?.username||'Developer',username=s.profile?.username||'',email=s.user?.email||'';
 function toggle(key,title,description){
  return '<label class="settings-row appearance-toggle"><span class="setting-info"><span class="setting-icon">✦</span>'+
  '<span><b>'+title+'</b><p>'+description+'</p></span></span>'+
  '<input type="checkbox" class="settings-toggle" data-pref="'+key+'" '+(getPreference(key)?'checked':'')+' aria-label="'+title+'"></label>';
 }
 return pageHeading('EINSTELLUNGEN','Deine Academy. <span class="gradient">Dein Design.</span>',
 'Hier verwaltest du Farben, Darstellung, Anmeldedaten, Passwort, Authenticator und deinen Lernfortschritt.')+
 '<section class="setting-section appearance-section"><div class="section-heading"><div><span class="eyebrow">01 · PERSÖNLICHES DESIGN</span>'+
 '<h2>Farben & Hintergrund</h2><p>Die Änderungen werden sofort auf diesem Gerät gespeichert.</p></div></div>'+
 '<div class="settings-appearance-card"><h3>Hintergrund & Oberflächen</h3>'+
 appearanceChoices(COLOR_THEMES,getChoicePreference('theme','violet'),'theme-choice')+
 '<h3>Akzentfarbe</h3>'+appearanceChoices(ACCENT_THEMES,getChoicePreference('accent','lavender'),'accent-choice')+
 '<h3>Lesbarkeit & Layout</h3><div class="settings-list">'+
 toggle('compact','Kompakte Kurskarten','Mehr Lerninhalte auf dem Bildschirm anzeigen.')+
 toggle('largeTypography','Größere Schrift','Texte und Eingabefelder besser lesbar anzeigen.')+
 toggle('contrast','Erhöhter Kontrast','Text und Umrandungen deutlicher hervorheben.')+
 toggle('softCorners','Weiche Ecken','Buttons und Karten stärker abrunden.')+
 toggle('backgroundArt','Hintergrund-Effekte','Dezente Lichtverläufe für mehr Atmosphäre anzeigen.')+
 toggle('motion','Bewegungen reduzieren','Animationen und Übergänge verringern.')+
 '</div><button class="btn ghost settings-reset" data-action="reset-appearance">↺ Standarddarstellung wiederherstellen</button></div></section>'+
 '<section class="setting-section"><span class="eyebrow">02 · DEIN ACCOUNT</span><h2>Anmeldedaten</h2>'+
 '<div class="account-settings-grid"><div class="panel"><h3>Zugangsdaten</h3>'+
 '<div class="settings-row"><div><strong>E-Mail-Adresse</strong><p>'+esc(email)+'</p></div><span class="chip free">Hinterlegt</span></div>'+
 '<div class="settings-row"><div><strong>Benutzername</strong><p>'+esc(username||'Noch nicht festgelegt')+'</p></div><span class="chip '+(username?'free':'plus')+'">'+(username?'Aktiv':'Optional')+'</span></div>'+
 (!username?'<form data-form="set-username"><div class="form-group"><label class="form-label">Benutzernamen festlegen</label>'+
 '<input class="input" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" minlength="3" maxlength="24" required placeholder="developer123"></div>'+
 '<button class="btn small" type="submit">Benutzernamen aktivieren</button></form>':'<p class="micro">Anmeldung mit deiner E-Mail-Adresse oder deinem Benutzernamen möglich.</p>')+
 '<div class="settings-row"><div><strong>Öffentlicher Anzeigename</strong><p>'+esc(name)+'</p></div><button class="btn small" data-go="profile">Profil ändern</button></div></div>'+
 '<div class="panel"><h3>Passwort ändern</h3><p class="micro">Verwende mindestens 14 Zeichen und ein einzigartiges Passwort.</p>'+
 '<form data-form="password"><div class="form-group"><label class="form-label">Neues Passwort</label>'+
 '<input class="input" type="password" name="password" minlength="14" maxlength="256" autocomplete="new-password" required placeholder="Neues sicheres Passwort"></div>'+
 '<button class="btn primary" type="submit">Passwort aktualisieren</button></form></div></div></section>'+
 '<section class="setting-section"><span class="eyebrow">03 · ZWEITER FAKTOR</span><h2>Authenticator & 2FA</h2>'+
 '<div class="panel"><p class="micro">Verbinde eine Authenticator-App. Bei der nächsten Anmeldung musst du dann einen sechsstelligen Code eingeben.</p>'+
 '<div id="mfa-settings"></div></div></section>'+
 '<section class="setting-section"><span class="eyebrow">04 · LERNEN</span><h2>Fortschritt & Datenschutz</h2><div class="settings-list">'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">🔥</span><span><b>Login-Streak</b>'+
 '<p>'+Number(s.loginStreak?.current||0)+' Tage in Folge · Tageswechsel 00:00 Uhr deutscher Zeit</p></span></div>'+
 '<span class="chip free">'+Number(s.loginStreak?.best||0)+' Rekord</span></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">✓</span><span><b>Dein Lernfortschritt</b>'+
 '<p>'+s.progress.done.length+' Lektionen abgeschlossen.</p></span></div><button class="btn small" data-go="courses">Lernpfade</button></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">▷</span><span><b>Video-Datenschutz</b>'+
 '<p>Externe YouTube-Videos werden erst nach einem Klick geladen.</p></span></div><span class="chip free">Aktiv</span></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">↺</span><span><b>Fortschritt zurücksetzen</b>'+
 '<p>Setzt Lektionen und lokale Prüfungsanzeigen zurück. Auf dem Server vergebene Erfolge bleiben bestehen.</p></span></div>'+
 '<button class="btn small danger" data-action="reset-progress">Zurücksetzen</button></div></div></section>'+
 '<section class="setting-section"><span class="eyebrow">05 · SITZUNG & HILFE</span><h2>Support und Abmeldung</h2>'+
 '<div class="settings-list"><div class="settings-row"><div class="setting-info"><span class="setting-icon">↗</span>'+
 '<span><b>Abmelden</b><p>Beendet die aktuelle Sitzung auf diesem Gerät.</p></span></div><button class="btn small" data-action="logout">Abmelden</button></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">♡</span>'+
 '<span><b>Discord-Support</b><p>Schreibe NyxAtheris eine DM oder öffne ein Ticket und erwähne @nyxatheris.</p></span></div>'+
 '<a class="btn small discord" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Discord ↗</a></div></div></section>'+
 '<section class="section panel"><span class="eyebrow">LIVERYLAB STUDIOS</span><h3>Über die Academy</h3>'+
 '<p class="micro">Developer-Lernplattform mit Kursen, sicheren Accounts, Profilen, Freunden und Erfolgen. Version 18.</p>'+
 '<a href="./privacy.html">Datenschutzhinweise ansehen ↗</a><p class="smallprint" style="margin-top:16px">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></section>';
}

function voucherAdminSection(){
 const items=(s.vouchers||[]).filter(v=>!v.expires_at||new Date(v.expires_at).getTime()>Date.now());
 const active=items.filter(v=>v.active&&Number(v.uses)<Number(v.max_uses)).length;
 const rows=items.map(v=>{
  const used=Number(v.uses)||0,max=Math.max(1,Number(v.max_uses)||1),expires=new Date(v.expires_at);
  const expiry=Number.isFinite(expires.getTime())?new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric'}).format(expires):'–';
  return '<article class="voucher-manage-card '+(v.active?'':'is-inactive')+'"><div class="voucher-manage-top">'+
   '<div class="voucher-manage-code"><span class="voucher-code-icon">%</span><div><code>'+esc(v.code)+'</code>'+
   '<small>'+esc(v.kind==='gift'?'Gratis '+(v.tier==='pro'?'Plus':'Pro')+' · '+Number(v.days)+' Tage':Number(v.percent)+' % Rabatt für '+(v.tier==='pro'?'Plus':'Pro'))+'</small></div></div>'+
   '<span class="chip '+(v.active?'free':'plus')+'">'+(v.active?'Aktiv':'Pausiert')+'</span></div>'+
   '<div class="voucher-manage-meta"><span>◷ Bis '+esc(expiry)+'</span><span>◈ '+used+' / '+max+' eingelöst</span></div>'+
   '<div class="voucher-use-progress"><span style="width:'+Math.min(100,Math.round(used/max*100))+'%"></span></div>'+
   '<div class="voucher-manage-actions"><button type="button" class="btn small" data-copy-voucher="'+esc(v.code)+'">Kopieren</button>'+
   '<button type="button" class="btn small" data-voucher-toggle="'+esc(v.code)+'" data-voucher-enabled="'+(!v.active)+'">'+(v.active?'Pausieren':'Aktivieren')+'</button>'+
   '<button type="button" class="btn small danger" data-voucher-delete="'+esc(v.code)+'">Löschen</button></div></article>';
 }).join('');
 return '<section class="section admin-voucher"><div class="section-heading"><div><span class="eyebrow">ADMIN · GUTSCHEINMANAGER</span>'+
 '<h2>Gutscheine verwalten</h2><p>Erstelle eigene oder automatisch generierte Codes. Löschen und Ablaufen werden serverseitig durchgesetzt.</p></div></div>'+
 '<div class="voucher-overview"><div class="voucher-counter"><strong>'+active+'</strong><small>Aktive Gutscheine</small></div>'+
 '<div class="voucher-counter"><strong>'+items.length+'</strong><small>Sichtbare Codes</small></div><div class="voucher-counter"><strong>60 s</strong><small>Bereinigungsintervall</small></div></div>'+
 '<div class="panel voucher-maker"><span class="eyebrow">[ + ] NEU ERSTELLEN</span><h3>Neuer Gutschein</h3>'+
 '<form data-form="create-voucher"><div class="form-row"><div class="form-group"><label class="form-label">Gutscheintyp</label><select class="select" name="kind">'+
 '<option value="gift">Gratis-Mitgliedschaft</option><option value="discount">Rabattcode</option></select></div>'+
 '<div class="form-group"><label class="form-label">Mitgliedschaft</label><select class="select" name="tier">'+
 '<option value="pro">Plus · 1,99 € / Monat</option><option value="ultimate">Pro / Ultimate · 3,99 € / Monat</option></select></div>'+
 '<div class="form-group"><label class="form-label">Code erstellen</label><select class="select" name="code_mode">'+
 '<option value="random">Automatisch generieren</option><option value="custom">Eigenen Code bestimmen</option></select></div>'+
 '<div class="form-group voucher-custom-field" hidden><label class="form-label">Dein Wunschcode</label>'+
 '<input class="input" name="custom_code" maxlength="64" pattern="[A-Za-z0-9][A-Za-z0-9-]{2,63}" autocomplete="off" autocapitalize="characters" placeholder="NYX oder NyxAtheris5">'+
 '<small>3–64 Zeichen, Buchstaben, Zahlen und Bindestriche. Groß-/Kleinschreibung ist egal.</small></div>'+
 '<div class="form-group voucher-discount-field" hidden><label class="form-label">Rabatt</label>'+
 '<input class="input" type="number" name="percent" min="1" max="90" value="20"><small>Prozent auf den angefragten Tarif.</small></div>'+
 '<div class="form-group voucher-gift-field"><label class="form-label">Kostenlose Mitgliedschaft für</label><select class="select" name="membership_days">'+
 '<option value="7">7 Tage</option><option value="30" selected>30 Tage</option><option value="90">90 Tage</option><option value="365">365 Tage</option></select></div>'+
 '<div class="form-group"><label class="form-label">Maximale Einlösungen</label><input class="input" type="number" name="max_uses" min="1" max="1000" value="1" required></div>'+
 '<div class="form-group"><label class="form-label">Gültigkeit des Gutscheins</label><select class="select" name="valid_days">'+
 '<option value="1">1 Tag</option><option value="7">7 Tage</option><option value="30" selected>30 Tage</option><option value="90">90 Tage</option><option value="365">365 Tage</option></select></div></div>'+
 '<button class="btn primary block" type="submit">Gutschein sicher erstellen →</button></form><div id="created-voucher" class="voucher-created" hidden></div></div>'+
 '<div class="voucher-list-heading"><h3>Deine Gutscheine</h3><button class="btn small" type="button" data-action="refresh-admin">↻ Aktualisieren</button></div>'+
 '<div class="voucher-admin-list">'+(rows||'<div class="empty"><strong>Keine aktiven Gutscheine mehr.</strong><p>Erstelle oben einen neuen Code. Abgelaufene und gelöschte Gutscheine verschwinden automatisch aus der Liste.</p></div>')+'</div>'+
 '<p class="micro voucher-footnote">Bereits eingelöste Codes bleiben für Abrechnung und Nachweise intern archiviert. Ungenutzte Codes werden nach Ablauf automatisch gelöscht. Die automatische Bereinigung läuft etwa jede Minute.</p></section>';
}

function adminPage(){
 if(s.profile?.role!=='admin')return '<section class="locked-panel"><h2>Nur für Administratoren.</h2></section>';
 const people=s.members||[],pending=people.filter(u=>u.access_status==='pending'),rest=people.filter(u=>u.access_status!=='pending');
 const requests='<section class="section approval-section"><div class="section-heading"><div><span class="eyebrow">[ ! ] ANTRÄGE</span>'+
 '<h2>Registrierungsanfragen <span class="pending-bubble">'+pending.length+'</span></h2>'+
 '<p>Nur du kannst neue Konten genehmigen. Ohne deine Bestätigung bleiben die Kurse gesperrt.</p></div>'+
 '<button class="btn small" type="button" data-action="refresh-admin">Aktualisieren</button></div>'+
 (pending.length?'<div class="pending-list">'+pending.map(u=>
 '<article class="approval-card"><span class="approval-avatar">'+esc((u.username||u.email||'U').slice(0,1).toUpperCase())+'</span>'+
 '<div class="approval-info"><strong>'+esc(u.username||'Neuer Developer')+'</strong><small>'+esc(u.email||'')+'</small>'+
 '<span class="chip '+(u.email_confirmed?'free':'plus')+'">'+(u.email_confirmed?'✓ E-Mail bestätigt':u.email_review_required?'Kontakt-E-Mail noch nicht geprüft':'E-Mail noch unbestätigt')+'</span></div>'+
 '<div class="approval-actions"><button class="btn primary small" data-active-user="'+esc(u.id)+'" data-active-value="true" data-email-review="'+(u.email_review_required?'true':'false')+'" '+(!u.email_confirmed&&!u.email_review_required?'disabled title="E-Mail-Bestätigung fehlt"':'')+'>'+(u.email_review_required?'✓ Nach Prüfung freigeben':'✓ Genehmigen')+'</button>'+
 '<button class="btn small danger" data-active-user="'+esc(u.id)+'" data-active-value="false">Ablehnen</button></div></article>').join('')+'</div>':
 '<div class="empty approval-empty"><strong>Keine offenen Anfragen</strong><p>Neue Registrierungen werden hier angezeigt.</p></div>')+'</section>';
 const status=u=>u.access_status==='blocked'?'<span class="chip pro">⛔ Gesperrt</span>':
 u.access_status==='pending'?'<span class="chip plus">Wartet</span>':'<span class="chip free">✓ Aktiv</span>';
 const cards=rest.map(u=>{
  const owner=u.role==='admin',tier=s.memberPlans[u.id]||'free';
  return '<article class="member-card"><div class="member-header">'+
  '<div class="member-avatar">'+esc((u.username||u.email||'?').slice(0,1).toUpperCase())+'</div>'+
  '<div class="member-identity"><strong>'+esc(u.username||u.email||'Mitglied')+'</strong>'+
  '<small>'+esc(u.email||'')+'</small></div>'+status(u)+'</div>'+
  '<div class="member-management"><div><label class="form-label">Mitgliedschaft</label>'+
   (owner?'<span class="member-admin-tier">Administrator · Vollzugriff</span>':
   '<select class="select" data-admin-tier="'+esc(u.id)+'" aria-label="Mitgliedschaft ändern für '+esc(u.username||u.email||'Mitglied')+'">'+
   '<option value="free" '+(tier==='free'?'selected':'')+'>Free · 3/Tag</option>'+
   '<option value="pro" '+(tier==='pro'?'selected':'')+'>Plus · 6/Tag</option>'+
   '<option value="ultimate" '+(tier==='ultimate'?'selected':'')+'>Pro/Ultimate · Unbegrenzt</option></select>')+
   '</div><div class="member-actions">'+
   '<button class="btn small" data-reset-user="'+esc(u.id)+'" '+(owner?'disabled':'')+'>Passwort zurücksetzen</button>'+
   '<button class="btn small '+(u.active?'danger':'primary')+'" data-active-user="'+esc(u.id)+'" data-active-value="'+(!u.active)+'" '+(owner?'disabled':'')+'>'+
   (u.active?'Zugriff sperren':'Zugriff erlauben')+'</button>'+
   '<button class="btn small danger" data-delete-user="'+esc(u.id)+'" '+(owner?'disabled':'')+'>Löschen</button></div>'+(s.isOwner&&!u.is_owner?'<div class="admin-role-select"><label class="form-label">Teamrolle</label><select class="select" data-admin-role="'+esc(u.id)+'" aria-label="Teamrolle von '+esc(u.username||'')+'"><option value="student" '+(u.role==='student'?'selected':'')+'>Mitglied</option><option value="admin" '+(u.role==='admin'?'selected':'')+'>Administrator · Team verwalten</option></select></div>':'')+'</div></article>';
 }).join('');
 return pageHeading('ADMINISTRATION','Dein <span class="gradient">Team.</span>',
 'Registrierungen prüfen, Zugänge sperren oder wieder freigeben und Mitgliedschaften direkt ändern.')+
 requests+
 '<section class="section"><div class="section-heading"><div><span class="eyebrow">[ 02 ] MITGLIEDER</span>'+
 '<h2>Deine Teamkonten</h2><p>Tarifänderungen werden über den geschützten Administrationsserver gespeichert. Administratoren haben immer Vollzugriff.</p></div></div>'+
 '<div class="member-list">'+(cards||'<div class="empty">Noch keine aktiven Mitglieder.</div>')+'</div>'+
 '<div class="admin-pagination"><button class="btn small" data-action="admin-prev" '+(s.adminPage===1?'disabled':'')+'>← Vorherige</button>'+
 '<span>Seite '+s.adminPage+'</span><button class="btn small" data-action="admin-next" '+(people.length<100?'disabled':'')+'>Nächste →</button></div></section>'+
 '<section class="section"><details class="panel admin-create"><summary><strong>+ Manuell ein Teamkonto erstellen</strong></summary>'+
 '<p>Optional: Erstelle selbst ein Konto. Teamkonten werden direkt freigegeben und müssen ihr vorläufiges Passwort ändern.</p>'+
 '<form data-form="create-email"><h3>Mit E-Mail-Adresse</h3><div class="form-row">'+
 '<div class="form-group"><label class="form-label">E-Mail-Adresse</label><input class="input" type="email" name="email" required placeholder="name@beispiel.de"></div>'+
 '<div class="form-group"><label class="form-label">Anzeigename</label><input class="input" name="display_name" maxlength="40" placeholder="Optional"></div>'+
 '<div class="form-group"><label class="form-label">Vorläufiges Passwort</label><input class="input" type="password" name="password" minlength="14" required autocomplete="new-password"></div>'+
 '<div class="form-group"><label class="form-label">Tarif</label><select class="select" name="tier"><option value="free">Free</option><option value="pro">Plus</option><option value="ultimate">Pro/Ultimate</option></select></div></div>'+
 '<button class="btn primary" type="submit">Teamkonto mit E-Mail erstellen →</button></form>'+
 '<div class="divider-form"></div><form data-form="create-user"><h3>Mit Benutzername</h3><div class="form-row">'+
 '<div class="form-group"><label class="form-label">Benutzername</label><input class="input" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" required maxlength="24"></div>'+
 '<div class="form-group"><label class="form-label">Vorläufiges Passwort</label><input class="input" type="password" name="password" minlength="14" required autocomplete="new-password"></div>'+
 '<div class="form-group"><label class="form-label">Tarif</label><select class="select" name="tier"><option value="free">Free</option><option value="pro">Plus</option><option value="ultimate">Pro/Ultimate</option></select></div></div>'+
 '<button class="btn primary" type="submit">Benutzerkonto erstellen →</button></form></details></section>'+
 voucherAdminSection();
}
async function fetchMembers(){
 if(s.profile?.role!=='admin')return;
 var data=await adminCall({action:'list',page:s.adminPage});s.members=data.users||[];s.isOwner=!!data.isOwner;
 var tier=await api.from('academy_plans').select('user_id,tier');
 if(tier.error)throw tier.error;s.memberPlans={};(tier.data||[]).forEach(function(r){s.memberPlans[r.user_id]=r.tier;});
}
async function updateTier(uid,tier){
 if(s.profile?.role!=='admin'||!['free','pro','ultimate'].includes(tier))throw Error('Tarifwechsel nicht erlaubt.');
 const result=await adminCall({action:'setTier',userId:uid,tier});
 if(!result.ok)throw Error(result.error||'Tarif konnte nicht geändert werden.');
 s.memberPlans[uid]=tier;notice('Mitgliedschaft auf '+(plans[tier]||tier)+' geändert.');
}
async function adminAction(action,node){
 try{
  if(action==='refresh-admin'){await Promise.all([fetchMembers(),fetchVouchers()]);render();return;}
  if(action==='admin-prev'||action==='admin-next'){s.adminPage=Math.max(1,s.adminPage+(action==='admin-next'?1:-1));await fetchMembers();render();return;}
  if(node.hasAttribute('data-reset-user')){
    var pwd=prompt('Neues vorläufiges Passwort (mindestens 14 Zeichen):');if(pwd===null)return;
    await adminCall({action:'resetUsernamePassword',userId:node.dataset.resetUser,password:pwd});notice('Passwort zurückgesetzt; Nutzer muss es beim Login ändern.');await fetchMembers();render();return;
  }
  if(node.hasAttribute('data-active-user')){
    var enable=node.dataset.activeValue==='true';const manualReview=enable&&node.dataset.emailReview==='true';
    const promptText=manualReview?'Die Kontakt-E-Mail wurde NICHT unabhängig verifiziert. Gib das Konto nur frei, wenn du den Benutzer und seine Kontaktadresse selbst geprüft hast. Wirklich freigeben?':enable?'Zugang freigeben bzw. wieder aktivieren?':'Diesen Account sofort sperren?';
    if(!confirm(promptText))return;
    await adminCall({action:'setActive',userId:node.dataset.activeUser,active:enable,manualEmailReview:manualReview});notice('Kontostatus geändert.');await fetchMembers();render();return;
  }
  if(node.hasAttribute('data-delete-user')){
    if(prompt('Account dauerhaft löschen? Tippe SCHÜLER LÖSCHEN:')!=='SCHÜLER LÖSCHEN')return;
    await adminCall({action:'deleteStudent',userId:node.dataset.deleteUser,confirmation:'SCHÜLER LÖSCHEN'});notice('Konto gelöscht.');await fetchMembers();render();return;
  }
 }catch(e){notice('Admin-Fehler: '+formatError(e));}
}
document.addEventListener('click',async function(e){
 var streakOpen=e.target.closest('[data-streak-open]');
 if(streakOpen){s.streakModalOpen=true;paintStreakModal();return;}
 var streakClose=e.target.closest('[data-streak-close]');
 if(streakClose){s.streakModalOpen=false;paintStreakModal();return;}
 var streakClaim=e.target.closest('[data-streak-claim]');
 if(streakClaim){await claimDailyStreak();return;}
 var goTarget=e.target.closest('[data-go]');
 if(goTarget){e.preventDefault();go(goTarget.dataset.go);return;}
 if(e.target.id==='nav-backdrop'){sidebar.classList.remove('open');syncBackdrop();return;}
 if(e.target.id==='menu-toggle'){sidebar.classList.toggle('open');syncBackdrop();return;}
 var socialRemove=e.target.closest('[data-social-remove]');
 if(socialRemove){if(!confirm('Dieses Profilbild / Banner wirklich entfernen?'))return;try{await removeSocialImage(socialRemove.dataset.socialRemove);render();notice('Bild entfernt.');}catch(err){notice('Bild: '+formatError(err))}return;}
 var friendTab=e.target.closest('[data-friend-tab]');
 if(friendTab){s.friendTab=friendTab.dataset.friendTab;render();return;}
 var friendAction=e.target.closest('[data-friend-action]');
 if(friendAction){
  const command=friendAction.dataset.friendAction,id=friendAction.dataset.friendId;
  if(command==='remove'&&!confirm('Diesen Freund wirklich entfernen?'))return;
  try{const r=await api.rpc('academy_friend_action',{p_action:command,p_user:id});if(r.error)throw r.error;await refreshSocial();render();notice('Freundesliste aktualisiert.');}
  catch(err){notice('Freundschaft: '+formatError(err));}return;
 }
 var themeBtn=e.target.closest('[data-theme-choice],[data-accent-choice]');
 if(themeBtn){
  if(themeBtn.hasAttribute('data-theme-choice'))setChoicePreference('theme',themeBtn.dataset.themeChoice);
  if(themeBtn.hasAttribute('data-accent-choice'))setChoicePreference('accent',themeBtn.dataset.accentChoice);
  render();return;
 }
 var action=e.target.closest('[data-action]');
 if(action){
  var name=action.dataset.action;
  if(name==='logout'){await logout();return;}
  if(name==='show-register'){s.authScreen='register';login();return;}
  if(name==='show-login'){s.authScreen='login';login();return;}
  if(name==='retry-access'){await boot();return;}
  if(name==='more-courses'){
   s.catalogLimit=Math.min(filteredCourses().length,s.catalogLimit+9);
   var wrap=$('#catalog-container');if(wrap)wrap.innerHTML=catalogItems();return;
  }
  if(name==='complete-practice'){await completePractice();return;}
  if(name==='reset-appearance'){
    for(const key of ['compact','motion','largeTypography','contrast','softCorners','backgroundArt'])
     try{localStorage.removeItem('liverylab-pref-'+key);}catch(_){}
    for(const key of ['theme','accent'])
     try{localStorage.removeItem('liverylab-choice-'+key);}catch(_){}
    applyPreferences();render();notice('Standarddesign wiederhergestellt.');return;
  }
  if(name==='reset-progress'){
   if(!confirm('Wirklich alle Lernabschlüsse, XP und Prüfungsergebnisse dieses Kontos zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.'))return;
   var before=s.progress;
   s.progress={done:[],watched:[],practiced:[],exams:{}};
   try{
    await saveProgress();
    for(var l of s.lessons){try{localStorage.removeItem('liverylab-draft-'+l.id)}catch(_){}}
    notice('Dein Kursfortschritt wurde zurückgesetzt.');render();
   }catch(err){s.progress=before;notice('Zurücksetzen fehlgeschlagen: '+formatError(err))}
   return;
  }
  if(['refresh-admin','admin-prev','admin-next'].includes(name)){await adminAction(name,action);return;}
  if(name==='load-video'){
   var video=s.lesson?.video_id;if(!/^[a-zA-Z0-9_-]{11}$/.test(String(video||'')))return;
   var frame=$('#video-frame');
   if(frame){var iframe=document.createElement('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+video+'?rel=0&start='+Math.max(0,safeNumber(s.lesson.video_start));
    iframe.title='Externes Video-Tutorial von YouTube';iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';
    iframe.allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;frame.replaceChildren(iframe);s.videoLoaded=true;}
   return;
  }
  if(name==='finish-lesson'){await markLesson();return;}

  if(name==='copy-project'){
   if(!s.projectSource){notice('Noch kein Code freigeschaltet.');return;}
   try{await navigator.clipboard.writeText(s.projectSource);notice('Code kopiert.');}
   catch(_){notice('Kopieren nicht möglich. Markiere den Text im Codefeld.');}
   return;
  }
  if(name==='restart-exam'){await loadExam(parseRoute().id);render();return;}
 }

 var pt=e.target.closest('[data-project-tab]');
 if(pt){
  const index=Number(pt.dataset.projectTab);
  if(Number.isInteger(index)&&index>=0&&index<PROJECT_FILES.length){s.projectTab=index;await loadProjectTab();render();}
  return;
 }
 var answer=e.target.closest('[data-answer]');if(answer){s.choice=Number(answer.dataset.answer);updateLessonControls();return;}
 var exam=e.target.closest('[data-exam-answer]');if(exam){await submitExamAnswer(Number(exam.dataset.examAnswer));return;}
 var filter=e.target.closest('[data-filter]');if(filter){s.filter=filter.dataset.filter;s.catalogLimit=9;render();return;}

 var voucherDelete=e.target.closest('[data-voucher-delete]');
 if(voucherDelete){
  if(s.profile?.role!=='admin')return;
  const code=voucherDelete.dataset.voucherDelete;
  if(!confirm('Gutschein '+code+' endgültig aus der Verwaltung entfernen? Bereits eingelöste Ansprüche bleiben als Nachweis erhalten. Diese Aktion kann nicht rückgängig gemacht werden.'))return;
  try{
   const r=await api.rpc('academy_voucher_delete',{p_code:code});
   if(r.error)throw r.error;
   if(!r.data?.ok)throw Error(r.data?.error||'Gutschein konnte nicht gelöscht werden.');
   await fetchVouchers();render();notice('Gutschein '+code+' aus der Verwaltung entfernt.');
  }catch(err){notice('Gutschein: '+formatError(err))}
  return;
 }
 var voucherToggle=e.target.closest('[data-voucher-toggle]');
 if(voucherToggle){
  if(s.profile?.role!=='admin')return;
  const enabling=voucherToggle.dataset.voucherEnabled==='true';
  if(!confirm(enabling?'Diesen Gutschein wieder aktivieren?':'Diesen Gutschein deaktivieren? Nicht genutzte Einlösungen werden blockiert.'))return;
  try{
   const r=await api.rpc('academy_voucher_set_active',{p_code:voucherToggle.dataset.voucherToggle,p_active:enabling});
   if(r.error)throw r.error;
   if(!r.data?.ok)throw Error(r.data?.error||'Änderung abgelehnt.');
   await fetchVouchers();render();notice('Gutschein aktualisiert.');
  }catch(err){notice('Gutschein: '+formatError(err))}
  return;
 }
 var codeButton=e.target.closest('[data-ref-copy]');
 if(codeButton){try{await navigator.clipboard.writeText(codeButton.dataset.refCopy);notice('Code kopiert.');}
 catch(_){notice('Kopieren im Browser nicht verfügbar.');}return;}
 var couponButton=e.target.closest('[data-copy-voucher]');
 if(couponButton){
  try{await navigator.clipboard.writeText(couponButton.dataset.copyVoucher);notice('Gutscheincode kopiert.');}
  catch(_){notice('Dein Code: '+couponButton.dataset.copyVoucher);}
  return;
 }
 if(s.profile?.role==='admin'){
  var admin=e.target.closest('[data-reset-user],[data-active-user],[data-delete-user]');
  if(admin){await adminAction('',admin);return;}
 }
 if(sidebar.classList.contains('open')&&!e.target.closest('#sidebar')){sidebar.classList.remove('open');syncBackdrop();}
});
document.addEventListener('keydown',function(e){
 if((e.key==='Enter'||e.key===' ')&&e.target.matches('.lesson-card[data-go]')){e.preventDefault();go(e.target.dataset.go);}
 if(e.key==='Tab'&&e.target.id==='practice-input'){
  e.preventDefault();const el=e.target,a=el.selectionStart,b=el.selectionEnd;
  el.value=el.value.slice(0,a)+'\t'+el.value.slice(b);el.selectionStart=el.selectionEnd=a+1;
  s.draft=el.value;saveDraft(parseRoute().id,el.value);return;
 }
 if(e.key==='Tab'&&s.streakModalOpen){
  const modal=document.querySelector('.ll-streak-modal');
  if(modal&&typeof modal.querySelectorAll==='function'){
   const controls=Array.from(modal.querySelectorAll('button:not([disabled]),a[href]'));
   if(controls.length){
    const first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
  }
 }
 if(e.key==='Escape'){if(s.streakModalOpen){s.streakModalOpen=false;paintStreakModal();}sidebar.classList.remove('open');syncBackdrop();}
});
document.addEventListener('input',function(e){
 if(e.target.id==='reference-search'){
  s.refSearch=e.target.value;const results=referenceResults();
  const container=$('#reference-results'),counter=$('#reference-count');
  if(container)container.innerHTML=results.html;
  if(counter)counter.textContent=results.count+' Treffer';
  return;
 }
 if(e.target.id==='course-search'){
  s.search=e.target.value;s.catalogLimit=9;
  var list=$('#catalog-container'),count=$('#course-count');
  if(list)list.innerHTML=catalogItems();
  if(count)count.textContent=filteredCourses().length+' Ergebnisse · Schritt für Schritt';
 }
 if(e.target.id==='practice-input'){
  s.draft=e.target.value;saveDraft(parseRoute().id,s.draft);
  var status=$('#practice-status');if(status&&!s.practiceChecked)status.textContent='Entwurf lokal gespeichert';
 }
});
document.addEventListener('change',async function(e){
 if(e.target.hasAttribute('data-social-upload')){
  const kind=e.target.dataset.socialUpload,file=e.target.files?.[0];if(!file)return;
  e.target.disabled=true;
  try{notice('Bild wird verarbeitet und hochgeladen …');await uploadSocialImage(kind,file);render();notice('Profilbild / Banner gespeichert!');}
  catch(err){notice('Bild-Upload: '+formatError(err));e.target.disabled=false;}return;
 }
 if(e.target.id==='reference-language'){
  s.refLang=e.target.value;s.refSearch='';s.refGroup='Alle';render();return;
 }
 if(e.target.id==='reference-group'){
  s.refGroup=e.target.value;const results=referenceResults();
  const list=$('#reference-results'),count=$('#reference-count');
  if(list)list.innerHTML=results.html;if(count)count.textContent=results.count+' Treffer';
  return;
 }
 if(e.target.matches('select[name="code_mode"]')&&e.target.closest('form[data-form="create-voucher"]')){
  const field=e.target.closest('form').querySelector('.voucher-custom-field');
  if(field)field.hidden=e.target.value!=='custom';
  return;
 }
 if(e.target.matches('select[name="kind"]')&&e.target.closest('form[data-form="create-voucher"]')){
  const frm=e.target.closest('form'),discount=frm.querySelector('.voucher-discount-field'),gift=frm.querySelector('.voucher-gift-field');
  if(discount)discount.hidden=e.target.value!=='discount';
  if(gift)gift.hidden=e.target.value==='discount';
  return;
 }

 if(e.target.id==='video-check'){
  const id=parseRoute().id,previous=s.videoChecked;
  s.videoChecked=e.target.checked;
  if(!Array.isArray(s.progress.watched))s.progress.watched=[];
  const oldWatched=s.progress.watched.slice();
  if(s.videoChecked&&!s.progress.watched.includes(id))s.progress.watched.push(id);
  if(!s.videoChecked)s.progress.watched=s.progress.watched.filter(x=>x!==id);
  updateLessonControls();
  try{await saveProgress()}catch(err){
   s.videoChecked=previous;s.progress.watched=oldWatched;
   updateLessonControls();notice('Video-Fortschritt konnte nicht gespeichert werden.');
  }
  return;
 }
 if(e.target.hasAttribute('data-pref')){setPreference(e.target.dataset.pref,e.target.checked);return;}
 if(e.target.hasAttribute('data-admin-role')){
  const field=e.target,member=s.members.find(u=>u.id===field.dataset.adminRole),old=member?.role||'student';
  if(!s.isOwner||!confirm(field.value==='admin'?'Dieses Mitglied zum Administrator ernennen? Es kann Konten genehmigen, sperren und Tarife ändern.':'Administratorrechte für dieses Mitglied entziehen?')){field.value=old;return;}
  try{await adminCall({action:'setRole',userId:field.dataset.adminRole,role:field.value});await fetchMembers();render();notice('Administratorrolle geändert.');}catch(e){field.value=old;notice(formatError(e));}return;
 }
 if(e.target.hasAttribute('data-admin-tier')){
  var select=e.target,old=s.memberPlans[select.dataset.adminTier]||'free';
  try{await updateTier(select.dataset.adminTier,select.value)}catch(err){select.value=old;notice(formatError(err))}
 }
});

document.addEventListener('submit',async function(e){
 var form=e.target.closest('form[data-form]');if(!form)return;e.preventDefault();
 var fd=new FormData(form),button=$('button[type="submit"]',form),mode=form.dataset.form;
 if(!button)return;button.disabled=true;
 try{
  if(mode==='login'){await signIn(fd,button);return;}
  if(mode==='register'){await registerAccount(fd);return;}
  if(mode==='first-password'){await finishPassword(fd,button);return;}
  if(mode==='set-username'){
   var chosen=String(fd.get('username')||'').trim();
   if(!/^[A-Za-z][A-Za-z0-9_]{2,23}$/.test(chosen))throw Error('Benutzername: 3-24 Zeichen, Buchstaben, Zahlen und Unterstrich.');
   var result=await api.rpc('academy_set_username',{p_username:chosen});
   if(result.error)throw result.error;
   s.profile.username=result.data||chosen.toLowerCase();
   notice('Benutzername aktiviert. Beide Anmeldearten funktionieren jetzt.');render();
  }
  if(mode==='social-profile'){
   const bio=String(fd.get('bio')||'').trim(),avatar=String(fd.get('avatar')||'violet'),banner=String(fd.get('banner')||'nebula'),style=String(fd.get('style')||'classic'),title=String(fd.get('title')||'Developer'),visible=fd.has('show_progress');
   if(bio.length>260)throw Error('Die Bio darf maximal 260 Zeichen lang sein.');
   const r=await api.rpc('academy_social_update',{p_bio:bio,p_avatar:avatar,p_banner:banner,p_style:style,p_title:title,p_show:visible});if(r.error)throw r.error;
   await refreshSocial();notice('Profilgestaltung gespeichert!');render();return;
  }
  if(mode==='friend-search'){
   const username=String(fd.get('username')||'').trim();const r=await api.rpc('academy_social_search',{p_username:username});if(r.error)throw r.error;
   const found=r.data||{},box=$('#friend-search-result');if(!box)return;
   box.innerHTML=found.id?'<div class="friend-search-found">'+avatarFor(found,found.display_name||found.username,'')+'<div><strong>'+esc(found.display_name||found.username)+'</strong><small>@'+esc(found.username)+' · '+esc(found.title||'Developer')+'</small></div><button type="button" class="btn primary small" data-friend-action="request" data-friend-id="'+esc(found.id)+'">Anfrage senden →</button></div>':'<div class="empty">Kein freigegebenes Profil mit diesem Namen gefunden.</div>';return;
  }
  if(mode==='profile'){
   var name=String(fd.get('display_name')||'').trim();if(name.length<2||name.length>40)throw Error('Anzeigename: 2–40 Zeichen.');
   var r=await api.from('academy_profiles').update({display_name:name}).eq('id',s.user.id);if(r.error)throw r.error;s.profile.display_name=name;notice('Profil gespeichert.');render();
  }
  if(mode==='password'){
   var password=String(fd.get('password')||'');if(password.length<14)throw Error('Bitte mindestens 14 Zeichen verwenden.');
   var p=await api.auth.updateUser({password:password});if(p.error)throw p.error;notice('Passwort aktualisiert.');form.reset();
  }
  if(mode==='redeem-voucher'){
    const code=String(fd.get('code')||'').trim().toUpperCase();
    if(!/^[A-Z0-9][A-Z0-9-]{2,63}$/.test(code))throw Error('Gutscheincode: 3 bis 64 Buchstaben, Zahlen oder Bindestriche.');
    const r=await api.rpc('academy_voucher_apply',{p_code:code});
    if(r.error)throw r.error;
    if(!r.data?.ok)throw Error(r.data?.error||'Gutschein konnte nicht eingelöst werden.');
    if(r.data.kind==='gift'){
      notice('Gratis-Mitgliedschaft freigeschaltet!');await loadData();return;
    }
    s.discount={code,tier:r.data.tier,percent:r.data.percent,original_cents:r.data.original_cents,final_cents:r.data.final_cents};
    notice('Rabatt reserviert! Kontaktiere das Team für die Freischaltung.');
    form.reset();render();
  }
  if(mode==='create-voucher'){
    if(s.profile?.role!=='admin')throw Error('Administratorrechte erforderlich.');
    const kind=String(fd.get('kind')),tier=String(fd.get('tier'));
    const custom=String(fd.get('code_mode')||'random')==='custom'?String(fd.get('custom_code')||'').trim():'';
    if(fd.get('code_mode')==='custom'&&!/^[A-Za-z0-9][A-Za-z0-9-]{2,63}$/.test(custom))throw Error('Eigener Code: mindestens 3 Zeichen, nur Buchstaben, Zahlen und Bindestriche.');
    const r=await api.rpc('academy_voucher_create_custom',{
      p_custom_code:custom,p_kind:kind,p_tier:tier,
      p_percent:kind==='discount'?Number(fd.get('percent')):null,
      p_membership_days:kind==='gift'?Number(fd.get('membership_days')):null,
      p_max_uses:Number(fd.get('max_uses')),p_valid_days:Number(fd.get('valid_days'))
    });
    if(r.error)throw r.error;
    if(!r.data?.ok||!r.data.code)throw Error('Gutschein wurde nicht erstellt.');
    const code=r.data.code;
    await fetchVouchers();render();
    const box=$('#created-voucher');
    if(box){box.hidden=false;box.innerHTML='<strong>Gutschein erstellt:</strong> <code>'+esc(code)+'</code> <button class="btn small" type="button" data-copy-voucher="'+esc(code)+'">Kopieren</button>';}
    notice('Gutschein erstellt.');
  }
  if(mode==='create-email'){
   if(s.profile?.role!=='admin')throw Error('Adminzugang erforderlich.');
   var email=String(fd.get('email')||'').trim().toLowerCase(),pw=String(fd.get('password')||''),plan=String(fd.get('tier')||'free');
   var displayName=String(fd.get('display_name')||'').trim();
   var created=await adminCall({action:'createEmail',email:email,password:pw,displayName:displayName});
   if(plan!=='free'){try{await updateTier(created.id,plan);}catch(error){notice('Konto erstellt, aber noch Free: '+formatError(error));}}
   notice('E-Mail-Konto erstellt. Startpasswort vertraulich übermitteln.');form.reset();await fetchMembers();render();
  }
  if(mode==='create-user'){
   if(s.profile?.role!=='admin')throw Error('Adminzugang erforderlich.');
   var name=String(fd.get('username')||'').trim(),pw=String(fd.get('password')||''),plan=String(fd.get('tier')||'free');
   var data=await adminCall({action:'createUsername',username:name,password:pw});
   if(plan!=='free'){try{await updateTier(data.id,plan);}catch(error){notice('Konto erstellt, aber noch Free: '+formatError(error));}}
   notice('Konto '+name+' erfolgreich erstellt. Startpasswort vertraulich übermitteln.');form.reset();await fetchMembers();render();
  }
 }catch(err){notice(formatError(err));}finally{button.disabled=false;}
});
window.addEventListener('hashchange',function(){if(s.ready)navigateCurrent();});
async function init(){
 applyPreferences();
 if(typeof window.setInterval==='function')window.setInterval(updateStreakClocks,1000);
 document.head.insertAdjacentHTML('beforeend','<style>.is-auth .sidebar,.is-auth .bottom-nav{display:none}.is-auth .topbar{background:#0d0a19}.is-auth .content{max-width:1100px}.is-auth .app-column{width:100%}</style>');
 if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey){content.innerHTML='<div class="auth-layout panel"><h2>Verbindung nicht verfügbar</h2><p>Supabase konnte nicht geladen werden. Bitte lade die Seite erneut oder überprüfe deine Verbindung.</p></div>';return;}
 try{api=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});await boot();}
 catch(err){content.innerHTML='<div class="auth-layout panel"><h2>Academy nicht erreichbar</h2><p class="muted">'+esc(formatError(err))+'</p><button class="btn" onclick="location.reload()">Erneut versuchen</button></div>';}
}
init();
})();
