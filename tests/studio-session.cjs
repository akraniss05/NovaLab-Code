/* Studio account-switch race regression: late A responses must never overwrite account B. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site/academy-studio.js'),'utf8');
const css={removed:[],remove(...names){this.removed.push(...names)},toggle(){}};
const doc={body:{dataset:{},classList:css},documentElement:{style:{setProperty(){},removeProperty(name){css.removed.push(name)}}},
 querySelector(){return null},addEventListener(){}};
const window={};
vm.runInNewContext(source,{window,document:doc,Date,Set,Map,Promise,Math,Intl,console},{filename:'academy-studio.js'});
const state={ready:true,user:{id:'account-a'},profile:{username:'alpha'},courses:[],lessons:[],progress:{done:[]},xpAwards:[]};
const waiting=[];
function client(){
 return {from(table){
  let owner='';
  return {select(){return this},eq(field,value){if(field==='user_id')owner=value;return this},order(){return this},
   limit(){return new Promise(resolve=>waiting.push({table,owner,resolve}))},
   maybeSingle(){return new Promise(resolve=>waiting.push({table,owner,resolve}))}};
 }};
}
window.LLStudio.connect({state:()=>state,client,notice(){},go(){},render(){}});
const response=(table,owner)=>table==='academy_portfolio_projects'
 ?{data:[{id:owner,title:'Private '+owner,category:'coding',technologies:[],description:'Only '+owner,created_at:'2026-11-12T12:00:00Z'}],error:null}
 :table==='academy_studio_settings'?{data:{prefs:{frame:'starter',calm:owner==='account-b'}},error:null}
 :{data:[{lesson_id:'lesson-1',body:'Private note '+owner}],error:null};
async function run(){
 const first=window.LLStudio.load();
 assert.equal(waiting.filter(x=>x.owner==='account-a').length,3);
 window.LLStudio.clear();
 assert(css.removed.includes('studio-calm'),'Logout must reset style classes');
 state.user={id:'account-b'};state.profile={username:'beta'};
 const second=window.LLStudio.load();
 const b=waiting.filter(x=>x.owner==='account-b');
 assert.equal(b.length,3);
 for(const item of b)item.resolve(response(item.table,item.owner));
 await second;
 assert.match(window.LLStudio.portfolioPage(),/Private account-b/);
 for(const item of waiting.filter(x=>x.owner==='account-a'))item.resolve(response(item.table,item.owner));
 await first;
 assert.match(window.LLStudio.portfolioPage(),/Private account-b/,'B must remain visible');
 assert.doesNotMatch(window.LLStudio.portfolioPage(),/Private account-a/,'A must never leak into B');
 console.log('PASS: account-switch invalidates stale Studio loads, resets style state.');
}
run().catch(error=>{console.error(error);process.exitCode=1});
