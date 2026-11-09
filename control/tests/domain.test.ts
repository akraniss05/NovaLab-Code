import {test} from 'node:test';
import assert from 'node:assert/strict';
import {answersFor,configSchema,defaults,escapeHtml,ticketChange,ticketNumber} from '../packages/shared/domain.ts';

test('initial templates require deliberate configuration and separate trusted roles',()=>{
 assert.ok(defaults.panels.every(p=>!p.channelId));
 assert.ok(defaults.categories.every(p=>!p.enabled));
 const role='123456789012345678';
 assert.equal(configSchema.safeParse({...defaults,websiteRole:role,autoRoles:[role]}).success,false);
 assert.equal(configSchema.safeParse({...defaults,websiteRole:role}).success,true);
});
test('ticket number and transition rules',()=>{
 assert.equal(ticketNumber(124),'NL-000124');
 assert.deepEqual(ticketChange({status:'open',assignee:null},'claim','a',false),{status:'working',assignee:'a'});
 assert.throws(()=>ticketChange({status:'working',assignee:'a'},'transfer','b',false,'c'));
 assert.deepEqual(ticketChange({status:'working',assignee:'a'},'transfer','a',false,'c'),{status:'working',assignee:'c'});
 assert.throws(()=>ticketChange({status:'closed',assignee:'a'},'claim','a',true));
});
test('required and typed application answers are enforced',()=>{
 const base=defaults.forms[0];
 assert.throws(()=>answersFor(base,{}));
 const form={...base,questions:[{id:'number',label:'Count',type:'number' as const,required:true,choices:[]},{id:'yes',label:'Confirm',type:'yesno' as const,required:true,choices:[]}]};
 assert.deepEqual(answersFor(form,{number:0,yes:false,injected:'ignored'}),{number:0,yes:false});
 assert.throws(()=>answersFor(form,{number:'1',yes:false}));
});
test('transcript escapes user content',()=>assert.equal(escapeHtml('<img "x" onerror=\'1\'>&'),'&lt;img &quot;x&quot; onerror=&#39;1&#39;&gt;&amp;'));
