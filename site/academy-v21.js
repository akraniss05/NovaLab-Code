/* NovaLab Academy v13 — focused learning, memberships and vouchers.
 * Made with 💙 from NyxAtheris (NovaLab Academy)
 * The footer attribution remains visible; open-source code itself cannot be made tamper-proof.
 * No browser-side administrator secrets. Supabase Auth + RLS enforce access server-side.
 */
(function(){
'use strict';
var cfg=window.LL_CONFIG||{}, $=function(q,root){return (root||document).querySelector(q);};
var content=$('#content'), sidebar=$('#sidebar'), bottom=$('#bottom-nav'), toastNode=$('#toast');
var api=null, s={shopEnabled:false,adminSelf:null,adminSelfBusy:false,adminSelfError:'',shopDiscount:0,shopMonths:1,shopOffers:[],selectedPlan:null,selectedMonths:1,service:{beta_open:true,mine:[],admin:[]},serviceError:'',serviceLastUpdated:0,lastSupportReceipt:null,supportBusy:false,chatTicketId:null,chatMessages:[],chatBusy:false,chatLoading:false,streakModalOpen:false,streakBusy:false,streakClockOffsetMs:0,streakRefreshBusy:false,streakError:'',streakLoading:false,loginStreak:null,friendTab:'friends',examFilter:'all',authScreen:'login',refLang:'lua',refSearch:'',refGroup:'Alle',daily:null,planExpires:null,discount:null,vouchers:[],lessonGate:null,user:null,profile:null,tier:'free',ready:false,courses:[],lessons:[],xpAwards:[],xpClaimBusy:false,progress:{done:[],watched:[],exams:{}},route:'home',filter:'Alle',search:'',difficultyFilter:'all',lesson:null,choice:null,quizStep:0,quizPassed:false,sectionIndex:0,videoChecked:false,videoLoaded:false,exam:null,examStatus:null,examGate:null,referenceData:null,social:null,socialMedia:{},isOwner:false,entitledCourses:null,members:[],memberPlans:{},memberExpiry:{},adminPage:1,adminFilter:'all',adminSearch:'',registrationPolicy:{mode:'approval',loaded:false},registrationManual:true,adminLearner:null,adminProgressBusy:false,adminProgressSearch:'',adminProgressFilter:'all',catalogLimit:9,practiceChecked:false,draft:'',lessonStep:1,hintStage:0,prefs:null,projectTab:0,projectSource:'',projectLoading:false};
var plans={free:'Free',pro:'Plus',ultimate:'Ultimate',max:'Max'};
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c];});}
function safeLink(url){return /^https:\/\/[^\s<>"]+$/i.test(String(url||''))?esc(url):'#';}
function notice(message){toastNode.textContent=window.LLI18n?.translate?.(message)||message;toastNode.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(function(){toastNode.classList.remove('show');},5000);}
function formatError(e){return (e&&e.message)||'Unbekannter Fehler';}
function safeNumber(n){return Number.isFinite(Number(n))?Number(n):0;}
function xpEarned(){const earned=(s.xpAwards||[]).reduce((sum,entry)=>sum+Math.max(0,Number(entry.xp)||0),0);return Math.max(0,earned+(s.profile?.role==='admin'?Number(s.adminSelf?.xp_adjustment||0):0));}
function xpAwarded(id){return (s.xpAwards||[]).some(entry=>entry.lesson_id===id);}
function xpFromCourse(id){const awarded=new Set((s.xpAwards||[]).map(entry=>entry.lesson_id));return s.lessons.filter(l=>l.course_id===id&&awarded.has(l.id)).length*30;}
function doneIds(){return new Set(s.progress.done||[]);}
function watchedIds(){return new Set(s.progress.watched||[]);}
// The Lua beginner path finishes at its existing final exam. Older extra lessons
// stay in Supabase (and retain their IDs, drafts and XP) for existing deep links.
function inMainPath(l){return l.course_id!=='lua'||/^lua-(0[1-9]|[12][0-9]|30)$/.test(l.id)||/^lua-path-[0-9]{3}$/.test(l.id);}
function countDone(courseId){var d=doneIds();return lessonsOf(courseId).filter(function(l){return d.has(l.id);}).length;}
function lessonsOf(id){return s.lessons.filter(function(l){return l.course_id===id&&inMainPath(l);}).sort(function(a,b){return a.position-b.position;});}
function courseOf(id){return s.courses.find(function(c){return c.id===id;});}
function pct(n,total){return total?Math.round(n/total*100):0;}
function tierLabel(t){return t==='plus'?'Plus':t==='pro'?'Ultimate':t==='max'?'Max':'Free';}
function allowed(l){if(!s.shopEnabled)return !!s.profile;return !!s.profile&&(!s.entitledCourses||s.entitledCourses.includes(l.course_id))&&(l.required_plan==='free'||(l.required_plan==='plus'&&['pro','ultimate','max'].includes(s.tier))||(l.required_plan==='pro'&&['ultimate','max'].includes(s.tier)));}
function fullAccess(){return !s.shopEnabled||s.tier==='max';}
function hasScript(){return !s.shopEnabled||['pro','ultimate','max'].includes(s.tier);}
function examCap(){return !s.shopEnabled||fullAccess()?-1:s.tier==='ultimate'?8:s.tier==='pro'?4:2;}
function paywall(feature,tier,description){return '<section class="feature-gate"><span class="feature-lock">🔒</span><span class="eyebrow">'+esc(tier)+'-MITGLIEDSCHAFT</span><h1>'+esc(feature)+' ist gesperrt.</h1><p class="lede">'+esc(description)+'</p><div class="feature-gate-actions"><button type="button" data-go="plans" class="btn primary">Tarif ansehen →</button><a class="btn discord" href="https://discord.gg/SZhYa6Nnmy" target="_blank" rel="noopener noreferrer">Auf Discord anfragen</a></div><p class="micro">Schreibe NyxAtheris eine DM oder eröffne im Discord ein Ticket und erwähne @nyxatheris mit dem Grund.</p></section>';}
function badge(t){return '<span class="chip '+esc(t)+'">'+tierLabel(t)+'</span>';}
function levelText(l){var x=String(l||'beginner').toLowerCase();return /beginner|anfänger/.test(x)?'Anfänger':/intermediate|mittelstufe/.test(x)?'Aufbau':'Fortgeschritten';}

function difficultyBadge(course){return window.LLDifficulty?.badge?.(course)||'';}
function difficultyDescription(){return window.LLDifficulty?.description?.()||'Schwierigkeit des gesamten Kurses.';}
function lessonLocalKey(kind,id){return 'liverylab-'+kind+'-'+(s.user?.id||'guest')+'-'+id;}
function readDraft(id){try{return localStorage.getItem(lessonLocalKey('draft',id))||'';}catch(_){return '';}}
function saveDraft(id,value){try{localStorage.setItem(lessonLocalKey('draft',id),String(value).slice(0,10000));}catch(_){}}
function readQuizLocal(id){
 try{const value=JSON.parse(localStorage.getItem(lessonLocalKey('quiz',id))||'null');return value&&typeof value==='object'?value:null;}catch(_){return null;}
}
function saveQuizLocal(id,value){
 try{localStorage.setItem(lessonLocalKey('quiz',id),JSON.stringify(value));}catch(_){notice('Quiz-Zwischenstand konnte in diesem Browser nicht gespeichert werden.');}
}
function setPreference(key,value){try{localStorage.setItem('liverylab-pref-'+key,value?'1':'0')}catch(_){}applyPreferences()}
function getPreference(key){const defaultOn=key==='animatedBackdrop'||key==='buttonEffects';try{const saved=localStorage.getItem('liverylab-pref-'+key);return saved===null?defaultOn:saved==='1'}catch(_){return defaultOn}}
function getChoicePreference(key,fallback){
 try{return localStorage.getItem('liverylab-choice-'+key)||fallback;}catch(_){return fallback;}
}
function setChoicePreference(key,value){
 try{localStorage.setItem('liverylab-choice-'+key,value);}catch(_){}
 applyPreferences();
}
function bookmarks(){try{return JSON.parse(localStorage.getItem('liverylab-bookmarks-'+(s.user?.id||'guest'))||'[]')}catch(_){return []}}
function toggleBookmark(id){const ids=new Set(bookmarks());ids.has(id)?ids.delete(id):ids.add(id);try{localStorage.setItem('liverylab-bookmarks-'+(s.user?.id||'guest'),JSON.stringify([...ids]))}catch(_){}}
function pinKey(){return 'pin-'+(s.user?.id||'guest')}
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
 window.LLEffects?.sync?.();
}
function syncBackdrop(){var b=$('#nav-backdrop');if(b)b.classList.toggle('visible',sidebar.classList.contains('open'))}
function pageHeading(label,title,description){
 const designs={
  'HILFE & FEEDBACK':['Support','book'],
  'MITGLIEDSCHAFT':['Shop','xp'],
  'PRÜFUNGEN':['Prüfungen','exam'],
  'NOVALAB COMMUNITY':['Freunde','friends'],
  'DEIN PROFIL':['Mein Profil','profile'],
  'EINSTELLUNGEN':['Einstellungen','settings'],
  'ADMINISTRATION':['Administration','settings'],
  'HAUPTMENÜ':['Hauptmenü','learn']
 };
 const entry=designs[label]||[label,'code'];
 return '<header class="page-heading ll-neon-page-heading">'+
  '<div class="ll-neon-page-title"><span class="ll-neon-brand-text"><img src="./novalab-logo.webp" alt=""> NovaLab <em>Academy</em></span>'+
  '<span class="eyebrow ll-neon-kicker">'+esc(label)+'</span><h1>'+esc(entry[0])+'</h1>'+
  '<p class="lede">'+esc(description)+'</p><span class="ll-neon-legacy-heading" aria-hidden="true">'+title+'</span></div>'+
  '<span class="ll-neon-hero-art" aria-hidden="true"><span class="ll-neon-hero-glyph">'+atelierScene(entry[1],label==='MITGLIEDSCHAFT'?'shop':label==='ADMINISTRATION'?'admin':entry[1])+'</span></span>'+
  '</header>';
}
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

/* v1.5 neon app design: presentation only; existing route/actions/forms are retained. */

/* NovaLab Atelier: original CSS-driven holograms; all interactions stay native. */
function atelierScene(icon,variant){
 const scene=/^[a-z-]+$/.test(variant||'')?variant:'code';
 return '<span class="ll-atelier-scene ll-atelier-scene-'+scene+'" aria-hidden="true">'+
  '<span class="ll-atelier-halo"></span><span class="ll-atelier-grid"></span>'+
  '<span class="ll-atelier-platform"></span><span class="ll-atelier-cube">'+llIcon(icon||'code')+'</span>'+
  '<span class="ll-atelier-spark ll-spark-one">✦</span><span class="ll-atelier-spark ll-spark-two">✧</span>'+
  '<span class="ll-atelier-orbit"></span></span>';
}
function atelierMissionStrip(){
 const started=s.courses.filter(c=>countDone(c.id)>0).length,
  completed=s.lessons.filter(l=>inMainPath(l)&&doneIds().has(l.id)).length,
  exams=Object.values(s.progress.exams||{}).filter(x=>x?.passed).length,
  streak=Number(s.loginStreak?.current||0);
 return '<section class="ll-atelier-mission-strip" aria-label="Deine Lernübersicht">'+
 [['learn',started,'Lernpfade begonnen'],['code',completed,'Lektionen gemeistert'],
  ['exam',exams,'Prüfungen bestanden'],['fire',streak,'Tage Lernstreak']].
 map(([icon,value,label])=>'<div class="ll-atelier-mission-stat"><span>'+llIcon(icon)+'</span>'+
  '<strong>'+value+'</strong><small>'+label+'</small></div>').join('')+'</section>';
}
function atelierCourseRail(){
 const started=s.courses.filter(c=>countDone(c.id)>0);
 const courses=started.length?started.slice(0,3):s.courses.slice(0,3);
 if(!courses.length)return '';
 return '<section class="ll-atelier-course-rail"><div class="ll-atelier-section-intro"><div>'+
 '<span class="eyebrow">[ ◈ ] DEIN NÄCHSTER MEILENSTEIN</span><h2>Dein Weg zum nächsten Level.</h2>'+
 '<p>Deine echten Fortschritte – direkt zu den passenden Lernpfaden.</p></div>'+
 '<button class="btn small" type="button" data-go="courses">Alle Lernpfade →</button></div>'+
 '<div class="ll-atelier-rail-list">'+courses.map((c,i)=>{
 const total=lessonsOf(c.id).length,done=countDone(c.id),percent=pct(done,total);
 return '<button type="button" class="ll-atelier-rail-card" data-go="track/'+esc(c.id)+'">'+
 '<span class="ll-atelier-rail-node">'+(done&&done===total?'✓':String(i+1).padStart(2,'0'))+'</span>'+
 '<span class="ll-atelier-rail-info"><strong>'+esc(c.name)+'</strong><small>'+done+' / '+total+' Lektionen abgeschlossen</small>'+
 '<span class="ll-atelier-rail-progress"><span style="width:'+percent+'%"></span></span></span>'+
 '<span class="ll-atelier-rail-percent">'+percent+' %</span></button>';
 }).join('')+'</div></section>';
}
function atelierScriptStats(completed,total){
 return '<div class="ll-atelier-stats ll-atelier-script-stats">'+
 '<div><span>'+llIcon('code')+'</span><strong>'+PROJECT_FILES.length+'</strong><small>Projektdateien</small></div>'+
 '<div><span>'+llIcon('check')+'</span><strong>'+completed+'</strong><small>Teile freigeschaltet</small></div>'+
 '<div><span>'+llIcon('learn')+'</span><strong>'+Math.max(0,total-completed)+'</strong><small>Noch offen</small></div></div>';
}
function atelierReferenceInfo(langs,items){
 return '<div class="ll-atelier-stats ll-atelier-ref-stats">'+
 '<div><span>'+llIcon('book')+'</span><strong>'+langs+'</strong><small>Sprachen & Tools</small></div>'+
 '<div><span>'+llIcon('code')+'</span><strong>'+items+'</strong><small>Referenzeinträge</small></div>'+
 '<div class="ll-atelier-ref-tip"><span class="eyebrow">QUICK LOOKUP</span><strong>Syntax finden.</strong>'+
 '<small>Kopieren, verstehen und direkt im Kurs anwenden.</small></div></div>';
}
function atelierProfilePath(){
 const all=s.lessons.filter(inMainPath),done=all.filter(l=>doneIds().has(l.id)).length,
 started=s.courses.filter(c=>countDone(c.id)>0).length,
 passed=Object.values(s.progress.exams||{}).filter(x=>x?.passed).length;
 const milestones=[
 ['code','01','Erste Schritte',done>0],['learn','02','Lernpfad starten',started>0],
 ['exam','03','Prüfung bestehen',passed>0],['xp','04','Weiter wachsen',passed>0&&done>=Math.max(10,Math.ceil(all.length*.1))]
 ];
 return '<section class="ll-atelier-profile-path"><div class="ll-atelier-section-intro"><div>'+
 '<span class="eyebrow">[ ⌁ ] DEINE ENTWICKLER-REISE</span><h2>Dein Weg zum Profi.</h2>'+
 '<p>'+done+' von '+all.length+' Lektionen abgeschlossen · '+started+' Lernpfade begonnen</p></div></div>'+
 '<div class="ll-atelier-milestones">'+milestones.map(([icon,number,label,achieved])=>
 '<div class="ll-atelier-milestone '+(achieved?'is-done':'is-upcoming')+'">'+
 '<span class="ll-atelier-milestone-node">'+llIcon(achieved?'check':icon)+'</span>'+
 '<strong>'+number+'</strong><small>'+label+'</small></div>').join('')+'</div></section>';
}
function atelierSupportPulse(tickets){
 const open=tickets.filter(t=>['open','in_progress','pending'].includes(t.status)).length,
 answered=tickets.filter(t=>['answered','approved'].includes(t.status)).length;
 return '<div class="ll-atelier-stats ll-atelier-support-stats">'+
 '<div><span>'+llIcon('book')+'</span><strong>'+tickets.length+'</strong><small>Deine Anfragen</small></div>'+
 '<div><span>'+llIcon('clock')+'</span><strong>'+open+'</strong><small>Noch offen</small></div>'+
 '<div><span>'+llIcon('check')+'</span><strong>'+answered+'</strong><small>Beantwortet</small></div></div>';
}
function atelierSettingsPreview(){
 const theme=getChoicePreference('theme','violet'),accent=getChoicePreference('accent','lavender'),
 themeLabel=(COLOR_THEMES.find(x=>x[0]===theme)||COLOR_THEMES[0])[1],
 accentLabel=(ACCENT_THEMES.find(x=>x[0]===accent)||ACCENT_THEMES[0])[1];
 return '<section class="ll-atelier-settings-preview"><div class="ll-atelier-settings-preview-copy">'+
 '<span class="eyebrow">[ ✦ ] DEIN PERSÖNLICHES DESIGN</span><h2>Dein Workspace. Deine Regeln.</h2>'+
 '<p>Deine aktuelle Auswahl – alle Einstellungen und Schalter findest du direkt darunter.</p>'+
 '<div class="ll-atelier-preview-tags"><span>'+esc(themeLabel)+'</span><span>'+esc(accentLabel)+'</span></div></div>'+
 atelierScene('settings','settings')+'</section>';
}
function atelierAdminPulse(users,pending){
 const tickets=(s.service?.admin||[]).filter(t=>t.status==='open').length,
 active=users.filter(u=>u.active).length;
 return '<section class="ll-atelier-admin-pulse"><div class="ll-atelier-section-intro"><div>'+
 '<span class="eyebrow">[ ◎ ] LIVE ÜBERSICHT</span><h2>Dein Academy-Kontrollzentrum.</h2>'+
 '<p>Reale Kennzahlen und Direkteinstiege – ohne Änderungen an den Admin-Rechten.</p></div></div>'+
 '<div class="ll-atelier-admin-pulse-cards">'+
 [['profile',active,'Aktive Mitglieder','admin/members'],['clock',pending.length,'Offene Freigaben','admin/registration'],
 ['book',tickets,'Offene Supporttickets','admin/support']].map(([icon,value,label,target])=>
 '<button class="ll-atelier-pulse-card" type="button" data-go="'+target+'">'+
 '<span>'+llIcon(icon)+'</span><strong>'+value+'</strong><small>'+label+'</small><b>Öffnen →</b></button>').join('')+'</div></section>';
}

function neonHero(kind){
 const info={
  home:['Startseite','Deine Lernplattform für Scripting und Entwicklung.','code'],
  script:['Scripts','Deine freigeschaltete Script-Werkstatt mit Dateien und Beispielen.','code'],
  reference:['Referenzen','Funktionen, Befehle und Dokumentationen an einem Ort.','book']
 }[kind];
 if(!info)return '';
 return '<header class="ll-neon-page-heading ll-neon-custom-hero" aria-label="'+esc(info[0])+'">'+
  '<div class="ll-neon-page-title"><span class="ll-neon-brand-text"><img src="./novalab-logo.webp" alt=""> NovaLab <em>Academy</em></span>'+
  '<span class="eyebrow ll-neon-kicker">NOVALAB ACADEMY</span><h1>'+esc(info[0])+'</h1>'+
  '<p class="lede">'+esc(info[1])+'</p></div>'+
  '<span class="ll-neon-hero-art" aria-hidden="true"><span class="ll-neon-hero-glyph">'+atelierScene(info[2],kind)+'</span></span>'+
  '</header>';
}
function neonBanner(title,description,icon,extra){
 return '<section class="ll-neon-feature" aria-label="'+esc(title)+'"><div class="ll-neon-feature-copy">'+
  '<span class="eyebrow">[ ✦ ] NOVALAB ACADEMY</span><h2>'+esc(title)+'</h2>'+
  '<p>'+esc(description)+'</p>'+(extra||'')+'</div>'+
  '<span class="ll-neon-feature-icon" aria-hidden="true">'+atelierScene(icon||'code',icon||'code')+'</span></section>';
}
function neonExamOverview(){
 const results=s.progress.exams||{};
 const passed=Object.values(results).filter(v=>v&&v.passed).length;
 const available=s.courses.filter(c=>{const l=lessonsOf(c.id);return l.length>0&&l.every(allowed);});
 const ready=available.filter(c=>!results[c.id]&&lessonsOf(c.id).every(l=>doneIds().has(l.id)));
 const next=ready[0]||available.find(c=>!results[c.id])||null;
 const completedLessons=s.lessons.filter(l=>inMainPath(l)&&doneIds().has(l.id)).length;
 return '<section class="ll-neon-exam-overview">'+
  neonBanner(next?'Deine nächste Prüfung: '+next.name:'Lerne für deine nächste Prüfung',
    next?'Dein Lernweg führt zur Kursprüfung. Schließe alle Lektionen ab, bevor du sie startest.':
    'Alle bisherigen Erfolge bleiben gespeichert. Entdecke weitere Lernpfade, um neue Prüfungen freizuschalten.',
    'exam',next?'<button class="btn primary small" type="button" data-go="'+
    (ready.includes(next)?'exam/':'track/')+esc(next.id)+'">'+
    (ready.includes(next)?'Prüfung öffnen →':'Kurs fortsetzen →')+'</button>':
    '<button class="btn primary small" type="button" data-go="courses">Kurse entdecken →</button>')+
  '<div class="ll-neon-stat-row">'+
  '<div class="ll-neon-stat"><span>'+llIcon('exam')+'</span><strong>'+passed+'</strong><small>Prüfungen bestanden</small></div>'+
  '<div class="ll-neon-stat"><span>'+llIcon('learn')+'</span><strong>'+ready.length+'</strong><small>Prüfungen bereit</small></div>'+
  '<div class="ll-neon-stat"><span>'+llIcon('code')+'</span><strong>'+completedLessons+'</strong><small>Lektionen geschafft</small></div>'+
  '<div class="ll-neon-stat"><span>'+llIcon('xp')+'</span><strong>'+xpEarned()+'</strong><small>Gesammelte XP</small></div></div></section>';
}
function neonMenuPage(){
 const groups=[
  ['learn','Lernen & Entwickeln',[
   ['courses','learn','Lernen','Kurse entdecken und Wissen aufbauen',false],
   ['script','code','Scripts','Script-Projekt, Dateien und Codebeispiele',!hasScript()],
   ['exams','exam','Prüfungen','Wissen testen und den Lernstand prüfen',false],
   ['reference','book','Referenzen','Funktionen, Befehle und Dokumentation',!fullAccess()]
  ]],
  ['community','Profil & Community',[
   ['profile','profile','Mein Profil','Lernfortschritte, XP und Erfolge',false],
   ['friends','friends','Freunde','Gemeinsam lernen und Anfragen verwalten',false]
  ]],
  ['account','Konto & Hilfe',[
   ...(s.shopEnabled?[['plans','xp','Shop','Free, Plus, Ultimate und Gutscheine',false]]:[]),
   ['support','book','Support','Hilfe, Tickets und Antworten vom Team',false],
   ['settings','settings','Einstellungen','Darstellung, Konto, Timer und Datenschutz',false]
  ]]
 ];
 if(s.profile?.role==='admin')groups.push(['manage','Verwaltung',[
  ['admin','settings','Administration','Nutzer, Freigaben und Academy verwalten',false]
 ]]);
 return pageHeading('HAUPTMENÜ','Alle Bereiche der Academy','Deine Kurse, Projekte und Werkzeuge auf einen Blick.')+
 '<div class="ll-atelier-menu-lede"><h2>Dein Lernstand</h2></div>'+atelierMissionStrip()+
 groups.map(([key,heading,entries])=>
  '<section class="ll-menu-group ll-menu-group-'+key+'" aria-labelledby="ll-menu-'+key+'">'+
  '<h2 id="ll-menu-'+key+'">'+esc(heading)+'</h2><div class="ll-neon-menu-grid">'+
  entries.map(([route,icon,label,description,locked])=>
   '<button type="button" class="ll-neon-menu-tile'+(locked?' is-locked':'')+'" data-go="'+esc(route)+'">'+
   '<span class="ll-neon-menu-art" aria-hidden="true">'+atelierScene(icon,route)+'</span>'+
   '<span class="ll-atelier-tile-kicker">'+(locked?'Tarif erforderlich':route==='courses'?'Dein Lernpfad':'Academy')+'</span>'+
   '<span class="ll-neon-menu-label"><strong>'+esc(label)+'</strong><small>'+esc(description)+'</small></span>'+
   '<span class="ll-neon-tile-arrow" aria-hidden="true">→</span></button>'
  ).join('')+'</div></section>'
 ).join('')+
 '<section class="ll-neon-menu-footer"><span>'+llIcon('fire')+' '+Number(s.loginStreak?.current||0)+' Tage Lernstreak</span>'+
 '<span>'+llIcon('xp')+' '+xpEarned()+' XP</span>'+
 '<button class="btn small" type="button" data-go="home">← Zur Startseite</button></section>';
}

function navHTML(route){
 const items=[
  ['home','⌂','Startseite'],['menu','▦','Hauptmenü'],['courses','▦','Lernen'],['script','⌘',hasScript()?'Script':'Script 🔒'],
  ['exams','☆','Prüfung'],['reference','▤',fullAccess()?'Referenz':'Referenz 🔒'],...(s.shopEnabled?[['plans','✦','Shop · Free / Plus / Ultimate / Max']]:[]),
  ['profile','◉','Mein Profil'],['portfolio','▧','Portfolio'],['skilltree','✧','Skilltree'],['notes','✎','Notizen'],['challenges','◎','Challenges'],['calendar','▦','Lernkalender'],['level','✦','Level & Belohnungen'],['friends','♡','Freunde'],['support','?','Support'],['settings','⚙','Einstellungen']
 ];
 if(s.profile?.role==='admin')items.push(['admin','♢','Administration']);
 return items.map(([id,icon,label])=>{
  const active=route===id||((route==='track'||route==='lesson')&&id==='courses')||(route==='exam'&&id==='exams');
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
  sidebar.innerHTML='<div class="sidebar-logo"><img class="ll-brand-symbol" src="./novalab-logo.webp" alt=""><span>NovaLab<br><span class="gradient">Academy</span></span><button type="button" class="sidebar-close" data-nav-close aria-label="Menü schließen">×</button></div>'+
  '<div class="side-label">Navigation</div>'+navHTML(route)+
  '<div class="side-bottom"><span class="eyebrow">DEIN PROFIL</span><strong>'+
  esc(s.profile.display_name||s.profile.username||'Developer')+'</strong>'+
  '<small>'+(s.shopEnabled?esc(plans[s.tier]||'Free')+' · ':'')+xpEarned()+' XP</small>'+
  '<a class="discord-small" href="https://discord.gg/SZhYa6Nnmy" target="_blank" rel="noopener noreferrer">Discord Community</a></div>';
 const nav=[['home','home','Home'],['courses','learn','Lernen'],['script','code','Script'],['exams','exam','Prüfung'],['reference','book','Referenz']];
  bottom.innerHTML=nav.map(([id,icon,label])=>'<button type="button" data-go="'+id+'" class="bottom-item'+
   ((route===id||(id==='courses'&&['track','lesson'].includes(route))||(id==='exams'&&route==='exam'))?' active':'')+
   '" aria-label="'+label+'"><span class="side-icon" aria-hidden="true">'+llIcon(icon)+'</span><span>'+label+'</span></button>').join('');
 }
 const head=$('#xp-head');if(head)head.textContent='✦ '+xpEarned().toLocaleString('de-DE')+' XP';
 let st=$('#streak-head');
 if(!st){
  const top=document.querySelector('.top-right');
  if(top&&typeof document.createElement==='function'){st=document.createElement('button');st.type='button';st.id='streak-head';st.className='header-streak-chip';st.setAttribute('data-streak-open','');st.setAttribute('aria-label','Daily Streak öffnen');top.insertBefore(st,top.firstChild);}
 }
 if(st){st.innerHTML=llIcon('fire')+' '+Number(s.loginStreak?.current||0)+' Tage';st.classList.toggle('can-claim',!!s.loginStreak?.claimable);}
 const mark=document.querySelector('.topbar .brand-mark');
 if(mark&&mark.querySelector&&!mark.querySelector('.ll-brand-symbol'))mark.innerHTML='<img class="ll-brand-symbol" src="./novalab-logo.webp" alt="">';
 const avatar=$('.avatar-btn');if(avatar)avatar.textContent=String(s.profile?.display_name||s.profile?.username||'N').slice(0,1).toUpperCase();
}

function login(){
 s.ready=false;frame();
 const betaLabel=s.service?.beta_open===false?'NOVALAB · ACADEMY':'NOVALAB · PRIVATE BETA';
 const brand='<img class="ll-login-banner" src="./novalab-banner.webp" alt="NovaLab Premium FiveM Systems Banner"><div class="brandmark"><img class="ll-brand-symbol" src="./novalab-logo.webp" alt=""><span>NovaLab <span class="gradient">Academy</span></span></div><div class="ll-auth-release">'+(s.service?.beta_open===false?'ACADEMY':'PRIVATE BETA')+' <span>NEUE ACADEMY · V28</span></div>';
 if(s.authScreen==='register'){
 content.innerHTML='<div class="auth-layout auth-login-layout"><aside class="auth-showcase"><span class="eyebrow">'+betaLabel+'</span><h2>Baue echte Skills.<br><em>Schritt für Schritt.</em></h2><p>Programmierung, FiveM und Blender in klaren Lernpfaden – mit Videos, Praxis, Quizzen und Abschlussprüfungen.</p><div class="auth-feature-grid"><span>▶ Video-Lektionen</span><span>✓ Praxisaufgaben</span><span>✦ XP & Titel</span><span>★ Kursprüfungen</span></div><small>Made with 💙 from NyxAtheris (NovaLab Academy)</small></aside><section class="auth-card">'+brand+
 '<span class="eyebrow">'+(s.registrationPolicy?.mode==='open'?'[ + ] FREIE REGISTRIERUNG':'[ + ] BEWERBUNG')+'</span><h1>Dein Weg in die <span class="gradient">Academy.</span></h1>'+
 '<p class="lede">'+(s.registrationPolicy?.mode==='open'?'Erstelle ein Konto und starte direkt mit den Free-Kursen. Dafür ist keine Freigabe durch das Team erforderlich.':'Erstelle ein Konto und sende deine Bewerbung. Erst nach der Freigabe durch das Team erhältst du Zugang.')+'</p>'+
 '<form data-form="register"><div class="form-group"><label class="form-label" for="reg-email">E-Mail-Adresse</label>'+
 '<input class="input" type="email" id="reg-email" name="email" autocomplete="email" required maxlength="254" placeholder="du@beispiel.de"></div>'+
 '<div class="form-group"><label class="form-label" for="reg-user">Benutzername</label>'+
 '<input class="input" id="reg-user" name="username" autocomplete="username" required minlength="3" maxlength="24" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" placeholder="DeinBenutzername"></div>'+
 '<div class="form-group"><label class="form-label" for="reg-pass">Passwort (mind. 7 Zeichen)</label>'+
 '<input class="input" type="password" id="reg-pass" name="password" autocomplete="new-password" minlength="7" required></div>'+
 '<div class="form-group"><label class="form-label" for="reg-confirm">Passwort wiederholen</label>'+
 '<input class="input" type="password" id="reg-confirm" name="confirm_password" autocomplete="new-password" minlength="7" required></div>'+
 '<button class="btn primary block" type="submit">'+(s.registrationPolicy?.mode==='open'?'Konto erstellen →':'Registrierungsanfrage senden →')+'</button></form>'+
 '<p class="micro">Dein Passwort wird sicher über Supabase Auth verarbeitet. Die E-Mail-Adresse wird bei diesem Registrierungsweg nicht automatisch auf Besitz geprüft. '+(s.registrationPolicy?.mode==='open'?'Mit der kostenlosen Mitgliedschaft kannst du dich nach der Registrierung anmelden.':'Ohne Annahme deiner Bewerbung bleibt das Konto gesperrt.')+'</p>'+
 '<button type="button" class="btn ghost block" data-action="show-login">← Bereits registriert? Anmelden</button>'+
 '<p class="smallprint" style="text-align:center;margin-top:18px">Made with 💙 from NyxAtheris (NovaLab Academy)</p></section></div>';return;
 }
 if(s.authScreen==='sent'){
 content.innerHTML='<div class="auth-layout"><section class="auth-card auth-success">'+brand+
 '<span class="auth-check">✓</span><span class="eyebrow">'+(s.registrationManual?'ANFRAGE VERSENDET':'KONTO ERSTELLT')+'</span>'+
 '<h1>Registrierung <span class="gradient">eingegangen.</span></h1>'+
 '<p class="lede">'+(s.registrationManual?'Deine Bewerbung ist eingegangen. Du kannst die Academy erst benutzen, nachdem ein Administrator dich freigeschaltet hat. Die Kontakt-E-Mail wurde nicht automatisch geprüft.':'Dein Konto ist sofort als Free-Mitglied freigeschaltet. Melde dich jetzt mit Benutzernamen und Passwort an. Die Kontakt-E-Mail wurde nicht automatisch überprüft.')+'</p>'+
 '<button class="btn primary block" type="button" data-action="show-login">Zur Anmeldung →</button>'+
 '<a class="btn ghost block" style="margin-top:10px" href="https://discord.gg/SZhYa6Nnmy" target="_blank" rel="noopener noreferrer">Discord-Support</a></section></div>';return;
 }
 content.innerHTML='<div class="auth-layout auth-login-layout"><aside class="auth-showcase"><span class="eyebrow">'+betaLabel+'</span><h2>Baue echte Skills.<br><em>Schritt für Schritt.</em></h2><p>Programmierung, FiveM und Blender in klaren Lernpfaden – mit Videos, Praxis, Quizzen und Abschlussprüfungen.</p><div class="auth-feature-grid"><span>▶ Video-Lektionen</span><span>✓ Praxisaufgaben</span><span>✦ XP & Titel</span><span>★ Kursprüfungen</span></div><small>Made with 💙 from NyxAtheris (NovaLab Academy)</small></aside><section class="auth-card">'+brand+
 '<span class="eyebrow">[ 01 ] DEVELOPER ACADEMY</span><h1>Lernen. Entwickeln.<br><span class="gradient">Weiterkommen.</span></h1>'+
 '<p class="lede">Melde dich mit deinem Benutzernamen oder deiner E-Mail-Adresse an.</p>'+
 '<form data-form="login"><div class="form-group"><label class="form-label" for="username">Benutzername oder E-Mail</label>'+
 '<input class="input" id="username" name="username" autocomplete="username" required minlength="3" maxlength="254" placeholder="name@beispiel.de oder dein_name"></div>'+
 '<div class="form-group"><label class="form-label" for="password">Passwort</label>'+
 '<input class="input" type="password" id="password" name="password" autocomplete="current-password" required placeholder="Dein Passwort"></div>'+
 '<button class="btn primary block" type="submit">Anmelden →</button></form>'+
 '<div class="auth-secondary"><span>Noch kein Konto?</span><button type="button" class="btn" data-action="show-register">Jetzt registrieren →</button></div>'+
 '<p class="micro">'+(s.registrationPolicy?.mode==='open'?'Neue Konten sind derzeit ohne Freigabe möglich.':'Neue Registrierungen müssen derzeit vom Team angenommen werden.')+'</p>'+
 '<a class="btn discord block discord-block" href="https://discord.gg/SZhYa6Nnmy" target="_blank" rel="noopener noreferrer">Discord beitreten</a>'+
 '<p class="smallprint" style="text-align:center;margin-top:19px">Sicherer Zugang über NovaLab Academy</p></section></div>';
}
async function fetchRegistrationPolicy(adminView){
 try{
  const response=adminView
   ?await adminCall({action:'getRegistrationMode'})
   :(await api.functions.invoke('academy-register',{body:{action:'policy'}})).data;
  if(!response?.ok||!['approval','open'].includes(response.mode))throw Error('Registrierungsmodus nicht erreichbar.');
  s.registrationPolicy={mode:response.mode,loaded:true,updated_at:response.updated_at||null};
  // Never replace an access-denied screen with the anonymous registration form.
  if(!s.ready&&!s.user&&s.authScreen!=='sent')login();
  return s.registrationPolicy;
 }catch(error){
  // Fail closed: if the service cannot be reached, never promise open access.
  s.registrationPolicy={mode:'approval',loaded:false};
  throw error;
 }
}
async function registerAccount(fd){
 const email=String(fd.get('email')||'').trim().toLowerCase();
 const username=String(fd.get('username')||'').trim().toLowerCase();
 const password=String(fd.get('password')||'');
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>254)throw Error('Bitte eine gültige E-Mail-Adresse eingeben.');
 if(!/^[a-z][a-z0-9_]{2,23}$/.test(username))throw Error('Benutzername: 3–24 Zeichen, Buchstaben, Zahlen und Unterstrich.');
 if(password.length<7||password.length>256)throw Error('Das Passwort muss mindestens 7 Zeichen lang sein.');
 if(password!==String(fd.get('confirm_password')||''))throw Error('Die beiden Passwörter stimmen nicht überein.');
 // One secure registration route for both modes. The server, never browser
 // parameters or Supabase Auth's public signUp, decides the access status.
 const created=await api.functions.invoke('academy-register',{
  body:{email,username,password}
 });
 if(created.error){
  let detail='';
  try{detail=(await created.error.context?.json())?.error||'';}catch(_){}
  throw Error(detail||'Registrierung derzeit nicht erreichbar. Versuche es später noch einmal.');
 }
 if(!created.data?.ok||typeof created.data?.requires_approval!=='boolean')
  throw Error(created.data?.error||'Registrierung konnte nicht abgeschlossen werden.');
 s.registrationManual=created.data.requires_approval;
 s.authScreen='sent';
 login();
}

function waitingApproval(status){
 s.ready=false;frame();
 const pending=status==='pending';
 content.innerHTML='<div class="auth-layout"><section class="auth-card auth-success"><span class="auth-check">'+(pending?'◷':'⛔')+'</span>'+
 '<span class="eyebrow">'+(pending?'ANFRAGE IN PRÜFUNG':'ZUGRIFF GESPERRT')+'</span>'+
 '<h1>'+(pending?'Warte auf deine <span class="gradient">Freigabe.</span>':'Dein Zugang ist <span class="gradient">gesperrt.</span>')+'</h1>'+
 '<p class="lede">'+(pending?'Dein Konto ist angelegt und wartet auf die Genehmigung durch einen Administrator. Bis zur Freigabe bleiben die Kurse gesperrt.':'Der Administrator hat den Zugriff auf dieses Konto gesperrt. Du kannst derzeit keine Lektionen, Prüfungen oder Projektdaten abrufen.')+'</p>'+
 '<button class="btn primary block" type="button" data-action="retry-access">Freigabe erneut prüfen →</button>'+
 '<button class="btn ghost block" style="margin-top:9px" type="button" data-action="logout">Abmelden</button>'+
 '<a class="btn discord block" style="margin-top:9px" href="https://discord.gg/SZhYa6Nnmy" target="_blank" rel="noopener noreferrer">Support auf Discord</a></section></div>';
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
 window.LLI18n?.setAccount?.(s.user.id);
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
  void window.LLStudio?.load?.().then(()=>{if(s.ready&&['portfolio','skilltree','notes','challenges','calendar','level'].includes(parseRoute().page))render();}).catch(error=>notice('Studio: '+formatError(error)));
 }catch(e){s.ready=false;frame();content.innerHTML='<div class="auth-layout panel"><h2>Kein Zugriff</h2><p class="muted">'+esc(formatError(e))+'</p><a class="btn discord" href="https://discord.gg/SZhYa6Nnmy" target="_blank" rel="noopener">Discord-Support</a><button type="button" data-action="logout" class="btn ghost">Abmelden</button></div>';}
}
// Supabase Data API responses are capped per request. Page through the index so
// a large curriculum never silently loses lessons after the first 1,000 rows.
async function loadLessonIndexPages(){
 const fields='id,course_id,chapter,position,title,summary,minutes,required_plan';
 const rows=[];const pageSize=500;
 for(let offset=0;offset<10000;offset+=pageSize){
  const result=await api.from('ll_lesson_index').select(fields)
   .order('course_id',{ascending:true}).order('position',{ascending:true})
   .order('id',{ascending:true}).range(offset,offset+pageSize-1);
  if(result.error)return result;
  const page=Array.isArray(result.data)?result.data:[];
  rows.push(...page);
  if(page.length<pageSize)return {data:rows,error:null};
 }
 return {data:null,error:new Error('Kursindex ist größer als die technische Sicherheitsgrenze.')};
}
async function loadXpAwardPages(){
 const rows=[];const pageSize=500;
 for(let offset=0;offset<10000;offset+=pageSize){
  const result=await api.from('academy_lesson_xp_awards').select('lesson_id,xp,awarded_at')
   .order('awarded_at',{ascending:false}).order('lesson_id',{ascending:true}).range(offset,offset+pageSize-1);
  if(result.error)return result;
  const page=Array.isArray(result.data)?result.data:[];
  rows.push(...page);
  if(page.length<pageSize)return {data:rows,error:null};
 }
 return {data:null,error:new Error('XP-Protokoll ist größer als die technische Sicherheitsgrenze.')};
}
async function refreshShopVisibility(){const result=await api.rpc('novalab_shop_enabled');if(result.error)throw result.error;const next=result.data===true;document.body.classList.toggle('novalab-shop-hidden',!next);if(next!==s.shopEnabled){s.shopEnabled=next;if(s.ready)render();}return next;}
async function loadData(){
 const loadingAccount=s.user?.id;
 await progressWriteTail.catch(()=>{});
 if(s.ready&&progressQueueAccount===loadingAccount&&failedProgressBase)throw Error('Deine letzten Lernänderungen konnten nicht gespeichert werden. Bitte überprüfe die Verbindung und speichere erneut, bevor du neu lädst.');
 if(!loadingAccount)throw Error('Zum Laden wird ein angemeldetes Konto benötigt.');
 await refreshShopVisibility();
 var all=await Promise.all([
 api.from('ll_courses').select('id,name,category,level,icon,source_url,difficulty'),
 loadLessonIndexPages(),
 api.from('academy_plans').select('tier,expires_at').eq('user_id',s.user.id).maybeSingle(),
 api.from('academy_progress').select('payload,updated_at').eq('user_id',s.user.id).eq('key','liverylab-v10').maybeSingle(),
 api.rpc('academy_voucher_status'),
 loadXpAwardPages(),
 s.profile?.role==='admin'?api.rpc('academy_admin_self',{p_action:'status',p_payload:{}}):Promise.resolve({data:null,error:null})
 ]);
 if(s.user?.id!==loadingAccount)return;
 if(all[0].error)throw all[0].error;if(all[1].error)throw all[1].error;
 if(all[2].error)throw new Error('Mitgliedschaft konnte nicht geladen werden: '+formatError(all[2].error));
 if(all[3].error)throw new Error('Lernfortschritt konnte nicht geladen werden: '+formatError(all[3].error));
 if(all[4].error)throw new Error('Tarif- und Lernkontingent konnten nicht geladen werden: '+formatError(all[4].error));
 if(all[3].data?.payload!==undefined&&(!all[3].data.payload||typeof all[3].data.payload!=='object'||Array.isArray(all[3].data.payload)))throw new Error('Lernfortschritt hat ein ungültiges Format und wurde nicht überschrieben.');
 s.courses=all[0].data||[];s.lessons=all[1].data||[];
 s.tier=['free','pro','ultimate','max'].includes(all[4].data?.tier)?all[4].data.tier:'free';
 s.daily=all[4].error?null:all[4].data;
 s.adminSelf=all[6]?.error?null:all[6]?.data||null;
 s.adminSelfError=all[6]?.error?formatError(all[6].error):'';
 s.planExpires=s.profile?.role==='admin'?s.adminSelf?.plan_expires_at||null:all[2].data?.expires_at||null;
 s.discount=s.daily?.discount||null;
 if(all[4].error)notice('Kontingent konnte nicht geladen werden: '+formatError(all[4].error));
 if(all[5]?.error)throw all[5].error;
 s.xpAwards=(all[5]?.data||[]).filter(row=>row&&typeof row.lesson_id==='string');
 var data=all[3].data?.payload||{};
 s.progress={...data,done:Array.isArray(data.done)?data.done:[],watched:Array.isArray(data.watched)?data.watched:[],exams:data.exams||{},practiced:Array.isArray(data.practiced)?data.practiced:[],verifiedPractice:Array.isArray(data.verifiedPractice)?data.verifiedPractice:[],completedAt:data.completedAt&&typeof data.completedAt==='object'?data.completedAt:{}};
 s.progressBase=window.LLProgressSync.copy(s.progress);
 s.progressVersion=all[3].data?.updated_at||null;
 progressQueueAccount=loadingAccount;
 lastQueuedProgress=window.LLProgressSync.copy(s.progress);
 failedProgressBase=null;
 
 // Show the daily reward as soon as the profile and course index are ready.
 // Optional social/exam queries must NEVER postpone or hide the popup.
 const wasLoggedIn=s.ready;
 s.ready=true;
 if(!wasLoggedIn){
  s.streakModalOpen=true;
  s.loginStreak=null;
  s.streakError='';
  s.streakLoading=true;
 }
 frame();
 render();
 // Show the Streak prompt once per login, not after changing a voucher or plan.
 if(!wasLoggedIn)void refreshStreakStatus()
  .catch(error=>{if(s.user?.id===loadingAccount)s.streakError=formatError(error);})
  .finally(()=>{if(s.ready&&s.user?.id===loadingAccount){paintStreakModal();frame();}});
 void Promise.allSettled([
  api.rpc('academy_exam_status'),
  api.rpc('academy_social_list'),
  api.rpc('academy_entitled_courses'),
  api.rpc('academy_social_media_list'),
  api.rpc('academy_service',{p_action:'list',p_payload:{}}),
  api.rpc('academy_shop_offers',{})
 ]).then(results=>{
  if(!s.ready||s.user?.id!==loadingAccount)return;
  const data=results.map(x=>x.status==='fulfilled'&&!x.value?.error?x.value?.data:null);
  s.examStatus=data[0]||null;
  s.social=data[1]||null;
  s.entitledCourses=s.shopEnabled?(data[2]||null):null;
  s.socialMedia=data[3]||{};
  if(data[4]&&Array.isArray(data[4].mine))s.service=data[4];
  if(Array.isArray(data[5]))s.shopOffers=data[5];
  if(!s.streakModalOpen&&parseRoute().page==='home')render();
 }).catch(()=>{});
 await navigateCurrent();
}
async function logout(){
 // Retire in-flight responses before calling the asynchronous auth sign-out.
 progressSessionEpoch++;progressQueueAccount=null;lastQueuedProgress=null;failedProgressBase=null;
 s.ready=false;navigationId++;
 window.LLStudio?.clear?.();window.LLI18n?.setAccount?.('');window.LLLearning?.clear?.();
 try{await api.auth.signOut();}catch(e){}
 s.authScreen='login';s.streakModalOpen=false;s.streakError='';s.loginStreak=null;
 s.user=null;s.profile=null;s.lesson=null;s.courses=[];s.lessons=[];s.xpAwards=[];
 s.progress={done:[],watched:[],practiced:[],verifiedPractice:[],exams:{}};s.progressBase=null;s.progressVersion=null;
 s.daily=null;s.adminSelf=null;s.planExpires=null;s.entitledCourses=null;s.vouchers=[];
 s.service={beta_open:true,mine:[],admin:[]};s.serviceError='';s.chatTicketId=null;s.chatMessages=[];
 s.social=null;s.socialMedia={};s.members=[];s.memberPlans={};s.memberExpiry={};s.adminLearner=null;
 s.quizPassed=false;s.quizAnswers=[];s.draft='';s.ready=false;
 paintStreakModal();location.hash='#home';login();
}
// Each queued snapshot is compared with the PREVIOUS queued snapshot,
// not the original server state. This preserves a quick reset performed while
// a completion is still being written and protects unrelated remote changes.
let progressWriteTail=Promise.resolve();
let progressQueueAccount=null,lastQueuedProgress=null,failedProgressBase=null,progressSessionEpoch=0;
function saveProgress(){
 const accountId=s.user?.id;
 if(!accountId)return Promise.reject(new Error('Kein angemeldetes Konto für den Lernfortschritt.'));
 const sync=window.LLProgressSync;
 if(!sync)return Promise.reject(new Error('Fortschritt-Synchronisierung konnte nicht geladen werden.'));
 if(progressQueueAccount!==accountId){
  progressQueueAccount=accountId;
  lastQueuedProgress=sync.copy(s.progressBase||{});
  failedProgressBase=null;
 }
 const accountProgress=sync.copy(s.progress||{});
 delete accountProgress.quizProgress;
 const previousDraft=sync.copy(lastQueuedProgress||s.progressBase||{});
 lastQueuedProgress=sync.copy(accountProgress);
 const session=progressSessionEpoch;
 const write=async()=>{
  if(s.user?.id!==accountId||!s.ready||progressSessionEpoch!==session)throw Error('Konto während der Speicherung gewechselt.');
  // A rejected earlier write must be incorporated into the next snapshot.
  const base=sync.copy(failedProgressBase||previousDraft);
  let saved;
  try{saved=await sync.save(api,accountId,'liverylab-v10',base,accountProgress);}
  catch(error){
   if(s.user?.id===accountId&&progressSessionEpoch===session&&!failedProgressBase)failedProgressBase=sync.copy(base);
   throw error;
  }
  if(s.user?.id!==accountId||!s.ready||progressSessionEpoch!==session)return;
  failedProgressBase=null;
  s.progress=sync.merge(accountProgress,s.progress,saved.payload);
  s.progressBase=sync.copy(saved.payload);
  s.progressVersion=saved.updated_at;
  frame();
 };
 const next=progressWriteTail.catch(()=>{}).then(write);
 progressWriteTail=next.catch(()=>{});
 return next;
}
function go(path){var h='#'+path;if(location.hash===h){navigateCurrent();}else{location.hash=h;}sidebar.classList.remove('open');syncBackdrop();}
function parseRoute(){
 const parts=(location.hash||'#home').slice(1).split('/');
 const decode=part=>{try{return decodeURIComponent(part||'');}catch(_){return part||'';}};
 return {page:decode(parts[0])||'home',id:decode(parts[1])};
}
let navigationId=0;
async function navigateCurrent(){
 if(!s.ready)return;
 const request=++navigationId,hash=location.hash;
 const isCurrent=()=>s.ready&&request===navigationId&&hash===location.hash;
 var route=parseRoute();s.route=route.page;
 if(route.page==='lesson'){
   s.choice=null;s.quizStep=0;s.quizPassed=false;s.quizAnswers=[];s.sectionIndex=0;s.hintStage=0;s.lessonStep=1;s.videoChecked=watchedIds().has(route.id);s.practiceChecked=(s.progress.verifiedPractice||[]).includes(route.id);s.draft=readDraft(route.id);s.videoLoaded=false;s.lesson=null;s.lessonGate=null;
   frame();content.innerHTML='<div class="center-screen"><div class="spinner"></div><p>Geschützte Lektion wird geladen …</p></div>';
   var meta=s.lessons.find(function(l){return l.id===route.id;});
   if(meta&&allowed(meta)){
    const result=await api.rpc('academy_open_lesson',{p_lesson:route.id});
    if(!isCurrent())return;
    if(result.error){s.lessonGate={reason:'error',error:formatError(result.error)};notice(formatError(result.error));}
    else if(result.data?.allowed){
      const cloud=await window.LLLearning?.load?.(route.id);
      if(!isCurrent())return;
      s.lesson=result.data;
      if(cloud){s.draft=cloud.content;s.lessonStep=cloud.step;}
      const quiz=s.lesson.payload||{},bank=quizQuestions(quiz),savedLocal=readQuizLocal(route.id),old=s.progress.quizProgress?.[route.id];
      const savedQuiz=savedLocal||old; // One-time import of previous account quiz state into this browser.
      if(doneIds().has(route.id)){s.quizPassed=true;s.quizStep=Math.max(0,bank.length-1);}
      else if(savedQuiz&&savedQuiz.total===bank.length&&savedQuiz.version===Number(quiz.quiz_version||1)&&Array.isArray(savedQuiz.answers)&&savedQuiz.answers.length===(savedQuiz.passed?bank.length:Math.max(0,Number(savedQuiz.step)||0))){
        s.quizStep=Math.max(0,Math.min(bank.length-1,Number(savedQuiz.step)||0));s.quizPassed=!!savedQuiz.passed;s.quizAnswers=[...savedQuiz.answers];
        if(!savedLocal)saveQuizLocal(route.id,savedQuiz);
      }
      const count=window.LLCurriculum?.parts?.(quiz)?.length||1;
      try{s.sectionIndex=Math.min(count-1,Math.max(0,Number(localStorage.getItem(lessonLocalKey('part',route.id)))||0));}catch(_){s.sectionIndex=0;}
      s.progress.lastLesson={id:route.id,step:s.lessonStep,at:new Date().toISOString()};void saveProgress().catch(()=>{});if(s.daily){s.daily.used_today=result.data.used;s.daily.remaining_today=result.data.remaining;}}else{s.lessonGate=result.data||{reason:'error'};}}
 }
 if(route.page==='admin'&&s.profile?.role==='admin'){try{await Promise.all([fetchMembers(),fetchVouchers(),fetchRegistrationPolicy(true)]);}catch(e){notice('Administration: '+formatError(e));}}
 if(route.page==='support'||route.page==='admin'||route.page==='plans'){try{await refreshService();}catch(e){notice('Support: '+formatError(e));}}
 if(route.page==='plans'||route.page==='admin'){try{await refreshShopOffers();}catch(e){notice('Shop: '+formatError(e));}}
 if(route.page==='script'&&hasScript()){await loadProjectTab();}
 if(route.page==='reference'&&fullAccess()&&!s.referenceData){const ref=await api.rpc('academy_reference_get');if(!ref.error)s.referenceData=ref.data||{};}
 if(route.page==='friends'||route.page==='profile'){try{const r=await api.rpc('academy_social_list');if(!r.error)s.social=r.data;}catch(_){}}
 if(route.page==='exam'&&route.id){await loadExam(route.id);}
 if(!isCurrent())return;
 render();window.scrollTo({top:0,behavior:'instant'});
 if(route.page==='lesson'&&s.lesson)window.LLLearning?.restore?.(route.id,s.lessonStep);
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
 if(!s.shopEnabled&&parseRoute().page==='plans'){go('home');return;}
 frame();const r=parseRoute();
 const pages={home:homePage,menu:neonMenuPage,courses:coursesPage,track:()=>trackPage(r.id),lesson:()=>lessonPage(r.id),
  script:()=>hasScript()?scriptPage():paywall('Script-Werkstatt','Plus','Codebeispiele sind ab Plus verfügbar.'),plans:plansPage,exams:examsPage,exam:()=>examPage(r.id),
  reference:()=>fullAccess()?referencePage():paywall('Code-Referenzen','Max','Die vollständige Sprachbibliothek gehört zum höchsten Tarif.'),profile:profilePage,portfolio:()=>window.LLStudio?.portfolioPage?.()||'<p>Portfolio wird geladen …</p>',skilltree:()=>window.LLStudio?.skilltreePage?.()||'<p>Skilltree wird geladen …</p>',notes:()=>window.LLStudio?.notesPage?.()||'<p>Notizen werden geladen …</p>',challenges:()=>window.LLStudio?.challengesPage?.()||'<p>Challenges werden geladen …</p>',calendar:()=>window.LLStudio?.calendarPage?.()||'<p>Lernkalender wird geladen …</p>',level:()=>window.LLStudio?.levelPage?.()||'<p>Level werden geladen …</p>',friends:friendsPage,support:supportPage,settings:settingsPage,admin:adminPage};
 const html=(pages[r.page]||homePage)();
 const decorative=['home','menu','script','plans','exams','reference','profile','portfolio','skilltree','notes','challenges','calendar','level','friends','support','settings','admin'].includes(r.page);
 content.innerHTML=decorative?'<div class="ll-neon-screen ll-neon-'+r.page+'">'+html+'</div>':html;
 if(r.page==='settings')renderMFA();
 paintStreakModal();
 paintTimer();
 updateMembershipClocks();
 paintEditorLines();
 if(r.page==='lesson'&&s.lesson){updateLessonControls();paintMarkupPreview();}
 window.LLI18n?.apply?.();
}
function htmlCssPreview(code,lang){
 const csp='<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src data: blob:; font-src data:;">';
 const reset='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
 const source=String(code||'').slice(0,10000);
 if(lang==='html')return '<!doctype html>'+reset+csp+source;
 const css=source.replace(/<\/style/ig,'<\\/style');
 return '<!doctype html><html><head>'+reset+csp+'<style>body{font:16px system-ui;padding:20px;color:#17131f;background:#fff} .demo{border:1px dashed #c9bddb;padding:24px;border-radius:12px}'+css+'</style></head><body><div class="demo"><h1>CSS-Vorschau</h1><p>Diese Elemente zeigen deine Farben, Schriften und Abstände.</p><button>Beispielbutton</button><ul><li>Erster Eintrag</li><li>Zweiter Eintrag</li></ul></div></body></html>';
}
let markupPreviewTimer=null;
function paintMarkupPreview(){
 const frame=$('#practice-preview-frame'),input=$('#practice-input');
 if(!frame||!input||!s.lesson)return;
 const lang=String(s.lesson.payload?.lang||'').toLowerCase();
 if(lang!=='html'&&lang!=='css')return;
 // srcdoc is inert inside an opaque-origin iframe without allow-scripts.
 frame.srcdoc=htmlCssPreview(input.value,lang);
}
function scheduleMarkupPreview(){
 clearTimeout(markupPreviewTimer);
 markupPreviewTimer=setTimeout(paintMarkupPreview,250);
}
function paintEditorLines(){const input=$('#practice-input'),lines=$('#code-lines');if(input&&lines&&typeof input.value==='string')lines.textContent=Array.from({length:Math.max(1,input.value.split('\n').length)},(_,i)=>i+1).join('\n')}


function stats(){
 const done=s.lessons.filter(l=>inMainPath(l)&&allowed(l)&&doneIds().has(l.id)).length,available=s.lessons.filter(l=>inMainPath(l)&&allowed(l)).length,started=s.courses.filter(c=>countDone(c.id)>0).length;
 return '<div class="stats-grid">'+
  '<div class="stat-card"><strong>'+done+'<span class="stat-total">/'+available+'</span></strong><small>LEKTIONEN</small></div>'+
  '<div class="stat-card"><strong>'+xpEarned()+'</strong><small>XP</small></div>'+
  '<div class="stat-card"><strong>'+started+'</strong><small>LERNPFADE</small></div>'+
  '<div class="stat-card"><strong>'+pct(done,available)+'%</strong><small>FORTSCHRITT</small></div>'+
  '</div>';
}


/* Roadmap v1.5: all visuals use real lesson metadata and saved progress. */
function roadmapCourseDescription(course){
 const copy={
  'coding-basics':'Dein Einstieg ins Programmieren: verstehen, ausprobieren und eigenen Code schreiben.',
  lua:'Die vielseitige Skriptsprache für Games, FiveM, Tools und eigene Projekte.',
  python:'Von der ersten Variable bis zu Automatisierungen, APIs und eigenen Anwendungen.',
  javascript:'Interaktive Websites, Browser-Apps und moderne JavaScript-Projekte entwickeln.',
  typescript:'TypeScript sicher einsetzen: Typen, Architektur und große Anwendungen.',
  html:'Baue den Inhalt echter Websites mit verständlichem, semantischem HTML.',
  css:'Gestalte moderne Websites mit Layouts, Animationen und Responsive Design.',
  sql:'Daten lesen, verbinden, verändern und professionelle Abfragen verstehen.',
  react:'Erstelle interaktive React-Oberflächen Schritt für Schritt.',
  nodejs:'Baue APIs und Backends mit modernen Node.js-Werkzeugen.',
  fivem:'Schreibe eigene FiveM-Resources von den Lua-Grundlagen bis zum Projekt.',
  qbcore:'Lerne professionelle QBCore-Scripts, Events, Daten und Framework-Architektur.',
  esx:'Entwickle und verstehe ESX-Resources, Jobs und serverseitige Abläufe.',
  'blender-fundamentals':'Modelliere deine ersten 3D-Objekte und gestalte komplette Szenen.',
  'blender-animation':'Setze eigene 3D-Modelle mit Keyframes und Bewegung in Szene.',
  'blender-technical':'Baue technische 3D-Workflows mit Geometry Nodes und Blender-Python.',
  'blender-fivem-assets':'Von Blender zum optimierten, einsatzfähigen Game-Asset.',
  rust:'Lerne sichere Systemprogrammierung mit Ownership, Traits und Projekten.',
  cpp:'C++ meistern: moderne Sprachelemente, Speicherverwaltung und robuste Software.'
 };
 if(copy[course.id])return copy[course.id];
 const cat=String(course.category||'').toLowerCase();
 if(cat.includes('blender')||cat.includes('3d'))return 'Modelliere, gestalte und optimiere eigene 3D-Projekte – Schritt für Schritt.';
 if(cat.includes('fivem')||cat.includes('framework'))return 'Baue eigene Scripts, verstehe Events und entwickle stabile Game-Systeme.';
 if(cat.includes('web'))return 'Entwickle moderne Websites und Anwendungen von den Grundlagen bis zum Projekt.';
 if(cat.includes('tool'))return 'Lerne die Werkzeuge und Arbeitsabläufe für professionelle Projekte kennen.';
 if(cat.includes('backend'))return 'Verstehe Daten, Schnittstellen und den Aufbau zuverlässiger Anwendungen.';
 return 'Starte mit kleinen Konzepten und arbeite dich zu eigenen anspruchsvollen Projekten vor.';
}
function roadmapCourseGlyph(course){
 const id=String(course?.id||''),cat=String(course?.category||'');
 if(id==='python')return 'Py';
 if(id==='lua')return '⌘';
 if(id==='javascript')return 'JS';
 if(id==='typescript')return 'TS';
 if(id==='html')return '⟨/⟩';
 if(id==='css')return '#';
 if(id==='rust')return 'Rs';
 if(id==='cpp')return 'C++';
 if(id==='csharp')return 'C#';
 if(id==='sql')return '▤';
 if(cat.includes('Blender')||cat.includes('3D'))return '✧';
 if(cat==='FiveM'||cat==='Frameworks')return '⬡';
 if(cat==='Webentwicklung')return '⟨/⟩';
 return courseAccent(course);
}
function roadmapCoursePreview(course,done,total){
 // Milestones are real progress thresholds. Beginning a long course marks
 // the first node complete, while the second stays active until ~20% mastery.
 const thresholds=[1,.20,.45,.75,1].map((v,i)=>
  i===0?1:Math.max(1,Math.ceil(v*Math.max(1,total))));
 const active=thresholds.findIndex(t=>done<t),icons=['▷','⟨/⟩','⬡','>_','⚑'];
 return '<div class="ll-mini-road" aria-label="'+esc('Fortschrittsvorschau: '+done+' von '+total+' Lektionen abgeschlossen')+'">'+
  thresholds.map((threshold,i)=>{
   const state=total>0&&done>=threshold?'is-done':i===active?'is-active':'is-future';
   return '<span class="ll-mini-stop '+state+'" aria-hidden="true"><span>'+
    (state==='is-done'?'✓':icons[i])+'</span></span>';
  }).join('')+'</div>';
}
function roadmapJourney(){
 const all=s.lessons.filter(inMainPath),completed=doneIds(),total=all.length;
 const done=all.filter(l=>completed.has(l.id)).length;
 const percent=pct(done,total),steps=[
  ['✓','Einstieg','abschließen'],['⟨/⟩','Grundlagen','lernen'],
  ['⌘','Scripting','vertiefen'],['⬡','Projekte','umsetzen'],['⚑','Experte','werden']
 ];
 const progressThresholds=[3,20,45,75,100],active=progressThresholds.findIndex(p=>percent<p);
 return '<section class="ll-journey" aria-label="'+catalogText('Deine Lernreise','Your learning journey')+'">'+
  '<div class="ll-journey-head"><div><span class="ll-journey-flag">⚑</span><h2>'+catalogText('Deine Lernreise','Your learning journey')+'</h2></div>'+
  '<span class="ll-journey-percent">'+catalogText('Gesamtfortschritt','Total progress')+' <strong>'+percent+'%</strong></span></div>'+
  '<div class="ll-journey-steps">'+steps.map((step,i)=>{
    const reached=percent>=progressThresholds[i],current=!reached&&i===active;
    const name=catalogEnglish()?[
      ['Finish','the basics'],['Learn','the essentials'],['Deepen','your coding'],
      ['Build','projects'],['Become','an expert']
    ][i]:[step[1],step[2]];
    return '<div class="ll-journey-step '+(reached?'is-done':current?'is-active':'is-future')+'">'+
     '<span class="ll-journey-node" aria-hidden="true">'+(reached?'✓':!current&&(i===2||i===3)?roadmapLockIcon():step[0])+'</span>'+
     '<span class="ll-journey-label">'+esc(name[0])+'<br>'+esc(name[1])+'</span></div>';
  }).join('')+'</div>'+
  '<div class="ll-journey-foot"><span>'+done+' / '+total+' '+catalogText('Lektionen abgeschlossen','lessons completed')+'</span>'+
  '<span>'+catalogText('Dein Fortschritt wird automatisch gespeichert.','Your progress is saved automatically.')+'</span></div></section>';
}
function courseCard(c){
 const lessons=lessonsOf(c.id),done=countDone(c.id),total=lessons.length;
 const complete=total>0&&done===total,free=lessons.some(l=>l.required_plan==='free');
 const ratio=pct(done,total),blender=String(c.category||'').includes('Blender');
 return '<article class="course-card ll-path-course'+(complete?' is-complete':'')+'" data-roadmap-course="'+esc(c.id)+'">'+
  '<div class="ll-course-card-ambient" aria-hidden="true"></div>'+
  '<div class="course-head ll-course-card-top">'+
   '<span class="course-icon ll-course-emblem" aria-hidden="true">'+esc(roadmapCourseGlyph(c))+'</span>'+
   '<span class="chip ll-entry-chip '+(complete||free?'free':'plus')+'">'+
   (complete?'✓ '+catalogText('Geschafft','Completed'):free?'✧ '+catalogText('Einstieg frei','Free start'):'✦ '+catalogText('Aufbaukurs','Advanced'))+'</span></div>'+
  '<div class="ll-course-title-row"><span class="micro ll-course-category">'+esc(c.category)+'</span>'+
   '<h3>'+esc(c.name)+'</h3><p class="ll-course-description">'+esc(roadmapCourseDescription(c))+'</p></div>'+
  '<div class="ll-path-chip-row"><span class="ll-path-chip"><span aria-hidden="true">▥</span>'+levelText(c.level)+'</span>'+
   difficultyBadge(c)+'<span class="ll-path-chip ll-path-lesson-count"><span aria-hidden="true">▣</span> '+total+' '+catalogText('Lektionen','lessons')+'</span></div>'+
  '<div class="ll-course-progress"><div class="meta-line"><span>'+done+' / '+total+' '+catalogText('abgeschlossen','completed')+'</span>'+
   '<strong>'+ratio+'%</strong></div>'+
  '<div class="progress" role="progressbar" aria-valuenow="'+done+'" aria-valuemin="0" aria-valuemax="'+total+'" aria-label="'+esc('Kursfortschritt '+c.name)+'"><span style="width:'+ratio+'%"></span></div></div>'+
   roadmapCoursePreview(c,done,total)+
  '<button class="btn block ll-course-cta'+(!done?' is-start':'')+'" type="button" data-go="track/'+esc(c.id)+'">'+
   (complete?catalogText('Kurs ansehen ✓','Review course ✓'):done?catalogText('Lernpfad fortsetzen →','Continue learning →'):catalogText('Lernpfad öffnen →','Open learning path →'))+'</button>'+
  '</article>';
}

function installCriticalStyles(){
 if(document.getElementById&&document.getElementById('liverylab-v20-critical'))return;
 if(document.createElement&&document.head){const st=document.createElement('style');st.id='liverylab-v20-critical';st.textContent="\n/* v20 guaranteed layout: protect against cached v18 styles on mobile Safari */\n.ll-icon{display:inline-block!important;width:22px!important;height:22px!important;min-width:0!important;max-width:100%!important;flex-shrink:0!important;vertical-align:middle!important}\n.ll-shortcut-symbol .ll-icon{width:27px!important;height:27px!important}\n.ll-home-continue .ll-icon{width:33px!important;height:33px!important}\n.ll-home-level .ll-icon{width:26px!important;height:26px!important}\n.ll-streak-modal .ll-icon{width:22px!important;height:22px!important}\n.ll-home-dashboard{display:block;width:100%;max-width:1060px;margin:auto}\n.ll-home-brand-banner{width:100%;overflow:hidden;border-radius:20px;aspect-ratio:2.63/1;margin-bottom:24px;border:1px solid #6f378c;background:#170b27}\n.ll-home-brand-banner img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}\n.ll-home-greeting{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,240px);gap:14px;align-items:center;margin:20px 0}\n.ll-home-greeting h1{font-size:clamp(27px,4vw,42px);line-height:1.17;margin:8px 0}\n.ll-home-greeting p{font-size:13px;color:#c7b8dd;line-height:1.6}\n.ll-home-level{border:1px solid #8b4abe;background:#261638;border-radius:16px;padding:16px;min-width:0}\n.ll-level-top{display:flex;align-items:center;gap:7px;font-size:18px;font-weight:800}\n.ll-home-level small{display:block;font-size:11px;margin:7px 0;color:#c3b0d4}\n.ll-level-bar{height:8px;border-radius:10px;background:#39254e;overflow:hidden}\n.ll-level-bar span{display:block;height:100%;background:linear-gradient(90deg,#9d54ee,#e792fe);border-radius:10px}\n.ll-home-continue{display:flex;align-items:center;flex-wrap:wrap;gap:14px;padding:18px;border:1px solid #ac65f1;border-radius:20px;background:linear-gradient(125deg,#29183c,#160e27);margin:22px 0;box-shadow:0 0 20px #9e45d829}\n.ll-continue-icon{display:grid;place-items:center;flex:0 0 56px;width:56px;height:56px;border-radius:14px;background:#58237f}\n.ll-continue-copy{min-width:0;flex:1}\n.ll-continue-copy h2{font-size:clamp(17px,3vw,24px);margin:5px 0}\n.ll-continue-copy p{font-size:12px;color:#c4b2d5;margin:0 0 9px}\n.ll-continue-progress{display:flex;align-items:center;gap:9px}.ll-continue-progress .ll-level-bar{flex:1}.ll-continue-progress strong{font-size:12px}\n.ll-continue-button{min-height:46px;display:inline-flex;align-items:center;justify-content:center;gap:6px;max-width:100%;margin-left:auto}\n.ll-home-heading{margin:30px 0 15px}.ll-home-heading h2{font-size:23px;margin:8px 0}.ll-home-heading p{font-size:13px;color:#bfaed0}\n.ll-home-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;width:100%}\n.ll-home-shortcut{display:flex;align-items:center;gap:12px;border:1px solid #654180;background:linear-gradient(135deg,#251633,#150f22);border-radius:16px;min-height:98px;padding:13px;color:#f4ecff;min-width:0;text-align:left}\n.ll-home-shortcut.wide{grid-column:1/-1}\n.ll-shortcut-symbol{flex:0 0 42px;width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#41215e;color:#d79cff}\n.ll-shortcut-text{flex:1;min-width:0}.ll-shortcut-text strong{display:block;font-size:15px;line-height:1.3}.ll-shortcut-text small{display:block;font-size:11px;color:#c8b5d8;line-height:1.5;margin-top:5px}\n.ll-home-shortcut>.ll-icon{width:15px!important;height:15px!important}\n.ll-home-more{margin:32px 0}\n.bottom-nav{display:none!important}\n@media(max-width:820px){.bottom-nav{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;width:100%;align-items:stretch}}\n.bottom-item{min-width:0!important;max-width:100%!important;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:3px;min-height:63px;font-size:11px;white-space:nowrap}\n.bottom-item>.side-icon{display:grid;place-items:center;width:26px;height:26px}\n#streak-portal{position:relative;z-index:3000}\n.ll-streak-backdrop{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;padding:15px;background:#080310c9;backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}\n.ll-streak-modal{position:relative;width:min(100%,470px);max-height:calc(100dvh - 30px);overflow:auto;padding:35px 25px 24px;background:radial-gradient(ellipse at 50% 0%,#552879,#1b0e2c 65%);border:2px solid #bd65ff;border-radius:25px;text-align:center;color:#f7efff;box-shadow:0 0 35px #a02bf6,0 20px 90px #050109}\n.ll-streak-emblem{display:flex;justify-content:center;align-items:center;margin:0 auto 13px}.ll-fire-emblem{display:grid;place-items:center;width:75px;height:75px;border-radius:18px;background:#5f268d;color:#ffb048;border:1px solid #c579ff}\n.ll-streak-modal h2{font-size:38px;margin:7px 0 10px}.ll-streak-lede{color:#e4d3f1;margin-bottom:17px}\n.ll-streak-counter{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:13px 10px;background:#44235b;border:1px solid #a65ae4;border-radius:90px;margin:0 0 17px}\n.ll-streak-counter strong{font-size:19px;color:#e9c7fc}\n.ll-streak-instructions{font-size:13px;line-height:1.55;color:#e0cfeb;margin-bottom:18px}\n.ll-streak-claim{display:flex;align-items:center;justify-content:center;gap:12px;min-height:58px;width:100%;border:1px solid #e6a7ff;border-radius:15px;background:linear-gradient(135deg,#d34efc,#7620dd);color:white;font-size:25px;font-weight:900;box-shadow:0 0 20px #a934e7}\n.ll-streak-next{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:14px;padding:13px;background:#3b234d;border-radius:12px;font-size:12px;line-height:1.5}\n.ll-modal-close{position:absolute;top:13px;right:13px;width:35px;height:35px;background:#46245c;border:1px solid #9661bd;border-radius:50%;display:grid;place-items:center;color:#fff}\n.ll-streak-notice{padding:10px;color:#eacdf2}.ll-streak-notice p{font-size:13px;line-height:1.5}\n@media(max-width:760px){.ll-home-greeting{grid-template-columns:1fr}.ll-home-continue .ll-continue-button{width:100%;margin-left:0}}\n@media(max-width:500px){\n .ll-home-dashboard{max-width:100%}.ll-home-brand-banner{border-radius:15px;margin-bottom:18px}\n .ll-home-greeting h1{font-size:27px}\n .ll-home-shortcuts{gap:8px}\n .ll-home-shortcut{padding:10px;gap:7px;min-height:105px}\n .ll-shortcut-symbol{flex-basis:36px;width:36px;height:36px}\n .ll-shortcut-text strong{font-size:12px}\n .ll-shortcut-text small{font-size:10px}\n .ll-home-shortcut>.ll-icon{display:none!important}\n .ll-streak-modal{padding:31px 17px 18px}\n .ll-streak-modal h2{font-size:32px}\n .ll-streak-counter strong{font-size:17px}\n .bottom-item{font-size:10px;padding:6px 1px}\n}\n";document.head.appendChild(st);}
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
 return '<svg width="24" height="24" style="display:inline-block;width:22px;height:22px;max-width:100%;min-width:0;flex-shrink:0;vertical-align:middle" class="ll-icon ll-icon-'+esc(name)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.code)+'</svg>';
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
 const accountId=s.user?.id;
 if(!api||!s.ready||!accountId)return;
 s.streakLoading=true;
 try{const r=await api.rpc('academy_streak_status');if(r.error)throw r.error;
 if(!s.ready||s.user?.id!==accountId)return null;
 s.loginStreak=r.data||null;
 s.streakError='';
 }catch(e){if(s.user?.id===accountId)s.streakError=formatError(e);throw e;}finally{if(s.user?.id===accountId)s.streakLoading=false;}
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
 '<p class="ll-streak-lede">'+(!s.loginStreak?'Dein Belohnungsstatus wird geladen …':ready?'Deine tägliche Belohnung wartet auf dich!':st.claimed_today?'Heute hast du deine Streak bereits gesichert.':'Dein nächster Claim ist noch nicht bereit.')+'</p>'+
 '<div class="ll-streak-counter">'+llIcon('fire')+'<strong>'+n+' '+(n===1?'Tag':'Tage')+' Streak</strong><span>Rekord: '+Number(st.best||0)+'</span></div>'+
 (!s.loginStreak?'<div class="ll-streak-notice"><p>'+(s.streakError?'Verbindung zum Streak-Server fehlgeschlagen: '+esc(s.streakError):'Status wird geladen …')+'</p><button type="button" class="ll-streak-claim" data-streak-retry>'+(s.streakLoading?'Lade …':'Erneut prüfen')+'</button></div>':ready?'<p class="ll-streak-instructions">Drücke auf <strong>Claim</strong>, damit deine Streak weiterläuft. Danach startet die 24-Stunden-Wartezeit.</p>'+
 '<button class="ll-streak-claim" type="button" data-streak-claim '+(s.streakBusy?'disabled':'')+'>'+(s.streakBusy?'Wird eingelöst …':'Claim')+llIcon('arrow')+'</button>'+
 '<div class="ll-streak-next">'+llIcon('clock')+'<span>Nächster Claim nach dem Einlösen: <strong>24:00:00</strong></span></div>':
 '<p class="ll-streak-instructions">Komm morgen wieder und sichere deine Serie. Das nächste Zeitfenster öffnet nach 24 Stunden.</p>'+
 '<div class="ll-streak-claimed">'+llIcon('check')+' Für heute eingelöst</div>'+
 '<div class="ll-streak-next">'+llIcon('clock')+'<span>Nächster Claim in <strong data-streak-countdown>'+durationDisplay(streakRemaining())+'</strong></span></div>')+
 '<p class="ll-streak-timezone">Ein Claim pro Kalendertag (00:00–00:00 Uhr, Deutschland). Wird ein ganzer Tag übersprungen, startet die Serie wieder bei 1.</p><button type="button" class="ll-streak-later" data-streak-close>Weiter zur Academy</button></section></div>';
}
function paintStreakModal(){
 let root=document.querySelector('#streak-portal');
 if(!root&&document.body&&typeof document.createElement==='function'){
  root=document.createElement('div');root.id='streak-portal';document.body.appendChild(root);
 }
 if(!root)return;
 const opened=!!(s.ready&&s.streakModalOpen);
 root.innerHTML=streakModalHtml();
 if(opened&&typeof root.querySelector==='function'){const focus=root.querySelector('[data-streak-claim], [data-streak-retry], [data-streak-close]');if(focus&&document.activeElement===document.body&&typeof focus.focus==='function')focus.focus({preventScroll:true});}
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
 const completed=doneIds(),available=s.lessons.filter(l=>inMainPath(l)&&allowed(l));
 const events=Object.values(s.progress.completedAt||{}).map(x=>new Date(x)).filter(x=>!isNaN(x));
 const now=new Date(),today=events.filter(x=>x.toDateString()===now.toDateString()).length;
 const weekStart=new Date(now);weekStart.setHours(0,0,0,0);weekStart.setDate(now.getDate()-(now.getDay()+6)%7);
 const week=events.filter(x=>x>=weekStart).length;
 const dailyGoal=Math.max(1,Math.min(20,Number(getChoicePreference('goal-'+(s.user?.id||'guest'),'2'))||2));
 const weeklyGoal=Math.max(1,Math.min(100,Number(getChoicePreference('weekly-goal-'+(s.user?.id||'guest'),'10'))||10));
 const last=available.find(l=>l.id===s.progress.lastLesson?.id);
 const inLastCourse=last?lessonsOf(last.course_id).filter(allowed):[];
 const next=last||available.find(l=>!completed.has(l.id)&&['coding-basics','lua','python','fivem'].includes(l.course_id))||available.find(l=>!completed.has(l.id));
 const nextCourse=next?courseOf(next.course_id):null;
 const currentDone=nextCourse?countDone(nextCourse.id):0,total=nextCourse?lessonsOf(nextCourse.id).length:0,progress=pct(currentDone,total);
 const xp=xpEarned(),level=Math.floor(xp/500)+1,levelXp=xp%500;
 const nickname=s.profile?.display_name||s.profile?.username||'Developer';
 const streak=Number(s.loginStreak?.current||0),ready=!!s.loginStreak?.claimable;
 const picks=['coding-basics','lua','python','javascript'].map(courseOf).filter(Boolean);
 return '<div class="ll-home-dashboard">'+neonHero('home')+
 '<section class="ll-home-brand-banner"><img src="./novalab-banner.webp" alt="NovaLab Academy – Learn. Code. Grow. – violette Skyline" loading="eager" fetchpriority="high"></section>'+ownPlanCountdownHtml()+
 '<div class="ll-home-greeting"><div><span class="eyebrow">DEIN PERSÖNLICHES DASHBOARD</span>'+
 '<h1>Willkommen zurück, <span class="gradient">'+esc(nickname)+'</span>!</h1><p>Lerne programmieren, entwickle Projekte und erreiche deine nächsten Ziele.</p></div>'+
 '<div class="ll-home-level"><div class="ll-level-top">'+llIcon('xp')+'<span>Level '+level+'</span></div>'+
 '<small>'+levelXp+' / 500 XP bis Level '+(level+1)+'</small><div class="ll-level-bar"><span style="width:'+(levelXp/5)+'%"></span></div></div></div>'+
 atelierMissionStrip()+
 '<div class="ll-home-metrics"><div><span>✦</span><strong>'+xp+' XP</strong><small>Gesammelt</small></div><div><span>✓</span><strong>'+completed.size+'</strong><small>Lektionen geschafft</small></div><div><span>↗</span><strong>'+s.courses.length+'</strong><small>Lernpfade entdecken</small></div><div><span>🔥</span><strong>'+streak+' Tage</strong><small>Deine Streak</small></div></div>'+
 '<section class="ll-home-continue"><div class="ll-continue-icon">'+llIcon('code')+'</div>'+
 '<div class="ll-continue-copy"><span class="eyebrow">WEITERLERNEN</span>'+
 '<h2>'+esc(nextCourse?.name||'Deine Lernreise beginnt hier')+'</h2>'+
 (nextCourse?difficultyBadge(nextCourse):'')+
 '<p>'+esc(next?.title||'Wähle deinen ersten Kurs und starte mit dem Programmieren.')+'</p>'+
 '<div class="ll-continue-progress"><div class="ll-level-bar"><span style="width:'+progress+'%"></span></div><strong>'+progress+' %</strong></div></div>'+
 '<button type="button" class="btn primary ll-continue-button" data-go="'+(next?'lesson/'+esc(next.id):'courses')+'">Jetzt fortsetzen '+llIcon('arrow')+'</button></section>'+
 atelierCourseRail()+
 '<section class="ll-home-tools"><div class="ll-tool-card"><span class="eyebrow">DEIN TAGESZIEL</span><h3>'+today+' / '+dailyGoal+' Lektionen heute</h3><div class="progress"><span style="width:'+Math.min(100,Math.round(today/dailyGoal*100))+'%"></span></div><p>Abgeschlossene Lektionen seit Mitternacht auf diesem Konto.</p><select class="select" id="study-goal" aria-label="Tagesziel">'+[1,2,3,4,5,6,7,8,9,10,15,20].map(n=>'<option value="'+n+'" '+(dailyGoal===n?'selected':'')+'>'+n+' Lektionen</option>').join('')+'</select></div><div class="ll-tool-card"><span class="eyebrow">DEIN WOCHENZIEL</span><h3>'+week+' / '+weeklyGoal+' Lektionen</h3><div class="progress"><span style="width:'+Math.min(100,Math.round(week/weeklyGoal*100))+'%"></span></div><p>Montag bis Sonntag · neu abgeschlossene Lektionen.</p><select class="select" id="weekly-goal" aria-label="Wochenziel">'+[3,5,10,15,20,30,50,100].map(n=>'<option value="'+n+'" '+(weeklyGoal===n?'selected':'')+'>'+n+' Lektionen</option>').join('')+'</select></div><div class="ll-tool-card"><span class="eyebrow">FOKUSZEIT</span><h3 id="focus-clock">'+timerLabel()+'</h3><p>Stelle deine eigene Lernzeit ein.</p><button class="btn small" data-timer-open>Timer einstellen</button></div></section>'+
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
  homeShortcut('book','Portfolio','Eigene Projekte und Erfahrungen sammeln.','portfolio',false,false)+
  homeShortcut('xp','Skilltree','Lernfortschritte nach Themen entdecken.','skilltree',false,false)+
  homeShortcut('exam','Challenges','Tagesaufgaben und Lernkalender öffnen.','challenges',false,false)+
 homeShortcut('book','Support & Feedback','Fehler melden, Hilfe bekommen und Antworten lesen.','support',false,false)+
 homeShortcut('settings','Einstellungen','Account, Sicherheit und persönliches Design.','settings',false,true)+
 homeShortcut('learn','Hauptmenü','Alle Bereiche der Academy auf einen Blick.','menu',false,false)+
 homeShortcut('profile','Mein Profil','Erfolge ansehen und freigeschalteten Titel wählen.','profile',false,false)+
 (s.shopEnabled?homeShortcut('xp','Mitgliedschaften','Free, Plus, Ultimate und Max vergleichen.','plans',false,false):'')+
 (s.profile?.role==='admin'?homeShortcut('settings','Administration','Freigaben, Mitglieder und Gutscheine verwalten.','admin',false,true):'')+'</div>'+
 '<section class="ll-home-focus"><div><span class="eyebrow">[ ◎ ] DEIN FOKUS</span><h2>Was willst du als Nächstes lernen?</h2><p>Wähle einen Bereich für eine direkte Empfehlung. Die Auswahl bleibt auf diesem Gerät.</p></div><div class="ll-focus-actions">'+[['coding-basics','Programmieren'],['fivem','FiveM'],['blender-fundamentals','Blender']].filter(([id])=>!!courseOf(id)).map(([id,label])=>'<button type="button" class="btn small '+(getChoicePreference('focus','coding-basics')===id?'primary':'')+'" data-focus-course="'+id+'">'+label+'</button>').join('')+'</div>'+
 '<div class="ll-focus-result">'+(function(){const preferred=courseOf(getChoicePreference('focus','coding-basics'))||picks[0];const first=preferred&&lessonsOf(preferred.id).find(l=>allowed(l)&&!completed.has(l.id));return preferred?'<strong>'+esc(preferred.name)+'</strong><span>'+countDone(preferred.id)+' von '+lessonsOf(preferred.id).length+' Lektionen geschafft</span><button type="button" class="btn primary small" data-go="'+(first?'lesson/'+esc(first.id):'track/'+esc(preferred.id))+'">'+(first?'Nächste Lektion':'Kurs öffnen')+' →</button>':''})()+'</div></section>'+
 '<section class="ll-home-more"><div class="section-heading"><div><span class="eyebrow">[ ▦ ] WEITERLERNEN</span><h2>Empfohlene Lernpfade</h2></div><button class="btn small" data-go="courses">Alle Kurse →</button></div>'+
 '<div class="course-grid">'+picks.map(courseCard).join('')+'</div></section>'+
 membershipHelp()+'</div>';
}

function catalogEnglish(){return window.LLI18n?.language?.()==='en';}
function catalogText(de,en){return catalogEnglish()?en:de;}
function courseDifficulty(course){return window.LLDifficulty?.score?.(course)||3;}
function filteredCourses(ignoreDifficulty){
 const term=String(s.search||'').trim().toLocaleLowerCase('de');
 return s.courses.filter(function(c){
  const category=s.filter==='Alle'||(s.filter==='Merkliste'?bookmarks().includes(c.id):c.category===s.filter);
  const difficulty=ignoreDifficulty||s.difficultyFilter==='all'||courseDifficulty(c)===Number(s.difficultyFilter);
  const haystack=[c.name,c.category,levelText(c.level),window.LLDifficulty?.searchTerms?.(c)||''].join(' ').toLocaleLowerCase('de');
  return category&&difficulty&&(!term||haystack.includes(term));
 }).sort(function(a,b){var aP=['coding-basics','lua','python','javascript','html','css','blender-fundamentals','fivem'].indexOf(a.id),bP=['coding-basics','lua','python','javascript','html','css','blender-fundamentals','fivem'].indexOf(b.id);if(aP>=0||bP>=0)return (aP<0?99:aP)-(bP<0?99:bP);return a.name.localeCompare(b.name,'de');});
}
function courseFiltersActive(){return s.difficultyFilter!=='all'||s.filter!=='Alle'||!!String(s.search||'').trim();}
function difficultyDiagram(){
 const courses=filteredCourses(true),levels=[1,2,3,4,5],counts=levels.map(n=>courses.filter(c=>courseDifficulty(c)===n).length);
 const maximum=Math.max(1,...counts),english=catalogEnglish();
 return '<section class="ll-difficulty-dashboard" aria-labelledby="ll-difficulty-title">'+
 '<div class="ll-difficulty-dashboard-header"><div><span class="eyebrow">'+catalogText('DEIN SCHWIERIGKEITS-RADAR','YOUR DIFFICULTY RADAR')+'</span>'+
 '<h2 id="ll-difficulty-title">'+catalogText('Wie anspruchsvoll ist dein nächster Kurs?','How challenging is your next course?')+'</h2>'+
 '<p>'+catalogText('Fünf Stufen vom Einstieg bis zum Experten. Tippe auf eine Säule, um die passenden Kurse zu entdecken.','Five levels from first steps to expert topics. Select a bar to find matching courses.')+'</p></div>'+
 '<div class="ll-difficulty-overview-total"><strong>'+courses.length+'</strong><small>'+catalogText('Kurse im Diagramm','courses in chart')+'</small></div></div>'+
 '<div class="ll-difficulty-chart" role="group" aria-label="'+catalogText('Kurse nach Schwierigkeit filtern','Filter courses by difficulty')+'">'+
 levels.map((n,i)=>{
  const active=s.difficultyFilter===n,count=counts[i],label=window.LLDifficulty?.label?.(n)||String(n);
  const desc=window.LLDifficulty?.levelDescription?.(n)||'';
  const height=count?Math.max(10,Math.round(count/maximum*100)):0;
  return '<button type="button" class="ll-difficulty-tile ll-difficulty-tile-'+n+(active?' is-selected':'')+'" data-difficulty-filter="'+n+'" aria-pressed="'+String(active)+'" aria-label="'+esc(label)+' · '+n+'/5 · '+count+' '+catalogText('Kurse','courses')+'" title="'+catalogText('Nach dieser Schwierigkeit filtern','Filter this difficulty')+'">'+
  '<span class="ll-difficulty-tile-top"><span>'+String(n).padStart(2,'0')+' / 05</span><span>'+count+' '+catalogText('Kurse','courses')+'</span></span>'+
  '<span class="ll-difficulty-bar-track" aria-hidden="true"><span class="ll-difficulty-bar" style="height:'+height+'%"><span class="ll-difficulty-bar-glow"></span></span></span>'+
  '<strong class="ll-difficulty-tile-name">'+esc(label)+'</strong>'+
  '<span class="ll-difficulty-tile-description">'+esc(desc)+'</span>'+
  '<span class="ll-difficulty-tile-cta">'+(active?catalogText('✓ Ausgewählt','✓ Selected'):catalogText('Kurse entdecken ↗','Explore courses ↗'))+'</span></button>';
 }).join('')+'</div>'+
 '<div class="ll-difficulty-chart-footer"><span>✦ '+catalogText('Schwierigkeit bedeutet: Wie aufwendig ist das gesamte Fachgebiet? Auch schwere Sprachen beginnen hier mit einfachen Lektionen.','Difficulty means how challenging the full subject is. Even hard languages start with simple lessons here.')+'</span>'+
 (s.difficultyFilter!=='all'?'<button class="ll-difficulty-clear" type="button" data-difficulty-filter="all">'+catalogText('Alle Stufen zeigen','Show all levels')+'</button>':'')+
 '</div></section>';
}
function updateCatalogResults(){
 const list=$('#catalog-container'),count=$('#course-count'),diagram=$('#ll-difficulty-dashboard');
 if(list)list.innerHTML=catalogItems();
 if(count)count.textContent=filteredCourses().length+' '+catalogText('Ergebnisse','results')+' · '+catalogText('Schritt für Schritt','step by step');
 if(diagram)diagram.innerHTML=difficultyDiagram();
 const reset=$('#course-filter-reset');if(reset)reset.disabled=!courseFiltersActive();
 window.LLI18n?.apply?.();
}
function catalogItems(){
 var all=filteredCourses();
 return '<div id="catalog-list" class="course-grid">'+
 (all.slice(0,s.catalogLimit).map(courseCard).join('')||'<div class="empty"><h3>'+catalogText('Keine passenden Kurse','No matching courses')+'</h3><p>'+catalogText('Versuche eine andere Schwierigkeitsstufe oder einen anderen Suchbegriff.','Try another difficulty level or search term.')+'</p><button type="button" class="btn small" data-course-filter-reset>'+catalogText('Filter zurücksetzen','Reset filters')+'</button></div>')+
 '</div><div class="catalog-footer" id="catalog-footer">'+(all.length>s.catalogLimit?
 '<button class="btn" type="button" data-action="more-courses">Weitere '+Math.min(9,all.length-s.catalogLimit)+' Kurse anzeigen ↓</button><p class="micro">'+s.catalogLimit+' von '+all.length+' Kursen angezeigt</p>':'<p class="micro">'+all.length+' Kurse angezeigt</p>')+'</div>';
}
function coursesPage(){
 const cats=['Alle','Merkliste','Programmieren','Sprachen','FiveM','Frameworks','Webentwicklung','3D & Blender','Backend','Tools','Profi-Wissen']
  .filter(c=>c==='Alle'||c==='Merkliste'||s.courses.some(x=>x.category===c));
 const levels=[1,2,3,4,5],selected=s.difficultyFilter==='all'?'all':String(s.difficultyFilter);
 return '<div class="ll-roadmap-catalog">'+
 '<header class="ll-learning-hero"><div class="ll-learning-brand"><img src="./novalab-logo.webp" alt="">'+
 '<span>NovaLab <strong>Academy</strong></span></div>'+
 '<span class="ll-learning-eyebrow">'+catalogText('KURSBIBLIOTHEK · DEIN LERNPFAD','COURSE LIBRARY · YOUR PATH')+'</span>'+
 '<h1>'+catalogText('Lernen','Learn')+'</h1>'+
 '<p>'+catalogText('Dein geführter Lernpfad für Scripting und Entwicklung.','Your guided path to scripting and software development.')+'</p>'+
 '<span class="ll-learning-hero-art" aria-hidden="true"><span>⟨/⟩</span></span></header>'+
 roadmapJourney()+
 '<section class="ll-catalog-roadmap-section" aria-labelledby="ll-my-paths-title">'+
 '<div class="ll-paths-title"><h2 id="ll-my-paths-title">'+catalogText('Mein Lernpfad','My learning paths')+'</h2>'+
 '<span>'+catalogText('Alle Kurse','All courses')+' · '+filteredCourses().length+' '+catalogText('Ergebnisse','results')+'</span></div>'+
 '<div class="catalog-tags ll-roadmap-categories" role="group" aria-label="'+catalogText('Kurskategorie','Course category')+'">'+
 cats.map(c=>'<button class="pill'+(s.filter===c?' active':'')+'" type="button" data-filter="'+esc(c)+'" aria-pressed="'+String(s.filter===c)+'">'+
  (c==='Alle'?'▦ ':c==='Merkliste'?'☆ ':c==='Programmieren'||c==='Sprachen'?'⟨/⟩ ':c.includes('Blender')?'✧ ':'⬡ ')+esc(c)+'</button>').join('')+'</div>'+
 '<div class="ll-roadmap-search-panel"><div class="ll-roadmap-search-header"><span class="eyebrow">'+catalogText('KURSFINDER','COURSE FINDER')+'</span>'+
 '<button class="ll-roadmap-reset" type="button" id="course-filter-reset" data-course-filter-reset '+(courseFiltersActive()?'':'disabled')+'>'+
 catalogText('Filter zurücksetzen','Reset filters')+'</button></div>'+
 '<div class="ll-course-filter-controls"><label class="ll-course-search-label" for="course-search">'+catalogText('Kurs suchen','Search courses')+
 '<input class="input searchbar" id="course-search" type="search" placeholder="'+catalogText('z. B. Lua, Python, Rust …','e.g. Lua, Python, Rust …')+'" value="'+esc(s.search)+'" autocomplete="off"></label>'+
 '<label class="ll-course-difficulty-select-label" for="course-difficulty-select">'+catalogText('Schwierigkeit','Difficulty')+
 '<select class="select" id="course-difficulty-select" aria-label="'+catalogText('Schwierigkeitsgrad auswählen','Select difficulty level')+'">'+
 '<option value="all" '+(selected==='all'?'selected':'')+'>'+catalogText('Alle Schwierigkeitsstufen','All difficulty levels')+'</option>'+
 levels.map(n=>'<option value="'+n+'" '+(selected===String(n)?'selected':'')+'>'+n+'/5 · '+esc(window.LLDifficulty?.label?.(n)||n)+'</option>').join('')+
 '</select></label></div></div>'+
 '<details class="ll-difficulty-disclosure"><summary><span>◈ '+catalogText('Schwierigkeitsdiagramm & Erklärungen','Difficulty chart & descriptions')+'</span>'+
 '<span>'+catalogText('5 Stufen ansehen','Explore 5 levels')+' ⌄</span></summary><div id="ll-difficulty-dashboard">'+difficultyDiagram()+'</div></details>'+
 '<div class="section-heading ll-course-results-heading"><div><span class="eyebrow">'+catalogText('DEINE AUSWAHL','YOUR SELECTION')+'</span>'+
 '<h2>'+catalogText('Passende Kurse','Matching courses')+'</h2>'+
 '<p id="course-count" aria-live="polite">'+filteredCourses().length+' '+catalogText('Ergebnisse','results')+' · '+catalogText('Schritt für Schritt','step by step')+'</p></div>'+
 '<span class="ll-course-results-icon" aria-hidden="true">⌕</span></div>'+
 '<div id="catalog-container">'+catalogItems()+'</div></section></div>';
}

function roadmapLockIcon(){
 return '<svg class="ll-roadmap-lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/></svg>';
}
function roadmapLessonArtwork(lesson,course){
 // Original inline illustrations: a CSS/SVG equivalent to the glowing
 // concept artwork. Never insert course content into raw SVG attributes.
 const title=String(lesson?.title||'').toLocaleLowerCase('de');
 const blender=String(course?.category||'').includes('Blender');
 const isComment=/kommentar|notiz|dokument/.test(title);
 const isType=/datentyp|number|string|boolean|nil|primitive/.test(title);
 const isVariable=/variable|wert|zuweisung/.test(title);
 const isProject=/projekt|abschluss/.test(title);
 const isFunction=/funktion|methode|callback/.test(title);
 const scene=blender?'blender':isType?'types':isComment?'comment':isVariable?'variable':isProject?'project':isFunction?'function':'code';
 const base='<svg class="ll-art-svg ll-art-'+scene+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 108" aria-hidden="true" focusable="false">'+
 '<defs><linearGradient id="ll-art-tile" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8856c8"/><stop offset=".5" stop-color="#45216c"/><stop offset="1" stop-color="#1c183e"/></linearGradient>'+
 '<linearGradient id="ll-art-floor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#543d82" stop-opacity=".8"/><stop offset="1" stop-color="#153b39" stop-opacity=".36"/></linearGradient></defs>'+
 '<path d="M12 81 61 61 110 82 62 103Z" fill="url(#ll-art-floor)" stroke="#63eeb4" stroke-width="1.5" opacity=".86"/>'+
 '<path d="M18 83 61 65 103 83" fill="none" stroke="#a2ffdf" stroke-width="1" opacity=".45"/>';
 let foreground='';
 if(scene==='types'){
   foreground=[['nil',82],['boolean',64],['string',46],['number',28]].map(([word,y])=>
    '<g transform="translate(0 '+(Number(y)-28)+')"><path d="M34 33 78 16 102 26 58 43Z" fill="url(#ll-art-tile)" stroke="#be8bff" stroke-width="1.5"/>'+
    '<text x="66" y="31" fill="#f4d9ff" font-size="10" font-weight="800" text-anchor="middle" transform="rotate(13 66 31)">'+word+'</text></g>').join('');
 } else if(scene==='variable'||scene==='blender'){
   foreground='<path d="M37 37 74 23 95 37 56 51Z" fill="#7142af" fill-opacity=".72" stroke="#bf92ff" stroke-width="1.5"/>'+
    '<path d="M37 37 56 51 56 88 37 73Z" fill="#271c53" stroke="#be96ff" stroke-width="1.5"/>'+
    '<path d="M56 51 95 37 95 74 56 88Z" fill="url(#ll-art-tile)" stroke="#bc8bfa" stroke-width="1.5"/>'+
    (scene==='blender'?'<path d="M47 56 77 44 87 64 57 78Z" fill="none" stroke="#95f0d1" stroke-width="2"/>'+
       '<circle cx="77" cy="44" r="4" fill="#d7b1ff"/><circle cx="57" cy="78" r="4" fill="#8df0c0"/>':
       '<text x="71" y="70" fill="#f2d5ff" text-anchor="middle" font-size="27" font-weight="850">x</text>');
 } else if(scene==='comment'){
   foreground='<path d="M32 30 Q32 20 42 19 L91 23 Q100 23 100 33 L94 69 Q93 77 83 78 L63 76 47 91 48 74 36 73 Q27 72 28 62Z" fill="url(#ll-art-tile)" stroke="#c598ff" stroke-width="2"/>'+
      '<path d="M57 38 45 61 M77 37 64 62" stroke="#ead3ff" stroke-width="6" stroke-linecap="round"/>';
 } else if(scene==='project'){
   foreground='<path d="M61 25 61 85" stroke="#d4b2ff" stroke-width="3" stroke-linecap="round"/>'+
    '<path d="M62 25 Q80 17 96 30 L91 59 Q75 52 61 63Z" fill="url(#ll-art-tile)" stroke="#d1a5ff" stroke-width="2"/>';
 } else if(scene==='function'){
   foreground='<path d="M34 24 88 24 Q94 24 94 31 L91 78 Q91 85 84 85 L35 80 Q28 80 29 73 L29 33 Q29 24 34 24Z" fill="url(#ll-art-tile)" stroke="#be8fff" stroke-width="2"/>'+
      '<text x="61" y="65" text-anchor="middle" fill="#f0d6ff" font-size="39" font-style="italic" font-weight="750">ƒ</text>';
 } else {
   foreground='<path d="M35 27 89 21 Q98 20 97 29 L93 77 Q92 86 84 85 L33 79 Q27 78 28 70 L29 36 Q29 29 35 27Z" fill="url(#ll-art-tile)" stroke="#be8dff" stroke-width="2"/>'+
      '<path d="M52 43 43 51 51 58 M70 40 78 49 69 58 M65 37 58 63" fill="none" stroke="#ebd5ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
 }
 return base+foreground+'</svg>';
}
function roadmapLessonSymbol(lesson,course){
 if(String(course?.category||'').includes('Blender'))return '✧';
 const title=String(lesson?.title||'').toLocaleLowerCase('de');
 if(/kommentar|notiz|dokument/.test(title))return '//';
 if(/variable|wert|zuweisung/.test(title))return 'x';
 if(/typ|string|boolean|number/.test(title))return '▱';
 if(/funktion|methode/.test(title))return 'ƒ';
 if(/schleif|loop|iterat/.test(title))return '↻';
 if(/beding|vergleich|operator/.test(title))return '◇';
 if(/datenbank|sql|query/.test(title))return '▤';
 if(/web|html|css|dom/.test(title))return '⟨/⟩';
 if(/event|trigger|callback/.test(title))return '⌁';
 if(/projekt|abschluss|test/.test(title))return '⚑';
 return '⌘';
}
function trackPage(id){
 const course=courseOf(id);if(!course)return notFound();
 const all=lessonsOf(id),completed=doneIds(),done=countDone(id);
 const next=all.find(l=>!completed.has(l.id)&&allowed(l));
 const chapters=[];
 for(const l of all){const last=chapters.at(-1);if(last?.title===l.chapter)last.items.push(l);else chapters.push({title:l.chapter,items:[l]});}
 const chapterDone=chapters.filter(ch=>ch.items.length&&ch.items.every(l=>completed.has(l.id))).length;
 const currentChapter=next?chapters.findIndex(ch=>ch.items.some(l=>l.id===next.id)):0;
 const percentage=pct(done,all.length);
 let out='<div class="ll-roadmap-course">'+
 '<header class="ll-roadmap-track-hero"><div class="ll-roadmap-hero-bg" aria-hidden="true"></div>'+
 '<div class="ll-track-header-row"><a class="back ll-track-back" href="#courses" aria-label="'+catalogText('Zurück zu allen Kursen','Back to all courses')+'">←</a>'+
 '<div class="ll-track-heading"><span class="eyebrow">'+catalogText('DEIN GEFÜHRTER LERNPFAD','YOUR GUIDED LEARNING PATH')+'</span>'+
 '<h1>'+esc(course.name)+' <em>Roadmap</em></h1>'+
 '<p>'+catalogText('Schritt für Schritt zum eigenen Projekt.','Step by step toward your own project.')+'</p></div>'+
 '<span class="ll-track-floating-icon" aria-hidden="true">'+esc(roadmapCourseGlyph(course))+'</span></div>'+
 '<div class="ll-track-summary"><span class="ll-track-summary-emblem" aria-hidden="true">'+esc(roadmapCourseGlyph(course))+'</span>'+
 '<div class="ll-track-summary-body"><div class="ll-track-summary-head"><div><strong>'+esc(course.name)+'</strong>'+
 '<small>'+catalogText('Kursfortschritt','Course progress')+'</small></div>'+
 '<span class="ll-track-chapter-total">'+chapterDone+' / '+chapters.length+' '+catalogText('Kapitel','chapters')+'</span>'+
 '<span class="ll-track-percent">'+percentage+'%</span></div>'+
 '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="'+all.length+'" aria-valuenow="'+done+'" aria-label="'+catalogText('Abgeschlossene Lektionen','Lessons completed')+'"><span style="width:'+percentage+'%"></span></div>'+
 '<div class="ll-track-summary-foot"><span>'+done+' / '+all.length+' '+catalogText('Lektionen abgeschlossen','lessons completed')+'</span>'+
 '<span>'+xpFromCourse(id)+' XP</span></div></div></div>'+
 '<div class="ll-track-bottom-actions"><div>'+difficultyBadge(course)+
 '<span class="ll-track-level">'+catalogText('Einstieg','Entry')+': '+levelText(course.level)+'</span></div>'+
 '<div class="ll-track-quick-actions"><button class="btn small" type="button" data-pin-course="'+esc(id)+'">'+
 (getChoicePreference(pinKey(),'')===id?'✓ '+catalogText('Angeheftet','Pinned'):'⌁ '+catalogText('Anheften','Pin'))+'</button>'+
 '<button class="btn small" type="button" data-bookmark-course="'+esc(id)+'">'+
 (bookmarks().includes(id)?'★ '+catalogText('Gemerkt','Saved'):'☆ '+catalogText('Merken','Save'))+'</button>'+
 (next?'<button class="btn small ll-track-continue" type="button" data-go="lesson/'+esc(next.id)+'">'+
 catalogText('▶ Weiterlernen','▶ Continue')+'</button>':'')+
 '</div></div></header>';

 chapters.forEach((chapter,ci)=>{
  const number=String(ci+1).padStart(2,'0');
  const chapterName=String(chapter.title||'').replace(/^\s*\d{1,2}\s*[·.\-]\s*/,'');
  const doneInChapter=chapter.items.filter(l=>completed.has(l.id)).length;
  const complete=doneInChapter===chapter.items.length;
  const isActive=ci===currentChapter;
  // Keep every chapter's lessons in the DOM for keyboard navigation, chapter
  // expansion, and legacy progress/lesson-count regression tests.
  const isOpen=isActive||(!next&&ci===0)||chapters.length===1;
  out+='<section class="chapter ll-roadmap-chapter'+(complete?' is-complete':'')+'">'+
   '<details class="ll-map-chapter-details" '+(isOpen?'open':'')+'>'+
   '<summary class="chapter-title"><span class="ll-chapter-label">[ '+number+' ] '+esc(chapterName)+'</span>'+
   '<span class="ll-chapter-rule" aria-hidden="true"></span>'+
   '<span class="chapter-count">'+doneInChapter+'/'+chapter.items.length+'</span>'+
   '<span class="ll-chapter-chevron" aria-hidden="true">⌄</span></summary>'+
   '<p class="ll-chapter-description">'+catalogText('Lerne die Themen dieses Kapitels in einzelnen, verständlichen Schritten.','Learn each topic in this chapter in clear, focused steps.')+'</p>'+
   '<div class="lesson-list ll-roadmap-lesson-list">'+
   chapter.items.map((l,i)=>{
    const ok=completed.has(l.id),unlocked=allowed(l),current=next?.id===l.id;
    const state=ok?'is-complete':!unlocked?'locked':current?'is-current':'is-upcoming';
    const status=ok?catalogText('Abgeschlossen','Completed'):!unlocked?tierLabel(l.required_plan):current?catalogText('Als Nächstes','Up next'):catalogText('Noch offen','Not started');
    const symbol=ok?'✓':!unlocked?'⌑':current?'▶':'○';
    return '<div class="ll-map-entry '+state+'">'+
     '<span class="ll-map-timeline-node" aria-hidden="true">'+symbol+'</span>'+
     '<button class="lesson-card '+state+'" type="button" data-go="lesson/'+esc(l.id)+'" aria-label="'+
       esc(l.title+', '+status)+'">'+
      '<span class="lesson-main"><span class="ll-lesson-title-line"><span class="lesson-num">'+String(i+1).padStart(2,'0')+
      '</span><strong>'+esc(l.title)+'</strong></span>'+
      '<span class="lesson-summary">'+esc(l.summary||'Lerne das Thema an einem einfachen Beispiel.')+'</span>'+
      '<span class="lesson-meta"><span>◷ '+l.minutes+' MIN</span><span class="ll-meta-separator" aria-hidden="true"></span>'+
      '<span>◇ '+catalogText('PRAXIS + QUIZ','PRACTICE + QUIZ')+'</span></span></span>'+
      '<span class="ll-lesson-right"><span class="ll-lesson-status-pill '+state+'">'+
         (ok?'✓ ':!unlocked?'⌑ ':current?'▷ ':'○ ')+esc(status)+'</span>'+
      '<span class="ll-lesson-illustration" aria-hidden="true">'+roadmapLessonArtwork(l,course)+'</span></span>'+
      '<span class="status-ring" aria-hidden="true">'+symbol+'</span>'+
      '</button></div>';
   }).join('')+'</div></details></section>';
 });
 out+='<section class="section exam-callout ll-roadmap-finale"><span class="eyebrow">[ ★ ] '+catalogText('ABSCHLUSS','FINISH')+'</span>'+
  '<h2>'+catalogText('Bereit für die Prüfung?','Ready for the final exam?')+'</h2>'+
  '<p>'+catalogText('Wiederhole das Wichtigste aus diesem Kurs und zeig, was du gelernt hast.','Review key topics and show what you have learned.')+'</p>'+
  '<button class="btn primary" type="button" data-go="exam/'+esc(id)+'">'+catalogText('Prüfung ansehen →','View exam →')+'</button></section></div>';
 return out;
}

function notFound(){return '<div class="empty"><h2>Inhalt nicht gefunden</h2><p>Dieser Lernpfad ist nicht verfügbar.</p><button class="btn" data-go="courses">Zur Kursbibliothek</button></div>';}
function quizQuestions(p){
 if(window.LLCurriculum?.questions)return window.LLCurriculum.questions(p);
 const options=Array.isArray(p.options)?p.options.map(String):[],correct=Number(p.correct);
 if(options.length<2||!Number.isInteger(correct)||correct<0||correct>=options.length)return [];
 return [{question:String(p.quiz||'Welche Antwort ist richtig?'),options,correct,explanation:''}];
}
function paintQuiz(){const p=s.lesson?.payload||{},qs=quizQuestions(p),q=qs[Math.min(s.quizStep,qs.length-1)];if(!q)return;
 const title=$('#quiz-question'),choices=$('#quiz-choices'),progress=$('#quiz-progress');
 if(title)title.textContent=q.question;if(progress)progress.textContent='Frage '+Math.min(s.quizStep+1,qs.length)+' von '+qs.length;
 const meter=$('#quiz-meter-fill');if(meter)meter.style.width=Math.round((s.quizStep+(s.quizPassed?1:0))/Math.max(1,qs.length)*100)+'%';
 const feedback=$('#answer-result');if(feedback){feedback.classList.remove('quiz-correct','quiz-incorrect');feedback.textContent=s.quizPassed?'✓ Alle Fragen richtig beantwortet!':'Wähle eine Antwort. Bei richtiger Lösung folgt sofort die nächste Frage.';}
 if(choices)choices.innerHTML=q.options.map((answer,i)=>'<button type="button" class="quiz-choice" data-answer="'+i+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(answer)+'</button>').join('');
 updateLessonControls();
}
function lessonPage(id){
 var l=s.lessons.find(x=>x.id===id);if(!l)return notFound();
 var c=courseOf(l.course_id),all=lessonsOf(l.course_id),index=all.findIndex(x=>x.id===id);
 var back='<a class="back" href="#track/'+esc(l.course_id)+'">← '+esc(c?.name||'Lernpfad')+'</a>';
 if(!allowed(l))return back+'<section class="panel locked-panel"><div class="lock-icon">🔒</div><span class="eyebrow">KURSINHALT GESCHÜTZT</span>'+
 '<h1>'+esc(l.title)+'</h1>'+difficultyBadge(c)+'<p class="lede" style="margin:auto">'+esc(l.summary)+'</p>'+
 '<p>Diese Lektion ist mit <strong>'+tierLabel(l.required_plan)+'</strong> freigeschaltet.</p>'+
 '<div class="hero-actions" style="justify-content:center"><button class="btn primary" data-go="plans">Stufen vergleichen</button>'+
 '<a class="btn discord" rel="noopener noreferrer" target="_blank" href="https://discord.gg/SZhYa6Nnmy">Freischaltung anfragen</a></div></section>';
 if(!s.lesson){const daily=s.lessonGate?.reason==='daily_limit';return back+'<section class="lesson-gate"><span class="gate-icon">'+(daily?'◷':'🔒')+'</span><span class="eyebrow">'+(daily?'TAGESLIMIT ERREICHT':'LEKTION NICHT VERFÜGBAR')+'</span><h2>'+(daily?'Für heute geschafft.':'Lektion nicht geladen')+'</h2><p>'+(daily?'Du hast heute alle '+safeNumber(s.daily?.daily_limit)+' neuen Lernstationen geöffnet. Morgen geht es weiter. Bereits geöffnete Stationen bleiben zugänglich.':esc(s.lessonGate?.error||'Prüfe deine Freischaltung und Verbindung.'))+'</p><div class="actions-pair"><button class="btn" data-go="track/'+esc(l.course_id)+'">← Lernpfad</button><button class="btn primary" data-go="plans">Tarife ansehen →</button></div></section>';}
 var p=s.lesson.payload||{},video=s.lesson.video_id||p.videoId,info=p.video_guide||videoInfo(video),qs=quizQuestions(p),activeQuiz=qs[Math.min(s.quizStep,qs.length-1)],options=activeQuiz?.options||[],finished=doneIds().has(id),rewarded=xpAwarded(id),isBlender=c?.category==='3D & Blender';
 var videoStart=Math.max(0,Math.floor(safeNumber(s.lesson.video_start??p.videoStart))),validVideo=video&&/^[a-zA-Z0-9_-]{11}$/.test(video),url=validVideo?'https://www.youtube.com/watch?v='+video+'&t='+videoStart+'s':null;
 var search='https://www.youtube.com/results?search_query='+encodeURIComponent(c.name+' '+l.title+' Anleitung Tutorial deutsch');
 var next=all[index+1],d=esc(s.draft),isPracticeDone=s.practiceChecked||finished;
 const showMarkupPreview=['html','css'].includes(String(p.lang||'').toLowerCase());
 return '<article class="lesson-article ll-roadmap-lesson">'+back+
 '<header class="ll-lesson-hero"><div class="ll-lesson-hero-glow" aria-hidden="true"></div>'+
 '<div class="ll-lesson-hero-intro"><span class="eyebrow">'+esc(c.name)+' · '+esc(l.chapter)+'</span>'+
 '<span class="ll-lesson-order">'+catalogText('LEKTION','LESSON')+' '+String(index+1).padStart(2,'0')+' / '+all.length+'</span></div>'+
 '<span class="ll-lesson-hero-symbol" aria-hidden="true">'+esc(roadmapLessonSymbol(l,c))+'</span>'+
 '<h1>'+esc(l.title)+'</h1><p>'+esc(p.goal||l.summary)+'</p>'+
 '<div class="chips ll-lesson-chips"><span class="chip">◷ '+l.minutes+' '+catalogText('Minuten','minutes')+'</span>'+
 difficultyBadge(c)+
 '<span class="chip '+(finished?'free':'')+'">'+
 (finished?'✓ '+catalogText('Abgeschlossen','Completed'):rewarded?'✓ 30 XP erhalten':'✦ 30 XP möglich')+'</span></div>'+
 '<div class="ll-lesson-overview-progress"><div><span>'+catalogText('Deine Position im Lernpfad','Your place in the learning path')+'</span>'+
 '<strong>'+(index+1)+' / '+all.length+'</strong></div>'+
 '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="'+all.length+'" aria-valuenow="'+(index+1)+'" aria-label="'+catalogText('Position im Kurs','Position in course')+'"><span style="width:'+pct(index+1,all.length)+'%"></span></div></div>'+
 '<div class="lesson-steps ll-lesson-road-stages" aria-label="'+catalogText('Lektionsschritte','Lesson steps')+'">'+
 '<button type="button" data-learning-step="1" class="lesson-step done" aria-current="'+(s.lessonStep===1?'step':'false')+'"><span class="step-index">◇</span>'+catalogText('Verstehen','Learn')+'</button>'+
 '<button type="button" data-learning-step="2" class="lesson-step '+(s.videoChecked?'done':'')+'" aria-current="'+(s.lessonStep===2?'step':'false')+'"><span class="step-index">▷</span>'+catalogText('Video','Video')+'</button>'+
 '<button type="button" data-learning-step="3" class="lesson-step '+(isPracticeDone?'done':'')+'" aria-current="'+(s.lessonStep===3?'step':'false')+'"><span class="step-index">⟨/⟩</span>'+catalogText('Praxis','Practice')+'</button>'+
 '<button type="button" data-learning-step="4" class="lesson-step '+(s.quizPassed||finished?'done':'')+'" aria-current="'+(s.lessonStep===4?'step':'false')+'"><span class="step-index">✓</span>'+catalogText('Quiz','Quiz')+'</button>'+
 '<button type="button" data-learning-step="5" class="lesson-step '+(finished?'done':'')+'" aria-current="'+(s.lessonStep===5?'step':'false')+'"><span class="step-index">✦</span>'+catalogText('Ergebnis','Result')+'</button></div>'+
 '<p class="micro" id="learning-resume" aria-live="polite">5 Schritte: Erklären · Video · Code · Quiz · Ergebnis</p></header>'+

 (finished?'<div class="done-banner" style="margin:15px 0"><strong>✓ Lektion abgeschlossen</strong><p>'+(rewarded?'Die 30 XP für diese Lektion hast du bereits erhalten.':'Deine Lektion ist abgeschlossen. Bitte bestätige die XP-Gutschrift.')+'</p>'+(rewarded?'':'<button class="btn small" type="button" data-action="retry-lesson-xp">XP-Gutschrift überprüfen</button>')+'</div>':'')+
 '<section class="step-box" id="lesson-explanation"><span class="eyebrow">SCHRITT 01 · VERSTEHEN</span>'+
 (window.LLCurriculum?.render(p,s.sectionIndex,esc,safeLink)||'<p>'+esc(p.theory||l.summary)+'</p>')+
 '</section>'+
 '<section id="lesson-video" class="step-box '+(isBlender?'blender-video-step':'')+'"><span class="eyebrow">SCHRITT 02 · '+(isBlender?'BLENDER VIDEO-TRAINING':'VIDEO-TUTORIAL')+'</span><h2>'+(isBlender?'Im Interface mitmachen.':'Erklärung ansehen.')+'</h2>'+
 (validVideo?
 '<p class="muted">Videoguide: <strong>'+esc(info.name)+'</strong>. '+esc(info.focus||'Achte auf das Thema dieser Lektion.')+'</p>'+
 '<div class="video-frame" id="video-frame"><div class="video-placeholder"><div class="play">▶</div><strong>'+esc(info.name)+'</strong>'+
 '<small>'+esc(info.author)+' · '+esc(info.language)+' · YouTube</small>'+
 '<button type="button" class="btn primary" data-action="load-video">Video abspielen →</button>'+
 '<small>Der externe Player wird erst auf deinen Klick geladen.</small></div></div>'+
 '<div class="video-source"><p class="micro">Quelle: '+esc(info.author)+(videoStart?' · Einstieg bei '+Math.floor(videoStart/60)+':'+String(videoStart%60).padStart(2,'0'):'')+'</p><a href="'+url+'" target="_blank" rel="noopener noreferrer">Auf YouTube öffnen ↗</a></div>':
 '<p class="muted">Für dieses Spezialthema gibt es noch keinen einzeln geprüften Videoguide. Öffne eine gezielte Suche, wähle ein Tutorial und arbeite das passende Thema durch.</p>'+
 '<div class="video-frame"><div class="video-placeholder"><div class="play">▷</div><strong>Ein Tutorial zum Thema finden</strong>'+
 '<small>'+esc(c.name)+' · '+esc(l.title)+'</small><a href="'+search+'" class="btn primary" target="_blank" rel="noopener noreferrer">Passendes Lernvideo suchen ↗</a></div></div>')+
 '<label class="video-check"><input type="checkbox" id="video-check" '+(s.videoChecked?'checked':'')+'><span>Ich habe die passende Erklärung angesehen und verstanden.'+
 '<small class="micro" style="display:block">Deine eigene Bestätigung – die Videowiedergabe lässt sich nicht verlässlich messen.</small></span></label></section>'+
 '<section class="step-box" id="lesson-practice"><span class="eyebrow">SCHRITT 03 · SELBST AUSPROBIEREN</span><h2>'+(isBlender?'Dein Arbeitsschritt.':'Löse diese Aufgabe im Editor.')+'</h2>'+
 '<p>'+esc(p.task||'Setze die Erklärung eigenständig in einem Beispiel um.')+'</p>'+
 (p.practice_mode==='guided'?'<p class="muted">Begleitete Praxis: Schreibe den eigenen Code oder deine konkreten Schritte auf und erkläre die Wirkung. Diese neue Übung wird noch nicht automatisch kompiliert oder fachlich bewertet; prüfe sie selbst in deiner Entwicklungsumgebung.</p>':'')+
 '<div class="practice-workspace'+(isPracticeDone?' is-complete':'')+'" id="practice-workspace"><div class="practice-title"><strong>'+(isBlender?'Deine Umsetzung':'Dein Code-Entwurf')+'</strong>'+
 '<span class="practice-status" id="practice-status">'+(isPracticeDone?'✓ Praxis erledigt':'Nur auf diesem Gerät gespeichert')+'</span></div>'+
 '<label class="micro" for="practice-input">'+(isBlender?'Beschreibe, was du in Blender umgesetzt hast:':'Datei: '+esc(p.filename||({lua:'client.lua',python:'main.py',javascript:'main.js'}[String(p.lang||'').toLowerCase()]||'lösung.txt')))+'</label>'+
 '<div class="code-editor"><div class="code-lines" id="code-lines" aria-hidden="true">1</div><textarea class="exercise-textarea" id="practice-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" rows="7" maxlength="10000" placeholder="'+(isBlender?'Welche Schritte hast du ausgeführt und was ist dabei entstanden?':'Schreibe hier deine Lösung …')+'">'+d+'</textarea></div>'+
 (showMarkupPreview?'<div class="ll-practice-preview"><div class="ll-preview-label">Sichere Vorschau · HTML / CSS</div><iframe id="practice-preview-frame" class="ll-practice-preview-frame" title="Vorschau deiner HTML- oder CSS-Datei" sandbox="" referrerpolicy="no-referrer" loading="lazy"></iframe><p class="micro">Vorschau ohne Skriptausführung oder Zugriff auf dein Academy-Konto.</p></div>':'')+
 '<p class="practice-tip">'+(isBlender?'Beschreibe deine Umsetzung und vergleiche sie mit den Schritten.':'Schreibe deine Lösung und tippe auf „Prüfen“. Das Ergebnis wird grün oder rot angezeigt.')+'</p>'+
 '<div class="practice-feedback" id="practice-feedback" role="status" aria-live="polite" hidden></div>'+
 '<div class="practice-actions practice-actions-simple"><button class="btn primary" type="button" data-action="complete-practice">✓ Prüfen</button><button class="btn" type="button" data-action="show-hint">Tipp</button><button class="btn" type="button" data-action="show-solution">Lösung anzeigen</button></div>'+
 '</div></section>'+
 '<section class="step-box" id="quiz-area"><span class="eyebrow">SCHRITT 04 · WISSENSTEST</span><h2>Wissen anwenden.</h2><span id="quiz-progress">Frage '+Math.min(s.quizStep+1,qs.length)+' von '+qs.length+'</span><div class="ll-quiz-progress"><span id="quiz-meter-fill" style="width:'+Math.round((s.quizStep+(s.quizPassed?1:0))/Math.max(1,qs.length)*100)+'%"></span></div><p id="quiz-question">'+esc(activeQuiz?.question||'Hast du das Thema verstanden?')+'</p><div id="quiz-choices">'+
 options.map((answer,i)=>'<button type="button" class="quiz-choice" data-answer="'+i+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(answer)+'</button>').join('')+'</div>'+
 '<p class="quiz-feedback micro" id="answer-result" role="status" aria-live="polite">'+(finished?'✓ Bereits abgeschlossen.':'Wähle die richtige Antwort. Danach kannst du die Lektion abschließen.')+'</p>'+
 '<button class="btn primary" id="mark-lesson" data-action="finish-lesson" type="button" disabled>'+(finished?'✓ Lektion abgeschlossen':'Lektion abschließen →')+'</button></section>'+
 '<section class="step-box" id="lesson-summary"><span class="eyebrow">SCHRITT 05 · ERGEBNIS</span><h2>'+esc(finished?'Lernziel erreicht!':'Dein Ergebnis')+'</h2>'+
 '<p>'+esc(finished?'Du hast Video, Praxisaufgabe und Wissenstest abgeschlossen.':'Schließe die Erklärung, deine praktische Aufgabe und alle Quizfragen ab, um dieses Lernziel zu erreichen.')+'</p>'+
 '<p class="micro">'+(finished?(rewarded?'✓ 30 XP dauerhaft gutgeschrieben.':'Der Abschluss ist gespeichert. Die XP-Gutschrift kann erneut geprüft werden.'):'Noch nicht abgeschlossen – deine bisherigen Schritte bleiben im Lernpfad gespeichert.')+'</p>'+
 (finished?(next?'<button class="btn primary" data-go="lesson/'+esc(next.id)+'">Mit der nächsten Lektion fortfahren →</button>':'<button class="btn primary" data-go="exam/'+esc(l.course_id)+'">Zur Abschlussprüfung →</button>'):'')+'</section>'+ 
 '<div class="btn-row"><button class="btn" data-go="track/'+esc(l.course_id)+'">← Kursübersicht</button><button class="btn" data-action="reset-lesson">Lektion neu beginnen ↺</button>'+
 (next?'<button class="btn" data-go="lesson/'+esc(next.id)+'">Nächste Lektion →</button>':'<button class="btn" data-go="exam/'+esc(l.course_id)+'">Abschlussprüfung →</button>')+'</div></article>';
}
function updateLessonControls(){
 var id=parseRoute().id,l=s.lessons.find(x=>x.id===id);if(!l||!s.lesson)return;
 var questions=quizQuestions(s.lesson.payload||{}),correct=questions[Math.min(s.quizStep,questions.length-1)]?.correct,finished=doneIds().has(id);
 var ready=s.videoChecked&&s.practiceChecked&&s.quizPassed;
 document.querySelectorAll('[data-answer]').forEach(b=>{
  var selected=Number(b.dataset.answer)===s.choice;
  b.classList.toggle('selected',selected);b.classList.toggle('good',selected&&s.choice===correct);
  b.classList.toggle('bad',selected&&s.choice!==correct);b.disabled=!!s.quizPassed;
 });
 var btn=$('#mark-lesson');if(btn)btn.disabled=finished||!ready;
 var status=$('#answer-result');
 if(status&&!finished){status.classList.toggle('quiz-incorrect',s.choice!==null&&!s.quizPassed);status.classList.toggle('quiz-correct',s.quizPassed);status.textContent=
  !questions.length?'Quizdaten fehlen. Bitte melde diese Lektion.':
  s.quizPassed&&!s.videoChecked?'✓ Quiz bestanden! Bestätige noch das Video.':
  s.quizPassed&&!s.practiceChecked?'✓ Quiz bestanden! Prüfe noch deinen Code.':
  s.quizPassed?'✓ Alle '+questions.length+' Fragen richtig! Du kannst die Lektion abschließen.':
  s.choice==null?'Wähle eine Antwort und löse die Schritte darüber.':
  s.choice!==correct?'Noch nicht richtig. '+String(questions[Math.min(s.quizStep,questions.length-1)]?.explanation||'Lies den passenden Lernteil noch einmal.'):
  !s.videoChecked?'Richtige Antwort ✓ · Sieh noch das Tutorial an und bestätige es.':
  !s.practiceChecked?'Richtige Antwort ✓ · Schließe noch deinen eigenen Praxisschritt ab.':
  '✓ Richtig! Du kannst die Lektion abschließen.';}
 var video=$('#video-check'),practice=$('#practice-workspace');
 const meter=$('#quiz-meter-fill');if(meter)meter.style.width=Math.round((s.quizStep+(s.quizPassed?1:0))/Math.max(1,questions.length)*100)+'%';
 if(video)video.checked=s.videoChecked;
 if(practice)practice.classList.toggle('is-complete',s.practiceChecked);
}
function showPracticeResult(ok,message,kind){
 const feedback=$('#practice-feedback'),workspace=$('#practice-workspace');
 if(feedback){
  feedback.hidden=false;
  feedback.textContent=message;
  feedback.classList.remove('error','is-success','is-error','is-tip');
  feedback.classList.add(kind==='tip'?'is-tip':ok?'is-success':'is-error');
 }
 if(workspace){
  workspace.classList.toggle('practice-correct',kind!=='tip'&&ok);
  workspace.classList.toggle('practice-incorrect',kind!=='tip'&&!ok);
 }
}
async function completePractice(){
 const id=parseRoute().id,box=$('#practice-input');
 if(!box||!s.lesson)return;
 const value=box.value.trim(),button=$('[data-action="complete-practice"]');
 if(button){button.disabled=true;button.textContent='Prüft …';button.setAttribute('aria-busy','true');}
 try{
  if(value.length<5){showPracticeResult(false,'✕ Schreibe zuerst deine eigene Lösung.');box.focus();return;}
  const payload=s.lesson.payload||{},lang=String(payload.lang||'').toLowerCase();
  const guided=payload.practice_mode==='guided';
  const visual=guided||lang==='blender'||lang==='text';
  let result=visual
   ?{ok:value.length>=(guided?80:60),diagnostic:value.length>=(guided?80:60)?(guided?'Dein Codeentwurf und deine Erklärung sind dokumentiert. Teste sie selbst in der passenden Entwicklungsumgebung.':'Deine Arbeitsschritte wurden dokumentiert. Prüfe dein Blender-Ergebnis selbst.'):(guided?'Schreibe mindestens 80 Zeichen: eigenen Code beziehungsweise Arbeitsschritte und eine verständliche Erklärung.':'Beschreibe mindestens 60 Zeichen mit konkreten Arbeitsschritten.')}
   :window.LLPractice.evaluate(value,payload);
  if(!visual&&window.LLRuntime&&['lua','python','py','javascript','js'].includes(lang)){
   const runtime=await window.LLRuntime.run(value,lang);
   if(runtime.available){
    if(!runtime.ok)result={ok:false,diagnostic:'Laufzeitfehler: '+runtime.error};
    else if(payload.solution&&typeof window.LLPractice?.evaluateRuntime==='function'){
     const expected=await window.LLRuntime.run(payload.solution,lang);
     result=window.LLPractice.evaluateRuntime(value,payload,runtime,expected);
    }
   }else{
    // No runtime (offline, blocked worker or missing bundle): retain the structural
    // static verdict instead of rejecting valid personal strings and variable values.
    // Unsupported advanced code remains unverified; never claim it was executed.
    if(result.ok)result={...result,diagnostic:'Statische Prüfung bestanden (keine echte Ausführung verfügbar).'};
   }
  }
  if(result.ok){
   saveDraft(id,value);
   window.LLLearning?.queue?.(id,value,4);
   s.practiceChecked=true;
   if(!Array.isArray(s.progress.practiced))s.progress.practiced=[];
   if(!s.progress.practiced.includes(id))s.progress.practiced.push(id);
   if(!Array.isArray(s.progress.verifiedPractice))s.progress.verifiedPractice=[];
   if(!s.progress.verifiedPractice.includes(id))s.progress.verifiedPractice.push(id);
   try{await saveProgress();}
   catch(error){
    s.practiceChecked=false;
    s.progress.verifiedPractice=s.progress.verifiedPractice.filter(x=>x!==id);
    s.progress.practiced=s.progress.practiced.filter(x=>x!==id);
    showPracticeResult(false,'✕ Das Ergebnis konnte nicht gespeichert werden: '+formatError(error));
    updateLessonControls();
    return;
   }
   showPracticeResult(true,payload.practice_mode==='guided'?'✓ Eigenständiger Lernschritt dokumentiert. Bitte überprüfe den Code selbst in der Entwicklungsumgebung.':'✓ Richtig! Deine Lösung wurde gespeichert.');
   const status=$('#practice-status');if(status)status.textContent='✓ Praxis erledigt';
   window.LLLearning?.mark?.(id,4);
  }else{
   s.practiceChecked=false;
   showPracticeResult(false,'✕ Noch nicht richtig. '+String(result.diagnostic||'Vergleiche deine Lösung mit dem Tipp.'));
  }
  updateLessonControls();
 }catch(error){
  s.practiceChecked=false;
  showPracticeResult(false,'✕ Prüfung fehlgeschlagen: '+formatError(error));
  updateLessonControls();
 }finally{if(button&&button.isConnected){button.disabled=false;button.textContent='✓ Prüfen';button.setAttribute('aria-busy','false');}}
}
async function grantLessonXP(id){
 const response=await api.rpc('academy_claim_lesson_xp',{p_lesson:id});
 if(response.error)throw response.error;
 const result=response.data;
 if(!result||typeof result.awarded!=='boolean')throw Error('Die XP-Gutschrift wurde nicht bestätigt.');
 const existing=s.xpAwards.find(x=>x.lesson_id===id);
 if(!existing){
  s.xpAwards.push({lesson_id:id,xp:30,awarded_at:result.awarded_at||new Date().toISOString()});
  s.xpAwards.sort((a,b)=>Date.parse(b.awarded_at||0)-Date.parse(a.awarded_at||0));
 }
 return result;
}
async function markLesson(){
 const id=parseRoute().id,l=s.lessons.find(x=>x.id===id);
 if(!l||!s.lesson||!allowed(l)||s.xpClaimBusy)return;
 if(!s.videoChecked||!s.practiceChecked||!s.quizPassed){
  notice('Bitte Video, praktische Übung und Quiz abschließen.');return;
 }
 const originalDone=[...(s.progress.done||[])],oldCompleted={...(s.progress.completedAt||{})};
 const alreadyComplete=originalDone.includes(id);
 s.xpClaimBusy=true;
 try{
  if(!alreadyComplete){
   const answers=Array.isArray(s.quizAnswers)?s.quizAnswers:[];
   const proof=await api.rpc('academy_verify_lesson_quiz',{p_lesson:id,p_answers:answers});
   if(proof.error)throw proof.error;
   if(proof.data?.ok!==true)throw Error(proof.data?.error||'Bitte beantworte alle Quizfragen erneut.');
  }
 }catch(error){
  s.xpClaimBusy=false;
  notice('Quizbestätigung fehlgeschlagen: '+formatError(error));
  return;
 }
 try{
  if(!alreadyComplete)s.progress.done.push(id);
  if(!s.progress.completedAt)s.progress.completedAt={};
  if(!s.progress.completedAt[id])s.progress.completedAt[id]=new Date().toISOString();
  if(!s.progress.watched.includes(id))s.progress.watched.push(id);
  await saveProgress();
 }catch(error){
  s.progress.done=originalDone;s.progress.completedAt=oldCompleted;
  notice('Lektion konnte nicht gespeichert werden: '+formatError(error));s.xpClaimBusy=false;return;
 }
 try{
  const award=await grantLessonXP(id);
  window.LLLearning?.mark?.(id,5);s.lessonStep=5;
  notice(award.awarded?'Lektion abgeschlossen! +30 XP ✓':'Lektion abgeschlossen! 30 XP wurden bereits früher vergeben.');
 }catch(error){
  notice('Lektion gespeichert. XP bitte erneut bestätigen: '+formatError(error));
 }finally{s.xpClaimBusy=false;render();}
}



const SHOP_BASE={pro:199,ultimate:599,max:1199};
function offerFor(tier,months){
 const m=[1,3,12].includes(Number(months))?Number(months):1;
 const saved=(s.shopOffers||[]).find(x=>x.tier===tier&&Number(x.months)===m);
 if(saved)return saved;
 const monthly=SHOP_BASE[tier]||0,base=monthly*m;
 const annual=Math.round(base*(m===12?.95:1)),promo=Math.max(0,Math.min(90,Number(s.shopDiscount)||0));
 return {tier,months:m,monthly_cents:monthly,base_cents:base,annual_cents:annual,
  year_discount_percent:m===12?5:0,promo_percent:promo,total_cents:Math.round(annual*(100-promo)/100)};
}
async function refreshShopOffers(){
 const response=await api.rpc('academy_shop_offers',{});
 if(response.error)throw response.error;
 if(!Array.isArray(response.data)||response.data.length!==9)throw Error('Shopangebote nicht verfügbar.');
 s.shopOffers=response.data;return response.data;
}
function salePrice(cents){return Math.round(cents*(100-Math.max(0,Math.min(90,Number(s.shopDiscount)||0)))/100)}
function euro(cents){return (Number(cents||0)/100).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
async function refreshService(){
 const accountId=s.user?.id;
 try{
  const r=await api.rpc('academy_service',{p_action:'list',p_payload:{}});
  if(!s.ready||s.user?.id!==accountId)return null;
  if(r.error)throw r.error;
  if(!r.data||!Array.isArray(r.data.mine)||
   (s.profile?.role==='admin'&&!Array.isArray(r.data.admin)))
   throw Error('Support-Posteingang konnte nicht geladen werden.');
  s.service=r.data;
  s.serviceError='';
  s.serviceLastUpdated=Date.now();
  return s.service;
 }catch(error){
  // Never present a failed request as a genuinely empty support inbox.
  if(s.user?.id===accountId)s.serviceError=formatError(error);
  throw error;
 }
}
async function loadTicketThread(id){
 const accountId=s.user?.id;
 const r=await api.rpc('academy_ticket_chat',{p_action:'thread',p_ticket:id,p_body:null});
 if(!s.ready||s.user?.id!==accountId)return null;
 if(r.error)throw r.error;
 if(!r.data?.ok||!Array.isArray(r.data.messages))throw Error('Nachrichtenverlauf konnte nicht geladen werden.');
 s.chatTicketId=id;s.chatMessages=r.data.messages;
 return r.data;
}
function ticketChatPanel(isAdmin){
 const entries=isAdmin?s.service?.admin:s.service?.mine;
 const ticket=Array.isArray(entries)?entries.find(x=>x.id===s.chatTicketId):null;
 if(!ticket)return '';
 const messages=(s.chatMessages||[]).map(msg=>{
  const own=(isAdmin?msg.role==='admin':msg.role==='member');
  const d=new Date(msg.at||0);
  const when=Number.isNaN(d.getTime())?'':d.toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'});
  return '<div class="ll-chat-message '+(own?'is-mine':'is-other')+'"><span class="ll-chat-sender">'+esc(msg.role==='admin'?'NovaLab Team':'Mitglied')+'</span>'+
  '<p>'+esc(msg.body||'')+'</p><small>'+esc(when)+'</small></div>';
 }).join('');
 const approval=isAdmin&&ticket.category==='plan'&&ticket.status!=='approved';
 const management=isAdmin?'<form data-form="support-reply" data-ticket-id="'+esc(ticket.id)+'" class="ll-chat-status">'+
  '<label>Status <select class="select" name="status"><option value="answered">Beantwortet</option><option value="closed">Schließen</option><option value="rejected">Ablehnen</option>'+
  (approval?'<option value="approved">Mitgliedschaft freigeben</option>':'')+'</select></label>'+
  (approval?(ticket.term_months?'<p class="micro">Angefragt: '+Number(ticket.term_months)+' Monate · '+euro(ticket.quoted_cents||0)+' (Preis zum Anfragezeitpunkt; Zahlung separat bestätigen)</p>':'<label>Laufzeit (Tage) <input class="input" name="days" type="number" min="1" max="3650" value="30"></label>'):'')+
  '<button type="submit" class="btn small">Status speichern</button></form>':'';
 return '<section class="panel ll-chat-panel" id="academy-chat-panel"><div class="ll-chat-heading"><div><span class="eyebrow">SUPPORT · GESPRÄCH</span>'+
  '<h3>'+esc(isAdmin?(ticket.username||'Mitglied'):'Deine Unterhaltung')+'</h3><small>'+esc(ticket.category)+' · '+esc(ticket.status)+' · #'+esc(ticket.id.slice(0,8))+'</small></div>'+
  '<button type="button" class="btn small" data-chat-close>Schließen ×</button></div>'+
  '<div class="ll-chat-messages" role="log" aria-live="polite" aria-label="Nachrichtenverlauf">'+
  (s.chatLoading?'<p class="muted">Nachrichten werden geladen …</p>':messages||'<p class="muted">Noch keine Nachrichten.</p>')+'</div>'+
  '<form data-form="ticket-chat" data-ticket-id="'+esc(ticket.id)+'" class="ll-chat-compose">'+
  '<label class="form-label" for="chat-message">Nachricht an '+(isAdmin?'das Mitglied':'das Team')+'</label>'+
  '<textarea id="chat-message" class="input" name="body" rows="3" required maxlength="2000" placeholder="Deine Nachricht …"></textarea>'+
  '<div class="ll-chat-compose-footer"><small>Im Supportticket gespeichert.</small>'+
  '<button class="btn primary" type="submit" '+(s.chatBusy?'disabled':'')+'>Nachricht senden →</button></div></form>'+management+'</section>';
}
function supportPage(){
 const data=s.service||{},mine=Array.isArray(data.mine)?data.mine:[];
 const names={support:'Allgemeine Hilfe',bug:'Fehlerbericht',beta:'Beta-Feedback',plan:'Mitgliedschaft'};
 return pageHeading('HILFE & FEEDBACK','Wir helfen dir <span class="gradient">direkt in der App.</span>',
 'Melde technische Fehler, schick uns Ideen oder frage während der Beta eine Mitgliedschaft an. Deine Anfragen bleiben hier sichtbar.')+
 neonBanner('Brauchst du Hilfe?','Stelle eine Anfrage, melde einen Bug oder lies deine bisherigen Antworten. Dein Support-Ticket landet direkt beim Team.','book')+
 atelierSupportPulse(mine)+
 '<div class="support-grid"><section class="panel support-compose"><span class="eyebrow">[ + ] NEUE ANFRAGE</span><h2>Schreib dem Team</h2>'+
 '<form data-form="support-ticket"><div class="form-group"><label class="form-label" for="support-category">Worum geht es?</label><select class="select" id="support-category" name="category"><option value="support" '+(!s.selectedPlan?'selected':'')+'>Allgemeine Frage</option><option value="bug">Fehler melden</option>'+
 (data.beta_open?'<option value="beta">Beta-Feedback</option>':'')+(data.beta_open&&s.shopEnabled?'<option value="plan" '+(s.selectedPlan?'selected':'')+'>Mitgliedschaft anfragen</option>':'')+'</select></div>'+
 (data.beta_open&&s.shopEnabled?'<div class="form-group support-plan-field" '+(s.selectedPlan?'':'hidden')+'><label class="form-label">Gewünschter Tarif</label>'+
 '<select class="select" name="tier">'+[['pro','Plus · 1,99 €'],['ultimate','Ultimate · 5,99 €'],['max','Max · 11,99 €']].map(([tier,name])=>'<option value="'+tier+'" '+(s.selectedPlan===tier?'selected':'')+'>'+name+'</option>').join('')+'</select>'+
 '<label class="form-label">Laufzeit</label><select class="select" name="months">'+[[1,'1 Monat'],[3,'3 Monate'],[12,'12 Monate · 5 % Jahresrabatt']].map(([n,label])=>'<option value="'+n+'" '+(s.selectedMonths===n?'selected':'')+'>'+label+'</option>').join('')+'</select>'+
 '<small>Der Betrag wird serverseitig berechnet, die Freischaltung erfolgt erst nach Bestätigung. Keine automatische Zahlung.</small></div>':'')+
 '<div class="form-group"><label class="form-label" for="support-message">Deine Nachricht</label><textarea class="input" id="support-message" name="message" minlength="10" maxlength="2000" rows="6" required placeholder="Beschreibe dein Anliegen möglichst genau …"></textarea></div><p class="support-submit-status" id="support-submit-status" role="status" aria-live="polite">'+(s.lastSupportReceipt?'✓ Anfrage gespeichert · Ticket '+esc(s.lastSupportReceipt.slice(0,8)):'Deine Nachricht wird im Support-Posteingang gespeichert.')+'</p><button class="btn primary block" type="submit" '+(s.supportBusy?'disabled':'')+'>'+(s.supportBusy?'Wird gesendet …':'Anfrage senden →')+'</button></form><p class="micro">Bis zu fünf Anfragen innerhalb von 24 Stunden. Bitte sende keine Passwörter.</p></section>'+
 '<section class="panel support-history">'+(s.serviceError?'<p class="support-submit-status error" role="alert">Anfragen konnten nicht geladen werden: '+esc(s.serviceError)+'</p>':'')+'<div class="support-faq"><strong>Schnelle Hilfe</strong><details><summary>Wie erhalte ich Plus oder Ultimate?</summary><p>Eröffne während der Beta eine Tarif-Anfrage. Das Team gibt sie manuell frei.</p></details><details><summary>Wo sehe ich die Antwort?</summary><p>Hier in deinem Posteingang. Lade die App bei Bedarf neu.</p></details><details><summary>Wie melde ich einen Fehler?</summary><p>Wähle Fehler melden und beschreibe Gerät und Schritte.</p></details></div><span class="eyebrow">[ ◷ ] DEIN POSTEINGANG</span><h2>Deine Anfragen</h2><div class="support-controls"><input class="input" type="search" id="support-search" placeholder="Anfragen suchen …" aria-label="Anfragen suchen"><select class="select" id="support-filter"><option value="all">Alle Status</option><option value="open">Offen</option><option value="answered">Beantwortet</option><option value="approved">Genehmigt</option><option value="closed">Geschlossen</option></select></div>'+
 (mine.length?mine.map(t=>'<article class="support-ticket" data-ticket-status="'+esc(t.status||'open')+'"><div><strong>'+esc(names[t.category]||'Anfrage')+'</strong><span class="chip '+(t.status==='approved'?'free':'plus')+'">'+esc(t.status||'open')+'</span></div>'+
 '<small>'+new Date(t.updated_at||t.created_at).toLocaleString('de-DE')+'</small><p>'+esc((t.reply||t.message||'').slice(0,175))+'</p>'+
 '<button type="button" class="btn small" data-chat-open="'+esc(t.id)+'">Gespräch öffnen →</button></article>').join(''):'<p class="muted">Noch keine Anfragen. Deine Antwort erscheint später hier.</p>')+
 '</section>'+ticketChatPanel(false)+'</div>';
}
async function fetchVouchers(){
 if(s.profile?.role!=='admin')return;
 const r=await api.rpc('academy_voucher_list');
 if(r.error)throw r.error;
 s.vouchers=Array.isArray(r.data)?r.data:[];
}
function dailyStrip(){
 const cap=Number(s.daily?.daily_limit??(s.tier==='max'?-1:s.tier==='ultimate'?15:s.tier==='pro'?10:5)),used=Number(s.daily?.used_today)||0;
 return '<div class="daily-strip"><span class="daily-symbol">◷</span><div><strong>'+
 (cap<0?'Unbegrenztes Lernen':'Heute: '+Math.max(0,cap-used)+' von '+cap+' Stationen übrig')+'</strong>'+
 '<small>'+(cap<0?'Alle Lernstationen ohne tägliche Begrenzung.':'Einmal geöffnete Stationen bleiben jederzeit abrufbar.')+'</small></div></div>';
}

function membershipHelp(){
 if(!s.shopEnabled||s.service?.beta_open===false)return '';
 return '<section class="membership-help-callout"><div class="membership-help-spark">✦</div><span class="eyebrow">NOVALAB ACADEMY · BETA</span><h2>Plus oder Ultimate testen?</h2>'+
 '<p>Schreib <strong>NyxAtheris</strong> eine Discord-DM oder eröffne ein <strong>Ticket</strong> auf dem NovaLab-Discord-Server. Erwähne dort <strong>@nyxatheris</strong> und teile mit, warum du Zugang möchtest. Wir schalten Testmitglieder manuell frei.</p>'+
 '<div class="membership-help-actions"><button class="btn primary" data-go="support">In der App anfragen →</button>'+
 '<button class="btn" data-go="plans">Mitgliedschaften vergleichen →</button></div></section>';
}


function plansPage(){
 const own=s.tier,months=s.shopMonths,allCourseCount=s.courses.length||52;
 const selector='<section class="panel ll-term-picker"><h2>Laufzeit wählen</h2><p>Bei 12 Monaten sparst du automatisch 5 %. Zusätzliche Shopaktionen können hinzukommen.</p>'+
 '<div class="ll-term-buttons" role="group" aria-label="Laufzeit">'+
 [[1,'1 Monat'],[3,'3 Monate'],[12,'12 Monate · −5 %']].map(([n,label])=>
 '<button type="button" class="btn small '+(months===n?'primary':'')+'" data-plan-months="'+n+'" aria-pressed="'+(months===n)+'">'+label+'</button>').join('')+'</div></section>';
 function tile(tier,name,cap,stations,desc,benefits){
  const rank={free:0,pro:1,ultimate:2,max:3},current=own===tier,included=rank[own]>rank[tier];
  const offer=tier==='free'?null:offerFor(tier,months);
  const discounted=offer&&offer.total_cents<offer.base_cents;
  const badges=offer?'<div class="ll-price-discounts">'+
   (months===12?'<span class="sale-badge">−5 % Jahresrabatt</span>':'')+
   (Number(offer.promo_percent)>0?'<span class="sale-badge">−'+Number(offer.promo_percent)+' % Shopaktion</span>':'')+'</div>':'';
  return '<article class="membership-card tier-'+tier+(current?' current':'')+'">'+
   '<div class="membership-top"><div><span class="eyebrow">'+(tier==='free'?'KOSTENLOS':tier==='max'?'VOLLER ZUGRIFF':'MEHR LERNEN')+'</span><h2>'+name+'</h2></div>'+
   '<span class="membership-price">'+(offer?
    (discounted?'<s class="sale-old">'+euro(offer.base_cents)+'</s>':'')+
    '<strong class="sale-new">'+euro(offer.total_cents)+'</strong>'+
    '<small>Gesamtpreis für '+months+' '+(months===1?'Monat':'Monate')+'</small>'+ (s.service?.beta_open===false?'':'<em class="membership-beta">BETA · nur auf Anfrage</em>'):
    '<strong>0,00 €</strong><small>dauerhaft</small>')+badges+'</span></div>'+
   '<div class="membership-limits"><span>▦ '+cap+' Kurse</span><span>◷ '+stations+'</span></div>'+
   '<p class="membership-desc">'+desc+'</p>'+
   '<ul class="membership-benefits">'+benefits.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+
   (current?'<div class="membership-own">✓ Dein aktueller Tarif</div>':
    included?'<div class="membership-included">✓ In deinem Tarif enthalten</div>':
    tier==='free'?'<div class="membership-included">Kostenlos nutzbar</div>':
    s.service?.beta_open===false?'<div class="membership-included">Aktuell keine Anfragen</div>':
    '<button type="button" class="btn primary block" data-plan-request="'+tier+'">'+name+' für '+months+' '+(months===1?'Monat':'Monate')+' anfragen →</button>')+'</article>';
 }
 const quote=s.discount;
 return pageHeading('MITGLIEDSCHAFT','Dein <span class="gradient">Lernzugang.</span>',
  'Free zum Einstieg, Plus mit doppelten Limits, Ultimate mit dreifachen Lernlimits und Max ohne Begrenzung.')+
 neonBanner('Dein Upgrade für mehr Lernfreiheit','Vergleiche Kurse, Tageslimits und Prüfungen. Der Preis zeigt immer die gesamte ausgewählte Laufzeit.','xp')+
 dailyStrip()+ownPlanCountdownHtml()+selector+
 ((s.shopOffers||[]).some(x=>Number(x.promo_percent)>0)||s.shopDiscount>0?
 '<div class="shop-sale-banner">✦ Shopaktionen gelten je Tarif und Laufzeit. Der reduzierte Preis steht direkt beim Angebot.</div>':'')+
 '<div class="membership-stack">'+
 tile('free','Free','10','5 pro Tag','Der kostenlose Einstieg.',[
  '10 Kurse und 5 neue Lernstationen täglich','2 Prüfungen pro Tag','Grundlegende Lernfunktionen'])+
 tile('pro','Plus','20','10 pro Tag','Doppelter Lernumfang von Free.',[
  '20 Kurse und 10 neue Lernstationen täglich','4 Prüfungen pro Tag','Script-Werkstatt freigeschaltet'])+
 tile('ultimate','Ultimate','30','15 pro Tag','Dreifacher Lernumfang von Free und doppelt so viele Prüfungen wie Plus.',[
  '30 Kurse und 15 neue Lernstationen täglich','8 Prüfungen pro Tag','Script-Werkstatt und Premium-Lektionen'])+
 tile('max','Max','Alle '+allCourseCount,'Unbegrenzt','Alle Lernfunktionen ohne Kontingente.',[
  'Alle Kurse und neue Lernstationen ohne Tageslimit','Prüfungen unbegrenzt','Vollständige Code-Referenzen, Script-Werkstatt und alle Premium-Lektionen'])+'</div>'+
 '<section class="voucher-panel"><div class="voucher-head"><div><span class="eyebrow">[ % ] GUTSCHEIN</span><h2>Code einlösen</h2></div><span class="voucher-icon">◇</span></div>'+
 '<p>Rabatt erhalten oder eine Plus-, Ultimate- oder Max-Mitgliedschaft mit einem Gutschein freischalten.</p>'+
 '<form data-form="redeem-voucher" class="voucher-form"><label class="form-label" for="voucher-code">Dein Gutscheincode</label>'+
 '<div class="voucher-input-row"><input class="input" id="voucher-code" name="code" autocapitalize="characters" autocomplete="off" required maxlength="64" placeholder="LL-XXXXXXXXXXXX">'+
 '<button type="submit" class="btn primary">Einlösen →</button></div></form>'+
 (quote?'<div class="voucher-quote">✓ Dein reservierter Rabatt: <strong>'+Number(quote.percent)+' % auf '+(quote.tier==='all'?'Plus, Ultimate und Max':plans[quote.tier]||quote.tier)+'</strong>'+
 '<div>1 Monat als Orientierung: <s>'+euro(quote.original_cents||0)+'</s> <strong>'+euro(quote.final_cents||0)+'</strong></div>'+
 '<small>Der endgültige Preis wird beim Team bestätigt. Keine automatische Zahlung.</small></div>':'')+
 '<small>Preise sind unverbindliche Angebote bis zur Bestätigung. Die Mitgliedschaft wird vom Team manuell aktiviert. Keine automatische Zahlung oder Verlängerung.</small></section>'+
 membershipHelp();
}
function examsPage(){
 const cap=Number(s.examStatus?.limit??examCap()),used=Number(s.examStatus?.used||0);
 const suitable=s.courses.filter(c=>lessonsOf(c.id).some(allowed))
 .sort((a,b)=>(countDone(a.id)===lessonsOf(a.id).length?0:1)-(countDone(b.id)===lessonsOf(b.id).length?0:1)||a.name.localeCompare(b.name,'de'));
 const filtered=suitable.filter(c=>{const lessons=lessonsOf(c.id).filter(allowed),done=lessons.filter(l=>doneIds().has(l.id)).length,total=lessons.length,passed=!!s.progress.exams?.[c.id];return s.examFilter==='all'||(s.examFilter==='ready'&&done===total&&!passed)||(s.examFilter==='passed'&&passed)||(s.examFilter==='learning'&&done<total);});
 return pageHeading('PRÜFUNGEN','Deine <span class="gradient">Kursprüfungen.</span>','Jede Prüfung gehört zu genau einem freigeschalteten Kurs. Schließe zuerst dessen Lektionen ab.')+
 neonExamOverview()+'<div class="exam-quota"><strong>✦ '+(cap<0?'Unbegrenzt':Math.max(0,cap-used)+' von '+cap)+' Prüfungen heute übrig</strong><small>'+(s.shopEnabled?'Free: 2 · Plus: 4 · Ultimate: 8 · Max: unbegrenzt.':'Alle Prüfungen ohne Tageslimit.')+' Reset um Mitternacht (Berlin).</small>'+(s.shopEnabled?'<button class="btn small" data-go="plans">Tarife →</button>':'')+'</div>'+
 '<section class="section"><div class="section-heading"><div><span class="eyebrow">DEINE KURSE</span><h2>'+suitable.length+' passende Prüfungen</h2></div></div><div class="exam-filters" role="group" aria-label="Prüfungen filtern">'+[['all','Alle'],['ready','Bereit'],['learning','Noch lernen'],['passed','Bestanden']].map(([key,label])=>'<button class="pill'+(s.examFilter===key?' active':'')+'" type="button" data-exam-filter="'+key+'">'+label+'</button>').join('')+'</div><div class="course-grid">'+(filtered.map(c=>{
  const ls=lessonsOf(c.id).filter(allowed),count=ls.filter(l=>doneIds().has(l.id)).length,ready=count===ls.length,passed=!!s.progress.exams?.[c.id];
  return '<article class="course-card ll-atelier-exam-card '+(passed?'is-complete':'')+'"><div class="ll-atelier-exam-card-glow" aria-hidden="true"></div><div class="course-head"><span class="course-icon">'+atelierScene(passed?'check':'exam','exam')+'</span><span class="chip '+(passed?'free':'plus')+'">'+(passed?'✓ Bestanden':ready?'Bereit':'Noch gesperrt')+'</span></div><span class="micro">'+esc(c.category)+'</span><h3>'+esc(c.name)+'</h3>'+difficultyBadge(c)+'<div class="ll-atelier-exam-progress"><div><strong>'+pct(count,ls.length)+'%</strong><small>Lernfortschritt</small></div><span>'+count+' / '+ls.length+' Lektionen</span></div><div class="progress"><span style="width:'+pct(count,ls.length)+'%"></span></div><button class="btn block" data-go="'+(ready?'exam/':'track/')+esc(c.id)+'">'+(ready?'Prüfung öffnen →':'Kurs fortsetzen →')+'</button></article>';
 }).join('')||'<div class="empty">Hier sind gerade keine passenden Prüfungen.</div>')+'</div></section>';
}
async function loadExam(id){
 s.exam=null;s.examGate=null;
 const ls=lessonsOf(id);
 const entitled=ls.filter(allowed);
 if(!entitled.length){s.examGate={reason:'tier',error:'Diese Kursprüfung ist für deinen Tarif gesperrt.'};return;}
 if(entitled.some(l=>!doneIds().has(l.id)))return;
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
 const all=lessonsOf(id).filter(allowed),done=all.filter(l=>doneIds().has(l.id)).length,ready=all.length>0&&done===all.length;
 const back='<a class="back" href="#exams">← Prüfungen</a>';
 if(!ready)return back+'<section class="exam-intro"><span class="eyebrow">[ ★ ] ABSCHLUSS</span>'+
 '<h1>Abschlussprüfung</h1>'+difficultyBadge(course)+'<p class="lede">'+esc(course.name)+' · 20 Fragen maximal, bestanden ab 80 %.</p>'+
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
 return neonHero('script')+'<section class="track-top"><span class="eyebrow">[ ++ ] DEIN PROJEKT</span>'+
 '<h1>sh_shop</h1><p class="lede">Ein FiveM-Lernprojekt, das mit deinen Lektionen wächst. Abgeschlossene Abschnitte schalten passende Codebeispiele frei.</p>'+
 '<span class="progress-pill">'+done+'/'+all.length+' Teile freigeschaltet</span></section>'+
 atelierScriptStats(done,all.length)+
 '<div class="ll-atelier-studio-shell"><aside class="ll-atelier-studio-files"><div class="ll-atelier-panel-caption"><span class="eyebrow">[ 01 ] WORKSPACE</span><strong>Projekt Explorer</strong></div><div class="file-tree"><div class="file-root">resources/[scripts]/<strong>sh_shop/</strong></div>'+
 PROJECT_FILES.map((f,i)=>'<button type="button" class="tree-file'+(s.projectTab===i?' selected':'')+'" data-project-tab="'+i+'">'+
 '<span class="tree-branch">├─</span><span>'+esc(f.name)+'</span><span class="tree-count">'+projectUnblocked(f).length+'/'+f.ids.filter(k=>all[k]).length+'</span></button>').join('')+'</div></aside><section class="ll-atelier-studio-work"><div class="ll-atelier-panel-caption"><span class="eyebrow">[ 02 ] CODE-VORSCHAU</span><strong>Dein Script</strong></div>'+
 '<div class="file-tabs" role="tablist" aria-label="Projektdateien">'+PROJECT_FILES.map((f,i)=>
 '<button type="button" role="tab" aria-selected="'+(s.projectTab===i)+'" class="file-tab'+(i===s.projectTab?' active':'')+'" data-project-tab="'+i+'">'+esc(f.name)+'</button>').join('')+'</div>'+
 '<div class="file-preview"><div class="file-preview-head"><span>'+esc(file.name)+'</span>'+
 (unlocked.length?'<span class="file-actions"><button class="btn small" type="button" data-action="copy-project">Kopieren</button><button class="btn small" type="button" data-action="download-project">.lua laden ↓</button></span>':'<span class="lock-mini">🔒 Gesperrt</span>')+'</div>'+
 '<pre class="file-code"><code>'+(unlocked.length?esc(code||'-- Codebeispiele werden geladen …'):
 '-- 🔒 Zu diesem Teil fehlen noch bestandene Lektionen.\n-- Bearbeite die passenden Kapitel, um ihn freizuschalten.')+'</code></pre></div></section></div>'+
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
 if(!fullAccess())return paywall('Code-Referenzen','Max','Die Referenzbibliothek gehört zum höchsten Tarif.');
 const lib=referenceLibrary(),entry=lib[s.refLang]||lib.lua||Object.values(lib)[0];
 const langs=Object.keys(lib),groups=Object.keys(entry?.groups||{}),allCount=Object.values(lib).reduce((sum,v)=>sum+Object.values(v.groups||{}).reduce((a,arr)=>a+arr.length,0),0);
 const results=referenceResults();
 return neonHero('reference')+'<section class="track-top"><span class="eyebrow">[ ≡ ] PROGRAMMIER-REFERENZ</span>'+
 '<h1>Dein <em>Spickzettel.</em></h1>'+
 '<p class="lede">Alle wichtigen Grundlagen, Funktionen, Befehle und praktische Beispiele, nach Programmiersprache sortiert. Die komplette Sprachreferenz findest du zusätzlich in der offiziellen Dokumentation.</p>'+
 '<div class="ref-overview"><span>⌘ '+langs.length+' Sprachen & Tools</span><span>▦ '+allCount+' Referenzeinträge</span></div></section>'+
 atelierReferenceInfo(langs.length,allCount)+
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
 '<span class="social-banner-label">NOVALAB ACADEMY · DEVELOPER</span></div>';
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
  return '<article class="friend-profile-card" data-friend-name="'+esc((user.display_name||'')+' '+(user.username||''))+'"><div class="friend-card-banner banner-'+banner+'"><span>✦ NOVALAB ACADEMY</span></div>'+
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
  (friends.length?'<div class="friend-toolbar"><input class="input" id="friend-list-search" type="search" aria-label="Freunde filtern" placeholder="Deine Freunde durchsuchen …"><span class="chip">'+friends.length+' Freunde</span></div><div class="friend-profile-grid">'+friends.map(u=>card(u,
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
 return pageHeading('NOVALAB COMMUNITY','Deine Developer-<span class="gradient">Freunde.</span>',
 'Gemeinsam programmieren und Fortschritte teilen – ohne persönliche Daten anderer Mitglieder offenzulegen.')+
 neonBanner('Gemeinsam besser lernen!','Du hast '+friends.length+' bestätigte Freunde und '+incoming.length+' offene Freundschaftsanfragen. Du bestimmst, welche Fortschritte du teilst.','friends',
 '<button type="button" class="btn small primary" data-friend-tab="search">Freunde hinzufügen →</button>')+
 '<section class="friends-overview"><div class="friends-counter"><span>♡</span><strong>'+friends.length+'</strong><small>Freunde</small></div>'+
 '<div class="friends-counter"><span>✉</span><strong>'+incoming.length+'</strong><small>Neue Anfragen</small></div>'+
 '<div class="friends-counter"><span>✦</span><strong>'+outgoing.length+'</strong><small>Gesendet</small></div></section>'+
 '<div class="friend-navigation" role="tablist" aria-label="Freundeverwaltung">'+
 [['friends','♡','Freundesliste',friends.length],['requests','✉','Anfragen',incoming.length],['search','+','Freund hinzufügen',null]]
 .map(([id,symbol,name,count])=>'<button role="tab" type="button" data-friend-tab="'+id+'" aria-selected="'+(tab===id)+'" class="friend-nav-tab '+(tab===id?'active':'')+'">'+
 '<span>'+symbol+'</span> '+name+(count!==null?'<em>'+count+'</em>':'')+'</button>').join('')+'</div>'+
 content;
}

async function refreshSocial(){const id=s.user?.id;const [r,media]=await Promise.all([api.rpc('academy_social_list'),api.rpc('academy_social_media_list')]);if(!s.ready||s.user?.id!==id)return null;if(r.error)throw r.error;s.social=r.data;if(!media.error)s.socialMedia=media.data||{};return r.data;}
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
function xpHistoryHtml(){
 const rows=(s.xpAwards||[]).slice().sort((a,b)=>Date.parse(b.awarded_at||0)-Date.parse(a.awarded_at||0));
 const cards=rows.map(item=>{
  const lesson=s.lessons.find(l=>l.id===item.lesson_id),course=lesson?courseOf(lesson.course_id):null;
  const date=new Date(item.awarded_at||0);
  const formatted=Number.isNaN(date.getTime())?'Datum unbekannt':date.toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'});
  return '<div class="ll-xp-row"><div class="ll-xp-symbol">✦</div><div class="ll-xp-detail"><strong>'+esc(lesson?.title||item.lesson_id)+'</strong><small>'+esc(course?.name||'Lektion')+' · '+esc(formatted)+'</small></div><span class="ll-xp-amount">+'+Math.max(0,Number(item.xp)||0)+' XP</span></div>';
 });
 return '<section class="ll-xp-history"><div class="section-heading"><div><span class="eyebrow">[ ✦ ] DEINE BELOHNUNGEN</span><h3>Wofür du XP bekommen hast</h3><p>Jede Lektion gibt genau einmal 30 XP. Wiederholungen bringen keine neuen XP.</p></div><span class="chip free">'+rows.length+' Lektionen</span></div>'+
 (rows.length?cards.slice(0,5).join('')+(rows.length>5?'<details class="ll-xp-more"><summary>Alle '+rows.length+' XP-Gutschriften anzeigen</summary>'+cards.slice(5).join('')+'</details>':''):
 '<p class="muted">Du hast noch keine XP gesammelt. Schließe deine erste Lektion ab.</p>')+'</section>';
}
function profilePage(){
 const name=s.profile?.display_name||s.profile?.username||'Developer';
 const streak=Number(s.loginStreak?.current||0),best=Number(s.loginStreak?.best||0),titles=(s.social?.titles||['Developer']).filter(Boolean),selected=s.social?.profile?.title||'Developer';
 return pageHeading('DEIN PROFIL','Dein Lern-<span class="gradient">fortschritt.</span>',
 'Hier siehst du deine wichtigsten Werte und freigeschalteten Erfolge. Persönliche App-Farben und Hintergründe findest du in den Einstellungen.')+
 '<section class="profile-overview-card"><div class="profile-overview-avatar">'+esc(name.slice(0,1).toUpperCase())+'</div><div><span class="eyebrow">NOVALAB DEVELOPER</span><h2>'+esc(name)+'</h2><span class="profile-title-badge">✦ '+esc(selected)+'</span><p>@'+esc(s.profile?.username||'developer')+(s.shopEnabled?' · '+esc(plans[s.tier]||'Free'):'')+'</p>'+(s.shopEnabled&&s.tier!=='free'?'<p class="plan-expiry">'+(s.planExpires?'Freigeschaltet bis '+esc(new Date(s.planExpires).toLocaleString('de-DE')):'Dauerhaft freigeschaltet')+'</p>':'')+'</div><button class="btn small" data-go="settings">App-Design ändern →</button></section>'+ownPlanCountdownHtml()+atelierProfilePath()+
 '<section class="profile-title-picker"><div><span class="eyebrow">[ ✦ ] DEIN PROFILTITEL</span><h3>Zeig, was du erreicht hast.</h3><p>Du kannst nur Titel auswählen, die du durch Lektionen, Prüfungen, Freunde oder Streaks freigeschaltet hast.</p></div><form data-form="profile-title"><label class="form-label" for="profile-title">Freigeschalteten Titel auswählen</label><div class="profile-title-row"><select class="select" id="profile-title" name="title">'+titles.map(t=>'<option value="'+esc(t)+'" '+(t===selected?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select><button class="btn primary" type="submit">Titel verwenden</button></div></form></section>'+
 '<section class="profile-quick-stats"><div class="profile-quick-tile"><span>🔥</span><strong>'+streak+'</strong><small>Login-Streak in Tagen</small></div>'+
 '<div class="profile-quick-tile"><span>🏅</span><strong>'+best+'</strong><small>Bisheriger Rekord</small></div>'+
 '<div class="profile-quick-tile"><span>✦</span><strong>'+xpEarned()+'</strong><small>Erlernte XP</small></div></section>'+
 xpHistoryHtml()+
 '<p class="micro streak-explanation">Deine Streak zählt nur, wenn du täglich den Claim bestätigst. Nach dem Einlösen wartest du mindestens 24 Stunden. Der Kalendertag richtet sich nach Europe/Berlin.</p>'+
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
 'Passe den Hintergrund und die Farben deiner App an. Darunter verwaltest du Anmeldung, Passwort und Sicherheit.')+
 atelierSettingsPreview()+
 '<section class="setting-section appearance-section"><div class="section-heading"><div><span class="eyebrow">01 · PERSÖNLICHES DESIGN</span>'+
 '<h2>Farben & Hintergrund</h2><p>Die Änderungen werden sofort auf diesem Gerät gespeichert.</p></div></div>'+
 '<div class="settings-appearance-card"><h3>Hintergrund & Oberflächen</h3>'+
 appearanceChoices(COLOR_THEMES,getChoicePreference('theme','violet'),'theme-choice')+
 '<h3>Akzentfarbe</h3>'+appearanceChoices(ACCENT_THEMES,getChoicePreference('accent','lavender'),'accent-choice')+
 '<h3>App-Hintergrund</h3><div class="settings-list">'+
 toggle('backgroundArt','Hintergrund-Effekte','Dezente Lichtverläufe für mehr Atmosphäre anzeigen.')+
 toggle('compact','Kompakte Kurskarten','Mehr Lerninhalte gleichzeitig auf dem Bildschirm sehen.')+
 toggle('largeTypography','Größere Schrift','Texte und Bedienelemente besser lesen.')+
 toggle('contrast','Hoher Kontrast','Konturen und Texte deutlicher hervorheben.')+
 toggle('motion','Weniger Bewegung','Animationen und Übergänge reduzieren.')+
 '</div><h3>Interaktionen & Atmosphäre</h3><div class="settings-list">'+
 toggle('animatedBackdrop','Animierter Hintergrund','Sanfte, langsam bewegte Lichtakzente im Hintergrund.')+
 toggle('buttonEffects','Klickeffekte','Kleine Lichtkreise beim Drücken von Buttons anzeigen.')+
 toggle('uiSounds','Klicksounds','Leise Rückmeldung bei Button-Klicks. Standardmäßig ausgeschaltet.')+
 '</div><div class="ll-sound-volume"><label for="ll-sound-volume">Lautstärke der Klicksounds</label>'+
 '<input id="ll-sound-volume" data-sound-volume type="range" min="0" max="100" step="5" value="'+esc(window.LLEffects?.volume?.()??25)+'" aria-label="Lautstärke der Klicksounds">'+
 '<output data-sound-volume-label for="ll-sound-volume">'+esc(window.LLEffects?.volume?.()??25)+'%</output><p>Sounds spielen erst nach dem Aktivieren und deiner nächsten Berührung. Die Auswahl wird auf diesem Gerät gespeichert.</p></div><button class="btn ghost settings-reset" data-action="reset-appearance">↺ Standarddarstellung wiederherstellen</button></div></section>'+
 '<section class="setting-section"><span class="eyebrow">02 · DEIN ACCOUNT</span><h2>Anmeldedaten</h2>'+
 '<div class="account-settings-grid"><div class="panel"><h3>Zugangsdaten</h3>'+
 '<div class="settings-row"><div><strong>E-Mail-Adresse</strong><p>'+esc(email)+'</p></div><span class="chip free">Hinterlegt</span></div>'+
 '<div class="settings-row"><div><strong>Benutzername</strong><p>'+esc(username||'Noch nicht festgelegt')+'</p></div><span class="chip '+(username?'free':'plus')+'">'+(username?'Aktiv':'Optional')+'</span></div>'+
 (!username?'<form data-form="set-username"><div class="form-group"><label class="form-label">Benutzernamen festlegen</label>'+
 '<input class="input" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" minlength="3" maxlength="24" required placeholder="developer123"></div>'+
 '<button class="btn small" type="submit">Benutzernamen aktivieren</button></form>':'<p class="micro">Anmeldung mit deiner E-Mail-Adresse oder deinem Benutzernamen möglich.</p>')+
 '<div class="settings-row"><div><strong>Öffentlicher Anzeigename</strong><p>'+esc(name)+'</p></div><span class="chip free">Aktiv</span></div></div>'+
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
 '<a class="btn small discord" href="https://discord.gg/SZhYa6Nnmy" target="_blank" rel="noopener noreferrer">Discord ↗</a></div></div></section>'+
 '<section class="section panel"><span class="eyebrow">NOVALAB ACADEMY</span><h3>Über die Academy</h3>'+
 '<p class="micro">Developer-Lernplattform mit Kursen, sicheren Accounts, Profilen, Freunden und Erfolgen. Version 28.</p>'+
 '<a href="./privacy.html">Datenschutzhinweise ansehen ↗</a><p class="smallprint" style="margin-top:16px">Made with 💙 from NyxAtheris (NovaLab Academy)</p></section>';
}

function voucherAdminSection(){
 const items=(s.vouchers||[]).filter(v=>!v.expires_at||new Date(v.expires_at).getTime()>Date.now());
 const active=items.filter(v=>v.active&&Number(v.uses)<Number(v.max_uses)).length;
 const rows=items.map(v=>{
  const used=Number(v.uses)||0,max=Math.max(1,Number(v.max_uses)||1),expires=new Date(v.expires_at);
  const expiry=Number.isFinite(expires.getTime())?new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric'}).format(expires):'–';
  return '<article class="voucher-manage-card '+(v.active?'':'is-inactive')+'"><div class="voucher-manage-top">'+
   '<div class="voucher-manage-code"><span class="voucher-code-icon">%</span><div><code>'+esc(v.code)+'</code>'+
   '<small>'+esc(v.kind==='gift'?'Gratis '+(plans[v.tier]||v.tier)+' · '+(v.seconds?Math.round(Number(v.seconds)/60)+' Minuten':Number(v.days)+' Tage'):Number(v.percent)+' % Rabatt für '+(v.tier==='all'?'alle Tarife':plans[v.tier]||v.tier))+'</small></div></div>'+
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
 '<option value="pro">Plus · 1,99 € / Monat</option><option value="ultimate">Ultimate · 5,99 € / Monat</option><option value="max">Max · 11,99 € / Monat</option><option value="all" class="voucher-all-tier" hidden>Alle Tarife · Rabatt</option></select></div>'+
 '<div class="form-group"><label class="form-label">Code erstellen</label><select class="select" name="code_mode">'+
 '<option value="random">Automatisch generieren</option><option value="custom">Eigenen Code bestimmen</option></select></div>'+
 '<div class="form-group voucher-custom-field" hidden><label class="form-label">Dein Wunschcode</label>'+
 '<input class="input" name="custom_code" maxlength="64" pattern="[A-Za-z0-9][A-Za-z0-9-]{2,63}" autocomplete="off" autocapitalize="characters" placeholder="NYX oder NyxAtheris5">'+
 '<small>3–64 Zeichen, Buchstaben, Zahlen und Bindestriche. Groß-/Kleinschreibung ist egal.</small></div>'+
 '<div class="form-group voucher-discount-field" hidden><label class="form-label">Rabatt</label>'+
 '<input class="input" type="number" name="percent" min="1" max="90" value="20"><small>Prozent auf den angefragten Tarif.</small></div>'+
 '<div class="form-group voucher-gift-field"><label class="form-label">Mitgliedschaft für</label><div class="duration-fields"><input class="input" type="number" name="duration_value" min="1" max="10000" value="30"><select class="select" name="duration_unit"><option value="minute">Minuten</option><option value="day" selected>Tage</option><option value="year">Jahre</option></select></div></div>'+
 '<div class="form-group"><label class="form-label">Maximale Einlösungen</label><input class="input" type="number" name="max_uses" min="1" max="1000" value="1" required></div>'+
 '<div class="form-group"><label class="form-label">Code gültig für</label><div class="duration-fields"><input class="input" type="number" name="valid_value" min="1" max="10000" value="30" required><select class="select" name="valid_unit"><option value="minute">Minuten</option><option value="day" selected>Tage</option><option value="year">Jahre</option></select></div></div></div>'+
 '<button class="btn primary block" type="submit">Gutschein sicher erstellen →</button></form><div id="created-voucher" class="voucher-created" hidden></div></div>'+
 '<div class="voucher-list-heading"><h3>Deine Gutscheine</h3><button class="btn small" type="button" data-action="refresh-admin">↻ Aktualisieren</button></div>'+
 '<div class="voucher-admin-list">'+(rows||'<div class="empty"><strong>Keine aktiven Gutscheine mehr.</strong><p>Erstelle oben einen neuen Code. Abgelaufene und gelöschte Gutscheine verschwinden automatisch aus der Liste.</p></div>')+'</div>'+
 '<p class="micro voucher-footnote">Bereits eingelöste Codes bleiben für Abrechnung und Nachweise intern archiviert. Ungenutzte Codes werden nach Ablauf automatisch gelöscht. Die automatische Bereinigung läuft etwa jede Minute.</p></section>';
}


function shopDiscountAdminSection(){
 const tiers=[['pro','Plus'],['ultimate','Ultimate'],['max','Max']];
 return '<section class="panel ll-shop-discount"><h2>Rabatte je Tarif und Laufzeit</h2>'+
 '<p>Zusatzrabatt für 1, 3 oder 12 Monate separat festlegen (0–90 %). Bei 12 Monaten bleibt der automatische 5%-Jahresrabatt bestehen. Keine Zahlung oder automatische Aktivierung.</p>'+
 '<div class="shop-sale-admin ll-offer-admin-grid">'+tiers.flatMap(([tier,name])=>
 [1,3,12].map(months=>{
  const offer=offerFor(tier,months),percent=Number(offer.promo_percent)||0;
  return '<form data-form="shop-offer" class="ll-offer-admin-card">'+
   '<strong>'+name+' · '+months+' '+(months===1?'Monat':'Monate')+'</strong>'+
   '<p class="micro">Grundpreis '+euro(offer.base_cents)+(months===12?' · inkl. Jahresrabatt':'')+'</p>'+
   '<label>Zusatzrabatt <input type="number" class="input" name="percent" min="0" max="90" step="1" value="'+percent+'" required> %</label>'+
   '<input type="hidden" name="tier" value="'+tier+'">'+
   '<input type="hidden" name="months" value="'+months+'">'+
   '<small>Gesamt: '+euro(offer.total_cents)+'</small>'+
   '<button type="submit" class="btn small primary">Speichern</button></form>';
 })).join('')+'</div></section>';
}
function supportAdminSection(){
 const entries=Array.isArray(s.service?.admin)?[...s.service.admin].sort((a,b)=>Date.parse(b.updated_at||b.created_at)-Date.parse(a.updated_at||a.created_at)):[];
 return '<section class="section panel support-admin ll-admin-inbox"><div class="section-heading"><div><span class="eyebrow">ADMIN · SUPPORT</span><h2>Support-Posteingang</h2>'+
 '<p>Alle Anfragen an einem Ort. Wähle ein Ticket aus und schreibe mit dem Mitglied.</p></div><button type="button" class="btn small" data-action="refresh-support">↻ Aktualisieren</button></div>'+
 (s.serviceError?'<p class="support-submit-status error" role="alert">Posteingang nicht vollständig geladen: '+esc(s.serviceError)+' · Erneut auf „Aktualisieren“ tippen.</p>':'')+
 (s.serviceLastUpdated?'<p class="micro">Zuletzt synchronisiert: '+new Date(s.serviceLastUpdated).toLocaleTimeString('de-DE')+'</p>':'')+
 '<div class="support-admin-stats">'+[['Gesamt','all'],['Offen','open'],['Beantwortet','answered'],['Geschlossen','closed']].map(([label,status])=>'<span><strong>'+entries.filter(x=>status==='all'||x.status===status).length+'</strong><small>'+label+'</small></span>').join('')+'</div>'+
 '<label class="beta-switch"><span><strong>Beta-Anfragen sichtbar</strong><small>Bestehende Tickets bleiben erhalten.</small></span><input type="checkbox" id="beta-enabled" '+(s.service?.beta_open?'checked':'')+'></label>'+
 '<div class="ll-admin-ticket-list">'+(entries.length?entries.map(t=>
  '<article class="ll-admin-ticket '+(s.chatTicketId===t.id?'selected':'')+'"><div class="ll-ticket-row"><strong>'+esc(t.username||'Mitglied')+'</strong>'+
  '<span class="chip '+(t.status==='approved'?'free':'plus')+'">'+esc(t.status)+'</span></div>'+
  '<small>'+esc(t.category)+(t.tier?' · '+esc(plans[t.tier]||t.tier):'')+(t.term_months?' · '+Number(t.term_months)+' Monate · '+euro(t.quoted_cents||0):'')+' · '+new Date(t.updated_at||t.created_at).toLocaleString('de-DE')+'</small>'+
  '<p>'+esc((t.reply||t.message||'').slice(0,170))+'</p><button class="btn small" type="button" data-chat-open="'+esc(t.id)+'">'+(s.chatTicketId===t.id?'Gespräch aktualisieren':'Chat öffnen →')+'</button></article>').join(''):
  '<div class="empty">'+(s.serviceError?'Posteingang konnte nicht geladen werden. Bitte aktualisieren.':'Noch keine Supportanfragen. Neue Tickets erscheinen hier automatisch.')+'</div>')+'</div></section>'+ticketChatPanel(true);
}


/* Render server-authoritative expiry times; never create a client-only subscription. */
function membershipRemainingText(tier,expiry){
 if(!tier||tier==='free')return 'Free · dauerhaft kostenlos';
 if(expiry===null||expiry===undefined||expiry==='')return 'Unbefristet · kein Ablaufdatum';
 const end=Date.parse(expiry);
 if(!Number.isFinite(end))return 'Ablaufdatum nicht verfügbar';
 const seconds=Math.max(0,Math.ceil((end-Date.now())/1000));
 if(seconds===0)return 'Abgelaufen';
 const d=Math.floor(seconds/86400),h=Math.floor(seconds%86400/3600),
       m=Math.floor(seconds%3600/60),s=seconds%60;
 return d+' Tage · '+String(h).padStart(2,'0')+' Std. · '+
  String(m).padStart(2,'0')+' Min. · '+String(s).padStart(2,'0')+' Sek.';
}
function membershipExpiryText(tier,expiry){
 if(!tier||tier==='free')return 'Free · ohne Ablaufdatum';
 if(!expiry)return 'Ohne Ablaufdatum';
 const value=new Date(expiry);
 return Number.isNaN(value.getTime())?'Ungültiges Ablaufdatum':
  'Endet am '+new Intl.DateTimeFormat('de-DE',{
   dateStyle:'medium',timeStyle:'medium',timeZone:'Europe/Berlin'
  }).format(value)+' ab';
}
function ownPlanCountdownHtml(){
 if(!s.ready||!s.shopEnabled)return '';
 const tier=plans[s.tier]||'Free';
 const expiry=s.planExpires;
 return '<section class="ll-own-plan-status" aria-label="Deine Mitgliedschaft und verbleibende Laufzeit">'+
  '<div class="ll-own-plan-identity"><span class="eyebrow">DEINE MITGLIEDSCHAFT</span>'+
  '<strong>'+esc(tier)+'</strong><small>'+esc(membershipExpiryText(s.tier,expiry))+'</small></div>'+
  '<div class="ll-own-plan-time"><span class="ll-own-plan-caption">Verbleibende Laufzeit</span>'+
  '<strong role="timer" aria-live="off" data-own-plan-clock>'+
   esc(membershipRemainingText(s.tier,expiry))+'</strong></div>'+
  '<button type="button" class="btn small" data-go="plans">Tarife ansehen →</button></section>';
}
function updateMembershipClocks(){
 if(!s.ready)return;
 if(parseRoute().page==='admin'){
  document.querySelectorAll('[data-plan-clock]').forEach(el=>{
   const id=el.dataset.planClock,remaining=membershipRemainingText(s.memberPlans[id],s.memberExpiry[id]);
   if(el.textContent!==remaining)el.textContent=remaining;
   el.classList.toggle('is-expired',remaining==='Abgelaufen');
  });
 }
 const text=membershipRemainingText(s.tier,s.planExpires);
 document.querySelectorAll('[data-own-plan-clock]').forEach(el=>{
  if(el.textContent!==text)el.textContent=text;
  el.classList.toggle('is-expired',text==='Abgelaufen');
 });
}
if(typeof setInterval==='function')setInterval(updateMembershipClocks,1000);

function adminRegistrationSection(pendingCount){
 const mode=s.registrationPolicy?.mode||'approval',ready=s.registrationPolicy?.loaded===true;
 const open=mode==='open';
 return '<section class="section ll-registration-admin"><div class="ll-admin-section-header">'+
  '<span class="eyebrow">[ ◎ ] REGISTRIERUNG & FREIGABEN</span>'+
  '<h2>Wer darf die Academy benutzen?</h2><p>Entscheide, ob neue Konten sofort freigeschaltet werden oder sich zuerst bewerben müssen.</p></div>'+
  '<div class="ll-registration-current"><span class="ll-registration-status '+(open?'is-open':'is-approval')+'">'+
   (open?'● Freie Registrierung aktiv':'● Bewerbung & Freigabe aktiv')+'</span>'+
   '<span>'+(ready?'Diese Einstellung gilt für alle neuen Registrierungen.':'Einstellung wird gelesen – bis dahin wird nichts automatisch freigeschaltet.')+'</span></div>'+
  '<div class="ll-registration-mode-grid">'+
   '<button type="button" class="ll-registration-mode '+(!open?'is-current':'')+'" data-registration-mode="approval" aria-pressed="'+String(!open)+'" '+(!s.isOwner||!ready?'disabled':'')+'>'+
    '<span class="ll-registration-mode-icon">◷</span><strong>Bewerbung mit Freigabe</strong>'+
    '<small>Neue Personen senden eine Registrierungsanfrage. Erst nachdem du sie angenommen hast, dürfen sie die Academy nutzen.</small>'+
    '<span class="ll-registration-mode-foot">'+(!open?'✓ Ausgewählt':'Modus auswählen →')+'</span></button>'+
   '<button type="button" class="ll-registration-mode '+(open?'is-current':'')+'" data-registration-mode="open" aria-pressed="'+String(open)+'" '+(!s.isOwner||!ready?'disabled':'')+'>'+
    '<span class="ll-registration-mode-icon">✦</span><strong>Freie Registrierung</strong>'+
    '<small>Neue Personen können direkt ein Free-Konto erstellen und sofort loslernen, ohne dass du sie einzeln genehmigen musst.</small>'+
    '<span class="ll-registration-mode-foot">'+(open?'✓ Ausgewählt':'Modus auswählen →')+'</span></button>'+
  '</div><p class="ll-registration-notice"><strong>Wichtig:</strong> Bereits vorhandene Konten und wartende Anfragen ändern ihren Status beim Umschalten nicht. Die E-Mail-Adressen werden bei dieser Registrierung nicht automatisch auf Besitz geprüft. '+'Die Änderung wirkt nur für neue Anmeldungen.</p>'+
  (!s.isOwner?'<p class="ll-registration-notice">Nur der Projekteigentümer darf den Registrierungsmodus ändern. Teamadmins können ihn ansehen.</p>':'')+
  '<div class="ll-registration-pending"><div><strong>'+pendingCount+' offene '+(pendingCount===1?'Bewerbung':'Bewerbungen')+'</strong>'+
   '<span>Bestehende Anträge kannst du weiterhin einzeln prüfen.</span></div>'+
   '<button type="button" class="btn small" data-go="admin/members">Anträge öffnen →</button></div>'+
  '<button class="btn small" type="button" data-registration-refresh>Aktuellen Modus laden ↻</button></section>';
}
function filteredAdminCourseProgress(){
 const entries=Array.isArray(s.adminLearner?.courses)?s.adminLearner.courses:[];
 const term=String(s.adminProgressSearch||'').trim().toLocaleLowerCase('de');
 return entries.filter(c=>{
  const started=c.completed>0||!!c.last_opened,finished=c.total>0&&c.completed===c.total;
  if(s.adminProgressFilter==='started'&&!started)return false;
  if(s.adminProgressFilter==='finished'&&!finished)return false;
  if(term&&!String(c.name+' '+c.category+' '+(c.current?.title||'')+' '+(c.next?.title||'')+' '+(c.last_opened?.title||'')).toLocaleLowerCase('de').includes(term))return false;
  return true;
 });
}
function renderAdminCourseProgress(){
 const courses=filteredAdminCourseProgress();
 return '<div class="ll-admin-course-progress-list">'+
  (courses.map(course=>{
   const done=Math.max(0,Number(course.completed)||0),total=Math.max(0,Number(course.total)||0);
   const pct=Math.max(0,Math.min(100,Number(course.percent)||0));
   const latest=course.last_opened||null,next=course.next||null;
   return '<details class="ll-admin-course-progress-card"><summary><div class="ll-admin-course-progress-title">'+
    '<span class="ll-admin-course-icon">'+esc((course.name||'?').slice(0,1).toUpperCase())+'</span>'+
    '<div><strong>'+esc(course.name)+'</strong><small>'+esc(course.category||'Kurs')+
    (latest?' · Zuletzt geöffnet: '+esc(latest.title):'')+'</small></div></div>'+
    '<div class="ll-admin-course-progress-count"><strong>'+done+' / '+total+'</strong><small>'+pct+' %</small></div>'+
    '<span class="ll-admin-course-chevron">⌄</span></summary>'+
    '<div class="ll-admin-course-progress-body"><div class="ll-admin-course-progress-track" role="progressbar" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100" aria-label="Kursfortschritt '+esc(course.name)+'"><span style="width:'+pct+'%"></span></div>'+
    (latest?'<p><span>Zuletzt geöffnete Lektion</span><strong>'+esc(latest.title)+'</strong><small>'+esc(latest.chapter||'')+'</small></p>':'')+
    (next?'<p><span>Nächste offene Lektion</span><strong>'+esc(next.title)+'</strong><small>'+esc(next.chapter||'')+'</small></p>':'<p><strong>Alle Lektionen dieses Lernpfads abgeschlossen.</strong></p>')+
    '</div></details>';
  }).join('')||'<div class="empty"><strong>Keine passenden Kurse.</strong><p>Ändere den Suchbegriff oder die Auswahl.</p></div>')+
  '</div><p class="micro">'+courses.length+' von '+(s.adminLearner?.courses?.length||0)+' Kursen angezeigt</p>';
}
function adminStudentProgressPanel(){
 const data=s.adminLearner;if(!data?.student)return '';
 const who=data.student.username||data.student.display_name||'Mitglied',sum=data.progress||{};
 const updated=sum.updated_at?new Date(sum.updated_at):null;
 const when=updated&&!Number.isNaN(updated.getTime())?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Berlin'}).format(updated):'Noch kein gespeicherter Fortschritt';
 return '<section class="ll-admin-progress-panel" role="region" aria-label="Kursfortschritt von '+esc(who)+'" id="admin-progress-detail">'+
  '<div class="ll-admin-progress-head"><div><span class="eyebrow">[ ◉ ] LERNFORTSCHRITT · MITGLIEDERANSICHT</span>'+
   '<h2>'+esc(who)+'</h2><p>Fortschritt aller Kurse und einzelne Lektionen · '+esc(when)+'</p></div>'+
   '<button class="btn small" data-close-admin-progress type="button">Schließen ✕</button></div>'+
  '<div class="ll-admin-progress-metrics">'+
  '<div><strong>'+Number(sum.completed||0)+'</strong><span>Lektionen erledigt</span></div>'+
  '<div><strong>'+Number(sum.total||0)+'</strong><span>Lektionen insgesamt</span></div>'+
  '<div><strong>'+Number(sum.started_courses||0)+'</strong><span>Kurse begonnen</span></div>'+
  '<div><strong>'+Number(sum.finished_courses||0)+'</strong><span>Kurse abgeschlossen</span></div></div>'+
  (sum.last_opened?'<div class="ll-admin-current-lesson"><span>Zuletzt geöffnete Lektion</span><strong>'+esc(sum.last_opened.title)+'</strong><small>'+esc(s.adminLearner?.courses?.find(c=>c.id===sum.last_opened.course_id)?.name||'')+' · '+esc(sum.last_opened.chapter||'')+'</small></div>':'')+
  '<div class="ll-admin-progress-controls"><label for="admin-progress-search">Kurs oder Lektion suchen<input id="admin-progress-search" class="input" type="search" value="'+esc(s.adminProgressSearch||'')+'" placeholder="z. B. Lua, HTML, Variablen …"></label>'+
  '<label for="admin-progress-filter">Kursstatus<select class="select" id="admin-progress-filter">'+
  [['all','Alle 52 Kurse'],['started','Begonnen'],['finished','Abgeschlossen']].map(([value,label])=>'<option value="'+value+'" '+(s.adminProgressFilter===value?'selected':'')+'>'+label+'</option>').join('')+
  '</select></label></div>'+
  '<div id="admin-progress-course-results">'+renderAdminCourseProgress()+'</div>'+
  '<p class="ll-admin-progress-private">Es werden ausschließlich die mit Supabase synchronisierten Lernstände angezeigt. Private Notizen, Code-Entwürfe und nur lokal gespeicherte Daten bleiben verborgen.</p></section>';
}
async function loadAdminStudentProgress(userId){
 if(s.profile?.role!=='admin')return;
 if(!/^[0-9a-f-]{36}$/i.test(String(userId||'')))return;
 s.adminProgressBusy=true;s.adminLearner=null;s.adminProgressSearch='';s.adminProgressFilter='all';
 render();
 try{
  const data=await adminCall({action:'studentProgress',userId});
  if(!data.ok||!Array.isArray(data.courses))throw Error('Lernfortschritt konnte nicht geladen werden.');
  s.adminLearner=data;
 }catch(error){s.adminLearner=null;notice('Lernfortschritt: '+formatError(error));}
 finally{s.adminProgressBusy=false;render();
  const panel=$('#admin-learner-progress');if(panel?.scrollIntoView)panel.scrollIntoView({behavior:'smooth',block:'start'});
 }
}


function adminSelfSection(){
 const state=s.adminSelf;
 if(!state)return '<section class="section panel ll-self-admin"><span class="eyebrow">ADMIN · MEIN KONTO</span><h2>Meine Admin-Einstellungen</h2>'+
 '<p class="muted">'+esc(s.adminSelfError||'Kontostatus wird geladen. Du kannst die Daten erneut abrufen.')+'</p>'+
 '<button type="button" class="btn primary" data-action="admin-self-refresh">Kontostatus laden</button></section>';
 const total=xpEarned(),base=(s.xpAwards||[]).reduce((n,entry)=>n+Math.max(0,Number(entry.xp)||0),0),
  extra=Number(state.xp_adjustment)||0,st=s.loginStreak||state.streak||{},
  current=Math.max(0,Number(st.current)||0),best=Math.max(current,Number(st.best)||0),
  completed=(s.progress?.done||[]).length,months=[0,1,3,12],
  history=Array.isArray(state.changes)?state.changes:[];
 const expiry=state.plan_expires_at?new Date(state.plan_expires_at).toLocaleString('de-DE'):'Unbefristet';
 const auditLabel={set_xp:'XP korrigiert',set_streak:'Daily Streak angepasst',set_plan:'Eigenen Tarif geändert'};
 return '<div class="ll-admin-self-page">'+
  '<section class="panel ll-self-admin-hero"><span class="eyebrow">ADMINISTRATION · NUR DEIN KONTO</span><h2>Meine <span class="gradient">Admin-Einstellungen</span></h2>'+
  '<p>Verwalte deinen eigenen XP-Stand, deine Daily Streak und deinen Tarif. Deine Adminrechte bleiben immer erhalten; andere Konten werden nicht verändert.</p>'+
  '<button type="button" class="btn small" data-action="admin-self-refresh">↻ Daten aktualisieren</button></section>'+
  ownPlanCountdownHtml()+'<div class="ll-admin-self-stats">'+
  [['✦',total.toLocaleString('de-DE'),'Meine XP'],
   ['♨',current+' Tage','Aktuelle Streak'],
   ['★',best+' Tage','Streak-Rekord'],
   ['▦',completed+' Lektionen','Abgeschlossene Lektionen'],
   ['◎',Number(state.stations_today||0)+'','Stationen heute'],
   ['✧',Number(state.exams_today||0)+'','Prüfungen heute']].map(([icon,num,label])=>
    '<div class="ll-admin-self-stat"><span>'+icon+'</span><strong>'+esc(num)+'</strong><small>'+esc(label)+'</small></div>').join('')+
  '</div>'+
  '<div class="ll-admin-self-grid">'+
  '<section class="panel ll-admin-self-card"><span class="eyebrow">[ ✦ ] XP VERWALTEN</span><h3>XP-Level anpassen</h3>'+
   '<p>Deine echten Lektions-XP ('+base.toLocaleString('de-DE')+') bleiben unverändert. Der Admin-Ausgleich ('+(extra>=0?'+':'')+extra.toLocaleString('de-DE')+') wird zusätzlich berücksichtigt.</p>'+
   '<form data-form="admin-self-xp"><label for="admin-own-xp">Neuer Gesamt-XP-Stand</label>'+
   '<input id="admin-own-xp" class="input" name="xp" type="number" min="0" max="10000000" step="1" value="'+total+'" required>'+
   '<button class="btn primary block" type="submit">XP-Stand speichern</button></form>'+
   '<div class="ll-admin-self-shortcuts"><button type="button" class="btn small" data-action="admin-self-xp-add" data-amount="500">+500 XP</button>'+
   '<button type="button" class="btn small" data-action="admin-self-xp-add" data-amount="1000">+1.000 XP</button>'+
   '<button type="button" class="btn small" data-action="admin-self-xp-add" data-amount="5000">+5.000 XP</button>'+
   '<button type="button" class="btn small" data-action="admin-self-xp-add" data-amount="-500">−500 XP</button></div></section>'+
  '<section class="panel ll-admin-self-card"><span class="eyebrow">[ ♨ ] DAILY STREAK</span><h3>Deine Streak einstellen</h3>'+
   '<p>Dein aktueller Stand und dein Rekord werden dauerhaft gespeichert. Der tägliche Claim-Cooldown bleibt geschützt.</p>'+
   '<form data-form="admin-self-streak"><div class="ll-admin-self-fields">'+
   '<label>Aktuelle Tage<input class="input" type="number" name="current" min="0" max="5000" value="'+current+'" step="1" required></label>'+
   '<label>Streak-Rekord<input class="input" type="number" name="best" min="0" max="5000" value="'+best+'" step="1" required></label></div>'+
   '<button class="btn primary block" type="submit">Daily Streak speichern</button></form>'+
   '<div class="ll-admin-self-shortcuts"><button type="button" class="btn small" data-action="admin-self-streak-add" data-amount="1">+1 Tag</button>'+
   '<button type="button" class="btn small" data-action="admin-self-streak-add" data-amount="7">+7 Tage</button>'+
   '<button type="button" class="btn small" data-action="admin-self-streak-add" data-amount="30">+30 Tage</button>'+
   '<button type="button" class="btn small" data-action="admin-self-streak-add" data-amount="-1">−1 Tag</button></div>'+
   '<small>Bereits echte Daily-Claims: '+Number(state.streak_claims||0)+' · '+(st.claimable?'Heute claimbar':st.claimed_today?'Heute bereits geclaimt':'Nächster Claim nach Cooldown')+'</small></section>'+
  '<section class="panel ll-admin-self-card"><span class="eyebrow">[ ◈ ] MEINE MITGLIEDSCHAFT</span><h3>Eigenen Tarif ändern</h3>'+
   '<p><strong>Aktuell: '+esc(plans[state.tier]||state.tier||'Max')+'</strong> · '+esc(expiry)+'</p>'+
   '<p>Wähle Free, Plus, Ultimate oder Max. Die Einstellung wirkt auf deine Lernlimits und Premiumfunktionen, nicht auf deine Administratorrolle.</p>'+
   '<form data-form="admin-self-plan"><div class="ll-admin-self-fields">'+
   '<label>Mitgliedschaft<select class="select" name="tier">'+[['free','Free'],['pro','Plus'],['ultimate','Ultimate'],['max','Max']].map(([key,name])=>
    '<option value="'+key+'" '+(state.tier===key?'selected':'')+'>'+name+'</option>').join('')+'</select></label>'+
   '<label>Laufzeit<select class="select" name="months">'+months.map(n=>
    '<option value="'+n+'" '+(n===0?'selected':'')+'>'+(n===0?'Dauerhaft':n+' '+(n===1?'Monat':'Monate'))+'</option>').join('')+'</select></label></div>'+
   '<button class="btn primary block" type="submit">Eigenes Abo ändern</button></form>'+
   '<button type="button" class="btn small" data-action="admin-self-max">Max dauerhaft wiederherstellen</button>'+
   '<small>Es wird keine Zahlung ausgelöst. Bei einer befristeten Mitgliedschaft wechseln die Lernrechte nach Ablauf automatisch auf Free. Die Adminrechte bleiben bestehen.</small></section>'+
  '</div>'+
  '<section class="panel ll-admin-self-history"><div class="section-heading"><div><span class="eyebrow">[ ◷ ] SICHERHEIT</span><h3>Meine letzten Admin-Änderungen</h3></div>'+
   '<button class="btn small" type="button" data-action="admin-self-refresh">↻ Aktualisieren</button></div>'+
   (history.length?'<div class="ll-admin-self-events">'+history.map(entry=>
    '<div class="ll-admin-self-event"><strong>'+esc(auditLabel[entry.action]||'Kontoverwaltung')+'</strong>'+
    '<span>'+esc(new Date(entry.updated_at).toLocaleString('de-DE'))+'</span></div>').join('')+'</div>':
   '<p class="muted">Hier erscheinen deine künftig vorgenommenen XP-, Streak- und Tarifänderungen.</p>')+
   '<p class="micro">Nur angemeldete, verifizierte Administratoren dürfen die eigenen Werte anpassen. Jede Änderung wird protokolliert.</p></section>'+
 '</div>';
}

function adminPage(){
 if(s.profile?.role!=='admin')return '<section class="locked-panel"><h2>Nur für Administratoren.</h2></section>';
 const shopToggle='<section class="panel"><h2>Shop-Sichtbarkeit</h2><p>Wenn deaktiviert, ist der Shop für alle einschließlich Administratoren unsichtbar. Alle Lerninhalte sind kostenlos.</p><button type="button" class="btn primary" data-toggle-shop>'+ (s.shopEnabled?'Shop deaktivieren':'Shop für alle aktivieren') +'</button></section>';
 const people=s.members||[],pending=people.filter(u=>u.access_status==='pending'),query=String(s.adminSearch||'').toLowerCase(),rest=people.filter(u=>u.access_status!=='pending').filter(u=>(s.adminFilter==='all'||(s.adminFilter==='active'&&u.active)||(s.adminFilter==='blocked'&&!u.active)||(s.adminFilter==='admin'&&u.role==='admin'))&&(!query||String(u.username||'').toLowerCase().includes(query)||String(u.email||'').toLowerCase().includes(query))),active=people.filter(u=>u.active).length,blocked=people.filter(u=>!u.active&&u.access_status!=='pending').length;
 const requests=shopToggle+'<section class="section approval-section"><div class="section-heading"><div><span class="eyebrow">[ ! ] ANTRÄGE</span>'+
 '<h2>Registrierungsanfragen <span class="pending-bubble">'+pending.length+'</span></h2>'+
 '<p>'+((s.registrationPolicy?.mode==='open')?'Bestehende Bewerbungen können hier weiter geprüft werden. Neue Registrierungen werden momentan direkt freigeschaltet.':'Neue Registrierungen werden erst nach deiner Freigabe aktiviert.')+'</p></div>'+
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
  const owner=u.role==='admin',tier=s.memberPlans[u.id]||'free',expiry=s.memberExpiry[u.id]||null;
  const subscription=tier==='free'?'free':!expiry?'unlimited':Date.parse(expiry)<=Date.now()?'expired':'active';
  return '<details class="member-card ll-member-compact" data-member-id="'+esc(u.id)+'"><summary class="ll-member-summary"><div class="member-header">'+
  '<div class="member-avatar">'+esc((u.username||u.email||'?').slice(0,1).toUpperCase())+'</div>'+
  '<div class="member-identity"><strong>'+esc(u.username||u.email||'Mitglied')+'</strong>'+
  '<small>'+esc(u.email||'')+'</small></div>'+status(u)+'</div><span class="ll-member-expand">Details ansehen ⌄</span></summary>'+
  '<div class="member-management"><div class="ll-admin-user-progress-action"><button type="button" class="btn small ll-progress-open" data-view-progress="'+esc(u.id)+'">◉ Kurs- & Lektionsfortschritt ansehen →</button></div><div><label class="form-label">Mitgliedschaft</label>'+
   (owner?'<span class="member-admin-tier">Administrator · eigener Tarif separat verwaltbar</span>':
   '<select class="select" data-admin-tier="'+esc(u.id)+'" aria-label="Mitgliedschaft ändern für '+esc(u.username||u.email||'Mitglied')+'">'+
   '<option value="free" '+(tier==='free'?'selected':'')+'>Free · 5/Tag</option>'+
   '<option value="pro" '+(tier==='pro'?'selected':'')+'>Plus · 10/Tag</option>'+
   '<option value="ultimate" '+(tier==='ultimate'?'selected':'')+'>Ultimate · 15/Tag</option>'+'<option value="max" '+(tier==='max'?'selected':'')+'>Max · Unbegrenzt</option></select>')+
   '</div>'+(!owner?
    '<section class="ll-plan-manager" aria-label="Abo-Laufzeit von '+esc(u.username||'Mitglied')+'">'+
    '<div class="ll-plan-status"><span class="ll-plan-dot '+subscription+'"></span><div><strong data-plan-clock="'+esc(u.id)+'">'+esc(membershipRemainingText(tier,expiry))+'</strong><small>'+esc(membershipExpiryText(tier,expiry))+'</small></div></div>'+
    (tier!=='free'?'<div class="ll-plan-form"><label for="plan-days-'+esc(u.id)+'">Laufzeit in Tagen <input id="plan-days-'+esc(u.id)+'" class="input" data-plan-days type="number" inputmode="numeric" min="1" max="3650" step="1" value="30"></label>'+
    '<div class="ll-plan-actions">'+
    (expiry?'<button type="button" class="btn small" data-plan-action="extend" data-plan-user="'+esc(u.id)+'">+ Tage</button><button type="button" class="btn small" data-plan-action="reduce" data-plan-user="'+esc(u.id)+'">− Tage</button>':'<button type="button" class="btn small" data-plan-action="set" data-plan-user="'+esc(u.id)+'">Laufzeit festlegen</button>')+
    '<button type="button" class="btn small danger" data-plan-action="end" data-plan-user="'+esc(u.id)+'">Abo beenden</button></div></div>':'<p class="micro">Wähle Plus oder Ultimate, um eine 30-tägige Mitgliedschaft zu vergeben.</p>')+
    '</section>':'')+
   '<div class="member-actions">'+
   '<button class="btn small" data-reset-user="'+esc(u.id)+'" '+(owner?'disabled':'')+'>Passwort zurücksetzen</button>'+
   '<button class="btn small '+(u.active?'danger':'primary')+'" data-active-user="'+esc(u.id)+'" data-active-value="'+(!u.active)+'" '+(owner?'disabled':'')+'>'+
   (u.active?'Zugriff sperren':'Zugriff erlauben')+'</button>'+
   '<button class="btn small danger" data-delete-user="'+esc(u.id)+'" '+(owner?'disabled':'')+'>Löschen</button></div>'+(s.isOwner&&!u.is_owner?'<div class="admin-role-select"><label class="form-label">Teamrolle</label><select class="select" data-admin-role="'+esc(u.id)+'" aria-label="Teamrolle von '+esc(u.username||'')+'"><option value="student" '+(u.role==='student'?'selected':'')+'>Mitglied</option><option value="admin" '+(u.role==='admin'?'selected':'')+'>Administrator · Team verwalten</option></select></div>':'')+'</div></details>';
 }).join('');
 const tab=['members','support','vouchers','registration','self'].includes(parseRoute().id)?parseRoute().id:'overview';
 const tabs='<nav class="ll-admin-tabs" aria-label="Administration">'+[
   ['overview','Übersicht'],['self','Mein Admin-Konto'],['support','Support & Chat'],['members','Mitglieder'],['registration','Registrierung'],['vouchers','Gutscheine']
 ].map(([key,label])=>'<button type="button" class="btn small '+(key===tab?'primary':'')+'" data-go="'+(key==='overview'?'admin':'admin/'+key)+'" aria-current="'+(key===tab?'page':'false')+'">'+label+'</button>').join('')+'</nav>';
 const summary='<section class="admin-overview"><article><span>◷</span><strong>'+pending.length+'</strong><small>Registrierungen</small></article>'+
 '<article><span>✉</span><strong>'+(s.service?.admin||[]).filter(t=>t.status==='open').length+'</strong><small>Offene Tickets</small></article>'+
 '<article><span>✓</span><strong>'+active+'</strong><small>Aktive Konten</small></article>'+
 '<article><span>✦</span><strong>'+people.filter(u=>u.role==='admin').length+'</strong><small>Administratoren</small></article></section>';
 const hub='<div class="ll-admin-hub">'+[
  ['admin/self','✦','Mein Admin-Konto','XP, Daily Streak, eigenes Abo und Änderungsverlauf'],
  ['admin/support','✉','Support & Nachrichten','Alle Anfragen und Gespräche mit Mitgliedern'],
  ['admin/members','◉','Mitgliederverwaltung','Nutzer, Tarife, Rollen und Anträge'],
  ['admin/registration','◎','Registrierungsmodus','Frei anmelden oder Bewerbungspflicht'],
  ['admin/vouchers','%','Gutscheine & Shop','Gutscheincodes und Shopaktionen']
 ].map(([path,icon,title,subtitle])=>
  '<button type="button" class="ll-admin-hub-card" data-go="'+path+'"><span>'+icon+'</span><strong>'+title+'</strong><small>'+subtitle+'</small><b>Öffnen →</b></button>'
 ).join('')+'</div>';
 return pageHeading('ADMINISTRATION','Dein <span class="gradient">Control Center.</span>',
 'Support, Mitglieder, Shop und deine eigenen XP, Daily Streak und Mitgliedschaft übersichtlich verwalten.')+
 neonBanner('Admin-Dashboard','Hier steuerst du echte Registrierungen, Mitglieder, Tarife und Supportanfragen – ohne erfundene Statistiken.','settings')+tabs+
 (tab==='overview'?atelierAdminPulse(people,pending)+summary+hub:tab==='self'?adminSelfSection():tab==='support'?supportAdminSection():tab==='registration'?adminRegistrationSection(pending.length):tab==='members'?requests+
 '<section class="section"><div class="section-heading"><div><span class="eyebrow">[ 02 ] MITGLIEDER</span>'+
 '<h2>Deine Teamkonten</h2><p>Tarifänderungen werden sicher gespeichert. Den persönlichen Admin-Tarif kannst du unter „Mein Admin-Konto“ ändern.</p></div></div>'+
 '<div class="admin-tools"><input class="input" id="admin-search" type="search" placeholder="Benutzername oder E-Mail suchen …" value="'+esc(s.adminSearch)+'"><div class="admin-filter" role="group" aria-label="Konten filtern">'+[['all','Alle'],['active','Aktiv'],['blocked','Gesperrt'],['admin','Admins']].map(([value,label])=>'<button type="button" class="'+(s.adminFilter===value?'active':'')+'" data-admin-filter="'+value+'">'+label+'</button>').join('')+'</div></div>'+
 '<div id="admin-learner-progress">'+(s.adminProgressBusy?'<section class="ll-admin-progress-panel"><div class="spinner"></div><p>Lernfortschritt wird geschützt geladen …</p></section>':adminStudentProgressPanel())+'</div>'+
 '<div class="member-list">'+(cards||'<div class="empty">Keine passenden Mitglieder gefunden.</div>')+'</div>'+
 '<div class="admin-pagination"><button class="btn small" data-action="admin-prev" '+(s.adminPage===1?'disabled':'')+'>← Vorherige</button>'+
 '<span>Seite '+s.adminPage+'</span><button class="btn small" data-action="admin-next" '+(people.length<100?'disabled':'')+'>Nächste →</button></div></section>'+
 '<section class="section"><details class="panel admin-create"><summary><strong>+ Manuell ein Teamkonto erstellen</strong></summary>'+
 '<p>Optional: Erstelle selbst ein Konto. Teamkonten werden direkt freigegeben und müssen ihr vorläufiges Passwort ändern.</p>'+
 '<form data-form="create-email"><h3>Mit E-Mail-Adresse</h3><div class="form-row">'+
 '<div class="form-group"><label class="form-label">E-Mail-Adresse</label><input class="input" type="email" name="email" required placeholder="name@beispiel.de"></div>'+
 '<div class="form-group"><label class="form-label">Anzeigename</label><input class="input" name="display_name" maxlength="40" placeholder="Optional"></div>'+
 '<div class="form-group"><label class="form-label">Vorläufiges Passwort</label><input class="input" type="password" name="password" minlength="14" required autocomplete="new-password"></div>'+
 '<div class="form-group"><label class="form-label">Tarif</label><select class="select" name="tier"><option value="free">Free</option><option value="pro">Plus</option><option value="ultimate">Ultimate</option><option value="max">Max</option></select></div></div>'+
 '<button class="btn primary" type="submit">Teamkonto mit E-Mail erstellen →</button></form>'+
 '<div class="divider-form"></div><form data-form="create-user"><h3>Mit Benutzername</h3><div class="form-row">'+
 '<div class="form-group"><label class="form-label">Benutzername</label><input class="input" name="username" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" required maxlength="24"></div>'+
 '<div class="form-group"><label class="form-label">Vorläufiges Passwort</label><input class="input" type="password" name="password" minlength="14" required autocomplete="new-password"></div>'+
 '<div class="form-group"><label class="form-label">Tarif</label><select class="select" name="tier"><option value="free">Free</option><option value="pro">Plus</option><option value="ultimate">Ultimate</option><option value="max">Max</option></select></div></div>'+
 '<button class="btn primary" type="submit">Benutzerkonto erstellen →</button></form></details></section>'+
 '':
 (s.shopEnabled?shopDiscountAdminSection():'')+voucherAdminSection());

}

async function refreshAdminSelf(){
 if(s.profile?.role!=='admin')throw Error('Nur für Administratoren');
 const result=await api.rpc('academy_admin_self',{p_action:'status',p_payload:{}});
 if(result.error)throw result.error;
 if(!result.data?.ok)throw Error('Eigene Admin-Daten konnten nicht geladen werden.');
 s.adminSelf=result.data;s.adminSelfError='';
 s.planExpires=result.data.plan_expires_at||null;
 if(['free','pro','ultimate','max'].includes(result.data.tier))s.tier=result.data.tier;
 if(result.data.streak)s.loginStreak=result.data.streak;
 return result.data;
}
async function changeAdminSelf(action,payload,message){
 if(s.profile?.role!=='admin'||s.adminSelfBusy)throw Error('Administrationsaktion nicht erlaubt oder läuft bereits.');
 s.adminSelfBusy=true;
 try{
  const result=await api.rpc('academy_admin_self',{p_action:action,p_payload:payload});
  if(result.error)throw result.error;
  if(!result.data?.ok)throw Error('Server konnte die Änderung nicht bestätigen.');
  s.adminSelf=result.data;s.adminSelfError='';
  s.planExpires=result.data.plan_expires_at||null;
  if(result.data.streak)s.loginStreak=result.data.streak;
  if(['free','pro','ultimate','max'].includes(result.data.tier))s.tier=result.data.tier;
  if(action==='set_plan'){
   const all=await Promise.allSettled([api.rpc('academy_voucher_status'),api.rpc('academy_exam_status'),api.rpc('academy_entitled_courses')]);
   const data=all.map(x=>x.status==='fulfilled'&&!x.value.error?x.value.data:null);
   if(data[0])s.daily=data[0];
   if(data[1])s.examStatus=data[1];
   if(data[2])s.entitledCourses=data[2];
  }
  render();notice(message||'Änderungen dauerhaft gespeichert.');return result.data;
 }finally{s.adminSelfBusy=false;}
}

async function fetchMembers(){
 if(s.profile?.role!=='admin')return;
 var data=await adminCall({action:'list',page:s.adminPage});s.members=data.users||[];s.isOwner=!!data.isOwner;
 s.memberPlans={};s.memberExpiry={};
 for(const member of s.members){s.memberPlans[member.id]=member.plan_tier||'free';s.memberExpiry[member.id]=member.plan_expires_at||null;}
 updateMembershipClocks();
}
async function updateTier(uid,tier){
 if(s.profile?.role!=='admin'||!['free','pro','ultimate','max'].includes(tier))throw Error('Tarifwechsel nicht erlaubt.');
 const result=await adminCall({action:'setTier',userId:uid,tier});
 if(!result.ok)throw Error(result.error||'Tarif konnte nicht geändert werden.');
 s.memberPlans[uid]=tier;await fetchMembers();render();notice('Mitgliedschaft auf '+(plans[tier]||tier)+' geändert.');
}
async function adminAction(action,node){
 try{
  if(action==='refresh-admin'){await Promise.all([fetchMembers(),fetchVouchers(),fetchRegistrationPolicy(true)]);render();return;}
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
var focusEnd=0,focusInterval=null,focusSeconds=1500,focusTotalSeconds=1500,focusRunning=false,focusUsed=true;
const timerStorageKey='liverylab-focus-v40';
try{
 const stored=JSON.parse(localStorage.getItem(timerStorageKey)||sessionStorage.getItem('liverylab-focus-v30')||'{}');
 if(Number.isFinite(stored.seconds)&&stored.seconds>=0&&stored.seconds<=14400)focusSeconds=Math.ceil(stored.seconds);
 if(Number.isFinite(stored.total)&&stored.total>=60&&stored.total<=14400)focusTotalSeconds=Math.ceil(stored.total);
 else focusTotalSeconds=Math.max(60,focusSeconds);
 if(Number.isFinite(stored.end)&&stored.end>0){
  focusEnd=stored.end;
  focusSeconds=Math.max(0,Math.ceil((focusEnd-Date.now())/1000));
  if(focusSeconds>0)focusRunning=true;
 }
 if(focusRunning)focusInterval=setInterval(tickTimer,1000);
}catch(_){}
function saveTimer(){
 try{localStorage.setItem(timerStorageKey,JSON.stringify({seconds:focusSeconds,total:focusTotalSeconds,end:focusRunning?focusEnd:0,used:true}));}catch(_){}
}
function timerLabel(){
 const seconds=Math.max(0,Math.floor(Number(focusSeconds)||0));
 return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}
function paintTimer(){
 if(focusRunning){
  focusSeconds=Math.max(0,Math.ceil((focusEnd-Date.now())/1000));
  if(focusSeconds===0){focusRunning=false;clearInterval(focusInterval);focusInterval=null;saveTimer();}
 }
 const label=timerLabel(),clock=$('#focus-clock'),header=$('#focus-header');
 if(clock)clock.textContent=label;
 if(header){
  header.hidden=false;
  header.textContent=(focusRunning?'◷ ':'◷ ')+label;
  if(typeof header.setAttribute==='function')header.setAttribute('aria-label','Fokus-Timer: '+label+' verbleibend, '+(focusRunning?'läuft':'pausiert')+'. Zum Einstellen öffnen.');
  header.title='Fokus-Timer öffnen · '+label;
  header.classList.toggle('is-running',focusRunning);
 }
 const btn=$('[data-timer-toggle]');if(btn)btn.textContent=focusRunning?'⏸ Pausieren':'▶ Starten';
 const dialog=$('#timer-portal .timer-dialog');
 if(dialog&&typeof dialog.querySelector==='function'){
  const time=dialog.querySelector('[data-timer-time]');if(time)time.textContent=label;
  const toggle=dialog.querySelector('[data-timer-toggle]');if(toggle)toggle.textContent=focusRunning?'Pause':'Starten';
  const info=dialog.querySelector('[data-timer-state]');if(info)info.textContent=focusRunning?'Deine Lernzeit läuft. Der Countdown bleibt beim Seitenwechsel aktiv.':'Timer bereit. Wähle eine Zeit und starte deine Lernsession.';
  const ring=dialog.querySelector('[data-timer-ring]');if(ring&&ring.style?.setProperty)ring.style.setProperty('--focus-progress',Math.min(100,Math.max(0,Math.round((1-focusSeconds/Math.max(1,focusTotalSeconds))*100)))+'%');
 }
}
function tickTimer(){
 if(!focusRunning)return;
 const before=focusSeconds;
 focusSeconds=Math.max(0,Math.ceil((focusEnd-Date.now())/1000));
 if(focusSeconds===0){focusRunning=false;clearInterval(focusInterval);focusInterval=null;saveTimer();if(before>0)notice('Fokuszeit geschafft!');}
 paintTimer();
}
function toggleFocusTimer(){
 focusUsed=true;
 if(focusRunning){focusSeconds=Math.max(0,Math.ceil((focusEnd-Date.now())/1000));focusRunning=false;clearInterval(focusInterval);focusInterval=null;}
 else{if(!focusSeconds)focusSeconds=1500;focusEnd=Date.now()+focusSeconds*1000;focusRunning=true;clearInterval(focusInterval);focusInterval=setInterval(tickTimer,1000);}
 saveTimer();paintTimer();
}
function closeTimer(){
 const portal=$('#timer-portal');
 if(portal)portal.replaceChildren();
 if(document.body?.classList)document.body.classList.remove('focus-modal-visible');
 paintTimer();
}
function openTimer(){
 const portal=$('#timer-portal');if(!portal)return;
 paintTimer();
 const elapsed=Math.min(100,Math.max(0,Math.round((1-focusSeconds/Math.max(1,focusTotalSeconds))*100)));
 portal.innerHTML='<div class="timer-backdrop ll-focus-backdrop" data-timer-close></div>'+
 '<section class="timer-dialog ll-focus-modal" role="dialog" aria-modal="true" aria-labelledby="focus-modal-title">'+
 '<button type="button" class="ll-focus-close" data-timer-close aria-label="Fokus-Timer schließen">×</button>'+
 '<div class="ll-focus-emblem" aria-hidden="true">◷</div>'+
 '<span class="eyebrow ll-focus-kicker">NOVALAB · DEIN LERNMODUS</span>'+
 '<h2 class="ll-focus-title" id="focus-modal-title">Deine <span class="gradient">Fokuszeit.</span></h2>'+
 '<p class="ll-focus-lede">Konzentriert lernen, Schritt für Schritt. Deine Zeit bleibt auch beim Seitenwechsel erhalten.</p>'+
 '<div class="ll-focus-ring" data-timer-ring style="--focus-progress:'+elapsed+'%">'+
 '<div class="ll-focus-ring-inner"><span aria-hidden="true">✦</span><strong data-timer-time>'+timerLabel()+'</strong><small>VERBLEIBENDE ZEIT</small></div></div>'+
 '<div class="ll-focus-presets" role="group" aria-label="Schnelle Zeitwahl">'+
 [15,25,45,60].map(minutes=>'<button type="button" data-timer-preset="'+minutes+'" aria-label="Fokuszeit '+minutes+' Minuten einstellen">'+minutes+' Min</button>').join('')+'</div>'+
 '<label class="ll-focus-duration" for="timer-minutes"><span>Eigene Dauer</span><span class="ll-focus-input-row">'+
 '<input class="input" id="timer-minutes" type="number" inputmode="numeric" min="1" max="240" step="1" value="'+Math.max(1,Math.ceil(focusSeconds/60))+'"><span>Minuten</span></span></label>'+
 '<div class="timer-actions ll-focus-actions">'+
 '<button class="btn primary" type="button" data-timer-toggle>'+(focusRunning?'⏸ Pausieren':'▶ Starten')+'</button>'+
 '<button class="btn" type="button" data-timer-set>Zeit einstellen</button></div>'+
 '<div class="ll-focus-state" data-timer-state>'+(focusRunning?'Deine Lernzeit läuft. Der Countdown bleibt beim Seitenwechsel aktiv.':'Timer bereit. Wähle eine Zeit und starte deine Lernsession.')+'</div>'+
 '<button class="ll-focus-reset" type="button" data-timer-reset>↻ Zurücksetzen auf 25 Minuten</button></section>';
 if(document.body?.classList)document.body.classList.add('focus-modal-visible');
 paintTimer();
 const input=$('#timer-minutes');if(input&&typeof input.focus==='function')input.focus({preventScroll:true});
}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')tickTimer();});
window.addEventListener('focus',function(){tickTimer();});
// Light polling keeps both ticket inboxes current without changing the page
// while somebody is typing. Only active, visible support pages are polled.
function supportEditorHasDraft(){return [...document.querySelectorAll('form[data-form="ticket-chat"] textarea,form[data-form="support-ticket"] textarea,form[data-form="support-reply"] textarea')].some(field=>!!field.value?.trim());}
async function pollSupportInbox(){
 if(!s.ready||document.hidden)return;
 const route=parseRoute();
 if(route.page!=='support'&&!(route.page==='admin'&&route.id==='support'))return;
 if(s.supportBusy||s.chatBusy)return;
 try{
  await refreshService();
  if(s.chatTicketId)await loadTicketThread(s.chatTicketId);
  const focused=document.activeElement;
  if(!supportEditorHasDraft()&&!focused?.closest?.('form[data-form="ticket-chat"],form[data-form="support-ticket"],form[data-form="support-reply"]'))render();
 }catch(error){if(s.ready){s.serviceError=formatError(error);
   const focused=document.activeElement;
   if(!supportEditorHasDraft()&&!focused?.closest?.('form[data-form="ticket-chat"],form[data-form="support-ticket"],form[data-form="support-reply"]'))render();
  }}
}
if(typeof setInterval==='function')setInterval(pollSupportInbox,20000);
function filterSupportTickets(){const query=String($('#support-search')?.value||'').toLocaleLowerCase('de'),status=$('#support-filter')?.value||'all';document.querySelectorAll('.support-history .support-ticket').forEach(el=>{el.hidden=!!query&&!el.textContent.toLocaleLowerCase('de').includes(query)||status!=='all'&&el.dataset.ticketStatus!==status;});}
document.addEventListener('click',async function(e){
 if(e.target.closest('[data-toggle-shop]')){if(s.profile?.role!=='admin')return;const btn=e.target.closest('[data-toggle-shop]');btn.disabled=true;const result=await api.rpc('novalab_set_shop_enabled',{p_enabled:!s.shopEnabled});if(result.error){notice('Shop konnte nicht geändert werden: '+formatError(result.error));btn.disabled=false;return;}s.shopEnabled=result.data===true;document.body.classList.toggle('novalab-shop-hidden',!s.shopEnabled);render();notice(s.shopEnabled?'Shop ist für alle sichtbar.':'Shop ist für alle ausgeblendet.');return;}
 if(e.target.closest('[data-lang]')&&parseRoute().page==='courses'){Promise.resolve().then(render);return;}
 if(e.target.closest('[data-timer-open]')){openTimer();return;}
 if(e.target.closest('[data-timer-close]')){closeTimer();return;}
 if(e.target.closest('[data-timer-set]')){const minutes=Number($('#timer-minutes')?.value);if(!Number.isInteger(minutes)||minutes<1||minutes>240){notice('Bitte 1 bis 240 Minuten wählen.');return;}focusSeconds=minutes*60;focusTotalSeconds=focusSeconds;if(focusRunning)focusEnd=Date.now()+focusSeconds*1000;saveTimer();paintTimer();notice('Fokuszeit auf '+minutes+' Minuten eingestellt.');return;}
 if(e.target.closest('[data-timer-preset]')){const value=Number(e.target.closest('[data-timer-preset]').dataset.timerPreset);if(![15,25,45,60].includes(value))return;focusSeconds=value*60;focusTotalSeconds=focusSeconds;if(focusRunning)focusEnd=Date.now()+focusSeconds*1000;saveTimer();paintTimer();const input=$('#timer-minutes');if(input)input.value=String(value);notice('Fokuszeit: '+value+' Minuten.');return;}
 if(e.target.closest('[data-timer-reset]')){focusRunning=false;clearInterval(focusInterval);focusInterval=null;focusSeconds=1500;focusTotalSeconds=1500;saveTimer();paintTimer();const field=$('#timer-minutes');if(field)field.value='25';return;}
 var streakRetry=e.target.closest('[data-streak-retry]');
 if(streakRetry){try{await refreshStreakStatus();}catch(_e){}paintStreakModal();return;}
 var streakOpen=e.target.closest('[data-streak-open]');
 if(streakOpen){s.streakModalOpen=true;paintStreakModal();if(!s.loginStreak&&!s.streakLoading)void refreshStreakStatus().catch(()=>{}).finally(paintStreakModal);return;}
 var streakClose=e.target.closest('[data-streak-close]');
 if(streakClose){s.streakModalOpen=false;paintStreakModal();return;}
 var streakClaim=e.target.closest('[data-streak-claim]');
 if(streakClaim){await claimDailyStreak();return;}
 var goTarget=e.target.closest('[data-go]');
 if(goTarget){e.preventDefault();go(goTarget.dataset.go);return;}
 var mark=e.target.closest('[data-bookmark-course]');if(mark){toggleBookmark(mark.dataset.bookmarkCourse);render();return;}
 var pin=e.target.closest('[data-pin-course]');if(pin){setChoicePreference(pinKey(),getChoicePreference(pinKey(),'')===pin.dataset.pinCourse?'':pin.dataset.pinCourse);render();return;}
 var template=e.target.closest('[data-reply-template]');if(template){const area=template.closest('.admin-ticket')?.querySelector('textarea[name="reply"]');if(area){area.value=template.dataset.replyTemplate;area.focus()}return;}
 if(e.target.closest('[data-timer-toggle]')){toggleFocusTimer();return;}
 if(e.target.id==='nav-backdrop'||e.target.closest('[data-nav-close]')){sidebar.classList.remove('open');syncBackdrop();return;}
 if(e.target.id==='menu-toggle'){sidebar.classList.toggle('open');syncBackdrop();return;}
 var socialRemove=e.target.closest('[data-social-remove]');
 if(socialRemove){if(!confirm('Dieses Profilbild / Banner wirklich entfernen?'))return;try{await removeSocialImage(socialRemove.dataset.socialRemove);render();notice('Bild entfernt.');}catch(err){notice('Bild: '+formatError(err))}return;}
 var friendTab=e.target.closest('[data-friend-tab]');
 if(friendTab){s.friendTab=friendTab.dataset.friendTab;render();return;}
 var focusBtn=e.target.closest('[data-focus-course]');
 if(focusBtn){if(courseOf(focusBtn.dataset.focusCourse)){setChoicePreference('focus',focusBtn.dataset.focusCourse);render()}return;}
 const chatOpen=e.target.closest('[data-chat-open]');
 if(chatOpen){
  const id=chatOpen.dataset.chatOpen;
  if(!/^[0-9a-f-]{36}$/i.test(id))return;
  chatOpen.disabled=true;
  try{
   await loadTicketThread(id);render();
   const panel=$('#academy-chat-panel');
   if(panel?.scrollIntoView)panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }catch(error){notice('Chat konnte nicht geöffnet werden: '+formatError(error));chatOpen.disabled=false;}
  return;
 }
 if(e.target.closest('[data-chat-close]')){
  s.chatTicketId=null;s.chatMessages=[];render();return;
 }
 if(s.profile?.role==='admin'){
  const progressOpen=e.target.closest('[data-view-progress]');
  if(progressOpen){await loadAdminStudentProgress(progressOpen.dataset.viewProgress);return;}
  if(e.target.closest('[data-close-admin-progress]')){
   s.adminLearner=null;s.adminProgressSearch='';s.adminProgressFilter='all';render();return;
  }
  if(e.target.closest('[data-registration-refresh]')){
   try{await fetchRegistrationPolicy(true);render();notice('Registrierungsmodus aktualisiert.');}
   catch(err){notice('Registrierung: '+formatError(err));render();}
   return;
  }
  const policyButton=e.target.closest('[data-registration-mode]');
  if(policyButton){
   const mode=policyButton.dataset.registrationMode;
   if(!s.isOwner||s.registrationPolicy?.loaded!==true||!['open','approval'].includes(mode))return;
   if(mode===s.registrationPolicy.mode)return;
   const promptText=mode==='open'
    ?'Freie Registrierung einschalten? Neue Konten können dann ohne Einzelprüfung sofort die Free-Kurse nutzen. Die E-Mail-Adresse wird im aktuellen Anmeldeweg nicht automatisch verifiziert.'
    :'Bewerbungspflicht einschalten? Ab jetzt müssen alle neuen Konten erst von einem Administrator angenommen werden. Bereits freigegebene Konten bleiben aktiv.';
   if(!confirm(promptText))return;
   policyButton.disabled=true;
   try{
    const result=await adminCall({action:'setRegistrationMode',mode});
    if(!result.ok||result.mode!==mode)throw Error('Registrierungsmodus wurde nicht bestätigt.');
    await fetchRegistrationPolicy(true);render();
    notice(mode==='open'?'Freie Registrierung ist jetzt aktiv.':'Bewerbungsmodus ist jetzt aktiv.');
   }catch(err){policyButton.disabled=false;notice('Registrierung: '+formatError(err));}
   return;
  }
 }
 var adminFilter=e.target.closest('[data-admin-filter]');
 if(adminFilter){s.adminFilter=adminFilter.dataset.adminFilter||'all';render();return;}
 if(e.target.closest('[data-plan-months]')){
  s.shopMonths=Number(e.target.closest('[data-plan-months]').dataset.planMonths)||1;render();return;
 }
 const planRequest=e.target.closest('[data-plan-request]');
 if(planRequest){
  const tier=planRequest.dataset.planRequest;
  if(!['pro','ultimate','max'].includes(tier))return;
  s.selectedPlan=tier;s.selectedMonths=s.shopMonths;go('support');return;
 }
 if(e.target.closest('[data-action="refresh-support"]')){try{await refreshService();render();notice('Support-Posteingang aktualisiert.');}catch(err){render();notice('Support: '+formatError(err))}return;}
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

  if(name==='admin-self-refresh'){
   try{await refreshAdminSelf();render();notice('Deine Admin-Werte wurden neu geladen.');}
   catch(error){s.adminSelfError=formatError(error);render();notice('Admin-Konto: '+formatError(error));}
   return;
  }
  if(name==='admin-self-max'){
   if(!confirm('Dein eigenes Konto wieder dauerhaft auf Max setzen?'))return;
   try{await changeAdminSelf('set_plan',{tier:'max',months:0},'Max wurde für dein Admin-Konto dauerhaft aktiviert.');}
   catch(error){notice('Admin-Konto: '+formatError(error));}
   return;
  }
  if(name==='admin-self-xp-add'){
   const amount=Number(action.dataset.amount);
   const current=xpEarned();
   if(!Number.isSafeInteger(amount)||!Number.isSafeInteger(current))return;
   try{await changeAdminSelf('set_xp',{xp:Math.max(0,Math.min(10000000,current+amount))},'Deine XP wurden angepasst.');}
   catch(error){notice('XP: '+formatError(error));}
   return;
  }
  if(name==='admin-self-streak-add'){
   const amount=Number(action.dataset.amount);
   const current=Number((s.loginStreak||s.adminSelf?.streak)?.current);
   const best=Number((s.loginStreak||s.adminSelf?.streak)?.best);
   if(!Number.isSafeInteger(amount)||!Number.isSafeInteger(current)||!Number.isSafeInteger(best))return;
   const next=Math.max(0,Math.min(5000,current+amount));
   try{await changeAdminSelf('set_streak',{current:next,best:Math.max(next,best)},'Deine Streak wurde angepasst.');}
   catch(error){notice('Streak: '+formatError(error));}
   return;
  }
  if(name==='logout'){await logout();return;}
  if(name==='show-register'){s.authScreen='register';login();void fetchRegistrationPolicy(false).catch(()=>{});return;}
  if(name==='show-login'){s.authScreen='login';login();return;}
  if(name==='retry-access'){await boot();return;}
  if(name==='more-courses'){
   s.catalogLimit=Math.min(filteredCourses().length,s.catalogLimit+9);
   var wrap=$('#catalog-container');if(wrap)wrap.innerHTML=catalogItems();return;
  }
  if(name==='complete-practice'){await completePractice();return;}
  if(name==='retry-lesson-xp'){
   const id=parseRoute().id;
   if(!doneIds().has(id)||s.xpClaimBusy)return;
   s.xpClaimBusy=true;
   try{const award=await grantLessonXP(id);notice(award.awarded?'30 XP für diese Lektion gutgeschrieben.':'30 XP für diese Lektion waren bereits gespeichert.');render();}
   catch(error){notice('XP-Prüfung fehlgeschlagen: '+formatError(error));}
   finally{s.xpClaimBusy=false;}
   return;
  }
  if(name==='reset-lesson'){
   const id=parseRoute().id;if(!id||!s.lessons.some(l=>l.id===id))return;
   if(!confirm('Nur diese Lektion neu beginnen? Ihr Abschluss und die Übung werden zurückgesetzt.'))return;
   const previous=JSON.parse(JSON.stringify(s.progress));
   for(const key of ['done','watched','practiced','verifiedPractice'])s.progress[key]=(s.progress[key]||[]).filter(x=>x!==id);
   if(s.progress.completedAt)delete s.progress.completedAt[id];
   if(s.progress.quizProgress)delete s.progress.quizProgress[id];s.quizAnswers=[];
   try{localStorage.removeItem(lessonLocalKey('part',id));localStorage.removeItem(lessonLocalKey('quiz',id));}catch(_){}
   try{await saveProgress();if(window.LLLearning)await window.LLLearning.remove(id);localStorage.removeItem(lessonLocalKey('draft',id));s.draft='';s.lessonStep=1;await navigateCurrent();notice('Diese Lektion wurde neu gestartet.');}
   catch(e){s.progress=previous;notice('Neustart konnte nicht gespeichert werden: '+formatError(e));}return;
  }
  if(name==='show-hint'||name==='show-solution'){
   const p=s.lesson?.payload||{},box=$('#practice-input');if(!box)return;
   if(name==='show-hint'){
    s.hintStage=(s.hintStage||0)%3+1;
    const points=Array.isArray(p.keyPoints)?p.keyPoints:[],steps=Array.isArray(p.steps)?p.steps.filter(x=>typeof x==='string'):[];
    const tips=[
     String(p.hint||points[0]||'Lies noch einmal das Lernziel.'),
     String(points[0]||steps[0]||p.hint||'Sieh dir das erste Beispiel an.'),
     String(p.mistake||steps[1]||points[1]||'Vergleiche deine Lösung mit der Erklärung.')
    ];
    showPracticeResult(false,'Tipp '+s.hintStage+'/3: '+tips[s.hintStage-1],'tip');return;
   }
   showPracticeResult(false,'Musterlösung:\n'+String(p.solution||p.example||'Noch keine Lösung hinterlegt.')+
    '\n\nErklärung: '+String(p.theory||p.goal||'Vergleiche die Aufgabe und die verwendeten Konzepte.'),'tip');
   return;
  }
  if(name==='reset-appearance'){
    for(const key of ['compact','motion','largeTypography','contrast','softCorners','backgroundArt','animatedBackdrop','buttonEffects','uiSounds'])
     try{localStorage.removeItem('liverylab-pref-'+key);}catch(_){}
    for(const key of ['theme','accent','soundVolume'])
     try{localStorage.removeItem('liverylab-choice-'+key);}catch(_){}
    applyPreferences();render();notice('Standarddesign wiederhergestellt.');return;
  }
  if(name==='reset-progress'){
   if(!confirm('Lernabschlüsse und Prüfungsergebnisse zurücksetzen? Bereits verdiente XP bleiben dauerhaft erhalten und können nicht erneut verdient werden.'))return;
   var before=s.progress;
   s.progress={done:[],watched:[],practiced:[],exams:{}};
   try{
    await saveProgress();
    for(const lesson of s.lessons){const id=lesson.id;
      for(const kind of ['draft','quiz','part'])try{localStorage.removeItem(lessonLocalKey(kind,id));}catch(_){}
      try{localStorage.removeItem('liverylab-draft-'+id);}catch(_){}
      try{await window.LLLearning?.remove?.(id);}catch(_){}
     }
     s.draft='';s.quizPassed=false;s.quizStep=0;s.quizAnswers=[];s.practiceChecked=false;
    notice('Dein Kursfortschritt wurde zurückgesetzt. Bereits verdiente XP bleiben erhalten.');render();
   }catch(err){s.progress=before;notice('Zurücksetzen fehlgeschlagen: '+formatError(err))}
   return;
  }
  if(['refresh-admin','admin-prev','admin-next'].includes(name)){await adminAction(name,action);return;}
  if(name==='load-video'){
   var video=s.lesson?.video_id||s.lesson?.payload?.videoId;if(!/^[a-zA-Z0-9_-]{11}$/.test(String(video||'')))return;
   var frame=$('#video-frame');
   if(frame){var iframe=document.createElement('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+video+'?rel=0&start='+Math.max(0,safeNumber(s.lesson.video_start??s.lesson?.payload?.videoStart));
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
  if(name==='download-project'){
   if(!s.projectSource||!projectUnblocked(PROJECT_FILES[s.projectTab]).length){notice('Noch kein Code freigeschaltet.');return;}
   const file=PROJECT_FILES[s.projectTab],blob=new Blob([s.projectSource],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download=file.name.replaceAll('/','-');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);notice('Datei heruntergeladen.');return;
  }
  if(name==='restart-exam'){await loadExam(parseRoute().id);render();return;}
 }

 var pt=e.target.closest('[data-project-tab]');
 if(pt){
  const index=Number(pt.dataset.projectTab);
  if(Number.isInteger(index)&&index>=0&&index<PROJECT_FILES.length){s.projectTab=index;await loadProjectTab();render();}
  return;
 }
 var part=e.target.closest('[data-lesson-part]');if(part&&parseRoute().page==='lesson'&&s.lesson){
  const index=Number(part.dataset.lessonPart),parts=window.LLCurriculum?.parts(s.lesson.payload||{})||[];
  if(Number.isInteger(index)&&index>=0&&index<parts.length){
   s.sectionIndex=index;
   const node=$('#lesson-explanation');if(node)node.innerHTML='<span class="eyebrow">SCHRITT 01 · VERSTEHEN</span>'+window.LLCurriculum.render(s.lesson.payload,index,esc,safeLink);
   try{localStorage.setItem(lessonLocalKey('part',parseRoute().id),String(index));}catch(_){}
   if(node?.scrollIntoView)node.scrollIntoView({block:'start',behavior:'smooth'});
  }
  return;
 }
 var answer=e.target.closest('[data-answer]');if(answer){const qs=quizQuestions(s.lesson?.payload||{}),q=qs[s.quizStep];if(!q||s.quizPassed)return;s.choice=Number(answer.dataset.answer);
 if(s.choice===q.correct){
  if(!Array.isArray(s.quizAnswers))s.quizAnswers=[];
  s.quizAnswers[s.quizStep]=s.choice;
  if(s.quizStep===qs.length-1){s.quizPassed=true;window.LLLearning?.mark?.(parseRoute().id,4);notice('Alle '+qs.length+' Fragen richtig beantwortet!');updateLessonControls();}
  else{s.quizStep++;s.choice=null;paintQuiz();notice('Richtig! Jetzt Frage '+(s.quizStep+1)+' von '+qs.length+'.');}
  saveQuizLocal(parseRoute().id,{step:s.quizStep,total:qs.length,version:Number(s.lesson?.payload?.quiz_version||1),passed:s.quizPassed,answers:[...s.quizAnswers]});
 }else{updateLessonControls();}
 return;}
 var exam=e.target.closest('[data-exam-answer]');if(exam){await submitExamAnswer(Number(exam.dataset.examAnswer));return;}
 var difficultyTile=e.target.closest('[data-difficulty-filter]');
 if(difficultyTile){
  const value=difficultyTile.dataset.difficultyFilter,level=Number(value);
  if(value!=='all'&&(!Number.isInteger(level)||level<1||level>5))return;
  s.difficultyFilter=value==='all'?'all':(s.difficultyFilter===level?'all':level);
  s.catalogLimit=9;render();return;
 }
 if(e.target.closest('[data-course-filter-reset]')){
  s.search='';s.filter='Alle';s.difficultyFilter='all';s.catalogLimit=9;render();return;
 }
 var filter=e.target.closest('[data-filter]');if(filter){s.filter=filter.dataset.filter;s.catalogLimit=9;render();return;}
 var examFilter=e.target.closest('[data-exam-filter]');if(examFilter){s.examFilter=examFilter.dataset.examFilter;render();return;}

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
  const control=e.target.closest('[data-plan-action]');
  if(control){
   const userId=control.dataset.planUser,mode=control.dataset.planAction;
   const member=s.members.find(u=>u.id===userId);
   if(!member||member.role!=='student'||!['extend','reduce','set','end'].includes(mode))return;
   const form=control.closest('.ll-plan-manager'),field=form?.querySelector('[data-plan-days]');
   const days=Number(field?.value);
   if(mode!=='end'&&(!Number.isInteger(days)||days<1||days>3650)){notice('Bitte eine ganze Zahl zwischen 1 und 3650 Tagen eingeben.');return;}
   const person=member.username||member.email||'Mitglied';
   const label={extend:'um '+days+' Tage verlängern',reduce:'um '+days+' Tage verkürzen',set:'auf '+days+' Tage festlegen',end:'sofort beenden'}[mode];
   if(!confirm('Abo von '+person+' wirklich '+label+'?'))return;
   control.disabled=true;
   try{
    const result=await adminCall({action:'adjustPlan',userId,operation:mode,...(mode==='end'?{}:{days})});
    if(!result.ok)throw Error(result.error||'Abo-Aktion wurde nicht bestätigt');
    await fetchMembers();render();notice('Laufzeit aktualisiert: '+person);
   }catch(err){notice('Abo-Verwaltung: '+formatError(err));if(control.isConnected)control.disabled=false;}
   return;
  }
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
  el.dispatchEvent(new Event('input',{bubbles:true}));return;
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
 if(e.key==='Escape'){if($('#timer-portal .timer-dialog'))closeTimer();if(s.streakModalOpen){s.streakModalOpen=false;paintStreakModal();}sidebar.classList.remove('open');syncBackdrop();}
});
document.addEventListener('input',function(e){
 if(e.target.id==='admin-progress-search'){
  s.adminProgressSearch=e.target.value;
  const list=$('#admin-progress-course-results');if(list)list.innerHTML=renderAdminCourseProgress();
  return;
 }
 if(e.target.id==='support-search'){filterSupportTickets();return;}
 if(e.target.id==='reference-search'){
  s.refSearch=e.target.value;const results=referenceResults();
  const container=$('#reference-results'),counter=$('#reference-count');
  if(container)container.innerHTML=results.html;
  if(counter)counter.textContent=results.count+' Treffer';
  return;
 }
 if(e.target.id==='admin-search'){
  s.adminSearch=e.target.value;
  const list=$('.member-list');
  if(list){const query=s.adminSearch.trim().toLocaleLowerCase('de');const matches=(s.members||[]).filter(u=>u.access_status!=='pending').filter(u=>(s.adminFilter==='all'||(s.adminFilter==='active'&&u.active)||(s.adminFilter==='blocked'&&!u.active)||(s.adminFilter==='admin'&&u.role==='admin'))&&(!query||String(u.username||'').toLocaleLowerCase('de').includes(query)||String(u.email||'').toLocaleLowerCase('de').includes(query)));
   list.querySelectorAll('.member-card').forEach(card=>{const id=card.querySelector('[data-admin-tier],[data-reset-user],[data-active-user]')?.dataset.adminTier||card.querySelector('[data-reset-user]')?.dataset.resetUser||card.querySelector('[data-active-user]')?.dataset.activeUser;card.hidden=!matches.some(u=>u.id===id);});
   let empty=list.querySelector('.admin-search-empty');if(!empty){empty=document.createElement('div');empty.className='empty admin-search-empty';empty.textContent='Keine passenden Mitglieder gefunden.';list.appendChild(empty)}empty.hidden=matches.length>0;
  }
  return;
 }
 if(e.target.id==='friend-list-search'){
  const query=e.target.value.trim().toLocaleLowerCase('de');
  document.querySelectorAll('.friends-tab-content .friend-profile-card').forEach(card=>{card.hidden=!String(card.dataset.friendName||'').toLocaleLowerCase('de').includes(query);});
  return;
 }
 if(e.target.id==='course-search'){
  s.search=e.target.value;s.catalogLimit=9;updateCatalogResults();return;
 }
 if(e.target.id==='practice-input'){
  s.draft=e.target.value;saveDraft(parseRoute().id,s.draft);window.LLLearning?.queue?.(parseRoute().id,s.draft,3);
  paintEditorLines();scheduleMarkupPreview();
  const live=$('#practice-feedback'),workspace=$('#practice-workspace');if(live){live.textContent='';live.hidden=true;live.classList.remove('error','is-success','is-error','is-tip');}if(workspace)workspace.classList.remove('practice-correct','practice-incorrect');
  if(s.practiceChecked){s.practiceChecked=false;s.progress.verifiedPractice=(s.progress.verifiedPractice||[]).filter(id=>id!==parseRoute().id);void saveProgress().catch(()=>{});const workspace=$('#practice-workspace');if(workspace)workspace.classList.remove('is-complete');updateLessonControls()}
  var status=$('#practice-status');if(status&&!s.practiceChecked)status.textContent='✓ Nur auf diesem Gerät gespeichert';
 }
});
document.addEventListener('scroll',function(e){if(e.target.id==='practice-input'){const gutter=$('#code-lines');if(gutter)gutter.scrollTop=e.target.scrollTop;}},true);
document.addEventListener('change',async function(e){
 if(e.target.id==='admin-progress-filter'){
  const value=e.target.value;
  s.adminProgressFilter=['all','started','finished'].includes(value)?value:'all';
  const list=$('#admin-progress-course-results');if(list)list.innerHTML=renderAdminCourseProgress();
  return;
 }
 if(e.target.id==='course-difficulty-select'){
  const value=e.target.value,level=Number(value);
  s.difficultyFilter=value==='all'?'all':(Number.isInteger(level)&&level>=1&&level<=5?level:'all');
  s.catalogLimit=9;render();return;
 }
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
  const all=frm.querySelector('.voucher-all-tier'),tier=frm.querySelector('select[name="tier"]');
  if(all)all.hidden=e.target.value!=='discount';
  if(tier&&e.target.value==='gift'&&tier.value==='all')tier.value='pro';
  return;
 }
 if(e.target.id==='support-category'){const field=e.target.closest('form')?.querySelector('.support-plan-field');if(field)field.hidden=e.target.value!=='plan';return;}
 if(e.target.id==='support-filter'){filterSupportTickets();return;}
 if(e.target.id==='study-goal'){setChoicePreference('goal-'+(s.user?.id||'guest'),e.target.value);notice('Tagesziel gespeichert.');return;}
 if(e.target.id==='weekly-goal'){setChoicePreference('weekly-goal-'+(s.user?.id||'guest'),e.target.value);render();notice('Wochenziel gespeichert.');return;}
 if(e.target.id==='beta-enabled'){
  const box=e.target;try{const r=await api.rpc('academy_service',{p_action:'set_beta',p_payload:{enabled:box.checked}});if(r.error)throw r.error;await refreshService();render();notice('Beta-Anfragen '+(box.checked?'aktiviert.':'geschlossen.'));}catch(err){box.checked=!box.checked;notice(formatError(err))}return;
 }

 if(e.target.id==='video-check'){
  window.LLLearning?.mark?.(parseRoute().id,2);
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

  if(mode==='admin-self-xp'){
   const xp=Number(fd.get('xp'));
   if(!Number.isSafeInteger(xp)||xp<0||xp>10000000)throw Error('XP müssen eine ganze Zahl zwischen 0 und 10.000.000 sein.');
   await changeAdminSelf('set_xp',{xp},'Dein XP-Stand wurde gespeichert.');return;
  }
  if(mode==='admin-self-streak'){
   const current=Number(fd.get('current')),best=Number(fd.get('best'));
   if(!Number.isInteger(current)||!Number.isInteger(best)||current<0||best<current||best>5000)
    throw Error('Gültige Streak-Werte: 0–5.000; der Rekord muss mindestens so groß wie aktuell sein.');
   await changeAdminSelf('set_streak',{current,best},'Deine Daily Streak wurde gespeichert.');return;
  }
  if(mode==='admin-self-plan'){
   const tier=String(fd.get('tier')),months=Number(fd.get('months'));
   if(!['free','pro','ultimate','max'].includes(tier)||![0,1,3,12].includes(months))
    throw Error('Bitte gültige Mitgliedschaft und Laufzeit wählen.');
   if(!confirm('Deine eigene Mitgliedschaft auf '+plans[tier]+' ('+(months===0?'dauerhaft':months+' Monate')+') ändern? Adminrechte bleiben bestehen.'))return;
   await changeAdminSelf('set_plan',{tier,months},'Deine eigene Mitgliedschaft wurde aktualisiert.');return;
  }
  if(mode==='shop-offer'){
   if(s.profile?.role!=='admin')throw Error('Nur Administratoren');
   const tier=String(fd.get('tier')),months=Number(fd.get('months')),percent=Number(fd.get('percent'));
   if(!['pro','ultimate','max'].includes(tier)||![1,3,12].includes(months)||!Number.isInteger(percent)||percent<0||percent>90)
    throw Error('Ungültige Shopaktion.');
   const response=await api.rpc('academy_shop_offers',{p_tier:tier,p_months:months,p_percent:percent});
   if(response.error)throw response.error;
   if(!Array.isArray(response.data))throw Error('Shopaktion nicht bestätigt.');
   s.shopOffers=response.data;render();notice('Rabatt gespeichert: '+plans[tier]+' · '+months+' Monate.');return;
  }
  if(mode==='shop-sale'){
   if(s.profile?.role!=='admin')throw Error('Nur Administratoren');const percent=Number(fd.get('percent'));
   if(!Number.isInteger(percent)||percent<0||percent>90)throw Error('Rabatt: 0 bis 90 Prozent.');
   const r=await api.rpc('academy_shop_discount',{p_percent:percent});if(r.error)throw r.error;
   s.shopDiscount=Number(r.data)||0;render();notice('Shoprabatt gespeichert.');return;
  }
  if(mode==='support-ticket'){
   const category=String(fd.get('category')),message=String(fd.get('message')||'').trim(),tier=category==='plan'?String(fd.get('tier')):null;
   const months=category==='plan'?Number(fd.get('months')||1):null;
   if(category==='plan'&&!s.shopEnabled)throw Error('Der Shop ist aktuell deaktiviert.');
   if(category==='plan'&&(!['pro','ultimate','max'].includes(tier)||![1,3,12].includes(months)))throw Error('Bitte gültigen Tarif und Laufzeit wählen.');
   if(message.length<10||message.length>2000)throw Error('Bitte 10 bis 2000 Zeichen schreiben.');
   if(s.supportBusy)return;
   s.supportBusy=true;button.textContent='Wird gesendet …';
   const status=$('#support-submit-status');if(status)status.textContent='Deine Nachricht wird gespeichert …';
   try{
    const r=await api.rpc('academy_service',{p_action:'create',p_payload:{category,message,tier,months}});
    if(r.error)throw r.error;
    if(r.data?.ok!==true||typeof r.data?.id!=='string')throw Error('Keine Bestätigung vom Server erhalten. Prüfe deinen Posteingang vor einem erneuten Versuch.');
    s.lastSupportReceipt=r.data.id;
    try{await refreshService();}
    catch(refreshError){
     if(!Array.isArray(s.service.mine))s.service.mine=[];
     s.service.mine.unshift({id:r.data.id,category,tier,term_months:months,message,status:'open',reply:null,created_at:new Date().toISOString()});
    }
    s.supportBusy=false;s.selectedPlan=null;render();notice('Anfrage erfolgreich gespeichert · Ticket '+r.data.id.slice(0,8));return;
   }finally{s.supportBusy=false;}
  }
  if(mode==='ticket-chat'){
   const id=form.dataset.ticketId,body=String(fd.get('body')||'').trim();
   if(id!==s.chatTicketId||!body||body.length>2000)throw Error('Bitte eine gültige Nachricht schreiben.');
   if(s.chatBusy)return;
   s.chatBusy=true;button.textContent='Wird gesendet …';
   try{
    const reply=await api.rpc('academy_ticket_chat',{p_action:'send',p_ticket:id,p_body:body});
    if(reply.error)throw reply.error;
    if(reply.data?.ok!==true||!reply.data.sent_id||!Array.isArray(reply.data.messages))throw Error('Nachricht wurde vom Server nicht bestätigt.');
    s.chatMessages=reply.data.messages;
    try{await refreshService();}catch(_){}
    render();notice('Nachricht gesendet und im Ticket gespeichert.');return;
   }finally{s.chatBusy=false;}
  }
  if(mode==='support-reply'){
   if(s.profile?.role!=='admin')throw Error('Nur Administratoren');
   const status=String(fd.get('status')),days=fd.get('days')?Number(fd.get('days')):null,reply=String(fd.get('reply')||'').trim();
   const selectedTicket=(s.service?.admin||[]).find(t=>t.id===form.dataset.ticketId);
   if(status==='approved'&&!confirm('Mitgliedschaft für '+(days?days+' Tage':Number(selectedTicket?.term_months||1)+' Monate')+' freigeben? Zahlung separat prüfen.'))return;
   const r=await api.rpc('academy_service',{p_action:'respond',p_payload:{id:form.dataset.ticketId,status,days,reply}});
   if(r.error)throw r.error;await refreshService();await loadTicketThread(form.dataset.ticketId);render();notice('Anfrage aktualisiert.');return;
  }
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
  if(mode==='profile-title'){
   const title=String(fd.get('title')||'Developer'),card=s.social?.profile||{},unlocked=new Set(s.social?.titles||['Developer']);
   if(!unlocked.has(title))throw Error('Dieser Titel ist noch nicht freigeschaltet.');
   const r=await api.rpc('academy_social_update',{p_bio:String(card.bio||''),p_avatar:String(card.avatar_style||'violet'),p_banner:String(card.banner_style||'nebula'),p_style:String(card.name_style||'classic'),p_title:title,p_show:card.show_progress!==false});if(r.error)throw r.error;
   await refreshSocial();notice('Profiltitel gespeichert: '+title);render();return;
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
    const r=await api.rpc('academy_voucher_create_flexible',{
      p_custom_code:custom,p_kind:kind,p_tier:tier,
      p_percent:kind==='discount'?Number(fd.get('percent')):null,
      p_duration_value:Number(fd.get('duration_value')),p_duration_unit:String(fd.get('duration_unit')),
      p_max_uses:Number(fd.get('max_uses')),p_valid_value:Number(fd.get('valid_value')),p_valid_unit:String(fd.get('valid_unit'))
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
 }catch(err){
   if(mode==='support-ticket'){
    const status=$('#support-submit-status');
    if(status){status.textContent='Anfrage nicht bestätigt: '+formatError(err);status.classList.add('error');}
    s.supportBusy=false;
   }
   notice(formatError(err));
 }finally{button.disabled=false;if(mode==='support-ticket'&&button.isConnected)button.textContent='Anfrage senden →';}
});
window.addEventListener('hashchange',function(){if(s.ready)navigateCurrent();});
async function init(){
 applyPreferences();
 if(typeof window.setInterval==='function')window.setInterval(updateStreakClocks,1000);
 document.head.insertAdjacentHTML('beforeend','<style>.is-auth .sidebar,.is-auth .bottom-nav{display:none}.is-auth .topbar{background:#0d0a19}.is-auth .content{max-width:1100px}.is-auth .app-column{width:100%}</style>');
 if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey){content.innerHTML='<div class="auth-layout panel"><h2>Verbindung nicht verfügbar</h2><p>Supabase konnte nicht geladen werden. Bitte lade die Seite erneut oder überprüfe deine Verbindung.</p></div>';return;}
 try{api=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  await refreshShopVisibility();
  window.setInterval(()=>{void refreshShopVisibility().catch(()=>{});},30000);
  void fetchRegistrationPolicy(false).catch(()=>{});
  void api.rpc('academy_shop_discount').then(res=>{if(!res.error){s.shopDiscount=Number(res.data)||0;if(s.ready&&['plans','admin'].includes(parseRoute().page))render();}}).catch(()=>{});
  void api.rpc('academy_beta_status').then(beta=>{if(!beta.error){s.service.beta_open=beta.data===true;if(!s.ready)login();}}).catch(()=>{});
  window.LLLearning?.attach?.({state:()=>s,client:()=>api,notice,onStep:(id,step)=>{s.lessonStep=step;if(s.progress.lastLesson?.id===id){s.progress.lastLesson.step=step;void saveProgress().catch(()=>{});}}});
   window.LLStudio?.connect?.({state:()=>s,client:()=>api,notice,go,render});await boot();}
 catch(err){content.innerHTML='<div class="auth-layout panel"><h2>Academy nicht erreichbar</h2><p class="muted">'+esc(formatError(err))+'</p><button class="btn" onclick="location.reload()">Erneut versuchen</button></div>';}
}
init();
})();
