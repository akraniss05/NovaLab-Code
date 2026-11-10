/* Academy v1.5: difficulty rating contract and bilingual display. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=fs.readFileSync(path.join(__dirname,'../site/academy-difficulty.js'),'utf8');
const window={LLI18n:{language:()=> 'de'}};
vm.runInNewContext(file,{window},{filename:'academy-difficulty.js'});
const d=window.LLDifficulty,ids=Object.keys(d.ratings);
assert.equal(ids.length,52,'All 52 courses need a difficulty');
assert.equal(new Set(ids).size,52);
assert(Object.values(d.ratings).every(n=>Number.isInteger(n)&&n>=1&&n<=5));
assert.equal(d.score({id:'html'}),1);
assert.equal(d.score({id:'lua'}),2);
assert.equal(d.score({id:'javascript'}),3);
assert.equal(d.score({id:'rust'}),5);
assert.equal(d.score({id:'rust',difficulty:2}),2,'Database rating overrides defaults');
assert.equal(d.label({id:'cpp'}),'Sehr schwer');
assert.match(d.badge({id:'rust'}),/Schwierigkeit: <strong>Sehr schwer<\/strong>/);
assert.match(d.badge({id:'html'}),/data-difficulty="1"/);
assert.match(d.badge({id:'rust'}),/5\/5/);
window.LLI18n.language=()=> 'en';
assert.equal(d.label({id:'rust'}),'Very hard');
assert.match(d.badge({id:'lua'}),/Difficulty: <strong>Easy<\/strong>/);
const js=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
for(const token of ['difficultyBadge(c)','difficultyBadge(course)','difficultyBadge(nextCourse)',"api.from('ll_courses').select('id,name,category,level,icon,source_url,difficulty')"])
 assert(js.includes(token),'missing difficulty feature: '+token);
for(const page of ['index.html','v21.html','v31.html']){
 const html=fs.readFileSync(path.join(__dirname,'../site/'+page),'utf8');
 assert(html.includes('academy-difficulty.js?build=20261108v55'),page+' missing difficulty script');
 assert(html.indexOf('academy-difficulty.js?build=')<html.indexOf('academy-v21.js?build='),page+' wrong script order');
}
assert.match(d.levelDescription(1),/Perfect for beginners/);
assert.match(d.searchTerms({id:'rust'}),/5\/5/);
assert.match(d.searchTerms({id:'python'}),/Leicht/);
for(const name of ['index.html','v21.html','v31.html']){
 const html=fs.readFileSync(path.join(__dirname,'../site/'+name),'utf8');
 assert(html.includes('academy-difficulty.js?build=20261108v55'),name+' chart module cache key');
 assert.match(html,/academy-v21\.js\?build=20261109(?:v74|-control1)/,name+' app script cache key');
}
console.log('Difficulty: all 52 courses, descriptions, DE/EN labels and chart search terms verified.');
