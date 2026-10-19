/*
 * Arte Digital Studio - Jogo educativo de Artes (6o ao 9o ano)
 * Ferramenta de desenho digital com desafios artísticos
 */

(function () {
    "use strict";

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // ── Off-screen drawing canvas ──
    const drawCanvas = document.createElement("canvas");
    const drawCtx = drawCanvas.getContext("2d");

    let W, H;
    let dpr = window.devicePixelRatio || 1;

    // ── State ──
    const STATE = {
        screen: "menu",        // menu | mode_select | free | challenges | challenge_list | challenge_play | color_mixer | results
        tool: "brush",         // brush | eraser | fill | shape
        shapeType: "circle",   // circle | square | triangle
        brushSize: 8,
        currentColor: "#ec4899",
        secondaryColor: "#3b82f6",
        mixedColor: null,
        palette: [
            "#ef4444", "#f97316", "#eab308", "#22c55e",
            "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff",
            "#000000", "#6b7280", "#92400e", "#06b6d4",
            "#f43f5e", "#a3e635", "#fbbf24", "#7c3aed"
        ],
        brushSizes: [4, 8, 16, 28],
        brushSizeIndex: 1,
        drawing: false,
        lastX: 0,
        lastY: 0,
        drawAreaTop: 0,
        drawAreaLeft: 0,
        drawAreaWidth: 0,
        drawAreaHeight: 0,
        challengeIndex: -1,
        challengeStars: new Array(10).fill(0),
        challengeTimer: 0,
        challengeMaxTime: 0,
        challengeStarted: false,
        challengeStrokes: 0,
        symmetryMode: false,
        gridMode: false,
        gridSize: 16,
        totalStars: 0,
        shapeStart: null,
        shapeDragging: false,
        hoverBtn: null,
        animTime: 0,
        menuParticles: [],
        transitionAlpha: 0,
        transitionTarget: null,
    };

    // ── Challenges ──
    const CHALLENGES = [
        {
            id: 0,
            title: "Cores Primarias",
            desc: "Use apenas as 3 cores primarias (vermelho, amarelo e azul) para pintar livremente.",
            icon: "🔴🟡🔵",
            allowedColors: ["#ef4444", "#eab308", "#3b82f6"],
            time: 90,
            goal: "strokes",
            goalValue: 15,
            concept: "As cores primarias nao podem ser obtidas pela mistura de outras cores."
        },
        {
            id: 1,
            title: "Cores Secundarias",
            desc: "Misture cores primarias no Mixer para descobrir as 3 cores secundarias: laranja, verde e roxo.",
            icon: "🟠🟢🟣",
            allowedColors: null,
            time: 120,
            goal: "mix",
            goalValue: 3,
            concept: "Cores secundarias surgem da mistura de duas primarias.",
            mixTargets: [
                { c1: "#ef4444", c2: "#eab308", result: "laranja" },
                { c1: "#eab308", c2: "#3b82f6", result: "verde" },
                { c1: "#ef4444", c2: "#3b82f6", result: "roxo" }
            ]
        },
        {
            id: 2,
            title: "Simetria Vertical",
            desc: "Desenhe no lado esquerdo e veja o reflexo automatico no lado direito!",
            icon: "🪞",
            allowedColors: null,
            time: 90,
            goal: "strokes",
            goalValue: 20,
            concept: "Simetria e quando uma metade e o reflexo da outra.",
            symmetry: true
        },
        {
            id: 3,
            title: "Pixel Art",
            desc: "Crie um desenho pixel art usando a grade. Preencha pelo menos 30 quadrados.",
            icon: "🟩",
            allowedColors: null,
            time: 120,
            goal: "pixels",
            goalValue: 30,
            concept: "Pixel art usa quadrados (pixels) para criar imagens, como nos jogos antigos.",
            grid: true,
            gridSize: 16
        },
        {
            id: 4,
            title: "Desenhe uma Casa",
            desc: "Use as formas geometricas (quadrado + triangulo) para construir uma casa.",
            icon: "🏠",
            allowedColors: null,
            time: 120,
            goal: "shapes",
            goalValue: 5,
            concept: "Formas geometricas sao a base de toda composicao artistica."
        },
        {
            id: 5,
            title: "Padrao Geometrico",
            desc: "Crie um padrao repetitivo usando formas e cores. Use pelo menos 3 cores diferentes.",
            icon: "🔷",
            allowedColors: null,
            time: 120,
            goal: "pattern",
            goalValue: 8,
            concept: "Padroes geometricos sao usados em arte islamica, indigena e moderna."
        },
        {
            id: 6,
            title: "Tons Quentes",
            desc: "Pinte usando apenas cores quentes: vermelho, laranja e amarelo.",
            icon: "🔥",
            allowedColors: ["#ef4444", "#f97316", "#eab308", "#f43f5e", "#fbbf24"],
            time: 90,
            goal: "strokes",
            goalValue: 20,
            concept: "Cores quentes transmitem energia, calor e vivacidade."
        },
        {
            id: 7,
            title: "Tons Frios",
            desc: "Pinte usando apenas cores frias: azul, verde e roxo.",
            icon: "❄️",
            allowedColors: ["#3b82f6", "#22c55e", "#8b5cf6", "#06b6d4", "#7c3aed"],
            time: 90,
            goal: "strokes",
            goalValue: 20,
            concept: "Cores frias transmitem calma, tranquilidade e profundidade."
        },
        {
            id: 8,
            title: "Composicao Livre",
            desc: "Crie uma cena usando pelo menos 5 formas diferentes e 4 cores. Capriche!",
            icon: "🎨",
            allowedColors: null,
            time: 150,
            goal: "composition",
            goalValue: 5,
            concept: "Composicao e a organizacao dos elementos visuais em uma obra."
        },
        {
            id: 9,
            title: "Monocromatico",
            desc: "Escolha UMA cor e pinte usando apenas ela em diferentes tamanhos de pincel.",
            icon: "⬛",
            allowedColors: null,
            time: 90,
            goal: "mono",
            goalValue: 15,
            concept: "Arte monocromatica usa variações de uma unica cor, criando profundidade."
        }
    ];

    // ── Challenge tracking ──
    let challengeData = {
        strokes: 0,
        shapes: 0,
        colorsUsed: new Set(),
        pixelsFilled: 0,
        mixesDone: [],
        monoColor: null,
        monoBrushSizes: new Set()
    };

    // ── Resize ──
    function resize() {
        dpr = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (drawCanvas.width !== W * dpr || drawCanvas.height !== H * dpr) {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = drawCanvas.width;
            tempCanvas.height = drawCanvas.height;
            tempCanvas.getContext("2d").drawImage(drawCanvas, 0, 0);
            drawCanvas.width = W * dpr;
            drawCanvas.height = H * dpr;
            drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, W, H);
        }
    }

    // ── Menu particles ──
    function initParticles() {
        STATE.menuParticles = [];
        for (let i = 0; i < 30; i++) {
            STATE.menuParticles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 2 + Math.random() * 4,
                color: STATE.palette[Math.floor(Math.random() * STATE.palette.length)],
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                alpha: 0.3 + Math.random() * 0.5
            });
        }
    }

    function updateParticles() {
        for (const p of STATE.menuParticles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;
        }
    }

    function drawParticles() {
        for (const p of STATE.menuParticles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // ── UI helpers ──
    function drawRoundRect(x, y, w, h, r) {
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

    function drawButton(x, y, w, h, text, color, hovered, fontSize) {
        fontSize = fontSize || 16;
        const glow = hovered ? 0.15 : 0;
        ctx.save();
        if (hovered) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
        }
        drawRoundRect(x, y, w, h, 10);
        ctx.fillStyle = hovered ? color : "rgba(255,255,255,0.07)";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = hovered ? "#fff" : color;
        ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + w / 2, y + h / 2);
    }

    // Button registry for hit testing
    let buttons = [];
    function registerButton(id, x, y, w, h, action) {
        buttons.push({ id, x, y, w, h, action });
    }

    function clearButtons() {
        buttons = [];
    }

    // ── SCREENS ──

    function drawMenu() {
        ctx.fillStyle = "#0d0d18";
        ctx.fillRect(0, 0, W, H);
        updateParticles();
        drawParticles();

        const cx = W / 2;
        const cy = H / 2;

        // Title
        ctx.fillStyle = "#ec4899";
        ctx.font = `bold ${Math.min(48, W * 0.08)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Arte Digital Studio", cx, cy - 120);

        // Subtitle
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${Math.min(18, W * 0.035)}px 'Segoe UI', sans-serif`;
        ctx.fillText("Crie, explore e aprenda arte digital!", cx, cy - 75);

        // Palette icon animation
        const iconSize = 30;
        const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
        for (let i = 0; i < colors.length; i++) {
            const angle = (STATE.animTime * 0.5 + i * 60) * Math.PI / 180;
            const ix = cx + Math.cos(angle) * 50;
            const iy = cy - 30 + Math.sin(angle) * 20;
            ctx.fillStyle = colors[i];
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(ix, iy, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const btnW = 220;
        const btnH = 50;

        drawButton(cx - btnW / 2, cy + 20, btnW, btnH, "Modo Livre", "#22c55e", STATE.hoverBtn === "free", 18);
        registerButton("free", cx - btnW / 2, cy + 20, btnW, btnH, () => startFreeMode());

        drawButton(cx - btnW / 2, cy + 85, btnW, btnH, "Desafios", "#3b82f6", STATE.hoverBtn === "challenges", 18);
        registerButton("challenges", cx - btnW / 2, cy + 85, btnW, btnH, () => showChallengeList());

        drawButton(cx - btnW / 2, cy + 150, btnW, btnH, "Mixer de Cores", "#8b5cf6", STATE.hoverBtn === "mixer", 18);
        registerButton("mixer", cx - btnW / 2, cy + 150, btnW, btnH, () => startColorMixer());

        // Stars count
        const totalStars = STATE.challengeStars.reduce((a, b) => a + b, 0);
        if (totalStars > 0) {
            ctx.fillStyle = "#fbbf24";
            ctx.font = "16px 'Segoe UI', sans-serif";
            ctx.fillText(`Total de estrelas: ${"★".repeat(Math.min(totalStars, 30))} (${totalStars}/30)`, cx, cy + 230);
        }

        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = "13px 'Segoe UI', sans-serif";
        ctx.fillText("Artes - 6o ao 9o ano", cx, H - 30);
    }

    function showChallengeList() {
        STATE.screen = "challenge_list";
    }

    function drawChallengeList() {
        ctx.fillStyle = "#0d0d18";
        ctx.fillRect(0, 0, W, H);
        drawParticles();
        updateParticles();

        ctx.fillStyle = "#3b82f6";
        ctx.font = `bold ${Math.min(32, W * 0.06)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Desafios de Arte", W / 2, 45);

        const cols = W > 700 ? 2 : 1;
        const cardW = Math.min(320, (W - 60) / cols);
        const cardH = 70;
        const gap = 12;
        const startX = W / 2 - (cols * (cardW + gap) - gap) / 2;
        const startY = 80;

        for (let i = 0; i < CHALLENGES.length; i++) {
            const ch = CHALLENGES[i];
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (cardW + gap);
            const y = startY + row * (cardH + gap);

            const hovered = STATE.hoverBtn === `ch_${i}`;
            drawRoundRect(x, y, cardW, cardH, 8);
            ctx.fillStyle = hovered ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)";
            ctx.fill();
            ctx.strokeStyle = hovered ? "#3b82f6" : "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = "#fff";
            ctx.font = "bold 15px 'Segoe UI', sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(`${ch.icon} ${ch.title}`, x + 12, y + 25);

            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "12px 'Segoe UI', sans-serif";
            const descShort = ch.desc.length > 50 ? ch.desc.substring(0, 50) + "..." : ch.desc;
            ctx.fillText(descShort, x + 12, y + 48);

            // Stars
            const stars = STATE.challengeStars[i];
            ctx.fillStyle = "#fbbf24";
            ctx.font = "14px 'Segoe UI', sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(stars > 0 ? "★".repeat(stars) + "☆".repeat(3 - stars) : "☆☆☆", x + cardW - 10, y + 25);

            registerButton(`ch_${i}`, x, y, cardW, cardH, () => startChallenge(i));
        }

        // Back button
        const backW = 140;
        drawButton(W / 2 - backW / 2, startY + Math.ceil(CHALLENGES.length / cols) * (cardH + gap) + 15, backW, 40, "Voltar", "#ec4899", STATE.hoverBtn === "back");
        registerButton("back", W / 2 - backW / 2, startY + Math.ceil(CHALLENGES.length / cols) * (cardH + gap) + 15, backW, 40, () => { STATE.screen = "menu"; });
    }

    // ── Free mode / Challenge play ──

    function clearDrawCanvas() {
        drawCtx.clearRect(0, 0, W, H);
        drawCtx.fillStyle = "#ffffff";
        const area = getDrawArea();
        drawCtx.fillRect(area.x, area.y, area.w, area.h);
    }

    function getDrawArea() {
        const toolbarH = 56;
        const paletteH = 60;
        const pad = 8;
        const areaX = pad;
        const areaY = toolbarH + pad;
        const areaW = W - pad * 2;
        const areaH = H - toolbarH - paletteH - pad * 3;
        return { x: areaX, y: areaY, w: areaW, h: areaH };
    }

    function startFreeMode() {
        STATE.screen = "free";
        STATE.symmetryMode = false;
        STATE.gridMode = false;
        STATE.tool = "brush";
        STATE.challengeIndex = -1;
        resetChallengeData();
        clearDrawCanvas();
    }

    function startChallenge(index) {
        const ch = CHALLENGES[index];
        STATE.screen = "challenge_play";
        STATE.challengeIndex = index;
        STATE.challengeTimer = ch.time;
        STATE.challengeMaxTime = ch.time;
        STATE.challengeStarted = true;
        STATE.tool = "brush";
        STATE.symmetryMode = !!ch.symmetry;
        STATE.gridMode = !!ch.grid;
        if (ch.grid) STATE.gridSize = ch.gridSize || 16;
        resetChallengeData();
        if (ch.allowedColors && ch.allowedColors.length > 0) {
            STATE.currentColor = ch.allowedColors[0];
        }
        clearDrawCanvas();
    }

    function resetChallengeData() {
        challengeData = {
            strokes: 0,
            shapes: 0,
            colorsUsed: new Set(),
            pixelsFilled: 0,
            mixesDone: [],
            monoColor: null,
            monoBrushSizes: new Set()
        };
    }

    function startColorMixer() {
        STATE.screen = "color_mixer";
        STATE.secondaryColor = "#3b82f6";
        STATE.currentColor = "#ef4444";
        STATE.mixedColor = null;
    }

    function mixColors(c1, c2) {
        // Parse hex
        const r1 = parseInt(c1.slice(1, 3), 16);
        const g1 = parseInt(c1.slice(3, 5), 16);
        const b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16);
        const g2 = parseInt(c2.slice(3, 5), 16);
        const b2 = parseInt(c2.slice(5, 7), 16);
        // Subtractive-ish mixing
        const r = Math.round((r1 + r2) / 2);
        const g = Math.round((g1 + g2) / 2);
        const b = Math.round((b1 + b2) / 2);
        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }

    function drawColorMixer() {
        ctx.fillStyle = "#0d0d18";
        ctx.fillRect(0, 0, W, H);
        drawParticles();
        updateParticles();

        const cx = W / 2;

        ctx.fillStyle = "#8b5cf6";
        ctx.font = `bold ${Math.min(28, W * 0.05)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Mixer de Cores", cx, 45);

        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "14px 'Segoe UI', sans-serif";
        ctx.fillText("Selecione duas cores para misturar e aprender teoria das cores!", cx, 72);

        // Color 1
        const swatchSize = 60;
        const swatchY = 110;
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        drawRoundRect(cx - 180, swatchY, 140, 130, 10);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "bold 14px 'Segoe UI', sans-serif";
        ctx.fillText("Cor 1", cx - 110, swatchY + 20);
        ctx.fillStyle = STATE.currentColor;
        ctx.beginPath();
        ctx.arc(cx - 110, swatchY + 70, swatchSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Plus sign
        ctx.fillStyle = "#fff";
        ctx.font = "bold 30px 'Segoe UI', sans-serif";
        ctx.fillText("+", cx, swatchY + 70);

        // Color 2
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        drawRoundRect(cx + 40, swatchY, 140, 130, 10);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "bold 14px 'Segoe UI', sans-serif";
        ctx.fillText("Cor 2", cx + 110, swatchY + 20);
        ctx.fillStyle = STATE.secondaryColor;
        ctx.beginPath();
        ctx.arc(cx + 110, swatchY + 70, swatchSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Mix button
        const mixBtnW = 160;
        drawButton(cx - mixBtnW / 2, swatchY + 150, mixBtnW, 44, "Misturar!", "#ec4899", STATE.hoverBtn === "mix_btn", 18);
        registerButton("mix_btn", cx - mixBtnW / 2, swatchY + 150, mixBtnW, 44, () => {
            STATE.mixedColor = mixColors(STATE.currentColor, STATE.secondaryColor);
            // Track for challenge
            if (STATE.challengeIndex === 1) {
                challengeData.mixesDone.push({ c1: STATE.currentColor, c2: STATE.secondaryColor, result: STATE.mixedColor });
            }
        });

        // Result
        if (STATE.mixedColor) {
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            drawRoundRect(cx - 80, swatchY + 215, 160, 100, 10);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.font = "bold 14px 'Segoe UI', sans-serif";
            ctx.fillText("Resultado:", cx, swatchY + 235);
            ctx.fillStyle = STATE.mixedColor;
            ctx.beginPath();
            ctx.arc(cx, swatchY + 275, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "12px 'Segoe UI', sans-serif";
            ctx.fillText(STATE.mixedColor.toUpperCase(), cx, swatchY + 310);
        }

        // Palette selection (for color1 and color2)
        const palY = swatchY + 340;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "13px 'Segoe UI', sans-serif";
        ctx.fillText("Clique em uma cor para Cor 1, segure Shift para Cor 2", cx, palY - 10);

        const palCols = Math.min(8, Math.floor((W - 40) / 38));
        const palRows = Math.ceil(STATE.palette.length / palCols);
        const palStartX = cx - (palCols * 36) / 2;
        for (let i = 0; i < STATE.palette.length; i++) {
            const col = i % palCols;
            const row = Math.floor(i / palCols);
            const px = palStartX + col * 36;
            const py = palY + row * 36;
            ctx.fillStyle = STATE.palette[i];
            drawRoundRect(px, py, 30, 30, 6);
            ctx.fill();
            if (STATE.palette[i] === STATE.currentColor) {
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 3;
                ctx.stroke();
            } else if (STATE.palette[i] === STATE.secondaryColor) {
                ctx.strokeStyle = "#fbbf24";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            registerButton(`mpal_${i}`, px, py, 30, 30, (e) => {
                if (e && e.shiftKey) {
                    STATE.secondaryColor = STATE.palette[i];
                } else {
                    STATE.currentColor = STATE.palette[i];
                }
                STATE.mixedColor = null;
            });
        }

        // Back
        const backW = 140;
        const backY = palY + palRows * 36 + 20;
        drawButton(cx - backW / 2, backY, backW, 40, "Voltar", "#ec4899", STATE.hoverBtn === "back_mixer");
        registerButton("back_mixer", cx - backW / 2, backY, backW, 40, () => { STATE.screen = "menu"; });
    }

    // ── Drawing screen (free + challenge) ──

    function drawDrawingScreen() {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, W, H);

        const area = getDrawArea();
        STATE.drawAreaTop = area.y;
        STATE.drawAreaLeft = area.x;
        STATE.drawAreaWidth = area.w;
        STATE.drawAreaHeight = area.h;

        // Draw canvas area background
        ctx.fillStyle = "#e5e5e5";
        drawRoundRect(area.x - 2, area.y - 2, area.w + 4, area.h + 4, 6);
        ctx.fill();

        // Draw the drawing canvas content
        ctx.drawImage(drawCanvas, 0, 0, drawCanvas.width, drawCanvas.height, 0, 0, W, H);

        // Grid overlay
        if (STATE.gridMode) {
            drawGrid(area);
        }

        // Symmetry line
        if (STATE.symmetryMode) {
            const midX = area.x + area.w / 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(236,72,153,0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(midX, area.y);
            ctx.lineTo(midX, area.y + area.h);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Shape preview while dragging
        if (STATE.shapeDragging && STATE.shapeStart && STATE.tool === "shape") {
            drawShapePreview();
        }

        // ── Toolbar ──
        drawToolbar(area);

        // ── Bottom palette ──
        drawPalette(area);

        // ── Challenge info ──
        if (STATE.screen === "challenge_play") {
            drawChallengeHUD();
        }
    }

    function drawGrid(area) {
        const gs = STATE.gridSize;
        const cellW = area.w / gs;
        const cellH = area.h / gs;
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gs; i++) {
            ctx.beginPath();
            ctx.moveTo(area.x + i * cellW, area.y);
            ctx.lineTo(area.x + i * cellW, area.y + area.h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(area.x, area.y + i * cellH);
            ctx.lineTo(area.x + area.w, area.y + i * cellH);
            ctx.stroke();
        }
    }

    function drawShapePreview() {
        const s = STATE.shapeStart;
        const lx = STATE.lastX;
        const ly = STATE.lastY;
        ctx.strokeStyle = STATE.currentColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        if (STATE.shapeType === "circle") {
            const rx = Math.abs(lx - s.x) / 2;
            const ry = Math.abs(ly - s.y) / 2;
            const cxs = (s.x + lx) / 2;
            const cys = (s.y + ly) / 2;
            ctx.beginPath();
            ctx.ellipse(cxs, cys, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
        } else if (STATE.shapeType === "square") {
            ctx.strokeRect(Math.min(s.x, lx), Math.min(s.y, ly), Math.abs(lx - s.x), Math.abs(ly - s.y));
        } else if (STATE.shapeType === "triangle") {
            const midX = (s.x + lx) / 2;
            ctx.beginPath();
            ctx.moveTo(midX, Math.min(s.y, ly));
            ctx.lineTo(lx, Math.max(s.y, ly));
            ctx.lineTo(s.x, Math.max(s.y, ly));
            ctx.closePath();
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    function drawToolbar(area) {
        const tbH = 54;
        ctx.fillStyle = "rgba(15,15,30,0.95)";
        ctx.fillRect(0, 0, W, tbH);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, tbH);
        ctx.lineTo(W, tbH);
        ctx.stroke();

        let tx = 10;
        const tBtnW = 44;
        const tBtnH = 36;
        const tBtnY = 9;

        // Back button
        const backHover = STATE.hoverBtn === "tb_back";
        drawRoundRect(tx, tBtnY, tBtnW, tBtnH, 6);
        ctx.fillStyle = backHover ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.05)";
        ctx.fill();
        ctx.fillStyle = backHover ? "#ec4899" : "rgba(255,255,255,0.6)";
        ctx.font = "18px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("←", tx + tBtnW / 2, tBtnY + tBtnH / 2);
        registerButton("tb_back", tx, tBtnY, tBtnW, tBtnH, () => {
            STATE.screen = "menu";
            STATE.challengeStarted = false;
        });
        tx += tBtnW + 8;

        // Tool buttons
        const tools = [
            { id: "brush", label: "🖌", name: "Pincel" },
            { id: "eraser", label: "◻", name: "Borracha" },
            { id: "fill", label: "🪣", name: "Balde" },
            { id: "shape", label: "⬡", name: "Formas" }
        ];
        for (const t of tools) {
            const active = STATE.tool === t.id;
            const hover = STATE.hoverBtn === `tool_${t.id}`;
            drawRoundRect(tx, tBtnY, tBtnW, tBtnH, 6);
            ctx.fillStyle = active ? "rgba(236,72,153,0.3)" : (hover ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)");
            ctx.fill();
            if (active) {
                ctx.strokeStyle = "#ec4899";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.fillStyle = active ? "#ec4899" : "#ccc";
            ctx.font = "18px 'Segoe UI', sans-serif";
            ctx.fillText(t.label, tx + tBtnW / 2, tBtnY + tBtnH / 2);
            registerButton(`tool_${t.id}`, tx, tBtnY, tBtnW, tBtnH, () => { STATE.tool = t.id; });
            tx += tBtnW + 4;
        }

        // Shape type selector (if shape tool active)
        if (STATE.tool === "shape") {
            tx += 4;
            const shapes = [
                { id: "circle", label: "○" },
                { id: "square", label: "□" },
                { id: "triangle", label: "△" }
            ];
            for (const sh of shapes) {
                const active = STATE.shapeType === sh.id;
                const hover = STATE.hoverBtn === `shape_${sh.id}`;
                drawRoundRect(tx, tBtnY, 34, tBtnH, 6);
                ctx.fillStyle = active ? "rgba(59,130,246,0.3)" : (hover ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)");
                ctx.fill();
                if (active) { ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1.5; ctx.stroke(); }
                ctx.fillStyle = active ? "#3b82f6" : "#aaa";
                ctx.font = "16px 'Segoe UI', sans-serif";
                ctx.fillText(sh.label, tx + 17, tBtnY + tBtnH / 2);
                registerButton(`shape_${sh.id}`, tx, tBtnY, 34, tBtnH, () => { STATE.shapeType = sh.id; });
                tx += 38;
            }
        }

        // Brush sizes
        tx += 12;
        for (let i = 0; i < STATE.brushSizes.length; i++) {
            const s = STATE.brushSizes[i];
            const active = STATE.brushSizeIndex === i;
            const hover = STATE.hoverBtn === `bs_${i}`;
            drawRoundRect(tx, tBtnY, 30, tBtnH, 6);
            ctx.fillStyle = active ? "rgba(34,197,94,0.2)" : (hover ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)");
            ctx.fill();
            if (active) { ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 1.5; ctx.stroke(); }
            ctx.fillStyle = active ? "#22c55e" : "#888";
            ctx.beginPath();
            ctx.arc(tx + 15, tBtnY + tBtnH / 2, 2 + i * 2, 0, Math.PI * 2);
            ctx.fill();
            registerButton(`bs_${i}`, tx, tBtnY, 30, tBtnH, () => {
                STATE.brushSizeIndex = i;
                STATE.brushSize = STATE.brushSizes[i];
            });
            tx += 34;
        }

        // Clear button
        const clearW = 60;
        const clearX = W - clearW - 10;
        drawButton(clearX, tBtnY, clearW, tBtnH, "Limpar", "#ef4444", STATE.hoverBtn === "tb_clear", 12);
        registerButton("tb_clear", clearX, tBtnY, clearW, tBtnH, () => {
            clearDrawCanvas();
            resetChallengeData();
        });

        // Title
        if (STATE.screen === "challenge_play" && STATE.challengeIndex >= 0) {
            const ch = CHALLENGES[STATE.challengeIndex];
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "12px 'Segoe UI', sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(ch.title, clearX - 12, tBtnY + tBtnH / 2);
        }
    }

    function drawPalette(area) {
        const palH = 58;
        const palY = H - palH;
        ctx.fillStyle = "rgba(15,15,30,0.95)";
        ctx.fillRect(0, palY, W, palH);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, palY);
        ctx.lineTo(W, palY);
        ctx.stroke();

        const ch = STATE.challengeIndex >= 0 ? CHALLENGES[STATE.challengeIndex] : null;
        const allowedColors = ch && ch.allowedColors ? ch.allowedColors : STATE.palette;

        const swSize = 28;
        const gap = 6;
        const totalW = allowedColors.length * (swSize + gap) - gap;
        let sx = Math.max(8, W / 2 - totalW / 2);

        // Current color preview
        ctx.fillStyle = STATE.currentColor;
        drawRoundRect(8, palY + 8, 40, 40, 8);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "9px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Atual", 28, palY + 55);

        sx = 60;
        for (let i = 0; i < allowedColors.length; i++) {
            const c = allowedColors[i];
            const px = sx + i * (swSize + gap);
            const py = palY + 14;
            ctx.fillStyle = c;
            drawRoundRect(px, py, swSize, swSize, 5);
            ctx.fill();
            if (c === STATE.currentColor) {
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }
            registerButton(`pal_${i}`, px, py, swSize, swSize, () => {
                STATE.currentColor = c;
                challengeData.colorsUsed.add(c);
                if (challengeData.monoColor === null) {
                    challengeData.monoColor = c;
                }
            });
        }
    }

    function drawChallengeHUD() {
        const ch = CHALLENGES[STATE.challengeIndex];

        // Timer
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        drawRoundRect(W - 110, 60, 100, 32, 6);
        ctx.fill();
        const timeLeft = Math.max(0, Math.ceil(STATE.challengeTimer));
        const timeColor = timeLeft < 15 ? "#ef4444" : timeLeft < 30 ? "#fbbf24" : "#22c55e";
        ctx.fillStyle = timeColor;
        ctx.font = "bold 16px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`⏱ ${timeLeft}s`, W - 60, 80);

        // Progress
        let progress = 0;
        let goalText = "";
        if (ch.goal === "strokes") {
            progress = Math.min(1, challengeData.strokes / ch.goalValue);
            goalText = `Tracos: ${challengeData.strokes}/${ch.goalValue}`;
        } else if (ch.goal === "shapes") {
            progress = Math.min(1, challengeData.shapes / ch.goalValue);
            goalText = `Formas: ${challengeData.shapes}/${ch.goalValue}`;
        } else if (ch.goal === "pixels") {
            progress = Math.min(1, challengeData.pixelsFilled / ch.goalValue);
            goalText = `Pixels: ${challengeData.pixelsFilled}/${ch.goalValue}`;
        } else if (ch.goal === "mix") {
            progress = Math.min(1, challengeData.mixesDone.length / ch.goalValue);
            goalText = `Misturas: ${challengeData.mixesDone.length}/${ch.goalValue}`;
        } else if (ch.goal === "pattern") {
            progress = Math.min(1, challengeData.shapes / ch.goalValue);
            goalText = `Elementos: ${challengeData.shapes}/${ch.goalValue}`;
        } else if (ch.goal === "composition") {
            progress = Math.min(1, challengeData.shapes / ch.goalValue);
            goalText = `Formas: ${challengeData.shapes}/${ch.goalValue}`;
        } else if (ch.goal === "mono") {
            progress = Math.min(1, challengeData.strokes / ch.goalValue);
            goalText = `Tracos: ${challengeData.strokes}/${ch.goalValue}`;
        }

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        drawRoundRect(W - 210, 60, 92, 32, 6);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "11px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(goalText, W - 164, 73);

        // Progress bar
        drawRoundRect(W - 205, 82, 82, 6, 3);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fill();
        drawRoundRect(W - 205, 82, Math.max(4, 82 * progress), 6, 3);
        ctx.fillStyle = progress >= 1 ? "#22c55e" : "#3b82f6";
        ctx.fill();

        // Challenge description
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        drawRoundRect(10, 60, Math.min(350, W - 230), 32, 6);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "11px 'Segoe UI', sans-serif";
        ctx.textAlign = "left";
        const descMax = Math.floor((Math.min(350, W - 230) - 16) / 6);
        const descText = ch.desc.length > descMax ? ch.desc.substring(0, descMax) + "..." : ch.desc;
        ctx.fillText(descText, 18, 80);
    }

    function finishChallenge() {
        const ch = CHALLENGES[STATE.challengeIndex];
        let stars = 0;
        let progress = 0;

        if (ch.goal === "strokes" || ch.goal === "mono") {
            progress = challengeData.strokes / ch.goalValue;
        } else if (ch.goal === "shapes" || ch.goal === "pattern" || ch.goal === "composition") {
            progress = challengeData.shapes / ch.goalValue;
        } else if (ch.goal === "pixels") {
            progress = challengeData.pixelsFilled / ch.goalValue;
        } else if (ch.goal === "mix") {
            progress = challengeData.mixesDone.length / ch.goalValue;
        }

        if (progress >= 1) stars = 3;
        else if (progress >= 0.6) stars = 2;
        else if (progress >= 0.3) stars = 1;

        // Bonus star logic for composition/pattern
        if (ch.goal === "composition" && challengeData.colorsUsed.size >= 4) {
            stars = Math.min(3, stars + 1);
        }

        STATE.challengeStars[STATE.challengeIndex] = Math.max(STATE.challengeStars[STATE.challengeIndex], stars);
        STATE.screen = "results";
        STATE.resultStars = stars;
        STATE.resultConcept = ch.concept;
        STATE.resultTitle = ch.title;
        STATE.challengeStarted = false;
    }

    function drawResults() {
        ctx.fillStyle = "#0d0d18";
        ctx.fillRect(0, 0, W, H);
        drawParticles();
        updateParticles();

        const cx = W / 2;
        const cy = H / 2;

        ctx.fillStyle = "#ec4899";
        ctx.font = `bold ${Math.min(32, W * 0.06)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Desafio Completo!", cx, cy - 100);

        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.min(24, W * 0.045)}px 'Segoe UI', sans-serif`;
        ctx.fillText(STATE.resultTitle, cx, cy - 60);

        // Stars
        const starSize = 36;
        for (let i = 0; i < 3; i++) {
            ctx.font = `${starSize}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = i < STATE.resultStars ? "#fbbf24" : "rgba(255,255,255,0.15)";
            ctx.fillText(i < STATE.resultStars ? "★" : "☆", cx - 50 + i * 50, cy - 10);
        }

        // Concept box
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        drawRoundRect(cx - 200, cy + 20, 400, 80, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(139,92,246,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#8b5cf6";
        ctx.font = "bold 13px 'Segoe UI', sans-serif";
        ctx.fillText("Conceito aprendido:", cx, cy + 42);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "13px 'Segoe UI', sans-serif";
        // Word wrap concept
        const words = STATE.resultConcept.split(" ");
        let line = "";
        let ly = cy + 62;
        for (const word of words) {
            const test = line + word + " ";
            if (ctx.measureText(test).width > 370) {
                ctx.fillText(line.trim(), cx, ly);
                line = word + " ";
                ly += 18;
            } else {
                line = test;
            }
        }
        ctx.fillText(line.trim(), cx, ly);

        // Buttons
        const btnW = 180;
        drawButton(cx - btnW - 10, cy + 130, btnW, 44, "Desafios", "#3b82f6", STATE.hoverBtn === "res_list", 16);
        registerButton("res_list", cx - btnW - 10, cy + 130, btnW, 44, () => showChallengeList());

        drawButton(cx + 10, cy + 130, btnW, 44, "Menu", "#ec4899", STATE.hoverBtn === "res_menu", 16);
        registerButton("res_menu", cx + 10, cy + 130, btnW, 44, () => { STATE.screen = "menu"; });
    }

    // ── Drawing logic ──

    function getCanvasPos(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left),
            y: (clientY - rect.top)
        };
    }

    function isInDrawArea(x, y) {
        const a = getDrawArea();
        return x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h;
    }

    function drawDot(x, y) {
        const size = STATE.tool === "eraser" ? STATE.brushSize * 2 : STATE.brushSize;
        drawCtx.fillStyle = STATE.tool === "eraser" ? "#ffffff" : STATE.currentColor;
        drawCtx.beginPath();
        drawCtx.arc(x, y, size / 2, 0, Math.PI * 2);
        drawCtx.fill();

        if (STATE.symmetryMode) {
            const a = getDrawArea();
            const mirrorX = a.x + a.w - (x - a.x);
            drawCtx.beginPath();
            drawCtx.arc(mirrorX, y, size / 2, 0, Math.PI * 2);
            drawCtx.fill();
        }
    }

    function drawLine(x1, y1, x2, y2) {
        const size = STATE.tool === "eraser" ? STATE.brushSize * 2 : STATE.brushSize;
        drawCtx.strokeStyle = STATE.tool === "eraser" ? "#ffffff" : STATE.currentColor;
        drawCtx.lineWidth = size;
        drawCtx.lineCap = "round";
        drawCtx.lineJoin = "round";
        drawCtx.beginPath();
        drawCtx.moveTo(x1, y1);
        drawCtx.lineTo(x2, y2);
        drawCtx.stroke();

        if (STATE.symmetryMode) {
            const a = getDrawArea();
            const mx1 = a.x + a.w - (x1 - a.x);
            const mx2 = a.x + a.w - (x2 - a.x);
            drawCtx.beginPath();
            drawCtx.moveTo(mx1, y1);
            drawCtx.lineTo(mx2, y2);
            drawCtx.stroke();
        }
    }

    function fillAtPoint(x, y) {
        const a = getDrawArea();
        const sx = Math.round((x - a.x) * dpr);
        const sy = Math.round((y - a.y) * dpr);
        const sw = Math.round(a.w * dpr);
        const sh = Math.round(a.h * dpr);
        if (sx < 0 || sy < 0 || sx >= sw || sy >= sh) return;

        const imageData = drawCtx.getImageData(a.x * dpr, a.y * dpr, sw, sh);
        const data = imageData.data;
        const targetIdx = (sy * sw + sx) * 4;
        const tr = data[targetIdx], tg = data[targetIdx + 1], tb = data[targetIdx + 2], ta = data[targetIdx + 3];

        // Parse fill color
        const fc = STATE.currentColor;
        const fr = parseInt(fc.slice(1, 3), 16);
        const fg = parseInt(fc.slice(3, 5), 16);
        const fb = parseInt(fc.slice(5, 7), 16);

        if (tr === fr && tg === fg && tb === fb) return;

        const stack = [[sx, sy]];
        const visited = new Set();
        visited.add(sy * sw + sx);
        let filled = 0;
        const maxFill = 200000;

        while (stack.length > 0 && filled < maxFill) {
            const [cx, cy] = stack.pop();
            const idx = (cy * sw + cx) * 4;
            if (Math.abs(data[idx] - tr) > 30 || Math.abs(data[idx + 1] - tg) > 30 || Math.abs(data[idx + 2] - tb) > 30) continue;

            data[idx] = fr;
            data[idx + 1] = fg;
            data[idx + 2] = fb;
            data[idx + 3] = 255;
            filled++;

            const neighbors = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < sw && ny >= 0 && ny < sh) {
                    const key = ny * sw + nx;
                    if (!visited.has(key)) {
                        visited.add(key);
                        stack.push([nx, ny]);
                    }
                }
            }
        }

        drawCtx.putImageData(imageData, a.x * dpr, a.y * dpr);
    }

    function fillGridCell(x, y) {
        const a = getDrawArea();
        const gs = STATE.gridSize;
        const cellW = a.w / gs;
        const cellH = a.h / gs;
        const col = Math.floor((x - a.x) / cellW);
        const row = Math.floor((y - a.y) / cellH);
        if (col < 0 || col >= gs || row < 0 || row >= gs) return;

        drawCtx.fillStyle = STATE.tool === "eraser" ? "#ffffff" : STATE.currentColor;
        drawCtx.fillRect(a.x + col * cellW, a.y + row * cellH, cellW, cellH);
        challengeData.pixelsFilled++;
    }

    function placeShape(x1, y1, x2, y2) {
        const color = STATE.currentColor;
        drawCtx.fillStyle = color;
        drawCtx.strokeStyle = color;
        drawCtx.lineWidth = 2;

        if (STATE.shapeType === "circle") {
            const rx = Math.abs(x2 - x1) / 2;
            const ry = Math.abs(y2 - y1) / 2;
            const cxs = (x1 + x2) / 2;
            const cys = (y1 + y2) / 2;
            drawCtx.beginPath();
            drawCtx.ellipse(cxs, cys, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
            drawCtx.fill();
            drawCtx.stroke();
        } else if (STATE.shapeType === "square") {
            drawCtx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
            drawCtx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
        } else if (STATE.shapeType === "triangle") {
            const midX = (x1 + x2) / 2;
            drawCtx.beginPath();
            drawCtx.moveTo(midX, Math.min(y1, y2));
            drawCtx.lineTo(x2, Math.max(y1, y2));
            drawCtx.lineTo(x1, Math.max(y1, y2));
            drawCtx.closePath();
            drawCtx.fill();
            drawCtx.stroke();
        }

        challengeData.shapes++;
        challengeData.colorsUsed.add(color);

        if (STATE.symmetryMode) {
            const a = getDrawArea();
            const mx1 = a.x + a.w - (x1 - a.x);
            const mx2 = a.x + a.w - (x2 - a.x);
            drawCtx.fillStyle = color;
            if (STATE.shapeType === "circle") {
                const rx = Math.abs(mx2 - mx1) / 2;
                const ry = Math.abs(y2 - y1) / 2;
                drawCtx.beginPath();
                drawCtx.ellipse((mx1 + mx2) / 2, (y1 + y2) / 2, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
                drawCtx.fill();
            } else if (STATE.shapeType === "square") {
                drawCtx.fillRect(Math.min(mx1, mx2), Math.min(y1, y2), Math.abs(mx2 - mx1), Math.abs(y2 - y1));
            } else if (STATE.shapeType === "triangle") {
                const midX = (mx1 + mx2) / 2;
                drawCtx.beginPath();
                drawCtx.moveTo(midX, Math.min(y1, y2));
                drawCtx.lineTo(mx2, Math.max(y1, y2));
                drawCtx.lineTo(mx1, Math.max(y1, y2));
                drawCtx.closePath();
                drawCtx.fill();
            }
        }
    }

    // ── Input handling ──

    function handlePointerDown(x, y, e) {
        // Check buttons first
        for (const btn of buttons) {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                btn.action(e);
                return;
            }
        }

        // Drawing
        if ((STATE.screen === "free" || STATE.screen === "challenge_play") && isInDrawArea(x, y)) {
            STATE.drawing = true;
            STATE.lastX = x;
            STATE.lastY = y;

            if (STATE.tool === "fill") {
                fillAtPoint(x, y);
                challengeData.strokes++;
                challengeData.colorsUsed.add(STATE.currentColor);
                STATE.drawing = false;
            } else if (STATE.tool === "shape") {
                STATE.shapeStart = { x, y };
                STATE.shapeDragging = true;
            } else if (STATE.gridMode) {
                fillGridCell(x, y);
            } else {
                drawDot(x, y);
            }
        }
    }

    function handlePointerMove(x, y) {
        // Hover detection
        STATE.hoverBtn = null;
        for (const btn of buttons) {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                STATE.hoverBtn = btn.id;
                break;
            }
        }

        if (!STATE.drawing) return;

        if ((STATE.screen === "free" || STATE.screen === "challenge_play") && isInDrawArea(x, y)) {
            if (STATE.tool === "shape" && STATE.shapeDragging) {
                STATE.lastX = x;
                STATE.lastY = y;
            } else if (STATE.gridMode) {
                fillGridCell(x, y);
            } else if (STATE.tool === "brush" || STATE.tool === "eraser") {
                drawLine(STATE.lastX, STATE.lastY, x, y);
                STATE.lastX = x;
                STATE.lastY = y;
            }
        }
    }

    function handlePointerUp(x, y) {
        if (STATE.drawing) {
            if (STATE.tool === "shape" && STATE.shapeDragging && STATE.shapeStart) {
                placeShape(STATE.shapeStart.x, STATE.shapeStart.y, x, y);
                STATE.shapeStart = null;
                STATE.shapeDragging = false;
            } else if (STATE.tool === "brush" || STATE.tool === "eraser") {
                challengeData.strokes++;
                challengeData.colorsUsed.add(STATE.currentColor);
                if (STATE.challengeIndex === 9) {
                    challengeData.monoBrushSizes.add(STATE.brushSize);
                }
            }
            STATE.drawing = false;
        }
    }

    // Mouse events
    canvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const pos = getCanvasPos(e.clientX, e.clientY);
        handlePointerDown(pos.x, pos.y, e);
    });

    canvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        const pos = getCanvasPos(e.clientX, e.clientY);
        handlePointerMove(pos.x, pos.y);
    });

    canvas.addEventListener("mouseup", (e) => {
        e.preventDefault();
        const pos = getCanvasPos(e.clientX, e.clientY);
        handlePointerUp(pos.x, pos.y);
    });

    // Touch events
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const pos = getCanvasPos(t.clientX, t.clientY);
        handlePointerDown(pos.x, pos.y, {});
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const pos = getCanvasPos(t.clientX, t.clientY);
        handlePointerMove(pos.x, pos.y);
    }, { passive: false });

    canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        const pos = getCanvasPos(t.clientX, t.clientY);
        handlePointerUp(pos.x, pos.y);
    }, { passive: false });

    window.addEventListener("resize", resize);

    // ── Main loop ──

    let lastTime = 0;

    function update(dt) {
        STATE.animTime += dt * 60;

        // Challenge timer
        if (STATE.screen === "challenge_play" && STATE.challengeStarted) {
            STATE.challengeTimer -= dt;
            if (STATE.challengeTimer <= 0) {
                STATE.challengeTimer = 0;
                finishChallenge();
            }
        }
    }

    function render() {
        clearButtons();

        switch (STATE.screen) {
            case "menu":
                drawMenu();
                break;
            case "challenge_list":
                drawChallengeList();
                break;
            case "free":
            case "challenge_play":
                drawDrawingScreen();
                break;
            case "color_mixer":
                drawColorMixer();
                break;
            case "results":
                drawResults();
                break;
        }
    }

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        update(dt);
        render();

        requestAnimationFrame(gameLoop);
    }

    // ── Init ──
    function init() {
        resize();
        initParticles();

        // Remove loading screen
        const loading = document.getElementById("loading");
        if (loading) {
            setTimeout(() => {
                loading.style.transition = "opacity 0.5s";
                loading.style.opacity = "0";
                setTimeout(() => loading.remove(), 500);
            }, 400);
        }

        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    init();
})();
