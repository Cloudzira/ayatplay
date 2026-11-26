/* =====================================================================
   Font ayat Mushaf Madinah (QCF4)
   Mengganti tulisan ayat dan potongan ayat dengan font QCF4 (kaligrafi Utsman Taha, Kompleks
   Percetakan Al-Qur'an Raja Fahd, Madinah, 1441 H). Sumber font dan data glyph:
   https://github.com/MohamadHajjRabee/quran-qcf4

   Cara kerja:
   - QCF4 menyimpan SATU glyph untuk SATU kata, dan tiap kata punya nomor font sendiri (47 file).
     Peta glyph tiap ayat ada di js/data/qcf4-map.js.
   - Saat data ayat disusun, tiap kata aplikasi dipasangkan dengan glyph QCF4 menurut urutannya
     (index) lalu diperiksa: jumlah kata harus sama dan huruf pertama tiap kata harus cocok.
     Kata yang tidak lolos pemeriksaan tetap memakai font lama, jadi tidak pernah salah kata.
   - Pengganti bekerja di tampilan (DOM) dan kanvas, tanpa mengubah teks sumber (v.ar, v.words),
     sehingga pencocokan jawaban, suara, dan audio tetap memakai teks asli.
   - File font TIDAK dibundel (lisensi font melarang redistribusi); dimuat dari CDN jsDelivr
     per file saat dibutuhkan, lalu disimpan service worker agar bisa dipakai offline.
   ===================================================================== */
'use strict';

const QCF = (function () {
    const COMMIT = '5130511027e769f0a8f4eeb7f00f46bde3788d60'; // kunci versi repo agar font tidak berubah diam-diam
    const fam = n => 'QCF4_Hafs_' + String(n).padStart(2, '0');
    const fontUrl = n => `https://cdn.jsdelivr.net/gh/MohamadHajjRabee/quran-qcf4@${COMMIT}/fonts-woff2/${fam(n)}_W.woff2`;
    const AR = /[\u0600-\u06FF]/;
    const WS = /([ \t\r\n]+)/;
    const TRAIL = /\u00A0[\u06D6-\u06DC\u06DE\u06E9]+$/; // tanda waqaf yang ditempel aplikasi di belakang kata
    // area yang tidak boleh diganti: huruf lepas, tajwid berwarna (huruf di dalam kata diberi warna), pratinjau font
    const SKIP = '[data-noqcf],.fontopt,.tajpage,.taj-big,.taj-opt,.taj-sub,.taj-let,.tajex,.tajhuruf,.tajname,.trow,.hij-big,.hij-opt,.hij-hud,.hij-placed,.hij-tile,.hijcard,.opt-ar,.ar-sm,.top2,.cert-quote';
    const QK = 1.3; // skala ukuran glyph QCF4 terhadap ukuran huruf sekitarnya

    const DICT = new Map();          // kata aplikasi (persis) -> { f: nomor font, g: glyph }
    const FS = new Map();            // nomor font -> 'ok' | 'fail' | Promise
    const failedAt = new Map();
    const pending = new Set();       // simpul teks yang menunggu font selesai dimuat
    const stats = { verses: 0, aligned: 0, skipped: 0, words: 0, mapped: 0 };
    let observer = null;

    const enabled = () => typeof S === 'undefined' || S.qcf !== false;
    const skeletonFirst = w => (normAr(w.replace(/\u00A0/g, ' ')).replace(/ا/g, '').replace(/\s+/g, '')[0] || '-');

    /* ---------- 1. Pemasangan kata aplikasi <-> glyph QCF4 ---------- */
    function parseRec(rec) {
        const fonts = [];
        rec[0].split(',').forEach(r => {
            const [f, n] = r.split('*');
            for (let i = 0; i < +n; i++)
                fonts.push(+f);
        });
        return { fonts, glyphs: rec[1].split(' '), first: Array.from(rec[2]) };
    }

    function index(verses) {
        DICT.clear();
        Object.assign(stats, { verses: 0, aligned: 0, skipped: 0, words: 0, mapped: 0 });
        if (typeof QCF4_DATA === 'undefined' || !Array.isArray(verses))
            return;
        for (const v of verses) {
            const rec = QCF4_DATA[v.key];
            if (!rec)
                continue;
            stats.verses++;
            const p = parseRec(rec), W = v.words;
            if (!W || W.length !== p.glyphs.length) {
                stats.skipped++;
                continue;
            }
            stats.aligned++;
            stats.words += W.length;
            W.forEach((w, i) => {
                if (skeletonFirst(w) !== p.first[i])
                    return; // huruf pertama berbeda: jangan dipaksakan
                stats.mapped++;
                const e = { f: p.fonts[i], g: p.glyphs[i] };
                if (!DICT.has(w))
                    DICT.set(w, e);
                const bare = w.replace(TRAIL, ''); // versi tanpa tanda waqaf (dipakai game yang membuang tanda waqaf)
                if (bare !== w && !DICT.has(bare))
                    DICT.set(bare, { f: e.f, g: e.g[0] });
            });
        }
        if (typeof document !== 'undefined' && document.body && enabled())
            scan(document.body);
    }

    /* ---------- 2. Memuat font ---------- */
    function ensure(n) {
        const st = FS.get(n);
        if (st === 'ok')
            return Promise.resolve(true);
        if (st && st.then)
            return st;
        if (st === 'fail' && Date.now() - (failedAt.get(n) || 0) < 45000)
            return Promise.resolve(false); // baru gagal: coba lagi nanti
        if (typeof FontFace === 'undefined' || !document.fonts) {
            FS.set(n, 'fail');
            failedAt.set(n, Date.now());
            return Promise.resolve(false);
        }
        const ff = new FontFace(fam(n), `url(${fontUrl(n)}) format('woff2')`, { display: 'block' });
        const pr = ff.load().then(() => {
            document.fonts.add(ff);
            FS.set(n, 'ok');
            return true;
        }).catch(() => {
            FS.set(n, 'fail');
            failedAt.set(n, Date.now());
            return false;
        }).then(ok => {
            flush();
            return ok;
        });
        FS.set(n, pr);
        return pr;
    }

    const isOk = n => FS.get(n) === 'ok';
    const isFail = n => FS.get(n) === 'fail';

    function fontsOf(text) {
        const set = new Set();
        String(text).split(WS).forEach(t => {
            const e = DICT.get(t);
            if (e)
                set.add(e.f);
        });
        return [...set];
    }

    /* memuat font untuk daftar teks; selesai walau ada yang gagal */
    function preload(texts) {
        const need = new Set();
        (Array.isArray(texts) ? texts : [texts]).forEach(t => fontsOf(t).forEach(n => need.add(n)));
        return Promise.all([...need].map(ensure)).then(r => r.every(Boolean));
    }

    /* memuat font untuk surah/juz yang sedang dipilih, sedikit demi sedikit saat peramban senggang */
    function warm(verses) {
        if (!enabled() || !Array.isArray(verses))
            return;
        const need = [];
        verses.forEach(v => {
            v.words.forEach(w => {
                const e = DICT.get(w);
                if (e && !need.includes(e.f))
                    need.push(e.f);
            });
        });
        const idle = window.requestIdleCallback || (f => setTimeout(f, 400));
        let i = 0;
        const next = () => {
            if (i >= need.length)
                return;
            ensure(need[i++]).then(() => idle(next));
        };
        idle(next);
    }

    /* ---------- 3. Penggantian di tampilan (DOM) ---------- */
    const wordSpan = (tok, e) => {
        const s = document.createElement('span');
        s.className = 'qw';
        s.lang = 'ar';
        s.dataset.t = tok;
        s.setAttribute('role', 'img');
        s.setAttribute('aria-label', tok.replace(/\u00A0/g, ' '));
        s.style.setProperty('font-family', `'${fam(e.f)}'`, 'important');
        s.textContent = e.g;
        return s;
    };

    /* contoh tulisan QCF4 untuk pratinjau di Pengaturan (menyusun kata langsung dari peta glyph) */
    function fillSamples(root) {
        (root || document).querySelectorAll('[data-qsample]').forEach(el => {
            const rec = typeof QCF4_DATA !== 'undefined' && QCF4_DATA[el.dataset.qsample];
            if (!rec)
                return;
            const p = parseRec(rec);
            Promise.all([...new Set(p.fonts)].map(ensure)).then(r => {
                if (!r.every(Boolean) || !el.isConnected)
                    return;
                el.textContent = '';
                p.glyphs.forEach((g, i) => {
                    const s = wordSpan('', { f: p.fonts[i], g });
                    s.removeAttribute('role');
                    s.setAttribute('aria-hidden', 'true');
                    el.appendChild(s);
                    if (i < p.glyphs.length - 1)
                        el.appendChild(document.createTextNode(' '));
                });
            });
        });
    }

    /* elemen bertanda data-qverse="kunci ayat": teks aslinya disimpan, isinya diganti glyph QCF4 bila font siap */
    function fillVerses(root) {
        if (!enabled() || !root || root.nodeType !== 1)
            return;
        const list = [...root.querySelectorAll('[data-qverse]')];
        if (root.matches('[data-qverse]'))
            list.unshift(root);
        list.forEach(el => {
            const rec = typeof QCF4_DATA !== 'undefined' && QCF4_DATA[el.dataset.qverse];
            if (!rec || el.dataset.orig !== undefined)
                return;
            const p = parseRec(rec), orig = el.textContent;
            Promise.all([...new Set(p.fonts)].map(ensure)).then(r => {
                if (!r.every(Boolean) || !el.isConnected || !enabled() || el.dataset.orig !== undefined)
                    return;
                el.dataset.orig = orig;
                el.textContent = '';
                p.glyphs.forEach((g, i) => {
                    const s = wordSpan(orig, { f: p.fonts[i], g });
                    s.dataset.t = '';
                    s.removeAttribute('role');
                    s.removeAttribute('aria-label');
                    el.appendChild(s);
                    if (i < p.glyphs.length - 1)
                        el.appendChild(document.createTextNode(' '));
                });
            });
        });
    }

    function hostOf(tn) {
        const p = tn.parentElement;
        if (!p || p.closest('.qw'))
            return null;
        const host = p.closest('.ar');
        return host && !host.closest(SKIP) && !host.closest('[data-qverse]') ? host : null;
    }

    /* apakah simpul teks ini akan diganti QCF4 (dipakai perbaikan lam-alif agar tidak memecah katanya) */
    function owns(tn) {
        if (!enabled() || !DICT.size || !tn || !tn.nodeValue || !AR.test(tn.nodeValue) || !hostOf(tn))
            return false;
        const parts = tn.nodeValue.split(WS);
        return parts.some(t => {
            const e = DICT.get(t);
            return e && !isFail(e.f);
        });
    }

    function processText(tn) {
        if (!enabled() || !DICT.size || !tn.parentNode || !tn.nodeValue || !AR.test(tn.nodeValue) || !hostOf(tn))
            return;
        const parts = tn.nodeValue.split(WS), ents = parts.map(t => (t && !/^\s+$/.test(t)) ? (DICT.get(t) || null) : null);
        const need = [...new Set(ents.filter(Boolean).map(e => e.f))];
        if (!need.length)
            return;
        const wait = need.filter(n => !isOk(n));
        if (wait.length) {
            if (wait.every(isFail) && !wait.some(n => Date.now() - (failedAt.get(n) || 0) > 45000))
                return; // font tidak bisa dimuat: biarkan font lama
            pending.add(tn);
            wait.forEach(ensure);
            return;
        }
        pending.delete(tn);
        const frag = document.createDocumentFragment();
        let buf = '';
        const flushBuf = () => {
            if (buf) {
                frag.appendChild(document.createTextNode(buf));
                buf = '';
            }
        };
        parts.forEach((t, i) => {
            if (ents[i]) {
                flushBuf();
                frag.appendChild(wordSpan(t, ents[i]));
            }
            else
                buf += t;
        });
        flushBuf();
        tn.replaceWith(frag);
    }

    function scan(root) {
        if (!root || !enabled() || !DICT.size)
            return;
        const base = root.nodeType === 3 ? root.parentNode : root;
        if (!base || base.nodeType !== 1)
            return;
        if (root.nodeType === 3) {
            processText(root);
            return;
        }
        const w = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
            acceptNode: n => (AR.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest('.qw'))) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        });
        const list = [];
        while (w.nextNode())
            list.push(w.currentNode);
        list.forEach(processText);
    }

    /* dipanggil setiap ada font yang selesai dimuat (atau gagal) */
    function flush() {
        const list = [...pending];
        pending.clear();
        list.forEach(tn => {
            if (!tn.isConnected)
                return;
            const parts = tn.nodeValue.split(WS), need = [...new Set(parts.map(t => DICT.get(t)).filter(Boolean).map(e => e.f))];
            if (need.every(isOk))
                processText(tn);
            else if (need.some(n => FS.get(n) && FS.get(n).then))
                pending.add(tn); // masih ada font yang sedang dimuat
            else if (typeof enhanceNode === 'function')
                enhanceNode(tn.parentNode); // font gagal: kembalikan ke perbaikan lam-alif biasa
        });
    }

    function revertAll() {
        document.querySelectorAll('[data-qverse][data-orig]').forEach(el => {
            el.textContent = el.dataset.orig;
            delete el.dataset.orig;
        });
        document.querySelectorAll('.qw').forEach(s => s.replaceWith(document.createTextNode(s.dataset.t || '')));
        document.body.normalize();
        pending.clear();
        if (typeof enhanceNode === 'function')
            enhanceNode(document.body);
    }

    function setEnabled(on) {
        if (typeof S !== 'undefined')
            S.qcf = !!on;
        if (on) {
            scan(document.body);
            fillVerses(document.body);
        }
        else
            revertAll();
        if (typeof scheduleFit === 'function')
            scheduleFit();
    }

    function startObserver() {
        if (observer || typeof MutationObserver === 'undefined')
            return;
        observer = new MutationObserver(ms => {
            if (!enabled() || !DICT.size)
                return;
            for (const m of ms)
                m.addedNodes.forEach(n => {
                    if (n.nodeType === 1 || n.nodeType === 3)
                        scan(n);
                    if (n.nodeType === 1)
                        fillVerses(n);
                });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /* salin teks: kembalikan ke huruf Arab asli, bukan karakter glyph QCF4 */
    document.addEventListener('copy', e => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !e.clipboardData)
            return;
        const box = document.createElement('div');
        for (let i = 0; i < sel.rangeCount; i++)
            box.appendChild(sel.getRangeAt(i).cloneContents());
        if (!box.querySelector('.qw'))
            return;
        box.querySelectorAll('.qw').forEach(s => s.replaceWith(document.createTextNode(s.dataset.t || '')));
        e.clipboardData.setData('text/plain', box.textContent.replace(/\u00A0/g, ' '));
        e.preventDefault();
    });

    /* ---------- 4. Menggambar di kanvas (game Pesawat) ---------- */
    /* teks hanya dianggap siap bila semua font katanya sudah termuat; bila belum, pemanggil memakai font lama */
    function canvasReady(text) {
        if (!enabled())
            return false;
        const ns = fontsOf(text);
        return ns.length > 0 && ns.every(isOk);
    }

    function layout(ctx, text, fs, fallback, sp) {
        const items = String(text).split(' ').filter(t => t !== '').map(t => {
            const e = DICT.get(t);
            if (e && isOk(e.f)) {
                ctx.font = `400 ${fs * QK}px '${fam(e.f)}'`;
                const ws = Array.from(e.g).map(c => ctx.measureText(c).width);
                return { t, e, ws, w: ws.reduce((a, b) => a + b, 0) };
            }
            ctx.font = fallback(fs);
            return { t, e: null, w: ctx.measureText(t).width };
        });
        const gap = fs * (sp == null ? .26 : sp);
        return { items, gap, width: items.reduce((a, b) => a + b.w, 0) + gap * Math.max(0, items.length - 1) };
    }

    /* lebar teks di kanvas; fallback(fs) mengembalikan string font untuk kata non-QCF */
    function measure(ctx, text, fs, fallback) {
        ctx.save();
        const w = layout(ctx, text, fs, fallback).width;
        ctx.restore();
        return w;
    }

    /* menggambar teks di tengah x, sejajar y (textBaseline mengikuti ctx), urutan kata kanan ke kiri */
    function draw(ctx, text, x, y, fs, fallback) {
        ctx.save();
        const L = layout(ctx, text, fs, fallback);
        ctx.textAlign = 'right';
        ctx.direction = 'rtl';
        let cx = x + L.width / 2;
        L.items.forEach(it => {
            if (it.e) {
                ctx.font = `400 ${fs * QK}px '${fam(it.e.f)}'`;
                ctx.direction = 'ltr';
                let px = cx;
                Array.from(it.e.g).forEach((c, k) => {
                    ctx.fillText(c, px, y);
                    px -= it.ws[k];
                });
                ctx.direction = 'rtl';
            }
            else {
                ctx.font = fallback(fs);
                ctx.fillText(it.t, cx, y);
            }
            cx -= it.w + L.gap;
        });
        ctx.restore();
    }

    /* ---------- 5. Mulai ---------- */
    if (typeof document !== 'undefined') {
        startObserver();
        fillVerses(document.body);
        if (typeof VERSES !== 'undefined')
            index(VERSES);
    }

    return { index, owns, scan, ensure, preload, warm, setEnabled, enabled, fillSamples, canvasReady, measure, draw, stats, DICT, fam, fontUrl };
})();
