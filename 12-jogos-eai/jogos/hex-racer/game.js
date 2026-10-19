// ============================================
// HEX RACER 3D EAI - Corrida Futurista
// ============================================

class HexRacer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configurações
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Estado do jogo
    this.state = 'menu'; // menu, countdown, racing, finished

    // Configurações da pista pseudo-3D
    this.roadWidth = 2000;
    this.segmentLength = 200;
    this.rumbleLength = 3;
    this.cameraHeight = 1000;
    this.cameraDepth = 0.84;
    this.drawDistance = 300;
    this.fogDensity = 5;

    this.position = 0;
    this.playerX = 0; // -1 a 1 (esquerda a direita)
    this.playerZ = this.cameraHeight * this.cameraDepth;
    this.speed = 0;
    this.maxSpeed = this.segmentLength * 60; // 60 segmentos por segundo
    this.accel = this.maxSpeed / 5;
    this.breaking = -this.maxSpeed;
    this.decel = -this.maxSpeed / 5;
    this.offRoadDecel = -this.maxSpeed / 2;
    this.offRoadLimit = this.maxSpeed / 4;
    this.centrifugal = 0.3;

    // Nitro
    this.nitro = 100;
    this.maxNitro = 100;
    this.nitroRechargeRate = 10;
    this.nitroDrainRate = 30;
    this.nitroBoost = 1.5;
    this.usingNitro = false;

    // Pistas
    this.tracks = [
      {
        id: 'neon-city',
        name: 'Neon City',
        laps: 3,
        length: 500,
        colors: {
          road: '#1a1a2e',
          grass: '#16213e',
          rumble: '#4ECDC4',
          lane: '#4ECDC4',
        },
        difficulty: 'Fácil',
      },
      {
        id: 'cyber-highway',
        name: 'Cyber Highway',
        laps: 3,
        length: 700,
        colors: {
          road: '#0f0f23',
          grass: '#1a0a2e',
          rumble: '#FF6B6B',
          lane: '#FF6B6B',
        },
        difficulty: 'Normal',
      },
      {
        id: 'quantum-loop',
        name: 'Quantum Loop',
        laps: 4,
        length: 1000,
        colors: {
          road: '#0a0a1a',
          grass: '#1a1a0a',
          rumble: '#FFD93D',
          lane: '#FFD93D',
        },
        difficulty: 'Difícil',
      },
    ];

    this.currentTrack = null;
    this.selectedTrackIndex = 0;
    this.segments = [];
    this.cars = [];

    // Veículos
    this.vehicles = [
      { id: 'speedster', name: 'Speedster', color: '#4ECDC4', speed: 1.0, accel: 1.0, handling: 1.0 },
      { id: 'thunder', name: 'Thunder', color: '#FF6B6B', speed: 1.2, accel: 0.9, handling: 0.8 },
      { id: 'phantom', name: 'Phantom', color: '#9B59B6', speed: 0.9, accel: 1.1, handling: 1.2 },
      { id: 'nitro-x', name: 'Nitro-X', color: '#FFD93D', speed: 1.1, accel: 1.0, handling: 0.9 },
    ];
    this.selectedVehicle = 0;
    this.playerVehicle = null;

    // Tempo
    this.raceTime = 0;
    this.lapTimes = [];
    this.currentLap = 0;
    this.bestLapTime = Infinity;
    this.countdown = 3;

    // Controles
    this.keys = {};

    // Efeitos visuais
    this.particles = [];
    this.speedLines = [];

    // EAI
    this.eaiCoins = 0;
    this.eaiXP = 0;
    this.unlockedVehicles = ['speedster'];
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

      if (this.state === 'menu') {
        if (e.key === 'Enter' || e.key === ' ') {
          this.startRace();
        } else if (e.key === 'ArrowLeft') {
          this.selectedTrackIndex = Math.max(0, this.selectedTrackIndex - 1);
        } else if (e.key === 'ArrowRight') {
          this.selectedTrackIndex = Math.min(this.tracks.length - 1, this.selectedTrackIndex + 1);
        } else if (e.key === 'ArrowUp') {
          this.selectedVehicle = Math.max(0, this.selectedVehicle - 1);
        } else if (e.key === 'ArrowDown') {
          this.selectedVehicle = Math.min(this.vehicles.length - 1, this.selectedVehicle + 1);
        }
      }

      if (this.state === 'finished' && (e.key === 'Enter' || e.key === ' ')) {
        this.state = 'menu';
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.state === 'menu') {
        this.startRace();
        return;
      }
      if (this.state === 'finished') {
        this.state = 'menu';
        return;
      }

      const touch = e.touches[0];
      const cx = this.canvas.width / 2;

      if (touch.clientX < cx - 100) {
        this.keys['arrowleft'] = true;
      } else if (touch.clientX > cx + 100) {
        this.keys['arrowright'] = true;
      }

      if (touch.clientY < this.canvas.height / 2) {
        this.keys['arrowup'] = true;
      } else {
        this.keys['shift'] = true; // nitro
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const cx = this.canvas.width / 2;

      this.keys['arrowleft'] = touch.clientX < cx - 50;
      this.keys['arrowright'] = touch.clientX > cx + 50;
    });

    this.canvas.addEventListener('touchend', () => {
      this.keys = {};
    });
  }

  startRace() {
    const vehicle = this.vehicles[this.selectedVehicle];
    if (!this.unlockedVehicles.includes(vehicle.id) && vehicle.id !== 'speedster') {
      return;
    }

    this.state = 'countdown';
    this.countdown = 3;
    this.currentTrack = this.tracks[this.selectedTrackIndex];
    this.playerVehicle = vehicle;

    // Aplicar stats do veículo
    this.maxSpeed = this.segmentLength * 60 * vehicle.speed;
    this.accel = this.maxSpeed / 5 * vehicle.accel;

    // Resetar
    this.position = 0;
    this.playerX = 0;
    this.speed = 0;
    this.nitro = this.maxNitro;
    this.raceTime = 0;
    this.lapTimes = [];
    this.currentLap = 0;
    this.particles = [];
    this.speedLines = [];

    // Gerar pista
    this.generateTrack();

    // Gerar carros IA
    this.generateCars();

    // Começar countdown
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.state = 'racing';
      }
    }, 1000);
  }

  generateTrack() {
    this.segments = [];
    const trackLength = this.currentTrack.length;

    // Tipos de segmentos: reto, curva esquerda, curva direita, subida, descida
    let curve = 0;
    let y = 0;

    for (let i = 0; i < trackLength; i++) {
      // Calcular curva
      if (i % 50 === 0) {
        curve = (Math.random() - 0.5) * 4;
      }
      if (i % 30 === 0 && Math.random() > 0.5) {
        curve = 0;
      }

      // Calcular altura
      const hillType = Math.floor(i / 100) % 3;
      if (hillType === 1) {
        y = Math.sin(i * 0.1) * 1500;
      } else if (hillType === 2) {
        y = Math.sin(i * 0.05) * 800;
      }

      this.segments.push({
        index: i,
        p1: { world: { x: 0, y: y, z: i * this.segmentLength }, camera: {}, screen: {} },
        p2: { world: { x: 0, y: y, z: (i + 1) * this.segmentLength }, camera: {}, screen: {} },
        curve: curve,
        color: {
          road: (Math.floor(i / this.rumbleLength) % 2) ? this.currentTrack.colors.road : '#2a2a4a',
          grass: (Math.floor(i / this.rumbleLength) % 2) ? this.currentTrack.colors.grass : '#0f1f2f',
          rumble: (Math.floor(i / this.rumbleLength) % 2) ? this.currentTrack.colors.rumble : '#fff',
          lane: this.currentTrack.colors.lane,
        },
        sprites: [],
      });

      // Adicionar objetos laterais
      if (Math.random() < 0.1) {
        const side = Math.random() > 0.5 ? 1 : -1;
        this.segments[i].sprites.push({
          type: 'pillar',
          offset: side * (1.2 + Math.random() * 0.5),
          color: this.currentTrack.colors.rumble,
        });
      }
    }

    // Fechar loop
    this.trackLength = trackLength * this.segmentLength;
  }

  generateCars() {
    this.cars = [];

    const carColors = ['#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C', '#F39C12', '#E91E63'];

    for (let i = 0; i < 8; i++) {
      this.cars.push({
        offset: (Math.random() - 0.5) * 1.5,
        z: Math.random() * this.trackLength,
        speed: this.maxSpeed * (0.4 + Math.random() * 0.4),
        color: carColors[i % carColors.length],
        width: 100,
        length: 200,
      });
    }
  }

  update(dt) {
    if (this.state === 'racing') {
      this.updateRace(dt);
    }

    // Atualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt * 2;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Atualizar speed lines
    for (let i = this.speedLines.length - 1; i >= 0; i--) {
      const line = this.speedLines[i];
      line.y += line.speed * dt;
      line.alpha -= dt;
      if (line.alpha <= 0) this.speedLines.splice(i, 1);
    }
  }

  updateRace(dt) {
    const playerSegment = this.findSegment(this.position + this.playerZ);
    const speedPercent = this.speed / this.maxSpeed;
    const dx = dt * 2 * speedPercent;

    // Direção
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.playerX -= dx * this.playerVehicle.handling;
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      this.playerX += dx * this.playerVehicle.handling;
    }

    // Força centrífuga nas curvas
    this.playerX -= dx * speedPercent * playerSegment.curve * this.centrifugal;

    // Limitar posição
    this.playerX = Math.max(-2, Math.min(2, this.playerX));

    // Aceleração
    if (this.keys['arrowup'] || this.keys['w']) {
      this.speed += this.accel * dt;
    } else if (this.keys['arrowdown'] || this.keys['s']) {
      this.speed += this.breaking * dt;
    } else {
      this.speed += this.decel * dt;
    }

    // Nitro
    if ((this.keys['shift'] || this.keys[' ']) && this.nitro > 0) {
      this.usingNitro = true;
      this.speed += this.accel * this.nitroBoost * dt;
      this.nitro -= this.nitroDrainRate * dt;
      this.nitro = Math.max(0, this.nitro);

      // Efeito de nitro
      if (Math.random() > 0.5) {
        this.particles.push({
          x: this.canvas.width / 2 + (Math.random() - 0.5) * 100,
          y: this.canvas.height - 100,
          vx: (Math.random() - 0.5) * 200,
          vy: -200 - Math.random() * 100,
          color: this.playerVehicle.color,
          alpha: 1,
          size: 5 + Math.random() * 5,
        });
      }
    } else {
      this.usingNitro = false;
      this.nitro = Math.min(this.maxNitro, this.nitro + this.nitroRechargeRate * dt);
    }

    // Fora da pista
    if (Math.abs(this.playerX) > 1) {
      if (this.speed > this.offRoadLimit) {
        this.speed += this.offRoadDecel * dt;
      }

      // Partículas de terra
      if (Math.random() > 0.7) {
        this.particles.push({
          x: this.canvas.width / 2 + this.playerX * 100,
          y: this.canvas.height - 80,
          vx: (Math.random() - 0.5) * 100,
          vy: -100 - Math.random() * 50,
          color: '#8B7355',
          alpha: 1,
          size: 3 + Math.random() * 3,
        });
      }
    }

    // Speed lines
    if (speedPercent > 0.7 && Math.random() > 0.8) {
      this.speedLines.push({
        x: Math.random() * this.canvas.width,
        y: 0,
        speed: 800 + speedPercent * 500,
        alpha: 0.5 + speedPercent * 0.5,
        length: 50 + speedPercent * 100,
      });
    }

    // Limitar velocidade
    this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed * (this.usingNitro ? 1.5 : 1)));

    // Atualizar posição
    const oldPosition = this.position;
    this.position += this.speed * dt;

    // Verificar volta
    if (this.position >= this.trackLength) {
      this.position -= this.trackLength;
      this.currentLap++;

      // Salvar tempo da volta
      const lapTime = this.raceTime - this.lapTimes.reduce((a, b) => a + b, 0);
      this.lapTimes.push(lapTime);

      if (lapTime < this.bestLapTime) {
        this.bestLapTime = lapTime;
      }

      // Verificar fim da corrida
      if (this.currentLap >= this.currentTrack.laps) {
        this.finishRace();
        return;
      }
    }

    // Atualizar tempo
    this.raceTime += dt;

    // Atualizar carros IA
    for (const car of this.cars) {
      car.z += car.speed * dt;
      if (car.z >= this.trackLength) car.z -= this.trackLength;

      // Movimento lateral suave
      car.offset += Math.sin(this.raceTime + car.z * 0.001) * 0.001;
      car.offset = Math.max(-1.5, Math.min(1.5, car.offset));

      // Verificar colisão com jogador
      const carSegment = Math.floor(car.z / this.segmentLength);
      const playerSegmentIndex = Math.floor(this.position / this.segmentLength);

      if (Math.abs(carSegment - playerSegmentIndex) < 3) {
        const carX = car.offset;
        if (Math.abs(this.playerX - carX) < 0.3) {
          // Colisão!
          this.speed *= 0.5;
          this.playerX += (this.playerX - carX) * 2;

          // Partículas de colisão
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: this.canvas.width / 2,
              y: this.canvas.height - 100,
              vx: (Math.random() - 0.5) * 300,
              vy: (Math.random() - 0.5) * 300,
              color: '#FFD93D',
              alpha: 1,
              size: 4,
            });
          }
        }
      }
    }
  }

  findSegment(z) {
    return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
  }

  finishRace() {
    this.state = 'finished';

    // Calcular posição
    const totalTime = this.raceTime;
    let position = 1;
    for (const car of this.cars) {
      const carLaps = Math.floor(car.z / this.trackLength);
      if (carLaps >= this.currentTrack.laps) position++;
    }

    this.finalPosition = position;

    // Recompensas
    const baseCoins = position === 1 ? 100 : position === 2 ? 50 : position === 3 ? 25 : 10;
    const baseXP = position === 1 ? 200 : position === 2 ? 100 : position === 3 ? 50 : 25;

    this.eaiCoins += baseCoins;
    this.eaiXP += baseXP;

    // Desbloquear veículos
    if (position <= 2 && !this.unlockedVehicles.includes('thunder')) {
      this.unlockedVehicles.push('thunder');
    }
    if (position === 1 && this.selectedTrackIndex >= 1 && !this.unlockedVehicles.includes('phantom')) {
      this.unlockedVehicles.push('phantom');
    }
    if (position === 1 && this.selectedTrackIndex >= 2 && !this.unlockedVehicles.includes('nitro-x')) {
      this.unlockedVehicles.push('nitro-x');
    }

    this.saveProgress();
  }

  project(point, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
    point.camera.x = (point.world.x || 0) - cameraX;
    point.camera.y = (point.world.y || 0) - cameraY;
    point.camera.z = (point.world.z || 0) - cameraZ;
    point.screen.scale = cameraDepth / point.camera.z;
    point.screen.x = Math.round(width / 2 + point.screen.scale * point.camera.x * width / 2);
    point.screen.y = Math.round(height / 2 - point.screen.scale * point.camera.y * height / 2);
    point.screen.w = Math.round(point.screen.scale * roadWidth * width / 2);
  }

  render() {
    const ctx = this.ctx;

    // Fundo
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.renderMenu();
    } else if (this.state === 'countdown') {
      this.renderRace();
      this.renderCountdown();
    } else if (this.state === 'racing') {
      this.renderRace();
      this.renderHUD();
    } else if (this.state === 'finished') {
      this.renderRace();
      this.renderFinish();
    }
  }

  renderMenu() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Fundo animado
    const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3a');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Linhas de velocidade de fundo
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const x = (performance.now() / 10 + i * 100) % this.canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 50, this.canvas.height);
      ctx.stroke();
    }

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HEX RACER', cx, 100);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText('3D Racing', cx, 135);

    // Stats
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFD93D';
    ctx.fillText(`${this.eaiCoins} Coins | ${this.eaiXP} XP`, cx, 165);

    // Seleção de pista
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Escolha a Pista', cx, 220);

    this.tracks.forEach((track, i) => {
      const x = cx - 200 + i * 200;
      const y = 260;
      const isSelected = i === this.selectedTrackIndex;

      ctx.fillStyle = isSelected ? track.colors.rumble : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = track.colors.rumble;
      ctx.lineWidth = isSelected ? 3 : 1;

      ctx.beginPath();
      ctx.roundRect(x - 80, y, 160, 100, 10);
      ctx.fill();
      if (isSelected) ctx.stroke();

      ctx.fillStyle = isSelected ? '#fff' : '#888';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(track.name, x, y + 35);
      ctx.font = '14px Arial';
      ctx.fillText(`${track.laps} voltas`, x, y + 55);
      ctx.fillText(track.difficulty, x, y + 75);
    });

    // Seleção de veículo
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Escolha o Veículo', cx, 400);

    this.vehicles.forEach((vehicle, i) => {
      const x = cx - 300 + i * 150;
      const y = 430;
      const isSelected = i === this.selectedVehicle;
      const isUnlocked = this.unlockedVehicles.includes(vehicle.id);

      ctx.fillStyle = isSelected ? vehicle.color : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = vehicle.color;
      ctx.lineWidth = isSelected ? 3 : 1;

      ctx.beginPath();
      ctx.roundRect(x - 60, y, 120, 80, 10);
      ctx.fill();
      if (isSelected) ctx.stroke();

      if (!isUnlocked) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('🔒', x, y + 45);
      } else {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(vehicle.name, x, y + 30);

        // Stats
        ctx.font = '11px Arial';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText(`VEL: ${Math.round(vehicle.speed * 100)}%`, x - 50, y + 50);
        ctx.fillText(`ACE: ${Math.round(vehicle.accel * 100)}%`, x - 50, y + 65);
        ctx.textAlign = 'center';
      }
    });

    // Botão jogar
    const vehicle = this.vehicles[this.selectedVehicle];
    const canPlay = this.unlockedVehicles.includes(vehicle.id);

    ctx.fillStyle = canPlay ? '#4ECDC4' : '#555';
    ctx.beginPath();
    ctx.roundRect(cx - 120, this.canvas.height - 120, 240, 60, 30);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(canPlay ? '▶ CORRIDA!' : '🔒 BLOQUEADO', cx, this.canvas.height - 82);

    // Instruções
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('← → para virar | ↑ acelerar | SHIFT nitro', cx, this.canvas.height - 40);
  }

  renderRace() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Céu
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height / 2);
    skyGradient.addColorStop(0, '#0a0a2a');
    skyGradient.addColorStop(1, this.currentTrack.colors.grass);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height / 2);

    // Renderizar pista
    const baseSegment = this.findSegment(this.position);
    const basePercent = (this.position % this.segmentLength) / this.segmentLength;
    let maxy = height;

    let x = 0;
    let dx = -(baseSegment.curve * basePercent);

    for (let n = 0; n < this.drawDistance; n++) {
      const segmentIndex = (baseSegment.index + n) % this.segments.length;
      const segment = this.segments[segmentIndex];

      const looped = segmentIndex < baseSegment.index;
      const camZ = this.position - (looped ? this.trackLength : 0);

      this.project(segment.p1, this.playerX * this.roadWidth - x, this.cameraHeight, camZ, this.cameraDepth, width, height, this.roadWidth);
      this.project(segment.p2, this.playerX * this.roadWidth - x - dx, this.cameraHeight, camZ, this.cameraDepth, width, height, this.roadWidth);

      x += dx;
      dx += segment.curve;

      if (segment.p1.camera.z <= this.cameraDepth || segment.p2.screen.y >= maxy) continue;

      // Renderizar segmento
      this.renderSegment(
        width, segment.color.grass,
        0, segment.p2.screen.y, width, 0, segment.p1.screen.y, width
      );

      this.renderSegment(
        width, segment.color.rumble,
        segment.p1.screen.x - segment.p1.screen.w * 1.2, segment.p1.screen.y, segment.p1.screen.w * 0.2,
        segment.p2.screen.x - segment.p2.screen.w * 1.2, segment.p2.screen.y, segment.p2.screen.w * 0.2
      );

      this.renderSegment(
        width, segment.color.rumble,
        segment.p1.screen.x + segment.p1.screen.w, segment.p1.screen.y, segment.p1.screen.w * 0.2,
        segment.p2.screen.x + segment.p2.screen.w, segment.p2.screen.y, segment.p2.screen.w * 0.2
      );

      this.renderSegment(
        width, segment.color.road,
        segment.p1.screen.x - segment.p1.screen.w, segment.p1.screen.y, segment.p1.screen.w * 2,
        segment.p2.screen.x - segment.p2.screen.w, segment.p2.screen.y, segment.p2.screen.w * 2
      );

      // Linhas centrais
      if (segmentIndex % 6 < 3) {
        this.renderSegment(
          width, segment.color.lane,
          segment.p1.screen.x - segment.p1.screen.w * 0.02, segment.p1.screen.y, segment.p1.screen.w * 0.04,
          segment.p2.screen.x - segment.p2.screen.w * 0.02, segment.p2.screen.y, segment.p2.screen.w * 0.04
        );
      }

      maxy = segment.p2.screen.y;

      // Renderizar sprites (pilares)
      for (const sprite of segment.sprites) {
        const spriteScale = segment.p1.screen.scale;
        const spriteX = segment.p1.screen.x + spriteScale * sprite.offset * width / 2;
        const spriteY = segment.p1.screen.y;
        const spriteW = 30 * spriteScale * width / 1000;
        const spriteH = 200 * spriteScale * height / 1000;

        ctx.fillStyle = sprite.color;
        ctx.fillRect(spriteX - spriteW / 2, spriteY - spriteH, spriteW, spriteH);
      }
    }

    // Renderizar carros IA
    for (const car of this.cars) {
      const carSegment = this.findSegment(car.z);
      const carSegmentIndex = Math.floor(car.z / this.segmentLength);
      const playerSegmentIndex = Math.floor(this.position / this.segmentLength);

      if (carSegmentIndex >= playerSegmentIndex && carSegmentIndex < playerSegmentIndex + this.drawDistance) {
        const segment = this.segments[carSegmentIndex % this.segments.length];
        const percent = (car.z - carSegmentIndex * this.segmentLength) / this.segmentLength;

        const scale = segment.p1.screen.scale * (1 - percent) + (segment.p2?.screen.scale || segment.p1.screen.scale) * percent;
        const carX = segment.p1.screen.x + scale * car.offset * width / 2;
        const carY = segment.p1.screen.y;

        if (carY < height && carY > height / 3 && scale > 0) {
          const carW = car.width * scale;
          const carH = car.length * scale * 0.5;

          ctx.fillStyle = car.color;
          ctx.beginPath();
          ctx.moveTo(carX, carY - carH);
          ctx.lineTo(carX - carW / 2, carY);
          ctx.lineTo(carX + carW / 2, carY);
          ctx.closePath();
          ctx.fill();

          // Detalhe
          ctx.fillStyle = '#fff';
          ctx.fillRect(carX - carW / 4, carY - carH * 0.6, carW / 2, carH * 0.2);
        }
      }
    }

    // Renderizar veículo do jogador
    this.renderPlayerVehicle();

    // Speed lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    for (const line of this.speedLines) {
      ctx.globalAlpha = line.alpha;
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x, line.y + line.length);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Partículas
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  renderSegment(width, color, x1, y1, w1, x2, y2, w2) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x2 + w2, y2);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }

  renderPlayerVehicle() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2 + this.playerX * 100;
    const cy = this.canvas.height - 50;

    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 60, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo do veículo
    ctx.fillStyle = this.playerVehicle.color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 40);
    ctx.lineTo(cx - 40, cy + 10);
    ctx.lineTo(cx - 30, cy + 15);
    ctx.lineTo(cx + 30, cy + 15);
    ctx.lineTo(cx + 40, cy + 10);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 25);
    ctx.lineTo(cx - 15, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.closePath();
    ctx.fill();

    // Efeito de nitro
    if (this.usingNitro) {
      ctx.fillStyle = `rgba(${78}, ${205}, ${196}, ${0.5 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 15);
      ctx.lineTo(cx, cy + 50 + Math.random() * 20);
      ctx.lineTo(cx + 15, cy + 15);
      ctx.closePath();
      ctx.fill();
    }
  }

  renderCountdown() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = this.countdown > 0 ? '#FFD93D' : '#4ECDC4';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.countdown > 0 ? this.countdown : 'GO!', cx, cy);
  }

  renderHUD() {
    const ctx = this.ctx;

    // Velocímetro
    const speedPercent = this.speed / this.maxSpeed;
    const speedKmh = Math.floor(speedPercent * 400);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(20, this.canvas.height - 100, 150, 80, 10);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(speedKmh, 30, this.canvas.height - 50);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('km/h', 120, this.canvas.height - 50);

    // Barra de nitro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, this.canvas.height - 110, 150, 8);

    ctx.fillStyle = this.nitro > 20 ? '#4ECDC4' : '#FFD93D';
    ctx.fillRect(20, this.canvas.height - 110, 150 * (this.nitro / this.maxNitro), 8);

    // Tempo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(this.canvas.width - 170, 20, 150, 80, 10);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(this.formatTime(this.raceTime), this.canvas.width - 30, 55);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText(`Volta ${this.currentLap + 1}/${this.currentTrack.laps}`, this.canvas.width - 30, 80);

    // Posição
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(this.canvas.width / 2 - 60, 20, 120, 50, 10);
    ctx.fill();

    ctx.fillStyle = '#FFD93D';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.getPosition()}º`, this.canvas.width / 2, 55);
  }

  renderFinish() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Posição
    const posColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
    ctx.fillStyle = posColors[this.finalPosition] || '#fff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.finalPosition}º LUGAR`, cx, cy - 80);

    // Tempo total
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(this.formatTime(this.raceTime), cx, cy - 20);

    // Melhor volta
    ctx.font = '20px Arial';
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText(`Melhor volta: ${this.formatTime(this.bestLapTime)}`, cx, cy + 20);

    // Recompensas
    const baseCoins = this.finalPosition === 1 ? 100 : this.finalPosition === 2 ? 50 : this.finalPosition === 3 ? 25 : 10;
    const baseXP = this.finalPosition === 1 ? 200 : this.finalPosition === 2 ? 100 : this.finalPosition === 3 ? 50 : 25;

    ctx.fillStyle = '#FFD93D';
    ctx.fillText(`+${baseCoins} Coins | +${baseXP} XP`, cx, cy + 60);

    // Botão continuar
    ctx.fillStyle = '#4ECDC4';
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + 100, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('CONTINUAR', cx, cy + 132);
  }

  getPosition() {
    let pos = 1;
    for (const car of this.cars) {
      if (car.z > this.position) pos++;
    }
    return pos;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('eai_hex_racer');
      if (saved) {
        const data = JSON.parse(saved);
        this.eaiCoins = data.coins || 0;
        this.eaiXP = data.xp || 0;
        this.unlockedVehicles = data.unlockedVehicles || ['speedster'];
      }
    } catch (e) {}
  }

  saveProgress() {
    try {
      localStorage.setItem('eai_hex_racer', JSON.stringify({
        coins: this.eaiCoins,
        xp: this.eaiXP,
        unlockedVehicles: this.unlockedVehicles,
      }));

      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
          type: 'EAI_GAME_SCORE',
          game: 'hex-racer',
          position: this.finalPosition,
          time: this.raceTime,
          xp: this.eaiXP,
          coins: this.eaiCoins,
        }, '*');
      }
    } catch (e) {}
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
    window.hexRacer = new HexRacer(canvas);
  }
});
