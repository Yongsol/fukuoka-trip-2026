const CACHE_PREFIX='fukuoka-trip-2026-';
const CACHE='fukuoka-trip-2026-v12';
const LEGACY_CACHES=new Set(['fukuoka-planner-v3']);
const SHELL=[
  './','./index.html','./styles.css?v=12','./src/app.js?v=12','./src/data.js','./src/planner.js',
  './src/security.js','./src/storage.js','./src/motion.js','./src/routes.js','./manifest.webmanifest','./icons/icon.svg',
  './icons/icon-192.png','./icons/icon-512.png',
  './vendor/leaflet/leaflet.css','./vendor/leaflet/leaflet.js',
  './vendor/leaflet/images/marker-icon.png','./vendor/leaflet/images/marker-icon-2x.png',
  './vendor/leaflet/images/marker-shadow.png','./vendor/leaflet/images/layers.png',
  './vendor/leaflet/images/layers-2x.png'
];
const SHELL_URLS=new Set(SHELL.map(path=>new URL(path,self.registration.scope).href));
const INDEX_URL=new URL('./index.html',self.registration.scope).href;

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>(key.startsWith(CACHE_PREFIX)||LEGACY_CACHES.has(key))&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

async function networkFirstShell(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response.ok)await cache.put(request,response.clone());
    return response;
  }catch(error){
    const cached=await cache.match(request);
    if(cached)return cached;
    throw error;
  }
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match(INDEX_URL)));
    return;
  }
  if(SHELL_URLS.has(url.href))event.respondWith(networkFirstShell(event.request));
});
