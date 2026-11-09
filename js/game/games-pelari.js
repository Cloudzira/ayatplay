/* =====================================================================
   Game 19: Pelari Cahaya (runner 3-5 jalur, tampilan malam neon)
   Si Bulan Emas berlari di jalan. Tiap gelombang membawa satu huruf di setiap jalur.
   Anak pindah jalur untuk menangkap huruf yang dicari. Satu gelombang = satu soal.
   Salah tangkap huruf = salah. Makin tinggi level: lebih cepat, jalur lebih banyak, petunjuk lebih sedikit.
   ===================================================================== */
'use strict';

function r19(el, cfg, l) {
  const P = LV[19], i = l - 1, total = run.total, myRun = run, N = P.lanes[i], SZ = 600, CX = 300, HY = 150, PY = 505;
  const first = 1 + rnd(30 - total + 1), seq = Array.from({ length: total }, (_, k) => HIJ_BY[first + k]);
  const rn = { ti: 0, started: false, over: false, t: 0, lane: Math.floor(N / 2), lx: Math.floor(N / 2), letters: [], fb: 0, fbLane: -1, fbOk: false, res: Array(total).fill(null), off: 0, resolved: false };
  const q = run.q = { v: hitem(seq[0]), rn };
  el.innerHTML = `<div class="sn-hud" id="rn-hud"></div><div class="sn-strip" id="rn-strip"></div>
    <div class="pm-box"><div class="rn-wrap"><canvas id="rn" width="${SZ}" height="${SZ}" role="img" aria-label="Jalan pelari huruf hijaiyyah"></canvas>
      <div class="pm-start" id="rn-start"><div><p style="margin:0 0 12px;font-weight:800;font-size:1.05rem">Pindah jalur dan tangkap huruf yang dicari!</p>
        <button class="btn btn-mint" data-act="rn-go">▶ Lari!</button>
        <p class="hint" style="margin:12px 0 0">Tombol kiri/kanan, geser layar, atau keyboard (panah / A D).</p></div></div></div>
    <div class="rn-pad" aria-label="Pindah jalur"><button class="dp" data-act="rn-dir" data-d="-1" aria-label="Jalur kiri">◀</button><button class="dp" data-act="rn-dir" data-d="1" aria-label="Jalur kanan">▶</button></div></div>`;
  const cv = $('#rn'), ctx = cv.getContext('2d'), target = () => seq[rn.ti];
  const paused = () => !rn.started || rn.over || run.locked || document.hidden || !$('#overlay').classList.contains('hidden');
  const pp = t => Math.pow(t, 2.2);
  const hw = p => 45 + 245 * p, ly = p => HY + (PY - HY) * p;
  const lx = (lane, p) => CX + (((lane + .5) / N) * 2 - 1) * hw(p);

  function renderHud() {
    const T = target(), prev = rn.ti > 0 ? seq[rn.ti - 1] : null, mode = rn.ti === 0 ? 2 : P.hint[i];
    $('#rn-hud').innerHTML = mode === 2 ? `<span>Cari huruf</span><span class="ar hij-hud" lang="ar" dir="rtl">${T.ch}</span><small>${esc(T.name)} (${esc(T.lat)})</small>`
      : mode === 1 ? `<span>Cari huruf</span><b class="hij-name sm">${esc(T.name)}</b><small>(${esc(T.lat)})</small>`
        : `<span>Setelah huruf</span><span class="ar hij-hud" lang="ar" dir="rtl">${prev.ch}</span><span>yang mana?</span>`;
  }
  function renderStrip() {
    $('#rn-strip').innerHTML = seq.map((h, k) => {
      const r = rn.res[k];
      return `<i class="${r === true ? 'ok' : r === false ? 'bad' : k === rn.ti && !rn.over ? 'now' : ''}">${r === true ? `<span class="ar" lang="ar" dir="rtl">${h.ch}</span>` : r === false ? '✗' : k === rn.ti && !rn.over ? '?' : '·'}</i>`;
    }).join('');
  }
  function spawn() {
    const T = target(), prev = rn.ti > 0 ? seq[rn.ti - 1] : null, fam = (HIJ_FAM_OF[T.i] || []).map(x => HIJ_BY[x]);
    const dec = distract(T.i, N - 1, [prev ? [prev] : [], shuffle(fam), shuffle(HIJ.filter(x => x.i !== T.i))], x => x.i);
    rn.letters = shuffle([T, ...dec]).map((h, k) => ({ idx: h.i, ch: h.ch, lane: k }));
    rn.t = 0;
    rn.resolved = false;
    rn.fb = 0;
    renderHud();
    renderStrip();
  }
  function resolve() {
    const T = target(), L = rn.letters.find(z => z.lane === rn.lane), ok = !!L && L.idx === T.i;
    rn.resolved = true;
    rn.res[rn.ti] = ok;
    rn.fb = .7;
    rn.fbLane = rn.lane;
    rn.fbOk = ok;
    quickAns(ok, hitem(T));
    if (!ok) toast(`Bukan itu! Yang dicari: ${T.name} (${T.lat})`);
  }
  function update(dt) {
    rn.off = (rn.off + dt * (.5 + P.speed[i])) % 1;
    rn.lx += (rn.lane - rn.lx) * Math.min(1, dt * 14);
    if (rn.resolved) {
      rn.fb -= dt;
      if (rn.fb <= 0) {
        rn.ti++;
        if (rn.ti >= total) { rn.over = true; rn.letters = []; renderStrip(); } else spawn();
      }
      return;
    }
    rn.t += dt * P.speed[i];
    if (rn.t >= 1) { rn.t = 1; resolve(); }
  }

  /* ---------- gambar ---------- */
  const bg = document.createElement('canvas');
  bg.width = bg.height = SZ;
  (function () {
    const b = bg.getContext('2d'), g = b.createLinearGradient(0, 0, 0, HY + 40);
    g.addColorStop(0, '#071A2B');
    g.addColorStop(1, '#1B4F63');
    b.fillStyle = g;
    b.fillRect(0, 0, SZ, SZ);
    b.fillStyle = '#fff';
    for (let k = 0; k < 40; k++) { b.globalAlpha = .3 + Math.random() * .6; b.fillRect(Math.random() * SZ, Math.random() * (HY - 20), 2, 2); }
    b.globalAlpha = 1;
    b.fillStyle = '#FFF1B8';
    b.shadowColor = '#FFE070'; b.shadowBlur = 20;
    b.beginPath(); b.arc(470, 55, 24, 0, 6.3); b.fill();
    b.globalCompositeOperation = 'destination-out'; b.beginPath(); b.arc(481, 49, 21, 0, 6.3); b.fill();
    b.globalCompositeOperation = 'source-over'; b.shadowBlur = 0;
    b.fillStyle = '#0B2A3A';                                  // siluet masjid
    b.fillRect(0, HY - 6, SZ, 80);
    [[90, 70], [300, 90], [500, 60]].forEach(([x, w]) => {
      b.beginPath(); b.arc(x, HY - 6, w / 2, Math.PI, 0); b.fill();
      b.fillRect(x - w / 2, HY - 6, w, 10);
      b.fillRect(x + w / 2 + 6, HY - 70, 9, 70);
      b.beginPath(); b.moveTo(x + w / 2 + 3, HY - 70); b.lineTo(x + w / 2 + 10, HY - 90); b.lineTo(x + w / 2 + 18, HY - 70); b.fill();
    });
    b.fillStyle = '#0A2230';
    b.fillRect(0, HY + 4, SZ, SZ);
  })();

  function disc(cx, cy, r, ch, state) {
    ctx.save();
    ctx.shadowColor = state === 'ok' ? '#3DE6A5' : state === 'bad' ? '#FF6B6B' : 'rgba(255,214,90,.9)';
    ctx.shadowBlur = 16;
    const g = ctx.createRadialGradient(cx - r * .3, cy - r * .35, r * .1, cx, cy, r);
    g.addColorStop(0, state === 'ok' ? '#E3FFF2' : state === 'bad' ? '#FFE3E3' : '#FFF8DC');
    g.addColorStop(1, state === 'ok' ? '#3DE6A5' : state === 'bad' ? '#FF8A8A' : '#F7D56A');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.3); ctx.fill();
    ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = '#C99A1E'; ctx.stroke();
    ctx.fillStyle = '#0F3D42';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(r * 1.2)}px 'Scheherazade New','Traditional Arabic',serif`;
    ctx.fillText(ch, cx, cy + r * .08);
  }
  function draw(now) {
    ctx.clearRect(0, 0, SZ, SZ);
    ctx.drawImage(bg, 0, 0);
    ctx.beginPath();                                            // jalan
    ctx.moveTo(CX - hw(0), ly(0)); ctx.lineTo(CX + hw(0), ly(0)); ctx.lineTo(CX + hw(1), SZ); ctx.lineTo(CX - hw(1), SZ); ctx.closePath();
    const rg = ctx.createLinearGradient(0, HY, 0, SZ);
    rg.addColorStop(0, '#12404F'); rg.addColorStop(1, '#0E2C3A');
    ctx.fillStyle = rg; ctx.fill();
    ctx.save(); ctx.shadowColor = '#5CF0D2'; ctx.shadowBlur = 12; ctx.strokeStyle = '#5CF0D2'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(CX - hw(0), ly(0)); ctx.lineTo(CX - hw(1), SZ); ctx.moveTo(CX + hw(0), ly(0)); ctx.lineTo(CX + hw(1), SZ); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;     // garis jalur bergerak
    for (let k = 1; k < N; k++) {
      for (let s = 0; s < 10; s++) {
        const t0 = (s + rn.off) / 10, t1 = t0 + .05, p0 = pp(t0), p1 = pp(Math.min(1, t1));
        ctx.lineWidth = 1 + 3 * p0;
        ctx.beginPath(); ctx.moveTo(lx(k - .5, p0), ly(p0)); ctx.lineTo(lx(k - .5, p1), ly(p1)); ctx.stroke();
      }
    }
    const T = rn.over ? null : target(), ring = T && (rn.ti === 0 || P.hint[i] === 2), p = pp(rn.t), sc = .35 + .65 * p, r = (N > 3 ? 30 : 38) * sc;
    rn.letters.slice().forEach(L => {
      const x = lx(L.lane, p), y = ly(p) - r * .2;
      let st = '';
      if (rn.resolved) { if (L.lane === rn.fbLane) st = rn.fbOk ? 'ok' : 'bad'; else ctx.globalAlpha = .35; }
      disc(x, y, r, L.ch, st);
      ctx.globalAlpha = 1;
      if (ring && !rn.resolved && T && L.idx === T.i) {
        ctx.beginPath(); ctx.arc(x, y, r + 4 + Math.sin(now / 180) * 2.5, 0, 6.3); ctx.lineWidth = 4; ctx.strokeStyle = '#3DE6A5'; ctx.stroke();
      }
    });
    const px = lx(rn.lx, 1), bob = Math.abs(Math.sin(now / 120)) * 8, R = N > 3 ? 30 : 36;   // pelari
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(px, PY + R + 4, R * .8, 8, 0, 0, 6.3); ctx.fill();
    ctx.save(); ctx.translate(px, PY - bob);
    ctx.shadowColor = 'rgba(255,210,80,.9)'; ctx.shadowBlur = 16;
    const g = ctx.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R);
    g.addColorStop(0, '#FFF1A8'); g.addColorStop(1, '#F2B82B');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.3); ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = '#B8860B'; ctx.stroke();
    ctx.fillStyle = '#17322F';
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * R * .35, -R * .15, R * .11, 0, 6.3); ctx.fill(); });
    ctx.fillStyle = '#0E8A6E'; ctx.beginPath(); ctx.arc(0, -R * .55, R * .5, Math.PI, 0); ctx.fill();   // peci hijau
    ctx.restore();
  }

  let lastT = performance.now();
  function anim(now) {
    if (run !== myRun || !document.getElementById('rn')) return;
    const dt = Math.min(.05, (now - lastT) / 1000);
    lastT = now;
    if (!paused()) update(dt);
    draw(now);
    requestAnimationFrame(anim);
  }
  function start() { if (rn.started) return; rn.started = true; const s = $('#rn-start'); if (s) s.classList.add('hidden'); }
  function move(d) { start(); if (!rn.resolved) rn.lane = Math.max(0, Math.min(N - 1, rn.lane + d)); }
  let tx = 0;
  cv.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  cv.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 18) move(dx > 0 ? 1 : -1); e.preventDefault(); }, { passive: false });
  Object.assign(q, { move, start, update, rn, seq, cheat: ok => { const T = target(), L = rn.letters.find(z => ok ? z.idx === T.i : z.idx !== T.i); if (L) { rn.lane = L.lane; rn.lx = L.lane; } rn.t = 1; update(0); } });
  spawn();
  draw(performance.now());
  requestAnimationFrame(anim);
}

document.addEventListener('keydown', e => {
  if (!run || run.g !== 19 || !run.q || !run.q.move || curView !== 'game' || !$('#overlay').classList.contains('hidden')) return;
  const d = { ArrowLeft: -1, ArrowRight: 1, a: -1, d: 1 }[e.key];
  if (d) { e.preventDefault(); run.q.move(d); }
});
Object.assign(ACTIONS, {
  'rn-go': () => run.q && run.q.start && run.q.start(),
  'rn-dir': t => run.q && run.q.move && run.q.move(+t.dataset.d)
});
