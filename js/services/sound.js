/* =====================================================================
   Efek suara dan konfeti
   Efek suara sederhana (Web Audio) dan animasi konfeti.
   ===================================================================== */
'use strict';

/* ---------- suara ---------- */
let AC = null;

function sfx(type) {
    if (!S.sound)
        return;
    try {
        AC = AC || new (window.AudioContext || window.webkitAudioContext)();
        if (AC.state === 'suspended')
            AC.resume();
        const t = AC.currentTime;
        const tone = (f, start, dur, wave = 'triangle', vol = .22, to = null) => {
            const o = AC.createOscillator(), g = AC.createGain();
            o.type = wave;
            o.frequency.setValueAtTime(f, t + start);
            if (to)
                o.frequency.exponentialRampToValueAtTime(to, t + start + dur);
            g.gain.setValueAtTime(vol, t + start);
            g.gain.exponentialRampToValueAtTime(.001, t + start + dur);
            o.connect(g);
            g.connect(AC.destination);
            o.start(t + start);
            o.stop(t + start + dur + .02);
        };
        if (type === 'correct') {
            tone(660, 0, .14);
            tone(880, .12, .22);
        }
        else if (type === 'wrong') {
            tone(260, 0, .22, 'sine', .2, 170);
        }
        else if (type === 'tap') {
            tone(520, 0, .06, 'sine', .12);
        }
        else if (type === 'win') {
            [523, 659, 784, 1046].forEach((f, i) => tone(f, i * .12, .25));
        }
        else if (type === 'star') {
            tone(880, 0, .18, 'sine');
            tone(1318, .1, .3, 'sine');
        }
    }
    catch (e) { }
}

const burst = (o = {}) => {
    if (window.confetti && !matchMedia('(prefers-reduced-motion: reduce)').matches)
        confetti(Object.assign({ particleCount: 110, spread: 75, origin: { y: .65 } }, o));
};
