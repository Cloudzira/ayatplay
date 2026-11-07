/* =====================================================================
   Game 1-10: hafalan ayat
   Tebak Surah, Sambung Ayat, Urutkan Ayat, Bacakan Ayat, Detektif Kata, Kartu Ingatan, Susun Kata, Tebak Arti, Dengar & Pilih, Kata Menghilang.
   ===================================================================== */
'use strict';

/* =====================================================================
   10 GAME
   ===================================================================== */
const OPTS = (arr) => arr.map(o => `<button class="opt ${o.cls || ''}" data-act="opt" data-ok="${o.ok ? 1 : 0}">${o.html}</button>`).join('');

/* 1. Tebak Surah */
function r1(el, cfg, l) {
    const P = LV[1], v = pickV(x => x.words.length <= P.maxw[l - 1]), t = SURAHS[v.s];
    const pool = [...new Set(scopePool().map(x => x.s))].map(n => SURAHS[n]);
    const nd = P.near[l - 1], near = SURAH_LIST.filter(s => s.no !== t.no && Math.abs(s.no - t.no) <= nd);
    const wrong = distract(t.no, cfg.opts - 1, nd >= 99 ? [pool, SURAH_LIST] : [near, pool, SURAH_LIST], s => s.no);
    const opts = shuffle([t, ...wrong]);
    run.q = { v };
    el.innerHTML = `<div class="q-text">Ayat ini ada di surah apa?</div>${mushaf(v.ar, { v })}
    <div style="text-align:center">${listenBtn(v)}</div>
    <div class="opts c3">${OPTS(opts.map(s => ({ ok: s.no === t.no, html: `<span>${esc(s.name)}</span><span class="ar opt-ar" lang="ar">${s.ar}</span>` })))}</div>`;
    run.q.wrong = `Jawaban yang benar: Surah ${esc(t.name)}.`;
    if (cfg.timer)
        startTimer(cfg.timer);
}

/* 2. Sambung Ayat */
function r2(el, cfg, l) {
    const frac = LV[2].frac[l - 1];
    if (frac) {
        const f = x => x.words.length >= 2, v = pickV(f), w = v.words;
        const cutOf = ww => Math.min(ww.length - 1, Math.max(1, Math.round(ww.length * frac)));
        const c = cutOf(w), head = w.slice(0, c).join(' '), tail = w.slice(c).join(' ');
        const o = others(v, f), mk = a => a.map(x => ({ x, t: x.words.slice(cutOf(x.words)).join(' ') }));
        const wrong = distract(tail, cfg.opts - 1, l <= 3 ? [mk(o.scope), mk(o.all)] : [mk(o.same), mk(o.scope), mk(o.all)], z => z.t);
        const opts = shuffle([{ t: tail, ok: 1 }, ...wrong.map(z => ({ t: z.t, ok: 0 }))]);
        run.q = { v };
        el.innerHTML = `<div class="q-text">Lanjutkan ayatnya! 🔗</div>${mushaf(`${head} <span style="color:#B8860B">…</span>`, { v, badge: `${v.sName} · ayat ${v.n}` })}
      <div style="text-align:center">${listenBtn(v)}</div>
      <div class="opts">${OPTS(opts.map(z => ({ ok: z.ok, html: arSpan(z.t) })))}</div>`;
    }
    else {
        const f = x => {
            const n = SURAHS[x.s].verses[x.i + 1];
            return !!n && n.words.length <= 30;
        }, v = pickV(f), nx = SURAHS[v.s].verses[v.i + 1];
        const same = SURAHS[v.s].verses.filter(x => x.key !== v.key && x.key !== nx.key);
        const sc = scopePool().filter(x => x.key !== v.key), al = VERSES.filter(x => x.key !== v.key);
        const wrong = distract(nx.ar, cfg.opts - 1, [same, sc, al], x => x.ar);
        const opts = shuffle([{ t: nx.ar, ok: 1 }, ...wrong.map(x => ({ t: x.ar, ok: 0 }))]);
        run.q = { v: [v, nx] };
        el.innerHTML = `<div class="q-text">Ayat apa yang datang SETELAH ayat ini? ➡️</div>${mushaf(v.ar, { v, badge: `${v.sName} · ayat ${v.n}` })}
      <div style="text-align:center">${listenBtn(v)}</div>
      <div class="opts">${OPTS(opts.map(z => ({ ok: z.ok, html: arSpan(z.t) })))}</div>`;
    }
    run.q.wrong = 'Perhatikan sambungan yang benar di bawah ini ya.';
    if (cfg.timer)
        startTimer(cfg.timer);
}

/* 3. Urutkan Ayat */
function r3(el, cfg, l) {
    const k = LV[3].k[l - 1];
    const inScope = [...new Set(scopePool().map(x => x.s))].map(n => SURAHS[n]);
    const windows = (list, kk) => {
        const out = [];
        list.forEach(s => {
            for (let st = 0; st + kk <= s.verses.length; st++) {
                const w = s.verses.slice(st, st + kk);
                if (w.reduce((n, v) => n + v.words.length, 0) <= Math.min(40 + 14 * kk, Math.max(16, Math.round(innerHeight / 16))))
                    out.push(w);
            }
        });
        return out;
    };
    let win = null;
    const juzList = SURAH_LIST.filter(s => S.scope.juz === 'all' || String(s.juz) === String(S.scope.juz));
    for (const list of [inScope, juzList, SURAH_LIST])
        for (let kk = k; kk >= 2 && !win; kk--) {
            const fresh = windows(list, kk).filter(w => !run.used.has(w[0].key) && !run.used.has('w' + w[0].key));
            if (fresh.length)
                win = pick(fresh);
        }
    if (!win) {
        const any = windows(SURAH_LIST, k);
        win = any.length ? pick(any) : SURAH_LIST[0].verses.slice(0, 2);
    }
    run.used.add(win[0].key);
    run.used.add('w' + win[0].key);
    const s = SURAHS[win[0].s];
    let items = shuffle(win), tries = 0;
    while (items.every((v, i) => v.ar === win[i].ar) && tries++ < 12)
        items = shuffle(win);
    const q = run.q = { v: win, sel: [], done: null };
    const draw = () => {
        el.innerHTML = `<div class="q-text">Ketuk ayat sesuai urutannya (1, 2, 3, …) dari ayat pertama Surah ${esc(s.name)}</div>
      <div class="gb seqgrid">${items.map((v, idx) => {
            const pos = q.sel.indexOf(idx);
            return `<button class="seq-item ${pos >= 0 ? 'picked' : ''} ${q.done && pos >= 0 ? (q.done[pos] ? 'ok' : 'bad') : ''}" data-act="o3pick" data-idx="${idx}" ${q.done ? 'disabled' : ''} aria-label="${pos >= 0 ? 'Urutan ' + (pos + 1) : 'Belum diurutkan'}"><span class="seq-n">${pos >= 0 ? pos + 1 : '·'}</span>${arSpan(v.ar, 'ar-sm')}</button>`;
        }).join('')}</div>
      <button class="btn btn-sun btn-block" data-act="o3chk" ${q.sel.length < items.length || q.done ? 'disabled' : ''}>Periksa urutan ✔</button>`;
    };
    q.draw = draw;
    q.items = items;
    draw();
}

/* 4. Bacakan Ayat */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function r4(el, cfg, l) {
    const P = LV[4], i = l - 1;
    const v = pickV(x => x.words.length >= P.min[i] && x.words.length <= P.max[i]), hide = !!P.hide[i];
    run.q = { v, att: 0 };
    el.innerHTML = `<div class="q-text">${hide ? 'Bacakan ayat ini dari ingatanmu!' : 'Bacakan ayat ini dengan suara merdu!'}</div>
    <div id="mus">${mushaf(v.ar, { v, badge: `${v.sName} · ayat ${v.n}`, blur: hide })}</div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${listenBtn(v)}${hide && P.peek[i] ? '<button class="btn btn-ghost btn-sm" data-act="peek">👀 Intip ayat</button>' : ''}</div>
    ${SR ? `<div class="gb"><button class="mic" id="mic" data-act="mic" aria-label="Mulai merekam bacaan">🎤</button><div class="hint" id="mic-msg" style="margin-top:10px">Tekan mikrofon, lalu bacakan ayatnya dengan lantang.</div></div>`
        : `<div class="hint gb">Perangkat ini belum mendukung pengenalan suara, jadi nilai bacaanmu sendiri ya. Baca keras-keras dulu!</div>`}
    <div style="display:grid;gap:10px;max-width:520px;margin:0 auto;width:100%">
      <button class="btn btn-mint btn-block" data-act="selfok">Aku sudah lancar ✅</button>
      <button class="btn btn-ghost btn-block" data-act="selfno">Aku masih belajar 🔁</button></div>`;
}

function startMic() {
    if (!SR || !run || run.locked)
        return;
    stopAudio();
    const q = run.q, mic = $('#mic'), msg = $('#mic-msg');
    let got = false, err = false;
    const rec = new SR();
    rec.lang = 'ar-SA';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    mic.classList.add('rec');
    msg.textContent = '🎙️ Mendengarkan… silakan membaca!';
    rec.onresult = e => {
        got = true;
        const alts = [...e.results[0]].map(a => a.transcript), sim = Math.max(...alts.map(a => similarity(a, q.v.ar))), pc = Math.round(sim * 100);
        q.att++;
        if (sim >= .42 + .015 * run.l)
            ans(true, q.v, `Kemiripan bacaanmu ±${pc}%. (Penilaian suara hanya perkiraan.)`);
        else if (q.att >= 2)
            ans(false, q.v, `Kemiripan ±${pc}%. Dengarkan contoh qari lalu coba lagi nanti ya.`);
        else
            msg.textContent = `Kemiripan ±${pc}%. Coba sekali lagi, pelan-pelan dan jelas ya!`;
    };
    rec.onerror = ev => {
        err = true;
        msg.textContent = ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'Izin mikrofon belum diberikan. Kamu bisa menilai bacaanmu sendiri di bawah.' : 'Suara belum tertangkap. Coba lagi, atau nilai bacaanmu sendiri.';
    };
    rec.onend = () => {
        if (mic)
            mic.classList.remove('rec');
        if (!got && !err && !run.locked)
            msg.textContent = 'Suaramu belum terdengar. Coba lagi ya.';
    };
    try {
        rec.start();
    }
    catch (e) {
        mic.classList.remove('rec');
    }
}

/* 5. Detektif Kata */
function r5(el, cfg, l) {
    const P = LV[5], nb = P.nb[l - 1], v = pickV(x => x.words.length >= Math.max(2, nb + 1)), w = v.words;
    let cand = shuffle(w.map((_, i) => i)).filter(i => normAr(w[i]).length >= 3);
    if (cand.length < nb)
        cand = shuffle(w.map((_, i) => i));
    const blanks = cand.slice(0, nb).sort((a, b) => a - b), answers = blanks.map(i => w[i]);
    const o = others(v), words = a => a.flatMap(x => x.words);
    const groups = P.same[l - 1] ? [words(o.same), words(o.scope), words(o.all)] : [words(o.scope), words(o.all)];
    const seen = new Set(w.map(normAr)), wrong = [];
    for (const g of groups) {
        for (const c of shuffle(g)) {
            if (wrong.length >= cfg.opts - nb)
                break;
            const k = normAr(c);
            if (!seen.has(k)) {
                seen.add(k);
                wrong.push(c);
            }
        }
    }
    const chips = shuffle([...answers, ...wrong]);
    const q = run.q = { v, fills: Array(nb).fill(null), done: false };
    const draw = () => {
        let k = 0;
        const line = w.map((t, j) => {
            if (blanks.includes(j)) {
                const kk = k++, f = q.fills[kk];
                const cls = q.done ? (chips[f] === answers[kk] ? 'ok' : 'bad') : '';
                return `<button class="slot ${f !== null ? 'fill' : ''} ${cls}" data-act="o5un" data-k="${kk}" ${q.done ? 'disabled' : ''} aria-label="Kata hilang ${kk + 1}">${f !== null ? chips[f] : '؟'}</button>`;
            }
            return `<span>${t}</span>`;
        }).join(' ');
        el.innerHTML = `<div class="q-text">🔍 Temukan ${nb > 1 ? nb + ' kata' : 'kata'} yang hilang!</div>
      <div class="mushaf"><span class="badge-n">${esc(v.sName)} · ayat ${v.n}</span><div class="ar ${szOf(v)}" lang="ar" dir="rtl">${line}</div></div>
      <div style="text-align:center">${listenBtn(v)}</div>
      <div class="tray">${chips.map((c, i) => `<button class="chip-w ar ${q.fills.includes(i) ? 'used' : ''}" data-act="o5pick" data-i="${i}" ${q.done ? 'disabled' : ''}>${c}</button>`).join('')}</div>
      <div class="hint">${nb > 1 ? 'Isi dari kata hilang pertama (paling kanan). ' : ''}Ketuk kotak yang sudah terisi untuk mengganti.</div>`;
    };
    q.draw = draw;
    q.chips = chips;
    q.answers = answers;
    draw();
}

/* 6. Memory Card */
function r6(el, cfg, l) {
    const pairs = LV[6].pairs[l - 1], peek = LV[6].peek[l - 1];
    const ok = x => x.words.length <= 5 && x.id.length <= 60;
    const chosen = [], seen = new Set();
    const src = [...shuffle(scopePool().filter(ok).filter(x => !run.used.has(x.key))), ...shuffle(scopePool().filter(ok)), ...shuffle(VERSES.filter(ok))];
    for (const x of src) {
        if (chosen.length >= pairs)
            break;
        if (!seen.has(x.ar) && !seen.has(x.id) && !chosen.includes(x)) {
            seen.add(x.ar);
            seen.add(x.id);
            chosen.push(x);
        }
    }
    chosen.forEach(x => run.used.add(x.key));
    const cards = shuffle(chosen.flatMap(x => [{ m: x.key, type: 'ar', html: `<span class="ar" lang="ar" dir="rtl">${x.ar}</span>` }, { m: x.key, type: 'id', html: esc(x.id) }]));
    const q = run.q = { v: chosen, cards, first: null, lock: true, moves: 0, matched: 0, pairs };
    el.innerHTML = `<div class="q-text">Pasangkan ayat dengan artinya 🃏</div><div class="hint" id="mh">Perhatikan kartunya dulu…</div>
    <div class="mgrid n${pairs * 2}">${cards.map((c, i) => `<button class="mcard" data-act="flip" data-i="${i}" aria-label="Kartu ${i + 1}"><span class="in"><span class="b">⭐</span><span class="f ${c.type === 'ar' ? 'arf' : ''}">${c.html}</span></span></button>`).join('')}</div>
    <div class="hint">Langkah: <b id="mv">0</b> · target ${Math.ceil(pairs * 2.2)} langkah atau kurang</div>`;
    later(() => $$('.mcard').forEach(c => c.classList.add('up')), 350);
    later(() => {
        $$('.mcard').forEach(c => c.classList.remove('up'));
        q.lock = false;
        const h = $('#mh');
        if (h)
            h.textContent = 'Sekarang cari pasangannya!';
    }, 350 + peek * 1000);
}

function flipCard(i) {
    const q = run.q;
    if (!q || q.lock || run.locked)
        return;
    const cs = $$('.mcard'), c = cs[i];
    if (c.classList.contains('up') || c.classList.contains('done'))
        return;
    c.classList.add('up');
    sfx('tap');
    if (q.first === null) {
        q.first = i;
        return;
    }
    const a = q.first;
    q.first = null;
    q.moves++;
    $('#mv').textContent = q.moves;
    if (q.cards[a].m === q.cards[i].m) {
        sfx('correct');
        q.matched++;
        [cs[a], c].forEach(x => x.classList.add('done'));
        if (q.matched === q.pairs) {
            const allowed = Math.ceil(q.pairs * 2.2);
            later(() => ans(q.moves <= allowed, q.v, `Kamu menyelesaikannya dalam ${q.moves} langkah (target ${allowed} atau kurang).`), 700);
        }
    }
    else {
        q.lock = true;
        sfx('wrong');
        later(() => {
            cs[a].classList.remove('up');
            c.classList.remove('up');
            q.lock = false;
        }, 950);
    }
}

/* 7. Susun Kata */
function r7(el, cfg, l) {
    const P = LV[7], f = x => x.words.length >= P.min[l - 1] && x.words.length <= P.max[l - 1];
    const v = pickV(f), w = v.words;
    let items = shuffle(w.map((t, i) => ({ t, i }))), tries = 0;
    while (items.every((it, i) => it.t === w[i]) && tries++ < 12)
        items = shuffle(w.map((t, i) => ({ t, i })));
    const q = run.q = { v, items, sel: [], done: null };
    const draw = () => {
        el.innerHTML = `<div class="q-text">Susun kata-kata menjadi ayat yang benar 🧩</div>
      ${P.mean[l - 1] ? `<div class="hint" style="font-size:.95rem">Artinya: “${esc(v.id)}”</div>` : `<div class="hint">Tanpa petunjuk arti. Ingat-ingat bacaannya!</div>`}
      <div style="text-align:center">${listenBtn(v)}</div>
      <div class="slotrow">${q.sel.length ? q.sel.map((idx, pos) => `<button class="chip-w ar ${q.done ? (q.done[pos] ? 'ok' : 'bad') : ''}" data-act="o7un" data-pos="${pos}" ${q.done ? 'disabled' : ''}>${items[idx].t}</button>`).join('') : '<span class="hint" style="direction:ltr">Ketuk kata di bawah, mulai dari kata pertama (paling kanan)</span>'}</div>
      <div class="tray">${items.map((it, idx) => `<button class="chip-w ar ${q.sel.includes(idx) ? 'used' : ''}" data-act="o7pick" data-idx="${idx}" ${q.done ? 'disabled' : ''}>${it.t}</button>`).join('')}</div>
      <button class="btn btn-sun btn-block" data-act="o7chk" ${q.sel.length < items.length || q.done ? 'disabled' : ''}>Periksa susunan ✔</button>`;
    };
    q.draw = draw;
    draw();
}

/* 8. Tebak Arti */
function r8(el, cfg, l) {
    const rev = Math.random() < LV[8].rev[l - 1], v = pickV(), o = others(v);
    const key = rev ? (x => x.ar) : (x => x.id);
    const wrong = distract(key(v), cfg.opts - 1, l <= 2 ? [o.scope, o.all] : [o.same, o.scope, o.all], key);
    const opts = shuffle([v, ...wrong]);
    run.q = { v, wrong: rev ? 'Ayat yang cocok dengan artinya ada di bawah ini.' : 'Arti yang tepat ada di bawah ini.' };
    el.innerHTML = `<div class="q-text">${rev ? 'Mana ayat yang artinya seperti ini?' : 'Apa arti ayat ini?'}</div>
    ${rev ? `<div class="mushaf"><div style="font-weight:800;font-size:1.15rem;line-height:1.6;padding:6px 4px">“${esc(v.id)}”</div></div>` : `${mushaf(v.ar, { v, badge: `${v.sName} · ayat ${v.n}` })}<div style="text-align:center">${listenBtn(v)}</div>`}
    <div class="opts">${OPTS(opts.map(x => ({ ok: x.key === v.key, cls: rev ? '' : 'txt', html: rev ? arSpan(x.ar) : esc(x.id) })))}</div>`;
    if (cfg.timer)
        startTimer(cfg.timer);
}

/* 9. Dengar & Pilih */
function r9(el, cfg, l) {
    const P = LV[9], mode = P.mode[l - 1], v = pickV(x => x.words.length <= P.maxw[l - 1]), o = others(v);
    const near = a => a.map(x => [Math.abs(x.words.length - v.words.length) + Math.random() * 1.5, x]).sort((p, q) => p[0] - q[0]).map(z => z[1]);
    const wrong = distract(v.ar, cfg.opts - 1, mode === 0 ? [o.scope, o.all] : mode === 1 ? [o.same, o.scope, o.all] : [near(o.same), near(o.scope), near(o.all)], x => x.ar, mode === 2);
    const opts = shuffle([v, ...wrong]);
    run.q = { v, wrong: 'Ini ayat yang kamu dengar tadi.' };
    el.innerHTML = `<div class="q-text">Dengarkan baik-baik, lalu pilih ayat yang kamu dengar 🎧</div>
    <div style="text-align:center"><button class="btn btn-sun listen" style="font-size:1.3rem;padding:16px 28px" data-act="gplay" data-key="${v.key}">🔊 Putar suara</button><div class="hint" style="margin-top:8px">Boleh diputar berulang kali</div></div>
    <div class="opts">${OPTS(opts.map(x => ({ ok: x.key === v.key, html: arSpan(x.ar) })))}</div>`;
    later(() => {
        if (!run.locked)
            playOnce(v).then(r => {
                if (r === false)
                    audioFail();
            });
    }, 350);
    if (cfg.timer)
        startTimer(cfg.timer);
}

/* 10. Kata Menghilang (teknik hafalan bertahap) */
function r10(el, cfg, l) {
    const P = LV[10], i = l - 1;
    const v = pickV(x => x.words.length >= P.min[i] && x.words.length <= P.max[i]), w = v.words, order = shuffle(w.map((_, k) => k));
    const fr = Array.from({ length: P.n[i] }, (_, k) => (k + 1) / P.n[i]);
    const q = run.q = { v, stage: -1, peek: new Set(), all: false };
    const draw = () => {
        if (q.stage < 0) {
            el.innerHTML = `<div class="q-text">Tahap awal: baca & dengar 👂</div>${mushaf(v.ar, { v, badge: `${v.sName} · ayat ${v.n}` })}
        <div class="hint" style="font-size:.95rem">Artinya: “${esc(v.id)}”</div>
        <div style="text-align:center">${listenBtn(v)}</div>
        <div class="hint gb">Baca ayat ini keras-keras 3 kali bersama qari. Setelah itu, kata-katanya akan menghilang pelan-pelan!</div>
        <button class="btn btn-mint btn-block" data-act="g10go" style="max-width:420px;margin:0 auto">Aku siap, mulai hafalkan 🧠</button>`;
            return;
        }
        const n = Math.min(w.length, Math.max(1, Math.ceil(fr[q.stage] * w.length))), hidden = new Set(order.slice(0, n)), last = q.stage === fr.length - 1;
        const line = w.map((t, j) => hidden.has(j) && !q.peek.has(j) && !q.all ? `<button class="ghost" data-act="g10peek" data-j="${j}" style="min-width:${Math.max(46, normAr(t).length * 12)}px" aria-label="Kata tersembunyi. Ketuk untuk mengintip"></button>` : `<span ${hidden.has(j) && !q.all ? 'style="color:#B8860B"' : ''}>${t}</span>`).join(' ');
        el.innerHTML = `<div class="q-text">Tahap ${q.stage + 1} dari ${fr.length} · ${Math.round(n / w.length * 100)}% kata disembunyikan</div>
      <div class="mushaf"><span class="badge-n">${esc(v.sName)} · ayat ${v.n}</span><div class="ar ${szOf(v)}" lang="ar" dir="rtl">${line}</div></div>
      <div style="text-align:center">${listenBtn(v)}</div>
      <div class="hint gb">${q.all ? 'Apakah bacaanmu tadi sudah benar semua?' : 'Ucapkan ayatnya dari ingatan. Ketuk kotak kosong kalau lupa.'}</div>
      ${q.all ? `<div style="display:grid;gap:10px;max-width:520px;margin:0 auto;width:100%"><button class="btn btn-mint btn-block" data-act="selfok">Benar semua ✅</button><button class="btn btn-ghost btn-block" data-act="selfno">Masih ada yang salah 🔁</button></div>`
            : last ? `<button class="btn btn-sun btn-block" data-act="g10check" style="max-width:420px;margin:0 auto">Cek ayatku 👀</button>`
                : `<button class="btn btn-sun btn-block" data-act="g10next" style="max-width:420px;margin:0 auto">Lanjut, lebih sulit ➡️</button>`}`;
    };
    q.draw = draw;
    draw();
}
