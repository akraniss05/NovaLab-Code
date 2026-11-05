
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const defaults={theme:'nebula',accent:'violet',font:'normal',density:'normal',avatar:'◆',cover:'nebula',motion:true,glow:true};
const options={theme:['nebula','midnight','carbon','daylight'],accent:['violet','cyan','orange','emerald','rose'],font:['small','normal','large'],density:['normal','compact'],avatar:['◆','🦊','🌙','💜','🎵','⌘','🎮','⭐','◈','🐉','💎'],cover:['nebula','aurora','sunset','ocean']};
const groups=[
 ['START',[['home','⌂','Dashboard'],['catalog','▤','Lernwelten'],['roadmaps','↗','Roadmaps'],['videos','▶','Tutorials']]],
 ['STUDIOS',[['editor','⌘','Code Lab'],['music','♫','Music Lab'],['studio3d','◈','Designer Lab'],['videolab','▣','Video Lab']]],
 ['COMMUNITY',[['practice','🎮','Games'],['leaderboard','★','Rangliste']]],
 ['ACCOUNT',[['profile','◉','Mein Profil'],['settings','⚙','Einstellungen'],['admin','♛','Administration']]]
];
const tabs=[['display','▣','Darstellung','Farben, Schriften, Layout'],['personal','✧','Personalisieren','Avatar, Hintergrund'],['account','◉','Konto & Sicherheit','Passwort, Authenticator'],['storage','▤','Datenschutz & Speicher','Backups und Cookies'],['tools','⌘','Studios & Tools','Freischaltungen'],['about','ⓘ','Über LiveryLab','Version und Hinweise']];
let owner='guest',prefs={...defaults},role='',tab='display',last=null,open=false,started=false;
const key=()=>`liverylab:ui5:${owner}`;
function read(){try{const x=JSON.parse(localStorage.getItem(key()));if(!x)return {...defaults};return Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,typeof v==='boolean'?x[k]!==false:options[k].includes(x[k])?x[k]:v]))}catch{return {...defaults}}}
function apply(){for(const [k,v]of Object.entries(prefs))document.documentElement.dataset['ll'+k[0].toUpperCase()+k.slice(1)]=String(v);document.querySelectorAll('.ll-avatar').forEach(e=>e.textContent=prefs.avatar);document.querySelectorAll('.ll-profile-cover').forEach(e=>e.dataset.cover=prefs.cover)}
function save(){try{localStorage.setItem(key(),JSON.stringify(prefs))}catch{}apply()}
function ownerChanged(id){if(owner===(id||'guest'))return;owner=id||'guest';prefs=read();apply()}
function close(){open=false;$('#ll-menu-overlay')?.classList.remove('open');document.body.classList.remove('ll-menu-open')}
function makeMenu(){
 if($('#ll-menu-overlay'))return;const el=document.createElement('div');el.id='ll-menu-overlay';el.className='ll-menu-overlay';
 el.innerHTML=`<div class="ll-menu-backdrop" data-ll-close></div><aside class="ll-menu-sheet" role="dialog" aria-label="Hauptnavigation" aria-modal="true"><header><b><span>L</span> LIVERYLAB</b><button data-ll-close aria-label="Schließen">✕</button></header><div class="ll-menu-scroll">${groups.map(([name,items])=>`<section><small>${name}</small>${items.map(([id,ico,label])=>`<button data-go="${id}" ${id==='admin'?'class="ll-admin-nav" hidden':''}><i>${ico}</i><strong>${label}</strong><span>›</span></button>`).join('')}</section>`).join('')}</div><footer>Made with 💙 by NyxAtheris (LiveryLab)</footer></aside>`;
 el.addEventListener('click',e=>{if(e.target.closest('[data-ll-close],[data-go]'))close()});document.body.append(el)
}
function setRole(r){role=r||'';if($('.ll-admin-nav'))$('.ll-admin-nav').hidden=role!=='admin'}
function boot(){
 if(started)return;started=true;prefs=read();apply();makeMenu();
 document.addEventListener('click',e=>{
  if(e.target.closest('#ll-menu-button')){if(open)close();else{open=true;$('#ll-menu-overlay').classList.add('open');document.body.classList.add('ll-menu-open');$('#ll-menu-overlay [data-ll-close]')?.focus()}return}
  const b=e.target.closest('[data-ll-theme],[data-ll-accent],[data-ll-avatar],[data-ll-cover],[data-ll-tab],[data-ll-reset]');
  if(!b)return;
  if(b.hasAttribute('data-ll-reset')){if(!confirm('Nur das Design zurücksetzen? Lernstand und Projekte bleiben erhalten.'))return;prefs={...defaults};save()}
  else if(b.dataset.llTab)tab=b.dataset.llTab;
  else{for(const k of ['theme','accent','avatar','cover']){const prop='ll'+k[0].toUpperCase()+k.slice(1);if(b.dataset[prop]!==undefined&&options[k].includes(b.dataset[prop])){prefs[k]=b.dataset[prop];save()}}}
  if(last?.node.isConnected)renderSettings(last.node,last.props)
 });
 document.addEventListener('change',e=>{const k=e.target.dataset.llSetting;if(!k||!(k in prefs))return;const v=e.target.type==='checkbox'?e.target.checked:e.target.value;if(typeof defaults[k]==='boolean'||options[k]?.includes(v)){prefs[k]=v;save();if(last?.node.isConnected)renderSettings(last.node,last.props)}});
 document.addEventListener('keydown',e=>{if(open&&e.key==='Escape')close()})
}
const box=(heading,body)=>`<section class="ll-pref-group"><h3>${heading}</h3><div>${body}</div></section>`;
function renderSettings(node,props={}){
 last={node,props};const legacy=props.legacy||{};
 let body='';
 if(tab==='display')body=
 box('Farbschema',`<div class="ll-theme-grid">${options.theme.map(t=>`<button data-ll-theme="${t}" class="${prefs.theme===t?'selected':''}"><span class="ll-theme-preview ${t}"></span><b>${({nebula:'Nebula',midnight:'Midnight',carbon:'Carbon',daylight:'Light'})[t]}</b></button>`).join('')}</div>`)
 +box('Layout',`<label class="ll-pref-row"><span><b>Darstellungsdichte</b><small>Abstände zwischen Kacheln</small></span><select data-ll-setting="density"><option value="normal">Komfortabel</option><option value="compact" ${prefs.density==='compact'?'selected':''}>Kompakt</option></select></label><label class="ll-pref-row"><span><b>Schriftgröße</b><small>Lesbarkeit der Kurse</small></span><select data-ll-setting="font">${[['small','Klein'],['normal','Standard'],['large','Groß']].map(([v,n])=>`<option value="${v}" ${prefs.font===v?'selected':''}>${n}</option>`).join('')}</select></label>`)
 +box('Effekte',`<label class="ll-pref-row"><span><b>Animationen</b><small>Sanfte Bewegungen</small></span><input type="checkbox" data-ll-setting="motion" ${prefs.motion?'checked':''}></label><label class="ll-pref-row"><span><b>Farbige Hintergründe</b><small>Leuchten je nach Lernwelt</small></span><input type="checkbox" data-ll-setting="glow" ${prefs.glow?'checked':''}></label>`);
 if(tab==='personal')body=box('Akzentfarbe',`<div class="ll-accents">${options.accent.map(a=>`<button data-ll-accent="${a}" data-color="${a}" class="${prefs.accent===a?'selected':''}" aria-label="Akzentfarbe ${a}">${prefs.accent===a?'✓':''}</button>`).join('')}</div>`)
 +box('Dein Avatar',`<div class="ll-avatar-grid">${options.avatar.map(a=>`<button data-ll-avatar="${a}" class="${prefs.avatar===a?'selected':''}">${a}</button>`).join('')}</div><p class="micro">Die Auswahl wird auf diesem Gerät gespeichert.</p>`)
 +box('Profilcover',`<div class="ll-cover-grid">${options.cover.map(c=>`<button data-ll-cover="${c}" data-cover="${c}" class="${prefs.cover===c?'selected':''}">${c}</button>`).join('')}</div>`);
 if(tab==='account')body=box('Kontoeinstellungen',`<div class="ll-account-summary"><span class="ll-avatar">${prefs.avatar}</span><div><b>${esc(props.name||'Academy Mitglied')}</b><small>${esc(props.email||'')}</small><small>${props.role==='admin'?'Administrator':'Schüler'} · ${props.tier==='pro'?'PRO':'FREE'}</small></div></div>${legacy.account||''}`)
 +box('Authenticator-App & Zwei-Faktor-Schutz','<div id="ll-mfa-settings">Authenticator-Status wird geprüft …</div>');
 if(tab==='storage')body=box('Daten und Synchronisation',legacy.storage||'<p>Kein Speicherprofil geladen.</p>')+box('Privatsphäre und Löschen',legacy.privacy||'<p>Keine Optionen.</p>')+'<p><a href="./privacy.html" target="_blank" rel="noopener">Datenschutzinformationen ↗</a></p>';
 if(tab==='tools')body=box('Freischaltungen',`<div class="ll-tarif"><b>${props.tier==='pro'?'✦ PRO aktiviert':'FREE'}</b><p>${props.tier==='pro'?'Erweiterte Tools ohne Tageslimits (technische Grenzen des Browsers bleiben).':'Die wichtigen Grundwerkzeuge sind frei. Der Admin kann Pro für dein Konto freischalten.'}</p></div>`)
 +box('Deine Werkzeuge',`<div class="ll-tool-links">${[['editor','⌘','Code Lab'],['music','♫','Music Lab'],['studio3d','◈','Designer Lab'],['videolab','▣','Video Lab'],['roadmaps','↗','Roadmaps']].map(([id,ico,name])=>`<button data-go="${id}"><span>${ico}</span><b>${name}</b><em>›</em></button>`).join('')}</div>`);
 if(tab==='about')body=box('Academy 5.0','<p>Eine mobile Lernplattform für Coding, FiveM, Musikproduktion, Video und 3D. Die Studios dienen zum Lernen und ersetzen nicht alle Funktionen von Visual Studio, Blender oder einer Desktop-DAW.</p><p>Made with 💙 by NyxAtheris (LiveryLab)</p><a href="https://github.com/akraniss05/liverylab-academy" target="_blank" rel="noopener">GitHub-Projekt ↗</a>');
 const current=tabs.find(x=>x[0]===tab)||tabs[0];
 node.innerHTML=`<div class="ll-settings-head"><span class="eyebrow">ACCOUNT & PERSONALIZATION</span><h1>Einstellungen <span>⚙</span></h1><p>Dein Aussehen, dein Konto, deine Daten – übersichtlich an einem Ort.</p></div><div class="ll-settings-layout"><aside class="ll-pref-tabs">${tabs.map(([id,icon,title,desc])=>`<button data-ll-tab="${id}" class="${id===tab?'active':''}"><i>${icon}</i><span><b>${title}</b><small>${desc}</small></span><em>›</em></button>`).join('')}</aside><section class="ll-pref-main"><header><span>${current[1]}</span><div><h2>${current[2]}</h2><p>${current[3]}</p></div></header>${body}<div class="ll-pref-footer"><button class="btn" data-ll-reset>↶ Auf Standard zurücksetzen</button><p class="micro">Die Aktion setzt nur das App-Design zurück.</p></div></section></div>`;
 apply();if(tab==='account'&&props.client)setTimeout(()=>{if(node.isConnected&&tab==='account')window.LLMFA?.renderSettings($('#ll-mfa-settings',node),props.client)},0);
}
function profileBanner(name,role,tier,xp,lessons){return `<div class="ll-profile-cover" data-cover="${prefs.cover}"><span class="ll-avatar">${prefs.avatar}</span><div><span class="eyebrow">LIVERYLAB PROFILE</span><h1>${esc(name)}</h1><div class="ll-profile-tags"><span>${role==='admin'?'♛ ADMIN':'STUDENT'}</span><span>${tier==='pro'?'✦ PRO':'FREE'}</span></div><p>${xp} XP · ${lessons} Lektionen abgeschlossen</p></div><strong class="ll-profile-mark">L</strong></div>`}
window.LLShell={boot,ownerChanged,setRole,apply,renderSettings,profileBanner,get prefs(){return {...prefs}}};
})();
