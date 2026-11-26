/* =====================================================================
   Game 20: Pesawat Pencari Ayat (terbang mencari awan berisi ayat)
   Pesawat terbang ke kanan. Tiap gelombang membawa beberapa awan, dan tiap awan memuat
   potongan ayat. Satu awan berisi potongan yang dicari, awan lain berisi potongan yang salah.

   Soal berupa "misi": satu surah dan beberapa ayat berurutan (misalnya QS Al-Lahab ayat 1-3).
   Tiap level berisi beberapa misi dari surah yang berbeda-beda (tidak ada surah yang berulang dalam satu ronde).
   Materi dipilih lewat pilihan juz di layar awal game ini (Juz 30 / 29 / 28 / 27 / Semua), terpisah dari
   pilihan juz atau surah di beranda, supaya pilihan satu surah di beranda tidak mengunci game ini.
   Ayat yang panjang tidak dipaksakan masuk satu awan: ayat dipotong menjadi 2-3 bagian
   (di level tinggi dipotong per 1-2 kata), dan tiap bagian dicari berurutan di gelombang sendiri.
   Satu gelombang = satu soal (10 soal per level).

   Gerak pesawat: pindah jalur (atas/bawah), MAJU (waktu berjalan lebih cepat dan pesawat
   langsung menyerbu awan) dan MUNDUR (mengerem, waktu berjalan lebih lambat agar sempat berpikir).

   Makin tinggi level: awan makin banyak dan cepat, potongan makin pendek, awan salah makin mirip,
   petunjuk arti makin sedikit, awan berkabut, dan langit berubah dari siang ke malam.
   Hanya ayat asli Al-Qur'an yang dipakai di awan. Tidak ada ayat buatan atau ayat yang diubah.
   ===================================================================== */
'use strict';

/* ---------- 1. Pengaturan umum ---------- */
const PL_FONT = "'Scheherazade New','Traditional Arabic',serif";
const plFb = fs => `700 ${fs}px ${PL_FONT}`;   // font cadangan untuk kata yang tidak memakai glyph QCF4
const PL_LATIN = "'Baloo 2','Nunito',system-ui,sans-serif";
const PL_MARK = /\u00A0[\u06D6-\u06DC\u06DE\u06E9]+/g;   // tanda waqaf berdiri sendiri, dibuang dari awan agar tidak sesak
const PL_K = 2;                                           // kepadatan piksel kanvas (makin besar makin tajam)
const PL_FB = .9;                                         // lama umpan balik setelah pesawat menyentuh awan (detik)
const PL_SLIDE = .18;                                     // bagian awal gelombang saat awan masuk dari kanan layar
const PL_JUZ = [['30', 'Juz 30'], ['29', 'Juz 29'], ['28', 'Juz 28'], ['27', 'Juz 27'], ['all', 'Semua']];
const plJuzNow = () => (S.plJuz && PL_JUZ.some(j => j[0] === String(S.plJuz)) && plSurahs(String(S.plJuz)).length) ? String(S.plJuz) : '30';
const plSurahs = juz => { const l = SURAH_LIST.filter(s => juz === 'all' || String(s.juz) === juz); return l.length ? l : SURAH_LIST; };
const PL_SKY = [
  { c: ['#47B5EE', '#A5E0F8', '#FFF3CF'], sun: [.82, .12, '#FFF4B8'], text: '#0F3D42' },                       // siang
  { c: ['#3F8FD8', '#F2C987', '#FFE8B5'], sun: [.82, .2, '#FFE08A'], text: '#0F3D42' },                          // sore
  { c: ['#5B50B8', '#F08B6C', '#FFD18B'], sun: [.8, .62, '#FFB45A'], text: '#3A2150' },                          // senja
  { c: ['#0A1B38', '#1B3C6A', '#3A6A90'], sun: [.82, .12, '#FFF6D0'], text: '#12304F', night: true }            // malam
];

/* ---------- 2. Bahan soal ---------- */

/* Memotong satu ayat menjadi bagian-bagian seimbang, tiap bagian maksimal fw kata.
   Hanya cap bagian pertama yang dipakai (ayat yang sangat panjang tidak diminta habis).
   tot = jumlah bagian seandainya ayat dipotong sampai habis. */
function plChunks(v, fw, cap) {
  const w = v.words.map(x => x.replace(PL_MARK, '')).filter(Boolean);
  const tot = Math.max(1, Math.ceil(w.length / fw)), size = Math.ceil(w.length / tot), out = [];
  for (let k = 0; k < Math.min(tot, cap); k++) out.push({ words: w.slice(k * size, (k + 1) * size), k, tot });
  return out;
}

/* Teks awan: tanda … di sisi yang terpotong (sebelum bagian pertama dan sesudah bagian terakhir tidak ada). */
const plText = (words, pre, post) => (pre ? '… ' : '') + words.join(' ') + (post ? ' …' : '');

/* Memilih satu misi: surah + ayat berurutan. Surah dipilih acak dan diutamakan yang belum dipakai
   pada ronde ini dan belum muncul baru-baru ini, supaya soal selalu bervariasi. */
function plMission(want, ctx) {
  const { surahs, recent, usedS, usedV, begin, fw, cap } = ctx;
  let c = surahs.filter(s => !usedS.has(s.no) && s.verses.length >= want);          // surah yang belum dipakai di ronde ini
  if (!c.length) c = surahs.filter(s => !usedS.has(s.no));
  if (!c.length) c = surahs.filter(s => s.verses.length >= want);                   // semua surah sudah terpakai: baru boleh mengulang
  if (!c.length) c = surahs;
  const pool = [c.filter(s => !recent.has(s.no)), c];
  const s = pick(pool.find(g => g.length)), n = s.verses.length, k = Math.min(want, n);
  const starts = [Math.random() < begin ? 0 : rnd(n - k + 1)];
  for (let t = 0; t < 9; t++) starts.push(rnd(n - k + 1));
  const score = st => {                                               // makin kecil makin baik
    const vs = s.verses.slice(st, st + k);
    return (vs.some(v => usedV.has(v.key)) ? 1000 : 0) + vs.filter(v => v.words.length > fw * cap).length * 10 + starts.indexOf(st) * .01;
  };
  const st = starts.reduce((a, b) => score(b) < score(a) ? b : a, starts[0]);
  const vs = s.verses.slice(st, st + k);
  vs.forEach(v => usedV.add(v.key));
  usedS.add(s.no);
  return { s, vs };
}

/* Menyusun semua gelombang (soal) untuk satu level. Mengembalikan { route, waves }. */
function plPlan(lengths, begin, fw, cap, mw, total, juz) {
  S.seen = S.seen || {};
  const ctx = { surahs: plSurahs(juz), recent: new Set(S.seen[20] || []), usedS: new Set(), usedV: new Set(), begin, fw, cap }, waves = [];
  let lens = lengths, budget = mw;
  if (ctx.surahs.length < lens.length) {                                // surah di juz ini lebih sedikit dari jumlah misi: misi dikurangi dan dipanjangkan, surah tidak diulang
    budget = Math.ceil(total / ctx.surahs.length);
    lens = Array(ctx.surahs.length).fill(budget);
  }
  for (let li = 0; waves.length < total && li < 30; li++) {
    const m = plMission(lens[Math.min(li, lens.length - 1)], ctx), mi = li;
    let used = 0;                                                       // tiap misi dibatasi budget gelombang supaya surahnya bervariasi
    m.vs.forEach(v => {
      const cs = plChunks(v, fw, cap);
      if (used >= budget || (used > 0 && used + cs.length > budget)) return;
      cs.slice(0, budget - used).forEach(ch => { waves.push({ mi, s: m.s, v, ch }); used++; });
    });
  }
  waves.length = Math.min(waves.length, total);
  const route = [];                                                   // kelompokkan ulang per misi (misi yang terpotong di ujung tetap dihitung)
  waves.forEach((W, k) => {
    const prev = waves[k - 1];
    if (!prev || prev.mi !== W.mi) route.push({ s: W.s, vs: [] });
    W.mi = route.length - 1;
    W.first = !prev || prev.mi !== W.mi;
    W.prev = (prev && prev.mi === W.mi) ? prev : null;
    const r = route[W.mi];
    if (!r.vs.includes(W.v)) r.vs.push(W.v);
  });
  return { route, waves, used: [...ctx.usedS], pool: ctx.surahs.length };
}

/* Memilih potongan penyesat (selalu potongan ayat asli).
   dis: 0 surah lain, 1 campuran, 2 bagian lain dari ayat yang sama + ayat bertetangga, 3 ditambah potongan yang mirip. */
function plDistract(W, n, dis, fw, cap) {
  const v = W.v, pre = W.ch.k > 0, post = W.ch.k < W.ch.tot - 1, tw = W.ch.words.length, tText = plText(W.ch.words, pre, post);
  const mk = x => { const cs = plChunks(x, fw, cap), c = cs[Math.min(W.ch.k, cs.length - 1)]; return { v: x, words: c.words, text: plText(c.words, pre, post), nch: cs.length }; };
  const miss = o => (dis >= 1 ? Math.abs(o.words.length - tw) : 0) + (o.nch === Math.min(W.ch.tot, cap) ? 0 : 1);   // utamakan awan yang bentuknya mirip
  const order = list => shuffle(list).sort((a, b) => miss(a) - miss(b));
  const same = (SURAHS[v.s] ? SURAHS[v.s].verses : []).filter(x => x.key !== v.key);
  const adj = same.filter(x => Math.abs(x.n - v.n) <= 3), far = same.filter(x => Math.abs(x.n - v.n) > 3), other = VERSES.filter(x => x.s !== v.s);
  const sib = shuffle(plChunks(v, fw, cap).filter(c => c.k !== W.ch.k).map(c => ({ v, words: c.words, text: plText(c.words, pre, post), nch: c.tot })));
  const C = list => list.map(mk), O = () => shuffle(other).slice(0, 80);
  let groups;
  if (dis === 0) groups = [order(C(O().slice(0, 60))), order(C(same))];
  else if (dis === 1) groups = [order([...C(shuffle(far).slice(0, 30)), ...C(O().slice(0, 40))]), order(C(adj)), order(C(O()))];
  else if (dis === 2) groups = [sib.slice(0, Math.ceil(n / 2)), order(C(adj)), order(C(far)), order(C(O()))];
  else {
    const look = VERSES.filter(x => x.key !== v.key).map(mk).map(o => ({ o, s: similarity(tText, o.text) })).sort((a, b) => b.s - a.s).slice(0, 8).map(r => r.o);
    groups = [shuffle(look).slice(0, Math.ceil(n / 2)), sib.slice(0, 1), order(C(adj)), order(C(far)), order(C(O()))];
  }
  return distract(normAr(tText), n, groups, o => normAr(o.text), true);
}

/* ---------- 3. Permainan ---------- */
function r20(el, cfg, l) {
  const P = LV[20], i = l - 1, total = run.total, myRun = run, N = P.rows[i], K = PL_K, SKY = PL_SKY[P.sky[i]], FW = P.fw[i], CAP = P.cap[i];
  const land = matchMedia('(orientation:landscape) and (min-aspect-ratio:5/4)').matches;
  const SW = land ? 640 : 480, SH = land ? 400 : 600, PX = land ? 84 : 70, TOPY = land ? 22 : 28;
  const rowH = (SH - 2 * TOPY) / N, CW = land ? 380 : 330, CH = Math.min(rowH * .88, land ? 118 : 148), PS = Math.min(1, rowH / 96);
  const NOSE = 48 * PS, PXMIN = PX - 26 * PS, PXMAX = SW * .5;
  const rowY = r => TOPY + rowH * (r + .5), clampRow = r => Math.max(0, Math.min(N - 1, r)), clampX = x => Math.max(PXMIN, Math.min(PXMAX, x));
  let juz = plJuzNow(), route, waves, plan;
  const makePlan = () => { plan = plPlan(P.route[i], P.begin[i], FW, CAP, P.mw[i], total, juz); route = plan.route; waves = plan.waves; };
  makePlan();
  const pl = { ti: 0, started: false, over: false, t: 0, phase: 'in', pass: 0, fb: 0, banner: 0, lane: Math.floor(N / 2), py: rowY(Math.floor(N / 2)), cx: PX, tx: PX, hold: 0, hitX: 0, tilt: 0, spin: 0, shake: 0, clouds: [], res: Array(total).fill(null), peeked: false, combo: 0, hit: -1, ok: false, off: 0, trail: 0, parts: [] };
  const q = run.q = { v: waves[0].v, pl };
  Object.defineProperties(q, { waves: { get: () => waves }, route: { get: () => route } });

  el.innerHTML = `<div class="pl-hud" id="pl-hud"></div><div class="sn-strip" id="pl-strip"></div>
    <div class="pm-box pl-box"><div class="pl-wrap" style="aspect-ratio:${SW}/${SH}"><canvas id="pl" width="${SW * K}" height="${SH * K}" role="img" aria-label="Langit tempat pesawat mencari awan yang berisi ayat"></canvas>
      <div class="pm-start pl-start" id="pl-start"><div class="pl-start-in"><p class="pl-start-t">Pilih materi, lalu terbangkan pesawat ke awan yang berisi ayat yang dicari!</p>
        <div class="pl-juz" id="pl-juz" role="group" aria-label="Pilih juz"></div><p class="pl-juz-info" id="pl-juz-info"></p>
        <button class="btn btn-mint" data-act="pl-go">▶ Terbang!</button>
        <p class="hint pl-start-h">Ketuk jalur awan atau tombol ▲ ▼ untuk pindah jalur. Tahan ▶ untuk maju (lebih cepat) dan ◀ untuk mundur (mengerem).</p></div></div></div>
      <div class="rn-pad pl-pad" aria-label="Kendali pesawat"><button class="dp pl-hb" data-hd="-1" aria-label="Mundur, mengerem">◀</button><button class="dp" data-act="pl-dir" data-d="-1" aria-label="Terbang ke jalur atas">▲</button><button class="dp" data-act="pl-dir" data-d="1" aria-label="Terbang ke jalur bawah">▼</button><button class="dp pl-hb" data-hd="1" aria-label="Maju, lebih cepat">▶</button></div></div>
    <div class="sr" id="pl-live" aria-live="polite"></div>`;

  const cv = $('#pl'), ctx = cv.getContext('2d');
  const paused = () => !pl.started || pl.over || document.hidden || !$('#overlay').classList.contains('hidden');

  /* ---------- tulisan di awan ---------- */
  /* lebar teks; memakai font Mushaf Madinah (QCF4) bila font-nya sudah termuat, bila belum memakai font biasa */
  const mw = (t, fs) => (typeof QCF !== 'undefined' && QCF.canvasReady(t)) ? QCF.measure(ctx, t, fs, plFb) : ctx.measureText(t).width;
  function fitText(text) {
    const maxW = CW * .72, words = text.split(' ');
    ctx.direction = 'rtl';
    for (let fs = land ? 34 : 36; fs >= 16; fs -= 2) {
      ctx.font = `700 ${fs}px ${PL_FONT}`;
      if (fs * 1.45 <= CH * .56 && mw(text, fs) <= maxW) return { fs, lines: [text] };
      if (N <= 4 && words.length >= 3 && fs * 2.9 <= CH * .8) {
        const mid = Math.ceil(words.length / 2), a = words.slice(0, mid).join(' '), b = words.slice(mid).join(' ');
        if (Math.max(mw(a, fs), mw(b, fs)) <= maxW) return { fs, lines: [a, b] };
      }
    }
    return { fs: 16, lines: [text] };
  }

  /* ---------- tampilan atas (HUD) dan deret hasil ---------- */
  const brief = t => { t = String(t || ''); return t.length > 110 ? t.slice(0, 107).trim() + '…' : t; };
  const sup = W => (W.ch.tot > 1 ? `<sup>${W.ch.k + 1}</sup>` : '');
  function renderHud() {
    const W = waves[pl.ti], m = route[W.mi], h = P.hint[i], first = m.vs[0], last = m.vs[m.vs.length - 1];
    const showArti = h === 2 || (h === 1 && W.first) || pl.peeked, showPrev = W.prev && h >= 1;
    const unit = FW === 1 ? 'kata' : 'bagian', part = W.ch.tot > 1 ? `<small class="pl-part">${unit} ${W.ch.k + 1} dari ${W.ch.tot}</small>` : '';
    $('#pl-hud').innerHTML = `<div class="pl-top"><span class="pl-mis">✈️ Misi ${W.mi + 1}/${route.length}</span><b>QS ${esc(m.s.name)}</b><span>ayat ${first.n}${last.n !== first.n ? '–' + last.n : ''}</span></div>
      <div class="pl-find">Cari ayat ke-<b class="pl-n">${W.v.n}</b> ${part}</div>
      <div class="pl-extra">${showPrev ? `<div class="pl-prev">Sebelumnya: <span class="ar" lang="ar" dir="rtl">${esc(W.prev.ch.words.slice(-4).join(' '))}</span></div>` : ''}
        ${showArti ? `<div class="pl-arti">“${esc(brief(W.v.id))}”</div>` : `<button class="btn btn-ghost btn-sm" data-act="pl-peek">💡 Intip arti</button>`}</div>`;
    const live = $('#pl-live');
    if (live) live.textContent = `Misi ${W.mi + 1}. QS ${m.s.name}. Cari ayat ke-${W.v.n}${W.ch.tot > 1 ? `, ${unit} ${W.ch.k + 1} dari ${W.ch.tot}` : ''}.`;
  }
  function renderStrip() {
    $('#pl-strip').innerHTML = waves.map((W, k) => {
      const r = pl.res[k], now = k === pl.ti && !pl.over;
      return `<i class="${r === true ? 'ok' : r === false ? 'bad' : r === 'peek' ? 'now' : now ? 'now' : ''}${W.first && k ? ' gap' : ''}"><span>${r === false ? '✗' : r === 'peek' ? '💡' : (r === true || now) ? W.v.n + sup(W) : '·'}</span></i>`;
    }).join('');
  }

  /* ---------- gelombang awan ---------- */
  function spawn() {
    const W = waves[pl.ti], pre = W.ch.k > 0, post = W.ch.k < W.ch.tot - 1;
    const items = shuffle([{ v: W.v, ok: true, text: plText(W.ch.words, pre, post) }, ...plDistract(W, N - 1, P.dis[i], FW, CAP).map(o => ({ v: o.v, ok: false, text: o.text }))]);
    pl.clouds = items.map((it, r) => ({ row: r, v: it.v, ok: it.ok, text: it.text, state: '', fit: fitText(it.text) }));
    if (typeof QCF !== 'undefined' && QCF.enabled()) {                  // muat font Mushaf Madinah untuk awan ini, lalu ukur ulang tulisannya
      const cl = pl.clouds;
      QCF.preload(cl.map(c => c.text)).then(() => { if (pl.clouds === cl) cl.forEach(c => { c.fit = fitText(c.text); }); });
    }
    pl.t = 0; pl.phase = 'in'; pl.pass = 0; pl.fb = 0; pl.hit = -1; pl.peeked = false; pl.spin = 0; pl.shake = 0; pl.tx = PX;
    pl.banner = W.first ? 1.2 : 0;
    q.v = W.v;
    renderHud();
    renderStrip();
  }
  function resolve() {
    const W = waves[pl.ti], hit = pl.clouds.find(c => c.row === pl.lane), ok = !!hit && hit.ok, point = ok && !pl.peeked;
    pl.hitX = cloudX(pl.t);
    pl.phase = 'out'; pl.fb = PL_FB; pl.pass = 0; pl.hit = hit ? hit.row : -1; pl.ok = ok; pl.hold = 0;
    pl.clouds.forEach(c => { if (c === hit) c.state = ok ? 'ok' : 'bad'; else if (c.ok) c.state = 'gold'; });
    pl.res[pl.ti] = point ? true : ok ? 'peek' : false;
    pl.combo = point ? pl.combo + 1 : 0;
    if (ok) { pl.spin = 1; sparkle(pl.cx + 60, rowY(pl.lane), 16); } else { pl.shake = 1; sparkle(pl.cx + 60, rowY(pl.lane), 8, '#9AA7B2'); }
    quickAns(point, W.v);
    renderStrip();
    const live = $('#pl-live'), what = W.ch.tot > 1 ? `ayat ${W.v.n} bagian ${W.ch.k + 1}` : `ayat ${W.v.n}`;
    if (ok && !point) toast('Benar! Tapi kamu mengintip arti, jadi belum dapat poin.');
    else if (!ok) toast(`Bukan itu. Awan yang benar (${what}) ditandai emas.`);
    if (live) live.textContent = ok ? `Benar, ${what}.` : `Salah. Yang benar ${what}.`;
  }
  function next() {
    pl.ti++;
    if (pl.ti >= total) { pl.over = true; pl.clouds = []; renderStrip(); } else spawn();
  }

  /* ---------- gerak ---------- */
  const amb = Array.from({ length: 8 }, () => ({ x: rnd(SW), y: rnd(SH), s: .2 + rnd(30) / 100, v: 12 + rnd(30), a: .22 + rnd(20) / 100 }));
  const streaks = Array.from({ length: 7 }, () => ({ x: rnd(SW), y: rnd(SH), w: 30 + rnd(50), v: 260 + rnd(240) }));
  function sparkle(x, y, n, col) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * 6.283, sp = 60 + Math.random() * 150;
      pl.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: .7, max: .7, r: 2 + Math.random() * 3, c: col || pick(['#FFE070', '#3DE6A5', '#FFFFFF', '#FFC94D']) });
    }
  }
  /* posisi awan: masuk dari kanan, lalu perlahan mendekat. Tepi kiri awan mencapai hidung pesawat (posisi awal) saat u = 1 */
  const cloudX = u => {
    const sx = SW + CW / 2 + 20, rx = SW - CW / 2 - 16, ex = PX + NOSE + CW / 2;
    if (u < PL_SLIDE) { const k = u / PL_SLIDE; return sx + (rx - sx) * (1 - Math.pow(1 - k, 3)); }
    return rx + (ex - rx) * ((u - PL_SLIDE) / (1 - PL_SLIDE));
  };
  function update(dt) {
    pl.off += dt;
    const gas = pl.phase === 'in' ? Math.max(.6, Math.min(1.8, 1 + (pl.cx - PX) * .012)) : 1;   // maju mempercepat waktu, mundur memperlambat
    const sp = (.6 + P.speed[i] * 2) * gas;
    amb.forEach(a => { a.x -= a.v * sp * dt; if (a.x < -CW * a.s) { a.x = SW + CW * a.s; a.y = rnd(SH); } });
    streaks.forEach(s => { s.x -= s.v * gas * dt; if (s.x < -s.w) { s.x = SW + rnd(80); s.y = rnd(SH); } });
    if (pl.phase === 'in' && pl.hold && pl.banner <= 0) pl.tx = clampX(pl.tx + pl.hold * dt * 170);
    pl.cx += (pl.tx - pl.cx) * Math.min(1, dt * 10);
    const dy = rowY(pl.lane) - pl.py;
    pl.py += dy * Math.min(1, dt * 9);
    pl.tilt += ((Math.max(-.32, Math.min(.32, dy * .012))) - pl.tilt) * Math.min(1, dt * 12);
    if (pl.spin > 0) pl.spin = Math.max(0, pl.spin - dt / .7);
    if (pl.shake > 0) pl.shake = Math.max(0, pl.shake - dt / PL_FB);
    pl.trail -= dt;
    if (pl.trail <= 0) { pl.trail = .045; pl.parts.push({ x: pl.cx - 48 * PS, y: pl.py + 3, vx: -70, vy: (Math.random() - .5) * 12, life: .55, max: .55, r: 5 * PS + Math.random() * 3, c: pl.shake > 0 ? '#7C8791' : '#FFFFFF', trail: true }); }
    pl.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.trail) p.vy += 220 * dt; p.life -= dt; });
    pl.parts = pl.parts.filter(p => p.life > 0).slice(-70);
    if (pl.banner > 0) { pl.banner -= dt; return; }
    if (pl.phase === 'in') {
      pl.t += dt * P.speed[i] * gas;
      const touch = pl.t > PL_SLIDE + .02 && cloudX(Math.min(1, pl.t)) - CW / 2 <= pl.cx + NOSE;   // hidung pesawat menyentuh awan
      if (pl.t >= 1 || touch) { pl.t = Math.min(1, pl.t); resolve(); }
    } else {
      pl.fb -= dt;
      pl.pass = Math.min(1, 1 - pl.fb / PL_FB);
      if (pl.fb <= 0) next();
    }
  }

  /* ---------- gambar ---------- */
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const bg = document.createElement('canvas');
  bg.width = SW * K; bg.height = SH * K;
  (function () {
    const b = bg.getContext('2d');
    b.scale(K, K);
    const g = b.createLinearGradient(0, 0, 0, SH);
    SKY.c.forEach((c, k) => g.addColorStop(k / (SKY.c.length - 1), c));
    b.fillStyle = g; b.fillRect(0, 0, SW, SH);
    const sx = SW * SKY.sun[0], sy = SH * SKY.sun[1];
    if (SKY.night) { b.fillStyle = '#fff'; for (let k = 0; k < 60; k++) { b.globalAlpha = .25 + Math.random() * .7; b.fillRect(Math.random() * SW, Math.random() * SH * .8, 2, 2); } b.globalAlpha = 1; }
    const rg = b.createRadialGradient(sx, sy, 6, sx, sy, 110);
    rg.addColorStop(0, SKY.night ? 'rgba(255,246,208,.45)' : 'rgba(255,244,184,.9)'); rg.addColorStop(1, 'rgba(255,244,184,0)');
    b.fillStyle = rg; b.fillRect(sx - 120, sy - 120, 240, 240);
    b.fillStyle = SKY.sun[2]; b.beginPath(); b.arc(sx, sy, SKY.night ? 22 : 30, 0, 6.3); b.fill();
    if (SKY.night) { b.fillStyle = SKY.c[0]; b.beginPath(); b.arc(sx + 10, sy - 5, 19, 0, 6.3); b.fill(); }   // bulan sabit
  })();

  const sprites = {};
  function sprite(state) {
    const key = state + (SKY.night ? 'n' : '');
    if (sprites[key]) return sprites[key];
    const c = document.createElement('canvas'), pad = 14;
    c.width = (CW + pad * 2) * K; c.height = (CH + pad * 2) * K;
    const g = c.getContext('2d');
    g.scale(K, K);
    const cols = { '': SKY.night ? ['#F4F8FF', '#BFD0EA'] : ['#FFFFFF', '#D9EEFB'], ok: ['#F2FFF8', '#7FE3B8'], bad: ['#FFF3F3', '#FF9C9C'], gold: ['#FFFBE6', '#FFD45C'] }[state];
    const glow = { ok: 'rgba(61,230,165,.95)', bad: 'rgba(255,90,90,.9)', gold: 'rgba(255,200,40,.95)' }[state];
    const gr = g.createLinearGradient(0, pad, 0, pad + CH);
    gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]);
    g.fillStyle = gr;
    g.shadowColor = glow || 'rgba(20,70,110,.28)'; g.shadowBlur = glow ? 20 : 9; g.shadowOffsetY = glow ? 0 : 4;
    const x = pad, y = pad, w = CW, h = CH;
    g.beginPath();
    g.moveTo(x + w * .5 + w * .46, y + h * .66); g.ellipse(x + w * .5, y + h * .66, w * .46, h * .28, 0, 0, 6.2832);
    [[.24, .5, .30], [.42, .38, .36], [.64, .42, .32], [.8, .57, .26]].forEach(([fx, fy, fr]) => { g.moveTo(x + w * fx + h * fr, y + h * fy); g.arc(x + w * fx, y + h * fy, h * fr, 0, 6.2832); });
    g.fill();
    return sprites[key] = c;
  }

  const textAlpha = u => P.fog[i] === 0 ? 1 : P.fog[i] === 1 ? Math.max(0, Math.min(1, (u - .22) / .12)) : Math.max(0, Math.min(1, (u - .42) / .12));

  function drawCloud(c, x, alpha, u) {
    const y = rowY(c.row);
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite(c.state), x - CW / 2 - 14, y - CH / 2 - 14, CW + 28, CH + 28);
    const ta = textAlpha(u);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    if (ta > .02) {
      ctx.globalAlpha = alpha * ta;
      ctx.fillStyle = c.state === 'bad' ? '#8A1F23' : c.state === 'ok' ? '#0B5C40' : SKY.text;
      let fs = c.fit.fs;                                          // jaga tulisan tetap di dalam awan, apa pun font yang sedang terpakai
      ctx.font = `700 ${fs}px ${PL_FONT}`;
      const wide = Math.max(...c.fit.lines.map(ln => mw(ln, fs))), maxW = CW * .74, maxH = CH * .8;
      fs = Math.max(11, Math.min(fs * (wide > maxW ? maxW / wide : 1), maxH / (1.45 * c.fit.lines.length)));
      ctx.font = `700 ${fs}px ${PL_FONT}`;
      const lh = fs * ((typeof QCF !== 'undefined' && c.fit.lines.length > 1 && QCF.canvasReady(c.fit.lines[0])) ? 1.75 : 1.45), y0 = y + CH * .05 - (c.fit.lines.length - 1) * lh / 2;
      c.fit.lines.forEach((ln, k) => {
        if (typeof QCF !== 'undefined' && QCF.canvasReady(ln)) QCF.draw(ctx, ln, x, y0 + k * lh, fs, plFb);
        else ctx.fillText(ln, x, y0 + k * lh);
      });
    }
    if (ta < .98) {
      ctx.globalAlpha = alpha * (1 - ta) * .75; ctx.fillStyle = '#7F9FB8';
      [-18, 0, 18].forEach(d => { ctx.beginPath(); ctx.arc(x + d, y + CH * .05, 4.5, 0, 6.3); ctx.fill(); });
    }
    ctx.globalAlpha = 1;
    if (c.state) {                                              // lencana hasil di pojok awan
      const bx = x + CW * .36, by = y - CH * .3, col = c.state === 'ok' ? '#17B26A' : c.state === 'bad' ? '#E5484D' : '#E0A800';
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx, by, 15, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `800 17px ${PL_LATIN}`; ctx.direction = 'ltr';
      ctx.fillText(c.state === 'bad' ? '✗' : '✓', bx, by + 1);
      if (c.state === 'gold') { ctx.fillStyle = col; ctx.font = `800 15px ${PL_LATIN}`; ctx.fillText(`ayat ${c.v.n}`, x - CW * .34, y - CH * .34); }
      ctx.globalAlpha = 1;
    }
  }

  function drawPlane(now) {
    const sh = pl.shake > 0 ? Math.sin(now / 28) * 4 * pl.shake : 0;
    ctx.save();
    ctx.translate(pl.cx + sh, pl.py + (pl.shake > 0 ? Math.cos(now / 33) * 3 * pl.shake : 0) + Math.sin(now / 260) * 2.5);
    ctx.rotate(pl.tilt + (pl.spin > 0 ? -(1 - pl.spin) * 6.2832 : 0));                          // jungkir balik kecil saat jawaban benar
    ctx.scale(PS, PS);
    ctx.fillStyle = 'rgba(10,40,60,.18)'; ctx.beginPath(); ctx.ellipse(0, 46, 34, 5, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#0E8A6E'; ctx.beginPath(); ctx.moveTo(-34, -6); ctx.lineTo(-52, -32); ctx.lineTo(-32, -32); ctx.lineTo(-18, -8); ctx.closePath(); ctx.fill();   // sirip ekor
    ctx.fillStyle = '#F2B82B'; ctx.beginPath(); ctx.ellipse(-40, 3, 14, 4.5, -.1, 0, 6.3); ctx.fill();                                                           // sayap ekor
    const bd = ctx.createLinearGradient(0, -17, 0, 17);
    bd.addColorStop(0, '#FFFFFF'); bd.addColorStop(1, '#CFE6EC');
    ctx.fillStyle = bd; ctx.beginPath(); ctx.ellipse(0, 0, 46, 17, 0, 0, 6.3); ctx.fill();                                                                        // badan
    ctx.lineWidth = 2; ctx.strokeStyle = '#9CC3CB'; ctx.stroke();
    ctx.fillStyle = '#F2B82B'; ctx.beginPath(); ctx.arc(-20, 1, 7.5, 0, 6.3); ctx.fill();                                                                         // bulan sabit di badan
    ctx.fillStyle = '#E6F1F3'; ctx.beginPath(); ctx.arc(-17, -1, 6.5, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#F2B82B'; ctx.beginPath(); ctx.moveTo(14, 8); ctx.lineTo(-6, 8); ctx.lineTo(-30, 27); ctx.lineTo(-12, 27); ctx.closePath(); ctx.fill();            // sayap (menyapu ke belakang)
    ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = '#BFE8F7'; ctx.beginPath(); ctx.arc(16, -8, 11, 0, 6.3); ctx.fill();                                                                           // kaca kokpit
    ctx.strokeStyle = '#7FB8CC'; ctx.lineWidth = 2; ctx.stroke();
    const gp = ctx.createRadialGradient(14, -11, 1, 16, -8, 8);                                                                                                    // si Bulan Emas jadi pilot
    gp.addColorStop(0, '#FFF1A8'); gp.addColorStop(1, '#F2B82B');
    ctx.fillStyle = gp; ctx.beginPath(); ctx.arc(16, -7, 7, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#0E8A6E'; ctx.beginPath(); ctx.arc(16, -10, 5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#17322F'; ctx.beginPath(); ctx.arc(18.5, -7, 1.2, 0, 6.3); ctx.arc(13.5, -7, 1.2, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(70,80,90,.4)'; ctx.beginPath(); ctx.ellipse(48, 0, 3.5 + Math.abs(Math.sin(now / 40)) * 1.5, 19, 0, 0, 6.3); ctx.fill();                  // baling-baling
    ctx.fillStyle = '#F2B82B'; ctx.beginPath(); ctx.arc(47, 0, 4.5, 0, 6.3); ctx.fill();
    ctx.restore();
  }

  function draw(now) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.clearRect(0, 0, SW, SH);
    ctx.drawImage(bg, 0, 0, SW, SH);
    ctx.globalAlpha = .2; ctx.fillStyle = '#fff';                                              // garis kecepatan
    streaks.forEach(s => ctx.fillRect(s.x, s.y, s.w, 2));
    ctx.globalAlpha = 1;
    amb.forEach(a => { ctx.globalAlpha = a.a; ctx.drawImage(sprite(''), a.x - CW * a.s / 2, a.y - CH * a.s / 2, (CW + 28) * a.s, (CH + 28) * a.s); });
    ctx.globalAlpha = .16; ctx.fillStyle = '#fff';                                              // jalur terbang pesawat
    rr(ctx, 8, pl.py - rowH * .46, SW - 16, rowH * .92, 18); ctx.fill();
    ctx.globalAlpha = 1;
    pl.parts.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / p.max) * (p.trail ? .6 : 1); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.trail ? (1.6 - p.life / p.max) : 1), 0, 6.3); ctx.fill(); });
    ctx.globalAlpha = 1;
    const out = pl.phase === 'out', e = pl.pass * pl.pass;
    pl.clouds.forEach(c => {
      let x, a = 1, u = pl.t;
      if (out) {
        x = pl.hitX - (CW + 160) * e;
        a = c.row === pl.hit || c.state === 'gold' ? 1 - e * .6 : .4 * (1 - e);
        u = 1;
      } else x = cloudX(pl.t);
      drawCloud(c, x, a, u);
    });
    drawPlane(now);
    if (pl.combo >= 3 && !pl.over) { ctx.globalAlpha = .9; ctx.fillStyle = '#fff'; ctx.font = `800 20px ${PL_LATIN}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.direction = 'ltr'; ctx.fillText(`🔥 x${pl.combo}`, 14, 8); ctx.globalAlpha = 1; }
    if (pl.banner > 0) {                                                                          // spanduk misi
      const W = waves[pl.ti], m = route[W.mi], first = m.vs[0], last = m.vs[m.vs.length - 1], al = Math.max(0, Math.min(1, pl.banner / .25, (1.2 - pl.banner) / .2));
      ctx.globalAlpha = al * .9; ctx.fillStyle = '#0A2F40'; rr(ctx, SW * .09, SH * .33, SW * .82, 118, 22); ctx.fill();
      ctx.globalAlpha = al; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
      ctx.fillStyle = '#FFD65A'; ctx.font = `800 17px ${PL_LATIN}`; ctx.fillText(`MISI ${W.mi + 1} DARI ${route.length}`, SW / 2, SH * .33 + 24);
      const ttl = `QS ${m.s.name} · ayat ${first.n}${last.n !== first.n ? '–' + last.n : ''}`, lim = SW * .76;
      ctx.fillStyle = '#fff'; ctx.font = `800 26px ${PL_LATIN}`;
      const tf = Math.min(26, 26 * lim / Math.max(1, ctx.measureText(ttl).width));          // nama surah panjang: kecilkan agar muat di spanduk
      ctx.font = `800 ${tf}px ${PL_LATIN}`; ctx.fillText(ttl, SW / 2, SH * .33 + 56);
      ctx.direction = 'rtl'; ctx.fillStyle = '#BFE9E0'; ctx.font = `700 28px ${PL_FONT}`;
      const af = Math.min(28, 28 * lim / Math.max(1, ctx.measureText(m.s.ar).width));
      ctx.font = `700 ${af}px ${PL_FONT}`; ctx.fillText(m.s.ar, SW / 2, SH * .33 + 94);
      ctx.globalAlpha = 1;
    }
  }

  let lastT = performance.now();
  function anim(now) {
    if (run !== myRun || !document.getElementById('pl')) return;
    const dt = Math.min(.05, (now - lastT) / 1000);
    lastT = now;
    if (!paused()) update(dt);
    draw(now);
    requestAnimationFrame(anim);
  }

  /* ---------- kendali ---------- */
  function start() {
    if (pl.started) return;
    pl.started = true;
    S.seen = S.seen || {};
    S.seen[20] = [...(S.seen[20] || []), ...plan.used].slice(-24);                // catat surah ronde ini agar ronde berikutnya cenderung beda
    S.plJuz = juz;
    save();
    const s = $('#pl-start'); if (s) s.classList.add('hidden');
  }
  function renderJuz() {
    $('#pl-juz').innerHTML = PL_JUZ.filter(j => j[0] === 'all' || SURAH_LIST.some(s => String(s.juz) === j[0])).map(j => `<button class="pl-chip${j[0] === juz ? ' on' : ''}" data-act="pl-juz" data-j="${j[0]}" aria-pressed="${j[0] === juz}">${j[1]}</button>`).join('');
    const n = plan.pool;
    $('#pl-juz-info').textContent = `${n} surah tersedia${n < route.length ? ', sebagian surah akan muncul lebih dari sekali' : ''}`;
  }
  function setJuz(j) {                                                                           // ganti materi sebelum terbang: susun ulang soal
    if (pl.started || j === juz) return;
    juz = j; S.plJuz = j;
    makePlan();
    pl.ti = 0; pl.res = Array(total).fill(null); pl.combo = 0;
    spawn(); renderJuz();
  }
  const live = () => pl.phase === 'in' && !pl.over;
  function move(d) { start(); if (live()) pl.lane = clampRow(pl.lane + d); }
  function moveX(d) { start(); if (live()) pl.tx = clampX(pl.tx + d * 70); }                    // geser kiri/kanan: maju atau mundur satu langkah
  function setHold(d) { if (d) start(); pl.hold = d; }                                          // tahan tombol atau keyboard: maju terus atau mundur terus
  function peek() { if (!live() || pl.peeked) return; pl.peeked = true; sfx('tap'); renderHud(); }
  let pd = null;
  cv.addEventListener('pointerdown', e => { pd = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* tanpa capture pun jalan */ } e.preventDefault(); });
  cv.addEventListener('pointerup', e => {
    if (!pd) return;
    const dx = e.clientX - pd.x, dy = e.clientY - pd.y, r = cv.getBoundingClientRect();
    pd = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 26) { if (Math.abs(dy) >= Math.abs(dx)) move(dy < 0 ? -1 : 1); else moveX(dx > 0 ? 1 : -1); }
    else { start(); if (live()) pl.lane = clampRow(Math.floor(((e.clientY - r.top) / r.height * SH - TOPY) / rowH)); }
    e.preventDefault();
  });
  cv.addEventListener('pointercancel', () => { pd = null; });
  $$('.pl-hb', el).forEach(b => {                                                                  // tombol maju/mundur: ditahan
    const d = +b.dataset.hd, off = () => { if (pl.hold === d) pl.hold = 0; };
    b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (err) { /* tanpa capture pun jalan */ } setHold(d); });
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('lostpointercapture', off);
  });
  Object.assign(q, {
    move, moveX, setHold, setJuz, start, peek, update, pl,
    cheat: ok => { const c = pl.clouds.find(z => ok ? z.ok : !z.ok); if (c) { pl.lane = c.row; pl.py = rowY(c.row); } pl.banner = 0; pl.t = 1; update(0); }   // untuk uji otomatis
  });
  spawn();
  renderJuz();
  draw(performance.now());
  requestAnimationFrame(anim);
  if (document.fonts && document.fonts.load) {                                                    // ukur ulang tulisan setelah font Arab siap
    Promise.race([document.fonts.load(`700 30px 'Scheherazade New'`, 'ابت'), wait(1500)]).then(() => { if (run === myRun) pl.clouds.forEach(c => { c.fit = fitText(c.text); }); }).catch(() => { });
  }
}

document.addEventListener('keydown', e => {
  if (!run || run.g !== 20 || !run.q || !run.q.move || curView !== 'game' || !$('#overlay').classList.contains('hidden')) return;
  const dy = { ArrowUp: -1, ArrowDown: 1, w: -1, s: 1, W: -1, S: 1 }[e.key], dx = { ArrowRight: 1, ArrowLeft: -1, d: 1, a: -1, D: 1, A: -1 }[e.key];
  if (dy) { e.preventDefault(); run.q.move(dy); }
  else if (dx) { e.preventDefault(); run.q.setHold(dx); }
  else if ((e.key === ' ' || e.key === 'Enter') && !run.q.pl.started && !(e.target && e.target.closest && e.target.closest('button'))) { e.preventDefault(); run.q.start(); }
});
document.addEventListener('keyup', e => {
  if (!run || run.g !== 20 || !run.q || !run.q.setHold) return;
  const dx = { ArrowRight: 1, ArrowLeft: -1, d: 1, a: -1, D: 1, A: -1 }[e.key];
  if (dx && run.q.pl.hold === dx) run.q.setHold(0);
});
Object.assign(ACTIONS, {
  'pl-go': () => run.q && run.q.start && run.q.start(),
  'pl-dir': t => run.q && run.q.move && run.q.move(+t.dataset.d),
  'pl-peek': () => run.q && run.q.peek && run.q.peek(),
  'pl-juz': t => run.q && run.q.setJuz && run.q.setJuz(t.dataset.j)
});
