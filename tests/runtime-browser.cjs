/* Real browser regression for Lua and JavaScript lesson runners */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright-core');
const root=path.join(__dirname,'../site');
const source=fs.readFileSync(path.join(root,'academy-runtime.js'),'utf8');
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/opt/google/chrome/chrome','/usr/bin/chromium'].filter(Boolean).find(p=>fs.existsSync(p));
if(!chrome)throw Error('Chrome/Chromium not available for live runtime verification.');
const server=http.createServer((req,res)=>{
 if(req.url==='/runtime.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(source);return;}
 res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
 res.end('<!doctype html><html><head><title>LL Runtime test</title></head><body><script src="/runtime.js"></script></body></html>');
});
async function start(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.LLRuntime));
  const js=await page.evaluate(()=>window.LLRuntime.run('const preis=2; console.log(preis+3)','javascript'));
  assert.equal(js.available,true,'JavaScript has a browser runner');
  assert.equal(js.ok,true,'Real JavaScript execution succeeds: '+js.error);
  assert.deepEqual([...js.lines],['5'],'JavaScript output must be derived from code');
  const error=await page.evaluate(()=>window.LLRuntime.run('throw new Error("absichtlich")','javascript'));
  assert.equal(error.ok,false,'Runtime errors must be reported');
  assert.match(error.error,/absichtlich/);
  const lua=await page.evaluate(()=>window.LLRuntime.run('local preis=500\nlocal aktiv=true\nlocal titel="LiveryLab"\nprint(type(preis),type(aktiv),type(titel))','lua'));
  assert.equal(lua.available,true,'Lua has a browser runner');
  assert.equal(lua.ok,true,'Lua must really run: '+JSON.stringify(lua));
  assert.equal(lua.lines.length,1);
  assert.equal(lua.lines[0],'number\tboolean\tstring','Lua print reflects real Lua types');
  const unsupported=await page.evaluate(()=>window.LLRuntime.run('print("x")','python'));
  assert.equal(unsupported.available,false,'Python must not simulate execution');
  console.log('PASS: real JavaScript output, JavaScript errors, Lua 5.3 types, honest unsupported Python.');
  await page.close();
 }finally{await browser.close();}
}
start().catch(err=>{console.error(err);process.exitCode=1}).finally(()=>server.close());
