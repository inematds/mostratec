// ============================================================
// English Kids - Primeiras palavras em ingles para criancas
// Jogo educativo para 1o e 2o ano (6-7 anos)
// ============================================================

(function () {
    'use strict';

    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, scale = 1;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        scale = Math.min(W / 800, H / 600);
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Audio Context (Web Audio API) ---
    let audioCtx = null;
    function ensureAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playTone(freq, duration, type, vol) {
        try {
            ensureAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol || 0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) { /* silent */ }
    }

    function sfxCorrect() {
        playTone(523, 0.12, 'sine', 0.18);
        setTimeout(() => playTone(659, 0.12, 'sine', 0.18), 100);
        setTimeout(() => playTone(784, 0.25, 'sine', 0.18), 200);
    }

    function sfxWrong() {
        playTone(220, 0.3, 'sawtooth', 0.1);
    }

    function sfxClick() {
        playTone(440, 0.06, 'sine', 0.1);
    }

    function sfxStar() {
        playTone(880, 0.08, 'sine', 0.12);
        setTimeout(() => playTone(1100, 0.12, 'sine', 0.12), 80);
    }

    function sfxLevelUp() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.15, 'sine', 0.15), i * 120);
        });
    }

    // --- Word Database ---
    const categories = [
        {
            name: 'Animais', nameEn: 'Animals', emoji: '🐾', color: '#10b981',
            words: [
                { en: 'dog', pt: 'cachorro', emoji: '🐶' },
                { en: 'cat', pt: 'gato', emoji: '🐱' },
                { en: 'bird', pt: 'passaro', emoji: '🐦' },
                { en: 'fish', pt: 'peixe', emoji: '🐟' },
                { en: 'horse', pt: 'cavalo', emoji: '🐴' },
                { en: 'cow', pt: 'vaca', emoji: '🐄' },
                { en: 'pig', pt: 'porco', emoji: '🐷' },
                { en: 'rabbit', pt: 'coelho', emoji: '🐰' },
                { en: 'duck', pt: 'pato', emoji: '🦆' },
                { en: 'frog', pt: 'sapo', emoji: '🐸' }
            ]
        },
        {
            name: 'Cores', nameEn: 'Colors', emoji: '🎨', color: '#8b5cf6',
            words: [
                { en: 'red', pt: 'vermelho', emoji: '🔴' },
                { en: 'blue', pt: 'azul', emoji: '🔵' },
                { en: 'green', pt: 'verde', emoji: '🟢' },
                { en: 'yellow', pt: 'amarelo', emoji: '🟡' },
                { en: 'pink', pt: 'rosa', emoji: '💗' },
                { en: 'orange', pt: 'laranja', emoji: '🟠' },
                { en: 'purple', pt: 'roxo', emoji: '🟣' },
                { en: 'black', pt: 'preto', emoji: '⚫' },
                { en: 'white', pt: 'branco', emoji: '⚪' }
            ]
        },
        {
            name: 'Numeros', nameEn: 'Numbers', emoji: '🔢', color: '#ef4444',
            words: [
                { en: 'one', pt: 'um', emoji: '1️⃣' },
                { en: 'two', pt: 'dois', emoji: '2️⃣' },
                { en: 'three', pt: 'tres', emoji: '3️⃣' },
                { en: 'four', pt: 'quatro', emoji: '4️⃣' },
                { en: 'five', pt: 'cinco', emoji: '5️⃣' },
                { en: 'six', pt: 'seis', emoji: '6️⃣' },
                { en: 'seven', pt: 'sete', emoji: '7️⃣' },
                { en: 'eight', pt: 'oito', emoji: '8️⃣' },
                { en: 'nine', pt: 'nove', emoji: '9️⃣' },
                { en: 'ten', pt: 'dez', emoji: '🔟' }
            ]
        },
        {
            name: 'Familia', nameEn: 'Family', emoji: '👨‍👩‍👧‍👦', color: '#f59e0b',
            words: [
                { en: 'mom', pt: 'mamae', emoji: '👩' },
                { en: 'dad', pt: 'papai', emoji: '👨' },
                { en: 'brother', pt: 'irmao', emoji: '👦' },
                { en: 'sister', pt: 'irma', emoji: '👧' },
                { en: 'baby', pt: 'bebe', emoji: '👶' },
                { en: 'grandma', pt: 'vovo', emoji: '👵' },
                { en: 'grandpa', pt: 'vovo', emoji: '👴' },
                { en: 'family', pt: 'familia', emoji: '👨‍👩‍👧‍👦' }
            ]
        },
        {
            name: 'Comida', nameEn: 'Food', emoji: '🍽️', color: '#ec4899',
            words: [
                { en: 'apple', pt: 'maca', emoji: '🍎' },
                { en: 'banana', pt: 'banana', emoji: '🍌' },
                { en: 'bread', pt: 'pao', emoji: '🍞' },
                { en: 'milk', pt: 'leite', emoji: '🥛' },
                { en: 'water', pt: 'agua', emoji: '💧' },
                { en: 'cake', pt: 'bolo', emoji: '🎂' },
                { en: 'rice', pt: 'arroz', emoji: '🍚' },
                { en: 'juice', pt: 'suco', emoji: '🧃' },
                { en: 'egg', pt: 'ovo', emoji: '🥚' }
            ]
        }
    ];

    // --- Encouraging Messages ---
    const encourageCorrect = [
        'Muito bem! 🌟', 'Parabens! ⭐', 'Voce e incrivel! 🎉',
        'Excelente! 💪', 'Que legal! 🥳', 'Continue assim! 🚀',
        'Perfeito! ✨', 'Arrasou! 🏆', 'Genial! 🧠', 'Mandou bem! 👏'
    ];
    const encourageWrong = [
        'Quase! Tente de novo! 💪', 'Nao desista! 🌈',
        'Voce consegue! ⭐', 'Vamos tentar outra vez! 🎯'
    ];

    function randomPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // --- Game State ---
    const STATE = {
        MENU: 0,
        CATEGORY_SELECT: 1,
        MODE_SELECT: 2,
        QUIZ: 3,
        MEMORY: 4,
        RESULT: 5,
        CELEBRATION: 6
    };

    let state = STATE.MENU;
    let selectedCategory = null;
    let gameMode = null; // 'quiz' or 'memory'
    let score = 0;
    let totalStars = 0;
    let streak = 0;
    let questionIndex = 0;
    let currentQuestion = null;
    let quizChoices = [];
    let feedbackMsg = '';
    let feedbackTimer = 0;
    let feedbackCorrect = false;
    let quizWords = [];
    let answered = false;

    // Memory game state
    let memoryCards = [];
    let memoryFlipped = [];
    let memoryMatched = [];
    let memoryLocked = false;
    let memoryPairs = 0;
    let memoryMoves = 0;

    // Buttons for current screen
    let buttons = [];

    // Confetti particles
    let confetti = [];

    // Stars floating
    let floatingStars = [];

    // Background particles
    let bgParticles = [];
    for (let i = 0; i < 30; i++) {
        bgParticles.push({
            x: Math.random() * 1200,
            y: Math.random() * 900,
            r: Math.random() * 3 + 1,
            speed: Math.random() * 0.3 + 0.1,
            alpha: Math.random() * 0.4 + 0.1
        });
    }

    // --- Confetti System ---
    function spawnConfetti(cx, cy, count) {
        for (let i = 0; i < count; i++) {
            confetti.push({
                x: cx, y: cy,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 1) * 10 - 3,
                size: Math.random() * 8 + 4,
                color: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 15,
                life: 1
            });
        }
    }

    function spawnFloatingStar(x, y) {
        floatingStars.push({
            x, y, vy: -2, alpha: 1, size: 30 * scale
        });
    }

    // --- Utility Drawing ---
    function drawRoundedRect(x, y, w, h, r, fill, stroke, lineW) {
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
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineW || 2; ctx.stroke(); }
    }

    function drawButton(btn) {
        const hover = btn.hover || false;
        const baseColor = btn.color || '#3b82f6';
        const darkerColor = btn.darkColor || shadeColor(baseColor, -20);
        const shadowY = hover ? 2 : 4;

        // Shadow
        drawRoundedRect(btn.x + 2, btn.y + shadowY, btn.w, btn.h, btn.r || 16, 'rgba(0,0,0,0.3)');
        // Button body
        const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, darkerColor);
        drawRoundedRect(btn.x, btn.y - (hover ? 2 : 0), btn.w, btn.h, btn.r || 16, gradient, 'rgba(255,255,255,0.2)', 2);

        // Top highlight
        ctx.save();
        ctx.globalAlpha = 0.15;
        drawRoundedRect(btn.x + 4, btn.y - (hover ? 2 : 0) + 2, btn.w - 8, btn.h / 2 - 4, (btn.r || 16) - 2, '#fff');
        ctx.restore();

        // Text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (btn.emoji) {
            const fontSize = btn.fontSize || Math.round(22 * scale);
            ctx.font = `${Math.round(fontSize * 1.3)}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
            ctx.fillText(btn.emoji, btn.x + btn.w / 2, btn.y + btn.h / 2 - fontSize * 0.7 - (hover ? 2 : 0));
            ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
            ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + fontSize * 0.6 - (hover ? 2 : 0));
        } else {
            const fontSize = btn.fontSize || Math.round(22 * scale);
            ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
            ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 - (hover ? 2 : 0));
        }
    }

    function shadeColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    function drawText(text, x, y, size, color, align, baseline, maxW) {
        ctx.fillStyle = color || '#fff';
        ctx.textAlign = align || 'center';
        ctx.textBaseline = baseline || 'middle';
        ctx.font = `bold ${size}px 'Segoe UI', sans-serif`;
        if (maxW) {
            ctx.fillText(text, x, y, maxW);
        } else {
            ctx.fillText(text, x, y);
        }
    }

    function drawEmoji(emoji, x, y, size) {
        ctx.font = `${size}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x, y);
    }

    function drawStarsBar() {
        const starSize = 24 * scale;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        drawRoundedRect(W - 160 * scale, 10, 150 * scale, 40 * scale, 12, 'rgba(0,0,0,0.4)');
        drawEmoji('⭐', W - 135 * scale, 30 * scale, starSize);
        drawText(`${totalStars}`, W - 100 * scale, 30 * scale, 20 * scale, '#fbbf24', 'left');

        // Score
        drawRoundedRect(10, 10, 150 * scale, 40 * scale, 12, 'rgba(0,0,0,0.4)');
        drawText(`Pontos: ${score}`, 85 * scale, 30 * scale, 18 * scale, '#fff');
    }

    function drawBackButton() {
        const btn = {
            x: 15, y: H - 60 * scale, w: 100 * scale, h: 44 * scale,
            r: 12, color: '#64748b', darkColor: '#475569',
            label: 'Voltar', fontSize: Math.round(16 * scale),
            action: 'back'
        };
        buttons.push(btn);
        drawButton(btn);
    }

    // --- Background ---
    function drawBackground() {
        // Dark gradient background
        const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(1, '#0d0d18');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Floating particles
        bgParticles.forEach(p => {
            p.y -= p.speed;
            if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
            ctx.fill();
        });
    }

    // --- SCREENS ---

    // MENU
    function drawMenu() {
        buttons = [];
        drawBackground();

        // Title
        const titleY = H * 0.15;
        drawEmoji('🇬🇧', W / 2, titleY, 70 * scale);
        drawText('English Kids', W / 2, titleY + 60 * scale, 48 * scale, '#f59e0b');
        drawText('Aprenda ingles brincando!', W / 2, titleY + 100 * scale, 22 * scale, 'rgba(255,255,255,0.7)');

        // Floating emojis decoration
        const t = Date.now() / 1000;
        const decoEmojis = ['🐶', '🍎', '🔵', '👨‍👩‍👧‍👦', '🔢'];
        decoEmojis.forEach((em, i) => {
            const angle = t * 0.5 + (i * Math.PI * 2 / decoEmojis.length);
            const radius = 100 * scale;
            const ex = W / 2 + Math.cos(angle) * radius;
            const ey = titleY + Math.sin(angle) * radius * 0.4;
            drawEmoji(em, ex, ey, 28 * scale);
        });

        // Play button
        const btnW = 280 * scale;
        const btnH = 70 * scale;
        const playBtn = {
            x: W / 2 - btnW / 2, y: H * 0.45, w: btnW, h: btnH,
            r: 20, color: '#10b981', darkColor: '#059669',
            emoji: '🎮', label: 'Jogar!', fontSize: Math.round(26 * scale),
            action: 'play'
        };
        buttons.push(playBtn);
        drawButton(playBtn);

        // Mode quick buttons
        const qBtnW = 220 * scale;
        const qBtnH = 56 * scale;

        const quizBtn = {
            x: W / 2 - qBtnW / 2, y: H * 0.62, w: qBtnW, h: qBtnH,
            r: 16, color: '#3b82f6', darkColor: '#2563eb',
            emoji: '❓', label: 'Qual e a palavra?', fontSize: Math.round(18 * scale),
            action: 'quickQuiz'
        };
        buttons.push(quizBtn);
        drawButton(quizBtn);

        const memBtn = {
            x: W / 2 - qBtnW / 2, y: H * 0.75, w: qBtnW, h: qBtnH,
            r: 16, color: '#8b5cf6', darkColor: '#7c3aed',
            emoji: '🃏', label: 'Jogo da Memoria', fontSize: Math.round(18 * scale),
            action: 'quickMemory'
        };
        buttons.push(memBtn);
        drawButton(memBtn);

        // Footer
        drawText('Toque para comecar!', W / 2, H - 30 * scale, 16 * scale, 'rgba(255,255,255,0.4)');
    }

    // CATEGORY SELECT
    function drawCategorySelect() {
        buttons = [];
        drawBackground();

        drawText('Escolha uma categoria:', W / 2, 50 * scale, 28 * scale, '#f59e0b');

        const cols = W > 600 ? 3 : 2;
        const btnW = Math.min(200 * scale, (W - 40) / cols - 20);
        const btnH = 100 * scale;
        const startX = (W - (cols * (btnW + 15) - 15)) / 2;
        const startY = 100 * scale;

        categories.forEach((cat, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const bx = startX + col * (btnW + 15);
            const by = startY + row * (btnH + 15);

            const btn = {
                x: bx, y: by, w: btnW, h: btnH,
                r: 16, color: cat.color, darkColor: shadeColor(cat.color, -20),
                emoji: cat.emoji, label: cat.name, fontSize: Math.round(18 * scale),
                action: 'category', data: i
            };
            buttons.push(btn);
            drawButton(btn);
        });

        // All categories button
        const allBtnW = 250 * scale;
        const allBtnH = 56 * scale;
        const allY = startY + (Math.ceil(categories.length / cols)) * (btnH + 15) + 10;
        const allBtn = {
            x: W / 2 - allBtnW / 2, y: Math.min(allY, H - 120 * scale),
            w: allBtnW, h: allBtnH,
            r: 16, color: '#f59e0b', darkColor: '#d97706',
            emoji: '🌟', label: 'Todas as categorias!', fontSize: Math.round(18 * scale),
            action: 'categoryAll'
        };
        buttons.push(allBtn);
        drawButton(allBtn);

        drawBackButton();
    }

    // MODE SELECT
    function drawModeSelect() {
        buttons = [];
        drawBackground();

        const catName = selectedCategory ? selectedCategory.name : 'Todas';
        drawText(`Categoria: ${catName}`, W / 2, 50 * scale, 26 * scale, '#f59e0b');
        drawText('Escolha o modo de jogo:', W / 2, 90 * scale, 22 * scale, 'rgba(255,255,255,0.7)');

        const btnW = 280 * scale;
        const btnH = 90 * scale;

        const quizBtn = {
            x: W / 2 - btnW / 2, y: H * 0.3, w: btnW, h: btnH,
            r: 20, color: '#3b82f6', darkColor: '#2563eb',
            emoji: '❓', label: 'Qual e a palavra?', fontSize: Math.round(22 * scale),
            action: 'startQuiz'
        };
        buttons.push(quizBtn);
        drawButton(quizBtn);

        drawText('Veja o emoji e escolha a palavra certa!', W / 2, H * 0.3 + btnH + 20 * scale, 16 * scale, 'rgba(255,255,255,0.5)');

        const memBtn = {
            x: W / 2 - btnW / 2, y: H * 0.55, w: btnW, h: btnH,
            r: 20, color: '#8b5cf6', darkColor: '#7c3aed',
            emoji: '🃏', label: 'Jogo da Memoria', fontSize: Math.round(22 * scale),
            action: 'startMemory'
        };
        buttons.push(memBtn);
        drawButton(memBtn);

        drawText('Encontre os pares: palavra e emoji!', W / 2, H * 0.55 + btnH + 20 * scale, 16 * scale, 'rgba(255,255,255,0.5)');

        drawBackButton();
    }

    // --- QUIZ MODE ---
    function startQuiz(words) {
        quizWords = shuffleArray([...words]);
        if (quizWords.length > 10) quizWords = quizWords.slice(0, 10);
        questionIndex = 0;
        score = 0;
        streak = 0;
        nextQuestion();
        state = STATE.QUIZ;
    }

    function nextQuestion() {
        if (questionIndex >= quizWords.length) {
            state = STATE.RESULT;
            sfxLevelUp();
            spawnConfetti(W / 2, H / 2, 80);
            return;
        }
        const word = quizWords[questionIndex];
        currentQuestion = word;
        answered = false;
        feedbackMsg = '';
        feedbackTimer = 0;

        // Create 3 choices including the correct one
        const allWords = getActiveWords();
        let wrongOptions = allWords.filter(w => w.en !== word.en);
        wrongOptions = shuffleArray(wrongOptions).slice(0, 2);
        quizChoices = shuffleArray([word, ...wrongOptions]);
    }

    function getActiveWords() {
        if (selectedCategory) return selectedCategory.words;
        let all = [];
        categories.forEach(c => all = all.concat(c.words));
        return all;
    }

    function drawQuiz() {
        buttons = [];
        drawBackground();
        drawStarsBar();

        // Progress bar
        const progW = W * 0.6;
        const progH = 12 * scale;
        const progX = (W - progW) / 2;
        const progY = 55 * scale;
        drawRoundedRect(progX, progY, progW, progH, 6, 'rgba(255,255,255,0.1)');
        const fill = (questionIndex / quizWords.length) * progW;
        if (fill > 0) drawRoundedRect(progX, progY, fill, progH, 6, '#f59e0b');
        drawText(`${questionIndex + 1}/${quizWords.length}`, W / 2, progY + progH + 18 * scale, 16 * scale, 'rgba(255,255,255,0.5)');

        if (!currentQuestion) return;

        // Show emoji and Portuguese word
        const emojiY = H * 0.25;
        drawEmoji(currentQuestion.emoji, W / 2, emojiY, 80 * scale);
        drawText(currentQuestion.pt, W / 2, emojiY + 60 * scale, 28 * scale, '#fff');
        drawText('Qual e em ingles?', W / 2, emojiY + 95 * scale, 20 * scale, 'rgba(255,255,255,0.6)');

        // Choice buttons
        const btnW = Math.min(260 * scale, W - 40);
        const btnH = 60 * scale;
        const startY = H * 0.5;

        quizChoices.forEach((choice, i) => {
            let btnColor = '#3b82f6';
            let btnDark = '#2563eb';
            if (answered) {
                if (choice.en === currentQuestion.en) {
                    btnColor = '#10b981';
                    btnDark = '#059669';
                } else if (choice === quizChoices.find(c => c.selected && c.en !== currentQuestion.en)) {
                    btnColor = '#ef4444';
                    btnDark = '#dc2626';
                }
            }

            const btn = {
                x: W / 2 - btnW / 2, y: startY + i * (btnH + 12), w: btnW, h: btnH,
                r: 16, color: btnColor, darkColor: btnDark,
                label: choice.en.toUpperCase(), fontSize: Math.round(24 * scale),
                action: 'answer', data: i
            };
            buttons.push(btn);
            drawButton(btn);
        });

        // Feedback message
        if (feedbackMsg) {
            const fbY = H * 0.85;
            const fbColor = feedbackCorrect ? '#10b981' : '#ef4444';
            drawText(feedbackMsg, W / 2, fbY, 24 * scale, fbColor);

            if (feedbackCorrect && currentQuestion) {
                drawText(`${currentQuestion.en} = ${currentQuestion.pt}`, W / 2, fbY + 30 * scale, 18 * scale, 'rgba(255,255,255,0.6)');
            }
        }

        // Streak indicator
        if (streak >= 2) {
            drawText(`Sequencia: ${streak} 🔥`, W / 2, H - 20 * scale, 18 * scale, '#f59e0b');
        }
    }

    function handleQuizAnswer(choiceIndex) {
        if (answered) return;
        answered = true;
        const chosen = quizChoices[choiceIndex];
        chosen.selected = true;

        if (chosen.en === currentQuestion.en) {
            feedbackCorrect = true;
            feedbackMsg = randomPick(encourageCorrect);
            streak++;
            const points = 10 + (streak >= 3 ? 5 : 0);
            score += points;
            totalStars++;
            sfxCorrect();
            spawnConfetti(W / 2, H * 0.5, 30);
            spawnFloatingStar(W / 2, H * 0.4);
        } else {
            feedbackCorrect = false;
            feedbackMsg = randomPick(encourageWrong);
            streak = 0;
            sfxWrong();
        }

        feedbackTimer = Date.now();
        setTimeout(() => {
            questionIndex++;
            nextQuestion();
        }, 1800);
    }

    // --- MEMORY MODE ---
    function startMemory(words) {
        let pool = shuffleArray([...words]);
        const pairCount = Math.min(6, pool.length);
        pool = pool.slice(0, pairCount);

        memoryCards = [];
        pool.forEach((word, i) => {
            memoryCards.push({ id: i * 2, pairId: i, type: 'word', text: word.en, emoji: '', word });
            memoryCards.push({ id: i * 2 + 1, pairId: i, type: 'emoji', text: '', emoji: word.emoji, word });
        });
        memoryCards = shuffleArray(memoryCards);
        memoryFlipped = [];
        memoryMatched = [];
        memoryLocked = false;
        memoryPairs = 0;
        memoryMoves = 0;
        score = 0;
        state = STATE.MEMORY;
    }

    function drawMemory() {
        buttons = [];
        drawBackground();
        drawStarsBar();

        drawText('Jogo da Memoria', W / 2, 50 * scale, 26 * scale, '#f59e0b');
        drawText(`Pares: ${memoryPairs}/${memoryCards.length / 2}  |  Jogadas: ${memoryMoves}`, W / 2, 80 * scale, 16 * scale, 'rgba(255,255,255,0.6)');

        const totalCards = memoryCards.length;
        const cols = totalCards <= 8 ? 4 : (W > 500 ? 4 : 3);
        const rows = Math.ceil(totalCards / cols);
        const cardW = Math.min(110 * scale, (W - 30) / cols - 10);
        const cardH = cardW * 1.1;
        const gap = 10;
        const gridW = cols * (cardW + gap) - gap;
        const gridH = rows * (cardH + gap) - gap;
        const startX = (W - gridW) / 2;
        const startY = (H - gridH) / 2 + 20 * scale;

        memoryCards.forEach((card, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cx = startX + col * (cardW + gap);
            const cy = startY + row * (cardH + gap);

            const isFlipped = memoryFlipped.includes(i) || memoryMatched.includes(card.pairId);
            const isMatched = memoryMatched.includes(card.pairId);

            if (isMatched) {
                // Matched card - green
                drawRoundedRect(cx, cy, cardW, cardH, 12, 'rgba(16, 185, 129, 0.3)', '#10b981', 2);
            } else if (isFlipped) {
                // Flipped card - blue
                drawRoundedRect(cx, cy, cardW, cardH, 12, 'rgba(59, 130, 246, 0.3)', '#3b82f6', 2);
            } else {
                // Face down
                drawRoundedRect(cx, cy, cardW, cardH, 12, 'rgba(100, 116, 139, 0.3)', '#64748b', 2);
                drawEmoji('❓', cx + cardW / 2, cy + cardH / 2, 30 * scale);
            }

            if (isFlipped || isMatched) {
                if (card.type === 'emoji') {
                    drawEmoji(card.emoji, cx + cardW / 2, cy + cardH / 2, 36 * scale);
                } else {
                    drawText(card.text.toUpperCase(), cx + cardW / 2, cy + cardH / 2, 18 * scale, '#fff', 'center', 'middle', cardW - 10);
                }
            }

            // Register clickable area (only for face-down cards)
            if (!isFlipped && !isMatched && !memoryLocked) {
                const btn = {
                    x: cx, y: cy, w: cardW, h: cardH,
                    action: 'flipCard', data: i, silent: true
                };
                buttons.push(btn);
            }
        });

        drawBackButton();

        // Feedback
        if (feedbackMsg) {
            drawText(feedbackMsg, W / 2, H - 60 * scale, 22 * scale, feedbackCorrect ? '#10b981' : '#ef4444');
        }
    }

    function handleFlipCard(cardIndex) {
        if (memoryLocked) return;
        if (memoryFlipped.includes(cardIndex)) return;
        if (memoryMatched.includes(memoryCards[cardIndex].pairId)) return;

        sfxClick();
        memoryFlipped.push(cardIndex);

        if (memoryFlipped.length === 2) {
            memoryLocked = true;
            memoryMoves++;
            const c1 = memoryCards[memoryFlipped[0]];
            const c2 = memoryCards[memoryFlipped[1]];

            if (c1.pairId === c2.pairId) {
                // Match!
                memoryMatched.push(c1.pairId);
                memoryPairs++;
                score += 20;
                totalStars++;
                feedbackCorrect = true;
                feedbackMsg = `${c1.word.emoji} ${c1.word.en} = ${c1.word.pt}!`;
                sfxCorrect();
                spawnConfetti(W / 2, H / 2, 20);
                spawnFloatingStar(W / 2, H * 0.3);

                setTimeout(() => {
                    memoryFlipped = [];
                    memoryLocked = false;
                    feedbackMsg = '';
                    if (memoryPairs === memoryCards.length / 2) {
                        state = STATE.RESULT;
                        sfxLevelUp();
                        spawnConfetti(W / 2, H / 2, 100);
                    }
                }, 1000);
            } else {
                feedbackCorrect = false;
                feedbackMsg = 'Tente de novo!';
                sfxWrong();
                setTimeout(() => {
                    memoryFlipped = [];
                    memoryLocked = false;
                    feedbackMsg = '';
                }, 1200);
            }
        }
    }

    // --- RESULT SCREEN ---
    function drawResult() {
        buttons = [];
        drawBackground();

        const cy = H * 0.15;
        drawEmoji('🏆', W / 2, cy, 70 * scale);
        drawText('Parabens!', W / 2, cy + 60 * scale, 40 * scale, '#f59e0b');
        drawText('Voce terminou!', W / 2, cy + 100 * scale, 24 * scale, 'rgba(255,255,255,0.7)');

        // Score display
        drawRoundedRect(W / 2 - 130 * scale, H * 0.4, 260 * scale, 100 * scale, 20, 'rgba(245,158,11,0.15)', '#f59e0b', 2);
        drawText('Pontuacao', W / 2, H * 0.4 + 25 * scale, 20 * scale, 'rgba(255,255,255,0.7)');
        drawText(`${score}`, W / 2, H * 0.4 + 60 * scale, 36 * scale, '#f59e0b');
        drawEmoji('⭐', W / 2 + 60 * scale, H * 0.4 + 60 * scale, 28 * scale);

        // Stars earned
        const starsEarned = gameMode === 'quiz' ? quizWords.length : memoryCards.length / 2;
        const earned = gameMode === 'quiz' ? Math.min(totalStars, starsEarned) : memoryPairs;
        drawText(`Estrelas ganhas: ${earned}`, W / 2, H * 0.6, 22 * scale, '#fbbf24');

        // Buttons
        const btnW = 220 * scale;
        const btnH = 56 * scale;

        const againBtn = {
            x: W / 2 - btnW / 2, y: H * 0.68, w: btnW, h: btnH,
            r: 16, color: '#10b981', darkColor: '#059669',
            emoji: '🔄', label: 'Jogar de novo', fontSize: Math.round(20 * scale),
            action: 'playAgain'
        };
        buttons.push(againBtn);
        drawButton(againBtn);

        const menuBtn = {
            x: W / 2 - btnW / 2, y: H * 0.8, w: btnW, h: btnH,
            r: 16, color: '#3b82f6', darkColor: '#2563eb',
            emoji: '🏠', label: 'Menu', fontSize: Math.round(20 * scale),
            action: 'goMenu'
        };
        buttons.push(menuBtn);
        drawButton(menuBtn);
    }

    // --- EFFECTS ---
    function updateEffects() {
        // Update confetti
        for (let i = confetti.length - 1; i >= 0; i--) {
            const p = confetti[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25;
            p.rotation += p.rotSpeed;
            p.life -= 0.012;
            if (p.life <= 0 || p.y > H + 20) confetti.splice(i, 1);
        }

        // Update floating stars
        for (let i = floatingStars.length - 1; i >= 0; i--) {
            const s = floatingStars[i];
            s.y += s.vy;
            s.alpha -= 0.015;
            if (s.alpha <= 0) floatingStars.splice(i, 1);
        }
    }

    function drawEffects() {
        // Draw confetti
        confetti.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        });

        // Draw floating stars
        floatingStars.forEach(s => {
            ctx.globalAlpha = s.alpha;
            drawEmoji('⭐', s.x, s.y, s.size);
            ctx.globalAlpha = 1;
        });
    }

    // --- SHUFFLE ---
    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // --- INPUT ---
    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return {
            x: (touch.clientX - rect.left),
            y: (touch.clientY - rect.top)
        };
    }

    function handleClick(e) {
        e.preventDefault();
        ensureAudio();
        const pos = getPointerPos(e);

        for (const btn of buttons) {
            if (pos.x >= btn.x && pos.x <= btn.x + btn.w &&
                pos.y >= btn.y && pos.y <= btn.y + btn.h) {
                if (!btn.silent) sfxClick();
                handleAction(btn.action, btn.data);
                return;
            }
        }
    }

    function handleAction(action, data) {
        switch (action) {
            case 'play':
                state = STATE.CATEGORY_SELECT;
                break;
            case 'quickQuiz':
                selectedCategory = null;
                gameMode = 'quiz';
                startQuiz(getActiveWords());
                break;
            case 'quickMemory':
                selectedCategory = null;
                gameMode = 'memory';
                startMemory(getActiveWords());
                break;
            case 'category':
                selectedCategory = categories[data];
                state = STATE.MODE_SELECT;
                break;
            case 'categoryAll':
                selectedCategory = null;
                state = STATE.MODE_SELECT;
                break;
            case 'startQuiz':
                gameMode = 'quiz';
                startQuiz(getActiveWords());
                break;
            case 'startMemory':
                gameMode = 'memory';
                startMemory(getActiveWords());
                break;
            case 'answer':
                handleQuizAnswer(data);
                break;
            case 'flipCard':
                handleFlipCard(data);
                break;
            case 'playAgain':
                if (gameMode === 'quiz') {
                    startQuiz(getActiveWords());
                } else {
                    startMemory(getActiveWords());
                }
                break;
            case 'goMenu':
                state = STATE.MENU;
                break;
            case 'back':
                if (state === STATE.QUIZ || state === STATE.MEMORY) {
                    state = STATE.MODE_SELECT;
                } else if (state === STATE.MODE_SELECT) {
                    state = STATE.CATEGORY_SELECT;
                } else if (state === STATE.CATEGORY_SELECT) {
                    state = STATE.MENU;
                } else {
                    state = STATE.MENU;
                }
                break;
        }
    }

    canvas.addEventListener('mousedown', handleClick);
    canvas.addEventListener('touchstart', handleClick, { passive: false });

    // Hover effect for desktop
    canvas.addEventListener('mousemove', (e) => {
        const pos = getPointerPos(e);
        let hovering = false;
        for (const btn of buttons) {
            btn.hover = (pos.x >= btn.x && pos.x <= btn.x + btn.w &&
                pos.y >= btn.y && pos.y <= btn.y + btn.h);
            if (btn.hover) hovering = true;
        }
        canvas.style.cursor = hovering ? 'pointer' : 'default';
    });

    // --- MAIN LOOP ---
    function gameLoop() {
        resize();
        updateEffects();

        switch (state) {
            case STATE.MENU: drawMenu(); break;
            case STATE.CATEGORY_SELECT: drawCategorySelect(); break;
            case STATE.MODE_SELECT: drawModeSelect(); break;
            case STATE.QUIZ: drawQuiz(); break;
            case STATE.MEMORY: drawMemory(); break;
            case STATE.RESULT: drawResult(); break;
        }

        drawEffects();
        requestAnimationFrame(gameLoop);
    }

    // --- INIT ---
    window.addEventListener('load', () => {
        const loading = document.getElementById('loading');
        setTimeout(() => {
            loading.style.display = 'none';
            gameLoop();
        }, 600);
    });

})();
