/* =====================================================================
   Pemuat data Al-Qur'an dari internet
   Mengambil teks Arab (api.quran.com) dan terjemah (api.alquran.cloud), menyimpannya di perangkat.
   ===================================================================== */
'use strict';

const DATA_KEY = 'ayatplay_quran_v2';
const CONV_VER = 1; // naikkan bila aturan konversi mushaf berubah
let dataStatus = 'builtin'; // builtin | loading | full | error
let loadDone = 0, pendingData = null;
const QPARTIAL = {}; // surah yang sudah berhasil dimuat (agar bisa dilanjutkan bila terputus)
const BASMALA_RE = /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/;
const BASMALA_NORM = 'بسم الله الرحمن الرحيم';

function cleanAr(text, n, no) {
    let t = String(text).replace(/\u06DE/g, '').replace(/\s+/g, ' ').trim(); // buang tanda hizb ۞ (agar tidak jadi "kata")
    if (n === 1 && no !== 1 && no !== 9) {
        t = t.replace(BASMALA_RE, '');
        const parts = t.split(' ');
        if (parts.length > 4 && normAr(parts.slice(0, 4).join(' ')) === BASMALA_NORM)
            t = parts.slice(4).join(' ');
    }
    return t;
}

const mushafStyle = t => {
    try {
        return MushafID.convert(t, {});
    }
    catch (e) {
        console.warn('Gaya mushaf gagal, memakai teks asli:', e);
        return t;
    }
};

const toArabicDigits = num => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const toRaw = list => list.map(s => {
    const m = SURAH_META[s.no];
    return { no: s.no, name: m[0], ar: m[1], mean: m[2], juz: juzOf(s.no), from: SURAH_FROM[s.no], v: s.v };
});

/* Membaca data tersimpan. Surah yang sudah ada tetap dipakai; surah baru (misalnya Juz 27) dimuat sendiri. */
function readCache() {
    const none = { list: [], complete: false };
    try {
        const c = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
        if (!c || c.cv !== CONV_VER || !Array.isArray(c.s))
            return none;
        const list = [];
        for (const [no, v] of c.s) {
            if (!AYAT_COUNT[no] || !Array.isArray(v) || v.length !== AYAT_COUNT[no] || v.some(p => !p[0] || !p[1]))
                continue;
            list.push({ no, v });
            QPARTIAL[no] = { no, v };
        }
        return { list, complete: list.length === ALL_SURAHS.length };
    }
    catch (e) {
        return none;
    }
}

async function fetchJSON(url, tries = 3) {
    let last;
    for (let i = 0; i < tries; i++) {
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 25000);
        try {
            const r = await fetch(url, { signal: ctl.signal });
            if (!r.ok)
                throw new Error('HTTP ' + r.status);
            return await r.json();
        }
        catch (e) {
            last = e;
            await wait(400 * (i + 1));
        }
        finally {
            clearTimeout(t);
        }
    }
    throw last;
}

async function fetchSurah(no) {
    const [ra, ri] = await Promise.all([
        fetchJSON(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${no}`),
        fetchJSON(`https://api.alquran.cloud/v1/surah/${no}/id.indonesian`)
    ]);
    const va = ra && ra.verses, vi = ri && ri.data && ri.data.ayahs, total = SURAH_TOTAL[no], from = SURAH_FROM[no];
    if (!Array.isArray(va) || !Array.isArray(vi) || va.length !== total || vi.length !== total)
        throw new Error(`jumlah ayat surah ${no} tidak sesuai`);
    const v = va.slice(from - 1).map((a, j) => {
        const n = from + j;
        const ar = mushafStyle(cleanAr(a.text_uthmani, n, no)), id = String(vi[n - 1].text || '').replace(/\s+/g, ' ').trim();
        if (!ar || !id)
            throw new Error(`ayat ${no}:${n} tidak lengkap`);
        return [ar, id];
    });
    return { no, v };
}

function applyData(list) {
    rebuildData(toRaw(list));
    if (S.scope.surah && !SURAHS[S.scope.surah])
        S.scope.surah = '';
    if (S.scope.juz !== 'all' && !SURAH_LIST.some(x => String(x.juz) === String(S.scope.juz)))
        S.scope.juz = '30';
    dataStatus = 'full';
}

async function loadFullData() {
    if (dataStatus === 'loading')
        return;
    const was = dataStatus;
    dataStatus = 'loading';
    loadDone = Object.keys(QPARTIAL).length;
    refreshDataUI();
    try {
        const todo = ALL_SURAHS.map(s => s.num).filter(n => !QPARTIAL[n]);
        let idx = 0;
        const worker = async () => {
            while (idx < todo.length) {
                const no = todo[idx++];
                QPARTIAL[no] = await fetchSurah(no);
                loadDone++;
                refreshDataUI();
            }
        };
        await Promise.all(Array.from({ length: 4 }, worker));
        const list = ALL_SURAHS.map(s => QPARTIAL[s.num]);
        try {
            localStorage.setItem(DATA_KEY, JSON.stringify({ cv: CONV_VER, t: Date.now(), s: list.map(s => [s.no, s.v]) }));
        }
        catch (e) { }
        if (curView === 'game') {
            pendingData = list;
            dataStatus = 'full';
        }
        else {
            applyData(list);
            toast(`📚 Semua surah Juz 27-30 siap: ${VERSES.length} ayat!`, 'gold');
        }
    }
    catch (e) {
        console.warn('Gagal memuat seluruh surah:', e);
        dataStatus = (was === 'full') ? 'full' : 'error';
    }
    refreshDataUI();
}

function refreshDataUI() {
    if (curView === 'home') {
        const el = $('#scope-slot');
        if (el)
            el.innerHTML = scopeCard();
    }
    else if (curView === 'learn' && !learnState.surah)
        renderLearn();
}
