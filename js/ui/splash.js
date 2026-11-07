/* =====================================================================
   Splash screen
   Layar pembuka berlogo saat aplikasi dimuat.
   ===================================================================== */
'use strict';

/* ---------- splash screen ---------- */
function runSplash() {
    const el = $('#splash');
    if (!el)
        return;
    const msgs = ['Bismillah… 🌙', 'Menyiapkan bintang-bintang ⭐', 'Membuka buku ayat 📖'], m = $('#splash-msg');
    let i = 0;
    const iv = setInterval(() => {
        i = (i + 1) % msgs.length;
        if (m)
            m.textContent = msgs[i];
    }, 750);
    const minMs = matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 2300;
    const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(2600)]);
    Promise.all([fonts, wait(Math.max(0, minMs - performance.now()))]).then(() => {
        clearInterval(iv);
        el.classList.add('out');
        setTimeout(() => el.remove(), 650);
    });
}
