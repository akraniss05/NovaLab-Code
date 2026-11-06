/* LiveryLab Academy v11 — headless view-render verification.
   Tests actual view functions without a login or network connection. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site/academy.js'),'utf8');
assert.match(source,/\ninit\(\);\n\}\)\(\);\s*$/);
const expose="\nwindow.__test={s,homePage,coursesPage,trackPage,lessonPage,profilePage,settingsPage,plansPage,examsPage,courseCard,updateLessonControls,filteredCourses};\n})();";
const body=source.replace(/\ninit\(\);\n\}\)\(\);\s*$/,expose);
const mocks=new Map();
const fakeNode=()=>({innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelector(){return null}});
const fakeNodes={'#content':fakeNode(),'#sidebar':fakeNode(),'#bottom-nav':fakeNode(),'#toast':fakeNode()};
const sandbox={
 window:{LL_CONFIG:{},addEventListener(){}},
 document:{querySelector(s){return fakeNodes[s]||null},querySelectorAll(){return[]},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#lesson/python-01'},
 localStorage:{getItem(k){return mocks.get(k)||null},setItem(k,v){mocks.set(k,v)},removeItem(k){mocks.delete(k)}},
 console,setTimeout(){},clearTimeout(){},confirm(){return true},FormData:class{},
};
vm.createContext(sandbox);vm.runInContext(body,sandbox,{filename:'academy.js'});
const app=sandbox.window.__test,state=app.s;
const course={id:'python',name:'Python',category:'Sprachen',level:'beginner'};
const lesson={id:'python-01',course_id:'python',chapter:'Grundlagen',position:10,title:'Variablen',summary:'Variablen kennenlernen',minutes:15,required_plan:'free'};
state.profile={display_name:'Demo Developer',username:'demo',role:'student',active:true};
state.user={email:'demo@example.com'};
state.tier='free';state.courses=[course];state.lessons=[lesson];
state.progress={done:[],watched:[],practiced:[],exams:{}};
state.lesson={payload:{theory:'Eine Variable speichert einen Wert.',example:'zahl = 1',goal:'Verstehe Variablen',task:'Lege eine Variable an.',quiz:'Welche Zuweisung ist gültig?',correct:0,options:['zahl = 1','zahl ===','nichts']},video_id:'e6vPt_e9sRw',video_start:597};
assert(app.homePage().includes('Aus Ideen werden'),'Home rendered');
assert(/kursbibliothek/i.test(app.coursesPage()),'Catalog rendered');
assert(app.trackPage('python').includes('Variablen'),'Learning track rendered');
const lessonHtml=app.lessonPage('python-01');
for(const value of ['practice-input','complete-practice','load-video','video-check','Wissen anwenden'])
 assert(lessonHtml.includes(value),'Missing lesson feature '+value);
assert(app.profilePage().includes('Developer-Profil'),'Profile rendered');
assert(app.settingsPage().includes('Kompakte Kurskarten'),'Settings rendered');
assert(app.plansPage().includes('Doppelt so viel'),'Plus tier explained');
assert(app.examsPage().includes('Prüfung'),'Exam landing rendered');
state.progress.done=['python-01'];state.progress.practiced=['python-01'];state.progress.watched=['python-01'];
assert(app.trackPage('python').includes('is-complete'),'Full lesson card should be green after completion');
assert(app.courseCard(course).includes('is-complete'),'Full course card should be green after completion');
state.tier='free';lesson.required_plan='pro';
assert(app.lessonPage('python-01').includes('KURSINHALT GESCHÜTZT'),'Pro lesson not visible to free account');
console.log('All view render tests passed');
