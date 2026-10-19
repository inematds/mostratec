// ============================================================
// História: Brasil e Mundo - Quiz Conquest Game
// Canvas-based educational history game (grades 3-9)
// ============================================================

(function () {
    "use strict";

    // --- Canvas Setup ---
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // --- Audio Engine ---
    let audioCtx = null;
    function ensureAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    function playTone(freq, dur, type, vol) {
        try {
            ensureAudio();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = type || "sine";
            o.frequency.value = freq;
            g.gain.value = vol || 0.15;
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start();
            o.stop(audioCtx.currentTime + dur);
        } catch (e) { /* silent fail */ }
    }
    function sfxCorrect() {
        playTone(523, 0.12, "sine", 0.18);
        setTimeout(() => playTone(659, 0.12, "sine", 0.18), 100);
        setTimeout(() => playTone(784, 0.25, "sine", 0.18), 200);
    }
    function sfxWrong() {
        playTone(220, 0.3, "sawtooth", 0.12);
        setTimeout(() => playTone(180, 0.35, "sawtooth", 0.12), 150);
    }
    function sfxClick() { playTone(880, 0.06, "sine", 0.1); }
    function sfxStar() {
        playTone(660, 0.1, "sine", 0.15);
        setTimeout(() => playTone(880, 0.1, "sine", 0.15), 80);
        setTimeout(() => playTone(1100, 0.2, "sine", 0.15), 160);
    }
    function sfxVictory() {
        [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.2, "sine", 0.12), i * 100);
        });
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
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // --- Floating text ---
    const floatingTexts = [];
    function addFloatingText(x, y, text, color) {
        floatingTexts.push({ x, y, text, color, life: 1, vy: -2 });
    }
    function updateFloatingTexts() {
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y += ft.vy;
            ft.life -= 0.018;
            if (ft.life <= 0) floatingTexts.splice(i, 1);
        }
    }
    function drawFloatingTexts() {
        floatingTexts.forEach(ft => {
            ctx.globalAlpha = ft.life;
            ctx.fillStyle = ft.color;
            ctx.font = "bold 22px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(ft.text, ft.x, ft.y);
        });
        ctx.globalAlpha = 1;
    }

    // --- Era & Question Data ---
    const ERAS = [
        {
            id: 0, grade: "3º ano",
            title: "Comunidade e Bairro",
            subtitle: "Primeiros Povos",
            color: "#4ade80", icon: "🏘️",
            bgGradient: ["#064e3b", "#0d0d18"],
            questions: [
                { q: "O que é uma comunidade?", opts: ["Um grupo de pessoas que vivem juntas", "Um tipo de animal", "Um rio grande", "Uma montanha"], ans: 0 },
                { q: "Quem foram os primeiros habitantes do Brasil?", opts: ["Os portugueses", "Os africanos", "Os povos indígenas", "Os holandeses"], ans: 2 },
                { q: "O que é um bairro?", opts: ["Um país", "Uma parte da cidade", "Um oceano", "Um planeta"], ans: 1 },
                { q: "Como os indígenas viviam antes dos europeus chegarem?", opts: ["Em apartamentos", "Em aldeias, da caça e pesca", "Em castelos", "Em barcos"], ans: 1 },
                { q: "O que é patrimônio cultural?", opts: ["Dinheiro no banco", "Costumes e tradições de um povo", "Um tipo de comida", "Uma marca de roupa"], ans: 1 }
            ]
        },
        {
            id: 1, grade: "4º ano",
            title: "Povos Indígenas",
            subtitle: "Chegada dos Portugueses",
            color: "#fb923c", icon: "⛵",
            bgGradient: ["#7c2d12", "#0d0d18"],
            questions: [
                { q: "Em que ano os portugueses chegaram ao Brasil?", opts: ["1300", "1500", "1700", "1822"], ans: 1 },
                { q: "Quem liderou a frota portuguesa que chegou ao Brasil?", opts: ["Cristóvão Colombo", "Vasco da Gama", "Pedro Álvares Cabral", "Napoleão"], ans: 2 },
                { q: "Qual era a principal atividade dos indígenas Tupi?", opts: ["Mineração", "Agricultura, caça e pesca", "Construção de castelos", "Comércio marítimo"], ans: 1 },
                { q: "O que os portugueses buscavam quando chegaram ao Brasil?", opts: ["Neve", "Ouro e riquezas", "Tecnologia", "Universidades"], ans: 1 },
                { q: "Qual árvore deu nome ao Brasil?", opts: ["Ipê", "Pau-brasil", "Jacarandá", "Araucária"], ans: 1 }
            ]
        },
        {
            id: 2, grade: "5º ano",
            title: "Brasil Colônia",
            subtitle: "Independência do Brasil",
            color: "#facc15", icon: "👑",
            bgGradient: ["#713f12", "#0d0d18"],
            questions: [
                { q: "Quem proclamou a Independência do Brasil?", opts: ["Tiradentes", "Dom Pedro I", "Getúlio Vargas", "Princesa Isabel"], ans: 1 },
                { q: "Em que data o Brasil se tornou independente?", opts: ["15 de novembro de 1889", "7 de setembro de 1822", "22 de abril de 1500", "13 de maio de 1888"], ans: 1 },
                { q: "O que era o sistema de capitanias hereditárias?", opts: ["Divisão do Brasil em faixas de terra", "Um tipo de escola", "Um esporte colonial", "Uma festa religiosa"], ans: 0 },
                { q: "Qual era o principal produto do Brasil Colônia no início?", opts: ["Café", "Cana-de-açúcar", "Soja", "Petróleo"], ans: 1 },
                { q: "Quem foi Tiradentes?", opts: ["Um rei português", "Um líder da Inconfidência Mineira", "Um navegador", "Um imperador"], ans: 1 }
            ]
        },
        {
            id: 3, grade: "6º ano",
            title: "Egito, Grécia e Roma",
            subtitle: "Civilizações Antigas",
            color: "#c084fc", icon: "🏛️",
            bgGradient: ["#3b0764", "#0d0d18"],
            questions: [
                { q: "Qual rio era fundamental para a civilização egípcia?", opts: ["Amazonas", "Nilo", "Tejo", "Ganges"], ans: 1 },
                { q: "Qual forma de governo foi inventada na Grécia Antiga?", opts: ["Monarquia", "Ditadura", "Democracia", "Feudalismo"], ans: 2 },
                { q: "O que eram as pirâmides do Egito?", opts: ["Mercados", "Túmulos de faraós", "Templos para festas", "Escolas"], ans: 1 },
                { q: "Qual era o principal espetáculo do Coliseu em Roma?", opts: ["Ópera", "Lutas de gladiadores", "Corridas de carro", "Aulas de filosofia"], ans: 1 },
                { q: "Quem foi Alexandre, o Grande?", opts: ["Um faraó egípcio", "Um imperador romano", "Um rei macedônio que conquistou vastos territórios", "Um filósofo grego"], ans: 2 }
            ]
        },
        {
            id: 4, grade: "7º ano",
            title: "Idade Média",
            subtitle: "Feudalismo e Navegações",
            color: "#60a5fa", icon: "⚔️",
            bgGradient: ["#1e3a5f", "#0d0d18"],
            questions: [
                { q: "O que era o feudalismo?", opts: ["Um sistema baseado em terras e vassalagem", "Uma religião", "Um tipo de comércio", "Uma forma de arte"], ans: 0 },
                { q: "Quem eram os senhores feudais?", opts: ["Comerciantes", "Donos de grandes extensões de terra", "Navegadores", "Artistas"], ans: 1 },
                { q: "O que foram as Cruzadas?", opts: ["Festas medievais", "Expedições militares à Terra Santa", "Torneios de cavaleiros", "Viagens comerciais"], ans: 1 },
                { q: "Qual país liderou as Grandes Navegações no século XV?", opts: ["Inglaterra", "França", "Portugal", "Alemanha"], ans: 2 },
                { q: "O que motivou as Grandes Navegações?", opts: ["Turismo", "Busca por rotas comerciais e especiarias", "Esporte", "Religião apenas"], ans: 1 }
            ]
        },
        {
            id: 5, grade: "8º ano",
            title: "Revoluções",
            subtitle: "Industrial e Francesa",
            color: "#f43f5e", icon: "🏭",
            bgGradient: ["#4c0519", "#0d0d18"],
            questions: [
                { q: "Em que país começou a Revolução Industrial?", opts: ["França", "Alemanha", "Inglaterra", "Estados Unidos"], ans: 2 },
                { q: "O que marcou o início da Revolução Francesa?", opts: ["Coroação de Napoleão", "Queda da Bastilha em 1789", "Descoberta da América", "Fim da Primeira Guerra"], ans: 1 },
                { q: "Qual foi o lema da Revolução Francesa?", opts: ["Ordem e Progresso", "Liberdade, Igualdade, Fraternidade", "Deus, Pátria e Família", "Trabalho e Paz"], ans: 1 },
                { q: "O que a Revolução Industrial trouxe de novo?", opts: ["Agricultura manual", "Máquinas a vapor e fábricas", "Cavalos mais rápidos", "Pintura renascentista"], ans: 1 },
                { q: "Quem foi Napoleão Bonaparte?", opts: ["Rei da Inglaterra", "Imperador francês e líder militar", "Inventor da máquina a vapor", "Filósofo iluminista"], ans: 1 }
            ]
        },
        {
            id: 6, grade: "9º ano",
            title: "Mundo Moderno",
            subtitle: "Guerras, Guerra Fria e Brasil",
            color: "#22d3ee", icon: "🌍",
            bgGradient: ["#083344", "#0d0d18"],
            questions: [
                { q: "Em que ano começou a Primeira Guerra Mundial?", opts: ["1905", "1914", "1939", "1945"], ans: 1 },
                { q: "O que foi a Guerra Fria?", opts: ["Uma guerra no Ártico", "Disputa entre EUA e URSS sem confronto direto", "Uma guerra civil no Brasil", "Um conflito na África"], ans: 1 },
                { q: "Quem foi o líder do Estado Novo no Brasil?", opts: ["Juscelino Kubitschek", "Getúlio Vargas", "Jânio Quadros", "Fernando Henrique"], ans: 1 },
                { q: "O que aconteceu em 1945?", opts: ["Início da Primeira Guerra", "Descoberta do Brasil", "Fim da Segunda Guerra Mundial", "Independência do Brasil"], ans: 2 },
                { q: "Quando o Brasil se tornou uma república?", opts: ["1822", "1889", "1945", "1964"], ans: 1 }
            ]
        }
    ];

    // --- Game State ---
    const state = {
        screen: "menu",       // menu, timeline, quiz, eraResult, victory
        currentEra: 0,
        currentQuestion: 0,
        score: 0,
        coins: 0,
        streak: 0,
        maxStreak: 0,
        eraCorrect: 0,
        eraResults: [],       // stars per era
        selectedOption: -1,
        answered: false,
        answerTimer: 0,
        transition: { active: false, progress: 0, from: "", to: "" },
        timelineScroll: 0,
        timelineTarget: 0,
        hoverBtn: -1,
        menuPulse: 0,
        bgStars: [],
        questionAnim: 0,
        optionAnims: [0, 0, 0, 0]
    };

    // Init background stars
    for (let i = 0; i < 80; i++) {
        state.bgStars.push({
            x: Math.random(),
            y: Math.random(),
            size: 0.5 + Math.random() * 2,
            speed: 0.0001 + Math.random() * 0.0003,
            brightness: 0.3 + Math.random() * 0.7
        });
    }

    // --- Utility ---
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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

    function drawStar(cx, cy, r, filled) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            const outerX = cx + Math.cos(angle) * r;
            const outerY = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);
            const innerAngle = angle + Math.PI / 5;
            const innerX = cx + Math.cos(innerAngle) * r * 0.4;
            const innerY = cy + Math.sin(innerAngle) * r * 0.4;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        if (filled) ctx.fill();
        else ctx.stroke();
    }

    // --- Background ---
    function drawBackground(grad) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, grad ? grad[0] : "#0d0d18");
        g.addColorStop(1, grad ? grad[1] : "#0d0d18");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Stars
        state.bgStars.forEach(s => {
            s.x += s.speed;
            if (s.x > 1) s.x = 0;
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.002 * s.speed * 1000);
            ctx.globalAlpha = s.brightness * pulse;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // --- HUD ---
    function drawHUD() {
        // Score
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        drawRoundedRect(10, 10, 180, 40, 8);
        ctx.fill();
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 16px 'Segoe UI', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("⭐ " + state.score + " pts", 22, 36);

        // Coins
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        drawRoundedRect(200, 10, 140, 40, 8);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.fillText("🪙 " + state.coins, 212, 36);

        // Streak
        if (state.streak > 1) {
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            drawRoundedRect(350, 10, 140, 40, 8);
            ctx.fill();
            ctx.fillStyle = "#f43f5e";
            ctx.fillText("🔥 x" + state.streak, 362, 36);
        }
    }

    // --- Buttons array for click detection ---
    let buttons = [];
    function addButton(x, y, w, h, id) {
        buttons.push({ x, y, w, h, id });
    }
    function hitTest(mx, my) {
        for (const b of buttons) {
            if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return b.id;
        }
        return null;
    }

    // --- MENU SCREEN ---
    function drawMenu() {
        drawBackground(["#1a0a2e", "#0d0d18"]);
        buttons = [];

        state.menuPulse += 0.03;

        // Title
        const titleY = H * 0.2;
        ctx.save();
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 20 + Math.sin(state.menuPulse) * 10;
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold " + Math.min(48, W * 0.08) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📜 História: Brasil e Mundo", W / 2, titleY);
        ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = Math.min(20, W * 0.035) + "px 'Segoe UI', sans-serif";
        ctx.fillText("Quiz de conquista histórica", W / 2, titleY + 40);
        ctx.fillText("Do 3º ao 9º ano", W / 2, titleY + 65);

        // Era icons preview
        const iconsY = H * 0.45;
        const spacing = Math.min(70, W / 10);
        const startX = W / 2 - (ERAS.length - 1) * spacing / 2;
        ERAS.forEach((era, i) => {
            const x = startX + i * spacing;
            const bobY = iconsY + Math.sin(state.menuPulse + i * 0.5) * 6;
            ctx.font = Math.min(32, W * 0.055) + "px 'Segoe UI'";
            ctx.fillText(era.icon, x, bobY);
        });

        // Play button
        const btnW = Math.min(280, W * 0.6);
        const btnH = 60;
        const btnX = W / 2 - btnW / 2;
        const btnY = H * 0.65;
        const pulse = 1 + Math.sin(state.menuPulse * 2) * 0.03;

        ctx.save();
        ctx.translate(W / 2, btnY + btnH / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-W / 2, -(btnY + btnH / 2));

        const grad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
        grad.addColorStop(0, "#f59e0b");
        grad.addColorStop(1, "#d97706");
        ctx.fillStyle = grad;
        drawRoundedRect(btnX, btnY, btnW, btnH, 14);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px 'Segoe UI', sans-serif";
        ctx.fillText("▶  JOGAR", W / 2, btnY + 38);
        ctx.restore();

        addButton(btnX, btnY, btnW, btnH, "play");

        // Instructions
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = "14px 'Segoe UI', sans-serif";
        ctx.fillText("Conquiste 7 eras da história respondendo perguntas!", W / 2, H * 0.85);
        ctx.fillText("Ganhe estrelas e moedas a cada era conquistada.", W / 2, H * 0.89);
    }

    // --- TIMELINE SCREEN ---
    function drawTimeline() {
        const era = ERAS[state.currentEra];
        drawBackground(era.bgGradient);
        drawHUD();
        buttons = [];

        const title = "📜 Linha do Tempo";
        ctx.fillStyle = "#fff";
        ctx.font = "bold " + Math.min(28, W * 0.05) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(title, W / 2, 75);

        // Timeline path
        const nodeSpacing = Math.min(110, (W - 80) / ERAS.length);
        const startX = W / 2 - (ERAS.length - 1) * nodeSpacing / 2;
        const lineY = H * 0.38;

        // Draw connecting line
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(startX + (ERAS.length - 1) * nodeSpacing, lineY);
        ctx.stroke();

        // Completed line
        if (state.currentEra > 0) {
            const grad = ctx.createLinearGradient(startX, 0, startX + (state.currentEra) * nodeSpacing, 0);
            grad.addColorStop(0, "#4ade80");
            grad.addColorStop(1, "#facc15");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(startX, lineY);
            ctx.lineTo(startX + (state.currentEra - 1) * nodeSpacing, lineY);
            ctx.stroke();
        }

        // Draw nodes
        ERAS.forEach((e, i) => {
            const x = startX + i * nodeSpacing;
            const completed = i < state.currentEra;
            const current = i === state.currentEra;
            const locked = i > state.currentEra;

            // Node circle
            const radius = current ? 28 : 22;
            ctx.beginPath();
            ctx.arc(x, lineY, radius, 0, Math.PI * 2);

            if (completed) {
                ctx.fillStyle = e.color;
                ctx.fill();
                // Stars
                const stars = state.eraResults[i] || 0;
                for (let s = 0; s < 3; s++) {
                    ctx.fillStyle = s < stars ? "#facc15" : "rgba(255,255,255,0.2)";
                    drawStar(x - 16 + s * 16, lineY + radius + 18, 7, true);
                }
            } else if (current) {
                ctx.fillStyle = e.color;
                ctx.fill();
                // Pulse ring
                const pulseR = radius + 5 + Math.sin(Date.now() * 0.005) * 4;
                ctx.strokeStyle = e.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.005) * 0.3;
                ctx.beginPath();
                ctx.arc(x, lineY, pulseR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = "rgba(255,255,255,0.1)";
                ctx.fill();
                ctx.strokeStyle = "rgba(255,255,255,0.2)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Icon/number
            ctx.font = current ? "22px 'Segoe UI'" : "16px 'Segoe UI'";
            ctx.textAlign = "center";
            ctx.fillStyle = locked ? "rgba(255,255,255,0.3)" : "#fff";
            ctx.fillText(locked ? "🔒" : e.icon, x, lineY + (current ? 7 : 6));

            // Era label below
            ctx.font = "11px 'Segoe UI', sans-serif";
            ctx.fillStyle = current ? "#fff" : "rgba(255,255,255,0.5)";
            ctx.fillText(e.grade, x, lineY + radius + (completed ? 38 : 20));
        });

        // Current era info box
        const boxW = Math.min(420, W - 40);
        const boxH = 180;
        const boxX = W / 2 - boxW / 2;
        const boxY = H * 0.55;

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        drawRoundedRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.strokeStyle = era.color;
        ctx.lineWidth = 2;
        drawRoundedRect(boxX, boxY, boxW, boxH, 16);
        ctx.stroke();

        ctx.font = "36px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText(era.icon, W / 2, boxY + 45);

        ctx.fillStyle = era.color;
        ctx.font = "bold 20px 'Segoe UI', sans-serif";
        ctx.fillText(era.title, W / 2, boxY + 78);

        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "15px 'Segoe UI', sans-serif";
        ctx.fillText(era.subtitle + " — " + era.grade, W / 2, boxY + 100);
        ctx.fillText("5 perguntas • Ganhe até 3 estrelas", W / 2, boxY + 122);

        // Start button
        const sBtnW = Math.min(220, W * 0.5);
        const sBtnH = 50;
        const sBtnX = W / 2 - sBtnW / 2;
        const sBtnY = boxY + boxH + 20;

        const sGrad = ctx.createLinearGradient(sBtnX, sBtnY, sBtnX + sBtnW, sBtnY + sBtnH);
        sGrad.addColorStop(0, era.color);
        sGrad.addColorStop(1, shadeColor(era.color, -30));
        ctx.fillStyle = sGrad;
        drawRoundedRect(sBtnX, sBtnY, sBtnW, sBtnH, 12);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px 'Segoe UI', sans-serif";
        ctx.fillText("⚔️ Conquistar Era", W / 2, sBtnY + 32);

        addButton(sBtnX, sBtnY, sBtnW, sBtnH, "startEra");
    }

    function shadeColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const r = clamp((num >> 16) + percent, 0, 255);
        const g = clamp(((num >> 8) & 0x00FF) + percent, 0, 255);
        const b = clamp((num & 0x0000FF) + percent, 0, 255);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // --- QUIZ SCREEN ---
    function drawQuiz() {
        const era = ERAS[state.currentEra];
        const question = era.questions[state.currentQuestion];
        drawBackground(era.bgGradient);
        drawHUD();
        buttons = [];

        // Animate question entrance
        state.questionAnim = Math.min(1, state.questionAnim + 0.05);
        for (let i = 0; i < 4; i++) {
            state.optionAnims[i] = Math.min(1, state.optionAnims[i] + 0.04);
        }

        // Progress bar
        const progW = Math.min(400, W - 60);
        const progX = W / 2 - progW / 2;
        const progY = 65;
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        drawRoundedRect(progX, progY, progW, 8, 4);
        ctx.fill();
        const filled = ((state.currentQuestion + (state.answered ? 1 : 0)) / 5) * progW;
        ctx.fillStyle = era.color;
        drawRoundedRect(progX, progY, Math.max(8, filled), 8, 4);
        ctx.fill();

        // Question counter
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "14px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(era.icon + " " + era.title + "  —  Pergunta " + (state.currentQuestion + 1) + "/5", W / 2, progY - 10);

        // Question text
        const qBoxW = Math.min(560, W - 40);
        const qBoxX = W / 2 - qBoxW / 2;
        const qBoxY = progY + 30;

        ctx.globalAlpha = state.questionAnim;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        drawRoundedRect(qBoxX, qBoxY, qBoxW, 80, 12);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold " + Math.min(18, W * 0.035) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";

        // Word wrap question
        const words = question.q.split(" ");
        let lines = [];
        let currentLine = "";
        words.forEach(word => {
            const test = currentLine ? currentLine + " " + word : word;
            if (ctx.measureText(test).width > qBoxW - 40) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = test;
            }
        });
        if (currentLine) lines.push(currentLine);

        lines.forEach((line, i) => {
            ctx.fillText(line, W / 2, qBoxY + 35 + i * 25);
        });
        ctx.globalAlpha = 1;

        // Options
        const optW = Math.min(500, W - 40);
        const optH = 55;
        const optGap = 12;
        const optStartY = qBoxY + 100;

        question.opts.forEach((opt, i) => {
            const optX = W / 2 - optW / 2;
            const optY = optStartY + i * (optH + optGap);

            // Slide in animation
            const slideOffset = (1 - state.optionAnims[i]) * 60;
            ctx.globalAlpha = state.optionAnims[i];

            let bgColor = "rgba(255,255,255,0.08)";
            let borderColor = "rgba(255,255,255,0.15)";
            let textColor = "#fff";

            if (state.answered) {
                if (i === question.ans) {
                    bgColor = "rgba(74,222,128,0.25)";
                    borderColor = "#4ade80";
                    textColor = "#4ade80";
                } else if (i === state.selectedOption && i !== question.ans) {
                    bgColor = "rgba(239,68,68,0.25)";
                    borderColor = "#ef4444";
                    textColor = "#ef4444";
                }
            } else if (state.hoverBtn === "opt" + i) {
                bgColor = "rgba(255,255,255,0.15)";
                borderColor = era.color;
            }

            ctx.fillStyle = bgColor;
            drawRoundedRect(optX + slideOffset, optY, optW, optH, 10);
            ctx.fill();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            drawRoundedRect(optX + slideOffset, optY, optW, optH, 10);
            ctx.stroke();

            // Option letter
            const letters = ["A", "B", "C", "D"];
            ctx.fillStyle = era.color;
            ctx.font = "bold 16px 'Segoe UI', sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(letters[i], optX + slideOffset + 18, optY + 34);

            // Option text
            ctx.fillStyle = textColor;
            ctx.font = Math.min(16, W * 0.03) + "px 'Segoe UI', sans-serif";
            ctx.fillText(opt, optX + slideOffset + 44, optY + 34);

            // Result icon
            if (state.answered) {
                ctx.font = "22px 'Segoe UI'";
                ctx.textAlign = "right";
                if (i === question.ans) ctx.fillText("✅", optX + optW - 15, optY + 36);
                else if (i === state.selectedOption && i !== question.ans) ctx.fillText("❌", optX + optW - 15, optY + 36);
            }

            ctx.globalAlpha = 1;

            if (!state.answered) {
                addButton(optX, optY, optW, optH, "opt" + i);
            }
        });

        // Next button (after answering)
        if (state.answered && state.answerTimer > 30) {
            const nBtnW = Math.min(200, W * 0.4);
            const nBtnH = 48;
            const nBtnX = W / 2 - nBtnW / 2;
            const nBtnY = optStartY + 4 * (optH + optGap) + 15;

            ctx.fillStyle = era.color;
            drawRoundedRect(nBtnX, nBtnY, nBtnW, nBtnH, 10);
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            const nextLabel = state.currentQuestion < 4 ? "Próxima ▶" : "Ver Resultado";
            ctx.fillText(nextLabel, W / 2, nBtnY + 30);

            addButton(nBtnX, nBtnY, nBtnW, nBtnH, "next");
        }
    }

    // --- ERA RESULT SCREEN ---
    function drawEraResult() {
        const era = ERAS[state.currentEra];
        drawBackground(era.bgGradient);
        buttons = [];

        const stars = state.eraResults[state.currentEra];
        const cx = W / 2;

        // Title
        ctx.fillStyle = "#fff";
        ctx.font = "bold " + Math.min(28, W * 0.05) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Era Conquistada!", cx, H * 0.15);

        ctx.font = "48px 'Segoe UI'";
        ctx.fillText(era.icon, cx, H * 0.26);

        ctx.fillStyle = era.color;
        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.fillText(era.title, cx, H * 0.34);

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "16px 'Segoe UI', sans-serif";
        ctx.fillText(state.eraCorrect + " de 5 corretas", cx, H * 0.39);

        // Stars
        const starY = H * 0.48;
        for (let i = 0; i < 3; i++) {
            const sx = cx - 60 + i * 60;
            const filled = i < stars;
            const size = 24 + (filled ? Math.sin(Date.now() * 0.003 + i) * 3 : 0);
            ctx.fillStyle = filled ? "#facc15" : "rgba(255,255,255,0.15)";
            ctx.strokeStyle = filled ? "#facc15" : "rgba(255,255,255,0.3)";
            ctx.lineWidth = 2;
            drawStar(sx, starY, size, filled);
            if (!filled) {
                drawStar(sx, starY, size, false);
            }
        }

        // Stats box
        const sBoxW = Math.min(300, W - 40);
        const sBoxX = cx - sBoxW / 2;
        const sBoxY = H * 0.56;

        ctx.fillStyle = "rgba(0,0,0,0.4)";
        drawRoundedRect(sBoxX, sBoxY, sBoxW, 100, 12);
        ctx.fill();

        ctx.font = "16px 'Segoe UI', sans-serif";
        ctx.fillStyle = "#facc15";
        ctx.textAlign = "left";
        ctx.fillText("⭐ Pontos ganhos: +" + (state.eraCorrect * 20 + (stars === 3 ? 30 : 0)), sBoxX + 20, sBoxY + 30);
        ctx.fillStyle = "#f59e0b";
        ctx.fillText("🪙 Moedas ganhas: +" + (state.eraCorrect * 5), sBoxX + 20, sBoxY + 55);
        ctx.fillStyle = "#f43f5e";
        ctx.fillText("🔥 Maior sequência: " + state.maxStreak, sBoxX + 20, sBoxY + 80);

        // Next era button
        const isLastEra = state.currentEra >= ERAS.length - 1;
        const btnLabel = isLastEra ? "🏆 Ver Resultado Final" : "▶ Próxima Era";
        const bW = Math.min(260, W * 0.5);
        const bH = 50;
        const bX = cx - bW / 2;
        const bY = H * 0.78;

        const grad = ctx.createLinearGradient(bX, bY, bX + bW, bY + bH);
        grad.addColorStop(0, era.color);
        grad.addColorStop(1, shadeColor(era.color, -30));
        ctx.fillStyle = grad;
        drawRoundedRect(bX, bY, bW, bH, 12);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(btnLabel, cx, bY + 32);

        addButton(bX, bY, bW, bH, "nextEra");
    }

    // --- VICTORY SCREEN ---
    function drawVictory() {
        drawBackground(["#1a0a2e", "#0d0d18"]);
        buttons = [];

        const cx = W / 2;

        // Confetti particles
        if (particles.length < 40) {
            spawnParticles(Math.random() * W, -10, ["#f59e0b", "#4ade80", "#60a5fa", "#f43f5e", "#c084fc"][Math.floor(Math.random() * 5)], 2, 2);
        }

        ctx.save();
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#facc15";
        ctx.font = "bold " + Math.min(42, W * 0.07) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🏆 Parabéns! 🏆", cx, H * 0.12);
        ctx.restore();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.fillText("Você conquistou todas as eras!", cx, H * 0.19);

        // Total stars
        const totalStars = state.eraResults.reduce((a, b) => a + b, 0);
        const maxStars = ERAS.length * 3;

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 36px 'Segoe UI', sans-serif";
        ctx.fillText("⭐ " + totalStars + " / " + maxStars + " estrelas", cx, H * 0.27);

        // Era results summary
        const rowH = 40;
        const boxW = Math.min(420, W - 30);
        const boxX = cx - boxW / 2;
        const boxY = H * 0.32;

        ctx.fillStyle = "rgba(0,0,0,0.4)";
        drawRoundedRect(boxX, boxY, boxW, ERAS.length * rowH + 20, 12);
        ctx.fill();

        ERAS.forEach((era, i) => {
            const ry = boxY + 20 + i * rowH;
            ctx.font = "16px 'Segoe UI'";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillText(era.icon + " " + era.title, boxX + 15, ry + 18);

            // Stars
            const stars = state.eraResults[i] || 0;
            ctx.textAlign = "right";
            for (let s = 0; s < 3; s++) {
                ctx.fillStyle = s < stars ? "#facc15" : "rgba(255,255,255,0.15)";
                drawStar(boxX + boxW - 60 + s * 20, ry + 14, 8, true);
            }
        });

        // Stats
        const statY = boxY + ERAS.length * rowH + 45;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Pontuação final: " + state.score + " pts", cx, statY);
        ctx.fillStyle = "#f59e0b";
        ctx.fillText("Moedas coletadas: " + state.coins, cx, statY + 28);
        ctx.fillStyle = "#f43f5e";
        ctx.fillText("Maior sequência: " + state.maxStreak, cx, statY + 56);

        // Replay button
        const bW = Math.min(220, W * 0.45);
        const bH = 50;
        const bX = cx - bW / 2;
        const bY = Math.min(statY + 80, H - 80);

        const grad = ctx.createLinearGradient(bX, bY, bX + bW, bY + bH);
        grad.addColorStop(0, "#f59e0b");
        grad.addColorStop(1, "#d97706");
        ctx.fillStyle = grad;
        drawRoundedRect(bX, bY, bW, bH, 12);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px 'Segoe UI', sans-serif";
        ctx.fillText("🔄 Jogar Novamente", cx, bY + 32);

        addButton(bX, bY, bW, bH, "replay");
    }

    // --- Transition Overlay ---
    function drawTransition() {
        if (!state.transition.active) return;
        state.transition.progress += 0.03;

        const p = state.transition.progress;
        if (p < 0.5) {
            // Fade in
            ctx.fillStyle = "rgba(0,0,0," + (p * 2) + ")";
            ctx.fillRect(0, 0, W, H);
        } else if (p < 0.55) {
            // Switch screen at midpoint
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.fillRect(0, 0, W, H);
            state.screen = state.transition.to;
        } else if (p < 1) {
            // Fade out
            ctx.fillStyle = "rgba(0,0,0," + ((1 - p) * 2) + ")";
            ctx.fillRect(0, 0, W, H);
        } else {
            state.transition.active = false;
        }
    }

    function startTransition(from, to) {
        state.transition = { active: true, progress: 0, from, to };
    }

    // --- Input ---
    function handleClick(x, y) {
        ensureAudio();
        const hit = hitTest(x, y);
        if (!hit || state.transition.active) return;

        if (hit === "play") {
            sfxClick();
            startTransition("menu", "timeline");
        } else if (hit === "startEra") {
            sfxClick();
            state.currentQuestion = 0;
            state.eraCorrect = 0;
            state.answered = false;
            state.selectedOption = -1;
            state.questionAnim = 0;
            state.optionAnims = [0, 0, 0, 0];
            startTransition("timeline", "quiz");
        } else if (hit.startsWith("opt")) {
            const idx = parseInt(hit.replace("opt", ""));
            if (state.answered) return;
            state.selectedOption = idx;
            state.answered = true;
            state.answerTimer = 0;

            const era = ERAS[state.currentEra];
            const question = era.questions[state.currentQuestion];
            const correct = idx === question.ans;

            if (correct) {
                sfxCorrect();
                state.eraCorrect++;
                state.streak++;
                if (state.streak > state.maxStreak) state.maxStreak = state.streak;

                const bonus = state.streak > 1 ? state.streak * 5 : 0;
                state.score += 20 + bonus;
                state.coins += 5;

                spawnParticles(W / 2, H * 0.4, "#4ade80", 25, 4);
                addFloatingText(W / 2, H * 0.35, "+20 pts" + (bonus > 0 ? " (+" + bonus + " bônus)" : ""), "#4ade80");
            } else {
                sfxWrong();
                state.streak = 0;
                spawnParticles(W / 2, H * 0.4, "#ef4444", 15, 3);
                addFloatingText(W / 2, H * 0.35, "Resposta incorreta", "#ef4444");
            }
        } else if (hit === "next") {
            sfxClick();
            if (state.currentQuestion < 4) {
                state.currentQuestion++;
                state.answered = false;
                state.selectedOption = -1;
                state.questionAnim = 0;
                state.optionAnims = [0, 0, 0, 0];
            } else {
                // Era complete
                const stars = state.eraCorrect >= 5 ? 3 : state.eraCorrect >= 3 ? 2 : state.eraCorrect >= 1 ? 1 : 0;
                state.eraResults[state.currentEra] = stars;

                // Bonus for perfect
                if (stars === 3) {
                    state.score += 30;
                    state.coins += 10;
                }

                sfxStar();
                spawnParticles(W / 2, H * 0.5, "#facc15", 40, 5);
                startTransition("quiz", "eraResult");
            }
        } else if (hit === "nextEra") {
            sfxClick();
            if (state.currentEra >= ERAS.length - 1) {
                sfxVictory();
                startTransition("eraResult", "victory");
            } else {
                state.currentEra++;
                state.streak = 0;
                startTransition("eraResult", "timeline");
            }
        } else if (hit === "replay") {
            sfxClick();
            state.currentEra = 0;
            state.currentQuestion = 0;
            state.score = 0;
            state.coins = 0;
            state.streak = 0;
            state.maxStreak = 0;
            state.eraCorrect = 0;
            state.eraResults = [];
            state.answered = false;
            state.selectedOption = -1;
            startTransition("victory", "menu");
        }
    }

    // Mouse
    canvas.addEventListener("click", (e) => {
        handleClick(e.clientX, e.clientY);
    });
    canvas.addEventListener("mousemove", (e) => {
        const hit = hitTest(e.clientX, e.clientY);
        canvas.style.cursor = hit ? "pointer" : "default";
        state.hoverBtn = hit;
    });

    // Touch
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const t = e.touches[0];
        handleClick(t.clientX, t.clientY);
    }, { passive: false });

    // --- Main Loop ---
    function update() {
        if (state.answered) state.answerTimer++;
        updateParticles();
        updateFloatingTexts();
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        switch (state.screen) {
            case "menu": drawMenu(); break;
            case "timeline": drawTimeline(); break;
            case "quiz": drawQuiz(); break;
            case "eraResult": drawEraResult(); break;
            case "victory": drawVictory(); break;
        }

        drawParticles();
        drawFloatingTexts();
        drawTransition();
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    // --- Init ---
    function init() {
        const loadDiv = document.getElementById("loading");
        if (loadDiv) loadDiv.style.display = "none";
        loop();
    }

    // Start after a brief delay to show loading screen
    setTimeout(init, 600);

})();
