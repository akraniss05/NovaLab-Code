/* LiveryLab Academy v9. Offline assets only; no credentials or user data cached.
 * Made with 💙 from NyxAtheris (LiveryLab Studios) */
const CACHE='liverylab-v9.0.0';
const ASSETS=['./','./index.html','./styles.css','./shell-v5.css','./shop-inspired-v8.css','./course-only-v9.css','./app.js','./config.js','./shell-v5.js','./auth-mfa-v5.js','./plans-v5.js','./videos-v5.js','./learn-v9.js','./manifest.webmanifest','./privacy.html','./assets/icon.svg','./assets/liverylab-academy-wordmark.svg','./assets/liverylab-server-banner.webp'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&(key.startsWith('liverylab-')||key.startsWith('liverylab-academy-'))).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 const filename=url.pathname.split('/').pop();
 const allowed=new Set(ASSETS.map(asset=>asset.split('/').pop()));
 if(!allowed.has(filename))return;
 if(filename==='config.js'){event.respondWith(fetch(req).catch(()=>caches.match(req)));return}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})));
});