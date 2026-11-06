/* LiveryLab Academy v15: actual Chromium mobile layout regression tests */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site/academy.js'),'utf8');
const css=fs.readFileSync(path.join(root,'site/app-v19.css'),'utf8');
const expose='\nwindow.__views={s,trackPage,lessonPage,scriptPage,examPage,referencePage,plansPage,adminPage,login,profilePage,friendsPage,settingsPage,homePage,streakModalHtml,paywall};\n})();';
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
vm.runInContext(rewritten,context,{filename:'academy.js'});
const app=context.window.__views,s=app.s;
s.ready=true;s.profile={display_name:'Developer',username:'developer',role:'student',active:true};s.referenceData=context.window.LL_REFERENCE_DATA;s.social={profile:{username:'developer',display_name:'Developer',bio:'Lerne FiveM und Python',avatar_style:'violet',banner_style:'nebula',name_style:'gradient',title:'Developer',lessons:1,awards:0},friends:[],requests:[],titles:['Developer']};
s.user={email:'developer@example.com'};s.tier='ultimate';
s.courses=[{id:'fivem',name:'Lua für FiveM – bis zum eigenen Script',category:'FiveM',level:'beginner'}];
const titles=['Variablen, Typen & print','Bedingungen & Schleifen','Funktionen','Tables: Listen & Dictionaries','Event-Grundlagen','fxmanifest und Resource','Client, Server & Events','Threads & Performance','Natives und Blips','Commands & ACE','Server-Logik','Sicherheit','Debugging'];
s.lessons=Array.from({length:13},(_,i)=>({id:'fivem-'+String(i+1).padStart(2,'0'),course_id:'fivem',chapter:i<5?'01 · Lua-Grundlagen':i<10?'02 · FiveM-Scripting':'03 · Fortgeschritten',position:i+1,title:titles[i],summary:'Jede Lektion erklärt ein Konzept und zeigt einen praktischen Anwendungsfall.',minutes:12,required_plan:'free'}));
s.progress={done:['fivem-01'],watched:[],practiced:[],exams:{}};
s.lesson={payload:{title:titles[0],theory:'Mit Variablen speicherst du Werte, die du später wiederverwenden kannst.',example:'local name = "LiveryLab"\nlocal points = 10\nprint(name, points)',task:'Schreibe eine eigene Variable und gib sie mit print aus.',quiz:'Wofür steht local in Lua?',options:['Lokale Variable','Globale Datei','Neuer Server'],correct:0,goal:'Du kannst Variablen erklären und verwenden.'},video_id:'xcmGSRdCXc4',video_start:510};
const bannerB64=fs.readFileSync(path.join(root,'site/liverylab-banner.webp')).toString('base64');
function capture(html){
html=html.replaceAll('src="./liverylab-banner.webp"','src="data:image/webp;base64,'+bannerB64+'"');
const nav=['Home','Lernen','Script','Prüfung','Profil'].map((n,i)=>'<button class="bottom-item '+(i===0?'active':'')+'"><span class="side-icon">'+['⌂','▦','⌘','☆','◉'][i]+'</span>'+n+'</button>').join('');
return '<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+
'<div class="app-shell"><aside class="sidebar"><div class="sidebar-logo"><span class="logo-mark">fx</span>LiveryLab Academy</div></aside>'+
'<div class="app-column"><header class="topbar"><div class="brandbox"><button class="icon-btn mobile-only">☰</button><a class="brand" href="#"><span class="brand-mark">fx</span><span>LiveryLab <strong>Academy</strong></span></a></div>'+
'<div class="top-right"><span class="xp-header">30 XP</span><button class="avatar-btn">N</button></div></header>'+
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
 ['track',app.trackPage('fivem'),['.lesson-card','.lesson-main strong','.lesson-summary','.status-ring']],
 ['lesson',app.lessonPage('fivem-01'),['.lesson-steps','.lesson-step','.step-box','.video-frame','.quiz-choice','.exercise-textarea']],
 ['script',app.scriptPage(),['.file-tree','.file-tabs','.file-preview']],
 ['reference',app.referencePage(),['.reference-row','.reference-block']],
 ['plans',app.plansPage(),['.membership-card','.voucher-panel','.voucher-input-row']],
 ['profile',app.profilePage(),['.social-banner','.social-customizer','.social-avatar','.style-picker']],
 ['friends',app.friendsPage(),['.friends-overview','.friend-navigation','.friend-empty']],
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
s.memberPlans={'member-test':'pro'};
s.vouchers=[{code:'NYXATHERIS5',kind:'gift',tier:'pro',days:7,uses:0,max_uses:1,active:true,expires_at:'2028-06-01T00:00:00Z'}];
scenes.push(['admin',app.adminPage(),['.approval-card','.member-card','.member-management','[data-admin-tier]','.voucher-maker','[data-voucher-delete]']]);
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
 titleBelow:title&&summary?summary.getBoundingClientRect().top>=title.getBoundingClientRect().bottom-2:true,
 navDisplay:getComputedStyle(nav).display,
 videoRatio:video?video.getBoundingClientRect().width/video.getBoundingClientRect().height:null,
 mainWidth:main.getBoundingClientRect().width
};
},selectors);
assert.equal(actual.missing.length,0,name+' @'+width+' missing '+actual.missing.join(','));
assert.ok(actual.overflow<=2,name+' @'+width+' horizontal overflow '+actual.overflow+'px');
assert.ok(actual.mainWidth<=width,name+' @'+width+' content too wide');
if(name==='track'){assert.equal(actual.cardDisplay,'grid');assert.ok(actual.titleBelow,'Lesson title/description collision');}
if(name==='lesson'){assert.equal(actual.stepsDisplay,'grid');assert.equal(actual.stepChildren,4);assert.ok(actual.videoRatio>1.65&&actual.videoRatio<1.9,'Video aspect ratio');}
assert.equal(actual.navDisplay,width<820?'grid':'none');
if(width===390)await page.screenshot({path:path.join(root,'test-results',name+'.png'),fullPage:true});
console.log('PASS '+name+' @ '+width+'px '+JSON.stringify(actual));
}
await page.close();
}
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
