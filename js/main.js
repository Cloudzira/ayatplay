/* =====================================================================
   Titik mulai aplikasi
   Dijalankan terakhir: menyiapkan tampilan, memuat data, dan mendaftarkan service worker.
   ===================================================================== */
'use strict';

/* ---------- mulai ---------- */
(function boot() {
    applyArabic();
    const cached = readCache();
    if (cached)
        applyData(cached);
    updateHeader();
    nav('home');
    runSplash();
    cloudUI();
    if (dataStatus !== 'full')
        loadFullData();
    fbInit();
    registerSW();
    addEventListener('online', () => {
        if (dataStatus !== 'full')
            loadFullData();
        if (fbConfigured() && !FB.m)
            fbInit();
    });
})();
