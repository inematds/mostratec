// Block Blast EAI - EAI Games
// Puzzle de blocos estilo Block Blast com muitos recursos

class BlockBlastGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Sistema de moedas e XP
    this.coins = parseInt(localStorage.getItem('eai_blockblast_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('eai_blockblast_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('eai_blockblast_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_blockblast_level') || '1');
    this.xpToNextLevel = this.level * 100;

    // Estado do jogo
    this.state = 'menu'; // menu, playing, gameover, shop, themes, achievements
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('eai_blockblast_highscore') || '0');
    this.combo = 0;
    this.maxCombo = parseInt(localStorage.getItem('eai_blockblast_maxcombo') || '0');
    this.linesCleared = 0;
    this.totalLinesCleared = parseInt(localStorage.getItem('eai_blockblast_lines') || '0');

    // Grid 8x8
    this.gridSize = 8;
    this.cellSize = 0;
    this.gridX = 0;
    this.gridY = 0;
    this.grid = [];
    this.clearGrid();

    // Blocos disponíveis para posicionar (3 de cada vez)
    this.availableBlocks = [];
    this.selectedBlock = null;
    this.selectedBlockIndex = -1;
    this.dragOffset = { x: 0, y: 0 };

    // Definições de blocos
    this.blockShapes = [
      // 1 célula
      { shape: [[1]], color: 0 },
      // 2 células
      { shape: [[1, 1]], color: 1 },
      { shape: [[1], [1]], color: 1 },
      // 3 células
      { shape: [[1, 1, 1]], color: 2 },
      { shape: [[1], [1], [1]], color: 2 },
      { shape: [[1, 1], [1, 0]], color: 2 },
      { shape: [[1, 1], [0, 1]], color: 2 },
      { shape: [[1, 0], [1, 1]], color: 2 },
      { shape: [[0, 1], [1, 1]], color: 2 },
      // 4 células
      { shape: [[1, 1, 1, 1]], color: 3 },
      { shape: [[1], [1], [1], [1]], color: 3 },
      { shape: [[1, 1], [1, 1]], color: 3 },
      { shape: [[1, 1, 1], [1, 0, 0]], color: 3 },
      { shape: [[1, 1, 1], [0, 0, 1]], color: 3 },
      { shape: [[1, 0], [1, 0], [1, 1]], color: 3 },
      { shape: [[0, 1], [0, 1], [1, 1]], color: 3 },
      { shape: [[1, 1, 1], [0, 1, 0]], color: 3 },
      // 5 células
      { shape: [[1, 1, 1, 1, 1]], color: 4 },
      { shape: [[1], [1], [1], [1], [1]], color: 4 },
      { shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: 4 },
      { shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: 4 }
    ];

    // Temas de cores
    this.themes = [
      { id: 'neon', name: 'Neon', colors: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600'], bgColor: '#1a1a2e', unlocked: true },
      { id: 'candy', name: 'Candy', colors: ['#ff6b9d', '#c44569', '#f8b500', '#7bed9f', '#70a1ff'], bgColor: '#2d1b4e', unlocked: false, price: 500 },
      { id: 'ocean', name: 'Oceano', colors: ['#00b4d8', '#0077b6', '#90e0ef', '#48cae4', '#023e8a'], bgColor: '#03045e', unlocked: false, price: 500 },
      { id: 'forest', name: 'Floresta', colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'], bgColor: '#1b4332', unlocked: false, price: 500 },
      { id: 'fire', name: 'Fogo', colors: ['#ff4500', '#ff6347', '#ffa500', '#ffd700', '#ffff00'], bgColor: '#2d1810', unlocked: false, price: 750 },
      { id: 'galaxy', name: 'Galáxia', colors: ['#9d4edd', '#7b2cbf', '#5a189a', '#c77dff', '#e0aaff'], bgColor: '#10002b', unlocked: false, price: 1000 }
    ];
    this.currentTheme = localStorage.getItem('eai_blockblast_theme') || 'neon';
    this.loadThemes();

    // Power-ups
    this.powerUps = [
      { id: 'bomb', name: 'Bomba', desc: 'Remove área 3x3', emoji: '💣', price: 100, count: parseInt(localStorage.getItem('eai_blockblast_bomb') || '2') },
      { id: 'undo', name: 'Desfazer', desc: 'Volta última jogada', emoji: '↩️', price: 150, count: parseInt(localStorage.getItem('eai_blockblast_undo') || '1') },
      { id: 'shuffle', name: 'Trocar', desc: 'Novos blocos', emoji: '🔄', price: 75, count: parseInt(localStorage.getItem('eai_blockblast_shuffle') || '2') },
      { id: 'clear_row', name: 'Limpar Linha', desc: 'Remove uma linha', emoji: '➖', price: 200, count: parseInt(localStorage.getItem('eai_blockblast_clearrow') || '1') }
    ];
    this.bombMode = false;
    this.clearRowMode = false;

    // Upgrades
    this.upgrades = [
      { id: 'startScore', name: 'Pontos Iniciais', desc: '+100 pontos de início', price: 300, level: 0, maxLevel: 5, effect: 100 },
      { id: 'comboBonus', name: 'Bônus Combo', desc: '+25% pontos de combo', price: 400, level: 0, maxLevel: 5, effect: 0.25 },
      { id: 'coinMulti', name: 'Multi Moedas', desc: '+20% moedas ganhas', price: 500, level: 0, maxLevel: 5, effect: 0.2 },
      { id: 'blockPreview', name: 'Preview', desc: 'Veja próximos blocos', price: 600, level: 0, maxLevel: 3, effect: 1 }
    ];
    this.loadUpgrades();

    // Conquistas
    this.achievements = [
      { id: 'first_clear', name: 'Primeira Linha', desc: 'Limpe sua primeira linha', icon: '🎯', unlocked: false },
      { id: 'combo_3', name: 'Combo Iniciante', desc: 'Faça combo de 3', icon: '🔥', unlocked: false },
      { id: 'combo_5', name: 'Combo Master', desc: 'Faça combo de 5', icon: '💥', unlocked: false },
      { id: 'score_5k', name: 'Pontuador', desc: 'Alcance 5000 pontos', icon: '⭐', unlocked: false },
      { id: 'score_10k', name: 'Expert', desc: 'Alcance 10000 pontos', icon: '🌟', unlocked: false },
      { id: 'lines_100', name: 'Destruidor', desc: 'Limpe 100 linhas total', icon: '💎', unlocked: false },
      { id: 'level_10', name: 'Veterano', desc: 'Alcance nível 10', icon: '🎖️', unlocked: false },
      { id: 'all_themes', name: 'Colecionador', desc: 'Desbloqueie todos os temas', icon: '🎨', unlocked: false }
    ];
    this.loadAchievements();

    // Animações
    this.particles = [];
    this.clearingCells = [];
    this.notifications = [];

    // Histórico para undo
    this.lastState = null;

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_blockblast_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo!', lines: ['Arraste os blocos para o tabuleiro!', 'Preencha linhas ou colunas', 'para limpá-las e pontuar!'], emoji: '🧱' },
      { title: 'Combos', lines: ['Limpe várias linhas de uma vez!', 'Quanto mais linhas, mais pontos!', 'Combos multiplicam sua pontuação!'], emoji: '💥' },
      { title: 'Power-ups', lines: ['💣 Remove área 3x3', '↩️ Desfaz última jogada', '🔄 Troca os blocos atuais', '➖ Remove uma linha inteira'], emoji: '✨' },
      { title: 'Fim de Jogo', lines: ['O jogo acaba quando não há', 'espaço para nenhum bloco!', 'Planeje bem suas jogadas!'], emoji: '🎮' }
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

    // Calcular tamanho do grid
    const maxGridWidth = Math.min(this.canvas.width - 40, 400);
    this.cellSize = Math.floor(maxGridWidth / this.gridSize);
    this.gridX = (this.canvas.width - this.cellSize * this.gridSize) / 2;
    this.gridY = 120;
  }

  setupControls() {
    // Mouse
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e.clientX, e.clientY));
    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMouseDown(touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMouseMove(touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        this.handleMouseUp(touch.clientX, touch.clientY);
      }
    });
  }

  clearGrid() {
    this.grid = [];
    for (let r = 0; r < this.gridSize; r++) {
      this.grid.push(new Array(this.gridSize).fill(null));
    }
  }

  generateBlocks() {
    this.availableBlocks = [];
    for (let i = 0; i < 3; i++) {
      const shapeIndex = Math.floor(Math.random() * this.blockShapes.length);
      const blockDef = this.blockShapes[shapeIndex];
      this.availableBlocks.push({
        shape: blockDef.shape,
        colorIndex: blockDef.color,
        used: false
      });
    }
  }

  startGame() {
    this.state = 'playing';
    this.clearGrid();
    this.generateBlocks();

    const startScoreUpgrade = this.upgrades.find(u => u.id === 'startScore');
    this.score = startScoreUpgrade.level * startScoreUpgrade.effect;

    this.combo = 0;
    this.linesCleared = 0;
    this.selectedBlock = null;
    this.selectedBlockIndex = -1;
    this.particles = [];
    this.notifications = [];
    this.bombMode = false;
    this.clearRowMode = false;
    this.lastState = null;
  }

  handleMouseDown(x, y) {
    if (this.state !== 'playing') return;
    if (this.bombMode || this.clearRowMode) return;

    // Verificar se clicou em um bloco disponível
    const blockAreaY = this.gridY + this.cellSize * this.gridSize + 40;
    const blockSpacing = (this.canvas.width - 60) / 3;

    for (let i = 0; i < this.availableBlocks.length; i++) {
      const block = this.availableBlocks[i];
      if (block.used) continue;

      const blockX = 30 + blockSpacing * i + blockSpacing / 2;
      const blockY = blockAreaY + 50;
      const blockWidth = block.shape[0].length * 30;
      const blockHeight = block.shape.length * 30;

      if (x >= blockX - blockWidth / 2 - 20 && x <= blockX + blockWidth / 2 + 20 &&
          y >= blockY - blockHeight / 2 - 20 && y <= blockY + blockHeight / 2 + 20) {
        this.selectedBlock = block;
        this.selectedBlockIndex = i;
        this.dragOffset = {
          x: x - blockX,
          y: y - blockY
        };
        break;
      }
    }
  }

  handleMouseMove(x, y) {
    if (this.selectedBlock) {
      // Atualizar posição do bloco sendo arrastado
    }
  }

  handleMouseUp(x, y) {
    if (this.state !== 'playing') return;

    if (this.selectedBlock) {
      // Tentar colocar o bloco
      const gridCol = Math.floor((x - this.dragOffset.x - this.gridX) / this.cellSize);
      const gridRow = Math.floor((y - this.dragOffset.y - this.gridY) / this.cellSize);

      if (this.canPlaceBlock(this.selectedBlock.shape, gridRow, gridCol)) {
        this.saveState();
        this.placeBlock(this.selectedBlock, gridRow, gridCol);
        this.availableBlocks[this.selectedBlockIndex].used = true;
        this.checkLines();

        // Se todos os blocos foram usados, gerar novos
        if (this.availableBlocks.every(b => b.used)) {
          this.generateBlocks();
        }

        // Verificar game over
        if (this.isGameOver()) {
          this.endGame();
        }
      }

      this.selectedBlock = null;
      this.selectedBlockIndex = -1;
    }
  }

  canPlaceBlock(shape, startRow, startCol) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const gridRow = startRow + r;
          const gridCol = startCol + c;

          if (gridRow < 0 || gridRow >= this.gridSize ||
              gridCol < 0 || gridCol >= this.gridSize) {
            return false;
          }

          if (this.grid[gridRow][gridCol] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placeBlock(block, startRow, startCol) {
    const theme = this.themes.find(t => t.id === this.currentTheme);
    const color = theme.colors[block.colorIndex % theme.colors.length];

    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          this.grid[startRow + r][startCol + c] = color;
        }
      }
    }

    // Pontos por colocar
    const cellCount = block.shape.flat().filter(c => c).length;
    this.score += cellCount * 10;
  }

  checkLines() {
    const rowsToClear = [];
    const colsToClear = [];

    // Verificar linhas completas
    for (let r = 0; r < this.gridSize; r++) {
      if (this.grid[r].every(cell => cell !== null)) {
        rowsToClear.push(r);
      }
    }

    // Verificar colunas completas
    for (let c = 0; c < this.gridSize; c++) {
      let complete = true;
      for (let r = 0; r < this.gridSize; r++) {
        if (this.grid[r][c] === null) {
          complete = false;
          break;
        }
      }
      if (complete) {
        colsToClear.push(c);
      }
    }

    const totalLines = rowsToClear.length + colsToClear.length;

    if (totalLines > 0) {
      // Combo
      this.combo++;
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
        localStorage.setItem('eai_blockblast_maxcombo', this.maxCombo.toString());
      }

      // Calcular pontos
      const comboUpgrade = this.upgrades.find(u => u.id === 'comboBonus');
      const comboMultiplier = 1 + (this.combo - 1) * 0.5 * (1 + comboUpgrade.level * comboUpgrade.effect);
      const linePoints = totalLines * 100 * totalLines; // Bônus por múltiplas linhas
      const points = Math.floor(linePoints * comboMultiplier);
      this.score += points;

      // Moedas
      const coinUpgrade = this.upgrades.find(u => u.id === 'coinMulti');
      const coinMultiplier = 1 + coinUpgrade.level * coinUpgrade.effect;
      this.coins += Math.floor(totalLines * 10 * coinMultiplier);

      // XP
      this.xp += totalLines * 5;
      this.checkLevelUp();

      // Animação de limpeza
      rowsToClear.forEach(r => {
        for (let c = 0; c < this.gridSize; c++) {
          this.addClearEffect(r, c);
        }
      });
      colsToClear.forEach(c => {
        for (let r = 0; r < this.gridSize; r++) {
          this.addClearEffect(r, c);
        }
      });

      // Limpar as células
      rowsToClear.forEach(r => {
        for (let c = 0; c < this.gridSize; c++) {
          this.grid[r][c] = null;
        }
      });
      colsToClear.forEach(c => {
        for (let r = 0; r < this.gridSize; r++) {
          this.grid[r][c] = null;
        }
      });

      this.linesCleared += totalLines;
      this.totalLinesCleared += totalLines;

      // Notificação
      if (totalLines > 1 || this.combo > 1) {
        const msg = totalLines > 1 ? `${totalLines}x LINHAS! +${points}` : `Combo x${this.combo}! +${points}`;
        this.addNotification(msg, this.canvas.width / 2, this.gridY + this.cellSize * 4);
      }

      // Diamante a cada 10 linhas
      if (Math.floor(this.totalLinesCleared / 10) > Math.floor((this.totalLinesCleared - totalLines) / 10)) {
        this.diamonds++;
      }

      this.checkAchievements();
    } else {
      this.combo = 0;
    }
  }

  addClearEffect(row, col) {
    const x = this.gridX + col * this.cellSize + this.cellSize / 2;
    const y = this.gridY + row * this.cellSize + this.cellSize / 2;
    const color = this.grid[row][col];

    this.clearingCells.push({
      x, y, color,
      scale: 1,
      alpha: 1
    });

    // Partículas
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 6 + 3,
        color,
        life: 1
      });
    }
  }

  isGameOver() {
    // Verificar se algum bloco disponível pode ser colocado
    for (const block of this.availableBlocks) {
      if (block.used) continue;

      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          if (this.canPlaceBlock(block.shape, r, c)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  endGame() {
    this.state = 'gameover';

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('eai_blockblast_highscore', this.highScore.toString());
    }

    // XP bônus
    this.xp += Math.floor(this.score / 100);
    this.checkLevelUp();

    localStorage.setItem('eai_blockblast_lines', this.totalLinesCleared.toString());
    this.checkAchievements();
    this.save();
  }

  saveState() {
    this.lastState = {
      grid: this.grid.map(row => [...row]),
      score: this.score,
      combo: this.combo
    };
  }

  undoLastMove() {
    if (this.lastState) {
      this.grid = this.lastState.grid;
      this.score = this.lastState.score;
      this.combo = this.lastState.combo;
      this.lastState = null;

      // Restaurar último bloco usado
      for (let i = this.availableBlocks.length - 1; i >= 0; i--) {
        if (this.availableBlocks[i].used) {
          this.availableBlocks[i].used = false;
          break;
        }
      }
    }
  }

  useBomb(row, col) {
    // Remove área 3x3
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
          if (this.grid[r][c]) {
            this.addClearEffect(r, c);
            this.grid[r][c] = null;
          }
        }
      }
    }

    this.score += 50;
    this.bombMode = false;
    this.addNotification('💣 BOOM!', this.gridX + col * this.cellSize, this.gridY + row * this.cellSize);
  }

  useClearRow(row) {
    for (let c = 0; c < this.gridSize; c++) {
      if (this.grid[row][c]) {
        this.addClearEffect(row, c);
        this.grid[row][c] = null;
      }
    }

    this.score += 80;
    this.clearRowMode = false;
    this.addNotification('➖ Linha limpa!', this.canvas.width / 2, this.gridY + row * this.cellSize);
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

  addNotification(text, x, y) {
    this.notifications.push({ text, x, y, alpha: 1, vy: -1 });
  }

  handleClick(x, y) {
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

    const cx = this.canvas.width / 2;

    if (this.state === 'menu') {
      const buttons = [
        { y: 250, action: () => this.startGame() },
        { y: 320, action: () => this.state = 'shop' },
        { y: 390, action: () => this.state = 'themes' },
        { y: 460, action: () => this.state = 'achievements' }
      ];

      buttons.forEach(btn => {
        if (x > cx - 120 && x < cx + 120 && y > btn.y && y < btn.y + 55) {
          btn.action();
        }
      });

    } else if (this.state === 'playing') {
      // Verificar clique em power-ups
      this.handlePowerUpClick(x, y);

      // Modo bomba - clicar no grid
      if (this.bombMode) {
        const col = Math.floor((x - this.gridX) / this.cellSize);
        const row = Math.floor((y - this.gridY) / this.cellSize);
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
          this.useBomb(row, col);
        }
      }

      // Modo limpar linha
      if (this.clearRowMode) {
        const row = Math.floor((y - this.gridY) / this.cellSize);
        if (row >= 0 && row < this.gridSize) {
          this.useClearRow(row);
        }
      }

    } else if (this.state === 'gameover') {
      if (y > 350 && y < 405) {
        this.startGame();
      } else if (y > 420 && y < 475) {
        this.state = 'menu';
      }

    } else if (this.state === 'shop') {
      this.handleShopClick(x, y);

    } else if (this.state === 'themes') {
      this.handleThemesClick(x, y);
    }

    // Botão voltar
    if (this.state === 'shop' || this.state === 'themes' || this.state === 'achievements') {
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
        localStorage.setItem('eai_blockblast_tutorial_seen', 'true');
      }
    }
  }

  handlePowerUpClick(x, y) {
    const powerUpY = this.canvas.height - 50;

    this.powerUps.forEach((pu, i) => {
      const puX = 40 + i * 80;
      if (Math.abs(x - puX) < 30 && Math.abs(y - powerUpY) < 25) {
        if (pu.count > 0) {
          if (pu.id === 'bomb') {
            this.bombMode = true;
            this.clearRowMode = false;
            pu.count--;
            this.savePowerUps();
          } else if (pu.id === 'undo' && this.lastState) {
            this.undoLastMove();
            pu.count--;
            this.savePowerUps();
          } else if (pu.id === 'shuffle') {
            this.generateBlocks();
            pu.count--;
            this.savePowerUps();
          } else if (pu.id === 'clear_row') {
            this.clearRowMode = true;
            this.bombMode = false;
            pu.count--;
            this.savePowerUps();
          }
        }
      }
    });
  }

  handleShopClick(x, y) {
    // Power-ups
    this.powerUps.forEach((pu, i) => {
      const itemY = 120 + i * 75;
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
    const upgradeStartY = 140 + this.powerUps.length * 75;
    this.upgrades.forEach((up, i) => {
      const itemY = upgradeStartY + i * 70;
      const btnX = this.canvas.width - 100;

      if (x > btnX && x < btnX + 70 && y > itemY + 10 && y < itemY + 45) {
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

  handleThemesClick(x, y) {
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 100;

    this.themes.forEach((theme, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const itemX = 20 + col * (itemWidth + 10);
      const itemY = 100 + row * (itemHeight + 10);

      if (x > itemX && x < itemX + itemWidth && y > itemY && y < itemY + itemHeight) {
        if (theme.unlocked) {
          this.currentTheme = theme.id;
          localStorage.setItem('eai_blockblast_theme', theme.id);
        } else if (this.coins >= theme.price) {
          this.coins -= theme.price;
          theme.unlocked = true;
          this.currentTheme = theme.id;
          localStorage.setItem('eai_blockblast_theme', theme.id);
          this.saveThemes();
          this.save();
          this.checkAchievements();
        }
      }
    });
  }

  update(deltaTime) {
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

    // Atualizar células limpando
    for (let i = this.clearingCells.length - 1; i >= 0; i--) {
      const c = this.clearingCells[i];
      c.scale += 0.1;
      c.alpha -= 0.1;

      if (c.alpha <= 0) {
        this.clearingCells.splice(i, 1);
      }
    }

    // Atualizar notificações
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.y += n.vy;
      n.alpha -= 0.015;

      if (n.alpha <= 0) {
        this.notifications.splice(i, 1);
      }
    }
  }

  draw() {
    const theme = this.themes.find(t => t.id === this.currentTheme);

    // Fundo
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, theme.bgColor);
    gradient.addColorStop(1, this.adjustColor(theme.bgColor, -20));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.drawMenu();
    } else if (this.state === 'playing') {
      this.drawGame();
    } else if (this.state === 'gameover') {
      this.drawGameOver();
    } else if (this.state === 'shop') {
      this.drawShop();
    } else if (this.state === 'themes') {
      this.drawThemes();
    } else if (this.state === 'achievements') {
      this.drawAchievements();
    }

    if (this.showTutorial) {
      this.drawTutorial();
    }
  }

  drawMenu() {
    const cx = this.canvas.width / 2;
    const theme = this.themes.find(t => t.id === this.currentTheme);

    // Título
    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = theme.colors[0];
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = theme.colors[0];
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('BLOCK BLAST', cx, 100);
    this.ctx.shadowBlur = 0;

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = theme.colors[1];
    this.ctx.fillText('EAI', cx, 140);

    // Recursos
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 40);
    this.ctx.fillStyle = '#00BCD4';
    this.ctx.fillText(`💎 ${this.diamonds}`, 20, 65);
    this.ctx.fillStyle = theme.colors[2];
    this.ctx.fillText(`⭐ Nível ${this.level}`, 20, 90);

    // High score
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`🏆 Recorde: ${this.highScore}`, cx, 190);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = theme.colors[3];
    this.ctx.fillText(`📊 ${this.totalLinesCleared} linhas limpas`, cx, 220);

    // Botões
    const buttons = [
      { text: '▶️ JOGAR', y: 250 },
      { text: '🛒 LOJA', y: 320 },
      { text: '🎨 TEMAS', y: 390 },
      { text: '🏆 CONQUISTAS', y: 460 }
    ];

    buttons.forEach(btn => {
      const btnWidth = 240;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = `${theme.colors[0]}88`;
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 15);
      this.ctx.fill();

      this.ctx.strokeStyle = theme.colors[0];
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 36);
    });
  }

  drawGame() {
    const theme = this.themes.find(t => t.id === this.currentTheme);

    // HUD
    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${this.score}`, 20, 40);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = theme.colors[2];
    this.ctx.fillText(`🏆 ${this.highScore}`, 20, 65);

    if (this.combo > 1) {
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#FF5722';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`🔥 x${this.combo}`, this.canvas.width - 20, 40);
    }

    // Moedas
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`🪙 ${this.coins}`, this.canvas.width / 2, 40);

    // Grid
    this.drawGrid();

    // Células limpando
    this.clearingCells.forEach(c => {
      this.ctx.globalAlpha = c.alpha;
      this.ctx.fillStyle = c.color;
      this.ctx.beginPath();
      this.ctx.roundRect(
        c.x - this.cellSize * c.scale / 2,
        c.y - this.cellSize * c.scale / 2,
        this.cellSize * c.scale,
        this.cellSize * c.scale,
        5
      );
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Partículas
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Blocos disponíveis
    this.drawAvailableBlocks();

    // Bloco sendo arrastado
    if (this.selectedBlock) {
      this.drawDraggingBlock();
    }

    // Preview de posicionamento
    if (this.selectedBlock) {
      this.drawPlacementPreview();
    }

    // Modo especial
    if (this.bombMode) {
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#FF5722';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('💣 Clique no grid para explodir!', this.canvas.width / 2, 90);
    }
    if (this.clearRowMode) {
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#2196F3';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('➖ Clique em uma linha para limpar!', this.canvas.width / 2, 90);
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

    // Power-ups
    this.drawPowerUps();
  }

  drawGrid() {
    const theme = this.themes.find(t => t.id === this.currentTheme);

    // Fundo do grid
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.roundRect(
      this.gridX - 5,
      this.gridY - 5,
      this.cellSize * this.gridSize + 10,
      this.cellSize * this.gridSize + 10,
      10
    );
    this.ctx.fill();

    // Células
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const x = this.gridX + c * this.cellSize;
        const y = this.gridY + r * this.cellSize;

        // Fundo da célula
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.roundRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 4);
        this.ctx.fill();

        // Conteúdo
        if (this.grid[r][c]) {
          const gradient = this.ctx.createLinearGradient(x, y, x, y + this.cellSize);
          gradient.addColorStop(0, this.grid[r][c]);
          gradient.addColorStop(1, this.adjustColor(this.grid[r][c], -30));

          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.roundRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6, 5);
          this.ctx.fill();

          // Brilho
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          this.ctx.beginPath();
          this.ctx.roundRect(x + 5, y + 5, this.cellSize - 12, (this.cellSize - 12) / 3, 3);
          this.ctx.fill();
        }
      }
    }
  }

  drawAvailableBlocks() {
    const theme = this.themes.find(t => t.id === this.currentTheme);
    const blockAreaY = this.gridY + this.cellSize * this.gridSize + 40;
    const blockSpacing = (this.canvas.width - 60) / 3;

    // Área dos blocos
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.roundRect(15, blockAreaY - 10, this.canvas.width - 30, 120, 10);
    this.ctx.fill();

    this.availableBlocks.forEach((block, i) => {
      if (block.used) return;

      const blockX = 30 + blockSpacing * i + blockSpacing / 2;
      const blockY = blockAreaY + 50;

      const color = theme.colors[block.colorIndex % theme.colors.length];
      const cellDrawSize = 25;

      // Centralizar bloco
      const blockWidth = block.shape[0].length * cellDrawSize;
      const blockHeight = block.shape.length * cellDrawSize;

      block.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            const x = blockX - blockWidth / 2 + c * cellDrawSize;
            const y = blockY - blockHeight / 2 + r * cellDrawSize;

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.roundRect(x + 1, y + 1, cellDrawSize - 2, cellDrawSize - 2, 3);
            this.ctx.fill();
          }
        });
      });
    });
  }

  drawDraggingBlock() {
    // O bloco é desenhado no mouse/touch position
  }

  drawPlacementPreview() {
    // Preview de onde o bloco será colocado - pode ser implementado
  }

  drawPowerUps() {
    const powerUpY = this.canvas.height - 50;

    this.powerUps.forEach((pu, i) => {
      const x = 40 + i * 80;

      this.ctx.fillStyle = pu.count > 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(100, 100, 100, 0.2)';
      this.ctx.beginPath();
      this.ctx.roundRect(x - 30, powerUpY - 22, 60, 44, 10);
      this.ctx.fill();

      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.globalAlpha = pu.count > 0 ? 1 : 0.4;
      this.ctx.fillText(pu.emoji, x, powerUpY + 8);
      this.ctx.globalAlpha = 1;

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(`${pu.count}`, x + 18, powerUpY + 18);
    });
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;

    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#FF5252';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FIM DE JOGO!', cx, 120);

    this.ctx.font = '32px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`${this.score}`, cx, 180);

    if (this.score >= this.highScore) {
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.fillText('🎉 NOVO RECORDE! 🎉', cx, 220);
    }

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Linhas limpas: ${this.linesCleared}`, cx, 270);
    this.ctx.fillText(`Maior combo: x${this.maxCombo}`, cx, 300);

    // Botões
    const buttons = [
      { text: '🔄 JOGAR NOVAMENTE', y: 350 },
      { text: '🏠 MENU', y: 420 }
    ];

    buttons.forEach(btn => {
      const btnWidth = 280;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(0, 150, 255, 0.7)';
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
    const theme = this.themes.find(t => t.id === this.currentTheme);

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = theme.colors[0];
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛒 LOJA', cx, 40);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 70);

    // Power-ups
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillStyle = theme.colors[1];
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Power-ups', cx, 110);

    this.powerUps.forEach((pu, i) => {
      const y = 120 + i * 75;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 65, 10);
      this.ctx.fill();

      this.ctx.font = '28px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(pu.emoji, 35, y + 42);

      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(pu.name, 75, y + 25);

      this.ctx.font = '13px Arial';
      this.ctx.fillStyle = theme.colors[2];
      this.ctx.fillText(pu.desc, 75, y + 45);
      this.ctx.fillText(`x${pu.count}`, 75, y + 62);

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
    const upgradeStartY = 140 + this.powerUps.length * 75;
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillStyle = theme.colors[1];
    this.ctx.fillText('Upgrades', cx, upgradeStartY - 10);

    this.upgrades.forEach((up, i) => {
      const y = upgradeStartY + i * 70;
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
      this.ctx.fillStyle = theme.colors[2];
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

  drawThemes() {
    const cx = this.canvas.width / 2;
    const theme = this.themes.find(t => t.id === this.currentTheme);

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = theme.colors[0];
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎨 TEMAS', cx, 40);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${this.coins}`, 20, 70);

    // Temas
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 100;

    this.themes.forEach((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = 100 + row * (itemHeight + 10);

      const isSelected = t.id === this.currentTheme;

      this.ctx.fillStyle = t.bgColor;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, itemWidth, itemHeight, 10);
      this.ctx.fill();

      if (isSelected) {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      }

      // Preview de cores
      const previewY = y + 25;
      t.colors.forEach((color, ci) => {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x + 25 + ci * 25, previewY, 10, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Nome
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = t.colors[0];
      this.ctx.textAlign = 'left';
      this.ctx.fillText(t.name, x + 10, y + 60);

      // Status
      if (t.unlocked) {
        if (isSelected) {
          this.ctx.font = '12px Arial';
          this.ctx.fillStyle = '#4CAF50';
          this.ctx.fillText('✓ Ativo', x + 10, y + 80);
        }
      } else {
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`🪙 ${t.price}`, x + 10, y + 80);
      }
    });

    this.drawBackButton();
  }

  drawAchievements() {
    const cx = this.canvas.width / 2;
    const theme = this.themes.find(t => t.id === this.currentTheme);

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = theme.colors[0];
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🏆 CONQUISTAS', cx, 45);

    const unlocked = this.achievements.filter(a => a.unlocked).length;
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = theme.colors[2];
    this.ctx.fillText(`${unlocked}/${this.achievements.length} desbloqueadas`, cx, 70);

    // Conquistas
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 75;

    this.achievements.forEach((ach, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = 100 + row * (itemHeight + 10);

      this.ctx.fillStyle = ach.unlocked ? 'rgba(76, 175, 80, 0.4)' : 'rgba(50, 50, 50, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, itemWidth, itemHeight, 10);
      this.ctx.fill();

      this.ctx.font = '28px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ach.unlocked ? ach.icon : '🔒', x + 30, y + 45);

      this.ctx.font = 'bold 13px Arial';
      this.ctx.fillStyle = ach.unlocked ? '#ffffff' : '#666';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(ach.name, x + 55, y + 30);

      this.ctx.font = '11px Arial';
      this.ctx.fillStyle = ach.unlocked ? theme.colors[2] : '#555';
      this.ctx.fillText(ach.desc, x + 55, y + 50);
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
    const theme = this.themes.find(t => t.id === this.currentTheme);

    this.ctx.font = '80px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(page.emoji, cx, 140);

    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillStyle = theme.colors[0];
    this.ctx.fillText(page.title, cx, 210);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#ffffff';
    page.lines.forEach((line, i) => {
      this.ctx.fillText(line, cx, 270 + i * 35);
    });

    // Indicadores
    const dotY = this.canvas.height - 140;
    for (let i = 0; i < this.tutorialPages.length; i++) {
      this.ctx.fillStyle = i === this.tutorialPage ? theme.colors[0] : '#666';
      this.ctx.beginPath();
      this.ctx.arc(cx - 30 + i * 20, dotY, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Botão
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = cx - btnWidth / 2;
    const btnY = this.canvas.height - 100;

    this.ctx.fillStyle = `${theme.colors[0]}cc`;
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 12);
    this.ctx.fill();

    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#ffffff';
    const text = this.tutorialPage < this.tutorialPages.length - 1 ? 'PRÓXIMO →' : 'COMEÇAR! 🧱';
    this.ctx.fillText(text, cx, btnY + 33);
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
      { id: 'first_clear', condition: this.totalLinesCleared >= 1 },
      { id: 'combo_3', condition: this.maxCombo >= 3 },
      { id: 'combo_5', condition: this.maxCombo >= 5 },
      { id: 'score_5k', condition: this.highScore >= 5000 },
      { id: 'score_10k', condition: this.highScore >= 10000 },
      { id: 'lines_100', condition: this.totalLinesCleared >= 100 },
      { id: 'level_10', condition: this.level >= 10 },
      { id: 'all_themes', condition: this.themes.every(t => t.unlocked) }
    ];

    checks.forEach(check => {
      const ach = this.achievements.find(a => a.id === check.id);
      if (ach && !ach.unlocked && check.condition) {
        ach.unlocked = true;
        this.diamonds += 5;
        this.addNotification(`🏆 ${ach.name}!`, this.canvas.width / 2, this.canvas.height / 2);
      }
    });

    this.saveAchievements();
  }

  save() {
    localStorage.setItem('eai_blockblast_coins', this.coins.toString());
    localStorage.setItem('eai_blockblast_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_blockblast_xp', this.xp.toString());
    localStorage.setItem('eai_blockblast_level', this.level.toString());
  }

  savePowerUps() {
    this.powerUps.forEach(pu => {
      localStorage.setItem(`eai_blockblast_${pu.id}`, pu.count.toString());
    });
  }

  loadUpgrades() {
    const saved = localStorage.getItem('eai_blockblast_upgrades');
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
    localStorage.setItem('eai_blockblast_upgrades', JSON.stringify(data));
  }

  loadThemes() {
    const saved = localStorage.getItem('eai_blockblast_themes');
    if (saved) {
      const unlocked = JSON.parse(saved);
      this.themes.forEach(t => {
        if (unlocked.includes(t.id)) t.unlocked = true;
      });
    }
  }

  saveThemes() {
    const unlocked = this.themes.filter(t => t.unlocked).map(t => t.id);
    localStorage.setItem('eai_blockblast_themes', JSON.stringify(unlocked));
  }

  loadAchievements() {
    const saved = localStorage.getItem('eai_blockblast_achievements');
    if (saved) {
      const unlocked = JSON.parse(saved);
      this.achievements.forEach(a => {
        if (unlocked.includes(a.id)) a.unlocked = true;
      });
    }
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_blockblast_achievements', JSON.stringify(unlocked));
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
  new BlockBlastGame();
});
