/* Verify that theory and examples are lesson-specific, without duplicated generic assignments. */
'use strict';
const assert=require('node:assert/strict');
const {LLCurriculum}=require('../site/academy-curriculum.js');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p={title:'Lokale Variablen',theory:'Mit local hat eine Variable einen begrenzten Gültigkeitsbereich.',
 example:'local x = 2\\nprint(x)',explanation_steps:['local erstellt eine lokale Variable.'],
 example_notes:['Die erste Zeile speichert 2 in x.','print(x) gibt 2 aus.'],
 sections:[{title:'Generisch',paragraphs:['Überprüfe deine Dateistruktur und dokumentiere das Projekt.']}],
 goal:'Erledige eine Aufgabe.',task:'Erstelle eine README.',mistake:'Vergiss local nicht.'};
const a=LLCurriculum.render(p,0,escape,()=> '#');
const b=LLCurriculum.render(p,1,escape,()=> '#');
assert.equal(LLCurriculum.parts(p).length,2);
assert.match(a,/Lokale Variablen/);
assert.match(a,/begrenzten Gültigkeitsbereich/);
assert.match(a,/local erstellt eine lokale Variable/);
assert.match(b,/local x = 2/);
assert.match(b,/Die erste Zeile speichert 2/);
assert.match(b,/Vergiss local nicht/);
for(const text of [a,b]){
 assert.doesNotMatch(text,/Überprüfe deine Dateistruktur/);
 assert.doesNotMatch(text,/Erstelle eine README/);
 assert.doesNotMatch(text,/Erledige eine Aufgabe/);
}
assert.equal(LLCurriculum.questions({quiz:'A?',options:['A','B'],correct:1}).length,1);
assert.equal(LLCurriculum.questions({quiz:'Ungültig?',options:['A','B'],correct:null}).length,0);
const valid={question:'Welche Aussage stimmt?',options:['A','B'],correct:0};
assert.equal(LLCurriculum.questions({quiz_version:4,quiz_items:[valid,{...valid,correct:null},{...valid,question:'Welche Ausgabe ist richtig?'}]}).length,2);
console.log('PASS: Specific explanations and examples without generic exercises.');

const enriched=LLCurriculum.render({title:'print in Lua',lang:'lua',theory:'print zeigt Text an.',
 keyPoints:['Anders als ein Variablenname wird Text mit Anführungszeichen gekennzeichnet.'],
 example_notes:['In diesem Beispiel erscheinen zwei eigene Ausgaben nacheinander.']},0,escape,()=> '#');
assert.match(enriched,/Das solltest du dir merken/,'Additional specific facts must be visible');
assert.match(enriched,/So wirkt das im Beispiel/,'Brief theory must show the corresponding example outcome');
