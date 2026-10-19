// Survivors EAI - Vampire Survivors Style Game
class SurvivorsGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_survivors_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      {
        title: 'Bem-vindo ao Survivors EAI!',
        lines: [
          'Sobreviva por 10 minutos!',
          '',
          'Monstros virao de todos os lados.',
          'Seus ataques sao automaticos!',
          'Fuja e colete XP para ficar forte.'
        ],
        emoji: '⚔️'
      },
      {
        title: 'Como Jogar',
        lines: [
          'PC: Use WASD ou setas para mover',
          'Mobile: Arraste o dedo para mover',
          '',
          'Voce ataca automaticamente!',
          'Fuja dos inimigos e colete orbes XP.'
        ],
        emoji: '🎮'
      },
      {
        title: 'Subindo de Nivel',
        lines: [
          'Colete orbes verdes de XP',
          'Ao subir de nivel, escolha um upgrade:',
          '',
          '• Novas armas e habilidades',
          '• Mais HP, velocidade ou dano',
          '• Curas para recuperar vida'
        ],
        emoji: '⬆️'
      },
      {
        title: 'Personagens',
        lines: [
          '🔴 Guerreiro - Tanque, espada girando',
          '🟣 Mago - Fragil, projéteis magicos',
          '🟢 Ladino - Rapido, adagas multiplas',
          '',
          'Escolha seu favorito e boa sorte!'
        ],
        emoji: '👥'
      }
    ];

    this.gameState = 'menu'; // menu, playing, paused, levelup, gameover, victory
    this.gameTime = 0;
    this.maxTime = 600; // 10 minutes

    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
    this.particles = [];
    this.damageNumbers = [];

    this.spawnTimer = 0;
    this.spawnRate = 2000;
    this.wave = 1;
    this.bossSpawned = false;

    this.kills = 0;
    this.totalXP = 0;

    // Characters
    this.characters = {
      warrior: {
        name: 'Guerreiro',
        color: '#e74c3c',
        hp: 150,
        speed: 3,
        startWeapon: 'sword',
        description: 'Alto HP, espada giratória'
      },
      mage: {
        name: 'Mago',
        color: '#9b59b6',
        hp: 80,
        speed: 3.5,
        startWeapon: 'magic',
        description: 'Projéteis mágicos'
      },
      rogue: {
        name: 'Ladino',
        color: '#2ecc71',
        hp: 100,
        speed: 4.5,
        startWeapon: 'dagger',
        description: 'Velocidade alta, adagas'
      }
    };

    this.selectedCharacter = 'warrior';

    // Weapons
    this.weaponTypes = {
      sword: {
        name: 'Espada Giratória',
        color: '#ecf0f1',
        damage: 20,
        cooldown: 1500,
        range: 80,
        type: 'melee'
      },
      magic: {
        name: 'Orbe Mágico',
        color: '#9b59b6',
        damage: 15,
        cooldown: 800,
        range: 300,
        type: 'projectile',
        speed: 6,
        count: 1
      },
      dagger: {
        name: 'Adagas',
        color: '#95a5a6',
        damage: 10,
        cooldown: 400,
        range: 250,
        type: 'projectile',
        speed: 10,
        count: 2
      },
      lightning: {
        name: 'Raio',
        color: '#f1c40f',
        damage: 30,
        cooldown: 2000,
        range: 200,
        type: 'area'
      },
      shield: {
        name: 'Escudo Orbital',
        color: '#3498db',
        damage: 8,
        cooldown: 100,
        range: 60,
        type: 'orbital',
        count: 2
      },
      fire: {
        name: 'Explosão de Fogo',
        color: '#e67e22',
        damage: 40,
        cooldown: 3000,
        range: 100,
        type: 'explosion'
      }
    };

    // Enemy types
    this.enemyTypes = {
      slime: {
        name: 'Slime',
        color: '#27ae60',
        hp: 30,
        damage: 10,
        speed: 1.5,
        size: 20,
        xp: 5
      },
      bat: {
        name: 'Morcego',
        color: '#8e44ad',
        hp: 15,
        damage: 8,
        speed: 3,
        size: 15,
        xp: 3
      },
      skeleton: {
        name: 'Esqueleto',
        color: '#ecf0f1',
        hp: 60,
        damage: 15,
        speed: 1.2,
        size: 25,
        xp: 10
      },
      ghost: {
        name: 'Fantasma',
        color: '#bdc3c7',
        hp: 40,
        damage: 12,
        speed: 2,
        size: 22,
        xp: 8,
        phasing: true
      },
      boss: {
        name: 'Boss',
        color: '#c0392b',
        hp: 500,
        damage: 30,
        speed: 1,
        size: 60,
        xp: 100,
        isBoss: true
      }
    };

    // Upgrade options
    this.upgradePool = [
      { type: 'weapon', weapon: 'magic', name: 'Orbe Mágico', desc: 'Dispara projéteis mágicos' },
      { type: 'weapon', weapon: 'lightning', name: 'Raio', desc: 'Atinge inimigos aleatórios' },
      { type: 'weapon', weapon: 'shield', name: 'Escudo Orbital', desc: 'Orbita ao redor do jogador' },
      { type: 'weapon', weapon: 'fire', name: 'Explosão', desc: 'Explosão de área' },
      { type: 'stat', stat: 'maxHp', value: 20, name: '+20 HP', desc: 'Aumenta vida máxima' },
      { type: 'stat', stat: 'speed', value: 0.3, name: '+Velocidade', desc: 'Move mais rápido' },
      { type: 'stat', stat: 'damage', value: 0.1, name: '+10% Dano', desc: 'Todos ataques mais fortes' },
      { type: 'stat', stat: 'cooldown', value: -0.1, name: '-10% Cooldown', desc: 'Ataca mais rápido' },
      { type: 'heal', value: 30, name: 'Cura', desc: 'Recupera 30 HP' }
    ];

    // Controls
    this.keys = {};
    this.touch = { active: false, x: 0, y: 0 };

    this.setupControls();
    this.loadProgress();
    this.gameLoop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.worldWidth = 2000;
    this.worldHeight = 2000;
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'Escape' && this.gameState === 'playing') {
        this.gameState = 'paused';
      } else if (e.key === 'Escape' && this.gameState === 'paused') {
        this.gameState = 'playing';
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Touch controls (virtual joystick)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.showTutorial) {
        this.handleTutorialClick(e.touches[0].clientX, e.touches[0].clientY);
        return;
      }
      if (this.gameState === 'menu') {
        this.handleMenuClick(e.touches[0].clientX, e.touches[0].clientY);
      } else if (this.gameState === 'levelup') {
        this.handleLevelUpClick(e.touches[0].clientX, e.touches[0].clientY);
      } else if (this.gameState === 'gameover' || this.gameState === 'victory') {
        this.gameState = 'menu';
      } else {
        this.touch.active = true;
        this.touch.startX = e.touches[0].clientX;
        this.touch.startY = e.touches[0].clientY;
        this.touch.x = 0;
        this.touch.y = 0;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.touch.active) {
        this.touch.x = (e.touches[0].clientX - this.touch.startX) / 50;
        this.touch.y = (e.touches[0].clientY - this.touch.startY) / 50;
        // Clamp
        const mag = Math.sqrt(this.touch.x ** 2 + this.touch.y ** 2);
        if (mag > 1) {
          this.touch.x /= mag;
          this.touch.y /= mag;
        }
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touch.active = false;
      this.touch.x = 0;
      this.touch.y = 0;
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.showTutorial) {
        this.handleTutorialClick(e.clientX, e.clientY);
        return;
      }
      if (this.gameState === 'menu') {
        this.handleMenuClick(e.clientX, e.clientY);
      } else if (this.gameState === 'levelup') {
        this.handleLevelUpClick(e.clientX, e.clientY);
      } else if (this.gameState === 'gameover' || this.gameState === 'victory') {
        this.gameState = 'menu';
      }
    });
  }

  handleTutorialClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const btnY = centerY + 120;

    if (x > centerX - 60 && x < centerX + 60 && y > btnY - 20 && y < btnY + 20) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_survivors_tutorial_seen', 'true');
      }
    }

    if (x > centerX - 40 && x < centerX + 40 && y > btnY + 40 && y < btnY + 70) {
      this.showTutorial = false;
      localStorage.setItem('eai_survivors_tutorial_seen', 'true');
    }
  }

  handleMenuClick(x, y) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Character selection
    const charKeys = Object.keys(this.characters);
    const startX = centerX - (charKeys.length * 110) / 2;

    charKeys.forEach((key, i) => {
      const cx = startX + i * 110 + 50;
      const cy = centerY;
      if (x > cx - 50 && x < cx + 50 && y > cy - 60 && y < cy + 60) {
        this.selectedCharacter = key;
      }
    });

    // Start button
    if (x > centerX - 80 && x < centerX + 80 && y > centerY + 100 && y < centerY + 150) {
      this.startGame();
    }
  }

  handleLevelUpClick(x, y) {
    const centerX = this.canvas.width / 2;
    const startY = this.canvas.height / 2 - 80;

    this.upgradeChoices.forEach((upgrade, i) => {
      const uy = startY + i * 70;
      if (x > centerX - 150 && x < centerX + 150 && y > uy - 25 && y < uy + 25) {
        this.applyUpgrade(upgrade);
        this.gameState = 'playing';
      }
    });
  }

  startGame() {
    const char = this.characters[this.selectedCharacter];

    this.player = {
      x: this.worldWidth / 2,
      y: this.worldHeight / 2,
      size: 20,
      hp: char.hp,
      maxHp: char.hp,
      speed: char.speed,
      level: 1,
      xp: 0,
      xpToLevel: 20,
      weapons: [char.startWeapon],
      weaponTimers: {},
      damageMultiplier: 1,
      cooldownMultiplier: 1,
      invincible: 0,
      color: char.color
    };

    this.player.weapons.forEach(w => {
      this.player.weaponTimers[w] = 0;
    });

    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
    this.particles = [];
    this.damageNumbers = [];

    this.gameTime = 0;
    this.spawnTimer = 0;
    this.spawnRate = 2000;
    this.wave = 1;
    this.bossSpawned = false;
    this.kills = 0;
    this.totalXP = 0;

    this.gameState = 'playing';
    this.lastTime = performance.now();
  }

  update(deltaTime) {
    if (this.gameState !== 'playing') return;

    this.gameTime += deltaTime;

    // Victory check
    if (this.gameTime >= this.maxTime * 1000) {
      this.gameState = 'victory';
      this.saveProgress();
      return;
    }

    // Update wave
    const newWave = Math.floor(this.gameTime / 60000) + 1;
    if (newWave > this.wave) {
      this.wave = newWave;
      this.spawnRate = Math.max(500, 2000 - this.wave * 200);
    }

    // Boss spawn every 5 minutes
    if (Math.floor(this.gameTime / 300000) > Math.floor((this.gameTime - deltaTime) / 300000)) {
      this.spawnBoss();
    }

    this.updatePlayer(deltaTime);
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateXPOrbs(deltaTime);
    this.updateParticles(deltaTime);
    this.updateDamageNumbers(deltaTime);
    this.spawnEnemies(deltaTime);
    this.updateWeapons(deltaTime);
    this.checkCollisions();

    // Invincibility timer
    if (this.player.invincible > 0) {
      this.player.invincible -= deltaTime;
    }
  }

  updatePlayer(deltaTime) {
    let dx = 0, dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    // Touch controls
    if (this.touch.active) {
      dx = this.touch.x;
      dy = this.touch.y;
    }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      dx /= mag;
      dy /= mag;
    }

    this.player.x += dx * this.player.speed * (deltaTime / 16);
    this.player.y += dy * this.player.speed * (deltaTime / 16);

    // Clamp to world
    this.player.x = Math.max(20, Math.min(this.worldWidth - 20, this.player.x));
    this.player.y = Math.max(20, Math.min(this.worldHeight - 20, this.player.y));
  }

  updateWeapons(deltaTime) {
    this.player.weapons.forEach(weaponKey => {
      const weapon = this.weaponTypes[weaponKey];
      this.player.weaponTimers[weaponKey] = (this.player.weaponTimers[weaponKey] || 0) + deltaTime;

      const cooldown = weapon.cooldown * this.player.cooldownMultiplier;

      if (this.player.weaponTimers[weaponKey] >= cooldown) {
        this.player.weaponTimers[weaponKey] = 0;
        this.fireWeapon(weaponKey);
      }
    });
  }

  fireWeapon(weaponKey) {
    const weapon = this.weaponTypes[weaponKey];
    const damage = weapon.damage * this.player.damageMultiplier;

    switch (weapon.type) {
      case 'melee':
        this.createSwordSwing(damage, weapon);
        break;
      case 'projectile':
        this.createProjectiles(damage, weapon);
        break;
      case 'area':
        this.createLightning(damage, weapon);
        break;
      case 'orbital':
        // Orbital is passive, handled in collision
        break;
      case 'explosion':
        this.createExplosion(this.player.x, this.player.y, damage, weapon.range);
        break;
    }
  }

  createSwordSwing(damage, weapon) {
    // Find closest enemy
    let closest = null;
    let closestDist = weapon.range;

    this.enemies.forEach(enemy => {
      const dist = this.distance(this.player, enemy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    });

    // Create swing visual
    this.projectiles.push({
      x: this.player.x,
      y: this.player.y,
      angle: closest ? Math.atan2(closest.y - this.player.y, closest.x - this.player.x) : Math.random() * Math.PI * 2,
      radius: weapon.range,
      damage: damage,
      life: 200,
      maxLife: 200,
      type: 'sword',
      color: weapon.color,
      hitEnemies: new Set()
    });
  }

  createProjectiles(damage, weapon) {
    const count = weapon.count || 1;

    // Find closest enemies
    const targets = [...this.enemies]
      .map(e => ({ enemy: e, dist: this.distance(this.player, e) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, count);

    for (let i = 0; i < count; i++) {
      let angle;
      if (targets[i]) {
        angle = Math.atan2(targets[i].enemy.y - this.player.y, targets[i].enemy.x - this.player.x);
      } else {
        angle = (Math.PI * 2 / count) * i;
      }

      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * weapon.speed,
        vy: Math.sin(angle) * weapon.speed,
        damage: damage,
        life: 2000,
        type: 'projectile',
        color: weapon.color,
        size: 8
      });
    }
  }

  createLightning(damage, weapon) {
    // Hit random enemies in range
    const inRange = this.enemies.filter(e => this.distance(this.player, e) < weapon.range);
    const targets = inRange.slice(0, 3);

    targets.forEach(enemy => {
      this.damageEnemy(enemy, damage);

      // Lightning visual
      this.particles.push({
        x1: this.player.x,
        y1: this.player.y,
        x2: enemy.x,
        y2: enemy.y,
        life: 200,
        type: 'lightning',
        color: weapon.color
      });
    });
  }

  createExplosion(x, y, damage, radius) {
    this.enemies.forEach(enemy => {
      if (this.distance({ x, y }, enemy) < radius) {
        this.damageEnemy(enemy, damage);
      }
    });

    // Visual
    this.particles.push({
      x, y,
      radius: 0,
      maxRadius: radius,
      life: 300,
      type: 'explosion',
      color: '#e67e22'
    });
  }

  updateEnemies(deltaTime) {
    this.enemies.forEach(enemy => {
      // Move towards player
      const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
      enemy.x += Math.cos(angle) * enemy.speed * (deltaTime / 16);
      enemy.y += Math.sin(angle) * enemy.speed * (deltaTime / 16);
    });
  }

  updateProjectiles(deltaTime) {
    this.projectiles = this.projectiles.filter(proj => {
      proj.life -= deltaTime;

      if (proj.type === 'projectile') {
        proj.x += proj.vx * (deltaTime / 16);
        proj.y += proj.vy * (deltaTime / 16);
      } else if (proj.type === 'sword') {
        proj.angle += 0.3;
      }

      return proj.life > 0;
    });
  }

  updateXPOrbs(deltaTime) {
    const pickupRange = 100;
    const magnetRange = 150;

    this.xpOrbs = this.xpOrbs.filter(orb => {
      const dist = this.distance(this.player, orb);

      // Magnet effect
      if (dist < magnetRange) {
        const angle = Math.atan2(this.player.y - orb.y, this.player.x - orb.x);
        const speed = 5 + (magnetRange - dist) / 20;
        orb.x += Math.cos(angle) * speed;
        orb.y += Math.sin(angle) * speed;
      }

      // Pickup
      if (dist < pickupRange) {
        this.player.xp += orb.value;
        this.totalXP += orb.value;
        this.checkLevelUp();
        return false;
      }

      return true;
    });
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.life -= deltaTime;

      if (p.type === 'explosion') {
        p.radius = p.maxRadius * (1 - p.life / 300);
      }

      return p.life > 0;
    });
  }

  updateDamageNumbers(deltaTime) {
    this.damageNumbers = this.damageNumbers.filter(dn => {
      dn.life -= deltaTime;
      dn.y -= 1;
      return dn.life > 0;
    });
  }

  spawnEnemies(deltaTime) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnRate) {
      this.spawnTimer = 0;

      // Spawn outside view
      const angle = Math.random() * Math.PI * 2;
      const dist = 500;
      const x = this.player.x + Math.cos(angle) * dist;
      const y = this.player.y + Math.sin(angle) * dist;

      // Choose enemy type based on wave
      let type;
      const roll = Math.random();
      if (this.wave >= 4 && roll < 0.15) {
        type = 'ghost';
      } else if (this.wave >= 3 && roll < 0.3) {
        type = 'skeleton';
      } else if (this.wave >= 2 && roll < 0.5) {
        type = 'bat';
      } else {
        type = 'slime';
      }

      const template = this.enemyTypes[type];
      const waveMultiplier = 1 + (this.wave - 1) * 0.2;

      this.enemies.push({
        x, y,
        hp: template.hp * waveMultiplier,
        maxHp: template.hp * waveMultiplier,
        damage: template.damage * waveMultiplier,
        speed: template.speed,
        size: template.size,
        xp: template.xp,
        color: template.color,
        type: type,
        phasing: template.phasing || false
      });
    }
  }

  spawnBoss() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 400;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;

    const template = this.enemyTypes.boss;
    const waveMultiplier = 1 + (this.wave - 1) * 0.3;

    this.enemies.push({
      x, y,
      hp: template.hp * waveMultiplier,
      maxHp: template.hp * waveMultiplier,
      damage: template.damage,
      speed: template.speed,
      size: template.size,
      xp: template.xp,
      color: template.color,
      type: 'boss',
      isBoss: true
    });
  }

  checkCollisions() {
    // Projectiles vs enemies
    this.projectiles.forEach(proj => {
      if (proj.type === 'sword') {
        this.enemies.forEach(enemy => {
          if (proj.hitEnemies.has(enemy)) return;

          const dist = this.distance(this.player, enemy);
          if (dist < proj.radius) {
            this.damageEnemy(enemy, proj.damage);
            proj.hitEnemies.add(enemy);
          }
        });
      } else if (proj.type === 'projectile') {
        this.enemies.forEach(enemy => {
          const dist = this.distance(proj, enemy);
          if (dist < enemy.size + proj.size) {
            this.damageEnemy(enemy, proj.damage);
            proj.life = 0;
          }
        });
      }
    });

    // Shield orbital damage
    if (this.player.weapons.includes('shield')) {
      const shield = this.weaponTypes.shield;
      const shieldCount = shield.count;
      const shieldDist = 50;

      for (let i = 0; i < shieldCount; i++) {
        const angle = (this.gameTime / 500) + (Math.PI * 2 / shieldCount) * i;
        const sx = this.player.x + Math.cos(angle) * shieldDist;
        const sy = this.player.y + Math.sin(angle) * shieldDist;

        this.enemies.forEach(enemy => {
          if (this.distance({ x: sx, y: sy }, enemy) < 25) {
            this.damageEnemy(enemy, shield.damage * this.player.damageMultiplier * 0.1);
          }
        });
      }
    }

    // Enemies vs player
    if (this.player.invincible <= 0) {
      this.enemies.forEach(enemy => {
        const dist = this.distance(this.player, enemy);
        if (dist < this.player.size + enemy.size) {
          this.player.hp -= enemy.damage;
          this.player.invincible = 500;

          // Knockback
          const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
          this.player.x += Math.cos(angle) * 30;
          this.player.y += Math.sin(angle) * 30;

          if (this.player.hp <= 0) {
            this.gameState = 'gameover';
            this.saveProgress();
          }
        }
      });
    }
  }

  damageEnemy(enemy, damage) {
    enemy.hp -= damage;

    this.damageNumbers.push({
      x: enemy.x + (Math.random() - 0.5) * 20,
      y: enemy.y,
      value: Math.round(damage),
      life: 500,
      color: enemy.isBoss ? '#f1c40f' : '#fff'
    });

    if (enemy.hp <= 0) {
      this.kills++;

      // Drop XP
      this.xpOrbs.push({
        x: enemy.x,
        y: enemy.y,
        value: enemy.xp,
        size: enemy.isBoss ? 15 : 8
      });

      // Remove enemy
      const idx = this.enemies.indexOf(enemy);
      if (idx > -1) this.enemies.splice(idx, 1);

      // Death particles
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 300,
          type: 'death',
          color: enemy.color
        });
      }
    }
  }

  checkLevelUp() {
    while (this.player.xp >= this.player.xpToLevel) {
      this.player.xp -= this.player.xpToLevel;
      this.player.level++;
      this.player.xpToLevel = Math.floor(this.player.xpToLevel * 1.5);

      // Generate upgrade choices
      this.generateUpgradeChoices();
      this.gameState = 'levelup';
    }
  }

  generateUpgradeChoices() {
    const available = this.upgradePool.filter(u => {
      if (u.type === 'weapon' && this.player.weapons.includes(u.weapon)) {
        return false;
      }
      return true;
    });

    // Shuffle and pick 3
    this.upgradeChoices = available
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }

  applyUpgrade(upgrade) {
    switch (upgrade.type) {
      case 'weapon':
        this.player.weapons.push(upgrade.weapon);
        this.player.weaponTimers[upgrade.weapon] = 0;
        break;
      case 'stat':
        if (upgrade.stat === 'maxHp') {
          this.player.maxHp += upgrade.value;
          this.player.hp += upgrade.value;
        } else if (upgrade.stat === 'speed') {
          this.player.speed += upgrade.value;
        } else if (upgrade.stat === 'damage') {
          this.player.damageMultiplier += upgrade.value;
        } else if (upgrade.stat === 'cooldown') {
          this.player.cooldownMultiplier += upgrade.value;
        }
        break;
      case 'heal':
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + upgrade.value);
        break;
    }
  }

  distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  draw() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    if (this.gameState === 'menu') {
      this.drawMenu();
    } else if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'levelup') {
      this.drawGame();
      if (this.gameState === 'paused') this.drawPaused();
      if (this.gameState === 'levelup') this.drawLevelUp();
    } else if (this.gameState === 'gameover') {
      this.drawGame();
      this.drawGameOver();
    } else if (this.gameState === 'victory') {
      this.drawGame();
      this.drawVictory();
    }
  }

  drawTutorial() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const page = this.tutorialPages[this.tutorialPage];

    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(centerX - 160, centerY - 160, 320, 340, 20);
    ctx.fill();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, centerX, centerY - 90);

    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, centerX, centerY - 40);

    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + i * 22);
    });

    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(`${this.tutorialPage + 1}/${this.tutorialPages.length}`, centerX, centerY + 155);

    const btnY = centerY + 120;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(centerX - 60, btnY - 20, 120, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    const btnText = this.tutorialPage === this.tutorialPages.length - 1 ? 'JOGAR!' : 'PROXIMO';
    ctx.fillText(btnText, centerX, btnY + 6);

    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('Pular tutorial', centerX, btnY + 55);
  }

  drawMenu() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Title
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SURVIVORS EAI', centerX, 100);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText('Sobreviva por 10 minutos!', centerX, 130);

    // Character selection
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText('Escolha seu personagem:', centerX, centerY - 100);

    const charKeys = Object.keys(this.characters);
    const startX = centerX - (charKeys.length * 110) / 2;

    charKeys.forEach((key, i) => {
      const char = this.characters[key];
      const cx = startX + i * 110 + 50;
      const cy = centerY;

      // Box
      this.ctx.fillStyle = key === this.selectedCharacter ? '#333' : '#222';
      this.ctx.strokeStyle = key === this.selectedCharacter ? '#4ECDC4' : '#444';
      this.ctx.lineWidth = 3;
      this.ctx.fillRect(cx - 50, cy - 60, 100, 120);
      this.ctx.strokeRect(cx - 50, cy - 60, 100, 120);

      // Character circle
      this.ctx.beginPath();
      this.ctx.arc(cx, cy - 20, 25, 0, Math.PI * 2);
      this.ctx.fillStyle = char.color;
      this.ctx.fill();

      // Name
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px Arial';
      this.ctx.fillText(char.name, cx, cy + 30);

      // Description
      this.ctx.fillStyle = '#888';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(char.description, cx, cy + 50);
    });

    // Start button
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.fillRect(centerX - 80, centerY + 100, 160, 50);
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('JOGAR', centerX, centerY + 132);

    // Controls
    this.ctx.fillStyle = '#666';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('WASD ou Setas para mover', centerX, this.canvas.height - 60);
    this.ctx.fillText('Mobile: Arraste para mover', centerX, this.canvas.height - 40);
  }

  drawGame() {
    // Camera
    const camX = this.player.x - this.canvas.width / 2;
    const camY = this.player.y - this.canvas.height / 2;

    this.ctx.save();
    this.ctx.translate(-camX, -camY);

    // World bounds
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);

    // Grid
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1;
    const gridSize = 100;
    for (let x = 0; x < this.worldWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.worldHeight);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.worldHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.worldWidth, y);
      this.ctx.stroke();
    }

    // XP Orbs
    this.xpOrbs.forEach(orb => {
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.fill();
      this.ctx.strokeStyle = '#27ae60';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });

    // Particles
    this.particles.forEach(p => {
      if (p.type === 'death') {
        this.ctx.globalAlpha = p.life / 300;
        this.ctx.beginPath();
        this.ctx.arc(p.x + p.vx * (300 - p.life) / 30, p.y + p.vy * (300 - p.life) / 30, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
      } else if (p.type === 'lightning') {
        this.ctx.globalAlpha = p.life / 200;
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x1, p.y1);
        // Jagged line
        const dx = (p.x2 - p.x1) / 4;
        const dy = (p.y2 - p.y1) / 4;
        for (let i = 1; i <= 3; i++) {
          this.ctx.lineTo(p.x1 + dx * i + (Math.random() - 0.5) * 20, p.y1 + dy * i + (Math.random() - 0.5) * 20);
        }
        this.ctx.lineTo(p.x2, p.y2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
      } else if (p.type === 'explosion') {
        this.ctx.globalAlpha = p.life / 300;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
      }
    });

    // Enemies
    this.enemies.forEach(enemy => {
      // Shadow
      this.ctx.beginPath();
      this.ctx.ellipse(enemy.x, enemy.y + enemy.size * 0.8, enemy.size * 0.7, enemy.size * 0.3, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.ctx.fill();

      // Body
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      this.ctx.fillStyle = enemy.color;
      this.ctx.fill();

      // HP bar for bosses
      if (enemy.isBoss) {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(enemy.x - 40, enemy.y - enemy.size - 15, 80, 8);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(enemy.x - 40, enemy.y - enemy.size - 15, 80 * (enemy.hp / enemy.maxHp), 8);
      }

      // Eyes
      const eyeOffset = enemy.size * 0.3;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x - eyeOffset, enemy.y - eyeOffset * 0.5, 4, 0, Math.PI * 2);
      this.ctx.arc(enemy.x + eyeOffset, enemy.y - eyeOffset * 0.5, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fill();
    });

    // Projectiles
    this.projectiles.forEach(proj => {
      if (proj.type === 'sword') {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(proj.angle);
        this.ctx.globalAlpha = proj.life / proj.maxLife;

        // Sword arc
        this.ctx.beginPath();
        this.ctx.moveTo(30, -5);
        this.ctx.lineTo(proj.radius, -3);
        this.ctx.lineTo(proj.radius + 10, 0);
        this.ctx.lineTo(proj.radius, 3);
        this.ctx.lineTo(30, 5);
        this.ctx.closePath();
        this.ctx.fillStyle = proj.color;
        this.ctx.fill();

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
      } else if (proj.type === 'projectile') {
        this.ctx.beginPath();
        this.ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        this.ctx.fillStyle = proj.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = proj.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    });

    // Shield orbitals
    if (this.player.weapons.includes('shield')) {
      const shield = this.weaponTypes.shield;
      const shieldCount = shield.count;
      const shieldDist = 50;

      for (let i = 0; i < shieldCount; i++) {
        const angle = (this.gameTime / 500) + (Math.PI * 2 / shieldCount) * i;
        const sx = this.player.x + Math.cos(angle) * shieldDist;
        const sy = this.player.y + Math.sin(angle) * shieldDist;

        this.ctx.beginPath();
        this.ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = shield.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }

    // Player
    if (this.player.invincible > 0 && Math.floor(this.player.invincible / 100) % 2 === 0) {
      this.ctx.globalAlpha = 0.5;
    }

    // Shadow
    this.ctx.beginPath();
    this.ctx.ellipse(this.player.x, this.player.y + 15, 15, 6, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fill();

    // Body
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.player.color;
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.globalAlpha = 1;

    // Damage numbers
    this.damageNumbers.forEach(dn => {
      this.ctx.globalAlpha = dn.life / 500;
      this.ctx.fillStyle = dn.color;
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(dn.value, dn.x, dn.y);
      this.ctx.globalAlpha = 1;
    });

    this.ctx.restore();

    // HUD
    this.drawHUD();

    // Touch joystick
    if (this.touch.active) {
      this.ctx.beginPath();
      this.ctx.arc(this.touch.startX, this.touch.startY, 50, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(this.touch.startX + this.touch.x * 30, this.touch.startY + this.touch.y * 30, 20, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
      this.ctx.fill();
    }
  }

  drawHUD() {
    // HP bar
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(20, 20, 200, 20);
    this.ctx.fillStyle = this.player.hp > this.player.maxHp * 0.3 ? '#e74c3c' : '#c0392b';
    this.ctx.fillRect(20, 20, 200 * (this.player.hp / this.player.maxHp), 20);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(20, 20, 200, 20);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${Math.ceil(this.player.hp)}/${this.player.maxHp}`, 120, 34);

    // XP bar
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(20, 45, 200, 10);
    this.ctx.fillStyle = '#2ecc71';
    this.ctx.fillRect(20, 45, 200 * (this.player.xp / this.player.xpToLevel), 10);

    // Level
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Lv.${this.player.level}`, 20, 75);

    // Timer
    const timeLeft = Math.max(0, this.maxTime - this.gameTime / 1000);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, this.canvas.width / 2, 35);

    // Wave
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`Wave ${this.wave}`, this.canvas.width / 2, 55);

    // Kills
    this.ctx.textAlign = 'right';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Kills: ${this.kills}`, this.canvas.width - 20, 35);

    // Weapons
    this.ctx.textAlign = 'left';
    this.ctx.font = '12px Arial';
    this.player.weapons.forEach((w, i) => {
      const weapon = this.weaponTypes[w];
      this.ctx.fillStyle = weapon.color;
      this.ctx.fillRect(20, 90 + i * 25, 15, 15);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(weapon.name, 40, 102 + i * 25);
    });
  }

  drawPaused() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2);

    this.ctx.font = '20px Arial';
    this.ctx.fillText('Pressione ESC para continuar', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  drawLevelUp() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LEVEL UP!', this.canvas.width / 2, this.canvas.height / 2 - 130);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Escolha um upgrade:', this.canvas.width / 2, this.canvas.height / 2 - 100);

    const startY = this.canvas.height / 2 - 80;

    this.upgradeChoices.forEach((upgrade, i) => {
      const y = startY + i * 70;

      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(this.canvas.width / 2 - 150, y - 25, 300, 50);
      this.ctx.strokeStyle = '#4ECDC4';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.canvas.width / 2 - 150, y - 25, 300, 50);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(upgrade.name, this.canvas.width / 2, y - 5);

      this.ctx.fillStyle = '#888';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(upgrade.desc, this.canvas.width / 2, y + 15);
    });
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#e74c3c';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    const survived = Math.floor(this.gameTime / 1000);
    this.ctx.fillText(`Sobreviveu: ${Math.floor(survived / 60)}:${(survived % 60).toString().padStart(2, '0')}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`Kills: ${this.kills}`, this.canvas.width / 2, this.canvas.height / 2 + 35);
    this.ctx.fillText(`Level: ${this.player.level}`, this.canvas.width / 2, this.canvas.height / 2 + 70);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText('Clique para voltar ao menu', this.canvas.width / 2, this.canvas.height / 2 + 120);
  }

  drawVictory() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('VITORIA!', this.canvas.width / 2, this.canvas.height / 2 - 50);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Voce sobreviveu 10 minutos!', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`Kills: ${this.kills}`, this.canvas.width / 2, this.canvas.height / 2 + 35);
    this.ctx.fillText(`Level Final: ${this.player.level}`, this.canvas.width / 2, this.canvas.height / 2 + 70);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText('Clique para voltar ao menu', this.canvas.width / 2, this.canvas.height / 2 + 120);
  }

  saveProgress() {
    const data = {
      bestTime: Math.max(this.gameTime, parseInt(localStorage.getItem('survivors_bestTime') || '0')),
      bestKills: Math.max(this.kills, parseInt(localStorage.getItem('survivors_bestKills') || '0')),
      totalKills: (parseInt(localStorage.getItem('survivors_totalKills') || '0')) + this.kills,
      gamesPlayed: (parseInt(localStorage.getItem('survivors_gamesPlayed') || '0')) + 1
    };

    localStorage.setItem('survivors_bestTime', data.bestTime);
    localStorage.setItem('survivors_bestKills', data.bestKills);
    localStorage.setItem('survivors_totalKills', data.totalKills);
    localStorage.setItem('survivors_gamesPlayed', data.gamesPlayed);

    // Send XP to parent
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'gameScore',
        game: 'survivors-eai',
        score: this.kills,
        xp: Math.floor(this.kills / 10)
      }, '*');
    }
  }

  loadProgress() {
    // Load stats for display
    this.stats = {
      bestTime: parseInt(localStorage.getItem('survivors_bestTime') || '0'),
      bestKills: parseInt(localStorage.getItem('survivors_bestKills') || '0'),
      totalKills: parseInt(localStorage.getItem('survivors_totalKills') || '0'),
      gamesPlayed: parseInt(localStorage.getItem('survivors_gamesPlayed') || '0')
    };
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

// Start game
window.addEventListener('load', () => {
  new SurvivorsGame();
});
