
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalog=[
 {id:'Ci3Has4L5W4',name:'Blender – Einstieg, Modellieren und Rendern',author:'Kevin Stratvert',lang:'Englisch',match:'blender',desc:'Blender 2025: Oberfläche, Objekte, Materialien, Licht und Rendering.'},
 {id:'Zi-Q0t4gMC8',name:'JavaScript – kompletter Grundkurs',author:'freeCodeCamp.org',lang:'Englisch',match:'javascript',desc:'Variablen, Arrays, Funktionen und Kontrollfluss.'},
 {id:'a_iQb1lnAEQ',name:'HTML & CSS – Grundkurs',author:'freeCodeCamp.org',lang:'Englisch',match:'web',desc:'Grundlagen von Webseiten, HTML und CSS.'},
 {id:'K5KVEU3aaeQ',name:'Python – Full Course for Beginners',author:'Programming with Mosh',lang:'Englisch',match:'python',desc:'Python 2025: Variablen, Funktionen, Bedingungen, Schleifen.'},
 {id:'Tsk1-tKgMH0',name:'FiveM – Lua-Scripting für Anfänger (2025)',author:'TraseDev',lang:'Englisch',match:'fivem',desc:'FiveM-Tutorial 2025: eigene Resource und erste Lua-Befehle.'},
 {id:'9eIYmRg5ZeQ',name:'Lua in FiveM – Resource Basics',author:'Jeva',lang:'Englisch',match:'lua',desc:'Erste Resource und Grundlagen. Ältere APIs unbedingt mit docs.fivem.net abgleichen.'}
];
const isValid=id=>typeof id==='string'&&/^[\w-]{11}$/.test(id);
function suggest(lesson,course){
 if(isValid(lesson.videoId)){const video=catalog.find(v=>v.id===lesson.videoId);return{id:lesson.videoId,title:video?.name||'Passendes Tutorial',author:video?.author||'YouTube',start:Math.max(0,+lesson.videoStart||0)}}
 const lang=String(lesson.lang||'').toLowerCase(),category=String(course?.category||'');
 let match=category==='Video & Schnitt'?'video':category==='3D & Blender'?'blender':category==='Musik'?'music':['FiveM','Frameworks'].includes(category)?'fivem':['html','css'].includes(lang)?'web':lang==='javascript'?'javascript':lang==='python'?'python':lang==='lua'?'lua':null;
 const v=catalog.find(x=>x.match===match);if(!v)return null;
 let start=0;
 if(v.match==='javascript'){const text=lesson.title.toLowerCase();if(/variable|datentyp/.test(text))start=466;else if(/array/.test(text))start=8040;else if(/function/.test(text))start=10880;else if(/loop|schleife|if-|condition/.test(text))start=3391}
 return{id:v.id,title:v.name,author:v.author,start};
}
function section(lesson,course){
 const required=!!lesson?.id;
 const q=`${lesson.title} ${course.name} Tutorial ${course.category==='3D & Blender'?'Blender 4.5':course.category==='FiveM'?'FiveM Cfx Lua':'Programmieren'} deutsch`;
 const query='https://www.youtube.com/results?search_query='+encodeURIComponent(q),v=suggest(lesson,course);
 const token=v?`<div class="v5-yt-preview"><span>▶</span><div><b>${esc(v.title)}</b><small>${esc(v.author)} · Externer Kursüberblick</small></div></div><button class="btn primary v5-load-video" data-video-id="${esc(v.id)}" data-video-start="${v.start}">▶ Video hier laden</button>`:`<p class="micro">Für dieses Spezialthema ist noch kein einzeln überprüftes Video zugeordnet. Die gezielte Suche zeigt weitere Tutorials.</p>`;
 return `<section class="panel v5-lesson-video ll7-lesson-video"><span class="ll7-step">${required?'PFLICHTMODUL 01 / VIDEO':'VIDEOTHEK / TUTORIAL'}</span><h3>Tutorial ansehen und verstehen</h3><p class="text-muted">Sieh dir die passende Stelle an, notiere die wichtigsten Erkenntnisse und setze die Praxisaufgabe anschließend selbst um. Das Video ergänzt die schriftliche Erklärung. Wenn es nicht genau dieses Unterthema behandelt, nutze die verlinkte Suche nach einem passenden Spezialtutorial.</p>${token}<div class="ll7-lesson-video-footer"><a href="${query}" target="_blank" rel="noopener noreferrer">Alternatives Tutorial zum Thema suchen ↗</a><p class="micro">Aus Datenschutzgründen wird YouTube erst nach Klick geladen. Die Academy kann nicht technisch nachweisen, wie viel davon du gesehen hast.</p>${required?'<button class="btn primary" data-act="video-confirm" type="button">✓ Ich habe das Video aufmerksam angesehen</button><small>Selbstbestätigung · Anschließend praktische Aufgabe und Quiz bearbeiten</small>':''}</div></section>`;
}
function attach(node,lesson,course){
 if(!node)return;
 const wrap=document.createElement('div');wrap.innerHTML=section(lesson,course);
 const sectionNode=wrap.firstElementChild;
 node.append(sectionNode);
 sectionNode.querySelector('[data-video-id]')?.addEventListener('click',e=>{
  const btn=e.currentTarget,id=btn.dataset.videoId,start=Number(btn.dataset.videoStart)||0;
  if(!isValid(id))return;
  const frame=document.createElement('iframe');frame.className='v5-video-frame';frame.src=`https://www.youtube-nocookie.com/embed/${id}?start=${Math.max(0,start)}`;frame.title='YouTube-Lernvideo';frame.allow='accelerometer;encrypted-media;picture-in-picture;web-share';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;frame.loading='lazy';
  const box=document.createElement('div');box.className='v5-video-box';box.append(frame);btn.replaceWith(box);
 },{once:true});
}
window.LLVideo={catalog,suggest,section,attach};
})();
