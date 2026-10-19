// ============================================================
// EDUCACAO FINANCEIRA - Jogo de Simulacao de Vida Financeira
// Publico: 6o ao 9o ano (Ensino Fundamental II)
// Categoria: Transversal - Educacao Financeira
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

    // --- Audio Engine ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
    }

    function playTone(freq, dur, type, vol) {
        try {
            ensureAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol || 0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + dur);
        } catch (e) { /* silently ignore audio errors */ }
    }

    function sfxClick() { playTone(600, 0.08, 'square', 0.1); }
    function sfxCoin() { playTone(880, 0.12, 'sine', 0.15); playTone(1320, 0.15, 'sine', 0.12); }
    function sfxBad() { playTone(200, 0.3, 'sawtooth', 0.1); }
    function sfxGood() { playTone(523, 0.1, 'sine', 0.12); setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80); setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 160); }
    function sfxMonth() { playTone(440, 0.15, 'triangle', 0.1); setTimeout(() => playTone(660, 0.2, 'triangle', 0.12), 120); }
    function sfxEnd() { playTone(523, 0.2, 'sine', 0.15); setTimeout(() => playTone(659, 0.2, 'sine', 0.15), 150); setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 300); setTimeout(() => playTone(1047, 0.4, 'sine', 0.18), 450); }

    // --- Particles ---
    let particles = [];
    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 2,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
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
            p.vy += 0.1;
            p.life -= p.decay;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // --- Floating Texts ---
    let floatingTexts = [];
    function addFloatingText(x, y, text, color) {
        floatingTexts.push({ x, y, text, color, life: 1, vy: -1.5 });
    }

    function updateFloatingTexts() {
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y += ft.vy;
            ft.life -= 0.015;
            if (ft.life <= 0) floatingTexts.splice(i, 1);
        }
    }

    function drawFloatingTexts() {
        floatingTexts.forEach(ft => {
            ctx.globalAlpha = ft.life;
            ctx.fillStyle = ft.color;
            ctx.font = `bold ${16 * scale}px 'Segoe UI', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
        });
        ctx.globalAlpha = 1;
    }

    // --- Month Names ---
    const MONTH_NAMES = [
        'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // --- Game State ---
    const SALARY = 2000;
    let state = 'menu'; // menu, intro, playing, monthSummary, decision, event, endgame
    let month = 0;
    let saldo = 0;
    let poupanca = 0;
    let investimentos = 0;
    let totalGastos = 0;
    let totalGanhosExtra = 0;
    let monthlyHistory = [];
    let currentDecisions = [];
    let currentDecisionIndex = 0;
    let currentEvent = null;
    let monthExpenses = { necessidades: 0, desejos: 0, poupancaMes: 0, investMes: 0 };
    let animTimer = 0;
    let transitionAlpha = 0;
    let transitioning = false;
    let transitionCallback = null;
    let buttons = [];
    let tooltip = '';
    let score = 0;
    let financialTips = [];
    let decisionsLog = [];

    // --- Decision Pools ---
    const NECESSIDADE_DECISIONS = [
        {
            title: 'Aluguel',
            desc: 'Hora de pagar o aluguel do mes.',
            options: [
                { text: 'Apartamento padrao (R$ 600)', cost: 600, category: 'necessidades', feedback: 'Moradia segura e confortavel!' },
                { text: 'Quarto mais barato (R$ 350)', cost: 350, category: 'necessidades', feedback: 'Economizou no aluguel. Esperto!' },
                { text: 'Apartamento luxo (R$ 900)', cost: 900, category: 'desejos', feedback: 'Luxo tem seu preco...' }
            ]
        },
        {
            title: 'Alimentacao',
            desc: 'Como voce vai se alimentar este mes?',
            options: [
                { text: 'Cozinhar em casa (R$ 300)', cost: 300, category: 'necessidades', feedback: 'Saudavel e economico!' },
                { text: 'Misto: casa + restaurante (R$ 500)', cost: 500, category: 'necessidades', feedback: 'Equilibrio razoavel.' },
                { text: 'Delivery todo dia (R$ 800)', cost: 800, category: 'desejos', feedback: 'Pratico, mas caro!' }
            ]
        },
        {
            title: 'Transporte',
            desc: 'Como vai se locomover este mes?',
            options: [
                { text: 'Onibus / metro (R$ 150)', cost: 150, category: 'necessidades', feedback: 'Transporte publico e inteligente!' },
                { text: 'Bicicleta + onibus (R$ 80)', cost: 80, category: 'necessidades', feedback: 'Saudavel e barato! Otima escolha!' },
                { text: 'Uber / taxi (R$ 400)', cost: 400, category: 'desejos', feedback: 'Conforto com custo alto.' }
            ]
        },
        {
            title: 'Conta de Luz e Agua',
            desc: 'As contas de consumo chegaram.',
            options: [
                { text: 'Economizar energia (R$ 120)', cost: 120, category: 'necessidades', feedback: 'Consciencia ambiental e financeira!' },
                { text: 'Uso normal (R$ 200)', cost: 200, category: 'necessidades', feedback: 'Contas dentro do esperado.' },
                { text: 'Ar-condicionado ligado (R$ 350)', cost: 350, category: 'desejos', feedback: 'Conforto custa caro na conta.' }
            ]
        },
        {
            title: 'Saude',
            desc: 'Cuidar da saude e fundamental.',
            options: [
                { text: 'Posto de saude gratuito (R$ 0)', cost: 0, category: 'necessidades', feedback: 'SUS e um direito de todos!' },
                { text: 'Plano basico (R$ 150)', cost: 150, category: 'necessidades', feedback: 'Prevencao e importante.' },
                { text: 'Plano premium (R$ 400)', cost: 400, category: 'desejos', feedback: 'Cobertura completa, mas e caro.' }
            ]
        }
    ];

    const DESEJO_DECISIONS = [
        {
            title: 'Entretenimento',
            desc: 'O que fazer para se divertir?',
            options: [
                { text: 'Parque gratuito (R$ 0)', cost: 0, category: 'necessidades', feedback: 'Diversao nao precisa custar caro!' },
                { text: 'Cinema + lanche (R$ 80)', cost: 80, category: 'desejos', feedback: 'Lazer faz bem, com moderacao.' },
                { text: 'Show + balada (R$ 250)', cost: 250, category: 'desejos', feedback: 'Diversao cara! Sera que vale?' }
            ]
        },
        {
            title: 'Roupas',
            desc: 'Suas roupas estao ficando velhas.',
            options: [
                { text: 'Brechó (R$ 50)', cost: 50, category: 'necessidades', feedback: 'Sustentavel e economico!' },
                { text: 'Loja popular (R$ 150)', cost: 150, category: 'necessidades', feedback: 'Bom custo-beneficio.' },
                { text: 'Marca famosa (R$ 400)', cost: 400, category: 'desejos', feedback: 'Marca nao define qualidade!' }
            ]
        },
        {
            title: 'Tecnologia',
            desc: 'Seu celular esta antigo. O que fazer?',
            options: [
                { text: 'Manter o atual (R$ 0)', cost: 0, category: 'necessidades', feedback: 'Se funciona, nao troque!' },
                { text: 'Celular intermediario (R$ 200)', cost: 200, category: 'desejos', feedback: 'Upgrade razoavel.' },
                { text: 'Ultimo lancamento (R$ 600)', cost: 600, category: 'desejos', feedback: 'Sera que precisa do melhor?' }
            ]
        },
        {
            title: 'Assinaturas',
            desc: 'Servicos de streaming e apps.',
            options: [
                { text: 'Nenhuma assinatura (R$ 0)', cost: 0, category: 'necessidades', feedback: 'Ha muito conteudo gratuito!' },
                { text: 'Um streaming (R$ 30)', cost: 30, category: 'desejos', feedback: 'Um servico e suficiente.' },
                { text: 'Varios servicos (R$ 120)', cost: 120, category: 'desejos', feedback: 'Muitas assinaturas acumulam!' }
            ]
        },
        {
            title: 'Presente para Amigo',
            desc: 'Aniversario de um amigo proximo.',
            options: [
                { text: 'Presente feito a mao (R$ 10)', cost: 10, category: 'necessidades', feedback: 'Carinho vale mais que dinheiro!' },
                { text: 'Presente simples (R$ 60)', cost: 60, category: 'desejos', feedback: 'Gesto bonito e acessivel.' },
                { text: 'Presente caro (R$ 200)', cost: 200, category: 'desejos', feedback: 'Generoso, mas pesou no bolso.' }
            ]
        }
    ];

    const POUPANCA_DECISIONS = [
        {
            title: 'Poupanca',
            desc: 'Quanto guardar na poupanca este mes?',
            options: [
                { text: 'Guardar R$ 200', cost: -200, category: 'poupanca', feedback: 'Otimo! Poupanca e seguranca!' },
                { text: 'Guardar R$ 100', cost: -100, category: 'poupanca', feedback: 'Cada centavo conta!' },
                { text: 'Nao guardar nada', cost: 0, category: 'poupanca', feedback: 'Sem reserva? Cuidado com imprevistos!' }
            ]
        },
        {
            title: 'Reserva de Emergencia',
            desc: 'Especialistas recomendam ter uma reserva.',
            options: [
                { text: 'Separar R$ 300', cost: -300, category: 'poupanca', feedback: 'Excelente! Reserva forte!' },
                { text: 'Separar R$ 150', cost: -150, category: 'poupanca', feedback: 'Bom comeco de reserva!' },
                { text: 'Gastar tudo', cost: 0, category: 'poupanca', feedback: 'Viver sem reserva e arriscado.' }
            ]
        }
    ];

    const INVESTIMENTO_DECISIONS = [
        {
            title: 'Oportunidade de Investimento',
            desc: 'Um amigo oferece uma oportunidade de investir.',
            options: [
                { text: 'Investir R$ 200 (rend. 5%/mes)', cost: -200, category: 'investimento', returnRate: 0.05, feedback: 'Investimento moderado e seguro!' },
                { text: 'Investir R$ 100 (rend. 3%/mes)', cost: -100, category: 'investimento', returnRate: 0.03, feedback: 'Conservador, mas seguro.' },
                { text: 'Nao investir', cost: 0, category: 'investimento', feedback: 'Dinheiro parado perde valor com inflacao.' }
            ]
        },
        {
            title: 'Tesouro Direto',
            desc: 'Voce descobriu o Tesouro Direto do governo.',
            options: [
                { text: 'Investir R$ 250 (rend. 4%/mes)', cost: -250, category: 'investimento', returnRate: 0.04, feedback: 'Investimento seguro e inteligente!' },
                { text: 'Investir R$ 100 (rend. 4%/mes)', cost: -100, category: 'investimento', returnRate: 0.04, feedback: 'Comecando devagar. Otimo!' },
                { text: 'Ignorar', cost: 0, category: 'investimento', feedback: 'Perdeu uma boa oportunidade...' }
            ]
        },
        {
            title: 'Curso Online',
            desc: 'Um curso pode aumentar sua renda futura.',
            options: [
                { text: 'Curso completo (R$ 200)', cost: 200, category: 'investimento_pessoal', salaryBonus: 100, feedback: 'Investir em si mesmo e o melhor investimento!' },
                { text: 'Curso basico (R$ 80)', cost: 80, category: 'investimento_pessoal', salaryBonus: 40, feedback: 'Conhecimento nunca e desperdicio!' },
                { text: 'Nao fazer curso', cost: 0, category: 'investimento_pessoal', feedback: 'Sem novas habilidades desta vez.' }
            ]
        }
    ];

    const RANDOM_EVENTS = [
        { title: 'Conserto do Carro', desc: 'Seu carro quebrou e precisa de conserto urgente!', cost: 350, type: 'bad' },
        { title: 'Consulta Medica', desc: 'Uma dor inesperada levou voce ao medico.', cost: 200, type: 'bad' },
        { title: 'Celular Quebrou', desc: 'Seu celular caiu e a tela trincou!', cost: 250, type: 'bad' },
        { title: 'Conta Surpresa', desc: 'Uma cobranca inesperada apareceu!', cost: 180, type: 'bad' },
        { title: 'Vazamento em Casa', desc: 'Um cano estourou e precisa de encanador.', cost: 150, type: 'bad' },
        { title: 'Multa de Transito', desc: 'Voce recebeu uma multa inesperada.', cost: 200, type: 'bad' },
        { title: 'Freelance', desc: 'Voce conseguiu um trabalho extra!', cost: -400, type: 'good' },
        { title: 'Bonus no Trabalho', desc: 'Seu chefe reconheceu seu esforco!', cost: -300, type: 'good' },
        { title: 'Venda Online', desc: 'Vendeu algo que nao usava mais.', cost: -150, type: 'good' },
        { title: 'Cashback', desc: 'Recebeu cashback das compras do mes!', cost: -80, type: 'good' },
        { title: 'Premio', desc: 'Ganhou um pequeno premio numa promocao!', cost: -200, type: 'good' }
    ];

    // --- Salary Bonus from courses ---
    let salaryBonus = 0;

    // --- Helper: format currency ---
    function formatMoney(val) {
        return 'R$ ' + val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    // --- Helper: draw rounded rect ---
    function roundRect(x, y, w, h, r, fillColor, strokeColor) {
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
        if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
        if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke(); }
    }

    // --- Helper: wrap text ---
    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        for (const word of words) {
            const test = line + (line ? ' ' : '') + word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    // --- Button System ---
    function addButton(x, y, w, h, text, callback, color, textColor) {
        buttons.push({ x, y, w, h, text, callback, color: color || '#10b981', textColor: textColor || '#fff', hover: false });
    }

    function drawButtons() {
        buttons.forEach(btn => {
            const c = btn.hover ? lightenColor(btn.color, 30) : btn.color;
            roundRect(btn.x, btn.y, btn.w, btn.h, 8, c, null);

            // Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;
            roundRect(btn.x, btn.y, btn.w, btn.h, 8, c, null);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = btn.textColor;
            ctx.font = `bold ${Math.max(12, 14 * scale)}px 'Segoe UI', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Wrap button text
            const lines = wrapText(btn.text, btn.w - 16);
            const lineH = Math.max(14, 16 * scale);
            const startY = btn.y + btn.h / 2 - (lines.length - 1) * lineH / 2;
            lines.forEach((line, i) => {
                ctx.fillText(line, btn.x + btn.w / 2, startY + i * lineH);
            });
        });
    }

    function lightenColor(hex, amount) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
    }

    // --- Input Handling ---
    let mouseX = 0, mouseY = 0;

    function handleClick(x, y) {
        ensureAudio();
        for (const btn of buttons) {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                sfxClick();
                btn.callback();
                return;
            }
        }
    }

    canvas.addEventListener('click', (e) => {
        handleClick(e.clientX, e.clientY);
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        handleClick(t.clientX, t.clientY);
    }, { passive: false });

    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        buttons.forEach(btn => {
            btn.hover = mouseX >= btn.x && mouseX <= btn.x + btn.w && mouseY >= btn.y && mouseY <= btn.y + btn.h;
        });
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // --- Transition ---
    function doTransition(callback) {
        transitioning = true;
        transitionAlpha = 0;
        transitionCallback = callback;
    }

    // --- Start New Game ---
    function newGame() {
        month = 0;
        saldo = 0;
        poupanca = 0;
        investimentos = 0;
        totalGastos = 0;
        totalGanhosExtra = 0;
        salaryBonus = 0;
        monthlyHistory = [];
        decisionsLog = [];
        financialTips = [];
        particles = [];
        floatingTexts = [];
        score = 0;
        doTransition(() => { state = 'intro'; });
    }

    // --- Generate Decisions for a Month ---
    function generateMonthDecisions() {
        const decisions = [];
        // Always one necessity
        decisions.push(NECESSIDADE_DECISIONS[Math.floor(Math.random() * NECESSIDADE_DECISIONS.length)]);
        // One desire
        decisions.push(DESEJO_DECISIONS[Math.floor(Math.random() * DESEJO_DECISIONS.length)]);
        // Alternate saving and investment
        if (month % 2 === 0) {
            decisions.push(POUPANCA_DECISIONS[Math.floor(Math.random() * POUPANCA_DECISIONS.length)]);
        } else {
            decisions.push(INVESTIMENTO_DECISIONS[Math.floor(Math.random() * INVESTIMENTO_DECISIONS.length)]);
        }
        return decisions;
    }

    // --- Start Month ---
    function startMonth() {
        // Receive salary
        const currentSalary = SALARY + salaryBonus;
        saldo += currentSalary;
        monthExpenses = { necessidades: 0, desejos: 0, poupancaMes: 0, investMes: 0 };
        currentDecisions = generateMonthDecisions();
        currentDecisionIndex = 0;
        sfxMonth();
        doTransition(() => {
            state = 'decision';
        });
    }

    // --- Process Decision ---
    function processDecision(option) {
        const cost = option.cost;

        if (option.category === 'poupanca' && cost < 0) {
            // Saving money
            const amount = Math.abs(cost);
            if (saldo >= amount) {
                saldo -= amount;
                poupanca += amount;
                monthExpenses.poupancaMes += amount;
                sfxCoin();
                spawnParticles(W / 2, H / 2, '#10b981', 15);
                addFloatingText(W / 2, H / 2, '+' + formatMoney(amount) + ' poupanca', '#10b981');
            } else {
                addFloatingText(W / 2, H / 2, 'Saldo insuficiente!', '#ef4444');
                sfxBad();
            }
        } else if (option.category === 'investimento' && cost < 0) {
            const amount = Math.abs(cost);
            if (saldo >= amount) {
                saldo -= amount;
                investimentos += amount;
                monthExpenses.investMes += amount;
                sfxCoin();
                spawnParticles(W / 2, H / 2, '#3b82f6', 15);
                addFloatingText(W / 2, H / 2, '+' + formatMoney(amount) + ' investido', '#3b82f6');
            } else {
                addFloatingText(W / 2, H / 2, 'Saldo insuficiente!', '#ef4444');
                sfxBad();
            }
        } else if (option.category === 'investimento_pessoal') {
            if (cost > 0 && saldo >= cost) {
                saldo -= cost;
                totalGastos += cost;
                if (option.salaryBonus) salaryBonus += option.salaryBonus;
                sfxGood();
                spawnParticles(W / 2, H / 2, '#a855f7', 15);
                addFloatingText(W / 2, H / 2, 'Salario aumenta!', '#a855f7');
            } else if (cost > 0) {
                addFloatingText(W / 2, H / 2, 'Saldo insuficiente!', '#ef4444');
                sfxBad();
            }
        } else if (cost > 0) {
            if (saldo >= cost) {
                saldo -= cost;
                totalGastos += cost;
                if (option.category === 'necessidades') monthExpenses.necessidades += cost;
                else monthExpenses.desejos += cost;
                sfxClick();
            } else if (poupanca >= (cost - saldo)) {
                // Use savings to cover
                const fromPoupanca = cost - saldo;
                poupanca -= fromPoupanca;
                saldo = 0;
                totalGastos += cost;
                if (option.category === 'necessidades') monthExpenses.necessidades += cost;
                else monthExpenses.desejos += cost;
                sfxBad();
                addFloatingText(W / 2, H / 2, 'Usou poupanca!', '#f59e0b');
            } else {
                addFloatingText(W / 2, H / 2, 'Sem dinheiro!', '#ef4444');
                sfxBad();
            }
        }

        decisionsLog.push({ month: month, title: currentDecisions[currentDecisionIndex].title, choice: option.text, feedback: option.feedback });

        currentDecisionIndex++;
        if (currentDecisionIndex >= currentDecisions.length) {
            // Check random event
            if (Math.random() < 0.5) {
                currentEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
                doTransition(() => { state = 'event'; });
            } else {
                finishMonth();
            }
        } else {
            doTransition(() => { state = 'decision'; });
        }
    }

    // --- Process Event ---
    function processEvent() {
        const cost = currentEvent.cost;
        if (cost > 0) {
            // Expense event
            if (saldo >= cost) {
                saldo -= cost;
                totalGastos += cost;
                sfxBad();
                addFloatingText(W / 2, H / 3, '-' + formatMoney(cost), '#ef4444');
            } else if (poupanca >= (cost - Math.max(0, saldo))) {
                const fromSaldo = Math.max(0, saldo);
                const fromPoupanca = cost - fromSaldo;
                saldo = 0;
                poupanca -= fromPoupanca;
                totalGastos += cost;
                sfxBad();
                addFloatingText(W / 2, H / 3, 'Poupanca usada!', '#f59e0b');
            } else {
                saldo = Math.max(0, saldo - cost);
                totalGastos += cost;
                sfxBad();
                addFloatingText(W / 2, H / 3, 'Sem reserva!', '#ef4444');
            }
        } else {
            // Income event
            saldo += Math.abs(cost);
            totalGanhosExtra += Math.abs(cost);
            sfxCoin();
            spawnParticles(W / 2, H / 3, '#10b981', 20);
            addFloatingText(W / 2, H / 3, '+' + formatMoney(Math.abs(cost)), '#10b981');
        }
        finishMonth();
    }

    // --- Finish Month ---
    function finishMonth() {
        // Apply investment returns (juros compostos)
        const returns = investimentos * 0.04;
        investimentos += returns;

        // Apply poupanca interest
        const poupancaReturns = poupanca * 0.005;
        poupanca += poupancaReturns;

        monthlyHistory.push({
            month: month,
            saldo: saldo,
            poupanca: poupanca,
            investimentos: investimentos,
            necessidades: monthExpenses.necessidades,
            desejos: monthExpenses.desejos,
            poupancaMes: monthExpenses.poupancaMes,
            investMes: monthExpenses.investMes
        });

        month++;
        doTransition(() => {
            if (month >= 12) {
                calculateScore();
                state = 'endgame';
                sfxEnd();
            } else {
                state = 'monthSummary';
            }
        });
    }

    // --- Calculate Final Score ---
    function calculateScore() {
        score = 0;
        const totalWealth = saldo + poupanca + investimentos;

        // Wealth score (max 40 pts)
        score += Math.min(40, Math.floor(totalWealth / 100));

        // Savings score (max 25 pts)
        score += Math.min(25, Math.floor(poupanca / 50));

        // Investment score (max 25 pts)
        score += Math.min(25, Math.floor(investimentos / 60));

        // Bonus for salary increase
        score += Math.min(10, salaryBonus / 20);

        score = Math.min(100, Math.max(0, Math.round(score)));

        // Generate tips
        financialTips = [];
        if (poupanca < 500) financialTips.push('Tente guardar pelo menos 10% do salario todo mes na poupanca.');
        if (investimentos < 300) financialTips.push('Investir cedo faz seu dinheiro crescer com juros compostos!');
        if (totalGastos > SALARY * 10) financialTips.push('Seus gastos foram altos. Diferencie necessidades de desejos.');
        if (salaryBonus === 0) financialTips.push('Investir em educacao aumenta sua renda futura!');
        if (poupanca >= 1000) financialTips.push('Parabens! Voce construiu uma boa reserva de emergencia!');
        if (investimentos >= 800) financialTips.push('Excelente! Seus investimentos estao crescendo!');
        if (score >= 70) financialTips.push('Voce tem otimo potencial para gerenciar suas financas!');
        if (financialTips.length === 0) financialTips.push('Continue aprendendo sobre financas pessoais!');
    }

    // --- Grade Label ---
    function getGrade(s) {
        if (s >= 90) return { label: 'A+', color: '#10b981', desc: 'Genio Financeiro!' };
        if (s >= 75) return { label: 'A', color: '#22c55e', desc: 'Otimo planejador!' };
        if (s >= 60) return { label: 'B', color: '#3b82f6', desc: 'Bom gerenciamento!' };
        if (s >= 45) return { label: 'C', color: '#f59e0b', desc: 'Pode melhorar!' };
        if (s >= 30) return { label: 'D', color: '#f97316', desc: 'Cuidado com os gastos!' };
        return { label: 'E', color: '#ef4444', desc: 'Precisa aprender mais!' };
    }

    // --- Drawing Functions ---

    // Background stars
    let stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({ x: Math.random(), y: Math.random(), s: Math.random() * 2 + 0.5, b: Math.random() });
    }

    function drawBackground() {
        // Gradient background
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#0d0d18');
        grd.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Stars
        animTimer += 0.016;
        stars.forEach(s => {
            const brightness = 0.3 + 0.4 * Math.sin(animTimer * 2 + s.b * 10);
            ctx.fillStyle = `rgba(255,255,255,${brightness})`;
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawHUD() {
        // Top bar
        roundRect(10, 10, W - 20, 50 * scale, 10, 'rgba(0,0,0,0.5)', null);

        ctx.font = `bold ${14 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const y = 10 + 25 * scale;
        const gap = (W - 40) / 4;

        ctx.fillStyle = '#10b981';
        ctx.fillText('Saldo: ' + formatMoney(saldo), 20, y);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Poupanca: ' + formatMoney(poupanca), 20 + gap, y);

        ctx.fillStyle = '#3b82f6';
        ctx.fillText('Invest: ' + formatMoney(investimentos), 20 + gap * 2, y);

        ctx.fillStyle = '#a855f7';
        ctx.fillText('Mes: ' + MONTH_NAMES[month] + ' (' + (month + 1) + '/12)', 20 + gap * 3, y);
    }

    function drawMenu() {
        drawBackground();

        // Title
        ctx.font = `bold ${48 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981';
        ctx.fillText('Educacao Financeira', W / 2, H * 0.2);

        // Coin icon
        const coinY = H * 0.35;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(W / 2, coinY, 40 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0d0d18';
        ctx.font = `bold ${36 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillText('$', W / 2, coinY + 2);

        // Subtitle
        ctx.font = `${18 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Aprenda a gerenciar suas financas!', W / 2, H * 0.5);
        ctx.fillText('Simule 12 meses de vida financeira', W / 2, H * 0.55);

        // Concepts
        ctx.font = `${14 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Orcamento | Poupanca | Juros Compostos | Necessidades vs Desejos', W / 2, H * 0.62);

        buttons = [];
        const bw = 220 * scale;
        const bh = 50 * scale;
        addButton(W / 2 - bw / 2, H * 0.72, bw, bh, 'Comecar Jogo', () => newGame(), '#10b981');

        drawButtons();
        drawParticles();
        drawFloatingTexts();
    }

    function drawIntro() {
        drawBackground();

        ctx.font = `bold ${32 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981';
        ctx.fillText('Bem-vindo a sua vida financeira!', W / 2, H * 0.15);

        const introLines = [
            'Voce tem 18 anos e acabou de conseguir seu primeiro emprego.',
            'Seu salario e de R$ 2.000,00 por mes.',
            '',
            'Durante 12 meses, voce tera que tomar decisoes financeiras:',
            '- Pagar contas essenciais (necessidades)',
            '- Escolher entre desejos e economia',
            '- Guardar dinheiro na poupanca',
            '- Investir para o futuro',
            '- Lidar com imprevistos',
            '',
            'Seu objetivo: terminar o ano com a melhor saude financeira!',
            'Lembre-se: cada escolha importa!'
        ];

        ctx.font = `${16 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        introLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, H * 0.25 + i * 24 * scale);
        });

        buttons = [];
        const bw = 200 * scale;
        const bh = 50 * scale;
        addButton(W / 2 - bw / 2, H * 0.85, bw, bh, 'Iniciar!', () => {
            doTransition(() => startMonth());
        }, '#10b981');

        drawButtons();
    }

    function drawDecision() {
        drawBackground();
        drawHUD();

        const dec = currentDecisions[currentDecisionIndex];

        // Decision card
        const cardW = Math.min(600 * scale, W - 40);
        const cardX = W / 2 - cardW / 2;
        const cardY = 80 * scale;
        const cardH = H - cardY - 20;

        roundRect(cardX, cardY, cardW, cardH, 12, 'rgba(30,30,50,0.9)', 'rgba(16,185,129,0.3)');

        // Decision number
        ctx.font = `${13 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText('Decisao ' + (currentDecisionIndex + 1) + ' de ' + currentDecisions.length, W / 2, cardY + 25 * scale);

        // Title
        ctx.font = `bold ${24 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = '#10b981';
        ctx.fillText(dec.title, W / 2, cardY + 55 * scale);

        // Description
        ctx.font = `${16 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(dec.desc, W / 2, cardY + 85 * scale);

        // Options as buttons
        buttons = [];
        const optW = cardW - 60;
        const optH = 55 * scale;
        const startY = cardY + 120 * scale;
        const gapY = optH + 15 * scale;

        const colors = ['#10b981', '#3b82f6', '#f59e0b'];
        dec.options.forEach((opt, i) => {
            addButton(cardX + 30, startY + i * gapY, optW, optH, opt.text, () => {
                processDecision(opt);
            }, colors[i % colors.length]);
        });

        // Saldo info
        ctx.font = `${14 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('Saldo disponivel: ' + formatMoney(saldo), W / 2, startY + dec.options.length * gapY + 20 * scale);

        drawButtons();
        drawParticles();
        drawFloatingTexts();
    }

    function drawEvent() {
        drawBackground();
        drawHUD();

        const ev = currentEvent;
        const isGood = ev.type === 'good';

        const cardW = Math.min(500 * scale, W - 40);
        const cardX = W / 2 - cardW / 2;
        const cardY = H * 0.2;
        const cardH = H * 0.5;

        const borderColor = isGood ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)';
        roundRect(cardX, cardY, cardW, cardH, 12, 'rgba(30,30,50,0.95)', borderColor);

        // Icon
        ctx.font = `${48 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(isGood ? '🎉' : '⚠️', W / 2, cardY + 60 * scale);

        // Event type label
        ctx.font = `bold ${14 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = isGood ? '#10b981' : '#ef4444';
        ctx.fillText(isGood ? 'EVENTO POSITIVO' : 'EVENTO INESPERADO', W / 2, cardY + 90 * scale);

        // Title
        ctx.font = `bold ${26 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.fillText(ev.title, W / 2, cardY + 130 * scale);

        // Description
        ctx.font = `${16 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(ev.desc, W / 2, cardY + 165 * scale);

        // Cost
        ctx.font = `bold ${22 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = isGood ? '#10b981' : '#ef4444';
        const costText = isGood ? '+' + formatMoney(Math.abs(ev.cost)) : '-' + formatMoney(ev.cost);
        ctx.fillText(costText, W / 2, cardY + 210 * scale);

        if (!isGood && poupanca > 0) {
            ctx.font = `${13 * scale}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('(Sua poupanca pode cobrir se o saldo nao for suficiente)', W / 2, cardY + 240 * scale);
        }

        buttons = [];
        const bw = 180 * scale;
        const bh = 50 * scale;
        addButton(W / 2 - bw / 2, cardY + cardH - 70 * scale, bw, bh, 'Continuar', () => {
            processEvent();
        }, isGood ? '#10b981' : '#ef4444');

        drawButtons();
        drawParticles();
        drawFloatingTexts();
    }

    function drawMonthSummary() {
        drawBackground();
        drawHUD();

        const hist = monthlyHistory[monthlyHistory.length - 1];
        const prevMonth = month - 1;

        const cardW = Math.min(650 * scale, W - 30);
        const cardX = W / 2 - cardW / 2;
        const cardY = 70 * scale;
        const cardH = H - cardY - 70 * scale;

        roundRect(cardX, cardY, cardW, cardH, 12, 'rgba(30,30,50,0.9)', 'rgba(255,255,255,0.1)');

        ctx.font = `bold ${22 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981';
        ctx.fillText('Resumo de ' + MONTH_NAMES[prevMonth], W / 2, cardY + 35 * scale);

        // Bar chart
        const barLabels = ['Necessidades', 'Desejos', 'Poupanca', 'Investimento'];
        const barValues = [hist.necessidades, hist.desejos, hist.poupancaMes, hist.investMes];
        const barColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
        const maxVal = Math.max(...barValues, 100);
        const barAreaX = cardX + 40;
        const barAreaW = cardW - 80;
        const barAreaY = cardY + 60 * scale;
        const barH = 25 * scale;
        const barGap = 15 * scale;

        barLabels.forEach((label, i) => {
            const y = barAreaY + i * (barH + barGap);
            const barW = maxVal > 0 ? (barValues[i] / maxVal) * (barAreaW - 140 * scale) : 0;

            ctx.font = `${13 * scale}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.textAlign = 'right';
            ctx.fillText(label, barAreaX + 100 * scale, y + barH / 2 + 1);

            roundRect(barAreaX + 110 * scale, y, Math.max(barW, 2), barH, 4, barColors[i], null);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.fillText(formatMoney(barValues[i]), barAreaX + 115 * scale + barW, y + barH / 2 + 1);
        });

        // Totals
        const totalsY = barAreaY + 4 * (barH + barGap) + 20 * scale;
        ctx.font = `${15 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';

        ctx.fillStyle = '#10b981';
        ctx.fillText('Saldo: ' + formatMoney(saldo), W / 2 - 140 * scale, totalsY);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Poupanca: ' + formatMoney(poupanca), W / 2, totalsY);

        ctx.fillStyle = '#3b82f6';
        ctx.fillText('Investimentos: ' + formatMoney(investimentos), W / 2 + 150 * scale, totalsY);

        // Wealth indicator
        const wealth = saldo + poupanca + investimentos;
        ctx.font = `bold ${18 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = wealth > 0 ? '#10b981' : '#ef4444';
        ctx.fillText('Patrimonio Total: ' + formatMoney(wealth), W / 2, totalsY + 35 * scale);

        // Tip
        const tips = [
            'Dica: Tente separar pelo menos 10% do salario para poupanca!',
            'Dica: Juros compostos fazem seu investimento crescer exponencialmente!',
            'Dica: Necessidades primeiro, desejos depois!',
            'Dica: Uma reserva de emergencia evita dividas!',
            'Dica: Investir em educacao aumenta sua renda!',
            'Dica: Compare precos antes de comprar!',
            'Dica: Evite compras por impulso, espere 24h!'
        ];
        ctx.font = `italic ${13 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(tips[month % tips.length], W / 2, totalsY + 65 * scale);

        // Mini history chart (line chart of total wealth)
        if (monthlyHistory.length > 1) {
            const chartX = cardX + 40;
            const chartY = totalsY + 85 * scale;
            const chartW = cardW - 80;
            const chartH = Math.min(100 * scale, cardY + cardH - chartY - 70 * scale);

            if (chartH > 30) {
                ctx.font = `${11 * scale}px 'Segoe UI', sans-serif`;
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.textAlign = 'center';
                ctx.fillText('Evolucao do Patrimonio', W / 2, chartY - 5);

                roundRect(chartX, chartY, chartW, chartH, 6, 'rgba(0,0,0,0.3)', null);

                const values = monthlyHistory.map(h => h.saldo + h.poupanca + h.investimentos);
                const maxV = Math.max(...values, 1);
                const minV = Math.min(...values, 0);
                const range = maxV - minV || 1;

                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.beginPath();
                values.forEach((v, i) => {
                    const px = chartX + 10 + (i / Math.max(1, values.length - 1)) * (chartW - 20);
                    const py = chartY + chartH - 10 - ((v - minV) / range) * (chartH - 20);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                });
                ctx.stroke();

                // Dots
                values.forEach((v, i) => {
                    const px = chartX + 10 + (i / Math.max(1, values.length - 1)) * (chartW - 20);
                    const py = chartY + chartH - 10 - ((v - minV) / range) * (chartH - 20);
                    ctx.fillStyle = '#10b981';
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        }

        buttons = [];
        const bw = 200 * scale;
        const bh = 45 * scale;
        addButton(W / 2 - bw / 2, cardY + cardH - 55 * scale, bw, bh, 'Proximo Mes ➤', () => {
            doTransition(() => startMonth());
        }, '#10b981');

        drawButtons();
        drawParticles();
        drawFloatingTexts();
    }

    function drawEndgame() {
        drawBackground();

        const grade = getGrade(score);

        // Title
        ctx.font = `bold ${36 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981';
        ctx.fillText('Fim de Ano - Resultado Final', W / 2, H * 0.08);

        // Score circle
        const circleX = W / 2;
        const circleY = H * 0.22;
        const circleR = 55 * scale;

        // Background circle
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 8 * scale;
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
        ctx.stroke();

        // Score arc
        ctx.strokeStyle = grade.color;
        ctx.lineWidth = 8 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score / 100));
        ctx.stroke();
        ctx.lineCap = 'butt';

        // Score text
        ctx.font = `bold ${40 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = grade.color;
        ctx.fillText(score, circleX, circleY + 5);

        ctx.font = `${13 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('pontos', circleX, circleY + 25 * scale);

        // Grade
        ctx.font = `bold ${28 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = grade.color;
        ctx.fillText('Nota: ' + grade.label + ' - ' + grade.desc, W / 2, H * 0.35);

        // Financial summary
        const summaryY = H * 0.41;
        const summaryItems = [
            { label: 'Saldo Final', value: formatMoney(saldo), color: '#10b981' },
            { label: 'Poupanca', value: formatMoney(poupanca), color: '#f59e0b' },
            { label: 'Investimentos', value: formatMoney(investimentos), color: '#3b82f6' },
            { label: 'Total Gastos', value: formatMoney(totalGastos), color: '#ef4444' },
            { label: 'Ganhos Extra', value: formatMoney(totalGanhosExtra), color: '#a855f7' },
            { label: 'Patrimonio Total', value: formatMoney(saldo + poupanca + investimentos), color: '#10b981' }
        ];

        const colW = Math.min(220 * scale, (W - 60) / 3);
        const startX = W / 2 - colW * 1.5;

        summaryItems.forEach((item, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = startX + col * colW + colW / 2;
            const y = summaryY + row * 50 * scale;

            ctx.font = `${12 * scale}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x, y);

            ctx.font = `bold ${18 * scale}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = item.color;
            ctx.fillText(item.value, x, y + 22 * scale);
        });

        // Wealth history chart
        if (monthlyHistory.length > 1) {
            const chartX = W * 0.1;
            const chartY = summaryY + 110 * scale;
            const chartW = W * 0.8;
            const chartH = Math.min(90 * scale, H - chartY - 160 * scale);

            if (chartH > 30) {
                ctx.font = `bold ${13 * scale}px 'Segoe UI', sans-serif`;
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.textAlign = 'center';
                ctx.fillText('Evolucao do Patrimonio ao Longo do Ano', W / 2, chartY - 8);

                roundRect(chartX, chartY, chartW, chartH, 6, 'rgba(0,0,0,0.3)', null);

                const saldoVals = monthlyHistory.map(h => h.saldo);
                const poupVals = monthlyHistory.map(h => h.poupanca);
                const investVals = monthlyHistory.map(h => h.investimentos);
                const allVals = [...saldoVals, ...poupVals, ...investVals];
                const maxV = Math.max(...allVals, 1);

                // Draw three lines
                const drawLine = (vals, color) => {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    vals.forEach((v, i) => {
                        const px = chartX + 15 + (i / Math.max(1, vals.length - 1)) * (chartW - 30);
                        const py = chartY + chartH - 10 - (v / maxV) * (chartH - 20);
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    });
                    ctx.stroke();
                };

                drawLine(saldoVals, '#10b981');
                drawLine(poupVals, '#f59e0b');
                drawLine(investVals, '#3b82f6');

                // Legend
                const legendY = chartY + chartH + 15 * scale;
                const legends = [
                    { label: 'Saldo', color: '#10b981' },
                    { label: 'Poupanca', color: '#f59e0b' },
                    { label: 'Investimentos', color: '#3b82f6' }
                ];
                ctx.font = `${11 * scale}px 'Segoe UI', sans-serif`;
                legends.forEach((l, i) => {
                    const lx = W / 2 - 120 * scale + i * 100 * scale;
                    ctx.fillStyle = l.color;
                    ctx.fillRect(lx, legendY - 5, 12, 12);
                    ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    ctx.textAlign = 'left';
                    ctx.fillText(l.label, lx + 16, legendY + 4);
                });
            }
        }

        // Tips
        const tipsY = H - 130 * scale;
        ctx.font = `bold ${14 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText('Dicas para Voce:', W / 2, tipsY);

        ctx.font = `${12 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        financialTips.slice(0, 3).forEach((tip, i) => {
            ctx.fillText('• ' + tip, W / 2, tipsY + 22 * scale + i * 18 * scale);
        });

        // Concepts learned
        ctx.font = `italic ${11 * scale}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('Conceitos: Orcamento | Poupanca | Juros Compostos | Necessidades vs Desejos | Reserva de Emergencia', W / 2, H - 40 * scale);

        buttons = [];
        const bw = 180 * scale;
        const bh = 42 * scale;
        addButton(W / 2 - bw - 10, H - 30 * scale, bw, bh, 'Jogar Novamente', () => {
            doTransition(() => { state = 'menu'; });
        }, '#10b981');
        addButton(W / 2 + 10, H - 30 * scale, bw, bh, 'Ver Decisoes', () => {
            doTransition(() => { state = 'reviewDecisions'; });
        }, '#3b82f6');

        drawButtons();
        drawParticles();
        drawFloatingTexts();
    }

    function drawReviewDecisions() {
        drawBackground();

        ctx.font = `bold ${26 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981';
        ctx.fillText('Suas Decisoes Financeiras', W / 2, 35 * scale);

        const cardW = Math.min(700 * scale, W - 30);
        const cardX = W / 2 - cardW / 2;
        const startY = 55 * scale;
        const lineH = 18 * scale;

        roundRect(cardX, startY, cardW, H - startY - 60 * scale, 10, 'rgba(30,30,50,0.9)', null);

        ctx.font = `${12 * scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'left';

        const maxVisible = Math.floor((H - startY - 100 * scale) / lineH);
        const visibleDecisions = decisionsLog.slice(0, maxVisible);

        visibleDecisions.forEach((d, i) => {
            const y = startY + 25 * scale + i * lineH;
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText(MONTH_NAMES[d.month], cardX + 15, y);
            ctx.fillStyle = '#10b981';
            ctx.fillText(d.title + ':', cardX + 100 * scale, y);
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            const choiceText = d.choice.length > 40 ? d.choice.substring(0, 37) + '...' : d.choice;
            ctx.fillText(choiceText, cardX + 220 * scale, y);
        });

        buttons = [];
        const bw = 180 * scale;
        const bh = 42 * scale;
        addButton(W / 2 - bw / 2, H - 50 * scale, bw, bh, 'Voltar', () => {
            doTransition(() => { state = 'endgame'; });
        }, '#10b981');

        drawButtons();
    }

    // --- Main Loop ---
    function update() {
        updateParticles();
        updateFloatingTexts();

        // Transition handling
        if (transitioning) {
            transitionAlpha += 0.05;
            if (transitionAlpha >= 1) {
                if (transitionCallback) {
                    transitionCallback();
                    transitionCallback = null;
                }
            }
            if (transitionAlpha >= 1) {
                transitionAlpha -= 0.05;
                if (transitionAlpha <= 0) {
                    transitionAlpha = 0;
                    transitioning = false;
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        switch (state) {
            case 'menu': drawMenu(); break;
            case 'intro': drawIntro(); break;
            case 'decision': drawDecision(); break;
            case 'event': drawEvent(); break;
            case 'monthSummary': drawMonthSummary(); break;
            case 'endgame': drawEndgame(); break;
            case 'reviewDecisions': drawReviewDecisions(); break;
        }

        // Transition overlay
        if (transitioning) {
            ctx.fillStyle = `rgba(13,13,24,${transitionAlpha})`;
            ctx.fillRect(0, 0, W, H);
        }
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // --- Start ---
    window.addEventListener('load', () => {
        const loading = document.getElementById('loading');
        setTimeout(() => {
            loading.style.display = 'none';
            gameLoop();
        }, 800);
    });

})();
