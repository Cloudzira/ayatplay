/* =====================================================================
   Komponen tampilan bersama
   Toast, maskot, kalimat semangat, dan gambar SVG hiasan.
   ===================================================================== */
'use strict';

/* ---------- toast ---------- */
function toast(msg, cls = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + cls;
    el.textContent = msg;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3)
        box.firstChild.remove(); // maksimal 3 toast agar tidak menumpuk
    setTimeout(() => el.remove(), 3600);
}

/* ---------- maskot ---------- */
const mascotSVG = (cls = '') => `<svg class="mascot ${cls}" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 61.8 36.5 94.5 38.4 69 58.9 77.5 90.5 50 72.8 22.5 90.5 31 58.9 5.5 38.4 38.2 36.5Z" fill="#FFC93C" stroke="#E8A200" stroke-width="6" stroke-linejoin="round"/><ellipse class="eye" cx="40" cy="50" rx="4.2" ry="5.2" fill="#1E2347"/><ellipse class="eye" cx="60" cy="50" rx="4.2" ry="5.2" fill="#1E2347"/><ellipse cx="31" cy="58" rx="5" ry="3" fill="#FF8F8F" opacity=".7"/><ellipse cx="69" cy="58" rx="5" ry="3" fill="#FF8F8F" opacity=".7"/><path d="M42 61q8 8 16 0" fill="none" stroke="#1E2347" stroke-width="3.2" stroke-linecap="round"/></svg>`;
const IDLE = ['Bismillah, yuk mulai hafalan hari ini!', 'Satu ayat setiap hari, lama-lama jadi satu surah!', 'Ulang-ulang itu kunci hafalan. Semangat!', 'Dengarkan dulu, baru main. Pasti lebih mudah!', 'Kamu hebat sudah mau belajar Al-Qur\'an!'];
const CHEER = ['MasyaAllah, hebat!', 'Mumtaz! Pertahankan ya!', 'Bagus sekali, terus lanjut!', 'Jawabanmu tepat!', 'Keren! Kamu makin hafal!'];
const TRYAGAIN = ['Tidak apa-apa, salah itu bagian dari belajar.', 'Dengarkan lagi ayatnya, lalu coba lagi ya!', 'Hampir! Kamu pasti bisa.', 'Yuk perhatikan jawabannya, nanti pasti ingat.'];

function starsBg() {
    let s = '';
    for (let i = 0; i < 26; i++) {
        const x = rnd(100), y = rnd(100), r = (.5 + Math.random() * 1.6).toFixed(1);
        s += `<circle cx="${x}%" cy="${y}%" r="${r}" fill="#fff" opacity="${(.35 + Math.random() * .6).toFixed(2)}"/>`;
    }
    return `<svg class="stars-bg" width="100%" height="100%" aria-hidden="true">${s}</svg>`;
}

const STAR8 = "50.0,2.0 64.1,16.1 83.9,16.1 83.9,35.9 98.0,50.0 83.9,64.1 83.9,83.9 64.1,83.9 50.0,98.0 35.9,83.9 16.1,83.9 16.1,64.1 2.0,50.0 16.1,35.9 16.1,16.1 35.9,16.1";
const lanternSVG = cls => `<svg class="lant ${cls}" viewBox="0 0 60 130" aria-hidden="true"><path d="M30 0V24" stroke="#D9B04A" stroke-width="2"/><circle cx="30" cy="26" r="4" fill="#D9B04A"/><path d="M16 46Q30 18 44 46Z" fill="#C9962A"/><path d="M13 46H47L53 82L45 100H15L7 82Z" fill="#F0C14B" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/><path class="lant-glow" d="M22 56Q30 42 38 56V88H22Z" fill="#FFF4B8"/><path d="M17 100H43V107H17Z" fill="#C9962A"/><path d="M30 107V124" stroke="#D9B04A" stroke-width="2"/><circle cx="30" cy="126" r="3.5" fill="#F0C14B"/></svg>`;
const skylineHero = () => `<svg class="skyline" viewBox="0 0 600 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g fill="#062F38"><path d="M0 150V112H44V96Q44 78 66 76Q88 78 88 96V150Z"/><path d="M100 150V58H116V150Z"/><path d="M97 58L108 26 119 58Z"/><path d="M140 150V104Q140 70 190 62Q240 70 240 104V150Z"/><path d="M252 150V70H268V150Z"/><path d="M249 70L260 36 271 70Z"/><path d="M286 150V120H340V150Z"/><path d="M350 150V96Q350 52 410 44Q470 52 470 96V150Z"/><path d="M482 150V64H498V150Z"/><path d="M479 64L490 30 501 64Z"/><path d="M516 150V108H560V92Q560 76 580 74Q600 76 600 92V150Z"/></g><g fill="#F0C14B"><path d="M190 60V46" stroke="#F0C14B" stroke-width="3"/><path d="M196 30a9 9 0 1 0 0 16 7 7 0 1 1 0-16z"/><path d="M410 42V28" stroke="#F0C14B" stroke-width="3"/><path d="M416 14a9 9 0 1 0 0 16 7 7 0 1 1 0-16z"/><circle cx="108" cy="24" r="3.5"/><circle cx="260" cy="34" r="3.5"/><circle cx="490" cy="28" r="3.5"/></g><g fill="#FFD24D" opacity=".8"><path d="M174 150v-24a16 16 0 0 1 32 0v24z"/><path d="M394 150v-26a16 16 0 0 1 32 0v26z"/><rect x="300" y="128" width="8" height="12" rx="4"/><rect x="318" y="128" width="8" height="12" rx="4"/></g></svg>`;
const emblemSVG = () => `<svg width="88" height="88" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="emg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE470"/><stop offset="1" stop-color="#E8A000"/></linearGradient></defs><polygon points="${STAR8}" fill="url(#emg)" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="50" r="31" fill="#0F4E52" stroke="#F6DF8E" stroke-width="2"/><mask id="emm"><rect width="100" height="100" fill="#fff"/><circle cx="59" cy="45" r="17" fill="#000"/></mask><circle cx="48" cy="52" r="20" fill="#F6DF8E" mask="url(#emm)"/><path d="M61 37l2.4 5.2 5.6.6-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6-4.1-3.9 5.6-.6z" fill="#F6DF8E"/></svg>`;
