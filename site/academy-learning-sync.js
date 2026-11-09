/* NovaLab Academy · local per-user browser lesson drafts and resume.
 * New edits remain on this device in localStorage; no cloud autosave.
 * Previously saved cloud drafts may be imported one time when no local copy exists.
 * Made with 💙 by NyxAtheris (NovaLab Academy).
 */
(function(root){
'use strict';
let bridge=null,userKey='';
const records=new Map();
function state(){return bridge&&bridge.state();}
function api(){return bridge&&bridge.client();}
function uid(){return state()?.user?.id||'';}
function hasId(id){return typeof id==='string'&&/^[\w.-]{1,150}$/.test(id);}
function clampStep(step){return Math.max(1,Math.min(5,Math.floor(Number(step)||1)));}
function localKey(id){return 'liverylab-draft-'+(uid()||'guest')+'-'+id;}
function stepKey(id){return 'liverylab-draft-step-'+(uid()||'guest')+'-'+id;}
function deletedKey(id){return 'liverylab-draft-deleted-'+(uid()||'guest')+'-'+id;}
function label(id,text){
 if(document.querySelector('#practice-status')&&(root.location?.hash||'').includes('lesson/'+id)){
  document.querySelector('#practice-status').textContent=text;
 }
}
function read(key){try{return localStorage.getItem(key);}catch(_){return null;}}
function write(key,value){try{localStorage.setItem(key,String(value));}catch(_){}}
function erase(key){try{localStorage.removeItem(key);}catch(_){}}
function fallback(id){
 const own=read(localKey(id));
 if(own!==null)return own;
 if(read(deletedKey(id))==='1')return '';
 // Permit a one-time migration of old unscoped browser code to the
 // original account only, so members sharing a device cannot see each other's drafts.
 let owner=read('liverylab-legacy-draft-owner');
 if(!owner&&uid()){owner=uid();write('liverylab-legacy-draft-owner',owner);}
 return owner&&owner===uid()?(read('liverylab-draft-'+id)||''):'';
}
function attach(b){bridge=b;userKey=uid();}
function clear(){records.clear();userKey='';}
async function load(id){
 if(!hasId(id)||!uid())return {content:'',step:1};
 if(userKey!==uid()){records.clear();userKey=uid();}
 const account=uid(),record=records.get(id);
 if(record)return {content:record.content,step:record.step};
 const scoped=read(localKey(id)),deleted=read(deletedKey(id))==='1';
 if(scoped!==null||deleted){
  const content=deleted?'':scoped||'',step=clampStep(read(stepKey(id)));
  records.set(id,{content,step});
  return {content,step};
 }
 const legacy=fallback(id);
 if(legacy){
  write(localKey(id),legacy);
  const step=clampStep(read(stepKey(id)));
  records.set(id,{content:legacy,step});
  return {content:legacy,step};
 }
 // Import old authenticated cloud drafts just once, if available.
 // New edits and step changes are never sent to the server.
 if(api()&&typeof api().from==='function'){
  try{
   const response=await api().from('academy_code_drafts').select('content,step').eq('user_id',account).eq('lesson_id',id).maybeSingle();
   if(uid()!==account)return {content:'',step:1};
   if(!response.error&&response.data){
    const content=String(response.data.content||'').slice(0,10000);
    const step=clampStep(response.data.step);
    write(localKey(id),content);write(stepKey(id),step);
    records.set(id,{content,step});
    return {content,step};
   }
  }catch(_){}
 }
 write(localKey(id),'');
 records.set(id,{content:'',step:1});
 return {content:'',step:1};
}
function queue(id,content,step){
 if(!hasId(id)||!uid())return;
 const value=String(content||'').slice(0,10000);
 const nextStep=clampStep(step||records.get(id)?.step||read(stepKey(id))||1);
 erase(deletedKey(id));
 write(localKey(id),value);write(stepKey(id),nextStep);
 records.set(id,{content:value,step:nextStep});
 label(id,'✓ Nur auf diesem Gerät gespeichert');
}
function mark(id,step){
 if(!hasId(id)||!uid())return;
 queue(id,records.get(id)?.content??fallback(id),step);
 if(bridge?.onStep)bridge.onStep(id,clampStep(step));
 updateButtons(clampStep(step));
}
async function flush(id){return hasId(id)&&!!uid();}
async function remove(id){
 if(!hasId(id)||!uid())return;
 records.delete(id);
 erase(localKey(id));erase(stepKey(id));
 write(deletedKey(id),'1'); // Blocks re-importing a deleted legacy cloud draft.
}
function stepBar(step,watched,practiced,quiz,finished){
 const names=['Erklären','Video','Code','Quiz','Ergebnis'];
 const statuses=[true,watched,practiced,quiz,finished];
 return '<nav class="ll-five-stage" aria-label="Fünf Schritte der Lektion">'+names.map((name,i)=>{
   const current=clampStep(step)===i+1;
   return '<button type="button" data-learning-step="'+(i+1)+'" class="'+(current?'is-current ':'' )+(statuses[i]?'is-done':'')+'" aria-current="'+(current?'step':'false')+'">'+
   '<span>'+(statuses[i]?'✓':String(i+1).padStart(2,'0'))+'</span><strong>'+name+'</strong></button>';
 }).join('')+'</nav>';
}
function updateButtons(step){
 document.querySelectorAll('[data-learning-step]').forEach(el=>{
  const current=Number(el.dataset.learningStep)===step;
  el.classList.toggle('is-current',current);
  el.setAttribute('aria-current',current?'step':'false');
 });
}
function anchor(step){return ['lesson-explanation','lesson-video','lesson-practice','quiz-area','lesson-summary'][clampStep(step)-1];}
function restore(id,step){
 if(!(root.location?.hash||'').endsWith('lesson/'+id))return;
 updateButtons(clampStep(step));
 const status=document.querySelector('#learning-resume');
 if(status)status.textContent='Zuletzt bearbeitet: Schritt '+clampStep(step)+' von 5 · Entwurf nur in diesem Browser gespeichert';
}
document.addEventListener('click',event=>{
 const target=event.target.closest?.('[data-learning-step]');
 if(!target||!bridge||!uid())return;
 event.preventDefault();
 const id=(root.location?.hash||'').split('lesson/')[1];
 const step=clampStep(target.dataset.learningStep);
 if(!id)return;
 mark(id,step);
 const element=document.getElementById(anchor(step));
 if(element)element.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
});
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')for(const id of timers.keys())void flush(id);});
root.LLLearning={attach,clear,load,queue,mark,flush,remove,stepBar,restore,step:clampStep,anchor};
})(window);
