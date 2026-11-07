/* =====================================================================
   Penyimpanan progres (localStorage)
   State pemain S, fungsi save(), tanggal, streak, dan target harian.
   ===================================================================== */
'use strict';

/* ---------- penyimpanan ---------- */
const KEY = 'ayatplay_v2';
const defaults = () => ({ name: '', xp: 0, streak: 0, best: 0, last: '', today: { date: '', rounds: 0 }, prog: {}, memorized: {}, unmem: {}, resetAt: 0, nameAt: 0, badges: {}, played: {}, listened: 0, plays: 0, sound: true, arFont: 'kid', arSize: 1.15, qari: 'mishary', seen: {}, fails: {}, retryWins: 0, scope: { juz: '30', surah: '' } });

function loadState() {
    let s = defaults();
    try {
        const raw = localStorage.getItem(KEY);
        if (raw)
            s = Object.assign(s, JSON.parse(raw));
        if (s.qari === 'github_anak')
            s.qari = 'mishary';
        else { // pindahkan XP dari versi lama
            const old = parseInt(localStorage.getItem('ayatplay_xp') || '0', 10);
            if (old > 0)
                s.xp = old;
        }
    }
    catch (e) { }
    return s;
}

let S = loadState();

function save() {
    try {
        localStorage.setItem(KEY, JSON.stringify(S));
    }
    catch (e) { }
    if (typeof cloudSchedule === 'function')
        cloudSchedule();
}

/* ---------- tanggal, streak, target harian ---------- */
const dstr = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);
const yesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dstr(d);
};

function touchStreak() {
    const t = dstr();
    if (S.last === t)
        return;
    S.streak = (S.last === yesterday()) ? S.streak + 1 : 1;
    S.last = t;
    S.best = Math.max(S.best, S.streak);
}

const liveStreak = () => (S.last === dstr() || S.last === yesterday()) ? S.streak : 0;

function goalState() {
    if (S.today.date !== dstr())
        S.today = { date: dstr(), rounds: 0 };
    return { n: Math.min(S.today.rounds, 3), goal: 3 };
}
