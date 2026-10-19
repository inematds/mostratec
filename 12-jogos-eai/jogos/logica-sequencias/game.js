/*
 * Sequências Mágicas - Jogo Educativo de Lógica e Padrões
 * Para crianças de 6-7 anos (1º e 2º ano)
 * Canvas-based, responsivo, touch-friendly
 */

// ===================== SETUP =====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W, H, scale;
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    scale = Math.min(W / 800, H / 600);
}
window.addEventListener('resize', resize);
resize();

// ===================== AUDIO =====================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(freq, dur, type = 'sine', vol = 0.15) {
    try {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    } catch (e) {}
}

function sfxCorrect() {
    playTone(523, 0.12, 'sine', 0.18);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.18), 100);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.18), 200);
}
function sfxWrong() {
    playTone(200, 0.3, 'triangle', 0.12);
}
function sfxClick() {
    playTone(440, 0.06, 'sine', 0.1);
}
function sfxStar() {
    playTone(880, 0.08, 'sine', 0.12);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.12), 80);
}
function sfxLevelUp() {
    [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.18, 'sine', 0.15), i * 120);
    });
}

// ===================== STATE =====================
const STATE = {
    MENU: 0,
    PLAYING: 1,
    FEEDBACK: 2,
    LEVEL_COMPLETE: 3,
    GAME_OVER: 4
};

let state = STATE.MENU;
let difficulty = 0; // 0=fácil, 1=médio, 2=difícil
let currentRound = 0;
let totalRounds = 8;
let score = 0;
let stars = 0;
let streak = 0;
let currentPattern = null;
let choices = [];
let correctIndex = -1;
let selectedIndex = -1;
let feedbackTimer = 0;
let animTime = 0;
let particles = [];
let floatingTexts = [];
let bgStars = [];
let menuBounce = 0;

const difficultyNames = ['Fácil', 'Médio', 'Difícil'];
const difficultyColors = ['#4ade80', '#fbbf24', '#f87171'];
const encouragements = [
    'Muito bem!', 'Incrível!', 'Parabéns!', 'Excelente!',
    'Fantástico!', 'Boa!', 'Arrasou!', 'Que legal!',
    'Continue assim!', 'Mandou bem!', 'Perfeito!', 'Genial!'
];
const tryAgainMessages = [
    'Tente de novo!', 'Quase lá!', 'Não desista!', 'Você consegue!'
];

// ===================== BACKGROUND STARS =====================
function initBgStars() {
    bgStars = [];
    for (let i = 0; i < 60; i++) {
        bgStars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}
initBgStars();

function drawBackground() {
    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0d0d2b');
    grad.addColorStop(0.5, '#1a1a3e');
    grad.addColorStop(1, '#0d0d18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Twinkling stars
    bgStars.forEach(s => {
        s.twinkle += 0.02;
        s.y += s.speed;
        if (s.y > H + 5) { s.y = -5; s.x = Math.random() * W; }
        const alpha = 0.3 + 0.4 * Math.sin(s.twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
    });
}

// ===================== PARTICLES & EFFECTS =====================
function spawnConfetti(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            life: 1,
            decay: Math.random() * 0.015 + 0.008,
            color: ['#f472b6', '#60a5fa', '#4ade80', '#fbbf24', '#a78bfa', '#fb923c'][Math.floor(Math.random() * 6)],
            size: Math.random() * 6 + 3,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
        });
    }
}

function spawnStarBurst(x, y) {
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        particles.push({
            x, y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 1,
            decay: 0.02,
            color: '#fbbf24',
            size: 4,
            isStar: true,
            rotation: 0,
            rotSpeed: 0.1
        });
    }
}

function addFloatingText(text, x, y, color = '#fff', size = 32) {
    floatingTexts.push({ text, x, y, vy: -1.5, life: 1, decay: 0.012, color, size });
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
        return p.life > 0;
    });
    floatingTexts = floatingTexts.filter(ft => {
        ft.y += ft.vy;
        ft.life -= ft.decay;
        return ft.life > 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.isStar) {
            drawStarShape(0, 0, p.size, p.color);
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
    });
    floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.font = `bold ${ft.size * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    });
}

function drawStarShape(x, y, r, color) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const outerX = x + Math.cos(angle) * r;
        const outerY = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        const innerAngle = angle + Math.PI / 5;
        ctx.lineTo(x + Math.cos(innerAngle) * r * 0.4, y + Math.sin(innerAngle) * r * 0.4);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// ===================== PATTERN GENERATION =====================

// Color patterns
const COLORS = [
    { name: 'vermelho', hex: '#ef4444', emoji: '\u{1F534}' },
    { name: 'azul', hex: '#3b82f6', emoji: '\u{1F535}' },
    { name: 'verde', hex: '#22c55e', emoji: '\u{1F7E2}' },
    { name: 'amarelo', hex: '#eab308', emoji: '\u{1F7E1}' },
    { name: 'roxo', hex: '#a855f7', emoji: '\u{1F7E3}' },
    { name: 'laranja', hex: '#f97316', emoji: '\u{1F7E0}' }
];

// Shape emojis
const SHAPES = ['\u2B50', '\u{1F319}', '\u2764\uFE0F', '\u{1F4A0}', '\u{1F536}', '\u2B55'];

// Animal emojis
const ANIMALS = ['\u{1F431}', '\u{1F436}', '\u{1F430}', '\u{1F42D}', '\u{1F43B}', '\u{1F438}', '\u{1F427}', '\u{1F98B}'];

// Food emojis
const FOODS = ['\u{1F34E}', '\u{1F34C}', '\u{1F347}', '\u{1F353}', '\u{1F352}', '\u{1F34A}'];

// Nature emojis
const NATURE = ['\u{1F33B}', '\u{1F337}', '\u{1F333}', '\u{1F335}', '\u{1F340}', '\u{1F338}'];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickRandom(arr, n) {
    const shuffled = shuffle(arr);
    return shuffled.slice(0, n);
}

function generatePattern() {
    const patternTypes = [];

    if (difficulty === 0) {
        // Easy: simple AB, ABC patterns with emojis, colors
        patternTypes.push('emoji_ab', 'color_ab', 'shape_ab', 'animal_ab', 'size_ab');
    } else if (difficulty === 1) {
        // Medium: ABC patterns, number patterns, mixed
        patternTypes.push('emoji_abc', 'color_abc', 'number_simple', 'shape_abc', 'animal_abc', 'food_ab');
    } else {
        // Hard: ABBC, AABB, number skip, growing patterns
        patternTypes.push('emoji_abbc', 'number_skip', 'color_aabb', 'shape_abcd', 'number_growing', 'nature_abc');
    }

    const type = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    return buildPattern(type);
}

function buildPattern(type) {
    let sequence = [];
    let answer = null;
    let displayType = 'emoji'; // 'emoji', 'color', 'number', 'size'
    let wrongChoices = [];

    switch (type) {
        case 'emoji_ab': {
            const [a, b] = pickRandom([...SHAPES, ...ANIMALS], 2);
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push(i % 2 === 0 ? a : b);
            answer = len % 2 === 0 ? a : b;
            wrongChoices = pickRandom([...SHAPES, ...ANIMALS].filter(x => x !== answer), 2);
            break;
        }
        case 'color_ab': {
            const [a, b] = pickRandom(COLORS, 2);
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push(i % 2 === 0 ? a : b);
            answer = len % 2 === 0 ? a : b;
            displayType = 'color';
            wrongChoices = pickRandom(COLORS.filter(x => x.hex !== answer.hex), 2);
            break;
        }
        case 'shape_ab': {
            const [a, b] = pickRandom(SHAPES, 2);
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push(i % 2 === 0 ? a : b);
            answer = len % 2 === 0 ? a : b;
            wrongChoices = pickRandom(SHAPES.filter(x => x !== answer), 2);
            break;
        }
        case 'animal_ab': {
            const [a, b] = pickRandom(ANIMALS, 2);
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push(i % 2 === 0 ? a : b);
            answer = len % 2 === 0 ? a : b;
            wrongChoices = pickRandom(ANIMALS.filter(x => x !== answer), 2);
            break;
        }
        case 'size_ab': {
            const emoji = pickRandom(ANIMALS, 1)[0];
            const sizes = ['small', 'big'];
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push({ emoji, size: sizes[i % 2] });
            answer = { emoji, size: sizes[len % 2] };
            displayType = 'size';
            wrongChoices = [{ emoji, size: sizes[(len + 1) % 2] }, { emoji: pickRandom(ANIMALS.filter(x => x !== emoji), 1)[0], size: sizes[len % 2] }];
            break;
        }
        case 'emoji_abc': {
            const [a, b, c] = pickRandom([...SHAPES, ...ANIMALS], 3);
            const len = 7;
            const pat = [a, b, c];
            for (let i = 0; i < len; i++) sequence.push(pat[i % 3]);
            answer = pat[len % 3];
            wrongChoices = pickRandom([...SHAPES, ...ANIMALS].filter(x => x !== answer), 2);
            break;
        }
        case 'color_abc': {
            const [a, b, c] = pickRandom(COLORS, 3);
            const len = 7;
            const pat = [a, b, c];
            for (let i = 0; i < len; i++) sequence.push(pat[i % 3]);
            answer = pat[len % 3];
            displayType = 'color';
            wrongChoices = pickRandom(COLORS.filter(x => x.hex !== answer.hex), 2);
            break;
        }
        case 'shape_abc': {
            const [a, b, c] = pickRandom(SHAPES, 3);
            const len = 7;
            const pat = [a, b, c];
            for (let i = 0; i < len; i++) sequence.push(pat[i % 3]);
            answer = pat[len % 3];
            wrongChoices = pickRandom(SHAPES.filter(x => x !== answer), 2);
            break;
        }
        case 'animal_abc': {
            const [a, b, c] = pickRandom(ANIMALS, 3);
            const len = 7;
            const pat = [a, b, c];
            for (let i = 0; i < len; i++) sequence.push(pat[i % 3]);
            answer = pat[len % 3];
            wrongChoices = pickRandom(ANIMALS.filter(x => x !== answer), 2);
            break;
        }
        case 'food_ab': {
            const [a, b] = pickRandom(FOODS, 2);
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push(i % 2 === 0 ? a : b);
            answer = len % 2 === 0 ? a : b;
            wrongChoices = pickRandom(FOODS.filter(x => x !== answer), 2);
            break;
        }
        case 'number_simple': {
            const start = Math.floor(Math.random() * 5) + 1;
            const step = Math.floor(Math.random() * 2) + 1; // +1 or +2
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push(start + i * step);
            answer = start + len * step;
            displayType = 'number';
            wrongChoices = [answer + step, answer - step].filter(x => x > 0);
            if (wrongChoices.length < 2) wrongChoices.push(answer + step * 2);
            wrongChoices = wrongChoices.slice(0, 2);
            break;
        }
        case 'emoji_abbc': {
            const [a, b] = pickRandom([...SHAPES, ...ANIMALS], 2);
            // ABBA pattern
            const pat = [a, b, b, a];
            const len = 8;
            for (let i = 0; i < len; i++) sequence.push(pat[i % 4]);
            answer = pat[len % 4];
            wrongChoices = pickRandom([...SHAPES, ...ANIMALS].filter(x => x !== answer), 2);
            break;
        }
        case 'color_aabb': {
            const [a, b] = pickRandom(COLORS, 2);
            const pat = [a, a, b, b];
            const len = 8;
            for (let i = 0; i < len; i++) sequence.push(pat[i % 4]);
            answer = pat[len % 4];
            displayType = 'color';
            wrongChoices = pickRandom(COLORS.filter(x => x.hex !== answer.hex), 2);
            break;
        }
        case 'shape_abcd': {
            const [a, b, c, d] = pickRandom(SHAPES, 4);
            const pat = [a, b, c, d];
            const len = 9;
            for (let i = 0; i < len; i++) sequence.push(pat[i % 4]);
            answer = pat[len % 4];
            wrongChoices = pickRandom(SHAPES.filter(x => x !== answer), 2);
            break;
        }
        case 'number_skip': {
            const start = Math.floor(Math.random() * 3) + 2;
            const step = Math.floor(Math.random() * 3) + 2; // +2, +3, or +4
            const len = 5;
            for (let i = 0; i < len; i++) sequence.push(start + i * step);
            answer = start + len * step;
            displayType = 'number';
            wrongChoices = [answer + 1, answer - 1].filter(x => x > 0 && x !== answer);
            if (wrongChoices.length < 2) wrongChoices.push(answer + step);
            wrongChoices = wrongChoices.slice(0, 2);
            break;
        }
        case 'number_growing': {
            // 1, 2, 4, 7, 11 ... (difference grows)
            const diffs = [1, 2, 3, 4, 5];
            let val = 1;
            const len = 5;
            sequence.push(val);
            for (let i = 0; i < len - 1; i++) {
                val += diffs[i];
                sequence.push(val);
            }
            answer = val + diffs[len - 1];
            displayType = 'number';
            wrongChoices = [answer + 1, answer - 1];
            break;
        }
        case 'nature_abc': {
            const [a, b, c] = pickRandom(NATURE, 3);
            const len = 7;
            const pat = [a, b, c];
            for (let i = 0; i < len; i++) sequence.push(pat[i % 3]);
            answer = pat[len % 3];
            wrongChoices = pickRandom(NATURE.filter(x => x !== answer), 2);
            break;
        }
        default: {
            const [a, b] = pickRandom(SHAPES, 2);
            for (let i = 0; i < 5; i++) sequence.push(i % 2 === 0 ? a : b);
            answer = a;
            wrongChoices = pickRandom(SHAPES.filter(x => x !== answer), 2);
        }
    }

    // Build choices (shuffle answer among wrong choices)
    const allChoices = shuffle([answer, ...wrongChoices.slice(0, 2)]);
    const correctIdx = allChoices.indexOf(answer);

    return { sequence, answer, displayType, choices: allChoices, correctIndex: correctIdx, type };
}

// ===================== BUTTON MANAGEMENT =====================
let buttons = [];

function makeButton(x, y, w, h, label, color, action, meta = {}) {
    return { x, y, w, h, label, color, action, hovered: false, pressScale: 1, ...meta };
}

function isInside(bx, by, bw, bh, px, py) {
    return px >= bx && px <= bx + bw && py >= by && py <= by + bh;
}

function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawButton(btn) {
    ctx.save();
    const sc = btn.pressScale || 1;
    const cx = btn.x + btn.w / 2;
    const cy = btn.y + btn.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(sc, sc);
    ctx.translate(-cx, -cy);

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    drawRoundedRect(btn.x, btn.y, btn.w, btn.h, 16);
    ctx.fillStyle = btn.color;
    ctx.fill();

    // Highlight top edge
    ctx.shadowColor = 'transparent';
    drawRoundedRect(btn.x, btn.y, btn.w, btn.h * 0.5, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();

    // Border
    drawRoundedRect(btn.x, btn.y, btn.w, btn.h, 16);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    if (btn.displayType === 'color' && btn.choiceData) {
        // Draw colored circle
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(btn.w, btn.h) * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = btn.choiceData.hex;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    } else if (btn.displayType === 'size' && btn.choiceData) {
        const sz = btn.choiceData.size === 'big' ? 38 : 22;
        ctx.font = `${sz * scale}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.choiceData.emoji, cx, cy);
    } else {
        const fontSize = btn.fontSize || 28;
        ctx.font = `bold ${fontSize * scale}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
        ctx.fillStyle = btn.textColor || '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, cx, cy);
    }

    ctx.restore();
}

// ===================== GAME LOGIC =====================
function startGame(diff) {
    difficulty = diff;
    currentRound = 0;
    score = 0;
    stars = 0;
    streak = 0;
    state = STATE.PLAYING;
    totalRounds = difficulty === 0 ? 6 : difficulty === 1 ? 8 : 10;
    nextRound();
    sfxClick();
}

function nextRound() {
    currentRound++;
    if (currentRound > totalRounds) {
        state = STATE.GAME_OVER;
        sfxLevelUp();
        return;
    }
    currentPattern = generatePattern();
    choices = currentPattern.choices;
    correctIndex = currentPattern.correctIndex;
    selectedIndex = -1;
    buildChoiceButtons();
    state = STATE.PLAYING;
}

function buildChoiceButtons() {
    buttons = [];
    const btnW = Math.min(180 * scale, W * 0.28);
    const btnH = 80 * scale;
    const gap = 20 * scale;
    const totalW = choices.length * btnW + (choices.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const btnY = H * 0.72;

    choices.forEach((choice, i) => {
        const bx = startX + i * (btnW + gap);
        let label = '';
        let displayType = currentPattern.displayType;

        if (displayType === 'number') {
            label = String(choice);
        } else if (displayType === 'color') {
            label = choice.emoji;
        } else if (displayType === 'size') {
            label = choice.emoji;
        } else {
            label = String(choice);
        }

        const btn = makeButton(bx, btnY, btnW, btnH, label, '#374151', () => {
            selectAnswer(i);
        }, { choiceIndex: i, displayType, choiceData: choice, fontSize: displayType === 'number' ? 36 : 40 });
        buttons.push(btn);
    });

    // Back button (small, top-left)
    const backSize = 44 * scale;
    buttons.push(makeButton(10, 10, backSize, backSize, '\u2190', 'rgba(255,255,255,0.15)', () => {
        state = STATE.MENU;
        sfxClick();
    }, { fontSize: 24 }));
}

function selectAnswer(index) {
    if (state !== STATE.PLAYING || selectedIndex !== -1) return;
    ensureAudio();
    selectedIndex = index;

    if (index === correctIndex) {
        score += 10 * (difficulty + 1);
        streak++;
        if (streak >= 2) {
            stars++;
            sfxStar();
            spawnStarBurst(W / 2, H * 0.15);
            addFloatingText('\u2B50 +1', W / 2, H * 0.15, '#fbbf24', 36);
        }
        sfxCorrect();
        const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
        addFloatingText(msg, W / 2, H * 0.5, '#4ade80', 42);
        spawnConfetti(W / 2, H * 0.55, 40);
    } else {
        streak = 0;
        sfxWrong();
        const msg = tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)];
        addFloatingText(msg, W / 2, H * 0.5, '#f87171', 36);
    }

    state = STATE.FEEDBACK;
    feedbackTimer = 90; // frames
}

// ===================== DRAWING =====================

function drawSequence() {
    if (!currentPattern) return;
    const seq = currentPattern.sequence;
    const dispType = currentPattern.displayType;
    const itemCount = seq.length + 1; // +1 for the question mark
    const maxItemWidth = 70 * scale;
    const gap = 12 * scale;
    const totalW = itemCount * maxItemWidth + (itemCount - 1) * gap;
    const startX = (W - totalW) / 2;
    const seqY = H * 0.38;

    // Draw container background
    const pad = 20 * scale;
    drawRoundedRect(startX - pad, seqY - maxItemWidth / 2 - pad, totalW + pad * 2, maxItemWidth + pad * 2, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    seq.forEach((item, i) => {
        const cx = startX + i * (maxItemWidth + gap) + maxItemWidth / 2;
        const cy = seqY;
        const bounce = Math.sin(animTime * 2 + i * 0.5) * 3;

        ctx.save();
        ctx.translate(cx, cy + bounce);

        if (dispType === 'color') {
            // Draw colored circle
            const r = maxItemWidth * 0.35;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = item.hex;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 3;
            ctx.stroke();
        } else if (dispType === 'number') {
            ctx.font = `bold ${38 * scale}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = '#e0e7ff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(item), 0, 0);
        } else if (dispType === 'size') {
            const sz = item.size === 'big' ? 42 : 24;
            ctx.font = `${sz * scale}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.emoji, 0, 4);
        } else {
            ctx.font = `${38 * scale}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(item), 0, 4);
        }
        ctx.restore();
    });

    // Draw question mark for the missing item
    const qx = startX + seq.length * (maxItemWidth + gap) + maxItemWidth / 2;
    const qBounce = Math.sin(animTime * 3) * 5;
    const qScale = 1 + Math.sin(animTime * 4) * 0.08;
    ctx.save();
    ctx.translate(qx, seqY + qBounce);
    ctx.scale(qScale, qScale);

    // Question mark background
    ctx.beginPath();
    ctx.arc(0, 0, maxItemWidth * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 114, 182, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = `bold ${42 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = '#f472b6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 2);

    ctx.restore();
}

function drawHUD() {
    // Top bar
    const barH = 56 * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, W, barH);

    // Round counter
    ctx.font = `bold ${20 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Rodada ${currentRound}/${totalRounds}`, 70 * scale, barH / 2);

    // Stars
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fbbf24';
    ctx.font = `bold ${22 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillText(`\u2B50 ${stars}`, W - 20 * scale, barH / 2);

    // Score
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`${score} pts`, W - 90 * scale, barH / 2);

    // Difficulty indicator
    ctx.textAlign = 'center';
    ctx.fillStyle = difficultyColors[difficulty];
    ctx.font = `bold ${16 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillText(difficultyNames[difficulty], W / 2, barH / 2);

    // Progress bar
    const progW = W * 0.5;
    const progH = 6 * scale;
    const progX = (W - progW) / 2;
    const progY = barH - progH - 4;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    drawRoundedRect(progX, progY, progW, progH, progH / 2);
    ctx.fill();
    const progFill = (currentRound / totalRounds) * progW;
    ctx.fillStyle = difficultyColors[difficulty];
    drawRoundedRect(progX, progY, Math.max(progFill, progH), progH, progH / 2);
    ctx.fill();
}

function drawInstructions() {
    const y = H * 0.2;
    ctx.font = `bold ${28 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = '#e0e7ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O que vem depois?', W / 2, y);

    ctx.font = `${18 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Complete a sequência escolhendo a resposta certa!', W / 2, y + 34 * scale);
}

function drawChoiceFeedback() {
    if (state !== STATE.FEEDBACK || selectedIndex === -1) return;

    buttons.forEach(btn => {
        if (btn.choiceIndex === undefined) return;
        if (btn.choiceIndex === correctIndex) {
            // Green highlight for correct
            ctx.save();
            drawRoundedRect(btn.x - 4, btn.y - 4, btn.w + 8, btn.h + 8, 20);
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
        }
        if (btn.choiceIndex === selectedIndex && selectedIndex !== correctIndex) {
            // Red highlight for wrong selection
            ctx.save();
            drawRoundedRect(btn.x - 4, btn.y - 4, btn.w + 8, btn.h + 8, 20);
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 4;
            ctx.stroke();

            // X mark
            ctx.font = `bold ${30 * scale}px sans-serif`;
            ctx.fillStyle = '#f87171';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u2716', btn.x + btn.w / 2, btn.y - 16 * scale);
            ctx.restore();
        }
    });
}

// ===================== MENU =====================
function drawMenu() {
    // Title
    menuBounce += 0.03;
    const titleY = H * 0.18 + Math.sin(menuBounce) * 8;

    ctx.save();
    ctx.font = `bold ${48 * scale}px 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title glow
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#f472b6';
    ctx.fillText('\u2728 Sequências Mágicas \u2728', W / 2, titleY);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Subtitle
    ctx.font = `${20 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('Descubra o padrão e complete a sequência!', W / 2, titleY + 50 * scale);

    // Decorative emojis
    const decoY = titleY + 100 * scale;
    const decoEmojis = ['\u2B50', '\u{1F319}', '\u2764\uFE0F', '\u{1F431}', '\u{1F34E}', '\u{1F33B}'];
    const emojiSpacing = 60 * scale;
    const startEX = W / 2 - (decoEmojis.length - 1) * emojiSpacing / 2;
    ctx.font = `${30 * scale}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
    decoEmojis.forEach((em, i) => {
        const ex = startEX + i * emojiSpacing;
        const ey = decoY + Math.sin(animTime * 2 + i) * 8;
        ctx.fillText(em, ex, ey);
    });

    // Difficulty buttons
    buttons = [];
    const btnW = 220 * scale;
    const btnH = 70 * scale;
    const btnGap = 20 * scale;
    const totalBtnH = 3 * btnH + 2 * btnGap;
    const startBtnY = H * 0.48;

    const labels = [
        ['\u{1F7E2} Fácil', 'Padrões simples AB'],
        ['\u{1F7E1} Médio', 'Padrões ABC e números'],
        ['\u{1F534} Difícil', 'Padrões complexos']
    ];

    for (let i = 0; i < 3; i++) {
        const bx = (W - btnW) / 2;
        const by = startBtnY + i * (btnH + btnGap);
        const diffIdx = i;
        const btn = makeButton(bx, by, btnW, btnH, labels[i][0], difficultyColors[i] + '33', () => {
            startGame(diffIdx);
        }, { textColor: difficultyColors[i], fontSize: 26, subtitle: labels[i][1] });
        buttons.push(btn);
    }

    // Draw difficulty buttons with subtitles
    buttons.forEach(btn => {
        drawButton(btn);
        if (btn.subtitle) {
            ctx.font = `${13 * scale}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.textAlign = 'center';
            ctx.fillText(btn.subtitle, btn.x + btn.w / 2, btn.y + btn.h + 16 * scale);
        }
    });

    // Footer
    ctx.font = `${14 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('Para crianças de 6-7 anos \u2022 1º e 2º ano', W / 2, H - 30 * scale);
}

// ===================== GAME OVER SCREEN =====================
function drawGameOver() {
    // Dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);

    // Panel
    const panelW = Math.min(500 * scale, W * 0.85);
    const panelH = 380 * scale;
    const px = (W - panelW) / 2;
    const py = (H - panelH) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(244,114,182,0.3)';
    ctx.shadowBlur = 30;
    drawRoundedRect(px, py, panelW, panelH, 24);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(244,114,182,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Title
    const perfect = score >= totalRounds * 10 * (difficulty + 1);
    ctx.font = `bold ${36 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = perfect ? '#fbbf24' : '#f472b6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(perfect ? '\u{1F3C6} Perfeito!' : '\u{1F389} Parabéns!', W / 2, py + 55 * scale);

    // Stats
    ctx.font = `${22 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = '#e0e7ff';
    const statsY = py + 110 * scale;
    const lineH = 40 * scale;
    ctx.fillText(`Pontuação: ${score}`, W / 2, statsY);
    ctx.fillText(`Estrelas: \u2B50 ${stars}`, W / 2, statsY + lineH);
    ctx.fillText(`Nível: ${difficultyNames[difficulty]}`, W / 2, statsY + lineH * 2);

    // Stars display
    const maxStars = 3;
    const earnedStars = Math.min(3, Math.ceil(stars / 2));
    const starSize = 30 * scale;
    const starGap = 50 * scale;
    const starsStartX = W / 2 - (maxStars - 1) * starGap / 2;
    const starsY = statsY + lineH * 3 + 10 * scale;

    for (let i = 0; i < maxStars; i++) {
        const sx = starsStartX + i * starGap;
        if (i < earnedStars) {
            drawStarShape(sx, starsY, starSize, '#fbbf24');
        } else {
            drawStarShape(sx, starsY, starSize, 'rgba(255,255,255,0.15)');
        }
    }

    // Buttons
    buttons = [];
    const bw = 180 * scale;
    const bh = 55 * scale;
    const gap = 20 * scale;

    buttons.push(makeButton(W / 2 - bw - gap / 2, py + panelH - 80 * scale, bw, bh, '\u{1F504} Jogar Novamente', '#6366f1', () => {
        startGame(difficulty);
    }, { fontSize: 18 }));

    buttons.push(makeButton(W / 2 + gap / 2, py + panelH - 80 * scale, bw, bh, '\u{1F3E0} Menu', '#374151', () => {
        state = STATE.MENU;
        sfxClick();
    }, { fontSize: 18 }));

    buttons.forEach(drawButton);
}

// ===================== INPUT =====================
function handleInput(x, y) {
    buttons.forEach(btn => {
        if (isInside(btn.x, btn.y, btn.w, btn.h, x, y)) {
            btn.pressScale = 0.92;
            setTimeout(() => { btn.pressScale = 1; }, 100);
            if (btn.action) btn.action();
        }
    });
}

canvas.addEventListener('click', e => {
    handleInput(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY);
}, { passive: false });

// Hover effect for desktop
canvas.addEventListener('mousemove', e => {
    let cursor = 'default';
    buttons.forEach(btn => {
        btn.hovered = isInside(btn.x, btn.y, btn.w, btn.h, e.clientX, e.clientY);
        if (btn.hovered) cursor = 'pointer';
    });
    canvas.style.cursor = cursor;
});

// ===================== MAIN LOOP =====================
let lastTime = 0;

function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    animTime += dt;

    resize();

    drawBackground();
    updateParticles();

    switch (state) {
        case STATE.MENU:
            drawMenu();
            break;

        case STATE.PLAYING:
            drawHUD();
            drawInstructions();
            drawSequence();
            buttons.forEach(drawButton);
            break;

        case STATE.FEEDBACK:
            drawHUD();
            drawInstructions();
            drawSequence();
            buttons.forEach(drawButton);
            drawChoiceFeedback();

            feedbackTimer--;
            if (feedbackTimer <= 0) {
                nextRound();
            }
            break;

        case STATE.GAME_OVER:
            drawHUD();
            drawGameOver();
            break;
    }

    drawParticles();

    requestAnimationFrame(gameLoop);
}

// ===================== INIT =====================
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    setTimeout(() => {
        loading.style.display = 'none';
        initBgStars();
        requestAnimationFrame(gameLoop);
    }, 800);
});
