/* Conflict-safe progress sync: two active devices, deletion, reinsertion, history. */
'use strict';
const assert=require('node:assert/strict');
const {LLProgressSync:sync}=require('../site/academy-progress-sync.js');
const equal=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
equal(sync.merge({done:['A']},{done:['A','B']},{done:['A','C']}),{done:['A','C','B']});
equal(sync.merge({done:['A'],watched:['A']},{done:[],watched:[]},{done:['A','B'],watched:['A','B']}),{done:['B'],watched:['B']});
equal(sync.merge({exams:{one:1}},{exams:{one:1,two:2}},{exams:{one:1,three:3}}),{exams:{one:1,three:3,two:2}});
equal(sync.merge({completedAt:{A:'old'}},{completedAt:{}},{completedAt:{A:'old',B:'new'}}),{completedAt:{B:'new'}});
equal(sync.merge({lastLesson:{id:'A',at:'2026-01-01T10:00:00Z'}},{lastLesson:{id:'B',at:'2026-01-01T10:03:00Z'}},{lastLesson:{id:'C',at:'2026-01-01T10:06:00Z'}}),{lastLesson:{id:'C',at:'2026-01-01T10:06:00Z'}});

const database=new Map(),clone=v=>JSON.parse(JSON.stringify(v));
function api(){
 return {from(table){
  assert.equal(table,'academy_progress');
  const query={fields:{},op:'read',value:null,
   select(){return this},
   eq(key,value){this.fields[key]=value;return this},
   update(value){this.op='update';this.value=value;return this},
   insert(value){this.op='insert';this.value=value;return this},
   async maybeSingle(){return this.execute()},
   async single(){return this.execute()},
   async execute(){
    await Promise.resolve(); // Let concurrent writes interleave their reads and CAS updates.
    const id=this.fields.user_id||this.value?.user_id, key=this.fields.key||this.value?.key,entry=database.get(id+':'+key);
    if(this.op==='read')return {data:entry?clone(entry):null,error:null};
    if(this.op==='insert'){
     if(entry)return {data:null,error:{code:'23505',message:'Unique constraint'}};
     const saved=clone({payload:this.value.payload,updated_at:this.value.updated_at});
     database.set(id+':'+key,saved);
     return {data:clone(saved),error:null};
    }
    if(!entry||entry.updated_at!==this.fields.updated_at)return {data:null,error:null};
    const saved=clone({payload:this.value.payload,updated_at:this.value.updated_at});
    database.set(id+':'+key,saved);
    return {data:clone(saved),error:null};
   }
  };
  return query;
 }};
}
const client=api();
(async()=>{
 const a=sync.save(client,'student-1','liverylab-v10',{}, {done:['A'],watched:['A']});
 const b=sync.save(client,'student-1','liverylab-v10',{}, {done:['B'],watched:['B']});
 await Promise.all([a,b]);
 let row=database.get('student-1:liverylab-v10');
 assert.deepEqual([...row.payload.done].sort(),['A','B']);
 assert.deepEqual([...row.payload.watched].sort(),['A','B']);
 const baseline=clone(row.payload);
 const x=sync.save(client,'student-1','liverylab-v10',baseline,{done:['B'],watched:['B']});
 const y=sync.save(client,'student-1','liverylab-v10',baseline,{done:['A','B','C'],watched:['A','B','C']});
 await Promise.all([x,y]);
 row=database.get('student-1:liverylab-v10');
 assert.deepEqual([...row.payload.done].sort(),['B','C'],'Reset removes only the one erased lesson and keeps the concurrent new one.');
 assert.deepEqual([...row.payload.watched].sort(),['B','C']);
 await sync.save(client,'student-2','liverylab-v10',{}, {done:['D']});
 assert.deepEqual(database.get('student-2:liverylab-v10').payload.done,['D']);
 assert.deepEqual([...database.get('student-1:liverylab-v10').payload.done].sort(),['B','C']);
 database.set('student-3:liverylab-v10',{payload:[],updated_at:new Date().toISOString()});
 await assert.rejects(sync.save(client,'student-3','liverylab-v10',{}, {done:['A']}),/Ungültiger Fortschritt/);
 console.log('PASS: parallel tabs merge independent updates, preserve reset deletions, isolate users and reject malformed progress.');
})().catch(error=>{console.error(error);process.exitCode=1});
