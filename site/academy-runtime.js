/* LiveryLab Academy · best-effort isolated lesson runtimes.
   Browser execution is available for JavaScript and Lua 5.3 (Fengari).
   Other languages need a dedicated execution service; never fake their output.
   Made with 💙 by NyxAtheris (LiveryLab Studios). */
(function(root){
'use strict';
const supported=new Set(['javascript','js','lua']);
function workerEnvironment(scope){
'use strict';
const maximum=100;
scope.onmessage=async function(event){
 const input=event.data||{},lang=String(input.lang||'').toLowerCase(),code=String(input.code||'');
 const lines=[];
 const push=(...args)=>{if(lines.length<maximum)lines.push(args.map(v=>v===undefined?'undefined':v===null?'null':typeof v==='object'?JSON.stringify(v):String(v)).join(' '));};
 try{
  if(code.length>15000)throw Error('Maximal 15.000 Zeichen pro Ausführung.');
  if(lang==='javascript'||lang==='js'){
   const consoleProxy={log:push,info:push,warn:(...x)=>push('WARN:',...x),error:(...x)=>push('ERROR:',...x)};
   // A worker cannot access the app DOM, its localStorage or the Supabase session.
   // Do not supply credentials or privileged capabilities to learner code.
   const fn=new Function('console','fetch','XMLHttpRequest','WebSocket','EventSource','importScripts',
    '"use strict";\n'+code);
   const result=fn(consoleProxy,undefined,undefined,undefined,undefined,undefined);
   if(result&&typeof result.then==='function')await result;
  }else if(lang==='lua'){
   importScripts('https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.bundle.js');
   if(!scope.fengari?.load)throw Error('Lua-Interpreter konnte nicht geladen werden.');
   const evalLua=scope.fengari.load;
   evalLua("___ll_output = {}\nprint = function(...) local a={} for i=1, select('#', ...) do a[#a+1]=tostring(select(i,...)) end ___ll_output[#__ll_output+1]=table.concat(a, '\\t') end")();
   evalLua(code,'lesson.lua')();
   const out=String(evalLua("return table.concat(___ll_output, '\\n')")()||'');
   if(out)lines.push(...out.split('\n').slice(0,maximum));
  }else throw Error('Für diese Sprache ist noch keine echte Browser-Laufzeit eingerichtet.');
  scope.postMessage({ok:true,lines:lines.slice(0,maximum),error:'',available:true});
 }catch(error){
  scope.postMessage({ok:false,lines:lines.slice(0,maximum),error:String(error?.message||error),available:true});
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
   worker.onmessage=event=>settle(event.data||{ok:false,lines:[],error:'Keine Antwort vom Interpreter.',available:false});
   worker.onerror=()=>settle({ok:false,lines:[],error:'Die Ausführungsumgebung konnte nicht starten. Prüfe Browser und Verbindung.',available:false});
   timeout=setTimeout(()=>settle({ok:false,lines:[],error:'Ausführung nach 4 Sekunden abgebrochen. Prüfe deinen Code auf Endlosschleifen.',available:true}),4000);
   worker.postMessage({code:String(code||''),lang});
  }catch(error){settle({ok:false,lines:[],error:'Laufzeit nicht verfügbar: '+error.message,available:false});}
 });
}
root.LLRuntime={run,supported:[...supported]};
})(typeof window!=='undefined'?window:globalThis);
