// ============================================
// RHYTHM BATTLE EAI - Jogo de Ritmo Musical
// ============================================

class RhythmBattle {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configurações do canvas
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Estado do jogo
    this.state = 'menu'; // menu, playing, paused, results
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.health = 100;
    this.perfect = 0;
    this.great = 0;
    this.good = 0;
    this.miss = 0;

    // Configurações de gameplay
    this.noteSpeed = 400; // pixels por segundo
    this.hitLineY = 0; // Definido no resize
    this.noteWidth = 60;
    this.noteHeight = 30;

    // Zonas de acerto (em pixels do hitLine)
    this.hitZones = {
      perfect: 20,
      great: 40,
      good: 70,
    };

    // Notas ativas
    this.notes = [];
    this.noteIndex = 0;

    // Colunas (4 teclas)
    this.columns = [
      { key: 'ArrowLeft', altKey: 'a', name: '←', color: '#FF6B6B', x: 0, pressed: false },
      { key: 'ArrowDown', altKey: 's', name: '↓', color: '#4ECDC4', x: 0, pressed: false },
      { key: 'ArrowUp', altKey: 'w', name: '↑', color: '#45B7D1', x: 0, pressed: false },
      { key: 'ArrowRight', altKey: 'd', name: '→', color: '#96CEB4', x: 0, pressed: false },
    ];

    // Partículas de efeito
    this.particles = [];
    this.hitEffects = [];

    // Músicas/Níveis
    this.songs = [
      {
        id: 'tutorial',
        name: 'Tutorial Beat',
        artist: 'EAI Music',
        bpm: 100,
        difficulty: 'Fácil',
        color: '#4ECDC4',
        pattern: this.generatePattern(100, 30, 'easy'),
      },
      {
        id: 'neon-nights',
        name: 'Neon Nights',
        artist: 'EAI Beats',
        bpm: 120,
        difficulty: 'Normal',
        color: '#FF6B6B',
        pattern: this.generatePattern(120, 45, 'normal'),
      },
      {
        id: 'cyber-rush',
        name: 'Cyber Rush',
        artist: 'Digital Dreams',
        bpm: 140,
        difficulty: 'Difícil',
        color: '#9B59B6',
        pattern: this.generatePattern(140, 60, 'hard'),
      },
      {
        id: 'pixel-storm',
        name: 'Pixel Storm',
        artist: 'Retro Wave',
        bpm: 160,
        difficulty: 'Expert',
        color: '#E74C3C',
        pattern: this.generatePattern(160, 80, 'expert'),
      },
      {
        id: 'final-boss',
        name: 'Final Boss',
        artist: 'EAI Orchestra',
        bpm: 180,
        difficulty: 'Insano',
        color: '#8E44AD',
        pattern: this.generatePattern(180, 100, 'insane'),
      },
    ];

    this.currentSong = null;
    this.selectedSongIndex = 0;
    this.songStartTime = 0;
    this.songDuration = 0;

    // Audio context para sons
    this.audioCtx = null;

    // Animação
    this.lastTime = 0;
    this.animationFrame = null;
    this.beatPulse = 0;

    // EAI Integration
    this.eaiCoins = 0;
    this.eaiXP = 0;
    this.unlockedSongs = ['tutorial', 'neon-nights'];
    this.loadProgress();

    // Controles
    this.setupControls();

    // Iniciar loop
    this.gameLoop(0);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Calcular posições das colunas
    const totalWidth = this.noteWidth * 4 + 30 * 3; // 4 notas + 3 espaços
    const startX = (this.canvas.width - totalWidth) / 2;

    this.columns.forEach((col, i) => {
      col.x = startX + i * (this.noteWidth + 30);
    });

    this.hitLineY = this.canvas.height - 150;
  }

  generatePattern(bpm, noteCount, difficulty) {
    const pattern = [];
    const beatInterval = 60000 / bpm; // ms por batida
    let time = 2000; // 2 segundos de delay inicial

    const difficultySettings = {
      easy: { doubleChance: 0, tripleChance: 0, holdChance: 0 },
      normal: { doubleChance: 0.15, tripleChance: 0, holdChance: 0.1 },
      hard: { doubleChance: 0.25, tripleChance: 0.1, holdChance: 0.15 },
      expert: { doubleChance: 0.3, tripleChance: 0.15, holdChance: 0.2 },
      insane: { doubleChance: 0.35, tripleChance: 0.2, holdChance: 0.25 },
    };

    const settings = difficultySettings[difficulty];

    for (let i = 0; i < noteCount; i++) {
      const rand = Math.random();

      if (rand < settings.tripleChance) {
        // 3 notas simultâneas
        const cols = this.shuffleArray([0, 1, 2, 3]).slice(0, 3);
        cols.forEach(col => {
          pattern.push({ time, column: col, type: 'tap' });
        });
      } else if (rand < settings.tripleChance + settings.doubleChance) {
        // 2 notas simultâneas
        const cols = this.shuffleArray([0, 1, 2, 3]).slice(0, 2);
        cols.forEach(col => {
          pattern.push({ time, column: col, type: 'tap' });
        });
      } else {
        // 1 nota
        const col = Math.floor(Math.random() * 4);
        const type = Math.random() < settings.holdChance ? 'hold' : 'tap';
        pattern.push({
          time,
          column: col,
          type,
          duration: type === 'hold' ? beatInterval * 2 : 0
        });
      }

      // Variação no timing
      const variation = difficulty === 'easy' ? 1 :
                       difficulty === 'normal' ? 0.75 :
                       difficulty === 'hard' ? 0.5 : 0.25;
      time += beatInterval * (0.5 + Math.random() * variation);
    }

    return pattern;
  }

  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  setupControls() {
    // Teclado
    window.addEventListener('keydown', (e) => {
      if (this.state === 'menu') {
        if (e.key === 'Enter' || e.key === ' ') {
          this.startSong();
        } else if (e.key === 'ArrowUp' || e.key === 'w') {
          this.selectedSongIndex = Math.max(0, this.selectedSongIndex - 1);
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          this.selectedSongIndex = Math.min(this.songs.length - 1, this.selectedSongIndex + 1);
        }
        return;
      }

      if (this.state === 'results') {
        if (e.key === 'Enter' || e.key === ' ') {
          this.state = 'menu';
        }
        return;
      }

      if (this.state === 'playing') {
        if (e.key === 'Escape') {
          this.state = 'paused';
          return;
        }

        const col = this.columns.find(c => c.key === e.key || c.altKey === e.key.toLowerCase());
        if (col && !col.pressed) {
          col.pressed = true;
          this.checkHit(this.columns.indexOf(col));
        }
      }

      if (this.state === 'paused') {
        if (e.key === 'Escape' || e.key === 'Enter') {
          this.state = 'playing';
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const col = this.columns.find(c => c.key === e.key || c.altKey === e.key.toLowerCase());
      if (col) {
        col.pressed = false;
      }
    });

    // Touch/Click
    this.canvas.addEventListener('mousedown', (e) => this.handleTouch(e.clientX, e.clientY, true));
    this.canvas.addEventListener('mouseup', (e) => this.handleTouch(e.clientX, e.clientY, false));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const touch of e.touches) {
        this.handleTouch(touch.clientX, touch.clientY, true);
      }
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.columns.forEach(c => c.pressed = false);
    });
  }

  handleTouch(x, y, isDown) {
    if (this.state === 'menu') {
      if (isDown) {
        // Verificar clique em música
        const songListY = this.canvas.height / 2 - 100;
        this.songs.forEach((song, i) => {
          const songY = songListY + i * 70;
          if (y >= songY && y <= songY + 60 && x > this.canvas.width / 2 - 200 && x < this.canvas.width / 2 + 200) {
            this.selectedSongIndex = i;
          }
        });

        // Verificar botão play
        const playBtnY = this.canvas.height - 120;
        if (y >= playBtnY - 30 && y <= playBtnY + 30) {
          this.startSong();
        }
      }
      return;
    }

    if (this.state === 'results' && isDown) {
      this.state = 'menu';
      return;
    }

    if (this.state === 'playing' && isDown) {
      // Verificar qual coluna foi tocada
      this.columns.forEach((col, i) => {
        if (x >= col.x && x <= col.x + this.noteWidth && y >= this.hitLineY - 100) {
          col.pressed = true;
          this.checkHit(i);
          setTimeout(() => col.pressed = false, 100);
        }
      });
    }
  }

  startSong() {
    const song = this.songs[this.selectedSongIndex];

    // Verificar se está desbloqueada
    if (!this.unlockedSongs.includes(song.id)) {
      return;
    }

    this.currentSong = song;
    this.state = 'playing';
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.health = 100;
    this.perfect = 0;
    this.great = 0;
    this.good = 0;
    this.miss = 0;
    this.notes = [];
    this.noteIndex = 0;
    this.particles = [];
    this.hitEffects = [];

    // Regenerar padrão para variedade
    this.currentSong.pattern = this.generatePattern(
      song.bpm,
      song.difficulty === 'Fácil' ? 30 :
      song.difficulty === 'Normal' ? 45 :
      song.difficulty === 'Difícil' ? 60 :
      song.difficulty === 'Expert' ? 80 : 100,
      song.difficulty === 'Fácil' ? 'easy' :
      song.difficulty === 'Normal' ? 'normal' :
      song.difficulty === 'Difícil' ? 'hard' :
      song.difficulty === 'Expert' ? 'expert' : 'insane'
    );

    this.songStartTime = performance.now();
    this.songDuration = this.currentSong.pattern[this.currentSong.pattern.length - 1].time + 3000;

    // Calcular velocidade baseada na dificuldade
    this.noteSpeed = 300 + song.bpm;

    // Iniciar áudio context
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Tocar som de início
    this.playSound(440, 0.1, 'sine');
    setTimeout(() => this.playSound(554, 0.1, 'sine'), 100);
    setTimeout(() => this.playSound(659, 0.1, 'sine'), 200);
  }

  playSound(freq, duration, type = 'square') {
    if (!this.audioCtx) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    oscillator.frequency.value = freq;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    oscillator.start(this.audioCtx.currentTime);
    oscillator.stop(this.audioCtx.currentTime + duration);
  }

  checkHit(columnIndex) {
    const currentTime = performance.now() - this.songStartTime;

    // Encontrar nota mais próxima nesta coluna
    let closestNote = null;
    let closestDist = Infinity;

    for (const note of this.notes) {
      if (note.column === columnIndex && !note.hit && !note.missed) {
        const noteY = this.calculateNoteY(note.time, currentTime);
        const dist = Math.abs(noteY - this.hitLineY);

        if (dist < closestDist && dist < this.hitZones.good + 30) {
          closestDist = dist;
          closestNote = note;
        }
      }
    }

    if (closestNote) {
      const noteY = this.calculateNoteY(closestNote.time, currentTime);
      const dist = Math.abs(noteY - this.hitLineY);

      if (dist <= this.hitZones.perfect) {
        this.registerHit('PERFECT', columnIndex, closestNote);
      } else if (dist <= this.hitZones.great) {
        this.registerHit('GREAT', columnIndex, closestNote);
      } else if (dist <= this.hitZones.good) {
        this.registerHit('GOOD', columnIndex, closestNote);
      }
    } else {
      // Toque sem nota
      this.playSound(100, 0.05, 'sawtooth');
    }
  }

  registerHit(type, columnIndex, note) {
    note.hit = true;

    const col = this.columns[columnIndex];

    // Pontuação
    let points = 0;
    switch (type) {
      case 'PERFECT':
        points = 300;
        this.perfect++;
        this.playSound(880, 0.08, 'sine');
        break;
      case 'GREAT':
        points = 200;
        this.great++;
        this.playSound(660, 0.08, 'sine');
        break;
      case 'GOOD':
        points = 100;
        this.good++;
        this.playSound(440, 0.08, 'sine');
        break;
    }

    // Combo
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    // Multiplicador de combo
    const multiplier = Math.min(4, 1 + Math.floor(this.combo / 10) * 0.5);
    points = Math.floor(points * multiplier);

    this.score += points;

    // Efeito visual
    this.hitEffects.push({
      x: col.x + this.noteWidth / 2,
      y: this.hitLineY,
      text: type,
      color: type === 'PERFECT' ? '#FFD700' : type === 'GREAT' ? '#4ECDC4' : '#96CEB4',
      alpha: 1,
      scale: 1.5,
    });

    // Partículas
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: col.x + this.noteWidth / 2,
        y: this.hitLineY,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        color: col.color,
        alpha: 1,
        size: 5 + Math.random() * 5,
      });
    }
  }

  registerMiss(note) {
    if (note.missed) return;

    note.missed = true;
    this.miss++;
    this.combo = 0;
    this.health = Math.max(0, this.health - 5);

    // Som de erro
    this.playSound(150, 0.1, 'sawtooth');

    // Verificar game over
    if (this.health <= 0) {
      this.endSong(false);
    }
  }

  calculateNoteY(noteTime, currentTime) {
    const timeUntilHit = noteTime - currentTime;
    const pixelsFromHitLine = (timeUntilHit / 1000) * this.noteSpeed;
    return this.hitLineY - pixelsFromHitLine;
  }

  update(dt) {
    if (this.state !== 'playing') return;

    const currentTime = performance.now() - this.songStartTime;

    // Verificar fim da música
    if (currentTime >= this.songDuration) {
      this.endSong(true);
      return;
    }

    // Spawn novas notas
    while (this.noteIndex < this.currentSong.pattern.length) {
      const noteData = this.currentSong.pattern[this.noteIndex];
      const noteY = this.calculateNoteY(noteData.time, currentTime);

      if (noteY > -100) {
        this.notes.push({
          time: noteData.time,
          column: noteData.column,
          type: noteData.type,
          duration: noteData.duration || 0,
          hit: false,
          missed: false,
        });
        this.noteIndex++;
      } else {
        break;
      }
    }

    // Atualizar notas
    for (const note of this.notes) {
      const noteY = this.calculateNoteY(note.time, currentTime);

      // Verificar miss
      if (!note.hit && !note.missed && noteY > this.hitLineY + this.hitZones.good + 30) {
        this.registerMiss(note);
      }
    }

    // Limpar notas antigas
    this.notes = this.notes.filter(n => {
      const noteY = this.calculateNoteY(n.time, currentTime);
      return noteY < this.canvas.height + 100;
    });

    // Atualizar partículas
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.alpha -= 0.02;
    }
    this.particles = this.particles.filter(p => p.alpha > 0);

    // Atualizar efeitos de hit
    for (const e of this.hitEffects) {
      e.y -= 2;
      e.alpha -= 0.03;
      e.scale -= 0.02;
    }
    this.hitEffects = this.hitEffects.filter(e => e.alpha > 0);

    // Beat pulse
    const beatInterval = 60000 / this.currentSong.bpm;
    this.beatPulse = Math.sin((currentTime / beatInterval) * Math.PI * 2) * 0.5 + 0.5;
  }

  endSong(completed) {
    this.state = 'results';

    // Calcular rank
    const totalNotes = this.perfect + this.great + this.good + this.miss;
    const accuracy = totalNotes > 0 ?
      ((this.perfect * 100 + this.great * 75 + this.good * 50) / (totalNotes * 100)) * 100 : 0;

    let rank = 'F';
    if (accuracy >= 95) rank = 'S+';
    else if (accuracy >= 90) rank = 'S';
    else if (accuracy >= 85) rank = 'A';
    else if (accuracy >= 75) rank = 'B';
    else if (accuracy >= 60) rank = 'C';
    else if (accuracy >= 40) rank = 'D';

    this.finalRank = rank;
    this.accuracy = accuracy;

    // Recompensas EAI
    if (completed) {
      const baseXP = 50 + Math.floor(this.score / 100);
      const baseCoins = 10 + Math.floor(this.score / 500);

      this.eaiXP += baseXP;
      this.eaiCoins += baseCoins;

      // Desbloquear próxima música
      const currentIndex = this.songs.findIndex(s => s.id === this.currentSong.id);
      if (currentIndex < this.songs.length - 1 && accuracy >= 70) {
        const nextSong = this.songs[currentIndex + 1];
        if (!this.unlockedSongs.includes(nextSong.id)) {
          this.unlockedSongs.push(nextSong.id);
        }
      }

      this.saveProgress();
    }
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('eai_rhythm_battle');
      if (saved) {
        const data = JSON.parse(saved);
        this.eaiCoins = data.coins || 0;
        this.eaiXP = data.xp || 0;
        this.unlockedSongs = data.unlockedSongs || ['tutorial', 'neon-nights'];
      }
    } catch (e) {
      console.log('Erro ao carregar progresso');
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('eai_rhythm_battle', JSON.stringify({
        coins: this.eaiCoins,
        xp: this.eaiXP,
        unlockedSongs: this.unlockedSongs,
      }));

      // Enviar para EAI global
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
          type: 'EAI_GAME_SCORE',
          game: 'rhythm-battle',
          score: this.score,
          xp: this.eaiXP,
          coins: this.eaiCoins,
        }, '*');
      }
    } catch (e) {
      console.log('Erro ao salvar progresso');
    }
  }

  render() {
    const ctx = this.ctx;

    // Limpar canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') {
      this.renderMenu();
    } else if (this.state === 'playing' || this.state === 'paused') {
      this.renderGame();
      if (this.state === 'paused') {
        this.renderPauseOverlay();
      }
    } else if (this.state === 'results') {
      this.renderResults();
    }
  }

  renderMenu() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;

    // Fundo animado
    const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Ondas de som animadas
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = 0; x < this.canvas.width; x += 5) {
        const y = this.canvas.height / 2 +
          Math.sin((x / 50) + performance.now() / 500 + i) * (30 + i * 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RHYTHM BATTLE', cx, 100);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('EAI Music Games', cx, 130);

    // Moedas e XP
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText(`💰 ${this.eaiCoins} EAI Coins`, 20, 30);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText(`⭐ ${this.eaiXP} XP`, 20, 55);

    // Lista de músicas
    const songListY = 180;
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Escolha sua Música', cx, songListY);

    this.songs.forEach((song, i) => {
      const y = songListY + 50 + i * 70;
      const isSelected = i === this.selectedSongIndex;
      const isUnlocked = this.unlockedSongs.includes(song.id);

      // Card da música
      ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = isSelected ? song.color : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = isSelected ? 3 : 1;

      const cardWidth = 350;
      const cardHeight = 60;

      ctx.beginPath();
      ctx.roundRect(cx - cardWidth / 2, y, cardWidth, cardHeight, 10);
      ctx.fill();
      ctx.stroke();

      if (!isUnlocked) {
        // Bloqueado
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('🔒', cx, y + 38);
      } else {
        // Info da música
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(song.name, cx - cardWidth / 2 + 15, y + 25);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(song.artist, cx - cardWidth / 2 + 15, y + 45);

        ctx.textAlign = 'right';
        ctx.fillStyle = song.color;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(song.difficulty, cx + cardWidth / 2 - 15, y + 25);

        ctx.fillStyle = '#888';
        ctx.fillText(`${song.bpm} BPM`, cx + cardWidth / 2 - 15, y + 45);
      }
    });

    // Botão jogar
    const playBtnY = this.canvas.height - 100;
    const selectedSong = this.songs[this.selectedSongIndex];
    const canPlay = this.unlockedSongs.includes(selectedSong.id);

    ctx.fillStyle = canPlay ? selectedSong.color : '#555';
    ctx.beginPath();
    ctx.roundRect(cx - 100, playBtnY - 25, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(canPlay ? '▶ JOGAR' : '🔒 BLOQUEADO', cx, playBtnY + 8);

    // Instruções
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText('Use ← ↓ ↑ → ou A S W D para jogar', cx, this.canvas.height - 30);
  }

  renderGame() {
    const ctx = this.ctx;
    const currentTime = performance.now() - this.songStartTime;

    // Fundo com pulse
    const bgIntensity = 0.1 + this.beatPulse * 0.05;
    ctx.fillStyle = `rgba(26, 26, 46, ${1 - bgIntensity})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grade de fundo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    // Colunas de jogo
    const columnBgHeight = this.canvas.height;
    this.columns.forEach((col, i) => {
      // Fundo da coluna
      const colGradient = ctx.createLinearGradient(col.x, 0, col.x, this.canvas.height);
      colGradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
      colGradient.addColorStop(0.8, `rgba(${this.hexToRgb(col.color)}, 0.1)`);
      colGradient.addColorStop(1, `rgba(${this.hexToRgb(col.color)}, 0.2)`);

      ctx.fillStyle = colGradient;
      ctx.fillRect(col.x - 5, 0, this.noteWidth + 10, columnBgHeight);

      // Linha divisória
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(col.x + this.noteWidth + 5, 0);
      ctx.lineTo(col.x + this.noteWidth + 5, columnBgHeight);
      ctx.stroke();
    });

    // Hit line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.columns[0].x - 20, this.hitLineY);
    ctx.lineTo(this.columns[3].x + this.noteWidth + 20, this.hitLineY);
    ctx.stroke();

    // Targets (onde pressionar)
    this.columns.forEach((col, i) => {
      const pulse = col.pressed ? 0.3 : 0;

      // Brilho se pressionado
      if (col.pressed) {
        ctx.fillStyle = `rgba(${this.hexToRgb(col.color)}, 0.5)`;
        ctx.beginPath();
        ctx.arc(col.x + this.noteWidth / 2, this.hitLineY, 50, 0, Math.PI * 2);
        ctx.fill();
      }

      // Target
      ctx.fillStyle = col.pressed ? col.color : `rgba(${this.hexToRgb(col.color)}, 0.3)`;
      ctx.strokeStyle = col.color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(col.x, this.hitLineY - this.noteHeight / 2, this.noteWidth, this.noteHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Símbolo
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(col.name, col.x + this.noteWidth / 2, this.hitLineY);
    });

    // Notas
    for (const note of this.notes) {
      if (note.hit || note.missed) continue;

      const noteY = this.calculateNoteY(note.time, currentTime);
      const col = this.columns[note.column];

      // Nota
      const noteAlpha = note.missed ? 0.3 : 1;

      // Brilho
      ctx.shadowColor = col.color;
      ctx.shadowBlur = 15;

      ctx.fillStyle = col.color;
      ctx.beginPath();
      ctx.roundRect(col.x, noteY - this.noteHeight / 2, this.noteWidth, this.noteHeight, 8);
      ctx.fill();

      // Borda
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Símbolo na nota
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(col.name, col.x + this.noteWidth / 2, noteY);
    }

    // Partículas
    for (const p of this.particles) {
      ctx.fillStyle = p.color.replace(')', `, ${p.alpha})`).replace('rgb', 'rgba');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Efeitos de hit
    for (const e of this.hitEffects) {
      ctx.fillStyle = e.color.replace(')', `, ${e.alpha})`).replace('#', '');
      ctx.globalAlpha = e.alpha;
      ctx.font = `bold ${24 * e.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = e.color;
      ctx.fillText(e.text, e.x, e.y);
      ctx.globalAlpha = 1;
    }

    // HUD
    this.renderHUD(currentTime);
  }

  renderHUD(currentTime) {
    const ctx = this.ctx;

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(this.score.toLocaleString(), 20, 50);

    // Combo
    if (this.combo > 0) {
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = this.combo >= 50 ? '#FFD700' : this.combo >= 20 ? '#4ECDC4' : '#fff';
      ctx.fillText(`${this.combo} COMBO`, 20, 90);
    }

    // Barra de vida
    const healthBarWidth = 200;
    const healthBarHeight = 15;
    const healthBarX = this.canvas.width - healthBarWidth - 20;
    const healthBarY = 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight, 7);
    ctx.fill();

    const healthColor = this.health > 50 ? '#4ECDC4' : this.health > 25 ? '#FFD700' : '#FF6B6B';
    ctx.fillStyle = healthColor;
    ctx.beginPath();
    ctx.roundRect(healthBarX, healthBarY, healthBarWidth * (this.health / 100), healthBarHeight, 7);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(this.health)}%`, healthBarX + healthBarWidth / 2, healthBarY + 12);

    // Nome da música
    ctx.textAlign = 'right';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText(this.currentSong.name, this.canvas.width - 20, 55);

    // Progresso
    const progress = currentTime / this.songDuration;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(healthBarX, healthBarY + 25, healthBarWidth, 6, 3);
    ctx.fill();

    ctx.fillStyle = this.currentSong.color;
    ctx.beginPath();
    ctx.roundRect(healthBarX, healthBarY + 25, healthBarWidth * Math.min(1, progress), 6, 3);
    ctx.fill();
  }

  renderPauseOverlay() {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2 - 20);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Pressione ESC ou ENTER para continuar', this.canvas.width / 2, this.canvas.height / 2 + 30);
  }

  renderResults() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Fundo
    ctx.fillStyle = 'rgba(10, 10, 26, 0.95)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RESULTADOS', cx, 80);

    ctx.font = '20px Arial';
    ctx.fillStyle = this.currentSong.color;
    ctx.fillText(this.currentSong.name, cx, 115);

    // Rank grande
    const rankColors = {
      'S+': '#FFD700',
      'S': '#FFD700',
      'A': '#4ECDC4',
      'B': '#45B7D1',
      'C': '#96CEB4',
      'D': '#FF6B6B',
      'F': '#888',
    };

    ctx.font = 'bold 120px Arial';
    ctx.fillStyle = rankColors[this.finalRank];
    ctx.fillText(this.finalRank, cx, cy - 50);

    // Score
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(this.score.toLocaleString(), cx, cy + 30);

    // Estatísticas
    const statsY = cy + 80;
    ctx.font = '18px Arial';

    const stats = [
      { label: 'PERFECT', value: this.perfect, color: '#FFD700' },
      { label: 'GREAT', value: this.great, color: '#4ECDC4' },
      { label: 'GOOD', value: this.good, color: '#96CEB4' },
      { label: 'MISS', value: this.miss, color: '#FF6B6B' },
    ];

    stats.forEach((stat, i) => {
      const x = cx - 150 + (i % 2) * 150;
      const y = statsY + Math.floor(i / 2) * 40;

      ctx.fillStyle = stat.color;
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, x, y);

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(stat.value.toString(), x + 100, y);
    });

    // Max Combo
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Max Combo: ${this.maxCombo}`, cx, statsY + 100);

    // Accuracy
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${this.accuracy.toFixed(1)}% Accuracy`, cx, statsY + 140);

    // Recompensas
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`+${Math.floor(this.score / 500)} EAI Coins`, cx - 70, statsY + 180);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText(`+${50 + Math.floor(this.score / 100)} XP`, cx + 70, statsY + 180);

    // Botão continuar
    const btnY = this.canvas.height - 80;
    ctx.fillStyle = this.currentSong.color;
    ctx.beginPath();
    ctx.roundRect(cx - 100, btnY - 25, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('CONTINUAR', cx, btnY + 8);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '255, 255, 255';
  }

  gameLoop(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animationFrame = requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Inicialização
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    window.rhythmGame = new RhythmBattle(canvas);
  }
});
