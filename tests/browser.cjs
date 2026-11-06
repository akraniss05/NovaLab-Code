// Run from the repository root with the site served on 127.0.0.1:8080.
// Fixtures intercept only in this browser context. Production accounts are never used by CI.
const { chromium, webkit, devices } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const user = {id:'00000000-0000-4000-a000-000000000001',email:'student@example.invalid'};
const lesson = {id:'qa-lesson',courseId:'qa',chapterId:'qa-ch',title:'Arrays',lang:'javascript',level:'beginner',options:['A','B'],correct:0,steps:[],keyPoints:[],starter:'console.log(42)',rubric:[]};
const course = {id:'qa',name:'JavaScript',category:'Sprachen',level:'beginner',chapters:[{id:'qa-ch',name:'Grundlagen',lessons:[lesson]}]};
const fixtures = {
  academy_profiles:{id:user.id,display_name:'QA',active:true,role:'student'},
  academy_plans:{tier:'ultimate'},
  academy_curriculum:{payload:{courses:[course],roadmaps:[{id:'coding',name:'Coding',stages:[{title:'Grundlagen',courseIds:['qa']}]}]}},
};
function mockSdk() {
  return {auth:{
    async getSession(){return {data:{session:{user}}}},
    onAuthStateChange(){},
    mfa:{async getAuthenticatorAssuranceLevel(){return {data:{currentLevel:'aal1',nextLevel:'aal1'}}}},
  },from(table){
    const end=()=>Promise.resolve({data:fixtures[table]||null});
    return {select(){return this},eq(){return this},single:end,maybeSingle:end,upsert:end};
  },async rpc(){return {data:{allowed:true,remaining:-1}}}};
}
const sdk = 'const user='+JSON.stringify(user)+';const fixtures='+JSON.stringify(fixtures)+';export const createClient='+mockSdk.toString();
async function checkDownload(page,selector,magic){
  console.log('Checking download',selector);
  const pending=page.waitForEvent('download',{timeout:30000});
  await page.locator(selector).click();
  const file=await pending.catch(async err=>{console.error(await page.locator('#llv-status,#llm-status,#ll3-status,#llideOutput').allTextContents());throw err});
  const bytes=await fs.readFile(await file.path());
  assert.ok(bytes.length>32,file.suggestedFilename());
  if(magic)assert.equal(bytes.subarray(0,magic.length).toString(),magic);
}
async function run(engine,mobile){
  const browser=await engine.launch(mobile?{}:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const context=await browser.newContext({...mobile&&devices['iPhone 13']});
    const page=await context.newPage();page.setDefaultTimeout(12000);
    const errors=[];page.on('pageerror',err=>{errors.push(err.message);console.error(err.stack)});
    page.on('dialog',dialog=>dialog.accept());
    await page.route('https://esm.sh/@supabase/**',route=>route.fulfill({contentType:'application/javascript',body:sdk}));
    // Serve pinned upstream packages locally so CDN outages do not affect this test.
    await page.route('https://cdn.jsdelivr.net/npm/**',async route=>{
      const name=new URL(route.request().url()).pathname.replace('/npm/','').replace(/@[^/]+\//,'/');
      const file=name.startsWith('codemirror/')?name.replace('.min.','.'):name;
      await route.fulfill({path:require.resolve(file)});
    });
    const three=path.resolve(path.dirname(require.resolve('three')), '..');
    await page.route('https://esm.sh/three@0.180.0**',async route=>{
      const target=new URL(route.request().url()).pathname.replace('/three@0.180.0','');
      await route.fulfill({path:path.join(three,target||'build/three.module.js'),contentType:'application/javascript'});
    });
    await page.route('https://esm.sh/three.core.js',route=>route.fulfill({path:path.join(three,'build/three.core.js'),contentType:'application/javascript'}));
    await page.goto('http://127.0.0.1:8080/');
    const go=async id=>{
      console.log('Checking route',id);
      await page.locator('#ll-menu-button').click();
      await page.locator('#ll-menu-overlay [data-go="'+id+'"]').click();
    };
    await page.locator('.v5-mainhero').waitFor();
    await page.locator('.ll8-page-title').waitFor();
    await page.locator('.ll8-brand-banner img').waitFor();
    await page.waitForFunction(()=>{const hero=document.querySelector('.ll8-brand-banner img'),logo=document.querySelector('.topbar .ll8-logo img');return hero?.complete&&hero.naturalWidth>=400&&logo?.complete&&logo.naturalWidth>100});
    assert.equal(await page.locator('.ll8-page-title h1').textContent(),'Dashboard');
    await page.locator('#ll-menu-button').click();
    assert.equal(await page.locator('#ll-menu-overlay .ll8-menu-wordmark').count(),1);
    assert.ok(await page.locator('#ll-menu-overlay .ll7-menu-items svg').count()>=10);
    await page.locator('#ll-menu-search').fill('Designer');
    assert.ok(await page.locator('#ll-menu-overlay [data-go="studio3d"]').isVisible());
    assert.equal(await page.locator('#ll-menu-overlay [data-go="editor"]').isVisible(),false);
    await page.locator('#ll-menu-search').fill('');
    await page.locator('#ll-menu-overlay button[data-ll-close]').click();
    await go('settings');await page.locator('[data-ll-theme="carbon"]:is(button)').click();
    assert.equal(await page.locator('html').getAttribute('data-ll-theme'),'carbon');
    await page.locator('[data-ll-reset]').click();
    await page.locator('[data-ll-tab="account"]').click();
    await page.locator('#ll-mfa-settings').waitFor();
    await go('profile');await page.locator('[data-act="customize-profile"]').click();
    await page.locator('button[data-ll-avatar]').first().click();
    await go('roadmaps');await page.locator('[data-roadmap]').first().click();
    await go('friends');await page.locator('.llsocial-page').waitFor();
    await go('videos');
    await go('catalog');await page.locator('[data-course="qa"]').first().click();
    const chapter=page.locator('[data-chapter="qa-ch"]');await chapter.click();
    assert.equal(await chapter.getAttribute('aria-expanded'),'false');await chapter.click();
    await page.locator('[data-lesson="qa-lesson"]').first().click();
    await page.locator('[data-quiz-opt="0"]').click();await page.locator('[data-act="bookmark"]').click();
    await page.locator('[data-act="run-lesson"]').click();
    await page.waitForFunction(()=>document.querySelector('#lessonOutput').textContent.includes('42'));
    await page.locator('[data-act="show-solution"]').click();
    await go('practice');
    for(const game of ['memory','pong','snake']){
      await page.locator('[data-game="'+game+'"]').click();await page.locator('#llg-restart').click();
      if(game==='memory')await page.locator('[data-memory="0"]').click();
      else await page.keyboard.press('ArrowLeft');
      await page.locator('#llg-back').click();
    }
    await go('editor');await page.locator('.llws-code .llws-top').waitFor();
    assert.equal(await page.locator('.llws-code [data-llws-code]').count(),6);
    await page.locator('[data-ide="run"]').click();
    await page.waitForFunction(()=>document.querySelector('#llideOutput').textContent.includes('Willkommen bei'));
    await page.locator('#llideProject').selectOption('p-js');
    await page.locator('.CodeMirror').waitFor();await page.locator('[data-ide="wrap"]').click();
    await page.locator('[data-ide="run"]').click();await page.waitForFunction(()=>document.querySelector('#llideOutput').textContent.includes('Hallo Alex'));
    await checkDownload(page,'[data-ide="download"]','PK');
    await go('music');await page.locator('[data-step]').first().click();
    await page.locator('#llm-play').click();await page.locator('#llm-play').click();
    await page.locator('[data-music5="tap"]').click();await page.locator('[data-music5="save"]').click();
    await checkDownload(page,'[data-music5="export"]','RIFF');
    await go('studio3d');await page.locator('.llws-design .llws-top').waitFor();
    await page.locator('#ll3-canvas canvas').waitFor();
    await page.locator('[data-llws-design="grid"]').click();
    await page.locator('[data-three="add"]').click();await page.locator('[data-three="camera"]').click();
    await checkDownload(page,'[data-three="json"]');await checkDownload(page,'[data-three="export"]','glTF');
    await go('videolab');await page.locator('.llws-video .llws-top').waitFor();
    await page.locator('#llv-import').setInputFiles(mobile?process.env.QA_CLIP:process.env.QA_CLIP.replace('.mp4','.webm'));
    await page.waitForFunction(()=>document.querySelector('#llv-status').textContent.includes('Clip geladen')).catch(async err=>{console.error(await page.locator('#llv-status').textContent());throw err});
    await page.locator('#llv-text').fill('Academy QA');
    await page.locator('#llv-preview').click();await page.locator('#llv-play').click();
    await page.locator('#llws-speed').selectOption('1.5');
    assert.equal(await page.locator('#llws-speed').inputValue(),'1.5');
    await page.locator('#llws-speed').selectOption('1');
    if(await page.evaluate(()=>!!window.MediaRecorder&&!!HTMLCanvasElement.prototype.captureStream)){
      await checkDownload(page,'#llv-export');
    }
    if(mobile){
      await page.locator('#ll-menu-button').click();
      const drawerWidth=await page.locator('.ll-menu-sheet').evaluate(el=>el.getBoundingClientRect().width);
      assert.ok(drawerWidth>=200&&drawerWidth<=260,'Drawer too wide or narrow: '+drawerWidth);
      await page.locator('#ll-menu-overlay button[data-ll-close]').click();
      assert.equal(await page.locator('.mobile-nav').evaluate(el=>getComputedStyle(el).display),'none');
      const layout=await page.evaluate(()=>({
        width:innerWidth,scroll:document.documentElement.scrollWidth,
        overflow:[...document.body.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().right>innerWidth+1)
          .map(el=>[el.tagName,el.id,el.className,Math.round(el.getBoundingClientRect().right)]).slice(0,15),
      }));
      assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));
    }
    assert.deepEqual(errors,[]);
    console.log(mobile?'iPhone / WebKit passed':'Desktop / Chromium passed');
  }finally{await browser.close()}
}
Promise.allSettled([run(chromium,false),run(webkit,true)]).then(results=>{
  for(const result of results)if(result.status==='rejected'){console.error(result.reason);process.exitCode=1}
});
