/* =====================================================================
   Firebase: login dan sinkronisasi cloud
   Login orang tua dan simpan progres di cloud. Aplikasi tetap jalan tanpa login.
   ===================================================================== */
'use strict';

/* =====================================================================
   FIREBASE  —  login orang tua + sinkronisasi progres (local-first)
   Aplikasi tetap berjalan penuh tanpa login. Isi konfigurasi di
   <script> "AYATPLAY_FIREBASE" pada bagian <head> untuk mengaktifkan.
   ===================================================================== */
const FB_CDN = 'https://www.gstatic.com/firebasejs/10.14.1/';
const FB_COL = 'ayatplayUsers';
const FB = { cfg: window.AYATPLAY_FIREBASE || {}, m: null, app: null, auth: null, db: null, user: null, status: 'off', msg: '', last: 0, unsub: null, timer: null, sig: '', deleting: false };
const fbConfigured = () => {
    const c = FB.cfg;
    return !!(c.apiKey && c.projectId && c.appId && !/^(ISI|YOUR)/i.test(c.apiKey));
};

const CLOUD_FIELDS = ['name', 'nameAt', 'xp', 'streak', 'best', 'last', 'today', 'prog', 'memorized', 'unmem', 'badges', 'played', 'listened', 'plays', 'resetAt'];
const pickFields = s => {
    const o = {};
    CLOUD_FIELDS.forEach(k => {
        if (s && s[k] !== undefined)
            o[k] = s[k];
    });
    return o;
};

const stable = o => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v);
const norm = x => {
    const o = defaults();
    Object.keys(x || {}).forEach(k => {
        if (x[k] !== undefined)
            o[k] = x[k];
    });
    return pickFields(o);
};

const sigOf = s => stable(norm(s));
const saveLocal = () => {
    try {
        localStorage.setItem(KEY, JSON.stringify(S));
    }
    catch (e) { }
};

/* Gabung dua progres tanpa menghilangkan kemajuan (hanya naik, bukan turun) */
function mergeStates(a, b) {
    if (!b)
        return norm(a);
    let A = norm(a), B = norm(b);
    const r = Math.max(A.resetAt || 0, B.resetAt || 0);
    const blank = x => Object.assign(norm({}), { resetAt: r, name: x.name, nameAt: x.nameAt });
    if ((A.resetAt || 0) < r)
        A = blank(A);
    if ((B.resetAt || 0) < r)
        B = blank(B);
    const o = { resetAt: r };
    o.name = (B.nameAt || 0) > (A.nameAt || 0) ? B.name : A.name;
    o.nameAt = Math.max(A.nameAt || 0, B.nameAt || 0);
    ['xp', 'best', 'listened', 'plays'].forEach(k => o[k] = Math.max(A[k] || 0, B[k] || 0));
    o.prog = {};
    new Set([...Object.keys(A.prog), ...Object.keys(B.prog)]).forEach(g => {
        const pa = A.prog[g] || {}, pb = B.prog[g] || {};
        o.prog[g] = {};
        new Set([...Object.keys(pa), ...Object.keys(pb)]).forEach(l => {
            o.prog[g][l] = Math.max(pa[l] || 0, pb[l] || 0);
        });
    });
    o.memorized = {};
    o.unmem = {};
    new Set([...Object.keys(A.memorized), ...Object.keys(B.memorized), ...Object.keys(A.unmem), ...Object.keys(B.unmem)]).forEach(k => {
        const m = Math.max(A.memorized[k] || 0, B.memorized[k] || 0), u = Math.max(A.unmem[k] || 0, B.unmem[k] || 0);
        if (m > u)
            o.memorized[k] = m;
        else if (u > 0)
            o.unmem[k] = u;
    });
    o.badges = Object.assign({}, B.badges, A.badges);
    Object.keys(B.badges).forEach(k => {
        if (A.badges[k] && B.badges[k] < A.badges[k])
            o.badges[k] = B.badges[k];
    });
    o.played = Object.assign({}, B.played, A.played);
    if ((B.last || '') > (A.last || '')) {
        o.streak = B.streak;
        o.last = B.last;
    }
    else if ((B.last || '') < (A.last || '')) {
        o.streak = A.streak;
        o.last = A.last;
    }
    else {
        o.streak = Math.max(A.streak || 0, B.streak || 0);
        o.last = A.last;
    }
    const ta = A.today || { date: '', rounds: 0 }, tb = B.today || { date: '', rounds: 0 };
    o.today = ta.date > tb.date ? ta : tb.date > ta.date ? tb : { date: ta.date, rounds: Math.max(ta.rounds || 0, tb.rounds || 0) };
    return o;
}

const FB_ERR = {
    'auth/invalid-email': 'Format email belum benar.', 'auth/missing-password': 'Kata sandi belum diisi.', 'auth/weak-password': 'Kata sandi terlalu pendek (minimal 6 karakter).',
    'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan tekan Masuk.', 'auth/invalid-credential': 'Email atau kata sandi belum cocok.', 'auth/wrong-password': 'Email atau kata sandi belum cocok.',
    'auth/user-not-found': 'Email ini belum terdaftar. Silakan tekan Daftar.', 'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
    'auth/network-request-failed': 'Tidak ada koneksi internet.', 'auth/popup-closed-by-user': 'Jendela masuk ditutup sebelum selesai.', 'auth/cancelled-popup-request': 'Jendela masuk ditutup sebelum selesai.',
    'auth/operation-not-allowed': 'Metode masuk ini belum diaktifkan di Firebase.', 'auth/unauthorized-domain': 'Domain situs ini belum didaftarkan di Firebase (Authorized domains).',
    'auth/popup-blocked': 'Pop-up diblokir browser. Izinkan pop-up lalu coba lagi.', 'permission-denied': 'Akses ditolak. Periksa aturan keamanan Firestore.', 'unavailable': 'Server sedang tidak terjangkau.',
    'auth/requires-recent-login': 'Demi keamanan, masuk ulang dulu lalu coba lagi.'
};

const cloudErr = e => FB_ERR[e && e.code] || ('Terjadi kendala: ' + ((e && e.code) || (e && e.message) || 'tidak diketahui'));

async function fbInit() {
    if (!fbConfigured() || FB.m) {
        cloudUI();
        return;
    }
    FB.status = 'loading';
    cloudUI();
    try {
        const [A, Au, Fs] = await Promise.all([import(FB_CDN + 'firebase-app.js'), import(FB_CDN + 'firebase-auth.js'), import(FB_CDN + 'firebase-firestore.js')]);
        FB.m = Object.assign({}, A, Au, Fs);
        FB.app = FB.m.initializeApp(FB.cfg);
        FB.auth = FB.m.getAuth(FB.app);
        FB.db = FB.m.getFirestore(FB.app);
        FB.m.onAuthStateChanged(FB.auth, onAuth);
    }
    catch (e) {
        FB.m = null;
        FB.status = 'error';
        FB.msg = 'Belum bisa terhubung ke Firebase. Progres tetap tersimpan di perangkat ini.';
        cloudUI();
    }
}

function onAuth(user) {
    FB.user = user;
    if (FB.unsub) {
        FB.unsub();
        FB.unsub = null;
    }
    if (!user) {
        FB.status = 'out';
        FB.msg = '';
        cloudUI();
        return;
    }
    FB.status = 'syncing';
    FB.msg = '';
    cloudUI();
    const ref = FB.m.doc(FB.db, FB_COL, user.uid);
    FB.unsub = FB.m.onSnapshot(ref, onRemote, e => {
        FB.status = 'error';
        FB.msg = cloudErr(e);
        cloudUI();
    });
}

function onRemote(snap) {
    if (FB.deleting || !FB.user)
        return;
    if (snap.metadata && snap.metadata.hasPendingWrites)
        return; // gema dari tulisan lokal kita sendiri
    const remote = snap.exists() ? snap.data() : null;
    const merged = mergeStates(S, remote);
    if (sigOf(merged) !== sigOf(S)) {
        CLOUD_FIELDS.forEach(k => {
            S[k] = merged[k];
        });
        saveLocal();
        updateHeader();
        softRender();
    }
    FB.sig = remote ? sigOf(remote) : '';
    if (sigOf(S) !== FB.sig)
        cloudPushNow();
    else {
        FB.status = 'ok';
        FB.last = Date.now();
        cloudUI();
    }
}

async function cloudPushNow() {
    if (!FB.user || !FB.m || FB.deleting)
        return;
    clearTimeout(FB.timer);
    try {
        FB.status = 'syncing';
        cloudUI();
        await FB.m.setDoc(FB.m.doc(FB.db, FB_COL, FB.user.uid), Object.assign({ v: 1, updatedAt: FB.m.serverTimestamp() }, norm(S)));
        FB.sig = sigOf(S);
        FB.status = 'ok';
        FB.last = Date.now();
        FB.msg = '';
    }
    catch (e) {
        FB.status = 'error';
        FB.msg = cloudErr(e);
    }
    cloudUI();
}

function cloudSchedule() {
    if (!FB.user || !FB.m || FB.deleting || sigOf(S) === FB.sig)
        return;
    clearTimeout(FB.timer);
    FB.timer = setTimeout(cloudPushNow, 2500);
}

function softRender() {
    const f = document.activeElement;
    if (f && /INPUT|SELECT/.test(f.tagName))
        return;
    if (curView === 'home')
        renderHome();
    else if (curView === 'badges')
        renderBadges();
    else if (curView === 'profile')
        renderProfile();
}

const cloudStatText = () => {
    if (FB.status === 'syncing' || FB.status === 'loading')
        return '🔄 Menyinkronkan…';
    if (FB.status === 'ok')
        return '✅ Tersimpan di cloud';
    if (FB.status === 'error')
        return '⚠️ ' + (FB.msg || 'Ada kendala.');
    return FB.msg ? ('ℹ️ ' + FB.msg) : '';
};

function cloudUI() {
    const h = $('#h-cloud');
    if (h) {
        h.classList.toggle('hidden', !fbConfigured());
        h.textContent = FB.status === 'error' ? '⚠️' : FB.status === 'syncing' || FB.status === 'loading' ? '🔄' : '☁️';
        h.style.filter = FB.user ? 'none' : 'grayscale(1)';
        h.title = FB.user ? 'Terhubung ke cloud' : 'Belum masuk akun';
    }
    if (curView !== 'profile')
        return;
    const slot = $('#cloud-slot');
    if (!slot)
        return;
    const f = document.activeElement;
    if (f && slot.contains(f) && /INPUT/.test(f.tagName) && slot.dataset.user === (FB.user ? FB.user.uid : '')) {
        const st = $('#cloud-stat');
        if (st)
            st.textContent = cloudStatText();
    }
    else {
        slot.dataset.user = FB.user ? FB.user.uid : '';
        slot.innerHTML = cloudCard();
    }
}

function cloudCard() {
    if (!fbConfigured())
        return '';
    const stat = `<div class="hint" id="cloud-stat" role="status" style="text-align:left">${esc(cloudStatText())}</div>`;
    if (FB.user) {
        return `<div class="card" style="margin-top:16px;display:grid;gap:10px"><h3>☁️ Terhubung ke cloud</h3>
      <div style="font-weight:800">👤 ${esc(FB.user.email || FB.user.displayName || 'Akun')}</div>
      <p class="muted small">Bintang, XP, lencana, dan hafalanmu otomatis tersimpan dan bisa dibuka di HP atau tablet lain.</p>${stat}
      <div class="row"><button class="btn btn-mint btn-sm" data-act="fb-sync">🔄 Sinkronkan sekarang</button><button class="btn btn-ghost btn-sm" data-act="fb-out">Keluar</button></div>
      <button class="btn btn-ghost btn-sm btn-danger" data-act="fb-del" style="justify-self:start">🗑️ Hapus akun & data cloud</button></div>`;
    }
    const loading = FB.status === 'loading';
    return `<div class="card" style="margin-top:16px;display:grid;gap:12px"><h3>☁️ Simpan progres di cloud</h3>
    <p class="muted small" style="margin:0">Untuk orang tua/wali: masuk agar progres anak aman dan bisa dibuka di perangkat lain. Tanpa masuk pun aplikasi tetap bisa dipakai.</p>
    <button class="btn btn-ghost btn-block" data-act="fb-google" ${loading ? 'disabled' : ''}>🔐 Masuk dengan Google</button>
    <div class="field"><label for="fb-email" style="font-weight:800">Email</label><input id="fb-email" type="email" autocomplete="email" inputmode="email" placeholder="nama@email.com"></div>
    <div class="field"><label for="fb-pw" style="font-weight:800">Kata sandi</label><input id="fb-pw" type="password" autocomplete="current-password" placeholder="Minimal 6 karakter"></div>
    <div class="row"><button class="btn btn-mint" data-act="fb-in" ${loading ? 'disabled' : ''}>Masuk</button><button class="btn btn-sun" data-act="fb-up" ${loading ? 'disabled' : ''}>Daftar baru</button><button class="btn btn-ghost btn-sm" data-act="fb-reset">Lupa kata sandi?</button></div>
    ${stat}
    <p class="muted small" style="margin:0">Yang disimpan hanya nama panggilan, bintang, XP, lencana, dan hafalan. Gunakan nama panggilan, bukan nama lengkap anak.</p></div>`;
}

const fbSay = m => {
    FB.msg = m;
    const st = $('#cloud-stat');
    if (st)
        st.textContent = 'ℹ️ ' + m;
};

async function fbGuard(fn) {
    if (!FB.m) {
        await fbInit();
    }
    if (!FB.m) {
        fbSay('Belum bisa terhubung ke Firebase. Cek koneksi internet.');
        return;
    }
    try {
        await fn();
    }
    catch (e) {
        fbSay(cloudErr(e));
    }
}

Object.assign(ACTIONS, {
    'fb-google': () => fbGuard(() => FB.m.signInWithPopup(FB.auth, new FB.m.GoogleAuthProvider())),
    'fb-in': () => fbGuard(async () => {
        const e = $('#fb-email').value.trim(), p = $('#fb-pw').value;
        if (!e || !p)
            return fbSay('Isi email dan kata sandi dulu ya.');
        await FB.m.signInWithEmailAndPassword(FB.auth, e, p);
    }),
    'fb-up': () => fbGuard(async () => {
        const e = $('#fb-email').value.trim(), p = $('#fb-pw').value;
        if (!e || !p)
            return fbSay('Isi email dan kata sandi dulu ya.');
        await FB.m.createUserWithEmailAndPassword(FB.auth, e, p);
    }),
    'fb-reset': () => fbGuard(async () => {
        const e = $('#fb-email').value.trim();
        if (!e)
            return fbSay('Tulis emailmu dulu, lalu tekan Lupa kata sandi.');
        await FB.m.sendPasswordResetEmail(FB.auth, e);
        fbSay('Tautan atur ulang kata sandi sudah dikirim ke emailmu.');
    }),
    'fb-sync': () => cloudPushNow(),
    'fb-out': () => fbGuard(async () => {
        await FB.m.signOut(FB.auth);
        toast('Kamu sudah keluar. Progres tetap ada di perangkat ini.');
    }),
    'fb-del': async () => {
        if (!FB.user || !(await askConfirm({ title: 'Hapus akun dan data cloud?', text: 'Akun dan semua data di cloud akan dihapus. Progres di perangkat ini tetap ada.', safe: 'Batal', risk: 'Ya, hapus akun' })))
            return;
        fbGuard(async () => {
            FB.deleting = true;
            if (FB.unsub) {
                FB.unsub();
                FB.unsub = null;
            }
            const ref = FB.m.doc(FB.db, FB_COL, FB.user.uid);
            try {
                await FB.m.deleteDoc(ref);
                await FB.m.deleteUser(FB.auth.currentUser);
                toast('Akun dan data cloud sudah dihapus.');
            }
            catch (e) {
                if (e && e.code === 'auth/requires-recent-login') {
                    await FB.m.signOut(FB.auth);
                    fbSay('Data cloud sudah dihapus. Untuk menghapus akunnya juga, masuk ulang lalu tekan Hapus lagi.');
                }
                else
                    throw e;
            }
            finally {
                FB.deleting = false;
            }
        });
    },
    install: async () => {
        if (!installEvt)
            return;
        installEvt.prompt();
        try {
            await installEvt.userChoice;
        }
        catch (e) { }
        installEvt = null;
        if (curView === 'profile')
            renderProfile();
    }
});

document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'fb-pw')
        ACTIONS['fb-in']();
});
