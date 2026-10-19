// Music Theory Hero - Rhythm game learning
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

const TOPICS = [
  { id: 0, name: 'Notas e Claves', color: '#dc2626', icon: '🎵', unlockLevel: 1, lessons: 50 },
  { id: 1, name: 'Ritmo e Tempo', color: '#ea580c', icon: '🥁', unlockLevel: 5, lessons: 50 },
  { id: 2, name: 'Escalas', color: '#f59e0b', icon: '🎹', unlockLevel: 10, lessons: 50 },
  { id: 3, name: 'Acordes', color: '#84cc16', icon: '🎸', unlockLevel: 15, lessons: 50 },
  { id: 4, name: 'Intervalos', color: '#22c55e', icon: '📊', unlockLevel: 20, lessons: 50 },
  { id: 5, name: 'Harmonia', color: '#14b8a6', icon: '🎼', unlockLevel: 30, lessons: 50 },
  { id: 6, name: 'Composição', color: '#0ea5e9', icon: '✏️', unlockLevel: 40, lessons: 50 },
  { id: 7, name: 'História da Música', color: '#6366f1', icon: '📜', unlockLevel: 50, lessons: 50 },
  { id: 8, name: 'Instrumentos', color: '#8b5cf6', icon: '🎺', unlockLevel: 60, lessons: 50 },
  { id: 9, name: 'Produção Musical', color: '#ec4899', icon: '🎧', unlockLevel: 70, lessons: 50 }
];

let currentTopic = 0;
let currentLesson = 0;
let lessonsCompleted = {};
let topicScroll = 0;
let lessonScroll = 0;

const QUESTIONS = {
  0: [
    { q: 'Quantas notas musicais existem na escala ocidental?', a: ['7 (Dó a Si)', '5', '12', '8'], correct: 0 },
    { q: 'Qual é a clave mais comum para piano (mão direita)?', a: ['Clave de Sol', 'Clave de Fá', 'Clave de Dó', 'Clave de Ré'], correct: 0 },
    { q: 'Qual nota vem depois de Mi?', a: ['Fá', 'Sol', 'Ré', 'Si'], correct: 0 },
    { q: 'O que é uma pausa na música?', a: ['Silêncio medido', 'Nota longa', 'Acorde', 'Escala'], correct: 0 }
  ],
  1: [
    { q: 'O que significa o compasso 4/4?', a: ['4 tempos por compasso', '4 notas', '44 batidas', 'Muito rápido'], correct: 0 },
    { q: 'O que é BPM?', a: ['Batidas por minuto', 'Baixo por música', 'Banda principal', 'Barra por melodia'], correct: 0 },
    { q: 'Quanto vale uma semínima?', a: ['1 tempo', '2 tempos', '4 tempos', '1/2 tempo'], correct: 0 },
    { q: 'O que é síncope?', a: ['Deslocamento do acento', 'Nota longa', 'Silêncio', 'Repetição'], correct: 0 }
  ],
  2: [
    { q: 'Quantos semitons tem uma escala maior?', a: ['12', '7', '8', '5'], correct: 0 },
    { q: 'Qual é a fórmula da escala maior?', a: ['T-T-ST-T-T-T-ST', 'T-ST-T-T-ST-T-T', 'ST-T-T-ST-T-T-T', 'T-T-T-ST-T-T-ST'], correct: 0 },
    { q: 'O que é uma escala pentatônica?', a: ['Escala de 5 notas', 'Escala de 7 notas', 'Escala cromática', 'Escala modal'], correct: 0 }
  ],
  3: [
    { q: 'Quantas notas formam uma tríade?', a: ['3', '2', '4', '5'], correct: 0 },
    { q: 'Qual é a diferença entre acorde maior e menor?', a: ['A terça (maior ou menor)', 'A quinta', 'A fundamental', 'O baixo'], correct: 0 },
    { q: 'O que é um acorde de sétima?', a: ['Tríade + sétima', 'Acorde de 7 notas', 'Acorde no 7º grau', 'Escala de 7 notas'], correct: 0 }
  ],
  4: [
    { q: 'O que é um intervalo de 5ª justa?', a: ['7 semitons', '5 semitons', '6 semitons', '8 semitons'], correct: 0 },
    { q: 'O que é um semitom?', a: ['Menor intervalo (1 tecla)', 'Meio tom', 'Nota pequena', 'Pausa curta'], correct: 0 },
    { q: 'Quantos semitons tem uma oitava?', a: ['12', '8', '7', '10'], correct: 0 }
  ],
  5: [
    { q: 'O que é harmonia?', a: ['Combinação de sons simultâneos', 'Melodia principal', 'Ritmo', 'Silêncio'], correct: 0 },
    { q: 'O que é cadência?', a: ['Progressão harmônica conclusiva', 'Ritmo rápido', 'Nota longa', 'Escala'], correct: 0 },
    { q: 'O que é tonalidade?', a: ['Centro tonal de uma música', 'Volume', 'Velocidade', 'Instrumento'], correct: 0 }
  ],
  6: [
    { q: 'O que é melodia?', a: ['Sequência de notas', 'Acordes juntos', 'Ritmo', 'Harmonia'], correct: 0 },
    { q: 'O que é motivo musical?', a: ['Ideia musical curta', 'Instrumento', 'Escala', 'Compasso'], correct: 0 },
    { q: 'O que é contraponto?', a: ['Melodias independentes simultâneas', 'Acorde', 'Ritmo', 'Pausa'], correct: 0 }
  ],
  7: [
    { q: 'Quem compôs as 9 Sinfonias famosas?', a: ['Beethoven', 'Mozart', 'Bach', 'Vivaldi'], correct: 0 },
    { q: 'O que é música barroca?', a: ['Período 1600-1750', 'Música moderna', 'Rock clássico', 'Jazz'], correct: 0 },
    { q: 'Quem é considerado pai da música?', a: ['Bach', 'Mozart', 'Beethoven', 'Handel'], correct: 0 }
  ],
  8: [
    { q: 'Qual família do violino?', a: ['Cordas', 'Sopro', 'Percussão', 'Teclas'], correct: 0 },
    { q: 'Qual instrumento tem 88 teclas?', a: ['Piano', 'Órgão', 'Acordeão', 'Sintetizador'], correct: 0 },
    { q: 'O que é um instrumento de sopro?', a: ['Som por vibração de ar', 'Cordas vibram', 'Percutido', 'Eletrônico'], correct: 0 }
  ],
  9: [
    { q: 'O que é DAW?', a: ['Software de produção musical', 'Instrumento', 'Microfone', 'Amplificador'], correct: 0 },
    { q: 'O que é mixagem?', a: ['Balancear elementos da música', 'Gravar', 'Compor', 'Tocar'], correct: 0 },
    { q: 'O que é masterização?', a: ['Finalização do áudio', 'Gravação', 'Mixagem', 'Composição'], correct: 0 }
  ]
};

let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;
let songsLearned = 0;

// Animated music notes
let notes = [];
function spawnNote() {
  notes.push({
    x: Math.random() * canvas.width,
    y: canvas.height + 20,
    symbol: ['♪', '♫', '🎵', '🎶'][Math.floor(Math.random() * 4)],
    speed: 1 + Math.random() * 2,
    wobble: Math.random() * 2
  });
}

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
  localStorage.setItem('musicTheoryHero', JSON.stringify({
    coins, gems, xp, level, currentTopic, lessonsCompleted, streak, songsLearned
  }));
}

function loadGame() {
  const saved = localStorage.getItem('musicTheoryHero');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentTopic = data.currentTopic || 0;
    lessonsCompleted = data.lessonsCompleted || {};
    streak = data.streak || 0;
    songsLearned = data.songsLearned || 0;
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

function updateNotes() {
  if (Math.random() < 0.02) spawnNote();
  notes = notes.filter(n => {
    n.y -= n.speed;
    n.x += Math.sin(n.y * 0.02) * n.wobble;
    return n.y > -30;
  });
}

function drawNotes() {
  ctx.globalAlpha = 0.3;
  notes.forEach(n => {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(n.symbol, n.x, n.y);
  });
  ctx.globalAlpha = 1;
}

function generateQuestion(topic) {
  const questions = QUESTIONS[topic] || QUESTIONS[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

function startLesson(topic, lesson) {
  currentTopic = topic;
  currentLesson = lesson;
  currentQuestion = generateQuestion(topic);
  questionAnswered = false;
  selectedAnswer = -1;
  gameState = 'lesson';
}

function drawMenu() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(1, '#0f0a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawNotes();

  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎵 MUSIC THEORY HERO', canvas.width / 2, 58);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 260, 30);
  ctx.fillStyle = '#f472b6';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Lv.${level}  🎼${songsLearned}`, 18, 28);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Tópicos Musicais', canvas.width / 2, 90);

  const cardHeight = 65;
  const startY = 108;
  const maxScroll = Math.max(0, TOPICS.length * (cardHeight + 8) - (canvas.height - startY - 40));
  topicScroll = Math.max(0, Math.min(topicScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(12, startY, canvas.width - 24, canvas.height - startY - 30);
  ctx.clip();

  TOPICS.forEach((topic, i) => {
    const y = startY + i * (cardHeight + 8) - topicScroll;
    if (y > startY - cardHeight && y < canvas.height - 30) {
      const unlocked = level >= topic.unlockLevel;
      const completed = lessonsCompleted[topic.id] || 0;

      ctx.fillStyle = unlocked ? topic.color : '#222';
      ctx.globalAlpha = unlocked ? 0.9 : 0.4;
      ctx.fillRect(20, y, canvas.width - 40, cardHeight);

      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(topic.icon, 32, y + 42);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(topic.name, 72, y + 26);

      ctx.font = '11px Arial';
      ctx.fillStyle = '#ccc';
      ctx.fillText(`${completed}/${topic.lessons} lições`, 72, y + 46);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(175, y + 34, 80, 9);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(175, y + 34, (completed / topic.lessons) * 80, 9);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '13px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Lv.${topic.unlockLevel}`, canvas.width - 35, y + 38);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();
}

function drawLessons() {
  const topic = TOPICS[currentTopic];

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(1, '#0f0a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawNotes();

  ctx.fillStyle = topic.color;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, canvas.width, 55);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${topic.icon} ${topic.name}`, canvas.width / 2, 38);

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

  const maxScroll = Math.max(0, Math.ceil(topic.lessons / cols) * (btnSize + gap) - (canvas.height - startY - 12));
  lessonScroll = Math.max(0, Math.min(lessonScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < topic.lessons; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - lessonScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (lessonsCompleted[topic.id] || 0) > i;
      const available = (lessonsCompleted[topic.id] || 0) >= i;

      ctx.fillStyle = completed ? '#f472b6' : (available ? topic.color : '#333');
      ctx.globalAlpha = completed ? 1 : (available ? 0.8 : 0.4);
      ctx.fillRect(x, y, btnSize, btnSize);

      ctx.strokeStyle = completed ? '#f9a8d4' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = completed ? '17px Arial' : 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText(completed ? '🎵' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 4);
    }
  }

  ctx.restore();
}

function drawLesson() {
  const topic = TOPICS[currentTopic];

  ctx.fillStyle = '#0f0a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawNotes();

  ctx.fillStyle = topic.color;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 0, canvas.width, 46);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${topic.icon} Lição ${currentLesson + 1}`, canvas.width / 2, 28);

  if (streak > 0) {
    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 10, 28);
  }

  ctx.fillStyle = 'rgba(30,27,75,0.9)';
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
    let bgColor = 'rgba(50,45,100,0.8)';

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
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(canvas.width / 2 - 70, canvas.height - 68, 140, 42);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 42);
  }
}

function drawVictory() {
  ctx.fillStyle = '#0f0a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawNotes();

  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎵 MÚSICA DOMINADA!', canvas.width / 2, canvas.height / 2 - 50);

  const reward = 45 + currentLesson * 5;
  ctx.fillStyle = '#ffd700';
  ctx.font = '17px Arial';
  ctx.fillText(`+${reward} moedas  +${25 + currentLesson * 2} XP`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#f472b6';
  ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2 + 55, 140, 42);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 82);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateNotes();
  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'lessons': drawLessons(); break;
    case 'lesson': drawLesson(); break;
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
    TOPICS.forEach((topic, i) => {
      const cy = startY + i * (cardHeight + 8) - topicScroll;
      if (y > cy && y < cy + cardHeight && x > 20 && x < canvas.width - 20) {
        if (level >= topic.unlockLevel) {
          currentTopic = i;
          lessonScroll = 0;
          gameState = 'lessons';
        }
      }
    });
  } else if (gameState === 'lessons') {
    if (x < 70 && y < 38) {
      gameState = 'menu';
      return;
    }

    const topic = TOPICS[currentTopic];
    const cols = 5;
    const btnSize = 44;
    const gap = 6;
    const startY = 68;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < topic.lessons; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - lessonScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((lessonsCompleted[topic.id] || 0) >= i) {
          startLesson(currentTopic, i);
        }
        break;
      }
    }
  } else if (gameState === 'lesson') {
    if (!questionAnswered) {
      const answerY = 165;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 48;
        if (y > ay && y < ay + 40 && x > 25 && x < canvas.width - 25) {
          selectedAnswer = i;
          questionAnswered = true;
          if (i === currentQuestion.correct) {
            streak++;
            createParticles(canvas.width / 2, ay + 20, '#f472b6', 20);
          } else {
            streak = 0;
          }
        }
      });
    } else {
      if (y > canvas.height - 68 && y < canvas.height - 26) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 45 + currentLesson * 5;
          coins += reward;
          addXP(25 + currentLesson * 2);
          songsLearned++;

          if (!lessonsCompleted[currentTopic] || lessonsCompleted[currentTopic] <= currentLesson) {
            lessonsCompleted[currentTopic] = currentLesson + 1;
          }
          saveGame();
          gameState = 'victory';
        } else {
          currentQuestion = generateQuestion(currentTopic);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'victory') {
    if (y > canvas.height / 2 + 55 && y < canvas.height / 2 + 97) {
      gameState = 'lessons';
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
    if (gameState === 'menu') topicScroll += delta;
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
  if (gameState === 'menu') topicScroll += e.deltaY * 0.5;
  else if (gameState === 'lessons') lessonScroll += e.deltaY * 0.5;
});

loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
