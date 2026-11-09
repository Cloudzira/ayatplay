/* =====================================================================
   Game 18: Petualangan Huruf (gaya Pac-Man, tampilan neon modern)
   Anak menggerakkan si Bulan Emas di labirin untuk memakan huruf hijaiyyah
   yang dicari sesuai urutan. Hindari si Nakal (penjaga labirin). Bintang cahaya
   membuat si Nakal ketakutan sebentar sehingga bisa diusir.
   Satu huruf yang dicari = satu soal. Salah makan huruf, kehabisan nyawa,
   atau waktu habis dihitung salah. Nilai bintang dan stiker memakai mesin game biasa.
   ===================================================================== */
'use strict';

/* ---------- 1. Labirin (separuh kiri ditulis, separuh kanan dicerminkan) ---------- */
const PM_MAZES = (() => {
  const half = [
    ['#######', '#.....#', '#.###.#', '#.#....', '#...##.', '###.#..', '.......', '###.#..', '#...##.', '#.#....', '#.###.#', '#.....#', '#######'],
    ['#######', '#......', '#.##.##', '#.#....', '#.#.##.', '#...#..', '.......', '#.#.#..', '#.#.##.', '#.#....', '#.##.##', '#......', '#######'],
    ['#######', '#...#..', '#.#.#.#', '#.#...#', '#.###.#', '#.....#', '...##..', '#.###.#', '#.....#', '#.#.#.#', '#.#.#..', '#......', '#######']
  ];
  const mirror = h => h.map(r => r + r.slice(0, 6).split('').reverse().join(''));
  const meta = [
    { hero: [6, 8], ghosts: [[6, 6], [5, 6], [7, 6], [6, 5]] },
    { hero: [6, 8], ghosts: [[6, 6], [5, 6], [7, 6], [6, 5]] },
    { hero: [6, 11], ghosts: [[6, 6], [5, 6], [7, 6], [5, 5]] }
  ];
  return half.map((h, k) => Object.assign({ rows: mirror(h) }, meta[k]));
})();

const PM_DIRS = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
const PM_GHOST_COL = ['#FF6B6B', '#B18CFF', '#4FD1E8', '#FFA94D'];
const PM_FONT = "'Scheherazade New','Traditional Arabic',serif";

/* ---------- 2. Permainan ---------- */
function r18(el, cfg, l) {
  const P = LV[18], i = l - 1, total = run.total, myRun = run;
  const M = PM_MAZES[P.maze[i]], rows = M.rows, W = rows[0].length, H = rows.length, SZ = 600, CS = SZ / W;
  const first = 1 + rnd(30 - total + 1), seq = Array.from({ length: total }, (_, k) => HIJ_BY[first + k]);
  const pm = { ti: 0, started: false, over: false, elapsed: 0, hearts: 3, res: Array(total).fill(null), letters: [], stars: [], dots: new Set(), scared: 0, invul: 0, told: false };
  const q = run.q = { v: hitem(seq[0]), pm };

  el.innerHTML = `<div class="sn-hud" id="pm-hud"></div><div class="sn-strip" id="pm-strip"></div>
    ${P.timer[i] ? `<div class="timer" id="pm-tm" role="timer" aria-label="Sisa waktu"><span class="tbar" aria-hidden="true"><i></i></span><b>⏱ ${P.timer[i]} dtk</b></div>` : ''}
    <div class="pm-wrap"><canvas id="pm" width="${SZ}" height="${SZ}" role="img" aria-label="Labirin petualangan huruf hijaiyyah"></canvas>
      <div class="pm-start" id="pm-start"><div><p style="margin:0 0 10px;font-weight:800;font-size:1.05rem">Makan huruf yang dicari sesuai urutan hijaiyyah!</p>
        <p class="pm-legend"><span>🌙 Kamu</span><span>👻 Si Nakal: hindari!</span><span>⭐ Bintang: si Nakal takut</span></p>
        <button class="btn btn-mint" data-act="pm-go">▶ Mulai petualangan</button>
        <p class="hint" style="margin:12px 0 0">Pakai tombol panah, geser layar, atau keyboard (panah / WASD).</p></div></div></div>
    <div class="pm-hearts" id="pm-hearts" role="status"></div>
    <div class="dpad" aria-label="Arah petualang"><button class="dp up" data-act="pm-dir" data-d="up" aria-label="Atas">▲</button><button class="dp lf" data-act="pm-dir" data-d="left" aria-label="Kiri">◀</button><button class="dp dn" data-act="pm-dir" data-d="down" aria-label="Bawah">▼</button><button class="dp rt" data-act="pm-dir" data-d="right" aria-label="Kanan">▶</button></div>`;

  const cv = $('#pm'), ctx = cv.getContext('2d'), target = () => seq[pm.ti];
  const wd = (a, b) => { const d = Math.abs(a - b); return Math.min(d, W - d); };   // jarak horizontal dengan terowongan
  const open = (x, y) => y >= 0 && y < H && rows[y][((x % W) + W) % W] !== '#';
  const posOf = a => ({ x: a.x + a.dx * a.t, y: a.y + a.dy * a.t });
  const paused = () => !pm.started || pm.over || run.locked || document.hidden || !$('#overlay').classList.contains('hidden');

  /* tokoh */
  const hero = { x: M.hero[0], y: M.hero[1], dx: 0, dy: 0, t: 0, face: 0, next: null };
  const ghosts = M.ghosts.slice(0, P.ghosts[i]).map((g, k) => ({ k, x: g[0], y: g[1], dx: 0, dy: 0, t: 0, wait: 2.5 + k * 2, home: g }));
  const allDots = () => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (open(x, y)) pm.dots.add(x + ',' + y); };
  allDots();

  /* ---------- bagian tampilan HUD ---------- */
  function renderHearts() {
    $('#pm-hearts').innerHTML = '<span aria-label="Nyawa ' + pm.hearts + ' dari 3">' + '❤️'.repeat(pm.hearts) + '🤍'.repeat(3 - pm.hearts) + '</span>';
  }
  function renderHud() {
    const T = target(), prev = pm.ti > 0 ? seq[pm.ti - 1] : null, mode = pm.ti === 0 ? 2 : P.hint[i];
    $('#pm-hud').innerHTML = mode === 2 ? `<span>Cari huruf</span><span class="ar hij-hud" lang="ar" dir="rtl">${T.ch}</span><small>${esc(T.name)} (${esc(T.lat)})</small>`
      : mode === 1 ? `<span>Cari huruf</span><b class="hij-name sm">${esc(T.name)}</b><small>(${esc(T.lat)})</small>`
        : `<span>Setelah huruf</span><span class="ar hij-hud" lang="ar" dir="rtl">${prev.ch}</span><span>yang mana?</span>`;
  }
  function renderStrip() {
    $('#pm-strip').innerHTML = seq.map((h, k) => {
      const r = pm.res[k];
      return `<i class="${r === true ? 'ok' : r === false ? 'bad' : k === pm.ti && !pm.over ? 'now' : ''}">${r === true ? `<span class="ar" lang="ar" dir="rtl">${h.ch}</span>` : r === false ? '✗' : k === pm.ti && !pm.over ? '?' : '·'}</i>`;
    }).join('');
  }

  /* ---------- soal berikutnya: letakkan huruf dan bintang di labirin ---------- */
  function randTile(avoid, minD) {
    const hp = posOf(hero);
    for (let t = 0; t < 500; t++) {
      const x = rnd(W), y = rnd(H);
      if (!open(x, y) || avoid.some(a => a.x === x && a.y === y)) continue;
      if (wd(x, hp.x) + Math.abs(y - hp.y) < minD) continue;
      return { x, y };
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (open(x, y) && !avoid.some(a => a.x === x && a.y === y)) return { x, y };
    return { x: M.hero[0], y: M.hero[1] };
  }
  function spawn() {
    const T = target(), prev = pm.ti > 0 ? seq[pm.ti - 1] : null;
    const fam = (HIJ_FAM_OF[T.i] || []).map(x => HIJ_BY[x]);
    const dec = distract(T.i, P.board[i] - 1, [prev ? [prev] : [], shuffle(fam), shuffle(HIJ.filter(x => x.i !== T.i))], x => x.i);
    pm.letters = [];
    pm.stars = [];
    pm.elapsed = 0;
    const taken = ghosts.map(g => ({ x: g.x, y: g.y }));
    [T, ...dec].forEach(h => {
      const p = randTile([...taken, ...pm.letters], 4);
      pm.letters.push({ idx: h.i, ch: h.ch, x: p.x, y: p.y });
    });
    for (let s = 0; s < P.stars[i]; s++) pm.stars.push(randTile([...taken, ...pm.letters, ...pm.stars], 3));
    renderHud();
    renderStrip();
  }
  function advance() {
    pm.ti++;
    if (pm.ti >= total) {
      pm.over = true;
      pm.letters = [];
      pm.stars = [];
      renderStrip();
      return;
    }
    spawn();
  }
  function eat(L) {
    const T = target(), ok = L.idx === T.i;
    pm.res[pm.ti] = ok;
    quickAns(ok, hitem(T));
    if (!ok) toast(`Bukan itu! Yang dicari: ${T.name} (${T.lat})`);
    advance();
  }

  /* ---------- gerak ---------- */
  const dist = (ax, ay, bx, by) => wd(ax, bx) + Math.abs(ay - by);
  function heroArrive() {
    const h = hero;
    if (h.next && open(h.x + h.next.x, h.y + h.next.y)) { h.dx = h.next.x; h.dy = h.next.y; h.next = null; }
    else if ((h.dx || h.dy) && !open(h.x + h.dx, h.y + h.dy)) { h.dx = 0; h.dy = 0; }
    if (h.dx || h.dy) h.face = Math.atan2(h.dy, h.dx);
  }
  function ghostArrive(g) {
    let opts = PM_DIRS.filter(d => open(g.x + d.x, g.y + d.y));
    const fwd = opts.filter(d => !((g.dx || g.dy) && d.x === -g.dx && d.y === -g.dy));
    if (fwd.length) opts = fwd;
    if (!opts.length) { g.dx = 0; g.dy = 0; return; }
    const hp = posOf(hero), hx = Math.round(hp.x), hy = Math.round(hp.y);
    let d;
    if (pm.scared > 0) {                                      // kabur dari pemain
      opts.sort((a, b) => dist(g.x + b.x, g.y + b.y, hx, hy) - dist(g.x + a.x, g.y + a.y, hx, hy));
      d = Math.random() < .7 ? opts[0] : pick(opts);
    } else if (Math.random() < P.chase[i] * (g.k === 2 ? .7 : 1)) {
      let tx = hx, ty = hy;
      if (g.k === 1) { tx = hx + Math.round(Math.cos(hero.face)) * 3; ty = hy + Math.round(Math.sin(hero.face)) * 3; }
      if (g.k === 3) { tx = W - 1 - hx; ty = H - 1 - hy; }
      opts.sort((a, b) => dist(g.x + a.x, g.y + a.y, tx, ty) - dist(g.x + b.x, g.y + b.y, tx, ty));
      d = opts[0];
    } else d = pick(opts);
    g.dx = d.x;
    g.dy = d.y;
  }
  function move(a, d, arrive) {
    let guard = 0;
    while (d > 1e-6 && guard++ < 8) {
      if (!(a.dx || a.dy)) { arrive(a); if (!(a.dx || a.dy)) return; }
      const rem = 1 - a.t;
      if (d < rem) { a.t += d; return; }
      d -= rem;
      a.x = ((a.x + a.dx) % W + W) % W;
      a.y += a.dy;
      a.t = 0;
      arrive(a);
    }
  }
  function resetPositions(grace) {
    Object.assign(hero, { x: M.hero[0], y: M.hero[1], dx: 0, dy: 0, t: 0, next: null });
    ghosts.forEach(g => Object.assign(g, { x: g.home[0], y: g.home[1], dx: 0, dy: 0, t: 0, wait: grace + g.k * 1.2 }));
  }
  function caught() {
    pm.hearts--;
    sfx('wrong');
    pm.invul = 3;
    pm.scared = 0;
    resetPositions(2);
    if (pm.hearts <= 0) {                                    // nyawa habis: soal ini salah, nyawa terisi lagi
      const T = target();
      pm.res[pm.ti] = false;
      quickAns(false, hitem(T));
      toast('💔 Nyawa habis! Yang dicari: ' + T.name + '. Semangat, nyawa terisi lagi!');
      pm.hearts = 3;
      advance();
    }
    renderHearts();
  }
  function update(dt) {
    const sp = P.speed[i];
    if (pm.scared > 0) pm.scared = Math.max(0, pm.scared - dt);
    if (pm.invul > 0) pm.invul = Math.max(0, pm.invul - dt);
    move(hero, P.hero * dt, heroArrive);
    ghosts.forEach(g => {
      if (g.wait > 0) { g.wait -= dt; return; }
      move(g, sp * (pm.scared > 0 ? .55 : 1) * dt, ghostArrive);
    });
    const hp = posOf(hero);
    const near = o => Math.hypot(wd(hp.x, o.x), hp.y - o.y) < .5;
    const dk = Math.round(hp.x + W) % W + ',' + Math.round(hp.y);
    if (pm.dots.has(dk) && Math.hypot(wd(hp.x, Math.round(hp.x)), hp.y - Math.round(hp.y)) < .35) {
      pm.dots.delete(dk);
      if (!pm.dots.size) allDots();
    }
    const S0 = pm.stars.findIndex(near);
    if (S0 > -1) {
      pm.stars.splice(S0, 1);
      pm.scared = P.scare[i];
      sfx('star');
      if (!pm.told) { pm.told = true; toast('⭐ Si Nakal jadi takut! Tabrak mereka untuk mengusirnya.'); }
    }
    const L = pm.letters.find(near);
    if (L && !pm.over) { eat(L); if (pm.over) return; }
    for (const g of ghosts) {
      if (g.wait > 0) continue;
      const gp = posOf(g);
      if (Math.hypot(wd(hp.x, gp.x), hp.y - gp.y) >= .6) continue;
      if (pm.scared > 0) { Object.assign(g, { x: g.home[0], y: g.home[1], dx: 0, dy: 0, t: 0, wait: 3 }); sfx('correct'); }
      else if (pm.invul <= 0) { caught(); break; }
    }
  }

  /* ---------- gambar ---------- */
  const bg = document.createElement('canvas');
  bg.width = bg.height = SZ;
  (function drawMaze() {
    const b = bg.getContext('2d'), g = b.createLinearGradient(0, 0, 0, SZ);
    g.addColorStop(0, '#0A2A33');
    g.addColorStop(1, '#0F3F49');
    b.fillStyle = g;
    b.fillRect(0, 0, SZ, SZ);
    b.fillStyle = '#12505B';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!open(x, y)) b.fillRect(x * CS - .3, y * CS - .3, CS + .6, CS + .6);
    b.strokeStyle = '#5CF0D2';
    b.lineWidth = 3;
    b.lineCap = 'round';
    b.shadowColor = '#5CF0D2';
    b.shadowBlur = 9;
    b.beginPath();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (open(x, y)) continue;
      PM_DIRS.forEach(d => {
        const nx = x + d.x, ny = y + d.y;
        if (ny < 0 || ny >= H || nx < 0 || nx >= W || !open(nx, ny)) return;
        const x0 = d.x === 1 ? (x + 1) * CS : x * CS, y0 = d.y === 1 ? (y + 1) * CS : y * CS;
        b.moveTo(x0, y0);
        b.lineTo(d.x ? x0 : x0 + CS, d.y ? y0 : y0 + CS);
      });
    }
    b.stroke();
  })();

  const wrapX = (px, fn) => { fn(px); if (px < .6) fn(px + W); if (px > W - 1.6) fn(px - W); };
  function star(cx, cy, r) {
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r;
      ctx[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function drawHero(now) {
    const p = posOf(hero), moving = hero.dx || hero.dy, r = CS * .4;
    if (pm.invul > 0 && Math.floor(now / 110) % 2) return;
    wrapX(p.x, px => {
      const cx = (px + .5) * CS, cy = (p.y + .5) * CS, m = (moving ? .06 + .27 * Math.abs(Math.sin(now / 95)) : .1) * Math.PI;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(hero.face);
      if (Math.cos(hero.face) < 0) ctx.scale(1, -1);
      ctx.shadowColor = 'rgba(255,210,80,.9)';
      ctx.shadowBlur = 14;
      const gr = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r);
      gr.addColorStop(0, '#FFF1A8');
      gr.addColorStop(1, '#F2B82B');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, m, Math.PI * 2 - m);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#B8860B';
      ctx.stroke();
      ctx.fillStyle = '#17322F';
      ctx.beginPath();
      ctx.arc(r * .1, -r * .52, r * .11, 0, 6.3);
      ctx.fill();
      ctx.restore();
    });
  }
  function drawGhost(g, now) {
    const p = posOf(g), r = CS * .39, sc = pm.scared > 0, flash = sc && pm.scared < 2 && Math.floor(now / 160) % 2;
    const col = sc ? (flash ? '#FFFFFF' : '#3B6CF5') : PM_GHOST_COL[g.k % 4];
    wrapX(p.x, px => {
      const cx = (px + .5) * CS, cy = (p.y + .5) * CS;
      ctx.save();
      ctx.globalAlpha = g.wait > 0 ? .45 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy - r * .1, r, Math.PI, 0);
      ctx.lineTo(cx + r, cy + r * .85);
      const n = 3, w = 2 * r / n, ph = Math.sin(now / 90) * r * .08;
      for (let k = 0; k < n; k++) {
        ctx.lineTo(cx + r - (k + .5) * w, cy + r * .55 + ph * (k % 2 ? 1 : -1));
        ctx.lineTo(cx + r - (k + 1) * w, cy + r * .85);
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      if (sc) {
        ctx.fillStyle = flash ? '#3B6CF5' : '#fff';
        [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(cx + s * r * .3, cy - r * .25, r * .11, 0, 6.3); ctx.fill(); });
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k <= 4; k++) ctx[k ? 'lineTo' : 'moveTo'](cx - r * .5 + k * r * .25, cy + r * .2 + (k % 2 ? -r * .1 : r * .05));
        ctx.stroke();
      } else {
        [-1, 1].forEach(s => {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx + s * r * .35, cy - r * .2, r * .27, 0, 6.3);
          ctx.fill();
          ctx.fillStyle = '#17322F';
          ctx.beginPath();
          ctx.arc(cx + s * r * .35 + g.dx * r * .1, cy - r * .2 + g.dy * r * .1, r * .13, 0, 6.3);
          ctx.fill();
        });
      }
      ctx.restore();
    });
  }
  function draw(now) {
    ctx.clearRect(0, 0, SZ, SZ);
    ctx.drawImage(bg, 0, 0);
    ctx.fillStyle = 'rgba(158,240,222,.7)';
    pm.dots.forEach(k => {
      const [x, y] = k.split(',').map(Number);
      ctx.beginPath();
      ctx.arc((x + .5) * CS, (y + .5) * CS, CS * .065, 0, 6.3);
      ctx.fill();
    });
    pm.stars.forEach(s => {
      ctx.save();
      ctx.shadowColor = '#FFD34D';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#FFE070';
      star((s.x + .5) * CS, (s.y + .5) * CS, CS * (.3 + Math.sin(now / 200) * .04));
      ctx.fill();
      ctx.restore();
    });
    const T = pm.over ? null : target(), ring = T && (pm.ti === 0 || P.hint[i] === 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    pm.letters.forEach(L => {
      const cx = (L.x + .5) * CS, cy = (L.y + .5) * CS, r = CS * .41;
      ctx.save();
      ctx.shadowColor = 'rgba(255,214,90,.85)';
      ctx.shadowBlur = 12;
      const gr = ctx.createRadialGradient(cx - r * .3, cy - r * .35, r * .1, cx, cy, r);
      gr.addColorStop(0, '#FFF8DC');
      gr.addColorStop(1, '#F7D56A');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 6.3);
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#C99A1E';
      ctx.stroke();
      ctx.fillStyle = '#0F3D42';
      ctx.font = `700 ${Math.round(CS * .62)}px ${PM_FONT}`;
      ctx.fillText(L.ch, cx, cy + CS * .05);
      if (ring && T && L.idx === T.i) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3 + Math.sin(now / 180) * 2.5, 0, 6.3);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#3DE6A5';
        ctx.stroke();
      }
    });
    ghosts.forEach(g => drawGhost(g, now));
    drawHero(now);
  }

  /* ---------- putaran utama ---------- */
  let lastT = performance.now();
  function anim(now) {
    if (run !== myRun || !document.getElementById('pm')) return;
    const dt = Math.min(.05, (now - lastT) / 1000);
    lastT = now;
    if (!paused()) {
      update(dt);
      pm.elapsed += dt * 1000;
      const lim = P.timer[i] * 1000;
      if (lim && !pm.over) {
        paintTimer($('#pm-tm'), 1 - pm.elapsed / lim, (lim - pm.elapsed) / 1000);
        if (pm.elapsed > lim) {
          const T = target();
          pm.res[pm.ti] = false;
          quickAns(false, hitem(T));
          toast('⏰ Waktu habis! Yang dicari: ' + T.name);
          advance();
        }
      }
    }
    draw(now);
    requestAnimationFrame(anim);
  }
  function start() {
    if (pm.started) return;
    pm.started = true;
    const s = $('#pm-start');
    if (s) s.classList.add('hidden');
  }
  function setDir(dx, dy) {
    start();
    if ((hero.dx || hero.dy) && dx === -hero.dx && dy === -hero.dy) {   // balik arah langsung
      hero.x = ((hero.x + hero.dx) % W + W) % W;
      hero.y += hero.dy;
      hero.dx = -hero.dx;
      hero.dy = -hero.dy;
      hero.t = 1 - hero.t;
      hero.next = null;
      hero.face = Math.atan2(hero.dy, hero.dx);
      return;
    }
    hero.next = { x: dx, y: dy };
  }
  let tx = 0, ty = 0;
  cv.addEventListener('touchstart', e => { const t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  cv.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0); else setDir(0, dy > 0 ? 1 : -1);
    e.preventDefault();
  }, { passive: false });

  Object.assign(q, { setDir, start, update, eat, hero, ghosts, seq, open, W, H,   // dipakai pengujian
    cheat: ok => { const T = target(), L = pm.letters.find(z => ok ? z.idx === T.i : z.idx !== T.i) || pm.letters[0]; eat(L); } });
  renderHearts();
  spawn();
  draw(performance.now());
  requestAnimationFrame(anim);
}

document.addEventListener('keydown', e => {
  if (!run || run.g !== 18 || !run.q || !run.q.setDir || curView !== 'game' || !$('#overlay').classList.contains('hidden')) return;
  const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
  const d = m[e.key];
  if (d) { e.preventDefault(); run.q.setDir(d[0], d[1]); }
});

Object.assign(ACTIONS, {
  'pm-go': () => run.q && run.q.start && run.q.start(),
  'pm-dir': t => {
    const m = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[t.dataset.d];
    if (run.q && run.q.setDir) run.q.setDir(m[0], m[1]);
  }
});
