// Infinity Runner EAI - Endless Runner Avançado (Estilo Subway Surfers)
class InfinityRunnerGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_infinityrunner_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Infinity Runner!', lines: ['Corra infinitamente!', 'Colete moedas e power-ups', 'Desvie dos obstaculos!', ''], emoji: '🏃' },
      { title: 'Controles', lines: ['DESLIZE para ESQUERDA/DIREITA', 'para mudar de pista', 'DESLIZE PARA CIMA para pular', 'DESLIZE PARA BAIXO para deslizar'], emoji: '👆' },
      { title: 'Power-Ups', lines: ['🧲 Ima - Atrai moedas', '🛡️ Escudo - Invencibilidade', '⚡ Velocidade - Pontos 2x', '🚀 Jetpack - Voa alto!'], emoji: '✨' },
      { title: 'Personagens', lines: ['Desbloqueie novos corredores!', 'Cada um tem habilidades unicas', 'Complete missoes para recompensas', 'Boa corrida!'], emoji: '🏆' }
    ];

    // Currencies
    this.coins = parseInt(localStorage.getItem('infinityrunner_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('infinityrunner_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('infinityrunner_xp') || '0');
    this.level = parseInt(localStorage.getItem('infinityrunner_level') || '1');
    this.highScore = parseInt(localStorage.getItem('infinityrunner_highscore') || '0');

    // Characters
    this.characters = [
      { id: 'runner', name: 'Corredor', emoji: '🏃', cost: 0, owned: true, ability: 'Equilibrado', color: '#4ECDC4' },
      { id: 'ninja', name: 'Ninja', emoji: '🥷', cost: 500, owned: false, ability: 'Pulo duplo', color: '#2c3e50' },
      { id: 'robot', name: 'Robo', emoji: '🤖', cost: 1000, owned: false, ability: 'Escudo inicial', color: '#95a5a6' },
      { id: 'wizard', name: 'Mago', emoji: '🧙', cost: 2000, owned: false, ability: 'Ima permanente', color: '#9b59b6' },
      { id: 'alien', name: 'Alien', emoji: '👽', cost: 5000, owned: false, ability: 'Velocidade +20%', color: '#2ecc71' },
      { id: 'superhero', name: 'Heroi', emoji: '🦸', cost: 10000, owned: false, ability: 'Reviver gratis', color: '#e74c3c' }
    ];
    this.selectedCharacter = 0;

    // Power-ups in inventory
    this.powerUpInventory = {
      magnet: parseInt(localStorage.getItem('infinityrunner_magnet') || '3'),
      shield: parseInt(localStorage.getItem('infinityrunner_shield') || '2'),
      speed: parseInt(localStorage.getItem('infinityrunner_speed') || '2'),
      jetpack: parseInt(localStorage.getItem('infinityrunner_jetpack') || '1')
    };

    // Missions
    this.missions = [
      { id: 'm1', desc: 'Corra 1000m', target: 1000, progress: 0, reward: 100, completed: false },
      { id: 'm2', desc: 'Colete 100 moedas', target: 100, progress: 0, reward: 50, completed: false },
      { id: 'm3', desc: 'Pule 50 vezes', target: 50, progress: 0, reward: 75, completed: false },
      { id: 'm4', desc: 'Use 5 power-ups', target: 5, progress: 0, reward: 100, completed: false },
      { id: 'm5', desc: 'Alcance 5000 pontos', target: 5000, progress: 0, reward: 200, completed: false },
      { id: 'm6', desc: 'Corra 10000m total', target: 10000, progress: 0, reward: 500, completed: false }
    ];

    // Game state
    this.gameState = 'menu'; // menu, playing, paused, gameover, shop, characters

    // Player
    this.player = {
      lane: 1, // 0, 1, 2
      y: 0,
      vy: 0,
      jumping: false,
      sliding: false,
      slideTimer: 0
    };

    // Game variables
    this.lanes = 3;
    this.laneWidth = 80;
    this.speed = 5;
    this.baseSpeed = 5;
    this.distance = 0;
    this.score = 0;
    this.runCoins = 0;

    // Obstacles and collectibles
    this.obstacles = [];
    this.collectibles = [];
    this.spawnTimer = 0;

    // Active power-ups
    this.activePowerUps = {
      magnet: 0,
      shield: 0,
      speed: 0,
      jetpack: 0
    };

    // Stats
    this.totalDistance = parseInt(localStorage.getItem('infinityrunner_totaldist') || '0');
    this.totalCoins = parseInt(localStorage.getItem('infinityrunner_totalcoins') || '0');
    this.totalJumps = parseInt(localStorage.getItem('infinityrunner_jumps') || '0');
    this.totalPowerups = parseInt(localStorage.getItem('infinityrunner_powerups') || '0');

    // Touch handling
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.particles = [];
    this.notifications = [];

    this.loadProgress();
    this.setupControls();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.laneWidth = Math.min(80, this.canvas.width / 4);
  }

  setupControls() {
    // Touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const dx = touch.clientX - this.touchStartX;
      const dy = touch.clientY - this.touchStartY;

      if (this.showTutorial) {
        this.handleTutorialClick(touch.clientX, touch.clientY);
        return;
      }

      if (this.gameState === 'playing') {
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (dx > 30) this.moveRight();
          else if (dx < -30) this.moveLeft();
        } else {
          // Vertical swipe
          if (dy < -30) this.jump();
          else if (dy > 30) this.slide();
        }
      } else {
        this.handleClick(touch.clientX, touch.clientY);
      }
    });

    // Mouse/click for menus
    this.canvas.addEventListener('click', (e) => {
      if (this.showTutorial) {
        this.handleTutorialClick(e.clientX, e.clientY);
        return;
      }
      if (this.gameState !== 'playing') {
        this.handleClick(e.clientX, e.clientY);
      }
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (this.gameState === 'playing') {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.moveLeft();
        if (e.key === 'ArrowRight' || e.key === 'd') this.moveRight();
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') this.jump();
        if (e.key === 'ArrowDown' || e.key === 's') this.slide();
      }
    });
  }

  handleClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    if (this.gameState === 'menu') {
      // Play button
      if (x > centerX - 80 && x < centerX + 80 && y > centerY + 50 && y < centerY + 100) {
        this.startGame();
      }
      // Shop button
      if (x > centerX - 80 && x < centerX + 80 && y > centerY + 120 && y < centerY + 170) {
        this.gameState = 'shop';
      }
      // Characters button
      if (x > centerX - 80 && x < centerX + 80 && y > centerY + 190 && y < centerY + 240) {
        this.gameState = 'characters';
      }
    } else if (this.gameState === 'gameover') {
      // Retry
      if (x > centerX - 80 && x < centerX + 80 && y > centerY + 80 && y < centerY + 130) {
        this.startGame();
      }
      // Menu
      if (x > centerX - 80 && x < centerX + 80 && y > centerY + 150 && y < centerY + 200) {
        this.gameState = 'menu';
      }
    } else if (this.gameState === 'shop' || this.gameState === 'characters') {
      // Back button
      if (x > 20 && x < 100 && y > 50 && y < 90) {
        this.gameState = 'menu';
        return;
      }

      if (this.gameState === 'shop') {
        this.handleShopClick(x, y);
      } else {
        this.handleCharactersClick(x, y);
      }
    }
  }

  handleTutorialClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    if (x > centerX - 60 && x < centerX + 60 && y > centerY + 100 && y < centerY + 140) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_infinityrunner_tutorial_seen', 'true');
      }
    }
    if (x > centerX - 40 && x < centerX + 40 && y > centerY + 150 && y < centerY + 180) {
      this.showTutorial = false;
      localStorage.setItem('eai_infinityrunner_tutorial_seen', 'true');
    }
  }

  handleShopClick(x, y) {
    const items = [
      { id: 'magnet', name: '🧲 Ima x3', cost: 100 },
      { id: 'shield', name: '🛡️ Escudo x3', cost: 150 },
      { id: 'speed', name: '⚡ Velocidade x3', cost: 120 },
      { id: 'jetpack', name: '🚀 Jetpack x2', cost: 200 },
      { id: 'coins1000', name: '🪙 1000 Moedas', cost: 5, diamond: true },
      { id: 'revive', name: '💖 Reviver x3', cost: 10, diamond: true }
    ];

    const startY = 150;
    items.forEach((item, i) => {
      const iy = startY + i * 65;
      if (y > iy && y < iy + 60 && x > this.canvas.width - 120) {
        if (item.diamond) {
          if (this.diamonds >= item.cost) {
            this.diamonds -= item.cost;
            if (item.id === 'coins1000') this.coins += 1000;
            this.addNotification(`Comprou ${item.name}!`);
            this.saveProgress();
          }
        } else {
          if (this.coins >= item.cost) {
            this.coins -= item.cost;
            const amount = item.id === 'jetpack' ? 2 : 3;
            this.powerUpInventory[item.id] = (this.powerUpInventory[item.id] || 0) + amount;
            this.addNotification(`Comprou ${item.name}!`);
            this.saveProgress();
          }
        }
      }
    });
  }

  handleCharactersClick(x, y) {
    const startY = 150;
    this.characters.forEach((char, i) => {
      const cy = startY + i * 70;
      if (y > cy && y < cy + 65) {
        if (char.owned) {
          this.selectedCharacter = i;
          this.addNotification(`Selecionado: ${char.name}`);
        } else if (this.coins >= char.cost) {
          this.coins -= char.cost;
          char.owned = true;
          this.selectedCharacter = i;
          this.addNotification(`Desbloqueou: ${char.name}!`);
          this.saveProgress();
        }
      }
    });
  }

  startGame() {
    this.gameState = 'playing';
    this.player = { lane: 1, y: 0, vy: 0, jumping: false, sliding: false, slideTimer: 0 };
    this.obstacles = [];
    this.collectibles = [];
    this.speed = this.baseSpeed;
    this.distance = 0;
    this.score = 0;
    this.runCoins = 0;
    this.spawnTimer = 0;
    this.activePowerUps = { magnet: 0, shield: 0, speed: 0, jetpack: 0 };
  }

  moveLeft() {
    if (this.player.lane > 0) {
      this.player.lane--;
    }
  }

  moveRight() {
    if (this.player.lane < 2) {
      this.player.lane++;
    }
  }

  jump() {
    if (!this.player.jumping && !this.player.sliding) {
      this.player.jumping = true;
      this.player.vy = -15;
      this.totalJumps++;
      this.updateMissionProgress('m3', 1);
    }
  }

  slide() {
    if (!this.player.jumping && !this.player.sliding) {
      this.player.sliding = true;
      this.player.slideTimer = 500;
    }
  }

  spawnObstacle() {
    const types = ['barrier', 'train', 'low', 'coin', 'powerup'];
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * 3);

    if (type === 'coin') {
      for (let i = 0; i < 5; i++) {
        this.collectibles.push({
          type: 'coin',
          lane: lane,
          y: -100 - i * 40,
          collected: false
        });
      }
    } else if (type === 'powerup') {
      const powerups = ['magnet', 'shield', 'speed', 'jetpack'];
      this.collectibles.push({
        type: powerups[Math.floor(Math.random() * powerups.length)],
        lane: lane,
        y: -100,
        collected: false
      });
    } else {
      this.obstacles.push({
        type: type,
        lane: lane,
        y: -100,
        height: type === 'low' ? 30 : 60
      });
    }
  }

  update(deltaTime) {
    if (this.gameState !== 'playing') return;

    // Speed increases over time
    this.speed = this.baseSpeed + this.distance * 0.0001;

    // Distance and score
    this.distance += this.speed * deltaTime * 0.01;
    this.score = Math.floor(this.distance);

    // Update missions
    this.updateMissionProgress('m1', this.speed * deltaTime * 0.01);
    this.updateMissionProgress('m5', 0); // Check score
    this.missions.find(m => m.id === 'm5').progress = this.score;
    this.totalDistance += this.speed * deltaTime * 0.01;
    this.updateMissionProgress('m6', 0);
    this.missions.find(m => m.id === 'm6').progress = this.totalDistance;

    // Spawn
    this.spawnTimer += deltaTime;
    if (this.spawnTimer > 1000 / (this.speed / 5)) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }

    // Player physics
    if (this.player.jumping) {
      this.player.vy += 0.8;
      this.player.y += this.player.vy;
      if (this.player.y >= 0) {
        this.player.y = 0;
        this.player.jumping = false;
        this.player.vy = 0;
      }
    }

    if (this.player.sliding) {
      this.player.slideTimer -= deltaTime;
      if (this.player.slideTimer <= 0) {
        this.player.sliding = false;
      }
    }

    // Jetpack
    if (this.activePowerUps.jetpack > 0) {
      this.player.y = -150;
      this.player.jumping = false;
    }

    // Update power-ups
    Object.keys(this.activePowerUps).forEach(key => {
      if (this.activePowerUps[key] > 0) {
        this.activePowerUps[key] -= deltaTime;
      }
    });

    // Update obstacles
    const playerY = this.canvas.height - 200 + this.player.y;
    const playerX = this.canvas.width / 2 + (this.player.lane - 1) * this.laneWidth;
    const playerHeight = this.player.sliding ? 30 : 60;

    this.obstacles = this.obstacles.filter(obs => {
      obs.y += this.speed;

      // Collision detection
      if (obs.y > this.canvas.height - 250 && obs.y < this.canvas.height - 150) {
        if (obs.lane === this.player.lane) {
          // Check if we can avoid
          if (obs.type === 'low' && this.player.jumping) {
            // Jumped over
          } else if (obs.type === 'barrier' && this.player.sliding) {
            // Slid under (if barrier is high)
          } else if (this.activePowerUps.shield > 0) {
            // Shield protects
            this.activePowerUps.shield = 0;
            this.addNotification('Escudo usado!');
          } else if (this.activePowerUps.jetpack > 0) {
            // Jetpack flies over
          } else {
            // Collision!
            this.gameOver();
          }
        }
      }

      return obs.y < this.canvas.height + 100;
    });

    // Update collectibles
    this.collectibles = this.collectibles.filter(col => {
      col.y += this.speed;

      // Magnet effect
      if (this.activePowerUps.magnet > 0 && col.type === 'coin') {
        const dx = playerX - (this.canvas.width / 2 + (col.lane - 1) * this.laneWidth);
        const dy = playerY - (col.y + this.canvas.height - 200);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          col.lane = this.player.lane;
        }
      }

      // Collection
      if (!col.collected && col.y > this.canvas.height - 250 && col.y < this.canvas.height - 150) {
        if (col.lane === this.player.lane) {
          col.collected = true;

          if (col.type === 'coin') {
            const value = this.activePowerUps.speed > 0 ? 2 : 1;
            this.runCoins += value;
            this.coins += value;
            this.updateMissionProgress('m2', value);
            this.createCoinParticle(playerX, playerY);
          } else {
            // Power-up
            this.activePowerUps[col.type] = 5000; // 5 seconds
            this.totalPowerups++;
            this.updateMissionProgress('m4', 1);
            this.addNotification(`${col.type.toUpperCase()} ativado!`);
          }
        }
      }

      return col.y < this.canvas.height + 50 && !col.collected;
    });

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= deltaTime;
      return p.life > 0;
    });

    // Notifications
    this.notifications = this.notifications.filter(n => {
      n.y -= 0.5;
      n.life -= deltaTime;
      n.alpha = n.life / 2000;
      return n.life > 0;
    });
  }

  updateMissionProgress(id, amount) {
    const mission = this.missions.find(m => m.id === id);
    if (mission && !mission.completed) {
      mission.progress += amount;
      if (mission.progress >= mission.target) {
        mission.completed = true;
        this.coins += mission.reward;
        this.addNotification(`Missao completa! +${mission.reward} moedas`);
      }
    }
  }

  createCoinParticle(x, y) {
    this.particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 3,
      vy: -3,
      text: '+1',
      life: 500
    });
  }

  gameOver() {
    this.gameState = 'gameover';

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    // Add XP
    this.addXP(Math.floor(this.score / 10));

    // Save stats
    this.totalCoins += this.runCoins;
    this.saveProgress();
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += this.level;
      this.addNotification(`Level Up! Nivel ${this.level}`);
    }
  }

  addNotification(text) {
    this.notifications.push({
      text,
      y: 100,
      alpha: 1,
      life: 2000
    });
  }

  draw() {
    // Background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#16213e');
    gradient.addColorStop(1, '#1a1a2e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    // Currency bar
    this.drawCurrencyBar();

    switch (this.gameState) {
      case 'menu': this.drawMenu(); break;
      case 'playing': this.drawGame(); break;
      case 'gameover': this.drawGameOver(); break;
      case 'shop': this.drawShop(); break;
      case 'characters': this.drawCharacters(); break;
    }

    // Notifications
    this.notifications.forEach(n => {
      this.ctx.globalAlpha = n.alpha;
      this.ctx.fillStyle = '#00ff88';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(n.text, this.canvas.width / 2, n.y);
      this.ctx.globalAlpha = 1;
    });
  }

  drawCurrencyBar() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, 45);

    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`🪙 ${this.coins}`, 15, 28);

    this.ctx.fillStyle = '#00BFFF';
    this.ctx.fillText(`💎 ${this.diamonds}`, 120, 28);

    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`Nv.${this.level}`, this.canvas.width - 15, 28);
  }

  drawTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    const boxWidth = Math.min(350, this.canvas.width - 40);
    ctx.fillRect(centerX - boxWidth/2, centerY - 130, boxWidth, 300);
    ctx.strokeRect(centerX - boxWidth/2, centerY - 130, boxWidth, 300);

    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 70);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 20);

    ctx.fillStyle = '#ccc';
    ctx.font = '15px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 15 + i * 22);
    });

    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 115);

    ctx.fillStyle = '#00ff88';
    ctx.fillRect(centerX - 60, centerY + 100, 120, 40);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(this.tutorialPage < this.tutorialPages.length - 1 ? 'Proximo' : 'Jogar!', centerX, centerY + 125);

    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText('Pular', centerX, centerY + 165);
  }

  drawMenu() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Title
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('INFINITY RUNNER', centerX, 120);

    // Character preview
    const char = this.characters[this.selectedCharacter];
    this.ctx.font = '80px Arial';
    this.ctx.fillText(char.emoji, centerX, centerY - 20);
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = char.color;
    this.ctx.fillText(char.name, centerX, centerY + 20);

    // High score
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText(`Recorde: ${this.highScore}m`, centerX, centerY - 70);

    // Buttons
    const buttons = [
      { text: '▶️ JOGAR', y: centerY + 75 },
      { text: '🏪 LOJA', y: centerY + 145 },
      { text: '👥 PERSONAGENS', y: centerY + 215 }
    ];

    buttons.forEach(btn => {
      this.ctx.fillStyle = '#00ff88';
      this.ctx.fillRect(centerX - 80, btn.y - 25, 160, 50);
      this.ctx.fillStyle = '#000';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(btn.text, centerX, btn.y + 5);
    });

    // Missions preview
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(20, this.canvas.height - 120, this.canvas.width - 40, 80);
    this.ctx.fillStyle = '#FFD93D';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('📋 Missoes:', 30, this.canvas.height - 95);

    const activeMission = this.missions.find(m => !m.completed);
    if (activeMission) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '13px Arial';
      this.ctx.fillText(activeMission.desc, 30, this.canvas.height - 70);
      const progress = Math.min(1, activeMission.progress / activeMission.target);
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(30, this.canvas.height - 55, 200, 15);
      this.ctx.fillStyle = '#00ff88';
      this.ctx.fillRect(30, this.canvas.height - 55, 200 * progress, 15);
    }
  }

  drawGame() {
    const centerX = this.canvas.width / 2;

    // Draw lanes
    for (let i = 0; i < 3; i++) {
      const laneX = centerX + (i - 1) * this.laneWidth;
      this.ctx.fillStyle = i === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)';
      this.ctx.fillRect(laneX - this.laneWidth / 2, 50, this.laneWidth, this.canvas.height - 50);
    }

    // Lane dividers
    for (let i = 0; i < 4; i++) {
      const x = centerX - this.laneWidth * 1.5 + i * this.laneWidth;
      this.ctx.strokeStyle = 'rgba(0,255,136,0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([20, 20]);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 50);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Draw obstacles
    this.obstacles.forEach(obs => {
      const x = centerX + (obs.lane - 1) * this.laneWidth;
      const y = obs.y + this.canvas.height - 200;

      this.ctx.fillStyle = obs.type === 'train' ? '#e74c3c' : (obs.type === 'low' ? '#9b59b6' : '#e67e22');
      this.ctx.fillRect(x - 30, y - obs.height, 60, obs.height);
    });

    // Draw collectibles
    this.collectibles.forEach(col => {
      const x = centerX + (col.lane - 1) * this.laneWidth;
      const y = col.y + this.canvas.height - 200;

      const emojis = { coin: '🪙', magnet: '🧲', shield: '🛡️', speed: '⚡', jetpack: '🚀' };
      this.ctx.font = '25px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(emojis[col.type] || '🪙', x, y);
    });

    // Draw player
    const playerX = centerX + (this.player.lane - 1) * this.laneWidth;
    const playerY = this.canvas.height - 200 + this.player.y;
    const char = this.characters[this.selectedCharacter];

    // Shadow
    this.ctx.beginPath();
    this.ctx.ellipse(playerX, this.canvas.height - 140, 25, 8, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fill();

    // Character
    const size = this.player.sliding ? '35px' : '50px';
    this.ctx.font = size + ' Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(char.emoji, playerX, playerY);

    // Active power-ups effects
    if (this.activePowerUps.shield > 0) {
      this.ctx.beginPath();
      this.ctx.arc(playerX, playerY - 20, 40, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(0,191,255,0.5)';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }

    if (this.activePowerUps.jetpack > 0) {
      this.ctx.font = '20px Arial';
      this.ctx.fillText('🔥', playerX - 15, playerY + 30);
      this.ctx.fillText('🔥', playerX + 15, playerY + 30);
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life / 500;
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(p.text, p.x, p.y);
      this.ctx.globalAlpha = 1;
    });

    // HUD
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.score}m`, centerX, 80);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`🪙 ${this.runCoins}`, centerX, 110);

    // Active power-up indicators
    const activePUs = Object.entries(this.activePowerUps).filter(([k, v]) => v > 0);
    activePUs.forEach(([type, time], i) => {
      const emojis = { magnet: '🧲', shield: '🛡️', speed: '⚡', jetpack: '🚀' };
      this.ctx.font = '24px Arial';
      this.ctx.fillText(emojis[type], 40 + i * 40, 80);

      // Timer bar
      const progress = time / 5000;
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(25 + i * 40, 90, 30, 5);
      this.ctx.fillStyle = '#00ff88';
      this.ctx.fillRect(25 + i * 40, 90, 30 * progress, 5);
    });
  }

  drawGameOver() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FIM DE JOGO', centerX, centerY - 80);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Distancia: ${this.score}m`, centerX, centerY - 30);

    if (this.score >= this.highScore) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText('🏆 NOVO RECORDE!', centerX, centerY + 10);
    }

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Moedas: +${this.runCoins}`, centerX, centerY + 50);

    // Buttons
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fillRect(centerX - 80, centerY + 80, 160, 45);
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('🔄 TENTAR NOVAMENTE', centerX, centerY + 108);

    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(centerX - 80, centerY + 140, 160, 45);
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText('🏠 MENU', centerX, centerY + 168);
  }

  drawShop() {
    const centerX = this.canvas.width / 2;

    // Back button
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fillRect(20, 50, 80, 35);
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 73);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillText('🏪 Loja', centerX, 90);

    const items = [
      { id: 'magnet', name: '🧲 Ima x3', cost: 100, have: this.powerUpInventory.magnet },
      { id: 'shield', name: '🛡️ Escudo x3', cost: 150, have: this.powerUpInventory.shield },
      { id: 'speed', name: '⚡ Velocidade x3', cost: 120, have: this.powerUpInventory.speed },
      { id: 'jetpack', name: '🚀 Jetpack x2', cost: 200, have: this.powerUpInventory.jetpack },
      { id: 'coins1000', name: '💰 1000 Moedas', cost: 5, diamond: true, have: '-' },
      { id: 'revive', name: '💖 Reviver x3', cost: 10, diamond: true, have: '-' }
    ];

    const startY = 150;
    items.forEach((item, i) => {
      const y = startY + i * 65;
      const canBuy = item.diamond ? this.diamonds >= item.cost : this.coins >= item.cost;

      this.ctx.fillStyle = canBuy ? 'rgba(255,255,255,0.1)' : 'rgba(100,100,100,0.1)';
      this.ctx.fillRect(20, y, this.canvas.width - 40, 60);

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(item.name, 35, y + 28);

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#888';
      this.ctx.fillText(`Tem: ${item.have}`, 35, y + 48);

      // Price button
      this.ctx.fillStyle = canBuy ? '#00ff88' : '#666';
      this.ctx.fillRect(this.canvas.width - 115, y + 12, 90, 35);
      this.ctx.fillStyle = canBuy ? '#000' : '#999';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${item.diamond ? '💎' : '🪙'}${item.cost}`, this.canvas.width - 70, y + 35);
    });
  }

  drawCharacters() {
    const centerX = this.canvas.width / 2;

    // Back button
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fillRect(20, 50, 80, 35);
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 73);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillText('👥 Personagens', centerX, 90);

    const startY = 150;
    this.characters.forEach((char, i) => {
      const y = startY + i * 70;
      const isSelected = i === this.selectedCharacter;

      this.ctx.fillStyle = isSelected ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)';
      this.ctx.fillRect(20, y, this.canvas.width - 40, 65);
      this.ctx.strokeStyle = isSelected ? '#00ff88' : 'transparent';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(20, y, this.canvas.width - 40, 65);

      this.ctx.font = '35px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(char.emoji, 35, y + 45);

      this.ctx.fillStyle = char.color;
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(char.name, 85, y + 28);

      this.ctx.fillStyle = '#888';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(char.ability, 85, y + 48);

      this.ctx.textAlign = 'right';
      if (char.owned) {
        if (isSelected) {
          this.ctx.fillStyle = '#00ff88';
          this.ctx.fillText('✓ SELECIONADO', this.canvas.width - 30, y + 38);
        } else {
          this.ctx.fillStyle = '#888';
          this.ctx.fillText('SELECIONAR', this.canvas.width - 30, y + 38);
        }
      } else {
        this.ctx.fillStyle = this.coins >= char.cost ? '#FFD700' : '#666';
        this.ctx.fillText(`🪙 ${char.cost}`, this.canvas.width - 30, y + 38);
      }
    });
  }

  saveProgress() {
    localStorage.setItem('infinityrunner_coins', this.coins);
    localStorage.setItem('infinityrunner_diamonds', this.diamonds);
    localStorage.setItem('infinityrunner_xp', this.xp);
    localStorage.setItem('infinityrunner_level', this.level);
    localStorage.setItem('infinityrunner_highscore', this.highScore);
    localStorage.setItem('infinityrunner_totaldist', Math.floor(this.totalDistance));
    localStorage.setItem('infinityrunner_totalcoins', this.totalCoins);
    localStorage.setItem('infinityrunner_jumps', this.totalJumps);
    localStorage.setItem('infinityrunner_powerups', this.totalPowerups);
    localStorage.setItem('infinityrunner_characters', JSON.stringify(this.characters));
    localStorage.setItem('infinityrunner_missions', JSON.stringify(this.missions));
    localStorage.setItem('infinityrunner_magnet', this.powerUpInventory.magnet);
    localStorage.setItem('infinityrunner_shield', this.powerUpInventory.shield);
    localStorage.setItem('infinityrunner_speed', this.powerUpInventory.speed);
    localStorage.setItem('infinityrunner_jetpack', this.powerUpInventory.jetpack);
  }

  loadProgress() {
    const chars = localStorage.getItem('infinityrunner_characters');
    if (chars) {
      const saved = JSON.parse(chars);
      saved.forEach((s, i) => {
        if (this.characters[i]) {
          this.characters[i].owned = s.owned;
        }
      });
    }

    const missions = localStorage.getItem('infinityrunner_missions');
    if (missions) {
      const saved = JSON.parse(missions);
      saved.forEach((s, i) => {
        if (this.missions[i]) {
          this.missions[i].progress = s.progress || 0;
          this.missions[i].completed = s.completed || false;
        }
      });
    }
  }

  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - (this.lastTime || currentTime);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  }
}

window.addEventListener('load', () => new InfinityRunnerGame());
