/* v44 permanent XP rewards: local client unit checks, no production mutations. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const original=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const end=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(original,end);
const source=original.replace(end,'\nwindow.__xpTest={s,grantLessonXP,xpEarned,xpAwarded,xpFromCourse,xpHistoryHtml,setApi(value){api=value}};\n})();');
const fake={innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},setAttribute(){}};
const localStorage={getItem(){return null;},setItem(){},removeItem(){}};
const document={querySelector(){return fake;},querySelectorAll(){return [];},addEventListener(){},head:{insertAdjacentHTML(){}}};
const win={LL_CONFIG:{},addEventListener(){},setInterval(){return 1}};
const context={window:win,document,localStorage,sessionStorage:localStorage,location:{hash:'#lesson/lua-01'},Date,Number,Intl,Math,Map,Set,Promise,console,setTimeout,clearTimeout,setInterval(){return 1},clearInterval(){},confirm(){return true}};
vm.createContext(context);
vm.runInContext(source,context,{filename:'academy-v21.js'});
const app=win.__xpTest,state=app.s;
state.user={id:'alice'};state.lessons=[
 {id:'lua-01',course_id:'lua',title:'Lua Variablen'},
 {id:'lua-02',course_id:'lua',title:'Lua Bedingungen'}
];
state.courses=[{id:'lua',name:'Lua Grundlagen'}];
state.progress={done:[],watched:[],practiced:[],verifiedPractice:[],exams:{}};
state.xpAwards=[];
const ledger=new Map();
let calls=0;
app.setApi({rpc:async(name,args)=>{
 assert.equal(name,'academy_claim_lesson_xp');
 assert.equal(args.p_lesson,'lua-01');
 calls++;
 const granted=!ledger.has(args.p_lesson);
 if(granted)ledger.set(args.p_lesson,{xp:30,awarded_at:'2026-11-07T15:00:00.000Z'});
 return {data:{awarded:granted,lesson_id:args.p_lesson,xp:granted?30:0,awarded_at:ledger.get(args.p_lesson).awarded_at,total_xp:30},error:null};
}});
(async()=>{
 assert.equal(app.xpEarned(),0);
 let first=await app.grantLessonXP('lua-01');
 assert.equal(first.awarded,true,'The first grant is acknowledged');
 assert.equal(app.xpEarned(),30);
 assert.equal(app.xpAwarded('lua-01'),true);
 assert.equal(app.xpFromCourse('lua'),30);
 const profile=app.xpHistoryHtml();
 assert.match(profile,/Lua Variablen/,'The profile lists the rewarded lesson');
 assert.match(profile,/\+30 XP/,'The profile shows the amount awarded');
 assert.match(profile,/Lua Grundlagen/,'The profile lists the course');

 // Reset every learning state; the award ledger stays authoritative.
 state.progress={done:[],watched:[],practiced:[],verifiedPractice:[],exams:{}};
 assert.equal(app.xpEarned(),30,'Resetting a lesson never deletes earned XP');
 first=await app.grantLessonXP('lua-01');
 assert.equal(first.awarded,false,'A repeated lesson receives zero new XP');
 assert.equal(first.xp,0);
 assert.equal(app.xpEarned(),30,'Repeated grant cannot double a displayed reward');
 assert.equal(state.xpAwards.length,1,'No duplicate history entry');
 assert.equal(calls,2,'Both grant requests reached the simulated server');

 // Simulate a new login/device loading the same immutable server row.
 state.xpAwards=[{lesson_id:'lua-01',xp:30,awarded_at:'2026-11-07T15:00:00.000Z'}];
 assert.equal(app.xpEarned(),30,'Authoritative history survives a new session');
 assert.match(original,/academy_lesson_xp_awards/,'Award history is loaded from Supabase');
 assert.match(original,/academy_claim_lesson_xp/,'New lesson completion calls server');
 assert.match(original,/Bereits verdiente XP bleiben/,'Reset warns that XP are permanent');
 console.log('PASS: XP awarded once, remembered by lesson, survives reset and account reload, and appears in history.');
})().catch(err=>{console.error(err);process.exitCode=1;});
