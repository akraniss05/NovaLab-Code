import { REST, Routes, PermissionFlagsBits as P, type APIGuild, type APIGuildMember, type APIRole } from 'discord.js';
import { env } from '../config/env.ts';
export const discord=new REST({version:'10'}).setToken(env.DISCORD_TOKEN);
export const getGuild=async(id:string)=>await discord.get(Routes.guild(id),{query:new URLSearchParams({with_counts:'true'})}) as APIGuild & {approximate_member_count?:number;approximate_presence_count?:number};
export const getRoles=async(id:string)=>await discord.get(Routes.guildRoles(id)) as APIRole[];
export async function member(guild:string,id:string){
 try{return await discord.get(Routes.guildMember(guild,id)) as APIGuildMember;}
 catch(error){if(typeof error==='object'&&error&&'code' in error&&error.code===10007)return null;throw error;}
}
export async function identity(guild:string,user:string){
 const [g,m,roles]=await Promise.all([getGuild(guild),member(guild,user),getRoles(guild)]);
 const permissions=roles.filter(r=>r.id===guild||m?.roles.includes(r.id)).reduce((bits,r)=>bits|BigInt(r.permissions),0n);
 return {member:m,admin:!!m&&(g.owner_id===user||Boolean(permissions&P.Administrator)),guild:g,roles};
}
const prohibited=P.Administrator|P.ManageGuild|P.ManageRoles|P.ManageChannels|P.ManageWebhooks|P.BanMembers|P.KickMembers|P.ModerateMembers|P.ManageMessages|P.MentionEveryone|P.ViewAuditLog;
export async function changeRoles(guild:string,user:string,add:string[],remove:string[],actor?:string){
 const [g,roles,target,bot,operator]=await Promise.all([getGuild(guild),getRoles(guild),member(guild,user),member(guild,env.DISCORD_CLIENT_ID),actor?member(guild,actor):null]);
 if(!target||!bot||user===g.owner_id||target.user?.bot||actor&&!operator)throw Error('Invalid role target');
 const higher=(a:APIRole,b:APIRole)=>a.position>b.position||a.position===b.position&&BigInt(a.id)<BigInt(b.id);
 const highest=(ids:string[])=>roles.filter(r=>ids.includes(r.id)||r.id===guild).reduce((a,b)=>higher(a,b)?a:b);
 const botTop=highest(bot.roles),targetTop=highest(target.roles),operatorTop=operator?highest(operator.roles):null;
 if(!higher(botTop,targetTop)||operatorTop&&actor!==g.owner_id&&!higher(operatorTop,targetTop))throw Error('Role hierarchy');
 for(const id of new Set([...add,...remove])){
  const role=roles.find(r=>r.id===id);
  if(!role||role.id===guild||role.managed||!higher(botTop,role)||operatorTop&&actor!==g.owner_id&&!higher(operatorTop,role)||Boolean(BigInt(role.permissions)&prohibited))throw Error('Unsafe role');
 }
 for(const id of new Set(remove))await discord.delete(Routes.guildMemberRole(guild,user,id));
 for(const id of new Set(add))await discord.put(Routes.guildMemberRole(guild,user,id));
}
