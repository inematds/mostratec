// ============================================================
// Geometria Aventura - Jogo Educativo de Geometria (6o-9o ano)
// ============================================================

(function () {
    'use strict';

    // --- Canvas Setup ---
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

    // --- Audio ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
    }

    function playSound(type) {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523, now);
            osc.frequency.setValueAtTime(659, now + 0.1);
            osc.frequency.setValueAtTime(784, now + 0.2);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.setValueAtTime(150, now + 0.15);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'levelup') {
            osc.type = 'sine';
            [523, 659, 784, 1047].forEach((f, i) => {
                osc.frequency.setValueAtTime(f, now + i * 0.12);
            });
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth';
            [400, 350, 300, 200].forEach((f, i) => {
                osc.frequency.setValueAtTime(f, now + i * 0.2);
            });
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
            osc.start(now);
            osc.stop(now + 0.9);
        }
    }

    // --- Particles ---
    let particles = [];

    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.015 + Math.random() * 0.025,
                size: 2 + Math.random() * 4,
                color
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.life -= p.decay;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        for (const p of particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // --- Stars background ---
    const stars = [];
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            size: 0.5 + Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 1.2
        });
    }

    function drawStars(time) {
        for (const s of stars) {
            const alpha = 0.3 + 0.4 * Math.sin(s.twinkle + time * s.speed);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // --- Game State ---
    const STATE = { MENU: 0, PLAYING: 1, FEEDBACK: 2, LEVEL_COMPLETE: 3, GAME_OVER: 4, VICTORY: 5 };
    let state = STATE.MENU;
    let currentLevel = 0;
    let currentQuestion = 0;
    let score = 0;
    let lives = 3;
    let streak = 0;
    let bestStreak = 0;
    let selectedAnswer = -1;
    let feedbackTimer = 0;
    let correctAnswer = -1;
    let questions = [];
    let animTime = 0;
    let hoverButton = -1;

    // --- Buttons ---
    let buttons = [];

    // --- Utility ---
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function roundTo(n, d) {
        const f = Math.pow(10, d);
        return Math.round(n * f) / f;
    }

    // --- Shape Drawing Helpers ---
    function drawGrid(cx, cy, size) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        const step = size / 5;
        for (let i = -5; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - size, cy + i * step);
            ctx.lineTo(cx + size, cy + i * step);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + i * step, cy - size);
            ctx.lineTo(cx + i * step, cy + size);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawLabel(text, x, y, color, fontSize) {
        ctx.save();
        ctx.fillStyle = color || '#fff';
        ctx.font = `bold ${fontSize || 14 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function drawMeasurementLine(x1, y1, x2, y2, label, color) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = color || '#ffdd57';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ctx.fillStyle = '#111';
        ctx.fillRect(mx - 20, my - 10, 40, 20);
        drawLabel(label, mx, my, color || '#ffdd57', 13 * scale);
        ctx.restore();
    }

    function drawRightAngleMark(x, y, size, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation || 0);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.stroke();
        ctx.restore();
    }

    // --- Level 1: Identify shapes, sides, vertices, angles (6o ano) ---
    function generateLevel1() {
        const pool = [];

        // Q1: Identify shape
        pool.push({
            question: 'Qual e o nome desta forma geometrica?',
            draw: function (cx, cy, sz) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cx, cy - sz);
                ctx.lineTo(cx + sz, cy + sz * 0.7);
                ctx.lineTo(cx - sz, cy + sz * 0.7);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(56,189,248,0.12)';
                ctx.fill();
            },
            options: ['Triangulo', 'Quadrado', 'Pentagono', 'Hexagono'],
            correct: 0
        });

        // Q2: Count sides of hexagon
        pool.push({
            question: 'Quantos lados tem esta forma?',
            draw: function (cx, cy, sz) {
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    const x = cx + sz * Math.cos(angle);
                    const y = cy + sz * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(167,139,250,0.12)';
                ctx.fill();
            },
            options: ['5', '6', '7', '8'],
            correct: 1
        });

        // Q3: Count vertices of pentagon
        pool.push({
            question: 'Quantos vertices tem este pentagono?',
            draw: function (cx, cy, sz) {
                ctx.strokeStyle = '#fb923c';
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const x = cx + sz * Math.cos(angle);
                    const y = cy + sz * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(251,146,60,0.12)';
                ctx.fill();
                // Mark vertices
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const x = cx + sz * Math.cos(angle);
                    const y = cy + sz * Math.sin(angle);
                    ctx.fillStyle = '#fb923c';
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            options: ['3', '4', '5', '6'],
            correct: 2
        });

        // Q4: Identify angle type (right angle)
        pool.push({
            question: 'Que tipo de angulo e este?',
            draw: function (cx, cy, sz) {
                const len = sz * 1.2;
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cx - len * 0.5, cy);
                ctx.lineTo(cx, cy);
                ctx.lineTo(cx, cy - len * 0.8);
                ctx.stroke();
                drawRightAngleMark(cx, cy, 15 * scale, -Math.PI / 2);
                drawLabel('90\u00b0', cx + 22 * scale, cy - 18 * scale, '#4ade80', 16 * scale);
            },
            options: ['Agudo', 'Reto', 'Obtuso', 'Raso'],
            correct: 1
        });

        // Q5: Identify acute angle
        pool.push({
            question: 'Que tipo de angulo e este?',
            draw: function (cx, cy, sz) {
                const len = sz * 1.2;
                ctx.strokeStyle = '#f472b6';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cx - len * 0.2, cy + len * 0.2);
                ctx.lineTo(cx, cy);
                ctx.lineTo(cx + len * 0.5, cy - len * 0.1);
                ctx.stroke();
                // Arc
                ctx.beginPath();
                ctx.strokeStyle = '#f472b6';
                ctx.arc(cx, cy, 25 * scale, -Math.PI * 0.06, -Math.PI * 0.75, true);
                ctx.stroke();
                drawLabel('45\u00b0', cx - 10 * scale, cy - 30 * scale, '#f472b6', 16 * scale);
            },
            options: ['Agudo', 'Reto', 'Obtuso', 'Raso'],
            correct: 0
        });

        // Q6: Identify obtuse angle
        pool.push({
            question: 'Que tipo de angulo e este?',
            draw: function (cx, cy, sz) {
                const len = sz * 1.0;
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cx + len * 0.5, cy + len * 0.3);
                ctx.lineTo(cx, cy);
                ctx.lineTo(cx - len * 0.5, cy - len * 0.15);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cx, cy, 22 * scale, -Math.PI + 0.3, 0.54);
                ctx.strokeStyle = '#facc15';
                ctx.stroke();
                drawLabel('120\u00b0', cx + 5 * scale, cy - 28 * scale, '#facc15', 16 * scale);
            },
            options: ['Agudo', 'Reto', 'Obtuso', 'Raso'],
            correct: 2
        });

        // Q7: Identify shape - square
        pool.push({
            question: 'Qual e o nome desta forma geometrica?',
            draw: function (cx, cy, sz) {
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 3;
                ctx.strokeRect(cx - sz * 0.7, cy - sz * 0.7, sz * 1.4, sz * 1.4);
                ctx.fillStyle = 'rgba(34,211,238,0.1)';
                ctx.fillRect(cx - sz * 0.7, cy - sz * 0.7, sz * 1.4, sz * 1.4);
                drawRightAngleMark(cx - sz * 0.7, cy + sz * 0.7, 12 * scale, -Math.PI / 2);
            },
            options: ['Retangulo', 'Quadrado', 'Losango', 'Trapezio'],
            correct: 1
        });

        return shuffle(pool).slice(0, 5);
    }

    // --- Level 2: Perimeter & Area (7o ano) ---
    function generateLevel2() {
        const pool = [];

        // Rectangle area
        const rw = 4 + Math.floor(Math.random() * 5);
        const rh = 3 + Math.floor(Math.random() * 4);
        pool.push({
            question: `Qual e a area deste retangulo?`,
            draw: function (cx, cy, sz) {
                const w = sz * 1.6, h = sz * 1.0;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.strokeRect(x0, y0, w, h);
                ctx.fillStyle = 'rgba(56,189,248,0.1)';
                ctx.fillRect(x0, y0, w, h);
                drawMeasurementLine(x0, y0 + h + 15, x0 + w, y0 + h + 15, `${rw} cm`, '#ffdd57');
                drawMeasurementLine(x0 - 15, y0, x0 - 15, y0 + h, `${rh} cm`, '#ffdd57');
            },
            options: [`${rw * rh} cm\u00b2`, `${(rw + rh) * 2} cm\u00b2`, `${rw * rh + rw} cm\u00b2`, `${rw * rh - 2} cm\u00b2`],
            correct: 0
        });

        // Rectangle perimeter
        const pw = 5 + Math.floor(Math.random() * 4);
        const ph = 3 + Math.floor(Math.random() * 3);
        const perim = (pw + ph) * 2;
        pool.push({
            question: `Qual e o perimetro deste retangulo?`,
            draw: function (cx, cy, sz) {
                const w = sz * 1.5, h = sz * 0.9;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 3;
                ctx.strokeRect(x0, y0, w, h);
                ctx.fillStyle = 'rgba(167,139,250,0.1)';
                ctx.fillRect(x0, y0, w, h);
                drawMeasurementLine(x0, y0 + h + 15, x0 + w, y0 + h + 15, `${pw} cm`, '#ffdd57');
                drawMeasurementLine(x0 + w + 15, y0, x0 + w + 15, y0 + h, `${ph} cm`, '#ffdd57');
            },
            options: [`${perim} cm`, `${perim + 2} cm`, `${perim - 4} cm`, `${pw * ph} cm`],
            correct: 0
        });

        // Triangle area
        const tb = 6 + Math.floor(Math.random() * 4);
        const th = 4 + Math.floor(Math.random() * 4);
        const tArea = roundTo(tb * th / 2, 1);
        pool.push({
            question: `Qual e a area deste triangulo?`,
            draw: function (cx, cy, sz) {
                const bw = sz * 1.4, bh = sz * 1.1;
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cx, cy - bh / 2);
                ctx.lineTo(cx + bw / 2, cy + bh / 2);
                ctx.lineTo(cx - bw / 2, cy + bh / 2);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(74,222,128,0.1)';
                ctx.fill();
                // Height dashed
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.moveTo(cx, cy - bh / 2);
                ctx.lineTo(cx, cy + bh / 2);
                ctx.stroke();
                ctx.setLineDash([]);
                drawLabel(`h=${th} cm`, cx + 35 * scale, cy, '#ff6b6b', 13 * scale);
                drawMeasurementLine(cx - bw / 2, cy + bh / 2 + 18, cx + bw / 2, cy + bh / 2 + 18, `b=${tb} cm`, '#ffdd57');
            },
            options: [`${tArea} cm\u00b2`, `${tb * th} cm\u00b2`, `${tArea + 3} cm\u00b2`, `${tArea - 2} cm\u00b2`],
            correct: 0
        });

        // Circle area
        const cr = 3 + Math.floor(Math.random() * 5);
        const cArea = roundTo(Math.PI * cr * cr, 1);
        pool.push({
            question: `Qual e a area deste circulo? (use \u03c0 \u2248 3.14)`,
            draw: function (cx, cy, sz) {
                ctx.strokeStyle = '#f472b6';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, sz * 0.8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(244,114,182,0.1)';
                ctx.fill();
                // Radius line
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = '#ffdd57';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + sz * 0.8, cy);
                ctx.stroke();
                ctx.setLineDash([]);
                drawLabel(`r=${cr} cm`, cx + sz * 0.4, cy - 14 * scale, '#ffdd57', 13 * scale);
                ctx.fillStyle = '#f472b6';
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fill();
            },
            options: [
                `${roundTo(3.14 * cr * cr, 1)} cm\u00b2`,
                `${roundTo(3.14 * cr * 2, 1)} cm\u00b2`,
                `${roundTo(3.14 * cr * cr + 5, 1)} cm\u00b2`,
                `${roundTo(2 * 3.14 * cr, 1)} cm\u00b2`
            ],
            correct: 0
        });

        // Circle circumference
        const cr2 = 2 + Math.floor(Math.random() * 6);
        const circ = roundTo(2 * 3.14 * cr2, 1);
        pool.push({
            question: `Qual e o comprimento (perimetro) deste circulo? (use \u03c0 \u2248 3.14)`,
            draw: function (cx, cy, sz) {
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, sz * 0.8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(34,211,238,0.08)';
                ctx.fill();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = '#ffdd57';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + sz * 0.8, cy);
                ctx.stroke();
                ctx.setLineDash([]);
                drawLabel(`r=${cr2} cm`, cx + sz * 0.4, cy - 14 * scale, '#ffdd57', 13 * scale);
            },
            options: [
                `${circ} cm`,
                `${roundTo(3.14 * cr2 * cr2, 1)} cm`,
                `${roundTo(circ + 6.28, 1)} cm`,
                `${roundTo(circ / 2, 1)} cm`
            ],
            correct: 0
        });

        // Square perimeter
        const sl = 5 + Math.floor(Math.random() * 5);
        pool.push({
            question: `Qual e o perimetro deste quadrado?`,
            draw: function (cx, cy, sz) {
                const s = sz * 1.2;
                ctx.strokeStyle = '#fb923c';
                ctx.lineWidth = 3;
                ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
                ctx.fillStyle = 'rgba(251,146,60,0.1)';
                ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
                drawMeasurementLine(cx - s / 2, cy + s / 2 + 15, cx + s / 2, cy + s / 2 + 15, `${sl} cm`, '#ffdd57');
            },
            options: [`${sl * 4} cm`, `${sl * sl} cm`, `${sl * 2} cm`, `${sl * 3} cm`],
            correct: 0
        });

        return shuffle(pool).slice(0, 5);
    }

    // --- Level 3: Pythagorean Theorem, Similarity (8o ano) ---
    function generateLevel3() {
        const pool = [];

        // Pythagorean: find hypotenuse
        const a1 = 3, b1 = 4;
        const hyp1 = 5;
        pool.push({
            question: `Qual e o valor da hipotenusa? (Teorema de Pitagoras)`,
            draw: function (cx, cy, sz) {
                const w = sz * 1.3, h = sz * 1.0;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + h);
                ctx.lineTo(x0 + w, y0 + h);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(56,189,248,0.08)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + h, 12 * scale, -Math.PI / 2);
                drawLabel(`${a1} cm`, x0 - 25 * scale, y0 + h / 2, '#ffdd57', 14 * scale);
                drawLabel(`${b1} cm`, x0 + w / 2, y0 + h + 22 * scale, '#ffdd57', 14 * scale);
                drawLabel('?', cx + 15 * scale, cy - 5 * scale, '#ff6b6b', 18 * scale);
            },
            options: [`${hyp1} cm`, '6 cm', '7 cm', '4.5 cm'],
            correct: 0
        });

        // Pythagorean: find leg
        const a2 = 5, c2 = 13;
        const b2 = 12;
        pool.push({
            question: `Qual e o valor do cateto desconhecido?`,
            draw: function (cx, cy, sz) {
                const w = sz * 1.4, h = sz * 0.7;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + h);
                ctx.lineTo(x0 + w, y0 + h);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(167,139,250,0.08)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + h, 12 * scale, -Math.PI / 2);
                drawLabel(`${a2} cm`, x0 - 28 * scale, y0 + h / 2, '#ffdd57', 14 * scale);
                drawLabel('?', x0 + w / 2, y0 + h + 22 * scale, '#ff6b6b', 18 * scale);
                drawLabel(`${c2} cm`, cx + 18 * scale, cy - 8 * scale, '#ffdd57', 14 * scale);
            },
            options: [`${b2} cm`, '10 cm', '11 cm', '8 cm'],
            correct: 0
        });

        // Pythagorean: 6,8,?
        pool.push({
            question: 'Um triangulo retangulo tem catetos 6 cm e 8 cm. Qual e a hipotenusa?',
            draw: function (cx, cy, sz) {
                const w = sz * 1.3, h = sz * 1.0;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + h);
                ctx.lineTo(x0 + w, y0 + h);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(74,222,128,0.08)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + h, 12 * scale, -Math.PI / 2);
                drawLabel('6 cm', x0 - 28 * scale, y0 + h / 2, '#ffdd57', 14 * scale);
                drawLabel('8 cm', x0 + w / 2, y0 + h + 22 * scale, '#ffdd57', 14 * scale);
                drawLabel('?', cx + 15 * scale, cy - 5 * scale, '#ff6b6b', 18 * scale);
            },
            options: ['10 cm', '14 cm', '12 cm', '9 cm'],
            correct: 0
        });

        // Similarity: proportional sides
        pool.push({
            question: 'Triangulos semelhantes: se um lado mede 4 e o correspondente mede 8, e outro lado mede 6, qual o correspondente?',
            draw: function (cx, cy, sz) {
                // Small triangle
                const s = sz * 0.5;
                const ox = cx - sz * 0.7;
                ctx.strokeStyle = '#f472b6';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(ox, cy + s * 0.5);
                ctx.lineTo(ox + s, cy + s * 0.5);
                ctx.lineTo(ox + s * 0.5, cy - s * 0.5);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(244,114,182,0.1)';
                ctx.fill();
                drawLabel('4', ox + s / 2, cy + s * 0.5 + 16 * scale, '#ffdd57', 13 * scale);
                drawLabel('6', ox - 12 * scale, cy, '#ffdd57', 13 * scale);
                // Large triangle
                const l = sz * 1.0;
                const ox2 = cx + sz * 0.2;
                ctx.strokeStyle = '#f472b6';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(ox2, cy + l * 0.5);
                ctx.lineTo(ox2 + l, cy + l * 0.5);
                ctx.lineTo(ox2 + l * 0.5, cy - l * 0.5);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(244,114,182,0.05)';
                ctx.fill();
                drawLabel('8', ox2 + l / 2, cy + l * 0.5 + 16 * scale, '#ffdd57', 13 * scale);
                drawLabel('?', ox2 - 12 * scale, cy, '#ff6b6b', 16 * scale);
                drawLabel('~', cx - sz * 0.1, cy - sz * 0.1, '#fff', 24 * scale);
            },
            options: ['12', '10', '8', '14'],
            correct: 0
        });

        // Congruence
        pool.push({
            question: 'Dois triangulos sao congruentes quando:',
            draw: function (cx, cy, sz) {
                const s = sz * 0.6;
                // Two identical triangles
                [-1, 1].forEach((dir, idx) => {
                    const ox = cx + dir * sz * 0.6;
                    ctx.strokeStyle = idx === 0 ? '#38bdf8' : '#4ade80';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(ox - s * 0.5, cy + s * 0.4);
                    ctx.lineTo(ox + s * 0.5, cy + s * 0.4);
                    ctx.lineTo(ox, cy - s * 0.5);
                    ctx.closePath();
                    ctx.stroke();
                    drawLabel('5', ox, cy + s * 0.4 + 14 * scale, '#ffdd57', 12 * scale);
                    drawLabel('4', ox - s * 0.35, cy - s * 0.1, '#ffdd57', 12 * scale);
                    drawLabel('4', ox + s * 0.35, cy - s * 0.1, '#ffdd57', 12 * scale);
                });
                drawLabel('\u2245', cx, cy, '#fff', 22 * scale);
            },
            options: [
                'Tem mesma forma e tamanho',
                'Tem apenas mesma forma',
                'Tem apenas mesmo tamanho',
                'Tem angulos diferentes'
            ],
            correct: 0
        });

        // Pythagorean: 5, 12, ?
        pool.push({
            question: 'Um triangulo retangulo tem catetos 5 cm e 12 cm. Qual e a hipotenusa?',
            draw: function (cx, cy, sz) {
                const w = sz * 1.5, h = sz * 0.65;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + h);
                ctx.lineTo(x0 + w, y0 + h);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(250,204,21,0.06)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + h, 12 * scale, -Math.PI / 2);
                drawLabel('5 cm', x0 - 28 * scale, y0 + h / 2, '#ffdd57', 14 * scale);
                drawLabel('12 cm', x0 + w / 2, y0 + h + 22 * scale, '#ffdd57', 14 * scale);
                drawLabel('?', cx + 15 * scale, cy - 10 * scale, '#ff6b6b', 18 * scale);
            },
            options: ['13 cm', '15 cm', '17 cm', '11 cm'],
            correct: 0
        });

        return shuffle(pool).slice(0, 5);
    }

    // --- Level 4: Trigonometry & Coordinate Geometry (9o ano) ---
    function generateLevel4() {
        const pool = [];

        // sin 30
        pool.push({
            question: 'Qual e o valor de sen(30\u00b0)?',
            draw: function (cx, cy, sz) {
                const w = sz * 1.4, h = sz * 0.8;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + h);
                ctx.lineTo(x0 + w, y0 + h);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(56,189,248,0.08)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + h, 12 * scale, -Math.PI / 2);
                drawLabel('30\u00b0', x0 + w - 35 * scale, y0 + h - 15 * scale, '#ff6b6b', 15 * scale);
                // Arc for angle
                ctx.beginPath();
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 1.5;
                ctx.arc(x0 + w, y0 + h, 25 * scale, Math.PI, Math.PI + 0.55);
                ctx.stroke();
                drawLabel('cateto oposto', x0 - 45 * scale, cy, 'rgba(255,255,255,0.5)', 11 * scale);
                drawLabel('hipotenusa', cx + 15 * scale, cy - 15 * scale, 'rgba(255,255,255,0.5)', 11 * scale);
            },
            options: ['0,5', '0,866', '0,707', '1'],
            correct: 0
        });

        // cos 60
        pool.push({
            question: 'Qual e o valor de cos(60\u00b0)?',
            draw: function (cx, cy, sz) {
                const w = sz * 0.8, h = sz * 1.3;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + h);
                ctx.lineTo(x0 + w, y0 + h);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(167,139,250,0.08)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + h, 12 * scale, -Math.PI / 2);
                drawLabel('60\u00b0', x0 + 22 * scale, y0 + 18 * scale, '#ff6b6b', 15 * scale);
                ctx.beginPath();
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 1.5;
                ctx.arc(x0, y0, 22 * scale, Math.PI / 2, Math.PI / 2 + 1.05);
                ctx.stroke();
            },
            options: ['0,5', '0,866', '0,707', '0,577'],
            correct: 0
        });

        // tan 45
        pool.push({
            question: 'Qual e o valor de tan(45\u00b0)?',
            draw: function (cx, cy, sz) {
                const s = sz * 1.0;
                const x0 = cx - s / 2, y0 = cy - s / 2;
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + s);
                ctx.lineTo(x0 + s, y0 + s);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(74,222,128,0.08)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + s, 12 * scale, -Math.PI / 2);
                drawLabel('45\u00b0', x0 + s - 30 * scale, y0 + s - 15 * scale, '#ff6b6b', 15 * scale);
                drawLabel('a', x0 - 18 * scale, cy, '#ffdd57', 14 * scale);
                drawLabel('a', x0 + s / 2, y0 + s + 18 * scale, '#ffdd57', 14 * scale);
            },
            options: ['1', '0,5', '\u221a2', '0'],
            correct: 0
        });

        // Distance between points
        const dx = 3, dy = 4;
        const dist = 5;
        pool.push({
            question: `Qual e a distancia entre os pontos A(1,2) e B(4,6)?`,
            draw: function (cx, cy, sz) {
                drawGrid(cx, cy, sz);
                // Axes
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - sz, cy);
                ctx.lineTo(cx + sz, cy);
                ctx.moveTo(cx, cy - sz);
                ctx.lineTo(cx, cy + sz);
                ctx.stroke();
                // Points
                const step = sz / 5;
                const ax = cx + 1 * step, ay = cy - 2 * step;
                const bx = cx + 4 * step, by = cy - 6 * step;
                // Scale for display
                const pax = cx - sz * 0.4, pay = cy + sz * 0.2;
                const pbx = cx + sz * 0.3, pby = cy - sz * 0.4;
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(pax, pay, 6, 0, Math.PI * 2);
                ctx.fill();
                drawLabel('A(1,2)', pax - 5 * scale, pay + 18 * scale, '#38bdf8', 12 * scale);
                ctx.fillStyle = '#f472b6';
                ctx.beginPath();
                ctx.arc(pbx, pby, 6, 0, Math.PI * 2);
                ctx.fill();
                drawLabel('B(4,6)', pbx + 5 * scale, pby - 14 * scale, '#f472b6', 12 * scale);
                // Dashed line
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = '#ffdd57';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(pax, pay);
                ctx.lineTo(pbx, pby);
                ctx.stroke();
                ctx.setLineDash([]);
            },
            options: ['5', '7', '6', '\u221a34'],
            correct: 0
        });

        // Midpoint
        pool.push({
            question: 'Qual e o ponto medio entre A(2, 4) e B(8, 10)?',
            draw: function (cx, cy, sz) {
                drawGrid(cx, cy, sz);
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - sz, cy);
                ctx.lineTo(cx + sz, cy);
                ctx.moveTo(cx, cy - sz);
                ctx.lineTo(cx, cy + sz);
                ctx.stroke();
                const pax = cx - sz * 0.5, pay = cy + sz * 0.3;
                const pbx = cx + sz * 0.5, pby = cy - sz * 0.3;
                ctx.fillStyle = '#4ade80';
                ctx.beginPath();
                ctx.arc(pax, pay, 6, 0, Math.PI * 2);
                ctx.fill();
                drawLabel('A(2,4)', pax, pay + 18 * scale, '#4ade80', 12 * scale);
                ctx.fillStyle = '#fb923c';
                ctx.beginPath();
                ctx.arc(pbx, pby, 6, 0, Math.PI * 2);
                ctx.fill();
                drawLabel('B(8,10)', pbx, pby - 14 * scale, '#fb923c', 12 * scale);
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.moveTo(pax, pay);
                ctx.lineTo(pbx, pby);
                ctx.stroke();
                ctx.setLineDash([]);
                // Midpoint marker
                const mx = (pax + pbx) / 2, my = (pay + pby) / 2;
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(mx, my, 5, 0, Math.PI * 2);
                ctx.fill();
                drawLabel('M = ?', mx, my - 14 * scale, '#facc15', 13 * scale);
            },
            options: ['(5, 7)', '(6, 7)', '(4, 6)', '(5, 8)'],
            correct: 0
        });

        // Trig: find side using sin
        pool.push({
            question: 'Em um triangulo retangulo, hipotenusa = 10 cm e um angulo = 30\u00b0. Qual e o cateto oposto?',
            draw: function (cx, cy, sz) {
                const w = sz * 1.4, h = sz * 0.7;
                const x0 = cx - w / 2, y0 = cy - h / 2;
                ctx.strokeStyle = '#f472b6';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x0, y0 + h);
                ctx.lineTo(x0 + w, y0 + h);
                ctx.lineTo(x0, y0);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'rgba(244,114,182,0.08)';
                ctx.fill();
                drawRightAngleMark(x0, y0 + h, 12 * scale, -Math.PI / 2);
                drawLabel('10 cm', cx + 18 * scale, cy - 10 * scale, '#ffdd57', 14 * scale);
                drawLabel('30\u00b0', x0 + w - 35 * scale, y0 + h - 15 * scale, '#ff6b6b', 14 * scale);
                drawLabel('?', x0 - 22 * scale, cy, '#ff6b6b', 18 * scale);
            },
            options: ['5 cm', '8,66 cm', '7,07 cm', '10 cm'],
            correct: 0
        });

        // Slope of a line
        pool.push({
            question: 'Qual e o coeficiente angular da reta que passa por (1,2) e (3,6)?',
            draw: function (cx, cy, sz) {
                drawGrid(cx, cy, sz);
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - sz, cy);
                ctx.lineTo(cx + sz, cy);
                ctx.moveTo(cx, cy - sz);
                ctx.lineTo(cx, cy + sz);
                ctx.stroke();
                // Line
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx - sz * 0.6, cy + sz * 0.4);
                ctx.lineTo(cx + sz * 0.6, cy - sz * 0.4);
                ctx.stroke();
                const pax = cx - sz * 0.35, pay = cy + sz * 0.22;
                const pbx = cx + sz * 0.15, pby = cy - sz * 0.12;
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(pax, pay, 5, 0, Math.PI * 2);
                ctx.fill();
                drawLabel('(1,2)', pax - 5 * scale, pay + 16 * scale, '#38bdf8', 11 * scale);
                ctx.fillStyle = '#f472b6';
                ctx.beginPath();
                ctx.arc(pbx, pby, 5, 0, Math.PI * 2);
                ctx.fill();
                drawLabel('(3,6)', pbx + 5 * scale, pby - 14 * scale, '#f472b6', 11 * scale);
            },
            options: ['2', '4', '1', '3'],
            correct: 0
        });

        return shuffle(pool).slice(0, 5);
    }

    // --- Question Generators ---
    const levelGenerators = [generateLevel1, generateLevel2, generateLevel3, generateLevel4];
    const levelNames = [
        '6\u00ba Ano - Formas e Angulos',
        '7\u00ba Ano - Perimetro e Area',
        '8\u00ba Ano - Pitagoras e Semelhanca',
        '9\u00ba Ano - Trigonometria e Geometria Analitica'
    ];
    const levelColors = ['#38bdf8', '#4ade80', '#a78bfa', '#f472b6'];

    function startLevel(level) {
        currentLevel = level;
        currentQuestion = 0;
        questions = levelGenerators[level]();
        state = STATE.PLAYING;
    }

    function startGame() {
        score = 0;
        lives = 3;
        streak = 0;
        bestStreak = 0;
        startLevel(0);
    }

    // --- Input Handling ---
    let mouseX = 0, mouseY = 0;
    let clicked = false;

    function handlePointer(x, y, isClick) {
        mouseX = x;
        mouseY = y;
        if (isClick) clicked = true;
    }

    canvas.addEventListener('mousemove', e => handlePointer(e.clientX, e.clientY, false));
    canvas.addEventListener('mousedown', e => { ensureAudio(); handlePointer(e.clientX, e.clientY, true); });
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        ensureAudio();
        const t = e.touches[0];
        handlePointer(t.clientX, t.clientY, true);
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const t = e.touches[0];
        handlePointer(t.clientX, t.clientY, false);
    }, { passive: false });

    function pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    // --- Drawing Helpers ---
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

    function drawButton(text, x, y, w, h, color, hover, selected, correctIdx, wrongSel) {
        ctx.save();
        let bg = color;
        let alpha = 0.15;
        let borderColor = color;
        let textColor = '#fff';

        if (selected !== undefined && selected) {
            if (wrongSel) {
                bg = '#ef4444';
                borderColor = '#ef4444';
                alpha = 0.4;
            } else {
                bg = '#22c55e';
                borderColor = '#22c55e';
                alpha = 0.4;
            }
        } else if (correctIdx) {
            bg = '#22c55e';
            borderColor = '#22c55e';
            alpha = 0.35;
        }

        if (hover && state === STATE.PLAYING) alpha += 0.1;

        drawRoundedRect(x, y, w, h, 10);
        ctx.fillStyle = bg;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = `${15 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word wrap
        const maxWidth = w - 20;
        const words = text.split(' ');
        let lines = [];
        let line = '';
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxWidth) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        lines.push(line);

        const lineHeight = 18 * scale;
        const startY = y + h / 2 - (lines.length - 1) * lineHeight / 2;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x + w / 2, startY + i * lineHeight);
        }
        ctx.restore();
    }

    // --- HUD ---
    function drawHUD() {
        ctx.save();
        // Top bar background
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, W, 50 * scale);

        const fontSize = 14 * scale;
        ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
        ctx.textBaseline = 'middle';
        const yy = 25 * scale;

        // Level
        ctx.textAlign = 'left';
        ctx.fillStyle = levelColors[currentLevel];
        ctx.fillText(`Nivel ${currentLevel + 1}: ${levelNames[currentLevel]}`, 15, yy);

        // Score
        ctx.textAlign = 'center';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`Pontos: ${score}`, W / 2, yy);

        // Lives
        ctx.textAlign = 'right';
        let livesStr = '';
        for (let i = 0; i < 3; i++) livesStr += i < lives ? '\u2764\ufe0f ' : '\ud83d\udc94 ';
        ctx.fillText(livesStr + ` Sequencia: ${streak}`, W - 15, yy);

        // Progress bar
        const barW = W * 0.4;
        const barH = 4 * scale;
        const barX = W / 2 - barW / 2;
        const barY = 45 * scale;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(barX, barY, barW, barH);
        const progress = currentQuestion / 5;
        ctx.fillStyle = levelColors[currentLevel];
        ctx.fillRect(barX, barY, barW * progress, barH);

        ctx.restore();
    }

    // --- Screens ---
    function drawMenu(time) {
        drawStars(time);

        // Title
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#8b5cf6';
        ctx.font = `bold ${48 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('\ud83d\udcd0 Geometria Aventura', W / 2, H * 0.2);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${18 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('Explore o mundo da geometria!', W / 2, H * 0.28);
        ctx.fillText('6\u00ba ao 9\u00ba ano', W / 2, H * 0.33);

        // Features
        const features = [
            '\ud83d\udccd 4 niveis de dificuldade',
            '\ud83c\udfaf Formas, areas, Pitagoras e trigonometria',
            '\u2b50 Ganhe pontos e mantenha sua sequencia!'
        ];
        ctx.font = `${14 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        features.forEach((f, i) => {
            ctx.fillText(f, W / 2, H * 0.42 + i * 28 * scale);
        });

        // Animated shapes
        const shapeY = H * 0.62;
        const shapeSpacing = W * 0.15;
        const shapeSz = 25 * scale;

        // Triangle
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        const tx = W / 2 - shapeSpacing * 1.5;
        ctx.save();
        ctx.translate(tx, shapeY);
        ctx.rotate(time * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, -shapeSz);
        ctx.lineTo(shapeSz, shapeSz * 0.7);
        ctx.lineTo(-shapeSz, shapeSz * 0.7);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Square
        ctx.strokeStyle = '#4ade80';
        const sx = W / 2 - shapeSpacing * 0.5;
        ctx.save();
        ctx.translate(sx, shapeY);
        ctx.rotate(-time * 0.4);
        ctx.strokeRect(-shapeSz * 0.7, -shapeSz * 0.7, shapeSz * 1.4, shapeSz * 1.4);
        ctx.restore();

        // Pentagon
        ctx.strokeStyle = '#a78bfa';
        const px = W / 2 + shapeSpacing * 0.5;
        ctx.save();
        ctx.translate(px, shapeY);
        ctx.rotate(time * 0.3);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x2 = shapeSz * Math.cos(a);
            const y2 = shapeSz * Math.sin(a);
            if (i === 0) ctx.moveTo(x2, y2);
            else ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Circle
        ctx.strokeStyle = '#f472b6';
        const ccx = W / 2 + shapeSpacing * 1.5;
        ctx.beginPath();
        ctx.arc(ccx, shapeY, shapeSz + Math.sin(time * 2) * 5, 0, Math.PI * 2);
        ctx.stroke();

        // Play button
        const btnW = 220 * scale, btnH = 55 * scale;
        const btnX = W / 2 - btnW / 2, btnY = H * 0.78;
        const isHover = pointInRect(mouseX, mouseY, btnX, btnY, btnW, btnH);
        buttons = [{ x: btnX, y: btnY, w: btnW, h: btnH, action: 'play' }];

        drawRoundedRect(btnX, btnY, btnW, btnH, 14);
        const grad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#6d28d9');
        ctx.fillStyle = grad;
        ctx.globalAlpha = isHover ? 1 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${20 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('\u25b6 Jogar', W / 2, btnY + btnH / 2);

        ctx.restore();

        if (clicked && isHover) {
            playSound('click');
            startGame();
        }
    }

    function drawPlaying(time) {
        drawStars(time);
        drawHUD();

        if (currentQuestion >= questions.length) return;
        const q = questions[currentQuestion];

        // Question text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${18 * scale}px 'Segoe UI', sans-serif`;
        const qY = 70 * scale;

        // Word wrap question
        const maxQw = W * 0.85;
        const words = q.question.split(' ');
        let qlines = [];
        let qline = '';
        for (const w of words) {
            const test = qline ? qline + ' ' + w : w;
            if (ctx.measureText(test).width > maxQw) {
                qlines.push(qline);
                qline = w;
            } else {
                qline = test;
            }
        }
        qlines.push(qline);
        const qlh = 24 * scale;
        for (let i = 0; i < qlines.length; i++) {
            ctx.fillText(qlines[i], W / 2, qY + i * qlh);
        }
        ctx.restore();

        // Draw shape
        const shapeCenterY = H * 0.38;
        const shapeSize = Math.min(W, H) * 0.14;
        q.draw(W / 2, shapeCenterY, shapeSize);

        // Answer buttons
        const btnW = Math.min(340 * scale, W * 0.42);
        const btnH = 50 * scale;
        const gap = 12 * scale;
        const startX = W / 2 - btnW - gap / 2;
        const startY = H * 0.62;

        buttons = [];
        hoverButton = -1;

        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = startX + col * (btnW + gap);
            const by = startY + row * (btnH + gap);
            const isHover = pointInRect(mouseX, mouseY, bx, by, btnW, btnH);
            if (isHover) hoverButton = i;

            const labels = ['A', 'B', 'C', 'D'];
            drawButton(`${labels[i]}) ${q.options[i]}`, bx, by, btnW, btnH, levelColors[currentLevel], isHover);
            buttons.push({ x: bx, y: by, w: btnW, h: btnH, action: 'answer', index: i });
        }

        // Handle click
        if (clicked) {
            for (const btn of buttons) {
                if (pointInRect(mouseX, mouseY, btn.x, btn.y, btn.w, btn.h) && btn.action === 'answer') {
                    selectedAnswer = btn.index;
                    correctAnswer = q.correct;
                    if (selectedAnswer === correctAnswer) {
                        const bonus = streak >= 3 ? 20 : 10;
                        score += bonus;
                        streak++;
                        if (streak > bestStreak) bestStreak = streak;
                        playSound('correct');
                        spawnParticles(btn.x + btn.w / 2, btn.y + btn.h / 2, '#22c55e', 25);
                    } else {
                        lives--;
                        streak = 0;
                        playSound('wrong');
                        spawnParticles(btn.x + btn.w / 2, btn.y + btn.h / 2, '#ef4444', 20);
                    }
                    state = STATE.FEEDBACK;
                    feedbackTimer = 90;
                    break;
                }
            }
        }
    }

    function drawFeedback(time) {
        drawStars(time);
        drawHUD();

        const q = questions[currentQuestion];

        // Question
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${18 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(q.question, W / 2, 70 * scale);
        ctx.restore();

        // Shape
        const shapeCenterY = H * 0.38;
        const shapeSize = Math.min(W, H) * 0.14;
        q.draw(W / 2, shapeCenterY, shapeSize);

        // Buttons with feedback
        const btnW = Math.min(340 * scale, W * 0.42);
        const btnH = 50 * scale;
        const gap = 12 * scale;
        const startX = W / 2 - btnW - gap / 2;
        const startY = H * 0.62;

        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = startX + col * (btnW + gap);
            const by = startY + row * (btnH + gap);

            const labels = ['A', 'B', 'C', 'D'];
            const isSel = i === selectedAnswer;
            const isCorrectBtn = i === correctAnswer;
            const isWrong = isSel && selectedAnswer !== correctAnswer;

            drawButton(`${labels[i]}) ${q.options[i]}`, bx, by, btnW, btnH, levelColors[currentLevel], false, isSel || isCorrectBtn, isCorrectBtn, isWrong);
        }

        // Feedback message
        const isCorrect = selectedAnswer === correctAnswer;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = `bold ${22 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = isCorrect ? '#22c55e' : '#ef4444';
        const fbY = startY + 2 * (btnH + gap) + 25 * scale;
        if (isCorrect) {
            const msgs = ['Correto!', 'Muito bem!', 'Excelente!', 'Perfeito!'];
            ctx.fillText(msgs[Math.floor(Math.random() * msgs.length)], W / 2, fbY);
            if (streak >= 3) {
                ctx.font = `${14 * scale}px 'Segoe UI', sans-serif`;
                ctx.fillStyle = '#facc15';
                ctx.fillText(`Sequencia de ${streak}! Bonus de pontos!`, W / 2, fbY + 24 * scale);
            }
        } else {
            ctx.fillText('Resposta incorreta!', W / 2, fbY);
            ctx.font = `${14 * scale}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText(`A resposta correta era: ${q.options[correctAnswer]}`, W / 2, fbY + 24 * scale);
        }
        ctx.restore();

        feedbackTimer--;
        if (feedbackTimer <= 0) {
            currentQuestion++;
            if (lives <= 0) {
                state = STATE.GAME_OVER;
                playSound('gameover');
            } else if (currentQuestion >= 5) {
                if (currentLevel >= 3) {
                    state = STATE.VICTORY;
                    playSound('levelup');
                } else {
                    state = STATE.LEVEL_COMPLETE;
                    playSound('levelup');
                }
            } else {
                state = STATE.PLAYING;
            }
        }
    }

    function drawLevelComplete(time) {
        drawStars(time);

        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = levelColors[currentLevel];
        ctx.font = `bold ${36 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('Nivel Completo!', W / 2, H * 0.25);

        ctx.fillStyle = '#fff';
        ctx.font = `${20 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`${levelNames[currentLevel]}`, W / 2, H * 0.34);

        ctx.fillStyle = '#facc15';
        ctx.font = `bold ${24 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Pontuacao: ${score}`, W / 2, H * 0.44);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${16 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Vidas restantes: ${'❤️'.repeat(lives)}`, W / 2, H * 0.52);
        ctx.fillText(`Melhor sequencia: ${bestStreak}`, W / 2, H * 0.57);

        // Animated shapes celebration
        for (let i = 0; i < 5; i++) {
            const angle = time * 0.8 + i * Math.PI * 2 / 5;
            const r = 60 * scale;
            const sx = W / 2 + Math.cos(angle) * r;
            const sy = H * 0.44 + Math.sin(angle) * r * 0.5;
            ctx.fillStyle = levelColors[i % 4];
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(sx, sy, 5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Next level button
        const btnW = 250 * scale, btnH = 55 * scale;
        const btnX = W / 2 - btnW / 2, btnY = H * 0.68;
        const isHover = pointInRect(mouseX, mouseY, btnX, btnY, btnW, btnH);
        buttons = [{ x: btnX, y: btnY, w: btnW, h: btnH, action: 'nextlevel' }];

        drawRoundedRect(btnX, btnY, btnW, btnH, 14);
        const grad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
        grad.addColorStop(0, levelColors[currentLevel + 1] || '#8b5cf6');
        grad.addColorStop(1, '#6d28d9');
        ctx.fillStyle = grad;
        ctx.globalAlpha = isHover ? 1 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${20 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Proximo: ${levelNames[currentLevel + 1]}`, W / 2, btnY + btnH / 2);

        ctx.restore();

        if (clicked && isHover) {
            playSound('click');
            startLevel(currentLevel + 1);
        }
    }

    function drawGameOver(time) {
        drawStars(time);

        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${40 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('Fim de Jogo!', W / 2, H * 0.25);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${18 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('Voce perdeu todas as vidas.', W / 2, H * 0.34);

        ctx.fillStyle = '#facc15';
        ctx.font = `bold ${28 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Pontuacao Final: ${score}`, W / 2, H * 0.45);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${16 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Nivel alcancado: ${currentLevel + 1} - ${levelNames[currentLevel]}`, W / 2, H * 0.53);
        ctx.fillText(`Melhor sequencia: ${bestStreak}`, W / 2, H * 0.58);

        // Retry button
        const btnW = 220 * scale, btnH = 55 * scale;
        const btnX = W / 2 - btnW / 2, btnY = H * 0.68;
        const isHover = pointInRect(mouseX, mouseY, btnX, btnY, btnW, btnH);
        buttons = [{ x: btnX, y: btnY, w: btnW, h: btnH, action: 'retry' }];

        drawRoundedRect(btnX, btnY, btnW, btnH, 14);
        const grad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(1, '#b91c1c');
        ctx.fillStyle = grad;
        ctx.globalAlpha = isHover ? 1 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${20 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('\ud83d\udd04 Tentar Novamente', W / 2, btnY + btnH / 2);

        ctx.restore();

        if (clicked && isHover) {
            playSound('click');
            state = STATE.MENU;
        }
    }

    function drawVictory(time) {
        drawStars(time);

        // Confetti particles
        if (Math.random() < 0.3) {
            const colors = ['#facc15', '#22c55e', '#38bdf8', '#f472b6', '#a78bfa', '#fb923c'];
            spawnParticles(
                Math.random() * W,
                -10,
                colors[Math.floor(Math.random() * colors.length)],
                3
            );
        }

        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = '#facc15';
        ctx.font = `bold ${42 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('\ud83c\udfc6 Parabens!', W / 2, H * 0.2);

        ctx.fillStyle = '#fff';
        ctx.font = `${22 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('Voce completou todos os niveis!', W / 2, H * 0.3);

        ctx.fillStyle = '#facc15';
        ctx.font = `bold ${32 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Pontuacao Final: ${score}`, W / 2, H * 0.42);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${16 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Vidas restantes: ${'❤️'.repeat(lives)}  |  Melhor sequencia: ${bestStreak}`, W / 2, H * 0.50);

        // Star rating
        const starCount = lives === 3 ? 3 : lives === 2 ? 2 : 1;
        const starStr = '\u2b50'.repeat(starCount) + '\u2606'.repeat(3 - starCount);
        ctx.font = `${36 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText(starStr, W / 2, H * 0.58);

        // Animated trophy
        const trophySz = 30 * scale;
        const bounce = Math.sin(time * 3) * 8 * scale;
        ctx.font = `${trophySz}px 'Segoe UI', sans-serif`;
        ctx.fillText('\ud83c\udfc6', W / 2 - 60 * scale, H * 0.2 + bounce);
        ctx.fillText('\ud83c\udfc6', W / 2 + 60 * scale, H * 0.2 - bounce);

        // Play again button
        const btnW = 220 * scale, btnH = 55 * scale;
        const btnX = W / 2 - btnW / 2, btnY = H * 0.72;
        const isHover = pointInRect(mouseX, mouseY, btnX, btnY, btnW, btnH);
        buttons = [{ x: btnX, y: btnY, w: btnW, h: btnH, action: 'menu' }];

        drawRoundedRect(btnX, btnY, btnW, btnH, 14);
        const grad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#6d28d9');
        ctx.fillStyle = grad;
        ctx.globalAlpha = isHover ? 1 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${20 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('\ud83c\udfae Jogar Novamente', W / 2, btnY + btnH / 2);

        ctx.restore();

        if (clicked && isHover) {
            playSound('click');
            state = STATE.MENU;
        }
    }

    // --- Main Loop ---
    function gameLoop(timestamp) {
        const time = timestamp / 1000;
        animTime = time;

        ctx.clearRect(0, 0, W, H);

        // Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#0d0d18');
        bgGrad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        switch (state) {
            case STATE.MENU:
                drawMenu(time);
                break;
            case STATE.PLAYING:
                drawPlaying(time);
                break;
            case STATE.FEEDBACK:
                drawFeedback(time);
                break;
            case STATE.LEVEL_COMPLETE:
                drawLevelComplete(time);
                break;
            case STATE.GAME_OVER:
                drawGameOver(time);
                break;
            case STATE.VICTORY:
                drawVictory(time);
                break;
        }

        updateParticles();
        drawParticles();

        clicked = false;
        requestAnimationFrame(gameLoop);
    }

    // --- Init ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            requestAnimationFrame(gameLoop);
        }, 800);
    });

})();
