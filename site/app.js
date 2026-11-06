
/* LiveryLab Developer Academy 2.0
 * Made with 💙 from NyxAtheris (LiveryLab Studios)
 * Copyright notice is informational; no security is claimed for this signature.
 * The static lesson content is public on GitHub Pages; never put secret keys in this file.
 */
(()=>{'use strict';
const $=(q)=>document.querySelector(q), content=$('#content');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unescapeHTML=s=>s; // source text remains escaped in HTML and textarea values
const btn=(label,action,kind='secondary',extra='')=>`<button class="btn ${kind}" data-act="${action}" ${extra}>${label}</button>`;
const badge=c=>`<span class="difficulty" data-level="${esc(c.level==='advanced'?'advanced':c.level==='expert'?'expert':'beginner')}">${({beginner:'Anfänger',intermediate:'Mittelstufe',advanced:'Fortgeschritten',expert:'Profi'})[c.level]||'Alle Stufen'}</span>`;
const defaultProjects=()=>[
 {id:'p-lua',name:'Lua Playground',lang:'lua',file:'main.lua',files:{'main.lua':'-- Made with 💙 from NyxAtheris (LiveryLab Studios)\nlocal name = "LiveryLab"\nprint("Willkommen bei " .. name)\nfor i = 1, 3 do\n  print("Level " .. i)\nend'}},
 {id:'p-ui',name:'Web UI Showcase',lang:'html',file:'index.html',files:{'index.html':'<!doctype html>\n<html lang="de"><head><meta charset="utf-8"/><style>body{font-family:system-ui;background:#171024;color:white;padding:25px}.card{padding:24px;border-radius:16px;background:#2d1d42;border:1px solid #9142e2}button{background:#a749f7;border:0;border-radius:10px;color:white;padding:12px}</style></head><body><div class="card"><h1>LiveryLab UI</h1><p>Deine eigene FiveM-UI beginnt hier.</p><button onclick="document.querySelector(\'p\').textContent=\'Das funktioniert!\'">Testen</button></div></body></html>'}},
 {id:'p-js',name:'JavaScript Lab',lang:'javascript',file:'main.js',files:{'main.js':'// Made with 💙 from NyxAtheris (LiveryLab Studios)\nconst player = { name: "Alex", level: 2 };\nconsole.log("Hallo", player.name);\nconsole.log("Nächstes Level:", player.level + 1);'}}
];
const baseState=()=>({completed:{},quizzes:{},bookmarks:{},videoDone:{},taskPassed:{},taskNotes:{},courseExams:{},notes:{},lessonCode:{},xpExtra:0,history:{},projects:defaultProjects(),projectId:'p-lua',recent:[],flashKnown:{},profileName:'Developer',theme:'purple',storageEnabled:true,cloudEnabled:true,_updatedAt:0});
const storageKey=(uid)=>uid?'llacademy2:user:'+uid:'llacademy2:guest';
const normalizeState=(candidate)=>{const d=baseState(),s=candidate&&typeof candidate==='object'&&!Array.isArray(candidate)?candidate:{};for(const k of ['completed','quizzes','bookmarks','videoDone','taskPassed','taskNotes','courseExams','notes','lessonCode','history','flashKnown']){if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))d[k]=s[k]}if(Array.isArray(s.projects)&&s.projects.length&&s.projects.length<151)d.projects=s.projects.filter(p=>p&&typeof p==='object'&&p.files&&typeof p.files==='object');if(!d.projects.length)d.projects=defaultProjects();if(Array.isArray(s.recent))d.recent=s.recent.slice(0,12);if(typeof s.projectId==='string')d.projectId=s.projectId;if(typeof s.profileName==='string')d.profileName=s.profileName.slice(0,40);if(s.storageEnabled===false)d.storageEnabled=false;if(s.cloudEnabled===false)d.cloudEnabled=false;if(typeof s._updatedAt==='number')d._updatedAt=s._updatedAt;d.xpExtra=Math.max(0,Number(s.xpExtra)||0);return d};
const loadState=(uid=null)=>{try{const raw=localStorage.getItem(storageKey(uid))||(!uid?localStorage.getItem('llacademy2'):null);return normalizeState(raw?JSON.parse(raw):null)}catch(e){return baseState()}};
let currentOwner=null,state=loadState();
function switchOwner(uid){const id=uid||null;if(currentOwner===id)return;currentOwner=id;window.LLShell?.ownerChanged?.(id);state=loadState(id);render()}
function rememberLogin(){try{return localStorage.getItem('llacademy-remember-session')==='yes'}catch(e){return false}}
function setRememberLogin(remember){try{if(remember)localStorage.setItem('llacademy-remember-session','yes');else localStorage.removeItem('llacademy-remember-session')}catch(e){}}

let data=null;let courses=[],allLessons=[],lookup={},courseLookup={},view='home',courseId='lua',lessonId='lua-01',chapterOpen={},catFilter='Alle',qSearch='',levelFilter='all',game='menu',examSession=null,quizIndex=0,quizOrder=[],quizScore=0,flashIndex=0,flashFlipped=false,editorOutput='',editorPreview='',lastEditorView='',authClient=null,user=null,profile=null,cloudBusy=false,authStatus='',adminMembers=[],adminMessage='',sessionRole='',sourceSummary='',worldFilter='all',roadmapId='fivem';

/* Load curriculum through RLS only after Supabase verifies an active member. */
async function ensureCourses(){
  if(data?.courses?.length)return;
  const c=await supabaseClient();
  const {data:record,error}=await c.from('academy_curriculum').select('payload').eq('key','main').single();
  if(error)throw Error('Geschützter Kursabruf fehlgeschlagen: '+error.message);
  if(!Array.isArray(record?.payload?.courses)||record.payload.courses.length===0)throw Error('Für dieses Konto sind keine Kurse verfügbar.');
  data={...record.payload,courses:record.payload.courses.filter(c=>!['Musik','Video & Schnitt'].includes(c.category))};
  courses=data.courses;
  courseLookup=Object.fromEntries(courses.map(c=>[c.id,c]));
  allLessons=courses.flatMap(c=>lessonsOf(c));
  lookup=Object.fromEntries(allLessons.map(l=>[l.id,l]));
}
function clearCourses(){data=null;courses=[];courseLookup={};allLessons=[];lookup={}}

function persist(){state._updatedAt=Date.now();try{if(state.storageEnabled!==false)localStorage.setItem(storageKey(currentOwner),JSON.stringify(state));else localStorage.removeItem(storageKey(currentOwner));if(!currentOwner)localStorage.removeItem('llacademy2')}catch(e){toast('Lokaler Speicher voll. Exportiere deinen Fortschritt als Backup.')}if(user&&state.cloudEnabled!==false)syncSoon()}
function toast(s){const el=$('#toast');el.textContent=s;el.classList.add('visible');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('visible'),3400)}
function lessonsOf(c){return c.chapters.flatMap(ch=>ch.lessons)}
function worldOf(c){if(c.category==='Video & Schnitt')return 'video';if(c.category==='Musik')return 'music';if(c.category==='3D & Blender')return 'blender';if(['FiveM','Frameworks'].includes(c.category))return 'fivem';if(c.id==='browsergames')return 'games';return 'coding'}
function artForCourse(c){const w=worldOf(c);return './assets/category-'+({coding:'code',fivem:'fivem',music:'music',blender:'blender',video:'video',games:'games'}[w]||'code')+'.svg'}
function xp(){return Object.keys(state.completed).length*15+Object.keys(state.quizzes).length*5+(state.xpExtra||0)}
function stats(){const done=allLessons.filter(l=>state.completed[l.id]).length;return {done,total:allLessons.length,percent:allLessons.length?Math.round(done*100/allLessons.length):0,xp:xp(),bookmarks:allLessons.filter(l=>state.bookmarks[l.id]).length}}
function countFor(c){let done=lessonsOf(c).filter(l=>state.completed[l.id]).length,total=lessonsOf(c).length;return {done,total,pct:Math.round(done/Math.max(1,total)*100)}}
function courseCard(c){const p=countFor(c),img=artForCourse(c);return `<button class="course-card v5-course-card" style="--c:${esc(c.color||'#af5cff')};--card-glow:${esc(c.color||'#af5cff')}" data-course="${esc(c.id)}"><div class="v5-course-cover" style="background-image:url('${img}')"><span class="pill">${esc(c.category)}</span></div><div class="v5-course-body"><span class="eyebrow">${esc(c.level||'Lernen')} · ${c.chapters.length} Kapitel</span><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><div class="course-meta">${p.total} Lektionen <span class="arrow">↗</span></div><div class="progress" style="margin-top:11px"><div class="fill" style="width:${p.pct}%"></div></div><div class="micro" style="margin-top:6px">${p.done}/${p.total} gelernt</div></div></button>`}
function section(title,desc,action=''){return `<div class="section-head"><div><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div>${action||''}</div>`}
function nav(v){if(v==='code-courses'||v==='fivem-courses'||v==='blender-courses'){worldFilter=({'code-courses':'coding','fivem-courses':'fivem','blender-courses':'blender'})[v];catFilter='Alle';qSearch='';v='catalog'}const allowed=['home','catalog','course','lesson','exam','reference','profile','settings','admin','syllabus'];if(!allowed.includes(v))v='catalog';const syllabus=v==='syllabus';view=syllabus?'course':v;history.replaceState(null,'','#'+encodeURIComponent(view));render();if(syllabus){document.querySelector('#ll9-lessons')?.scrollIntoView({behavior:'smooth',block:'start'})}else window.scrollTo({top:0,behavior:'instant'})}
function goCourse(id){if(!courseLookup[id])return;courseId=id;nav('course')}
async function goLesson(id){if(!lookup[id])return;const granted=await window.LLPro.openLesson(id);if(!granted.allowed){toast(granted.reason||'Tageslimit erreicht.');return}lessonId=id;courseId=lookup[id].courseId;state.recent=[id,...(state.recent||[]).filter(x=>x!==id)].slice(0,12);persist();nav('lesson')}
function breadcrumb(t){$('#crumb').textContent=t}
function navActive(){const tab=(['course','lesson','exam','reference'].includes(view))?'catalog':(view==='settings'?'profile':view),drawerTab=(['course','lesson','exam','reference'].includes(view))?'catalog':view;document.querySelectorAll('[data-go]').forEach(n=>{if(n.classList.contains('navitem')||n.closest('.mobile-nav'))n.classList.toggle('active',n.dataset.go===tab);if(n.closest('#ll-menu-overlay')){const active=n.dataset.go===drawerTab;n.classList.toggle('active',active);if(active)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current')}})}
function heroHome(){const s=stats(),latest=state.recent.find(x=>lookup[x]);let latestLesson=latest?lookup[latest]:lookup['lua-01'];return `<section class="hero"><div class="hero-content"><div class="eyebrow">[ LIVERYLAB · DEVELOPER ACADEMY 2.0 ]</div><h1>DEIN WEG ZUM<br><em>DEVELOPER.</em></h1><p>Programmiere. Gestalte. Teste. Lerne über 30 Fachbereiche – komplett in deinem eigenen Tempo, ohne Fristen oder Tagespläne.</p><div class="flex">${btn('↗ Lernbereiche entdecken','catalog','primary')}${btn('▶ Weiterlernen','resume')}</div></div></section><div class="stats"><div class="stat"><strong>${courses.length}</strong><span>Fachbereiche</span></div><div class="stat"><strong>${allLessons.length}</strong><span>Ausführliche Lektionen</span></div><div class="stat"><strong>${s.done}</strong><span>Abgeschlossen</span></div><div class="stat"><strong>${s.xp} ✦</strong><span>Erfahrungspunkte</span></div></div>`}


function home(){
 breadcrumb('Dashboard');
 const recent=(state.recent||[]).filter(id=>lookup[id]).slice(0,3).map(id=>({...lookup[id],courseName:courseLookup[lookup[id].courseId]?.name||'Kurs'}));
 content.innerHTML=window.LL9.dashboard({courses,done:state.completed,stats:stats(),name:profile?.display_name||state.profileName,tier:window.LLPro.tier,recent});
}
function catalog(){
 breadcrumb('Alle Kurse');
 content.innerHTML=window.LL9.catalog({courses,done:state.completed,filter:worldFilter,search:qSearch,lfilter:levelFilter});
}
function course(){
 const c=courseLookup[courseId]||courses[0];if(!c)return nav('catalog');
 courseId=c.id;breadcrumb(c.name);
 content.innerHTML=window.LL9.course(c,{done:state.completed,exams:state.courseExams,last:state.recent});
}
function lesson(){
 const l=lookup[lessonId],c=courseLookup[l?.courseId];if(!l||!c)return nav('catalog');
 breadcrumb(l.title);
 const arr=lessonsOf(c),i=arr.findIndex(x=>x.id===l.id);
 content.innerHTML=window.LL9.learning(l,c,{done:state.completed,videoDone:state.videoDone,taskPassed:state.taskPassed,quizzes:state.quizzes,notes:state.notes,taskNotes:state.taskNotes,index:i,total:arr.length});
 window.LLVideo.attach(document.querySelector('#ll9-video-slot'),l,c);
}
function examView(){
 const c=courseLookup[courseId]||courses[0];if(!c)return nav('catalog');
 breadcrumb('Abschlussprüfung');
 if(!examSession||examSession.course!==c.id){
   examSession={course:c.id,questions:lessonsOf(c).filter(l=>l.quiz&&Array.isArray(l.options)&&l.options.length>1).slice(0,20),index:0,selected:null,answers:[],result:null};
 }
 const correct=examSession.answers.filter((v,i)=>v===examSession.questions[i]?.correct).length;
 content.innerHTML=window.LL9.exam(c,{questions:examSession.questions,index:examSession.index,correct,selected:examSession.selected,result:examSession.result,done:state.completed});
 if(examSession.selected!==null){document.querySelectorAll('[data-exam-option]').forEach(b=>b.classList.toggle('is-chosen',Number(b.dataset.examOption)===examSession.selected))}
}
function referenceView(){
 const c=courseLookup[courseId]||courses[0];if(!c)return nav('catalog');
 breadcrumb('Referenz');
 content.innerHTML=window.LL9.reference(c,{query:''});
}

function completion(id){if(!state.completed[id]){if(!state.videoDone?.[id])return toast('Bitte bestätige zuerst das Pflichtvideo.');const l=lookup[id],c=courseLookup[l?.courseId];if(!state.taskPassed?.[id])return toast('Bearbeite zuerst die praktische Aufgabe und prüfe deine Lösung.');if(!state.quizzes?.[id])return toast('Beantworte die Wissensfrage korrekt.');state.completed[id]=new Date().toISOString();recordActivity();toast('+15 XP · Lektion abgeschlossen!')}else toast('Lektion bereits abgeschlossen');persist();cloudProgress(id);render()}
function recordActivity(){let d=new Date().toLocaleDateString('sv-SE');state.history[d]=(state.history[d]||0)+1}
function profileView(){
 breadcrumb('Mein Profil');const s=stats();
 const name=profile?.display_name||state.profileName||'Mitglied';
 const username=profile?.username;
 const exams=Object.entries(state.courseExams||{}).filter(([id,r])=>courseLookup[id]&&r?.passed);
 content.innerHTML=`<div class="ll9-page ll9-profile">${window.LLShell.profileBanner(name,sessionRole,window.LLPro.tier,s.xp,s.done)}
 <section class="ll9-overview-stats">${['<strong>'+s.done+'</strong><span>LEKTIONEN</span>','<strong>'+s.xp+'</strong><span>XP</span>','<strong>'+exams.length+'</strong><span>PRÜFUNGEN</span>','<strong>'+window.LL9.tier(window.LLPro.tier)+'</strong><span>TARIF</span>'].map(v=>'<div>'+v+'</div>').join('')}</section>
 <section class="ll9-learn-panel"><span class="ll9-kicker">[ 01 ] DEIN PROFIL</span><h2>Benutzername &amp; Lernreise</h2>
 ${username?`<p>Dein Benutzername: <strong>@${esc(username)}</strong></p>`:`<p>Richte deinen Benutzernamen ein, damit du ihn beim nächsten Login verwenden kannst.</p><label class="ll9-field-label">Benutzername</label><div class="ll9-inline-actions"><input id="ll7-username" class="input" maxlength="24" placeholder="Dein Benutzername"><button class="btn primary" data-act="register-username">Registrieren</button></div>`}
 <p>Dein Fortschritt wird deinem bestehenden Konto zugeordnet. Bereits absolvierte Lektionen bleiben gespeichert.</p>
 <div class="ll9-inline-actions"><button class="btn primary" data-go="catalog">Weiterlernen</button><button class="btn" data-go="settings">Konto &amp; Einstellungen</button><button class="btn" data-act="logout">Abmelden</button></div></section>
 <p class="ll9-watermark">Made with 💙 from NyxAtheris (LiveryLab Studios)</p></div>`;
}
function authPanel(){const configured=!!(window.LL_CONFIG?.supabaseUrl&&window.LL_CONFIG?.supabaseAnonKey);if(!configured)return `<div class="callout">🛠️ <b>Cloud-Anmeldung noch nicht eingerichtet.</b><p>Für einen sicheren Mehrbenutzer-Login braucht es ein Supabase-Projekt. Die GitHub-Pages-App und der lokale Gastmodus funktionieren schon. Im README findest du die konkreten Einrichtungsschritte.</p></div>`;
 if(user&&!sessionRole)return `<div class="callout">Deine Anmeldung wurde erkannt, aber dieses Konto ist nicht für die Academy freigeschaltet. Bitte Administrator kontaktieren.</div>${btn('Abmelden','logout')}`;
 if(user)return `<p>✓ Eingeloggt als <b>${esc(user.email)}</b>. ${sessionRole==='admin'?'Administratorrechte aktiv.':'Dein Fortschritt kann mit Supabase synchronisiert werden.'}</p><div class="flex">${btn('↻ Fortschritt synchronisieren','sync-cloud','primary')}${btn('⚙ Kontoeinstellungen','settings')}${btn('Abmelden','logout')}</div><div class="auth-stack" style="margin-top:20px"><h3>Passwort festlegen oder ändern</h3><p class="micro">Bei einer Einladung meldest du dich zunächst über den Link in der E-Mail an. Hier kannst du dir danach ein eigenes Passwort setzen.</p><label>Neues Passwort (mind. 14 Zeichen)<input class="input" id="newPassword" type="password" autocomplete="new-password" minlength="14"></label><label>Passwort wiederholen<input class="input" id="repeatPassword" type="password" autocomplete="new-password"></label>${btn('Passwort speichern','update-password','primary')}</div><p class="micro">Cloud-Synchronisation benötigt Internet und freigeschaltete Datenbanktabellen.</p>`;
 return `<div class="auth-stack"><label>Benutzername oder E-Mail<input class="input" id="loginEmail" type="text" autocomplete="username" placeholder="z. B. MaxDev oder name@email.de"></label><label>Passwort<input class="input" id="loginPass" type="password" autocomplete="current-password" placeholder="Dein Passwort"></label><label class="checkrow"><input type="checkbox" id="rememberLogin" ${rememberLogin()?'checked':''}> Auf diesem Gerät angemeldet bleiben</label><div class="flex">${btn('Anmelden','login','primary')}${btn('Passwort vergessen?','reset-password')}</div><p class="micro">Nur eingeladene Schüler können Konten anlegen. Nach der Einladung kannst du ein Passwort festlegen.</p>${authStatus?`<p class="callout">${esc(authStatus)}</p>`:''}</div>`;
}
function settingsView(){
 breadcrumb('Einstellungen');
 const legacy={
 account:`<div class="ll9-account-settings"><p class="micro">Dein Login läuft über Benutzername und Passwort. Bei einem vergessenen Passwort hilft dir der Administrator über Discord.</p><label class="form-label">Neues Passwort (mindestens 14 Zeichen)<input id="newPassword" class="input" type="password" autocomplete="new-password" minlength="14"></label><label class="form-label">Passwort wiederholen<input id="repeatPassword" class="input" type="password" autocomplete="new-password" minlength="14"></label><div class="ll9-inline-actions"><button class="btn primary" data-act="update-password">Passwort ändern</button><button class="btn" data-act="logout">Abmelden</button></div><p class="micro">Authenticator-App und Zwei-Faktor-Schutz bleiben in der nächsten Einstellungskarte verfügbar.</p></div>`,
 storage:`<p>Dein Lernstand wird über deine Anmeldung synchronisiert. Deine bestehenden Daten und Backups werden nicht gelöscht.</p><div class="ll9-inline-actions"><button class="btn" data-act="export-state">Lernstand exportieren</button><button class="btn" data-act="sync-cloud">Jetzt synchronisieren</button></div>`,
 privacy:`<p>Die Academy benötigt keine Werbetracker. Für YouTube-Videos wird die Verbindung erst nach deinem Klick aufgebaut.</p><a href="https://discord.gg/livery-lab" rel="noopener noreferrer" target="_blank">Fragen? LiveryLab Discord öffnen →</a>`
 };
 window.LLShell.renderSettings(content,{legacy,name:profile?.display_name||state.profileName,email:'',role:sessionRole,tier:window.LLPro?.tier||'free',client:authClient});
}
function loginGate(){breadcrumb('Anmelden');content.innerHTML=`<div class="ll9-login-wrap"><section class="ll9-login">
 <span class="ll9-kicker">[ LIVERYLAB ] PRIVATE LERN-AKADEMIE</span><h1>Willkommen bei <em>LiveryLab.</em></h1>
 <p>Lerne Coding, FiveM und Blender in aufeinander aufbauenden Lektionen. Dein Zugang wird von der Administration freigegeben.</p>
 <div class="ll9-login-fields"><label for="loginEmail">Benutzername</label><input id="loginEmail" type="text" class="input" autocomplete="username" placeholder="Dein Benutzername" spellcheck="false" maxlength="80">
 <label for="loginPass">Passwort</label><input id="loginPass" type="password" class="input" autocomplete="current-password" placeholder="Dein Passwort"></div>
 <button class="btn primary ll9-login-submit" data-act="login">Anmelden →</button>
 ${authStatus?`<p class="ll9-login-error" role="alert">${esc(authStatus)}</p>`:''}
 <div class="ll9-login-invite"><strong>Du hast noch keinen Zugang?</strong><p>Adde <b>nyxatheris</b> auf Discord, wenn du das Projekt testen oder nutzen möchtest. Alternativ kannst du unserem Discord direkt beitreten.</p><a href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer" class="ll9-discord-btn">Discord beitreten ↗</a></div>
 <small class="ll9-login-watermark">Made with 💙 from NyxAtheris (LiveryLab Studios)</small>
 </section></div>`}
function practice(){breadcrumb('Üben & Spielen');content.innerHTML=`<div class="eyebrow">TRAINING CENTER</div><h1>Üben macht <span style="color:#c45eff">den Unterschied.</span></h1><p class="text-muted">Spielerisch lernen, wiederholen und Fehler verstehen – ohne Zeitlimit und ohne kostenpflichtige Funktionen.</p><div class="game-grid"><button class="game" data-game="flash"><div class="gi">▣</div><div><strong>Karteikarten</strong><span>Begriffe verstehen und wiederholen</span></div></button><button class="game" data-game="quiz"><div class="gi">🧠</div><div><strong>Mini-Quiz</strong><span>10 zufällige Fragen</span></div></button><button class="game" data-game="challenge"><div class="gi">⚡</div><div><strong>Code-Challenge</strong><span>Eine freie praktische Aufgabe</span></div></button><button class="game" data-game="interview"><div class="gi">🎤</div><div><strong>Interviewfragen</strong><span>Erkläre Konzepte wie ein Developer</span></div></button></div><div class="game-grid v5-game-grid"><button class="game" data-game="snake"><div class="gi">🐍</div><div><strong>Snake spielen</strong><span>Echtes Canvas-Spiel mit Touchsteuerung</span></div></button><button class="game" data-game="pong"><div class="gi">🏓</div><div><strong>Pong vs Bot</strong><span>Ballphysik, Steuerung und Punkte</span></div></button><button class="game" data-game="memory"><div class="gi">🧩</div><div><strong>Memory</strong><span>Paare finden und Code verstehen</span></div></button></div><div class="panel" style="margin-top:15px"><h3>Dein Training</h3><p class="text-muted">In allen Spielen kannst du frei üben. Du erhältst keine Strafen, wenn du eine Pause machst.</p></div>`}
function startGame(g){game=g;quizIndex=0;quizScore=0;flashFlipped=false;const pool=allLessons.filter(l=>l.quiz&&l.options?.length===3);quizOrder=pool.sort(()=>Math.random()-.5).slice(0,10).map(l=>l.id);flashIndex=0;nav('game')}
function gameView(){breadcrumb('Training');if(['snake','pong','memory'].includes(game)){window.LLGames.render(content,game,{onBack:()=>nav('practice'),onCode:()=>nav('editor')});return}if(game==='quiz'){const l=lookup[quizOrder[quizIndex]];if(!l){content.innerHTML=`<div class="panel"><h2>Geschafft! 🎉</h2><h3>${quizScore} / 10 richtig</h3><p>Du kannst das Quiz jederzeit wiederholen.</p>${btn('Neues Quiz','retry-game','primary')}${btn('Zur Übersicht','practice')}</div>`;return}
 content.innerHTML=`<div class="flex">${btn('← Zurück','practice','ghost small')}<span class="pill">Frage ${quizIndex+1}/10</span><span class="pill">${quizScore} richtig</span></div><div class="panel" style="margin-top:18px"><div class="eyebrow">${esc(courseLookup[l.courseId].name)}</div><h2>${esc(l.quiz)}</h2>${l.options.map((o,i)=>`<button class="quiz-option" data-game-answer="${i}">${esc(o)}</button>`).join('')}<div id="gameFeedback" class="text-muted"></div></div>`;return}
 if(game==='flash'||game==='interview'){const l=allLessons[(flashIndex*37)%allLessons.length];let front=game==='flash'?l.title:l.reviewPrompt,back=game==='flash'?l.theory:l.keyPoints.join(' ');content.innerHTML=`<div class="flex">${btn('← Zurück','practice','ghost small')}<span class="pill">Karte ${flashIndex+1}</span></div><div class="panel" style="margin-top:18px"><div class="eyebrow">${game==='flash'?'KARTEIKARTEN':'INTERVIEW TRAINING'} · ${esc(courseLookup[l.courseId].name)}</div><div class="flashcard" data-act="flip-flash"><div><div class="micro">${flashFlipped?'ANTWORT':'FRAGE'} · Antippen zum Umdrehen</div><strong>${esc(flashFlipped?back:front)}</strong></div></div><div class="flex" style="margin-top:18px">${btn('↻ Umdrehen','flip-flash')}${btn('Noch üben','next-flash')}${btn('✓ Verstanden','flash-known','primary')}</div></div>`;return}
 if(game==='challenge'){const l=allLessons[(new Date().getDate()*17+Math.floor(Math.random()*10))%allLessons.length];game='challenge:'+l.id;return gameView()}
 if(game.startsWith('challenge:')){const l=lookup[game.split(':')[1]];content.innerHTML=`<div class="flex">${btn('← Zurück','practice','ghost small')}</div><div class="panel" style="margin-top:17px"><div class="eyebrow">FREE CODE CHALLENGE · ${esc(courseLookup[l.courseId].name)}</div><h2>${esc(l.title)}</h2><p>${esc(l.task)}</p><pre class="code-sample">${esc(l.example)}</pre><div class="flex">${btn('Im Editor bearbeiten','challenge-editor','primary')}${btn('Andere Challenge','retry-game')}</div></div>`;return}
}
function project(){let p=state.projects.find(p=>p.id===state.projectId);if(!p){p=state.projects[0];state.projectId=p.id}return p}
function editor(){breadcrumb('Code Studio');window.LLIDE.render(content,{state,save:persist,userId:user?.id||'guest'});return;const p=project();content.innerHTML=`<div class="flex space-between" style="margin-bottom:12px"><div><div class="eyebrow">LIVERYLAB CODE STUDIO</div><h1 style="margin:6px 0">Dein eigener <span style="color:#b75bfc">Editor.</span></h1></div><span class="pill">Lokale Projekte</span></div><div class="flex" style="margin:14px 0">${btn('+ Neues Projekt','new-project','primary')}${btn('+ Neue Datei','new-file')}${btn('↓ Projekt exportieren','export-project')}</div><div class="catalog-tools"><select id="projectSelect" class="select" aria-label="Projekt wählen" style="flex:1">${state.projects.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><select class="select" id="editorLang" aria-label="Sprache wählen">${['lua','javascript','html','css','python','typescript','java','csharp','sql','json','bash','cpp','rust','go','kotlin','php','jsx','text'].map(x=>`<option value="${x}" ${p.lang===x?'selected':''}>${x.toUpperCase()}</option>`).join('')}</select></div>
 <div class="editor-shell"><div class="file-tree"><div class="eyebrow" style="padding:7px">DATEIEN</div>${Object.keys(p.files).map(f=>`<button data-file="${esc(f)}" class="${f===p.file?'current':''}">📄 ${esc(f)}</button>`).join('')}</div><div class="editor-right"><div class="editor-toolbar"><span class="mono">★ ${esc(p.file)}</span><span class="micro">Autosave lokal</span><div class="flex">${btn('▶ Ausführen','run-editor','primary small')}${btn('⎘ Kopieren','copy-editor','small')}</div></div><div class="kbd-tools">${['=','(',')','{','}','[',']',';',':','"','\'','<','>','/','_','-'].map(x=>`<button data-insert="${esc(x)}">${esc(x)}</button>`).join('')}</div><textarea class="editor-area" id="codeEditor" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Code Editor"></textarea><div class="editor-tools"><span class="micro">${esc(p.lang.toUpperCase())} · ${esc(p.file)} · <span id="lineInfo">1 Zeilen</span> · <span style="color:#6fdfac">● Gespeichert</span></span></div><div class="code-console editor-console" id="editorConsole">Code bereit. Klicke auf „Ausführen“, um ihn in einer unterstützten Browser-Laufzeit zu testen.</div></div></div><div id="editorPreview" class="hidden" style="margin-top:15px"><h3>HTML-Vorschau</h3><iframe id="sandboxFrame" class="preview" sandbox="allow-scripts" title="Isolierte Vorschau"></iframe></div><div class="callout" style="margin-top:15px"><b>Was läuft hier?</b> JavaScript wird in einem zeitlich begrenzten Web Worker ausgeführt. HTML/CSS erhält eine isolierte Vorschau. Lua verwendet einen eingeschränkten Mini-Runner. Python wird bei bestehender Internetverbindung über Pyodide im Browser getestet, JSON validiert. Java, C#, SQL, Rust, Go, FiveM-Natives und andere Sprachen benötigen eine passende echte Laufzeit außerhalb dieser statischen Website.</div>`;
 $('#codeEditor').value=p.files[p.file];$('#lineInfo').textContent=String(p.files[p.file].split('\n').length)+' Zeilen';
}
async function runCode(code,lang,output,preview){const out=document.querySelector(output);if(out)out.textContent='▶ Starte Test …';if(lang==='lua'){const r=await window.LLMini.run(code);if(out)out.textContent=(r.ok?'✓ Lua-Mini-Runner:\n':'✕ Mini-Runner:\n')+(r.output||'')+(r.error?'\n'+r.error:'');return}
 if(lang==='python'){const result=await runPythonWorker(code);if(out)out.textContent=(result.ok?'✓ Python-Test (Pyodide):\n':'✕ Python-Fehler:\n')+(result.output||'')+(result.error?'\n'+result.error:'');return}
 if(lang==='json'){try{const result=JSON.parse(code);if(out)out.textContent='✓ Gültiges JSON:\n'+JSON.stringify(result,null,2)}catch(e){if(out)out.textContent='✕ JSON-Fehler: '+e.message}return}
 if(lang==='javascript'){const result=await runWorkerJS(code);if(out)out.textContent=(result.ok?'✓ JavaScript-Ausgabe:\n':'✕ JavaScript-Fehler:\n')+(result.output||'')+(result.error?'\n'+result.error:'');return}
 if(lang==='html'||lang==='css'){if(out)out.textContent='✓ Vorschau gestartet (isolierter Frame).';const wrap=document.querySelector(preview);if(wrap){wrap.classList.remove('hidden');const f=wrap.querySelector('iframe');if(f){let html=lang==='html'?code:`<!doctype html><meta charset="utf-8"><style>${code.replace(/<\/style/gi,'<\\/style')}</style><h1>CSS Vorschau</h1><p>Dein eigenes Design.</p><button>Ein Button</button>`;f.srcdoc=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:">${html}`}}return}
 if(out)out.textContent='Diese Sprache kann der Browser nicht zuverlässig ausführen. Nutze hier den Editor und teste mit einer echten Runtime, IDE oder einem FiveM-Testserver.';
}
function runWorkerJS(src){return new Promise(resolve=>{let worker,url,timer=null,done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);worker?.terminate();if(url)URL.revokeObjectURL(url);resolve(v)};try{const code=`const logs=[];console.log=(...a)=>logs.push(a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' '));console.error=console.log;try{\n${src}\npostMessage({ok:true,output:logs.join('\\n')||'(Keine Konsolenausgabe)'});}catch(e){postMessage({ok:false,output:logs.join('\\n'),error:String(e.message||e)})}`;worker=window.LLWorker.start(code);worker.onmessage=e=>finish(e.data);worker.onerror=e=>finish({ok:false,error:String(e.message||'Ungültiger JavaScript-Code')})}catch(e){finish({ok:false,error:'Worker nicht verfügbar: '+e.message});return}timer=setTimeout(()=>finish({ok:false,error:'Test nach 2 Sekunden gestoppt. Prüfe mögliche Endlosschleifen.'}),2000)})}
function runPythonWorker(src){return new Promise(resolve=>{let worker,url,timer=null,done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);worker?.terminate();if(url)URL.revokeObjectURL(url);resolve(v)};try{const workerSource=`self.onmessage=async e=>{let lines=[];try{importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});py.setStdout({batched:t=>lines.push(t)});py.setStderr({batched:t=>lines.push(t)});await py.runPythonAsync(e.data);self.postMessage({ok:true,output:lines.join('\\n')||'(Kein print()-Output)'})}catch(err){self.postMessage({ok:false,output:lines.join('\\n'),error:String(err.message||err)})}}`;worker=window.LLWorker.start(workerSource,'python');worker.onmessage=e=>finish(e.data);worker.onerror=e=>finish({ok:false,error:e.message||'Python-Worker fehlgeschlagen. Prüfe Internet/CDN und Browserfreigaben.'});worker.postMessage(src);timer=setTimeout(()=>finish({ok:false,error:'Python-Test nach 30 Sekunden beendet. Pyodide benötigt beim ersten Start Internet und etwas Ladezeit.'}),30000)}catch(err){finish({ok:false,error:'Python-Worker konnte nicht gestartet werden: '+err.message})}})}
function download(name,text,type='application/json'){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function requireUserInput(hint,defaultValue=''){const v=prompt(hint,defaultValue);return v&&v.trim()?v.trim():null}
function syncSoon(){if(window.LLMFA.pending||profile?.needs_password_change||!user||currentOwner!==user.id||!authClient||!sessionRole||state.cloudEnabled===false)return;clearTimeout(syncSoon._t);syncSoon._t=setTimeout(syncAll,2800)}
function cloudPayload(){const fields=['completed','quizzes','bookmarks','videoDone','taskPassed','taskNotes','courseExams','notes','lessonCode','history','recent','flashKnown','xpExtra','_updatedAt'];return Object.fromEntries(fields.map(k=>[k,state[k]]))}
async function syncAll(){if(window.LLMFA.pending||profile?.needs_password_change||!user||currentOwner!==user.id||!authClient||!sessionRole||state.cloudEnabled===false||cloudBusy)return;cloudBusy=true;const uid=user.id,stamp=state._updatedAt;try{
const {data:remote,error}=await authClient.from('academy_progress').select('payload').eq('user_id',uid).eq('key','academy-v2').maybeSingle();if(error)throw error;if(currentOwner!==uid||user?.id!==uid)return;
const sanitized=remote?.payload&&typeof remote.payload==='object'?{...remote.payload,projects:state.projects,projectId:state.projectId}:null;const r=sanitized?normalizeState(sanitized):null;
if(r){const localNewer=(state._updatedAt||0)>=(r._updatedAt||0),latest=localNewer?state:r;state={...state,...latest,projects:state.projects,projectId:state.projectId,storageEnabled:state.storageEnabled,cloudEnabled:state.cloudEnabled,completed:{...r.completed,...state.completed},quizzes:{...r.quizzes,...state.quizzes},bookmarks:{...r.bookmarks,...state.bookmarks},videoDone:{...r.videoDone,...state.videoDone},taskPassed:{...r.taskPassed,...state.taskPassed},taskNotes:{...r.taskNotes,...state.taskNotes},courseExams:{...r.courseExams,...state.courseExams}};}
state.storageEnabled=state.storageEnabled!==false;state.cloudEnabled=state.cloudEnabled!==false;const payload=cloudPayload();if(JSON.stringify(payload).length>850000)throw Error('Cloudspeicher pro Nutzer ist fast voll – bitte ein Backup exportieren und unbenötigten Code entfernen.');
if(currentOwner!==uid||user?.id!==uid)return;const {error:writeError}=await authClient.from('academy_progress').upsert({user_id:uid,key:'academy-v2',payload,updated_at:new Date().toISOString()},{onConflict:'user_id,key'});if(writeError)throw writeError;
if(currentOwner===uid&&state.storageEnabled!==false)localStorage.setItem(storageKey(uid),JSON.stringify(state));
if(view==='profile'||view==='settings')render();
}catch(err){toast('Cloud-Sync: '+(err.message||'Nicht möglich'))}finally{cloudBusy=false;if(currentOwner===uid&&state._updatedAt>stamp)syncSoon()}}
function cloudProgress(){syncSoon()}
// Keep one auth subscription when switching between tab-only and remembered sessions.
const sessionStorageAdapter={
 getItem(key){return (rememberLogin()?localStorage:sessionStorage).getItem(key)},
 setItem(key,value){(rememberLogin()?localStorage:sessionStorage).setItem(key,value)},
 removeItem(key){localStorage.removeItem(key);sessionStorage.removeItem(key)}
};
async function supabaseClient(){if(authClient)return authClient;const cfg=window.LL_CONFIG||{};if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)throw Error('Supabase fehlt in site/config.js');const mod=await import('https://esm.sh/@supabase/supabase-js@2.81.1');authClient=mod.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true,storage:sessionStorageAdapter}});return authClient}
async function initAuth(){if(!(window.LL_CONFIG?.supabaseUrl&&window.LL_CONFIG?.supabaseAnonKey))return;try{const client=await supabaseClient();const {data:{session}}=await client.auth.getSession();user=session?.user||null;await getProfile();await window.LLMFA.refresh(client);if(user&&sessionRole){if(!window.LLMFA.pending&&!profile?.needs_password_change)await ensureCourses();switchOwner(user.id);if(!window.LLMFA.pending&&!profile?.needs_password_change)await syncAll()}client.auth.onAuthStateChange((event,s)=>{const newUser=s?.user||null;const uid=newUser?.id||null;const changed=uid!==currentOwner;user=newUser;if(!changed&&['SIGNED_IN','INITIAL_SESSION','TOKEN_REFRESHED'].includes(event))return;setTimeout(async()=>{if(changed){await getProfile();await window.LLMFA.refresh(client);if(user&&sessionRole){if(!window.LLMFA.pending&&!profile?.needs_password_change)await ensureCourses();switchOwner(user.id);if(!window.LLMFA.pending&&!profile?.needs_password_change)await syncAll()}else {switchOwner(null);clearCourses()}}render()},0)});render()}catch(err){console.warn('Supabase setup',err.message);authStatus='Cloud-Verbindung nicht verfügbar: '+err.message;render()}}
async function getProfile(){profile=null;sessionRole='';if(!user||!authClient)return;try{const {data,error}=await authClient.from('academy_profiles').select('id,display_name,role,active,username,needs_password_change').eq('id',user.id).single();if(error)throw error;profile=data;sessionRole=data?.active?data?.role:'';await window.LLPro.configure(authClient,user);window.LLShell.ownerChanged(user.id);if(!data?.active){toast('Dieses Konto wurde gesperrt.');await authClient.auth.signOut();user=null;sessionRole='';profile=null;switchOwner(null)}}catch(err){console.warn('Profil nicht verfügbar:',err.message)}}
async function doLogin(){const login=$('#loginEmail')?.value?.trim(),password=$('#loginPass')?.value;const email=login&&!login.includes('@')?( /^[A-Za-z][A-Za-z0-9_]{2,23}$/.test(login)?login.toLowerCase()+'@accounts.livery-lab.app':'' ):login;if(!email||!password){toast('Bitte Benutzername und Passwort eingeben.');return}try{const want=$('#rememberLogin')?.checked??rememberLogin();if(!user&&want!==rememberLogin()){setRememberLogin(want)}const c=await supabaseClient();let {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;user=data.user;await getProfile();await window.LLMFA.refresh(c);if(!user||!sessionRole)throw Error('Konto nicht aktiv oder nicht freigeschaltet');if(!window.LLMFA.pending&&!profile?.needs_password_change)await ensureCourses();switchOwner(user.id);if(!window.LLMFA.pending&&!profile?.needs_password_change)await syncAll();nav('profile');toast('✓ Angemeldet!')}catch(err){authStatus='Anmeldung fehlgeschlagen: '+(err.message||'Unbekannter Fehler');render()}}
async function updatePassword(){if(!user||!authClient)return toast('Bitte zuerst anmelden.');const a=$('#newPassword')?.value||'',b=$('#repeatPassword')?.value||'';if(a.length<14)return toast('Das Passwort muss mindestens 14 Zeichen lang sein.');if(a!==b)return toast('Passwörter stimmen nicht überein.');try{if(profile?.needs_password_change){await adminRequest({action:'finishPasswordChange',password:a});await authClient.auth.signOut();user=null;sessionRole='';profile=null;switchOwner(null);clearCourses();authStatus='Passwort geändert. Bitte mit deinem neuen Passwort anmelden.';render();return}const {error}=await authClient.auth.updateUser({password:a});if(error)throw error;toast('✓ Passwort aktualisiert.');render()}catch(e){toast('Passwort: '+(e.message||'Fehler'))}}
async function resetPassword(){const email=$('#loginEmail')?.value?.trim();if(!email)return toast('E-Mail-Adresse eingeben.');try{const c=await supabaseClient();const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;toast('Falls die E-Mail registriert ist, wird eine Nachricht versendet.')}catch(e){toast('Passwort: '+e.message)}}
async function adminRequest(body){const c=await supabaseClient();const {data:{session}}=await c.auth.getSession();if(!session)throw Error('Nicht angemeldet');const cfg=window.LL_CONFIG;const url=cfg.supabaseUrl.replace(/\/$/,'')+'/functions/v1/'+(cfg.adminFunctionName||'admin-users');const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':cfg.supabaseAnonKey},body:JSON.stringify(body)});const data=await r.json().catch(()=>({error:'Nicht lesbare Serverantwort'}));if(!r.ok)throw Error(data.error||'Admin-Anfrage fehlgeschlagen ('+r.status+')');return data}
async function loadMembers(){try{let data=await adminRequest({action:'list'});const tiers=await window.LLPro.memberTiers();adminMembers=(data.users||[]).map(m=>({...m,plan:tiers[m.id]||'free'}));adminMessage='';render()}catch(e){adminMessage=e.message;render()}}
function adminView(){breadcrumb('Administration');if(sessionRole!=='admin'){content.innerHTML='<div class="callout">Kein Admin-Zugriff. Die Admin-Rolle muss sicher in der Supabase-Datenbank vergeben werden.</div>';return}content.innerHTML=`<div class="eyebrow">GESCHÜTZTER BEREICH</div><h1>Academy <span style="color:#bb72ff">Administration.</span></h1><p class="text-muted">Schüler per Benutzername und Startpasswort verwalten. Konten werden nur über eine geschützte Supabase Edge Function verwaltet.</p><div class="panel"><h3>Neues Benutzerkonto (ohne E-Mail)</h3><p class="muted-line">Erstelle einen Benutzernamen und ein einmaliges starkes Startpasswort. Teile es nur privat mit und fordere direkt einen Passwortwechsel. Ohne E-Mail gibt es keine automatische Passwort-Wiederherstellung.</p><label class="form-label">Benutzername<input id="createUsername" class="input" maxlength="24" placeholder="z. B. MaxDev"></label><label class="form-label">Startpasswort (mindestens 14 Zeichen)<input id="createTempPassword" type="password" class="input" autocomplete="new-password" minlength="14"></label><label class="form-label">Tarif bei Erstellung<select class="select" id="createTier"><option value="free">FREE · 3 Lektionen/Tag</option><option value="pro">PRO · 6 Lektionen/Tag</option><option value="ultimate">PLUS · unbegrenzt</option></select></label><div class="flex" style="margin-bottom:20px">${btn('Sicheres Passwort erzeugen','generate-temp')}${btn('＋ Konto erstellen','create-username','primary')}</div><h3>Alternativ: Einladung per E-Mail</h3><p class="muted-line">Das Konto wird über eine Einladung angelegt. Die Person bekommt einen Einladungslink und wählt ihr Passwort selbst. So musst du keine fremden Passwörter verwalten.</p><div class="auth-stack"><label class="form-label">E-Mail-Adresse<input id="inviteEmail" class="input" type="email" placeholder="schueler@example.com"></label>${btn('✉ Konto erstellen & einladen','invite','primary')}</div></div><div class="panel"><div class="flex space-between"><h3>Benutzerverwaltung</h3>${btn('↻ Aktualisieren','load-members')}</div><p class="micro">Es werden zunächst bis zu 100 Academy-Mitglieder angezeigt.</p>${adminMessage?`<div class="callout">${esc(adminMessage)}</div>`:''}<div class="table-scroll"><table class="admin-table"><thead><tr><th>Account</th><th>Rolle</th><th>Tarif</th><th>Status</th><th>Aktion</th></tr></thead><tbody>${adminMembers.map(m=>`<tr><td>${esc(m.username||m.email||m.id)}${m.needs_password_change?' <small>· Passwortwechsel nötig</small>':''}</td><td>${esc(m.role||'student')}</td><td><select class="select v5-plan-select" data-member-plan="${esc(m.id)}"><option value="free" ${m.plan==='free'?'selected':''}>FREE</option><option value="pro" ${m.plan==='pro'?'selected':''}>✦ PRO</option><option value="ultimate" ${m.plan==='ultimate'?'selected':''}>✦ PLUS</option></select></td><td>${m.active?'Aktiv':'Deaktiviert'}</td><td>${m.id!==user?.id?`<button class="btn small ${m.active?'danger':'secondary'}" data-member="${esc(m.id)}" data-enable="${m.active?'0':'1'}">${m.active?'Sperren':'Freigeben'}</button>${m.role==='student'&&m.username?` <button class="btn small" data-member-reset="${esc(m.id)}">Passwort-Reset</button>`:''}${m.role==='student'?` <button class="btn small danger" data-member-delete="${esc(m.id)}">Löschen</button>`:''}`:'Eigenes Konto'}</td></tr>`).join('')||'<tr><td colspan="5">Klicke auf Aktualisieren, um Mitglieder zu laden.</td></tr>'}</tbody></table></div></div><div class="callout" style="margin-top:14px">Die Daten werden durch eine serverseitige Rollenprüfung geschützt. Die Inhalte einer öffentlichen GitHub-Pages-Website selbst sind grundsätzlich öffentlich, auch wenn du den Fortschritt und die Konto-Funktionen nur angemeldeten Personen anbietest.</div>`}
function musicView(){breadcrumb('Music Lab');window.LLMusic.renderStudio(content,{userId:user?.id||'guest'})}
function studio3dView(){breadcrumb('3D Studio');window.LL3D.render(content,{userId:user?.id||'guest'})}

function roadmapsView(){
 breadcrumb('Roadmaps');
 const featured=Array.isArray(data?.roadmaps)?data.roadmaps:[];const topics=courses.map(c=>({id:'topic-'+c.id,name:c.name,category:c.category,icon:c.icon,color:c.color,summary:c.description,stages:[{level:'Eigener Lernpfad',title:'Alle Kapitel · '+c.name,courseIds:[c.id],checkpoint:'Erstelle ein eigenes Ergebnis zu '+c.name+', dokumentiere Fehlerfälle und teste das Projekt.'}]}));const routes=[...featured,...topics];
 if(!routes.length){content.innerHTML='<div class="panel">Roadmaps sind noch nicht verfügbar.</div>';return}
 const current=routes.find(r=>r.id===roadmapId)||routes[0];roadmapId=current.id;
 const allIds=current.stages.flatMap(s=>s.courseIds).filter(id=>courseLookup[id]);
 const completed=allIds.filter(id=>lessonsOf(courseLookup[id]).every(l=>state.completed[l.id])).length;
 content.innerHTML=`<div class="eyebrow">LIVERYLAB · ROADMAPS</div><h1>Dein Weg zum <em>Profi.</em></h1><p class="text-muted">Wähle einen vollständigen Karriere-Lernpfad oder eine eigene Roadmap für jedes Fachthema. Lernziele und Projekte begleiten dich bis zur Praxisprüfung.</p>
 <div class="v5-route-nav">${featured.map(r=>`<button class="v5-route-navitem ${r.id===current.id?'active':''}" data-roadmap="${esc(r.id)}"><span>${esc(r.icon||'◈')}</span><strong>${esc(r.name)}</strong></button>`).join('')}</div>
 <section class="v5-route-hero" style="--roadmap-color:${esc(current.color||'#b34aff')}"><div class="eyebrow">AUSGEWÄHLTE ROADMAP · ${esc(current.category)}</div><h2>${esc(current.name)}</h2><p>${esc(current.summary)}</p><p class="micro">${completed} von ${allIds.length} Kursen komplett gelernt</p><div class="progress"><div class="fill" style="width:${Math.round(completed/Math.max(1,allIds.length)*100)}%"></div></div></section>
 <div class="v5-route-stages">${current.stages.map((stage,index)=>{
  const found=stage.courseIds.map(id=>courseLookup[id]).filter(Boolean);
  const done=found.filter(c=>lessonsOf(c).every(l=>state.completed[l.id])).length;
  return `<div class="v5-route-stage"><span class="v5-route-number">${String(index+1).padStart(2,'0')}</span><div class="panel"><div class="flex space-between"><div><span class="eyebrow">${esc(stage.level||'Lernstufe')}</span><h3>${esc(stage.title)}</h3></div><span class="pill">${done}/${found.length} Kurse</span></div>
   <div class="v5-route-courses">${found.map(c=>`<button data-course="${esc(c.id)}"><span>${esc(c.icon)}</span><div><b>${esc(c.name)}</b><small>${countFor(c).pct}% gelernt</small></div><strong>↗</strong></button>`).join('')}</div><div class="callout"><b>🎯 Praxisprüfung:</b> ${esc(stage.checkpoint)}</div></div></div>`
 }).join('')}</div><section class="ll7-topicroutes"><div class="ll7-section-title"><div><span class="eyebrow">49+ INDIVIDUELLE LERNPFADE</span><h2>Roadmap für jedes Fachthema.</h2><p>Jede Sprache und jeder Fachkurs besitzt einen eigenen Einstieg. Python hat zusätzlich eine vollständige Profi-Roadmap.</p></div><input id="ll7-roadmap-search" class="input" type="search" placeholder="Roadmap suchen …" aria-label="Roadmap suchen"></div><div class="ll7-topic-grid">${topics.map(r=>`<button class="ll7-topic-map" data-roadmap="${esc(r.id)}" data-title="${esc((r.name+' '+r.category).toLowerCase())}"><span style="--topic:${esc(r.color||'#9863e9')}">${esc(r.icon||'◈')}</span><div><small>${esc(r.category)}</small><strong>${esc(r.name)}</strong></div><b>↗</b></button>`).join('')}</div></section>`;
}


let boardRows=[],myReward=null,boardError='';
async function refreshBoard(){
 try{const c=await supabaseClient();
 const [board,reward]=await Promise.all([c.rpc('academy_get_leaderboard'),c.from('academy_rewards').select('reward_points,streak,last_claim,show_on_board').eq('user_id',user.id).maybeSingle()]);
 if(board.error)throw board.error;
 boardRows=board.data||[];myReward=reward.data||null;boardError='';
 }catch(err){boardError=err.message||'Rangliste nicht verfügbar'}
 if(view==='leaderboard')leaderboardView();
}
async function claimDaily(){
 try{const c=await supabaseClient();const {data,error}=await c.rpc('academy_claim_daily');if(error)throw error;const item=Array.isArray(data)?data[0]:data;
 toast(item.already_claimed?'Heute bereits abgeholt!':'🎁 +'+item.reward+' Punkte · Streak '+item.new_streak);
 if(view==='leaderboard')await refreshBoard();else render();
 }catch(err){toast('Daily Reward: '+(err.message||'Fehler'))}
}
function leaderboardView(){
 breadcrumb('Rangliste');
 content.innerHTML=`<div class="eyebrow">LIVERYLAB COMMUNITY</div><h1>Dein <em>Level Up.</em></h1>
 <p class="text-muted">Freiwillige Rangliste auf Basis von einmal täglich möglichen, serverseitig bestätigten Check-ins. Das ist kein Maßstab für Coding- oder Musikqualität.</p>
 <div class="panel"><div class="eyebrow">DEIN PROFIL</div><div class="v4-microgrid"><div><b>${myReward?.streak||0} 🔥</b><small>Streak</small></div><div><b>${myReward?.reward_points||0}</b><small>Check-in-Punkte</small></div><div><b>${stats().xp}</b><small>Lern-XP</small></div></div>
 <div class="flex" style="margin-top:16px">${btn('🎁 Tagesbelohnung','claim-daily','primary')}${btn('↻ Aktualisieren','board-refresh')}${btn('◉ Freunde & Duelle','friends')}</div>
 <label class="checkrow" style="margin-top:16px"><input id="boardOptIn" type="checkbox" ${myReward?.show_on_board?'checked':''}> Meinen Anzeigenamen freiwillig in der Rangliste anzeigen</label></div>
 <div class="panel"><h2>🏆 Leaderboard</h2><p class="micro">Nur Mitglieder, die ihre Anzeige aktiviert haben.</p>${boardError?`<p class="callout">${esc(boardError)}</p>`:''}
 ${boardRows.length?`<div class="v4-leaders">${boardRows.map(m=>`<div class="v4-leader"><b>#${m.rank_position}</b><strong>${esc(m.display_name)}</strong><span>${Number(m.reward_points)||0} Punkte · 🔥 ${Number(m.streak)||0}</span></div>`).join('')}</div>`:'<p class="text-muted">Noch keine sichtbaren Mitglieder. Aktiviere die Anzeige, um deinen Platz zu zeigen.</p>'}</div>`;
}


function initialPasswordGate(){
 breadcrumb('Erster Login · Passwort ändern');
 content.innerHTML='<div class="panel login-gate"><div class="eyebrow">KONTO ABSICHERN</div><h1>Neues Passwort <em>festlegen.</em></h1><p class="text-muted">Dieses Konto wurde von einem Administrator mit einem Startpasswort erstellt. Bitte lege vor dem Lernen ein eigenes, einzigartiges Passwort fest (mindestens 14 Zeichen).</p><div class="auth-stack"><label>Neues Passwort<input class="input" type="password" id="newPassword" minlength="14" autocomplete="new-password"></label><label>Wiederholen<input class="input" type="password" id="repeatPassword" minlength="14" autocomplete="new-password"></label><button class="btn primary" data-act="update-password">Passwort ändern</button><button class="btn" data-act="logout">Abmelden</button></div></div>';
}



function videoLibrary(){
 breadcrumb('Video-Tutorials');
 const collection=window.LLVideo.catalog;
 content.innerHTML=`<div class="eyebrow">LIVERYLAB · VIDEOTHEK</div><h1>Lerne mit <em>echten Tutorials.</em></h1><p class="text-muted">Gezielt ausgewählte Kurse ergänzen die schriftlichen Lektionen. Das Video wird erst nach einem Klick geladen; jede einzelne Lektion bietet zusätzlich eine thematische YouTube-Suche.</p><div class="v5-video-library">${collection.map((v,i)=>`<div class="v5-video-entry"><div class="eyebrow">${esc(v.lang)} · ${esc(v.author)}</div><h3>${esc(v.name)}</h3><p class="micro">${esc(v.desc)}</p><div id="v5-video-slot-${i}"></div></div>`).join('')}</div>`;
 collection.forEach((v,i)=>window.LLVideo.attach(content.querySelector('#v5-video-slot-'+i),{title:v.name,videoId:v.id,videoStart:0},{name:v.name,category:v.match==='music'?'Musik':v.match==='blender'?'3D & Blender':'Programmieren'}));
}

function render(){
 window.LLShell?.setRole?.(sessionRole);
 const allowed=['home','catalog','course','lesson','exam','reference','profile','settings','admin'];
 if(!allowed.includes(view))view='catalog';
 document.body.dataset.workspace='academy';
 document.body.dataset.ll9Page=view;
 document.body.dataset.ll9Auth=sessionRole?'in':'out';
 window.LL9?.bottom(view,!!courseLookup[courseId]);
 if(window.LL_CONFIG?.requireLogin){
   if(!sessionRole){loginGate();navActive();return}
   if(window.LLMFA?.pending){
     breadcrumb('Zwei-Faktor-Prüfung');
     window.LLMFA.renderGate(content,{client:authClient,onSuccess:async()=>{await window.LLMFA.refresh(authClient);await getProfile();if(!window.LLMFA.pending&&sessionRole&&!profile?.needs_password_change){await ensureCourses();await syncAll()}render()},onLogout:async()=>{await authClient?.auth.signOut();user=null;sessionRole='';profile=null;clearCourses();switchOwner(null);window.LLPro.configure(null,null);window.LLMFA.refresh(null);render()}});
     navActive();return
   }
   if(profile?.needs_password_change){initialPasswordGate();navActive();return}
   if(!data?.courses){breadcrumb('Kurse laden');content.innerHTML='<div class="ll9-panel"><h2>Kursinhalte laden</h2><p>Dein Profil ist angemeldet. Die freigegebenen Inhalte werden sicher aus der Datenbank geladen.</p>'+(authStatus?'<p>'+esc(authStatus)+'</p>':'')+'</div>';navActive();return}
 }
 navActive();
 const xpBadge=$('#xpBadge');if(xpBadge)xpBadge.textContent=xp()+' XP';
 switch(view){
 case 'home':home();break;
 case 'catalog':catalog();break;
 case 'course':course();break;
 case 'lesson':lesson();break;
 case 'exam':examView();break;
 case 'reference':referenceView();break;
 case 'profile':profileView();break;
 case 'settings':settingsView();break;
 case 'admin':adminView();break;
 default:home()
 }
}
async function handleAction(action,el){switch(action){case 'catalog':nav('catalog');break;case 'catalog-worlds':worldFilter='all';catFilter='Alle';qSearch='';nav('catalog');break;case 'practice':nav('practice');break;case 'profile':nav('profile');break;case 'settings':nav('settings');break;case 'customize-profile':nav('settings');document.querySelector('[data-ll-tab="personal"]')?.click();break;case 'profile-appearance':nav('settings');document.querySelector('[data-ll-tab="personal"]')?.click();break;case 'profile-security':nav('settings');document.querySelector('[data-ll-tab="account"]')?.click();break;case 'register-username':{const name=$('#ll7-username')?.value.trim();if(!name||!/^[A-Za-z][A-Za-z0-9_]{2,23}$/.test(name))return toast('Benutzername: 3–24 Zeichen; Buchstaben, Zahlen und Unterstrich.');try{const c=await supabaseClient();const {error}=await c.rpc('academy_set_username',{p_username:name});if(error)throw error;await getProfile();render();toast('✓ Benutzername registriert.')}catch(err){toast('Benutzername: '+err.message)}break}case 'music':nav('music');break;case 'studio3d':nav('studio3d');break;case 'videolab':nav('videolab');break;case 'roadmaps':nav('roadmaps');break;case 'music-catalog':worldFilter='music';catFilter='Alle';nav('catalog');break;case 'leaderboard':nav('leaderboard');refreshBoard();break;case 'friends':nav('friends');break;case 'board-refresh':await refreshBoard();break;case 'open-code':nav('editor');break;case 'videos':nav('videos');break;case 'claim-daily':await claimDaily();break;case 'resume':goLesson(state.recent.find(id=>lookup[id])||'lua-01');break;case 'lua-first':goLesson('lua-01');break;case 'course-start':{const c=courseLookup[courseId];goLesson(lessonsOf(c).find(l=>!state.completed[l.id])?.id||lessonsOf(c)[0].id);break}case 'docs':window.open(courseLookup[courseId].source,'_blank','noopener,noreferrer');break;
 case 'bookmark':state.bookmarks[lessonId]?delete state.bookmarks[lessonId]:state.bookmarks[lessonId]=true;persist();cloudProgress();render();break;
 case 'copy-example':await navigator.clipboard?.writeText(lookup[lessonId].example).then(()=>toast('Beispiel kopiert')).catch(()=>toast('Kopieren nicht verfügbar'));break;
 case 'open-in-editor':{const l=lookup[lessonId];let p={id:'lesson-'+l.id,name:l.title,lang:l.lang,file:'main.'+({javascript:'js',typescript:'ts',csharp:'cs',python:'py',text:'txt'}[l.lang]||l.lang),files:{}};p.files[p.file]=state.lessonCode[l.id]||l.example;if(!state.projects.some(x=>x.id===p.id))state.projects.push(p);state.projectId=p.id;persist();nav('editor');break}
 case 'task-confirm':{const body=$('#ll9-task-notes')?.value?.trim()||'';if(body.length<25)return toast('Beschreibe deine Praxisarbeit in mindestens 25 Zeichen.');state.taskNotes[lessonId]=body;state.taskPassed[lessonId]=true;persist();toast('Praxisarbeit selbst bestätigt.');render();break}
 case 'check-lesson':{toast('Die Lektion enthält keinen Online-Editor mehr. Nutze die Praxisaufgabe.');break}
 case 'run-lesson':{const l=lookup[lessonId];await runCode($('#lessonEditor').value,l.lang,'#lessonOutput','#lessonPreview');break}
 case 'hint':$('#lessonOutput').textContent='Tipp: '+(lookup[lessonId]?.hint||'Prüfe deine Erklärung und das Beispiel.');break;
 case 'show-solution':$('#lessonSolution')?.classList.toggle('hidden');break;
 case 'video-confirm':{if(!lookup[lessonId])return;state.videoDone[lessonId]=true;persist();toast('Video als angesehen bestätigt.');render();break}
 case 'exam-start':{examSession=null;examView();break}
 case 'exam-next':{if(!examSession||examSession.selected===null)return;examSession.answers.push(examSession.selected);examSession.selected=null;examSession.index++;if(examSession.index>=examSession.questions.length){const correct=examSession.answers.filter((v,i)=>v===examSession.questions[i]?.correct).length;examSession.result={correct,passed:correct>=Math.ceil(examSession.questions.length*.8)};const old=state.courseExams[courseId];if(!old||!old.passed||examSession.result.passed)state.courseExams[courseId]={...examSession.result,questions:examSession.questions.length,date:new Date().toISOString()};persist()}render();break}
 case 'complete-lesson':completion(lessonId);break;
 case 'prev-lesson':{const arr=lessonsOf(courseLookup[courseId]);goLesson(arr[arr.findIndex(x=>x.id===lessonId)-1]?.id||lessonId);break}
 case 'next-lesson':{const arr=lessonsOf(courseLookup[courseId]);goLesson(arr[arr.findIndex(x=>x.id===lessonId)+1]?.id||lessonId);break}
 case 'new-project':{const name=requireUserInput('Name deines neuen Projekts?','Mein Projekt');if(!name)return;const lang='lua',id='p-'+Date.now();state.projects.push({id,name:name.slice(0,60),lang,file:'main.lua',files:{'main.lua':'-- Neues LiveryLab Projekt\nprint("Hallo!")'}});state.projectId=id;persist();render();break}
 case 'new-file':{const p=project(),filename=requireUserInput('Dateiname inklusive Erweiterung?','helper.lua');if(!filename)return;if(filename.length>70||filename.includes('..')||filename.includes('/')||filename.includes('\\')){toast('Ungültiger Dateiname');return}if(Object.hasOwn(p.files,filename)){toast('Datei existiert bereits');return}p.files[filename]='';p.file=filename;persist();render();break}
 case 'copy-editor':await navigator.clipboard?.writeText($('#codeEditor').value).then(()=>toast('Code kopiert')).catch(()=>toast('Kopieren nicht unterstützt'));break;
 case 'run-editor':{const p=project();await runCode($('#codeEditor').value,p.lang,'#editorConsole','#editorPreview');break}
 case 'export-project':{const p=project();download('LiveryLab_'+p.name.replace(/[^a-z0-9_-]/gi,'_')+'.json',JSON.stringify(p,null,2));toast('Projekt exportiert');break}
 case 'export-state':download('LiveryLab_Academy_Backup.json',JSON.stringify({app:'LiveryLab Academy 2.0',state},null,2));toast('Backup erstellt');break;
 case 'import-state':$('#importFile').click();break;
 case 'reset-state':{if(confirm('Lokalen Lernstand und Projekte wirklich löschen? Für Online-Konten bleibt der Cloudstand erhalten. Lade vorher ein Backup herunter!')){localStorage.removeItem(storageKey(currentOwner));state=baseState();nav('home');toast('Lokale Daten gelöscht.')}}break;
 case 'login':await doLogin();break;
 case 'update-password':await updatePassword();break;
 case 'reset-password':await resetPassword();break;
 case 'logout':{await authClient?.auth.signOut();window.LLMFA.refresh(null);window.LLPro.configure(null,null);user=null;sessionRole='';profile=null;switchOwner(null);clearCourses();nav('profile');break}
 case 'sync-cloud':await syncAll();toast('Cloud-Synchronisierung geprüft');break;
 case 'save-name':{const name=$('#settingsName')?.value.trim();if(!name||name.length<2||name.length>40)return toast('Bitte einen Namen zwischen 2 und 40 Zeichen eingeben.');if(user){const {error}=await authClient.from('academy_profiles').update({display_name:name}).eq('id',user.id);if(error)return toast('Profil: '+error.message);await getProfile()}state.profileName=name;persist();render();toast('Anzeigename gespeichert');break}
 case 'change-email':{if(!user||!authClient)return;const email=$('#settingsEmail')?.value.trim();if(!email||!email.includes('@'))return toast('Ungültige E-Mail');const {error}=await authClient.auth.updateUser({email});if(error)return toast('E-Mail: '+error.message);toast('Bestätigungslink angefordert. Bitte E-Mail prüfen.');break}
 case 'clear-cache':{if(!('caches' in window))return toast('Kein Offline-Cache vorhanden');const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('liverylab-')).map(k=>caches.delete(k)));toast('Offline-App-Cache gelöscht');break}
 case 'clear-cloud':{if(!user||!authClient)return;const answer=prompt('Nur die CLOUD-Lerndaten löschen? Gib CLOUD LÖSCHEN ein. Dein Account bleibt bestehen.');if(answer!=='CLOUD LÖSCHEN')return;const {error}=await authClient.from('academy_progress').delete().eq('user_id',user.id).eq('key','academy-v2');if(error)return toast('Cloud: '+error.message);toast('Cloud-Lerndaten gelöscht. Automatischer Sync vorübergehend deaktiviert.');state.cloudEnabled=false;persist();render();break}
 case 'delete-account':{if(!user)return;const answer=prompt('Online-Konto und Cloud-Daten UNWIDERRUFLICH löschen? Tippe KONTO LÖSCHEN ein.');if(answer!=='KONTO LÖSCHEN')return;await adminRequest({action:'deleteSelf',confirmation:answer});await authClient.auth.signOut().catch(()=>{});const previous=currentOwner;user=null;profile=null;sessionRole='';localStorage.removeItem(storageKey(previous));switchOwner(null);clearCourses();nav('home');toast('Dein Online-Konto wurde gelöscht.');break}

 case 'admin':nav('admin');await loadMembers();break;
 case 'load-members':await loadMembers();break;
 case 'generate-temp':{const bytes=new Uint8Array(20);crypto.getRandomValues(bytes);const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';$('#createTempPassword').value=Array.from(bytes,x=>chars[x%chars.length]).join('');toast('Sicheres Passwort erzeugt.');break}case 'create-username':{const username=$('#createUsername')?.value.trim(),password=$('#createTempPassword')?.value;if(!username||!password)return toast('Benutzername und Startpasswort erforderlich.');try{const created=await adminRequest({action:'createUsername',username,password});const tier=$('#createTier')?.value||'free';if(created?.id&&tier!=='free'){try{await window.LLPro.setTier(created.id,tier)}catch(e){adminMessage='Konto erstellt, Tarifvergabe fehlgeschlagen: '+e.message;render();return}}toast('Konto mit Tarif '+tier.toUpperCase()+' angelegt. Passwort nur sicher mitteilen.');await loadMembers()}catch(e){adminMessage=e.message;render()}break}
 case 'invite':{const email=$('#inviteEmail')?.value?.trim();if(!email||!email.includes('@'))return toast('Bitte gültige E-Mail angeben.');try{await adminRequest({action:'invite',email});toast('Einladung an '+email+' veranlasst');await loadMembers()}catch(e){adminMessage=e.message;render()}break}
 case 'retry-game':startGame(game.startsWith('challenge')?'challenge':game);break;
 case 'flip-flash':flashFlipped=!flashFlipped;render();break;
 case 'next-flash':flashIndex++;flashFlipped=false;render();break;
 case 'flash-known':{const l=allLessons[(flashIndex*37)%allLessons.length];if(!state.flashKnown[l.id]){state.flashKnown[l.id]=true;state.xpExtra=(state.xpExtra||0)+2;persist()}flashIndex++;flashFlipped=false;render();break}
 case 'challenge-editor':{const l=lookup[game.split(':')[1]];let p={id:'challenge-'+l.id,name:'Challenge: '+l.title,lang:l.lang,file:'main.'+l.lang,files:{}};p.files[p.file]=l.starter||'';state.projects.push(p);state.projectId=p.id;persist();nav('editor');break}
 default:break}}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-go],[data-act],[data-course],[data-lesson],[data-chapter],[data-cat],[data-game],[data-file],[data-insert],[data-quiz-opt],[data-game-answer],[data-member],[data-member-delete],[data-member-reset],[data-world],[data-roadmap]');if(!b)return;
 if(b.dataset.go){nav(b.dataset.go);return}
 if(b.dataset.ll9Filter){worldFilter=b.dataset.ll9Filter;qSearch='';nav('catalog');return}
 if(b.dataset.examOption!==undefined){if(examSession&&examSession.selected===null){examSession.selected=Number(b.dataset.examOption);render()}return}
 if(b.dataset.world){worldFilter=b.dataset.world;catFilter='Alle';qSearch='';nav('catalog');return}
 if(b.dataset.roadmap){roadmapId=b.dataset.roadmap;nav('roadmaps');return}
 if(b.dataset.course){goCourse(b.dataset.course);return}
 if(b.dataset.lesson){goLesson(b.dataset.lesson);return}
 if(b.dataset.chapter){chapterOpen[b.dataset.chapter]=b.getAttribute('aria-expanded')!=='true';render();return}
 if(b.dataset.cat){catFilter=b.dataset.cat;catalog();return}
 if(b.dataset.game){startGame(b.dataset.game);return}
 if(b.dataset.file){project().file=b.dataset.file;persist();render();return}
 if(b.dataset.insert){const t=$('#codeEditor');if(!t)return;const start=t.selectionStart,end=t.selectionEnd,s=b.dataset.insert;t.setRangeText(s,start,end,'end');const p=project();p.files[p.file]=t.value;persist();t.focus();return}
 if(b.dataset.quizOpt!==undefined){const l=lookup[lessonId];let correct=+b.dataset.quizOpt===l.correct;b.parentElement.querySelectorAll('.quiz-option').forEach((x,i)=>{x.classList.toggle('good',i===l.correct);x.classList.toggle('bad',i===+b.dataset.quizOpt&&!correct)});$('#quizFeedback').textContent=correct?'✓ Richtig! +5 XP für die erste richtige Antwort.':'✕ Das war noch nicht richtig. Lies die Erklärung erneut und versuche es wieder.';if(correct&&!state.quizzes[l.id]){state.quizzes[l.id]=true;persist();cloudProgress()}return}
 if(b.dataset.gameAnswer!==undefined){const l=lookup[quizOrder[quizIndex]],isGood=+b.dataset.gameAnswer===l.correct;if(isGood){quizScore++;state.xpExtra=(state.xpExtra||0)+1;persist()}const p=$('#gameFeedback');p.textContent=(isGood?'✓ Richtig.':'✕ Nicht ganz.')+' Richtige Antwort: '+l.options[l.correct];document.querySelectorAll('[data-game-answer]').forEach(x=>x.disabled=true);setTimeout(()=>{quizIndex++;render()},850);return}

 if(b.dataset.memberReset){
  if(!confirm('Ein neues temporäres Passwort für diesen Schüler erstellen?'))return;
  const bytes=new Uint8Array(20);crypto.getRandomValues(bytes);
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
  const password=Array.from(bytes,x=>alphabet[x%alphabet.length]).join('');
  try{
    await adminRequest({action:'resetUsernamePassword',userId:b.dataset.memberReset,password});
    prompt('Einmalpasswort bitte jetzt kopieren und sicher weitergeben. Es wird nicht gespeichert oder erneut angezeigt.',password);
    toast('Passwort zurückgesetzt.');await loadMembers();
  }catch(err){adminMessage=err.message;render()}
  return;
 }
 if(b.dataset.memberDelete){const id=b.dataset.memberDelete;if(prompt('Schülerkonto und alle zugehörigen Cloud-Daten löschen? Tippe SCHÜLER LÖSCHEN ein.')!=='SCHÜLER LÖSCHEN')return;try{await adminRequest({action:'deleteStudent',userId:id,confirmation:'SCHÜLER LÖSCHEN'});await loadMembers();toast('Schülerkonto gelöscht')}catch(e){adminMessage=e.message;render()}return}
 if(b.dataset.member){const id=b.dataset.member,enable=b.dataset.enable==='1';if(!confirm((enable?'Freigeben':'Sperren')+' dieses Konto?'))return;try{await adminRequest({action:'setActive',userId:id,active:enable});await loadMembers();toast('Konto aktualisiert')}catch(e){adminMessage=e.message;render()}return}
 if(b.dataset.act)try{await handleAction(b.dataset.act,b)}catch(err){console.error(err);toast(err.message||'Aktion fehlgeschlagen')}
});
document.addEventListener('input',e=>{if(e.target.id==='ll9-course-search'){qSearch=e.target.value;const position=e.target.selectionStart;catalog();const next=$('#ll9-course-search');next?.focus();try{next?.setSelectionRange(position,position)}catch{}return}if(e.target.id==='ll9-reference-search'){const v=e.target.value;const c=courseLookup[courseId];if(!c)return;content.innerHTML=window.LL9.reference(c,{query:v});const field=$('#ll9-reference-search');field?.focus();try{field?.setSelectionRange(v.length,v.length)}catch{}return}if(e.target.id==='ll9-task-notes'){state.taskNotes[lessonId]=e.target.value;persist();return}if(e.target.id==='ll7-roadmap-search'){const query=e.target.value.trim().toLocaleLowerCase('de');document.querySelectorAll('.ll7-topic-map').forEach(node=>{node.hidden=!node.dataset.title.includes(query)});return}if(e.target.id==='lessonEditor'){state.lessonCode[lessonId]=e.target.value;persist()}if(e.target.id==='lessonNotes'){state.notes[lessonId]=e.target.value;persist();syncSoon()}if(e.target.id==='profileName'){state.profileName=e.target.value.slice(0,40);persist()}if(e.target.id==='codeEditor'){const p=project();p.files[p.file]=e.target.value;persist();const n=$('#lineInfo');if(n)n.textContent=e.target.value.split('\n').length+' Zeilen'}});
document.addEventListener('change',e=>{if(e.target.dataset.memberPlan){const id=e.target.dataset.memberPlan, tier=e.target.value;(async()=>{try{await window.LLPro.setTier(id,tier);toast('Tarif auf '+tier.toUpperCase()+' gesetzt');await loadMembers()}catch(err){toast('Freischaltung: '+err.message);await loadMembers()}})();return}if(e.target.id==='boardOptIn'){(async()=>{try{const c=await supabaseClient();const {error}=await c.from('academy_rewards').update({show_on_board:e.target.checked}).eq('user_id',user.id);if(error)throw error;toast('Sichtbarkeit aktualisiert');await refreshBoard()}catch(err){toast('Rangliste: '+err.message)}})();return}if(e.target.id==='levelFilter'){levelFilter=e.target.value;catalog()}if(e.target.id==='projectSelect'){state.projectId=e.target.value;persist();render()}if(e.target.id==='editorLang'){project().lang=e.target.value;persist();render()}if(e.target.id==='settingStorage'){state.storageEnabled=e.target.checked;persist();toast(e.target.checked?'Lokale Speicherung aktiviert':'Lokale Speicherung deaktiviert');}if(e.target.id==='settingCloud'){state.cloudEnabled=e.target.checked;persist();if(state.cloudEnabled)syncSoon();toast(e.target.checked?'Cloud-Sync aktiviert':'Cloud-Sync pausiert');}});
$('#importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(parsed.app!=='LiveryLab Academy 2.0'||!parsed.state||typeof parsed.state!=='object')throw Error('Ungültige Backup-Datei');if(!confirm('Lokalen Fortschritt mit diesem Backup ersetzen?'))return;state=parsed.state;state.projects??=defaultProjects();persist();nav('profile');toast('Backup wiederhergestellt')}catch(err){toast('Backup: '+err.message)}finally{e.target.value=''}});
function init(){window.LLShell?.boot?.();if(!window.LL_CONFIG?.supabaseUrl||!window.LL_CONFIG?.supabaseAnonKey){content.innerHTML='<div class="empty">Die private Anmeldung ist noch nicht konfiguriert.</div>';return}let fragment='';try{fragment=decodeURIComponent(location.hash.slice(1))}catch(e){}if(['home','catalog','editor','practice','profile','music','studio3d','videolab','roadmaps','settings','leaderboard','friends','videos'].includes(fragment))view=fragment;render();initAuth();if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});}
init();
})();

