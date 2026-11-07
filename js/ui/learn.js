/* =====================================================================
   Halaman Belajar
   Daftar surah, kartu ayat, pemutaran, dan tanda hafal.
   ===================================================================== */
'use strict';

/* ---------- BELAJAR ---------- */
let studyToken = 0;
const learnState = { hij: false, taj: false, surah: null, repeat: 1, rate: 1, cover: false };

/* Ta'awudz (Al-Fatihah) dan Bismillah (surah lain kecuali At-Taubah) sebagai "ayat 0", seperti TalqinKu */
const preCache = {};

function preAyat(no) {
    if (no === 9 || !AYAT_COUNT[no])
        return null;
    if (!preCache[no])
        preCache[no] = no === 1
            ? { key: '1:0', s: 1, n: 0, sName: 'Al-Fatihah', label: "Ta'awudz", ar: mushafStyle("أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَٰنِ ٱلرَّجِيمِ"), id: 'Aku berlindung kepada Allah dari godaan syaitan yang terkutuk.', words: [] }
            : { key: no + ':0', s: no, n: 0, sName: (SURAHS[no] || {}).name || '', label: 'Bismillah', ar: mushafStyle("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"), id: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.', words: [] };
    return preCache[no];
}

function preFromKey(key) {
    const m = /^(\d+):0$/.exec(key || '');
    return m ? preAyat(+m[1]) : null;
}

function preCard(no) {
    const p = preAyat(no);
    if (!p)
        return '';
    return `<article class="ayat bsm-card" id="ay-${no}-0" data-key="${p.key}"><div class="ayat-top"><span class="no"><i class="med">0</i>${p.label}</span><button class="play" data-act="play-one" data-key="${p.key}">🔊 Dengar</button></div>
    <div class="ar ar-lg" lang="ar" dir="rtl" style="color:var(--sun-d);text-align:center">${p.ar}</div><div class="tr">${esc(p.id)}</div></article>`;
}

const qariSelect = () => `<select class="sel qari-sel" aria-label="Pilih qari" style="width:auto;padding:7px 10px;font-size:.88rem">${QARIS.map(q => `<option value="${q.id}" ${curQari().id === q.id ? 'selected' : ''}>🎙️ ${esc(q.name)}</option>`).join('')}</select>`;

function surahProgress(s) {
    const n = s.verses.filter(v => S.memorized[v.key]).length;
    return { n, t: s.verses.length, p: Math.round(n / s.verses.length * 100) };
}

function renderLearn() {
    if (learnState.taj)
        return renderTaj();
    if (learnState.hij)
        return renderHij();
    if (learnState.surah)
        return renderSurah(learnState.surah);
    $('#v-learn').innerHTML = `<h2 class="sec-title" style="margin-top:6px">📖 Ruang Belajar</h2>
  <p class="muted" style="font-weight:700;margin-top:-4px">Dengarkan, ulang, lalu tandai ayat yang sudah kamu hafal. Hafalan jadi lebih mudah kalau didengar berulang-ulang.</p>
  <button class="hijentry" data-act="open-hij"><span class="ar hij-big" lang="ar" dir="rtl">ا ب ت</span><span><b>Huruf Hijaiyyah</b><small>30 huruf · nama, lambang Latin resmi, dan bentuk sambung</small></span><span class="go">Buka ▶</span></button>
  <button class="hijentry tajentry" data-act="open-taj"><span class="ar hij-big" lang="ar" dir="rtl">نْ ـً</span><span><b>Tajwid: Hukum Nun Sukun &amp; Tanwin</b><small>5 hukum bacaan · huruf, cara baca, dan contoh ayat</small></span><span class="go">Buka ▶</span></button>
  <div class="pills" style="margin:10px 0 14px">${JUZ_PILLS.map(([j, l]) => `<button class="pill ${S.scope.juz === j ? 'on' : ''}" data-act="juz-learn" data-j="${j}">${l}</button>`).join('')}</div>
  <div class="surahs">${SURAH_LIST.filter(s => S.scope.juz === 'all' || String(s.juz) === String(S.scope.juz)).map(s => {
        const p = surahProgress(s);
        return `<button class="scard" data-act="open-surah" data-s="${s.no}">
    <span class="top2"><span class="no">${s.no}</span><span class="ar ar-sm" lang="ar">${s.ar}</span></span>
    <b>${esc(s.name)}</b><small>${esc(s.mean)} · ${s.verses.length} ayat</small>
    <span class="bar dark" style="height:10px"><i style="width:${p.p}%"></i></span><small>${p.n}/${p.t} ayat hafal ${p.p === 100 ? '🏅' : ''}</small></button>`;
    }).join('')}</div>`;
}

function renderSurah(no) {
    const s = SURAHS[no], p = surahProgress(s);
    $('#v-learn').innerHTML = `<button class="btn btn-ghost btn-sm" data-act="learn-back">⬅ Semua surah</button>
  <div class="row" style="margin:12px 0 0;justify-content:space-between"><div><h2 style="font-size:1.7rem;color:var(--night)">${esc(s.name)}</h2><div class="muted" style="font-weight:700">Surah ${s.no} · ${esc(s.mean)} · ${s.verses.length} ayat · ${s.juz === 1 ? 'Pembuka' : 'Juz ' + s.juz}</div></div><div class="ar ar-lg" lang="ar" dir="rtl">${s.ar}</div></div>
  <div class="bar dark" style="height:12px;margin-top:10px"><i id="sp-bar" style="width:${p.p}%"></i></div><small class="muted" id="sp-txt" style="font-weight:800">${p.n}/${p.t} ayat hafal</small>
  <div class="ctrl">
    <button class="btn btn-sun btn-sm" data-act="play-all">▶ Putar semua</button>
    <button class="btn btn-ghost btn-sm" data-act="stop">⏹ Berhenti</button>
    <span class="seg" aria-label="Ulangi tiap ayat">${[1, 3, 5].map(r => `<button class="${learnState.repeat === r ? 'on' : ''}" data-act="repeat" data-r="${r}">${r}x</button>`).join('')}</span>
    <span class="seg" aria-label="Kecepatan">${[[.75, 'Pelan'], [1, 'Normal']].map(([r, l]) => `<button class="${learnState.rate === r ? 'on' : ''}" data-act="rate" data-r="${r}">${l}</button>`).join('')}</span>
    ${arSizeSeg(true)}
    ${qariSelect()}
    <button class="btn btn-ghost btn-sm" data-act="cover">${learnState.cover ? '👀 Buka ayat' : '🙈 Tutup ayat'}</button>
  </div>
  ${learnState.cover ? '<p class="hint" style="margin:0 0 10px">Ayat sedang ditutup. Coba ucapkan dari ingatan, lalu ketuk ayatnya untuk memeriksa.</p>' : ''}
  ${preCard(s.no)}
  ${s.verses.map(v => ayatCard(v)).join('')}`;
}

function ayatCard(v) {
    const mem = !!S.memorized[v.key];
    return `<article class="ayat ${mem ? 'mem' : ''} ${learnState.cover ? 'cover' : ''}" id="ay-${v.s}-${v.n}" data-key="${v.key}">
    <div class="ayat-top"><span class="no"><i class="med">${v.n}</i>Ayat</span><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="play" data-act="play-one" data-key="${v.key}">🔊 Dengar</button><button class="tick ${mem ? 'on' : ''}" data-act="mem" data-key="${v.key}" aria-pressed="${mem}">${mem ? '✅ Sudah hafal' : '⬜ Sudah hafal?'}</button></span></div>
    <div class="ar ${v.words.length > 18 ? 'ar-md' : 'ar-lg'} cov userselect" lang="ar" dir="rtl" data-act="reveal">${v.ar} <span class="ayah-number-icon">\u06DD${toArabicDigits(v.n)}</span></div>
    <div class="tr">${esc(v.id)}</div></article>`;
}

function markNow(key) {
    $$('.ayat.now').forEach(e => e.classList.remove('now'));
    if (!key)
        return;
    const v = vById(key), el = $(`#ay-${v.s}-${v.n}`);
    if (el) {
        el.classList.add('now');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function playList(list) {
    const token = ++studyToken;
    for (const v of list) {
        for (let r = 0; r < learnState.repeat; r++) {
            if (token !== studyToken)
                return;
            markNow(v.key);
            const ok = await playOnce(v, learnState.rate);
            if (ok === null || token !== studyToken)
                return;
            if (!ok) {
                audioFail();
                studyToken++;
                markNow(null);
                return;
            }
            S.listened++;
            touchStreak();
            await wait(400);
        }
    }
    if (token === studyToken) {
        markNow(null);
        save();
        checkBadges();
        updateHeader();
    }
}

function toggleMem(key) {
    const v = vById(key);
    if (S.memorized[key]) {
        delete S.memorized[key];
        S.unmem[key] = Date.now();
    }
    else {
        S.memorized[key] = Date.now();
        delete S.unmem[key];
        touchStreak();
        sfx('star');
    }
    save();
    const el = $(`#ay-${v.s}-${v.n}`);
    if (el) {
        const on = !!S.memorized[key];
        el.classList.toggle('mem', on);
        const b = $('.tick', el);
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
        b.textContent = on ? '✅ Sudah hafal' : '⬜ Sudah hafal?';
    }
    const p = surahProgress(SURAHS[v.s]);
    const bar = $('#sp-bar');
    if (bar) {
        bar.style.width = p.p + '%';
        $('#sp-txt').textContent = `${p.n}/${p.t} ayat hafal`;
    }
    if (S.memorized[key] && p.p === 100) {
        toast(`🏅 MasyaAllah! Surah ${SURAHS[v.s].name} sudah hafal semua!`, 'gold');
        burst();
    }
    checkBadges();
    updateHeader();
    save();
}
