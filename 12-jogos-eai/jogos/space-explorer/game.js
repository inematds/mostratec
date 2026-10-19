// Space Explorer Kids - EAI Games
// Aventura espacial para crianças com exploração de planetas

class SpaceExplorerKids {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_spaceexplorer_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Espaço!', lines: ['Explore a galáxia', 'e descubra planetas!'], emoji: '🚀' },
      { title: 'Como Jogar', lines: ['Toque/Clique para voar', 'Colete estrelas e cristais', 'Evite asteroides!'], emoji: '🎮' },
      { title: 'Planetas', lines: ['Visite 8 planetas únicos', 'Cada um com missões', 'especiais para você!'], emoji: '🪐' },
      { title: 'Naves', lines: ['Desbloqueie novas naves', 'Cada uma com poderes', 'diferentes!'], emoji: '🛸' },
      { title: 'Missões', lines: ['Complete missões para', 'ganhar recompensas', 'e subir de nível!'], emoji: '🎯' },
      { title: 'Decolar!', lines: ['3... 2... 1...', 'DECOLAR!', 'Boa viagem, astronauta!'], emoji: '🌟' }
    ];

    // Game state
    this.state = 'menu';
    this.loadProgress();

    // Player ship
    this.ship = {
      x: 0,
      y: 0,
      vy: 0,
      width: 50,
      height: 40,
      fuel: 100,
      maxFuel: 100
    };

    // Rockets/Ships
    this.rockets = {
      basic: { name: 'Foguete Básico', emoji: '🚀', speed: 1, fuelEfficiency: 1, price: 0 },
      shuttle: { name: 'Nave Espacial', emoji: '🛸', speed: 1.2, fuelEfficiency: 1.1, price: 1000 },
      rocket: { name: 'Foguete Turbo', emoji: '🔥', speed: 1.5, fuelEfficiency: 0.8, price: 2500 },
      satellite: { name: 'Satélite', emoji: '🛰️', speed: 0.9, fuelEfficiency: 1.5, price: 3500 },
      alien: { name: 'Nave Alien', emoji: '👽', speed: 1.3, fuelEfficiency: 1.3, price: 5000 }
    };

    // Planets
    this.planets = [
      { name: 'Terra', emoji: '🌍', color: '#4a90d9', unlocked: true, missions: 5 },
      { name: 'Lua', emoji: '🌙', color: '#c0c0c0', unlocked: false, unlockStars: 50, missions: 5 },
      { name: 'Marte', emoji: '🔴', color: '#e74c3c', unlocked: false, unlockStars: 150, missions: 5 },
      { name: 'Júpiter', emoji: '🟤', color: '#f39c12', unlocked: false, unlockStars: 300, missions: 5 },
      { name: 'Saturno', emoji: '🪐', color: '#f1c40f', unlocked: false, unlockStars: 500, missions: 5 },
      { name: 'Urano', emoji: '🔵', color: '#3498db', unlocked: false, unlockStars: 800, missions: 5 },
      { name: 'Netuno', emoji: '💙', color: '#2980b9', unlocked: false, unlockStars: 1200, missions: 5 },
      { name: 'Plutão', emoji: '⚪', color: '#95a5a6', unlocked: false, unlockStars: 2000, missions: 5 }
    ];

    // Current mission
    this.currentPlanet = 0;
    this.currentMission = 1;
    this.missionTarget = 0;
    this.missionProgress = 0;

    // Collectibles
    this.stars = [];
    this.crystals = [];
    this.asteroids = [];
    this.powerUps = [];

    // Power-ups
    this.activePowerUps = {
      shield: 0,
      magnet: 0,
      boost: 0
    };

    // Upgrades
    this.upgrades = {
      fuelCapacity: { level: 0, maxLevel: 10, basePrice: 200, effect: 10 },
      fuelEfficiency: { level: 0, maxLevel: 10, basePrice: 250, effect: 0.05 },
      starMagnet: { level: 0, maxLevel: 5, basePrice: 400, effect: 20 },
      shieldDuration: { level: 0, maxLevel: 5, basePrice: 500, effect: 1000 }
    };
    this.loadUpgrades();

    // Achievements
    this.achievements = [
      { id: 'first_flight', name: 'Primeiro Voo', desc: 'Complete sua primeira missão', icon: '🚀', unlocked: false },
      { id: 'star_collector', name: 'Coletor de Estrelas', desc: 'Colete 100 estrelas', icon: '⭐', unlocked: false, progress: 0, target: 100 },
      { id: 'planet_visitor', name: 'Explorador', desc: 'Visite 4 planetas', icon: '🪐', unlocked: false },
      { id: 'all_planets', name: 'Mestre Galáctico', desc: 'Visite todos os planetas', icon: '🌌', unlocked: false },
      { id: 'crystal_master', name: 'Cristaleiro', desc: 'Colete 50 cristais', icon: '💎', unlocked: false, progress: 0, target: 50 },
      { id: 'survivor', name: 'Sobrevivente', desc: 'Voe 5 min sem bater', icon: '🛡️', unlocked: false },
      { id: 'ship_collector', name: 'Frota Espacial', desc: 'Desbloqueie todas as naves', icon: '🛸', unlocked: false },
      { id: 'level_20', name: 'Astronauta Veterano', desc: 'Alcance nível 20', icon: '👨‍🚀', unlocked: false }
    ];
    this.loadAchievements();

    // Stats
    this.totalStars = parseInt(localStorage.getItem('spaceexplorer_total_stars') || '0');
    this.totalCrystals = parseInt(localStorage.getItem('spaceexplorer_total_crystals') || '0');
    this.flightTime = 0;
    this.longestFlight = parseInt(localStorage.getItem('spaceexplorer_longest_flight') || '0');

    // Visual
    this.backgroundStars = [];
    this.particles = [];
    this.generateBackgroundStars();

    // Scrolling
    this.scrollSpeed = 0;

    // Input
    this.isFlying = false;
    this.setupInput();

    // Start
    this.lastTime = performance.now();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ship.x = 100;
    this.ship.y = this.canvas.height / 2;
  }

  generateBackgroundStars() {
    for (let i = 0; i < 100; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3,
        speed: 0.5 + Math.random() * 2
      });
    }
  }

  loadProgress() {
    this.coins = parseInt(localStorage.getItem('spaceexplorer_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('spaceexplorer_diamonds') || '0');
    this.starsCollected = parseInt(localStorage.getItem('spaceexplorer_stars') || '0');
    this.xp = parseInt(localStorage.getItem('spaceexplorer_xp') || '0');
    this.level = parseInt(localStorage.getItem('spaceexplorer_level') || '1');
    this.selectedRocket = localStorage.getItem('spaceexplorer_rocket') || 'basic';
    this.unlockedRockets = JSON.parse(localStorage.getItem('spaceexplorer_unlocked_rockets') || '["basic"]');

    // Load planet progress
    const savedPlanets = localStorage.getItem('spaceexplorer_planets');
    if (savedPlanets) {
      const data = JSON.parse(savedPlanets);
      this.planets.forEach((planet, i) => {
        if (data[i]) {
          planet.unlocked = data[i].unlocked;
          planet.completedMissions = data[i].completedMissions || 0;
        }
      });
    }
  }

  saveProgress() {
    localStorage.setItem('spaceexplorer_coins', this.coins.toString());
    localStorage.setItem('spaceexplorer_diamonds', this.diamonds.toString());
    localStorage.setItem('spaceexplorer_stars', this.starsCollected.toString());
    localStorage.setItem('spaceexplorer_xp', this.xp.toString());
    localStorage.setItem('spaceexplorer_level', this.level.toString());
    localStorage.setItem('spaceexplorer_rocket', this.selectedRocket);
    localStorage.setItem('spaceexplorer_unlocked_rockets', JSON.stringify(this.unlockedRockets));
    localStorage.setItem('spaceexplorer_total_stars', this.totalStars.toString());
    localStorage.setItem('spaceexplorer_total_crystals', this.totalCrystals.toString());
    localStorage.setItem('spaceexplorer_longest_flight', this.longestFlight.toString());

    const planetsData = this.planets.map(p => ({
      unlocked: p.unlocked,
      completedMissions: p.completedMissions || 0
    }));
    localStorage.setItem('spaceexplorer_planets', JSON.stringify(planetsData));
  }

  loadUpgrades() {
    const saved = localStorage.getItem('spaceexplorer_upgrades');
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
    localStorage.setItem('spaceexplorer_upgrades', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('spaceexplorer_achievements');
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
    localStorage.setItem('spaceexplorer_achievements', JSON.stringify(data));
  }

  setupInput() {
    const startFly = () => { this.isFlying = true; };
    const stopFly = () => { this.isFlying = false; };

    this.canvas.addEventListener('mousedown', startFly);
    this.canvas.addEventListener('mouseup', stopFly);
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startFly(); });
    this.canvas.addEventListener('touchend', stopFly);

    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));
  }

  handleClick(x, y) {
    if (this.showTutorial) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_spaceexplorer_tutorial_seen', 'true');
      }
      return;
    }

    switch (this.state) {
      case 'menu': this.handleMenuClick(x, y); break;
      case 'planets': this.handlePlanetsClick(x, y); break;
      case 'missions': this.handleMissionsClick(x, y); break;
      case 'shop': this.handleShopClick(x, y); break;
      case 'upgrades': this.handleUpgradesClick(x, y); break;
      case 'achievements': this.handleAchievementsClick(x, y); break;
      case 'victory': this.handleVictoryClick(x, y); break;
      case 'gameover': this.handleGameOverClick(x, y); break;
    }
  }

  handleMenuClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const btnW = 200, btnH = 50;

    const buttons = [
      { y: cy - 40, action: () => this.state = 'planets' },
      { y: cy + 20, action: () => this.state = 'shop' },
      { y: cy + 80, action: () => this.state = 'upgrades' },
      { y: cy + 140, action: () => this.state = 'achievements' }
    ];

    buttons.forEach(btn => {
      if (x > cx - btnW/2 && x < cx + btnW/2 && y > btn.y && y < btn.y + btnH) {
        btn.action();
      }
    });
  }

  handlePlanetsClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    this.planets.forEach((planet, i) => {
      const py = startY + i * 65;
      if (y > py && y < py + 60) {
        if (planet.unlocked) {
          this.currentPlanet = i;
          this.state = 'missions';
        } else if (this.starsCollected >= planet.unlockStars) {
          planet.unlocked = true;
          this.currentPlanet = i;
          this.state = 'missions';
          this.checkPlanetAchievements();
          this.saveProgress();
        }
      }
    });
  }

  handleMissionsClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'planets';
      return;
    }

    const planet = this.planets[this.currentPlanet];
    const startY = 150;

    for (let i = 0; i < planet.missions; i++) {
      const my = startY + i * 70;
      if (y > my && y < my + 65) {
        const completed = (planet.completedMissions || 0) >= i;
        if (completed || i === (planet.completedMissions || 0)) {
          this.currentMission = i + 1;
          this.startMission();
        }
      }
    }
  }

  handleShopClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    const rocketKeys = Object.keys(this.rockets);

    rocketKeys.forEach((key, i) => {
      const rocket = this.rockets[key];
      const ry = startY + i * 70;

      if (y > ry && y < ry + 65) {
        if (this.unlockedRockets.includes(key)) {
          this.selectedRocket = key;
          this.saveProgress();
        } else if (x > this.canvas.width - 120 && this.coins >= rocket.price) {
          this.coins -= rocket.price;
          this.unlockedRockets.push(key);
          this.selectedRocket = key;
          if (this.unlockedRockets.length >= rocketKeys.length) {
            this.checkAchievement('ship_collector');
          }
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

  handleVictoryClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 80 && y < cy + 130) {
      this.state = 'missions';
    }
  }

  handleGameOverClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 50 && y < cy + 100) {
      this.state = 'missions';
    }
  }

  startMission() {
    this.state = 'playing';

    // Reset ship
    const rocket = this.rockets[this.selectedRocket];
    this.ship.y = this.canvas.height / 2;
    this.ship.vy = 0;
    this.ship.maxFuel = 100 + this.upgrades.fuelCapacity.level * this.upgrades.fuelCapacity.effect;
    this.ship.fuel = this.ship.maxFuel;

    // Clear objects
    this.stars = [];
    this.crystals = [];
    this.asteroids = [];
    this.powerUps = [];
    this.activePowerUps = { shield: 0, magnet: 0, boost: 0 };

    // Mission setup
    this.missionTarget = 10 + this.currentMission * 5 + this.currentPlanet * 10;
    this.missionProgress = 0;
    this.missionCoins = 0;
    this.missionStars = 0;
    this.missionCrystals = 0;
    this.flightTime = 0;

    this.scrollSpeed = 3 + this.currentPlanet * 0.5;

    // Spawn initial objects
    for (let i = 0; i < 10; i++) {
      this.spawnStar(200 + i * 100);
    }
    for (let i = 0; i < 3; i++) {
      this.spawnAsteroid(400 + i * 200);
    }
  }

  spawnStar(x) {
    this.stars.push({
      x: x || this.canvas.width + 50,
      y: 50 + Math.random() * (this.canvas.height - 100),
      size: 25,
      value: 1
    });
  }

  spawnCrystal(x) {
    this.crystals.push({
      x: x || this.canvas.width + 50,
      y: 50 + Math.random() * (this.canvas.height - 100),
      size: 30,
      value: 10
    });
  }

  spawnAsteroid(x) {
    const sizes = [30, 40, 50];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    this.asteroids.push({
      x: x || this.canvas.width + 50,
      y: 50 + Math.random() * (this.canvas.height - 100),
      size,
      speed: 1 + Math.random() * 2
    });
  }

  spawnPowerUp(x) {
    const types = ['shield', 'magnet', 'boost', 'fuel'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push({
      x: x || this.canvas.width + 50,
      y: 50 + Math.random() * (this.canvas.height - 100),
      type,
      size: 30
    });
  }

  addParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color,
        size: 3 + Math.random() * 4
      });
    }
  }

  checkAchievement(id, value = 1, target = 1) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked && value >= target) {
      ach.unlocked = true;
      this.achievementPopup = { ...ach, timer: 3000 };
      this.coins += 150;
      this.diamonds += 10;
      this.saveAchievements();
    }
  }

  checkAchievementProgress(id, progress) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.progress = progress;
      if (progress >= ach.target) {
        this.checkAchievement(id, progress, ach.target);
      }
      this.saveAchievements();
    }
  }

  checkPlanetAchievements() {
    const unlockedCount = this.planets.filter(p => p.unlocked).length;
    if (unlockedCount >= 4) this.checkAchievement('planet_visitor');
    if (unlockedCount >= this.planets.length) this.checkAchievement('all_planets');
  }

  update(dt) {
    // Background stars
    this.backgroundStars.forEach(star => {
      star.x -= star.speed;
      if (star.x < 0) {
        star.x = this.canvas.width;
        star.y = Math.random() * this.canvas.height;
      }
    });

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt / 500;
      return p.life > 0;
    });

    // Achievement popup
    if (this.achievementPopup) {
      this.achievementPopup.timer -= dt;
      if (this.achievementPopup.timer <= 0) this.achievementPopup = null;
    }

    if (this.state !== 'playing') return;

    const rocket = this.rockets[this.selectedRocket];
    const fuelEfficiency = rocket.fuelEfficiency * (1 + this.upgrades.fuelEfficiency.level * this.upgrades.fuelEfficiency.effect);

    // Ship physics
    if (this.isFlying && this.ship.fuel > 0) {
      this.ship.vy -= 0.5 * rocket.speed;
      this.ship.fuel -= dt / 100 / fuelEfficiency;
      this.addParticles(this.ship.x - 20, this.ship.y + this.ship.height/2, '#ff6600', 2);
    }

    this.ship.vy += 0.3; // Gravity
    this.ship.y += this.ship.vy;

    // Speed boost
    let currentSpeed = this.scrollSpeed * rocket.speed;
    if (this.activePowerUps.boost > 0) {
      currentSpeed *= 1.5;
      this.activePowerUps.boost -= dt;
    }

    // Bounds
    if (this.ship.y < 30) {
      this.ship.y = 30;
      this.ship.vy = 0;
    }
    if (this.ship.y > this.canvas.height - 30) {
      this.ship.y = this.canvas.height - 30;
      this.ship.vy = 0;
    }

    // Shield countdown
    if (this.activePowerUps.shield > 0) {
      this.activePowerUps.shield -= dt;
    }

    // Magnet countdown
    if (this.activePowerUps.magnet > 0) {
      this.activePowerUps.magnet -= dt;
    }

    // Flight time
    this.flightTime += dt;
    if (this.flightTime > this.longestFlight) {
      this.longestFlight = this.flightTime;
    }
    if (this.flightTime >= 300000) { // 5 minutes
      this.checkAchievement('survivor');
    }

    // Magnet effect
    const magnetRange = 50 + this.upgrades.starMagnet.level * this.upgrades.starMagnet.effect;
    const effectiveMagnet = this.activePowerUps.magnet > 0 ? magnetRange * 2 : magnetRange;

    // Stars
    this.stars.forEach(star => {
      const dx = this.ship.x - star.x;
      const dy = this.ship.y - star.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < effectiveMagnet) {
        star.x += dx * 0.1;
        star.y += dy * 0.1;
      }
    });

    this.stars = this.stars.filter(star => {
      star.x -= currentSpeed;

      const dx = this.ship.x - star.x;
      const dy = this.ship.y - star.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 35) {
        this.missionStars++;
        this.missionProgress++;
        this.totalStars++;
        this.starsCollected++;
        this.missionCoins += 5;
        this.addParticles(star.x, star.y, '#ffd700', 8);
        this.checkAchievementProgress('star_collector', this.totalStars);
        return false;
      }

      return star.x > -30;
    });

    // Spawn stars
    if (this.stars.length < 8) {
      this.spawnStar();
    }

    // Crystals
    this.crystals = this.crystals.filter(crystal => {
      crystal.x -= currentSpeed;

      const dx = this.ship.x - crystal.x;
      const dy = this.ship.y - crystal.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 40) {
        this.missionCrystals++;
        this.totalCrystals++;
        this.missionCoins += 25;
        this.addParticles(crystal.x, crystal.y, '#00ffff', 12);
        this.checkAchievementProgress('crystal_master', this.totalCrystals);
        return false;
      }

      return crystal.x > -30;
    });

    // Spawn crystals
    if (Math.random() < 0.005 && this.crystals.length < 3) {
      this.spawnCrystal();
    }

    // Asteroids
    this.asteroids = this.asteroids.filter(asteroid => {
      asteroid.x -= currentSpeed + asteroid.speed;

      const dx = this.ship.x - asteroid.x;
      const dy = this.ship.y - asteroid.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < (this.ship.width + asteroid.size) / 2 - 10) {
        if (this.activePowerUps.shield <= 0) {
          this.gameOver();
        } else {
          this.addParticles(asteroid.x, asteroid.y, '#888', 15);
          return false;
        }
      }

      return asteroid.x > -50;
    });

    // Spawn asteroids
    if (this.asteroids.length < 4 + this.currentPlanet) {
      this.spawnAsteroid();
    }

    // Power-ups
    this.powerUps = this.powerUps.filter(powerUp => {
      powerUp.x -= currentSpeed;

      const dx = this.ship.x - powerUp.x;
      const dy = this.ship.y - powerUp.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 40) {
        const shieldDuration = 5000 + this.upgrades.shieldDuration.level * this.upgrades.shieldDuration.effect;

        switch (powerUp.type) {
          case 'shield':
            this.activePowerUps.shield = shieldDuration;
            break;
          case 'magnet':
            this.activePowerUps.magnet = 8000;
            break;
          case 'boost':
            this.activePowerUps.boost = 5000;
            break;
          case 'fuel':
            this.ship.fuel = Math.min(this.ship.maxFuel, this.ship.fuel + 30);
            break;
        }
        this.addParticles(powerUp.x, powerUp.y, '#00ff00', 10);
        return false;
      }

      return powerUp.x > -30;
    });

    // Spawn power-ups
    if (Math.random() < 0.003 && this.powerUps.length < 2) {
      this.spawnPowerUp();
    }

    // Check victory
    if (this.missionProgress >= this.missionTarget) {
      this.victory();
    }

    // Check fuel depletion
    if (this.ship.fuel <= 0 && this.ship.y >= this.canvas.height - 35) {
      this.gameOver();
    }
  }

  victory() {
    this.state = 'victory';

    const planet = this.planets[this.currentPlanet];
    if ((planet.completedMissions || 0) < this.currentMission) {
      planet.completedMissions = this.currentMission;
    }

    this.coins += this.missionCoins;
    this.xp += 20 + this.currentMission * 10;

    // Level up
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 5;
    }

    this.checkAchievement('first_flight');
    if (this.level >= 20) this.checkAchievement('level_20');

    this.saveProgress();
  }

  gameOver() {
    this.state = 'gameover';
    this.coins += Math.floor(this.missionCoins / 2);
    this.saveProgress();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    const planet = this.planets[this.currentPlanet] || this.planets[0];
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(1, planet.color + '40');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Background stars
    ctx.fillStyle = '#fff';
    this.backgroundStars.forEach(star => {
      ctx.globalAlpha = 0.3 + star.size / 4;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.state) {
      case 'menu': this.drawMenu(); break;
      case 'planets': this.drawPlanets(); break;
      case 'missions': this.drawMissions(); break;
      case 'shop': this.drawShop(); break;
      case 'upgrades': this.drawUpgrades(); break;
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

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(26,26,62,0.95)';
    ctx.fillRect(w/2 - 180, h/2 - 140, 360, 280);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(w/2 - 180, h/2 - 140, 360, 280);

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 70);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 - 10);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 25 + i * 25);
    });

    ctx.font = '14px Arial';
    ctx.fillStyle = '#87ceeb';
    ctx.fillText(`Toque para continuar (${this.tutorialPage + 1}/${this.tutorialPages.length})`, w/2, h/2 + 110);
  }

  drawMenu() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('🚀 SPACE EXPLORER 🚀', w/2, 60);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}   💎 ${this.diamonds}   ⭐ ${this.starsCollected}`, w/2, 95);
    ctx.fillText(`Nível ${this.level}`, w/2, 120);

    // Ship preview
    const rocket = this.rockets[this.selectedRocket];
    const time = Date.now() / 500;
    ctx.font = '80px Arial';
    ctx.fillText(rocket.emoji, w/2 + Math.sin(time) * 10, h/2 - 100 + Math.cos(time) * 15);

    const buttons = [
      { text: '🌍 Planetas', y: h/2 - 40 },
      { text: '🛸 Naves', y: h/2 + 20 },
      { text: '⬆️ Upgrades', y: h/2 + 80 },
      { text: '🏆 Conquistas', y: h/2 + 140 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(w/2 - 100, btn.y, 200, 50);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 100, btn.y, 200, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 32);
    });
  }

  drawPlanets() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('🌍 Planetas', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`⭐ ${this.starsCollected} estrelas coletadas`, w/2, 75);

    // Back button
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    this.planets.forEach((planet, i) => {
      const y = startY + i * 65;

      ctx.fillStyle = planet.unlocked ? '#1a1a3e' : '#111';
      ctx.fillRect(20, y, w - 40, 60);
      ctx.strokeStyle = planet.unlocked ? planet.color : '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, y, w - 40, 60);

      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(planet.emoji, 35, y + 42);

      ctx.fillStyle = planet.unlocked ? '#fff' : '#666';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(planet.name, 80, y + 25);
      ctx.font = '11px Arial';

      if (planet.unlocked) {
        ctx.fillStyle = '#87ceeb';
        ctx.fillText(`Missões: ${planet.completedMissions || 0}/${planet.missions}`, 80, y + 45);
      } else {
        ctx.fillStyle = '#666';
        ctx.fillText(`Requer ${planet.unlockStars}⭐`, 80, y + 45);
      }
    });
  }

  drawMissions() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const planet = this.planets[this.currentPlanet];

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText(`${planet.emoji} ${planet.name}`, w/2, 50);

    // Back button
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    // Current rocket
    const rocket = this.rockets[this.selectedRocket];
    ctx.font = '14px Arial';
    ctx.fillStyle = '#87ceeb';
    ctx.fillText(`Nave: ${rocket.emoji} ${rocket.name}`, w/2, 80);

    // Progress
    ctx.fillText(`Progresso: ${planet.completedMissions || 0}/${planet.missions}`, w/2, 105);

    // Progress bar
    ctx.fillStyle = '#111';
    ctx.fillRect(w/2 - 100, 115, 200, 15);
    ctx.fillStyle = planet.color;
    ctx.fillRect(w/2 - 100, 115, 200 * ((planet.completedMissions || 0) / planet.missions), 15);

    const startY = 150;
    for (let i = 0; i < planet.missions; i++) {
      const y = startY + i * 70;
      const completed = (planet.completedMissions || 0) > i;
      const available = (planet.completedMissions || 0) >= i;

      ctx.fillStyle = completed ? '#1a3a1a' : (available ? '#1a1a3e' : '#111');
      ctx.fillRect(20, y, w - 40, 65);
      ctx.strokeStyle = completed ? '#4CAF50' : (available ? '#ffd700' : '#333');
      ctx.lineWidth = 2;
      ctx.strokeRect(20, y, w - 40, 65);

      ctx.fillStyle = available ? '#fff' : '#666';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Missão ${i + 1}`, 35, y + 25);

      ctx.font = '12px Arial';
      ctx.fillStyle = available ? '#87ceeb' : '#555';
      const target = 10 + (i + 1) * 5 + this.currentPlanet * 10;
      ctx.fillText(`Colete ${target} estrelas`, 35, y + 45);

      ctx.textAlign = 'right';
      if (completed) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('✓ COMPLETA', w - 35, y + 38);
      } else if (available) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('JOGAR ▶', w - 35, y + 38);
      } else {
        ctx.fillStyle = '#555';
        ctx.font = '14px Arial';
        ctx.fillText('🔒', w - 35, y + 38);
      }
    }
  }

  drawShop() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('🛸 Naves Espaciais', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.rockets).forEach(([key, rocket], i) => {
      const y = startY + i * 70;
      const owned = this.unlockedRockets.includes(key);
      const selected = this.selectedRocket === key;

      ctx.fillStyle = selected ? '#1a3a3e' : '#1a1a3e';
      ctx.fillRect(20, y, w - 40, 65);
      ctx.strokeStyle = selected ? '#00ffff' : (owned ? '#ffd700' : '#555');
      ctx.lineWidth = selected ? 3 : 1;
      ctx.strokeRect(20, y, w - 40, 65);

      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(rocket.emoji, 35, y + 45);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(rocket.name, 85, y + 25);
      ctx.font = '11px Arial';
      ctx.fillStyle = '#87ceeb';
      ctx.fillText(`Vel: ${rocket.speed}x  Efic: ${rocket.fuelEfficiency}x`, 85, y + 48);

      ctx.textAlign = 'right';
      if (owned) {
        ctx.fillStyle = selected ? '#00ffff' : '#4CAF50';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(selected ? '✓ EQUIPADA' : 'SELECIONAR', w - 35, y + 40);
      } else {
        ctx.fillStyle = this.coins >= rocket.price ? '#ffd700' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`💰 ${rocket.price}`, w - 35, y + 40);
      }
    });
  }

  drawUpgrades() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️ Upgrades', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const names = {
      fuelCapacity: 'Tanque de Combustível',
      fuelEfficiency: 'Eficiência de Combustível',
      starMagnet: 'Imã de Estrelas',
      shieldDuration: 'Duração do Escudo'
    };

    const startY = 100;
    Object.entries(this.upgrades).forEach(([key, upg], i) => {
      const y = startY + i * 80;
      const price = upg.basePrice * (upg.level + 1);
      const canBuy = this.coins >= price && upg.level < upg.maxLevel;

      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(20, y, w - 40, 70);
      ctx.strokeStyle = '#ffd700';
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(names[key] || upg.name, 35, y + 25);

      // Level bar
      ctx.fillStyle = '#111';
      ctx.fillRect(35, y + 35, 120, 15);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(35, y + 35, 120 * (upg.level / upg.maxLevel), 15);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${upg.level}/${upg.maxLevel}`, 95, y + 47);

      ctx.textAlign = 'right';
      if (upg.level >= upg.maxLevel) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('MÁXIMO', w - 35, y + 45);
      } else {
        ctx.fillStyle = canBuy ? '#ffd700' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`💰 ${price}`, w - 35, y + 45);
      }
    });
  }

  drawAchievements() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Conquistas', w/2, 50);

    // Back button
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#ffd700';
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

      ctx.fillStyle = ach.unlocked ? '#1a3a3e' : '#111';
      ctx.fillRect(x, y, itemW, 65);
      ctx.strokeStyle = ach.unlocked ? '#ffd700' : '#333';
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
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 45, y + 50, itemW - 60, 8);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 45, y + 50, (itemW - 60) * (ach.progress / ach.target), 8);
      }
    });
  }

  drawGame() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Stars
    this.stars.forEach(star => {
      ctx.font = `${star.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('⭐', star.x, star.y + star.size/3);
    });

    // Crystals
    this.crystals.forEach(crystal => {
      ctx.font = `${crystal.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('💎', crystal.x, crystal.y + crystal.size/3);
    });

    // Power-ups
    this.powerUps.forEach(powerUp => {
      const emojis = { shield: '🛡️', magnet: '🧲', boost: '⚡', fuel: '⛽' };
      ctx.font = `${powerUp.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(emojis[powerUp.type], powerUp.x, powerUp.y + powerUp.size/3);
    });

    // Asteroids
    this.asteroids.forEach(asteroid => {
      ctx.font = `${asteroid.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('☄️', asteroid.x, asteroid.y + asteroid.size/3);
    });

    // Ship
    const rocket = this.rockets[this.selectedRocket];
    ctx.font = `${this.ship.width}px Arial`;
    ctx.textAlign = 'center';

    // Shield effect
    if (this.activePowerUps.shield > 0) {
      ctx.beginPath();
      ctx.arc(this.ship.x, this.ship.y, this.ship.width * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,255,0.7)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.fillText(rocket.emoji, this.ship.x, this.ship.y + this.ship.height/3);

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, 60);

    // Fuel bar
    ctx.fillStyle = '#333';
    ctx.fillRect(15, 15, 120, 18);
    ctx.fillStyle = this.ship.fuel > 30 ? '#4CAF50' : '#ff4444';
    ctx.fillRect(15, 15, 120 * (this.ship.fuel / this.ship.maxFuel), 18);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(15, 15, 120, 18);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`⛽ ${Math.ceil(this.ship.fuel)}%`, 75, 28);

    // Mission progress
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`⭐ ${this.missionProgress}/${this.missionTarget}`, w/2, 25);

    // Progress bar
    ctx.fillStyle = '#333';
    ctx.fillRect(w/2 - 80, 35, 160, 10);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(w/2 - 80, 35, 160 * Math.min(this.missionProgress / this.missionTarget, 1), 10);

    // Coins
    ctx.textAlign = 'right';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.missionCoins}`, w - 20, 30);

    // Active power-ups
    let powerUpX = 15;
    if (this.activePowerUps.shield > 0) {
      ctx.fillStyle = '#00ffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`🛡️ ${Math.ceil(this.activePowerUps.shield/1000)}s`, powerUpX, 55);
      powerUpX += 60;
    }
    if (this.activePowerUps.magnet > 0) {
      ctx.fillText(`🧲 ${Math.ceil(this.activePowerUps.magnet/1000)}s`, powerUpX, 55);
      powerUpX += 60;
    }
    if (this.activePowerUps.boost > 0) {
      ctx.fillText(`⚡ ${Math.ceil(this.activePowerUps.boost/1000)}s`, powerUpX, 55);
    }
  }

  drawVictory() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Missão Completa! 🎉', w/2, h/2 - 80);

    ctx.font = '50px Arial';
    ctx.fillText('🚀', w/2, h/2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Estrelas: ${this.missionStars}`, w/2, h/2 + 20);
    ctx.fillText(`Moedas: +${this.missionCoins}`, w/2, h/2 + 50);

    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(w/2 - 100, h/2 + 80, 200, 50);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(w/2 - 100, h/2 + 80, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Continuar', w/2, h/2 + 112);
  }

  drawGameOver() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Missão Falhou!', w/2, h/2 - 60);

    ctx.font = '60px Arial';
    ctx.fillText('💥', w/2, h/2 + 10);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Moedas: +${Math.floor(this.missionCoins/2)}`, w/2, h/2 + 40);

    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(w/2 - 100, h/2 + 50, 200, 50);
    ctx.strokeStyle = '#ffd700';
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
  setTimeout(() => new SpaceExplorerKids(), 1600);
});
