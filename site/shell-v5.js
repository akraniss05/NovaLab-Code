
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const defaults={theme:'nebula',accent:'violet',font:'normal',density:'normal',avatar:'L',cover:'nebula',motion:true,glow:true};
const options={theme:['nebula','midnight','carbon','daylight'],accent:['violet','cyan','orange','emerald','rose'],font:['small','normal','large'],density:['normal','compact'],avatar:['L','◆','🦊','🌙','💜','🎵','⌘','🎮','⭐','◈','🐉','💎'],cover:['nebula','aurora','sunset','ocean']};
const icons={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
 catalog:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 roadmaps:'<path d="M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
 videos:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
 editor:'<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-13-2 18"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 studio3d:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5m-9 5v10"/>',
 videolab:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 8h18V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Zm5-5 3 5m4-5 3 5"/>',
 practice:'<path d="M6 11h12a4 4 0 0 1 4 4v2a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-2a4 4 0 0 1 4-4Z"/><path d="M7 13v6m-3-3h6m7-2h.01m2 3h.01"/>',
 friends:'<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
 leaderboard:'<path d="M8 21h8m-4-4v4m-7-18h14v5a7 7 0 0 1-14 0Zm0 1H2v3a5 5 0 0 0 5 5m12-6h3v3a5 5 0 0 1-5 5"/>',
 profile:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="3"/><path d="M6 19a6 6 0 0 1 12 0"/>',
 settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M20.2 13.7a1.7 1.7 0 0 0 0-3.4l-1-.2-.6-1.5.6-.9a1.7 1.7 0 0 0-2.4-2.4l-.9.6-1.5-.6-.2-1a1.7 1.7 0 0 0-3.4 0l-.2 1-1.5.6-.9-.6a1.7 1.7 0 0 0-2.4 2.4l.6.9-.6 1.5-1 .2a1.7 1.7 0 0 0 0 3.4l1 .2.6 1.5-.6.9a1.7 1.7 0 0 0 2.4 2.4l.9-.6 1.5.6.2 1a1.7 1.7 0 0 0 3.4 0l.2-1 1.5-.6.9.6a1.7 1.7 0 0 0 2.4-2.4l-.6-.9.6-1.5Z"/>',
 admin:'<path d="m12 2 9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6Z"/><path d="m8 12 3 3 5-6"/>'
};
icons['code-courses']=icons.editor;icons['fivem-courses']=icons.editor;icons['blender-courses']=icons.studio3d;
function navIcon(id){return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[id]||icons.catalog)+'</svg>';}
const groups=[
 ['ÜBERSICHT',[['home','⌂','Dashboard']]],
 ['KURSE',[['catalog','▤','Alle Kurse'],['code-courses','⌘','Programmieren'],['fivem-courses','◆','FiveM & Frameworks'],['blender-courses','◈','Blender & 3D']]],
 ['KONTO',[['profile','◉','Mein Profil'],['settings','⚙','Einstellungen'],['admin','♛','Administration']]]
];
const tabs=[['display','▣','Darstellung','Farben, Schriften, Layout'],['personal','✧','Personalisieren','Avatar, Hintergrund'],['account','◉','Konto & Sicherheit','Passwort, Authenticator'],['storage','▤','Datenschutz & Speicher','Backup und Synchronisation'],['plan','★','Tarif & Zugang','Free, Pro und Plus'],['about','ⓘ','Über LiveryLab','Informationen zur Academy']];
let owner='guest',prefs={...defaults},role='',tab='display',last=null,open=false,started=false;
const key=()=>`liverylab:ui5:${owner}`;
function read(){try{const x=JSON.parse(localStorage.getItem(key()));if(!x)return {...defaults};return Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,typeof v==='boolean'?x[k]!==false:options[k].includes(x[k])?x[k]:v]))}catch{return {...defaults}}}
function apply(){for(const [k,v]of Object.entries(prefs))document.documentElement.dataset['ll'+k[0].toUpperCase()+k.slice(1)]=String(v);document.querySelectorAll('.ll-avatar').forEach(e=>e.textContent=prefs.avatar);document.querySelectorAll('.ll-profile-cover').forEach(e=>e.dataset.cover=prefs.cover)}
function save(){try{localStorage.setItem(key(),JSON.stringify(prefs))}catch{}apply()}
function ownerChanged(id){if(owner===(id||'guest'))return;owner=id||'guest';prefs=read();apply()}
function close(){open=false;$('#app').inert=false;$('#ll-menu-button').setAttribute('aria-expanded','false');$('#ll-menu-button').focus();$('#ll-menu-overlay')?.classList.remove('open');document.body.classList.remove('ll-menu-open');const search=$('#ll-menu-search');if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}))}}
function makeMenu(){
 if($('#ll-menu-overlay'))return;const el=document.createElement('div');el.id='ll-menu-overlay';el.className='ll-menu-overlay';
 el.innerHTML=`<div class="ll-menu-backdrop" data-ll-close></div><aside class="ll-menu-sheet" role="dialog" aria-label="Hauptnavigation" aria-modal="true"><header><img class="ll8-menu-wordmark" src="./assets/liverylab-academy-wordmark.svg" alt="LiveryLab Academy"><button data-ll-close aria-label="Schließen"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button></header><div class="ll-menu-search"><input id="ll-menu-search" type="search" placeholder="Bereich oder Tool suchen …" aria-label="Menü durchsuchen" autocomplete="off"></div><div class="ll-menu-scroll">${groups.map(([name,items])=>`<section><button type="button" class="ll7-menu-heading" data-ll-group="${name}" aria-expanded="true"><small>${name}</small><span>⌄</span></button><div class="ll7-menu-items">${items.map(([id,ico,label])=>`<button data-go="${id}" ${id==='admin'?'class="ll-admin-nav" hidden':''}><i>${navIcon(id)}</i><strong>${label}</strong><span class="ll8-menu-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span></button>`).join('')}</div></section>`).join('')}</div><footer>Made with 💙 from NyxAtheris (LiveryLab Studios)</footer></aside>`;
 el.addEventListener('click',e=>{if(e.target.closest('[data-ll-close],[data-go]'))close()});document.body.append(el)
}
function setRole(r){role=r||'';if($('.ll-admin-nav'))$('.ll-admin-nav').hidden=role!=='admin'}
function boot(){
 if(started)return;started=true;prefs=read();apply();makeMenu();
 document.addEventListener('click',e=>{
  if(e.target.closest('#ll-menu-button')){if(open)close();else{open=true;$('#app').inert=true;$('#ll-menu-button').setAttribute('aria-expanded','true');$('#ll-menu-overlay').classList.add('open');document.body.classList.add('ll-menu-open');$('#ll-menu-search')?.focus()}return}
  const header=e.target.closest('[data-ll-group]');if(header){const expanded=header.getAttribute('aria-expanded')==='true';header.setAttribute('aria-expanded',String(!expanded));header.nextElementSibling.hidden=expanded;return}
  const b=e.target.closest('button:is([data-ll-theme],[data-ll-accent],[data-ll-avatar],[data-ll-cover],[data-ll-tab],[data-ll-reset])');
  if(!b)return;
  if(b.hasAttribute('data-ll-reset')){if(!confirm('Nur das Design zurücksetzen? Lernstand und Projekte bleiben erhalten.'))return;prefs={...defaults};save()}
  else if(b.dataset.llTab)tab=b.dataset.llTab;
  else{for(const k of ['theme','accent','avatar','cover']){const prop='ll'+k[0].toUpperCase()+k.slice(1);if(b.dataset[prop]!==undefined&&options[k].includes(b.dataset[prop])){prefs[k]=b.dataset[prop];save()}}}
  if(last?.node.isConnected)renderSettings(last.node,last.props)
 });
 document.addEventListener('change',e=>{const k=e.target.dataset.llSetting;if(!k||!(k in prefs))return;const v=e.target.type==='checkbox'?e.target.checked:e.target.value;if(typeof defaults[k]==='boolean'||options[k]?.includes(v)){prefs[k]=v;save();if(last?.node.isConnected)renderSettings(last.node,last.props)}});
 document.addEventListener('input',e=>{
  if(e.target.id==='ll-menu-search'){
   const q=e.target.value.trim().toLocaleLowerCase('de');$('#ll-menu-overlay')?.querySelectorAll('.ll-menu-scroll section').forEach(section=>{
    const inGroup=section.querySelector('small')?.textContent.toLocaleLowerCase('de').includes(q);
    section.querySelectorAll('button[data-go]').forEach(button=>{button.hidden=(button.dataset.go==='admin'&&role!=='admin')||(!inGroup&&!button.textContent.toLocaleLowerCase('de').includes(q))});
    section.hidden=[...section.querySelectorAll('button[data-go]')].every(button=>button.hidden);if(q&&!section.hidden){const head=section.querySelector('[data-ll-group]');head?.setAttribute('aria-expanded','true');if(head?.nextElementSibling)head.nextElementSibling.hidden=false}
   });return;
  }
  if(e.target.id==='ll-settings-search'){
   const q=e.target.value.trim().toLocaleLowerCase('de');
   document.querySelectorAll('.ll-pref-tabs button[data-ll-tab]').forEach(button=>{button.hidden=!button.textContent.toLocaleLowerCase('de').includes(q)});
  }
 });
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
 if(tab==='account')body=box('Kontoeinstellungen',`<div class="ll-account-summary"><span class="ll-avatar">${prefs.avatar}</span><div><b>${esc(props.name||'Academy Mitglied')}</b><small>${esc(props.email||'')}</small><small>${props.role==='admin'?'Administrator':'Schüler'} · ${(props.tier==='ultimate'?'PLUS':props.tier||'free').toUpperCase()}</small></div></div>${legacy.account||''}`)
 +box('Authenticator-App & Zwei-Faktor-Schutz','<div id="ll-mfa-settings">Authenticator-Status wird geprüft …</div>');
 if(tab==='storage')body=box('Daten und Synchronisation',legacy.storage||'<p>Kein Speicherprofil geladen.</p>')+box('Privatsphäre und Löschen',legacy.privacy||'<p>Keine Optionen.</p>')+'<p><a href="./privacy.html" target="_blank" rel="noopener">Datenschutzinformationen ↗</a></p>';
 if(tab==='plan')body=box('Dein Lernzugang',`<div class="ll-tarif"><b>${(props.tier==='ultimate'?'PLUS':props.tier||'free').toUpperCase()} aktiviert</b><p>Alle Programmier-, FiveM- und Blenderkurse sind für jeden Tarif freigeschaltet. FREE: 3 unterschiedliche Lektionen pro Tag. PRO: 6 pro Tag. PLUS: unbegrenzt. Die Freischaltung wird serverseitig überprüft und durch die Administration verwaltet.</p></div>`);
 if(tab==='about')body=box('Academy 9.0','<p>Die LiveryLab Academy konzentriert sich auf Programmierung, FiveM-Scripting und Blender/3D. Jeder Kurs bietet Lektionen mit Erklärungen, Videotutorials, Aufgaben und Wissensfragen.</p><p>Made with 💙 from NyxAtheris (LiveryLab Studios)</p><a href="https://discord.gg/livery-lab" target="_blank" rel="noopener noreferrer">Community auf Discord ↗</a>');
 const current=tabs.find(x=>x[0]===tab)||tabs[0];
 node.innerHTML=`<div class="ll-settings-head"><span class="eyebrow">ACCOUNT & PERSONALIZATION</span><h1>Einstellungen <span>⚙</span></h1><p>Dein Aussehen, dein Konto, deine Daten – übersichtlich an einem Ort.</p></div><div class="ll-settings-layout"><aside class="ll-pref-tabs"><div class="ll-pref-filter"><label for="ll-settings-search">EINSTELLUNGEN FINDEN</label><input id="ll-settings-search" type="search" placeholder="Einstellungen suchen …" autocomplete="off"></div>${tabs.map(([id,icon,title,desc])=>`<button data-ll-tab="${id}" aria-current="${id===tab?'page':'false'}" class="${id===tab?'active':''}"><i>${icon}</i><span><b>${title}</b><small>${desc}</small></span><em>›</em></button>`).join('')}</aside><section class="ll-pref-main"><header><span>${current[1]}</span><div><h2>${current[2]}</h2><p>${current[3]}</p></div></header>${body}<div class="ll-pref-footer"><button class="btn" data-ll-reset>↶ Auf Standard zurücksetzen</button><p class="micro">Die Aktion setzt nur das App-Design zurück.</p></div></section></div>`;
 apply();if(tab==='account'&&props.client)setTimeout(()=>{if(node.isConnected&&tab==='account')window.LLMFA?.renderSettings($('#ll-mfa-settings',node),props.client)},0);
}
function profileBanner(name,role,tier,xp,lessons){const milestone=[10,50,100,200,432].find(n=>n>Number(lessons))||432;const percent=Math.max(0,Math.min(100,Math.round(Number(lessons)/milestone*100)));return `<div class="ll-profile-cover" data-cover="${prefs.cover}"><span class="ll-avatar">${prefs.avatar}</span><div><span class="eyebrow">LIVERYLAB PROFILE</span><h1>${esc(name)}</h1><div class="ll-profile-tags"><span>${role==='admin'?'♛ ADMIN':'STUDENT'}</span><span>${tier==='ultimate'?'✦ PLUS':tier==='pro'?'✦ PRO':'FREE'}</span></div><p>${xp} XP · ${lessons} Lektionen abgeschlossen</p><div class="ll-profile-progress"><small>${lessons} von ${milestone} Lektionen zum nächsten Meilenstein</small><div class="ll-profile-progress-track"><div class="ll-profile-progress-fill" style="width:${percent}%"></div></div></div><div class="ll-profile-shortcuts"><button data-act="profile-appearance">✧ Design anpassen</button><button data-act="profile-security">Passwort & Authenticator</button><button data-go="settings">Einstellungen</button></div></div><strong class="ll-profile-mark">L</strong></div>`}
window.LLShell={boot,ownerChanged,setRole,apply,renderSettings,profileBanner,get prefs(){return {...prefs}}};
})();
