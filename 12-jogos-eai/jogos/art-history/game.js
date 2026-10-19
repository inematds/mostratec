// Art History Museum - Virtual art challenges
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

const PERIODS = [
  { id: 0, name: 'Arte Pré-Histórica', color: '#78716c', icon: '🪨', unlockLevel: 1, exhibits: 50 },
  { id: 1, name: 'Arte Antiga', color: '#ca8a04', icon: '🏛️', unlockLevel: 5, exhibits: 50 },
  { id: 2, name: 'Arte Medieval', color: '#7c2d12', icon: '⚔️', unlockLevel: 10, exhibits: 50 },
  { id: 3, name: 'Renascimento', color: '#16a34a', icon: '🎨', unlockLevel: 15, exhibits: 50 },
  { id: 4, name: 'Barroco e Rococó', color: '#dc2626', icon: '👑', unlockLevel: 20, exhibits: 50 },
  { id: 5, name: 'Neoclassicismo', color: '#1e3a8a', icon: '🏺', unlockLevel: 30, exhibits: 50 },
  { id: 6, name: 'Impressionismo', color: '#0891b2', icon: '🌻', unlockLevel: 40, exhibits: 50 },
  { id: 7, name: 'Arte Moderna', color: '#7c3aed', icon: '🔷', unlockLevel: 50, exhibits: 50 },
  { id: 8, name: 'Arte Contemporânea', color: '#ec4899', icon: '💫', unlockLevel: 60, exhibits: 50 },
  { id: 9, name: 'Arte Brasileira', color: '#16a34a', icon: '🇧🇷', unlockLevel: 70, exhibits: 50 }
];

let currentPeriod = 0;
let currentExhibit = 0;
let exhibitsCompleted = {};
let periodScroll = 0;
let exhibitScroll = 0;

const QUESTIONS = {
  0: [
    { q: 'O que são pinturas rupestres?', a: ['Arte pré-histórica em cavernas', 'Quadros modernos', 'Esculturas', 'Cerâmicas'], correct: 0 },
    { q: 'Onde fica a caverna de Lascaux?', a: ['França', 'Brasil', 'Espanha', 'Itália'], correct: 0 },
    { q: 'O que são Vênus pré-históricas?', a: ['Esculturas femininas', 'Pinturas', 'Cavernas', 'Ferramentas'], correct: 0 }
  ],
  1: [
    { q: 'Qual civilização construiu as pirâmides?', a: ['Egípcia', 'Grega', 'Romana', 'Persa'], correct: 0 },
    { q: 'O que é arte grega clássica?', a: ['Perfeição e harmonia', 'Abstração', 'Geometria', 'Surrealismo'], correct: 0 },
    { q: 'O que caracteriza a escultura romana?', a: ['Realismo', 'Abstração', 'Impressionismo', 'Cubismo'], correct: 0 }
  ],
  2: [
    { q: 'O que são iluminuras medievais?', a: ['Ilustrações em manuscritos', 'Vitrais', 'Esculturas', 'Afrescos'], correct: 0 },
    { q: 'O que é arte gótica?', a: ['Catedrais com vitrais', 'Arte romana', 'Arte grega', 'Arte moderna'], correct: 0 },
    { q: 'O que são vitrais?', a: ['Janelas de vidro colorido', 'Pinturas', 'Esculturas', 'Mosaicos'], correct: 0 }
  ],
  3: [
    { q: 'Quem pintou a Mona Lisa?', a: ['Leonardo da Vinci', 'Michelangelo', 'Rafael', 'Botticelli'], correct: 0 },
    { q: 'O que é perspectiva linear?', a: ['Técnica de profundidade', 'Cor', 'Luz', 'Sombra'], correct: 0 },
    { q: 'Quem pintou o teto da Capela Sistina?', a: ['Michelangelo', 'Da Vinci', 'Rafael', 'Caravaggio'], correct: 0 },
    { q: 'O que caracteriza o Renascimento?', a: ['Humanismo e naturalismo', 'Abstração', 'Cubismo', 'Impressionismo'], correct: 0 }
  ],
  4: [
    { q: 'Quem pintou "A Ronda Noturna"?', a: ['Rembrandt', 'Vermeer', 'Rubens', 'Velázquez'], correct: 0 },
    { q: 'O que caracteriza o Barroco?', a: ['Drama e movimento', 'Simplicidade', 'Geometria', 'Abstração'], correct: 0 },
    { q: 'O que é chiaroscuro?', a: ['Contraste luz e sombra', 'Cor', 'Perspectiva', 'Textura'], correct: 0 }
  ],
  5: [
    { q: 'O que caracteriza o Neoclassicismo?', a: ['Inspiração na Antiguidade', 'Abstração', 'Impressionismo', 'Surrealismo'], correct: 0 },
    { q: 'Quem pintou "O Juramento dos Horácios"?', a: ['Jacques-Louis David', 'Ingres', 'Delacroix', 'Géricault'], correct: 0 }
  ],
  6: [
    { q: 'Quem é o pai do Impressionismo?', a: ['Claude Monet', 'Van Gogh', 'Picasso', 'Dalí'], correct: 0 },
    { q: 'O que caracteriza o Impressionismo?', a: ['Luz e cor ao ar livre', 'Formas geométricas', 'Sonhos', 'Realismo'], correct: 0 },
    { q: 'Quem pintou "Noite Estrelada"?', a: ['Van Gogh', 'Monet', 'Renoir', 'Degas'], correct: 0 }
  ],
  7: [
    { q: 'Quem criou o Cubismo?', a: ['Picasso e Braque', 'Monet', 'Dalí', 'Kandinsky'], correct: 0 },
    { q: 'O que é Surrealismo?', a: ['Arte do inconsciente', 'Realismo', 'Abstração', 'Impressionismo'], correct: 0 },
    { q: 'Quem pintou relógios derretidos?', a: ['Salvador Dalí', 'Picasso', 'Magritte', 'Miró'], correct: 0 }
  ],
  8: [
    { q: 'O que é arte conceitual?', a: ['Ideia sobre técnica', 'Realismo', 'Impressionismo', 'Cubismo'], correct: 0 },
    { q: 'O que é Pop Art?', a: ['Arte da cultura de massa', 'Arte antiga', 'Arte medieval', 'Arte barroca'], correct: 0 },
    { q: 'Quem fez as latas de sopa Campbell?', a: ['Andy Warhol', 'Roy Lichtenstein', 'Jeff Koons', 'Banksy'], correct: 0 }
  ],
  9: [
    { q: 'Quem pintou "Abaporu"?', a: ['Tarsila do Amaral', 'Di Cavalcanti', 'Portinari', 'Volpi'], correct: 0 },
    { q: 'O que foi a Semana de Arte Moderna?', a: ['Evento artístico de 1922', 'Exposição atual', 'Festival de música', 'Feira de artesanato'], correct: 0 },
    { q: 'Quem pintou "Guernica" influenciando artistas brasileiros?', a: ['Picasso', 'Dalí', 'Monet', 'Van Gogh'], correct: 0 }
  ]
};

let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;
let artworksViewed = 0;

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
  localStorage.setItem('artHistoryMuseum', JSON.stringify({
    coins, gems, xp, level, currentPeriod, exhibitsCompleted, streak, artworksViewed
  }));
}

function loadGame() {
  const saved = localStorage.getItem('artHistoryMuseum');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentPeriod = data.currentPeriod || 0;
    exhibitsCompleted = data.exhibitsCompleted || {};
    streak = data.streak || 0;
    artworksViewed = data.artworksViewed || 0;
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

function generateQuestion(period) {
  const questions = QUESTIONS[period] || QUESTIONS[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

function startExhibit(period, exhibit) {
  currentPeriod = period;
  currentExhibit = exhibit;
  currentQuestion = generateQuestion(period);
  questionAnswered = false;
  selectedAnswer = -1;
  gameState = 'exhibit';
}

function drawMenu() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1f1f1f');
  grad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Museum frame decoration
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 45, canvas.width - 30, 50);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 28px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('🖼️ ART HISTORY MUSEUM', canvas.width / 2, 80);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 260, 28);
  ctx.fillStyle = '#d4af37';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Lv.${level}  🖼️${artworksViewed}`, 18, 28);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('Períodos Artísticos', canvas.width / 2, 125);

  const cardHeight = 62;
  const startY = 142;
  const maxScroll = Math.max(0, PERIODS.length * (cardHeight + 8) - (canvas.height - startY - 35));
  periodScroll = Math.max(0, Math.min(periodScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(12, startY, canvas.width - 24, canvas.height - startY - 25);
  ctx.clip();

  PERIODS.forEach((period, i) => {
    const y = startY + i * (cardHeight + 8) - periodScroll;
    if (y > startY - cardHeight && y < canvas.height - 25) {
      const unlocked = level >= period.unlockLevel;
      const completed = exhibitsCompleted[period.id] || 0;

      // Museum frame style
      ctx.fillStyle = unlocked ? period.color : '#222';
      ctx.globalAlpha = unlocked ? 0.9 : 0.4;
      ctx.fillRect(20, y, canvas.width - 40, cardHeight);

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, y, canvas.width - 40, cardHeight);

      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(period.icon, 30, y + 40);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Georgia';
      ctx.fillText(period.name, 68, y + 24);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#ccc';
      ctx.fillText(`${completed}/${period.exhibits} exposições`, 68, y + 44);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(170, y + 32, 75, 8);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(170, y + 32, (completed / period.exhibits) * 75, 8);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Lv.${period.unlockLevel}`, canvas.width - 35, y + 36);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();
}

function drawExhibits() {
  const period = PERIODS[currentPeriod];

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = period.color;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, canvas.width, 52);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, 52);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`${period.icon} ${period.name}`, canvas.width / 2, 35);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(10, 12, 58, 24);
  ctx.fillStyle = '#fff';
  ctx.font = '10px Arial';
  ctx.fillText('← Voltar', 39, 28);

  const cols = 5;
  const btnSize = 42;
  const gap = 6;
  const startY = 65;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(period.exhibits / cols) * (btnSize + gap) - (canvas.height - startY - 10));
  exhibitScroll = Math.max(0, Math.min(exhibitScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < period.exhibits; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - exhibitScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (exhibitsCompleted[period.id] || 0) > i;
      const available = (exhibitsCompleted[period.id] || 0) >= i;

      ctx.fillStyle = completed ? '#d4af37' : (available ? period.color : '#333');
      ctx.globalAlpha = completed ? 1 : (available ? 0.8 : 0.4);
      ctx.fillRect(x, y, btnSize, btnSize);

      ctx.strokeStyle = completed ? '#ffd700' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = completed ? '16px Arial' : 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText(completed ? '🖼️' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 4);
    }
  }

  ctx.restore();
}

function drawExhibit() {
  const period = PERIODS[currentPeriod];

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = period.color;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, canvas.width, 44);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`${period.icon} Exposição ${currentExhibit + 1}`, canvas.width / 2, 28);

  if (streak > 0) {
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 10, 28);
  }

  // Question frame
  ctx.fillStyle = 'rgba(30,30,30,0.95)';
  ctx.fillRect(16, 55, canvas.width - 32, 85);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 55, canvas.width - 32, 85);

  ctx.fillStyle = '#fff';
  ctx.font = '13px Georgia';
  ctx.textAlign = 'center';

  const words = currentQuestion.q.split(' ');
  let line = '';
  let y = 82;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > canvas.width - 55) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += 18;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, canvas.width / 2, y);

  const answerY = 155;
  currentQuestion.a.forEach((answer, i) => {
    const ay = answerY + i * 46;
    let bgColor = 'rgba(40,40,40,0.9)';

    if (questionAnswered) {
      if (i === currentQuestion.correct) bgColor = 'rgba(22,101,52,0.9)';
      else if (i === selectedAnswer && i !== currentQuestion.correct) bgColor = 'rgba(153,27,27,0.9)';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(22, ay, canvas.width - 44, 38);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, ay, canvas.width - 44, 38);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Georgia';
    ctx.fillText(answer, canvas.width / 2, ay + 24);
  });

  if (questionAnswered) {
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(canvas.width / 2 - 65, canvas.height - 65, 130, 40);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 40);
  }
}

function drawVictory() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 28px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('🖼️ OBRA APRECIADA!', canvas.width / 2, canvas.height / 2 - 48);

  const reward = 45 + currentExhibit * 5;
  ctx.fillStyle = '#ffd700';
  ctx.font = '16px Arial';
  ctx.fillText(`+${reward} moedas  +${25 + currentExhibit * 2} XP`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#d4af37';
  ctx.fillRect(canvas.width / 2 - 65, canvas.height / 2 + 50, 130, 40);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 76);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'exhibits': drawExhibits(); break;
    case 'exhibit': drawExhibit(); break;
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
    const cardHeight = 62;
    const startY = 142;
    PERIODS.forEach((period, i) => {
      const cy = startY + i * (cardHeight + 8) - periodScroll;
      if (y > cy && y < cy + cardHeight && x > 20 && x < canvas.width - 20) {
        if (level >= period.unlockLevel) {
          currentPeriod = i;
          exhibitScroll = 0;
          gameState = 'exhibits';
        }
      }
    });
  } else if (gameState === 'exhibits') {
    if (x < 68 && y < 36) {
      gameState = 'menu';
      return;
    }

    const period = PERIODS[currentPeriod];
    const cols = 5;
    const btnSize = 42;
    const gap = 6;
    const startY = 65;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < period.exhibits; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - exhibitScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((exhibitsCompleted[period.id] || 0) >= i) {
          startExhibit(currentPeriod, i);
        }
        break;
      }
    }
  } else if (gameState === 'exhibit') {
    if (!questionAnswered) {
      const answerY = 155;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 46;
        if (y > ay && y < ay + 38 && x > 22 && x < canvas.width - 22) {
          selectedAnswer = i;
          questionAnswered = true;
          if (i === currentQuestion.correct) {
            streak++;
            createParticles(canvas.width / 2, ay + 19, '#d4af37', 20);
          } else {
            streak = 0;
          }
        }
      });
    } else {
      if (y > canvas.height - 65 && y < canvas.height - 25) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 45 + currentExhibit * 5;
          coins += reward;
          addXP(25 + currentExhibit * 2);
          artworksViewed++;

          if (!exhibitsCompleted[currentPeriod] || exhibitsCompleted[currentPeriod] <= currentExhibit) {
            exhibitsCompleted[currentPeriod] = currentExhibit + 1;
          }
          saveGame();
          gameState = 'victory';
        } else {
          currentQuestion = generateQuestion(currentPeriod);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'victory') {
    if (y > canvas.height / 2 + 50 && y < canvas.height / 2 + 90) {
      gameState = 'exhibits';
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
    if (gameState === 'menu') periodScroll += delta;
    else if (gameState === 'exhibits') exhibitScroll += delta;
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
  if (gameState === 'menu') periodScroll += e.deltaY * 0.5;
  else if (gameState === 'exhibits') exhibitScroll += e.deltaY * 0.5;
});

loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
