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
console.log('PASS: Specific explanations and examples without generic exercises.');
