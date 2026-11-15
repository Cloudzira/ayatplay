/* =====================================================================
   Game 20: Pesawat Pencari Ayat (terbang mencari awan berisi ayat)
   Pesawat terbang ke kanan. Tiap gelombang membawa beberapa awan, dan tiap awan memuat
   potongan ayat. Satu awan berisi ayat yang dicari, awan lain berisi ayat yang salah.
   Anak memindahkan pesawat ke jalur awan yang benar sebelum awan sampai.
   Soal berupa "misi": satu surah dan beberapa ayat berurutan (misalnya QS 'Abasa ayat 1-5).
   Pesawat mencari ayat 1, lalu ayat 2, dan seterusnya. Satu gelombang = satu soal.
   Makin tinggi level: awan makin banyak dan cepat, potongan ayat makin pendek, awan salah
   makin mirip, petunjuk arti makin sedikit, awan berkabut, dan langit berubah dari siang ke malam.
   Hanya ayat asli Al-Qur'an yang dipakai di awan. Tidak ada ayat buatan atau ayat yang diubah.
   ===================================================================== */
'use strict';

/* ---------- 1. Pengaturan umum ---------- */
const PL_FONT = "'Scheherazade New','Traditional Arabic',serif";
const PL_LATIN = "'Baloo 2','Nunito',system-ui,sans-serif";
const PL_MARK = /\u00A0[\u06D6-\u06DC\u06DE\u06E9]+/g;   // tanda waqaf berdiri sendiri, dibuang dari awan agar tidak sesak
const PL_K = 2;                                           // kepadatan piksel kanvas (makin besar makin tajam)
const PL_FB = .9;                                         // lama umpan balik setelah pesawat menyentuh awan (detik)
const PL_SLIDE = .18;                                     // bagian awal gelombang saat awan masuk dari kanan layar
const PL_SKY = [
  { c: ['#47B5EE', '#A5E0F8', '#FFF3CF'], sun: [.82, .12, '#FFF4B8'], text: '#0F3D42' },                       // siang
  { c: ['#3F8FD8', '#F2C987', '#FFE8B5'], sun: [.82, .2, '#FFE08A'], text: '#0F3D42' },                          // sore
  { c: ['#5B50B8', '#F08B6C', '#FFD18B'], sun: [.8, .62, '#FFB45A'], text: '#3A2150' },                          // senja
  { c: ['#0A1B38', '#1B3C6A', '#3A6A90'], sun: [.82, .12, '#FFF6D0'], text: '#12304F', night: true }            // malam
];

/* ---------- 2. Bahan soal ---------- */

/* Potongan ayat untuk satu awan: part 0 = awal ayat, part 1 = akhir ayat. Ayat pendek tampil utuh. */
function plFrag(v, fw, part) {
  const w = v.words.map(x => x.replace(PL_MARK, '')).filter(Boolean);
  if (w.length <= fw) return { text: w.join(' '), full: true };
  return part === 1 ? { text: '… ' + w.slice(-fw).join(' '), full: false } : { text: w.slice(0, fw).join(' ') + ' …', full: false };
}

/* Menyusun daftar misi untuk satu level. lengths = jumlah ayat tiap misi, misalnya [5, 5]. */
function plPlan(lengths, begin) {
  const scope = new Set(scopePool().map(v => v.s));
  S.seen = S.seen || {};
  const recent = new Set(S.seen[20] || []), usedS = new Set(), usedV = new Set(), out = [];
  const withAyat = (k, onlyScope) => SURAH_LIST.filter(s => s.verses.length >= k && (!onlyScope || scope.has(s.no)));
  lengths.forEach(want => {
    let left = want;
    while (left > 0) {
      let k = left, c = withAyat(k, true);
      if (!c.length) c = withAyat(k, false);
      if (!c.length) {                                    // materi sedikit: pakai surah terpanjang yang ada
        const best = SURAH_LIST.reduce((a, s) => (!a || s.verses.length > a.verses.length) ? s : a, null);
        c = [best];
        k = best.verses.length;
      }
      const pool = [c.filter(s => !usedS.has(s.no) && !recent.has(s.no)), c.filter(s => !usedS.has(s.no)), c];
      const s = pick(pool.find(g => g.length)), n = s.verses.length;
      const starts = [Math.random() < begin ? 0 : rnd(n - k + 1)];
      for (let t = 0; t < 8; t++) starts.push(rnd(n - k + 1));
      const st = starts.find(x => !s.verses.slice(x, x + k).some(v => usedV.has(v.key)));
      const vs = s.verses.slice(st === undefined ? starts[0] : st, (st === undefined ? starts[0] : st) + k);
      vs.forEach(v => usedV.add(v.key));
      usedS.add(s.no);
      out.push({ s, vs });
      left -= vs.length;
    }
  });
  S.seen[20] = [...(S.seen[20] || []), ...usedS].slice(-12);
  return out;
}

/* Memilih ayat penyesat (selalu ayat asli). dis: 0 surah lain, 1 campuran, 2 ayat bertetangga, 3 ayat yang mirip. */
function plDistract(v, n, dis, fw, part, tFull) {
  const txt = x => plFrag(x, fw, part), key = x => normAr(txt(x).text);
  const wc = x => txt(x).text.split(' ').length, tw = wc(v), lenAware = dis >= 1;
  const miss = x => (txt(x).full === tFull ? 0 : 100) + (lenAware ? Math.abs(wc(x) - tw) : 0);
  const order = g => shuffle(g).sort((a, b) => miss(a) - miss(b));   // utamakan awan yang bentuknya sama (utuh/terpotong) dan panjangnya mirip
  const same = (SURAHS[v.s] ? SURAHS[v.s].verses : []).filter(x => x.key !== v.key);
  const adj = same.filter(x => Math.abs(x.n - v.n) <= 3), far = same.filter(x => Math.abs(x.n - v.n) > 3);
  const other = VERSES.filter(x => x.s !== v.s);
  let groups;
  if (dis === 0) groups = [order(other), order(same)];
  else if (dis === 1) groups = [order([...far.slice(0, 40), ...shuffle(other).slice(0, 40)]), order(adj), order(other)];
  else if (dis === 2) groups = [order(adj), order(far), order(other)];
  else {
    const me = txt(v).text, look = VERSES.filter(x => x.key !== v.key).map(x => ({ x, s: similarity(me, txt(x).text) })).sort((a, b) => b.s - a.s).slice(0, 8).map(o => o.x);
    groups = [shuffle(look).slice(0, Math.ceil(n / 2)), order(adj), order(far), order(other)];
  }
  return distract(normAr(txt(v).text), n, groups, key, true);
}

/* ---------- 3. Permainan ---------- */
function r20(el, cfg, l) {
  const P = LV[20], i = l - 1, total = run.total, myRun = run, N = P.rows[i], K = PL_K, SKY = PL_SKY[P.sky[i]];
  const land = matchMedia('(orientation:landscape) and (min-aspect-ratio:5/4)').matches;
  const SW = land ? 640 : 480, SH = land ? 400 : 600, PX = land ? 84 : 70, TOPY = land ? 22 : 28;
  const rowH = (SH - 2 * TOPY) / N, CW = land ? 380 : 330, CH = Math.min(rowH * .88, land ? 118 : 148), PS = Math.min(1, rowH / 96);
  const rowY = r => TOPY + rowH * (r + .5), clampRow = r => Math.max(0, Math.min(N - 1, r));
  const route = plPlan(P.route[i], P.begin[i]), waves = [];
  route.forEach((m, mi) => m.vs.forEach((v, j) => waves.push({ mi, v, prev: j ? m.vs[j - 1] : null, first: j === 0 })));
  const pl = { ti: 0, started: false, over: false, t: 0, phase: 'in', pass: 0, fb: 0, banner: 0, lane: Math.floor(N / 2), py: rowY(Math.floor(N / 2)), tilt: 0, spin: 0, shake: 0, clouds: [], res: Array(total).fill(null), peeked: false, part: 0, combo: 0, hit: -1, ok: false, off: 0, trail: 0, parts: [] };
  const q = run.q = { v: waves[0].v, pl };

  el.innerHTML = `<div class="pl-hud" id="pl-hud"></div><div class="sn-strip" id="pl-strip"></div>
    <div class="pm-box pl-box"><div class="pl-wrap" style="aspect-ratio:${SW}/${SH}"><canvas id="pl" width="${SW * K}" height="${SH * K}" role="img" aria-label="Langit tempat pesawat mencari awan yang berisi ayat"></canvas>
      <div class="pm-start" id="pl-start"><div><p style="margin:0 0 10px;font-weight:800;font-size:1.05rem">Terbangkan pesawat ke awan yang berisi ayat yang dicari!</p>
        <p class="pm-legend"><span>☁️ Satu awan benar</span><span>⚡ Awan lain salah</span></p>
        <button class="btn btn-mint" data-act="pl-go">▶ Terbang!</button>
        <p class="hint" style="margin:12px 0 0">Ketuk jalur awan, geser atas/bawah, tombol ▲ ▼, atau keyboard (panah / W S).</p></div></div></div>
      <div class="rn-pad pl-pad" aria-label="Pindah jalur terbang"><button class="dp" data-act="pl-dir" data-d="-1" aria-label="Terbang ke jalur atas">▲</button><button class="dp" data-act="pl-dir" data-d="1" aria-label="Terbang ke jalur bawah">▼</button></div></div>
    <div class="sr" id="pl-live" aria-live="polite"></div>`;

  const cv = $('#pl'), ctx = cv.getContext('2d');
  const paused = () => !pl.started || pl.over || document.hidden || !$('#overlay').classList.contains('hidden');

  /* ---------- tulisan di awan ---------- */
  function fitText(text) {
    const maxW = CW * .72, words = text.split(' ');
    ctx.direction = 'rtl';
    for (let fs = land ? 34 : 36; fs >= 16; fs -= 2) {
      ctx.font = `700 ${fs}px ${PL_FONT}`;
      if (fs * 1.45 <= CH * .56 && ctx.measureText(text).width <= maxW) return { fs, lines: [text] };
      if (N <= 4 && words.length >= 3 && fs * 2.9 <= CH * .8) {
        const mid = Math.ceil(words.length / 2), a = words.slice(0, mid).join(' '), b = words.slice(mid).join(' ');
        if (Math.max(ctx.measureText(a).width, ctx.measureText(b).width) <= maxW) return { fs, lines: [a, b] };
      }
    }
    return { fs: 16, lines: [text] };
  }

  /* ---------- tampilan atas (HUD) dan deret hasil ---------- */
  const brief = t => { t = String(t || ''); return t.length > 110 ? t.slice(0, 107).trim() + '…' : t; };
  function renderHud() {
    const W = waves[pl.ti], m = route[W.mi], h = P.hint[i], last = m.vs[m.vs.length - 1];
    const showArti = h === 2 || (h === 1 && W.first) || pl.peeked, showPrev = W.prev && h >= 1;
    $('#pl-hud').innerHTML = `<div class="pl-top"><span class="pl-mis">✈️ Misi ${W.mi + 1}/${route.length}</span><b>QS ${esc(m.s.name)}</b><span>ayat ${m.vs[0].n}–${last.n}</span></div>
      <div class="pl-find">Cari ayat ke-<b class="pl-n">${W.v.n}</b> <small class="pl-part">awan memuat ${pl.part === 1 ? 'akhir' : 'awal'} ayat</small></div>
      <div class="pl-extra">${showPrev ? `<div class="pl-prev">Setelah ayat ${W.prev.n}: <span class="ar" lang="ar" dir="rtl">${esc(plFrag(W.prev, 4, 1).text)}</span></div>` : ''}
        ${showArti ? `<div class="pl-arti">“${esc(brief(W.v.id))}”</div>` : `<button class="btn btn-ghost btn-sm" data-act="pl-peek">💡 Intip arti</button>`}</div>`;
    const live = $('#pl-live');
    if (live) live.textContent = `Misi ${W.mi + 1}. QS ${m.s.name}. Cari ayat ke-${W.v.n}.`;
  }
  function renderStrip() {
    $('#pl-strip').innerHTML = waves.map((W, k) => {
      const r = pl.res[k], now = k === pl.ti && !pl.over;
      return `<i class="${r === true ? 'ok' : r === false ? 'bad' : r === 'peek' ? 'now' : now ? 'now' : ''}${W.first && k ? ' gap' : ''}">${r === true ? W.v.n : r === false ? '✗' : r === 'peek' ? '💡' : now ? W.v.n : '·'}</i>`;
    }).join('');
  }

  /* ---------- gelombang awan ---------- */
  function spawn() {
    const W = waves[pl.ti], fw = P.fw[i];
    pl.part = P.part[i] === 2 ? rnd(2) : P.part[i];
    const T = plFrag(W.v, fw, pl.part);
    const items = shuffle([{ v: W.v, ok: true }, ...plDistract(W.v, N - 1, P.dis[i], fw, pl.part, T.full).map(v => ({ v, ok: false }))]);
    pl.clouds = items.map((it, r) => ({ row: r, v: it.v, ok: it.ok, text: plFrag(it.v, fw, pl.part).text, state: '' }));
    pl.clouds.forEach(c => { c.fit = fitText(c.text); });
    pl.t = 0; pl.phase = 'in'; pl.pass = 0; pl.fb = 0; pl.hit = -1; pl.peeked = false; pl.spin = 0; pl.shake = 0;
    pl.banner = W.first ? 1.5 : 0;
    q.v = W.v;
    renderHud();
    renderStrip();
  }
  function resolve() {
    const W = waves[pl.ti], hit = pl.clouds.find(c => c.row === pl.lane), ok = !!hit && hit.ok, point = ok && !pl.peeked;
    pl.phase = 'out'; pl.fb = PL_FB; pl.pass = 0; pl.hit = hit ? hit.row : -1; pl.ok = ok;
    pl.clouds.forEach(c => { if (c === hit) c.state = ok ? 'ok' : 'bad'; else if (c.ok) c.state = 'gold'; });
    pl.res[pl.ti] = point ? true : ok ? 'peek' : false;
    pl.combo = point ? pl.combo + 1 : 0;
    if (ok) { pl.spin = 1; sparkle(PX + 60, rowY(pl.lane), 16); } else { pl.shake = 1; sparkle(PX + 60, rowY(pl.lane), 8, '#9AA7B2'); }
    quickAns(point, W.v);
    renderStrip();
    const live = $('#pl-live');
    if (ok && !point) toast('Benar! Tapi kamu mengintip arti, jadi belum dapat poin.');
    else if (!ok) toast(`Bukan itu. Awan yang benar (ayat ${W.v.n}) ditandai emas.`);
    if (live) live.textContent = ok ? `Benar, ayat ${W.v.n}.` : `Salah. Yang benar ayat ${W.v.n}.`;
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
  function update(dt) {
    pl.off += dt;
    const sp = .6 + P.speed[i] * 2;
    amb.forEach(a => { a.x -= a.v * sp * dt; if (a.x < -CW * a.s) { a.x = SW + CW * a.s; a.y = rnd(SH); } });
    streaks.forEach(s => { s.x -= s.v * dt; if (s.x < -s.w) { s.x = SW + rnd(80); s.y = rnd(SH); } });
    const dy = rowY(pl.lane) - pl.py;
    pl.py += dy * Math.min(1, dt * 9);
    pl.tilt += ((Math.max(-.32, Math.min(.32, dy * .012))) - pl.tilt) * Math.min(1, dt * 12);
    if (pl.spin > 0) pl.spin = Math.max(0, pl.spin - dt / .7);
    if (pl.shake > 0) pl.shake = Math.max(0, pl.shake - dt / PL_FB);
    pl.trail -= dt;
    if (pl.trail <= 0) { pl.trail = .045; pl.parts.push({ x: PX - 48 * PS, y: pl.py + 3, vx: -70, vy: (Math.random() - .5) * 12, life: .55, max: .55, r: 5 * PS + Math.random() * 3, c: pl.shake > 0 ? '#7C8791' : '#FFFFFF', trail: true }); }
    pl.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.trail) p.vy += 220 * dt; p.life -= dt; });
    pl.parts = pl.parts.filter(p => p.life > 0).slice(-70);
    if (pl.banner > 0) { pl.banner -= dt; return; }
    if (pl.phase === 'in') {
      pl.t += dt * P.speed[i];
      if (pl.t >= 1) { pl.t = 1; resolve(); }
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
    const c = document.createElement('canvas'), pad = 14, g = (c.width = (CW + pad * 2) * K, c.height = (CH + pad * 2) * K, c.getContext('2d'));
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
  const cloudX = u => {
    const sx = SW + CW / 2 + 20, rx = SW - CW / 2 - 16, ex = PX + 46 * PS + CW / 2;
    if (u < PL_SLIDE) { const k = u / PL_SLIDE; return sx + (rx - sx) * (1 - Math.pow(1 - k, 3)); }
    return rx + (ex - rx) * ((u - PL_SLIDE) / (1 - PL_SLIDE));
  };

  function drawCloud(c, x, alpha, u) {
    const y = rowY(c.row);
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite(c.state), x - CW / 2 - 14, y - CH / 2 - 14, CW + 28, CH + 28);
    const ta = textAlpha(u);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    if (ta > .02) {
      ctx.globalAlpha = alpha * ta;
      ctx.fillStyle = c.state === 'bad' ? '#8A1F23' : c.state === 'ok' ? '#0B5C40' : SKY.text;
      ctx.font = `700 ${c.fit.fs}px ${PL_FONT}`;
      const lh = c.fit.fs * 1.45, y0 = y + CH * .05 - (c.fit.lines.length - 1) * lh / 2;
      c.fit.lines.forEach((ln, k) => ctx.fillText(ln, x, y0 + k * lh));
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
      ctx.fillText(c.state === 'ok' ? '✓' : c.state === 'bad' ? '✗' : '✓', bx, by + 1);
      if (c.state === 'gold') { ctx.fillStyle = col; ctx.font = `800 15px ${PL_LATIN}`; ctx.fillText(`ayat ${c.v.n}`, x - CW * .34, y - CH * .34); }
      ctx.globalAlpha = 1;
    }
  }

  function drawPlane(now) {
    const sh = pl.shake > 0 ? Math.sin(now / 28) * 4 * pl.shake : 0;
    ctx.save();
    ctx.translate(PX + sh, pl.py + (pl.shake > 0 ? Math.cos(now / 33) * 3 * pl.shake : 0) + Math.sin(now / 260) * 2.5);
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
        x = cloudX(1) - (CW + 120) * e;
        a = c.row === pl.hit || c.state === 'gold' ? 1 - e * .6 : .4 * (1 - e);
        u = 1;
      } else x = cloudX(pl.t);
      drawCloud(c, x, a, u);
    });
    drawPlane(now);
    if (pl.combo >= 3 && !pl.over) { ctx.globalAlpha = .9; ctx.fillStyle = '#fff'; ctx.font = `800 20px ${PL_LATIN}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.direction = 'ltr'; ctx.fillText(`🔥 x${pl.combo}`, 14, 8); ctx.globalAlpha = 1; }
    if (pl.banner > 0) {                                                                          // spanduk misi
      const W = waves[pl.ti], m = route[W.mi], last = m.vs[m.vs.length - 1], al = Math.max(0, Math.min(1, pl.banner / .25, (1.5 - pl.banner) / .2));
      ctx.globalAlpha = al * .9; ctx.fillStyle = '#0A2F40'; rr(ctx, SW * .09, SH * .33, SW * .82, 118, 22); ctx.fill();
      ctx.globalAlpha = al; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
      ctx.fillStyle = '#FFD65A'; ctx.font = `800 17px ${PL_LATIN}`; ctx.fillText(`MISI ${W.mi + 1} DARI ${route.length}`, SW / 2, SH * .33 + 24);
      ctx.fillStyle = '#fff'; ctx.font = `800 26px ${PL_LATIN}`; ctx.fillText(`QS ${m.s.name} · ayat ${m.vs[0].n}–${last.n}`, SW / 2, SH * .33 + 56);
      ctx.direction = 'rtl'; ctx.fillStyle = '#BFE9E0'; ctx.font = `700 28px ${PL_FONT}`; ctx.fillText(m.s.ar, SW / 2, SH * .33 + 94);
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
  function start() { if (pl.started) return; pl.started = true; const s = $('#pl-start'); if (s) s.classList.add('hidden'); }
  function move(d) { start(); if (pl.phase === 'in' && !pl.over) pl.lane = clampRow(pl.lane + d); }
  function peek() { if (pl.phase !== 'in' || pl.peeked || pl.over) return; pl.peeked = true; sfx('tap'); renderHud(); }
  let pd = null;
  cv.addEventListener('pointerdown', e => { pd = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* tanpa capture pun jalan */ } e.preventDefault(); });
  cv.addEventListener('pointerup', e => {
    if (!pd) return;
    const dx = e.clientX - pd.x, dy = e.clientY - pd.y, r = cv.getBoundingClientRect();
    pd = null;
    if (Math.abs(dy) > 26 && Math.abs(dy) > Math.abs(dx)) move(dy < 0 ? -1 : 1);
    else { start(); if (pl.phase === 'in' && !pl.over) pl.lane = clampRow(Math.floor(((e.clientY - r.top) / r.height * SH - TOPY) / rowH)); }
    e.preventDefault();
  });
  cv.addEventListener('pointercancel', () => { pd = null; });
  Object.assign(q, {
    move, start, peek, update, pl, waves,
    cheat: ok => { const c = pl.clouds.find(z => ok ? z.ok : !z.ok); if (c) { pl.lane = c.row; pl.py = rowY(c.row); } pl.banner = 0; pl.t = 1; update(0); }   // untuk uji otomatis
  });
  spawn();
  draw(performance.now());
  requestAnimationFrame(anim);
  if (document.fonts && document.fonts.load) {                                                    // ukur ulang tulisan setelah font Arab siap
    Promise.race([document.fonts.load(`700 30px 'Scheherazade New'`, 'ابت'), wait(1500)]).then(() => { if (run === myRun) pl.clouds.forEach(c => { c.fit = fitText(c.text); }); }).catch(() => { });
  }
}

document.addEventListener('keydown', e => {
  if (!run || run.g !== 20 || !run.q || !run.q.move || curView !== 'game' || !$('#overlay').classList.contains('hidden')) return;
  const d = { ArrowUp: -1, ArrowDown: 1, w: -1, s: 1, W: -1, S: 1 }[e.key];
  if (d) { e.preventDefault(); run.q.move(d); }
  else if ((e.key === ' ' || e.key === 'Enter') && !run.q.pl.started && !(e.target && e.target.closest && e.target.closest('button'))) { e.preventDefault(); run.q.start(); }
});
Object.assign(ACTIONS, {
  'pl-go': () => run.q && run.q.start && run.q.start(),
  'pl-dir': t => run.q && run.q.move && run.q.move(+t.dataset.d),
  'pl-peek': () => run.q && run.q.peek && run.q.peek()
});
