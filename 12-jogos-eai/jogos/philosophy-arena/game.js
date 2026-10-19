// Philosophy Arena - Arena de Debates Filosóficos
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
let selectedSchool = null;
let selectedDebate = null;
let currentQuestion = null;
let selectedAnswer = null;
let showingResult = false;
let resultCorrect = false;
let scrollOffset = 0;
let maxScroll = 0;

// Animações
let particles = [];
let floatingSymbols = [];

// Dados do jogador
let playerData = {
    unlockedSchools: [0],
    schoolProgress: {},
    wisdom: 0,
    arguments: [],
    reputation: 0
};

// Escolas Filosóficas (10 mundos)
const SCHOOLS = [
    { id: 0, name: 'Filosofia Antiga', color: '#8B4513', icon: '🏛️', unlockLevel: 1, debates: 50 },
    { id: 1, name: 'Filosofia Medieval', color: '#4A4A4A', icon: '📜', unlockLevel: 5, debates: 50 },
    { id: 2, name: 'Racionalismo', color: '#4169E1', icon: '🧠', unlockLevel: 10, debates: 50 },
    { id: 3, name: 'Empirismo', color: '#2E8B57', icon: '🔬', unlockLevel: 15, debates: 50 },
    { id: 4, name: 'Idealismo Alemão', color: '#800080', icon: '💭', unlockLevel: 20, debates: 50 },
    { id: 5, name: 'Existencialismo', color: '#1C1C1C', icon: '🎭', unlockLevel: 25, debates: 50 },
    { id: 6, name: 'Fenomenologia', color: '#708090', icon: '👁️', unlockLevel: 30, debates: 50 },
    { id: 7, name: 'Filosofia Analítica', color: '#4682B4', icon: '📊', unlockLevel: 35, debates: 50 },
    { id: 8, name: 'Ética Contemporânea', color: '#B8860B', icon: '⚖️', unlockLevel: 40, debates: 50 },
    { id: 9, name: 'Filosofia da Mente', color: '#9932CC', icon: '🌌', unlockLevel: 45, debates: 50 }
];

// Banco de questões por escola
const QUESTIONS = {
    0: [ // Filosofia Antiga
        { q: 'Quem disse "Só sei que nada sei"?', a: ['Sócrates', 'Platão', 'Aristóteles', 'Tales'], correct: 0 },
        { q: 'O que é a Alegoria da Caverna?', a: ['Metáfora do conhecimento', 'História real', 'Lei física', 'Ritual religioso'], correct: 0 },
        { q: 'Qual é o conceito de eudaimonia?', a: ['Felicidade/bem-estar', 'Tristeza', 'Medo', 'Raiva'], correct: 0 },
        { q: 'Quem fundou a Academia em Atenas?', a: ['Platão', 'Sócrates', 'Aristóteles', 'Pitágoras'], correct: 0 },
        { q: 'O que é o Logos para os gregos?', a: ['Razão/Palavra', 'Emoção', 'Corpo', 'Dinheiro'], correct: 0 },
        { q: 'Qual escola pregava a ataraxia?', a: ['Estoicismo', 'Sofismo', 'Platonismo', 'Cinismo'], correct: 0 },
        { q: 'O que significa maiêutica socrática?', a: ['Arte de fazer perguntas', 'Escrita', 'Oratória', 'Meditação'], correct: 0 },
        { q: 'Quem disse "O homem é a medida de todas as coisas"?', a: ['Protágoras', 'Sócrates', 'Platão', 'Zenão'], correct: 0 },
        { q: 'O que são as Formas de Platão?', a: ['Ideias perfeitas eternas', 'Objetos físicos', 'Sentimentos', 'Leis'], correct: 0 },
        { q: 'Qual é a ética de Aristóteles?', a: ['Virtude como meio-termo', 'Prazer máximo', 'Dever absoluto', 'Utilidade'], correct: 0 }
    ],
    1: [ // Filosofia Medieval
        { q: 'Quem escreveu "A Cidade de Deus"?', a: ['Santo Agostinho', 'São Tomás', 'Boécio', 'Anselmo'], correct: 0 },
        { q: 'O que é a prova ontológica?', a: ['Argumento para Deus', 'Lei física', 'Teoria matemática', 'Regra moral'], correct: 0 },
        { q: 'Qual é a síntese de São Tomás de Aquino?', a: ['Fé e razão', 'Corpo e alma', 'Bem e mal', 'Céu e terra'], correct: 0 },
        { q: 'O que é universais na filosofia medieval?', a: ['Conceitos gerais', 'Reis', 'Planetas', 'Animais'], correct: 0 },
        { q: 'Quem propôs as 5 vias para provar Deus?', a: ['São Tomás', 'Agostinho', 'Ockham', 'Duns Scotus'], correct: 0 },
        { q: 'O que é a Navalha de Ockham?', a: ['Princípio de simplicidade', 'Arma', 'Ferramenta', 'Técnica cirúrgica'], correct: 0 },
        { q: 'Qual filósofo islâmico influenciou o Ocidente?', a: ['Averróis', 'Maomé', 'Saladino', 'Omar'], correct: 0 },
        { q: 'O que é escolástica?', a: ['Método filosófico medieval', 'Escola', 'Religião', 'Arte'], correct: 0 },
        { q: 'Qual conceito explica o mal segundo Agostinho?', a: ['Privação do bem', 'Criação divina', 'Matéria', 'Destino'], correct: 0 },
        { q: 'O que é a disputa dos universais?', a: ['Debate sobre conceitos gerais', 'Guerra', 'Competição', 'Jogo'], correct: 0 }
    ],
    2: [ // Racionalismo
        { q: 'Quem disse "Penso, logo existo"?', a: ['Descartes', 'Spinoza', 'Leibniz', 'Pascal'], correct: 0 },
        { q: 'O que é a dúvida metódica?', a: ['Questionar tudo sistematicamente', 'Não pensar', 'Aceitar tudo', 'Meditar'], correct: 0 },
        { q: 'O que são ideias inatas para racionalistas?', a: ['Conhecimento nascido conosco', 'Experiências', 'Sentimentos', 'Hábitos'], correct: 0 },
        { q: 'Qual é a substância única de Spinoza?', a: ['Deus/Natureza', 'Mente', 'Corpo', 'Tempo'], correct: 0 },
        { q: 'O que é a harmonia preestabelecida de Leibniz?', a: ['Sincronização das mônadas', 'Música', 'Arte', 'Dança'], correct: 0 },
        { q: 'O que são mônadas?', a: ['Unidades simples de substância', 'Moedas', 'Átomos', 'Células'], correct: 0 },
        { q: 'Qual é o método de Descartes?', a: ['Análise e síntese', 'Tentativa e erro', 'Observação', 'Intuição'], correct: 0 },
        { q: 'O que é res cogitans?', a: ['Substância pensante', 'Matéria', 'Espaço', 'Tempo'], correct: 0 },
        { q: 'O que é panteísmo de Spinoza?', a: ['Deus é tudo', 'Muitos deuses', 'Sem deus', 'Deus pessoal'], correct: 0 },
        { q: 'Qual é o melhor dos mundos possíveis?', a: ['Conceito de Leibniz', 'Teoria de Descartes', 'Ideia de Spinoza', 'Pensamento de Pascal'], correct: 0 }
    ],
    3: [ // Empirismo
        { q: 'Quem disse que a mente é uma "tábula rasa"?', a: ['John Locke', 'David Hume', 'Berkeley', 'Bacon'], correct: 0 },
        { q: 'O que é empirismo?', a: ['Conhecimento vem da experiência', 'Conhecimento inato', 'Fé religiosa', 'Intuição'], correct: 0 },
        { q: 'O que é o problema da indução de Hume?', a: ['Não podemos provar causação', 'Matemática falha', 'Lógica inválida', 'Ciência errada'], correct: 0 },
        { q: 'O que Berkeley negava existir?', a: ['Matéria independente', 'Deus', 'Mente', 'Ideias'], correct: 0 },
        { q: 'O que são impressões para Hume?', a: ['Percepções vívidas', 'Opiniões', 'Teorias', 'Crenças'], correct: 0 },
        { q: 'Qual é o lema de Berkeley?', a: ['Ser é ser percebido', 'Penso logo existo', 'O homem é livre', 'Deus existe'], correct: 0 },
        { q: 'O que Locke distingue em qualidades?', a: ['Primárias e secundárias', 'Boas e más', 'Grandes e pequenas', 'Fortes e fracas'], correct: 0 },
        { q: 'O que é associação de ideias?', a: ['Conexão mental de conceitos', 'União política', 'Grupo social', 'Clube'], correct: 0 },
        { q: 'Quem propôs o método experimental?', a: ['Francis Bacon', 'Locke', 'Hume', 'Berkeley'], correct: 0 },
        { q: 'O que é ceticismo humeano?', a: ['Dúvida sobre conhecimento', 'Crença total', 'Fé religiosa', 'Certeza absoluta'], correct: 0 }
    ],
    4: [ // Idealismo Alemão
        { q: 'Quem escreveu "Crítica da Razão Pura"?', a: ['Kant', 'Hegel', 'Fichte', 'Schelling'], correct: 0 },
        { q: 'O que é o imperativo categórico?', a: ['Lei moral universal', 'Conselho', 'Sugestão', 'Opinião'], correct: 0 },
        { q: 'O que é a dialética hegeliana?', a: ['Tese-antítese-síntese', 'Monólogo', 'Discurso', 'Debate'], correct: 0 },
        { q: 'O que são fenômenos para Kant?', a: ['Coisas como aparecem', 'Coisas em si', 'Ideias', 'Sentimentos'], correct: 0 },
        { q: 'O que é noumeno?', a: ['Coisa em si', 'Aparência', 'Ilusão', 'Sonho'], correct: 0 },
        { q: 'Qual é o Espírito Absoluto de Hegel?', a: ['Razão universal realizada', 'Fantasma', 'Deus pessoal', 'Alma individual'], correct: 0 },
        { q: 'O que é a priori para Kant?', a: ['Antes da experiência', 'Depois da experiência', 'Durante', 'Sem experiência'], correct: 0 },
        { q: 'O que é juízo sintético a priori?', a: ['Amplia conhecimento sem experiência', 'Analisa conceitos', 'Observa fatos', 'Deduz lógica'], correct: 0 },
        { q: 'Qual revolução Kant promoveu?', a: ['Copernicana na filosofia', 'Industrial', 'Francesa', 'Científica'], correct: 0 },
        { q: 'O que é aufhebung em Hegel?', a: ['Superação que preserva', 'Destruição', 'Criação', 'Negação'], correct: 0 }
    ],
    5: [ // Existencialismo
        { q: 'Quem disse "A existência precede a essência"?', a: ['Sartre', 'Camus', 'Heidegger', 'Kierkegaard'], correct: 0 },
        { q: 'O que é angústia existencial?', a: ['Consciência da liberdade', 'Medo físico', 'Doença', 'Tristeza comum'], correct: 0 },
        { q: 'O que é má-fé para Sartre?', a: ['Auto-engano sobre liberdade', 'Mentira', 'Crime', 'Pecado'], correct: 0 },
        { q: 'Quem escreveu "O Ser e o Nada"?', a: ['Sartre', 'Camus', 'Nietzsche', 'Heidegger'], correct: 0 },
        { q: 'O que é o absurdo de Camus?', a: ['Conflito entre sentido e mundo', 'Piada', 'Loucura', 'Erro'], correct: 0 },
        { q: 'Quem é considerado pai do existencialismo?', a: ['Kierkegaard', 'Sartre', 'Nietzsche', 'Heidegger'], correct: 0 },
        { q: 'O que significa Dasein?', a: ['Ser-aí/existência humana', 'Morte', 'Vida', 'Deus'], correct: 0 },
        { q: 'O que é autenticidade existencial?', a: ['Viver segundo si mesmo', 'Seguir outros', 'Obedecer regras', 'Conformismo'], correct: 0 },
        { q: 'O que é ser-para-a-morte?', a: ['Consciência da finitude', 'Suicídio', 'Medo', 'Doença'], correct: 0 },
        { q: 'O que Nietzsche proclamou morto?', a: ['Deus', 'Arte', 'Ciência', 'Filosofia'], correct: 0 }
    ],
    6: [ // Fenomenologia
        { q: 'Quem fundou a fenomenologia?', a: ['Husserl', 'Heidegger', 'Sartre', 'Merleau-Ponty'], correct: 0 },
        { q: 'O que é a epoché fenomenológica?', a: ['Suspensão do juízo', 'Julgamento', 'Opinião', 'Crença'], correct: 0 },
        { q: 'O que é intencionalidade da consciência?', a: ['Consciência de algo', 'Vazio mental', 'Inconsciência', 'Sono'], correct: 0 },
        { q: 'O que significa "às coisas mesmas"?', a: ['Voltar à experiência', 'Ignorar fatos', 'Teorizar', 'Abstrair'], correct: 0 },
        { q: 'O que é o mundo da vida (Lebenswelt)?', a: ['Experiência cotidiana pré-científica', 'Laboratório', 'Teoria', 'Abstração'], correct: 0 },
        { q: 'Quem desenvolveu fenomenologia do corpo?', a: ['Merleau-Ponty', 'Husserl', 'Heidegger', 'Sartre'], correct: 0 },
        { q: 'O que é redução eidética?', a: ['Busca da essência', 'Diminuição', 'Simplificação', 'Eliminação'], correct: 0 },
        { q: 'O que são vivências na fenomenologia?', a: ['Experiências conscientes', 'Memórias', 'Sonhos', 'Fantasias'], correct: 0 },
        { q: 'O que é horizonte de sentido?', a: ['Contexto de significação', 'Limite físico', 'Linha', 'Borda'], correct: 0 },
        { q: 'Qual é o papel do corpo na fenomenologia?', a: ['Modo de ser no mundo', 'Máquina', 'Prisão', 'Obstáculo'], correct: 0 }
    ],
    7: [ // Filosofia Analítica
        { q: 'Quem escreveu "Tractatus Logico-Philosophicus"?', a: ['Wittgenstein', 'Russell', 'Frege', 'Moore'], correct: 0 },
        { q: 'O que é análise lógica da linguagem?', a: ['Estudo da estrutura proposicional', 'Gramática', 'Poesia', 'Retórica'], correct: 0 },
        { q: 'O que são jogos de linguagem?', a: ['Usos contextuais da linguagem', 'Brincadeiras', 'Competições', 'Puzzles'], correct: 0 },
        { q: 'Quem propôs a teoria das descrições?', a: ['Russell', 'Wittgenstein', 'Frege', 'Carnap'], correct: 0 },
        { q: 'O que é positivismo lógico?', a: ['Só proposições verificáveis têm sentido', 'Otimismo', 'Religião', 'Metafísica'], correct: 0 },
        { q: 'O que é significado como uso?', a: ['Segundo Wittgenstein tardio', 'Definição de dicionário', 'Etimologia', 'Tradução'], correct: 0 },
        { q: 'Quem fundou a lógica moderna?', a: ['Frege', 'Aristóteles', 'Russell', 'Wittgenstein'], correct: 0 },
        { q: 'O que é o atomismo lógico?', a: ['Mundo composto de fatos simples', 'Física', 'Química', 'Biologia'], correct: 0 },
        { q: 'O que é o princípio de verificação?', a: ['Sentido depende de verificabilidade', 'Prova matemática', 'Experimento', 'Observação'], correct: 0 },
        { q: 'O que são proposições atômicas?', a: ['Proposições mais simples', 'Física nuclear', 'Química', 'Energia'], correct: 0 }
    ],
    8: [ // Ética Contemporânea
        { q: 'O que é utilitarismo?', a: ['Maior bem para o maior número', 'Egoísmo', 'Dever', 'Virtude'], correct: 0 },
        { q: 'Quem desenvolveu a teoria da justiça como equidade?', a: ['John Rawls', 'Nozick', 'Singer', 'Mill'], correct: 0 },
        { q: 'O que é o véu da ignorância?', a: ['Experimento mental de Rawls', 'Cegueira', 'Ignorância real', 'Falta de educação'], correct: 0 },
        { q: 'O que defende Peter Singer?', a: ['Direitos dos animais', 'Nacionalismo', 'Capitalismo', 'Isolamento'], correct: 0 },
        { q: 'O que é ética do discurso?', a: ['Normas via diálogo racional', 'Retórica', 'Oratória', 'Debate político'], correct: 0 },
        { q: 'Quem propôs o libertarianismo político?', a: ['Robert Nozick', 'Rawls', 'Marx', 'Mill'], correct: 0 },
        { q: 'O que é comunitarismo?', a: ['Ênfase na comunidade', 'Individualismo', 'Anarquismo', 'Totalitarismo'], correct: 0 },
        { q: 'O que é bioética?', a: ['Ética da vida e medicina', 'Biologia', 'Ecologia', 'Nutrição'], correct: 0 },
        { q: 'O que é o dilema do bonde?', a: ['Experimento moral', 'Problema de transporte', 'Engenharia', 'Urbanismo'], correct: 0 },
        { q: 'Quem desenvolveu a ética do cuidado?', a: ['Carol Gilligan', 'Rawls', 'Kant', 'Mill'], correct: 0 }
    ],
    9: [ // Filosofia da Mente
        { q: 'O que é o problema mente-corpo?', a: ['Relação entre mental e físico', 'Exercício', 'Dieta', 'Sono'], correct: 0 },
        { q: 'O que é dualismo cartesiano?', a: ['Mente e corpo são distintos', 'Monismo', 'Materialismo', 'Idealismo'], correct: 0 },
        { q: 'O que são qualia?', a: ['Experiências subjetivas', 'Números', 'Lógica', 'Linguagem'], correct: 0 },
        { q: 'O que é funcionalismo mental?', a: ['Estados mentais são funções', 'Estrutura cerebral', 'Comportamento', 'Química'], correct: 0 },
        { q: 'O que é o argumento do quarto chinês?', a: ['Contra IA forte', 'Sobre China', 'Linguística', 'Geografia'], correct: 0 },
        { q: 'Quem propôs o eliminativismo?', a: ['Churchlands', 'Dennett', 'Chalmers', 'Nagel'], correct: 0 },
        { q: 'O que é o problema difícil da consciência?', a: ['Por que existe experiência subjetiva', 'Matemática', 'Física', 'Computação'], correct: 0 },
        { q: 'O que é inteligência artificial forte?', a: ['Máquinas realmente pensantes', 'Robôs fortes', 'Computadores rápidos', 'Algoritmos'], correct: 0 },
        { q: 'O que é panpsiquismo?', a: ['Consciência é fundamental', 'Materialismo', 'Dualismo', 'Behaviorismo'], correct: 0 },
        { q: 'O que Thomas Nagel perguntou sobre morcegos?', a: ['Como é ser um morcego', 'Onde vivem', 'O que comem', 'Como voam'], correct: 0 }
    ]
};

// Loja
const SHOP_ITEMS = [
    { id: 'wisdom_tome', name: 'Tomo da Sabedoria', price: 100, currency: 'coins', description: '+50 sabedoria' },
    { id: 'argument_pack', name: 'Pacote de Argumentos', price: 150, currency: 'coins', description: '+5 argumentos' },
    { id: 'reputation_boost', name: 'Boost de Reputação', price: 200, currency: 'coins', description: '+100 reputação' },
    { id: 'school_unlock', name: 'Desbloquear Escola', price: 5, currency: 'gems', description: 'Próxima escola' },
    { id: 'double_xp', name: 'XP Dobrado', price: 3, currency: 'gems', description: '2x XP por 10 debates' },
    { id: 'philosopher_skin', name: 'Toga de Filósofo', price: 10, currency: 'gems', description: 'Visual clássico' }
];

// Inicializar símbolos flutuantes
function initSymbols() {
    floatingSymbols = [];
    const symbols = ['⚡', '💭', '🔮', '📜', '🏛️', '⚖️', '🧠', '✨', '🌟', '💡'];
    for (let i = 0; i < 15; i++) {
        floatingSymbols.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            size: Math.random() * 20 + 15,
            speedY: Math.random() * 0.3 + 0.1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

// Carregar jogo
function loadGame() {
    const saved = localStorage.getItem('philosophyArena');
    if (saved) {
        const data = JSON.parse(saved);
        coins = data.coins || 100;
        gems = data.gems || 5;
        xp = data.xp || 0;
        level = data.level || 1;
        playerData = data.playerData || playerData;
    }
    initSymbols();
}

// Salvar jogo
function saveGame() {
    localStorage.setItem('philosophyArena', JSON.stringify({
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

// Atualizar símbolos
function updateSymbols() {
    floatingSymbols.forEach(s => {
        s.y -= s.speedY;
        if (s.y < -30) {
            s.y = canvas.height + 30;
            s.x = Math.random() * canvas.width;
        }
    });
}

// Desenhar fundo filosófico
function drawPhilosophyBackground() {
    // Gradiente clássico
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Colunas gregas estilizadas
    ctx.fillStyle = 'rgba(139, 69, 19, 0.1)';
    for (let i = 0; i < 5; i++) {
        const x = i * (canvas.width / 4) - 20;
        ctx.fillRect(x, canvas.height - 300, 40, 300);
        // Capitel
        ctx.fillRect(x - 10, canvas.height - 320, 60, 20);
    }

    // Símbolos flutuantes
    floatingSymbols.forEach(s => {
        ctx.globalAlpha = s.opacity;
        ctx.font = `${s.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(s.symbol, s.x, s.y);
    });
    ctx.globalAlpha = 1;
}

// Desenhar HUD
function drawHUD() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${coins}`, 20, 38);

    ctx.fillStyle = '#00CED1';
    ctx.fillText(`💎 ${gems}`, 120, 38);

    ctx.fillStyle = '#DDA0DD';
    ctx.fillText(`⭐ XP: ${xp}`, 220, 38);

    ctx.fillStyle = '#E6E6FA';
    ctx.fillText(`🎓 Nível ${level}`, 350, 38);

    ctx.fillStyle = '#9370DB';
    ctx.textAlign = 'right';
    ctx.fillText(`📜 Sabedoria: ${playerData.wisdom}`, canvas.width - 20, 38);
}

// Desenhar menu principal
function drawMenu() {
    drawPhilosophyBackground();
    drawHUD();

    // Título
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.font = 'bold 52px Georgia';
    ctx.textAlign = 'center';
    ctx.strokeText('🏛️ PHILOSOPHY ARENA ⚖️', canvas.width/2, 140);
    ctx.fillText('🏛️ PHILOSOPHY ARENA ⚖️', canvas.width/2, 140);

    ctx.font = '22px Georgia';
    ctx.fillStyle = '#E6E6FA';
    ctx.fillText('Arena de Debates Filosóficos', canvas.width/2, 180);

    // Botões estilo pergaminho
    const buttons = [
        { text: '📜 ESCOLAS FILOSÓFICAS', y: 260, color: '#8B4513' },
        { text: '🏪 ÁGORA (LOJA)', y: 340, color: '#4A4A4A' },
        { text: '🎓 MINHA ACADEMIA', y: 420, color: '#4169E1' },
        { text: '🏆 CONQUISTAS', y: 500, color: '#B8860B' }
    ];

    buttons.forEach(btn => {
        ctx.fillStyle = btn.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 15;
        ctx.fillRect(canvas.width/2 - 180, btn.y, 360, 60);
        ctx.shadowBlur = 0;

        // Borda dourada
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width/2 - 180, btn.y, 360, 60);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Georgia';
        ctx.fillText(btn.text, canvas.width/2, btn.y + 40);
    });

    // Citação aleatória
    const quotes = [
        '"Conhece-te a ti mesmo" - Sócrates',
        '"A vida não examinada não vale a pena ser vivida"',
        '"O homem é a medida de todas as coisas"',
        '"Penso, logo existo" - Descartes'
    ];
    ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
    ctx.fillRect(canvas.width/2 - 200, 580, 400, 60);
    ctx.fillStyle = '#E6E6FA';
    ctx.font = 'italic 16px Georgia';
    ctx.fillText(quotes[Math.floor(Date.now() / 5000) % quotes.length], canvas.width/2, 618);
}

// Desenhar seleção de escolas
function drawSchoolSelect() {
    drawPhilosophyBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('📜 ESCOLAS FILOSÓFICAS', canvas.width/2, 100);

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

    SCHOOLS.forEach((school, index) => {
        const y = startY + index * (cardHeight + 15);

        if (y + cardHeight < visibleTop || y > visibleBottom) return;

        const unlocked = level >= school.unlockLevel || playerData.unlockedSchools.includes(school.id);
        const progress = playerData.schoolProgress[school.id] || 0;

        ctx.fillStyle = unlocked ? school.color : '#333';
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
        ctx.fillText(school.icon, canvas.width/2 - 180, y + 50);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Georgia';
        ctx.fillText(school.name, canvas.width/2 - 120, y + 35);

        if (unlocked) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#E6E6FA';
            ctx.fillText(`Progresso: ${progress}/${school.debates} debates`, canvas.width/2 - 120, y + 58);

            // Barra de progresso
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(canvas.width/2 - 120, y + 66, 200, 10);
            ctx.fillStyle = '#9370DB';
            ctx.fillRect(canvas.width/2 - 120, y + 66, (progress/school.debates) * 200, 10);
        } else {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(`🔒 Nível ${school.unlockLevel} necessário`, canvas.width/2 - 120, y + 58);
        }
    });

    maxScroll = Math.max(0, SCHOOLS.length * (cardHeight + 15) - (canvas.height - 180));
}

// Desenhar seleção de debate
function drawDebateSelect() {
    const school = SCHOOLS[selectedSchool];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, school.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Símbolos
    floatingSymbols.forEach(s => {
        ctx.globalAlpha = s.opacity * 0.5;
        ctx.font = `${s.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(s.symbol, s.x, s.y);
    });
    ctx.globalAlpha = 1;

    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(`${school.icon} ${school.name}`, canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const progress = playerData.schoolProgress[selectedSchool] || 0;
    const cols = 5;
    const size = 70;
    const spacing = 15;
    const startX = (canvas.width - (cols * (size + spacing))) / 2;
    const startY = 150 - scrollOffset;

    for (let i = 0; i < school.debates; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (size + spacing);
        const y = startY + row * (size + spacing);

        if (y + size < 130 || y > canvas.height - 20) continue;

        const unlocked = i <= progress;
        const completed = i < progress;

        ctx.fillStyle = completed ? '#9370DB' : (unlocked ? school.color : '#333');
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 5;
        ctx.fillRect(x, y, size, size);
        ctx.shadowBlur = 0;

        if (unlocked && !completed) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, size, size);
        }

        ctx.fillStyle = unlocked ? '#FFD700' : '#666';
        ctx.font = completed ? '24px Arial' : 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(completed ? '✅' : (unlocked ? (i + 1) : '🔒'), x + size/2, y + size/2 + 8);
    }

    maxScroll = Math.max(0, Math.ceil(school.debates / cols) * (size + spacing) - (canvas.height - 200));
}

// Desenhar questão
function drawQuestion() {
    const school = SCHOOLS[selectedSchool];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, school.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Símbolos de fundo
    floatingSymbols.forEach(s => {
        ctx.globalAlpha = s.opacity * 0.3;
        ctx.font = `${s.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(s.symbol, s.x, s.y);
    });
    ctx.globalAlpha = 1;

    drawHUD();

    // Título
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(`${school.icon} ${school.name} - Debate ${selectedDebate + 1}`, canvas.width/2, 100);

    if (!currentQuestion) {
        const questions = QUESTIONS[selectedSchool];
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        selectedAnswer = null;
        showingResult = false;
    }

    // Caixa da questão estilo pergaminho
    ctx.fillStyle = 'rgba(139, 69, 19, 0.9)';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 15;
    ctx.fillRect(canvas.width/2 - 300, 130, 600, 120);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 300, 130, 600, 120);

    ctx.fillStyle = '#FFD700';
    ctx.font = '20px Georgia';
    wrapText(currentQuestion.q, canvas.width/2, 180, 550, 28);

    // Respostas
    const shuffledAnswers = currentQuestion.shuffled || shuffleAnswers(currentQuestion);

    shuffledAnswers.forEach((answer, index) => {
        const y = 280 + index * 80;
        let bgColor = '#4A4A4A';

        if (showingResult) {
            if (answer.originalIndex === currentQuestion.correct) {
                bgColor = '#228B22';
            } else if (index === selectedAnswer) {
                bgColor = '#8B0000';
            }
        } else if (index === selectedAnswer) {
            bgColor = '#B8860B';
        }

        ctx.fillStyle = bgColor;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillRect(canvas.width/2 - 280, y, 560, 60);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 280, y, 560, 60);

        ctx.fillStyle = '#FFD700';
        ctx.font = '18px Georgia';
        ctx.fillText(answer.text, canvas.width/2, y + 38);
    });

    // Botão confirmar
    if (selectedAnswer !== null && !showingResult) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.strokeStyle = '#FFD700';
        ctx.strokeRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Georgia';
        ctx.fillText('ARGUMENTAR 📜', canvas.width/2, 643);
    }

    // Resultado
    if (showingResult) {
        ctx.fillStyle = resultCorrect ? '#228B22' : '#8B0000';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Georgia';
        ctx.fillText(resultCorrect ? '✅ CORRETO!' : '❌ REFUTADO', canvas.width/2, 643);
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
    drawPhilosophyBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️ ÁGORA (LOJA)', canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const startY = 140;
    SHOP_ITEMS.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = col === 0 ? canvas.width/2 - 290 : canvas.width/2 + 10;
        const cardY = startY + row * 100;

        ctx.fillStyle = '#4A4A4A';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillRect(x, cardY, 280, 85);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, cardY, 280, 85);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Georgia';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, x + 15, cardY + 28);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#E6E6FA';
        ctx.fillText(item.description, x + 15, cardY + 50);

        ctx.fillStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`, x + 15, cardY + 72);

        // Botão comprar
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 200, cardY + 50, 65, 28);
        ctx.fillStyle = '#FFD700';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Comprar', x + 232, cardY + 69);
    });
}

// Desenhar academia
function drawAcademy() {
    drawPhilosophyBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 MINHA ACADEMIA', canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    // Estatísticas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(canvas.width/2 - 200, 150, 400, 200);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 200, 150, 400, 200);

    ctx.fillStyle = '#E6E6FA';
    ctx.font = '18px Georgia';
    ctx.textAlign = 'center';

    const stats = [
        `📜 Sabedoria: ${playerData.wisdom}`,
        `🏛️ Escolas Estudadas: ${playerData.unlockedSchools.length}`,
        `⚖️ Argumentos: ${playerData.arguments.length}`,
        `🎖️ Reputação: ${playerData.reputation}`,
        `🎓 Nível Acadêmico: ${level}`
    ];

    stats.forEach((stat, i) => {
        ctx.fillText(stat, canvas.width/2, 195 + i * 35);
    });

    // Citação do dia
    ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
    ctx.fillRect(canvas.width/2 - 200, 380, 400, 100);
    ctx.strokeStyle = '#FFD700';
    ctx.strokeRect(canvas.width/2 - 200, 380, 400, 100);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Georgia';
    ctx.fillText('💡 Reflexão Filosófica', canvas.width/2, 415);

    ctx.fillStyle = '#E6E6FA';
    ctx.font = 'italic 14px Georgia';
    const reflections = [
        'A filosofia começa com o espanto.',
        'Uma vida não examinada não vale a pena ser vivida.',
        'O sábio é aquele que sabe que não sabe.',
        'A dúvida é o começo da sabedoria.'
    ];
    ctx.fillText(reflections[Math.floor(Date.now() / 6000) % reflections.length], canvas.width/2, 455);
}

// Desenhar conquistas
function drawAchievements() {
    drawPhilosophyBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CONQUISTAS', canvas.width/2, 100);

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const achievements = [
        { name: 'Primeiro Debate', desc: 'Vença seu primeiro debate', icon: '📜', unlocked: true },
        { name: 'Estudioso', desc: 'Desbloqueie 3 escolas', icon: '📚', unlocked: playerData.unlockedSchools.length >= 3 },
        { name: 'Sofista', desc: 'Acumule 50 argumentos', icon: '⚖️', unlocked: playerData.arguments.length >= 50 },
        { name: 'Acadêmico', desc: 'Alcance nível 10', icon: '🎓', unlocked: level >= 10 },
        { name: 'Sábio', desc: 'Acumule 1000 de sabedoria', icon: '🦉', unlocked: playerData.wisdom >= 1000 },
        { name: 'Filósofo', desc: 'Complete 5 escolas', icon: '🏛️', unlocked: Object.values(playerData.schoolProgress).filter(p => p >= 50).length >= 5 },
        { name: 'Mestre Pensador', desc: 'Complete todas as escolas', icon: '👑', unlocked: false }
    ];

    achievements.forEach((ach, i) => {
        const y = 140 + i * 75;
        ctx.fillStyle = ach.unlocked ? '#8B4513' : '#333';
        ctx.fillRect(canvas.width/2 - 200, y, 400, 65);

        if (ach.unlocked) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width/2 - 200, y, 400, 65);
        }

        ctx.font = '30px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(ach.icon, canvas.width/2 - 180, y + 42);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Georgia';
        ctx.fillText(ach.name, canvas.width/2 - 130, y + 28);

        ctx.font = '14px Arial';
        ctx.fillStyle = ach.unlocked ? '#E6E6FA' : '#666';
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
        case 'schools': drawSchoolSelect(); break;
        case 'debates': drawDebateSelect(); break;
        case 'question': drawQuestion(); break;
        case 'shop': drawShop(); break;
        case 'academy': drawAcademy(); break;
        case 'achievements': drawAchievements(); break;
    }
}

// Game loop
function gameLoop() {
    updateParticles();
    updateSymbols();
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
        playerData.wisdom += 10;
        playerData.reputation += 5;
        playerData.arguments.push(`Argumento_${Date.now()}`);
        createParticles(canvas.width/2, 400, '#FFD700', 30);

        const progress = playerData.schoolProgress[selectedSchool] || 0;
        if (selectedDebate === progress) {
            playerData.schoolProgress[selectedSchool] = progress + 1;
        }

        // Verificar level up
        const xpNeeded = level * 100;
        if (xp >= xpNeeded) {
            level++;
            xp -= xpNeeded;
            gems += 2;
            createParticles(canvas.width/2, 300, '#9370DB', 40);

            // Desbloquear escolas
            SCHOOLS.forEach(school => {
                if (level >= school.unlockLevel && !playerData.unlockedSchools.includes(school.id)) {
                    playerData.unlockedSchools.push(school.id);
                }
            });
        }
    } else {
        createParticles(canvas.width/2, 400, '#8B0000', 20);
    }

    saveGame();

    setTimeout(() => {
        currentQuestion = null;
        showingResult = false;
        selectedAnswer = null;
        if (resultCorrect) {
            currentScreen = 'debates';
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
        if (y >= 260 && y <= 320) currentScreen = 'schools';
        else if (y >= 340 && y <= 400) currentScreen = 'shop';
        else if (y >= 420 && y <= 480) currentScreen = 'academy';
        else if (y >= 500 && y <= 560) currentScreen = 'achievements';
        scrollOffset = 0;
    }
    else if (currentScreen === 'schools') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
            return;
        }

        const startY = 140 - scrollOffset;
        SCHOOLS.forEach((school, index) => {
            const cardY = startY + index * 105;
            if (y >= cardY && y <= cardY + 90 && x >= canvas.width/2 - 200 && x <= canvas.width/2 + 200) {
                const unlocked = level >= school.unlockLevel || playerData.unlockedSchools.includes(school.id);
                if (unlocked) {
                    selectedSchool = index;
                    currentScreen = 'debates';
                    scrollOffset = 0;
                }
            }
        });
    }
    else if (currentScreen === 'debates') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'schools';
            scrollOffset = 0;
            return;
        }

        const school = SCHOOLS[selectedSchool];
        const progress = playerData.schoolProgress[selectedSchool] || 0;
        const cols = 5;
        const size = 70;
        const spacing = 15;
        const startX = (canvas.width - (cols * (size + spacing))) / 2;
        const startY = 150 - scrollOffset;

        for (let i = 0; i < school.debates; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const debateX = startX + col * (size + spacing);
            const debateY = startY + row * (size + spacing);

            if (x >= debateX && x <= debateX + size && y >= debateY && y <= debateY + size) {
                if (i <= progress) {
                    selectedDebate = i;
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

                    if (item.id === 'wisdom_tome') {
                        playerData.wisdom += 50;
                    } else if (item.id === 'argument_pack') {
                        for (let i = 0; i < 5; i++) playerData.arguments.push(`Argumento_${Date.now()}_${i}`);
                    } else if (item.id === 'reputation_boost') {
                        playerData.reputation += 100;
                    }

                    createParticles(itemX + 140, itemY + 40, '#FFD700', 20);
                    saveGame();
                }
            }
        });
    }
    else if (currentScreen === 'academy' || currentScreen === 'achievements') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
        }
    }
});

// Scroll/Touch
canvas.addEventListener('wheel', (e) => {
    if (['schools', 'debates'].includes(currentScreen)) {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + e.deltaY * 0.5));
        e.preventDefault();
    }
}, { passive: false });

let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (['schools', 'debates'].includes(currentScreen)) {
        const deltaY = touchStartY - e.touches[0].clientY;
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + deltaY * 0.5));
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
}, { passive: false });

// Inicialização
loadGame();
gameLoop();
