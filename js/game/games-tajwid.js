/* =====================================================================
   Game 14-16 + materi: hukum nun sukun & tanwin
   Data hukum tajwid, contoh bacaan, tiga game, dan halaman materi.
   ===================================================================== */
'use strict';

/* =====================================================================
   TAJWID: HUKUM NUN SUKUN & TANWIN
   Game 14 Tebak Hukum Tajwid, 15 Cari Hukum Tajwid, 16 Pasangkan Hukum
   + halaman materi di menu Belajar
   Tanda ‹ › pada contoh = bagian yang diberi warna (nun sukun/tanwin + huruf sesudahnya)
   ===================================================================== */
const TAJ_ORDER = ['izhar', 'iqlab', 'ikhfa', 'bighunnah', 'bilaghunnah']; // urutan dari yang paling mudah dibedakan
const TAJ_RULES = [
    { k: 'izhar', n: 'Izhar Halqi', ar: 'إِظْهَارٌ حَلْقِيٌّ', arti: 'Jelas', col: '#2E9E78',
        huruf: 'ء ه ع ح غ خ', hnote: '6 huruf halqi (huruf tenggorokan)', ciri: 'Dibaca jelas, tanpa dengung',
        cara: 'Dibaca jelas dan terang, tanpa dengung.', sebab: 'Nun sukun atau tanwin bertemu salah satu huruf halqi (huruf yang keluar dari tenggorokan).' },
    { k: 'bighunnah', n: 'Idgham Bighunnah', ar: 'إِدْغَامٌ بِغُنَّةٍ', arti: 'Melebur dengan dengung', col: '#4B5FB8',
        huruf: 'ي ن م و', hnote: '4 huruf, kuncinya dibaca “yanmu” (يَنْمُو)', ciri: 'Dilebur dan didengungkan',
        cara: 'Nun sukun atau tanwin dilebur ke huruf sesudahnya dan dibaca dengan dengung.', sebab: 'Bertemu huruf ي ن م atau و, dan keduanya berada pada dua kata yang berbeda.' },
    { k: 'bilaghunnah', n: 'Idgham Bilaghunnah', ar: 'إِدْغَامٌ بِلَا غُنَّةٍ', arti: 'Melebur tanpa dengung', col: '#B84A26',
        huruf: 'ل ر', hnote: '2 huruf', ciri: 'Dilebur tanpa dengung',
        cara: 'Nun sukun atau tanwin dilebur ke huruf sesudahnya tanpa dengung.', sebab: 'Bertemu huruf ل atau ر.' },
    { k: 'iqlab', n: 'Iqlab', ar: 'إِقْلَابٌ', arti: 'Menukar', col: '#A8749E',
        huruf: 'ب', hnote: '1 huruf', ciri: 'Ditukar menjadi mim lalu didengungkan',
        cara: 'Bunyi nun atau tanwin ditukar menjadi mim, bibir dirapatkan, lalu dibaca dengan dengung.', sebab: 'Bertemu huruf ب.' },
    { k: 'ikhfa', n: 'Ikhfa Haqiqi', ar: 'إِخْفَاءٌ حَقِيقِيٌّ', arti: 'Samar', col: '#B8860B',
        huruf: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك', hnote: '15 huruf, yaitu semua huruf sisanya', ciri: 'Dibaca samar dengan dengung',
        cara: 'Dibaca samar, di antara izhar dan idgham, dengan dengung.', sebab: 'Bertemu salah satu dari 15 huruf ikhfa.' }
];
const TAJ_BY = Object.fromEntries(TAJ_RULES.map(r => [r.k, r]));
const TAJ_CONF = { izhar: ['ikhfa'], iqlab: ['ikhfa'], ikhfa: ['iqlab', 'izhar'], bighunnah: ['bilaghunnah'], bilaghunnah: ['bighunnah'] }; // hukum yang sering tertukar
const TAJ_EX = [
    /* izhar halqi */
    ['izhar', 'مَ‹نْ› ‹آ›مَنَ', 'QS Al-Baqarah: 62', 'ء'],
    ['izhar', 'مِ‹نْ› ‹عِ›لْمٍ', 'QS Al-Kahf: 5', 'ع'],
    ['izhar', 'مِ‹نْ› ‹هَ›ادٍ', 'QS Ar-Ra‘d: 33', 'ه'],
    ['izhar', 'حَكِي‹مٌ› ‹عَ›لِيمٌ', 'QS Al-An‘am: 83', 'ع'],
    ['izhar', 'مِ‹نْ› ‹خَ›يْرٍ', 'QS Al-Baqarah: 272', 'خ'],
    ['izhar', 'أَ‹نْ›‹عَ›مْتَ عَلَيْهِمْ', 'QS Al-Fatihah: 7', 'ع'],
    ['izhar', 'مِ‹نْ› ‹غِ›لٍّ', 'QS Al-A‘raf: 43', 'غ'],
    ['izhar', 'عَذَا‹بٌ› ‹أَ›لِيمٌ', 'QS Al-Baqarah: 10', 'ء'],
    ['izhar', 'جُرُ‹فٍ› ‹هَ›ارٍ', 'QS At-Taubah: 109', 'ه'],
    ['izhar', 'سَلَا‹مٌ› ‹هِ›يَ', 'QS Al-Qadr: 5', 'ه'],
    ['izhar', 'مِ‹نْ› ‹حَ›يْثُ', 'QS Al-Baqarah: 149', 'ح'],
    ['izhar', 'يَ‹نْ›‹هَ›وْنَ', 'QS Al-A‘raf: 165', 'ه'],
    /* idgham bighunnah */
    ['bighunnah', 'مَ‹نْ› ‹يَ›قُولُ', 'QS Al-Baqarah: 8', 'ي'],
    ['bighunnah', 'مِ‹نْ› ‹نَ›ارٍ', 'QS Ar-Rahman: 15', 'ن'],
    ['bighunnah', 'مِ‹نْ› ‹مَ›اءٍ', 'QS Ath-Thariq: 6', 'م'],
    ['bighunnah', 'مِ‹نْ› ‹وَ›لِيٍّ', 'QS Al-Baqarah: 107', 'و'],
    ['bighunnah', 'يَوْمَئِ‹ذٍ› ‹يَ›صْدُرُ', 'QS Az-Zalzalah: 6', 'ي'],
    ['bighunnah', 'خَيْ‹رًا› ‹يَ›رَهُ', 'QS Az-Zalzalah: 7', 'ي'],
    ['bighunnah', 'يَوْمَئِ‹ذٍ› ‹نَ›اعِمَةٌ', 'QS Al-Ghasyiyah: 8', 'ن'],
    ['bighunnah', 'كِتَا‹بٌ› ‹مَ›رْقُومٌ', 'QS Al-Muthaffifin: 9', 'م'],
    ['bighunnah', 'عَذَا‹بٌ› ‹وَ›اصِبٌ', 'QS Ash-Shaffat: 9', 'و'],
    ['bighunnah', 'وَمَ‹نْ› ‹يَ›عْمَلْ', 'QS Az-Zalzalah: 7', 'ي'],
    /* idgham bilaghunnah */
    ['bilaghunnah', 'مِ‹نْ› ‹رَ›بِّهِمْ', 'QS Al-Baqarah: 5', 'ر'],
    ['bilaghunnah', 'غَفُو‹رٌ› ‹رَ›حِيمٌ', 'QS Al-Baqarah: 173', 'ر'],
    ['bilaghunnah', 'هُ‹دًى› ‹لِ›لْمُتَّقِينَ', 'QS Al-Baqarah: 2', 'ل'],
    ['bilaghunnah', 'مِ‹نْ› ‹لَ›دُنْهُ', 'QS Al-Kahf: 2', 'ل'],
    ['bilaghunnah', 'وَمَ‹نْ› ‹لَ›مْ يَحْكُمْ', 'QS Al-Ma’idah: 44', 'ل'],
    ['bilaghunnah', 'رَءُو‹فٌ› ‹رَ›حِيمٌ', 'QS Al-Baqarah: 143', 'ر'],
    ['bilaghunnah', 'مَ‹نْ› ‹رَ›بُّ السَّمَاوَاتِ', 'QS Ar-Ra‘d: 16', 'ر'],
    ['bilaghunnah', 'يَوْمَئِ‹ذٍ› ‹لَ›ا تَنْفَعُ', 'QS Thaha: 109', 'ل'],
    /* iqlab */
    ['iqlab', 'مِ‹نْ› ‹بَ›عْدِ', 'QS Al-Baqarah: 27', 'ب'],
    ['iqlab', 'أَ‹نْ›‹بِ›ئْهُمْ', 'QS Al-Baqarah: 33', 'ب'],
    ['iqlab', 'سَمِي‹عًا› ‹بَ›صِيرًا', 'QS An-Nisa: 58', 'ب'],
    ['iqlab', 'عَلِي‹مٌ› ‹بِ›ذَاتِ الصُّدُورِ', 'QS Ali Imran: 119', 'ب'],
    ['iqlab', 'مِ‹نْ› ‹بَ›يْنِ', 'QS An-Nahl: 66', 'ب'],
    ['iqlab', 'لَيُ‹نْ›‹بَ›ذَنَّ', 'QS Al-Humazah: 4', 'ب'],
    ['iqlab', 'صُ‹مٌّ› ‹بُ›كْمٌ', 'QS Al-Baqarah: 18', 'ب'],
    ['iqlab', 'بَصِي‹رٌ› ‹بِ›الْعِبَادِ', 'QS Ali Imran: 15', 'ب'],
    ['iqlab', 'وَأَمَّا مَ‹نْ› ‹بَ›خِلَ', 'QS Al-Lail: 8', 'ب'],
    /* ikhfa haqiqi */
    ['ikhfa', 'مِ‹نْ› ‹قَ›بْلِ', 'QS Al-Baqarah: 4', 'ق'],
    ['ikhfa', 'مِ‹نْ› ‹تَ›حْتِهَا', 'QS Al-Baqarah: 25', 'ت'],
    ['ikhfa', 'كُ‹نْ›‹تُ›مْ', 'QS Al-Baqarah: 23', 'ت'],
    ['ikhfa', 'مَ‹نْ› ‹جَ›اءَ', 'QS Al-An‘am: 160', 'ج'],
    ['ikhfa', 'مِ‹نْ› ‹ذَ›كَرٍ', 'QS Al-Hujurat: 13', 'ذ'],
    ['ikhfa', 'مِ‹نْ› ‹شَ›رِّ', 'QS Al-Falaq: 2', 'ش'],
    ['ikhfa', 'يَ‹نْ›‹صُ›رُكُمْ', 'QS Ali Imran: 160', 'ص'],
    ['ikhfa', 'مَ‹نْ› ‹زَ›كَّاهَا', 'QS Asy-Syams: 9', 'ز'],
    ['ikhfa', 'جَنَّا‹تٍ› ‹تَ›جْرِي', 'QS Al-Baqarah: 25', 'ت'],
    ['ikhfa', 'كِرَا‹مًا› ‹كَ›اتِبِينَ', 'QS Al-Infithar: 11', 'ك'],
    ['ikhfa', 'يَوْ‹مًا› ‹ثَ›قِيلًا', 'QS Al-Insan: 27', 'ث'],
    ['ikhfa', 'عَذَا‹بٌ› ‹شَ›دِيدٌ', 'QS Ali Imran: 4', 'ش'],
    ['ikhfa', 'ظِ‹لًّا› ‹ظَ›لِيلًا', 'QS An-Nisa: 57', 'ظ'],
    ['ikhfa', 'وَمَ‹نْ› ‹دَ›خَلَهُ', 'QS Ali Imran: 97', 'د'],
    ['ikhfa', 'مَا‹ءً› ‹ثَ›جَّاجًا', 'QS An-Naba’: 14', 'ث']
].map((e, i) => ({ id: 'e' + i, r: e[0], t: e[1], ref: e[2], l: e[3] }));
const tajHL = t => t.replace(/‹/g, '<span class="tj">').replace(/›/g, '</span>');
const tajPlain = t => t.replace(/[‹›]/g, '');
const tajItem = (r, ex) => ({ taj: true, key: 't:' + r.k + (ex ? ':' + ex.id : ''), r, ex: ex || null });
const tajLabel = r => `<span>${esc(r.n)}</span><small class="ar" lang="ar" dir="rtl" style="opacity:.72;font-weight:700">${r.ar}</small>`;

function tajRow(v) {
    const r = v.r, e = v.ex;
    return `<div class="vrow tajrow"><div class="meta"><span><b>${esc(r.n)}</b> · ${esc(r.arti)}</span></div>
    <div class="ar ar-md" lang="ar" dir="rtl" style="text-align:center">${e ? tajHL(e.t) : r.huruf}</div>
    <div class="tr">${esc(r.cara)}${e && e.ref ? ` (${esc(e.ref)})` : ''}</div></div>`;
}

function pickTajRule(rules) {
    const c = rules.filter(r => r.k !== run.lastRule), r = pick(c.length ? c : rules);
    run.lastRule = r.k;
    return r;
}

function pickTajEx(r) {
    const all = TAJ_EX.filter(e => e.r === r.k), seen = new Set(S.seen[run.g] || []);
    let c = all.filter(e => !run.used.has(e.id) && !seen.has(e.id));
    if (!c.length)
        c = all.filter(e => !run.used.has(e.id));
    if (!c.length)
        c = all;
    const e = pick(c);
    run.used.add(e.id);
    const a = S.seen[run.g] = (S.seen[run.g] || []).filter(k => k !== e.id);
    a.push(e.id);
    if (a.length > 40)
        a.shift();
    return e;
}

const tajPool = n => TAJ_ORDER.slice(0, n).map(k => TAJ_BY[k]);

/* 14. Tebak Hukum Tajwid: contoh bacaan, pilih nama hukumnya */
function r14(el, cfg, l) {
    const P = LV[14], i = l - 1, rules = tajPool(P.rules[i]);
    const r = pickTajRule(rules), ex = pickTajEx(r), n = Math.min(cfg.opts, rules.length);
    const conf = (TAJ_CONF[r.k] || []).map(k => TAJ_BY[k]).filter(x => rules.includes(x));
    const opts = shuffle([r, ...distract(r.k, n - 1, [conf, rules], x => x.k)]);
    run.q = { v: tajItem(r, ex), wrong: `Jawaban yang benar: <b>${esc(r.n)}</b>. ${esc(r.cara)}` };
    const hl = P.hl[i], hint = P.hint[i];
    el.innerHTML = `<div class="q-text">${hl ? 'Apa hukum bacaan pada huruf yang berwarna?' : 'Apa hukum bacaan nun sukun atau tanwin pada contoh ini?'}</div>
    <div class="mushaf"><div class="ar taj-big" lang="ar" dir="rtl">${hl ? tajHL(ex.t) : tajPlain(ex.t)}</div>${hint ? `<span class="tag">Huruf sesudahnya: <span class="ar" lang="ar" dir="rtl">${ex.l}</span></span>` : ''}</div>
    <div class="opts c3">${OPTS(opts.map(o => ({ ok: o.k === r.k, html: tajLabel(o) })))}</div>`;
    if (cfg.timer)
        startTimer(cfg.timer);
}

/* 15. Cari Hukum Tajwid: nama hukum diberikan, cari contoh yang tepat */
function r15(el, cfg, l) {
    const P = LV[15], i = l - 1, rules = tajPool(P.rules[i]);
    const r = pickTajRule(rules), ex = pickTajEx(r), n = Math.min(cfg.opts, rules.length);
    const conf = (TAJ_CONF[r.k] || []).map(k => TAJ_BY[k]).filter(x => rules.includes(x));
    const dist = distract(r.k, n - 1, [conf, rules], x => x.k).map(o => ({ r: o, ex: pick(TAJ_EX.filter(e => e.r === o.k)) }));
    const opts = shuffle([{ r, ex }, ...dist]);
    run.q = { v: tajItem(r, ex), wrong: `Contoh <b>${esc(r.n)}</b> yang benar ada pada tulisan berikut:` };
    const hl = P.hl[i], hint = P.hint[i];
    el.innerHTML = `<div class="q-text">Cari contoh bacaan yang hukumnya:</div>
    <div class="mushaf"><div class="hij-name">${esc(r.n)}</div><div class="ar taj-sub" lang="ar" dir="rtl">${r.ar}</div>${hint ? `<span class="tag">${hint >= 2 ? esc(r.ciri) + ' · ' : ''}huruf: ${r.k === 'ikhfa' ? esc(r.hnote) : `<span class="ar" lang="ar" dir="rtl">${r.huruf}</span>`}</span>` : ''}</div>
    <div class="opts c3">${OPTS(opts.map(o => ({ ok: o.r.k === r.k, html: `<span class="ar taj-opt" lang="ar" dir="rtl">${hl ? tajHL(o.ex.t) : tajPlain(o.ex.t)}</span>` })))}</div>`;
    if (cfg.timer)
        startTimer(cfg.timer);
}

/* 16. Pasangkan Hukum: cocokkan contoh / huruf / ciri dengan nama hukumnya */
function r16(el, cfg, l) {
    const P = LV[16], i = l - 1, n = P.pairs[i], mode = P.mode[i];
    const rules = shuffle(TAJ_ORDER.slice(0, Math.min(5, n + 1))).slice(0, n).map(k => TAJ_BY[k]);
    const kinds = mode === 0 ? ['ex'] : mode === 1 ? ['huruf', 'ciri'] : ['ex', 'huruf', 'ciri'];
    const left = rules.map(r => {
        const kd = pick(kinds);
        let ex = null, html;
        if (kd === 'ex') {
            ex = pickTajEx(r);
            html = `<span class="ar taj-opt" lang="ar" dir="rtl">${tajHL(ex.t)}</span>`;
        }
        else if (kd === 'huruf')
            html = `<span class="ar taj-let" lang="ar" dir="rtl">${r.huruf}</span>`;
        else
            html = esc(r.ciri);
        return { k: r.k, r, ex, html };
    });
    const q = run.q = { v: rules.map(r => tajItem(r, left.find(x => x.k === r.k).ex)), left: shuffle(left), right: shuffle(rules.map(r => ({ k: r.k, r }))),
        selL: null, doneL: new Set(), doneR: new Set(), err: 0, allow: P.err[i], flashL: -1, flashR: -1, done: false };
    const hintTxt = mode === 0 ? 'Ketuk satu contoh di kiri, lalu ketuk nama hukumnya di kanan.' : mode === 1 ? 'Ketuk satu huruf atau ciri bacaan di kiri, lalu nama hukumnya di kanan.' : 'Ketuk satu kartu di kiri, lalu ketuk nama hukum yang cocok di kanan.';
    q.draw = () => {
        el.innerHTML = `<div class="q-text">Pasangkan hukum bacaan dengan namanya 🤝</div><div class="hint phint">${hintTxt}</div>
      <div class="pairs gb"><div class="pcol">${q.left.map((x, j) => `<button class="pbtn ${q.doneL.has(j) ? 'done' : ''} ${q.selL === j ? 'sel' : ''} ${q.flashL === j ? 'shake' : ''}" data-act="o16l" data-i="${j}" ${q.doneL.has(j) ? 'disabled' : ''}>${x.html}</button>`).join('')}</div>
      <div class="pcol">${q.right.map((x, j) => `<button class="pbtn name ${q.doneR.has(j) ? 'done' : ''} ${q.flashR === j ? 'shake' : ''}" data-act="o16r" data-i="${j}" ${q.doneR.has(j) ? 'disabled' : ''}><span>${esc(x.r.n)}</span></button>`).join('')}</div></div>
      <div class="hint phint">Salah: <b>${q.err}</b> · batas ${q.allow}</div>`;
    };
    q.draw();
    if (cfg.timer)
        startTimer(cfg.timer);
}

function o16pick(side, j) {
    const q = run && run.q;
    if (!q || !q.left || run.locked || q.done)
        return;
    if (side === 'l') {
        if (q.doneL.has(j))
            return;
        q.selL = q.selL === j ? null : j;
        sfx('tap');
        q.draw();
        return;
    }
    if (q.doneR.has(j) || q.selL == null) {
        if (q.selL == null)
            toast('👈 Pilih dulu satu kartu di sebelah kiri.');
        return;
    }
    const L = q.left[q.selL], R = q.right[j];
    if (L.k === R.k) {
        q.doneL.add(q.selL);
        q.doneR.add(j);
        q.selL = null;
        sfx('correct');
        q.flashL = q.flashR = -1;
        q.draw();
        if (q.doneL.size === q.left.length) {
            q.done = true;
            later(() => ans(q.err <= q.allow, q.v, q.err === 0 ? 'Sempurna, tanpa salah! 🎯' : `Selesai dengan ${q.err} kesalahan (batas ${q.allow}).`), 600);
        }
    }
    else {
        q.err++;
        q.flashL = q.selL;
        q.flashR = j;
        q.selL = null;
        sfx('wrong');
        q.draw();
        later(() => {
            if (run && run.q === q && !q.done) {
                q.flashL = q.flashR = -1;
                q.draw();
            }
        }, 450);
    }
}

Object.assign(ACTIONS, {
    o16l: t => o16pick('l', +t.dataset.i),
    o16r: t => o16pick('r', +t.dataset.i),
    'open-taj': () => {
        learnState.surah = null;
        learnState.hij = false;
        learnState.taj = true;
        renderLearn();
        window.scrollTo({ top: 0 });
    },
    'study-taj': () => {
        learnState.surah = null;
        learnState.hij = false;
        learnState.taj = true;
        nav('learn');
    }
});

/* ---------- halaman materi tajwid (menu Belajar) ---------- */
const TAJ_SHOW = ['izhar', 'bighunnah', 'bilaghunnah', 'iqlab', 'ikhfa'];

function tajCard(k, n) {
    const r = TAJ_BY[k], exs = TAJ_EX.filter(e => e.r === k).slice(0, 3);
    return `<article class="tajcard" style="--tc:${r.col}">
    <header><span class="tajno">${n}</span><div class="tajname"><h3>${esc(r.n)}</h3><div class="ar" lang="ar" dir="rtl">${r.ar}</div></div><span class="tag">${esc(r.arti)}</span></header>
    <div class="tajhuruf"><small>Huruf</small><div class="ar" lang="ar" dir="rtl">${r.huruf}</div><small>${esc(r.hnote)}</small></div>
    <p><b>Cara baca:</b> ${esc(r.cara)}</p>
    <p><b>Sebab:</b> ${esc(r.sebab)}</p>
    <div class="tajex"><small>Contoh (bagian berwarna):</small>${exs.map(e => `<div class="ex"><div class="ar taj-opt" lang="ar" dir="rtl">${tajHL(e.t)}</div><small>${esc(e.ref)}</small></div>`).join('')}</div>
  </article>`;
}

function renderTaj() {
    $('#v-learn').innerHTML = `<div class="tajpage"><button class="btn btn-ghost btn-sm" data-act="learn-back">⬅ Kembali</button>
  <h2 class="sec-title" style="margin-top:12px">🔔 Tajwid: Hukum Nun Sukun & Tanwin</h2>
  <p class="muted" style="font-weight:700;margin-top:-4px">Ada lima hukum bacaan ketika <b>nun sukun</b> atau <b>tanwin</b> bertemu huruf hijaiyyah. Kenali huruf sesudahnya, maka hukumnya langsung ketahuan.</p>
  <div class="card tajintro">
    <div><b>Nun sukun (نْ)</b><span>huruf nun yang mati, tanpa harakat. Bisa di tengah atau di akhir kata, contoh: <span class="ar" lang="ar" dir="rtl">مِنْ</span>, <span class="ar" lang="ar" dir="rtl">أَنْعَمْتَ</span>.</span></div>
    <div><b>Tanwin (ـً ـٍ ـٌ)</b><span>bunyi “n” di akhir kata benda: fathatain, kasratain, dhammatain. Contoh: <span class="ar" lang="ar" dir="rtl">عَلِيمٌ</span>, <span class="ar" lang="ar" dir="rtl">سَمِيعًا</span>.</span></div>
  </div>
  <div class="taj-table" role="table" aria-label="Ringkasan lima hukum">
    ${TAJ_SHOW.map(k => {
        const r = TAJ_BY[k];
        return `<div class="trow" style="--tc:${r.col}"><b>${esc(r.n)}</b><span class="ar" lang="ar" dir="rtl">${r.huruf}</span><small>${esc(r.ciri)}</small></div>`;
    }).join('')}
  </div>
  <div class="tajgrid">${TAJ_SHOW.map((k, i) => tajCard(k, i + 1)).join('')}</div>
  <div class="card tajnote"><b>💡 Catatan penting</b>
    <p>Idgham bighunnah hanya berlaku jika nun sukun dan huruf idgham berada pada <b>dua kata berbeda</b>. Jika berada dalam satu kata, dibaca izhar (disebut izhar mutlak), contoh: <span class="ar" lang="ar" dir="rtl">الدُّنْيَا</span>, <span class="ar" lang="ar" dir="rtl">صِنْوَانٌ</span>, <span class="ar" lang="ar" dir="rtl">قِنْوَانٌ</span>, <span class="ar" lang="ar" dir="rtl">بُنْيَانٌ</span>.</p>
    <p>Cara cepat mengingat: kenali dulu <b>6 huruf halqi</b> (izhar), <b>ي ن م و</b> (idgham bighunnah), <b>ل ر</b> (idgham bilaghunnah), dan <b>ب</b> (iqlab). Selain itu, hukumnya ikhfa.</p>
  </div>
  <div class="row" style="gap:10px;margin-top:14px;flex-wrap:wrap">
    <button class="btn btn-sun" data-act="game" data-g="14">🔔 Main Tebak Hukum</button>
    <button class="btn btn-mint" data-act="game" data-g="15">🔎 Main Cari Hukum</button>
    <button class="btn btn-ghost" data-act="game" data-g="16">🤝 Main Pasangkan</button>
  </div></div>`;
}

/* ---------- aksi game ---------- */
Object.assign(ACTIONS, {
    start: t => startRun(+t.dataset.g, +t.dataset.l),
    lvsel: t => openLevelSheet(+t.dataset.g, +t.dataset.l),
    'study-surah': t => {
        learnState.hij = false;
        learnState.taj = false;
        learnState.surah = +t.dataset.s;
        nav('learn');
    },
    quit: async () => {
        if (!run || run.locked || await askConfirm({ title: 'Yakin mau keluar?', text: 'Kalau keluar sekarang, skor ronde ini tidak disimpan. Yuk selesaikan dulu, kamu pasti bisa! 🌙', info: `Soal ${run.idx + 1} dari ${run.total} · ${run.correct} benar`, safe: 'Lanjut main ▶', risk: 'Keluar' }))
            nav('home');
    },
    next: () => {
        run.idx++;
        nextQ();
    },
    gplay: async (t) => {
        const v = vById(t.dataset.key);
        const r = await playOnce(v);
        if (r === false)
            audioFail();
    },
    opt: t => {
        if (run.locked)
            return;
        const ok = t.dataset.ok === '1';
        markOptions(t);
        ans(ok, run.q.v, ok ? '' : (run.q.wrong || ''));
    },
    /* 3 */
    o3pick: t => {
        const q = run.q;
        if (run.locked || q.done)
            return;
        const i = +t.dataset.idx, at = q.sel.indexOf(i);
        if (at >= 0)
            q.sel.splice(at, 1);
        else
            q.sel.push(i);
        sfx('tap');
        q.draw();
    },
    o3un: t => {
        const q = run.q;
        if (run.locked || q.done)
            return;
        q.sel.splice(+t.dataset.pos, 1);
        q.draw();
    },
    o3chk: () => {
        const q = run.q;
        if (run.locked || q.sel.length < q.items.length)
            return;
        q.done = q.sel.map((idx, pos) => q.items[idx].ar === q.v[pos].ar);
        q.draw();
        const ok = q.done.every(Boolean);
        ans(ok, q.v, ok ? '' : 'Urutan yang benar ada di bawah ini. Dengarkan dan ulangi ya!');
    },
    /* 4 + 10 */
    mic: () => startMic(),
    peek: () => {
        const m = $('#mus .mushaf');
        if (m)
            m.classList.remove('blur');
    },
    selfok: () => ans(true, run.q.v, 'Hebat! Terus ulangi supaya makin kuat hafalannya.'),
    selfno: () => ans(false, run.q.v, 'Tidak apa-apa. Dengarkan lagi bersama qari, lalu ulangi sampai lancar.'),
    g10go: () => {
        run.q.stage = 0;
        run.q.peek = new Set();
        run.q.draw();
    },
    g10peek: t => {
        run.q.peek.add(+t.dataset.j);
        sfx('tap');
        run.q.draw();
    },
    g10next: () => {
        run.q.stage++;
        run.q.peek = new Set();
        sfx('star');
        run.q.draw();
    },
    g10check: () => {
        run.q.all = true;
        run.q.draw();
    },
    /* 5 */
    o5pick: t => {
        const q = run.q;
        if (run.locked || q.done)
            return;
        const i = +t.dataset.i, k = q.fills.indexOf(null);
        if (k < 0 || q.fills.includes(i))
            return;
        q.fills[k] = i;
        sfx('tap');
        if (q.fills.every(x => x !== null)) {
            q.done = true;
            q.draw();
            const ok = q.fills.every((ci, kk) => q.chips[ci] === q.answers[kk]);
            ans(ok, q.v, ok ? '' : `Kata yang hilang: ${q.answers.map(a => arSpan(a)).join(' ، ')}`);
        }
        else
            q.draw();
    },
    o5un: t => {
        const q = run.q;
        if (run.locked || q.done)
            return;
        q.fills[+t.dataset.k] = null;
        q.draw();
    },
    /* 6 */
    flip: t => flipCard(+t.dataset.i),
    /* 7 */
    o7pick: t => {
        const q = run.q;
        if (run.locked || q.done)
            return;
        const i = +t.dataset.idx;
        if (q.sel.includes(i))
            return;
        q.sel.push(i);
        sfx('tap');
        q.draw();
    },
    o7un: t => {
        const q = run.q;
        if (run.locked || q.done)
            return;
        q.sel.splice(+t.dataset.pos, 1);
        q.draw();
    },
    o7chk: () => {
        const q = run.q;
        if (run.locked || q.sel.length < q.items.length)
            return;
        const w = q.v.words;
        q.done = q.sel.map((idx, pos) => q.items[idx].t === w[pos]);
        q.draw();
        const ok = q.done.every(Boolean);
        ans(ok, q.v, ok ? '' : 'Susunan yang benar ada di bawah ini. Coba baca bersama qari ya!');
    }
});
