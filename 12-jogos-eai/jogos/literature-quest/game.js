// Literature Quest - Story-based learning
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

const GENRES = [
  { id: 0, name: 'Literatura Brasileira', color: '#16a34a', icon: '🇧🇷', unlockLevel: 1, chapters: 50 },
  { id: 1, name: 'Literatura Portuguesa', color: '#dc2626', icon: '🇵🇹', unlockLevel: 5, chapters: 50 },
  { id: 2, name: 'Clássicos Mundiais', color: '#2563eb', icon: '📚', unlockLevel: 10, chapters: 50 },
  { id: 3, name: 'Poesia', color: '#ec4899', icon: '🎭', unlockLevel: 15, chapters: 50 },
  { id: 4, name: 'Teatro', color: '#7c3aed', icon: '🎪', unlockLevel: 20, chapters: 50 },
  { id: 5, name: 'Modernismo', color: '#ea580c', icon: '🎨', unlockLevel: 30, chapters: 50 },
  { id: 6, name: 'Romantismo', color: '#be185d', icon: '💕', unlockLevel: 40, chapters: 50 },
  { id: 7, name: 'Realismo/Naturalismo', color: '#78716c', icon: '🔍', unlockLevel: 50, chapters: 50 },
  { id: 8, name: 'Literatura Contemporânea', color: '#0891b2', icon: '📖', unlockLevel: 60, chapters: 50 },
  { id: 9, name: 'Crítica Literária', color: '#1e3a8a', icon: '📝', unlockLevel: 70, chapters: 50 }
];

let currentGenre = 0;
let currentChapter = 0;
let chaptersCompleted = {};
let genreScroll = 0;
let chapterScroll = 0;

const QUESTIONS = {
  0: [
    { q: 'Quem escreveu "Dom Casmurro"?', a: ['Machado de Assis', 'José de Alencar', 'Lima Barreto', 'Graciliano Ramos'], correct: 0 },
    { q: 'Qual movimento literário Machado de Assis representa?', a: ['Realismo', 'Romantismo', 'Modernismo', 'Arcadismo'], correct: 0 },
    { q: 'Quem é o narrador de "Memórias Póstumas de Brás Cubas"?', a: ['Defunto autor', 'Autor vivo', 'Personagem secundário', 'Narrador onisciente'], correct: 0 },
    { q: 'Qual obra de José de Alencar é indianista?', a: ['Iracema', 'Senhora', 'Lucíola', 'A Viuvinha'], correct: 0 },
    { q: 'Quem escreveu "Vidas Secas"?', a: ['Graciliano Ramos', 'Jorge Amado', 'Érico Veríssimo', 'Rachel de Queiroz'], correct: 0 }
  ],
  1: [
    { q: 'Quem escreveu "Os Lusíadas"?', a: ['Luís de Camões', 'Fernando Pessoa', 'Eça de Queirós', 'Almeida Garrett'], correct: 0 },
    { q: 'Qual é o tema central de "Os Lusíadas"?', a: ['Viagem de Vasco da Gama', 'Guerra Civil', 'Amor proibido', 'Crítica social'], correct: 0 },
    { q: 'Quem criou o heterônimo Alberto Caeiro?', a: ['Fernando Pessoa', 'Camões', 'Eça de Queirós', 'Saramago'], correct: 0 },
    { q: 'Qual obra de Eça de Queirós critica a sociedade portuguesa?', a: ['Os Maias', 'Os Lusíadas', 'Mensagem', 'Amor de Perdição'], correct: 0 }
  ],
  2: [
    { q: 'Quem escreveu "Dom Quixote"?', a: ['Miguel de Cervantes', 'Shakespeare', 'Dante', 'Homero'], correct: 0 },
    { q: 'Qual é considerada a primeira novela moderna?', a: ['Dom Quixote', 'Ilíada', 'Odisseia', 'Eneida'], correct: 0 },
    { q: 'Quem escreveu "Hamlet"?', a: ['Shakespeare', 'Cervantes', 'Molière', 'Goethe'], correct: 0 },
    { q: 'Qual obra é de Fiódor Dostoiévski?', a: ['Crime e Castigo', 'Guerra e Paz', 'Anna Karenina', 'Doutor Jivago'], correct: 0 }
  ],
  3: [
    { q: 'O que é um soneto?', a: ['Poema de 14 versos', 'Poema de 10 versos', 'Poema épico', 'Poema livre'], correct: 0 },
    { q: 'O que são versos alexandrinos?', a: ['12 sílabas poéticas', '10 sílabas', '8 sílabas', '14 sílabas'], correct: 0 },
    { q: 'Quem foi o "Príncipe dos Poetas"?', a: ['Olavo Bilac', 'Castro Alves', 'Gonçalves Dias', 'Álvares de Azevedo'], correct: 0 },
    { q: 'O que é métrica em poesia?', a: ['Contagem de sílabas', 'Rima', 'Tema', 'Estrofe'], correct: 0 }
  ],
  4: [
    { q: 'Quem escreveu "Auto da Compadecida"?', a: ['Ariano Suassuna', 'Nelson Rodrigues', 'Dias Gomes', 'Gianfrancesco Guarnieri'], correct: 0 },
    { q: 'O que é um auto teatral?', a: ['Peça religiosa medieval', 'Peça moderna', 'Comédia musical', 'Drama realista'], correct: 0 },
    { q: 'Quem foi Nelson Rodrigues?', a: ['Dramaturgo brasileiro', 'Poeta português', 'Romancista inglês', 'Filósofo francês'], correct: 0 }
  ],
  5: [
    { q: 'Qual evento marca o início do Modernismo no Brasil?', a: ['Semana de Arte Moderna de 1922', 'Independência', 'Proclamação da República', 'Abolição'], correct: 0 },
    { q: 'Quem participou da Semana de 22?', a: ['Mário de Andrade', 'Machado de Assis', 'José de Alencar', 'Castro Alves'], correct: 0 },
    { q: 'Qual obra de Oswald de Andrade é icônica?', a: ['Manifesto Antropófago', 'Macunaíma', 'Pauliceia Desvairada', 'A Rosa do Povo'], correct: 0 }
  ],
  6: [
    { q: 'Qual é característica do Romantismo?', a: ['Subjetivismo e emoção', 'Objetividade científica', 'Crítica social', 'Experimentalismo'], correct: 0 },
    { q: 'Quem foi o maior poeta romântico brasileiro?', a: ['Castro Alves', 'Olavo Bilac', 'Manuel Bandeira', 'Drummond'], correct: 0 },
    { q: 'O que é "mal do século"?', a: ['Pessimismo romântico', 'Doença física', 'Crise econômica', 'Guerra'], correct: 0 }
  ],
  7: [
    { q: 'Qual é característica do Realismo?', a: ['Objetividade e crítica social', 'Emoção exagerada', 'Idealização', 'Nacionalismo'], correct: 0 },
    { q: 'O que diferencia Naturalismo do Realismo?', a: ['Determinismo biológico', 'Crítica mais leve', 'Menos detalhes', 'Mais poesia'], correct: 0 },
    { q: 'Qual obra é naturalista no Brasil?', a: ['O Cortiço', 'Dom Casmurro', 'Iracema', 'A Moreninha'], correct: 0 }
  ],
  8: [
    { q: 'Quem é Clarice Lispector?', a: ['Escritora brasileira modernista', 'Poetisa portuguesa', 'Dramaturga inglesa', 'Romancista francesa'], correct: 0 },
    { q: 'Qual obra é de Guimarães Rosa?', a: ['Grande Sertão: Veredas', 'Vidas Secas', 'Capitães da Areia', 'O Tempo e o Vento'], correct: 0 }
  ],
  9: [
    { q: 'O que é análise literária?', a: ['Estudo interpretativo de obras', 'Biografia do autor', 'Resumo da história', 'Lista de personagens'], correct: 0 },
    { q: 'O que é intertextualidade?', a: ['Diálogo entre textos', 'Texto único', 'Sem referências', 'Cópia literal'], correct: 0 }
  ]
};

let currentQuestion = null;
let questionAnswered = false;
let selectedAnswer = -1;
let streak = 0;
let booksRead = 0;

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
  localStorage.setItem('literatureQuest', JSON.stringify({
    coins, gems, xp, level, currentGenre, chaptersCompleted, streak, booksRead
  }));
}

function loadGame() {
  const saved = localStorage.getItem('literatureQuest');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentGenre = data.currentGenre || 0;
    chaptersCompleted = data.chaptersCompleted || {};
    streak = data.streak || 0;
    booksRead = data.booksRead || 0;
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

function generateQuestion(genre) {
  const questions = QUESTIONS[genre] || QUESTIONS[0];
  return { ...questions[Math.floor(Math.random() * questions.length)] };
}

function startChapter(genre, chapter) {
  currentGenre = genre;
  currentChapter = chapter;
  currentQuestion = generateQuestion(genre);
  questionAnswered = false;
  selectedAnswer = -1;
  gameState = 'chapter';
}

function drawMenu() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#2d1b4e');
  grad.addColorStop(1, '#1a0f2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 34px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('📚 LITERATURE QUEST', canvas.width / 2, 60);

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 10, 270, 32);
  ctx.fillStyle = '#ffd700';
  ctx.font = '13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Lv.${level}  📖${booksRead}`, 20, 30);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('Gêneros Literários', canvas.width / 2, 95);

  const cardHeight = 68;
  const startY = 115;
  const maxScroll = Math.max(0, GENRES.length * (cardHeight + 8) - (canvas.height - startY - 60));
  genreScroll = Math.max(0, Math.min(genreScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(15, startY, canvas.width - 30, canvas.height - startY - 50);
  ctx.clip();

  GENRES.forEach((genre, i) => {
    const y = startY + i * (cardHeight + 8) - genreScroll;
    if (y > startY - cardHeight && y < canvas.height - 50) {
      const unlocked = level >= genre.unlockLevel;
      const completed = chaptersCompleted[genre.id] || 0;

      ctx.fillStyle = unlocked ? genre.color : '#333';
      ctx.globalAlpha = unlocked ? 1 : 0.5;
      ctx.fillRect(22, y, canvas.width - 44, cardHeight);

      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(genre.icon, 35, y + 44);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Georgia';
      ctx.fillText(genre.name, 78, y + 28);

      ctx.font = '11px Arial';
      ctx.fillStyle = '#ddd';
      ctx.fillText(`${completed}/${genre.chapters} capítulos`, 78, y + 48);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(185, y + 36, 85, 10);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(185, y + 36, (completed / genre.chapters) * 85, 10);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Lv.${genre.unlockLevel}`, canvas.width - 40, y + 40);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();
}

function drawChapters() {
  const genre = GENRES[currentGenre];

  ctx.fillStyle = genre.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`${genre.icon} ${genre.name}`, canvas.width / 2, 42);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(12, 10, 65, 28);
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.fillText('← Voltar', 44, 28);

  const cols = 5;
  const btnSize = 46;
  const gap = 7;
  const startY = 70;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(genre.chapters / cols) * (btnSize + gap) - (canvas.height - startY - 15));
  chapterScroll = Math.max(0, Math.min(chapterScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < genre.chapters; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - chapterScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (chaptersCompleted[genre.id] || 0) > i;
      const available = (chaptersCompleted[genre.id] || 0) >= i;

      ctx.fillStyle = completed ? '#c084fc' : (available ? genre.color : '#444');
      ctx.fillRect(x, y, btnSize, btnSize);
      ctx.strokeStyle = completed ? '#d8b4fe' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = completed ? '18px Arial' : 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(completed ? '📖' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 5);
    }
  }

  ctx.restore();
}

function drawChapter() {
  const genre = GENRES[currentGenre];

  ctx.fillStyle = '#1a0f2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = genre.color;
  ctx.fillRect(0, 0, canvas.width, 48);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`${genre.icon} Capítulo ${currentChapter + 1}`, canvas.width / 2, 30);

  if (streak > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 12, 30);
  }

  ctx.fillStyle = '#2d1b4e';
  ctx.fillRect(20, 60, canvas.width - 40, 95);

  ctx.fillStyle = '#fff';
  ctx.font = '15px Georgia';
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
    let bgColor = '#3d2b5e';

    if (questionAnswered) {
      if (i === currentQuestion.correct) bgColor = '#166534';
      else if (i === selectedAnswer && i !== currentQuestion.correct) bgColor = '#991b1b';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(28, ay, canvas.width - 56, 42);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Georgia';
    ctx.fillText(answer, canvas.width / 2, ay + 26);
  });

  if (questionAnswered) {
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(canvas.width / 2 - 75, canvas.height - 70, 150, 45);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 42);
  }
}

function drawVictory() {
  ctx.fillStyle = '#1a0f2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 34px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('📚 CAPÍTULO LIDO!', canvas.width / 2, canvas.height / 2 - 55);

  const reward = 45 + currentChapter * 5;
  ctx.fillStyle = '#ffd700';
  ctx.font = '18px Arial';
  ctx.fillText(`+${reward} moedas  +${25 + currentChapter * 2} XP`, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#c084fc';
  ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 60, 150, 45);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 88);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'chapters': drawChapters(); break;
    case 'chapter': drawChapter(); break;
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
    const cardHeight = 68;
    const startY = 115;
    GENRES.forEach((genre, i) => {
      const cy = startY + i * (cardHeight + 8) - genreScroll;
      if (y > cy && y < cy + cardHeight && x > 22 && x < canvas.width - 22) {
        if (level >= genre.unlockLevel) {
          currentGenre = i;
          chapterScroll = 0;
          gameState = 'chapters';
        }
      }
    });
  } else if (gameState === 'chapters') {
    if (x < 77 && y < 38) {
      gameState = 'menu';
      return;
    }

    const genre = GENRES[currentGenre];
    const cols = 5;
    const btnSize = 46;
    const gap = 7;
    const startY = 70;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < genre.chapters; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - chapterScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((chaptersCompleted[genre.id] || 0) >= i) {
          startChapter(currentGenre, i);
        }
        break;
      }
    }
  } else if (gameState === 'chapter') {
    if (!questionAnswered) {
      const answerY = 175;
      currentQuestion.a.forEach((answer, i) => {
        const ay = answerY + i * 50;
        if (y > ay && y < ay + 42 && x > 28 && x < canvas.width - 28) {
          selectedAnswer = i;
          questionAnswered = true;
          if (i === currentQuestion.correct) {
            streak++;
            createParticles(canvas.width / 2, ay + 21, '#c084fc', 20);
          } else {
            streak = 0;
          }
        }
      });
    } else {
      if (y > canvas.height - 70 && y < canvas.height - 25) {
        if (selectedAnswer === currentQuestion.correct) {
          const reward = 45 + currentChapter * 5;
          coins += reward;
          addXP(25 + currentChapter * 2);
          booksRead++;

          if (!chaptersCompleted[currentGenre] || chaptersCompleted[currentGenre] <= currentChapter) {
            chaptersCompleted[currentGenre] = currentChapter + 1;
          }
          saveGame();
          gameState = 'victory';
        } else {
          currentQuestion = generateQuestion(currentGenre);
          questionAnswered = false;
          selectedAnswer = -1;
        }
      }
    }
  } else if (gameState === 'victory') {
    if (y > canvas.height / 2 + 60 && y < canvas.height / 2 + 105) {
      gameState = 'chapters';
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
    if (gameState === 'menu') genreScroll += delta;
    else if (gameState === 'chapters') chapterScroll += delta;
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
  if (gameState === 'menu') genreScroll += e.deltaY * 0.5;
  else if (gameState === 'chapters') chapterScroll += e.deltaY * 0.5;
});

loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
