/* =====================================================================
   Halaman Hadiah, Profil, dan Sertifikat
   Lencana, profil pemain, serta sertifikat.
   ===================================================================== */
'use strict';

/* ---------- LENCANA ---------- */
function renderBadges() {
    const got = BADGES.filter(b => S.badges[b.id]).length;
    $('#v-badges').innerHTML = `<h2 class="sec-title" style="margin-top:6px">🎁 Hadiah Hafiz</h2>
  <p class="muted" style="font-weight:700;margin-top:-4px">Sertifikat, stiker, dan lencana dari perjalanan hafalanmu. Terus belajar untuk membuka semuanya!</p>
  <h3 style="margin:16px 0 8px">🎓 Sertifikat</h3>
  <button class="btn btn-sun btn-block" data-act="cert">🎓 Sertifikat Hafiz Cilik</button>
  <p class="muted small" style="margin:10px 0 8px">Selesaikan semua level sebuah game untuk mendapat sertifikat tamat game tersebut.</p>
  <div class="certgrid">${GAMES.map(G => {
        const d = doneLevels(G.id), ok = d >= maxL(G.id);
        return `<button class="certcard ${ok ? '' : 'lock'}" data-act="cert-game" data-g="${G.id}"><span class="e">${ok ? '🎓' : '🔒'}</span><b>${esc(G.name)}</b><small>${ok ? 'Lihat sertifikat' : d + '/' + maxL(G.id) + ' level'}</small></button>`;
    }).join('')}</div>
  <h3 style="margin:22px 0 4px">🎁 Koleksi Stiker (${stickerCount()}/${totalLevels()})</h3>
  <p class="muted small" style="margin:0 0 10px">Selesaikan tiap level untuk mendapat stikernya. Tingkatnya: perunggu (1-3), perak (4-6), emas (7-9), dan berlian (10).</p>
  ${GAMES.map(G => {
        const M = MOTIFS[G.id - 1];
        return `<div class="stkset"><div class="stkhead"><b>${G.emoji} ${esc(G.name)} · ${esc(M.n)}</b><small>${doneLevels(G.id)}/${maxL(G.id)}</small></div><div class="stkrow">${Array.from({ length: maxL(G.id) }, (_, k) => k + 1).map(l => {
            const own = stars(G.id, l) >= 1;
            return `<div class="sticker sm t${tierOf(l, G.id)} ${own ? '' : 'lock'}" role="img" aria-label="${esc(M.n)} level ${l}${own ? '' : ', belum didapat'}"><span class="stk-e">${own ? M.e : '🔒'}</span><small>Lv ${l}${own ? ' · ' + '⭐'.repeat(stars(G.id, l)) : ''}</small></div>`;
        }).join('')}</div></div>`;
    }).join('')}
  <h3 style="margin:22px 0 4px">🏅 Lencana (${got}/${BADGES.length})</h3>
  <div class="badges" style="margin-top:12px">${BADGES.map(b => {
        const on = !!S.badges[b.id];
        return `<div class="badge ${on ? '' : 'lock'}"><span class="e">${on ? b.e : '🔒'}</span><b>${esc(b.n)}</b><small>${esc(b.d)}</small></div>`;
    }).join('')}</div>`;
}

/* ---------- PROFIL & SERTIFIKAT ---------- */
function renderProfile() {
    const lv = levelInfo(S.xp);
    $('#v-profile').innerHTML = `<h2 class="sec-title" style="margin-top:6px">😊 Profilku</h2>
  <div class="card" style="display:grid;gap:14px">
    <div class="field"><label for="nm" style="font-weight:800">Namaku</label><input id="nm" maxlength="30" placeholder="Tulis namamu…" value="${esc(S.name)}" autocomplete="off"></div>
    <div class="row"><div style="font-size:3rem">${mascotSVG().replace('class="mascot ', 'width="64" height="64" class="')}</div>
      <div style="flex:1;min-width:200px"><h3>Level ${lv.L} · ${esc(lv.title)}</h3><div class="bar dark" style="height:12px;margin:8px 0 4px"><i style="width:${lv.pct}%"></i></div><small class="muted" style="font-weight:800">${S.xp} XP${lv.L < 10 ? ` · ${lv.end - S.xp} XP lagi` : ''}</small></div></div>
    <div class="stat-row"><span class="stat">⭐ ${totalStars()} bintang</span><span class="stat">🔥 ${liveStreak()} hari beruntun</span><span class="stat">🏆 Rekor ${S.best} hari</span><span class="stat">📗 ${memCount()} ayat hafal</span></div>
    <button class="btn btn-sun" data-act="cert">🎓 Lihat Sertifikat</button>
  </div>
  <div class="card" style="margin-top:16px;display:grid;gap:10px">
    <h3>🎙️ Suara Qari</h3>
    <p class="muted small" style="margin:0">Pilih suara bacaan untuk mode Belajar dan game. Tersedia 11 qari; bila audio qari pilihan belum bisa dimuat, otomatis memakai qari Misyari.</p>
    ${qariSelect()}
  </div>
  <div class="card" style="margin-top:16px;display:grid;gap:12px">
    <h3>🔤 Tulisan Arab</h3>
    <p class="muted small" style="margin:0">Pilih bentuk dan ukuran tulisan yang paling nyaman dibaca adik-adik.</p>
    ${Object.entries(AR_FONTS).map(([k, f]) => `<button class="fontopt ${S.arFont === k ? 'on' : ''}" data-act="arfont" data-k="${k}" aria-pressed="${S.arFont === k}"><span><b>${f.n}</b><small>${f.d}</small></span><span class="ar" lang="ar" dir="rtl" style="font-family:${f.stack},serif!important;font-weight:${f.w}">قُلْ هُوَ اللَّهُ أَحَدٌ</span></button>`).join('')}
    <div class="row"><b>Ukuran</b>${arSizeSeg(false)}</div>
  </div>
  <div id="cloud-slot" data-user="${FB.user ? FB.user.uid : ''}">${cloudCard()}</div>
  ${installCard()}
  <div class="card" style="margin-top:16px;display:grid;gap:8px">
    <h3>ℹ️ Tentang AyatPlay</h3>
    <p class="muted" style="margin:0;font-weight:600">Teks Arab dari api.quran.com (gaya Mushaf Standar Indonesia), terjemah dari Kemenag (alquran.cloud), dan audio qari dari <a href="https://everyayah.com/" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">EveryAyah.com</a>, sehingga butuh internet. Kemajuanmu tersimpan di perangkat ini dan, jika orang tua masuk akun, juga di cloud. Orang tua atau guru sebaiknya ikut mengoreksi bacaan anak langsung dengan guru ngaji.</p>
    <button class="btn btn-ghost btn-sm" data-act="reset" style="justify-self:start">🔄 Atur ulang semua progres</button>
  </div>`;
}

function certHTML(o) {
    return `<div class="cert-wrap"><div class="cert" id="cert"><div class="cert-frame"><div class="cert-in">
    <span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
    <div class="cert-bsm ar" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <div class="cert-emblem">${emblemSVG()}</div>
    <h3>${o.title}</h3><div class="cert-sub">${o.sub}</div>
    <div class="cert-given">Dengan bangga diberikan kepada</div>
    <div class="nm">${esc(S.name || 'Sahabat Hafiz Cilik')}</div>
    <p>${o.body}</p>
    <div class="stat-row">${o.stats.map(x => `<span class="stat">${x}</span>`).join('')}</div>
    <div class="cert-quote"><div class="ar ar-md" lang="ar" dir="rtl">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</div><small>“Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya.” (HR. Bukhari)</small></div>
    <div class="cert-sign"><div><span></span><small>Orang Tua / Wali</small></div><div class="cert-date">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div><div><span></span><small>Ustaz / Ustazah</small></div></div>
  </div></div></div>
  <div class="row" style="margin-top:12px;justify-content:center"><button class="btn btn-mint" data-act="print">🖨️ Cetak / Simpan PDF</button><button class="btn btn-ghost" data-act="close">Tutup</button></div></div>`;
}

function openCert(kind, g) {
    if (kind === 'game') {
        const G = GAMES[g - 1];
        if (!allLevels(g)) {
            toast(`🔒 Selesaikan ${MAXL} level ${G.name} dulu untuk membuka sertifikat ini.`);
            return;
        }
        openSheet(certHTML({ title: 'Sertifikat Tamat Game', sub: `${G.emoji} ${esc(G.name)}`,
            body: `telah menuntaskan ${maxL(g) > 1 ? `seluruh ${maxL(g)} level` : 'level'} permainan <b>${esc(G.name)}</b> dengan penuh semangat dan ketekunan. Barakallahu fiikum!`,
            stats: [`⭐ ${gameStars(g)}/${maxL(g) * 3} bintang`, `${MOTIFS[g - 1].e} ${maxL(g) > 1 ? maxL(g) + ' stiker' : 'stiker'} ${esc(MOTIFS[g - 1].n)}`, `🏆 Level ${maxL(g)}: ${RANKS[maxL(g) - 1]}`] }), 'wide');
        return;
    }
    const lv = levelInfo(S.xp);
    openSheet(certHTML({ title: 'Sertifikat Hafiz Cilik', sub: 'AyatPlay Kids · Petualangan Hafiz Cilik',
        body: 'yang telah giat belajar dan bermain untuk menghafal Al-Qur\'an (Juz 28, 29, 30). Semoga Allah memberkahi ilmu dan hafalanmu.',
        stats: [`⭐ ${totalStars()} bintang`, `⚡ ${S.xp} XP`, `📗 ${memCount()} ayat hafal`, `🎁 ${stickerCount()}/${totalLevels()} stiker`, `🏅 Level ${lv.L}: ${esc(lv.title)}`] }), 'wide');
}
