// Animal Farm Builder - EAI Games
// Fazenda idle/tycoon para crianças

class AnimalFarmBuilder {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_animalfarm_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo à Fazenda!', lines: ['Construa sua fazenda dos sonhos', 'com muitos animais!'], emoji: '🏡' },
      { title: 'Animais', lines: ['Compre animais na loja', 'Cada um produz recursos', 'automaticamente!'], emoji: '🐄' },
      { title: 'Recursos', lines: ['🥛 Leite dos animais', '🥚 Ovos das galinhas', '🧀 Queijo processado'], emoji: '📦' },
      { title: 'Construções', lines: ['🏠 Celeiros para animais', '🌾 Silos para ração', '🏭 Fábricas para processar'], emoji: '🏗️' },
      { title: 'Expansão', lines: ['Desbloqueie novas áreas', 'Compre decorações', 'Faça sua fazenda linda!'], emoji: '🌻' },
      { title: 'Vamos Começar!', lines: ['Comece com uma galinha', 'e cresça sua fazenda!', 'Divirta-se!'], emoji: '🎉' }
    ];

    // Game state
    this.state = 'menu';
    this.loadProgress();

    // Animals
    this.animalTypes = {
      chicken: { name: 'Galinha', emoji: '🐔', price: 50, produces: 'egg', rate: 2, value: 5 },
      cow: { name: 'Vaca', emoji: '🐄', price: 200, produces: 'milk', rate: 5, value: 15 },
      pig: { name: 'Porco', emoji: '🐷', price: 150, produces: 'meat', rate: 8, value: 25 },
      sheep: { name: 'Ovelha', emoji: '🐑', price: 180, produces: 'wool', rate: 6, value: 20 },
      duck: { name: 'Pato', emoji: '🦆', price: 80, produces: 'feather', rate: 3, value: 8 },
      goat: { name: 'Cabra', emoji: '🐐', price: 250, produces: 'cheese', rate: 7, value: 30 },
      horse: { name: 'Cavalo', emoji: '🐴', price: 500, produces: 'ride', rate: 15, value: 60 },
      rabbit: { name: 'Coelho', emoji: '🐰', price: 100, produces: 'fur', rate: 4, value: 12 }
    };

    // Resources
    this.resources = {
      egg: { name: 'Ovos', emoji: '🥚', count: 0 },
      milk: { name: 'Leite', emoji: '🥛', count: 0 },
      meat: { name: 'Carne', emoji: '🥩', count: 0 },
      wool: { name: 'Lã', emoji: '🧶', count: 0 },
      feather: { name: 'Penas', emoji: '🪶', count: 0 },
      cheese: { name: 'Queijo', emoji: '🧀', count: 0 },
      ride: { name: 'Passeios', emoji: '🎠', count: 0 },
      fur: { name: 'Pelos', emoji: '🐇', count: 0 }
    };

    // Buildings
    this.buildings = {
      barn: { name: 'Celeiro', emoji: '🏠', price: 500, effect: 'capacity', value: 5, count: 0, maxLevel: 10 },
      silo: { name: 'Silo', emoji: '🌾', price: 300, effect: 'storage', value: 100, count: 0, maxLevel: 10 },
      factory: { name: 'Fábrica', emoji: '🏭', price: 1000, effect: 'process', value: 2, count: 0, maxLevel: 5 },
      windmill: { name: 'Moinho', emoji: '🌀', price: 800, effect: 'speed', value: 0.1, count: 0, maxLevel: 5 }
    };

    // Farm areas
    this.farmAreas = [
      { name: 'Campo Verde', unlocked: true, animals: [], maxAnimals: 5 },
      { name: 'Pasto Dourado', unlocked: false, unlockPrice: 2000, animals: [], maxAnimals: 8 },
      { name: 'Vale Florido', unlocked: false, unlockPrice: 5000, animals: [], maxAnimals: 10 },
      { name: 'Montanha', unlocked: false, unlockPrice: 10000, animals: [], maxAnimals: 15 }
    ];

    // Decorations
    this.decorations = {
      fence: { name: 'Cerca', emoji: '🪵', price: 100, owned: 0 },
      flower: { name: 'Flores', emoji: '🌻', price: 50, owned: 0 },
      tree: { name: 'Árvore', emoji: '🌳', price: 150, owned: 0 },
      pond: { name: 'Lago', emoji: '💧', price: 300, owned: 0 },
      scarecrow: { name: 'Espantalho', emoji: '🧑‍🌾', price: 200, owned: 0 }
    };

    // Upgrades
    this.upgrades = {
      animalSpeed: { name: 'Velocidade', level: 0, maxLevel: 10, basePrice: 200, effect: 0.1 },
      animalValue: { name: 'Valor', level: 0, maxLevel: 10, basePrice: 300, effect: 0.15 },
      autoCollect: { name: 'Auto-Coleta', level: 0, maxLevel: 5, basePrice: 500, effect: 1 },
      luckyBonus: { name: 'Sorte', level: 0, maxLevel: 5, basePrice: 400, effect: 0.05 }
    };
    this.loadUpgrades();

    // Achievements
    this.achievements = [
      { id: 'first_animal', name: 'Primeiro Animal', desc: 'Compre seu primeiro animal', icon: '🐔', unlocked: false },
      { id: 'farm_10', name: 'Mini Fazenda', desc: 'Tenha 10 animais', icon: '🏡', unlocked: false },
      { id: 'farm_50', name: 'Grande Fazenda', desc: 'Tenha 50 animais', icon: '🏰', unlocked: false },
      { id: 'all_animals', name: 'Colecionador', desc: 'Tenha todos os tipos de animais', icon: '🎖️', unlocked: false },
      { id: 'millionaire', name: 'Fazendeiro Rico', desc: 'Acumule 100000 moedas', icon: '💰', unlocked: false },
      { id: 'all_areas', name: 'Expansionista', desc: 'Desbloqueie todas as áreas', icon: '🗺️', unlocked: false },
      { id: 'decorator', name: 'Decorador', desc: 'Compre 20 decorações', icon: '🎨', unlocked: false },
      { id: 'producer', name: 'Produtor Master', desc: 'Produza 1000 recursos', icon: '📦', unlocked: false }
    ];
    this.loadAchievements();

    // Stats
    this.totalProduced = parseInt(localStorage.getItem('animalfarm_total_produced') || '0');
    this.totalDecorations = 0;
    Object.values(this.decorations).forEach(d => this.totalDecorations += d.owned);

    // Visual animals
    this.visualAnimals = [];
    this.particles = [];

    // Auto-production timer
    this.productionTimer = 0;
    this.autoCollectTimer = 0;

    // Selected area for viewing
    this.selectedArea = 0;

    // Input
    this.setupInput();

    // Start
    this.lastTime = performance.now();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  loadProgress() {
    this.coins = parseInt(localStorage.getItem('animalfarm_coins') || '100');
    this.diamonds = parseInt(localStorage.getItem('animalfarm_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('animalfarm_xp') || '0');
    this.level = parseInt(localStorage.getItem('animalfarm_level') || '1');

    // Load animals
    const savedAnimals = localStorage.getItem('animalfarm_animals');
    if (savedAnimals) {
      const data = JSON.parse(savedAnimals);
      this.farmAreas.forEach((area, i) => {
        if (data[i]) {
          area.unlocked = data[i].unlocked;
          area.animals = data[i].animals || [];
        }
      });
    }

    // Load buildings
    const savedBuildings = localStorage.getItem('animalfarm_buildings');
    if (savedBuildings) {
      const data = JSON.parse(savedBuildings);
      Object.keys(data).forEach(k => {
        if (this.buildings[k]) this.buildings[k].count = data[k];
      });
    }

    // Load decorations
    const savedDecorations = localStorage.getItem('animalfarm_decorations');
    if (savedDecorations) {
      const data = JSON.parse(savedDecorations);
      Object.keys(data).forEach(k => {
        if (this.decorations[k]) this.decorations[k].owned = data[k];
      });
    }

    // Load resources
    const savedResources = localStorage.getItem('animalfarm_resources');
    if (savedResources) {
      const data = JSON.parse(savedResources);
      Object.keys(data).forEach(k => {
        if (this.resources[k]) this.resources[k].count = data[k];
      });
    }
  }

  saveProgress() {
    localStorage.setItem('animalfarm_coins', this.coins.toString());
    localStorage.setItem('animalfarm_diamonds', this.diamonds.toString());
    localStorage.setItem('animalfarm_xp', this.xp.toString());
    localStorage.setItem('animalfarm_level', this.level.toString());

    // Save animals
    const animalsData = this.farmAreas.map(area => ({
      unlocked: area.unlocked,
      animals: area.animals
    }));
    localStorage.setItem('animalfarm_animals', JSON.stringify(animalsData));

    // Save buildings
    const buildingsData = {};
    Object.keys(this.buildings).forEach(k => buildingsData[k] = this.buildings[k].count);
    localStorage.setItem('animalfarm_buildings', JSON.stringify(buildingsData));

    // Save decorations
    const decorationsData = {};
    Object.keys(this.decorations).forEach(k => decorationsData[k] = this.decorations[k].owned);
    localStorage.setItem('animalfarm_decorations', JSON.stringify(decorationsData));

    // Save resources
    const resourcesData = {};
    Object.keys(this.resources).forEach(k => resourcesData[k] = this.resources[k].count);
    localStorage.setItem('animalfarm_resources', JSON.stringify(resourcesData));

    localStorage.setItem('animalfarm_total_produced', this.totalProduced.toString());
  }

  loadUpgrades() {
    const saved = localStorage.getItem('animalfarm_upgrades');
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(k => {
        if (this.upgrades[k]) this.upgrades[k].level = data[k];
      });
    }
  }

  saveUpgrades() {
    const data = {};
    Object.keys(this.upgrades).forEach(k => data[k] = this.upgrades[k].level);
    localStorage.setItem('animalfarm_upgrades', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('animalfarm_achievements');
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
    localStorage.setItem('animalfarm_achievements', JSON.stringify(data));
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
        localStorage.setItem('eai_animalfarm_tutorial_seen', 'true');
      }
      return;
    }

    switch (this.state) {
      case 'menu': this.handleMenuClick(x, y); break;
      case 'farm': this.handleFarmClick(x, y); break;
      case 'shop': this.handleShopClick(x, y); break;
      case 'buildings': this.handleBuildingsClick(x, y); break;
      case 'upgrades': this.handleUpgradesClick(x, y); break;
      case 'achievements': this.handleAchievementsClick(x, y); break;
      case 'sell': this.handleSellClick(x, y); break;
    }
  }

  handleMenuClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const btnW = 200, btnH = 50;

    const buttons = [
      { y: cy - 60, action: () => { this.state = 'farm'; this.generateVisualAnimals(); } },
      { y: cy, action: () => this.state = 'shop' },
      { y: cy + 60, action: () => this.state = 'buildings' },
      { y: cy + 120, action: () => this.state = 'upgrades' },
      { y: cy + 180, action: () => this.state = 'achievements' }
    ];

    buttons.forEach(btn => {
      if (x > cx - btnW/2 && x < cx + btnW/2 && y > btn.y && y < btn.y + btnH) {
        btn.action();
      }
    });
  }

  handleFarmClick(x, y) {
    const w = this.canvas.width;

    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    // Sell button
    if (x > w - 100 && y < 60) {
      this.state = 'sell';
      return;
    }

    // Area tabs
    const tabWidth = w / this.farmAreas.length;
    const tabY = this.canvas.height - 60;

    if (y > tabY) {
      const areaIndex = Math.floor(x / tabWidth);
      if (this.farmAreas[areaIndex].unlocked) {
        this.selectedArea = areaIndex;
        this.generateVisualAnimals();
      } else {
        // Try to unlock
        const area = this.farmAreas[areaIndex];
        if (this.coins >= area.unlockPrice) {
          this.coins -= area.unlockPrice;
          area.unlocked = true;
          this.selectedArea = areaIndex;
          this.generateVisualAnimals();
          this.checkAchievement('all_areas');
          this.saveProgress();
        }
      }
      return;
    }

    // Click on farm - collect resources manually
    this.collectResources();
  }

  handleShopClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    const animalKeys = Object.keys(this.animalTypes);

    animalKeys.forEach((key, i) => {
      const animal = this.animalTypes[key];
      const ay = startY + i * 65;

      if (y > ay && y < ay + 60 && x > this.canvas.width - 120) {
        if (this.coins >= animal.price && this.getTotalAnimals() < this.getMaxAnimals()) {
          this.coins -= animal.price;
          this.farmAreas[this.selectedArea].animals.push({ type: key, level: 1 });
          this.xp += 10;
          this.checkLevelUp();
          this.checkAchievement('first_animal');
          this.checkAnimalAchievements();
          this.saveProgress();
        }
      }
    });
  }

  handleBuildingsClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    const buildingKeys = Object.keys(this.buildings);

    buildingKeys.forEach((key, i) => {
      const building = this.buildings[key];
      const by = startY + i * 80;

      if (y > by && y < by + 70 && x > this.canvas.width - 120) {
        const price = building.price * (building.count + 1);
        if (this.coins >= price && building.count < building.maxLevel) {
          this.coins -= price;
          building.count++;
          this.xp += 20;
          this.checkLevelUp();
          this.saveProgress();
        }
      }
    });

    // Decorations section
    const decoStartY = startY + buildingKeys.length * 80 + 50;
    const decoKeys = Object.keys(this.decorations);

    decoKeys.forEach((key, i) => {
      const deco = this.decorations[key];
      const dy = decoStartY + i * 55;

      if (y > dy && y < dy + 50 && x > this.canvas.width - 120) {
        if (this.coins >= deco.price) {
          this.coins -= deco.price;
          deco.owned++;
          this.totalDecorations++;
          if (this.totalDecorations >= 20) this.checkAchievement('decorator');
          this.saveProgress();
        }
      }
    });
  }

  handleUpgradesClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    const upgradeKeys = Object.keys(this.upgrades);

    upgradeKeys.forEach((key, i) => {
      const upg = this.upgrades[key];
      const uy = startY + i * 80;

      if (y > uy && y < uy + 70 && x > this.canvas.width - 120) {
        const price = upg.basePrice * (upg.level + 1);
        if (this.coins >= price && upg.level < upg.maxLevel) {
          this.coins -= price;
          upg.level++;
          this.saveUpgrades();
          this.saveProgress();
        }
      }
    });
  }

  handleAchievementsClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
    }
  }

  handleSellClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'farm';
      return;
    }

    const startY = 100;
    const resourceKeys = Object.keys(this.resources);

    resourceKeys.forEach((key, i) => {
      const res = this.resources[key];
      const ry = startY + i * 60;

      if (y > ry && y < ry + 55 && x > this.canvas.width - 120 && res.count > 0) {
        // Sell all of this resource
        const animalType = Object.values(this.animalTypes).find(a => a.produces === key);
        const baseValue = animalType?.value || 10;
        const valueBonus = 1 + this.upgrades.animalValue.level * this.upgrades.animalValue.effect;
        const totalValue = Math.round(res.count * baseValue * valueBonus);

        this.coins += totalValue;
        res.count = 0;
        this.saveProgress();
      }
    });
  }

  getTotalAnimals() {
    return this.farmAreas.reduce((sum, area) => sum + area.animals.length, 0);
  }

  getMaxAnimals() {
    const baseCapacity = this.farmAreas.reduce((sum, area) => area.unlocked ? sum + area.maxAnimals : sum, 0);
    const barnBonus = this.buildings.barn.count * this.buildings.barn.value;
    return baseCapacity + barnBonus;
  }

  collectResources() {
    // Add particles for feedback
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.addParticles(cx, cy, '#ffd700', 15);
  }

  generateVisualAnimals() {
    this.visualAnimals = [];
    const area = this.farmAreas[this.selectedArea];
    const farmTop = 120;
    const farmBottom = this.canvas.height - 120;
    const farmLeft = 50;
    const farmRight = this.canvas.width - 50;

    area.animals.forEach((animal, i) => {
      this.visualAnimals.push({
        type: animal.type,
        x: farmLeft + Math.random() * (farmRight - farmLeft),
        y: farmTop + Math.random() * (farmBottom - farmTop),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        animTime: Math.random() * Math.PI * 2
      });
    });
  }

  addParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
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
      this.coins += 200;
      this.diamonds += 10;
      this.saveAchievements();
      this.saveProgress();
    }
  }

  checkAnimalAchievements() {
    const total = this.getTotalAnimals();
    if (total >= 10) this.checkAchievement('farm_10');
    if (total >= 50) this.checkAchievement('farm_50');

    // Check all animal types
    const ownedTypes = new Set();
    this.farmAreas.forEach(area => {
      area.animals.forEach(a => ownedTypes.add(a.type));
    });
    if (ownedTypes.size >= Object.keys(this.animalTypes).length) {
      this.checkAchievement('all_animals');
    }

    // Check all areas
    if (this.farmAreas.every(a => a.unlocked)) {
      this.checkAchievement('all_areas');
    }

    if (this.coins >= 100000) this.checkAchievement('millionaire');
    if (this.totalProduced >= 1000) this.checkAchievement('producer');
  }

  checkLevelUp() {
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.coins += 50 * this.level;
      this.diamonds += Math.floor(this.level / 5);
    }
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

    if (this.state !== 'farm') return;

    // Update visual animals
    const farmTop = 120;
    const farmBottom = this.canvas.height - 120;
    const farmLeft = 50;
    const farmRight = this.canvas.width - 50;

    this.visualAnimals.forEach(animal => {
      animal.animTime += dt * 0.003;
      animal.x += animal.vx;
      animal.y += animal.vy;

      // Bounce off walls
      if (animal.x < farmLeft || animal.x > farmRight) {
        animal.vx *= -1;
        animal.x = Math.max(farmLeft, Math.min(farmRight, animal.x));
      }
      if (animal.y < farmTop || animal.y > farmBottom) {
        animal.vy *= -1;
        animal.y = Math.max(farmTop, Math.min(farmBottom, animal.y));
      }

      // Random direction change
      if (Math.random() < 0.01) {
        animal.vx = (Math.random() - 0.5) * 2;
        animal.vy = (Math.random() - 0.5) * 2;
      }
    });

    // Production
    this.productionTimer += dt;
    const speedBonus = 1 + this.upgrades.animalSpeed.level * this.upgrades.animalSpeed.effect;
    const windmillBonus = 1 + this.buildings.windmill.count * this.buildings.windmill.value;

    if (this.productionTimer >= 1000 / (speedBonus * windmillBonus)) {
      this.productionTimer = 0;

      this.farmAreas.forEach(area => {
        if (!area.unlocked) return;

        area.animals.forEach(animal => {
          const animalData = this.animalTypes[animal.type];
          if (Math.random() < 1 / animalData.rate) {
            const factoryBonus = this.buildings.factory.count * this.buildings.factory.value;
            const luckyBonus = Math.random() < this.upgrades.luckyBonus.level * this.upgrades.luckyBonus.effect ? 2 : 1;
            const amount = Math.round((1 + factoryBonus) * luckyBonus);

            this.resources[animalData.produces].count += amount;
            this.totalProduced += amount;

            // Production particles
            if (this.state === 'farm') {
              const visualAnimal = this.visualAnimals.find(v => v.type === animal.type);
              if (visualAnimal) {
                this.addParticles(visualAnimal.x, visualAnimal.y, '#4CAF50', 5);
              }
            }
          }
        });
      });

      this.checkAnimalAchievements();
    }

    // Auto-collect
    if (this.upgrades.autoCollect.level > 0) {
      this.autoCollectTimer += dt;
      if (this.autoCollectTimer >= 5000 / this.upgrades.autoCollect.level) {
        this.autoCollectTimer = 0;

        // Auto-sell some resources
        Object.keys(this.resources).forEach(key => {
          const res = this.resources[key];
          if (res.count > 0) {
            const sellAmount = Math.min(res.count, this.upgrades.autoCollect.level);
            const animalType = Object.values(this.animalTypes).find(a => a.produces === key);
            const baseValue = animalType?.value || 10;
            const valueBonus = 1 + this.upgrades.animalValue.level * this.upgrades.animalValue.effect;

            this.coins += Math.round(sellAmount * baseValue * valueBonus);
            res.count -= sellAmount;
          }
        });

        this.saveProgress();
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.4, '#87CEEB');
    gradient.addColorStop(0.4, '#7cb342');
    gradient.addColorStop(1, '#558b2f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.state) {
      case 'menu': this.drawMenu(); break;
      case 'farm': this.drawFarm(); break;
      case 'shop': this.drawShop(); break;
      case 'buildings': this.drawBuildings(); break;
      case 'upgrades': this.drawUpgrades(); break;
      case 'achievements': this.drawAchievements(); break;
      case 'sell': this.drawSell(); break;
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

    ctx.fillStyle = 'rgba(124,179,66,0.95)';
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
    ctx.fillStyle = '#c5e1a5';
    ctx.fillText(`Toque para continuar (${this.tutorialPage + 1}/${this.tutorialPages.length})`, w/2, h/2 + 110);
  }

  drawMenu() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🐄 ANIMAL FARM 🐄', w/2, 70);

    ctx.font = '16px Arial';
    ctx.fillText(`💰 ${this.coins}   💎 ${this.diamonds}   ⭐ Nível ${this.level}`, w/2, 105);

    // Stats
    ctx.font = '14px Arial';
    ctx.fillText(`Animais: ${this.getTotalAnimals()}/${this.getMaxAnimals()}`, w/2, 130);

    // Farm preview
    ctx.font = '60px Arial';
    const animals = ['🐔', '🐄', '🐷', '🐑'];
    const time = Date.now() / 1000;
    animals.forEach((emoji, i) => {
      const angle = time + i * Math.PI / 2;
      const ox = Math.cos(angle) * 50;
      const oy = Math.sin(angle * 0.5) * 20;
      ctx.fillText(emoji, w/2 + ox - 60 + i * 40, h/2 - 100 + oy);
    });

    const buttons = [
      { text: '🏡 Fazenda', y: h/2 - 60 },
      { text: '🛒 Loja', y: h/2 },
      { text: '🏗️ Construções', y: h/2 + 60 },
      { text: '⬆️ Upgrades', y: h/2 + 120 },
      { text: '🏆 Conquistas', y: h/2 + 180 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#558b2f';
      ctx.fillRect(w/2 - 100, btn.y, 200, 50);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 100, btn.y, 200, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 32);
    });
  }

  drawFarm() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const area = this.farmAreas[this.selectedArea];

    // Back button
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Menu', 50, 35);

    // Sell button
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(w - 90, 10, 80, 40);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(w - 90, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText('💰 Vender', w - 50, 35);

    // Title
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(area.name, w/2, 40);

    // Stats bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 55, w, 55);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`💰 ${this.coins}   Animais: ${area.animals.length}/${area.maxAnimals}`, w/2, 75);

    // Resources preview
    let resX = 20;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    Object.values(this.resources).forEach(res => {
      if (res.count > 0) {
        ctx.fillText(`${res.emoji}${res.count}`, resX, 98);
        resX += 55;
      }
    });

    // Fence decorations
    const fenceCount = this.decorations.fence.owned;
    for (let i = 0; i < Math.min(fenceCount, 20); i++) {
      ctx.font = '20px Arial';
      ctx.fillText('🪵', 20 + (i % 10) * 35, 115 + Math.floor(i / 10) * (h - 180));
    }

    // Decorations
    const decoY = h - 150;
    let decoX = 30;
    Object.entries(this.decorations).forEach(([key, deco]) => {
      for (let i = 0; i < Math.min(deco.owned, 5); i++) {
        ctx.font = '24px Arial';
        ctx.fillText(deco.emoji, decoX + i * 30, decoY + Math.sin(Date.now() / 1000 + i) * 5);
      }
      if (deco.owned > 0) decoX += 160;
    });

    // Animals
    this.visualAnimals.forEach(animal => {
      const animalData = this.animalTypes[animal.type];
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';

      // Bobbing animation
      const bob = Math.sin(animal.animTime) * 3;
      ctx.fillText(animalData.emoji, animal.x, animal.y + bob);
    });

    // Area tabs at bottom
    const tabWidth = w / this.farmAreas.length;
    this.farmAreas.forEach((area, i) => {
      const tx = i * tabWidth;
      ctx.fillStyle = i === this.selectedArea ? '#4CAF50' : (area.unlocked ? '#558b2f' : '#333');
      ctx.fillRect(tx, h - 60, tabWidth - 2, 60);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(tx, h - 60, tabWidth - 2, 60);

      ctx.fillStyle = '#fff';
      ctx.font = area.unlocked ? 'bold 12px Arial' : '10px Arial';
      ctx.textAlign = 'center';

      if (area.unlocked) {
        ctx.fillText(area.name, tx + tabWidth/2, h - 35);
        ctx.font = '10px Arial';
        ctx.fillText(`${area.animals.length}/${area.maxAnimals}`, tx + tabWidth/2, h - 18);
      } else {
        ctx.fillText('🔒', tx + tabWidth/2, h - 35);
        ctx.font = '10px Arial';
        ctx.fillText(`💰${area.unlockPrice}`, tx + tabWidth/2, h - 18);
      }
    });
  }

  drawShop() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 Loja de Animais', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillText(`💰 ${this.coins}   Espaço: ${this.getTotalAnimals()}/${this.getMaxAnimals()}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.animalTypes).forEach(([key, animal], i) => {
      const y = startY + i * 65;
      const canBuy = this.coins >= animal.price && this.getTotalAnimals() < this.getMaxAnimals();

      ctx.fillStyle = '#558b2f';
      ctx.fillRect(20, y, w - 40, 60);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(20, y, w - 40, 60);

      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(animal.emoji, 35, y + 43);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(animal.name, 85, y + 25);
      ctx.font = '11px Arial';
      ctx.fillStyle = '#c5e1a5';
      ctx.fillText(`Produz: ${this.resources[animal.produces].emoji} a cada ${animal.rate}s`, 85, y + 45);

      ctx.textAlign = 'right';
      ctx.fillStyle = canBuy ? '#ffd700' : '#666';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`💰 ${animal.price}`, w - 35, y + 38);
    });
  }

  drawBuildings() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🏗️ Construções', w/2, 40);
    ctx.font = '14px Arial';
    ctx.fillText(`💰 ${this.coins}`, w/2, 65);

    // Back button
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 90;
    Object.entries(this.buildings).forEach(([key, building], i) => {
      const y = startY + i * 75;
      const price = building.price * (building.count + 1);
      const canBuy = this.coins >= price && building.count < building.maxLevel;

      ctx.fillStyle = '#558b2f';
      ctx.fillRect(20, y, w - 40, 68);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(20, y, w - 40, 68);

      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(building.emoji, 30, y + 45);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(building.name, 75, y + 22);
      ctx.font = '10px Arial';
      ctx.fillStyle = '#c5e1a5';
      ctx.fillText(`Efeito: +${building.value} ${building.effect}`, 75, y + 40);

      // Level bar
      ctx.fillStyle = '#333';
      ctx.fillRect(75, y + 48, 100, 10);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(75, y + 48, 100 * (building.count / building.maxLevel), 10);
      ctx.fillStyle = '#fff';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${building.count}/${building.maxLevel}`, 125, y + 57);

      ctx.textAlign = 'right';
      if (building.count >= building.maxLevel) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('MÁXIMO', w - 35, y + 42);
      } else {
        ctx.fillStyle = canBuy ? '#ffd700' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`💰 ${price}`, w - 35, y + 42);
      }
    });

    // Decorations section
    const decoStartY = startY + Object.keys(this.buildings).length * 75 + 20;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🎨 Decorações', 25, decoStartY);

    Object.entries(this.decorations).forEach(([key, deco], i) => {
      const y = decoStartY + 20 + i * 50;

      ctx.fillStyle = '#558b2f';
      ctx.fillRect(20, y, w - 40, 45);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(20, y, w - 40, 45);

      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(deco.emoji, 30, y + 32);

      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText(`${deco.name} (${deco.owned})`, 65, y + 30);

      ctx.textAlign = 'right';
      ctx.fillStyle = this.coins >= deco.price ? '#ffd700' : '#666';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`💰 ${deco.price}`, w - 35, y + 30);
    });
  }

  drawUpgrades() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️ Upgrades', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillText(`💰 ${this.coins}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.upgrades).forEach(([key, upg], i) => {
      const y = startY + i * 80;
      const price = upg.basePrice * (upg.level + 1);
      const canBuy = this.coins >= price && upg.level < upg.maxLevel;

      ctx.fillStyle = '#558b2f';
      ctx.fillRect(20, y, w - 40, 70);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(upg.name, 35, y + 25);
      ctx.font = '11px Arial';
      ctx.fillStyle = '#c5e1a5';
      ctx.fillText(`+${(upg.effect * 100).toFixed(0)}% por nível`, 35, y + 45);

      // Level bar
      ctx.fillStyle = '#333';
      ctx.fillRect(35, y + 50, 120, 12);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(35, y + 50, 120 * (upg.level / upg.maxLevel), 12);
      ctx.fillStyle = '#fff';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${upg.level}/${upg.maxLevel}`, 95, y + 60);

      ctx.textAlign = 'right';
      if (upg.level >= upg.maxLevel) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('MÁXIMO', w - 35, y + 45);
      } else {
        ctx.fillStyle = canBuy ? '#ffd700' : '#666';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`💰 ${price}`, w - 35, y + 45);
      }
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
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 85;
    const cols = 2;
    const itemW = (w - 50) / cols;

    this.achievements.forEach((ach, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 15 + col * (itemW + 10);
      const y = startY + row * 75;

      ctx.fillStyle = ach.unlocked ? '#558b2f' : '#333';
      ctx.fillRect(x, y, itemW, 65);
      ctx.strokeStyle = ach.unlocked ? '#ffd700' : '#555';
      ctx.lineWidth = ach.unlocked ? 2 : 1;
      ctx.strokeRect(x, y, itemW, 65);

      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ach.unlocked ? ach.icon : '🔒', x + 10, y + 40);

      ctx.fillStyle = ach.unlocked ? '#fff' : '#666';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(ach.name, x + 45, y + 28);
      ctx.font = '10px Arial';
      ctx.fillText(ach.desc, x + 45, y + 45);
    });
  }

  drawSell() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('💰 Vender Recursos', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillText(`Saldo: 💰 ${this.coins}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.resources).forEach(([key, res], i) => {
      const y = startY + i * 60;
      const animalType = Object.values(this.animalTypes).find(a => a.produces === key);
      const baseValue = animalType?.value || 10;
      const valueBonus = 1 + this.upgrades.animalValue.level * this.upgrades.animalValue.effect;
      const totalValue = Math.round(res.count * baseValue * valueBonus);

      ctx.fillStyle = res.count > 0 ? '#558b2f' : '#444';
      ctx.fillRect(20, y, w - 40, 55);
      ctx.strokeStyle = res.count > 0 ? '#fff' : '#666';
      ctx.strokeRect(20, y, w - 40, 55);

      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(res.emoji, 30, y + 38);

      ctx.fillStyle = res.count > 0 ? '#fff' : '#888';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(res.name, 70, y + 25);
      ctx.font = '12px Arial';
      ctx.fillText(`Quantidade: ${res.count}`, 70, y + 42);

      ctx.textAlign = 'right';
      if (res.count > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Vender: 💰${totalValue}`, w - 35, y + 35);
      } else {
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText('Sem estoque', w - 35, y + 35);
      }
    });
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
  setTimeout(() => new AnimalFarmBuilder(), 1600);
});
