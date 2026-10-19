// Eco Simulator - Simulador de Ecossistemas e Sustentabilidade
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuração do canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Estado do jogo
let coins = 100;
let gems = 5;
let xp = 0;
let level = 1;
let currentScreen = 'menu';
let selectedBiome = null;
let selectedLevel = null;
let currentQuestion = null;
let selectedAnswer = null;
let showingResult = false;
let resultCorrect = false;
let scrollOffset = 0;
let maxScroll = 0;

// Animações
let particles = [];
let floatingLeaves = [];

// Dados do jogador
let playerData = {
    unlockedBiomes: [0],
    biomeProgress: {},
    species: [],
    ecosystems: [],
    greenPoints: 0,
    carbonReduced: 0
};

// Biomas (10 mundos)
const BIOMES = [
    { id: 0, name: 'Floresta Tropical', color: '#228B22', icon: '🌳', unlockLevel: 1, zones: 50 },
    { id: 1, name: 'Oceanos', color: '#006994', icon: '🌊', unlockLevel: 5, zones: 50 },
    { id: 2, name: 'Savana', color: '#C4A747', icon: '🦁', unlockLevel: 10, zones: 50 },
    { id: 3, name: 'Tundra', color: '#87CEEB', icon: '❄️', unlockLevel: 15, zones: 50 },
    { id: 4, name: 'Deserto', color: '#EDC9AF', icon: '🏜️', unlockLevel: 20, zones: 50 },
    { id: 5, name: 'Mangue', color: '#556B2F', icon: '🦀', unlockLevel: 25, zones: 50 },
    { id: 6, name: 'Recifes de Coral', color: '#FF6F61', icon: '🐠', unlockLevel: 30, zones: 50 },
    { id: 7, name: 'Pantanal', color: '#4A7023', icon: '🐊', unlockLevel: 35, zones: 50 },
    { id: 8, name: 'Cerrado', color: '#9B7653', icon: '🌾', unlockLevel: 40, zones: 50 },
    { id: 9, name: 'Amazônia Profunda', color: '#013220', icon: '🦜', unlockLevel: 45, zones: 50 }
];

// Banco de questões por bioma
const QUESTIONS = {
    0: [ // Floresta Tropical
        { q: 'Qual é a principal característica das florestas tropicais?', a: ['Alta biodiversidade', 'Baixa umidade', 'Poucas árvores', 'Solo congelado'], correct: 0 },
        { q: 'O que é o dossel florestal?', a: ['Camada superior de copas', 'Solo da floresta', 'Raízes das árvores', 'Lago tropical'], correct: 0 },
        { q: 'Qual processo converte CO2 em oxigênio?', a: ['Fotossíntese', 'Respiração', 'Decomposição', 'Evaporação'], correct: 0 },
        { q: 'Qual animal é polinizador na floresta tropical?', a: ['Beija-flor', 'Onça', 'Preguiça', 'Tucano'], correct: 0 },
        { q: 'O que é epífita?', a: ['Planta que cresce sobre outra', 'Animal herbívoro', 'Fungo do solo', 'Inseto voador'], correct: 0 },
        { q: 'Qual é o maior rio de floresta tropical?', a: ['Amazonas', 'Nilo', 'Mississipi', 'Ganges'], correct: 0 },
        { q: 'O que causa o efeito estufa nas florestas?', a: ['Desmatamento', 'Chuva', 'Animais', 'Fotossíntese'], correct: 0 },
        { q: 'Qual camada tem menos luz na floresta?', a: ['Sub-bosque', 'Dossel', 'Emergente', 'Copa'], correct: 0 },
        { q: 'O que é biodiversidade?', a: ['Variedade de vida', 'Tipo de solo', 'Clima quente', 'Água limpa'], correct: 0 },
        { q: 'Qual inseto é essencial na decomposição?', a: ['Cupim', 'Borboleta', 'Abelha', 'Libélula'], correct: 0 }
    ],
    1: [ // Oceanos
        { q: 'Qual é a maior zona oceânica?', a: ['Zona abissal', 'Zona eufótica', 'Zona costeira', 'Zona pelágica'], correct: 0 },
        { q: 'O que é fitoplâncton?', a: ['Microalgas fotossintetizantes', 'Peixes pequenos', 'Corais', 'Bactérias'], correct: 0 },
        { q: 'Quanto do oxigênio vem dos oceanos?', a: ['50-80%', '10-20%', '5%', '90%'], correct: 0 },
        { q: 'O que é acidificação oceânica?', a: ['Absorção de CO2', 'Aumento de sal', 'Aquecimento', 'Poluição'], correct: 0 },
        { q: 'Qual corrente aquece a Europa?', a: ['Corrente do Golfo', 'Humboldt', 'Kuroshio', 'Benguela'], correct: 0 },
        { q: 'O que são zonas mortas oceânicas?', a: ['Áreas sem oxigênio', 'Profundezas escuras', 'Regiões geladas', 'Praias poluídas'], correct: 0 },
        { q: 'Qual animal é topo de cadeia oceânica?', a: ['Orca', 'Atum', 'Sardinha', 'Lula'], correct: 0 },
        { q: 'O que é o ciclo do carbono marinho?', a: ['Absorção e liberação de CO2', 'Movimento de peixes', 'Maré', 'Correntes'], correct: 0 },
        { q: 'Qual é o maior ecossistema da Terra?', a: ['Oceano', 'Floresta', 'Deserto', 'Tundra'], correct: 0 },
        { q: 'O que são algas marinhas?', a: ['Plantas aquáticas', 'Animais', 'Rochas', 'Vírus'], correct: 0 }
    ],
    2: [ // Savana
        { q: 'Qual é a característica da savana?', a: ['Gramíneas com árvores esparsas', 'Floresta densa', 'Gelo permanente', 'Deserto total'], correct: 0 },
        { q: 'Qual é o maior herbívoro da savana?', a: ['Elefante', 'Zebra', 'Gnu', 'Impala'], correct: 0 },
        { q: 'O que são queimadas naturais na savana?', a: ['Renovação do ecossistema', 'Destruição total', 'Poluição', 'Doença'], correct: 0 },
        { q: 'Qual árvore é símbolo da savana africana?', a: ['Baobá', 'Pinheiro', 'Carvalho', 'Sequoia'], correct: 0 },
        { q: 'O que é migração de gnus?', a: ['Deslocamento em massa', 'Hibernação', 'Reprodução', 'Alimentação'], correct: 0 },
        { q: 'Qual predador domina a savana?', a: ['Leão', 'Lobo', 'Urso', 'Águia'], correct: 0 },
        { q: 'Quantas estações tem a savana?', a: ['Duas: seca e úmida', 'Quatro estações', 'Uma estação', 'Três estações'], correct: 0 },
        { q: 'O que são cupinzeiros na savana?', a: ['Ninhos de térmitas', 'Rochas', 'Plantas', 'Tocas'], correct: 0 },
        { q: 'Qual animal cava poços na seca?', a: ['Elefante', 'Leão', 'Hiena', 'Abutre'], correct: 0 },
        { q: 'O que é simbiose na savana?', a: ['Cooperação entre espécies', 'Competição', 'Predação', 'Parasitismo'], correct: 0 }
    ],
    3: [ // Tundra
        { q: 'O que é permafrost?', a: ['Solo permanentemente congelado', 'Neve fresca', 'Gelo flutuante', 'Chuva gelada'], correct: 0 },
        { q: 'Qual animal migra na tundra?', a: ['Caribu', 'Urso polar', 'Lemingue', 'Coruja'], correct: 0 },
        { q: 'O que são líquens?', a: ['Simbiose fungo-alga', 'Animais', 'Rochas', 'Gelo'], correct: 0 },
        { q: 'Por que a tundra é importante para o clima?', a: ['Armazena carbono', 'Produz chuva', 'Aquece o planeta', 'Cria ventos'], correct: 0 },
        { q: 'Qual é a vegetação típica da tundra?', a: ['Musgos e arbustos baixos', 'Árvores altas', 'Cactos', 'Palmeiras'], correct: 0 },
        { q: 'O que acontece com o permafrost no aquecimento?', a: ['Derrete e libera metano', 'Fica mais frio', 'Desaparece', 'Cresce'], correct: 0 },
        { q: 'Qual predador vive na tundra ártica?', a: ['Raposa ártica', 'Leão', 'Tigre', 'Onça'], correct: 0 },
        { q: 'O que são auroras boreais?', a: ['Fenômeno luminoso', 'Tempestade', 'Terremoto', 'Eclipse'], correct: 0 },
        { q: 'Quantos meses dura o inverno na tundra?', a: ['8-10 meses', '2-3 meses', '12 meses', '4-5 meses'], correct: 0 },
        { q: 'O que é tundra alpina?', a: ['Tundra em montanhas', 'Tundra costeira', 'Tundra ártica', 'Tundra tropical'], correct: 0 }
    ],
    4: [ // Deserto
        { q: 'Como as plantas do deserto armazenam água?', a: ['Em tecidos suculentos', 'Nas folhas grandes', 'No ar', 'Na areia'], correct: 0 },
        { q: 'O que são oásis?', a: ['Áreas com água no deserto', 'Dunas altas', 'Tempestades de areia', 'Rochas'], correct: 0 },
        { q: 'Qual animal é símbolo do deserto?', a: ['Camelo', 'Elefante', 'Leão', 'Urso'], correct: 0 },
        { q: 'Como os animais do deserto evitam o calor?', a: ['São noturnos', 'Nadam', 'Voam', 'Hibernam'], correct: 0 },
        { q: 'O que é desertificação?', a: ['Expansão do deserto', 'Chuva no deserto', 'Plantas crescendo', 'Animais migrando'], correct: 0 },
        { q: 'Qual deserto é o maior do mundo?', a: ['Saara', 'Gobi', 'Atacama', 'Mojave'], correct: 0 },
        { q: 'O que são ventos alísios?', a: ['Ventos constantes tropicais', 'Tempestades', 'Chuvas', 'Neve'], correct: 0 },
        { q: 'Como cactos fazem fotossíntese?', a: ['Pelo caule', 'Pelas raízes', 'Pelas flores', 'Pelas sementes'], correct: 0 },
        { q: 'O que é amplitude térmica no deserto?', a: ['Grande variação de temperatura', 'Temperatura constante', 'Umidade alta', 'Vento forte'], correct: 0 },
        { q: 'Qual inseto poliniza cactos?', a: ['Mariposa', 'Abelha', 'Formiga', 'Besouro'], correct: 0 }
    ],
    5: [ // Mangue
        { q: 'O que são manguezais?', a: ['Ecossistema costeiro', 'Floresta de montanha', 'Deserto', 'Tundra'], correct: 0 },
        { q: 'Qual função dos mangues na costa?', a: ['Proteção contra erosão', 'Produção de sal', 'Aquecimento', 'Resfriamento'], correct: 0 },
        { q: 'O que são raízes aéreas?', a: ['Raízes expostas ao ar', 'Raízes subterrâneas', 'Folhas', 'Galhos'], correct: 0 },
        { q: 'Qual animal nasce no mangue?', a: ['Caranguejo', 'Baleia', 'Tubarão', 'Golfinho'], correct: 0 },
        { q: 'Por que mangues são berçários?', a: ['Protegem filhotes', 'Têm muito alimento', 'São quentes', 'Têm sal'], correct: 0 },
        { q: 'O que é lama do mangue?', a: ['Sedimento rico em nutrientes', 'Poluição', 'Areia', 'Rocha'], correct: 0 },
        { q: 'Qual ave vive no mangue?', a: ['Garça', 'Pinguim', 'Avestruz', 'Águia'], correct: 0 },
        { q: 'Como mangues sequestram carbono?', a: ['Armazenam no solo', 'Liberam no ar', 'Queimam', 'Evaporam'], correct: 0 },
        { q: 'O que ameaça os manguezais?', a: ['Urbanização', 'Chuva', 'Maré', 'Sol'], correct: 0 },
        { q: 'Qual peixe vive no mangue?', a: ['Robalo', 'Atum', 'Salmão', 'Bacalhau'], correct: 0 }
    ],
    6: [ // Recifes de Coral
        { q: 'O que são corais?', a: ['Animais coloniais', 'Plantas', 'Rochas', 'Algas'], correct: 0 },
        { q: 'O que é branqueamento de coral?', a: ['Perda de algas simbiontes', 'Crescimento', 'Reprodução', 'Alimentação'], correct: 0 },
        { q: 'Qual é o maior recife do mundo?', a: ['Grande Barreira de Coral', 'Recife de Belize', 'Mar Vermelho', 'Caribe'], correct: 0 },
        { q: 'O que são zooxantelas?', a: ['Algas que vivem em corais', 'Peixes pequenos', 'Moluscos', 'Crustáceos'], correct: 0 },
        { q: 'Por que recifes são importantes?', a: ['Biodiversidade marinha', 'Produção de sal', 'Navegação', 'Pesca industrial'], correct: 0 },
        { q: 'Qual peixe limpa outros peixes?', a: ['Peixe-limpador', 'Tubarão', 'Atum', 'Peixe-palhaço'], correct: 0 },
        { q: 'O que é simbiose coral-alga?', a: ['Benefício mútuo', 'Predação', 'Competição', 'Parasitismo'], correct: 0 },
        { q: 'Qual ameaça os recifes?', a: ['Aquecimento oceânico', 'Chuva', 'Vento', 'Neve'], correct: 0 },
        { q: 'Como corais se reproduzem?', a: ['Liberando gametas', 'Dividindo', 'Voando', 'Caminhando'], correct: 0 },
        { q: 'O que é atol?', a: ['Ilha de coral circular', 'Rocha vulcânica', 'Praia', 'Montanha'], correct: 0 }
    ],
    7: [ // Pantanal
        { q: 'O que é o Pantanal?', a: ['Maior planície alagável', 'Deserto', 'Montanha', 'Floresta seca'], correct: 0 },
        { q: 'Em quais países está o Pantanal?', a: ['Brasil, Bolívia, Paraguai', 'Só Brasil', 'Argentina, Chile', 'Peru, Equador'], correct: 0 },
        { q: 'Qual animal é símbolo do Pantanal?', a: ['Tuiuiú', 'Onça', 'Jacaré', 'Arara'], correct: 0 },
        { q: 'O que é corixo?', a: ['Canal natural', 'Montanha', 'Árvore', 'Animal'], correct: 0 },
        { q: 'Quantas espécies de peixes tem o Pantanal?', a: ['Mais de 260', 'Cerca de 50', 'Menos de 20', 'Mais de 1000'], correct: 0 },
        { q: 'O que é piracema?', a: ['Migração de peixes', 'Seca', 'Cheia', 'Tempestade'], correct: 0 },
        { q: 'Qual felino vive no Pantanal?', a: ['Onça-pintada', 'Leão', 'Tigre', 'Leopardo'], correct: 0 },
        { q: 'O que são capões no Pantanal?', a: ['Ilhas de vegetação', 'Lagos', 'Rios', 'Morros'], correct: 0 },
        { q: 'Qual estação alaga o Pantanal?', a: ['Chuvosa', 'Seca', 'Inverno', 'Outono'], correct: 0 },
        { q: 'O que é pecuária pantaneira?', a: ['Criação extensiva', 'Agricultura', 'Mineração', 'Pesca'], correct: 0 }
    ],
    8: [ // Cerrado
        { q: 'O que é o Cerrado?', a: ['Savana brasileira', 'Floresta tropical', 'Deserto', 'Tundra'], correct: 0 },
        { q: 'Quanto da água do Brasil nasce no Cerrado?', a: ['Cerca de 70%', 'Cerca de 10%', 'Cerca de 30%', 'Cerca de 90%'], correct: 0 },
        { q: 'O que são veredas?', a: ['Áreas com buritis', 'Montanhas', 'Desertos', 'Praias'], correct: 0 },
        { q: 'Qual fruto é típico do Cerrado?', a: ['Pequi', 'Maçã', 'Uva', 'Laranja'], correct: 0 },
        { q: 'O que é cascudo no Cerrado?', a: ['Árvore com casca grossa', 'Peixe', 'Inseto', 'Ave'], correct: 0 },
        { q: 'Por que o fogo é natural no Cerrado?', a: ['Adaptação das plantas', 'Destruição', 'Poluição', 'Acidente'], correct: 0 },
        { q: 'Qual animal é endêmico do Cerrado?', a: ['Lobo-guará', 'Leão', 'Elefante', 'Urso'], correct: 0 },
        { q: 'O que ameaça o Cerrado?', a: ['Agronegócio', 'Chuva', 'Vento', 'Frio'], correct: 0 },
        { q: 'Quanto do Cerrado já foi desmatado?', a: ['Mais de 50%', 'Menos de 10%', 'Cerca de 20%', 'Nenhum'], correct: 0 },
        { q: 'O que são campos rupestres?', a: ['Vegetação em rochas', 'Florestas densas', 'Desertos', 'Pântanos'], correct: 0 }
    ],
    9: [ // Amazônia Profunda
        { q: 'Quantas espécies vivem na Amazônia?', a: ['Milhões', 'Centenas', 'Dezenas', 'Bilhões'], correct: 0 },
        { q: 'O que são rios voadores?', a: ['Umidade transportada pelo ar', 'Rios subterrâneos', 'Cachoeiras', 'Lagos'], correct: 0 },
        { q: 'Qual é a maior onça da Amazônia?', a: ['Onça-pintada', 'Onça-parda', 'Jaguatirica', 'Gato-maracajá'], correct: 0 },
        { q: 'O que é igapó?', a: ['Floresta inundada permanente', 'Montanha', 'Deserto', 'Praia'], correct: 0 },
        { q: 'Qual peixe é o maior da Amazônia?', a: ['Pirarucu', 'Piranha', 'Tucunaré', 'Tambaqui'], correct: 0 },
        { q: 'O que é etnobotânica?', a: ['Uso de plantas por povos', 'Estudo de animais', 'Clima', 'Geologia'], correct: 0 },
        { q: 'Quantos povos indígenas vivem na Amazônia?', a: ['Mais de 300', 'Menos de 50', 'Cerca de 100', 'Mais de 1000'], correct: 0 },
        { q: 'O que é terra preta de índio?', a: ['Solo fértil criado', 'Rocha', 'Areia', 'Argila'], correct: 0 },
        { q: 'Qual é o maior mamífero aquático amazônico?', a: ['Peixe-boi', 'Boto', 'Ariranha', 'Jacaré'], correct: 0 },
        { q: 'O que é floresta de várzea?', a: ['Inundada sazonalmente', 'Sempre seca', 'Em montanha', 'Costeira'], correct: 0 }
    ]
};

// Loja
const SHOP_ITEMS = [
    { id: 'species_pack', name: 'Pacote de Espécies', price: 100, currency: 'coins', description: '+5 espécies raras' },
    { id: 'ecosystem_boost', name: 'Boost Ecossistema', price: 150, currency: 'coins', description: '+50% pontos verdes' },
    { id: 'carbon_credit', name: 'Crédito de Carbono', price: 200, currency: 'coins', description: '+100 carbono reduzido' },
    { id: 'biome_unlock', name: 'Desbloquear Bioma', price: 5, currency: 'gems', description: 'Desbloqueia próximo bioma' },
    { id: 'double_xp', name: 'XP Dobrado', price: 3, currency: 'gems', description: '2x XP por 10 questões' },
    { id: 'nature_skin', name: 'Skin Natureza', price: 10, currency: 'gems', description: 'Visual especial' }
];

// Inicializar folhas flutuantes
function initLeaves() {
    floatingLeaves = [];
    for (let i = 0; i < 20; i++) {
        floatingLeaves.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 15 + 10,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 + 0.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.02 - 0.01,
            color: ['#228B22', '#32CD32', '#90EE90', '#006400', '#8B4513'][Math.floor(Math.random() * 5)]
        });
    }
}

// Carregar jogo
function loadGame() {
    const saved = localStorage.getItem('ecoSimulator');
    if (saved) {
        const data = JSON.parse(saved);
        coins = data.coins || 100;
        gems = data.gems || 5;
        xp = data.xp || 0;
        level = data.level || 1;
        playerData = data.playerData || playerData;
    }
    initLeaves();
}

// Salvar jogo
function saveGame() {
    localStorage.setItem('ecoSimulator', JSON.stringify({
        coins, gems, xp, level, playerData
    }));
}

// Sistema de partículas
function createParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color,
            size: Math.random() * 6 + 2
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.1;
        return p.life > 0;
    });
}

// Atualizar folhas
function updateLeaves() {
    floatingLeaves.forEach(leaf => {
        leaf.x += leaf.speedX;
        leaf.y += leaf.speedY;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > canvas.height + 20) {
            leaf.y = -20;
            leaf.x = Math.random() * canvas.width;
        }
        if (leaf.x < -20) leaf.x = canvas.width + 20;
        if (leaf.x > canvas.width + 20) leaf.x = -20;
    });
}

// Desenhar folha
function drawLeaf(x, y, size, rotation, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
    ctx.restore();
}

// Desenhar fundo natureza
function drawNatureBackground() {
    // Gradiente céu
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98FB98');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Folhas flutuantes
    floatingLeaves.forEach(leaf => {
        drawLeaf(leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.color);
    });
}

// Desenhar HUD
function drawHUD() {
    ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${coins}`, 20, 38);

    ctx.fillStyle = '#00CED1';
    ctx.fillText(`💎 ${gems}`, 120, 38);

    ctx.fillStyle = '#98FB98';
    ctx.fillText(`⭐ XP: ${xp}`, 220, 38);

    ctx.fillStyle = '#90EE90';
    ctx.fillText(`🌱 Nível ${level}`, 350, 38);

    ctx.fillStyle = '#32CD32';
    ctx.textAlign = 'right';
    ctx.fillText(`🌿 ${playerData.greenPoints} pts verdes`, canvas.width - 20, 38);
}

// Desenhar menu principal
function drawMenu() {
    drawNatureBackground();
    drawHUD();

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 4;
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('🌍 ECO SIMULATOR 🌱', canvas.width/2, 140);
    ctx.fillText('🌍 ECO SIMULATOR 🌱', canvas.width/2, 140);

    ctx.font = '22px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Simulador de Ecossistemas e Sustentabilidade', canvas.width/2, 180);

    // Botões
    const buttons = [
        { text: '🌳 EXPLORAR BIOMAS', y: 260, color: '#228B22' },
        { text: '🏪 LOJA VERDE', y: 340, color: '#32CD32' },
        { text: '🌿 MEU ECOSSISTEMA', y: 420, color: '#006400' },
        { text: '🏆 CONQUISTAS', y: 500, color: '#008B8B' }
    ];

    buttons.forEach(btn => {
        ctx.fillStyle = btn.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;
        ctx.fillRect(canvas.width/2 - 180, btn.y, 360, 60);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 180, btn.y, 360, 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(btn.text, canvas.width/2, btn.y + 40);
    });

    // Estatísticas
    ctx.fillStyle = 'rgba(0, 50, 0, 0.7)';
    ctx.fillRect(canvas.width/2 - 150, 580, 300, 80);
    ctx.fillStyle = '#90EE90';
    ctx.font = '16px Arial';
    ctx.fillText(`🐾 Espécies: ${playerData.species.length}`, canvas.width/2, 610);
    ctx.fillText(`🌡️ Carbono Reduzido: ${playerData.carbonReduced} kg`, canvas.width/2, 640);
}

// Desenhar seleção de biomas
function drawBiomeSelect() {
    drawNatureBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌍 ESCOLHA O BIOMA', canvas.width/2, 100);

    // Botão voltar
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Voltar', 70, 107);

    const startY = 140 - scrollOffset;
    const cardHeight = 90;
    const visibleTop = 130;
    const visibleBottom = canvas.height - 20;

    BIOMES.forEach((biome, index) => {
        const y = startY + index * (cardHeight + 15);

        if (y + cardHeight < visibleTop || y > visibleBottom) return;

        const unlocked = level >= biome.unlockLevel || playerData.unlockedBiomes.includes(biome.id);
        const progress = playerData.biomeProgress[biome.id] || 0;

        ctx.fillStyle = unlocked ? biome.color : '#555';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillRect(canvas.width/2 - 200, y, 400, cardHeight);
        ctx.shadowBlur = 0;

        if (unlocked) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width/2 - 200, y, 400, cardHeight);
        }

        ctx.font = '36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(biome.icon, canvas.width/2 - 180, y + 50);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(biome.name, canvas.width/2 - 120, y + 35);

        if (unlocked) {
            ctx.font = '16px Arial';
            ctx.fillText(`Progresso: ${progress}/${biome.zones} zonas`, canvas.width/2 - 120, y + 60);

            // Barra de progresso
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(canvas.width/2 - 120, y + 68, 200, 10);
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(canvas.width/2 - 120, y + 68, (progress/biome.zones) * 200, 10);
        } else {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#AAA';
            ctx.fillText(`🔒 Nível ${biome.unlockLevel} necessário`, canvas.width/2 - 120, y + 60);
        }
    });

    maxScroll = Math.max(0, BIOMES.length * (cardHeight + 15) - (canvas.height - 180));
}

// Desenhar seleção de zona
function drawZoneSelect() {
    const biome = BIOMES[selectedBiome];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, biome.color);
    gradient.addColorStop(1, '#001a00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Folhas
    floatingLeaves.forEach(leaf => {
        drawLeaf(leaf.x, leaf.y, leaf.size, leaf.rotation, biome.color);
    });

    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${biome.icon} ${biome.name}`, canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const progress = playerData.biomeProgress[selectedBiome] || 0;
    const cols = 5;
    const size = 70;
    const spacing = 15;
    const startX = (canvas.width - (cols * (size + spacing))) / 2;
    const startY = 150 - scrollOffset;

    for (let i = 0; i < biome.zones; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (size + spacing);
        const y = startY + row * (size + spacing);

        if (y + size < 130 || y > canvas.height - 20) continue;

        const unlocked = i <= progress;
        const completed = i < progress;

        ctx.fillStyle = completed ? '#32CD32' : (unlocked ? biome.color : '#444');
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 5;
        ctx.fillRect(x, y, size, size);
        ctx.shadowBlur = 0;

        if (unlocked && !completed) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, size, size);
        }

        ctx.fillStyle = unlocked ? '#FFF' : '#888';
        ctx.font = completed ? '24px Arial' : 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(completed ? '✅' : (unlocked ? (i + 1) : '🔒'), x + size/2, y + size/2 + 8);
    }

    maxScroll = Math.max(0, Math.ceil(biome.zones / cols) * (size + spacing) - (canvas.height - 200));
}

// Desenhar questão
function drawQuestion() {
    const biome = BIOMES[selectedBiome];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, biome.color);
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Elementos naturais
    floatingLeaves.forEach(leaf => {
        drawLeaf(leaf.x, leaf.y, leaf.size * 0.5, leaf.rotation, biome.color);
    });

    drawHUD();

    // Título
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${biome.icon} ${biome.name} - Zona ${selectedLevel + 1}`, canvas.width/2, 100);

    if (!currentQuestion) {
        const questions = QUESTIONS[selectedBiome];
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        selectedAnswer = null;
        showingResult = false;
    }

    // Caixa da questão
    ctx.fillStyle = 'rgba(0, 50, 0, 0.9)';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 15;
    ctx.fillRect(canvas.width/2 - 300, 130, 600, 120);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#32CD32';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 300, 130, 600, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    wrapText(currentQuestion.q, canvas.width/2, 180, 550, 28);

    // Respostas
    const shuffledAnswers = currentQuestion.shuffled || shuffleAnswers(currentQuestion);

    shuffledAnswers.forEach((answer, index) => {
        const y = 280 + index * 80;
        let bgColor = biome.color;

        if (showingResult) {
            if (answer.originalIndex === currentQuestion.correct) {
                bgColor = '#32CD32';
            } else if (index === selectedAnswer) {
                bgColor = '#DC143C';
            }
        } else if (index === selectedAnswer) {
            bgColor = '#FFD700';
        }

        ctx.fillStyle = bgColor;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillRect(canvas.width/2 - 280, y, 560, 60);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 280, y, 560, 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.fillText(answer.text, canvas.width/2, y + 38);
    });

    // Botão confirmar
    if (selectedAnswer !== null && !showingResult) {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CONFIRMAR 🌿', canvas.width/2, 643);
    }

    // Resultado
    if (showingResult) {
        ctx.fillStyle = resultCorrect ? '#32CD32' : '#DC143C';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(resultCorrect ? '✅ CORRETO!' : '❌ INCORRETO', canvas.width/2, 643);
    }

    // Partículas
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Embaralhar respostas
function shuffleAnswers(question) {
    const answers = question.a.map((text, index) => ({ text, originalIndex: index }));
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    question.shuffled = answers;
    return answers;
}

// Quebrar texto
function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testY = y;

    for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, x, testY);
            line = word + ' ';
            testY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, testY);
}

// Desenhar loja
function drawShop() {
    drawNatureBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏪 LOJA VERDE', canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const startY = 140;
    SHOP_ITEMS.forEach((item, index) => {
        const y = startY + index * 90;
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = col === 0 ? canvas.width/2 - 290 : canvas.width/2 + 10;
        const cardY = startY + row * 100;

        ctx.fillStyle = '#006400';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillRect(x, cardY, 280, 85);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, cardY, 280, 85);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, x + 15, cardY + 28);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#90EE90';
        ctx.fillText(item.description, x + 15, cardY + 50);

        ctx.fillStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`, x + 15, cardY + 72);

        // Botão comprar
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 200, cardY + 50, 65, 28);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Comprar', x + 232, cardY + 69);
    });
}

// Desenhar ecossistema
function drawEcosystem() {
    drawNatureBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 MEU ECOSSISTEMA', canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    // Estatísticas do ecossistema
    ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
    ctx.fillRect(canvas.width/2 - 200, 150, 400, 200);
    ctx.strokeStyle = '#32CD32';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 200, 150, 400, 200);

    ctx.fillStyle = '#90EE90';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';

    const stats = [
        `🐾 Espécies Descobertas: ${playerData.species.length}`,
        `🌍 Biomas Explorados: ${playerData.unlockedBiomes.length}`,
        `🌱 Pontos Verdes: ${playerData.greenPoints}`,
        `🌡️ Carbono Reduzido: ${playerData.carbonReduced} kg`,
        `⭐ Nível Ecológico: ${level}`
    ];

    stats.forEach((stat, i) => {
        ctx.fillText(stat, canvas.width/2, 195 + i * 35);
    });

    // Dicas ecológicas
    ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
    ctx.fillRect(canvas.width/2 - 200, 380, 400, 150);
    ctx.strokeStyle = '#228B22';
    ctx.strokeRect(canvas.width/2 - 200, 380, 400, 150);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('💡 Dica Ecológica', canvas.width/2, 415);

    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    const tips = [
        'Reduza, Reutilize, Recicle!',
        'Plante árvores nativas.',
        'Economize água e energia.',
        'Prefira transporte sustentável.',
        'Proteja os habitats naturais.'
    ];
    ctx.fillText(tips[Math.floor(Date.now() / 5000) % tips.length], canvas.width/2, 480);
}

// Desenhar conquistas
function drawAchievements() {
    drawNatureBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CONQUISTAS', canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const achievements = [
        { name: 'Primeiro Passo', desc: 'Complete sua primeira zona', icon: '🌱', unlocked: true },
        { name: 'Explorador', desc: 'Desbloqueie 3 biomas', icon: '🗺️', unlocked: playerData.unlockedBiomes.length >= 3 },
        { name: 'Naturalista', desc: 'Descubra 10 espécies', icon: '🐾', unlocked: playerData.species.length >= 10 },
        { name: 'Ecologista', desc: 'Alcance nível 10', icon: '🌍', unlocked: level >= 10 },
        { name: 'Guardião Verde', desc: 'Acumule 1000 pontos verdes', icon: '🌿', unlocked: playerData.greenPoints >= 1000 },
        { name: 'Herói do Clima', desc: 'Reduza 500kg de carbono', icon: '🌡️', unlocked: playerData.carbonReduced >= 500 },
        { name: 'Mestre Ecossistema', desc: 'Complete todos os biomas', icon: '👑', unlocked: false }
    ];

    achievements.forEach((ach, i) => {
        const y = 140 + i * 75;
        ctx.fillStyle = ach.unlocked ? '#228B22' : '#333';
        ctx.fillRect(canvas.width/2 - 200, y, 400, 65);

        if (ach.unlocked) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width/2 - 200, y, 400, 65);
        }

        ctx.font = '30px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(ach.icon, canvas.width/2 - 180, y + 42);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(ach.name, canvas.width/2 - 130, y + 28);

        ctx.font = '14px Arial';
        ctx.fillStyle = ach.unlocked ? '#90EE90' : '#888';
        ctx.fillText(ach.desc, canvas.width/2 - 130, y + 50);

        if (ach.unlocked) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '20px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('✅', canvas.width/2 + 180, y + 40);
        }
    });
}

// Desenho principal
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch(currentScreen) {
        case 'menu': drawMenu(); break;
        case 'biomes': drawBiomeSelect(); break;
        case 'zones': drawZoneSelect(); break;
        case 'question': drawQuestion(); break;
        case 'shop': drawShop(); break;
        case 'ecosystem': drawEcosystem(); break;
        case 'achievements': drawAchievements(); break;
    }
}

// Game loop
function gameLoop() {
    updateParticles();
    updateLeaves();
    draw();
    requestAnimationFrame(gameLoop);
}

// Processar resposta
function processAnswer() {
    const shuffledAnswers = currentQuestion.shuffled;
    resultCorrect = shuffledAnswers[selectedAnswer].originalIndex === currentQuestion.correct;
    showingResult = true;

    if (resultCorrect) {
        coins += 15;
        xp += 25;
        playerData.greenPoints += 10;
        playerData.carbonReduced += 5;
        createParticles(canvas.width/2, 400, '#32CD32', 30);

        const progress = playerData.biomeProgress[selectedBiome] || 0;
        if (selectedLevel === progress) {
            playerData.biomeProgress[selectedBiome] = progress + 1;
        }

        // Verificar level up
        const xpNeeded = level * 100;
        if (xp >= xpNeeded) {
            level++;
            xp -= xpNeeded;
            gems += 2;
            createParticles(canvas.width/2, 300, '#FFD700', 40);

            // Desbloquear biomas
            BIOMES.forEach(biome => {
                if (level >= biome.unlockLevel && !playerData.unlockedBiomes.includes(biome.id)) {
                    playerData.unlockedBiomes.push(biome.id);
                }
            });
        }
    } else {
        createParticles(canvas.width/2, 400, '#DC143C', 20);
    }

    saveGame();

    setTimeout(() => {
        currentQuestion = null;
        showingResult = false;
        selectedAnswer = null;
        if (resultCorrect) {
            currentScreen = 'zones';
            scrollOffset = 0;
        }
    }, 1500);
}

// Eventos de clique
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentScreen === 'menu') {
        if (y >= 260 && y <= 320) currentScreen = 'biomes';
        else if (y >= 340 && y <= 400) currentScreen = 'shop';
        else if (y >= 420 && y <= 480) currentScreen = 'ecosystem';
        else if (y >= 500 && y <= 560) currentScreen = 'achievements';
        scrollOffset = 0;
    }
    else if (currentScreen === 'biomes') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
            return;
        }

        const startY = 140 - scrollOffset;
        BIOMES.forEach((biome, index) => {
            const cardY = startY + index * 105;
            if (y >= cardY && y <= cardY + 90 && x >= canvas.width/2 - 200 && x <= canvas.width/2 + 200) {
                const unlocked = level >= biome.unlockLevel || playerData.unlockedBiomes.includes(biome.id);
                if (unlocked) {
                    selectedBiome = index;
                    currentScreen = 'zones';
                    scrollOffset = 0;
                }
            }
        });
    }
    else if (currentScreen === 'zones') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'biomes';
            scrollOffset = 0;
            return;
        }

        const biome = BIOMES[selectedBiome];
        const progress = playerData.biomeProgress[selectedBiome] || 0;
        const cols = 5;
        const size = 70;
        const spacing = 15;
        const startX = (canvas.width - (cols * (size + spacing))) / 2;
        const startY = 150 - scrollOffset;

        for (let i = 0; i < biome.zones; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const zoneX = startX + col * (size + spacing);
            const zoneY = startY + row * (size + spacing);

            if (x >= zoneX && x <= zoneX + size && y >= zoneY && y <= zoneY + size) {
                if (i <= progress) {
                    selectedLevel = i;
                    currentScreen = 'question';
                    currentQuestion = null;
                }
                break;
            }
        }
    }
    else if (currentScreen === 'question') {
        if (showingResult) return;

        for (let i = 0; i < 4; i++) {
            const answerY = 280 + i * 80;
            if (y >= answerY && y <= answerY + 60 && x >= canvas.width/2 - 280 && x <= canvas.width/2 + 280) {
                selectedAnswer = i;
            }
        }

        if (selectedAnswer !== null && y >= 610 && y <= 660 && x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100) {
            processAnswer();
        }
    }
    else if (currentScreen === 'shop') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
            return;
        }

        SHOP_ITEMS.forEach((item, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const itemX = col === 0 ? canvas.width/2 - 290 : canvas.width/2 + 10;
            const itemY = 140 + row * 100;

            if (x >= itemX + 200 && x <= itemX + 265 && y >= itemY + 50 && y <= itemY + 78) {
                const canAfford = item.currency === 'gems' ? gems >= item.price : coins >= item.price;
                if (canAfford) {
                    if (item.currency === 'gems') gems -= item.price;
                    else coins -= item.price;

                    if (item.id === 'species_pack') {
                        for (let i = 0; i < 5; i++) playerData.species.push(`Espécie ${Date.now()}_${i}`);
                    } else if (item.id === 'ecosystem_boost') {
                        playerData.greenPoints += 50;
                    } else if (item.id === 'carbon_credit') {
                        playerData.carbonReduced += 100;
                    }

                    createParticles(itemX + 140, itemY + 40, '#32CD32', 20);
                    saveGame();
                }
            }
        });
    }
    else if (currentScreen === 'ecosystem' || currentScreen === 'achievements') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
        }
    }
});

// Scroll/Touch
canvas.addEventListener('wheel', (e) => {
    if (['biomes', 'zones'].includes(currentScreen)) {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + e.deltaY * 0.5));
        e.preventDefault();
    }
}, { passive: false });

let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (['biomes', 'zones'].includes(currentScreen)) {
        const deltaY = touchStartY - e.touches[0].clientY;
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + deltaY * 0.5));
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
}, { passive: false });

// Inicialização
loadGame();
gameLoop();
