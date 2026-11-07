/* =====================================================================
   Game 17: Puzzle Huruf Hijaiyyah
   Satu huruf hijaiyyah dipotong menjadi beberapa kepingan lalu diacak.
   Anak mengetuk dua kepingan untuk menukar tempatnya sampai hurufnya utuh.
   Makin tinggi level: kepingan makin banyak, contoh huruf makin sulit dilihat,
   dan ada batas waktu.
   ===================================================================== */
'use strict';

/* ---------- pengaturan umum ---------- */
const PZ_SIZE = 300;   // ukuran papan dalam satuan gambar (viewBox SVG), selalu persegi
const PZ_FONT = "'Scheherazade New','Traditional Arabic',serif";

/* ---------- 1. Menyiapkan gambar huruf ---------- */

/* Memuat font Arab lebih dulu (maksimal 1,5 detik) agar ukuran huruf terukur dengan benar */
async function pzLoadFont() {
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.race([document.fonts.load("700 100px 'Scheherazade New'", 'ابت'), wait(1500)]);
    }
  } catch (e) { /* tanpa font khusus pun puzzle tetap jalan */ }
}

/* Membuat kanvas bantu dengan pengaturan huruf yang sama untuk mengukur dan menggambar */
function pzContext(fontSize, willRead) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = PZ_SIZE;
  const ctx = cv.getContext('2d', willRead ? { willReadFrequently: true } : undefined);
  ctx.font = `700 ${fontSize}px ${PZ_FONT}`;
  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#000';
  return ctx;
}

/* Mengukur huruf lalu menghitung ukuran dan letak gambarnya supaya tepat di tengah papan */
function pzGlyph(ch) {
  const m = pzContext(100).measureText(ch);
  const left = m.actualBoundingBoxLeft, right = m.actualBoundingBoxRight;
  const up = m.actualBoundingBoxAscent, down = m.actualBoundingBoxDescent;
  const w = left + right, h = up + down;
  if (!(w > 0 && h > 0)) {                                  // browser lama: pakai perkiraan
    return { fs: 200, x: (PZ_SIZE - m.width * 2) / 2, y: PZ_SIZE * 0.62 };
  }
  const scale = Math.max(0.9, Math.min(3.3, 250 / Math.max(w, h)));   // huruf mengisi sekitar 83% papan
  return {
    fs: 100 * scale,
    x: PZ_SIZE / 2 - (right - left) * scale / 2,
    y: PZ_SIZE / 2 + (up - down) * scale / 2
  };
}

/* Membuat "sidik jari" tiap kepingan. Kepingan yang tampilannya sama persis (misalnya kepingan
   kosong) dianggap sama, jadi anak tidak bingung memilih kepingan kosong yang mana. */
function pzSignatures(ch, glyph, cols, rows) {
  const ctx = pzContext(glyph.fs, true);
  ctx.fillText(ch, glyph.x, glyph.y);
  const data = ctx.getImageData(0, 0, PZ_SIZE, PZ_SIZE).data;
  const cw = PZ_SIZE / cols, rh = PZ_SIZE / rows, BLOCK = 5, sigs = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let key = '';
      for (let y = r * rh; y < (r + 1) * rh; y += BLOCK) {
        for (let x = c * cw; x < (c + 1) * cw; x += BLOCK) {
          let on = 0;
          for (let yy = y; yy < Math.min(y + BLOCK, (r + 1) * rh) && !on; yy++) {
            for (let xx = x; xx < Math.min(x + BLOCK, (c + 1) * cw); xx++) {
              if (data[(yy * PZ_SIZE + xx) * 4 + 3] > 20) { on = 1; break; }
            }
          }
          key += on;
        }
      }
      sigs.push({ key, ink: key.indexOf('1') > -1 });      // ink = kepingan ini berisi bagian huruf
    }
  }
  return sigs;
}

/* Menyiapkan satu puzzle: mengukur huruf dan memastikan ada cukup kepingan berisi.
   Bila hurufnya sederhana (mis. Alif), jumlah kepingan dikurangi agar puzzle tidak membosankan. */
async function pzPrepare(h, cols, rows) {
  await pzLoadFont();
  const glyph = pzGlyph(h.ch);
  let sigs;
  try {
    for (;;) {
      sigs = pzSignatures(h.ch, glyph, cols, rows);
      const filled = sigs.filter(s => s.ink).length;
      if (filled >= 3 || (cols <= 2 && rows <= 2)) break;
      if (cols > 2) cols--; else rows--;
    }
  } catch (e) {                                              // kanvas tidak tersedia: semua kepingan dianggap berbeda
    sigs = Array.from({ length: cols * rows }, (_, k) => ({ key: 'p' + k, ink: true }));
  }
  return { glyph, cols, rows, sigs };
}

/* ---------- 2. Aturan puzzle ---------- */

const pzSame = (q, a, b) => q.sigs[a].key === q.sigs[b].key;
const pzIsSolved = q => q.order.every((k, p) => pzSame(q, k, p));

/* Mengacak kepingan sampai cukup berantakan (minimal 3 kepingan berisi salah tempat) dan belum selesai */
function pzShuffle(sigs) {
  const n = sigs.length, need = Math.min(3, sigs.filter(s => s.ink).length);
  const q = { sigs };
  let perm = [...Array(n).keys()];
  for (let t = 0; t < 200; t++) {
    perm = shuffle([...Array(n).keys()]);
    const wrong = perm.filter((k, p) => !pzSame(q, k, p) && (sigs[k].ink || sigs[p].ink)).length;
    if (wrong >= need) return perm;
  }
  q.order = perm;
  if (pzIsSolved(q)) {                                       // pengaman: tukar dua kepingan yang berbeda
    const a = perm.findIndex((k, p) => !pzSame(q, k, (p + 1) % n));
    if (a > -1) [perm[a], perm[(a + 1) % n]] = [perm[(a + 1) % n], perm[a]];
  }
  return perm;
}

/* ---------- 3. Tampilan ---------- */

function pzDraw(el, q) {
  const { h, cols, rows, order, glyph, sigs } = q;
  const cw = PZ_SIZE / cols, rh = PZ_SIZE / rows;
  const showRef = q.mode === 2 || q.peek || q.solved;        // contoh huruf terlihat?

  const ref = showRef
    ? `<div class="mushaf pz-ref"><div class="ar hij-big" lang="ar" dir="rtl">${h.ch}</div><div><div class="hij-name sm">${esc(h.name)}</div><small class="muted" style="font-weight:800">(${esc(h.lat)})</small></div></div>`
    : `<div class="mushaf pz-ref"><div><small class="muted" style="font-weight:800">Susun huruf</small><div class="hij-name">${esc(h.name)}</div><small class="muted" style="font-weight:800">(${esc(h.lat)})</small></div></div>`;

  const tiles = order.map((k, p) => {
    const vx = (k % cols) * cw, vy = Math.floor(k / cols) * rh;   // bagian huruf yang diperlihatkan kepingan ini
    const state = q.solved ? 'done' : (q.sel === p ? 'sel' : (q.mode === 2 && sigs[k].ink && pzSame(q, k, p) ? 'ok' : ''));
    return `<button class="pz-piece ${state}" data-act="pzpick" data-p="${p}" aria-label="Kepingan ${p + 1}" aria-pressed="${q.sel === p}">
      <svg viewBox="${vx} ${vy} ${cw} ${rh}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><text x="${glyph.x}" y="${glyph.y}" font-size="${glyph.fs}" direction="ltr" fill="#0F3D42" style="font-family:${PZ_FONT};font-weight:700">${h.ch}</text></svg>
    </button>`;
  }).join('');

  const peekBtn = q.mode === 1 && !q.solved
    ? `<button class="btn btn-ghost btn-sm" data-act="pzpeek" ${q.peek ? 'disabled' : ''}>👁 Intip contoh</button>`
    : '';
  const tip = q.mode === 1 ? ' Mengintip contoh membuat jawaban tidak dihitung benar.' : '';

  el.innerHTML = `<div class="q-text">Susun puzzle huruf ini 🖼️</div>
    <div class="hint xs">Ketuk satu kepingan, lalu ketuk kepingan lain untuk menukar tempatnya.${tip}</div>
    ${ref}
    <div class="pz-board" style="--cols:${cols};--rows:${rows}" role="group" aria-label="Papan puzzle huruf">${tiles}</div>
    <div class="pz-foot"><span>Langkah: <b>${q.moves}</b></span>${peekBtn}</div>`;
}

/* ---------- 4. Alur permainan ---------- */

/* 17. Puzzle Huruf: satu huruf per soal */
function r17(el, cfg, l) {
  const P = LV[17], i = l - 1, h = pickHij(HIJ.slice(0, P.n[i])), myRun = run;
  const q = run.q = { v: hitem(h), h, ready: false, hinted: false, peek: false, solved: false, sel: -1, moves: 0, mode: P.hint[i] };
  el.innerHTML = `<div class="q-text">Susun puzzle huruf ini 🖼️</div><div class="hint" style="text-align:center">Menyiapkan kepingan…</div>`;
  pzPrepare(h, P.cols[i], P.rows[i]).then(pz => {
    if (run !== myRun || run.q !== q || !el.isConnected) return;     // pemain sudah pindah soal/keluar
    Object.assign(q, pz, { order: pzShuffle(pz.sigs), ready: true });
    q.draw = () => pzDraw(el, q);
    q.draw();
    if (cfg.timer) startTimer(cfg.timer);
  });
}

/* Ketuk kepingan: pilih, batal pilih, atau tukar dengan kepingan terpilih */
function pzPick(p) {
  const q = run && run.q;
  if (!q || !q.ready || q.solved || run.locked) return;
  if (q.sel < 0) { q.sel = p; sfx('tap'); return q.draw(); }
  if (q.sel === p) { q.sel = -1; return q.draw(); }
  [q.order[q.sel], q.order[p]] = [q.order[p], q.order[q.sel]];
  q.sel = -1; q.moves++; sfx('tap');
  if (pzIsSolved(q)) pzFinish(q); else q.draw();
}

/* Puzzle selesai: tampilkan huruf utuh sebentar, lalu hitung hasilnya */
function pzFinish(q) {
  q.solved = true;
  stopTimer();
  q.draw();
  const ok = !q.hinted;                                      // mengintip contoh = tidak dihitung benar
  later(() => ans(ok, q.v, ok
    ? `Puzzle selesai dalam ${q.moves} langkah. 🎉`
    : 'Kamu mengintip contoh, jadi belum dihitung benar. Coba lagi tanpa mengintip ya!'), 700);
}

/* Tombol intip: contoh huruf tampil 2,5 detik */
function pzPeek() {
  const q = run && run.q;
  if (!q || !q.ready || q.solved || q.peek || run.locked) return;
  q.hinted = true; q.peek = true; q.draw();
  later(() => { if (run && run.q === q && !q.solved) { q.peek = false; q.draw(); } }, 2500);
}

Object.assign(ACTIONS, {
  pzpick: t => pzPick(+t.dataset.p),
  pzpeek: () => pzPeek()
});
