/* LiveryLab Academy v10 — course-first learning platform.
 * Made with 💙 from NyxAtheris (LiveryLab Studios)
 * The footer attribution remains visible; open-source code itself cannot be made tamper-proof.
 * No browser-side administrator secrets. Supabase Auth + RLS enforce access server-side.
 */
(function(){
'use strict';
var cfg=window.LL_CONFIG||{}, $=function(q,root){return (root||document).querySelector(q);};
var content=$('#content'), sidebar=$('#sidebar'), bottom=$('#bottom-nav'), toastNode=$('#toast');
var api=null, s={user:null,profile:null,tier:'free',ready:false,courses:[],lessons:[],progress:{done:[],watched:[],exams:{}},route:'home',filter:'Alle',search:'',lesson:null,choice:null,videoChecked:false,videoLoaded:false,exam:null,members:[],memberPlans:{},adminPage:1,catalogLimit:9,practiceChecked:false,draft:'',prefs:null};
var plans={free:'Free',pro:'Plus',ultimate:'Pro'};
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
function allowed(l){return !!s.profile&&(s.profile.role==='admin'||l.required_plan==='free'||(l.required_plan==='plus'&&['pro','ultimate'].includes(s.tier))||(l.required_plan==='pro'&&s.tier==='ultimate'));}
function badge(t){return '<span class="chip '+esc(t)+'">'+tierLabel(t)+'</span>';}
function levelText(l){var x=String(l||'beginner').toLowerCase();return /beginner|anfänger/.test(x)?'Anfänger':/intermediate|mittelstufe/.test(x)?'Aufbau':'Fortgeschritten';}

function readDraft(id){try{return localStorage.getItem('liverylab-draft-'+id)||''}catch(_){return ''}}
function saveDraft(id,value){try{localStorage.setItem('liverylab-draft-'+id,String(value).slice(0,10000))}catch(_){}}
function setPreference(key,value){try{localStorage.setItem('liverylab-pref-'+key,value?'1':'0')}catch(_){}applyPreferences()}
function getPreference(key){try{return localStorage.getItem('liverylab-pref-'+key)==='1'}catch(_){return false}}
function applyPreferences(){document.body.classList.toggle('compact-cards',getPreference('compact'));document.body.classList.toggle('less-motion',getPreference('motion'))}
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
function navHTML(route){var nav=[['home','⌂','Start'],['courses','◈','Kurse'],['exams','☆','Prüfung'],['reference','▤','Referenz'],['plans','✦','Mitgliedschaft'],['profile','◉','Profil']];
 if(s.profile&&s.profile.role==='admin')nav.push(['admin','⚙','Admin']);
 nav.push(['settings','☷','Einstellungen']);
 return nav.map(function(v){var active=route===v[0]||(route==='track'&&v[0]==='courses')||(route==='lesson'&&v[0]==='courses')||(route==='exam'&&v[0]==='exams');return '<button type="button" class="side-link'+(active?' active':'')+'" data-go="'+v[0]+'"><span class="side-icon">'+v[1]+'</span><span>'+v[2]+'</span></button>';}).join('');
}
function frame(){
 var auth=!s.ready;document.body.classList.toggle('is-auth',auth);
 var topRoute=(location.hash.replace(/^#/,'').split('/')[0]||'home');
 if(auth){sidebar.innerHTML='';bottom.innerHTML='';}
 else{
   sidebar.innerHTML='<div class="sidebar-logo"><span class="logo-mark">&lt;/&gt;</span><span>LiveryLab<br><span class="gradient">Academy</span></span></div><div class="side-label">Navigation</div>'+navHTML(topRoute)+'<div class="side-bottom"><span class="eyebrow">Dein Account</span><strong>'+esc(s.profile.display_name||s.profile.username||'Developer')+'</strong><small>'+esc(plans[s.tier]||'Free')+' · '+safeNumber((s.progress.done||[]).length)*30+' XP</small><a class="discord-small" target="_blank" rel="noopener noreferrer" href="https://discord.gg/livery-lab">Discord beitreten</a></div>';
   bottom.innerHTML=[['home','⌂','Lernen'],['courses','◇','Kurse'],['exams','☆','Prüfung'],['reference','▤','Referenz']].map(function(n){return '<button type="button" data-go="'+n[0]+'" class="bottom-item '+((topRoute===n[0]||(topRoute==='track'&&n[0]==='courses')||(topRoute==='lesson'&&n[0]==='courses')||(topRoute==='exam'&&n[0]==='exams'))?'active':'')+'"><span class="side-icon">'+n[1]+'</span><span>'+n[2]+'</span></button>';}).join('');
 }
 $('#xp-head').textContent='✦ '+((s.progress.done||[]).length*30)+' XP';
 $('.avatar-btn').textContent=String(s.profile?.display_name||s.profile?.username||'N').charAt(0).toUpperCase();
}
function login(){
 s.ready=false;frame();
 content.innerHTML='<div class="auth-layout"><section class="auth-card"><div class="brandmark"><span class="logo-mark">&lt;/&gt;</span><span>LiveryLab <span class="gradient">Academy</span></span></div><span class="eyebrow">[ 01 ] PRIVATE LERNPLATTFORM</span><h1>Wissen. Code.<br><span class="gradient">Dein nächstes Level.</span></h1><p class="lede">Melde dich mit deiner E-Mail-Adresse oder deinem Benutzernamen an. Ein bereits in Supabase angelegtes E-Mail-Konto funktioniert direkt. Neue Konten kann das LiveryLab-Team erstellen.</p><form data-form="login"><div class="form-group"><label class="form-label" for="username">Benutzername oder E-Mail-Adresse</label><input class="input" id="username" name="username" autocomplete="username" required minlength="3" maxlength="254" placeholder="name@beispiel.de oder dein_name"></div><div class="form-group"><label class="form-label" for="password">Passwort</label><input class="input" type="password" id="password" name="password" autocomplete="current-password" required placeholder="Dein Passwort"></div><button class="btn primary block" type="submit">Anmelden →</button></form><p class="micro">Noch kein Konto? Adde <strong>nyxatheris</strong> auf Discord, wenn du die Academy testen oder nutzen möchtest.</p><a class="btn discord block discord-block" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">◈ Direkt zum LiveryLab Discord</a><p class="smallprint" style="text-align:center;margin-top:19px">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></section></div>';
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
  var r=await api.from('academy_profiles').select('id,display_name,username,role,active,needs_password_change').eq('id',s.user.id).maybeSingle();
  if(r.error)throw r.error;if(!r.data||!r.data.active)throw Error('Dein Konto ist nicht freigeschaltet.');
  s.profile=r.data;
  if(s.profile.needs_password_change){passwordChangeRequired();return;}
  await loadData();
 }catch(e){s.ready=false;frame();content.innerHTML='<div class="auth-layout panel"><h2>Kein Zugriff</h2><p class="muted">'+esc(formatError(e))+'</p><a class="btn discord" href="https://discord.gg/livery-lab" target="_blank" rel="noopener">Discord-Support</a><button type="button" data-action="logout" class="btn ghost">Abmelden</button></div>';}
}
async function loadData(){
 var all=await Promise.all([
 api.from('ll_courses').select('id,name,category,level,icon,source_url'),
 api.from('ll_lesson_index').select('id,course_id,chapter,position,title,summary,minutes,required_plan').order('position',{ascending:true}),
 api.from('academy_plans').select('tier').eq('user_id',s.user.id).maybeSingle(),
 api.from('academy_progress').select('payload').eq('user_id',s.user.id).eq('key','liverylab-v10').maybeSingle()
 ]);
 if(all[0].error)throw all[0].error;if(all[1].error)throw all[1].error;
 s.courses=all[0].data||[];s.lessons=all[1].data||[];
 s.tier=['free','pro','ultimate'].includes(all[2].data?.tier)?all[2].data.tier:'free';
 var data=all[3].data?.payload||{};
 s.progress={done:Array.isArray(data.done)?data.done:[],watched:Array.isArray(data.watched)?data.watched:[],exams:data.exams||{},practiced:Array.isArray(data.practiced)?data.practiced:[]};
 s.ready=true;frame();await navigateCurrent();
}
async function logout(){try{await api.auth.signOut();}catch(e){}s.ready=false;s.user=null;s.profile=null;s.lesson=null;s.courses=[];s.lessons=[];location.hash='#home';login();}
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
   s.choice=null;s.videoChecked=watchedIds().has(route.id);s.practiceChecked=(s.progress.practiced||[]).includes(route.id);s.draft=readDraft(route.id);s.videoLoaded=false;s.lesson=null;
   frame();content.innerHTML='<div class="center-screen"><div class="spinner"></div><p>Geschützte Lektion wird geladen …</p></div>';
   var meta=s.lessons.find(function(l){return l.id===route.id;});
   if(meta&&allowed(meta)){var result=await api.from('ll_lesson_content').select('payload,video_id,video_start').eq('lesson_id',route.id).maybeSingle();if(result.error)notice(formatError(result.error));s.lesson=result.data||null;}
 }
 if(route.page==='admin'&&s.profile?.role==='admin'){try{await fetchMembers();}catch(e){notice('Adminliste: '+formatError(e));}}
 if(route.page==='exam'&&route.id){await loadExam(route.id);}
 render();window.scrollTo({top:0,behavior:'instant'});
}
function render(){
 if(!s.ready){login();return;}frame();var r=parseRoute();
 var pages={home:homePage,courses:coursesPage,track:function(){return trackPage(r.id);},lesson:function(){return lessonPage(r.id);},plans:plansPage,exams:examsPage,exam:function(){return examPage(r.id);},reference:referencePage,profile:profilePage,settings:settingsPage,admin:adminPage};
 var fn=pages[r.page]||homePage;
 content.innerHTML=fn();
 if(r.page==='settings'||r.page==='profile')renderMFA();
}
function stats(){
 var done=(s.progress.done||[]).length,all=s.lessons.length,started=s.courses.filter(function(c){return countDone(c.id)>0;}).length;
 return '<div class="stats-grid"><div class="stat-card"><strong>'+done+'<small style="display:inline;font-size:14px">/'+all+'</small></strong><small>Lektionen</small></div><div class="stat-card"><strong>'+done*30+'</strong><small>XP gesammelt</small></div><div class="stat-card"><strong>'+started+'</strong><small>Kurse gestartet</small></div><div class="stat-card"><strong>'+pct(done,all)+'%</strong><small>Gesamtfortschritt</small></div></div>';
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
function homePage(){
 var finished=doneIds(),recommended=['coding-basics','lua','python','javascript','blender-fundamentals','fivem'].map(courseOf).filter(Boolean),next=null;
 for(var c of recommended){next=lessonsOf(c.id).find(l=>!finished.has(l.id)&&allowed(l));if(next)break;}
 if(!next)next=s.lessons.find(l=>!finished.has(l.id)&&allowed(l));
 var course=next?courseOf(next.course_id):null,isNew=s.progress.done.length===0;
 return '<section class="hero"><div class="hero-content"><span class="eyebrow">LIVERYLAB STUDIOS · DEVELOPER ACADEMY</span>'+
 '<h1>Aus Ideen werden <span class="gradient">eigene Projekte.</span></h1>'+
 '<p class="lede">Lerne Programmierung und Blender Schritt für Schritt. Klar erklärte Lektionen, passende Tutorials und eigene Praxisaufgaben – ohne überladene Werkzeuge.</p>'+
 '<div class="hero-actions"><button class="btn primary" data-go="'+(next?'lesson/'+esc(next.id):'courses')+'">'+(isNew?'Mit der ersten Lektion starten':'Weiterlernen')+' →</button>'+
 '<button class="btn" data-go="courses">Lernpfade entdecken</button></div></div></section>'+stats()+
 (next?'<section class="section"><div class="section-heading"><div><span class="eyebrow">DEIN NÄCHSTER SCHRITT</span><h2>Eine Lektion nach der anderen.</h2><p>Konzentriere dich auf einen Schritt, bevor du zum nächsten gehst.</p></div></div>'+
 '<div class="next-lesson"><span class="eyebrow">'+esc(course?.name||'Lernpfad')+' · '+esc(next.chapter)+'</span><h3>'+esc(next.title)+'</h3>'+
 '<p>'+esc(next.summary)+'</p><button class="btn primary" data-go="lesson/'+esc(next.id)+'">Lektion starten →</button></div></section>':'')+
 '<section class="section"><div class="section-heading"><div><span class="eyebrow">EMPFOHLENER EINSTIEG</span><h2>Starte mit einem Lernpfad.</h2><p>Die wichtigsten Kurse für Developer. Alles Weitere findest du in der Bibliothek.</p></div><a href="#courses">Alle Kurse ↗</a></div>'+
 '<div class="course-grid">'+recommended.map(courseCard).join('')+'</div></section>'+
 '<section class="section panel"><span class="eyebrow">LIVERYLAB COMMUNITY</span><h2>Fragen gehören zum Lernen.</h2>'+
 '<p class="muted">Du brauchst Unterstützung? Melde dich bei <strong>nyxatheris</strong> auf Discord.</p>'+
 '<a class="btn discord" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Zum Community-Discord ↗</a></section>';
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
 var c=courseOf(id);if(!c)return notFound();
 var all=lessonsOf(id),done=countDone(id),complete=done===all.length,remaining=all.find(l=>!doneIds().has(l.id)&&allowed(l)),groups=[];
 all.forEach(l=>{var group=groups[groups.length-1];if(!group||group.name!==l.chapter)groups.push({name:l.chapter,items:[l]});else group.items.push(l);});
 var result='<a class="back" href="#courses">← Kursbibliothek</a>'+
 pageHeading('LERNPFAD · '+all.length+' LEKTIONEN',esc(c.name),
 'Arbeite dich in Ruhe durch die Kapitel. Ein eigener praktischer Schritt ist wichtiger als zehn übersprungene Lektionen.')+
 '<div class="track-meter"><span class="course-icon" style="width:44px;height:44px;font-size:22px">'+esc(courseAccent(c))+'</span>'+
 '<div style="flex:1;min-width:0"><div class="meta-line" style="margin-bottom:9px"><span>Dein Kursfortschritt</span><strong>'+pct(done,all.length)+'%</strong></div>'+
 '<div class="progress" aria-label="Kursfortschritt"><span style="width:'+pct(done,all.length)+'%"></span></div></div><small>'+done+' / '+all.length+'</small></div>';
 if(remaining)result+='<div class="next-lesson"><span class="eyebrow">WEITERLERNEN</span><h3>'+esc(remaining.title)+'</h3><p>'+esc(remaining.summary)+'</p>'+
 '<button class="btn primary" data-go="lesson/'+esc(remaining.id)+'">Lektion öffnen →</button></div>';
 else if(complete)result+='<div class="done-banner"><strong>✓ Lernpfad abgeschlossen</strong><p>Du hast alle Lektionen dieses Kurses bearbeitet.</p></div>';
 groups.forEach((group,i)=>{
  var n=group.items.filter(l=>doneIds().has(l.id)).length,open=i===0||group.items.some(l=>l.id===remaining?.id);
  result+='<details class="chapter-group" '+(open?'open':'')+'><summary class="chapter-title" style="cursor:pointer">[ '+String(i+1).padStart(2,'0')+' ] '+esc(group.name)+
  ' <span style="margin-left:auto;white-space:nowrap;color:'+(n===group.items.length?'#90e8ba':'#ad9ebf')+';letter-spacing:0;font-size:11px">'+n+'/'+group.items.length+'</span></summary><div class="lesson-list">'+
  group.items.map(l=>{
   var finished=doneIds().has(l.id),grant=allowed(l);
   return '<article class="lesson-card '+(grant?'clickable':'locked')+(finished?' is-complete':'')+'" tabindex="0" role="link" data-go="lesson/'+esc(l.id)+'">'+
   '<small>'+(finished?'✓':String(l.position%100||l.position).padStart(2,'0'))+'</small>'+
   '<div><h3>'+esc(l.title)+'</h3><p>'+esc(l.summary)+'</p>'+
   '<div class="tag-bottom">'+(finished?'✓ Abgeschlossen':!grant?'🔒 '+tierLabel(l.required_plan)+' erforderlich':l.minutes+' Min · Erklärung · Praxis · Quiz')+'</div></div>'+
   '<span class="status-dot '+(finished?'done':'')+'">'+(finished?'✓':grant?'›':'🔒')+'</span></article>';
  }).join('')+'</div></details>';
 });
 result+='<section class="section panel"><span class="eyebrow">DEIN ABSCHLUSS</span><h2>Abschlussprüfung</h2>'+
 '<p class="muted">Schließe zuerst alle Lektionen ab. Danach kannst du eine Prüfung mit maximal zehn Fragen schreiben.</p>'+
 '<button class="btn primary" data-go="exam/'+esc(id)+'" '+(!complete?'disabled':'')+'>'+(complete?'Prüfung beginnen →':'Noch '+(all.length-done)+' Lektionen offen')+'</button></section>';
 return result;
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
 if(!s.lesson)return back+'<div class="empty"><h2>Lektion konnte nicht geladen werden.</h2>Bitte überprüfe deine Internetverbindung und lade die Seite neu.</div>';
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

function plansPage(){
 var counts=planCounts(),current=s.tier;
 function tile(id,name,label,desc,benefits,featured){
  var n=id==='free'?counts.free:id==='pro'?counts.plus:counts.pro,own=current===id;
  return '<article class="plan-card '+(featured?'featured':id==='ultimate'?'full':'')+'">'+
  '<span class="chip '+(id==='free'?'free':id==='pro'?'plus':'pro')+'">'+label+'</span>'+
  '<h3>'+name+'</h3><div class="price">'+n+' <span style="font-size:14px;font-weight:600;color:#b7a6d0">Lektionen</span></div>'+
  '<div class="plan-cap '+(own?'current-plan':'')+'">'+(own?'✓ Dein aktueller Tarif':id==='free'?'Der kostenlose Einstieg':id==='pro'?'Doppelt so viel wie Free':'Voller Zugriff auf die Academy')+'</div>'+
  '<p class="muted">'+desc+'</p><ul>'+benefits.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+
  (own?'<button class="btn block" disabled>Bereits freigeschaltet</button>':
  '<a class="btn '+(featured?'primary':'discord')+' block" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">'+name+' beim Team anfragen ↗</a>')+'</article>';
 }
 return pageHeading('MITGLIEDSCHAFT','Lernen in deinem <span class="gradient">Tempo.</span>',
 'Drei einfache Stufen. Der Zugriff wird von deinem Academy-Team verwaltet – ohne integrierten Kaufprozess.')+
 '<section class="section plan-grid">'+
 tile('free','Free','EINSTIEG','Alles, was du für deinen ersten Einstieg brauchst.',[
  'Allgemeine Grundlagenkurse','Passende Lernvideos oder gezielte Tutorialsuchen','Eigene Praxisaufgaben, Quiz und Fortschritt'],false)+
 tile('pro','Plus','WEITERLERNEN','Nach den ersten Schritten lernst du weiter.',[
  'Alles aus Free','Doppelt so viele freigeschaltete Lektionen wie Free','Mehr Programmierung, Projekte und vertiefende Praxis'],true)+
 tile('ultimate','Pro','VOLLER ZUGRIFF','Für alle Kurse der LiveryLab Academy.',[
  'Alles aus Plus','Zugang zu sämtlichen verfügbaren Lektionen','Fortgeschrittene Programmierung, FiveM und Blender'],false)+
 '</section><section class="section panel"><h3>Eine Freischaltung anfragen</h3>'+
 '<p class="muted">Schreibe <strong>nyxatheris</strong> auf Discord. Ein Administrator kann deinen Tarif direkt zuweisen.</p>'+
 '<a class="btn discord" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Discord öffnen ↗</a></section>';
}
function examsPage(){
 var recommended=['coding-basics','lua','python','javascript','html','blender-fundamentals','fivem','sql']
  .map(courseOf).filter(Boolean),ready=s.courses.filter(c=>countDone(c.id)===lessonsOf(c.id).length&&lessonsOf(c.id).length>=3);
 var display=Array.from(new Map([...ready,...recommended].map(c=>[c.id,c])).values()).slice(0,9);
 return pageHeading('PRÜFUNGEN','Zeig, was du <span class="gradient">gelernt hast.</span>',
 'Schließe erst die Lektionen deines Kurses ab. Danach kannst du eine Prüfung mit maximal zehn Fragen schreiben.')+
 '<section class="section"><div class="course-grid">'+display.map(c=>{
  var n=lessonsOf(c.id).length,done=countDone(c.id),best=(s.progress.exams||{})[c.id];
  return '<article class="course-card '+(best?'is-complete':'')+'"><div class="course-head"><span class="course-icon">'+esc(courseAccent(c))+'</span><span class="chip '+(best?'free':'')+'">'+(best?'✓ Bestanden':'Abschluss')+'</span></div>'+
  '<h3>'+esc(c.name)+'</h3><p>'+done+' von '+n+' Lektionen abgeschlossen. '+(best?'Dein Abschluss ist gespeichert.':'Bereite dich in Ruhe vor.')+'</p>'+
  '<div class="progress"><span style="width:'+pct(done,n)+'%"></span></div>'+
  '<button class="btn block" data-go="'+(done===n?'exam/':'track/')+esc(c.id)+'">'+(done===n?'Prüfung '+(best?'wiederholen':'starten')+' →':'Weiterlernen →')+'</button></article>';
 }).join('')+'</div><div class="catalog-footer"><button class="btn" data-go="courses">Alle Lernpfade ansehen →</button></div></section>';
}
async function loadExam(id){
 s.exam=null;var lessons=lessonsOf(id);if(!lessons.length||lessons.some(function(l){return !doneIds().has(l.id);}))return;
 var res=await api.from('ll_lesson_content').select('lesson_id,payload').in('lesson_id',lessons.map(function(l){return l.id;}));
 if(res.error){notice(formatError(res.error));return;}
 var questions=(res.data||[]).filter(function(x){return x.payload&&Array.isArray(x.payload.options)&&x.payload.options.length>1;});
 for(var i=questions.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),temp=questions[i];questions[i]=questions[j];questions[j]=temp;}
 s.exam={items:questions.slice(0,10),at:0,answers:[]};
}
function examPage(id){
 var c=courseOf(id);if(!c)return notFound();var lessons=lessonsOf(id);
 if(lessons.some(function(l){return !doneIds().has(l.id);}))return '<a class="back" href="#exams">← Prüfungsübersicht</a><div class="panel locked-panel"><h2>Prüfung noch gesperrt.</h2><p>Schließe zunächst alle '+lessons.length+' Lektionen dieses Kurses ab.</p><button class="btn primary" data-go="track/'+esc(id)+'">Zum Lernpfad</button></div>';
 if(!s.exam||!s.exam.items.length)return '<div class="empty">Für diese Prüfung sind noch nicht genügend Fragen hinterlegt.</div>';
 var ex=s.exam,fin=ex.at>=ex.items.length;
 if(fin){var score=ex.answers.filter(Boolean).length,pass=score>=Math.ceil(ex.items.length*.8);return '<a class="back" href="#exams">← Prüfungsübersicht</a><section class="panel locked-panel"><div class="award">'+(pass?'🏆':'📚')+'</div><span class="eyebrow">PRÜFUNG · '+esc(c.name)+'</span><h1>'+score+' / '+ex.items.length+' richtig</h1><p class="lede" style="margin:auto">'+(pass?'Glückwunsch! Du hast die Prüfung bestanden.':'Noch nicht bestanden. Wiederhole die Erklärungen und versuche es erneut.')+'</p><button class="btn primary" data-action="restart-exam">Prüfung wiederholen</button></section>';}
 var q=ex.items[ex.at],p=q.payload;
 return '<a class="back" href="#exams">← Prüfungsübersicht</a><section class="lesson-article"><span class="eyebrow">[ '+String(ex.at+1).padStart(2,'0')+' / '+ex.items.length+' ] ABSCHLUSSPRÜFUNG · '+esc(c.name)+'</span><h1>Wissenstest</h1><div class="progress" style="margin-bottom:24px"><span style="width:'+pct(ex.at,ex.items.length)+'%"></span></div><div class="step-box"><h2>'+esc(p.quiz||p.title)+'</h2>'+p.options.map(function(o,i){return '<button type="button" class="quiz-choice" data-exam-answer="'+i+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(o)+'</button>';}).join('')+'</div></section>';
}
async function submitExamAnswer(choice){
 if(!s.exam||s.exam.at>=s.exam.items.length)return;
 var q=s.exam.items[s.exam.at],correct=Number(q.payload.correct)||0;s.exam.answers.push(choice===correct);s.exam.at++;
 if(s.exam.at>=s.exam.items.length&&s.exam.answers.filter(Boolean).length>=Math.ceil(s.exam.items.length*.8)){
   s.progress.exams[parseRoute().id]={score:s.exam.answers.filter(Boolean).length,total:s.exam.items.length,at:new Date().toISOString()};
   try{await saveProgress();}catch(e){notice('Prüfung konnte nicht gespeichert werden: '+formatError(e));}
 }
 render();
}
function referencePage(){
 var refs=[['Lua','local name = "Alex"','https://www.lua.org/manual/5.4/'],['JavaScript','const x = 2;','https://developer.mozilla.org/de/docs/Web/JavaScript'],['Python','print("Hallo")','https://docs.python.org/3/tutorial/'],['HTML','<h1>Hallo</h1>','https://developer.mozilla.org/de/docs/Web/HTML'],['CSS','.box { display: flex; }','https://developer.mozilla.org/de/docs/Web/CSS'],['SQL','SELECT * FROM users;','https://www.postgresql.org/docs/current/tutorial.html'],['FiveM Lua','RegisterCommand("hi", function() end)','https://docs.fivem.net/docs/scripting-reference/'],['Blender','Shift + A → Neues Objekt','https://docs.blender.org/manual/en/latest/']];
 return '<section><span class="eyebrow">[ ≡ ] NACHSCHLAGEN</span><h1>Dein <span class="gradient">Spickzettel.</span></h1><p class="lede">Die wichtigsten Einstiege und Originaldokumentationen – direkt beim Lernen erreichbar.</p></section><section class="section panel"><h2>Code & Referenzen</h2><div class="tablewrap"><table class="ref-table"><tbody>'+refs.map(function(v){return '<tr><td><strong>'+esc(v[0])+'</strong></td><td><code>'+esc(v[1])+'</code></td><td><a href="'+safeLink(v[2])+'" target="_blank" rel="noopener noreferrer">Dokumentation ↗</a></td></tr>';}).join('')+'</tbody></table></div></section><section class="section panel"><h2>FiveM: Event-Richtungen</h2><div class="codebox"><pre><code>TriggerEvent(name, ...)         -- lokal\nTriggerServerEvent(name, ...)   -- Client → Server\nTriggerClientEvent(name, id)    -- Server → Client</code></pre></div><p class="micro">Sicherheitsregel: Client-Daten niemals ungeprüft vertrauen. Geld, Items und Berechtigungen ausschließlich serverseitig validieren.</p></section>';
}
function profilePage(){
 var done=s.progress.done.length,name=s.profile.display_name||s.profile.username||'Developer',
 initial=String(name).slice(0,1).toUpperCase(),username=s.profile.username,activeCourse=s.courses.filter(c=>countDone(c.id)>0).length;
 return pageHeading('MEIN ACCOUNT','Dein <span class="gradient">Developer-Profil.</span>',
 'Deine Lernreise, dein Konto und deine Sicherheit an einem Ort.')+
 '<section class="profile-hero"><div class="profile-avatar-large">'+esc(initial)+'</div>'+
 '<div class="profile-summary"><span class="eyebrow">LIVERYLAB ACADEMY</span><h2>'+esc(name)+'</h2>'+
 '<p>'+esc(username?'@'+username:(s.user.email?.endsWith('@accounts.livery-lab.app')?'Verwaltetes Konto ohne private E-Mail':s.user.email||''))+'</p></div>'+
 '<span class="profile-status">'+esc(plans[s.tier]||'Free')+'</span></section>'+
 '<div class="profile-stats"><div class="profile-stat"><strong>'+done*30+'</strong><small>Gesammelte XP</small></div>'+
 '<div class="profile-stat"><strong>'+done+'</strong><small>Lektionen erledigt</small></div>'+
 '<div class="profile-stat"><strong>'+activeCourse+'</strong><small>Kurse begonnen</small></div></div>'+
 '<section class="section account-layout"><div class="panel"><span class="eyebrow">PERSÖNLICHE ANGABEN</span><h3>Profil bearbeiten</h3>'+
 '<p class="micro">Dein Benutzername wird für deine Anmeldung verwendet. Dein Anzeigename erscheint nur in der Academy.</p>'+
 '<form data-form="profile"><div class="form-group"><label class="form-label">Anzeigename</label><input class="input" name="display_name" value="'+esc(name)+'" minlength="2" maxlength="40" required></div>'+
 '<button class="btn primary" type="submit">Profil speichern</button></form></div>'+
 '<div class="panel"><span class="eyebrow">ANMELDUNG</span><h3>Dein Login</h3>'+
 '<div class="settings-row" style="padding:10px 0"><div><b>E-Mail-Adresse</b><p>'+esc(s.user.email||'')+'</p></div><span class="chip free">Aktiv</span></div>'+
 '<div class="settings-row" style="padding:11px 0"><div><b>Benutzername</b><p>'+esc(username||'Noch nicht festgelegt')+'</p></div><span class="chip '+(username?'free':'plus')+'">'+(username?'✓ Aktiv':'Optional')+'</span></div>'+
 (!username?'<form data-form="set-username"><div class="form-group"><label class="form-label">Neuen Benutzernamen festlegen</label><input class="input" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" minlength="3" maxlength="24" required placeholder="z. B. developer23"></div><button class="btn" type="submit">Benutzernamen aktivieren</button></form>':'<p class="micro">Du kannst dich mit deinem Benutzernamen oder deiner E-Mail-Adresse anmelden.</p>')+
 '</div></section>'+
 '<section class="section account-layout"><div class="panel"><span class="eyebrow">KONTOSICHERHEIT</span><h3>Passwort ändern</h3>'+
 '<p class="micro">Wähle ein individuelles Passwort mit mindestens 14 Zeichen.</p>'+
 '<form data-form="password"><div class="form-group"><label class="form-label">Neues Passwort</label><input class="input" type="password" name="password" minlength="14" autocomplete="new-password" required placeholder="Neues sicheres Passwort"></div>'+
 '<button class="btn" type="submit">Passwort aktualisieren</button></form></div>'+
 '<div class="panel"><span class="eyebrow">ZWEITER FAKTOR</span><h3>Authenticator-App</h3><div id="mfa-settings"></div></div></section>';
}
function settingsPage(){
 var compact=getPreference('compact'),motion=getPreference('motion');
 return pageHeading('EINSTELLUNGEN','Dein Workspace, <span class="gradient">deine Regeln.</span>',
 'Klar strukturiert. Nur Einstellungen, die hier tatsächlich etwas verändern.')+
 '<section class="setting-section"><h2>Darstellung</h2><div class="settings-list">'+
 '<label class="settings-row"><span class="setting-info"><span class="setting-icon">▦</span><span><b>Kompakte Kurskarten</b><p>Weniger Abstand, mehr Lernpfade auf einen Blick.</p></span></span>'+
 '<input type="checkbox" class="settings-toggle" data-pref="compact" '+(compact?'checked':'')+' aria-label="Kompakte Kurskarten"></label>'+
 '<label class="settings-row"><span class="setting-info"><span class="setting-icon">◌</span><span><b>Bewegungen reduzieren</b><p>Animationen und Übergänge abschalten.</p></span></span>'+
 '<input type="checkbox" class="settings-toggle" data-pref="motion" '+(motion?'checked':'')+' aria-label="Animationen reduzieren"></label>'+
 '</div></section>'+
 '<section class="setting-section"><h2>Lernen & Fortschritt</h2><div class="settings-list">'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">✓</span><span><b>Mein Lernfortschritt</b><p>'+s.progress.done.length+' Lektionen bearbeitet. Alle abgeschlossenen Kapitel sind in Grün markiert.</p></span></div>'+
 '<button type="button" class="btn small" data-go="courses">Kurse</button></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">▷</span><span><b>Lernvideos & Datenschutz</b><p>YouTube wird erst geladen, wenn du auf Abspielen klickst.</p></span></div><span class="chip free">Geschützt</span></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">↺</span><span><b>Lernfortschritt zurücksetzen</b><p>Setzt XP und Abschlüsse dieses Accounts zurück. Nicht rückgängig zu machen.</p></span></div>'+
 '<button type="button" class="btn small danger" data-action="reset-progress">Zurücksetzen</button></div>'+
 '</div></section>'+
 '<section class="setting-section"><h2>Konto & Sicherheit</h2><div class="settings-list">'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">◉</span><span><b>Profil und Passwort</b><p>Benutzername, E-Mail und Kennwort verwalten.</p></span></div>'+
 '<button type="button" class="btn small" data-go="profile">Öffnen</button></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">⌁</span><span><b>Authenticator und 2FA</b><p>Eine zusätzliche Bestätigung schützt deinen Account.</p></span></div>'+
 '<button type="button" class="btn small" data-go="profile">Einrichten</button></div>'+
 '<div class="settings-row"><div class="setting-info"><span class="setting-icon">↗</span><span><b>Abmelden</b><p>Beendet deine aktuelle Sitzung auf diesem Gerät.</p></span></div>'+
 '<button type="button" class="btn small" data-action="logout">Abmelden</button></div>'+
 '</div></section>'+
 '<section class="section panel"><span class="eyebrow">LIVERYLAB STUDIOS</span><h3>Über diese Academy</h3>'+
 '<p class="micro">Eine Lernplattform für Programmierung, FiveM und Blender. Version 11 · Lerninhalte werden von der Community weiterentwickelt.</p>'+
 '<a href="./privacy.html">Datenschutzhinweise ansehen ↗</a><p class="smallprint" style="margin-top:16px">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></section>';
}
function adminPage(){
 if(s.profile?.role!=='admin')return '<section class="locked-panel"><h2>Nur für Administratoren.</h2></section>';
 var rows=(s.members||[]).map(u=>{
  var tier=s.memberPlans[u.id]||'free',owner=u.role==='admin';
  return '<tr><td><strong>'+esc(u.username||u.email||'Mitglied')+'</strong><br><small class="micro">'+esc(u.email||'')+' · '+(owner?'Admin':'Member')+'</small></td>'+
  '<td><span class="chip '+(u.active?'free':'pro')+'">'+(u.active?'✓ Aktiv':'Gesperrt')+'</span></td>'+
  '<td><select class="select" data-admin-tier="'+esc(u.id)+'" '+(owner?'disabled':'')+' aria-label="Tarif ändern"><option value="free" '+(tier==='free'?'selected':'')+'>Free</option>'+
  '<option value="pro" '+(tier==='pro'?'selected':'')+'>Plus</option><option value="ultimate" '+(tier==='ultimate'?'selected':'')+'>Pro</option></select></td>'+
  '<td><div class="btn-row"><button class="btn small" data-reset-user="'+esc(u.id)+'" '+(owner?'disabled':'')+'>Passwort</button>'+
  '<button class="btn small" data-active-user="'+esc(u.id)+'" data-active-value="'+(!u.active)+'" '+(owner?'disabled':'')+'>'+(u.active?'Sperren':'Aktivieren')+'</button>'+
  '<button class="btn small danger" data-delete-user="'+esc(u.id)+'" '+(owner?'disabled':'')+'>Löschen</button></div></td></tr>';
 }).join('');
 return pageHeading('ADMINISTRATION','Dein <span class="gradient">Team verwalten.</span>',
 'Erstelle Test- und Teamkonten. Vergib Freischaltungen und verwalte Zugänge direkt in der Academy.')+
 '<section class="section"><div class="section-heading"><div><h2>Neue Konten erstellen</h2><p>Wähle E-Mail oder einen reinen Benutzernamen.</p></div></div>'+
 '<details class="panel admin-create" open><summary><strong>✉ Konto mit E-Mail-Adresse</strong><span class="micro"> Empfohlen für feste Teammitglieder</span></summary>'+
 '<p class="muted">Der Nutzer meldet sich per E-Mail an und kann später einen Benutzernamen festlegen.</p>'+
 '<form data-form="create-email"><div class="form-row"><div class="form-group"><label class="form-label">E-Mail-Adresse</label><input class="input" type="email" name="email" required autocomplete="off" placeholder="name@beispiel.de"></div>'+
 '<div class="form-group"><label class="form-label">Anzeigename</label><input class="input" name="display_name" maxlength="40" placeholder="Optional"></div></div>'+
 '<div class="form-row"><div class="form-group"><label class="form-label">Vorläufiges Passwort (mind. 14 Zeichen)</label><input class="input" type="password" name="password" minlength="14" required autocomplete="new-password"></div>'+
 '<div class="form-group"><label class="form-label">Mitgliedschaft</label><select class="select" name="tier"><option value="free">Free</option><option value="pro">Plus</option><option value="ultimate">Pro</option></select></div></div>'+
 '<button class="btn primary" type="submit">E-Mail-Konto anlegen →</button></form></details>'+
 '<details class="panel admin-create" style="margin-top:14px"><summary><strong>◉ Konto mit Benutzername</strong><span class="micro"> Ohne eigene E-Mail-Adresse</span></summary>'+
 '<p class="muted">Das Startpasswort muss beim ersten Login geändert werden.</p>'+
 '<form data-form="create-user"><div class="form-row"><div class="form-group"><label class="form-label">Benutzername</label><input class="input" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" maxlength="24" placeholder="developer23" required></div>'+
 '<div class="form-group"><label class="form-label">Vorläufiges Passwort (mind. 14 Zeichen)</label><input class="input" type="password" name="password" minlength="14" required autocomplete="new-password"></div>'+
 '<div class="form-group"><label class="form-label">Mitgliedschaft</label><select class="select" name="tier"><option value="free">Free</option><option value="pro">Plus</option><option value="ultimate">Pro</option></select></div></div>'+
 '<button class="btn primary" type="submit">Benutzerkonto anlegen →</button></form></details></section>'+
 '<section class="section"><div class="section-heading"><div><h2>Deine Teamkonten</h2><p>Änderungen an Tarifen gelten über Supabase sofort.</p></div>'+
 '<button type="button" class="btn small" data-action="refresh-admin">Aktualisieren</button></div>'+
 '<div class="tablewrap"><table class="account-table"><thead><tr><th>Konto</th><th>Status</th><th>Tarif</th><th>Aktionen</th></tr></thead><tbody>'+
 (rows||'<tr><td colspan="4">Noch keine Konten geladen. Tippe auf Aktualisieren.</td></tr>')+
 '</tbody></table></div><div class="btn-row" style="margin-top:18px"><button class="btn small" data-action="admin-prev" '+(s.adminPage===1?'disabled':'')+'>← Vorherige</button>'+
 '<span class="micro" style="align-self:center">Seite '+s.adminPage+'</span><button class="btn small" data-action="admin-next" '+(s.members.length<100?'disabled':'')+'>Nächste →</button></div></section>';
}
async function fetchMembers(){
 if(s.profile?.role!=='admin')return;
 var data=await adminCall({action:'list',page:s.adminPage});s.members=data.users||[];
 var tier=await api.from('academy_plans').select('user_id,tier');
 if(tier.error)throw tier.error;s.memberPlans={};(tier.data||[]).forEach(function(r){s.memberPlans[r.user_id]=r.tier;});
}
async function updateTier(uid,tier){
 if(s.profile?.role!=='admin'||!['free','pro','ultimate'].includes(tier))return;
 var res=await api.from('academy_plans').upsert({user_id:uid,tier:tier,granted_by:s.user.id,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(res.error)throw res.error;s.memberPlans[uid]=tier;
 notice('Tarif auf '+(plans[tier]||tier)+' geändert.');if(uid===s.user.id){s.tier=tier;frame();}
}
async function adminAction(action,node){
 try{
  if(action==='refresh-admin'){await fetchMembers();render();return;}
  if(action==='admin-prev'||action==='admin-next'){s.adminPage=Math.max(1,s.adminPage+(action==='admin-next'?1:-1));await fetchMembers();render();return;}
  if(node.hasAttribute('data-reset-user')){
    var pwd=prompt('Neues vorläufiges Passwort (mindestens 14 Zeichen):');if(pwd===null)return;
    await adminCall({action:'resetUsernamePassword',userId:node.dataset.resetUser,password:pwd});notice('Passwort zurückgesetzt; Nutzer muss es beim Login ändern.');await fetchMembers();render();return;
  }
  if(node.hasAttribute('data-active-user')){
    var enable=node.dataset.activeValue==='true';if(!confirm(enable?'Konto aktivieren?':'Diesen Account sperren?'))return;
    await adminCall({action:'setActive',userId:node.dataset.activeUser,active:enable});notice('Kontostatus geändert.');await fetchMembers();render();return;
  }
  if(node.hasAttribute('data-delete-user')){
    if(prompt('Account dauerhaft löschen? Tippe SCHÜLER LÖSCHEN:')!=='SCHÜLER LÖSCHEN')return;
    await adminCall({action:'deleteStudent',userId:node.dataset.deleteUser,confirmation:'SCHÜLER LÖSCHEN'});notice('Konto gelöscht.');await fetchMembers();render();return;
  }
 }catch(e){notice('Admin-Fehler: '+formatError(e));}
}
document.addEventListener('click',async function(e){
 var goTarget=e.target.closest('[data-go]');
 if(goTarget){e.preventDefault();go(goTarget.dataset.go);return;}
 if(e.target.id==='nav-backdrop'){sidebar.classList.remove('open');syncBackdrop();return;}
 if(e.target.id==='menu-toggle'){sidebar.classList.toggle('open');syncBackdrop();return;}
 var action=e.target.closest('[data-action]');
 if(action){
  var name=action.dataset.action;
  if(name==='logout'){await logout();return;}
  if(name==='more-courses'){
   s.catalogLimit=Math.min(filteredCourses().length,s.catalogLimit+9);
   var wrap=$('#catalog-container');if(wrap)wrap.innerHTML=catalogItems();return;
  }
  if(name==='complete-practice'){await completePractice();return;}
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
  if(name==='restart-exam'){await loadExam(parseRoute().id);render();return;}
 }
 var answer=e.target.closest('[data-answer]');if(answer){s.choice=Number(answer.dataset.answer);updateLessonControls();return;}
 var exam=e.target.closest('[data-exam-answer]');if(exam){await submitExamAnswer(Number(exam.dataset.examAnswer));return;}
 var filter=e.target.closest('[data-filter]');if(filter){s.filter=filter.dataset.filter;s.catalogLimit=9;render();return;}
 if(s.profile?.role==='admin'){
  var admin=e.target.closest('[data-reset-user],[data-active-user],[data-delete-user]');
  if(admin){await adminAction('',admin);return;}
 }
 if(sidebar.classList.contains('open')&&!e.target.closest('#sidebar')){sidebar.classList.remove('open');syncBackdrop();}
});
document.addEventListener('keydown',function(e){
 if((e.key==='Enter'||e.key===' ')&&e.target.matches('.lesson-card[data-go]')){e.preventDefault();go(e.target.dataset.go);}
 if(e.key==='Escape'){sidebar.classList.remove('open');syncBackdrop();}
});
document.addEventListener('input',function(e){
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
 if(e.target.id==='video-check'){s.videoChecked=e.target.checked;updateLessonControls();return;}
 if(e.target.hasAttribute('data-pref')){setPreference(e.target.dataset.pref,e.target.checked);return;}
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
  if(mode==='first-password'){await finishPassword(fd,button);return;}
  if(mode==='set-username'){
   var chosen=String(fd.get('username')||'').trim();
   if(!/^[A-Za-z][A-Za-z0-9_]{2,23}$/.test(chosen))throw Error('Benutzername: 3-24 Zeichen, Buchstaben, Zahlen und Unterstrich.');
   var result=await api.rpc('academy_set_username',{p_username:chosen});
   if(result.error)throw result.error;
   s.profile.username=result.data||chosen.toLowerCase();
   notice('Benutzername aktiviert. Beide Anmeldearten funktionieren jetzt.');render();
  }
  if(mode==='profile'){
   var name=String(fd.get('display_name')||'').trim();if(name.length<2||name.length>40)throw Error('Anzeigename: 2–40 Zeichen.');
   var r=await api.from('academy_profiles').update({display_name:name}).eq('id',s.user.id);if(r.error)throw r.error;s.profile.display_name=name;notice('Profil gespeichert.');render();
  }
  if(mode==='password'){
   var password=String(fd.get('password')||'');if(password.length<14)throw Error('Bitte mindestens 14 Zeichen verwenden.');
   var p=await api.auth.updateUser({password:password});if(p.error)throw p.error;notice('Passwort aktualisiert.');form.reset();
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
 document.head.insertAdjacentHTML('beforeend','<style>.is-auth .sidebar,.is-auth .bottom-nav{display:none}.is-auth .topbar{background:#0d0a19}.is-auth .content{max-width:1100px}.is-auth .app-column{width:100%}</style>');
 if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey){content.innerHTML='<div class="auth-layout panel"><h2>Verbindung nicht verfügbar</h2><p>Supabase konnte nicht geladen werden. Bitte lade die Seite erneut oder überprüfe deine Verbindung.</p></div>';return;}
 try{api=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});await boot();}
 catch(err){content.innerHTML='<div class="auth-layout panel"><h2>Academy nicht erreichbar</h2><p class="muted">'+esc(formatError(err))+'</p><button class="btn" onclick="location.reload()">Erneut versuchen</button></div>';}
}
init();
})();
