import { Prisma } from '@prisma/client';
import { db } from './db.ts';
import { activeTicket, configSchema, defaults, ticketChange } from '../shared/domain.ts';
export async function settings(guildId:string){
 const row=await db.guildConfig.findUnique({where:{guildId}});
 return {revision:row?.revision??0,config:row?configSchema.parse(row.data):defaults};
}
export class Failure extends Error {
 statusCode:number;
 constructor(status:number,message:string){super(message);this.statusCode=status;}
}
export async function lock<T>(key:string,fn:(tx:Prisma.TransactionClient)=>Promise<T>){
 return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${key},0))`;
  return fn(tx);
 });
}
export function openTicket(input:{guildId:string;ownerId:string;source:string;category:string;title:string;body:string;requestId:string},limit:number){
 return lock('ticket:'+input.guildId+':'+input.ownerId,async tx=>{
  const {body,...data}=input;
  const current=await tx.ticket.findFirst({where:{guildId:data.guildId,ownerId:data.ownerId,requestId:data.requestId}});
  if(current)return current;
  const count=await tx.ticket.count({where:{guildId:data.guildId,ownerId:data.ownerId,status:{notIn:['closed','archived']}}});
  if(count>=limit)throw new Failure(409,'Open ticket limit reached');
  const ticket=await tx.ticket.create({data:{...data,messages:{create:{id:crypto.randomUUID(),authorId:data.ownerId,source:'intake',body}}}});
  await tx.job.create({data:{id:'channel:'+ticket.id,guildId:ticket.guildId,kind:'channel',data:{ticketId:ticket.id}}});
  await tx.audit.create({data:{guildId:ticket.guildId,actorId:data.ownerId,kind:'ticket.open',data:{ticketId:ticket.id}}});
  return ticket;
 });
}
export function writeMessage(guildId:string,ticketId:number,authorId:string,id:string,body:string,source:string,internal=false){
 return lock('conversation:'+ticketId,async tx=>{
  const ticket=await tx.ticket.findFirst({where:{id:ticketId,guildId}});
  if(!ticket)throw new Failure(404,'Ticket unavailable');
  const existing=await tx.message.findUnique({where:{id}});
  if(existing){
   if(existing.ticketId!==ticketId||existing.authorId!==authorId||existing.body!==body||existing.internal!==internal||existing.source!==source)throw new Failure(409,'Message identifier already used');
   return existing;
  }
  if(!activeTicket(ticket.status))throw new Failure(409,'Ticket unavailable');
  const message=await tx.message.create({data:{id,ticketId,authorId,body,source,internal}});
  await tx.ticket.update({where:{id:ticketId},data:{updatedAt:new Date()}});
  if(['web','staff'].includes(source)&&!internal)await tx.job.create({data:{id:'message:'+id,guildId,kind:'message',data:{ticketId,messageId:id}}});
  return message;
 });
}
export function actOnTicket(guildId:string,ticketId:number,action:string,actor:string,admin:boolean,target?:string){
 return lock('conversation:'+ticketId,async tx=>{
  const ticket=await tx.ticket.findFirst({where:{id:ticketId,guildId}});
  if(!ticket)throw new Failure(404,'Ticket missing');
  let data;
  try{data=ticketChange(ticket,action,actor,admin,target);}catch{throw new Failure(409,'Ticket action rejected');}
  const result=await tx.ticket.update({where:{id:ticketId},data});
  await tx.audit.create({data:{guildId,actorId:actor,kind:'ticket.'+action,data:{ticketId,target:target??null}}});
  if(result.channelId&&['transfer','close','reopen'].includes(action)){
   await tx.job.create({data:{id:crypto.randomUUID(),guildId,kind:'ticket-event',data:{ticketId,action,target:target??null}}});
  }
  return result;
 });
}
