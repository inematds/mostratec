// Crypto Miner Empire - EAI Games
// Jogo idle de mineração para adolescentes

class CryptoMinerEmpire {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_cryptominer_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Crypto Miner!', lines: ['Construa seu império de', 'mineração de criptomoedas!'], emoji: '🪙' },
      { title: 'Mineração', lines: ['Toque para minerar', 'Compre GPUs automáticas', 'Ganhe crypto 24/7!'], emoji: '⛏️' },
      { title: 'Criptomoedas', lines: ['Bitcoin, Ethereum, Dogecoin...', 'Cada uma com valor diferente', 'Negocie no mercado!'], emoji: '📈' },
      { title: 'Equipamentos', lines: ['GPUs mineram automaticamente', 'Melhore seu hashrate', 'Reduza o consumo de energia'], emoji: '🖥️' },
      { title: 'Energia', lines: ['Monitore seu consumo', 'Compre painéis solares', 'para energia grátis!'], emoji: '⚡' },
      { title: 'Vamos Minerar!', lines: ['Comece pequeno', 'e construa um império!', 'Boa sorte, minerador!'], emoji: '💰' }
    ];

    // Game state
    this.state = 'menu';
    this.loadProgress();

    // Cryptocurrencies
    this.cryptos = {
      btc: { name: 'Bitcoin', emoji: '🪙', symbol: 'BTC', baseValue: 100, volatility: 0.1 },
      eth: { name: 'Ethereum', emoji: '💎', symbol: 'ETH', baseValue: 50, volatility: 0.15 },
      doge: { name: 'Dogecoin', emoji: '🐕', symbol: 'DOGE', baseValue: 5, volatility: 0.3 },
      ltc: { name: 'Litecoin', emoji: '🥈', symbol: 'LTC', baseValue: 30, volatility: 0.12 },
      xrp: { name: 'Ripple', emoji: '💠', symbol: 'XRP', baseValue: 20, volatility: 0.2 }
    };

    // Initialize wallet
    if (!this.wallet) {
      this.wallet = { btc: 0, eth: 0, doge: 0, ltc: 0, xrp: 0 };
    }

    // Current prices (will fluctuate)
    this.prices = {};
    Object.keys(this.cryptos).forEach(key => {
      this.prices[key] = this.cryptos[key].baseValue;
    });

    // Mining equipment
    this.equipment = {
      basic_gpu: { name: 'GPU Básica', hashrate: 1, power: 5, price: 100, owned: 0, emoji: '🖥️' },
      gaming_gpu: { name: 'GPU Gamer', hashrate: 5, power: 15, price: 500, owned: 0, emoji: '🎮' },
      mining_rig: { name: 'Rig de Mineração', hashrate: 20, power: 50, price: 2000, owned: 0, emoji: '⛏️' },
      asic_miner: { name: 'ASIC Miner', hashrate: 100, power: 200, price: 10000, owned: 0, emoji: '🔧' },
      quantum_miner: { name: 'Quantum Miner', hashrate: 500, power: 300, price: 50000, owned: 0, emoji: '🌀' }
    };

    // Power sources
    this.powerSources = {
      grid: { name: 'Rede Elétrica', output: 100, cost: 1, price: 0, owned: 1 },
      solar: { name: 'Painel Solar', output: 50, cost: 0, price: 1000, owned: 0 },
      wind: { name: 'Turbina Eólica', output: 100, cost: 0, price: 2500, owned: 0 },
      nuclear: { name: 'Reator Nuclear', output: 500, cost: 0.5, price: 20000, owned: 0 }
    };

    // Upgrades
    this.upgrades = {
      hashBoost: { name: 'Hash Boost', level: 0, maxLevel: 10, basePrice: 500, effect: 0.1 },
      efficiency: { name: 'Eficiência', level: 0, maxLevel: 10, basePrice: 300, effect: 0.05 },
      autoSell: { name: 'Auto Venda', level: 0, maxLevel: 5, basePrice: 1000, effect: 1 },
      multiMine: { name: 'Multi-Mine', level: 0, maxLevel: 5, basePrice: 2000, effect: 1 }
    };
    this.loadUpgrades();

    // Mining state
    this.selectedCrypto = 'btc';
    this.miningProgress = 0;
    this.miningTarget = 100;
    this.energyUsage = 0;
    this.energyCapacity = 100;

    // Click power
    this.clickPower = 1;

    // Achievements
    this.achievements = [
      { id: 'first_coin', name: 'Primeiro Coin', desc: 'Mine sua primeira crypto', icon: '🪙', unlocked: false },
      { id: 'rich', name: 'Rico', desc: 'Tenha $10000', icon: '💰', unlocked: false },
      { id: 'millionaire', name: 'Milionário', desc: 'Tenha $1000000', icon: '💎', unlocked: false },
      { id: 'miner_10', name: 'Minerador', desc: 'Tenha 10 equipamentos', icon: '⛏️', unlocked: false },
      { id: 'all_cryptos', name: 'Diversificado', desc: 'Tenha todas as cryptos', icon: '📊', unlocked: false },
      { id: 'green_energy', name: 'Energia Verde', desc: 'Use apenas energia limpa', icon: '🌱', unlocked: false },
      { id: 'whale', name: 'Baleia', desc: 'Tenha 100 BTC', icon: '🐋', unlocked: false },
      { id: 'trader', name: 'Trader', desc: 'Faça 100 negociações', icon: '📈', unlocked: false, progress: 0, target: 100 }
    ];
    this.loadAchievements();

    // Stats
    this.totalMined = parseFloat(localStorage.getItem('cryptominer_total_mined') || '0');
    this.totalTrades = parseInt(localStorage.getItem('cryptominer_total_trades') || '0');

    // Visual
    this.particles = [];
    this.priceHistory = {};
    Object.keys(this.cryptos).forEach(key => {
      this.priceHistory[key] = [];
    });

    // Timers
    this.miningTimer = 0;
    this.priceTimer = 0;
    this.autoSellTimer = 0;
    this.energyCostTimer = 0;

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
    this.money = parseFloat(localStorage.getItem('cryptominer_money') || '100');
    this.diamonds = parseInt(localStorage.getItem('cryptominer_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('cryptominer_xp') || '0');
    this.level = parseInt(localStorage.getItem('cryptominer_level') || '1');
    this.wallet = JSON.parse(localStorage.getItem('cryptominer_wallet') || '{}');

    // Load equipment
    const savedEquip = localStorage.getItem('cryptominer_equipment');
    if (savedEquip) {
      const data = JSON.parse(savedEquip);
      Object.keys(data).forEach(k => {
        if (this.equipment[k]) this.equipment[k].owned = data[k];
      });
    }

    // Load power sources
    const savedPower = localStorage.getItem('cryptominer_power');
    if (savedPower) {
      const data = JSON.parse(savedPower);
      Object.keys(data).forEach(k => {
        if (this.powerSources[k]) this.powerSources[k].owned = data[k];
      });
    }
  }

  saveProgress() {
    localStorage.setItem('cryptominer_money', this.money.toString());
    localStorage.setItem('cryptominer_diamonds', this.diamonds.toString());
    localStorage.setItem('cryptominer_xp', this.xp.toString());
    localStorage.setItem('cryptominer_level', this.level.toString());
    localStorage.setItem('cryptominer_wallet', JSON.stringify(this.wallet));
    localStorage.setItem('cryptominer_total_mined', this.totalMined.toString());
    localStorage.setItem('cryptominer_total_trades', this.totalTrades.toString());

    const equipData = {};
    Object.keys(this.equipment).forEach(k => equipData[k] = this.equipment[k].owned);
    localStorage.setItem('cryptominer_equipment', JSON.stringify(equipData));

    const powerData = {};
    Object.keys(this.powerSources).forEach(k => powerData[k] = this.powerSources[k].owned);
    localStorage.setItem('cryptominer_power', JSON.stringify(powerData));
  }

  loadUpgrades() {
    const saved = localStorage.getItem('cryptominer_upgrades');
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
    localStorage.setItem('cryptominer_upgrades', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('cryptominer_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      this.achievements.forEach(ach => {
        if (data[ach.id]) {
          ach.unlocked = data[ach.id].unlocked;
          if (ach.progress !== undefined) ach.progress = data[ach.id].progress || 0;
        }
      });
    }
  }

  saveAchievements() {
    const data = {};
    this.achievements.forEach(ach => {
      data[ach.id] = { unlocked: ach.unlocked, progress: ach.progress };
    });
    localStorage.setItem('cryptominer_achievements', JSON.stringify(data));
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
        localStorage.setItem('eai_cryptominer_tutorial_seen', 'true');
      }
      return;
    }

    switch (this.state) {
      case 'menu': this.handleMenuClick(x, y); break;
      case 'mining': this.handleMiningClick(x, y); break;
      case 'shop': this.handleShopClick(x, y); break;
      case 'market': this.handleMarketClick(x, y); break;
      case 'upgrades': this.handleUpgradesClick(x, y); break;
      case 'achievements': this.handleAchievementsClick(x, y); break;
    }
  }

  handleMenuClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const btnW = 200, btnH = 50;

    const buttons = [
      { y: cy - 60, action: () => this.state = 'mining' },
      { y: cy, action: () => this.state = 'shop' },
      { y: cy + 60, action: () => this.state = 'market' },
      { y: cy + 120, action: () => this.state = 'upgrades' },
      { y: cy + 180, action: () => this.state = 'achievements' }
    ];

    buttons.forEach(btn => {
      if (x > cx - btnW/2 && x < cx + btnW/2 && y > btn.y && y < btn.y + btnH) {
        btn.action();
      }
    });
  }

  handleMiningClick(x, y) {
    const w = this.canvas.width;

    // Back button
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    // Crypto selector
    const cryptoKeys = Object.keys(this.cryptos);
    const tabWidth = (w - 20) / cryptoKeys.length;
    if (y > 60 && y < 110) {
      const idx = Math.floor((x - 10) / tabWidth);
      if (idx >= 0 && idx < cryptoKeys.length) {
        this.selectedCrypto = cryptoKeys[idx];
        return;
      }
    }

    // Mining area click
    if (y > 200 && y < this.canvas.height - 100) {
      this.mine();
    }
  }

  handleShopClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const w = this.canvas.width;
    let itemY = 100;

    // Equipment
    Object.entries(this.equipment).forEach(([key, equip]) => {
      if (y > itemY && y < itemY + 60 && x > w - 120) {
        if (this.money >= equip.price) {
          this.money -= equip.price;
          equip.owned++;
          this.xp += 10;
          this.checkLevelUp();
          this.checkEquipmentAchievements();
          this.saveProgress();
        }
      }
      itemY += 65;
    });

    // Power sources
    itemY += 30;
    Object.entries(this.powerSources).forEach(([key, power]) => {
      if (y > itemY && y < itemY + 55 && x > w - 120 && power.price > 0) {
        if (this.money >= power.price) {
          this.money -= power.price;
          power.owned++;
          this.checkEnergyAchievements();
          this.saveProgress();
        }
      }
      itemY += 60;
    });
  }

  handleMarketClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const w = this.canvas.width;
    const startY = 120;

    Object.entries(this.cryptos).forEach(([key, crypto], i) => {
      const cy = startY + i * 80;

      // Buy button
      if (y > cy && y < cy + 35 && x > w - 90 && x < w - 30) {
        const price = this.prices[key];
        if (this.money >= price) {
          this.money -= price;
          this.wallet[key] = (this.wallet[key] || 0) + 1;
          this.totalTrades++;
          this.checkTradeAchievements();
          this.saveProgress();
        }
      }

      // Sell button
      if (y > cy + 35 && y < cy + 70 && x > w - 90 && x < w - 30) {
        if ((this.wallet[key] || 0) > 0) {
          this.wallet[key]--;
          this.money += this.prices[key];
          this.totalTrades++;
          this.checkTradeAchievements();
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

    const w = this.canvas.width;
    const startY = 100;

    Object.entries(this.upgrades).forEach(([key, upg], i) => {
      const uy = startY + i * 80;

      if (y > uy && y < uy + 70 && x > w - 120) {
        const price = upg.basePrice * (upg.level + 1);
        if (this.money >= price && upg.level < upg.maxLevel) {
          this.money -= price;
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

  mine() {
    const hashBoost = 1 + this.upgrades.hashBoost.level * this.upgrades.hashBoost.effect;
    this.clickPower = 1 * hashBoost;

    this.miningProgress += this.clickPower;
    this.addParticles(this.canvas.width / 2, this.canvas.height / 2, '#f7931a', 5);

    if (this.miningProgress >= this.miningTarget) {
      this.miningProgress = 0;
      this.wallet[this.selectedCrypto] = (this.wallet[this.selectedCrypto] || 0) + 0.01;
      this.totalMined += 0.01;
      this.xp += 5;
      this.checkLevelUp();
      this.checkAchievement('first_coin');
      this.checkWalletAchievements();
      this.saveProgress();
    }
  }

  getTotalHashrate() {
    let total = 0;
    const hashBoost = 1 + this.upgrades.hashBoost.level * this.upgrades.hashBoost.effect;

    Object.values(this.equipment).forEach(equip => {
      total += equip.hashrate * equip.owned;
    });

    return total * hashBoost;
  }

  getTotalPowerUsage() {
    let total = 0;
    const efficiency = 1 - this.upgrades.efficiency.level * this.upgrades.efficiency.effect;

    Object.values(this.equipment).forEach(equip => {
      total += equip.power * equip.owned;
    });

    return Math.round(total * efficiency);
  }

  getTotalPowerCapacity() {
    let total = 0;
    Object.values(this.powerSources).forEach(power => {
      total += power.output * power.owned;
    });
    return total;
  }

  getEnergyCostPerSecond() {
    let cost = 0;
    Object.values(this.powerSources).forEach(power => {
      if (power.cost > 0 && power.owned > 0) {
        cost += power.cost * power.owned;
      }
    });
    return cost;
  }

  addParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
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
      this.money += 500;
      this.diamonds += 10;
      this.saveAchievements();
    }
  }

  checkTradeAchievements() {
    const ach = this.achievements.find(a => a.id === 'trader');
    if (ach && !ach.unlocked) {
      ach.progress = this.totalTrades;
      if (this.totalTrades >= ach.target) {
        this.checkAchievement('trader');
      }
      this.saveAchievements();
    }
  }

  checkWalletAchievements() {
    // Check for all cryptos
    const hasAll = Object.keys(this.cryptos).every(k => (this.wallet[k] || 0) > 0);
    if (hasAll) this.checkAchievement('all_cryptos');

    // Check for whale (100 BTC)
    if ((this.wallet.btc || 0) >= 100) this.checkAchievement('whale');
  }

  checkEquipmentAchievements() {
    const total = Object.values(this.equipment).reduce((sum, e) => sum + e.owned, 0);
    if (total >= 10) this.checkAchievement('miner_10');
  }

  checkEnergyAchievements() {
    // Check if using only clean energy
    const gridUsed = this.powerSources.grid.owned > 0;
    const hasClean = this.powerSources.solar.owned > 0 ||
                     this.powerSources.wind.owned > 0 ||
                     this.powerSources.nuclear.owned > 0;

    if (!gridUsed && hasClean && this.getTotalPowerCapacity() >= this.getTotalPowerUsage()) {
      this.checkAchievement('green_energy');
    }
  }

  checkLevelUp() {
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 5;
    }
  }

  updatePrices() {
    Object.keys(this.cryptos).forEach(key => {
      const crypto = this.cryptos[key];
      const change = (Math.random() - 0.5) * 2 * crypto.volatility;
      this.prices[key] = Math.max(1, this.prices[key] * (1 + change));

      // Keep price history
      this.priceHistory[key].push(this.prices[key]);
      if (this.priceHistory[key].length > 50) {
        this.priceHistory[key].shift();
      }
    });
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

    // Price updates
    this.priceTimer += dt;
    if (this.priceTimer >= 3000) {
      this.priceTimer = 0;
      this.updatePrices();
    }

    // Auto mining
    const hashrate = this.getTotalHashrate();
    const powerUsage = this.getTotalPowerUsage();
    const powerCapacity = this.getTotalPowerCapacity();

    if (hashrate > 0 && powerUsage <= powerCapacity) {
      this.miningTimer += dt;

      // Multi-mine upgrade
      const multiMineLevel = this.upgrades.multiMine.level;

      if (this.miningTimer >= 1000) {
        this.miningTimer = 0;

        const miningAmount = hashrate / 1000;

        if (multiMineLevel > 0) {
          // Mine multiple cryptos
          const cryptoKeys = Object.keys(this.cryptos);
          const mineCount = Math.min(1 + multiMineLevel, cryptoKeys.length);
          const amountPerCrypto = miningAmount / mineCount;

          for (let i = 0; i < mineCount; i++) {
            const key = cryptoKeys[i];
            this.wallet[key] = (this.wallet[key] || 0) + amountPerCrypto;
          }
        } else {
          this.wallet[this.selectedCrypto] = (this.wallet[this.selectedCrypto] || 0) + miningAmount;
        }

        this.totalMined += miningAmount;
        this.xp += Math.floor(hashrate / 10);
        this.checkLevelUp();
        this.checkAchievement('first_coin');
        this.checkWalletAchievements();
      }
    }

    // Energy cost
    this.energyCostTimer += dt;
    if (this.energyCostTimer >= 1000) {
      this.energyCostTimer = 0;
      const cost = this.getEnergyCostPerSecond();
      this.money = Math.max(0, this.money - cost);
    }

    // Auto sell
    if (this.upgrades.autoSell.level > 0) {
      this.autoSellTimer += dt;
      if (this.autoSellTimer >= 10000 / this.upgrades.autoSell.level) {
        this.autoSellTimer = 0;

        // Auto sell excess crypto
        Object.keys(this.wallet).forEach(key => {
          if ((this.wallet[key] || 0) > 10) {
            const sellAmount = 1;
            this.wallet[key] -= sellAmount;
            this.money += this.prices[key] * sellAmount;
            this.totalTrades++;
          }
        });

        this.saveProgress();
      }
    }

    // Check money achievements
    if (this.money >= 10000) this.checkAchievement('rich');
    if (this.money >= 1000000) this.checkAchievement('millionaire');
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#16213e');
    gradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.state) {
      case 'menu': this.drawMenu(); break;
      case 'mining': this.drawMining(); break;
      case 'shop': this.drawShop(); break;
      case 'market': this.drawMarket(); break;
      case 'upgrades': this.drawUpgrades(); break;
      case 'achievements': this.drawAchievements(); break;
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
      ctx.strokeStyle = '#f7931a';
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

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(22,33,62,0.95)';
    ctx.fillRect(w/2 - 180, h/2 - 140, 360, 280);
    ctx.strokeStyle = '#f7931a';
    ctx.lineWidth = 4;
    ctx.strokeRect(w/2 - 180, h/2 - 140, 360, 280);

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 70);

    ctx.fillStyle = '#f7931a';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 - 10);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 25 + i * 25);
    });

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Toque para continuar (${this.tutorialPage + 1}/${this.tutorialPages.length})`, w/2, h/2 + 110);
  }

  drawMenu() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'center';
    ctx.fillText('🪙 CRYPTO MINER 🪙', w/2, 60);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💵 $${this.money.toFixed(2)}   💎 ${this.diamonds}`, w/2, 95);
    ctx.fillText(`Nível ${this.level}   Hashrate: ${this.getTotalHashrate().toFixed(1)} H/s`, w/2, 120);

    // Coin animation
    const time = Date.now() / 500;
    ctx.font = '80px Arial';
    ctx.fillText('🪙', w/2 + Math.sin(time) * 10, h/2 - 100 + Math.cos(time * 2) * 5);

    const buttons = [
      { text: '⛏️ Minerar', y: h/2 - 60 },
      { text: '🛒 Loja', y: h/2 },
      { text: '📈 Mercado', y: h/2 + 60 },
      { text: '⬆️ Upgrades', y: h/2 + 120 },
      { text: '🏆 Conquistas', y: h/2 + 180 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(w/2 - 100, btn.y, 200, 50);
      ctx.strokeStyle = '#f7931a';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 100, btn.y, 200, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 32);
    });
  }

  drawMining() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Back button
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#f7931a';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Menu', 50, 35);

    // Money display
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`$${this.money.toFixed(2)}`, w - 20, 35);

    // Crypto selector
    const cryptoKeys = Object.keys(this.cryptos);
    const tabWidth = (w - 20) / cryptoKeys.length;

    cryptoKeys.forEach((key, i) => {
      const crypto = this.cryptos[key];
      const tx = 10 + i * tabWidth;

      ctx.fillStyle = key === this.selectedCrypto ? '#f7931a' : '#1a1a2e';
      ctx.fillRect(tx, 60, tabWidth - 5, 45);

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${crypto.emoji} ${crypto.symbol}`, tx + tabWidth/2 - 2, 78);
      ctx.font = '10px Arial';
      ctx.fillText((this.wallet[key] || 0).toFixed(4), tx + tabWidth/2 - 2, 95);
    });

    // Mining area
    const selectedCrypto = this.cryptos[this.selectedCrypto];

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(20, 120, w - 40, h - 240);
    ctx.strokeStyle = '#f7931a';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 120, w - 40, h - 240);

    // Current crypto display
    ctx.font = '100px Arial';
    ctx.textAlign = 'center';
    const coinY = h/2 - 20;
    ctx.fillText(selectedCrypto.emoji, w/2, coinY);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#f7931a';
    ctx.fillText(selectedCrypto.name, w/2, coinY + 60);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`$${this.prices[this.selectedCrypto].toFixed(2)}`, w/2, coinY + 90);

    // Mining progress
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(w/2 - 100, coinY + 110, 200, 20);
    ctx.fillStyle = '#f7931a';
    ctx.fillRect(w/2 - 100, coinY + 110, 200 * (this.miningProgress / this.miningTarget), 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(w/2 - 100, coinY + 110, 200, 20);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Toque para minerar!', w/2, coinY + 155);

    // Stats
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, h - 100, w, 100);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ Hashrate: ${this.getTotalHashrate().toFixed(1)} H/s`, 20, h - 70);
    ctx.fillText(`🔌 Energia: ${this.getTotalPowerUsage()}/${this.getTotalPowerCapacity()} W`, 20, h - 45);
    ctx.fillText(`💵 Custo/s: $${this.getEnergyCostPerSecond().toFixed(2)}`, 20, h - 20);

    ctx.textAlign = 'right';
    ctx.fillText(`📊 Total minerado: ${this.totalMined.toFixed(4)}`, w - 20, h - 70);
    ctx.fillText(`📈 Trades: ${this.totalTrades}`, w - 20, h - 45);
  }

  drawShop() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 Loja', w/2, 40);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`$${this.money.toFixed(2)}`, w/2, 65);

    // Back button
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#f7931a';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    // Equipment section
    ctx.fillStyle = '#f7931a';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('EQUIPAMENTOS', 25, 95);

    let itemY = 105;
    Object.entries(this.equipment).forEach(([key, equip]) => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(20, itemY, w - 40, 58);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(20, itemY, w - 40, 58);

      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(equip.emoji, 30, itemY + 40);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`${equip.name} (${equip.owned})`, 70, itemY + 22);
      ctx.font = '10px Arial';
      ctx.fillStyle = '#888';
      ctx.fillText(`⚡${equip.hashrate} H/s  🔌${equip.power}W`, 70, itemY + 42);

      ctx.textAlign = 'right';
      ctx.fillStyle = this.money >= equip.price ? '#4CAF50' : '#666';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`$${equip.price}`, w - 35, itemY + 35);

      itemY += 63;
    });

    // Power sources section
    itemY += 15;
    ctx.fillStyle = '#f7931a';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ENERGIA', 25, itemY);
    itemY += 15;

    Object.entries(this.powerSources).forEach(([key, power]) => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(20, itemY, w - 40, 52);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(20, itemY, w - 40, 52);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${power.name} (${power.owned})`, 30, itemY + 22);
      ctx.font = '10px Arial';
      ctx.fillStyle = '#888';
      ctx.fillText(`⚡${power.output}W  💵$${power.cost}/s`, 30, itemY + 40);

      if (power.price > 0) {
        ctx.textAlign = 'right';
        ctx.fillStyle = this.money >= power.price ? '#4CAF50' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`$${power.price}`, w - 35, itemY + 32);
      }

      itemY += 57;
    });
  }

  drawMarket() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'center';
    ctx.fillText('📈 Mercado', w/2, 40);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`$${this.money.toFixed(2)}`, w/2, 65);

    // Back button
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#f7931a';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    // Wallet summary
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(20, 80, w - 40, 30);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    let walletX = 30;
    Object.entries(this.wallet).forEach(([key, amount]) => {
      if (amount > 0) {
        ctx.fillText(`${this.cryptos[key].emoji}${amount.toFixed(2)}`, walletX, 100);
        walletX += 70;
      }
    });

    const startY = 120;
    Object.entries(this.cryptos).forEach(([key, crypto], i) => {
      const cy = startY + i * 80;
      const price = this.prices[key];
      const owned = this.wallet[key] || 0;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(20, cy, w - 40, 75);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(20, cy, w - 40, 75);

      // Crypto info
      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(crypto.emoji, 30, cy + 45);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(crypto.name, 75, cy + 25);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#888';
      ctx.fillText(`${crypto.symbol}  Você tem: ${owned.toFixed(4)}`, 75, cy + 45);

      // Price
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`$${price.toFixed(2)}`, 75, cy + 65);

      // Mini chart
      const history = this.priceHistory[key];
      if (history.length > 1) {
        const chartX = w/2 - 30;
        const chartW = 80;
        const chartH = 30;
        const chartY = cy + 25;

        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 1;
        ctx.beginPath();

        const minPrice = Math.min(...history);
        const maxPrice = Math.max(...history);
        const range = maxPrice - minPrice || 1;

        history.forEach((p, idx) => {
          const px = chartX + (idx / history.length) * chartW;
          const py = chartY + chartH - ((p - minPrice) / range) * chartH;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      // Buy/Sell buttons
      ctx.fillStyle = this.money >= price ? '#4CAF50' : '#333';
      ctx.fillRect(w - 85, cy + 5, 55, 30);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('COMPRAR', w - 57, cy + 25);

      ctx.fillStyle = owned > 0 ? '#e74c3c' : '#333';
      ctx.fillRect(w - 85, cy + 40, 55, 30);
      ctx.fillStyle = '#fff';
      ctx.fillText('VENDER', w - 57, cy + 60);
    });
  }

  drawUpgrades() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️ Upgrades', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`$${this.money.toFixed(2)}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#f7931a';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const descriptions = {
      hashBoost: 'Aumenta poder de mineração',
      efficiency: 'Reduz consumo de energia',
      autoSell: 'Vende crypto automaticamente',
      multiMine: 'Minera múltiplas cryptos'
    };

    const startY = 100;
    Object.entries(this.upgrades).forEach(([key, upg], i) => {
      const y = startY + i * 80;
      const price = upg.basePrice * (upg.level + 1);
      const canBuy = this.money >= price && upg.level < upg.maxLevel;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(20, y, w - 40, 70);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(upg.name, 35, y + 25);
      ctx.font = '11px Arial';
      ctx.fillStyle = '#888';
      ctx.fillText(descriptions[key], 35, y + 45);

      // Level bar
      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(35, y + 50, 120, 12);
      ctx.fillStyle = '#f7931a';
      ctx.fillRect(35, y + 50, 120 * (upg.level / upg.maxLevel), 12);
      ctx.fillStyle = '#fff';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${upg.level}/${upg.maxLevel}`, 95, y + 60);

      ctx.textAlign = 'right';
      if (upg.level >= upg.maxLevel) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('MÁXIMO', w - 35, y + 45);
      } else {
        ctx.fillStyle = canBuy ? '#4CAF50' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`$${price}`, w - 35, y + 45);
      }
    });
  }

  drawAchievements() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#f7931a';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Conquistas', w/2, 50);

    // Back button
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#f7931a';
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

      ctx.fillStyle = ach.unlocked ? '#1a3a2e' : '#1a1a2e';
      ctx.fillRect(x, y, itemW, 65);
      ctx.strokeStyle = ach.unlocked ? '#f7931a' : '#333';
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

      if (ach.progress !== undefined && !ach.unlocked) {
        ctx.fillStyle = '#0f0f1a';
        ctx.fillRect(x + 45, y + 50, itemW - 60, 8);
        ctx.fillStyle = '#f7931a';
        ctx.fillRect(x + 45, y + 50, (itemW - 60) * (ach.progress / ach.target), 8);
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
  setTimeout(() => new CryptoMinerEmpire(), 1600);
});
