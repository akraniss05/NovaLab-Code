/* LiveryLab Academy v48 · browser integration for optional UX effects.
 * Tests mobile header layout, mute-by-default, volume, reduced motion,
 * theme backgrounds and pointer interaction without real speakers.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
const root=path.join(__dirname,'..');
const script=fs.readFileSync(path.join(root,'site/academy-effects.js'),'utf8');
const css=fs.readFileSync(path.join(root,'site/academy-effects.css'),'utf8');
const exec=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/opt/google/chrome/chrome','/usr/bin/chromium'].filter(Boolean).find(x=>fs.existsSync(x));
if(!exec)throw Error('Chrome required for effects tests');
const html='<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+
 '<div class="app-shell"><header class="topbar" style="display:flex;justify-content:space-between;align-items:center;height:66px;max-width:100%;padding:0 12px;">'+
 '<span>LiveryLab Academy</span><button id="timer" style="height:35px">25:00</button>'+
 '<span><button>DE</button><button>EN</button></span></header>'+
 '<main class="content"><button class="btn primary" id="tap" style="padding:13px 18px">Continue learning</button>'+
 '<button id="disabled" disabled>Disabled</button>'+
 '<div class="settings"><label for="ll-sound-volume">Click sound volume</label>'+
 '<input data-sound-volume id="ll-sound-volume" type="range" min="0" max="100" step="5" value="25">'+
 '<output data-sound-volume-label>25%</output></div></main></div></body></html>';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:exec,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const width of [390,430,1280]){
   const page=await browser.newPage({viewport:{width,height:800}});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('https://liverylab-academy.dev/**',route=>route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}));
   await page.goto('https://liverylab-academy.dev/ux-test',{waitUntil:'load'});
   await page.evaluate(()=>{
    window.__plays=0;
    window.AudioContext=class{
      state='running';currentTime=0;destination={};
      createOscillator(){return {type:'sine',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){window.__plays++},stop(){},disconnect(){},onended:null};}
      createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
    };
   });
   await page.addScriptTag({content:script});
   const start=await page.evaluate(()=>({hasEffects:!!window.LLEffects,
     ambient:document.body.classList.contains('ll-effects-ambient'),
     buttons:document.body.classList.contains('ll-effects-buttons'),
     muted:window.LLEffects.read('uiSounds')===false,
     active:document.querySelector('#ll-ambient-layer')?.getAttribute('aria-hidden'),
     overlay:document.querySelector('#ll-click-overlay')?.style.pointerEvents,
     volume:window.LLEffects.volume()}));
   assert.equal(start.hasEffects,true,'UX effects JS loaded');
   assert.equal(start.ambient,true,'Animation enabled by default');
   assert.equal(start.buttons,true,'Tap effects enabled by default');
   assert.equal(start.muted,true,'Audio defaults to OFF');
   assert.equal(start.active,'true','Ambient is screenreader-hidden');
   assert.equal(start.volume,25,'Volume default remains low');
   await page.locator('#tap').click();
   assert.equal(await page.evaluate(()=>window.__plays),0,'No unsolicited audio');
   await page.evaluate(()=>{localStorage.setItem('liverylab-pref-uiSounds','1');window.LLEffects.sync();});
   await page.locator('#tap').click();
   assert.equal(await page.evaluate(()=>window.__plays),1,'Enabled audio plays once after user gesture');
   await page.evaluate(()=>{const input=document.querySelector('[data-sound-volume]');input.value='60';input.dispatchEvent(new Event('input',{bubbles:true}));});
   assert.equal(await page.locator('[data-sound-volume-label]').textContent(),'60%');
   assert.equal(await page.evaluate(()=>localStorage.getItem('liverylab-choice-soundVolume')),'60');
   await page.evaluate(()=>{localStorage.setItem('liverylab-pref-buttonEffects','0');window.LLEffects.sync();});
   assert.equal(await page.evaluate(()=>document.body.classList.contains('ll-effects-buttons')),false);
   assert.equal(await page.evaluate(()=>window.LLEffects.impact(50,50)),false,'Taps disabled from preference');
   await page.evaluate(()=>{localStorage.setItem('liverylab-pref-buttonEffects','1');window.LLEffects.sync();});
   assert.equal(await page.evaluate(()=>window.LLEffects.impact(50,50)),true,'Tap halo can render when enabled');
   assert.ok((await page.locator('.ll-tap-halo').count())>=1,'Tap halo draws as an overlay (earlier click halos can still be fading)');
   await page.evaluate(()=>{localStorage.setItem('liverylab-pref-motion','1');window.LLEffects.sync();});
   assert.equal(await page.evaluate(()=>window.LLEffects.impact(50,50)),false,'Reduced motion blocks halos');
   assert.equal(await page.evaluate(()=>document.body.classList.contains('ll-effects-ambient')),false,'Reduced motion stops background animation');
   const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
     button:document.querySelector('#tap').getBoundingClientRect().width,
     timerVisible:document.querySelector('#timer').getBoundingClientRect().width>0}));
   assert.ok(geometry.overflow<=2,'No horizontal scroll on '+width+'px');
   assert.ok(geometry.timerVisible,'Focus timer remains visible');
   assert.ok(geometry.button>0,'Main buttons remain available');
   assert.deepEqual(errors,[],'No uncaught browser errors');
   console.log('PASS: '+width+'px ambient, muted audio, user-gesture sound, volume, tap effect, reduced-motion.');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
