// Merge Kingdom - Merge + Auto-battler Game
class MergeKingdomGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_mergekingdom_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      {
        title: 'Bem-vindo ao Merge Kingdom!',
        lines: [
          'Funda unidades e batalhe contra ondas',
          'de inimigos cada vez mais fortes!',
          '',
          'Combine estrategia e poder de fusao!'
        ],
        emoji: '⚔️'
      },
      {
        title: 'Como Jogar',
        lines: [
          '1. Compre unidades com moedas',
          '2. Arraste para mover no grid',
          '3. Solte uma sobre outra igual = FUSAO!',
          '4. Clique BATALHA quando estiver pronto'
        ],
        emoji: '👆'
      },
      {
        title: 'Sistema de Fusao',
        lines: [
          'Combine 2 unidades IGUAIS do MESMO nivel',
          'para criar uma mais forte!',
          '',
          'Nivel 1 + Nivel 1 = Nivel 2',
          'Nivel maximo: 8'
        ],
        emoji: '🔥'
      },
      {
        title: 'Tipos de Unidades',
        lines: [
          '⚔️ Guerreiro - Tanque, dano corpo-a-corpo',
          '🏹 Arqueiro - Ataque a distancia',
          '🔮 Mago - Dano magico em area',
          '💚 Curandeiro - Cura aliados',
          '',
          'Monte um time equilibrado!'
        ],
        emoji: '👥'
      }
    ];

    this.gameState = 'playing'; // playing, battle, victory, defeat
    this.wave = 1;
    this.maxWave = 0;
    this.coins = 100;
    this.diamonds = 0;

    // Grid setup
    this.gridCols = 5;
    this.gridRows = 5;
    this.cellSize = 60;
    this.gridOffsetX = 0;
    this.gridOffsetY = 0;
    this.grid = [];

    // Units
    this.unitTypes = {
      warrior: {
        name: 'Guerreiro',
        color: '#e74c3c',
        baseHp: 100,
        baseDamage: 15,
        attackSpeed: 1000,
        range: 1,
        type: 'melee',
        emoji: '⚔️'
      },
      archer: {
        name: 'Arqueiro',
        color: '#27ae60',
        baseHp: 60,
        baseDamage: 20,
        attackSpeed: 800,
        range: 3,
        type: 'ranged',
        emoji: '🏹'
      },
      mage: {
        name: 'Mago',
        color: '#9b59b6',
        baseHp: 40,
        baseDamage: 30,
        attackSpeed: 1500,
        range: 2,
        type: 'magic',
        emoji: '🔮'
      },
      healer: {
        name: 'Curandeiro',
        color: '#3498db',
        baseHp: 50,
        baseDamage: 0,
        healAmount: 15,
        attackSpeed: 2000,
        range: 2,
        type: 'support',
        emoji: '💚'
      }
    };

    this.maxLevel = 8;
    this.unitCost = 50;

    // Enemies
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];

    // Drag and drop
    this.dragging = null;
    this.dragOffset = { x: 0, y: 0 };

    // Battle state
    this.battleTimer = 0;
    this.battleDuration = 30000;

    this.initGrid();
    this.setupControls();
    this.loadProgress();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.calculateGridPosition();
  }

  calculateGridPosition() {
    this.cellSize = Math.min(60, (this.canvas.width - 40) / this.gridCols);
    this.gridOffsetX = (this.canvas.width - this.gridCols * this.cellSize) / 2;
    this.gridOffsetY = this.canvas.height - this.gridRows * this.cellSize - 100;
  }

  initGrid() {
    this.grid = [];
    for (let row = 0; row < this.gridRows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridCols; col++) {
        this.grid[row][col] = null;
      }
    }
  }

  setupControls() {
    // Mouse/Touch handling
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e.clientX, e.clientY));

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.handlePointerUp(touch.clientX, touch.clientY);
    });
  }

  handlePointerDown(x, y) {
    // Tutorial handling
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

    if (this.gameState === 'victory' || this.gameState === 'defeat') {
      this.nextWaveOrRestart();
      return;
    }

    // Check buy buttons
    if (this.gameState === 'playing') {
      const buyY = this.canvas.height - 70;
      const typeKeys = Object.keys(this.unitTypes);
      const buttonWidth = 70;
      const startX = (this.canvas.width - typeKeys.length * buttonWidth) / 2;

      typeKeys.forEach((type, i) => {
        const bx = startX + i * buttonWidth + buttonWidth / 2;
        if (x > bx - 30 && x < bx + 30 && y > buyY - 25 && y < buyY + 25) {
          this.buyUnit(type);
        }
      });

      // Check start battle button
      const battleBtnX = this.canvas.width - 80;
      const battleBtnY = this.gridOffsetY + (this.gridRows * this.cellSize) / 2;
      if (x > battleBtnX - 50 && x < battleBtnX + 50 && y > battleBtnY - 30 && y < battleBtnY + 30) {
        if (this.hasUnits()) {
          this.startBattle();
        }
      }
    }

    // Check grid for dragging
    const cell = this.getCellFromPosition(x, y);
    if (cell && this.grid[cell.row][cell.col]) {
      this.dragging = {
        unit: this.grid[cell.row][cell.col],
        fromRow: cell.row,
        fromCol: cell.col,
        x: x,
        y: y
      };
      this.dragOffset = {
        x: x - (this.gridOffsetX + cell.col * this.cellSize + this.cellSize / 2),
        y: y - (this.gridOffsetY + cell.row * this.cellSize + this.cellSize / 2)
      };
    }
  }

  handlePointerMove(x, y) {
    if (this.dragging) {
      this.dragging.x = x;
      this.dragging.y = y;
    }
  }

  handlePointerUp(x, y) {
    if (!this.dragging) return;

    const cell = this.getCellFromPosition(x, y);

    if (cell) {
      const targetUnit = this.grid[cell.row][cell.col];

      if (targetUnit && targetUnit !== this.dragging.unit) {
        // Try to merge
        if (targetUnit.type === this.dragging.unit.type && targetUnit.level === this.dragging.unit.level && targetUnit.level < this.maxLevel) {
          // Merge!
          this.grid[this.dragging.fromRow][this.dragging.fromCol] = null;
          targetUnit.level++;
          this.updateUnitStats(targetUnit);

          // Particle effect
          this.createMergeParticles(cell.col, cell.row);
        }
      } else if (!targetUnit) {
        // Move to empty cell
        this.grid[this.dragging.fromRow][this.dragging.fromCol] = null;
        this.grid[cell.row][cell.col] = this.dragging.unit;
      }
    }

    this.dragging = null;
  }

  handleTutorialClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const btnY = centerY + 120;

    if (x > centerX - 60 && x < centerX + 60 && y > btnY - 20 && y < btnY + 20) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_mergekingdom_tutorial_seen', 'true');
      }
    }

    if (x > centerX - 40 && x < centerX + 40 && y > btnY + 40 && y < btnY + 70) {
      this.showTutorial = false;
      localStorage.setItem('eai_mergekingdom_tutorial_seen', 'true');
    }
  }

  getCellFromPosition(x, y) {
    const col = Math.floor((x - this.gridOffsetX) / this.cellSize);
    const row = Math.floor((y - this.gridOffsetY) / this.cellSize);

    if (row >= 0 && row < this.gridRows && col >= 0 && col < this.gridCols) {
      return { row, col };
    }
    return null;
  }

  buyUnit(type) {
    if (this.coins < this.unitCost) return;

    // Find empty cell
    for (let row = this.gridRows - 1; row >= 0; row--) {
      for (let col = 0; col < this.gridCols; col++) {
        if (!this.grid[row][col]) {
          this.coins -= this.unitCost;
          this.grid[row][col] = this.createUnit(type, 1);
          return;
        }
      }
    }
  }

  createUnit(type, level) {
    const template = this.unitTypes[type];
    const unit = {
      type: type,
      level: level,
      hp: 0,
      maxHp: 0,
      damage: 0,
      healAmount: 0,
      attackSpeed: template.attackSpeed,
      range: template.range,
      attackTimer: 0,
      target: null,
      color: template.color,
      emoji: template.emoji,
      x: 0,
      y: 0
    };
    this.updateUnitStats(unit);
    unit.hp = unit.maxHp;
    return unit;
  }

  updateUnitStats(unit) {
    const template = this.unitTypes[unit.type];
    const multiplier = Math.pow(1.5, unit.level - 1);
    unit.maxHp = Math.floor(template.baseHp * multiplier);
    unit.damage = Math.floor(template.baseDamage * multiplier);
    if (template.healAmount) {
      unit.healAmount = Math.floor(template.healAmount * multiplier);
    }
  }

  createMergeParticles(col, row) {
    const cx = this.gridOffsetX + col * this.cellSize + this.cellSize / 2;
    const cy = this.gridOffsetY + row * this.cellSize + this.cellSize / 2;

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 500,
        color: '#f1c40f',
        size: 6
      });
    }
  }

  hasUnits() {
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        if (this.grid[row][col]) return true;
      }
    }
    return false;
  }

  startBattle() {
    this.gameState = 'battle';
    this.battleTimer = 0;
    this.enemies = [];
    this.projectiles = [];

    // Position units
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        if (this.grid[row][col]) {
          this.grid[row][col].x = this.gridOffsetX + col * this.cellSize + this.cellSize / 2;
          this.grid[row][col].y = this.gridOffsetY + row * this.cellSize + this.cellSize / 2;
          this.grid[row][col].hp = this.grid[row][col].maxHp;
          this.grid[row][col].attackTimer = 0;
        }
      }
    }

    // Spawn enemies
    this.spawnWaveEnemies();
  }

  spawnWaveEnemies() {
    const enemyCount = 3 + Math.floor(this.wave * 1.5);
    const baseHp = 50 + this.wave * 20;
    const baseDamage = 5 + this.wave * 2;

    for (let i = 0; i < enemyCount; i++) {
      const isBoss = i === 0 && this.wave % 5 === 0;

      this.enemies.push({
        x: this.gridOffsetX + Math.random() * (this.gridCols * this.cellSize),
        y: -50 - i * 60,
        hp: isBoss ? baseHp * 5 : baseHp,
        maxHp: isBoss ? baseHp * 5 : baseHp,
        damage: isBoss ? baseDamage * 2 : baseDamage,
        speed: isBoss ? 0.3 : 0.5 + Math.random() * 0.3,
        size: isBoss ? 40 : 25,
        color: isBoss ? '#c0392b' : '#e74c3c',
        attackTimer: 0,
        attackSpeed: 1500,
        isBoss: isBoss
      });
    }
  }

  update(deltaTime) {
    // Update particles
    this.particles = this.particles.filter(p => {
      p.life -= deltaTime;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      return p.life > 0;
    });

    if (this.gameState === 'battle') {
      this.updateBattle(deltaTime);
    }
  }

  updateBattle(deltaTime) {
    this.battleTimer += deltaTime;

    // Update enemies
    this.enemies.forEach(enemy => {
      // Move down
      if (enemy.y < this.gridOffsetY - 20) {
        enemy.y += enemy.speed;
      } else {
        // Attack units
        enemy.attackTimer += deltaTime;
        if (enemy.attackTimer >= enemy.attackSpeed) {
          enemy.attackTimer = 0;
          this.enemyAttack(enemy);
        }
      }
    });

    // Update units
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const unit = this.grid[row][col];
        if (!unit || unit.hp <= 0) continue;

        unit.attackTimer += deltaTime;
        if (unit.attackTimer >= unit.attackSpeed) {
          unit.attackTimer = 0;
          this.unitAttack(unit);
        }
      }
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Check hit
      if (p.targetEnemy) {
        const enemy = this.enemies.find(e => e === p.target);
        if (enemy) {
          const dist = Math.sqrt((p.x - enemy.x) ** 2 + (p.y - enemy.y) ** 2);
          if (dist < enemy.size) {
            enemy.hp -= p.damage;
            if (enemy.hp <= 0) {
              const idx = this.enemies.indexOf(enemy);
              if (idx > -1) {
                this.enemies.splice(idx, 1);
                this.coins += enemy.isBoss ? 50 : 10;
              }
            }
            return false;
          }
        }
      } else if (p.isHeal) {
        const unit = p.target;
        if (unit && unit.hp > 0) {
          const dist = Math.sqrt((p.x - unit.x) ** 2 + (p.y - unit.y) ** 2);
          if (dist < 20) {
            unit.hp = Math.min(unit.maxHp, unit.hp + p.heal);
            return false;
          }
        }
      }

      return p.life-- > 0;
    });

    // Check win/lose
    if (this.enemies.length === 0) {
      this.gameState = 'victory';
      this.wave++;
      if (this.wave > this.maxWave) {
        this.maxWave = this.wave;
      }
      this.saveProgress();
    }

    // Check if all units dead
    let allDead = true;
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        if (this.grid[row][col] && this.grid[row][col].hp > 0) {
          allDead = false;
          break;
        }
      }
    }

    if (allDead && this.enemies.length > 0) {
      this.gameState = 'defeat';
      this.saveProgress();
    }
  }

  unitAttack(unit) {
    const template = this.unitTypes[unit.type];

    if (template.type === 'support') {
      // Heal lowest HP ally
      let lowestHp = null;
      let lowestRatio = 1;

      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          const ally = this.grid[row][col];
          if (ally && ally.hp > 0 && ally.hp < ally.maxHp) {
            const ratio = ally.hp / ally.maxHp;
            if (ratio < lowestRatio) {
              lowestRatio = ratio;
              lowestHp = ally;
            }
          }
        }
      }

      if (lowestHp) {
        this.projectiles.push({
          x: unit.x,
          y: unit.y,
          vx: (lowestHp.x - unit.x) / 30,
          vy: (lowestHp.y - unit.y) / 30,
          target: lowestHp,
          isHeal: true,
          heal: unit.healAmount,
          color: '#3498db',
          size: 8,
          life: 60
        });
      }
    } else {
      // Attack enemy
      let closest = null;
      let closestDist = Infinity;

      this.enemies.forEach(enemy => {
        const dist = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          closest = enemy;
        }
      });

      if (closest) {
        if (template.type === 'melee') {
          // Instant damage
          closest.hp -= unit.damage;
          if (closest.hp <= 0) {
            const idx = this.enemies.indexOf(closest);
            if (idx > -1) {
              this.enemies.splice(idx, 1);
              this.coins += closest.isBoss ? 50 : 10;
            }
          }

          // Slash effect
          this.particles.push({
            x: (unit.x + closest.x) / 2,
            y: (unit.y + closest.y) / 2,
            vx: 0,
            vy: 0,
            life: 200,
            color: '#ecf0f1',
            size: 15,
            type: 'slash'
          });
        } else {
          // Projectile
          this.projectiles.push({
            x: unit.x,
            y: unit.y,
            vx: (closest.x - unit.x) / 20,
            vy: (closest.y - unit.y) / 20,
            target: closest,
            targetEnemy: true,
            damage: unit.damage,
            color: unit.color,
            size: 6,
            life: 60
          });
        }
      }
    }
  }

  enemyAttack(enemy) {
    // Attack closest unit
    let closest = null;
    let closestDist = Infinity;

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const unit = this.grid[row][col];
        if (unit && unit.hp > 0) {
          const dist = Math.sqrt((enemy.x - unit.x) ** 2 + (enemy.y - unit.y) ** 2);
          if (dist < closestDist) {
            closestDist = dist;
            closest = unit;
          }
        }
      }
    }

    if (closest) {
      closest.hp -= enemy.damage;

      // Attack effect
      this.particles.push({
        x: closest.x,
        y: closest.y,
        vx: 0,
        vy: 0,
        life: 200,
        color: '#e74c3c',
        size: 10,
        type: 'hit'
      });

      if (closest.hp <= 0) {
        // Find and remove unit
        for (let row = 0; row < this.gridRows; row++) {
          for (let col = 0; col < this.gridCols; col++) {
            if (this.grid[row][col] === closest) {
              this.grid[row][col] = null;
            }
          }
        }
      }
    }
  }

  nextWaveOrRestart() {
    if (this.gameState === 'victory') {
      this.gameState = 'playing';
      // Heal all units
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          if (this.grid[row][col]) {
            this.grid[row][col].hp = this.grid[row][col].maxHp;
          }
        }
      }
    } else if (this.gameState === 'defeat') {
      // Restart
      this.wave = 1;
      this.coins = 100;
      this.initGrid();
      this.gameState = 'playing';
    }
  }

  draw() {
    // Background
    this.ctx.fillStyle = '#16213e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    this.drawGrid();
    this.drawUnits();
    this.drawEnemies();
    this.drawProjectiles();
    this.drawParticles();
    this.drawUI();

    if (this.gameState === 'victory') {
      this.drawVictory();
    } else if (this.gameState === 'defeat') {
      this.drawDefeat();
    }
  }

  drawGrid() {
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const x = this.gridOffsetX + col * this.cellSize;
        const y = this.gridOffsetY + row * this.cellSize;

        this.ctx.fillStyle = (row + col) % 2 === 0 ? '#1a1a2e' : '#222244';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
      }
    }
  }

  drawUnits() {
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const unit = this.grid[row][col];
        if (!unit) continue;
        if (this.dragging && this.dragging.unit === unit) continue;

        const x = this.gridOffsetX + col * this.cellSize + this.cellSize / 2;
        const y = this.gridOffsetY + row * this.cellSize + this.cellSize / 2;

        this.drawUnit(unit, x, y);
      }
    }

    // Draw dragging unit
    if (this.dragging) {
      this.drawUnit(this.dragging.unit, this.dragging.x - this.dragOffset.x, this.dragging.y - this.dragOffset.y);
    }
  }

  drawUnit(unit, x, y) {
    const size = this.cellSize * 0.4;

    // Dead units are transparent
    if (unit.hp <= 0) {
      this.ctx.globalAlpha = 0.3;
    }

    // Shadow
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + size * 0.8, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fill();

    // Body
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fillStyle = unit.color;
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Level
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(unit.level, x, y);

    // HP bar (in battle)
    if (this.gameState === 'battle' && unit.hp < unit.maxHp && unit.hp > 0) {
      const barWidth = size * 2;
      const barHeight = 4;
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(x - barWidth / 2, y - size - 8, barWidth, barHeight);
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.fillRect(x - barWidth / 2, y - size - 8, barWidth * (unit.hp / unit.maxHp), barHeight);
    }

    this.ctx.globalAlpha = 1;
  }

  drawEnemies() {
    this.enemies.forEach(enemy => {
      // Shadow
      this.ctx.beginPath();
      this.ctx.ellipse(enemy.x, enemy.y + enemy.size * 0.8, enemy.size * 0.8, enemy.size * 0.3, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.ctx.fill();

      // Body
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      this.ctx.fillStyle = enemy.color;
      this.ctx.fill();

      // Angry eyes
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x - 8, enemy.y - 5, 5, 0, Math.PI * 2);
      this.ctx.arc(enemy.x + 8, enemy.y - 5, 5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x - 8, enemy.y - 5, 2, 0, Math.PI * 2);
      this.ctx.arc(enemy.x + 8, enemy.y - 5, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // HP bar
      const barWidth = enemy.size * 2;
      const barHeight = 5;
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 10, barWidth, barHeight);
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 10, barWidth * (enemy.hp / enemy.maxHp), barHeight);

      // Boss indicator
      if (enemy.isBoss) {
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BOSS', enemy.x, enemy.y - enemy.size - 15);
      }
    });
  }

  drawProjectiles() {
    this.projectiles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();

      if (p.isHeal) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life / 500;

      if (p.type === 'slash') {
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - 15, p.y - 15);
        this.ctx.lineTo(p.x + 15, p.y + 15);
        this.ctx.stroke();
      } else if (p.type === 'hit') {
        this.ctx.fillStyle = p.color;
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('!', p.x, p.y);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }

      this.ctx.globalAlpha = 1;
    });
  }

  drawUI() {
    // Top bar
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 50);

    // Wave
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Wave ${this.wave}`, 20, 32);

    // Coins
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.fillText(`🪙 ${this.coins}`, this.canvas.width - 20, 32);

    // Max wave
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#888';
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`Melhor: Wave ${this.maxWave}`, this.canvas.width / 2, 32);

    // Buy buttons
    if (this.gameState === 'playing') {
      const buyY = this.canvas.height - 70;
      const typeKeys = Object.keys(this.unitTypes);
      const buttonWidth = 70;
      const startX = (this.canvas.width - typeKeys.length * buttonWidth) / 2;

      typeKeys.forEach((type, i) => {
        const template = this.unitTypes[type];
        const bx = startX + i * buttonWidth + buttonWidth / 2;

        // Button
        this.ctx.fillStyle = this.coins >= this.unitCost ? template.color : '#333';
        this.ctx.fillRect(bx - 30, buyY - 25, 60, 50);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(bx - 30, buyY - 25, 60, 50);

        // Emoji
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(template.emoji, bx, buyY);

        // Cost
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${this.unitCost}🪙`, bx, buyY + 18);
      });

      // Battle button
      if (this.hasUnits()) {
        const battleBtnX = this.canvas.width - 80;
        const battleBtnY = this.gridOffsetY + (this.gridRows * this.cellSize) / 2;

        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(battleBtnX - 50, battleBtnY - 30, 100, 60);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(battleBtnX - 50, battleBtnY - 30, 100, 60);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BATALHA', battleBtnX, battleBtnY + 5);
      }

      // Instructions
      this.ctx.fillStyle = '#888';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Arraste para mover. Combine iguais para evoluir!', this.canvas.width / 2, this.gridOffsetY - 10);
    }

    // Battle state
    if (this.gameState === 'battle') {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Inimigos: ${this.enemies.length}`, this.canvas.width / 2, this.gridOffsetY - 10);
    }
  }

  drawTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    // Overlay
    ctx.fillStyle = 'rgba(22, 33, 62, 0.95)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Box
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    const boxWidth = Math.min(350, this.canvas.width - 40);
    ctx.fillRect(centerX - boxWidth/2, centerY - 130, boxWidth, 280);
    ctx.strokeRect(centerX - boxWidth/2, centerY - 130, boxWidth, 280);

    // Emoji
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 70);

    // Title
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 20);

    // Lines
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '15px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 15 + i * 22);
    });

    // Page indicator
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 105);

    // Next button
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(centerX - 60, centerY + 110, 120, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    const btnText = this.tutorialPage < this.tutorialPages.length - 1 ? 'Proximo' : 'Jogar!';
    ctx.fillText(btnText, centerX, centerY + 135);

    // Skip button
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText('Pular tutorial', centerX, centerY + 170);
  }

  drawVictory() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('VITORIA!', this.canvas.width / 2, this.canvas.height / 2 - 40);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Wave ${this.wave - 1} completa!`, this.canvas.width / 2, this.canvas.height / 2 + 10);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText('Clique para continuar', this.canvas.width / 2, this.canvas.height / 2 + 60);
  }

  drawDefeat() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DERROTA', this.canvas.width / 2, this.canvas.height / 2 - 40);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Chegou ate a Wave ${this.wave}`, this.canvas.width / 2, this.canvas.height / 2 + 10);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText('Clique para reiniciar', this.canvas.width / 2, this.canvas.height / 2 + 60);
  }

  saveProgress() {
    localStorage.setItem('mergeKingdom_maxWave', this.maxWave);
    localStorage.setItem('mergeKingdom_totalWaves', (parseInt(localStorage.getItem('mergeKingdom_totalWaves') || '0')) + 1);

    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'gameScore',
        game: 'merge-kingdom',
        score: this.wave,
        xp: this.wave * 5
      }, '*');
    }
  }

  loadProgress() {
    this.maxWave = parseInt(localStorage.getItem('mergeKingdom_maxWave') || '0');
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

// Start game
window.addEventListener('load', () => {
  new MergeKingdomGame();
});
