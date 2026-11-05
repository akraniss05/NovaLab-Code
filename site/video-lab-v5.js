
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let root=null,signal=null,video=null,objectURL=null,recorder=null,isExporting=false,raf=null,outputCanvas=null,renderCtx=null,srcFile=null,abort=null;
let project={start:0,end:0,text:'',brightness:100,contrast:100,saturation:100,aspect:'original',textSize:48};
function status(s){const e=root&&$('#llv-status',root);if(e)e.textContent=s}
function duration(){return Number.isFinite(video?.duration)?video.duration:0}
function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0))}
function draw(c,ctx,v,W,H){
 ctx.fillStyle='#05040a';ctx.fillRect(0,0,W,H);
 const vw=v.videoWidth||W,vh=v.videoHeight||H,ratio=Math.min(W/vw,H/vh),w=vw*ratio,h=vh*ratio,x=(W-w)/2,y=(H-h)/2;
 ctx.filter=`brightness(${project.brightness}%) contrast(${project.contrast}%) saturate(${project.saturation}%)`;
 ctx.drawImage(v,x,y,w,h);ctx.filter='none';
 if(project.text){const fontsize=Math.round(Math.max(22,Math.min(W/9,project.textSize*W/640)));ctx.font='800 '+fontsize+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=Math.max(4,fontsize/7);ctx.strokeStyle='#1a102bbb';ctx.strokeText(project.text.slice(0,80),W/2,H*.83,W*.94);ctx.fillStyle='#fff';ctx.fillText(project.text.slice(0,80),W/2,H*.83,W*.94)}
}
function size(){
 const vw=video?.videoWidth||640,vh=video?.videoHeight||360;
 const ratio=project.aspect==='square'?1:project.aspect==='portrait'?9/16:project.aspect==='landscape'?16/9:vw/vh;
 let w=project.aspect==='original'?Math.min(1280,vw):project.aspect==='portrait'?540:project.aspect==='square'?640:960;
 if(w<240)w=640;
 return [Math.round(w),Math.round(w/ratio)]
}
function previewLoop(){
 if(!root||!video||!outputCanvas)return;
 try{const [W,H]=size();if(outputCanvas.width!==W||outputCanvas.height!==H){outputCanvas.width=W;outputCanvas.height=H}draw(outputCanvas,renderCtx,video,W,H)}catch(e){}
 raf=requestAnimationFrame(previewLoop)
}
function update(){
 if(!root)return;
 const a=$('#llv-start',root),b=$('#llv-end',root),info=$('#llv-time',root);
 if(a)a.max=String(duration());if(b)b.max=String(duration());
 if(a)a.value=String(project.start);if(b)b.value=String(project.end);
 if(info)info.textContent=`${project.start.toFixed(1)}s → ${project.end.toFixed(1)}s · ${Math.max(0,project.end-project.start).toFixed(1)}s Clip`;
 if($('#llv-subtitle',root))$('#llv-subtitle',root).textContent=project.text;
 if($('#llv-bright-value',root))$('#llv-bright-value',root).textContent=project.brightness+'%';
 if($('#llv-contrast-value',root))$('#llv-contrast-value',root).textContent=project.contrast+'%';
 if($('#llv-sat-value',root))$('#llv-sat-value',root).textContent=project.saturation+'%';
}
function stop(){
 abort?.abort();abort=null;
 if(raf!==null)cancelAnimationFrame(raf);raf=null;
 try{video?.pause()}catch{}
 if(recorder?.state==='recording'){try{recorder.stop()}catch{}}
 recorder=null;isExporting=false;
 if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;video=null;root=null;outputCanvas=null;renderCtx=null;srcFile=null;
}
function render(node){
 stop();root=node;abort=new AbortController();signal=abort.signal;project={start:0,end:0,text:'',brightness:100,contrast:100,saturation:100,aspect:'original',textSize:48};
 root.innerHTML=`<section class="llv-heading"><div><span class="eyebrow">LIVERYLAB · VIDEO LAB 5.0</span><h1>Dein Film. <em>Dein Schnitt.</em></h1><p>Kurze Clips direkt im Browser zuschneiden, texten, farblich bearbeiten und lokal exportieren. Deine Videodatei wird nicht hochgeladen.</p></div><span class="llv-title-icon">▣</span></section>
 <div class="llv-toolbar"><label class="llv-upload"><input id="llv-import" type="file" accept="video/*">＋ Clip importieren</label><button id="llv-preview" class="btn">▶ Vorschau</button><button id="llv-export" class="btn primary">↓ Video exportieren</button><button id="llv-cancel" class="btn" hidden>■ Export stoppen</button></div>
 <div class="llv-layout"><section class="llv-workspace"><div class="llv-canvas"><canvas id="llv-canvas" width="640" height="360" aria-label="Video-Vorschau"></canvas><video id="llv-video" playsinline preload="metadata" hidden></video><div class="llv-watermark">LIVERYLAB VIDEO</div></div><div class="llv-transport"><button id="llv-play" class="btn">▶</button><span id="llv-pos">0:00</span><input id="llv-seek" type="range" min="0" max="1" step=".1" value="0" aria-label="Video-Position"><span id="llv-dur">0:00</span></div><div class="llv-timeline"><div class="eyebrow">TIMELINE / CLIP 01</div><div class="llv-timeline-track" id="llv-track"><span>VIDEO + AUDIO</span><span id="llv-time">Bitte importieren</span></div><div class="llv-range"><label>Clip-Beginn<input id="llv-start" type="range" min="0" max="1" step=".1" value="0"></label><label>Clip-Ende<input id="llv-end" type="range" min="0" max="1" step=".1" value="0"></label></div></div></section>
 <aside class="llv-inspector"><h3>Clip-Eigenschaften</h3><div class="llv-setup"><label>Text einblenden<input id="llv-text" type="text" maxlength="80" class="input" placeholder="Mein Video ..."></label><label>Format<select id="llv-aspect"><option value="original">Original</option><option value="landscape">16:9</option><option value="square">1:1 · PRO</option><option value="portrait">9:16 · PRO</option></select></label><label>Helligkeit <small id="llv-bright-value">100%</small><input id="llv-bright" type="range" min="50" max="150" value="100"></label><label>Kontrast <small id="llv-contrast-value">100%</small><input id="llv-contrast" type="range" min="50" max="150" value="100"></label><label>Sättigung <small id="llv-sat-value">100%</small><input id="llv-sat" type="range" min="0" max="200" value="100"></label></div><div class="llv-tool-note">Free: Clips schneiden, Text und einfache Vorschau, 2 Exporte pro Tag. Pro: weitere Formate, Farbkorrektur und unbegrenzte Exporte (soweit Browser unterstützt).</div></aside></div><div id="llv-status" class="callout" role="status">Bereit. Wähle ein Video von deinem Gerät (maximal 150 MB).</div>`;
 video=$('#llv-video',root);outputCanvas=$('#llv-canvas',root);renderCtx=outputCanvas.getContext('2d');
 if(!renderCtx)return status('Canvas nicht verfügbar');
 root.addEventListener('input',input,{signal});root.addEventListener('change',change,{signal});
 $('#llv-preview',root).onclick=$('#llv-play',root).onclick=()=>toggle();
 $('#llv-export',root).onclick=()=>exportVideo();
 $('#llv-cancel',root).onclick=()=>stopExport('Export abgebrochen');
 $('#llv-import',root).onchange=async e=>{
  const f=e.target.files?.[0];if(!f)return;if(f.size>150e6)return status('Die Datei ist zu groß. Maximal 150 MB.');
  if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(f);srcFile=f;video.src=objectURL;
  try{await new Promise((res,rej)=>{video.onloadedmetadata=res;video.onerror=()=>rej(new Error('Format nicht lesbar'))});
   project.start=0;project.end=duration();$('#llv-seek',root).max=String(duration());$('#llv-dur',root).textContent=time(duration());update();previewLoop();status('Clip geladen: '+f.name);
  }catch(err){status('Datei konnte nicht gelesen werden: '+err.message)}
 };
 video.ontimeupdate=()=>{if(!root)return;$('#llv-pos',root).textContent=time(video.currentTime);$('#llv-seek',root).value=String(video.currentTime);if(!isExporting&&video.currentTime>=project.end&&project.end>0)video.pause()};
}
const time=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function input(e){
 if(!root)return;const id=e.target.id,n=Number(e.target.value);
 if(id==='llv-seek'&&video){video.currentTime=clamp(n,0,duration());return}
 if(id==='llv-start'){project.start=Math.min(n,Math.max(0,project.end-.2));if(video)video.currentTime=project.start}
 if(id==='llv-end')project.end=Math.max(n,Math.min(duration(),project.start+.2));
 if(id==='llv-text')project.text=e.target.value.slice(0,80);
 if(id==='llv-bright')project.brightness=n;
 if(id==='llv-contrast')project.contrast=n;
 if(id==='llv-sat')project.saturation=n;
 update();
}
async function change(e){
 if(e.target.id==='llv-aspect'){if(['portrait','square'].includes(e.target.value)){
  const g=await LLPro.use('video_advanced');if(!g.allowed){status(g.reason);e.target.value=project.aspect;return}
 }
 project.aspect=e.target.value;return}
 if(['llv-bright','llv-contrast','llv-sat'].includes(e.target.id)&&Number(e.target.value)!==100){const g=await LLPro.use('video_advanced');if(!g.allowed){status(g.reason);project[e.target.id==='llv-bright'?'brightness':e.target.id==='llv-contrast'?'contrast':'saturation']=100;e.target.value=100;update()}}
}
async function toggle(){
 if(!srcFile)return status('Bitte zuerst ein Video importieren');
 try{if(video.paused){if(video.currentTime<project.start||video.currentTime>=project.end)video.currentTime=project.start;await video.play();$('#llv-play',root).textContent='Ⅱ'}else{video.pause();$('#llv-play',root).textContent='▶'}}catch(e){status(e.message)}
}
let currentStream=null,recorded=[];
function stopExport(message){
 if(!isExporting)return;
 isExporting=false;
 try{video?.pause()}catch{}
 if(raf!==null)cancelAnimationFrame(raf);raf=null;
 if(recorder?.state==='recording')recorder.stop();
 else currentStream?.getTracks().forEach(t=>t.stop());
 if(root){$('#llv-export',root).disabled=false;$('#llv-cancel',root).hidden=true;if(message)status(message)}
}
async function exportVideo(){
 if(!srcFile)return status('Bitte zuerst ein Video importieren');
 if(isExporting)return;
 if(!window.MediaRecorder||!outputCanvas.captureStream)return status('Dein Browser unterstützt diesen Videoexport nicht. Versuche Safari/Chrome mit aktuellem System.');
 if(project.end-project.start<.2)return status('Clip muss mindestens 0,2 Sekunden lang sein.');
 const formats=['video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];const mime=formats.find(x=>MediaRecorder.isTypeSupported(x));if(!mime)return status('Kein unterstütztes Videoformat verfügbar.');
 const gate=await LLPro.use('video_export');if(!gate.allowed)return status(gate.reason);
 try{
  isExporting=true;recorded=[];$('#llv-export',root).disabled=true;$('#llv-cancel',root).hidden=false;
  const stream=outputCanvas.captureStream(30);currentStream=stream;
  // Video without audio fallback when a browser does not allow the audio graph.
  try{
   const audio=new (window.AudioContext||window.webkitAudioContext)(),source=audio.createMediaElementSource(video),destination=audio.createMediaStreamDestination();
   source.connect(destination);source.connect(audio.destination);await audio.resume();
   destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));video._llAudio=audio;
  }catch(e){status('Hinweis: Browser kann Audio beim Export eventuell nicht einbinden.')}
  recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});
  recorder.ondataavailable=e=>{if(e.data?.size)recorded.push(e.data)};
  recorder.onerror=e=>status('Exportfehler: '+(e.error?.message||'MediaRecorder'));
  recorder.onstop=()=>{
   const blob=new Blob(recorded,{type:mime});if(blob.size){const link=URL.createObjectURL(blob),a=document.createElement('a');a.href=link;a.download='LiveryLab-Clip.'+(mime.includes('mp4')?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(link),20000);status('Clip lokal exportiert ('+Math.round(blob.size/1024)+' KB).')}else status('Keine Videodaten erstellt.');
   stream.getTracks().forEach(t=>t.stop());video?._llAudio?.close?.();currentStream=null;recorder=null;
  };
  video.pause();video.currentTime=project.start;
  await new Promise(res=>video.addEventListener('seeked',res,{once:true}));
  recorder.start(250);await video.play();
  const check=()=>{if(!isExporting)return;if(video.currentTime>=project.end||video.ended)stopExport();else requestAnimationFrame(check)};requestAnimationFrame(check);
  status('Export läuft in Echtzeit – Seite geöffnet lassen. '+mime);
 }catch(err){stopExport();status('Export fehlgeschlagen: '+err.message)}
}
window.LLVideoLab={render,stop};
})();
