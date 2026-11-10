import {ActionRowBuilder,ButtonBuilder,ButtonStyle,ChannelType,EmbedBuilder,PermissionFlagsBits,MessageFlags,ModalBuilder,TextInputBuilder,TextInputStyle} from 'discord.js';
import {changeStore,getStore,logEvent} from './store.mjs';
import {validId,cleanText} from './security.mjs';

const privateReply=content=>({content,flags:MessageFlags.Ephemeral,allowedMentions:{parse:[]}});
export function panelButtons(panel){
 const labels={ticket:'🎫 Ticket öffnen',verify:'✓ Verifizieren',application:'📝 Bewerben',selfrole:'Rolle erhalten'};
 if(panel.type==='info')return [];
 return [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('nl:'+panel.type+':'+panel.id).setLabel(labels[panel.type]).setStyle(panel.type==='ticket'?ButtonStyle.Primary:ButtonStyle.Success))];
}
export function checkPanelConfig(p){
 if(p.type==='ticket'&&(!validId(p.categoryId)||!validId(p.staffRoleId)))throw Error('Ticket-Kategorie und Supportrolle erforderlich');
 if(['verify','selfrole'].includes(p.type)&&!validId(p.roleId))throw Error('Eine gültige Rolle ist erforderlich');
 if(p.type==='application'&&(!validId(p.reviewChannelId)||!validId(p.staffRoleId)))throw Error('Bewerbungs-Logkanal und Teamrolle erforderlich');
}
async function assignRole(i,roleId){
 const role=await i.guild.roles.fetch(roleId),me=await i.guild.members.fetchMe();
 if(!role||role.managed||me.roles.highest.comparePositionTo(role)<=0||!me.permissions.has(PermissionFlagsBits.ManageRoles))throw Error('Diese Rolle kann der Bot nicht vergeben.');
 const member=await i.guild.members.fetch(i.user.id);
 if(member.roles.cache.has(roleId))return 'Du hast diese Rolle bereits.';
 await member.roles.add(role,'NovaLab Control V2 Panel');
 await changeStore(s=>logEvent(s,'role.add',i.user.id+' -> '+roleId));
 return 'Rolle erfolgreich vergeben.';
}
async function createTicket(i,p){
 const g=i.guild,me=await g.members.fetchMe();
 if(!me.permissions.has(PermissionFlagsBits.ManageChannels))throw Error('Bot benötigt Kanäle verwalten.');
 const existing=getStore().tickets.find(t=>t.ownerId===i.user.id&&t.panelId===p.id&&t.status==='open');
 if(existing)return 'Du hast bereits ein offenes Ticket: <#'+existing.channelId+'>';
 const channel=await g.channels.create({
 name:'ticket-'+i.user.username.toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,30)+'-'+i.user.id.slice(-4),
 type:ChannelType.GuildText,parent:p.categoryId,topic:'NovaLab Ticket | '+i.user.id,
 permissionOverwrites:[
 {id:g.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
 {id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},
 {id:p.staffRoleId,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},
 {id:me.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ManageChannels,PermissionFlagsBits.ReadMessageHistory]}
 ]});
 try{
 await changeStore(s=>{s.tickets.push({id:crypto.randomUUID(),panelId:p.id,channelId:channel.id,ownerId:i.user.id,status:'open',claimedBy:null,createdAt:new Date().toISOString()});logEvent(s,'ticket.open',i.user.id+' -> '+channel.id);});
 await channel.send({content:'<@'+i.user.id+'> <@&'+p.staffRoleId+'>',allowedMentions:{users:[i.user.id],roles:[p.staffRoleId]},embeds:[new EmbedBuilder().setTitle('🎫 Support-Ticket').setDescription('Beschreibe dein Anliegen. Unser Team meldet sich hier.').setColor(p.color)],components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('nl:claim').setLabel('Übernehmen').setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId('nl:close').setLabel('Schließen').setStyle(ButtonStyle.Danger))]});
 return 'Ticket erstellt: <#'+channel.id+'>';
 }catch(e){await channel.delete('Ticket setup failed').catch(()=>{});throw e;}
}
async function staffAction(i,kind){
 const t=getStore().tickets.find(t=>t.channelId===i.channelId&&t.status==='open');
 if(!t)throw Error('Kein offenes Ticket gefunden.');
 const p=getStore().panels.find(p=>p.id===t.panelId);
 const member=await i.guild.members.fetch(i.user.id);
 if(!member.permissions.has(PermissionFlagsBits.ManageGuild)&&!member.roles.cache.has(p?.staffRoleId))throw Error('Nur das Support-Team darf Tickets verwalten.');
 if(kind==='claim'){
 await changeStore(s=>{const ticket=s.tickets.find(x=>x.id===t.id);if(ticket.claimedBy&&ticket.claimedBy!==i.user.id)throw Error('Bereits von einem anderen Teammitglied übernommen.');ticket.claimedBy=i.user.id;logEvent(s,'ticket.claim',t.channelId+' -> '+i.user.id);});
 await i.channel.send({content:'Ticket übernommen von <@'+i.user.id+'>',allowedMentions:{users:[i.user.id]}});return 'Ticket übernommen.';
 }
 await changeStore(s=>{const ticket=s.tickets.find(x=>x.id===t.id);ticket.status='closed';ticket.closedBy=i.user.id;ticket.closedAt=new Date().toISOString();logEvent(s,'ticket.close',t.channelId+' -> '+i.user.id);});
 await i.channel.permissionOverwrites.edit(t.ownerId,{ViewChannel:false,SendMessages:false},'NovaLab Ticket geschlossen');
 await i.channel.send({content:'🔒 Ticket geschlossen von <@'+i.user.id+'>',allowedMentions:{users:[i.user.id]},components:[]});
 return 'Ticket geschlossen. Der Kanal bleibt für das Team erhalten.';
}
function applicationModal(panelId){
 return new ModalBuilder().setCustomId('nl:apply:'+panelId).setTitle('NovaLab Bewerbung').addComponents(
 new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivation').setLabel('Warum möchtest du ins Team?').setStyle(TextInputStyle.Paragraph).setMaxLength(1000).setRequired(true)),
 new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('experience').setLabel('Welche Erfahrungen hast du?').setStyle(TextInputStyle.Paragraph).setMaxLength(1000).setRequired(true)),
 new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('availability').setLabel('Wie viel Zeit hast du?').setStyle(TextInputStyle.Short).setMaxLength(150).setRequired(true)));
}
async function submitApplication(i,p){
 const channel=await i.guild.channels.fetch(p.reviewChannelId);
 if(!channel?.isTextBased()||typeof channel.send!=='function')throw Error('Bewerbungskanal nicht erreichbar.');
 const answers=['motivation','experience','availability'].map(k=>cleanText(i.fields.getTextInputValue(k),1000));
 const entry={id:crypto.randomUUID(),panelId:p.id,userId:i.user.id,status:'open',answers,createdAt:new Date().toISOString()};
 const embed=new EmbedBuilder().setTitle('📝 Neue Bewerbung').setDescription('Von <@'+i.user.id+'>').setColor(p.color)
 .addFields({name:'Motivation',value:answers[0]},{name:'Erfahrung',value:answers[1]},{name:'Zeit',value:answers[2]});
 const msg=await channel.send({embeds:[embed],allowedMentions:{parse:[]},components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('nl:accept:'+entry.id).setLabel('Annehmen').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId('nl:decline:'+entry.id).setLabel('Ablehnen').setStyle(ButtonStyle.Danger))]});
 entry.messageId=msg.id;
 await changeStore(s=>{s.applications.push(entry);logEvent(s,'application.submit',i.user.id+' -> '+p.id);});
 return 'Deine Bewerbung wurde eingereicht.';
}
async function reviewApplication(i,kind,id){
 const entry=getStore().applications.find(a=>a.id===id);
 if(!entry||entry.status!=='open')throw Error('Bewerbung bereits bearbeitet oder nicht vorhanden.');
 const p=getStore().panels.find(x=>x.id===entry.panelId);
 const staff=await i.guild.members.fetch(i.user.id);
 if(!staff.permissions.has(PermissionFlagsBits.ManageGuild)&&!staff.roles.cache.has(p?.staffRoleId))throw Error('Keine Team-Berechtigung.');
 if(kind==='accept'&&validId(p.acceptRoleId)){
 const target=await i.guild.members.fetch(entry.userId);const role=await i.guild.roles.fetch(p.acceptRoleId);const me=await i.guild.members.fetchMe();
 if(!role||role.managed||me.roles.highest.comparePositionTo(role)<=0)throw Error('Annahmerolle nicht verwaltbar.');
 await target.roles.add(role,'NovaLab Bewerbung angenommen');
 }
 await changeStore(s=>{const a=s.applications.find(x=>x.id===id);if(a.status!=='open')throw Error('Bereits bearbeitet.');a.status=kind==='accept'?'accepted':'declined';a.reviewedBy=i.user.id;a.reviewedAt=new Date().toISOString();logEvent(s,'application.'+a.status,id+' by '+i.user.id);});
 await i.message.edit({components:[]});
 return kind==='accept'?'Bewerbung angenommen.':'Bewerbung abgelehnt.';
}
export function registerInteractions(client){
 client.on('interactionCreate',async i=>{
 if(!i.inGuild()||i.guildId!==process.env.DISCORD_GUILD_ID)return;
 try{
 if(i.isModalSubmit()&&i.customId.startsWith('nl:apply:')){
 await i.deferReply({flags:MessageFlags.Ephemeral});
 const p=getStore().panels.find(p=>p.id===i.customId.slice(9)&&p.type==='application');
 if(!p)throw Error('Bewerbungs-Panel nicht gefunden.');
 return await i.editReply({content:await submitApplication(i,p)});
 }
 if(!i.isButton()||!i.customId.startsWith('nl:'))return;
 const [,action,id]=i.customId.split(':');
 if(action==='application'){
 const p=getStore().panels.find(p=>p.id===id&&p.type==='application');if(!p)throw Error('Panel nicht gefunden.');
 return await i.showModal(applicationModal(p.id));
 }
 await i.deferReply({flags:MessageFlags.Ephemeral});
 let msg;
 if(['ticket','verify','selfrole'].includes(action)){
 const p=getStore().panels.find(p=>p.id===id&&p.type===action);
 if(!p)throw Error('Panel nicht gefunden.');
 msg=action==='ticket'?await createTicket(i,p):await assignRole(i,p.roleId);
 }else if(['claim','close'].includes(action))msg=await staffAction(i,action);
 else if(['accept','decline'].includes(action))msg=await reviewApplication(i,action,id);
 else return await i.editReply({content:'Unbekannte Aktion.'});
 await i.editReply({content:msg,allowedMentions:{parse:[]}});
 }catch(e){console.error('Interaction error:',e);const msg='Aktion fehlgeschlagen: '+e.message;if(i.deferred||i.replied)await i.editReply({content:msg}).catch(()=>{});else await i.reply(privateReply(msg)).catch(()=>{});}
 });
}
