import {createWasi} from './wasi-host.mjs';

export async function runNative(code, language, stdin, output){
 const {commands,Exit}=await import('../vendor/clang/gen/bundle.js');
 const cpp=language==='cpp';
 const driver=cpp?'clang++':'clang';
 const source=cpp?'main.cpp':'main.c';
 let diagnostics='';
 const decoder=new TextDecoder();
 const stderr=bytes=>{
  if(bytes&&diagnostics.length<12000)diagnostics+=decoder.decode(bytes,{stream:true}).slice(0,12000-diagnostics.length);
 };
 const files={[source]:code};
 if(cpp){
  const response=await fetch(new URL('./eh.cpp',import.meta.url));
  if(!response.ok)throw Error('C++-Laufzeit konnte nicht geladen werden.');
  files['eh.cpp']=await response.text();
 }
 const args=[cpp?'-std=c++20':'-std=c17','-O0','-fno-color-diagnostics',source,...(cpp?['eh.cpp']:[]),'-o','main.wasm'];
 let compiled;
 try{compiled=await commands[driver](args,files,{stderr,decodeASCII:false});}
 catch(error){if(!(error instanceof Exit))throw error;}
 const binary=compiled?.['main.wasm'];
 if(!binary)throw Error((diagnostics+decoder.decode()).trim()||'Kompilierung fehlgeschlagen.');

 const buffers={1:'',2:''};
 const wasi=createWasi({
  args:['main'],stdin:new TextEncoder().encode(stdin),
  write(fd,text){
   const parts=(buffers[fd]+text).split('\n');
   buffers[fd]=parts.pop().slice(0,4000);
   for(const line of parts)output(fd===2?'STDERR: '+line:line);
  }
 });
 const module=await WebAssembly.compile(binary);
 const instance=await WebAssembly.instantiate(module,wasi.imports);
 const exit=wasi.start(instance);
 for(const [fd,text] of Object.entries(buffers))if(text)output(fd==='2'?'STDERR: '+text:text);
 if(exit!==0)throw Error('Programm beendet mit Rückgabecode '+exit+'.');
}
