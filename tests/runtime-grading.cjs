/* Real runtime grading contract: correct output alone is not enough without the topic's syntax. */
'use strict';
const assert=require('node:assert/strict');
const p=require('../site/practice-engine.js').LLPractice;
const check=(code,task,actual,expected)=>p.evaluateRuntime(code,task,{ok:true,available:true,lines:actual},{ok:true,available:true,lines:expected});
const python={
 lang:'python',task:'Baue das Beispiel Variablen und Datentypen ohne Kopieren nach. Ändere anschließend mindestens einen Wert oder Parameter und erkläre den Unterschied.',
 checks:['print'],solution:'name = "Alex"\nlevel = 3\nprint(name, level)'
};
assert.equal(check('print("Alex 3")',python,['Alex 3'],['Alex 3']).ok,false,'Hard-coded print must not pass variables task');
assert.equal(check('name="Mia"\nlevel=5\nprint(name,level)',python,['Mia 5'],['Alex 3']).ok,true,'Real Python variable alternative accepted');
const conditional={
 lang:'python',task:'Schreibe eine if else Bedingung.',checks:['print'],solution:'geld=150\nif geld >= 100:\n    print("Kauf möglich")\nelse:\n    print("Zu wenig Geld")'
};
assert.equal(check('geld=150\nprint("Kauf möglich")',conditional,['Kauf möglich'],['Kauf möglich']).ok,false,'Missing if/else must be rejected');
assert.equal(check('geld=150\nif geld >= 100:\n    print("Kauf möglich")\nelse:\n    print("Zu wenig Geld")',conditional,['Kauf möglich'],['Kauf möglich']).ok,true);
const lua={lang:'lua',task:'Gib deinen eigenen Namen und danach „Ich lerne FiveM“ mit zwei print()-Aufrufen aus.',checks:['print','print\\s*\\([^)]*\\)[\\s\\S]*print\\s*\\('],solution:'print("NyxAtheris")\nprint("Ich lerne FiveM")'};
assert.equal(check('print("Mia")\nprint("Ich lerne FiveM")',lua,['Mia','Ich lerne FiveM'],['NyxAtheris','Ich lerne FiveM']).ok,true);
assert.equal(check('print("Mia")\nprint("Falsch")',lua,['Mia','Falsch'],['NyxAtheris','Ich lerne FiveM']).ok,false);
const js={lang:'javascript',task:'Verwende Arrays und map.',checks:['const','console'],solution:'const namen=["Mia","Alex"];console.log(namen.map(x => x.toUpperCase()));'};
assert.equal(check('const namen=["Mia","Alex"];console.log(namen);',js,['MIA,ALEX'],['MIA,ALEX']).ok,false,'Missing .map rejected');
assert.equal(check('const namen=["Mia","Alex"];console.log(namen.map(x => x.toUpperCase()));',js,['MIA,ALEX'],['MIA,ALEX']).ok,true);
console.log('PASS: runtime grading checks Python assignments, Python branches, Lua personalized output and JavaScript map.');

const ownVariables={lang:'lua',task:'Lege die lokalen Variablen spielerName und level an und gib beide aus.',
 checks:['local\\s+spielerName\\s*=','local\\s+level\\s*=','print\\s*\\('],
 solution:'local spielerName = "Luca"\nlocal level = 1\nprint(spielerName, level)'};
assert.equal(check('local spielerName="Mia"\nlocal level=25\nprint(spielerName,level)',ownVariables,['Mia\t25'],['Luca\t1']).ok,true,
 'Live Lua runtime must allow own variable values');
assert.equal(check('local spielerName="Mia"\nlocal level=25\nprint("egal")',ownVariables,['egal'],['Luca\t1']).ok,false,
 'Live Lua runtime must reject hardcoded irrelevant output');

const comments={lang:'lua',task:'Schreibe einen Kommentar, der die Startmeldung erklärt.',
 checks:['--[^\\n]+','print\\s*\\('],solution:'-- Start sichtbar machen\nprint("Bereit")'};
assert.equal(check(comments.solution,comments,['Bereit'],['Bereit']).ok,true);
assert.equal(check('print("-- Bereit")',comments,['-- Bereit'],['Bereit']).ok,false);

const inlineExercise={...comments,practice_output:'text-lines',practice_line_count:1};
const inlineResult={available:true,ok:true,lines:['liverylab'],lineTypes:['string']};
assert.equal(p.evaluate('print("liverylab") -- Hilft uns beim Debuggen',inlineExercise).ok,true);
assert.equal(p.evaluateRuntime('print("liverylab") -- Hilft uns beim Debuggen',inlineExercise,inlineResult,{ok:true}).ok,true);
assert.equal(p.evaluateRuntime('print("liverylab -- kein Kommentar")',inlineExercise,inlineResult,{ok:true}).ok,false);
assert.match(p.evaluate('print("liverylab")',inlineExercise).diagnostic,/Zeilenkommentar/);

const compiledExercise={lang:'cpp',practice_output:'criteria',checks:['cout\\s*<<'],practice_lines:['^\\S.*$']};
const compiled=(source,lines)=>p.evaluateRuntime(source,compiledExercise,{available:true,ok:true,lines});
assert.equal(compiled('int main(){ std::cout << "Mein eigener Text"; }',['Mein eigener Text']).ok,true);
assert.equal(compiled('int main(){ std::cout << "Anderer Text"; }',['Anderer Text']).ok,true);
assert.equal(compiled('int main(){}',[]).ok,false);
assert.equal(compiled('int main(){ std::cout << " "; }',[' ']).ok,false);
