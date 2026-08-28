import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = { title: "Vet'Tronic SELAB", description: "Defi Vet'Tronic SELAB", manifest: '/manifest.webmanifest' };
export const viewport: Viewport = { themeColor: '#0f766e', width: 'device-width', initialScale: 1 };

const animalImageFix = `
(function(){
  var images={
    Bovins:'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80',
    Ovins:'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1200&q=80',
    Caprins:'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80',
    Porcins:'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80',
    Volailles:'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=1200&q=80',
    Chiens:'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
    Chats:'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
    Chevaux:'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80'
  };
  function fallback(label){return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520"><rect width="800" height="520" fill="#ecf7ef"/><circle cx="400" cy="210" r="105" fill="#66bb89"/><text x="400" y="390" text-anchor="middle" font-size="44" font-family="Arial" font-weight="700" fill="#0f766e">'+(label||'Photo animal')+'</text></svg>')}
  function speciesFor(img){var alt=img.getAttribute('alt')||''; return Object.keys(images).find(function(k){return alt.indexOf(k)>-1 || img.src.indexOf(k)>-1})}
  function fix(){document.querySelectorAll('img').forEach(function(img){var sp=speciesFor(img); if(sp && (img.src.indexOf('wikimedia.org')>-1 || img.naturalWidth===0)){img.src=images[sp]} img.onerror=function(){img.onerror=null;img.src=fallback(img.alt)}})}
  document.addEventListener('DOMContentLoaded',fix);
  window.addEventListener('load',fix);
  setInterval(fix,1200);
  new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','alt']});
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body><script dangerouslySetInnerHTML={{ __html: animalImageFix }} />{children}</body></html>;
}
