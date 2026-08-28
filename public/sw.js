const CACHE='vettronic-selab-v2';
const FALLBACK_IMAGE="data:image/svg+xml;charset=UTF-8,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'><rect width='800' height='520' fill='#ecf7ef'/><circle cx='400' cy='210' r='105' fill='#66bb89'/><text x='400' y='390' text-anchor='middle' font-size='44' font-family='Arial' font-weight='700' fill='#0f766e'>Photo animal</text></svg>");
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/manifest.webmanifest','/branding/logo.png'])))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const accept=event.request.headers.get('accept')||'';
  if(accept.includes('image/')){
    event.respondWith(fetch(event.request).catch(()=>fetch(FALLBACK_IMAGE)));
    return;
  }
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(response=>response||caches.match('/'))));
});
