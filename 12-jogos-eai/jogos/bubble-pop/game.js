// Bubble Pop Kingdom - EAI Games
// Jogo de bolhas tipo Puzzle Bobble com muitos níveis

class BubblePopGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Sistema de moedas e XP
    this.coins = parseInt(localStorage.getItem('eai_bubblepop_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('eai_bubblepop_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('eai_bubblepop_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_bubblepop_level') || '1');
    this.xpToNextLevel = this.level * 100;

    // Estado do jogo
    this.state = 'menu'; // menu, playing, levelComplete, gameover, shop, levels
    this.currentStage = parseInt(localStorage.getItem('eai_bubblepop_stage') || '1');
    this.maxUnlockedStage = parseInt(localStorage.getItem('eai_bubblepop_maxstage') || '1');
    this.score = 0;
    this.moves = 0;
    this.maxMoves = 30;

    // Grid de bolhas
    this.gridCols = 10;
    this.gridRows = 12;
    this.bubbleRadius = 0;
    this.bubbles = [];
    this.shootingBubble = null;
    this.nextBubble = null;

    // Cores das bolhas
    this.bubbleColors = [
      { color: '#FF5252', emoji: '🔴', name: 'Vermelho' },
      { color: '#448AFF', emoji: '🔵', name: 'Azul' },
      { color: '#69F0AE', emoji: '🟢', name: 'Verde' },
      { color: '#FFD740', emoji: '🟡', name: 'Amarelo' },
      { color: '#E040FB', emoji: '🟣', name: 'Roxo' },
      { color: '#FF6E40', emoji: '🟠', name: 'Laranja' }
    ];

    // Bolhas especiais
    this.specialBubbles = [
      { type: 'bomb', emoji: '💣', effect: 'Explode área 3x3' },
      { type: 'rainbow', emoji: '🌈', effect: 'Combina com qualquer cor' },
      { type: 'star', emoji: '⭐', effect: 'Remove linha inteira' },
      { type: 'lightning', emoji: '⚡', effect: 'Remove coluna' }
    ];

    // Mira
    this.aimAngle = -Math.PI / 2;
    this.shooterX = 0;
    this.shooterY = 0;

    // Partículas e animações
    this.particles = [];
    this.poppingBubbles = [];
    this.fallingBubbles = [];

    // Power-ups
    this.powerUps = [
      { id: 'bomb', name: 'Bomba', desc: 'Próxima bolha explode', emoji: '💣', price: 50, count: parseInt(localStorage.getItem('eai_bubblepop_bomb') || '3') },
      { id: 'rainbow', name: 'Arco-íris', desc: 'Combina com tudo', emoji: '🌈', price: 75, count: parseInt(localStorage.getItem('eai_bubblepop_rainbow') || '2') },
      { id: 'aim', name: 'Mira Laser', desc: 'Mostra trajetória', emoji: '🎯', price: 100, count: parseInt(localStorage.getItem('eai_bubblepop_aim') || '1') },
      { id: 'extra', name: '+5 Jogadas', desc: 'Mais 5 jogadas', emoji: '➕', price: 60, count: parseInt(localStorage.getItem('eai_bubblepop_extra') || '2') }
    ];
    this.activePowerUp = null;
    this.showLaserAim = false;

    // Upgrades permanentes
    this.upgrades = [
      { id: 'startMoves', name: 'Jogadas Iniciais', desc: '+3 jogadas por fase', price: 300, level: 0, maxLevel: 5, effect: 3 },
      { id: 'coinBonus', name: 'Bônus Moedas', desc: '+20% moedas ganhas', price: 400, level: 0, maxLevel: 5, effect: 0.2 },
      { id: 'comboMulti', name: 'Multiplicador', desc: '+10% pontos combo', price: 500, level: 0, maxLevel: 5, effect: 0.1 },
      { id: 'bubbleSize', name: 'Precisão', desc: 'Bolhas maiores', price: 350, level: 0, maxLevel: 3, effect: 2 }
    ];
    this.loadUpgrades();

    // Conquistas
    this.achievements = [
      { id: 'first_pop', name: 'Primeira Explosão', desc: 'Estoure 3 bolhas de uma vez', icon: '🎈', unlocked: false },
      { id: 'combo_5', name: 'Combo Master', desc: 'Faça combo de 5', icon: '🔥', unlocked: false },
      { id: 'stage_10', name: 'Explorador', desc: 'Complete 10 fases', icon: '🗺️', unlocked: false },
      { id: 'stage_25', name: 'Aventureiro', desc: 'Complete 25 fases', icon: '⛰️', unlocked: false },
      { id: 'stage_50', name: 'Lenda', desc: 'Complete 50 fases', icon: '👑', unlocked: false },
      { id: 'perfect', name: 'Perfeito', desc: 'Complete fase sem errar', icon: '💎', unlocked: false },
      { id: 'coins_1000', name: 'Rico', desc: 'Acumule 1000 moedas', icon: '💰', unlocked: false },
      { id: 'level_10', name: 'Veterano', desc: 'Alcance nível 10', icon: '🎖️', unlocked: false }
    ];
    this.loadAchievements();

    // Estatísticas
    this.totalBubblesPopped = parseInt(localStorage.getItem('eai_bubblepop_popped') || '0');
    this.perfectStages = parseInt(localStorage.getItem('eai_bubblepop_perfect') || '0');
    this.maxCombo = parseInt(localStorage.getItem('eai_bubblepop_maxcombo') || '0');

    // Combo
    this.combo = 0;
    this.lastPopTime = 0;

    // Notificações
    this.notifications = [];

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_bubblepop_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo!', lines: ['Mire e atire bolhas coloridas!', 'Combine 3 ou mais da mesma cor', 'para estourá-las!'], emoji: '🫧' },
      { title: 'Combos', lines: ['Estoure muitas bolhas de uma vez!', 'Quanto mais bolhas, mais pontos!', 'Bolhas sem apoio também caem!'], emoji: '💥' },
      { title: 'Power-ups', lines: ['💣 Explode área grande', '🌈 Combina com qualquer cor', '🎯 Mostra trajetória', '➕ Jogadas extras'], emoji: '✨' },
      { title: 'Objetivo', lines: ['Limpe todas as bolhas do tabuleiro!', 'Use suas jogadas com sabedoria!', 'Boa sorte, herói das bolhas!'], emoji: '🏆' }
    ];

    // Controles
    this.setupControls();

    // Game loop
    this.lastTime = 0;
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.bubbleRadius = Math.min(this.canvas.width / (this.gridCols * 2.2), 25);
    this.shooterX = this.canvas.width / 2;
    this.shooterY = this.canvas.height - 80;
  }

  setupControls() {
    // Mouse
    this.canvas.addEventListener('mousemove', (e) => this.updateAim(e.clientX, e.clientY));
    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));

    // Touch
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.updateAim(touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        this.handleClick(touch.clientX, touch.clientY);
      }
    });
  }

  updateAim(x, y) {
    if (this.state === 'playing' && !this.shootingBubble) {
      const dx = x - this.shooterX;
      const dy = y - this.shooterY;
      this.aimAngle = Math.atan2(dy, dx);

      // Limitar ângulo
      if (this.aimAngle > -0.1) this.aimAngle = -0.1;
      if (this.aimAngle < -Math.PI + 0.1) this.aimAngle = -Math.PI + 0.1;
    }
  }

  generateLevel(stage) {
    this.bubbles = [];
    const rows = Math.min(5 + Math.floor(stage / 5), 8);
    const colors = Math.min(3 + Math.floor(stage / 10), 6);

    for (let row = 0; row < rows; row++) {
      const cols = row % 2 === 0 ? this.gridCols : this.gridCols - 1;

      for (let col = 0; col < cols; col++) {
        // Chance de não ter bolha
        if (Math.random() < 0.1 + stage * 0.005) continue;

        const colorIndex = Math.floor(Math.random() * colors);
        const offsetX = row % 2 === 0 ? 0 : this.bubbleRadius;
        const x = this.bubbleRadius + col * this.bubbleRadius * 2 + offsetX + (this.canvas.width - this.gridCols * this.bubbleRadius * 2) / 2;
        const y = this.bubbleRadius + row * this.bubbleRadius * 1.73;

        this.bubbles.push({
          x, y, row, col,
          colorIndex,
          color: this.bubbleColors[colorIndex],
          special: null
        });
      }
    }

    // Adicionar especiais em fases avançadas
    if (stage >= 5) {
      const specialCount = Math.floor(stage / 10) + 1;
      for (let i = 0; i < specialCount && i < this.bubbles.length; i++) {
        const idx = Math.floor(Math.random() * this.bubbles.length);
        const specialType = this.specialBubbles[Math.floor(Math.random() * this.specialBubbles.length)];
        this.bubbles[idx].special = specialType;
      }
    }

    // Configurar movimentos
    const startMovesUpgrade = this.upgrades.find(u => u.id === 'startMoves');
    this.maxMoves = 25 + Math.floor(stage / 2) + startMovesUpgrade.level * startMovesUpgrade.effect;
    this.moves = 0;
  }

  createNextBubble() {
    const availableColors = [...new Set(this.bubbles.map(b => b.colorIndex))];
    if (availableColors.length === 0) {
      availableColors.push(0, 1, 2);
    }

    const colorIndex = availableColors[Math.floor(Math.random() * availableColors.length)];

    return {
      x: this.shooterX,
      y: this.shooterY,
      colorIndex,
      color: this.bubbleColors[colorIndex],
      special: this.activePowerUp
    };
  }

  startStage(stage) {
    this.currentStage = stage;
    this.state = 'playing';
    this.score = 0;
    this.combo = 0;
    this.moves = 0;
    this.particles = [];
    this.poppingBubbles = [];
    this.fallingBubbles = [];
    this.notifications = [];
    this.activePowerUp = null;
    this.showLaserAim = false;

    this.generateLevel(stage);
    this.shootingBubble = null;
    this.nextBubble = this.createNextBubble();
  }

  shootBubble() {
    if (this.shootingBubble || !this.nextBubble) return;
    if (this.moves >= this.maxMoves) return;

    this.moves++;
    this.shootingBubble = {
      ...this.nextBubble,
      vx: Math.cos(this.aimAngle) * 15,
      vy: Math.sin(this.aimAngle) * 15
    };

    this.nextBubble = this.createNextBubble();
    this.showLaserAim = false;
  }

  update(deltaTime) {
    if (this.state !== 'playing') return;

    // Atualizar bolha em movimento
    if (this.shootingBubble) {
      this.shootingBubble.x += this.shootingBubble.vx;
      this.shootingBubble.y += this.shootingBubble.vy;

      // Colisão com paredes
      const leftBound = (this.canvas.width - this.gridCols * this.bubbleRadius * 2) / 2 + this.bubbleRadius;
      const rightBound = this.canvas.width - leftBound;

      if (this.shootingBubble.x < leftBound || this.shootingBubble.x > rightBound) {
        this.shootingBubble.vx *= -1;
        this.shootingBubble.x = Math.max(leftBound, Math.min(rightBound, this.shootingBubble.x));
      }

      // Colisão com topo
      if (this.shootingBubble.y < this.bubbleRadius * 2) {
        this.snapBubble();
        return;
      }

      // Colisão com outras bolhas
      for (const bubble of this.bubbles) {
        const dist = Math.sqrt((this.shootingBubble.x - bubble.x) ** 2 + (this.shootingBubble.y - bubble.y) ** 2);
        if (dist < this.bubbleRadius * 2) {
          this.snapBubble();
          return;
        }
      }
    }

    // Atualizar bolhas caindo
    for (let i = this.fallingBubbles.length - 1; i >= 0; i--) {
      const fb = this.fallingBubbles[i];
      fb.vy += 0.5;
      fb.y += fb.vy;
      fb.rotation += fb.rotationSpeed;

      if (fb.y > this.canvas.height + 50) {
        this.fallingBubbles.splice(i, 1);
      }
    }

    // Atualizar bolhas estourando
    for (let i = this.poppingBubbles.length - 1; i >= 0; i--) {
      const pb = this.poppingBubbles[i];
      pb.scale += 0.1;
      pb.alpha -= 0.08;

      if (pb.alpha <= 0) {
        this.poppingBubbles.splice(i, 1);
      }
    }

    // Atualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
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

    // Verificar vitória
    if (this.bubbles.length === 0 && this.fallingBubbles.length === 0 && this.poppingBubbles.length === 0) {
      this.completeStage();
    }

    // Verificar derrota
    if (this.moves >= this.maxMoves && !this.shootingBubble && this.bubbles.length > 0) {
      this.gameOver();
    }
  }

  snapBubble() {
    // Encontrar posição mais próxima no grid
    const row = Math.round((this.shootingBubble.y - this.bubbleRadius) / (this.bubbleRadius * 1.73));
    const offsetX = row % 2 === 0 ? 0 : this.bubbleRadius;
    const baseX = (this.canvas.width - this.gridCols * this.bubbleRadius * 2) / 2;
    const col = Math.round((this.shootingBubble.x - baseX - this.bubbleRadius - offsetX) / (this.bubbleRadius * 2));

    const snappedX = baseX + this.bubbleRadius + col * this.bubbleRadius * 2 + offsetX;
    const snappedY = this.bubbleRadius + row * this.bubbleRadius * 1.73;

    // Adicionar bolha ao grid
    const newBubble = {
      x: snappedX,
      y: snappedY,
      row,
      col,
      colorIndex: this.shootingBubble.colorIndex,
      color: this.shootingBubble.color,
      special: this.shootingBubble.special
    };

    // Verificar especial
    if (newBubble.special) {
      this.activateSpecial(newBubble);
    }

    this.bubbles.push(newBubble);
    this.shootingBubble = null;

    // Verificar matches
    this.checkMatches(newBubble);
  }

  activateSpecial(bubble) {
    const special = bubble.special;

    if (special.type === 'bomb') {
      // Explodir área 3x3
      const toRemove = this.bubbles.filter(b => {
        const dist = Math.sqrt((b.x - bubble.x) ** 2 + (b.y - bubble.y) ** 2);
        return dist < this.bubbleRadius * 4;
      });
      toRemove.forEach(b => this.popBubble(b));
      this.addNotification('💣 BOOM!', bubble.x, bubble.y);

    } else if (special.type === 'star') {
      // Remover linha
      const rowBubbles = this.bubbles.filter(b => Math.abs(b.y - bubble.y) < this.bubbleRadius);
      rowBubbles.forEach(b => this.popBubble(b));
      this.addNotification('⭐ Linha!', bubble.x, bubble.y);

    } else if (special.type === 'lightning') {
      // Remover coluna
      const colBubbles = this.bubbles.filter(b => Math.abs(b.x - bubble.x) < this.bubbleRadius * 2);
      colBubbles.forEach(b => this.popBubble(b));
      this.addNotification('⚡ Coluna!', bubble.x, bubble.y);
    }

    bubble.special = null;
  }

  checkMatches(startBubble) {
    // Rainbow combina com qualquer cor
    const isRainbow = startBubble.special && startBubble.special.type === 'rainbow';

    // BFS para encontrar bolhas conectadas da mesma cor
    const visited = new Set();
    const queue = [startBubble];
    const matches = [];

    while (queue.length > 0) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);
      matches.push(current);

      // Encontrar vizinhos
      const neighbors = this.bubbles.filter(b => {
        if (visited.has(`${b.x},${b.y}`)) return false;
        const dist = Math.sqrt((b.x - current.x) ** 2 + (b.y - current.y) ** 2);
        if (dist > this.bubbleRadius * 2.5) return false;
        return isRainbow || b.colorIndex === startBubble.colorIndex;
      });

      queue.push(...neighbors);
    }

    // Se 3 ou mais, estourar
    if (matches.length >= 3) {
      // Combo
      const now = Date.now();
      if (now - this.lastPopTime < 2000) {
        this.combo++;
        if (this.combo > this.maxCombo) {
          this.maxCombo = this.combo;
          localStorage.setItem('eai_bubblepop_maxcombo', this.maxCombo.toString());
        }
      } else {
        this.combo = 1;
      }
      this.lastPopTime = now;

      // Calcular pontos
      const comboUpgrade = this.upgrades.find(u => u.id === 'comboMulti');
      const comboMultiplier = 1 + (this.combo - 1) * 0.5 * (1 + comboUpgrade.level * comboUpgrade.effect);
      const points = Math.floor(matches.length * 10 * comboMultiplier);
      this.score += points;

      // Moedas
      const coinUpgrade = this.upgrades.find(u => u.id === 'coinBonus');
      const coinMultiplier = 1 + coinUpgrade.level * coinUpgrade.effect;
      this.coins += Math.floor(matches.length * coinMultiplier);

      matches.forEach(b => this.popBubble(b));

      if (this.combo >= 2) {
        this.addNotification(`Combo x${this.combo}! +${points}`, startBubble.x, startBubble.y);
      }

      // XP
      this.xp += matches.length;
      this.checkLevelUp();

      // Verificar bolhas flutuantes
      setTimeout(() => this.dropFloatingBubbles(), 300);

      // Estatísticas
      this.totalBubblesPopped += matches.length;
      localStorage.setItem('eai_bubblepop_popped', this.totalBubblesPopped.toString());
    }

    this.checkAchievements();
  }

  popBubble(bubble) {
    const index = this.bubbles.indexOf(bubble);
    if (index === -1) return;

    // Animação de estouro
    this.poppingBubbles.push({
      x: bubble.x,
      y: bubble.y,
      color: bubble.color.color,
      scale: 1,
      alpha: 1
    });

    // Partículas
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.particles.push({
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        color: bubble.color.color,
        size: Math.random() * 6 + 3,
        life: 1
      });
    }

    this.bubbles.splice(index, 1);
  }

  dropFloatingBubbles() {
    // Encontrar bolhas conectadas ao topo usando BFS
    const connected = new Set();
    const queue = this.bubbles.filter(b => b.y < this.bubbleRadius * 2);

    queue.forEach(b => connected.add(`${b.x},${b.y}`));

    while (queue.length > 0) {
      const current = queue.shift();

      const neighbors = this.bubbles.filter(b => {
        if (connected.has(`${b.x},${b.y}`)) return false;
        const dist = Math.sqrt((b.x - current.x) ** 2 + (b.y - current.y) ** 2);
        return dist < this.bubbleRadius * 2.5;
      });

      neighbors.forEach(n => {
        connected.add(`${n.x},${n.y}`);
        queue.push(n);
      });
    }

    // Bolhas não conectadas caem
    const floating = this.bubbles.filter(b => !connected.has(`${b.x},${b.y}`));

    floating.forEach(b => {
      this.fallingBubbles.push({
        x: b.x,
        y: b.y,
        vy: 0,
        color: b.color.color,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });

      // Pontos bônus
      this.score += 20;
      this.coins += 2;
    });

    this.bubbles = this.bubbles.filter(b => connected.has(`${b.x},${b.y}`));

    if (floating.length > 0) {
      this.addNotification(`+${floating.length * 20} Bônus!`, this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  completeStage() {
    this.state = 'levelComplete';

    // Bônus por jogadas restantes
    const remainingMoves = this.maxMoves - this.moves;
    const bonus = remainingMoves * 50;
    this.score += bonus;
    this.coins += remainingMoves * 5;

    // XP
    this.xp += 50 + this.currentStage * 5;
    this.checkLevelUp();

    // Diamante a cada 5 fases
    if (this.currentStage % 5 === 0) {
      this.diamonds += 1;
    }

    // Perfeito (sem errar)
    if (this.moves <= this.maxMoves * 0.5) {
      this.perfectStages++;
      localStorage.setItem('eai_bubblepop_perfect', this.perfectStages.toString());
    }

    // Desbloquear próxima fase
    if (this.currentStage >= this.maxUnlockedStage) {
      this.maxUnlockedStage = this.currentStage + 1;
      localStorage.setItem('eai_bubblepop_maxstage', this.maxUnlockedStage.toString());
    }

    this.checkAchievements();
    this.save();
  }

  gameOver() {
    this.state = 'gameover';
    this.save();
  }

  checkLevelUp() {
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = this.level * 100;
      this.diamonds += 1;
      this.addNotification(`🎉 Nível ${this.level}!`, this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  addNotification(text, x, y) {
    this.notifications.push({ text, x, y, alpha: 1 });
  }

  draw() {
    // Fundo gradiente
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a237e');
    gradient.addColorStop(1, '#0d47a1');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Decoração
    this.ctx.globalAlpha = 0.1;
    for (let i = 0; i < 20; i++) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      const x = (i * 100 + Date.now() * 0.02) % (this.canvas.width + 100) - 50;
      const y = (i * 80 + Math.sin(Date.now() * 0.001 + i) * 30) % this.canvas.height;
      this.ctx.arc(x, y, 20 + Math.sin(Date.now() * 0.002 + i) * 10, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    if (this.state === 'menu') {
      this.drawMenu();
    } else if (this.state === 'playing') {
      this.drawGame();
    } else if (this.state === 'levelComplete') {
      this.drawLevelComplete();
    } else if (this.state === 'gameover') {
      this.drawGameOver();
    } else if (this.state === 'levels') {
      this.drawLevelSelect();
    } else if (this.state === 'shop') {
      this.drawShop();
    }

    if (this.showTutorial) {
      this.drawTutorial();
    }
  }

  drawMenu() {
    const cx = this.canvas.width / 2;

    // Título
    this.ctx.font = 'bold 42px Arial';
    this.ctx.fillStyle = '#E1BEE7';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#9C27B0';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('🫧 BUBBLE POP 🫧', cx, 100);
    this.ctx.shadowBlur = 0;

    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#B39DDB';
    this.ctx.fillText('KINGDOM', cx, 135);

    // Recursos
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 40);
    this.ctx.fillStyle = '#00BCD4';
    this.ctx.fillText(`💎 ${this.diamonds}`, 20, 65);
    this.ctx.fillStyle = '#B39DDB';
    this.ctx.fillText(`⭐ Nível ${this.level}`, 20, 90);

    // Progresso
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#CE93D8';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`📍 Fase ${this.maxUnlockedStage}`, cx, 170);

    // Botões
    const buttons = [
      { text: '▶️ JOGAR', y: 220, action: 'play' },
      { text: '🗺️ FASES', y: 290, action: 'levels' },
      { text: '🛒 LOJA', y: 360, action: 'shop' },
      { text: '🏆 CONQUISTAS', y: 430, action: 'achievements' }
    ];

    buttons.forEach(btn => {
      const btnWidth = 240;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(156, 39, 176, 0.7)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 15);
      this.ctx.fill();

      this.ctx.strokeStyle = '#E1BEE7';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 36);
    });

    // Estatísticas
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#B39DDB';
    this.ctx.fillText(`🎈 ${this.totalBubblesPopped} bolhas estouradas`, cx, this.canvas.height - 60);
    this.ctx.fillText(`🔥 Maior combo: x${this.maxCombo}`, cx, this.canvas.height - 35);
  }

  drawGame() {
    // Área de jogo
    const gameAreaWidth = this.gridCols * this.bubbleRadius * 2 + 20;
    const gameAreaX = (this.canvas.width - gameAreaWidth) / 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(gameAreaX, 0, gameAreaWidth, this.canvas.height - 120);

    // Bolhas caindo
    this.fallingBubbles.forEach(fb => {
      this.ctx.save();
      this.ctx.translate(fb.x, fb.y);
      this.ctx.rotate(fb.rotation);
      this.ctx.fillStyle = fb.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bubbleRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Bolhas estourando
    this.poppingBubbles.forEach(pb => {
      this.ctx.globalAlpha = pb.alpha;
      this.ctx.fillStyle = pb.color;
      this.ctx.beginPath();
      this.ctx.arc(pb.x, pb.y, this.bubbleRadius * pb.scale, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Bolhas do grid
    this.bubbles.forEach(bubble => {
      this.drawBubble(bubble);
    });

    // Partículas
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Linha de mira (se laser ativo)
    if (this.showLaserAim && !this.shootingBubble) {
      this.drawLaserAim();
    }

    // Linha de mira normal
    if (!this.shootingBubble) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.shooterX, this.shooterY);
      this.ctx.lineTo(
        this.shooterX + Math.cos(this.aimAngle) * 150,
        this.shooterY + Math.sin(this.aimAngle) * 150
      );
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Bolha atual
    if (this.nextBubble && !this.shootingBubble) {
      this.drawBubble({ ...this.nextBubble, x: this.shooterX, y: this.shooterY });
    }

    // Bolha em movimento
    if (this.shootingBubble) {
      this.drawBubble(this.shootingBubble);
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

  drawBubble(bubble) {
    const sizeUpgrade = this.upgrades.find(u => u.id === 'bubbleSize');
    const radius = this.bubbleRadius + sizeUpgrade.level * sizeUpgrade.effect;

    // Sombra
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(bubble.x + 3, bubble.y + 3, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Bolha
    const gradient = this.ctx.createRadialGradient(
      bubble.x - radius * 0.3, bubble.y - radius * 0.3, 0,
      bubble.x, bubble.y, radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, bubble.color.color);
    gradient.addColorStop(1, bubble.color.color);

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Brilho
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.arc(bubble.x - radius * 0.3, bubble.y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
    this.ctx.fill();

    // Especial
    if (bubble.special) {
      this.ctx.font = `${radius}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(bubble.special.emoji, bubble.x, bubble.y);
    }
  }

  drawLaserAim() {
    let x = this.shooterX;
    let y = this.shooterY;
    let vx = Math.cos(this.aimAngle);
    let vy = Math.sin(this.aimAngle);

    const leftBound = (this.canvas.width - this.gridCols * this.bubbleRadius * 2) / 2 + this.bubbleRadius;
    const rightBound = this.canvas.width - leftBound;

    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    for (let i = 0; i < 500; i++) {
      x += vx * 5;
      y += vy * 5;

      if (x < leftBound || x > rightBound) {
        vx *= -1;
      }

      if (y < this.bubbleRadius * 2) break;

      // Colisão com bolhas
      let hit = false;
      for (const bubble of this.bubbles) {
        const dist = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
        if (dist < this.bubbleRadius * 2) {
          hit = true;
          break;
        }
      }
      if (hit) break;
    }

    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    // Ponto de destino
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 8, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawHUD() {
    // Pontuação
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${this.score}`, 20, 35);

    // Fase
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#E1BEE7';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Fase ${this.currentStage}`, this.canvas.width / 2, 35);

    // Jogadas
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = this.moves >= this.maxMoves - 5 ? '#FF5252' : '#B39DDB';
    this.ctx.fillText(`${this.maxMoves - this.moves} jogadas`, this.canvas.width - 20, 35);

    // Combo
    if (this.combo > 1) {
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#FF9800';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`🔥 x${this.combo}`, 20, 65);
    }

    // Power-ups
    const powerUpY = this.canvas.height - 60;
    this.powerUps.forEach((pu, i) => {
      const x = 30 + i * 70;
      const isActive = this.activePowerUp && this.activePowerUp.type === pu.id;

      this.ctx.fillStyle = isActive ? 'rgba(255, 193, 7, 0.8)' : 'rgba(0, 0, 0, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(x - 25, powerUpY - 25, 50, 50, 10);
      this.ctx.fill();

      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(pu.emoji, x, powerUpY + 8);

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(`${pu.count}`, x + 15, powerUpY + 20);
    });
  }

  drawLevelComplete() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;

    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎉 FASE COMPLETA!', cx, 120);

    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`Pontuação: ${this.score}`, cx, 180);

    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#B39DDB';
    this.ctx.fillText(`Jogadas restantes: ${this.maxMoves - this.moves}`, cx, 220);
    this.ctx.fillText(`Bônus: +${(this.maxMoves - this.moves) * 50}`, cx, 250);

    // Estrelas
    const stars = this.moves <= this.maxMoves * 0.5 ? 3 : this.moves <= this.maxMoves * 0.75 ? 2 : 1;
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

      this.ctx.fillStyle = 'rgba(156, 39, 176, 0.8)';
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
    this.ctx.fillText(`Pontuação: ${this.score}`, cx, 180);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#B39DDB';
    this.ctx.fillText('Sem mais jogadas!', cx, 220);
    this.ctx.fillText(`Bolhas restantes: ${this.bubbles.length}`, cx, 250);

    const buttons = [
      { text: '🔄 TENTAR NOVAMENTE', y: 320 },
      { text: '🏠 MENU', y: 390 }
    ];

    buttons.forEach(btn => {
      const btnWidth = 280;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(156, 39, 176, 0.8)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 12);
      this.ctx.fill();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 36);
    });
  }

  drawLevelSelect() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 70);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#E1BEE7';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🗺️ SELECIONAR FASE', cx, 45);

    // Grid de fases
    const cols = 5;
    const cellSize = 60;
    const startX = (this.canvas.width - cols * cellSize) / 2;
    const startY = 100;

    for (let i = 1; i <= 50; i++) {
      const col = (i - 1) % cols;
      const row = Math.floor((i - 1) / cols);
      const x = startX + col * cellSize + cellSize / 2;
      const y = startY + row * cellSize + cellSize / 2;

      const unlocked = i <= this.maxUnlockedStage;

      this.ctx.fillStyle = unlocked ? 'rgba(156, 39, 176, 0.7)' : 'rgba(50, 50, 50, 0.7)';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 25, 0, Math.PI * 2);
      this.ctx.fill();

      if (unlocked) {
        this.ctx.strokeStyle = '#E1BEE7';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = unlocked ? '#ffffff' : '#666';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(unlocked ? i.toString() : '🔒', x, y);
    }

    this.drawBackButton();
  }

  drawShop() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#E1BEE7';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛒 LOJA', cx, 40);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 70);

    // Power-ups
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#CE93D8';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Power-ups', cx, 115);

    this.powerUps.forEach((pu, i) => {
      const y = 140 + i * 75;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 65, 10);
      this.ctx.fill();

      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(pu.emoji, 35, y + 40);

      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(pu.name, 75, y + 25);

      this.ctx.font = '13px Arial';
      this.ctx.fillStyle = '#B39DDB';
      this.ctx.fillText(pu.desc, 75, y + 45);

      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = '#CE93D8';
      this.ctx.fillText(`x${pu.count}`, 75, y + 60);

      // Botão comprar
      const canBuy = this.coins >= pu.price;
      const btnX = this.canvas.width - 100;
      this.ctx.fillStyle = canBuy ? 'rgba(255, 193, 7, 0.8)' : 'rgba(100, 100, 100, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, y + 15, 70, 35, 8);
      this.ctx.fill();

      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillStyle = canBuy ? '#000' : '#666';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`🪙${pu.price}`, btnX + 35, y + 38);
    });

    // Upgrades
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#CE93D8';
    this.ctx.textAlign = 'center';
    const upgradeStartY = 150 + this.powerUps.length * 75;
    this.ctx.fillText('Upgrades Permanentes', cx, upgradeStartY);

    this.upgrades.forEach((up, i) => {
      const y = upgradeStartY + 25 + i * 70;
      const maxed = up.level >= up.maxLevel;

      this.ctx.fillStyle = maxed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 60, 10);
      this.ctx.fill();

      this.ctx.font = 'bold 15px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(up.name, 30, y + 22);

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#B39DDB';
      this.ctx.fillText(up.desc, 30, y + 40);

      this.ctx.fillStyle = '#8BC34A';
      this.ctx.fillText(`Nível ${up.level}/${up.maxLevel}`, 30, y + 55);

      if (!maxed) {
        const canBuy = this.coins >= up.price;
        const btnX = this.canvas.width - 100;
        this.ctx.fillStyle = canBuy ? 'rgba(255, 193, 7, 0.8)' : 'rgba(100, 100, 100, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(btnX, y + 12, 70, 35, 8);
        this.ctx.fill();

        this.ctx.font = 'bold 13px Arial';
        this.ctx.fillStyle = canBuy ? '#000' : '#666';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`🪙${up.price}`, btnX + 35, y + 35);
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
    this.ctx.fillStyle = '#E1BEE7';
    this.ctx.fillText(page.title, cx, 210);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#B39DDB';
    page.lines.forEach((line, i) => {
      this.ctx.fillText(line, cx, 270 + i * 35);
    });

    // Indicadores
    const dotY = this.canvas.height - 140;
    for (let i = 0; i < this.tutorialPages.length; i++) {
      this.ctx.fillStyle = i === this.tutorialPage ? '#9C27B0' : '#666';
      this.ctx.beginPath();
      this.ctx.arc(cx - 30 + i * 20, dotY, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Botão
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = cx - btnWidth / 2;
    const btnY = this.canvas.height - 100;

    this.ctx.fillStyle = 'rgba(156, 39, 176, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 12);
    this.ctx.fill();

    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#ffffff';
    const text = this.tutorialPage < this.tutorialPages.length - 1 ? 'PRÓXIMO →' : 'COMEÇAR! 🫧';
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
        { y: 220, action: () => this.startStage(this.currentStage) },
        { y: 290, action: () => this.state = 'levels' },
        { y: 360, action: () => this.state = 'shop' },
        { y: 430, action: () => this.state = 'achievements' }
      ];

      buttons.forEach(btn => {
        if (x > cx - 120 && x < cx + 120 && y > btn.y && y < btn.y + 55) {
          btn.action();
        }
      });

    } else if (this.state === 'playing') {
      // Power-ups
      const powerUpY = this.canvas.height - 60;
      this.powerUps.forEach((pu, i) => {
        const puX = 30 + i * 70;
        if (Math.abs(x - puX) < 25 && Math.abs(y - powerUpY) < 25) {
          if (pu.count > 0) {
            if (pu.id === 'aim') {
              this.showLaserAim = !this.showLaserAim;
              if (this.showLaserAim) {
                pu.count--;
                this.savePowerUps();
              }
            } else if (pu.id === 'extra') {
              this.maxMoves += 5;
              pu.count--;
              this.savePowerUps();
            } else {
              this.activePowerUp = { type: pu.id, emoji: pu.emoji };
              pu.count--;
              this.savePowerUps();
            }
          }
        }
      });

      // Atirar
      if (y < this.canvas.height - 120) {
        this.shootBubble();
      }

    } else if (this.state === 'levelComplete') {
      if (y > 380 && y < 435) {
        this.startStage(this.currentStage + 1);
      } else if (y > 450 && y < 505) {
        this.startStage(this.currentStage);
      } else if (y > 520 && y < 575) {
        this.state = 'menu';
      }

    } else if (this.state === 'gameover') {
      if (y > 320 && y < 375) {
        this.startStage(this.currentStage);
      } else if (y > 390 && y < 445) {
        this.state = 'menu';
      }

    } else if (this.state === 'levels') {
      this.handleLevelSelectClick(x, y);

    } else if (this.state === 'shop') {
      this.handleShopClick(x, y);
    }

    // Botão voltar
    if (this.state === 'levels' || this.state === 'shop') {
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
        localStorage.setItem('eai_bubblepop_tutorial_seen', 'true');
      }
    }
  }

  handleLevelSelectClick(x, y) {
    const cols = 5;
    const cellSize = 60;
    const startX = (this.canvas.width - cols * cellSize) / 2;
    const startY = 100;

    for (let i = 1; i <= 50; i++) {
      const col = (i - 1) % cols;
      const row = Math.floor((i - 1) / cols);
      const cellX = startX + col * cellSize + cellSize / 2;
      const cellY = startY + row * cellSize + cellSize / 2;

      const dist = Math.sqrt((x - cellX) ** 2 + (y - cellY) ** 2);
      if (dist < 25 && i <= this.maxUnlockedStage) {
        this.startStage(i);
        return;
      }
    }
  }

  handleShopClick(x, y) {
    // Power-ups
    this.powerUps.forEach((pu, i) => {
      const itemY = 140 + i * 75;
      const btnX = this.canvas.width - 100;

      if (x > btnX && x < btnX + 70 && y > itemY + 15 && y < itemY + 50) {
        if (this.coins >= pu.price) {
          this.coins -= pu.price;
          pu.count++;
          this.savePowerUps();
          this.save();
        }
      }
    });

    // Upgrades
    const upgradeStartY = 150 + this.powerUps.length * 75 + 25;
    this.upgrades.forEach((up, i) => {
      const itemY = upgradeStartY + i * 70;
      const btnX = this.canvas.width - 100;

      if (x > btnX && x < btnX + 70 && y > itemY + 12 && y < itemY + 47) {
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

  checkAchievements() {
    const checks = [
      { id: 'first_pop', condition: this.totalBubblesPopped >= 3 },
      { id: 'combo_5', condition: this.maxCombo >= 5 },
      { id: 'stage_10', condition: this.maxUnlockedStage >= 10 },
      { id: 'stage_25', condition: this.maxUnlockedStage >= 25 },
      { id: 'stage_50', condition: this.maxUnlockedStage >= 50 },
      { id: 'perfect', condition: this.perfectStages >= 1 },
      { id: 'coins_1000', condition: this.coins >= 1000 },
      { id: 'level_10', condition: this.level >= 10 }
    ];

    checks.forEach(check => {
      const ach = this.achievements.find(a => a.id === check.id);
      if (ach && !ach.unlocked && check.condition) {
        ach.unlocked = true;
        this.diamonds += 3;
        this.addNotification(`🏆 ${ach.name}!`, this.canvas.width / 2, this.canvas.height / 2);
      }
    });

    this.saveAchievements();
  }

  save() {
    localStorage.setItem('eai_bubblepop_coins', this.coins.toString());
    localStorage.setItem('eai_bubblepop_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_bubblepop_xp', this.xp.toString());
    localStorage.setItem('eai_bubblepop_level', this.level.toString());
    localStorage.setItem('eai_bubblepop_stage', this.currentStage.toString());
  }

  savePowerUps() {
    this.powerUps.forEach(pu => {
      localStorage.setItem(`eai_bubblepop_${pu.id}`, pu.count.toString());
    });
  }

  loadUpgrades() {
    const saved = localStorage.getItem('eai_bubblepop_upgrades');
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
    localStorage.setItem('eai_bubblepop_upgrades', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('eai_bubblepop_achievements');
    if (saved) {
      const unlocked = JSON.parse(saved);
      this.achievements.forEach(a => {
        if (unlocked.includes(a.id)) a.unlocked = true;
      });
    }
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_bubblepop_achievements', JSON.stringify(unlocked));
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
  new BubblePopGame();
});
