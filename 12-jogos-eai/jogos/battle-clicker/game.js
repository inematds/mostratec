// Battle Clicker Wars - EAI Games
// Jogo idle RPG clicker com batalhas épicas

class BattleClickerGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Recursos principais
    this.gold = parseInt(localStorage.getItem('eai_battleclicker_gold') || '0');
    this.gems = parseInt(localStorage.getItem('eai_battleclicker_gems') || '0');
    this.xp = parseInt(localStorage.getItem('eai_battleclicker_xp') || '0');
    this.playerLevel = parseInt(localStorage.getItem('eai_battleclicker_level') || '1');
    this.xpToNextLevel = this.playerLevel * 100;

    // Estatísticas de batalha
    this.damage = parseInt(localStorage.getItem('eai_battleclicker_damage') || '1');
    this.dps = parseInt(localStorage.getItem('eai_battleclicker_dps') || '0'); // Damage per second (auto)
    this.critChance = parseFloat(localStorage.getItem('eai_battleclicker_crit') || '0.05');
    this.critMultiplier = 2;
    this.goldBonus = 1;

    // Estado do jogo
    this.state = 'menu'; // menu, battle, shop, heroes, skills, achievements
    this.currentZone = parseInt(localStorage.getItem('eai_battleclicker_zone') || '1');
    this.currentStage = parseInt(localStorage.getItem('eai_battleclicker_stage') || '1');
    this.maxZone = parseInt(localStorage.getItem('eai_battleclicker_maxzone') || '1');
    this.bossesDefeated = parseInt(localStorage.getItem('eai_battleclicker_bosses') || '0');

    // Inimigo atual
    this.enemy = null;
    this.enemyMaxHp = 0;
    this.isBoss = false;

    // Animações e efeitos
    this.damageNumbers = [];
    this.particles = [];
    this.clickEffects = [];
    this.shakeTimer = 0;

    // Heróis (DPS automático)
    this.heroes = [
      { id: 'warrior', name: 'Guerreiro', emoji: '⚔️', dps: 1, cost: 50, level: 0, unlocked: true },
      { id: 'archer', name: 'Arqueira', emoji: '🏹', dps: 3, cost: 200, level: 0, unlocked: true },
      { id: 'mage', name: 'Mago', emoji: '🧙', dps: 8, cost: 500, level: 0, unlocked: false, reqZone: 3 },
      { id: 'knight', name: 'Cavaleiro', emoji: '🛡️', dps: 20, cost: 1500, level: 0, unlocked: false, reqZone: 5 },
      { id: 'ninja', name: 'Ninja', emoji: '🥷', dps: 50, cost: 5000, level: 0, unlocked: false, reqZone: 8 },
      { id: 'dragon', name: 'Dragão', emoji: '🐉', dps: 150, cost: 20000, level: 0, unlocked: false, reqZone: 12 },
      { id: 'angel', name: 'Anjo', emoji: '👼', dps: 500, cost: 100000, level: 0, unlocked: false, reqZone: 15 },
      { id: 'demon', name: 'Demônio', emoji: '😈', dps: 2000, cost: 500000, level: 0, unlocked: false, reqZone: 20 }
    ];
    this.loadHeroes();

    // Upgrades de clique
    this.clickUpgrades = [
      { id: 'damage', name: 'Dano de Clique', desc: '+1 dano por clique', baseCost: 10, level: 0, effect: 1 },
      { id: 'crit', name: 'Chance Crítico', desc: '+1% chance crítico', baseCost: 100, level: 0, maxLevel: 45, effect: 0.01 },
      { id: 'critDmg', name: 'Dano Crítico', desc: '+0.5x multiplicador', baseCost: 500, level: 0, maxLevel: 10, effect: 0.5 },
      { id: 'goldBonus', name: 'Bônus de Ouro', desc: '+10% ouro ganho', baseCost: 200, level: 0, maxLevel: 20, effect: 0.1 }
    ];
    this.loadUpgrades();

    // Habilidades especiais
    this.skills = [
      { id: 'rage', name: 'Fúria', desc: '2x dano por 30s', emoji: '🔥', cooldown: 120, duration: 30, active: false, timer: 0, unlocked: true },
      { id: 'gold_rush', name: 'Corrida do Ouro', desc: '3x ouro por 30s', emoji: '💰', cooldown: 180, duration: 30, active: false, timer: 0, unlocked: false, reqZone: 5 },
      { id: 'mega_crit', name: 'Mega Crítico', desc: '100% crítico por 15s', emoji: '⚡', cooldown: 240, duration: 15, active: false, timer: 0, unlocked: false, reqZone: 10 },
      { id: 'time_warp', name: 'Distorção', desc: 'DPS 10x por 10s', emoji: '⏰', cooldown: 300, duration: 10, active: false, timer: 0, unlocked: false, reqZone: 15 }
    ];
    this.loadSkills();

    // Conquistas
    this.achievements = [
      { id: 'first_kill', name: 'Primeira Morte', desc: 'Derrote seu primeiro inimigo', icon: '💀', unlocked: false },
      { id: 'zone_5', name: 'Aventureiro', desc: 'Alcance a zona 5', icon: '🗺️', unlocked: false },
      { id: 'zone_10', name: 'Explorador', desc: 'Alcance a zona 10', icon: '⛰️', unlocked: false },
      { id: 'boss_10', name: 'Caça-Chefes', desc: 'Derrote 10 chefes', icon: '👑', unlocked: false },
      { id: 'gold_1m', name: 'Milionário', desc: 'Acumule 1M de ouro', icon: '💰', unlocked: false },
      { id: 'heroes_5', name: 'Comandante', desc: 'Contrate 5 heróis', icon: '🎖️', unlocked: false },
      { id: 'level_50', name: 'Veterano', desc: 'Alcance nível 50', icon: '⭐', unlocked: false },
      { id: 'dps_1000', name: 'DPS Master', desc: 'Alcance 1000 DPS', icon: '⚔️', unlocked: false }
    ];
    this.loadAchievements();

    // Estatísticas
    this.totalClicks = parseInt(localStorage.getItem('eai_battleclicker_clicks') || '0');
    this.totalGoldEarned = parseInt(localStorage.getItem('eai_battleclicker_totalgold') || '0');
    this.totalKills = parseInt(localStorage.getItem('eai_battleclicker_kills') || '0');

    // Notificações
    this.notifications = [];

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_battleclicker_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Batalha!', lines: ['Clique no inimigo para atacar!', 'Cada clique causa dano!', 'Derrote inimigos para ganhar ouro!'], emoji: '⚔️' },
      { title: 'Heróis', lines: ['Contrate heróis para dano automático!', 'Eles atacam mesmo sem clicar!', 'Melhore-os para mais DPS!'], emoji: '🦸' },
      { title: 'Upgrades', lines: ['Aumente seu dano de clique!', 'Melhore chance de crítico!', 'Ganhe mais ouro por inimigo!'], emoji: '⬆️' },
      { title: 'Chefes', lines: ['A cada 10 inimigos, um chefe aparece!', 'Chefes são mais fortes mas dão mais recompensas!', 'Derrote-os para avançar de zona!'], emoji: '👹' }
    ];

    // Controles
    this.canvas.addEventListener('click', (e) => this.handleClick(e.clientX, e.clientY));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleClick(touch.clientX, touch.clientY);
    });

    // Game loop
    this.lastTime = 0;
    this.autoSaveTimer = 0;
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  generateEnemy() {
    const zones = [
      { name: 'Floresta', enemies: ['🐺', '🦊', '🐗', '🦌'], boss: '🐻', color: '#228B22' },
      { name: 'Caverna', enemies: ['🦇', '🕷️', '🐍', '🦎'], boss: '🐲', color: '#4A4A4A' },
      { name: 'Deserto', enemies: ['🦂', '🐪', '🏜️', '🦅'], boss: '🐊', color: '#C19A6B' },
      { name: 'Neve', enemies: ['🐧', '🦭', '❄️', '🐺'], boss: '🐻‍❄️', color: '#87CEEB' },
      { name: 'Vulcão', enemies: ['🔥', '🐉', '👹', '😈'], boss: '🌋', color: '#8B0000' }
    ];

    const zoneIndex = (this.currentZone - 1) % zones.length;
    const zone = zones[zoneIndex];

    this.isBoss = this.currentStage % 10 === 0;

    const baseHp = 10 * Math.pow(1.5, this.currentZone - 1) * Math.pow(1.1, this.currentStage - 1);
    const hp = this.isBoss ? baseHp * 10 : baseHp;

    this.enemy = {
      emoji: this.isBoss ? zone.boss : zone.enemies[Math.floor(Math.random() * zone.enemies.length)],
      name: this.isBoss ? `Chefe ${zone.name}` : `Inimigo ${zone.name}`,
      hp: Math.floor(hp),
      maxHp: Math.floor(hp),
      goldReward: Math.floor((this.isBoss ? 50 : 10) * Math.pow(1.3, this.currentZone - 1) * this.goldBonus),
      xpReward: this.isBoss ? 50 : 10,
      shake: 0
    };

    this.enemyMaxHp = this.enemy.maxHp;
  }

  attackEnemy(damage, isCrit = false) {
    if (!this.enemy || this.enemy.hp <= 0) return;

    // Aplicar dano
    this.enemy.hp -= damage;
    this.enemy.shake = 10;
    this.shakeTimer = 5;

    // Número de dano
    this.damageNumbers.push({
      value: damage,
      x: this.canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: this.canvas.height / 2 - 50,
      vy: -3,
      alpha: 1,
      isCrit
    });

    // Partículas de hit
    for (let i = 0; i < (isCrit ? 15 : 5); i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 5 + 3,
        color: isCrit ? '#FFD700' : '#FF6B6B',
        life: 1
      });
    }

    // Verificar morte
    if (this.enemy.hp <= 0) {
      this.defeatEnemy();
    }
  }

  defeatEnemy() {
    // Recompensas
    const goldMulti = this.isSkillActive('gold_rush') ? 3 : 1;
    const goldGained = Math.floor(this.enemy.goldReward * goldMulti);

    this.gold += goldGained;
    this.totalGoldEarned += goldGained;
    this.xp += this.enemy.xpReward;
    this.totalKills++;

    // Check level up
    this.checkLevelUp();

    if (this.isBoss) {
      this.bossesDefeated++;
      this.gems += Math.floor(this.currentZone / 2) + 1;
      this.addNotification(`👑 Chefe derrotado! +${goldGained}g +💎`, this.canvas.width / 2, this.canvas.height / 2);

      // Avançar zona
      this.currentZone++;
      this.currentStage = 1;

      if (this.currentZone > this.maxZone) {
        this.maxZone = this.currentZone;
      }

      // Desbloquear heróis e skills
      this.unlockContent();
    } else {
      this.currentStage++;
      this.addNotification(`+${goldGained}g`, this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    // Explosão de partículas
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        size: Math.random() * 8 + 4,
        color: this.isBoss ? '#FFD700' : '#4CAF50',
        life: 1
      });
    }

    this.checkAchievements();
    this.generateEnemy();
  }

  click(x, y) {
    if (this.state !== 'battle') return;

    this.totalClicks++;

    // Efeito de clique
    this.clickEffects.push({
      x, y,
      size: 20,
      alpha: 1
    });

    // Calcular dano
    let damage = this.damage;
    const rageMulti = this.isSkillActive('rage') ? 2 : 1;
    damage *= rageMulti;

    // Crítico
    const critChance = this.isSkillActive('mega_crit') ? 1 : this.critChance;
    const isCrit = Math.random() < critChance;
    if (isCrit) {
      damage *= this.critMultiplier;
    }

    this.attackEnemy(Math.floor(damage), isCrit);
  }

  isSkillActive(skillId) {
    const skill = this.skills.find(s => s.id === skillId);
    return skill && skill.active;
  }

  activateSkill(skill) {
    if (skill.timer > 0 || !skill.unlocked) return;

    skill.active = true;
    skill.timer = skill.cooldown;

    this.addNotification(`${skill.emoji} ${skill.name} ativado!`, this.canvas.width / 2, 150);

    // Efeito visual
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height - 100,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 10 - 5,
        size: Math.random() * 8 + 4,
        color: '#FFD700',
        life: 1
      });
    }
  }

  buyHero(hero) {
    const cost = this.getHeroCost(hero);
    if (this.gold >= cost && hero.unlocked) {
      this.gold -= cost;
      hero.level++;
      this.calculateDPS();
      this.save();
    }
  }

  getHeroCost(hero) {
    return Math.floor(hero.cost * Math.pow(1.15, hero.level));
  }

  getHeroDPS(hero) {
    if (hero.level === 0) return 0;
    return hero.dps * hero.level;
  }

  calculateDPS() {
    let total = 0;
    for (const hero of this.heroes) {
      total += this.getHeroDPS(hero);
    }
    this.dps = total;
  }

  buyUpgrade(upgrade) {
    const cost = this.getUpgradeCost(upgrade);
    if (this.gold >= cost) {
      if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return;

      this.gold -= cost;
      upgrade.level++;

      // Aplicar efeito
      if (upgrade.id === 'damage') {
        this.damage += upgrade.effect;
      } else if (upgrade.id === 'crit') {
        this.critChance += upgrade.effect;
      } else if (upgrade.id === 'critDmg') {
        this.critMultiplier += upgrade.effect;
      } else if (upgrade.id === 'goldBonus') {
        this.goldBonus += upgrade.effect;
      }

      this.save();
    }
  }

  getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(1.2, upgrade.level));
  }

  unlockContent() {
    // Desbloquear heróis
    this.heroes.forEach(hero => {
      if (!hero.unlocked && hero.reqZone && this.currentZone >= hero.reqZone) {
        hero.unlocked = true;
        this.addNotification(`🎉 Novo herói: ${hero.name}!`, this.canvas.width / 2, 200);
      }
    });

    // Desbloquear habilidades
    this.skills.forEach(skill => {
      if (!skill.unlocked && skill.reqZone && this.currentZone >= skill.reqZone) {
        skill.unlocked = true;
        this.addNotification(`🎉 Nova habilidade: ${skill.name}!`, this.canvas.width / 2, 250);
      }
    });
  }

  checkLevelUp() {
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.playerLevel++;
      this.xpToNextLevel = this.playerLevel * 100;

      // Bônus de level up
      this.damage++;
      this.gems++;

      this.addNotification(`🎉 Nível ${this.playerLevel}!`, this.canvas.width / 2, 100);
    }
  }

  addNotification(text, x, y) {
    this.notifications.push({ text, x, y, alpha: 1, vy: -1 });
  }

  startBattle() {
    this.state = 'battle';
    if (!this.enemy) {
      this.generateEnemy();
    }
  }

  update(deltaTime) {
    // Atualizar skills
    this.skills.forEach(skill => {
      if (skill.timer > 0) {
        skill.timer -= deltaTime / 1000;
        if (skill.timer <= 0) {
          skill.timer = 0;
          skill.active = false;
        } else if (skill.active && skill.timer <= skill.cooldown - skill.duration) {
          skill.active = false;
        }
      }
    });

    // DPS automático (ataque dos heróis)
    if (this.state === 'battle' && this.enemy && this.dps > 0) {
      const dpsMulti = this.isSkillActive('time_warp') ? 10 : 1;
      const autoDamage = (this.dps * dpsMulti * deltaTime) / 1000;

      if (autoDamage >= 1) {
        this.attackEnemy(Math.floor(autoDamage), false);
      } else if (Math.random() < autoDamage) {
        this.attackEnemy(1, false);
      }
    }

    // Atualizar shake do inimigo
    if (this.enemy && this.enemy.shake > 0) {
      this.enemy.shake -= 1;
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer--;
    }

    // Atualizar números de dano
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.y += dn.vy;
      dn.alpha -= 0.02;

      if (dn.alpha <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }

    // Atualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= 0.02;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Atualizar efeitos de clique
    for (let i = this.clickEffects.length - 1; i >= 0; i--) {
      const ce = this.clickEffects[i];
      ce.size += 3;
      ce.alpha -= 0.1;

      if (ce.alpha <= 0) {
        this.clickEffects.splice(i, 1);
      }
    }

    // Atualizar notificações
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.y += n.vy;
      n.alpha -= 0.015;

      if (n.alpha <= 0) {
        this.notifications.splice(i, 1);
      }
    }

    // Auto save
    this.autoSaveTimer += deltaTime;
    if (this.autoSaveTimer > 30000) {
      this.autoSaveTimer = 0;
      this.save();
    }
  }

  draw() {
    // Fundo
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.drawMenu();
    } else if (this.state === 'battle') {
      this.drawBattle();
    } else if (this.state === 'shop') {
      this.drawShop();
    } else if (this.state === 'heroes') {
      this.drawHeroes();
    } else if (this.state === 'skills') {
      this.drawSkills();
    } else if (this.state === 'achievements') {
      this.drawAchievements();
    }

    if (this.showTutorial) {
      this.drawTutorial();
    }
  }

  drawMenu() {
    const cx = this.canvas.width / 2;

    // Título animado
    this.ctx.save();
    const titleBounce = Math.sin(Date.now() * 0.003) * 5;
    this.ctx.translate(0, titleBounce);

    this.ctx.font = 'bold 42px Arial';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#FF6B6B';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('⚔️ BATTLE CLICKER ⚔️', cx, 100);
    this.ctx.shadowBlur = 0;

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FECA57';
    this.ctx.fillText('WARS', cx, 140);
    this.ctx.restore();

    // Recursos
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💰 ${this.formatNumber(this.gold)}`, 20, 40);
    this.ctx.fillStyle = '#9C27B0';
    this.ctx.fillText(`💎 ${this.gems}`, 20, 65);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillText(`⭐ Nível ${this.playerLevel}`, 20, 90);

    // Estatísticas
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#BDBDBD';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`🗺️ Zona ${this.maxZone} | ⚔️ DPS: ${this.formatNumber(this.dps)}`, cx, 180);
    this.ctx.fillText(`👑 Chefes derrotados: ${this.bossesDefeated}`, cx, 200);

    // Botões
    const buttons = [
      { text: '⚔️ BATALHAR', y: 250 },
      { text: '🛒 UPGRADES', y: 320 },
      { text: '🦸 HERÓIS', y: 390 },
      { text: '✨ HABILIDADES', y: 460 },
      { text: '🏆 CONQUISTAS', y: 530 }
    ];

    buttons.forEach(btn => {
      const btnWidth = 240;
      const btnHeight = 55;
      const btnX = cx - btnWidth / 2;

      this.ctx.fillStyle = 'rgba(255, 107, 107, 0.7)';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btn.y, btnWidth, btnHeight, 15);
      this.ctx.fill();

      this.ctx.strokeStyle = '#FF6B6B';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(btn.text, cx, btn.y + 36);
    });
  }

  drawBattle() {
    const cx = this.canvas.width / 2;

    // Shake screen
    this.ctx.save();
    if (this.shakeTimer > 0) {
      this.ctx.translate(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
    }

    // HUD superior
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 100);

    // Recursos
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💰 ${this.formatNumber(this.gold)}`, 20, 30);
    this.ctx.fillStyle = '#9C27B0';
    this.ctx.fillText(`💎 ${this.gems}`, 20, 55);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillText(`⚔️ DPS: ${this.formatNumber(this.dps)}`, 20, 80);

    // Zona e stage
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Zona ${this.currentZone} - ${this.currentStage}/10`, cx, 35);

    // XP bar
    const xpBarWidth = 200;
    const xpProgress = this.xp / this.xpToNextLevel;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(cx - xpBarWidth / 2, 50, xpBarWidth, 15);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(cx - xpBarWidth / 2, 50, xpBarWidth * xpProgress, 15);
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`Nível ${this.playerLevel}`, cx, 62);

    // Clique damage
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`👆 ${this.formatNumber(this.damage)} dano/clique`, this.canvas.width - 20, 30);
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`💥 ${(this.critChance * 100).toFixed(0)}% crítico (x${this.critMultiplier.toFixed(1)})`, this.canvas.width - 20, 55);

    // Inimigo
    if (this.enemy) {
      const enemyY = this.canvas.height / 2 - 50;
      const enemyShake = this.enemy.shake > 0 ? (Math.random() - 0.5) * this.enemy.shake : 0;

      // Nome do inimigo
      this.ctx.font = this.isBoss ? 'bold 24px Arial' : '20px Arial';
      this.ctx.fillStyle = this.isBoss ? '#FFD700' : '#FFFFFF';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.enemy.name, cx, enemyY - 80);

      // Barra de HP
      const hpBarWidth = 250;
      const hpPercent = Math.max(0, this.enemy.hp / this.enemy.maxHp);

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(cx - hpBarWidth / 2 - 2, enemyY - 55, hpBarWidth + 4, 24);

      const hpColor = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.2 ? '#FF9800' : '#F44336';
      this.ctx.fillStyle = hpColor;
      this.ctx.fillRect(cx - hpBarWidth / 2, enemyY - 53, hpBarWidth * hpPercent, 20);

      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(`${this.formatNumber(Math.max(0, this.enemy.hp))} / ${this.formatNumber(this.enemy.maxHp)}`, cx, enemyY - 38);

      // Emoji do inimigo
      this.ctx.font = this.isBoss ? '120px Arial' : '80px Arial';
      this.ctx.textAlign = 'center';

      // Glow para boss
      if (this.isBoss) {
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 30 + Math.sin(Date.now() * 0.01) * 10;
      }

      this.ctx.fillText(this.enemy.emoji, cx + enemyShake, enemyY + 50);
      this.ctx.shadowBlur = 0;

      // Recompensa
      this.ctx.font = '16px Arial';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText(`💰 ${this.formatNumber(this.enemy.goldReward)}`, cx, enemyY + 100);
    }

    // Partículas
    for (const p of this.particles) {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // Efeitos de clique
    for (const ce of this.clickEffects) {
      this.ctx.globalAlpha = ce.alpha;
      this.ctx.strokeStyle = '#FFD700';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(ce.x, ce.y, ce.size, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;

    // Números de dano
    for (const dn of this.damageNumbers) {
      this.ctx.globalAlpha = dn.alpha;
      this.ctx.font = dn.isCrit ? 'bold 32px Arial' : 'bold 24px Arial';
      this.ctx.fillStyle = dn.isCrit ? '#FFD700' : '#FF6B6B';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${dn.isCrit ? '💥' : ''}-${this.formatNumber(dn.value)}`, dn.x, dn.y);
    }
    this.ctx.globalAlpha = 1;

    // Notificações
    for (const n of this.notifications) {
      this.ctx.globalAlpha = n.alpha;
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 5;
      this.ctx.fillText(n.text, n.x, n.y);
      this.ctx.shadowBlur = 0;
    }
    this.ctx.globalAlpha = 1;

    this.ctx.restore();

    // Skills (na parte inferior)
    this.drawSkillBar();

    // Botão menu
    this.ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
    this.ctx.beginPath();
    this.ctx.roundRect(this.canvas.width - 70, 10, 60, 35, 8);
    this.ctx.fill();

    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('MENU', this.canvas.width - 40, 33);
  }

  drawSkillBar() {
    const skillBarY = this.canvas.height - 80;
    const skillSize = 60;
    const startX = (this.canvas.width - this.skills.length * (skillSize + 10)) / 2;

    this.skills.forEach((skill, i) => {
      const x = startX + i * (skillSize + 10);

      // Fundo
      this.ctx.fillStyle = skill.unlocked ?
        (skill.active ? 'rgba(76, 175, 80, 0.8)' : 'rgba(0, 0, 0, 0.5)') :
        'rgba(50, 50, 50, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, skillBarY, skillSize, skillSize, 10);
      this.ctx.fill();

      // Cooldown overlay
      if (skill.timer > 0 && !skill.active) {
        const cooldownPercent = skill.timer / skill.cooldown;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + skillSize / 2, skillBarY + skillSize / 2);
        this.ctx.arc(x + skillSize / 2, skillBarY + skillSize / 2, skillSize / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownPercent);
        this.ctx.closePath();
        this.ctx.fill();
      }

      // Emoji
      this.ctx.font = '28px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.globalAlpha = skill.unlocked ? 1 : 0.3;
      this.ctx.fillText(skill.emoji, x + skillSize / 2, skillBarY + 40);
      this.ctx.globalAlpha = 1;

      // Timer
      if (skill.timer > 0) {
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`${Math.ceil(skill.timer)}s`, x + skillSize / 2, skillBarY + 55);
      }
    });
  }

  drawShop() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🛒 UPGRADES', cx, 45);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💰 ${this.formatNumber(this.gold)}`, 20, 70);

    // Upgrades
    this.clickUpgrades.forEach((up, i) => {
      const y = 100 + i * 90;
      const cost = this.getUpgradeCost(up);
      const canBuy = this.gold >= cost;
      const maxed = up.maxLevel && up.level >= up.maxLevel;

      this.ctx.fillStyle = maxed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 80, 10);
      this.ctx.fill();

      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(up.name, 30, y + 28);

      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = '#BDBDBD';
      this.ctx.fillText(up.desc, 30, y + 50);

      this.ctx.fillStyle = '#4CAF50';
      this.ctx.fillText(`Nível ${up.level}${up.maxLevel ? `/${up.maxLevel}` : ''}`, 30, y + 70);

      if (!maxed) {
        const btnX = this.canvas.width - 120;
        this.ctx.fillStyle = canBuy ? 'rgba(255, 193, 7, 0.8)' : 'rgba(100, 100, 100, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(btnX, y + 22, 90, 40, 8);
        this.ctx.fill();

        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = canBuy ? '#000' : '#666';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`💰${this.formatNumber(cost)}`, btnX + 45, y + 48);
      }
    });

    this.drawBackButton();
  }

  drawHeroes() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🦸 HERÓIS', cx, 45);

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💰 ${this.formatNumber(this.gold)}`, 20, 70);

    // Heróis
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 90;

    this.heroes.forEach((hero, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = 100 + row * (itemHeight + 10);

      const cost = this.getHeroCost(hero);
      const canBuy = this.gold >= cost && hero.unlocked;

      this.ctx.fillStyle = hero.unlocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(50, 50, 50, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, itemWidth, itemHeight, 10);
      this.ctx.fill();

      // Emoji
      this.ctx.font = '32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.globalAlpha = hero.unlocked ? 1 : 0.3;
      this.ctx.fillText(hero.emoji, x + 35, y + 50);
      this.ctx.globalAlpha = 1;

      // Info
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillStyle = hero.unlocked ? '#FFFFFF' : '#666';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(hero.name, x + 60, y + 25);

      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = hero.unlocked ? '#4CAF50' : '#666';
      this.ctx.fillText(`DPS: ${this.formatNumber(this.getHeroDPS(hero))}`, x + 60, y + 45);
      this.ctx.fillText(`Nível ${hero.level}`, x + 60, y + 62);

      if (hero.unlocked) {
        this.ctx.font = '11px Arial';
        this.ctx.fillStyle = canBuy ? '#FFD700' : '#666';
        this.ctx.fillText(`💰${this.formatNumber(cost)}`, x + 60, y + 80);
      } else {
        this.ctx.font = '11px Arial';
        this.ctx.fillStyle = '#FF9800';
        this.ctx.fillText(`🔒 Zona ${hero.reqZone}`, x + 60, y + 80);
      }
    });

    this.drawBackButton();
  }

  drawSkills() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('✨ HABILIDADES', cx, 50);

    // Skills
    this.skills.forEach((skill, i) => {
      const y = 100 + i * 110;

      this.ctx.fillStyle = skill.unlocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(50, 50, 50, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(20, y, this.canvas.width - 40, 95, 10);
      this.ctx.fill();

      // Emoji
      this.ctx.font = '40px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.globalAlpha = skill.unlocked ? 1 : 0.3;
      this.ctx.fillText(skill.emoji, 60, y + 55);
      this.ctx.globalAlpha = 1;

      // Info
      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = skill.unlocked ? '#FFFFFF' : '#666';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(skill.name, 100, y + 30);

      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = skill.unlocked ? '#BDBDBD' : '#555';
      this.ctx.fillText(skill.desc, 100, y + 55);

      this.ctx.fillStyle = skill.unlocked ? '#4CAF50' : '#555';
      this.ctx.fillText(`Duração: ${skill.duration}s | Cooldown: ${skill.cooldown}s`, 100, y + 80);

      if (!skill.unlocked) {
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#FF9800';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`🔒 Zona ${skill.reqZone}`, this.canvas.width - 30, y + 55);
      }
    });

    this.drawBackButton();
  }

  drawAchievements() {
    const cx = this.canvas.width / 2;

    // Cabeçalho
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);

    this.ctx.font = 'bold 28px Arial';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🏆 CONQUISTAS', cx, 45);

    const unlocked = this.achievements.filter(a => a.unlocked).length;
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillText(`${unlocked}/${this.achievements.length} desbloqueadas`, cx, 70);

    // Conquistas
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 80;

    this.achievements.forEach((ach, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (itemWidth + 10);
      const y = 100 + row * (itemHeight + 10);

      this.ctx.fillStyle = ach.unlocked ? 'rgba(76, 175, 80, 0.4)' : 'rgba(50, 50, 50, 0.5)';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, itemWidth, itemHeight, 10);
      this.ctx.fill();

      this.ctx.font = '28px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ach.unlocked ? ach.icon : '🔒', x + 30, y + 48);

      this.ctx.font = 'bold 13px Arial';
      this.ctx.fillStyle = ach.unlocked ? '#FFFFFF' : '#666';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(ach.name, x + 55, y + 32);

      this.ctx.font = '11px Arial';
      this.ctx.fillStyle = ach.unlocked ? '#BDBDBD' : '#555';
      this.ctx.fillText(ach.desc, x + 55, y + 52);
    });

    this.drawBackButton();
  }

  drawBackButton() {
    const btnWidth = 120;
    const btnHeight = 45;
    const btnX = (this.canvas.width - btnWidth) / 2;
    const btnY = this.canvas.height - 65;

    this.ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 10);
    this.ctx.fill();

    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('← VOLTAR', this.canvas.width / 2, btnY + 30);
  }

  drawTutorial() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const page = this.tutorialPages[this.tutorialPage];

    this.ctx.font = '80px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(page.emoji, cx, 140);

    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.fillText(page.title, cx, 210);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    page.lines.forEach((line, i) => {
      this.ctx.fillText(line, cx, 270 + i * 35);
    });

    // Indicadores
    const dotY = this.canvas.height - 140;
    for (let i = 0; i < this.tutorialPages.length; i++) {
      this.ctx.fillStyle = i === this.tutorialPage ? '#FF6B6B' : '#666';
      this.ctx.beginPath();
      this.ctx.arc(cx - 30 + i * 20, dotY, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Botão
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = cx - btnWidth / 2;
    const btnY = this.canvas.height - 100;

    this.ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 12);
    this.ctx.fill();

    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#ffffff';
    const text = this.tutorialPage < this.tutorialPages.length - 1 ? 'PRÓXIMO →' : 'BATALHAR! ⚔️';
    this.ctx.fillText(text, cx, btnY + 33);
  }

  handleClick(x, y) {
    if (this.showTutorial) {
      this.handleTutorialClick(x, y);
      return;
    }

    const cx = this.canvas.width / 2;

    if (this.state === 'menu') {
      const buttons = [
        { y: 250, action: () => this.startBattle() },
        { y: 320, action: () => this.state = 'shop' },
        { y: 390, action: () => this.state = 'heroes' },
        { y: 460, action: () => this.state = 'skills' },
        { y: 530, action: () => this.state = 'achievements' }
      ];

      buttons.forEach(btn => {
        if (x > cx - 120 && x < cx + 120 && y > btn.y && y < btn.y + 55) {
          btn.action();
        }
      });

    } else if (this.state === 'battle') {
      // Botão menu
      if (x > this.canvas.width - 70 && y < 45) {
        this.state = 'menu';
        return;
      }

      // Clique em skill
      const skillBarY = this.canvas.height - 80;
      const skillSize = 60;
      const startX = (this.canvas.width - this.skills.length * (skillSize + 10)) / 2;

      this.skills.forEach((skill, i) => {
        const skillX = startX + i * (skillSize + 10);
        if (x > skillX && x < skillX + skillSize && y > skillBarY && y < skillBarY + skillSize) {
          this.activateSkill(skill);
        }
      });

      // Clique no inimigo
      if (y > 100 && y < this.canvas.height - 100) {
        this.click(x, y);
      }

    } else if (this.state === 'shop') {
      this.handleShopClick(x, y);

    } else if (this.state === 'heroes') {
      this.handleHeroesClick(x, y);
    }

    // Botão voltar
    if (this.state === 'shop' || this.state === 'heroes' || this.state === 'skills' || this.state === 'achievements') {
      const btnY = this.canvas.height - 65;
      if (y > btnY && y < btnY + 45 && x > cx - 60 && x < cx + 60) {
        this.state = 'menu';
      }
    }
  }

  handleTutorialClick(x, y) {
    const cx = this.canvas.width / 2;
    const btnY = this.canvas.height - 100;

    if (y > btnY && y < btnY + 50 && x > cx - 100 && x < cx + 100) {
      if (this.tutorialPage < this.tutorialPages.length - 1) {
        this.tutorialPage++;
      } else {
        this.showTutorial = false;
        localStorage.setItem('eai_battleclicker_tutorial_seen', 'true');
        this.startBattle();
      }
    }
  }

  handleShopClick(x, y) {
    this.clickUpgrades.forEach((up, i) => {
      const itemY = 100 + i * 90;
      const btnX = this.canvas.width - 120;

      if (x > btnX && x < btnX + 90 && y > itemY + 22 && y < itemY + 62) {
        this.buyUpgrade(up);
      }
    });
  }

  handleHeroesClick(x, y) {
    const cols = 2;
    const itemWidth = (this.canvas.width - 60) / cols;
    const itemHeight = 90;

    this.heroes.forEach((hero, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const itemX = 20 + col * (itemWidth + 10);
      const itemY = 100 + row * (itemHeight + 10);

      if (x > itemX && x < itemX + itemWidth && y > itemY && y < itemY + itemHeight) {
        this.buyHero(hero);
      }
    });
  }

  formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  }

  checkAchievements() {
    const checks = [
      { id: 'first_kill', condition: this.totalKills >= 1 },
      { id: 'zone_5', condition: this.maxZone >= 5 },
      { id: 'zone_10', condition: this.maxZone >= 10 },
      { id: 'boss_10', condition: this.bossesDefeated >= 10 },
      { id: 'gold_1m', condition: this.totalGoldEarned >= 1000000 },
      { id: 'heroes_5', condition: this.heroes.filter(h => h.level > 0).length >= 5 },
      { id: 'level_50', condition: this.playerLevel >= 50 },
      { id: 'dps_1000', condition: this.dps >= 1000 }
    ];

    checks.forEach(check => {
      const ach = this.achievements.find(a => a.id === check.id);
      if (ach && !ach.unlocked && check.condition) {
        ach.unlocked = true;
        this.gems += 5;
        this.addNotification(`🏆 ${ach.name}!`, this.canvas.width / 2, 200);
      }
    });

    this.saveAchievements();
  }

  save() {
    localStorage.setItem('eai_battleclicker_gold', this.gold.toString());
    localStorage.setItem('eai_battleclicker_gems', this.gems.toString());
    localStorage.setItem('eai_battleclicker_xp', this.xp.toString());
    localStorage.setItem('eai_battleclicker_level', this.playerLevel.toString());
    localStorage.setItem('eai_battleclicker_damage', this.damage.toString());
    localStorage.setItem('eai_battleclicker_dps', this.dps.toString());
    localStorage.setItem('eai_battleclicker_crit', this.critChance.toString());
    localStorage.setItem('eai_battleclicker_zone', this.currentZone.toString());
    localStorage.setItem('eai_battleclicker_stage', this.currentStage.toString());
    localStorage.setItem('eai_battleclicker_maxzone', this.maxZone.toString());
    localStorage.setItem('eai_battleclicker_bosses', this.bossesDefeated.toString());
    localStorage.setItem('eai_battleclicker_clicks', this.totalClicks.toString());
    localStorage.setItem('eai_battleclicker_totalgold', this.totalGoldEarned.toString());
    localStorage.setItem('eai_battleclicker_kills', this.totalKills.toString());

    this.saveHeroes();
    this.saveUpgrades();
    this.saveSkills();
  }

  loadHeroes() {
    const saved = localStorage.getItem('eai_battleclicker_heroes');
    if (saved) {
      const data = JSON.parse(saved);
      this.heroes.forEach(h => {
        if (data[h.id]) {
          h.level = data[h.id].level;
          h.unlocked = data[h.id].unlocked;
        }
      });
    }
    this.calculateDPS();
  }

  saveHeroes() {
    const data = {};
    this.heroes.forEach(h => {
      data[h.id] = { level: h.level, unlocked: h.unlocked };
    });
    localStorage.setItem('eai_battleclicker_heroes', JSON.stringify(data));
  }

  loadUpgrades() {
    const saved = localStorage.getItem('eai_battleclicker_upgrades');
    if (saved) {
      const data = JSON.parse(saved);
      this.clickUpgrades.forEach(u => {
        if (data[u.id]) {
          u.level = data[u.id].level;
        }
      });

      // Recalcular stats
      this.damage = 1;
      this.critChance = 0.05;
      this.critMultiplier = 2;
      this.goldBonus = 1;

      this.clickUpgrades.forEach(u => {
        if (u.id === 'damage') this.damage += u.level * u.effect;
        if (u.id === 'crit') this.critChance += u.level * u.effect;
        if (u.id === 'critDmg') this.critMultiplier += u.level * u.effect;
        if (u.id === 'goldBonus') this.goldBonus += u.level * u.effect;
      });
    }
  }

  saveUpgrades() {
    const data = {};
    this.clickUpgrades.forEach(u => {
      data[u.id] = { level: u.level };
    });
    localStorage.setItem('eai_battleclicker_upgrades', JSON.stringify(data));
  }

  loadSkills() {
    const saved = localStorage.getItem('eai_battleclicker_skills');
    if (saved) {
      const data = JSON.parse(saved);
      this.skills.forEach(s => {
        if (data[s.id]) {
          s.unlocked = data[s.id].unlocked;
        }
      });
    }
  }

  saveSkills() {
    const data = {};
    this.skills.forEach(s => {
      data[s.id] = { unlocked: s.unlocked };
    });
    localStorage.setItem('eai_battleclicker_skills', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = localStorage.getItem('eai_battleclicker_achievements');
    if (saved) {
      const unlocked = JSON.parse(saved);
      this.achievements.forEach(a => {
        if (unlocked.includes(a.id)) a.unlocked = true;
      });
    }
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_battleclicker_achievements', JSON.stringify(unlocked));
  }

  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Iniciar jogo
window.addEventListener('load', () => {
  new BattleClickerGame();
});
