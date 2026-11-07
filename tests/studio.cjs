/* LiveryLab Studio smoke checks · no credentials or network required */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..','site');
const events={};
const doc={
 addEventListener(type,fn){events[type]=fn},
 querySelector(){return null},
 body:{dataset:{},classList:{toggle(){}}},
 documentElement:{style:{setProperty(){}}}
};
const window={};
const box={window,document:doc,console,URL,Blob,Promise,Set,Map,Array,Object,Math,Date,String,Number,RegExp};
vm.runInNewContext(fs.readFileSync(path.join(root,'academy-studio.js'),'utf8'),box,{filename:'academy-studio.js'});
assert.ok(window.LLStudio,'Studio module loads');
const fixture={
 ready:true,user:{id:'test-user'},profile:{display_name:'Developer'},
 courses:[{id:'lua',name:'Lua',category:'Sprachen'}],
 lessons:[
 {id:'lua-1',course_id:'lua',position:1,title:'Dein erster Lua-Befehl'},
 {id:'lua-2',course_id:'lua',position:2,title:'Variablen'}
 ],
 progress:{done:['lua-1'],lastLesson:{id:'lua-2'}}
};
window.LLStudio.connect({state:()=>fixture,client:()=>null,notice:()=>{},go:()=>{},render:()=>{}});
assert.equal(window.LLStudio.level().xp,30);
assert.equal(window.LLStudio.level().next,470);
assert.ok(window.LLStudio.levelPage().includes('Aktivieren')===false || window.LLStudio.levelPage().includes('Level'));
assert.match(window.LLStudio.levelPage(),/DEIN NÄCHSTER MEILENSTEIN/);
assert.match(window.LLStudio.homeSection(),/Portfolio/);
assert.match(window.LLStudio.portfolioPage(),/studio-project-form/);
assert.match(window.LLStudio.skilltreePage(),/Variablen/);
assert.match(window.LLStudio.lessonAddon(fixture.lessons[1],fixture.courses[0],{steps:['Vorbereitung','Übung']}),/studio-lesson-note/);
assert.match(window.LLStudio.settingsSection(),/fontSize/);
fixture.progress.done.push('lua-2');
assert.equal(window.LLStudio.level().xp,60);
vm.runInNewContext(fs.readFileSync(path.join(root,'academy-runtime.js'),'utf8'),box,{filename:'academy-runtime.js'});
assert.ok(window.LLRuntime.supported.includes('lua'));
assert.ok(window.LLRuntime.supported.includes('javascript'));
window.LLRuntime.run('print("Hallo")','python').then(result=>{
 assert.equal(result.available,false);
 assert.equal(result.lines.length,0,'Unsupported output is never faked');
 console.log('Studio: routes, level rewards, portfolio, skilltree, notes, settings, and runtime fallback verified.');
}).catch(error=>{console.error(error);process.exitCode=1});
