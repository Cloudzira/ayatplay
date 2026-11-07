/* =====================================================================
   Fungsi bantu umum
   Pemilih elemen, escape HTML, acak, dan fungsi kecil yang dipakai di semua bagian aplikasi.
   ===================================================================== */
'use strict';

/* =====================================================================
   INTI APLIKASI
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
        const j = rnd(i + 1);
        [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
};

const pick = a => a[rnd(a.length)];
const pad = (n, l = 3) => String(n).padStart(l, '0');
const wait = ms => new Promise(r => setTimeout(r, ms));
