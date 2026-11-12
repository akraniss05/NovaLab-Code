/* Regression: focus timer, clean lesson editor, real quiz grading. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const end=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(source,end);
const exposed=source.replace(end,"\nwindow.__appTest={s,quizQuestions,paintTimer,openTimer,toggleFocusTimer,completePractice,updateLessonControls,navigateCurrent,parseRoute,setApi(value){api=value}};\n})();");
const saved=new Map(),callbacks={},elements=new Map();
function classList(){const set=new Set();return {add(...names){names.forEach(n=>set.add(n))},remove(...names){names.forEach(n=>set.delete(n))},toggle(name,state){if(state===undefined)state=!set.has(name);state?set.add(name):set.delete(name)},contains(name){return set.has(name)}};}
const fake=()=>({innerHTML:'',textContent:'',hidden:false,disabled:false,value:'',dataset:{},style:{width:'',setProperty(){}},classList:classList(),setAttribute(){},focus(){},querySelector(){return null},replaceChildren(){},isConnected:true});
for(const key of ['#content','#sidebar','#bottom-nav','#toast','#focus-header','#focus-clock','#timer-portal','#timer-minutes','#practice-input','#practice-feedback','#practice-self-reviewed','#practice-status','#practice-workspace','#mark-lesson','[data-action="complete-practice"]','#answer-result','#video-check','#quiz-choices','#quiz-question','#quiz-progress','#quiz-meter-fill','#lesson-explanation'])elements.set(key,fake());
const answerButtons=['0','1','2'].map(value=>({dataset:{answer:value},disabled:false,classList:classList()}));
const doc={querySelector(selector){return elements.get(selector)||null},querySelectorAll(selector){return selector==='[data-answer]'?answerButtons:[]},addEventListener(name,fn){(callbacks[name]||(callbacks[name]=[])).push(fn)},body:{classList:classList()}};
const sync=require('../site/academy-progress-sync.js').LLProgressSync;
const window={LL_CONFIG:{},LLPractice:require('../site/practice-engine.js').LLPractice,LLCurriculum:require('../site/academy-curriculum.js').LLCurriculum,LLProgressSync:{...sync,save:async(_client,_id,_key,base,snapshot)=>({payload:sync.merge(base,snapshot,{}),updated_at:new Date().toISOString()})},addEventListener(){}};
window.LLLearning={queue(){},mark(){}};
window.LLRuntime={async run(text){return {available:true,ok:true,lines:[text.includes('Wrong')?'Wrong':'Hello']}}};
const sandbox={window,document:doc,localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)},sessionStorage:{getItem:()=>null},location:{hash:'#lesson/lua-01'},console,setTimeout,clearTimeout,setInterval(){return 1},clearInterval(){},Date,Math,Number,Promise,Map,Set,Intl,confirm(){return true}};
vm.createContext(sandbox);
vm.runInContext(exposed,sandbox,{filename:'academy-v21.js'});
const app=window.__appTest,s=app.s;
assert.equal(app.quizQuestions({quiz:'Richtig?',options:['Ja','Nein'],correct:0}).length,1,'No fabricated extra quiz questions');
assert.equal(app.quizQuestions({quiz:'Defekt',options:['A'],correct:3}).length,0,'Bad quiz data not accepted');
assert.equal(app.quizQuestions({quiz:'Wofür?',options:['A','B'],correct:0,quiz_version:2,goal:'Lernziel verstehen.',task:'Erstelle eine konkrete Übung und kontrolliere die Ausgabe.'}).length,1,'Old generated quiz banks must fall back to the original verified question');
assert.equal(app.quizQuestions({quiz:'Wofür?',options:['A','B'],correct:0,quiz_version:3,quiz_items:Array.from({length:8},(_,i)=>({question:'Welche Aussage gehört zu Lektion '+i+'?',options:['A','B'],correct:0}))}).length,3,'Curated banks never overwhelm a lesson');
assert.equal(source.includes('data-action="run-practice"'),false,'Visible terminal action removed');
assert.equal(source.includes('practice-console'),false,'Terminal UI removed');
assert.equal(app.quizQuestions({quiz:'Richtig?',options:['Ja','Nein'],correct:0})[0].correct,0);
app.paintTimer();
assert.equal(elements.get('#focus-header').hidden,false,'Timer always visible');
assert.match(elements.get('#focus-header').textContent,/25:00/);
app.openTimer();
assert.match(elements.get('#timer-portal').innerHTML,/Zeit einstellen/);
assert.match(elements.get('#timer-portal').innerHTML,/Zurücksetzen/);
function event(selector,extra){
 const node=extra||{};
 return {target:{id:node.id,closest(query){return query===selector?node:null}},preventDefault(){}};
}
async function click(selector,node){for(const fn of callbacks.click||[])await fn(event(selector,node));}
(async()=>{
 elements.get('#timer-minutes').value='42';
 await click('[data-timer-set]',{});
 assert.equal(JSON.parse(saved.get('liverylab-focus-v40')).seconds,42*60,'Custom timer duration persists');
 await click('[data-timer-toggle]',{});
 assert.ok(JSON.parse(saved.get('liverylab-focus-v40')).end>Date.now(),'Timer deadline persisted');
 await click('[data-timer-toggle]',{});
 assert.equal(JSON.parse(saved.get('liverylab-focus-v40')).end,0,'Pause removes deadline');
 s.ready=true;s.user={id:'00000000-0000-4000-8000-000000000001'};s.profile={username:'Tester',display_name:'Tester',role:'student',active:true};s.tier='free';
 s.courses=[{id:'lua',name:'Lua',category:'Sprachen'}];
 s.lessons=[{id:'lua-01',course_id:'lua',required_plan:'free',position:1,title:'Hello',summary:'Test'}];
 s.progress={done:[],watched:[],practiced:[],verifiedPractice:[],exams:{},completedAt:{}};
 s.lesson={payload:{lang:'lua',task:'Gib Hello aus.',checks:['print'],solution:'print("Hello")',quiz:'Welche Antwort ist richtig?',options:['Richtig','Falsch','Vielleicht'],correct:0}};
 s.videoChecked=true;s.practiceChecked=false;s.choice=null;s.quizStep=0;s.quizPassed=false;
 app.setApi({from(table){assert.equal(table,'academy_progress');return {upsert:async()=>({error:null})}}});
 elements.get('#practice-input').value='print("Wrong")';
 await app.completePractice();
 assert.equal(s.practiceChecked,false);
 assert.equal(elements.get('#practice-feedback').hidden,false,'False result is visible');
 assert.equal(elements.get('#practice-feedback').classList.contains('is-error'),true,'Wrong code is red');
 elements.get('#practice-input').value='print("Hello")';
 await app.completePractice();
 assert.equal(s.practiceChecked,true);
 assert.equal(elements.get('#practice-feedback').classList.contains('is-success'),true,'Correct code is green');
 await click('[data-answer]',{dataset:{answer:'2'}});
 assert.equal(s.quizPassed,false,'Wrong quiz answer is not accepted');
 assert.equal(elements.get('#answer-result').classList.contains('quiz-incorrect'),true,'Wrong quiz is red');
 await click('[data-answer]',{dataset:{answer:'0'}});
 assert.equal(s.quizPassed,true,'Correct quiz answer passes');
 assert.equal(elements.get('#answer-result').classList.contains('quiz-correct'),true,'Correct quiz is green');
 assert.equal(elements.get('#mark-lesson').disabled,false,'Correct video + code + quiz unlocks completion');
 // Verified v3 banks contain three contextual questions; obsolete v2 banks are ignored.
 const chapters=Array.from({length:2},(_,i)=>({title:'Lernteil '+(i+1),paragraphs:['Ausführliche Erklärung zu Teil '+(i+1)+'.'],bullets:['Wichtiger Begriff'],exercise:'Aufgabe ausführen.'}));
 const questions=Array.from({length:6},(_,i)=>({question:'Wissensfrage '+(i+1)+' zum Thema Lua?',options:['Antwort A','Antwort B','Antwort C'],correct:i%3,explanation:'Prüfe die Erklärung im Lernteil.'}));
 s.lesson.payload={...s.lesson.payload,sections:chapters,quiz_items:questions.slice(0,3).map((q,i)=>({...q,correct:[0,2,0][i]})),quiz_version:3,
  title:'Erste Lua-Ausgabe',goal:'Eine Lua-Ausgabe verstehen und testen.',task:'Gib mit print den Text Hello im Terminal aus.',
  mistake:'Ein nicht geschlossener String führt zu einem Syntaxfehler.',hint:'Setze den auszugebenden Text zwischen Anführungszeichen.'};
 s.quizStep=0;s.choice=null;s.quizPassed=false;
 assert.equal(app.quizQuestions(s.lesson.payload).length,3,'Three lesson-specific quiz questions');
 await click('[data-lesson-part]',{dataset:{lessonPart:'1'}});
 assert.equal(s.sectionIndex,1,'Reader switches to the second part');
 assert.match(elements.get('#lesson-explanation').innerHTML,/LERNTEIL 2 VON 2/);
 assert.equal(saved.get('liverylab-part-'+s.user.id+'-lua-01'),'1','Current part saved locally per user');
 const correctAnswers=[0,2,0];
 for(let i=0;i<3;i++){
  assert.equal(s.quizStep,i,'Quiz starts at the required question');
  await click('[data-answer]',{dataset:{answer:String((correctAnswers[i]+1)%3)}});
  assert.equal(s.quizStep,i,'Incorrect answer never advances');
  assert.equal(s.quizPassed,false,'Incorrect answer never completes the quiz');
  await click('[data-answer]',{dataset:{answer:String(correctAnswers[i])}});
  assert.equal(s.quizStep,i===2?2:i+1,'Correct answer advances exactly one question');
  assert.equal(s.quizPassed,i===2,'Quiz completion only after all three correct answers');
 }
 const localQuiz=JSON.parse(saved.get('liverylab-quiz-'+s.user.id+'-lua-01'));
 assert.equal(localQuiz.total,3,'Browser checkpoint records quiz length');
 assert.equal(localQuiz.passed,true,'Quiz completion stored locally');
 assert.equal(s.progress.quizProgress,undefined,'Quiz in-progress data is not sent to account progress');
 assert.match(elements.get('#quiz-progress').textContent,/Frage 3 von 3/);
 assert.equal(elements.get('#mark-lesson').disabled,false,'All quiz questions unlock lesson completion');
 const originalLesson=s.lesson;
 s.lesson={payload:{lang:'lua',practice_mode:'guided',task:'Teste die Resource lokal.'}};
 s.practiceChecked=false;
 const selfReview=elements.get('#practice-self-reviewed');
 elements.get('#practice-input').value='Resource startet; keine Fehler in der Konsole.';
 selfReview.checked=false;
 await app.completePractice();
 assert.equal(s.practiceChecked,false,'Guided mode requires an explicit confirmation');
 selfReview.checked=true;
 await app.completePractice();
 assert.equal(s.practiceChecked,true,'Confirmed local test can complete guided practice');
 assert.match(elements.get('#practice-feedback').textContent,/Selbstprüfung gespeichert/);
 s.lesson=originalLesson;
 // The redesigned timer keeps the old controls and adds presets/ring.
 assert.match(elements.get('#timer-portal').innerHTML,/ll-focus-ring/,'Streak-style circular countdown present');
 assert.match(elements.get('#timer-portal').innerHTML,/data-timer-preset="25"/,'Quick preset controls present');
 // A slow lesson response must never replace the newer lesson or its draft.
 s.lessons.push({...s.lessons[0],id:'lua-02',position:2});
 let releaseFirst;
 const first=new Promise(resolve=>{releaseFirst=resolve});
 const secondLesson={allowed:true,payload:{quiz:'Zweite Frage?',options:['A','B'],correct:0}};
 window.scrollTo=()=>{};
 app.setApi({
  rpc(_name,{p_lesson}){return p_lesson==='lua-01'?first:Promise.resolve({data:secondLesson})},
  from(){return {upsert:async()=>({error:null})}}
 });
 const pending=app.navigateCurrent();
 sandbox.location.hash='#lesson/lua-02';
 await app.navigateCurrent();
 releaseFirst({data:{allowed:true,payload:{quiz:'Erste Frage?'}}});
 await pending;
 assert.equal(s.lesson,secondLesson,'A late response cannot overwrite the active lesson');
 sandbox.location.hash='#lesson/%E0%A4';
 assert.equal(app.parseRoute().id,'%E0%A4','Malformed URL encoding cannot crash routing');
 console.log('PASS: Focus timer, green/red code check, two learning parts and three relevant quiz questions saved locally.');

})().catch(err=>{console.error(err);process.exitCode=1});
