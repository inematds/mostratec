/**
 * SLITHER EAI - Jogo estilo Slither.io
 * Controle uma cobra, coma orbes, cresça e sobreviva!
 */

class SlitherGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configurações do mundo
    this.worldSize = 3000;
    this.camera = { x: 0, y: 0 };

    // Estado do jogo
    this.state = 'menu'; // menu, playing, gameover
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('slither-eai-highscore') || '0');
    this.gameTime = 0;

    // Jogador
    this.player = null;
    this.playerSkin = localStorage.getItem('slither-eai-skin') || 'green';

    // Entidades
    this.snakes = [];
    this.orbs = [];
    this.particles = [];

    // Input
    this.mouse = { x: 0, y: 0 };
    this.isBoosting = false;
    this.isTouching = false;

    // Skins disponíveis
    this.skins = {
      green: { colors: ['#22c55e', '#16a34a', '#15803d'], name: 'Verde', unlocked: true },
      blue: { colors: ['#3b82f6', '#2563eb', '#1d4ed8'], name: 'Azul', unlocked: true },
      red: { colors: ['#ef4444', '#dc2626', '#b91c1c'], name: 'Vermelho', unlocked: true },
      purple: { colors: ['#a855f7', '#9333ea', '#7e22ce'], name: 'Roxo', cost: 50 },
      gold: { colors: ['#fbbf24', '#f59e0b', '#d97706'], name: 'Dourado', cost: 100 },
      rainbow: { colors: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'], name: 'Arco-íris', cost: 200 },
      neon: { colors: ['#00ff00', '#00ffff', '#ff00ff'], name: 'Neon', cost: 150 },
      fire: { colors: ['#ff4500', '#ff6600', '#ff8800'], name: 'Fogo', cost: 120 },
    };

    // Carregar skins desbloqueadas
    this.loadUnlockedSkins();

    // Configurar eventos
    this.setupEvents();

    // Iniciar loop
    this.lastTime = 0;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  loadUnlockedSkins() {
    const saved = localStorage.getItem('slither-eai-skins');
    if (saved) {
      const unlocked = JSON.parse(saved);
      unlocked.forEach(skin => {
        if (this.skins[skin]) this.skins[skin].unlocked = true;
      });
    }
  }

  saveUnlockedSkins() {
    const unlocked = Object.keys(this.skins).filter(s => this.skins[s].unlocked);
    localStorage.setItem('slither-eai-skins', JSON.stringify(unlocked));
  }

  setupEvents() {
    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state === 'menu') {
        this.handleMenuClick(e);
      } else if (this.state === 'playing') {
        this.isBoosting = true;
      } else if (this.state === 'gameover') {
        this.startGame();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isBoosting = false;
    });

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = touch.clientX - rect.left;
      this.mouse.y = touch.clientY - rect.top;
      this.isTouching = true;

      if (this.state === 'menu') {
        this.handleMenuClick({ clientX: touch.clientX, clientY: touch.clientY });
      } else if (this.state === 'gameover') {
        this.startGame();
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = touch.clientX - rect.left;
      this.mouse.y = touch.clientY - rect.top;
    });

    this.canvas.addEventListener('touchend', () => {
      this.isTouching = false;
      this.isBoosting = false;
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.state === 'playing') {
        this.isBoosting = true;
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        if (this.state === 'gameover') this.startGame();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isBoosting = false;
      }
    });

    // Resize
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  handleMenuClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Botão Jogar
    if (x > cx - 100 && x < cx + 100 && y > cy - 20 && y < cy + 40) {
      this.startGame();
    }

    // Skins
    const skinKeys = Object.keys(this.skins);
    const startX = cx - (skinKeys.length * 35);
    skinKeys.forEach((key, i) => {
      const sx = startX + i * 70;
      const sy = cy + 100;
      if (x > sx - 25 && x < sx + 25 && y > sy - 25 && y < sy + 25) {
        if (this.skins[key].unlocked) {
          this.playerSkin = key;
          localStorage.setItem('slither-eai-skin', key);
        } else {
          // Tentar comprar
          this.tryBuySkin(key);
        }
      }
    });
  }

  tryBuySkin(skinKey) {
    const skin = this.skins[skinKey];
    const progress = JSON.parse(localStorage.getItem('eai-student-progress') || '{}');
    const coins = progress.coins || 0;

    if (coins >= skin.cost) {
      progress.coins = coins - skin.cost;
      localStorage.setItem('eai-student-progress', JSON.stringify(progress));
      skin.unlocked = true;
      this.saveUnlockedSkins();
      this.playerSkin = skinKey;
      localStorage.setItem('slither-eai-skin', skinKey);
    }
  }

  startGame() {
    this.state = 'playing';
    this.score = 0;
    this.gameTime = 0;
    this.snakes = [];
    this.orbs = [];
    this.particles = [];

    // Criar jogador
    const startX = this.worldSize / 2 + (Math.random() - 0.5) * 500;
    const startY = this.worldSize / 2 + (Math.random() - 0.5) * 500;
    this.player = this.createSnake(startX, startY, this.skins[this.playerSkin].colors, true);
    this.snakes.push(this.player);

    // Criar cobras IA
    for (let i = 0; i < 15; i++) {
      this.spawnAISnake();
    }

    // Criar orbes iniciais
    for (let i = 0; i < 500; i++) {
      this.spawnOrb();
    }
  }

  createSnake(x, y, colors, isPlayer = false) {
    const snake = {
      segments: [],
      angle: Math.random() * Math.PI * 2,
      speed: 3,
      baseSpeed: 3,
      boostSpeed: 6,
      length: 10,
      targetLength: 10,
      colors: colors,
      isPlayer: isPlayer,
      alive: true,
      // IA
      aiTarget: null,
      aiState: 'wander',
      aiTimer: 0,
    };

    // Criar segmentos iniciais
    for (let i = 0; i < snake.length; i++) {
      snake.segments.push({
        x: x - i * 8,
        y: y,
      });
    }

    return snake;
  }

  spawnAISnake() {
    const margin = 200;
    const x = margin + Math.random() * (this.worldSize - margin * 2);
    const y = margin + Math.random() * (this.worldSize - margin * 2);

    // Escolher cor aleatória
    const colorSets = [
      ['#f97316', '#ea580c', '#c2410c'],
      ['#06b6d4', '#0891b2', '#0e7490'],
      ['#ec4899', '#db2777', '#be185d'],
      ['#8b5cf6', '#7c3aed', '#6d28d9'],
      ['#14b8a6', '#0d9488', '#0f766e'],
      ['#f43f5e', '#e11d48', '#be123c'],
    ];
    const colors = colorSets[Math.floor(Math.random() * colorSets.length)];

    const snake = this.createSnake(x, y, colors, false);
    snake.targetLength = 10 + Math.floor(Math.random() * 30);
    this.snakes.push(snake);
  }

  spawnOrb(x, y) {
    if (x === undefined) {
      x = Math.random() * this.worldSize;
      y = Math.random() * this.worldSize;
    }

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#06b6d4'];
    const orb = {
      x: x,
      y: y,
      radius: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      value: 1,
      pulse: Math.random() * Math.PI * 2,
    };

    this.orbs.push(orb);
  }

  update(dt) {
    if (this.state !== 'playing') return;

    this.gameTime += dt;

    // Atualizar jogador
    if (this.player && this.player.alive) {
      this.updatePlayerInput();
    }

    // Atualizar todas as cobras
    this.snakes.forEach(snake => {
      if (!snake.alive) return;

      if (!snake.isPlayer) {
        this.updateAI(snake, dt);
      }

      this.updateSnake(snake, dt);
    });

    // Verificar colisões
    this.checkCollisions();

    // Atualizar partículas
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });

    // Respawn de orbes
    while (this.orbs.length < 500) {
      this.spawnOrb();
    }

    // Respawn de cobras IA
    const aliveAI = this.snakes.filter(s => !s.isPlayer && s.alive).length;
    if (aliveAI < 15) {
      this.spawnAISnake();
    }

    // Atualizar câmera
    if (this.player && this.player.alive) {
      const head = this.player.segments[0];
      this.camera.x = head.x - this.canvas.width / 2;
      this.camera.y = head.y - this.canvas.height / 2;
    }
  }

  updatePlayerInput() {
    const head = this.player.segments[0];
    const worldMouseX = this.mouse.x + this.camera.x;
    const worldMouseY = this.mouse.y + this.camera.y;

    const dx = worldMouseX - head.x;
    const dy = worldMouseY - head.y;
    const targetAngle = Math.atan2(dy, dx);

    // Suavizar rotação
    let angleDiff = targetAngle - this.player.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    this.player.angle += angleDiff * 0.15;

    // Boost
    if (this.isBoosting && this.player.segments.length > 12) {
      this.player.speed = this.player.boostSpeed;
      // Perder tamanho ao usar boost
      if (Math.random() < 0.1) {
        this.player.targetLength = Math.max(10, this.player.targetLength - 0.5);
        // Spawn orbe atrás
        const tail = this.player.segments[this.player.segments.length - 1];
        this.spawnOrb(tail.x + (Math.random() - 0.5) * 20, tail.y + (Math.random() - 0.5) * 20);
      }
    } else {
      this.player.speed = this.player.baseSpeed;
    }
  }

  updateAI(snake, dt) {
    snake.aiTimer -= dt;

    if (snake.aiTimer <= 0) {
      snake.aiTimer = 0.5 + Math.random() * 1;

      // Decidir comportamento
      const head = snake.segments[0];

      // Procurar orbes próximos
      let nearestOrb = null;
      let nearestDist = 200;
      this.orbs.forEach(orb => {
        const dist = Math.hypot(orb.x - head.x, orb.y - head.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestOrb = orb;
        }
      });

      // Verificar perigo (outras cobras maiores)
      let danger = null;
      let dangerDist = 150;
      this.snakes.forEach(other => {
        if (other === snake || !other.alive) return;
        if (other.segments.length > snake.segments.length) {
          const dist = Math.hypot(other.segments[0].x - head.x, other.segments[0].y - head.y);
          if (dist < dangerDist) {
            dangerDist = dist;
            danger = other;
          }
        }
      });

      if (danger) {
        // Fugir
        snake.aiState = 'flee';
        const dangerHead = danger.segments[0];
        snake.aiTarget = {
          x: head.x - (dangerHead.x - head.x) * 2,
          y: head.y - (dangerHead.y - head.y) * 2,
        };
      } else if (nearestOrb) {
        // Ir para orbe
        snake.aiState = 'hunt';
        snake.aiTarget = nearestOrb;
      } else {
        // Vagar
        snake.aiState = 'wander';
        snake.aiTarget = {
          x: head.x + (Math.random() - 0.5) * 400,
          y: head.y + (Math.random() - 0.5) * 400,
        };
      }
    }

    // Mover em direção ao alvo
    if (snake.aiTarget) {
      const head = snake.segments[0];
      const dx = snake.aiTarget.x - head.x;
      const dy = snake.aiTarget.y - head.y;
      const targetAngle = Math.atan2(dy, dx);

      let angleDiff = targetAngle - snake.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      snake.angle += angleDiff * 0.1;
    }

    // Evitar bordas
    const head = snake.segments[0];
    const margin = 100;
    if (head.x < margin) snake.angle = 0;
    if (head.x > this.worldSize - margin) snake.angle = Math.PI;
    if (head.y < margin) snake.angle = Math.PI / 2;
    if (head.y > this.worldSize - margin) snake.angle = -Math.PI / 2;
  }

  updateSnake(snake, dt) {
    const head = snake.segments[0];

    // Mover cabeça
    const newHead = {
      x: head.x + Math.cos(snake.angle) * snake.speed,
      y: head.y + Math.sin(snake.angle) * snake.speed,
    };

    // Limitar ao mundo
    newHead.x = Math.max(0, Math.min(this.worldSize, newHead.x));
    newHead.y = Math.max(0, Math.min(this.worldSize, newHead.y));

    snake.segments.unshift(newHead);

    // Ajustar comprimento
    const targetSegments = Math.floor(snake.targetLength);
    while (snake.segments.length > targetSegments) {
      snake.segments.pop();
    }

    // Crescer gradualmente
    if (snake.segments.length < targetSegments) {
      const tail = snake.segments[snake.segments.length - 1];
      snake.segments.push({ ...tail });
    }
  }

  checkCollisions() {
    // Jogador come orbes
    if (this.player && this.player.alive) {
      const head = this.player.segments[0];

      this.orbs = this.orbs.filter(orb => {
        const dist = Math.hypot(orb.x - head.x, orb.y - head.y);
        if (dist < 15 + orb.radius) {
          this.player.targetLength += orb.value;
          this.score += orb.value;

          // Partículas
          for (let i = 0; i < 5; i++) {
            this.particles.push({
              x: orb.x,
              y: orb.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: orb.color,
              radius: 3,
              life: 0.5,
              maxLife: 0.5,
              alpha: 1,
            });
          }

          return false;
        }
        return true;
      });
    }

    // Cobras IA comem orbes
    this.snakes.forEach(snake => {
      if (snake.isPlayer || !snake.alive) return;

      const head = snake.segments[0];
      this.orbs = this.orbs.filter(orb => {
        const dist = Math.hypot(orb.x - head.x, orb.y - head.y);
        if (dist < 15 + orb.radius) {
          snake.targetLength += orb.value;
          return false;
        }
        return true;
      });
    });

    // Colisão entre cobras
    this.snakes.forEach(snake => {
      if (!snake.alive) return;

      const head = snake.segments[0];

      this.snakes.forEach(other => {
        if (other === snake || !other.alive) return;

        // Verificar colisão com corpo
        for (let i = 3; i < other.segments.length; i++) {
          const seg = other.segments[i];
          const dist = Math.hypot(seg.x - head.x, seg.y - head.y);

          if (dist < 12) {
            this.killSnake(snake);
            return;
          }
        }
      });
    });

    // Colisão com bordas
    this.snakes.forEach(snake => {
      if (!snake.alive) return;
      const head = snake.segments[0];
      if (head.x <= 5 || head.x >= this.worldSize - 5 ||
          head.y <= 5 || head.y >= this.worldSize - 5) {
        this.killSnake(snake);
      }
    });
  }

  killSnake(snake) {
    snake.alive = false;

    // Transformar em orbes
    snake.segments.forEach((seg, i) => {
      if (i % 2 === 0) {
        this.spawnOrb(seg.x, seg.y);
      }
    });

    // Partículas de morte
    const head = snake.segments[0];
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: head.x,
        y: head.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: snake.colors[0],
        radius: 5,
        life: 1,
        maxLife: 1,
        alpha: 1,
      });
    }

    // Game over se for o jogador
    if (snake.isPlayer) {
      this.endGame();
    }
  }

  endGame() {
    this.state = 'gameover';

    // Salvar highscore
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('slither-eai-highscore', this.highScore.toString());
    }

    // Dar recompensas EAI
    this.giveRewards();
  }

  giveRewards() {
    const xpGained = Math.floor(this.score / 2);
    const coinsGained = Math.floor(this.score / 10);

    // Atualizar progresso EAI
    const progress = JSON.parse(localStorage.getItem('eai-student-progress') || '{}');
    progress.xp = (progress.xp || 0) + xpGained;
    progress.coins = (progress.coins || 0) + coinsGained;

    // Level up
    while (progress.xp >= (progress.level || 1) * 100) {
      progress.xp -= (progress.level || 1) * 100;
      progress.level = (progress.level || 1) + 1;
    }

    localStorage.setItem('eai-student-progress', JSON.stringify(progress));

    this.rewards = { xp: xpGained, coins: coinsGained };
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.drawMenu();
    } else if (this.state === 'playing') {
      this.drawGame();
    } else if (this.state === 'gameover') {
      this.drawGame();
      this.drawGameOver();
    }
  }

  drawMenu() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Fundo animado
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid decorativo
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SLITHER EAI', cx, cy - 120);

    // Emoji cobra
    ctx.font = '60px Arial';
    ctx.fillText('🐍', cx, cy - 50);

    // Botão Jogar
    const gradient = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy - 20, 200, 60, 15);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('JOGAR', cx, cy + 20);

    // High Score
    ctx.fillStyle = '#fbbf24';
    ctx.font = '18px Arial';
    ctx.fillText(`Recorde: ${this.highScore}`, cx, cy + 60);

    // Skins
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Escolha sua skin:', cx, cy + 90);

    const skinKeys = Object.keys(this.skins);
    const startX = cx - (skinKeys.length * 35);

    skinKeys.forEach((key, i) => {
      const skin = this.skins[key];
      const sx = startX + i * 70;
      const sy = cy + 130;

      // Borda de seleção
      if (key === this.playerSkin) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Círculo da skin
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 25);
      grad.addColorStop(0, skin.colors[0]);
      grad.addColorStop(1, skin.colors[skin.colors.length - 1]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, 25, 0, Math.PI * 2);
      ctx.fill();

      // Cadeado se não desbloqueado
      if (!skin.unlocked) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.arc(sx, sy, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '20px Arial';
        ctx.fillText('🔒', sx, sy + 7);

        ctx.font = '10px Arial';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${skin.cost}🪙`, sx, sy + 22);
      }
    });

    // Instruções
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('Mouse/Touch para mover • Clique/Espaço para boost', cx, this.canvas.height - 40);
  }

  drawGame() {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // Grid de fundo
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    const startX = Math.floor(this.camera.x / gridSize) * gridSize;
    const startY = Math.floor(this.camera.y / gridSize) * gridSize;

    for (let x = startX; x < this.camera.x + this.canvas.width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, this.camera.y);
      ctx.lineTo(x, this.camera.y + this.canvas.height);
      ctx.stroke();
    }
    for (let y = startY; y < this.camera.y + this.canvas.height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(this.camera.x, y);
      ctx.lineTo(this.camera.x + this.canvas.width, y);
      ctx.stroke();
    }

    // Bordas do mundo
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, this.worldSize, this.worldSize);

    // Desenhar orbes
    this.orbs.forEach(orb => {
      orb.pulse += 0.05;
      const scale = 1 + Math.sin(orb.pulse) * 0.2;

      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius * scale, 0, Math.PI * 2);

      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * scale);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.fillStyle = orb.color;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Desenhar partículas
    this.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Desenhar cobras
    this.snakes.forEach(snake => {
      if (!snake.alive) return;
      this.drawSnake(snake);
    });

    ctx.restore();

    // UI
    this.drawUI();
  }

  drawSnake(snake) {
    const ctx = this.ctx;

    // Desenhar segmentos (do último ao primeiro)
    for (let i = snake.segments.length - 1; i >= 0; i--) {
      const seg = snake.segments[i];
      const colorIndex = i % snake.colors.length;
      const radius = i === 0 ? 12 : 10 - (i / snake.segments.length) * 3;

      // Glow
      if (snake.isPlayer) {
        const glow = ctx.createRadialGradient(seg.x, seg.y, 0, seg.x, seg.y, radius * 2);
        glow.addColorStop(0, snake.colors[colorIndex] + '40');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Corpo
      ctx.fillStyle = snake.colors[colorIndex];
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Olhos na cabeça
      if (i === 0) {
        const eyeOffset = 5;
        const eyeAngle1 = snake.angle + 0.5;
        const eyeAngle2 = snake.angle - 0.5;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(seg.x + Math.cos(eyeAngle1) * eyeOffset, seg.y + Math.sin(eyeAngle1) * eyeOffset, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(seg.x + Math.cos(eyeAngle2) * eyeOffset, seg.y + Math.sin(eyeAngle2) * eyeOffset, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(seg.x + Math.cos(eyeAngle1) * (eyeOffset + 1), seg.y + Math.sin(eyeAngle1) * (eyeOffset + 1), 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(seg.x + Math.cos(eyeAngle2) * (eyeOffset + 1), seg.y + Math.sin(eyeAngle2) * (eyeOffset + 1), 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawUI() {
    const ctx = this.ctx;

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 20, 40);

    // Tamanho
    if (this.player && this.player.alive) {
      ctx.font = '18px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`Tamanho: ${this.player.segments.length}`, 20, 65);

      // Boost indicator
      if (this.player.segments.length > 12) {
        ctx.fillStyle = this.isBoosting ? '#22c55e' : 'rgba(255,255,255,0.5)';
        ctx.fillText('⚡ BOOST DISPONÍVEL', 20, 90);
      }
    }

    // Minimap
    const mapSize = 150;
    const mapX = this.canvas.width - mapSize - 20;
    const mapY = 20;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);

    // Cobras no minimap
    this.snakes.forEach(snake => {
      if (!snake.alive) return;
      const head = snake.segments[0];
      const mx = mapX + (head.x / this.worldSize) * mapSize;
      const my = mapY + (head.y / this.worldSize) * mapSize;

      ctx.fillStyle = snake.isPlayer ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(mx, my, snake.isPlayer ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Leaderboard
    const sortedSnakes = [...this.snakes]
      .filter(s => s.alive)
      .sort((a, b) => b.segments.length - a.segments.length)
      .slice(0, 5);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(this.canvas.width - 170, mapY + mapSize + 10, 150, 130);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('TOP 5', this.canvas.width - 160, mapY + mapSize + 30);

    ctx.font = '12px Arial';
    sortedSnakes.forEach((snake, i) => {
      const name = snake.isPlayer ? 'Você 🐍' : `Cobra ${i + 1}`;
      const y = mapY + mapSize + 50 + i * 20;

      ctx.fillStyle = snake.isPlayer ? '#22c55e' : '#fff';
      ctx.fillText(`${i + 1}. ${name}: ${snake.segments.length}`, this.canvas.width - 160, y);
    });
  }

  drawGameOver() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Box
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(cx - 200, cy - 150, 400, 300, 20);
    ctx.fill();

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 200, cy - 150, 400, 300, 20);
    ctx.stroke();

    // Título
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cx, cy - 90);

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${this.score}`, cx, cy - 40);

    if (this.score >= this.highScore) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '18px Arial';
      ctx.fillText('🏆 NOVO RECORDE!', cx, cy - 10);
    }

    // Recompensas
    if (this.rewards) {
      ctx.fillStyle = '#22c55e';
      ctx.font = '18px Arial';
      ctx.fillText(`+${this.rewards.xp} XP`, cx - 50, cy + 30);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`+${this.rewards.coins} 🪙`, cx + 50, cy + 30);
    }

    // Botão Jogar Novamente
    const gradient = ctx.createLinearGradient(cx - 100, cy + 60, cx + 100, cy + 60);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + 60, 200, 50, 10);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('JOGAR NOVAMENTE', cx, cy + 92);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('Clique ou pressione Enter', cx, cy + 130);
  }

  animate(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.animate);
  }
}

// Inicializar quando a página carregar
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    window.game = new SlitherGame(canvas);
  }
});
