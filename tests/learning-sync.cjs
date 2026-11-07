/* LiveryLab Academy v43: per-browser and per-account lesson draft checks. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../site/academy-learning-sync.js'),'utf8');
const rows=new Map(),storage=new Map(),events={};
const user={id:'alice'},state={user,ready:true},window={location:{hash:'#lesson/lua-01'}};
let cloudReads=0,cloudWrites=0;
const client={
 from(table){
  assert.equal(table,'academy_code_drafts');
  const filters={};
  const builder={
   select(){return this;},
   eq(key,value){filters[key]=value;return this;},
   maybeSingle(){cloudReads++;return Promise.resolve({data:rows.get(filters.user_id+':'+filters.lesson_id)||null,error:null});},
   upsert(){cloudWrites++;throw Error('New drafts must NEVER be uploaded');},
   delete(){cloudWrites++;throw Error('Local reset must not access cloud draft storage');}
  };return builder;
 }
};
const doc={
 addEventListener(name,cb){events[name]=cb;},
 querySelector(){return null;},
 querySelectorAll(){return[];}
};
const sandbox={
 window,document:doc,
 localStorage:{
  getItem(key){return storage.has(key)?storage.get(key):null;},
  setItem(key,value){storage.set(key,String(value));},
  removeItem(key){storage.delete(key);}
 },setTimeout,clearTimeout,Intl,Date,Map,Set,Math,Number,String,Promise
};
vm.runInNewContext(source,sandbox,{filename:'academy-learning-sync.js'});
const local=window.LLLearning,tracked=[];
local.attach({state:()=>state,client:()=>client,notice:()=>{},onStep:(id,step)=>tracked.push([id,step])});
(async()=>{
 // Import a legacy draft for its original user only.
 storage.set('liverylab-draft-lua-01','print("from old editor")');
 let first=await local.load('lua-01');
 assert.equal(first.content,'print("from old editor")');
 assert.equal(first.step,1);
 assert.equal(storage.get('liverylab-draft-alice-lua-01'),first.content);
 assert.equal(cloudWrites,0,'Importing legacy drafts does not send to Supabase');

 local.queue('lua-01','print("saved only on Alice device")',3);
 assert.equal(storage.get('liverylab-draft-alice-lua-01'),'print("saved only on Alice device")');
 assert.equal(storage.get('liverylab-draft-step-alice-lua-01'),'3');
 assert.equal(await local.flush('lua-01'),true);
 local.mark('lua-01',4);
 assert.equal(storage.get('liverylab-draft-step-alice-lua-01'),'4');
 assert.equal(tracked.at(-1)[1],4);
 assert.equal(cloudWrites,0,'Marking steps never writes cloud drafts');
 let restored=await local.load('lua-01');
 assert.equal(restored.content,'print("saved only on Alice device")');
 assert.equal(restored.step,4);
 assert.match(local.stepBar(4,true,true,false,false),/data-learning-step="5"/);
 assert.match(local.stepBar(4,true,true,false,false),/is-current/);

 // Old cloud drafts are imported once, only if there is no local copy.
 rows.set('alice:lua-99',{content:'print("old cloud backup")',step:2});
 first=await local.load('lua-99');
 assert.equal(first.content,'print("old cloud backup")');
 assert.equal(storage.get('liverylab-draft-alice-lua-99'),first.content);
 const readsAfterImport=cloudReads;
 local.queue('lua-99','print("new local only")',5);
 assert.equal(rows.get('alice:lua-99').content,'print("old cloud backup")','Cloud data is never overwritten');
 assert.equal((await local.load('lua-99')).content,'print("new local only")');
 assert.equal(cloudReads,readsAfterImport,'Local drafts no longer trigger cloud reads');

 // Reset only one draft, and do not resurrect a previous cloud backup.
 local.queue('lua-02','print("second lesson")',2);
 await local.remove('lua-99');
 assert.equal((await local.load('lua-99')).content,'','Deleted local draft is not imported again');
 assert.equal(storage.get('liverylab-draft-alice-lua-02'),'print("second lesson")','Reset preserves other lessons');
 assert.equal(cloudWrites,0);

 // Changing accounts in the same browser never exposes the previous user’s draft.
 local.clear();user.id='bob';local.attach({state:()=>state,client:()=>client,notice:()=>{}});
 const otherUser=await local.load('lua-01');
 assert.equal(otherUser.content,'','Bob must not see Alice’s local or legacy draft');
 local.queue('lua-01','print("Bob owns this")',1);
 assert.equal(storage.get('liverylab-draft-bob-lua-01'),'print("Bob owns this")');
 user.id='alice';
 const recovered=await local.load('lua-01');
 assert.equal(recovered.content,'print("saved only on Alice device")','Alice retrieves her own draft');

 local.clear();
 console.log('PASS: browser-only lesson drafts, one-time cloud import, account isolation, local resume and per-lesson reset.');
})().catch(err=>{local.clear();console.error(err);process.exitCode=1;});
