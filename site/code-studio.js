
(()=>{
'use strict';
// LiveryLab Code Studio v4; local project files, no remote upload.
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ext={javascript:'.js',html:'.html',css:'.css',lua:'.lua',python:'.py',typescript:'.ts',csharp:'.cs',java:'.java',cpp:'.cpp'};
const template={
 web:()=>({name:'Meine Web-App',lang:'html',file:'index.html',files:{
  'index.html':'<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meine App</title><link rel="stylesheet" href="style.css"></head><body><main><h1>Meine erste App</h1><p id="text">Klicke auf den Button!</p><button id="go">Start</button></main><script src="main.js"></script></body></html>',
  'style.css':'body{margin:0;padding:36px;font-family:system-ui;background:#100b17;color:white}main{max-width:500px;margin:40px auto;padding:28px;border:1px solid #8b3dec;border-radius:20px}button{background:#a348fa;color:white;border:0;padding:12px 20px;border-radius:12px;cursor:pointer}',
  'main.js':'document.querySelector("#go").addEventListener("click",()=>{document.querySelector("#text").textContent="Deine App funktioniert!";});'
 }}),
 snake:()=>({name:'Snake Browsergame',lang:'html',file:'index.html',files:{
  'index.html':'<!doctype html><html lang="de"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Snake</title><style>body{background:#11101e;color:#fff;text-align:center;font:18px system-ui}canvas{background:#211932;border:2px solid #9b40fa;max-width:90vw}button{padding:12px;margin:6px;border-radius:10px}</style><h1>Mein Snake Game</h1><canvas id="game" width="320" height="320"></canvas><p>Pfeiltasten oder Buttons verwenden</p><button data-d="up">↑</button><div><button data-d="left">←</button><button data-d="down">↓</button><button data-d="right">→</button></div><script src="game.js"></script></html>',
  'game.js':'const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");let snake=[{x:8,y:8}],food={x:3,y:4},dir={x:1,y:0},score=0;function turn(v){const next={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[v];if(next.x!==-dir.x||next.y!==-dir.y)dir=next}document.onkeydown=e=>({ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.key]&&turn({ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.key]));document.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>turn(b.dataset.d));function frame(){const n={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(n.x<0||n.y<0||n.x>=16||n.y>=16||snake.some(p=>p.x===n.x&&p.y===n.y)){snake=[{x:8,y:8}];score=0;dir={x:1,y:0};return}snake.unshift(n);if(n.x===food.x&&n.y===food.y){score++;food={x:Math.floor(Math.random()*16),y:Math.floor(Math.random()*16)}}else snake.pop();}function draw(){ctx.clearRect(0,0,320,320);ctx.fillStyle="#b243ff";snake.forEach(p=>ctx.fillRect(p.x*20+1,p.y*20+1,18,18));ctx.fillStyle="#56f5a8";ctx.fillRect(food.x*20+1,food.y*20+1,18,18)}setInterval(()=>{frame();draw()},180);draw();'
 }}),
 python:()=>({name:'Python Playground',lang:'python',file:'main.py',files:{'main.py':'# Python Playground · LiveryLab\npreise = [12, 24, 18]\nsumme = sum(preise)\nprint("Gesamt:", summe)\nprint("Durchschnitt:", round(summe / len(preise), 2))'}}),
 lua:()=>({name:'Lua Playground',lang:'lua',file:'main.lua',files:{'main.lua':'-- Lua Playground\nlocal name = "LiveryLab"\nprint("Willkommen bei " .. name)\nfor i = 1, 4 do\n  print("Lektion " .. i)\nend'}}),
 admin:()=>({name:'FiveM Adminpanel Starter',lang:'lua',file:'server/main.lua',files:{
  'fxmanifest.lua':"fx_version 'cerulean'\ngame 'gta5'\nname 'll-adminpanel'\nauthor 'LiveryLab Academy'\nversion '0.1.0'\nui_page 'web/index.html'\nfiles {'web/index.html','web/app.js','web/style.css'}\nclient_script 'client/main.lua'\nserver_script 'server/main.lua'",
  'server/main.lua':"-- SECURITY FIRST: permissions and target validation are server-owned.\nRegisterNetEvent('lladmin:requestPlayers', function()\n  local src = source\n  if not IsPlayerAceAllowed(src, 'liverylab.admin') then return end\n  local players = {}\n  for _, id in ipairs(GetPlayers()) do\n    players[#players + 1] = { id = tonumber(id), name = GetPlayerName(id) }\n  end\n  TriggerClientEvent('lladmin:players', src, players)\nend)\nRegisterNetEvent('lladmin:kick', function(targetId, reason)\n  local src=source\n  if not IsPlayerAceAllowed(src,'liverylab.admin') then return end\n  local target=tonumber(targetId)\n  if not target or target<=0 or target==src or not GetPlayerName(target) then return end\n  DropPlayer(target, ('Admin: %s'):format(tostring(reason or 'Regelverstoß'):sub(1,120)))\nend)",
  'client/main.lua':"RegisterCommand('lladmin', function()\n  SetNuiFocus(true,true)\n  SendNUIMessage({ action='open' })\n  TriggerServerEvent('lladmin:requestPlayers')\nend)\nRegisterNetEvent('lladmin:players', function(players)\n  SendNUIMessage({ action='players', players=players })\nend)\nRegisterNUICallback('close', function(_,cb)\n  SetNuiFocus(false,false)\n  cb({ok=true})\nend)\nRegisterNUICallback('kick', function(data,cb)\n  TriggerServerEvent('lladmin:kick',data.id,data.reason)\n  cb({ok=true})\nend)",
  'web/index.html':'<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"><main id="panel"><h1>LiveryLab Admin Panel</h1><p>Spieler online</p><div id="players">Warte auf Serverdaten …</div><button id="close">Schließen</button></main><script src="app.js"></script></html>',
  'web/style.css':'body{background:#120b20;color:#fff;font:16px system-ui}#panel{max-width:660px;margin:10vh auto;background:#21142e;padding:30px;border-radius:18px;border:1px solid #a646ef}.person{padding:12px;border-bottom:1px solid #493258}button{padding:10px;background:#9749e8;color:white;border:0;border-radius:8px;margin-left:10px}',
  'web/app.js':"const box=document.querySelector('#players');window.addEventListener('message',e=>{if(e.data.action==='players'){box.replaceChildren();for(const p of e.data.players){const row=document.createElement('div');row.className='person';row.textContent=p.name+' (#'+p.id+') ';const b=document.createElement('button');b.textContent='Kick';b.addEventListener('click',()=>fetch(`https://${GetParentResourceName()}/kick`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,reason:'Regelverstoß'})}));row.append(b);box.append(row)}}});document.querySelector('#close').onclick=()=>fetch(`https://${GetParentResourceName()}/close`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});"
 }}),
 js:()=>({name:'JavaScript Rechner',lang:'javascript',file:'main.js',files:{'main.js':'function addiere(a,b){return a+b}\nconsole.log("Ergebnis:",addiere(20,22))'}})
};
const newId=()=>`p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
let root=null,state=null,saveState=()=>{},controller=null,runner=null,output='',tab='files';
function project(){if(!Array.isArray(state.projects))state.projects=[];return state.projects.find(p=>p.id===state.projectId)||state.projects[0]}
function ensure(){if(!state.projects?.length){const p=template.web();p.id=newId();state.projects=[p];state.projectId=p.id;saveState()}const p=project();if(!p.file||!(p.file in p.files))p.file=Object.keys(p.files)[0];return p}
function msg(s){output=String(s);const o=root&&$('#llideOutput',root);if(o)o.textContent=output}
function newProject(kind){if(!template[kind])return;const p=template[kind]();p.id=newId();state.projects.push(p);state.projectId=p.id;saveState();render(root,{state,save:saveState})}
function fileType(file){return file.split('.').pop()?.toLowerCase()}
function editorLanguage(file){return ({js:'JavaScript',ts:'TypeScript',lua:'Lua',py:'Python',html:'HTML',css:'CSS',json:'JSON',cs:'C#',java:'Java',cpp:'C++'})[fileType(file)]||'Text'}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),20000)}
function previewHTML(p){
 let html=p.files['index.html']||p.files['web/index.html'];
 if(!html)return null;
 const prefix=p.files['index.html']?'':'web/';
 html=html.replace(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/gi,(m,f)=>p.files[prefix+f]?`<style>${p.files[prefix+f].replace(/<\/style/gi,'<\\/style')}</style>`:m);
 html=html.replace(/<script[^>]*src=["']([^"']+\.js)["'][^>]*><\/script>/gi,(m,f)=>p.files[prefix+f]?`<script>${p.files[prefix+f].replace(/<\/script/gi,'<\\/script')}</script>`:m);
 return html;
}
function showPreview(html){const area=$('#llideFrameBox',root);area.replaceChildren();const frame=document.createElement('iframe');frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('title','Abgeschottete Projektvorschau');frame.className='llide-iframe';frame.srcdoc=html;area.append(frame);msg('Vorschau in einer isolierten Browser-Sandbox gestartet. FiveM-Natives funktionieren nur im FXServer.')}
async function jsRun(code){
 runner?.terminate?.();const c=String(code);
 const source=`const output=[];console.log=(...a)=>output.push(a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' '));console.error=console.log;try{${c}\nself.postMessage({ok:true,out:output.join('\\n')})}catch(e){self.postMessage({ok:false,out:String(e)})}`;
 const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob),w=new Worker(url);runner=w;
 const guard=setTimeout(()=>{w.terminate();msg('Ausführung nach 3 Sekunden abgebrochen.')},3000);
 w.onmessage=e=>{clearTimeout(guard);msg(e.data.out||'Ausgeführt (keine Konsolenausgabe).');w.terminate();URL.revokeObjectURL(url)};
 w.onerror=e=>{clearTimeout(guard);msg('JavaScript Fehler: '+e.message);w.terminate();URL.revokeObjectURL(url)};
}
async function pythonRun(code){
 runner?.terminate?.();
 const workerSource=`importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');let runtime;onmessage=async e=>{try{runtime=runtime||await loadPyodide();runtime.setStdout({batched:s=>postMessage({log:s})});runtime.setStderr({batched:s=>postMessage({log:s})});await runtime.runPythonAsync(e.data);postMessage({done:true})}catch(err){postMessage({error:String(err)})}}`;
 const url=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'})),w=new Worker(url);runner=w;let logs=[];
 msg('Python-Laufzeit wird bei der ersten Ausführung geladen. Internet und zusätzlicher Arbeitsspeicher sind erforderlich.');
 const timeout=setTimeout(()=>{w.terminate();URL.revokeObjectURL(url);msg('Python-Timeout (30 s). Code lokal exportieren und auf dem PC prüfen.')},30000);
 w.onmessage=e=>{if(e.data.log){logs.push(e.data.log);msg(logs.join('\n'))}if(e.data.error||e.data.done){clearTimeout(timeout);msg(logs.join('\n')+(e.data.error?'\n'+e.data.error:'\n✓ Python beendet'));w.terminate();URL.revokeObjectURL(url)}};
 w.onerror=e=>{clearTimeout(timeout);msg('Python nicht verfügbar: '+e.message);w.terminate();URL.revokeObjectURL(url)};w.postMessage(code);
}
async function run(){
 const p=ensure(),name=p.file,code=p.files[name]||'',ext=fileType(name);
 if(ext==='html'||(p.files['index.html']&&['js','css'].includes(ext))||p.files['web/index.html']&&['js','css'].includes(ext)){const html=previewHTML(p);if(html)return showPreview(html)}
 if(ext==='js')return jsRun(code);
 if(ext==='lua'){msg('Starte begrenzten Lua-Übungsrunner …');try{const res=await window.LLMini.run(code);msg(typeof res==='string'?res:JSON.stringify(res,null,2))}catch(e){msg('Lua: '+e.message)}return}
 if(ext==='py')return pythonRun(code);
 if(ext==='html')return showPreview(code);
 msg(editorLanguage(name)+' kann im Handy-Browser nicht vollständig kompiliert werden. Exportiere die Dateien für einen passenden Compiler oder FiveM-Testserver.');
}
async function archive(){
 const p=ensure();
 try{let JSZip=window.JSZip;if(!JSZip){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=res;s.onerror=rej;document.head.append(s)});JSZip=window.JSZip}
  if(!JSZip)throw Error('ZIP-Bibliothek nicht geladen');
  const zip=new JSZip();for(const [name,content]of Object.entries(p.files))zip.file(name,content);
  download(await zip.generateAsync({type:'blob'}),p.name.replace(/[^\w-]/g,'_')+'.zip');msg('Projekt als ZIP exportiert.')
 }catch(e){download(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),p.name+'.json');msg('ZIP offline nicht verfügbar; Projekt als JSON-Backup exportiert.')}
}
function render(container,{state:source,save,userId}={}){
 controller?.abort();controller=new AbortController();root=container;state=source;saveState=save||(()=>{});const p=ensure();
 container.innerHTML=`<div class="eyebrow">LIVERYLAB · CODE STUDIO</div><h1>Build. Code. <em>Ship.</em></h1><p class="text-muted">Mehrere Dateien, eigene Apps und FiveM-Projekte – lokal auf diesem Gerät. Code kann kopiert und als ZIP exportiert werden.</p>
 <div class="llide-toolbar"><label>Projekt<select id="llideProject">${state.projects.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><label>Neues Projekt<select id="llideTemplate"><option value="">+ Vorlage auswählen</option><option value="web">Web-App (HTML, CSS, JS)</option><option value="snake">Snake Browsergame</option><option value="admin">FiveM Adminpanel</option><option value="lua">Lua</option><option value="python">Python</option><option value="js">JavaScript</option></select></label></div>
 <div class="llide-layout"><aside class="llide-files"><div class="llide-files-title">DATEIEN <button data-ide="add-file" title="Neue Datei">＋</button></div>
 ${Object.keys(p.files).map(f=>`<button class="llide-file ${f===p.file?'current':''}" data-ide="file" data-file="${esc(f)}">▤ ${esc(f)}</button>`).join('')}
 <div class="llide-small-actions"><button class="btn small" data-ide="rename-file">Umbenennen</button><button class="btn small danger" data-ide="delete-file">Löschen</button></div></aside>
 <div class="llide-main"><div class="llide-editorhead"><strong>⌘ ${esc(p.file)}</strong><span>${editorLanguage(p.file)} · Lokal</span></div><div class="llide-editwrap"><pre id="llideLines" aria-hidden="true">${Array.from({length:Math.max(5,(p.files[p.file]||'').split('\n').length)},(_,i)=>i+1).join('\n')}</pre><textarea id="llideCode" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" aria-label="Quellcode">${esc(p.files[p.file]||'')}</textarea></div>
 <div class="llide-shortcuts">${['  ','()','{}','[]','""',"''",'=','=>',';',':'].map(x=>`<button type="button" data-ide="insert" data-text="${esc(x)}">${esc(x.trim()||'⇥')}</button>`).join('')}</div>
 <div class="flex llide-actions"><button class="btn primary" data-ide="run">▶ Ausführen / Vorschau</button><button class="btn" data-ide="save">✓ Speichern</button><button class="btn" data-ide="download">↓ Projekt ZIP</button><button class="btn ghost" data-ide="import">↑ Datei importieren</button></div><input hidden id="llideImport" type="file" accept=".lua,.js,.ts,.py,.html,.css,.json,.txt,.cs,.java,.cpp,.xml,.md,.json"><section class="llide-output"><div class="eyebrow">KONSOLE</div><pre id="llideOutput">${esc(output||'Bereit.')}</pre></section><div id="llideFrameBox"></div>
 </div></div><p class="micro">Sandbox-Tests: JavaScript in Worker, HTML/CSS/JS in isolierter Vorschau, einfacher Lua-Runner und optional Python über Pyodide. FiveM/C#/Java/C++ benötigen echte Laufzeiten. Dateien bleiben lokal, solange du sie nicht selbst exportierst.</p>`;
 container.addEventListener('click',click,{signal:controller.signal});
 container.addEventListener('change',change,{signal:controller.signal});
 container.addEventListener('input',input,{signal:controller.signal});
}
function input(e){if(e.target.id!=='llideCode')return;const p=ensure();p.files[p.file]=e.target.value;saveState();const lines=e.target.value.split('\n').length;$('#llideLines',root).textContent=Array.from({length:Math.max(5,lines)},(_,i)=>i+1).join('\n')}
function change(e){
 if(e.target.id==='llideProject'){state.projectId=e.target.value;saveState();render(root,{state,save:saveState})}
 if(e.target.id==='llideTemplate'){const kind=e.target.value;if(kind)newProject(kind)}
 if(e.target.id==='llideImport'){const file=e.target.files?.[0];if(!file)return;if(file.size>1024*1024)return msg('Datei über 1 MB; bitte verkleinern.');file.text().then(code=>{const p=ensure();const filename=file.name.replace(/[/\\]/g,'').slice(0,80);p.files[filename]=code;p.file=filename;saveState();render(root,{state,save:saveState})})}
}
async function click(e){const b=e.target.closest('[data-ide]');if(!b)return;const p=ensure();
 switch(b.dataset.ide){
 case 'file':p.file=b.dataset.file;saveState();render(root,{state,save:saveState});break;
 case 'add-file':{let name=prompt('Dateiname, z.B. client.lua oder style.css');if(!name)return;name=name.trim().replace(/^\/+/,'');if(!/^[a-z0-9_./-]{1,80}$/i.test(name)||name.includes('..'))return msg('Ungültiger Dateiname');if(p.files[name]!==undefined)return msg('Datei existiert bereits');p.files[name]='';p.file=name;saveState();render(root,{state,save:saveState});break}
 case 'rename-file':{let name=prompt('Neuer Dateiname',p.file);if(!name||name===p.file)return;if(!/^[a-z0-9_./-]{1,80}$/i.test(name)||name.includes('..')||p.files[name]!==undefined)return msg('Ungültiger oder belegter Dateiname');p.files[name]=p.files[p.file];delete p.files[p.file];p.file=name;saveState();render(root,{state,save:saveState});break}
 case 'delete-file':if(Object.keys(p.files).length<=1)return msg('Mindestens eine Datei wird benötigt');if(confirm('Datei '+p.file+' wirklich löschen?')){delete p.files[p.file];p.file=Object.keys(p.files)[0];saveState();render(root,{state,save:saveState})}break;
 case 'insert':{const t=$('#llideCode',root),a=t.selectionStart,z=t.selectionEnd;let text=b.dataset.text;t.setRangeText(text,a,z,'end');t.dispatchEvent(new Event('input',{bubbles:true}));t.focus();break}
 case 'save':saveState();msg('✓ Projekt lokal im Browser gespeichert. Für dauerhafte Sicherung ZIP exportieren.');break;
 case 'run':await run();break;
 case 'download':await archive();break;
 case 'import':$('#llideImport',root).click();break;
 }
}
window.LLIDE={render};
})();
