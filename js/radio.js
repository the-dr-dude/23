// ── constants ──────────────────────────────────────────────
const FREQ_MIN = 1.0;
const FREQ_MAX = 135.0;
const STEP_BIG = 1.0;   // big knob
const STEP_SMALL = 0.1;  // small knob

const HOLD_DELAY = 400;  // ms before repeat starts
const HOLD_INTERVAL = 80;   // ms between repeats while holding

// ── state ──────────────────────────────────────────────────
let frequency = FREQ_MIN;
let holdTimer = null;
let holdRepeat = null;

// ── elements ───────────────────────────────────────────────
const freqNumber = document.getElementById('freq-number');
const bigKnob = document.getElementById('big-knob');
const smallKnob = document.getElementById('small-knob');

// ── frequency logic ────────────────────────────────────────
function setFrequency(val) {
    frequency = Math.round(Math.max(FREQ_MIN, Math.min(FREQ_MAX, val)) * 10) / 10;
    freqNumber.textContent = frequency.toFixed(1);
}

function step(delta) {
    setFrequency(frequency + delta);
}

// ── knob visual rotation ───────────────────────────────────
let bigKnobAngle = 0;
let smallKnobAngle = 0;

function rotateKnob(el, angleDelta) {
    if (el === bigKnob) bigKnobAngle += angleDelta;
    if (el === smallKnob) smallKnobAngle += angleDelta;
    bigKnob.style.transform = `rotate(${bigKnobAngle}deg)`;
    smallKnob.style.transform = `rotate(${smallKnobAngle}deg)`;
}

// ── hold to repeat ─────────────────────────────────────────
function startHold(delta, knob) {
    const angleDelta = delta > 0 ? 30 : -30;
    step(delta);
    rotateKnob(knob, angleDelta);

    holdTimer = setTimeout(() => {
        holdRepeat = setInterval(() => {
            step(delta);
            rotateKnob(knob, angleDelta);
        }, HOLD_INTERVAL);
    }, HOLD_DELAY);
}

function stopHold() {
    clearTimeout(holdTimer);
    clearInterval(holdRepeat);
    holdTimer = null;
    holdRepeat = null;
}

// Zones are divs overlaid on the radio container
// upper-left:  big back    upper-right: big forward
// lower-left:  small back  lower-right: small forward

function bindZone(id, delta, knob) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHold(delta, knob);
    }, { passive: false });

    el.addEventListener('touchend', stopHold);
    el.addEventListener('touchcancel', stopHold);

    // mouse support for desktop testing
    el.addEventListener('mousedown', () => startHold(delta, knob));
    el.addEventListener('mouseup', stopHold);
    el.addEventListener('mouseleave', stopHold);
}

// init
document.addEventListener('DOMContentLoaded', () => {
    setFrequency(FREQ_MIN);

    bindZone('zone-big-back', -STEP_BIG, bigKnob);
    bindZone('zone-big-forward', +STEP_BIG, bigKnob);
    bindZone('zone-small-back', -STEP_SMALL, smallKnob);
    bindZone('zone-small-forward', +STEP_SMALL, smallKnob);
});