/* NovaLab Academy · best-effort isolated lesson runtimes.
   Browser execution is available for JavaScript and Lua 5.3 (Fengari).
   Other languages need a dedicated execution service; never fake their output.
   Made with 💙 by NyxAtheris (NovaLab Academy). */
(function(root){
'use strict';
const supported=new Set(['javascript','js','lua','python','py']);
function workerEnvironment(scope){
'use strict';
const maximum=100;
scope.onmessage=async function(event){
 const input=event.data||{},lang=String(input.lang||'').toLowerCase(),code=String(input.code||'');
 const lines=[];
 const send=scope.postMessage.bind(scope);
 const push=(...args)=>{if(lines.length<maximum)lines.push(args.map(v=>v===undefined?'undefined':v===null?'null':typeof v==='object'?JSON.stringify(v):String(v)).join(' '));};
 try{
  if(code.length>15000)throw Error('Maximal 15.000 Zeichen pro Ausführung.');
  if(lang==='javascript'||lang==='js'){
   // Shadow worker globals as well as function parameters. Blocking only the
   // unqualified name left self.fetch(), globalThis.fetch(), etc. accessible.
   for(const key of ['fetch','XMLHttpRequest','WebSocket','EventSource','importScripts','Worker']){
    try{Object.defineProperty(scope,key,{value:undefined,writable:false,configurable:false});}
    catch(_){throw Error('Isolierte JavaScript-Laufzeit: '+key+' konnte nicht gesperrt werden.');}
   }
   const consoleProxy={log:push,info:push,warn:(...x)=>push('WARN:',...x),error:(...x)=>push('ERROR:',...x)};
   // A worker cannot access the app DOM, its localStorage or the Supabase session.
   // Do not supply credentials or privileged capabilities to learner code.
   const fn=new Function('console','fetch','XMLHttpRequest','WebSocket','EventSource','importScripts',
    '"use strict";\n'+code);
   const result=fn(consoleProxy,undefined,undefined,undefined,undefined,undefined);
   if(result&&typeof result.then==='function')await result;
  }else if(lang==='lua'){
   // The npm bundle exports through CommonJS; give it a local module object.
   scope.module={exports:{}};
   scope.exports=scope.module.exports;
   importScripts(input.luaBundleUrl);
   const fengari=scope.fengari||scope.module.exports?.fengari||scope.module.exports?.default||scope.module.exports;
   if(!fengari||typeof fengari.load!=='function')throw Error('Lua-Interpreter konnte nicht initialisiert werden.');
   const evalLua=fengari.load;
   evalLua("LL_OUTPUT = {}\nprint = function(...) local a={} for i=1, select('#', ...) do a[#a+1]=tostring(select(i,...)) end LL_OUTPUT[#LL_OUTPUT+1]=table.concat(a, '\\t') end")();
   evalLua(code,'lesson.lua')();
   const out=String(evalLua("return table.concat(LL_OUTPUT, '\\n')")()||'');
   if(out)lines.push(...out.split('\n').slice(0,maximum));
  }else if(lang==='python'||lang==='py'){
   if(!input.pythonBundleUrl||!input.pythonBaseUrl)throw Error('Python-Laufzeit nicht eingerichtet.');
   // Support both browser-global and CommonJS-distributed Pyodide bootstrap bundles.
   scope.module={exports:{}};scope.exports=scope.module.exports;
   importScripts(input.pythonBundleUrl);
   const init=scope.loadPyodide||scope.module?.exports?.loadPyodide;
   if(typeof init!=='function')throw Error('Pyodide konnte nicht initialisiert werden.');
   const py=await init({indexURL:input.pythonBaseUrl});
   py.setStdout({batched:line=>push(line)});
   py.setStderr({batched:line=>push('STDERR:',line)});
   await py.runPythonAsync(code);
  }else throw Error('Für diese Sprache ist noch keine echte Browser-Laufzeit eingerichtet.');
  send({ok:true,lines:lines.slice(0,maximum),error:'',available:true,nonce:input.nonce});
 }catch(error){
  send({ok:false,lines:lines.slice(0,maximum),error:String(error?.message||error),available:true,nonce:input.nonce});
 }
};
}
function run(code,lang){
 lang=String(lang||'').toLowerCase();
 if(!supported.has(lang))return Promise.resolve({ok:false,lines:[],error:'Echte Ausführung für '+(lang||'diese Sprache')+' ist noch nicht eingerichtet. Die Aufgabe kann nur eingeschränkt statisch geprüft werden.',available:false});
 if(typeof Worker!=='function'||typeof Blob!=='function'||typeof URL==='undefined'||typeof URL.createObjectURL!=='function')
  return Promise.resolve({ok:false,lines:[],error:'Browser unterstützt die isolierte Codeausführung nicht.',available:false});
 return new Promise(resolve=>{
  const blob=new Blob(['('+workerEnvironment.toString()+')(self);'],{type:'text/javascript'});
  const url=URL.createObjectURL(blob);let worker,finished=false;
  const settle=result=>{
   if(finished)return;finished=true;clearTimeout(timeout);
   if(worker)worker.terminate();URL.revokeObjectURL(url);resolve(result);
  };
  let timeout;
  try{
   worker=new Worker(url);
   const nonce=typeof crypto!=='undefined'&&typeof crypto.getRandomValues==='function'
    ?Array.from(crypto.getRandomValues(new Uint32Array(4)),v=>v.toString(16).padStart(8,'0')).join('')
    :String(Math.random())+String(performance?.now?.()||'');
   worker.onmessage=event=>{
    const result=event.data;
    if(!result||result.nonce!==nonce)return;
    settle(result);
   };
   worker.onerror=()=>settle({ok:false,lines:[],error:'Die Ausführungsumgebung konnte nicht starten. Prüfe Browser und Verbindung.',available:false});
   const maxTime=lang==='python'||lang==='py'?45000:lang==='lua'?10000:4000;
   timeout=setTimeout(()=>settle({ok:false,lines:[],error:'Ausführung nach '+(maxTime/1000)+' Sekunden abgebrochen. Prüfe deinen Code auf Endlosschleifen.',available:true}),maxTime);
   const base=(typeof document!=='undefined'&&document.baseURI)||(typeof location!=='undefined'?location.href:'');
   const luaBundleUrl=base?new URL('vendor/fengari-web.bundle.js',base).href:'';
   const pythonBaseUrl=base?new URL('vendor/pyodide/',base).href:'';
   const pythonBundleUrl=base?new URL('vendor/pyodide/pyodide.js',base).href:'';
   worker.postMessage({code:String(code||''),lang,luaBundleUrl,pythonBaseUrl,pythonBundleUrl,nonce});
  }catch(error){settle({ok:false,lines:[],error:'Laufzeit nicht verfügbar: '+error.message,available:false});}
 });
}
root.LLRuntime={run,supported:[...supported]};
})(typeof window!=='undefined'?window:globalThis);
