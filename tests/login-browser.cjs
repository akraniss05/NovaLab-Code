/* v21: full authenticated boot + Daily Streak browser E2E (not a static template test). */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('site/academy-v21.js');
const css=read('site/app-v21.css');
const logo=fs.readFileSync(path.join(root,'site/novalab-logo.webp')).toString('base64');
const banner=fs.readFileSync(path.join(root,'site/novalab-banner.webp')).toString('base64');
let html=read('site/index.html')
 .replace(/<link rel="stylesheet"[^>]*>/,'<style>'+css+'</style>')
 .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')
 .replaceAll('./novalab-logo.webp','data:image/webp;base64,'+logo)
 .replaceAll('./novalab-banner.webp','data:image/webp;base64,'+banner);
const stub=String.raw`
window.LL_CONFIG={supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'sb_publishable_mock_test'};
window.LLMFA={pending:false,async refresh(){this.pending=false},renderSettings(){}};
window.__mock={claims:0,reads:0,socialFinished:false};
const tomorrow=new Date(Date.now()+24*3600e3).toISOString();
const courses=[{id:'lua',name:'Lua für Einsteiger',category:'Programmierung',level:'beginner',icon:'Lua'}];
const lessons=[{id:'lua-01',course_id:'lua',chapter:'01 Lua Grundlagen',position:1,title:'Variablen',summary:'Werte speichern',minutes:12,required_plan:'free'}];
function reply(table) {
 if(table==='ll_courses')return {data:courses,error:null};
 if(table==='ll_lesson_index')return {data:lessons,error:null};
 if(table==='academy_profiles')return {data:{id:'test-user',role:'student',active:true,access_status:'approved',username:'tester',display_name:'Developer',needs_password_change:false},error:null};
 if(table==='academy_plans')return {data:{tier:'free'},error:null};
 if(table==='academy_progress')return {data:{payload:{done:[],watched:[],practiced:[],exams:{}}},error:null};
 return {data:[],error:null};
}
window.supabase={createClient:()=>({
 auth:{getUser:async()=>({data:{user:{id:'test-user',email:'tester@example.com'}},error:null}),signOut:async()=>({error:null})},
 from(table){return {select(){return this},eq(){return this},order(){return this},range(){return Promise.resolve(reply(table))},maybeSingle(){return Promise.resolve(reply(table))},then(resolve,reject){return Promise.resolve(reply(table)).then(resolve,reject)}}},
 rpc(name){
  if(name==='academy_streak_status'){window.__mock.reads++;return Promise.resolve({data:window.__mock.claims?{current:1,best:1,claimable:false,claimed_today:true,next_claim_at:tomorrow,server_now:new Date().toISOString()}:{current:0,best:0,claimable:true,claimed_today:false,next_claim_at:null,server_now:new Date().toISOString()},error:null});}
  if(name==='academy_streak_claim'){window.__mock.claims++;return Promise.resolve({data:{ok:true,status:{current:1,best:1,claimable:false,claimed_today:true,next_claim_at:tomorrow,server_now:new Date().toISOString()}},error:null});}
  if(name==='academy_voucher_status')return Promise.resolve({data:{tier:'free',daily_limit:3,used_today:0,remaining_today:3},error:null});
  if(name==='academy_social_media_list')return new Promise(resolve=>setTimeout(()=>{window.__mock.socialFinished=true;resolve({data:{},error:null})},4500));
  return Promise.resolve({data:{},error:null});
 }
})};
`;
const executable=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/opt/google/chrome/chrome','/usr/bin/chromium'].filter(Boolean).find(p=>fs.existsSync(p));
assert(executable,'Chrome must be installed on CI');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
for(const width of [390,430,1280]){
 const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent(html,{waitUntil:'domcontentloaded'});
 await page.addScriptTag({content:stub});
 await page.addScriptTag({content:read('site/academy-difficulty.js')});
 await page.addScriptTag({content:read('site/academy-progress-sync.js')});
 const bootStart=Date.now();
 await page.addScriptTag({content:js});
 await page.locator('#streak-overlay').waitFor({state:'visible',timeout:6000});
 await page.locator('[data-streak-claim]').waitFor({state:'visible',timeout:3000});
 const elapsed=Date.now()-bootStart;
 assert(elapsed<3500,'Daily popup appears only after slow optional social data: '+elapsed+'ms');
 assert.equal(await page.locator('[data-streak-claim]').count(),1,'Login popup must expose the real Claim button');
 assert.equal(await page.evaluate(()=>window.__mock.socialFinished),false,'Popup should render before slow social APIs finish');
 const info=await page.evaluate(()=>{
   const box=document.querySelector('.ll-streak-modal').getBoundingClientRect(),st=document.querySelector('#streak-overlay'),app=document.querySelector('#app');
   return {modal:{x:box.x,y:box.y,width:box.width,height:box.height},shown:getComputedStyle(st).display,clickable:!document.querySelector('[data-streak-claim]').disabled,inert:app.inert,bodyWidth:document.documentElement.scrollWidth};
 });
 assert(info.modal.width<=width&&info.modal.height<=844,'Popup must fit viewport: '+JSON.stringify(info));
 assert(info.modal.x>=0&&info.modal.y>=0,'Popup clipped on mobile');
 assert(info.inert,'Background should not be interactive while modal open');
 assert(info.bodyWidth<=width+2,'No horizontal scrolling');
 await page.screenshot({path:path.join(root,'test-results','daily-login-'+width+'.png')});
 await page.locator('[data-streak-claim]').click();
 await page.locator('.ll-streak-claimed').waitFor({state:'visible',timeout:6000});
 assert.equal(await page.evaluate(()=>window.__mock.claims),1,'Claim must call backend exactly once');
 assert(await page.locator('.ll-streak-modal [data-streak-countdown]').innerText()!=='00:00:00','24-hour countdown is live');
 await page.locator('[data-streak-close]').first().click();
 assert.equal(await page.locator('#streak-overlay').count(),0,'Close hides dialog');
 assert.equal(await page.evaluate(()=>document.querySelector('#app').inert),false,'Close makes the Academy interactive again');
 await page.locator('#streak-head').click();
 await page.locator('.ll-streak-claimed').waitFor({state:'visible',timeout:2000});
 assert.equal(await page.evaluate(()=>window.__mock.claims),1,'Reopening never claims again');
 assert.deepEqual(errors,[],'No browser JavaScript errors');
 console.log('PASS full login → immediate popup → one server claim → countdown → close/reopen @'+width+'px');
 await page.close();
}
}finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
