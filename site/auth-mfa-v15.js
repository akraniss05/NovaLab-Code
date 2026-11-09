/* NovaLab Academy v15 · Supabase Authenticator-App (TOTP)
 * Made with 💙 from NyxAtheris (NovaLab Academy)
 * The server, not this UI, validates verification codes and enforces AAL2.
 */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let pending=false,loadError='',activeClient=null;
const labels={idle:'Noch nicht verbunden',ready:'Authenticator aktiviert'};
const six=v=>/^\d{6}$/.test(String(v||'').trim());
function message(target,text,bad=false){
 if(!target)return;
 target.textContent=text||'';
 target.className='mfa-message'+(bad?' error':'');
 target.hidden=!text;
}
async function levels(c){
 const r=await c.auth.mfa.getAuthenticatorAssuranceLevel();
 if(r.error)throw r.error;
 return r.data;
}
async function refresh(c){
 activeClient=c;pending=false;loadError='';
 try{
  if(!c)throw Error('Keine aktive Anmeldung vorhanden.');
  const info=await levels(c);
  pending=info.currentLevel!=='aal2'&&info.nextLevel==='aal2';
  return pending;
 }catch(e){
  pending=true;
  loadError=e?.message||'Sicherheitsstatus konnte nicht geladen werden.';
  return true;
 }
}
async function list(c){
 const r=await c.auth.mfa.listFactors();
 if(r.error)throw r.error;
 return (r.data?.totp||[]).filter(x=>x.factor_type==='totp'||x.factor_type===undefined);
}
async function verify(c,id,value){
 const code=String(value||'').trim();
 if(!six(code))throw Error('Bitte genau sechs Ziffern aus deiner Authenticator-App eingeben.');
 const ch=await c.auth.mfa.challenge({factorId:id});
 if(ch.error)throw ch.error;
 const r=await c.auth.mfa.verify({factorId:id,challengeId:ch.data.id,code});
 if(r.error)throw r.error;
 await refresh(c);
 return r.data;
}
function button(id,text,kind=''){
 return '<button type="button" class="btn '+kind+'" id="'+id+'">'+text+'</button>';
}
function codeInput(id){
 return '<input id="'+id+'" class="input mfa-code-input" inputmode="numeric" pattern="[0-9]{6}" type="text" autocomplete="one-time-code" maxlength="6" aria-label="Sechsstelliger Authenticator-Code" placeholder="000 000" />';
}
async function renderGate(node,{client:c,onSuccess,onLogout}={}){
 if(!node||!c)return;
 node.innerHTML='<section class="mfa-gate-card"><div class="mfa-icon-large">✦</div>'+
 '<span class="eyebrow">2-FAKTOR-ANMELDUNG</span><h1>Bestätige, dass <em>du es bist.</em></h1>'+
 '<p class="lede">Dein Passwort ist bestätigt. Öffne jetzt deine Authenticator-App und gib den aktuellen sechsstelligen Sicherheitscode ein.</p>'+
 '<div class="mfa-gate-fields"><label class="form-label" for="ll-mfa-login-code">Authenticator-Code</label>'+
 codeInput('ll-mfa-login-code')+'<div id="ll-mfa-login-message" class="mfa-message" role="status" aria-live="polite" hidden></div></div>'+
 '<div class="mfa-actions">'+button('ll-mfa-login-check','Code bestätigen →','primary')+
 button('ll-mfa-login-logout','Abmelden')+'</div>'+
 '<p class="micro">Verwende die Authenticator-App, die du bei der Einrichtung verbunden hast. Gib deinen Code niemals an andere weiter.</p></section>';
 const info=$('#ll-mfa-login-message',node),field=$('#ll-mfa-login-code',node),
 check=$('#ll-mfa-login-check',node),out=$('#ll-mfa-login-logout',node);
 out.onclick=()=>onLogout?.();
 if(loadError){
  message(info,'Der Sicherheitsstatus konnte nicht geladen werden. Bitte erneut prüfen.',true);
  check.textContent='Sicherheitsstatus erneut prüfen';
  check.onclick=async()=>{
   check.disabled=true;
   await refresh(c);
   check.disabled=false;
   if(loadError){message(info,'Verbindung fehlgeschlagen. Versuche es erneut.',true);return;}
   if(!pending)await onSuccess?.();
   else await renderGate(node,{client:c,onSuccess,onLogout});
  };
  return;
 }
 const finish=async()=>{
  if(check.disabled)return;
  if(!six(field.value)){message(info,'Bitte einen sechsstelligen Code eingeben.',true);return;}
  check.disabled=true;check.textContent='Code wird überprüft …';
  message(info,'Überprüfe deinen Code …');
  try{
   const factors=(await list(c)).filter(f=>f.status==='verified');
   if(!factors.length)throw Error('Kein bestätigter Authenticator gefunden. Bitte den Support kontaktieren.');
   let success=false,lastError=null;
   for(const factor of factors){
    try{await verify(c,factor.id,field.value);success=true;break;}
    catch(err){lastError=err;}
   }
   if(!success)throw lastError||Error('Code konnte nicht bestätigt werden.');
   message(info,'✓ Anmeldung bestätigt.');
   field.value='';
   await onSuccess?.();
  }catch(e){
   message(info,'Code nicht akzeptiert. Prüfe die aktuelle Zahl in deiner App und versuche es erneut.',true);
   field.select();
  }finally{check.disabled=false;check.textContent='Code bestätigen →';}
 };
 check.onclick=finish;
 field.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();finish();}};
 field.focus();
}
async function renderSettings(node,c){
 if(!node)return;
 if(!c){node.innerHTML='<p class="mfa-message error">Bitte melde dich erneut an, um 2FA einzurichten.</p>';return;}
 node.innerHTML='<div class="mfa-loading"><span class="spinner" aria-hidden="true"></span><span>Authenticator-Status prüfen …</span></div>';
 try{
  const [all,status]=await Promise.all([list(c),levels(c)]);
  const verified=all.filter(x=>x.status==='verified');
  const drafts=all.filter(x=>x.status!=='verified');
  const has2fa=verified.length>0;
  node.innerHTML=
  '<div class="mfa-overview"><span class="mfa-status-icon '+(has2fa?'enabled':'')+'">'+(has2fa?'✓':'◇')+'</span>'+
  '<div class="mfa-summary"><strong>'+(has2fa?labels.ready:labels.idle)+'</strong>'+
  '<small>'+(has2fa?'Bei jeder neuen Anmeldung ist dein sechsstelliger App-Code erforderlich.':'Sichere dein Konto zusätzlich zu Benutzername und Passwort.')+'</small></div>'+
  '<span class="mfa-state '+(has2fa?'enabled':'')+'">'+(has2fa?'Aktiv':'Inaktiv')+'</span></div>'+
  '<div class="mfa-explanation">'+
  '<div class="mfa-guide-row"><span>01</span><div><b>App auswählen</b><small>Google Authenticator, Microsoft Authenticator, 2FAS oder eine kompatible App.</small></div></div>'+
  '<div class="mfa-guide-row"><span>02</span><div><b>QR-Code scannen</b><small>Oder den geheimen Schlüssel auf deinem Handy manuell hinzufügen.</small></div></div>'+
  '<div class="mfa-guide-row"><span>03</span><div><b>Einmal Code bestätigen</b><small>Danach wird bei jeder erneuten Anmeldung ein Code verlangt.</small></div></div>'+
  '</div>'+
  (verified.length?'<div class="mfa-devices"><span class="eyebrow">VERBUNDENE AUTHENTICATOREN</span>'+
    verified.map(f=>'<div class="mfa-device"><div class="mfa-device-info"><span class="mfa-device-glyph">◈</span>'+
      '<span><strong>'+esc(f.friendly_name||'Authenticator-App')+'</strong><small>Bestätigtes Gerät · TOTP</small></span></div>'+
      '<button type="button" class="btn small danger" data-mfa-remove="'+esc(f.id)+'">Entfernen</button></div>').join('')+
    '</div>':'')+
  (drafts.length?'<div class="mfa-unverified"><b>Unvollständige Einrichtung</b><p>Du kannst die nicht bestätigte Verbindung löschen und neu anfangen.</p>'+
    drafts.map(f=>'<button class="btn small" type="button" data-mfa-discard="'+esc(f.id)+'">Unvollständige Einrichtung verwerfen</button>').join('')+'</div>':'')+
  '<div class="mfa-actions">'+button('ll-mfa-enroll',has2fa?'Weiteren Authenticator hinzufügen':'Authenticator jetzt verbinden','primary')+
  button('ll-mfa-refresh','Status aktualisieren')+'</div>'+
  '<div id="ll-mfa-operation-message" class="mfa-message" role="status" aria-live="polite" hidden></div>'+
  '<div id="ll-mfa-enroll-area" aria-live="polite"></div>'+
  '<p class="micro mfa-support">Verlorener Zugang? Kontaktiere den Academy-Administrator über <a href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Discord</a>. Du musst einen verifizierten 2FA-Code eingeben, um einen bestehenden Authenticator zu entfernen.</p>';
  const result=$('#ll-mfa-operation-message',node);
  $('#ll-mfa-refresh',node).onclick=()=>renderSettings(node,c);
  for(const btn of node.querySelectorAll('[data-mfa-remove]')){
   btn.disabled=status.currentLevel!=='aal2';
   if(status.currentLevel!=='aal2')btn.title='Bitte zuerst bei der Anmeldung 2FA bestätigen.';
   btn.onclick=async()=>{
    if(btn.disabled)return;
    if(!confirm('Diesen Authenticator entfernen? Mit deinem letzten verbundenen Gerät wird die Zwei-Faktor-Anmeldung für dein Konto deaktiviert.'))return;
    btn.disabled=true;message(result,'Authenticator wird entfernt …');
    try{
     const r=await c.auth.mfa.unenroll({factorId:btn.dataset.mfaRemove});
     if(r.error)throw r.error;
     await refresh(c);await renderSettings(node,c);
    }catch(e){btn.disabled=false;message(result,'Entfernen fehlgeschlagen: '+(e?.message||'Bitte erneut versuchen.'),true);}
   };
  }
  for(const btn of node.querySelectorAll('[data-mfa-discard]')){
   btn.onclick=async()=>{
    btn.disabled=true;
    try{const r=await c.auth.mfa.unenroll({factorId:btn.dataset.mfaDiscard});if(r.error)throw r.error;await renderSettings(node,c);}
    catch(e){btn.disabled=false;message(result,'Einrichtung konnte nicht verworfen werden: '+(e?.message||'Fehler'),true);}
   };
  }
  $('#ll-mfa-enroll',node).onclick=async()=>{
   const btn=$('#ll-mfa-enroll',node),area=$('#ll-mfa-enroll-area',node);
   btn.disabled=true;message(result,'Erstelle einen neuen Sicherheitsschlüssel …');
   try{
    const res=await c.auth.mfa.enroll({factorType:'totp',friendlyName:'NovaLab Academy'});
    if(res.error)throw res.error;
    message(result,'');
    const draft=res.data;
    area.innerHTML='<div class="mfa-setup-card"><span class="eyebrow">AUTHENTICATOR VERBINDEN</span><h3>1. Mit deiner App koppeln</h3>'+
      '<p>Scanne den QR-Code mit deiner Authenticator-App. Verwendest du nur ein Handy, kopiere stattdessen den Einrichtungsschlüssel in deine App.</p>'+
      '<div id="ll-mfa-qr" class="mfa-qr-frame" aria-label="QR-Code zum Hinzufügen eines Authenticator-Kontos"></div>'+
      '<label class="form-label" for="ll-mfa-secret">Alternativ: Einrichtungsschlüssel</label>'+
      '<div class="mfa-secret-row"><input class="input" id="ll-mfa-secret" readonly autocomplete="off" aria-label="Geheimer Einrichtungsschlüssel" type="text" />'+
      button('ll-mfa-copy-secret','Kopieren')+'</div>'+
      '<p class="mfa-warning">Diesen Schlüssel niemals öffentlich teilen, auch nicht per Screenshot.</p>'+
      '<h3>2. Sechsstelligen Code eingeben</h3>'+
      '<p>Erst nach erfolgreicher Bestätigung wird 2FA für dieses Konto aktiviert.</p>'+
      '<label class="form-label" for="ll-mfa-setup-code">Code aus deiner Authenticator-App</label>'+
      codeInput('ll-mfa-setup-code')+'<div class="mfa-actions">'+button('ll-mfa-activate','2FA aktivieren','primary')+
      button('ll-mfa-cancel','Abbrechen')+'</div>'+
      '<div id="ll-mfa-setup-status" class="mfa-message" role="status" aria-live="polite" hidden></div></div>';
    const qr=String(draft.totp?.qr_code||'');
    const host=$('#ll-mfa-qr',area);
    if(/^data:image\/svg\+xml(?:[;,])/i.test(qr)){
     const img=document.createElement('img');
     img.src=qr;img.alt='Authenticator QR-Code';img.className='ll-mfa-qr';img.width=220;img.height=220;
     host.append(img);
    }else{host.textContent='QR-Code nicht verfügbar. Verwende den manuellen Einrichtungsschlüssel.';}
    $('#ll-mfa-secret',area).value=draft.totp?.secret||'';
    $('#ll-mfa-copy-secret',area).onclick=async()=>{
     const input=$('#ll-mfa-secret',area);
     try{await navigator.clipboard.writeText(input.value);message($('#ll-mfa-setup-status',area),'Einrichtungsschlüssel kopiert.');}
     catch(e){input.select();message($('#ll-mfa-setup-status',area),'Markiere den Schlüssel im Feld, um ihn manuell zu kopieren.');}
    };
    $('#ll-mfa-cancel',area).onclick=async()=>{
     try{const r=await c.auth.mfa.unenroll({factorId:draft.id});if(r.error)throw r.error;}
     catch(e){message($('#ll-mfa-setup-status',area),'Abbruch fehlgeschlagen. Entferne den unbestätigten Authenticator im Gerätebereich.',true);return;}
     await renderSettings(node,c);
    };
    const confirm=async()=>{
     const control=$('#ll-mfa-activate',area),code=$('#ll-mfa-setup-code',area),out=$('#ll-mfa-setup-status',area);
     if(!six(code.value)){message(out,'Gib genau sechs Ziffern ein.',true);return;}
     control.disabled=true;
     message(out,'Code wird bestätigt …');
     try{
      await verify(c,draft.id,code.value);
      code.value='';
      await renderSettings(node,c);
     }catch(e){message(out,'Falscher oder abgelaufener Code. Prüfe die Uhrzeit deiner Authenticator-App und versuche es erneut.',true);control.disabled=false;}
    };
    $('#ll-mfa-activate',area).onclick=confirm;
    $('#ll-mfa-setup-code',area).onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();confirm();}};
   }catch(e){
    message(result,'Einrichtung fehlgeschlagen: '+(e?.message||'Bitte später erneut versuchen.'),true);
    btn.disabled=false;
   }
  };
 }catch(e){
  node.innerHTML='<div class="mfa-error-card"><strong>Authenticator-Einstellungen konnten nicht geladen werden.</strong>'+
  '<p>'+esc(e?.message||'Bitte erneut versuchen.')+'</p>'+
  button('ll-mfa-refresh','Erneut versuchen','primary')+'</div>';
  $('#ll-mfa-refresh',node).onclick=()=>renderSettings(node,c);
 }
}
window.LLMFA={refresh,renderSettings,renderGate,get pending(){return pending},get error(){return loadError}};
})();