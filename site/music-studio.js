
(()=>{
'use strict';
// LiveryLab original-sound music studio · Made with 💙 by NyxAtheris (LiveryLab)
const el=(id,root=document)=>root.querySelector(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inst=['Kick','Clap','Hi-Hat','Bass'];
const preset={
 hardtekk:{bpm:174,rows:[[0,4,8,12],[4,12],[2,6,10,14],[0,3,7,11]]},
 techno:{bpm:136,rows:[[0,4,8,12],[4,12],[2,6,10,14],[0,6,8,14]]},
 house:{bpm:125,rows:[[0,4,8,12],[4,12],[2,6,10,14],[0,7,8,15]]},
 hiphop:{bpm:92,rows:[[0,7,10],[4,12],[2,4,6,8,10,12,14],[0,6,8,13]]},
 dnb:{bpm:174,rows:[[0,10],[4,12],[0,2,4,6,8,10,12,14],[0,3,7,9,13]]},
 blank:{bpm:140,rows:[[],[],[],[]]}
};
let root=null,key='guest',beats=null,ctx=null,timer=null,step=0,nextTime=0,buffer=null,playingFile=null,controller=null;
function patternFor(k){const p=preset[k];return {preset:k,bpm:p.bpm,vol:.55,rows:p.rows.map(x=>Array.from({length:16},(_,i)=>x.includes(i)))}}
function storeKey(){return 'llmusic4:'+key}
function load(){try{const p=JSON.parse(localStorage.getItem(storeKey()));if(p&&p.rows?.length===4&&p.rows.every(r=>r.length===16))return p}catch{}return patternFor('hardtekk')}
function save(){try{localStorage.setItem(storeKey(),JSON.stringify(beats))}catch{}}
function ac(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();ctx.resume();return ctx}
function noise(c,d){let b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;return b}
function hit(c,d,row,time,volume){
 let amp=c.createGain();amp.connect(d);
 if(row===0||row===3){
   const osc=c.createOscillator(),f=c.createBiquadFilter(),duration=row===0?.28:.32;
   osc.type=row===0?'sine':'sawtooth';osc.frequency.setValueAtTime(row===0?150:60,time);osc.frequency.exponentialRampToValueAtTime(row===0?45:40,time+duration);
   f.type='lowpass';f.frequency.value=row===0?1000:250;osc.connect(f);f.connect(amp);
   amp.gain.setValueAtTime(volume*(row===0?1:.38),time);amp.gain.exponentialRampToValueAtTime(.001,time+duration);
   osc.start(time);osc.stop(time+duration+.02);
 }else{
   const src=c.createBufferSource(),f=c.createBiquadFilter(),dura=row===1?.16:.075;
   src.buffer=noise(c,dura+.02);f.type=row===1?'bandpass':'highpass';f.frequency.value=row===1?1700:7500;
   src.connect(f);f.connect(amp);amp.gain.setValueAtTime(volume*(row===1?.45:.17),time);amp.gain.exponentialRampToValueAtTime(.001,time+dura);src.start(time);src.stop(time+dura+.02);
 }
}
function stop(){if(timer)clearInterval(timer);timer=null;if(playingFile){try{playingFile.stop()}catch{}playingFile=null}if(root){root.querySelectorAll('.llstep').forEach(b=>b.classList.remove('current'));const p=el('#llplay',root);if(p)p.textContent='▶ Abspielen'}}
function schedule(){
 if(!ctx)return;while(nextTime<ctx.currentTime+.12){
   const volume=ctx.createGain();volume.gain.value=Math.min(.75,beats.vol);volume.connect(ctx.destination);
   for(let row=0;row<4;row++)if(beats.rows[row][step])hit(ctx,volume,row,nextTime,.7);
   const at=step,delay=Math.max(0,(nextTime-ctx.currentTime)*1000);
   setTimeout(()=>{if(root)root.querySelectorAll('.llstep').forEach(b=>b.classList.toggle('current',Number(b.dataset.step)===at))},delay);
   step=(step+1)%16;nextTime+=60/(beats.bpm*4);
   setTimeout(()=>volume.disconnect(),550);
 }
}
function play(){if(timer){stop();return}ac();step=0;nextTime=ctx.currentTime+.06;timer=setInterval(schedule,26);schedule();el('#llplay',root).textContent='■ Stoppen'}
function wav(b){const raw=b.getChannelData(0),data=new ArrayBuffer(44+raw.length*2),v=new DataView(data);
 function txt(i,s){for(let j=0;j<s.length;j++)v.setUint8(i+j,s.charCodeAt(j))}
 txt(0,'RIFF');v.setUint32(4,36+raw.length*2,true);txt(8,'WAVE');txt(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,b.sampleRate,true);v.setUint32(28,b.sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);txt(36,'data');v.setUint32(40,raw.length*2,true);
 for(let i=0;i<raw.length;i++){const n=Math.max(-1,Math.min(1,raw[i]));v.setInt16(44+i*2,n<0?n*32768:n*32767,true)}return new Blob([data],{type:'audio/wav'})
}
function download(b,name){const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000)}
async function exportBeat(){const duration=4*16*60/(beats.bpm*4)+.6,c=new OfflineAudioContext(1,Math.ceil(duration*44100),44100),gain=c.createGain();gain.gain.value=Math.min(.75,beats.vol);gain.connect(c.destination);
 for(let bar=0;bar<4;bar++)for(let n=0;n<16;n++)for(let row=0;row<4;row++)if(beats.rows[row][n])hit(c,gain,row,(bar*16+n)*60/(beats.bpm*4),.7);
 download(wav(await c.startRendering()),`LiveryLab-${beats.preset}-${beats.bpm}bpm.wav`);
}
function info(s){const p=root&&el('#llmusicinfo',root);if(p)p.textContent=s}
function renderStudio(container,{userId='guest'}={}){
 stop();controller?.abort();controller=new AbortController();root=container;key=userId;beats=load();
 container.innerHTML=`<div class="eyebrow">LIVERYLAB MUSIC STUDIO</div><h1>Produce your <em>sound.</em></h1><p class="text-muted">Musik direkt auf dem Handy ausprobieren: eigene 16-Step-Beats bauen, Bass in Audiodateien verändern und WAV-Dateien exportieren. Die Dateien verlassen dein Gerät nicht.</p>
 <div class="llmusic-tabs"><button class="selected" data-music="tab" data-target="beat">♫ Beat Lab</button><button data-music="tab" data-target="bass">◉ Bass Lab</button></div>
 <section class="panel" id="llbeat"><div class="llmusic-controls"><label>Genre<select id="llpreset">${Object.keys(preset).map(n=>`<option value="${n}">${({hardtekk:'Hardtekk',techno:'Techno',house:'House',hiphop:'Hip-Hop',dnb:'Drum & Bass',blank:'Leeres Pattern'})[n]}</option>`).join('')}</select></label><label>Tempo <b id="llbpmtext">${beats.bpm} BPM</b><input type="range" id="llbpm" min="65" max="220" value="${beats.bpm}"></label><label>Volume<input type="range" id="llvol" min=".1" max=".75" step=".05" value="${beats.vol}"></label></div>
 <div class="llbeatgrid">${inst.map((name,row)=>`<div class="llbeatrow"><b>${name}</b>${Array.from({length:16},(_,i)=>`<button class="llstep ${beats.rows[row][i]?'active':''} ${i%4===0?'quarter':''}" aria-label="${name} Schritt ${i+1}" aria-pressed="${beats.rows[row][i]}" data-music="step" data-row="${row}" data-step="${i}"></button>`).join('')}</div>`).join('')}</div>
 <div class="flex" style="margin-top:18px"><button class="btn primary" id="llplay" data-music="play">▶ Abspielen</button><button class="btn" data-music="export">↓ WAV exportieren</button><button class="btn ghost" data-music="reset">Leeren</button></div><p class="micro">Kick = Puls · Clap = Backbeat · Hat = Groove · Bass = Tiefe. Nutze Kopfhörer bei moderater Lautstärke.</p></section>
 <section class="panel" id="llbass" hidden><h2>Eigene Audiodatei bearbeiten</h2><p class="text-muted">Lade einen eigenen Song oder Loop lokal. Mit Low-Shelf-EQ und Kompressor lernst du, tiefe Frequenzen kontrolliert zu bearbeiten. Keine Audiodaten werden hochgeladen.</p><label class="form-label">WAV/MP3 laden<input id="llupload" type="file" accept="audio/*"></label><p class="micro" id="llfilename">Noch keine Datei</p>
 <div class="llmusic-controls"><label>Bass ±12 dB <b id="llgaintxt">0 dB</b><input id="llgain" type="range" min="-12" max="12" value="0"></label><label>Frequenz <b id="llfreqtxt">110 Hz</b><input id="llfreq" type="range" min="50" max="260" value="110"></label><label>Output <b id="llouttxt">-2 dB</b><input id="llout" type="range" min="-9" max="0" value="-2"></label></div><div class="flex"><button class="btn primary" data-music="preview">▶ Vorschau</button><button class="btn" data-music="stop">■ Stopp</button><button class="btn" data-music="bass-export">↓ WAV exportieren</button></div></section>
 <div class="callout" id="llmusicinfo" role="status">Bereit. Alle Klänge im Beat Lab sind original synthetisiert.</div>`;
 el('#llpreset',root).value=beats.preset;
 container.addEventListener('click',handleClick,{signal:controller.signal});
 container.addEventListener('input',handleInput,{signal:controller.signal});
 container.addEventListener('change',handleChange,{signal:controller.signal});
}
function bassGraph(c,d,source){const filter=c.createBiquadFilter(),comp=c.createDynamicsCompressor(),gain=c.createGain();filter.type='lowshelf';filter.frequency.value=+el('#llfreq',root).value;filter.gain.value=+el('#llgain',root).value;comp.threshold.value=-13;comp.ratio.value=3;gain.gain.value=Math.pow(10,(+el('#llout',root).value)/20);source.connect(filter);filter.connect(comp);comp.connect(gain);gain.connect(d)}
async function handleClick(e){const b=e.target.closest('[data-music]');if(!b||!root.contains(b))return;try{
 switch(b.dataset.music){
  case 'step':{const r=+b.dataset.row,i=+b.dataset.step;beats.rows[r][i]=!beats.rows[r][i];b.classList.toggle('active',beats.rows[r][i]);b.setAttribute('aria-pressed',String(beats.rows[r][i]));save();break}
  case 'play':play();break;
  case 'stop':stop();break;
  case 'tab':stop();el('#llbeat',root).hidden=b.dataset.target!=='beat';el('#llbass',root).hidden=b.dataset.target!=='bass';root.querySelectorAll('[data-music="tab"]').forEach(t=>t.classList.toggle('selected',t===b));break;
  case 'reset':beats=patternFor('blank');save();renderStudio(root,{userId:key});break;
  case 'export':info('WAV wird berechnet …');await exportBeat();info('WAV-Export abgeschlossen.');break;
  case 'preview':if(!buffer)return info('Lade bitte zuerst deine eigene Audio-Datei.');stop();{const c=ac(),s=c.createBufferSource();s.buffer=buffer;bassGraph(c,c.destination,s);s.start();playingFile=s;info('Vorschau läuft.');break}
  case 'bass-export':if(!buffer)return info('Lade bitte zuerst eine Audio-Datei.');{info('Lokale WAV wird berechnet …');const c=new OfflineAudioContext(1,Math.ceil(buffer.duration*44100),44100),s=c.createBufferSource();s.buffer=buffer;bassGraph(c,c.destination,s);s.start();download(wav(await c.startRendering()),'LiveryLab-Bass-Edit.wav');info('Bearbeitete WAV exportiert; Original unverändert.');break}
 }
}catch(err){info('Fehler: '+err.message)}}
function handleInput(e){if(e.target.id==='llbpm'){beats.bpm=+e.target.value;el('#llbpmtext',root).textContent=beats.bpm+' BPM';save()}
 if(e.target.id==='llvol'){beats.vol=+e.target.value;save()}
 for(const [input,out,unit] of [['llgain','llgaintxt',' dB'],['llfreq','llfreqtxt',' Hz'],['llout','llouttxt',' dB']])if(e.target.id===input)el('#'+out,root).textContent=e.target.value+unit;
}
async function handleChange(e){if(e.target.id==='llpreset'){stop();beats=patternFor(e.target.value);save();renderStudio(root,{userId:key})}
 if(e.target.id==='llupload'){const file=e.target.files?.[0];if(!file)return;if(file.size>50*1024*1024)return info('Maximal 50 MB pro Audiodatei.');try{info('Lade Audio lokal …');buffer=await ac().decodeAudioData((await file.arrayBuffer()).slice(0));el('#llfilename',root).textContent=file.name+' · '+Math.round(buffer.duration)+' Sekunden';info('Audio geladen. Experimentiere mit dem Bass-Regler.')}catch(err){info('Audio konnte nicht gelesen werden: '+err.message)}}}
function renderLesson(node,lesson,course,{onDone,onBack,isDone=false,note='',onNote,onStudio}={}){
 stop();const opts=lesson.options||[];
 const video=null; // External embeds are loaded only after explicit consent in videos-v5.js
 const li=a=>(a||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 node.innerHTML=`<button class="btn ghost small" id="lmBack">← ${esc(course.name)}</button><div class="eyebrow" style="margin-top:20px">MUSIC PRODUCER · ${esc(lesson.level)}</div><h1>${esc(lesson.title)}</h1>
 <section class="panel"><div class="eyebrow">01 / WISSEN</div><p>${esc(lesson.theory)}</p><div class="callout">🎯 ${esc(lesson.goal)}</div><h3>Schritt für Schritt</h3><ol class="steps">${li(lesson.steps)}</ol></section>
 <section class="panel"><div class="eyebrow">02 / PRODUZIEREN</div><h3>Praxisauftrag</h3><p>${esc(lesson.task)}</p><p class="text-muted">${esc(lesson.extra)}</p><div class="callout"><b>Typischer Fehler:</b> ${esc(lesson.mistake)}</div><p class="micro">💡 ${esc(lesson.hint)}</p></section>
 ${video?`<section class="panel"><div class="eyebrow">03 / VIDEO</div><div class="llvideo"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${video}" title="${esc(lesson.title)}" allow="encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><a href="https://www.youtube.com/watch?v=${video}" target="_blank" rel="noopener noreferrer">YouTube-Original öffnen ↗</a></section>`:''}
 <section class="panel"><div class="eyebrow">04 / CHECK</div><strong>${esc(lesson.quiz)}</strong><div class="llanswers">${opts.map((x,i)=>`<button class="quiz-option" data-lm-answer="${i}">${esc(x)}</button>`).join('')}</div><p id="lmFeedback" class="micro" role="status"></p></section>
 <section class="panel"><h3>Deine Produktionsnotizen</h3><textarea class="input" rows="4" id="lmNotes" placeholder="BPM, Preset, Bass, Erkenntnisse …">${esc(note)}</textarea></section>
 <div class="flex"><button class="btn primary" id="lmDone">${isDone?'✓ Abgeschlossen':'✓ Als gelernt markieren'}</button><button class="btn" id="lmStudio">♫ Beat Lab öffnen</button></div>`;
 if(Array.isArray(lesson.rubric)&&lesson.rubric.length){const box=document.createElement('section');box.className='panel';box.innerHTML='<div class="eyebrow">05 / PRODUCER-ABNAHME</div><h3>Woran du echte Fortschritte erkennst</h3><ul class="steps">'+lesson.rubric.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';node.append(box)}el('#lmBack',node).addEventListener('click',onBack);
 el('#lmDone',node).addEventListener('click',onDone);
 el('#lmStudio',node).addEventListener('click',onStudio);
 el('#lmNotes',node).addEventListener('input',e=>onNote?.(e.target.value));
 node.querySelectorAll('[data-lm-answer]').forEach(b=>b.addEventListener('click',()=>{
  const ok=Number(b.dataset.lmAnswer)===(lesson.correct||0);
  el('#lmFeedback',node).textContent=ok?'✓ Richtig! Jetzt praktisch ausprobieren.':'Noch nicht ganz. Lies den Schritt erneut.';
  b.classList.add(ok?'good':'bad');
 }));
}
window.LLMusic={renderStudio,renderLesson,stop};
})();
