/* LiveryLab Academy 9: course-only integration suite.
 * Uses mock identities; never touches production accounts. */
const {chromium,webkit,devices}=require('playwright');
const assert=require('node:assert/strict');

const user={id:'00000000-0000-4000-a000-000000000001',email:'qa@accounts.livery-lab.app'};
const createLesson=(id,title,options,correct)=>({
 id,courseId:'lua',chapterId:'qa-ch',title,lang:'lua',level:'Anfänger',category:'Sprachen',
 goal:'Du lernst, eigene Lua-Programme zu verstehen.',theory:'Lua verarbeitet Anweisungen von oben nach unten. Du kannst Variablen, Bedingungen und Ausgaben in eigenen Projekten verwenden. Probiere die Beispiele in einer eigenen Entwicklungsumgebung.',
 example:'local name = "LiveryLab"\nprint(name)',task:'Erstelle eine eigene Ausgabe, variiere die Werte und erkläre das Ergebnis.',
 hint:'Verwende print() und Variablen.',extra:'Probiere danach eine zweite Ausgabe.',
 mistake:'Vergiss die Anführungszeichen nicht.',videoId:'9eIYmRg5ZeQ',videoStart:0,
 steps:['Beispiel lesen','Video ansehen','Aufgabe durchführen','Ergebnis dokumentieren'],
 keyPoints:['Variablen speichern Werte','Anweisungen werden ausgeführt','Teste eigene Beispiele'],
 quiz:'Was ist eine sinnvolle Ausgabe?',options,correct,resource:'https://www.lua.org/manual/5.4/',
 rubric:['Der Code ist verstanden.'],reviewPrompt:'Wo wird das in FiveM genutzt?',solution:'print("LiveryLab")',duration:25
});
const lessons=[
 createLesson('qa-lua-1','Variablen & Ausgaben',['print("Hallo")','exit()','stop()'],0),
 createLesson('qa-lua-2','Bedingungen',['print("OK")','end true','create()'],0),
 createLesson('qa-lua-3','Funktionen',['print("Done")','null()','remove()'],0)
];
const sample={courses:[
 {id:'lua',name:'Lua für FiveM',category:'Sprachen',level:'beginner',icon:'{}',color:'#a47cff',description:'Schritt für Schritt sichere Lua-Grundlagen lernen.',source:'https://www.lua.org/manual/5.4/',chapters:[{id:'qa-ch',name:'Lua-Grundlagen',level:'Anfänger',lessons}]},
 {id:'blender-fundamentals',name:'Blender 3D – Grundlagen',category:'3D & Blender',level:'beginner',icon:'◈',color:'#9776ed',description:'Einstieg in Modellierung und Licht.',source:'https://docs.blender.org/manual/en/latest/',chapters:[{id:'qa-blender-ch',name:'Grundlagen',level:'Anfänger',lessons:[{...lessons[0],id:'qa-blender-1',courseId:'blender-fundamentals',chapterId:'qa-blender-ch',title:'Objekte',lang:'text',videoId:'Ci3Has4L5W4'}]}]}
 ],roadmaps:[]};
const fixtures={academy_profiles:{id:user.id,display_name:'QA',username:'qa',active:true,role:'student',needs_password_change:false},academy_plans:{tier:'ultimate'},academy_curriculum:{payload:sample}};
function mockSdk(){
 const guest=new URLSearchParams(location.search).has('guest');
 return {auth:{
  async getSession(){return {data:{session:guest?null:{user}}}},
  onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}},
  mfa:{async getAuthenticatorAssuranceLevel(){return {data:{currentLevel:'aal1',nextLevel:'aal1'}}}},
  async signInWithPassword(){return {data:{user},error:null}}
 },from(table){const end=()=>Promise.resolve({data:fixtures[table]||null,error:null});return{select(){return this},eq(){return this},single:end,maybeSingle:end,upsert:end}},async rpc(){return {data:{allowed:true,limit:-1,remaining:-1},error:null}}};
}
const sdk='const user='+JSON.stringify(user)+';const fixtures='+JSON.stringify(fixtures)+';export const createClient='+mockSdk.toString();
async function go(page,id){
 await page.locator('#ll-menu-button').click();
 await page.locator('#ll-menu-overlay [data-go="'+id+'"]').click();
}
async function run(engine,mobile){
 const browser=await engine.launch();
 try{
  const context=await browser.newContext({...mobile&&devices['iPhone 13']});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://esm.sh/@supabase/**',route=>route.fulfill({contentType:'application/javascript',body:sdk}));
  await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Mock video</title>'}));
  await page.goto('http://127.0.0.1:8080/');
  await page.locator('.ll9-page-top h1').waitFor();
  assert.match(await page.locator('.ll9-page-top h1').textContent(),/Willkommen zurück/);
  assert.equal(await page.locator('script[src*="code-studio"]').count(),0);
  assert.equal(await page.locator('script[src*="music-v5"]').count(),0);
  assert.equal(await page.locator('script[src*="video-lab"]').count(),0);
  assert.equal(await page.locator('script[src*="studio3d"]').count(),0);
  assert.equal(await page.locator('.ll9-course-grid .ll9-course-tile').count(),2);
  await page.locator('#ll-menu-button').click();
  assert.equal(await page.locator('#ll-menu-overlay [data-go="music"]').count(),0);
  assert.equal(await page.locator('#ll-menu-overlay [data-go="videolab"]').count(),0);
  assert.equal(await page.locator('#ll-menu-overlay [data-go="editor"]').count(),0);
  await page.locator('#ll-menu-search').fill('Blender');
  assert.ok(await page.locator('#ll-menu-overlay [data-go="blender-courses"]').isVisible());
  await page.locator('#ll-menu-search').fill('');
  await page.locator('#ll-menu-overlay button[data-ll-close]').click();
  await go(page,'catalog');
  assert.equal(await page.locator('.ll9-course-grid .ll9-course-tile').count(),2);
  await page.locator('[data-ll9-filter="blender"]').click();
  assert.equal(await page.locator('.ll9-course-grid .ll9-course-tile').count(),1);
  await page.locator('[data-ll9-filter="all"]').click();
  await page.locator('[data-course="lua"]').first().click();
  await page.locator('.ll9-course-page').waitFor();
  assert.equal(await page.locator('.ll9-lesson-card').count(),3);
  assert.ok(await page.locator('.ll9-course-stats').isVisible());
  await page.locator('[data-lesson="qa-lua-1"]').first().click();
  await page.locator('.ll9-learning').waitFor();
  assert.equal(await page.locator('#lessonEditor').count(),0);
  assert.equal(await page.locator('.ll9-learn-panel').count(),6);
  await page.locator('[data-act="complete-lesson"]').click();
  assert.equal(await page.locator('.ll9-learning-tags span').last().textContent(),'Noch offen');
  await page.locator('[data-act="video-confirm"]').click();
  await page.locator('#ll9-task-notes').fill('Ich habe die Ausgaben ausprobiert und die Variablen verändert.');
  await page.locator('[data-act="task-confirm"]').click();
  await page.locator('[data-quiz-opt="0"]').click();
  assert.match(await page.locator('#quizFeedback').textContent(),/Richtig/);
  await page.locator('[data-act="complete-lesson"]').click();
  assert.match(await page.locator('.ll9-learning-tags').textContent(),/Abgeschlossen/);
  await page.locator('[data-go="course"]').first().click();
  await page.locator('[data-go="exam"]').first().click();
  await page.locator('.ll9-exam').waitFor();
  for(let i=0;i<3;i++){
   await page.locator('[data-exam-option="0"]').click();
   await page.locator('[data-act="exam-next"]').click();
  }
  assert.match(await page.locator('.ll9-exam-result h2').textContent(),/bestanden/);
  await page.locator('.ll9-exam-result [data-go="course"]').click();
  await page.locator('.ll9-course-end [data-go="reference"]').click();
  await page.locator('.ll9-reference-list').waitFor();
  assert.equal(await page.locator('.ll9-reference-item').count(),3);
  await page.locator('#ll9-reference-search').fill('Bedingungen');
  assert.equal(await page.locator('.ll9-reference-item').count(),1);
  await go(page,'profile');
  await page.locator('.ll9-profile').waitFor();
  await go(page,'settings');
  await page.locator('.ll-settings-layout').waitFor();
  assert.equal(await page.locator('[data-ll-tab="tools"]').count(),0);
  await page.locator('[data-ll-tab="account"]').click();
  await page.locator('#ll-mfa-settings').waitFor();
  if(mobile){
   assert.equal(await page.locator('.mobile-nav').evaluate(el=>getComputedStyle(el).display),'grid');
   const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.body.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().right>innerWidth+2).slice(0,10).map(el=>[el.tagName,el.className,el.getBoundingClientRect().right])}));
   assert.ok(metrics.scroll<=metrics.width+1,JSON.stringify(metrics));
  }
  assert.deepEqual(errors,[]);
  const guest=await context.newPage();
  guest.on('pageerror',e=>errors.push(e.message));
  await guest.route('https://esm.sh/@supabase/**',route=>route.fulfill({contentType:'application/javascript',body:sdk}));
  await guest.goto('http://127.0.0.1:8080/?guest=1');
  await guest.locator('.ll9-login').waitFor();
  assert.equal(await guest.locator('#loginEmail').count(),1);
  assert.equal(await guest.locator('#loginPass').count(),1);
  assert.equal(await guest.locator('#rememberLogin').count(),0);
  assert.equal(await guest.locator('[data-act="reset-password"]').count(),0);
  assert.equal(await guest.locator('.ll9-discord-btn').getAttribute('href'),'https://discord.gg/livery-lab');
  assert.equal(await guest.locator('.mobile-nav').evaluate(el=>getComputedStyle(el).display),'none');
  assert.deepEqual(errors,[]);
  console.log(mobile?'iPhone / WebKit course-only suite passed':'Desktop / Chromium course-only suite passed');
 }finally{await browser.close()}
}
Promise.allSettled([run(chromium,false),run(webkit,true)]).then(results=>{
 for(const result of results)if(result.status==='rejected'){console.error(result.reason);process.exitCode=1}
});