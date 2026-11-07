/* =====================================================================
   Pengaturan tulisan Arab
   Pilihan font dan ukuran tulisan Arab ramah anak.
   ===================================================================== */
'use strict';

/* ---------- tulisan Arab ramah anak ---------- */
const AR_FONTS = {
    kid: { n: 'Ramah Anak', d: 'Tebal dan lega, mudah dibaca', stack: "'Scheherazade New'", w: 600, lh: 2.5, ws: '.22em' },
    mushaf: { n: 'Seperti Mushaf', d: 'Tipis, mirip mushaf cetak', stack: "'Scheherazade New'", w: 400, lh: 2.4, ws: '.14em' }
};

const AR_SIZES = [[1, 'Sedang'], [1.15, 'Besar'], [1.3, 'Sangat Besar']];

function applyArabic() {
    const f = AR_FONTS[S.arFont] || AR_FONTS.kid, sc = +S.arSize || 1.15, r = document.documentElement.style;
    r.setProperty('--f-ar', f.stack + ",'Traditional Arabic','Geeza Pro','Al Bayan',serif");
    if (typeof measureLam === 'function')
        measureLam();
    r.setProperty('--ar-w', f.w);
    r.setProperty('--ar-lh', f.lh);
    r.setProperty('--ar-ws', f.ws);
    r.setProperty('--ar-scale', sc);
    r.setProperty('--ar-s2', (1 + (sc - 1) * .6).toFixed(3));
}

function syncArabicUI() {
    $$('[data-act=arfont]').forEach(b => {
        const on = b.dataset.k === S.arFont;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
    });
    $$('[data-act=arsize]').forEach(b => b.classList.toggle('on', +b.dataset.v === +S.arSize));
}

const arSizeSeg = (small) => `<span class="seg" role="group" aria-label="Ukuran tulisan Arab">${AR_SIZES.map(([v, l], i) => `<button class="${+S.arSize === v ? 'on' : ''}" data-act="arsize" data-v="${v}" ${small ? `style="font-size:${(.8 + i * .14).toFixed(2)}rem" aria-label="${l}"` : ''}>${small ? 'Aa' : l}</button>`).join('')}</span>`;
