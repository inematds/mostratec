// Economics Tycoon - Business simulation with economics education
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'menu';
let money = 10000;
let gems = 10;
let xp = 0;
let level = 1;

// Business sectors (worlds)
const SECTORS = [
  { id: 0, name: 'Microeconomia', color: '#16a34a', icon: '🏪', unlockLevel: 1, lessons: 50 },
  { id: 1, name: 'Macroeconomia', color: '#2563eb', icon: '🌍', unlockLevel: 5, lessons: 50 },
  { id: 2, name: 'Mercado Financeiro', color: '#dc2626', icon: '📈', unlockLevel: 10, lessons: 50 },
  { id: 3, name: 'Comércio Internacional', color: '#7c3aed', icon: '🚢', unlockLevel: 15, lessons: 50 },
  { id: 4, name: 'Empreendedorismo', color: '#ea580c', icon: '🚀', unlockLevel: 20, lessons: 50 },
  { id: 5, name: 'Marketing', color: '#ec4899', icon: '📢', unlockLevel: 30, lessons: 50 },
  { id: 6, name: 'Gestão de Pessoas', color: '#14b8a6', icon: '👥', unlockLevel: 40, lessons: 50 },
  { id: 7, name: 'Contabilidade', color: '#78716c', icon: '📊', unlockLevel: 50, lessons: 50 },
  { id: 8, name: 'Direito Empresarial', color: '#1e3a8a', icon: '⚖️', unlockLevel: 60, lessons: 50 },
  { id: 9, name: 'Economia Digital', color: '#8b5cf6', icon: '💻', unlockLevel: 70, lessons: 50 }
];

// Progress
let currentSector = 0;
let currentLesson = 0;
let lessonsCompleted = {};
let sectorScroll = 0;
let lessonScroll = 0;

// Business stats
let business = {
  revenue: 0,
  employees: 1,
  reputation: 50,
  marketShare: 1
};

// Questions database
const QUESTIONS = {
  0: [ // Microeconomia
    { q: 'O que é a Lei da Oferta e Demanda?', a: ['Relação preço/quantidade', 'Lei fiscal', 'Regulamento comercial', 'Imposto'], correct: 0 },
    { q: 'O que acontece quando a demanda aumenta?', a: ['Preço tende a subir', 'Preço cai', 'Nada muda', 'Produção para'], correct: 0 },
    { q: 'O que é elasticidade-preço?', a: ['Sensibilidade da demanda ao preço', 'Flexibilidade do produto', 'Tipo de embalagem', 'Durabilidade'], correct: 0 },
    { q: 'O que é custo de oportunidade?', a: ['Valor da melhor alternativa', 'Preço do produto', 'Custo de produção', 'Lucro esperado'], correct: 0 },
    { q: 'O que caracteriza um monopólio?', a: ['Uma empresa domina o mercado', 'Muitas empresas competem', 'Governo controla', 'Livre concorrência'], correct: 0 }
  ],
  1: [ // Macroeconomia
    { q: 'O que é PIB?', a: ['Produto Interno Bruto', 'Preço Industrial Básico', 'Produção Industrial', 'Pagamento Interno'], correct: 0 },
    { q: 'O que é inflação?', a: ['Aumento geral dos preços', 'Queda dos preços', 'Aumento do PIB', 'Crescimento econômico'], correct: 0 },
    { q: 'O que o Banco Central controla?', a: ['Política monetária', 'Preços de produtos', 'Salários', 'Importações'], correct: 0 },
    { q: 'O que é taxa de desemprego?', a: ['% de desempregados na força de trabalho', 'Número total de empregos', 'Salário mínimo', 'PIB per capita'], correct: 0 },
    { q: 'O que é recessão?', a: ['Contração econômica', 'Crescimento acelerado', 'Inflação alta', 'Pleno emprego'], correct: 0 }
  ],
  2: [ // Mercado Financeiro
    { q: 'O que são ações?', a: ['Frações de propriedade de empresa', 'Títulos de dívida', 'Moeda estrangeira', 'Imóveis'], correct: 0 },
    { q: 'O que é a Bolsa de Valores?', a: ['Mercado de negociação de ações', 'Banco', 'Loja', 'Fábrica'], correct: 0 },
    { q: 'O que são dividendos?', a: ['Parte do lucro distribuída', 'Impostos', 'Dívidas', 'Custos'], correct: 0 },
    { q: 'O que é diversificação?', a: ['Distribuir investimentos', 'Concentrar em um ativo', 'Vender tudo', 'Não investir'], correct: 0 },
    { q: 'O que é renda fixa?', a: ['Retorno previsível', 'Retorno variável', 'Sem retorno', 'Alto risco'], correct: 0 }
  ],
  3: [ // Comércio Internacional
    { q: 'O que é exportação?', a: ['Venda para outros países', 'Compra de outros países', 'Venda local', 'Produção interna'], correct: 0 },
    { q: 'O que é balança comercial?', a: ['Diferença entre exportações e importações', 'Tipo de transporte', 'Moeda internacional', 'Acordo diplomático'], correct: 0 },
    { q: 'O que são tarifas?', a: ['Impostos sobre importações', 'Preços de produtos', 'Salários', 'Lucros'], correct: 0 },
    { q: 'O que é câmbio?', a: ['Troca de moedas', 'Tipo de banco', 'Imposto', 'Produto'], correct: 0 }
  ],
  4: [ // Empreendedorismo
    { q: 'O que é um MVP?', a: ['Produto Mínimo Viável', 'Marketing Virtual', 'Mercado Variável', 'Modelo de Venda'], correct: 0 },
    { q: 'O que é startup?', a: ['Empresa inovadora em crescimento', 'Empresa antiga', 'Governo', 'ONG'], correct: 0 },
    { q: 'O que é pitch?', a: ['Apresentação rápida do negócio', 'Tipo de produto', 'Relatório', 'Contrato'], correct: 0 },
    { q: 'O que é break-even?', a: ['Ponto de equilíbrio', 'Lucro máximo', 'Prejuízo', 'Falência'], correct: 0 }
  ],
  5: [ // Marketing
    { q: 'O que são os 4 Ps do Marketing?', a: ['Produto, Preço, Praça, Promoção', 'Pessoas, Processos, Produtos, Preços', 'Propaganda, Publicidade, Preço, Prazo', 'Produção, Planejamento, Promoção, Preço'], correct: 0 },
    { q: 'O que é segmentação de mercado?', a: ['Dividir mercado em grupos', 'Unificar clientes', 'Ignorar diferenças', 'Vender para todos igual'], correct: 0 },
    { q: 'O que é branding?', a: ['Gestão de marca', 'Tipo de produto', 'Preço', 'Logística'], correct: 0 },
    { q: 'O que é CRM?', a: ['Gestão de relacionamento com cliente', 'Tipo de software', 'Imposto', 'Contrato'], correct: 0 }
  ],
  6: [ // Gestão de Pessoas
    { q: 'O que é RH?', a: ['Recursos Humanos', 'Rendimento Horário', 'Relatório', 'Regulamento'], correct: 0 },
    { q: 'O que é feedback?', a: ['Retorno sobre desempenho', 'Tipo de pagamento', 'Benefício', 'Contrato'], correct: 0 },
    { q: 'O que é turnover?', a: ['Rotatividade de funcionários', 'Tipo de lucro', 'Imposto', 'Benefício'], correct: 0 },
    { q: 'O que é clima organizacional?', a: ['Ambiente de trabalho', 'Temperatura', 'Localização', 'Tipo de empresa'], correct: 0 }
  ],
  7: [ // Contabilidade
    { q: 'O que é balanço patrimonial?', a: ['Demonstração de ativos e passivos', 'Tipo de conta', 'Imposto', 'Lucro'], correct: 0 },
    { q: 'O que são ativos?', a: ['Bens e direitos', 'Dívidas', 'Impostos', 'Custos'], correct: 0 },
    { q: 'O que são passivos?', a: ['Obrigações e dívidas', 'Bens', 'Lucros', 'Vendas'], correct: 0 },
    { q: 'O que é DRE?', a: ['Demonstração do Resultado', 'Departamento', 'Divisão', 'Documento'], correct: 0 }
  ],
  8: [ // Direito Empresarial
    { q: 'O que é CNPJ?', a: ['Cadastro de empresa', 'Cadastro pessoal', 'Imposto', 'Contrato'], correct: 0 },
    { q: 'O que é MEI?', a: ['Microempreendedor Individual', 'Empresa grande', 'Banco', 'Imposto'], correct: 0 },
    { q: 'O que é contrato social?', a: ['Documento de constituição', 'Acordo de trabalho', 'Imposto', 'Benefício'], correct: 0 },
    { q: 'O que é compliance?', a: ['Conformidade com regras', 'Tipo de produto', 'Marketing', 'Vendas'], correct: 0 }
  ],
  9: [ // Economia Digital
    { q: 'O que é e-commerce?', a: ['Comércio eletrônico', 'Economia tradicional', 'Banco', 'Fábrica'], correct: 0 },
    { q: 'O que é fintech?', a: ['Tecnologia financeira', 'Tipo de banco', 'Moeda', 'Imposto'], correct: 0 },
    { q: 'O que é blockchain?', a: ['Tecnologia de registro distribuído', 'Tipo de moeda', 'Banco digital', 'Aplicativo'], correct: 0 },
    { q: 'O que é economia compartilhada?', a: ['Modelo de acesso vs propriedade', 'Economia tradicional', 'Monopólio', 'Importação'], correct: 0 }
  ]
};

// Current state
let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;

// Investments
let investments = {
  stocks: 0,
  bonds: 0,
  realEstate: 0,
  crypto: 0
};

// Shop items
const SHOP_ITEMS = [
  { id: 'employee', name: 'Contratar Funcionário', desc: '+1 Funcionário', cost: 2000, gem: false },
  { id: 'marketing', name: 'Campanha Marketing', desc: '+10 Reputação', cost: 1500, gem: false },
  { id: 'expansion', name: 'Expansão', desc: '+5% Market Share', cost: 5000, gem: false },
  { id: 'advisor', name: 'Consultor', desc: '+25% XP', cost: 30, gem: true },
  { id: 'franchise', name: 'Franquia', desc: 'Receita passiva', cost: 50, gem: true },
  { id: 'ipo', name: 'Preparar IPO', desc: 'Desbloqueio especial', cost: 100, gem: true }
];

// Particles
let particles = [];
let touchStartY = 0;
let isDragging = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function saveGame() {
  localStorage.setItem('economicsTycoon', JSON.stringify({
    money, gems, xp, level, currentSector, lessonsCompleted, business, investments, streak
  }));
}

function loadGame() {
  const saved = localStorage.getItem('economicsTycoon');
  if (saved) {
    const data = JSON.parse(saved);
    money = data.money || 10000;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentSector = data.currentSector || 0;
    lessonsCompleted = data.lessonsCompleted || {};
    business = data.business || business;
    investments = data.investments || investments;
    streak = data.streak || 0;
  }
}

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

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1, color,
      size: Math.random() * 6 + 2
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => {
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.2; p.life -= 0.02;
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

function generateQuestion(sector) {
  const questions = QUESTIONS[sector] || QUESTIONS[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

function startLesson(sector, lesson) {
  currentSector = sector;
  currentLesson = lesson;
  currentQuestion = generateQuestion(sector);
  questionAnswered = false;
  selectedAnswer = -1;
  gameState = 'lesson';
}

function formatMoney(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return val.toString();
}

function drawMenu() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1a365d');
  grad.addColorStop(1, '#0d1b2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 34px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💼 ECONOMICS TYCOON', canvas.width / 2, 60);

  // Stats
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 10, 290, 35);
  ctx.fillStyle = '#22c55e';
  ctx.font = '13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💵$${formatMoney(money)}  💎${gems}  ⭐Lv.${level}  🔥${streak}`, 20, 32);

  // Business stats
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 48, 290, 22);
  ctx.fillStyle = '#888';
  ctx.font = '11px Arial';
  ctx.fillText(`👥${business.employees} 📊${business.marketShare}% ⭐${business.reputation}`, 20, 63);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Setores de Estudo', canvas.width / 2, 100);

  const cardHeight = 68;
  const startY = 118;
  const maxScroll = Math.max(0, SECTORS.length * (cardHeight + 8) - (canvas.height - startY - 70));
  sectorScroll = Math.max(0, Math.min(sectorScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(15, startY, canvas.width - 30, canvas.height - startY - 60);
  ctx.clip();

  SECTORS.forEach((sector, i) => {
    const y = startY + i * (cardHeight + 8) - sectorScroll;
    if (y > startY - cardHeight && y < canvas.height - 60) {
      const unlocked = level >= sector.unlockLevel;
      const completed = lessonsCompleted[sector.id] || 0;

      ctx.fillStyle = unlocked ? sector.color : '#333';
      ctx.globalAlpha = unlocked ? 1 : 0.5;
      ctx.fillRect(22, y, canvas.width - 44, cardHeight);

      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(sector.icon, 35, y + 44);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px Arial';
      ctx.fillText(sector.name, 78, y + 28);

      ctx.font = '11px Arial';
      ctx.fillStyle = '#ddd';
      ctx.fillText(`${completed}/${sector.lessons} lições`, 78, y + 48);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(185, y + 36, 85, 10);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(185, y + 36, (completed / sector.lessons) * 85, 10);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Lv.${sector.unlockLevel}`, canvas.width - 40, y + 40);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();

  ctx.fillStyle = '#9333ea';
  ctx.fillRect(canvas.width - 80, canvas.height - 52, 65, 38);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 LOJA', canvas.width - 47, canvas.height - 28);
}

function drawLessons() {
  const sector = SECTORS[currentSector];

  ctx.fillStyle = sector.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${sector.icon} ${sector.name}`, canvas.width / 2, 42);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(12, 10, 65, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '13px Arial';
  ctx.fillText('← Voltar', 44, 30);

  const cols = 5;
  const btnSize = 46;
  const gap = 7;
  const startY = 70;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(sector.lessons / cols) * (btnSize + gap) - (canvas.height - startY - 15));
  lessonScroll = Math.max(0, Math.min(lessonScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < sector.lessons; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - lessonScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (lessonsCompleted[sector.id] || 0) > i;
      const available = (lessonsCompleted[sector.id] || 0) >= i;

      ctx.fillStyle = completed ? '#22c55e' : (available ? sector.color : '#444');
      ctx.fillRect(x, y, btnSize, btnSize);
      ctx.strokeStyle = completed ? '#4ade80' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = completed ? '18px Arial' : 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(completed ? '💵' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 5);
    }
  }

  ctx.restore();
}

function drawLesson() {
  const sector = SECTORS[currentSector];

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = sector.color;
  ctx.fillRect(0, 0, canvas.width, 48);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${sector.icon} Lição ${currentLesson + 1}`, canvas.width / 2, 30);

  if (streak > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 12, 30);
  }

  ctx.fillStyle = '#1e1e3e';
  ctx.fillRect(20, 60, canvas.width - 40, 95);

  ctx.fillStyle = '#fff';
  ctx.font = '15px Arial';
  ctx.textAlign = 'center';

  const words = currentQuestion.q.split(' ');
  let line = '';
  let y = 95;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > canvas.width - 70) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 22;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, canvas.width / 2, y);

  const answerY = 175;
  currentQuestion.a.forEach((answer, i) => {
    const ay = answerY + i * 50;
    let bgColor = '#2d2d4e';

    if (questionAnswered) {
      if (i === currentQuestion.correct) bgColor = '#166534';
      else if (i === selectedAnswer && i !== currentQuestion.correct) bgColor = '#991b1b';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(28, ay, canvas.width - 56, 42);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(answer, canvas.width / 2, ay + 26);
  });

  if (questionAnswered) {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(canvas.width / 2 - 75, canvas.height - 70, 150, 45);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 42);
  }
}

function drawVictory() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 34px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💰 LUCRO!', canvas.width / 2, canvas.height / 2 - 55);

  const reward = 500 + currentLesson * 50;
  ctx.fillStyle = '#ffd700';
  ctx.font = '18px Arial';
  ctx.fillText(`+$${formatMoney(reward)}  +${25 + currentLesson * 2} XP`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 60, 150, 45);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 88);
}

function drawShop() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#9333ea';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 INVESTIMENTOS', canvas.width / 2, 40);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(12, 10, 65, 28);
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.fillText('← Voltar', 44, 28);

  ctx.fillStyle = '#ffd700';
  ctx.font = '14px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`💵 $${formatMoney(money)}  💎 ${gems}`, canvas.width - 18, 28);

  SHOP_ITEMS.forEach((item, i) => {
    const y = 60 + i * 62;
    const canAfford = item.gem ? gems >= item.cost : money >= item.cost;

    ctx.fillStyle = canAfford ? '#1e1e3e' : '#0a0a1e';
    ctx.fillRect(18, y, canvas.width - 36, 54);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 30, y + 20);

    ctx.fillStyle = '#888';
    ctx.font = '11px Arial';
    ctx.fillText(item.desc, 30, y + 40);

    ctx.fillStyle = item.gem ? '#a78bfa' : '#22c55e';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${item.gem ? '💎' : '💵'} ${item.gem ? item.cost : '$' + formatMoney(item.cost)}`, canvas.width - 30, y + 30);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'lessons': drawLessons(); break;
    case 'lesson': drawLesson(); break;
    case 'victory': drawVictory(); break;
    case 'shop': drawShop(); break;
  }
  drawParticles();
}

function gameLoop() {
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}

function handleClick(x, y) {
  if (gameState === 'menu') {
    if (x > canvas.width - 80 && y > canvas.height - 52) {
      gameState = 'shop';
      return;
    }

    const cardHeight = 68;
    const startY = 118;
    SECTORS.forEach((sector, i) => {
      const cy = startY + i * (cardHeight + 8) - sectorScroll;
      if (y > cy && y < cy + cardHeight && x > 22 && x < canvas.width - 22) {
        if (level >= sector.unlockLevel) {
          currentSector = i;
          lessonScroll = 0;
          gameState = 'lessons';
        }
      }
    });
  } else if (gameState === 'lessons') {
    if (x < 77 && y < 40) {
      gameState = 'menu';
      return;
    }

    const sector = SECTORS[currentSector];
    const cols = 5;
    const btnSize = 46;
    const gap = 7;
    const startY = 70;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < sector.lessons; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - lessonScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((lessonsCompleted[sector.id] || 0) >= i) {
          startLesson(currentSector, i);
        }
        break;
      }
    }
  } else if (gameState === 'lesson') {
    if (!questionAnswered) {
      const answerY = 175;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 50;
        if (y > ay && y < ay + 42 && x > 28 && x < canvas.width - 28) {
          selectedAnswer = i;
          questionAnswered = true;
          if (i === currentQuestion.correct) {
            streak++;
            createParticles(canvas.width / 2, ay + 21, '#22c55e', 20);
          } else {
            streak = 0;
          }
        }
      });
    } else {
      if (y > canvas.height - 70 && y < canvas.height - 25) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 500 + currentLesson * 50;
          money += reward;
          addXP(25 + currentLesson * 2);
          business.revenue += reward;

          if (!lessonsCompleted[currentSector] || lessonsCompleted[currentSector] <= currentLesson) {
            lessonsCompleted[currentSector] = currentLesson + 1;
          }
          saveGame();
          gameState = 'victory';
        } else {
          currentQuestion = generateQuestion(currentSector);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'victory') {
    if (y > canvas.height / 2 + 60 && y < canvas.height / 2 + 105) {
      gameState = 'lessons';
    }
  } else if (gameState === 'shop') {
    if (x < 77 && y < 38) {
      gameState = 'menu';
      return;
    }

    SHOP_ITEMS.forEach((item, i) => {
      const iy = 60 + i * 62;
      if (y > iy && y < iy + 54 && x > 18 && x < canvas.width - 18) {
        const canAfford = item.gem ? gems >= item.cost : money >= item.cost;
        if (canAfford) {
          if (item.gem) gems -= item.cost;
          else money -= item.cost;

          if (item.id === 'employee') business.employees++;
          if (item.id === 'marketing') business.reputation += 10;
          if (item.id === 'expansion') business.marketShare += 5;

          createParticles(x, y, '#9333ea', 20);
          saveGame();
        }
      }
    });
  }
}

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
    if (gameState === 'menu') sectorScroll += delta;
    else if (gameState === 'lessons') lessonScroll += delta;
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
  if (gameState === 'menu') sectorScroll += e.deltaY * 0.5;
  else if (gameState === 'lessons') lessonScroll += e.deltaY * 0.5;
});

loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
