
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalog=[
 {id:'z-Xl9tGqH14',name:'Blender 2026 – Einsteigerkurs',author:'Blender Guru',lang:'Englisch',match:'blender',desc:'Modelling, Materialien, UV, Licht, Rendering – mit Kapitelmarken.'},
 {id:'Zi-Q0t4gMC8',name:'JavaScript – vollständiger Grundkurs',author:'freeCodeCamp.org',lang:'Englisch',match:'javascript',desc:'Variablen, Arrays, Funktionen, Operatoren und Kontrollfluss.'},
 {id:'a_iQb1lnAEQ',name:'HTML & CSS – vollständiger Grundkurs',author:'freeCodeCamp.org',lang:'Englisch',match:'web',desc:'HTML-Tags, Formulare, CSS, Layouts und Projekte.'},
 {id:'rfscVS0vtbw',name:'Python – Anfänger bis Praxis',author:'freeCodeCamp.org',lang:'Englisch',match:'python',desc:'Python-Grundlagen und kleine Coding-Übungen.'},
 {id:'M-FBQTWqyvg',name:'FiveM Lua – Script-Einstieg',author:'FiveM Lernvideo',lang:'Deutsch',match:'fivem',desc:'Ergänzende Demonstration; für aktuelle API-Details immer Cfx-Dokumentation verwenden.'},
 {id:'NmUaIoydldg',name:'BandLab Studio – Einführung',author:'BandLab',lang:'Englisch',match:'music',desc:'DAW-Bedienung; dazu eigene Drum-, Mixing- und Export-Übungen.'},
 {id:'MCDVcQIA3UM',name:'DaVinci Resolve – Schnitt, Farbe und Export',author:'Casey Faris',lang:'Englisch',match:'video',desc:'Strukturierter Grundkurs zu Medienimport, Edit Page, Color, Fairlight und Export.'}
];
const isValid=id=>typeof id==='string'&&/^[\w-]{11}$/.test(id);
function suggest(lesson,course){
 if(isValid(lesson.videoId)){const video=catalog.find(v=>v.id===lesson.videoId);return{id:lesson.videoId,title:video?.name||'Passendes Tutorial',author:video?.author||'YouTube',start:Math.max(0,+lesson.videoStart||0)}}
 const lang=String(lesson.lang||'').toLowerCase(),category=String(course?.category||'');
 let match=category==='Video & Schnitt'?'video':category==='3D & Blender'?'blender':category==='Musik'?'music':['FiveM','Frameworks'].includes(category)?'fivem':['html','css'].includes(lang)?'web':lang==='javascript'?'javascript':lang==='python'?'python':null;
 const v=catalog.find(x=>x.match===match);if(!v)return null;
 let start=0;
 if(v.match==='javascript'){const text=lesson.title.toLowerCase();if(/variable|datentyp/.test(text))start=466;else if(/array/.test(text))start=8040;else if(/function/.test(text))start=10880;else if(/loop|schleife|if-|condition/.test(text))start=3391}
 return{id:v.id,title:v.name,author:v.author,start};
}
function section(lesson,course){
 const required=!!lesson?.id;
 const q=`${lesson.title} ${course.name} Tutorial ${course.category==='3D & Blender'?'Blender':course.category==='Musik'?'Musikproduktion':'Programmieren'} deutsch`;
 const query='https://www.youtube.com/results?search_query='+encodeURIComponent(q),v=suggest(lesson,course);
 const token=v?`<div class="v5-yt-preview"><span>▶</span><div><b>${esc(v.title)}</b><small>${esc(v.author)} · Externer Kursüberblick</small></div></div><button class="btn primary v5-load-video" data-video-id="${esc(v.id)}" data-video-start="${v.start}">▶ Video hier laden</button>`:`<p class="micro">Für dieses Spezialthema ist noch kein einzeln überprüftes Video zugeordnet. Die gezielte Suche zeigt weitere Tutorials.</p>`;
 return `<section class="panel v5-lesson-video ll7-lesson-video"><span class="ll7-step">${required?'PFLICHTMODUL 01 / VIDEO':'VIDEOTHEK / TUTORIAL'}</span><h3>Tutorial ansehen und verstehen</h3><p class="text-muted">Sieh dir die passende Stelle an, notiere die wichtigsten Erkenntnisse und setze die Praxisaufgabe anschließend selbst um. Das Video ergänzt die schriftliche Erklärung.</p>${token}<div class="ll7-lesson-video-footer"><a href="${query}" target="_blank" rel="noopener noreferrer">Alternatives Tutorial zum Thema suchen ↗</a><p class="micro">Aus Datenschutzgründen wird YouTube erst nach Klick geladen. Die Academy kann nicht technisch nachweisen, wie viel davon du gesehen hast.</p>${required?'<button class="btn primary" data-act="video-confirm" type="button">✓ Ich habe das Video aufmerksam angesehen</button><small>Selbstbestätigung · Anschließend praktische Aufgabe und Quiz bearbeiten</small>':''}</div></section>`;
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
