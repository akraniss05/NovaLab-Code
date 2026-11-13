/* NovaLab Academy · best-effort isolated lesson runtimes.
   Runs lesson snippets with bundled browser runtimes.
   Made with 💙 by NyxAtheris (NovaLab Academy). */
(function(root){
'use strict';
const supported=new Set(['javascript','js','lua','python','py','sql','typescript','ts','json','java','c','cpp']);
function workerEnvironment(scope){
'use strict';
const maximum=100;
scope.onmessage=async function(event){
 const input=event.data||{},lang=String(input.lang||'').toLowerCase(),code=String(input.code||'');
 const stdin=input.stdin?String(input.stdin).split(/\r?\n/):[];
 const lines=[];
 let lineTypes;
 const send=scope.postMessage.bind(scope);
 const push=(...args)=>{if(lines.length<maximum)lines.push(args.map(v=>v===undefined?'undefined':v===null?'null':typeof v==='object'?JSON.stringify(v):String(v)).join(' ').slice(0,4000));};
 try{
  if(code.length>15000)throw Error('Maximal 15.000 Zeichen pro Ausführung.');
  if(lang==='c'||lang==='cpp'){
   const {runNative}=await import(input.nativeModuleUrl);
   await runNative(code,lang,String(input.stdin||''),push);
  }else if(lang==='java'){
   const {load}=await import(input.javaBaseUrl+'compiler.wasm-runtime.js');
   const base=input.javaBaseUrl;
   const binary=async name=>{
    const response=await fetch(base+name);
    if(!response.ok)throw Error('Java-Laufzeit konnte nicht geladen werden.');
    return new Int8Array(await response.arrayBuffer());
   };
   const [teavm,sdk,library]=await Promise.all([
    load(base+'compiler.wasm'),binary('compile-classlib-teavm.bin'),binary('runtime-classlib-teavm.bin')
   ]);
   const compiler=teavm.exports.createCompiler();
   compiler.setSdk(sdk);
   compiler.setTeaVMClasslib(library);
   const errors=[];
   compiler.onDiagnostic(issue=>{
    if(issue.severity==='error'&&errors.length<8)
     errors.push((issue.lineNumber>0?'Zeile '+issue.lineNumber+': ':'')+issue.message);
   });
   const className=code.match(/\bpublic\s+(?:(?:final|abstract)\s+)?(?:class|enum|record)\s+([A-Za-z_$][\w$]*)/)?.[1]||'Main';
   compiler.addSourceFile(className+'.java',code);
   if(!compiler.compile())throw Error(errors.join('\n')||'Java-Kompilierung fehlgeschlagen.');
   const main=compiler.detectMainClasses()[0];
   if(!main)throw Error('Füge eine ausführbare main-Methode hinzu. Über „Java-Gerüst einsetzen“ bekommst du einen leeren Einstieg.');
   if(!await compiler.generateWebAssembly({outputName:'app',mainClass:main}))throw Error(errors.join('\n')||'Java-Programm benötigt Funktionen außerhalb der Browser-Laufzeit.');
   const program=compiler.getWebAssemblyOutputFile('app.wasm');
   let stdout='',stderr='';
   const append=(buffer,ch,prefix)=>{
    if(ch===10){push(prefix+buffer);return '';}
    return buffer.length<4000?buffer+String.fromCharCode(ch):buffer;
   };
   const app=await load(program,{installImports(imports){
    imports.teavmConsole.putcharStdout=ch=>{stdout=append(stdout,ch,'');};
    imports.teavmConsole.putcharStderr=ch=>{stderr=append(stderr,ch,'STDERR: ');};
   }});
   await app.exports.main([]);
   if(stdout)push(stdout);
   if(stderr)push('STDERR: '+stderr);
  }else if(lang==='sql'){
   importScripts(input.sqlBaseUrl+'sql-wasm.js');
   const SQL=await scope.initSqlJs({locateFile:file=>input.sqlBaseUrl+file});
   const db=new SQL.Database();
   try{
    for(const result of db.exec(code)){
     push(result.columns.join(' | '));
     for(const row of result.values)push(row.map(value=>value===null?'NULL':String(value)).join(' | '));
    }
   }finally{db.close();}
  }else if(lang==='json'){
   push(JSON.stringify(JSON.parse(code),null,2));
  }else if(['javascript','js','typescript','ts'].includes(lang)){
   let script=code;
   if(lang==='typescript'||lang==='ts'){
    importScripts(input.typescriptUrl);
    const ts=scope.ts;
    const compiled=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.None},reportDiagnostics:true});
    const issue=compiled.diagnostics?.find(item=>item.category===ts.DiagnosticCategory.Error);
    if(issue){
     const line=issue.file?.getLineAndCharacterOfPosition(issue.start??0).line;
     throw Error((line===undefined?'':'Zeile '+(line+1)+': ')+ts.flattenDiagnosticMessageText(issue.messageText,'\n'));
    }
    script=compiled.outputText;
   }
   // Shadow worker globals as well as function parameters. Blocking only the
   // unqualified name left self.fetch(), globalThis.fetch(), etc. accessible.
   for(const key of ['fetch','XMLHttpRequest','WebSocket','EventSource','importScripts','Worker']){
    try{Object.defineProperty(scope,key,{value:undefined,writable:false,configurable:false});}
    catch(_){throw Error('Isolierte JavaScript-Laufzeit: '+key+' konnte nicht gesperrt werden.');}
   }
   lineTypes=[];
   const log=(...args)=>{
    if(lines.length<maximum)lineTypes.push(args.map(value=>Array.isArray(value)?'array':typeof value).join(' '));
    push(...args);
   };
   const consoleProxy={log,info:log,warn:(...x)=>push('WARN:',...x),error:(...x)=>push('ERROR:',...x)};
   // A worker cannot access the app DOM, its localStorage or the Supabase session.
   // Do not supply credentials or privileged capabilities to learner code.
   const fn=new Function('console','prompt','fetch','XMLHttpRequest','WebSocket','EventSource','importScripts',
    '"use strict";\n'+script);
   const result=fn(consoleProxy,()=>stdin.shift()??null,undefined,undefined,undefined,undefined,undefined);
   if(result&&typeof result.then==='function')await result;
   await new Promise(resolve=>setTimeout(resolve,0));
  }else if(lang==='lua'){
   // The npm bundle exports through CommonJS; give it a local module object.
   scope.module={exports:{}};
   scope.exports=scope.module.exports;
   importScripts(input.luaBundleUrl);
   const fengari=scope.fengari||scope.module.exports?.fengari||scope.module.exports?.default||scope.module.exports;
   if(!fengari||typeof fengari.load!=='function')throw Error('Lua-Interpreter konnte nicht initialisiert werden.');
   const evalLua=fengari.load;
   evalLua(`LL_TYPES = {}
LL_OUTPUT = {}
print = function(...)
 local values, types = {}, {}
 if #LL_OUTPUT >= 100 then return end
 for i = 1, select('#', ...) do
  local value = select(i, ...)
  values[i] = tostring(value)
  types[i] = type(value)
 end
 LL_OUTPUT[#LL_OUTPUT + 1] = table.concat(values, '\\t')
 LL_TYPES[#LL_TYPES + 1] = table.concat(types, ' ')
end`)();
   // Configure one input line per io.read() call inside this worker.
   const bytes=Array.from(new TextEncoder().encode(String(input.stdin||'')));
   const luaInput=bytes.map(value=>'\\'+String(value).padStart(3,'0')).join('');
   evalLua(`local data = "${luaInput}"
local cursor = 1
io = io or {}
function io.read(format)
 if cursor > #data then return nil end
 local stop = string.find(data, '\\n', cursor, true) or (#data + 1)
 local line = string.gsub(string.sub(data, cursor, stop - 1), '\\r$', '')
 cursor = stop + 1
 if format == '*n' or format == 'n' then return tonumber(line) end
 return line
end`)();
   evalLua(code,'lesson.lua')();
   const count=evalLua("return #LL_OUTPUT")();
   for(let i=1;i<=Math.min(count,maximum);i++)lines.push(String(evalLua('return LL_OUTPUT['+i+']')()));
   lineTypes=[];
   for(let i=1;i<=Math.min(count,maximum);i++)lineTypes.push(String(evalLua('return LL_TYPES['+i+']')()));
  }else if(lang==='python'||lang==='py'){
   if(!input.pythonBundleUrl||!input.pythonBaseUrl)throw Error('Python-Laufzeit nicht eingerichtet.');
   // Support both browser-global and CommonJS-distributed Pyodide bootstrap bundles.
   scope.module={exports:{}};scope.exports=scope.module.exports;
   importScripts(input.pythonBundleUrl);
   const init=scope.loadPyodide||scope.module?.exports?.loadPyodide;
   if(typeof init!=='function')throw Error('Pyodide konnte nicht initialisiert werden.');
   const py=await init({indexURL:input.pythonBaseUrl});
   py.setStdin({stdin:()=>stdin.shift()??null});
   py.setStdout({batched:line=>push(line)});
   py.setStderr({batched:line=>push('STDERR:',line)});
   await py.runPythonAsync(code);
  }else throw Error('Für diese Sprache ist noch keine echte Browser-Laufzeit eingerichtet.');
  send({ok:true,lines:lines.slice(0,maximum),lineTypes,error:'',available:true,nonce:input.nonce});
 }catch(error){
  send({ok:false,lines:lines.slice(0,maximum),error:String(error?.message||error),available:true,nonce:input.nonce});
 }
};
}
function run(code,lang,{stdin='',signal}={}){
 lang=String(lang||'').toLowerCase();
 if(!supported.has(lang))return Promise.resolve({ok:false,lines:[],error:'Echte Ausführung für '+(lang||'diese Sprache')+' ist noch nicht eingerichtet. Die Aufgabe kann nur eingeschränkt statisch geprüft werden.',available:false});
 if(typeof Worker!=='function'||typeof Blob!=='function'||typeof URL==='undefined'||typeof URL.createObjectURL!=='function')
  return Promise.resolve({ok:false,lines:[],error:'Browser unterstützt die isolierte Codeausführung nicht.',available:false});
 return new Promise(resolve=>{
  const blob=new Blob(['('+workerEnvironment.toString()+')(self);'],{type:'text/javascript'});
  const url=URL.createObjectURL(blob);let worker,finished=false;
  const abort=()=>settle({ok:false,lines:[],error:'Ausführung gestoppt.',available:true});
  const settle=result=>{
   if(finished)return;finished=true;clearTimeout(timeout);signal?.removeEventListener('abort',abort);
   if(worker)worker.terminate();URL.revokeObjectURL(url);resolve(result);
  };
  let timeout;
  try{
   if(signal?.aborted){abort();return;}
   signal?.addEventListener('abort',abort,{once:true});
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
   const maxTime=['python','py','java','c','cpp'].includes(lang)?60000:['lua','sql','typescript','ts'].includes(lang)?12000:4000;
   timeout=setTimeout(()=>settle({ok:false,lines:[],error:'Ausführung nach '+(maxTime/1000)+' Sekunden abgebrochen. Prüfe deinen Code auf Endlosschleifen.',available:true}),maxTime);
   const base=(typeof document!=='undefined'&&document.baseURI)||(typeof location!=='undefined'?location.href:'');
   const luaBundleUrl=base?new URL('vendor/fengari-web.bundle.js',base).href:'';
   const pythonBaseUrl=base?new URL('vendor/pyodide/',base).href:'';
   const pythonBundleUrl=base?new URL('vendor/pyodide/pyodide.js',base).href:'';
   const sqlBaseUrl=base?new URL('vendor/sql/',base).href:'';
   const typescriptUrl=base?new URL('vendor/typescript.js',base).href:'';
   const javaBaseUrl=base?new URL('vendor/java/',base).href:'';
   const nativeModuleUrl=base?new URL('native/compiler.mjs',base).href:'';
   worker.postMessage({code:String(code||''),lang,nativeModuleUrl,luaBundleUrl,pythonBaseUrl,pythonBundleUrl,sqlBaseUrl,typescriptUrl,javaBaseUrl,stdin:String(stdin).slice(0,2000),nonce});
  }catch(error){settle({ok:false,lines:[],error:'Laufzeit nicht verfügbar: '+error.message,available:false});}
 });
}
root.LLRuntime={run,supported:[...supported]};
})(typeof window!=='undefined'?window:globalThis);
