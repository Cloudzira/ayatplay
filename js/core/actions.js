/* =====================================================================
   Penanganan klik (event delegation)
   Tabel ACTIONS: setiap tombol punya atribut data-act yang dipetakan ke fungsi di sini.
   ===================================================================== */
'use strict';

/* ---------- aksi (event delegation) ---------- */
const ACTIONS = {
    nav: t => {
        sfx('tap');
        nav(t.dataset.to);
    },
    sound: () => {
        S.sound = !S.sound;
        save();
        updateHeader();
        if (S.sound)
            sfx('tap');
    },
    'to-games': () => $('#games').scrollIntoView({ behavior: 'smooth' }),
    juz: t => {
        S.scope = { juz: t.dataset.j, surah: '' };
        save();
        $('#scope-slot').innerHTML = scopeCard();
    },
    'juz-learn': t => {
        S.scope = { juz: t.dataset.j, surah: '' };
        save();
        renderLearn();
    },
    game: t => {
        sfx('tap');
        openLevelSheet(+t.dataset.g);
    },
    close: () => closeSheet(),
    'open-surah': t => {
        learnState.surah = +t.dataset.s;
        renderLearn();
        window.scrollTo({ top: 0 });
    },
    'learn-back': () => {
        stopAudio();
        studyToken++;
        learnState.surah = null;
        learnState.hij = false;
        learnState.taj = false;
        renderLearn();
    },
    'play-all': () => playList(SURAHS[learnState.surah].verses),
    'play-one': t => playList([vById(t.dataset.key)]),
    stop: () => {
        stopAudio();
        studyToken++;
        markNow(null);
    },
    repeat: t => {
        learnState.repeat = +t.dataset.r;
        renderLearn();
    },
    rate: t => {
        learnState.rate = +t.dataset.r;
        renderLearn();
    },
    cover: () => {
        learnState.cover = !learnState.cover;
        renderLearn();
    },
    reveal: t => {
        const a = t.closest('.ayat');
        if (a && a.classList.contains('cover'))
            a.classList.remove('cover');
    },
    mem: t => toggleMem(t.dataset.key),
    cert: () => openCert('main'),
    'cert-game': t => openCert('game', +t.dataset.g),
    print: () => window.print(),
    'load-data': () => loadFullData(),
    'dlg-yes': () => {
        const r = confirmRes;
        confirmRes = null;
        closeSheet();
        if (r)
            r(true);
    },
    'dlg-no': () => closeSheet(),
    arfont: t => {
        S.arFont = t.dataset.k;
        save();
        applyArabic();
        syncArabicUI();
        sfx('tap');
    },
    arsize: t => {
        S.arSize = +t.dataset.v;
        save();
        applyArabic();
        syncArabicUI();
        sfx('tap');
    },
    reset: async () => {
        if (await askConfirm({ title: 'Hapus semua progres?', text: 'Bintang, XP, stiker, lencana, dan hafalan akan dihapus. Jika kamu masuk akun, data di cloud ikut dihapus.', safe: 'Batal, jangan dihapus', risk: 'Ya, hapus semua' })) {
            const keep = { name: S.name, nameAt: Date.now(), scope: S.scope, sound: S.sound, arFont: S.arFont, arSize: S.arSize, qari: S.qari };
            S = Object.assign(defaults(), keep, { resetAt: Date.now() });
            save();
            cloudPushNow && cloudPushNow();
            updateHeader();
            nav('profile');
            toast('Progres sudah diatur ulang.');
        }
    }
};

document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (!t || t.disabled)
        return;
    const f = ACTIONS[t.dataset.act];
    if (f)
        f(t, e);
});

document.addEventListener('change', e => {
    if (e.target.classList && e.target.classList.contains('qari-sel')) {
        S.qari = e.target.value;
        save();
        $$('.qari-sel').forEach(x => {
            x.value = S.qari;
        });
        stopAudio();
        toast('🎙️ Qari: ' + (QARIS.find(q => q.id === S.qari) || {}).name);
        return;
    }
    if (e.target.id === 'surah-sel') {
        S.scope.surah = e.target.value;
        save();
        $('#scope-slot').innerHTML = scopeCard();
    }
});

document.addEventListener('input', e => {
    if (e.target.id === 'nm') {
        S.name = e.target.value.trim().slice(0, 30);
        S.nameAt = Date.now();
        save();
    }
});

$('#overlay').addEventListener('click', e => {
    if (e.target.id === 'overlay')
        closeSheet();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#overlay').classList.contains('hidden'))
        closeSheet();
});
