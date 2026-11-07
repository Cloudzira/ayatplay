/* =====================================================================
   Data huruf hijaiyyah
   30 huruf hijaiyyah, nama, tulisan Latin, kelompok huruf mirip, dan bentuk sambung.
   ===================================================================== */
'use strict';

/* =====================================================================
   HURUF HIJAIYYAH (30), penulisan nama dan Latin yang LAZIM di Indonesia
   (mengikuti daftar huruf hijaiyah di buku pelajaran dan pengajaran umum).
   Urutan: Alif ... Nun, Wau, Haa, Lam Alif, Hamzah, Ya (Ya = huruf ke-30).
   join: d = bersambung dua sisi, r = hanya bersambung dari kanan, n = tidak bersambung.
   alt = sebutan lain yang juga dipakai di TPQ/Iqra.
   ===================================================================== */
const HIJ = [
    { i: 1, ch: 'ا', name: 'Alif', lat: 'a', alt: 'Alif', join: 'r' },
    { i: 2, ch: 'ب', name: "Ba'", lat: 'b', alt: 'Ba', join: 'd' },
    { i: 3, ch: 'ت', name: "Ta'", lat: 't', alt: 'Ta', join: 'd' },
    { i: 4, ch: 'ث', name: 'Tsa', lat: 'ts', alt: 'Tsa', join: 'd' },
    { i: 5, ch: 'ج', name: 'Jim', lat: 'j', alt: 'Jim', join: 'd' },
    { i: 6, ch: 'ح', name: "Ha'", lat: 'h', alt: 'Ha', join: 'd' },
    { i: 7, ch: 'خ', name: "Kha'", lat: 'kh', alt: 'Kho', join: 'd' },
    { i: 8, ch: 'د', name: 'Dal', lat: 'd', alt: 'Dal', join: 'r' },
    { i: 9, ch: 'ذ', name: 'Dzal', lat: 'dz', alt: 'Dzal', join: 'r' },
    { i: 10, ch: 'ر', name: "Ra'", lat: 'r', alt: 'Ro', join: 'r' },
    { i: 11, ch: 'ز', name: 'Za', lat: 'z', alt: 'Zai', join: 'r' },
    { i: 12, ch: 'س', name: 'Sin', lat: 's', alt: 'Sin', join: 'd' },
    { i: 13, ch: 'ش', name: 'Syin', lat: 'sy', alt: 'Syin', join: 'd' },
    { i: 14, ch: 'ص', name: 'Shad', lat: 'sh', alt: 'Shod', join: 'd' },
    { i: 15, ch: 'ض', name: 'Dhad', lat: 'dh', alt: 'Dhod', join: 'd' },
    { i: 16, ch: 'ط', name: "Tha'", lat: 'th', alt: 'Tho', join: 'd' },
    { i: 17, ch: 'ظ', name: "Zha'", lat: 'zh', alt: 'Zho', join: 'd' },
    { i: 18, ch: 'ع', name: "'Ain", lat: '‘', alt: "'Ain", join: 'd' },
    { i: 19, ch: 'غ', name: 'Ghain', lat: 'gh', alt: 'Ghoin', join: 'd' },
    { i: 20, ch: 'ف', name: "Fa'", lat: 'f', alt: 'Fa', join: 'd' },
    { i: 21, ch: 'ق', name: 'Qaf', lat: 'q', alt: 'Qof', join: 'd' },
    { i: 22, ch: 'ك', name: 'Kaf', lat: 'k', alt: 'Kaf', join: 'd' },
    { i: 23, ch: 'ل', name: 'Lam', lat: 'l', alt: 'Lam', join: 'd' },
    { i: 24, ch: 'م', name: 'Mim', lat: 'm', alt: 'Mim', join: 'd' },
    { i: 25, ch: 'ن', name: 'Nun', lat: 'n', alt: 'Nun', join: 'd' },
    { i: 26, ch: 'و', name: 'Wau', lat: 'w', alt: 'Waw', join: 'r' },
    { i: 27, ch: 'ه', name: 'Haa', lat: 'h', alt: 'Ha', join: 'd' },
    { i: 28, ch: 'لا', name: 'Lam Alif', lat: 'la', alt: 'Lam Alif', join: 'r' },
    { i: 29, ch: 'ء', name: 'Hamzah', lat: '’', alt: 'Hamzah', join: 'n' },
    { i: 30, ch: 'ي', name: "Ya'", lat: 'y', alt: 'Ya', join: 'd' }
];
const hijAlt = h => {
    const n = s => String(s).toLowerCase().replace(/['’‘]/g, '');
    return h.alt && n(h.alt) !== n(h.name) ? h.alt : '';
};

const HIJ_BY = Object.fromEntries(HIJ.map(h => [h.i, h]));

/* kelompok huruf yang bentuk dasarnya mirip (dibedakan titik/bagian kecil) */
const HIJ_FAM = [[2, 3, 4, 25, 30], [5, 6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21]];
const HIJ_FAM_OF = {};
HIJ_FAM.forEach(f => f.forEach(i => {
    HIJ_FAM_OF[i] = f.filter(x => x !== i);
}));

const ZWJ = '\u200D';

function hijForms(h) {
    if (h.join === 'd')
        return [['awal', h.ch + ZWJ], ['tengah', ZWJ + h.ch + ZWJ], ['akhir', ZWJ + h.ch]];
    if (h.join === 'r')
        return [['akhir', ZWJ + h.ch]];
    return [];
}

const hitem = h => ({ hij: true, key: 'h:' + h.i, h, ar: h.ch, sName: 'Huruf', n: h.i });
