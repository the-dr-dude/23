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
    freqNumber.textContent = frequency.toFixed(1);
    const t = (frequency - FREQ_MIN) / (FREQ_MAX - FREQ_MIN);
    const pct = NEEDLE_PCT_MIN + t * (NEEDLE_PCT_MAX - NEEDLE_PCT_MIN);
    needle.style.setProperty('--needle-x', pct.toFixed(4) + '%');
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

function startHold(delta, knob) {
    const angleDelta = delta > 0 ? 30 : -30;

    holdTimer = setTimeout(() => {
        if (step(delta)) rotateKnob(knob, angleDelta);
        holdRepeat = setInterval(() => {
            if (step(delta)) rotateKnob(knob, angleDelta);
        }, HOLD_INTERVAL);
    }, HOLD_DELAY);
}

function stopHold() {
    clearTimeout(holdTimer);
    clearInterval(holdRepeat);
    holdTimer = null;
    holdRepeat = null;
}

function bindZone(id, delta, knob) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHold(delta, knob);
    }, { passive: false });

    el.addEventListener('touchend', stopHold);
    el.addEventListener('touchcancel', stopHold);

    el.addEventListener('mousedown', () => startHold(delta, knob));
}

document.addEventListener('mouseup', stopHold);

document.addEventListener('DOMContentLoaded', () => {
    setFrequency(FREQ_MIN);

    bindZone('zone-big-back', -STEP_BIG, bigKnob);
    bindZone('zone-big-forward', +STEP_BIG, bigKnob);
    bindZone('zone-small-back', -STEP_SMALL, smallKnob);
    bindZone('zone-small-forward', +STEP_SMALL, smallKnob);
});
