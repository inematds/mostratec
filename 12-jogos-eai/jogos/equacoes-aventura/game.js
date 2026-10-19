// ============================================================
// Equações Aventura - Jogo Educativo de Matemática (6º-9º ano)
// ============================================================

(function () {
    'use strict';

    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Audio (Web Audio API) ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
    }

    function playTone(freq, duration, type, vol) {
        try {
            ensureAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type || 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol || 0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (_) { /* ignore audio errors */ }
    }

    function sfxCorrect() {
        playTone(523, 0.12, 'square', 0.1);
        setTimeout(() => playTone(659, 0.12, 'square', 0.1), 100);
        setTimeout(() => playTone(784, 0.2, 'square', 0.1), 200);
    }

    function sfxWrong() {
        playTone(200, 0.3, 'sawtooth', 0.1);
        setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.1), 150);
    }

    function sfxClick() {
        playTone(440, 0.06, 'sine', 0.08);
    }

    function sfxLevelUp() {
        playTone(523, 0.15, 'square', 0.1);
        setTimeout(() => playTone(659, 0.15, 'square', 0.1), 120);
        setTimeout(() => playTone(784, 0.15, 'square', 0.1), 240);
        setTimeout(() => playTone(1047, 0.3, 'square', 0.12), 360);
    }

    function sfxGameOver() {
        playTone(400, 0.25, 'sawtooth', 0.1);
        setTimeout(() => playTone(300, 0.25, 'sawtooth', 0.1), 200);
        setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.12), 400);
    }

    // --- Particle System ---
    const particles = [];

    function spawnParticles(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 0.5 + 0.5) * (speed || 3);
            particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
                size: 2 + Math.random() * 4,
                color: color
            });
        }
    }

    function spawnCoinParticles(x, y) {
        spawnParticles(x, y, '#fbbf24', 15, 4);
        spawnParticles(x, y, '#f59e0b', 10, 3);
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

    // --- Floating Text ---
    const floatingTexts = [];

    function addFloatingText(text, x, y, color) {
        floatingTexts.push({ text, x, y, color, life: 1, decay: 0.02 });
    }

    function updateFloatingTexts() {
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y -= 1.2;
            ft.life -= ft.decay;
            if (ft.life <= 0) floatingTexts.splice(i, 1);
        }
    }

    function drawFloatingTexts() {
        for (const ft of floatingTexts) {
            ctx.globalAlpha = ft.life;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 22px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1;
    }

    // --- Equation Generator ---
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function generateEquation(level) {
        let equation, answer, options;

        if (level === 1) {
            // 6o ano: x + a = b  or  x - a = b
            const x = randInt(1, 20);
            const a = randInt(1, 15);
            const ops = ['+', '-'];
            const op = ops[randInt(0, 1)];
            if (op === '+') {
                const b = x + a;
                equation = `x + ${a} = ${b}`;
                answer = x;
            } else {
                const b = x - a;
                equation = `x - ${a} = ${b}`;
                answer = x;
            }
        } else if (level === 2) {
            // 7o ano: ax + b = c
            const x = randInt(1, 12);
            const a = randInt(2, 6);
            const b = randInt(1, 10);
            const c = a * x + b;
            equation = `${a}x + ${b} = ${c}`;
            answer = x;
        } else if (level === 3) {
            // 8o ano: ax + b = cx + d (with a != c)
            const x = randInt(1, 10);
            let a = randInt(2, 7);
            let c = randInt(1, a - 1);
            if (c === a) c = a - 1;
            if (c < 1) c = 1;
            const b = randInt(1, 10);
            const d = a * x + b - c * x;
            equation = `${a}x + ${b} = ${c}x + ${d}`;
            answer = x;
        } else {
            // 9o ano: x² = n  or  x² + a = b  or  x² - a = b
            const variants = randInt(0, 2);
            if (variants === 0) {
                const x = randInt(1, 12);
                const n = x * x;
                equation = `x² = ${n}`;
                answer = x;
            } else if (variants === 1) {
                const x = randInt(2, 10);
                const a = randInt(1, 15);
                const b = x * x + a;
                equation = `x² + ${a} = ${b}`;
                answer = x;
            } else {
                const x = randInt(2, 10);
                const a = randInt(1, 10);
                const b = x * x - a;
                equation = `x² - ${a} = ${b}`;
                answer = x;
            }
        }

        // Generate wrong options (distinct from answer)
        const wrongSet = new Set();
        while (wrongSet.size < 3) {
            let wrong;
            const offset = randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
            wrong = answer + offset;
            if (wrong !== answer && wrong > 0 && !wrongSet.has(wrong)) {
                wrongSet.add(wrong);
            }
        }
        options = shuffle([answer, ...wrongSet]);

        return { equation, answer, options };
    }

    // --- Game State ---
    const QUESTIONS_PER_LEVEL = 5;
    const TOTAL_LEVELS = 4;
    const TIME_PER_QUESTION = 20; // seconds
    const LEVEL_NAMES = ['6º Ano', '7º Ano', '8º Ano', '9º Ano'];
    const LEVEL_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

    let state = 'menu'; // menu, playing, question, feedback, levelUp, gameOver, victory
    let level = 1;
    let questionIndex = 0;
    let score = 0;
    let combo = 0;
    let lives = 3;
    let currentEquation = null;
    let selectedOption = -1;
    let feedbackCorrect = false;
    let feedbackTimer = 0;
    let questionTimer = 0;
    let lastTime = 0;
    let dt = 0;

    // Player character position on the path
    let playerX = 0;
    let playerTargetX = 0;
    let playerBob = 0;

    // Stars background
    const stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.0002 + 0.0001,
            brightness: Math.random()
        });
    }

    // Screen flash
    let flashColor = '';
    let flashAlpha = 0;

    // Buttons (computed on draw)
    let answerButtons = [];
    let menuButton = { x: 0, y: 0, w: 0, h: 0 };
    let restartButton = { x: 0, y: 0, w: 0, h: 0 };

    // --- Path & Stations ---
    function getStationPositions() {
        const w = canvas.width;
        const total = QUESTIONS_PER_LEVEL;
        const margin = w * 0.1;
        const usable = w - margin * 2;
        const positions = [];
        for (let i = 0; i <= total; i++) {
            positions.push(margin + (usable * i) / total);
        }
        return positions;
    }

    function getPlayerProgress() {
        return questionIndex / QUESTIONS_PER_LEVEL;
    }

    // --- Start / Reset ---
    function startGame() {
        state = 'playing';
        level = 1;
        questionIndex = 0;
        score = 0;
        combo = 0;
        lives = 3;
        playerX = 0;
        playerTargetX = 0;
        nextQuestion();
    }

    function nextQuestion() {
        if (questionIndex >= QUESTIONS_PER_LEVEL) {
            if (level >= TOTAL_LEVELS) {
                state = 'victory';
                sfxLevelUp();
                return;
            }
            state = 'levelUp';
            sfxLevelUp();
            return;
        }
        currentEquation = generateEquation(level);
        selectedOption = -1;
        questionTimer = TIME_PER_QUESTION;
        const stations = getStationPositions();
        playerTargetX = stations[questionIndex];
        state = 'question';
    }

    function advanceLevel() {
        level++;
        questionIndex = 0;
        playerX = 0;
        playerTargetX = 0;
        nextQuestion();
    }

    function handleAnswer(idx) {
        if (state !== 'question') return;
        selectedOption = idx;
        sfxClick();

        const chosen = currentEquation.options[idx];
        if (chosen === currentEquation.answer) {
            feedbackCorrect = true;
            combo++;
            const points = 100 * combo;
            score += points;
            sfxCorrect();
            const btn = answerButtons[idx];
            if (btn) {
                spawnCoinParticles(btn.x + btn.w / 2, btn.y);
                addFloatingText(`+${points}`, btn.x + btn.w / 2, btn.y - 20, '#fbbf24');
                if (combo > 1) {
                    addFloatingText(`Combo x${combo}!`, btn.x + btn.w / 2, btn.y - 50, '#a855f7');
                }
            }
            flashColor = '#22c55e';
        } else {
            feedbackCorrect = false;
            combo = 0;
            lives--;
            sfxWrong();
            const btn = answerButtons[idx];
            if (btn) {
                spawnParticles(btn.x + btn.w / 2, btn.y + btn.h / 2, '#ef4444', 12, 3);
            }
            flashColor = '#ef4444';
        }
        flashAlpha = 0.25;
        feedbackTimer = 1.5;
        state = 'feedback';
    }

    function handleTimeout() {
        combo = 0;
        lives--;
        sfxWrong();
        feedbackCorrect = false;
        flashColor = '#ef4444';
        flashAlpha = 0.25;
        feedbackTimer = 1.5;
        state = 'feedback';
        addFloatingText('Tempo esgotado!', canvas.width / 2, canvas.height / 2 - 60, '#ef4444');
    }

    // --- Drawing Utilities ---
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

    function drawButton(x, y, w, h, text, color, hovered, borderColor) {
        ctx.save();
        drawRoundedRect(x, y, w, h, 12);
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, shadeColor(color, -30));
        ctx.fillStyle = grad;
        ctx.fill();
        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        if (hovered) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + w / 2, y + h / 2);
        ctx.restore();
    }

    function shadeColor(hex, amt) {
        let col = hex.replace('#', '');
        let num = parseInt(col, 16);
        let r = Math.min(255, Math.max(0, (num >> 16) + amt));
        let g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
        let b = Math.min(255, Math.max(0, (num & 0xff) + amt));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    function drawStars() {
        for (const s of stars) {
            s.brightness += s.speed * 500;
            const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.brightness));
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x * canvas.width, s.y * canvas.height, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function drawBackground() {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0d0d18');
        grad.addColorStop(0.5, '#1a1033');
        grad.addColorStop(1, '#0d0d18');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars();
    }

    function drawHUD() {
        const w = canvas.width;
        const pad = 20;

        // Score
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px Segoe UI, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Pontos: ${score}`, pad, 35);

        // Combo
        if (combo > 1) {
            ctx.fillStyle = '#a855f7';
            ctx.font = 'bold 16px Segoe UI, sans-serif';
            ctx.fillText(`Combo x${combo}`, pad, 58);
        }

        // Lives (hearts)
        ctx.textAlign = 'right';
        ctx.font = '24px Segoe UI, sans-serif';
        let heartsStr = '';
        for (let i = 0; i < 3; i++) {
            heartsStr += i < lives ? '❤️' : '🖤';
        }
        ctx.fillText(heartsStr, w - pad, 35);

        // Level indicator
        ctx.textAlign = 'center';
        ctx.fillStyle = LEVEL_COLORS[level - 1];
        ctx.font = 'bold 18px Segoe UI, sans-serif';
        ctx.fillText(`Nível ${level} - ${LEVEL_NAMES[level - 1]}`, w / 2, 35);

        // Progress bar
        const barW = Math.min(300, w * 0.5);
        const barH = 8;
        const barX = (w - barW) / 2;
        const barY = 50;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        drawRoundedRect(barX, barY, barW, barH, 4);
        ctx.fill();
        const progress = questionIndex / QUESTIONS_PER_LEVEL;
        if (progress > 0) {
            const grad = ctx.createLinearGradient(barX, barY, barX + barW * progress, barY);
            grad.addColorStop(0, LEVEL_COLORS[level - 1]);
            grad.addColorStop(1, '#fff');
            ctx.fillStyle = grad;
            drawRoundedRect(barX, barY, barW * progress, barH, 4);
            ctx.fill();
        }
    }

    // --- Draw Character ---
    function drawCharacter(x, y) {
        const bob = Math.sin(playerBob) * 4;
        const cy = y + bob;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + 30, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#6366f1';
        drawRoundedRect(x - 14, cy - 10, 28, 30, 8);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x, cy - 20, 14, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(x - 5, cy - 22, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, cy - 22, 3, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, cy - 17, 5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Hat (wizard)
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(x - 14, cy - 30);
        ctx.lineTo(x, cy - 52);
        ctx.lineTo(x + 14, cy - 30);
        ctx.closePath();
        ctx.fill();

        // Star on hat
        ctx.fillStyle = '#fbbf24';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', x, cy - 37);
    }

    // --- Draw Path ---
    function drawPath() {
        const w = canvas.width;
        const h = canvas.height;
        const pathY = h * 0.55;
        const stations = getStationPositions();

        // Draw path line
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(stations[0], pathY);
        ctx.lineTo(stations[stations.length - 1], pathY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw stations
        for (let i = 0; i < stations.length; i++) {
            const sx = stations[i];
            const completed = i < questionIndex;
            const current = i === questionIndex;

            // Station circle
            ctx.beginPath();
            ctx.arc(sx, pathY, current ? 18 : 14, 0, Math.PI * 2);
            if (completed) {
                ctx.fillStyle = '#22c55e';
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✓', sx, pathY);
            } else if (current) {
                ctx.fillStyle = LEVEL_COLORS[level - 1];
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${i + 1}`, sx, pathY);
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${i + 1}`, sx, pathY);
            }
        }

        // Draw character
        const charX = playerX || stations[0];
        drawCharacter(charX, pathY - 35);
    }

    // --- Draw Timer ---
    function drawTimer() {
        const w = canvas.width;
        const cx = w / 2;
        const cy = 95;
        const radius = 22;
        const frac = Math.max(0, questionTimer / TIME_PER_QUESTION);

        // Background circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();

        // Progress arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        ctx.strokeStyle = frac > 0.3 ? '#22c55e' : frac > 0.1 ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.ceil(questionTimer).toString(), cx, cy);
    }

    // --- Draw Question Panel ---
    function drawQuestionPanel() {
        const w = canvas.width;
        const h = canvas.height;
        const panelW = Math.min(500, w * 0.9);
        const panelH = 280;
        const px = (w - panelW) / 2;
        const py = h * 0.58;

        // Panel background
        ctx.save();
        drawRoundedRect(px, py, panelW, panelH, 16);
        ctx.fillStyle = 'rgba(30, 20, 60, 0.92)';
        ctx.fill();
        ctx.strokeStyle = LEVEL_COLORS[level - 1];
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Equation text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Resolva: ${currentEquation.equation}`, w / 2, py + 45);

        // Hint text
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px Segoe UI, sans-serif';
        ctx.fillText('Encontre o valor de x', w / 2, py + 70);

        // Answer buttons (2x2 grid)
        const btnW = (panelW - 60) / 2;
        const btnH = 50;
        const startX = px + 20;
        const startY = py + 90;
        const gapX = 20;
        const gapY = 15;
        answerButtons = [];

        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = startX + col * (btnW + gapX);
            const by = startY + row * (btnH + gapY);
            answerButtons.push({ x: bx, y: by, w: btnW, h: btnH });

            let btnColor = '#374151';
            let borderCol = null;
            if (state === 'feedback') {
                if (currentEquation.options[i] === currentEquation.answer) {
                    btnColor = '#16a34a';
                    borderCol = '#22c55e';
                } else if (i === selectedOption && !feedbackCorrect) {
                    btnColor = '#dc2626';
                    borderCol = '#ef4444';
                }
            }

            drawButton(bx, by, btnW, btnH, `x = ${currentEquation.options[i]}`, btnColor, false, borderCol);
        }
    }

    // --- Draw Menu ---
    function drawMenu() {
        const w = canvas.width;
        const h = canvas.height;

        // Title
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 42px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Equações Aventura', w / 2, h * 0.22);

        // Emoji
        ctx.font = '60px sans-serif';
        ctx.fillText('🧮', w / 2, h * 0.12);

        // Subtitle
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '18px Segoe UI, sans-serif';
        ctx.fillText('Uma aventura matemática do 6º ao 9º ano!', w / 2, h * 0.28);

        // Description
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '15px Segoe UI, sans-serif';
        const descs = [
            'Resolva equações de dificuldade crescente.',
            'Ganhe pontos, mantenha combos e não perca suas vidas!',
            '4 níveis: equações simples até equações quadráticas.'
        ];
        descs.forEach((d, i) => {
            ctx.fillText(d, w / 2, h * 0.35 + i * 24);
        });

        // Level preview boxes
        const boxW = Math.min(120, (w - 100) / 4);
        const totalBoxW = boxW * 4 + 15 * 3;
        const boxStartX = (w - totalBoxW) / 2;
        const boxY = h * 0.50;
        for (let i = 0; i < 4; i++) {
            const bx = boxStartX + i * (boxW + 15);
            ctx.save();
            drawRoundedRect(bx, boxY, boxW, 60, 10);
            ctx.fillStyle = LEVEL_COLORS[i];
            ctx.globalAlpha = 0.2;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = LEVEL_COLORS[i];
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            ctx.fillStyle = LEVEL_COLORS[i];
            ctx.font = 'bold 14px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(LEVEL_NAMES[i], bx + boxW / 2, boxY + 25);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '11px Segoe UI, sans-serif';
            const examples = ['x+5=12', '2x+3=11', '3x+2=x+10', 'x²=25'];
            ctx.fillText(examples[i], bx + boxW / 2, boxY + 45);
        }

        // Start button
        const btnW = 220;
        const btnH = 55;
        const btnX = (w - btnW) / 2;
        const btnY = h * 0.72;
        menuButton = { x: btnX, y: btnY, w: btnW, h: btnH };
        drawButton(btnX, btnY, btnW, btnH, 'INICIAR AVENTURA', '#7c3aed', false, '#a855f7');

        // Controls info
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Clique ou toque para selecionar a resposta', w / 2, h * 0.87);
    }

    // --- Draw Level Up Screen ---
    function drawLevelUp() {
        const w = canvas.width;
        const h = canvas.height;

        // Overlay
        ctx.fillStyle = 'rgba(13, 13, 24, 0.85)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎉', w / 2, h * 0.25);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 36px Segoe UI, sans-serif';
        ctx.fillText('Nível Completo!', w / 2, h * 0.35);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px Segoe UI, sans-serif';
        ctx.fillText(`Pontuação: ${score}`, w / 2, h * 0.45);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '18px Segoe UI, sans-serif';
        ctx.fillText(`Próximo: Nível ${level + 1} - ${LEVEL_NAMES[level]}`, w / 2, h * 0.53);

        const btnW = 200;
        const btnH = 50;
        const btnX = (w - btnW) / 2;
        const btnY = h * 0.62;
        menuButton = { x: btnX, y: btnY, w: btnW, h: btnH };
        drawButton(btnX, btnY, btnW, btnH, 'CONTINUAR', '#7c3aed', false, '#a855f7');
    }

    // --- Draw Game Over ---
    function drawGameOver() {
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = 'rgba(13, 13, 24, 0.9)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💔', w / 2, h * 0.2);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 36px Segoe UI, sans-serif';
        ctx.fillText('Fim de Jogo', w / 2, h * 0.32);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px Segoe UI, sans-serif';
        ctx.fillText(`Pontuação Final: ${score}`, w / 2, h * 0.42);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '18px Segoe UI, sans-serif';
        ctx.fillText(`Chegou até o Nível ${level} - ${LEVEL_NAMES[level - 1]}`, w / 2, h * 0.50);

        // Tips
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '14px Segoe UI, sans-serif';
        ctx.fillText('Dica: mantenha combos para multiplicar seus pontos!', w / 2, h * 0.58);

        const btnW = 200;
        const btnH = 50;
        const btnX = (w - btnW) / 2;
        const btnY = h * 0.67;
        restartButton = { x: btnX, y: btnY, w: btnW, h: btnH };
        drawButton(btnX, btnY, btnW, btnH, 'TENTAR NOVAMENTE', '#7c3aed', false, '#a855f7');
    }

    // --- Draw Victory ---
    function drawVictory() {
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = 'rgba(13, 13, 24, 0.85)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = '60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', w / 2, h * 0.18);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 40px Segoe UI, sans-serif';
        ctx.fillText('Parabéns!', w / 2, h * 0.30);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 22px Segoe UI, sans-serif';
        ctx.fillText('Você completou todos os níveis!', w / 2, h * 0.38);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 28px Segoe UI, sans-serif';
        ctx.fillText(`Pontuação Final: ${score}`, w / 2, h * 0.48);

        // Rating
        let rating = '';
        if (score >= 2500) rating = '⭐⭐⭐ Mestre das Equações!';
        else if (score >= 1500) rating = '⭐⭐ Muito Bom!';
        else rating = '⭐ Bom Trabalho!';
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 20px Segoe UI, sans-serif';
        ctx.fillText(rating, w / 2, h * 0.56);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '16px Segoe UI, sans-serif';
        ctx.fillText(`Vidas restantes: ${lives}`, w / 2, h * 0.63);

        const btnW = 200;
        const btnH = 50;
        const btnX = (w - btnW) / 2;
        const btnY = h * 0.72;
        restartButton = { x: btnX, y: btnY, w: btnW, h: btnH };
        drawButton(btnX, btnY, btnW, btnH, 'JOGAR NOVAMENTE', '#7c3aed', false, '#a855f7');
    }

    // --- Flash Overlay ---
    function drawFlash() {
        if (flashAlpha > 0) {
            ctx.fillStyle = flashColor;
            ctx.globalAlpha = flashAlpha;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
        }
    }

    // --- Input Handling ---
    function getClickPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function hitTest(pos, rect) {
        return pos.x >= rect.x && pos.x <= rect.x + rect.w &&
               pos.y >= rect.y && pos.y <= rect.y + rect.h;
    }

    function handleInput(e) {
        e.preventDefault();
        ensureAudio();
        const pos = getClickPos(e);

        if (state === 'menu') {
            if (hitTest(pos, menuButton)) {
                sfxClick();
                startGame();
            }
        } else if (state === 'question') {
            for (let i = 0; i < answerButtons.length; i++) {
                if (hitTest(pos, answerButtons[i])) {
                    handleAnswer(i);
                    break;
                }
            }
        } else if (state === 'levelUp') {
            if (hitTest(pos, menuButton)) {
                sfxClick();
                advanceLevel();
            }
        } else if (state === 'gameOver' || state === 'victory') {
            if (hitTest(pos, restartButton)) {
                sfxClick();
                state = 'menu';
            }
        }
    }

    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: false });

    // --- Update ---
    function update(timestamp) {
        if (!lastTime) lastTime = timestamp;
        dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        // Clamp dt for tab-away
        if (dt > 0.1) dt = 0.016;

        // Player movement
        if (state === 'question' || state === 'feedback') {
            playerX += (playerTargetX - playerX) * 0.08;
        }
        playerBob += dt * 3;

        // Question timer
        if (state === 'question') {
            questionTimer -= dt;
            if (questionTimer <= 0) {
                questionTimer = 0;
                handleTimeout();
            }
        }

        // Feedback timer
        if (state === 'feedback') {
            feedbackTimer -= dt;
            if (feedbackTimer <= 0) {
                if (lives <= 0) {
                    state = 'gameOver';
                    sfxGameOver();
                } else {
                    questionIndex++;
                    const stations = getStationPositions();
                    if (questionIndex < stations.length) {
                        playerTargetX = stations[questionIndex];
                    }
                    nextQuestion();
                }
            }
        }

        // Flash decay
        if (flashAlpha > 0) {
            flashAlpha -= dt * 0.5;
            if (flashAlpha < 0) flashAlpha = 0;
        }

        updateParticles();
        updateFloatingTexts();
    }

    // --- Render ---
    function render() {
        drawBackground();

        if (state === 'menu') {
            drawMenu();
        } else if (state === 'question' || state === 'feedback') {
            drawHUD();
            drawPath();
            drawTimer();
            drawQuestionPanel();
            drawFlash();
        } else if (state === 'levelUp') {
            drawHUD();
            drawLevelUp();
        } else if (state === 'gameOver') {
            drawGameOver();
        } else if (state === 'victory') {
            drawVictory();
        }

        drawParticles();
        drawFloatingTexts();
    }

    // --- Game Loop ---
    function gameLoop(timestamp) {
        update(timestamp);
        render();
        requestAnimationFrame(gameLoop);
    }

    // --- Initialize ---
    function init() {
        const loading = document.getElementById('loading');
        // Short delay to show loading screen
        setTimeout(() => {
            if (loading) loading.style.display = 'none';
            const stations = getStationPositions();
            playerX = stations[0];
            playerTargetX = stations[0];
            requestAnimationFrame(gameLoop);
        }, 600);
    }

    init();
})();
