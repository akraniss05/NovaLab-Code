/* Two-way support ticket regression using the actual Academy click/submit handlers.
 * In-memory RPC mocks only. Never creates or changes a production ticket.
 */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const appCode=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(appCode,footer);
const source=appCode.replace(footer,'\nwindow.__chatTest={s,supportPage,adminPage,ticketChatPanel,loadTicketThread,refreshService,setApi(v){api=v}};\n})();');
const events={};
const node=()=>({innerHTML:'',textContent:'',value:'',disabled:false,isConnected:true,
 classList:{add(){},remove(){},toggle(){},contains(){return false}},
 querySelector(){return null},setAttribute(){},replaceChildren(){},scrollIntoView(){}});
const nodes=new Map();
for(const id of ['#content','#sidebar','#bottom-nav','#toast','#focus-header','#focus-clock','#timer-portal','#streak-portal','#academy-chat-panel'])nodes.set(id,node());
const doc={hidden:false,body:{classList:{toggle(){},add(){},remove(){}}},activeElement:null,
 querySelector(q){return nodes.get(q)||null},querySelectorAll(){return[]},addEventListener(name,fn){events[name]=fn;}};
const win={LL_CONFIG:{},addEventListener(){}};
const context={window:win,document:doc,location:{hash:'#support'},
 localStorage:{getItem(){return null},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null}},
 setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},
 Math,Date,Number,String,Promise,Intl,Map,Set,console,confirm(){return true},
 FormData:class{constructor(form){this.form=form}get(name){return this.form.fields[name]??null}}};
vm.createContext(context);vm.runInContext(source,context,{filename:'academy-v21.js'});
const app=win.__chatTest,ID='11111111-1111-4111-8111-111111111111';
const memberId='22222222-2222-4222-8222-222222222222';
app.s.ready=true;app.s.user={id:memberId,email:'test@example.com'};
app.s.profile={role:'student',username:'testuser',active:true,display_name:'Test member'};
app.s.courses=[];app.s.lessons=[];app.s.xpAwards=[];
app.s.progress={done:[],watched:[],exams:{}};
const ticket={id:ID,category:'support',tier:null,status:'open',message:'Please help with my lesson.',
 username:'testuser',created_at:'2026-11-08T10:00:00Z',updated_at:'2026-11-08T10:00:00Z'};
app.s.service={beta_open:true,mine:[ticket],admin:[ticket]};
let messages=[{id:'a',role:'member',body:ticket.message,at:ticket.created_at}];
let chatCalls=0,sendCalls=0;
app.setApi({rpc:async(name,args)=>{
 if(name==='academy_service'&&args.p_action==='list')return {data:app.s.service,error:null};
 if(name!=='academy_ticket_chat')throw Error('Unexpected RPC '+name);
 chatCalls++;
 assert.equal(args.p_ticket,ID);
 if(args.p_action==='thread')return {data:{ok:true,messages,status:ticket.status},error:null};
 if(args.p_action==='send'){
  sendCalls++;
  assert.ok(args.p_body.length>0&&args.p_body.length<=2000);
  const msg={id:'new-'+sendCalls,role:app.s.profile.role==='admin'?'admin':'member',body:args.p_body,at:'2026-11-08T11:00:00Z'};
  messages=[...messages,msg];return {data:{ok:true,sent_id:msg.id,messages,status:'answered'},error:null};
 }
 throw Error('Unknown chat operation');
}});
const opener={dataset:{chatOpen:ID},disabled:false};
const clickTarget={closest(selector){return selector==='[data-chat-open]'?opener:null},id:''};
async function open(){await events.click({target:clickTarget});}
function submitForm(type,fields){
 const button=node();
 const form={dataset:{form:type,ticketId:ID},fields,querySelector(selector){return selector==='button[type="submit"]'?button:null}};
 const target={closest(selector){return selector==='form[data-form]'?form:null}};
 return events.submit({target,preventDefault(){}});
}
(async()=>{
 assert.match(app.supportPage(),/data-chat-open/,'Members can open ticket chats');
 await open();
 assert.equal(app.s.chatTicketId,ID,'Opening loads the exact ticket');
 assert.equal(app.s.chatMessages.length,1,'Message history loads');
 assert.match(app.ticketChatPanel(false),/Please help with my lesson/,'Original request remains in the history');
 await submitForm('ticket-chat',{body:'I tried again; the exercise still shows an error.'});
 assert.equal(sendCalls,1,'Member reply is saved by the chat RPC exactly once');
 assert.equal(app.s.chatMessages.length,2);
 assert.match(app.ticketChatPanel(false),/I tried again/,'Member sees the new message in their thread');
 app.s.profile.role='admin';context.location.hash='#admin/support';
 assert.match(app.adminPage(),/ll-admin-ticket-list/,'Admin has dedicated support inbox');
 assert.match(app.adminPage(),/data-chat-open/,'Admin can open member ticket');
 await submitForm('ticket-chat',{body:'Thanks! We are checking your lesson now.'});
 assert.equal(sendCalls,2,'Admin reply is saved by the same secure RPC');
 assert.match(app.ticketChatPanel(true),/LiveryLab Team/,'Replies are labeled as the support team');
 assert.match(app.ticketChatPanel(true),/Thanks! We are checking/,'Admin sees full chat history');
 context.location.hash='#admin/members';
 assert.match(app.adminPage(),/ll-admin-tabs/,'Separate members navigation exists');
 assert.match(app.adminPage(),/ll-member-summary|Registrierungsanfragen/,'Members area renders');
 context.location.hash='#admin';
 assert.match(app.adminPage(),/ll-admin-hub/,'Dashboard hides bulky user list');
 assert.ok(chatCalls>=3);
 // A failed inbox request must show the real error, not a false empty inbox.
 context.location.hash='#admin/support';
 app.setApi({rpc:async()=>({data:null,error:{message:'Abruf derzeit fehlgeschlagen'}})});
 await assert.rejects(()=>app.refreshService(),e=>e?.message==='Abruf derzeit fehlgeschlagen');
 assert.match(app.adminPage(),/Posteingang nicht vollständig geladen/);
 app.setApi({rpc:async(name)=>name==='academy_service'
  ?{data:{beta_open:true,mine:[],admin:[ticket]},error:null}
  :{data:null,error:{message:'unexpected'}}});
 await app.refreshService();
 assert.equal(app.s.serviceError,'','A successful reload must clear the visible error');
 assert.match(app.adminPage(),/data-chat-open/,'An existing admin ticket reappears after reloading');
 const sql=fs.readFileSync(path.join(__dirname,'../supabase/data/v49_support_conversations.sql'),'utf8');
 for(const token of ['academy_private.is_active()','academy_private.is_admin()',
  "ticket.user_id<>who","PRIMARY KEY","REVOKE ALL","ON DELETE CASCADE","status IN ('answered','closed','rejected')"]){
  assert.ok(sql.includes(token),'Missing security/protection: '+token);
 }
 console.log('PASS: member and admin two-way conversations, persisted history, compact account administration and secure RPC.');
})().catch(e=>{console.error(e);process.exitCode=1;});

// SQL regression: the function's rowtype variable must never shadow a FROM alias.
const inboxFix=fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261109_v69_support_inbox_alias_fix.sql'),'utf8');
assert.match(inboxFix,/academy_tickets ticket_row join public\.academy_profiles/);
assert.doesNotMatch(inboxFix,/academy_tickets t join public\.academy_profiles/);
