/* LiveryLab Academy · lightweight interactions v48
 * Opt-in Web Audio click sound, optional subtle animated ambient background
 * and button tap halo. No audio assets, tracking, network calls or timers.
 * Made with 💙 by NyxAtheris (LiveryLab Studios)
 */
(function(root){
'use strict';
const preferencePrefix='liverylab-pref-',choicePrefix='liverylab-choice-';
const defaults={animatedBackdrop:true,buttonEffects:true,uiSounds:false};
let audio=null,lastSound=0,overlay=null,ambient=null,initialized=false;
let reduced=false;
const media=typeof root.matchMedia==='function'?root.matchMedia('(prefers-reduced-motion: reduce)'):null;
function read(key){
 try{const saved=root.localStorage?.getItem(preferencePrefix+key);
  return saved==='1'?true:saved==='0'?false:!!defaults[key];
 }catch(_){return !!defaults[key];}
}
function volume(){
 try{const raw=Number(root.localStorage?.getItem(choicePrefix+'soundVolume')??25);
  return Number.isFinite(raw)?Math.min(100,Math.max(0,raw)):25;
 }catch(_){return 25;}
}
function isReduced(){return read('motion')||!!media?.matches;}
function sync(){
 if(!root.document?.body)return;
 reduced=isReduced();
 const running=!reduced&&!root.document.hidden;
 root.document.body.classList.toggle('ll-effects-ambient',running&&read('animatedBackdrop'));
 root.document.body.classList.toggle('ll-effects-buttons',running&&read('buttonEffects'));
 root.document.body.classList.toggle('ll-effects-reduced',reduced);
 const slider=root.document.querySelector('[data-sound-volume]');
 const output=root.document.querySelector('[data-sound-volume-label]');
 if(slider&&slider!==root.document.activeElement)slider.value=String(volume());
 if(output)output.textContent=volume()+'%';
}
function isEligible(target){
 const element=target?.closest?.('button,a[href],summary,[role="button"],[role="tab"]');
 if(!element||element.disabled||element.getAttribute('aria-disabled')==='true')return null;
 if(element.closest?.('[data-no-effects]'))return null;
 if(element.matches?.('input,select,textarea,[contenteditable]'))return null;
 return element;
}
function sound(){
 if(!read('uiSounds')||volume()===0)return false;
 const now=typeof performance!=='undefined'?performance.now():Date.now();
 if(now-lastSound<45)return false;
 lastSound=now;
 try{
  const Audio=root.AudioContext||root.webkitAudioContext;
  if(!Audio)return false;
  if(!audio)audio=new Audio();
  if(audio.state==='suspended'){void audio.resume().catch(()=>{});}
  const start=audio.currentTime;
  const o=audio.createOscillator(),gain=audio.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(560,start);
  o.frequency.exponentialRampToValueAtTime(360,start+.055);
  const maxGain=.045*(volume()/100);
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.linearRampToValueAtTime(Math.max(.0002,maxGain),start+.007);
  gain.gain.exponentialRampToValueAtTime(.0001,start+.075);
  o.connect(gain);gain.connect(audio.destination);
  o.start(start);o.stop(start+.08);
  o.onended=()=>{o.disconnect();gain.disconnect();};
  return true;
 }catch(_){return false;}
}
function impact(x,y){
 if(reduced||!read('buttonEffects')||!overlay||!Number.isFinite(x)||!Number.isFinite(y))return false;
 if(overlay.childElementCount>=12)return false;
 const ring=root.document.createElement('span');
 ring.className='ll-tap-halo';
 ring.style.left=x+'px';ring.style.top=y+'px';
 ring.setAttribute('aria-hidden','true');
 overlay.appendChild(ring);
 ring.addEventListener('animationend',()=>ring.remove(),{once:true});
 // iOS may cancel CSS animation when a page is hidden.
 root.setTimeout(()=>ring.remove(),700);
 return true;
}
function trigger(event){
 const target=isEligible(event.target);
 if(!target)return;
 if(event.type==='pointerdown'&&event.button!==0)return;
 if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
 if(event.type==='keydown'&&event.repeat)return;
 if(event.type==='pointerdown'&&event.pointerType==='mouse'&&event.detail===0)return;
 let x=event.clientX,y=event.clientY;
 if(event.type==='keydown'||!Number.isFinite(x)||!Number.isFinite(y)){
  const r=target.getBoundingClientRect();x=r.left+r.width/2;y=r.top+r.height/2;
 }
 sound();
 impact(x,y);
}
function onVolume(event){
 if(!event.target?.matches?.('[data-sound-volume]'))return;
 let n=Math.round(Number(event.target.value)/5)*5;
 if(!Number.isFinite(n))n=25;
 n=Math.min(100,Math.max(0,n));
 try{root.localStorage?.setItem(choicePrefix+'soundVolume',String(n));}catch(_){}
 const out=root.document.querySelector('[data-sound-volume-label]');if(out)out.textContent=n+'%';
}
function start(){
 if(initialized||!root.document?.body)return;
 initialized=true;
 ambient=root.document.createElement('div');
 ambient.id='ll-ambient-layer';ambient.setAttribute('aria-hidden','true');
 overlay=root.document.createElement('div');
 overlay.id='ll-click-overlay';overlay.setAttribute('aria-hidden','true');
 root.document.body.appendChild(ambient);
 root.document.body.appendChild(overlay);
 root.document.addEventListener('pointerdown',trigger,{passive:true,capture:true});
 root.document.addEventListener('keydown',trigger,{capture:true});
 root.document.addEventListener('input',onVolume);
 root.document.addEventListener('visibilitychange',sync);
 if(media?.addEventListener)media.addEventListener('change',sync);
 else if(media?.addListener)media.addListener(sync);
 sync();
}
if(root.document?.readyState==='loading')root.document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
root.LLEffects={sync,read,volume,impact,sound,start};
})(typeof window==='undefined'?globalThis:window);
