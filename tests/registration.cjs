/* LiveryLab v16: registration fallback without public Auth signups. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../site/academy.js'),'utf8');
const expose="\nwindow.__registerTest={s,registerAccount,setApi(value){api=value}};\n})();";
assert.match(code,/\ninit\(\);\n\}\)\(\);\s*$/);
const source=code.replace(/\ninit\(\);\n\}\)\(\);\s*$/,expose);
const nodes=new Map();
const fake=()=>({innerHTML:'',textContent:'',classList:{toggle(){},add(){},remove(){},contains(){return false}}});
const dom={querySelector(q){if(!nodes.has(q))nodes.set(q,fake());return nodes.get(q)},querySelectorAll(){return []},addEventListener(){},body:{classList:{toggle(){}}}};
const box={window:{LL_CONFIG:{},addEventListener(){}},document:dom,location:{hash:'#home'},
localStorage:{getItem(){return null},setItem(){}},console,confirm(){return true}};
vm.createContext(box);vm.runInContext(source,box,{filename:'academy.js'});
const {s,registerAccount,setApi}=box.window.__registerTest;
const fd=new Map([
 ['email','test@example.com'],['username','LiveryTest'],['password','test-password-16-characters'],
 ['confirm_password','test-password-16-characters']
]);
(async()=>{
 let log=[];
 setApi({auth:{async signUp(){log.push('signup');return {error:{code:'signup_disabled',message:'Signups not allowed for this instance'}};}},
 functions:{async invoke(name,{body}){log.push('fallback');assert.equal(name,'academy-register');
 assert.equal(body.username,'liverytest');assert.equal(body.email,'test@example.com');
 assert.equal(body.password,fd.get('password'));return {data:{ok:true,requires_approval:true,email_ownership_verified:false},error:null};}}});
 await registerAccount(fd);
 assert.deepEqual(log,['signup','fallback'],'Fallback must occur only after signup-disabled response');
 assert.equal(s.registrationManual,true);
 assert.equal(s.authScreen,'sent');
 assert.ok(nodes.get('#content').innerHTML.includes('Registrierungsanfrage ist eingegangen'));
 log=[];
 s.authScreen='register';
 setApi({auth:{async signUp(){log.push('signup');return {error:null,data:{session:null}};}},
 functions:{async invoke(){log.push('fallback');throw Error('Fallback must not run for normal signup');}}});
 await registerAccount(fd);
 assert.deepEqual(log,['signup'],'Standard registration must preserve Supabase verification');
 assert.equal(s.registrationManual,false);
 assert.equal(s.authScreen,'sent');
 log=[];
 setApi({auth:{async signUp(){log.push('signup');return {error:{code:'email_address_invalid',message:'Invalid email'}};}},
 functions:{async invoke(){log.push('fallback');throw Error('Fallback used for non-disabled signup error');}}});
 await assert.rejects(()=>registerAccount(fd),e=>String(e?.message||e)==='Invalid email');
 assert.deepEqual(log,['signup'],'Other errors should remain errors');
 const server=fs.readFileSync(path.join(__dirname,'../supabase/functions/academy-register/index.ts'),'utf8');
 for(const token of ["email_confirm:true","access_status!=='pending'","academy_signup_rate_limit","academy_signup_flow:autoApprove?'self_service':'manual_request'","allowedOrigins","requires_approval:true"])
 assert(server.includes(token),'Missing safe registration server behavior: '+token);
 const admin=fs.readFileSync(path.join(__dirname,'../supabase/functions/admin-users/index.ts'),'utf8');
 assert(admin.includes("manualEmailReview"),'Admin must require deliberate review for unverified email');
 console.log('Legacy signup behavior and server-side registration approval-mode safeguards passed');
})().catch(err=>{console.error(err);process.exitCode=1;});