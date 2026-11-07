/* =====================================================================
   Pasang sebagai aplikasi (PWA)
   Tombol pasang di layar utama dan pendaftaran service worker.
   ===================================================================== */
'use strict';

/* ---------- pasang sebagai aplikasi (PWA) ---------- */
let installEvt = null;
addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installEvt = e;
    if (curView === 'profile')
        renderProfile();
});

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function installCard() {
    if (isStandalone())
        return '';
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (installEvt)
        return `<div class="card" style="margin-top:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><img src="icons/icon-192.png" width="56" height="56" alt="" style="border-radius:14px"><div style="flex:1;min-width:180px"><h3>📲 Pasang di layar utama</h3><p class="muted small" style="margin:2px 0 0">Buka AyatPlay seperti aplikasi, lebih cepat dan layar penuh.</p></div><button class="btn btn-sun" data-act="install">Pasang</button></div>`;
    if (ios)
        return `<div class="card" style="margin-top:16px"><h3>📲 Pasang di layar utama</h3><p class="muted small" style="margin:4px 0 0">Di Safari, ketuk tombol Bagikan lalu pilih “Tambahkan ke Layar Utama”.</p></div>`;
    return '';
}

function registerSW() {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol))
        navigator.serviceWorker.register('sw.js').catch(() => { });
}
