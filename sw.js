/* Service worker AyatPlay Kids: aplikasi tetap terbuka saat offline.
   Audio qari, API Qur'an, dan Firebase sengaja TIDAK di-cache di sini. */
const V = 'ayatplay-v16';
const SHELL = [
  // halaman dan ikon
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/favicon-32.png',
  'icons/apple-touch-icon.png',
  // gaya tampilan (css/) dan skrip aplikasi (js/)
  'css/01-base.css',
  'css/02-arabic.css',
  'css/03-layout.css',
  'css/04-buttons.css',
  'css/05-hero.css',
  'css/06-scope-picker.css',
  'css/07-game-cards.css',
  'css/08-sheet-modal.css',
  'css/09-game-screen.css',
  'css/10-splash.css',
  'css/11-rewards.css',
  'css/12-islamic-theme.css',
  'css/13-hijaiyyah.css',
  'css/14-game-fit.css',
  'css/15-game-compact.css',
  'css/16-font-options.css',
  'css/17-footer.css',
  'css/18-polish-layout.css',
  'css/19-polish-game.css',
  'css/20-tajwid.css',
  'css/21-puzzle-hijaiyyah.css',
  'css/22-petualangan.css',
  'css/23-pelari.css',
  'js/config.js',
  'js/core/actions.js',
  'js/core/arabic-text.js',
  'js/core/data-compiler.js',
  'js/core/progress.js',
  'js/core/state.js',
  'js/core/utils.js',
  'js/data/hijaiyyah.js',
  'js/data/mushaf-style.js',
  'js/data/quran-fallback.js',
  'js/data/surah-catalog.js',
  'js/game/engine.js',
  'js/game/games-ayat.js',
  'js/game/games-hijaiyyah.js',
  'js/game/games-puzzle.js',
  'js/game/games-petualangan.js',
  'js/game/games-pelari.js',
  'js/game/games-tajwid.js',
  'js/game/levels.js',
  'js/game/registry.js',
  'js/main.js',
  'js/services/audio.js',
  'js/services/firebase-cloud.js',
  'js/services/pwa.js',
  'js/services/quran-loader.js',
  'js/services/sound.js',
  'js/ui/arabic-lam-fix.js',
  'js/ui/common.js',
  'js/ui/fullscreen-fit.js',
  'js/ui/home.js',
  'js/ui/learn.js',
  'js/ui/rewards-profile.js',
  'js/ui/shell.js',
  'js/ui/splash.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('ayatplay-') && k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (/everyayah\.com$|verses\.quran\.foundation$|cdn\.islamic\.app$|api\.alquran\.cloud$|api\.quran\.com$|raw\.githubusercontent\.com$|firestore\.googleapis\.com$|identitytoolkit\.googleapis\.com$|securetoken\.googleapis\.com$|firebaseio\.com$/.test(u.hostname)) return;
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('index.html', cp)); return res; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  const cacheable = u.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$|cdnjs\.cloudflare\.com$|www\.gstatic\.com$/.test(u.hostname);
  if (!cacheable) return;
  e.respondWith(
    caches.match(r).then(hit => {
      const net = fetch(r).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
