// Fruit Ninja Master - EAI Games
// Jogo de cortar frutas com muitos recursos avançados

class FruitNinjaGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Sistema de moedas e XP
    this.coins = parseInt(localStorage.getItem('eai_fruitninja_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('eai_fruitninja_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('eai_fruitninja_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_fruitninja_level') || '1');
    this.xpToNextLevel = this.level * 100;

    // Estado do jogo
    this.state = 'menu'; // menu, playing, gameover, shop, achievements, blades, modes
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('eai_fruitninja_highscore') || '0');
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.fruitsSliced = 0;
    this.totalFruitsSliced = parseInt(localStorage.getItem('eai_fruitninja_total_sliced') || '0');

    // Frutas
    this.fruits = [];
    this.fruitTypes = [
      { emoji: '🍎', name: 'Maçã', points: 10, frequency: 0.2, color: '#ff4444' },
      { emoji: '🍊', name: 'Laranja', points: 15, frequency: 0.18, color: '#ff8800' },
      { emoji: '🍋', name: 'Limão', points: 12, frequency: 0.15, color: '#ffff00' },
      { emoji: '🍇', name: 'Uva', points: 20, frequency: 0.12, color: '#9933ff' },
      { emoji: '🍉', name: 'Melancia', points: 25, frequency: 0.1, color: '#44ff44' },
      { emoji: '🍓', name: 'Morango', points: 18, frequency: 0.1, color: '#ff3366' },
      { emoji: '🍑', name: 'Pêssego', points: 22, frequency: 0.08, color: '#ffaa88' },
      { emoji: '🥝', name: 'Kiwi', points: 30, frequency: 0.05, color: '#88cc44' },
      { emoji: '🍍', name: 'Abacaxi', points: 35, frequency: 0.02, color: '#ffdd00' }
    ];

    // Bombas e especiais
    this.bombs = [];
    this.specials = [];
    this.specialTypes = [
      { emoji: '⭐', name: 'Estrela', effect: 'double', duration: 5000, color: '#ffff00' },
      { emoji: '❄️', name: 'Gelo', effect: 'freeze', duration: 3000, color: '#00ffff' },
      { emoji: '🔥', name: 'Fogo', effect: 'frenzy', duration: 4000, color: '#ff4400' },
      { emoji: '💎', name: 'Diamante', effect: 'diamond', duration: 0, color: '#00ffff' }
    ];

    // Efeitos ativos
    this.activeEffects = [];

    // Lâminas (blades)
    this.blades = [
      { id: 'classic', name: 'Clássica', color: '#ffffff', trail: '#88ccff', price: 0, owned: true },
      { id: 'fire', name: 'Fogo', color: '#ff4400', trail: '#ffaa00', price: 500, owned: false },
      { id: 'ice', name: 'Gelo', color: '#00ffff', trail: '#88ffff', price: 500, owned: false },
      { id: 'nature', name: 'Natureza', color: '#44ff44', trail: '#88ff88', price: 750, owned: false },
      { id: 'electric', name: 'Elétrica', color: '#ffff00', trail: '#ffffaa', price: 1000, owned: false },
      { id: 'shadow', name: 'Sombra', color: '#8844ff', trail: '#aa88ff', price: 1500, owned: false },
      { id: 'rainbow', name: 'Arco-íris', color: '#ff88ff', trail: '#ffaaff', price: 2000, owned: false },
      { id: 'golden', name: 'Dourada', color: '#ffd700', trail: '#fff8dc', price: 3000, owned: false }
    ];
    this.currentBlade = localStorage.getItem('eai_fruitninja_blade') || 'classic';
    this.loadBlades();

    // Modos de jogo
    this.modes = [
      { id: 'classic', name: 'Clássico', desc: '3 vidas, sem tempo', unlocked: true },
      { id: 'arcade', name: 'Arcade', desc: '60 segundos', unlocked: true },
      { id: 'zen', name: 'Zen', desc: 'Relaxe sem bombas', unlocked: false, requiredLevel: 5 },
      { id: 'challenge', name: 'Desafio', desc: 'Missões especiais', unlocked: false, requiredLevel: 10 },
      { id: 'extreme', name: 'Extremo', desc: 'Velocidade máxima', unlocked: false, requiredLevel: 15 }
    ];
    this.currentMode = 'classic';
    this.timeLeft = 0;

    // Trail do corte
    this.trail = [];
    this.sliceTrail = [];
    this.isSlicing = false;
    this.lastSliceTime = 0;

    // Partículas
    this.particles = [];
    this.slicedFruits = [];

    // Upgrades da loja
    this.upgrades = [
      { id: 'extraLife', name: 'Vida Extra', desc: '+1 vida inicial', price: 300, level: 0, maxLevel: 3, effect: 1 },
      { id: 'comboBonus', name: 'Bônus Combo', desc: '+20% pontos combo', price: 400, level: 0, maxLevel: 5, effect: 0.2 },
      { id: 'fruitMagnet', name: 'Imã de Frutas', desc: 'Frutas mais lentas', price: 500, level: 0, maxLevel: 3, effect: 0.1 },
      { id: 'doubleCoins', name: 'Moedas x2', desc: 'Dobra as moedas', price: 1000, level: 0, maxLevel: 1, effect: 2 },
      { id: 'bombShield', name: 'Escudo Bomba', desc: 'Ignora 1 bomba/jogo', price: 750, level: 0, maxLevel: 2, effect: 1 },
      { id: 'starDuration', name: 'Duração Estrela', desc: '+2s power-ups', price: 600, level: 0, maxLevel: 3, effect: 2000 }
    ];
    this.loadUpgrades();
    this.bombShields = 0;

    // Conquistas
    this.achievements = [
      { id: 'first_slice', name: 'Primeira Fatia', desc: 'Corte sua primeira fruta', icon: '🔰', unlocked: false, condition: () => this.totalFruitsSliced >= 1 },
      { id: 'slice_100', name: 'Aprendiz', desc: 'Corte 100 frutas', icon: '🥉', unlocked: false, condition: () => this.totalFruitsSliced >= 100 },
      { id: 'slice_500', name: 'Ninja', desc: 'Corte 500 frutas', icon: '🥈', unlocked: false, condition: () => this.totalFruitsSliced >= 500 },
      { id: 'slice_1000', name: 'Mestre Ninja', desc: 'Corte 1000 frutas', icon: '🥇', unlocked: false, condition: () => this.totalFruitsSliced >= 1000 },
      { id: 'combo_10', name: 'Combo x10', desc: 'Faça um combo de 10', icon: '🔥', unlocked: false, condition: () => this.maxCombo >= 10 },
      { id: 'combo_20', name: 'Combo Lendário', desc: 'Faça um combo de 20', icon: '💥', unlocked: false, condition: () => this.maxCombo >= 20 },
      { id: 'score_1000', name: 'Pontuador', desc: 'Faça 1000 pontos', icon: '⭐', unlocked: false, condition: () => this.highScore >= 1000 },
      { id: 'score_5000', name: 'Veterano', desc: 'Faça 5000 pontos', icon: '🌟', unlocked: false, condition: () => this.highScore >= 5000 },
      { id: 'level_10', name: 'Expert', desc: 'Alcance nível 10', icon: '🎖️', unlocked: false, condition: () => this.level >= 10 },
      { id: 'all_blades', name: 'Colecionador', desc: 'Tenha todas as lâminas', icon: '⚔️', unlocked: false, condition: () => this.blades.every(b => b.owned) }
    ];
    this.loadAchievements();
    this.notifications = [];

    // Desafios diários
    this.dailyChallenges = [
      { desc: 'Corte 50 frutas', target: 50, current: 0, reward: 100 },
      { desc: 'Faça combo de 5', target: 5, current: 0, reward: 150 },
      { desc: 'Alcance 500 pontos', target: 500, current: 0, reward: 200 }
    ];
    this.loadDailyChallenges();

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_fruitninja_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo!', lines: ['Deslize para cortar as frutas!', 'Quanto mais frutas cortar de uma vez,', 'maior será o seu combo!'], emoji: '🍉' },
      { title: 'Cuidado!', lines: ['Evite as bombas 💣', 'Elas tiram uma vida!', 'Pegue os power-ups especiais!'], emoji: '💣' },
      { title: 'Power-ups', lines: ['⭐ Pontos em dobro', '❄️ Congela frutas', '🔥 Modo frenético', '💎 Ganhe diamantes!'], emoji: '✨' },
      { title: 'Loja', lines: ['Compre novas lâminas!', 'Melhore suas habilidades!', 'Ganhe moedas jogando!'], emoji: '🛒' }
    ];

    // Controles
    this.setupControls();

    // Game loop
    this.lastTime = 0;
    this.spawnTimer = 0;
    this.difficultyTimer = 0;
    this.difficulty = 1;

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupControls() {
    // Mouse
    this.canvas.addEventListener('mousedown', (e) => this.startSlice(e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => this.updateSlice(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', () => this.endSlice());
    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.startSlice(touch.clientX, touch.clientY);
      this.handleClick(touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.updateSlice(touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchend', () => this.endSlice());
  }

  startSlice(x, y) {
    if (this.state === 'playing') {
      this.isSlicing = true;
      this.trail = [{ x, y, time: Date.now() }];
      this.sliceTrail = [];
    }
  }

  updateSlice(x, y) {
    if (this.isSlicing && this.state === 'playing') {
      const now = Date.now();
      this.trail.push({ x, y, time: now });
      this.sliceTrail.push({ x, y, alpha: 1 });

      // Limpar trail antigo
      this.trail = this.trail.filter(p => now - p.time < 100);

      // Verificar colisões
      this.checkSliceCollisions(x, y);
    }
  }

  endSlice() {
    this.isSlicing = false;
    if (this.combo > 0) {
      this.applyComboBonus();
      this.combo = 0;
    }
  }

  checkSliceCollisions(x, y) {
    // Verificar frutas
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const fruit = this.fruits[i];
      const dist = Math.sqrt((x - fruit.x) ** 2 + (y - fruit.y) ** 2);

      if (dist < fruit.size) {
        this.sliceFruit(fruit, i);
      }
    }

    // Verificar bombas
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      const dist = Math.sqrt((x - bomb.x) ** 2 + (y - bomb.y) ** 2);

      if (dist < bomb.size) {
        this.hitBomb(i);
      }
    }

    // Verificar especiais
    for (let i = this.specials.length - 1; i >= 0; i--) {
      const special = this.specials[i];
      const dist = Math.sqrt((x - special.x) ** 2 + (y - special.y) ** 2);

      if (dist < special.size) {
        this.collectSpecial(special, i);
      }
    }
  }

  sliceFruit(fruit, index) {
    // Calcular pontos
    let points = fruit.type.points;

    // Bônus de combo
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const comboUpgrade = this.upgrades.find(u => u.id === 'comboBonus');
    const comboMultiplier = 1 + (this.combo - 1) * 0.5 * (1 + comboUpgrade.level * comboUpgrade.effect);
    points = Math.floor(points * comboMultiplier);

    // Efeito double
    if (this.hasEffect('double')) {
      points *= 2;
    }

    this.score += points;
    this.fruitsSliced++;
    this.totalFruitsSliced++;

    // Moedas
    let coinGain = Math.floor(points / 10);
    const doubleCoins = this.upgrades.find(u => u.id === 'doubleCoins');
    if (doubleCoins.level > 0) coinGain *= 2;
    this.coins += coinGain;

    // Partículas
    this.createSliceEffect(fruit);

    // Adicionar fruta cortada
    this.slicedFruits.push({
      emoji: fruit.type.emoji,
      x: fruit.x,
      y: fruit.y,
      vx: (Math.random() - 0.5) * 10,
      vy: -5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      alpha: 1,
      half: 'left'
    });
    this.slicedFruits.push({
      emoji: fruit.type.emoji,
      x: fruit.x,
      y: fruit.y,
      vx: (Math.random() - 0.5) * 10 + 5,
      vy: -5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      alpha: 1,
      half: 'right'
    });

    // Notificação de combo
    if (this.combo >= 3) {
      this.addNotification(`Combo x${this.combo}! +${points}`, fruit.x, fruit.y);
    }

    this.fruits.splice(index, 1);
    this.lastSliceTime = Date.now();

    // Atualizar desafios
    this.dailyChallenges[0].current++;
    if (this.combo > this.dailyChallenges[1].current) {
      this.dailyChallenges[1].current = this.combo;
    }
  }

  hitBomb(index) {
    const bombShieldUpgrade = this.upgrades.find(u => u.id === 'bombShield');

    if (this.bombShields > 0) {
      this.bombShields--;
      this.addNotification('Escudo usado!', this.bombs[index].x, this.bombs[index].y);
      this.createExplosion(this.bombs[index].x, this.bombs[index].y, '#ffaa00');
    } else {
      this.lives--;
      this.createExplosion(this.bombs[index].x, this.bombs[index].y, '#ff0000');
      this.addNotification('💥 BOOM!', this.bombs[index].x, this.bombs[index].y);

      if (this.lives <= 0) {
        this.endGame();
      }
    }

    this.bombs.splice(index, 1);
  }

  collectSpecial(special, index) {
    const starUpgrade = this.upgrades.find(u => u.id === 'starDuration');
    const extraDuration = starUpgrade.level * starUpgrade.effect;

    if (special.type.effect === 'diamond') {
      this.diamonds += 1;
      this.addNotification('+1 💎', special.x, special.y);
    } else {
      this.activeEffects.push({
        effect: special.type.effect,
        endTime: Date.now() + special.type.duration + extraDuration
      });
      this.addNotification(`${special.type.name} ativado!`, special.x, special.y);
    }

    this.createSliceEffect({ x: special.x, y: special.y, type: { color: special.type.color } });
    this.specials.splice(index, 1);
  }

  hasEffect(effect) {
    return this.activeEffects.some(e => e.effect === effect && Date.now() < e.endTime);
  }

  applyComboBonus() {
    if (this.combo >= 3) {
      const bonus = this.combo * 10;
      this.score += bonus;
      this.xp += this.combo;
    }
  }

  createSliceEffect(fruit) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: fruit.x,
        y: fruit.y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        size: Math.random() * 8 + 4,
        color: fruit.type.color,
        alpha: 1,
        life: 1
      });
    }
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 10,
        vy: Math.sin(angle) * 10,
        size: Math.random() * 10 + 5,
        color,
        alpha: 1,
        life: 1
      });
    }
  }

  addNotification(text, x, y) {
    this.notifications.push({ text, x, y, alpha: 1, vy: -2 });
  }

  spawnFruit() {
    const type = this.selectFruitType();
    const side = Math.random();
    let x, vx;

    if (side < 0.4) {
      x = Math.random() * this.canvas.width * 0.3;
      vx = Math.random() * 3 + 2;
    } else if (side < 0.8) {
      x = this.canvas.width * 0.7 + Math.random() * this.canvas.width * 0.3;
      vx = -(Math.random() * 3 + 2);
    } else {
      x = this.canvas.width * 0.3 + Math.random() * this.canvas.width * 0.4;
      vx = (Math.random() - 0.5) * 4;
    }

    const magnetUpgrade = this.upgrades.find(u => u.id === 'fruitMagnet');
    const slowFactor = 1 - magnetUpgrade.level * magnetUpgrade.effect;

    this.fruits.push({
      x,
      y: this.canvas.height + 50,
      vx: vx * slowFactor,
      vy: -(Math.random() * 5 + 12) * Math.sqrt(this.difficulty) * slowFactor,
      size: 40,
      type,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    });
  }

  selectFruitType() {
    const rand = Math.random();
    let cumulative = 0;

    for (const type of this.fruitTypes) {
      cumulative += type.frequency;
      if (rand < cumulative) return type;
    }

    return this.fruitTypes[0];
  }

  spawnBomb() {
    if (this.currentMode === 'zen') return;

    const x = Math.random() * (this.canvas.width - 100) + 50;

    this.bombs.push({
      x,
      y: this.canvas.height + 50,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 5 + 10) * Math.sqrt(this.difficulty),
      size: 35,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    });
  }

  spawnSpecial() {
    const type = this.specialTypes[Math.floor(Math.random() * this.specialTypes.length)];
    const x = Math.random() * (this.canvas.width - 100) + 50;

    this.specials.push({
      x,
      y: this.canvas.height + 50,
      vx: (Math.random() - 0.5) * 3,
      vy: -(Math.random() * 4 + 8),
      size: 35,
      type,
      rotation: 0,
      rotationSpeed: 0.1,
      glow: 0
    });
  }

  startGame(mode = 'classic') {
    this.currentMode = mode;
    this.state = 'playing';
    this.score = 0;
    this.combo = 0;
    this.fruitsSliced = 0;
    this.fruits = [];
    this.bombs = [];
    this.specials = [];
    this.particles = [];
    this.slicedFruits = [];
    this.notifications = [];
    this.activeEffects = [];
    this.difficulty = 1;
    this.spawnTimer = 0;
    this.difficultyTimer = 0;

    const extraLifeUpgrade = this.upgrades.find(u => u.id === 'extraLife');
    this.maxLives = 3 + extraLifeUpgrade.level * extraLifeUpgrade.effect;
    this.lives = this.maxLives;

    const bombShieldUpgrade = this.upgrades.find(u => u.id === 'bombShield');
    this.bombShields = bombShieldUpgrade.level * bombShieldUpgrade.effect;

    if (mode === 'arcade') {
      this.timeLeft = 60;
    } else if (mode === 'extreme') {
      this.difficulty = 2;
      this.timeLeft = 45;
    }
  }

  endGame() {
    this.state = 'gameover';

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('eai_fruitninja_highscore', this.highScore.toString());
    }

    // XP e level up
    const xpGained = Math.floor(this.score / 10);
    this.xp += xpGained;

    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = this.level * 100;
    }

    // Atualizar desafio de pontuação
    if (this.score > this.dailyChallenges[2].current) {
      this.dailyChallenges[2].current = this.score;
    }

    // Verificar conquistas
    this.checkAchievements();

    // Desbloquear modos
    this.modes.forEach(mode => {
      if (!mode.unlocked && mode.requiredLevel && this.level >= mode.requiredLevel) {
        mode.unlocked = true;
      }
    });

    this.save();
  }

  update(deltaTime) {
    if (this.state !== 'playing') return;

    // Timer para modos com tempo
    if (this.currentMode === 'arcade' || this.currentMode === 'extreme') {
      this.timeLeft -= deltaTime / 1000;
      if (this.timeLeft <= 0) {
        this.endGame();
        return;
      }
    }

    // Spawn de frutas
    this.spawnTimer += deltaTime;
    const spawnInterval = this.hasEffect('frenzy') ? 300 : 800 / this.difficulty;

    if (this.spawnTimer > spawnInterval) {
      this.spawnTimer = 0;

      const fruitsToSpawn = this.hasEffect('frenzy') ? 3 : Math.ceil(this.difficulty);
      for (let i = 0; i < fruitsToSpawn; i++) {
        this.spawnFruit();
      }

      // Chance de bomba
      if (Math.random() < 0.15 * this.difficulty) {
        this.spawnBomb();
      }

      // Chance de especial
      if (Math.random() < 0.05) {
        this.spawnSpecial();
      }
    }

    // Aumentar dificuldade
    this.difficultyTimer += deltaTime;
    if (this.difficultyTimer > 10000) {
      this.difficultyTimer = 0;
      this.difficulty = Math.min(this.difficulty + 0.2, 3);
    }

    // Atualizar frutas
    const gravity = this.hasEffect('freeze') ? 0.1 : 0.3;

    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const fruit = this.fruits[i];
      fruit.x += fruit.vx;
      fruit.vy += gravity;
      fruit.y += fruit.vy;
      fruit.rotation += fruit.rotationSpeed;

      if (fruit.y > this.canvas.height + 100) {
        this.fruits.splice(i, 1);
        // Perder vida por fruta perdida apenas no clássico
        if (this.currentMode === 'classic') {
          // Não perde vida, apenas pontos
        }
      }
    }

    // Atualizar bombas
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.x += bomb.vx;
      bomb.vy += gravity;
      bomb.y += bomb.vy;
      bomb.rotation += bomb.rotationSpeed;

      if (bomb.y > this.canvas.height + 100) {
        this.bombs.splice(i, 1);
      }
    }

    // Atualizar especiais
    for (let i = this.specials.length - 1; i >= 0; i--) {
      const special = this.specials[i];
      special.x += special.vx;
      special.vy += gravity * 0.5;
      special.y += special.vy;
      special.rotation += special.rotationSpeed;
      special.glow = (special.glow + 0.1) % (Math.PI * 2);

      if (special.y > this.canvas.height + 100) {
        this.specials.splice(i, 1);
      }
    }

    // Atualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= 0.02;
      p.alpha = p.life;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Atualizar frutas cortadas
    for (let i = this.slicedFruits.length - 1; i >= 0; i--) {
      const sf = this.slicedFruits[i];
      sf.x += sf.vx;
      sf.vy += 0.5;
      sf.y += sf.vy;
      sf.rotation += sf.rotationSpeed;
      sf.alpha -= 0.015;

      if (sf.alpha <= 0) {
        this.slicedFruits.splice(i, 1);
      }
    }

    // Atualizar trail
    for (let i = this.sliceTrail.length - 1; i >= 0; i--) {
      this.sliceTrail[i].alpha -= 0.05;
      if (this.sliceTrail[i].alpha <= 0) {
        this.sliceTrail.splice(i, 1);
      }
    }

    // Atualizar notificações
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.y += n.vy;
      n.alpha -= 0.02;

      if (n.alpha <= 0) {
        this.notifications.splice(i, 1);
      }
    }

    // Limpar efeitos expirados
    this.activeEffects = this.activeEffects.filter(e => Date.now() < e.endTime);
  }

  draw() {
    // Fundo
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a472a');
    gradient.addColorStop(1, '#0d2818');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Decoração de fundo
    this.ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5; i++) {
      this.ctx.font = '100px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('🍃', (i * 200 + Date.now() * 0.02) % (this.canvas.width + 200) - 100,
                        this.canvas.height * 0.3 + Math.sin(Date.now() * 0.001 + i) * 50);
    }
    this.ctx.globalAlpha = 1;

    if (this.state === 'menu') {
      this.drawMenu();
    } else if (this.state === 'playing') {
      this.drawGame();
    } else if (this.state === 'gameover') {
      this.drawGameOver();
    } else if (this.state === 'shop') {
      this.drawShop();
    } else if (this.state === 'achievements') {
      this.drawAchievements();
    } else if (this.state === 'blades') {
      this.drawBlades();
    } else if (this.state === 'modes') {
      this.drawModes();
    }

    if (this.showTutorial) {
      this.drawTutorial();
    }
  }

  drawMenu() {
    const cx = this.canvas.width / 2;

    // Título
    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#FF9800';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('🍉 FRUIT NINJA 🍉', cx, 100);
    this.ctx.shadowBlur = 0;

    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#8BC34A';
    this.ctx.fillText('MASTER', cx, 135);

    // Moedas e diamantes
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 40);
    this.ctx.fillStyle = '#00BCD4';
    this.ctx.fillText(`💎 ${this.diamonds}`, 20, 70);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillText(`⭐ Nível ${this.level}`, 20, 100);

    // High score
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFF59D';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`🏆 Recorde: ${this.highScore}`, cx, 170);

    // Botões
    const buttons = [
      { text: '▶️ JOGAR', y: 220, action: 'play' },
      { text: '🎮 MODOS', y: 290, action: 'modes' },
      { text: '⚔️ LÂMINAS', y: 360, action: 'blades' },
      { text: '🛒 LOJA', y: 430, action: 'shop' },
      { text: '🏆 CONQUISTAS', y: 500, action: 'achievements' }
    ];

    buttons.forEach(btn => {
      const btnWidth = 250;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 15);
      this.ctx.fill();

      this.ctx.strokeStyle = '#8BC34A';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      this.ctx.font = 'bold 22px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(btn.text, cx, btn.y + 37);
    });

    // Desafios diários
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFF59D';
    this.ctx.fillText('📋 Desafios Diários', cx, this.canvas.height - 120);

    this.dailyChallenges.forEach((challenge, i) => {
      const progress = Math.min(challenge.current / challenge.target, 1);
      const completed = progress >= 1;

      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = completed ? '#4CAF50' : '#BDBDBD';
      this.ctx.fillText(
        `${completed ? '✅' : '⬜'} ${challenge.desc} (${challenge.current}/${challenge.target}) +${challenge.reward}🪙`,
        cx, this.canvas.height - 90 + i * 25
      );
    });
  }

  drawGame() {
    // Frutas cortadas (atrás)
    this.slicedFruits.forEach(sf => {
      this.ctx.save();
      this.ctx.translate(sf.x, sf.y);
      this.ctx.rotate(sf.rotation);
      this.ctx.globalAlpha = sf.alpha;
      this.ctx.font = '35px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Clipar metade
      this.ctx.beginPath();
      if (sf.half === 'left') {
        this.ctx.rect(-30, -30, 30, 60);
      } else {
        this.ctx.rect(0, -30, 30, 60);
      }
      this.ctx.clip();
      this.ctx.fillText(sf.emoji, 0, 0);
      this.ctx.restore();
    });

    // Partículas
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Frutas
    this.fruits.forEach(fruit => {
      this.ctx.save();
      this.ctx.translate(fruit.x, fruit.y);
      this.ctx.rotate(fruit.rotation);
      this.ctx.font = `${fruit.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(fruit.type.emoji, 0, 0);
      this.ctx.restore();
    });

    // Bombas
    this.bombs.forEach(bomb => {
      this.ctx.save();
      this.ctx.translate(bomb.x, bomb.y);
      this.ctx.rotate(bomb.rotation);
      this.ctx.font = `${bomb.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('💣', 0, 0);
      this.ctx.restore();
    });

    // Especiais
    this.specials.forEach(special => {
      this.ctx.save();
      this.ctx.translate(special.x, special.y);

      // Glow
      this.ctx.shadowColor = special.type.color;
      this.ctx.shadowBlur = 15 + Math.sin(special.glow) * 5;

      this.ctx.rotate(special.rotation);
      this.ctx.font = `${special.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(special.type.emoji, 0, 0);
      this.ctx.restore();
    });

    // Trail de corte
    if (this.sliceTrail.length > 1) {
      const blade = this.blades.find(b => b.id === this.currentBlade);

      this.ctx.beginPath();
      this.ctx.moveTo(this.sliceTrail[0].x, this.sliceTrail[0].y);

      for (let i = 1; i < this.sliceTrail.length; i++) {
        this.ctx.lineTo(this.sliceTrail[i].x, this.sliceTrail[i].y);
      }

      this.ctx.strokeStyle = blade.trail;
      this.ctx.lineWidth = 8;
      this.ctx.lineCap = 'round';
      this.ctx.globalAlpha = 0.6;
      this.ctx.stroke();

      this.ctx.strokeStyle = blade.color;
      this.ctx.lineWidth = 3;
      this.ctx.globalAlpha = 0.9;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }

    // Notificações
    this.notifications.forEach(n => {
      this.ctx.globalAlpha = n.alpha;
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 5;
      this.ctx.fillText(n.text, n.x, n.y);
      this.ctx.shadowBlur = 0;
    });
    this.ctx.globalAlpha = 1;

    // HUD
    this.drawHUD();
  }

  drawHUD() {
    // Pontuação
    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.textAlign = 'left';
    this.ctx.shadowColor = '#000';
    this.ctx.shadowBlur = 5;
    this.ctx.fillText(`${this.score}`, 20, 45);
    this.ctx.shadowBlur = 0;

    // Vidas
    let livesText = '';
    for (let i = 0; i < this.maxLives; i++) {
      livesText += i < this.lives ? '❤️' : '🖤';
    }
    this.ctx.font = '24px Arial';
    this.ctx.fillText(livesText, 20, 85);

    // Combo
    if (this.combo > 0) {
      this.ctx.font = 'bold 28px Arial';
      this.ctx.fillStyle = '#FF5722';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`x${this.combo}`, this.canvas.width - 20, 45);
    }

    // Timer (se houver)
    if (this.currentMode === 'arcade' || this.currentMode === 'extreme') {
      this.ctx.font = 'bold 28px Arial';
      this.ctx.fillStyle = this.timeLeft < 10 ? '#FF5722' : '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`⏱️ ${Math.ceil(this.timeLeft)}s`, this.canvas.width / 2, 45);
    }

    // Efeitos ativos
    let effectY = 120;
    this.activeEffects.forEach(e => {
      const remaining = Math.ceil((e.endTime - Date.now()) / 1000);
      let icon = '';
      if (e.effect === 'double') icon = '⭐';
      if (e.effect === 'freeze') icon = '❄️';
      if (e.effect === 'frenzy') icon = '🔥';

      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${icon} ${remaining}s`, 20, effectY);
      effectY += 30;
    });

    // Escudos de bomba
    if (this.bombShields > 0) {
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = '#00BCD4';
      this.ctx.fillText(`🛡️ ${this.bombShields}`, 20, effectY);
    }
  }

  drawGameOver() {
    // Overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;

    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#FF5722';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FIM DE JOGO!', cx, 100);

    this.ctx.font = '28px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.fillText(`Pontuação: ${this.score}`, cx, 160);

    if (this.score >= this.highScore) {
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.fillText('🎉 NOVO RECORDE! 🎉', cx, 200);
    }

    // Estatísticas
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Frutas cortadas: ${this.fruitsSliced}`, cx, 260);
    this.ctx.fillText(`Maior combo: x${this.maxCombo}`, cx, 295);
    this.ctx.fillText(`Moedas ganhas: +${Math.floor(this.score / 10)}`, cx, 330);
    this.ctx.fillText(`XP ganho: +${Math.floor(this.score / 10)}`, cx, 365);

    // Botões
    const buttons = [
      { text: '🔄 JOGAR NOVAMENTE', y: 430, action: 'restart' },
      { text: '🏠 MENU', y: 500, action: 'menu' }
    ];

    buttons.forEach(btn => {
      const btnWidth = 280;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 15);
      this.ctx.fill();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 35);
    });
  }

  drawShop() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛒 LOJA DE UPGRADES', cx, 45);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 70);

    // Upgrades
    const startY = 100;
    this.upgrades.forEach((upgrade, index) => {
      const y = startY + index * 85;
      const maxed = upgrade.level >= upgrade.maxLevel;
      const canBuy = !maxed && this.coins >= upgrade.price;

      this.ctx.fillStyle = maxed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 75, 10);
      this.ctx.fill();

      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = maxed ? '#4CAF50' : '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(upgrade.name, 30, y + 25);

      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = '#BDBDBD';
      this.ctx.fillText(upgrade.desc, 30, y + 45);

      // Nível
      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = '#8BC34A';
      this.ctx.fillText(`Nível ${upgrade.level}/${upgrade.maxLevel}`, 30, y + 65);

      // Botão comprar
      if (!maxed) {
        const btnX = this.canvas.width - 120;
        this.ctx.fillStyle = canBuy ? 'rgba(255, 193, 7, 0.8)' : 'rgba(158, 158, 158, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(btnX, y + 20, 90, 35, 8);
        this.ctx.fill();

        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = canBuy ? '#000' : '#666';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`🪙 ${upgrade.price}`, btnX + 45, y + 43);
      } else {
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('MÁXIMO', this.canvas.width - 30, y + 45);
      }
    });

    // Botão voltar
    this.drawBackButton();
  }

  drawBlades() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⚔️ LÂMINAS', cx, 45);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 70);

    // Lâminas
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 100;

    this.blades.forEach((blade, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = 100 + row * (itemHeight + 10);

      const isSelected = blade.id === this.currentBlade;
      const canBuy = !blade.owned && this.coins >= blade.price;

      this.ctx.fillStyle = isSelected ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, itemWidth, itemHeight, 10);
      this.ctx.fill();

      if (isSelected) {
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      }

      // Preview da lâmina
      this.ctx.strokeStyle = blade.trail;
      this.ctx.lineWidth = 6;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 20, y + 50);
      this.ctx.lineTo(x + 60, y + 50);
      this.ctx.stroke();

      this.ctx.strokeStyle = blade.color;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Nome
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(blade.name, x + 75, y + 35);

      // Status/Preço
      if (blade.owned) {
        if (isSelected) {
          this.ctx.font = '14px Arial';
          this.ctx.fillStyle = '#4CAF50';
          this.ctx.fillText('✓ Equipada', x + 75, y + 55);
        } else {
          this.ctx.font = '14px Arial';
          this.ctx.fillStyle = '#8BC34A';
          this.ctx.fillText('Equipar', x + 75, y + 55);
        }
      } else {
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = canBuy ? '#FFD700' : '#666';
        this.ctx.fillText(`🪙 ${blade.price}`, x + 75, y + 55);
      }
    });

    this.drawBackButton();
  }

  drawModes() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎮 MODOS DE JOGO', cx, 50);

    // Modos
    this.modes.forEach((mode, index) => {
      const y = 100 + index * 100;

      this.ctx.fillStyle = mode.unlocked ? 'rgba(76, 175, 80, 0.3)' : 'rgba(100, 100, 100, 0.3)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 85, 10);
      this.ctx.fill();

      this.ctx.font = 'bold 22px Arial';
      this.ctx.fillStyle = mode.unlocked ? '#ffffff' : '#666';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(mode.name, 30, y + 35);

      this.ctx.font = '16px Arial';
      this.ctx.fillStyle = mode.unlocked ? '#BDBDBD' : '#555';
      this.ctx.fillText(mode.desc, 30, y + 60);

      if (!mode.unlocked) {
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#FF9800';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`🔒 Nível ${mode.requiredLevel}`, this.canvas.width - 30, y + 50);
      } else {
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('▶️ JOGAR', this.canvas.width - 30, y + 50);
      }
    });

    this.drawBackButton();
  }

  drawAchievements() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🏆 CONQUISTAS', cx, 50);

    const unlocked = this.achievements.filter(a => a.unlocked).length;
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#8BC34A';
    this.ctx.fillText(`${unlocked}/${this.achievements.length} desbloqueadas`, cx, 75);

    // Conquistas
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 80;

    this.achievements.forEach((ach, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = 100 + row * (itemHeight + 10);

      this.ctx.fillStyle = ach.unlocked ? 'rgba(76, 175, 80, 0.4)' : 'rgba(50, 50, 50, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, itemWidth, itemHeight, 10);
      this.ctx.fill();

      // Ícone
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ach.unlocked ? ach.icon : '🔒', x + 30, y + 45);

      // Texto
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillStyle = ach.unlocked ? '#ffffff' : '#666';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(ach.name, x + 55, y + 30);

      this.ctx.font = '11px Arial';
      this.ctx.fillStyle = ach.unlocked ? '#BDBDBD' : '#555';
      this.ctx.fillText(ach.desc, x + 55, y + 50);
    });

    this.drawBackButton();
  }

  drawBackButton() {
    const btnWidth = 120;
    const btnHeight = 45;
    const btnX = (this.canvas.width - btnWidth) / 2;
    const btnY = this.canvas.height - 70;

    this.ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 10);
    this.ctx.fill();

    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← VOLTAR', this.canvas.width / 2, btnY + 30);
  }

  drawTutorial() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const page = this.tutorialPages[this.tutorialPage];

    // Emoji
    this.ctx.font = '80px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(page.emoji, cx, 150);

    // Título
    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.fillText(page.title, cx, 220);

    // Linhas
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#ffffff';
    page.lines.forEach((line, i) => {
      this.ctx.fillText(line, cx, 280 + i * 35);
    });

    // Indicadores de página
    const dotY = this.canvas.height - 150;
    for (let i = 0; i < this.tutorialPages.length; i++) {
      this.ctx.fillStyle = i === this.tutorialPage ? '#4CAF50' : '#666';
      this.ctx.beginPath();
      this.ctx.arc(cx - 30 + i * 20, dotY, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Botão
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = cx - btnWidth / 2;
    const btnY = this.canvas.height - 100;

    this.ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 12);
    this.ctx.fill();

    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#ffffff';
    const btnText = this.tutorialPage < this.tutorialPages.length - 1 ? 'PRÓXIMO →' : 'COMEÇAR! 🍉';
    this.ctx.fillText(btnText, cx, btnY + 33);
  }

  handleClick(x, y) {
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

    const cx = this.canvas.width / 2;

    if (this.state === 'menu') {
      const buttons = [
        { y: 220, action: () => this.startGame(this.currentMode) },
        { y: 290, action: () => this.state = 'modes' },
        { y: 360, action: () => this.state = 'blades' },
        { y: 430, action: () => this.state = 'shop' },
        { y: 500, action: () => this.state = 'achievements' }
      ];

      buttons.forEach(btn => {
        if (x > cx - 125 && x < cx + 125 && y > btn.y && y < btn.y + 55) {
          btn.action();
        }
      });
    } else if (this.state === 'gameover') {
      if (y > 430 && y < 485) {
        this.startGame(this.currentMode);
      } else if (y > 500 && y < 555) {
        this.state = 'menu';
      }
    } else if (this.state === 'shop') {
      this.handleShopClick(x, y);
    } else if (this.state === 'blades') {
      this.handleBladesClick(x, y);
    } else if (this.state === 'modes') {
      this.handleModesClick(x, y);
    } else if (this.state === 'achievements' || this.state === 'shop' || this.state === 'blades' || this.state === 'modes') {
      // Botão voltar
      const btnY = this.canvas.height - 70;
      if (y > btnY && y < btnY + 45 && x > cx - 60 && x < cx + 60) {
        this.state = 'menu';
      }
    }
  }

  handleTutorialClick(x, y) {
    const cx = this.canvas.width / 2;
    const btnY = this.canvas.height - 100;

    if (y > btnY && y < btnY + 50 && x > cx - 100 && x < cx + 100) {
      if (this.tutorialPage < this.tutorialPages.length - 1) {
        this.tutorialPage++;
      } else {
        this.showTutorial = false;
        localStorage.setItem('eai_fruitninja_tutorial_seen', 'true');
      }
    }
  }

  handleShopClick(x, y) {
    const startY = 100;

    this.upgrades.forEach((upgrade, index) => {
      const itemY = startY + index * 85;
      const btnX = this.canvas.width - 120;

      if (x > btnX && x < btnX + 90 && y > itemY + 20 && y < itemY + 55) {
        if (upgrade.level < upgrade.maxLevel && this.coins >= upgrade.price) {
          this.coins -= upgrade.price;
          upgrade.level++;
          upgrade.price = Math.floor(upgrade.price * 1.5);
          this.save();
        }
      }
    });

    // Botão voltar
    const btnY = this.canvas.height - 70;
    const cx = this.canvas.width / 2;
    if (y > btnY && y < btnY + 45 && x > cx - 60 && x < cx + 60) {
      this.state = 'menu';
    }
  }

  handleBladesClick(x, y) {
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 100;

    this.blades.forEach((blade, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const itemX = 20 + col * (itemWidth + 10);
      const itemY = 100 + row * (itemHeight + 10);

      if (x > itemX && x < itemX + itemWidth && y > itemY && y < itemY + itemHeight) {
        if (blade.owned) {
          this.currentBlade = blade.id;
          localStorage.setItem('eai_fruitninja_blade', blade.id);
        } else if (this.coins >= blade.price) {
          this.coins -= blade.price;
          blade.owned = true;
          this.currentBlade = blade.id;
          this.save();
        }
      }
    });

    // Botão voltar
    const btnY = this.canvas.height - 70;
    const cx = this.canvas.width / 2;
    if (y > btnY && y < btnY + 45 && x > cx - 60 && x < cx + 60) {
      this.state = 'menu';
    }
  }

  handleModesClick(x, y) {
    this.modes.forEach((mode, index) => {
      const itemY = 100 + index * 100;

      if (x > 20 && x < this.canvas.width - 20 && y > itemY && y < itemY + 85) {
        if (mode.unlocked) {
          this.startGame(mode.id);
        }
      }
    });

    // Botão voltar
    const btnY = this.canvas.height - 70;
    const cx = this.canvas.width / 2;
    if (y > btnY && y < btnY + 45 && x > cx - 60 && x < cx + 60) {
      this.state = 'menu';
    }
  }

  checkAchievements() {
    this.achievements.forEach(ach => {
      if (!ach.unlocked && ach.condition()) {
        ach.unlocked = true;
        this.diamonds += 5;
        this.addNotification(`🏆 ${ach.name}!`, this.canvas.width / 2, this.canvas.height / 2);
      }
    });
    this.saveAchievements();
  }

  save() {
    localStorage.setItem('eai_fruitninja_coins', this.coins.toString());
    localStorage.setItem('eai_fruitninja_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_fruitninja_xp', this.xp.toString());
    localStorage.setItem('eai_fruitninja_level', this.level.toString());
    localStorage.setItem('eai_fruitninja_total_sliced', this.totalFruitsSliced.toString());
    this.saveUpgrades();
    this.saveBlades();
    this.saveDailyChallenges();
  }

  loadUpgrades() {
    const saved = localStorage.getItem('eai_fruitninja_upgrades');
    if (saved) {
      const data = JSON.parse(saved);
      this.upgrades.forEach(u => {
        if (data[u.id]) {
          u.level = data[u.id].level;
          u.price = data[u.id].price;
        }
      });
    }
  }

  saveUpgrades() {
    const data = {};
    this.upgrades.forEach(u => {
      data[u.id] = { level: u.level, price: u.price };
    });
    localStorage.setItem('eai_fruitninja_upgrades', JSON.stringify(data));
  }

  loadBlades() {
    const saved = localStorage.getItem('eai_fruitninja_blades');
    if (saved) {
      const owned = JSON.parse(saved);
      this.blades.forEach(b => {
        if (owned.includes(b.id)) b.owned = true;
      });
    }
  }

  saveBlades() {
    const owned = this.blades.filter(b => b.owned).map(b => b.id);
    localStorage.setItem('eai_fruitninja_blades', JSON.stringify(owned));
  }

  loadAchievements() {
    const saved = localStorage.getItem('eai_fruitninja_achievements');
    if (saved) {
      const unlocked = JSON.parse(saved);
      this.achievements.forEach(a => {
        if (unlocked.includes(a.id)) a.unlocked = true;
      });
    }
    // Carregar maxCombo
    this.maxCombo = parseInt(localStorage.getItem('eai_fruitninja_maxcombo') || '0');
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_fruitninja_achievements', JSON.stringify(unlocked));
    localStorage.setItem('eai_fruitninja_maxcombo', this.maxCombo.toString());
  }

  loadDailyChallenges() {
    const saved = localStorage.getItem('eai_fruitninja_daily');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) {
        this.dailyChallenges.forEach((c, i) => {
          if (data.challenges[i]) {
            c.current = data.challenges[i].current;
          }
        });
      }
    }
  }

  saveDailyChallenges() {
    const data = {
      date: new Date().toDateString(),
      challenges: this.dailyChallenges.map(c => ({ current: c.current }))
    };
    localStorage.setItem('eai_fruitninja_daily', JSON.stringify(data));
  }

  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Iniciar jogo
window.addEventListener('load', () => {
  new FruitNinjaGame();
});
