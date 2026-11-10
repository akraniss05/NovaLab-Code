import {ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder,PermissionFlagsBits} from 'discord.js';
import {cleanText,validId} from './security.mjs';
export function validatePanel(v){
 if(!v||typeof v!=='object')throw Error('Ungültiges Panel');
 if(!validId(v.channelId))throw Error('Bitte einen gültigen Kanal auswählen');
 const title=cleanText(v.title,120),description=cleanText(v.description,3500);
 if(!title||!description)throw Error('Titel und Beschreibung sind erforderlich');
 const color=/^#[0-9a-fA-F]{6}$/.test(v.color||'')?v.color:'#7766ee';
 const footer=cleanText(v.footer,150);
 const type=['info','ticket','verify','application'].includes(v.type)?v.type:'info';
 return {channelId:v.channelId,title,description,color,footer,type};
}
export async function publishPanel(g,input){
 const panel=validatePanel(input);
 const channel=await g.channels.fetch(panel.channelId);
 if(!channel||!channel.isTextBased()||typeof channel.send!=='function')throw Error('Kein beschreibbarer Textkanal');
 const me=await g.members.fetchMe(),permissions=channel.permissionsFor(me);
 if(!permissions?.has([PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.EmbedLinks]))throw Error('Bot benötigt Kanalzugriff, Nachrichten senden und Embeds');
 const embed=new EmbedBuilder().setTitle(panel.title).setDescription(panel.description).setColor(panel.color);
 if(panel.footer)embed.setFooter({text:panel.footer});
 // No fake buttons: interactive panel types are explicitly blocked until handlers exist.
 if(panel.type!=='info')throw Error('Interaktive Panels sind noch nicht implementiert. Bitte Info-Panel verwenden.');
 const msg=await channel.send({embeds:[embed]});
 return {...panel,id:crypto.randomUUID(),messageId:msg.id,createdAt:new Date().toISOString()};
}
