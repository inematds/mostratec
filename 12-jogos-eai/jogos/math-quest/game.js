/**
 * Math Quest RPG - Jogo Educativo de Matemática
 * Aprenda Álgebra, Geometria, Trigonometria e Cálculo através de batalhas RPG
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuração do canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==================== SISTEMA DE DADOS ====================
const GameData = {
  // Mundos do jogo
  worlds: [
    {
      id: 'arithmetic',
      name: 'Reino da Aritmética',
      description: 'Domine as operações básicas',
      icon: '🏰',
      color: '#4CAF50',
      bgGradient: ['#1a4a1a', '#0d2d0d'],
      levels: 50,
      unlockLevel: 0,
      topics: ['Adição', 'Subtração', 'Multiplicação', 'Divisão', 'Potências', 'Raízes']
    },
    {
      id: 'algebra',
      name: 'Floresta Algébrica',
      description: 'Resolva equações misteriosas',
      icon: '🌲',
      color: '#2196F3',
      bgGradient: ['#1a3a5c', '#0d1d2e'],
      levels: 50,
      unlockLevel: 10,
      topics: ['Equações 1º grau', 'Equações 2º grau', 'Sistemas', 'Inequações', 'Polinômios']
    },
    {
      id: 'geometry',
      name: 'Templo da Geometria',
      description: 'Explore formas e espaços',
      icon: '🔺',
      color: '#FF9800',
      bgGradient: ['#5c3a1a', '#2e1d0d'],
      levels: 50,
      unlockLevel: 25,
      topics: ['Áreas', 'Perímetros', 'Volumes', 'Ângulos', 'Teorema de Pitágoras']
    },
    {
      id: 'trigonometry',
      name: 'Montanhas Trigonométricas',
      description: 'Conquiste senos e cossenos',
      icon: '⛰️',
      color: '#9C27B0',
      bgGradient: ['#3a1a5c', '#1d0d2e'],
      levels: 50,
      unlockLevel: 40,
      topics: ['Seno', 'Cosseno', 'Tangente', 'Identidades', 'Lei dos Senos/Cossenos']
    },
    {
      id: 'functions',
      name: 'Vale das Funções',
      description: 'Domine gráficos e transformações',
      icon: '📈',
      color: '#E91E63',
      bgGradient: ['#5c1a3a', '#2e0d1d'],
      levels: 50,
      unlockLevel: 55,
      topics: ['Funções Lineares', 'Quadráticas', 'Exponenciais', 'Logarítmicas', 'Modulares']
    },
    {
      id: 'statistics',
      name: 'Cidade das Estatísticas',
      description: 'Analise dados como um mestre',
      icon: '📊',
      color: '#00BCD4',
      bgGradient: ['#1a4a5c', '#0d252e'],
      levels: 50,
      unlockLevel: 70,
      topics: ['Média', 'Mediana', 'Moda', 'Desvio Padrão', 'Probabilidade']
    },
    {
      id: 'matrices',
      name: 'Labirinto das Matrizes',
      description: 'Navegue entre linhas e colunas',
      icon: '🔢',
      color: '#607D8B',
      bgGradient: ['#2a3a4a', '#151d25'],
      levels: 50,
      unlockLevel: 85,
      topics: ['Operações', 'Determinantes', 'Inversas', 'Sistemas Lineares']
    },
    {
      id: 'sequences',
      name: 'Torre das Sequências',
      description: 'Descubra padrões infinitos',
      icon: '🗼',
      color: '#795548',
      bgGradient: ['#4a3a2a', '#251d15'],
      levels: 50,
      unlockLevel: 100,
      topics: ['PA', 'PG', 'Sequências Recursivas', 'Séries', 'Fibonacci']
    },
    {
      id: 'combinatorics',
      name: 'Jardim Combinatório',
      description: 'Conte possibilidades infinitas',
      icon: '🎲',
      color: '#FF5722',
      bgGradient: ['#5c2a1a', '#2e150d'],
      levels: 50,
      unlockLevel: 115,
      topics: ['Permutação', 'Arranjo', 'Combinação', 'Binômio de Newton']
    },
    {
      id: 'calculus',
      name: 'Dimensão do Cálculo',
      description: 'O desafio supremo',
      icon: '🌌',
      color: '#673AB7',
      bgGradient: ['#2a1a4a', '#150d25'],
      levels: 50,
      unlockLevel: 130,
      topics: ['Limites', 'Derivadas', 'Integrais', 'Aplicações']
    }
  ],

  // Classes de personagem
  classes: [
    { id: 'mage', name: 'Mago Numérico', icon: '🧙', bonusDamage: 1.2, bonusXP: 1.0, skill: 'Bola de Fogo Algébrica', color: '#9966ff' },
    { id: 'warrior', name: 'Guerreiro Geométrico', icon: '⚔️', bonusDamage: 1.0, bonusXP: 1.1, skill: 'Corte Triangular', color: '#ff6666' },
    { id: 'archer', name: 'Arqueiro Trigonométrico', icon: '🏹', bonusDamage: 1.1, bonusXP: 1.05, skill: 'Flecha Senoidal', color: '#66ff66' },
    { id: 'healer', name: 'Curandeiro Estatístico', icon: '💚', bonusDamage: 0.9, bonusXP: 1.3, skill: 'Cura Probabilística', color: '#66ffff' }
  ],

  // Inimigos por mundo
  enemies: {
    arithmetic: [
      { name: 'Slime Numérico', icon: '🟢', hp: 50, damage: 5, xp: 10, coins: 5 },
      { name: 'Goblin Contador', icon: '👺', hp: 80, damage: 8, xp: 15, coins: 8 },
      { name: 'Lobo Divisor', icon: '🐺', hp: 100, damage: 10, xp: 20, coins: 12 },
      { name: 'Boss: Dragão Aritmético', icon: '🐉', hp: 300, damage: 25, xp: 100, coins: 50, isBoss: true }
    ],
    algebra: [
      { name: 'Fantasma X', icon: '👻', hp: 120, damage: 12, xp: 25, coins: 15 },
      { name: 'Esqueleto Equação', icon: '💀', hp: 150, damage: 15, xp: 30, coins: 20 },
      { name: 'Bruxa Polinomial', icon: '🧙‍♀️', hp: 200, damage: 20, xp: 40, coins: 30 },
      { name: 'Boss: Hidra Algébrica', icon: '🐲', hp: 500, damage: 35, xp: 200, coins: 100, isBoss: true }
    ],
    geometry: [
      { name: 'Cubo Animado', icon: '🟦', hp: 180, damage: 18, xp: 35, coins: 25 },
      { name: 'Pirâmide Viva', icon: '🔺', hp: 220, damage: 22, xp: 45, coins: 35 },
      { name: 'Esfera Sombria', icon: '⚫', hp: 280, damage: 28, xp: 55, coins: 45 },
      { name: 'Boss: Golem Geométrico', icon: '🗿', hp: 700, damage: 45, xp: 300, coins: 150, isBoss: true }
    ],
    trigonometry: [
      { name: 'Onda Senoidal', icon: '🌊', hp: 250, damage: 25, xp: 50, coins: 40 },
      { name: 'Espírito Angular', icon: '👁️', hp: 300, damage: 30, xp: 60, coins: 50 },
      { name: 'Demônio Tangente', icon: '😈', hp: 380, damage: 38, xp: 75, coins: 65 },
      { name: 'Boss: Fênix Trigonométrica', icon: '🔥', hp: 900, damage: 55, xp: 400, coins: 200, isBoss: true }
    ],
    functions: [
      { name: 'Parábola Fantasma', icon: '👤', hp: 350, damage: 35, xp: 70, coins: 55 },
      { name: 'Exponencial Maligno', icon: '📈', hp: 420, damage: 42, xp: 85, coins: 70 },
      { name: 'Logaritmo Negro', icon: '🖤', hp: 500, damage: 50, xp: 100, coins: 85 },
      { name: 'Boss: Senhor das Funções', icon: '👑', hp: 1200, damage: 70, xp: 500, coins: 250, isBoss: true }
    ],
    statistics: [
      { name: 'Média Móvel', icon: '📊', hp: 450, damage: 45, xp: 90, coins: 75 },
      { name: 'Desvio Padrão', icon: '📉', hp: 550, damage: 55, xp: 110, coins: 90 },
      { name: 'Outlier Extremo', icon: '⚡', hp: 650, damage: 65, xp: 130, coins: 110 },
      { name: 'Boss: Distribuição Normal', icon: '🎯', hp: 1500, damage: 85, xp: 600, coins: 300, isBoss: true }
    ],
    matrices: [
      { name: 'Vetor Errante', icon: '➡️', hp: 550, damage: 55, xp: 110, coins: 95 },
      { name: 'Matriz Singular', icon: '🔲', hp: 680, damage: 68, xp: 135, coins: 115 },
      { name: 'Determinante Zero', icon: '0️⃣', hp: 800, damage: 80, xp: 160, coins: 140 },
      { name: 'Boss: Transformação Linear', icon: '🌀', hp: 1800, damage: 100, xp: 700, coins: 350, isBoss: true }
    ],
    sequences: [
      { name: 'Termo Geral', icon: '🔄', hp: 700, damage: 70, xp: 140, coins: 120 },
      { name: 'Razão Comum', icon: '➗', hp: 850, damage: 85, xp: 170, coins: 145 },
      { name: 'Série Infinita', icon: '♾️', hp: 1000, damage: 100, xp: 200, coins: 175 },
      { name: 'Boss: Fibonacci Dourado', icon: '🐚', hp: 2200, damage: 120, xp: 800, coins: 400, isBoss: true }
    ],
    combinatorics: [
      { name: 'Fatorial!', icon: '❗', hp: 900, damage: 90, xp: 180, coins: 155 },
      { name: 'Arranjo Caótico', icon: '🎰', hp: 1100, damage: 110, xp: 220, coins: 190 },
      { name: 'Combinação Perfeita', icon: '🎯', hp: 1300, damage: 130, xp: 260, coins: 225 },
      { name: 'Boss: Binômio de Newton', icon: '🍎', hp: 2800, damage: 150, xp: 1000, coins: 500, isBoss: true }
    ],
    calculus: [
      { name: 'Limite Infinito', icon: '🌟', hp: 1200, damage: 120, xp: 240, coins: 200 },
      { name: 'Derivada Parcial', icon: '∂', hp: 1500, damage: 150, xp: 300, coins: 250 },
      { name: 'Integral Definida', icon: '∫', hp: 1800, damage: 180, xp: 360, coins: 300 },
      { name: 'Boss: Teorema Fundamental', icon: '📜', hp: 4000, damage: 200, xp: 2000, coins: 1000, isBoss: true }
    ]
  },

  // Equipamentos
  equipment: {
    weapons: [
      { id: 'stick', name: 'Varinha Básica', icon: '🪄', damage: 5, price: 0 },
      { id: 'sword', name: 'Espada +1', icon: '🗡️', damage: 10, price: 100 },
      { id: 'staff', name: 'Cajado Arcano', icon: '🔮', damage: 20, price: 500 },
      { id: 'axe', name: 'Machado de Guerra', icon: '🪓', damage: 35, price: 1500 },
      { id: 'hammer', name: 'Martelo Rúnico', icon: '🔨', damage: 55, price: 4000 },
      { id: 'legendary', name: 'Excalibur Matemática', icon: '⚔️', damage: 100, price: 15000 }
    ],
    armor: [
      { id: 'clothes', name: 'Roupas Simples', icon: '👕', defense: 0, price: 0 },
      { id: 'leather', name: 'Armadura de Couro', icon: '🥋', defense: 10, price: 150 },
      { id: 'chainmail', name: 'Cota de Malha', icon: '🛡️', defense: 25, price: 750 },
      { id: 'plate', name: 'Armadura de Placas', icon: '🦺', defense: 45, price: 2500 },
      { id: 'dragon', name: 'Armadura de Dragão', icon: '🐉', defense: 70, price: 8000 },
      { id: 'divine', name: 'Armadura Divina', icon: '✨', defense: 120, price: 25000 }
    ],
    accessories: [
      { id: 'ring1', name: 'Anel de Foco', icon: '💍', bonus: 'xp', value: 1.1, price: 200 },
      { id: 'amulet', name: 'Amuleto da Sorte', icon: '📿', bonus: 'coins', value: 1.2, price: 300 },
      { id: 'ring2', name: 'Anel de Poder', icon: '💎', bonus: 'damage', value: 1.15, price: 1000 },
      { id: 'crown', name: 'Coroa do Sábio', icon: '👑', bonus: 'xp', value: 1.5, price: 5000 },
      { id: 'cape', name: 'Capa Mística', icon: '🧣', bonus: 'all', value: 1.1, price: 10000 }
    ]
  },

  // Conquistas
  achievements: [
    { id: 'first_battle', name: 'Primeira Batalha', desc: 'Vença sua primeira batalha', icon: '⚔️', reward: 50 },
    { id: 'level_10', name: 'Aprendiz', desc: 'Alcance nível 10', icon: '📚', reward: 100 },
    { id: 'level_25', name: 'Estudante', desc: 'Alcance nível 25', icon: '🎓', reward: 250 },
    { id: 'level_50', name: 'Matemático', desc: 'Alcance nível 50', icon: '🧮', reward: 500 },
    { id: 'level_100', name: 'Mestre', desc: 'Alcance nível 100', icon: '👨‍🏫', reward: 1000 },
    { id: 'perfect_10', name: 'Precisão', desc: '10 respostas certas seguidas', icon: '🎯', reward: 200 },
    { id: 'perfect_25', name: 'Perfeição', desc: '25 respostas certas seguidas', icon: '💯', reward: 500 },
    { id: 'speed_demon', name: 'Velocista', desc: 'Responda em menos de 3 segundos', icon: '⚡', reward: 150 },
    { id: 'world_1', name: 'Conquistador Aritmético', desc: 'Complete o Reino da Aritmética', icon: '🏰', reward: 300 },
    { id: 'world_2', name: 'Mestre Algébrico', desc: 'Complete a Floresta Algébrica', icon: '🌲', reward: 500 },
    { id: 'world_3', name: 'Senhor Geométrico', desc: 'Complete o Templo da Geometria', icon: '🔺', reward: 700 },
    { id: 'boss_slayer', name: 'Caçador de Chefes', desc: 'Derrote 10 chefes', icon: '🐉', reward: 1000 },
    { id: 'rich', name: 'Milionário', desc: 'Acumule 10.000 moedas', icon: '💰', reward: 500 },
    { id: 'collector', name: 'Colecionador', desc: 'Compre 10 itens', icon: '🛒', reward: 300 },
    { id: 'daily_streak', name: 'Dedicação', desc: '7 dias seguidos jogando', icon: '📅', reward: 700 }
  ],

  // Skins de personagem
  skins: [
    { id: 'default', name: 'Padrão', icon: '👤', price: 0 },
    { id: 'fire', name: 'Mago de Fogo', icon: '🔥', price: 500 },
    { id: 'ice', name: 'Mago de Gelo', icon: '❄️', price: 500 },
    { id: 'nature', name: 'Druida', icon: '🌿', price: 500 },
    { id: 'dark', name: 'Mago das Trevas', icon: '🌑', price: 1000 },
    { id: 'light', name: 'Paladino', icon: '☀️', price: 1000 },
    { id: 'robot', name: 'Androide', icon: '🤖', price: 2000 },
    { id: 'ninja', name: 'Ninja Matemático', icon: '🥷', price: 2000 },
    { id: 'alien', name: 'Alienígena', icon: '👽', price: 3000 },
    { id: 'legend', name: 'Lendário', icon: '🦸', price: 5000, special: true }
  ]
};

// ==================== GERADOR DE PROBLEMAS ====================
const ProblemGenerator = {
  generate(worldId, level) {
    const difficulty = Math.min(10, Math.floor(level / 5) + 1);

    switch(worldId) {
      case 'arithmetic': return this.arithmetic(difficulty);
      case 'algebra': return this.algebra(difficulty);
      case 'geometry': return this.geometry(difficulty);
      case 'trigonometry': return this.trigonometry(difficulty);
      case 'functions': return this.functions(difficulty);
      case 'statistics': return this.statistics(difficulty);
      case 'matrices': return this.matrices(difficulty);
      case 'sequences': return this.sequences(difficulty);
      case 'combinatorics': return this.combinatorics(difficulty);
      case 'calculus': return this.calculus(difficulty);
      default: return this.arithmetic(difficulty);
    }
  },

  arithmetic(diff) {
    const types = ['add', 'sub', 'mul', 'div', 'pow', 'root'];
    const type = types[Math.min(diff - 1, types.length - 1)];
    const max = diff * 10;

    let a, b, answer, question;

    switch(type) {
      case 'add':
        a = Math.floor(Math.random() * max) + 1;
        b = Math.floor(Math.random() * max) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        break;
      case 'sub':
        a = Math.floor(Math.random() * max) + diff;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        question = `${a} - ${b} = ?`;
        break;
      case 'mul':
        a = Math.floor(Math.random() * (max/2)) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        question = `${a} × ${b} = ?`;
        break;
      case 'div':
        b = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * max) + 1;
        a = answer * b;
        question = `${a} ÷ ${b} = ?`;
        break;
      case 'pow':
        a = Math.floor(Math.random() * 10) + 2;
        b = Math.floor(Math.random() * 3) + 2;
        answer = Math.pow(a, b);
        question = `${a}^${b} = ?`;
        break;
      case 'root':
        answer = Math.floor(Math.random() * 12) + 2;
        a = answer * answer;
        question = `√${a} = ?`;
        break;
    }

    return this.createOptions(question, answer, 'number');
  },

  algebra(diff) {
    const types = ['linear', 'quadratic', 'system'];
    const type = types[Math.min(Math.floor(diff/3), types.length - 1)];

    let answer, question, options;

    switch(type) {
      case 'linear':
        // ax + b = c
        const a1 = Math.floor(Math.random() * 5) + 1;
        const x1 = Math.floor(Math.random() * 10) + 1;
        const b1 = Math.floor(Math.random() * 20) - 10;
        const c1 = a1 * x1 + b1;
        answer = x1;
        question = `Se ${a1}x ${b1 >= 0 ? '+' : ''} ${b1} = ${c1}, qual o valor de x?`;
        break;
      case 'quadratic':
        // x² - (a+b)x + ab = 0
        const r1 = Math.floor(Math.random() * 8) + 1;
        const r2 = Math.floor(Math.random() * 8) + 1;
        const sum = r1 + r2;
        const prod = r1 * r2;
        answer = Math.max(r1, r2);
        question = `x² - ${sum}x + ${prod} = 0\nQual a maior raiz?`;
        break;
      case 'system':
        // Simple 2x2 system
        const xs = Math.floor(Math.random() * 5) + 1;
        const ys = Math.floor(Math.random() * 5) + 1;
        const a2 = Math.floor(Math.random() * 3) + 1;
        const b2 = Math.floor(Math.random() * 3) + 1;
        const c2 = a2 * xs + b2 * ys;
        const a3 = Math.floor(Math.random() * 3) + 1;
        const b3 = Math.floor(Math.random() * 3) + 1;
        const c3 = a3 * xs + b3 * ys;
        answer = xs;
        question = `Sistema:\n${a2}x + ${b2}y = ${c2}\n${a3}x + ${b3}y = ${c3}\nQual o valor de x?`;
        break;
    }

    return this.createOptions(question, answer, 'number');
  },

  geometry(diff) {
    const types = ['area_rect', 'area_tri', 'area_circle', 'perimeter', 'pythagoras', 'volume'];
    const type = types[Math.min(Math.floor(diff/2), types.length - 1)];

    let answer, question;

    switch(type) {
      case 'area_rect':
        const w = Math.floor(Math.random() * 10) + 2;
        const h = Math.floor(Math.random() * 10) + 2;
        answer = w * h;
        question = `Área do retângulo com base ${w} e altura ${h}?`;
        break;
      case 'area_tri':
        const base = Math.floor(Math.random() * 10) + 2;
        const altura = Math.floor(Math.random() * 10) + 2;
        answer = (base * altura) / 2;
        question = `Área do triângulo com base ${base} e altura ${altura}?`;
        break;
      case 'area_circle':
        const r = Math.floor(Math.random() * 5) + 1;
        answer = Math.round(Math.PI * r * r);
        question = `Área do círculo com raio ${r}? (use π ≈ 3.14, arredonde)`;
        break;
      case 'perimeter':
        const l = Math.floor(Math.random() * 10) + 2;
        answer = 4 * l;
        question = `Perímetro do quadrado de lado ${l}?`;
        break;
      case 'pythagoras':
        const cat1 = [3, 4, 5, 6, 8, 5, 7, 8, 9, 12][Math.floor(Math.random() * 10)];
        const cat2 = [4, 3, 12, 8, 6, 12, 24, 15, 12, 5][Math.floor(Math.random() * 10)];
        answer = Math.sqrt(cat1*cat1 + cat2*cat2);
        question = `Hipotenusa do triângulo com catetos ${cat1} e ${cat2}?`;
        break;
      case 'volume':
        const lado = Math.floor(Math.random() * 5) + 2;
        answer = lado * lado * lado;
        question = `Volume do cubo de aresta ${lado}?`;
        break;
    }

    return this.createOptions(question, answer, 'number');
  },

  trigonometry(diff) {
    const angles = [0, 30, 45, 60, 90];
    const angle = angles[Math.floor(Math.random() * angles.length)];
    const funcs = ['sen', 'cos', 'tan'];
    const func = funcs[Math.floor(Math.random() * (angle === 90 ? 2 : 3))];

    let answer, question;
    const values = {
      sen: { 0: 0, 30: 0.5, 45: 0.71, 60: 0.87, 90: 1 },
      cos: { 0: 1, 30: 0.87, 45: 0.71, 60: 0.5, 90: 0 },
      tan: { 0: 0, 30: 0.58, 45: 1, 60: 1.73 }
    };

    answer = values[func][angle];
    question = `Qual o valor de ${func}(${angle}°)?\n(Arredonde para 2 decimais)`;

    return this.createOptions(question, answer, 'decimal');
  },

  functions(diff) {
    const types = ['linear_value', 'quadratic_vertex', 'exponential'];
    const type = types[Math.floor(Math.random() * Math.min(diff/3 + 1, types.length))];

    let answer, question;

    switch(type) {
      case 'linear_value':
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) - 5;
        const x = Math.floor(Math.random() * 5) + 1;
        answer = a * x + b;
        question = `Se f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}\nQual o valor de f(${x})?`;
        break;
      case 'quadratic_vertex':
        const a2 = Math.floor(Math.random() * 3) + 1;
        const xv = Math.floor(Math.random() * 5);
        answer = xv;
        question = `f(x) = ${a2}(x - ${xv})² + 3\nQual o x do vértice?`;
        break;
      case 'exponential':
        const base = 2;
        const exp = Math.floor(Math.random() * 4) + 1;
        answer = Math.pow(base, exp);
        question = `Se f(x) = 2^x\nQual o valor de f(${exp})?`;
        break;
    }

    return this.createOptions(question, answer, 'number');
  },

  statistics(diff) {
    const types = ['mean', 'median', 'mode', 'probability'];
    const type = types[Math.floor(Math.random() * Math.min(diff/2 + 1, types.length))];

    let answer, question;
    const nums = Array.from({length: 5}, () => Math.floor(Math.random() * 10) + 1);

    switch(type) {
      case 'mean':
        answer = nums.reduce((a,b) => a+b, 0) / nums.length;
        question = `Média de: ${nums.join(', ')}?`;
        break;
      case 'median':
        const sorted = [...nums].sort((a,b) => a-b);
        answer = sorted[2];
        question = `Mediana de: ${nums.join(', ')}?`;
        break;
      case 'mode':
        nums[2] = nums[1];
        answer = nums[1];
        question = `Moda de: ${nums.join(', ')}?`;
        break;
      case 'probability':
        const total = Math.floor(Math.random() * 10) + 5;
        const favorable = Math.floor(Math.random() * total) + 1;
        answer = Math.round((favorable / total) * 100);
        question = `Prob. de tirar 1 item específico\nde ${total} itens? (em %)`;
        break;
    }

    return this.createOptions(question, Math.round(answer * 100) / 100, 'number');
  },

  matrices(diff) {
    // Simplified matrix problems
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const c = Math.floor(Math.random() * 5) + 1;
    const d = Math.floor(Math.random() * 5) + 1;

    const det = a * d - b * c;
    const question = `Determinante da matriz:\n| ${a}  ${b} |\n| ${c}  ${d} |`;

    return this.createOptions(question, det, 'number');
  },

  sequences(diff) {
    const types = ['pa', 'pg'];
    const type = types[Math.floor(Math.random() * types.length)];

    let answer, question;

    if (type === 'pa') {
      const a1 = Math.floor(Math.random() * 5) + 1;
      const r = Math.floor(Math.random() * 5) + 1;
      const n = Math.floor(Math.random() * 5) + 5;
      answer = a1 + (n - 1) * r;
      question = `PA: primeiro termo = ${a1}, razão = ${r}\nQual o ${n}º termo?`;
    } else {
      const a1 = Math.floor(Math.random() * 3) + 1;
      const q = Math.floor(Math.random() * 3) + 2;
      const n = Math.floor(Math.random() * 3) + 3;
      answer = a1 * Math.pow(q, n - 1);
      question = `PG: primeiro termo = ${a1}, razão = ${q}\nQual o ${n}º termo?`;
    }

    return this.createOptions(question, answer, 'number');
  },

  combinatorics(diff) {
    const types = ['factorial', 'permutation', 'combination'];
    const type = types[Math.floor(Math.random() * Math.min(diff/3 + 1, types.length))];

    let answer, question;

    const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);

    switch(type) {
      case 'factorial':
        const n1 = Math.floor(Math.random() * 5) + 3;
        answer = factorial(n1);
        question = `Quanto é ${n1}! (fatorial de ${n1})?`;
        break;
      case 'permutation':
        const n2 = Math.floor(Math.random() * 3) + 3;
        answer = factorial(n2);
        question = `De quantas formas podemos\narranjar ${n2} pessoas em fila?`;
        break;
      case 'combination':
        const n3 = Math.floor(Math.random() * 3) + 4;
        const k = 2;
        answer = factorial(n3) / (factorial(k) * factorial(n3 - k));
        question = `C(${n3},${k}) = ?\n(Combinação de ${n3}, ${k} a ${k})`;
        break;
    }

    return this.createOptions(question, answer, 'number');
  },

  calculus(diff) {
    const types = ['limit', 'derivative', 'integral'];
    const type = types[Math.floor(Math.random() * Math.min(diff/3 + 1, types.length))];

    let answer, question;

    switch(type) {
      case 'limit':
        const a = Math.floor(Math.random() * 5) + 1;
        answer = a;
        question = `lim (x→${a}) x = ?`;
        break;
      case 'derivative':
        const n = Math.floor(Math.random() * 4) + 2;
        answer = n;
        question = `Se f(x) = x^${n}\nQual o coeficiente de x^${n-1} em f'(x)?`;
        break;
      case 'integral':
        const c = Math.floor(Math.random() * 5) + 1;
        answer = c;
        question = `∫ ${c} dx = ${c}x + C\nQual o valor de ${c}?`;
        break;
    }

    return this.createOptions(question, answer, 'number');
  },

  createOptions(question, answer, type) {
    let options = [answer];

    while (options.length < 4) {
      let wrong;
      if (type === 'decimal') {
        wrong = Math.round((answer + (Math.random() - 0.5) * 2) * 100) / 100;
      } else {
        const offset = Math.floor(Math.random() * 10) - 5;
        wrong = answer + (offset === 0 ? 1 : offset);
      }

      if (!options.includes(wrong) && wrong >= 0) {
        options.push(wrong);
      }
    }

    // Embaralhar
    options.sort(() => Math.random() - 0.5);

    return {
      question,
      options,
      correctIndex: options.indexOf(answer),
      answer
    };
  }
};

// ==================== ESTADO DO JOGO ====================
let gameState = {
  screen: 'title',
  player: null,
  currentWorld: null,
  currentLevel: 1,
  battle: null,
  tutorial: { shown: false, page: 0 },
  particles: [],
  animations: [],
  lastTime: 0,
  deltaTime: 0
};

// Carregar dados do jogador
function loadPlayer() {
  const saved = localStorage.getItem('mathquest_player');
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
}

function savePlayer() {
  localStorage.setItem('mathquest_player', JSON.stringify(gameState.player));
}

function createNewPlayer(name, classId) {
  const playerClass = GameData.classes.find(c => c.id === classId);
  return {
    name,
    class: classId,
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: 100,
    maxHp: 100,
    coins: 50,
    gems: 5,

    // Estatísticas
    stats: {
      battles: 0,
      wins: 0,
      perfectAnswers: 0,
      streak: 0,
      bestStreak: 0,
      bossesDefeated: 0,
      totalDamage: 0,
      fastAnswers: 0
    },

    // Progresso
    progress: {
      arithmetic: { unlocked: true, completed: 0, stars: {} },
      algebra: { unlocked: false, completed: 0, stars: {} },
      geometry: { unlocked: false, completed: 0, stars: {} },
      trigonometry: { unlocked: false, completed: 0, stars: {} },
      functions: { unlocked: false, completed: 0, stars: {} },
      statistics: { unlocked: false, completed: 0, stars: {} },
      matrices: { unlocked: false, completed: 0, stars: {} },
      sequences: { unlocked: false, completed: 0, stars: {} },
      combinatorics: { unlocked: false, completed: 0, stars: {} },
      calculus: { unlocked: false, completed: 0, stars: {} }
    },

    // Equipamentos
    equipment: {
      weapon: 'stick',
      armor: 'clothes',
      accessory: null
    },

    // Inventário
    inventory: {
      weapons: ['stick'],
      armor: ['clothes'],
      accessories: [],
      potions: 3,
      revives: 1
    },

    // Customização
    skin: 'default',
    unlockedSkins: ['default'],

    // Conquistas
    achievements: [],

    // Diário
    dailyStreak: 0,
    lastPlayDate: null,
    dailyChallengeCompleted: false
  };
}

// ==================== RENDERIZAÇÃO ====================
function render() {
  // Limpar canvas
  ctx.fillStyle = '#0a0a20';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  switch(gameState.screen) {
    case 'title': renderTitle(); break;
    case 'tutorial': renderTutorial(); break;
    case 'create': renderCreateCharacter(); break;
    case 'menu': renderMainMenu(); break;
    case 'worlds': renderWorlds(); break;
    case 'levels': renderLevels(); break;
    case 'battle': renderBattle(); break;
    case 'shop': renderShop(); break;
    case 'profile': renderProfile(); break;
    case 'achievements': renderAchievements(); break;
    case 'settings': renderSettings(); break;
  }

  // Renderizar partículas
  renderParticles();
}

function renderTitle() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Background com gradiente
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1a1a4e');
  grad.addColorStop(0.5, '#0d0d2b');
  grad.addColorStop(1, '#050515');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Estrelas de fundo
  for (let i = 0; i < 50; i++) {
    const x = (i * 73) % canvas.width;
    const y = (i * 97) % canvas.height;
    const size = (i % 3) + 1;
    const alpha = 0.3 + Math.sin(Date.now() / 1000 + i) * 0.2;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Logo animado
  const bounce = Math.sin(Date.now() / 500) * 10;

  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 20;
  ctx.fillText('🧙‍♂️', cx, cy - 100 + bounce);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 48px Arial Black';
  ctx.fillStyle = '#fff';
  ctx.fillText('MATH QUEST', cx, cy - 20);

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText('RPG', cx, cy + 20);

  ctx.font = '16px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Aprenda matemática através de batalhas épicas!', cx, cy + 60);

  // Botões
  const hasPlayer = loadPlayer() !== null;

  drawButton(cx, cy + 140, 200, 50, hasPlayer ? 'CONTINUAR' : 'NOVO JOGO', '#4CAF50', () => {
    if (hasPlayer) {
      gameState.player = loadPlayer();
      checkDailyStreak();
      gameState.screen = 'menu';
    } else {
      gameState.screen = 'tutorial';
    }
  });

  if (hasPlayer) {
    drawButton(cx, cy + 200, 200, 40, 'Novo Jogo', '#ff6b6b', () => {
      if (confirm('Isso apagará seu progresso atual. Continuar?')) {
        localStorage.removeItem('mathquest_player');
        gameState.screen = 'tutorial';
      }
    });
  }

  // Versão
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('v1.0 - EAI Games', cx, canvas.height - 20);
}

function renderTutorial() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const tutorials = [
    {
      title: 'Bem-vindo ao Math Quest RPG!',
      icon: '🧙‍♂️',
      text: 'Embarque em uma aventura épica onde você aprenderá matemática através de batalhas!'
    },
    {
      title: 'Batalhas por Turnos',
      icon: '⚔️',
      text: 'Responda problemas matemáticos corretamente para causar dano nos inimigos. Respostas erradas fazem você perder vida!'
    },
    {
      title: '10 Mundos para Explorar',
      icon: '🌍',
      text: 'Do básico ao cálculo! Cada mundo tem 50 níveis com desafios únicos e chefes poderosos.'
    },
    {
      title: 'Evolua seu Personagem',
      icon: '📈',
      text: 'Ganhe XP, suba de nível, compre equipamentos e desbloqueie novas habilidades!'
    },
    {
      title: 'Pronto para começar?',
      icon: '🎮',
      text: 'Crie seu personagem e comece sua jornada matemática!'
    }
  ];

  const page = gameState.tutorial.page;
  const tut = tutorials[page];

  // Background
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
  grad.addColorStop(0, '#2a2a5e');
  grad.addColorStop(1, '#0a0a20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(cx - 180, cy - 150, 360, 300, 20);
  ctx.fill();

  // Conteúdo
  ctx.font = '60px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(tut.icon, cx, cy - 70);

  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(tut.title, cx, cy);

  ctx.font = '16px Arial';
  ctx.fillStyle = '#ddd';
  wrapText(tut.text, cx, cy + 40, 300, 22);

  // Indicadores de página
  for (let i = 0; i < tutorials.length; i++) {
    ctx.beginPath();
    ctx.arc(cx - 40 + i * 20, cy + 110, 6, 0, Math.PI * 2);
    ctx.fillStyle = i === page ? '#ffd700' : '#555';
    ctx.fill();
  }

  // Botões
  if (page > 0) {
    drawButton(cx - 100, cy + 160, 80, 40, '← Voltar', '#666', () => {
      gameState.tutorial.page--;
    });
  }

  if (page < tutorials.length - 1) {
    drawButton(cx + 100, cy + 160, 80, 40, 'Próximo →', '#4CAF50', () => {
      gameState.tutorial.page++;
    });
  } else {
    drawButton(cx, cy + 160, 150, 45, 'CRIAR HERÓI', '#ffd700', () => {
      gameState.screen = 'create';
    });
  }
}

function renderCreateCharacter() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1a3a5c');
  grad.addColorStop(1, '#0d1d2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('Crie seu Herói', cx, 60);

  // Nome
  ctx.font = '18px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Nome do Herói:', cx, 110);

  // Input de nome (simulado)
  ctx.fillStyle = '#1a1a3e';
  roundRect(cx - 150, 120, 300, 45, 10);
  ctx.fill();
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  roundRect(cx - 150, 120, 300, 45, 10);
  ctx.stroke();

  const playerName = gameState.playerName || 'Herói';
  ctx.font = '20px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(playerName, cx, 150);

  // Classes
  ctx.font = '18px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Escolha sua Classe:', cx, 200);

  const selectedClass = gameState.selectedClass || 'mage';

  GameData.classes.forEach((cls, i) => {
    const x = cx - 150 + (i % 2) * 150;
    const y = 220 + Math.floor(i / 2) * 100;
    const selected = selectedClass === cls.id;

    ctx.fillStyle = selected ? cls.color + '40' : '#1a1a3e';
    roundRect(x, y, 140, 85, 10);
    ctx.fill();

    if (selected) {
      ctx.strokeStyle = cls.color;
      ctx.lineWidth = 3;
      roundRect(x, y, 140, 85, 10);
      ctx.stroke();
    }

    ctx.font = '30px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(cls.icon, x + 70, y + 35);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = selected ? cls.color : '#aaa';
    ctx.fillText(cls.name, x + 70, y + 60);

    ctx.font = '11px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText(`Dano: x${cls.bonusDamage} | XP: x${cls.bonusXP}`, x + 70, y + 78);

    // Área clicável
    gameState.clickAreas = gameState.clickAreas || [];
    gameState.clickAreas.push({
      x, y, w: 140, h: 85,
      action: () => { gameState.selectedClass = cls.id; }
    });
  });

  // Botão criar
  drawButton(cx, cy + 180, 200, 50, 'COMEÇAR AVENTURA', '#4CAF50', () => {
    gameState.player = createNewPlayer(gameState.playerName || 'Herói', gameState.selectedClass || 'mage');
    savePlayer();
    gameState.screen = 'menu';
  });
}

function renderMainMenu() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1a1a4e');
  grad.addColorStop(1, '#0a0a20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header com info do jogador
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, canvas.width, 120);

  // Avatar
  const playerClass = GameData.classes.find(c => c.id === player.class);
  ctx.font = '50px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(playerClass.icon, 20, 70);

  // Info
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(player.name, 90, 40);

  ctx.font = '14px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`Nível ${player.level} - ${playerClass.name}`, 90, 60);

  // Barra de XP
  ctx.fillStyle = '#333';
  roundRect(90, 70, 150, 12, 6);
  ctx.fill();

  const xpPercent = player.xp / player.xpToNext;
  ctx.fillStyle = '#4CAF50';
  roundRect(90, 70, 150 * xpPercent, 12, 6);
  ctx.fill();

  ctx.font = '10px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`${player.xp}/${player.xpToNext} XP`, 165, 80);

  // Moedas e Gemas
  ctx.textAlign = 'right';
  ctx.font = '18px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`💰 ${player.coins}`, canvas.width - 20, 40);
  ctx.fillStyle = '#00ffcc';
  ctx.fillText(`💎 ${player.gems}`, canvas.width - 20, 65);

  // HP
  ctx.fillStyle = '#ff6b6b';
  ctx.fillText(`❤️ ${player.hp}/${player.maxHp}`, canvas.width - 20, 90);

  // Menu principal
  const menuY = 160;
  ctx.textAlign = 'center';

  const menuItems = [
    { icon: '🗺️', label: 'AVENTURA', color: '#4CAF50', action: () => { gameState.screen = 'worlds'; }},
    { icon: '🏪', label: 'LOJA', color: '#FF9800', action: () => { gameState.screen = 'shop'; }},
    { icon: '👤', label: 'PERFIL', color: '#2196F3', action: () => { gameState.screen = 'profile'; }},
    { icon: '🏆', label: 'CONQUISTAS', color: '#9C27B0', action: () => { gameState.screen = 'achievements'; }},
    { icon: '⚙️', label: 'OPÇÕES', color: '#607D8B', action: () => { gameState.screen = 'settings'; }}
  ];

  menuItems.forEach((item, i) => {
    const x = cx - 80 + (i % 2) * 160;
    const y = menuY + Math.floor(i / 2) * 110;

    if (i === menuItems.length - 1 && menuItems.length % 2 === 1) {
      // Centralizar último item ímpar
      drawMenuCard(cx, y, item);
    } else {
      drawMenuCard(x, y, item);
    }
  });

  // Daily Challenge
  if (!player.dailyChallengeCompleted) {
    ctx.fillStyle = 'rgba(255,215,0,0.1)';
    roundRect(20, canvas.height - 100, canvas.width - 40, 80, 15);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    roundRect(20, canvas.height - 100, canvas.width - 40, 80, 15);
    ctx.stroke();

    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('🎯 DESAFIO DIÁRIO', 40, canvas.height - 65);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Complete 5 batalhas para ganhar 100 moedas!', 40, canvas.height - 40);

    drawButton(canvas.width - 100, canvas.height - 60, 60, 30, 'IR', '#ffd700', () => {
      gameState.screen = 'worlds';
    });
  }
}

function drawMenuCard(x, y, item) {
  ctx.fillStyle = item.color + '30';
  roundRect(x - 65, y, 130, 90, 15);
  ctx.fill();

  ctx.strokeStyle = item.color;
  ctx.lineWidth = 2;
  roundRect(x - 65, y, 130, 90, 15);
  ctx.stroke();

  ctx.font = '35px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(item.icon, x, y + 40);

  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = item.color;
  ctx.fillText(item.label, x, y + 70);

  gameState.clickAreas = gameState.clickAreas || [];
  gameState.clickAreas.push({
    x: x - 65, y, w: 130, h: 90,
    action: item.action
  });
}

function renderWorlds() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0d1d2e');
  grad.addColorStop(1, '#050510');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => {
    gameState.screen = 'menu';
  });

  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('🗺️ MUNDOS', cx, 40);

  // Lista de mundos (scrollable)
  const startY = 80;
  const cardHeight = 100;
  const scrollOffset = gameState.worldScroll || 0;

  GameData.worlds.forEach((world, i) => {
    const y = startY + i * (cardHeight + 15) - scrollOffset;

    if (y < 60 || y > canvas.height) return;

    const unlocked = player.level >= world.unlockLevel;
    const progress = player.progress[world.id];
    const completed = progress ? progress.completed : 0;

    // Card do mundo
    ctx.fillStyle = unlocked ? world.color + '30' : '#1a1a2e';
    roundRect(20, y, canvas.width - 40, cardHeight, 15);
    ctx.fill();

    if (unlocked) {
      ctx.strokeStyle = world.color;
      ctx.lineWidth = 2;
      roundRect(20, y, canvas.width - 40, cardHeight, 15);
      ctx.stroke();
    }

    // Ícone
    ctx.font = '40px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = unlocked ? '#fff' : '#555';
    ctx.fillText(world.icon, 35, y + 55);

    // Nome e descrição
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = unlocked ? '#fff' : '#666';
    ctx.fillText(world.name, 90, y + 35);

    ctx.font = '13px Arial';
    ctx.fillStyle = unlocked ? '#aaa' : '#555';
    ctx.fillText(world.description, 90, y + 55);

    // Progresso
    if (unlocked) {
      ctx.fillStyle = '#333';
      roundRect(90, y + 65, 150, 10, 5);
      ctx.fill();

      ctx.fillStyle = world.color;
      roundRect(90, y + 65, 150 * (completed / world.levels), 10, 5);
      ctx.fill();

      ctx.font = '11px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${completed}/${world.levels} níveis`, 250, y + 74);
    } else {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText(`🔒 Requer nível ${world.unlockLevel}`, 90, y + 75);
    }

    // Área clicável
    if (unlocked) {
      gameState.clickAreas = gameState.clickAreas || [];
      gameState.clickAreas.push({
        x: 20, y, w: canvas.width - 40, h: cardHeight,
        action: () => {
          gameState.currentWorld = world;
          gameState.screen = 'levels';
        }
      });
    }
  });
}

function renderLevels() {
  const cx = canvas.width / 2;
  const world = gameState.currentWorld;
  const player = gameState.player;
  const progress = player.progress[world.id];

  // Background com cor do mundo
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, world.bgGradient[0]);
  grad.addColorStop(1, world.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 80);

  drawButton(50, 25, 80, 30, '← Voltar', '#666', () => {
    gameState.screen = 'worlds';
  });

  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(world.icon, cx, 35);

  ctx.font = 'bold 18px Arial';
  ctx.fillText(world.name, cx, 60);

  // Grid de níveis
  const cols = 5;
  const cellSize = Math.min((canvas.width - 60) / cols, 70);
  const startX = (canvas.width - cols * cellSize) / 2;
  const startY = 100;
  const scrollOffset = gameState.levelScroll || 0;

  for (let i = 0; i < world.levels; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * cellSize + cellSize / 2;
    const y = startY + row * cellSize - scrollOffset;

    if (y < 80 || y > canvas.height) continue;

    const levelNum = i + 1;
    const unlocked = levelNum <= progress.completed + 1;
    const completed = levelNum <= progress.completed;
    const stars = progress.stars[levelNum] || 0;
    const isBoss = levelNum % 10 === 0;

    // Célula do nível
    ctx.beginPath();
    ctx.arc(x, y, cellSize / 2 - 8, 0, Math.PI * 2);

    if (completed) {
      ctx.fillStyle = world.color;
    } else if (unlocked) {
      ctx.fillStyle = world.color + '80';
    } else {
      ctx.fillStyle = '#2a2a4e';
    }
    ctx.fill();

    if (isBoss) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Número/ícone
    ctx.font = isBoss ? '20px Arial' : 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = unlocked ? '#fff' : '#555';
    ctx.fillText(isBoss ? '👑' : levelNum, x, y + 6);

    // Estrelas
    if (completed && stars > 0) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('⭐'.repeat(stars), x, y + 22);
    }

    // Área clicável
    if (unlocked) {
      gameState.clickAreas = gameState.clickAreas || [];
      gameState.clickAreas.push({
        x: x - cellSize/2, y: y - cellSize/2, w: cellSize, h: cellSize,
        action: () => startBattle(levelNum)
      });
    }
  }
}

function startBattle(level) {
  const world = gameState.currentWorld;
  const player = gameState.player;
  const playerClass = GameData.classes.find(c => c.id === player.class);

  // Escolher inimigo
  const enemies = GameData.enemies[world.id];
  let enemy;

  if (level % 10 === 0) {
    // Boss a cada 10 níveis
    enemy = enemies.find(e => e.isBoss);
  } else {
    // Inimigo normal baseado no nível
    const regularEnemies = enemies.filter(e => !e.isBoss);
    const index = Math.min(Math.floor((level - 1) / 15), regularEnemies.length - 1);
    enemy = { ...regularEnemies[index] };

    // Escalar stats com o nível
    const scale = 1 + (level - 1) * 0.05;
    enemy.hp = Math.floor(enemy.hp * scale);
    enemy.damage = Math.floor(enemy.damage * scale);
    enemy.xp = Math.floor(enemy.xp * scale);
    enemy.coins = Math.floor(enemy.coins * scale);
  }

  // Calcular dano do jogador
  const weapon = GameData.equipment.weapons.find(w => w.id === player.equipment.weapon);
  const baseDamage = 10 + player.level * 2 + (weapon ? weapon.damage : 0);
  const playerDamage = Math.floor(baseDamage * playerClass.bonusDamage);

  gameState.battle = {
    level,
    enemy: { ...enemy, currentHp: enemy.hp },
    playerHp: player.hp,
    playerMaxHp: player.maxHp,
    playerDamage,
    turn: 'player',
    problem: ProblemGenerator.generate(world.id, level),
    selectedOption: null,
    result: null,
    streak: 0,
    startTime: Date.now(),
    animations: []
  };

  gameState.currentLevel = level;
  gameState.screen = 'battle';
}

function renderBattle() {
  const cx = canvas.width / 2;
  const battle = gameState.battle;
  const world = gameState.currentWorld;
  const player = gameState.player;
  const playerClass = GameData.classes.find(c => c.id === player.class);

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, world.bgGradient[0]);
  grad.addColorStop(1, world.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Info do nível
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 50);

  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${world.name} - Nível ${battle.level}`, cx, 32);

  // Inimigo
  const enemyY = 130;

  // Animação de dano no inimigo
  let enemyShake = 0;
  if (battle.animations.includes('enemy_hit')) {
    enemyShake = Math.sin(Date.now() / 30) * 10;
  }

  ctx.font = '80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(battle.enemy.icon, cx + enemyShake, enemyY);

  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = battle.enemy.isBoss ? '#ffd700' : '#fff';
  ctx.fillText(battle.enemy.name, cx, enemyY + 40);

  // HP do inimigo
  ctx.fillStyle = '#333';
  roundRect(cx - 100, enemyY + 50, 200, 20, 10);
  ctx.fill();

  const enemyHpPercent = battle.enemy.currentHp / battle.enemy.hp;
  ctx.fillStyle = enemyHpPercent > 0.5 ? '#4CAF50' : enemyHpPercent > 0.25 ? '#FF9800' : '#f44336';
  roundRect(cx - 100, enemyY + 50, 200 * enemyHpPercent, 20, 10);
  ctx.fill();

  ctx.font = '12px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${battle.enemy.currentHp}/${battle.enemy.hp}`, cx, enemyY + 65);

  // Jogador
  const playerY = canvas.height - 180;

  let playerShake = 0;
  if (battle.animations.includes('player_hit')) {
    playerShake = Math.sin(Date.now() / 30) * 10;
  }

  ctx.font = '50px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(playerClass.icon, 30 + playerShake, playerY);

  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(player.name, 95, playerY - 20);

  // HP do jogador
  ctx.fillStyle = '#333';
  roundRect(95, playerY - 10, 120, 15, 7);
  ctx.fill();

  const playerHpPercent = battle.playerHp / battle.playerMaxHp;
  ctx.fillStyle = playerHpPercent > 0.5 ? '#4CAF50' : playerHpPercent > 0.25 ? '#FF9800' : '#f44336';
  roundRect(95, playerY - 10, 120 * playerHpPercent, 15, 7);
  ctx.fill();

  ctx.font = '10px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`${battle.playerHp}/${battle.playerMaxHp}`, 155, playerY + 1);

  // Streak
  if (battle.streak > 0) {
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'right';
    ctx.fillText(`🔥 ${battle.streak}x Combo!`, canvas.width - 20, playerY);
  }

  // Área do problema
  if (battle.result === null) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(20, 220, canvas.width - 40, 180, 15);
    ctx.fill();

    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';

    // Quebrar texto do problema em linhas
    const lines = battle.problem.question.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, cx, 260 + i * 25);
    });

    // Opções de resposta
    const optionY = 320;
    battle.problem.options.forEach((opt, i) => {
      const x = cx - 90 + (i % 2) * 180;
      const y = optionY + Math.floor(i / 2) * 50;

      const selected = battle.selectedOption === i;

      ctx.fillStyle = selected ? '#4CAF50' : '#2a2a5e';
      roundRect(x - 80, y - 18, 160, 40, 10);
      ctx.fill();

      if (selected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        roundRect(x - 80, y - 18, 160, 40, 10);
        ctx.stroke();
      }

      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(opt, x, y + 7);

      gameState.clickAreas = gameState.clickAreas || [];
      gameState.clickAreas.push({
        x: x - 80, y: y - 18, w: 160, h: 40,
        action: () => selectAnswer(i)
      });
    });
  } else {
    // Mostrar resultado
    ctx.fillStyle = battle.result === 'correct' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
    roundRect(20, 220, canvas.width - 40, 180, 15);
    ctx.fill();

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(battle.result === 'correct' ? '✓' : '✗', cx, 300);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(battle.result === 'correct' ? 'CORRETO!' : 'ERRADO!', cx, 350);

    if (battle.result === 'wrong') {
      ctx.font = '16px Arial';
      ctx.fillText(`Resposta: ${battle.problem.answer}`, cx, 380);
    }
  }

  // Verificar fim da batalha
  if (battle.enemy.currentHp <= 0) {
    showVictory();
  } else if (battle.playerHp <= 0) {
    showDefeat();
  }
}

function selectAnswer(index) {
  const battle = gameState.battle;
  if (battle.result !== null) return;

  battle.selectedOption = index;
  const correct = index === battle.problem.correctIndex;

  if (correct) {
    battle.result = 'correct';
    battle.streak++;

    // Dano no inimigo
    let damage = battle.playerDamage;
    if (battle.streak >= 3) damage *= 1.5; // Bonus combo

    // Tempo de resposta
    const responseTime = (Date.now() - battle.startTime) / 1000;
    if (responseTime < 3) {
      damage *= 1.2; // Bonus velocidade
      gameState.player.stats.fastAnswers++;
    }

    battle.enemy.currentHp = Math.max(0, battle.enemy.currentHp - Math.floor(damage));
    battle.animations.push('enemy_hit');

    createParticles(canvas.width / 2, 130, '#ffd700', 10);

    // Atualizar stats
    gameState.player.stats.perfectAnswers++;
    gameState.player.stats.streak = battle.streak;
    if (battle.streak > gameState.player.stats.bestStreak) {
      gameState.player.stats.bestStreak = battle.streak;
    }
  } else {
    battle.result = 'wrong';
    battle.streak = 0;

    // Dano no jogador
    battle.playerHp = Math.max(0, battle.playerHp - battle.enemy.damage);
    battle.animations.push('player_hit');

    createParticles(50, canvas.height - 180, '#ff0000', 10);
  }

  // Próximo turno
  setTimeout(() => {
    battle.animations = [];

    if (battle.enemy.currentHp > 0 && battle.playerHp > 0) {
      battle.result = null;
      battle.selectedOption = null;
      battle.problem = ProblemGenerator.generate(gameState.currentWorld.id, battle.level);
      battle.startTime = Date.now();
    }
  }, 1500);
}

function showVictory() {
  const battle = gameState.battle;
  const player = gameState.player;
  const playerClass = GameData.classes.find(c => c.id === player.class);

  // Calcular recompensas
  const baseXP = battle.enemy.xp;
  const baseCoins = battle.enemy.coins;

  const xpMultiplier = playerClass.bonusXP;
  const finalXP = Math.floor(baseXP * xpMultiplier);
  const finalCoins = baseCoins;

  // Aplicar recompensas
  player.xp += finalXP;
  player.coins += finalCoins;
  player.hp = battle.playerHp;
  player.stats.battles++;
  player.stats.wins++;

  if (battle.enemy.isBoss) {
    player.stats.bossesDefeated++;
  }

  // Level up check
  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level++;
    player.xpToNext = Math.floor(player.xpToNext * 1.2);
    player.maxHp += 10;
    player.hp = player.maxHp;

    createParticles(canvas.width / 2, canvas.height / 2, '#ffd700', 30);
  }

  // Atualizar progresso do mundo
  const progress = player.progress[gameState.currentWorld.id];
  if (battle.level > progress.completed) {
    progress.completed = battle.level;
  }

  // Estrelas baseadas no HP restante
  const hpPercent = battle.playerHp / battle.playerMaxHp;
  const stars = hpPercent > 0.8 ? 3 : hpPercent > 0.5 ? 2 : 1;
  if (!progress.stars[battle.level] || progress.stars[battle.level] < stars) {
    progress.stars[battle.level] = stars;
  }

  // Desbloquear próximos mundos
  GameData.worlds.forEach(world => {
    if (player.level >= world.unlockLevel && !player.progress[world.id].unlocked) {
      player.progress[world.id].unlocked = true;
    }
  });

  // Checar conquistas
  checkAchievements();

  savePlayer();

  // Mostrar tela de vitória
  gameState.screen = 'victory';
  gameState.victoryData = { xp: finalXP, coins: finalCoins, stars };
}

function showDefeat() {
  gameState.player.stats.battles++;
  savePlayer();
  gameState.screen = 'defeat';
}

function renderShop() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => {
    gameState.screen = 'menu';
  });

  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('🏪 LOJA', cx, 40);

  // Moedas
  ctx.textAlign = 'right';
  ctx.font = '18px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`💰 ${player.coins}`, canvas.width - 20, 40);

  // Tabs
  const tabs = ['Armas', 'Armaduras', 'Acessórios', 'Skins'];
  const shopTab = gameState.shopTab || 'Armas';

  tabs.forEach((tab, i) => {
    const x = 30 + i * 85;
    const selected = shopTab === tab;

    ctx.fillStyle = selected ? '#4CAF50' : '#2a2a4e';
    roundRect(x, 70, 80, 30, 8);
    ctx.fill();

    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = selected ? '#fff' : '#aaa';
    ctx.fillText(tab, x + 40, 90);

    gameState.clickAreas = gameState.clickAreas || [];
    gameState.clickAreas.push({
      x, y: 70, w: 80, h: 30,
      action: () => { gameState.shopTab = tab; }
    });
  });

  // Items
  let items = [];
  switch(shopTab) {
    case 'Armas': items = GameData.equipment.weapons; break;
    case 'Armaduras': items = GameData.equipment.armor; break;
    case 'Acessórios': items = GameData.equipment.accessories; break;
    case 'Skins': items = GameData.skins; break;
  }

  const startY = 120;
  items.forEach((item, i) => {
    const y = startY + i * 70;
    if (y > canvas.height - 50) return;

    const owned = shopTab === 'Skins'
      ? player.unlockedSkins.includes(item.id)
      : player.inventory[shopTab.toLowerCase()]?.includes(item.id);
    const equipped = shopTab === 'Skins'
      ? player.skin === item.id
      : player.equipment[shopTab === 'Armas' ? 'weapon' : shopTab === 'Armaduras' ? 'armor' : 'accessory'] === item.id;

    ctx.fillStyle = equipped ? '#4CAF5040' : '#2a2a4e';
    roundRect(20, y, canvas.width - 40, 60, 10);
    ctx.fill();

    if (equipped) {
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      roundRect(20, y, canvas.width - 40, 60, 10);
      ctx.stroke();
    }

    // Ícone
    ctx.font = '30px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.icon, 35, y + 40);

    // Nome e stats
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(item.name, 80, y + 25);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    let statText = '';
    if (item.damage) statText = `+${item.damage} Dano`;
    else if (item.defense) statText = `+${item.defense} Defesa`;
    else if (item.bonus) statText = `+${Math.round((item.value - 1) * 100)}% ${item.bonus.toUpperCase()}`;
    ctx.fillText(statText, 80, y + 45);

    // Botão
    ctx.textAlign = 'right';
    if (owned) {
      if (equipped) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('EQUIPADO', canvas.width - 40, y + 38);
      } else {
        drawButton(canvas.width - 80, y + 30, 60, 28, 'Usar', '#2196F3', () => {
          equipItem(shopTab, item.id);
        });
      }
    } else {
      if (item.price > 0) {
        drawButton(canvas.width - 90, y + 30, 70, 28, `💰${item.price}`,
          player.coins >= item.price ? '#FF9800' : '#666',
          () => {
            if (player.coins >= item.price) {
              buyItem(shopTab, item);
            }
          });
      }
    }
  });
}

function buyItem(category, item) {
  const player = gameState.player;

  if (player.coins < item.price) return;

  player.coins -= item.price;

  if (category === 'Skins') {
    player.unlockedSkins.push(item.id);
  } else {
    const invKey = category.toLowerCase();
    if (!player.inventory[invKey]) {
      player.inventory[invKey] = [];
    }
    player.inventory[invKey].push(item.id);
  }

  savePlayer();
}

function equipItem(category, itemId) {
  const player = gameState.player;

  if (category === 'Skins') {
    player.skin = itemId;
  } else if (category === 'Armas') {
    player.equipment.weapon = itemId;
  } else if (category === 'Armaduras') {
    player.equipment.armor = itemId;
  } else if (category === 'Acessórios') {
    player.equipment.accessory = itemId;
  }

  savePlayer();
}

function renderProfile() {
  const cx = canvas.width / 2;
  const player = gameState.player;
  const playerClass = GameData.classes.find(c => c.id === player.class);

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, playerClass.color + '40');
  grad.addColorStop(1, '#0a0a20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => {
    gameState.screen = 'menu';
  });

  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('👤 PERFIL', cx, 40);

  // Avatar grande
  ctx.font = '100px Arial';
  ctx.fillText(playerClass.icon, cx, 160);

  // Nome e classe
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(player.name, cx, 210);

  ctx.font = '16px Arial';
  ctx.fillStyle = playerClass.color;
  ctx.fillText(`${playerClass.name} - Nível ${player.level}`, cx, 235);

  // Stats cards
  const stats = [
    { label: 'Batalhas', value: player.stats.battles, icon: '⚔️' },
    { label: 'Vitórias', value: player.stats.wins, icon: '🏆' },
    { label: 'Chefes', value: player.stats.bossesDefeated, icon: '🐉' },
    { label: 'Melhor Combo', value: player.stats.bestStreak, icon: '🔥' },
    { label: 'Taxa de Acerto', value: player.stats.battles > 0 ? Math.round(player.stats.wins / player.stats.battles * 100) + '%' : '0%', icon: '🎯' },
    { label: 'Dias Seguidos', value: player.dailyStreak, icon: '📅' }
  ];

  const startY = 270;
  stats.forEach((stat, i) => {
    const x = 30 + (i % 2) * (canvas.width / 2 - 20);
    const y = startY + Math.floor(i / 2) * 60;

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(x, y, canvas.width / 2 - 40, 50, 10);
    ctx.fill();

    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(stat.icon, x + 15, y + 35);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText(stat.label, x + 55, y + 22);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(stat.value, x + 55, y + 42);
  });

  // Equipamentos atuais
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.fillText('EQUIPAMENTOS', cx, startY + 200);

  const weapon = GameData.equipment.weapons.find(w => w.id === player.equipment.weapon);
  const armor = GameData.equipment.armor.find(a => a.id === player.equipment.armor);
  const accessory = player.equipment.accessory ? GameData.equipment.accessories.find(a => a.id === player.equipment.accessory) : null;

  ctx.font = '14px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${weapon?.icon} ${weapon?.name} | ${armor?.icon} ${armor?.name}${accessory ? ` | ${accessory.icon} ${accessory.name}` : ''}`, cx, startY + 225);
}

function renderAchievements() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => {
    gameState.screen = 'menu';
  });

  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('🏆 CONQUISTAS', cx, 40);

  // Progresso geral
  const unlocked = player.achievements.length;
  const total = GameData.achievements.length;

  ctx.font = '14px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`${unlocked}/${total} desbloqueadas`, cx, 80);

  // Lista de conquistas
  const startY = 100;
  const scrollOffset = gameState.achievementScroll || 0;

  GameData.achievements.forEach((ach, i) => {
    const y = startY + i * 70 - scrollOffset;
    if (y < 60 || y > canvas.height) return;

    const unlocked = player.achievements.includes(ach.id);

    ctx.fillStyle = unlocked ? '#4CAF5030' : '#2a2a4e';
    roundRect(20, y, canvas.width - 40, 60, 10);
    ctx.fill();

    if (unlocked) {
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      roundRect(20, y, canvas.width - 40, 60, 10);
      ctx.stroke();
    }

    // Ícone
    ctx.font = '30px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = unlocked ? '#fff' : '#555';
    ctx.fillText(ach.icon, 35, y + 40);

    // Nome e descrição
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = unlocked ? '#fff' : '#888';
    ctx.fillText(ach.name, 80, y + 25);

    ctx.font = '12px Arial';
    ctx.fillStyle = unlocked ? '#aaa' : '#666';
    ctx.fillText(ach.desc, 80, y + 45);

    // Recompensa
    ctx.textAlign = 'right';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`💰 ${ach.reward}`, canvas.width - 40, y + 38);
  });
}

function renderSettings() {
  const cx = canvas.width / 2;

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => {
    gameState.screen = 'menu';
  });

  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('⚙️ OPÇÕES', cx, 40);

  // Opções
  const options = [
    { label: 'Sons', key: 'sound', type: 'toggle' },
    { label: 'Música', key: 'music', type: 'toggle' },
    { label: 'Vibração', key: 'vibration', type: 'toggle' },
    { label: 'Notificações', key: 'notifications', type: 'toggle' }
  ];

  const settings = JSON.parse(localStorage.getItem('mathquest_settings') || '{"sound":true,"music":true,"vibration":true,"notifications":true}');

  options.forEach((opt, i) => {
    const y = 100 + i * 60;

    ctx.fillStyle = '#2a2a4e';
    roundRect(20, y, canvas.width - 40, 50, 10);
    ctx.fill();

    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(opt.label, 40, y + 32);

    // Toggle
    const toggleX = canvas.width - 80;
    const toggleOn = settings[opt.key];

    ctx.fillStyle = toggleOn ? '#4CAF50' : '#666';
    roundRect(toggleX, y + 15, 50, 25, 12);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(toggleOn ? toggleX + 38 : toggleX + 12, y + 27, 10, 0, Math.PI * 2);
    ctx.fill();

    gameState.clickAreas = gameState.clickAreas || [];
    gameState.clickAreas.push({
      x: toggleX, y: y + 15, w: 50, h: 25,
      action: () => {
        settings[opt.key] = !settings[opt.key];
        localStorage.setItem('mathquest_settings', JSON.stringify(settings));
      }
    });
  });

  // Botão de reset
  drawButton(cx, canvas.height - 100, 200, 45, 'Resetar Progresso', '#f44336', () => {
    if (confirm('Tem certeza? Todo progresso será perdido!')) {
      localStorage.removeItem('mathquest_player');
      gameState.player = null;
      gameState.screen = 'title';
    }
  });

  // Créditos
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#666';
  ctx.fillText('Math Quest RPG - EAI Games', cx, canvas.height - 40);
  ctx.fillText('Desenvolvido para aprendizado de matemática', cx, canvas.height - 25);
}

// ==================== FUNÇÕES AUXILIARES ====================
function drawButton(x, y, w, h, text, color, action) {
  ctx.fillStyle = color;
  roundRect(x - w/2, y - h/2, w, h, h/4);
  ctx.fill();

  ctx.font = `bold ${Math.min(h * 0.5, 16)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(text, x, y + 5);

  gameState.clickAreas = gameState.clickAreas || [];
  gameState.clickAreas.push({
    x: x - w/2, y: y - h/2, w, h, action
  });
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    gameState.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1,
      color,
      size: Math.random() * 5 + 2
    });
  }
}

function renderParticles() {
  gameState.particles = gameState.particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= 0.02;

    if (p.life <= 0) return false;

    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    return true;
  });
}

function checkDailyStreak() {
  const player = gameState.player;
  const today = new Date().toDateString();
  const lastPlay = player.lastPlayDate;

  if (lastPlay !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastPlay === yesterday.toDateString()) {
      player.dailyStreak++;
    } else if (lastPlay !== today) {
      player.dailyStreak = 1;
    }

    player.lastPlayDate = today;
    player.dailyChallengeCompleted = false;
    savePlayer();
  }
}

function checkAchievements() {
  const player = gameState.player;

  const checks = [
    { id: 'first_battle', condition: player.stats.wins >= 1 },
    { id: 'level_10', condition: player.level >= 10 },
    { id: 'level_25', condition: player.level >= 25 },
    { id: 'level_50', condition: player.level >= 50 },
    { id: 'level_100', condition: player.level >= 100 },
    { id: 'perfect_10', condition: player.stats.bestStreak >= 10 },
    { id: 'perfect_25', condition: player.stats.bestStreak >= 25 },
    { id: 'speed_demon', condition: player.stats.fastAnswers >= 10 },
    { id: 'boss_slayer', condition: player.stats.bossesDefeated >= 10 },
    { id: 'rich', condition: player.coins >= 10000 },
    { id: 'daily_streak', condition: player.dailyStreak >= 7 }
  ];

  checks.forEach(check => {
    if (check.condition && !player.achievements.includes(check.id)) {
      player.achievements.push(check.id);
      const ach = GameData.achievements.find(a => a.id === check.id);
      if (ach) {
        player.coins += ach.reward;
        // TODO: Show achievement popup
      }
    }
  });
}

// ==================== INPUT ====================
function handleClick(x, y) {
  if (!gameState.clickAreas) return;

  for (const area of gameState.clickAreas) {
    if (x >= area.x && x <= area.x + area.w &&
        y >= area.y && y <= area.y + area.h) {
      area.action();
      break;
    }
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  handleClick(x, y);
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  handleClick(x, y);
});

// Scroll
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
  const deltaY = touchStartY - e.touches[0].clientY;
  touchStartY = e.touches[0].clientY;

  if (gameState.screen === 'worlds') {
    gameState.worldScroll = Math.max(0, (gameState.worldScroll || 0) + deltaY);
  } else if (gameState.screen === 'levels') {
    gameState.levelScroll = Math.max(0, (gameState.levelScroll || 0) + deltaY);
  } else if (gameState.screen === 'achievements') {
    gameState.achievementScroll = Math.max(0, (gameState.achievementScroll || 0) + deltaY);
  }
});

canvas.addEventListener('wheel', (e) => {
  if (gameState.screen === 'worlds') {
    gameState.worldScroll = Math.max(0, (gameState.worldScroll || 0) + e.deltaY);
  } else if (gameState.screen === 'levels') {
    gameState.levelScroll = Math.max(0, (gameState.levelScroll || 0) + e.deltaY);
  } else if (gameState.screen === 'achievements') {
    gameState.achievementScroll = Math.max(0, (gameState.achievementScroll || 0) + e.deltaY);
  }
});

// Nome do personagem
document.addEventListener('keydown', (e) => {
  if (gameState.screen === 'create') {
    if (e.key === 'Backspace') {
      gameState.playerName = (gameState.playerName || '').slice(0, -1);
    } else if (e.key.length === 1 && (gameState.playerName || '').length < 15) {
      gameState.playerName = (gameState.playerName || '') + e.key;
    }
  }
});

// ==================== GAME LOOP ====================
function gameLoop(timestamp) {
  gameState.deltaTime = timestamp - gameState.lastTime;
  gameState.lastTime = timestamp;

  gameState.clickAreas = [];

  render();

  requestAnimationFrame(gameLoop);
}

// Iniciar jogo
gameState.player = loadPlayer();
requestAnimationFrame(gameLoop);
