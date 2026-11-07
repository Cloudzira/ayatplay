/* =====================================================================
   Game 11-13 + materi: huruf hijaiyyah
   Tebak Huruf, Urutkan Huruf, Ular Hijaiyyah, dan halaman belajar huruf.
   ===================================================================== */
'use strict';

/* =====================================================================
   GAME 11-13: HURUF HIJAIYYAH
   ===================================================================== */
const hijLabel = h => `<span>${esc(h.name)}</span><small style="opacity:.7;font-weight:800">${esc(h.lat)}</small>`;
const hijWrong = h => `Jawaban yang benar: <b>${esc(h.name)}</b> (${esc(h.lat)}).`;
const FORM_NAME = { awal: 'awal kata', tengah: 'tengah kata', akhir: 'akhir kata' };

function pickHij(pool) {
    const seen = new Set(S.seen[run.g] || []);
    let c = pool.filter(h => !run.used.has(h.i) && !seen.has(h.i));
    if (!c.length)
        c = pool.filter(h => !run.used.has(h.i));
    if (!c.length)
        c = pool;
    const h = pick(c);
    run.used.add(h.i);
    const a = S.seen[run.g] = (S.seen[run.g] || []).filter(k => k !== h.i);
    a.push(h.i);
    if (a.length > 40)
        a.shift();
    return h;
}

/* 11. Tebak Huruf */
function r11(el, cfg, l) {
    const P = LV[11], i = l - 1, pool = HIJ.slice(0, P.n[i]), h = pickHij(pool);
    const rev = Math.random() < P.rev[i], forms = hijForms(h);
    const fm = (!rev && forms.length && Math.random() < P.form[i]) ? pick(forms) : null;
    const fam = (HIJ_FAM_OF[h.i] || []).map(x => HIJ_BY[x]), others = HIJ.filter(x => x.i !== h.i);
    const groups = P.sim[i] ? [fam.filter(x => x.i <= P.n[i]), fam, pool.filter(x => x.i !== h.i), others] : [pool.filter(x => x.i !== h.i), others];
    const opts = shuffle([h, ...distract(h.i, cfg.opts - 1, groups, x => x.i)]);
    run.q = { v: hitem(h), wrong: hijWrong(h) };
    const stem = rev ? `<div class="mushaf"><div class="hij-name">${esc(h.name)}</div><small class="muted" style="font-weight:800">(${esc(h.lat)})</small></div>`
        : `<div class="mushaf"><div class="ar hij-big" lang="ar" dir="rtl">${fm ? fm[1] : h.ch}</div>${fm ? `<span class="tag">bentuk ${FORM_NAME[fm[0]]}</span>` : ''}</div>`;
    const q = rev ? 'Mana huruf yang bernama ini?' : fm ? 'Huruf apa ini? Perhatikan bentuk sambungnya.' : 'Apa nama huruf ini?';
    el.innerHTML = `<div class="q-text">${q}</div>${stem}<div class="opts c3">${OPTS(opts.map(o => ({ ok: o.i === h.i, html: rev ? `<span class="ar hij-opt" lang="ar" dir="rtl">${o.ch}</span>` : hijLabel(o) })))}</div>`;
    if (cfg.timer)
        startTimer(cfg.timer);
}

/* 12. Urutkan Huruf: 30 huruf diacak, ketuk dari Alif sampai Ya */
function r12(el, cfg, l) {
    const last = (S.seen[12] && S.seen[12][0]) || '';
    let order, t = 0;
    do {
        order = shuffle(HIJ.map(h => h.i));
    } while ((order.join() === last || order.every((x, k) => x === k + 1)) && t++ < 30);
    S.seen[12] = [order.join()]; // susunan awal selalu berbeda dari sebelumnya
    const q = run.q = { v: hitem(HIJ[0]), order, tray: [...order], placed: [], next: 1, err: false, hinted: false, flash: 0 };
    const draw = () => {
        const done = q.placed.length;
        el.innerHTML = `<div class="q-text">Urutkan 30 huruf hijaiyyah dari Alif sampai Ya 🔢</div>
      <div class="hint xs">Ketuk huruf yang paling awal dulu, lalu berikutnya. Pilih sesuai urutan hijaiyyah. Tiap huruf yang tepat pada percobaan pertama menambah skor.</div>
      <div class="hij-prog"><b>${done}/30</b><span>Benar langsung: <b>${run.correct}</b></span></div>
      <div class="hij-placed" aria-label="Huruf yang sudah tersusun">${q.placed.length ? q.placed.map(i => `<span class="ar" lang="ar" dir="rtl">${HIJ_BY[i].ch}</span>`).join('') : '<small class="muted" style="direction:ltr">Belum ada huruf. Mulai dari Alif!</small>'}</div>
      <div class="hij-pool">${q.tray.map(i => `<button class="hij-tile ${q.flash === i ? 'shake' : ''} ${q.hinted && i === q.next ? 'hint' : ''}" data-act="o12pick" data-i="${i}" aria-label="Huruf"><span class="ar" lang="ar" dir="rtl">${HIJ_BY[i].ch}</span></button>`).join('')}</div>
      <button class="btn btn-ghost btn-block" data-act="o12hint" ${done >= 30 ? 'disabled' : ''}>💡 Petunjuk (huruf berikutnya)</button>`;
    };
    q.draw = draw;
    draw();
}

function o12pick(i) {
    const q = run.q;
    if (!q || run.locked || q.placed.length >= 30)
        return;
    if (i === q.next) {
        quickAns(!q.err && !q.hinted, hitem(HIJ_BY[i])); // benar pada percobaan pertama = 1 poin
        q.placed.push(i);
        q.tray = q.tray.filter(x => x !== i);
        q.next++;
        q.err = false;
        q.hinted = false;
        q.flash = 0;
        q.draw();
    }
    else {
        q.err = true;
        q.flash = i;
        sfx('wrong');
        q.draw();
        const prev = q.next > 1 ? HIJ_BY[q.next - 1] : null;
        toast(prev ? `Bukan itu. Huruf apa setelah ${prev.name}?` : 'Bukan itu. Mulai dari huruf pertama: Alif!');
    }
}

/* 13. Ular Hijaiyyah (snake) */
function quickAns(correct, item) {
    if (!run || run.locked)
        return;
    run.res.push(correct);
    if (correct)
        run.correct++;
    else if (!run.missed.some(m => m.key === item.key))
        run.missed.push(item);
    sfx(correct ? 'correct' : 'wrong');
    $('#g-score').textContent = run.correct;
    run.idx++;
    drawProg();
    if (run.idx === Math.floor(run.total / 2))
        toast('💪 Setengah jalan! Kamu pasti bisa!');
    if (run.idx >= run.total) {
        run.locked = true;
        later(() => finishRun(), 700);
    }
}

function r13(el, cfg, l) {
    const P = LV[13], i = l - 1, N = 10, total = run.total, myRun = run;
    const first = 1 + rnd(30 - total + 1), seq = Array.from({ length: total }, (_, k) => HIJ_BY[first + k]);
    const sn = { snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], dir: { x: 1, y: 0 }, nextDir: null, letters: [], ti: 0, grow: 0, started: false, over: false, elapsed: 0, res: Array(total).fill(null) };
    const q = run.q = { v: hitem(seq[0]), sn };
    el.innerHTML = `<div class="sn-hud" id="sn-hud"></div><div class="sn-strip" id="sn-strip"></div>
    ${P.timer[i] ? `<div class="timer" id="sn-tm" role="timer" aria-label="Sisa waktu"><span class="tbar" aria-hidden="true"><i></i></span><b>⏱ ${P.timer[i]} dtk</b></div>` : ''}
    <div class="sn-wrap"><canvas id="sn" width="600" height="600" role="img" aria-label="Papan ular hijaiyyah"></canvas>
      <div class="sn-start" id="sn-start"><div><p style="margin:0 0 12px;font-weight:800">Gerakkan ular untuk memakan huruf sesuai urutan hijaiyyah!</p><button class="btn btn-mint" data-act="sn-go">▶ Mulai</button><p class="hint" style="margin:12px 0 0">Pakai tombol panah, geser layar, atau keyboard.</p></div></div></div>
    <div class="dpad" aria-label="Arah ular"><button class="dp up" data-act="sn-dir" data-d="up" aria-label="Atas">▲</button><button class="dp lf" data-act="sn-dir" data-d="left" aria-label="Kiri">◀</button><button class="dp dn" data-act="sn-dir" data-d="down" aria-label="Bawah">▼</button><button class="dp rt" data-act="sn-dir" data-d="right" aria-label="Kanan">▶</button></div>`;
    const cv = $('#sn'), ctx = cv.getContext('2d'), CS = cv.width / N, target = () => seq[sn.ti];
    const free = (x, y) => !sn.snake.some(c => c.x === x && c.y === y) && !sn.letters.some(L => L.x === x && L.y === y);
    const paused = () => !sn.started || sn.over || run.locked || document.hidden || !$('#overlay').classList.contains('hidden');
    function renderHud() {
        const T = target(), prev = sn.ti > 0 ? seq[sn.ti - 1] : null, mode = sn.ti === 0 ? 2 : P.hint[i];
        $('#sn-hud').innerHTML = mode === 2 ? `<span>Cari huruf</span><span class="ar hij-hud" lang="ar" dir="rtl">${T.ch}</span><small>${esc(T.name)} (${esc(T.lat)})</small>`
            : mode === 1 ? `<span>Cari huruf</span><b class="hij-name sm">${esc(T.name)}</b><small>(${esc(T.lat)})</small>`
                : `<span>Setelah huruf</span><span class="ar hij-hud" lang="ar" dir="rtl">${prev.ch}</span><span>yang mana?</span>`;
    }
    function renderStrip() {
        $('#sn-strip').innerHTML = seq.map((h, k) => {
            const r = sn.res[k];
            return `<i class="${r === true ? 'ok' : r === false ? 'bad' : k === sn.ti && !sn.over ? 'now' : ''}">${r === true ? `<span class="ar" lang="ar" dir="rtl">${h.ch}</span>` : r === false ? '✗' : k === sn.ti && !sn.over ? '?' : '·'}</i>`;
        }).join('');
    }
    function spawn() {
        const T = target(), head = sn.snake[0], prev = sn.ti > 0 ? seq[sn.ti - 1] : null;
        const fam = (HIJ_FAM_OF[T.i] || []).map(x => HIJ_BY[x]);
        const dec = distract(T.i, P.board[i] - 1, [prev ? [prev] : [], shuffle(fam), shuffle(HIJ.filter(x => x.i !== T.i))], x => x.i);
        sn.letters = [];
        sn.elapsed = 0;
        [T, ...dec].forEach(h => {
            let x, y, t = 0;
            do {
                x = rnd(N);
                y = rnd(N);
                t++;
            } while ((!free(x, y) || Math.abs(x - head.x) + Math.abs(y - head.y) < 3) && t < 300);
            sn.letters.push({ idx: h.i, ch: h.ch, x, y });
        });
        renderHud();
        renderStrip();
    }
    function advance() {
        sn.ti++;
        if (sn.ti >= total) {
            sn.over = true;
            renderStrip();
            return;
        }
        spawn();
    }
    function eat(L) {
        const T = target(), ok = L.idx === T.i;
        sn.res[sn.ti] = ok;
        quickAns(ok, hitem(T));
        if (ok)
            sn.grow += 1;
        else
            toast(`Bukan itu! Yang dicari: ${T.name} (${T.lat})`);
        advance();
    }
    function step() {
        if (sn.nextDir) {
            if (!(sn.nextDir.x === -sn.dir.x && sn.nextDir.y === -sn.dir.y))
                sn.dir = sn.nextDir;
            sn.nextDir = null;
        }
        const h = sn.snake[0], nx = (h.x + sn.dir.x + N) % N, ny = (h.y + sn.dir.y + N) % N;
        const body = sn.snake.slice(0, sn.snake.length - (sn.grow > 0 ? 0 : 1));
        if (body.some(c => c.x === nx && c.y === ny)) { // menabrak badan sendiri: ular memendek, tidak ada hukuman
            sn.snake = [{ x: h.x, y: h.y }, { x: (h.x - sn.dir.x + N) % N, y: (h.y - sn.dir.y + N) % N }, { x: (h.x - 2 * sn.dir.x + N + N) % N, y: (h.y - 2 * sn.dir.y + N + N) % N }];
            sn.grow = 0;
            sfx('tap');
        }
        sn.snake.unshift({ x: nx, y: ny });
        if (sn.grow > 0)
            sn.grow--;
        else
            sn.snake.pop();
        const L = sn.letters.find(z => z.x === nx && z.y === ny);
        if (L && !sn.over)
            eat(L);
    }
    const rr = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };
    function draw(now) {
        ctx.clearRect(0, 0, 600, 600);
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++) {
                ctx.fillStyle = (x + y) % 2 ? '#FBFFFC' : '#EEF7F1';
                ctx.fillRect(x * CS, y * CS, CS, CS);
            }
        const T = sn.over ? null : target(), ring = T && (sn.ti === 0 || P.hint[i] === 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${Math.round(CS * 0.7)}px 'Scheherazade New','Traditional Arabic',serif`;
        sn.letters.forEach(L => {
            const px = L.x * CS, py = L.y * CS;
            rr(px + 3, py + 3, CS - 6, CS - 6, 12);
            ctx.fillStyle = '#FFF8DD';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#D9B04A';
            ctx.stroke();
            ctx.fillStyle = '#0F3D42';
            ctx.fillText(L.ch, px + CS / 2, py + CS / 2 + CS * 0.06);
            if (ring && T && L.idx === T.i) {
                const p = 2 + Math.sin(now / 180) * 2;
                rr(px + 1 - p / 2, py + 1 - p / 2, CS - 2 + p, CS - 2 + p, 14);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#12936F';
                ctx.stroke();
            }
        });
        const n = sn.snake.length;
        for (let k = n - 1; k >= 0; k--) {
            const c = sn.snake[k], px = c.x * CS, py = c.y * CS, pad = k === 0 ? 3 : 6 + Math.min(k, 6) * .4;
            rr(px + pad, py + pad, CS - pad * 2, CS - pad * 2, k === 0 ? 14 : 11);
            ctx.fillStyle = k === 0 ? '#0E8A6E' : (k % 2 ? '#19B394' : '#12A07F');
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0A6B52';
            ctx.stroke();
            if (k === 0) {
                const d = sn.dir, ex = d.x ? 0 : 1, ey = d.y ? 0 : 1;
                [-1, 1].forEach(sd => {
                    const cx = px + CS / 2 + d.x * CS * .16 + (d.x ? 0 : sd * CS * .17), cy = py + CS / 2 + d.y * CS * .16 + (d.y ? 0 : sd * CS * .17);
                    ctx.beginPath();
                    ctx.arc(cx, cy, CS * .1, 0, 6.3);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(cx + d.x * CS * .03, cy + d.y * CS * .03, CS * .05, 0, 6.3);
                    ctx.fillStyle = '#17322F';
                    ctx.fill();
                });
            }
        }
    }
    let lastT = performance.now();
    function anim(now) {
        if (run !== myRun || !document.getElementById('sn'))
            return;
        const dt = Math.min(100, now - lastT);
        lastT = now;
        if (!paused()) {
            sn.elapsed += dt;
            const lim = P.timer[i] * 1000;
            if (lim) {
                paintTimer($('#sn-tm'), 1 - sn.elapsed / lim, (lim - sn.elapsed) / 1000);
                if (sn.elapsed > lim) {
                    const T = target();
                    sn.res[sn.ti] = false;
                    quickAns(false, hitem(T));
                    toast('⏰ Waktu habis! Yang dicari: ' + T.name);
                    advance();
                }
            }
        }
        draw(now);
        requestAnimationFrame(anim);
    }
    function loop() {
        if (run !== myRun || !document.getElementById('sn'))
            return;
        if (!paused())
            step();
        later(loop, P.speed[i]);
    }
    function start() {
        if (sn.started)
            return;
        sn.started = true;
        const s = $('#sn-start');
        if (s)
            s.classList.add('hidden');
    }
    function setDir(dx, dy) {
        start();
        const d = sn.nextDir || sn.dir;
        if (dx === -d.x && dy === -d.y)
            return;
        sn.nextDir = { x: dx, y: dy };
    }
    let tx = 0, ty = 0;
    cv.addEventListener('touchstart', e => {
        const t = e.changedTouches[0];
        tx = t.clientX;
        ty = t.clientY;
        e.preventDefault();
    }, { passive: false });
    cv.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    cv.addEventListener('touchend', e => {
        const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18)
            return;
        if (Math.abs(dx) > Math.abs(dy))
            setDir(dx > 0 ? 1 : -1, 0);
        else
            setDir(0, dy > 0 ? 1 : -1);
        e.preventDefault();
    }, { passive: false });
    Object.assign(q, { setDir, start, step, eat, sn, seq,
        cheat: ok => {
            const T = target(), L = sn.letters.find(z => ok ? z.idx === T.i : z.idx !== T.i) || sn.letters[0];
            eat(L);
        } }); // dipakai pengujian
    spawn();
    draw(performance.now());
    requestAnimationFrame(anim);
    later(loop, P.speed[i]);
}

document.addEventListener('keydown', e => {
    if (!run || run.g !== 13 || !run.q || !run.q.setDir || curView !== 'game' || !$('#overlay').classList.contains('hidden'))
        return;
    const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
    const d = m[e.key];
    if (d) {
        e.preventDefault();
        run.q.setDir(d[0], d[1]);
    }
});

Object.assign(ACTIONS, {
    o12pick: t => o12pick(+t.dataset.i),
    o12hint: () => {
        const q = run.q;
        if (!q || run.locked)
            return;
        q.hinted = true;
        q.draw();
    },
    'sn-go': () => run.q && run.q.start && run.q.start(),
    'sn-dir': t => {
        const m = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[t.dataset.d];
        if (run.q && run.q.setDir)
            run.q.setDir(m[0], m[1]);
    },
    'open-hij': () => {
        learnState.surah = null;
        learnState.taj = false;
        learnState.hij = true;
        renderLearn();
        window.scrollTo({ top: 0 });
    },
    'study-hij': () => {
        learnState.surah = null;
        learnState.taj = false;
        learnState.hij = true;
        nav('learn');
    }
});

/* ---------- halaman belajar huruf ---------- */
const hijCard = h => {
    const fs = hijForms(h);
    return `<article class="hijcard"><div class="hij-no">${h.i}</div><div class="ar hij-big" lang="ar" dir="rtl">${h.ch}</div><b>${esc(h.name)}</b><div class="hij-lat">Latin: <b>${esc(h.lat)}</b></div>${hijAlt(h) ? `<small class="muted">Sebutan lain: ${esc(hijAlt(h))}</small>` : ''}${fs.length ? `<div class="hij-forms">${fs.map(([n, s]) => `<span><span class="ar" lang="ar" dir="rtl">${s}</span><small>${n}</small></span>`).join('')}</div>` : '<small class="muted">Tidak bersambung ke huruf lain</small>'}</article>`;
};

function renderHij() {
    $('#v-learn').innerHTML = `<button class="btn btn-ghost btn-sm" data-act="learn-back">⬅ Kembali</button>
  <h2 class="sec-title" style="margin-top:12px">🔤 Huruf Hijaiyyah</h2>
  <p class="muted" style="font-weight:700;margin-top:-4px">30 huruf dari Alif sampai Ya. Nama dan tulisan Latinnya memakai penulisan yang lazim di buku pelajaran dan pengajaran di Indonesia.</p>
  <div class="hijgrid">${HIJ.map(hijCard).join('')}</div>
  <p class="muted small" style="margin-top:12px">Urutan: Alif sampai Ya (Ya = huruf ke-30). Sebagian buku menyebut 29 huruf tanpa Lam Alif; di sini Lam Alif (لا) ikut dihitung sehingga menjadi 30.</p>`;
}
