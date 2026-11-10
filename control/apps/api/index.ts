import Fastify, {type FastifyRequest} from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import staticFiles from '@fastify/static';
import {fileURLToPath} from 'node:url';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {Routes, ChannelType, type APIGuildChannel, type GuildChannelType} from 'discord.js';
import {env} from '../../packages/config/env.ts';
import {db} from '../../packages/database/db.ts';
import {Failure,actOnTicket,lock,openTicket,settings,writeMessage} from '../../packages/database/service.ts';
import {discord,identity,member} from '../../packages/shared/discord.ts';
import {answersFor,configSchema,escapeHtml,snowflake,ticketNumber} from '../../packages/shared/domain.ts';

export const app=Fastify({logger:{redact:['req.headers.cookie','req.headers.authorization'],serializers:{req:req=>({method:req.method,url:req.url?.split('?')[0]})}},bodyLimit:256_000,trustProxy:(_address,hop)=>hop===0});
await app.register(cookie);
await app.register(rateLimit,{max:120,timeWindow:'1 minute'});
const hash=(s:string)=>createHash('sha256').update(s).digest('base64url');
const random=()=>randomBytes(32).toString('base64url');
const secure=env.PUBLIC_URL.startsWith('https:');
const cookies={httpOnly:true,secure,sameSite:'lax' as const,path:'/'};
const sessionName=secure?'__Host-nl_session':'nl_session';
const stateName=secure?'__Host-nl_state':'nl_state';
const verified=(a:string,b:string)=>Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const profileSchema=z.object({id:snowflake,username:z.string(),global_name:z.string().nullable().optional(),avatar:z.string().nullable()});
const routeParams=z.object({guild:snowflake});
const idParams=routeParams.extend({id:z.coerce.number().int().positive()});
const replyText=z.string().trim().min(1).max(1500);
app.addHook('onRequest',async(req,reply)=>{
 reply.headers({'x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY','cache-control':'no-store',
  'content-security-policy':"default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"});
 if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin!==env.PUBLIC_URL)throw new Failure(403,'Invalid request origin');
});
app.setErrorHandler((error,req,reply)=>{
 if(error instanceof z.ZodError)return reply.code(400).send({error:'Invalid input',fields:error.issues.map(x=>({path:x.path,message:x.message}))});
 if(error instanceof Failure)return reply.code(error.statusCode).send({error:error.message});
 const code=typeof error==='object'&&error&&'statusCode' in error&&typeof error.statusCode==='number'?error.statusCode:500;
 req.log.error({name:error instanceof Error?error.name:'Error',status:code},'Request failed');
 return reply.code(code).send({error:code===429?'Too many requests':'Request failed'});
});
app.get('/health',async()=>{await db.$queryRaw`SELECT 1`;return {ok:true};});
app.get('/auth/discord',{config:{rateLimit:{max:12,timeWindow:'1 minute'}}},async(req,reply)=>{
 const {next}=z.object({next:z.string().optional()}).parse(req.query);
 const safeNext=next&&/^\/(?:support|apply|dashboard)(?:\?[a-zA-Z0-9_=&-]{1,200})?$/.test(next)?next:'/dashboard';
 const state=random(), verifier=random();
 reply.setCookie(stateName,[state,verifier,Buffer.from(safeNext).toString('base64url')].join('.'),{...cookies,maxAge:600});
 const params=new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,response_type:'code',scope:'identify',state,code_challenge:hash(verifier),code_challenge_method:'S256',redirect_uri:env.PUBLIC_URL+'/auth/callback'});
 return reply.redirect('https://discord.com/oauth2/authorize?'+params);
});
app.get('/auth/callback',async(req,reply)=>{
 const {state,code,iss}=z.object({state:z.string().max(100),code:z.string().max(512),iss:z.literal('https://discord.com').optional()}).parse(req.query);
 const [expected,verifier,next]=(req.cookies[stateName]??'').split('.');
 reply.clearCookie(stateName,cookies);
 if(!expected||!verifier||!next||!verified(state,expected)||iss&&iss!=='https://discord.com')throw new Failure(403,'Login expired');
 const result=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',signal:AbortSignal.timeout(8000),body:new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,client_secret:env.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code,code_verifier:verifier,redirect_uri:env.PUBLIC_URL+'/auth/callback'})});
 if(!result.ok)throw new Failure(403,'Discord refused login');
 const {access_token}=z.object({access_token:z.string()}).parse(await result.json());
 const me=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:'Bearer '+access_token},signal:AbortSignal.timeout(8000)});
 if(!me.ok)throw new Failure(403,'Discord profile unavailable');
 const profile=profileSchema.parse(await me.json()), token=random();
 const prior=req.cookies[sessionName];
 await db.$transaction([
  db.session.deleteMany({where:{OR:[{expires:{lte:new Date()}},...(prior?[{hash:hash(prior)}]:[])]}}),
  db.session.create({data:{hash:hash(token),userId:profile.id,profile,expires:new Date(Date.now()+8*3600_000)}})
 ]);
 reply.setCookie(sessionName,token,{...cookies,maxAge:8*3600});
 const target=Buffer.from(next,'base64url').toString();
 return reply.redirect(/^\/(?:support|apply|dashboard)(?:\?[a-zA-Z0-9_=&-]{1,200})?$/.test(target)?target:'/dashboard');
});
async function session(req:FastifyRequest){
 const token=req.cookies[sessionName];
 const row=token?await db.session.findUnique({where:{hash:hash(token)}}):null;
 if(!row||row.expires<=new Date())throw new Failure(401,'Discord login required');
 return {user:row.userId,profile:profileSchema.parse(row.profile)};
}
app.get('/api/session',async req=>session(req));
app.post('/api/logout',async(req,reply)=>{
 const token=req.cookies[sessionName];
 if(token)await db.session.deleteMany({where:{hash:hash(token)}});
 reply.clearCookie(sessionName,cookies);return {ok:true};
});
async function context(req:FastifyRequest,level:'member'|'admin'|'website'){
 const {guild}=routeParams.parse(req.params), {user}=await session(req);
 const [rights,state]=await Promise.all([identity(guild,user),settings(guild)]);
 if(!rights.member||level==='admin'&&!rights.admin||level==='website'&&(!state.config.websiteRole||!rights.member.roles.includes(state.config.websiteRole)))throw new Failure(403,'Discord role or permissions missing');
 return {guild,user,rights,...state};
}
app.get('/api/guild/:guild',async req=>{
 const c=await context(req,'admin');
 const [channels,tickets,applications,activity,team]=await Promise.all([
  discord.get(Routes.guildChannels(c.guild)) as Promise<APIGuildChannel<GuildChannelType>[]>,
  db.ticket.findMany({where:{guildId:c.guild},orderBy:{updatedAt:'desc'},take:150}),
  db.application.findMany({where:{guildId:c.guild},orderBy:{createdAt:'desc'},take:100}),
  db.audit.findMany({where:{guildId:c.guild},orderBy:{createdAt:'desc'},take:100}),
  db.audit.findMany({where:{guildId:c.guild,kind:'team.change'},orderBy:{createdAt:'desc'},take:100})
 ]);
 return {revision:c.revision,config:c.config,roles:c.rights.roles.filter(r=>r.id!==c.guild&&!r.managed).map(({id,name})=>({id,name})),
  channels:channels.filter(c=>[ChannelType.GuildText,ChannelType.GuildAnnouncement,ChannelType.GuildCategory].includes(c.type)).map(({id,name,type})=>({id,name,type})),tickets,applications,activity,team,
  name:c.rights.guild.name,members:c.rights.guild.approximate_member_count??null,online:c.rights.guild.approximate_presence_count??null};
});
app.put('/api/guild/:guild/config',async req=>{
 const c=await context(req,'admin');
 const body=z.object({revision:z.number().int(),config:configSchema}).parse(req.body);
 return lock('config:'+c.guild,async tx=>{
  const prior=await tx.guildConfig.findUnique({where:{guildId:c.guild}});
  if((prior?.revision??0)!==body.revision)throw new Failure(409,'Settings changed, reload first');
  const row=await tx.guildConfig.upsert({where:{guildId:c.guild},create:{guildId:c.guild,data:body.config,revision:1},update:{data:body.config,revision:{increment:1}}});
  const previous=prior?configSchema.parse(prior.data):c.config;
  const changed=previous.categories.filter(old=>JSON.stringify(old.supportRoles)!==JSON.stringify(body.config.categories.find(cat=>cat.id===old.id)?.supportRoles)).map(old=>old.id);
  if(changed.length){
   const tickets=await tx.ticket.findMany({where:{guildId:c.guild,category:{in:changed},channelId:{not:null}},select:{id:true}});
   if(tickets.length)await tx.job.createMany({data:tickets.map(t=>({id:crypto.randomUUID(),guildId:c.guild,kind:'ticket-acl',data:{ticketId:t.id}}))});
  }
  await tx.audit.create({data:{guildId:c.guild,actorId:c.user,kind:'config.saved',data:{revision:row.revision}}});
  return {revision:row.revision};
 });
});
app.post('/api/guild/:guild/publish',async req=>{
 const c=await context(req,'admin');
 const {panelId,scheduleAt}=z.object({panelId:z.string(),scheduleAt:z.iso.datetime().optional()}).parse(req.body);
 const panel=c.config.panels.find(p=>p.id===panelId);
 if(!panel?.channelId)throw new Failure(400,'Choose a Discord channel first');
 const id=crypto.randomUUID();
 if(scheduleAt&&(panel.kind!=='news'||Date.parse(scheduleAt)<=Date.now()))throw new Failure(400,'Choose a future news publication time');
 await db.job.create({data:{id,guildId:c.guild,kind:'publish',runAt:scheduleAt?new Date(scheduleAt):undefined,data:{panelId,actor:c.user}}});
 return {id};
});
app.get('/api/guild/:guild/jobs/:job',async req=>{
 const c=await context(req,'admin');
 const {job}=z.object({job:z.uuid()}).parse(req.params);
 const row=await db.job.findFirst({where:{id:job,guildId:c.guild}});
 if(!row)throw new Failure(404,'Job missing');
 return {finished:!!row.finishedAt,error:row.error,attempts:row.attempts};
});
app.get('/api/guild/:guild/access',async req=>{
 const c=await context(req,'website');return {allowed:true,role:c.config.websiteRole};
});
app.get('/api/guild/:guild/support',async req=>{
 const c=await context(req,'website');
 const tickets=await db.ticket.findMany({where:{guildId:c.guild,ownerId:c.user},orderBy:{updatedAt:'desc'},take:100});
 return {categories:c.config.categories.filter(x=>x.enabled&&x.supportRoles.length&&(!x.requiredRole||c.rights.member?.roles.includes(x.requiredRole))).map(({id,name})=>({id,name})),tickets};
});
app.post('/api/guild/:guild/support',async req=>{
 const c=await context(req,'website');
 const data=z.object({requestId:z.uuid(),category:z.string(),title:z.string().trim().min(4).max(100),body:replyText}).parse(req.body);
 const category=c.config.categories.find(x=>x.id===data.category&&x.enabled&&x.supportRoles.length);
 if(!category||category.requiredRole&&!c.rights.member?.roles.includes(category.requiredRole))throw new Failure(403,'Category unavailable');
 return openTicket({guildId:c.guild,ownerId:c.user,source:'web',...data},c.config.supportLimit);
});
async function ticketAccess(req:FastifyRequest){
 const c=await context(req,'member');
 const {id}=idParams.parse(req.params);
 const ticket=await db.ticket.findFirst({where:{id,guildId:c.guild}});
 if(!ticket)throw new Failure(404,'Ticket not found');
 const category=c.config.categories.find(x=>x.id===ticket.category);
 const staff=c.rights.admin||!!category?.supportRoles.some(id=>c.rights.member?.roles.includes(id));
 const owner=ticket.ownerId===c.user&&!!c.config.websiteRole&&c.rights.member?.roles.includes(c.config.websiteRole);
 if(!staff&&!owner)throw new Failure(404,'Ticket not found');
 return {...c,ticket,staff};
}
app.get('/api/guild/:guild/ticket/:id',async req=>{
 const c=await ticketAccess(req);
 const messages=await db.message.findMany({where:{ticketId:c.ticket.id,...(c.staff?{}:{internal:false})},orderBy:{createdAt:'desc'},take:2000});
 return {...c.ticket,messages:messages.reverse(),staff:c.staff};
});
app.post('/api/guild/:guild/ticket/:id/message',async req=>{
 const c=await ticketAccess(req),data=z.object({id:z.uuid(),body:replyText,internal:z.boolean().default(false)}).parse(req.body);
 if(data.internal&&!c.staff)throw new Failure(403,'Staff required');
 return writeMessage(c.guild,c.ticket.id,c.user,data.id,data.body,'web',data.internal);
});
app.post('/api/guild/:guild/ticket/:id/action',async req=>{
 const c=await ticketAccess(req),{action,target}=z.object({action:z.enum(['claim','transfer','close','reopen','archive','unclaim','waiting_user','waiting_support','escalated']),target:snowflake.optional()}).parse(req.body);
 if(!c.staff&&action!=='close')throw new Failure(403,'Staff required');
 if(action==='transfer'){
  const targetMember=target&&await member(c.guild,target);
  if(!targetMember||targetMember.user?.bot||!c.config.categories.find(x=>x.id===c.ticket.category)?.supportRoles.some(r=>targetMember.roles.includes(r)))throw new Failure(403,'Target support role missing');
 }
 return actOnTicket(c.guild,c.ticket.id,action,c.user,c.rights.admin,target);
});
app.get('/api/guild/:guild/ticket/:id/transcript',async(req,reply)=>{
 const c=await ticketAccess(req);
 const messages=await db.message.findMany({where:{ticketId:c.ticket.id,internal:false},orderBy:[{createdAt:'asc'},{id:'asc'}]});
 const number=ticketNumber(c.ticket.id);
 return reply.header('content-disposition','attachment; filename="'+number+'.html"').type('text/html; charset=utf-8').send('<!doctype html><meta charset="utf-8"><title>'+number+'</title><h1>'+number+' · '+escapeHtml(c.ticket.title)+'</h1><p>'+escapeHtml(c.ticket.status)+' · '+escapeHtml(c.ticket.assignee??'—')+'</p>'+messages.map(m=>'<article><time>'+m.createdAt.toISOString()+'</time> · '+escapeHtml(m.source)+'<p>'+escapeHtml(m.body)+'</p></article>').join(''));
});
app.get('/api/guild/:guild/apply',async req=>{
 const c=await context(req,'member');
 return c.config.forms.filter(f=>f.enabled&&(!f.deadline||Date.parse(f.deadline)>Date.now())).map(({id,name,description,questions})=>({id,name,description,questions}));
});
app.post('/api/guild/:guild/apply',async req=>{
 const c=await context(req,'member');
 const data=z.object({formId:z.string(),answers:z.record(z.string(),z.unknown())}).parse(req.body);
 const form=c.config.forms.find(f=>f.id===data.formId&&f.enabled&&(!f.deadline||Date.parse(f.deadline)>Date.now()));
 if(!form)throw new Failure(404,'Application form unavailable');
 let answers;
 try{answers=answersFor(form,data.answers);}catch(error){throw new Failure(400,'Check answer: '+(error as Error).message);}
 return lock('apply:'+c.guild+':'+c.user+':'+form.id,async tx=>{
  const previous=await tx.application.findFirst({where:{guildId:c.guild,ownerId:c.user,formId:form.id},orderBy:{createdAt:'desc'}});
  if(previous&&(['open','interview','review','accepting'].includes(previous.status)||Date.now()-previous.createdAt.getTime()<form.cooldownHours*3600_000))throw new Failure(409,'Application already submitted or on cooldown');
  const application=await tx.application.create({data:{guildId:c.guild,ownerId:c.user,formId:form.id,answers}});
  await tx.job.create({data:{id:'application:'+application.id,guildId:c.guild,kind:'application',data:{id:application.id}}});
  return {id:application.id};
 });
});
app.post('/api/guild/:guild/application/:id',async req=>{
 const c=await context(req,'member'),{id}=idParams.parse(req.params);
 const data=z.object({status:z.enum(['review','interview','accepted','rejected','archived','withdrawn']),reason:z.string().trim().max(400).default('')}).parse(req.body);
 return lock('application:'+id,async tx=>{
  const entry=await tx.application.findFirst({where:{guildId:c.guild,id}});
  const form=c.config.forms.find(f=>f.id===entry?.formId);
  if(!entry||!form)throw new Failure(404,'Application missing');
  const reviewer=c.rights.admin||form.reviewerRoles.some(r=>c.rights.member?.roles.includes(r));
  if(data.status==='withdrawn'?entry.ownerId!==c.user:!reviewer)throw new Failure(403,'Application permissions missing');
  if(data.status==='accepted'&&!c.rights.admin)throw new Failure(403,'An administrator must approve role assignments');
  if(!['open','review','interview'].includes(entry.status)&&!(data.status==='archived'&&['accepted','rejected','withdrawn'].includes(entry.status)))throw new Failure(409,'Application already decided');
  if(data.status==='rejected'&&!data.reason)throw new Failure(400,'A reason is required');
  const row=await tx.application.update({where:{id},data:{status:data.status==='accepted'?'accepting':data.status,reason:data.reason,reviewer:c.user}});
  if(['accepted','rejected'].includes(data.status))await tx.job.create({data:{id:'decision:'+id,guildId:c.guild,kind:'decision',data:{id,status:data.status,actor:c.user}}});
  await tx.audit.create({data:{guildId:c.guild,actorId:c.user,kind:'application.'+row.status,data:{id}}});
  return row;
 });
});
app.post('/api/guild/:guild/team',async req=>{
 const c=await context(req,'admin');
 const data=z.object({userId:snowflake,add:snowflake.or(z.literal('')),remove:snowflake.or(z.literal('')),reason:z.string().trim().min(3).max(300)}).parse(req.body);
 if(data.userId===c.user||[data.add,data.remove].filter(Boolean).some(id=>!c.config.teamRoles.includes(id))||data.add===data.remove)throw new Failure(400,'Choose configured team roles and another member');
 const id=crypto.randomUUID();
 await db.job.create({data:{id,guildId:c.guild,kind:'team',data:{...data,actor:c.user}}});
 return {id};
});
const dist=fileURLToPath(new URL('../../dist/',import.meta.url));
await app.register(staticFiles,{root:dist});
for(const path of ['/dashboard','/support','/apply'])app.get(path,(_req,reply)=>reply.sendFile('index.html',{cacheControl:false}));
if(import.meta.main){
 for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{void app.close().then(()=>db.$disconnect());});
 await app.listen({port:env.PORT,host:process.env.HOST||'0.0.0.0'});
}
