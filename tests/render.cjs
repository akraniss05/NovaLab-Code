/* LiveryLab Academy v11 — headless view-render verification.
   Tests actual view functions without a login or network connection. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
assert.match(source,/\ninit\(\);\n\}\)\(\);\s*$/);
const expose="\nwindow.__test={s,homePage,coursesPage,trackPage,lessonPage,scriptPage,referencePage,examPage,profilePage,settingsPage,plansPage,examsPage,adminPage,login,waitingApproval,submitExamAnswer,courseCard,friendsPage,supportPage,setApi(apiValue){api=apiValue},updateLessonControls,filteredCourses,frame};\n})();";
const body=source.replace(/\ninit\(\);\n\}\)\(\);\s*$/,expose);
const mocks=new Map();
const fakeNode=()=>({innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelector(){return null}});
const fakeNodes={'#content':fakeNode(),'#sidebar':fakeNode(),'#bottom-nav':fakeNode(),'#toast':fakeNode()};
const sandbox={
 window:{LL_CONFIG:{},addEventListener(){}},
 document:{querySelector(s){return fakeNodes[s]||null},querySelectorAll(){return[]},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#lesson/python-01'},
 localStorage:{getItem(k){return mocks.get(k)||null},setItem(k,v){mocks.set(k,v)},removeItem(k){mocks.delete(k)}},
 console,setTimeout(){},clearTimeout(){},setInterval(){return 1},clearInterval(){},confirm(){return true},FormData:class{},
};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../site/reference-data.js'),'utf8'),sandbox,{filename:'reference-data.js'});vm.runInContext(body,sandbox,{filename:'academy.js'});
const app=sandbox.window.__test,state=app.s;
const course={id:'python',name:'Python',category:'Sprachen',level:'beginner'};
const lesson={id:'python-01',course_id:'python',chapter:'Grundlagen',position:10,title:'Variablen',summary:'Variablen kennenlernen',minutes:15,required_plan:'free'};
state.profile={display_name:'Demo Developer',username:'demo',role:'student',active:true};
state.user={email:'demo@example.com'};
state.tier='free';state.courses=[course];state.lessons=[lesson];state.referenceData=sandbox.window.LL_REFERENCE_DATA;
state.progress={done:[],watched:[],practiced:[],exams:{}};
state.lesson={payload:{theory:'Eine Variable speichert einen Wert.',example:'zahl = 1',goal:'Verstehe Variablen',task:'Lege eine Variable an.',quiz:'Welche Zuweisung ist gültig?',correct:0,options:['zahl = 1','zahl ===','nichts']},video_id:'e6vPt_e9sRw',video_start:597};
assert(app.homePage().includes('Developer Academy'),'Neon dashboard home rendered');
assert(app.homePage().includes('liverylab-banner.webp'),'Original site banner displayed');
assert(app.homePage().includes('ll-home-shortcuts'),'Dashboard menu displayed');
assert(/kursbibliothek/i.test(app.coursesPage()),'Catalog rendered');
assert(app.trackPage('python').includes('Variablen'),'Learning track rendered');
assert(app.trackPage('python').includes('status-ring'),'Reference-style lesson status rings rendered');
assert(app.examsPage().includes('Prüfungen'),'Exams visible on Free');
state.tier='pro';assert(app.scriptPage().includes('sh_shop'),'Script project unlocked on Plus');
assert(app.scriptPage().includes('file-tabs'),'File tabs rendered');
assert(app.referencePage().includes('gesperrt'),'Reference should be locked on Plus');
state.tier='ultimate';assert(app.referencePage().includes('Spickzettel'),'Reference unlocked on Ultimate');
assert(app.referencePage().includes('reference-language'),'Language picker rendered');
assert(app.referencePage().includes('485 Referenzeinträge'),'Full reference library available');
const lessonHtml=app.lessonPage('python-01');
for(const value of ['practice-input','complete-practice','load-video','video-check','Wissen anwenden','code-editor','reset-lesson'])
 assert(lessonHtml.includes(value),'Missing lesson feature '+value);
const anotherCourse={id:'lua',name:'Lua',category:'Sprachen',level:'beginner'};
state.courses.unshift(anotherCourse);
state.lessons.unshift({id:'lua-01',course_id:'lua',chapter:'Start',position:1,title:'Lua Start',summary:'',minutes:10,required_plan:'free'});
state.progress.lastLesson={id:'python-01',at:new Date().toISOString()};
assert.match(app.homePage(),/WEITERLERNEN[\s\S]*?data-go="lesson\/python-01"/,'Continue opens last active lesson, not first catalog course');
state.courses.shift();state.lessons.shift();
assert(app.profilePage().includes('Dein Lern-'),'Read-only learning profile renders');
assert(!app.profilePage().includes('Profil gestalten'),'Profile configuration was removed');
assert(!app.profilePage().includes('Anzeigename ändern'),'Profile name configuration was removed');
assert(app.friendsPage().includes('Freund hinzufügen'),'Friends page rendered');
assert(app.friendsPage().includes('friend-navigation'),'Friends tabs rendered');
state.social={friends:[{id:'friend-1',username:'testfreund',display_name:'Testfreund'}],requests:[],titles:['Developer']};
assert(app.friendsPage().includes('friend-list-search'),'Friend list search rendered');
assert(app.supportPage().includes('support-ticket'),'In-app support form rendered');
state.tier='free';state.service={beta_open:false,mine:[],admin:[]};
assert(!app.supportPage().includes('value="plan"'),'Beta requests hidden after closure');
assert(app.plansPage().includes('Aktuell keine Anfragen'),'Closed beta prevents plan requests');
state.service={beta_open:true,mine:[],admin:[]};
state.friendTab='search';assert(app.friendsPage().includes('friends-search-panel'),'Friend search tab rendered');state.friendTab='friends';
assert(app.settingsPage().includes('App-Hintergrund'),'Personal app background setting rendered');
assert(app.settingsPage().includes('Kompakte Kurskarten'),'Compact cards setting available');
assert(app.settingsPage().includes('Hoher Kontrast'),'Accessibility settings available');
assert(app.homePage().includes('ll-home-focus'),'Learning focus section rendered');
assert(app.settingsPage().includes('Authenticator & 2FA'),'Two-factor settings moved to settings');
assert(!app.profilePage().includes('mfa-settings'),'Profile must not display account security');
assert(app.profilePage().includes('Login-Streak'),'Login streak stats on profile');
assert(app.profilePage().includes('Erfolge & Titel'),'Achievement gallery on profile');
assert(app.settingsPage().includes('Hintergrund & Oberflächen'),'Background themes rendered');
assert(app.settingsPage().includes('Standarddarstellung wiederherstellen'),'Appearance reset present');
assert(app.plansPage().includes('1,99 €'),'Plus price visible');
assert(app.plansPage().includes('5,99 €'),'Ultimate price visible');
state.planExpires='2030-01-01T00:00:00Z';state.tier='pro';
assert(app.profilePage().includes('Freigeschaltet bis'),'Membership expiry visible on profile');state.tier='ultimate';
assert.equal((app.plansPage().match(/BETA · nur auf Anfrage/g)||[]).length,2,'Plus and Pro are marked as request-only beta plans');
assert(app.plansPage().includes('redeem-voucher'),'Coupon redemption visible');
assert(app.plansPage().includes('5 pro Tag'),'Free daily limit visible');
assert(app.plansPage().includes('10 pro Tag'),'Plus daily limit visible');
assert(app.examsPage().includes('Prüfung'),'Exam landing rendered');
assert(app.examsPage().includes('data-exam-filter="ready"'),'Exam status filters rendered');
assert(app.examPage('python').includes('noch nicht vollständig'),'Exam locked until completion');
state.progress.done=['python-01'];state.progress.practiced=['python-01'];state.progress.watched=['python-01'];
assert(app.trackPage('python').includes('is-complete'),'Full lesson card should be green after completion');
state.exam={items:[{payload:{quiz:'Was ist eine Variable?',options:['Ein Wert','Ein Video'],correct:0}}],at:0,answers:[]};
assert(app.examPage('python').includes('exam-dots'),'Question progress dots render');
assert(app.courseCard(course).includes('is-complete'),'Full course card should be green after completion');
state.tier='free';assert(app.scriptPage().includes('gesperrt'),'Free Script should be locked');
assert(app.referencePage().includes('gesperrt'),'Free reference should be locked');lesson.required_plan='pro';
assert(app.lessonPage('python-01').includes('KURSINHALT GESCHÜTZT'),'Pro lesson not visible to free account');
state.ready=true;
sandbox.location.hash='#script';app.frame();
assert(fakeNodes['#bottom-nav'].innerHTML.includes('Script'),'Script navigation visible');
assert(fakeNodes['#bottom-nav'].innerHTML.includes('Referenz'),'Reference is available in the five-item bottom navigation');
state.members=[{id:'pending-user',username:'TestUser',email:'test@example.com',access_status:'pending',email_confirmed:true,active:false,role:'student'}];
state.profile.role='admin';
assert(app.adminPage().includes('Registrierungsanfragen'),'Pending approval cards render');
assert(app.adminPage().includes('Genehmigen'),'Admin approval action renders');
assert(app.adminPage().includes('data-admin-tier')===false,'Pending accounts do not have tier controls yet');
state.members.push({id:'paid-user',username:'PlusTester',email:'plus@example.com',access_status:'approved',email_confirmed:true,active:true,role:'student'});
state.memberPlans['paid-user']='pro';state.memberExpiry['paid-user']='2030-01-01T12:00:00.000Z';
const adminHtml=app.adminPage();
for(const value of ['data-plan-clock="paid-user"','data-plan-action="extend"','data-plan-action="reduce"','data-plan-action="end"','Laufzeit in Tagen','Endet am'])
 assert(adminHtml.includes(value),'Missing admin subscription duration feature '+value);
assert(adminHtml.includes('data-plan-user="paid-user"'),'Subscription actions are scoped to the target account');
state.memberExpiry['paid-user']=null;
assert(app.adminPage().includes('Laufzeit festlegen'),'Permanent subscriptions can be converted to a fixed duration');
state.members.pop();

state.authScreen='register';app.login();
assert(fakeNodes['#content'].innerHTML.includes('Registrierungsanfrage senden'),'Registration form renders');
app.waitingApproval('pending');
assert(fakeNodes['#content'].innerHTML.includes('Freigabe'),'Pending approval screen renders');
state.profile.role='student';state.ready=true;lesson.required_plan='free';
state.progress.done=['python-01'];sandbox.location.hash='#exam/python';
state.exam={attemptId:'00000000-0000-4000-8000-000000000001',items:[
 {payload:{quiz:'Was speichert eine Variable?',options:['Wert','Bild']}},
 {payload:{quiz:'Welche Sprache?',options:['Python','Musik']}}
],at:0,answers:[],review:[],busy:false};
app.setApi({rpc:async()=>({data:{ok:true,score:1,total:2,passed:false,review:[{quiz:'Was speichert eine Variable?',correct:false,expected:'Wert'},{quiz:'Welche Sprache?',correct:true,expected:'Python'}]}})});
(async()=>{
 await app.submitExamAnswer(1);
 assert.equal(state.exam.at,1,'First exam answer advances');
 assert.equal(state.exam.answers[0],1,'Answer selected and held for server-side grading');
 await app.submitExamAnswer(0);
 assert.equal(state.exam.at,2,'Exam completes');
 assert(fakeNodes['#content'].innerHTML.includes('Deine Auswertung'),'Exam feedback rendered');
 console.log('All v19 dashboard, profile, friend tabs, registration and server-graded exam tests passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
