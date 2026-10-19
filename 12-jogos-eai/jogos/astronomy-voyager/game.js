// Astronomy Voyager - Space exploration and learning
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

const REGIONS = [
  { id: 0, name: 'Sistema Solar', color: '#f59e0b', icon: '☀️', unlockLevel: 1, missions: 50 },
  { id: 1, name: 'Lua e Satélites', color: '#94a3b8', icon: '🌙', unlockLevel: 5, missions: 50 },
  { id: 2, name: 'Estrelas', color: '#fbbf24', icon: '⭐', unlockLevel: 10, missions: 50 },
  { id: 3, name: 'Nebulosas', color: '#8b5cf6', icon: '🌌', unlockLevel: 15, missions: 50 },
  { id: 4, name: 'Galáxias', color: '#6366f1', icon: '🌀', unlockLevel: 20, missions: 50 },
  { id: 5, name: 'Buracos Negros', color: '#1e1b4b', icon: '🕳️', unlockLevel: 30, missions: 50 },
  { id: 6, name: 'Exoplanetas', color: '#0d9488', icon: '🪐', unlockLevel: 40, missions: 50 },
  { id: 7, name: 'Cosmologia', color: '#dc2626', icon: '💥', unlockLevel: 50, missions: 50 },
  { id: 8, name: 'Astrofísica', color: '#0891b2', icon: '🔭', unlockLevel: 60, missions: 50 },
  { id: 9, name: 'Exploração Espacial', color: '#16a34a', icon: '🚀', unlockLevel: 70, missions: 50 }
];

let currentRegion = 0;
let currentMission = 0;
let missionsCompleted = {};
let regionScroll = 0;
let missionScroll = 0;

const QUESTIONS = {
  0: [
    { q: 'Qual é o maior planeta do Sistema Solar?', a: ['Júpiter', 'Saturno', 'Urano', 'Netuno'], correct: 0 },
    { q: 'Quantos planetas há no Sistema Solar?', a: ['8', '9', '7', '10'], correct: 0 },
    { q: 'Qual planeta é conhecido como "Planeta Vermelho"?', a: ['Marte', 'Vênus', 'Mercúrio', 'Júpiter'], correct: 0 },
    { q: 'Qual é o planeta mais próximo do Sol?', a: ['Mercúrio', 'Vênus', 'Terra', 'Marte'], correct: 0 },
    { q: 'Qual planeta tem os maiores anéis?', a: ['Saturno', 'Júpiter', 'Urano', 'Netuno'], correct: 0 }
  ],
  1: [
    { q: 'Qual é o satélite natural da Terra?', a: ['Lua', 'Fobos', 'Europa', 'Titã'], correct: 0 },
    { q: 'Quanto tempo a Lua leva para orbitar a Terra?', a: ['~27 dias', '30 dias', '24 horas', '365 dias'], correct: 0 },
    { q: 'Qual lua de Júpiter pode ter oceano?', a: ['Europa', 'Ganimedes', 'Calisto', 'Io'], correct: 0 },
    { q: 'Qual é a maior lua do Sistema Solar?', a: ['Ganimedes', 'Titã', 'Lua', 'Europa'], correct: 0 }
  ],
  2: [
    { q: 'O que é uma estrela?', a: ['Esfera de plasma em fusão', 'Planeta brilhante', 'Satélite', 'Asteroide'], correct: 0 },
    { q: 'Qual é a estrela mais próxima da Terra?', a: ['Sol', 'Proxima Centauri', 'Sirius', 'Alpha Centauri'], correct: 0 },
    { q: 'O que acontece quando uma estrela massiva morre?', a: ['Supernova', 'Evapora', 'Vira planeta', 'Nada'], correct: 0 },
    { q: 'O que é uma anã branca?', a: ['Resto de estrela média', 'Estrela jovem', 'Buraco negro', 'Nebulosa'], correct: 0 }
  ],
  3: [
    { q: 'O que é uma nebulosa?', a: ['Nuvem de gás e poeira', 'Tipo de estrela', 'Planeta gasoso', 'Galáxia pequena'], correct: 0 },
    { q: 'Onde nascem as estrelas?', a: ['Nebulosas', 'Buracos negros', 'Galáxias velhas', 'No vácuo'], correct: 0 },
    { q: 'O que é a Nebulosa de Órion?', a: ['Berçário de estrelas', 'Galáxia', 'Planeta', 'Cometa'], correct: 0 }
  ],
  4: [
    { q: 'O que é uma galáxia?', a: ['Sistema de estrelas, gás e matéria escura', 'Estrela gigante', 'Nebulosa', 'Sistema solar'], correct: 0 },
    { q: 'Qual é nossa galáxia?', a: ['Via Láctea', 'Andrômeda', 'Triangulum', 'Sombrero'], correct: 0 },
    { q: 'Quantas estrelas tem a Via Láctea?', a: ['100-400 bilhões', '1 milhão', '1 bilhão', '10 bilhões'], correct: 0 }
  ],
  5: [
    { q: 'O que é um buraco negro?', a: ['Região de gravidade extrema', 'Estrela escura', 'Planeta negro', 'Nuvem de gás'], correct: 0 },
    { q: 'O que é horizonte de eventos?', a: ['Limite de escape de luz', 'Borda do universo', 'Tipo de estrela', 'Planeta'], correct: 0 },
    { q: 'O que há no centro da Via Láctea?', a: ['Buraco negro supermassivo', 'Estrela gigante', 'Nebulosa', 'Vazio'], correct: 0 }
  ],
  6: [
    { q: 'O que são exoplanetas?', a: ['Planetas fora do Sistema Solar', 'Planetas sem estrela', 'Asteroides grandes', 'Luas gigantes'], correct: 0 },
    { q: 'Quantos exoplanetas foram descobertos?', a: ['Mais de 5000', 'Menos de 100', '500', '1000'], correct: 0 },
    { q: 'O que é zona habitável?', a: ['Região com água líquida possível', 'Centro da galáxia', 'Perto de buraco negro', 'Nebulosa'], correct: 0 }
  ],
  7: [
    { q: 'O que foi o Big Bang?', a: ['Origem do universo', 'Explosão de estrela', 'Colisão de galáxias', 'Formação do Sol'], correct: 0 },
    { q: 'Qual é a idade do universo?', a: ['~13.8 bilhões de anos', '4.5 bilhões', '1 bilhão', '100 bilhões'], correct: 0 },
    { q: 'O que é matéria escura?', a: ['Matéria invisível que afeta gravidade', 'Buracos negros', 'Gás interestelar', 'Antimatéria'], correct: 0 }
  ],
  8: [
    { q: 'O que estuda a astrofísica?', a: ['Física dos corpos celestes', 'Apenas estrelas', 'Apenas planetas', 'Mitologia'], correct: 0 },
    { q: 'O que é espectroscopia?', a: ['Análise de luz', 'Estudo de órbitas', 'Medição de distâncias', 'Fotografia'], correct: 0 },
    { q: 'O que é fusão nuclear?', a: ['União de núcleos atômicos', 'Divisão de átomos', 'Reação química', 'Explosão'], correct: 0 }
  ],
  9: [
    { q: 'Quem foi o primeiro humano no espaço?', a: ['Yuri Gagarin', 'Neil Armstrong', 'Buzz Aldrin', 'John Glenn'], correct: 0 },
    { q: 'Em que ano o homem pisou na Lua?', a: ['1969', '1965', '1972', '1959'], correct: 0 },
    { q: 'O que é a ISS?', a: ['Estação Espacial Internacional', 'Satélite de GPS', 'Sonda espacial', 'Telescópio'], correct: 0 }
  ]
};

let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;
let planetsDiscovered = 0;

// Stars animation
let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * 400,
    y: Math.random() * 800,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.5 + 0.1
  });
}

let particles = [];
let touchStartY = 0;
let isDragging = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars.forEach(s => {
    s.x = Math.random() * canvas.width;
    s.y = Math.random() * canvas.height;
  });
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function saveGame() {
  localStorage.setItem('astronomyVoyager', JSON.stringify({
    coins, gems, xp, level, currentRegion, missionsCompleted, streak, planetsDiscovered
  }));
}

function loadGame() {
  const saved = localStorage.getItem('astronomyVoyager');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentRegion = data.currentRegion || 0;
    missionsCompleted = data.missionsCompleted || {};
    streak = data.streak || 0;
    planetsDiscovered = data.planetsDiscovered || 0;
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

function drawStars() {
  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function generateQuestion(region) {
  const questions = QUESTIONS[region] || QUESTIONS[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

function startMission(region, mission) {
  currentRegion = region;
  currentMission = mission;
  currentQuestion = generateQuestion(region);
  questionAnswered = false;
  selectedAnswer = -1;
  gameState = 'mission';
}

function drawMenu() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🚀 ASTRONOMY VOYAGER', canvas.width / 2, 58);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 260, 30);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Lv.${level}  🪐${planetsDiscovered}`, 18, 28);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Regiões do Cosmos', canvas.width / 2, 90);

  const cardHeight = 65;
  const startY = 108;
  const maxScroll = Math.max(0, REGIONS.length * (cardHeight + 8) - (canvas.height - startY - 40));
  regionScroll = Math.max(0, Math.min(regionScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(12, startY, canvas.width - 24, canvas.height - startY - 30);
  ctx.clip();

  REGIONS.forEach((region, i) => {
    const y = startY + i * (cardHeight + 8) - regionScroll;
    if (y > startY - cardHeight && y < canvas.height - 30) {
      const unlocked = level >= region.unlockLevel;
      const completed = missionsCompleted[region.id] || 0;

      ctx.fillStyle = unlocked ? region.color : '#222';
      ctx.globalAlpha = unlocked ? 0.9 : 0.4;
      ctx.fillRect(20, y, canvas.width - 40, cardHeight);

      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(region.icon, 32, y + 42);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(region.name, 72, y + 26);

      ctx.font = '11px Arial';
      ctx.fillStyle = '#ccc';
      ctx.fillText(`${completed}/${region.missions} missões`, 72, y + 46);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(175, y + 34, 80, 9);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(175, y + 34, (completed / region.missions) * 80, 9);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '13px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Lv.${region.unlockLevel}`, canvas.width - 35, y + 38);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();
}

function drawMissions() {
  const region = REGIONS[currentRegion];

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();

  ctx.fillStyle = region.color;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, canvas.width, 55);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${region.icon} ${region.name}`, canvas.width / 2, 38);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(10, 12, 60, 26);
  ctx.fillStyle = '#fff';
  ctx.font = '11px Arial';
  ctx.fillText('← Voltar', 40, 29);

  const cols = 5;
  const btnSize = 44;
  const gap = 6;
  const startY = 68;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(region.missions / cols) * (btnSize + gap) - (canvas.height - startY - 12));
  missionScroll = Math.max(0, Math.min(missionScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < region.missions; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - missionScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (missionsCompleted[region.id] || 0) > i;
      const available = (missionsCompleted[region.id] || 0) >= i;

      ctx.fillStyle = completed ? '#fbbf24' : (available ? region.color : '#333');
      ctx.globalAlpha = completed ? 1 : (available ? 0.8 : 0.4);
      ctx.fillRect(x, y, btnSize, btnSize);

      ctx.strokeStyle = completed ? '#fde047' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = completed ? '17px Arial' : 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText(completed ? '⭐' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 4);
    }
  }

  ctx.restore();
}

function drawMission() {
  const region = REGIONS[currentRegion];

  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();

  ctx.fillStyle = region.color;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 0, canvas.width, 46);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${region.icon} Missão ${currentMission + 1}`, canvas.width / 2, 28);

  if (streak > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 10, 28);
  }

  ctx.fillStyle = 'rgba(30,30,60,0.9)';
  ctx.fillRect(18, 58, canvas.width - 36, 90);

  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';

  const words = currentQuestion.q.split(' ');
  let line = '';
  let y = 88;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > canvas.width - 60) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 20;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, canvas.width / 2, y);

  const answerY = 165;
  currentQuestion.a.forEach((answer, i) => {
    const ay = answerY + i * 48;
    let bgColor = 'rgba(50,50,100,0.8)';

    if (questionAnswered) {
      if (i === currentQuestion.correct) bgColor = 'rgba(22,101,52,0.9)';
      else if (i === selectedAnswer && i !== currentQuestion.correct) bgColor = 'rgba(153,27,27,0.9)';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(25, ay, canvas.width - 50, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '13px Arial';
    ctx.fillText(answer, canvas.width / 2, ay + 25);
  });

  if (questionAnswered) {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(canvas.width / 2 - 70, canvas.height - 68, 140, 42);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 42);
  }
}

function drawVictory() {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🌟 MISSÃO COMPLETA!', canvas.width / 2, canvas.height / 2 - 50);

  const reward = 45 + currentMission * 5;
  ctx.fillStyle = '#ffd700';
  ctx.font = '17px Arial';
  ctx.fillText(`+${reward} moedas  +${25 + currentMission * 2} XP`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2 + 55, 140, 42);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 82);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'missions': drawMissions(); break;
    case 'mission': drawMission(); break;
    case 'victory': drawVictory(); break;
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
    const cardHeight = 65;
    const startY = 108;
    REGIONS.forEach((region, i) => {
      const cy = startY + i * (cardHeight + 8) - regionScroll;
      if (y > cy && y < cy + cardHeight && x > 20 && x < canvas.width - 20) {
        if (level >= region.unlockLevel) {
          currentRegion = i;
          missionScroll = 0;
          gameState = 'missions';
        }
      }
    });
  } else if (gameState === 'missions') {
    if (x < 70 && y < 38) {
      gameState = 'menu';
      return;
    }

    const region = REGIONS[currentRegion];
    const cols = 5;
    const btnSize = 44;
    const gap = 6;
    const startY = 68;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < region.missions; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - missionScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((missionsCompleted[region.id] || 0) >= i) {
          startMission(currentRegion, i);
        }
        break;
      }
    }
  } else if (gameState === 'mission') {
    if (!questionAnswered) {
      const answerY = 165;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 48;
        if (y > ay && y < ay + 40 && x > 25 && x < canvas.width - 25) {
          selectedAnswer = i;
          questionAnswered = true;
          if (i === currentQuestion.correct) {
            streak++;
            createParticles(canvas.width / 2, ay + 20, '#fbbf24', 20);
          } else {
            streak = 0;
          }
        }
      });
    } else {
      if (y > canvas.height - 68 && y < canvas.height - 26) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 45 + currentMission * 5;
          coins += reward;
          addXP(25 + currentMission * 2);
          planetsDiscovered++;

          if (!missionsCompleted[currentRegion] || missionsCompleted[currentRegion] <= currentMission) {
            missionsCompleted[currentRegion] = currentMission + 1;
          }
          saveGame();
          gameState = 'victory';
        } else {
          currentQuestion = generateQuestion(currentRegion);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'victory') {
    if (y > canvas.height / 2 + 55 && y < canvas.height / 2 + 97) {
      gameState = 'missions';
    }
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
    if (gameState === 'menu') regionScroll += delta;
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
  if (gameState === 'menu') regionScroll += e.deltaY * 0.5;
  else if (gameState === 'missions') missionScroll += e.deltaY * 0.5;
});

loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
