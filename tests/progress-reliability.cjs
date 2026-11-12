/* Database error and serialized progress-save regressions. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(script,footer);
const element={innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},setAttribute(){}};
const dom={querySelector(){return element;},querySelectorAll(){return [];},addEventListener(){},body:{classList:{toggle(){},add(){},remove(){}}}};
const storage={getItem(){return null;},setItem(){},removeItem(){}};
const win={LL_CONFIG:{},addEventListener(){}};
const context={window:win,document:dom,location:{hash:'#home'},localStorage:storage,sessionStorage:storage,
 console,Promise,JSON,Map,Set,Date,Math,Number,Intl,Error,setTimeout,clearTimeout,setInterval(){return 1},clearInterval(){},confirm(){return true}};
vm.createContext(context);
const injected=script.replace(footer,"\nframe=()=>{};render=()=>{};notice=()=>{};\nwindow.__progressTest={s,saveProgress,loadData,setClient:client=>{api=client}};\n})();");
vm.runInContext(injected,context,{filename:'academy-v21.js'});
const {s,saveProgress,loadData,setClient}=win.__progressTest;
s.user={id:'user-a'};s.profile={role:'student'};s.progress={done:['existing'],watched:['existing'],exams:{}};
let progressFailure=false,planFailure=false,uploads=[];
function query(table){
 const obj={
  select(){return this;},
  eq(){return this;},
  order(){return this;},
  range(){return Promise.resolve({data:[],error:null});},
  maybeSingle(){
   if(table==='academy_progress')return Promise.resolve(progressFailure?{error:new Error('Offline'),data:null}:{data:{payload:{done:['cloud']}},error:null});
   if(table==='academy_plans')return Promise.resolve(planFailure?{error:new Error('No plans'),data:null}:{data:{tier:'free'},error:null});
   return Promise.resolve({data:null,error:null});
  },
  upsert(value){return new Promise((resolve,reject)=>uploads.push({value,resolve,reject}));},
  then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject);}
 };
 return obj;
}
setClient({from:query,rpc(name){return Promise.resolve({data:name==='novalab_shop_enabled'?false:{tier:'free'},error:null});}});
(async()=>{
 progressFailure=true;
 await assert.rejects(loadData(),/Lernfortschritt konnte nicht geladen/);
 assert.equal(s.progress.done.join(','),'existing','Read errors must preserve the prior state');
 progressFailure=false;planFailure=true;
 await assert.rejects(loadData(),/Mitgliedschaft konnte nicht geladen/);
 assert.equal(s.progress.done.join(','),'existing');
 planFailure=false;

 s.ready=true;s.progress={done:['one'],watched:[],exams:{}};
 const first=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,1,'First progress save should begin');
 s.progress.done.push('two');
 const second=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,1,'Second save should wait for the first');
 assert.equal(uploads[0].value.payload.done.join(','),'one','Snapshot must be fixed at save time');
 uploads[0].resolve({error:null});
 await first;
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,2,'Second save starts after first finishes');
 assert.equal(uploads[1].value.payload.done.join(','),'one,two','Later progress must not be overwritten by old snapshot');
 uploads[1].resolve({error:null});
 await second;
 console.log('PASS: read failures preserve state, sequential snapshots prevent stale in-session overwrite.');
})().catch(error=>{console.error(error);process.exitCode=1});
