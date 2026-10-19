// Ocean Quest Adventure - EAI Games
// Aventura submarina para crianças com muitos níveis e conquistas

class OceanQuest {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_oceanquest_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Ocean Quest!', lines: ['Explore o oceano profundo', 'e colete tesouros!'], emoji: '🐠' },
      { title: 'Como Jogar', lines: ['Toque/Clique para nadar', 'Colete pérolas e conchas', 'Evite os tubarões!'], emoji: '🎮' },
      { title: 'Tesouros', lines: ['🐚 Concha = 10 moedas', '🦪 Pérola = 25 moedas', '💎 Diamante = 50 moedas'], emoji: '💰' },
      { title: 'Poderes', lines: ['⚡ Velocidade turbo', '🛡️ Escudo protetor', '🧲 Imã de tesouros'], emoji: '✨' },
      { title: 'Mundos', lines: ['5 oceanos diferentes', '10 níveis cada um', 'Desbloqueie todos!'], emoji: '🌊' },
      { title: 'Vamos Nadar!', lines: ['Colete XP para subir de nível', 'Compre peixes na loja', 'Boa aventura!'], emoji: '🎉' }
    ];

    // Game state
    this.state = 'menu';
    this.loadProgress();

    // Player
    this.player = {
      x: 100,
      y: 0,
      vy: 0,
      size: 40,
      fish: this.unlockedFish[this.selectedFish] || 'clownfish'
    };

    // Fish types
    this.fishTypes = {
      clownfish: { emoji: '🐠', name: 'Peixe-Palhaço', speed: 1, price: 0 },
      angelfish: { emoji: '🐟', name: 'Peixe-Anjo', speed: 1.1, price: 500 },
      blowfish: { emoji: '🐡', name: 'Baiacu', speed: 0.9, price: 800 },
      dolphin: { emoji: '🐬', name: 'Golfinho', speed: 1.3, price: 1500 },
      whale: { emoji: '🐋', name: 'Baleia', speed: 0.8, price: 2500 },
      shark: { emoji: '🦈', name: 'Tubarão Amigo', speed: 1.4, price: 5000 },
      octopus: { emoji: '🐙', name: 'Polvo', speed: 1.2, price: 3500 },
      turtle: { emoji: '🐢', name: 'Tartaruga', speed: 0.7, price: 2000 },
      seahorse: { emoji: '🦑', name: 'Lula', speed: 1.15, price: 4000 },
      narwhal: { emoji: '🦭', name: 'Foca', speed: 1.25, price: 6000 }
    };

    // Worlds
    this.worlds = [
      { name: 'Recife Colorido', color1: '#00b4d8', color2: '#0077b6', unlockLevel: 1 },
      { name: 'Floresta de Algas', color1: '#2d6a4f', color2: '#1b4332', unlockLevel: 5 },
      { name: 'Caverna Misteriosa', color1: '#3a0ca3', color2: '#240046', unlockLevel: 10 },
      { name: 'Naufrágio Antigo', color1: '#6c584c', color2: '#3d2914', unlockLevel: 15 },
      { name: 'Abismo Profundo', color1: '#1d3557', color2: '#0d1b2a', unlockLevel: 20 }
    ];

    // Level data
    this.currentWorld = 0;
    this.currentStage = 1;
    this.stagesPerWorld = 10;

    // Collectibles
    this.collectibles = [];
    this.enemies = [];
    this.bubbles = [];

    // Power-ups
    this.powerUps = [];
    this.activeEffects = {
      speed: 0,
      shield: 0,
      magnet: 0
    };

    // Upgrades
    this.upgrades = {
      swimSpeed: { level: 0, maxLevel: 10, basePrice: 200, name: 'Velocidade' },
      magnetRange: { level: 0, maxLevel: 10, basePrice: 300, name: 'Alcance Imã' },
      shieldDuration: { level: 0, maxLevel: 10, basePrice: 400, name: 'Duração Escudo' },
      coinMultiplier: { level: 0, maxLevel: 10, basePrice: 500, name: 'Multiplicador' }
    };
    this.loadUpgrades();

    // Achievements
    this.achievements = [
      { id: 'first_pearl', name: 'Primeira Pérola', desc: 'Colete sua primeira pérola', icon: '🦪', unlocked: false },
      { id: 'treasure_hunter', name: 'Caçador de Tesouros', desc: 'Colete 100 tesouros', icon: '💎', unlocked: false, progress: 0, target: 100 },
      { id: 'world_explorer', name: 'Explorador', desc: 'Desbloqueie todos os mundos', icon: '🌊', unlocked: false },
      { id: 'fish_collector', name: 'Colecionador', desc: 'Desbloqueie 5 peixes', icon: '🐠', unlocked: false },
      { id: 'level_master', name: 'Mestre dos Níveis', desc: 'Alcance nível 25', icon: '⭐', unlocked: false },
      { id: 'speed_demon', name: 'Veloz', desc: 'Use 50 power-ups de velocidade', icon: '⚡', unlocked: false, progress: 0, target: 50 },
      { id: 'survivor', name: 'Sobrevivente', desc: 'Sobreviva 5 minutos seguidos', icon: '🛡️', unlocked: false },
      { id: 'millionaire', name: 'Milionário', desc: 'Acumule 10000 moedas', icon: '💰', unlocked: false }
    ];
    this.loadAchievements();

    // Stats
    this.totalCollected = parseInt(localStorage.getItem('oceanquest_total_collected') || '0');
    this.speedPowerUpsUsed = parseInt(localStorage.getItem('oceanquest_speed_used') || '0');
    this.longestSurvival = parseInt(localStorage.getItem('oceanquest_longest_survival') || '0');
    this.survivalTime = 0;

    // Particles
    this.particles = [];

    // Input
    this.targetY = 0;
    this.setupInput();

    // Start
    this.lastTime = performance.now();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.player && (this.player.y = this.canvas.height / 2);
    this.targetY = this.canvas.height / 2;
  }

  loadProgress() {
    this.coins = parseInt(localStorage.getItem('oceanquest_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('oceanquest_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('oceanquest_xp') || '0');
    this.level = parseInt(localStorage.getItem('oceanquest_level') || '1');
    this.highestWorld = parseInt(localStorage.getItem('oceanquest_highest_world') || '0');
    this.highestStage = parseInt(localStorage.getItem('oceanquest_highest_stage') || '1');
    this.selectedFish = parseInt(localStorage.getItem('oceanquest_selected_fish') || '0');
    this.unlockedFish = JSON.parse(localStorage.getItem('oceanquest_unlocked_fish') || '["clownfish"]');
  }

  saveProgress() {
    localStorage.setItem('oceanquest_coins', this.coins.toString());
    localStorage.setItem('oceanquest_diamonds', this.diamonds.toString());
    localStorage.setItem('oceanquest_xp', this.xp.toString());
    localStorage.setItem('oceanquest_level', this.level.toString());
    localStorage.setItem('oceanquest_highest_world', this.highestWorld.toString());
    localStorage.setItem('oceanquest_highest_stage', this.highestStage.toString());
    localStorage.setItem('oceanquest_selected_fish', this.selectedFish.toString());
    localStorage.setItem('oceanquest_unlocked_fish', JSON.stringify(this.unlockedFish));
    localStorage.setItem('oceanquest_total_collected', this.totalCollected.toString());
    localStorage.setItem('oceanquest_speed_used', this.speedPowerUpsUsed.toString());
    localStorage.setItem('oceanquest_longest_survival', this.longestSurvival.toString());
  }

  loadUpgrades() {
    const saved = localStorage.getItem('oceanquest_upgrades');
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        if (this.upgrades[key]) this.upgrades[key].level = data[key];
      });
    }
  }

  saveUpgrades() {
    const data = {};
    Object.keys(this.upgrades).forEach(key => {
      data[key] = this.upgrades[key].level;
    });
    localStorage.setItem('oceanquest_upgrades', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('oceanquest_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      this.achievements.forEach((ach, i) => {
        if (data[ach.id]) {
          ach.unlocked = data[ach.id].unlocked;
          if (ach.progress !== undefined) ach.progress = data[ach.id].progress || 0;
        }
      });
    }
  }

  saveAchievements() {
    const data = {};
    this.achievements.forEach(ach => {
      data[ach.id] = { unlocked: ach.unlocked, progress: ach.progress };
    });
    localStorage.setItem('oceanquest_achievements', JSON.stringify(data));
  }

  setupInput() {
    const handleMove = (y) => {
      this.targetY = y;
    };

    this.canvas.addEventListener('mousemove', (e) => handleMove(e.clientY));
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientY);
    });

    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleClick(e.touches[0].clientX, e.touches[0].clientY);
    });
  }

  handleClick(x, y) {
    if (this.showTutorial) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_oceanquest_tutorial_seen', 'true');
      }
      return;
    }

    if (this.state === 'menu') {
      this.checkMenuClick(x, y);
    } else if (this.state === 'worlds') {
      this.checkWorldsClick(x, y);
    } else if (this.state === 'stages') {
      this.checkStagesClick(x, y);
    } else if (this.state === 'shop') {
      this.checkShopClick(x, y);
    } else if (this.state === 'upgrades') {
      this.checkUpgradesClick(x, y);
    } else if (this.state === 'achievements') {
      this.checkAchievementsClick(x, y);
    } else if (this.state === 'gameover') {
      this.checkGameOverClick(x, y);
    } else if (this.state === 'victory') {
      this.checkVictoryClick(x, y);
    }
  }

  checkMenuClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const btnW = 200, btnH = 50;

    const buttons = [
      { y: cy - 20, action: () => this.state = 'worlds' },
      { y: cy + 40, action: () => this.state = 'shop' },
      { y: cy + 100, action: () => this.state = 'upgrades' },
      { y: cy + 160, action: () => this.state = 'achievements' }
    ];

    buttons.forEach(btn => {
      if (x > cx - btnW/2 && x < cx + btnW/2 && y > btn.y && y < btn.y + btnH) {
        btn.action();
      }
    });
  }

  checkWorldsClick(x, y) {
    const startY = 120;
    const itemH = 80;

    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    this.worlds.forEach((world, i) => {
      const wy = startY + i * itemH;
      if (y > wy && y < wy + itemH - 10) {
        if (this.level >= world.unlockLevel) {
          this.currentWorld = i;
          this.state = 'stages';
        }
      }
    });
  }

  checkStagesClick(x, y) {
    const cols = 5;
    const rows = 2;
    const btnSize = 60;
    const gap = 20;
    const startX = (this.canvas.width - (cols * btnSize + (cols-1) * gap)) / 2;
    const startY = 150;

    // Back button
    if (x < 100 && y < 60) {
      this.state = 'worlds';
      return;
    }

    for (let i = 0; i < this.stagesPerWorld; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap);

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        const absoluteStage = this.currentWorld * this.stagesPerWorld + i + 1;
        const highestAbsolute = this.highestWorld * this.stagesPerWorld + this.highestStage;

        if (absoluteStage <= highestAbsolute) {
          this.currentStage = i + 1;
          this.startGame();
        }
      }
    }
  }

  checkShopClick(x, y) {
    const startY = 100;
    const itemH = 70;
    const fishList = Object.keys(this.fishTypes);

    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    fishList.forEach((key, i) => {
      const fish = this.fishTypes[key];
      const iy = startY + i * itemH;
      const buyBtnX = this.canvas.width - 120;

      if (y > iy && y < iy + itemH - 5) {
        if (this.unlockedFish.includes(key)) {
          // Select fish
          this.selectedFish = this.unlockedFish.indexOf(key);
          this.saveProgress();
        } else if (x > buyBtnX && this.coins >= fish.price) {
          // Buy fish
          this.coins -= fish.price;
          this.unlockedFish.push(key);
          this.selectedFish = this.unlockedFish.indexOf(key);
          this.saveProgress();
          this.checkAchievement('fish_collector', this.unlockedFish.length, 5);
        }
      }
    });
  }

  checkUpgradesClick(x, y) {
    const startY = 100;
    const itemH = 80;
    const keys = Object.keys(this.upgrades);

    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    keys.forEach((key, i) => {
      const upg = this.upgrades[key];
      const iy = startY + i * itemH;
      const btnX = this.canvas.width - 120;

      if (y > iy && y < iy + itemH - 5 && x > btnX) {
        const price = upg.basePrice * (upg.level + 1);
        if (upg.level < upg.maxLevel && this.coins >= price) {
          this.coins -= price;
          upg.level++;
          this.saveUpgrades();
          this.saveProgress();
        }
      }
    });
  }

  checkAchievementsClick(x, y) {
    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
    }
  }

  checkGameOverClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 50 && y < cy + 100) {
      this.state = 'menu';
    }
  }

  checkVictoryClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 80 && y < cy + 130) {
      // Progress to next stage
      const absoluteStage = this.currentWorld * this.stagesPerWorld + this.currentStage;
      const highestAbsolute = this.highestWorld * this.stagesPerWorld + this.highestStage;

      if (absoluteStage >= highestAbsolute) {
        if (this.currentStage < this.stagesPerWorld) {
          this.highestStage++;
        } else if (this.currentWorld < this.worlds.length - 1) {
          this.highestWorld++;
          this.highestStage = 1;
        }
        this.saveProgress();
      }

      this.state = 'stages';
    }
  }

  startGame() {
    this.state = 'playing';
    this.player.y = this.canvas.height / 2;
    this.player.fish = this.unlockedFish[this.selectedFish];
    this.targetY = this.canvas.height / 2;

    this.collectibles = [];
    this.enemies = [];
    this.powerUps = [];
    this.bubbles = [];
    this.particles = [];

    this.stageCoins = 0;
    this.stageDiamonds = 0;
    this.stageXP = 0;
    this.stageCollected = 0;
    this.stageTarget = 10 + this.currentStage * 3 + this.currentWorld * 10;

    this.survivalTime = 0;
    this.scrollX = 0;

    this.activeEffects = { speed: 0, shield: 0, magnet: 0 };

    // Generate initial content
    for (let i = 0; i < 20; i++) {
      this.spawnCollectible(300 + i * 100);
    }
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy(500 + i * 200);
    }
  }

  spawnCollectible(x) {
    const types = [
      { emoji: '🐚', value: 10, xp: 5, chance: 0.5 },
      { emoji: '🦪', value: 25, xp: 10, chance: 0.3 },
      { emoji: '💎', value: 50, xp: 20, chance: 0.1, isDiamond: true },
      { emoji: '⭐', value: 15, xp: 25, chance: 0.1 }
    ];

    let r = Math.random();
    let type = types[0];
    let cumulative = 0;
    for (const t of types) {
      cumulative += t.chance;
      if (r < cumulative) { type = t; break; }
    }

    this.collectibles.push({
      x: x || this.scrollX + this.canvas.width + 50,
      y: 50 + Math.random() * (this.canvas.height - 100),
      ...type,
      size: 30
    });
  }

  spawnEnemy(x) {
    const difficulty = this.currentWorld * 0.2 + this.currentStage * 0.05;
    const types = [
      { emoji: '🦈', speed: 1.5 + difficulty, size: 50 },
      { emoji: '🦑', speed: 1 + difficulty, size: 40 },
      { emoji: '🦀', speed: 0.8 + difficulty, size: 35 }
    ];

    const type = types[Math.floor(Math.random() * types.length)];

    this.enemies.push({
      x: x || this.scrollX + this.canvas.width + 100,
      y: 50 + Math.random() * (this.canvas.height - 100),
      ...type,
      baseY: 0,
      time: Math.random() * Math.PI * 2
    });
    this.enemies[this.enemies.length - 1].baseY = this.enemies[this.enemies.length - 1].y;
  }

  spawnPowerUp(x) {
    const types = [
      { emoji: '⚡', type: 'speed', duration: 5000 },
      { emoji: '🛡️', type: 'shield', duration: 4000 },
      { emoji: '🧲', type: 'magnet', duration: 6000 }
    ];

    const powerUp = types[Math.floor(Math.random() * types.length)];

    this.powerUps.push({
      x: x || this.scrollX + this.canvas.width + 50,
      y: 50 + Math.random() * (this.canvas.height - 100),
      ...powerUp,
      size: 35
    });
  }

  spawnBubble() {
    this.bubbles.push({
      x: Math.random() * this.canvas.width,
      y: this.canvas.height + 20,
      size: 5 + Math.random() * 15,
      speed: 1 + Math.random() * 2
    });
  }

  addParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1,
        color,
        size: 3 + Math.random() * 5
      });
    }
  }

  checkAchievement(id, value, target) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      if (ach.progress !== undefined) {
        ach.progress = value;
        if (ach.progress >= (target || ach.target)) {
          ach.unlocked = true;
          this.showAchievementPopup(ach);
        }
      } else if (value >= target) {
        ach.unlocked = true;
        this.showAchievementPopup(ach);
      }
      this.saveAchievements();
    }
  }

  showAchievementPopup(ach) {
    this.achievementPopup = { ...ach, timer: 3000 };
    // Bonus
    this.coins += 100;
    this.diamonds += 5;
    this.saveProgress();
  }

  update(dt) {
    if (this.state !== 'playing') return;

    const fishData = this.fishTypes[this.player.fish];
    let speedMult = fishData.speed * (1 + this.upgrades.swimSpeed.level * 0.1);
    if (this.activeEffects.speed > 0) speedMult *= 1.5;

    // Player movement
    const dy = this.targetY - this.player.y;
    this.player.y += dy * 0.1 * speedMult;
    this.player.y = Math.max(30, Math.min(this.canvas.height - 30, this.player.y));

    // Scroll
    const scrollSpeed = 2 + this.currentWorld * 0.5 + this.currentStage * 0.1;
    this.scrollX += scrollSpeed * speedMult;

    // Survival time
    this.survivalTime += dt;
    if (this.survivalTime > this.longestSurvival) {
      this.longestSurvival = this.survivalTime;
    }
    this.checkAchievement('survivor', this.survivalTime, 300000);

    // Active effects
    Object.keys(this.activeEffects).forEach(key => {
      if (this.activeEffects[key] > 0) {
        this.activeEffects[key] -= dt;
      }
    });

    // Magnet effect
    const magnetRange = 100 + this.upgrades.magnetRange.level * 20;
    if (this.activeEffects.magnet > 0) {
      this.collectibles.forEach(c => {
        const dx = this.player.x - (c.x - this.scrollX);
        const dy = this.player.y - c.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < magnetRange) {
          c.x += dx * 0.1;
          c.y += dy * 0.1;
        }
      });
    }

    // Collectibles
    this.collectibles = this.collectibles.filter(c => {
      const screenX = c.x - this.scrollX;

      // Collect
      const dx = this.player.x - screenX;
      const dy = this.player.y - c.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < this.player.size) {
        const mult = 1 + this.upgrades.coinMultiplier.level * 0.15;
        this.stageCoins += Math.round(c.value * mult);
        this.stageXP += c.xp;
        if (c.isDiamond) this.stageDiamonds++;
        this.stageCollected++;
        this.totalCollected++;
        this.addParticles(screenX, c.y, '#ffd700');

        // Achievements
        if (c.emoji === '🦪') this.checkAchievement('first_pearl', 1, 1);
        this.checkAchievement('treasure_hunter', this.totalCollected, 100);

        return false;
      }

      return screenX > -50;
    });

    // Spawn new collectibles
    if (this.collectibles.length < 15) {
      this.spawnCollectible();
    }

    // Enemies
    this.enemies.forEach(e => {
      e.time += dt * 0.003;
      e.y = e.baseY + Math.sin(e.time) * 50;

      const screenX = e.x - this.scrollX;
      const dx = this.player.x - screenX;
      const dy = this.player.y - e.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < (this.player.size + e.size) / 2 - 10) {
        if (this.activeEffects.shield <= 0) {
          this.gameOver();
        }
      }
    });

    this.enemies = this.enemies.filter(e => (e.x - this.scrollX) > -100);

    // Spawn new enemies
    if (this.enemies.length < 3 + this.currentWorld) {
      this.spawnEnemy();
    }

    // Power-ups
    this.powerUps = this.powerUps.filter(p => {
      const screenX = p.x - this.scrollX;
      const dx = this.player.x - screenX;
      const dy = this.player.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < this.player.size) {
        const duration = p.duration * (1 + this.upgrades.shieldDuration.level * 0.1);
        this.activeEffects[p.type] = duration;
        this.addParticles(screenX, p.y, '#00ffff', 15);

        if (p.type === 'speed') {
          this.speedPowerUpsUsed++;
          this.checkAchievement('speed_demon', this.speedPowerUpsUsed, 50);
        }

        return false;
      }

      return screenX > -50;
    });

    // Spawn power-ups
    if (Math.random() < 0.005 && this.powerUps.length < 2) {
      this.spawnPowerUp();
    }

    // Bubbles
    if (Math.random() < 0.1) this.spawnBubble();
    this.bubbles = this.bubbles.filter(b => {
      b.y -= b.speed;
      return b.y > -20;
    });

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt / 1000;
      return p.life > 0;
    });

    // Achievement popup
    if (this.achievementPopup) {
      this.achievementPopup.timer -= dt;
      if (this.achievementPopup.timer <= 0) {
        this.achievementPopup = null;
      }
    }

    // Check victory
    if (this.stageCollected >= this.stageTarget) {
      this.victory();
    }
  }

  gameOver() {
    this.state = 'gameover';
    // Keep half of collected coins
    this.coins += Math.floor(this.stageCoins / 2);
    this.diamonds += this.stageDiamonds;
    this.addXP(Math.floor(this.stageXP / 2));
    this.saveProgress();
  }

  victory() {
    this.state = 'victory';
    this.coins += this.stageCoins;
    this.diamonds += this.stageDiamonds + 2; // Bonus diamonds
    this.addXP(this.stageXP + 50); // Bonus XP
    this.saveProgress();

    // Check world explorer achievement
    if (this.highestWorld >= this.worlds.length - 1 && this.highestStage >= this.stagesPerWorld) {
      this.checkAchievement('world_explorer', 1, 1);
    }
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 100;

    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.coins += 50 * this.level;
      this.diamonds += this.level;
    }

    this.checkAchievement('level_master', this.level, 25);
    this.checkAchievement('millionaire', this.coins, 10000);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    const world = this.worlds[this.currentWorld] || this.worlds[0];
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, world.color1);
    gradient.addColorStop(1, world.color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Bubbles
    ctx.globalAlpha = 0.3;
    this.bubbles.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.state) {
      case 'menu': this.drawMenu(); break;
      case 'worlds': this.drawWorlds(); break;
      case 'stages': this.drawStages(); break;
      case 'shop': this.drawShop(); break;
      case 'upgrades': this.drawUpgrades(); break;
      case 'achievements': this.drawAchievements(); break;
      case 'playing': this.drawGame(); break;
      case 'gameover': this.drawGameOver(); break;
      case 'victory': this.drawVictory(); break;
    }

    // Achievement popup
    if (this.achievementPopup) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(w/2 - 150, 50, 300, 80);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.strokeRect(w/2 - 150, 50, 300, 80);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 Conquista Desbloqueada!', w/2, 80);
      ctx.font = '14px Arial';
      ctx.fillText(`${this.achievementPopup.icon} ${this.achievementPopup.name}`, w/2, 105);
    }
  }

  drawTutorial() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const page = this.tutorialPages[this.tutorialPage];

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(0,119,182,0.9)';
    ctx.fillRect(w/2 - 180, h/2 - 140, 360, 280);
    ctx.strokeStyle = '#90e0ef';
    ctx.lineWidth = 4;
    ctx.strokeRect(w/2 - 180, h/2 - 140, 360, 280);

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 70);

    ctx.fillStyle = '#caf0f8';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 - 10);

    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 30 + i * 25);
    });

    ctx.font = '14px Arial';
    ctx.fillStyle = '#90e0ef';
    ctx.fillText(`Toque para continuar (${this.tutorialPage + 1}/${this.tutorialPages.length})`, w/2, h/2 + 110);
  }

  drawMenu() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#90e0ef';
    ctx.textAlign = 'center';
    ctx.fillText('🐠 OCEAN QUEST 🐠', w/2, 80);

    // Stats
    ctx.font = '16px Arial';
    ctx.fillStyle = '#caf0f8';
    ctx.fillText(`💰 ${this.coins}   💎 ${this.diamonds}   ⭐ Nível ${this.level}`, w/2, 120);

    // Player fish
    const fishData = this.fishTypes[this.unlockedFish[this.selectedFish]];
    ctx.font = '80px Arial';
    ctx.fillText(fishData.emoji, w/2, h/2 - 100);
    ctx.font = '18px Arial';
    ctx.fillText(fishData.name, w/2, h/2 - 50);

    // Buttons
    const buttons = [
      { text: '🌊 Jogar', y: h/2 - 20 },
      { text: '🐟 Loja', y: h/2 + 40 },
      { text: '⬆️ Upgrades', y: h/2 + 100 },
      { text: '🏆 Conquistas', y: h/2 + 160 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(w/2 - 100, btn.y, 200, 50);
      ctx.strokeStyle = '#90e0ef';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 100, btn.y, 200, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 32);
    });

    // XP Bar
    const xpNeeded = this.level * 100;
    const xpProgress = this.xp / xpNeeded;
    ctx.fillStyle = '#023e8a';
    ctx.fillRect(w/2 - 100, h - 50, 200, 20);
    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(w/2 - 100, h - 50, 200 * xpProgress, 20);
    ctx.strokeStyle = '#90e0ef';
    ctx.strokeRect(w/2 - 100, h - 50, 200, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`XP: ${this.xp}/${xpNeeded}`, w/2, h - 36);
  }

  drawWorlds() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#90e0ef';
    ctx.textAlign = 'center';
    ctx.fillText('Escolha o Oceano', w/2, 70);

    // Back button
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 120;
    this.worlds.forEach((world, i) => {
      const locked = this.level < world.unlockLevel;
      const y = startY + i * 80;

      const grad = ctx.createLinearGradient(0, y, 0, y + 70);
      grad.addColorStop(0, world.color1);
      grad.addColorStop(1, world.color2);
      ctx.fillStyle = locked ? '#333' : grad;
      ctx.fillRect(20, y, w - 40, 70);

      ctx.strokeStyle = locked ? '#555' : '#90e0ef';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = locked ? '#666' : '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}. ${world.name}`, 40, y + 30);

      ctx.font = '14px Arial';
      if (locked) {
        ctx.fillText(`🔒 Requer nível ${world.unlockLevel}`, 40, y + 52);
      } else {
        ctx.fillText(`10 estágios`, 40, y + 52);
      }
    });
  }

  drawStages() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const world = this.worlds[this.currentWorld];

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#90e0ef';
    ctx.textAlign = 'center';
    ctx.fillText(world.name, w/2, 70);

    // Back button
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const cols = 5;
    const btnSize = 60;
    const gap = 20;
    const startX = (w - (cols * btnSize + (cols-1) * gap)) / 2;
    const startY = 150;

    for (let i = 0; i < this.stagesPerWorld; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);

      const absoluteStage = this.currentWorld * this.stagesPerWorld + i + 1;
      const highestAbsolute = this.highestWorld * this.stagesPerWorld + this.highestStage;
      const unlocked = absoluteStage <= highestAbsolute;
      const completed = absoluteStage < highestAbsolute;

      ctx.fillStyle = completed ? '#2d6a4f' : (unlocked ? '#0077b6' : '#333');
      ctx.fillRect(x, y, btnSize, btnSize);
      ctx.strokeStyle = completed ? '#95d5b2' : (unlocked ? '#90e0ef' : '#555');
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = unlocked ? '#fff' : '#666';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(unlocked ? (i + 1).toString() : '🔒', x + btnSize/2, y + btnSize/2 + 7);

      if (completed) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '16px Arial';
        ctx.fillText('⭐', x + btnSize/2, y + btnSize - 10);
      }
    }
  }

  drawShop() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#90e0ef';
    ctx.textAlign = 'center';
    ctx.fillText('🐟 Loja de Peixes', w/2, 50);
    ctx.font = '16px Arial';
    ctx.fillText(`💰 ${this.coins}`, w/2, 80);

    // Back button
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    const fishList = Object.keys(this.fishTypes);

    fishList.forEach((key, i) => {
      const fish = this.fishTypes[key];
      const y = startY + i * 70;
      const owned = this.unlockedFish.includes(key);
      const selected = this.unlockedFish[this.selectedFish] === key;

      ctx.fillStyle = selected ? '#023e8a' : '#0077b6';
      ctx.fillRect(20, y, w - 40, 65);
      ctx.strokeStyle = selected ? '#00b4d8' : '#90e0ef';
      ctx.lineWidth = selected ? 3 : 1;
      ctx.strokeRect(20, y, w - 40, 65);

      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(fish.emoji, 35, y + 42);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(fish.name, 80, y + 28);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#caf0f8';
      ctx.fillText(`Velocidade: ${fish.speed}x`, 80, y + 48);

      ctx.textAlign = 'right';
      if (owned) {
        ctx.fillStyle = selected ? '#00b4d8' : '#95d5b2';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(selected ? '✓ USANDO' : 'SELECIONAR', w - 35, y + 40);
      } else {
        ctx.fillStyle = this.coins >= fish.price ? '#ffd700' : '#666';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`💰 ${fish.price}`, w - 35, y + 40);
      }
    });
  }

  drawUpgrades() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#90e0ef';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️ Upgrades', w/2, 50);
    ctx.font = '16px Arial';
    ctx.fillText(`💰 ${this.coins}`, w/2, 80);

    // Back button
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    const keys = Object.keys(this.upgrades);

    keys.forEach((key, i) => {
      const upg = this.upgrades[key];
      const y = startY + i * 80;
      const price = upg.basePrice * (upg.level + 1);
      const maxed = upg.level >= upg.maxLevel;

      ctx.fillStyle = '#0077b6';
      ctx.fillRect(20, y, w - 40, 70);
      ctx.strokeStyle = '#90e0ef';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(upg.name, 35, y + 25);

      // Level bar
      ctx.fillStyle = '#023e8a';
      ctx.fillRect(35, y + 35, 150, 15);
      ctx.fillStyle = '#00b4d8';
      ctx.fillRect(35, y + 35, 150 * (upg.level / upg.maxLevel), 15);
      ctx.strokeStyle = '#90e0ef';
      ctx.strokeRect(35, y + 35, 150, 15);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${upg.level}/${upg.maxLevel}`, 110, y + 47);

      // Buy button
      ctx.textAlign = 'right';
      if (maxed) {
        ctx.fillStyle = '#95d5b2';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('MÁXIMO', w - 35, y + 45);
      } else {
        ctx.fillStyle = this.coins >= price ? '#ffd700' : '#666';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`💰 ${price}`, w - 35, y + 45);
      }
    });
  }

  drawAchievements() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#90e0ef';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Conquistas', w/2, 50);

    // Back button
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 90;
    const cols = 2;
    const itemW = (w - 50) / cols;
    const itemH = 80;

    this.achievements.forEach((ach, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 15 + col * (itemW + 10);
      const y = startY + row * (itemH + 10);

      ctx.fillStyle = ach.unlocked ? '#023e8a' : '#333';
      ctx.fillRect(x, y, itemW, itemH);
      ctx.strokeStyle = ach.unlocked ? '#ffd700' : '#555';
      ctx.lineWidth = ach.unlocked ? 2 : 1;
      ctx.strokeRect(x, y, itemW, itemH);

      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ach.unlocked ? ach.icon : '🔒', x + 10, y + 45);

      ctx.fillStyle = ach.unlocked ? '#fff' : '#666';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(ach.name, x + 50, y + 30);
      ctx.font = '10px Arial';
      ctx.fillStyle = ach.unlocked ? '#caf0f8' : '#555';
      ctx.fillText(ach.desc, x + 50, y + 48);

      if (ach.progress !== undefined && !ach.unlocked) {
        ctx.fillStyle = '#023e8a';
        ctx.fillRect(x + 50, y + 55, itemW - 65, 10);
        ctx.fillStyle = '#00b4d8';
        ctx.fillRect(x + 50, y + 55, (itemW - 65) * (ach.progress / ach.target), 10);
        ctx.font = '8px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${ach.progress}/${ach.target}`, x + 50 + (itemW - 65)/2, y + 63);
      }
    });
  }

  drawGame() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Collectibles
    this.collectibles.forEach(c => {
      const x = c.x - this.scrollX;
      ctx.font = `${c.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(c.emoji, x, c.y + c.size/3);
    });

    // Power-ups
    this.powerUps.forEach(p => {
      const x = p.x - this.scrollX;
      ctx.font = `${p.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(p.emoji, x, p.y + p.size/3);

      // Glow
      ctx.beginPath();
      ctx.arc(x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Enemies
    this.enemies.forEach(e => {
      const x = e.x - this.scrollX;
      ctx.font = `${e.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(e.emoji, x, e.y + e.size/3);
    });

    // Player
    const fishData = this.fishTypes[this.player.fish];
    ctx.font = `${this.player.size}px Arial`;
    ctx.textAlign = 'center';

    // Shield effect
    if (this.activeEffects.shield > 0) {
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.player.size * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,255,0.7)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Speed effect
    if (this.activeEffects.speed > 0) {
      ctx.globalAlpha = 0.3;
      ctx.fillText(fishData.emoji, this.player.x - 20, this.player.y + this.player.size/3);
      ctx.fillText(fishData.emoji, this.player.x - 40, this.player.y + this.player.size/3);
      ctx.globalAlpha = 1;
    }

    ctx.fillText(fishData.emoji, this.player.x, this.player.y + this.player.size/3);

    // Particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, 50);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`💰 ${this.stageCoins}`, 15, 32);
    ctx.fillText(`💎 ${this.stageDiamonds}`, 100, 32);

    ctx.textAlign = 'center';
    ctx.fillText(`Estágio ${this.currentWorld + 1}-${this.currentStage}`, w/2, 32);

    ctx.textAlign = 'right';
    ctx.fillText(`${this.stageCollected}/${this.stageTarget}`, w - 15, 32);

    // Progress bar
    const progress = this.stageCollected / this.stageTarget;
    ctx.fillStyle = '#023e8a';
    ctx.fillRect(w/2 - 100, 40, 200, 8);
    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(w/2 - 100, 40, 200 * Math.min(progress, 1), 8);

    // Active effects
    let effectX = 15;
    if (this.activeEffects.speed > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(effectX, 55, 60, 20);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`⚡ ${Math.ceil(this.activeEffects.speed/1000)}s`, effectX + 5, 70);
      effectX += 70;
    }
    if (this.activeEffects.shield > 0) {
      ctx.fillStyle = '#00b4d8';
      ctx.fillRect(effectX, 55, 60, 20);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(`🛡️ ${Math.ceil(this.activeEffects.shield/1000)}s`, effectX + 5, 70);
      effectX += 70;
    }
    if (this.activeEffects.magnet > 0) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(effectX, 55, 60, 20);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(`🧲 ${Math.ceil(this.activeEffects.magnet/1000)}s`, effectX + 5, 70);
    }
  }

  drawGameOver() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fim de Jogo!', w/2, h/2 - 80);

    ctx.font = '60px Arial';
    ctx.fillText('🦈', w/2, h/2 - 10);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Moedas: +${Math.floor(this.stageCoins/2)}`, w/2, h/2 + 30);

    ctx.fillStyle = '#0077b6';
    ctx.fillRect(w/2 - 100, h/2 + 50, 200, 50);
    ctx.strokeStyle = '#90e0ef';
    ctx.strokeRect(w/2 - 100, h/2 + 50, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Menu', w/2, h/2 + 82);
  }

  drawVictory() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Vitória!', w/2, h/2 - 100);

    ctx.font = '60px Arial';
    ctx.fillText('🎉', w/2, h/2 - 30);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Moedas: +${this.stageCoins}`, w/2, h/2 + 10);
    ctx.fillText(`Diamantes: +${this.stageDiamonds + 2}`, w/2, h/2 + 35);
    ctx.fillText(`XP: +${this.stageXP + 50}`, w/2, h/2 + 60);

    ctx.fillStyle = '#0077b6';
    ctx.fillRect(w/2 - 100, h/2 + 80, 200, 50);
    ctx.strokeStyle = '#90e0ef';
    ctx.strokeRect(w/2 - 100, h/2 + 80, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Continuar', w/2, h/2 + 112);
  }

  gameLoop() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.update(dt);
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start game
window.addEventListener('load', () => {
  setTimeout(() => new OceanQuest(), 1600);
});
