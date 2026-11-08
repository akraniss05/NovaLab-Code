/* Academy v1.5: subjective whole-course difficulty, separate from entry level. */
(function(root){
'use strict';
const ratings=Object.freeze({"coding-basics":1,"html":1,"json":1,"bash":2,"blender-fundamentals":2,"css":2,"dart":2,"git":2,"lua":2,"php":2,"powershell":2,"python":2,"ruby":2,"api":3,"blender-animation":3,"browsergames":3,"csharp":3,"docker":3,"fivem":3,"go":3,"java":3,"javascript":3,"julia":3,"kotlin":3,"nodejs":3,"perl":3,"r":3,"react":3,"sql":3,"swift":3,"typescript":3,"blender-fivem-assets":4,"c":4,"elixir":4,"esx":4,"nui":4,"ox":4,"proskills":4,"python-pro-lab":4,"qbcore":4,"scala":4,"testing":4,"webapps":4,"blender-technical":5,"cpp":5,"fivemadmin":5,"fullstack-pro-lab":5,"haskell":5,"lua-masterlab":5,"rust":5,"security":5,"zig":5});
const labels={de:['','Sehr leicht','Leicht','Mittel','Schwer','Sehr schwer'],en:['','Very easy','Easy','Medium','Hard','Very hard']};
function language(){try{return root.LLI18n?.language?.()==='en'?'en':'de';}catch(_){return 'de';}}
function score(course){
 const raw=Number(course?.difficulty);
 return Number.isInteger(raw)&&raw>=1&&raw<=5?raw:(ratings[String(course?.id||'')]||3);
}
function label(course){const n=typeof course==='number'?course:score(course);return labels[language()][n]||labels[language()][3];}
function badge(course){
 const n=score(course),en=language()==='en',name=en?'Difficulty':'Schwierigkeit';
 const explanation=en?'How hard it is to master the entire course, not its introductory level.':'Schwierigkeit des gesamten Kurses, nicht seines Einstiegsniveaus.';
 return '<span class="ll-course-difficulty ll-course-difficulty-'+n+'" data-difficulty="'+n+'" title="'+explanation+'" aria-label="'+name+': '+label(n)+', '+n+' '+(en?'of':'von')+' 5">'+
 '<span class="ll-difficulty-label">'+name+': <strong>'+label(n)+'</strong></span><span class="ll-difficulty-points" aria-hidden="true">'+
 '<span class="ll-difficulty-active">'+('●'.repeat(n))+'</span>'+('○'.repeat(5-n))+'</span><small>'+n+'/5</small></span>';
}
function description(){return language()==='en'?'Difficulty estimates the entire language or field. Beginner lessons within the course can still be easier.':'Die Schwierigkeit bezieht sich auf die gesamte Sprache bzw. das Fachgebiet. Die ersten Lektionen können deutlich leichter sein.';}
const detailTexts={
 de:['',
 'Ideal für den Einstieg: einfache Bausteine und schnelle Erfolgserlebnisse.',
 'Gut zugängliche Grundlagen. Erste eigene Skripte und kleine Projekte.',
 'Mehr Logik und Kombinationen. Du baust größere Anwendungen und Systeme.',
 'Komplexe Abläufe mit Architektur, Debugging und anspruchsvoller Praxis.',
 'Tiefe technische Konzepte, Präzision und Expertenprojekte.'],
 en:['',
 'Perfect for beginners: simple building blocks and quick wins.',
 'Approachable fundamentals. Build your first scripts and smaller projects.',
 'More logic and connected concepts. Build larger apps and systems.',
 'Complex workflows, architecture, debugging and demanding practice.',
 'Deep technical concepts, precision and expert-level projects.']
};
function levelDescription(n){return detailTexts[language()][Number(n)]||'';}
function searchTerms(course){
 const n=score(course);
 return [labels.de[n],labels.en[n],n+'/5','stufe '+n,'level '+n,'schwierigkeit '+n,'difficulty '+n].join(' ');
}
root.LLDifficulty=Object.freeze({ratings,score,label,badge,description,levelDescription,searchTerms});
})(typeof window==='undefined'?globalThis:window);
