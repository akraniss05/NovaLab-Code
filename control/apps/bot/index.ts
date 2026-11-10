import {Client,Events,GatewayIntentBits,ChannelType,PermissionFlagsBits as P,ButtonStyle,MessageFlags,type Guild,type GuildMember,type Message,type TextChannel,type Interaction,type APIEmbed,type MessageCreateOptions, SlashCommandBuilder} from 'discord.js';
import {createHash} from 'node:crypto';
import {env} from '../../packages/config/env.ts';
import {db} from '../../packages/database/db.ts';
import {actOnTicket,openTicket,settings,writeMessage} from '../../packages/database/service.ts';
import {changeRoles,identity} from '../../packages/shared/discord.ts';
import {activeTicket,ticketNumber,type Config,type Panel} from '../../packages/shared/domain.ts';

const noMentions={parse:[] as [],repliedUser:false};
const intents=[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildModeration];
if(env.MESSAGE_CONTENT)intents.push(GatewayIntentBits.MessageContent);
const bot=new Client({intents,allowedMentions:noMentions});
const command=new SlashCommandBuilder().setName('novalab').setDescription('NovaLab Control').addSubcommand(s=>s.setName('support').setDescription('Open support portal')).addSubcommand(s=>s.setName('moderate').setDescription('Create a moderation case')
 .addStringOption(o=>o.setName('action').setDescription('Action').setRequired(true).addChoices(...['warn','timeout','kick','ban'].map(v=>({name:v,value:v}))))
 .addUserOption(o=>o.setName('member').setDescription('Member').setRequired(true))
 .addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(true).setMaxLength(300)));
const nonce=(value:string)=>createHash('sha256').update(value).digest('hex').slice(0,24);
const version=(p:Panel)=>createHash('sha256').update(JSON.stringify(p)).digest('hex');
const portal=(page:string,guild:string,params:Record<string,string>={})=>env.PUBLIC_URL+'/'+page+'?'+new URLSearchParams({guild,...params});
function button(custom_id:string,label:string,style=ButtonStyle.Secondary){return {type:2 as const,custom_id,label,style};}
function link(url:string,label:string){return {type:2 as const,style:ButtonStyle.Link,url,label};}
function row(...components:object[]){return {type:1,components};}
async function textChannel(g:Guild,id:string){
 const channel=await g.channels.fetch(id);
 if(!channel||![ChannelType.GuildText,ChannelType.GuildAnnouncement].includes(channel.type))throw Error('Invalid text channel');
 return channel as TextChannel;
}
async function audit(g:Guild,kind:string,data:Record<string,string|number>,actorId?:string){
 await db.audit.create({data:{guildId:g.id,kind,data,actorId}});
 const {config}=await settings(g.id), id=config.logChannels[kind]||config.logChannels[kind.split('.')[0]];
 if(id){
  const ch=await textChannel(g,id);
  if(!ch.permissionsFor(g.roles.everyone).has(P.ViewChannel))await ch.send({content:('**'+kind+'** · '+Object.values(data).join(' · ')).slice(0,1900),allowedMentions:noMentions});
 }
}
async function panelPayload(g:Guild,p:Panel,c:Config){
 const en=c.language==='en';
 const embed:APIEmbed={title:p.title,description:p.description,color:Number.parseInt(p.color.slice(1),16),...(p.banner?{image:{url:p.banner}}:{}),...(p.thumbnail?{thumbnail:{url:p.thumbnail}}:{}),...(p.footer?{footer:{text:p.footer}}:{})};
 let components:object[]=[];
 if(p.kind==='tickets'){
  const options=c.categories.filter(x=>x.enabled&&x.supportRoles.length);
  for(let i=0;i<options.length;i+=25)components.push(row({type:3,custom_id:'nl:category:'+p.id+':'+i,placeholder:p.button,options:options.slice(i,i+25).map(x=>({label:x.name,value:x.id}))}));
 }else if(p.kind==='applications'){
  const forms=c.forms.filter(x=>x.enabled&&(!x.deadline||Date.parse(x.deadline)>Date.now()));
  if(forms.length)embed.description=(p.description+'\n\n'+forms.map(f=>'• '+f.name).join('\n')).slice(0,4000);
  components=[row(link(portal('apply',g.id),p.button))];
 }else if(p.kind==='verification'||p.kind==='rules'){
  components=[row(button('nl:confirm:'+p.id,p.button,ButtonStyle.Primary))];
 }else if(p.kind==='selfroles'&&p.roleIds.length){
  const roles=p.roleIds.flatMap(id=>g.roles.cache.get(id)??[]);
  if(roles.length)components=[row({type:3,custom_id:'nl:self:'+p.id,placeholder:p.button,min_values:0,max_values:p.exclusive?1:roles.length,options:roles.map(r=>({label:r.name.slice(0,100),value:r.id}))})];
 }else if(p.kind==='staff'){
  const members=await g.members.fetch({time:12000});
  const lines=c.teamRoles.flatMap(id=>{
   const role=g.roles.cache.get(id);
   if(!role)return [];
   const names=members.filter(m=>m.roles.cache.has(id)).map(m=>m.displayName).join(', ');
   return ['**'+role.name+'** · '+(names||(en?'Vacant':'Unbesetzt'))];
  });
  embed.description=(p.description+'\n\n'+lines.join('\n')).slice(0,4000);
 }
 return {embeds:[embed],components,allowedMentions:noMentions} as MessageCreateOptions;
}
async function publish(g:Guild,p:Panel,c:Config,job:string){
 const channel=await textChannel(g,p.channelId), previous=await db.publication.findUnique({where:{guildId_panelId:{guildId:g.id,panelId:p.id}}});
 const payload=await panelPayload(g,p,c);
 if(previous?.channelId===channel.id){
  try{await channel.messages.edit(previous.messageId,{embeds:payload.embeds,components:payload.components,allowedMentions:noMentions});return;}
  catch(error){if(!isDiscordError(error,10008))throw error;}
 }
 const sent=await channel.send({...payload,nonce:nonce(job),enforceNonce:true});
 await db.publication.upsert({where:{guildId_panelId:{guildId:g.id,panelId:p.id}},create:{guildId:g.id,panelId:p.id,channelId:channel.id,messageId:sent.id},update:{channelId:channel.id,messageId:sent.id}});
 if(previous&&previous.channelId!==channel.id){
  try{await (await textChannel(g,previous.channelId)).messages.delete(previous.messageId);}catch{ /* Current publication is already saved. */ }
 }
}
const isDiscordError=(error:unknown,code:number)=>typeof error==='object'&&error!==null&&'code' in error&&error.code===code;
function ticketOverwrites(g:Guild,ownerId:string,roleIds:string[],open:boolean){
 const view=[P.ViewChannel,P.ReadMessageHistory];
 const staff=roleIds.filter(id=>id!==g.id&&g.roles.cache.has(id));
 return [
  {id:g.id,deny:[P.ViewChannel]},...staff.map(id=>({id,allow:[...view,P.SendMessages]})),
  {id:ownerId,allow:open?[...view,P.SendMessages]:view,deny:open?[]:[P.SendMessages]},
  {id:env.DISCORD_CLIENT_ID,allow:[...view,P.SendMessages,P.ManageChannels,P.ManageMessages]}
 ];
}
async function work(){
 const next=await db.job.findFirst({where:{finishedAt:null,runAt:{lte:new Date()},attempts:{lt:12}},orderBy:{runAt:'asc'}});
 if(!next)return;
 const lease=await db.job.updateMany({where:{id:next.id,runAt:next.runAt,finishedAt:null},data:{runAt:new Date(Date.now()+120_000),attempts:{increment:1}}});
 if(!lease.count)return;
 try{
  const g=await bot.guilds.fetch(next.guildId), {config:c}=await settings(g.id);
  const data=next.data as Record<string,string|number|null>;
  const verifyAdmin=async()=>{if(!data.actor||!(await identity(g.id,String(data.actor))).admin)throw Error('Administrator access revoked');};
  if(next.kind==='publish'){
   await verifyAdmin();
   const p=c.panels.find(p=>p.id===data.panelId);
   if(!p?.channelId)throw Error('Panel not configured');
   await publish(g,p,c,next.id);
  }else if(next.kind==='team'){
   await verifyAdmin();
   const add=data.add?[String(data.add)]:[], remove=data.remove?[String(data.remove)]:[];
   if([...add,...remove].some(id=>!c.teamRoles.includes(id)))throw Error('Team roles changed');
   await changeRoles(g.id,String(data.userId),add,remove,String(data.actor));
   await audit(g,'team.change',{member:String(data.userId),from:remove[0]??'—',to:add[0]??'—',reason:String(data.reason)},String(data.actor));
  }else if(next.kind==='decision'||next.kind==='application'){
   const entry=await db.application.findUniqueOrThrow({where:{id:Number(data.id)}});
   const form=c.forms.find(f=>f.id===entry.formId);
   if(!form)throw Error('Application form removed');
   if(next.kind==='application'&&form.reviewChannel){
    const ch=await textChannel(g,form.reviewChannel);
    if(ch.permissionsFor(g.roles.everyone).has(P.ViewChannel))throw Error('Review channel must be private');
    await ch.send({content:'**'+form.name+' · #'+entry.id+'**',components:[row(link(portal('dashboard',g.id),'NovaLab Control'))] as MessageCreateOptions['components'],nonce:nonce(next.id),enforceNonce:true});
   }
   if(next.kind==='decision'){
    if(data.status==='accepted'){
     await verifyAdmin();
     await changeRoles(g.id,entry.ownerId,form.awardRoles,form.removeRoles,String(data.actor));
     await db.application.update({where:{id:entry.id},data:{status:'accepted'}});
     if(form.awardRoles.some(id=>c.teamRoles.includes(id)))await audit(g,'team.change',{member:entry.ownerId,application:entry.id},String(data.actor));
    }
    const applicant=await bot.users.fetch(entry.ownerId);
    await applicant.send({content:(c.language==='en'?'Application':'Bewerbung')+' #'+entry.id+' · '+(data.status==='accepted'?(c.language==='en'?'Accepted':'Angenommen'):(c.language==='en'?'Rejected':'Abgelehnt'))+(entry.reason?'\n'+entry.reason:''),nonce:nonce(next.id),enforceNonce:true,allowedMentions:noMentions}).catch(()=>undefined);
   }
  }else{
   const t=await db.ticket.findUniqueOrThrow({where:{id:Number(data.ticketId)}});
   if(t.guildId!==g.id)throw Error('Guild mismatch');
   const topic='novalab-ticket:'+t.id;
   if(next.kind==='channel'){
    if(activeTicket(t.status)&&!t.channelId){
     const cat=c.categories.find(x=>x.id===t.category);
     const roles=cat?.supportRoles.filter(id=>id!==g.id&&g.roles.cache.has(id))??[];
     if(!cat?.enabled||!roles.length)throw Error('No valid support roles');
     const channels=await g.channels.fetch();
     const existing=channels.find(ch=>ch?.type===ChannelType.GuildText&&ch.topic===topic) as TextChannel|undefined;
     const channel=existing??await g.channels.create({type:ChannelType.GuildText,name:ticketNumber(t.id).toLowerCase(),topic,parent:cat.parentId||undefined,permissionOverwrites:ticketOverwrites(g,t.ownerId,roles,true)});
     if(existing)await channel.permissionOverwrites.set(ticketOverwrites(g,t.ownerId,roles,true));
     const intake=await db.message.findFirst({where:{ticketId:t.id,source:'intake'}});
     await channel.send({embeds:[{title:ticketNumber(t.id)+' · '+t.title,description:intake?.body,color:0x6366f1}],
      components:[row(button('nl:claim:'+t.id,'Claim'),button('nl:reply:'+t.id,c.language==='en'?'Public reply':'Öffentlich antworten',ButtonStyle.Primary),button('nl:transfer:'+t.id,c.language==='en'?'Transfer':'Weitergeben'),button('nl:close:'+t.id,c.language==='en'?'Close':'Schließen',ButtonStyle.Danger)),
      row(link(portal('support',g.id,{ticket:String(t.id)}),'Web · '+ticketNumber(t.id)))] as MessageCreateOptions['components'],nonce:nonce(next.id),enforceNonce:true});
     await db.ticket.update({where:{id:t.id},data:{channelId:channel.id}});
    }
   }else{
    if(!t.channelId){if(activeTicket(t.status))throw Error('Ticket channel pending');}
    else{
     const ch=await textChannel(g,t.channelId);
     if(ch.topic!==topic)throw Error('Ticket channel identity check failed');
     const configured=c.categories.find(x=>x.id===t.category)?.supportRoles??[];
     if(next.kind==='ticket-acl'){
      await ch.permissionOverwrites.set(ticketOverwrites(g,t.ownerId,configured,activeTicket(t.status)));
     }else if(next.kind==='message'){
      const visible=new Set([g.id,t.ownerId,env.DISCORD_CLIENT_ID,...configured]);
      if(ch.permissionsFor(g.roles.everyone).has(P.ViewChannel)||ch.permissionOverwrites.cache.some(o=>!visible.has(o.id)&&o.allow.has(P.ViewChannel)))throw Error('Ticket channel privacy check failed');
      const msg=await db.message.findUniqueOrThrow({where:{id:String(data.messageId)}});
      if(msg.ticketId===t.id&&!msg.internal)await ch.send({content:'**'+(msg.source==='staff'?'NovaLab Support':'Web · '+msg.authorId)+'**\n'+msg.body,nonce:nonce(next.id),enforceNonce:true,allowedMentions:noMentions});
     }else if(next.kind==='ticket-event'){
      if(data.action==='close'||data.action==='reopen')await ch.permissionOverwrites.set(ticketOverwrites(g,t.ownerId,configured,activeTicket(t.status)));
      const target=data.target&&String(data.target);
      await ch.send({content:ticketNumber(t.id)+' · '+data.action+(target?' · <@'+target+'>':''),allowedMentions:{parse:[],users:target?[target]:[]},nonce:nonce(next.id),enforceNonce:true});
     }
    }
   }
  }
  await db.job.update({where:{id:next.id},data:{finishedAt:new Date(),error:null}});
 }catch(error){
  const errorName=error instanceof Error?error.name:'Error';
  console.error(JSON.stringify({job:next.kind,id:next.id,error:errorName}));
  await db.job.update({where:{id:next.id},data:{runAt:new Date(Date.now()+Math.min(300_000,5000*2**next.attempts)),error:errorName}});
  if(next.kind==='decision'&&next.attempts===11){
   const {id}=next.data as {id:number};
   await db.application.updateMany({where:{id,status:'accepting'},data:{status:'review'}});
   await db.job.delete({where:{id:next.id}});
  }
 }
}
let working:Promise<void>|undefined;
const tick=setInterval(()=>{if(bot.isReady()&&!working)working=work().catch(error=>console.error(error.name)).finally(()=>{working=undefined;});},1500);
function listen<T extends keyof import('discord.js').ClientEvents>(event:T,fn:(...args:import('discord.js').ClientEvents[T])=>Promise<void>){
 bot.on(event,(...args)=>{void fn(...args).catch(error=>console.error(JSON.stringify({event,error:error.name})));});
}
listen(Events.ClientReady,async()=>{for(const g of bot.guilds.cache.values())await g.commands.create(command.toJSON());});
listen(Events.GuildCreate,async g=>{await g.commands.create(command.toJSON());});
async function guildMember(g:Guild,id:string){return g.members.fetch({user:id,force:true});}
listen(Events.InteractionCreate,async(i:Interaction)=>{
 if(!i.guild||!i.isRepliable())return;
 if(!i.isChatInputCommand()&&!('customId' in i&&i.customId.startsWith('nl:')))return;
 if(i.isChatInputCommand()&&i.commandName!=='novalab')return;
 try{
  const g=i.guild,{config:c}=await settings(g.id), en=c.language==='en';
  const reply=async(content:string)=>{if(i.deferred||i.replied)await i.editReply(content);else await i.reply({content,flags:MessageFlags.Ephemeral});};
  if(i.isChatInputCommand()){
   if(i.options.getSubcommand()==='support'){await reply(portal('support',g.id));return;}
   await i.deferReply({flags:MessageFlags.Ephemeral});
   const action=i.options.getString('action',true),reason=i.options.getString('reason',true), actor=await guildMember(g,i.user.id), target=await guildMember(g,i.options.getUser('member',true).id);
   const permission=action==='kick'?P.KickMembers:action==='ban'?P.BanMembers:P.ModerateMembers;
   if(!actor.permissions.has(permission)||target.id===actor.id||target.id===g.ownerId||actor.id!==g.ownerId&&actor.roles.highest.comparePositionTo(target.roles.highest)<=0)throw Error('Moderation permission');
   if(action==='kick')await target.kick(reason);
   if(action==='ban')await target.ban({reason});
   if(action==='timeout')await target.timeout(600_000,reason);
   await audit(g,'moderation.'+action,{member:target.id,reason},actor.id);
   await reply(en?'Case recorded':'Fall gespeichert');return;
  }
  if(!('customId' in i))return;
  const [,action,id]=i.customId.split(':');
  if(action==='category'&&i.isStringSelectMenu()){
   const panel=c.panels.find(p=>p.id===id&&p.kind==='tickets');
   const publication=await db.publication.findUnique({where:{guildId_panelId:{guildId:g.id,panelId:id}}});
   const cat=c.categories.find(x=>x.id===i.values[0]&&x.enabled&&x.supportRoles.length);
   if(!panel||!cat||publication?.messageId!==i.message.id)throw Error('Category unavailable');
   await i.showModal({customId:'nl:intake:'+cat.id,title:cat.name.slice(0,45),components:[
    {type:1,components:[{type:4,customId:'title',label:en?'Subject':'Betreff',style:1,minLength:4,maxLength:100,required:true}]},
    {type:1,components:[{type:4,customId:'body',label:en?'Details':'Anliegen',style:2,minLength:1,maxLength:1500,required:true}]}
   ]});return;
  }
  if(action==='intake'&&i.isModalSubmit()){
   await i.deferReply({flags:MessageFlags.Ephemeral});
   const cat=c.categories.find(x=>x.id===id&&x.enabled&&x.supportRoles.length),m=await guildMember(g,i.user.id);
   if(!cat||cat.requiredRole&&!m.roles.cache.has(cat.requiredRole))throw Error('Category unavailable');
   const title=i.fields.getTextInputValue('title').trim(),body=i.fields.getTextInputValue('body').trim();
   if(title.length<4||!body)throw Error('Empty ticket');
   const ticket=await openTicket({guildId:g.id,ownerId:i.user.id,category:id,source:'discord',title,body,requestId:i.id},c.supportLimit);
   await reply((en?'Ticket queued: ':'Ticket wird erstellt: ')+ticketNumber(ticket.id));return;
  }
  if(action==='confirm'||action==='self'){
   await i.deferReply({flags:MessageFlags.Ephemeral});
   const panel=c.panels.find(p=>p.id===id), m=await guildMember(g,i.user.id);
   const publication=await db.publication.findUnique({where:{guildId_panelId:{guildId:g.id,panelId:id}}});
   if(!panel||!('message' in i)||publication?.messageId!==i.message?.id)throw Error('Outdated panel');
   if(action==='confirm'&&['verification','rules'].includes(panel.kind)){
    if(panel.kind==='verification'){
     const recent=c.security.raidJoins?await db.audit.count({where:{guildId:g.id,kind:'member.join',createdAt:{gte:new Date(Date.now()-c.security.raidMinutes*60000)}}}):0;
     if(Date.now()-i.user.createdTimestamp<c.security.minAccountDays*86400000||c.security.raidJoins&&recent>=c.security.raidJoins)throw Error('Verification temporarily restricted');
     await changeRoles(g.id,m.id,c.verificationRoles,c.unverifiedRoles);
    }
    const data={guildId:g.id,userId:m.id,panelId:id,version:version(panel)};
    await db.confirmation.upsert({where:{guildId_userId_panelId:{guildId:g.id,userId:m.id,panelId:id}},create:data,update:{version:data.version,createdAt:new Date()}});
    await audit(g,'member.confirm',{panel:id},m.id);
   }else if(action==='self'&&panel.kind==='selfroles'&&i.isStringSelectMenu()){
    if(i.values.some(v=>!panel.roleIds.includes(v))||panel.exclusive&&i.values.length>1)throw Error('Role unavailable');
    await changeRoles(g.id,m.id,i.values.filter(id=>!m.roles.cache.has(id)),panel.roleIds.filter(id=>m.roles.cache.has(id)&&!i.values.includes(id)));
   }else throw Error('Unknown panel action');
   await reply(en?'Saved':'Gespeichert');return;
  }
  const t=await db.ticket.findFirst({where:{id:Number(id)||0,guildId:g.id,channelId:i.channelId}}), m=await guildMember(g,i.user.id);
  if(!t)throw Error('Ticket missing');
  const category=c.categories.find(x=>x.id===t.category);
  const admin=m.permissions.has(P.Administrator);
  const staff=admin||category?.supportRoles.some(r=>m.roles.cache.has(r));
  if(!staff&&!(action==='close'&&m.id===t.ownerId))throw Error('Ticket access denied');
  if((action==='reply'||action==='transfer')&&i.isButton()){
   const transfer=action==='transfer';
   await i.showModal({customId:'nl:'+(transfer?'handoff':'send')+':'+t.id,title:transfer?'Transfer':'Public reply',components:[{type:1,components:[{type:4,customId:'value',label:transfer?'Discord User ID':'Message shared with the ticket owner',style:transfer?1:2,required:true,maxLength:transfer?20:1500}]}]});return;
  }
  await i.deferReply({flags:MessageFlags.Ephemeral});
  if(action==='send'&&i.isModalSubmit()){
   const body=i.fields.getTextInputValue('value').trim();
   if(!body)throw Error('Empty message');
   await writeMessage(g.id,t.id,m.id,i.id,body,'staff');
  }else if(action==='handoff'&&i.isModalSubmit()){
   const target=await guildMember(g,i.fields.getTextInputValue('value').trim());
   if(target.user.bot||!category?.supportRoles.some(r=>target.roles.cache.has(r)))throw Error('Target is not in the support team');
   await actOnTicket(g.id,t.id,'transfer',m.id,admin,target.id);
  }else if(['claim','close'].includes(action))await actOnTicket(g.id,t.id,action,m.id,admin);
  else throw Error('Unknown ticket action');
  await reply(en?'Saved':'Gespeichert');
 }catch(error){
  const content=error instanceof Error&&'statusCode' in error?error.message:'Aktion konnte nicht ausgeführt werden / Action unavailable.';
  if(i.deferred||i.replied)await i.editReply(content).catch(()=>undefined);
  else await i.reply({content,flags:MessageFlags.Ephemeral}).catch(()=>undefined);
 }
});
function fill(text:string,m:GuildMember){
 return text.replace(/\{(user|mention|username|server|memberCount|createdAt|joinedAt)\}/g,(_,key:string)=>({
  user:m.displayName,mention:'<@'+m.id+'>',username:m.user.username,server:m.guild.name,memberCount:String(m.guild.memberCount),createdAt:m.user.createdAt.toISOString(),joinedAt:m.joinedAt?.toISOString()??''
 })[key]??'');
}
async function greeting(m:GuildMember,leave:boolean){
 const {config:c}=await settings(m.guild.id);
 await audit(m.guild,leave?'member.leave':'member.join',{member:m.id});
 if(!leave&&!m.user.bot&&(c.autoRoles.length||c.unverifiedRoles.length))await changeRoles(m.guild.id,m.id,[...c.autoRoles,...c.unverifiedRoles],[]).catch(error=>audit(m.guild,'security.role_failure',{member:m.id,reason:error.name}));
 const conf=leave?c.goodbye:c.welcome;
 if(conf.enabled&&conf.channelId&&conf.text.trim()){
  const channel=await textChannel(m.guild,conf.channelId), content=fill(conf.text,m).slice(0,1900);
  await channel.send(conf.embed?{embeds:[{description:content,color:parseInt(conf.color.slice(1),16),thumbnail:{url:m.displayAvatarURL()},...(conf.banner?{image:{url:conf.banner}}:{})}]}:{content});
 }
}
listen(Events.GuildMemberAdd,async m=>{await greeting(m,false);refreshStaff(m.guild);});
listen(Events.GuildMemberRemove,async m=>{if(!m.partial)await greeting(m,true);else await audit(m.guild,'member.leave',{member:m.id});refreshStaff(m.guild);});
const refreshTimers=new Map<string,NodeJS.Timeout>();
function refreshStaff(g:Guild){
 clearTimeout(refreshTimers.get(g.id));
 refreshTimers.set(g.id,setTimeout(()=>{refreshTimers.delete(g.id);void (async()=>{
  const {config:c}=await settings(g.id);
  const publications=await db.publication.findMany({where:{guildId:g.id}});
  for(const p of c.panels.filter(p=>p.kind==='staff'&&publications.some(x=>x.panelId===p.id&&x.channelId===p.channelId)))await publish(g,p,c,'staff:'+p.id+':'+Date.now());
 })().catch(error=>console.error(error.name));},3000));
}
listen(Events.GuildMemberUpdate,async(before,after)=>{
 if(before.roles.cache.size!==after.roles.cache.size||before.roles.cache.some(role=>!after.roles.cache.has(role.id))){
  refreshStaff(after.guild);await audit(after.guild,'member.roles',{member:after.id});
 }
});
listen(Events.ChannelDelete,async channel=>{
 if(!('guild' in channel))return;
 await db.ticket.updateMany({where:{guildId:channel.guild.id,channelId:channel.id,status:{notIn:['closed','archived']}},data:{status:'closed'}});
 await audit(channel.guild,'server.channel_delete',{channel:channel.id});
});
listen(Events.MessageDelete,async message=>{
 const g=message.guild;if(!g)return;
 const publication=await db.publication.findFirst({where:{guildId:g.id,messageId:message.id}});
 if(publication){
  const {config:c}=await settings(g.id), panel=c.panels.find(p=>p.id===publication.panelId&&p.channelId===publication.channelId);
  if(panel)await publish(g,panel,c,'restore:'+message.id);
 }
 await audit(g,'message.delete',{channel:message.channelId,message:message.id});
});
const flood=new Map<string,number[]>();
listen(Events.MessageCreate,async(m:Message)=>{
 if(!m.guild||m.author.bot||m.webhookId||!m.member)return;
 const {config:c}=await settings(m.guild.id), s=c.security;
 if(!m.member.permissions.has(P.Administrator)&&!s.exemptRoles.some(r=>m.member?.roles.cache.has(r))&&!s.exemptChannels.includes(m.channelId)){
  const key=m.guild.id+':'+m.author.id;
  const recent=(flood.get(key)??[]).filter(t=>Date.now()-t<10_000);
  if(s.floodLimit){recent.push(Date.now());flood.set(key,recent.slice(-30));}
  const trap=s.honeypot===m.channelId;
  const body=m.content.toLowerCase();
  const violation=trap||s.mentionLimit&&m.mentions.users.size>=s.mentionLimit||s.floodLimit&&recent.length>=s.floodLimit||
   s.inviteBlock&&/discord(?:\.gg\/|(?:app)?\.com\/invite\/)/i.test(body)||s.words.some(word=>body.includes(word.toLowerCase()));
  if(violation){
   if((!trap||s.honeypotAction!=='log')&&m.deletable)await m.delete();
   if(trap&&s.honeypotAction==='timeout'&&m.member.moderatable)await m.member.timeout(300_000,'NovaLab honeypot');
   await audit(m.guild,trap?'security.honeypot':'moderation.automod',{channel:m.channelId,member:m.author.id},m.author.id);return;
  }
 }
 const ticket=await db.ticket.findUnique({where:{channelId:m.channelId}});
 if(!ticket||ticket.guildId!==m.guild.id||ticket.ownerId!==m.author.id||!activeTicket(ticket.status)||!m.channel.isTextBased()||!('topic' in m.channel)||m.channel.topic!=='novalab-ticket:'+ticket.id)return;
 const urls=[...m.attachments.values()].slice(0,5).map(a=>a.url).filter(url=>/^https:\/\/cdn\.discordapp\.com\/attachments\//.test(url));
 const body=[m.content.slice(0,1500),...urls].filter(Boolean).join('\n').slice(0,4000);
 if(body)await writeMessage(m.guild.id,ticket.id,m.author.id,m.id,body,'discord');
});
const clean=setInterval(()=>{for(const [key,t] of flood)if(Date.now()-(t.at(-1)??0)>10_000)flood.delete(key);},30_000).unref();
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{clearInterval(tick);clearInterval(clean);for(const timer of refreshTimers.values())clearTimeout(timer);void Promise.resolve(working).finally(async()=>{bot.destroy();await db.$disconnect();});});
await bot.login(env.DISCORD_TOKEN);
