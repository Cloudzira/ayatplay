/* =====================================================================
   Layar penuh dan layar game satu halaman
   Tombol layar penuh dan penskalaan otomatis soal agar muat satu layar tanpa scroll.
   ===================================================================== */
'use strict';

/* =====================================================================
   LAYAR PENUH + LAYAR GAME SATU HALAMAN (tanpa scroll)
   - Isi soal diskalakan otomatis agar muat di tinggi layar yang tersedia.
   - Di landscape, isi soal dibagi dua kolom (kiri: soal, kanan: pilihan).
   ===================================================================== */
const FS_EL = document.documentElement;
const fsRequest = FS_EL.requestFullscreen || FS_EL.webkitRequestFullscreen || null;
const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

async function toggleFS() {
    if (!fsRequest) {
        toast('📱 Layar penuh belum didukung browser ini. Di iPhone: ketuk Bagikan → Tambahkan ke Layar Utama, lalu buka dari ikonnya.');
        return;
    }
    try {
        if (isFS())
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else
            await fsRequest.call(FS_EL, { navigationUI: 'hide' });
    }
    catch (e) {
        toast('Layar penuh ditolak browser. Coba ketuk tombolnya sekali lagi.');
    }
}

function syncFS() {
    const on = isFS();
    $$('[data-act=fs]').forEach(b => {
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
        b.title = on ? 'Keluar layar penuh' : 'Layar penuh';
    });
    scheduleFit();
}

['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, syncFS));
ACTIONS.fs = () => toggleFS();
const FIT_MIN = .56;
const B_START = '.opts,.tray,.mgrid,.hij-pool,.sn-wrap,.pm-box,.gb,.pz-board';
const LAND_Q = '(orientation:landscape) and (min-aspect-ratio:5/4)';
let fitQueued = false, splitBusy = false, stageMO = null, areaRO = null;

function autoSplit(st) {
    if (!st || st.querySelector(':scope > .gA'))
        return;
    const kids = [...st.children], bi = kids.findIndex(k => k.matches(B_START));
    if (bi < 1)
        return;
    const head = kids[0].matches('.q-text') ? 1 : 0; // judul soal tetap di atas, membentang dua kolom
    if (!kids.slice(head, bi).some(k => !k.matches('.q-text,.hint')))
        return; // kolom kiri harus punya isi visual, bila tidak: satu kolom lebar
    const A = document.createElement('div'), B = document.createElement('div');
    A.className = 'gA';
    B.className = 'gB';
    kids.forEach((k, i) => {
        if (i >= head)
            (i < bi ? A : B).appendChild(k);
    });
    st.append(A, B);
}

function fitStage() {
    if (curView !== 'game')
        return;
    const area = $('#garea'), holder = $('#gfit'), st = $('#stage');
    if (!area || !holder || !st)
        return;
    splitBusy = true;
    autoSplit(st);
    splitBusy = false;
    const gA = st.querySelector(':scope > .gA'), gB = st.querySelector(':scope > .gB');
    if (gA && gB) {                                           // tombol arah: kolom kiri di landscape, di bawah papan di portrait
        const landNow = matchMedia(LAND_Q).matches, dp = [...gA.querySelectorAll(':scope > .dpad,:scope > .rn-pad'), ...gB.querySelectorAll(':scope > .dpad,:scope > .rn-pad')];
        splitBusy = true;
        dp.forEach(d => (landNow ? gA : gB).appendChild(d));
        splitBusy = false;
    }
    st.classList.toggle('split', !!st.querySelector(':scope > .gA'));
    const cs = getComputedStyle(area), padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom), padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const availH = area.clientHeight - padY, availW = area.clientWidth - padX;
    if (availH <= 0 || availW <= 0)
        return;
    const land = matchMedia(LAND_Q).matches, W = Math.min(availW, land ? 1440 : 760);
    st.style.transform = 'none';
    const Hat = sc => {
        st.style.width = (W / sc) + 'px';
        return st.offsetHeight * sc;
    }; // tinggi yang tampak pada skala sc
    const smax = Math.max(1, Math.min(land ? 2 : 1.5, W / (land ? 760 : 340))); // boleh membesar agar layar terisi, tapi tata letak tetap lega
    let s = 1, lo, hi;
    if (Hat(1) <= availH) {
        if (smax > 1) {
            lo = 1;
            hi = smax;
            if (Hat(hi) <= availH)
                lo = hi;
            else
                for (let k = 0; k < 9; k++) {
                    const mid = (lo + hi) / 2;
                    if (Hat(mid) <= availH)
                        lo = mid;
                    else
                        hi = mid;
                }
            s = lo;
        }
    }
    else {
        s = FIT_MIN;
        lo = FIT_MIN;
        hi = 1;
        for (let k = 0; k < 9; k++) {
            const mid = (lo + hi) / 2;
            if (Hat(mid) <= availH) {
                s = mid;
                lo = mid;
            }
            else
                hi = mid;
        }
    }
    for (let g = 0; g < 24 && s > FIT_MIN && Hat(s) > availH; g++)
        s = Math.max(FIT_MIN, s - .03); // pengaman bila tata letak berubah saat skala berubah
    Hat(s);
    const H = st.offsetHeight;
    st.style.transform = 'scale(' + s + ')';
    holder.style.width = W + 'px';
    holder.style.height = Math.ceil(H * s) + 'px';
    area.dataset.fit = s.toFixed(2);
}

function scheduleFit() {
    if (fitQueued)
        return;
    fitQueued = true;
    requestAnimationFrame(() => {
        fitQueued = false;
        fitStage();
    });
}

function initFit() {
    if (stageMO)
        stageMO.disconnect();
    if (areaRO)
        areaRO.disconnect();
    const st = $('#stage'), area = $('#garea');
    if (!st || !area)
        return;
    stageMO = new MutationObserver(() => {
        if (splitBusy)
            return;
        scheduleFit();
    });
    stageMO.observe(st, { childList: true, subtree: true });
    areaRO = new ResizeObserver(() => scheduleFit());
    areaRO.observe(area);
    if (document.fonts && document.fonts.ready)
        document.fonts.ready.then(scheduleFit);
    scheduleFit();
}

addEventListener('resize', scheduleFit);
addEventListener('orientationchange', () => setTimeout(scheduleFit, 250));
