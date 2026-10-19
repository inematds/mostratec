// Code Academy - Programming puzzles
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

// Programming Languages (worlds)
const LANGUAGES = [
  { id: 0, name: 'Python Basics', color: '#3776ab', icon: '🐍', unlockLevel: 1, challenges: 50 },
  { id: 1, name: 'JavaScript', color: '#f7df1e', icon: '⚡', unlockLevel: 5, challenges: 50 },
  { id: 2, name: 'HTML/CSS', color: '#e34f26', icon: '🌐', unlockLevel: 10, challenges: 50 },
  { id: 3, name: 'Java', color: '#f89820', icon: '☕', unlockLevel: 15, challenges: 50 },
  { id: 4, name: 'C/C++', color: '#00599c', icon: '⚙️', unlockLevel: 20, challenges: 50 },
  { id: 5, name: 'SQL', color: '#336791', icon: '🗄️', unlockLevel: 30, challenges: 50 },
  { id: 6, name: 'Git/GitHub', color: '#f05032', icon: '📦', unlockLevel: 40, challenges: 50 },
  { id: 7, name: 'Algoritmos', color: '#9333ea', icon: '🧮', unlockLevel: 50, challenges: 50 },
  { id: 8, name: 'Estruturas de Dados', color: '#16a34a', icon: '📊', unlockLevel: 60, challenges: 50 },
  { id: 9, name: 'DevOps', color: '#0db7ed', icon: '🐳', unlockLevel: 70, challenges: 50 }
];

// Progress
let currentLang = 0;
let currentChallenge = 0;
let challengesCompleted = {};
let langScroll = 0;
let challengeScroll = 0;

// Coding challenges
const CHALLENGES = {
  0: [ // Python
    { q: 'Como imprimir "Olá" em Python?', a: ['print("Olá")', 'echo "Olá"', 'console.log("Olá")', 'System.out.print("Olá")'], correct: 0 },
    { q: 'Qual operador define potência em Python?', a: ['**', '^', 'pow', '//'], correct: 0 },
    { q: 'Como criar uma lista em Python?', a: ['lista = []', 'lista = {}', 'lista = ()', 'list lista'], correct: 0 },
    { q: 'Qual função retorna o tamanho de uma lista?', a: ['len()', 'size()', 'length()', 'count()'], correct: 0 },
    { q: 'Como definir uma função em Python?', a: ['def funcao():', 'function funcao():', 'func funcao():', 'void funcao():'], correct: 0 },
    { q: 'O que faz "range(5)"?', a: ['Gera 0,1,2,3,4', 'Gera 1,2,3,4,5', 'Gera 0,1,2,3,4,5', 'Erro'], correct: 0 }
  ],
  1: [ // JavaScript
    { q: 'Como declarar uma variável em JS moderno?', a: ['let x = 5', 'var x = 5', 'int x = 5', 'x := 5'], correct: 0 },
    { q: 'Qual método adiciona item ao final do array?', a: ['push()', 'append()', 'add()', 'insert()'], correct: 0 },
    { q: 'Como criar uma arrow function?', a: ['() => {}', 'function() {}', '-> {}', 'lambda: {}'], correct: 0 },
    { q: 'O que é "===" em JavaScript?', a: ['Igualdade estrita', 'Atribuição', 'Igualdade fraca', 'Comparação'], correct: 0 },
    { q: 'Como selecionar elemento por ID no DOM?', a: ['document.getElementById()', 'document.querySelector()', 'document.getElement()', '$()'], correct: 0 }
  ],
  2: [ // HTML/CSS
    { q: 'Qual tag define o título da página?', a: ['<title>', '<head>', '<h1>', '<header>'], correct: 0 },
    { q: 'Qual propriedade CSS muda a cor do texto?', a: ['color', 'text-color', 'font-color', 'foreground'], correct: 0 },
    { q: 'Como criar um link em HTML?', a: ['<a href="">', '<link>', '<url>', '<href>'], correct: 0 },
    { q: 'Qual display coloca itens em linha?', a: ['flex', 'block', 'inline-block', 'grid'], correct: 0 },
    { q: 'Como adicionar classe a um elemento?', a: ['class="nome"', 'className="nome"', 'id="nome"', 'style="nome"'], correct: 0 }
  ],
  3: [ // Java
    { q: 'Como declarar um método main em Java?', a: ['public static void main(String[] args)', 'void main()', 'def main():', 'function main()'], correct: 0 },
    { q: 'Qual palavra-chave cria objeto?', a: ['new', 'create', 'make', 'instance'], correct: 0 },
    { q: 'Como criar array em Java?', a: ['int[] arr = new int[5]', 'arr = []', 'array arr', 'int arr[][]'], correct: 0 },
    { q: 'O que é uma classe em Java?', a: ['Template para objetos', 'Variável', 'Função', 'Loop'], correct: 0 }
  ],
  4: [ // C/C++
    { q: 'Qual é o header para input/output em C?', a: ['<stdio.h>', '<iostream>', '<io.h>', '<input.h>'], correct: 0 },
    { q: 'Como alocar memória dinamicamente em C?', a: ['malloc()', 'new', 'alloc()', 'memory()'], correct: 0 },
    { q: 'O que é um ponteiro?', a: ['Variável que armazena endereço', 'Tipo de dado', 'Função', 'Loop'], correct: 0 },
    { q: 'Qual operador acessa membro via ponteiro?', a: ['->', '.', '::', '&'], correct: 0 }
  ],
  5: [ // SQL
    { q: 'Qual comando seleciona dados?', a: ['SELECT', 'GET', 'FETCH', 'RETRIEVE'], correct: 0 },
    { q: 'Qual cláusula filtra resultados?', a: ['WHERE', 'FILTER', 'HAVING', 'IF'], correct: 0 },
    { q: 'Como ordenar resultados?', a: ['ORDER BY', 'SORT BY', 'ARRANGE', 'SEQUENCE'], correct: 0 },
    { q: 'Qual comando insere dados?', a: ['INSERT INTO', 'ADD TO', 'PUT INTO', 'CREATE'], correct: 0 }
  ],
  6: [ // Git
    { q: 'Qual comando salva alterações no Git?', a: ['git commit', 'git save', 'git push', 'git add'], correct: 0 },
    { q: 'Como criar nova branch?', a: ['git branch nome', 'git create nome', 'git new nome', 'git checkout nome'], correct: 0 },
    { q: 'O que faz "git pull"?', a: ['Baixa e mescla alterações', 'Envia alterações', 'Cria branch', 'Remove arquivos'], correct: 0 },
    { q: 'Como ver histórico de commits?', a: ['git log', 'git history', 'git show', 'git commits'], correct: 0 }
  ],
  7: [ // Algoritmos
    { q: 'Qual a complexidade do Bubble Sort?', a: ['O(n²)', 'O(n)', 'O(log n)', 'O(n log n)'], correct: 0 },
    { q: 'O que é busca binária?', a: ['Divisão e conquista em lista ordenada', 'Busca linear', 'Busca aleatória', 'Busca em grafo'], correct: 0 },
    { q: 'Qual algoritmo tem O(n log n)?', a: ['Merge Sort', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'], correct: 0 },
    { q: 'O que é recursão?', a: ['Função que chama a si mesma', 'Loop infinito', 'Estrutura de dados', 'Tipo de variável'], correct: 0 }
  ],
  8: [ // Estruturas de Dados
    { q: 'O que é uma pilha (stack)?', a: ['LIFO - Last In First Out', 'FIFO - First In First Out', 'Acesso aleatório', 'Lista ordenada'], correct: 0 },
    { q: 'O que é uma fila (queue)?', a: ['FIFO - First In First Out', 'LIFO - Last In First Out', 'Acesso aleatório', 'Árvore'], correct: 0 },
    { q: 'O que é uma árvore binária?', a: ['Cada nó tem no máximo 2 filhos', 'Lista ligada', 'Array', 'Grafo completo'], correct: 0 },
    { q: 'O que é hash table?', a: ['Estrutura chave-valor', 'Lista ordenada', 'Árvore balanceada', 'Pilha especial'], correct: 0 }
  ],
  9: [ // DevOps
    { q: 'O que é Docker?', a: ['Plataforma de containers', 'Linguagem de programação', 'Banco de dados', 'Framework web'], correct: 0 },
    { q: 'O que é CI/CD?', a: ['Integração e Deploy Contínuos', 'Linguagem de marcação', 'Tipo de servidor', 'Protocolo de rede'], correct: 0 },
    { q: 'O que é Kubernetes?', a: ['Orquestrador de containers', 'Sistema operacional', 'Banco de dados', 'Linguagem'], correct: 0 },
    { q: 'O que é um pipeline?', a: ['Sequência automatizada de tarefas', 'Tipo de servidor', 'Protocolo', 'Container'], correct: 0 }
  ]
};

// Current state
let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;

// Skills/Upgrades
let skills = {
  debugging: 0,
  speed: 0,
  memory: 0,
  logic: 0
};

// Shop items
const SHOP_ITEMS = [
  { id: 'debug', name: 'Debugger Pro', desc: '+1 Debugging skill', cost: 500, gem: false },
  { id: 'speed', name: 'Speed Boost', desc: '+1 Speed skill', cost: 500, gem: false },
  { id: 'memory', name: 'RAM Upgrade', desc: '+1 Memory skill', cost: 600, gem: false },
  { id: 'logic', name: 'Logic Master', desc: '+1 Logic skill', cost: 600, gem: false },
  { id: 'ide', name: 'IDE Premium', desc: '+50% XP', cost: 40, gem: true },
  { id: 'unlock', name: 'Desbloquear Lang', desc: 'Acesso antecipado', cost: 75, gem: true }
];

// Particles
let particles = [];

// Touch
let touchStartY = 0;
let isDragging = false;

// Resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Save/Load
function saveGame() {
  localStorage.setItem('codeAcademy', JSON.stringify({
    coins, gems, xp, level, currentLang, challengesCompleted, skills, streak
  }));
}

function loadGame() {
  const saved = localStorage.getItem('codeAcademy');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentLang = data.currentLang || 0;
    challengesCompleted = data.challengesCompleted || {};
    skills = data.skills || skills;
    streak = data.streak || 0;
  }
}

// Add XP
function addXP(amount) {
  xp += amount;
  const needed = level * 100;
  while (xp >= needed) {
    xp -= needed;
    level++;
    gems += 5;
    createParticles(canvas.width / 2, canvas.height / 2, '#ffd700', 30);
  }
  saveGame();
}

// Particles
function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1,
      color,
      size: Math.random() * 6 + 2
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= 0.02;
    return p.life > 0;
  });
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

// Generate question
function generateQuestion(lang) {
  const questions = CHALLENGES[lang] || CHALLENGES[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

// Start challenge
function startChallenge(lang, challenge) {
  currentLang = lang;
  currentChallenge = challenge;
  currentQuestion = generateQuestion(lang);
  questionAnswered = false;
  selectedAnswer = -1;
  gameState = 'challenge';
}

// Draw menu
function drawMenu() {
  // Background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title with code effect
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 36px Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('< CODE ACADEMY />', canvas.width / 2, 65);

  // Stats
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 280, 35);
  ctx.fillStyle = '#22c55e';
  ctx.font = '13px Consolas';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Lv.${level}  🔥${streak}`, 20, 32);

  // Skills mini display
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 50, 280, 22);
  ctx.fillStyle = '#888';
  ctx.font = '11px Consolas';
  ctx.fillText(`🐛${skills.debugging} ⚡${skills.speed} 🧠${skills.memory} 🔮${skills.logic}`, 20, 65);

  // Languages label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Escolha uma Linguagem', canvas.width / 2, 105);

  // Language cards
  const cardHeight = 70;
  const startY = 125;
  const maxScroll = Math.max(0, LANGUAGES.length * (cardHeight + 10) - (canvas.height - startY - 75));
  langScroll = Math.max(0, Math.min(langScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(15, startY, canvas.width - 30, canvas.height - startY - 65);
  ctx.clip();

  LANGUAGES.forEach((lang, i) => {
    const y = startY + i * (cardHeight + 10) - langScroll;
    if (y > startY - cardHeight && y < canvas.height - 65) {
      const unlocked = level >= lang.unlockLevel;
      const completed = challengesCompleted[lang.id] || 0;

      ctx.fillStyle = unlocked ? lang.color : '#333';
      ctx.globalAlpha = unlocked ? 1 : 0.5;
      ctx.fillRect(25, y, canvas.width - 50, cardHeight);

      // Icon
      ctx.font = '34px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(lang.icon, 40, y + 46);

      // Name
      ctx.fillStyle = lang.color === '#f7df1e' ? '#000' : '#fff';
      ctx.font = 'bold 16px Consolas';
      ctx.fillText(lang.name, 88, y + 28);

      // Progress
      ctx.font = '12px Arial';
      ctx.fillStyle = lang.color === '#f7df1e' ? '#333' : '#ddd';
      ctx.fillText(`${completed}/${lang.challenges} desafios`, 88, y + 50);

      // Progress bar
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(195, y + 38, 90, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(195, y + 38, (completed / lang.challenges) * 90, 10);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '15px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Lv.${lang.unlockLevel}`, canvas.width - 45, y + 42);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();

  // Shop button
  ctx.fillStyle = '#9333ea';
  ctx.fillRect(canvas.width - 85, canvas.height - 55, 70, 40);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 SHOP', canvas.width - 50, canvas.height - 30);
}

// Draw challenges
function drawChallenges() {
  const lang = LANGUAGES[currentLang];

  ctx.fillStyle = lang.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = lang.color === '#f7df1e' ? '#000' : '#fff';
  ctx.font = 'bold 26px Consolas';
  ctx.textAlign = 'center';
  ctx.fillText(`${lang.icon} ${lang.name}`, canvas.width / 2, 45);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText('← Voltar', 50, 33);

  // Challenge grid
  const cols = 5;
  const btnSize = 48;
  const gap = 8;
  const startY = 75;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(lang.challenges / cols) * (btnSize + gap) - (canvas.height - startY - 20));
  challengeScroll = Math.max(0, Math.min(challengeScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < lang.challenges; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - challengeScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (challengesCompleted[lang.id] || 0) > i;
      const available = (challengesCompleted[lang.id] || 0) >= i;

      ctx.fillStyle = completed ? '#22c55e' : (available ? lang.color : '#444');
      ctx.fillRect(x, y, btnSize, btnSize);

      ctx.strokeStyle = completed ? '#4ade80' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = lang.color === '#f7df1e' && !completed ? '#000' : '#fff';
      ctx.font = completed ? '20px Arial' : 'bold 14px Consolas';
      ctx.textAlign = 'center';
      ctx.fillText(completed ? '✓' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 5);
    }
  }

  ctx.restore();
}

// Draw challenge
function drawChallenge() {
  const lang = LANGUAGES[currentLang];

  // Terminal-like background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = lang.color;
  ctx.fillRect(0, 0, canvas.width, 50);
  ctx.fillStyle = lang.color === '#f7df1e' ? '#000' : '#fff';
  ctx.font = 'bold 16px Consolas';
  ctx.textAlign = 'center';
  ctx.fillText(`${lang.icon} Desafio ${currentChallenge + 1}`, canvas.width / 2, 32);

  // Streak
  if (streak > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 15, 32);
  }

  // Question (terminal style)
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(20, 65, canvas.width - 40, 100);

  // Terminal prompt
  ctx.fillStyle = '#22c55e';
  ctx.font = '14px Consolas';
  ctx.textAlign = 'left';
  ctx.fillText('> pergunta:', 35, 90);

  ctx.fillStyle = '#fff';
  ctx.font = '15px Arial';
  ctx.textAlign = 'center';

  // Word wrap
  const words = currentQuestion.q.split(' ');
  let line = '';
  let y = 120;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > canvas.width - 80) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 22;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, canvas.width / 2, y);

  // Code-style answers
  const answerY = 190;
  currentQuestion.a.forEach((answer, i) => {
    const ay = answerY + i * 52;
    let bgColor = '#1e1e3e';

    if (questionAnswered) {
      if (i === currentQuestion.correct) bgColor = '#166534';
      else if (i === selectedAnswer && i !== currentQuestion.correct) bgColor = '#991b1b';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(30, ay, canvas.width - 60, 44);

    // Option number
    ctx.fillStyle = '#22c55e';
    ctx.font = '13px Consolas';
    ctx.textAlign = 'left';
    ctx.fillText(`[${i + 1}]`, 40, ay + 28);

    ctx.fillStyle = '#fff';
    ctx.font = '14px Consolas';
    ctx.fillText(answer, 75, ay + 28);
  });

  // Continue
  if (questionAnswered) {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(canvas.width / 2 - 80, canvas.height - 75, 160, 48);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Consolas';
    ctx.textAlign = 'center';
    ctx.fillText('> continuar_', canvas.width / 2, canvas.height - 45);
  }
}

// Draw victory
function drawVictory() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 36px Consolas';
  ctx.textAlign = 'center';
  ctx.fillText('✓ COMPILE SUCCESS!', canvas.width / 2, canvas.height / 2 - 60);

  const reward = 40 + currentChallenge * 5;
  ctx.fillStyle = '#ffd700';
  ctx.font = '18px Consolas';
  ctx.fillText(`+${reward} coins  +${25 + currentChallenge * 2} XP`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#60a5fa';
  ctx.font = '14px Arial';
  ctx.fillText(`Skills melhoradas!`, canvas.width / 2, canvas.height / 2 + 35);

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 70, 160, 48);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px Consolas';
  ctx.fillText('> next_', canvas.width / 2, canvas.height / 2 + 100);
}

// Draw shop
function drawShop() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#9333ea';
  ctx.font = 'bold 28px Consolas';
  ctx.textAlign = 'center';
  ctx.fillText('< SHOP />', canvas.width / 2, 42);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '13px Arial';
  ctx.fillText('← Voltar', 50, 32);

  // Currency
  ctx.fillStyle = '#ffd700';
  ctx.font = '14px Consolas';
  ctx.textAlign = 'right';
  ctx.fillText(`💰 ${coins}  💎 ${gems}`, canvas.width - 20, 32);

  // Items
  SHOP_ITEMS.forEach((item, i) => {
    const y = 65 + i * 68;
    const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;

    ctx.fillStyle = canAfford ? '#1e1e3e' : '#0a0a1e';
    ctx.fillRect(20, y, canvas.width - 40, 58);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Consolas';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 32, y + 22);

    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.fillText(item.desc, 32, y + 42);

    ctx.fillStyle = item.gem ? '#a78bfa' : '#ffd700';
    ctx.font = 'bold 14px Consolas';
    ctx.textAlign = 'right';
    ctx.fillText(`${item.gem ? '💎' : '💰'} ${item.cost}`, canvas.width - 32, y + 32);
  });
}

// Main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'challenges': drawChallenges(); break;
    case 'challenge': drawChallenge(); break;
    case 'victory': drawVictory(); break;
    case 'shop': drawShop(); break;
  }

  drawParticles();
}

// Game loop
function gameLoop() {
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}

// Handle click
function handleClick(x, y) {
  if (gameState === 'menu') {
    // Shop
    if (x > canvas.width - 85 && y > canvas.height - 55) {
      gameState = 'shop';
      return;
    }

    // Language selection
    const cardHeight = 70;
    const startY = 125;
    LANGUAGES.forEach((lang, i) => {
      const cy = startY + i * (cardHeight + 10) - langScroll;
      if (y > cy && y < cy + cardHeight && x > 25 && x < canvas.width - 25) {
        if (level >= lang.unlockLevel) {
          currentLang = i;
          challengeScroll = 0;
          gameState = 'challenges';
        }
      }
    });
  } else if (gameState === 'challenges') {
    // Back
    if (x < 85 && y < 44) {
      gameState = 'menu';
      return;
    }

    // Challenge selection
    const lang = LANGUAGES[currentLang];
    const cols = 5;
    const btnSize = 48;
    const gap = 8;
    const startY = 75;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < lang.challenges; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - challengeScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((challengesCompleted[lang.id] || 0) >= i) {
          startChallenge(currentLang, i);
        }
        break;
      }
    }
  } else if (gameState === 'challenge') {
    if (!questionAnswered) {
      const answerY = 190;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 52;
        if (y > ay && y < ay + 44 && x > 30 && x < canvas.width - 30) {
          selectedAnswer = i;
          questionAnswered = true;

          if (i === currentQuestion.correct) {
            streak++;
            createParticles(canvas.width / 2, ay + 22, '#22c55e', 20);
          } else {
            streak = 0;
          }
        }
      });
    } else {
      if (y > canvas.height - 75 && y < canvas.height - 27) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 40 + currentChallenge * 5;
          coins += reward;
          addXP(25 + currentChallenge * 2);

          // Random skill improvement
          const skillKeys = Object.keys(skills);
          const randomSkill = skillKeys[Math.floor(Math.random() * skillKeys.length)];
          skills[randomSkill] += 0.1;

          if (!challengesCompleted[currentLang] || challengesCompleted[currentLang] <= currentChallenge) {
            challengesCompleted[currentLang] = currentChallenge + 1;
          }

          saveGame();
          gameState = 'victory';
        } else {
          currentQuestion = generateQuestion(currentLang);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'victory') {
    if (y > canvas.height / 2 + 70 && y < canvas.height / 2 + 118) {
      gameState = 'challenges';
    }
  } else if (gameState === 'shop') {
    if (x < 85 && y < 42) {
      gameState = 'menu';
      return;
    }

    SHOP_ITEMS.forEach((item, i) => {
      const iy = 65 + i * 68;
      if (y > iy && y < iy + 58 && x > 20 && x < canvas.width - 20) {
        const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;
        if (canAfford) {
          if (item.gem) gems -= item.cost;
          else coins -= item.cost;

          if (item.id === 'debug') skills.debugging++;
          if (item.id === 'speed') skills.speed++;
          if (item.id === 'memory') skills.memory++;
          if (item.id === 'logic') skills.logic++;

          createParticles(x, y, '#9333ea', 20);
          saveGame();
        }
      }
    });
  }
}

// Events
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  handleClick(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchStartY = e.touches[0].clientY;
  isDragging = false;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touchY = e.touches[0].clientY;
  const delta = touchStartY - touchY;

  if (Math.abs(delta) > 5) {
    isDragging = true;
    if (gameState === 'menu') langScroll += delta;
    else if (gameState === 'challenges') challengeScroll += delta;
    touchStartY = touchY;
  }
});

canvas.addEventListener('touchend', (e) => {
  if (!isDragging && e.changedTouches.length > 0) {
    const rect = canvas.getBoundingClientRect();
    const t = e.changedTouches[0];
    handleClick(t.clientX - rect.left, t.clientY - rect.top);
  }
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (gameState === 'menu') langScroll += e.deltaY * 0.5;
  else if (gameState === 'challenges') challengeScroll += e.deltaY * 0.5;
});

// Init
loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
