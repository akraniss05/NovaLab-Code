import {test} from 'node:test';
import assert from 'node:assert/strict';
import {db} from '../packages/database/db.ts';
import {actOnTicket,openTicket,writeMessage} from '../packages/database/service.ts';

test('PostgreSQL serializes limits and claims, preserves deduplication, and excludes internal deliveries',{skip:process.env.TEST_DATABASE!=='1'},async()=>{
 const guildId='999999999999999991',ownerId='999999999999999992';
 const payload={guildId,ownerId,source:'web',category:'support',title:'Test ticket',body:'Testing database',requestId:crypto.randomUUID()};
 try{
  const [first,duplicate]=await Promise.all([openTicket(payload,1),openTicket(payload,1)]);
  assert.equal(first.id,duplicate.id);
  await assert.rejects(openTicket({...payload,requestId:crypto.randomUUID()},1));
  const results=await Promise.allSettled([actOnTicket(guildId,first.id,'claim','one',false),actOnTicket(guildId,first.id,'claim','two',false)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  const id=crypto.randomUUID(), privateId=crypto.randomUUID();
  await Promise.all([writeMessage(guildId,first.id,ownerId,id,'public','web'),writeMessage(guildId,first.id,ownerId,id,'public','web')]);
  await writeMessage(guildId,first.id,'staff',privateId,'internal','web',true);
  assert.equal(await db.message.count({where:{id}}),1);
  assert.equal(await db.job.count({where:{id:{in:['message:'+id,'message:'+privateId]}}}),1);
  assert.equal(await db.message.count({where:{ticketId:first.id,internal:false}}),2);
  await actOnTicket(guildId,first.id,'close',ownerId,false);
  await assert.rejects(writeMessage(guildId,first.id,ownerId,crypto.randomUUID(),'after close','web'));
 }finally{
  await db.ticket.deleteMany({where:{guildId}});await db.job.deleteMany({where:{guildId}});await db.audit.deleteMany({where:{guildId}});await db.$disconnect();
 }
});
