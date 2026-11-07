/* Regression: focus timer, clean lesson editor, real quiz grading. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const end=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(source,end);
const exposed=source.replace(end,"\nwindow.__appTest={s,quizQuestions,paintTimer,openTimer,toggleFocusTimer,completePractice,updateLessonControls,setApi(value){api=value}};\n})();");
const saved=new Map(),callbacks={},elements=new Map();
function classList(){const set=new Set();return {add(...names){names.forEach(n=>set.add(n))},remove(...names){names.forEach(n=>set.delete(n))},toggle(name,state){if(state===undefined)state=!set.has(name);state?set.add(name):set.delete(name)},contains(name){return set.has(name)}};}
const fake=()=>({innerHTML:'',textContent:'',hidden:false,disabled:false,value:'',dataset:{},classList:classList(),setAttribute(){},focus(){},querySelector(){return null},replaceChildren(){},isConnected:true});
for(const key of ['#content','#sidebar','#bottom-nav','#toast','#focus-header','#focus-clock','#timer-portal','#timer-minutes','#practice-input','#practice-feedback','#practice-status','#practice-workspace','#mark-lesson','[data-action="complete-practice"]','#answer-result','#video-check'])elements.set(key,fake());
const answerButtons=['0','1','2'].map(value=>({dataset:{answer:value},disabled:false,classList:classList()}));
const doc={querySelector(selector){return elements.get(selector)||null},querySelectorAll(selector){return selector==='[data-answer]'?answerButtons:[]},addEventListener(name,fn){(callbacks[name]||(callbacks[name]=[])).push(fn)},body:{classList:classList()}};
const window={LL_CONFIG:{},LLPractice:require('../site/practice-engine.js').LLPractice,addEventListener(){}};
window.LLLearning={queue(){},mark(){}};
window.LLRuntime={async run(text){return {available:true,ok:true,lines:[text.includes('Wrong')?'Wrong':'Hello']}}};
const sandbox={window,document:doc,localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)},sessionStorage:{getItem:()=>null},location:{hash:'#lesson/lua-01'},console,setTimeout,clearTimeout,setInterval(){return 1},clearInterval(){},Date,Math,Number,Promise,Map,Set,Intl,confirm(){return true}};
vm.createContext(sandbox);
vm.runInContext(exposed,sandbox,{filename:'academy-v21.js'});
const app=window.__appTest,s=app.s;
assert.equal(app.quizQuestions({quiz:'Richtig?',options:['Ja','Nein'],correct:0}).length,1,'No fabricated extra quiz questions');
assert.equal(app.quizQuestions({quiz:'Defekt',options:['A'],correct:3}).length,0,'Bad quiz data not accepted');
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
 console.log('PASS: Timer always centered/visible and persistent, red/green code check, correct/incorrect quiz and completion gate.');
})().catch(err=>{console.error(err);process.exitCode=1});
