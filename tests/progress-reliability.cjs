/* Database error and serialized progress-save regressions. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(script,footer);
const element={innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},setAttribute(){}};
const dom={querySelector(){return element;},querySelectorAll(){return [];},addEventListener(){},body:{classList:{toggle(){},add(){},remove(){}}}};
const storage={getItem(){return null;},setItem(){},removeItem(){}};
const {LLProgressSync:sync}=require('../site/academy-progress-sync.js');
const uploads=[];
const win={LL_CONFIG:{},LLProgressSync:{...sync,save:async(_client,_account,_key,base,snapshot)=>new Promise((resolve,reject)=>uploads.push({base,snapshot,resolve,reject}))},addEventListener(){}};
const context={window:win,document:dom,location:{hash:'#home'},localStorage:storage,sessionStorage:storage,
 console,Promise,JSON,Map,Set,Date,Math,Number,Intl,Error,setTimeout,clearTimeout,setInterval(){return 1},clearInterval(){},confirm(){return true}};
vm.createContext(context);
const injected=script.replace(footer,"\nframe=()=>{};render=()=>{};notice=()=>{};\nwindow.__progressTest={s,saveProgress,loadData,setClient:client=>{api=client}};\n})();");
vm.runInContext(injected,context,{filename:'academy-v21.js'});
const {s,saveProgress,loadData,setClient}=win.__progressTest;
s.user={id:'user-a'};s.profile={role:'student'};s.progress={done:['existing'],watched:['existing'],exams:{}};
let progressFailure=false,planFailure=false;
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

 s.ready=true;s.progress={done:['one'],watched:[],exams:{}};s.progressBase={done:[],watched:[],exams:{}};
 const first=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,1,'First progress save should begin');
 s.progress.done.push('two');
 const second=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,1,'Second save should wait for the first');
 assert.equal(uploads[0].snapshot.done.join(','),'one','Snapshot must be fixed at save time');
 uploads[0].resolve({payload:uploads[0].snapshot,updated_at:'2026-11-12T10:00:00.000Z'});
 await first;
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,2,'Second save starts after first finishes');
 assert.equal(uploads[1].snapshot.done.join(','),'one,two','Later progress must not be overwritten by old snapshot');
 assert.equal(uploads[1].base.done.join(','),'one','The second queued write must use the previous draft as its baseline');
 uploads[1].resolve({payload:uploads[1].snapshot,updated_at:'2026-11-12T10:00:00.001Z'});
 await second;

 // Regression: an unfinished completion and its immediate reset are both
 // queued. Comparing the reset with the OLD server baseline wrongly revives it.
 s.progress.done.push('three');
 const third=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,3);
 s.progress.done=s.progress.done.filter(id=>id!=='three');
 const reset=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,3,'Reset must wait for the pending completion');
 uploads[2].resolve({payload:uploads[2].snapshot,updated_at:'2026-11-12T10:00:00.002Z'});
 await third;
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,4);
 assert.equal(uploads[3].base.done.join(','),'one,two,three','Reset must remove the pending completion from its actual baseline');
 assert.equal(uploads[3].snapshot.done.join(','),'one,two');
 uploads[3].resolve({payload:sync.merge(uploads[3].base,uploads[3].snapshot,uploads[2].snapshot),updated_at:'2026-11-12T10:00:00.003Z'});
 await reset;
 assert.equal(s.progress.done.join(','),'one,two','An immediate reset must persist instead of resurrecting a lesson');

 // Failed writes must be folded into the next save rather than disappearing.
 s.progress.done.push('temporary');
 const failed=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 s.progress.done.push('after-error');
 const retry=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 uploads[4].reject(new Error('Temporary network failure'));
 await assert.rejects(failed,/Temporary network failure/);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads[5].base.done.join(','),'one,two','Retry must include the earliest failed edit');
 uploads[5].resolve({payload:sync.merge(uploads[5].base,uploads[5].snapshot,uploads[3].snapshot),updated_at:'2026-11-12T10:00:00.004Z'});
 await retry;
 assert.equal(s.progress.done.join(','),'one,two,temporary,after-error');

 // A remote device can finish a lesson during this tab's save. After adopting
 // that revision, the user must also be able to reset that remote lesson.
 const refresh=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,7);
 const withRemote=sync.copy(uploads[6].snapshot);
 withRemote.done.push('remote-device');
 uploads[6].resolve({payload:withRemote,updated_at:'2026-11-12T10:00:00.005Z'});
 await refresh;
 assert(s.progress.done.includes('remote-device'),'Remote completion must be adopted');

 s.progress.done=s.progress.done.filter(id=>id!=='remote-device');
 const remoteReset=saveProgress();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(uploads.length,8);
 assert(uploads[7].base.done.includes('remote-device'),
  'A remote lesson adopted by a completed sync must be removable on the next save');
 uploads[7].resolve({payload:sync.merge(uploads[7].base,uploads[7].snapshot,withRemote),updated_at:'2026-11-12T10:00:00.006Z'});
 await remoteReset;
 assert(!s.progress.done.includes('remote-device'),'Remote completion must remain reset');

 console.log('PASS: no progress resurrection, recover failed writes and reset cross-device completions.');
})().catch(error=>{console.error(error);process.exitCode=1});
