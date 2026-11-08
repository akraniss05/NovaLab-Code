/* Support ticket submit regression: real app handler with mock Supabase, no user data written. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(source,footer);
const transformed=source.replace(footer,'\nwindow.__supportTest={s,supportPage,setApi(v){api=v}};\n})();');
const events={};const nodes=new Map();
const classes=()=>({toggle(){},add(){},remove(){},contains(){return false}});
const node=()=>({innerHTML:'',textContent:'',value:'',disabled:false,isConnected:true,classList:classes(),querySelector(){return null},setAttribute(){},removeAttribute(){},replaceChildren(){}});
for(const name of ['#content','#sidebar','#bottom-nav','#toast','#focus-header','#focus-clock','#timer-portal','#streak-portal','#support-submit-status'])nodes.set(name,node());
const button=node();button.textContent='Anfrage senden →';
const form={dataset:{form:'support-ticket'},fields:{category:'bug',message:'Der Code-Editor zeigt bei der Übung einen Fehler.',tier:null},
 querySelector(selector){return selector==='button[type="submit"]'?button:null}};
const document={body:{classList:classes()},querySelector(s){return nodes.get(s)||null},querySelectorAll(){return []},addEventListener(type,listener){events[type]=listener;}};
const fakeWindow={LL_CONFIG:{},addEventListener(){},setInterval(){}};
const sandbox={window:fakeWindow,document,location:{hash:'#support'},localStorage:{getItem(){return null},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null}},Date,Math,Number,String,Promise,Intl,Map,Set,console,FormData:class{constructor(form){this.f=form}get(name){return this.f.fields[name]??null}},setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},confirm(){return true}};
vm.createContext(sandbox);
vm.runInContext(transformed,sandbox,{filename:'academy-v21.js'});
const app=fakeWindow.__supportTest;
app.s.ready=true;app.s.user={id:'00000000-0000-4000-8000-000000000001'};
app.s.profile={id:app.s.user.id,display_name:'Testkonto',username:'tester',role:'student',active:true};
app.s.tier='free';app.s.courses=[];app.s.lessons=[];
app.s.service={beta_open:true,mine:[],admin:[]};
const ID='11111111-1111-4111-8111-111111111111';
let creates=0;let simulateFailure=false;
app.setApi({rpc:async(name,args)=>{
 assert.equal(name,'academy_service');
 if(args.p_action==='create'){
  creates++;
  if(simulateFailure)return {data:null,error:{message:'Zu viele Support-Anfragen'}};
  return {data:{ok:true,id:ID},error:null};
 }
 if(args.p_action==='list')return {data:null,error:{message:'Temporärer Fehler beim Laden'}};
 throw Error('Unexpected support action '+args.p_action);
}});
async function submit(){
 let prevented=false;
 const target={closest(selector){return selector==='form[data-form]'?form:null}};
 await events.submit({target,preventDefault(){prevented=true;}});
 assert.equal(prevented,true,'Support form must not trigger a browser navigation');
}
(async()=>{
 assert.match(app.supportPage(),/data-form="support-ticket"/);
 await submit();
 assert.equal(creates,1,'Ticket creation must run exactly once');
 assert.equal(app.s.lastSupportReceipt,ID,'Successful ticket ID confirmed from database');
 assert.equal(app.s.service.mine.length,1,'Sent ticket remains visible even if inbox refresh failed');
 assert.equal(app.s.service.mine[0].message,form.fields.message);
 assert.match(nodes.get('#content').innerHTML,/11111111/,'Support page confirms ticket receipt');
 assert.equal(button.disabled,false,'Send button reenabled after success');
 simulateFailure=true;
 form.fields.message='Noch ein technisches Problem nach dem ersten Ticket.';
 await submit();
 assert.equal(creates,2,'Second ticket submission is possible');
 assert.equal(app.s.service.mine.length,1,'Failed request must not fabricate a new ticket');
 assert.match(nodes.get('#support-submit-status').textContent,/nicht bestätigt/,'Server failure is shown inline');
 assert.equal(button.disabled,false,'Send button reenabled after server error');
 assert.equal(form.fields.message,'Noch ein technisches Problem nach dem ersten Ticket.','Unsent message remains in the textarea');
 console.log('PASS: backend-confirmed support receipt, resilient inbox, server rejection and repeat submission.');
})().catch(e=>{console.error(e);process.exitCode=1;});
