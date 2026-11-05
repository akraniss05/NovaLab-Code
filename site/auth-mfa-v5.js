
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let client=null,pending=false,error='',draft=null,factors=[];
async function refresh(c){
 client=c;pending=false;error='';
 if(!c)return false;
 try{
  const res=await c.auth.mfa.getAuthenticatorAssuranceLevel();
  if(res.error)throw res.error;
  pending=res.data.currentLevel==='aal1'&&res.data.nextLevel==='aal2';
  return pending;
 }catch(e){error=e.message||'Status nicht verfügbar';console.warn('MFA',e);return false}
}
async function list(c){
 const res=await c.auth.mfa.listFactors();if(res.error)throw res.error;factors=res.data.totp||[];return factors;
}
async function verify(c,factorId,code){
 if(!/^\d{6}$/.test(code))throw Error('Bitte einen sechsstelligen Code eingeben');
 const challenge=await c.auth.mfa.challenge({factorId});if(challenge.error)throw challenge.error;
 const verified=await c.auth.mfa.verify({factorId,challengeId:challenge.data.id,code});if(verified.error)throw verified.error;
 await refresh(c);return verified.data;
}
async function renderGate(node,{client:c,onSuccess,onLogout}={}){
 if(!c)return;
 node.innerHTML=`<section class="ll-mfa-gate"><div class="ll-mfa-symbol">🛡</div><span class="eyebrow">SICHERHEIT / ZWEITER FAKTOR</span><h1>Bestätige deine Anmeldung.</h1><p>Öffne deine Authenticator-App und gib deinen aktuellen sechsstelligen Code ein. Erst danach wird die Academy freigegeben.</p><label>Authenticator-Code<input id="ll-mfa-login-code" class="input" autocomplete="one-time-code" inputmode="numeric" maxlength="6" placeholder="000000"></label><div id="ll-mfa-login-message" role="status"></div><div class="flex"><button class="btn primary" id="ll-mfa-login-check">Anmeldung bestätigen</button><button class="btn" id="ll-mfa-login-logout">Abmelden</button></div><p class="micro">Keinen Zugriff mehr? Wende dich an deinen Administrator. Teile Authenticator-Codes niemals mit anderen.</p></section>`;
 const status=$('#ll-mfa-login-message',node);
 $('#ll-mfa-login-logout',node).onclick=()=>onLogout?.();
 $('#ll-mfa-login-check',node).onclick=async()=>{
  try{status.textContent='Code wird geprüft …';const all=await list(c),factor=all.find(f=>f.status==='verified')||all[0];if(!factor)throw Error('Kein verifizierter Authenticator gefunden');await verify(c,factor.id,$('#ll-mfa-login-code',node).value.trim());status.textContent='✓ Erfolgreich';await onSuccess?.()}catch(err){status.textContent='Fehler: '+(err.message||'Code ungültig')}
 };
}
async function renderSettings(node,c){
 if(!node||!c)return;node.innerHTML='<p class="micro">Lade Authenticator-Geräte …</p>';
 try{
  const all=await list(c),verified=all.filter(x=>x.status==='verified'),res=await c.auth.mfa.getAuthenticatorAssuranceLevel(),aal=res.data?.currentLevel;
  node.innerHTML=`<div class="ll-mfa-status"><span>${verified.length?'✓':'○'}</span><div><b>${verified.length?'Authenticator aktiv':'Noch nicht eingerichtet'}</b><small>${verified.length?verified.length+' registrierte(s) Gerät(e)':'Zusätzliche Absicherung für dein Konto'}</small></div></div>
  <p class="micro">Bei aktivierter Zwei-Faktor-Anmeldung wird nach dem Passwort zusätzlich ein Code verlangt. Nutze Google Authenticator, Microsoft Authenticator, 2FAS oder eine kompatible App.</p>
  ${verified.length?verified.map(x=>`<div class="ll-mfa-device"><span>🔑 ${esc(x.friendly_name||'Authenticator')}</span><button class="btn small danger" data-mfa-remove="${esc(x.id)}" ${aal!=='aal2'?'disabled':''}>Entfernen</button></div>`).join('')+'<p class="micro">Entfernen erfordert eine zuvor mit dem Authenticator bestätigte Sitzung (AAL2).</p>':''}
  <div class="flex"><button class="btn primary" id="ll-mfa-enroll">＋ Authenticator einrichten</button><button class="btn" id="ll-mfa-refresh">Aktualisieren</button></div><div id="ll-mfa-enroll-area" aria-live="polite"></div>`;
  $('#ll-mfa-refresh',node).onclick=()=>renderSettings(node,c);
  node.querySelectorAll('[data-mfa-remove]').forEach(btn=>btn.onclick=async()=>{
   if(!confirm('Authenticator wirklich entfernen? Dein Konto ist danach weniger geschützt.'))return;
   try{const res=await c.auth.mfa.unenroll({factorId:btn.dataset.mfaRemove});if(res.error)throw res.error;await refresh(c);await renderSettings(node,c)}catch(err){alert('Entfernen fehlgeschlagen: '+err.message)}
  });
  $('#ll-mfa-enroll',node).onclick=async()=>{
   const area=$('#ll-mfa-enroll-area',node);area.textContent='Einrichtung starten …';
   try{
    const res=await c.auth.mfa.enroll({factorType:'totp',friendlyName:'LiveryLab Academy'});if(res.error)throw res.error;
    draft=res.data;const qr=draft.totp?.qr_code||'';
    area.innerHTML=`<div class="ll-mfa-setup"><h3>Authenticator koppeln</h3><p>Scanne den QR-Code mit deiner Authenticator-App. Falls du am selben Handy bist, kopiere das Geheimnis und gib es manuell ein. Teile es niemals mit anderen.</p><div id="ll-mfa-qr"></div><label>Manueller Schlüssel <input readonly class="input" id="ll-mfa-secret"></label><label>Sechsstelliger Code <input class="input" id="ll-mfa-setup-code" maxlength="6" inputmode="numeric" autocomplete="one-time-code" placeholder="000000"></label><div class="flex"><button class="btn primary" id="ll-mfa-activate">2FA aktivieren</button><button class="btn" id="ll-mfa-cancel">Abbrechen</button></div><p id="ll-mfa-setup-status" role="status"></p></div>`;
    const image=document.createElement('img');image.alt='TOTP QR-Code';image.className='ll-mfa-qr';if(/^data:image\/svg\+xml[;,]/i.test(qr))image.src=qr;$('#ll-mfa-qr',area).append(image);
    $('#ll-mfa-secret',area).value=draft.totp?.secret||'';
    $('#ll-mfa-cancel',area).onclick=async()=>{try{await c.auth.mfa.unenroll({factorId:draft.id})}catch{}draft=null;renderSettings(node,c)};
    $('#ll-mfa-activate',area).onclick=async()=>{const status=$('#ll-mfa-setup-status',area);try{await verify(c,draft.id,$('#ll-mfa-setup-code',area).value.trim());draft=null;status.textContent='✓ Authenticator aktiviert';await renderSettings(node,c)}catch(err){status.textContent=err.message}};
   }catch(e){area.textContent='Einrichtung fehlgeschlagen: '+e.message}
  };
 }catch(e){node.textContent='Authenticator-Status konnte nicht geladen werden: '+e.message}
}
window.LLMFA={refresh,renderGate,renderSettings,get pending(){return pending},get error(){return error}};
})();
