// Requires Playwright and a running Control API. API responses are fixtures.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import {defaults} from '../packages/shared/domain.ts';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),headless:true,args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--single-process','--no-zygote']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});let revision=1,puts=[];const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',async route=>{const url=new URL(route.request().url());let body;
if(url.pathname==='/api/session')body={user:'123456789012345678',profile:{username:'QA',avatar:null}};
else if(route.request().method()==='PUT'){puts.push(route.request().postDataJSON());body={ok:true};}
else body={revision,config:defaults,roles:[],channels:[],tickets:[],applications:[],activity:[],name:'NovaLab QA',members:12,online:4};
await route.fulfill({json:body});});
await page.clock.install();
await page.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:39173')+'/dashboard?guild=123456789012345678');
await page.getByRole('heading',{name:'NovaLab QA'}).waitFor();
for(const name of ['Tickets','Bewerbungen','Panel-Designer','Willkommen & Abschied','Rollen & Verifizierung','Teamverwaltung','Sicherheit','Logs & Aktivität','Website-Integration']){
await page.locator('.sidebar').getByRole('button',{name,exact:true}).click();await page.getByRole('heading',{name,exact:true}).waitFor();assert(await page.locator('.card').count()>0,name);}
await page.locator('.sidebar').getByRole('button',{name:'Willkommen & Abschied',exact:true}).click();
await page.locator('textarea').first().fill('Eigener Entwurf');
assert.equal(await page.getByRole('button',{name:'Einstellungen speichern'}).isEnabled(),true);
revision=2;await page.clock.runFor(20100);
await page.getByRole('button',{name:'Aktuelle Version laden'}).waitFor();
assert.equal(await page.getByRole('button',{name:'Einstellungen speichern'}).isEnabled(),false);
assert.equal(await page.locator('textarea').first().inputValue(),'Eigener Entwurf');assert.equal(puts.length,0);
page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Aktuelle Version laden'}).click();
await page.getByRole('button',{name:'Aktuelle Version laden'}).waitFor({state:'hidden'});
await page.locator('textarea').first().fill('Geprüfter Entwurf');await page.getByRole('button',{name:'Einstellungen speichern'}).click();
await page.getByText('Gespeichert',{exact:true}).waitFor();assert.equal(puts[0].revision,2);

await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:'Menu',exact:true}).click();
assert.equal(await page.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded'),'true');
await page.getByRole('button',{name:'Menü schließen',exact:true}).click({position:{x:380,y:400}});
assert.equal(await page.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded'),'false');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');

await page.getByRole('button',{name:'EN',exact:true}).click();await page.getByRole('heading',{name:'Welcome & goodbye',exact:true}).waitFor();
await page.getByLabel('Theme',{exact:true}).selectOption('light');
assert.equal(await page.locator('html').getAttribute('data-theme'),'light');assert.deepEqual(errors,[]);
console.log('PASS: 10 views, revision conflict, draft preservation, refreshed save revision, mobile drawer, overflow, EN, light theme, no page errors (API mocked)');
await browser.close();
