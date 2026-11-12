/* NovaLab v74: real expiry countdown and banner without side gutters. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const src=read('site/academy-v21.js');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(src,footer);
const nodes=[{textContent:'',classList:{toggle(){}}},{textContent:'',classList:{toggle(){}}}];
const doc={querySelector(){return null},querySelectorAll(selector){return selector==='[data-own-plan-clock]'?nodes:[]},addEventListener(){},body:{classList:{toggle(){}}}};
const sandbox={window:{LL_CONFIG:{},addEventListener(){}},document:doc,location:{hash:'#profile'},localStorage:{getItem(){return null}},Date,Intl,console,Math,Map,Set};
vm.createContext(sandbox);
vm.runInContext(src.replace(footer,
 "\nwindow.__subTest={s,membershipRemainingText,membershipExpiryText,ownPlanCountdownHtml,updateMembershipClocks};\n})();"),sandbox);
const a=sandbox.window.__subTest,s=a.s;
function remaining(offset){return a.membershipRemainingText('pro',new Date(Date.now()+offset*1000).toISOString())}
assert.equal(remaining(2*86400+3*3600+4*60+5),'2 Tage · 03 Std. · 04 Min. · 05 Sek.');
assert.equal(remaining(61),'0 Tage · 00 Std. · 01 Min. · 01 Sek.');
assert.equal(a.membershipRemainingText('ultimate',new Date(Date.now()-1000).toISOString()),'Abgelaufen');
assert.equal(a.membershipRemainingText('max',null),'Unbefristet · kein Ablaufdatum');
assert.match(a.membershipRemainingText('free',null),/Free/);
assert.match(a.membershipExpiryText('pro',new Date(Date.now()+10000).toISOString()),/Endet am /);
s.ready=true;s.shopEnabled=true;s.tier='pro';s.planExpires=new Date(Date.now()+60000).toISOString();s.profile={role:'student'};
const html=a.ownPlanCountdownHtml();
assert.match(html,/data-own-plan-clock/);
assert.match(html,/role="timer"/);
assert.match(html,/Verbleibende Laufzeit/);
assert.match(html,/Plus/);
assert.match(html,/Tarife ansehen/);
s.shopEnabled=false;
assert.equal(a.ownPlanCountdownHtml(),'','Disabled shop must not show subscription countdown');
s.shopEnabled=true;
a.updateMembershipClocks();
assert.equal(nodes[0].textContent,a.membershipRemainingText('pro',s.planExpires));
assert.equal(nodes[1].textContent,nodes[0].textContent);
s.tier='max';s.planExpires=null;a.updateMembershipClocks();
assert.equal(nodes[0].textContent,'Unbefristet · kein Ablaufdatum');
for(const match of ['+ownPlanCountdownHtml()+','dailyStrip()+ownPlanCountdownHtml()+selector+']){
 assert(src.includes(match),'Countdown must appear in app screens: '+match);
}
const css=read('site/academy-atelier.css');
assert(css.includes('NovaLab v74'),'new banner override missing');
assert(css.includes('.ll-home-dashboard .ll-home-brand-banner>img'));
assert(css.includes('object-fit:cover!important'),'cover must override old contain rule');
assert(css.includes('aspect-ratio:16 / 9!important'),'mobile banner must have original image ratio');
assert(css.includes('.ll-own-plan-status'),'responsive plan status card missing');
console.log('PASS NovaLab banner cover, exact days/hours/minutes/seconds, expiry and perpetual/free fallback.');
