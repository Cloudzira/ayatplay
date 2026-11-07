/* =====================================================================
   Penyusun data ayat
   Memecah ayat menjadi kata dan menyusun daftar SURAHS, SURAH_LIST, VERSES.
   ===================================================================== */
'use strict';

/* ---------- kompilasi data ---------- */
const MARK_ONLY = /^[\u06D6-\u06DC\u06DE\u06E9]+$/; // tanda waqaf berdiri sendiri

function tokenize(text) {
    const out = [];
    text.split(/\s+/).filter(Boolean).forEach(t => {
        if (MARK_ONLY.test(t) && out.length)
            out[out.length - 1] += '\u00A0' + t; // tempelkan ke kata sebelumnya
        else
            out.push(t);
    });
    return out;
}

const normAr = s => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
const SURAHS = {}, SURAH_LIST = [], VERSES = [], VMAP = new Map();

function rebuildData(rawList) {
    Object.keys(SURAHS).forEach(k => delete SURAHS[k]);
    SURAH_LIST.length = 0;
    VERSES.length = 0;
    VMAP.clear();
    const rank = s => s.juz === 30 ? [0, -s.no] : s.juz === 29 ? [1, s.no] : s.juz === 28 ? [2, s.no] : [3, s.no]; // Juz 30 dari An-Nas ke atas, Juz 29 & 28 berurutan
    [...rawList].sort((x, y) => {
        const a = rank(x), b = rank(y);
        return a[0] - b[0] || a[1] - b[1];
    }).forEach(s => {
        const from = s.from || 1;
        const M = SURAH_META[s.no] || [s.name, s.ar, s.mean], partial = /\(ayat/.test(s.mean || '');
        const o = { no: s.no, name: M[0], ar: M[1], mean: partial ? s.mean : M[2], juz: juzOf(s.no), verses: [] };
        s.v.forEach((p, i) => {
            const n = from + i;
            const v = { key: s.no + ':' + n, s: s.no, sName: o.name, sAr: o.ar, juz: o.juz, n, i, ar: p[0], id: p[1] };
            v.words = tokenize(v.ar);
            o.verses.push(v);
            VERSES.push(v);
            VMAP.set(v.key, v);
        });
        SURAHS[s.no] = o;
        SURAH_LIST.push(o);
    });
}

rebuildData(RAW);
const vById = key => VMAP.get(key) || preFromKey(key);
