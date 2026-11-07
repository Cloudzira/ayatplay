/* =====================================================================
   Gaya Mushaf Standar Indonesia
   Mengubah teks Arab (Utsmani) ke gaya Mushaf Standar Indonesia. Dipindahkan dari TalqinKu.
   ===================================================================== */
'use strict';

/* =====================================================================
   GAYA MUSHAF STANDAR INDONESIA (dipindahkan dari TalqinKu)
   ===================================================================== */
const MushafID = (function () {
    const C = {
        FATHA: 0x064E, DAMMA: 0x064F, KASRA: 0x0650, SHADDA: 0x0651, SUKUN: 0x0652,
        SUB_ALEF: 0x0656, INV_DAMMA: 0x0657, DAGGER: 0x0670,
        TATWEEL: 0x0640, ALEF: 0x0627, ALEF_WASLA: 0x0671, ALEF_HAMZA_ABOVE: 0x0623, ALEF_HAMZA_BELOW: 0x0625,
        HAMZA: 0x0621, LAM: 0x0644, HEH: 0x0647, WAW: 0x0648, YEH: 0x064A, SAD: 0x0635, RA: 0x0631, TAH: 0x0637,
        SMALL_WAW: 0x06E5, SMALL_YEH: 0x06E6, ROUND_ZERO: 0x06DF, SUKUN_ALT: 0x06E1, YEH_HAMZA: 0x0626
    };
    const ch = (cp) => String.fromCodePoint(cp);
    // tanda yang menempel pada huruf sebelumnya (harakat, shadda, tanda waqaf kecil, dll.)
    function isMark(cp) {
        return (cp >= 0x0610 && cp <= 0x061A) || (cp >= 0x064B && cp <= 0x065F) || cp === 0x0670 ||
            (cp >= 0x06D6 && cp <= 0x06DC) || (cp >= 0x06DF && cp <= 0x06E4) ||
            (cp >= 0x06E7 && cp <= 0x06E8) || (cp >= 0x06EA && cp <= 0x06ED) || (cp >= 0x08D3 && cp <= 0x08FF);
    }
    // pecah teks menjadi "kluster": 1 huruf dasar + tanda-tandanya. Spasi = batas kata.
    function toClusters(text) {
        const out = [];
        for (const c of Array.from(text)) {
            const cp = c.codePointAt(0);
            if (isMark(cp) && out.length && out[out.length - 1].b !== ' ')
                out[out.length - 1].m.push(cp);
            else
                out.push({ b: c, m: [] });
        }
        return out;
    }
    const fromClusters = (cl) => cl.map(k => k.b + k.m.map(ch).join('')).join('');
    const has = (k, cp) => k && k.m.includes(cp);
    const drop = (k, cp) => {
        k.m = k.m.filter(x => x !== cp);
    };
    const baseIs = (k, cp) => k && k.b.codePointAt(0) === cp;
    function convert(text, opts) {
        if (!text)
            return text;
        opts = opts || {};
        // pakai bentuk sukun yang sama dengan teks sumber (agar tampilan seragam)
        const SUK = text.indexOf(ch(C.SUKUN_ALT)) !== -1 && text.indexOf(ch(C.SUKUN)) === -1 ? C.SUKUN_ALT : C.SUKUN;
        let cl = toClusters(text);
        // ---- 0. Kata "Shirath": di mushaf Indonesia ditulis dengan alif penuh (الصِّرَاطَ), bukan alif kecil
        for (let i = 0; i < cl.length - 2; i++) {
            if (baseIs(cl[i], C.SAD) && has(cl[i], C.KASRA) && baseIs(cl[i + 1], C.RA) && has(cl[i + 1], C.DAGGER) && baseIs(cl[i + 2], C.TAH)) {
                drop(cl[i + 1], C.DAGGER);
                cl.splice(i + 2, 0, { b: ch(C.ALEF), m: [] });
            }
        }
        // ---- 1. Tatwil + fathah berdiri: gabungkan ke huruf sebelumnya, buang fathah miring
        for (let i = 1; i < cl.length; i++) {
            const k = cl[i];
            if (baseIs(k, C.TATWEEL) && has(k, C.DAGGER) && cl[i - 1].b !== ' ') {
                const prev = cl[i - 1];
                drop(prev, C.FATHA);
                k.m.forEach(x => {
                    if (x !== C.FATHA && x !== C.KASRA && x !== C.DAMMA && !prev.m.includes(x))
                        prev.m.push(x);
                });
                cl.splice(i, 1);
                i--;
            }
        }
        // alif maqshurah + fathah berdiri (عَلَىٰ -> عَلٰى): fathah berdiri pindah ke huruf sebelumnya, fathah miring dibuang
        for (let i = 1; i < cl.length; i++) {
            const k = cl[i], prev = cl[i - 1];
            if (baseIs(k, 0x0649) && has(k, C.DAGGER) && prev.b !== ' ' && has(prev, C.FATHA)) {
                drop(k, C.DAGGER);
                drop(prev, C.FATHA);
                prev.m.push(C.DAGGER);
            }
        }
        // fathah miring + fathah berdiri pada huruf yang sama -> cukup fathah berdiri
        cl.forEach(k => {
            if (has(k, C.DAGGER))
                drop(k, C.FATHA);
        });
        // ---- 2. Waw/ya kecil penanda mad pada "ه" (لَهُۥ / بِهِۦ) -> dammah berdiri / kasrah berdiri (لَهٗ / بِهٖ)
        for (let i = 1; i < cl.length; i++) {
            const k = cl[i], prev = cl[i - 1];
            if (k.m.length === 0 && baseIs(k, C.SMALL_WAW) && has(prev, C.DAMMA)) {
                drop(prev, C.DAMMA);
                prev.m.push(C.INV_DAMMA);
                cl.splice(i, 1);
                i--;
            }
            else if (k.m.length === 0 && baseIs(k, C.SMALL_YEH) && has(prev, C.KASRA)) {
                drop(prev, C.KASRA);
                prev.m.push(C.SUB_ALEF);
                cl.splice(i, 1);
                i--;
            }
        }
        // ---- 3. Lafaz Allah: ٱللَّهِ -> اللّٰهِ  dan  لِلَّهِ -> لِلّٰهِ
        for (let i = 1; i < cl.length - 1; i++) {
            const k = cl[i];
            if (baseIs(k, C.LAM) && has(k, C.SHADDA) && has(k, C.FATHA) && !has(k, C.DAGGER)) {
                let j = i + 1;
                if (baseIs(cl[j], C.TATWEEL) && cl[j].m.length === 0)
                    j++; // ٱللَّـهِ (ada tatwil)
                const heh = cl[j];
                const before = cl[i - 1], before2 = cl[i - 2];
                const afterArticle = baseIs(before, C.LAM) && before2 && (baseIs(before2, C.ALEF_WASLA) || baseIs(before2, C.ALEF));
                const afterLi = baseIs(before, C.LAM) && has(before, C.KASRA);
                if (heh && baseIs(heh, C.HEH) && (afterArticle || afterLi)) {
                    drop(k, C.FATHA);
                    k.m.push(C.DAGGER);
                    if (j !== i + 1)
                        cl.splice(i + 1, 1);
                }
            }
        }
        // ---- 4. Alif wasal (ٱ): jadi alif biasa. Di awal AYAT (selain "ال") diberi harakat awal; di tengah ayat polos.
        for (let i = 0; i < cl.length; i++) {
            if (!baseIs(cl[i], C.ALEF_WASLA))
                continue;
            cl[i].b = ch(C.ALEF);
            // Harakat awal (kasrah/dammah) hanya untuk kata PERTAMA ayat (اِهْدِنَا). Di tengah ayat alif wasal polos (... انْفَطَرَتْ)
            const atStart = (i === 0);
            const next = cl[i + 1];
            if (atStart && next && !baseIs(next, C.LAM)) {
                // cari huruf ke-3 pada kata (ٱ + h1 + h2): bila berharakat dammah -> mulai dengan dammah, selain itu kasrah
                let w = [];
                for (let j = i + 1; j < cl.length && cl[j].b !== ' '; j++)
                    w.push(cl[j]);
                const rootStr = w.slice(0, 3).map(k => k.b).join('');
                const nounKasra = /^(\u0628\u0646|\u0633\u0645|\u0627?\u0645\u0631|\u062B\u0646)/.test(rootStr); // ابن، اسم، امرؤ، اثنين
                const hamzaSeat = w[0] && (baseIs(w[0], C.YEH_HAMZA) || baseIs(w[0], C.HAMZA)); // ٱئْتُوا -> kasrah
                // huruf bertasydid (ٱتَّقُوا) dihitung dua huruf: harakat huruf ke-2 ada pada huruf itu sendiri
                const third = (w[0] && has(w[0], C.SHADDA)) ? w[0] : w[1];
                const dammaStart = third && has(third, C.DAMMA) && !nounKasra && !hamzaSeat;
                cl[i].m.push(dammaStart ? C.DAMMA : C.KASRA);
            }
        }
        // ---- 5. Hamzah di atas/bawah alif dihilangkan (أَنْعَمْتَ -> اَنْعَمْتَ, إِيَّاكَ -> اِيَّاكَ)
        // (hamzah yang bersukun, mis. يَأْكُلُ / فَأْتُوا, tetap dipertahankan)
        cl.forEach(k => {
            if ((baseIs(k, C.ALEF_HAMZA_ABOVE) || baseIs(k, C.ALEF_HAMZA_BELOW)) && !has(k, C.SUKUN) && !has(k, C.SUKUN_ALT))
                k.b = ch(C.ALEF);
        });
        // ءَا (hamzah + fathah + alif) -> اٰ  (ءَامَنُوا -> اٰمَنُوا, ٱلْقُرْءَانَ -> الْقُرْاٰنَ)
        for (let i = 0; i < cl.length - 1; i++) {
            if (baseIs(cl[i], C.HAMZA) && cl[i].m.length === 1 && has(cl[i], C.FATHA) && baseIs(cl[i + 1], C.ALEF) && cl[i + 1].m.every(x => x === 0x0653)) {
                const a = cl[i + 1];
                if (!a.m.includes(C.DAGGER))
                    a.m.unshift(C.DAGGER);
                cl.splice(i, 1);
            }
        }
        // Font LPMQ (font resmi mushaf Indonesia) sudah menata lam-alif dengan benar -> pakai maddah standar.
        // Font lain (mis. Scheherazade) -> pakai maddah terpisah U+06E4 agar tidak menumpuk dengan fathah lam.
        const MADD = opts.lpmq ? 0x0653 : 0x06E4;
        // ---- 5b. Lam + alif bermaddah (لَآ): maddah ditulis sebagai tanda terpisah (ۤ) agar font tidak menggabungkannya
        //          dengan fathah lam. Hasilnya fathah tampil di atas LAM dan maddah di atas ALIF, seperti mushaf.
        for (let i = 1; i < cl.length; i++) {
            const k = cl[i], prev = cl[i - 1];
            if (!baseIs(prev, C.LAM))
                continue;
            if (baseIs(k, 0x0622)) {
                k.b = ch(C.ALEF);
                k.m.push(MADD);
            } // آ (satu huruf) -> ا + maddah
            else if (baseIs(k, C.ALEF) && has(k, 0x0653)) {
                drop(k, 0x0653);
                k.m.push(MADD);
            } // ا + ٓ -> ا + maddah
        }
        // ---- 5c. Ya akhir kata yang di data ditulis ى (فِى, ٱلَّذِى, ٱلنَّبِىِّ) -> ي bertitik (فِيْ, الَّذِيْ, النَّبِيِّ)
        for (let i = 1; i < cl.length; i++) {
            const k = cl[i], prev = cl[i - 1];
            if (baseIs(k, 0x0649) && !has(k, C.DAGGER) && prev.b !== ' ' && (has(prev, C.KASRA) || has(prev, C.SUB_ALEF)))
                k.b = ch(C.YEH);
        }
        // ---- 6. Huruf mad diberi sukun: waw setelah dammah, ya setelah kasrah
        for (let i = 1; i < cl.length; i++) {
            const k = cl[i], prev = cl[i - 1];
            if (k.m.some(x => x !== 0x0653) || prev.b === ' ')
                continue;
            const wordEnd = (i === cl.length - 1 || cl[i + 1].b === ' ');
            if (baseIs(k, C.WAW) && (has(prev, C.DAMMA) || has(prev, C.INV_DAMMA))) {
                if (wordEnd && prev.b === '\u0630')
                    continue; // "ذُو" tidak diberi sukun
                k.m.push(SUK);
            }
            else if (baseIs(k, C.YEH) && (has(prev, C.KASRA) || has(prev, C.SUB_ALEF))) {
                k.m.push(SUK);
            }
        }
        // ---- 6b. Nun sukun pada ikhfa haqiqi & idgham: nun yang di teks Madinah polos (tanpa tanda) diberi sukun
        //          مِن جُوعٍ -> مِنْ جُوْعٍ ,  مِن رَّبِّهِمْ -> مِنْ رَّبِّهِمْ ,  عَن صَلَاتِهِمْ -> عَنْ صَلَاتِهِمْ
        const NUN_RULE_LETTERS = new Set([
            // ikhfa haqiqi: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك
            0x062A, 0x062B, 0x062C, 0x062F, 0x0630, 0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x0637, 0x0638, 0x0641, 0x0642, 0x0643,
            // idgham: ي ر م ل و ن
            0x064A, 0x0631, 0x0645, 0x0644, 0x0648, 0x0646
        ]);
        for (let i = 0; i < cl.length; i++) {
            const k = cl[i];
            if (!baseIs(k, 0x0646) || k.m.length !== 0)
                continue; // hanya nun yang polos
            let j = i + 1;
            while (j < cl.length) { // lompati spasi & tanda waqaf lepas
                const cp = cl[j].b.codePointAt(0);
                if (cl[j].b === ' ' || (cp >= 0x06D6 && cp <= 0x06DC) || cp === 0x06DE || cp === 0x06E9)
                    j++;
                else
                    break;
            }
            if (j < cl.length && NUN_RULE_LETTERS.has(cl[j].b.codePointAt(0))) {
                k.m.push(SUK);
                k.idg = true;
            }
        }
        // ---- 6c. Idgham bighunnah: ya/waw setelah nun sukun atau tanwin diberi tasydid
        //          لَهَبٍ وَتَبَّ -> لَهَبٍ وَّتَبَّ ,  فَمَن يَعْمَلْ -> فَمَنْ يَّعْمَلْ ,  خَيْرًا يَرَهُۥ -> خَيْرًا يَّرَهٗ
        const isWaqf = (k) => {
            const cp = k.b.codePointAt(0);
            return (cp >= 0x06D6 && cp <= 0x06DC) || cp === 0x06DE || cp === 0x06E9;
        };
        const hasTanwin = (k) => k && k.m.some(x => x === 0x064B || x === 0x064C || x === 0x064D || (x >= 0x08F0 && x <= 0x08F2));
        for (let i = 2; i < cl.length; i++) {
            const k = cl[i];
            if (!(baseIs(k, C.YEH) || baseIs(k, C.WAW)) || cl[i - 1].b !== ' ')
                continue; // huruf pertama kata
            if (!k.m.some(x => x === C.FATHA || x === C.DAMMA || x === C.KASRA) || has(k, C.SHADDA) || has(k, SUK))
                continue;
            let p = cl[i - 2];
            if (!p || isWaqf(p))
                continue; // ada tanda waqaf di antara -> jangan
            if ((baseIs(p, C.ALEF) || baseIs(p, 0x0649)) && p.m.length === 0 && cl[i - 3])
                p = cl[i - 3]; // tanwin fathah: خَيْرًا / هُدًى
            if (p.idg || hasTanwin(p))
                k.m.unshift(C.SHADDA);
        }
        // ---- 6d. Idgham lainnya: huruf polos sebelum huruf bertasydid diberi sukun
        //          عَبَدتُّمْ -> عَبَدْتُّمْ ,  هُم مَّغْفِرَةٌ -> هُمْ مَّغْفِرَةٌ ,  قُل رَّبِّ -> قُلْ رَّبِّ
        //          (lam "ال" sebelum huruf syamsiyah tidak diberi sukun: الرَّحْمٰنِ)
        for (let i = 1; i < cl.length; i++) {
            const k = cl[i], cp = k.b.codePointAt(0);
            if (k.m.length !== 0 || cp < 0x0628 || cp > 0x064A)
                continue;
            if (cp === C.WAW || cp === C.YEH || cp === 0x0649 || cp === C.TATWEEL)
                continue;
            if (cl[i - 1].b === ' ')
                continue;
            if (cp === C.LAM && baseIs(cl[i - 1], C.ALEF))
                continue; // lam alif-lam (ta'rif)
            let j = i + 1;
            while (j < cl.length && (cl[j].b === ' ' || isWaqf(cl[j])))
                j++;
            if (j < cl.length && has(cl[j], C.SHADDA))
                k.m.push(SUK);
        }
        // ---- 7. Tanda "huruf tidak dibaca" (۟) dibuang -> قَالُوا۟ menjadi قَالُوْا
        cl.forEach(k => drop(k, C.ROUND_ZERO));
        // ---- 8. Pemeriksaan akhir: harakat miring + berdiri pada 1 huruf -> sisakan yang berdiri saja
        cl.forEach(k => {
            if (has(k, C.DAGGER)) {
                drop(k, C.FATHA);
            }
            if (has(k, C.SUB_ALEF))
                drop(k, C.KASRA);
            if (has(k, C.INV_DAMMA))
                drop(k, C.DAMMA);
        });
        // ---- 9. Lam + alif: harakat di ATAS lam digambar font di atas alif (ligatur). Pindahkan ke lapisan
        //         terpisah (span.la) yang posisinya diukur tepat di atas huruf lam. Tanda di alif (hamzah/maddah) tidak dipindah.
        if (opts.lamOverlay) {
            const ABOVE = new Set([0x064B, 0x064C, 0x064E, 0x064F, 0x0651, 0x0652, 0x0653, 0x0654, 0x0657, 0x0670, 0x06E1, 0x06E4, 0x08F0, 0x08F1]);
            for (let i = 0; i < cl.length - 1; i++) {
                const k = cl[i], nx = cl[i + 1];
                if (!baseIs(k, C.LAM) || !baseIs(nx, C.ALEF))
                    continue;
                const up = k.m.filter(x => ABOVE.has(x));
                if (!up.length)
                    continue;
                up.sort((a, b) => (b === 0x0651) - (a === 0x0651)); // tasydid dulu
                k.m = k.m.filter(x => !ABOVE.has(x));
                k.la = up;
            }
            let out = '';
            for (let i = 0; i < cl.length; i++) {
                const k = cl[i];
                if (k.la) {
                    const nx = cl[i + 1];
                    out += '<span class="la" data-a="' + k.la.map(ch).join('') + '">' + k.b + k.m.map(ch).join('') + nx.b + nx.m.map(ch).join('') + '</span>';
                    i++;
                }
                else
                    out += k.b + k.m.map(ch).join('');
            }
            return out;
        }
        return fromClusters(cl);
    }
    /* Lapisan harakat lam-alif untuk teks yang SUDAH dikonversi (dipakai setelah teks tampil di layar) */
    function overlay(text) {
        if (!text || text.indexOf('\u0644') === -1)
            return text;
        const cl = toClusters(text);
        const ABOVE = new Set([0x064B, 0x064C, 0x064E, 0x064F, 0x0651, 0x0652, 0x0653, 0x0654, 0x0657, 0x0670, 0x06E1, 0x06E4, 0x08F0, 0x08F1]);
        let any = false;
        for (let i = 0; i < cl.length - 1; i++) {
            const k = cl[i], nx = cl[i + 1];
            if (!baseIs(k, C.LAM) || !baseIs(nx, C.ALEF))
                continue;
            const up = k.m.filter(x => ABOVE.has(x));
            if (!up.length)
                continue;
            up.sort((a, b) => (b === 0x0651) - (a === 0x0651));
            k.m = k.m.filter(x => !ABOVE.has(x));
            k.la = up;
            any = true;
        }
        if (!any)
            return text;
        let out = '';
        for (let i = 0; i < cl.length; i++) {
            const k = cl[i];
            if (k.la) {
                const nx = cl[i + 1];
                out += '<span class="la" data-a="' + k.la.map(ch).join('') + '">' + k.b + k.m.map(ch).join('') + nx.b + nx.m.map(ch).join('') + '</span>';
                i++;
            }
            else
                out += k.b + k.m.map(ch).join('');
        }
        return out;
    }
    return { convert, overlay };
})();
