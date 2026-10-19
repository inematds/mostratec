// ============================================
// BATTLE ROYALE 2D EAI - Sobrevivência Intensa
// ============================================

class BattleRoyale {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configurações do canvas
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Estado do jogo
    this.state = 'menu'; // menu, playing, dead, victory
    this.playersAlive = 50;

    // Mundo
    this.worldSize = 2500;
    this.camera = { x: 0, y: 0 };

    // Zona
    this.zone = {
      x: this.worldSize / 2,
      y: this.worldSize / 2,
      radius: this.worldSize / 2,
      targetRadius: this.worldSize / 2,
      shrinkSpeed: 0,
      nextShrinkTime: 0,
      phase: 0,
    };

    // Jogador
    this.player = null;

    // Entidades
    this.bots = [];
    this.bullets = [];
    this.loot = [];
    this.particles = [];
    this.damageNumbers = [];

    // Tipos de armas
    this.weapons = {
      pistol: {
        name: 'Pistola',
        damage: 15,
        fireRate: 400,
        bulletSpeed: 600,
        spread: 0.1,
        ammoType: 'light',
        magSize: 12,
        color: '#FFD93D',
        range: 400,
      },
      smg: {
        name: 'SMG',
        damage: 12,
        fireRate: 80,
        bulletSpeed: 700,
        spread: 0.2,
        ammoType: 'light',
        magSize: 30,
        color: '#6BCB77',
        range: 350,
      },
      rifle: {
        name: 'Rifle',
        damage: 25,
        fireRate: 150,
        bulletSpeed: 900,
        spread: 0.05,
        ammoType: 'medium',
        magSize: 25,
        color: '#4D96FF',
        range: 600,
      },
      shotgun: {
        name: 'Shotgun',
        damage: 10,
        fireRate: 800,
        bulletSpeed: 500,
        spread: 0.3,
        pellets: 8,
        ammoType: 'shells',
        magSize: 6,
        color: '#FF6B6B',
        range: 200,
      },
      sniper: {
        name: 'Sniper',
        damage: 80,
        fireRate: 1500,
        bulletSpeed: 1200,
        spread: 0.01,
        ammoType: 'heavy',
        magSize: 5,
        color: '#9B59B6',
        range: 1000,
      },
    };

    // Tipos de loot
    this.lootTypes = {
      pistol: { type: 'weapon', weapon: 'pistol', color: '#FFD93D', rarity: 'common' },
      smg: { type: 'weapon', weapon: 'smg', color: '#6BCB77', rarity: 'uncommon' },
      rifle: { type: 'weapon', weapon: 'rifle', color: '#4D96FF', rarity: 'rare' },
      shotgun: { type: 'weapon', weapon: 'shotgun', color: '#FF6B6B', rarity: 'rare' },
      sniper: { type: 'weapon', weapon: 'sniper', color: '#9B59B6', rarity: 'epic' },
      lightAmmo: { type: 'ammo', ammoType: 'light', amount: 30, color: '#FFD93D', rarity: 'common' },
      mediumAmmo: { type: 'ammo', ammoType: 'medium', amount: 20, color: '#4D96FF', rarity: 'common' },
      shellAmmo: { type: 'ammo', ammoType: 'shells', amount: 10, color: '#FF6B6B', rarity: 'common' },
      heavyAmmo: { type: 'ammo', ammoType: 'heavy', amount: 10, color: '#9B59B6', rarity: 'uncommon' },
      medkit: { type: 'heal', amount: 50, color: '#FF6B6B', rarity: 'uncommon' },
      shield: { type: 'shield', amount: 50, color: '#4ECDC4', rarity: 'uncommon' },
      bigShield: { type: 'shield', amount: 100, color: '#9B59B6', rarity: 'rare' },
    };

    // Estruturas no mapa
    this.structures = [];

    // Controles
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };

    // Tempo
    this.lastTime = 0;
    this.gameTime = 0;

    // EAI
    this.eaiCoins = 0;
    this.eaiXP = 0;
    this.kills = 0;
    this.loadProgress();

    // Setup
    this.setupControls();
    this.gameLoop(0);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (this.state === 'menu' && (e.key === 'Enter' || e.key === ' ')) {
        this.startGame();
      }

      if ((this.state === 'dead' || this.state === 'victory') && (e.key === 'Enter' || e.key === ' ')) {
        this.state = 'menu';
      }

      // Trocar arma com números
      if (this.state === 'playing' && this.player) {
        if (e.key === '1' && this.player.weapons[0]) {
          this.player.currentWeaponIndex = 0;
        } else if (e.key === '2' && this.player.weapons[1]) {
          this.player.currentWeaponIndex = 1;
        }

        // Usar item de cura (E)
        if (e.key === 'e') {
          this.useHealItem();
        }

        // Recarregar (R)
        if (e.key === 'r') {
          this.reload();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state === 'menu') {
        this.startGame();
        return;
      }

      if (this.state === 'dead' || this.state === 'victory') {
        this.state = 'menu';
        return;
      }

      this.mouse.down = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.down = false;
    });

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.mouse.x = touch.clientX;
      this.mouse.y = touch.clientY;
      this.mouse.down = true;

      if (this.state === 'menu') this.startGame();
      else if (this.state === 'dead' || this.state === 'victory') this.state = 'menu';
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.mouse.x = touch.clientX;
      this.mouse.y = touch.clientY;
    });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.down = false;
    });
  }

  startGame() {
    this.state = 'playing';
    this.gameTime = 0;
    this.kills = 0;
    this.playersAlive = 50;

    // Reset zona
    this.zone = {
      x: this.worldSize / 2,
      y: this.worldSize / 2,
      radius: this.worldSize / 2,
      targetRadius: this.worldSize / 2,
      shrinkSpeed: 0,
      nextShrinkTime: 30000,
      phase: 0,
    };

    // Criar jogador
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = 300 + Math.random() * 500;
    this.player = {
      x: this.worldSize / 2 + Math.cos(spawnAngle) * spawnDist,
      y: this.worldSize / 2 + Math.sin(spawnAngle) * spawnDist,
      radius: 20,
      angle: 0,
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 100,
      speed: 200,
      weapons: [null, null],
      currentWeaponIndex: 0,
      ammo: { light: 30, medium: 0, shells: 0, heavy: 0 },
      lastShot: 0,
      healItems: 0,
      shieldItems: 0,
    };

    // Dar pistola inicial
    this.player.weapons[0] = {
      ...this.weapons.pistol,
      currentAmmo: this.weapons.pistol.magSize,
    };

    // Gerar estruturas
    this.generateStructures();

    // Gerar loot
    this.generateLoot();

    // Gerar bots
    this.generateBots();

    // Limpar
    this.bullets = [];
    this.particles = [];
    this.damageNumbers = [];
  }

  generateStructures() {
    this.structures = [];

    // Cidade central
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const dist = 100 + Math.random() * 200;
      this.structures.push({
        x: this.worldSize / 2 + Math.cos(angle) * dist,
        y: this.worldSize / 2 + Math.sin(angle) * dist,
        width: 60 + Math.random() * 60,
        height: 60 + Math.random() * 60,
        color: '#3a3a5c',
      });
    }

    // Vilarejos espalhados
    const villages = 8;
    for (let v = 0; v < villages; v++) {
      const vAngle = (v / villages) * Math.PI * 2;
      const vDist = 600 + Math.random() * 400;
      const vx = this.worldSize / 2 + Math.cos(vAngle) * vDist;
      const vy = this.worldSize / 2 + Math.sin(vAngle) * vDist;

      for (let i = 0; i < 5; i++) {
        this.structures.push({
          x: vx + (Math.random() - 0.5) * 200,
          y: vy + (Math.random() - 0.5) * 200,
          width: 40 + Math.random() * 40,
          height: 40 + Math.random() * 40,
          color: '#4a4a6a',
        });
      }
    }
  }

  generateLoot() {
    this.loot = [];

    // Loot nos prédios
    for (const struct of this.structures) {
      const lootCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < lootCount; i++) {
        const lootTypes = Object.keys(this.lootTypes);
        const weights = lootTypes.map(t => {
          const rarity = this.lootTypes[t].rarity;
          return rarity === 'common' ? 40 :
                 rarity === 'uncommon' ? 25 :
                 rarity === 'rare' ? 10 : 5;
        });
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let selectedType = lootTypes[0];

        for (let j = 0; j < lootTypes.length; j++) {
          random -= weights[j];
          if (random <= 0) {
            selectedType = lootTypes[j];
            break;
          }
        }

        this.loot.push({
          x: struct.x + (Math.random() - 0.5) * struct.width * 0.8,
          y: struct.y + (Math.random() - 0.5) * struct.height * 0.8,
          ...this.lootTypes[selectedType],
          id: selectedType,
        });
      }
    }

    // Loot aleatório pelo mapa
    for (let i = 0; i < 100; i++) {
      const lootTypes = Object.keys(this.lootTypes);
      const selectedType = lootTypes[Math.floor(Math.random() * lootTypes.length)];

      this.loot.push({
        x: Math.random() * this.worldSize,
        y: Math.random() * this.worldSize,
        ...this.lootTypes[selectedType],
        id: selectedType,
      });
    }
  }

  generateBots() {
    this.bots = [];

    for (let i = 0; i < 49; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 900;

      const weaponTypes = ['pistol', 'smg', 'rifle', 'shotgun'];
      const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];

      this.bots.push({
        x: this.worldSize / 2 + Math.cos(angle) * dist,
        y: this.worldSize / 2 + Math.sin(angle) * dist,
        radius: 20,
        angle: Math.random() * Math.PI * 2,
        health: 100,
        maxHealth: 100,
        shield: Math.random() < 0.3 ? 50 : 0,
        maxShield: 100,
        speed: 150 + Math.random() * 50,
        weapon: { ...this.weapons[weaponType], currentAmmo: this.weapons[weaponType].magSize },
        lastShot: 0,
        target: null,
        state: 'wander',
        stateTime: 0,
        wanderAngle: Math.random() * Math.PI * 2,
        skill: 0.3 + Math.random() * 0.5,
        name: this.generateBotName(),
      });
    }
  }

  generateBotName() {
    const prefixes = ['Pro', 'Noob', 'Elite', 'Shadow', 'Dark', 'Neo', 'Cyber', 'Ultra', 'Mega', 'Super'];
    const names = ['Gamer', 'Player', 'Sniper', 'Hunter', 'Killer', 'Master', 'Legend', 'King', 'Queen', 'Boss'];
    const numbers = ['', '123', '007', '360', 'XX', '99', '2024', '', '', ''];

    return prefixes[Math.floor(Math.random() * prefixes.length)] +
           names[Math.floor(Math.random() * names.length)] +
           numbers[Math.floor(Math.random() * numbers.length)];
  }

  useHealItem() {
    if (!this.player) return;

    if (this.player.healItems > 0 && this.player.health < this.player.maxHealth) {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
      this.player.healItems--;

      this.particles.push({
        x: this.player.x,
        y: this.player.y - 30,
        text: '+50 HP',
        color: '#FF6B6B',
        alpha: 1,
        vy: -1,
      });
    } else if (this.player.shieldItems > 0 && this.player.shield < this.player.maxShield) {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 50);
      this.player.shieldItems--;

      this.particles.push({
        x: this.player.x,
        y: this.player.y - 30,
        text: '+50 Shield',
        color: '#4ECDC4',
        alpha: 1,
        vy: -1,
      });
    }
  }

  reload() {
    if (!this.player) return;

    const weapon = this.player.weapons[this.player.currentWeaponIndex];
    if (!weapon) return;

    const neededAmmo = weapon.magSize - weapon.currentAmmo;
    const availableAmmo = this.player.ammo[weapon.ammoType];
    const ammoToLoad = Math.min(neededAmmo, availableAmmo);

    if (ammoToLoad > 0) {
      weapon.currentAmmo += ammoToLoad;
      this.player.ammo[weapon.ammoType] -= ammoToLoad;
    }
  }

  update(dt) {
    if (this.state !== 'playing') return;

    this.gameTime += dt * 1000;

    // Atualizar jogador
    this.updatePlayer(dt);

    // Atualizar zona
    this.updateZone(dt);

    // Atualizar bots
    this.updateBots(dt);

    // Atualizar balas
    this.updateBullets(dt);

    // Coletar loot
    this.collectLoot();

    // Atualizar partículas
    this.updateParticles(dt);

    // Verificar dano da zona
    this.checkZoneDamage(dt);

    // Verificar fim de jogo
    if (this.player && this.player.health <= 0) {
      this.endGame(false);
    }

    if (this.bots.length === 0 && this.player && this.player.health > 0) {
      this.endGame(true);
    }
  }

  updatePlayer(dt) {
    if (!this.player) return;

    // Movimento
    let dx = 0, dy = 0;
    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      const newX = this.player.x + dx * this.player.speed * dt;
      const newY = this.player.y + dy * this.player.speed * dt;

      if (!this.checkStructureCollision(newX, newY, this.player.radius)) {
        this.player.x = Math.max(0, Math.min(this.worldSize, newX));
        this.player.y = Math.max(0, Math.min(this.worldSize, newY));
      }
    }

    // Direção do mouse
    const worldMouseX = this.mouse.x - this.canvas.width / 2 + this.camera.x;
    const worldMouseY = this.mouse.y - this.canvas.height / 2 + this.camera.y;
    this.player.angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);

    // Atirar
    if (this.mouse.down) {
      this.playerShoot();
    }

    // Atualizar câmera
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
  }

  playerShoot() {
    const weapon = this.player.weapons[this.player.currentWeaponIndex];
    if (!weapon) return;

    const now = performance.now();
    if (now - this.player.lastShot < weapon.fireRate) return;
    if (weapon.currentAmmo <= 0) {
      this.reload();
      return;
    }

    this.player.lastShot = now;
    weapon.currentAmmo--;

    const pellets = weapon.pellets || 1;
    for (let i = 0; i < pellets; i++) {
      const spread = (Math.random() - 0.5) * weapon.spread * 2;
      const angle = this.player.angle + spread;

      this.bullets.push({
        x: this.player.x + Math.cos(angle) * 25,
        y: this.player.y + Math.sin(angle) * 25,
        vx: Math.cos(angle) * weapon.bulletSpeed,
        vy: Math.sin(angle) * weapon.bulletSpeed,
        damage: weapon.damage,
        owner: 'player',
        color: weapon.color,
        range: weapon.range,
        distTraveled: 0,
      });
    }

    // Efeito de tiro
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.player.x + Math.cos(this.player.angle) * 30,
        y: this.player.y + Math.sin(this.player.angle) * 30,
        vx: Math.cos(this.player.angle + (Math.random() - 0.5)) * 100,
        vy: Math.sin(this.player.angle + (Math.random() - 0.5)) * 100,
        color: weapon.color,
        alpha: 1,
        size: 3,
      });
    }
  }

  updateZone(dt) {
    // Verificar próxima fase
    if (this.gameTime >= this.zone.nextShrinkTime && this.zone.phase < 5) {
      this.zone.phase++;

      const phases = [
        { radiusMult: 0.7, shrinkTime: 30000, waitTime: 45000 },
        { radiusMult: 0.5, shrinkTime: 25000, waitTime: 40000 },
        { radiusMult: 0.3, shrinkTime: 20000, waitTime: 35000 },
        { radiusMult: 0.15, shrinkTime: 15000, waitTime: 30000 },
        { radiusMult: 0, shrinkTime: 10000, waitTime: 25000 },
      ];

      const phase = phases[this.zone.phase - 1];
      this.zone.targetRadius = this.worldSize / 2 * phase.radiusMult;
      this.zone.shrinkSpeed = (this.zone.radius - this.zone.targetRadius) / (phase.shrinkTime / 1000);
      this.zone.nextShrinkTime = this.gameTime + phase.waitTime;

      // Mover centro ligeiramente
      this.zone.x += (Math.random() - 0.5) * 100;
      this.zone.y += (Math.random() - 0.5) * 100;
      this.zone.x = Math.max(this.zone.targetRadius + 100, Math.min(this.worldSize - this.zone.targetRadius - 100, this.zone.x));
      this.zone.y = Math.max(this.zone.targetRadius + 100, Math.min(this.worldSize - this.zone.targetRadius - 100, this.zone.y));
    }

    // Encolher zona
    if (this.zone.radius > this.zone.targetRadius) {
      this.zone.radius = Math.max(this.zone.targetRadius, this.zone.radius - this.zone.shrinkSpeed * dt);
    }
  }

  updateBots(dt) {
    for (const bot of this.bots) {
      // Atualizar estado
      bot.stateTime -= dt * 1000;

      // Verificar se vê o jogador ou outro bot
      let nearestEnemy = null;
      let nearestDist = bot.weapon.range;

      // Verificar jogador
      if (this.player) {
        const distToPlayer = Math.hypot(this.player.x - bot.x, this.player.y - bot.y);
        if (distToPlayer < nearestDist) {
          nearestEnemy = this.player;
          nearestDist = distToPlayer;
        }
      }

      // Verificar outros bots
      for (const other of this.bots) {
        if (other === bot) continue;
        const dist = Math.hypot(other.x - bot.x, other.y - bot.y);
        if (dist < nearestDist && Math.random() < 0.3) {
          nearestEnemy = other;
          nearestDist = dist;
        }
      }

      if (nearestEnemy && bot.stateTime <= 0) {
        bot.state = 'combat';
        bot.target = nearestEnemy;
        bot.stateTime = 2000;
      } else if (bot.stateTime <= 0) {
        bot.state = 'wander';
        bot.wanderAngle += (Math.random() - 0.5) * Math.PI / 2;
        bot.stateTime = 2000 + Math.random() * 3000;
      }

      // Comportamento baseado no estado
      if (bot.state === 'combat' && bot.target) {
        // Mirar no alvo
        const targetAngle = Math.atan2(bot.target.y - bot.y, bot.target.x - bot.x);
        const angleDiff = ((targetAngle - bot.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        bot.angle += angleDiff * dt * 5;

        // Manter distância
        const dist = Math.hypot(bot.target.x - bot.x, bot.target.y - bot.y);
        const optimalDist = bot.weapon.range * 0.6;

        if (dist > optimalDist + 50) {
          // Aproximar
          const moveAngle = Math.atan2(bot.target.y - bot.y, bot.target.x - bot.x);
          const newX = bot.x + Math.cos(moveAngle) * bot.speed * dt;
          const newY = bot.y + Math.sin(moveAngle) * bot.speed * dt;
          if (!this.checkStructureCollision(newX, newY, bot.radius)) {
            bot.x = newX;
            bot.y = newY;
          }
        } else if (dist < optimalDist - 50) {
          // Afastar
          const moveAngle = Math.atan2(bot.y - bot.target.y, bot.x - bot.target.x);
          const newX = bot.x + Math.cos(moveAngle) * bot.speed * 0.5 * dt;
          const newY = bot.y + Math.sin(moveAngle) * bot.speed * 0.5 * dt;
          if (!this.checkStructureCollision(newX, newY, bot.radius)) {
            bot.x = newX;
            bot.y = newY;
          }
        }

        // Atirar
        if (Math.abs(angleDiff) < 0.3 && Math.random() < bot.skill) {
          this.botShoot(bot);
        }
      } else {
        // Vagar
        const newX = bot.x + Math.cos(bot.wanderAngle) * bot.speed * 0.5 * dt;
        const newY = bot.y + Math.sin(bot.wanderAngle) * bot.speed * 0.5 * dt;

        if (!this.checkStructureCollision(newX, newY, bot.radius) &&
            newX > 50 && newX < this.worldSize - 50 &&
            newY > 50 && newY < this.worldSize - 50) {
          bot.x = newX;
          bot.y = newY;
        } else {
          bot.wanderAngle += Math.PI;
        }

        // Ir para a zona se estiver fora
        const distToZone = Math.hypot(bot.x - this.zone.x, bot.y - this.zone.y);
        if (distToZone > this.zone.radius - 100) {
          bot.wanderAngle = Math.atan2(this.zone.y - bot.y, this.zone.x - bot.x);
        }
      }
    }
  }

  botShoot(bot) {
    const now = performance.now();
    if (now - bot.lastShot < bot.weapon.fireRate) return;
    if (bot.weapon.currentAmmo <= 0) {
      bot.weapon.currentAmmo = bot.weapon.magSize;
      return;
    }

    bot.lastShot = now;
    bot.weapon.currentAmmo--;

    const spread = (Math.random() - 0.5) * bot.weapon.spread * 2 * (1 - bot.skill * 0.5);
    const angle = bot.angle + spread;

    const pellets = bot.weapon.pellets || 1;
    for (let i = 0; i < pellets; i++) {
      const pelletSpread = (Math.random() - 0.5) * bot.weapon.spread * 2;

      this.bullets.push({
        x: bot.x + Math.cos(angle) * 25,
        y: bot.y + Math.sin(angle) * 25,
        vx: Math.cos(angle + pelletSpread) * bot.weapon.bulletSpeed,
        vy: Math.sin(angle + pelletSpread) * bot.weapon.bulletSpeed,
        damage: bot.weapon.damage,
        owner: bot,
        color: bot.weapon.color,
        range: bot.weapon.range,
        distTraveled: 0,
      });
    }
  }

  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      const dx = bullet.vx * dt;
      const dy = bullet.vy * dt;
      bullet.x += dx;
      bullet.y += dy;
      bullet.distTraveled += Math.hypot(dx, dy);

      // Verificar colisão com estruturas
      if (this.checkStructureCollision(bullet.x, bullet.y, 3)) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Verificar alcance
      if (bullet.distTraveled > bullet.range) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Verificar colisão com jogador
      if (bullet.owner !== 'player' && this.player) {
        if (Math.hypot(bullet.x - this.player.x, bullet.y - this.player.y) < this.player.radius) {
          this.damageEntity(this.player, bullet.damage);
          this.bullets.splice(i, 1);
          continue;
        }
      }

      // Verificar colisão com bots
      for (let j = this.bots.length - 1; j >= 0; j--) {
        const bot = this.bots[j];
        if (bullet.owner === bot) continue;

        if (Math.hypot(bullet.x - bot.x, bullet.y - bot.y) < bot.radius) {
          this.damageEntity(bot, bullet.damage, bullet.owner === 'player');

          if (bot.health <= 0) {
            if (bullet.owner === 'player') {
              this.kills++;
              this.eaiCoins += 5;
              this.eaiXP += 20;
            }
            this.bots.splice(j, 1);
            this.playersAlive--;

            // Dropar loot
            const lootCount = 2 + Math.floor(Math.random() * 3);
            for (let k = 0; k < lootCount; k++) {
              const lootTypes = Object.keys(this.lootTypes);
              const selectedType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
              this.loot.push({
                x: bot.x + (Math.random() - 0.5) * 30,
                y: bot.y + (Math.random() - 0.5) * 30,
                ...this.lootTypes[selectedType],
                id: selectedType,
              });
            }
          }

          this.bullets.splice(i, 1);
          break;
        }
      }
    }
  }

  damageEntity(entity, damage, showNumber = true) {
    // Primeiro danificar o escudo
    if (entity.shield > 0) {
      const shieldDamage = Math.min(entity.shield, damage);
      entity.shield -= shieldDamage;
      damage -= shieldDamage;

      if (showNumber) {
        this.damageNumbers.push({
          x: entity.x,
          y: entity.y - 30,
          text: `-${shieldDamage}`,
          color: '#4ECDC4',
          alpha: 1,
          vy: -2,
        });
      }
    }

    // Depois danificar a vida
    if (damage > 0) {
      entity.health = Math.max(0, entity.health - damage);

      if (showNumber) {
        this.damageNumbers.push({
          x: entity.x + (Math.random() - 0.5) * 20,
          y: entity.y - 40,
          text: `-${damage}`,
          color: '#FF6B6B',
          alpha: 1,
          vy: -2,
        });
      }
    }

    // Partículas de sangue
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: entity.x,
        y: entity.y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        color: '#FF6B6B',
        alpha: 1,
        size: 3 + Math.random() * 3,
      });
    }
  }

  collectLoot() {
    if (!this.player) return;

    for (let i = this.loot.length - 1; i >= 0; i--) {
      const item = this.loot[i];
      const dist = Math.hypot(item.x - this.player.x, item.y - this.player.y);

      if (dist < 40) {
        let collected = false;
        let message = '';

        if (item.type === 'weapon') {
          // Trocar arma se slot vazio ou pressionar F
          if (!this.player.weapons[0]) {
            this.player.weapons[0] = { ...this.weapons[item.weapon], currentAmmo: this.weapons[item.weapon].magSize };
            collected = true;
            message = `+${this.weapons[item.weapon].name}`;
          } else if (!this.player.weapons[1]) {
            this.player.weapons[1] = { ...this.weapons[item.weapon], currentAmmo: this.weapons[item.weapon].magSize };
            collected = true;
            message = `+${this.weapons[item.weapon].name}`;
          }
        } else if (item.type === 'ammo') {
          this.player.ammo[item.ammoType] += item.amount;
          collected = true;
          message = `+${item.amount} munição`;
        } else if (item.type === 'heal') {
          this.player.healItems++;
          collected = true;
          message = '+Medkit';
        } else if (item.type === 'shield') {
          this.player.shieldItems++;
          collected = true;
          message = '+Escudo';
        }

        if (collected) {
          this.loot.splice(i, 1);

          this.particles.push({
            x: this.player.x,
            y: this.player.y - 40,
            text: message,
            color: item.color,
            alpha: 1,
            vy: -1,
          });
        }
      }
    }
  }

  checkZoneDamage(dt) {
    // Jogador
    if (this.player) {
      const dist = Math.hypot(this.player.x - this.zone.x, this.player.y - this.zone.y);
      if (dist > this.zone.radius) {
        const damage = (5 + this.zone.phase * 3) * dt;
        this.player.health -= damage;
      }
    }

    // Bots
    for (const bot of this.bots) {
      const dist = Math.hypot(bot.x - this.zone.x, bot.y - this.zone.y);
      if (dist > this.zone.radius) {
        bot.health -= (5 + this.zone.phase * 2) * dt;
        if (bot.health <= 0) {
          this.playersAlive--;
        }
      }
    }

    this.bots = this.bots.filter(b => b.health > 0);
  }

  checkStructureCollision(x, y, radius) {
    for (const struct of this.structures) {
      const closestX = Math.max(struct.x - struct.width / 2, Math.min(x, struct.x + struct.width / 2));
      const closestY = Math.max(struct.y - struct.height / 2, Math.min(y, struct.y + struct.height / 2));

      if (Math.hypot(x - closestX, y - closestY) < radius) {
        return true;
      }
    }
    return false;
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.vx !== undefined) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.95;
        p.vy *= 0.95;
      }
      if (p.vy !== undefined && p.text) {
        p.y += p.vy;
      }
      p.alpha -= dt * 2;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Números de dano
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.y += d.vy;
      d.alpha -= 0.02;

      if (d.alpha <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  endGame(victory) {
    this.state = victory ? 'victory' : 'dead';

    // Recompensas
    if (victory) {
      this.eaiCoins += 100;
      this.eaiXP += 200;
    }

    this.eaiCoins += this.kills * 5;
    this.eaiXP += this.kills * 10;

    this.saveProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('eai_battle_royale');
      if (saved) {
        const data = JSON.parse(saved);
        this.eaiCoins = data.coins || 0;
        this.eaiXP = data.xp || 0;
      }
    } catch (e) {}
  }

  saveProgress() {
    try {
      localStorage.setItem('eai_battle_royale', JSON.stringify({
        coins: this.eaiCoins,
        xp: this.eaiXP,
      }));

      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
          type: 'EAI_GAME_SCORE',
          game: 'battle-royale',
          kills: this.kills,
          xp: this.eaiXP,
          coins: this.eaiCoins,
        }, '*');
      }
    } catch (e) {}
  }

  render() {
    const ctx = this.ctx;

    ctx.fillStyle = '#1a2634';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.renderMenu();
    } else if (this.state === 'playing') {
      this.renderGame();
    } else if (this.state === 'dead' || this.state === 'victory') {
      this.renderEndScreen();
    }
  }

  renderMenu() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Fundo
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(this.canvas.width, this.canvas.height));
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#1a2634');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BATTLE ROYALE', cx, cy - 100);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText('EAI Games', cx, cy - 60);

    // Stats
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFD93D';
    ctx.fillText(`${this.eaiCoins} Coins | ${this.eaiXP} XP`, cx, cy - 20);

    // Botão jogar
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.roundRect(cx - 120, cy + 20, 240, 60, 30);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('JOGAR', cx, cy + 58);

    // Instruções
    ctx.font = '16px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('WASD para mover | Mouse para mirar e atirar', cx, cy + 120);
    ctx.fillText('1/2 trocar arma | E usar item | R recarregar', cx, cy + 145);
  }

  renderGame() {
    const ctx = this.ctx;

    // Salvar contexto e aplicar câmera
    ctx.save();
    ctx.translate(this.canvas.width / 2 - this.camera.x, this.canvas.height / 2 - this.camera.y);

    // Fundo do mundo
    ctx.fillStyle = '#1a2634';
    ctx.fillRect(0, 0, this.worldSize, this.worldSize);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.worldSize; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.worldSize);
      ctx.stroke();
    }
    for (let y = 0; y <= this.worldSize; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.worldSize, y);
      ctx.stroke();
    }

    // Zona fora
    ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.beginPath();
    ctx.rect(0, 0, this.worldSize, this.worldSize);
    ctx.arc(this.zone.x, this.zone.y, this.zone.radius, 0, Math.PI * 2, true);
    ctx.fill();

    // Borda da zona
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.zone.x, this.zone.y, this.zone.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Próxima zona
    if (this.zone.radius > this.zone.targetRadius) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.arc(this.zone.x, this.zone.y, this.zone.targetRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Estruturas
    for (const struct of this.structures) {
      ctx.fillStyle = struct.color;
      ctx.fillRect(struct.x - struct.width / 2, struct.y - struct.height / 2, struct.width, struct.height);
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 2;
      ctx.strokeRect(struct.x - struct.width / 2, struct.y - struct.height / 2, struct.width, struct.height);
    }

    // Loot
    for (const item of this.loot) {
      ctx.fillStyle = item.color;
      ctx.globalAlpha = 0.8 + Math.sin(performance.now() / 200) * 0.2;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Brilho
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Balas
    for (const bullet of this.bullets) {
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bots
    for (const bot of this.bots) {
      this.renderEntity(bot, '#E74C3C');
    }

    // Jogador
    if (this.player) {
      this.renderEntity(this.player, '#4ECDC4');
    }

    // Partículas
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      if (p.text) {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Números de dano
    for (const d of this.damageNumbers) {
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(d.text, d.x, d.y);
    }

    ctx.globalAlpha = 1;
    ctx.restore();

    // HUD
    this.renderHUD();
  }

  renderEntity(entity, baseColor) {
    const ctx = this.ctx;

    // Corpo
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
    ctx.fill();

    // Direção (arma)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(entity.x, entity.y);
    ctx.lineTo(
      entity.x + Math.cos(entity.angle) * (entity.radius + 15),
      entity.y + Math.sin(entity.angle) * (entity.radius + 15)
    );
    ctx.stroke();

    // Barra de vida
    const barWidth = 40;
    const barHeight = 6;
    const barY = entity.y - entity.radius - 15;

    // Fundo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(entity.x - barWidth / 2, barY, barWidth, barHeight);

    // Vida
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(entity.x - barWidth / 2, barY, barWidth * (entity.health / entity.maxHealth), barHeight);

    // Escudo
    if (entity.shield > 0) {
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(entity.x - barWidth / 2, barY - 4, barWidth * (entity.shield / entity.maxShield), 3);
    }
  }

  renderHUD() {
    const ctx = this.ctx;

    // Vida e Escudo
    const hudX = 20;
    const hudY = this.canvas.height - 100;

    // Barra de vida
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(hudX, hudY, 200, 25);

    if (this.player) {
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(hudX, hudY, 200 * (this.player.health / this.player.maxHealth), 25);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(this.player.health)} HP`, hudX + 100, hudY + 18);

      // Barra de escudo
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(hudX, hudY + 30, 200, 20);

      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(hudX, hudY + 30, 200 * (this.player.shield / this.player.maxShield), 20);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`${Math.floor(this.player.shield)} Shield`, hudX + 100, hudY + 45);

      // Arma atual
      const weapon = this.player.weapons[this.player.currentWeaponIndex];
      if (weapon) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(hudX, hudY + 55, 200, 40);

        ctx.fillStyle = weapon.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(weapon.name, hudX + 10, hudY + 75);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(`${weapon.currentAmmo}/${this.player.ammo[weapon.ammoType]}`, hudX + 190, hudY + 75);

        // Slots de arma
        ctx.textAlign = 'left';
        ctx.font = '12px Arial';
        ctx.fillStyle = this.player.currentWeaponIndex === 0 ? '#4ECDC4' : '#666';
        ctx.fillText(`[1] ${this.player.weapons[0]?.name || 'Vazio'}`, hudX + 10, hudY + 90);
        ctx.fillStyle = this.player.currentWeaponIndex === 1 ? '#4ECDC4' : '#666';
        ctx.fillText(`[2] ${this.player.weapons[1]?.name || 'Vazio'}`, hudX + 110, hudY + 90);
      }

      // Itens
      ctx.fillStyle = '#FF6B6B';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Medkits: ${this.player.healItems}`, hudX + 210, hudY + 18);
      ctx.fillStyle = '#4ECDC4';
      ctx.fillText(`Escudos: ${this.player.shieldItems}`, hudX + 210, hudY + 38);
      ctx.fillStyle = '#888';
      ctx.font = '12px Arial';
      ctx.fillText('[E] Usar', hudX + 210, hudY + 55);
    }

    // Jogadores vivos e kills (canto superior direito)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${this.playersAlive} Vivos`, this.canvas.width - 20, 40);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFD93D';
    ctx.fillText(`${this.kills} Kills`, this.canvas.width - 20, 65);

    // Minimap (canto superior esquerdo)
    const mapSize = 150;
    const mapX = 20;
    const mapY = 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);

    // Zona no minimapa
    const scale = mapSize / this.worldSize;
    ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);

    ctx.fillStyle = '#1a2634';
    ctx.beginPath();
    ctx.arc(
      mapX + this.zone.x * scale,
      mapY + this.zone.y * scale,
      this.zone.radius * scale,
      0, Math.PI * 2
    );
    ctx.fill();

    // Estruturas no minimapa
    ctx.fillStyle = '#555';
    for (const struct of this.structures) {
      ctx.fillRect(
        mapX + struct.x * scale - 2,
        mapY + struct.y * scale - 2,
        4, 4
      );
    }

    // Bots no minimapa (vermelho)
    ctx.fillStyle = '#E74C3C';
    for (const bot of this.bots) {
      ctx.beginPath();
      ctx.arc(mapX + bot.x * scale, mapY + bot.y * scale, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Jogador no minimapa
    if (this.player) {
      ctx.fillStyle = '#4ECDC4';
      ctx.beginPath();
      ctx.arc(mapX + this.player.x * scale, mapY + this.player.y * scale, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tempo até próxima zona
    if (this.zone.phase < 5) {
      const timeLeft = Math.max(0, this.zone.nextShrinkTime - this.gameTime) / 1000;
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Zona ${this.zone.phase + 1} em ${Math.floor(timeLeft)}s`, mapX + mapSize / 2, mapY + mapSize + 20);
    }
  }

  renderEndScreen() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Fundo escuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Resultado
    ctx.fillStyle = this.state === 'victory' ? '#4ECDC4' : '#FF6B6B';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.state === 'victory' ? 'VITORIA!' : 'ELIMINADO', cx, cy - 80);

    // Posição
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`#${this.playersAlive}`, cx, cy - 30);

    // Stats
    ctx.font = '24px Arial';
    ctx.fillStyle = '#FFD93D';
    ctx.fillText(`${this.kills} Eliminações`, cx, cy + 20);

    // Recompensas
    ctx.font = '20px Arial';
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText(`+${this.kills * 5 + (this.state === 'victory' ? 100 : 0)} Coins`, cx - 80, cy + 60);
    ctx.fillText(`+${this.kills * 10 + (this.state === 'victory' ? 200 : 0)} XP`, cx + 80, cy + 60);

    // Botão continuar
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + 100, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('CONTINUAR', cx, cy + 132);
  }

  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Inicialização
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    window.battleRoyale = new BattleRoyale(canvas);
  }
});
