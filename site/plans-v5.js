/* LiveryLab Academy 5: server-verified plans & usage. Made with 💙 by NyxAtheris (LiveryLab) */
(()=>{
'use strict';
let client=null,currentUser=null,tier='free';
const listeners=new Set();
function notify(){for(const fn of listeners){try{fn(tier)}catch(e){console.warn(e)}}}
async function configure(c,u){
  if(!c||!u){client=null;currentUser=null;tier='free';notify();return}
  const changed=currentUser!==u.id;client=c;currentUser=u.id;
  if(changed)tier='free';
  try{
    const {data,error}=await client.from('academy_plans').select('tier').eq('user_id',u.id).maybeSingle();
    if(error)throw error;
    tier=data?.tier==='pro'?'pro':'free';
  }catch(err){console.warn('Tarifprüfung nicht möglich',err.message);tier='free'}
  notify();
}
async function use(feature){
 if(!client||!currentUser)return{allowed:false,reason:'Bitte anmelden, um dieses Werkzeug zu verwenden.'};
 try{
  const {data,error}=await client.rpc('academy_consume_tool',{p_feature:feature});
  if(error)throw error;
  return{...data,reason:data?.allowed?'':data?.pro_only?'Dieses Werkzeug benötigt LiveryLab Pro.':'Dein Free-Tageslimit ist erreicht. Morgen (UTC) wird es zurückgesetzt oder der Admin kann Pro freischalten.'};
 }catch(err){console.warn('Feature access',err);return{allowed:false,reason:'Freischaltung momentan nicht prüfbar: '+(err.message||'Serverfehler')}}
}
async function setTier(uid,next){
 if(!client||!currentUser)throw Error('Bitte als Administrator anmelden');
 if(!/^[a-f0-9-]{36}$/i.test(uid)||!['free','pro'].includes(next))throw Error('Ungültige Freischaltung');
 const {error}=await client.from('academy_plans').upsert({user_id:uid,tier:next,granted_by:currentUser,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)throw error;
 if(uid===currentUser){tier=next;notify()}
 return true;
}
async function memberTiers(){
 if(!client||!currentUser)return{};
 const {data,error}=await client.from('academy_plans').select('user_id,tier');
 if(error)throw error;
 return Object.fromEntries((data||[]).map(x=>[x.user_id,x.tier]));
}
window.LLPro={configure,use,setTier,memberTiers,get tier(){return tier},get isPro(){return tier==='pro'},subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)}};
})();