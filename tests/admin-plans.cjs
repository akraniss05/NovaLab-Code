/* LiveryLab protected subscription administration regression.
   Uses an in-memory Supabase mock. Never writes production accounts. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const edgeSource=fs.readFileSync(path.join(__dirname,'../supabase/functions/admin-users/index.ts'),'utf8');
const javascript=edgeSource
 .replace(/^import \{ createClient \} from 'npm:@supabase\/supabase-js@2(?:\\.\\d+)*';\\s*/m,'')
 .replace('const headers: Record<string,string> =','const headers =')
 .replace('const reply=(status:number,data:unknown)=>','const reply=(status,data)=>')
 .replace('const env=(n:string)=>','const env=(n)=>')
 .replace('const isUUID=(v:unknown)=>','const isUUID=(v)=>')
 .replace('Deno.serve(async(req:Request)=>','Deno.serve(async(req)=>')
 .replace('(factor:{status?:string})','(factor)')
 .replace('let body:Record<string,unknown>;','let body;')
 .replace('(x:{user_id:string})','(x)')
 .replace('let expiresAt:string|null=','let expiresAt=')
 .replaceAll('expiresAt!','expiresAt')
 .replace('plan_expires_at:null as string|null','plan_expires_at:null')
 .replace('const allLessons:Array<{id:string,course_id:string,title:string,chapter:string,position:number}>=[];','const allLessons=[];')
 .replace('const lessonGroups=new Map<string,typeof allLessons>();','const lessonGroups=new Map();')
 .replace('const validIds=new Set<string>();','const validIds=new Set();')
 .replace('(value:unknown):value is string=>','(value)=>')
 .replace('lessonGroups.get(lesson.course_id)!.push(lesson);','lessonGroups.get(lesson.course_id).push(lesson);');

const ADMIN='11111111-1111-4111-8111-111111111111';
const STUDENT='22222222-2222-4222-8222-222222222222';
const OWNER='33333333-3333-4333-8333-333333333333';
const day=86400000;
const plans=new Map([[STUDENT,{user_id:STUDENT,tier:'pro',expires_at:new Date(Date.now()+30*day).toISOString()}]]);
const profiles=new Map([
 [ADMIN,{id:ADMIN,role:'admin',active:true,access_status:'approved',needs_password_change:false,username:'staff'}],
 [STUDENT,{id:STUDENT,role:'student',active:true,access_status:'approved',username:'learner'}],
 [OWNER,{id:OWNER,role:'admin',active:true,access_status:'approved',username:'owner'}]
]);
const owners=new Set([OWNER]);
const apiUsers=[...profiles.values()].map(p=>({id:p.id,email:p.username+'@example.com',email_confirmed_at:new Date().toISOString(),app_metadata:{},created_at:new Date().toISOString()}));

function recordSet(table){
 if(table==='academy_profiles')return [...profiles.values()];
 if(table==='academy_plans')return [...plans.values()];
 if(table==='academy_owner_ids')return [...owners].map(user_id=>({user_id}));
 throw Error('Unexpected mocked table '+table);
}
function from(table){
 const filters={};let included=null;
 const builder={
  select(){return this;},
  eq(field,value){filters[field]=value;return this;},
  in(field,values){included={field,values};return this;},
  async maybeSingle(){return {data:matching()[0]||null,error:null};},
  async single(){const data=matching()[0];return {data:data||null,error:data?null:{message:'Not found'}};},
  async upsert(values){
   assert.equal(table,'academy_plans','Only subscription upsert is expected');
   plans.set(values.user_id,{...values});
   return {data:null,error:null};
  },
  then(resolve,reject){return Promise.resolve({data:matching(),error:null}).then(resolve,reject);}
 };
 function matching(){return recordSet(table).filter(x=>
  Object.entries(filters).every(([key,val])=>x[key]===val)&&
  (!included||included.values.includes(x[included.field])));}
 return builder;
}
const backend={
 auth:{admin:{
  mfa:{listFactors:async()=>({data:{factors:[]},error:null})},
  listUsers:async()=>({data:{users:apiUsers},error:null})
 }},
 from
};
const publicClient={auth:{getUser:async()=>({data:{user:{id:ADMIN}},error:null})}};
let handle=null;
const fakeDeno={
 env:{get(name){return {SUPABASE_URL:'https://fake.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public-test-key',SUPABASE_SERVICE_ROLE_KEY:'service-only-test-key'}[name]||null;}},
 serve(cb){handle=cb;}
};
const createClient=(_url,key)=>key==='public-test-key'?publicClient:backend;
new Function('Deno','createClient','Response','console',javascript)(fakeDeno,createClient,Response,console);
assert.equal(typeof handle,'function','Edge Function handler is registered');

async function call(body,{origin='https://akraniss05.github.io'}={}){
 const req=new Request('https://fake.supabase.co/functions/v1/admin-users',{
  method:'POST',headers:{'Authorization':'Bearer fake-token','Origin':origin,'Content-Type':'application/json'},
  body:JSON.stringify(body)
 });
 const response=await handle(req);return {status:response.status,data:await response.json()};
}
const roughly=(actual,expected,tolerance=30000)=>Math.abs(actual-expected)<=tolerance;
(async()=>{
 const original=Date.parse(plans.get(STUDENT).expires_at);
 let x=await call({action:'list',page:1});
 assert.equal(x.status,200,'Authenticated admin can view member list');
 const found=x.data.users.find(u=>u.id===STUDENT);
 assert.equal(found.plan_tier,'pro');
 assert.equal(found.plan_expires_at,plans.get(STUDENT).expires_at,'Expiry is retrieved by secure backend');

 x=await call({action:'adjustPlan',userId:STUDENT,operation:'extend',days:7});
 assert.equal(x.status,200,JSON.stringify(x.data));
 assert.equal(Date.parse(plans.get(STUDENT).expires_at),original+7*day,'Extending adds exactly seven days');

 x=await call({action:'adjustPlan',userId:STUDENT,operation:'reduce',days:3});
 assert.equal(x.status,200);
 assert.equal(Date.parse(plans.get(STUDENT).expires_at),original+4*day,'Reducing subtracts exact days');

 x=await call({action:'setTier',userId:STUDENT,tier:'ultimate'});
 assert.equal(x.status,200);
 assert.equal(Date.parse(plans.get(STUDENT).expires_at),original+4*day,'Switching paid tiers preserves expiry');

 x=await call({action:'adjustPlan',userId:STUDENT,operation:'reduce',days:0});
 assert.equal(x.status,400,'Zero days rejected');
 x=await call({action:'adjustPlan',userId:STUDENT,operation:'extend',days:3651});
 assert.equal(x.status,400,'Excessive duration rejected');

 profiles.get(ADMIN).role='student';
 x=await call({action:'adjustPlan',userId:STUDENT,operation:'end'});
 assert.equal(x.status,403,'A normal student cannot manage another account');
 profiles.get(ADMIN).role='admin';

 x=await call({action:'adjustPlan',userId:OWNER,operation:'end'});
 assert.equal(x.status,400,'Original owner is protected');
 x=await call({action:'adjustPlan',userId:ADMIN,operation:'end'});
 assert.equal(x.status,400,'Caller cannot modify own admin plan');

 x=await call({action:'adjustPlan',userId:STUDENT,operation:'end'},{origin:'https://untrusted.example.com'});
 assert.equal(x.status,403,'Requests from other origins rejected');

 x=await call({action:'adjustPlan',userId:STUDENT,operation:'end'});
 assert.equal(x.status,200);
 assert.equal(plans.get(STUDENT).tier,'free','End immediately resets the membership to Free');

 x=await call({action:'setTier',userId:STUDENT,tier:'pro'});
 assert.equal(x.status,200);
 assert.ok(roughly(Date.parse(plans.get(STUDENT).expires_at),Date.now()+30*day),'New paid grant is 30 days');

 plans.set(STUDENT,{user_id:STUDENT,tier:'ultimate',expires_at:null});
 x=await call({action:'adjustPlan',userId:STUDENT,operation:'reduce',days:5});
 assert.equal(x.status,409,'Cannot subtract from unbounded time');
 x=await call({action:'adjustPlan',userId:STUDENT,operation:'set',days:15});
 assert.equal(x.status,200);
 assert.ok(roughly(Date.parse(plans.get(STUDENT).expires_at),Date.now()+15*day),'Can set finite time on an unlimited plan');

 x=await call({action:'adjustPlan',userId:STUDENT,operation:'reduce',days:45});
 assert.equal(x.status,200);
 assert.equal(plans.get(STUDENT).tier,'free','Reducing past zero ends subscription');

 console.log('PASS: protected subscription listing, exact day arithmetic, paid-tier preservation, expiry, permanent duration and admin authorization.');
})().catch(e=>{console.error(e);process.exitCode=1;});
