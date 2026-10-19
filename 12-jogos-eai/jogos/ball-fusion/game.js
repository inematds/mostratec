// ============================================
// BALL FUSION ARENA EAI - Brick Breaker Roguelike
// ============================================

class BallFusionArena {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configurações
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_ballfusion_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      {
        title: 'Bem-vindo ao Ball Fusion!',
        lines: [
          'Um jogo de quebra-blocos com poderes!',
          '',
          'Lance bolas para destruir os blocos',
          'e colete power-ups que caem deles.'
        ],
        emoji: '🎯'
      },
      {
        title: 'Como Jogar',
        lines: [
          'Arraste para mirar a direcao.',
          'Solte para lancar as bolas!',
          '',
          'As bolas ricocheteiam nas paredes',
          'e destroem blocos ao tocar neles.'
        ],
        emoji: '👆'
      },
      {
        title: 'Tipos de Bolas',
        lines: [
          '🔵 Normal - Dano basico',
          '🔴 Fogo - 50% mais dano, queima',
          '🔷 Gelo - Congela blocos',
          '⚡ Eletrica - Atinge varios blocos',
          '💥 Explosiva - Explode em area!',
          '🔮 Laser - Atravessa blocos'
        ],
        emoji: '✨'
      },
      {
        title: 'Fusao de Bolas',
        lines: [
          'Combine 2 bolas iguais para evoluir!',
          '',
          'Normal + Normal = Fogo',
          'Fogo + Fogo = Explosiva',
          'Gelo + Gelo = Laser',
          '',
          'Experimente combinacoes!'
        ],
        emoji: '🔥'
      }
    ];

    // Estado
    this.state = 'menu'; // menu, playing, levelUp, gameOver
    this.score = 0;
    this.level = 1;
    this.wave = 1;

    // Grid de blocos
    this.gridCols = 8;
    this.gridRows = 6;
    this.blocks = [];
    this.blockWidth = 0;
    this.blockHeight = 30;

    // Bolas
    this.balls = [];
    this.waitingBalls = [];
    this.maxBalls = 20;

    // Tipos de bolas
    this.ballTypes = {
      normal: { color: '#4ECDC4', damage: 1, special: null, name: 'Normal' },
      fire: { color: '#FF6B6B', damage: 1.5, special: 'burn', name: 'Fogo' },
      ice: { color: '#74B9FF', damage: 1, special: 'slow', name: 'Gelo' },
      electric: { color: '#FDCB6E', damage: 1, special: 'chain', name: 'Elétrica' },
      explosive: { color: '#E17055', damage: 2, special: 'explode', name: 'Explosiva' },
      laser: { color: '#A29BFE', damage: 0.5, special: 'pierce', name: 'Laser' },
    };

    // Inventário de bolas
    this.inventory = [
      { type: 'normal', count: 3 },
    ];

    // Power-ups
    this.powerUps = [];

    // Fusão
    this.fusionRecipes = {
      'normal+normal': 'fire',
      'fire+fire': 'explosive',
      'normal+fire': 'electric',
      'ice+ice': 'laser',
      'normal+ice': 'electric',
      'fire+ice': 'normal', // Cancelam
      'electric+electric': 'laser',
    };

    // Lançamento
    this.launchPos = { x: 0, y: 0 };
    this.aimAngle = -Math.PI / 2;
    this.isAiming = false;
    this.launching = false;
    this.launchIndex = 0;
    this.launchDelay = 100;
    this.lastLaunch = 0;

    // Partículas
    this.particles = [];
    this.floatingTexts = [];

    // XP e upgrades permanentes
    this.xp = 0;
    this.totalXP = 0;
    this.permanentUpgrades = {
      damage: { level: 0, cost: 100, effect: 0.1 },
      ballCount: { level: 0, cost: 150, effect: 1 },
      luck: { level: 0, cost: 200, effect: 0.05 },
    };

    // Level up choices
    this.levelUpChoices = [];

    // Tempo
    this.lastTime = 0;

    // Carregar
    this.loadProgress();

    // Controles
    this.setupControls();

    // Loop
    this.gameLoop(0);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.blockWidth = Math.min(60, (this.canvas.width - 40) / this.gridCols);
    this.gridStartX = (this.canvas.width - this.blockWidth * this.gridCols) / 2;
    this.gridStartY = 100;

    this.launchPos = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 100,
    };
  }

  setupControls() {
    this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', () => this.onPointerUp());

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.onPointerDown(touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.onPointerMove(touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchend', () => this.onPointerUp());

    window.addEventListener('keydown', (e) => {
      if (this.state === 'menu' && (e.key === 'Enter' || e.key === ' ')) {
        this.startGame();
      }
    });
  }

  onPointerDown(x, y) {
    // Tutorial handling
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

    if (this.state === 'menu') {
      // Verificar clique no botão jogar
      const btnY = this.canvas.height / 2 + 50;
      if (y >= btnY - 25 && y <= btnY + 25) {
        this.startGame();
      }
      return;
    }

    if (this.state === 'levelUp') {
      // Verificar escolha
      this.checkLevelUpChoice(x, y);
      return;
    }

    if (this.state === 'gameOver') {
      this.state = 'menu';
      return;
    }

    if (this.state === 'playing' && !this.launching && this.balls.length === 0) {
      this.isAiming = true;
      this.updateAim(x, y);
    }
  }

  onPointerMove(x, y) {
    if (this.isAiming) {
      this.updateAim(x, y);
    }
  }

  onPointerUp() {
    if (this.isAiming && this.state === 'playing') {
      this.isAiming = false;
      this.launchBalls();
    }
  }

  updateAim(x, y) {
    const dx = x - this.launchPos.x;
    const dy = y - this.launchPos.y;
    this.aimAngle = Math.atan2(dy, dx);

    // Limitar ângulo para cima
    if (this.aimAngle > -0.2) this.aimAngle = -0.2;
    if (this.aimAngle < -Math.PI + 0.2) this.aimAngle = -Math.PI + 0.2;
  }

  handleTutorialClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const btnY = centerY + 120;

    // Next button
    if (x > centerX - 60 && x < centerX + 60 && y > btnY - 20 && y < btnY + 20) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_ballfusion_tutorial_seen', 'true');
      }
    }

    // Skip button
    if (x > centerX - 40 && x < centerX + 40 && y > btnY + 40 && y < btnY + 70) {
      this.showTutorial = false;
      localStorage.setItem('eai_ballfusion_tutorial_seen', 'true');
    }
  }

  renderTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Card
    ctx.fillStyle = '#0a0a2e';
    ctx.beginPath();
    ctx.roundRect(centerX - 160, centerY - 160, 320, 340, 20);
    ctx.fill();
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Emoji
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 90);

    // Title
    ctx.fillStyle = '#4ECDC4';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 40);

    // Lines
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + i * 22);
    });

    // Page indicator
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 155);

    // Next button
    const btnY = centerY + 120;
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.roundRect(centerX - 60, btnY - 20, 120, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    const btnText = this.tutorialPage === this.tutorialPages.length - 1 ? 'JOGAR!' : 'PROXIMO';
    ctx.fillText(btnText, centerX, btnY + 6);

    // Skip
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('Pular tutorial', centerX, btnY + 55);
  }

  startGame() {
    this.state = 'playing';
    this.score = 0;
    this.level = 1;
    this.wave = 1;
    this.balls = [];
    this.powerUps = [];
    this.particles = [];

    // Inventário inicial
    this.inventory = [
      { type: 'normal', count: 3 + this.permanentUpgrades.ballCount.level },
    ];

    // Gerar primeira wave
    this.generateWave();
  }

  generateWave() {
    this.blocks = [];

    const rows = Math.min(this.gridRows, 2 + Math.floor(this.wave / 3));
    const baseHP = this.wave * 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        if (Math.random() < 0.7) {
          const hp = baseHP + Math.floor(Math.random() * this.wave);
          const special = Math.random() < 0.1 + this.permanentUpgrades.luck.level * this.permanentUpgrades.luck.effect;

          this.blocks.push({
            x: this.gridStartX + col * this.blockWidth,
            y: this.gridStartY + row * this.blockHeight,
            width: this.blockWidth - 2,
            height: this.blockHeight - 2,
            hp,
            maxHP: hp,
            special,
            color: special ? '#FFD700' : this.getBlockColor(hp),
          });
        }
      }
    }

    // Preparar bolas para lançamento
    this.waitingBalls = [];
    for (const inv of this.inventory) {
      for (let i = 0; i < inv.count; i++) {
        this.waitingBalls.push({ type: inv.type });
      }
    }
  }

  getBlockColor(hp) {
    if (hp <= 5) return '#74B9FF';
    if (hp <= 10) return '#55EFC4';
    if (hp <= 20) return '#FDCB6E';
    if (hp <= 50) return '#E17055';
    return '#D63031';
  }

  launchBalls() {
    if (this.waitingBalls.length === 0) return;

    this.launching = true;
    this.launchIndex = 0;
    this.lastLaunch = 0;
  }

  update(dt) {
    if (this.state !== 'playing') return;

    const now = performance.now();

    // Lançar bolas gradualmente
    if (this.launching && this.launchIndex < this.waitingBalls.length) {
      if (now - this.lastLaunch > this.launchDelay) {
        this.lastLaunch = now;

        const ballData = this.waitingBalls[this.launchIndex];
        const type = this.ballTypes[ballData.type];
        const speed = 600;

        this.balls.push({
          x: this.launchPos.x,
          y: this.launchPos.y,
          vx: Math.cos(this.aimAngle) * speed,
          vy: Math.sin(this.aimAngle) * speed,
          radius: 8,
          type: ballData.type,
          color: type.color,
          damage: type.damage * (1 + this.permanentUpgrades.damage.level * this.permanentUpgrades.damage.effect),
          special: type.special,
          trail: [],
        });

        this.launchIndex++;

        if (this.launchIndex >= this.waitingBalls.length) {
          this.launching = false;
        }
      }
    }

    // Atualizar bolas
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 8) ball.trail.shift();

      // Colisão com paredes
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x + ball.radius > this.canvas.width) {
        ball.x = this.canvas.width - ball.radius;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy);
      }

      // Colisão com blocos
      for (let j = this.blocks.length - 1; j >= 0; j--) {
        const block = this.blocks[j];
        if (this.ballBlockCollision(ball, block)) {
          // Dano
          let damage = ball.damage;

          // Efeitos especiais
          if (ball.special === 'burn') {
            damage *= 1.2;
            this.addParticles(block.x + block.width / 2, block.y + block.height / 2, '#FF6B6B', 5);
          }
          if (ball.special === 'chain') {
            // Dano em blocos adjacentes
            this.chainDamage(block, damage * 0.3);
          }
          if (ball.special === 'explode' && block.hp <= damage) {
            this.explodeDamage(block, damage * 0.5);
          }

          block.hp -= damage;
          block.color = this.getBlockColor(block.hp);

          // Partículas de hit
          this.addParticles(ball.x, ball.y, ball.color, 3);

          // Destruído?
          if (block.hp <= 0) {
            this.score += block.maxHP * 10;
            this.xp += block.maxHP;

            // Drop power-up?
            if (block.special || Math.random() < 0.15) {
              this.spawnPowerUp(block.x + block.width / 2, block.y + block.height / 2);
            }

            // Efeito de destruição
            this.addParticles(block.x + block.width / 2, block.y + block.height / 2, block.color, 10);

            this.floatingTexts.push({
              x: block.x + block.width / 2,
              y: block.y,
              text: `+${block.maxHP * 10}`,
              color: '#FFD700',
              alpha: 1,
              vy: -2,
            });

            this.blocks.splice(j, 1);
          }

          // Bounce (exceto laser que atravessa)
          if (ball.special !== 'pierce') {
            // Determinar direção do bounce
            const overlapX = (ball.x < block.x + block.width / 2) ?
              (block.x - (ball.x + ball.radius)) :
              ((ball.x - ball.radius) - (block.x + block.width));
            const overlapY = (ball.y < block.y + block.height / 2) ?
              (block.y - (ball.y + ball.radius)) :
              ((ball.y - ball.radius) - (block.y + block.height));

            if (Math.abs(overlapX) > Math.abs(overlapY)) {
              ball.vy *= -1;
            } else {
              ball.vx *= -1;
            }
          }
        }
      }

      // Coletar power-ups
      for (let j = this.powerUps.length - 1; j >= 0; j--) {
        const pu = this.powerUps[j];
        const dist = Math.hypot(ball.x - pu.x, ball.y - pu.y);
        if (dist < ball.radius + 15) {
          this.collectPowerUp(pu);
          this.powerUps.splice(j, 1);
        }
      }

      // Fora da tela (embaixo)
      if (ball.y > this.canvas.height + 50) {
        this.balls.splice(i, 1);
      }
    }

    // Power-ups caindo
    for (const pu of this.powerUps) {
      pu.y += 50 * dt;
      pu.rotation += dt * 2;
    }

    // Remover power-ups que caíram
    this.powerUps = this.powerUps.filter(pu => pu.y < this.canvas.height + 50);

    // Partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
      p.alpha -= dt * 2;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Textos flutuantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.02;
      if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    // Verificar fim da wave
    if (!this.launching && this.balls.length === 0 && this.waitingBalls.length > 0) {
      // Todas as bolas foram lançadas e voltaram
      this.waitingBalls = [];
    }

    if (this.balls.length === 0 && !this.launching && this.waitingBalls.length === 0) {
      if (this.blocks.length === 0) {
        // Wave completa!
        this.wave++;
        this.level++;

        // Mostrar level up
        this.showLevelUp();
      } else {
        // Ainda tem blocos - próximo turno
        // Mover blocos para baixo
        for (const block of this.blocks) {
          block.y += this.blockHeight;

          // Game over se bloco passar da linha
          if (block.y + block.height > this.canvas.height - 150) {
            this.endGame();
            return;
          }
        }

        // Adicionar nova linha
        this.addBlockRow();

        // Reset bolas
        this.waitingBalls = [];
        for (const inv of this.inventory) {
          for (let i = 0; i < inv.count; i++) {
            this.waitingBalls.push({ type: inv.type });
          }
        }
      }
    }
  }

  ballBlockCollision(ball, block) {
    const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
    const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));

    const dx = ball.x - closestX;
    const dy = ball.y - closestY;

    return (dx * dx + dy * dy) < (ball.radius * ball.radius);
  }

  chainDamage(sourceBlock, damage) {
    for (const block of this.blocks) {
      if (block === sourceBlock) continue;

      const dist = Math.hypot(
        (block.x + block.width / 2) - (sourceBlock.x + sourceBlock.width / 2),
        (block.y + block.height / 2) - (sourceBlock.y + sourceBlock.height / 2)
      );

      if (dist < 80) {
        block.hp -= damage;
        this.addParticles(block.x + block.width / 2, block.y + block.height / 2, '#FDCB6E', 3);
      }
    }
  }

  explodeDamage(sourceBlock, damage) {
    for (const block of this.blocks) {
      if (block === sourceBlock) continue;

      const dist = Math.hypot(
        (block.x + block.width / 2) - (sourceBlock.x + sourceBlock.width / 2),
        (block.y + block.height / 2) - (sourceBlock.y + sourceBlock.height / 2)
      );

      if (dist < 100) {
        block.hp -= damage * (1 - dist / 100);
        this.addParticles(block.x + block.width / 2, block.y + block.height / 2, '#E17055', 5);
      }
    }
  }

  addBlockRow() {
    const baseHP = this.wave * 2;

    for (let col = 0; col < this.gridCols; col++) {
      if (Math.random() < 0.6) {
        const hp = baseHP + Math.floor(Math.random() * this.wave);
        const special = Math.random() < 0.1;

        this.blocks.push({
          x: this.gridStartX + col * this.blockWidth,
          y: this.gridStartY,
          width: this.blockWidth - 2,
          height: this.blockHeight - 2,
          hp,
          maxHP: hp,
          special,
          color: special ? '#FFD700' : this.getBlockColor(hp),
        });
      }
    }
  }

  spawnPowerUp(x, y) {
    const types = ['ball', 'fire', 'ice', 'electric', 'heal', 'fusion'];
    const weights = [30, 20, 20, 15, 10, 5];
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;

    let type = types[0];
    for (let i = 0; i < types.length; i++) {
      rand -= weights[i];
      if (rand <= 0) {
        type = types[i];
        break;
      }
    }

    const colors = {
      ball: '#4ECDC4',
      fire: '#FF6B6B',
      ice: '#74B9FF',
      electric: '#FDCB6E',
      heal: '#55EFC4',
      fusion: '#A29BFE',
    };

    this.powerUps.push({
      x,
      y,
      type,
      color: colors[type],
      rotation: 0,
    });
  }

  collectPowerUp(pu) {
    switch (pu.type) {
      case 'ball':
        this.addBallToInventory('normal', 1);
        break;
      case 'fire':
        this.addBallToInventory('fire', 1);
        break;
      case 'ice':
        this.addBallToInventory('ice', 1);
        break;
      case 'electric':
        this.addBallToInventory('electric', 1);
        break;
      case 'heal':
        // Não tem vida neste jogo, dá XP extra
        this.xp += 50;
        break;
      case 'fusion':
        this.tryFusion();
        break;
    }

    this.floatingTexts.push({
      x: pu.x,
      y: pu.y - 20,
      text: `+${pu.type.toUpperCase()}`,
      color: pu.color,
      alpha: 1,
      vy: -2,
    });
  }

  addBallToInventory(type, count) {
    const existing = this.inventory.find(i => i.type === type);
    if (existing) {
      existing.count += count;
    } else {
      this.inventory.push({ type, count });
    }
  }

  tryFusion() {
    // Tenta fundir as duas primeiras bolas diferentes
    if (this.inventory.length < 2) return;

    const first = this.inventory[0];
    const second = this.inventory.find(i => i.type !== first.type && i.count > 0);

    if (!second) return;

    const key1 = `${first.type}+${second.type}`;
    const key2 = `${second.type}+${first.type}`;
    const result = this.fusionRecipes[key1] || this.fusionRecipes[key2];

    if (result) {
      first.count--;
      second.count--;

      this.addBallToInventory(result, 1);

      // Limpar inventário vazio
      this.inventory = this.inventory.filter(i => i.count > 0);

      this.floatingTexts.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        text: `FUSÃO: ${this.ballTypes[result].name}!`,
        color: this.ballTypes[result].color,
        alpha: 1,
        vy: -1,
      });
    }
  }

  showLevelUp() {
    this.state = 'levelUp';

    // Gerar 3 escolhas
    const options = [
      { type: 'ball', name: '+2 Bolas Normais', effect: () => this.addBallToInventory('normal', 2) },
      { type: 'fire', name: '+1 Bola de Fogo', effect: () => this.addBallToInventory('fire', 1) },
      { type: 'ice', name: '+1 Bola de Gelo', effect: () => this.addBallToInventory('ice', 1) },
      { type: 'electric', name: '+1 Bola Elétrica', effect: () => this.addBallToInventory('electric', 1) },
      { type: 'explosive', name: '+1 Bola Explosiva', effect: () => this.addBallToInventory('explosive', 1) },
      { type: 'damage', name: '+20% Dano', effect: () => { this.permanentUpgrades.damage.level++; } },
      { type: 'xp', name: '+100 XP', effect: () => { this.xp += 100; } },
    ];

    // Embaralhar e pegar 3
    this.levelUpChoices = options.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  checkLevelUpChoice(x, y) {
    const startY = this.canvas.height / 2 - 50;

    for (let i = 0; i < this.levelUpChoices.length; i++) {
      const choiceY = startY + i * 70;
      if (y >= choiceY && y <= choiceY + 60 &&
          x >= this.canvas.width / 2 - 150 && x <= this.canvas.width / 2 + 150) {
        // Aplicar escolha
        this.levelUpChoices[i].effect();

        // Continuar jogo
        this.state = 'playing';
        this.generateWave();
        return;
      }
    }
  }

  endGame() {
    this.state = 'gameOver';
    this.totalXP += this.xp;
    this.saveProgress();
  }

  addParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        color,
        alpha: 1,
        size: 3 + Math.random() * 3,
      });
    }
  }

  render() {
    const ctx = this.ctx;

    // Fundo
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Tutorial
    if (this.showTutorial) {
      this.renderTutorial();
      return;
    }

    if (this.state === 'menu') {
      this.renderMenu();
    } else if (this.state === 'playing' || this.state === 'levelUp') {
      this.renderGame();
      if (this.state === 'levelUp') {
        this.renderLevelUp();
      }
    } else if (this.state === 'gameOver') {
      this.renderGame();
      this.renderGameOver();
    }
  }

  renderMenu() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BALL FUSION', cx, cy - 100);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText('ARENA', cx, cy - 65);

    // Stats
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Total XP: ${this.totalXP}`, cx, cy - 20);

    // Botão jogar
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + 25, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('JOGAR', cx, cy + 58);

    // Instruções
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Arraste para mirar, solte para lançar', cx, cy + 120);
    ctx.fillText('Funda bolas para criar tipos especiais!', cx, cy + 145);
  }

  renderGame() {
    const ctx = this.ctx;

    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 20, 40);
    ctx.fillText(`Wave: ${this.wave}`, 20, 70);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`XP: ${this.xp}`, this.canvas.width - 20, 40);

    // Blocos
    for (const block of this.blocks) {
      ctx.fillStyle = block.color;
      ctx.beginPath();
      ctx.roundRect(block.x, block.y, block.width, block.height, 4);
      ctx.fill();

      // HP
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(Math.ceil(block.hp), block.x + block.width / 2, block.y + block.height / 2 + 4);

      // Brilho especial
      if (block.special) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Power-ups
    for (const pu of this.powerUps) {
      ctx.save();
      ctx.translate(pu.x, pu.y);
      ctx.rotate(pu.rotation);

      ctx.fillStyle = pu.color;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Bolas
    for (const ball of this.balls) {
      // Trail
      for (let i = 0; i < ball.trail.length; i++) {
        const t = ball.trail[i];
        const alpha = i / ball.trail.length * 0.3;
        ctx.fillStyle = ball.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bola
      ctx.shadowColor = ball.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Linha de mira
    if (this.isAiming || (this.balls.length === 0 && !this.launching)) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.launchPos.x, this.launchPos.y);
      ctx.lineTo(
        this.launchPos.x + Math.cos(this.aimAngle) * 200,
        this.launchPos.y + Math.sin(this.aimAngle) * 200
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Lançador
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.arc(this.launchPos.x, this.launchPos.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Inventário
    this.renderInventory();

    // Partículas
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Textos flutuantes
    for (const t of this.floatingTexts) {
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  renderInventory() {
    const ctx = this.ctx;
    const startX = 20;
    const y = this.canvas.height - 50;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(startX - 10, y - 25, 300, 50, 10);
    ctx.fill();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';
    ctx.fillText('BOLAS:', startX, y - 8);

    let x = startX + 50;
    for (const inv of this.inventory) {
      const type = this.ballTypes[inv.type];

      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(inv.count, x, y + 4);

      x += 35;
    }
  }

  renderLevelUp() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Título
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', cx, cy - 120);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Escolha uma recompensa:', cx, cy - 80);

    // Escolhas
    const startY = cy - 50;
    for (let i = 0; i < this.levelUpChoices.length; i++) {
      const choice = this.levelUpChoices[i];
      const choiceY = startY + i * 70;

      ctx.fillStyle = 'rgba(78, 205, 196, 0.2)';
      ctx.strokeStyle = '#4ECDC4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 150, choiceY, 300, 60, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(choice.name, cx, choiceY + 38);
    }
  }

  renderGameOver() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cx, cy - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${this.score}`, cx, cy + 10);
    ctx.fillText(`Wave: ${this.wave}`, cx, cy + 45);

    ctx.fillStyle = '#FFD700';
    ctx.fillText(`+${this.xp} XP`, cx, cy + 85);

    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.fillText('Clique para continuar', cx, cy + 130);
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('eai_ball_fusion');
      if (saved) {
        const data = JSON.parse(saved);
        this.totalXP = data.totalXP || 0;
        if (data.upgrades) {
          for (const key of Object.keys(this.permanentUpgrades)) {
            if (data.upgrades[key]) {
              this.permanentUpgrades[key].level = data.upgrades[key];
            }
          }
        }
      }
    } catch (e) {}
  }

  saveProgress() {
    try {
      const upgrades = {};
      for (const [key, upgrade] of Object.entries(this.permanentUpgrades)) {
        upgrades[key] = upgrade.level;
      }

      localStorage.setItem('eai_ball_fusion', JSON.stringify({
        totalXP: this.totalXP,
        upgrades,
      }));

      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
          type: 'EAI_GAME_SCORE',
          game: 'ball-fusion',
          score: this.score,
          xp: this.xp,
        }, '*');
      }
    } catch (e) {}
  }

  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Inicialização
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    window.ballFusion = new BallFusionArena(canvas);
  }
});
