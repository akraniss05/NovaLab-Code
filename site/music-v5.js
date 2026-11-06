
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names=['Kick','Snare','Hi-Hat','Bass','Synth','Clap','Open Hat','Perc'],packs={
 hardtekk:{bpm:174,steps:[[0,4,8,12],[4,12],[2,6,10,14],[2,6,10,14],[0,5,8,13],[4,12],[3,11],[7,15]]},
 techno:{bpm:136,steps:[[0,4,8,12],[4,12],[2,6,10,14],[0,7,8,15],[0,8],[4,12],[2,10],[3,11]]},
 house:{bpm:125,steps:[[0,4,8,12],[4,12],[2,6,10,14],[2,6,10,14],[0,4,8,12],[4,12],[2,10],[7,15]]},
 hiphop:{bpm:92,steps:[[0,7,10],[4,12],[2,4,6,10,12,14],[0,6,8,13],[0,7,12],[4,12],[6,14],[3,10]]},
 dnb:{bpm:174,steps:[[0,10],[4,12],[0,2,4,6,8,10,12,14],[0,3,8,11],[0,7,10],[4,12],[6,14],[2,9]]}};
let root,uid,proj,tab='seq',ctx,master,timer,step=0,bar=0,next=0,active=false,abort,sample=null,sampleSrc=null;
const key=()=>`liverylab:music-v5:${uid}`;
const blank=()=>Array.from({length:8},()=>Array(16).fill(false));
function make(genre='hardtekk'){
 const pk=packs[genre];
 return {name:'Mein erster Track',genre,bpm:pk.bpm,activePattern:'A',patterns:Object.fromEntries('ABCD'.split('').map((id,i)=>[id,i===0?pk.steps.map(v=>Array.from({length:16},(_,x)=>v.includes(x))):blank()])),bars:['A','A','B','A'],trackVol:Array(8).fill(.65),trackMute:Array(8).fill(false),fx:{cutoff:8500,delay:0,master:.75},synthPitch:0};
}
function safe(x){
 if(!x||!x.patterns)return make();
 const p=make(packs[x.genre]?x.genre:'hardtekk');
 p.name=String(x.name||p.name).slice(0,70);p.bpm=Math.max(70,Math.min(220,+x.bpm||p.bpm));
 for(const id of 'ABCD')if(Array.isArray(x.patterns[id])&&x.patterns[id].length===8&&x.patterns[id].every(a=>Array.isArray(a)&&a.length===16))p.patterns[id]=x.patterns[id].map(a=>a.map(Boolean));
 if(Array.isArray(x.bars))p.bars=x.bars.filter(a=>'ABCD'.includes(a)).slice(0,16);if(!p.bars.length)p.bars=['A'];
 if(Array.isArray(x.trackVol))p.trackVol=x.trackVol.slice(0,8).map(n=>Math.max(0,Math.min(1,+n||0)));
 if(Array.isArray(x.trackMute))p.trackMute=x.trackMute.slice(0,8).map(Boolean);
 p.activePattern='ABCD'.includes(x.activePattern)?x.activePattern:'A';p.fx={...p.fx,...(x.fx||{})};p.synthPitch=Math.max(-12,Math.min(12,+x.synthPitch||0));return p;
}
function save(){try{localStorage.setItem(key(),JSON.stringify(proj))}catch{report('Speicherlimit erreicht – bitte Projekt als JSON exportieren.')}}
function load(){try{return safe(JSON.parse(localStorage.getItem(key())))}catch{return make()}}
function report(m){const e=root&&$('#llm-status',root);if(e)e.textContent=m}
function dl(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),12000)}
function isPro(){return !!window.LLPro?.isPro}
function noise(c,d){const b=c.createBuffer(1,Math.ceil(d*c.sampleRate),c.sampleRate),arr=b.getChannelData(0);for(let i=0;i<arr.length;i++)arr[i]=Math.random()*2-1;return b}
function sound(c,dest,type,time,volume,pitch){
 const g=c.createGain();g.connect(dest);const hz=65*Math.pow(2,pitch/12);
 if([0,3,4].includes(type)){
  const osc=c.createOscillator(),filter=c.createBiquadFilter(),dur=type===0?.26:type===3?.27:.38;
  osc.type=type===0?'sine':type===3?'sawtooth':'triangle';
  osc.frequency.setValueAtTime(type===0?150:hz*(type===4?4:1),time);
  if(type===0)osc.frequency.exponentialRampToValueAtTime(45,time+.23);
  else osc.frequency.setValueAtTime(hz*(type===4?4:1),time);
  filter.type='lowpass';filter.frequency.value=type===0?750:type===3?240:2600;
  osc.connect(filter);filter.connect(g);
  g.gain.setValueAtTime(Math.max(.001,volume*(type===0?.95:type===3?.35:.24)),time);
  g.gain.exponentialRampToValueAtTime(.001,time+dur);
  osc.start(time);osc.stop(time+dur+.02);
 }else{
  const s=c.createBufferSource(),f=c.createBiquadFilter(),dur=type===2?.075:type===6?.22:.15;
  s.buffer=noise(c,dur+.03);f.type=[2,6].includes(type)?'highpass':'bandpass';f.frequency.value=type===2?9000:type===6?6000:type===5?2200:1600;
  s.connect(f);f.connect(g);g.gain.setValueAtTime(Math.max(.001,volume*(type===2?.1:type===6?.12:.36)),time);g.gain.exponentialRampToValueAtTime(.001,time+dur);s.start(time);s.stop(time+dur+.02);
 }
}
function graph(c){
 const gain=c.createGain(),filter=c.createBiquadFilter(),compress=c.createDynamicsCompressor(),out=c.createGain();
 filter.type='lowpass';filter.frequency.value=isPro()?+proj.fx.cutoff:18000;
 gain.connect(filter);filter.connect(compress);compress.threshold.value=-9;compress.ratio.value=2.5;
 compress.connect(out);out.gain.value=+proj.fx.master||.7;out.connect(c.destination);
 if(isPro()&&+proj.fx.delay>0){
  const delay=c.createDelay(.6),feedback=c.createGain(),wet=c.createGain();
  delay.delayTime.value=60/proj.bpm/2;feedback.gain.value=.18;wet.gain.value=+proj.fx.delay;
  filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(compress);
 }
 return gain
}
function schedule(c,dest,id,n,t){
 const p=proj.patterns[id]||proj.patterns.A;
 for(let i=0;i<8;i++)if((isPro()||i<4)&&!proj.trackMute[i]&&p[i][n])sound(c,dest,i,t,proj.trackVol[i],proj.synthPitch);
}
function ensure(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}
function clock(){
 if(!ctx)return;const secs=60/proj.bpm/4;
 while(next<ctx.currentTime+.12){
  const b=bar,n=step,t=next;const selected=proj.bars[b]||'A';
  schedule(ctx,master,selected,n,t);
  setTimeout(()=>{if(active&&root&&$('#llm-position',root)){root.querySelectorAll('.llm-step').forEach(el=>el.classList.toggle('playing',Number(el.dataset.i)===n));root.querySelectorAll('.llm-bar').forEach(el=>el.classList.toggle('playing',Number(el.dataset.bar)===b));$('#llm-position',root).textContent=(b+1)+':'+(n+1)}},Math.max(0,(t-ctx.currentTime)*1000));
  step++;if(step>=16){step=0;bar=(bar+1)%proj.bars.length}next+=secs;
 }
}
function stop(){if(timer)clearInterval(timer);timer=null;active=false;try{sampleSrc?.stop?.()}catch{}sampleSrc=null;try{master?.disconnect()}catch{}master=null;if(root){const b=$('#llm-play',root);if(b)b.textContent='▶ Play';root.querySelectorAll('.llm-step,.llm-bar').forEach(x=>x.classList.remove('playing'))}}
function play(){if(timer){stop();return}const c=ensure();master=graph(c);step=0;bar=0;next=c.currentTime+.07;active=true;timer=setInterval(clock,28);clock();$('#llm-play',root).textContent='■ Stop'}
function wav(b){
 const ch=b.numberOfChannels,frames=b.length,out=new ArrayBuffer(44+frames*ch*2),v=new DataView(out);
 const text=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i))};
 text(0,'RIFF');v.setUint32(4,out.byteLength-8,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,b.sampleRate,true);v.setUint32(28,b.sampleRate*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,frames*ch*2,true);
 const data=Array.from({length:ch},(_,i)=>b.getChannelData(i));let p=44;
 for(let i=0;i<frames;i++)for(let j=0;j<ch;j++){const n=Math.max(-1,Math.min(1,data[j][i]));v.setInt16(p,n<0?n*32768:n*32767,true);p+=2}
 return new Blob([out],{type:'audio/wav'})
}
async function exportWav(){
 const access=await window.LLPro.use('music_wav');if(!access.allowed)return report(access.reason);
 try{report('Track wird als WAV gerendert …');
  const seconds=proj.bars.length*16*60/proj.bpm/4+.8;
  const off=new OfflineAudioContext(2,Math.ceil(seconds*44100),44100),dest=graph(off);
  let t=0;for(const id of proj.bars){for(let n=0;n<16;n++){schedule(off,dest,id,n,t);t+=60/proj.bpm/4}}
  dl(wav(await off.startRendering()),proj.name.replace(/[^\w-]/g,'_')+'-'+proj.bpm+'bpm.wav');report('WAV exportiert (lokal). '+(access.remaining>=0?access.remaining+' Free-Exporte heute übrig.':'Pro: unbegrenzte Nutzung.'));
 }catch(e){report('WAV-Export fehlgeschlagen: '+e.message)}
}
function grid(){
 const limit=isPro()?8:4,p=proj.patterns[proj.activePattern];
 $('#llm-grid',root).innerHTML=names.map((name,i)=>`<div class="llm-track ${i>=limit?'locked':''}"><div class="llm-track-info"><strong>${name} ${i>=4?'✦':''}</strong><label>Vol<input data-mvol="${i}" type="range" min="0" max="1" step=".05" value="${proj.trackVol[i]}" ${i>=limit?'disabled':''}></label><button class="llm-mute ${proj.trackMute[i]?'muted':''}" data-mute="${i}" ${i>=limit?'disabled':''}>${proj.trackMute[i]?'M':'♪'}</button></div><div class="llm-steps">${Array.from({length:16},(_,n)=>`<button aria-label="${name} Schritt ${n+1}" data-step="${i}" data-i="${n}" class="llm-step ${p[i][n]?'on':''} ${n%4===0?'first':''}" ${i>=limit?'disabled':''}></button>`).join('')}</div></div>`).join('');
}
function bars(){
 $('#llm-bars',root).innerHTML=proj.bars.map((id,i)=>`<button class="llm-bar" data-bar="${i}"><small>Takt ${i+1}</small><b>Pattern ${id}</b></button>`).join('');

}
function render(node,{userId='guest'}={}){
 stop();abort?.abort();abort=new AbortController();root=node;uid=userId;proj=load();
 root.innerHTML=`<div class="eyebrow">LIVERYLAB · MUSIC STUDIO 5.0</div><h1>Dein eigener <em>Sound.</em></h1><p class="text-muted">Mehrspur-Sequencer, Patterns, Timeline, Mixer und ein Audio-Bass-Lab. Eigene Audiodaten bleiben auf deinem Gerät.</p>
 <div class="llm-toolbar"><input id="llm-title" class="input" maxlength="70" value="${esc(proj.name)}" aria-label="Projektname"><select id="llm-genre">${Object.keys(packs).map(x=>`<option value="${x}" ${proj.genre===x?'selected':''}>${({hardtekk:'⚡ Hardtekk',techno:'◉ Techno',house:'♫ House',hiphop:'🎤 Hip-Hop',dnb:'🥁 Drum & Bass'})[x]}</option>`).join('')}</select><button class="btn" data-music5="tap">Tempo tippen</button><label>BPM <b id="llm-bpmvalue">${proj.bpm}</b><input id="llm-bpm" type="range" min="70" max="220" value="${proj.bpm}"></label><button class="btn primary" id="llm-play" data-music5="play">▶ Play</button><button class="btn" data-music5="export">↓ WAV</button><button class="btn" data-music5="save">Speichern</button></div>
 <div class="llm-tabs"><button data-mtab="seq" class="selected">▦ Sequencer</button><button data-mtab="arrange">◫ Arrangement</button><button data-mtab="bass">♬ Audio & Bass</button><button data-mtab="fx">✦ Mixer & Effekte</button></div>
 <section class="llm-pane" id="llm-seq"><div class="llm-panehead"><h2>Drum Machine & Piano</h2><span class="pill" id="llm-position">1:1</span></div><div class="llm-patterns">${'ABCD'.split('').map(x=>`<button data-pattern="${x}" class="${x===proj.activePattern?'on':''}">Pattern ${x}${'CD'.includes(x)?' ✦':''}</button>`).join('')}<button data-music5="copy-pattern">⧉ Kopie → nächste</button></div><div id="llm-grid"></div><p class="micro">Klick auf Steps aktiviert Noten. Free: 4 Spuren und 2 Patterns. ✦ Pro: 8 Spuren, Synth, Percussion und 4 Patterns.</p></section>
 <section class="llm-pane" id="llm-arrange" hidden><h2>Song Arrangement</h2><p class="text-muted">Jeder Block entspricht einem Takt. Tippe auf einen Takt, um zwischen Pattern A/B/C/D zu wechseln.</p><div id="llm-bars" class="llm-arrange"></div><div class="flex"><button class="btn" data-music5="add-bar">＋ Takt hinzufügen</button><button class="btn" data-music5="remove-bar">− Letzten Takt entfernen</button></div><p class="micro">Free: bis 4 Takte. ✦ Pro: bis 16 Takte pro Export (Browser-Leistungsgrenze).</p></section>
 <section class="llm-pane" id="llm-bass" hidden><h2>Audio & Bass Lab</h2><p class="text-muted">Importiere einen eigenen Song und bearbeite ihn mit einem Low-Shelf-EQ und sanftem Kompressor. Für einen vollständigen Mehrspur-Mix brauchst du eine DAW.</p><label>Eigene Datei (bis 25 MB)<input id="llm-file" type="file" accept="audio/*"></label><p class="micro" id="llm-filename">Noch kein Audio geladen</p><div class="llm-effect-controls"><label>Bass <span id="llm-bassvalue">0 dB</span><input id="llm-bassgain" type="range" min="-12" max="12" value="0"></label><label>Frequenz <span id="llm-freqvalue">110 Hz</span><input id="llm-bassfreq" type="range" min="50" max="260" value="110"></label></div><div class="flex"><button class="btn primary" data-music5="preview">▶ Vorschau</button><button class="btn" data-music5="stop-preview">■ Stopp</button><button class="btn" data-music5="bass-export">↓ WAV-Export</button></div></section>
 <section class="llm-pane" id="llm-fx" hidden><h2>Mixer & Effekte</h2><div class="llm-effect-controls"><label>Master-Lautstärke <input id="llm-master" type="range" min=".1" max=".9" step=".05" value="${proj.fx.master}"></label><label>Lowpass ✦ Pro <b id="llm-cutval">${proj.fx.cutoff} Hz</b><input id="llm-cutoff" type="range" min="300" max="18000" step="100" value="${proj.fx.cutoff}"></label><label>Delay ✦ Pro <b id="llm-delayval">${Math.round(proj.fx.delay*100)}%</b><input id="llm-delay" type="range" min="0" max=".55" step=".05" value="${proj.fx.delay}"></label><label>Synth Pitch ✦ Pro <b id="llm-pitchval">${proj.synthPitch} st</b><input id="llm-pitch" type="range" min="-12" max="12" step="1" value="${proj.synthPitch}"></label></div><p class="micro">Pro Effekte werden nur nach Freischaltung übernommen. Bei Free bleibt der Master-Regler aktiv.</p></section>
 <div id="llm-status" class="callout" role="status">Bereit. Beats und EQ werden lokal im Browser berechnet.</div><div class="v5-plans-note">Free hat die wichtigsten Lernfunktionen. Pro erweitert Spuren, Patterns, Instrumente, Effekte und Exportlimits. Admins können Pro pro Konto vergeben.</div>`;
 grid();bars();
 node.addEventListener('click',click,{signal:abort.signal});node.addEventListener('input',input,{signal:abort.signal});node.addEventListener('change',change,{signal:abort.signal});
}
let lastTap=0;
async function click(e){
 const b=e.target.closest('[data-step],[data-mute],[data-pattern],[data-bar],[data-mtab],[data-music5]');if(!b||!root?.contains(b))return;
 if(b.dataset.step!==undefined){const i=+b.dataset.step,n=+b.dataset.i;proj.patterns[proj.activePattern][i][n]=!proj.patterns[proj.activePattern][i][n];b.classList.toggle('on');save();return}
 if(b.dataset.mute!==undefined){const i=+b.dataset.mute;proj.trackMute[i]=!proj.trackMute[i];b.textContent=proj.trackMute[i]?'M':'♪';b.classList.toggle('muted',proj.trackMute[i]);save();return}
 if(b.dataset.pattern){const id=b.dataset.pattern;if('CD'.includes(id)){const g=await LLPro.use('music_multitrack');if(!g.allowed)return report(g.reason)}proj.activePattern=id;root.querySelectorAll('[data-pattern]').forEach(x=>x.classList.toggle('on',x.dataset.pattern===id));grid();save();return}
 if(b.dataset.bar!==undefined){const i=+b.dataset.bar,opts=isPro()?'ABCD':'AB';proj.bars[i]=opts[(opts.indexOf(proj.bars[i])+1)%opts.length];bars();save();return}
 if(b.dataset.mtab){tab=b.dataset.mtab;root.querySelectorAll('.llm-pane').forEach(x=>x.hidden=x.id!=='llm-'+tab);root.querySelectorAll('[data-mtab]').forEach(x=>x.classList.toggle('selected',x.dataset.mtab===tab));return}
 const action=b.dataset.music5;
 if(action==='tap'){
  const now=performance.now(), interval=now-lastTap;
  if(lastTap&&interval>=260&&interval<=900){
   const slider=$('#llm-bpm',root);
   slider.value=String(Math.round(60000/interval));
   slider.dispatchEvent(new Event('input',{bubbles:true}));
  }else report('Tippe noch einmal im Rhythmus.');
  lastTap=now;return;
 }
 if(action==='play')return play();
 if(action==='save'){save();return report('Projekt im Browser gespeichert. Für ein dauerhaftes Backup nutze Export oder WAV.')}
 if(action==='export')return exportWav();
 if(action==='add-bar'){if(proj.bars.length>=(isPro()?16:4))return report('Taktlimit erreicht. Pro bietet bis zu 16 Takte pro Export.');proj.bars.push(proj.activePattern);bars();save();return}
 if(action==='remove-bar'){if(proj.bars.length>1){proj.bars.pop();bars();save()}return}
 if(action==='copy-pattern'){const current=proj.activePattern,nextId='ABCD'[('ABCD'.indexOf(current)+1)%4];if('CD'.includes(nextId)){const g=await LLPro.use('music_multitrack');if(!g.allowed)return report(g.reason)}proj.patterns[nextId]=proj.patterns[current].map(x=>[...x]);proj.activePattern=nextId;save();render(root,{userId:uid});return}
 if(action==='stop-preview'){sampleSrc?.stop?.();sampleSrc=null;return}
 if(action==='preview'||action==='bass-export'){
  if(!sample)return report('Bitte zuerst eine eigene Audiodatei laden.');
  const bass=+$('#llm-bassgain',root).value,frequency=+$('#llm-bassfreq',root).value;
  const draw=(c,src)=>{const filter=c.createBiquadFilter(),comp=c.createDynamicsCompressor(),gain=c.createGain();filter.type='lowshelf';filter.frequency.value=frequency;filter.gain.value=bass;comp.threshold.value=-12;comp.ratio.value=2.5;gain.gain.value=.7;src.connect(filter);filter.connect(comp);comp.connect(gain);gain.connect(c.destination)};
  try{
   if(action==='preview'){try{sampleSrc?.stop?.()}catch{}const c=ensure(),s=c.createBufferSource();s.buffer=sample;draw(c,s);s.start();sampleSrc=s;return report('Vorschau läuft')}
   const gate=await LLPro.use('music_wav');if(!gate.allowed)return report(gate.reason);
   report('Audio wird lokal bearbeitet …');const off=new OfflineAudioContext(Math.min(2,sample.numberOfChannels),Math.ceil(sample.duration*44100),44100),s=off.createBufferSource();s.buffer=sample;draw(off,s);s.start();dl(wav(await off.startRendering()),'LiveryLab-Bass-Edit.wav');report('Bass-WAV exportiert.');
  }catch(err){report('Audio: '+err.message)}
 }
}
async function input(e){
 const t=e.target;
 if(t.id==='llm-bpm'){proj.bpm=+t.value;$('#llm-bpmvalue',root).textContent=proj.bpm;save();return}
 if(t.dataset.mvol!==undefined){proj.trackVol[+t.dataset.mvol]=+t.value;save();return}
 if(t.id==='llm-title'){proj.name=t.value.slice(0,70);save();return}
 if(t.id==='llm-master'){proj.fx.master=+t.value;save();return}
 if(t.id==='llm-bassgain'){$('#llm-bassvalue',root).textContent=t.value+' dB';return}
 if(t.id==='llm-bassfreq'){$('#llm-freqvalue',root).textContent=t.value+' Hz';return}
 if(['llm-cutoff','llm-delay','llm-pitch'].includes(t.id)){$('#'+({ 'llm-cutoff':'llm-cutval','llm-delay':'llm-delayval','llm-pitch':'llm-pitchval'})[t.id],root).textContent=t.id==='llm-cutoff'?t.value+' Hz':t.id==='llm-delay'?Math.round(t.value*100)+'%':t.value+' st'}
}
async function change(e){
 const t=e.target;
 if(t.id==='llm-genre'){if(!confirm('Genre-Vorlage laden? Alle aktuellen Steps werden ersetzt.')){t.value=proj.genre;return}stop();proj=make(t.value);save();render(root,{userId:uid});return}
 if(['llm-cutoff','llm-delay','llm-pitch'].includes(t.id)){
  const gate=await LLPro.use('music_advanced_fx');if(!gate.allowed){report(gate.reason);render(root,{userId:uid});return}
  if(t.id==='llm-pitch')proj.synthPitch=+t.value;
  else proj.fx[t.id==='llm-cutoff'?'cutoff':'delay']=+t.value;save();
 }
 if(t.id==='llm-file'){const file=t.files?.[0];if(!file)return;if(file.size>25e6)return report('Maximal 25 MB.');try{sample=await ensure().decodeAudioData((await file.arrayBuffer()).slice(0));$('#llm-filename',root).textContent=file.name+' · '+Math.round(sample.duration)+' s';report('Audio geladen, lokal im Arbeitsspeicher.')}catch(err){report('Datei konnte nicht gelesen werden: '+err.message)}}
}
window.LLMusic.renderStudio=render;window.LLMusic.stop=stop;
})();
