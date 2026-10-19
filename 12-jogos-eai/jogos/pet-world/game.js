// Pet World Paradise - Simulador de Pets Avançado
class PetWorldGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_petworld_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Pet World!', lines: ['Cuide de pets adoraveis!', 'Alimente, brinque e ame!', '', 'Colecione todos os pets!'], emoji: '🐾' },
      { title: 'Como Cuidar', lines: ['1. Toque no pet para carinho', '2. Use botoes para alimentar', '3. Mantenha felicidade alta!', '4. Ganhe moedas cuidando bem'], emoji: '❤️' },
      { title: 'Loja de Pets', lines: ['Compre novos pets na loja!', 'Cada pet e unico e especial', '', 'Desbloqueie pets raros!'], emoji: '🏪' },
      { title: 'Evolucao', lines: ['Pets evoluem com amor!', 'Nivel maximo: 100', 'Pets evoluidos dao mais moedas', 'Boa sorte!'], emoji: '⭐' }
    ];

    // Currencies
    this.coins = parseInt(localStorage.getItem('petworld_coins') || '100');
    this.diamonds = parseInt(localStorage.getItem('petworld_diamonds') || '5');
    this.xp = parseInt(localStorage.getItem('petworld_xp') || '0');
    this.level = parseInt(localStorage.getItem('petworld_level') || '1');

    // Pet types with rarity
    this.petTypes = [
      { id: 'dog', name: 'Cachorro', emoji: '🐕', cost: 0, rarity: 'comum', baseHappiness: 100 },
      { id: 'cat', name: 'Gato', emoji: '🐱', cost: 50, rarity: 'comum', baseHappiness: 90 },
      { id: 'rabbit', name: 'Coelho', emoji: '🐰', cost: 100, rarity: 'comum', baseHappiness: 95 },
      { id: 'hamster', name: 'Hamster', emoji: '🐹', cost: 150, rarity: 'comum', baseHappiness: 85 },
      { id: 'bird', name: 'Passaro', emoji: '🐦', cost: 200, rarity: 'incomum', baseHappiness: 80 },
      { id: 'turtle', name: 'Tartaruga', emoji: '🐢', cost: 300, rarity: 'incomum', baseHappiness: 100 },
      { id: 'fish', name: 'Peixe', emoji: '🐠', cost: 250, rarity: 'incomum', baseHappiness: 75 },
      { id: 'fox', name: 'Raposa', emoji: '🦊', cost: 500, rarity: 'raro', baseHappiness: 85 },
      { id: 'panda', name: 'Panda', emoji: '🐼', cost: 800, rarity: 'raro', baseHappiness: 90 },
      { id: 'unicorn', name: 'Unicornio', emoji: '🦄', cost: 1500, rarity: 'epico', baseHappiness: 100 },
      { id: 'dragon', name: 'Dragao', emoji: '🐉', cost: 3000, rarity: 'lendario', baseHappiness: 95 },
      { id: 'phoenix', name: 'Fenix', emoji: '🔥', cost: 5000, rarity: 'mitico', baseHappiness: 100 }
    ];

    // Items
    this.items = [
      { id: 'food', name: 'Racao', emoji: '🍖', cost: 10, effect: 'hunger', value: 30 },
      { id: 'treat', name: 'Petisco', emoji: '🦴', cost: 20, effect: 'happiness', value: 20 },
      { id: 'toy', name: 'Brinquedo', emoji: '🎾', cost: 50, effect: 'happiness', value: 40 },
      { id: 'bed', name: 'Caminha', emoji: '🛏️', cost: 100, effect: 'energy', value: 50 },
      { id: 'medicine', name: 'Remedio', emoji: '💊', cost: 30, effect: 'health', value: 40 },
      { id: 'brush', name: 'Escova', emoji: '🪥', cost: 40, effect: 'hygiene', value: 35 },
      { id: 'crown', name: 'Coroa', emoji: '👑', cost: 500, effect: 'happiness', value: 100 },
      { id: 'magic', name: 'Pocao Magica', emoji: '🧪', cost: 1000, effect: 'all', value: 50 }
    ];

    // Achievements
    this.achievements = [
      { id: 'first_pet', name: 'Primeiro Amigo', desc: 'Adote seu primeiro pet', reward: 50, unlocked: false },
      { id: 'collector_5', name: 'Colecionador', desc: 'Tenha 5 pets', reward: 100, unlocked: false },
      { id: 'collector_10', name: 'Grande Familia', desc: 'Tenha 10 pets', reward: 300, unlocked: false },
      { id: 'level_10', name: 'Cuidador Iniciante', desc: 'Alcance nivel 10', reward: 200, unlocked: false },
      { id: 'level_25', name: 'Cuidador Expert', desc: 'Alcance nivel 25', reward: 500, unlocked: false },
      { id: 'level_50', name: 'Mestre dos Pets', desc: 'Alcance nivel 50', reward: 1000, unlocked: false },
      { id: 'rare_pet', name: 'Descobridor Raro', desc: 'Tenha um pet raro', reward: 150, unlocked: false },
      { id: 'epic_pet', name: 'Lenda Viva', desc: 'Tenha um pet epico', reward: 500, unlocked: false },
      { id: 'max_happiness', name: 'Amor Infinito', desc: 'Pet com 100% felicidade', reward: 100, unlocked: false },
      { id: 'rich', name: 'Milionario', desc: 'Acumule 10000 moedas', reward: 1000, unlocked: false }
    ];

    // Load saved data
    this.loadProgress();

    // Game state
    this.gameState = 'home'; // home, pet, shop, inventory, achievements
    this.selectedPet = 0;
    this.particles = [];
    this.notifications = [];

    // Animation
    this.animationTime = 0;
    this.petBounce = 0;

    this.setupControls();
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
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    if (this.gameState === 'home') {
      this.handleHomeClick(x, y);
    } else if (this.gameState === 'pet') {
      this.handlePetClick(x, y);
    } else if (this.gameState === 'shop') {
      this.handleShopClick(x, y);
    } else if (this.gameState === 'achievements') {
      this.handleAchievementsClick(x, y);
    }
  }

  handleTutorialClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    if (x > centerX - 60 && x < centerX + 60 && y > centerY + 100 && y < centerY + 140) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_petworld_tutorial_seen', 'true');
      }
    }
    if (x > centerX - 40 && x < centerX + 40 && y > centerY + 150 && y < centerY + 180) {
      this.showTutorial = false;
      localStorage.setItem('eai_petworld_tutorial_seen', 'true');
    }
  }

  handleHomeClick(x, y) {
    const centerX = this.canvas.width / 2;

    // Pet cards
    const cardWidth = 100;
    const cardsPerRow = Math.floor((this.canvas.width - 40) / (cardWidth + 10));
    const startX = (this.canvas.width - cardsPerRow * (cardWidth + 10)) / 2;
    const startY = 150;

    this.pets.forEach((pet, i) => {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      const cx = startX + col * (cardWidth + 10) + cardWidth / 2;
      const cy = startY + row * 120 + 50;

      if (x > cx - 50 && x < cx + 50 && y > cy - 50 && y < cy + 50) {
        this.selectedPet = i;
        this.gameState = 'pet';
      }
    });

    // Bottom buttons
    const btnY = this.canvas.height - 60;
    const btnWidth = 80;
    const btns = ['Loja', 'Conquistas'];
    btns.forEach((btn, i) => {
      const bx = centerX - 100 + i * 200;
      if (x > bx - btnWidth/2 && x < bx + btnWidth/2 && y > btnY - 25 && y < btnY + 25) {
        if (i === 0) this.gameState = 'shop';
        else this.gameState = 'achievements';
      }
    });
  }

  handlePetClick(x, y) {
    const centerX = this.canvas.width / 2;
    const pet = this.pets[this.selectedPet];

    // Back button
    if (x > 20 && x < 100 && y > 20 && y < 60) {
      this.gameState = 'home';
      return;
    }

    // Pet interaction (center)
    if (x > centerX - 80 && x < centerX + 80 && y > 200 && y < 360) {
      this.petPet(pet);
    }

    // Action buttons
    const btnY = this.canvas.height - 150;
    const actions = [
      { emoji: '🍖', action: 'feed' },
      { emoji: '🎾', action: 'play' },
      { emoji: '🛁', action: 'clean' },
      { emoji: '💤', action: 'sleep' }
    ];

    actions.forEach((act, i) => {
      const bx = centerX - 150 + i * 100;
      if (x > bx - 35 && x < bx + 35 && y > btnY - 35 && y < btnY + 35) {
        this.performAction(pet, act.action);
      }
    });
  }

  handleShopClick(x, y) {
    // Back button
    if (x > 20 && x < 100 && y > 20 && y < 60) {
      this.gameState = 'home';
      return;
    }

    // Pet shop items
    const itemWidth = 90;
    const startY = 120;
    const itemsPerRow = Math.floor((this.canvas.width - 40) / (itemWidth + 10));
    const startX = (this.canvas.width - itemsPerRow * (itemWidth + 10)) / 2;

    this.petTypes.forEach((type, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const ix = startX + col * (itemWidth + 10) + itemWidth / 2;
      const iy = startY + row * 110 + 45;

      if (x > ix - 40 && x < ix + 40 && y > iy - 40 && y < iy + 60) {
        if (type.cost === 0 || this.coins >= type.cost) {
          this.buyPet(type);
        }
      }
    });
  }

  handleAchievementsClick(x, y) {
    // Back button
    if (x > 20 && x < 100 && y > 20 && y < 60) {
      this.gameState = 'home';
      return;
    }
  }

  petPet(pet) {
    pet.happiness = Math.min(100, pet.happiness + 5);
    pet.love = Math.min(100, pet.love + 2);
    this.addXP(5);
    this.createHeartParticles();
    this.petBounce = 10;
    this.saveProgress();
  }

  performAction(pet, action) {
    switch (action) {
      case 'feed':
        if (this.coins >= 5) {
          this.coins -= 5;
          pet.hunger = Math.min(100, pet.hunger + 30);
          pet.happiness = Math.min(100, pet.happiness + 10);
          this.addXP(10);
          this.addNotification('Que delicia! +30 Fome');
        }
        break;
      case 'play':
        if (pet.energy >= 20) {
          pet.energy -= 20;
          pet.happiness = Math.min(100, pet.happiness + 25);
          pet.love = Math.min(100, pet.love + 5);
          this.addXP(15);
          this.addNotification('Que divertido! +25 Felicidade');
        }
        break;
      case 'clean':
        if (this.coins >= 3) {
          this.coins -= 3;
          pet.hygiene = Math.min(100, pet.hygiene + 40);
          this.addXP(8);
          this.addNotification('Limpinho! +40 Higiene');
        }
        break;
      case 'sleep':
        pet.energy = Math.min(100, pet.energy + 40);
        this.addXP(5);
        this.addNotification('Descansando... +40 Energia');
        break;
    }
    this.saveProgress();
  }

  buyPet(type) {
    if (type.cost > 0 && this.coins < type.cost) return;

    if (type.cost > 0) {
      this.coins -= type.cost;
    }

    const newPet = {
      type: type.id,
      name: type.name,
      emoji: type.emoji,
      level: 1,
      xp: 0,
      happiness: type.baseHappiness,
      hunger: 70,
      energy: 100,
      hygiene: 100,
      health: 100,
      love: 0,
      rarity: type.rarity
    };

    this.pets.push(newPet);
    this.addXP(50);
    this.addNotification(`Novo pet: ${type.name}!`);
    this.checkAchievements();
    this.saveProgress();
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.coins += this.level * 10;
      this.addNotification(`Level Up! Nivel ${this.level}`);
      this.checkAchievements();
    }
  }

  addNotification(text) {
    this.notifications.push({
      text,
      y: this.canvas.height / 2,
      alpha: 1,
      life: 2000
    });
  }

  createHeartParticles() {
    const centerX = this.canvas.width / 2;
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 100,
        y: 280,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 2,
        emoji: '❤️',
        life: 1000,
        scale: 0.5 + Math.random() * 0.5
      });
    }
  }

  checkAchievements() {
    const checks = [
      { id: 'first_pet', condition: this.pets.length >= 1 },
      { id: 'collector_5', condition: this.pets.length >= 5 },
      { id: 'collector_10', condition: this.pets.length >= 10 },
      { id: 'level_10', condition: this.level >= 10 },
      { id: 'level_25', condition: this.level >= 25 },
      { id: 'level_50', condition: this.level >= 50 },
      { id: 'rare_pet', condition: this.pets.some(p => ['raro', 'epico', 'lendario', 'mitico'].includes(p.rarity)) },
      { id: 'epic_pet', condition: this.pets.some(p => ['epico', 'lendario', 'mitico'].includes(p.rarity)) },
      { id: 'max_happiness', condition: this.pets.some(p => p.happiness >= 100) },
      { id: 'rich', condition: this.coins >= 10000 }
    ];

    checks.forEach(check => {
      const ach = this.achievements.find(a => a.id === check.id);
      if (ach && !ach.unlocked && check.condition) {
        ach.unlocked = true;
        this.coins += ach.reward;
        this.addNotification(`Conquista: ${ach.name}! +${ach.reward}`);
      }
    });
  }

  update(deltaTime) {
    this.animationTime += deltaTime;

    // Pet bounce animation
    if (this.petBounce > 0) {
      this.petBounce -= deltaTime * 0.02;
    }

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= deltaTime;
      return p.life > 0;
    });

    // Update notifications
    this.notifications = this.notifications.filter(n => {
      n.y -= 1;
      n.life -= deltaTime;
      n.alpha = n.life / 2000;
      return n.life > 0;
    });

    // Decay pet stats slowly
    if (this.gameState !== 'shop') {
      this.pets.forEach(pet => {
        pet.hunger = Math.max(0, pet.hunger - deltaTime * 0.001);
        pet.energy = Math.max(0, pet.energy - deltaTime * 0.0005);
        pet.hygiene = Math.max(0, pet.hygiene - deltaTime * 0.0003);

        // Happiness affected by other stats
        const avgStats = (pet.hunger + pet.energy + pet.hygiene) / 3;
        if (avgStats < 30) {
          pet.happiness = Math.max(0, pet.happiness - deltaTime * 0.002);
        }

        // Generate coins based on happiness
        if (pet.happiness > 50 && Math.random() < 0.001) {
          this.coins += Math.floor(pet.level * (pet.happiness / 100));
        }
      });
    }
  }

  draw() {
    // Sky gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw clouds
    this.drawClouds();

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.gameState) {
      case 'home': this.drawHome(); break;
      case 'pet': this.drawPetView(); break;
      case 'shop': this.drawShop(); break;
      case 'achievements': this.drawAchievements(); break;
    }

    // Draw particles
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life / 1000;
      this.ctx.font = `${20 * p.scale}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(p.emoji, p.x, p.y);
      this.ctx.globalAlpha = 1;
    });

    // Draw notifications
    this.notifications.forEach(n => {
      this.ctx.globalAlpha = n.alpha;
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(n.text, this.canvas.width / 2, n.y);
      this.ctx.globalAlpha = 1;
    });

    // Always draw currency bar
    this.drawCurrencyBar();
  }

  drawClouds() {
    this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const time = this.animationTime * 0.01;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 200 + time * 10) % (this.canvas.width + 100)) - 50;
      const y = 50 + i * 30;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 30, 0, Math.PI * 2);
      this.ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
      this.ctx.arc(x + 50, y, 35, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawCurrencyBar() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 45);

    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';

    // Coins
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`🪙 ${this.coins}`, 15, 28);

    // Diamonds
    this.ctx.fillStyle = '#00BFFF';
    this.ctx.fillText(`💎 ${this.diamonds}`, 120, 28);

    // Level & XP
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`Nv.${this.level}`, this.canvas.width - 15, 28);

    // XP bar
    const xpBarWidth = 80;
    const xpProgress = this.xp / (this.level * 100);
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(this.canvas.width - 100 - xpBarWidth, 18, xpBarWidth, 10);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(this.canvas.width - 100 - xpBarWidth, 18, xpBarWidth * xpProgress, 10);
  }

  drawTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 4;
    const boxWidth = Math.min(350, this.canvas.width - 40);
    ctx.fillRect(centerX - boxWidth/2, centerY - 130, boxWidth, 300);
    ctx.strokeRect(centerX - boxWidth/2, centerY - 130, boxWidth, 300);

    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 70);

    ctx.fillStyle = '#4ECDC4';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 20);

    ctx.fillStyle = '#333';
    ctx.font = '15px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 15 + i * 22);
    });

    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 115);

    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(centerX - 60, centerY + 100, 120, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(this.tutorialPage < this.tutorialPages.length - 1 ? 'Proximo' : 'Jogar!', centerX, centerY + 125);

    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText('Pular', centerX, centerY + 165);
  }

  drawHome() {
    const centerX = this.canvas.width / 2;

    // Title
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Meus Pets', centerX, 90);

    // Pet count
    this.ctx.fillStyle = '#666';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`${this.pets.length} pets`, centerX, 115);

    // Pet cards
    if (this.pets.length === 0) {
      this.ctx.fillStyle = '#999';
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Voce ainda nao tem pets!', centerX, 250);
      this.ctx.fillText('Va ate a Loja para adotar!', centerX, 280);
    } else {
      const cardWidth = 100;
      const cardsPerRow = Math.floor((this.canvas.width - 40) / (cardWidth + 10));
      const startX = (this.canvas.width - cardsPerRow * (cardWidth + 10)) / 2;
      const startY = 150;

      this.pets.forEach((pet, i) => {
        const row = Math.floor(i / cardsPerRow);
        const col = i % cardsPerRow;
        const cx = startX + col * (cardWidth + 10) + cardWidth / 2;
        const cy = startY + row * 120 + 50;

        // Card background
        const rarityColors = {
          'comum': '#90EE90',
          'incomum': '#87CEEB',
          'raro': '#DDA0DD',
          'epico': '#FFD700',
          'lendario': '#FF6B6B',
          'mitico': '#FF69B4'
        };
        this.ctx.fillStyle = rarityColors[pet.rarity] || '#fff';
        this.ctx.fillRect(cx - 45, cy - 45, 90, 100);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cx - 45, cy - 45, 90, 100);

        // Pet emoji
        this.ctx.font = '40px Arial';
        this.ctx.fillText(pet.emoji, cx, cy);

        // Pet name & level
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(pet.name, cx, cy + 35);
        this.ctx.font = '11px Arial';
        this.ctx.fillText(`Nv.${pet.level}`, cx, cy + 48);

        // Happiness indicator
        const happyEmoji = pet.happiness > 70 ? '😊' : pet.happiness > 40 ? '😐' : '😢';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(happyEmoji, cx + 30, cy - 30);
      });
    }

    // Bottom buttons
    const btnY = this.canvas.height - 60;
    const btns = [
      { text: '🏪 Loja', color: '#4ECDC4' },
      { text: '🏆 Conquistas', color: '#FFD93D' }
    ];

    btns.forEach((btn, i) => {
      const bx = centerX - 100 + i * 200;
      this.ctx.fillStyle = btn.color;
      this.ctx.fillRect(bx - 70, btnY - 25, 140, 50);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(btn.text, bx, btnY + 5);
    });
  }

  drawPetView() {
    const pet = this.pets[this.selectedPet];
    const centerX = this.canvas.width / 2;

    // Back button
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.fillRect(20, 55, 80, 35);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 78);

    // Pet name & level
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(`${pet.name} Nv.${pet.level}`, centerX, 90);

    // Rarity badge
    const rarityColors = { 'comum': '#90EE90', 'incomum': '#87CEEB', 'raro': '#DDA0DD', 'epico': '#FFD700', 'lendario': '#FF6B6B', 'mitico': '#FF69B4' };
    this.ctx.fillStyle = rarityColors[pet.rarity];
    this.ctx.font = '14px Arial';
    this.ctx.fillText(pet.rarity.toUpperCase(), centerX, 115);

    // Pet emoji (big, animated)
    const bounce = Math.sin(this.animationTime * 0.005) * 5 + this.petBounce;
    this.ctx.font = '120px Arial';
    this.ctx.fillText(pet.emoji, centerX, 300 - bounce);

    // Stats bars
    const stats = [
      { name: 'Felicidade', value: pet.happiness, color: '#FF6B6B', emoji: '😊' },
      { name: 'Fome', value: pet.hunger, color: '#4ECDC4', emoji: '🍖' },
      { name: 'Energia', value: pet.energy, color: '#FFD93D', emoji: '⚡' },
      { name: 'Higiene', value: pet.hygiene, color: '#87CEEB', emoji: '🛁' }
    ];

    const barStartY = 380;
    stats.forEach((stat, i) => {
      const y = barStartY + i * 40;

      this.ctx.fillStyle = '#333';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${stat.emoji} ${stat.name}`, 30, y + 12);

      // Bar background
      this.ctx.fillStyle = '#ddd';
      this.ctx.fillRect(150, y, this.canvas.width - 180, 20);

      // Bar fill
      this.ctx.fillStyle = stat.color;
      this.ctx.fillRect(150, y, (this.canvas.width - 180) * (stat.value / 100), 20);

      // Value
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#333';
      this.ctx.fillText(`${Math.floor(stat.value)}%`, this.canvas.width - 20, y + 15);
    });

    // Action buttons
    const btnY = this.canvas.height - 100;
    const actions = [
      { emoji: '🍖', text: 'Alimentar', cost: '5🪙' },
      { emoji: '🎾', text: 'Brincar', cost: '20⚡' },
      { emoji: '🛁', text: 'Banho', cost: '3🪙' },
      { emoji: '💤', text: 'Dormir', cost: 'Gratis' }
    ];

    this.ctx.textAlign = 'center';
    actions.forEach((act, i) => {
      const bx = centerX - 150 + i * 100;

      this.ctx.fillStyle = '#4ECDC4';
      this.ctx.beginPath();
      this.ctx.arc(bx, btnY, 35, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.font = '28px Arial';
      this.ctx.fillText(act.emoji, bx, btnY + 8);

      this.ctx.fillStyle = '#333';
      this.ctx.font = '11px Arial';
      this.ctx.fillText(act.text, bx, btnY + 55);
      this.ctx.font = '10px Arial';
      this.ctx.fillStyle = '#666';
      this.ctx.fillText(act.cost, bx, btnY + 68);
    });

    // Love meter
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`❤️ Amor: ${pet.love}%`, centerX, 350);
  }

  drawShop() {
    const centerX = this.canvas.width / 2;

    // Back button
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.fillRect(20, 55, 80, 35);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 78);

    // Title
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillText('🏪 Loja de Pets', centerX, 90);

    // Pet items
    const itemWidth = 90;
    const itemsPerRow = Math.floor((this.canvas.width - 40) / (itemWidth + 10));
    const startX = (this.canvas.width - itemsPerRow * (itemWidth + 10)) / 2;
    const startY = 120;

    this.petTypes.forEach((type, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const ix = startX + col * (itemWidth + 10) + itemWidth / 2;
      const iy = startY + row * 110 + 45;

      const owned = this.pets.some(p => p.type === type.id);
      const canBuy = type.cost === 0 || this.coins >= type.cost;

      // Card
      const rarityColors = { 'comum': '#90EE90', 'incomum': '#87CEEB', 'raro': '#DDA0DD', 'epico': '#FFD700', 'lendario': '#FF6B6B', 'mitico': '#FF69B4' };
      this.ctx.fillStyle = owned ? '#ccc' : (canBuy ? rarityColors[type.rarity] : '#999');
      this.ctx.fillRect(ix - 40, iy - 40, 80, 100);
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(ix - 40, iy - 40, 80, 100);

      // Emoji
      this.ctx.font = '35px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(type.emoji, ix, iy + 5);

      // Name
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.fillText(type.name, ix, iy + 30);

      // Cost
      this.ctx.font = '12px Arial';
      if (owned) {
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('✓ Tem', ix, iy + 50);
      } else if (type.cost === 0) {
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillText('GRATIS!', ix, iy + 50);
      } else {
        this.ctx.fillStyle = canBuy ? '#FFD700' : '#999';
        this.ctx.fillText(`🪙${type.cost}`, ix, iy + 50);
      }

      // Rarity
      this.ctx.font = '9px Arial';
      this.ctx.fillStyle = '#666';
      this.ctx.fillText(type.rarity, ix, iy - 28);
    });
  }

  drawAchievements() {
    const centerX = this.canvas.width / 2;

    // Back button
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.fillRect(20, 55, 80, 35);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 78);

    // Title
    this.ctx.fillStyle = '#FFD93D';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillText('🏆 Conquistas', centerX, 90);

    // Achievements list
    const startY = 130;
    this.achievements.forEach((ach, i) => {
      const y = startY + i * 55;

      this.ctx.fillStyle = ach.unlocked ? 'rgba(76, 175, 80, 0.3)' : 'rgba(200,200,200,0.5)';
      this.ctx.fillRect(20, y, this.canvas.width - 40, 50);
      this.ctx.strokeStyle = ach.unlocked ? '#4CAF50' : '#ccc';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(20, y, this.canvas.width - 40, 50);

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = ach.unlocked ? '#333' : '#999';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillText((ach.unlocked ? '✅ ' : '🔒 ') + ach.name, 30, y + 22);

      this.ctx.font = '12px Arial';
      this.ctx.fillText(ach.desc, 30, y + 40);

      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText(`+${ach.reward}🪙`, this.canvas.width - 30, y + 30);
    });
  }

  saveProgress() {
    localStorage.setItem('petworld_coins', this.coins);
    localStorage.setItem('petworld_diamonds', this.diamonds);
    localStorage.setItem('petworld_xp', this.xp);
    localStorage.setItem('petworld_level', this.level);
    localStorage.setItem('petworld_pets', JSON.stringify(this.pets));
    localStorage.setItem('petworld_achievements', JSON.stringify(this.achievements));
  }

  loadProgress() {
    this.pets = JSON.parse(localStorage.getItem('petworld_pets') || '[]');
    const savedAch = localStorage.getItem('petworld_achievements');
    if (savedAch) {
      const loaded = JSON.parse(savedAch);
      loaded.forEach((saved, i) => {
        if (this.achievements[i]) {
          this.achievements[i].unlocked = saved.unlocked;
        }
      });
    }
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

window.addEventListener('load', () => new PetWorldGame());
