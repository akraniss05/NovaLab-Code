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
 if(req.url==='/practice.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(fs.readFileSync(path.join(root,'practice-engine.js')));return;}
 if(req.url==='/runtime.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(source);return;}
 if(req.url==='/vendor/fengari-web.bundle.js'){const file=path.join(root,'vendor/fengari-web.bundle.js');if(!fs.existsSync(file)){res.writeHead(404);res.end('missing bundled Lua runtime');return;}res.writeHead(200,{'Content-Type':'text/javascript'});res.end(fs.readFileSync(file));return;}
 if(['/vendor/sql/sql-wasm.js','/vendor/sql/sql-wasm.wasm','/vendor/typescript.js'].includes(req.url)){
  res.writeHead(200,{'Content-Type':req.url.endsWith('.wasm')?'application/wasm':'text/javascript'});
  res.end(fs.readFileSync(path.join(root,req.url)));return;
 }
 if(/^\/(native\/(?:compiler\.mjs|wasi-host\.mjs|eh\.cpp)|vendor\/clang\/gen\/[a-zA-Z0-9_.-]+)$/.test(req.url)){
  const file=path.join(root,req.url),ext=path.extname(file);
  res.writeHead(200,{'Content-Type':ext==='.wasm'?'application/wasm':['.mjs','.js'].includes(ext)?'text/javascript':'application/octet-stream'});
  res.end(fs.readFileSync(file));return;
 }
 if(req.url?.startsWith('/vendor/java/')){
  const filename=path.basename(req.url);
  res.writeHead(200,{'Content-Type':filename.endsWith('.wasm')?'application/wasm':filename.endsWith('.js')?'text/javascript':'application/octet-stream'});
  res.end(fs.readFileSync(path.join(root,'vendor/java',filename)));return;
 }
 if(req.url?.startsWith('/vendor/pyodide/')){
  const filename=path.basename(req.url),filepath=path.join(root,'vendor/pyodide',filename);
  if(!fs.existsSync(filepath)){res.writeHead(404);res.end('Pyodide file not found: '+filename);return;}
  const ext=path.extname(filename),type=ext==='.wasm'?'application/wasm':ext==='.js'||ext==='.mjs'?'text/javascript':ext==='.json'?'application/json':ext==='.zip'?'application/zip':'application/octet-stream';
  res.writeHead(200,{'Content-Type':type,'Access-Control-Allow-Origin':'*'});
  res.end(fs.readFileSync(filepath));return;
 }
 res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
 res.end('<!doctype html><html><head><title>LL Runtime test</title></head><body><script src="/runtime.js"></script><script src="/practice.js"></script></body></html>');
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
  const blocked=await page.evaluate(()=>window.LLRuntime.run('console.log(typeof self.fetch,typeof globalThis.fetch,typeof self.importScripts)','javascript'));
  assert.equal(blocked.ok,true,'Worker-global network APIs must be shadowed: '+blocked.error);
  assert.deepEqual([...blocked.lines],['undefined undefined undefined'],'Network APIs are not exposed to JavaScript exercises');
  const forged=await page.evaluate(()=>window.LLRuntime.run('self.postMessage({ok:true,lines:["fake"],available:true});console.log("real")','javascript'));
  assert.equal(forged.ok,true,'A forged worker message must not end the legitimate execution: '+forged.error);
  assert.deepEqual([...forged.lines],['real'],'Only a worker reply with the private per-run nonce may be trusted');
  const error=await page.evaluate(()=>window.LLRuntime.run('throw new Error("absichtlich")','javascript'));
  assert.equal(error.ok,false,'Runtime errors must be reported');
  assert.match(error.error,/absichtlich/);
  const lua=await page.evaluate(()=>window.LLRuntime.run('local preis=500\nlocal aktiv=true\nlocal titel="LiveryLab"\nprint(type(preis),type(aktiv),type(titel))','lua'));
  assert.equal(lua.available,true,'Lua has a browser runner');
  assert.equal(lua.ok,true,'Lua must really run: '+JSON.stringify(lua));
  assert.equal(lua.lines.length,1);
  assert.equal(lua.lines[0],'number\tboolean\tstring','Lua print reflects real Lua types');
  const custom=await page.evaluate(async()=>{
   const exercise={lang:'lua',practice_output:'text-lines',practice_line_count:2,
    checks:['\\bprint\\s*\\('],solution:'print("Alex")\nprint("Heute lerne ich Lua.")'};
   const inputs=[
    "print('luca')\nprint('ich mag amg')",
    'print("luca")\nprint("ich mag amg")',
    'print("Luca \\n Zweite Zeile")\nprint("Hallo")',
    'print(123)\nprint("Hallo")',
    'print("Luca", "Hallo")',
    'print("Luca")\nprint("")',
    'print("Luca")'
   ];
   const results=[];
   for(const code of inputs){
    const actual=await window.LLRuntime.run(code,'lua');
    results.push(window.LLPractice.evaluateRuntime(code,exercise,actual,{ok:true,lines:[]}).ok);
   }
   return results;
  });
  assert.deepEqual(custom,[true,true,true,false,false,false,false],'Free text exercises grade the requested print calls and both quote styles');
  const promise=await page.evaluate(()=>window.LLRuntime.run('Promise.resolve(42).then(value => console.log(value))','javascript'));
  assert.deepEqual(promise.lines,['42'],'Promise callbacks finish before output is graded');
  const python=await page.evaluate(()=>window.LLRuntime.run('name = "LiveryLab"\nlevel = 3\nprint(name,level)','python'));
  assert.equal(python.available,true,'Python WebAssembly runner is available');
  assert.equal(python.ok,true,'Python must execute successfully: '+JSON.stringify(python));
  assert.deepEqual([...python.lines],['LiveryLab 3'],'Python output must originate from interpreter');
  const sql=await page.evaluate(()=>window.LLRuntime.run("CREATE TABLE pets (name TEXT); INSERT INTO pets VALUES ('Luna'); SELECT name FROM pets;",'sql'));
  assert.equal(sql.ok,true,sql.error);
  assert.deepEqual(sql.lines,['name','Luna']);
  const ts=await page.evaluate(()=>window.LLRuntime.run('const score: number = 5; console.log(score + 1);','typescript'));
  assert.equal(ts.ok,true,ts.error);
  assert.deepEqual(ts.lines,['6']);
  const json=await page.evaluate(()=>window.LLRuntime.run('{"score":5}','json'));
  assert.equal(json.ok,true,json.error);
  assert.equal(JSON.parse(json.lines[0]).score,5);
  const input=await page.evaluate(()=>Promise.all([
   window.LLRuntime.run('print(io.read())','lua',{stdin:'Luca'}),
   window.LLRuntime.run('print(input().upper())','python',{stdin:'nova'}),
   window.LLRuntime.run('console.log(prompt())','javascript',{stdin:'Hallo'})
  ]));
  assert.deepEqual(input.map(result=>result.lines),[['Luca'],['NOVA'],['Hallo']]);
  const interrupted=await page.evaluate(async()=>{
   const controller=new AbortController();
   const result=window.LLRuntime.run('while(true){}','javascript',{signal:controller.signal});
   setTimeout(()=>controller.abort(),100);
   return result;
  });
  assert.match(interrupted.error,/gestoppt/);
  const java=await page.evaluate(()=>window.LLRuntime.run('public class Main { public static void main(String[] args) { System.out.println("NovaLab " + (2 + 3)); } }','java'));
  assert.equal(java.ok,true,java.error);
  assert.deepEqual(java.lines,['NovaLab 5']);
  const javaError=await page.evaluate(()=>window.LLRuntime.run('class Main { public static void main(String[] args) { System.out.println(unknown); } }','java'));
  assert.equal(javaError.ok,false);
  assert.match(javaError.error,/Zeile 1|unknown/);
  const native=await page.evaluate(async()=>{
   const c=await window.LLRuntime.run('#include <stdio.h>\nint main(void){ int x; if(scanf("%d",&x)==1) printf("%d", x*2); return 0; }','c',{stdin:'7'});
   const cpp=await window.LLRuntime.run('#include <iostream>\nint main(){ std::cout << "Mein eigener Text" << std::endl; }','cpp');
   const invalid=await window.LLRuntime.run('int main(){ missing(); }','cpp');
   return {c,cpp,invalid};
  });
  assert.equal(native.c.ok,true,native.c.error);
  assert.deepEqual(native.c.lines,['14']);
  assert.equal(native.cpp.ok,true,native.cpp.error);
  assert.deepEqual(native.cpp.lines,['Mein eigener Text']);
  assert.equal(native.invalid.ok,false);
  assert.match(native.invalid.error,/missing/);
  const unsupported=await page.evaluate(()=>window.LLRuntime.run('fn main() {}','rust'));
  assert.equal(unsupported.available,false,'An unsupported language must not simulate execution');
  console.log('PASS: browser execution, input, output, stop, SQL, TypeScript, Java and JSON.');
  await page.close();
 }finally{await browser.close();}
}
start().catch(err=>{console.error(err);process.exitCode=1}).finally(()=>server.close());
