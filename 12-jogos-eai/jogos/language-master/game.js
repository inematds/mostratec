// Language Master - Learn languages adventure
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'menu';
let coins = 500;
let gems = 10;
let xp = 0;
let level = 1;

// Languages (worlds)
const LANGUAGES = [
  { id: 0, name: 'Inglês', color: '#1e40af', icon: '🇬🇧', unlockLevel: 1, lessons: 50 },
  { id: 1, name: 'Espanhol', color: '#dc2626', icon: '🇪🇸', unlockLevel: 5, lessons: 50 },
  { id: 2, name: 'Francês', color: '#2563eb', icon: '🇫🇷', unlockLevel: 10, lessons: 50 },
  { id: 3, name: 'Alemão', color: '#1f2937', icon: '🇩🇪', unlockLevel: 15, lessons: 50 },
  { id: 4, name: 'Italiano', color: '#16a34a', icon: '🇮🇹', unlockLevel: 20, lessons: 50 },
  { id: 5, name: 'Japonês', color: '#dc2626', icon: '🇯🇵', unlockLevel: 30, lessons: 50 },
  { id: 6, name: 'Mandarim', color: '#dc2626', icon: '🇨🇳', unlockLevel: 40, lessons: 50 },
  { id: 7, name: 'Coreano', color: '#1e40af', icon: '🇰🇷', unlockLevel: 50, lessons: 50 },
  { id: 8, name: 'Russo', color: '#1e40af', icon: '🇷🇺', unlockLevel: 60, lessons: 50 },
  { id: 9, name: 'Árabe', color: '#166534', icon: '🇸🇦', unlockLevel: 70, lessons: 50 }
];

// Progress
let currentLang = 0;
let currentLesson = 0;
let lessonsCompleted = {};
let langScroll = 0;
let lessonScroll = 0;

// Vocabulary database
const VOCABULARY = {
  0: { // English
    greetings: [
      { word: 'Hello', translation: 'Olá', options: ['Olá', 'Adeus', 'Por favor', 'Obrigado'] },
      { word: 'Goodbye', translation: 'Adeus', options: ['Olá', 'Adeus', 'Bom dia', 'Boa noite'] },
      { word: 'Please', translation: 'Por favor', options: ['Obrigado', 'Desculpe', 'Por favor', 'De nada'] },
      { word: 'Thank you', translation: 'Obrigado', options: ['Por favor', 'Obrigado', 'Desculpe', 'Olá'] },
      { word: 'Good morning', translation: 'Bom dia', options: ['Boa noite', 'Boa tarde', 'Bom dia', 'Olá'] }
    ],
    numbers: [
      { word: 'One', translation: 'Um', options: ['Um', 'Dois', 'Três', 'Quatro'] },
      { word: 'Ten', translation: 'Dez', options: ['Cinco', 'Dez', 'Vinte', 'Cem'] },
      { word: 'Hundred', translation: 'Cem', options: ['Dez', 'Mil', 'Cem', 'Zero'] }
    ],
    colors: [
      { word: 'Red', translation: 'Vermelho', options: ['Azul', 'Verde', 'Vermelho', 'Amarelo'] },
      { word: 'Blue', translation: 'Azul', options: ['Azul', 'Roxo', 'Rosa', 'Laranja'] },
      { word: 'Green', translation: 'Verde', options: ['Branco', 'Preto', 'Verde', 'Cinza'] }
    ],
    animals: [
      { word: 'Dog', translation: 'Cachorro', options: ['Gato', 'Cachorro', 'Pássaro', 'Peixe'] },
      { word: 'Cat', translation: 'Gato', options: ['Gato', 'Rato', 'Leão', 'Tigre'] },
      { word: 'Bird', translation: 'Pássaro', options: ['Cobra', 'Pássaro', 'Urso', 'Lobo'] }
    ],
    food: [
      { word: 'Water', translation: 'Água', options: ['Leite', 'Suco', 'Água', 'Café'] },
      { word: 'Bread', translation: 'Pão', options: ['Arroz', 'Pão', 'Carne', 'Fruta'] },
      { word: 'Apple', translation: 'Maçã', options: ['Banana', 'Laranja', 'Maçã', 'Uva'] }
    ]
  },
  1: { // Spanish
    greetings: [
      { word: 'Hola', translation: 'Olá', options: ['Olá', 'Adeus', 'Por favor', 'Obrigado'] },
      { word: 'Adiós', translation: 'Adeus', options: ['Olá', 'Adeus', 'Bom dia', 'Boa noite'] },
      { word: 'Por favor', translation: 'Por favor', options: ['Obrigado', 'Desculpe', 'Por favor', 'De nada'] },
      { word: 'Gracias', translation: 'Obrigado', options: ['Por favor', 'Obrigado', 'Desculpe', 'Olá'] },
      { word: 'Buenos días', translation: 'Bom dia', options: ['Boa noite', 'Boa tarde', 'Bom dia', 'Olá'] }
    ],
    numbers: [
      { word: 'Uno', translation: 'Um', options: ['Um', 'Dois', 'Três', 'Quatro'] },
      { word: 'Diez', translation: 'Dez', options: ['Cinco', 'Dez', 'Vinte', 'Cem'] },
      { word: 'Cien', translation: 'Cem', options: ['Dez', 'Mil', 'Cem', 'Zero'] }
    ],
    colors: [
      { word: 'Rojo', translation: 'Vermelho', options: ['Azul', 'Verde', 'Vermelho', 'Amarelo'] },
      { word: 'Azul', translation: 'Azul', options: ['Azul', 'Roxo', 'Rosa', 'Laranja'] },
      { word: 'Verde', translation: 'Verde', options: ['Branco', 'Preto', 'Verde', 'Cinza'] }
    ],
    animals: [
      { word: 'Perro', translation: 'Cachorro', options: ['Gato', 'Cachorro', 'Pássaro', 'Peixe'] },
      { word: 'Gato', translation: 'Gato', options: ['Gato', 'Rato', 'Leão', 'Tigre'] },
      { word: 'Pájaro', translation: 'Pássaro', options: ['Cobra', 'Pássaro', 'Urso', 'Lobo'] }
    ],
    food: [
      { word: 'Agua', translation: 'Água', options: ['Leite', 'Suco', 'Água', 'Café'] },
      { word: 'Pan', translation: 'Pão', options: ['Arroz', 'Pão', 'Carne', 'Fruta'] },
      { word: 'Manzana', translation: 'Maçã', options: ['Banana', 'Laranja', 'Maçã', 'Uva'] }
    ]
  },
  2: { // French
    greetings: [
      { word: 'Bonjour', translation: 'Olá/Bom dia', options: ['Olá/Bom dia', 'Adeus', 'Por favor', 'Obrigado'] },
      { word: 'Au revoir', translation: 'Adeus', options: ['Olá', 'Adeus', 'Bom dia', 'Boa noite'] },
      { word: 'S\'il vous plaît', translation: 'Por favor', options: ['Obrigado', 'Desculpe', 'Por favor', 'De nada'] },
      { word: 'Merci', translation: 'Obrigado', options: ['Por favor', 'Obrigado', 'Desculpe', 'Olá'] }
    ],
    numbers: [
      { word: 'Un', translation: 'Um', options: ['Um', 'Dois', 'Três', 'Quatro'] },
      { word: 'Dix', translation: 'Dez', options: ['Cinco', 'Dez', 'Vinte', 'Cem'] }
    ],
    colors: [
      { word: 'Rouge', translation: 'Vermelho', options: ['Azul', 'Verde', 'Vermelho', 'Amarelo'] },
      { word: 'Bleu', translation: 'Azul', options: ['Azul', 'Roxo', 'Rosa', 'Laranja'] }
    ]
  }
};

// Add more languages with similar structure
for (let i = 3; i < 10; i++) {
  VOCABULARY[i] = VOCABULARY[0]; // Use English as template
}

// Lesson state
let currentWord = null;
let wordIndex = 0;
let lessonWords = [];
let correctAnswers = 0;
let wrongAnswers = 0;
let streak = 0;
let showResult = false;
let resultCorrect = false;

// Character customization
let characterParts = {
  body: 0,
  hair: 0,
  outfit: 0,
  accessory: 0
};

const BODY_COLORS = ['#fdbf6f', '#d4a574', '#8b6d5c', '#f5deb3', '#ffe4c4'];
const HAIR_STYLES = ['👱', '👩', '👨', '🧑', '👴'];
const OUTFITS = ['👕', '👔', '👗', '🥋', '👘'];

// Shop items
const SHOP_ITEMS = [
  { id: 'xp_boost', name: 'Boost XP', desc: '+50% XP por 1h', cost: 500, gem: false },
  { id: 'hint', name: 'Pacote Dicas', desc: '10 dicas', cost: 300, gem: false },
  { id: 'outfit1', name: 'Roupa Premium', desc: 'Novo visual', cost: 25, gem: true },
  { id: 'streak_freeze', name: 'Proteger Streak', desc: 'Não perde streak', cost: 15, gem: true },
  { id: 'unlock_lang', name: 'Desbloquear Idioma', desc: 'Acesso antecipado', cost: 50, gem: true }
];

let hints = 3;
let xpBoost = 1;
let streakFreeze = 0;

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
  localStorage.setItem('languageMaster', JSON.stringify({
    coins, gems, xp, level, currentLang, lessonsCompleted,
    characterParts, hints, streakFreeze, streak
  }));
}

function loadGame() {
  const saved = localStorage.getItem('languageMaster');
  if (saved) {
    const data = JSON.parse(saved);
    coins = data.coins || 500;
    gems = data.gems || 10;
    xp = data.xp || 0;
    level = data.level || 1;
    currentLang = data.currentLang || 0;
    lessonsCompleted = data.lessonsCompleted || {};
    characterParts = data.characterParts || characterParts;
    hints = data.hints || 3;
    streakFreeze = data.streakFreeze || 0;
    streak = data.streak || 0;
  }
}

// Add XP
function addXP(amount) {
  xp += Math.floor(amount * xpBoost);
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

// Generate lesson words
function generateLessonWords(lang) {
  const vocab = VOCABULARY[lang] || VOCABULARY[0];
  const categories = Object.keys(vocab);
  const words = [];

  // Get 10 random words
  for (let i = 0; i < 10; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const wordList = vocab[cat];
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    words.push({ ...word, category: cat });
  }

  return words;
}

// Start lesson
function startLesson(lang, lesson) {
  currentLang = lang;
  currentLesson = lesson;
  lessonWords = generateLessonWords(lang);
  wordIndex = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  currentWord = lessonWords[0];
  showResult = false;
  gameState = 'lesson';
}

// Draw menu
function drawMenu() {
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1e3a5f');
  grad.addColorStop(1, '#0d1b2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🌍 LANGUAGE MASTER', canvas.width / 2, 70);

  // Stats
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(10, 10, 260, 35);
  ctx.fillStyle = '#ffd700';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`💰${coins}  💎${gems}  ⭐Nv.${level}  🔥${streak}`, 20, 32);

  // Character preview
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(canvas.width - 100, 10, 85, 85);
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(HAIR_STYLES[characterParts.hair], canvas.width - 57, 70);

  // Languages label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Escolha um Idioma', canvas.width / 2, 130);

  // Language cards
  const cardHeight = 75;
  const startY = 150;
  const maxScroll = Math.max(0, LANGUAGES.length * (cardHeight + 10) - (canvas.height - startY - 80));
  langScroll = Math.max(0, Math.min(langScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(15, startY, canvas.width - 30, canvas.height - startY - 70);
  ctx.clip();

  LANGUAGES.forEach((lang, i) => {
    const y = startY + i * (cardHeight + 10) - langScroll;
    if (y > startY - cardHeight && y < canvas.height - 70) {
      const unlocked = level >= lang.unlockLevel;
      const completed = lessonsCompleted[lang.id] || 0;

      ctx.fillStyle = unlocked ? lang.color : '#333';
      ctx.globalAlpha = unlocked ? 1 : 0.5;
      ctx.fillRect(25, y, canvas.width - 50, cardHeight);

      // Flag
      ctx.font = '40px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(lang.icon, 40, y + 50);

      // Name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(lang.name, 95, y + 32);

      // Progress
      ctx.font = '13px Arial';
      ctx.fillStyle = '#ddd';
      ctx.fillText(`${completed}/${lang.lessons} lições`, 95, y + 55);

      // Progress bar
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(200, y + 42, 100, 12);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(200, y + 42, (completed / lang.lessons) * 100, 12);

      if (!unlocked) {
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🔒 Nv.${lang.unlockLevel}`, canvas.width - 45, y + 45);
      }

      ctx.globalAlpha = 1;
    }
  });

  ctx.restore();

  // Bottom buttons
  ctx.fillStyle = '#9333ea';
  ctx.fillRect(canvas.width - 90, canvas.height - 55, 75, 40);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛒 LOJA', canvas.width - 52, canvas.height - 30);
}

// Draw lessons
function drawLessons() {
  const lang = LANGUAGES[currentLang];

  ctx.fillStyle = lang.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${lang.icon} ${lang.name}`, canvas.width / 2, 45);

  // Back
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 12, 70, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText('← Voltar', 50, 33);

  // Lesson grid
  const cols = 5;
  const btnSize = 50;
  const gap = 8;
  const startY = 80;
  const gridW = cols * (btnSize + gap);
  const startX = (canvas.width - gridW) / 2;

  const maxScroll = Math.max(0, Math.ceil(lang.lessons / cols) * (btnSize + gap) - (canvas.height - startY - 20));
  lessonScroll = Math.max(0, Math.min(lessonScroll, maxScroll));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, startY, canvas.width, canvas.height - startY);
  ctx.clip();

  for (let i = 0; i < lang.lessons; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (btnSize + gap);
    const y = startY + row * (btnSize + gap) - lessonScroll;

    if (y > startY - btnSize && y < canvas.height) {
      const completed = (lessonsCompleted[lang.id] || 0) > i;
      const available = (lessonsCompleted[lang.id] || 0) >= i;

      ctx.fillStyle = completed ? '#22c55e' : (available ? lang.color : '#444');
      ctx.fillRect(x, y, btnSize, btnSize);

      ctx.strokeStyle = completed ? '#4ade80' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = '#fff';
      ctx.font = completed ? '22px Arial' : 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(completed ? '⭐' : (i + 1).toString(), x + btnSize/2, y + btnSize/2 + 6);
    }
  }

  ctx.restore();
}

// Draw lesson
function drawLesson() {
  const lang = LANGUAGES[currentLang];

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = lang.color;
  ctx.fillRect(0, 0, canvas.width, 55);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Lição ${currentLesson + 1} - ${lang.name}`, canvas.width / 2, 35);

  // Progress bar
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(20, 65, canvas.width - 40, 10);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(20, 65, ((wordIndex) / lessonWords.length) * (canvas.width - 40), 10);

  // Progress text
  ctx.fillStyle = '#888';
  ctx.font = '14px Arial';
  ctx.fillText(`${wordIndex + 1}/${lessonWords.length}`, canvas.width / 2, 95);

  if (!currentWord) return;

  // Word card
  ctx.fillStyle = '#2d2d5e';
  ctx.fillRect(40, 115, canvas.width - 80, 100);

  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 32px Arial';
  ctx.fillText(currentWord.word, canvas.width / 2, 165);

  ctx.fillStyle = '#888';
  ctx.font = '14px Arial';
  ctx.fillText(`Categoria: ${currentWord.category}`, canvas.width / 2, 200);

  // Answers
  const answerY = 240;
  currentWord.options.forEach((opt, i) => {
    const y = answerY + i * 55;
    let bgColor = '#3d3d6e';

    if (showResult) {
      if (opt === currentWord.translation) {
        bgColor = '#22c55e';
      } else if (!resultCorrect && i === selectedAnswer) {
        bgColor = '#ef4444';
      }
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(50, y, canvas.width - 100, 45);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(opt, canvas.width / 2, y + 28);
  });

  // Hint button
  if (!showResult && hints > 0) {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(canvas.width - 80, 115, 60, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`💡 ${hints}`, canvas.width - 50, 135);
  }

  // Streak display
  if (streak > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥 ${streak}`, 20, 35);
  }

  // Continue button after answer
  if (showResult) {
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(canvas.width / 2 - 80, canvas.height - 80, 160, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Continuar ▶', canvas.width / 2, canvas.height - 48);
  }
}

let selectedAnswer = -1;

// Draw lesson complete
function drawLessonComplete() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 PARABÉNS!', canvas.width / 2, canvas.height / 2 - 80);

  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial';
  ctx.fillText(`Lição Completa!`, canvas.width / 2, canvas.height / 2 - 30);

  const accuracy = Math.round((correctAnswers / lessonWords.length) * 100);
  ctx.font = '20px Arial';
  ctx.fillText(`Acertos: ${correctAnswers}/${lessonWords.length} (${accuracy}%)`, canvas.width / 2, canvas.height / 2 + 20);

  const reward = 30 + correctAnswers * 10;
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`+${reward} moedas  +${20 + correctAnswers * 3} XP`, canvas.width / 2, canvas.height / 2 + 60);

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 100, 160, 50);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Continuar', canvas.width / 2, canvas.height / 2 + 132);
}

// Draw shop
function drawShop() {
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#9333ea';
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
    const y = 80 + i * 85;

    const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;
    ctx.fillStyle = canAfford ? '#1e3a5f' : '#0d1b2a';
    ctx.fillRect(20, y, canvas.width - 40, 75);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, y, canvas.width - 40, 75);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 35, y + 30);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText(item.desc, 35, y + 52);

    ctx.fillStyle = item.gem ? '#a78bfa' : '#ffd700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${item.gem ? '💎' : '💰'} ${item.cost}`, canvas.width - 35, y + 45);
  });
}

// Main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'menu': drawMenu(); break;
    case 'lessons': drawLessons(); break;
    case 'lesson': drawLesson(); break;
    case 'complete': drawLessonComplete(); break;
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

    // Language selection
    const cardHeight = 75;
    const startY = 150;
    LANGUAGES.forEach((lang, i) => {
      const cy = startY + i * (cardHeight + 10) - langScroll;
      if (y > cy && y < cy + cardHeight && x > 25 && x < canvas.width - 25) {
        if (level >= lang.unlockLevel) {
          currentLang = i;
          lessonScroll = 0;
          gameState = 'lessons';
        }
      }
    });
  } else if (gameState === 'lessons') {
    // Back
    if (x < 85 && y < 44) {
      gameState = 'menu';
      return;
    }

    // Lesson selection
    const lang = LANGUAGES[currentLang];
    const cols = 5;
    const btnSize = 50;
    const gap = 8;
    const startY = 80;
    const gridW = cols * (btnSize + gap);
    const startX = (canvas.width - gridW) / 2;

    for (let i = 0; i < lang.lessons; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap) - lessonScroll;

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if ((lessonsCompleted[lang.id] || 0) >= i) {
          startLesson(currentLang, i);
        }
        break;
      }
    }
  } else if (gameState === 'lesson') {
    // Hint
    if (x > canvas.width - 80 && x < canvas.width - 20 && y > 115 && y < 145 && hints > 0 && !showResult) {
      hints--;
      // Remove one wrong answer visually (just show hint effect)
      createParticles(x, y, '#f59e0b', 15);
      saveGame();
      return;
    }

    if (!showResult) {
      // Answer selection
      const answerY = 240;
      currentWord.options.forEach((opt, i) => {
        const ay = answerY + i * 55;
        if (y > ay && y < ay + 45 && x > 50 && x < canvas.width - 50) {
          selectedAnswer = i;
          showResult = true;
          resultCorrect = opt === currentWord.translation;

          if (resultCorrect) {
            correctAnswers++;
            streak++;
            createParticles(canvas.width / 2, ay + 22, '#22c55e', 20);
          } else {
            wrongAnswers++;
            if (streakFreeze > 0) {
              streakFreeze--;
            } else {
              streak = 0;
            }
          }
        }
      });
    } else {
      // Continue
      if (y > canvas.height - 80 && y < canvas.height - 30) {
        showResult = false;
        wordIndex++;

        if (wordIndex >= lessonWords.length) {
          // Lesson complete
          const reward = 30 + correctAnswers * 10;
          coins += reward;
          addXP(20 + correctAnswers * 3);

          if (!lessonsCompleted[currentLang] || lessonsCompleted[currentLang] <= currentLesson) {
            lessonsCompleted[currentLang] = currentLesson + 1;
          }

          saveGame();
          gameState = 'complete';
        } else {
          currentWord = lessonWords[wordIndex];
        }
      }
    }
  } else if (gameState === 'complete') {
    if (y > canvas.height / 2 + 100 && y < canvas.height / 2 + 150) {
      gameState = 'lessons';
    }
  } else if (gameState === 'shop') {
    // Back
    if (x < 85 && y < 44) {
      gameState = 'menu';
      return;
    }

    // Purchase
    SHOP_ITEMS.forEach((item, i) => {
      const iy = 80 + i * 85;
      if (y > iy && y < iy + 75 && x > 20 && x < canvas.width - 20) {
        const canAfford = item.gem ? gems >= item.cost : coins >= item.cost;
        if (canAfford) {
          if (item.gem) gems -= item.cost;
          else coins -= item.cost;

          // Apply effect
          if (item.id === 'hint') hints += 10;
          if (item.id === 'streak_freeze') streakFreeze += 3;
          if (item.id === 'xp_boost') xpBoost = 1.5;

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
  if (gameState === 'menu') langScroll += e.deltaY * 0.5;
  else if (gameState === 'lessons') lessonScroll += e.deltaY * 0.5;
});

// Init
loadGame();
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(gameLoop);
