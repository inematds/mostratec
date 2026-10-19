// Dino Adventure World - EAI Games
// Jogo de aventura com dinossauros para crianças

class DinoAdventureGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Sistema de moedas e XP
    this.coins = parseInt(localStorage.getItem('eai_dino_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('eai_dino_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('eai_dino_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_dino_level') || '1');
    this.xpToNextLevel = this.level * 100;

    // Estado do jogo
    this.state = 'menu'; // menu, playing, levelComplete, gameover, shop, dinos
    this.currentWorld = 1;
    this.currentStage = 1;
    this.maxWorld = parseInt(localStorage.getItem('eai_dino_maxworld') || '1');
    this.maxStage = parseInt(localStorage.getItem('eai_dino_maxstage') || '1');
    this.score = 0;
    this.stageScore = 0;

    // Dinossauros jogáveis
    this.dinos = [
      { id: 'verde', name: 'Dino Verde', emoji: '🦕', color: '#4CAF50', speed: 1, jump: 1, unlocked: true },
      { id: 'laranja', name: 'Dino Rex', emoji: '🦖', color: '#FF9800', speed: 1.1, jump: 0.9, unlocked: false, price: 300 },
      { id: 'azul', name: 'Dino Aqua', emoji: '🐉', color: '#2196F3', speed: 0.9, jump: 1.2, unlocked: false, price: 500 },
      { id: 'roxo', name: 'Dino Magic', emoji: '🐲', color: '#9C27B0', speed: 1.2, jump: 1.1, unlocked: false, price: 800 },
      { id: 'dourado', name: 'Dino King', emoji: '👑', color: '#FFD700', speed: 1.3, jump: 1.3, unlocked: false, price: 1500 }
    ];
    this.currentDino = localStorage.getItem('eai_dino_current') || 'verde';
    this.loadDinos();

    // Jogador
    this.player = {
      x: 50,
      y: 0,
      width: 50,
      height: 60,
      vx: 0,
      vy: 0,
      grounded: false,
      facing: 1,
      animFrame: 0
    };

    // Elementos do jogo
    this.platforms = [];
    this.collectibles = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    this.exitPortal = null;

    // Power-ups ativos
    this.activePowerUps = {
      shield: false,
      speed: false,
      magnet: false
    };
    this.powerUpTimers = {};

    // Física
    this.gravity = 0.6;
    this.jumpForce = -14;
    this.moveSpeed = 5;
    this.groundY = 0;

    // Câmera
    this.camera = { x: 0, y: 0 };
    this.levelWidth = 2000;

    // Upgrades
    this.upgrades = [
      { id: 'jumpBoost', name: 'Super Pulo', desc: '+10% altura do pulo', price: 200, level: 0, maxLevel: 5, effect: 0.1 },
      { id: 'speedBoost', name: 'Velocidade', desc: '+10% velocidade', price: 250, level: 0, maxLevel: 5, effect: 0.1 },
      { id: 'coinMagnet', name: 'Imã de Moedas', desc: '+20% alcance do imã', price: 300, level: 0, maxLevel: 5, effect: 0.2 },
      { id: 'extraLife', name: 'Vida Extra', desc: '+1 vida por fase', price: 400, level: 0, maxLevel: 3, effect: 1 }
    ];
    this.loadUpgrades();
    this.lives = 3;

    // Conquistas
    this.achievements = [
      { id: 'first_level', name: 'Primeiro Passo', desc: 'Complete a primeira fase', icon: '🎯', unlocked: false },
      { id: 'world_2', name: 'Explorador', desc: 'Alcance o mundo 2', icon: '🗺️', unlocked: false },
      { id: 'coins_500', name: 'Coletor', desc: 'Colete 500 moedas total', icon: '💰', unlocked: false },
      { id: 'no_damage', name: 'Intocável', desc: 'Complete fase sem dano', icon: '⭐', unlocked: false },
      { id: 'all_dinos', name: 'Treinador', desc: 'Desbloqueie todos os dinos', icon: '🦕', unlocked: false },
      { id: 'level_10', name: 'Veterano', desc: 'Alcance nível 10', icon: '🎖️', unlocked: false }
    ];
    this.loadAchievements();
    this.noDamageTaken = true;
    this.totalCoins = parseInt(localStorage.getItem('eai_dino_totalcoins') || '0');

    // Notificações
    this.notifications = [];

    // Controles
    this.keys = {};
    this.touchControls = { left: false, right: false, jump: false };

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_dino_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo!', lines: ['Ajude o dinossauro na aventura!', 'Colete moedas e ovos especiais!', 'Chegue ao portal para completar!'], emoji: '🦕' },
      { title: 'Controles', lines: ['← → ou deslize para mover', 'Toque ou ↑ para pular', 'Evite os inimigos!'], emoji: '🎮' },
      { title: 'Power-ups', lines: ['🛡️ Escudo protetor', '⚡ Super velocidade', '🧲 Imã de moedas'], emoji: '✨' },
      { title: 'Mundos', lines: ['Explore 5 mundos diferentes!', 'Cada mundo tem 10 fases!', 'Vamos começar a aventura!'], emoji: '🌍' }
    ];

    this.setupControls();

    // Game loop
    this.lastTime = 0;
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.groundY = this.canvas.height - 100;
  }

  setupControls() {
    // Teclado
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === 'ArrowUp' || e.key === ' ') {
        if (this.state === 'playing' && this.player.grounded) {
          this.jump();
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleTouch(touch.clientX, touch.clientY, 'start');
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleTouch(touch.clientX, touch.clientY, 'move');
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touchControls = { left: false, right: false, jump: false };
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        this.handleClick(touch.clientX, touch.clientY);
      }
    });

    // Mouse
    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));
  }

  handleTouch(x, y, type) {
    if (this.state !== 'playing') return;

    const third = this.canvas.width / 3;

    if (x < third) {
      this.touchControls.left = true;
      this.touchControls.right = false;
    } else if (x > third * 2) {
      this.touchControls.left = false;
      this.touchControls.right = true;
    } else {
      this.touchControls.left = false;
      this.touchControls.right = false;
      if (type === 'start' && this.player.grounded) {
        this.jump();
      }
    }
  }

  jump() {
    const dino = this.dinos.find(d => d.id === this.currentDino);
    const jumpUpgrade = this.upgrades.find(u => u.id === 'jumpBoost');
    const jumpMult = dino.jump * (1 + jumpUpgrade.level * jumpUpgrade.effect);

    this.player.vy = this.jumpForce * jumpMult;
    this.player.grounded = false;

    // Partículas de pulo
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2,
        size: Math.random() * 6 + 2,
        color: '#8B4513',
        life: 1
      });
    }
  }

  generateLevel(world, stage) {
    this.platforms = [];
    this.collectibles = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];

    // Parâmetros baseados no mundo
    const difficulty = (world - 1) * 0.2 + stage * 0.05;
    this.levelWidth = 2000 + world * 500 + stage * 100;

    // Chão base
    this.platforms.push({
      x: 0,
      y: this.groundY,
      width: 300,
      height: 100,
      type: 'ground'
    });

    // Gerar plataformas
    let lastX = 250;
    while (lastX < this.levelWidth - 400) {
      const gap = 80 + Math.random() * 100;
      const width = 100 + Math.random() * 150;
      const heightVar = Math.random() * 150;

      lastX += gap + width / 2;

      // Tipo de plataforma
      const types = ['normal', 'normal', 'moving', 'breaking'];
      const type = difficulty > 0.3 ? types[Math.floor(Math.random() * types.length)] : 'normal';

      this.platforms.push({
        x: lastX,
        y: this.groundY - 50 - heightVar,
        width,
        height: 25,
        type,
        startX: lastX,
        moveDir: 1,
        moveSpeed: 1 + Math.random() * 2,
        breaking: false,
        breakTimer: 0
      });

      // Moedas
      if (Math.random() < 0.7) {
        const coinCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < coinCount; i++) {
          this.collectibles.push({
            x: lastX - width / 4 + (width / 2) * (i / coinCount),
            y: this.groundY - 80 - heightVar - 30,
            type: 'coin',
            collected: false,
            animOffset: Math.random() * Math.PI * 2
          });
        }
      }

      // Ovos especiais (diamantes)
      if (Math.random() < 0.1) {
        this.collectibles.push({
          x: lastX,
          y: this.groundY - 80 - heightVar - 50,
          type: 'egg',
          collected: false,
          animOffset: Math.random() * Math.PI * 2
        });
      }

      // Inimigos
      if (difficulty > 0.1 && Math.random() < 0.3 + difficulty * 0.3) {
        const enemyTypes = ['slime', 'bat', 'spikes'];
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        this.enemies.push({
          x: lastX,
          y: enemyType === 'bat' ? this.groundY - 150 - heightVar : this.groundY - 30,
          width: 40,
          height: 40,
          type: enemyType,
          startX: lastX,
          moveDir: 1,
          moveSpeed: enemyType === 'spikes' ? 0 : 1 + Math.random() * 2
        });
      }

      lastX += width / 2;
    }

    // Portal de saída
    this.exitPortal = {
      x: this.levelWidth - 150,
      y: this.groundY - 100,
      width: 80,
      height: 100,
      animFrame: 0
    };

    // Plataforma final
    this.platforms.push({
      x: this.levelWidth - 200,
      y: this.groundY,
      width: 300,
      height: 100,
      type: 'ground'
    });

    // Power-ups
    const powerUpTypes = ['shield', 'speed', 'magnet'];
    for (let i = 0; i < 2 + stage; i++) {
      if (Math.random() < 0.3) {
        this.powerUps.push({
          x: 300 + Math.random() * (this.levelWidth - 600),
          y: this.groundY - 150 - Math.random() * 100,
          type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
          collected: false
        });
      }
    }

    // Reset jogador
    this.player.x = 50;
    this.player.y = this.groundY - this.player.height - 50;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.grounded = false;
    this.camera.x = 0;

    // Vidas
    const extraLifeUpgrade = this.upgrades.find(u => u.id === 'extraLife');
    this.lives = 3 + extraLifeUpgrade.level * extraLifeUpgrade.effect;

    this.noDamageTaken = true;
    this.stageScore = 0;
    this.activePowerUps = { shield: false, speed: false, magnet: false };
    this.powerUpTimers = {};
  }

  startStage(world, stage) {
    this.currentWorld = world;
    this.currentStage = stage;
    this.state = 'playing';
    this.generateLevel(world, stage);
  }

  update(deltaTime) {
    if (this.state !== 'playing') return;

    const dino = this.dinos.find(d => d.id === this.currentDino);
    const speedUpgrade = this.upgrades.find(u => u.id === 'speedBoost');
    const speedMult = dino.speed * (1 + speedUpgrade.level * speedUpgrade.effect) *
                      (this.activePowerUps.speed ? 1.5 : 1);

    // Movimento horizontal
    this.player.vx = 0;
    if (this.keys['ArrowLeft'] || this.touchControls.left) {
      this.player.vx = -this.moveSpeed * speedMult;
      this.player.facing = -1;
    }
    if (this.keys['ArrowRight'] || this.touchControls.right) {
      this.player.vx = this.moveSpeed * speedMult;
      this.player.facing = 1;
    }

    // Gravidade
    this.player.vy += this.gravity;

    // Limitar velocidade de queda
    if (this.player.vy > 15) this.player.vy = 15;

    // Mover jogador
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Colisão com plataformas
    this.player.grounded = false;
    for (const platform of this.platforms) {
      // Atualizar plataformas móveis
      if (platform.type === 'moving') {
        platform.x += platform.moveDir * platform.moveSpeed;
        if (Math.abs(platform.x - platform.startX) > 100) {
          platform.moveDir *= -1;
        }
      }

      // Plataforma quebrando
      if (platform.type === 'breaking' && platform.breaking) {
        platform.breakTimer += deltaTime / 1000;
        if (platform.breakTimer > 1) {
          platform.y = 9999; // Esconder
        }
      }

      // Verificar colisão
      if (this.checkPlatformCollision(platform)) {
        if (platform.type === 'breaking' && !platform.breaking) {
          platform.breaking = true;
        }
      }
    }

    // Colisão com chão
    if (this.player.y + this.player.height > this.groundY + 50) {
      this.takeDamage();
    }

    // Limites laterais
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.levelWidth - this.player.width) {
      this.player.x = this.levelWidth - this.player.width;
    }

    // Animação
    if (this.player.vx !== 0 && this.player.grounded) {
      this.player.animFrame += 0.2;
    }

    // Câmera
    const targetCameraX = this.player.x - this.canvas.width / 3;
    this.camera.x += (targetCameraX - this.camera.x) * 0.1;
    if (this.camera.x < 0) this.camera.x = 0;
    if (this.camera.x > this.levelWidth - this.canvas.width) {
      this.camera.x = this.levelWidth - this.canvas.width;
    }

    // Coletar itens
    const magnetUpgrade = this.upgrades.find(u => u.id === 'coinMagnet');
    const magnetRange = 100 * (1 + magnetUpgrade.level * magnetUpgrade.effect) *
                       (this.activePowerUps.magnet ? 3 : 1);

    for (const item of this.collectibles) {
      if (item.collected) continue;

      const dist = Math.sqrt(
        (this.player.x + this.player.width / 2 - item.x) ** 2 +
        (this.player.y + this.player.height / 2 - item.y) ** 2
      );

      // Efeito magnético
      if (dist < magnetRange) {
        const angle = Math.atan2(
          this.player.y + this.player.height / 2 - item.y,
          this.player.x + this.player.width / 2 - item.x
        );
        item.x += Math.cos(angle) * 5;
        item.y += Math.sin(angle) * 5;
      }

      // Coletar
      if (dist < 30) {
        item.collected = true;

        if (item.type === 'coin') {
          this.coins += 1;
          this.stageScore += 10;
          this.totalCoins++;
          this.createCollectEffect(item.x, item.y, '#FFD700');
        } else if (item.type === 'egg') {
          this.diamonds += 1;
          this.stageScore += 50;
          this.createCollectEffect(item.x, item.y, '#9C27B0');
          this.addNotification('🥚 +1 Diamante!', item.x, item.y);
        }
      }
    }

    // Coletar power-ups
    for (const pu of this.powerUps) {
      if (pu.collected) continue;

      const dist = Math.sqrt(
        (this.player.x + this.player.width / 2 - pu.x) ** 2 +
        (this.player.y + this.player.height / 2 - pu.y) ** 2
      );

      if (dist < 40) {
        pu.collected = true;
        this.activatePowerUp(pu.type);
      }
    }

    // Inimigos
    for (const enemy of this.enemies) {
      // Movimento
      if (enemy.type !== 'spikes') {
        enemy.x += enemy.moveDir * enemy.moveSpeed;
        if (Math.abs(enemy.x - enemy.startX) > 80) {
          enemy.moveDir *= -1;
        }
      }

      // Colisão com jogador
      if (this.checkEnemyCollision(enemy)) {
        if (!this.activePowerUps.shield) {
          this.takeDamage();
        } else {
          // Escudo protege
          this.activePowerUps.shield = false;
          this.createCollectEffect(enemy.x, enemy.y, '#00BCD4');
          this.addNotification('🛡️ Escudo usado!', enemy.x, enemy.y);
        }
      }
    }

    // Atualizar power-ups ativos
    Object.keys(this.powerUpTimers).forEach(key => {
      this.powerUpTimers[key] -= deltaTime / 1000;
      if (this.powerUpTimers[key] <= 0) {
        this.activePowerUps[key] = false;
        delete this.powerUpTimers[key];
      }
    });

    // Portal de saída
    if (this.exitPortal) {
      this.exitPortal.animFrame += 0.1;

      const dist = Math.sqrt(
        (this.player.x + this.player.width / 2 - this.exitPortal.x - this.exitPortal.width / 2) ** 2 +
        (this.player.y + this.player.height / 2 - this.exitPortal.y - this.exitPortal.height / 2) ** 2
      );

      if (dist < 50) {
        this.completeStage();
      }
    }

    // Atualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.vy !== undefined) p.vy += 0.2;
      p.life -= 0.02;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Atualizar notificações
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.y -= 1;
      n.alpha -= 0.015;

      if (n.alpha <= 0) {
        this.notifications.splice(i, 1);
      }
    }
  }

  checkPlatformCollision(platform) {
    // Verificar se está caindo sobre a plataforma
    if (this.player.vy >= 0) {
      const playerBottom = this.player.y + this.player.height;
      const prevPlayerBottom = playerBottom - this.player.vy;

      if (prevPlayerBottom <= platform.y &&
          playerBottom >= platform.y &&
          this.player.x + this.player.width > platform.x - platform.width / 2 &&
          this.player.x < platform.x + platform.width / 2) {

        this.player.y = platform.y - this.player.height;
        this.player.vy = 0;
        this.player.grounded = true;

        // Mover com plataforma móvel
        if (platform.type === 'moving') {
          this.player.x += platform.moveDir * platform.moveSpeed;
        }

        return true;
      }
    }
    return false;
  }

  checkEnemyCollision(enemy) {
    return (
      this.player.x < enemy.x + enemy.width / 2 &&
      this.player.x + this.player.width > enemy.x - enemy.width / 2 &&
      this.player.y < enemy.y + enemy.height &&
      this.player.y + this.player.height > enemy.y
    );
  }

  activatePowerUp(type) {
    const duration = 10;
    this.activePowerUps[type] = true;
    this.powerUpTimers[type] = duration;

    const names = {
      shield: '🛡️ Escudo ativado!',
      speed: '⚡ Velocidade ativada!',
      magnet: '🧲 Imã ativado!'
    };

    this.addNotification(names[type], this.player.x, this.player.y);
    this.createCollectEffect(this.player.x + this.player.width / 2, this.player.y, '#FFD700');
  }

  takeDamage() {
    if (this.player.y > this.canvas.height) {
      // Caiu do mapa
      this.lives--;
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.respawn();
      }
      return;
    }

    this.noDamageTaken = false;
    this.lives--;

    this.createCollectEffect(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      '#FF5252'
    );

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Knockback
      this.player.vx = -this.player.facing * 8;
      this.player.vy = -8;
      this.addNotification('💔 -1 Vida!', this.player.x, this.player.y);
    }
  }

  respawn() {
    this.player.x = 50;
    this.player.y = this.groundY - this.player.height - 50;
    this.player.vx = 0;
    this.player.vy = 0;
    this.camera.x = 0;
  }

  completeStage() {
    this.state = 'levelComplete';

    // Bônus por não tomar dano
    if (this.noDamageTaken) {
      this.stageScore += 100;
      this.coins += 10;
    }

    // Bônus por vidas restantes
    this.stageScore += this.lives * 25;

    // XP
    this.xp += 20 + this.currentWorld * 5 + this.currentStage * 2;
    this.checkLevelUp();

    // Atualizar progresso
    if (this.currentWorld > this.maxWorld ||
       (this.currentWorld === this.maxWorld && this.currentStage >= this.maxStage)) {
      if (this.currentStage >= 10) {
        this.maxWorld = Math.min(this.currentWorld + 1, 5);
        this.maxStage = 1;
      } else {
        this.maxStage = this.currentStage + 1;
      }
      localStorage.setItem('eai_dino_maxworld', this.maxWorld.toString());
      localStorage.setItem('eai_dino_maxstage', this.maxStage.toString());
    }

    // Diamante a cada 5 fases
    const totalStages = (this.currentWorld - 1) * 10 + this.currentStage;
    if (totalStages % 5 === 0) {
      this.diamonds++;
    }

    this.checkAchievements();
    this.save();
  }

  gameOver() {
    this.state = 'gameover';
    this.save();
  }

  createCollectEffect(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        size: Math.random() * 6 + 3,
        color,
        life: 1
      });
    }
  }

  addNotification(text, x, y) {
    this.notifications.push({ text, x, y, alpha: 1 });
  }

  checkLevelUp() {
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = this.level * 100;
      this.diamonds++;
      this.addNotification(`🎉 Nível ${this.level}!`, this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  draw() {
    // Fundo baseado no mundo
    const worldColors = [
      { sky: '#87CEEB', ground: '#228B22' },
      { sky: '#FFB347', ground: '#C19A6B' },
      { sky: '#2F4F4F', ground: '#4A4A4A' },
      { sky: '#4169E1', ground: '#1E90FF' },
      { sky: '#800080', ground: '#9400D3' }
    ];
    const colors = worldColors[(this.currentWorld - 1) % worldColors.length];

    // Céu
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, colors.sky);
    gradient.addColorStop(1, this.adjustColor(colors.sky, -30));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.drawMenu();
    } else if (this.state === 'playing') {
      this.drawGame();
    } else if (this.state === 'levelComplete') {
      this.drawLevelComplete();
    } else if (this.state === 'gameover') {
      this.drawGameOver();
    } else if (this.state === 'shop') {
      this.drawShop();
    } else if (this.state === 'dinos') {
      this.drawDinoSelect();
    }

    if (this.showTutorial) {
      this.drawTutorial();
    }
  }

  drawMenu() {
    const cx = this.canvas.width / 2;
    const dino = this.dinos.find(d => d.id === this.currentDino);

    // Dino animado
    this.ctx.font = '100px Arial';
    this.ctx.textAlign = 'center';
    const bounce = Math.sin(Date.now() * 0.005) * 10;
    this.ctx.fillText(dino.emoji, cx, 150 + bounce);

    // Título
    this.ctx.font = 'bold 42px Arial';
    this.ctx.fillStyle = '#2d6a4f';
    this.ctx.shadowColor = '#000';
    this.ctx.shadowBlur = 10;
    this.ctx.fillText('DINO ADVENTURE', cx, 230);
    this.ctx.shadowBlur = 0;

    // Recursos
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 40);
    this.ctx.fillStyle = '#9C27B0';
    this.ctx.fillText(`💎 ${this.diamonds}`, 20, 65);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillText(`⭐ Nível ${this.level}`, 20, 90);

    // Progresso
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#2d6a4f';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`📍 Mundo ${this.maxWorld} - Fase ${this.maxStage}`, cx, 270);

    // Botões
    const buttons = [
      { text: '▶️ JOGAR', y: 310 },
      { text: '🦕 DINOSSAUROS', y: 375 },
      { text: '🛒 LOJA', y: 440 },
      { text: '🏆 CONQUISTAS', y: 505 }
    ];

    buttons.forEach(btn => {
      const btnWidth = 240;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(45, 106, 79, 0.8)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 15);
      this.ctx.fill();

      this.ctx.strokeStyle = '#95d5b2';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 36);
    });
  }

  drawGame() {
    // Elementos do jogo com offset de câmera
    this.ctx.save();
    this.ctx.translate(-this.camera.x, 0);

    // Chão decorativo
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, this.groundY, this.levelWidth, this.canvas.height - this.groundY);

    // Grama
    this.ctx.fillStyle = '#32CD32';
    for (let x = 0; x < this.levelWidth; x += 20) {
      this.ctx.fillRect(x, this.groundY - 5, 15, 10);
    }

    // Plataformas
    for (const platform of this.platforms) {
      if (platform.y > this.canvas.height) continue;

      if (platform.type === 'ground') {
        this.ctx.fillStyle = '#8B4513';
      } else if (platform.type === 'breaking') {
        this.ctx.fillStyle = platform.breaking ? '#FF6B6B' : '#DEB887';
      } else if (platform.type === 'moving') {
        this.ctx.fillStyle = '#87CEEB';
      } else {
        this.ctx.fillStyle = '#A0522D';
      }

      this.ctx.beginPath();
      this.ctx.roundRect(
        platform.x - platform.width / 2,
        platform.y,
        platform.width,
        platform.height,
        5
      );
      this.ctx.fill();

      // Detalhe de grama no topo
      if (platform.type !== 'breaking') {
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(platform.x - platform.width / 2, platform.y - 3, platform.width, 6);
      }
    }

    // Coletáveis
    for (const item of this.collectibles) {
      if (item.collected) continue;

      const bounce = Math.sin(Date.now() * 0.005 + item.animOffset) * 5;

      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.type === 'coin' ? '🪙' : '🥚', item.x, item.y + bounce);
    }

    // Power-ups
    for (const pu of this.powerUps) {
      if (pu.collected) continue;

      const bounce = Math.sin(Date.now() * 0.004) * 5;
      const glow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;

      this.ctx.globalAlpha = glow;
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';

      const emojis = { shield: '🛡️', speed: '⚡', magnet: '🧲' };
      this.ctx.fillText(emojis[pu.type], pu.x, pu.y + bounce);
      this.ctx.globalAlpha = 1;
    }

    // Inimigos
    for (const enemy of this.enemies) {
      this.ctx.font = '35px Arial';
      this.ctx.textAlign = 'center';

      const emojis = { slime: '🟢', bat: '🦇', spikes: '🔺' };
      const bounce = enemy.type === 'bat' ? Math.sin(Date.now() * 0.01) * 10 : 0;

      this.ctx.save();
      this.ctx.translate(enemy.x, enemy.y + bounce);
      if (enemy.moveDir < 0) this.ctx.scale(-1, 1);
      this.ctx.fillText(emojis[enemy.type], 0, enemy.height / 2);
      this.ctx.restore();
    }

    // Portal de saída
    if (this.exitPortal) {
      const scale = 1 + Math.sin(this.exitPortal.animFrame) * 0.1;

      this.ctx.save();
      this.ctx.translate(
        this.exitPortal.x + this.exitPortal.width / 2,
        this.exitPortal.y + this.exitPortal.height / 2
      );
      this.ctx.scale(scale, scale);

      // Efeito de brilho
      this.ctx.shadowColor = '#9C27B0';
      this.ctx.shadowBlur = 20;

      this.ctx.font = '60px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🌀', 0, 0);

      this.ctx.shadowBlur = 0;
      this.ctx.restore();
    }

    // Partículas
    for (const p of this.particles) {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // Jogador
    this.drawPlayer();

    // Notificações
    for (const n of this.notifications) {
      this.ctx.globalAlpha = n.alpha;
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 5;
      this.ctx.fillText(n.text, n.x, n.y);
      this.ctx.shadowBlur = 0;
    }
    this.ctx.globalAlpha = 1;

    this.ctx.restore();

    // HUD (fixo na tela)
    this.drawHUD();

    // Controles touch
    this.drawTouchControls();
  }

  drawPlayer() {
    const dino = this.dinos.find(d => d.id === this.currentDino);

    this.ctx.save();
    this.ctx.translate(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );

    // Flip horizontal
    if (this.player.facing < 0) {
      this.ctx.scale(-1, 1);
    }

    // Efeitos de power-up
    if (this.activePowerUps.shield) {
      this.ctx.strokeStyle = '#00BCD4';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 35, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    if (this.activePowerUps.speed) {
      // Linhas de velocidade
      this.ctx.strokeStyle = '#FFEB3B';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(-30 - i * 10, -10 + i * 10);
        this.ctx.lineTo(-50 - i * 10, -10 + i * 10);
        this.ctx.stroke();
      }
    }

    // Animação de caminhada
    const walkOffset = this.player.grounded && Math.abs(this.player.vx) > 0 ?
      Math.sin(this.player.animFrame) * 3 : 0;

    // Dinossauro
    this.ctx.font = '50px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(dino.emoji, 0, walkOffset);

    this.ctx.restore();
  }

  drawHUD() {
    // Vidas
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'left';
    let livesText = '';
    for (let i = 0; i < this.lives; i++) {
      livesText += '❤️';
    }
    this.ctx.fillText(livesText, 20, 35);

    // Moedas e pontuação
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 65);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`⭐ ${this.stageScore}`, 20, 90);

    // Fase atual
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Mundo ${this.currentWorld} - Fase ${this.currentStage}`, this.canvas.width / 2, 30);

    // Power-ups ativos
    let puX = this.canvas.width - 60;
    Object.keys(this.activePowerUps).forEach(key => {
      if (this.activePowerUps[key]) {
        const emojis = { shield: '🛡️', speed: '⚡', magnet: '🧲' };
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(emojis[key], puX, 35);

        // Timer
        const time = Math.ceil(this.powerUpTimers[key] || 0);
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`${time}s`, puX, 55);

        puX -= 50;
      }
    });

    // Barra de progresso
    const progress = (this.player.x / this.levelWidth);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(20, this.canvas.height - 20, this.canvas.width - 40, 10);

    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(20, this.canvas.height - 20, (this.canvas.width - 40) * progress, 10);

    // Marcador de portal
    this.ctx.font = '16px Arial';
    this.ctx.fillText('🌀', this.canvas.width - 30, this.canvas.height - 25);
  }

  drawTouchControls() {
    // Áreas de controle (semi-transparentes)
    this.ctx.globalAlpha = 0.3;

    // Esquerda
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height);
    this.ctx.lineTo(this.canvas.width / 3, this.canvas.height);
    this.ctx.lineTo(this.canvas.width / 3, this.canvas.height - 150);
    this.ctx.lineTo(0, this.canvas.height - 150);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('⬅️', this.canvas.width / 6, this.canvas.height - 75);

    // Direita
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width * 2 / 3, this.canvas.height);
    this.ctx.lineTo(this.canvas.width, this.canvas.height);
    this.ctx.lineTo(this.canvas.width, this.canvas.height - 150);
    this.ctx.lineTo(this.canvas.width * 2 / 3, this.canvas.height - 150);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillText('➡️', this.canvas.width * 5 / 6, this.canvas.height - 75);

    // Centro (pulo)
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 3, this.canvas.height);
    this.ctx.lineTo(this.canvas.width * 2 / 3, this.canvas.height);
    this.ctx.lineTo(this.canvas.width * 2 / 3, this.canvas.height - 150);
    this.ctx.lineTo(this.canvas.width / 3, this.canvas.height - 150);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillText('⬆️', this.canvas.width / 2, this.canvas.height - 75);

    this.ctx.globalAlpha = 1;
  }

  drawLevelComplete() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;

    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎉 FASE COMPLETA!', cx, 120);

    this.ctx.font = '28px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`Pontuação: ${this.stageScore}`, cx, 180);

    // Bônus
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    if (this.noDamageTaken) {
      this.ctx.fillText('⭐ Sem dano: +100', cx, 220);
    }
    this.ctx.fillText(`❤️ Vidas restantes (x${this.lives}): +${this.lives * 25}`, cx, 250);

    // Estrelas
    const stars = this.noDamageTaken ? 3 : this.lives >= 2 ? 2 : 1;
    this.ctx.font = '40px Arial';
    let starText = '';
    for (let i = 0; i < 3; i++) {
      starText += i < stars ? '⭐' : '☆';
    }
    this.ctx.fillText(starText, cx, 310);

    // Botões
    const buttons = [
      { text: '▶️ PRÓXIMA FASE', y: 380 },
      { text: '🔄 JOGAR NOVAMENTE', y: 450 },
      { text: '🏠 MENU', y: 520 }
    ];

    buttons.forEach(btn => {
      const btnWidth = 280;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(45, 106, 79, 0.9)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 12);
      this.ctx.fill();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 36);
    });
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;

    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#FF5252';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('😢 FIM DE JOGO', cx, 120);

    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`Pontuação: ${this.stageScore}`, cx, 180);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText('Não desista! Tente novamente!', cx, 230);

    const buttons = [
      { text: '🔄 TENTAR NOVAMENTE', y: 300 },
      { text: '🏠 MENU', y: 370 }
    ];

    buttons.forEach(btn => {
      const btnWidth = 280;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(45, 106, 79, 0.8)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 12);
      this.ctx.fill();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 36);
    });
  }

  drawShop() {
    const cx = this.canvas.width / 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#95d5b2';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛒 LOJA', cx, 45);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 70);

    // Upgrades
    this.upgrades.forEach((up, i) => {
      const y = 100 + i * 80;
      const maxed = up.level >= up.maxLevel;

      this.ctx.fillStyle = maxed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 70, 10);
      this.ctx.fill();

      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(up.name, 30, y + 25);

      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = '#95d5b2';
      this.ctx.fillText(up.desc, 30, y + 45);

      this.ctx.fillStyle = '#4CAF50';
      this.ctx.fillText(`Nível ${up.level}/${up.maxLevel}`, 30, y + 62);

      if (!maxed) {
        const canBuy = this.coins >= up.price;
        const btnX = this.canvas.width - 110;
        this.ctx.fillStyle = canBuy ? 'rgba(255, 193, 7, 0.8)' : 'rgba(100, 100, 100, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(btnX, y + 18, 80, 35, 8);
        this.ctx.fill();

        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = canBuy ? '#000' : '#666';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`🪙 ${up.price}`, btnX + 40, y + 40);
      }
    });

    this.drawBackButton();
  }

  drawDinoSelect() {
    const cx = this.canvas.width / 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#95d5b2';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🦕 DINOSSAUROS', cx, 45);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 70);

    // Dinossauros
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 110;

    this.dinos.forEach((dino, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = 100 + row * (itemHeight + 10);

      const isSelected = dino.id === this.currentDino;

      this.ctx.fillStyle = isSelected ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, itemWidth, itemHeight, 10);
      this.ctx.fill();

      if (isSelected) {
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      }

      // Emoji
      this.ctx.font = '40px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(dino.emoji, x + 40, y + 50);

      // Info
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(dino.name, x + 70, y + 35);

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#95d5b2';
      this.ctx.fillText(`Vel: ${(dino.speed * 100).toFixed(0)}%`, x + 70, y + 55);
      this.ctx.fillText(`Pulo: ${(dino.jump * 100).toFixed(0)}%`, x + 70, y + 70);

      // Status
      if (dino.unlocked) {
        if (isSelected) {
          this.ctx.font = '12px Arial';
          this.ctx.fillStyle = '#4CAF50';
          this.ctx.fillText('✓ Ativo', x + 70, y + 90);
        }
      } else {
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`🪙 ${dino.price}`, x + 70, y + 90);
      }
    });

    this.drawBackButton();
  }

  drawBackButton() {
    const btnWidth = 120;
    const btnHeight = 45;
    const btnX = (this.canvas.width - btnWidth) / 2;
    const btnY = this.canvas.height - 65;

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
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const page = this.tutorialPages[this.tutorialPage];

    this.ctx.font = '80px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(page.emoji, cx, 140);

    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillStyle = '#95d5b2';
    this.ctx.fillText(page.title, cx, 210);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#ffffff';
    page.lines.forEach((line, i) => {
      this.ctx.fillText(line, cx, 270 + i * 35);
    });

    // Indicadores
    const dotY = this.canvas.height - 140;
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
    const text = this.tutorialPage < this.tutorialPages.length - 1 ? 'PRÓXIMO →' : 'COMEÇAR! 🦕';
    this.ctx.fillText(text, cx, btnY + 33);
  }

  handleClick(x, y) {
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

    const cx = this.canvas.width / 2;

    if (this.state === 'menu') {
      const buttons = [
        { y: 310, action: () => this.startStage(this.maxWorld, this.maxStage) },
        { y: 375, action: () => this.state = 'dinos' },
        { y: 440, action: () => this.state = 'shop' },
        { y: 505, action: () => this.state = 'achievements' }
      ];

      buttons.forEach(btn => {
        if (x > cx - 120 && x < cx + 120 && y > btn.y && y < btn.y + 55) {
          btn.action();
        }
      });

    } else if (this.state === 'levelComplete') {
      if (y > 380 && y < 435) {
        // Próxima fase
        let nextWorld = this.currentWorld;
        let nextStage = this.currentStage + 1;
        if (nextStage > 10) {
          nextWorld = Math.min(nextWorld + 1, 5);
          nextStage = 1;
        }
        this.startStage(nextWorld, nextStage);
      } else if (y > 450 && y < 505) {
        this.startStage(this.currentWorld, this.currentStage);
      } else if (y > 520 && y < 575) {
        this.state = 'menu';
      }

    } else if (this.state === 'gameover') {
      if (y > 300 && y < 355) {
        this.startStage(this.currentWorld, this.currentStage);
      } else if (y > 370 && y < 425) {
        this.state = 'menu';
      }

    } else if (this.state === 'shop') {
      this.handleShopClick(x, y);

    } else if (this.state === 'dinos') {
      this.handleDinoSelectClick(x, y);
    }

    // Botão voltar
    if (this.state === 'shop' || this.state === 'dinos' || this.state === 'achievements') {
      const btnY = this.canvas.height - 65;
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
        localStorage.setItem('eai_dino_tutorial_seen', 'true');
      }
    }
  }

  handleShopClick(x, y) {
    this.upgrades.forEach((up, i) => {
      const itemY = 100 + i * 80;
      const btnX = this.canvas.width - 110;

      if (x > btnX && x < btnX + 80 && y > itemY + 18 && y < itemY + 53) {
        if (up.level < up.maxLevel && this.coins >= up.price) {
          this.coins -= up.price;
          up.level++;
          up.price = Math.floor(up.price * 1.5);
          this.saveUpgrades();
          this.save();
        }
      }
    });
  }

  handleDinoSelectClick(x, y) {
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 110;

    this.dinos.forEach((dino, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const itemX = 20 + col * (itemWidth + 10);
      const itemY = 100 + row * (itemHeight + 10);

      if (x > itemX && x < itemX + itemWidth && y > itemY && y < itemY + itemHeight) {
        if (dino.unlocked) {
          this.currentDino = dino.id;
          localStorage.setItem('eai_dino_current', dino.id);
        } else if (this.coins >= dino.price) {
          this.coins -= dino.price;
          dino.unlocked = true;
          this.currentDino = dino.id;
          this.saveDinos();
          this.save();
          this.checkAchievements();
        }
      }
    });
  }

  adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  checkAchievements() {
    const checks = [
      { id: 'first_level', condition: this.maxStage > 1 || this.maxWorld > 1 },
      { id: 'world_2', condition: this.maxWorld >= 2 },
      { id: 'coins_500', condition: this.totalCoins >= 500 },
      { id: 'no_damage', condition: this.noDamageTaken && this.state === 'levelComplete' },
      { id: 'all_dinos', condition: this.dinos.every(d => d.unlocked) },
      { id: 'level_10', condition: this.level >= 10 }
    ];

    checks.forEach(check => {
      const ach = this.achievements.find(a => a.id === check.id);
      if (ach && !ach.unlocked && check.condition) {
        ach.unlocked = true;
        this.diamonds += 5;
        this.addNotification(`🏆 ${ach.name}!`, this.canvas.width / 2, this.canvas.height / 2);
      }
    });

    localStorage.setItem('eai_dino_totalcoins', this.totalCoins.toString());
    this.saveAchievements();
  }

  save() {
    localStorage.setItem('eai_dino_coins', this.coins.toString());
    localStorage.setItem('eai_dino_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_dino_xp', this.xp.toString());
    localStorage.setItem('eai_dino_level', this.level.toString());
  }

  loadDinos() {
    const saved = localStorage.getItem('eai_dino_dinos');
    if (saved) {
      const unlocked = JSON.parse(saved);
      this.dinos.forEach(d => {
        if (unlocked.includes(d.id)) d.unlocked = true;
      });
    }
  }

  saveDinos() {
    const unlocked = this.dinos.filter(d => d.unlocked).map(d => d.id);
    localStorage.setItem('eai_dino_dinos', JSON.stringify(unlocked));
  }

  loadUpgrades() {
    const saved = localStorage.getItem('eai_dino_upgrades');
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
    localStorage.setItem('eai_dino_upgrades', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('eai_dino_achievements');
    if (saved) {
      const unlocked = JSON.parse(saved);
      this.achievements.forEach(a => {
        if (unlocked.includes(a.id)) a.unlocked = true;
      });
    }
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_dino_achievements', JSON.stringify(unlocked));
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
  new DinoAdventureGame();
});
