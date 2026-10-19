// Biology Explorer - Cells, DNA, Ecosystems
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

// Biology Areas (worlds)
const AREAS = [
  { id: 0, name: 'Citologia', color: '#7c3aed', icon: '🔬', unlockLevel: 1, missions: 50 },
  { id: 1, name: 'Genética', color: '#2563eb', icon: '🧬', unlockLevel: 5, missions: 50 },
  { id: 2, name: 'Botânica', color: '#16a34a', icon: '🌿', unlockLevel: 10, missions: 50 },
  { id: 3, name: 'Zoologia', color: '#ea580c', icon: '🦁', unlockLevel: 15, missions: 50 },
  { id: 4, name: 'Anatomia', color: '#dc2626', icon: '🫀', unlockLevel: 20, missions: 50 },
  { id: 5, name: 'Fisiologia', color: '#0891b2', icon: '🧠', unlockLevel: 30, missions: 50 },
  { id: 6, name: 'Ecologia', color: '#15803d', icon: '🌍', unlockLevel: 40, missions: 50 },
  { id: 7, name: 'Evolução', color: '#7c2d12', icon: '🦴', unlockLevel: 50, missions: 50 },
  { id: 8, name: 'Microbiologia', color: '#4f46e5', icon: '🦠', unlockLevel: 60, missions: 50 },
  { id: 9, name: 'Biotecnologia', color: '#0d9488', icon: '⚗️', unlockLevel: 70, missions: 50 }
];

// Progress
let currentArea = 0;
let currentMission = 0;
let missionsCompleted = {};
let areaScroll = 0;
let missionScroll = 0;

// Mission state
let missionPhase = 'question';
let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;

// Lab equipment
let labEquipment = {
  microscope: 1,
  centrifuge: 0,
  pcr: 0,
  sequencer: 0,
  spectrometer: 0
};

// Specimen collection
let specimens = {};
let totalSpecimens = 0;

// Questions database
const QUESTIONS = {
  0: [ // Citologia
    { q: 'Qual organela é responsável pela respiração celular?', a: ['Mitocôndria', 'Ribossomo', 'Lisossomo', 'Complexo de Golgi'], correct: 0 },
    { q: 'O que é a membrana plasmática?', a: ['Envoltório celular seletivo', 'Núcleo da célula', 'Organela de síntese', 'Estrutura de suporte'], correct: 0 },
    { q: 'Qual estrutura contém o material genético?', a: ['Núcleo', 'Citoplasma', 'Membrana', 'Ribossomo'], correct: 0 },
    { q: 'O que são ribossomos?', a: ['Síntese de proteínas', 'Digestão celular', 'Produção de ATP', 'Armazenamento'], correct: 0 },
    { q: 'Qual a função do Complexo de Golgi?', a: ['Processamento e secreção', 'Respiração celular', 'Fotossíntese', 'Divisão celular'], correct: 0 },
    { q: 'O que são lisossomos?', a: ['Digestão intracelular', 'Síntese de lipídios', 'Produção de energia', 'Suporte estrutural'], correct: 0 }
  ],
  1: [ // Genética
    { q: 'O que é DNA?', a: ['Ácido desoxirribonucleico', 'Ácido ribonucleico', 'Proteína celular', 'Carboidrato complexo'], correct: 0 },
    { q: 'Quantos cromossomos tem uma célula humana?', a: ['46', '23', '48', '44'], correct: 0 },
    { q: 'O que é um gene?', a: ['Sequência de DNA', 'Tipo de proteína', 'Organela celular', 'Membrana nuclear'], correct: 0 },
    { q: 'Quem descobriu a estrutura do DNA?', a: ['Watson e Crick', 'Mendel', 'Darwin', 'Pasteur'], correct: 0 },
    { q: 'O que é um alelo?', a: ['Versão de um gene', 'Tipo de célula', 'Proteína estrutural', 'Organela'], correct: 0 },
    { q: 'O que determina genótipo dominante?', a: ['Letra maiúscula (AA/Aa)', 'Letra minúscula (aa)', 'Número par', 'Cromossomo X'], correct: 0 }
  ],
  2: [ // Botânica
    { q: 'Onde ocorre a fotossíntese?', a: ['Cloroplastos', 'Mitocôndrias', 'Núcleo', 'Vacúolo'], correct: 0 },
    { q: 'O que é o xilema?', a: ['Transporte de água/seiva bruta', 'Transporte de seiva elaborada', 'Tecido de sustentação', 'Tecido de revestimento'], correct: 0 },
    { q: 'Qual é a função das raízes?', a: ['Absorção e fixação', 'Fotossíntese', 'Reprodução', 'Transpiração'], correct: 0 },
    { q: 'O que são estômatos?', a: ['Poros para trocas gasosas', 'Células reprodutivas', 'Vasos condutores', 'Tecido de proteção'], correct: 0 },
    { q: 'O que é floema?', a: ['Transporte de seiva elaborada', 'Transporte de água', 'Fotossíntese', 'Respiração'], correct: 0 }
  ],
  3: [ // Zoologia
    { q: 'O que são vertebrados?', a: ['Animais com coluna vertebral', 'Animais sem ossos', 'Animais aquáticos', 'Animais microscópicos'], correct: 0 },
    { q: 'Qual classe pertencem os sapos?', a: ['Anfíbios', 'Répteis', 'Mamíferos', 'Peixes'], correct: 0 },
    { q: 'O que caracteriza os mamíferos?', a: ['Glândulas mamárias e pelos', 'Escamas e sangue frio', 'Penas e asas', 'Pele úmida'], correct: 0 },
    { q: 'O que são artrópodes?', a: ['Exoesqueleto e patas articuladas', 'Corpo mole sem ossos', 'Animais de sangue quente', 'Vertebrados marinhos'], correct: 0 },
    { q: 'Qual filo pertencem as águas-vivas?', a: ['Cnidários', 'Moluscos', 'Anelídeos', 'Equinodermos'], correct: 0 }
  ],
  4: [ // Anatomia
    { q: 'Quantos ossos tem o corpo humano adulto?', a: ['206', '300', '150', '250'], correct: 0 },
    { q: 'Qual o maior órgão do corpo?', a: ['Pele', 'Fígado', 'Pulmão', 'Cérebro'], correct: 0 },
    { q: 'O que é o coração?', a: ['Músculo cardíaco', 'Órgão digestivo', 'Glândula endócrina', 'Tecido nervoso'], correct: 0 },
    { q: 'Onde são produzidas as hemácias?', a: ['Medula óssea', 'Fígado', 'Baço', 'Rins'], correct: 0 },
    { q: 'Qual a função dos rins?', a: ['Filtração do sangue', 'Digestão', 'Respiração', 'Circulação'], correct: 0 }
  ],
  5: [ // Fisiologia
    { q: 'O que é homeostase?', a: ['Equilíbrio interno', 'Divisão celular', 'Reprodução', 'Digestão'], correct: 0 },
    { q: 'Como funciona a respiração celular?', a: ['Glicose + O2 → ATP + CO2', 'CO2 + H2O → Glicose', 'Proteína → Aminoácidos', 'ATP → ADP'], correct: 0 },
    { q: 'O que são hormônios?', a: ['Mensageiros químicos', 'Células de defesa', 'Proteínas estruturais', 'Enzimas digestivas'], correct: 0 },
    { q: 'Qual glândula controla o metabolismo?', a: ['Tireoide', 'Pâncreas', 'Hipófise', 'Adrenal'], correct: 0 },
    { q: 'O que é sinapse?', a: ['Conexão entre neurônios', 'Divisão celular', 'Contração muscular', 'Filtração renal'], correct: 0 }
  ],
  6: [ // Ecologia
    { q: 'O que é uma cadeia alimentar?', a: ['Fluxo de energia entre seres', 'Tipo de reprodução', 'Ciclo da água', 'Migração animal'], correct: 0 },
    { q: 'O que são produtores?', a: ['Organismos autótrofos', 'Animais herbívoros', 'Decompositores', 'Consumidores'], correct: 0 },
    { q: 'O que é biodiversidade?', a: ['Variedade de espécies', 'Poluição ambiental', 'Extinção em massa', 'Reprodução animal'], correct: 0 },
    { q: 'O que é um ecossistema?', a: ['Comunidade + ambiente físico', 'Grupo de animais', 'Tipo de planta', 'Ciclo de vida'], correct: 0 },
    { q: 'O que é nicho ecológico?', a: ['Função do organismo no ambiente', 'Habitat de uma espécie', 'Tipo de alimentação', 'Comportamento social'], correct: 0 }
  ],
  7: [ // Evolução
    { q: 'Quem propôs a seleção natural?', a: ['Charles Darwin', 'Gregor Mendel', 'Louis Pasteur', 'Jean Lamarck'], correct: 0 },
    { q: 'O que é adaptação?', a: ['Característica favorável à sobrevivência', 'Mudança de habitat', 'Tipo de reprodução', 'Doença genética'], correct: 0 },
    { q: 'O que são fósseis?', a: ['Vestígios de seres antigos', 'Rochas vulcânicas', 'Minerais raros', 'Cristais naturais'], correct: 0 },
    { q: 'O que é especiação?', a: ['Formação de novas espécies', 'Extinção de espécies', 'Migração animal', 'Mutação genética'], correct: 0 },
    { q: 'O que é deriva genética?', a: ['Mudança aleatória de frequências', 'Seleção natural', 'Migração', 'Mutação'], correct: 0 }
  ],
  8: [ // Microbiologia
    { q: 'O que são bactérias?', a: ['Procariontes unicelulares', 'Eucariontes', 'Vírus', 'Fungos'], correct: 0 },
    { q: 'O que é um vírus?', a: ['Agente infeccioso acelular', 'Bactéria pequena', 'Célula animal', 'Fungo microscópico'], correct: 0 },
    { q: 'O que são antibióticos?', a: ['Substâncias contra bactérias', 'Vacinas', 'Vitaminas', 'Hormônios'], correct: 0 },
    { q: 'O que é uma vacina?', a: ['Imunização preventiva', 'Tratamento de doença', 'Antibiótico', 'Vitamina'], correct: 0 },
    { q: 'O que são fungos?', a: ['Eucariontes heterotróficos', 'Bactérias', 'Vírus', 'Plantas'], correct: 0 }
  ],
  9: [ // Biotecnologia
    { q: 'O que é transgênico?', a: ['Organismo com gene de outra espécie', 'Planta orgânica', 'Animal clonado', 'Célula mutante'], correct: 0 },
    { q: 'O que é PCR?', a: ['Reação em cadeia da polimerase', 'Proteína celular', 'Tipo de RNA', 'Enzima digestiva'], correct: 0 },
    { q: 'O que é clonagem?', a: ['Cópia genética idêntica', 'Mutação genética', 'Reprodução sexuada', 'Seleção natural'], correct: 0 },
    { q: 'O que é CRISPR?', a: ['Edição genética', 'Tipo de vírus', 'Proteína estrutural', 'Vacina'], correct: 0 },
    { q: 'O que são células-tronco?', a: ['Células indiferenciadas', 'Células mortas', 'Bactérias', 'Vírus'], correct: 0 }
  ]
};

// Lab specimens
const SPECIMEN_TYPES = {
  0: ['Célula animal', 'Célula vegetal', 'Mitocôndria', 'Cloroplasto', 'Núcleo'],
  1: ['DNA', 'RNA', 'Cromossomo', 'Gene', 'Plasmídeo'],
  2: ['Folha', 'Raiz', 'Caule', 'Flor', 'Semente'],
  3: ['Inseto', 'Crustáceo', 'Molusco', 'Anfíbio', 'Réptil'],
  4: ['Osso', 'Músculo', 'Sangue', 'Tecido nervoso', 'Pele'],
  5: ['Neurônio', 'Hemácia', 'Leucócito', 'Plaqueta', 'Hormônio'],
  6: ['Produtor', 'Consumidor', 'Decompositor', 'Parasita', 'Simbionte'],
  7: ['Fóssil', 'Âmbar', 'Vestígio', 'Pegada', 'Impressão'],
  8: ['Bactéria', 'Vírus', 'Fungo', 'Protozoário', 'Alga'],
  9: ['Plasmídeo', 'Vetor', 'Enzima', 'Anticorpo', 'Célula-tronco']
};

// Shop items
const SHOP_ITEMS = [
  { id: 'microscope', name: 'Microscópio +', desc: '+20% XP em Citologia', cost: 800, gem: false },
  { id: 'centrifuge', name: 'Centrífuga', desc: '+20% XP em Genética', cost: 1000, gem: false },
  { id: 'pcr', name: 'Máquina PCR', desc: '+30% XP em Biotec', cost: 50, gem: true },
  { id: 'sequencer', name: 'Sequenciador', desc: 'Desbloqueia bônus', cost: 100, gem: true },
  { id: 'specimen_pack', name: 'Pack Espécimes', desc: '5 espécimes aleatórios', cost: 500, gem: false },
  { id: 'lab_upgrade', name: 'Expansão Lab', desc: 'Mais equipamentos', cost: 75, gem: true }
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
  localStorage.setItem('biologyExplorer', JSON.stringify({
    coins, gems, xp, level, currentArea, missionsCompleted,
    labEquipment, specimens, totalSpecimens, streak
  }));
}

function loadGame() {
  const saved = localStorage.getItem('biologyExplorer');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentArea = data.currentArea || 0;
    missionsCompleted = data.missionsCompleted || {};
    labEquipment = data.labEquipment || labEquipment;
    specimens = data.specimens || {};
    totalSpecimens = data.totalSpecimens || 0;
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
function generateQuestion(area) {
  const questions = QUESTIONS[area] || QUESTIONS[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

// Start mission
function startMission(area, mission) {
  currentArea = area;
  currentMission = mission;
  currentQuestion = generateQuestion(area);
  questionAnswered = false;
  selectedAnswer = -1;
  missionPhase = 'question';
  gameState = 'mission';
}

// Draw menu
function drawMenu() {
  // Background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#134e4a');
  grad.addColorStop(1, '#042f2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🧬 BIOLOGY EXPLORER', canvas.width / 2, 70);

  // Stats
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 10, 280, 35);
  ctx.fillStyle = '#ffd700';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Nv.${level}  🔬${totalSpecimens}`, 20, 32);

  // Areas label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Áreas de Estudo', canvas.width / 2, 125);

  // Area cards
  const cardHeight = 75;
  const startY = 145;
  const maxScroll = Math.max(0, AREAS.length * (cardHeight + 10) - (canvas.height - startY - 80));
  areaScroll = Math.max(0, Math.min(areaScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(15, startY, canvas.width - 30, canvas.height - startY - 70);
  ctx.clip();

  AREAS.forEach((area, i) => {
    const y = startY + i * (cardHeight + 10) - areaScroll;
    if (y > startY - cardHeight && y < canvas.height - 70) {
      const unlocked = level >= area.unlockLevel;
      const completed = missionsCompleted[area.id] || 0;

      ctx.fillStyle = unlocked ? area.color : '#333';
      ctx.globalAlpha = unlocked ? 1 : 0.5;
      ctx.fillRect(25, y, canvas.width - 50, cardHeight);

      // Icon
      ctx.font = '40px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(area.icon, 40, y + 50);

      // Name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(area.name, 95, y + 32);

      // Progress
      ctx.font = '13px Arial';
      ctx.fillStyle = '#ddd';
      ctx.fillText(`${completed}/${area.missions} missões`, 95, y + 55);

      // Progress bar
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(200, y + 42, 100, 12);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(200, y + 42, (completed / area.missions) * 100, 12);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Nv.${area.unlockLevel}`, canvas.width - 45, y + 45);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();

  // Shop button
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(canvas.width - 90, canvas.height - 55, 75, 40);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 LOJA', canvas.width - 52, canvas.height - 30);

  // Lab button
  ctx.fillStyle = '#0891b2';
  ctx.fillRect(15, canvas.height - 55, 75, 40);
  ctx.fillStyle = '#fff';
  ctx.fillText('🔬 LAB', 52, canvas.height - 30);
}

// Draw missions
function drawMissions() {
  const area = AREAS[currentArea];

  ctx.fillStyle = area.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${area.icon} ${area.name}`, canvas.width / 2, 45);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText('← Voltar', 50, 33);

  // Mission grid
  const cols = 5;
  const btnSize = 50;
  const gap = 8;
  const startY = 80;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(area.missions / cols) * (btnSize + gap) - (canvas.height - startY - 20));
  missionScroll = Math.max(0, Math.min(missionScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < area.missions; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - missionScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (missionsCompleted[area.id] || 0) > i;
      const available = (missionsCompleted[area.id] || 0) >= i;

      ctx.fillStyle = completed ? '#22c55e' : (available ? area.color : '#444');
      ctx.fillRect(x, y, btnSize, btnSize);

      ctx.strokeStyle = completed ? '#4ade80' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = completed ? '22px Arial' : 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(completed ? '🧬' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 6);
    }
  }

  ctx.restore();
}

// Draw mission
function drawMission() {
  const area = AREAS[currentArea];

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = area.color;
  ctx.fillRect(0, 0, canvas.width, 55);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${area.icon} ${area.name} - Missão ${currentMission + 1}`, canvas.width / 2, 35);

  // Streak
  if (streak > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 20, 35);
  }

  // Question
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(30, 80, canvas.width - 60, 120);

  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';

  // Word wrap question
  const words = currentQuestion.q.split(' ');
  let line = '';
  let y = 120;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > canvas.width - 100) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 25;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, canvas.width / 2, y);

  // Answers
  const answerY = 220;
  currentQuestion.a.forEach((answer, i) => {
    const ay = answerY + i * 55;
    let bgColor = '#2d2d4e';

    if (questionAnswered) {
      if (i === currentQuestion.correct) {
        bgColor = '#22c55e';
      } else if (i === selectedAnswer && i !== currentQuestion.correct) {
        bgColor = '#ef4444';
      }
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(40, ay, canvas.width - 80, 45);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(answer, canvas.width / 2, ay + 28);
  });

  // Continue button
  if (questionAnswered) {
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(canvas.width / 2 - 80, canvas.height - 80, 160, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 48);
  }
}

// Draw mission complete
function drawMissionComplete() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 MISSÃO COMPLETA!', canvas.width / 2, canvas.height / 2 - 60);

  const reward = 40 + currentMission * 5;
  ctx.fillStyle = '#ffd700';
  ctx.font = '22px Arial';
  ctx.fillText(`+${reward} moedas  +${25 + currentMission * 2} XP`, canvas.width / 2, canvas.height / 2);

  // Random specimen reward
  const specimenList = SPECIMEN_TYPES[currentArea] || SPECIMEN_TYPES[0];
  const newSpecimen = specimenList[Math.floor(Math.random() * specimenList.length)];
  ctx.fillStyle = '#a78bfa';
  ctx.font = '18px Arial';
  ctx.fillText(`Novo espécime: ${newSpecimen}`, canvas.width / 2, canvas.height / 2 + 40);

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 80, 160, 50);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 112);
}

// Draw lab
function drawLab() {
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0891b2';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🔬 LABORATÓRIO', canvas.width / 2, 45);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText('← Voltar', 50, 33);

  // Equipment
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Equipamentos:', 30, 90);

  const equipList = [
    { name: 'Microscópio', level: labEquipment.microscope, icon: '🔬' },
    { name: 'Centrífuga', level: labEquipment.centrifuge, icon: '⚙️' },
    { name: 'PCR', level: labEquipment.pcr, icon: '🧪' },
    { name: 'Sequenciador', level: labEquipment.sequencer, icon: '📊' },
    { name: 'Espectrômetro', level: labEquipment.spectrometer, icon: '📈' }
  ];

  equipList.forEach((eq, i) => {
    ctx.fillStyle = eq.level > 0 ? '#1e3a5f' : '#0d1b2a';
    ctx.fillRect(30, 110 + i * 60, canvas.width - 60, 50);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(eq.icon, 45, 145 + i * 60);

    ctx.font = '16px Arial';
    ctx.fillText(eq.name, 85, 140 + i * 60);

    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'right';
    ctx.fillText(`Nível ${eq.level}`, canvas.width - 45, 140 + i * 60);
  });

  // Specimens count
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Total de Espécimes: ${totalSpecimens}`, canvas.width / 2, canvas.height - 30);
}

// Draw shop
function drawShop() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 LOJA', canvas.width / 2, 45);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText('← Voltar', 50, 33);

  // Currency
  ctx.fillStyle = '#ffd700';
  ctx.font = '16px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`💰 ${coins}  💎 ${gems}`, canvas.width - 20, 33);

  // Items
  SHOP_ITEMS.forEach((item, i) => {
    const y = 75 + i * 75;
    const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;

    ctx.fillStyle = canAfford ? '#1e1e3e' : '#0a0a1e';
    ctx.fillRect(20, y, canvas.width - 40, 65);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 35, y + 25);

    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText(item.desc, 35, y + 48);

    ctx.fillStyle = item.gem ? '#a78bfa' : '#ffd700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${item.gem ? '💎' : '💰'} ${item.cost}`, canvas.width - 35, y + 38);
  });
}

// Main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'missions': drawMissions(); break;
    case 'mission': drawMission(); break;
    case 'complete': drawMissionComplete(); break;
    case 'lab': drawLab(); break;
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
    if (x > canvas.width - 90 && y > canvas.height - 55) {
      gameState = 'shop';
      return;
    }

    // Lab
    if (x < 90 && y > canvas.height - 55) {
      gameState = 'lab';
      return;
    }

    // Area selection
    const cardHeight = 75;
    const startY = 145;
    AREAS.forEach((area, i) => {
      const cy = startY + i * (cardHeight + 10) - areaScroll;
      if (y > cy && y < cy + cardHeight && x > 25 && x < canvas.width - 25) {
        if (level >= area.unlockLevel) {
          currentArea = i;
          missionScroll = 0;
          gameState = 'missions';
        }
      }
    });
  } else if (gameState === 'missions') {
    // Back
    if (x < 85 && y < 44) {
      gameState = 'menu';
      return;
    }

    // Mission selection
    const area = AREAS[currentArea];
    const cols = 5;
    const btnSize = 50;
    const gap = 8;
    const startY = 80;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < area.missions; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - missionScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((missionsCompleted[area.id] || 0) >= i) {
          startMission(currentArea, i);
        }
        break;
      }
    }
  } else if (gameState === 'mission') {
    if (!questionAnswered) {
      // Answer selection
      const answerY = 220;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 55;
        if (y > ay && y < ay + 45 && x > 40 && x < canvas.width - 40) {
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
      if (y > canvas.height - 80 && y < canvas.height - 30) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 40 + currentMission * 5;
          coins += reward;
          addXP(25 + currentMission * 2);

          // Add specimen
          totalSpecimens++;

          if (!missionsCompleted[currentArea] || missionsCompleted[currentArea] <= currentMission) {
            missionsCompleted[currentArea] = currentMission + 1;
          }

          saveGame();
          gameState = 'complete';
        } else {
          // Try again with new question
          currentQuestion = generateQuestion(currentArea);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'complete') {
    if (y > canvas.height / 2 + 80 && y < canvas.height / 2 + 130) {
      gameState = 'missions';
    }
  } else if (gameState === 'lab' || gameState === 'shop') {
    // Back
    if (x < 85 && y < 44) {
      gameState = 'menu';
      return;
    }

    // Shop purchases
    if (gameState === 'shop') {
      SHOP_ITEMS.forEach((item, i) => {
        const iy = 75 + i * 75;
        if (y > iy && y < iy + 65 && x > 20 && x < canvas.width - 20) {
          const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;
          if (canAfford) {
            if (item.gem) gems -= item.cost;
            else coins -= item.cost;

            // Apply effects
            if (item.id === 'microscope') labEquipment.microscope++;
            if (item.id === 'centrifuge') labEquipment.centrifuge++;
            if (item.id === 'pcr') labEquipment.pcr++;
            if (item.id === 'sequencer') labEquipment.sequencer++;
            if (item.id === 'specimen_pack') totalSpecimens += 5;

            createParticles(x, y, '#7c3aed', 20);
            saveGame();
          }
        }
      });
    }
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
    if (gameState === 'menu') areaScroll += delta;
    else if (gameState === 'missions') missionScroll += delta;
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
  if (gameState === 'menu') areaScroll += e.deltaY * 0.5;
  else if (gameState === 'missions') missionScroll += e.deltaY * 0.5;
});

// Init
loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
