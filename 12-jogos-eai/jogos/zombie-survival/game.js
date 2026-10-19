// Zombie Survival Idle - EAI Games
// Jogo idle de sobrevivência zumbi para adolescentes

class ZombieSurvivalIdle {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_zombiesurvival_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Apocalipse Zumbi!', lines: ['Os mortos-vivos dominaram', 'Você deve sobreviver!'], emoji: '🧟' },
      { title: 'Combate', lines: ['Toque para atirar', 'Mate zumbis por moedas', 'Colete recursos!'], emoji: '🔫' },
      { title: 'Sobreviventes', lines: ['Recrute sobreviventes', 'Eles atiram automaticamente', 'Melhore suas armas!'], emoji: '👥' },
      { title: 'Base', lines: ['Construa defesas', 'Melhore seu abrigo', 'Resista às hordas!'], emoji: '🏚️' },
      { title: 'Hordas', lines: ['A cada 30 segundos', 'uma horda mais forte chega', 'Sobreviva o máximo!'], emoji: '💀' },
      { title: 'Boa Sorte!', lines: ['O apocalipse começou', 'Quantos dias você aguenta?', 'Sobreviva!'], emoji: '🎮' }
    ];

    // Game state
    this.state = 'menu';
    this.loadProgress();

    // Player/Base
    this.base = {
      x: 0,
      y: 0,
      hp: 100,
      maxHp: 100,
      defense: 0
    };

    // Weapons
    this.weapons = {
      pistol: { name: 'Pistola', damage: 10, fireRate: 500, emoji: '🔫', price: 0 },
      shotgun: { name: 'Escopeta', damage: 25, fireRate: 1000, emoji: '💥', price: 500 },
      rifle: { name: 'Rifle', damage: 15, fireRate: 300, emoji: '🎯', price: 800 },
      smg: { name: 'Submetralhadora', damage: 8, fireRate: 150, emoji: '⚡', price: 1200 },
      sniper: { name: 'Sniper', damage: 50, fireRate: 1500, emoji: '🔭', price: 2000 },
      minigun: { name: 'Minigun', damage: 12, fireRate: 100, emoji: '🔥', price: 5000 }
    };

    // Survivors (auto-attackers)
    this.survivorTypes = {
      civilian: { name: 'Civil', damage: 5, fireRate: 2000, emoji: '👤', price: 200 },
      soldier: { name: 'Soldado', damage: 15, fireRate: 1000, emoji: '🎖️', price: 600 },
      sniper: { name: 'Atirador', damage: 30, fireRate: 2500, emoji: '🥷', price: 1000 },
      medic: { name: 'Médico', damage: 5, fireRate: 3000, emoji: '👨‍⚕️', price: 800, heals: 5 },
      engineer: { name: 'Engenheiro', damage: 10, fireRate: 1500, emoji: '👷', price: 1200, repairs: 3 }
    };

    // Buildings/Upgrades
    this.buildings = {
      barricade: { name: 'Barricada', level: 0, maxLevel: 10, basePrice: 100, effect: 'defense', value: 5 },
      tower: { name: 'Torre', level: 0, maxLevel: 10, basePrice: 300, effect: 'range', value: 10 },
      hospital: { name: 'Hospital', level: 0, maxLevel: 5, basePrice: 500, effect: 'regen', value: 1 },
      armory: { name: 'Arsenal', level: 0, maxLevel: 5, basePrice: 400, effect: 'damage', value: 0.1 },
      radar: { name: 'Radar', level: 0, maxLevel: 5, basePrice: 600, effect: 'warning', value: 5 }
    };

    // Zombies
    this.zombies = [];
    this.zombieTypes = [
      { name: 'Walker', emoji: '🧟', hp: 20, damage: 5, speed: 0.5, coins: 5 },
      { name: 'Runner', emoji: '🏃', hp: 15, damage: 8, speed: 1.2, coins: 8 },
      { name: 'Brute', emoji: '👹', hp: 60, damage: 15, speed: 0.3, coins: 15 },
      { name: 'Spitter', emoji: '🤢', hp: 25, damage: 10, speed: 0.6, coins: 10, ranged: true },
      { name: 'Boss', emoji: '💀', hp: 200, damage: 30, speed: 0.4, coins: 50, isBoss: true }
    ];

    // Projectiles
    this.projectiles = [];
    this.effects = [];
    this.particles = [];

    // Wave system
    this.wave = 1;
    this.waveTimer = 0;
    this.waveDuration = 30000; // 30 seconds per wave
    this.zombiesKilledThisWave = 0;
    this.zombiesToSpawn = 0;
    this.spawnTimer = 0;

    // Stats
    this.totalKills = parseInt(localStorage.getItem('zombiesurvival_total_kills') || '0');
    this.bestWave = parseInt(localStorage.getItem('zombiesurvival_best_wave') || '1');
    this.daysAlive = parseInt(localStorage.getItem('zombiesurvival_days') || '0');

    // Achievements
    this.achievements = [
      { id: 'first_kill', name: 'Primeira Morte', desc: 'Mate seu primeiro zumbi', icon: '🧟', unlocked: false },
      { id: 'survivor', name: 'Sobrevivente', desc: 'Sobreviva 5 ondas', icon: '🏆', unlocked: false },
      { id: 'veteran', name: 'Veterano', desc: 'Sobreviva 10 ondas', icon: '⭐', unlocked: false },
      { id: 'legend', name: 'Lenda', desc: 'Sobreviva 20 ondas', icon: '👑', unlocked: false },
      { id: 'killer_100', name: 'Exterminador', desc: 'Mate 100 zumbis', icon: '💀', unlocked: false, progress: 0, target: 100 },
      { id: 'killer_1000', name: 'Genocida', desc: 'Mate 1000 zumbis', icon: '☠️', unlocked: false, progress: 0, target: 1000 },
      { id: 'rich', name: 'Sobrevivente Rico', desc: 'Acumule 50000 moedas', icon: '💰', unlocked: false },
      { id: 'army', name: 'Exército', desc: 'Tenha 10 sobreviventes', icon: '👥', unlocked: false }
    ];
    this.loadAchievements();

    // Input
    this.lastShot = 0;
    this.setupInput();

    // Start
    this.lastTime = performance.now();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.base.x = this.canvas.width / 2;
    this.base.y = this.canvas.height / 2;
  }

  loadProgress() {
    this.coins = parseInt(localStorage.getItem('zombiesurvival_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('zombiesurvival_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('zombiesurvival_xp') || '0');
    this.level = parseInt(localStorage.getItem('zombiesurvival_level') || '1');
    this.selectedWeapon = localStorage.getItem('zombiesurvival_weapon') || 'pistol';
    this.unlockedWeapons = JSON.parse(localStorage.getItem('zombiesurvival_unlocked_weapons') || '["pistol"]');
    this.survivors = JSON.parse(localStorage.getItem('zombiesurvival_survivors') || '[]');

    // Load buildings
    const savedBuildings = localStorage.getItem('zombiesurvival_buildings');
    if (savedBuildings) {
      const data = JSON.parse(savedBuildings);
      Object.keys(data).forEach(k => {
        if (this.buildings[k]) this.buildings[k].level = data[k];
      });
    }
  }

  saveProgress() {
    localStorage.setItem('zombiesurvival_coins', this.coins.toString());
    localStorage.setItem('zombiesurvival_diamonds', this.diamonds.toString());
    localStorage.setItem('zombiesurvival_xp', this.xp.toString());
    localStorage.setItem('zombiesurvival_level', this.level.toString());
    localStorage.setItem('zombiesurvival_weapon', this.selectedWeapon);
    localStorage.setItem('zombiesurvival_unlocked_weapons', JSON.stringify(this.unlockedWeapons));
    localStorage.setItem('zombiesurvival_survivors', JSON.stringify(this.survivors));
    localStorage.setItem('zombiesurvival_total_kills', this.totalKills.toString());
    localStorage.setItem('zombiesurvival_best_wave', this.bestWave.toString());
    localStorage.setItem('zombiesurvival_days', this.daysAlive.toString());

    const buildingsData = {};
    Object.keys(this.buildings).forEach(k => buildingsData[k] = this.buildings[k].level);
    localStorage.setItem('zombiesurvival_buildings', JSON.stringify(buildingsData));
  }

  loadAchievements() {
    const saved = localStorage.getItem('zombiesurvival_achievements');
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
    localStorage.setItem('zombiesurvival_achievements', JSON.stringify(data));
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
        localStorage.setItem('eai_zombiesurvival_tutorial_seen', 'true');
      }
      return;
    }

    switch (this.state) {
      case 'menu': this.handleMenuClick(x, y); break;
      case 'playing': this.handleGameClick(x, y); break;
      case 'shop': this.handleShopClick(x, y); break;
      case 'survivors': this.handleSurvivorsClick(x, y); break;
      case 'base': this.handleBaseClick(x, y); break;
      case 'achievements': this.handleAchievementsClick(x, y); break;
      case 'gameover': this.handleGameOverClick(x, y); break;
    }
  }

  handleMenuClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const btnW = 200, btnH = 50;

    const buttons = [
      { y: cy - 60, action: () => this.startGame() },
      { y: cy, action: () => this.state = 'shop' },
      { y: cy + 60, action: () => this.state = 'survivors' },
      { y: cy + 120, action: () => this.state = 'base' },
      { y: cy + 180, action: () => this.state = 'achievements' }
    ];

    buttons.forEach(btn => {
      if (x > cx - btnW/2 && x < cx + btnW/2 && y > btn.y && y < btn.y + btnH) {
        btn.action();
      }
    });
  }

  handleGameClick(x, y) {
    const now = Date.now();
    const weapon = this.weapons[this.selectedWeapon];
    const damageBonus = 1 + this.buildings.armory.level * this.buildings.armory.value;

    if (now - this.lastShot >= weapon.fireRate) {
      this.lastShot = now;

      // Shoot at click position
      const dx = x - this.base.x;
      const dy = y - this.base.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      this.projectiles.push({
        x: this.base.x,
        y: this.base.y,
        vx: (dx / dist) * 15,
        vy: (dy / dist) * 15,
        damage: weapon.damage * damageBonus,
        isPlayer: true
      });

      this.addParticles(this.base.x, this.base.y, '#ffff00', 3);
    }
  }

  handleShopClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    const weaponKeys = Object.keys(this.weapons);

    weaponKeys.forEach((key, i) => {
      const weapon = this.weapons[key];
      const wy = startY + i * 70;

      if (y > wy && y < wy + 65) {
        if (this.unlockedWeapons.includes(key)) {
          this.selectedWeapon = key;
          this.saveProgress();
        } else if (x > this.canvas.width - 120 && this.coins >= weapon.price) {
          this.coins -= weapon.price;
          this.unlockedWeapons.push(key);
          this.selectedWeapon = key;
          this.saveProgress();
        }
      }
    });
  }

  handleSurvivorsClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    const survivorKeys = Object.keys(this.survivorTypes);

    survivorKeys.forEach((key, i) => {
      const survivor = this.survivorTypes[key];
      const sy = startY + i * 70;

      if (y > sy && y < sy + 65 && x > this.canvas.width - 120) {
        if (this.coins >= survivor.price) {
          this.coins -= survivor.price;
          this.survivors.push({ type: key, lastShot: 0 });
          this.checkAchievement('army', this.survivors.length, 10);
          this.saveProgress();
        }
      }
    });
  }

  handleBaseClick(x, y) {
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
        const price = building.basePrice * (building.level + 1);
        if (this.coins >= price && building.level < building.maxLevel) {
          this.coins -= price;
          building.level++;
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

  handleGameOverClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 60 && y < cy + 110) {
      this.state = 'menu';
    }
  }

  startGame() {
    this.state = 'playing';
    this.wave = 1;
    this.waveTimer = 0;
    this.zombiesKilledThisWave = 0;
    this.zombies = [];
    this.projectiles = [];
    this.effects = [];

    // Reset base HP
    this.base.maxHp = 100 + this.buildings.barricade.level * this.buildings.barricade.value;
    this.base.hp = this.base.maxHp;
    this.base.defense = this.buildings.barricade.level * 2;

    // Calculate zombies for wave
    this.calculateWave();
  }

  calculateWave() {
    this.zombiesToSpawn = 5 + this.wave * 3;
    this.spawnTimer = 0;
  }

  spawnZombie() {
    const difficulty = 1 + (this.wave - 1) * 0.1;

    // Determine zombie type based on wave
    let typeIndex = 0;
    const rand = Math.random();
    if (this.wave >= 5 && rand < 0.1) typeIndex = 4; // Boss at wave 5+
    else if (this.wave >= 4 && rand < 0.2) typeIndex = 3; // Spitter
    else if (this.wave >= 3 && rand < 0.3) typeIndex = 2; // Brute
    else if (this.wave >= 2 && rand < 0.4) typeIndex = 1; // Runner
    else typeIndex = 0; // Walker

    const type = this.zombieTypes[typeIndex];

    // Spawn from edge
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(this.canvas.width, this.canvas.height) / 2 + 100;

    this.zombies.push({
      x: this.base.x + Math.cos(angle) * dist,
      y: this.base.y + Math.sin(angle) * dist,
      hp: Math.round(type.hp * difficulty),
      maxHp: Math.round(type.hp * difficulty),
      damage: Math.round(type.damage * difficulty),
      speed: type.speed,
      coins: Math.round(type.coins * difficulty),
      emoji: type.emoji,
      isBoss: type.isBoss,
      ranged: type.ranged,
      attackTimer: 0
    });

    this.zombiesToSpawn--;
  }

  killZombie(zombie) {
    this.coins += zombie.coins;
    this.xp += zombie.isBoss ? 50 : 10;
    this.totalKills++;
    this.zombiesKilledThisWave++;

    // Particles
    this.addParticles(zombie.x, zombie.y, '#00b894', 15);

    // Level up check
    const xpNeeded = this.level * 100;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 5;
    }

    // Achievements
    this.checkAchievement('first_kill');
    this.checkAchievementProgress('killer_100', this.totalKills);
    this.checkAchievementProgress('killer_1000', this.totalKills);
    if (this.coins >= 50000) this.checkAchievement('rich');

    // Remove zombie
    const idx = this.zombies.indexOf(zombie);
    if (idx > -1) this.zombies.splice(idx, 1);
  }

  addParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color,
        size: 3 + Math.random() * 5
      });
    }
  }

  checkAchievement(id, value = 1, target = 1) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked && value >= target) {
      ach.unlocked = true;
      this.achievementPopup = { ...ach, timer: 3000 };
      this.coins += 200;
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

  update(dt) {
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

    // Wave timer
    this.waveTimer += dt;

    // Spawn zombies
    this.spawnTimer += dt;
    if (this.zombiesToSpawn > 0 && this.spawnTimer >= 2000 / (1 + this.wave * 0.1)) {
      this.spawnTimer = 0;
      this.spawnZombie();
    }

    // Wave complete check
    if (this.zombiesToSpawn <= 0 && this.zombies.length === 0) {
      this.wave++;
      if (this.wave > this.bestWave) {
        this.bestWave = this.wave;
        this.diamonds += this.wave;
      }

      // Wave achievements
      if (this.wave >= 5) this.checkAchievement('survivor');
      if (this.wave >= 10) this.checkAchievement('veteran');
      if (this.wave >= 20) this.checkAchievement('legend');

      this.calculateWave();
      this.saveProgress();
    }

    // Base regeneration
    const regenRate = this.buildings.hospital.level * this.buildings.hospital.value;
    if (regenRate > 0) {
      this.base.hp = Math.min(this.base.maxHp, this.base.hp + regenRate * dt / 1000);
    }

    // Survivor auto-attack
    const damageBonus = 1 + this.buildings.armory.level * this.buildings.armory.value;
    const rangeBonus = 1 + this.buildings.tower.level * this.buildings.tower.value / 100;

    this.survivors.forEach(survivor => {
      const type = this.survivorTypes[survivor.type];
      const now = Date.now();

      if (now - survivor.lastShot >= type.fireRate) {
        // Find closest zombie
        let closest = null;
        let closestDist = Infinity;

        this.zombies.forEach(zombie => {
          const dx = zombie.x - this.base.x;
          const dy = zombie.y - this.base.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < closestDist && dist < 300 * rangeBonus) {
            closest = zombie;
            closestDist = dist;
          }
        });

        if (closest) {
          survivor.lastShot = now;
          const dx = closest.x - this.base.x;
          const dy = closest.y - this.base.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          this.projectiles.push({
            x: this.base.x,
            y: this.base.y,
            vx: (dx / dist) * 12,
            vy: (dy / dist) * 12,
            damage: type.damage * damageBonus,
            isPlayer: true
          });
        }

        // Medic healing
        if (type.heals && this.base.hp < this.base.maxHp) {
          this.base.hp = Math.min(this.base.maxHp, this.base.hp + type.heals);
          this.addParticles(this.base.x, this.base.y, '#55efc4', 5);
        }

        // Engineer repairs
        if (type.repairs && this.base.hp < this.base.maxHp) {
          this.base.hp = Math.min(this.base.maxHp, this.base.hp + type.repairs);
        }
      }
    });

    // Zombie movement and attack
    this.zombies.forEach(zombie => {
      const dx = this.base.x - zombie.x;
      const dy = this.base.y - zombie.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (zombie.ranged && dist < 200) {
        // Ranged attack
        zombie.attackTimer += dt;
        if (zombie.attackTimer >= 2000) {
          zombie.attackTimer = 0;
          this.projectiles.push({
            x: zombie.x,
            y: zombie.y,
            vx: (dx / dist) * 8,
            vy: (dy / dist) * 8,
            damage: zombie.damage,
            isPlayer: false
          });
        }
      } else if (dist < 50) {
        // Melee attack
        zombie.attackTimer += dt;
        if (zombie.attackTimer >= 1000) {
          zombie.attackTimer = 0;
          const actualDamage = Math.max(1, zombie.damage - this.base.defense);
          this.base.hp -= actualDamage;
          this.addParticles(this.base.x, this.base.y, '#ff4444', 5);

          if (this.base.hp <= 0) {
            this.gameOver();
          }
        }
      } else {
        // Move towards base
        zombie.x += (dx / dist) * zombie.speed * 2;
        zombie.y += (dy / dist) * zombie.speed * 2;
      }
    });

    // Projectiles
    this.projectiles = this.projectiles.filter(proj => {
      proj.x += proj.vx;
      proj.y += proj.vy;

      if (proj.isPlayer) {
        // Check zombie collision
        for (const zombie of this.zombies) {
          const dx = proj.x - zombie.x;
          const dy = proj.y - zombie.y;
          if (Math.sqrt(dx*dx + dy*dy) < 30) {
            zombie.hp -= proj.damage;
            this.addParticles(zombie.x, zombie.y, '#ff0000', 5);
            if (zombie.hp <= 0) {
              this.killZombie(zombie);
            }
            return false;
          }
        }
      } else {
        // Check base collision
        const dx = proj.x - this.base.x;
        const dy = proj.y - this.base.y;
        if (Math.sqrt(dx*dx + dy*dy) < 40) {
          const actualDamage = Math.max(1, proj.damage - this.base.defense);
          this.base.hp -= actualDamage;
          this.addParticles(this.base.x, this.base.y, '#ff4444', 5);
          if (this.base.hp <= 0) {
            this.gameOver();
          }
          return false;
        }
      }

      // Remove if off screen
      return proj.x > 0 && proj.x < this.canvas.width &&
             proj.y > 0 && proj.y < this.canvas.height;
    });
  }

  gameOver() {
    this.state = 'gameover';
    this.daysAlive += this.wave;
    this.saveProgress();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#2d3436');
    gradient.addColorStop(1, '#1e272e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Ground texture
    ctx.fillStyle = '#353b48';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.state) {
      case 'menu': this.drawMenu(); break;
      case 'playing': this.drawGame(); break;
      case 'shop': this.drawShop(); break;
      case 'survivors': this.drawSurvivors(); break;
      case 'base': this.drawBase(); break;
      case 'achievements': this.drawAchievements(); break;
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
      ctx.strokeStyle = '#00b894';
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

    ctx.fillStyle = 'rgba(45,52,54,0.95)';
    ctx.fillRect(w/2 - 180, h/2 - 140, 360, 280);
    ctx.strokeStyle = '#00b894';
    ctx.lineWidth = 4;
    ctx.strokeRect(w/2 - 180, h/2 - 140, 360, 280);

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 70);

    ctx.fillStyle = '#00b894';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 - 10);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 25 + i * 25);
    });

    ctx.font = '14px Arial';
    ctx.fillStyle = '#55efc4';
    ctx.fillText(`Toque para continuar (${this.tutorialPage + 1}/${this.tutorialPages.length})`, w/2, h/2 + 110);
  }

  drawMenu() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#00b894';
    ctx.textAlign = 'center';
    ctx.fillText('🧟 ZOMBIE SURVIVAL 🧟', w/2, 60);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}   💎 ${this.diamonds}   ⭐ Nível ${this.level}`, w/2, 95);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#55efc4';
    ctx.fillText(`Melhor onda: ${this.bestWave}   Total de mortes: ${this.totalKills}`, w/2, 120);

    // Zombie animation
    const time = Date.now() / 500;
    ctx.font = '80px Arial';
    ctx.fillText('🧟', w/2 + Math.sin(time) * 50, h/2 - 100 + Math.cos(time) * 10);

    const buttons = [
      { text: '⚔️ Jogar', y: h/2 - 60 },
      { text: '🔫 Armas', y: h/2 },
      { text: '👥 Sobreviventes', y: h/2 + 60 },
      { text: '🏚️ Base', y: h/2 + 120 },
      { text: '🏆 Conquistas', y: h/2 + 180 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#353b48';
      ctx.fillRect(w/2 - 100, btn.y, 200, 50);
      ctx.strokeStyle = '#00b894';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 100, btn.y, 200, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 32);
    });
  }

  drawGame() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Base
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏚️', this.base.x, this.base.y + 20);

    // Base HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(this.base.x - 40, this.base.y + 35, 80, 10);
    ctx.fillStyle = this.base.hp > 30 ? '#00b894' : '#ff4444';
    ctx.fillRect(this.base.x - 40, this.base.y + 35, 80 * (this.base.hp / this.base.maxHp), 10);

    // Zombies
    this.zombies.forEach(zombie => {
      ctx.font = zombie.isBoss ? '50px Arial' : '35px Arial';
      ctx.fillText(zombie.emoji, zombie.x, zombie.y + 15);

      // HP bar
      ctx.fillStyle = '#333';
      ctx.fillRect(zombie.x - 20, zombie.y - 25, 40, 6);
      ctx.fillStyle = zombie.isBoss ? '#e74c3c' : '#ff4444';
      ctx.fillRect(zombie.x - 20, zombie.y - 25, 40 * (zombie.hp / zombie.maxHp), 6);
    });

    // Projectiles
    this.projectiles.forEach(proj => {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = proj.isPlayer ? '#ffff00' : '#00ff00';
      ctx.fill();
    });

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, 70);

    // HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(15, 15, 150, 20);
    ctx.fillStyle = this.base.hp > 30 ? '#00b894' : '#ff4444';
    ctx.fillRect(15, 15, 150 * (this.base.hp / this.base.maxHp), 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(15, 15, 150, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(this.base.hp)}/${this.base.maxHp}`, 90, 30);

    // Wave info
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#00b894';
    ctx.fillText(`ONDA ${this.wave}`, w/2, 30);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Zumbis: ${this.zombies.length + this.zombiesToSpawn}`, w/2, 50);

    // Stats
    ctx.textAlign = 'right';
    ctx.font = '14px Arial';
    ctx.fillText(`💰 ${this.coins}`, w - 20, 25);
    ctx.fillText(`☠️ ${this.zombiesKilledThisWave}`, w - 20, 45);

    // Current weapon
    const weapon = this.weapons[this.selectedWeapon];
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(w/2 - 50, h - 60, 100, 50);
    ctx.strokeStyle = '#00b894';
    ctx.strokeRect(w/2 - 50, h - 60, 100, 50);
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(weapon.emoji, w/2, h - 25);
  }

  drawShop() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#00b894';
    ctx.textAlign = 'center';
    ctx.fillText('🔫 Arsenal', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#353b48';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#00b894';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.weapons).forEach(([key, weapon], i) => {
      const y = startY + i * 70;
      const owned = this.unlockedWeapons.includes(key);
      const selected = this.selectedWeapon === key;

      ctx.fillStyle = selected ? '#1e3d59' : '#353b48';
      ctx.fillRect(20, y, w - 40, 65);
      ctx.strokeStyle = selected ? '#00b894' : '#555';
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(20, y, w - 40, 65);

      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(weapon.emoji, 35, y + 42);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(weapon.name, 80, y + 25);
      ctx.font = '11px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Dano: ${weapon.damage}  Cadência: ${weapon.fireRate}ms`, 80, y + 48);

      ctx.textAlign = 'right';
      if (owned) {
        ctx.fillStyle = selected ? '#00b894' : '#55efc4';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(selected ? '✓ EQUIPADO' : 'SELECIONAR', w - 35, y + 40);
      } else {
        ctx.fillStyle = this.coins >= weapon.price ? '#ffd700' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`💰 ${weapon.price}`, w - 35, y + 40);
      }
    });
  }

  drawSurvivors() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#00b894';
    ctx.textAlign = 'center';
    ctx.fillText('👥 Sobreviventes', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}   Recrutados: ${this.survivors.length}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#353b48';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#00b894';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.survivorTypes).forEach(([key, survivor], i) => {
      const y = startY + i * 70;
      const count = this.survivors.filter(s => s.type === key).length;

      ctx.fillStyle = '#353b48';
      ctx.fillRect(20, y, w - 40, 65);
      ctx.strokeStyle = '#555';
      ctx.strokeRect(20, y, w - 40, 65);

      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(survivor.emoji, 35, y + 42);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${survivor.name} (${count})`, 80, y + 25);
      ctx.font = '11px Arial';
      ctx.fillStyle = '#aaa';
      let desc = `Dano: ${survivor.damage}  Cadência: ${survivor.fireRate}ms`;
      if (survivor.heals) desc += `  Cura: +${survivor.heals}`;
      if (survivor.repairs) desc += `  Reparo: +${survivor.repairs}`;
      ctx.fillText(desc, 80, y + 48);

      ctx.textAlign = 'right';
      ctx.fillStyle = this.coins >= survivor.price ? '#ffd700' : '#666';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`💰 ${survivor.price}`, w - 35, y + 40);
    });
  }

  drawBase() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#00b894';
    ctx.textAlign = 'center';
    ctx.fillText('🏚️ Base', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#353b48';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#00b894';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.buildings).forEach(([key, building], i) => {
      const y = startY + i * 80;
      const price = building.basePrice * (building.level + 1);
      const canBuy = this.coins >= price && building.level < building.maxLevel;

      ctx.fillStyle = '#353b48';
      ctx.fillRect(20, y, w - 40, 70);
      ctx.strokeStyle = '#555';
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(building.name, 35, y + 25);
      ctx.font = '11px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Efeito: +${building.value} ${building.effect}`, 35, y + 45);

      // Level bar
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(35, y + 50, 120, 12);
      ctx.fillStyle = '#00b894';
      ctx.fillRect(35, y + 50, 120 * (building.level / building.maxLevel), 12);
      ctx.fillStyle = '#fff';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${building.level}/${building.maxLevel}`, 95, y + 60);

      ctx.textAlign = 'right';
      if (building.level >= building.maxLevel) {
        ctx.fillStyle = '#00b894';
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
    ctx.fillStyle = '#00b894';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Conquistas', w/2, 50);

    // Back button
    ctx.fillStyle = '#353b48';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#00b894';
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

      ctx.fillStyle = ach.unlocked ? '#1e3d59' : '#2d3436';
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

      if (ach.progress !== undefined && !ach.unlocked) {
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(x + 45, y + 50, itemW - 60, 8);
        ctx.fillStyle = '#00b894';
        ctx.fillRect(x + 45, y + 50, (itemW - 60) * (ach.progress / ach.target), 8);
      }
    });
  }

  drawGameOver() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('☠️ GAME OVER ☠️', w/2, h/2 - 80);

    ctx.font = '60px Arial';
    ctx.fillText('🧟', w/2, h/2 - 10);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Onda alcançada: ${this.wave}`, w/2, h/2 + 30);
    ctx.fillText(`Zumbis mortos: ${this.zombiesKilledThisWave}`, w/2, h/2 + 55);

    ctx.fillStyle = '#353b48';
    ctx.fillRect(w/2 - 100, h/2 + 60, 200, 50);
    ctx.strokeStyle = '#00b894';
    ctx.strokeRect(w/2 - 100, h/2 + 60, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Menu', w/2, h/2 + 92);
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
  setTimeout(() => new ZombieSurvivalIdle(), 1600);
});
