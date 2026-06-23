const { reasons } = JSON.parse(decodeURIComponent(escape(atob(REASONS_DATA))));
const freqMap = new Map(reasons.map(r => [r.frequency.toFixed(1), r]));

const messageEl = document.getElementById('message');
const msgTitle = document.getElementById('msg-title');
const msgText = document.getElementById('msg-text');
const journalLink = document.getElementById('journal-link');

function revealJournal() {
    if (!journalLink || journalLink.classList.contains('visible')) return;
    journalLink.classList.add('revealed');
    requestAnimationFrame(() => journalLink.classList.add('visible'));
}

const letterLink = document.getElementById('letter-link');
const LETTER_UNLOCK_FREQ = 23.6;
const LETTER_UNLOCK_KEY = 'tiny-radio-letter-unlocked';

function revealLetter(animate = true) {
    if (!letterLink || letterLink.classList.contains('visible')) return;
    letterLink.classList.add('revealed');
    if (animate) {
        requestAnimationFrame(() => letterLink.classList.add('visible'));
    } else {
        letterLink.classList.add('visible');
    }
    localStorage.setItem(LETTER_UNLOCK_KEY, '1');
}

function showMessage(title, text) {
    msgTitle.textContent = title;
    msgText.textContent = text;
    messageEl.classList.add('visible');
}

function hideMessage() {
    messageEl.classList.remove('visible');
}

const polaroidEl = document.getElementById('polaroid');
const polaroidImg = document.getElementById('polaroid-img');
const polaroidCaption = document.getElementById('polaroid-caption');
function showPolaroid(polaroid) {
    if (!polaroid || !polaroidEl) {
        if (polaroidEl) polaroidEl.classList.remove('visible');
        return;
    }
    polaroidImg.src = polaroid.image;
    polaroidCaption.textContent = polaroid.caption || '';
    polaroidEl.classList.add('visible');
}

polaroidEl.addEventListener('click', () => {
    polaroidEl.classList.remove('visible');
});

const FREQ_MIN = 1.0;
const FREQ_MAX = 135.0;
const STEP_BIG = 1.0;
const STEP_SMALL = 0.1;

const NEEDLE_PCT_MIN = 25.1932;
const NEEDLE_PCT_MAX = 74.9275;

const HOLD_DELAY = 400;
const HOLD_INTERVAL = 80;

let frequency = FREQ_MIN;
let holdTimer = null;
let holdRepeat = null;

const freqNumber = document.getElementById('freq-number');
const needle = document.getElementById('needle');
const bigKnob = document.getElementById('big-knob');
const smallKnob = document.getElementById('small-knob');

function setFrequency(val) {
    frequency = Math.round(Math.max(FREQ_MIN, Math.min(FREQ_MAX, val)) * 10) / 10;
    hideMessage();
    freqNumber.textContent = frequency.toFixed(1);
    const t = (frequency - FREQ_MIN) / (FREQ_MAX - FREQ_MIN);
    const pct = NEEDLE_PCT_MIN + t * (NEEDLE_PCT_MAX - NEEDLE_PCT_MIN);
    needle.style.setProperty('--needle-x', pct.toFixed(4) + '%');
    if (frequency === LETTER_UNLOCK_FREQ) revealLetter();
}

function step(delta) {
    const prev = frequency;
    setFrequency(frequency + delta);
    return frequency !== prev;
}

let bigKnobAngle = 0;
let smallKnobAngle = 0;

function rotateKnob(el, angleDelta) {
    if (el === bigKnob) bigKnobAngle += angleDelta;
    if (el === smallKnob) smallKnobAngle += angleDelta;
    if (bigKnob) bigKnob.style.transform = `rotate(${bigKnobAngle}deg)`;
    if (smallKnob) smallKnob.style.transform = `rotate(${smallKnobAngle}deg)`;
}

let activeZone = false;
let activeHeld = false;
let activeDelta = 0;
let activeKnob = null;

function startZone(delta, knob) {
    clearTimeout(holdTimer);
    clearInterval(holdRepeat);
    activeZone = true;
    activeHeld = false;
    activeDelta = delta;
    activeKnob = knob;
    const angleDelta = delta > 0 ? 30 : -30;

    holdTimer = setTimeout(() => {
        activeHeld = true;
        if (step(delta)) rotateKnob(knob, angleDelta);
        holdRepeat = setInterval(() => {
            if (step(delta)) rotateKnob(knob, angleDelta);
        }, HOLD_INTERVAL);
    }, HOLD_DELAY);
}

function endZone() {
    if (!activeZone) return;
    clearTimeout(holdTimer);
    clearInterval(holdRepeat);
    holdTimer = null;
    holdRepeat = null;
    if (!activeHeld) {
        const angleDelta = activeDelta > 0 ? 30 : -30;
        if (step(activeDelta)) rotateKnob(activeKnob, angleDelta);
    }
    activeZone = false;
}

function cancelZone() {
    clearTimeout(holdTimer);
    clearInterval(holdRepeat);
    holdTimer = null;
    holdRepeat = null;
    activeZone = false;
}

function bindZone(id, delta, knob) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startZone(delta, knob);
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
        e.preventDefault();
        endZone();
    });
    el.addEventListener('touchcancel', cancelZone);

    el.addEventListener('mousedown', () => startZone(delta, knob));
    el.addEventListener('mouseup', endZone);
}

document.addEventListener('mouseup', cancelZone);

document.addEventListener('DOMContentLoaded', () => {
    setFrequency(FREQ_MIN);
    if (getFound().size > 0) revealJournal();
    if (localStorage.getItem(LETTER_UNLOCK_KEY) === '1') revealLetter(false);

    bindZone('zone-big-back', -STEP_BIG, bigKnob);
    bindZone('zone-big-forward', +STEP_BIG, bigKnob);
    bindZone('zone-small-back', -STEP_SMALL, smallKnob);
    bindZone('zone-small-forward', +STEP_SMALL, smallKnob);

    document.querySelectorAll('.btn').forEach(btn => {
        const press = e => { e.preventDefault(); btn.classList.add('pressed'); };
        const release = () => btn.classList.remove('pressed');
        btn.addEventListener('mousedown', press);
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
        btn.addEventListener('touchend', release);
        btn.addEventListener('touchcancel', release);
    });

    const redBtn = document.getElementById('btn-red');
    const fireRedBtn = e => {
        e.preventDefault();
        const entry = freqMap.get(frequency.toFixed(1));
        if (!entry) return;
        showMessage(entry.title, entry.text);
        addFound(entry.id);
        revealJournal();
        showPolaroid(entry.polaroid);
    };
    redBtn.addEventListener('mousedown', fireRedBtn);
    redBtn.addEventListener('touchstart', fireRedBtn, { passive: false });
});