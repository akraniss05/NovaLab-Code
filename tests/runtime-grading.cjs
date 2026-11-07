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
