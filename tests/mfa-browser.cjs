/* LiveryLab Academy: E2E auth settings UI with a mocked Supabase MFA server.
 * Tests UI interactions, not live account enrollment. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(root,'site/app-v20.css'),'utf8');
const auth=fs.readFileSync(path.join(root,'site/auth-mfa-v15.js'),'utf8');
const executable=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/opt/google/chrome/chrome','/usr/bin/chromium'].filter(Boolean).find(p=>fs.existsSync(p));
if(!executable)throw Error('Chrome/Chromium required for MFA E2E tests');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
   page.on('dialog',dialog=>dialog.accept());
   await page.setContent('<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head>'+
    '<body><main class="content"><section class="panel"><h1>Dein Developer-Profil</h1><h2>Authenticator-App</h2><div id="mfa-settings"></div></section>'+
    '<div id="mfa-login-test"></div></main></body></html>');
   await page.addScriptTag({content:auth});
   await page.evaluate(()=>{
     window.__MFA_MOCK={factors:[],secondLogin:false,verified:false,loginSuccess:false};
     const s=window.__MFA_MOCK;
     window.__client={auth:{mfa:{
      async getAuthenticatorAssuranceLevel(){const any=s.factors.some(f=>f.status==='verified');
        return {data:{currentLevel:any&&!s.secondLogin?'aal2':'aal1',nextLevel:any?'aal2':'aal1'},error:null};},
      async listFactors(){return {data:{totp:s.factors,all:s.factors},error:null};},
      async enroll(){const f={id:'test-factor-'+(s.factors.length+1),factor_type:'totp',friendly_name:'LiveryLab Academy',status:'unverified'};
        s.factors.push(f);
        return {data:{...f,totp:{secret:'JBSWY3DPEHPK3PXP',qr_code:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><rect width="220" height="220" fill="white"/><rect x="45" y="45" width="120" height="120" fill="black"/></svg>')}},error:null};
      },
      async challenge({factorId}){return {data:{id:'test-challenge',factorId},error:null};},
      async verify({factorId,code}){
       if(code!=='123456')return {data:null,error:{message:'Invalid TOTP code'}};
       const f=s.factors.find(x=>x.id===factorId);if(!f)return {data:null,error:{message:'Missing factor'}};
       f.status='verified';s.secondLogin=false;s.verified=true;return {data:{access_token:'test-aal2'},error:null};
      },
      async unenroll({factorId}){s.factors=s.factors.filter(f=>f.id!==factorId);s.verified=s.factors.some(f=>f.status==='verified');return {data:{},error:null};}
     }}};
   });
   await page.evaluate(()=>window.LLMFA.renderSettings(document.querySelector('#mfa-settings'),window.__client));
   assert(await page.getByText('Noch nicht verbunden').isVisible(),'Initial 2FA status missing');
   await page.locator('#ll-mfa-enroll').click();
   await page.locator('#ll-mfa-secret').waitFor();
   assert.equal(await page.locator('#ll-mfa-secret').inputValue(),'JBSWY3DPEHPK3PXP','Setup key not shown');
   assert.equal(await page.locator('#ll-mfa-qr img').count(),1,'QR Code missing');
   await page.locator('#ll-mfa-setup-code').fill('000000');
   await page.locator('#ll-mfa-activate').click();
   assert(await page.getByText('Falscher oder abgelaufener Code.').count()===0 || await page.locator('.mfa-message.error').count()>=1,'Invalid code error not displayed');
   await page.locator('#ll-mfa-setup-code').fill('123456');
   await page.locator('#ll-mfa-activate').click();
   await page.getByText('Authenticator aktiviert').waitFor();
   assert(await page.locator('[data-mfa-remove]').isVisible(),'Remove action not available');
   const beforeGate=await page.evaluate(async()=>{
    window.__MFA_MOCK.secondLogin=true;
    return window.LLMFA.refresh(window.__client);
   });
   assert.equal(beforeGate,true,'AAL1 login with a verified factor was not gated');
   await page.evaluate(()=>window.LLMFA.renderGate(document.querySelector('#mfa-login-test'),{
    client:window.__client,onSuccess:()=>{window.__MFA_MOCK.loginSuccess=true;},onLogout:()=>{}
   }));
   assert(await page.getByText('Bestätige, dass').isVisible(),'Second factor gate not displayed');
   await page.locator('#ll-mfa-login-code').fill('123456');
   await page.locator('#ll-mfa-login-check').click();
   await page.waitForFunction(()=>window.__MFA_MOCK.loginSuccess===true);
   await page.evaluate(()=>window.LLMFA.renderSettings(document.querySelector('#mfa-settings'),window.__client));
   await page.locator('[data-mfa-remove]').click();
   await page.getByText('Noch nicht verbunden').waitFor();
   const state=await page.evaluate(()=>({factors:window.__MFA_MOCK.factors.length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
   assert.equal(state.factors,0,'Authenticator could not be unenrolled');
   assert.ok(state.overflow<=2,'MFA page horizontally overflows '+state.overflow+'px at '+width);
   if(width===390){
    fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
    await page.screenshot({path:path.join(root,'test-results','authenticator-mobile.png'),fullPage:true});
   }
   console.log('PASS MFA enroll / verify / login challenge / remove @'+width+'px');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});