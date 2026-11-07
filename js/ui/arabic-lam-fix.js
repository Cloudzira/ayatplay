/* =====================================================================
   Perbaikan harakat lam-alif
   Mengukur dan memperbaiki posisi harakat pada ligatur lam-alif.
   ===================================================================== */
'use strict';

/* ---------- perbaikan harakat lam-alif (dari TalqinKu, disesuaikan dengan bobot font) ---------- */
let LAM_FIX_OK = false, lamBusy = false;

async function measureLam() {
    if (lamBusy)
        return;
    lamBusy = true;
    try {
        const wt = (AR_FONTS[S.arFont] || AR_FONTS.kid).w;
        try {
            await Promise.race([document.fonts.load(`${wt} 100px 'Scheherazade New'`, "\u0644\u0627"), wait(3500)]);
        }
        catch (e) { }
        const FS = 100, X0 = 100, BASE = 260, W = 520, H = 400;
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        ctx.font = `${wt} ${FS}px 'Scheherazade New', serif`;
        ctx.direction = 'rtl';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#000';
        const scan = text => {
            ctx.clearRect(0, 0, W, H);
            ctx.fillText(text, X0, BASE);
            const d = ctx.getImageData(0, 0, W, H).data;
            let minX = W, maxX = -1, minY = H, maxY = -1;
            const top = new Array(W).fill(H);
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    if (d[(y * W + x) * 4 + 3] > 110) {
                        if (x < minX)
                            minX = x;
                        if (x > maxX)
                            maxX = x;
                        if (y < minY)
                            minY = y;
                        if (y > maxY)
                            maxY = y;
                        if (y < top[x])
                            top[x] = y;
                    }
                }
            return { minX, maxX, minY, maxY, top };
        };
        const lig = scan('\u0644\u0627');
        if (lig.maxX < 0)
            throw new Error('ligatur tidak terukur');
        const limit = lig.minY + .45 * (lig.maxY - lig.minY), groups = [];
        let cur = null;
        for (let x = lig.minX; x <= lig.maxX; x++) {
            if (lig.top[x] <= limit) {
                if (cur && x - cur.end <= 3)
                    cur.end = x;
                else {
                    cur = { start: x, end: x };
                    groups.push(cur);
                }
            }
        }
        if (!groups.length)
            throw new Error('lam tidak ditemukan');
        const lam = groups[groups.length - 1], lamX = (lam.start + lam.end) / 2;
        let lamTop = H;
        for (let x = lam.start; x <= lam.end; x++)
            lamTop = Math.min(lamTop, lig.top[x]);
        const mk = scan('\u00A0\u064E');
        if (mk.maxX < 0)
            throw new Error('harakat tidak terukur');
        const wN = ctx.measureText('\u00A0\u064E').width / FS, cmx = ((mk.minX + mk.maxX) / 2 - X0) / FS;
        const left = (lamX - X0) / FS + wN - cmx, up = (BASE - lamTop) / FS - (BASE - mk.maxY) / FS + .04;
        if (!(up > -.3 && up < 1) || !(left > -.5 && left < 2))
            throw new Error('hasil ukur tidak wajar');
        const root = document.documentElement.style;
        root.setProperty('--la-left', left.toFixed(3));
        root.setProperty('--la-up', up.toFixed(3));
        root.setProperty('--la-w', wN.toFixed(3));
        LAM_FIX_OK = true;
        enhanceNode(document.body);
    }
    catch (e) {
        if (!LAM_FIX_OK)
            LAM_FIX_OK = false;
    }
    lamBusy = false;
}

function enhanceNode(root) {
    if (!LAM_FIX_OK || !root)
        return;
    const base = root.nodeType === 3 ? root.parentNode : root;
    if (!base || base.nodeType !== 1)
        return;
    const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, { acceptNode: n => {
            const p = n.parentElement;
            return (p && n.nodeValue.indexOf('\u0644') > -1 && p.closest('.ar') && !p.closest('.la')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        } });
    const nodes = [];
    while (walker.nextNode())
        nodes.push(walker.currentNode);
    nodes.forEach(n => {
        const src = n.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;'), h = MushafID.overlay(src);
        if (h !== src) {
            const t = document.createElement('template');
            t.innerHTML = h;
            n.replaceWith(t.content);
        }
    });
}

const arObserver = new MutationObserver(ms => {
    if (!LAM_FIX_OK)
        return;
    for (const m of ms)
        m.addedNodes.forEach(n => {
            if (n.nodeType === 1 || n.nodeType === 3)
                enhanceNode(n);
        });
});

arObserver.observe(document.body, { childList: true, subtree: true });
