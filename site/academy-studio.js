/* LiveryLab Academy Studio · real projects, level rewards, notes and learning paths.
   Made with 💙 by NyxAtheris (LiveryLab Studios). */
(function(root){
'use strict';
let bridge=null,projects=[],prefs={},notes={},ready=false,editing=null;
const REWARDS=[
 {level:1,name:'Starter',icon:'✦',detail:'Deine erste Entwickler-Karte',frame:'starter'},
 {level:2,name:'Neon',icon:'◈',detail:'Neon-Profilrahmen',frame:'neon'},
 {level:3,name:'Aurora',icon:'❖',detail:'Aurora-Profilrahmen',frame:'aurora'},
 {level:5,name:'Cosmic',icon:'✧',detail:'Cosmic-Profilrahmen',frame:'cosmic'},
 {level:8,name:'Master',icon:'⬡',detail:'Master-Profilrahmen',frame:'master'},
 {level:12,name:'Legend',icon:'✺',detail:'Legend-Profilrahmen',frame:'legend'},
 {level:20,name:'Eternal',icon:'✹',detail:'Eternal-Profilrahmen',frame:'eternal'}
];
const $=q=>document.querySelector(q);
const e=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const state=()=>bridge&&bridge.state();
const client=()=>bridge&&bridge.client();
const message=x=>bridge&&bridge.notice(x);
const go=x=>bridge&&bridge.go(x);
const redraw=()=>bridge&&bridge.render();
const getId=()=>state()?.user?.id;
const lessonList=course=>(state()?.lessons||[]).filter(l=>l.course_id===course).sort((a,b)=>a.position-b.position);
const completed=()=>new Set(state()?.progress?.done||[]);
const level=()=>{
 const total=completed().size,xp=total*30,number=Math.floor(xp/500)+1,next=(number*500)-xp;
 return {total,xp,number,next,within:xp%500,pct:Math.round((xp%500)/5)};
};
const available=()=>REWARDS.filter(r=>level().number>=r.level);
const frame=()=>available().some(r=>r.frame===prefs.frame)?prefs.frame:'starter';
const btn=(label,route,cls='btn small')=>'<button type="button" class="'+cls+'" data-go="'+e(route)+'">'+e(label)+'</button>';
const heading=(eyebrow,title,desc)=>'<header class="studio-heading"><span class="eyebrow">'+e(eyebrow)+'</span><h1>'+title+'</h1><p>'+e(desc)+'</p></header>';
function apply(){
 const choice=frame();
 document.body.dataset.studioFrame=choice;
 document.body.classList.toggle('studio-calm',prefs.calm===true);
 document.body.classList.toggle('studio-wrap-code',prefs.wrap===true);
 document.documentElement.style.setProperty('--studio-editor-font',Math.max(12,Math.min(23,Number(prefs.fontSize)||15))+'px');
 const avatar=$('.avatar-btn');if(avatar)avatar.dataset.studioFrame=choice;
}
async function load(){
 ready=false;projects=[];notes={};prefs={};editing=null;
 const id=getId(),api=client();if(!id||!api)return;
 const responses=await Promise.allSettled([
  api.from('academy_portfolio_projects').select('id,title,description,category,technologies,project_url,featured,created_at,updated_at').eq('user_id',id).order('created_at',{ascending:false}).limit(120),
  api.from('academy_studio_settings').select('prefs').eq('user_id',id).maybeSingle(),
  api.from('academy_lesson_notes').select('lesson_id,body').eq('user_id',id).limit(600)
 ]);
 const result=i=>responses[i].status==='fulfilled'?responses[i].value:null;
 if(result(0)?.error)message('Projektportfolio konnte nicht geladen werden: '+result(0).error.message);
 if(result(1)?.error)message('Personalisierung konnte nicht geladen werden.');
 if(!result(0)?.error)projects=result(0)?.data||[];
 if(!result(1)?.error)prefs=result(1)?.data?.prefs||{};
 if(!result(2)?.error)for(const n of result(2)?.data||[])notes[n.lesson_id]=n.body||'';
 ready=true;apply();
}
function clear(){projects=[];prefs={};notes={};ready=false;editing=null;delete document.body.dataset.studioFrame;}
async function setPref(key,value){
 const id=getId(),api=client();if(!id||!api)return;
 if(key==='frame'&&!available().some(r=>r.frame===value)){message('Dieser Rahmen ist noch gesperrt.');return;}
 const allowed=['frame','calm','wrap','fontSize','dailyReminders','tipsExpanded'];
 if(!allowed.includes(key))return;
 const before={...prefs};prefs={...prefs,[key]:value};apply();
 const response=await api.from('academy_studio_settings').upsert({user_id:id,prefs,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(response.error){prefs=before;apply();message('Einstellung konnte nicht gespeichert werden: '+response.error.message);}
 else message('Einstellung gespeichert.');
}
function rewardCard(reward){
 const unlocked=level().number>=reward.level,selected=frame()===reward.frame;
 return '<article class="studio-reward '+(unlocked?'':'is-locked')+(selected?' is-selected':'')+'">'+
  '<span class="studio-reward-icon" data-frame="'+e(reward.frame)+'">'+reward.icon+'</span>'+
  '<div><small>LEVEL '+reward.level+'</small><h3>'+e(reward.name)+'</h3><p>'+e(reward.detail)+'</p></div>'+
  (unlocked?'<button class="btn small '+(selected?'primary':'')+'" data-studio-frame="'+e(reward.frame)+'">'+(selected?'✓ Aktiv':'Aktivieren')+'</button>':'<span class="chip">🔒 Level '+reward.level+'</span>')+'</article>';
}
function levelPage(){
 const d=level(),st=state(),next=REWARDS.find(x=>x.level>d.number);
 const stats=(st?.courses||[]).filter(c=>lessonList(c.id).some(l=>completed().has(l.id))).length;
 return heading('DEIN LEVELSYSTEM','Deine <span class="gradient">Developer-Reise.</span>','Sammle XP mit abgeschlossenen Lektionen. Schalte echte kosmetische Profilrahmen frei und gestalte dein Academy-Profil.')+
 '<section class="studio-level-hero"><div class="studio-level-orb" style="--progress:'+d.pct+'%"><span>LEVEL</span><strong>'+d.number+'</strong><small>'+d.xp.toLocaleString('de-DE')+' XP</small></div>'+
 '<div class="studio-level-copy"><span class="eyebrow">DEIN NÄCHSTER MEILENSTEIN</span><h2>'+e(next?.name||'Alle Rahmen entdeckt!')+'</h2>'+
 '<p>'+(next?'In Level '+next.level+' wartet der '+e(next.name)+'-Rahmen auf dich.':'Du hast alle aktuell verfügbaren Kosmetikbelohnungen freigeschaltet.')+'</p>'+
 '<div class="studio-meter"><span style="width:'+d.pct+'%"></span></div><small>'+d.within+' / 500 XP in diesem Level · '+d.next+' XP bis Level '+(d.number+1)+'</small>'+
 '<div class="studio-inline-actions">'+btn('Weiterlernen →','courses','btn primary')+btn('Meine Projekte','portfolio')+'</div></div></section>'+
 '<div class="studio-stat-row"><div><strong>'+d.total+'</strong><span>Lektionen</span></div><div><strong>'+d.xp+'</strong><span>XP gesammelt</span></div><div><strong>'+stats+'</strong><span>Kurse begonnen</span></div><div><strong>'+available().length+'</strong><span>Rahmen frei</span></div></div>'+
 '<section class="studio-section"><div class="studio-section-head"><h2>Freischaltbare Belohnungen</h2><p>Wähle einen freigeschalteten Rahmen aus. Der Effekt erscheint am Profilavatar.</p></div><div class="studio-rewards">'+REWARDS.map(rewardCard).join('')+'</div></section>'+
 '<section class="studio-section studio-note"><h3>So bekommst du XP</h3><p>Eine erstmalig abgeschlossene Lektion bringt 30 XP. Wiederholungen zählen nicht mehrfach. Die Rahmen sind kosmetisch und geben keinen Vorteil bei Prüfungen oder Freischaltungen.</p></section>';
}
function skilltreePage(){
 const st=state(),focus=String(prefs.focus||'');
 const courses=(st?.courses||[]).filter(c=>lessonList(c.id).length);
 const sorted=[...courses].sort((a,b)=>(a.id===focus?-2:0)-(b.id===focus?-2:0)||((lessonList(b.id).filter(l=>completed().has(l.id)).length)-(lessonList(a.id).filter(l=>completed().has(l.id)).length))).slice(0,24);
 return heading('LERNPFAD-NAVIGATOR','Dein <span class="gradient">Skilltree.</span>','Alle Kapitel bauen aufeinander auf. Öffne einen Lernpfad und arbeite dich vom Fundament zu eigenen Projekten vor.')+
 '<div class="studio-skill-grid">'+sorted.map(c=>{
 const ls=lessonList(c.id),done=ls.filter(l=>completed().has(l.id)).length,progress=Math.round(done/ls.length*100),next=ls.find(l=>!completed().has(l.id));
 return '<article class="studio-skill-card"><span class="eyebrow">'+e(c.category)+'</span><h3>'+e(c.name)+'</h3><p>'+done+' / '+ls.length+' Schritte abgeschlossen</p>'+
 '<div class="studio-meter"><span style="width:'+progress+'%"></span></div>'+
 '<div class="studio-skill-nodes">'+ls.slice(0,14).map((l,i)=>'<span class="'+(completed().has(l.id)?'done':!i||completed().has(ls[i-1]?.id)?'current':'locked')+'" title="'+e(l.title)+'">'+(completed().has(l.id)?'✓':i+1)+'</span>').join('')+'</div>'+
 '<div class="studio-inline-actions">'+btn('Kapitel ansehen','track/'+c.id)+ (next?btn('Nächster Schritt →','lesson/'+next.id,'btn primary small'):'<span class="chip free">✓ Abgeschlossen</span>')+'</div></article>';
 }).join('')+'</div>';
}
function projectCard(p){
 const link=/^https:\/\/[^\s<>"']{4,500}$/i.test(p.project_url||'')?'<a href="'+e(p.project_url)+'" target="_blank" rel="noopener noreferrer" class="btn small">Projekt ansehen ↗</a>':'';
 return '<article class="studio-project-card"><div class="studio-project-art '+e(p.category)+'"><span>'+({blender:'◈',web:'◎',fivem:'⬡',coding:'⌘',other:'✧'}[p.category]||'⌘')+'</span><small>'+e(p.category.toUpperCase())+'</small></div>'+
 '<div class="studio-project-body">'+(p.featured?'<span class="chip free">★ Favorit</span>':'')+'<h3>'+e(p.title)+'</h3><p>'+e(p.description||'Noch keine Beschreibung.')+'</p>'+
 '<div class="studio-tech">'+(p.technologies||[]).slice(0,8).map(t=>'<span>'+e(t)+'</span>').join('')+'</div><small>Erstellt '+new Date(p.created_at).toLocaleDateString('de-DE')+'</small>'+
 '<div class="studio-inline-actions">'+link+'<button class="btn small" data-studio-edit="'+e(p.id)+'">Bearbeiten</button><button class="btn small" data-studio-delete="'+e(p.id)+'">Löschen</button></div></div></article>';
}
function portfolioPage(){
 const current=projects.find(x=>x.id===editing),p=current||{};
 const category=p.category||'coding',n=projects.length;
 return heading('MEINE PROJEKTE','Dein <span class="gradient">Portfolio.</span>','Dokumentiere deine ersten Codes, Websites, FiveM-Ressourcen und Blender-Modelle. Deine Projekte werden in deinem Supabase-Konto gespeichert.')+
 '<section class="studio-level-hero studio-portfolio-intro"><div><span class="eyebrow">DEINE WERKE</span><h2>'+n+' '+(n===1?'Projekt':'Projekte')+' im Portfolio</h2><p>Deine Projekte bleiben privat in deinem Konto. Verlinke bei Bedarf eine öffentlich erreichbare Demo oder ein GitHub-Repository.</p></div><span class="studio-big-icon">⬡</span></section>'+
 '<div class="studio-project-layout"><section class="studio-section"><h2>'+(current?'Projekt bearbeiten':'Neues Projekt hinzufügen')+'</h2>'+
 '<form id="studio-project-form" class="studio-form">'+
 '<label>Projektname<input class="input" name="title" required minlength="3" maxlength="100" value="'+e(p.title||'')+'" placeholder="Mein erstes Lua-Script"></label>'+
 '<label>Bereich<select class="select" name="category">'+[['coding','Programmieren'],['web','Webentwicklung'],['fivem','FiveM'],['blender','Blender'],['other','Sonstiges']].map(([k,v])=>'<option value="'+k+'" '+(category===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label>Projektbeschreibung<textarea class="input" name="description" rows="4" maxlength="2500" placeholder="Was hast du gebaut? Welche Funktionen hast du gelernt?">'+e(p.description||'')+'</textarea></label>'+
 '<label>Technologien (mit Komma trennen)<input class="input" name="technologies" maxlength="250" placeholder="Lua, HTML, CSS" value="'+e((p.technologies||[]).join(', '))+'"></label>'+
 '<label>Projektlink (optional, HTTPS)<input class="input" name="project_url" type="url" maxlength="500" placeholder="https://github.com/..." value="'+e(p.project_url||'')+'"></label>'+
 '<label class="studio-check"><input type="checkbox" name="featured" '+(p.featured?'checked':'')+'> Als Favorit markieren</label>'+
 '<div class="studio-inline-actions"><button class="btn primary" type="submit">'+(current?'Änderungen speichern':'Projekt speichern')+'</button>'+(current?'<button class="btn" type="button" data-studio-cancel>Abbrechen</button>':'')+'</div></form></section>'+
 '<section class="studio-section"><div class="studio-section-head"><h2>Deine Sammlung</h2><p>Bearbeite deine Beschreibungen, Links und Technologien jederzeit.</p></div><div class="studio-project-grid">'+(projects.map(projectCard).join('')||'<div class="studio-empty"><strong>Dein erstes Projekt wartet!</strong><p>Schließe eine Übung ab und dokumentiere hier, was du entwickelt hast.</p>'+btn('Kurse entdecken','courses')+'</div>')+'</div></section></div>';
}
function notesPage(){
 const st=state(),items=Object.entries(notes).filter(([,body])=>String(body).trim());
 return heading('MEINE LERNNOTIZEN','Dein <span class="gradient">Wissensspeicher.</span>','Persönliche Notizen bleiben bei deinem Nutzerkonto und lassen sich in jeder Lektion bearbeiten.')+
 '<section class="studio-project-grid">'+(items.map(([id,body])=>{
 const l=(st?.lessons||[]).find(x=>x.id===id);
 return '<article class="studio-section"><h3>'+e(l?.title||'Lektion')+'</h3><p>'+e(body.slice(0,480))+(body.length>480?' …':'')+'</p>'+btn('Lektion und Notiz öffnen','lesson/'+id)+'</article>';
 }).join('')||'<div class="studio-section"><h3>Noch keine Notizen</h3><p>Öffne eine Lektion, um deine ersten Merksätze und Beispiele festzuhalten.</p>'+btn('Lernpfade ansehen','courses')+'</div>')+'</section>';
}
function lessonAddon(lesson,course,p){
 if(!lesson)return '';
 const ls=lessonList(lesson.course_id),index=ls.findIndex(x=>x.id===lesson.id),previous=ls[index-1],next=ls[index+1];
 const steps=Array.isArray(p?.steps)?p.steps.filter(x=>typeof x==='string'&&x.trim()).slice(0,7):[];
 const connected='<div class="studio-learn-chain"><div><small>VORHER GELERNT</small><strong>'+e(previous?.title||'Hier beginnt dein Lernweg')+'</strong>'+(previous?btn('Wiederholen','lesson/'+previous.id):'')+'</div><span aria-hidden="true">→</span><div><small>JETZT LERNST DU</small><strong>'+e(lesson.title)+'</strong></div><span aria-hidden="true">→</span><div><small>DANACH</small><strong>'+e(next?.title||'Abschluss und Praxis')+'</strong>'+(next?btn('Vorschau','lesson/'+next.id):'')+'</div></div>';
 const checklist=steps.length?'<div class="studio-section"><span class="eyebrow">GEFÜHRTES TRAINING</span><h3>So gehst du Schritt für Schritt vor</h3><ol class="studio-lesson-steps">'+steps.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol></div>':'';
 return '<section class="studio-section studio-learn-section"><span class="eyebrow">DEIN ZUSAMMENHÄNGENDER LERNWEG</span><h2>Schritt für Schritt weiterlernen</h2><p>Diese Station gehört zu <strong>'+e(course?.name||'deinem Lernpfad')+'</strong>. Wiederhole bei Bedarf den vorherigen Schritt und verbinde das Wissen mit deiner aktuellen Aufgabe.</p>'+connected+'</section>'+checklist+
 '<section class="studio-section"><span class="eyebrow">DEINE EIGENEN NOTIZEN</span><h3>Was willst du dir merken?</h3><p>Notiere Regeln, wichtige Blender-Tastenkombinationen oder eigene Codebeispiele.</p>'+
 '<textarea class="input" id="studio-lesson-note" maxlength="12000" rows="4" placeholder="Meine Notizen zu dieser Lektion …">'+e(notes[lesson.id]||'')+'</textarea>'+
 '<div class="studio-inline-actions"><button class="btn small" type="button" data-studio-note="'+e(lesson.id)+'">Notiz speichern</button>'+btn('Alle Notizen','notes')+'</div></section>';
}
function homeSection(){
 const m=level(),last=projects[0],st=state();
 const recent=st?.progress?.lastLesson?.id;
 const l=(st?.lessons||[]).find(x=>x.id===recent);
 return '<section class="studio-home-intro"><div><span class="eyebrow">NEU · DEIN LERNSTUDIO</span><h2>Mehr als nur XP sammeln.</h2><p>Schalte Profilrahmen frei, halte deine Projekte fest und entdecke, wie die Lernschritte zusammengehören.</p></div>'+
 '<div class="studio-home-cards"><button data-go="level" class="studio-home-card"><strong>✦ Level '+m.number+'</strong><small>'+m.next+' XP bis zum nächsten Level</small><span>Belohnungen ansehen →</span></button>'+
 '<button data-go="portfolio" class="studio-home-card"><strong>⬡ Mein Portfolio</strong><small>'+projects.length+' Projekte · '+e(last?.title||'Dein erstes Werk erstellen')+'</small><span>Portfolio öffnen →</span></button>'+
 '<button data-go="skilltree" class="studio-home-card"><strong>⌘ Skilltree</strong><small>'+e(l?.title||'Deine nächsten Lernschritte')+'</small><span>Lernreise ansehen →</span></button>'+
 '<button data-go="notes" class="studio-home-card"><strong>▤ Lernnotizen</strong><small>'+Object.values(notes).filter(Boolean).length+' Notizen gespeichert</small><span>Notizen öffnen →</span></button></div></section>';
}
function settingsSection(){
 return '<section class="setting-section studio-section"><span class="eyebrow">LERNSTUDIO · ZUSATZFUNKTIONEN</span><h2>Editor, Fokus & Belohnungen</h2><p>Diese Einstellungen werden in deinem Supabase-Konto gespeichert und beim nächsten Login wieder geladen.</p>'+
 '<div class="studio-setting-grid"><label>Editor-Schriftgröße<select class="select" data-studio-setting="fontSize">'+[12,13,14,15,16,17,18,20,22].map(n=>'<option value="'+n+'" '+((Number(prefs.fontSize)||15)===n?'selected':'')+'>'+n+' px</option>').join('')+'</select></label>'+
 '<label class="studio-check"><input type="checkbox" data-studio-setting="wrap" '+(prefs.wrap?'checked':'')+'> Lange Codezeilen umbrechen</label>'+
 '<label class="studio-check"><input type="checkbox" data-studio-setting="calm" '+(prefs.calm?'checked':'')+'> Ruhiger Lernmodus (weniger Effekte)</label>'+
 '<label class="studio-check"><input type="checkbox" data-studio-setting="tipsExpanded" '+(prefs.tipsExpanded?'checked':'')+'> Zusätzliche Lerntipps standardmäßig anzeigen</label></div>'+
 '<div class="studio-inline-actions">'+btn('Level-Belohnungen','level')+btn('Projektportfolio','portfolio')+btn('Lernnotizen','notes')+'</div></section>';
}
async function saveProject(form){
 const id=getId(),api=client();if(!id||!api)return;
 const f=new FormData(form),title=String(f.get('title')||'').trim(),description=String(f.get('description')||'').trim();
 const category=String(f.get('category')||'coding'),url=String(f.get('project_url')||'').trim();
 const technologies=[...new Set(String(f.get('technologies')||'').split(',').map(t=>t.trim()).filter(Boolean))].slice(0,12);
 if(title.length<3||title.length>100)throw Error('Projektname: 3 bis 100 Zeichen.');
 if(description.length>2500)throw Error('Beschreibung ist zu lang.');
 if(url&&!/^https:\/\/[^\s<>"']{4,500}$/i.test(url))throw Error('Bitte nur gültige HTTPS-Projektlinks verwenden.');
 if(technologies.some(t=>t.length>36))throw Error('Technologie-Tags dürfen maximal 36 Zeichen haben.');
 const value={title,description,category,technologies,project_url:url,featured:f.has('featured'),updated_at:new Date().toISOString()};
 let response;
 if(editing)response=await api.from('academy_portfolio_projects').update(value).eq('id',editing).eq('user_id',id).select();
 else response=await api.from('academy_portfolio_projects').insert({...value,user_id:id}).select();
 if(response.error)throw response.error;
 if(!response.data?.length)throw Error('Änderung nicht bestätigt.');
 editing=null;await refreshProjects();redraw();message('Projekt erfolgreich gespeichert.');
}
async function refreshProjects(){
 const r=await client().from('academy_portfolio_projects').select('id,title,description,category,technologies,project_url,featured,created_at,updated_at').eq('user_id',getId()).order('created_at',{ascending:false}).limit(120);
 if(r.error)throw r.error;projects=r.data||[];
}
async function saveNote(id){
 if(!(state()?.lessons||[]).some(l=>l.id===id))return;
 const body=String($('#studio-lesson-note')?.value||'').trim();if(body.length>12000)throw Error('Notiz darf höchstens 12.000 Zeichen enthalten.');
 const r=await client().from('academy_lesson_notes').upsert({user_id:getId(),lesson_id:id,body,updated_at:new Date().toISOString()},{onConflict:'user_id,lesson_id'});
 if(r.error)throw r.error;notes[id]=body;message('Lernnotiz gespeichert.');
}
document.addEventListener('click',async ev=>{
 if(!bridge||!state()?.ready)return;
 const clicked=ev.target.closest('[data-studio-frame],[data-studio-edit],[data-studio-delete],[data-studio-cancel],[data-studio-note]');if(!clicked)return;
 ev.preventDefault();
 try{
  if(clicked.hasAttribute('data-studio-frame')){await setPref('frame',clicked.dataset.studioFrame);redraw();}
  else if(clicked.hasAttribute('data-studio-edit')){editing=clicked.dataset.studioEdit;redraw();$('#studio-project-form')?.scrollIntoView({behavior:'smooth'});}
  else if(clicked.hasAttribute('data-studio-cancel')){editing=null;redraw();}
  else if(clicked.hasAttribute('data-studio-delete')){
   const p=projects.find(x=>x.id===clicked.dataset.studioDelete);
   if(!p||!confirm('Projekt „'+p.title+'“ endgültig löschen?'))return;
   const r=await client().from('academy_portfolio_projects').delete().eq('user_id',getId()).eq('id',p.id).select('id');
   if(r.error)throw r.error;if(!r.data?.length)throw Error('Projekt konnte nicht gelöscht werden.');
   if(editing===p.id)editing=null;await refreshProjects();redraw();message('Projekt gelöscht.');
  }else if(clicked.hasAttribute('data-studio-note'))await saveNote(clicked.dataset.studioNote);
 }catch(err){message(err.message||'Die Aktion konnte nicht abgeschlossen werden.');}
});
document.addEventListener('change',ev=>{
 const el=ev.target.closest('[data-studio-setting]');if(!el||!bridge||!state()?.ready)return;
 const key=el.dataset.studioSetting,number=key==='fontSize',value=number?Number(el.value):el.checked;
 void setPref(key,value);
});
document.addEventListener('submit',async ev=>{
 if(ev.target.id!=='studio-project-form'||!bridge)return;ev.preventDefault();
 const form=ev.target,button=form.querySelector('button[type="submit"]');if(button)button.disabled=true;
 try{await saveProject(form);}catch(err){message(err.message||'Projekt konnte nicht gespeichert werden.');}
 finally{if(button&&button.isConnected)button.disabled=false;}
},true);
root.LLStudio={connect:b=>{bridge=b},load,clear,apply,levelPage,skilltreePage,portfolioPage,notesPage,lessonAddon,homeSection,settingsSection,level,rewards:REWARDS};
})(window);
