// Ninja Shadow Strike - EAI Games
// Action game para adolescentes com combate intenso

class NinjaShadowStrike {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_ninjashadow_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo, Ninja!', lines: ['Você é um guerreiro das sombras', 'Derrote todos os inimigos!'], emoji: '🥷' },
      { title: 'Controles', lines: ['← → para mover', '↑ para pular', 'Espaço/Toque para atacar'], emoji: '🎮' },
      { title: 'Combate', lines: ['Combine ataques para combos', 'Use habilidades especiais', 'Colete energia chi!'], emoji: '⚔️' },
      { title: 'Habilidades', lines: ['🔥 Shuriken de Fogo', '⚡ Dash Relâmpago', '💨 Corte Sombrio'], emoji: '✨' },
      { title: 'Equipamentos', lines: ['Desbloqueie armas lendárias', 'Melhore suas habilidades', 'Domine todos os estilos!'], emoji: '⚔️' },
      { title: 'Missão', lines: ['Complete 5 reinos', '10 estágios cada', 'Derrote os chefes!'], emoji: '🏯' }
    ];

    // Game state
    this.state = 'menu';
    this.loadProgress();

    // Player
    this.player = {
      x: 100,
      y: 0,
      vx: 0,
      vy: 0,
      width: 50,
      height: 60,
      hp: 100,
      maxHp: 100,
      chi: 0,
      maxChi: 100,
      facing: 1,
      attacking: false,
      attackFrame: 0,
      combo: 0,
      comboTimer: 0,
      invincible: 0,
      grounded: false
    };

    // Ninja types
    this.ninjaTypes = {
      shadow: { name: 'Ninja das Sombras', emoji: '🥷', color: '#333', speed: 1, damage: 1, price: 0 },
      fire: { name: 'Ninja do Fogo', emoji: '🔥', color: '#ff4444', speed: 0.9, damage: 1.3, price: 2000 },
      ice: { name: 'Ninja do Gelo', emoji: '❄️', color: '#44aaff', speed: 1.1, damage: 0.9, price: 2500 },
      thunder: { name: 'Ninja do Trovão', emoji: '⚡', color: '#ffff44', speed: 1.2, damage: 1.1, price: 3500 },
      void: { name: 'Ninja do Vazio', emoji: '🌀', color: '#aa44ff', speed: 1, damage: 1.5, price: 5000 }
    };

    // Weapons
    this.weapons = {
      katana: { name: 'Katana', damage: 10, speed: 1, range: 60, price: 0 },
      nunchaku: { name: 'Nunchaku', damage: 8, speed: 1.3, range: 50, price: 1000 },
      kusarigama: { name: 'Kusarigama', damage: 12, speed: 0.9, range: 80, price: 2000 },
      tanto: { name: 'Tanto', damage: 6, speed: 1.5, range: 40, price: 1500 },
      nodachi: { name: 'Nodachi', damage: 18, speed: 0.7, range: 100, price: 4000 }
    };

    // Skills
    this.skills = {
      fireball: { name: 'Shuriken de Fogo', cost: 20, damage: 25, cooldown: 0, maxCooldown: 3000, icon: '🔥' },
      dash: { name: 'Dash Relâmpago', cost: 15, damage: 15, cooldown: 0, maxCooldown: 2000, icon: '⚡' },
      shadowCut: { name: 'Corte Sombrio', cost: 35, damage: 50, cooldown: 0, maxCooldown: 5000, icon: '💨' },
      heal: { name: 'Meditação', cost: 40, damage: 0, cooldown: 0, maxCooldown: 8000, icon: '💚' }
    };

    // Upgrades
    this.upgrades = {
      health: { level: 0, maxLevel: 10, basePrice: 300, effect: 20, name: 'Vida Máxima' },
      damage: { level: 0, maxLevel: 10, basePrice: 400, effect: 0.1, name: 'Dano' },
      chi: { level: 0, maxLevel: 10, basePrice: 350, effect: 10, name: 'Chi Máximo' },
      speed: { level: 0, maxLevel: 10, basePrice: 500, effect: 0.05, name: 'Velocidade' }
    };
    this.loadUpgrades();

    // Realms
    this.realms = [
      { name: 'Floresta Sombria', bg1: '#1a4d2e', bg2: '#0d260f', unlockLevel: 1 },
      { name: 'Templo do Fogo', bg1: '#8B0000', bg2: '#4d0000', unlockLevel: 5 },
      { name: 'Montanha Gelada', bg1: '#1e3a5f', bg2: '#0a1628', unlockLevel: 10 },
      { name: 'Castelo Trovão', bg1: '#4a3728', bg2: '#251c14', unlockLevel: 15 },
      { name: 'Reino do Vazio', bg1: '#2d1b4e', bg2: '#0f0a1a', unlockLevel: 20 }
    ];

    this.currentRealm = 0;
    this.currentStage = 1;
    this.stagesPerRealm = 10;

    // Enemies
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.particles = [];
    this.platforms = [];

    // Stage data
    this.stageEnemies = 0;
    this.stageKills = 0;
    this.stageCoins = 0;
    this.stageXP = 0;

    // Achievements
    this.achievements = [
      { id: 'first_kill', name: 'Primeiro Golpe', desc: 'Derrote seu primeiro inimigo', icon: '⚔️', unlocked: false },
      { id: 'combo_5', name: 'Combinador', desc: 'Faça um combo de 5 hits', icon: '🔥', unlocked: false },
      { id: 'combo_10', name: 'Mestre do Combo', desc: 'Faça um combo de 10 hits', icon: '💥', unlocked: false },
      { id: 'realm_complete', name: 'Conquistador', desc: 'Complete um reino inteiro', icon: '🏆', unlocked: false },
      { id: 'all_ninjas', name: 'Colecionador', desc: 'Desbloqueie todos os ninjas', icon: '🥷', unlocked: false },
      { id: 'boss_slayer', name: 'Caçador de Chefes', desc: 'Derrote 5 chefes', icon: '👹', unlocked: false, progress: 0, target: 5 },
      { id: 'level_25', name: 'Veterano', desc: 'Alcance nível 25', icon: '⭐', unlocked: false },
      { id: 'millionaire', name: 'Rico', desc: 'Acumule 50000 moedas', icon: '💰', unlocked: false }
    ];
    this.loadAchievements();

    // Input
    this.keys = {};
    this.touching = false;
    this.touchX = 0;
    this.setupInput();

    // Ground level
    this.groundY = 0;

    // Start
    this.lastTime = performance.now();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.groundY = this.canvas.height - 80;
    if (this.player) this.player.y = this.groundY - this.player.height;
  }

  loadProgress() {
    this.coins = parseInt(localStorage.getItem('ninjashadow_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('ninjashadow_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('ninjashadow_xp') || '0');
    this.level = parseInt(localStorage.getItem('ninjashadow_level') || '1');
    this.highestRealm = parseInt(localStorage.getItem('ninjashadow_highest_realm') || '0');
    this.highestStage = parseInt(localStorage.getItem('ninjashadow_highest_stage') || '1');
    this.selectedNinja = localStorage.getItem('ninjashadow_selected_ninja') || 'shadow';
    this.selectedWeapon = localStorage.getItem('ninjashadow_selected_weapon') || 'katana';
    this.unlockedNinjas = JSON.parse(localStorage.getItem('ninjashadow_unlocked_ninjas') || '["shadow"]');
    this.unlockedWeapons = JSON.parse(localStorage.getItem('ninjashadow_unlocked_weapons') || '["katana"]');
    this.bossesDefeated = parseInt(localStorage.getItem('ninjashadow_bosses_defeated') || '0');
  }

  saveProgress() {
    localStorage.setItem('ninjashadow_coins', this.coins.toString());
    localStorage.setItem('ninjashadow_diamonds', this.diamonds.toString());
    localStorage.setItem('ninjashadow_xp', this.xp.toString());
    localStorage.setItem('ninjashadow_level', this.level.toString());
    localStorage.setItem('ninjashadow_highest_realm', this.highestRealm.toString());
    localStorage.setItem('ninjashadow_highest_stage', this.highestStage.toString());
    localStorage.setItem('ninjashadow_selected_ninja', this.selectedNinja);
    localStorage.setItem('ninjashadow_selected_weapon', this.selectedWeapon);
    localStorage.setItem('ninjashadow_unlocked_ninjas', JSON.stringify(this.unlockedNinjas));
    localStorage.setItem('ninjashadow_unlocked_weapons', JSON.stringify(this.unlockedWeapons));
    localStorage.setItem('ninjashadow_bosses_defeated', this.bossesDefeated.toString());
  }

  loadUpgrades() {
    const saved = localStorage.getItem('ninjashadow_upgrades');
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
    localStorage.setItem('ninjashadow_upgrades', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('ninjashadow_achievements');
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
    localStorage.setItem('ninjashadow_achievements', JSON.stringify(data));
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' && this.state === 'playing') {
        e.preventDefault();
        this.attack();
      }
      if (e.code === 'KeyQ') this.useSkill('fireball');
      if (e.code === 'KeyW') this.useSkill('dash');
      if (e.code === 'KeyE') this.useSkill('shadowCut');
      if (e.code === 'KeyR') this.useSkill('heal');
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touching = true;
      this.touchX = e.touches[0].clientX;
      this.handleClick(e.touches[0].clientX, e.touches[0].clientY);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.touchX = e.touches[0].clientX;
    });
    this.canvas.addEventListener('touchend', () => {
      this.touching = false;
    });
  }

  handleClick(x, y) {
    if (this.showTutorial) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_ninjashadow_tutorial_seen', 'true');
      }
      return;
    }

    switch (this.state) {
      case 'menu': this.handleMenuClick(x, y); break;
      case 'realms': this.handleRealmsClick(x, y); break;
      case 'stages': this.handleStagesClick(x, y); break;
      case 'shop': this.handleShopClick(x, y); break;
      case 'upgrades': this.handleUpgradesClick(x, y); break;
      case 'achievements': this.handleAchievementsClick(x, y); break;
      case 'playing':
        // Attack on screen tap
        if (y > 150 && y < this.canvas.height - 100) {
          this.attack();
        }
        // Skill buttons
        this.handleSkillButtons(x, y);
        break;
      case 'victory': this.handleVictoryClick(x, y); break;
      case 'gameover': this.handleGameOverClick(x, y); break;
    }
  }

  handleMenuClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const btnW = 200, btnH = 50;

    const buttons = [
      { y: cy - 40, action: () => this.state = 'realms' },
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

  handleRealmsClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 120;
    this.realms.forEach((realm, i) => {
      const ry = startY + i * 80;
      if (y > ry && y < ry + 70 && this.level >= realm.unlockLevel) {
        this.currentRealm = i;
        this.state = 'stages';
      }
    });
  }

  handleStagesClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'realms';
      return;
    }

    const cols = 5;
    const btnSize = 55;
    const gap = 15;
    const startX = (this.canvas.width - (cols * btnSize + (cols-1) * gap)) / 2;
    const startY = 150;

    for (let i = 0; i < this.stagesPerRealm; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnSize + gap);
      const by = startY + row * (btnSize + gap);

      if (x > bx && x < bx + btnSize && y > by && y < by + btnSize) {
        const absoluteStage = this.currentRealm * this.stagesPerRealm + i + 1;
        const highestAbsolute = this.highestRealm * this.stagesPerRealm + this.highestStage;

        if (absoluteStage <= highestAbsolute) {
          this.currentStage = i + 1;
          this.startStage();
        }
      }
    }
  }

  handleShopClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const w = this.canvas.width;
    const startY = 100;

    // Ninjas
    let itemY = startY;
    Object.entries(this.ninjaTypes).forEach(([key, ninja]) => {
      if (y > itemY && y < itemY + 55) {
        if (this.unlockedNinjas.includes(key)) {
          this.selectedNinja = key;
          this.saveProgress();
        } else if (x > w - 120 && this.coins >= ninja.price) {
          this.coins -= ninja.price;
          this.unlockedNinjas.push(key);
          this.selectedNinja = key;
          this.saveProgress();
          if (this.unlockedNinjas.length >= Object.keys(this.ninjaTypes).length) {
            this.checkAchievement('all_ninjas');
          }
        }
      }
      itemY += 60;
    });

    // Weapons
    itemY += 30;
    Object.entries(this.weapons).forEach(([key, weapon]) => {
      if (y > itemY && y < itemY + 55) {
        if (this.unlockedWeapons.includes(key)) {
          this.selectedWeapon = key;
          this.saveProgress();
        } else if (x > w - 120 && this.coins >= weapon.price) {
          this.coins -= weapon.price;
          this.unlockedWeapons.push(key);
          this.selectedWeapon = key;
          this.saveProgress();
        }
      }
      itemY += 60;
    });
  }

  handleUpgradesClick(x, y) {
    if (x < 100 && y < 60) {
      this.state = 'menu';
      return;
    }

    const startY = 100;
    const keys = Object.keys(this.upgrades);

    keys.forEach((key, i) => {
      const upg = this.upgrades[key];
      const uy = startY + i * 80;

      if (y > uy && y < uy + 70 && x > this.canvas.width - 120) {
        const price = upg.basePrice * (upg.level + 1);
        if (upg.level < upg.maxLevel && this.coins >= price) {
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

  handleSkillButtons(x, y) {
    const skillY = this.canvas.height - 70;
    const skills = Object.keys(this.skills);
    const startX = this.canvas.width - 260;

    skills.forEach((key, i) => {
      const sx = startX + i * 65;
      if (x > sx && x < sx + 55 && y > skillY && y < skillY + 55) {
        this.useSkill(key);
      }
    });
  }

  handleVictoryClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 80 && y < cy + 130) {
      // Progress
      const absoluteStage = this.currentRealm * this.stagesPerRealm + this.currentStage;
      const highestAbsolute = this.highestRealm * this.stagesPerRealm + this.highestStage;

      if (absoluteStage >= highestAbsolute) {
        if (this.currentStage < this.stagesPerRealm) {
          this.highestStage++;
        } else if (this.currentRealm < this.realms.length - 1) {
          this.highestRealm++;
          this.highestStage = 1;
          this.checkAchievement('realm_complete');
        }
        this.saveProgress();
      }

      this.state = 'stages';
    }
  }

  handleGameOverClick(x, y) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (x > cx - 100 && x < cx + 100 && y > cy + 50 && y < cy + 100) {
      this.state = 'stages';
    }
  }

  startStage() {
    this.state = 'playing';

    // Reset player
    const ninja = this.ninjaTypes[this.selectedNinja];
    this.player.x = 100;
    this.player.y = this.groundY - this.player.height;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.maxHp = 100 + this.upgrades.health.level * this.upgrades.health.effect;
    this.player.hp = this.player.maxHp;
    this.player.maxChi = 100 + this.upgrades.chi.level * this.upgrades.chi.effect;
    this.player.chi = 50;
    this.player.combo = 0;
    this.player.invincible = 0;
    this.player.grounded = true;

    // Reset skills
    Object.values(this.skills).forEach(s => s.cooldown = 0);

    // Stage setup
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.particles = [];
    this.stageCoins = 0;
    this.stageXP = 0;
    this.stageKills = 0;

    // Enemy count based on stage
    const isBoss = this.currentStage === this.stagesPerRealm;
    this.stageEnemies = isBoss ? 1 : 3 + this.currentStage + this.currentRealm * 2;

    // Generate platforms
    this.platforms = [];
    for (let i = 0; i < 3; i++) {
      this.platforms.push({
        x: 150 + i * 200 + Math.random() * 100,
        y: this.groundY - 100 - Math.random() * 100,
        width: 100 + Math.random() * 50,
        height: 15
      });
    }

    // Spawn initial enemies
    if (isBoss) {
      this.spawnBoss();
    } else {
      for (let i = 0; i < Math.min(this.stageEnemies, 4); i++) {
        this.spawnEnemy();
      }
    }
  }

  spawnEnemy() {
    const types = [
      { emoji: '👺', hp: 30, damage: 10, speed: 1.5, xp: 15, coins: 10 },
      { emoji: '👹', hp: 50, damage: 15, speed: 1, xp: 25, coins: 20 },
      { emoji: '🦇', hp: 20, damage: 8, speed: 2.5, xp: 10, coins: 8 },
      { emoji: '🐍', hp: 35, damage: 12, speed: 1.8, xp: 20, coins: 15 }
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = 1 + this.currentRealm * 0.3 + this.currentStage * 0.05;

    this.enemies.push({
      x: this.canvas.width + 50,
      y: this.groundY - 50,
      width: 40,
      height: 50,
      ...type,
      maxHp: Math.round(type.hp * difficulty),
      hp: Math.round(type.hp * difficulty),
      damage: Math.round(type.damage * difficulty),
      vx: 0,
      facing: -1,
      attackCooldown: 0,
      state: 'patrol'
    });
  }

  spawnBoss() {
    const bosses = [
      { emoji: '🐲', name: 'Dragão das Sombras', hp: 500, damage: 30, speed: 1 },
      { emoji: '👻', name: 'Espectro Anciã', hp: 400, damage: 25, speed: 1.5 },
      { emoji: '🦂', name: 'Escorpião Gigante', hp: 600, damage: 35, speed: 0.8 },
      { emoji: '🐺', name: 'Lobo Alfa', hp: 450, damage: 28, speed: 1.3 },
      { emoji: '🦁', name: 'Leão Demoníaco', hp: 700, damage: 40, speed: 0.7 }
    ];

    const boss = bosses[this.currentRealm] || bosses[0];
    const difficulty = 1 + this.currentRealm * 0.5;

    this.enemies.push({
      x: this.canvas.width - 150,
      y: this.groundY - 100,
      width: 80,
      height: 100,
      ...boss,
      maxHp: Math.round(boss.hp * difficulty),
      hp: Math.round(boss.hp * difficulty),
      damage: Math.round(boss.damage * difficulty),
      xp: 200 + this.currentRealm * 50,
      coins: 100 + this.currentRealm * 30,
      vx: 0,
      facing: -1,
      attackCooldown: 0,
      state: 'idle',
      isBoss: true,
      phase: 1
    });
  }

  attack() {
    if (this.player.attacking) return;

    this.player.attacking = true;
    this.player.attackFrame = 0;

    const weapon = this.weapons[this.selectedWeapon];
    const ninja = this.ninjaTypes[this.selectedNinja];
    const damageMultiplier = 1 + this.upgrades.damage.level * this.upgrades.damage.effect;

    const hitbox = {
      x: this.player.x + (this.player.facing > 0 ? this.player.width : -weapon.range),
      y: this.player.y,
      width: weapon.range,
      height: this.player.height
    };

    this.enemies.forEach(enemy => {
      if (this.checkCollision(hitbox, enemy)) {
        const damage = Math.round(weapon.damage * ninja.damage * damageMultiplier);
        this.damageEnemy(enemy, damage);

        // Combo
        this.player.combo++;
        this.player.comboTimer = 2000;

        // Chi gain
        this.player.chi = Math.min(this.player.maxChi, this.player.chi + 5);

        // Check combo achievements
        if (this.player.combo >= 5) this.checkAchievement('combo_5');
        if (this.player.combo >= 10) this.checkAchievement('combo_10');
      }
    });

    // Attack effect
    this.effects.push({
      x: hitbox.x,
      y: hitbox.y + hitbox.height / 2,
      type: 'slash',
      facing: this.player.facing,
      life: 200
    });

    setTimeout(() => {
      this.player.attacking = false;
    }, 300 / weapon.speed);
  }

  useSkill(skillKey) {
    const skill = this.skills[skillKey];
    if (!skill || skill.cooldown > 0 || this.player.chi < skill.cost) return;

    this.player.chi -= skill.cost;
    skill.cooldown = skill.maxCooldown;

    const damageMultiplier = 1 + this.upgrades.damage.level * this.upgrades.damage.effect;

    switch (skillKey) {
      case 'fireball':
        this.projectiles.push({
          x: this.player.x + this.player.width / 2,
          y: this.player.y + this.player.height / 2,
          vx: this.player.facing * 10,
          vy: 0,
          damage: skill.damage * damageMultiplier,
          emoji: '🔥',
          size: 30,
          isPlayerProjectile: true
        });
        break;

      case 'dash':
        this.player.vx = this.player.facing * 20;
        this.player.invincible = 500;
        // Damage enemies in path
        this.enemies.forEach(enemy => {
          const dist = Math.abs(enemy.x - this.player.x);
          if (dist < 200) {
            this.damageEnemy(enemy, skill.damage * damageMultiplier);
          }
        });
        this.effects.push({
          x: this.player.x,
          y: this.player.y + this.player.height / 2,
          type: 'dash',
          facing: this.player.facing,
          life: 300
        });
        break;

      case 'shadowCut':
        // Hit all enemies on screen
        this.enemies.forEach(enemy => {
          this.damageEnemy(enemy, skill.damage * damageMultiplier);
          this.addParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#aa44ff');
        });
        this.effects.push({
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          type: 'shadowCut',
          life: 500
        });
        break;

      case 'heal':
        const healAmount = 30 + this.upgrades.health.level * 5;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        this.addParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#44ff44');
        break;
    }
  }

  damageEnemy(enemy, damage) {
    enemy.hp -= damage;
    this.addParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ff4444');

    if (enemy.hp <= 0) {
      this.stageKills++;
      this.stageCoins += enemy.coins;
      this.stageXP += enemy.xp;
      this.checkAchievement('first_kill');

      if (enemy.isBoss) {
        this.bossesDefeated++;
        this.saveProgress();
        this.checkAchievementProgress('boss_slayer', this.bossesDefeated);
      }

      // Remove enemy
      const idx = this.enemies.indexOf(enemy);
      if (idx > -1) this.enemies.splice(idx, 1);

      // Spawn more if needed
      if (!enemy.isBoss && this.stageKills < this.stageEnemies && this.enemies.length < 3) {
        this.spawnEnemy();
      }

      // Check victory
      if (this.stageKills >= this.stageEnemies) {
        this.victory();
      }
    }
  }

  damagePlayer(damage) {
    if (this.player.invincible > 0) return;

    this.player.hp -= damage;
    this.player.invincible = 1000;
    this.player.combo = 0;
    this.addParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ff0000');

    if (this.player.hp <= 0) {
      this.gameOver();
    }
  }

  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  addParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        life: 1,
        color,
        size: 3 + Math.random() * 5
      });
    }
  }

  checkAchievement(id) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      this.achievementPopup = { ...ach, timer: 3000 };
      this.coins += 150;
      this.diamonds += 10;
      this.saveAchievements();
      this.saveProgress();
    }
  }

  checkAchievementProgress(id, progress) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.progress = progress;
      if (progress >= ach.target) {
        this.checkAchievement(id);
      }
      this.saveAchievements();
    }
  }

  victory() {
    this.state = 'victory';

    this.coins += this.stageCoins;
    this.xp += this.stageXP;

    // Level up
    const xpNeeded = this.level * 150;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 5;
    }

    if (this.level >= 25) this.checkAchievement('level_25');
    if (this.coins >= 50000) this.checkAchievement('millionaire');

    this.saveProgress();
  }

  gameOver() {
    this.state = 'gameover';
    this.coins += Math.floor(this.stageCoins / 2);
    this.xp += Math.floor(this.stageXP / 2);
    this.saveProgress();
  }

  update(dt) {
    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= dt / 500;
      return p.life > 0;
    });

    // Effects
    this.effects = this.effects.filter(e => {
      e.life -= dt;
      return e.life > 0;
    });

    // Achievement popup
    if (this.achievementPopup) {
      this.achievementPopup.timer -= dt;
      if (this.achievementPopup.timer <= 0) this.achievementPopup = null;
    }

    if (this.state !== 'playing') return;

    const ninja = this.ninjaTypes[this.selectedNinja];
    const speedMult = ninja.speed * (1 + this.upgrades.speed.level * this.upgrades.speed.effect);

    // Player movement
    let moveX = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX = -1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX = 1;

    // Touch controls
    if (this.touching) {
      const midX = this.canvas.width / 2;
      if (this.touchX < midX - 50) moveX = -1;
      else if (this.touchX > midX + 50) moveX = 1;
    }

    this.player.vx = moveX * 5 * speedMult;
    if (moveX !== 0) this.player.facing = moveX;

    // Jump
    if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && this.player.grounded) {
      this.player.vy = -15;
      this.player.grounded = false;
    }

    // Gravity
    this.player.vy += 0.6;
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Ground collision
    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.grounded = true;
    }

    // Platform collision
    this.platforms.forEach(plat => {
      if (this.player.vy > 0 &&
          this.player.x + this.player.width > plat.x &&
          this.player.x < plat.x + plat.width &&
          this.player.y + this.player.height >= plat.y &&
          this.player.y + this.player.height <= plat.y + plat.height + this.player.vy) {
        this.player.y = plat.y - this.player.height;
        this.player.vy = 0;
        this.player.grounded = true;
      }
    });

    // Screen bounds
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));

    // Invincibility
    if (this.player.invincible > 0) this.player.invincible -= dt;

    // Combo timer
    if (this.player.comboTimer > 0) {
      this.player.comboTimer -= dt;
      if (this.player.comboTimer <= 0) this.player.combo = 0;
    }

    // Chi regen
    this.player.chi = Math.min(this.player.maxChi, this.player.chi + dt * 0.005);

    // Skill cooldowns
    Object.values(this.skills).forEach(s => {
      if (s.cooldown > 0) s.cooldown -= dt;
    });

    // Enemy AI
    this.enemies.forEach(enemy => {
      const dx = this.player.x - enemy.x;
      const dist = Math.abs(dx);

      enemy.facing = dx > 0 ? 1 : -1;

      if (enemy.isBoss) {
        // Boss AI
        if (enemy.attackCooldown <= 0 && dist < 150) {
          this.damagePlayer(enemy.damage);
          enemy.attackCooldown = 2000;

          // Boss special attack
          if (Math.random() < 0.3) {
            this.projectiles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: enemy.facing * 8,
              vy: 0,
              damage: enemy.damage * 0.5,
              emoji: '💀',
              size: 40,
              isPlayerProjectile: false
            });
          }
        }

        if (dist > 100) {
          enemy.x += enemy.facing * enemy.speed;
        }
      } else {
        // Regular enemy AI
        if (dist < 50 && enemy.attackCooldown <= 0) {
          this.damagePlayer(enemy.damage);
          enemy.attackCooldown = 1500;
        }

        if (dist > 50 && dist < 400) {
          enemy.x += enemy.facing * enemy.speed * 2;
        }
      }

      enemy.attackCooldown -= dt;

      // Ground check for enemies
      enemy.y = Math.min(enemy.y, this.groundY - enemy.height);
    });

    // Projectiles
    this.projectiles = this.projectiles.filter(proj => {
      proj.x += proj.vx;
      proj.y += proj.vy;

      if (proj.isPlayerProjectile) {
        this.enemies.forEach(enemy => {
          if (this.checkCollision(
            { x: proj.x - proj.size/2, y: proj.y - proj.size/2, width: proj.size, height: proj.size },
            enemy
          )) {
            this.damageEnemy(enemy, proj.damage);
            proj.x = -100; // Remove
          }
        });
      } else {
        if (this.checkCollision(
          { x: proj.x - proj.size/2, y: proj.y - proj.size/2, width: proj.size, height: proj.size },
          this.player
        )) {
          this.damagePlayer(proj.damage);
          proj.x = -100; // Remove
        }
      }

      return proj.x > -50 && proj.x < this.canvas.width + 50;
    });
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    const realm = this.realms[this.currentRealm] || this.realms[0];
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, realm.bg1);
    gradient.addColorStop(1, realm.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    switch (this.state) {
      case 'menu': this.drawMenu(); break;
      case 'realms': this.drawRealms(); break;
      case 'stages': this.drawStages(); break;
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
      ctx.strokeStyle = '#e94560';
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

    ctx.fillStyle = 'rgba(26,26,46,0.95)';
    ctx.fillRect(w/2 - 180, h/2 - 140, 360, 280);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.strokeRect(w/2 - 180, h/2 - 140, 360, 280);

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 70);

    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 - 10);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 25 + i * 25);
    });

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(`Toque para continuar (${this.tutorialPage + 1}/${this.tutorialPages.length})`, w/2, h/2 + 110);
  }

  drawMenu() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#e94560';
    ctx.textAlign = 'center';
    ctx.fillText('🥷 NINJA SHADOW STRIKE 🥷', w/2, 70);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}   💎 ${this.diamonds}   ⭐ Nível ${this.level}`, w/2, 110);

    // Current ninja
    const ninja = this.ninjaTypes[this.selectedNinja];
    ctx.font = '80px Arial';
    ctx.fillText(ninja.emoji, w/2, h/2 - 90);
    ctx.font = '18px Arial';
    ctx.fillText(ninja.name, w/2, h/2 - 40);

    const buttons = [
      { text: '⚔️ Batalhar', y: h/2 - 40 },
      { text: '🛒 Loja', y: h/2 + 20 },
      { text: '⬆️ Upgrades', y: h/2 + 80 },
      { text: '🏆 Conquistas', y: h/2 + 140 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#16213e';
      ctx.fillRect(w/2 - 100, btn.y, 200, 50);
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 100, btn.y, 200, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 32);
    });

    // XP Bar
    const xpNeeded = this.level * 150;
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(w/2 - 100, h - 50, 200, 20);
    ctx.fillStyle = '#e94560';
    ctx.fillRect(w/2 - 100, h - 50, 200 * (this.xp / xpNeeded), 20);
    ctx.strokeStyle = '#e94560';
    ctx.strokeRect(w/2 - 100, h - 50, 200, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`XP: ${this.xp}/${xpNeeded}`, w/2, h - 36);
  }

  drawRealms() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#e94560';
    ctx.textAlign = 'center';
    ctx.fillText('Escolha o Reino', w/2, 70);

    // Back button
    ctx.fillStyle = '#16213e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#e94560';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 120;
    this.realms.forEach((realm, i) => {
      const y = startY + i * 80;
      const locked = this.level < realm.unlockLevel;

      const grad = ctx.createLinearGradient(0, y, 0, y + 70);
      grad.addColorStop(0, realm.bg1);
      grad.addColorStop(1, realm.bg2);
      ctx.fillStyle = locked ? '#333' : grad;
      ctx.fillRect(20, y, w - 40, 70);
      ctx.strokeStyle = locked ? '#555' : '#e94560';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = locked ? '#666' : '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}. ${realm.name}`, 40, y + 30);

      ctx.font = '14px Arial';
      if (locked) {
        ctx.fillText(`🔒 Requer nível ${realm.unlockLevel}`, 40, y + 52);
      } else {
        ctx.fillText('10 estágios', 40, y + 52);
      }
    });
  }

  drawStages() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const realm = this.realms[this.currentRealm];

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#e94560';
    ctx.textAlign = 'center';
    ctx.fillText(realm.name, w/2, 70);

    // Back button
    ctx.fillStyle = '#16213e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#e94560';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const cols = 5;
    const btnSize = 55;
    const gap = 15;
    const startX = (w - (cols * btnSize + (cols-1) * gap)) / 2;
    const startY = 150;

    for (let i = 0; i < this.stagesPerRealm; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);

      const absoluteStage = this.currentRealm * this.stagesPerRealm + i + 1;
      const highestAbsolute = this.highestRealm * this.stagesPerRealm + this.highestStage;
      const unlocked = absoluteStage <= highestAbsolute;
      const isBoss = i + 1 === this.stagesPerRealm;

      ctx.fillStyle = unlocked ? (isBoss ? '#8B0000' : '#16213e') : '#333';
      ctx.fillRect(x, y, btnSize, btnSize);
      ctx.strokeStyle = unlocked ? '#e94560' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnSize, btnSize);

      ctx.fillStyle = unlocked ? '#fff' : '#666';
      ctx.font = isBoss ? '24px Arial' : 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(unlocked ? (isBoss ? '👹' : (i + 1).toString()) : '🔒', x + btnSize/2, y + btnSize/2 + 7);
    }
  }

  drawShop() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#e94560';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 Loja', w/2, 40);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}`, w/2, 65);

    // Back button
    ctx.fillStyle = '#16213e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#e94560';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    let itemY = 90;

    // Ninjas section
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('NINJAS', 25, itemY);
    itemY += 20;

    Object.entries(this.ninjaTypes).forEach(([key, ninja]) => {
      const owned = this.unlockedNinjas.includes(key);
      const selected = this.selectedNinja === key;

      ctx.fillStyle = selected ? '#1a3a5c' : '#16213e';
      ctx.fillRect(20, itemY, w - 40, 50);
      ctx.strokeStyle = selected ? '#e94560' : '#333';
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(20, itemY, w - 40, 50);

      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ninja.emoji, 35, itemY + 35);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(ninja.name, 70, itemY + 25);
      ctx.font = '10px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Vel: ${ninja.speed}x  Dano: ${ninja.damage}x`, 70, itemY + 42);

      ctx.textAlign = 'right';
      if (owned) {
        ctx.fillStyle = selected ? '#e94560' : '#4ecdc4';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(selected ? '✓ USANDO' : 'SELECIONAR', w - 35, itemY + 32);
      } else {
        ctx.fillStyle = this.coins >= ninja.price ? '#ffd700' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`💰 ${ninja.price}`, w - 35, itemY + 32);
      }

      itemY += 55;
    });

    // Weapons section
    itemY += 15;
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ARMAS', 25, itemY);
    itemY += 20;

    Object.entries(this.weapons).forEach(([key, weapon]) => {
      const owned = this.unlockedWeapons.includes(key);
      const selected = this.selectedWeapon === key;

      ctx.fillStyle = selected ? '#1a3a5c' : '#16213e';
      ctx.fillRect(20, itemY, w - 40, 50);
      ctx.strokeStyle = selected ? '#e94560' : '#333';
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(20, itemY, w - 40, 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(weapon.name, 35, itemY + 25);
      ctx.font = '10px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Dano: ${weapon.damage}  Alcance: ${weapon.range}`, 35, itemY + 42);

      ctx.textAlign = 'right';
      if (owned) {
        ctx.fillStyle = selected ? '#e94560' : '#4ecdc4';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(selected ? '✓ USANDO' : 'SELECIONAR', w - 35, itemY + 32);
      } else {
        ctx.fillStyle = this.coins >= weapon.price ? '#ffd700' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`💰 ${weapon.price}`, w - 35, itemY + 32);
      }

      itemY += 55;
    });
  }

  drawUpgrades() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#e94560';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️ Upgrades', w/2, 50);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💰 ${this.coins}`, w/2, 75);

    // Back button
    ctx.fillStyle = '#16213e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#e94560';
    ctx.strokeRect(10, 10, 80, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('← Voltar', 50, 35);

    const startY = 100;
    Object.entries(this.upgrades).forEach(([key, upg], i) => {
      const y = startY + i * 80;
      const price = upg.basePrice * (upg.level + 1);
      const maxed = upg.level >= upg.maxLevel;

      ctx.fillStyle = '#16213e';
      ctx.fillRect(20, y, w - 40, 70);
      ctx.strokeStyle = '#e94560';
      ctx.strokeRect(20, y, w - 40, 70);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(upg.name, 35, y + 25);

      // Level bar
      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(35, y + 35, 150, 15);
      ctx.fillStyle = '#e94560';
      ctx.fillRect(35, y + 35, 150 * (upg.level / upg.maxLevel), 15);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${upg.level}/${upg.maxLevel}`, 110, y + 47);

      ctx.textAlign = 'right';
      if (maxed) {
        ctx.fillStyle = '#4ecdc4';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('MÁXIMO', w - 35, y + 45);
      } else {
        ctx.fillStyle = this.coins >= price ? '#ffd700' : '#666';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`💰 ${price}`, w - 35, y + 45);
      }
    });
  }

  drawAchievements() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#e94560';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Conquistas', w/2, 50);

    // Back button
    ctx.fillStyle = '#16213e';
    ctx.fillRect(10, 10, 80, 40);
    ctx.strokeStyle = '#e94560';
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

      ctx.fillStyle = ach.unlocked ? '#16213e' : '#222';
      ctx.fillRect(x, y, itemW, 65);
      ctx.strokeStyle = ach.unlocked ? '#ffd700' : '#444';
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
        ctx.fillStyle = '#e94560';
        ctx.fillRect(x + 45, y + 50, (itemW - 60) * (ach.progress / ach.target), 8);
      }
    });
  }

  drawGame() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Ground
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, this.groundY, w, h - this.groundY);

    // Platforms
    ctx.fillStyle = '#333';
    this.platforms.forEach(plat => {
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    });

    // Effects behind
    this.effects.filter(e => e.type === 'shadowCut').forEach(e => {
      ctx.globalAlpha = e.life / 500;
      ctx.fillStyle = '#aa44ff';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    });

    // Enemies
    this.enemies.forEach(enemy => {
      ctx.font = `${enemy.width}px Arial`;
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height);
      ctx.scale(enemy.facing, 1);
      ctx.fillText(enemy.emoji, 0, 0);
      ctx.restore();

      // HP bar
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x, enemy.y - 15, enemy.width, 8);
      ctx.fillStyle = enemy.isBoss ? '#ff4444' : '#44ff44';
      ctx.fillRect(enemy.x, enemy.y - 15, enemy.width * (enemy.hp / enemy.maxHp), 8);

      if (enemy.isBoss) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, enemy.x + enemy.width/2, enemy.y - 25);
      }
    });

    // Projectiles
    this.projectiles.forEach(proj => {
      ctx.font = `${proj.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(proj.emoji, proj.x, proj.y + proj.size/3);
    });

    // Player
    const ninja = this.ninjaTypes[this.selectedNinja];
    ctx.font = `${this.player.width}px Arial`;
    ctx.textAlign = 'center';

    if (this.player.invincible > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height);
    ctx.scale(this.player.facing, 1);
    ctx.fillText(ninja.emoji, 0, 0);
    ctx.restore();

    ctx.globalAlpha = 1;

    // Attack effect
    this.effects.filter(e => e.type === 'slash').forEach(e => {
      ctx.globalAlpha = e.life / 200;
      ctx.fillStyle = '#fff';
      ctx.save();
      ctx.translate(e.x + 30 * e.facing, e.y);
      ctx.rotate(e.facing > 0 ? -0.5 : 0.5);
      ctx.fillRect(-5, -30, 10, 60);
      ctx.restore();
      ctx.globalAlpha = 1;
    });

    // Dash effect
    this.effects.filter(e => e.type === 'dash').forEach(e => {
      ctx.globalAlpha = e.life / 300;
      ctx.strokeStyle = '#ffff44';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y - 20);
      ctx.lineTo(e.x + e.facing * 100, e.y - 20);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, 60);

    // HP Bar
    ctx.fillStyle = '#333';
    ctx.fillRect(15, 15, 150, 18);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(15, 15, 150 * (this.player.hp / this.player.maxHp), 18);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(15, 15, 150, 18);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(this.player.hp)}/${this.player.maxHp}`, 90, 28);

    // Chi Bar
    ctx.fillStyle = '#333';
    ctx.fillRect(15, 38, 150, 12);
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(15, 38, 150 * (this.player.chi / this.player.maxChi), 12);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(15, 38, 150, 12);
    ctx.font = '8px Arial';
    ctx.fillText(`Chi: ${Math.ceil(this.player.chi)}`, 90, 48);

    // Stage info
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#e94560';
    ctx.fillText(`${this.realms[this.currentRealm].name} - ${this.currentStage}`, w/2, 25);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Inimigos: ${this.stageKills}/${this.stageEnemies}`, w/2, 45);

    // Combo
    if (this.player.combo > 1) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`🔥 ${this.player.combo}x COMBO!`, w - 20, 35);
    }

    // Skill buttons
    const skillY = h - 70;
    const skills = Object.entries(this.skills);
    const startX = w - 260;

    skills.forEach(([key, skill], i) => {
      const sx = startX + i * 65;
      const onCooldown = skill.cooldown > 0;
      const canUse = this.player.chi >= skill.cost && !onCooldown;

      ctx.fillStyle = canUse ? '#16213e' : '#333';
      ctx.fillRect(sx, skillY, 55, 55);
      ctx.strokeStyle = canUse ? '#e94560' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, skillY, 55, 55);

      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(skill.icon, sx + 27, skillY + 35);

      if (onCooldown) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(sx, skillY, 55, 55 * (skill.cooldown / skill.maxCooldown));
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(Math.ceil(skill.cooldown / 1000) + 's', sx + 27, skillY + 35);
      }

      ctx.font = '10px Arial';
      ctx.fillStyle = '#4488ff';
      ctx.fillText(skill.cost, sx + 27, skillY + 52);
    });

    // Mobile controls hint
    if (this.touching) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(0, 100, w/2 - 50, h - 200);
      ctx.fillRect(w/2 + 50, 100, w/2 - 50, h - 200);
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
    ctx.fillText('⚔️ VITÓRIA! ⚔️', w/2, h/2 - 80);

    ctx.font = '50px Arial';
    ctx.fillText('🎉', w/2, h/2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Moedas: +${this.stageCoins}`, w/2, h/2 + 20);
    ctx.fillText(`XP: +${this.stageXP}`, w/2, h/2 + 50);

    ctx.fillStyle = '#16213e';
    ctx.fillRect(w/2 - 100, h/2 + 80, 200, 50);
    ctx.strokeStyle = '#e94560';
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
    ctx.fillText('DERROTADO', w/2, h/2 - 60);

    ctx.font = '60px Arial';
    ctx.fillText('💀', w/2, h/2 + 10);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Moedas: +${Math.floor(this.stageCoins/2)}`, w/2, h/2 + 40);

    ctx.fillStyle = '#16213e';
    ctx.fillRect(w/2 - 100, h/2 + 50, 200, 50);
    ctx.strokeStyle = '#e94560';
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
  setTimeout(() => new NinjaShadowStrike(), 1600);
});
