/* LiveryLab Academy v15: actual Chromium mobile layout regression tests */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site/academy-v21.js'),'utf8');
const css=['site/app-v21.css','site/academy-v31-layout.css'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');
const expose='\nwindow.__views={s,filteredCourses,difficultyDiagram,coursesPage,trackPage,lessonPage,scriptPage,examPage,examsPage,referencePage,plansPage,adminPage,login,profilePage,friendsPage,supportPage,settingsPage,homePage,streakModalHtml,llIcon,paywall};\n})();';
assert.match(source,/\ninit\(\);\n\}\)\(\);\s*$/);
const rewritten=source.replace(/\ninit\(\);\n\}\)\(\);\s*$/,expose);
const fake=()=>({innerHTML:'',classList:{toggle(){},add(){},remove(){},contains(){return false}}});
const fakeNodes={};
const context={
 window:{LL_CONFIG:{},addEventListener(){}},
 document:{querySelector(key){return fakeNodes[key]||(fakeNodes[key]=fake())},querySelectorAll(){return[]},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#lesson/fivem-01'},
 localStorage:{getItem(){return null},setItem(){}},setTimeout(){},clearTimeout(){},console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'site/reference-data.js'),'utf8'),context,{filename:'reference-data.js'});
vm.runInContext(fs.readFileSync(path.join(root,'site/academy-curriculum.js'),'utf8'),context,{filename:'academy-curriculum.js'});
vm.runInContext(fs.readFileSync(path.join(root,'site/academy-difficulty.js'),'utf8'),context,{filename:'academy-difficulty.js'});
vm.runInContext(rewritten,context,{filename:'academy.js'});
const app=context.window.__views,s=app.s;
s.ready=true;s.profile={display_name:'Developer',username:'developer',role:'student',active:true};s.referenceData=context.window.LL_REFERENCE_DATA;s.social={profile:{username:'developer',display_name:'Developer',bio:'Lerne FiveM und Python',avatar_style:'violet',banner_style:'nebula',name_style:'gradient',title:'Developer',lessons:1,awards:0},friends:[],requests:[],titles:['Developer']};
s.user={email:'developer@example.com'};s.tier='ultimate';
s.courses=[{id:'fivem',name:'Lua für FiveM – bis zum eigenen Script',category:'FiveM',level:'beginner'}];
const titles=['Variablen, Typen & print','Bedingungen & Schleifen','Funktionen','Tables: Listen & Dictionaries','Event-Grundlagen','fxmanifest und Resource','Client, Server & Events','Threads & Performance','Natives und Blips','Commands & ACE','Server-Logik','Sicherheit','Debugging'];
s.lessons=Array.from({length:13},(_,i)=>({id:'fivem-'+String(i+1).padStart(2,'0'),course_id:'fivem',chapter:i<5?'01 · Lua-Grundlagen':i<10?'02 · FiveM-Scripting':'03 · Fortgeschritten',position:i+1,title:titles[i],summary:'Jede Lektion erklärt ein Konzept und zeigt einen praktischen Anwendungsfall.',minutes:12,required_plan:'free'}));
s.progress={done:['fivem-01'],watched:[],practiced:[],exams:{}};
s.lesson={payload:{title:titles[0],theory:'Mit Variablen speicherst du Werte, die du später wiederverwenden kannst.',example:'local name = "LiveryLab"\nlocal points = 10\nprint(name, points)',task:'Schreibe eine eigene Variable und gib sie mit print aus.',quiz:'Wofür steht local in Lua?',options:['Lokale Variable','Globale Datei','Neuer Server'],correct:0,goal:'Du kannst Variablen erklären und verwenden.',sections:[{title:'1 · Verstehen & Beispiel',paragraphs:['Variablen enthalten Daten.'],bullets:['Datentypen','Werte'],code:'local score = 10'},{title:'2 · Ausprobieren & festigen',paragraphs:['Verändere einen Wert und prüfe die Ausgabe.'],exercise:'Print die Variable'}]},video_id:'xcmGSRdCXc4',video_start:510};
// v1.5 difficulty radar: actual filter matching, search terms and chart rendering.
const originalCatalogCourses=s.courses, originalCatalogState={filter:s.filter,search:s.search,difficultyFilter:s.difficultyFilter};
s.courses=[
 {id:'html',name:'HTML',category:'Webentwicklung',level:'beginner',difficulty:1},
 {id:'lua',name:'Lua',category:'Programmieren',level:'beginner',difficulty:2},
 {id:'javascript',name:'JavaScript',category:'Programmieren',level:'beginner',difficulty:3},
 {id:'rust',name:'Rust',category:'Programmieren',level:'advanced',difficulty:5}
];
s.filter='Alle';s.search='';s.difficultyFilter='all';
assert.equal(app.filteredCourses().length,4);
assert.equal((app.difficultyDiagram().match(/data-difficulty-filter="[1-5]"/g)||[]).length,5,'Chart must show five interactive levels');
assert.match(app.coursesPage(),/id="course-difficulty-select"/);
assert.match(app.coursesPage(),/id="course-search"/);
s.difficultyFilter=3;
assert.deepEqual(Array.from(app.filteredCourses(),c=>c.id),['javascript'],'Difficulty dropdown and chart share the same state');
assert.match(app.difficultyDiagram(),/aria-pressed="true"/);
s.difficultyFilter='all';s.search='5/5';
assert.deepEqual(Array.from(app.filteredCourses(),c=>c.id),['rust'],'Score search must find 5/5 courses');
s.search='leicht';
assert.deepEqual(Array.from(app.filteredCourses(),c=>c.id),['lua','html'],'German easy search should match 1/5 and 2/5');
s.search='rust';s.difficultyFilter=3;
assert.equal(app.filteredCourses().length,0,'Difficulty and text query must combine');
s.search='';s.difficultyFilter='all';s.filter='Webentwicklung';
assert.deepEqual(Array.from(app.filteredCourses(),c=>c.id),['html'],'Category filter must coexist with difficulty');
s.courses=originalCatalogCourses;
s.filter=originalCatalogState.filter;
s.search=originalCatalogState.search;
s.difficultyFilter=originalCatalogState.difficultyFilter;

const bannerB64=fs.readFileSync(path.join(root,'site/liverylab-banner.webp')).toString('base64');
function capture(html){
html=html.replaceAll('src="./liverylab-banner.webp"','src="data:image/webp;base64,'+bannerB64+'"');
const nav=['Home','Lernen','Script','Prüfung','Profil'].map((n,i)=>'<button class="bottom-item '+(i===0?'active':'')+'"><span class="side-icon">'+app.llIcon(['home','learn','code','exam','profile'][i])+'</span>'+n+'</button>').join('');
return '<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+
'<div class="app-shell"><aside class="sidebar"><div class="sidebar-logo"><span class="logo-mark">fx</span>LiveryLab Academy</div></aside>'+
'<div class="app-column"><header class="topbar"><div class="brandbox"><button class="icon-btn mobile-only">☰</button><a class="brand" href="#"><span class="brand-mark">fx</span><span>LiveryLab <strong>Academy</strong></span></a></div>'+
'<div class="focus-center"><button class="focus-header" id="focus-header" data-timer-open>◷ 25:00</button></div><div class="top-right"><span class="xp-header">30 XP</span><button class="header-streak-chip" data-streak-open>🔥 1 Tag</button><button class="avatar-btn">N</button></div></header>'+
'<main id="content" class="content">'+html+'</main><footer class="footer">Made with 💙 from NyxAtheris (LiveryLab Studios)</footer></div>'+
'<nav class="bottom-nav">'+nav+'</nav></div></body></html>';
}
const executable=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/opt/google/chrome/chrome','/usr/bin/chromium'].filter(Boolean).find(p=>fs.existsSync(p));
if(!executable)throw Error('Chrome/Chromium is required on CI');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
const scenes=[
 ['home',app.homePage(),['.ll-home-brand-banner img','.ll-home-shortcuts','.ll-home-continue','.ll-streak-shortcut']],
 ['courses',app.coursesPage(),['.ll-difficulty-dashboard','.ll-difficulty-chart','.ll-difficulty-tile','#course-difficulty-select','#course-search','.course-grid']],
 ['track',app.trackPage('fivem'),['.lesson-card','.lesson-main strong','.lesson-summary','.status-ring']],
 ['lesson',app.lessonPage('fivem-01'),['.lesson-steps','.lesson-step','.step-box','.video-frame','.quiz-choice','.exercise-textarea','.code-editor','#code-lines','.ll-part-selector-two','[data-lesson-part="0"]','[data-lesson-part="1"]','[data-action="reset-lesson"]']],
 ['script',app.scriptPage(),['.file-tree','.file-tabs','.file-preview']],
 ['reference',app.referencePage(),['.reference-row','.reference-block']],
 ['plans',app.plansPage(),['.membership-card','.voucher-panel','.voucher-input-row']],
 ['profile',app.profilePage(),['.profile-overview-card','.profile-overview-avatar','.achievement-grid']],
 ['friends',app.friendsPage(),['.friends-overview','.friend-navigation','.friend-empty']],
 ['support',app.supportPage(),['.support-grid','.support-compose','.support-history','form[data-form="support-ticket"]']],
 ['exams',app.examsPage(),['.exam-filters','[data-exam-filter="ready"]']],
 ['settings',app.settingsPage(),['.settings-appearance-card','.appearance-picker','.account-settings-grid','#mfa-settings']],
 ['paywall-script',app.paywall('Script','Plus','Gesperrt für Free'),['.feature-gate','.feature-gate-actions']],
 ['paywall-reference',app.paywall('Referenzen','Pro / Ultimate','Gesperrt für Plus'),['.feature-gate','.feature-gate-actions']]
];
const initial=s.loginStreak;
s.loginStreak={current:13,best:14,claimable:true};
s.streakModalOpen=true;
scenes.push(['streak-ready',app.streakModalHtml(),['.ll-streak-backdrop','.ll-streak-modal','[data-streak-claim]']]);
s.loginStreak={current:14,best:14,claimable:false,next_claim_at:new Date(Date.now()+24*3600e3).toISOString()};
scenes.push(['streak-timer',app.streakModalHtml(),['.ll-streak-backdrop','.ll-streak-next','[data-streak-countdown]']]);
s.streakModalOpen=false;s.loginStreak=initial;
s.friendTab='search';scenes.push(['friend-search',app.friendsPage(),['.friends-search-panel','#friend-search-result']]);s.friendTab='friends';
s.progress.done=s.lessons.map(l=>l.id);
s.exam={items:Array.from({length:20},()=>({payload:{quiz:'Wofür benutzt man eine Variable?',options:['Wert speichern','Zum Löschen','Nur für Videos'],correct:0}})),at:0,answers:[]};
scenes.push(['exam',app.examPage('fivem'),['.exam-question','.exam-dots','.exam-option']]);
s.profile.role='admin';
s.members=[
 {id:'pending-test',username:'DeveloperNeu',email:'neu@example.com',role:'student',active:false,access_status:'pending',email_confirmed:true},
 {id:'member-test',username:'DevAktiv',email:'dev@example.com',role:'student',active:true,access_status:'approved',email_confirmed:true}
];
s.memberPlans={'member-test':'pro'};s.memberExpiry={'member-test':new Date(Date.now()+17*86400000).toISOString()};
s.vouchers=[{code:'NYXATHERIS5',kind:'gift',tier:'pro',days:7,uses:0,max_uses:1,active:true,expires_at:'2028-06-01T00:00:00Z'}];
context.location.hash='#admin/members';
scenes.push(['admin-members',app.adminPage(),['.approval-card','.member-card','.ll-member-summary','.member-management','[data-admin-tier]','[data-plan-clock]','[data-plan-action="extend"]','[data-plan-action="reduce"]','[data-plan-action="end"]']]);
context.location.hash='#admin/support';
s.service={beta_open:true,mine:[],admin:[{id:'11111111-1111-4111-8111-111111111111',username:'SupportNutzer',category:'bug',status:'open',message:'Bei einer Lektion fehlt der Hinweis',created_at:'2026-11-08T12:00:00Z'}]};
scenes.push(['admin-support',app.adminPage(),['.ll-admin-inbox','.ll-admin-ticket-list','[data-chat-open]']]);
context.location.hash='#admin/vouchers';
scenes.push(['admin-vouchers',app.adminPage(),['.voucher-maker','[data-voucher-delete]']]);
context.location.hash='#admin';
scenes.push(['admin-dashboard',app.adminPage(),['.ll-admin-hub','.ll-admin-tabs','.admin-overview']]);

scenes.push(['focus-timer',
 '<div class="timer-backdrop ll-focus-backdrop"></div><section class="timer-dialog ll-focus-modal" role="dialog">'+
 '<button class="ll-focus-close" type="button">×</button><div class="ll-focus-emblem">◷</div>'+
 '<span class="eyebrow ll-focus-kicker">LIVERYLAB · DEIN LERNMODUS</span>'+
 '<h2 class="ll-focus-title">Deine <span class="gradient">Fokuszeit.</span></h2>'+
 '<p class="ll-focus-lede">Konzentriert lernen, Schritt für Schritt. Deine Zeit bleibt beim Seitenwechsel erhalten.</p>'+
 '<div class="ll-focus-ring" data-timer-ring style="--focus-progress:45%"><div class="ll-focus-ring-inner"><span>✦</span><strong data-timer-time>14:20</strong><small>VERBLEIBENDE ZEIT</small></div></div>'+
 '<div class="ll-focus-presets">'+[15,25,45,60].map(v=>'<button>'+v+' Min</button>').join('')+'</div>'+
 '<label class="ll-focus-duration">Eigene Dauer <span class="ll-focus-input-row"><input class="input" value="25" type="number"><span>Minuten</span></span></label>'+
 '<div class="timer-actions ll-focus-actions"><button class="btn primary">▶ Starten</button><button class="btn">Zeit einstellen</button></div>'+
 '<div class="ll-focus-state">Der Timer läuft auch beim Seitenwechsel.</div><button class="ll-focus-reset">↻ Zurücksetzen</button></section>',
 ['.ll-focus-backdrop','.ll-focus-modal','.ll-focus-ring','.ll-focus-presets','.ll-focus-actions']]);
s.ready=false;s.authScreen='register';app.login();
scenes.push(['registration',fakeNodes['#content'].innerHTML,['form[data-form="register"]','.auth-card']]);
s.ready=true;s.profile.role='student';
for(const width of [390,430,1280]){
const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
for(const [name,markup,selectors] of scenes){
await page.setContent(capture(markup),{waitUntil:'load'});
const actual=await page.evaluate(names=>{
const get=selector=>document.querySelector(selector),main=get('.content'),steps=get('.lesson-steps'),nav=get('.bottom-nav'),card=get('.lesson-card'),title=get('.lesson-main strong'),summary=get('.lesson-summary'),video=get('.video-frame');
return {
 overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
 missing:names.filter(name=>!get(name)),
 cardDisplay:card?getComputedStyle(card).display:null,
 stepsDisplay:steps?getComputedStyle(steps).display:null,
 stepChildren:steps?steps.children.length:0,
 partCount:document.querySelectorAll('.ll-part-selector-two [data-lesson-part]').length,
 titleBelow:title&&summary?summary.getBoundingClientRect().top>=title.getBoundingClientRect().bottom-2:true,
 navDisplay:getComputedStyle(nav).display,
 videoRatio:video?video.getBoundingClientRect().width/video.getBoundingClientRect().height:null,
 mainWidth:main.getBoundingClientRect().width,
 iconWidths:Array.from(document.querySelectorAll('.ll-icon')).map(el=>Math.round(el.getBoundingClientRect().width)),
 navRows:[...new Set(Array.from(nav.querySelectorAll('.bottom-item')).map(el=>Math.round(el.getBoundingClientRect().top)))].length,
 shortcutDisplay:get('.ll-home-shortcuts')?getComputedStyle(get('.ll-home-shortcuts')).display:null,
 continueDisplay:get('.ll-home-continue')?getComputedStyle(get('.ll-home-continue')).display:null,
 modalWidth:get('.ll-streak-modal')?get('.ll-streak-modal').getBoundingClientRect().width:null,
 focusBounds:get('.ll-focus-modal')?{width:get('.ll-focus-modal').getBoundingClientRect().width,height:get('.ll-focus-modal').getBoundingClientRect().height,top:get('.ll-focus-modal').getBoundingClientRect().top,left:get('.ll-focus-modal').getBoundingClientRect().left}:null,
 planManagementWidth:get('.ll-plan-manager')?get('.ll-plan-manager').getBoundingClientRect().width:null,
 bannerRatio:get('.ll-home-brand-banner')?get('.ll-home-brand-banner').getBoundingClientRect().width/get('.ll-home-brand-banner').getBoundingClientRect().height:null,
 bannerHeight:get('.ll-home-brand-banner')?.getBoundingClientRect().height||null,
 headerHeight:get('.topbar')?.getBoundingClientRect().height||null,
 timerVisible:get('.focus-center .focus-header')?getComputedStyle(get('.focus-center .focus-header')).display!=='none':false,
 timerCenterOffset:get('.focus-center .focus-header')?Math.abs((get('.focus-center .focus-header').getBoundingClientRect().left+get('.focus-center .focus-header').getBoundingClientRect().width/2)-(get('.topbar').getBoundingClientRect().left+get('.topbar').getBoundingClientRect().width/2)):null,
 bannerDebug:get('.ll-home-brand-banner')?{width:get('.ll-home-brand-banner').getBoundingClientRect().width,height:get('.ll-home-brand-banner').getBoundingClientRect().height,aspect:getComputedStyle(get('.ll-home-brand-banner')).aspectRatio,display:getComputedStyle(get('.ll-home-brand-banner')).display,imagePosition:getComputedStyle(get('.ll-home-brand-banner img')).position,rules:Array.from(document.styleSheets).map(x=>x.cssRules?.length||0)}:null
};
},selectors);
assert.equal(actual.missing.length,0,name+' @'+width+' missing '+actual.missing.join(','));
assert.ok(actual.overflow<=2,name+' @'+width+' horizontal overflow '+actual.overflow+'px');
assert.ok(actual.mainWidth<=width,name+' @'+width+' content too wide');
assert.ok(actual.iconWidths.every(v=>v===0||(v>=1&&v<=48)),name+' @'+width+' icon HUGE: '+JSON.stringify(actual.iconWidths));
assert.equal(actual.timerVisible,true,name+' @'+width+' centered timer must be visible');
assert.ok(actual.timerCenterOffset<3,name+' @'+width+' timer not centered: '+actual.timerCenterOffset+'px');
if(name==='home'){console.log('BANNER GEOMETRY '+width+' '+JSON.stringify(actual.bannerDebug));assert.equal(actual.shortcutDisplay,'grid','Home shortcuts must be a grid');assert.equal(actual.continueDisplay,'flex','Continue card must be styled');const bannerRatioOk=actual.bannerRatio>2.5&&actual.bannerRatio<2.75;assert.ok(bannerRatioOk,'Banner aspect broken: '+actual.bannerRatio);if(width<820){assert.ok(actual.bannerHeight<191,'iPhone banner is too tall: '+actual.bannerHeight);assert.ok(actual.headerHeight<=75,'Mobile header became multi-row: '+actual.headerHeight)}}
if(name.startsWith('streak')){assert.ok(actual.modalWidth>200&&actual.modalWidth<=width,'Daily popup size broken');}
if(name==='focus-timer'){assert.ok(actual.focusBounds.width>220&&actual.focusBounds.width<=width,'Focus popup exceeds screen width');assert.ok(actual.focusBounds.height<=850,'Focus modal too tall');assert.ok(actual.focusBounds.top>=0,'Focus modal cut off above viewport');}
if(name==='admin-members'){assert.equal(actual.planManagementWidth,0,'Member details should stay collapsed by default');}
if(width<820){assert.equal(actual.navRows,1,'Five bottom nav tabs must stay on ONE ROW: '+actual.navRows);}
if(name==='track'){assert.equal(actual.cardDisplay,'grid');assert.ok(actual.titleBelow,'Lesson title/description collision');}
if(name==='lesson'){assert.equal(actual.stepsDisplay,'grid');assert.equal(actual.stepChildren,4);assert.equal(actual.partCount,2,'Lesson navigation must have exactly two tabs');assert.ok(actual.videoRatio>1.65&&actual.videoRatio<1.9,'Video aspect ratio');}
assert.equal(actual.navDisplay,width<820?'grid':'none');
if(width===390)await page.screenshot({path:path.join(root,'test-results',name+'.png'),fullPage:true});
console.log('PASS '+name+' @ '+width+'px '+JSON.stringify(actual));
}
await page.close();
}
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
