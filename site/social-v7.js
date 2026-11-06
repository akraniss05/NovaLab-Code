/* LiveryLab Academy 7 | Freundschaften & fairer Check-in-Wettbewerb
 * Made with 💙 by NyxAtheris (LiveryLab). */
(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Math.max(0,Number(n)||0).toLocaleString('de-DE');
const btn=(label,action,id,primary=false)=>'<button class="btn small '+(primary?'primary':'')+'" data-social="'+action+'" data-id="'+esc(id||'')+'">'+label+'</button>';
let root=null,client=null,content=null,ctrl=null,pending=false;
function message(v){const el=root?.querySelector('#llsocial-status');if(el)el.textContent=String(v)}
async function request(method,args){if(!client)throw Error('Anmeldung erforderlich.');const r=await client.rpc(method,args||{});if(r.error)throw r.error;return r.data}
const empty=(v,emoji)=>'<div class="llsocial-empty"><span>'+emoji+'</span><p>'+v+'</p></div>';
function build(){
 if(!root)return;
 const d=content||{},friends=Array.isArray(d.friends)?d.friends:[],reqs=Array.isArray(d.requests)?d.requests:[],battles=Array.isArray(d.battles)?d.battles:[];
 const incoming=reqs.filter(x=>x.incoming),sent=reqs.filter(x=>!x.incoming);
 const friendRows=friends.map(f=>'<article class="llsocial-person"><div class="llsocial-avatar">'+esc(f.name).slice(0,1).toUpperCase()+'</div><div class="llsocial-person-main"><strong>'+esc(f.name)+'</strong><small>'+num(f.lessons)+' Lektionen · '+num(f.streak)+' Check-in-Tage</small></div><div class="llsocial-count">'+num(f.points)+' <small>Punkte</small></div><div class="llsocial-buttons">'+btn('⚡ Duell starten','challenge',f.id,true)+btn('Entfernen','remove',f.id)+'</div></article>').join('');
 const incomingRows=incoming.map(f=>'<article class="llsocial-person"><div class="llsocial-avatar">'+esc(f.name).slice(0,1).toUpperCase()+'</div><div class="llsocial-person-main"><strong>'+esc(f.name)+'</strong><small>Möchte sich mit dir verbinden</small></div><div class="llsocial-buttons">'+btn('Annehmen','accept',f.id,true)+btn('Ablehnen','decline',f.id)+'</div></article>').join('');
 const challengeRows=battles.map(b=>{
  const mine=Math.max(0,Number(b.my_points)||0),theirs=Math.max(0,Number(b.friend_points)||0),pending=b.status==='pending',done=b.ends&&new Date(b.ends)<=new Date();
  const pendingUi=b.incoming?'<div class="llsocial-buttons">'+btn('Duell annehmen','battle-accept',b.id,true)+btn('Ablehnen','battle-decline',b.id)+'</div>':'<span class="pill">Einladung gesendet</span>';
  const scoreboard='<div class="llsocial-score"><strong>'+num(mine)+'</strong><span>SERVER-PUNKTE</span><strong>'+num(theirs)+'</strong></div><div class="llsocial-scoreline"><span style="width:'+Math.round(100*mine/Math.max(1,mine+theirs))+'%"></span></div>';
  return '<article class="llsocial-duel"><h3>Du <span>vs</span> '+esc(b.name)+'</h3><p class="micro">'+(pending?'Wartet auf Annahme':done?'Abgeschlossen':'7-Tage-Duell läuft')+'</p>'+(pending?pendingUi:scoreboard)+'</article>';
 }).join('');
 root.innerHTML='<div class="llsocial-page"><div class="llsocial-hero"><span class="eyebrow">COMMUNITY / LIVERYLAB</span><h1>Gemeinsam lernen.<br><em>Freundschaftlich messen.</em></h1><p>Einladungen annehmen, Fortschritte vergleichen und freiwillige Sieben-Tage-Duelle mit serverseitig bestätigten Punkten austragen.</p><div class="llsocial-summary"><div><b>'+friends.length+'</b><span>Freunde</span></div><div><b>'+incoming.length+'</b><span>Offene Anfragen</span></div><div><b>'+battles.filter(x=>x.status==='accepted'&&new Date(x.ends)>new Date()).length+'</b><span>Aktive Duelle</span></div></div></div>'+
 '<div class="llsocial-grid"><section class="panel"><span class="eyebrow">VERBINDEN</span><h2>Freund hinzufügen</h2><p class="micro">Gib den exakten Benutzernamen ein. E-Mail-Adressen sind nicht für andere sichtbar.</p><form id="llsocial-form"><label for="llsocial-username">Benutzername</label><div class="llsocial-field"><input class="input" id="llsocial-username" autocomplete="off" minlength="3" maxlength="24" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" placeholder="Beispiel: MaxDev" required><button class="btn primary" type="submit">Anfragen</button></div></form><h3>Eingehende Anfragen</h3>'+(incomingRows||empty('Noch keine Anfragen.','◉'))+(sent.length?'<h3>Gesendet</h3>'+sent.map(f=>'<p class="micro">○ '+esc(f.name)+' – wartet auf Annahme</p>').join(''):'')+'</section>'+
 '<section class="panel"><span class="eyebrow">MEIN NETZWERK</span><h2>Freunde</h2>'+(friendRows||empty('Verbinde dich mit deinen ersten Lernpartnern.','✧'))+'<p class="micro">Angezeigte Lektionen stammen aus dem synchronisierten Fortschritt und sind keine offiziellen Prüfungsergebnisse.</p></section></div>'+
 '<section class="panel llsocial-arena"><div class="llsocial-arena-head"><div><span class="eyebrow">BATTLE ARENA</span><h2>Sieben-Tage-Duelle</h2></div><span>Kein Geldeinsatz · kein Punktetransfer</span></div><p class="micro">Für jedes angenommene Duell zählen die während der sieben Tage serverseitig bestätigten Check-in-Punkte.</p><div class="llsocial-duels">'+(challengeRows||empty('Noch keine Duelle – starte eins mit einem Freund.','⚡'))+'</div></section><div id="llsocial-status" role="status" aria-live="polite" class="micro">Deine Daten werden anhand deiner Anmeldung geschützt.</div></div>';
 root.querySelector('#llsocial-form')?.addEventListener('submit',async e=>{e.preventDefault();await doAction('academy_social_send',{p_username:root.querySelector('#llsocial-username').value.trim()},'Anfrage wurde gesendet.')},{signal:ctrl.signal});
 root.querySelectorAll('[data-social]').forEach(x=>x.addEventListener('click',()=>handle(x),{signal:ctrl.signal}));
}
async function refresh(){try{const d=await request('academy_social_snapshot');if(!root)return;content=d&&typeof d==='object'?d:{};build()}catch(e){build();message('Freundesliste nicht verfügbar: '+e.message)}}
async function doAction(name,args,success){if(pending)return;pending=true;message('Server prüft deine Anfrage …');try{await request(name,args);await refresh();message(success)}catch(e){message('Fehler: '+e.message)}finally{pending=false}}
async function handle(button){
 const id=button.dataset.id,action=button.dataset.social;
 if(!/^[a-f0-9]{8}-[a-f0-9-]{27,}$/i.test(id))return message('Ungültige Kennung.');
 const actions={
  accept:['academy_social_respond',{p_friend:id,p_accept:true},'Freundschaft bestätigt.'],
  decline:['academy_social_respond',{p_friend:id,p_accept:false},'Anfrage abgelehnt.'],
  remove:['academy_social_remove',{p_friend:id},'Freundschaft beendet.'],
  challenge:['academy_social_challenge',{p_friend:id},'Duell-Einladung versendet.'],
  'battle-accept':['academy_social_battle_respond',{p_battle:id,p_accept:true},'Duell angenommen.'],
  'battle-decline':['academy_social_battle_respond',{p_battle:id,p_accept:false},'Duell abgelehnt.']
 };
 if(action==='remove'&&!confirm('Freundschaft wirklich entfernen?'))return;
 if(actions[action])await doAction(...actions[action]);
}
async function render(node,c){ctrl?.abort();ctrl=new AbortController();root=node;client=c;content=null;build();message('Lade Freunde und Duelle …');await refresh()}
window.LLSocial={render};
})();