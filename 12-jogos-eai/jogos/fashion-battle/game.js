// Fashion Battle EAI - Dress to Impress Style Game
class FashionBattleGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.gameState = 'menu'; // menu, dressing, voting, results
    this.coins = 500;
    this.diamonds = 0;

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_fashionbattle_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      {
        title: 'Bem-vinda ao Fashion Battle!',
        lines: [
          'Vista-se conforme o tema',
          'e compita contra outras jogadoras!',
          '',
          'Mostre seu estilo unico!'
        ],
        emoji: '👗'
      },
      {
        title: 'Como Jogar',
        lines: [
          '1. Voce recebe um TEMA para seguir',
          '2. Escolha roupas, sapatos e acessorios',
          '3. Tem 60 segundos para se vestir!',
          '4. Clique PRONTO quando terminar'
        ],
        emoji: '⏱️'
      },
      {
        title: 'Votacao',
        lines: [
          'Avalie os looks das outras jogadoras',
          'dando de 1 a 5 estrelas',
          '',
          'Quanto mais combinar com o tema,',
          'mais pontos voce ganha!'
        ],
        emoji: '⭐'
      },
      {
        title: 'Loja e Recompensas',
        lines: [
          'Ganhe moedas ao jogar',
          'Compre novas roupas na LOJA',
          '',
          'Desbloqueie estilos unicos!'
        ],
        emoji: '🛍️'
      }
    ];

    this.themes = [
      { name: 'Festa Elegante', emoji: '🎉', colors: ['#e74c3c', '#9b59b6', '#f1c40f'] },
      { name: 'Praia de Verao', emoji: '🏖️', colors: ['#3498db', '#e67e22', '#2ecc71'] },
      { name: 'Gotico Misterioso', emoji: '🦇', colors: ['#2c3e50', '#8e44ad', '#c0392b'] },
      { name: 'Princesa Real', emoji: '👑', colors: ['#f1c40f', '#e91e63', '#9c27b0'] },
      { name: 'Esportista Cool', emoji: '⚽', colors: ['#3498db', '#2ecc71', '#e74c3c'] },
      { name: 'Festa do Pijama', emoji: '🌙', colors: ['#9b59b6', '#3498db', '#e91e63'] },
      { name: 'Arco-Iris', emoji: '🌈', colors: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'] },
      { name: 'Inverno Aconchegante', emoji: '❄️', colors: ['#ecf0f1', '#3498db', '#c0392b'] }
    ];

    this.currentTheme = null;
    this.timeLeft = 60;
    this.timer = null;

    // Character
    this.character = {
      skinColor: '#f5cba7',
      hairStyle: 0,
      hairColor: '#5d4e37',
      top: null,
      bottom: null,
      shoes: null,
      accessory: null
    };

    // Wardrobe
    this.wardrobe = {
      hair: [
        { name: 'Curto', shape: 'short', owned: true },
        { name: 'Longo', shape: 'long', owned: true },
        { name: 'Cacheado', shape: 'curly', owned: true },
        { name: 'Rabo de Cavalo', shape: 'ponytail', owned: false, cost: 100 },
        { name: 'Coque', shape: 'bun', owned: false, cost: 150 },
        { name: 'Trancas', shape: 'braids', owned: false, cost: 200 }
      ],
      hairColors: ['#5d4e37', '#2c3e50', '#f1c40f', '#e74c3c', '#9b59b6', '#3498db', '#27ae60', '#e91e63'],
      skinColors: ['#f5cba7', '#d4a574', '#c68642', '#8d5524', '#6b4423'],
      tops: [
        { name: 'Camiseta', color: '#3498db', owned: true },
        { name: 'Blusa', color: '#e74c3c', owned: true },
        { name: 'Regata', color: '#2ecc71', owned: true },
        { name: 'Vestido Curto', color: '#9b59b6', owned: true },
        { name: 'Cropped', color: '#f1c40f', owned: false, cost: 100 },
        { name: 'Moletom', color: '#95a5a6', owned: false, cost: 120 },
        { name: 'Vestido Longo', color: '#e91e63', owned: false, cost: 200 },
        { name: 'Blazer', color: '#2c3e50', owned: false, cost: 250 }
      ],
      bottoms: [
        { name: 'Calca Jeans', color: '#3498db', owned: true },
        { name: 'Saia', color: '#e74c3c', owned: true },
        { name: 'Shorts', color: '#2ecc71', owned: true },
        { name: 'Legging', color: '#2c3e50', owned: true },
        { name: 'Saia Longa', color: '#9b59b6', owned: false, cost: 100 },
        { name: 'Calca Social', color: '#34495e', owned: false, cost: 150 }
      ],
      shoes: [
        { name: 'Tenis', color: '#ecf0f1', owned: true },
        { name: 'Sandalias', color: '#e67e22', owned: true },
        { name: 'Botas', color: '#2c3e50', owned: true },
        { name: 'Salto Alto', color: '#e74c3c', owned: false, cost: 150 },
        { name: 'Chinelos', color: '#3498db', owned: false, cost: 50 }
      ],
      accessories: [
        { name: 'Nenhum', color: null, owned: true },
        { name: 'Oculos de Sol', color: '#2c3e50', type: 'glasses', owned: true },
        { name: 'Colar', color: '#f1c40f', type: 'necklace', owned: true },
        { name: 'Chapeu', color: '#e74c3c', type: 'hat', owned: false, cost: 100 },
        { name: 'Tiara', color: '#f1c40f', type: 'tiara', owned: false, cost: 150 },
        { name: 'Brincos', color: '#f1c40f', type: 'earrings', owned: false, cost: 80 }
      ]
    };

    // NPCs for voting
    this.npcs = [];
    this.playerScore = 0;
    this.votingRound = 0;

    // UI
    this.selectedCategory = 'tops';
    this.scrollOffset = 0;

    this.setupControls();
    this.loadProgress();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupControls() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleClick(e.touches[0].clientX, e.touches[0].clientY);
    });
  }

  handleClick(x, y) {
    // Tutorial handling
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

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
    } else if (this.gameState === 'dressing') {
      this.handleDressingClick(x, y);
    } else if (this.gameState === 'voting') {
      this.handleVotingClick(x, y);
    } else if (this.gameState === 'results') {
      // Back to menu
      if (x > centerX - 80 && x < centerX + 80 && y > centerY + 100 && y < centerY + 150) {
        this.gameState = 'menu';
      }
    } else if (this.gameState === 'shop') {
      this.handleShopClick(x, y);
    }
  }

  handleDressingClick(x, y) {
    const centerX = this.canvas.width / 2;

    // Category tabs
    const categories = ['hair', 'tops', 'bottoms', 'shoes', 'accessories'];
    const tabWidth = 70;
    const tabsStartX = centerX - (categories.length * tabWidth) / 2;
    const tabY = 80;

    categories.forEach((cat, i) => {
      const tx = tabsStartX + i * tabWidth + tabWidth / 2;
      if (x > tx - 30 && x < tx + 30 && y > tabY - 15 && y < tabY + 15) {
        this.selectedCategory = cat;
      }
    });

    // Item selection
    const itemsStartY = 120;
    const itemHeight = 50;
    const items = this.getItemsForCategory(this.selectedCategory);

    items.forEach((item, i) => {
      const iy = itemsStartY + i * itemHeight + 25;
      if (x > 20 && x < 180 && y > iy - 20 && y < iy + 20) {
        if (item.owned !== false) {
          this.selectItem(this.selectedCategory, i);
        }
      }
    });

    // Color selection for hair
    if (this.selectedCategory === 'hair') {
      const colorsY = this.canvas.height - 150;
      this.wardrobe.hairColors.forEach((color, i) => {
        const cx = 40 + i * 35;
        if (x > cx - 15 && x < cx + 15 && y > colorsY - 15 && y < colorsY + 15) {
          this.character.hairColor = color;
        }
      });
    }

    // Done button
    if (x > centerX + 100 && x < centerX + 200 && y > this.canvas.height - 80 && y < this.canvas.height - 30) {
      this.finishDressing();
    }
  }

  handleVotingClick(x, y) {
    const centerX = this.canvas.width / 2;

    // Star rating
    const starY = this.canvas.height - 100;
    for (let i = 1; i <= 5; i++) {
      const sx = centerX - 100 + i * 40;
      if (x > sx - 20 && x < sx + 20 && y > starY - 20 && y < starY + 20) {
        this.submitVote(i);
      }
    }
  }

  handleShopClick(x, y) {
    // Back button
    if (x > 20 && x < 100 && y > 20 && y < 60) {
      this.gameState = 'menu';
      return;
    }

    // Buy items
    const itemHeight = 60;
    const startY = 100;

    let idx = 0;
    ['tops', 'bottoms', 'shoes', 'accessories', 'hair'].forEach(category => {
      const items = this.wardrobe[category] || [];
      items.forEach((item, i) => {
        if (!item.owned && item.cost) {
          const iy = startY + idx * itemHeight;
          if (y > iy && y < iy + itemHeight && x > this.canvas.width - 100) {
            if (this.coins >= item.cost) {
              this.coins -= item.cost;
              item.owned = true;
              this.saveProgress();
            }
          }
          idx++;
        }
      });
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
        localStorage.setItem('eai_fashionbattle_tutorial_seen', 'true');
      }
    }

    // Skip button
    if (x > centerX - 50 && x < centerX + 50 && y > btnY + 40 && y < btnY + 70) {
      this.showTutorial = false;
      localStorage.setItem('eai_fashionbattle_tutorial_seen', 'true');
    }
  }

  getItemsForCategory(category) {
    if (category === 'hair') {
      return this.wardrobe.hair;
    }
    return this.wardrobe[category] || [];
  }

  selectItem(category, index) {
    if (category === 'hair') {
      this.character.hairStyle = index;
    } else if (category === 'tops') {
      this.character.top = index;
    } else if (category === 'bottoms') {
      this.character.bottom = index;
    } else if (category === 'shoes') {
      this.character.shoes = index;
    } else if (category === 'accessories') {
      this.character.accessory = index;
    }
  }

  startGame() {
    // Random theme
    this.currentTheme = this.themes[Math.floor(Math.random() * this.themes.length)];
    this.timeLeft = 60;
    this.gameState = 'dressing';

    // Reset character
    this.character.top = 0;
    this.character.bottom = 0;
    this.character.shoes = 0;
    this.character.accessory = 0;

    // Start timer
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.finishDressing();
      }
    }, 1000);
  }

  finishDressing() {
    if (this.timer) clearInterval(this.timer);
    this.generateNPCs();
    this.votingRound = 0;
    this.playerScore = 0;
    this.gameState = 'voting';
  }

  generateNPCs() {
    this.npcs = [];
    for (let i = 0; i < 3; i++) {
      this.npcs.push({
        hairStyle: Math.floor(Math.random() * 3),
        hairColor: this.wardrobe.hairColors[Math.floor(Math.random() * this.wardrobe.hairColors.length)],
        skinColor: this.wardrobe.skinColors[Math.floor(Math.random() * this.wardrobe.skinColors.length)],
        top: Math.floor(Math.random() * 4),
        bottom: Math.floor(Math.random() * 4),
        shoes: Math.floor(Math.random() * 3),
        accessory: Math.floor(Math.random() * 3),
        score: 0
      });
    }
  }

  submitVote(stars) {
    if (this.votingRound < this.npcs.length) {
      this.npcs[this.votingRound].score = stars;
      this.votingRound++;
    }

    if (this.votingRound >= this.npcs.length) {
      // Calculate player score based on theme matching
      this.calculatePlayerScore();
      this.gameState = 'results';
      this.giveRewards();
    }
  }

  calculatePlayerScore() {
    // Base score
    let score = 3;

    // Check if colors match theme
    const themeColors = this.currentTheme.colors;
    const playerColors = [];

    if (this.character.top !== null) {
      playerColors.push(this.wardrobe.tops[this.character.top].color);
    }
    if (this.character.bottom !== null) {
      playerColors.push(this.wardrobe.bottoms[this.character.bottom].color);
    }

    // Bonus for matching theme colors
    playerColors.forEach(color => {
      if (themeColors.includes(color)) {
        score += 0.5;
      }
    });

    // Add some randomness
    score += (Math.random() - 0.5);

    this.playerScore = Math.min(5, Math.max(1, Math.round(score)));
  }

  giveRewards() {
    const reward = this.playerScore * 20;
    this.coins += reward;
    this.saveProgress();
  }

  update(deltaTime) {
    // Animations if needed
  }

  draw() {
    // Background
    this.ctx.fillStyle = '#fce4ec';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.gameState) {
      case 'menu':
        this.drawMenu();
        break;
      case 'dressing':
        this.drawDressing();
        break;
      case 'voting':
        this.drawVoting();
        break;
      case 'results':
        this.drawResults();
        break;
      case 'shop':
        this.drawShop();
        break;
    }
  }

  drawTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    // Overlay
    ctx.fillStyle = 'rgba(233, 30, 99, 0.95)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Box
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 4;
    const boxWidth = Math.min(350, this.canvas.width - 40);
    ctx.fillRect(centerX - boxWidth/2, centerY - 130, boxWidth, 280);
    ctx.strokeRect(centerX - boxWidth/2, centerY - 130, boxWidth, 280);

    // Emoji
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 70);

    // Title
    ctx.fillStyle = '#e91e63';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 20);

    // Lines
    ctx.fillStyle = '#333';
    ctx.font = '15px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 15 + i * 22);
    });

    // Page indicator
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 105);

    // Next button
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(centerX - 60, centerY + 110, 120, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    const btnText = this.tutorialPage < this.tutorialPages.length - 1 ? 'Proximo' : 'Jogar!';
    ctx.fillText(btnText, centerX, centerY + 135);

    // Skip button
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Pular tutorial', centerX, centerY + 170);
  }

  drawMenu() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Title
    this.ctx.fillStyle = '#e91e63';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FASHION BATTLE', centerX, 100);

    // Subtitle
    this.ctx.fillStyle = '#9c27b0';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Vista-se e compete!', centerX, 140);

    // Character preview
    this.drawCharacter(centerX, centerY - 30, 1.5, this.character);

    // Coins
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(`🪙 ${this.coins}`, centerX, 200);

    // Play button
    this.ctx.fillStyle = '#e91e63';
    this.ctx.fillRect(centerX - 80, centerY + 50, 160, 50);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('JOGAR', centerX, centerY + 82);

    // Shop button
    this.ctx.fillStyle = '#9c27b0';
    this.ctx.fillRect(centerX - 80, centerY + 120, 160, 50);
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText('LOJA', centerX, centerY + 152);
  }

  drawDressing() {
    const centerX = this.canvas.width / 2;

    // Theme banner
    this.ctx.fillStyle = '#e91e63';
    this.ctx.fillRect(0, 0, this.canvas.width, 50);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Tema: ${this.currentTheme.emoji} ${this.currentTheme.name}`, centerX, 32);

    // Timer
    this.ctx.fillStyle = this.timeLeft <= 10 ? '#e74c3c' : '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${this.timeLeft}s`, this.canvas.width - 20, 35);

    // Category tabs
    const categories = ['hair', 'tops', 'bottoms', 'shoes', 'accessories'];
    const categoryNames = ['Cabelo', 'Roupas', 'Calcas', 'Sapatos', 'Acessorios'];
    const tabWidth = 70;
    const tabsStartX = centerX - (categories.length * tabWidth) / 2;
    const tabY = 80;

    categories.forEach((cat, i) => {
      const tx = tabsStartX + i * tabWidth + tabWidth / 2;
      this.ctx.fillStyle = this.selectedCategory === cat ? '#e91e63' : '#ccc';
      this.ctx.fillRect(tx - 30, tabY - 15, 60, 30);
      this.ctx.fillStyle = this.selectedCategory === cat ? '#fff' : '#333';
      this.ctx.font = '11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(categoryNames[i], tx, tabY + 4);
    });

    // Items list
    const items = this.getItemsForCategory(this.selectedCategory);
    const itemsStartY = 120;
    const itemHeight = 50;

    items.forEach((item, i) => {
      const iy = itemsStartY + i * itemHeight;
      const isSelected = this.isItemSelected(this.selectedCategory, i);

      this.ctx.fillStyle = isSelected ? '#e91e63' : (item.owned !== false ? '#fff' : '#ddd');
      this.ctx.fillRect(20, iy, 160, 45);
      this.ctx.strokeStyle = isSelected ? '#c2185b' : '#ccc';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(20, iy, 160, 45);

      // Color preview
      if (item.color) {
        this.ctx.fillStyle = item.color;
        this.ctx.fillRect(30, iy + 10, 25, 25);
      }

      // Name
      this.ctx.fillStyle = item.owned !== false ? '#333' : '#999';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.name, 65, iy + 28);

      if (item.owned === false) {
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`🔒 ${item.cost}`, 140, iy + 28);
      }
    });

    // Hair colors
    if (this.selectedCategory === 'hair') {
      const colorsY = this.canvas.height - 150;
      this.ctx.fillStyle = '#333';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('Cor do cabelo:', 20, colorsY - 30);

      this.wardrobe.hairColors.forEach((color, i) => {
        const cx = 40 + i * 35;
        this.ctx.beginPath();
        this.ctx.arc(cx, colorsY, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        if (this.character.hairColor === color) {
          this.ctx.strokeStyle = '#e91e63';
          this.ctx.lineWidth = 3;
          this.ctx.stroke();
        }
      });
    }

    // Character preview
    const charX = this.canvas.width - 120;
    const charY = this.canvas.height / 2;
    this.drawCharacter(charX, charY, 1.8, this.character);

    // Done button
    this.ctx.fillStyle = '#4caf50';
    this.ctx.fillRect(centerX + 100, this.canvas.height - 80, 100, 50);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PRONTO!', centerX + 150, this.canvas.height - 48);
  }

  drawVoting() {
    const centerX = this.canvas.width / 2;

    // Title
    this.ctx.fillStyle = '#e91e63';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('VOTACAO', centerX, 50);

    this.ctx.fillStyle = '#666';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Avalie o look ${this.votingRound + 1}/${this.npcs.length}`, centerX, 80);

    // NPC being voted
    if (this.votingRound < this.npcs.length) {
      const npc = this.npcs[this.votingRound];
      this.drawCharacter(centerX, this.canvas.height / 2 - 50, 2, npc);

      // Star rating
      const starY = this.canvas.height - 100;
      this.ctx.font = '40px Arial';
      for (let i = 1; i <= 5; i++) {
        const sx = centerX - 100 + i * 40;
        this.ctx.fillText('⭐', sx - 15, starY + 10);
      }

      this.ctx.fillStyle = '#333';
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Toque nas estrelas para votar', centerX, this.canvas.height - 40);
    }
  }

  drawResults() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Title
    this.ctx.fillStyle = '#e91e63';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('RESULTADOS', centerX, 80);

    // Theme reminder
    this.ctx.fillStyle = '#666';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Tema: ${this.currentTheme.emoji} ${this.currentTheme.name}`, centerX, 110);

    // Player result
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('Voce:', centerX, 160);

    // Stars
    let starStr = '';
    for (let i = 0; i < this.playerScore; i++) starStr += '⭐';
    this.ctx.font = '30px Arial';
    this.ctx.fillText(starStr, centerX, 200);

    // Coins earned
    const reward = this.playerScore * 20;
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(`+${reward} 🪙`, centerX, 250);

    // Position
    let position = 1;
    this.npcs.forEach(npc => {
      if (npc.score > this.playerScore) position++;
    });

    this.ctx.fillStyle = position === 1 ? '#f1c40f' : '#333';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillText(`${position}º Lugar!`, centerX, 300);

    // Menu button
    this.ctx.fillStyle = '#e91e63';
    this.ctx.fillRect(centerX - 80, centerY + 100, 160, 50);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('MENU', centerX, centerY + 132);
  }

  drawShop() {
    // Back button
    this.ctx.fillStyle = '#e91e63';
    this.ctx.fillRect(20, 20, 80, 40);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Voltar', 60, 45);

    // Title
    this.ctx.fillStyle = '#e91e63';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillText('LOJA', this.canvas.width / 2, 50);

    // Coins
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`🪙 ${this.coins}`, this.canvas.width - 20, 45);

    // Items for sale
    const itemHeight = 60;
    const startY = 100;
    let idx = 0;

    this.ctx.textAlign = 'left';
    ['tops', 'bottoms', 'shoes', 'accessories', 'hair'].forEach(category => {
      const items = this.wardrobe[category] || [];
      items.forEach((item, i) => {
        if (!item.owned && item.cost) {
          const y = startY + idx * itemHeight;

          this.ctx.fillStyle = '#fff';
          this.ctx.fillRect(20, y, this.canvas.width - 40, 55);
          this.ctx.strokeStyle = '#ddd';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(20, y, this.canvas.width - 40, 55);

          // Color preview
          if (item.color) {
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(30, y + 10, 35, 35);
          }

          // Name
          this.ctx.fillStyle = '#333';
          this.ctx.font = '16px Arial';
          this.ctx.fillText(item.name, 80, y + 35);

          // Buy button
          this.ctx.fillStyle = this.coins >= item.cost ? '#4caf50' : '#ccc';
          this.ctx.fillRect(this.canvas.width - 100, y + 10, 70, 35);
          this.ctx.fillStyle = '#fff';
          this.ctx.font = 'bold 14px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(`🪙${item.cost}`, this.canvas.width - 65, y + 33);
          this.ctx.textAlign = 'left';

          idx++;
        }
      });
    });

    if (idx === 0) {
      this.ctx.fillStyle = '#666';
      this.ctx.font = '18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Voce ja tem tudo!', this.canvas.width / 2, 200);
    }
  }

  isItemSelected(category, index) {
    switch (category) {
      case 'hair': return this.character.hairStyle === index;
      case 'tops': return this.character.top === index;
      case 'bottoms': return this.character.bottom === index;
      case 'shoes': return this.character.shoes === index;
      case 'accessories': return this.character.accessory === index;
    }
    return false;
  }

  drawCharacter(x, y, scale, char) {
    const s = scale;

    // Shadow
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 50 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this.ctx.fill();

    // Legs
    this.ctx.fillStyle = char.skinColor || this.character.skinColor;
    this.ctx.fillRect(x - 12 * s, y + 20 * s, 8 * s, 30 * s);
    this.ctx.fillRect(x + 4 * s, y + 20 * s, 8 * s, 30 * s);

    // Shoes
    if (char.shoes !== null && char.shoes !== undefined) {
      const shoe = this.wardrobe.shoes[char.shoes];
      if (shoe) {
        this.ctx.fillStyle = shoe.color;
        this.ctx.fillRect(x - 14 * s, y + 45 * s, 12 * s, 8 * s);
        this.ctx.fillRect(x + 2 * s, y + 45 * s, 12 * s, 8 * s);
      }
    }

    // Bottom (pants/skirt)
    if (char.bottom !== null && char.bottom !== undefined) {
      const bottom = this.wardrobe.bottoms[char.bottom];
      if (bottom) {
        this.ctx.fillStyle = bottom.color;
        if (bottom.name.includes('Saia')) {
          // Skirt
          this.ctx.beginPath();
          this.ctx.moveTo(x - 15 * s, y + 5 * s);
          this.ctx.lineTo(x + 15 * s, y + 5 * s);
          this.ctx.lineTo(x + 20 * s, y + 30 * s);
          this.ctx.lineTo(x - 20 * s, y + 30 * s);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          // Pants
          this.ctx.fillRect(x - 15 * s, y + 5 * s, 30 * s, 20 * s);
          this.ctx.fillRect(x - 14 * s, y + 20 * s, 10 * s, 25 * s);
          this.ctx.fillRect(x + 4 * s, y + 20 * s, 10 * s, 25 * s);
        }
      }
    }

    // Body/Top
    if (char.top !== null && char.top !== undefined) {
      const top = this.wardrobe.tops[char.top];
      if (top) {
        this.ctx.fillStyle = top.color;
        if (top.name.includes('Vestido')) {
          // Dress
          this.ctx.beginPath();
          this.ctx.moveTo(x - 18 * s, y - 25 * s);
          this.ctx.lineTo(x + 18 * s, y - 25 * s);
          this.ctx.lineTo(x + 25 * s, y + 35 * s);
          this.ctx.lineTo(x - 25 * s, y + 35 * s);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          // Regular top
          this.ctx.fillRect(x - 18 * s, y - 25 * s, 36 * s, 35 * s);
        }
      }
    }

    // Arms
    this.ctx.fillStyle = char.skinColor || this.character.skinColor;
    this.ctx.fillRect(x - 25 * s, y - 20 * s, 8 * s, 25 * s);
    this.ctx.fillRect(x + 17 * s, y - 20 * s, 8 * s, 25 * s);

    // Head
    this.ctx.beginPath();
    this.ctx.arc(x, y - 40 * s, 18 * s, 0, Math.PI * 2);
    this.ctx.fillStyle = char.skinColor || this.character.skinColor;
    this.ctx.fill();

    // Hair
    const hairStyle = char.hairStyle !== undefined ? char.hairStyle : this.character.hairStyle;
    const hairColor = char.hairColor || this.character.hairColor;
    this.ctx.fillStyle = hairColor;

    if (hairStyle === 0) {
      // Short
      this.ctx.beginPath();
      this.ctx.arc(x, y - 45 * s, 16 * s, Math.PI, 0);
      this.ctx.fill();
    } else if (hairStyle === 1) {
      // Long
      this.ctx.beginPath();
      this.ctx.arc(x, y - 45 * s, 16 * s, Math.PI, 0);
      this.ctx.fill();
      this.ctx.fillRect(x - 18 * s, y - 45 * s, 8 * s, 40 * s);
      this.ctx.fillRect(x + 10 * s, y - 45 * s, 8 * s, 40 * s);
    } else if (hairStyle === 2) {
      // Curly
      for (let i = 0; i < 8; i++) {
        const angle = Math.PI + (i / 7) * Math.PI;
        const hx = x + Math.cos(angle) * 16 * s;
        const hy = y - 45 * s + Math.sin(angle) * 16 * s;
        this.ctx.beginPath();
        this.ctx.arc(hx, hy, 6 * s, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Face
    this.ctx.fillStyle = '#333';
    this.ctx.beginPath();
    this.ctx.arc(x - 6 * s, y - 42 * s, 2 * s, 0, Math.PI * 2);
    this.ctx.arc(x + 6 * s, y - 42 * s, 2 * s, 0, Math.PI * 2);
    this.ctx.fill();

    // Smile
    this.ctx.beginPath();
    this.ctx.arc(x, y - 35 * s, 5 * s, 0, Math.PI);
    this.ctx.stroke();

    // Accessory
    if (char.accessory !== null && char.accessory !== undefined && char.accessory > 0) {
      const acc = this.wardrobe.accessories[char.accessory];
      if (acc && acc.type) {
        this.ctx.fillStyle = acc.color;
        if (acc.type === 'glasses') {
          this.ctx.strokeStyle = acc.color;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x - 12 * s, y - 45 * s, 8 * s, 6 * s);
          this.ctx.strokeRect(x + 4 * s, y - 45 * s, 8 * s, 6 * s);
          this.ctx.beginPath();
          this.ctx.moveTo(x - 4 * s, y - 42 * s);
          this.ctx.lineTo(x + 4 * s, y - 42 * s);
          this.ctx.stroke();
        } else if (acc.type === 'necklace') {
          this.ctx.beginPath();
          this.ctx.arc(x, y - 22 * s, 4 * s, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (acc.type === 'hat') {
          this.ctx.fillRect(x - 20 * s, y - 58 * s, 40 * s, 5 * s);
          this.ctx.fillRect(x - 12 * s, y - 70 * s, 24 * s, 15 * s);
        } else if (acc.type === 'tiara') {
          this.ctx.beginPath();
          this.ctx.moveTo(x - 10 * s, y - 55 * s);
          this.ctx.lineTo(x, y - 65 * s);
          this.ctx.lineTo(x + 10 * s, y - 55 * s);
          this.ctx.closePath();
          this.ctx.fill();
        }
      }
    }
  }

  saveProgress() {
    localStorage.setItem('fashionBattle_coins', this.coins);

    // Save owned items
    ['tops', 'bottoms', 'shoes', 'accessories', 'hair'].forEach(category => {
      const items = this.wardrobe[category] || [];
      const owned = items.map((item, i) => item.owned !== false);
      localStorage.setItem(`fashionBattle_owned_${category}`, JSON.stringify(owned));
    });
  }

  loadProgress() {
    this.coins = parseInt(localStorage.getItem('fashionBattle_coins') || '500');

    ['tops', 'bottoms', 'shoes', 'accessories', 'hair'].forEach(category => {
      const saved = localStorage.getItem(`fashionBattle_owned_${category}`);
      if (saved) {
        const owned = JSON.parse(saved);
        const items = this.wardrobe[category] || [];
        owned.forEach((isOwned, i) => {
          if (items[i]) items[i].owned = isOwned;
        });
      }
    });
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
  new FashionBattleGame();
});
