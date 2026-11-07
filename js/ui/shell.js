/* =====================================================================
   Kerangka aplikasi
   Pilihan materi (juz/surah), header, dan perpindahan halaman (nav).
   ===================================================================== */
'use strict';

/* ---------- scope materi ---------- */
function scopePool() {
    const { juz, surah } = S.scope;
    let p = VERSES;
    if (surah)
        p = p.filter(v => String(v.s) === String(surah));
    else if (juz !== 'all')
        p = p.filter(v => String(v.juz) === String(juz));
    return p.length ? p : VERSES;
}

const scopeSurahs = () => SURAH_LIST.filter(s => S.scope.juz === 'all' || String(s.juz) === String(S.scope.juz));
const JUZ_PILLS = [['30', 'Juz 30'], ['29', 'Juz 29'], ['28', 'Juz 28'], ['1', 'Al-Fatihah'], ['all', 'Semua']];

function dataLine() {
    const small = scopePool().length < 14 ? `<div class="scope-info">ℹ️ Materi ini sedikit, jadi sebagian soal diambil dari surah lain agar tiap level tetap 10 soal berbeda.</div>` : '';
    if (dataStatus === 'full')
        return small + `<div class="scope-info">✅ Materi lengkap: ${VERSES.length} ayat dari ${SURAH_LIST.length} surah (Al-Fatihah + Juz 28, 29, 30)</div>`;
    if (dataStatus === 'loading')
        return `<div class="scope-info">⏳ Memuat surah ${loadDone}/${ALL_SURAHS.length}…</div>`;
    return `<div class="scope-info">📶 Saat ini memakai ${VERSES.length} ayat bawaan. Sambungkan internet untuk membuka semua surah. <button class="btn btn-ghost btn-sm" data-act="load-data" style="margin-top:6px">Muat semua surah</button></div>`;
}

function scopeCard() {
    const pool = scopePool(), ns = new Set(pool.map(v => v.s)).size;
    return `<div class="card scope">
    <h3>📚 Pilih materi hafalan</h3>
    <div class="pills" role="group" aria-label="Pilih juz">${JUZ_PILLS.map(([j, l]) => `<button class="pill ${S.scope.juz === j ? 'on' : ''}" data-act="juz" data-j="${j}">${l}</button>`).join('')}</div>
    <label class="sr" for="surah-sel">Pilih surah</label>
    <select class="sel" id="surah-sel"><option value="">Semua surah di pilihan ini</option>${scopeSurahs().map(s => `<option value="${s.no}" ${String(S.scope.surah) === String(s.no) ? 'selected' : ''}>${s.no}. ${esc(s.name)} — ${esc(s.mean)}</option>`).join('')}</select>
    <div class="scope-info">📌 ${pool.length} ayat dari ${ns} surah siap dimainkan</div>
    ${dataLine()}
  </div>`;
}

/* ---------- header ---------- */
function updateHeader() {
    $('#h-streak').textContent = liveStreak();
    $('#h-stars').textContent = totalStars();
    $('#h-lv').textContent = levelInfo(S.xp).L;
    $('#h-sound').textContent = S.sound ? '🔊' : '🔇';
    const gs = $('#g-sound');
    if (gs)
        gs.textContent = S.sound ? '🔊' : '🔇';
}

/* ---------- navigasi ---------- */
let curView = 'home';

function nav(to) {
    stopAudio();
    studyToken++;
    clearGameTimers();
    if (pendingData && to !== 'game') {
        applyData(pendingData);
        pendingData = null;
        toast(`📚 Semua surah Juz 28-30 siap: ${VERSES.length} ayat!`, 'gold');
    }
    curView = to;
    $$('main > section').forEach(s => s.classList.add('hidden'));
    $('#v-' + to).classList.remove('hidden');
    document.body.classList.toggle('in-game', to === 'game');
    $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.to === to || (to === 'game' && t.dataset.to === 'home')));
    ({ home: renderHome, learn: renderLearn, badges: renderBadges, profile: renderProfile, game: () => { } })[to]();
    updateHeader();
    window.scrollTo({ top: 0, behavior: 'instant' });
}
