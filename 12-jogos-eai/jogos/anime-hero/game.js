// Anime Hero Arena - EAI Games
// Jogo de coleção e batalha de heróis anime para adolescentes

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class AnimeHeroArena {
  constructor() {
    this.state = 'menu';
    this.coins = parseInt(localStorage.getItem('eai_animehero_coins') || '1000');
    this.diamonds = parseInt(localStorage.getItem('eai_animehero_diamonds') || '50');
    this.xp = parseInt(localStorage.getItem('eai_animehero_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_animehero_level') || '1');
    this.stamina = parseInt(localStorage.getItem('eai_animehero_stamina') || '100');
    this.maxStamina = 100;
    this.lastStaminaRegen = parseInt(localStorage.getItem('eai_animehero_lastregen') || Date.now().toString());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_animehero_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo à Arena!', lines: ['Monte seu time de heróis', 'e domine as batalhas!'], emoji: '⚔️' },
      { title: 'Invocação', lines: ['Use gemas para invocar', 'heróis poderosos!'], emoji: '✨' },
      { title: 'Raridades', lines: ['Comum, Raro, Épico, Lendário', 'e Mítico - colete todos!'], emoji: '🌟' },
      { title: 'Batalhas PvE', lines: ['Complete missões e campanhas', 'para ganhar recompensas!'], emoji: '🎯' },
      { title: 'Evolução', lines: ['Fortaleça seus heróis', 'e desbloqueie habilidades!'], emoji: '⬆️' }
    ];

    // Heroes database
    this.allHeroes = [
      // Common
      { id: 'knight', name: 'Cavaleiro', emoji: '🗡️', rarity: 'common', element: 'physical', baseHP: 100, baseATK: 20, baseDEF: 15 },
      { id: 'archer', name: 'Arqueiro', emoji: '🏹', rarity: 'common', element: 'physical', baseHP: 80, baseATK: 25, baseDEF: 10 },
      { id: 'mage_basic', name: 'Aprendiz', emoji: '🔮', rarity: 'common', element: 'magic', baseHP: 70, baseATK: 30, baseDEF: 8 },
      { id: 'healer_basic', name: 'Curandeiro', emoji: '💚', rarity: 'common', element: 'holy', baseHP: 90, baseATK: 15, baseDEF: 12 },
      // Rare
      { id: 'ninja', name: 'Ninja', emoji: '🥷', rarity: 'rare', element: 'shadow', baseHP: 85, baseATK: 35, baseDEF: 12 },
      { id: 'samurai', name: 'Samurai', emoji: '⚔️', rarity: 'rare', element: 'physical', baseHP: 110, baseATK: 30, baseDEF: 18 },
      { id: 'witch', name: 'Bruxa', emoji: '🧙‍♀️', rarity: 'rare', element: 'magic', baseHP: 75, baseATK: 40, baseDEF: 10 },
      { id: 'priest', name: 'Sacerdote', emoji: '✝️', rarity: 'rare', element: 'holy', baseHP: 100, baseATK: 20, baseDEF: 15 },
      // Epic
      { id: 'dragon_knight', name: 'Cavaleiro Dragão', emoji: '🐉', rarity: 'epic', element: 'fire', baseHP: 140, baseATK: 45, baseDEF: 25 },
      { id: 'ice_queen', name: 'Rainha do Gelo', emoji: '❄️', rarity: 'epic', element: 'ice', baseHP: 100, baseATK: 55, baseDEF: 18 },
      { id: 'thunder_god', name: 'Deus Trovão', emoji: '⚡', rarity: 'epic', element: 'lightning', baseHP: 120, baseATK: 50, baseDEF: 20 },
      { id: 'shadow_assassin', name: 'Assassino Sombrio', emoji: '🌑', rarity: 'epic', element: 'shadow', baseHP: 90, baseATK: 65, baseDEF: 12 },
      // Legendary
      { id: 'phoenix', name: 'Fênix', emoji: '🔥', rarity: 'legendary', element: 'fire', baseHP: 180, baseATK: 70, baseDEF: 30 },
      { id: 'angel', name: 'Anjo Celestial', emoji: '👼', rarity: 'legendary', element: 'holy', baseHP: 200, baseATK: 60, baseDEF: 35 },
      { id: 'demon_lord', name: 'Lorde Demônio', emoji: '😈', rarity: 'legendary', element: 'shadow', baseHP: 170, baseATK: 80, baseDEF: 25 },
      { id: 'time_wizard', name: 'Mago do Tempo', emoji: '⏰', rarity: 'legendary', element: 'magic', baseHP: 150, baseATK: 75, baseDEF: 28 },
      // Mythic
      { id: 'god_slayer', name: 'Matador de Deuses', emoji: '⚔️', rarity: 'mythic', element: 'physical', baseHP: 250, baseATK: 100, baseDEF: 40 },
      { id: 'cosmic_dragon', name: 'Dragão Cósmico', emoji: '🌌', rarity: 'mythic', element: 'cosmic', baseHP: 280, baseATK: 90, baseDEF: 45 }
    ];

    this.rarityColors = {
      common: '#aaaaaa',
      rare: '#4a90d9',
      epic: '#9b59b6',
      legendary: '#f1c40f',
      mythic: '#e74c3c'
    };

    this.rarityChances = {
      common: 0.50,
      rare: 0.30,
      epic: 0.15,
      legendary: 0.04,
      mythic: 0.01
    };

    // Player heroes
    this.myHeroes = [];
    this.loadHeroes();
    this.team = [];
    this.loadTeam();

    // Campaign
    this.campaigns = [
      { id: 'forest', name: 'Floresta Sombria', emoji: '🌲', stages: 10, cleared: 0 },
      { id: 'volcano', name: 'Vulcão Infernal', emoji: '🌋', stages: 10, cleared: 0 },
      { id: 'ice', name: 'Reino do Gelo', emoji: '🏔️', stages: 10, cleared: 0 },
      { id: 'sky', name: 'Fortaleza Celeste', emoji: '☁️', stages: 10, cleared: 0 },
      { id: 'abyss', name: 'Abismo Eterno', emoji: '🕳️', stages: 10, cleared: 0 }
    ];
    this.loadCampaigns();
    this.currentCampaign = null;
    this.currentStage = 1;

    // Battle
    this.battleState = null;
    this.enemies = [];
    this.battleTurn = 0;
    this.currentAttacker = 0;
    this.battleLog = [];
    this.battleAnimating = false;

    // Gacha animation
    this.gachaResult = null;
    this.gachaAnimating = false;
    this.gachaTimer = 0;

    // Visual effects
    this.particles = [];
    this.floatingTexts = [];

    // Achievements
    this.achievements = [
      { id: 'first_summon', name: 'Primeiro Invocador', desc: 'Faça sua primeira invocação', icon: '✨', unlocked: false },
      { id: 'hero_10', name: 'Colecionador', desc: 'Colete 10 heróis', icon: '👥', unlocked: false },
      { id: 'legendary', name: 'Sortudo', desc: 'Obtenha um herói lendário', icon: '🌟', unlocked: false },
      { id: 'mythic', name: 'Escolhido', desc: 'Obtenha um herói mítico', icon: '🌌', unlocked: false },
      { id: 'campaign_clear', name: 'Conquistador', desc: 'Complete uma campanha', icon: '🏆', unlocked: false },
      { id: 'level_20', name: 'Veterano', desc: 'Alcance nível 20', icon: '⭐', unlocked: false },
      { id: 'hero_max', name: 'Mestre', desc: 'Maximize um herói', icon: '💪', unlocked: false },
      { id: 'all_elements', name: 'Elementalista', desc: 'Tenha heróis de todos elementos', icon: '🌈', unlocked: false }
    ];
    this.loadAchievements();

    // Stamina regen
    this.regenStamina();
    setInterval(() => this.regenStamina(), 60000);

    this.setupEventListeners();
    this.gameLoop();
  }

  loadHeroes() {
    const saved = JSON.parse(localStorage.getItem('eai_animehero_heroes') || '[]');
    this.myHeroes = saved.map(s => {
      const base = this.allHeroes.find(h => h.id === s.id);
      if (base) {
        return {
          ...base,
          level: s.level || 1,
          stars: s.stars || 1,
          xp: s.xp || 0,
          uid: s.uid
        };
      }
      return null;
    }).filter(h => h !== null);
  }

  saveHeroes() {
    const data = this.myHeroes.map(h => ({
      id: h.id,
      level: h.level,
      stars: h.stars,
      xp: h.xp,
      uid: h.uid
    }));
    localStorage.setItem('eai_animehero_heroes', JSON.stringify(data));
  }

  loadTeam() {
    const saved = JSON.parse(localStorage.getItem('eai_animehero_team') || '[]');
    this.team = saved.map(uid => this.myHeroes.find(h => h.uid === uid)).filter(h => h);
  }

  saveTeam() {
    localStorage.setItem('eai_animehero_team', JSON.stringify(this.team.map(h => h.uid)));
  }

  loadCampaigns() {
    const saved = JSON.parse(localStorage.getItem('eai_animehero_campaigns') || 'null');
    if (saved) {
      saved.forEach(s => {
        const campaign = this.campaigns.find(c => c.id === s.id);
        if (campaign) campaign.cleared = s.cleared;
      });
    }
  }

  saveCampaigns() {
    const data = this.campaigns.map(c => ({ id: c.id, cleared: c.cleared }));
    localStorage.setItem('eai_animehero_campaigns', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = JSON.parse(localStorage.getItem('eai_animehero_achievements') || '[]');
    this.achievements.forEach(a => a.unlocked = saved.includes(a.id));
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_animehero_achievements', JSON.stringify(unlocked));
  }

  checkAchievement(id) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.saveAchievements();
      this.showAchievementPopup(achievement);
      this.addXP(100);
      this.diamonds += 20;
      this.save();
    }
  }

  showAchievementPopup(achievement) {
    this.achievementPopup = { achievement, timer: 180, y: -100 };
  }

  regenStamina() {
    const now = Date.now();
    const elapsed = now - this.lastStaminaRegen;
    const regenAmount = Math.floor(elapsed / 60000);

    if (regenAmount > 0) {
      this.stamina = Math.min(this.maxStamina, this.stamina + regenAmount);
      this.lastStaminaRegen = now;
      localStorage.setItem('eai_animehero_stamina', this.stamina.toString());
      localStorage.setItem('eai_animehero_lastregen', now.toString());
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
        localStorage.setItem('eai_animehero_tutorial_seen', 'true');
      }
      return;
    }

    if (this.gachaAnimating) {
      if (this.gachaTimer > 120) {
        this.gachaAnimating = false;
        this.gachaResult = null;
      }
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    if (this.state === 'menu') this.handleMenuClick(x, y, w, h);
    else if (this.state === 'heroes') this.handleHeroesClick(x, y, w, h);
    else if (this.state === 'summon') this.handleSummonClick(x, y, w, h);
    else if (this.state === 'campaign') this.handleCampaignClick(x, y, w, h);
    else if (this.state === 'stages') this.handleStagesClick(x, y, w, h);
    else if (this.state === 'battle') this.handleBattleClick(x, y, w, h);
    else if (this.state === 'team') this.handleTeamClick(x, y, w, h);
    else if (this.state === 'achievements') {
      if (x < 80 && y < 50) this.state = 'menu';
    }
    else if (this.state === 'victory' || this.state === 'defeat') {
      this.state = 'menu';
    }
  }

  handleMenuClick(x, y, w, h) {
    const btnWidth = 180;
    const btnHeight = 50;
    const centerX = w/2;

    // Summon
    if (x > centerX - btnWidth/2 && x < centerX + btnWidth/2 && y > h/2 - 60 && y < h/2 - 10) {
      this.state = 'summon';
    }
    // Campaign
    if (x > centerX - btnWidth/2 && x < centerX + btnWidth/2 && y > h/2 && y < h/2 + 50) {
      this.state = 'campaign';
    }
    // Heroes
    if (x > centerX - btnWidth/2 && x < centerX + btnWidth/2 && y > h/2 + 60 && y < h/2 + 110) {
      this.state = 'heroes';
    }
    // Team
    if (x > centerX - btnWidth/2 && x < centerX + btnWidth/2 && y > h/2 + 120 && y < h/2 + 170) {
      this.state = 'team';
    }
    // Achievements
    if (x > centerX - btnWidth/2 && x < centerX + btnWidth/2 && y > h/2 + 180 && y < h/2 + 230) {
      this.state = 'achievements';
    }
  }

  handleSummonClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    // Single summon (100 diamonds)
    if (x > w/2 - 180 && x < w/2 - 20 && y > h - 120 && y < h - 60) {
      if (this.diamonds >= 100) {
        this.diamonds -= 100;
        this.summonHero(1);
        this.save();
      }
    }

    // Multi summon (900 diamonds for 10)
    if (x > w/2 + 20 && x < w/2 + 180 && y > h - 120 && y < h - 60) {
      if (this.diamonds >= 900) {
        this.diamonds -= 900;
        this.summonHero(10);
        this.save();
      }
    }
  }

  summonHero(count) {
    this.gachaAnimating = true;
    this.gachaTimer = 0;
    this.gachaResult = [];

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let rarity = 'common';
      let cumulative = 0;

      for (const [r, chance] of Object.entries(this.rarityChances)) {
        cumulative += chance;
        if (rand < cumulative) {
          rarity = r;
          break;
        }
      }

      const heroesOfRarity = this.allHeroes.filter(h => h.rarity === rarity);
      const heroBase = heroesOfRarity[Math.floor(Math.random() * heroesOfRarity.length)];

      const newHero = {
        ...heroBase,
        level: 1,
        stars: 1,
        xp: 0,
        uid: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };

      this.myHeroes.push(newHero);
      this.gachaResult.push(newHero);

      // Check achievements
      if (rarity === 'legendary') this.checkAchievement('legendary');
      if (rarity === 'mythic') this.checkAchievement('mythic');
    }

    this.saveHeroes();
    this.checkAchievement('first_summon');

    if (this.myHeroes.length >= 10) this.checkAchievement('hero_10');

    // Check all elements
    const elements = new Set(this.myHeroes.map(h => h.element));
    if (elements.size >= 7) this.checkAchievement('all_elements');
  }

  handleHeroesClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    // Hero upgrade
    const cols = Math.min(4, Math.floor((w - 40) / 160));
    const itemWidth = (w - 40) / cols;

    this.myHeroes.forEach((hero, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const hx = 20 + col * itemWidth;
      const hy = 130 + row * 140;

      // Upgrade button
      const upgradeCost = hero.level * 100;
      if (y > hy + 90 && y < hy + 120 && x > hx + 10 && x < hx + itemWidth - 20) {
        if (this.coins >= upgradeCost && hero.level < 100) {
          this.coins -= upgradeCost;
          hero.level++;
          this.saveHeroes();
          this.save();

          if (hero.level >= 100) this.checkAchievement('hero_max');
        }
      }
    });
  }

  handleTeamClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    // Team slots
    const slotWidth = 80;
    const teamY = 100;
    const startX = (w - 4 * (slotWidth + 10)) / 2;

    for (let i = 0; i < 4; i++) {
      const sx = startX + i * (slotWidth + 10);
      if (x > sx && x < sx + slotWidth && y > teamY && y < teamY + slotWidth) {
        // Remove from team
        if (this.team[i]) {
          this.team.splice(i, 1);
          this.saveTeam();
        }
      }
    }

    // Available heroes
    const cols = Math.min(5, Math.floor((w - 40) / 100));
    const itemWidth = (w - 40) / cols;
    const heroesY = 220;

    this.myHeroes.forEach((hero, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const hx = 20 + col * itemWidth;
      const hy = heroesY + row * 90;

      if (x > hx && x < hx + itemWidth - 10 && y > hy && y < hy + 80) {
        if (this.team.length < 4 && !this.team.includes(hero)) {
          this.team.push(hero);
          this.saveTeam();
        }
      }
    });
  }

  handleCampaignClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    const cols = Math.min(3, Math.floor((w - 40) / 200));
    const itemWidth = (w - 40) / cols;

    this.campaigns.forEach((campaign, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = 20 + col * itemWidth;
      const cy = 130 + row * 130;

      const prevCampaign = i > 0 ? this.campaigns[i - 1] : null;
      const isAccessible = i === 0 || (prevCampaign && prevCampaign.cleared >= 5);

      if (isAccessible && x > cx && x < cx + itemWidth - 10 && y > cy && y < cy + 110) {
        this.currentCampaign = campaign;
        this.state = 'stages';
      }
    });
  }

  handleStagesClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'campaign';
      return;
    }

    const cols = 5;
    const itemSize = 60;
    const startX = (w - cols * (itemSize + 10)) / 2;
    const startY = 150;

    for (let i = 0; i < this.currentCampaign.stages; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = startX + col * (itemSize + 10);
      const sy = startY + row * (itemSize + 20);

      const isUnlocked = i <= this.currentCampaign.cleared;

      if (isUnlocked && x > sx && x < sx + itemSize && y > sy && y < sy + itemSize) {
        if (this.stamina >= 10 && this.team.length > 0) {
          this.stamina -= 10;
          localStorage.setItem('eai_animehero_stamina', this.stamina.toString());
          this.currentStage = i + 1;
          this.startBattle();
        }
      }
    }
  }

  handleBattleClick(x, y, w, h) {
    if (this.battleAnimating) return;

    // Auto battle - just tap to continue
    if (this.battleState === 'player_turn') {
      this.executePlayerTurn();
    }
  }

  startBattle() {
    this.state = 'battle';
    this.battleState = 'player_turn';
    this.battleTurn = 1;
    this.currentAttacker = 0;
    this.battleLog = ['Batalha iniciada!'];

    // Setup team HP
    this.team.forEach(hero => {
      hero.currentHP = this.getHeroMaxHP(hero);
    });

    // Create enemies
    const basePower = this.currentStage * 20 + (this.campaigns.indexOf(this.currentCampaign) * 100);
    const enemyCount = Math.min(4, 1 + Math.floor(this.currentStage / 3));
    this.enemies = [];

    for (let i = 0; i < enemyCount; i++) {
      const isBoss = this.currentStage % 5 === 0 && i === 0;
      this.enemies.push({
        name: isBoss ? 'Boss' : `Inimigo ${i + 1}`,
        emoji: isBoss ? '👹' : ['👺', '💀', '🧟', '👻', '🦹'][Math.floor(Math.random() * 5)],
        maxHP: basePower * (isBoss ? 3 : 1),
        currentHP: basePower * (isBoss ? 3 : 1),
        atk: Math.floor(basePower * 0.3 * (isBoss ? 1.5 : 1)),
        def: Math.floor(basePower * 0.1)
      });
    }
  }

  getHeroMaxHP(hero) {
    return Math.floor(hero.baseHP * (1 + hero.level * 0.1) * (1 + hero.stars * 0.2));
  }

  getHeroATK(hero) {
    return Math.floor(hero.baseATK * (1 + hero.level * 0.1) * (1 + hero.stars * 0.2));
  }

  getHeroDEF(hero) {
    return Math.floor(hero.baseDEF * (1 + hero.level * 0.1) * (1 + hero.stars * 0.2));
  }

  executePlayerTurn() {
    this.battleAnimating = true;

    const aliveTeam = this.team.filter(h => h.currentHP > 0);
    if (aliveTeam.length === 0) {
      this.defeat();
      return;
    }

    // Each alive hero attacks
    let delay = 0;
    aliveTeam.forEach((hero, index) => {
      setTimeout(() => {
        const aliveEnemies = this.enemies.filter(e => e.currentHP > 0);
        if (aliveEnemies.length === 0) return;

        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const damage = Math.max(1, this.getHeroATK(hero) - target.def);
        target.currentHP -= damage;

        this.battleLog.push(`${hero.emoji} ${hero.name} → ${damage} dano!`);
        this.addFloatingText(`-${damage}`, canvas.width * 0.7, canvas.height * 0.3 + Math.random() * 50, '#ff4444');
        this.addBattleEffect(canvas.width * 0.7, canvas.height * 0.3);
      }, delay);
      delay += 300;
    });

    setTimeout(() => {
      // Check if all enemies are defeated
      if (this.enemies.every(e => e.currentHP <= 0)) {
        this.victory();
      } else {
        this.battleState = 'enemy_turn';
        setTimeout(() => this.executeEnemyTurn(), 500);
      }
      this.battleAnimating = false;
    }, delay + 300);
  }

  executeEnemyTurn() {
    this.battleAnimating = true;

    const aliveEnemies = this.enemies.filter(e => e.currentHP > 0);
    const aliveTeam = this.team.filter(h => h.currentHP > 0);

    if (aliveTeam.length === 0) {
      this.defeat();
      return;
    }

    let delay = 0;
    aliveEnemies.forEach((enemy, index) => {
      setTimeout(() => {
        const aliveHeroes = this.team.filter(h => h.currentHP > 0);
        if (aliveHeroes.length === 0) return;

        const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        const damage = Math.max(1, enemy.atk - this.getHeroDEF(target));
        target.currentHP -= damage;

        this.battleLog.push(`${enemy.emoji} ${enemy.name} → ${damage} dano!`);
        this.addFloatingText(`-${damage}`, canvas.width * 0.3, canvas.height * 0.3 + Math.random() * 50, '#ff4444');
      }, delay);
      delay += 300;
    });

    setTimeout(() => {
      // Check if all heroes are defeated
      if (this.team.every(h => h.currentHP <= 0)) {
        this.defeat();
      } else {
        this.battleState = 'player_turn';
        this.battleTurn++;
      }
      this.battleAnimating = false;
    }, delay + 300);
  }

  addBattleEffect(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 8 + 4,
        color: '#ff6b6b',
        life: 30
      });
    }
  }

  addFloatingText(text, x, y, color) {
    this.floatingTexts.push({ text, x, y, color, life: 60, vy: -2 });
  }

  victory() {
    this.state = 'victory';

    const coinsReward = 50 + this.currentStage * 20;
    const xpReward = 30 + this.currentStage * 10;
    const diamondReward = this.currentStage % 5 === 0 ? 10 : 0;

    this.coins += coinsReward;
    this.diamonds += diamondReward;
    this.addXP(xpReward);

    if (this.currentStage > this.currentCampaign.cleared) {
      this.currentCampaign.cleared = this.currentStage;
      this.saveCampaigns();

      if (this.currentCampaign.cleared >= 10) {
        this.checkAchievement('campaign_clear');
      }
    }

    this.save();
    this.victoryRewards = { coins: coinsReward, xp: xpReward, diamonds: diamondReward };
  }

  defeat() {
    this.state = 'defeat';
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 200;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 10;

      if (this.level >= 20) this.checkAchievement('level_20');
    }
  }

  save() {
    localStorage.setItem('eai_animehero_coins', this.coins.toString());
    localStorage.setItem('eai_animehero_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_animehero_xp', this.xp.toString());
    localStorage.setItem('eai_animehero_level', this.level.toString());
  }

  update() {
    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    // Floating texts
    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y += t.vy;
      t.life--;
      return t.life > 0;
    });

    // Gacha animation
    if (this.gachaAnimating) {
      this.gachaTimer++;
    }

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
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(0.5, '#0a0a1a');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    if (this.gachaAnimating) {
      this.drawGacha();
      return;
    }

    if (this.state === 'menu') this.drawMenu();
    else if (this.state === 'summon') this.drawSummon();
    else if (this.state === 'heroes') this.drawHeroes();
    else if (this.state === 'team') this.drawTeam();
    else if (this.state === 'campaign') this.drawCampaign();
    else if (this.state === 'stages') this.drawStages();
    else if (this.state === 'battle') this.drawBattle();
    else if (this.state === 'achievements') this.drawAchievements();
    else if (this.state === 'victory') this.drawVictory();
    else if (this.state === 'defeat') this.drawDefeat();

    // Particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / 30;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Floating texts
    this.floatingTexts.forEach(t => {
      ctx.globalAlpha = t.life / 60;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 20px Arial';
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

    ctx.fillStyle = '#0a0a1a';
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(w/2 - 160, h/2 - 140, 320, 280, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 60);

    ctx.fillStyle = '#ff6b6b';
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
      ctx.fillStyle = i === this.tutorialPage ? '#ff6b6b' : '#666';
      ctx.fill();
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Toque para continuar', w/2, h/2 + 140);
  }

  drawMenu() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('⚔️ ANIME HERO ARENA ⚔️', w/2, 60);

    // Stats
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${this.coins}`, 20, 30);
    ctx.fillText(`💎 ${this.diamonds}`, 120, 30);
    ctx.fillText(`⭐ Nv.${this.level}`, 220, 30);
    ctx.fillText(`⚡ ${this.stamina}/${this.maxStamina}`, 310, 30);

    // Team preview
    if (this.team.length > 0) {
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Time Atual:', w/2, 90);

      ctx.font = '30px Arial';
      this.team.forEach((hero, i) => {
        ctx.fillText(hero.emoji, w/2 - 60 + i * 40, 120);
      });
    }

    // Buttons
    const buttons = [
      { text: '✨ Invocação', y: h/2 - 60 },
      { text: '🗺️ Campanha', y: h/2 },
      { text: '👥 Heróis', y: h/2 + 60 },
      { text: '⚔️ Time', y: h/2 + 120 },
      { text: '🏆 Conquistas', y: h/2 + 180 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#1a1a3e';
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w/2 - 90, btn.y - 20, 180, 45, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(btn.text, w/2, btn.y + 8);
    });
  }

  drawSummon() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('✨ INVOCAÇÃO ✨', w/2, 70);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`💎 ${this.diamonds}`, w/2, 100);

    // Rates
    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Chances:', w/2, 140);

    const rates = [
      { name: 'Comum', color: this.rarityColors.common, rate: '50%' },
      { name: 'Raro', color: this.rarityColors.rare, rate: '30%' },
      { name: 'Épico', color: this.rarityColors.epic, rate: '15%' },
      { name: 'Lendário', color: this.rarityColors.legendary, rate: '4%' },
      { name: 'Mítico', color: this.rarityColors.mythic, rate: '1%' }
    ];

    rates.forEach((r, i) => {
      ctx.fillStyle = r.color;
      ctx.fillText(`${r.name}: ${r.rate}`, w/2 - 150 + i * 75, 165);
    });

    // Summon buttons
    ctx.fillStyle = this.diamonds >= 100 ? '#4a4' : '#444';
    ctx.beginPath();
    ctx.roundRect(w/2 - 180, h - 120, 160, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('💎100 - 1x Invocação', w/2 - 100, h - 88);

    ctx.fillStyle = this.diamonds >= 900 ? '#a4a' : '#444';
    ctx.beginPath();
    ctx.roundRect(w/2 + 20, h - 120, 160, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('💎900 - 10x Invocação', w/2 + 100, h - 88);

    // Floating crystals animation
    const time = Date.now() / 1000;
    for (let i = 0; i < 5; i++) {
      const x = w * 0.2 + i * w * 0.15;
      const y = h * 0.5 + Math.sin(time + i) * 30;
      ctx.font = '40px Arial';
      ctx.fillText('💎', x, y);
    }
  }

  drawGacha() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, w, h);

    if (this.gachaTimer < 60) {
      // Opening animation
      ctx.font = '80px Arial';
      ctx.textAlign = 'center';
      const scale = 1 + Math.sin(this.gachaTimer * 0.2) * 0.3;
      ctx.save();
      ctx.translate(w/2, h/2);
      ctx.scale(scale, scale);
      ctx.fillText('✨', 0, 0);
      ctx.restore();
    } else {
      // Show results
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('Heróis Obtidos!', w/2, 80);

      const cols = Math.min(5, this.gachaResult.length);
      const itemWidth = Math.min(120, (w - 40) / cols);
      const startX = (w - cols * itemWidth) / 2;

      this.gachaResult.forEach((hero, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * itemWidth + itemWidth/2;
        const y = 150 + row * 130;

        // Glow effect
        ctx.shadowColor = this.rarityColors[hero.rarity];
        ctx.shadowBlur = 20;

        ctx.fillStyle = this.rarityColors[hero.rarity];
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        ctx.font = '50px Arial';
        ctx.fillText(hero.emoji, x, y + 15);

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = this.rarityColors[hero.rarity];
        ctx.fillText(hero.name, x, y + 50);
      });

      ctx.fillStyle = '#aaa';
      ctx.font = '14px Arial';
      ctx.fillText('Toque para continuar', w/2, h - 50);
    }
  }

  drawHeroes() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('👥 MEUS HERÓIS 👥', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`🪙 ${this.coins} | ${this.myHeroes.length} heróis`, w/2, 100);

    if (this.myHeroes.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '18px Arial';
      ctx.fillText('Nenhum herói ainda. Faça uma invocação!', w/2, h/2);
      return;
    }

    const cols = Math.min(4, Math.floor((w - 40) / 160));
    const itemWidth = (w - 40) / cols;

    this.myHeroes.forEach((hero, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 140;

      if (y > h - 50) return;

      // Card
      ctx.fillStyle = '#1a1a3e';
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 130, 10);
      ctx.fill();
      ctx.strokeStyle = this.rarityColors[hero.rarity];
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hero.emoji, x + itemWidth/2 - 5, y + 40);

      // Name & stats
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = this.rarityColors[hero.rarity];
      ctx.fillText(hero.name, x + itemWidth/2 - 5, y + 60);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Nv.${hero.level} ⭐${hero.stars}`, x + itemWidth/2 - 5, y + 78);

      // Upgrade button
      if (hero.level < 100) {
        const upgradeCost = hero.level * 100;
        ctx.fillStyle = this.coins >= upgradeCost ? '#4a4' : '#333';
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 90, itemWidth - 30, 30, 5);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`⬆️ 🪙${upgradeCost}`, x + itemWidth/2 - 5, y + 110);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('MÁXIMO', x + itemWidth/2 - 5, y + 110);
      }
    });
  }

  drawTeam() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('⚔️ MONTAR TIME ⚔️', w/2, 70);

    // Team slots
    const slotWidth = 80;
    const teamY = 100;
    const startX = (w - 4 * (slotWidth + 10)) / 2;

    for (let i = 0; i < 4; i++) {
      const x = startX + i * (slotWidth + 10);

      ctx.fillStyle = '#1a1a3e';
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, teamY, slotWidth, slotWidth, 10);
      ctx.fill();
      ctx.stroke();

      if (this.team[i]) {
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.team[i].emoji, x + slotWidth/2, teamY + 50);
        ctx.font = '10px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Nv.${this.team[i].level}`, x + slotWidth/2, teamY + 70);
      } else {
        ctx.fillStyle = '#444';
        ctx.font = '30px Arial';
        ctx.fillText('+', x + slotWidth/2, teamY + 50);
      }
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    ctx.fillText('Toque no slot para remover, toque no herói para adicionar', w/2, teamY + slotWidth + 20);

    // Available heroes
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Heróis Disponíveis:', w/2, 210);

    const cols = Math.min(5, Math.floor((w - 40) / 100));
    const itemWidth = (w - 40) / cols;
    const heroesY = 230;

    this.myHeroes.forEach((hero, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = heroesY + row * 90;

      if (y > h - 50) return;

      const inTeam = this.team.includes(hero);

      ctx.fillStyle = inTeam ? '#2a4a2a' : '#1a1a3e';
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 80, 8);
      ctx.fill();

      if (inTeam) {
        ctx.strokeStyle = '#4a4';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.font = '35px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = inTeam ? 0.5 : 1;
      ctx.fillText(hero.emoji, x + itemWidth/2 - 5, y + 40);
      ctx.globalAlpha = 1;

      ctx.font = '10px Arial';
      ctx.fillStyle = this.rarityColors[hero.rarity];
      ctx.fillText(`${hero.name} Nv.${hero.level}`, x + itemWidth/2 - 5, y + 65);
    });
  }

  drawCampaign() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('🗺️ CAMPANHA 🗺️', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#87ceeb';
    ctx.fillText(`⚡ Stamina: ${this.stamina}/${this.maxStamina} (10 por batalha)`, w/2, 100);

    const cols = Math.min(3, Math.floor((w - 40) / 200));
    const itemWidth = (w - 40) / cols;

    this.campaigns.forEach((campaign, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 130;

      if (y > h - 50) return;

      const prevCampaign = i > 0 ? this.campaigns[i - 1] : null;
      const isAccessible = i === 0 || (prevCampaign && prevCampaign.cleared >= 5);

      ctx.fillStyle = isAccessible ? '#1a1a3e' : '#111';
      ctx.globalAlpha = isAccessible ? 1 : 0.5;
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 110, 10);
      ctx.fill();

      ctx.strokeStyle = isAccessible ? '#ff6b6b' : '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(campaign.emoji, x + itemWidth/2 - 5, y + 45);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(campaign.name, x + itemWidth/2 - 5, y + 70);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`${campaign.cleared}/${campaign.stages}`, x + itemWidth/2 - 5, y + 90);

      if (!isAccessible) {
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.fillText('🔒', x + itemWidth/2 - 5, y + 100);
      }
      ctx.globalAlpha = 1;
    });
  }

  drawStages() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(`${this.currentCampaign.emoji} ${this.currentCampaign.name}`, w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#87ceeb';
    ctx.fillText(`⚡ ${this.stamina} | Time: ${this.team.length}/4`, w/2, 100);

    if (this.team.length === 0) {
      ctx.fillStyle = '#ff6666';
      ctx.fillText('Monte um time primeiro!', w/2, 130);
    }

    const cols = 5;
    const itemSize = 60;
    const startX = (w - cols * (itemSize + 10)) / 2;
    const startY = 150;

    for (let i = 0; i < this.currentCampaign.stages; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (itemSize + 10);
      const y = startY + row * (itemSize + 20);

      const isCleared = i < this.currentCampaign.cleared;
      const isUnlocked = i <= this.currentCampaign.cleared;
      const isBoss = (i + 1) % 5 === 0;

      ctx.fillStyle = isCleared ? '#2a4a2a' : (isUnlocked ? '#1a1a3e' : '#111');
      ctx.beginPath();
      ctx.roundRect(x, y, itemSize, itemSize, 10);
      ctx.fill();

      ctx.strokeStyle = isBoss ? '#ffd700' : (isCleared ? '#4a4' : (isUnlocked ? '#ff6b6b' : '#333'));
      ctx.lineWidth = isBoss ? 3 : 2;
      ctx.stroke();

      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = isUnlocked ? '#fff' : '#666';
      ctx.fillText(isBoss ? '👹' : (i + 1).toString(), x + itemSize/2, y + itemSize/2 + 8);

      if (isCleared) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px Arial';
        ctx.fillText('⭐', x + itemSize/2, y + itemSize - 5);
      }
    }
  }

  drawBattle() {
    const w = canvas.width;
    const h = canvas.height;

    // Team side
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4a4';
    ctx.fillText('Seu Time', w * 0.25, 50);

    const teamStartY = 80;
    this.team.forEach((hero, i) => {
      const y = teamStartY + i * 70;
      const isAlive = hero.currentHP > 0;

      ctx.globalAlpha = isAlive ? 1 : 0.3;

      ctx.font = '35px Arial';
      ctx.fillText(hero.emoji, w * 0.25, y + 30);

      // HP bar
      ctx.fillStyle = '#333';
      ctx.fillRect(w * 0.25 - 40, y + 40, 80, 12);
      ctx.fillStyle = hero.currentHP > this.getHeroMaxHP(hero) * 0.3 ? '#4a4' : '#a44';
      ctx.fillRect(w * 0.25 - 40, y + 40, 80 * (Math.max(0, hero.currentHP) / this.getHeroMaxHP(hero)), 12);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${Math.max(0, hero.currentHP)}/${this.getHeroMaxHP(hero)}`, w * 0.25, y + 65);
      ctx.globalAlpha = 1;
    });

    // Enemy side
    ctx.fillStyle = '#a44';
    ctx.font = '14px Arial';
    ctx.fillText('Inimigos', w * 0.75, 50);

    this.enemies.forEach((enemy, i) => {
      const y = teamStartY + i * 70;
      const isAlive = enemy.currentHP > 0;

      ctx.globalAlpha = isAlive ? 1 : 0.3;

      ctx.font = '35px Arial';
      ctx.fillText(enemy.emoji, w * 0.75, y + 30);

      // HP bar
      ctx.fillStyle = '#333';
      ctx.fillRect(w * 0.75 - 40, y + 40, 80, 12);
      ctx.fillStyle = '#a44';
      ctx.fillRect(w * 0.75 - 40, y + 40, 80 * (Math.max(0, enemy.currentHP) / enemy.maxHP), 12);

      ctx.font = '10px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${Math.max(0, enemy.currentHP)}/${enemy.maxHP}`, w * 0.75, y + 65);
      ctx.globalAlpha = 1;
    });

    // Battle log
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, h - 150, w - 20, 80);
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    const logs = this.battleLog.slice(-3);
    logs.forEach((log, i) => {
      ctx.fillText(log, 20, h - 130 + i * 25);
    });

    // Turn indicator
    ctx.fillStyle = this.battleState === 'player_turn' ? '#4a4' : '#a44';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.battleState === 'player_turn' ? '⚔️ Toque para atacar!' : '🛡️ Turno inimigo...',
      w/2, h - 30
    );
  }

  drawVictory() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(0, 50, 0, 0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🎉 VITÓRIA! 🎉', w/2, h/3);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Recompensas:', w/2, h/2 - 30);

    ctx.font = '16px Arial';
    ctx.fillText(`🪙 +${this.victoryRewards.coins}`, w/2, h/2 + 10);
    ctx.fillText(`⭐ +${this.victoryRewards.xp} XP`, w/2, h/2 + 40);
    if (this.victoryRewards.diamonds > 0) {
      ctx.fillText(`💎 +${this.victoryRewards.diamonds}`, w/2, h/2 + 70);
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

    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444';
    ctx.fillText('💀 DERROTA 💀', w/2, h/3);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Seu time foi derrotado...', w/2, h/2);
    ctx.fillText('Fortaleça seus heróis e tente novamente!', w/2, h/2 + 30);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Toque para continuar', w/2, h - 60);
  }

  drawAchievements() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff6b6b';
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

      ctx.fillStyle = a.unlocked ? '#1a1a3e' : '#111';
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

const game = new AnimeHeroArena();
