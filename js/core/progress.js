/* =====================================================================
   Level pemain, bintang, stiker, lencana
   Aturan lulus level, hadiah stiker, daftar lencana, dan penambahan XP.
   ===================================================================== */
'use strict';

/* ---------- level pemain, bintang, lencana ---------- */
const TITLES = ['Santri Baru', 'Pencari Ilmu', 'Pembaca Cilik', 'Penjaga Ayat', 'Bintang Hafalan', 'Pahlawan Surah', 'Hafiz Muda', 'Hafiz Cerdas', 'Hafiz Hebat', 'Hafiz Bintang Juz'];

function levelInfo(xp) {
    let L = 1;
    while (L < 10 && xp >= 200 * L * (L + 1) / 2)
        L++;
    const start = 200 * (L - 1) * L / 2, end = 200 * L * (L + 1) / 2;
    return { L, title: TITLES[L - 1], start, end, pct: L >= 10 ? 100 : Math.round((xp - start) / (end - start) * 100) };
}

const PASS_MIN = 6;
const starsFor = (c, t) => {
    const r = c / t;
    return r >= .9 ? 3 : r >= .8 ? 2 : r >= .6 ? 1 : 0;
}; // 10 soal: 6-7 benar=1 bintang, 8=2, 9-10=3

const stars = (g, l) => (S.prog[g] && S.prog[g][l]) || 0;
const unlocked = (g, l) => l === 1 || stars(g, l - 1) >= 1;
const totalStars = () => Object.values(S.prog).reduce((a, p) => a + Object.values(p).reduce((x, y) => x + y, 0), 0);
const memCount = () => Object.keys(S.memorized).length;
const surahsDone = () => SURAH_LIST.filter(s => s.verses.every(v => S.memorized[v.key])).length;

/* ---------- level, stiker, ucapan (10 level per game) ---------- */
const MAXL = 10;
const maxL = g => (GAMES[g - 1] && GAMES[g - 1].maxL) || MAXL; // jumlah level tiap game (default 10)
const passOf = t => Math.ceil(t * .6); // batas lulus = 60% soal
const totalLevels = () => GAMES.reduce((n, G) => n + maxL(G.id), 0);
const RANKS = ['Pemula', 'Santri', 'Pembaca', 'Penghafal', 'Penjaga Ayat', 'Mahir', 'Cendekia', 'Fasih', 'Hafiz', 'Hafiz Juara'];
const BAND = l => l <= 3 ? 'Mudah' : l <= 6 ? 'Sedang' : l <= 9 ? 'Sulit' : 'Tantangan Hafiz';
const tierOf = (l, g) => (g && maxL(g) === 1) ? 3 : (l <= 3 ? 1 : l <= 6 ? 2 : l <= 9 ? 3 : 4); // 1 perunggu, 2 perak, 3 emas, 4 berlian
const TIER_NAME = ['', 'Perunggu', 'Perak', 'Emas', 'Berlian'];
const MOTIFS = [{ e: '🕌', n: 'Masjid Cilik' }, { e: '🌙', n: 'Hilal Terang' }, { e: '📖', n: 'Mushaf Mulia' }, { e: "🕋", n: "Ka'bah Mungil" }, { e: '🌴', n: 'Pohon Kurma' }, { e: '🐪', n: 'Unta Setia' }, { e: '🕯️', n: 'Pelita Ilmu' }, { e: '📿', n: 'Tasbih Indah' }, { e: '🤲', n: 'Doa Tulus' }, { e: '🌟', n: 'Bintang Cahaya' }, { e: '🖋️', n: 'Pena Emas' }, { e: '🕊️', n: 'Merpati Putih' }, { e: '🐍', n: 'Ular Gesit' }, { e: '💎', n: 'Permata Tajwid' }, { e: '🌿', n: 'Daun Zaitun' }, { e: '🪙', n: 'Dinar Emas' }, { e: '🖼️', n: 'Kepingan Emas' }, { e: '🧭', n: 'Kompas Petualang' }];
const UCAPAN = [
    { ar: 'مَا شَاءَ اللَّهُ', id: 'Masya Allah, atas kehendak Allah, hebat sekali!' },
    { ar: 'الْحَمْدُ لِلَّهِ', id: 'Alhamdulillah, segala puji bagi Allah.' },
    { ar: 'بَارَكَ اللَّهُ فِيكُمْ', id: 'Barakallahu fiikum, semoga Allah memberkahimu.' },
    { ar: 'جَزَاكُمُ اللَّهُ خَيْرًا', id: 'Jazakumullahu khairan, semoga Allah membalasmu dengan kebaikan.' },
    { ar: 'رَبِّ زِدْنِي عِلْمًا', id: '“Ya Tuhanku, tambahkanlah ilmu kepadaku.” (QS Thaha: 114)' }
];
const allLevels = g => {
    for (let l = 1; l <= maxL(g); l++)
        if (stars(g, l) < 1)
            return false;
    return true;
};

const doneLevels = g => {
    let n = 0;
    for (let l = 1; l <= maxL(g); l++)
        if (stars(g, l) >= 1)
            n++;
    return n;
};

const stickerCount = () => GAMES.reduce((n, G) => n + doneLevels(G.id), 0);
const gameStars = g => {
    let n = 0;
    for (let l = 1; l <= maxL(g); l++)
        n += stars(g, l);
    return n;
};

const nextLevelFor = g => {
    const M = maxL(g);
    for (let l = 1; l <= M; l++)
        if (stars(g, l) < 1)
            return l;
    for (let l = 1; l <= M; l++)
        if (stars(g, l) < 3)
            return l;
    return M;
};

const BADGES = [
    { id: 'retry', e: '💪', n: 'Pantang Menyerah', d: 'Lulus level setelah mencoba lagi', t: () => (S.retryWins || 0) >= 1 },
    { id: 'stk25', e: '🎁', n: 'Kolektor Stiker', d: 'Kumpulkan 25 stiker', t: () => stickerCount() >= 25 },
    { id: 'stk50', e: '🏺', n: 'Penjaga Koleksi', d: 'Kumpulkan 50 stiker', t: () => stickerCount() >= 50 },
    { id: 'stk100', e: '🏆', n: 'Juara Koleksi', d: 'Kumpulkan semua stiker', t: () => stickerCount() >= totalLevels() },
    { id: 'gdone', e: '🎓', n: 'Tamat Satu Game', d: 'Selesaikan 10 level di satu game', t: () => GAMES.some(G => allLevels(G.id)) },
    { id: 'first', e: '🚀', n: 'Langkah Pertama', d: 'Selesaikan 1 permainan', t: () => S.plays >= 1 },
    { id: 'listener', e: '🎧', n: 'Pendengar Setia', d: 'Dengarkan 25 ayat di mode Belajar', t: () => S.listened >= 25 },
    { id: 'h10', e: '📗', n: 'Penghafal Cilik', d: 'Tandai 10 ayat sudah hafal', t: () => memCount() >= 10 },
    { id: 'h50', e: '📚', n: 'Penghafal Hebat', d: 'Tandai 50 ayat sudah hafal', t: () => memCount() >= 50 },
    { id: 'surah', e: '🏅', n: 'Satu Surah Hafal', d: 'Hafal semua ayat dalam satu surah', t: () => surahsDone() >= 1 },
    { id: 's3', e: '🔥', n: 'Api Semangat', d: 'Belajar 3 hari berturut-turut', t: () => S.best >= 3 },
    { id: 's7', e: '🌋', n: 'Pekan Istiqomah', d: 'Belajar 7 hari berturut-turut', t: () => S.best >= 7 },
    { id: 'perfect', e: '💯', n: 'Nilai Sempurna', d: 'Raih 3 bintang di satu level', t: () => Object.values(S.prog).some(p => Object.values(p).some(x => x >= 3)) },
    { id: 'all', e: '🎮', n: 'Penjelajah Game', d: 'Coba semua game', t: () => Object.keys(S.played).length >= GAMES.length },
    { id: 'king', e: '👑', n: 'Raja Level 10', d: 'Selesaikan Level 10 di satu game', t: () => Object.values(S.prog).some(p => (p[10] || 0) >= 1) },
    { id: 'st30', e: '🌟', n: 'Kolektor Bintang', d: 'Kumpulkan 30 bintang', t: () => totalStars() >= 30 },
    { id: 'st150', e: '🌠', n: 'Pemburu Bintang', d: 'Kumpulkan 150 bintang', t: () => totalStars() >= 150 },
    { id: 'xp1000', e: '⚡', n: 'Pemburu XP', d: 'Kumpulkan 1000 XP', t: () => S.xp >= 1000 }
];

function checkBadges() {
    BADGES.forEach(b => {
        if (!S.badges[b.id] && b.t()) {
            S.badges[b.id] = dstr();
            toast(`${b.e} Lencana baru: ${b.n}!`, 'gold');
            burst();
        }
    });
}

function addXP(n) {
    const before = levelInfo(S.xp).L;
    S.xp += n;
    const a = levelInfo(S.xp);
    if (a.L > before) {
        toast(`🎉 Naik ke Level ${a.L}: ${a.title}!`, 'gold');
        burst();
    }
}
