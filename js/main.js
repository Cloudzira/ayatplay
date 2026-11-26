/* =====================================================================
   Titik mulai aplikasi
   Dijalankan terakhir: menyiapkan tampilan, memuat data, dan mendaftarkan service worker.
   ===================================================================== */
'use strict';

/* ---------- mulai ---------- */
(function boot() {
    applyArabic();
    const cached = readCache();
    if (cached.list.length) {
        applyData(cached.list);
        if (!cached.complete)
            dataStatus = 'builtin'; // ada surah baru (mis. Juz 27) yang belum dimuat
    }
    if (typeof QCF !== 'undefined')
        QCF.warm(VERSES.filter(v => String(v.juz) === (S.scope.juz === 'all' ? '30' : String(S.scope.juz)))); // unduh font ayat Juz terpilih saat senggang
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
