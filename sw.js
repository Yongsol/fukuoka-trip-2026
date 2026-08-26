const CACHE_PREFIX='fukuoka-trip-2026-';
const CACHE='fukuoka-trip-2026-v20';
const LEGACY_CACHES=new Set(['fukuoka-planner-v3']);
const SHELL=[
  './','./index.html','./styles.css?v=20','./src/app.js?v=20','./src/data.js?v=20','./src/restaurant-data.js?v=20','./src/social-food-data.js?v=20','./src/planner.js',
  './src/security.js','./src/storage.js','./src/motion.js','./src/routes.js','./manifest.webmanifest','./icons/icon.svg',
  './icons/icon-192.png','./icons/icon-512.png','./assets/theme/beaver-baby-hero.svg',
  './vendor/leaflet/leaflet.css','./vendor/leaflet/leaflet.js',
  './vendor/leaflet/images/marker-icon.png','./vendor/leaflet/images/marker-icon-2x.png',
  './vendor/leaflet/images/marker-shadow.png','./vendor/leaflet/images/layers.png',
  './vendor/leaflet/images/layers-2x.png',
  './assets/restaurants/01-shinshin-tenjin.webp','./assets/restaurants/02-shinshin-deitos.webp','./assets/restaurants/02-unafuji-daimyo.webp',
  './assets/restaurants/03-kanetora.webp','./assets/restaurants/04-ichifuji.webp',
  './assets/restaurants/05-rakutenti.webp','./assets/restaurants/06-ooyama.webp',
  './assets/restaurants/07-mentaiju.webp','./assets/restaurants/08-shoboan.webp','./assets/restaurants/08-fukutaro-tenjin-terra.webp',
  './assets/restaurants/09-hamadaya.webp','./assets/restaurants/09-shinmiura-tenjin.webp',
  './assets/restaurants/10-nakasu-yatai.webp','./assets/restaurants/10-mamichan-yatai.webp',
  './assets/restaurants/11-pyonkichi.webp',
  './assets/restaurants/15-fruit-parlor-notoki.webp','./assets/restaurants/18-quil-fait-bon-fukuoka.webp',
  './assets/restaurants/24-kamakiri-udon.webp',
  './assets/social-food/01-kaisendon-candidate.webp','./assets/social-food/02-ichiran-honten.webp',
  './assets/social-food/03-toriboshi-daimyo.webp','./assets/social-food/04-fruit-sando-hakata.webp',
  './assets/social-food/05-yakiniku-sudo.webp','./assets/social-food/06-ooshige-shokudo.webp',
  './assets/social-food/07-imonne-hakata.webp','./assets/social-food/08-fruit-garden-shinsun.webp',
  './assets/social-food/09-sashisu.webp','./assets/social-food/10-motsunabe-ooyama.webp',
  './assets/social-food/11-kanetora-first.webp','./assets/social-food/12-kanetora-second.webp',
  './assets/social-food/13-shinshin.webp','./assets/social-food/14-hyotan-sushi.webp',
  './assets/social-food/15-musashi-iroriyaki.webp','./assets/social-food/16-mentaiju.webp',
  './assets/social-food/17-kisuimaru.webp','./assets/social-food/18-cafe-del-sol.webp',
  './assets/social-food/19-daichi-no-udon.webp','./assets/social-food/20-sabatarou.webp',
  './assets/social-food/21-rakutenti.webp'
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
