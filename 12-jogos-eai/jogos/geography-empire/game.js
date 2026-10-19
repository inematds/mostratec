// Geography Empire - Build empires learning geography
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

// Continents (worlds)
const CONTINENTS = [
  { id: 0, name: 'América do Sul', color: '#16a34a', icon: '🌎', unlockLevel: 1, territories: 50 },
  { id: 1, name: 'América do Norte', color: '#2563eb', icon: '🌎', unlockLevel: 5, territories: 50 },
  { id: 2, name: 'Europa', color: '#7c3aed', icon: '🌍', unlockLevel: 10, territories: 50 },
  { id: 3, name: 'África', color: '#ea580c', icon: '🌍', unlockLevel: 15, territories: 50 },
  { id: 4, name: 'Ásia', color: '#dc2626', icon: '🌏', unlockLevel: 20, territories: 50 },
  { id: 5, name: 'Oceania', color: '#0891b2', icon: '🌏', unlockLevel: 30, territories: 50 },
  { id: 6, name: 'Oriente Médio', color: '#ca8a04', icon: '🏜️', unlockLevel: 40, territories: 50 },
  { id: 7, name: 'Ártico', color: '#67e8f9', icon: '❄️', unlockLevel: 50, territories: 50 },
  { id: 8, name: 'Antártica', color: '#e2e8f0', icon: '🐧', unlockLevel: 60, territories: 50 },
  { id: 9, name: 'Oceanos', color: '#1d4ed8', icon: '🌊', unlockLevel: 70, territories: 50 }
];

// Progress
let currentContinent = 0;
let currentTerritory = 0;
let territoriesConquered = {};
let continentScroll = 0;
let territoryScroll = 0;

// Empire stats
let empire = {
  population: 1000,
  territory: 1,
  military: 100,
  economy: 100,
  culture: 50
};

// Questions database
const QUESTIONS = {
  0: [ // América do Sul
    { q: 'Qual é a capital do Brasil?', a: ['Brasília', 'São Paulo', 'Rio de Janeiro', 'Salvador'], correct: 0 },
    { q: 'Qual é o maior rio da América do Sul?', a: ['Amazonas', 'Paraná', 'Orinoco', 'São Francisco'], correct: 0 },
    { q: 'Qual país tem a maior população?', a: ['Brasil', 'Argentina', 'Colômbia', 'Peru'], correct: 0 },
    { q: 'Onde fica Machu Picchu?', a: ['Peru', 'Bolívia', 'Chile', 'Equador'], correct: 0 },
    { q: 'Qual é a capital da Argentina?', a: ['Buenos Aires', 'Córdoba', 'Rosário', 'Mendoza'], correct: 0 },
    { q: 'Qual é a moeda do Chile?', a: ['Peso chileno', 'Real', 'Dólar', 'Sol'], correct: 0 }
  ],
  1: [ // América do Norte
    { q: 'Qual é a capital dos EUA?', a: ['Washington D.C.', 'Nova York', 'Los Angeles', 'Chicago'], correct: 0 },
    { q: 'Quantos estados tem os EUA?', a: ['50', '48', '52', '51'], correct: 0 },
    { q: 'Qual é a capital do Canadá?', a: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'], correct: 0 },
    { q: 'Qual é a capital do México?', a: ['Cidade do México', 'Guadalajara', 'Monterrey', 'Cancún'], correct: 0 },
    { q: 'Qual é o maior lago da América do Norte?', a: ['Superior', 'Michigan', 'Huron', 'Erie'], correct: 0 }
  ],
  2: [ // Europa
    { q: 'Qual é a capital da França?', a: ['Paris', 'Lyon', 'Marselha', 'Nice'], correct: 0 },
    { q: 'Qual é a capital da Alemanha?', a: ['Berlim', 'Munique', 'Frankfurt', 'Hamburgo'], correct: 0 },
    { q: 'Qual é a capital da Itália?', a: ['Roma', 'Milão', 'Nápoles', 'Veneza'], correct: 0 },
    { q: 'Qual é a capital do Reino Unido?', a: ['Londres', 'Manchester', 'Liverpool', 'Birmingham'], correct: 0 },
    { q: 'Qual é a capital da Espanha?', a: ['Madri', 'Barcelona', 'Sevilha', 'Valencia'], correct: 0 },
    { q: 'Qual é a capital de Portugal?', a: ['Lisboa', 'Porto', 'Faro', 'Coimbra'], correct: 0 }
  ],
  3: [ // África
    { q: 'Qual é o maior país da África?', a: ['Argélia', 'Sudão', 'Congo', 'Líbia'], correct: 0 },
    { q: 'Onde fica as Pirâmides de Gizé?', a: ['Egito', 'Sudão', 'Líbia', 'Marrocos'], correct: 0 },
    { q: 'Qual é a capital da África do Sul?', a: ['Pretória', 'Cidade do Cabo', 'Johanesburgo', 'Durban'], correct: 0 },
    { q: 'Qual rio atravessa o Egito?', a: ['Nilo', 'Congo', 'Níger', 'Zambeze'], correct: 0 },
    { q: 'Qual é o maior deserto da África?', a: ['Saara', 'Kalahari', 'Namíbia', 'Líbio'], correct: 0 }
  ],
  4: [ // Ásia
    { q: 'Qual é a capital do Japão?', a: ['Tóquio', 'Osaka', 'Kyoto', 'Hiroshima'], correct: 0 },
    { q: 'Qual é a capital da China?', a: ['Pequim', 'Xangai', 'Hong Kong', 'Shenzhen'], correct: 0 },
    { q: 'Qual é a capital da Índia?', a: ['Nova Delhi', 'Mumbai', 'Calcutá', 'Bangalore'], correct: 0 },
    { q: 'Qual é o maior país do mundo?', a: ['Rússia', 'China', 'Canadá', 'EUA'], correct: 0 },
    { q: 'Onde fica o Monte Everest?', a: ['Nepal/China', 'Índia', 'Butão', 'Paquistão'], correct: 0 }
  ],
  5: [ // Oceania
    { q: 'Qual é a capital da Austrália?', a: ['Camberra', 'Sydney', 'Melbourne', 'Brisbane'], correct: 0 },
    { q: 'Qual é a capital da Nova Zelândia?', a: ['Wellington', 'Auckland', 'Christchurch', 'Hamilton'], correct: 0 },
    { q: 'Qual é a maior cidade da Austrália?', a: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'], correct: 0 },
    { q: 'Qual é o maior recife de coral?', a: ['Grande Barreira', 'Red Sea', 'Belize', 'Maldivas'], correct: 0 }
  ],
  6: [ // Oriente Médio
    { q: 'Qual é a capital da Arábia Saudita?', a: ['Riad', 'Jeddah', 'Meca', 'Medina'], correct: 0 },
    { q: 'Qual é a capital de Israel?', a: ['Jerusalém', 'Tel Aviv', 'Haifa', 'Beersheba'], correct: 0 },
    { q: 'Qual é a capital do Irã?', a: ['Teerã', 'Isfahan', 'Shiraz', 'Tabriz'], correct: 0 },
    { q: 'Qual é a capital da Turquia?', a: ['Ancara', 'Istambul', 'Izmir', 'Antalya'], correct: 0 }
  ],
  7: [ // Ártico
    { q: 'Quais países têm território no Ártico?', a: ['Rússia, Canadá, EUA, Noruega', 'Apenas Rússia', 'Apenas Canadá', 'Nenhum'], correct: 0 },
    { q: 'O Polo Norte está sobre?', a: ['Oceano Ártico (gelo)', 'Continente', 'Ilha', 'Montanha'], correct: 0 },
    { q: 'Qual é a maior ilha do Ártico?', a: ['Groenlândia', 'Islândia', 'Svalbard', 'Nova Zembla'], correct: 0 }
  ],
  8: [ // Antártica
    { q: 'A Antártica é um:', a: ['Continente', 'País', 'Oceano', 'Ilha'], correct: 0 },
    { q: 'Quantos países têm base na Antártica?', a: ['Mais de 30', '5', '10', 'Nenhum'], correct: 0 },
    { q: 'Qual animal é símbolo da Antártica?', a: ['Pinguim', 'Urso polar', 'Foca', 'Baleia'], correct: 0 }
  ],
  9: [ // Oceanos
    { q: 'Qual é o maior oceano?', a: ['Pacífico', 'Atlântico', 'Índico', 'Ártico'], correct: 0 },
    { q: 'Qual oceano banha o Brasil?', a: ['Atlântico', 'Pacífico', 'Índico', 'Ártico'], correct: 0 },
    { q: 'Quantos oceanos existem?', a: ['5', '4', '6', '7'], correct: 0 },
    { q: 'Qual é o oceano mais profundo?', a: ['Pacífico', 'Atlântico', 'Índico', 'Ártico'], correct: 0 }
  ]
};

// Current question state
let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;

// Buildings/Upgrades
const BUILDINGS = [
  { id: 'castle', name: 'Castelo', desc: '+100 população', cost: 500, effect: () => empire.population += 100 },
  { id: 'barracks', name: 'Quartel', desc: '+50 militar', cost: 400, effect: () => empire.military += 50 },
  { id: 'market', name: 'Mercado', desc: '+50 economia', cost: 400, effect: () => empire.economy += 50 },
  { id: 'university', name: 'Universidade', desc: '+30 cultura', cost: 600, effect: () => empire.culture += 30 },
  { id: 'wall', name: 'Muralha', desc: '+20% defesa', cost: 25, gem: true },
  { id: 'wonder', name: 'Maravilha', desc: '+100 todos', cost: 50, gem: true, effect: () => { empire.population += 100; empire.military += 100; empire.economy += 100; empire.culture += 100; } }
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
  localStorage.setItem('geographyEmpire', JSON.stringify({
    coins, gems, xp, level, currentContinent, territoriesConquered, empire, streak
  }));
}

function loadGame() {
  const saved = localStorage.getItem('geographyEmpire');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentContinent = data.currentContinent || 0;
    territoriesConquered = data.territoriesConquered || {};
    empire = data.empire || empire;
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
function generateQuestion(continent) {
  const questions = QUESTIONS[continent] || QUESTIONS[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

// Start conquest
function startConquest(continent, territory) {
  currentContinent = continent;
  currentTerritory = territory;
  currentQuestion = generateQuestion(continent);
  questionAnswered = false;
  selectedAnswer = -1;
  gameState = 'conquest';
}

// Draw menu
function drawMenu() {
  // Background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1e3a5f');
  grad.addColorStop(1, '#0d1b2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🌍 GEOGRAPHY EMPIRE', canvas.width / 2, 65);

  // Stats bar
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 10, 290, 35);
  ctx.fillStyle = '#ffd700';
  ctx.font = '13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Nv.${level}  👑${empire.territory}`, 20, 32);

  // Empire stats mini
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 50, 290, 25);
  ctx.fillStyle = '#aaa';
  ctx.font = '11px Arial';
  ctx.fillText(`👥${empire.population} ⚔️${empire.military} 💰${empire.economy} 🎭${empire.culture}`, 20, 67);

  // Continents label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Conquistar Territórios', canvas.width / 2, 110);

  // Continent cards
  const cardHeight = 70;
  const startY = 130;
  const maxScroll = Math.max(0, CONTINENTS.length * (cardHeight + 10) - (canvas.height - startY - 80));
  continentScroll = Math.max(0, Math.min(continentScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(15, startY, canvas.width - 30, canvas.height - startY - 70);
  ctx.clip();

  CONTINENTS.forEach((cont, i) => {
    const y = startY + i * (cardHeight + 10) - continentScroll;
    if (y > startY - cardHeight && y < canvas.height - 70) {
      const unlocked = level >= cont.unlockLevel;
      const conquered = territoriesConquered[cont.id] || 0;

      ctx.fillStyle = unlocked ? cont.color : '#333';
      ctx.globalAlpha = unlocked ? 1 : 0.5;
      ctx.fillRect(25, y, canvas.width - 50, cardHeight);

      // Icon
      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(cont.icon, 40, y + 48);

      // Name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(cont.name, 90, y + 30);

      // Progress
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ddd';
      ctx.fillText(`${conquered}/${cont.territories} territórios`, 90, y + 50);

      // Progress bar
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(200, y + 38, 90, 10);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(200, y + 38, (conquered / cont.territories) * 90, 10);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Nv.${cont.unlockLevel}`, canvas.width - 45, y + 42);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();

  // Shop button
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(canvas.width - 85, canvas.height - 55, 70, 40);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏗️ BUILD', canvas.width - 50, canvas.height - 30);
}

// Draw territories
function drawTerritories() {
  const cont = CONTINENTS[currentContinent];

  ctx.fillStyle = cont.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${cont.icon} ${cont.name}`, canvas.width / 2, 45);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText('← Voltar', 50, 33);

  // Territory grid
  const cols = 5;
  const btnSize = 50;
  const gap = 8;
  const startY = 75;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(cont.territories / cols) * (btnSize + gap) - (canvas.height - startY - 20));
  territoryScroll = Math.max(0, Math.min(territoryScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < cont.territories; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - territoryScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const conquered = (territoriesConquered[cont.id] || 0) > i;
      const available = (territoriesConquered[cont.id] || 0) >= i;

      ctx.fillStyle = conquered ? '#22c55e' : (available ? cont.color : '#444');
      ctx.fillRect(x, y, btnSize, btnSize);

      ctx.strokeStyle = conquered ? '#4ade80' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = conquered ? '20px Arial' : 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(conquered ? '🏴' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 5);
    }
  }

  ctx.restore();
}

// Draw conquest
function drawConquest() {
  const cont = CONTINENTS[currentContinent];

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = cont.color;
  ctx.fillRect(0, 0, canvas.width, 55);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`⚔️ Conquistar Território ${currentTerritory + 1}`, canvas.width / 2, 35);

  // Streak
  if (streak > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 20, 35);
  }

  // Question box
  ctx.fillStyle = '#1e1e3e';
  ctx.fillRect(25, 75, canvas.width - 50, 110);

  ctx.fillStyle = '#fff';
  ctx.font = '17px Arial';
  ctx.textAlign = 'center';

  // Word wrap
  const words = currentQuestion.q.split(' ');
  let line = '';
  let y = 115;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > canvas.width - 80) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 24;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, canvas.width / 2, y);

  // Answers
  const answerY = 205;
  currentQuestion.a.forEach((answer, i) => {
    const ay = answerY + i * 55;
    let bgColor = '#2d2d4e';

    if (questionAnswered) {
      if (i === currentQuestion.correct) bgColor = '#22c55e';
      else if (i === selectedAnswer && i !== currentQuestion.correct) bgColor = '#ef4444';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(35, ay, canvas.width - 70, 45);

    ctx.fillStyle = '#fff';
    ctx.font = '15px Arial';
    ctx.fillText(answer, canvas.width / 2, ay + 28);
  });

  // Continue
  if (questionAnswered) {
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(canvas.width / 2 - 80, canvas.height - 75, 160, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 43);
  }
}

// Draw victory
function drawVictory() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 38px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏴 TERRITÓRIO CONQUISTADO!', canvas.width / 2, canvas.height / 2 - 60);

  const reward = 45 + currentTerritory * 5;
  ctx.fillStyle = '#ffd700';
  ctx.font = '20px Arial';
  ctx.fillText(`+${reward} moedas  +${25 + currentTerritory * 2} XP`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#60a5fa';
  ctx.font = '16px Arial';
  ctx.fillText(`Seu império cresce! +1 Território`, canvas.width / 2, canvas.height / 2 + 40);

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 80, 160, 50);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 112);
}

// Draw build menu
function drawBuild() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏗️ CONSTRUÇÕES', canvas.width / 2, 45);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText('← Voltar', 50, 33);

  // Currency
  ctx.fillStyle = '#ffd700';
  ctx.font = '15px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`💰 ${coins}  💎 ${gems}`, canvas.width - 20, 33);

  // Empire stats
  ctx.fillStyle = '#1e1e3e';
  ctx.fillRect(20, 65, canvas.width - 40, 50);
  ctx.fillStyle = '#fff';
  ctx.font = '13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`👥 ${empire.population}  ⚔️ ${empire.military}  💰 ${empire.economy}  🎭 ${empire.culture}`, canvas.width / 2, 95);

  // Buildings
  BUILDINGS.forEach((bld, i) => {
    const y = 130 + i * 70;
    const canAfford = bld.gem ? gems >= bld.cost : coins >= bld.cost;

    ctx.fillStyle = canAfford ? '#1e3a5f' : '#0d1b2a';
    ctx.fillRect(20, y, canvas.width - 40, 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(bld.name, 35, y + 25);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    ctx.fillText(bld.desc, 35, y + 45);

    ctx.fillStyle = bld.gem ? '#a78bfa' : '#ffd700';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${bld.gem ? '💎' : '💰'} ${bld.cost}`, canvas.width - 35, y + 35);
  });
}

// Main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'territories': drawTerritories(); break;
    case 'conquest': drawConquest(); break;
    case 'victory': drawVictory(); break;
    case 'build': drawBuild(); break;
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
    // Build
    if (x > canvas.width - 85 && y > canvas.height - 55) {
      gameState = 'build';
      return;
    }

    // Continent selection
    const cardHeight = 70;
    const startY = 130;
    CONTINENTS.forEach((cont, i) => {
      const cy = startY + i * (cardHeight + 10) - continentScroll;
      if (y > cy && y < cy + cardHeight && x > 25 && x < canvas.width - 25) {
        if (level >= cont.unlockLevel) {
          currentContinent = i;
          territoryScroll = 0;
          gameState = 'territories';
        }
      }
    });
  } else if (gameState === 'territories') {
    // Back
    if (x < 85 && y < 44) {
      gameState = 'menu';
      return;
    }

    // Territory selection
    const cont = CONTINENTS[currentContinent];
    const cols = 5;
    const btnSize = 50;
    const gap = 8;
    const startY = 75;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < cont.territories; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - territoryScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((territoriesConquered[cont.id] || 0) >= i) {
          startConquest(currentContinent, i);
        }
        break;
      }
    }
  } else if (gameState === 'conquest') {
    if (!questionAnswered) {
      // Answers
      const answerY = 205;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 55;
        if (y > ay && y < ay + 45 && x > 35 && x < canvas.width - 35) {
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
      // Continue
      if (y > canvas.height - 75 && y < canvas.height - 25) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 45 + currentTerritory * 5;
          coins += reward;
          addXP(25 + currentTerritory * 2);
          empire.territory++;

          if (!territoriesConquered[currentContinent] || territoriesConquered[currentContinent] <= currentTerritory) {
            territoriesConquered[currentContinent] = currentTerritory + 1;
          }

          saveGame();
          gameState = 'victory';
        } else {
          currentQuestion = generateQuestion(currentContinent);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'victory') {
    if (y > canvas.height / 2 + 80 && y < canvas.height / 2 + 130) {
      gameState = 'territories';
    }
  } else if (gameState === 'build') {
    // Back
    if (x < 85 && y < 44) {
      gameState = 'menu';
      return;
    }

    // Buildings
    BUILDINGS.forEach((bld, i) => {
      const by = 130 + i * 70;
      if (y > by && y < by + 60 && x > 20 && x < canvas.width - 20) {
        const canAfford = bld.gem ? gems >= bld.cost : coins >= bld.cost;
        if (canAfford) {
          if (bld.gem) gems -= bld.cost;
          else coins -= bld.cost;
          if (bld.effect) bld.effect();
          createParticles(x, y, '#7c3aed', 20);
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
    if (gameState === 'menu') continentScroll += delta;
    else if (gameState === 'territories') territoryScroll += delta;
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
  if (gameState === 'menu') continentScroll += e.deltaY * 0.5;
  else if (gameState === 'territories') territoryScroll += e.deltaY * 0.5;
});

// Init
loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
