// Galaxy Conquest - EAI Games
// Jogo de conquista espacial estratégico para adolescentes

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class GalaxyConquest {
  constructor() {
    this.state = 'menu';
    this.credits = parseInt(localStorage.getItem('eai_galaxy_credits') || '1000');
    this.crystals = parseInt(localStorage.getItem('eai_galaxy_crystals') || '50');
    this.xp = parseInt(localStorage.getItem('eai_galaxy_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_galaxy_level') || '1');
    this.totalPlanets = parseInt(localStorage.getItem('eai_galaxy_planets') || '0');

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_galaxy_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo Comandante!', lines: ['Você é o líder de um', 'império galáctico em expansão!'], emoji: '🌌' },
      { title: 'Conquiste Planetas', lines: ['Explore sistemas estelares', 'e conquiste novos mundos!'], emoji: '🪐' },
      { title: 'Construa sua Frota', lines: ['Monte uma armada poderosa', 'de naves espaciais!'], emoji: '🚀' },
      { title: 'Recursos', lines: ['Colete créditos e cristais', 'para expandir seu império!'], emoji: '💎' },
      { title: 'Domine a Galáxia!', lines: ['Enfrente inimigos e', 'torne-se o Imperador!'], emoji: '👑' }
    ];

    // Star systems
    this.systems = [
      { id: 'sol', name: 'Sistema Solar', emoji: '☀️', planets: 8, conquered: 0, difficulty: 1, unlocked: true },
      { id: 'alpha', name: 'Alpha Centauri', emoji: '⭐', planets: 6, conquered: 0, difficulty: 2, unlocked: false },
      { id: 'sirius', name: 'Sirius', emoji: '💫', planets: 10, conquered: 0, difficulty: 3, unlocked: false },
      { id: 'vega', name: 'Vega', emoji: '✨', planets: 8, conquered: 0, difficulty: 4, unlocked: false },
      { id: 'polaris', name: 'Polaris', emoji: '🌟', planets: 12, conquered: 0, difficulty: 5, unlocked: false },
      { id: 'andromeda', name: 'Andrômeda', emoji: '🌌', planets: 15, conquered: 0, difficulty: 6, unlocked: false }
    ];
    this.loadSystems();
    this.currentSystem = null;

    // Ships
    this.ships = [
      { id: 'scout', name: 'Explorador', emoji: '🛸', hp: 50, atk: 10, speed: 3, cost: 100, owned: 5 },
      { id: 'fighter', name: 'Caça', emoji: '🚀', hp: 80, atk: 25, speed: 2, cost: 300, owned: 0 },
      { id: 'cruiser', name: 'Cruzador', emoji: '🛰️', hp: 150, atk: 40, speed: 1, cost: 800, owned: 0 },
      { id: 'destroyer', name: 'Destruidor', emoji: '⚔️', hp: 250, atk: 60, speed: 1, cost: 1500, owned: 0 },
      { id: 'carrier', name: 'Porta-naves', emoji: '🎖️', hp: 400, atk: 30, speed: 1, cost: 3000, owned: 0 },
      { id: 'dreadnought', name: 'Dreadnought', emoji: '👑', hp: 600, atk: 100, speed: 1, cost: 5000, owned: 0 }
    ];
    this.loadShips();
    this.selectedFleet = [];

    // Technologies
    this.technologies = [
      { id: 'weapons', name: 'Armas', emoji: '🔫', level: 1, effect: '+10% dano', maxLevel: 10 },
      { id: 'shields', name: 'Escudos', emoji: '🛡️', level: 1, effect: '+10% HP', maxLevel: 10 },
      { id: 'engines', name: 'Motores', emoji: '⚡', level: 1, effect: '+10% velocidade', maxLevel: 10 },
      { id: 'mining', name: 'Mineração', emoji: '⛏️', level: 1, effect: '+10% créditos', maxLevel: 10 }
    ];
    this.loadTechnologies();

    // Battle
    this.battleState = null;
    this.playerFleetHP = 0;
    this.enemyFleetHP = 0;
    this.battleLog = [];
    this.battleAnimating = false;
    this.currentPlanet = 0;

    // Resources production
    this.creditsPerSecond = 1;
    this.lastResourceUpdate = Date.now();
    this.updateResources();
    setInterval(() => this.updateResources(), 1000);

    // Visual effects
    this.stars = [];
    this.particles = [];
    this.initStars();

    // Achievements
    this.achievements = [
      { id: 'first_planet', name: 'Colonizador', desc: 'Conquiste seu primeiro planeta', icon: '🪐', unlocked: false },
      { id: 'planets_10', name: 'Expansionista', desc: 'Conquiste 10 planetas', icon: '🌍', unlocked: false },
      { id: 'system_clear', name: 'Dominador', desc: 'Complete um sistema', icon: '⭐', unlocked: false },
      { id: 'fleet_10', name: 'Almirante', desc: 'Tenha 10 naves', icon: '🚀', unlocked: false },
      { id: 'tech_max', name: 'Cientista', desc: 'Maximize uma tecnologia', icon: '🔬', unlocked: false },
      { id: 'level_20', name: 'Veterano', desc: 'Alcance nível 20', icon: '⭐', unlocked: false },
      { id: 'dreadnought', name: 'Imperador', desc: 'Obtenha um Dreadnought', icon: '👑', unlocked: false },
      { id: 'all_systems', name: 'Conquistador', desc: 'Domine todos os sistemas', icon: '🌌', unlocked: false }
    ];
    this.loadAchievements();

    this.setupEventListeners();
    this.gameLoop();
  }

  initStars() {
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random()
      });
    }
  }

  loadSystems() {
    const saved = JSON.parse(localStorage.getItem('eai_galaxy_systems') || 'null');
    if (saved) {
      saved.forEach(s => {
        const system = this.systems.find(sys => sys.id === s.id);
        if (system) {
          system.conquered = s.conquered;
          system.unlocked = s.unlocked;
        }
      });
    }
  }

  saveSystems() {
    const data = this.systems.map(s => ({ id: s.id, conquered: s.conquered, unlocked: s.unlocked }));
    localStorage.setItem('eai_galaxy_systems', JSON.stringify(data));
  }

  loadShips() {
    const saved = JSON.parse(localStorage.getItem('eai_galaxy_ships') || 'null');
    if (saved) {
      saved.forEach(s => {
        const ship = this.ships.find(sh => sh.id === s.id);
        if (ship) ship.owned = s.owned;
      });
    }
  }

  saveShips() {
    const data = this.ships.map(s => ({ id: s.id, owned: s.owned }));
    localStorage.setItem('eai_galaxy_ships', JSON.stringify(data));
  }

  loadTechnologies() {
    const saved = JSON.parse(localStorage.getItem('eai_galaxy_tech') || 'null');
    if (saved) {
      saved.forEach(s => {
        const tech = this.technologies.find(t => t.id === s.id);
        if (tech) tech.level = s.level;
      });
    }
  }

  saveTechnologies() {
    const data = this.technologies.map(t => ({ id: t.id, level: t.level }));
    localStorage.setItem('eai_galaxy_tech', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = JSON.parse(localStorage.getItem('eai_galaxy_achievements') || '[]');
    this.achievements.forEach(a => a.unlocked = saved.includes(a.id));
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_galaxy_achievements', JSON.stringify(unlocked));
  }

  checkAchievement(id) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.saveAchievements();
      this.showAchievementPopup(achievement);
      this.addXP(100);
      this.crystals += 20;
      this.save();
    }
  }

  showAchievementPopup(achievement) {
    this.achievementPopup = { achievement, timer: 180, y: -100 };
  }

  updateResources() {
    const now = Date.now();
    const elapsed = (now - this.lastResourceUpdate) / 1000;

    // Calculate production based on conquered planets and mining tech
    const miningBonus = 1 + (this.technologies.find(t => t.id === 'mining').level - 1) * 0.1;
    this.creditsPerSecond = this.totalPlanets * 2 * miningBonus + 1;

    this.credits += Math.floor(this.creditsPerSecond * elapsed);
    this.lastResourceUpdate = now;
    this.save();
  }

  setupEventListeners() {
    canvas.addEventListener('click', (e) => this.handleClick(e));
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
    });
  }

  handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.showTutorial) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_galaxy_tutorial_seen', 'true');
      }
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    if (this.state === 'menu') this.handleMenuClick(x, y, w, h);
    else if (this.state === 'galaxy') this.handleGalaxyClick(x, y, w, h);
    else if (this.state === 'system') this.handleSystemClick(x, y, w, h);
    else if (this.state === 'fleet') this.handleFleetClick(x, y, w, h);
    else if (this.state === 'shipyard') this.handleShipyardClick(x, y, w, h);
    else if (this.state === 'research') this.handleResearchClick(x, y, w, h);
    else if (this.state === 'battle') this.handleBattleClick(x, y, w, h);
    else if (this.state === 'achievements') {
      if (x < 80 && y < 50) this.state = 'menu';
    }
    else if (this.state === 'victory' || this.state === 'defeat') {
      this.state = 'galaxy';
    }
  }

  handleMenuClick(x, y, w, h) {
    // Galaxy Map
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 - 80 && y < h/2 - 20) {
      this.state = 'galaxy';
    }
    // Shipyard
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 - 10 && y < h/2 + 50) {
      this.state = 'shipyard';
    }
    // Research
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 60 && y < h/2 + 120) {
      this.state = 'research';
    }
    // Achievements
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 130 && y < h/2 + 190) {
      this.state = 'achievements';
    }
  }

  handleGalaxyClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.systems.forEach((system, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = 20 + col * itemWidth;
      const sy = 130 + row * 130;

      const prevSystem = i > 0 ? this.systems[i - 1] : null;
      const isAccessible = system.unlocked || (prevSystem && prevSystem.conquered >= Math.floor(prevSystem.planets / 2));

      if (isAccessible && x > sx && x < sx + itemWidth - 10 && y > sy && y < sy + 110) {
        system.unlocked = true;
        this.currentSystem = system;
        this.state = 'system';
        this.saveSystems();
      }
    });
  }

  handleSystemClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'galaxy';
      return;
    }

    // Planet selection
    const cols = Math.min(5, Math.floor((w - 40) / 100));
    const itemSize = 70;
    const startX = (w - cols * (itemSize + 10)) / 2;
    const startY = 150;

    for (let i = 0; i < this.currentSystem.planets; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const px = startX + col * (itemSize + 10);
      const py = startY + row * (itemSize + 20);

      const isConquered = i < this.currentSystem.conquered;
      const isUnlocked = i <= this.currentSystem.conquered;

      if (isUnlocked && !isConquered && x > px && x < px + itemSize && y > py && y < py + itemSize) {
        this.currentPlanet = i;
        this.state = 'fleet';
      }
    }
  }

  handleFleetClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'system';
      return;
    }

    // Ship selection
    const cols = 3;
    const itemWidth = (w - 60) / cols;
    const startY = 150;

    this.ships.forEach((ship, i) => {
      if (ship.owned <= 0) return;

      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = 20 + col * (itemWidth + 10);
      const sy = startY + row * 90;

      // Add to fleet
      if (x > sx && x < sx + itemWidth/2 && y > sy && y < sy + 80) {
        const inFleet = this.selectedFleet.filter(s => s.id === ship.id).length;
        if (inFleet < ship.owned) {
          this.selectedFleet.push({ ...ship });
        }
      }

      // Remove from fleet
      if (x > sx + itemWidth/2 && x < sx + itemWidth && y > sy && y < sy + 80) {
        const index = this.selectedFleet.findIndex(s => s.id === ship.id);
        if (index >= 0) {
          this.selectedFleet.splice(index, 1);
        }
      }
    });

    // Attack button
    if (x > w/2 - 80 && x < w/2 + 80 && y > h - 80 && y < h - 30) {
      if (this.selectedFleet.length > 0) {
        this.startBattle();
      }
    }
  }

  handleShipyardClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.ships.forEach((ship, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = 20 + col * itemWidth;
      const sy = 130 + row * 130;

      // Buy button
      if (y > sy + 80 && y < sy + 110 && x > sx + 10 && x < sx + itemWidth - 20) {
        if (this.credits >= ship.cost) {
          this.credits -= ship.cost;
          ship.owned++;
          this.saveShips();
          this.save();

          const totalShips = this.ships.reduce((sum, s) => sum + s.owned, 0);
          if (totalShips >= 10) this.checkAchievement('fleet_10');
          if (ship.id === 'dreadnought') this.checkAchievement('dreadnought');
        }
      }
    });
  }

  handleResearchClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    this.technologies.forEach((tech, i) => {
      const ty = 130 + i * 100;
      const cost = tech.level * 500;

      // Upgrade button
      if (y > ty + 50 && y < ty + 85 && x > w - 130 && x < w - 20) {
        if (tech.level < tech.maxLevel && this.crystals >= Math.floor(cost / 100)) {
          this.crystals -= Math.floor(cost / 100);
          tech.level++;
          this.saveTechnologies();
          this.save();

          if (tech.level >= 10) this.checkAchievement('tech_max');
        }
      }
    });
  }

  handleBattleClick(x, y, w, h) {
    if (this.battleAnimating) return;

    // Auto attack
    this.executeBattleRound();
  }

  startBattle() {
    this.state = 'battle';
    this.battleState = 'fighting';
    this.battleLog = ['Batalha iniciada!'];

    // Calculate fleet stats with tech bonuses
    const weaponBonus = 1 + (this.technologies.find(t => t.id === 'weapons').level - 1) * 0.1;
    const shieldBonus = 1 + (this.technologies.find(t => t.id === 'shields').level - 1) * 0.1;

    this.playerFleetHP = 0;
    this.playerFleetATK = 0;
    this.selectedFleet.forEach(ship => {
      this.playerFleetHP += Math.floor(ship.hp * shieldBonus);
      this.playerFleetATK += Math.floor(ship.atk * weaponBonus);
    });
    this.playerFleetMaxHP = this.playerFleetHP;

    // Enemy fleet based on system difficulty and planet
    const basePower = this.currentSystem.difficulty * 50 + this.currentPlanet * 30;
    this.enemyFleetHP = basePower * 3;
    this.enemyFleetMaxHP = this.enemyFleetHP;
    this.enemyFleetATK = Math.floor(basePower * 0.5);
  }

  executeBattleRound() {
    this.battleAnimating = true;

    // Player attacks
    const playerDamage = Math.floor(this.playerFleetATK * (0.8 + Math.random() * 0.4));
    this.enemyFleetHP -= playerDamage;
    this.battleLog.push(`🚀 Sua frota: ${playerDamage} dano!`);

    // Add particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: canvas.width * 0.7 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 4,
        color: '#ff6600',
        life: 30
      });
    }

    setTimeout(() => {
      if (this.enemyFleetHP <= 0) {
        this.victory();
        this.battleAnimating = false;
        return;
      }

      // Enemy attacks
      const enemyDamage = Math.floor(this.enemyFleetATK * (0.8 + Math.random() * 0.4));
      this.playerFleetHP -= enemyDamage;
      this.battleLog.push(`👾 Inimigos: ${enemyDamage} dano!`);

      // Add particles
      for (let i = 0; i < 15; i++) {
        this.particles.push({
          x: canvas.width * 0.3 + (Math.random() - 0.5) * 100,
          y: canvas.height * 0.4 + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          size: Math.random() * 8 + 4,
          color: '#ff0066',
          life: 30
        });
      }

      if (this.playerFleetHP <= 0) {
        this.defeat();
      }

      this.battleAnimating = false;
    }, 500);
  }

  victory() {
    this.state = 'victory';

    // Update conquered planets
    if (this.currentPlanet >= this.currentSystem.conquered) {
      this.currentSystem.conquered = this.currentPlanet + 1;
      this.totalPlanets++;
      localStorage.setItem('eai_galaxy_planets', this.totalPlanets.toString());
      this.saveSystems();
    }

    // Rewards
    const baseReward = 100 + this.currentSystem.difficulty * 50 + this.currentPlanet * 20;
    const crystalReward = (this.currentPlanet + 1) % 3 === 0 ? 10 : 0;

    this.credits += baseReward;
    this.crystals += crystalReward;
    this.addXP(50 + this.currentSystem.difficulty * 20);

    this.victoryReward = { credits: baseReward, crystals: crystalReward };

    // Check achievements
    this.checkAchievement('first_planet');
    if (this.totalPlanets >= 10) this.checkAchievement('planets_10');

    if (this.currentSystem.conquered >= this.currentSystem.planets) {
      this.checkAchievement('system_clear');

      // Unlock next system
      const currentIndex = this.systems.indexOf(this.currentSystem);
      if (currentIndex < this.systems.length - 1) {
        this.systems[currentIndex + 1].unlocked = true;
        this.saveSystems();
      }

      // Check all systems
      if (this.systems.every(s => s.conquered >= s.planets)) {
        this.checkAchievement('all_systems');
      }
    }

    this.selectedFleet = [];
    this.save();
  }

  defeat() {
    this.state = 'defeat';

    // Lose some ships
    this.selectedFleet.forEach(ship => {
      const originalShip = this.ships.find(s => s.id === ship.id);
      if (originalShip && Math.random() < 0.3) {
        originalShip.owned = Math.max(0, originalShip.owned - 1);
      }
    });
    this.saveShips();

    this.selectedFleet = [];
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 200;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.crystals += 10;

      if (this.level >= 20) this.checkAchievement('level_20');
    }
  }

  save() {
    localStorage.setItem('eai_galaxy_credits', this.credits.toString());
    localStorage.setItem('eai_galaxy_crystals', this.crystals.toString());
    localStorage.setItem('eai_galaxy_xp', this.xp.toString());
    localStorage.setItem('eai_galaxy_level', this.level.toString());
  }

  update() {
    // Update stars
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
      star.brightness = 0.5 + Math.sin(Date.now() * 0.003 + star.x) * 0.5;
    });

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    // Achievement popup
    if (this.achievementPopup) {
      this.achievementPopup.timer--;
      if (this.achievementPopup.y < 50) this.achievementPopup.y += 10;
      if (this.achievementPopup.timer <= 0) this.achievementPopup = null;
    }
  }

  draw() {
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, w, h);

    // Draw stars
    this.stars.forEach(star => {
      ctx.globalAlpha = star.brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    if (this.state === 'menu') this.drawMenu();
    else if (this.state === 'galaxy') this.drawGalaxy();
    else if (this.state === 'system') this.drawSystem();
    else if (this.state === 'fleet') this.drawFleet();
    else if (this.state === 'shipyard') this.drawShipyard();
    else if (this.state === 'research') this.drawResearch();
    else if (this.state === 'battle') this.drawBattle();
    else if (this.state === 'achievements') this.drawAchievements();
    else if (this.state === 'victory') this.drawVictory();
    else if (this.state === 'defeat') this.drawDefeat();

    // Draw particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / 30;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Achievement popup
    if (this.achievementPopup) {
      const a = this.achievementPopup.achievement;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.beginPath();
      ctx.roundRect(w/2 - 150, this.achievementPopup.y, 300, 80, 15);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(a.icon, w/2 - 100, this.achievementPopup.y + 50);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Conquista!', w/2 + 20, this.achievementPopup.y + 35);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText(a.name, w/2 + 20, this.achievementPopup.y + 55);
    }
  }

  drawTutorial() {
    const w = canvas.width;
    const h = canvas.height;
    const page = this.tutorialPages[this.tutorialPage];

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0a0a2e';
    ctx.strokeStyle = '#9966ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(w/2 - 160, h/2 - 140, 320, 280, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 60);

    ctx.fillStyle = '#9966ff';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 + 10);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 45 + i * 25);
    });

    for (let i = 0; i < this.tutorialPages.length; i++) {
      ctx.beginPath();
      ctx.arc(w/2 - 40 + i * 20, h/2 + 110, 6, 0, Math.PI * 2);
      ctx.fillStyle = i === this.tutorialPage ? '#9966ff' : '#666';
      ctx.fill();
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Toque para continuar', w/2, h/2 + 140);
  }

  drawMenu() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9966ff';
    ctx.fillText('🌌 GALAXY CONQUEST 🌌', w/2, 60);

    // Stats
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.fillText(`💰 ${Math.floor(this.credits)}`, 20, 30);
    ctx.fillText(`💎 ${this.crystals}`, 130, 30);
    ctx.fillText(`⭐ Nv.${this.level}`, 230, 30);
    ctx.fillText(`🪐 ${this.totalPlanets}`, 320, 30);

    // Production rate
    ctx.font = '12px Arial';
    ctx.fillStyle = '#66ccff';
    ctx.fillText(`+${this.creditsPerSecond.toFixed(1)}/s`, 20, 50);

    // Floating planet animation
    const time = Date.now() / 1000;
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🪐', w/2, h/3 + Math.sin(time) * 10);

    // Buttons
    const buttons = [
      { text: '🌌 Mapa Galáctico', y: h/2 - 80 },
      { text: '🚀 Estaleiro', y: h/2 - 10 },
      { text: '🔬 Pesquisa', y: h/2 + 60 },
      { text: '🏆 Conquistas', y: h/2 + 130 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = 'rgba(50, 30, 80, 0.8)';
      ctx.strokeStyle = '#9966ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w/2 - 100, btn.y - 25, 200, 50, 15);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 8);
    });
  }

  drawGalaxy() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#9966ff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9966ff';
    ctx.fillText('🌌 MAPA GALÁCTICO 🌌', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#66ccff';
    ctx.fillText(`Planetas conquistados: ${this.totalPlanets}`, w/2, 100);

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.systems.forEach((system, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 130;

      if (y > h - 50) return;

      const prevSystem = i > 0 ? this.systems[i - 1] : null;
      const isAccessible = system.unlocked || (prevSystem && prevSystem.conquered >= Math.floor(prevSystem.planets / 2));

      ctx.fillStyle = isAccessible ? 'rgba(50, 30, 80, 0.8)' : 'rgba(20, 20, 40, 0.5)';
      ctx.globalAlpha = isAccessible ? 1 : 0.5;
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 110, 10);
      ctx.fill();

      ctx.strokeStyle = system.conquered >= system.planets ? '#00ff00' : (isAccessible ? '#9966ff' : '#333');
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(system.emoji, x + itemWidth/2 - 5, y + 45);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(system.name, x + itemWidth/2 - 5, y + 70);

      ctx.font = '12px Arial';
      ctx.fillStyle = system.conquered >= system.planets ? '#00ff00' : '#ffd700';
      ctx.fillText(`🪐 ${system.conquered}/${system.planets}`, x + itemWidth/2 - 5, y + 90);

      if (!isAccessible) {
        ctx.fillStyle = '#666';
        ctx.font = '20px Arial';
        ctx.fillText('🔒', x + itemWidth/2 - 5, y + 55);
      }
      ctx.globalAlpha = 1;
    });
  }

  drawSystem() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#9966ff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9966ff';
    ctx.fillText(`${this.currentSystem.emoji} ${this.currentSystem.name}`, w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#66ccff';
    ctx.fillText(`Progresso: ${this.currentSystem.conquered}/${this.currentSystem.planets}`, w/2, 100);

    // Draw star in center
    ctx.font = '50px Arial';
    ctx.fillText(this.currentSystem.emoji, w/2, 130);

    // Draw planets
    const cols = Math.min(5, Math.floor((w - 40) / 100));
    const itemSize = 70;
    const startX = (w - cols * (itemSize + 10)) / 2;
    const startY = 170;

    const planetEmojis = ['🪐', '🌍', '🌎', '🌏', '🔴', '⚫', '🟤', '🟡', '🟢', '🔵', '⚪', '🟣', '🟠', '💠', '🌑'];

    for (let i = 0; i < this.currentSystem.planets; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (itemSize + 10);
      const y = startY + row * (itemSize + 20);

      const isConquered = i < this.currentSystem.conquered;
      const isUnlocked = i <= this.currentSystem.conquered;

      ctx.fillStyle = isConquered ? 'rgba(0, 100, 0, 0.5)' : (isUnlocked ? 'rgba(50, 30, 80, 0.8)' : 'rgba(20, 20, 40, 0.5)');
      ctx.beginPath();
      ctx.roundRect(x, y, itemSize, itemSize, 10);
      ctx.fill();

      ctx.strokeStyle = isConquered ? '#00ff00' : (isUnlocked ? '#9966ff' : '#333');
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '35px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = isUnlocked ? 1 : 0.3;
      ctx.fillText(planetEmojis[i % planetEmojis.length], x + itemSize/2, y + 45);

      if (isConquered) {
        ctx.font = '20px Arial';
        ctx.fillText('✓', x + itemSize - 15, y + 20);
      } else if (!isUnlocked) {
        ctx.font = '20px Arial';
        ctx.fillText('🔒', x + itemSize/2, y + 45);
      }

      ctx.font = '10px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`Planeta ${i + 1}`, x + itemSize/2, y + itemSize - 8);
      ctx.globalAlpha = 1;
    }
  }

  drawFleet() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#9966ff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9966ff';
    ctx.fillText('🚀 MONTAR FROTA 🚀', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#66ccff';
    ctx.fillText(`Alvo: ${this.currentSystem.name} - Planeta ${this.currentPlanet + 1}`, w/2, 100);

    // Selected fleet summary
    ctx.fillStyle = 'rgba(50, 30, 80, 0.8)';
    ctx.beginPath();
    ctx.roundRect(10, 110, w - 20, 30, 5);
    ctx.fill();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    const fleetSummary = this.selectedFleet.length > 0 ?
      `Frota: ${this.selectedFleet.length} naves | HP: ${this.selectedFleet.reduce((s, ship) => s + ship.hp, 0)} | ATK: ${this.selectedFleet.reduce((s, ship) => s + ship.atk, 0)}` :
      'Selecione naves para sua frota';
    ctx.fillText(fleetSummary, 20, 130);

    // Ship selection
    const cols = 3;
    const itemWidth = (w - 60) / cols;
    const startY = 160;

    this.ships.forEach((ship, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = startY + row * 90;

      const inFleet = this.selectedFleet.filter(s => s.id === ship.id).length;
      const available = ship.owned - inFleet;

      ctx.fillStyle = ship.owned > 0 ? 'rgba(50, 30, 80, 0.8)' : 'rgba(20, 20, 40, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth, 80, 10);
      ctx.fill();

      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = ship.owned > 0 ? 1 : 0.3;
      ctx.fillText(ship.emoji, x + itemWidth/2, y + 35);

      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(ship.name, x + itemWidth/2, y + 55);

      ctx.font = '10px Arial';
      ctx.fillStyle = inFleet > 0 ? '#00ff00' : '#aaa';
      ctx.fillText(`${inFleet}/${ship.owned}`, x + itemWidth/2, y + 70);

      // Add/Remove buttons
      if (ship.owned > 0) {
        ctx.fillStyle = available > 0 ? '#4a4' : '#333';
        ctx.fillRect(x + 5, y + 50, itemWidth/2 - 10, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('+', x + itemWidth/4, y + 68);

        ctx.fillStyle = inFleet > 0 ? '#a44' : '#333';
        ctx.fillRect(x + itemWidth/2 + 5, y + 50, itemWidth/2 - 10, 25);
        ctx.fillStyle = '#fff';
        ctx.fillText('-', x + itemWidth * 3/4, y + 68);
      }
      ctx.globalAlpha = 1;
    });

    // Attack button
    ctx.fillStyle = this.selectedFleet.length > 0 ? '#9966ff' : '#333';
    ctx.beginPath();
    ctx.roundRect(w/2 - 80, h - 80, 160, 45, 10);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚔️ ATACAR!', w/2, h - 50);
  }

  drawShipyard() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#9966ff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9966ff';
    ctx.fillText('🚀 ESTALEIRO 🚀', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`💰 ${Math.floor(this.credits)}`, w/2, 100);

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.ships.forEach((ship, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 130;

      if (y > h - 50) return;

      ctx.fillStyle = 'rgba(50, 30, 80, 0.8)';
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 120, 10);
      ctx.fill();

      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ship.emoji, x + itemWidth/2 - 5, y + 40);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(ship.name, x + itemWidth/2 - 5, y + 60);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`HP:${ship.hp} ATK:${ship.atk}`, x + itemWidth/2 - 5, y + 75);
      ctx.fillStyle = '#66ccff';
      ctx.fillText(`Possuídos: ${ship.owned}`, x + itemWidth/2 - 5, y + 88);

      // Buy button
      ctx.fillStyle = this.credits >= ship.cost ? '#4a4' : '#333';
      ctx.beginPath();
      ctx.roundRect(x + 10, y + 92, itemWidth - 30, 22, 5);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(`💰 ${ship.cost}`, x + itemWidth/2 - 5, y + 108);
    });
  }

  drawResearch() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#9966ff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9966ff';
    ctx.fillText('🔬 PESQUISA 🔬', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`💎 ${this.crystals}`, w/2, 100);

    this.technologies.forEach((tech, i) => {
      const y = 130 + i * 100;
      const cost = Math.floor(tech.level * 5);

      ctx.fillStyle = 'rgba(50, 30, 80, 0.8)';
      ctx.beginPath();
      ctx.roundRect(20, y, w - 40, 90, 10);
      ctx.fill();

      ctx.font = '40px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(tech.emoji, 40, y + 55);

      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(tech.name, 100, y + 35);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(tech.effect, 100, y + 55);

      // Level bar
      ctx.fillStyle = '#333';
      ctx.fillRect(100, y + 62, 150, 12);
      ctx.fillStyle = '#9966ff';
      ctx.fillRect(100, y + 62, 150 * (tech.level / tech.maxLevel), 12);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`Nv.${tech.level}/${tech.maxLevel}`, 260, y + 72);

      // Upgrade button
      if (tech.level < tech.maxLevel) {
        ctx.fillStyle = this.crystals >= cost ? '#4a4' : '#333';
        ctx.beginPath();
        ctx.roundRect(w - 130, y + 30, 100, 35, 8);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`💎 ${cost}`, w - 80, y + 52);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MÁXIMO', w - 80, y + 52);
      }
    });
  }

  drawBattle() {
    const w = canvas.width;
    const h = canvas.height;

    // Battle title
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6600';
    ctx.fillText('⚔️ BATALHA ESPACIAL ⚔️', w/2, 50);

    // Player fleet
    ctx.fillStyle = 'rgba(0, 50, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(20, 100, w/2 - 40, 150, 15);
    ctx.fill();

    ctx.font = '14px Arial';
    ctx.fillStyle = '#4a4';
    ctx.textAlign = 'center';
    ctx.fillText('SUA FROTA', w/4, 120);

    ctx.font = '50px Arial';
    ctx.fillText('🚀', w/4, 180);

    // Player HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(40, 200, w/2 - 80, 25);
    ctx.fillStyle = this.playerFleetHP > this.playerFleetMaxHP * 0.3 ? '#4a4' : '#a44';
    ctx.fillRect(40, 200, (w/2 - 80) * Math.max(0, this.playerFleetHP / this.playerFleetMaxHP), 25);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.max(0, this.playerFleetHP)}/${this.playerFleetMaxHP}`, w/4, 220);

    // Enemy fleet
    ctx.fillStyle = 'rgba(50, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(w/2 + 20, 100, w/2 - 40, 150, 15);
    ctx.fill();

    ctx.font = '14px Arial';
    ctx.fillStyle = '#a44';
    ctx.fillText('INIMIGOS', w * 3/4, 120);

    ctx.font = '50px Arial';
    ctx.fillText('👾', w * 3/4, 180);

    // Enemy HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(w/2 + 40, 200, w/2 - 80, 25);
    ctx.fillStyle = '#a44';
    ctx.fillRect(w/2 + 40, 200, (w/2 - 80) * Math.max(0, this.enemyFleetHP / this.enemyFleetMaxHP), 25);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.max(0, this.enemyFleetHP)}/${this.enemyFleetMaxHP}`, w * 3/4, 220);

    // Battle log
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(20, h - 180, w - 40, 100, 10);
    ctx.fill();

    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    const logs = this.battleLog.slice(-4);
    logs.forEach((log, i) => {
      ctx.fillText(log, 30, h - 160 + i * 22);
    });

    // Attack prompt
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Toque para atacar!', w/2, h - 40);
  }

  drawVictory() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(0, 50, 0, 0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🎉 VITÓRIA! 🎉', w/2, h/3);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Planeta conquistado!', w/2, h/2 - 40);

    ctx.font = '16px Arial';
    ctx.fillText(`💰 +${this.victoryReward.credits} créditos`, w/2, h/2);
    if (this.victoryReward.crystals > 0) {
      ctx.fillText(`💎 +${this.victoryReward.crystals} cristais`, w/2, h/2 + 30);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Toque para continuar', w/2, h - 60);
  }

  drawDefeat() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(50, 0, 0, 0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444';
    ctx.fillText('💥 DERROTA 💥', w/2, h/3);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Sua frota foi destruída!', w/2, h/2 - 20);
    ctx.fillText('Algumas naves foram perdidas...', w/2, h/2 + 10);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Toque para continuar', w/2, h - 60);
  }

  drawAchievements() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#9966ff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🏆 CONQUISTAS 🏆', w/2, 70);

    const unlocked = this.achievements.filter(a => a.unlocked).length;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${unlocked}/${this.achievements.length}`, w/2, 100);

    const cols = Math.min(4, Math.floor((w - 40) / 150));
    const itemWidth = (w - 40) / cols;

    this.achievements.forEach((a, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 100;

      if (y > h - 50) return;

      ctx.fillStyle = a.unlocked ? 'rgba(50, 30, 80, 0.8)' : 'rgba(20, 20, 40, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x + 5, y, itemWidth - 10, 90, 10);
      ctx.fill();

      if (a.unlocked) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.globalAlpha = a.unlocked ? 1 : 0.3;
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(a.icon, x + itemWidth/2, y + 35);

      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = a.unlocked ? '#ffd700' : '#666';
      ctx.fillText(a.name, x + itemWidth/2, y + 55);

      ctx.font = '9px Arial';
      ctx.fillStyle = a.unlocked ? '#fff' : '#444';
      ctx.fillText(a.desc, x + itemWidth/2, y + 75);
      ctx.globalAlpha = 1;
    });
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// roundRect polyfill
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

const game = new GalaxyConquest();
