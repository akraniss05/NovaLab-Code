/* LiveryLab account-synced learning drafts · regression tests */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../site/academy-learning-sync.js'),'utf8');
const rows=new Map(),storage=new Map(),events={};
const user={id:'alice'},state={user,ready:true},window={location:{hash:'#lesson/lua-01'}};
const client={
 from(table){
  assert.equal(table,'academy_code_drafts');
  const filters={};
  const builder={
   select(){return this;},
   eq(key,value){filters[key]=value;return this;},
   maybeSingle(){return Promise.resolve({data:rows.get(filters.user_id+':'+filters.lesson_id)||null,error:null});},
   upsert(value){rows.set(value.user_id+':'+value.lesson_id,{...value});return Promise.resolve({error:null});},
   delete(){return {...builder,then(onDone,onError){
    rows.delete(filters.user_id+':'+filters.lesson_id);
    return Promise.resolve({error:null}).then(onDone,onError);
   }};}
  };return builder;
 }
};
const doc={
 addEventListener(name,cb){events[name]=cb;},
 querySelector(){return null;},
 querySelectorAll(){return[];}
};
const sandbox={
 window,document:doc,localStorage:{
 getItem(key){return storage.has(key)?storage.get(key):null;},
 setItem(key,value){storage.set(key,String(value));},
 removeItem(key){storage.delete(key);}
 },setTimeout,clearTimeout,Intl,Date,Map,Set,Math,Number,String,Promise
};
vm.runInNewContext(source,sandbox,{filename:'academy-learning-sync.js'});
const sync=window.LLLearning;
const tracked=[];
sync.attach({state:()=>state,client:()=>client,notice:()=>{},onStep:(id,step)=>tracked.push([id,step])});
(async()=>{
 storage.set('liverylab-draft-lua-01','print("from old editor")');
 const first=await sync.load('lua-01');
 assert.equal(first.content,'print("from old editor")');
 assert.equal(first.step,1);
 assert.equal(await sync.flush('lua-01'),true);
 assert.equal(rows.get('alice:lua-01').content,'print("from old editor")','legacy draft migrated to Supabase');
 sync.queue('lua-01','print("Cloud")',3);
 await sync.flush('lua-01');
 sync.mark('lua-01',4);
 await sync.flush('lua-01');
 assert.equal(rows.get('alice:lua-01').content,'print("Cloud")');
 assert.equal(rows.get('alice:lua-01').step,4);
 assert.equal(tracked[0][1],4);
 const restored=await sync.load('lua-01');
 assert.equal(restored.content,'print("Cloud")');
 assert.equal(restored.step,4);
 assert.match(sync.stepBar(4,true,true,false,false),/data-learning-step="5"/,'five separate stages are present');
 assert.match(sync.stepBar(4,true,true,false,false),/is-current/);
 sync.queue('lua-02','print("second lesson")',2);
 await sync.flush('lua-02');
 await sync.remove('lua-01');
 assert.equal(rows.has('alice:lua-01'),false,'reset removes current lesson draft');
 assert.equal(rows.has('alice:lua-02'),true,'reset preserves other lesson');
 sync.clear();
 user.id='bob';sync.attach({state:()=>state,client:()=>client,notice:()=>{}});
 const otherUser=await sync.load('lua-01');
 assert.equal(otherUser.content,'','another user cannot see the old-device legacy draft');
 assert.equal(rows.has('bob:lua-01'),false,'loading does not create content for another account');
 sync.clear();
 console.log('PASS: cloud autosave, legacy import, step resume, per-lesson reset and account separation.');
})().catch(err=>{sync.clear();console.error(err);process.exitCode=1;});
