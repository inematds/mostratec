// Music Maker Studio - EAI Games
// Jogo musical criativo para crianças

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Audio Context for sound generation
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Note frequencies
const noteFrequencies = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
  'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
  'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
};

class MusicMakerGame {
  constructor() {
    this.state = 'menu';
    this.coins = parseInt(localStorage.getItem('eai_musicmaker_coins') || '0');
    this.diamonds = parseInt(localStorage.getItem('eai_musicmaker_diamonds') || '0');
    this.xp = parseInt(localStorage.getItem('eai_musicmaker_xp') || '0');
    this.level = parseInt(localStorage.getItem('eai_musicmaker_level') || '1');
    this.totalSongsCreated = parseInt(localStorage.getItem('eai_musicmaker_songs') || '0');

    // Tutorial
    this.showTutorial = !localStorage.getItem('eai_musicmaker_tutorial_seen');
    this.tutorialPage = 0;
    this.tutorialPages = [
      { title: 'Bem-vindo ao Music Maker!', lines: ['Crie suas próprias músicas', 'de forma divertida!'], emoji: '🎵' },
      { title: 'Instrumentos', lines: ['Escolha entre piano, bateria,', 'guitarra e muito mais!'], emoji: '🎹' },
      { title: 'Toque e Grave', lines: ['Toque nas teclas coloridas', 'e grave suas criações!'], emoji: '🎤' },
      { title: 'Modo Ritmo', lines: ['Siga o ritmo e ganhe', 'estrelas e moedas!'], emoji: '⭐' },
      { title: 'Divirta-se!', lines: ['Desbloqueie instrumentos', 'e crie muitas músicas!'], emoji: '🎉' }
    ];

    // Instruments
    this.instruments = [
      { id: 'piano', name: 'Piano', emoji: '🎹', unlocked: true, price: 0, waveform: 'sine' },
      { id: 'guitar', name: 'Guitarra', emoji: '🎸', unlocked: false, price: 100, waveform: 'sawtooth' },
      { id: 'drums', name: 'Bateria', emoji: '🥁', unlocked: false, price: 150, waveform: 'square' },
      { id: 'xylophone', name: 'Xilofone', emoji: '🎶', unlocked: false, price: 200, waveform: 'triangle' },
      { id: 'synth', name: 'Sintetizador', emoji: '🎧', unlocked: false, price: 300, waveform: 'sawtooth' },
      { id: 'flute', name: 'Flauta', emoji: '🪈', unlocked: false, price: 400, waveform: 'sine' },
      { id: 'violin', name: 'Violino', emoji: '🎻', unlocked: false, price: 500, waveform: 'triangle' },
      { id: 'trumpet', name: 'Trompete', emoji: '🎺', unlocked: false, price: 600, waveform: 'square' }
    ];

    this.loadUnlockedInstruments();
    this.currentInstrument = this.instruments[0];

    // Music keys
    this.keys = [];
    this.setupKeys();

    // Recording
    this.isRecording = false;
    this.recordedNotes = [];
    this.recordStartTime = 0;
    this.isPlaying = false;
    this.playbackIndex = 0;
    this.playbackStartTime = 0;

    // Rhythm mode
    this.rhythmMode = false;
    this.rhythmNotes = [];
    this.rhythmScore = 0;
    this.rhythmCombo = 0;
    this.rhythmMaxCombo = 0;
    this.rhythmLevel = 1;
    this.rhythmSpeed = 2;

    // Visual effects
    this.particles = [];
    this.noteEffects = [];

    // Achievements
    this.achievements = [
      { id: 'first_note', name: 'Primeira Nota', desc: 'Toque sua primeira nota', icon: '🎵', unlocked: false },
      { id: 'first_song', name: 'Compositor', desc: 'Grave sua primeira música', icon: '🎼', unlocked: false },
      { id: 'instrument_2', name: 'Colecionador', desc: 'Desbloqueie 2 instrumentos', icon: '🎹', unlocked: false },
      { id: 'instrument_5', name: 'Músico Pro', desc: 'Desbloqueie 5 instrumentos', icon: '🎸', unlocked: false },
      { id: 'rhythm_10', name: 'No Ritmo', desc: 'Acerte 10 notas seguidas', icon: '⭐', unlocked: false },
      { id: 'rhythm_50', name: 'Mestre do Ritmo', desc: 'Acerte 50 notas seguidas', icon: '🏆', unlocked: false },
      { id: 'songs_10', name: 'Álbum', desc: 'Crie 10 músicas', icon: '💿', unlocked: false },
      { id: 'level_10', name: 'Estrela', desc: 'Alcance nível 10', icon: '🌟', unlocked: false }
    ];
    this.loadAchievements();

    // Settings
    this.settings = {
      volume: parseFloat(localStorage.getItem('eai_musicmaker_volume') || '0.5'),
      keyColors: localStorage.getItem('eai_musicmaker_colors') || 'rainbow'
    };

    // Colors schemes
    this.colorSchemes = {
      rainbow: ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f06595', '#20c997'],
      pastel: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e0b3ff', '#ffb3de', '#b3ffec'],
      neon: ['#ff0066', '#ff6600', '#ffff00', '#00ff66', '#00ffff', '#6600ff', '#ff00ff', '#00ff00']
    };

    this.activeKeys = new Set();

    this.setupEventListeners();
    this.gameLoop();
  }

  loadUnlockedInstruments() {
    const unlocked = JSON.parse(localStorage.getItem('eai_musicmaker_instruments') || '["piano"]');
    this.instruments.forEach(inst => {
      inst.unlocked = unlocked.includes(inst.id);
    });
  }

  saveUnlockedInstruments() {
    const unlocked = this.instruments.filter(i => i.unlocked).map(i => i.id);
    localStorage.setItem('eai_musicmaker_instruments', JSON.stringify(unlocked));
  }

  loadAchievements() {
    const saved = JSON.parse(localStorage.getItem('eai_musicmaker_achievements') || '[]');
    this.achievements.forEach(a => {
      a.unlocked = saved.includes(a.id);
    });
  }

  saveAchievements() {
    const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('eai_musicmaker_achievements', JSON.stringify(unlocked));
  }

  checkAchievement(id) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.saveAchievements();
      this.showAchievementPopup(achievement);
      this.addXP(50);
      this.diamonds += 5;
      this.save();
    }
  }

  showAchievementPopup(achievement) {
    this.achievementPopup = {
      achievement,
      timer: 180,
      y: -100
    };
  }

  setupKeys() {
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    this.keys = notes.map((note, i) => ({
      note,
      index: i,
      pressed: false,
      pressTime: 0
    }));
  }

  setupEventListeners() {
    canvas.addEventListener('click', (e) => this.handleClick(e));
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      initAudio();
      for (let touch of e.touches) {
        this.handleTouch(touch.clientX, touch.clientY);
      }
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let touch of e.touches) {
        this.handleTouch(touch.clientX, touch.clientY);
      }
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.activeKeys.clear();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (this.state === 'playing' || this.state === 'rhythm') {
        initAudio();
        const keyMap = { 'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4, 'h': 5, 'j': 6, 'k': 7 };
        if (keyMap[e.key] !== undefined && !this.activeKeys.has(e.key)) {
          this.activeKeys.add(e.key);
          this.playNote(keyMap[e.key]);
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      this.activeKeys.delete(e.key);
      const keyMap = { 'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4, 'h': 5, 'j': 6, 'k': 7 };
      if (keyMap[e.key] !== undefined && this.keys[keyMap[e.key]]) {
        this.keys[keyMap[e.key]].pressed = false;
      }
    });
  }

  handleClick(e) {
    initAudio();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.processInput(x, y);
  }

  handleTouch(x, y) {
    this.processInput(x, y);
  }

  processInput(x, y) {
    if (this.showTutorial) {
      this.tutorialPage++;
      if (this.tutorialPage >= this.tutorialPages.length) {
        this.showTutorial = false;
        localStorage.setItem('eai_musicmaker_tutorial_seen', 'true');
      }
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    if (this.state === 'menu') {
      // Play button
      if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 - 30 && y < h/2 + 30) {
        this.state = 'playing';
      }
      // Rhythm mode
      if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 50 && y < h/2 + 110) {
        this.state = 'rhythm';
        this.startRhythmMode();
      }
      // Shop
      if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 130 && y < h/2 + 190) {
        this.state = 'shop';
      }
      // Achievements
      if (x > w/2 - 100 && x < w/2 + 100 && y > h/2 + 210 && y < h/2 + 270) {
        this.state = 'achievements';
      }
      // Settings
      if (x > w - 60 && x < w - 10 && y > 10 && y < 60) {
        this.state = 'settings';
      }
    } else if (this.state === 'playing') {
      // Back button
      if (x < 80 && y < 50) {
        this.state = 'menu';
        return;
      }

      // Instrument selector
      const instY = 60;
      this.instruments.filter(i => i.unlocked).forEach((inst, i) => {
        const instX = 20 + i * 60;
        if (x > instX && x < instX + 50 && y > instY && y < instY + 50) {
          this.currentInstrument = inst;
        }
      });

      // Record button
      const recordX = w - 150;
      const recordY = 70;
      if (x > recordX && x < recordX + 60 && y > recordY && y < recordY + 40) {
        this.toggleRecording();
        return;
      }

      // Play button
      const playX = w - 80;
      if (x > playX && x < playX + 60 && y > recordY && y < recordY + 40) {
        this.togglePlayback();
        return;
      }

      // Piano keys
      const keyWidth = w / 8;
      const keyHeight = h * 0.4;
      const keyY = h - keyHeight - 20;

      for (let i = 0; i < 8; i++) {
        const keyX = i * keyWidth;
        if (x > keyX && x < keyX + keyWidth && y > keyY && y < keyY + keyHeight) {
          this.playNote(i);
          break;
        }
      }
    } else if (this.state === 'rhythm') {
      // Back button
      if (x < 80 && y < 50) {
        this.state = 'menu';
        this.rhythmMode = false;
        return;
      }

      // Check rhythm key presses
      const keyWidth = w / 8;
      const keyHeight = h * 0.3;
      const keyY = h - keyHeight - 20;

      for (let i = 0; i < 8; i++) {
        const keyX = i * keyWidth;
        if (x > keyX && x < keyX + keyWidth && y > keyY && y < keyY + keyHeight) {
          this.checkRhythmHit(i);
          this.playNote(i);
          break;
        }
      }
    } else if (this.state === 'shop') {
      // Back button
      if (x < 80 && y < 50) {
        this.state = 'menu';
        return;
      }

      // Shop items
      const startY = 120;
      this.instruments.forEach((inst, i) => {
        const itemY = startY + i * 70;
        if (y > itemY && y < itemY + 60 && x > w - 120 && x < w - 20) {
          if (!inst.unlocked && this.coins >= inst.price) {
            this.coins -= inst.price;
            inst.unlocked = true;
            this.saveUnlockedInstruments();
            this.save();
            this.addXP(30);

            // Check achievements
            const unlockedCount = this.instruments.filter(i => i.unlocked).length;
            if (unlockedCount >= 2) this.checkAchievement('instrument_2');
            if (unlockedCount >= 5) this.checkAchievement('instrument_5');
          }
        }
      });
    } else if (this.state === 'achievements') {
      if (x < 80 && y < 50) {
        this.state = 'menu';
      }
    } else if (this.state === 'settings') {
      if (x < 80 && y < 50) {
        this.state = 'menu';
        return;
      }

      // Volume slider
      const sliderX = w/2 - 100;
      const sliderW = 200;
      if (y > 150 && y < 190 && x > sliderX && x < sliderX + sliderW) {
        this.settings.volume = (x - sliderX) / sliderW;
        localStorage.setItem('eai_musicmaker_volume', this.settings.volume.toString());
      }

      // Color schemes
      const schemes = ['rainbow', 'pastel', 'neon'];
      schemes.forEach((scheme, i) => {
        const btnY = 250 + i * 60;
        if (y > btnY && y < btnY + 50 && x > w/2 - 80 && x < w/2 + 80) {
          this.settings.keyColors = scheme;
          localStorage.setItem('eai_musicmaker_colors', scheme);
        }
      });
    }
  }

  playNote(index) {
    if (!audioCtx) return;

    const key = this.keys[index];
    if (!key) return;

    key.pressed = true;
    key.pressTime = Date.now();

    // Create sound
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = this.currentInstrument.waveform;
    oscillator.frequency.setValueAtTime(noteFrequencies[key.note], audioCtx.currentTime);

    gainNode.gain.setValueAtTime(this.settings.volume * 0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);

    // Visual effect
    this.addNoteEffect(index);

    // Record if recording
    if (this.isRecording) {
      this.recordedNotes.push({
        index,
        time: Date.now() - this.recordStartTime
      });
    }

    // Achievement
    this.checkAchievement('first_note');

    // Add coins
    this.coins += 1;
    this.addXP(1);
    this.save();
  }

  addNoteEffect(index) {
    const w = canvas.width;
    const h = canvas.height;
    const keyWidth = w / 8;
    const x = index * keyWidth + keyWidth / 2;
    const y = h - h * 0.2;

    const colors = this.colorSchemes[this.settings.keyColors];
    const color = colors[index % colors.length];

    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 10 - 5,
        size: Math.random() * 15 + 5,
        color: color,
        life: 60,
        emoji: ['🎵', '🎶', '✨', '⭐'][Math.floor(Math.random() * 4)]
      });
    }

    this.noteEffects.push({
      x, y,
      size: 50,
      color: color,
      life: 30
    });
  }

  toggleRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      if (this.recordedNotes.length > 0) {
        this.totalSongsCreated++;
        localStorage.setItem('eai_musicmaker_songs', this.totalSongsCreated.toString());
        this.checkAchievement('first_song');
        if (this.totalSongsCreated >= 10) this.checkAchievement('songs_10');
        this.coins += 20;
        this.addXP(20);
        this.save();
      }
    } else {
      this.isRecording = true;
      this.recordedNotes = [];
      this.recordStartTime = Date.now();
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.isPlaying = false;
    } else if (this.recordedNotes.length > 0) {
      this.isPlaying = true;
      this.playbackIndex = 0;
      this.playbackStartTime = Date.now();
    }
  }

  startRhythmMode() {
    this.rhythmMode = true;
    this.rhythmNotes = [];
    this.rhythmScore = 0;
    this.rhythmCombo = 0;
    this.rhythmMaxCombo = 0;
    this.rhythmSpeed = 2 + this.rhythmLevel * 0.3;
    this.lastRhythmNote = Date.now();
  }

  checkRhythmHit(keyIndex) {
    const h = canvas.height;
    const targetY = h - h * 0.3 - 50;

    let hit = false;
    this.rhythmNotes = this.rhythmNotes.filter(note => {
      if (note.keyIndex === keyIndex && Math.abs(note.y - targetY) < 50) {
        hit = true;
        this.rhythmScore += 10 * (1 + Math.floor(this.rhythmCombo / 5));
        this.rhythmCombo++;
        if (this.rhythmCombo > this.rhythmMaxCombo) {
          this.rhythmMaxCombo = this.rhythmCombo;
        }

        // Check achievements
        if (this.rhythmCombo >= 10) this.checkAchievement('rhythm_10');
        if (this.rhythmCombo >= 50) this.checkAchievement('rhythm_50');

        return false;
      }
      return true;
    });

    if (!hit) {
      this.rhythmCombo = 0;
    }
  }

  updateRhythmMode() {
    const now = Date.now();
    const h = canvas.height;

    // Spawn new notes
    const spawnInterval = Math.max(500, 1500 - this.rhythmLevel * 100);
    if (now - this.lastRhythmNote > spawnInterval) {
      this.rhythmNotes.push({
        keyIndex: Math.floor(Math.random() * 8),
        y: -30
      });
      this.lastRhythmNote = now;
    }

    // Update notes
    this.rhythmNotes = this.rhythmNotes.filter(note => {
      note.y += this.rhythmSpeed;

      // Missed note
      if (note.y > h) {
        this.rhythmCombo = 0;
        return false;
      }
      return true;
    });

    // Level up based on score
    const newLevel = Math.floor(this.rhythmScore / 500) + 1;
    if (newLevel > this.rhythmLevel) {
      this.rhythmLevel = newLevel;
      this.rhythmSpeed = 2 + this.rhythmLevel * 0.3;
      this.coins += 50;
      this.addXP(30);
      this.save();
    }
  }

  addXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 100;
    if (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.diamonds += 10;
      if (this.level >= 10) this.checkAchievement('level_10');
    }
    this.save();
  }

  save() {
    localStorage.setItem('eai_musicmaker_coins', this.coins.toString());
    localStorage.setItem('eai_musicmaker_diamonds', this.diamonds.toString());
    localStorage.setItem('eai_musicmaker_xp', this.xp.toString());
    localStorage.setItem('eai_musicmaker_level', this.level.toString());
  }

  update() {
    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life--;
      return p.life > 0;
    });

    // Update note effects
    this.noteEffects = this.noteEffects.filter(e => {
      e.size += 3;
      e.life--;
      return e.life > 0;
    });

    // Playback
    if (this.isPlaying && this.recordedNotes.length > 0) {
      const elapsed = Date.now() - this.playbackStartTime;
      while (this.playbackIndex < this.recordedNotes.length &&
             this.recordedNotes[this.playbackIndex].time <= elapsed) {
        this.playNote(this.recordedNotes[this.playbackIndex].index);
        this.playbackIndex++;
      }
      if (this.playbackIndex >= this.recordedNotes.length) {
        this.isPlaying = false;
      }
    }

    // Rhythm mode update
    if (this.state === 'rhythm') {
      this.updateRhythmMode();
    }

    // Key press animation reset
    this.keys.forEach(key => {
      if (key.pressed && Date.now() - key.pressTime > 200) {
        key.pressed = false;
      }
    });

    // Achievement popup
    if (this.achievementPopup) {
      this.achievementPopup.timer--;
      if (this.achievementPopup.y < 50) {
        this.achievementPopup.y += 10;
      }
      if (this.achievementPopup.timer <= 0) {
        this.achievementPopup = null;
      }
    }
  }

  draw() {
    const w = canvas.width;
    const h = canvas.height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#2d1b4e');
    gradient.addColorStop(0.5, '#1a0a2e');
    gradient.addColorStop(1, '#0f051a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (this.showTutorial) {
      this.drawTutorial();
      return;
    }

    if (this.state === 'menu') {
      this.drawMenu();
    } else if (this.state === 'playing') {
      this.drawPlaying();
    } else if (this.state === 'rhythm') {
      this.drawRhythm();
    } else if (this.state === 'shop') {
      this.drawShop();
    } else if (this.state === 'achievements') {
      this.drawAchievements();
    } else if (this.state === 'settings') {
      this.drawSettings();
    }

    // Draw particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / 60;
      ctx.font = `${p.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(p.emoji, p.x, p.y);
    });
    ctx.globalAlpha = 1;

    // Draw note effects
    this.noteEffects.forEach(e => {
      ctx.globalAlpha = e.life / 30;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Achievement popup
    if (this.achievementPopup) {
      const a = this.achievementPopup.achievement;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
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

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);

    // Box
    ctx.fillStyle = '#1a0a2e';
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(w/2 - 160, h/2 - 140, 320, 280, 20);
    ctx.fill();
    ctx.stroke();

    // Emoji
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(page.emoji, w/2, h/2 - 60);

    // Title
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(page.title, w/2, h/2 + 10);

    // Lines
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    page.lines.forEach((line, i) => {
      ctx.fillText(line, w/2, h/2 + 45 + i * 25);
    });

    // Progress dots
    for (let i = 0; i < this.tutorialPages.length; i++) {
      ctx.beginPath();
      ctx.arc(w/2 - 40 + i * 20, h/2 + 110, 6, 0, Math.PI * 2);
      ctx.fillStyle = i === this.tutorialPage ? '#ff69b4' : '#666';
      ctx.fill();
    }

    // Continue text
    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Toque para continuar', w/2, h/2 + 140);
  }

  drawMenu() {
    const w = canvas.width;
    const h = canvas.height;

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff69b4';
    ctx.fillText('🎵 MUSIC MAKER STUDIO 🎵', w/2, 80);

    // Stats
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${this.coins}`, 20, 30);
    ctx.fillText(`💎 ${this.diamonds}`, 120, 30);
    ctx.fillText(`⭐ Nível ${this.level}`, 220, 30);
    ctx.fillText(`🎼 ${this.totalSongsCreated} músicas`, 320, 30);

    // Settings button
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚙️', w - 35, 40);

    // Buttons
    const buttons = [
      { text: '🎹 Modo Livre', y: h/2 - 30 },
      { text: '🎯 Modo Ritmo', y: h/2 + 50 },
      { text: '🛒 Loja', y: h/2 + 130 },
      { text: '🏆 Conquistas', y: h/2 + 210 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#2d1b4e';
      ctx.strokeStyle = '#ff69b4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(w/2 - 100, btn.y - 25, 200, 50, 15);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(btn.text, w/2, btn.y + 8);
    });

    // Floating notes animation
    const time = Date.now() / 1000;
    for (let i = 0; i < 5; i++) {
      const x = (w * 0.1) + (i * w * 0.2);
      const y = h * 0.7 + Math.sin(time + i) * 20;
      ctx.font = '40px Arial';
      ctx.fillText(['🎵', '🎶', '🎼', '🎵', '🎶'][i], x, y);
    }
  }

  drawPlaying() {
    const w = canvas.width;
    const h = canvas.height;

    // Back button
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    // Stats
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`🪙 ${this.coins}`, w/2 - 50, 35);

    // Instrument selector
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Instrumento:', 20, 80);

    this.instruments.filter(i => i.unlocked).forEach((inst, i) => {
      const x = 20 + i * 60;
      const y = 90;

      ctx.fillStyle = inst === this.currentInstrument ? '#ff69b4' : '#333';
      ctx.beginPath();
      ctx.roundRect(x, y - 30, 50, 50, 10);
      ctx.fill();

      ctx.font = '25px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(inst.emoji, x + 25, y + 5);
    });

    // Record/Play buttons
    ctx.fillStyle = this.isRecording ? '#ff0000' : '#333';
    ctx.beginPath();
    ctx.roundRect(w - 150, 70, 60, 40, 10);
    ctx.fill();
    ctx.font = '20px Arial';
    ctx.fillText(this.isRecording ? '⏹️' : '🔴', w - 120, 98);

    ctx.fillStyle = this.isPlaying ? '#00ff00' : '#333';
    ctx.beginPath();
    ctx.roundRect(w - 80, 70, 60, 40, 10);
    ctx.fill();
    ctx.fillText(this.isPlaying ? '⏸️' : '▶️', w - 50, 98);

    // Recording indicator
    if (this.isRecording) {
      ctx.fillStyle = '#ff0000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`● Gravando (${this.recordedNotes.length} notas)`, w/2, 80);
    }

    // Draw piano keys
    this.drawKeys();

    // Key hints
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Teclas: A S D F G H J K', w/2, h - 10);
  }

  drawKeys() {
    const w = canvas.width;
    const h = canvas.height;
    const keyWidth = w / 8;
    const keyHeight = h * 0.4;
    const keyY = h - keyHeight - 20;
    const colors = this.colorSchemes[this.settings.keyColors];

    this.keys.forEach((key, i) => {
      const x = i * keyWidth;
      const color = colors[i % colors.length];

      // Key shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x + 5, keyY + 5, keyWidth - 10, keyHeight, 10);
      ctx.fill();

      // Key
      const pressOffset = key.pressed ? 5 : 0;
      ctx.fillStyle = key.pressed ? '#fff' : color;
      ctx.beginPath();
      ctx.roundRect(x + 5, keyY + pressOffset, keyWidth - 10, keyHeight - pressOffset, 10);
      ctx.fill();

      // Key border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Note name
      ctx.fillStyle = key.pressed ? color : '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(key.note.replace('4', '').replace('5', ''), x + keyWidth/2, keyY + keyHeight - 30);

      // Emoji on press
      if (key.pressed) {
        ctx.font = '30px Arial';
        ctx.fillText('🎵', x + keyWidth/2, keyY + 50);
      }
    });
  }

  drawRhythm() {
    const w = canvas.width;
    const h = canvas.height;
    const keyWidth = w / 8;
    const keyHeight = h * 0.3;
    const keyY = h - keyHeight - 20;
    const targetY = keyY - 30;
    const colors = this.colorSchemes[this.settings.keyColors];

    // Back button
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    // Stats
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Pontos: ${this.rhythmScore}`, w/2, 40);

    ctx.font = '16px Arial';
    ctx.fillText(`Combo: ${this.rhythmCombo}x`, w/2, 65);
    ctx.fillText(`Nível: ${this.rhythmLevel}`, w/2, 90);

    // Target line
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(w, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ff69b4';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Acerte aqui! →', w/2, targetY - 10);

    // Falling notes
    this.rhythmNotes.forEach(note => {
      const x = note.keyIndex * keyWidth + keyWidth/2;
      const color = colors[note.keyIndex % colors.length];

      // Note glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, note.y, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('🎵', x, note.y + 7);
    });

    // Draw keys (smaller)
    this.keys.forEach((key, i) => {
      const x = i * keyWidth;
      const color = colors[i % colors.length];

      ctx.fillStyle = key.pressed ? '#fff' : color;
      ctx.beginPath();
      ctx.roundRect(x + 5, keyY, keyWidth - 10, keyHeight, 10);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = key.pressed ? color : '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(key.note.replace('4', '').replace('5', ''), x + keyWidth/2, keyY + keyHeight - 20);
    });

    // Combo effects
    if (this.rhythmCombo >= 10) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      const comboText = this.rhythmCombo >= 50 ? '🔥 INCRÍVEL! 🔥' :
                        this.rhythmCombo >= 30 ? '⭐ ÓTIMO! ⭐' : '✨ LEGAL! ✨';
      ctx.fillText(comboText, w/2, 120);
    }
  }

  drawShop() {
    const w = canvas.width;
    const h = canvas.height;

    // Back button
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    // Title
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff69b4';
    ctx.fillText('🛒 LOJA DE INSTRUMENTOS 🛒', w/2, 80);

    // Coins
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`🪙 ${this.coins}`, w/2, 110);

    // Items
    const startY = 140;
    this.instruments.forEach((inst, i) => {
      const y = startY + i * 65;

      if (y > h - 50) return;

      // Item bg
      ctx.fillStyle = inst.unlocked ? '#1a3a1a' : '#2d1b4e';
      ctx.beginPath();
      ctx.roundRect(20, y, w - 40, 55, 10);
      ctx.fill();

      // Emoji
      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(inst.emoji, 35, y + 38);

      // Name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(inst.name, 80, y + 25);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Som: ${inst.waveform}`, 80, y + 42);

      // Price/Status
      ctx.textAlign = 'right';
      if (inst.unlocked) {
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('✓ Desbloqueado', w - 30, y + 35);
      } else {
        ctx.fillStyle = this.coins >= inst.price ? '#ffd700' : '#ff6666';
        ctx.fillRect(w - 110, y + 15, 80, 30);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`🪙 ${inst.price}`, w - 35, y + 35);
      }
    });
  }

  drawAchievements() {
    const w = canvas.width;
    const h = canvas.height;

    // Back button
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    // Title
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🏆 CONQUISTAS 🏆', w/2, 80);

    // Count
    const unlocked = this.achievements.filter(a => a.unlocked).length;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${unlocked}/${this.achievements.length} desbloqueadas`, w/2, 110);

    // Achievements grid
    const cols = Math.min(4, Math.floor((w - 40) / 150));
    const itemWidth = (w - 40) / cols;

    this.achievements.forEach((a, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * itemWidth;
      const y = 140 + row * 100;

      if (y > h - 50) return;

      // Card
      ctx.fillStyle = a.unlocked ? '#2d1b4e' : '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(x + 5, y, itemWidth - 10, 90, 10);
      ctx.fill();

      if (a.unlocked) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Icon
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = a.unlocked ? 1 : 0.3;
      ctx.fillText(a.icon, x + itemWidth/2, y + 35);

      // Name
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = a.unlocked ? '#ffd700' : '#666';
      ctx.fillText(a.name, x + itemWidth/2, y + 55);

      // Desc
      ctx.font = '10px Arial';
      ctx.fillStyle = a.unlocked ? '#fff' : '#444';
      ctx.fillText(a.desc, x + itemWidth/2, y + 75);

      ctx.globalAlpha = 1;
    });
  }

  drawSettings() {
    const w = canvas.width;
    const h = canvas.height;

    // Back button
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← Voltar', 20, 35);

    // Title
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff69b4';
    ctx.fillText('⚙️ CONFIGURAÇÕES ⚙️', w/2, 80);

    // Volume
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('🔊 Volume', w/2, 140);

    // Slider
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.roundRect(w/2 - 100, 155, 200, 20, 10);
    ctx.fill();

    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.roundRect(w/2 - 100, 155, 200 * this.settings.volume, 20, 10);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`${Math.round(this.settings.volume * 100)}%`, w/2, 200);

    // Color scheme
    ctx.font = 'bold 18px Arial';
    ctx.fillText('🎨 Cores das Teclas', w/2, 240);

    const schemes = [
      { id: 'rainbow', name: '🌈 Arco-íris' },
      { id: 'pastel', name: '🍬 Pastel' },
      { id: 'neon', name: '💡 Neon' }
    ];

    schemes.forEach((scheme, i) => {
      const y = 260 + i * 60;
      const isSelected = this.settings.keyColors === scheme.id;

      ctx.fillStyle = isSelected ? '#ff69b4' : '#333';
      ctx.beginPath();
      ctx.roundRect(w/2 - 80, y, 160, 45, 10);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(scheme.name, w/2, y + 30);
    });
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Add roundRect polyfill
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

// Start game
const game = new MusicMakerGame();
