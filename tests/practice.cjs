const assert=require('node:assert/strict');
const {LLPractice:p}=require('../site/practice-engine.js');
const task={lang:'lua',solution:'print("Hello Livery-Lab")',checks:['print']};
assert.equal(p.evaluate('print("Hello Livery-Lab")',task).ok,true);
assert.equal(p.evaluate("print('Hello Livery-Lab')",task).ok,true,'Equivalent quoting should pass');
assert.equal(p.evaluate('print("falsch")',task).ok,false,'Wrong output must fail');
assert.equal(p.evaluate('print("Hello Livery-Lab',task).ok,false,'Unclosed quote must fail');
assert.equal(p.evaluate('x = "Hello Livery-Lab"',task).ok,false,'No print must fail');
assert.equal(p.evaluate('print(hello)',task).ok,false,'Undefined variable must fail');
assert.equal(p.evaluate('console.log("ok")',{lang:'javascript',solution:'console.log("ok")',checks:['console']}).ok,true);
assert.equal(p.evaluate('console.log("ok"',{lang:'javascript',solution:'console.log("ok")'}).ok,false);
assert.equal(p.evaluate('nothing',{lang:'python',solution:'print("ok")'}).ok,false);
const types={lang:'lua',task:'Erstelle preis (number), aktiv (boolean) und titel (string). Gib alle drei Datentypen mit type() aus.',checks:['local\\s+preis','local\\s+aktiv','local\\s+titel','type\\s*\\('],solution:'local preis = 500\nlocal aktiv = true\nlocal titel = "LiveryLab"\nprint(type(preis), type(aktiv), type(titel))'};
assert.match(p.evaluate('number = 10\nboolean = true\nstring = "text"',types).diagnostic,/lokale Variable „preis“/);
assert.equal(p.evaluate('local preis = 10\nlocal aktiv = true\nlocal titel = "text"\nprint(type(preis),type(aktiv),type(titel))',types).ok,true,'Equivalent values and correct types must pass');
assert.equal(p.evaluate('local preis = "10"\nlocal aktiv = true\nlocal titel = "text"\nprint(type(preis),type(aktiv),type(titel))',types).ok,false,'Wrong variable type must fail');
assert.equal(p.evaluate('-- local preis\n-- local aktiv\n-- local titel\nprint("number", "boolean", "string")',types).ok,false,'Commented requirements must not count');
assert.equal(p.evaluate('local preis = 10\nlocal aktiv = true\nlocal titel = "text"\nprint(type(preis),type(aktiv),type(unknown))',types).ok,false,'Undefined variable must fail');
const twoPrints={lang:'lua',task:'Gib deinen eigenen Namen und danach „Ich lerne FiveM“ mit zwei print()-Aufrufen aus.',checks:['print\\s*\\(','print\\s*\\([^)]*\\)[\\s\\S]*print\\s*\\('],solution:'print("NyxAtheris")\nprint("Ich lerne FiveM")'};
assert.equal(p.evaluate('print("Luca")\nprint("Ich lerne FiveM")',twoPrints).ok,true,'Own name is valid');
assert.equal(p.evaluate('print("Luca")\nprint("Ich lerne etwas anderes")',twoPrints).ok,false);
console.log('Practice evaluator rejects wrong answers and accepts equivalent simple output.');

// Free values are valid when the task explicitly asks for self-chosen inputs.
const variables={lang:'lua',task:'Lege die lokalen Variablen spielerName und level an und gib beide aus.',
 checks:['local\\s+spielerName\\s*=','local\\s+level\\s*=','print\\s*\\('],
 solution:'local spielerName = "Luca"\nlocal level = 1\nprint(spielerName, level)'};
assert.equal(p.evaluate('local spielerName = "Mia"\nlocal level = 25\nprint(spielerName, level)',variables).ok,true,'Personal Lua variable values must pass');
assert.equal(p.evaluate('local spielerName = "Mia"\nlocal level = "hoch"\nprint(spielerName, level)',variables).ok,false,'Wrong value types must still fail');
assert.equal(p.evaluate('local spielerName = "Mia"\nlocal level = 25\nprint("egal")',variables).ok,false,'Hard-coded output must not bypass learning variables');
assert.equal(p.evaluate('print("Anderes")',{lang:'lua',solution:'print("Vorgabe")',checks:['print']}).ok,false,'Fixed output stays fixed');

const htmlDocument={lang:'html',checks:[],solution:'<!doctype html><html lang="de"><body><h1>Titel</h1></body></html>'};
assert.equal(p.evaluate('<html lang="de"><body><h1>Titel</h1></body></html>',htmlDocument).ok,false);
assert.equal(p.evaluate('<!doctype html><html><body><h1>Titel</h1></body></html>',htmlDocument).ok,false);
assert.equal(p.evaluate('<!DOCTYPE html><html lang="en"><body><h1>Title</h1></body></html>',htmlDocument).ok,true);
