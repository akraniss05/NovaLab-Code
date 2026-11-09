/* Registration contract for the active v21 app (no actual accounts created). */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(app,footer);
const isolated=app.replace(footer,'\nlogin=function(){};\nwindow.__registerV21Test={registerAccount,setApi(v){api=v}};\n})();');
const fakeNode=()=>({innerHTML:'',textContent:'',classList:{toggle(){},add(){},remove(){}}});
const win={LL_CONFIG:{},addEventListener(){}};
const doc={querySelector(){return fakeNode()},addEventListener(){},body:{classList:{toggle(){}}}};
const ctx={window:win,document:doc,location:{hash:'#home'},localStorage:{getItem(){return null}},console,Date,Math,Number,String,Map,Set,Intl,Promise};
vm.createContext(ctx);vm.runInContext(isolated,ctx);
const {registerAccount,setApi}=win.__registerV21Test;
let requests=0;
setApi({functions:{async invoke(name,{body}){
 assert.equal(name,'academy-register');requests++;
 assert.equal(body.email,'test@example.com');assert.equal(body.username,'testuser');
 return {data:{ok:true,requires_approval:true},error:null};
}}});
const fd=(password,confirm=password)=>new Map([
 ['email','test@example.com'],['username','testuser'],['password',password],['confirm_password',confirm]
]);
(async()=>{
 await assert.rejects(()=>registerAccount(fd('123456')),/mindestens 7 Zeichen/,'6-character password rejected');
 assert.equal(requests,0,'Invalid password must not reach server');
 await registerAccount(fd('abcdefg'));
 assert.equal(requests,1,'7-character password accepted');
 await registerAccount(fd('longer-than-fourteen-characters'));
 assert.equal(requests,2,'Long passwords allowed');
 await assert.rejects(()=>registerAccount(fd('abcdefg','xxxxxxx')),/stimmen nicht überein/);
 assert.equal(requests,2,'Mismatched confirmation rejected');
 assert.match(app,/id="reg-pass"[^>]*minlength="7"/);
 assert.doesNotMatch(app,/id="reg-pass"[^>]*maxlength="14"/);
 const edge=fs.readFileSync(path.join(__dirname,'../supabase/functions/academy-register/index.ts'),'utf8');
 assert.match(edge,/password\.length<7\|\|password\.length>256/);
 assert.doesNotMatch(edge,/password\.length<14/);
 console.log('PASS: 7-character registration, longer passwords, confirmation and server parity.');
})().catch(e=>{console.error(e);process.exitCode=1});
