/* NovaLab audit regressions: code grading, hidden shop, studio wiring and quiz proof. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const {LLPractice:grader}=require('../site/practice-engine.js');
const html={lang:'html',solution:'<!doctype html><html><body><h1>LiveryLab</h1></body></html>',checks:[]};
assert.equal(grader.evaluate('<!doctype html><html><body><h1>NovaLab</h1></body></html>',html).ok,true,'Valid customized HTML must pass');
assert.equal(grader.evaluate('<p>No structure</p>',html).ok,false,'Missing required HTML tags must fail');
assert.equal(grader.evaluate('<!-- <html><body><h1>fake</h1></body></html> -->',html).ok,false,'HTML comments cannot forge required elements');
assert.equal(grader.evaluate('<html><body><h1>Wrong nesting</body></h1></html>',html).ok,false,'Mismatched HTML nesting must fail');
const css={lang:'css',solution:'.card { color: red; }',checks:[]};
assert.equal(grader.evaluate('.card { color: blue; }',css).ok,true,'Custom CSS values must pass a structural check');
assert.equal(grader.evaluate('.card { color blue; }',css).ok,false,'Malformed CSS declarations must not pass');
assert.equal(grader.evaluate('.other { color: blue; }',css).ok,false,'Wrong CSS selector must fail');
const noOutput=(code)=>grader.evaluateRuntime(code,{lang:'javascript',solution:'const amount=2;',checks:[]},{available:true,ok:true,lines:[]},{available:true,ok:true,lines:[]});
assert.equal(noOutput('const amount=999;').ok,false,'Unobservable changed code must never be blindly accepted');
assert.equal(noOutput('const amount=2;').ok,true,'Identical zero-output reference remains valid');
const main=read('site/academy-v21.js'),index=read('site/index.html'),sync=read('site/academy-learning-sync.js');
assert.match(index,/academy-studio\.js/,'Studio module must actually load');
assert.match(index,/academy-studio\.css/,'Studio styles must actually load');
for(const route of ['portfolio','skilltree','notes','challenges','calendar','level']){
 assert(main.includes(route+':()=>window.LLStudio?.'),'Studio route not linked: '+route);
}
assert.match(main,/academy_verify_lesson_quiz/,'Lesson completion must verify quiz server-side');
assert.match(main,/id="practice-preview-frame"[^\n]*sandbox=""/,'Markup preview must use opaque-origin script-free sandbox');
assert.match(main,/frame\.srcdoc=htmlCssPreview\(input\.value,lang\)/,'Markup editor changes must update preview');
assert.match(read('site/academy-v31-layout.css'),/\.ll-practice-preview-frame/,'Preview needs responsive styling');
assert.match(main,/supportEditorHasDraft/,'Poller must preserve unfinished support messages');
assert.match(main,/s\.shopEnabled\?homeShortcut/,'Disabled shop must not leave dashboard shortcut');
assert.match(sync,/for\(const id of records\.keys\(\)\)/,'Visibility listener uses defined map');
assert.doesNotMatch(sync,/timers\.keys\(\)/,'Undefined timers variable must not recur');
console.log('PASS: Academy audit regressions - markup, unobservable JS, studio wiring, hidden shop and quiz proof.');
