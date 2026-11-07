/* =====================================================================
   Audio qari (EveryAyah.com)
   Daftar qari, server cadangan, pemutar ayat, dan penanganan audio gagal.
   ===================================================================== */
'use strict';

/* ---------- audio qari: EveryAyah.com (gratis, tanpa API key, pola SSSAAA.mp3) ---------- */
const EVERY = 'https://everyayah.com/data/';
const ALAFASY = EVERY + 'Alafasy_128kbps/';
const QARIS = [
    { id: 'mishary', name: 'Syaikh Misyari Rasyid Al-Afasy', type: 'api', baseUrl: ALAFASY },
    { id: 'husary', name: 'Syaikh Mahmud Khalil Al-Husary', type: 'api', baseUrl: EVERY + 'Husary_128kbps/' },
    { id: 'minshawi', name: 'Syaikh Muhammad Siddiq Al-Minshawi', type: 'api', baseUrl: EVERY + 'Minshawy_Murattal_128kbps/' },
    { id: 'abdulbasit', name: 'Syaikh Abdul Basit Abdus Samad', type: 'api', baseUrl: EVERY + 'Abdul_Basit_Murattal_192kbps/' },
    { id: 'muaiqly', name: 'Syaikh Maher Al-Muaiqly', type: 'api', baseUrl: EVERY + 'Maher_AlMuaiqly_64kbps/' },
    { id: 'sudais', name: 'Syaikh Abdurrahman As-Sudais', type: 'api', baseUrl: EVERY + 'Abdurrahmaan_As-Sudais_192kbps/' },
    { id: 'shuraim', name: 'Syaikh Sa\u2019ud Asy-Syuraim', type: 'api', baseUrl: EVERY + 'Saood_ash-Shuraym_128kbps/' },
    { id: 'hudhaify', name: 'Syaikh Ali Al-Hudhaify', type: 'api', baseUrl: EVERY + 'Hudhaify_128kbps/' },
    { id: 'shatri', name: 'Syaikh Abu Bakr Asy-Syatiri', type: 'api', baseUrl: EVERY + 'Abu_Bakr_Ash-Shaatree_128kbps/' },
    { id: 'rifai', name: 'Syaikh Hani Ar-Rifai', type: 'api', baseUrl: EVERY + 'Hani_Rifai_192kbps/' },
    { id: 'ayyub', name: 'Syaikh Muhammad Ayyub', type: 'api', baseUrl: EVERY + 'Muhammad_Ayyoub_128kbps/' }
];
const curQari = () => QARIS.find(x => x.id === S.qari) || QARIS[0]; // pilihan lama (mis. \"Anak\") otomatis jadi qari pertama

/* Server cadangan: bila everyayah.com lambat/terblokir, otomatis dicoba server lain,
   lalu (bila perlu) diganti suara Misyari yang punya 3 server. */
const QC_CDN = 'https://verses.quran.foundation/', ISL_CDN = 'https://cdn.islamic.app/quran/audio/';
const MIRRORS = {
    mishary: { qc: 'Alafasy/mp3', isl: 'ar.alafasy' },
    husary: { qc: 'Husary/mp3' },
    minshawi: { qc: 'Minshawi/Murattal/mp3' },
    abdulbasit: { qc: 'AbdulBaset/Murattal/mp3' },
    sudais: { qc: 'Sudais/mp3', isl: 'ar.abdurrahmaansudais' },
    shuraim: { qc: 'Shuraym/mp3' }
};

const AYAH_COUNTS = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];
const globalAyah = (s, n) => {
    let t = 0;
    for (let i = 0; i < s - 1; i++)
        t += AYAH_COUNTS[i];
    return t + n;
};

function srcFor(q, s, n) { // daftar server untuk satu qari
    if (n === 0) {
        s = 1;
        n = 1;
    } // basmalah = Al-Fatihah ayat 1
    const f = `${pad(s)}${pad(n)}.mp3`, m = MIRRORS[q.id] || {}, out = [q.baseUrl + f];
    if (m.qc)
        out.push(`${QC_CDN}${m.qc}/${f}`);
    if (m.isl)
        out.push(`${ISL_CDN}${m.isl}/${globalAyah(s, n)}.mp3`);
    return out;
}

function ayatUrls(v) {
    const q = curQari();
    let list = srcFor(q, v.s, v.n);
    const own = list.length;
    if (q.id !== QARIS[0].id)
        list = list.concat(srcFor(QARIS[0], v.s, v.n)); // pengganti: suara Misyari
    return { list, own };
}

const A = new Audio();
A.preload = 'auto';
let curRes = null;
A.addEventListener('ended', () => {
    if (curRes) {
        const r = curRes;
        curRes = null;
        r(true);
    }
});

A.addEventListener('error', () => {
    if (curRes) {
        const r = curRes;
        curRes = null;
        r(false);
    }
});

function stopAudio() {
    try {
        A.pause();
    }
    catch (e) { }
    if (curRes) {
        const r = curRes;
        curRes = null;
        r(null);
    }
}

const PLAY_TIMEOUT = 9000, BAD_TTL = 180000, badHosts = {}; // server yang macet diingat 3 menit
const hostOf = u => {
    try {
        return new URL(u).hostname;
    }
    catch (e) {
        return '';
    }
};

const isBad = h => badHosts[h] && (Date.now() - badHosts[h]) < BAD_TTL;

function playUrl(url, rate) {
    stopAudio();
    return new Promise(res => {
        curRes = res;
        A.src = url;
        A.playbackRate = rate;
        A.preservesPitch = true;
        // bila 9 detik belum mulai berbunyi -> anggap server macet, coba server berikutnya
        const t = setTimeout(() => {
            if (curRes === res) {
                curRes = null;
                badHosts[hostOf(url)] = Date.now();
                try {
                    A.pause();
                }
                catch (e) { }
                res(false);
            }
        }, PLAY_TIMEOUT);
        const p = A.play();
        if (p && p.then)
            p.then(() => clearTimeout(t), () => {
                clearTimeout(t);
                if (curRes === res) {
                    curRes = null;
                    res(false);
                }
            });
    });
}

let fbToastAt = 0;

async function playOnce(v, rate = 1) {
    const { list, own } = ayatUrls(v), failed = new Set();
    const skipBad = list.some(u => !isBad(hostOf(u))); // lewati server macet, selama masih ada yang lain
    for (let i = 0; i < list.length; i++) {
        const h = hostOf(list[i]);
        if (skipBad && isBad(h))
            continue;
        if (i >= own && failed.has(h))
            continue;
        const r = await playUrl(list[i], rate);
        if (r !== false) {
            if (i >= own && Date.now() - fbToastAt > 30000) {
                fbToastAt = Date.now();
                toast('🎙️ Suara qari pilihan sedang gagal, memakai suara Misyari.');
            }
            return r;
        }
        failed.add(h);
    }
    return false;
}

let audioErrAt = 0;

function audioFail() {
    if (Date.now() - audioErrAt > 4000) {
        audioErrAt = Date.now();
        toast('🌐 Audio butuh internet. Cek koneksi lalu coba lagi ya!');
    }
}
