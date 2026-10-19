// Racing Thunder 3D - EAI Games
// Jogo de corrida pseudo-3D para adolescentes

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class RacingThunder {
  constructor() {
    this.state = 'menu';
    this.coins = parseInt(localStorage.getItem('eai_racing_coins') || '1000');
    this.diamonds = parseInt(localStorage.getItem('eai_racing_diamonds') || '10');
    this.xp = parseInt(localStorage.getItem('eai_racing_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_racing_level') || '1');
    this.totalRaces = parseInt(localStorage.getItem('eai_racing_races') || '0');
    this.totalWins = parseInt(localStorage.getItem('eai_racing_wins') || '0');

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_racing_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Racing Thunder!', lines: ['Acelere fundo e domine', 'as pistas mais perigosas!'], emoji: '🏎️' },
      { title: 'Controles', lines: ['Toque ou use ← → para', 'mover seu carro!'], emoji: '🕹️' },
      { title: 'Nitro Boost', lines: ['Colete nitro azul para', 'aumentar sua velocidade!'], emoji: '💨' },
      { title: 'Cuidado!', lines: ['Evite outros carros e', 'obstáculos na pista!'], emoji: '⚠️' },
      { title: 'Garagem', lines: ['Desbloqueie carros novos', 'e melhore suas stats!'], emoji: '🔧' }
    ];

    // Cars
    this.cars = [
      { id: 'starter', name: 'Iniciante', emoji: '🚗', color: '#ff4444', speed: 1.0, handling: 1.0, nitro: 1.0, unlocked: true, price: 0 },
      { id: 'sport', name: 'Esportivo', emoji: '🏎️', color: '#ff8800', speed: 1.2, handling: 1.1, nitro: 1.0, unlocked: false, price: 500 },
      { id: 'muscle', name: 'Muscle Car', emoji: '🚘', color: '#4444ff', speed: 1.3, handling: 0.9, nitro: 1.3, unlocked: false, price: 1000 },
      { id: 'supercar', name: 'Super Carro', emoji: '🏎️', color: '#ffff00', speed: 1.5, handling: 1.2, nitro: 1.1, unlocked: false, price: 2000 },
      { id: 'racing', name: 'Fórmula', emoji: '🏁', color: '#00ff00', speed: 1.7, handling: 1.3, nitro: 1.2, unlocked: false, price: 5000 },
      { id: 'hyper', name: 'Hyper Car', emoji: '⚡', color: '#ff00ff', speed: 2.0, handling: 1.5, nitro: 1.5, unlocked: false, price: 10000 }
    ];
    this.loadCars();
    this.selectedCar = this.cars[0];

    // Tracks
    this.tracks = [
      { id: 'city', name: 'Cidade', emoji: '🏙️', difficulty: 1, baseReward: 100, unlocked: true },
      { id: 'highway', name: 'Rodovia', emoji: '🛣️', difficulty: 2, baseReward: 200, unlocked: true },
      { id: 'desert', name: 'Deserto', emoji: '🏜️', difficulty: 3, baseReward: 300, unlocked: false },
      { id: 'mountain', name: 'Montanha', emoji: '⛰️', difficulty: 4, baseReward: 500, unlocked: false },
      { id: 'night', name: 'Noturna', emoji: '🌙', difficulty: 5, baseReward: 750, unlocked: false },
      { id: 'storm', name: 'Tempestade', emoji: '⛈️', difficulty: 6, baseReward: 1000, unlocked: false }
    ];
    this.loadTracks();
    this.currentTrack = null;

    // Race state
    this.playerX = 0;
    this.playerY = 0;
    this.speed = 0;
    this.maxSpeed = 10;
    this.targetLane = 1;
    this.nitroAmount = 0;
    this.nitroActive = false;
    this.distance = 0;
    this.raceDistance = 5000;
    this.obstacles = [];
    this.powerUps = [];
    this.roadSegments = [];

    // Upgrades
    this.upgrades = {
      engine: parseInt(localStorage.getItem('eai_racing_engine') || '1'),
      tires: parseInt(localStorage.getItem('eai_racing_tires') || '1'),
      nitro: parseInt(localStorage.getItem('eai_racing_nitroupgrade') || '1')
    };

    // Achievements
    this.achievements = [
      { id: 'first_race', name: 'Piloto Novato', desc: 'Complete sua primeira corrida', icon: '🏎️', unlocked: false },
      { id: 'first_win', name: 'Primeira Vitória', desc: 'Vença sua primeira corrida', icon: '🏆', unlocked: false },
      { id: 'races_10', name: 'Experiente', desc: 'Complete 10 corridas', icon: '🎮', unlocked: false },
      { id: 'wins_10', name: 'Campeão', desc: 'Vença 10 corridas', icon: '🥇', unlocked: false },
      { id: 'car_3', name: 'Colecionador', desc: 'Desbloqueie 3 carros', icon: '🚗', unlocked: false },
      { id: 'car_all', name: 'Garagem Completa', desc: 'Desbloqueie todos os carros', icon: '🏁', unlocked: false },
      { id: 'nitro_master', name: 'Nitro Master', desc: 'Use nitro 50 vezes', icon: '💨', unlocked: false },
      { id: 'level_20', name: 'Lenda', desc: 'Alcance nível 20', icon: '⭐', unlocked: false }
    ];
    this.loadAchievements();
    this.nitroUsed = parseInt(localStorage.getItem('eai_racing_nitroused') || '0');

    // Visual effects
    this.particles = [];
    this.screenShake = 0;

    // Controls
    this.touchStartX = 0;
    this.moveLeft = false;
    this.moveRight = false;

    this.setupEventListeners();
    this.gameLoop();
  }

  loadCars() {
    const saved = JSON.parse(localStorage.getItem('eai_racing_cars') || 'null');
    if (saved) {
      saved.forEach(s => {
        const car = this.cars.find(c => c.id === s.id);
        if (car) car.unlocked = s.unlocked;
      });
    }
  }

  saveCars() {
    const data = this.cars.map(c => ({ id: c.id, unlocked: c.unlocked }));
    localStorage.setItem('eai_racing_cars', JSON.stringify(data));
  }

  loadTracks() {
    const saved = JSON.parse(localStorage.getItem('eai_racing_tracks') || 'null');
    if (saved) {
      saved.forEach(s => {
        const track = this.tracks.find(t => t.id === s.id);
        if (track) track.unlocked = s.unlocked;
      });
    }
  }

  saveTracks() {
    const data = this.tracks.map(t => ({ id: t.id, unlocked: t.unlocked }));
    localStorage.setItem('eai_racing_tracks', JSON.stringify(data));
  }

  loadAchievements() {
    const saved = JSON.parse(localStorage.getItem('eai_racing_achievements') || '[]');
    this.achievements.forEach(a => a.unlocked = saved.includes(a.id));
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_racing_achievements', JSON.stringify(unlocked));
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

  setupEventListeners() {
    canvas.addEventListener('click', (e) => this.handleClick(e));

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;

      if (this.state === 'racing') {
        const w = canvas.width;
        if (touch.clientX < w * 0.3) {
          this.moveLeft = true;
        } else if (touch.clientX > w * 0.7) {
          this.moveRight = true;
        } else {
          // Center - use nitro
          if (this.nitroAmount >= 30) {
            this.activateNitro();
          }
        }
      } else {
        this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
      }
    });

    canvas.addEventListener('touchend', (e) => {
      this.moveLeft = false;
      this.moveRight = false;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.state === 'racing') {
        const touch = e.touches[0];
        const w = canvas.width;
        if (touch.clientX < w * 0.3) {
          this.moveLeft = true;
          this.moveRight = false;
        } else if (touch.clientX > w * 0.7) {
          this.moveRight = true;
          this.moveLeft = false;
        } else {
          this.moveLeft = false;
          this.moveRight = false;
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (this.state === 'racing') {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.moveLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') this.moveRight = true;
        if (e.key === ' ' && this.nitroAmount >= 30) this.activateNitro();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.moveLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this.moveRight = false;
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
        localStorage.setItem('eai_racing_tutorial_seen', 'true');
      }
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    if (this.state === 'menu') this.handleMenuClick(x, y, w, h);
    else if (this.state === 'tracks') this.handleTracksClick(x, y, w, h);
    else if (this.state === 'garage') this.handleGarageClick(x, y, w, h);
    else if (this.state === 'upgrades') this.handleUpgradesClick(x, y, w, h);
    else if (this.state === 'achievements') {
      if (x < 80 && y < 50) this.state = 'menu';
    }
    else if (this.state === 'result') {
      this.state = 'menu';
    }
  }

  handleMenuClick(x, y, w, h) {
    // Race button
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 - 60 && y < h/2) {
      this.state = 'tracks';
    }
    // Garage
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 10 && y < h/2 + 70) {
      this.state = 'garage';
    }
    // Upgrades
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 80 && y < h/2 + 140) {
      this.state = 'upgrades';
    }
    // Achievements
    if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 150 && y < h/2 + 210) {
      this.state = 'achievements';
    }
  }

  handleTracksClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.tracks.forEach((track, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = 20 + col * itemWidth;
      const ty = 130 + row * 120;

      if (track.unlocked && x > tx && x < tx + itemWidth - 10 && y > ty && y < ty + 100) {
        this.currentTrack = track;
        this.startRace();
      }
    });
  }

  handleGarageClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.cars.forEach((car, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = 20 + col * itemWidth;
      const cy = 130 + row * 140;

      if (x > cx && x < cx + itemWidth - 10 && y > cy && y < cy + 120) {
        if (car.unlocked) {
          this.selectedCar = car;
        } else if (this.coins >= car.price) {
          this.coins -= car.price;
          car.unlocked = true;
          this.selectedCar = car;
          this.saveCars();
          this.save();

          const unlockedCount = this.cars.filter(c => c.unlocked).length;
          if (unlockedCount >= 3) this.checkAchievement('car_3');
          if (unlockedCount >= this.cars.length) this.checkAchievement('car_all');
        }
      }
    });
  }

  handleUpgradesClick(x, y, w, h) {
    if (x < 80 && y < 50) {
      this.state = 'menu';
      return;
    }

    const upgrades = [
      { key: 'engine', name: 'Motor', icon: '🔧', desc: '+10% velocidade' },
      { key: 'tires', name: 'Pneus', icon: '🛞', desc: '+10% controle' },
      { key: 'nitro', name: 'Nitro', icon: '💨', desc: '+10% boost' }
    ];

    upgrades.forEach((upgrade, i) => {
      const uy = 160 + i * 100;
      const level = this.upgrades[upgrade.key];
      const cost = level * 200;

      if (y > uy && y < uy + 80 && x > w - 140 && x < w - 20) {
        if (level < 10 && this.coins >= cost) {
          this.coins -= cost;
          this.upgrades[upgrade.key]++;
          localStorage.setItem(`eai_racing_${upgrade.key}`, this.upgrades[upgrade.key].toString());
          this.save();
        }
      }
    });
  }

  startRace() {
    this.state = 'racing';

    // Reset race state
    this.playerX = 0;
    this.playerY = canvas.height * 0.7;
    this.speed = 0;
    this.distance = 0;
    this.nitroAmount = 0;
    this.nitroActive = false;
    this.obstacles = [];
    this.powerUps = [];
    this.roadSegments = [];
    this.lastObstacleZ = 0;
    this.lastPowerUpZ = 0;

    // Calculate max speed based on car + upgrades
    const car = this.selectedCar;
    this.maxSpeed = 10 * car.speed * (1 + this.upgrades.engine * 0.1);
    this.handling = 8 * car.handling * (1 + this.upgrades.tires * 0.1);
    this.nitroBoost = 1.5 * car.nitro * (1 + this.upgrades.nitro * 0.1);

    // Race distance based on track difficulty
    this.raceDistance = 5000 + this.currentTrack.difficulty * 2000;

    // Initialize road
    for (let i = 0; i < 200; i++) {
      this.roadSegments.push({
        z: i * 50,
        curve: Math.sin(i * 0.02) * 2
      });
    }
  }

  activateNitro() {
    if (this.nitroAmount >= 30 && !this.nitroActive) {
      this.nitroActive = true;
      this.nitroAmount -= 30;
      this.nitroUsed++;
      localStorage.setItem('eai_racing_nitroused', this.nitroUsed.toString());

      if (this.nitroUsed >= 50) this.checkAchievement('nitro_master');

      // Nitro effect
      setTimeout(() => {
        this.nitroActive = false;
      }, 3000);
    }
  }

  updateRacing() {
    const w = canvas.width;
    const h = canvas.height;

    // Accelerate
    const targetSpeed = this.nitroActive ? this.maxSpeed * this.nitroBoost : this.maxSpeed;
    this.speed += (targetSpeed - this.speed) * 0.02;

    // Move player
    const laneWidth = w * 0.15;
    if (this.moveLeft) {
      this.playerX -= this.handling;
    }
    if (this.moveRight) {
      this.playerX += this.handling;
    }

    // Clamp player position
    const roadWidth = w * 0.4;
    this.playerX = Math.max(-roadWidth/2 + 30, Math.min(roadWidth/2 - 30, this.playerX));

    // Update distance
    this.distance += this.speed;

    // Spawn obstacles
    if (this.distance - this.lastObstacleZ > 300 + Math.random() * 200) {
      this.obstacles.push({
        x: (Math.random() - 0.5) * (roadWidth - 60),
        z: this.distance + 3000,
        type: Math.random() < 0.3 ? 'barrier' : 'car',
        lane: Math.floor(Math.random() * 3) - 1
      });
      this.lastObstacleZ = this.distance;
    }

    // Spawn power-ups
    if (this.distance - this.lastPowerUpZ > 800 + Math.random() * 400) {
      this.powerUps.push({
        x: (Math.random() - 0.5) * (roadWidth - 60),
        z: this.distance + 3000,
        type: Math.random() < 0.7 ? 'nitro' : 'coin'
      });
      this.lastPowerUpZ = this.distance;
    }

    // Update obstacles
    this.obstacles = this.obstacles.filter(obs => {
      obs.z -= this.speed;

      // Collision check
      const obsScreenZ = obs.z - this.distance;
      if (obsScreenZ < 100 && obsScreenZ > 0) {
        const dx = Math.abs(this.playerX - obs.x);
        if (dx < 50) {
          // Crash!
          this.speed *= 0.3;
          this.screenShake = 20;

          // Particles
          for (let i = 0; i < 20; i++) {
            this.particles.push({
              x: w/2 + this.playerX,
              y: h * 0.7,
              vx: (Math.random() - 0.5) * 15,
              vy: -Math.random() * 10,
              size: Math.random() * 10 + 5,
              color: '#ff4444',
              life: 40
            });
          }
          return false;
        }
      }

      return obs.z > this.distance - 100;
    });

    // Update power-ups
    this.powerUps = this.powerUps.filter(pu => {
      pu.z -= this.speed;

      const puScreenZ = pu.z - this.distance;
      if (puScreenZ < 100 && puScreenZ > 0) {
        const dx = Math.abs(this.playerX - pu.x);
        if (dx < 60) {
          // Collect!
          if (pu.type === 'nitro') {
            this.nitroAmount = Math.min(100, this.nitroAmount + 35);
          } else {
            this.coins += 10;
          }

          // Particles
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: w/2 + pu.x,
              y: h * 0.7,
              vx: (Math.random() - 0.5) * 8,
              vy: -Math.random() * 8,
              size: Math.random() * 8 + 4,
              color: pu.type === 'nitro' ? '#00aaff' : '#ffd700',
              life: 30
            });
          }
          return false;
        }
      }

      return pu.z > this.distance - 100;
    });

    // Nitro particles
    if (this.nitroActive) {
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: w/2 + this.playerX + (Math.random() - 0.5) * 30,
          y: h * 0.75,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 5 + 5,
          size: Math.random() * 12 + 6,
          color: ['#00aaff', '#ff8800', '#ffff00'][Math.floor(Math.random() * 3)],
          life: 20
        });
      }
    }

    // Screen shake decay
    if (this.screenShake > 0) this.screenShake--;

    // Check race completion
    if (this.distance >= this.raceDistance) {
      this.finishRace(true);
    }
  }

  finishRace(won) {
    this.state = 'result';
    this.raceWon = won;
    this.totalRaces++;
    localStorage.setItem('eai_racing_races', this.totalRaces.toString());

    if (won) {
      this.totalWins++;
      localStorage.setItem('eai_racing_wins', this.totalWins.toString());

      // Calculate rewards
      const baseReward = this.currentTrack.baseReward;
      const speedBonus = Math.floor(this.speed * 10);
      this.raceReward = baseReward + speedBonus;
      this.coins += this.raceReward;
      this.addXP(50 + this.currentTrack.difficulty * 20);

      // Unlock next track
      const currentIndex = this.tracks.indexOf(this.currentTrack);
      if (currentIndex < this.tracks.length - 1) {
        this.tracks[currentIndex + 1].unlocked = true;
        this.saveTracks();
      }

      this.checkAchievement('first_win');
      if (this.totalWins >= 10) this.checkAchievement('wins_10');
    }

    this.checkAchievement('first_race');
    if (this.totalRaces >= 10) this.checkAchievement('races_10');

    this.save();
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 200;
    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 5;
      if (this.level >= 20) this.checkAchievement('level_20');
    }
  }

  save() {
    localStorage.setItem('eai_racing_coins', this.coins.toString());
    localStorage.setItem('eai_racing_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_racing_xp', this.xp.toString());
    localStorage.setItem('eai_racing_level', this.level.toString());
  }

  update() {
    if (this.state === 'racing') {
      this.updateRacing();
    }

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
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

    if (this.state === 'racing') {
      this.drawRacing();
    } else {
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#0a0a1a');
      gradient.addColorStop(1, '#050510');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      if (this.showTutorial) {
        this.drawTutorial();
        return;
      }

      if (this.state === 'menu') this.drawMenu();
      else if (this.state === 'tracks') this.drawTracks();
      else if (this.state === 'garage') this.drawGarage();
      else if (this.state === 'upgrades') this.drawUpgrades();
      else if (this.state === 'achievements') this.drawAchievements();
      else if (this.state === 'result') this.drawResult();
    }

    // Particles (for all states)
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / 40;
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

    ctx.fillStyle = '#0a0a1a';
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

    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🏎️ RACING THUNDER 🏎️', w/2, 60);

    // Stats
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${this.coins}`, 20, 30);
    ctx.fillText(`💎 ${this.diamonds}`, 120, 30);
    ctx.fillText(`⭐ Nv.${this.level}`, 210, 30);
    ctx.fillText(`🏆 ${this.totalWins}/${this.totalRaces}`, 300, 30);

    // Selected car
    ctx.textAlign = 'center';
    ctx.font = '50px Arial';
    ctx.fillText(this.selectedCar.emoji, w/2, h/3 + 20);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(this.selectedCar.name, w/2, h/3 + 50);

    // Buttons
    const buttons = [
      { text: '🏁 Corrida', y: h/2 - 60 },
      { text: '🚗 Garagem', y: h/2 + 10 },
      { text: '⬆️ Upgrades', y: h/2 + 80 },
      { text: '🏆 Conquistas', y: h/2 + 150 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#1a1a2e';
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

  drawTracks() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🏁 ESCOLHA A PISTA 🏁', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Carro: ${this.selectedCar.emoji} ${this.selectedCar.name}`, w/2, 100);

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.tracks.forEach((track, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 120;

      if (y > h - 50) return;

      ctx.fillStyle = track.unlocked ? '#1a1a2e' : '#111';
      ctx.globalAlpha = track.unlocked ? 1 : 0.5;
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 100, 10);
      ctx.fill();

      ctx.strokeStyle = track.unlocked ? '#ff4500' : '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(track.emoji, x + itemWidth/2 - 5, y + 45);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(track.name, x + itemWidth/2 - 5, y + 70);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`🏆 ${track.baseReward} moedas`, x + itemWidth/2 - 5, y + 88);

      if (!track.unlocked) {
        ctx.fillStyle = '#666';
        ctx.font = '20px Arial';
        ctx.fillText('🔒', x + itemWidth/2 - 5, y + 50);
      }
      ctx.globalAlpha = 1;
    });
  }

  drawGarage() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🚗 GARAGEM 🚗', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`🪙 ${this.coins}`, w/2, 100);

    const cols = Math.min(3, Math.floor((w - 40) / 180));
    const itemWidth = (w - 40) / cols;

    this.cars.forEach((car, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 130 + row * 140;

      if (y > h - 50) return;

      const isSelected = car === this.selectedCar;

      ctx.fillStyle = car.unlocked ? (isSelected ? '#2a3a4a' : '#1a1a2e') : '#111';
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth - 10, 120, 10);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (car.unlocked) {
        ctx.strokeStyle = '#ff4500';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = car.unlocked ? 1 : 0.5;
      ctx.fillText(car.emoji, x + itemWidth/2 - 5, y + 40);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(car.name, x + itemWidth/2 - 5, y + 65);

      ctx.font = '11px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`🔥${(car.speed * 100).toFixed(0)}% 🎯${(car.handling * 100).toFixed(0)}% 💨${(car.nitro * 100).toFixed(0)}%`, x + itemWidth/2 - 5, y + 82);

      if (car.unlocked) {
        if (isSelected) {
          ctx.fillStyle = '#00ff00';
          ctx.font = 'bold 12px Arial';
          ctx.fillText('✓ SELECIONADO', x + itemWidth/2 - 5, y + 105);
        }
      } else {
        ctx.fillStyle = this.coins >= car.price ? '#ffd700' : '#666';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`🪙 ${car.price}`, x + itemWidth/2 - 5, y + 105);
      }
      ctx.globalAlpha = 1;
    });
  }

  drawUpgrades() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ff4500';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4500';
    ctx.fillText('⬆️ UPGRADES ⬆️', w/2, 70);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`🪙 ${this.coins}`, w/2, 100);

    const upgrades = [
      { key: 'engine', name: 'Motor', icon: '🔧', desc: '+10% velocidade' },
      { key: 'tires', name: 'Pneus', icon: '🛞', desc: '+10% controle' },
      { key: 'nitro', name: 'Nitro', icon: '💨', desc: '+10% boost' }
    ];

    upgrades.forEach((upgrade, i) => {
      const y = 140 + i * 100;
      const level = this.upgrades[upgrade.key];
      const cost = level * 200;

      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.roundRect(20, y, w - 40, 80, 10);
      ctx.fill();

      ctx.font = '40px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(upgrade.icon, 40, y + 55);

      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(upgrade.name, 100, y + 35);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(upgrade.desc, 100, y + 55);

      // Level bar
      ctx.fillStyle = '#333';
      ctx.fillRect(100, y + 60, 150, 10);
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(100, y + 60, 150 * (level / 10), 10);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`Nv.${level}/10`, 260, y + 70);

      // Upgrade button
      if (level < 10) {
        ctx.fillStyle = this.coins >= cost ? '#4a4' : '#333';
        ctx.beginPath();
        ctx.roundRect(w - 130, y + 20, 100, 40, 8);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`🪙 ${cost}`, w - 80, y + 45);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MÁXIMO', w - 80, y + 45);
      }
    });
  }

  drawRacing() {
    const w = canvas.width;
    const h = canvas.height;

    // Apply screen shake
    ctx.save();
    if (this.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.screenShake,
        (Math.random() - 0.5) * this.screenShake
      );
    }

    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    if (this.currentTrack.id === 'night' || this.currentTrack.id === 'storm') {
      skyGradient.addColorStop(0, '#0a0a1a');
      skyGradient.addColorStop(1, '#1a1a3e');
    } else {
      skyGradient.addColorStop(0, '#4a90d9');
      skyGradient.addColorStop(1, '#87ceeb');
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, h * 0.4);

    // Ground
    const groundGradient = ctx.createLinearGradient(0, h * 0.4, 0, h);
    if (this.currentTrack.id === 'desert') {
      groundGradient.addColorStop(0, '#c2b280');
      groundGradient.addColorStop(1, '#8b7355');
    } else {
      groundGradient.addColorStop(0, '#228b22');
      groundGradient.addColorStop(1, '#006400');
    }
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, h * 0.4, w, h * 0.6);

    // Road (pseudo-3D)
    const roadWidth = w * 0.4;
    const horizonY = h * 0.4;

    for (let i = 0; i < 100; i++) {
      const z = i * 20;
      const scale = 1000 / (z + 100);
      const y = horizonY + (h * 0.6) * (1 - 1 / (z * 0.01 + 1));

      const segmentWidth = roadWidth * scale;
      const x = w / 2 - segmentWidth / 2;

      // Road stripes
      const stripePattern = Math.floor((this.distance + z) / 50) % 2;

      ctx.fillStyle = stripePattern ? '#333' : '#444';
      ctx.fillRect(x, y, segmentWidth, 10 * scale);

      // Road lines
      ctx.fillStyle = stripePattern ? '#fff' : '#333';
      ctx.fillRect(w/2 - 2 * scale, y, 4 * scale, 10 * scale);
    }

    // Draw obstacles
    this.obstacles.forEach(obs => {
      const z = obs.z - this.distance;
      if (z > 0 && z < 3000) {
        const scale = 1000 / (z + 100);
        const screenX = w/2 + obs.x * scale;
        const screenY = h * 0.4 + (h * 0.6) * (1 - 1 / (z * 0.01 + 1));
        const size = 60 * scale;

        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(obs.type === 'barrier' ? '🚧' : '🚗', screenX, screenY);
      }
    });

    // Draw power-ups
    this.powerUps.forEach(pu => {
      const z = pu.z - this.distance;
      if (z > 0 && z < 3000) {
        const scale = 1000 / (z + 100);
        const screenX = w/2 + pu.x * scale;
        const screenY = h * 0.4 + (h * 0.6) * (1 - 1 / (z * 0.01 + 1));
        const size = 40 * scale;

        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(pu.type === 'nitro' ? '💨' : '🪙', screenX, screenY);
      }
    });

    // Draw player car
    const carX = w/2 + this.playerX;
    const carY = h * 0.75;

    // Car shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + 30, 40, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car body
    ctx.fillStyle = this.selectedCar.color;
    ctx.beginPath();
    ctx.roundRect(carX - 30, carY - 20, 60, 50, 10);
    ctx.fill();

    // Car details
    ctx.fillStyle = '#222';
    ctx.fillRect(carX - 25, carY - 15, 50, 20);
    ctx.fillStyle = '#88ccff';
    ctx.fillRect(carX - 20, carY - 10, 40, 15);

    // Nitro flames
    if (this.nitroActive) {
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔥', carX - 10, carY + 45);
      ctx.fillText('🔥', carX + 10, carY + 45);
    }

    ctx.restore();

    // HUD
    // Speed
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 120, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('VELOCIDADE', 20, 30);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`${Math.floor(this.speed * 20)} km/h`, 20, 52);

    // Distance/Progress
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(w - 130, 10, 120, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('PROGRESSO', w - 20, 30);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`${Math.floor(this.distance / this.raceDistance * 100)}%`, w - 20, 52);

    // Nitro bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(w/2 - 100, 10, 200, 30, 10);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.fillRect(w/2 - 90, 18, 180, 14);
    ctx.fillStyle = this.nitroAmount >= 30 ? '#00aaff' : '#005588';
    ctx.fillRect(w/2 - 90, 18, 180 * (this.nitroAmount / 100), 14);

    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(`💨 NITRO ${this.nitroAmount >= 30 ? '- TOQUE CENTRAL' : ''}`, w/2, 30);

    // Controls hint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← ESQUERDA', 20, h - 20);
    ctx.textAlign = 'right';
    ctx.fillText('DIREITA →', w - 20, h - 20);
  }

  drawResult() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = this.raceWon ? 'rgba(0, 50, 0, 0.9)' : 'rgba(50, 0, 0, 0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.raceWon ? '#ffd700' : '#ff4444';
    ctx.fillText(this.raceWon ? '🏆 VITÓRIA! 🏆' : '💥 TENTE NOVAMENTE 💥', w/2, h/3);

    if (this.raceWon) {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Recompensas:', w/2, h/2 - 30);

      ctx.font = '18px Arial';
      ctx.fillText(`🪙 +${this.raceReward} moedas`, w/2, h/2 + 10);
      ctx.fillText(`⭐ +XP`, w/2, h/2 + 40);
    } else {
      ctx.font = '18px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Pratique mais e tente novamente!', w/2, h/2);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '16px Arial';
    ctx.fillText('Toque para continuar', w/2, h - 60);
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

      ctx.fillStyle = a.unlocked ? '#1a1a2e' : '#111';
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

const game = new RacingThunder();
