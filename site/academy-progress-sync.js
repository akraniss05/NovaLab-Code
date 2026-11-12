/* NovaLab Academy · version-checked cross-tab lesson progress persistence.
 * Separate browser sessions may change different lessons at the same time.
 * No update is allowed to silently replace a newer server revision.
 */
(function(root){
'use strict';
const copy=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const arrays=new Set(['done','watched','practiced','verifiedPractice']);
const records=new Set(['completedAt','exams']);
function merge(base,local,remote){
 const a=base&&typeof base==='object'&&!Array.isArray(base)?base:{};
 const b=local&&typeof local==='object'&&!Array.isArray(local)?local:{};
 const c=remote&&typeof remote==='object'&&!Array.isArray(remote)?remote:{};
 const result=copy(c);
 for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
  const previous=a[key],next=b[key];
  if(same(previous,next))continue;
  if(arrays.has(key)){
   const prev=Array.isArray(previous)?previous:[],current=Array.isArray(next)?next:[],latest=Array.isArray(result[key])?result[key]:[];
   const removed=new Set(prev.filter(v=>!current.includes(v)));
   const combined=latest.filter(v=>!removed.has(v));
   for(const item of current)if(!prev.includes(item)&&!combined.includes(item))combined.push(copy(item));
   result[key]=combined;
  }else if(records.has(key)){
   const original=previous&&typeof previous==='object'&&!Array.isArray(previous)?previous:{};
   const updated=next&&typeof next==='object'&&!Array.isArray(next)?next:{};
   const merged=result[key]&&typeof result[key]==='object'&&!Array.isArray(result[key])?copy(result[key]):{};
   for(const item of new Set([...Object.keys(original),...Object.keys(updated)])){
    if(same(original[item],updated[item]))continue;
    if(!Object.prototype.hasOwnProperty.call(updated,item))delete merged[item];
    else merged[item]=copy(updated[item]);
   }
   result[key]=merged;
  }else if(key==='lastLesson'){
   const t1=Date.parse(next?.at||''),t2=Date.parse(result[key]?.at||'');
   if(!next){delete result[key];}
   else if(!Number.isFinite(t2)||!Number.isFinite(t1)||t1>=t2)result[key]=copy(next);
  }else if(next===undefined)delete result[key];
  else result[key]=copy(next);
 }
 return result;
}
async function save(client,userId,key,base,draft){
 if(!userId||!client||!key)throw Error('Ein angemeldetes Konto wird zum Speichern benötigt.');
 for(let attempt=0;attempt<5;attempt++){
  const current=await client.from('academy_progress').select('payload,updated_at')
   .eq('user_id',userId).eq('key',key).maybeSingle();
  if(current.error)throw current.error;
  const latest=current.data;
  if(latest&&(!latest.payload||typeof latest.payload!=='object'||Array.isArray(latest.payload)))
   throw Error('Ungültiger Fortschritt im Online-Speicher. Die gespeicherten Daten wurden nicht überschrieben.');
  const combined=merge(base,draft,latest?.payload||{});
  const timestamp=new Date(Math.max(Date.now(),(Date.parse(latest?.updated_at||'')||0)+1)).toISOString();
  let response;
  if(latest){
   response=await client.from('academy_progress')
    .update({payload:combined,updated_at:timestamp})
    .eq('user_id',userId).eq('key',key).eq('updated_at',latest.updated_at)
    .select('payload,updated_at').maybeSingle();
  }else{
   response=await client.from('academy_progress')
    .insert({user_id:userId,key,payload:combined,updated_at:timestamp})
    .select('payload,updated_at').single();
  }
  if(response.error){
   // A concurrent first insert can lose the unique-key race; reload and retry.
   if(!latest&&response.error.code==='23505')continue;
   throw response.error;
  }
  if(!response.data)continue; // Another device updated the row first.
  return {payload:copy(response.data.payload),updated_at:response.data.updated_at};
 }
 throw Error('Dein Fortschritt wurde gleichzeitig in einem anderen Tab verändert. Bitte erneut speichern.');
}
root.LLProgressSync={copy,merge,save};
})(typeof module!=='undefined'&&module.exports?module.exports:window);
