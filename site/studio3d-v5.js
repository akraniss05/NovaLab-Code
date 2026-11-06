
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const types=['Cube','Sphere','Cylinder','Plane','Cone','Torus','Icosahedron'],basic=['Cube','Sphere','Cylinder','Plane'];
let root,uid,world,selected,THREE,scene,camera,renderer,controls,models,ro,raf,abort,history=[];
const key=()=>`liverylab3d:${uid}`;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number.isFinite(+x)?+x:0));
function clean(x){return{id:String(x.id||Math.random()).slice(0,50),name:String(x.name||x.type||'Objekt').slice(0,50),type:types.includes(x.type)?x.type:'Cube',pos:(Array.isArray(x.pos)&&x.pos.length===3?x.pos:[0,.7,0]).map(v=>clamp(v,-100,100)).slice(0,3),rot:(Array.isArray(x.rot)&&x.rot.length===3?x.rot:[0,0,0]).map(v=>clamp(v,-6.3,6.3)).slice(0,3),scale:(Array.isArray(x.scale)&&x.scale.length===3?x.scale:[1,1,1]).map(v=>clamp(v,.01,40)).slice(0,3),color:/^#[a-f0-9]{6}$/i.test(x.color)?x.color:'#ba74fa',metallic:clamp(x.metallic||0,0,1),roughness:clamp(x.roughness??.6,.05,1)}}
function fresh(){return {name:'Meine Szene',objects:[clean({type:'Cube',id:'start',name:'Würfel'})]}}
function load(){try{const x=JSON.parse(localStorage.getItem(key()));if(x&&Array.isArray(x.objects)&&x.objects.length<=100)return{name:String(x.name||'Szene').slice(0,60),objects:x.objects.map(clean)}}catch{}return fresh()}
function status(s){if(root&&$('#ll3-status',root))$('#ll3-status',root).textContent=s}
function save(){try{localStorage.setItem(key(),JSON.stringify(world));status('Lokal gespeichert • '+world.objects.length+' Objekte')}catch{status('Speicher voll – bitte Szene exportieren')}}
function snap(){history.push(JSON.stringify(world));if(history.length>25)history.shift()}
function geometry(type){const T=THREE;return type==='Sphere'?new T.SphereGeometry(.7,24,18):type==='Cylinder'?new T.CylinderGeometry(.55,.55,1.2,24):type==='Cone'?new T.ConeGeometry(.65,1.2,24):type==='Torus'?new T.TorusGeometry(.65,.2,12,32):type==='Plane'?new T.BoxGeometry(1.5,.05,1.5):type==='Icosahedron'?new T.IcosahedronGeometry(.7,1):new T.BoxGeometry(1.2,1.2,1.2)}
function sync(){
 if(!models)return;
 for(const m of [...models.children]){models.remove(m);m.geometry.dispose();m.material.dispose()}
 world.objects.forEach(x=>{const m=new THREE.Mesh(geometry(x.type),new THREE.MeshStandardMaterial({color:x.color,metalness:x.metallic,roughness:x.roughness}));m.position.fromArray(x.pos);m.rotation.set(...x.rot);m.scale.fromArray(x.scale);m.userData.id=x.id;models.add(m)});
 for(const m of models.children){m.material.emissive.set(m.userData.id===selected?'#321d53':'#000000')}
}
function inspector(){
 if(!root)return;
 const list=$('#ll3-tree',root),panel=$('#ll3-inspector',root),x=world.objects.find(o=>o.id===selected);
 list.innerHTML=world.objects.map(o=>`<button class="ll3-item ${o.id===selected?'on':''}" data-three="select" data-id="${esc(o.id)}">▧ ${esc(o.name)}<small>${o.type}</small></button>`).join('');
 if(!x){panel.innerHTML='<p class="micro">Wähle ein Objekt in der Szene.</p>';return}
 panel.innerHTML=`<div class="eyebrow">OBJEKT</div><label>Name<input id="ll3-name" class="input" maxlength="50" value="${esc(x.name)}"></label>
 ${[['Position','pos'],['Rotation °','rot'],['Skalierung','scale']].map(([label,p])=>`<div class="ll3-transform"><b>${label}</b><div class="ll3-xyz">${['X','Y','Z'].map((a,i)=>`<label>${a}<input type="number" data-prop="${p}" data-axis="${i}" step=".1" value="${p==='rot'?(x.rot[i]*180/Math.PI).toFixed(1):x[p][i].toFixed(2)}"></label>`).join('')}</div></div>`).join('')}
 <label>Farbe<input type="color" id="ll3-color" value="${x.color}"></label><div class="flex"><button class="btn small" data-three="duplicate">⧉ Kopieren ✦</button><button class="btn small danger" data-three="delete">Löschen</button></div>
 <div class="ll3-premium"><b>✦ Material-Tools Pro</b><label>Metallisch<input id="ll3-metal" type="range" min="0" max="1" step=".05" value="${x.metallic}"></label><label>Rauheit<input id="ll3-rough" type="range" min=".05" max="1" step=".05" value="${x.roughness}"></label></div>`;
}
function dl(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),15000)}
async function render(node,{userId='guest'}={}){
 stop();root=node;uid=userId;world=load();selected=world.objects[0]?.id;history=[];abort=new AbortController();
 root.innerHTML=`<div class="eyebrow">3D DESIGN ACADEMY · WEBGL STUDIO</div><h1>Shape your <em>world.</em></h1><p class="text-muted">Szenen aus echten 3D-Objekten erstellen, bewegen, skalieren, färben und als GLB exportieren. Für Sculpting, UV-Mapping und professionelle Animation nutzt du später Blender.</p>
 <div class="ll3-toolbar"><select id="ll3-primitive">${types.map(t=>`<option>${t}${basic.includes(t)?'':' ✦'}</option>`).join('')}</select><button class="btn primary" data-three="add">＋ Objekt</button><button class="btn" data-three="camera">Ansicht zentrieren</button><button class="btn" data-three="undo">↶ Rückgängig</button><button class="btn" data-three="save">Speichern</button><button class="btn" data-three="export">↓ GLB</button><button class="btn" data-three="json">↓ JSON</button><button class="btn" data-three="import">↑ Import</button></div><input type="file" id="ll3-upload" accept=".json" hidden>
 <div class="ll3-layout"><aside><div class="eyebrow">HIERARCHIE</div><div id="ll3-tree"></div></aside><div class="ll3-view"><div id="ll3-canvas"></div><div class="ll3-overlay">☝ Ziehen: Drehen · Zwei Finger: Zoomen</div></div><aside id="ll3-inspector"></aside></div>
 <div class="callout" id="ll3-status" role="status">Lade 3D Engine …</div><div class="v5-plans-note">FREE: 6 Objekte, Grundformen, 2 GLB-Exporte pro Tag. ✦ PRO: 100 Objekte (Browser-Leistungsgrenze), alle Formen, Materialien und unbegrenzte Exporte.</div>`;
 node.addEventListener('click',click,{signal:abort.signal});node.addEventListener('change',change,{signal:abort.signal});
 $('#ll3-upload',node).addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2000000)return status('Maximal 2 MB JSON');try{const d=JSON.parse(await f.text());if(!Array.isArray(d.objects)||d.objects.length>100)throw Error('Ungültiger Szeneninhalt');snap();world={name:String(d.name||'Szene').slice(0,60),objects:d.objects.map(clean)};selected=world.objects[0]?.id;sync();inspector();save()}catch(err){status('Import: '+err.message)}e.target.value=''},{signal:abort.signal});
 try{
 const T=await import('three'),{OrbitControls}=await import('three/addons/controls/OrbitControls.js');
 if(!abort||abort.signal.aborted||root!==node)return;
 THREE=T;scene=new T.Scene();scene.background=new T.Color('#100d1b');camera=new T.PerspectiveCamera(48,1,.1,500);camera.position.set(4,3.5,6);
 renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));$('#ll3-canvas',root).append(renderer.domElement);
 scene.add(new T.AmbientLight('#c3abff',1));const light=new T.DirectionalLight('#eecaff',2.4);light.position.set(4,8,5);scene.add(light);scene.add(new T.GridHelper(12,12,'#7540ae','#393044'));models=new T.Group();scene.add(models);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,.5,0);
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();
 renderer.domElement.addEventListener('click',e=>{const a=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-a.left)/a.width*2-1,-(e.clientY-a.top)/a.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(models.children);if(hits.length){selected=hits[0].object.userData.id;sync();inspector()}},{signal:abort.signal});
 ro=new ResizeObserver(()=>{if(!renderer||!root)return;const a=$('#ll3-canvas',root).getBoundingClientRect();const w=Math.max(240,Math.floor(a.width)),h=Math.max(280,Math.floor(a.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});ro.observe($('#ll3-canvas',root));sync();inspector();
 const loop=()=>{if(!renderer)return;raf=requestAnimationFrame(loop);controls.update();renderer.render(scene,camera)};loop();status('3D bereit – tippe ein Objekt zum Auswählen an.');
 }catch(err){status('3D Engine konnte nicht geladen werden: '+err.message)}
}
async function click(e){
 const b=e.target.closest('[data-three]');if(!b||!root.contains(b))return;const x=world.objects.find(o=>o.id===selected),a=b.dataset.three;
 if(a==='select'){selected=b.dataset.id;sync();inspector();return}
 if(a==='add'){let type=$('#ll3-primitive',root).value.replace(' ✦','');if(!basic.includes(type)){const g=await LLPro.use('studio3d_advanced');if(!g.allowed)return status(g.reason)}if(world.objects.length>=(LLPro.isPro?100:6))return status('Objektgrenze erreicht.');snap();const o=clean({id:'mesh'+Date.now()+Math.random(),name:type+' '+(world.objects.length+1),type});world.objects.push(o);selected=o.id;sync();inspector();save();return}
 if(a==='delete'&&x){snap();world.objects=world.objects.filter(o=>o.id!==x.id);selected=world.objects[0]?.id;sync();inspector();save();return}
 if(a==='duplicate'&&x){const g=await LLPro.use('studio3d_advanced');if(!g.allowed)return status(g.reason);if(world.objects.length>=100)return status('Browser-Leistungsgrenze erreicht.');snap();const o=clean({...x,id:'copy'+Date.now(),name:x.name+' Kopie',pos:[x.pos[0]+1,x.pos[1],x.pos[2]]});world.objects.push(o);selected=o.id;sync();inspector();save();return}
 if(a==='undo'){if(!history.length)return status('Keine Änderung gespeichert');world=JSON.parse(history.pop());selected=world.objects[0]?.id;sync();inspector();save();return}
 if(a==='camera'&&controls&&camera){
  const target=x?.pos||[0,0,0], distance=Math.max(3,...(x?.scale||[1]))*2;
  controls.target.fromArray(target);
  camera.position.set(target[0]+distance,target[1]+distance*.65,target[2]+distance);
  controls.update();return;
 }
 if(a==='save'){save();return}
 if(a==='json'){dl(new Blob([JSON.stringify(world,null,2)],{type:'application/json'}),'LiveryLab-Szene.json');return}
 if(a==='import'){$('#ll3-upload',root).click();return}
 if(a==='export'){if(!models)return status('3D Engine nicht bereit');const g=await LLPro.use('studio3d_export');if(!g.allowed)return status(g.reason);try{const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const output=await new Promise((resolve,reject)=>new GLTFExporter().parse(models,resolve,reject,{binary:true}));dl(new Blob([output],{type:'model/gltf-binary'}),'LiveryLab-3D.glb');status('GLB exportiert – in Blender importierbar.')}catch(err){status('GLB-Exportfehler: '+err.message)}}
}
async function change(e){
 if(!root?.contains(e.target))return;const t=e.target,o=world.objects.find(x=>x.id===selected);if(!o)return;
 if(['ll3-metal','ll3-rough'].includes(t.id)){const g=await LLPro.use('studio3d_advanced');if(!g.allowed){status(g.reason);inspector();return}snap();o[t.id==='ll3-metal'?'metallic':'roughness']=clamp(t.value,0,1)}
 else if(t.id==='ll3-name'){snap();o.name=t.value.slice(0,50)}
 else if(t.id==='ll3-color'){snap();o.color=t.value}
 else if(t.dataset.prop){snap();const p=t.dataset.prop,i=+t.dataset.axis;o[p][i]=p==='rot'?clamp(t.value,-360,360)*Math.PI/180:p==='scale'?clamp(t.value,.01,50):clamp(t.value,-100,100)}
 else return;
 sync();inspector();save();
}
function stop(){abort?.abort();abort=null;ro?.disconnect();ro=null;if(raf!==null)cancelAnimationFrame(raf);raf=null;controls?.dispose();controls=null;if(models)for(const m of models.children){m.geometry.dispose();m.material.dispose()}models=null;renderer?.dispose();renderer?.domElement?.remove();renderer=null;scene=null;root=null;}
window.LL3D={render,stop};
})();
