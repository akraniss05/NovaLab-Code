import { z } from 'zod';
export const snowflake=z.string().regex(/^\d{17,20}$/);
const key=z.string().regex(/^[a-zA-Z0-9_-]{1,40}$/);
const roles=z.array(snowflake).max(20);
const optionalId=snowflake.or(z.literal('')).default('');
const text=(max:number)=>z.string().trim().min(1).max(max);
const https=z.url({protocol:/^https$/}).max(500).or(z.literal('')).default('');
const question=z.object({id:key,label:text(200),type:z.enum(['short','long','single','multi','yesno','number','dropdown']),required:z.boolean(),choices:z.array(text(100)).max(20).default([])}).refine(q=>!['single','multi','dropdown'].includes(q.type)||q.choices.length>0);
const category=z.object({id:key,name:text(75),enabled:z.boolean(),supportRoles:roles,requiredRole:optionalId,parentId:optionalId});
const form=z.object({id:key,name:text(75),description:z.string().max(500),enabled:z.boolean(),reviewerRoles:roles,reviewChannel:optionalId,awardRoles:roles,removeRoles:roles,questions:z.array(question).min(1).max(30),deadline:z.iso.datetime().or(z.literal('')).default(''),cooldownHours:z.number().int().min(0).max(8760).default(24)}).refine(f=>new Set(f.questions.map(q=>q.id)).size===f.questions.length);
const panel=z.object({id:key,kind:z.enum(['tickets','applications','verification','selfroles','rules','staff','news']),channelId:optionalId,title:text(200),description:text(3500),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),banner:https,thumbnail:https,footer:z.string().max(200).default(''),button:text(70),roleIds:roles,exclusive:z.boolean().default(false)});
const welcome=z.object({enabled:z.boolean(),channelId:optionalId,text:z.string().max(1500),embed:z.boolean(),banner:https,color:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1')});
export const configSchema=z.object({
 language:z.enum(['de','en']), websiteRole:optionalId, supportLimit:z.number().int().min(1).max(5),
 categories:z.array(category).max(100), forms:z.array(form).max(100), panels:z.array(panel).max(100),
 welcome, goodbye:welcome, autoRoles:roles, verificationRoles:roles, unverifiedRoles:roles,
 teamRoles:roles, logChannels:z.record(z.string(),snowflake).default({}),
 security:z.object({honeypot:optionalId,honeypotAction:z.enum(['log','delete','timeout']),exemptRoles:roles,exemptChannels:roles,words:z.array(text(70)).max(100),inviteBlock:z.boolean(),mentionLimit:z.number().int().min(0).max(20),floodLimit:z.number().int().min(0).max(30),raidJoins:z.number().int().min(0).max(100),raidMinutes:z.number().int().min(1).max(120),minAccountDays:z.number().int().min(0).max(365)})
}).superRefine((c,ctx)=>{
 for(const group of ['categories','forms','panels'] as const){
  if(new Set(c[group].map(item=>item.id)).size!==c[group].length)ctx.addIssue({code:'custom',path:[group],message:'Duplicate identifier'});
 }
 const selfAssignable=[...c.autoRoles,...c.verificationRoles,...c.panels.filter(p=>p.kind==='selfroles').flatMap(p=>p.roleIds)];
 const trusted=[c.websiteRole,...c.teamRoles,...c.categories.flatMap(c=>c.supportRoles),...c.forms.flatMap(f=>f.reviewerRoles)].filter(Boolean);
 if(selfAssignable.some(role=>trusted.includes(role)))ctx.addIssue({code:'custom',path:['websiteRole'],message:'Access and staff roles must be separate from self-assigned roles'});
});
export type Config=z.infer<typeof configSchema>;
export type Panel=Config['panels'][number];
export type Form=Config['forms'][number];
export const defaults:Config=configSchema.parse({
 language:'de',supportLimit:1,
 categories:['Allgemeiner Support','Technischer Support','Website-Support','Bug melden','Account-Probleme','Partnerschaften'].map((name,i)=>({id:'support-'+i,name,enabled:false,supportRoles:[]})),
 forms:['Supporter','Developer','Moderator','Designer','Management'].map((name,i)=>({id:'application-'+i,name,description:'NovaLab Studios',enabled:false,reviewerRoles:[],awardRoles:[],removeRoles:[],questions:[{id:'motivation',label:'Warum möchtest du ins Team?',type:'long',required:true},{id:'experience',label:'Welche Erfahrung bringst du mit?',type:'long',required:true},{id:'availability',label:'Wann hast du Zeit?',type:'short',required:true}]})),
 panels:[['tickets','Support'],['applications','Bewerbungen'],['verification','Verifizierung'],['selfroles','Interessen'],['rules','Regelwerk'],['staff','Team']].map(([kind,title])=>({id:kind,kind,title,description:'NovaLab Studios · '+title,color:'#6366f1',button:title,roleIds:[]})),
 welcome:{enabled:false,text:'Willkommen {mention} auf {server}!',embed:true},goodbye:{enabled:false,text:'{username} hat den Server verlassen.',embed:true},
 autoRoles:[],verificationRoles:[],unverifiedRoles:[],teamRoles:[],
 security:{honeypotAction:'log',exemptRoles:[],exemptChannels:[],words:[],inviteBlock:false,mentionLimit:0,floodLimit:0,raidJoins:0,raidMinutes:10,minAccountDays:0}
});
export const ticketNumber=(id:number)=>'NL-'+String(id).padStart(6,'0');
export const activeTicket=(status:string)=>!['closed','archived'].includes(status);
export function ticketChange(ticket:{status:string;assignee:string|null},action:string,actor:string,admin:boolean,target?:string){
 const {status,assignee}=ticket;
 if(action==='reopen'&&status==='closed')return {status:'open',assignee:null};
 if(action==='archive'&&status==='closed'&&admin)return {status:'archived'};
 if(!activeTicket(status))throw Error('Ticket closed');
 if(action==='claim'&&!assignee)return {status:'working',assignee:actor};
 if(action==='close')return {status:'closed'};
 if(assignee!==actor&&!admin)throw Error('Only the current assignee can perform this action');
 if(action==='transfer'&&target)return {status:'working',assignee:target};
 if(action==='unclaim')return {status:'open',assignee:null};
 if(['waiting_user','waiting_support','escalated'].includes(action))return {status:action};
 throw Error('Invalid ticket action');
}
export function answersFor(form:Form,answers:Record<string,unknown>){
 return Object.fromEntries(form.questions.map(q=>{
  const input=answers[q.id];
  if(input===undefined||input===''||Array.isArray(input)&&!input.length){
   if(q.required)throw Error(q.label);
   return [q.id,null];
  }
  const valid=q.type==='multi'?Array.isArray(input)&&input.length<=q.choices.length&&new Set(input).size===input.length&&input.every(x=>q.choices.includes(x)):
   q.type==='number'?typeof input==='number'&&Number.isFinite(input):
   q.type==='yesno'?typeof input==='boolean':
   typeof input==='string'&&(q.type==='short'?input.trim().length>0&&input.length<=250:q.type==='long'?input.trim().length>0&&input.length<=3000:q.choices.includes(input));
  if(!valid)throw Error(q.label);
  return [q.id,input];
 }));
}
export const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
