/* Real-browser bilingual UI regression: preserves user code and the original header. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
const root=path.join(__dirname,'..');
const lang=fs.readFileSync(path.join(root,'site/academy-i18n.js'),'utf8');
const css=fs.readFileSync(path.join(root,'site/academy-v31-layout.css'),'utf8');
const executable=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/opt/google/chrome/chrome','/usr/bin/chromium'].filter(Boolean).find(x=>fs.existsSync(x));
if(!executable)throw Error('Chrome is needed for browser localization tests');
const html='<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+
'<div class="app-shell"><aside class="sidebar"></aside><div class="app-column">'+
'<header class="topbar"><div class="brandbox"><button class="icon-btn mobile-only">☰</button><a class="brand" href="#home"><span>NovaLab <strong>Academy</strong></span></a></div>'+
'<div class="focus-center"><button class="focus-header" id="focus-header">◷ 25:00</button></div>'+
'<div class="top-right"><div class="ll-lang-switch" role="group" aria-label="Sprache / Language">'+
'<button type="button" class="ll-lang-btn" data-lang="de" aria-pressed="true">DE</button>'+
'<button type="button" class="ll-lang-btn" data-lang="en" aria-pressed="false">EN</button></div>'+
'<button class="header-streak-chip">🔥 4 Tage</button><button class="avatar-btn">N</button></div></header>'+
'<main class="content"><h1 id="heading">Einstellungen</h1>'+
'<nav id="menu"><button>Startseite</button><button id="learn">Lernen</button><button>Prüfung</button></nav>'+
'<p id="dynamic">Frage 1 von 3</p><p id="description">Jede Lektion gibt genau einmal 30 XP. Wiederholungen bringen keine neuen XP.</p>'+
'<input id="search" placeholder="Suchen" value="12345"><pre><code id="code">print("Lernen")</code></pre>'+
'<textarea id="draft">print("Lernen")</textarea><div data-no-translate id="userbio">Lernen und Prüfung</div>'+
'<section id="lesson"></section></main><footer><a href="#">Datenschutz</a></footer></div></div></body></html>';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const width of [390,430,1280]){
   const page=await browser.newPage({viewport:{width,height:850}});
   await page.route('https://liverylab-academy.dev/**',r=>r.fulfill({status:200,contentType:'text/html; charset=UTF-8',body:html}));
   await page.addInitScript({content:lang});
   await page.goto('https://liverylab-academy.dev/i18n-test',{waitUntil:'load'});
   await page.waitForFunction(()=>document.querySelector('#learn')?.textContent==='Lernen');
   assert.equal(await page.locator('[data-lang=de]').getAttribute('aria-pressed'),'true');
   page.on('pageerror',error=>console.error('I18N_PAGEERROR '+error.message));
   await page.locator('[data-lang=en]').click();
   const debug=await page.evaluate(()=>({present:!!window.LLI18n,locale:window.LLI18n?.language?.(),direct:window.LLI18n?.translate?.('Lernen'),displayed:document.querySelector('#learn')?.textContent,pressed:document.querySelector('[data-lang=en]')?.getAttribute('aria-pressed')}));
   console.log('I18N_CLICK_DEBUG '+JSON.stringify(debug));
   await page.waitForFunction(()=>document.querySelector('#learn')?.textContent==='Learn',{timeout:5000});
   assert.equal(await page.locator('#heading').textContent(),'Settings');
   assert.equal(await page.locator('#dynamic').textContent(),'Question 1 of 3');
   assert.match(await page.locator('#description').textContent(),/Each lesson awards 30 XP only once/);
   assert.equal(await page.locator('#search').getAttribute('placeholder'),'Search');
   assert.equal(await page.locator('#code').textContent(),'print("Lernen")','Never modify code samples');
   assert.equal(await page.locator('#draft').inputValue(),'print("Lernen")','Never modify saved code');
   assert.equal(await page.locator('#userbio').textContent(),'Lernen und Prüfung','Never modify member-provided text');
   assert.equal(await page.locator('html').getAttribute('lang'),'en','Document language updated');
   assert.equal(await page.locator('[data-lang=en]').getAttribute('aria-pressed'),'true');
   await page.evaluate(()=>{document.querySelector('#lesson').innerHTML='<h2>Verstehen</h2><p>Deine Aufgabe:</p><button>Tipp</button>';});
   await page.waitForFunction(()=>document.querySelector('#lesson h2')?.textContent==='Understand');
   assert.equal(await page.locator('#lesson button').textContent(),'Hint','Dynamically created lesson controls translate');
   await page.locator('[data-lang=de]').click();
   await page.waitForFunction(()=>document.querySelector('#learn')?.textContent==='Lernen');
   assert.equal(await page.locator('#heading').textContent(),'Einstellungen');
   assert.equal(await page.locator('#dynamic').textContent(),'Frage 1 von 3');
   assert.equal(await page.locator('[data-lang=en]').getAttribute('aria-pressed'),'false');
   await page.locator('[data-lang=en]').click();
   await page.waitForFunction(()=>document.querySelector('#learn')?.textContent==='Learn');
   await page.reload({waitUntil:'load'});
   await page.waitForFunction(()=>document.querySelector('#learn')?.textContent==='Learn');
   assert.equal(await page.locator('[data-lang=en]').getAttribute('aria-pressed'),'true','Locale persists across reloads');
   assert.equal(await page.locator('[data-lang=de]').isVisible(),true);
   assert.equal(await page.locator('[data-lang=en]').isVisible(),true);
   const geometry=await page.evaluate(()=>{
    const header=document.querySelector('.topbar'),btn=document.querySelector('.ll-lang-switch');
    const rect=btn.getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      headerHeight:header.getBoundingClientRect().height,
      buttonsHeight:rect.height,
      clipped:rect.left<0||rect.right>innerWidth};
   });
   assert.ok(geometry.overflow<=2,'Language buttons must not cause horizontal scrolling at '+width+'px: '+JSON.stringify(geometry));
   assert.ok(geometry.headerHeight<=78,'Header must stay one row at '+width+'px: '+JSON.stringify(geometry));
   assert.ok(!geometry.clipped,'Language switch must be visible at '+width+'px: '+JSON.stringify(geometry));
   console.log('PASS: '+width+'px DE/EN persistence, translations, editor privacy, live navigation and header geometry');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
