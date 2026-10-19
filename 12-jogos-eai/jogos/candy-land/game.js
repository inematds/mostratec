// Candy Land Rush - EAI Games
// Match-3 puzzle game para crianças com muitos níveis e recompensas

class CandyLandRush {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_candyland_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Candy Land!', lines: ['Combine doces coloridos', 'e ganhe muitos pontos!'], emoji: '🍬' },
      { title: 'Como Jogar', lines: ['Troque doces adjacentes', 'para formar linhas de 3+', 'doces iguais!'], emoji: '🎮' },
      { title: 'Combos', lines: ['3 em linha = pontos normais', '4 em linha = doce especial!', '5 em linha = bomba arco-íris!'], emoji: '💥' },
      { title: 'Power-ups', lines: ['🔥 Queima uma linha', '💣 Explode área 3x3', '🌈 Remove cor inteira'], emoji: '✨' },
      { title: 'Objetivos', lines: ['Complete objetivos do nível', 'Colete doces específicos', 'ou alcance pontuação!'], emoji: '🎯' },
      { title: 'Vamos Jogar!', lines: ['50 níveis deliciosos', 'te esperam!', 'Boa sorte!'], emoji: '🍭' }
    ];

    // Game state
    this.state = 'menu';
    this.loadProgress();

    // Grid
    this.gridSize = 8;
    this.cellSize = 0;
    this.gridOffset = { x: 0, y: 0 };
    this.grid = [];
    this.selected = null;
    this.swapping = null;
    this.falling = false;
    this.matching = false;

    // Candy types
    this.candyTypes = [
      { emoji: '🍬', color: '#ff6b6b' },
      { emoji: '🍭', color: '#4ecdc4' },
      { emoji: '🍫', color: '#95654e' },
      { emoji: '🧁', color: '#ff9ff3' },
      { emoji: '🍩', color: '#f9ca24' },
      { emoji: '🍪', color: '#d4a574' }
    ];

    // Special candies
    this.specialTypes = {
      striped_h: { emoji: '➡️', effect: 'row' },
      striped_v: { emoji: '⬇️', effect: 'col' },
      bomb: { emoji: '💣', effect: 'bomb' },
      rainbow: { emoji: '🌈', effect: 'color' }
    };

    // Levels
    this.levels = this.generateLevels();
    this.currentLevel = 0;
    this.levelMoves = 0;
    this.levelScore = 0;
    this.levelTarget = 0;
    this.levelObjective = null;
    this.objectiveProgress = 0;

    // Power-ups
    this.powerUps = {
      hammer: { count: 3, icon: '🔨', desc: 'Remove 1 doce' },
      shuffle: { count: 2, icon: '🔀', desc: 'Embaralha tudo' },
      extraMoves: { count: 2, icon: '➕', desc: '+5 movimentos' }
    };

    // Shop items
    this.shopItems = [
      { id: 'hammer3', name: '3 Martelos', price: 100, gives: { hammer: 3 } },
      { id: 'shuffle3', name: '3 Embaralhamentos', price: 150, gives: { shuffle: 3 } },
      { id: 'extra3', name: '3 Extra Moves', price: 200, gives: { extraMoves: 3 } },
      { id: 'pack_small', name: 'Pacote Pequeno', price: 400, gives: { hammer: 5, shuffle: 3, extraMoves: 3 } },
      { id: 'pack_big', name: 'Pacote Grande', price: 800, gives: { hammer: 10, shuffle: 8, extraMoves: 8 } }
    ];

    // Themes
    this.themes = [
      { name: 'Clássico', bg1: '#ff9a9e', bg2: '#ff6b9d', unlockLevel: 1 },
      { name: 'Chocolate', bg1: '#8B4513', bg2: '#5D3A1A', unlockLevel: 10 },
      { name: 'Algodão Doce', bg1: '#ffafcc', bg2: '#bde0fe', unlockLevel: 20 },
      { name: 'Menta', bg1: '#40916c', bg2: '#1b4332', unlockLevel: 30 },
      { name: 'Arco-íris', bg1: '#ff0000', bg2: '#0000ff', unlockLevel: 40 }
    ];
    this.selectedTheme = parseInt(localStorage.getItem('candyland_theme') || '0');

    // Achievements
    this.achievements = [
      { id: 'first_match', name: 'Primeira Combinação', desc: 'Faça sua primeira combinação', icon: '🍬', unlocked: false },
      { id: 'combo_master', name: 'Mestre do Combo', desc: 'Faça um combo de 5x', icon: '🔥', unlocked: false },
      { id: 'level_10', name: 'Explorador', desc: 'Complete 10 níveis', icon: '🌟', unlocked: false },
      { id: 'level_25', name: 'Aventureiro', desc: 'Complete 25 níveis', icon: '⭐', unlocked: false },
      { id: 'level_50', name: 'Mestre dos Doces', desc: 'Complete todos os 50 níveis', icon: '👑', unlocked: false },
      { id: 'high_score', name: 'Pontuação Alta', desc: 'Alcance 50000 pontos em um nível', icon: '💎', unlocked: false },
      { id: 'rainbow', name: 'Arco-íris', desc: 'Crie um doce arco-íris', icon: '🌈', unlocked: false },
      { id: 'collector', name: 'Colecionador', desc: 'Acumule 10000 moedas', icon: '💰', unlocked: false }
    ];
    this.loadAchievements();

    // Animation
    this.particles = [];
    this.animations = [];
    this.comboCount = 0;
    this.comboTimer = 0;

    // Input
    this.setupInput();

    // Start
    this.lastTime = performance.now();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.calculateGrid();
  }

  calculateGrid() {
    const maxSize = Math.min(this.canvas.width - 40, this.canvas.height - 200);
    this.cellSize = Math.floor(maxSize / this.gridSize);
    this.gridOffset = {
      x: (this.canvas.width - this.cellSize * this.gridSize) / 2,
      y: (this.canvas.height - this.cellSize * this.gridSize) / 2 + 30
    };
  }

  generateLevels() {
    const levels = [];
    for (let i = 0; i < 50; i++) {
      const difficulty = Math.floor(i / 10);
      levels.push({
        moves: 20 - difficulty,
        targetScore: 1000 + i * 500,
        objective: i % 3 === 0 ? { type: 'collect', candy: i % this.candyTypes.length, count: 10 + i } : null,
        colors: Math.min(4 + Math.floor(i / 10), 6)
      });
    }
    return levels;
  }

  loadProgress() {
    this.coins = parseInt(localStorage.getItem('candyland_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('candyland_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('candyland_xp') || '0');
    this.level = parseInt(localStorage.getItem('candyland_level') || '1');
    this.highestLevel = parseInt(localStorage.getItem('candyland_highest') || '1');
    this.totalScore = parseInt(localStorage.getItem('candyland_total_score') || '0');

    const powerUps = localStorage.getItem('candyland_powerups');
    if (powerUps) {
      const data = JSON.parse(powerUps);
      Object.keys(data).forEach(k => {
        if (this.powerUps[k]) this.powerUps[k].count = data[k];
      });
    }
  }

  saveProgress() {
    localStorage.setItem('candyland_coins', this.coins.toString());
    localStorage.setItem('candyland_diamonds', this.diamonds.toString());
    localStorage.setItem('candyland_xp', this.xp.toString());
    localStorage.setItem('candyland_level', this.level.toString());
    localStorage.setItem('candyland_highest', this.highestLevel.toString());
    localStorage.setItem('candyland_total_score', this.totalScore.toString());

    const powerUps = {};
    Object.keys(this.powerUps).forEach(k => powerUps[k] = this.powerUps[k].count);
    localStorage.setItem('candyland_powerups', JSON.stringify(powerUps));
  }

  loadAchievements() {
    const saved = localStorage.getItem('candyland_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      this.achievements.forEach(ach => {
        if (data[ach.id]) ach.unlocked = data[ach.id];
      });
    }
  }

  saveAchievements() {
    const data = {};
    this.achievements.forEach(ach => data[ach.id] = ach.unlocked);
    localStorage.setItem('candyland_achievements', JSON.stringify(data));
  }

  setupInput() {
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
        localStorage.setItem('eai_candyland_tutorial_seen', 'true');
      }
      return;
    }

    switch (this.state) {
      case 'menu': this.handleMenuClick(x, y); break;
      case 'levels': this.handleLevelsClick(x, y); break;
      case 'shop': this.handleShopClick(x, y); break;
      case 'achievements': this.handleAchievementsClick(x, y); break;
      case 'playing': this.handleGameClick(x, y); break;
      case 'victory': this.handleVictoryClick(x, y); break;
      case 'gameover': this.handleGameOverClick(x, y); break;
    }
  }

  handleMenuClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const btnW = 200, btnH = 50;

    const buttons = [
      { y: cy - 20, action: () => this.state = 'levels' },
      { y: cy + 40, action: () => this.state = 'shop' },
      { y: cy + 100, action: () => this.state = 'achievements' }
    ];

    buttons.forEach(btn => {
      if (x > cx - btnW/2 && x < cx + btnW/2 && y > btn.y && y < btn.y + btnH) {
        btn.action();
      }
    });
  }

  handleLevelsClick(x, y) {
    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const cols = 5;
    const btnSize = 55;
    const gap = 15;
    const startX = (this.canvas.width - (cols * btnSize + (cols-1) * gap)) / 2;
    const startY = 120;

    for (let i = 0; i < 50; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap);

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        if (i + 1 <= this.highestLevel) {
          this.currentLevel = i;
          this.startLevel();
        }
      }
    }
  }

  handleShopClick(x, y) {
    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 120;
    const itemH = 70;

    this.shopItems.forEach((item, i) => {
      const iy = startY + i * itemH;
      const buyBtnX = this.canvas.width - 120;

      if (y > iy && y < iy + itemH - 5 && x > buyBtnX && this.coins >= item.price) {
        this.coins -= item.price;
        Object.keys(item.gives).forEach(k => {
          this.powerUps[k].count += item.gives[k];
        });
        this.saveProgress();
      }
    });
  }

  handleAchievementsClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
    }
  }

  handleGameClick(x, y) {
    if (this.swapping || this.falling || this.matching) return;

    // Power-up buttons
    const powerUpY = this.canvas.height - 60;
    let powerUpX = 20;
    const powerUpKeys = Object.keys(this.powerUps);

    for (let i = 0; i < powerUpKeys.length; i++) {
      if (x > powerUpX && x < powerUpX + 70 && y > powerUpY && y < powerUpY + 50) {
        this.activatePowerUp(powerUpKeys[i]);
        return;
      }
      powerUpX += 80;
    }

    // Grid click
    const gx = Math.floor((x - this.gridOffset.x) / this.cellSize);
    const gy = Math.floor((y - this.gridOffset.y) / this.cellSize);

    if (gx >= 0 && gx < this.gridSize && gy >= 0 && gy < this.gridSize) {
      if (this.activePowerUp === 'hammer' && this.powerUps.hammer.count > 0) {
        this.powerUps.hammer.count--;
        this.removeCandy(gx, gy);
        this.activePowerUp = null;
        this.saveProgress();
        return;
      }

      if (!this.selected) {
        this.selected = { x: gx, y: gy };
      } else {
        const dx = Math.abs(gx - this.selected.x);
        const dy = Math.abs(gy - this.selected.y);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
          this.swapCandies(this.selected.x, this.selected.y, gx, gy);
        }
        this.selected = null;
      }
    }
  }

  handleVictoryClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 80 && y < cy + 130) {
      this.state = 'levels';
    }
  }

  handleGameOverClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 50 && y < cy + 100) {
      this.state = 'levels';
    }
  }

  startLevel() {
    this.state = 'playing';
    const levelData = this.levels[this.currentLevel];

    this.levelMoves = levelData.moves;
    this.levelScore = 0;
    this.levelTarget = levelData.targetScore;
    this.levelObjective = levelData.objective;
    this.objectiveProgress = 0;
    this.comboCount = 0;
    this.activePowerUp = null;

    this.initGrid(levelData.colors);
  }

  initGrid(colorCount) {
    this.grid = [];
    for (let y = 0; y < this.gridSize; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        let type;
        do {
          type = Math.floor(Math.random() * colorCount);
        } while (this.wouldMatch(x, y, type));

        this.grid[y][x] = { type, special: null, anim: 0 };
      }
    }
  }

  wouldMatch(x, y, type) {
    // Check horizontal
    if (x >= 2 && this.grid[y][x-1]?.type === type && this.grid[y][x-2]?.type === type) {
      return true;
    }
    // Check vertical
    if (y >= 2 && this.grid[y-1]?.[x]?.type === type && this.grid[y-2]?.[x]?.type === type) {
      return true;
    }
    return false;
  }

  swapCandies(x1, y1, x2, y2) {
    this.swapping = { x1, y1, x2, y2, progress: 0, reverting: false };
    this.levelMoves--;
  }

  findMatches() {
    const matches = [];

    // Horizontal matches
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize - 2; x++) {
        const type = this.grid[y][x]?.type;
        if (type === undefined || type === null) continue;

        let count = 1;
        while (x + count < this.gridSize && this.grid[y][x + count]?.type === type) {
          count++;
        }

        if (count >= 3) {
          const match = { cells: [], type, direction: 'h' };
          for (let i = 0; i < count; i++) {
            match.cells.push({ x: x + i, y });
          }
          matches.push(match);
          x += count - 1;
        }
      }
    }

    // Vertical matches
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize - 2; y++) {
        const type = this.grid[y][x]?.type;
        if (type === undefined || type === null) continue;

        let count = 1;
        while (y + count < this.gridSize && this.grid[y + count]?.[x]?.type === type) {
          count++;
        }

        if (count >= 3) {
          const match = { cells: [], type, direction: 'v' };
          for (let i = 0; i < count; i++) {
            match.cells.push({ x, y: y + i });
          }
          matches.push(match);
          y += count - 1;
        }
      }
    }

    return matches;
  }

  processMatches(matches) {
    if (matches.length === 0) {
      this.comboCount = 0;
      return;
    }

    this.comboCount++;
    this.checkAchievement('first_match');
    if (this.comboCount >= 5) this.checkAchievement('combo_master');

    matches.forEach(match => {
      const baseScore = 50 * match.cells.length * this.comboCount;
      this.levelScore += baseScore;
      this.totalScore += baseScore;

      // Create special candy for 4+ matches
      if (match.cells.length === 4) {
        const midCell = match.cells[1];
        this.grid[midCell.y][midCell.x] = {
          type: match.type,
          special: match.direction === 'h' ? 'striped_h' : 'striped_v',
          anim: 0
        };
      } else if (match.cells.length >= 5) {
        const midCell = match.cells[2];
        this.grid[midCell.y][midCell.x] = {
          type: -1,
          special: 'rainbow',
          anim: 0
        };
        this.checkAchievement('rainbow');
      }

      // Remove matched candies and track objectives
      match.cells.forEach(cell => {
        const candy = this.grid[cell.y][cell.x];
        if (!candy) return;

        // Track objective
        if (this.levelObjective?.type === 'collect' && candy.type === this.levelObjective.candy) {
          this.objectiveProgress++;
        }

        // Trigger special effects
        if (candy.special) {
          this.triggerSpecialEffect(cell.x, cell.y, candy.special, candy.type);
        }

        // Particles
        this.addParticles(
          this.gridOffset.x + cell.x * this.cellSize + this.cellSize/2,
          this.gridOffset.y + cell.y * this.cellSize + this.cellSize/2,
          this.candyTypes[candy.type]?.color || '#ffd700'
        );

        this.grid[cell.y][cell.x] = null;
      });
    });

    this.falling = true;
  }

  triggerSpecialEffect(x, y, special, type) {
    switch (special) {
      case 'striped_h':
        for (let i = 0; i < this.gridSize; i++) {
          if (this.grid[y][i]) {
            this.addParticles(
              this.gridOffset.x + i * this.cellSize + this.cellSize/2,
              this.gridOffset.y + y * this.cellSize + this.cellSize/2,
              '#ffd700'
            );
            this.levelScore += 20;
            this.grid[y][i] = null;
          }
        }
        break;

      case 'striped_v':
        for (let i = 0; i < this.gridSize; i++) {
          if (this.grid[i][x]) {
            this.addParticles(
              this.gridOffset.x + x * this.cellSize + this.cellSize/2,
              this.gridOffset.y + i * this.cellSize + this.cellSize/2,
              '#ffd700'
            );
            this.levelScore += 20;
            this.grid[i][x] = null;
          }
        }
        break;

      case 'bomb':
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < this.gridSize && nx >= 0 && nx < this.gridSize && this.grid[ny][nx]) {
              this.addParticles(
                this.gridOffset.x + nx * this.cellSize + this.cellSize/2,
                this.gridOffset.y + ny * this.cellSize + this.cellSize/2,
                '#ff6b6b'
              );
              this.levelScore += 30;
              this.grid[ny][nx] = null;
            }
          }
        }
        break;

      case 'rainbow':
        // Remove all candies of a specific type
        const targetType = Math.floor(Math.random() * this.candyTypes.length);
        for (let ry = 0; ry < this.gridSize; ry++) {
          for (let rx = 0; rx < this.gridSize; rx++) {
            if (this.grid[ry][rx]?.type === targetType) {
              this.addParticles(
                this.gridOffset.x + rx * this.cellSize + this.cellSize/2,
                this.gridOffset.y + ry * this.cellSize + this.cellSize/2,
                this.candyTypes[targetType].color
              );
              this.levelScore += 40;
              this.grid[ry][rx] = null;
            }
          }
        }
        break;
    }
  }

  removeCandy(x, y) {
    if (this.grid[y][x]) {
      this.addParticles(
        this.gridOffset.x + x * this.cellSize + this.cellSize/2,
        this.gridOffset.y + y * this.cellSize + this.cellSize/2,
        '#ffd700'
      );
      this.grid[y][x] = null;
      this.falling = true;
    }
  }

  applyGravity() {
    let moved = false;

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = this.gridSize - 1; y >= 0; y--) {
        if (!this.grid[y][x]) {
          // Find candy above
          for (let above = y - 1; above >= 0; above--) {
            if (this.grid[above][x]) {
              this.grid[y][x] = this.grid[above][x];
              this.grid[above][x] = null;
              moved = true;
              break;
            }
          }
        }
      }
    }

    // Fill empty top rows
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (!this.grid[y][x]) {
          const colorCount = this.levels[this.currentLevel].colors;
          this.grid[y][x] = {
            type: Math.floor(Math.random() * colorCount),
            special: null,
            anim: 0
          };
          moved = true;
        }
      }
    }

    return moved;
  }

  activatePowerUp(type) {
    if (type === 'hammer') {
      if (this.powerUps.hammer.count > 0) {
        this.activePowerUp = 'hammer';
      }
    } else if (type === 'shuffle') {
      if (this.powerUps.shuffle.count > 0) {
        this.powerUps.shuffle.count--;
        this.shuffleGrid();
        this.saveProgress();
      }
    } else if (type === 'extraMoves') {
      if (this.powerUps.extraMoves.count > 0) {
        this.powerUps.extraMoves.count--;
        this.levelMoves += 5;
        this.saveProgress();
      }
    }
  }

  shuffleGrid() {
    const candies = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x]) candies.push(this.grid[y][x]);
      }
    }

    // Shuffle
    for (let i = candies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candies[i], candies[j]] = [candies[j], candies[i]];
    }

    // Place back
    let idx = 0;
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x] = candies[idx++];
      }
    }
  }

  addParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color,
        size: 4 + Math.random() * 4
      });
    }
  }

  checkAchievement(id) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      this.achievementPopup = { ...ach, timer: 3000 };
      this.coins += 100;
      this.diamonds += 5;
      this.saveAchievements();
      this.saveProgress();
    }
  }

  checkVictory() {
    const scoreComplete = this.levelScore >= this.levelTarget;
    const objectiveComplete = !this.levelObjective || this.objectiveProgress >= this.levelObjective.count;

    if (scoreComplete && objectiveComplete) {
      this.victory();
    } else if (this.levelMoves <= 0) {
      this.gameOver();
    }
  }

  victory() {
    this.state = 'victory';

    // Calculate rewards
    const stars = this.levelScore >= this.levelTarget * 2 ? 3 :
                  this.levelScore >= this.levelTarget * 1.5 ? 2 : 1;

    this.coins += 50 * stars + this.currentLevel * 10;
    this.diamonds += stars;
    this.xp += 20 + this.currentLevel * 5;

    // Level up check
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
    }

    // Progress
    if (this.currentLevel + 1 >= this.highestLevel) {
      this.highestLevel = this.currentLevel + 2;
    }

    // Achievements
    if (this.highestLevel >= 10) this.checkAchievement('level_10');
    if (this.highestLevel >= 25) this.checkAchievement('level_25');
    if (this.highestLevel >= 50) this.checkAchievement('level_50');
    if (this.levelScore >= 50000) this.checkAchievement('high_score');
    if (this.coins >= 10000) this.checkAchievement('collector');

    this.saveProgress();
  }

  gameOver() {
    this.state = 'gameover';
    // Keep partial rewards
    this.coins += Math.floor(this.levelScore / 100);
    this.saveProgress();
  }

  update(dt) {
    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= dt / 500;
      return p.life > 0;
    });

    // Achievement popup
    if (this.achievementPopup) {
      this.achievementPopup.timer -= dt;
      if (this.achievementPopup.timer <= 0) this.achievementPopup = null;
    }

    if (this.state !== 'playing') return;

    // Swapping animation
    if (this.swapping) {
      this.swapping.progress += dt / 200;

      if (this.swapping.progress >= 1) {
        const { x1, y1, x2, y2, reverting } = this.swapping;

        if (!reverting) {
          // Swap
          [this.grid[y1][x1], this.grid[y2][x2]] = [this.grid[y2][x2], this.grid[y1][x1]];

          const matches = this.findMatches();
          if (matches.length === 0) {
            // Revert
            this.swapping = { x1: x2, y1: y2, x2: x1, y2: y1, progress: 0, reverting: true };
            this.levelMoves++; // Give back the move
          } else {
            this.swapping = null;
            this.matching = true;
            setTimeout(() => {
              this.processMatches(matches);
              this.matching = false;
            }, 100);
          }
        } else {
          // Complete revert
          [this.grid[y1][x1], this.grid[y2][x2]] = [this.grid[y2][x2], this.grid[y1][x1]];
          this.swapping = null;
        }
      }
    }

    // Falling/matching
    if (this.falling && !this.swapping) {
      this.falling = this.applyGravity();

      if (!this.falling) {
        setTimeout(() => {
          const matches = this.findMatches();
          if (matches.length > 0) {
            this.processMatches(matches);
          } else {
            this.checkVictory();
          }
        }, 200);
      }
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    const theme = this.themes[this.selectedTheme];
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, theme.bg1);
    gradient.addColorStop(1, theme.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.state) {
      case 'menu': this.drawMenu(); break;
      case 'levels': this.drawLevels(); break;
      case 'shop': this.drawShop(); break;
      case 'achievements': this.drawAchievements(); break;
      case 'playing': this.drawGame(); break;
      case 'victory': this.drawVictory(); break;
      case 'gameover': this.drawGameOver(); break;
    }

    // Particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Achievement popup
    if (this.achievementPopup) {
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      ctx.fillRect(w/2 - 150, 50, 300, 80);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.strokeRect(w/2 - 150, 50, 300, 80);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 Conquista!', w/2, 80);
      ctx.font = '14px Arial';
      ctx.fillText(`${this.achievementPopup.icon} ${this.achievementPopup.name}`, w/2, 110);
    }
  }

  drawTutorial() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const page = this.tutorialPages[this.tutorialPage];

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,107,157,0.95)';
    ctx.fillRect(w/2 - 180, h/2 - 140, 360, 280);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(w/2 - 180, h/2 - 140, 360, 280);

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 70);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 - 10);

    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 25 + i * 25);
    });

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffe4ec';
    ctx.fillText(`Toque para continuar (${this.tutorialPage + 1}/${this.tutorialPages.length})`, w/2, h/2 + 110);
  }

  drawMenu() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🍬 CANDY LAND 🍬', w/2, 80);

    ctx.font = '16px Arial';
    ctx.fillText(`💰 ${this.coins}   💎 ${this.diamonds}   ⭐ Nível ${this.level}`, w/2, 120);

    // Candy animation
    const time = Date.now() / 1000;
    ctx.font = '80px Arial';
    ctx.fillText('🍭', w/2 - 60 + Math.sin(time * 2) * 10, h/2 - 100);
    ctx.fillText('🍬', w/2 + 60 + Math.cos(time * 2) * 10, h/2 - 100);

    const buttons = [
      { text: '🎮 Jogar', y: h/2 - 20 },
      { text: '🛒 Loja', y: h/2 + 40 },
      { text: '🏆 Conquistas', y: h/2 + 100 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#c44569';
      ctx.fillRect(w/2 - 100, btn.y, 200, 50);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 100, btn.y, 200, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 32);
    });

    // XP Bar
    const xpNeeded = this.level * 100;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(w/2 - 100, h - 50, 200, 20);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(w/2 - 100, h - 50, 200 * (this.xp / xpNeeded), 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(w/2 - 100, h - 50, 200, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`XP: ${this.xp}/${xpNeeded}`, w/2, h - 36);
  }

  drawLevels() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Selecione o Nível', w/2, 70);

    // Back button
    ctx.fillStyle = '#c44569';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const cols = 5;
    const btnSize = 55;
    const gap = 15;
    const startX = (w - (cols * btnSize + (cols-1) * gap)) / 2;
    const startY = 100;

    for (let i = 0; i < 50; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);
      const unlocked = i + 1 <= this.highestLevel;

      ctx.fillStyle = unlocked ? '#c44569' : '#666';
      ctx.fillRect(x, y, btnSize, btnSize);
      ctx.strokeStyle = unlocked ? '#fff' : '#888';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = unlocked ? '#fff' : '#999';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(unlocked ? (i + 1).toString() : '🔒', x + btnSize/2, y + btnSize/2 + 6);
    }
  }

  drawShop() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 Loja', w/2, 50);
    ctx.font = '16px Arial';
    ctx.fillText(`💰 ${this.coins}`, w/2, 80);

    // Back button
    ctx.fillStyle = '#c44569';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 120;
    this.shopItems.forEach((item, i) => {
      const y = startY + i * 70;

      ctx.fillStyle = '#c44569';
      ctx.fillRect(20, y, w - 40, 60);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(20, y, w - 40, 60);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, 35, y + 25);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffe4ec';
      const gives = Object.entries(item.gives).map(([k,v]) => `${this.powerUps[k].icon}×${v}`).join(' ');
      ctx.fillText(gives, 35, y + 45);

      ctx.textAlign = 'right';
      ctx.fillStyle = this.coins >= item.price ? '#ffd700' : '#888';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`💰 ${item.price}`, w - 35, y + 38);
    });
  }

  drawAchievements() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Conquistas', w/2, 50);

    // Back button
    ctx.fillStyle = '#c44569';
    ctx.fillRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 90;
    const cols = 2;
    const itemW = (w - 50) / cols;

    this.achievements.forEach((ach, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 15 + col * (itemW + 10);
      const y = startY + row * 75;

      ctx.fillStyle = ach.unlocked ? '#c44569' : '#444';
      ctx.fillRect(x, y, itemW, 65);
      ctx.strokeStyle = ach.unlocked ? '#ffd700' : '#666';
      ctx.lineWidth = ach.unlocked ? 2 : 1;
      ctx.strokeRect(x, y, itemW, 65);

      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ach.unlocked ? ach.icon : '🔒', x + 10, y + 40);

      ctx.fillStyle = ach.unlocked ? '#fff' : '#888';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(ach.name, x + 45, y + 28);
      ctx.font = '10px Arial';
      ctx.fillText(ach.desc, x + 45, y + 45);
    });
  }

  drawGame() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    // Grid background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(
      this.gridOffset.x - 5,
      this.gridOffset.y - 5,
      this.gridSize * this.cellSize + 10,
      this.gridSize * this.cellSize + 10
    );

    // Draw candies
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const candy = this.grid[y][x];
        if (!candy) continue;

        let drawX = this.gridOffset.x + x * this.cellSize;
        let drawY = this.gridOffset.y + y * this.cellSize;

        // Swapping animation
        if (this.swapping) {
          const { x1, y1, x2, y2, progress } = this.swapping;
          if (x === x1 && y === y1) {
            drawX += (x2 - x1) * this.cellSize * progress;
            drawY += (y2 - y1) * this.cellSize * progress;
          } else if (x === x2 && y === y2) {
            drawX += (x1 - x2) * this.cellSize * progress;
            drawY += (y1 - y2) * this.cellSize * progress;
          }
        }

        // Selection highlight
        if (this.selected && this.selected.x === x && this.selected.y === y) {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fillRect(drawX + 2, drawY + 2, this.cellSize - 4, this.cellSize - 4);
        }

        // Draw candy
        const emoji = candy.special ? this.specialTypes[candy.special].emoji :
                      candy.type >= 0 ? this.candyTypes[candy.type].emoji : '🌈';

        ctx.font = `${this.cellSize - 10}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(emoji, drawX + this.cellSize/2, drawY + this.cellSize - 8);
      }
    }

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, 50);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Nível ${this.currentLevel + 1}`, 15, 32);

    ctx.textAlign = 'center';
    ctx.fillText(`⭐ ${this.levelScore}/${this.levelTarget}`, w/2, 32);

    ctx.textAlign = 'right';
    ctx.fillText(`Movimentos: ${this.levelMoves}`, w - 15, 32);

    // Objective
    if (this.levelObjective) {
      ctx.textAlign = 'center';
      ctx.font = '14px Arial';
      const candyEmoji = this.candyTypes[this.levelObjective.candy].emoji;
      ctx.fillText(`Colete: ${candyEmoji} ${this.objectiveProgress}/${this.levelObjective.count}`, w/2, 48);
    }

    // Progress bar
    const progress = Math.min(this.levelScore / this.levelTarget, 1);
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 52, w - 40, 8);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(20, 52, (w - 40) * progress, 8);

    // Power-ups
    const powerUpY = this.canvas.height - 60;
    let powerUpX = 20;

    Object.entries(this.powerUps).forEach(([key, power]) => {
      ctx.fillStyle = this.activePowerUp === key ? '#ffd700' : '#c44569';
      ctx.fillRect(powerUpX, powerUpY, 70, 50);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(powerUpX, powerUpY, 70, 50);

      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(power.icon, powerUpX + 25, powerUpY + 32);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(power.count.toString(), powerUpX + 55, powerUpY + 35);

      powerUpX += 80;
    });

    // Combo display
    if (this.comboCount > 1) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 COMBO x${this.comboCount}!`, w/2, this.gridOffset.y - 20);
    }
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
    ctx.fillText('🎉 Vitória! 🎉', w/2, h/2 - 80);

    const stars = this.levelScore >= this.levelTarget * 2 ? 3 :
                  this.levelScore >= this.levelTarget * 1.5 ? 2 : 1;

    ctx.font = '50px Arial';
    ctx.fillText('⭐'.repeat(stars), w/2, h/2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Pontuação: ${this.levelScore}`, w/2, h/2 + 20);
    ctx.fillText(`Moedas: +${50 * stars + this.currentLevel * 10}`, w/2, h/2 + 50);

    ctx.fillStyle = '#c44569';
    ctx.fillRect(w/2 - 100, h/2 + 80, 200, 50);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(w/2 - 100, h/2 + 80, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Continuar', w/2, h/2 + 112);
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
    ctx.fillText('Fim de Jogo', w/2, h/2 - 60);

    ctx.font = '50px Arial';
    ctx.fillText('😢', w/2, h/2);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Pontuação: ${this.levelScore}/${this.levelTarget}`, w/2, h/2 + 30);

    ctx.fillStyle = '#c44569';
    ctx.fillRect(w/2 - 100, h/2 + 50, 200, 50);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(w/2 - 100, h/2 + 50, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Tentar Novamente', w/2, h/2 + 82);
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
  setTimeout(() => new CandyLandRush(), 1600);
});
