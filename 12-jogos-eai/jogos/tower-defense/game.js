/**
 * TOWER DEFENSE EAI - Defenda sua base!
 * Posicione torres estrategicamente para impedir que inimigos cheguem ao objetivo.
 */

class TowerDefenseGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configurações do grid
    this.gridSize = 50;
    this.cols = 16;
    this.rows = 12;

    // Estado do jogo
    this.state = 'menu'; // menu, playing, paused, gameover, victory
    this.money = 200;
    this.lives = 20;
    this.wave = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('td-eai-highscore') || '0');

    // Entidades
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];

    // Wave
    this.waveEnemies = [];
    this.spawnTimer = 0;
    this.waveDelay = 3;
    this.betweenWaves = true;

    // UI
    this.selectedTower = null;
    this.selectedTowerType = null;
    this.hoveredCell = null;

    // Mapa atual
    this.currentMap = 0;
    this.maps = this.createMaps();
    this.path = [];

    // Tipos de torres
    this.towerTypes = {
      archer: {
        name: 'Arqueiro',
        cost: 50,
        damage: 15,
        range: 120,
        fireRate: 1,
        color: '#22c55e',
        projectileColor: '#86efac',
        projectileSpeed: 8,
        description: 'Tiro rápido, dano baixo',
      },
      cannon: {
        name: 'Canhão',
        cost: 100,
        damage: 40,
        range: 100,
        fireRate: 0.5,
        color: '#f59e0b',
        projectileColor: '#fcd34d',
        projectileSpeed: 5,
        splash: 40,
        description: 'Dano em área',
      },
      mage: {
        name: 'Mago',
        cost: 80,
        damage: 25,
        range: 150,
        fireRate: 0.8,
        color: '#8b5cf6',
        projectileColor: '#c4b5fd',
        projectileSpeed: 6,
        slow: 0.5,
        slowDuration: 2,
        description: 'Causa lentidão',
      },
      tesla: {
        name: 'Tesla',
        cost: 150,
        damage: 20,
        range: 110,
        fireRate: 1.2,
        color: '#06b6d4',
        projectileColor: '#67e8f9',
        projectileSpeed: 15,
        chain: 3,
        description: 'Ataca múltiplos alvos',
      },
    };

    // Tipos de inimigos
    this.enemyTypes = {
      goblin: { health: 50, speed: 1.5, reward: 10, color: '#22c55e', size: 12, name: 'Goblin' },
      orc: { health: 150, speed: 0.8, reward: 25, color: '#65a30d', size: 16, name: 'Orc' },
      skeleton: { health: 80, speed: 1.2, reward: 15, color: '#d4d4d4', size: 12, name: 'Esqueleto' },
      mage: { health: 60, speed: 1, reward: 20, color: '#a855f7', size: 12, shield: 30, name: 'Mago' },
      boss: { health: 500, speed: 0.5, reward: 100, color: '#ef4444', size: 24, name: 'Boss' },
    };

    // Configurar eventos
    this.setupEvents();

    // Iniciar loop
    this.lastTime = 0;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createMaps() {
    // Mapa 1 - Caminho em S
    const map1 = {
      name: 'Vale Verde',
      grid: [],
      startX: 0,
      startY: 5,
      endX: 15,
      endY: 5,
    };

    // Inicializar grid vazio
    for (let y = 0; y < this.rows; y++) {
      map1.grid[y] = [];
      for (let x = 0; x < this.cols; x++) {
        map1.grid[y][x] = 0; // 0 = construível, 1 = caminho, 2 = bloqueado
      }
    }

    // Definir caminho
    const pathCoords = [
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5],
      [5, 4], [5, 3], [5, 2],
      [6, 2], [7, 2], [8, 2], [9, 2], [10, 2],
      [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8],
      [11, 8], [12, 8], [13, 8],
      [13, 7], [13, 6], [13, 5],
      [14, 5], [15, 5],
    ];

    pathCoords.forEach(([x, y]) => {
      map1.grid[y][x] = 1;
    });

    return [map1];
  }

  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const col = Math.floor(x / this.gridSize);
      const row = Math.floor(y / this.gridSize);

      if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
        this.hoveredCell = { col, row };
      } else {
        this.hoveredCell = null;
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      this.handleClick(x, y);
    });

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      this.handleClick(x, y);
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.state === 'playing') this.state = 'paused';
        else if (this.state === 'paused') this.state = 'playing';
      }
      if (e.code === 'Space' && this.betweenWaves && this.state === 'playing') {
        this.startWave();
      }
    });

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const container = this.canvas.parentElement;
    const maxWidth = Math.min(window.innerWidth, 800);
    const maxHeight = Math.min(window.innerHeight, 600);

    this.canvas.width = this.cols * this.gridSize;
    this.canvas.height = this.rows * this.gridSize;

    this.canvas.style.width = `${maxWidth}px`;
    this.canvas.style.height = `${(maxWidth * this.rows) / this.cols}px`;
  }

  handleClick(x, y) {
    if (this.state === 'menu') {
      // Botão jogar
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      if (x > cx - 100 && x < cx + 100 && y > cy && y < cy + 60) {
        this.startGame();
      }
      return;
    }

    if (this.state === 'gameover' || this.state === 'victory') {
      this.state = 'menu';
      return;
    }

    if (this.state === 'paused') {
      this.state = 'playing';
      return;
    }

    if (this.state !== 'playing') return;

    // Verificar clique na UI de torres
    const uiY = this.canvas.height - 70;
    if (y > uiY) {
      const towerKeys = Object.keys(this.towerTypes);
      towerKeys.forEach((key, i) => {
        const btnX = 20 + i * 90;
        if (x > btnX && x < btnX + 80 && y > uiY + 10 && y < uiY + 60) {
          if (this.money >= this.towerTypes[key].cost) {
            this.selectedTowerType = key;
          }
        }
      });

      // Botão de próxima wave
      if (this.betweenWaves) {
        const waveBtn = this.canvas.width - 120;
        if (x > waveBtn && x < waveBtn + 100) {
          this.startWave();
        }
      }
      return;
    }

    const col = Math.floor(x / this.gridSize);
    const row = Math.floor(y / this.gridSize);

    // Verificar se clicou em uma torre existente
    const existingTower = this.towers.find(t => t.col === col && t.row === row);
    if (existingTower) {
      this.selectedTower = existingTower;
      this.selectedTowerType = null;
      return;
    }

    // Colocar nova torre
    if (this.selectedTowerType && this.canPlaceTower(col, row)) {
      this.placeTower(col, row, this.selectedTowerType);
      this.selectedTowerType = null;
    }

    this.selectedTower = null;
  }

  canPlaceTower(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;

    const map = this.maps[this.currentMap];
    if (map.grid[row][col] !== 0) return false;

    const hasTower = this.towers.some(t => t.col === col && t.row === row);
    return !hasTower;
  }

  placeTower(col, row, type) {
    const towerType = this.towerTypes[type];
    if (this.money < towerType.cost) return;

    this.money -= towerType.cost;

    const tower = {
      col,
      row,
      x: col * this.gridSize + this.gridSize / 2,
      y: row * this.gridSize + this.gridSize / 2,
      type,
      ...towerType,
      level: 1,
      cooldown: 0,
      kills: 0,
    };

    this.towers.push(tower);

    // Partículas de construção
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: tower.x,
        y: tower.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0.5,
        maxLife: 0.5,
        color: tower.color,
        size: 4,
      });
    }
  }

  startGame() {
    this.state = 'playing';
    this.money = 200;
    this.lives = 20;
    this.wave = 0;
    this.score = 0;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.betweenWaves = true;

    // Criar caminho
    this.createPath();
  }

  createPath() {
    const map = this.maps[this.currentMap];
    this.path = [];

    // BFS para encontrar caminho
    const visited = new Set();
    const queue = [{ x: map.startX, y: map.startY, path: [] }];

    while (queue.length > 0) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const newPath = [...current.path, { x: current.x, y: current.y }];

      if (current.x === map.endX && current.y === map.endY) {
        this.path = newPath;
        return;
      }

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      neighbors.forEach(n => {
        if (n.x >= 0 && n.x < this.cols && n.y >= 0 && n.y < this.rows) {
          if (map.grid[n.y][n.x] === 1 && !visited.has(`${n.x},${n.y}`)) {
            queue.push({ x: n.x, y: n.y, path: newPath });
          }
        }
      });
    }
  }

  startWave() {
    this.wave++;
    this.betweenWaves = false;
    this.waveEnemies = this.generateWave(this.wave);
    this.spawnTimer = 0;
  }

  generateWave(waveNum) {
    const enemies = [];

    // Número base de inimigos
    const baseCount = 5 + waveNum * 2;

    // Tipos disponíveis baseados na wave
    const available = ['goblin'];
    if (waveNum >= 2) available.push('skeleton');
    if (waveNum >= 3) available.push('orc');
    if (waveNum >= 5) available.push('mage');

    // Gerar inimigos
    for (let i = 0; i < baseCount; i++) {
      const type = available[Math.floor(Math.random() * available.length)];
      enemies.push(type);
    }

    // Boss a cada 5 waves
    if (waveNum % 5 === 0) {
      enemies.push('boss');
    }

    return enemies;
  }

  spawnEnemy(type) {
    const enemyType = this.enemyTypes[type];
    const map = this.maps[this.currentMap];

    const enemy = {
      x: map.startX * this.gridSize + this.gridSize / 2,
      y: map.startY * this.gridSize + this.gridSize / 2,
      type,
      ...enemyType,
      maxHealth: enemyType.health,
      pathIndex: 0,
      slowTimer: 0,
      slowAmount: 1,
    };

    // Escalar saúde com a wave
    const healthScale = 1 + (this.wave - 1) * 0.15;
    enemy.health *= healthScale;
    enemy.maxHealth = enemy.health;

    this.enemies.push(enemy);
  }

  update(dt) {
    if (this.state !== 'playing') return;

    // Spawn de inimigos
    if (!this.betweenWaves && this.waveEnemies.length > 0) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= 0.8) {
        this.spawnTimer = 0;
        this.spawnEnemy(this.waveEnemies.shift());
      }
    }

    // Verificar fim da wave
    if (!this.betweenWaves && this.waveEnemies.length === 0 && this.enemies.length === 0) {
      this.betweenWaves = true;
      this.money += 50 + this.wave * 10; // Bônus

      // Vitória após 10 waves
      if (this.wave >= 10) {
        this.endGame(true);
      }
    }

    // Atualizar inimigos
    this.enemies.forEach(enemy => this.updateEnemy(enemy, dt));
    this.enemies = this.enemies.filter(e => e.health > 0 && e.pathIndex < this.path.length);

    // Atualizar torres
    this.towers.forEach(tower => this.updateTower(tower, dt));

    // Atualizar projéteis
    this.projectiles.forEach(proj => this.updateProjectile(proj, dt));
    this.projectiles = this.projectiles.filter(p => p.alive);

    // Atualizar partículas
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      return p.life > 0;
    });

    // Game over
    if (this.lives <= 0) {
      this.endGame(false);
    }
  }

  updateEnemy(enemy, dt) {
    // Atualizar slow
    if (enemy.slowTimer > 0) {
      enemy.slowTimer -= dt;
      if (enemy.slowTimer <= 0) {
        enemy.slowAmount = 1;
      }
    }

    // Mover em direção ao próximo ponto do caminho
    if (enemy.pathIndex < this.path.length) {
      const target = this.path[enemy.pathIndex];
      const targetX = target.x * this.gridSize + this.gridSize / 2;
      const targetY = target.y * this.gridSize + this.gridSize / 2;

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 5) {
        enemy.pathIndex++;

        // Chegou ao fim
        if (enemy.pathIndex >= this.path.length) {
          this.lives--;
          enemy.health = 0;

          // Partículas de dano à base
          for (let i = 0; i < 15; i++) {
            this.particles.push({
              x: enemy.x,
              y: enemy.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 0.8,
              maxLife: 0.8,
              color: '#ef4444',
              size: 5,
            });
          }
        }
      } else {
        const speed = enemy.speed * enemy.slowAmount * 50 * dt;
        enemy.x += (dx / dist) * speed;
        enemy.y += (dy / dist) * speed;
      }
    }
  }

  updateTower(tower, dt) {
    tower.cooldown -= dt;

    if (tower.cooldown <= 0) {
      // Encontrar alvo
      const target = this.findTarget(tower);

      if (target) {
        this.fireProjectile(tower, target);
        tower.cooldown = 1 / tower.fireRate;
      }
    }
  }

  findTarget(tower) {
    let best = null;
    let bestProgress = -1;

    this.enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
      if (dist <= tower.range && enemy.pathIndex > bestProgress) {
        best = enemy;
        bestProgress = enemy.pathIndex;
      }
    });

    return best;
  }

  fireProjectile(tower, target) {
    const projectile = {
      x: tower.x,
      y: tower.y,
      targetX: target.x,
      targetY: target.y,
      target: target,
      damage: tower.damage,
      speed: tower.projectileSpeed,
      color: tower.projectileColor,
      tower: tower,
      alive: true,
      splash: tower.splash,
      slow: tower.slow,
      slowDuration: tower.slowDuration,
      chain: tower.chain,
      chainedTargets: [],
    };

    this.projectiles.push(projectile);
  }

  updateProjectile(proj, dt) {
    const dx = proj.target.x - proj.x;
    const dy = proj.target.y - proj.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10 || proj.target.health <= 0) {
      this.hitTarget(proj);
      return;
    }

    const speed = proj.speed * 60 * dt;
    proj.x += (dx / dist) * speed;
    proj.y += (dy / dist) * speed;
  }

  hitTarget(proj) {
    proj.alive = false;

    // Dano splash
    if (proj.splash) {
      this.enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - proj.target.x, enemy.y - proj.target.y);
        if (dist <= proj.splash) {
          this.damageEnemy(enemy, proj.damage * (1 - dist / proj.splash / 2), proj.tower);
        }
      });

      // Efeito visual de explosão
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        this.particles.push({
          x: proj.target.x,
          y: proj.target.y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 0.4,
          maxLife: 0.4,
          color: proj.color,
          size: 4,
        });
      }
    } else {
      this.damageEnemy(proj.target, proj.damage, proj.tower);
    }

    // Slow
    if (proj.slow && proj.target.health > 0) {
      proj.target.slowAmount = proj.slow;
      proj.target.slowTimer = proj.slowDuration;
    }

    // Chain (Tesla)
    if (proj.chain && proj.chainedTargets.length < proj.chain) {
      const nearbyEnemies = this.enemies.filter(e =>
        e !== proj.target &&
        e.health > 0 &&
        !proj.chainedTargets.includes(e) &&
        Math.hypot(e.x - proj.target.x, e.y - proj.target.y) < 100
      );

      if (nearbyEnemies.length > 0) {
        const next = nearbyEnemies[0];
        proj.chainedTargets.push(proj.target);

        const chainProj = {
          ...proj,
          x: proj.target.x,
          y: proj.target.y,
          target: next,
          damage: proj.damage * 0.7,
          alive: true,
        };

        this.projectiles.push(chainProj);

        // Efeito visual de chain
        this.particles.push({
          x: (proj.target.x + next.x) / 2,
          y: (proj.target.y + next.y) / 2,
          vx: 0,
          vy: 0,
          life: 0.2,
          maxLife: 0.2,
          color: proj.color,
          size: 8,
        });
      }
    }
  }

  damageEnemy(enemy, damage, tower) {
    // Shield primeiro
    if (enemy.shield && enemy.shield > 0) {
      const shieldDamage = Math.min(enemy.shield, damage);
      enemy.shield -= shieldDamage;
      damage -= shieldDamage;
    }

    enemy.health -= damage;

    // Partículas de dano
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0.3,
        maxLife: 0.3,
        color: '#ef4444',
        size: 3,
      });
    }

    if (enemy.health <= 0) {
      this.money += enemy.reward;
      this.score += enemy.reward;
      tower.kills++;

      // Partículas de morte
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 0.5,
          maxLife: 0.5,
          color: enemy.color,
          size: 5,
        });
      }
    }
  }

  endGame(victory) {
    this.state = victory ? 'victory' : 'gameover';

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('td-eai-highscore', this.highScore.toString());
    }

    // Recompensas EAI
    const xpGained = Math.floor(this.score / 5) + (victory ? 100 : 0);
    const coinsGained = Math.floor(this.score / 20) + (victory ? 50 : 0);

    const progress = JSON.parse(localStorage.getItem('eai-student-progress') || '{}');
    progress.xp = (progress.xp || 0) + xpGained;
    progress.coins = (progress.coins || 0) + coinsGained;

    while (progress.xp >= (progress.level || 1) * 100) {
      progress.xp -= (progress.level || 1) * 100;
      progress.level = (progress.level || 1) + 1;
    }

    localStorage.setItem('eai-student-progress', JSON.stringify(progress));
    this.rewards = { xp: xpGained, coins: coinsGained };
  }

  draw() {
    const ctx = this.ctx;

    // Fundo
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.drawMenu();
    } else {
      this.drawGame();

      if (this.state === 'paused') this.drawPaused();
      if (this.state === 'gameover') this.drawGameOver();
      if (this.state === 'victory') this.drawVictory();
    }
  }

  drawMenu() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOWER DEFENSE', cx, cy - 100);
    ctx.fillText('EAI', cx, cy - 60);

    // Emoji
    ctx.font = '60px Arial';
    ctx.fillText('🏰', cx, cy - 10);

    // Botão
    const gradient = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + 20, 200, 50, 10);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('JOGAR', cx, cy + 52);

    // High Score
    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px Arial';
    ctx.fillText(`Recorde: ${this.highScore}`, cx, cy + 90);

    // Instruções
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Arial';
    ctx.fillText('Clique para posicionar torres • Defenda sua base!', cx, this.canvas.height - 20);
  }

  drawGame() {
    const ctx = this.ctx;
    const map = this.maps[this.currentMap];

    // Desenhar grid
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.gridSize;
        const y = row * this.gridSize;
        const cell = map.grid[row][col];

        if (cell === 1) {
          // Caminho
          ctx.fillStyle = '#3f3f46';
          ctx.fillRect(x, y, this.gridSize, this.gridSize);
        } else {
          // Área construível
          ctx.fillStyle = '#27272a';
          ctx.fillRect(x, y, this.gridSize, this.gridSize);
        }

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(x, y, this.gridSize, this.gridSize);
      }
    }

    // Highlight célula selecionada
    if (this.hoveredCell && this.selectedTowerType) {
      const { col, row } = this.hoveredCell;
      const canPlace = this.canPlaceTower(col, row);

      ctx.fillStyle = canPlace ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(col * this.gridSize, row * this.gridSize, this.gridSize, this.gridSize);

      // Preview do range
      if (canPlace) {
        const tower = this.towerTypes[this.selectedTowerType];
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(
          col * this.gridSize + this.gridSize / 2,
          row * this.gridSize + this.gridSize / 2,
          tower.range,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }

    // Spawn e End markers
    const startX = map.startX * this.gridSize + this.gridSize / 2;
    const startY = map.startY * this.gridSize + this.gridSize / 2;
    const endX = map.endX * this.gridSize + this.gridSize / 2;
    const endY = map.endY * this.gridSize + this.gridSize / 2;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(startX, startY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('▶', startX, startY + 4);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endX, endY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('🏰', endX, endY + 4);

    // Desenhar torres
    this.towers.forEach(tower => this.drawTower(tower));

    // Desenhar inimigos
    this.enemies.forEach(enemy => this.drawEnemy(enemy));

    // Desenhar projéteis
    this.projectiles.forEach(proj => {
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Desenhar partículas
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // UI
    this.drawUI();
  }

  drawTower(tower) {
    const ctx = this.ctx;

    // Range se selecionada
    if (this.selectedTower === tower) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Base
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Torre
    ctx.fillStyle = tower.color;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // Ícone
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    const icons = { archer: '🏹', cannon: '💣', mage: '🔮', tesla: '⚡' };
    ctx.fillText(icons[tower.type] || '?', tower.x, tower.y + 5);
  }

  drawEnemy(enemy) {
    const ctx = this.ctx;

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + enemy.size, enemy.size * 0.8, enemy.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // Shield
    if (enemy.shield && enemy.shield > 0) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Slow indicator
    if (enemy.slowTimer > 0) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Barra de vida
    const barWidth = enemy.size * 2;
    const barHeight = 4;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - enemy.size - 8;
    const healthPercent = enemy.health / enemy.maxHealth;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }

  drawUI() {
    const ctx = this.ctx;

    // Barra superior
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this.canvas.width, 40);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';

    // Dinheiro
    ctx.fillText(`💰 ${this.money}`, 10, 27);

    // Vidas
    ctx.fillStyle = this.lives > 5 ? '#22c55e' : '#ef4444';
    ctx.fillText(`❤️ ${this.lives}`, 100, 27);

    // Wave
    ctx.fillStyle = '#fff';
    ctx.fillText(`Wave: ${this.wave}/10`, 180, 27);

    // Score
    ctx.fillText(`Score: ${this.score}`, 300, 27);

    // Barra inferior - Torres
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, this.canvas.height - 70, this.canvas.width, 70);

    const towerKeys = Object.keys(this.towerTypes);
    towerKeys.forEach((key, i) => {
      const tower = this.towerTypes[key];
      const btnX = 20 + i * 90;
      const btnY = this.canvas.height - 60;

      // Fundo do botão
      const canAfford = this.money >= tower.cost;
      const isSelected = this.selectedTowerType === key;

      ctx.fillStyle = isSelected ? tower.color : (canAfford ? '#374151' : '#1f2937');
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, 80, 50, 8);
      ctx.fill();

      if (!canAfford) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, 80, 50, 8);
        ctx.fill();
      }

      // Ícone
      const icons = { archer: '🏹', cannon: '💣', mage: '🔮', tesla: '⚡' };
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(icons[key], btnX + 25, btnY + 30);

      // Custo
      ctx.fillStyle = canAfford ? '#fbbf24' : '#6b7280';
      ctx.font = '12px Arial';
      ctx.fillText(`${tower.cost}`, btnX + 60, btnY + 32);
    });

    // Botão de próxima wave
    if (this.betweenWaves && this.state === 'playing') {
      const waveBtn = this.canvas.width - 120;
      const waveBtnY = this.canvas.height - 55;

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(waveBtn, waveBtnY, 100, 40, 8);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('▶ WAVE', waveBtn + 50, waveBtnY + 25);
    }

    // Info da torre selecionada
    if (this.selectedTower) {
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      ctx.fillRect(this.canvas.width - 150, 50, 140, 100);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(this.selectedTower.name, this.canvas.width - 140, 70);

      ctx.font = '12px Arial';
      ctx.fillText(`Dano: ${this.selectedTower.damage}`, this.canvas.width - 140, 90);
      ctx.fillText(`Range: ${this.selectedTower.range}`, this.canvas.width - 140, 105);
      ctx.fillText(`Kills: ${this.selectedTower.kills}`, this.canvas.width - 140, 120);
    }
  }

  drawPaused() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2);

    ctx.font = '16px Arial';
    ctx.fillText('Clique para continuar', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  drawGameOver() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    ctx.fillText(`Wave: ${this.wave}`, this.canvas.width / 2, this.canvas.height / 2 + 30);

    if (this.rewards) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`+${this.rewards.xp} XP   +${this.rewards.coins} 🪙`, this.canvas.width / 2, this.canvas.height / 2 + 70);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('Clique para voltar ao menu', this.canvas.width / 2, this.canvas.height / 2 + 110);
  }

  drawVictory() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 VITÓRIA! 🏆', this.canvas.width / 2, this.canvas.height / 2 - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);

    if (this.rewards) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`+${this.rewards.xp} XP   +${this.rewards.coins} 🪙`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('Clique para voltar ao menu', this.canvas.width / 2, this.canvas.height / 2 + 90);
  }

  animate(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.animate);
  }
}

// Polyfill para roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// Inicializar
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    window.game = new TowerDefenseGame(canvas);
  }
});
