// ============================================
// PLINKO TYCOON EAI - Idle Casual Game
// ============================================

class PlinkoTycoon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configurações
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_plinko_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      {
        title: 'Bem-vindo ao Plinko Tycoon!',
        lines: [
          'Solte bolas no tabuleiro e ganhe moedas!',
          'As bolas ricocheteiam nos pinos brancos',
          'e caem em slots com multiplicadores.',
          '',
          'Quanto mais nas bordas, maior o premio!'
        ],
        emoji: '🎰'
      },
      {
        title: 'Como Jogar',
        lines: [
          'Clique ou toque na area superior',
          'para soltar uma bola.',
          '',
          'Use as teclas ESPACO ou ENTER',
          'para dropar rapidamente!'
        ],
        emoji: '👆'
      },
      {
        title: 'Upgrades',
        lines: [
          'Use suas moedas para comprar upgrades:',
          '',
          '• Velocidade - Drop mais rapido',
          '• Multi-Bola - Varias bolas por vez',
          '• Auto-Drop - Drops automaticos!',
          '• Bola Dourada - Chance de 10x valor'
        ],
        emoji: '⬆️'
      }
    ];

    // Estado do jogo
    this.coins = 0;
    this.totalEarned = 0;
    this.ballsDropped = 0;

    // Configurações do tabuleiro
    this.rows = 10;
    this.pegRadius = 8;
    this.pegSpacing = 50;
    this.ballRadius = 12;

    // Pegs (pinos)
    this.pegs = [];
    this.generatePegs();

    // Slots no fundo
    this.slots = [];
    this.generateSlots();

    // Bolas ativas
    this.balls = [];
    this.maxBalls = 50;

    // Partículas e efeitos
    this.particles = [];
    this.floatingTexts = [];

    // Upgrades
    this.upgrades = {
      dropSpeed: { level: 1, cost: 100, effect: 1000, name: 'Velocidade de Drop', desc: 'Intervalo entre drops' },
      multiBall: { level: 1, cost: 500, effect: 1, name: 'Multi-Bola', desc: 'Bolas por drop' },
      ballValue: { level: 1, cost: 200, effect: 1, name: 'Valor da Bola', desc: 'Multiplicador base' },
      luckySlots: { level: 1, cost: 1000, effect: 1, name: 'Slots de Sorte', desc: 'Chance de jackpot' },
      goldenBall: { level: 0, cost: 5000, effect: 0, name: 'Bola Dourada', desc: 'Chance de bola 10x' },
      autoDrop: { level: 0, cost: 2000, effect: 0, name: 'Auto-Drop', desc: 'Drop automático' },
    };

    // Auto drop
    this.autoDropEnabled = false;
    this.lastAutoDrop = 0;
    this.lastManualDrop = 0;

    // Prestige
    this.prestigeLevel = 0;
    this.prestigeMultiplier = 1;

    // UI
    this.selectedUpgrade = null;
    this.showUpgradePanel = false;

    // Tempo
    this.lastTime = 0;

    // Carregar progresso
    this.loadProgress();

    // Controles
    this.setupControls();

    // Iniciar loop
    this.gameLoop(0);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Recalcular posições
    this.boardStartX = this.canvas.width / 2 - (this.rows * this.pegSpacing) / 2;
    this.boardStartY = 120;
    this.boardWidth = this.rows * this.pegSpacing;
    this.boardHeight = this.rows * this.pegSpacing;

    // Regenerar pegs e slots
    this.generatePegs();
    this.generateSlots();
  }

  generatePegs() {
    this.pegs = [];
    const startX = this.canvas.width / 2;
    const startY = this.boardStartY + 50;

    for (let row = 0; row < this.rows; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * this.pegSpacing;

      for (let col = 0; col < pegsInRow; col++) {
        const x = startX - rowWidth / 2 + col * this.pegSpacing;
        const y = startY + row * this.pegSpacing;

        this.pegs.push({
          x,
          y,
          radius: this.pegRadius,
          hit: false,
          hitTime: 0,
        });
      }
    }
  }

  generateSlots() {
    this.slots = [];
    const slotCount = this.rows + 2;
    const slotWidth = this.pegSpacing;
    const startX = this.canvas.width / 2 - (slotCount * slotWidth) / 2;
    const y = this.boardStartY + this.rows * this.pegSpacing + 80;

    // Multiplicadores em forma de pirâmide invertida
    const multipliers = this.getSlotMultipliers(slotCount);

    for (let i = 0; i < slotCount; i++) {
      const mult = multipliers[i];
      let color;

      if (mult >= 10) color = '#FFD700';
      else if (mult >= 5) color = '#9B59B6';
      else if (mult >= 2) color = '#3498DB';
      else if (mult >= 1) color = '#2ECC71';
      else color = '#E74C3C';

      this.slots.push({
        x: startX + i * slotWidth + slotWidth / 2,
        y,
        width: slotWidth - 4,
        height: 60,
        multiplier: mult,
        color,
        glow: 0,
      });
    }
  }

  getSlotMultipliers(count) {
    // Distribuição: bordas têm multiplicadores altos, centro baixo
    const mults = [];
    const mid = Math.floor(count / 2);
    const luckyBonus = this.upgrades.luckySlots.level * 0.5;

    for (let i = 0; i < count; i++) {
      const distFromMid = Math.abs(i - mid);
      let mult;

      if (distFromMid >= mid) mult = 10 + luckyBonus * 2;
      else if (distFromMid >= mid - 1) mult = 5 + luckyBonus;
      else if (distFromMid >= mid - 2) mult = 2 + luckyBonus * 0.5;
      else if (distFromMid >= 1) mult = 1;
      else mult = 0.5;

      mults.push(Math.round(mult * 10) / 10);
    }

    return mults;
  }

  setupControls() {
    // Click para dropar bola
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Tutorial
      if (this.showTutorial) {
        this.handleTutorialClick(x, y);
        return;
      }

      // Verificar clique em upgrade
      if (this.checkUpgradeClick(x, y)) return;

      // Dropar bola
      if (y < this.boardStartY + 50) {
        this.dropBall(x);
      }
    });

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Tutorial
      if (this.showTutorial) {
        this.handleTutorialClick(x, y);
        return;
      }

      if (this.checkUpgradeClick(x, y)) return;

      if (y < this.boardStartY + 50) {
        this.dropBall(x);
      }
    });

    // Teclas
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        this.dropBall(this.canvas.width / 2 + (Math.random() - 0.5) * 100);
      }
      if (e.key === 'u' || e.key === 'U') {
        this.showUpgradePanel = !this.showUpgradePanel;
      }
    });
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
        localStorage.setItem('eai_plinko_tutorial_seen', 'true');
      }
    }

    // Skip button
    if (x > centerX - 40 && x < centerX + 40 && y > btnY + 40 && y < btnY + 70) {
      this.showTutorial = false;
      localStorage.setItem('eai_plinko_tutorial_seen', 'true');
    }
  }

  checkUpgradeClick(x, y) {
    const panelX = this.canvas.width - 220;
    const panelY = 100;

    if (x >= panelX && x <= panelX + 200) {
      let upgradeY = panelY + 40;
      for (const [key, upgrade] of Object.entries(this.upgrades)) {
        if (y >= upgradeY && y <= upgradeY + 50) {
          this.buyUpgrade(key);
          return true;
        }
        upgradeY += 60;
      }
    }

    return false;
  }

  dropBall(x) {
    const now = performance.now();
    const dropCooldown = this.upgrades.dropSpeed.effect / this.upgrades.dropSpeed.level;

    if (now - this.lastManualDrop < dropCooldown) return;
    if (this.balls.length >= this.maxBalls) return;

    this.lastManualDrop = now;

    const ballCount = this.upgrades.multiBall.level;
    for (let i = 0; i < ballCount; i++) {
      const offsetX = (i - (ballCount - 1) / 2) * 20;
      this.createBall(x + offsetX);
    }
  }

  createBall(x) {
    // Chance de bola dourada
    const isGolden = this.upgrades.goldenBall.level > 0 &&
                     Math.random() < 0.05 * this.upgrades.goldenBall.level;

    this.balls.push({
      x: Math.max(this.canvas.width / 2 - 150, Math.min(this.canvas.width / 2 + 150, x)),
      y: this.boardStartY,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      radius: this.ballRadius,
      golden: isGolden,
      value: this.upgrades.ballValue.level * (isGolden ? 10 : 1) * this.prestigeMultiplier,
      trail: [],
    });

    this.ballsDropped++;
  }

  buyUpgrade(key) {
    const upgrade = this.upgrades[key];
    if (this.coins >= upgrade.cost) {
      this.coins -= upgrade.cost;
      upgrade.level++;

      // Atualizar custo (cresce exponencialmente)
      upgrade.cost = Math.floor(upgrade.cost * 1.8);

      // Efeitos especiais
      if (key === 'autoDrop' && upgrade.level === 1) {
        this.autoDropEnabled = true;
      }

      // Regenerar slots se upgrade de luck
      if (key === 'luckySlots') {
        this.generateSlots();
      }

      // Salvar progresso
      this.saveProgress();

      // Efeito visual
      this.floatingTexts.push({
        x: this.canvas.width - 120,
        y: 200,
        text: `${upgrade.name} +1!`,
        color: '#4ECDC4',
        alpha: 1,
        vy: -1,
      });
    }
  }

  update(dt) {
    // Auto drop
    if (this.autoDropEnabled) {
      const now = performance.now();
      const autoCooldown = this.upgrades.dropSpeed.effect / (this.upgrades.dropSpeed.level * 2);

      if (now - this.lastAutoDrop > autoCooldown) {
        this.lastAutoDrop = now;
        const x = this.canvas.width / 2 + (Math.random() - 0.5) * 200;
        this.createBall(x);
      }
    }

    // Atualizar bolas
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      // Gravidade
      ball.vy += 500 * dt;

      // Atualizar posição
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Trail
      ball.trail.push({ x: ball.x, y: ball.y, alpha: 1 });
      if (ball.trail.length > 10) ball.trail.shift();

      // Colisão com pegs
      for (const peg of this.pegs) {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ball.radius + peg.radius) {
          // Bounce
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

          ball.vx = Math.cos(angle) * speed * 0.7 + (Math.random() - 0.5) * 50;
          ball.vy = Math.sin(angle) * speed * 0.7;

          // Separar
          const overlap = ball.radius + peg.radius - dist;
          ball.x += Math.cos(angle) * overlap;
          ball.y += Math.sin(angle) * overlap;

          // Efeito no peg
          peg.hit = true;
          peg.hitTime = performance.now();

          // Partícula
          this.particles.push({
            x: peg.x,
            y: peg.y,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            color: ball.golden ? '#FFD700' : '#4ECDC4',
            alpha: 1,
            size: 3,
          });
        }
      }

      // Colisão com paredes
      const leftWall = this.canvas.width / 2 - 180;
      const rightWall = this.canvas.width / 2 + 180;

      if (ball.x - ball.radius < leftWall) {
        ball.x = leftWall + ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.7;
      }
      if (ball.x + ball.radius > rightWall) {
        ball.x = rightWall - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.7;
      }

      // Verificar slot
      const slotY = this.slots[0].y;
      if (ball.y > slotY - 20) {
        // Encontrar slot
        for (const slot of this.slots) {
          if (ball.x >= slot.x - slot.width / 2 && ball.x <= slot.x + slot.width / 2) {
            // Ganhar moedas
            const earned = Math.floor(ball.value * slot.multiplier * 10);
            this.coins += earned;
            this.totalEarned += earned;

            // Efeito
            slot.glow = 1;

            this.floatingTexts.push({
              x: slot.x,
              y: slot.y - 30,
              text: `+${this.formatNumber(earned)}`,
              color: slot.multiplier >= 5 ? '#FFD700' : '#4ECDC4',
              alpha: 1,
              vy: -2,
              scale: slot.multiplier >= 5 ? 1.5 : 1,
            });

            // Partículas
            for (let j = 0; j < 10; j++) {
              this.particles.push({
                x: slot.x,
                y: slot.y,
                vx: (Math.random() - 0.5) * 150,
                vy: -Math.random() * 150,
                color: slot.color,
                alpha: 1,
                size: 4 + Math.random() * 4,
              });
            }

            break;
          }
        }

        // Remover bola
        this.balls.splice(i, 1);
      }
    }

    // Atualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
      p.alpha -= dt * 2;

      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Atualizar textos flutuantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.02;

      if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    // Atualizar glow dos slots
    for (const slot of this.slots) {
      if (slot.glow > 0) slot.glow -= dt * 3;
    }

    // Atualizar hit dos pegs
    const now = performance.now();
    for (const peg of this.pegs) {
      if (peg.hit && now - peg.hitTime > 200) {
        peg.hit = false;
      }
    }

    // Auto-save a cada 10 segundos
    if (Math.floor(now / 10000) !== Math.floor((now - dt * 1000) / 10000)) {
      this.saveProgress();
    }
  }

  render() {
    const ctx = this.ctx;

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Tutorial overlay
    if (this.showTutorial) {
      this.renderTutorial();
      return;
    }

    // Título e moedas
    this.renderHeader();

    // Área do tabuleiro (fundo)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(
      this.canvas.width / 2 - 200,
      this.boardStartY,
      400,
      this.rows * this.pegSpacing + 150,
      20
    );
    ctx.fill();

    // Zona de drop
    ctx.fillStyle = 'rgba(78, 205, 196, 0.1)';
    ctx.fillRect(this.canvas.width / 2 - 180, this.boardStartY, 360, 50);
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(this.canvas.width / 2 - 180, this.boardStartY, 360, 50);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Clique aqui para dropar!', this.canvas.width / 2, this.boardStartY + 30);

    // Pegs
    for (const peg of this.pegs) {
      const glowSize = peg.hit ? 15 : 0;

      if (peg.hit) {
        ctx.shadowColor = '#4ECDC4';
        ctx.shadowBlur = glowSize;
      }

      ctx.fillStyle = peg.hit ? '#4ECDC4' : '#fff';
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    // Slots
    for (const slot of this.slots) {
      // Glow
      if (slot.glow > 0) {
        ctx.shadowColor = slot.color;
        ctx.shadowBlur = 20 * slot.glow;
      }

      // Fundo do slot
      ctx.fillStyle = slot.color;
      ctx.globalAlpha = 0.3 + slot.glow * 0.5;
      ctx.fillRect(slot.x - slot.width / 2, slot.y, slot.width, slot.height);
      ctx.globalAlpha = 1;

      // Borda
      ctx.strokeStyle = slot.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(slot.x - slot.width / 2, slot.y, slot.width, slot.height);

      ctx.shadowBlur = 0;

      // Multiplicador
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${slot.multiplier}x`, slot.x, slot.y + 35);
    }

    // Bolas
    for (const ball of this.balls) {
      // Trail
      for (let i = 0; i < ball.trail.length; i++) {
        const t = ball.trail[i];
        const alpha = (i / ball.trail.length) * 0.3;
        ctx.fillStyle = ball.golden ?
          `rgba(255, 215, 0, ${alpha})` :
          `rgba(78, 205, 196, ${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bola
      ctx.shadowColor = ball.golden ? '#FFD700' : '#4ECDC4';
      ctx.shadowBlur = ball.golden ? 20 : 10;

      const ballGradient = ctx.createRadialGradient(
        ball.x - 3, ball.y - 3, 0,
        ball.x, ball.y, ball.radius
      );

      if (ball.golden) {
        ballGradient.addColorStop(0, '#FFE066');
        ballGradient.addColorStop(1, '#FFD700');
      } else {
        ballGradient.addColorStop(0, '#7FDBDA');
        ballGradient.addColorStop(1, '#4ECDC4');
      }

      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

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
      ctx.font = `bold ${16 * (t.scale || 1)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    // Painel de upgrades
    this.renderUpgrades();

    // Stats
    this.renderStats();
  }

  renderTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Card
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(centerX - 160, centerY - 150, 320, 320, 20);
    ctx.fill();
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Emoji
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 80);

    // Title
    ctx.fillStyle = '#4ECDC4';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 30);

    // Lines
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 10 + i * 22);
    });

    // Page indicator
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 150);

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

  renderHeader() {
    const ctx = this.ctx;

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PLINKO TYCOON', this.canvas.width / 2, 40);

    // Moedas
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${this.formatNumber(Math.floor(this.coins))}`, this.canvas.width / 2, 80);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('moedas', this.canvas.width / 2, 98);
  }

  renderUpgrades() {
    const ctx = this.ctx;
    const panelX = this.canvas.width - 220;
    const panelY = 100;
    const panelWidth = 200;

    // Fundo do painel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, 400, 10);
    ctx.fill();

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('UPGRADES', panelX + panelWidth / 2, panelY + 25);

    // Lista de upgrades
    let y = panelY + 50;
    for (const [key, upgrade] of Object.entries(this.upgrades)) {
      const canBuy = this.coins >= upgrade.cost;

      // Fundo do upgrade
      ctx.fillStyle = canBuy ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(panelX + 10, y, panelWidth - 20, 50, 5);
      ctx.fill();

      // Borda se pode comprar
      if (canBuy) {
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Nome e nível
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${upgrade.name}`, panelX + 20, y + 18);

      ctx.fillStyle = '#4ECDC4';
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Lv.${upgrade.level}`, panelX + panelWidth - 20, y + 18);

      // Custo
      ctx.fillStyle = canBuy ? '#FFD700' : '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.formatNumber(upgrade.cost)}`, panelX + 20, y + 38);

      y += 60;
    }
  }

  renderStats() {
    const ctx = this.ctx;
    const x = 20;
    const y = 100;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 120, 10);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ESTATÍSTICAS', x + 15, y + 25);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Bolas dropadas: ${this.formatNumber(this.ballsDropped)}`, x + 15, y + 50);
    ctx.fillText(`Total ganho: ${this.formatNumber(Math.floor(this.totalEarned))}`, x + 15, y + 70);
    ctx.fillText(`Prestige: x${this.prestigeMultiplier}`, x + 15, y + 90);

    // Auto-drop status
    ctx.fillStyle = this.autoDropEnabled ? '#4ECDC4' : '#666';
    ctx.fillText(`Auto-Drop: ${this.autoDropEnabled ? 'ON' : 'OFF'}`, x + 15, y + 110);
  }

  formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('eai_plinko_tycoon');
      if (saved) {
        const data = JSON.parse(saved);
        this.coins = data.coins || 0;
        this.totalEarned = data.totalEarned || 0;
        this.ballsDropped = data.ballsDropped || 0;
        this.prestigeLevel = data.prestigeLevel || 0;
        this.prestigeMultiplier = data.prestigeMultiplier || 1;

        if (data.upgrades) {
          for (const key of Object.keys(this.upgrades)) {
            if (data.upgrades[key]) {
              this.upgrades[key].level = data.upgrades[key].level;
              this.upgrades[key].cost = data.upgrades[key].cost;
            }
          }
        }

        this.autoDropEnabled = this.upgrades.autoDrop.level > 0;
        this.generateSlots();
      }
    } catch (e) {
      console.log('Erro ao carregar progresso');
    }
  }

  saveProgress() {
    try {
      const upgradesData = {};
      for (const [key, upgrade] of Object.entries(this.upgrades)) {
        upgradesData[key] = { level: upgrade.level, cost: upgrade.cost };
      }

      localStorage.setItem('eai_plinko_tycoon', JSON.stringify({
        coins: this.coins,
        totalEarned: this.totalEarned,
        ballsDropped: this.ballsDropped,
        prestigeLevel: this.prestigeLevel,
        prestigeMultiplier: this.prestigeMultiplier,
        upgrades: upgradesData,
      }));

      // Enviar para EAI
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
          type: 'EAI_GAME_SCORE',
          game: 'plinko-tycoon',
          coins: Math.floor(this.totalEarned),
          xp: Math.floor(this.ballsDropped / 10),
        }, '*');
      }
    } catch (e) {
      console.log('Erro ao salvar progresso');
    }
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
    window.plinkoGame = new PlinkoTycoon(canvas);
  }
});
