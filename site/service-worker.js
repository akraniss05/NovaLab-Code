/* LiveryLab Academy offline assets: never cache credentials, API calls or private user data. */
const CACHE = 'liverylab-v3.3.0';
const ASSETS=['./','./index.html','./styles.css','./app.js','./lua-mini.js','./design-lab.js','./config.js','./privacy.html','./assets/icon.svg','./assets/liverylab-hero.jpg','./manifest.webmanifest'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&(k.startsWith('liverylab-')||k.startsWith('liverylab-academy-'))).map(k=>caches.delete(k)))));
 self.clients.claim();
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 const allowed=['','index.html','styles.css','app.js','lua-mini.js','design-lab.js','config.js','privacy.html','icon.svg','liverylab-hero.jpg','manifest.webmanifest'];
 const filename=url.pathname.split('/').pop();
 if(!allowed.includes(filename))return;
 const networkOnly=filename==='config.js';
 if(networkOnly){event.respondWith(fetch(req).catch(()=>caches.match(req)));return;}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
  if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;
 })));
});
