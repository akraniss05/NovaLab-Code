/* LiveryLab Academy · cross-device exercise autosave & five-stage resume.
 * Made with 💙 by NyxAtheris (LiveryLab Studios).
 * Authenticated Supabase draft rows are owned by auth.uid() via RLS.
 */
(function(root){
'use strict';
let bridge=null, userKey='', session=0;
const records=new Map(),timers=new Map(),flights=new Map();
const debounceMs=1000;
function localKey(id){return 'liverylab-draft-'+id;}
function fallback(id){try{return localStorage.getItem(localKey(id))||'';}catch(_){return '';}}
function writeLocal(id,content){try{localStorage.setItem(localKey(id),content);}catch(_){/* Storage unavailable */}}
function removeLocal(id){try{localStorage.removeItem(localKey(id));}catch(_){}}
function state(){return bridge&&bridge.state();}
function api(){return bridge&&bridge.client();}
function uid(){return state()?.user?.id||'';}
function clampStep(step){return Math.max(1,Math.min(5,Math.floor(Number(step)||1)));}
function hasId(id){return typeof id==='string' && /^[\w.-]{1,150}$/.test(id);}
function label(id,text){if(document.querySelector('#practice-status') && (root.location?.hash||'').includes('lesson/'+id))document.querySelector('#practice-status').textContent=text;}
function attach(b){bridge=b;userKey=uid();}
function clear(){
 session++;for(const timer of timers.values())clearTimeout(timer);
 timers.clear();records.clear();flights.clear();userKey='';
}
async function load(id){
 if(!hasId(id)||!api()||!uid())return {content:fallback(id),step:1};
 if(userKey!==uid()){clear();userKey=uid();}
 const currentSession=session,account=uid(),local=fallback(id);
 const result=await api().from('academy_code_drafts').select('content,step,updated_at').eq('user_id',account).eq('lesson_id',id).maybeSingle();
 if(currentSession!==session||uid()!==account)return {content:local,step:1};
 if(result.error){bridge.notice('Cloud-Entwurf nicht geladen – lokale Sicherung bleibt erhalten.');return {content:local,step:1};}
 const server=result.data;
 const content=server?String(server.content||'').slice(0,10000):local;
 const step=clampStep(server?.step||1);
 // Preserve pre-cloud drafts on first sync.
 if(server)writeLocal(id,content);
 records.set(id,{content,step,changed:false});
 if(!server && local)queue(id,local,step);
 return {content,step};
}
function queue(id,content,step){
 if(!hasId(id)||!uid())return;
 const value=String(content||'').slice(0,10000),old=records.get(id),nextStep=clampStep(step||old?.step||1);
 records.set(id,{content:value,step:nextStep,changed:true});writeLocal(id,value);
 clearTimeout(timers.get(id));timers.set(id,setTimeout(()=>{void flush(id);},debounceMs));
 label(id,'Entwurf wird gespeichert …');
}
function mark(id,step){
 if(!hasId(id)||!uid())return;
 const current=records.get(id)||{content:fallback(id),step:1};
 queue(id,current.content,step);
 if(bridge?.onStep)bridge.onStep(id,clampStep(step));
 updateButtons(clampStep(step));
}
async function flush(id){
 if(!hasId(id)||!uid())return false;
 clearTimeout(timers.get(id));timers.delete(id);
 const data=records.get(id);if(!data?.changed)return true;
 const currentSession=session,account=uid(),payload={user_id:account,lesson_id:id,content:data.content,step:data.step,updated_at:new Date().toISOString()};
 // Serialize successive writes to avoid out-of-order old autosaves overwriting new code.
 const previous=flights.get(id)||Promise.resolve();
 const job=previous.catch(()=>{}).then(async()=>{
  if(session!==currentSession||uid()!==account)return false;
  const response=await api().from('academy_code_drafts').upsert(payload,{onConflict:'user_id,lesson_id'});
  if(response.error){label(id,'Nur lokal gespeichert · Cloud nicht erreichbar');return false;}
  const now=records.get(id);
  if(now&&now.content===payload.content&&now.step===payload.step){now.changed=false;label(id,'✓ Auf deinem Konto gespeichert');}
  return true;
 });
 flights.set(id,job);
 try{return await job;}catch(_){label(id,'Nur lokal gespeichert · Cloud nicht erreichbar');return false;}
 finally{if(flights.get(id)===job)flights.delete(id);}
}
async function remove(id){
 if(!hasId(id)||!uid())return;
 clearTimeout(timers.get(id));timers.delete(id);
 const flight=flights.get(id);if(flight)try{await flight;}catch(_){}
 const account=uid();
 const result=await api().from('academy_code_drafts').delete().eq('user_id',account).eq('lesson_id',id);
 if(result.error)throw result.error;
 records.delete(id);removeLocal(id);
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
 if(status)status.textContent='Zuletzt bearbeitet: Schritt '+clampStep(step)+' von 5 · Code im Konto gespeichert';
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
