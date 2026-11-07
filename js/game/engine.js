/* =====================================================================
   Mesin game
   Memulai permainan, soal berikutnya, timer, jawaban, dan layar hasil. Dipakai semua game.
   ===================================================================== */
'use strict';

/* =====================================================================
   MESIN GAME
   ===================================================================== */
let run = null;
const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    if (run)
        run.tms.push(id);
    return id;
};

function clearGameTimers() {
    stopTimer();
    if (run) {
        run.tms.forEach(clearTimeout);
        run.tms = [];
    }
}

const arSpan = (t, c = 'ar-md') => `<span class="ar ${c}" lang="ar" dir="rtl">${t}</span>`;
const szOf = v => v.words.length > 16 ? 'ar-md' : v.words.length > 9 ? 'ar-lg' : 'ar-xl';
const mushaf = (inner, o = {}) => `<div class="mushaf ${o.blur ? 'blur' : ''}">${o.badge ? `<span class="badge-n">${esc(o.badge)}</span>` : ''}<div class="ar ${o.v ? szOf(o.v) : 'ar-xl'}" lang="ar" dir="rtl">${inner}</div></div>`;
const listenBtn = v => `<button class="btn btn-sun btn-sm listen" data-act="gplay" data-key="${v.key}">🔊 Dengarkan</button>`;

/* ---------- pengambil materi ---------- */
const maxq = () => innerHeight < 460 ? 10 : innerHeight < 640 ? 16 : 22; // ayat soal dibatasi agar muat satu layar

function pickV(filter = () => true) {
    const f = x => filter(x) && x.words.length <= maxq();
    const seen = new Set((S.seen && S.seen[run.g]) || []);
    const sj = S.scope.juz;
    const tiers = [scopePool().filter(f), VERSES.filter(x => f(x) && (sj === 'all' || String(x.juz) === String(sj))), VERSES.filter(f)];
    let v = null;
    // Utamakan: soal belum muncul di ronde ini & belum pernah muncul baru-baru ini; bila materi terpilih habis, melebar ke juz/surah lain
    for (const list of tiers) {
        for (const c of [list.filter(x => !run.used.has(x.key) && !seen.has(x.key)), list.filter(x => !run.used.has(x.key))]) {
            if (c.length) {
                v = pick(c);
                break;
            }
        }
        if (v)
            break;
    }
    if (!v) {
        const l = VERSES.filter(filter);
        v = pick(l.length ? l : VERSES);
    }
    run.used.add(v.key);
    const arr = S.seen[run.g] = (S.seen[run.g] || []).filter(k => k !== v.key);
    arr.push(v.key);
    if (arr.length > 80)
        arr.shift();
    return v;
}

function others(v, f = () => true) {
    const g = x => x.key !== v.key && x.words.length <= Math.round(maxq() * (innerHeight < 460 ? 1 : 1.35)) && f(x);
    return { same: SURAHS[v.s].verses.filter(g), scope: scopePool().filter(g), all: VERSES.filter(g) };
}

function distract(correctKey, n, groups, keyFn, ordered = false) {
    const seen = new Set([correctKey]), out = [];
    for (const g of groups)
        for (const c of (ordered ? g : shuffle(g))) {
            if (out.length >= n)
                return out;
            const k = keyFn(c);
            if (!seen.has(k)) {
                seen.add(k);
                out.push(c);
            }
        }
    return out;
}

const lev = (a, b) => {
    const m = a.length, n = b.length;
    if (!m)
        return n;
    if (!n)
        return m;
    let p = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
        const c = [i];
        for (let j = 1; j <= n; j++)
            c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        p = c;
    }
    return p[n];
};

const similarity = (a, b) => {
    a = normAr(a).replace(/\s/g, '');
    b = normAr(b).replace(/\s/g, '');
    const L = Math.max(a.length, b.length);
    return L ? 1 - lev(a, b) / L : 0;
};

/* ---------- jalannya permainan ---------- */
function startRun(g, l) {
    closeSheet();
    const G = GAMES[g - 1], cfg = Object.assign({}, G.levels[l - 1]);
    if (innerHeight < 460 && cfg.opts > 4)
        cfg.opts = 4; // layar landscape pendek: maksimal 4 pilihan agar muat
    run = { g, l, G, cfg, idx: 0, total: cfg.q, correct: 0, used: new Set(), locked: false, tms: [], q: null, res: [], missed: [] };
    S.played[g] = 1;
    save();
    nav('game');
    $('#v-game').innerHTML = `<div class="gshell"><div class="ghead">
      <div class="gh-l"><button class="btn btn-ghost btn-sm" data-act="quit" aria-label="Keluar dari permainan">✕ <span class="qtxt">Keluar</span></button></div>
      <div class="gh-c"><h2>${G.emoji} ${esc(G.name)}</h2><small>Level ${l} · ${RANKS[l - 1]}</small></div>
      <div class="gh-r"><span class="score" aria-label="Jawaban benar">⭐ <b id="g-score">0</b></span>
      <button class="icon-btn" data-act="fs" id="g-fs" aria-label="Layar penuh" title="Layar penuh">⛶</button>
      <button class="icon-btn" data-act="sound" id="g-sound" aria-label="Suara">${S.sound ? '🔊' : '🔇'}</button></div></div>
    <div class="bsm ar" lang="ar" dir="rtl" aria-hidden="true">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <div class="prog" id="g-prog" aria-hidden="true"></div>
    <div id="g-timer"></div>
    <div id="gmain"><div id="garea"><div id="gfit"><div class="stage" id="stage"></div></div></div><div id="fb"></div></div></div>`;
    initFit();
    syncFS();
    nextQ();
}

function drawProg() {
    $('#g-prog').innerHTML = Array.from({ length: run.total }, (_, i) => `<i class="${i < run.res.length ? (run.res[i] ? 'done' : 'miss') : (i === run.idx ? 'now' : '')}"></i>`).join('');
}

function nextQ() {
    if (run.idx >= run.total)
        return finishRun();
    clearGameTimers();
    run.locked = false;
    run.q = null;
    if (run.idx === Math.floor(run.total / 2))
        toast('💪 Setengah jalan! Kamu pasti bisa!');
    if (run.idx === run.total - 2)
        toast(run.correct >= passOf(run.total) ? '🔥 Hampir selesai, kamu sudah lulus! Kejar 3 bintang!' : '⏳ Tinggal 2 soal lagi, semangat!');
    $('#fb').innerHTML = '';
    $('#g-timer').innerHTML = '';
    drawProg();
    const st = $('#stage');
    st.innerHTML = '';
    run.G.render(st, run.cfg, run.l);
    window.scrollTo({ top: 0, behavior: 'instant' });
}

/* Timer soal: dihitung dari JavaScript (bukan CSS transition), jadi tetap jalan walau
   perangkat memakai mode "kurangi animasi". Berhenti sementara saat dialog terbuka atau tab tersembunyi. */
let tmr = null;

function stopTimer() {
    if (tmr) {
        cancelAnimationFrame(tmr.raf);
        tmr = null;
    }
}

function paintTimer(root, ratio, secLeft) {
    if (!root)
        return;
    const bar = root.querySelector('.tbar>i'), num = root.querySelector('b');
    ratio = Math.max(0, Math.min(1, ratio));
    if (bar)
        bar.style.transform = 'scaleX(' + ratio + ')';
    if (num)
        num.textContent = '⏱ ' + Math.max(0, Math.ceil(secLeft)) + ' dtk';
    const low = secLeft <= 5 || ratio <= .25;
    root.classList.toggle('low', low);
    root.classList.toggle('mid', !low && ratio <= .55);
    root.setAttribute('aria-valuenow', Math.max(0, Math.ceil(secLeft)));
}

function startTimer(sec) {
    stopTimer();
    const box = $('#g-timer');
    if (!box)
        return;
    box.innerHTML = '<div class="timer" id="tm" role="timer" aria-label="Sisa waktu"><span class="tbar" aria-hidden="true"><i id="tfill"></i></span><b>⏱ ' + sec + ' dtk</b></div>';
    const root = $('#tm'), total = sec * 1000, myRun = run, t = { raf: 0 };
    let left = total, last = performance.now();
    tmr = t;
    paintTimer(root, 1, sec);
    const tick = now => {
        if (tmr !== t || run !== myRun || run.locked)
            return;
        const paused = document.hidden || !$('#overlay').classList.contains('hidden');
        if (!paused)
            left -= Math.min(250, Math.max(0, now - last));
        last = now;
        paintTimer(root, left / total, left / 1000);
        if (left <= 0) {
            stopTimer();
            if (!run.locked) {
                markOptions(null);
                ans(false, run.q.v, 'Waktu habis! ⏰ Ini jawabannya:');
            }
            return;
        }
        t.raf = requestAnimationFrame(tick);
    };
    t.raf = requestAnimationFrame(tick);
}

function markOptions(sel) {
    $$('#stage .opt').forEach(b => {
        b.disabled = true;
        if (b.dataset.ok === '1')
            b.classList.add('ok');
        else if (b === sel)
            b.classList.add('bad');
        else
            b.classList.add('dim');
    });
}

const vrow = v => v.taj ? tajRow(v) : v.hij ? `<div class="vrow hijrow"><div class="hij-g ar" lang="ar" dir="rtl">${v.h.ch}</div><div class="hij-t"><b>${esc(v.h.name)}</b> <span class="muted" style="font-weight:800">(${esc(v.h.lat)})</span><div class="tr">Huruf ke-${v.h.i}${hijAlt(v.h) ? ` · sebutan lain “${esc(hijAlt(v.h))}”` : ''}</div></div></div>` : `<div class="vrow"><div class="meta"><span>${esc(v.sName)} · ayat ${v.n}</span><button class="play" data-act="gplay" data-key="${v.key}">🔊 Dengar</button></div>
  <div class="ar ar-md userselect" lang="ar" dir="rtl" style="text-align:center">${v.ar}</div><div class="tr">${esc(v.id)}</div></div>`;

function ans(correct, verses, msgHtml = '') {
    if (!run || run.locked)
        return;
    run.locked = true;
    clearGameTimers();
    const list = Array.isArray(verses) ? verses : [verses];
    run.res.push(correct);
    if (correct)
        run.correct++;
    else
        list.forEach(v => {
            if (!run.missed.some(m => m.key === v.key))
                run.missed.push(v);
        });
    sfx(correct ? 'correct' : 'wrong');
    if (correct && run.l >= 2)
        burst({ particleCount: 40, spread: 55 });
    $('#g-score').textContent = run.correct;
    drawProg();
    const last = run.idx + 1 >= run.total;
    $('#fb').innerHTML = `<div class="fb ${correct ? 'good' : 'oops'} ${list.length > 2 ? 'many' : ''}" role="status"><h3>${correct ? '✅ ' + esc(pick(CHEER)) : '💡 ' + esc(pick(TRYAGAIN))}</h3>
    ${msgHtml ? `<div style="font-weight:700">${msgHtml}</div>` : ''}
    <div style="display:grid;gap:8px">${list.map(vrow).join('')}</div>
    <button class="btn ${correct ? 'btn-mint' : 'btn-sun'} btn-block" data-act="next">${last ? 'Lihat hasil 🎉' : 'Lanjut ➡️'}</button></div>`;
}

const MOTIVE = [{ k: '94:6' }, { k: '94:7' }, { k: '96:1' },
    { t: 'Tidak apa-apa salah. Setiap salah membuatmu makin dekat dengan hafal!' },
    { t: 'Pahlawan hafalan bukan yang tidak pernah salah, tapi yang mau mencoba lagi.' },
    { t: 'Ulang sedikit demi sedikit setiap hari, lama-lama ayatnya melekat di hati.' }];

function finishRun() {
    const { g, l, total, correct, G } = run, ML = maxL(g), pm = passOf(total), st = starsFor(correct, total), pass = st >= 1, key = g + '-' + l;
    const prev = stars(g, l), hadAll = allLevels(g);
    S.prog[g] = S.prog[g] || {};
    if (st > prev)
        S.prog[g][l] = st;
    const first = pass && prev < 1, gained = Math.max(0, st - prev), mult = 1 + .25 * (l - 1);
    const xp = Math.round((correct * 10 + st * 10 + (st === 3 ? 10 : 0)) * mult);
    const bonus = first ? 10 + 5 * l : 0, master = (first && !hadAll && allLevels(g)) ? (ML > 1 ? 200 : 60) : 0;
    S.fails = S.fails || {};
    let retry = false;
    if (pass) {
        if (first && S.fails[key] > 0) {
            S.retryWins = (S.retryWins || 0) + 1;
            retry = true;
        }
        S.fails[key] = 0;
    }
    else
        S.fails[key] = (S.fails[key] || 0) + 1;
    const tries = S.fails[key] || 0;
    goalState();
    S.today.rounds++;
    S.plays++;
    touchStreak();
    addXP(xp + bonus + master);
    save();
    checkBadges();
    updateHeader();
    save();
    clearGameTimers();
    $('#fb').innerHTML = '';
    $('#g-timer').innerHTML = '';
    drawProg();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const full = allLevels(g);
    if (pass) {
        sfx('win');
        burst({ particleCount: 150, spread: 90 });
        if (st === 3 || master)
            later(() => burst({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0, y: .7 } }), 350);
        for (let i = 0; i < st; i++)
            later(() => sfx('star'), 500 + i * 350);
        const M = MOTIFS[g - 1], tr = tierOf(l, g), u = pick(UCAPAN), tamat = (l === ML && full);
        const title = tamat ? `Game ${esc(G.name)} Tamat! 👑` : `Level ${l} Selesai!`;
        $('#stage').innerHTML = `<div class="result win"><div class="rA">${mascotSVG('cheer')}
      <div class="ucapan"><div class="ar ar-lg" lang="ar" dir="rtl">${u.ar}</div><small>${esc(u.id)}</small></div>
      <h2 style="font-size:1.7rem;color:var(--night)">${title}</h2>
      <p class="muted" style="margin:0;font-weight:700">Kamu lulus dengan ${correct} dari ${total} soal benar!</p>
      <div class="big-stars" role="img" aria-label="${st} dari 3 bintang">${[1, 2, 3].map(x => `<span class="${x <= st ? 'pop' : 'off'}" style="--i:${x}">⭐</span>`).join('')}</div>
      </div><div class="rB">
      <div class="sticker t${tr}" role="img" aria-label="Stiker ${esc(M.n)} level ${l}"><span class="stk-new">${first ? 'Baru!' : 'Koleksi'}</span><span class="stk-e">${M.e}</span><b>${esc(M.n)}</b><small>Level ${l} · ${RANKS[l - 1]} · ${TIER_NAME[tr]}</small></div>
      <div class="stat-row"><span class="stat">✅ ${correct}/${total} benar</span><span class="stat">⚡ +${xp} XP</span>${bonus ? `<span class="stat">🎁 Bonus lulus +${bonus} XP</span>` : ''}${master ? `<span class="stat">👑 Bonus tamat +${master} XP</span>` : ''}${gained ? `<span class="stat">🌟 +${gained} bintang</span>` : ''}</div>
      ${first && l < ML ? `<div class="tag" style="font-size:1rem">🔓 Level ${l + 1} (${RANKS[l]}) terbuka!</div>` : ''}
      ${retry ? '<div class="tag" style="font-size:1rem">💪 Pantang menyerah! Berhasil setelah mencoba lagi.</div>' : ''}
      ${st < 3 ? `<p class="hint" style="margin:0">Dapat ${Math.ceil(total * .9)} benar untuk meraih 3 bintang ⭐⭐⭐</p>` : '<p class="hint" style="margin:0">Nilai sempurna! Kamu luar biasa!</p>'}
      </div>
      <div class="res-btns" style="display:grid;gap:10px;width:100%">
        ${tamat ? `<button class="btn btn-sun btn-block" data-act="cert-game" data-g="${g}">🎓 Ambil sertifikat ${esc(G.name)}</button>` : ''}
        ${l < ML ? `<button class="btn btn-mint btn-block" data-act="start" data-g="${g}" data-l="${l + 1}">Lanjut ke Level ${l + 1} ➡️</button>` : `<button class="btn btn-mint btn-block" data-act="nav" data-to="home">🎮 Pilih game lain</button>`}
        <button class="btn btn-ghost btn-block" data-act="start" data-g="${g}" data-l="${l}">🔄 Main lagi${st < 3 ? ' (kejar 3 bintang)' : ''}</button>
        <button class="btn btn-ghost btn-block" data-act="nav" data-to="badges">🎁 Lihat hadiahku</button>
      </div></div>`;
    }
    else {
        sfx('wrong');
        const need = pm - correct, m = pick(MOTIVE), mv = m.k && vById(m.k);
        const head = correct >= pm - 1 ? 'Sedikit lagi!' : correct >= 3 ? 'Hampir bisa, yuk coba lagi!' : 'Jangan menyerah, kamu pasti bisa!';
        const surahs = (G.hij || G.taj) ? [] : [...new Map(run.missed.filter(v => !v.hij).map(v => [v.s, v])).values()].slice(0, 3);
        $('#stage').innerHTML = `<div class="result lose"><div class="rA">${mascotSVG()}
      <h2 style="font-size:1.7rem;color:var(--night)">${head}</h2>
      <p style="margin:0;font-weight:800">Kamu benar ${correct} dari ${total}. Butuh ${pm} benar untuk lulus${l < ML ? ` dan membuka Level ${l + 1}` : ''}, kurang <span style="color:var(--coral-d)">${need}</span> lagi!</p>
      <div class="need" role="img" aria-label="${correct} dari ${pm} benar yang dibutuhkan">${Array.from({ length: total }, (_, i) => `<i class="${i < correct ? 'on' : ''} ${i === pm - 1 ? 'goal' : ''}"></i>`).join('')}</div>
      <small class="muted" style="font-weight:700;margin-top:-6px">Garis emas = batas lulus</small>
      <div class="mot">${mv ? `<div class="ar ar-md" lang="ar" dir="rtl">${mv.ar}</div><small>“${esc(mv.id)}” (QS ${esc(mv.sName)}: ${mv.n})</small>` : `<b>${esc(m.t)}</b>`}</div>
      </div><div class="rB">
      ${tries >= 2 ? `<div class="tag" style="font-size:.95rem">💛 Sudah ${tries} kali mencoba. Kamu hebat karena tidak menyerah!</div>` : ''}
      <p class="hint" style="margin:0">💡 Tips: ${esc(G.tip)}</p>
      ${run.missed.length ? `<div class="missed"><h3 style="font-size:1.1rem">${G.taj ? 'Hukum yang perlu diulang' : 'Ayat yang perlu diulang'}</h3>${run.missed.slice(0, 4).map(vrow).join('')}
        <div class="row" style="gap:8px">${surahs.map(v => `<button class="btn btn-ghost btn-sm" data-act="study-surah" data-s="${v.s}">📖 Pelajari ${esc(v.sName)}</button>`).join('')}</div></div>` : ''}
      </div>
      <div class="res-btns" style="display:grid;gap:10px;width:100%">
        <button class="btn btn-sun btn-block" data-act="start" data-g="${g}" data-l="${l}">🔄 Coba lagi</button>
        ${G.taj ? `<button class="btn btn-mint btn-block" data-act="study-taj">📖 Belajar tajwid dulu, lalu coba lagi</button>` : G.hij ? `<button class="btn btn-mint btn-block" data-act="study-hij">📖 Belajar huruf dulu, lalu coba lagi</button>` : `<button class="btn btn-mint btn-block" data-act="study-surah" data-s="${(run.missed[0] || { s: Object.keys(SURAHS)[0] }).s}">📖 Belajar dulu, lalu coba lagi</button>`}
        <button class="btn btn-ghost btn-block" data-act="nav" data-to="home">🏠 Menu</button>
      </div></div>`;
    }
}

/* ---------- tabel kesulitan: 10 level per game, naik sedikit demi sedikit ---------- */ 
