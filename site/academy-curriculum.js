/* NovaLab Academy · Focused lesson reader
 * Teach the subject first. Exercises remain in the separate practice step.
 * Made with 💙 by NyxAtheris (NovaLab Academy)
 */
(function(root){
'use strict';
function parts(p){
 if(!p || (!String(p.theory||'').trim()&&!String(p.example||'').trim()&&!String(p.goal||p.title||'').trim()&&!(Array.isArray(p.sections)&&p.sections.length)))return [];
 return [{title:'Thema verstehen'},{title:'Beispiel nachvollziehen'}];
}
function validAnswerIndex(value,count){
 if(typeof value!=='number'&&(typeof value!=='string'||!/^\d+$/.test(value)))return false;
 const index=Number(value);
 return Number.isInteger(index)&&index>=0&&index<count;
}
function questions(p){
 const originalOptions=Array.isArray(p?.options)?p.options.map(String):[];
 const originalCorrect=Number(p?.correct);
 const original=originalOptions.length>=2&&
  originalOptions.every(x=>x.trim().length>0)&&
  validAnswerIndex(p?.correct,originalOptions.length)?
  [{question:String(p.quiz||'Welche Aussage ist richtig?'),options:originalOptions,
    correct:originalCorrect,explanation:String(p.quiz_explanation||'')}]:[];
 const bank=Array.isArray(p?.quiz_items)?p.quiz_items:[];
 const valid=bank.filter(q=>q&&typeof q.question==='string'&&q.question.trim().length>=8&&
  Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=6&&
  q.options.every(x=>typeof x==='string'&&x.trim().length>0)&&
  new Set(q.options.map(x=>x.trim())).size===q.options.length&&
  validAnswerIndex(q.correct,q.options.length)
 ).map(q=>({question:String(q.question),options:q.options.map(String),
   correct:Number(q.correct),explanation:String(q.explanation||'')}));
 if(Number(p?.quiz_version)>=3&&valid.length>=2)return valid.slice(0,3);
 return original;
}
function safeNotes(value,max){
 return (Array.isArray(value)?value:[]).filter(x=>typeof x==='string'&&x.trim()).slice(0,max);
}
function render(p,index,escapeHtml,safeLink){
 const esc=escapeHtml,sections=parts(p),at=Math.max(0,Math.min(sections.length-1,Number(index)||0));
 if(!sections.length)return '<h2>Erklärung</h2><p>Für diese Lektion ist noch kein Erklärungstext hinterlegt.</p>';
 const theory=String(p.theory||'').trim(),example=String(p.example||'').trim();
 const title=String(p.title||'Das Thema').trim();
 const intro=safeNotes(p.explanation_steps,5),notes=safeNotes(p.example_notes,5);
 // Use genuine lesson-specific facts rather than generated filler paragraphs.
 const focus=safeNotes(p.keyPoints,4).filter(x=>x.length>=30&&
  !theory.toLocaleLowerCase().includes(x.toLocaleLowerCase())&&
  !/^(?:Prüfe zuerst die Eingaben|Lies den Beispielcode|Dokumentiere)/i.test(x)).slice(0,3);
 const context=theory.length>0&&theory.length<220?
  notes.find(x=>x.length>=30&&!theory.toLocaleLowerCase().includes(x.toLocaleLowerCase()))||'':'';
 const isBlender=/blender|3d/i.test([p.courseId,p.category,p.lang].join(' '));
 const doc=p.resource?'<p class="ll-resource-link"><a href="'+safeLink(p.resource)+'" rel="noopener noreferrer" target="_blank">Weiterführende Quelle ↗</a></p>':'';
 const header='<div class="ll-part-heading"><div><span class="eyebrow">LERNTEIL '+(at+1)+' VON 2</span><h2>'+esc(sections[at].title)+'</h2></div></div>'+
  '<nav class="ll-part-selector ll-part-selector-two" aria-label="Erklärung und Beispiel">'+
  sections.map((s,i)=>'<button type="button" data-lesson-part="'+i+'" class="'+(i===at?'active':'')+'" aria-current="'+(i===at?'step':'false')+'" aria-label="Lernteil '+(i+1)+': '+esc(s.title)+'"><span class="ll-part-number">'+(i+1)+'</span><span>'+(i===0?'Erklärung':'Beispiel')+'</span></button>').join('')+'</nav>';
 let body='';
 if(at===0){
  body='<div class="ll-part-body"><h3>'+esc(title)+'</h3>'+
   (theory?'<p>'+esc(theory)+'</p>':'<p>Sieh dir im nächsten Lernteil das konkrete Beispiel an.</p>')+
   (focus.length?'<h3>Das solltest du dir merken</h3><ul class="ll-explanation-steps">'+focus.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
   (intro.length?'<h3>So funktioniert es</h3><ol class="ll-explanation-steps">'+intro.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'')+
   (context?'<div class="note"><strong>So wirkt das im Beispiel:</strong> '+esc(context)+'</div>':'')+
   '</div>';
 }else{
  body='<div class="ll-part-body"><h3>Ein konkretes Beispiel</h3>'+
   (example?(isBlender?'<div class="note ll-example-scene"><strong>In Blender:</strong> '+esc(example)+'</div>':
    '<div class="codebox"><pre><code>'+esc(example)+'</code></pre></div>'):
    '<p>Für dieses Thema ist noch kein Beispiel verfügbar.</p>')+
   (notes.length?'<h3>Schritt für Schritt erklärt</h3><ol class="ll-explanation-steps">'+notes.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'')+
   ((typeof p.mistake==='string'&&p.mistake.trim()&&!/dokumentier|projektstruktur|regressionstest|lies den beispielcode/i.test(p.mistake))?
     '<div class="note"><strong>Typischer Fehler:</strong> '+esc(p.mistake)+'</div>':'')+
   '</div>';
 }
 const controls='<div class="ll-part-controls">'+
  (at===0?'<button type="button" class="btn primary" data-lesson-part="1">Beispiel ansehen →</button>':
   '<button type="button" class="btn" data-lesson-part="0">← Zur Erklärung</button>')+'</div>';
 return header+body+controls+doc;
}
root.LLCurriculum={parts,questions,render};
})(typeof module!=='undefined'&&module.exports?module.exports:window);
