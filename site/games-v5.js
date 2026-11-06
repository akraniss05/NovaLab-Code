
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
let abort=null,raf=null,tick=null,canvas=null,context=null,game='',state=null,root=null;
function teardown(){abort?.abort();abort=null;if(raf)cancelAnimationFrame(raf);raf=null;if(tick)clearInterval(tick);tick=null;state=null;canvas=null;context=null;root=null}
function render(node,mode,{onBack,onCode}={}){
 teardown();root=node;game=mode;abort=new AbortController();const signal=abort.signal;
 node.innerHTML=`<div class="eyebrow">LIVERYLAB · PLAY & CODE</div><h1>${mode==='snake'?'Snake 🐍':mode==='pong'?'Pong 🏓':'Memory 🧠'}</h1><p class="text-muted">Ein echtes Browsergame mit funktionierender Eingabe. Spiele zuerst und öffne danach den Code Studio, um eine eigene Version zu programmieren.</p><div class="flex"><button id="llg-back" class="btn">← Training</button><button id="llg-code" class="btn primary">⌘ Selber programmieren</button><button id="llg-restart" class="btn">↻ Neustart</button></div><div class="llg-stage">${mode==='memory'?'<div id="llg-memory" class="llg-memory"></div>':'<canvas id="llg-canvas" width="360" height="300" tabindex="0" aria-label="Spielbereich"></canvas>'}<p id="llg-score" role="status">Score: 0</p></div>${mode==='memory'?'':'<div class="llg-controls"><button data-dir="left">◀</button><button data-dir="up">▲</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div>'}<p class="micro">Touch-Buttons, Maus oder Pfeiltasten benutzen. Die Spiele laufen lokal und senden keine Score-Daten an die Rangliste.</p>`;
 $('#llg-back',node).addEventListener('click',onBack,{signal});$('#llg-code',node).addEventListener('click',onCode,{signal});$('#llg-restart',node).addEventListener('click',()=>start(),{signal});
 if(mode!=='memory'){
  canvas=$('#llg-canvas',node);context=canvas.getContext('2d');
  if(!context){$('#llg-score',node).textContent='Canvas ist nicht verfügbar';return}
  node.querySelectorAll('[data-dir]').forEach(btn=>btn.addEventListener('pointerdown',e=>{e.preventDefault();move(btn.dataset.dir)},{signal}));
  document.addEventListener('keydown',e=>{const dir={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(dir){e.preventDefault();move(dir)}},{signal});
  if(mode==='pong')canvas.addEventListener('pointermove',e=>{if(!state)return;const rect=canvas.getBoundingClientRect();state.paddle=Math.min(300,Math.max(0,(e.clientX-rect.left)/rect.width*360-30))},{signal});
 }
 start();
}
function start(){
 if(tick)clearInterval(tick);tick=null;if(raf)cancelAnimationFrame(raf);raf=null;
 if(game==='snake'){
  state={snake:[{x:8,y:7},{x:7,y:7}],direction:{x:1,y:0},nextDirection:{x:1,y:0},food:{x:4,y:3},score:0,over:false,won:false};
  tick=setInterval(()=>{if(!state?.over)snakeStep();drawSnake()},155);drawSnake();
 }else if(game==='pong'){
  state={ball:{x:180,y:100,vx:115,vy:145},paddle:150,cpu:150,user:0,bot:0,last:performance.now()};
  const loop=now=>{if(!state)return;const delta=Math.min(.035,(now-state.last)/1000);state.last=now;pongStep(delta);drawPong();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
 }else if(game==='memory'){const icons=['🎛','🖥','🎸','🐍','💻','🎮','🎹','🎵'];const cards=[...icons,...icons].sort(()=>Math.random()-.5);state={cards,flipped:[],matched:[],moves:0,busy:false};drawMemory();}
}
function move(dir){
 if(!state)return;
 if(game==='snake'){
  const d={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}}[dir];
  if(d.x!==-state.direction.x||d.y!==-state.direction.y)state.nextDirection=d;
 }else if(game==='pong'){if(dir==='left')state.paddle=Math.max(0,state.paddle-35);if(dir==='right')state.paddle=Math.min(300,state.paddle+35)}
}
function spawn(){
 const vacant=[];for(let x=0;x<18;x++)for(let y=0;y<15;y++)if(!state.snake.some(p=>p.x===x&&p.y===y))vacant.push({x,y});
 if(!vacant.length){state.over=true;state.won=true;return}state.food=vacant[Math.floor(Math.random()*vacant.length)];
}
function snakeStep(){
 const s=state;s.direction=s.nextDirection;
 const head={x:s.snake[0].x+s.direction.x,y:s.snake[0].y+s.direction.y};
 const eat=head.x===s.food.x&&head.y===s.food.y;
 const body=eat?s.snake:s.snake.slice(0,-1);
 if(head.x<0||head.y<0||head.x>=18||head.y>=15||body.some(p=>p.x===head.x&&p.y===head.y)){s.over=true;return}
 s.snake.unshift(head);if(eat){s.score+=10;spawn()}else s.snake.pop();
}
function drawSnake(){
 const s=state,c=context;c.fillStyle='#151027';c.fillRect(0,0,360,300);
 c.strokeStyle='#392d4a';for(let x=0;x<360;x+=20)for(let y=0;y<300;y+=20)c.strokeRect(x,y,20,20);
 c.fillStyle='#c75fff';s.snake.forEach(p=>c.fillRect(p.x*20+2,p.y*20+2,16,16));
 c.fillStyle='#50e0aa';c.fillRect(s.food.x*20+3,s.food.y*20+3,14,14);
 if(s.over){c.fillStyle='#0b0618dd';c.fillRect(0,0,360,300);c.fillStyle='white';c.textAlign='center';c.font='bold 25px system-ui';c.fillText(s.won?'GEWONNEN!':'GAME OVER',180,136);c.font='15px system-ui';c.fillText('↻ Neustart drücken',180,165)}
 $('#llg-score',root).textContent='Snake · '+s.score+' Punkte';
}
function pongStep(dt){
 const s=state,b=s.ball;
 b.x+=b.vx*dt;b.y+=b.vy*dt;
 if(b.x<10){b.x=10;b.vx=Math.abs(b.vx)}if(b.x>350){b.x=350;b.vx=-Math.abs(b.vx)}
 if(b.y<20){if(b.x>=s.cpu-12&&b.x<=s.cpu+72){b.y=20;b.vy=Math.abs(b.vy)}else{ s.user++;resetBall()}}
 if(b.y>280){if(b.x>=s.paddle-12&&b.x<=s.paddle+72){b.y=280;b.vy=-Math.abs(b.vy);b.vx+=((b.x-s.paddle-30)/30)*35}else{s.bot++;resetBall()}}
 s.cpu=Math.max(0,Math.min(300,s.cpu+(b.x-(s.cpu+30))*dt*2.8));
 function resetBall(){s.ball={x:180,y:150,vx:(Math.random()>.5?1:-1)*110,vy:(Math.random()>.5?1:-1)*150}}
}
function drawPong(){
 const s=state,c=context;c.fillStyle='#151027';c.fillRect(0,0,360,300);c.fillStyle='#4b365f';c.fillRect(178,0,4,300);
 c.fillStyle='#c35aff';c.fillRect(s.paddle,286,60,9);c.fillStyle='#58e5cc';c.fillRect(s.cpu,7,60,9);
 c.fillStyle='#fff';c.beginPath();c.arc(s.ball.x,s.ball.y,8,0,Math.PI*2);c.fill();
 $('#llg-score',root).textContent='Pong · Du '+s.user+' : '+s.bot+' Bot';
}
function drawMemory(){
 const node=$('#llg-memory',root);
 node.innerHTML=state.cards.map((v,i)=>`<button class="llg-card ${state.matched.includes(i)?'matched':''}" data-memory="${i}">${state.flipped.includes(i)||state.matched.includes(i)?v:'?'}</button>`).join('');
 $('#llg-score',root).textContent=`Memory · ${state.matched.length/2}/8 Paare · ${state.moves} Züge`;
 node.querySelectorAll('[data-memory]').forEach(b=>b.addEventListener('click',()=>{
  if(!state||state.busy)return;
  const i=+b.dataset.memory;if(state.flipped.includes(i)||state.matched.includes(i))return;
  state.flipped.push(i);drawMemory();
  if(state.flipped.length===2){state.moves++;const[a,z]=state.flipped;if(state.cards[a]===state.cards[z]){state.matched.push(a,z);state.flipped=[];drawMemory();if(state.matched.length===16)$('#llg-score',root).textContent+=' · Gewonnen!'}else{state.busy=true;const round=state;setTimeout(()=>{if(state===round){state.flipped=[];state.busy=false;drawMemory()}},650)}}
 },{signal:abort.signal}));
}
window.LLGames={render,stop:teardown};
})();
