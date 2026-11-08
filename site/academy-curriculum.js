/* LiveryLab Academy · Curriculum reader
 * This module displays lesson-specific sections and vetted quiz questions;
 * it does not alter the main menu or the simple code checker.
 * Made with 💙 by NyxAtheris (LiveryLab Studios)
 */
(function(root){
'use strict';
function parts(p){
 return (Array.isArray(p?.sections)?p.sections:[]).filter(x=>
  x&&typeof x.title==='string'&&x.title.trim()&&
  Array.isArray(x.paragraphs)&&x.paragraphs.some(t=>typeof t==='string'&&t.trim())).slice(0,2);
}
function questions(p){
 const originalOptions=Array.isArray(p?.options)?p.options.map(String):[];
 const originalCorrect=Number(p?.correct);
 const original=originalOptions.length>=2&&
  originalOptions.every(x=>x.trim().length>0)&&
  Number.isInteger(originalCorrect)&&originalCorrect>=0&&originalCorrect<originalOptions.length?
  [{question:String(p.quiz||'Welche Aussage ist richtig?'),options:originalOptions,
    correct:originalCorrect,explanation:''}]:[];
 const bank=Array.isArray(p?.quiz_items)?p.quiz_items:[];
 const valid=bank.filter(q=>q&&typeof q.question==='string'&&q.question.trim().length>=8&&
  Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=6&&
  q.options.every(x=>typeof x==='string'&&x.trim().length>0)&&
  new Set(q.options.map(x=>x.trim().toLocaleLowerCase())).size===q.options.length&&
  Number.isInteger(Number(q.correct))&&Number(q.correct)>=0&&Number(q.correct)<q.options.length
 ).map(q=>({question:String(q.question),options:q.options.map(String),
   correct:Number(q.correct),explanation:String(q.explanation||'')}));
 // Never invent alternatives by mixing unrelated task, goal and mistake fields.
 // V3 is reviewed context-by-context; older V2 generated banks are unreliable.
 if(Number(p?.quiz_version)>=3&&valid.length>=2&&valid.length===bank.length){
  return valid.slice(0,3);
 }
 return original;
}
function render(p,index,escapeHtml,safeLink){
 const a=parts(p),esc=escapeHtml;
 if(!a.length){
  return '<h2>Die Idee dahinter.</h2><p>'+esc(p.theory||p.goal||'')+'</p>'+
   (Array.isArray(p.keyPoints)?'<ul>'+p.keyPoints.slice(0,4).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+
   (p.mistake?'<div class="note"><strong>Typischer Fehler:</strong> '+esc(p.mistake)+'</div>':'')+
   (p.example?'<div class="codebox"><pre><code>'+esc(p.example)+'</code></pre></div>':'')+
   (p.resource?'<p><a href="'+safeLink(p.resource)+'" rel="noopener noreferrer" target="_blank">Offizielle Dokumentation ↗</a></p>':'');
 }
 const at=Math.max(0,Math.min(a.length-1,Number(index)||0));
 const t=a[at];
 return '<div class="ll-part-heading"><div><span class="eyebrow">LERNTEIL '+(at+1)+' VON '+a.length+'</span><h2>'+esc(t.title)+'</h2></div></div>'+
  '<nav class="ll-part-selector ll-part-selector-two" aria-label="Lernteile">'+a.map((v,i)=>{
   const short=i===0?'Verstehen':'Üben';
   return '<button type="button" data-lesson-part="'+i+'" class="'+(i===at?'active':'')+'" aria-current="'+(i===at?'step':'false')+'" aria-label="Lernteil '+(i+1)+': '+esc(v.title)+'"><span class="ll-part-number">'+(i+1)+'</span><span>'+short+'</span></button>';
  }).join('')+'</nav>'+
  '<div class="ll-lesson-focus"><span>'+(at===0?'DEIN LERNZIEL':'DEINE KONKRETE AUFGABE')+'</span><strong>'+esc(at===0?p.goal||p.theory||'Verstehe das Beispiel.':p.task||t.exercise||'Wende das Gelernte an.')+'</strong></div>'+
  '<div class="ll-part-body">'+
  t.paragraphs.filter(x=>typeof x==='string'&&x.trim()).map(x=>'<p>'+esc(x)+'</p>').join('')+
  (Array.isArray(t.bullets)&&t.bullets.length?'<ul>'+t.bullets.filter(x=>typeof x==='string'&&x.trim()).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
  (typeof t.code==='string'&&t.code.trim()?'<div class="codebox"><pre><code>'+esc(t.code)+'</code></pre></div>':'')+
  (typeof t.exercise==='string'&&t.exercise.trim()?'<div class="note"><strong>Jetzt selbst ausprobieren:</strong> '+esc(t.exercise)+'</div>':'')+
  '</div><div class="ll-part-controls">'+
  (at===0?'<button type="button" class="btn primary" data-lesson-part="1">Zum Übungsteil →</button>':
  '<button type="button" class="btn" data-lesson-part="0">← Zur Erklärung</button>')+
  '</div>'+
  (p.resource?'<p><a href="'+safeLink(p.resource)+'" rel="noopener noreferrer" target="_blank">Offizielle Dokumentation ↗</a></p>':'');
}
root.LLCurriculum={parts,questions,render};
})(typeof module!=='undefined'&&module.exports?module.exports:window);
