// ============================================================
// Lógica de Programação - Jogo Educativo
// Introdução a conceitos de programação (8º-9º ano)
// ============================================================

(function () {
    'use strict';

    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Audio Engine ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playTone(freq, dur, type, vol) {
        if (!audioCtx) return;
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
    }

    function sfxClick() { playTone(800, 0.08, 'square', 0.1); }
    function sfxPlace() { playTone(500, 0.12, 'sine', 0.12); }
    function sfxStep() { playTone(300, 0.06, 'triangle', 0.1); }
    function sfxWall() { playTone(100, 0.25, 'sawtooth', 0.15); }
    function sfxGoal() {
        playTone(523, 0.15, 'sine', 0.2);
        setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 100);
        setTimeout(() => playTone(784, 0.3, 'sine', 0.2), 200);
    }
    function sfxFail() {
        playTone(200, 0.3, 'sawtooth', 0.12);
        setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.12), 150);
    }
    function sfxStar() {
        playTone(880, 0.1, 'sine', 0.15);
        setTimeout(() => playTone(1100, 0.15, 'sine', 0.15), 80);
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
                decay: 0.015 + Math.random() * 0.025,
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
        for (const p of particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // --- Directions ---
    const DIR = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
    const DX = [0, 1, 0, -1];
    const DY = [-1, 0, 1, 0];
    const DIR_NAMES = ['Cima', 'Direita', 'Baixo', 'Esquerda'];
    const DIR_ARROWS = ['\u2191', '\u2192', '\u2193', '\u2190'];

    // --- Command Types ---
    const CMD = {
        FORWARD: 'forward',
        LEFT: 'left',
        RIGHT: 'right',
        REPEAT: 'repeat',
        IF_WALL: 'if_wall'
    };

    const CMD_INFO = {
        [CMD.FORWARD]: { label: 'Avançar', icon: '\u25B6', color: '#22c55e', desc: 'Move o robô 1 casa para frente' },
        [CMD.LEFT]: { label: 'Girar Esq.', icon: '\u21BA', color: '#3b82f6', desc: 'Gira o robô 90° à esquerda' },
        [CMD.RIGHT]: { label: 'Girar Dir.', icon: '\u21BB', color: '#8b5cf6', desc: 'Gira o robô 90° à direita' },
        [CMD.REPEAT]: { label: 'Repetir', icon: '\u21BB', color: '#f59e0b', desc: 'Repete comandos N vezes' },
        [CMD.IF_WALL]: { label: 'Se Parede', icon: '?', color: '#ef4444', desc: 'Executa se houver parede à frente' }
    };

    // --- Level Definitions ---
    // Grid: 0=empty, 1=wall, 2=start, 3=goal
    const LEVELS = [
        // Level 1: Ande para frente 3 casas
        {
            name: 'Primeiro Passo',
            hint: 'Use "Avançar" para mover o robô até a estrela!',
            cols: 5, rows: 5,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 2, 0, 0, 3,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0
            ],
            available: [CMD.FORWARD],
            optimal: 3
        },
        // Level 2: Gire e ande
        {
            name: 'Curva Simples',
            hint: 'Avance, gire à direita e avance mais!',
            cols: 5, rows: 5,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0,
                0, 2, 0, 3, 0,
                0, 0, 0, 1, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT],
            optimal: 5
        },
        // Level 3: Caminho em L
        {
            name: 'Caminho em L',
            hint: 'Combine avanços e giros para contornar as paredes.',
            cols: 6, rows: 5,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 1, 0,
                0, 1, 1, 0, 1, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 3, 0, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT],
            optimal: 7
        },
        // Level 4: Introdução ao loop
        {
            name: 'Repetição',
            hint: 'Use "Repetir" para executar comandos várias vezes!',
            cols: 7, rows: 5,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 0, 0, 3,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0
            ],
            available: [CMD.FORWARD, CMD.REPEAT],
            optimal: 2
        },
        // Level 5: Loop com curva
        {
            name: 'Quadrado',
            hint: 'Repita um padrão de avanço + giro para fazer um quadrado!',
            cols: 6, rows: 6,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 3, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT, CMD.REPEAT],
            optimal: 4
        },
        // Level 6: Loop com obstáculos
        {
            name: 'Corredor',
            hint: 'Avance pelo corredor usando loops!',
            cols: 8, rows: 5,
            startDir: DIR.RIGHT,
            grid: [
                0, 1, 1, 1, 1, 1, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 0, 0, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 1, 1, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT, CMD.REPEAT],
            optimal: 2
        },
        // Level 7: Introdução condicional
        {
            name: 'Decisões',
            hint: 'Use "Se Parede" para desviar quando houver parede à frente!',
            cols: 6, rows: 6,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0, 0,
                0, 2, 0, 1, 0, 0,
                0, 0, 0, 1, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 3,
                0, 0, 0, 0, 0, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT, CMD.IF_WALL],
            optimal: 8
        },
        // Level 8: Condicional com loop
        {
            name: 'Labirinto',
            hint: 'Combine repetição e condicionais para navegar o labirinto!',
            cols: 7, rows: 7,
            startDir: DIR.DOWN,
            grid: [
                0, 0, 0, 0, 0, 0, 0,
                0, 2, 1, 0, 1, 0, 0,
                0, 0, 1, 0, 1, 0, 0,
                0, 0, 0, 0, 1, 0, 0,
                0, 1, 1, 0, 0, 0, 0,
                0, 0, 0, 0, 1, 1, 0,
                0, 0, 0, 0, 0, 3, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT, CMD.REPEAT, CMD.IF_WALL],
            optimal: 6
        },
        // Level 9: Caminho complexo
        {
            name: 'Espiral',
            hint: 'Programe o robô para percorrer uma espiral!',
            cols: 7, rows: 7,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 0, 0,
                0, 0, 0, 0, 1, 0, 0,
                0, 0, 1, 0, 1, 0, 0,
                0, 0, 1, 0, 0, 0, 0,
                0, 0, 1, 1, 1, 3, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT, CMD.REPEAT, CMD.IF_WALL],
            optimal: 7
        },
        // Level 10: Desafio final
        {
            name: 'Desafio Final',
            hint: 'Use tudo que aprendeu para completar este labirinto!',
            cols: 8, rows: 8,
            startDir: DIR.RIGHT,
            grid: [
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 2, 0, 1, 0, 0, 1, 0,
                0, 1, 0, 1, 0, 0, 1, 0,
                0, 1, 0, 0, 0, 1, 0, 0,
                0, 0, 0, 1, 0, 1, 0, 0,
                0, 1, 0, 1, 0, 0, 0, 0,
                0, 1, 0, 0, 0, 1, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 0
            ],
            available: [CMD.FORWARD, CMD.LEFT, CMD.RIGHT, CMD.REPEAT, CMD.IF_WALL],
            optimal: 8
        }
    ];

    // --- Game State ---
    let state = 'menu'; // menu, playing, executing, success, fail
    let currentLevel = 0;
    let levelScores = new Array(LEVELS.length).fill(0);
    let program = []; // array of {type, children?, repeatCount?}
    let robot = { x: 0, y: 0, dir: 0, animX: 0, animY: 0, animDir: 0 };
    let executionSteps = [];
    let execIndex = 0;
    let execTimer = 0;
    let execSpeed = 350; // ms per step
    let selectedRepeatCount = 3;
    let scrollOffset = 0;
    let maxScroll = 0;
    let dragStartY = 0;
    let dragging = false;
    let tooltip = null;
    let tooltipTimer = 0;
    let hoveredBtn = null;
    let starPulse = 0;
    let robotBob = 0;
    let gridShake = 0;
    let successTimer = 0;
    let failMessage = '';
    let editingRepeat = null; // index of repeat block being configured
    let repeatSubMode = false; // are we adding to a repeat block?
    let activeRepeatIdx = -1; // which repeat block to add to
    let ifSubMode = false;
    let activeIfIdx = -1;

    // --- Layout ---
    let gridArea = { x: 0, y: 0, w: 0, h: 0, cellSize: 0 };
    let paletteArea = { x: 0, y: 0, w: 0, h: 0 };
    let programArea = { x: 0, y: 0, w: 0, h: 0 };
    let buttons = [];
    let paletteButtons = [];
    let programBlocks = [];

    function computeLayout() {
        const isPortrait = H > W;
        buttons = [];
        paletteButtons = [];

        if (isPortrait) {
            // Portrait: grid top, palette+program bottom
            const gridH = H * 0.45;
            const level = LEVELS[currentLevel];
            const cols = level ? level.cols : 5;
            const rows = level ? level.rows : 5;
            const cellSize = Math.min((W - 40) / cols, (gridH - 60) / rows);
            const gw = cellSize * cols;
            const gh = cellSize * rows;
            gridArea = { x: (W - gw) / 2, y: 40 + (gridH - 60 - gh) / 2, w: gw, h: gh, cellSize };
            paletteArea = { x: 10, y: gridH + 5, w: W - 20, h: 55 };
            programArea = { x: 10, y: gridH + 65, w: W - 20, h: H - gridH - 70 };
        } else {
            // Landscape: grid left, palette+program right
            const gridW = W * 0.5;
            const level = LEVELS[currentLevel];
            const cols = level ? level.cols : 5;
            const rows = level ? level.rows : 5;
            const cellSize = Math.min((gridW - 40) / cols, (H - 80) / rows);
            const gw = cellSize * cols;
            const gh = cellSize * rows;
            gridArea = { x: 20 + (gridW - 40 - gw) / 2, y: 50 + (H - 80 - gh) / 2, w: gw, h: gh, cellSize };
            paletteArea = { x: gridW + 10, y: 50, w: W - gridW - 20, h: 55 };
            programArea = { x: gridW + 10, y: 110, w: W - gridW - 20, h: H - 120 };
        }
    }

    // --- Level Helpers ---
    function getLevelCell(level, col, row) {
        return level.grid[row * level.cols + col];
    }

    function findStart(level) {
        for (let r = 0; r < level.rows; r++) {
            for (let c = 0; c < level.cols; c++) {
                if (getLevelCell(level, c, r) === 2) return { x: c, y: r };
            }
        }
        return { x: 0, y: 0 };
    }

    function findGoal(level) {
        for (let r = 0; r < level.rows; r++) {
            for (let c = 0; c < level.cols; c++) {
                if (getLevelCell(level, c, r) === 3) return { x: c, y: r };
            }
        }
        return { x: 0, y: 0 };
    }

    function isWall(level, x, y) {
        if (x < 0 || x >= level.cols || y < 0 || y >= level.rows) return true;
        return getLevelCell(level, x, y) === 1;
    }

    // --- Program Flattening (expand repeats/ifs to steps) ---
    function flattenProgram(prog, level, startX, startY, startDir) {
        const steps = []; // each step: {type, x, y, dir} after applying
        let cx = startX, cy = startY, cd = startDir;
        const MAX_STEPS = 200;

        function exec(commands) {
            for (const cmd of commands) {
                if (steps.length > MAX_STEPS) return;
                if (cmd.type === CMD.FORWARD) {
                    const nx = cx + DX[cd];
                    const ny = cy + DY[cd];
                    if (isWall(level, nx, ny)) {
                        steps.push({ type: 'wall', x: cx, y: cy, dir: cd });
                        return; // hit a wall, stop
                    }
                    cx = nx;
                    cy = ny;
                    steps.push({ type: 'move', x: cx, y: cy, dir: cd });
                } else if (cmd.type === CMD.LEFT) {
                    cd = (cd + 3) % 4;
                    steps.push({ type: 'turn', x: cx, y: cy, dir: cd });
                } else if (cmd.type === CMD.RIGHT) {
                    cd = (cd + 1) % 4;
                    steps.push({ type: 'turn', x: cx, y: cy, dir: cd });
                } else if (cmd.type === CMD.REPEAT) {
                    const count = cmd.repeatCount || 2;
                    const children = cmd.children || [];
                    for (let i = 0; i < count; i++) {
                        exec(children);
                        if (steps.length > MAX_STEPS) return;
                        if (steps.length > 0 && steps[steps.length - 1].type === 'wall') return;
                    }
                } else if (cmd.type === CMD.IF_WALL) {
                    const nx = cx + DX[cd];
                    const ny = cy + DY[cd];
                    if (isWall(level, nx, ny)) {
                        const children = cmd.children || [];
                        exec(children);
                    }
                }
            }
        }

        exec(prog);
        return steps;
    }

    // --- Start Level ---
    function startLevel(idx) {
        currentLevel = idx;
        const level = LEVELS[idx];
        const start = findStart(level);
        robot = {
            x: start.x, y: start.y, dir: level.startDir,
            animX: start.x, animY: start.y, animDir: level.startDir
        };
        program = [];
        executionSteps = [];
        execIndex = 0;
        scrollOffset = 0;
        repeatSubMode = false;
        activeRepeatIdx = -1;
        ifSubMode = false;
        activeIfIdx = -1;
        state = 'playing';
        failMessage = '';
        computeLayout();
    }

    // --- Count Commands (for scoring) ---
    function countCommands(prog) {
        let c = 0;
        for (const cmd of prog) {
            c++;
            if (cmd.children) c += countCommands(cmd.children);
        }
        return c;
    }

    // --- Execute Program ---
    function executeProgram() {
        ensureAudio();
        const level = LEVELS[currentLevel];
        const start = findStart(level);
        executionSteps = flattenProgram(program, level, start.x, start.y, level.startDir);

        if (executionSteps.length === 0) {
            failMessage = 'Programa vazio! Adicione comandos.';
            state = 'fail';
            sfxFail();
            return;
        }

        robot.x = start.x;
        robot.y = start.y;
        robot.dir = level.startDir;
        robot.animX = start.x;
        robot.animY = start.y;
        robot.animDir = level.startDir;
        execIndex = 0;
        execTimer = 0;
        state = 'executing';
    }

    // --- Drawing Helpers ---
    function roundRect(x, y, w, h, r) {
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

    function drawStar(cx, cy, r, points, innerR) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const rad = i % 2 === 0 ? r : innerR;
            const px = cx + Math.cos(angle) * rad;
            const py = cy + Math.sin(angle) * rad;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    function drawRobot(cx, cy, size, dir, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha || 1;
        ctx.translate(cx, cy);
        ctx.rotate((dir * Math.PI) / 2);

        // Body
        const s = size * 0.35;
        roundRect(-s, -s, s * 2, s * 2, s * 0.3);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
        ctx.strokeStyle = '#0e7490';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-s * 0.35, -s * 0.2, s * 0.2, 0, Math.PI * 2);
        ctx.arc(s * 0.35, -s * 0.2, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0d0d18';
        ctx.beginPath();
        ctx.arc(-s * 0.35, -s * 0.2, s * 0.1, 0, Math.PI * 2);
        ctx.arc(s * 0.35, -s * 0.2, s * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Direction arrow
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.85);
        ctx.lineTo(-s * 0.25, -s * 0.55);
        ctx.lineTo(s * 0.25, -s * 0.55);
        ctx.closePath();
        ctx.fill();

        // Antenna
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(0, -s * 1.3);
        ctx.stroke();
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(0, -s * 1.35, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // --- Draw Grid ---
    function drawGrid() {
        const level = LEVELS[currentLevel];
        const { x: ox, y: oy, cellSize: cs } = gridArea;
        const shakeX = (Math.random() - 0.5) * gridShake * 2;
        const shakeY = (Math.random() - 0.5) * gridShake * 2;

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // Background
        ctx.fillStyle = '#1a1a2e';
        roundRect(ox - 5, oy - 5, gridArea.w + 10, gridArea.h + 10, 8);
        ctx.fill();

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let c = 0; c <= level.cols; c++) {
            ctx.beginPath();
            ctx.moveTo(ox + c * cs, oy);
            ctx.lineTo(ox + c * cs, oy + level.rows * cs);
            ctx.stroke();
        }
        for (let r = 0; r <= level.rows; r++) {
            ctx.beginPath();
            ctx.moveTo(ox, oy + r * cs);
            ctx.lineTo(ox + level.cols * cs, oy + r * cs);
            ctx.stroke();
        }

        // Cells
        for (let r = 0; r < level.rows; r++) {
            for (let c = 0; c < level.cols; c++) {
                const cell = getLevelCell(level, c, r);
                const cx = ox + c * cs;
                const cy = oy + r * cs;

                if (cell === 1) {
                    // Wall
                    ctx.fillStyle = '#3f3f5c';
                    roundRect(cx + 2, cy + 2, cs - 4, cs - 4, 4);
                    ctx.fill();
                    ctx.strokeStyle = '#5a5a7e';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    // Brick pattern
                    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                    ctx.beginPath();
                    ctx.moveTo(cx + cs * 0.5, cy + 4);
                    ctx.lineTo(cx + cs * 0.5, cy + cs * 0.5);
                    ctx.moveTo(cx + 4, cy + cs * 0.5);
                    ctx.lineTo(cx + cs - 4, cy + cs * 0.5);
                    ctx.moveTo(cx + cs * 0.3, cy + cs * 0.5);
                    ctx.lineTo(cx + cs * 0.3, cy + cs - 4);
                    ctx.moveTo(cx + cs * 0.7, cy + cs * 0.5);
                    ctx.lineTo(cx + cs * 0.7, cy + cs - 4);
                    ctx.stroke();
                } else if (cell === 2) {
                    // Start
                    ctx.fillStyle = 'rgba(6,182,212,0.15)';
                    roundRect(cx + 2, cy + 2, cs - 4, cs - 4, 4);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(6,182,212,0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else if (cell === 3) {
                    // Goal - star
                    ctx.fillStyle = 'rgba(250,204,21,0.1)';
                    roundRect(cx + 2, cy + 2, cs - 4, cs - 4, 4);
                    ctx.fill();

                    const pulse = Math.sin(starPulse) * 0.15 + 0.85;
                    const starCx = cx + cs / 2;
                    const starCy = cy + cs / 2;
                    const starR = cs * 0.3 * pulse;

                    // Glow
                    const grad = ctx.createRadialGradient(starCx, starCy, 0, starCx, starCy, starR * 2);
                    grad.addColorStop(0, 'rgba(250,204,21,0.3)');
                    grad.addColorStop(1, 'rgba(250,204,21,0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(starCx, starCy, starR * 2, 0, Math.PI * 2);
                    ctx.fill();

                    drawStar(starCx, starCy, starR, 5, starR * 0.4);
                    ctx.fillStyle = '#facc15';
                    ctx.fill();
                    ctx.strokeStyle = '#ca8a04';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else {
                    // Empty floor
                    ctx.fillStyle = 'rgba(255,255,255,0.02)';
                    ctx.fillRect(cx + 1, cy + 1, cs - 2, cs - 2);
                }
            }
        }

        // Robot trail during execution
        if (state === 'executing' && execIndex > 0) {
            for (let i = 0; i < execIndex && i < executionSteps.length; i++) {
                const step = executionSteps[i];
                if (step.type === 'move') {
                    const tx = ox + step.x * cs + cs / 2;
                    const ty = oy + step.y * cs + cs / 2;
                    ctx.fillStyle = 'rgba(6,182,212,0.15)';
                    ctx.beginPath();
                    ctx.arc(tx, ty, cs * 0.15, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Robot
        const bob = Math.sin(robotBob) * 2;
        const rx = ox + robot.animX * cs + cs / 2;
        const ry = oy + robot.animY * cs + cs / 2 + bob;
        drawRobot(rx, ry, cs, robot.animDir, 1);

        ctx.restore();
    }

    // --- Draw Palette ---
    function drawPalette() {
        const level = LEVELS[currentLevel];
        const { x: px, y: py, w: pw, h: ph } = paletteArea;

        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        roundRect(px, py, pw, ph, 6);
        ctx.fill();

        paletteButtons = [];
        const available = level.available;
        const btnW = Math.min(110, (pw - 10) / available.length - 5);
        const btnH = 40;
        const startX = px + (pw - (btnW + 5) * available.length + 5) / 2;

        for (let i = 0; i < available.length; i++) {
            const cmd = available[i];
            const info = CMD_INFO[cmd];
            const bx = startX + i * (btnW + 5);
            const by = py + (ph - btnH) / 2;

            const isHovered = hoveredBtn && hoveredBtn.type === 'palette' && hoveredBtn.index === i;
            const scale = isHovered ? 1.05 : 1;

            ctx.save();
            ctx.translate(bx + btnW / 2, by + btnH / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(bx + btnW / 2), -(by + btnH / 2));

            roundRect(bx, by, btnW, btnH, 6);
            ctx.fillStyle = info.color;
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(info.icon + ' ' + info.label, bx + btnW / 2, by + btnH / 2);

            ctx.restore();

            paletteButtons.push({ x: bx, y: by, w: btnW, h: btnH, cmd, index: i });
        }
    }

    // --- Draw Program Area ---
    function drawProgramArea() {
        const { x: px, y: py, w: pw, h: ph } = programArea;

        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        roundRect(px, py, pw, ph, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Programa:', px + 8, py + 5);

        // Sub-mode indicator
        if (repeatSubMode && activeRepeatIdx >= 0) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 11px Segoe UI, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('Adicionando ao Repetir #' + (activeRepeatIdx + 1) + ' (toque no bloco para sair)', px + pw - 8, py + 5);
        }
        if (ifSubMode && activeIfIdx >= 0) {
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 11px Segoe UI, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('Adicionando ao Se Parede #' + (activeIfIdx + 1) + ' (toque no bloco para sair)', px + pw - 8, py + 5);
        }

        // Draw blocks
        programBlocks = [];
        const blockH = 36;
        const blockGap = 4;
        const startY = py + 22;
        const indent = 20;

        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py + 20, pw, ph - 20);
        ctx.clip();

        let yPos = startY - scrollOffset;

        function drawBlock(cmd, index, depth, parentIdx) {
            const info = CMD_INFO[cmd.type];
            const bx = px + 8 + depth * indent;
            const bw = pw - 16 - depth * indent;
            const by = yPos;

            // Highlight executing block
            let executing = false;
            if (state === 'executing' && index === execHighlight) executing = true;

            roundRect(bx, by, bw, blockH, 5);
            ctx.fillStyle = info.color;
            ctx.globalAlpha = executing ? 1 : 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
            if (executing) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Segoe UI, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            let label = info.icon + ' ' + info.label;
            if (cmd.type === CMD.REPEAT) label += ' (' + (cmd.repeatCount || 2) + 'x)';

            ctx.fillText(label, bx + 8, by + blockH / 2);

            // Delete button
            const delSize = 18;
            const delX = bx + bw - delSize - 5;
            const delY = by + (blockH - delSize) / 2;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(delX + delSize / 2, delY + delSize / 2, delSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('\u00D7', delX + delSize / 2, delY + delSize / 2);

            programBlocks.push({
                x: bx, y: by, w: bw, h: blockH,
                index, depth, parentIdx,
                delX, delY, delW: delSize, delH: delSize,
                cmd
            });

            yPos += blockH + blockGap;

            // Draw children
            if (cmd.children) {
                for (let ci = 0; ci < cmd.children.length; ci++) {
                    drawBlock(cmd.children[ci], ci, depth + 1, index);
                }
                if (cmd.children.length === 0) {
                    // Empty placeholder
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.setLineDash([4, 4]);
                    roundRect(bx + indent, yPos, bw - indent, blockH * 0.7, 4);
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.font = '11px Segoe UI, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('(vazio - adicione comandos)', bx + indent + (bw - indent) / 2, yPos + blockH * 0.35);
                    yPos += blockH * 0.7 + blockGap;
                }
            }
        }

        let execHighlight = -1;

        for (let i = 0; i < program.length; i++) {
            drawBlock(program[i], i, 0, -1);
        }

        if (program.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.font = '13px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Toque nos blocos acima para programar', px + pw / 2, py + ph / 2);
        }

        maxScroll = Math.max(0, yPos + scrollOffset - (py + ph));

        ctx.restore();

        // Action buttons at bottom
        const btnW = Math.min(130, (pw - 30) / 3);
        const btnH = 36;
        const btnY = py + ph - btnH - 5;

        // Executar button
        const execBtnX = px + pw / 2 - btnW - 5;
        roundRect(execBtnX, btnY, btnW, btnH, 6);
        ctx.fillStyle = state === 'executing' ? '#666' : '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u25B6 Executar', execBtnX + btnW / 2, btnY + btnH / 2);
        buttons.push({ x: execBtnX, y: btnY, w: btnW, h: btnH, action: 'execute' });

        // Limpar button
        const clearBtnX = px + pw / 2 + 5;
        roundRect(clearBtnX, btnY, btnW, btnH, 6);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText('\u2717 Limpar', clearBtnX + btnW / 2, btnY + btnH / 2);
        buttons.push({ x: clearBtnX, y: btnY, w: btnW, h: btnH, action: 'clear' });
    }

    // --- Draw HUD ---
    function drawHUD() {
        const level = LEVELS[currentLevel];

        // Level title
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Nível ' + (currentLevel + 1) + ': ' + level.name, 15, 12);

        // Hint
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.fillText(level.hint, 15, 32);

        // Menu button
        const menuBtnW = 70;
        const menuBtnH = 28;
        const menuBtnX = W - menuBtnW - 10;
        const menuBtnY = 8;
        roundRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Menu', menuBtnX + menuBtnW / 2, menuBtnY + menuBtnH / 2);
        buttons.push({ x: menuBtnX, y: menuBtnY, w: menuBtnW, h: menuBtnH, action: 'menu' });

        // Stars for current level
        if (levelScores[currentLevel] > 0) {
            const stars = levelScores[currentLevel];
            ctx.font = '16px Segoe UI, sans-serif';
            ctx.textAlign = 'right';
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = i < stars ? '#facc15' : 'rgba(255,255,255,0.15)';
                ctx.fillText('\u2605', W - menuBtnW - 20 - i * 22, 22);
            }
        }
    }

    // --- Draw Menu ---
    function drawMenu() {
        // Background
        ctx.fillStyle = '#0d0d18';
        ctx.fillRect(0, 0, W, H);

        // Stars background
        for (let i = 0; i < 50; i++) {
            const x = (Math.sin(i * 127.1 + starPulse * 0.1) * 0.5 + 0.5) * W;
            const y = (Math.cos(i * 231.7 + starPulse * 0.05) * 0.5 + 0.5) * H;
            const alpha = Math.sin(starPulse + i) * 0.3 + 0.5;
            ctx.fillStyle = `rgba(6,182,212,${alpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Title
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 32px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Logica de Programacao', W / 2 + 2, 62);
        ctx.fillStyle = '#22d3ee';
        ctx.fillText('Logica de Programacao', W / 2, 60);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px Segoe UI, sans-serif';
        ctx.fillText('Aprenda a programar movendo o robo!', W / 2, 90);

        // Level buttons
        buttons = [];
        const cols = Math.min(5, Math.floor((W - 40) / 130));
        const btnW = 110;
        const btnH = 80;
        const gap = 15;
        const totalW = cols * (btnW + gap) - gap;
        const startX = (W - totalW) / 2;
        const startY = 130;

        for (let i = 0; i < LEVELS.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const bx = startX + col * (btnW + gap);
            const by = startY + row * (btnH + gap);

            const isUnlocked = i === 0 || levelScores[i - 1] > 0;
            const isHovered = hoveredBtn && hoveredBtn.type === 'level' && hoveredBtn.index === i;

            roundRect(bx, by, btnW, btnH, 8);
            if (isUnlocked) {
                ctx.fillStyle = isHovered ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.15)';
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
            }
            ctx.fill();
            ctx.strokeStyle = isUnlocked ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Level number
            ctx.fillStyle = isUnlocked ? '#06b6d4' : 'rgba(255,255,255,0.2)';
            ctx.font = 'bold 22px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(isUnlocked ? String(i + 1) : '\uD83D\uDD12', bx + btnW / 2, by + 28);

            // Level name
            ctx.fillStyle = isUnlocked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)';
            ctx.font = '11px Segoe UI, sans-serif';
            ctx.fillText(LEVELS[i].name, bx + btnW / 2, by + 48);

            // Stars
            if (levelScores[i] > 0) {
                for (let s = 0; s < 3; s++) {
                    ctx.fillStyle = s < levelScores[i] ? '#facc15' : 'rgba(255,255,255,0.15)';
                    ctx.font = '14px Segoe UI, sans-serif';
                    ctx.fillText('\u2605', bx + btnW / 2 - 18 + s * 18, by + 67);
                }
            }

            if (isUnlocked) {
                buttons.push({ x: bx, y: by, w: btnW, h: btnH, action: 'level', level: i, index: i, type: 'level' });
            }
        }

        // Instructions
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        const instrY = startY + (Math.ceil(LEVELS.length / cols)) * (btnH + gap) + 20;
        ctx.fillText('Monte um programa com blocos visuais para guiar o robo ate a estrela!', W / 2, instrY);
        ctx.fillText('Use loops e condicionais para resolver niveis avancados.', W / 2, instrY + 20);
    }

    // --- Draw Success Screen ---
    function drawSuccessOverlay() {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);

        const boxW = Math.min(400, W - 40);
        const boxH = 260;
        const bx = (W - boxW) / 2;
        const by = (H - boxH) / 2;

        roundRect(bx, by, boxW, boxH, 16);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Title
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 28px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Nivel Completo!', W / 2, by + 45);

        // Stars
        const stars = levelScores[currentLevel];
        for (let i = 0; i < 3; i++) {
            const sx = W / 2 - 45 + i * 45;
            const sy = by + 95;
            const size = 20 + (i < stars ? Math.sin(starPulse * 2 + i) * 3 : 0);
            ctx.fillStyle = i < stars ? '#facc15' : 'rgba(255,255,255,0.15)';
            drawStar(sx, sy, size, 5, size * 0.4);
            ctx.fill();
        }

        // Stats
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px Segoe UI, sans-serif';
        const cmdCount = countCommands(program);
        const optimal = LEVELS[currentLevel].optimal;
        ctx.fillText('Comandos usados: ' + cmdCount + ' (ideal: ' + optimal + ')', W / 2, by + 140);
        ctx.fillText(stars === 3 ? 'Perfeito! Solucao otima!' : stars === 2 ? 'Muito bom! Tente com menos comandos.' : 'Completo! Tente otimizar.', W / 2, by + 165);

        // Buttons
        buttons = [];
        const btnW = 120;
        const btnH = 40;

        // Retry
        roundRect(W / 2 - btnW - 10, by + boxH - 60, btnW, btnH, 6);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Segoe UI, sans-serif';
        ctx.fillText('Tentar Novamente', W / 2 - btnW / 2 - 10, by + boxH - 40);
        buttons.push({ x: W / 2 - btnW - 10, y: by + boxH - 60, w: btnW, h: btnH, action: 'retry' });

        // Next / Menu
        if (currentLevel < LEVELS.length - 1) {
            roundRect(W / 2 + 10, by + boxH - 60, btnW, btnH, 6);
            ctx.fillStyle = '#22c55e';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText('Proximo', W / 2 + 10 + btnW / 2, by + boxH - 40);
            buttons.push({ x: W / 2 + 10, y: by + boxH - 60, w: btnW, h: btnH, action: 'next' });
        } else {
            roundRect(W / 2 + 10, by + boxH - 60, btnW, btnH, 6);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText('Menu', W / 2 + 10 + btnW / 2, by + boxH - 40);
            buttons.push({ x: W / 2 + 10, y: by + boxH - 60, w: btnW, h: btnH, action: 'menu' });
        }
    }

    // --- Draw Fail Screen ---
    function drawFailOverlay() {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);

        const boxW = Math.min(380, W - 40);
        const boxH = 200;
        const bx = (W - boxW) / 2;
        const by = (H - boxH) / 2;

        roundRect(bx, by, boxW, boxH, 16);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Nao Conseguiu...', W / 2, by + 45);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px Segoe UI, sans-serif';
        ctx.fillText(failMessage || 'O robo nao chegou a estrela.', W / 2, by + 85);
        ctx.fillText('Revise seu programa e tente novamente!', W / 2, by + 110);

        buttons = [];
        const btnW = 140;
        const btnH = 40;
        roundRect(W / 2 - btnW / 2, by + boxH - 60, btnW, btnH, 6);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Segoe UI, sans-serif';
        ctx.fillText('Tentar Novamente', W / 2, by + boxH - 40);
        buttons.push({ x: W / 2 - btnW / 2, y: by + boxH - 60, w: btnW, h: btnH, action: 'retry' });
    }

    // --- Draw Repeat Count Picker ---
    let repeatPickerOpen = false;
    let repeatPickerTarget = -1;

    function drawRepeatPicker() {
        if (!repeatPickerOpen) return;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);

        const boxW = 280;
        const boxH = 200;
        const bx = (W - boxW) / 2;
        const by = (H - boxH) / 2;

        roundRect(bx, by, boxW, boxH, 12);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 18px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Quantas vezes repetir?', W / 2, by + 35);

        buttons = [];
        const nums = [2, 3, 4, 5, 6, 8];
        const nbtnW = 55;
        const nbtnH = 40;
        const cols = 3;
        const startX = bx + (boxW - cols * (nbtnW + 10) + 10) / 2;

        for (let i = 0; i < nums.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const nx = startX + col * (nbtnW + 10);
            const ny = by + 65 + row * (nbtnH + 10);

            roundRect(nx, ny, nbtnW, nbtnH, 6);
            ctx.fillStyle = '#f59e0b';
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Segoe UI, sans-serif';
            ctx.fillText(nums[i] + 'x', nx + nbtnW / 2, ny + nbtnH / 2);

            buttons.push({ x: nx, y: ny, w: nbtnW, h: nbtnH, action: 'repeat_count', count: nums[i] });
        }

        // Cancel
        roundRect(bx + boxW / 2 - 50, by + boxH - 45, 100, 30, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.fillText('Cancelar', W / 2, by + boxH - 30);
        buttons.push({ x: bx + boxW / 2 - 50, y: by + boxH - 45, w: 100, h: 30, action: 'cancel_repeat' });
    }

    // --- Main Draw ---
    function draw() {
        ctx.clearRect(0, 0, W, H);

        if (state === 'menu') {
            drawMenu();
        } else {
            // Game background
            ctx.fillStyle = '#0d0d18';
            ctx.fillRect(0, 0, W, H);

            drawGrid();
            drawPalette();
            drawProgramArea();
            drawHUD();

            if (state === 'success') drawSuccessOverlay();
            if (state === 'fail') drawFailOverlay();
        }

        if (repeatPickerOpen) drawRepeatPicker();

        drawParticles();

        // Tooltip
        if (tooltip) {
            const tw = ctx.measureText(tooltip.text).width + 16;
            const th = 28;
            const tx = Math.min(tooltip.x, W - tw - 5);
            const ty = tooltip.y - th - 5;
            roundRect(tx, ty, tw, th, 4);
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '12px Segoe UI, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(tooltip.text, tx + 8, ty + th / 2);
        }
    }

    // --- Update ---
    let lastTime = 0;

    function update(dt) {
        starPulse += dt * 2.5;
        robotBob += dt * 3;
        updateParticles();

        if (gridShake > 0) gridShake *= 0.9;
        if (gridShake < 0.1) gridShake = 0;

        if (tooltipTimer > 0) {
            tooltipTimer -= dt;
            if (tooltipTimer <= 0) tooltip = null;
        }

        // Animate robot
        if (state === 'executing') {
            execTimer += dt * 1000;
            if (execTimer >= execSpeed) {
                execTimer = 0;
                if (execIndex < executionSteps.length) {
                    const step = executionSteps[execIndex];
                    if (step.type === 'move') {
                        robot.x = step.x;
                        robot.y = step.y;
                        robot.dir = step.dir;
                        sfxStep();
                        const level = LEVELS[currentLevel];
                        const { x: ox, y: oy, cellSize: cs } = gridArea;
                        spawnParticles(
                            ox + robot.x * cs + cs / 2,
                            oy + robot.y * cs + cs / 2,
                            'rgba(6,182,212,0.8)', 3, 2
                        );
                    } else if (step.type === 'turn') {
                        robot.dir = step.dir;
                        sfxClick();
                    } else if (step.type === 'wall') {
                        sfxWall();
                        gridShake = 5;
                        failMessage = 'O robo bateu na parede!';
                        state = 'fail';
                        sfxFail();
                        return;
                    }
                    execIndex++;

                    // Check goal
                    const level = LEVELS[currentLevel];
                    const goal = findGoal(level);
                    if (robot.x === goal.x && robot.y === goal.y) {
                        // Success!
                        const cmdCount = countCommands(program);
                        const optimal = level.optimal;
                        let stars = 1;
                        if (cmdCount <= optimal + 2) stars = 2;
                        if (cmdCount <= optimal) stars = 3;
                        levelScores[currentLevel] = Math.max(levelScores[currentLevel], stars);
                        state = 'success';
                        sfxGoal();
                        for (let i = 0; i < stars; i++) {
                            setTimeout(() => sfxStar(), 200 + i * 200);
                        }
                        const { x: ox, y: oy, cellSize: cs } = gridArea;
                        spawnParticles(
                            ox + goal.x * cs + cs / 2,
                            oy + goal.y * cs + cs / 2,
                            '#facc15', 30, 5
                        );
                        spawnParticles(
                            ox + goal.x * cs + cs / 2,
                            oy + goal.y * cs + cs / 2,
                            '#22c55e', 20, 4
                        );
                        return;
                    }
                } else {
                    // Ran out of steps without reaching goal
                    const level = LEVELS[currentLevel];
                    const goal = findGoal(level);
                    if (robot.x !== goal.x || robot.y !== goal.y) {
                        failMessage = 'O robo nao chegou a estrela!';
                        state = 'fail';
                        sfxFail();
                    }
                }
            }

            // Smooth animation interpolation
            const lerpSpeed = 10;
            robot.animX += (robot.x - robot.animX) * Math.min(1, dt * lerpSpeed);
            robot.animY += (robot.y - robot.animY) * Math.min(1, dt * lerpSpeed);

            // Smooth direction animation
            let dirDiff = robot.dir - robot.animDir;
            if (dirDiff > 2) dirDiff -= 4;
            if (dirDiff < -2) dirDiff += 4;
            robot.animDir += dirDiff * Math.min(1, dt * lerpSpeed);
        } else {
            robot.animX = robot.x;
            robot.animY = robot.y;
            robot.animDir = robot.dir;
        }
    }

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;
        update(dt);
        draw();
        requestAnimationFrame(gameLoop);
    }

    // --- Input Handling ---
    function hitTest(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    }

    function handleClick(mx, my) {
        ensureAudio();

        // Repeat picker takes priority
        if (repeatPickerOpen) {
            for (const btn of buttons) {
                if (hitTest(mx, my, btn)) {
                    if (btn.action === 'repeat_count') {
                        sfxPlace();
                        const newCmd = { type: CMD.REPEAT, repeatCount: btn.count, children: [] };
                        if (repeatSubMode && activeRepeatIdx >= 0 && program[activeRepeatIdx]) {
                            program[activeRepeatIdx].children.push(newCmd);
                        } else if (ifSubMode && activeIfIdx >= 0 && program[activeIfIdx]) {
                            program[activeIfIdx].children.push(newCmd);
                        } else {
                            program.push(newCmd);
                        }
                        repeatPickerOpen = false;
                        repeatSubMode = true;
                        activeRepeatIdx = ifSubMode ? -1 : program.length - 1;
                        if (repeatSubMode && activeRepeatIdx < 0) {
                            // nested inside if - find last added
                            activeRepeatIdx = program.length - 1;
                            repeatSubMode = false;
                        }
                        // Enter sub-mode for the new repeat block
                        ifSubMode = false;
                        activeIfIdx = -1;
                        repeatSubMode = true;
                        activeRepeatIdx = program.length - 1;
                        // Check if we added to a container
                        for (let i = 0; i < program.length; i++) {
                            if (program[i].type === CMD.REPEAT && program[i].children) {
                                // keep latest top-level repeat as active
                            }
                        }
                        return;
                    }
                    if (btn.action === 'cancel_repeat') {
                        repeatPickerOpen = false;
                        sfxClick();
                        return;
                    }
                }
            }
            return;
        }

        // Check buttons
        for (const btn of buttons) {
            if (hitTest(mx, my, btn)) {
                sfxClick();
                if (btn.action === 'level') {
                    startLevel(btn.level);
                    return;
                }
                if (btn.action === 'execute') {
                    if (state === 'playing') executeProgram();
                    return;
                }
                if (btn.action === 'clear') {
                    program = [];
                    repeatSubMode = false;
                    activeRepeatIdx = -1;
                    ifSubMode = false;
                    activeIfIdx = -1;
                    scrollOffset = 0;
                    // Reset robot
                    const level = LEVELS[currentLevel];
                    const start = findStart(level);
                    robot.x = start.x;
                    robot.y = start.y;
                    robot.dir = level.startDir;
                    return;
                }
                if (btn.action === 'menu') {
                    state = 'menu';
                    return;
                }
                if (btn.action === 'retry') {
                    startLevel(currentLevel);
                    return;
                }
                if (btn.action === 'next') {
                    startLevel(currentLevel + 1);
                    return;
                }
            }
        }

        if (state !== 'playing') return;

        // Check palette buttons
        for (const btn of paletteButtons) {
            if (hitTest(mx, my, btn)) {
                sfxPlace();
                if (btn.cmd === CMD.REPEAT) {
                    repeatPickerOpen = true;
                    return;
                }
                if (btn.cmd === CMD.IF_WALL) {
                    const newCmd = { type: CMD.IF_WALL, children: [] };
                    if (repeatSubMode && activeRepeatIdx >= 0 && program[activeRepeatIdx]) {
                        program[activeRepeatIdx].children.push(newCmd);
                    } else {
                        program.push(newCmd);
                    }
                    repeatSubMode = false;
                    activeRepeatIdx = -1;
                    ifSubMode = true;
                    activeIfIdx = program.length - 1;
                    return;
                }
                const newCmd = { type: btn.cmd };
                if (repeatSubMode && activeRepeatIdx >= 0 && program[activeRepeatIdx]) {
                    program[activeRepeatIdx].children.push(newCmd);
                } else if (ifSubMode && activeIfIdx >= 0 && program[activeIfIdx]) {
                    program[activeIfIdx].children.push(newCmd);
                } else {
                    program.push(newCmd);
                }
                return;
            }
        }

        // Check program blocks (for delete or toggling sub-mode)
        for (const block of programBlocks) {
            if (hitTest(mx, my, block)) {
                // Check delete button
                const delCx = block.delX + block.delW / 2;
                const delCy = block.delY + block.delH / 2;
                const dist = Math.sqrt((mx - delCx) ** 2 + (my - delCy) ** 2);
                if (dist < block.delW) {
                    sfxClick();
                    if (block.parentIdx >= 0 && program[block.parentIdx] && program[block.parentIdx].children) {
                        program[block.parentIdx].children.splice(block.index, 1);
                    } else {
                        program.splice(block.index, 1);
                    }
                    // Reset sub-modes if the active block was deleted
                    if (repeatSubMode && block.index === activeRepeatIdx && block.parentIdx < 0) {
                        repeatSubMode = false;
                        activeRepeatIdx = -1;
                    }
                    if (ifSubMode && block.index === activeIfIdx && block.parentIdx < 0) {
                        ifSubMode = false;
                        activeIfIdx = -1;
                    }
                    return;
                }

                // Toggle sub-mode for repeat/if blocks
                if (block.cmd.type === CMD.REPEAT && block.parentIdx < 0) {
                    if (repeatSubMode && activeRepeatIdx === block.index) {
                        repeatSubMode = false;
                        activeRepeatIdx = -1;
                    } else {
                        repeatSubMode = true;
                        activeRepeatIdx = block.index;
                        ifSubMode = false;
                        activeIfIdx = -1;
                    }
                    sfxClick();
                    return;
                }
                if (block.cmd.type === CMD.IF_WALL && block.parentIdx < 0) {
                    if (ifSubMode && activeIfIdx === block.index) {
                        ifSubMode = false;
                        activeIfIdx = -1;
                    } else {
                        ifSubMode = true;
                        activeIfIdx = block.index;
                        repeatSubMode = false;
                        activeRepeatIdx = -1;
                    }
                    sfxClick();
                    return;
                }
            }
        }
    }

    function handleHover(mx, my) {
        hoveredBtn = null;
        tooltip = null;

        if (state === 'menu') {
            for (const btn of buttons) {
                if (hitTest(mx, my, btn) && btn.type === 'level') {
                    hoveredBtn = { type: 'level', index: btn.index };
                    return;
                }
            }
        }

        for (let i = 0; i < paletteButtons.length; i++) {
            const btn = paletteButtons[i];
            if (hitTest(mx, my, btn)) {
                hoveredBtn = { type: 'palette', index: i };
                tooltip = { text: CMD_INFO[btn.cmd].desc, x: mx, y: my };
                tooltipTimer = 3;
                return;
            }
        }
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (hitTest(mx, my, programArea)) {
            dragging = true;
            dragStartY = my;
        }

        handleClick(mx, my);
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        handleHover(mx, my);

        if (dragging) {
            const dy = dragStartY - my;
            scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + dy));
            dragStartY = my;
        }
    });

    canvas.addEventListener('mouseup', () => { dragging = false; });

    canvas.addEventListener('wheel', (e) => {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + e.deltaY * 0.5));
        e.preventDefault();
    }, { passive: false });

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mx = touch.clientX - rect.left;
        const my = touch.clientY - rect.top;

        if (hitTest(mx, my, programArea)) {
            dragging = true;
            dragStartY = my;
        }

        handleClick(mx, my);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (dragging) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const my = touch.clientY - rect.top;
            const dy = dragStartY - my;
            scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + dy));
            dragStartY = my;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        dragging = false;
    }, { passive: false });

    // --- Init ---
    function init() {
        // Load saved progress
        try {
            const saved = localStorage.getItem('logica_prog_scores');
            if (saved) {
                const parsed = JSON.parse(saved);
                for (let i = 0; i < Math.min(parsed.length, levelScores.length); i++) {
                    levelScores[i] = parsed[i];
                }
            }
        } catch (e) { /* ignore */ }

        state = 'menu';
        computeLayout();

        // Save progress periodically
        setInterval(() => {
            try {
                localStorage.setItem('logica_prog_scores', JSON.stringify(levelScores));
            } catch (e) { /* ignore */ }
        }, 5000);

        // Hide loading screen
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';

        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    // Start
    init();

})();
