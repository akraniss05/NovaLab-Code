/* LiveryLab Academy offline assets: never cache credentials, API calls or private user data. */
const CACHE = 'liverylab-v8.0.0';
const ASSETS=['./','./index.html','./styles.css','./app.js','./isolated-worker.js','./lua-mini.js','./music-studio.js','./code-studio.js','./studio-v4.css','./config.js','./privacy.html','./assets/icon.svg','./assets/liverylab-hero.jpg','./manifest.webmanifest','./plans-v5.js','./videos-v5.js','./music-v5.js','./studio3d-v5.js','./games-v5.js','./studio-v5.css','./shell-v5.js','./auth-mfa-v5.js','./video-lab-v5.js','./shell-v5.css','./studio-polish-v5.css','./workspace-v6.js','./workspace-v6.css','./academy-v7.css','./shop-inspired-v8.css','./assets/liverylab-academy-wordmark.svg','./assets/liverylab-server-banner.webp','./social-v7.js','./assets/category-video.svg','./assets/category-music.svg','./assets/category-code.svg','./assets/category-fivem.svg','./assets/category-blender.svg','./assets/category-games.svg'];
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
 const allowed=['','index.html','styles.css','app.js','isolated-worker.js','lua-mini.js' ,'music-studio.js','code-studio.js','studio-v4.css','config.js','privacy.html','icon.svg','liverylab-hero.jpg','manifest.webmanifest','plans-v5.js','videos-v5.js','music-v5.js','studio3d-v5.js','games-v5.js','studio-v5.css','shell-v5.js','auth-mfa-v5.js','video-lab-v5.js','shell-v5.css','studio-polish-v5.css','workspace-v6.js','workspace-v6.css','academy-v7.css','shop-inspired-v8.css','liverylab-academy-wordmark.svg','liverylab-server-banner.webp','social-v7.js','category-video.svg','category-music.svg','category-code.svg','category-fivem.svg','category-blender.svg','category-games.svg'];
 const filename=url.pathname.split('/').pop();
 if(!allowed.includes(filename))return;
 const networkOnly=filename==='config.js';
 if(networkOnly){event.respondWith(fetch(req).catch(()=>caches.match(req)));return;}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
  if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;
 })));
});
