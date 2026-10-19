// Dragon Quest Legends - EAI Games
// Jogo RPG épico de dragões para adolescentes

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class DragonQuestGame {
  constructor() {
    this.state = 'menu';
    this.coins = parseInt(localStorage.getItem('eai_dragonquest_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('eai_dragonquest_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('eai_dragonquest_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_dragonquest_level') || '1');

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_dragonquest_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Dragon Quest!', lines: ['Embarque em uma jornada épica', 'com poderosos dragões!'], emoji: '🐉' },
      { title: 'Colete Dragões', lines: ['Desbloqueie e evolua dragões', 'lendários de todos os elementos!'], emoji: '🥚' },
      { title: 'Batalhas Épicas', lines: ['Enfrente inimigos em combates', 'por turnos estratégicos!'], emoji: '⚔️' },
      { title: 'Explore Reinos', lines: ['Viaje por 6 reinos diferentes', 'cada um com 10 fases!'], emoji: '🏰' },
      { title: 'Torne-se uma Lenda!', lines: ['Colete todos os dragões', 'e domine o mundo!'], emoji: '👑' }
    ];

    // Dragons
    this.dragons = [
      { id: 'fire', name: 'Dragão de Fogo', emoji: '🔥', element: 'fire', hp: 100, atk: 25, def: 10, unlocked: true, level: 1 },
      { id: 'water', name: 'Dragão de Água', emoji: '💧', element: 'water', hp: 120, atk: 20, def: 15, unlocked: false, level: 1 },
      { id: 'earth', name: 'Dragão de Terra', emoji: '🌍', element: 'earth', hp: 150, atk: 18, def: 20, unlocked: false, level: 1 },
      { id: 'wind', name: 'Dragão de Vento', emoji: '🌪️', element: 'wind', hp: 90, atk: 30, def: 8, unlocked: false, level: 1 },
      { id: 'lightning', name: 'Dragão Trovão', emoji: '⚡', element: 'lightning', hp: 95, atk: 35, def: 5, unlocked: false, level: 1 },
      { id: 'ice', name: 'Dragão de Gelo', emoji: '❄️', element: 'ice', hp: 110, atk: 22, def: 18, unlocked: false, level: 1 },
      { id: 'shadow', name: 'Dragão Sombrio', emoji: '🌑', element: 'shadow', hp: 100, atk: 28, def: 12, unlocked: false, level: 1 },
      { id: 'light', name: 'Dragão Celestial', emoji: '✨', element: 'light', hp: 130, atk: 25, def: 25, unlocked: false, level: 1 }
    ];
    this.loadDragons();
    this.selectedDragon = this.dragons[0];

    // Realms
    this.realms = [
      { id: 'volcano', name: 'Reino Vulcânico', emoji: '🌋', color: '#ff4500', stages: 10, cleared: 0 },
      { id: 'ocean', name: 'Reino Oceânico', emoji: '🌊', color: '#0077be', stages: 10, cleared: 0 },
      { id: 'forest', name: 'Reino Florestal', emoji: '🌲', color: '#228b22', stages: 10, cleared: 0 },
      { id: 'sky', name: 'Reino Celestial', emoji: '☁️', color: '#87ceeb', stages: 10, cleared: 0 },
      { id: 'underground', name: 'Reino Subterrâneo', emoji: '⛏️', color: '#8b4513', stages: 10, cleared: 0 },
      { id: 'void', name: 'Reino do Vazio', emoji: '🕳️', color: '#4b0082', stages: 10, cleared: 0 }
    ];
    this.loadRealms();
    this.currentRealm = null;
    this.currentStage = 1;

    // Battle
    this.battleState = null;
    this.enemy = null;
    this.playerHP = 0;
    this.enemyHP = 0;
    this.battleLog = [];
    this.isPlayerTurn = true;
    this.battleAnimating = false;
    this.battleEffects = [];

    // Skills
    this.skills = [
      { id: 'attack', name: 'Ataque', emoji: '⚔️', type: 'damage', power: 1.0, cost: 0 },
      { id: 'fireball', name: 'Bola de Fogo', emoji: '🔥', type: 'damage', power: 1.5, cost: 10, element: 'fire' },
      { id: 'heal', name: 'Cura', emoji: '💚', type: 'heal', power: 0.3, cost: 15 },
      { id: 'shield', name: 'Escudo', emoji: '🛡️', type: 'buff', power: 1.5, cost: 10 }
    ];

    // Resources
    this.energy = parseInt(localStorage.getItem('eai_dragonquest_energy') || '50');
    this.maxEnergy = 50 + Math.floor(this.level / 5) * 10;
    this.lastEnergyRegen = parseInt(localStorage.getItem('eai_dragonquest_lastregen') || Date.now().toString());
    this.dragonEssence = parseInt(localStorage.getItem('eai_dragonquest_essence') || '0');

    // Achievements
    this.achievements = [
      { id: 'first_battle', name: 'Primeiro Combate', desc: 'Vença sua primeira batalha', icon: '⚔️', unlocked: false },
      { id: 'dragon_2', name: 'Domador', desc: 'Desbloqueie 2 dragões', icon: '🐉', unlocked: false },
      { id: 'dragon_5', name: 'Mestre Dragão', desc: 'Desbloqueie 5 dragões', icon: '🐲', unlocked: false },
      { id: 'realm_clear', name: 'Conquistador', desc: 'Complete um reino', icon: '🏰', unlocked: false },
      { id: 'level_10', name: 'Guerreiro', desc: 'Alcance nível 10', icon: '⭐', unlocked: false },
      { id: 'level_25', name: 'Campeão', desc: 'Alcance nível 25', icon: '🏆', unlocked: false },
      { id: 'dragon_max', name: 'Lenda', desc: 'Evolua um dragão ao máximo', icon: '👑', unlocked: false },
      { id: 'all_realms', name: 'Imperador', desc: 'Complete todos os reinos', icon: '🌟', unlocked: false }
    ];
    this.loadAchievements();

    // Visual effects
    this.particles = [];
    this.floatingTexts = [];

    // Energy regeneration
    this.regenEnergy();
    setInterval(() => this.regenEnergy(), 60000);

    this.setupEventListeners();
    this.gameLoop();
  }

  loadDragons() {
    const saved = JSON.parse(localStorage.getItem('eai_dragonquest_dragons') || 'null');
    if (saved) {
      saved.forEach(s => {
        const dragon = this.dragons.find(d => d.id === s.id);
        if (dragon) {
          dragon.unlocked = s.unlocked;
          dragon.level = s.level || 1;
        }
      });
    }
  }

  saveDragons() {
    const data = this.dragons.map(d => ({ id: d.id, unlocked: d.unlocked, level: d.level }));
    localStorage.setItem('eai_dragonquest_dragons', JSON.stringify(data));
  }

  loadRealms() {
    const saved = JSON.parse(localStorage.getItem('eai_dragonquest_realms') || 'null');
    if (saved) {
      saved.forEach(s => {
        const realm = this.realms.find(r => r.id === s.id);
        if (realm) realm.cleared = s.cleared;
      });
    }
  }

  saveRealms() {
    const data = this.realms.map(r => ({ id: r.id, cleared: r.cleared }));
    localStorage.setItem('eai_dragonquest_realms', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = JSON.parse(localStorage.getItem('eai_dragonquest_achievements') || '[]');
    this.achievements.forEach(a => a.unlocked = saved.includes(a.id));
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_dragonquest_achievements', JSON.stringify(unlocked));
  }

  checkAchievement(id) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.saveAchievements();
      this.showAchievementPopup(achievement);
      this.addXP(100);
      this.diamonds += 10;
      this.save();
    }
  }

  showAchievementPopup(achievement) {
    this.achievementPopup = { achievement, timer: 180, y: -100 };
  }

  regenEnergy() {
    const now = Date.now();
    const elapsed = now - this.lastEnergyRegen;
    const regenAmount = Math.floor(elapsed / 60000);

    if (regenAmount > 0) {
      this.energy = Math.min(this.maxEnergy, this.energy + regenAmount);
      this.lastEnergyRegen = now;
      localStorage.setItem('eai_dragonquest_energy', this.energy.toString());
      localStorage.setItem('eai_dragonquest_lastregen', now.toString());
    }
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
        localStorage.setItem('eai_dragonquest_tutorial_seen', 'true');
      }
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    if (this.state === 'menu') {
      this.handleMenuClick(x, y, w, h);
    } else if (this.state === 'dragons') {
      this.handleDragonsClick(x, y, w, h);
    } else if (this.state === 'realms') {
      this.handleRealmsClick(x, y, w, h);
    } else if (this.state === 'stages') {
      this.handleStagesClick(x, y, w, h);
    } else if (this.state === 'battle') {
      this.handleBattleClick(x, y, w, h);
    } else if (this.state === 'shop') {
      this.handleShopClick(x, y, w, h);
    } else if (this.state === 'achievements') {
      if (x < 80 && y < 50) this.state = 'menu';
    } else if (this.state === 'victory' || this.state === 'defeat') {
      this.state = 'menu';
    }
  }

  handleMenuClick(x, y, w, h) {
    // Adventure
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 - 40 && y < h/2 + 20) {
      this.state = 'realms';
    }
    // Dragons
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 40 && y < h/2 + 100) {
      this.state = 'dragons';
    }
    // Shop
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 120 && y < h/2 + 180) {
      this.state = 'shop';
    }
    // Achievements
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 200 && y < h/2 + 260) {
      this.state = 'achievements';
    }
  }

  handleDragonsClick(x, y, w, h) {
    // Back
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    // Dragon selection
    const cols = Math.min(4, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.dragons.forEach((dragon, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dx = 20 + col * itemWidth;
      const dy = 130 + row * 150;

      if (x > dx && x < dx + itemWidth - 10 && y > dy && y < dy + 140) {
        if (dragon.unlocked) {
          // Select dragon
          this.selectedDragon = dragon;
        }
      }

      // Upgrade button
      if (dragon.unlocked && dragon.level < 10) {
        const upgradeCost = dragon.level * 50;
        const btnY = dy + 100;
        if (x > dx + 10 && x < dx + itemWidth - 20 && y > btnY && y < btnY + 30) {
          if (this.dragonEssence >= upgradeCost) {
            this.dragonEssence -= upgradeCost;
            dragon.level++;
            dragon.hp = Math.floor(dragon.hp * 1.1);
            dragon.atk = Math.floor(dragon.atk * 1.1);
            dragon.def = Math.floor(dragon.def * 1.1);
            this.saveDragons();
            this.save();

            if (dragon.level >= 10) this.checkAchievement('dragon_max');
          }
        }
      }
    });
  }

  handleRealmsClick(x, y, w, h) {
    // Back
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    // Realm selection
    const cols = Math.min(3, Math.floor((w - 40) / 200));
    const itemWidth = (w - 40) / cols;

    this.realms.forEach((realm, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const rx = 20 + col * itemWidth;
      const ry = 130 + row * 150;

      // Check if realm is accessible
      const prevRealm = i > 0 ? this.realms[i - 1] : null;
      const isAccessible = i === 0 || (prevRealm && prevRealm.cleared >= 5);

      if (isAccessible && x > rx && x < rx + itemWidth - 10 && y > ry && y < ry + 130) {
        this.currentRealm = realm;
        this.state = 'stages';
      }
    });
  }

  handleStagesClick(x, y, w, h) {
    // Back
    if (x < 80 && y < 50) {
      this.state = 'realms';
      return;
    }

    // Stage selection
    const cols = 5;
    const itemSize = 60;
    const startX = (w - cols * (itemSize + 10)) / 2;
    const startY = 150;

    for (let i = 0; i < this.currentRealm.stages; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = startX + col * (itemSize + 10);
      const sy = startY + row * (itemSize + 20);

      const isUnlocked = i <= this.currentRealm.cleared;

      if (isUnlocked && x > sx && x < sx + itemSize && y > sy && y < sy + itemSize) {
        if (this.energy >= 5) {
          this.energy -= 5;
          localStorage.setItem('eai_dragonquest_energy', this.energy.toString());
          this.currentStage = i + 1;
          this.startBattle();
        }
      }
    }
  }

  handleBattleClick(x, y, w, h) {
    if (this.battleAnimating) return;

    if (!this.isPlayerTurn) return;

    // Skill buttons
    const btnWidth = 80;
    const btnHeight = 50;
    const startX = (w - this.skills.length * (btnWidth + 10)) / 2;
    const btnY = h - 80;

    this.skills.forEach((skill, i) => {
      const bx = startX + i * (btnWidth + 10);
      if (x > bx && x < bx + btnWidth && y > btnY && y < btnY + btnHeight) {
        this.useSkill(skill);
      }
    });
  }

  handleShopClick(x, y, w, h) {
    // Back
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    // Shop items
    const items = [
      { name: '50 Energia', price: 100, priceType: 'coins', give: () => { this.energy = Math.min(this.maxEnergy, this.energy + 50); } },
      { name: '10 Essência', price: 200, priceType: 'coins', give: () => { this.dragonEssence += 10; } },
      { name: 'Dragão de Água', price: 500, priceType: 'coins', give: () => { this.unlockDragon('water'); } },
      { name: 'Dragão de Terra', price: 750, priceType: 'coins', give: () => { this.unlockDragon('earth'); } },
      { name: 'Dragão de Vento', price: 50, priceType: 'diamonds', give: () => { this.unlockDragon('wind'); } },
      { name: 'Dragão Trovão', price: 75, priceType: 'diamonds', give: () => { this.unlockDragon('lightning'); } },
      { name: 'Dragão de Gelo', price: 100, priceType: 'diamonds', give: () => { this.unlockDragon('ice'); } },
      { name: 'Dragão Sombrio', price: 150, priceType: 'diamonds', give: () => { this.unlockDragon('shadow'); } }
    ];

    items.forEach((item, i) => {
      const iy = 140 + i * 60;
      if (y > iy && y < iy + 50 && x > w - 130 && x < w - 20) {
        const currency = item.priceType === 'coins' ? this.coins : this.diamonds;
        if (currency >= item.price) {
          if (item.priceType === 'coins') this.coins -= item.price;
          else this.diamonds -= item.price;
          item.give();
          this.save();
          this.saveDragons();
        }
      }
    });
  }

  unlockDragon(id) {
    const dragon = this.dragons.find(d => d.id === id);
    if (dragon && !dragon.unlocked) {
      dragon.unlocked = true;
      this.saveDragons();

      const unlockedCount = this.dragons.filter(d => d.unlocked).length;
      if (unlockedCount >= 2) this.checkAchievement('dragon_2');
      if (unlockedCount >= 5) this.checkAchievement('dragon_5');
    }
  }

  startBattle() {
    this.state = 'battle';
    this.battleState = 'fighting';

    // Create enemy based on stage
    const basePower = this.currentStage * 10 + (this.realms.indexOf(this.currentRealm) * 50);
    const isBoss = this.currentStage % 5 === 0;

    this.enemy = {
      name: isBoss ? 'Dragão Boss' : 'Inimigo',
      emoji: isBoss ? '🐲' : ['👹', '👺', '💀', '🧟', '🦇'][Math.floor(Math.random() * 5)],
      maxHP: basePower * (isBoss ? 3 : 1),
      hp: basePower * (isBoss ? 3 : 1),
      atk: Math.floor(basePower * 0.3 * (isBoss ? 1.5 : 1)),
      def: Math.floor(basePower * 0.1)
    };

    this.playerHP = this.getPlayerMaxHP();
    this.enemyHP = this.enemy.maxHP;
    this.isPlayerTurn = true;
    this.battleLog = ['Batalha iniciada!'];
    this.playerDefBuff = 1;
  }

  getPlayerMaxHP() {
    return this.selectedDragon.hp + this.selectedDragon.level * 20;
  }

  getPlayerAtk() {
    return this.selectedDragon.atk + this.selectedDragon.level * 5;
  }

  getPlayerDef() {
    return (this.selectedDragon.def + this.selectedDragon.level * 2) * this.playerDefBuff;
  }

  useSkill(skill) {
    if (!this.isPlayerTurn || this.battleAnimating) return;

    this.battleAnimating = true;

    if (skill.type === 'damage') {
      const damage = Math.max(1, Math.floor(this.getPlayerAtk() * skill.power - this.enemy.def * 0.5));
      this.enemyHP -= damage;
      this.battleLog.push(`${skill.emoji} ${skill.name}: ${damage} de dano!`);
      this.addBattleEffect('damage', canvas.width * 0.7, canvas.height * 0.3);
      this.addFloatingText(`-${damage}`, canvas.width * 0.7, canvas.height * 0.3, '#ff4444');
    } else if (skill.type === 'heal') {
      const heal = Math.floor(this.getPlayerMaxHP() * skill.power);
      this.playerHP = Math.min(this.getPlayerMaxHP(), this.playerHP + heal);
      this.battleLog.push(`${skill.emoji} ${skill.name}: +${heal} HP!`);
      this.addBattleEffect('heal', canvas.width * 0.3, canvas.height * 0.3);
      this.addFloatingText(`+${heal}`, canvas.width * 0.3, canvas.height * 0.3, '#44ff44');
    } else if (skill.type === 'buff') {
      this.playerDefBuff = skill.power;
      this.battleLog.push(`${skill.emoji} ${skill.name}: Defesa aumentada!`);
      this.addBattleEffect('buff', canvas.width * 0.3, canvas.height * 0.3);
    }

    setTimeout(() => {
      this.battleAnimating = false;

      if (this.enemyHP <= 0) {
        this.victory();
      } else {
        this.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 500);
      }
    }, 500);
  }

  enemyTurn() {
    this.battleAnimating = true;

    const damage = Math.max(1, Math.floor(this.enemy.atk - this.getPlayerDef() * 0.3));
    this.playerHP -= damage;
    this.battleLog.push(`${this.enemy.emoji} Ataque: ${damage} de dano!`);
    this.addBattleEffect('damage', canvas.width * 0.3, canvas.height * 0.3);
    this.addFloatingText(`-${damage}`, canvas.width * 0.3, canvas.height * 0.3, '#ff4444');

    // Reset defense buff
    this.playerDefBuff = 1;

    setTimeout(() => {
      this.battleAnimating = false;

      if (this.playerHP <= 0) {
        this.defeat();
      } else {
        this.isPlayerTurn = true;
      }
    }, 500);
  }

  addBattleEffect(type, x, y) {
    const colors = {
      damage: '#ff4444',
      heal: '#44ff44',
      buff: '#4444ff'
    };

    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 10 + 5,
        color: colors[type],
        life: 30
      });
    }
  }

  addFloatingText(text, x, y, color) {
    this.floatingTexts.push({ text, x, y, color, life: 60, vy: -2 });
  }

  victory() {
    this.state = 'victory';

    // Rewards
    const coinsReward = 20 + this.currentStage * 10;
    const xpReward = 30 + this.currentStage * 5;
    const essenceReward = Math.random() < 0.3 ? Math.floor(Math.random() * 5) + 1 : 0;
    const diamondReward = this.currentStage % 5 === 0 ? 5 : 0;

    this.coins += coinsReward;
    this.dragonEssence += essenceReward;
    this.diamonds += diamondReward;
    this.addXP(xpReward);

    // Update realm progress
    if (this.currentStage > this.currentRealm.cleared) {
      this.currentRealm.cleared = this.currentStage;
      this.saveRealms();

      if (this.currentRealm.cleared >= 10) {
        this.checkAchievement('realm_clear');

        const allCleared = this.realms.every(r => r.cleared >= 10);
        if (allCleared) this.checkAchievement('all_realms');
      }
    }

    this.checkAchievement('first_battle');
    this.save();

    this.victoryRewards = { coins: coinsReward, xp: xpReward, essence: essenceReward, diamonds: diamondReward };
  }

  defeat() {
    this.state = 'defeat';
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 150;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 5;
      this.maxEnergy = 50 + Math.floor(this.level / 5) * 10;

      if (this.level >= 10) this.checkAchievement('level_10');
      if (this.level >= 25) this.checkAchievement('level_25');
    }
  }

  save() {
    localStorage.setItem('eai_dragonquest_coins', this.coins.toString());
    localStorage.setItem('eai_dragonquest_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_dragonquest_xp', this.xp.toString());
    localStorage.setItem('eai_dragonquest_level', this.level.toString());
    localStorage.setItem('eai_dragonquest_essence', this.dragonEssence.toString());
  }

  update() {
    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    // Update floating texts
    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y += t.vy;
      t.life--;
      return t.life > 0;
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
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#2d1b1b');
    gradient.addColorStop(0.5, '#1a0a0a');
    gradient.addColorStop(1, '#0f0505');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    if (this.state === 'menu') this.drawMenu();
    else if (this.state === 'dragons') this.drawDragons();
    else if (this.state === 'realms') this.drawRealms();
    else if (this.state === 'stages') this.drawStages();
    else if (this.state === 'battle') this.drawBattle();
    else if (this.state === 'shop') this.drawShop();
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

    // Draw floating texts
    this.floatingTexts.forEach(t => {
      ctx.globalAlpha = t.life / 60;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
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
      ctx.fillText('Conquista Desbloqueada!', w/2 + 20, this.achievementPopup.y + 35);
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

    ctx.fillStyle = '#1a0a0a';
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(w/2 - 160, h/2 - 140, 320, 280, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 60);

    ctx.fillStyle = '#ff4500';
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
      ctx.fillStyle = i === this.tutorialPage ? '#ff4500' : '#666';
      ctx.fill();
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Toque para continuar', w/2, h/2 + 140);
  }

  drawMenu() {
    const w = canvas.width;
    const h = canvas.height;

    // Title
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🐉 DRAGON QUEST LEGENDS 🐉', w/2, 70);

    // Stats bar
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${this.coins}`, 20, 30);
    ctx.fillText(`💎 ${this.diamonds}`, 110, 30);
    ctx.fillText(`⭐ Nv.${this.level}`, 200, 30);
    ctx.fillText(`⚡ ${this.energy}/${this.maxEnergy}`, 280, 30);
    ctx.fillText(`💠 ${this.dragonEssence}`, 370, 30);

    // Selected dragon
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.roundRect(w/2 - 80, 100, 160, 80, 10);
    ctx.fill();

    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.selectedDragon.emoji, w/2, 145);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${this.selectedDragon.name} Nv.${this.selectedDragon.level}`, w/2, 170);

    // Menu buttons
    const buttons = [
      { text: '⚔️ Aventura', y: h/2 - 40 },
      { text: '🐉 Dragões', y: h/2 + 40 },
      { text: '🛒 Loja', y: h/2 + 120 },
      { text: '🏆 Conquistas', y: h/2 + 200 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#2d1b1b';
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(w/2 - 100, btn.y - 25, 200, 50, 15);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 8);
    });
  }

  drawDragons() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🐉 SEUS DRAGÕES 🐉', w/2, 80);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`💠 Essência: ${this.dragonEssence}`, w/2, 110);

    const cols = Math.min(4, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.dragons.forEach((dragon, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 150;

      if (y > h - 50) return;

      ctx.fillStyle = dragon.unlocked ? (dragon === this.selectedDragon ? '#3d2b2b' : '#2d1b1b') : '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 140, 10);
      ctx.fill();

      if (dragon === this.selectedDragon) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.globalAlpha = dragon.unlocked ? 1 : 0.3;
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dragon.emoji, x + itemWidth/2 - 5, y + 45);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = dragon.unlocked ? '#fff' : '#666';
      ctx.fillText(dragon.name, x + itemWidth/2 - 5, y + 70);

      if (dragon.unlocked) {
        ctx.font = '11px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Nv.${dragon.level} | HP:${dragon.hp} ATK:${dragon.atk}`, x + itemWidth/2 - 5, y + 90);

        if (dragon.level < 10) {
          const upgradeCost = dragon.level * 50;
          ctx.fillStyle = this.dragonEssence >= upgradeCost ? '#4a4' : '#a44';
          ctx.beginPath();
          ctx.roundRect(x + 10, y + 100, itemWidth - 30, 30, 5);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(`Evoluir: 💠${upgradeCost}`, x + itemWidth/2 - 5, y + 120);
        } else {
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 12px Arial';
          ctx.fillText('MÁXIMO', x + itemWidth/2 - 5, y + 120);
        }
      } else {
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText('🔒 Bloqueado', x + itemWidth/2 - 5, y + 90);
      }
      ctx.globalAlpha = 1;
    });
  }

  drawRealms() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🏰 REINOS 🏰', w/2, 80);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#87ceeb';
    ctx.fillText(`⚡ Energia: ${this.energy}/${this.maxEnergy} (5 por batalha)`, w/2, 110);

    const cols = Math.min(3, Math.floor((w - 40) / 200));
    const itemWidth = (w - 40) / cols;

    this.realms.forEach((realm, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 150;

      if (y > h - 50) return;

      const prevRealm = i > 0 ? this.realms[i - 1] : null;
      const isAccessible = i === 0 || (prevRealm && prevRealm.cleared >= 5);

      ctx.fillStyle = isAccessible ? realm.color : '#333';
      ctx.globalAlpha = isAccessible ? 0.3 : 0.1;
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 130, 10);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = isAccessible ? realm.color : '#333';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '50px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = isAccessible ? 1 : 0.3;
      ctx.fillText(realm.emoji, x + itemWidth/2 - 5, y + 55);

      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = isAccessible ? '#fff' : '#666';
      ctx.fillText(realm.name, x + itemWidth/2 - 5, y + 85);

      ctx.font = '14px Arial';
      ctx.fillStyle = isAccessible ? '#ffd700' : '#444';
      ctx.fillText(`${realm.cleared}/${realm.stages} fases`, x + itemWidth/2 - 5, y + 110);
      ctx.globalAlpha = 1;

      if (!isAccessible) {
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText('🔒 Complete 5 fases anteriores', x + itemWidth/2 - 5, y + 125);
      }
    });
  }

  drawStages() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.currentRealm.color;
    ctx.fillText(`${this.currentRealm.emoji} ${this.currentRealm.name} ${this.currentRealm.emoji}`, w/2, 80);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#87ceeb';
    ctx.fillText(`⚡ Energia: ${this.energy}/${this.maxEnergy}`, w/2, 110);

    const cols = 5;
    const itemSize = 60;
    const startX = (w - cols * (itemSize + 10)) / 2;
    const startY = 150;

    for (let i = 0; i < this.currentRealm.stages; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (itemSize + 10);
      const y = startY + row * (itemSize + 20);

      const isCleared = i < this.currentRealm.cleared;
      const isUnlocked = i <= this.currentRealm.cleared;
      const isBoss = (i + 1) % 5 === 0;

      ctx.fillStyle = isCleared ? '#2a4a2a' : (isUnlocked ? this.currentRealm.color : '#333');
      ctx.globalAlpha = isUnlocked ? 0.5 : 0.2;
      ctx.beginPath();
      ctx.roundRect(x, y, itemSize, itemSize, 10);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = isCleared ? '#4a4' : (isUnlocked ? this.currentRealm.color : '#333');
      ctx.lineWidth = isBoss ? 4 : 2;
      ctx.stroke();

      ctx.font = isBoss ? '24px Arial' : '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = isUnlocked ? '#fff' : '#666';
      ctx.fillText(isBoss ? '👑' : (i + 1).toString(), x + itemSize/2, y + itemSize/2 + 8);

      if (isCleared) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '16px Arial';
        ctx.fillText('⭐', x + itemSize/2, y + itemSize - 5);
      }

      if (!isUnlocked) {
        ctx.fillStyle = '#666';
        ctx.font = '20px Arial';
        ctx.fillText('🔒', x + itemSize/2, y + itemSize/2 + 8);
      }
    }
  }

  drawBattle() {
    const w = canvas.width;
    const h = canvas.height;

    // Battle arena
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Player side
    const playerX = w * 0.25;
    const playerY = h * 0.4;

    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.selectedDragon.emoji, playerX, playerY);

    // Player HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(playerX - 60, playerY + 30, 120, 20);
    ctx.fillStyle = this.playerHP > this.getPlayerMaxHP() * 0.3 ? '#4a4' : '#a44';
    ctx.fillRect(playerX - 60, playerY + 30, 120 * (this.playerHP / this.getPlayerMaxHP()), 20);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(playerX - 60, playerY + 30, 120, 20);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${this.playerHP}/${this.getPlayerMaxHP()}`, playerX, playerY + 45);
    ctx.fillText(this.selectedDragon.name, playerX, playerY + 70);

    // Enemy side
    const enemyX = w * 0.75;
    const enemyY = h * 0.4;

    ctx.font = '80px Arial';
    ctx.fillText(this.enemy.emoji, enemyX, enemyY);

    // Enemy HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(enemyX - 60, enemyY + 30, 120, 20);
    ctx.fillStyle = '#a44';
    ctx.fillRect(enemyX - 60, enemyY + 30, 120 * (this.enemyHP / this.enemy.maxHP), 20);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(enemyX - 60, enemyY + 30, 120, 20);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.max(0, this.enemyHP)}/${this.enemy.maxHP}`, enemyX, enemyY + 45);
    ctx.fillText(this.enemy.name, enemyX, enemyY + 70);

    // Turn indicator
    ctx.fillStyle = this.isPlayerTurn ? '#4a4' : '#a44';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.isPlayerTurn ? '⚔️ Seu Turno!' : '🛡️ Turno do Inimigo...', w/2, 50);

    // Battle log
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(10, h - 180, w - 20, 80);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const logs = this.battleLog.slice(-3);
    logs.forEach((log, i) => {
      ctx.fillText(log, 20, h - 160 + i * 25);
    });

    // Skill buttons
    const btnWidth = 80;
    const btnHeight = 50;
    const startX = (w - this.skills.length * (btnWidth + 10)) / 2;
    const btnY = h - 80;

    this.skills.forEach((skill, i) => {
      const x = startX + i * (btnWidth + 10);

      ctx.fillStyle = this.isPlayerTurn ? '#2d1b1b' : '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(x, btnY, btnWidth, btnHeight, 10);
      ctx.fill();

      if (this.isPlayerTurn) {
        ctx.strokeStyle = '#ff4500';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(skill.emoji, x + btnWidth/2, btnY + 25);

      ctx.font = '10px Arial';
      ctx.fillStyle = this.isPlayerTurn ? '#fff' : '#666';
      ctx.fillText(skill.name, x + btnWidth/2, btnY + 42);
    });
  }

  drawShop() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🛒 LOJA 🛒', w/2, 80);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`🪙 ${this.coins}  💎 ${this.diamonds}`, w/2, 110);

    const items = [
      { name: '50 Energia', price: 100, priceType: 'coins', emoji: '⚡' },
      { name: '10 Essência', price: 200, priceType: 'coins', emoji: '💠' },
      { name: 'Dragão de Água', price: 500, priceType: 'coins', emoji: '💧' },
      { name: 'Dragão de Terra', price: 750, priceType: 'coins', emoji: '🌍' },
      { name: 'Dragão de Vento', price: 50, priceType: 'diamonds', emoji: '🌪️' },
      { name: 'Dragão Trovão', price: 75, priceType: 'diamonds', emoji: '⚡' },
      { name: 'Dragão de Gelo', price: 100, priceType: 'diamonds', emoji: '❄️' },
      { name: 'Dragão Sombrio', price: 150, priceType: 'diamonds', emoji: '🌑' }
    ];

    items.forEach((item, i) => {
      const y = 140 + i * 55;
      if (y > h - 50) return;

      const dragon = this.dragons.find(d => item.name.includes(d.name));
      const isOwned = dragon && dragon.unlocked;

      ctx.fillStyle = isOwned ? '#1a3a1a' : '#2d1b1b';
      ctx.beginPath();
      ctx.roundRect(20, y, w - 40, 50, 10);
      ctx.fill();

      ctx.font = '25px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.emoji, 35, y + 35);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(item.name, 75, y + 32);

      ctx.textAlign = 'right';
      if (isOwned) {
        ctx.fillStyle = '#4a4';
        ctx.fillText('✓ Obtido', w - 30, y + 32);
      } else {
        const currency = item.priceType === 'coins' ? this.coins : this.diamonds;
        ctx.fillStyle = currency >= item.price ? '#ffd700' : '#666';
        ctx.fillRect(w - 120, y + 10, 90, 30);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${item.priceType === 'coins' ? '🪙' : '💎'} ${item.price}`, w - 30, y + 32);
      }
    });
  }

  drawAchievements() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🏆 CONQUISTAS 🏆', w/2, 80);

    const unlocked = this.achievements.filter(a => a.unlocked).length;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${unlocked}/${this.achievements.length}`, w/2, 105);

    const cols = Math.min(4, Math.floor((w - 40) / 150));
    const itemWidth = (w - 40) / cols;

    this.achievements.forEach((a, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 100;

      if (y > h - 50) return;

      ctx.fillStyle = a.unlocked ? '#2d1b1b' : '#1a1a1a';
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

  drawVictory() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(0, 50, 0, 0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🎉 VITÓRIA! 🎉', w/2, h/3);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Recompensas:', w/2, h/2 - 40);

    ctx.font = '18px Arial';
    ctx.fillText(`🪙 +${this.victoryRewards.coins} moedas`, w/2, h/2);
    ctx.fillText(`⭐ +${this.victoryRewards.xp} XP`, w/2, h/2 + 30);
    if (this.victoryRewards.essence > 0) {
      ctx.fillText(`💠 +${this.victoryRewards.essence} essência`, w/2, h/2 + 60);
    }
    if (this.victoryRewards.diamonds > 0) {
      ctx.fillText(`💎 +${this.victoryRewards.diamonds} diamantes`, w/2, h/2 + 90);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '16px Arial';
    ctx.fillText('Toque para continuar', w/2, h - 80);
  }

  drawDefeat() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(50, 0, 0, 0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444';
    ctx.fillText('💀 DERROTA 💀', w/2, h/3);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Seu dragão foi derrotado...', w/2, h/2);
    ctx.fillText('Evolua seus dragões e tente novamente!', w/2, h/2 + 30);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px Arial';
    ctx.fillText('Toque para continuar', w/2, h - 80);
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

const game = new DragonQuestGame();
