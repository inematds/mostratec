// ============================================================
// Química dos Elementos - Jogo Educativo de Química
// Ensino Fundamental II / Ensino Médio (8o-9o ano)
// ============================================================

(function () {
    "use strict";

    // ---- Canvas setup ----
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // ---- Audio engine (Web Audio API) ----
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === "suspended") audioCtx.resume();
    }

    function playTone(freq, dur, type, vol) {
        try {
            ensureAudio();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = type || "sine";
            o.frequency.value = freq;
            g.gain.value = vol || 0.12;
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
            o.connect(g).connect(audioCtx.destination);
            o.start();
            o.stop(audioCtx.currentTime + dur);
        } catch (_) { /* ignore */ }
    }

    function sfxCorrect() {
        playTone(523, 0.12, "sine", 0.15);
        setTimeout(() => playTone(659, 0.12, "sine", 0.15), 80);
        setTimeout(() => playTone(784, 0.2, "sine", 0.15), 160);
    }
    function sfxWrong() {
        playTone(200, 0.25, "sawtooth", 0.1);
        setTimeout(() => playTone(160, 0.3, "sawtooth", 0.1), 120);
    }
    function sfxClick() { playTone(440, 0.06, "sine", 0.08); }
    function sfxLevelUp() {
        [523, 587, 659, 784, 880].forEach((f, i) =>
            setTimeout(() => playTone(f, 0.15, "triangle", 0.12), i * 90));
    }
    function sfxMolecule() {
        playTone(440, 0.15, "sine", 0.12);
        setTimeout(() => playTone(554, 0.15, "sine", 0.12), 100);
        setTimeout(() => playTone(659, 0.15, "sine", 0.12), 200);
        setTimeout(() => playTone(880, 0.3, "triangle", 0.15), 300);
    }

    // ---- Element data ----
    const CATEGORIES = {
        "metal-alcalino": { color: "#e74c3c", label: "Metal Alcalino" },
        "metal-alcalino-terroso": { color: "#e67e22", label: "Metal Alcalino-Terroso" },
        "metal-transicao": { color: "#f39c12", label: "Metal de Transição" },
        "metal-pos-transicao": { color: "#d4a017", label: "Metal Pós-Transição" },
        "semimetal": { color: "#27ae60", label: "Semimetal" },
        "nao-metal": { color: "#2ecc71", label: "Não-Metal" },
        "halogenio": { color: "#1abc9c", label: "Halogênio" },
        "gas-nobre": { color: "#9b59b6", label: "Gás Nobre" },
        "lantanideo": { color: "#e84393", label: "Lantanídeo" },
        "actinideo": { color: "#fd79a8", label: "Actinídeo" },
    };

    const ELEMENTS = [
        { z: 1, sym: "H", name: "Hidrogênio", cat: "nao-metal", state: "gás" },
        { z: 2, sym: "He", name: "Hélio", cat: "gas-nobre", state: "gás" },
        { z: 3, sym: "Li", name: "Lítio", cat: "metal-alcalino", state: "sólido" },
        { z: 4, sym: "Be", name: "Berílio", cat: "metal-alcalino-terroso", state: "sólido" },
        { z: 5, sym: "B", name: "Boro", cat: "semimetal", state: "sólido" },
        { z: 6, sym: "C", name: "Carbono", cat: "nao-metal", state: "sólido" },
        { z: 7, sym: "N", name: "Nitrogênio", cat: "nao-metal", state: "gás" },
        { z: 8, sym: "O", name: "Oxigênio", cat: "nao-metal", state: "gás" },
        { z: 9, sym: "F", name: "Flúor", cat: "halogenio", state: "gás" },
        { z: 10, sym: "Ne", name: "Neônio", cat: "gas-nobre", state: "gás" },
        { z: 11, sym: "Na", name: "Sódio", cat: "metal-alcalino", state: "sólido" },
        { z: 12, sym: "Mg", name: "Magnésio", cat: "metal-alcalino-terroso", state: "sólido" },
        { z: 13, sym: "Al", name: "Alumínio", cat: "metal-pos-transicao", state: "sólido" },
        { z: 14, sym: "Si", name: "Silício", cat: "semimetal", state: "sólido" },
        { z: 15, sym: "P", name: "Fósforo", cat: "nao-metal", state: "sólido" },
        { z: 16, sym: "S", name: "Enxofre", cat: "nao-metal", state: "sólido" },
        { z: 17, sym: "Cl", name: "Cloro", cat: "halogenio", state: "gás" },
        { z: 18, sym: "Ar", name: "Argônio", cat: "gas-nobre", state: "gás" },
        { z: 19, sym: "K", name: "Potássio", cat: "metal-alcalino", state: "sólido" },
        { z: 20, sym: "Ca", name: "Cálcio", cat: "metal-alcalino-terroso", state: "sólido" },
        { z: 24, sym: "Cr", name: "Cromo", cat: "metal-transicao", state: "sólido" },
        { z: 25, sym: "Mn", name: "Manganês", cat: "metal-transicao", state: "sólido" },
        { z: 26, sym: "Fe", name: "Ferro", cat: "metal-transicao", state: "sólido" },
        { z: 27, sym: "Co", name: "Cobalto", cat: "metal-transicao", state: "sólido" },
        { z: 28, sym: "Ni", name: "Níquel", cat: "metal-transicao", state: "sólido" },
        { z: 29, sym: "Cu", name: "Cobre", cat: "metal-transicao", state: "sólido" },
        { z: 30, sym: "Zn", name: "Zinco", cat: "metal-transicao", state: "sólido" },
        { z: 35, sym: "Br", name: "Bromo", cat: "halogenio", state: "líquido" },
        { z: 36, sym: "Kr", name: "Criptônio", cat: "gas-nobre", state: "gás" },
        { z: 47, sym: "Ag", name: "Prata", cat: "metal-transicao", state: "sólido" },
        { z: 50, sym: "Sn", name: "Estanho", cat: "metal-pos-transicao", state: "sólido" },
        { z: 53, sym: "I", name: "Iodo", cat: "halogenio", state: "sólido" },
        { z: 54, sym: "Xe", name: "Xenônio", cat: "gas-nobre", state: "gás" },
        { z: 56, sym: "Ba", name: "Bário", cat: "metal-alcalino-terroso", state: "sólido" },
        { z: 79, sym: "Au", name: "Ouro", cat: "metal-transicao", state: "sólido" },
        { z: 80, sym: "Hg", name: "Mercúrio", cat: "metal-transicao", state: "líquido" },
        { z: 82, sym: "Pb", name: "Chumbo", cat: "metal-pos-transicao", state: "sólido" },
        { z: 78, sym: "Pt", name: "Platina", cat: "metal-transicao", state: "sólido" },
        { z: 92, sym: "U", name: "Urânio", cat: "actinideo", state: "sólido" },
    ];

    // ---- Molecule data ----
    const MOLECULES = [
        { formula: "H2O", name: "Água", components: ["H", "H", "O"], hint: "Essencial para a vida" },
        { formula: "CO2", name: "Dióxido de Carbono", components: ["C", "O", "O"], hint: "Produzido na respiração" },
        { formula: "NaCl", name: "Cloreto de Sódio (Sal)", components: ["Na", "Cl"], hint: "Sal de cozinha" },
        { formula: "O2", name: "Gás Oxigênio", components: ["O", "O"], hint: "Presente no ar que respiramos" },
        { formula: "N2", name: "Gás Nitrogênio", components: ["N", "N"], hint: "78% da atmosfera" },
        { formula: "H2", name: "Gás Hidrogênio", components: ["H", "H"], hint: "Elemento mais leve" },
        { formula: "CO", name: "Monóxido de Carbono", components: ["C", "O"], hint: "Gás tóxico incolor" },
        { formula: "CaO", name: "Óxido de Cálcio (Cal)", components: ["Ca", "O"], hint: "Usado em construção" },
        { formula: "HCl", name: "Ácido Clorídrico", components: ["H", "Cl"], hint: "Presente no estômago" },
        { formula: "NH3", name: "Amônia", components: ["N", "H", "H", "H"], hint: "Cheiro forte característico" },
        { formula: "Fe2O3", name: "Óxido de Ferro (Ferrugem)", components: ["Fe", "Fe", "O", "O", "O"], hint: "Ferrugem" },
        { formula: "MgO", name: "Óxido de Magnésio", components: ["Mg", "O"], hint: "Antiácido" },
        { formula: "KCl", name: "Cloreto de Potássio", components: ["K", "Cl"], hint: "Substituto do sal" },
        { formula: "CaCO3", name: "Carbonato de Cálcio", components: ["Ca", "C", "O", "O", "O"], hint: "Presente em conchas e mármore" },
    ];

    // ---- Quiz questions ----
    const QUIZ_QUESTIONS = [
        { q: "Qual é o número atômico do Carbono?", a: "6", opts: ["4", "6", "8", "12"] },
        { q: "Qual elemento tem o símbolo 'Fe'?", a: "Ferro", opts: ["Flúor", "Ferro", "Fósforo", "Francio"] },
        { q: "Qual é o estado físico do Mercúrio à temperatura ambiente?", a: "Líquido", opts: ["Sólido", "Líquido", "Gasoso", "Plasma"] },
        { q: "Os gases nobres são conhecidos por serem:", a: "Pouco reativos", opts: ["Muito reativos", "Pouco reativos", "Radioativos", "Magnéticos"] },
        { q: "Qual destes é um halogênio?", a: "Cloro", opts: ["Carbono", "Cloro", "Cálcio", "Cromo"] },
        { q: "O símbolo 'Na' representa qual elemento?", a: "Sódio", opts: ["Nitrogênio", "Neônio", "Sódio", "Níquel"] },
        { q: "Quantos prótons tem o Oxigênio?", a: "8", opts: ["6", "7", "8", "16"] },
        { q: "Qual elemento é o mais abundante no universo?", a: "Hidrogênio", opts: ["Oxigênio", "Hélio", "Hidrogênio", "Carbono"] },
        { q: "O Ouro tem o símbolo:", a: "Au", opts: ["Or", "Au", "Ag", "Go"] },
        { q: "Qual é o número atômico do Hélio?", a: "2", opts: ["1", "2", "4", "8"] },
        { q: "O Bromo em temperatura ambiente é:", a: "Líquido", opts: ["Sólido", "Líquido", "Gasoso", "Depende"] },
        { q: "Metais alcalinos pertencem ao grupo:", a: "1", opts: ["1", "2", "17", "18"] },
        { q: "Qual destes elementos é um gás nobre?", a: "Argônio", opts: ["Argônio", "Alumínio", "Arsênio", "Antimônio"] },
        { q: "A Prata tem o símbolo:", a: "Ag", opts: ["Pr", "Pt", "Ag", "Si"] },
        { q: "Qual elemento é essencial para os ossos?", a: "Cálcio", opts: ["Ferro", "Cálcio", "Potássio", "Sódio"] },
        { q: "O símbolo 'K' representa:", a: "Potássio", opts: ["Kriptônio", "Potássio", "Cálcio", "Carbono"] },
        { q: "Quantos elétrons tem o Nitrogênio neutro?", a: "7", opts: ["5", "7", "14", "21"] },
        { q: "O gás mais abundante na atmosfera terrestre é:", a: "Nitrogênio", opts: ["Oxigênio", "Nitrogênio", "Argônio", "CO2"] },
        { q: "O Chumbo tem o símbolo:", a: "Pb", opts: ["Ch", "Pb", "Cm", "Cu"] },
        { q: "O Urânio é classificado como:", a: "Actinídeo", opts: ["Metal de Transição", "Lantanídeo", "Actinídeo", "Semimetal"] },
        { q: "A fórmula da água é:", a: "H2O", opts: ["HO2", "H2O", "OH", "H3O"] },
        { q: "O NaCl é popularmente conhecido como:", a: "Sal de cozinha", opts: ["Açúcar", "Sal de cozinha", "Bicarbonato", "Vinagre"] },
        { q: "O número atômico indica a quantidade de:", a: "Prótons", opts: ["Elétrons", "Prótons", "Nêutrons", "Moléculas"] },
        { q: "Qual destes é um semimetal?", a: "Silício", opts: ["Sódio", "Silício", "Enxofre", "Selênio"] },
    ];

    // ---- Game state ----
    const STATE = {
        screen: "menu",       // menu, mode1, mode2, mode3, result
        score: 0,
        streak: 0,
        bestStreak: 0,
        level: 1,
        questionsAnswered: 0,
        questionsCorrect: 0,
        currentQuestion: null,
        options: [],
        feedback: null,
        feedbackTimer: 0,
        // Mode 2
        targetMolecule: null,
        selectedElements: [],
        availableSlots: [],
        moleculeComplete: false,
        moleculeTimer: 0,
        // Particles
        particles: [],
        // Background atoms
        bgAtoms: [],
        // Buttons cache
        buttons: [],
        // Transition
        transition: 0,
        transitionTarget: null,
        // Timer for questions
        questionTimer: 0,
        maxQuestionTime: 15,
        // Total rounds per mode
        totalRounds: 10,
        currentRound: 0,
        modeScore: 0,
    };

    // ---- Background atoms ----
    function initBgAtoms() {
        STATE.bgAtoms = [];
        for (let i = 0; i < 15; i++) {
            STATE.bgAtoms.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 20 + Math.random() * 30,
                element: ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)],
                alpha: 0.06 + Math.random() * 0.08,
            });
        }
    }
    initBgAtoms();

    // ---- Particle system ----
    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            STATE.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.015 + Math.random() * 0.025,
                radius: 2 + Math.random() * 4,
                color,
            });
        }
    }

    function updateParticles(dt) {
        for (let i = STATE.particles.length - 1; i >= 0; i--) {
            const p = STATE.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04;
            p.life -= p.decay;
            if (p.life <= 0) STATE.particles.splice(i, 1);
        }
    }

    function drawParticles() {
        STATE.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // ---- Background ----
    function updateBgAtoms() {
        STATE.bgAtoms.forEach(a => {
            a.x += a.vx;
            a.y += a.vy;
            if (a.x < -50) a.x = canvas.width + 50;
            if (a.x > canvas.width + 50) a.x = -50;
            if (a.y < -50) a.y = canvas.height + 50;
            if (a.y > canvas.height + 50) a.y = -50;
        });
    }

    function drawBackground() {
        ctx.fillStyle = "#0d0d18";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = "rgba(34, 197, 94, 0.04)";
        ctx.lineWidth = 1;
        const gs = 60;
        for (let x = 0; x < canvas.width; x += gs) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gs) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Floating atoms
        STATE.bgAtoms.forEach(a => {
            const catColor = CATEGORIES[a.element.cat]?.color || "#ffffff";
            ctx.globalAlpha = a.alpha;
            ctx.fillStyle = catColor;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = `bold ${a.radius * 0.7}px 'Segoe UI', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(a.element.sym, a.x, a.y);
            ctx.globalAlpha = 1;
        });
    }

    // ---- Utility ----
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function getElementBySymbol(sym) {
        return ELEMENTS.find(e => e.sym === sym);
    }

    function catColor(cat) {
        return CATEGORIES[cat]?.color || "#555";
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

    function isInside(mx, my, rect) {
        return mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h;
    }

    // ---- Scaling helpers ----
    function S(val) {
        return val * Math.min(canvas.width / 800, canvas.height / 600);
    }

    // ---- Button drawing ----
    function drawButton(label, x, y, w, h, color, hovered) {
        const r = S(10);
        drawRoundedRect(x, y, w, h, r);
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, shadeColor(color, -30));
        ctx.fillStyle = grad;
        ctx.fill();
        if (hovered) {
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${S(16)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + w / 2, y + h / 2);
        return { x, y, w, h, label };
    }

    function shadeColor(hex, amt) {
        let col = hex.replace("#", "");
        let num = parseInt(col, 16);
        let r = Math.min(255, Math.max(0, (num >> 16) + amt));
        let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
        let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return `rgb(${r},${g},${b})`;
    }

    // ---- Element card drawing ----
    function drawElementCard(el, cx, cy, size, glow) {
        const half = size / 2;
        const color = catColor(el.cat);
        drawRoundedRect(cx - half, cy - half, size, size, S(8));
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        // Atomic number
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = `${size * 0.15}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(el.z, cx - half + size * 0.1, cy - half + size * 0.08);
        // Symbol
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${size * 0.4}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.sym, cx, cy - size * 0.05);
        // Name
        ctx.font = `${size * 0.13}px 'Segoe UI', sans-serif`;
        ctx.fillText(el.name, cx, cy + size * 0.25);
        // Category
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${size * 0.09}px 'Segoe UI', sans-serif`;
        ctx.fillText(CATEGORIES[el.cat]?.label || "", cx, cy + size * 0.38);
    }

    // ---- Screen: Menu ----
    function drawMenu() {
        drawBackground();
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Title
        ctx.fillStyle = "#22c55e";
        ctx.font = `bold ${S(36)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Quimica dos Elementos", cx, cy - S(160));

        // Subtitle
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${S(14)}px 'Segoe UI', sans-serif`;
        ctx.fillText("Jogo Educativo de Quimica - 8o e 9o ano", cx, cy - S(125));

        // Score display
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = `${S(13)}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Pontuacao Total: ${STATE.score}  |  Melhor Sequencia: ${STATE.bestStreak}`, cx, cy - S(100));

        STATE.buttons = [];
        const bw = S(280);
        const bh = S(50);
        const gap = S(15);

        const b1 = drawButton("Identifique o Elemento", cx - bw / 2, cy - S(50), bw, bh, "#2ecc71", false);
        b1.action = "mode1";
        STATE.buttons.push(b1);

        const b2 = drawButton("Monte a Molecula", cx - bw / 2, cy - S(50) + bh + gap, bw, bh, "#3498db", false);
        b2.action = "mode2";
        STATE.buttons.push(b2);

        const b3 = drawButton("Quiz Atomico", cx - bw / 2, cy - S(50) + (bh + gap) * 2, bw, bh, "#9b59b6", false);
        b3.action = "mode3";
        STATE.buttons.push(b3);

        // Mini periodic table decoration
        const miniSize = S(22);
        const startX = cx - miniSize * 9;
        const startY = cy + S(130);
        ELEMENTS.slice(0, 18).forEach((el, i) => {
            const col = i % 9;
            const row = Math.floor(i / 9);
            const mx = startX + col * (miniSize + 3);
            const my = startY + row * (miniSize + 3);
            drawRoundedRect(mx, my, miniSize, miniSize, 3);
            ctx.fillStyle = catColor(el.cat);
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#fff";
            ctx.font = `bold ${miniSize * 0.45}px 'Segoe UI', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(el.sym, mx + miniSize / 2, my + miniSize / 2);
        });
    }

    // ---- Mode 1: Identifique o Elemento ----
    function startMode1() {
        STATE.screen = "mode1";
        STATE.currentRound = 0;
        STATE.modeScore = 0;
        STATE.streak = 0;
        STATE.feedback = null;
        STATE.questionTimer = STATE.maxQuestionTime;
        nextMode1Question();
    }

    function nextMode1Question() {
        STATE.currentRound++;
        if (STATE.currentRound > STATE.totalRounds) {
            showResult();
            return;
        }
        STATE.feedback = null;
        STATE.questionTimer = STATE.maxQuestionTime;

        // Difficulty-based element selection
        let pool;
        if (STATE.level <= 2) pool = ELEMENTS.slice(0, 18);
        else if (STATE.level <= 4) pool = ELEMENTS.slice(0, 28);
        else pool = ELEMENTS;

        const correct = pool[Math.floor(Math.random() * pool.length)];
        const wrongPool = ELEMENTS.filter(e => e.sym !== correct.sym);
        const wrongs = shuffle(wrongPool).slice(0, 3);
        const options = shuffle([correct, ...wrongs]);

        STATE.currentQuestion = correct;
        STATE.options = options.map(o => o.name);
    }

    function drawMode1() {
        drawBackground();
        const cx = canvas.width / 2;
        drawHUD("Identifique o Elemento");

        // Question element card
        if (STATE.currentQuestion) {
            const cardSize = S(140);
            drawElementCard(STATE.currentQuestion, cx, canvas.height * 0.32, cardSize, true);

            // Prompt
            ctx.fillStyle = "#fff";
            ctx.font = `${S(16)}px 'Segoe UI', sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("Qual e o nome deste elemento?", cx, canvas.height * 0.32 + cardSize / 2 + S(25));

            // Options
            STATE.buttons = [];
            const bw = S(240);
            const bh = S(42);
            const gap = S(10);
            const startY = canvas.height * 0.55;

            STATE.options.forEach((opt, i) => {
                let color = "#334155";
                if (STATE.feedback) {
                    if (opt === STATE.currentQuestion.name) color = "#22c55e";
                    else if (opt === STATE.feedback.chosen && !STATE.feedback.correct) color = "#ef4444";
                }
                const b = drawButton(opt, cx - bw / 2, startY + i * (bh + gap), bw, bh, color, false);
                b.action = "answer";
                b.value = opt;
                STATE.buttons.push(b);
            });

            // Timer bar
            drawTimerBar();
        }

        // Feedback overlay
        drawFeedback();
    }

    // ---- Mode 2: Monte a Molécula ----
    function startMode2() {
        STATE.screen = "mode2";
        STATE.currentRound = 0;
        STATE.modeScore = 0;
        STATE.streak = 0;
        STATE.feedback = null;
        nextMode2Question();
    }

    function nextMode2Question() {
        STATE.currentRound++;
        if (STATE.currentRound > STATE.totalRounds) {
            showResult();
            return;
        }
        STATE.feedback = null;
        STATE.moleculeComplete = false;
        STATE.moleculeTimer = 0;

        let pool;
        if (STATE.level <= 2) pool = MOLECULES.slice(0, 6);
        else if (STATE.level <= 4) pool = MOLECULES.slice(0, 10);
        else pool = MOLECULES;

        STATE.targetMolecule = pool[Math.floor(Math.random() * pool.length)];
        STATE.selectedElements = [];

        // Build available slots: correct components + distractors
        const needed = [...STATE.targetMolecule.components];
        const distractors = [];
        const usedSyms = new Set(needed);
        const distPool = ELEMENTS.filter(e => !usedSyms.has(e.sym));
        const shuffled = shuffle(distPool);
        const numDist = Math.min(4, shuffled.length);
        for (let i = 0; i < numDist; i++) distractors.push(shuffled[i].sym);

        STATE.availableSlots = shuffle([...needed, ...distractors]).map(sym => ({
            sym,
            used: false,
            element: getElementBySymbol(sym),
        }));
    }

    function checkMolecule() {
        const selected = STATE.selectedElements.map(s => s.sym).sort().join(",");
        const target = [...STATE.targetMolecule.components].sort().join(",");
        if (selected === target) {
            STATE.moleculeComplete = true;
            STATE.moleculeTimer = 90;
            STATE.modeScore += 15 + Math.floor(STATE.streak * 2);
            STATE.score += 15 + Math.floor(STATE.streak * 2);
            STATE.streak++;
            if (STATE.streak > STATE.bestStreak) STATE.bestStreak = STATE.streak;
            STATE.questionsCorrect++;
            sfxMolecule();
            spawnParticles(canvas.width / 2, canvas.height * 0.28, "#22c55e", 40);
        }
    }

    function drawMode2() {
        drawBackground();
        const cx = canvas.width / 2;
        drawHUD("Monte a Molecula");

        STATE.buttons = [];

        if (STATE.targetMolecule) {
            // Target formula
            ctx.fillStyle = "#3498db";
            ctx.font = `bold ${S(30)}px 'Segoe UI', sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(STATE.targetMolecule.formula, cx, canvas.height * 0.18);

            ctx.fillStyle = "#fff";
            ctx.font = `${S(14)}px 'Segoe UI', sans-serif`;
            ctx.fillText(STATE.targetMolecule.name, cx, canvas.height * 0.22);

            // Hint
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = `italic ${S(12)}px 'Segoe UI', sans-serif`;
            ctx.fillText("Dica: " + STATE.targetMolecule.hint, cx, canvas.height * 0.26);

            // Selected elements display (drop zone)
            const slotSize = S(55);
            const needed = STATE.targetMolecule.components.length;
            const dropY = canvas.height * 0.34;
            const dropStartX = cx - (needed * (slotSize + S(8))) / 2;

            for (let i = 0; i < needed; i++) {
                const sx = dropStartX + i * (slotSize + S(8));
                drawRoundedRect(sx, dropY, slotSize, slotSize, S(6));
                if (STATE.selectedElements[i]) {
                    const el = STATE.selectedElements[i].element;
                    ctx.fillStyle = catColor(el.cat);
                    ctx.globalAlpha = 0.8;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.fillStyle = "#fff";
                    ctx.font = `bold ${slotSize * 0.45}px 'Segoe UI', sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(el.sym, sx + slotSize / 2, dropY + slotSize / 2);
                } else {
                    ctx.fillStyle = "rgba(255,255,255,0.05)";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.2)";
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.fillStyle = "rgba(255,255,255,0.2)";
                    ctx.font = `${slotSize * 0.3}px 'Segoe UI', sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("?", sx + slotSize / 2, dropY + slotSize / 2);
                }
            }

            // Available element cards
            const cardSize = S(60);
            const gap = S(10);
            const perRow = Math.min(STATE.availableSlots.length, Math.floor((canvas.width - S(40)) / (cardSize + gap)));
            const totalRows = Math.ceil(STATE.availableSlots.length / perRow);
            const startY = canvas.height * 0.55;

            STATE.availableSlots.forEach((slot, i) => {
                if (slot.used) return;
                const row = Math.floor(i / perRow);
                const col = i % perRow;
                const rowItems = Math.min(perRow, STATE.availableSlots.length - row * perRow);
                const rowStartX = cx - (rowItems * (cardSize + gap)) / 2;
                const sx = rowStartX + col * (cardSize + gap);
                const sy = startY + row * (cardSize + gap);

                drawRoundedRect(sx, sy, cardSize, cardSize, S(6));
                ctx.fillStyle = catColor(slot.element.cat);
                ctx.globalAlpha = 0.7;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.strokeStyle = "rgba(255,255,255,0.3)";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = "#fff";
                ctx.font = `bold ${cardSize * 0.4}px 'Segoe UI', sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(slot.sym, sx + cardSize / 2, sy + cardSize * 0.4);
                ctx.font = `${cardSize * 0.17}px 'Segoe UI', sans-serif`;
                ctx.fillText(slot.element.name, sx + cardSize / 2, sy + cardSize * 0.72);

                const btn = { x: sx, y: sy, w: cardSize, h: cardSize, action: "selectElement", value: i };
                STATE.buttons.push(btn);
            });

            // Undo button
            if (STATE.selectedElements.length > 0 && !STATE.moleculeComplete) {
                const ub = drawButton("Desfazer", cx - S(50), canvas.height * 0.82, S(100), S(35), "#e74c3c", false);
                ub.action = "undo";
                STATE.buttons.push(ub);
            }

            // Molecule complete animation
            if (STATE.moleculeComplete) {
                ctx.fillStyle = "#22c55e";
                ctx.font = `bold ${S(22)}px 'Segoe UI', sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText("Molecula Formada!", cx, canvas.height * 0.48);
                STATE.moleculeTimer--;
                if (STATE.moleculeTimer <= 0) {
                    STATE.questionsAnswered++;
                    nextMode2Question();
                }
            }
        }
    }

    // ---- Mode 3: Quiz Atômico ----
    function startMode3() {
        STATE.screen = "mode3";
        STATE.currentRound = 0;
        STATE.modeScore = 0;
        STATE.streak = 0;
        STATE.feedback = null;
        STATE.questionTimer = STATE.maxQuestionTime;
        nextMode3Question();
    }

    function nextMode3Question() {
        STATE.currentRound++;
        if (STATE.currentRound > STATE.totalRounds) {
            showResult();
            return;
        }
        STATE.feedback = null;
        STATE.questionTimer = STATE.maxQuestionTime;

        const pool = shuffle(QUIZ_QUESTIONS);
        STATE.currentQuestion = pool[0];
        STATE.options = shuffle([...STATE.currentQuestion.opts]);
    }

    function drawMode3() {
        drawBackground();
        const cx = canvas.width / 2;
        drawHUD("Quiz Atomico");

        if (STATE.currentQuestion) {
            // Question
            ctx.fillStyle = "#fff";
            ctx.font = `bold ${S(18)}px 'Segoe UI', sans-serif`;
            ctx.textAlign = "center";

            // Word-wrap question
            const maxW = canvas.width * 0.8;
            const words = STATE.currentQuestion.q.split(" ");
            let lines = [];
            let line = "";
            words.forEach(w => {
                const test = line + (line ? " " : "") + w;
                if (ctx.measureText(test).width > maxW) {
                    lines.push(line);
                    line = w;
                } else line = test;
            });
            lines.push(line);
            lines.forEach((l, i) => {
                ctx.fillText(l, cx, canvas.height * 0.25 + i * S(26));
            });

            // Options
            STATE.buttons = [];
            const bw = S(260);
            const bh = S(44);
            const gap = S(12);
            const startY = canvas.height * 0.42;

            STATE.options.forEach((opt, i) => {
                let color = "#334155";
                if (STATE.feedback) {
                    if (opt === STATE.currentQuestion.a) color = "#22c55e";
                    else if (opt === STATE.feedback.chosen && !STATE.feedback.correct) color = "#ef4444";
                }
                const b = drawButton(opt, cx - bw / 2, startY + i * (bh + gap), bw, bh, color, false);
                b.action = "quizAnswer";
                b.value = opt;
                STATE.buttons.push(b);
            });

            drawTimerBar();
        }

        drawFeedback();
    }

    // ---- HUD ----
    function drawHUD(title) {
        const pad = S(15);

        // Top bar
        drawRoundedRect(pad, pad, canvas.width - pad * 2, S(50), S(8));
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Title
        ctx.fillStyle = "#22c55e";
        ctx.font = `bold ${S(16)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(title, pad + S(15), pad + S(25));

        // Score
        ctx.fillStyle = "#fbbf24";
        ctx.font = `bold ${S(14)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`Pts: ${STATE.modeScore}`, canvas.width / 2, pad + S(25));

        // Streak
        ctx.fillStyle = STATE.streak >= 3 ? "#f97316" : "rgba(255,255,255,0.5)";
        ctx.font = `${S(13)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "right";
        const streakText = STATE.streak >= 3 ? `Sequencia: ${STATE.streak}x` : `Sequencia: ${STATE.streak}`;
        ctx.fillText(streakText, canvas.width - pad - S(100), pad + S(18));

        // Round
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${S(12)}px 'Segoe UI', sans-serif`;
        ctx.fillText(`${STATE.currentRound}/${STATE.totalRounds}`, canvas.width - pad - S(100), pad + S(35));

        // Back button
        const bb = drawButton("Voltar", canvas.width - pad - S(80), pad + S(5), S(70), S(36), "#475569", false);
        bb.action = "back";
        STATE.buttons.push(bb);
    }

    function drawTimerBar() {
        if (STATE.feedback) return;
        const pad = S(15);
        const barW = canvas.width - pad * 4;
        const barH = S(6);
        const barY = canvas.height * 0.88;
        const frac = Math.max(0, STATE.questionTimer / STATE.maxQuestionTime);
        let barColor;
        if (frac > 0.5) barColor = "#22c55e";
        else if (frac > 0.25) barColor = "#f59e0b";
        else barColor = "#ef4444";

        drawRoundedRect(pad * 2, barY, barW, barH, 3);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fill();

        if (frac > 0) {
            drawRoundedRect(pad * 2, barY, barW * frac, barH, 3);
            ctx.fillStyle = barColor;
            ctx.fill();
        }
    }

    function drawFeedback() {
        if (!STATE.feedback) return;
        const cx = canvas.width / 2;
        const msgY = canvas.height * 0.92;
        ctx.font = `bold ${S(16)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        if (STATE.feedback.correct) {
            ctx.fillStyle = "#22c55e";
            ctx.fillText("Correto! +" + STATE.feedback.points + " pts", cx, msgY);
        } else {
            ctx.fillStyle = "#ef4444";
            ctx.fillText("Incorreto! Resposta: " + STATE.feedback.answer, cx, msgY);
        }
    }

    // ---- Result screen ----
    function showResult() {
        STATE.screen = "result";
        STATE.questionsAnswered += STATE.totalRounds;
        // Level up check
        if (STATE.modeScore >= STATE.totalRounds * 8) {
            STATE.level = Math.min(6, STATE.level + 1);
            sfxLevelUp();
        }
    }

    function drawResult() {
        drawBackground();
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.fillStyle = "#22c55e";
        ctx.font = `bold ${S(28)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Resultado", cx, cy - S(100));

        ctx.fillStyle = "#fbbf24";
        ctx.font = `bold ${S(40)}px 'Segoe UI', sans-serif`;
        ctx.fillText(`${STATE.modeScore} pontos`, cx, cy - S(40));

        ctx.fillStyle = "#fff";
        ctx.font = `${S(16)}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Nivel: ${STATE.level}  |  Melhor Sequencia: ${STATE.bestStreak}`, cx, cy + S(5));

        const pct = Math.round((STATE.questionsCorrect / Math.max(1, STATE.questionsAnswered)) * 100);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${S(14)}px 'Segoe UI', sans-serif`;
        ctx.fillText(`Acertos gerais: ${pct}%  |  Pontuacao Total: ${STATE.score}`, cx, cy + S(35));

        // Stars
        const stars = STATE.modeScore >= STATE.totalRounds * 12 ? 3 : STATE.modeScore >= STATE.totalRounds * 8 ? 2 : STATE.modeScore >= STATE.totalRounds * 4 ? 1 : 0;
        const starY = cy + S(70);
        for (let i = 0; i < 3; i++) {
            ctx.font = `${S(30)}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = i < stars ? "#fbbf24" : "rgba(255,255,255,0.15)";
            ctx.fillText("\u2605", cx - S(45) + i * S(45), starY);
        }

        STATE.buttons = [];
        const bw = S(200);
        const bh = S(45);
        const b1 = drawButton("Jogar Novamente", cx - bw / 2, cy + S(110), bw, bh, "#22c55e", false);
        b1.action = "replay";
        STATE.buttons.push(b1);

        const b2 = drawButton("Menu Principal", cx - bw / 2, cy + S(165), bw, bh, "#475569", false);
        b2.action = "back";
        STATE.buttons.push(b2);
    }

    // ---- Input handling ----
    let lastMode = null;

    function handleClick(mx, my) {
        ensureAudio();
        for (const btn of STATE.buttons) {
            if (!isInside(mx, my, btn)) continue;
            sfxClick();

            if (btn.action === "mode1") { lastMode = "mode1"; startMode1(); return; }
            if (btn.action === "mode2") { lastMode = "mode2"; startMode2(); return; }
            if (btn.action === "mode3") { lastMode = "mode3"; startMode3(); return; }
            if (btn.action === "back") { STATE.screen = "menu"; STATE.buttons = []; return; }

            if (btn.action === "replay") {
                if (lastMode === "mode1") startMode1();
                else if (lastMode === "mode2") startMode2();
                else if (lastMode === "mode3") startMode3();
                return;
            }

            // Mode 1 answer
            if (btn.action === "answer" && !STATE.feedback) {
                const correct = btn.value === STATE.currentQuestion.name;
                STATE.questionsAnswered++;
                if (correct) {
                    const pts = 10 + Math.floor(STATE.streak * 2) + Math.floor(STATE.questionTimer);
                    STATE.modeScore += pts;
                    STATE.score += pts;
                    STATE.streak++;
                    if (STATE.streak > STATE.bestStreak) STATE.bestStreak = STATE.streak;
                    STATE.questionsCorrect++;
                    STATE.feedback = { correct: true, points: pts, chosen: btn.value, answer: STATE.currentQuestion.name };
                    sfxCorrect();
                    spawnParticles(mx, my, "#22c55e", 25);
                } else {
                    STATE.streak = 0;
                    STATE.feedback = { correct: false, points: 0, chosen: btn.value, answer: STATE.currentQuestion.name };
                    sfxWrong();
                    spawnParticles(mx, my, "#ef4444", 15);
                }
                STATE.feedbackTimer = 75;
                return;
            }

            // Mode 2 select element
            if (btn.action === "selectElement" && !STATE.moleculeComplete) {
                const slot = STATE.availableSlots[btn.value];
                if (slot && !slot.used) {
                    slot.used = true;
                    STATE.selectedElements.push(slot);
                    sfxClick();
                    spawnParticles(mx, my, catColor(slot.element.cat), 10);
                    if (STATE.selectedElements.length === STATE.targetMolecule.components.length) {
                        checkMolecule();
                        if (!STATE.moleculeComplete) {
                            // Wrong combination
                            STATE.streak = 0;
                            STATE.questionsAnswered++;
                            sfxWrong();
                            spawnParticles(canvas.width / 2, canvas.height * 0.34, "#ef4444", 20);
                            // Reset after brief pause
                            setTimeout(() => {
                                STATE.selectedElements.forEach(s => s.used = false);
                                STATE.selectedElements = [];
                            }, 500);
                        } else {
                            STATE.questionsAnswered++;
                        }
                    }
                }
                return;
            }

            // Mode 2 undo
            if (btn.action === "undo" && !STATE.moleculeComplete) {
                const last = STATE.selectedElements.pop();
                if (last) last.used = false;
                return;
            }

            // Mode 3 quiz answer
            if (btn.action === "quizAnswer" && !STATE.feedback) {
                const correct = btn.value === STATE.currentQuestion.a;
                STATE.questionsAnswered++;
                if (correct) {
                    const pts = 10 + Math.floor(STATE.streak * 2) + Math.floor(STATE.questionTimer);
                    STATE.modeScore += pts;
                    STATE.score += pts;
                    STATE.streak++;
                    if (STATE.streak > STATE.bestStreak) STATE.bestStreak = STATE.streak;
                    STATE.questionsCorrect++;
                    STATE.feedback = { correct: true, points: pts, chosen: btn.value, answer: STATE.currentQuestion.a };
                    sfxCorrect();
                    spawnParticles(mx, my, "#22c55e", 25);
                } else {
                    STATE.streak = 0;
                    STATE.feedback = { correct: false, points: 0, chosen: btn.value, answer: STATE.currentQuestion.a };
                    sfxWrong();
                    spawnParticles(mx, my, "#ef4444", 15);
                }
                STATE.feedbackTimer = 75;
                return;
            }
        }
    }

    // Mouse
    canvas.addEventListener("click", e => {
        handleClick(e.clientX, e.clientY);
    });

    // Touch
    canvas.addEventListener("touchstart", e => {
        e.preventDefault();
        const t = e.touches[0];
        handleClick(t.clientX, t.clientY);
    }, { passive: false });

    // ---- Main loop ----
    let lastTime = 0;
    const FPS_INTERVAL = 1000 / 60;

    function update(dt) {
        updateParticles(dt);
        updateBgAtoms();

        // Timer for question modes
        if ((STATE.screen === "mode1" || STATE.screen === "mode3") && !STATE.feedback) {
            STATE.questionTimer -= dt / 1000;
            if (STATE.questionTimer <= 0) {
                STATE.questionTimer = 0;
                STATE.streak = 0;
                STATE.questionsAnswered++;
                if (STATE.screen === "mode1") {
                    STATE.feedback = { correct: false, points: 0, chosen: "", answer: STATE.currentQuestion.name };
                } else {
                    STATE.feedback = { correct: false, points: 0, chosen: "", answer: STATE.currentQuestion.a };
                }
                sfxWrong();
                STATE.feedbackTimer = 75;
            }
        }

        // Feedback timer
        if (STATE.feedback && STATE.feedbackTimer > 0) {
            STATE.feedbackTimer--;
            if (STATE.feedbackTimer <= 0) {
                if (STATE.screen === "mode1") nextMode1Question();
                else if (STATE.screen === "mode3") nextMode3Question();
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (STATE.screen) {
            case "menu": drawMenu(); break;
            case "mode1": drawMode1(); break;
            case "mode2": drawMode2(); break;
            case "mode3": drawMode3(); break;
            case "result": drawResult(); break;
        }

        drawParticles();
    }

    function loop(timestamp) {
        requestAnimationFrame(loop);
        const delta = timestamp - lastTime;
        if (delta >= FPS_INTERVAL) {
            lastTime = timestamp - (delta % FPS_INTERVAL);
            update(delta);
            draw();
        }
    }

    // ---- Boot ----
    setTimeout(() => {
        const loadEl = document.getElementById("loading");
        if (loadEl) loadEl.style.display = "none";
        requestAnimationFrame(loop);
    }, 800);

})();
