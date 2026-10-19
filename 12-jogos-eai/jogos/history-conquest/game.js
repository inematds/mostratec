// History Conquest - Strategy through historical eras
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

// Eras (worlds)
const ERAS = [
  { id: 0, name: 'Pré-História', color: '#8b7355', icon: '🦣', unlockLevel: 1, battles: 50 },
  { id: 1, name: 'Antiguidade', color: '#d4af37', icon: '🏛️', unlockLevel: 5, battles: 50 },
  { id: 2, name: 'Egito Antigo', color: '#c9a227', icon: '🔺', unlockLevel: 10, battles: 50 },
  { id: 3, name: 'Grécia Antiga', color: '#4169e1', icon: '⚔️', unlockLevel: 15, battles: 50 },
  { id: 4, name: 'Roma Imperial', color: '#8b0000', icon: '🦅', unlockLevel: 20, battles: 50 },
  { id: 5, name: 'Idade Média', color: '#556b2f', icon: '🏰', unlockLevel: 30, battles: 50 },
  { id: 6, name: 'Renascimento', color: '#9932cc', icon: '🎨', unlockLevel: 40, battles: 50 },
  { id: 7, name: 'Era das Navegações', color: '#1e90ff', icon: '⛵', unlockLevel: 50, battles: 50 },
  { id: 8, name: 'Revolução Industrial', color: '#2f4f4f', icon: '🏭', unlockLevel: 60, battles: 50 },
  { id: 9, name: 'Era Moderna', color: '#ff6347', icon: '🌍', unlockLevel: 70, battles: 50 }
];

// Current progress
let currentEra = 0;
let currentBattle = 0;
let battlesCompleted = {};
let eraScroll = 0;
let battleScroll = 0;

// Battle state
let playerArmy = [];
let enemyArmy = [];
let battlePhase = 'deploy';
let selectedUnit = null;
let battleTimer = 60;
let playerResources = 100;

// Units
const UNIT_TYPES = [
  { id: 'warrior', name: 'Guerreiro', cost: 20, hp: 100, attack: 15, speed: 2, icon: '⚔️' },
  { id: 'archer', name: 'Arqueiro', cost: 25, hp: 60, attack: 20, speed: 1.5, range: 150, icon: '🏹' },
  { id: 'cavalry', name: 'Cavalaria', cost: 40, hp: 120, attack: 25, speed: 4, icon: '🐴' },
  { id: 'siege', name: 'Cerco', cost: 50, hp: 200, attack: 40, speed: 0.5, icon: '🪨' },
  { id: 'healer', name: 'Curandeiro', cost: 30, hp: 50, attack: 5, speed: 1, heal: 10, icon: '💚' }
];

// Owned units/upgrades
let ownedUpgrades = {
  attackBonus: 0,
  defenseBonus: 0,
  resourceBonus: 0,
  unitSlots: 5
};

// Shop items
const SHOP_ITEMS = [
  { id: 'attack1', name: 'Forja Militar', desc: '+10% Ataque', cost: 500, gem: false, effect: () => ownedUpgrades.attackBonus += 10 },
  { id: 'defense1', name: 'Muralhas', desc: '+10% Defesa', cost: 500, gem: false, effect: () => ownedUpgrades.defenseBonus += 10 },
  { id: 'resource1', name: 'Economia', desc: '+20 Recursos', cost: 800, gem: false, effect: () => ownedUpgrades.resourceBonus += 20 },
  { id: 'slots1', name: 'Expansão', desc: '+2 Unidades', cost: 20, gem: true, effect: () => ownedUpgrades.unitSlots += 2 },
  { id: 'attack2', name: 'Arsenal', desc: '+25% Ataque', cost: 50, gem: true, effect: () => ownedUpgrades.attackBonus += 25 },
  { id: 'defense2', name: 'Fortaleza', desc: '+25% Defesa', cost: 50, gem: true, effect: () => ownedUpgrades.defenseBonus += 25 }
];

// Questions database by era
const QUESTIONS = {
  0: [ // Pré-História
    { q: 'Qual período é caracterizado pelo uso de pedra lascada?', a: ['Paleolítico', 'Neolítico', 'Idade do Bronze', 'Idade do Ferro'], correct: 0 },
    { q: 'O que marcou a Revolução Neolítica?', a: ['Agricultura', 'Escrita', 'Metalurgia', 'Comércio'], correct: 0 },
    { q: 'Qual espécie humana pintou as cavernas de Lascaux?', a: ['Homo sapiens', 'Homo erectus', 'Neanderthal', 'Homo habilis'], correct: 0 },
    { q: 'O que é um dolmen?', a: ['Monumento megalítico', 'Ferramenta de pedra', 'Pintura rupestre', 'Arma primitiva'], correct: 0 },
    { q: 'Qual animal foi domesticado primeiro?', a: ['Cachorro', 'Cavalo', 'Vaca', 'Ovelha'], correct: 0 }
  ],
  1: [ // Antiguidade
    { q: 'Onde surgiu a escrita cuneiforme?', a: ['Mesopotâmia', 'Egito', 'China', 'Índia'], correct: 0 },
    { q: 'Quem foi Hamurabi?', a: ['Rei da Babilônia', 'Faraó egípcio', 'Filósofo grego', 'Imperador romano'], correct: 0 },
    { q: 'O que é o Código de Hamurabi?', a: ['Conjunto de leis', 'Livro sagrado', 'Tratado de paz', 'Mapa antigo'], correct: 0 },
    { q: 'Qual civilização inventou a roda?', a: ['Sumérios', 'Egípcios', 'Gregos', 'Romanos'], correct: 0 },
    { q: 'O que eram os zigurates?', a: ['Templos em degraus', 'Palácios reais', 'Mercados', 'Bibliotecas'], correct: 0 }
  ],
  2: [ // Egito Antigo
    { q: 'Qual faraó construiu a Grande Pirâmide?', a: ['Quéops', 'Tutancâmon', 'Ramsés II', 'Cleópatra'], correct: 0 },
    { q: 'O que é o processo de mumificação?', a: ['Preservação de corpos', 'Construção de pirâmides', 'Escrita hieroglífica', 'Adoração aos deuses'], correct: 0 },
    { q: 'Qual era o papel do Nilo para o Egito?', a: ['Irrigação e fertilidade', 'Defesa militar', 'Transporte apenas', 'Adoração religiosa'], correct: 0 },
    { q: 'Quem decifrou os hieróglifos?', a: ['Champollion', 'Howard Carter', 'Heródoto', 'Napoleão'], correct: 0 },
    { q: 'O que é a Pedra de Roseta?', a: ['Pedra com 3 escritas', 'Tumba real', 'Templo antigo', 'Amuleto sagrado'], correct: 0 }
  ],
  3: [ // Grécia Antiga
    { q: 'Qual filósofo foi mestre de Alexandre?', a: ['Aristóteles', 'Platão', 'Sócrates', 'Tales'], correct: 0 },
    { q: 'O que era a democracia ateniense?', a: ['Governo do povo', 'Governo de um rei', 'Governo militar', 'Governo religioso'], correct: 0 },
    { q: 'Qual guerra opôs Atenas e Esparta?', a: ['Guerra do Peloponeso', 'Guerras Médicas', 'Guerra de Troia', 'Guerra Púnica'], correct: 0 },
    { q: 'O que eram os Jogos Olímpicos antigos?', a: ['Competições esportivas religiosas', 'Batalhas entre cidades', 'Festivais de teatro', 'Mercados anuais'], correct: 0 },
    { q: 'Quem escreveu a Ilíada?', a: ['Homero', 'Sófocles', 'Eurípides', 'Aristófanes'], correct: 0 }
  ],
  4: [ // Roma Imperial
    { q: 'Quem foi o primeiro imperador romano?', a: ['Augusto', 'Júlio César', 'Nero', 'Trajano'], correct: 0 },
    { q: 'O que era o Coliseu?', a: ['Anfiteatro para espetáculos', 'Templo religioso', 'Palácio imperial', 'Mercado central'], correct: 0 },
    { q: 'Qual era a língua oficial do Império?', a: ['Latim', 'Grego', 'Etrusco', 'Púnico'], correct: 0 },
    { q: 'O que foram as estradas romanas?', a: ['Rede de vias pavimentadas', 'Aquedutos', 'Muralhas defensivas', 'Canais de irrigação'], correct: 0 },
    { q: 'Quando Roma caiu?', a: ['476 d.C.', '27 a.C.', '1453 d.C.', '800 d.C.'], correct: 0 }
  ],
  5: [ // Idade Média
    { q: 'O que era o feudalismo?', a: ['Sistema de terras e vassalagem', 'Forma de governo democrático', 'Sistema monetário', 'Religião medieval'], correct: 0 },
    { q: 'O que foram as Cruzadas?', a: ['Expedições religiosas militares', 'Invasões vikings', 'Guerras entre reinos', 'Peregrinações pacíficas'], correct: 0 },
    { q: 'Quem era Carlos Magno?', a: ['Imperador do Sacro Império', 'Papa medieval', 'Rei da Inglaterra', 'Sultão árabe'], correct: 0 },
    { q: 'O que foi a Peste Negra?', a: ['Pandemia de peste bubônica', 'Fome generalizada', 'Guerra religiosa', 'Crise econômica'], correct: 0 },
    { q: 'O que era um castelo medieval?', a: ['Fortaleza defensiva', 'Templo religioso', 'Mercado', 'Escola'], correct: 0 }
  ],
  6: [ // Renascimento
    { q: 'Onde surgiu o Renascimento?', a: ['Itália', 'França', 'Inglaterra', 'Alemanha'], correct: 0 },
    { q: 'Quem pintou a Mona Lisa?', a: ['Leonardo da Vinci', 'Michelangelo', 'Rafael', 'Botticelli'], correct: 0 },
    { q: 'O que foi a Reforma Protestante?', a: ['Movimento religioso de Lutero', 'Renovação artística', 'Revolução política', 'Descoberta científica'], correct: 0 },
    { q: 'Quem escreveu "O Príncipe"?', a: ['Maquiavel', 'Dante', 'Petrarca', 'Boccaccio'], correct: 0 },
    { q: 'O que caracteriza o humanismo?', a: ['Valorização do ser humano', 'Teocentrismo', 'Feudalismo', 'Absolutismo'], correct: 0 }
  ],
  7: [ // Era das Navegações
    { q: 'Quem chegou ao Brasil em 1500?', a: ['Pedro Álvares Cabral', 'Cristóvão Colombo', 'Vasco da Gama', 'Fernão de Magalhães'], correct: 0 },
    { q: 'O que foi o Tratado de Tordesilhas?', a: ['Divisão de terras entre Portugal e Espanha', 'Aliança militar', 'Acordo comercial', 'Tratado de paz'], correct: 0 },
    { q: 'Quem fez a primeira viagem de circunavegação?', a: ['Fernão de Magalhães/Elcano', 'Colombo', 'Cabral', 'Vasco da Gama'], correct: 0 },
    { q: 'O que buscavam as especiarias?', a: ['Condimentos e conservantes', 'Ouro e prata', 'Escravos', 'Armas'], correct: 0 },
    { q: 'Qual era a Escola de Sagres?', a: ['Centro de navegação', 'Universidade medieval', 'Mosteiro', 'Fortaleza'], correct: 0 }
  ],
  8: [ // Revolução Industrial
    { q: 'Onde começou a Revolução Industrial?', a: ['Inglaterra', 'França', 'Alemanha', 'EUA'], correct: 0 },
    { q: 'Quem inventou a máquina a vapor?', a: ['James Watt', 'Thomas Edison', 'Graham Bell', 'Henry Ford'], correct: 0 },
    { q: 'O que era o ludismo?', a: ['Destruição de máquinas', 'Movimento artístico', 'Sistema político', 'Religião'], correct: 0 },
    { q: 'O que foi o êxodo rural?', a: ['Migração para cidades', 'Volta ao campo', 'Colonização', 'Emigração'], correct: 0 },
    { q: 'Qual combustível moveu a 1ª Revolução?', a: ['Carvão', 'Petróleo', 'Eletricidade', 'Gás natural'], correct: 0 }
  ],
  9: [ // Era Moderna
    { q: 'Quando foi a Primeira Guerra Mundial?', a: ['1914-1918', '1939-1945', '1950-1953', '1961-1975'], correct: 0 },
    { q: 'O que foi a Guerra Fria?', a: ['Tensão EUA-URSS sem guerra direta', 'Guerra no Ártico', 'Conflito econômico', 'Guerra nuclear'], correct: 0 },
    { q: 'Quando caiu o Muro de Berlim?', a: ['1989', '1991', '1985', '1979'], correct: 0 },
    { q: 'O que foi a ONU?', a: ['Organização das Nações Unidas', 'Aliança militar', 'Bloco econômico', 'Tratado de paz'], correct: 0 },
    { q: 'O que caracteriza a globalização?', a: ['Integração mundial', 'Isolamento', 'Colonização', 'Feudalismo'], correct: 0 }
  ]
};

// Current battle question
let currentQuestion = null;
let questionAnswered = false;
let correctStreak = 0;

// Particles
let particles = [];

// Touch/Mouse
let touchStartY = 0;
let isDragging = false;

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load game
function loadGame() {
  const saved = localStorage.getItem('historyConquest');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentEra = data.currentEra || 0;
    battlesCompleted = data.battlesCompleted || {};
    ownedUpgrades = data.ownedUpgrades || ownedUpgrades;
  }
}

// Save game
function saveGame() {
  localStorage.setItem('historyConquest', JSON.stringify({
    coins, gems, xp, level, currentEra, battlesCompleted, ownedUpgrades
  }));
}

// Add XP
function addXP(amount) {
  xp += amount;
  const xpNeeded = level * 100;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    gems += 5;
    createParticles(canvas.width / 2, canvas.height / 2, '#ffd700', 30);
  }
  saveGame();
}

// Create particles
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

// Update particles
function updateParticles() {
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= 0.02;
    return p.life > 0;
  });
}

// Draw particles
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

// Generate question for era
function generateQuestion(era) {
  const questions = QUESTIONS[era] || QUESTIONS[0];
  return questions[Math.floor(Math.random() * questions.length)];
}

// Start battle
function startBattle(era, battle) {
  currentEra = era;
  currentBattle = battle;
  gameState = 'battle';
  battlePhase = 'question';
  currentQuestion = generateQuestion(era);
  questionAnswered = false;
  playerResources = 100 + ownedUpgrades.resourceBonus;
  playerArmy = [];
  enemyArmy = [];
  battleTimer = 60;

  // Generate enemy army based on difficulty
  const difficulty = Math.floor(battle / 10) + 1;
  const enemyCount = 3 + difficulty;
  for (let i = 0; i < enemyCount; i++) {
    const unitType = UNIT_TYPES[Math.floor(Math.random() * UNIT_TYPES.length)];
    enemyArmy.push({
      ...unitType,
      x: canvas.width - 100 - Math.random() * 100,
      y: 150 + Math.random() * (canvas.height - 300),
      currentHp: unitType.hp * (1 + difficulty * 0.1)
    });
  }
}

// Draw menu
function drawMenu() {
  // Background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#2d1810');
  gradient.addColorStop(1, '#1a0f08');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 48px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('⚔️ HISTORY CONQUEST ⚔️', canvas.width / 2, 80);

  // Stats bar
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 280, 40);
  ctx.fillStyle = '#ffd700';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰 ${coins}  💎 ${gems}  ⭐ Nv.${level}  XP: ${xp}/${level * 100}`, 20, 35);

  // Era selection
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('Escolha uma Era', canvas.width / 2, 140);

  // Era cards
  const cardHeight = 80;
  const startY = 170;
  const maxScroll = Math.max(0, ERAS.length * (cardHeight + 10) - (canvas.height - startY - 100));
  eraScroll = Math.max(0, Math.min(eraScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(20, startY, canvas.width - 40, canvas.height - startY - 80);
  ctx.clip();

  ERAS.forEach((era, i) => {
    const y = startY + i * (cardHeight + 10) - eraScroll;
    if (y > startY - cardHeight && y < canvas.height - 80) {
      const unlocked = level >= era.unlockLevel;
      const completed = (battlesCompleted[era.id] || 0);

      // Card background
      ctx.fillStyle = unlocked ? era.color : '#333';
      ctx.globalAlpha = unlocked ? 1 : 0.5;
      ctx.fillRect(30, y, canvas.width - 60, cardHeight);

      // Icon
      ctx.font = '40px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(era.icon, 45, y + 52);

      // Name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Georgia';
      ctx.fillText(era.name, 100, y + 35);

      // Progress
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ddd';
      ctx.fillText(`${completed}/${era.battles} batalhas`, 100, y + 58);

      // Progress bar
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(250, y + 45, 100, 15);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(250, y + 45, (completed / era.battles) * 100, 15);

      // Lock icon
      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Nv.${era.unlockLevel}`, canvas.width - 50, y + 50);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();

  // Shop button
  ctx.fillStyle = '#9333ea';
  ctx.fillRect(canvas.width - 120, canvas.height - 60, 100, 45);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 LOJA', canvas.width - 70, canvas.height - 30);
}

// Draw era battles
function drawEraBattles() {
  const era = ERAS[currentEra];

  // Background
  ctx.fillStyle = era.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Darker overlay
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`${era.icon} ${era.name}`, canvas.width / 2, 50);

  // Back button
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(20, 15, 80, 35);
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.fillText('← Voltar', 60, 38);

  // Battle grid
  const cols = 5;
  const buttonSize = 55;
  const gap = 10;
  const startY = 90;
  const gridWidth = cols * (buttonSize + gap);
  const startX = (canvas.width - gridWidth) / 2;

  const maxScroll = Math.max(0, Math.ceil(era.battles / cols) * (buttonSize + gap) - (canvas.height - startY - 20));
  battleScroll = Math.max(0, Math.min(battleScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < era.battles; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (buttonSize + gap);
    const y = startY + row * (buttonSize + gap) - battleScroll;

    if (y > startY - buttonSize && y < canvas.height) {
      const completed = (battlesCompleted[era.id] || 0) > i;
      const available = (battlesCompleted[era.id] || 0) >= i;

      // Button
      ctx.fillStyle = completed ? '#22c55e' : (available ? era.color : '#444');
      ctx.fillRect(x, y, buttonSize, buttonSize);

      // Border
      ctx.strokeStyle = completed ? '#4ade80' : '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, buttonSize, buttonSize);

      // Number/Star
      ctx.fillStyle = '#fff';
      ctx.font = completed ? '24px Arial' : 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(completed ? '⭐' : (i + 1).toString(), x + buttonSize/2, y + buttonSize/2 + 6);
    }
  }

  ctx.restore();
}

// Draw battle
function drawBattle() {
  const era = ERAS[currentEra];

  // Background
  ctx.fillStyle = era.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, 50);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${era.icon} ${era.name} - Batalha ${currentBattle + 1}`, canvas.width / 2, 32);

  // Resources
  ctx.textAlign = 'left';
  ctx.fillText(`⚡ ${playerResources}`, 20, 32);
  ctx.textAlign = 'right';
  ctx.fillText(`⏱️ ${Math.ceil(battleTimer)}s`, canvas.width - 20, 32);

  if (battlePhase === 'question') {
    drawQuestion();
  } else if (battlePhase === 'deploy' || battlePhase === 'fighting') {
    drawBattlefield();
  } else if (battlePhase === 'victory' || battlePhase === 'defeat') {
    drawBattleResult();
  }
}

// Draw question
function drawQuestion() {
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.fillRect(50, 100, canvas.width - 100, canvas.height - 200);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 24px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('📜 Pergunta de História', canvas.width / 2, 150);

  // Question
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  const words = currentQuestion.q.split(' ');
  let line = '';
  let y = 200;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > canvas.width - 150) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 25;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, canvas.width / 2, y);

  // Answers
  const answerY = y + 60;
  currentQuestion.a.forEach((answer, i) => {
    const ay = answerY + i * 55;
    ctx.fillStyle = questionAnswered ?
      (i === currentQuestion.correct ? '#22c55e' : '#ef4444') : '#4a5568';
    ctx.fillRect(80, ay, canvas.width - 160, 45);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(answer, canvas.width / 2, ay + 28);
  });

  if (questionAnswered) {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(canvas.width / 2 - 80, canvas.height - 130, 160, 45);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 100);
  }
}

// Draw battlefield
function drawBattlefield() {
  // Ground
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

  // Draw units
  playerArmy.forEach(unit => {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(unit.icon, unit.x, unit.y);

    // HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(unit.x - 20, unit.y - 35, 40, 6);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(unit.x - 20, unit.y - 35, (unit.currentHp / unit.hp) * 40, 6);
  });

  enemyArmy.forEach(unit => {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(unit.icon, unit.x, unit.y);

    // HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(unit.x - 20, unit.y - 35, 40, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(unit.x - 20, unit.y - 35, (unit.currentHp / unit.hp) * 40, 6);
  });

  // Unit selection panel
  if (battlePhase === 'deploy') {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Unidades: ${playerArmy.length}/${ownedUpgrades.unitSlots}`, canvas.width / 2, canvas.height - 85);

    const unitWidth = 70;
    const startX = (canvas.width - UNIT_TYPES.length * unitWidth) / 2;

    UNIT_TYPES.forEach((unit, i) => {
      const x = startX + i * unitWidth;
      const canAfford = playerResources >= unit.cost && playerArmy.length < ownedUpgrades.unitSlots;

      ctx.fillStyle = canAfford ? '#4a5568' : '#2d3748';
      ctx.fillRect(x, canvas.height - 75, 60, 70);

      ctx.font = '24px Arial';
      ctx.fillText(unit.icon, x + 30, canvas.height - 45);

      ctx.font = '10px Arial';
      ctx.fillStyle = canAfford ? '#fff' : '#666';
      ctx.fillText(`⚡${unit.cost}`, x + 30, canvas.height - 15);
    });

    // Start battle button
    if (playerArmy.length > 0) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(canvas.width - 110, canvas.height - 70, 100, 40);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('ATACAR!', canvas.width - 60, canvas.height - 45);
    }
  }
}

// Draw battle result
function drawBattleResult() {
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const isVictory = battlePhase === 'victory';

  ctx.fillStyle = isVictory ? '#22c55e' : '#ef4444';
  ctx.font = 'bold 48px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(isVictory ? '🏆 VITÓRIA!' : '💀 DERROTA', canvas.width / 2, canvas.height / 2 - 50);

  if (isVictory) {
    const reward = 50 + currentBattle * 5;
    ctx.fillStyle = '#ffd700';
    ctx.font = '24px Arial';
    ctx.fillText(`+${reward} moedas  +${30 + currentBattle * 2} XP`, canvas.width / 2, canvas.height / 2 + 20);
  }

  ctx.fillStyle = '#4a5568';
  ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 60, 160, 45);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 90);
}

// Draw shop
function drawShop() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#9333ea';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 LOJA', canvas.width / 2, 50);

  // Back button
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(20, 15, 80, 35);
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.fillText('← Voltar', 60, 38);

  // Currency
  ctx.fillStyle = '#ffd700';
  ctx.font = '18px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`💰 ${coins}  💎 ${gems}`, canvas.width - 30, 38);

  // Items
  SHOP_ITEMS.forEach((item, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = 30 + col * (canvas.width / 2 - 20);
    const y = 100 + row * 100;

    const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;

    ctx.fillStyle = canAfford ? '#2d2d5e' : '#1a1a3e';
    ctx.fillRect(x, y, canvas.width / 2 - 50, 85);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, x + 15, y + 28);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText(item.desc, x + 15, y + 50);

    ctx.fillStyle = item.gem ? '#a78bfa' : '#ffd700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`${item.gem ? '💎' : '💰'} ${item.cost}`, x + 15, y + 72);
  });
}

// Update battle
function updateBattle(dt) {
  if (battlePhase === 'fighting') {
    battleTimer -= dt;

    // Move and attack
    playerArmy.forEach(unit => {
      // Find nearest enemy
      let nearestEnemy = null;
      let nearestDist = Infinity;
      enemyArmy.forEach(enemy => {
        const dist = Math.hypot(enemy.x - unit.x, enemy.y - unit.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = enemy;
        }
      });

      if (nearestEnemy) {
        const attackRange = unit.range || 50;
        if (nearestDist > attackRange) {
          // Move towards enemy
          const angle = Math.atan2(nearestEnemy.y - unit.y, nearestEnemy.x - unit.x);
          unit.x += Math.cos(angle) * unit.speed;
          unit.y += Math.sin(angle) * unit.speed;
        } else {
          // Attack
          const damage = unit.attack * (1 + ownedUpgrades.attackBonus / 100);
          nearestEnemy.currentHp -= damage * dt;
        }
      }
    });

    enemyArmy.forEach(unit => {
      let nearestPlayer = null;
      let nearestDist = Infinity;
      playerArmy.forEach(player => {
        const dist = Math.hypot(player.x - unit.x, player.y - unit.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestPlayer = player;
        }
      });

      if (nearestPlayer) {
        const attackRange = unit.range || 50;
        if (nearestDist > attackRange) {
          const angle = Math.atan2(nearestPlayer.y - unit.y, nearestPlayer.x - unit.x);
          unit.x += Math.cos(angle) * unit.speed;
          unit.y += Math.sin(angle) * unit.speed;
        } else {
          const damage = unit.attack * (1 - ownedUpgrades.defenseBonus / 200);
          nearestPlayer.currentHp -= damage * dt;
        }
      }
    });

    // Remove dead units
    playerArmy = playerArmy.filter(u => u.currentHp > 0);
    enemyArmy = enemyArmy.filter(u => u.currentHp > 0);

    // Check victory/defeat
    if (enemyArmy.length === 0) {
      battlePhase = 'victory';
      const reward = 50 + currentBattle * 5;
      coins += reward;
      addXP(30 + currentBattle * 2);
      if (!battlesCompleted[currentEra] || battlesCompleted[currentEra] <= currentBattle) {
        battlesCompleted[currentEra] = currentBattle + 1;
      }
      createParticles(canvas.width / 2, canvas.height / 2, '#ffd700', 50);
      saveGame();
    } else if (playerArmy.length === 0 || battleTimer <= 0) {
      battlePhase = 'defeat';
    }
  }
}

// Main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'era': drawEraBattles(); break;
    case 'battle': drawBattle(); break;
    case 'shop': drawShop(); break;
  }

  drawParticles();
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (gameState === 'battle') {
    updateBattle(dt);
  }
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}

// Handle click/tap
function handleClick(x, y) {
  if (gameState === 'menu') {
    // Shop button
    if (x > canvas.width - 120 && y > canvas.height - 60) {
      gameState = 'shop';
      return;
    }

    // Era selection
    const cardHeight = 80;
    const startY = 170;
    ERAS.forEach((era, i) => {
      const cardY = startY + i * (cardHeight + 10) - eraScroll;
      if (y > cardY && y < cardY + cardHeight && x > 30 && x < canvas.width - 30) {
        if (level >= era.unlockLevel) {
          currentEra = i;
          battleScroll = 0;
          gameState = 'era';
        }
      }
    });
  } else if (gameState === 'era') {
    // Back button
    if (x < 100 && y < 50) {
      gameState = 'menu';
      return;
    }

    // Battle selection
    const era = ERAS[currentEra];
    const cols = 5;
    const buttonSize = 55;
    const gap = 10;
    const startY = 90;
    const gridWidth = cols * (buttonSize + gap);
    const startX = (canvas.width - gridWidth) / 2;

    for (let i = 0; i < era.battles; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (buttonSize + gap);
      const by = startY + row * (buttonSize + gap) - battleScroll;

      if (x > bx && x < bx + buttonSize && y > by && y < by + buttonSize) {
        if ((battlesCompleted[currentEra] || 0) >= i) {
          startBattle(currentEra, i);
        }
        break;
      }
    }
  } else if (gameState === 'battle') {
    if (battlePhase === 'question' && !questionAnswered) {
      // Check answer clicks
      const words = currentQuestion.q.split(' ');
      let answerY = 200;
      words.forEach(word => {
        if (ctx.measureText(word).width > canvas.width - 150) answerY += 25;
      });
      answerY += 60;

      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 55;
        if (y > ay && y < ay + 45 && x > 80 && x < canvas.width - 80) {
          questionAnswered = true;
          if (i === currentQuestion.correct) {
            correctStreak++;
            playerResources += 30 + correctStreak * 5;
            createParticles(x, y, '#22c55e', 20);
          } else {
            correctStreak = 0;
          }
        }
      });
    } else if (battlePhase === 'question' && questionAnswered) {
      if (y > canvas.height - 130 && y < canvas.height - 85) {
        battlePhase = 'deploy';
      }
    } else if (battlePhase === 'deploy') {
      // Unit purchase
      const unitWidth = 70;
      const startX = (canvas.width - UNIT_TYPES.length * unitWidth) / 2;

      UNIT_TYPES.forEach((unit, i) => {
        const ux = startX + i * unitWidth;
        if (x > ux && x < ux + 60 && y > canvas.height - 75) {
          if (playerResources >= unit.cost && playerArmy.length < ownedUpgrades.unitSlots) {
            playerResources -= unit.cost;
            playerArmy.push({
              ...unit,
              x: 100 + Math.random() * 100,
              y: 150 + Math.random() * (canvas.height - 300),
              currentHp: unit.hp
            });
          }
        }
      });

      // Start battle
      if (x > canvas.width - 110 && y > canvas.height - 70 && y < canvas.height - 30 && playerArmy.length > 0) {
        battlePhase = 'fighting';
      }
    } else if (battlePhase === 'victory' || battlePhase === 'defeat') {
      if (y > canvas.height / 2 + 60 && y < canvas.height / 2 + 105) {
        gameState = 'era';
      }
    }
  } else if (gameState === 'shop') {
    // Back button
    if (x < 100 && y < 50) {
      gameState = 'menu';
      return;
    }

    // Item purchase
    SHOP_ITEMS.forEach((item, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const ix = 30 + col * (canvas.width / 2 - 20);
      const iy = 100 + row * 100;

      if (x > ix && x < ix + canvas.width / 2 - 50 && y > iy && y < iy + 85) {
        const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;
        if (canAfford) {
          if (item.gem) gems -= item.cost;
          else coins -= item.cost;
          item.effect();
          createParticles(x, y, '#9333ea', 20);
          saveGame();
        }
      }
    });
  }
}

// Event listeners
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
  const deltaY = touchStartY - touchY;

  if (Math.abs(deltaY) > 5) {
    isDragging = true;
    if (gameState === 'menu') {
      eraScroll += deltaY;
    } else if (gameState === 'era') {
      battleScroll += deltaY;
    }
    touchStartY = touchY;
  }
});

canvas.addEventListener('touchend', (e) => {
  if (!isDragging && e.changedTouches.length > 0) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    handleClick(touch.clientX - rect.left, touch.clientY - rect.top);
  }
});

// Mouse wheel scroll
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (gameState === 'menu') {
    eraScroll += e.deltaY * 0.5;
  } else if (gameState === 'era') {
    battleScroll += e.deltaY * 0.5;
  }
});

// Initialize
loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
