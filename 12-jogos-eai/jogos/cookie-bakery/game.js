// Cookie Bakery Tycoon - Clicker/Idle Avançado
class CookieBakeryGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_cookiebakery_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo a Padaria!', lines: ['Clique no cookie para produzir!', 'Quanto mais clica, mais ganha!', '', 'Torne-se um magnata!'], emoji: '🍪' },
      { title: 'Producao Automatica', lines: ['Compre ajudantes na loja', 'Eles produzem cookies sozinhos!', 'Diferentes ajudantes = mais poder', ''], emoji: '🏭' },
      { title: 'Upgrades', lines: ['Melhore sua producao!', 'Upgrades de clique e automatico', 'Desbloqueie novos items', 'Alcance bilhoes de cookies!'], emoji: '⬆️' },
      { title: 'Conquistas', lines: ['Complete desafios para bonus!', 'Suba de nivel para recompensas', 'Colecione todos os badges!', 'Boa sorte!'], emoji: '🏆' }
    ];

    // Core currencies
    this.cookies = parseFloat(localStorage.getItem('cookiebakery_cookies') || '0');
    this.totalCookies = parseFloat(localStorage.getItem('cookiebakery_total') || '0');
    this.diamonds = parseInt(localStorage.getItem('cookiebakery_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('cookiebakery_xp') || '0');
    this.level = parseInt(localStorage.getItem('cookiebakery_level') || '1');

    // Click power
    this.clickPower = parseFloat(localStorage.getItem('cookiebakery_click') || '1');
    this.cookiesPerSecond = 0;

    // Buildings/Producers
    this.buildings = [
      { id: 'cursor', name: 'Cursor', emoji: '👆', baseCost: 15, baseProduction: 0.1, owned: 0, multiplier: 1 },
      { id: 'grandma', name: 'Vovó', emoji: '👵', baseCost: 100, baseProduction: 1, owned: 0, multiplier: 1 },
      { id: 'farm', name: 'Fazenda', emoji: '🌾', baseCost: 1100, baseProduction: 8, owned: 0, multiplier: 1 },
      { id: 'mine', name: 'Mina', emoji: '⛏️', baseCost: 12000, baseProduction: 47, owned: 0, multiplier: 1 },
      { id: 'factory', name: 'Fabrica', emoji: '🏭', baseCost: 130000, baseProduction: 260, owned: 0, multiplier: 1 },
      { id: 'bank', name: 'Banco', emoji: '🏦', baseCost: 1400000, baseProduction: 1400, owned: 0, multiplier: 1 },
      { id: 'temple', name: 'Templo', emoji: '🏛️', baseCost: 20000000, baseProduction: 7800, owned: 0, multiplier: 1 },
      { id: 'wizard', name: 'Torre Magica', emoji: '🧙', baseCost: 330000000, baseProduction: 44000, owned: 0, multiplier: 1 },
      { id: 'ship', name: 'Nave Espacial', emoji: '🚀', baseCost: 5100000000, baseProduction: 260000, owned: 0, multiplier: 1 },
      { id: 'portal', name: 'Portal', emoji: '🌀', baseCost: 75000000000, baseProduction: 1600000, owned: 0, multiplier: 1 }
    ];

    // Upgrades
    this.upgrades = [
      { id: 'click1', name: 'Dedos Fortes', desc: '+1 cookie por clique', cost: 100, type: 'click', value: 1, bought: false },
      { id: 'click2', name: 'Maos de Ferro', desc: '+5 cookies por clique', cost: 500, type: 'click', value: 5, bought: false },
      { id: 'click3', name: 'Super Clique', desc: '+25 cookies por clique', cost: 5000, type: 'click', value: 25, bought: false },
      { id: 'click4', name: 'Mega Clique', desc: '+100 cookies por clique', cost: 50000, type: 'click', value: 100, bought: false },
      { id: 'click5', name: 'Ultra Clique', desc: '+500 cookies por clique', cost: 500000, type: 'click', value: 500, bought: false },
      { id: 'cursor1', name: 'Cursor Duplo', desc: 'Cursores 2x mais rapidos', cost: 100, type: 'mult', building: 'cursor', value: 2, bought: false },
      { id: 'grandma1', name: 'Receita Secreta', desc: 'Vovos 2x mais eficientes', cost: 1000, type: 'mult', building: 'grandma', value: 2, bought: false },
      { id: 'farm1', name: 'Fertilizante', desc: 'Fazendas 2x mais produtivas', cost: 11000, type: 'mult', building: 'farm', value: 2, bought: false },
      { id: 'factory1', name: 'Automacao', desc: 'Fabricas 2x mais rapidas', cost: 130000, type: 'mult', building: 'factory', value: 2, bought: false },
      { id: 'global1', name: 'Cookie Dourado', desc: 'Toda producao +10%', cost: 1000000, type: 'global', value: 1.1, bought: false },
      { id: 'global2', name: 'Bencao do Cookie', desc: 'Toda producao +25%', cost: 10000000, type: 'global', value: 1.25, bought: false },
      { id: 'global3', name: 'Era do Cookie', desc: 'Toda producao +50%', cost: 100000000, type: 'global', value: 1.5, bought: false }
    ];

    // Achievements
    this.achievements = [
      { id: 'click100', name: 'Iniciante', desc: 'Clique 100 vezes', progress: 0, target: 100, reward: 50, unlocked: false },
      { id: 'click1000', name: 'Dedicado', desc: 'Clique 1000 vezes', progress: 0, target: 1000, reward: 200, unlocked: false },
      { id: 'cookie1000', name: 'Padeiro', desc: 'Produza 1000 cookies', progress: 0, target: 1000, reward: 100, unlocked: false },
      { id: 'cookie1m', name: 'Mestre Padeiro', desc: 'Produza 1 milhao de cookies', progress: 0, target: 1000000, reward: 500, unlocked: false },
      { id: 'cookie1b', name: 'Imperador Cookie', desc: 'Produza 1 bilhao de cookies', progress: 0, target: 1000000000, reward: 2000, unlocked: false },
      { id: 'building10', name: 'Construtor', desc: 'Tenha 10 predios', progress: 0, target: 10, reward: 100, unlocked: false },
      { id: 'building50', name: 'Magnata', desc: 'Tenha 50 predios', progress: 0, target: 50, reward: 500, unlocked: false },
      { id: 'cps100', name: 'Automatizado', desc: 'Produza 100 cookies/s', progress: 0, target: 100, reward: 200, unlocked: false },
      { id: 'cps10000', name: 'Industrial', desc: 'Produza 10000 cookies/s', progress: 0, target: 10000, reward: 1000, unlocked: false },
      { id: 'level10', name: 'Experiente', desc: 'Alcance nivel 10', progress: 0, target: 10, reward: 300, unlocked: false }
    ];

    // Stats
    this.totalClicks = parseInt(localStorage.getItem('cookiebakery_clicks') || '0');
    this.globalMultiplier = 1;

    // Animation
    this.particles = [];
    this.cookieScale = 1;
    this.goldenCookie = null;
    this.notifications = [];

    // Game state
    this.gameState = 'game'; // game, shop, upgrades, achievements

    this.loadProgress();
    this.calculateCPS();
    this.setupControls();
    this.startAutoSave();
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

    // Golden cookie check
    if (this.goldenCookie) {
      const dx = x - this.goldenCookie.x;
      const dy = y - this.goldenCookie.y;
      if (dx * dx + dy * dy < 40 * 40) {
        this.collectGoldenCookie();
        return;
      }
    }

    if (this.gameState === 'game') {
      // Main cookie click
      const cookieY = 280;
      const dx = x - centerX;
      const dy = y - cookieY;
      if (dx * dx + dy * dy < 80 * 80) {
        this.clickCookie(x, y);
        return;
      }

      // Tab buttons
      const tabs = ['Loja', 'Upgrades', 'Conquistas'];
      tabs.forEach((tab, i) => {
        const tx = 60 + i * 100;
        if (x > tx - 45 && x < tx + 45 && y > this.canvas.height - 55 && y < this.canvas.height - 15) {
          if (i === 0) this.gameState = 'shop';
          else if (i === 1) this.gameState = 'upgrades';
          else this.gameState = 'achievements';
        }
      });
    } else {
      // Back button in other screens
      if (x > 20 && x < 100 && y > 50 && y < 90) {
        this.gameState = 'game';
        return;
      }

      if (this.gameState === 'shop') {
        this.handleShopClick(x, y);
      } else if (this.gameState === 'upgrades') {
        this.handleUpgradesClick(x, y);
      }
    }
  }

  handleTutorialClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    if (x > centerX - 60 && x < centerX + 60 && y > centerY + 100 && y < centerY + 140) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_cookiebakery_tutorial_seen', 'true');
      }
    }
    if (x > centerX - 40 && x < centerX + 40 && y > centerY + 150 && y < centerY + 180) {
      this.showTutorial = false;
      localStorage.setItem('eai_cookiebakery_tutorial_seen', 'true');
    }
  }

  handleShopClick(x, y) {
    const startY = 120;
    this.buildings.forEach((b, i) => {
      const by = startY + i * 60;
      if (y > by && y < by + 55 && x > this.canvas.width - 120) {
        this.buyBuilding(i);
      }
    });
  }

  handleUpgradesClick(x, y) {
    const startY = 120;
    const availableUpgrades = this.upgrades.filter(u => !u.bought);
    availableUpgrades.forEach((u, i) => {
      const uy = startY + i * 70;
      if (y > uy && y < uy + 65 && x > this.canvas.width - 120) {
        this.buyUpgrade(u);
      }
    });
  }

  clickCookie(x, y) {
    const gained = this.clickPower;
    this.cookies += gained;
    this.totalCookies += gained;
    this.totalClicks++;
    this.cookieScale = 1.2;

    // Particles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 3,
        text: '+' + this.formatNumber(gained),
        life: 1000,
        size: 16 + Math.random() * 8
      });
    }

    this.addXP(1);
    this.checkAchievements();
  }

  buyBuilding(index) {
    const building = this.buildings[index];
    const cost = this.getBuildingCost(building);

    if (this.cookies >= cost) {
      this.cookies -= cost;
      building.owned++;
      this.calculateCPS();
      this.addXP(10);
      this.checkAchievements();
      this.saveProgress();
    }
  }

  getBuildingCost(building) {
    return Math.floor(building.baseCost * Math.pow(1.15, building.owned));
  }

  buyUpgrade(upgrade) {
    if (this.cookies >= upgrade.cost && !upgrade.bought) {
      this.cookies -= upgrade.cost;
      upgrade.bought = true;

      if (upgrade.type === 'click') {
        this.clickPower += upgrade.value;
      } else if (upgrade.type === 'mult') {
        const building = this.buildings.find(b => b.id === upgrade.building);
        if (building) building.multiplier *= upgrade.value;
      } else if (upgrade.type === 'global') {
        this.globalMultiplier *= upgrade.value;
      }

      this.calculateCPS();
      this.addXP(50);
      this.addNotification(`Comprou: ${upgrade.name}!`);
      this.saveProgress();
    }
  }

  calculateCPS() {
    this.cookiesPerSecond = 0;
    this.buildings.forEach(b => {
      this.cookiesPerSecond += b.owned * b.baseProduction * b.multiplier;
    });
    this.cookiesPerSecond *= this.globalMultiplier;
  }

  collectGoldenCookie() {
    const bonus = this.cookiesPerSecond * 60 + this.clickPower * 100;
    this.cookies += bonus;
    this.totalCookies += bonus;
    this.diamonds++;

    this.addNotification(`Cookie Dourado! +${this.formatNumber(bonus)} cookies!`);
    this.addXP(100);

    // Explosion effect
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      this.particles.push({
        x: this.goldenCookie.x,
        y: this.goldenCookie.y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        text: '✨',
        life: 1000,
        size: 20
      });
    }

    this.goldenCookie = null;
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += this.level;
      this.addNotification(`Level Up! Nivel ${this.level} - +${this.level} diamantes!`);
    }
  }

  addNotification(text) {
    this.notifications.push({
      text,
      y: 100,
      alpha: 1,
      life: 3000
    });
  }

  checkAchievements() {
    const totalBuildings = this.buildings.reduce((sum, b) => sum + b.owned, 0);

    const checks = [
      { id: 'click100', progress: this.totalClicks, target: 100 },
      { id: 'click1000', progress: this.totalClicks, target: 1000 },
      { id: 'cookie1000', progress: this.totalCookies, target: 1000 },
      { id: 'cookie1m', progress: this.totalCookies, target: 1000000 },
      { id: 'cookie1b', progress: this.totalCookies, target: 1000000000 },
      { id: 'building10', progress: totalBuildings, target: 10 },
      { id: 'building50', progress: totalBuildings, target: 50 },
      { id: 'cps100', progress: this.cookiesPerSecond, target: 100 },
      { id: 'cps10000', progress: this.cookiesPerSecond, target: 10000 },
      { id: 'level10', progress: this.level, target: 10 }
    ];

    checks.forEach(check => {
      const ach = this.achievements.find(a => a.id === check.id);
      if (ach) {
        ach.progress = check.progress;
        if (!ach.unlocked && check.progress >= check.target) {
          ach.unlocked = true;
          this.cookies += ach.reward;
          this.addNotification(`🏆 ${ach.name}! +${ach.reward} cookies`);
        }
      }
    });
  }

  formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(2) + 'B';
    return (num / 1000000000000).toFixed(2) + 'T';
  }

  update(deltaTime) {
    // Cookie scale animation
    if (this.cookieScale > 1) {
      this.cookieScale -= deltaTime * 0.003;
      if (this.cookieScale < 1) this.cookieScale = 1;
    }

    // Auto production
    const production = (this.cookiesPerSecond * deltaTime) / 1000;
    this.cookies += production;
    this.totalCookies += production;

    // Golden cookie spawn
    if (!this.goldenCookie && Math.random() < 0.0001) {
      this.goldenCookie = {
        x: 100 + Math.random() * (this.canvas.width - 200),
        y: 150 + Math.random() * 200,
        life: 10000
      };
    }

    if (this.goldenCookie) {
      this.goldenCookie.life -= deltaTime;
      if (this.goldenCookie.life <= 0) {
        this.goldenCookie = null;
      }
    }

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= deltaTime;
      return p.life > 0;
    });

    // Notifications
    this.notifications = this.notifications.filter(n => {
      n.y -= 0.5;
      n.life -= deltaTime;
      n.alpha = Math.min(1, n.life / 1000);
      return n.life > 0;
    });

    // Check achievements periodically
    if (Math.random() < 0.01) {
      this.checkAchievements();
    }
  }

  draw() {
    // Background gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#D2691E');
    gradient.addColorStop(1, '#8B4513');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    // Currency bar
    this.drawCurrencyBar();

    switch (this.gameState) {
      case 'game': this.drawGame(); break;
      case 'shop': this.drawShop(); break;
      case 'upgrades': this.drawUpgrades(); break;
      case 'achievements': this.drawAchievements(); break;
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life / 1000;
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = `bold ${p.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(p.text, p.x, p.y);
      this.ctx.globalAlpha = 1;
    });

    // Notifications
    this.notifications.forEach(n => {
      this.ctx.globalAlpha = n.alpha;
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(n.text, this.canvas.width / 2, n.y);
      this.ctx.globalAlpha = 1;
    });

    // Golden cookie
    if (this.goldenCookie) {
      const pulse = Math.sin(Date.now() * 0.01) * 5;
      this.ctx.font = `${40 + pulse}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🌟', this.goldenCookie.x, this.goldenCookie.y);
    }
  }

  drawCurrencyBar() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, 45);

    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';

    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`🍪 ${this.formatNumber(this.cookies)}`, 15, 20);

    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillText(`💎 ${this.diamonds}`, 15, 38);

    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillText(`${this.formatNumber(this.cookiesPerSecond)}/s`, this.canvas.width - 15, 20);

    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`Nv.${this.level}`, this.canvas.width - 15, 38);
  }

  drawTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#FFF8DC';
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 4;
    const boxWidth = Math.min(350, this.canvas.width - 40);
    ctx.fillRect(centerX - boxWidth/2, centerY - 130, boxWidth, 300);
    ctx.strokeRect(centerX - boxWidth/2, centerY - 130, boxWidth, 300);

    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 70);

    ctx.fillStyle = '#8B4513';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 20);

    ctx.fillStyle = '#5D3A1A';
    ctx.font = '15px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 15 + i * 22);
    });

    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 115);

    ctx.fillStyle = '#D2691E';
    ctx.fillRect(centerX - 60, centerY + 100, 120, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(this.tutorialPage < this.tutorialPages.length - 1 ? 'Proximo' : 'Jogar!', centerX, centerY + 125);

    ctx.fillStyle = '#ccc';
    ctx.font = '14px Arial';
    ctx.fillText('Pular', centerX, centerY + 165);
  }

  drawGame() {
    const centerX = this.canvas.width / 2;

    // Main cookie
    const cookieY = 280;
    const baseSize = 120 * this.cookieScale;

    // Shadow
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, cookieY + 70, baseSize * 0.6, baseSize * 0.2, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fill();

    // Cookie
    this.ctx.font = `${baseSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🍪', centerX, cookieY + baseSize * 0.35);

    // Click power display
    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(`+${this.formatNumber(this.clickPower)} por clique`, centerX, cookieY + 100);

    // Quick stats
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(20, 400, this.canvas.width - 40, 100);

    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Total produzido: ${this.formatNumber(this.totalCookies)}`, 35, 425);
    this.ctx.fillText(`Total de cliques: ${this.formatNumber(this.totalClicks)}`, 35, 450);
    this.ctx.fillText(`Producao por segundo: ${this.formatNumber(this.cookiesPerSecond)}`, 35, 475);

    // Buildings summary
    this.ctx.textAlign = 'right';
    const totalBuildings = this.buildings.reduce((sum, b) => sum + b.owned, 0);
    this.ctx.fillText(`Predios: ${totalBuildings}`, this.canvas.width - 35, 425);
    this.ctx.fillText(`Upgrades: ${this.upgrades.filter(u => u.bought).length}/${this.upgrades.length}`, this.canvas.width - 35, 450);

    // Tab buttons
    const tabs = [
      { text: '🏪 Loja', color: '#4ECDC4' },
      { text: '⬆️ Upgrades', color: '#FFD93D' },
      { text: '🏆 Conquistas', color: '#FF6B6B' }
    ];

    tabs.forEach((tab, i) => {
      const tx = 60 + i * 100;
      this.ctx.fillStyle = tab.color;
      this.ctx.fillRect(tx - 45, this.canvas.height - 55, 90, 40);
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(tab.text, tx, this.canvas.height - 30);
    });
  }

  drawShop() {
    // Back button
    this.ctx.fillStyle = '#D2691E';
    this.ctx.fillRect(20, 50, 80, 35);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 73);

    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('🏪 Loja de Predios', this.canvas.width / 2, 75);

    const startY = 120;
    this.buildings.forEach((b, i) => {
      const y = startY + i * 60;
      const cost = this.getBuildingCost(b);
      const canBuy = this.cookies >= cost;

      this.ctx.fillStyle = canBuy ? 'rgba(255,255,255,0.9)' : 'rgba(200,200,200,0.7)';
      this.ctx.fillRect(20, y, this.canvas.width - 40, 55);
      this.ctx.strokeStyle = canBuy ? '#4CAF50' : '#999';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(20, y, this.canvas.width - 40, 55);

      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(b.emoji, 35, y + 38);

      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillText(b.name, 75, y + 22);

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#666';
      this.ctx.fillText(`+${this.formatNumber(b.baseProduction * b.multiplier)}/s cada`, 75, y + 40);

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(b.owned.toString(), this.canvas.width - 160, y + 35);

      // Buy button
      this.ctx.fillStyle = canBuy ? '#4CAF50' : '#999';
      this.ctx.fillRect(this.canvas.width - 115, y + 10, 90, 35);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.fillText(`🍪${this.formatNumber(cost)}`, this.canvas.width - 70, y + 32);
    });
  }

  drawUpgrades() {
    // Back button
    this.ctx.fillStyle = '#D2691E';
    this.ctx.fillRect(20, 50, 80, 35);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 73);

    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('⬆️ Upgrades', this.canvas.width / 2, 75);

    const startY = 120;
    const availableUpgrades = this.upgrades.filter(u => !u.bought);

    if (availableUpgrades.length === 0) {
      this.ctx.fillStyle = '#FFE4B5';
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Todos os upgrades comprados!', this.canvas.width / 2, 200);
      return;
    }

    availableUpgrades.forEach((u, i) => {
      const y = startY + i * 70;
      const canBuy = this.cookies >= u.cost;

      this.ctx.fillStyle = canBuy ? 'rgba(255,255,255,0.9)' : 'rgba(200,200,200,0.7)';
      this.ctx.fillRect(20, y, this.canvas.width - 40, 65);
      this.ctx.strokeStyle = canBuy ? '#FFD93D' : '#999';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(20, y, this.canvas.width - 40, 65);

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillText(u.name, 35, y + 25);

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#666';
      this.ctx.fillText(u.desc, 35, y + 45);

      // Buy button
      this.ctx.fillStyle = canBuy ? '#FFD93D' : '#999';
      this.ctx.fillRect(this.canvas.width - 115, y + 15, 90, 35);
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`🍪${this.formatNumber(u.cost)}`, this.canvas.width - 70, y + 37);
    });
  }

  drawAchievements() {
    // Back button
    this.ctx.fillStyle = '#D2691E';
    this.ctx.fillRect(20, 50, 80, 35);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← Voltar', 60, 73);

    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('🏆 Conquistas', this.canvas.width / 2, 75);

    const unlocked = this.achievements.filter(a => a.unlocked).length;
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`${unlocked}/${this.achievements.length} desbloqueadas`, this.canvas.width / 2, 100);

    const startY = 120;
    this.achievements.forEach((a, i) => {
      const y = startY + i * 55;

      this.ctx.fillStyle = a.unlocked ? 'rgba(76, 175, 80, 0.3)' : 'rgba(100,100,100,0.3)';
      this.ctx.fillRect(20, y, this.canvas.width - 40, 50);

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = a.unlocked ? '#4CAF50' : '#999';
      this.ctx.font = 'bold 13px Arial';
      this.ctx.fillText((a.unlocked ? '✅ ' : '🔒 ') + a.name, 30, y + 22);

      this.ctx.font = '11px Arial';
      this.ctx.fillStyle = '#ccc';
      this.ctx.fillText(a.desc, 30, y + 40);

      // Progress bar
      if (!a.unlocked) {
        const barWidth = 100;
        const progress = Math.min(1, a.progress / a.target);
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(this.canvas.width - 140, y + 15, barWidth, 10);
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.fillRect(this.canvas.width - 140, y + 15, barWidth * progress, 10);

        this.ctx.textAlign = 'center';
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillText(`${this.formatNumber(a.progress)}/${this.formatNumber(a.target)}`, this.canvas.width - 90, y + 40);
      }

      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(`+${a.reward}🍪`, this.canvas.width - 30, y + 22);
    });
  }

  startAutoSave() {
    setInterval(() => this.saveProgress(), 10000);
  }

  saveProgress() {
    localStorage.setItem('cookiebakery_cookies', this.cookies);
    localStorage.setItem('cookiebakery_total', this.totalCookies);
    localStorage.setItem('cookiebakery_diamonds', this.diamonds);
    localStorage.setItem('cookiebakery_xp', this.xp);
    localStorage.setItem('cookiebakery_level', this.level);
    localStorage.setItem('cookiebakery_clicks', this.totalClicks);
    localStorage.setItem('cookiebakery_click', this.clickPower);
    localStorage.setItem('cookiebakery_buildings', JSON.stringify(this.buildings));
    localStorage.setItem('cookiebakery_upgrades', JSON.stringify(this.upgrades));
    localStorage.setItem('cookiebakery_achievements', JSON.stringify(this.achievements));
  }

  loadProgress() {
    const buildings = localStorage.getItem('cookiebakery_buildings');
    if (buildings) {
      const saved = JSON.parse(buildings);
      saved.forEach((s, i) => {
        if (this.buildings[i]) {
          this.buildings[i].owned = s.owned;
          this.buildings[i].multiplier = s.multiplier || 1;
        }
      });
    }

    const upgrades = localStorage.getItem('cookiebakery_upgrades');
    if (upgrades) {
      const saved = JSON.parse(upgrades);
      saved.forEach((s, i) => {
        if (this.upgrades[i]) {
          this.upgrades[i].bought = s.bought;
        }
      });
    }

    const achievements = localStorage.getItem('cookiebakery_achievements');
    if (achievements) {
      const saved = JSON.parse(achievements);
      saved.forEach((s, i) => {
        if (this.achievements[i]) {
          this.achievements[i].unlocked = s.unlocked;
          this.achievements[i].progress = s.progress || 0;
        }
      });
    }

    // Recalculate click power from upgrades
    this.clickPower = 1;
    this.globalMultiplier = 1;
    this.upgrades.forEach(u => {
      if (u.bought) {
        if (u.type === 'click') this.clickPower += u.value;
        else if (u.type === 'global') this.globalMultiplier *= u.value;
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

window.addEventListener('load', () => new CookieBakeryGame());
