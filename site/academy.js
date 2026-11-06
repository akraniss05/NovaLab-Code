/* LiveryLab Academy v10 — course-first learning platform.
 * Made with 💙 from NyxAtheris (LiveryLab Studios)
 * The footer attribution remains visible; open-source code itself cannot be made tamper-proof.
 * No browser-side administrator secrets. Supabase Auth + RLS enforce access server-side.
 */
(function(){
'use strict';
var cfg=window.LL_CONFIG||{}, $=function(q,root){return (root||document).querySelector(q);};
var content=$('#content'), sidebar=$('#sidebar'), bottom=$('#bottom-nav'), toastNode=$('#toast');
var api=null, s={user:null,profile:null,tier:'free',ready:false,courses:[],lessons:[],progress:{done:[],watched:[],exams:{}},route:'home',filter:'Alle',search:'',lesson:null,choice:null,videoChecked:false,videoLoaded:false,exam:null,members:[],memberPlans:{},adminPage:1};
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
 content.innerHTML='<div class="auth-layout"><section class="auth-card"><div class="brandmark"><span class="logo-mark">&lt;/&gt;</span><span>LiveryLab <span class="gradient">Academy</span></span></div><span class="eyebrow">[ 01 ] PRIVATE LERNPLATTFORM</span><h1>Wissen. Code.<br><span class="gradient">Dein nächstes Level.</span></h1><p class="lede">Melde dich mit deinem Benutzernamen und Passwort an. Neue Accounts werden ausschließlich durch das LiveryLab-Team erstellt.</p><form data-form="login"><div class="form-group"><label class="form-label" for="username">Benutzername</label><input class="input" id="username" name="username" autocomplete="username" required minlength="3" maxlength="254" placeholder="Dein Benutzername"></div><div class="form-group"><label class="form-label" for="password">Passwort</label><input class="input" type="password" id="password" name="password" autocomplete="current-password" required placeholder="Dein Passwort"></div><button class="btn primary block" type="submit">Anmelden →</button></form><p class="micro">Noch kein Konto? Adde <strong>nyxatheris</strong> auf Discord, wenn du die Academy testen oder nutzen möchtest.</p><a class="btn discord block discord-block" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">◈ Direkt zum LiveryLab Discord</a><p class="smallprint" style="text-align:center;margin-top:19px">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></section></div>';
}
async function signIn(fd,button){
 var username=String(fd.get('username')||'').trim().toLowerCase();
 var password=String(fd.get('password')||'');
 if(!/^[a-z][a-z0-9_]{2,23}$/.test(username)&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)){notice('Bitte einen gültigen Benutzernamen eingeben.');return;}
 var email=username.includes('@')?username:username+'@accounts.livery-lab.app';
 if(button){button.disabled=true;button.textContent='Anmeldung prüfen …';}
 try{var res=await api.auth.signInWithPassword({email:email,password:password});if(res.error)throw res.error;await boot();}
 catch(e){notice('Anmeldung fehlgeschlagen. Prüfe Benutzername und Passwort.');if(button){button.disabled=false;button.textContent='Anmelden →';}}
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
 s.progress={done:Array.isArray(data.done)?data.done:[],watched:Array.isArray(data.watched)?data.watched:[],exams:data.exams||{}};
 s.ready=true;frame();await navigateCurrent();
}
async function logout(){try{await api.auth.signOut();}catch(e){}s.ready=false;s.user=null;s.profile=null;s.lesson=null;s.courses=[];s.lessons=[];location.hash='#home';login();}
async function saveProgress(){
 var res=await api.from('academy_progress').upsert({user_id:s.user.id,key:'liverylab-v10',payload:s.progress,updated_at:new Date().toISOString()},{onConflict:'user_id,key'});
 if(res.error)throw res.error;frame();
}
function go(path){var h='#'+path;if(location.hash===h){navigateCurrent();}else{location.hash=h;}sidebar.classList.remove('open');}
function parseRoute(){var raw=decodeURIComponent((location.hash||'#home').replace(/^#/,'')).split('/');return {page:raw[0]||'home',id:raw[1]||''};}
async function navigateCurrent(){
 if(!s.ready)return;
 var route=parseRoute();s.route=route.page;
 if(route.page==='lesson'){
   s.choice=null;s.videoChecked=watchedIds().has(route.id);s.videoLoaded=false;s.lesson=null;
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
 var lessons=lessonsOf(c.id),done=countDone(c.id),first=lessons[0],firstTier=first?.required_plan||'free';
 return '<article class="course-card"><div class="course-head"><span class="course-icon">'+esc(c.icon||'⌘')+'</span>'+badge(firstTier)+'</div><div><span class="micro">'+esc(c.category)+' · '+levelText(c.level)+'</span><h3>'+esc(c.name)+'</h3></div><p>'+lessons.length+' verständliche Lektionen, Übungen, Lernvideos und Wissenstests.</p><div class="progress" aria-label="'+pct(done,lessons.length)+' Prozent abgeschlossen"><span style="width:'+pct(done,lessons.length)+'%"></span></div><div class="meta-line"><span>'+done+'/'+lessons.length+' erledigt</span><span>'+pct(done,lessons.length)+'%</span></div><button class="btn block" type="button" data-go="track/'+esc(c.id)+'">'+(done?'Fortsetzen →':'Kurs ansehen →')+'</button></article>';
}
function homePage(){
 var next=s.lessons.find(function(l){return !doneIds().has(l.id)&&allowed(l)&&['coding-basics','lua','python','javascript','html','blender-fundamentals'].includes(l.course_id);})||s.lessons.find(function(l){return !doneIds().has(l.id)&&allowed(l);});
 var c=next?courseOf(next.course_id):null;
 var recommended=['coding-basics','lua','python','javascript','html','blender-fundamentals','fivem'].map(courseOf).filter(Boolean);
 return '<section class="hero"><div class="hero-content"><span class="eyebrow">[ 00 ] LERNPLATTFORM · CODING & 3D</span><h1>Dein Weg vom <span class="gradient">Anfänger</span> zum Developer.</h1><p class="lede">Lerne Lua, JavaScript, Python, HTML, C#, C++, FiveM-Scripting, Blender und viele weitere Technologien. Mit verständlichen Schritt-für-Schritt-Lektionen, Videotutorials, Praxis und Quiz – ohne komplizierte Editoren.</p><div class="hero-actions"><button class="btn primary" data-go="courses">Alle Kurse entdecken →</button><button class="btn" data-go="plans">Free · Plus · Pro</button></div></div></section>'+stats()+
 (next?'<section class="section"><div class="section-heading"><div><span class="eyebrow">WEITERLERNEN</span><h2>Deine nächste Lektion</h2></div></div><div class="next-lesson"><span class="eyebrow">'+esc(c?.name||'Kurs')+' · '+esc(next.chapter)+'</span><h3>'+esc(next.title)+'</h3><p>'+esc(next.summary)+'</p><button class="btn primary" data-go="lesson/'+esc(next.id)+'">Jetzt lernen →</button></div></section>':'')+
 '<section class="section"><div class="section-heading"><div><span class="eyebrow">DEIN START</span><h2>Beliebte Lernpfade</h2><p>Finde den richtigen Einstieg – von Grundlagen bis zum echten Projekt.</p></div><a href="#courses">Alle '+s.courses.length+' Kurse ansehen ↗</a></div><div class="course-grid">'+recommended.map(courseCard).join('')+'</div></section>'+
 '<section class="section panel"><span class="eyebrow">COMMUNITY</span><h2>Zusammen besser werden.</h2><p class="muted">Du möchtest LiveryLab testen oder brauchst einen Zugang? Kontaktiere <strong>nyxatheris</strong> auf Discord.</p><a class="btn discord" href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">LiveryLab Discord öffnen</a></section>';
}
function filteredCourses(){
 return s.courses.filter(function(c){return (s.filter==='Alle'||c.category===s.filter)&&(!s.search||(c.name+' '+c.category).toLowerCase().includes(s.search.toLowerCase()));}).sort(function(a,b){var aP=['coding-basics','lua','python','javascript','html','css','blender-fundamentals','fivem'].indexOf(a.id),bP=['coding-basics','lua','python','javascript','html','css','blender-fundamentals','fivem'].indexOf(b.id);if(aP>=0||bP>=0)return (aP<0?99:aP)-(bP<0?99:bP);return a.name.localeCompare(b.name,'de');});
}
function coursesPage(){
 var cats=['Alle'].concat(Array.from(new Set(s.courses.map(function(c){return c.category;}))).sort());
 return '<section><span class="eyebrow">[ 01 ] LERNBIBLIOTHEK</span><h1>Wähle dein <span class="gradient">nächstes Skill.</span></h1><p class="lede">Alle Lernpfade auf einen Blick. Grundlagen sind kostenlos; weiterführende Lektionen werden durch Plus oder Pro freigeschaltet.</p></section><section class="section"><div class="controls"><input class="input searchbar" id="course-search" type="search" placeholder="🔎  Sprache, Framework oder Tool suchen …" value="'+esc(s.search)+'" aria-label="Kurse durchsuchen"><div class="pillset">'+cats.map(function(c){return '<button class="pill'+(s.filter===c?' active':'')+'" data-filter="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</div></div><div class="section-heading"><div><h2>Alle Kurse</h2><p id="course-count">'+filteredCourses().length+' passende Lernpfade</p></div></div><div id="catalog-list" class="course-grid">'+(filteredCourses().map(courseCard).join('')||'<div class="empty">Keine passenden Kurse gefunden.</div>')+'</div></section>';
}
function trackPage(id){
 var c=courseOf(id);if(!c)return notFound();
 var all=lessonsOf(id),d=countDone(id),next=all.find(function(l){return !doneIds().has(l.id)&&allowed(l);}),group=[];
 all.forEach(function(l){var last=group[group.length-1];if(!last||last.name!==l.chapter)group.push({name:l.chapter,items:[l]});else last.items.push(l);});
 var html='<a class="back" href="#courses">← Alle Kurse</a><section class="track-top"><span class="eyebrow">[ 00 ] LERNPFAD · '+all.length+' LEKTIONEN</span><h1>'+esc(c.name)+' <span class="gradient">lernen.</span></h1><p class="lede">Starte bei den Grundlagen und baue Wissen Schritt für Schritt auf. Jede Lektion enthält Theorie, ein Praxisbeispiel, ein Video oder einen gezielten Tutorial-Link und einen Wissenstest.</p></section>'+
 '<div class="stats-grid"><div class="stat-card"><strong>'+d+'/'+all.length+'</strong><small>Lektionen</small></div><div class="stat-card"><strong>'+d*30+'</strong><small>XP im Kurs</small></div><div class="stat-card"><strong>'+pct(d,all.length)+'%</strong><small>Fortschritt</small></div><div class="stat-card"><strong>'+((s.progress.exams||{})[c.id]?'✓':'—')+'</strong><small>Prüfung</small></div></div>';
 if(next)html+='<div class="next-lesson"><span class="eyebrow">NÄCHSTE LEKTION</span><h3>'+esc(next.title)+'</h3><p>'+esc(next.summary)+'</p><button class="btn primary" data-go="lesson/'+esc(next.id)+'">Jetzt starten →</button></div>';
 group.forEach(function(g,gi){html+='<div class="chapter-title">[ '+String(gi+1).padStart(2,'0')+' ] '+esc(g.name)+'</div><div class="lesson-list">'+g.items.map(function(l,i){var finished=doneIds().has(l.id),grant=allowed(l);return '<article class="lesson-card '+(grant?'clickable':'locked')+'" tabindex="0" role="link" data-go="lesson/'+esc(l.id)+'"><small>'+String(l.position%100||l.position).padStart(2,'0')+'</small><div><h3>'+esc(l.title)+'</h3><p>'+esc(l.summary)+'</p><div class="tag-bottom">'+safeNumber(l.minutes)+' Min · Video + Übung + Quiz · '+(grant?'Freigeschaltet':tierLabel(l.required_plan)+' erforderlich')+'</div></div><span class="status-dot '+(finished?'done':'')+'">'+(finished?'✓':grant?'':'🔒')+'</span></article>';}).join('')+'</div>';});
 html+='<section class="section"><div class="panel"><span class="eyebrow">ABSCHLUSS</span><h2>Deine Prüfung</h2><p class="muted">Nach allen Lektionen: 10 zufällig ausgewählte Fragen. Bestanden ab 80 %.</p><button class="btn primary" data-go="exam/'+esc(id)+'" '+(d!==all.length?'disabled':'')+'>Prüfung '+(d===all.length?'starten →':'noch gesperrt')+'</button></div></section>';
 return html;
}
function notFound(){return '<div class="empty"><h2>Inhalt nicht gefunden</h2><p>Dieser Lernpfad ist nicht verfügbar.</p><button class="btn" data-go="courses">Zur Kursbibliothek</button></div>';}
function lessonPage(id){
 var l=s.lessons.find(function(x){return x.id===id;});if(!l)return notFound();var c=courseOf(l.course_id),index=lessonsOf(l.course_id).findIndex(function(x){return x.id===id;});
 var back='<a class="back" href="#track/'+esc(l.course_id)+'">← '+esc(c?.name||'Lernpfad')+'</a>';
 if(!allowed(l))return back+'<section class="panel locked-panel"><div class="lock-icon">🔒</div><span class="eyebrow">GESCHÜTZTE LEKTION</span><h1>'+esc(l.title)+'</h1><p class="lede" style="margin:auto">'+esc(l.summary)+'</p><p>Diese Lektion benötigt <strong>'+tierLabel(l.required_plan)+'</strong>. Nur allgemeine Grundlagen sind kostenlos freigegeben.</p><div class="hero-actions" style="justify-content:center"><button class="btn primary" data-go="plans">Freischaltungen ansehen</button><a class="btn discord" target="_blank" rel="noopener noreferrer" href="https://discord.gg/livery-lab">Discord kontaktieren</a></div></section>';
 if(!s.lesson)return back+'<div class="empty">Der geschützte Lerninhalt konnte gerade nicht abgerufen werden. Lade die Seite erneut.</div>';
 var p=s.lesson.payload||{},video=s.lesson.video_id,correct=Number(p.correct)||0,options=Array.isArray(p.options)?p.options:[],finished=doneIds().has(id);
 var next=lessonsOf(l.course_id)[index+1];
 var url=video&&/^[a-zA-Z0-9_-]{11}$/.test(video)?'https://www.youtube.com/watch?v='+video:null;
 var search='https://www.youtube.com/results?search_query='+encodeURIComponent(c.name+' '+l.title+' Tutorial deutsch');
 return '<article class="lesson-article">'+back+'<header><span class="eyebrow">[ '+String(index+1).padStart(2,'0')+' / '+lessonsOf(l.course_id).length+' ] '+esc(l.chapter)+' · '+tierLabel(l.required_plan)+'</span><h1>'+esc(l.title)+'</h1><p>'+esc(p.goal||l.summary)+'</p><div class="chips"><span class="chip">'+l.minutes+' Minuten</span><span class="chip">'+(finished?'✓ Abgeschlossen':'30 XP nach Quiz')+'</span></div></header>'+
 '<section class="step-box"><span class="eyebrow">01 / VERSTEHEN</span><h2>Einfach erklärt.</h2><p>'+esc(p.theory||l.summary)+'</p>'+(Array.isArray(p.keyPoints)?'<ul>'+p.keyPoints.map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul>':'')+(p.mistake?'<div class="note"><strong>Typischer Fehler:</strong> '+esc(p.mistake)+'</div>':'')+'</section>'+
 '<section class="step-box"><span class="eyebrow">02 / BEISPIEL</span><h2>Sieh es im Code.</h2>'+(p.example?'<div class="codebox"><pre><code>'+esc(p.example)+'</code></pre></div>':'<p class="muted">Wende das Thema direkt in deiner eigenen Entwicklungsumgebung an.</p>')+(p.resource?'<a href="'+safeLink(p.resource)+'" target="_blank" rel="noopener noreferrer">Offizielle Dokumentation öffnen ↗</a>':'')+'</section>'+
 '<section class="step-box"><span class="eyebrow">03 / VIDEO · PFLICHT</span><h2>Lernen mit Video.</h2><p class="muted">Sieh das zugehörige Tutorial aufmerksam an. Bei längeren Komplettkursen konzentriere dich auf das Kapitel, das zu dieser Lektion passt.</p>'+
 (url?'<div class="video-frame" id="video-frame"><div class="video-placeholder"><div class="play">▶</div><strong>Video-Tutorial</strong><button type="button" class="btn primary" data-action="load-video">Video hier laden</button><small>Externer YouTube-Inhalt wird erst nach Klick geladen.</small></div></div><p class="micro" style="margin-top:10px"><a href="'+url+'" rel="noopener noreferrer" target="_blank">Video direkt auf YouTube öffnen ↗</a></p>':
 '<div class="note"><strong>Gezielte Videosuche:</strong> Für dieses Spezialthema ist noch kein verifiziertes einzelnes Video hinterlegt. Suche ein passendes Tutorial und bearbeite es vor dem Quiz.</div><a class="btn" href="'+search+'" target="_blank" rel="noopener noreferrer">Passendes Tutorial auf YouTube suchen ↗</a>')+
 '<label class="video-check"><input type="checkbox" id="video-check" '+(s.videoChecked?'checked':'')+'><span>Ich habe das passende Video aufmerksam angesehen und die Inhalte nachvollzogen.<br><small class="micro">Selbstbestätigung: Eine tatsächliche Wiedergabe kann diese Website nicht unabhängig prüfen.</small></span></label></section>'+
 '<section class="step-box"><span class="eyebrow">04 / SELBST MACHEN</span><h2>Deine Praxisaufgabe.</h2><p>'+esc(p.task||'Setze das Gelernte in einem eigenen kleinen Beispiel um.')+'</p>'+(p.hint?'<div class="note"><strong>Tipp:</strong> '+esc(p.hint)+'</div>':'')+'<p class="micro">Arbeite in deiner eigenen Software. Diese Academy enthält absichtlich keinen eingebauten Editor.</p></section>'+
 '<section class="step-box" id="quiz-area"><span class="eyebrow">05 / WISSENSTEST</span><h2>Überprüfe dein Wissen.</h2><p>'+esc(p.quiz||'Hast du das Thema verstanden?')+'</p>'+
 options.map(function(option,i){return '<button type="button" class="quiz-choice'+(s.choice===i?' selected':'')+'" data-answer="'+i+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(option)+'</button>';}).join('')+
 '<p id="answer-result" class="micro" aria-live="polite">'+(finished?'✓ Bereits bestanden.':'Wähle die richtige Antwort. Es gibt genau eine korrekte Antwort.')+'</p><button id="mark-lesson" class="btn primary" type="button" data-action="finish-lesson" '+(finished?'disabled':'disabled')+'>'+(finished?'✓ Bestanden · 30 XP':'Lektion abschließen →')+'</button></section>'+
 '<div class="btn-row"><button class="btn" data-go="track/'+esc(l.course_id)+'">← Übersicht</button>'+(next?'<button class="btn" data-go="lesson/'+esc(next.id)+'">Nächste Lektion →</button>':'<button class="btn" data-go="exam/'+esc(l.course_id)+'">Zur Prüfung →</button>')+'</div></article>';
}
function updateLessonControls(){
 var l=s.lessons.find(function(x){return x.id===parseRoute().id;});if(!l||!s.lesson)return;
 var correct=Number(s.lesson.payload?.correct)||0,finished=doneIds().has(l.id),ready=s.videoChecked&&s.choice===correct;
 document.querySelectorAll('[data-answer]').forEach(function(b){var selected=Number(b.dataset.answer)===s.choice;b.classList.toggle('selected',selected);b.classList.toggle('good',selected&&ready);b.classList.toggle('bad',selected&&s.choice!==correct);});
 var btn=$('#mark-lesson');if(btn)btn.disabled=finished||!ready;
 var status=$('#answer-result');if(status&&!finished)status.textContent=s.choice==null?'Wähle eine Antwort.':s.choice!==correct?'Noch nicht richtig. Lies die Erklärung und probiere es erneut.':!s.videoChecked?'Richtig! Bestätige noch das angeschautе Video.':'✓ Richtig! Du kannst die Lektion abschließen.';
}
async function markLesson(){
 var id=parseRoute().id,l=s.lessons.find(function(x){return x.id===id;});
 if(!l||!s.lesson||!allowed(l))return;
 if(!s.videoChecked||s.choice!==Number(s.lesson.payload.correct||0)){notice('Bitte zuerst Video und Quiz abschließen.');return;}
 if(!s.progress.done.includes(id))s.progress.done.push(id);
 if(!s.progress.watched.includes(id))s.progress.watched.push(id);
 try{await saveProgress();notice('Lektion abgeschlossen! +30 XP 🎉');render();}
 catch(e){s.progress.done=s.progress.done.filter(function(x){return x!==id;});notice('Speichern fehlgeschlagen: '+formatError(e));}
}
function plansPage(){
 return '<section><span class="eyebrow">[ + ] MITGLIEDSCHAFT</span><h1>Wissen, das <span class="gradient">mit dir wächst.</span></h1><p class="lede">Alle Stufen behalten. Dein aktueller Plan: <strong>'+esc(plans[s.tier])+'</strong>. Die Zugänge werden vom Academy-Administrator vergeben – keine automatische Zahlung auf dieser Website.</p></section><section class="section plan-grid">'+
 '<article class="plan-card"><span class="chip free">EINSTIEG</span><h3>Free</h3><div class="price">Kostenlos</div><p class="muted">Für deinen ersten Code.</p><ul><li>Allgemeine Grundlagenkurse</li><li>Theorie, ausgewählte Lernvideos & Quiz</li><li>Fortschritt und XP speichern</li><li>Private Anmeldung</li></ul><button class="btn block" disabled>Basiszugang</button></article>'+
 '<article class="plan-card featured"><span class="chip plus">WEITERLERNEN</span><h3>Plus</h3><div class="price">Freischaltung</div><p class="muted">Für fortgeschrittene Grundlagen und echte Projekte.</p><ul><li>Alles aus Free</li><li>Plus-Lektionen und vertiefte Kurse</li><li>Praxisaufgaben & Zertifikatsprüfungen</li><li>Mehr Programmiersprachen</li></ul><a class="btn primary block" href="https://discord.gg/livery-lab" target="_blank" rel="noopener">Plus auf Discord anfragen ↗</a></article>'+
 '<article class="plan-card"><span class="chip pro">VOLLER ZUGRIFF</span><h3>Pro</h3><div class="price">Freischaltung</div><p class="muted">Für alle anspruchsvollen Themen.</p><ul><li>Alles aus Plus</li><li>Alle verfügbaren Pro-Lektionen</li><li>FiveM / Blender Fortgeschritten</li><li>Frei zugängliche Abschlussprüfungen nach Lernfortschritt</li></ul><a class="btn block" href="https://discord.gg/livery-lab" target="_blank" rel="noopener">Pro auf Discord anfragen ↗</a></article></section><div class="note">Keine eingebauten Code-, Music-, Video- oder Blender-Editoren. Die Website ist ausschließlich zum Lernen konzipiert.</div>';
}
function examsPage(){
 var eligible=s.courses.filter(function(c){return lessonsOf(c.id).length>=3;}).sort(function(a,b){return countDone(b.id)-countDone(a.id);});
 return '<section><span class="eyebrow">[ ★ ] ABSCHLUSS</span><h1>Zeig, was du <span class="gradient">gelernt hast.</span></h1><p class="lede">Nach Abschluss aller Lektionen eines Kurses kannst du eine Prüfung mit bis zu zehn zufälligen Fragen ablegen. Du bestehst ab 80 %.</p></section><section class="section"><div class="course-grid">'+eligible.map(function(c){var n=lessonsOf(c.id).length,done=countDone(c.id),best=(s.progress.exams||{})[c.id];return '<article class="course-card"><div class="course-head"><span class="course-icon">'+esc(c.icon)+'</span><span class="chip '+(best?'free':'')+'">'+(best?'✓ Bestanden':'Prüfung')+'</span></div><h3>'+esc(c.name)+'</h3><p>'+done+'/'+n+' Lektionen abgeschlossen</p><div class="progress"><span style="width:'+pct(done,n)+'%"></span></div><button class="btn block" data-go="exam/'+esc(c.id)+'" '+(done!==n?'disabled':'')+'>'+(best?'Prüfung wiederholen':'Zur Prüfung')+'</button></article>';}).join('')+'</div></section>';
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
 return '<section><span class="eyebrow">[ ◉ ] MEIN PROFIL</span><h1>Dein <span class="gradient">Account.</span></h1><p class="lede">Verwalte deinen Anzeigenamen, dein Passwort und deine Sicherheit.</p></section><section class="section account-layout"><div class="panel"><h3>Profil bearbeiten</h3><p class="muted">Benutzername: <strong>'+esc(s.profile.username||'Admin-Konto')+'</strong><br>Plan: '+esc(plans[s.tier])+' · '+(s.progress.done||[]).length*30+' XP</p><form data-form="profile"><div class="form-group"><label class="form-label">Anzeigename</label><input class="input" name="display_name" value="'+esc(s.profile.display_name)+'" minlength="2" maxlength="40" required></div><button class="btn primary" type="submit">Änderungen speichern</button></form></div><div class="panel"><h3>Passwort ändern</h3><form data-form="password"><div class="form-group"><label class="form-label">Neues Passwort</label><input class="input" type="password" name="password" minlength="14" autocomplete="new-password" required placeholder="Mindestens 14 Zeichen"></div><button class="btn" type="submit">Passwort aktualisieren</button></form><button type="button" class="btn ghost" data-action="logout" style="margin-top:12px">Abmelden</button></div></section><section class="section panel"><h2>Zwei-Faktor-Authentifizierung</h2><div id="mfa-settings"></div></section>';
}
function settingsPage(){
 return '<section><span class="eyebrow">[ ⚙ ] EINSTELLUNGEN</span><h1>Sicher lernen. <span class="gradient">Einfach bleiben.</span></h1><p class="lede">Diese Academy ist bewusst dunkel und übersichtlich gestaltet wie ein natives Lern-Dashboard.</p></section><section class="section account-layout"><div class="panel"><h3>Sicherheit & 2FA</h3><div id="mfa-settings"></div></div><div class="panel"><h3>Konto & Community</h3><p class="muted">Anmeldung über Benutzername und Passwort. Ein Konto kann nur ein Administrator erstellen.</p><a class="btn discord block" target="_blank" rel="noopener noreferrer" href="https://discord.gg/livery-lab">Zum LiveryLab Discord ↗</a><button class="btn ghost block" type="button" style="margin-top:10px" data-action="logout">Abmelden</button><p class="smallprint" style="margin-top:16px">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></div></section>';
}
async function renderMFA(){if(!s.ready)return;var node=$('#mfa-settings');if(node&&window.LLMFA){try{await window.LLMFA.renderSettings(node,api);}catch(e){node.textContent='Authenticator konnte nicht geladen werden.';}}}
function adminPage(){
 if(s.profile?.role!=='admin')return '<section class="locked-panel"><h2>Nur für Administratoren.</h2></section>';
 var rows=(s.members||[]).map(function(u){var tier=s.memberPlans[u.id]||'free';return '<tr><td><strong>'+esc(u.username||'Einladung')+'</strong><br><small class="micro">'+esc(u.role)+'</small></td><td><span class="chip '+(u.active?'free':'pro')+'">'+(u.active?'Aktiv':'Gesperrt')+'</span></td><td><select class="select" data-admin-tier="'+esc(u.id)+'" '+(u.role==='admin'?'disabled':'')+'><option value="free" '+(tier==='free'?'selected':'')+'>Free</option><option value="pro" '+(tier==='pro'?'selected':'')+'>Plus</option><option value="ultimate" '+(tier==='ultimate'?'selected':'')+'>Pro</option></select></td><td><div class="btn-row"><button class="btn small" data-reset-user="'+esc(u.id)+'" '+(u.role==='admin'?'disabled':'')+'>Passwort</button><button class="btn small" data-active-user="'+esc(u.id)+'" data-active-value="'+(!u.active)+'" '+(u.role==='admin'?'disabled':'')+'>'+(u.active?'Sperren':'Aktivieren')+'</button><button class="btn small danger" data-delete-user="'+esc(u.id)+'" '+(u.role==='admin'?'disabled':'')+'>Löschen</button></div></td></tr>';}).join('');
 return '<section><span class="eyebrow">[ ⚙ ] ADMINISTRATOR</span><h1>Academy <span class="gradient">verwalten.</span></h1><p class="lede">Erstelle Benutzerkonten und schalte Free, Plus oder Pro frei. Die Aktionen werden auf dem Supabase-Server überprüft.</p></section><section class="section panel"><h2>Neues Schülerkonto</h2><p class="muted">Nur Benutzername und sicheres Startpasswort. Das Passwort muss beim ersten Login geändert werden.</p><form data-form="create-user"><div class="form-row"><div class="form-group"><label class="form-label">Benutzername</label><input class="input" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" maxlength="24" placeholder="neuer_user" required></div><div class="form-group"><label class="form-label">Vorläufiges Passwort (mind. 14 Zeichen)</label><input class="input" type="password" name="password" minlength="14" autocomplete="new-password" required></div><div class="form-group"><label class="form-label">Start-Tarif</label><select class="select" name="tier"><option value="free">Free</option><option value="pro">Plus</option><option value="ultimate">Pro</option></select></div></div><button type="submit" class="btn primary">Konto anlegen →</button></form></section><section class="section"><div class="section-heading"><div><h2>Benutzerverwaltung</h2><p>Accounts freischalten, zurücksetzen und sperren.</p></div><button class="btn small" data-action="refresh-admin">Aktualisieren</button></div><div class="tablewrap"><table class="account-table"><thead><tr><th>Nutzer</th><th>Status</th><th>Mitgliedschaft</th><th>Aktionen</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="btn-row" style="margin-top:18px"><button class="btn small" data-action="admin-prev" '+(s.adminPage===1?'disabled':'')+'>← Vorherige</button><span class="micro" style="align-self:center">Seite '+s.adminPage+'</span><button class="btn small" data-action="admin-next" '+(s.members.length<100?'disabled':'')+'>Nächste →</button></div></section>';
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
 var link=e.target.closest('[data-go]');if(link){e.preventDefault();go(link.dataset.go);return;}
 var action=e.target.closest('[data-action]');
 if(action){
  var a=action.dataset.action;
  if(a==='logout'){await logout();return;}
  if(a==='refresh-admin'||a==='admin-prev'||a==='admin-next'){await adminAction(a,action);return;}
  if(a==='load-video'){
   var video=s.lesson?.video_id;if(!/^[a-zA-Z0-9_-]{11}$/.test(String(video||'')))return;
   var frame=$('#video-frame');if(frame){var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+video+'?rel=0&start='+Math.max(0,safeNumber(s.lesson.video_start));f.title='Lernvideo von YouTube';f.loading='lazy';f.allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';f.allowFullscreen=true;frame.replaceChildren(f);s.videoLoaded=true;}return;
  }
  if(a==='finish-lesson'){await markLesson();return;}
  if(a==='restart-exam'){await loadExam(parseRoute().id);render();return;}
 }
 var answer=e.target.closest('[data-answer]');if(answer){s.choice=Number(answer.dataset.answer);updateLessonControls();return;}
 var exam=e.target.closest('[data-exam-answer]');if(exam){await submitExamAnswer(Number(exam.dataset.examAnswer));return;}
 var filter=e.target.closest('[data-filter]');if(filter){s.filter=filter.dataset.filter;render();return;}
 if(s.profile?.role==='admin'){
  var admin=e.target.closest('[data-reset-user],[data-active-user],[data-delete-user]');
  if(admin){await adminAction('',admin);return;}
 }
 if(e.target.id==='menu-toggle'){sidebar.classList.toggle('open');return;}
 if(sidebar.classList.contains('open')&&!e.target.closest('#sidebar'))sidebar.classList.remove('open');
});
document.addEventListener('keydown',function(e){
 if((e.key==='Enter'||e.key===' ')&&e.target.matches('.lesson-card[data-go]')){e.preventDefault();go(e.target.dataset.go);}
 if(e.key==='Escape')sidebar.classList.remove('open');
});
document.addEventListener('input',function(e){
 if(e.target.id==='course-search'){s.search=e.target.value;var list=$('#catalog-list'),count=$('#course-count');if(list)list.innerHTML=filteredCourses().map(courseCard).join('')||'<div class="empty">Keine passenden Kurse gefunden.</div>';if(count)count.textContent=filteredCourses().length+' passende Lernpfade';}
});
document.addEventListener('change',async function(e){
 if(e.target.id==='video-check'){s.videoChecked=e.target.checked;updateLessonControls();return;}
 if(e.target.hasAttribute('data-admin-tier')){
  var select=e.target,old=s.memberPlans[select.dataset.adminTier]||'free';
  try{await updateTier(select.dataset.adminTier,select.value);}catch(err){select.value=old;notice(formatError(err));}
 }
});
document.addEventListener('submit',async function(e){
 var form=e.target.closest('form[data-form]');if(!form)return;e.preventDefault();
 var fd=new FormData(form),button=$('button[type="submit"]',form),mode=form.dataset.form;
 if(!button)return;button.disabled=true;
 try{
  if(mode==='login'){await signIn(fd,button);return;}
  if(mode==='first-password'){await finishPassword(fd,button);return;}
  if(mode==='profile'){
   var name=String(fd.get('display_name')||'').trim();if(name.length<2||name.length>40)throw Error('Anzeigename: 2–40 Zeichen.');
   var r=await api.from('academy_profiles').update({display_name:name}).eq('id',s.user.id);if(r.error)throw r.error;s.profile.display_name=name;notice('Profil gespeichert.');render();
  }
  if(mode==='password'){
   var password=String(fd.get('password')||'');if(password.length<14)throw Error('Bitte mindestens 14 Zeichen verwenden.');
   var p=await api.auth.updateUser({password:password});if(p.error)throw p.error;notice('Passwort aktualisiert.');form.reset();
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
 document.head.insertAdjacentHTML('beforeend','<style>.is-auth .sidebar,.is-auth .bottom-nav{display:none}.is-auth .topbar{background:#0d0a19}.is-auth .content{max-width:1100px}.is-auth .app-column{width:100%}</style>');
 if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey){content.innerHTML='<div class="auth-layout panel"><h2>Verbindung nicht verfügbar</h2><p>Supabase konnte nicht geladen werden. Bitte lade die Seite erneut oder überprüfe deine Verbindung.</p></div>';return;}
 try{api=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});await boot();}
 catch(err){content.innerHTML='<div class="auth-layout panel"><h2>Academy nicht erreichbar</h2><p class="muted">'+esc(formatError(err))+'</p><button class="btn" onclick="location.reload()">Erneut versuchen</button></div>';}
}
init();
})();
