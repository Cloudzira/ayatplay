/* =====================================================================
   Halaman Beranda
   Beranda, daftar game, dialog konfirmasi, dan lembar pilih level.
   ===================================================================== */
'use strict';

/* ---------- BERANDA ---------- */
const GCOL = [['#D8F3E8', '#4DBB93'], ['#FFF1C9', '#E0AE2E'], ['#D5F2F2', '#4FB8BC'], ['#DFE6FA', '#7F93DB'], ['#FADDE3', '#E58AA0'], ['#FBE4D3', '#E39A6B'], ['#E6F1CF', '#9FC05A'], ['#E8E0F7', '#A48BD6'], ['#D3E8EC', '#5C9AA6'], ['#FFEBC2', '#EBA928'], ['#F3E3F1', '#C58AC0'], ['#E2EEF9', '#78A9D6'], ['#E9F3D9', '#7DB84A'], ['#FFE3E0', '#E97C70'], ['#E1F0D6', '#74B35A'], ['#E9E2FA', '#9A86DA'], ['#E3F1FA', '#6FA8D6'], ['#DDF6EE', '#2FB58F']];

function renderHome() {
    const lv = levelInfo(S.xp), g = goalState(), pct = Math.round(g.n / g.goal * 100);
    const total = VERSES.length, mem = memCount(), mp = Math.round(mem / total * 100);
    $('#v-home').innerHTML = `
  <div class="hero">
    ${starsBg()}${skylineHero()}${lanternSVG('l1')}${lanternSVG('l2')}
    <div style="position:relative">
      <h2>Assalamu'alaikum, ${esc(S.name || 'Sahabat Cilik')}! 👋</h2>
      <p>Hafal Al-Qur'an sambil bermain. Dengarkan ayatnya dulu, lalu taklukkan ${GAMES.length} game seru dan naik level!</p>
      <div class="goal"><div class="goal-row"><span>🎯 Target hari ini</span><span>${g.n}/${g.goal} permainan</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>
      <div class="hero-cta"><button class="btn btn-sun" data-act="nav" data-to="learn">📖 Belajar dulu</button><button class="btn btn-ghost" data-act="to-games">🎮 Main game</button></div>
    </div>
    <div class="mascot-box">${mascotSVG()}<div class="bubble" id="bubble">${esc(pick(IDLE))}</div></div>
  </div>

  <div style="margin-top:18px" id="scope-slot">${scopeCard()}</div>

  <div class="card row" style="margin-top:16px">
    <div class="ring" style="--p:${mp}"><div>${mp}%<small>hafal</small></div></div>
    <div style="flex:1;min-width:200px">
      <h3>📗 Hafalanku</h3>
      <p class="muted" style="margin:4px 0 10px;font-weight:700">${mem} dari ${total} ayat sudah kamu tandai hafal. Level ${lv.L}: ${esc(lv.title)}.</p>
      <div class="bar dark" style="height:12px"><i style="width:${lv.pct}%"></i></div>
      <small class="muted" style="font-weight:800">${S.xp} XP${lv.L < 10 ? ` · ${lv.end - S.xp} XP lagi menuju Level ${lv.L + 1}` : ' · Level tertinggi!'}</small>
    </div>
    <button class="btn btn-mint" data-act="nav" data-to="learn">Lanjut menghafal</button>
  </div>

  <h2 class="sec-title" id="games">🎮 Pilih permainan</h2>
  <div class="gal">${GAMES.map((G, i) => {
        const done = doneLevels(G.id), gs = gameStars(G.id);
        return `<button class="gcard" data-act="game" data-g="${G.id}" style="--bg:${GCOL[i][0]};--bd:${GCOL[i][1]}" aria-label="${esc(G.name)}. Level selesai ${done} dari ${maxL(G.id)}">
      <span class="gnum">#${G.id}</span><span class="gicon" aria-hidden="true">${G.emoji}</span>
      <h3>${esc(G.name)}</h3><p>${esc(G.short)}</p>
      <span class="gbar" aria-hidden="true"><i style="width:${done / maxL(G.id) * 100}%"></i></span>
      <span class="gmeta" aria-hidden="true"><b>Level ${done}/${maxL(G.id)}</b><span>⭐ ${gs}/${maxL(G.id) * 3}</span></span>
    </button>`;
    }).join('')}</div>`;
}

let confirmRes = null;

function openSheet(html, cls = '') {
    $('#sheet').className = 'sheet ' + cls;
    $('#overlay').classList.toggle('center', cls === 'dialog');
    $('#sheet').innerHTML = html;
    $('#overlay').classList.remove('hidden');
}

/* Dialog konfirmasi bertema (pengganti confirm bawaan browser). Hasil true = pilih opsi "berisiko". */
function askConfirm(o) {
    return new Promise(res => {
        if (confirmRes) {
            const r = confirmRes;
            confirmRes = null;
            r(false);
        }
        confirmRes = res;
        openSheet(`<div class="dlg" role="alertdialog" aria-labelledby="dlg-t">${mascotSVG()}
      <h3 id="dlg-t">${esc(o.title)}</h3><p>${esc(o.text)}</p>${o.info ? `<div class="dlg-info">${esc(o.info)}</div>` : ''}
      <div class="dlg-btns"><button class="btn btn-mint btn-block" data-act="dlg-no">${esc(o.safe)}</button><button class="btn btn-ghost btn-block dlg-risk" data-act="dlg-yes">${esc(o.risk)}</button></div></div>`, 'dialog');
    });
}

function closeSheet() {
    if (confirmRes) {
        const r = confirmRes;
        confirmRes = null;
        r(false);
    }
    $('#overlay').classList.add('hidden');
    $('#overlay').classList.remove('center');
    $('#sheet').innerHTML = '';
    $('#sheet').className = 'sheet';
}

let sheetG = 0, sheetSel = 1;

function openLevelSheet(g, sel) {
    const G = GAMES[g - 1], i = g - 1;
    sheetG = g;
    sheetSel = sel || nextLevelFor(g);
    const l = sheetSel, ok = unlocked(g, l), st = stars(g, l), M = MOTIFS[i], own = st >= 1, tr = tierOf(l, g);
    openSheet(`<div class="sheet-head"><span class="gicon" style="border-color:${GCOL[i][1]};background:${GCOL[i][0]}">${G.emoji}</span><div><h3>${esc(G.name)}</h3><small class="muted" style="font-weight:800">${doneLevels(g)} dari ${maxL(g)} level selesai · ⭐ ${gameStars(g)}/${maxL(g) * 3}</small></div></div>
  <p style="margin:6px 0 10px;font-weight:700;color:#3E5A57">${esc(G.how)}</p>
  <div class="lvgrid" role="group" aria-label="Pilih level">${Array.from({ length: maxL(g) }, (_, k) => k + 1).map(n => {
        const o = unlocked(g, n), s = stars(g, n);
        return `<button class="lvnode ${o ? (s ? 'done' : 'open') : 'lock'} ${n === l ? 'sel' : ''}" data-act="lvsel" data-g="${g}" data-l="${n}" aria-label="Level ${n}, ${o ? (s ? s + ' bintang' : 'terbuka') : 'terkunci'}"><span class="lvn">${o ? n : '🔒'}</span><span class="lvst" aria-hidden="true">${s ? '★'.repeat(s) : ''}</span></button>`;
    }).join('')}</div>
  <div class="lvinfo">
    <div class="row" style="gap:10px;justify-content:space-between;flex-wrap:nowrap"><div style="flex:1;min-width:0"><b style="font-family:var(--f-disp);font-size:1.2rem">Level ${l} · ${RANKS[l - 1]}</b><br><span class="tag">${BAND(l)}</span></div>
      <div class="sticker sm t${tr} ${own ? '' : 'lock'}" style="min-width:92px;flex:none" aria-label="Stiker ${esc(M.n)} level ${l}"><span class="stk-e">${own ? M.e : '🔒'}</span><small>${own ? 'Stikermu' : 'Hadiah'}</small></div></div>
    <p style="margin:8px 0 0;font-weight:700;color:#3E5A57">${esc(G.levels[l - 1].desc)}</p>
  </div>
  <button class="btn btn-mint btn-block" data-act="start" data-g="${g}" data-l="${l}" ${ok ? '' : 'disabled'} style="margin-top:12px">${ok ? `Mulai Level ${l} ▶` : '🔒 Selesaikan level sebelumnya dulu'}</button>
  <p class="hint" style="margin-top:10px">${G.passText || 'Tiap level berisi 10 soal berbeda. Lulus jika benar minimal 6 soal, lalu kamu mendapat stiker dan level berikutnya terbuka.'}</p>
  <button class="btn btn-ghost btn-block" data-act="close" style="margin-top:6px">Tutup</button>`);
}
