'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

// Boot the published entry with real scripts, styles and images. Only replace the auth service.
module.exports = async function checkPublicDesign(browser) {
 const page = await browser.newPage({viewport:{width:390,height:844}});
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 const root = path.resolve(__dirname, '../site');
 try {
  await page.route('https://nova.test/**', route => {
   const file = new URL(route.request().url()).pathname.slice(1) || 'index.html';
   return route.fulfill({path:path.join(root,file)});
  });
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({contentType:'application/javascript',body:`
   window.supabase={createClient:()=>({
    auth:{getUser:async()=>({data:{user:null}})},
    rpc:async()=>({data:false}),
    functions:{invoke:()=>new Promise(resolve=>{window.finishPolicy=()=>resolve({data:{ok:true,mode:'open'}});})}
   })};`}));
  await page.goto('https://nova.test/');
  const slider = page.locator('nova-slider');
  await slider.waitFor();
  assert.equal(await slider.locator('.nova-slide:visible').count(),1);
  await slider.locator('[data-slide="2"]').click();
  assert.match(await slider.locator('.nova-slide:visible').innerText(),/Welten/);
  await slider.locator('[data-pause]').click();
  assert.equal(await slider.locator('[data-pause]').getAttribute('aria-pressed'),'true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await slider.locator('[data-pause]').waitFor({state:'hidden'});
  await page.locator('[data-nova-login]').click();
  assert.equal(await page.locator('#username').evaluate(el=>el===document.activeElement),true);
  await page.locator('#username').fill('Testname');
  await page.evaluate(()=>window.finishPolicy());
  await page.waitForFunction(()=>document.querySelector('[data-policy-note]').textContent.includes('ohne Freigabe'));
  assert.equal(await page.locator('#username').inputValue(),'Testname');
  await page.locator('.auth-secondary [data-action="show-register"]').click();
  await page.locator('#reg-email').fill('test@example.org');
  await page.evaluate(()=>window.finishPolicy());
  assert.equal(await page.locator('#reg-email').inputValue(),'test@example.org');
  await page.locator('[data-action="show-login"]').click();
  for (const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:900});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Guest layout overflow at '+width);
   const image = page.locator('.nova-slide:visible img');
   await image.evaluate(el=>el.decode());
   assert(await image.evaluate(el=>el.naturalWidth>600));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS v1.02 public slider, reduced motion, local art, sign-in navigation and delayed policy response.');
 } finally { await page.close(); }
};
