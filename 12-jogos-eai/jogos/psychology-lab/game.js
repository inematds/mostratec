// Psychology Lab - Laboratório de Psicologia
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
let selectedArea = null;
let selectedExperiment = null;
let currentQuestion = null;
let selectedAnswer = null;
let showingResult = false;
let resultCorrect = false;
let scrollOffset = 0;
let maxScroll = 0;

// Animações
let particles = [];
let brainWaves = [];
let neurons = [];

// Dados do jogador
let playerData = {
    unlockedAreas: [0],
    areaProgress: {},
    insights: 0,
    cases: [],
    empathy: 0
};

// Áreas da Psicologia (10 mundos)
const AREAS = [
    { id: 0, name: 'Psicologia Geral', color: '#6B5B95', icon: '🧠', unlockLevel: 1, experiments: 50 },
    { id: 1, name: 'Neurociência', color: '#E94560', icon: '🔬', unlockLevel: 5, experiments: 50 },
    { id: 2, name: 'Desenvolvimento', color: '#FF6B6B', icon: '👶', unlockLevel: 10, experiments: 50 },
    { id: 3, name: 'Cognitiva', color: '#4ECDC4', icon: '💭', unlockLevel: 15, experiments: 50 },
    { id: 4, name: 'Social', color: '#45B7D1', icon: '👥', unlockLevel: 20, experiments: 50 },
    { id: 5, name: 'Clínica', color: '#96CEB4', icon: '🏥', unlockLevel: 25, experiments: 50 },
    { id: 6, name: 'Comportamental', color: '#FFEAA7', icon: '🐕', unlockLevel: 30, experiments: 50 },
    { id: 7, name: 'Psicanálise', color: '#DDA0DD', icon: '🛋️', unlockLevel: 35, experiments: 50 },
    { id: 8, name: 'Humanista', color: '#98D8C8', icon: '🌱', unlockLevel: 40, experiments: 50 },
    { id: 9, name: 'Positiva', color: '#F7DC6F', icon: '😊', unlockLevel: 45, experiments: 50 }
];

// Banco de questões por área
const QUESTIONS = {
    0: [ // Psicologia Geral
        { q: 'Quem é considerado o pai da psicologia científica?', a: ['Wilhelm Wundt', 'Sigmund Freud', 'B.F. Skinner', 'Carl Rogers'], correct: 0 },
        { q: 'O que estuda a psicologia?', a: ['Comportamento e mente', 'Apenas o cérebro', 'Apenas emoções', 'Apenas sonhos'], correct: 0 },
        { q: 'O que é introspecção?', a: ['Auto-observação mental', 'Olhar para dentro do corpo', 'Meditação', 'Hipnose'], correct: 0 },
        { q: 'Qual é o objeto de estudo da psicologia?', a: ['Comportamento e processos mentais', 'Doenças', 'Medicamentos', 'Cirurgias'], correct: 0 },
        { q: 'O que são processos cognitivos?', a: ['Pensamento, memória, percepção', 'Músculos', 'Ossos', 'Sangue'], correct: 0 },
        { q: 'O que significa empirismo em psicologia?', a: ['Conhecimento via experiência', 'Conhecimento inato', 'Intuição', 'Sonhos'], correct: 0 },
        { q: 'O que é método científico?', a: ['Processo sistemático de investigação', 'Opinião pessoal', 'Tradição', 'Autoridade'], correct: 0 },
        { q: 'Onde surgiu o primeiro laboratório de psicologia?', a: ['Leipzig, Alemanha', 'Londres', 'Paris', 'Nova York'], correct: 0 },
        { q: 'O que é variável dependente?', a: ['O que é medido', 'O que é manipulado', 'O que é constante', 'O que é ignorado'], correct: 0 },
        { q: 'O que é hipótese?', a: ['Previsão testável', 'Fato comprovado', 'Lei natural', 'Teoria final'], correct: 0 }
    ],
    1: [ // Neurociência
        { q: 'Qual é a unidade básica do sistema nervoso?', a: ['Neurônio', 'Célula muscular', 'Célula óssea', 'Hemácia'], correct: 0 },
        { q: 'O que são neurotransmissores?', a: ['Mensageiros químicos', 'Ossos', 'Músculos', 'Artérias'], correct: 0 },
        { q: 'Qual neurotransmissor está ligado ao prazer?', a: ['Dopamina', 'Adrenalina', 'Cortisol', 'Insulina'], correct: 0 },
        { q: 'O que é sinapse?', a: ['Conexão entre neurônios', 'Tipo de célula', 'Hormônio', 'Vitamina'], correct: 0 },
        { q: 'Qual parte do cérebro controla emoções?', a: ['Sistema límbico', 'Medula', 'Cerebelo', 'Córtex motor'], correct: 0 },
        { q: 'O que é plasticidade cerebral?', a: ['Capacidade de mudança do cérebro', 'Rigidez mental', 'Doença', 'Tipo de exame'], correct: 0 },
        { q: 'Qual hemisfera controla a linguagem na maioria?', a: ['Esquerdo', 'Direito', 'Ambos igualmente', 'Nenhum'], correct: 0 },
        { q: 'O que é amígdala cerebral?', a: ['Estrutura ligada ao medo', 'Glândula', 'Osso', 'Músculo'], correct: 0 },
        { q: 'Qual parte controla o equilíbrio?', a: ['Cerebelo', 'Córtex', 'Hipocampo', 'Amígdala'], correct: 0 },
        { q: 'O que é hipocampo?', a: ['Estrutura ligada à memória', 'Animal marinho', 'Hormônio', 'Exame'], correct: 0 }
    ],
    2: [ // Desenvolvimento
        { q: 'Quem propôs os estágios do desenvolvimento cognitivo?', a: ['Jean Piaget', 'Freud', 'Skinner', 'Watson'], correct: 0 },
        { q: 'O que é período sensório-motor?', a: ['0-2 anos, aprendizado pelos sentidos', '2-7 anos', '7-11 anos', 'Adulto'], correct: 0 },
        { q: 'O que é apego na infância?', a: ['Vínculo emocional', 'Doença', 'Brinquedo', 'Escola'], correct: 0 },
        { q: 'Quem estudou o apego em macacos?', a: ['Harry Harlow', 'Piaget', 'Freud', 'Erikson'], correct: 0 },
        { q: 'O que é egocentrismo infantil?', a: ['Dificuldade de ver perspectiva do outro', 'Ser egoísta', 'Doença', 'Problema motor'], correct: 0 },
        { q: 'Qual é a teoria de Erikson?', a: ['Desenvolvimento psicossocial', 'Condicionamento', 'Psicanálise', 'Humanismo'], correct: 0 },
        { q: 'O que é zona de desenvolvimento proximal?', a: ['Potencial com ajuda', 'Área do cérebro', 'Tipo de escola', 'Doença'], correct: 0 },
        { q: 'Quem propôs a ZDP?', a: ['Vygotsky', 'Piaget', 'Freud', 'Skinner'], correct: 0 },
        { q: 'O que é adolescência?', a: ['Transição para adulto', 'Doença', 'Infância', 'Velhice'], correct: 0 },
        { q: 'O que são marcos do desenvolvimento?', a: ['Habilidades esperadas por idade', 'Doenças', 'Medicamentos', 'Escolas'], correct: 0 }
    ],
    3: [ // Cognitiva
        { q: 'O que é memória de curto prazo?', a: ['Armazenamento temporário', 'Memória permanente', 'Esquecimento', 'Doença'], correct: 0 },
        { q: 'Qual é a capacidade da memória de trabalho?', a: ['7 ± 2 itens', '100 itens', '1000 itens', 'Ilimitada'], correct: 0 },
        { q: 'O que é atenção seletiva?', a: ['Focar em estímulo específico', 'Atenção total', 'Desatenção', 'Sono'], correct: 0 },
        { q: 'O que são heurísticas?', a: ['Atalhos mentais', 'Erros', 'Doenças', 'Medicamentos'], correct: 0 },
        { q: 'O que é viés de confirmação?', a: ['Buscar info que confirma crenças', 'Ser honesto', 'Ser imparcial', 'Ter dúvida'], correct: 0 },
        { q: 'O que é dissonância cognitiva?', a: ['Conflito entre crenças e ações', 'Harmonia', 'Paz mental', 'Sono'], correct: 0 },
        { q: 'O que estuda a psicologia cognitiva?', a: ['Processos mentais', 'Músculos', 'Ossos', 'Sangue'], correct: 0 },
        { q: 'O que é percepção?', a: ['Interpretação de estímulos', 'Visão apenas', 'Movimento', 'Digestão'], correct: 0 },
        { q: 'O que é metacognição?', a: ['Pensar sobre o pensamento', 'Não pensar', 'Esquecer', 'Dormir'], correct: 0 },
        { q: 'O que é resolução de problemas?', a: ['Processo de encontrar soluções', 'Criar problemas', 'Ignorar', 'Fugir'], correct: 0 }
    ],
    4: [ // Social
        { q: 'O que é conformidade social?', a: ['Mudar comportamento por pressão', 'Ser rebelde', 'Isolamento', 'Liderança'], correct: 0 },
        { q: 'Quem fez o experimento da prisão de Stanford?', a: ['Philip Zimbardo', 'Milgram', 'Asch', 'Bandura'], correct: 0 },
        { q: 'O que é obediência?', a: ['Seguir ordens de autoridade', 'Rebeldia', 'Independência', 'Ignorar'], correct: 0 },
        { q: 'Quem estudou a obediência com choques?', a: ['Stanley Milgram', 'Zimbardo', 'Asch', 'Freud'], correct: 0 },
        { q: 'O que é preconceito?', a: ['Julgamento prévio negativo', 'Opinião informada', 'Ciência', 'Fato'], correct: 0 },
        { q: 'O que é estereótipo?', a: ['Generalização sobre grupo', 'Fato individual', 'Verdade científica', 'Observação precisa'], correct: 0 },
        { q: 'O que é teoria da atribuição?', a: ['Como explicamos comportamentos', 'Matemática', 'Física', 'Química'], correct: 0 },
        { q: 'O que é facilitação social?', a: ['Melhor desempenho com outros', 'Pior desempenho', 'Isolamento', 'Medo'], correct: 0 },
        { q: 'O que é pensamento de grupo?', a: ['Conformidade excessiva em grupos', 'Individualismo', 'Criatividade', 'Debate'], correct: 0 },
        { q: 'O que é altruísmo?', a: ['Ajudar sem esperar retorno', 'Egoísmo', 'Interesse próprio', 'Comércio'], correct: 0 }
    ],
    5: [ // Clínica
        { q: 'O que é transtorno de ansiedade?', a: ['Preocupação excessiva', 'Alegria', 'Calma', 'Sono'], correct: 0 },
        { q: 'O que é depressão?', a: ['Tristeza persistente e perda de interesse', 'Alegria', 'Energia', 'Euforia'], correct: 0 },
        { q: 'O que é esquizofrenia?', a: ['Transtorno com alucinações/delírios', 'Dupla personalidade', 'Ansiedade', 'Medo'], correct: 0 },
        { q: 'O que é terapia cognitivo-comportamental?', a: ['Mudar pensamentos e comportamentos', 'Hipnose', 'Medicação apenas', 'Cirurgia'], correct: 0 },
        { q: 'O que é DSM?', a: ['Manual de diagnóstico mental', 'Medicamento', 'Exame', 'Hospital'], correct: 0 },
        { q: 'O que é transtorno bipolar?', a: ['Oscilação entre mania e depressão', 'Ansiedade', 'Fobia', 'TOC'], correct: 0 },
        { q: 'O que é fobia?', a: ['Medo irracional específico', 'Coragem', 'Alegria', 'Calma'], correct: 0 },
        { q: 'O que é TOC?', a: ['Obsessões e compulsões', 'Transtorno de humor', 'Esquizofrenia', 'Autismo'], correct: 0 },
        { q: 'O que é TEPT?', a: ['Transtorno pós-traumático', 'Depressão', 'Ansiedade leve', 'Fobia'], correct: 0 },
        { q: 'O que é psicoterapia?', a: ['Tratamento por conversa', 'Cirurgia', 'Medicação', 'Exame'], correct: 0 }
    ],
    6: [ // Comportamental
        { q: 'Quem é o pai do behaviorismo?', a: ['John Watson', 'Freud', 'Piaget', 'Rogers'], correct: 0 },
        { q: 'O que é condicionamento clássico?', a: ['Aprendizado por associação', 'Punição', 'Recompensa', 'Insight'], correct: 0 },
        { q: 'Quem descobriu o condicionamento clássico?', a: ['Ivan Pavlov', 'Skinner', 'Watson', 'Bandura'], correct: 0 },
        { q: 'O que é reforço positivo?', a: ['Adicionar estímulo agradável', 'Punição', 'Remover algo', 'Ignorar'], correct: 0 },
        { q: 'O que é reforço negativo?', a: ['Remover estímulo aversivo', 'Punição', 'Adicionar dor', 'Ignorar'], correct: 0 },
        { q: 'Quem desenvolveu o condicionamento operante?', a: ['B.F. Skinner', 'Pavlov', 'Watson', 'Freud'], correct: 0 },
        { q: 'O que é extinção comportamental?', a: ['Fim do comportamento sem reforço', 'Morte', 'Doença', 'Aumento'], correct: 0 },
        { q: 'O que é modelagem?', a: ['Reforçar aproximações', 'Punir', 'Ignorar', 'Copiar'], correct: 0 },
        { q: 'O que é caixa de Skinner?', a: ['Aparato para estudar comportamento', 'Brinquedo', 'Casa', 'Escola'], correct: 0 },
        { q: 'O que é aprendizagem observacional?', a: ['Aprender observando outros', 'Ler', 'Ouvir', 'Tocar'], correct: 0 }
    ],
    7: [ // Psicanálise
        { q: 'Quem fundou a psicanálise?', a: ['Sigmund Freud', 'Jung', 'Adler', 'Klein'], correct: 0 },
        { q: 'O que é o inconsciente?', a: ['Conteúdos mentais não acessíveis', 'Consciência', 'Sonho', 'Vigília'], correct: 0 },
        { q: 'Quais são as estruturas da mente para Freud?', a: ['Id, ego, superego', 'Mente, corpo, alma', 'Pensamento, emoção, ação', 'Consciente apenas'], correct: 0 },
        { q: 'O que é transferência?', a: ['Projetar sentimentos no terapeuta', 'Mudar de lugar', 'Viagem', 'Transporte'], correct: 0 },
        { q: 'O que são mecanismos de defesa?', a: ['Estratégias inconscientes do ego', 'Armas', 'Exercícios', 'Medicamentos'], correct: 0 },
        { q: 'O que é complexo de Édipo?', a: ['Atração pelo genitor oposto', 'Medo', 'Trauma', 'Doença'], correct: 0 },
        { q: 'O que é livre associação?', a: ['Falar sem censura', 'Não falar', 'Escrever', 'Desenhar'], correct: 0 },
        { q: 'O que é repressão?', a: ['Manter conteúdos fora da consciência', 'Expressar', 'Falar', 'Agir'], correct: 0 },
        { q: 'Quem desenvolveu a psicologia analítica?', a: ['Carl Jung', 'Freud', 'Adler', 'Klein'], correct: 0 },
        { q: 'O que é arquétipo?', a: ['Padrão universal do inconsciente', 'Tipo de prédio', 'Animal', 'Planta'], correct: 0 }
    ],
    8: [ // Humanista
        { q: 'Quem propôs a hierarquia das necessidades?', a: ['Abraham Maslow', 'Freud', 'Skinner', 'Piaget'], correct: 0 },
        { q: 'O que é autorrealização?', a: ['Alcançar potencial máximo', 'Ser egoísta', 'Ter dinheiro', 'Ter poder'], correct: 0 },
        { q: 'Quem desenvolveu a terapia centrada na pessoa?', a: ['Carl Rogers', 'Freud', 'Maslow', 'May'], correct: 0 },
        { q: 'O que é empatia na terapia?', a: ['Compreender perspectiva do outro', 'Dar conselhos', 'Julgar', 'Criticar'], correct: 0 },
        { q: 'O que é congruência?', a: ['Autenticidade do terapeuta', 'Mentira', 'Falsidade', 'Máscara'], correct: 0 },
        { q: 'O que é aceitação incondicional?', a: ['Aceitar sem julgar', 'Julgar sempre', 'Criticar', 'Condenar'], correct: 0 },
        { q: 'O que é tendência atualizante?', a: ['Impulso natural para crescer', 'Regressão', 'Estagnação', 'Declínio'], correct: 0 },
        { q: 'O que significa abordagem humanista?', a: ['Foco no potencial humano', 'Foco em doenças', 'Foco em erros', 'Foco no passado'], correct: 0 },
        { q: 'Qual é a base das necessidades de Maslow?', a: ['Necessidades fisiológicas', 'Autorrealização', 'Estima', 'Pertencimento'], correct: 0 },
        { q: 'O que é experiência de pico?', a: ['Momento de intensa realização', 'Depressão', 'Ansiedade', 'Medo'], correct: 0 }
    ],
    9: [ // Positiva
        { q: 'Quem é considerado pai da psicologia positiva?', a: ['Martin Seligman', 'Freud', 'Skinner', 'Rogers'], correct: 0 },
        { q: 'O que estuda a psicologia positiva?', a: ['Bem-estar e forças', 'Doenças', 'Traumas', 'Problemas'], correct: 0 },
        { q: 'O que é flow?', a: ['Estado de imersão total', 'Preguiça', 'Tédio', 'Ansiedade'], correct: 0 },
        { q: 'Quem desenvolveu o conceito de flow?', a: ['Csikszentmihalyi', 'Seligman', 'Peterson', 'Fredrickson'], correct: 0 },
        { q: 'O que é gratidão na psicologia?', a: ['Reconhecer o positivo', 'Reclamar', 'Criticar', 'Julgar'], correct: 0 },
        { q: 'O que é resiliência?', a: ['Capacidade de superar adversidades', 'Fragilidade', 'Fraqueza', 'Desistência'], correct: 0 },
        { q: 'O que são forças de caráter?', a: ['Qualidades positivas', 'Defeitos', 'Problemas', 'Doenças'], correct: 0 },
        { q: 'O que é mindfulness?', a: ['Atenção plena ao presente', 'Distração', 'Preocupação', 'Ruminar'], correct: 0 },
        { q: 'O que é PERMA?', a: ['Modelo de bem-estar de Seligman', 'Doença', 'Medicamento', 'Exame'], correct: 0 },
        { q: 'O que é otimismo aprendido?', a: ['Aprender a ver positivamente', 'Pessimismo', 'Realismo', 'Cinismo'], correct: 0 }
    ]
};

// Loja
const SHOP_ITEMS = [
    { id: 'insight_pack', name: 'Pacote de Insights', price: 100, currency: 'coins', description: '+50 insights' },
    { id: 'case_study', name: 'Estudo de Caso', price: 150, currency: 'coins', description: '+1 caso' },
    { id: 'empathy_boost', name: 'Boost de Empatia', price: 200, currency: 'coins', description: '+100 empatia' },
    { id: 'area_unlock', name: 'Desbloquear Área', price: 5, currency: 'gems', description: 'Próxima área' },
    { id: 'double_xp', name: 'XP Dobrado', price: 3, currency: 'gems', description: '2x XP por 10 experimentos' },
    { id: 'lab_coat', name: 'Jaleco de Cientista', price: 10, currency: 'gems', description: 'Visual profissional' }
];

// Inicializar neurônios animados
function initNeurons() {
    neurons = [];
    for (let i = 0; i < 20; i++) {
        neurons.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 8 + 4,
            connections: [],
            pulse: Math.random() * Math.PI * 2,
            color: `hsl(${Math.random() * 60 + 250}, 70%, 60%)`
        });
    }
    // Criar conexões
    neurons.forEach((n, i) => {
        for (let j = 0; j < 2; j++) {
            const target = Math.floor(Math.random() * neurons.length);
            if (target !== i) {
                n.connections.push(target);
            }
        }
    });
}

// Inicializar ondas cerebrais
function initBrainWaves() {
    brainWaves = [];
    for (let i = 0; i < 5; i++) {
        brainWaves.push({
            y: canvas.height * 0.2 + i * 50,
            phase: Math.random() * Math.PI * 2,
            amplitude: 20 + Math.random() * 20,
            frequency: 0.02 + Math.random() * 0.02,
            color: `hsla(${280 + i * 20}, 70%, 60%, 0.3)`
        });
    }
}

// Carregar jogo
function loadGame() {
    const saved = localStorage.getItem('psychologyLab');
    if (saved) {
        const data = JSON.parse(saved);
        coins = data.coins || 100;
        gems = data.gems || 5;
        xp = data.xp || 0;
        level = data.level || 1;
        playerData = data.playerData || playerData;
    }
    initNeurons();
    initBrainWaves();
}

// Salvar jogo
function saveGame() {
    localStorage.setItem('psychologyLab', JSON.stringify({
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

// Atualizar neurônios
function updateNeurons() {
    neurons.forEach(n => {
        n.pulse += 0.05;
    });
}

// Desenhar fundo do laboratório
function drawLabBackground() {
    // Gradiente escuro científico
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ondas cerebrais
    brainWaves.forEach(wave => {
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
            const y = wave.y + Math.sin(x * wave.frequency + wave.phase + Date.now() * 0.002) * wave.amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    // Neurônios e conexões
    ctx.globalAlpha = 0.3;
    neurons.forEach((n, i) => {
        // Conexões
        n.connections.forEach(targetIdx => {
            const target = neurons[targetIdx];
            ctx.strokeStyle = n.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
        });
    });

    // Corpos dos neurônios
    neurons.forEach(n => {
        const pulseSize = n.size + Math.sin(n.pulse) * 2;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Desenhar HUD
function drawHUD() {
    ctx.fillStyle = 'rgba(15, 15, 35, 0.9)';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${coins}`, 20, 38);

    ctx.fillStyle = '#00CED1';
    ctx.fillText(`💎 ${gems}`, 120, 38);

    ctx.fillStyle = '#DDA0DD';
    ctx.fillText(`⭐ XP: ${xp}`, 220, 38);

    ctx.fillStyle = '#98D8C8';
    ctx.fillText(`🧠 Nível ${level}`, 350, 38);

    ctx.fillStyle = '#E94560';
    ctx.textAlign = 'right';
    ctx.fillText(`💡 Insights: ${playerData.insights}`, canvas.width - 20, 38);
}

// Desenhar menu principal
function drawMenu() {
    drawLabBackground();
    drawHUD();

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#6B5B95';
    ctx.lineWidth = 4;
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('🧠 PSYCHOLOGY LAB 🔬', canvas.width/2, 140);
    ctx.fillText('🧠 PSYCHOLOGY LAB 🔬', canvas.width/2, 140);

    ctx.font = '22px Arial';
    ctx.fillStyle = '#DDA0DD';
    ctx.fillText('Laboratório de Psicologia', canvas.width/2, 180);

    // Botões
    const buttons = [
        { text: '🔬 ÁREAS DE ESTUDO', y: 260, color: '#6B5B95' },
        { text: '🏪 LOJA DO LAB', y: 340, color: '#E94560' },
        { text: '📋 MEUS CASOS', y: 420, color: '#4ECDC4' },
        { text: '🏆 CONQUISTAS', y: 500, color: '#F7DC6F' }
    ];

    buttons.forEach(btn => {
        ctx.fillStyle = btn.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 15;
        ctx.fillRect(canvas.width/2 - 180, btn.y, 360, 60);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 180, btn.y, 360, 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(btn.text, canvas.width/2, btn.y + 40);
    });

    // Estatísticas
    ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
    ctx.fillRect(canvas.width/2 - 150, 580, 300, 80);
    ctx.fillStyle = '#DDA0DD';
    ctx.font = '16px Arial';
    ctx.fillText(`📊 Casos Estudados: ${playerData.cases.length}`, canvas.width/2, 610);
    ctx.fillText(`💕 Empatia: ${playerData.empathy}`, canvas.width/2, 640);
}

// Desenhar seleção de áreas
function drawAreaSelect() {
    drawLabBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔬 ÁREAS DE ESTUDO', canvas.width/2, 100);

    // Botão voltar
    ctx.fillStyle = '#E94560';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Voltar', 70, 107);

    const startY = 140 - scrollOffset;
    const cardHeight = 90;
    const visibleTop = 130;
    const visibleBottom = canvas.height - 20;

    AREAS.forEach((area, index) => {
        const y = startY + index * (cardHeight + 15);

        if (y + cardHeight < visibleTop || y > visibleBottom) return;

        const unlocked = level >= area.unlockLevel || playerData.unlockedAreas.includes(area.id);
        const progress = playerData.areaProgress[area.id] || 0;

        ctx.fillStyle = unlocked ? area.color : '#333';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillRect(canvas.width/2 - 200, y, 400, cardHeight);
        ctx.shadowBlur = 0;

        if (unlocked) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width/2 - 200, y, 400, cardHeight);
        }

        ctx.font = '36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(area.icon, canvas.width/2 - 180, y + 50);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(area.name, canvas.width/2 - 120, y + 35);

        if (unlocked) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#DDD';
            ctx.fillText(`Progresso: ${progress}/${area.experiments} experimentos`, canvas.width/2 - 120, y + 58);

            // Barra de progresso
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(canvas.width/2 - 120, y + 66, 200, 10);
            ctx.fillStyle = '#4ECDC4';
            ctx.fillRect(canvas.width/2 - 120, y + 66, (progress/area.experiments) * 200, 10);
        } else {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(`🔒 Nível ${area.unlockLevel} necessário`, canvas.width/2 - 120, y + 58);
        }
    });

    maxScroll = Math.max(0, AREAS.length * (cardHeight + 15) - (canvas.height - 180));
}

// Desenhar seleção de experimento
function drawExperimentSelect() {
    const area = AREAS[selectedArea];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, area.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ondas de fundo
    brainWaves.forEach(wave => {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
            const y = wave.y + Math.sin(x * wave.frequency + wave.phase + Date.now() * 0.002) * wave.amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${area.icon} ${area.name}`, canvas.width/2, 100);

    ctx.fillStyle = '#E94560';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const progress = playerData.areaProgress[selectedArea] || 0;
    const cols = 5;
    const size = 70;
    const spacing = 15;
    const startX = (canvas.width - (cols * (size + spacing))) / 2;
    const startY = 150 - scrollOffset;

    for (let i = 0; i < area.experiments; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (size + spacing);
        const y = startY + row * (size + spacing);

        if (y + size < 130 || y > canvas.height - 20) continue;

        const unlocked = i <= progress;
        const completed = i < progress;

        ctx.fillStyle = completed ? '#4ECDC4' : (unlocked ? area.color : '#333');
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 5;
        ctx.fillRect(x, y, size, size);
        ctx.shadowBlur = 0;

        if (unlocked && !completed) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, size, size);
        }

        ctx.fillStyle = unlocked ? '#FFF' : '#666';
        ctx.font = completed ? '24px Arial' : 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(completed ? '✅' : (unlocked ? (i + 1) : '🔒'), x + size/2, y + size/2 + 8);
    }

    maxScroll = Math.max(0, Math.ceil(area.experiments / cols) * (size + spacing) - (canvas.height - 200));
}

// Desenhar questão
function drawQuestion() {
    const area = AREAS[selectedArea];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, area.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ondas cerebrais de fundo
    ctx.globalAlpha = 0.2;
    brainWaves.forEach(wave => {
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
            const y = wave.y + Math.sin(x * wave.frequency + wave.phase + Date.now() * 0.002) * wave.amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });
    ctx.globalAlpha = 1;

    drawHUD();

    // Título
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${area.icon} ${area.name} - Experimento ${selectedExperiment + 1}`, canvas.width/2, 100);

    if (!currentQuestion) {
        const questions = QUESTIONS[selectedArea];
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        selectedAnswer = null;
        showingResult = false;
    }

    // Caixa da questão
    ctx.fillStyle = 'rgba(15, 15, 35, 0.95)';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 15;
    ctx.fillRect(canvas.width/2 - 300, 130, 600, 120);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = area.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 300, 130, 600, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    wrapText(currentQuestion.q, canvas.width/2, 180, 550, 28);

    // Respostas
    const shuffledAnswers = currentQuestion.shuffled || shuffleAnswers(currentQuestion);

    shuffledAnswers.forEach((answer, index) => {
        const y = 280 + index * 80;
        let bgColor = area.color;

        if (showingResult) {
            if (answer.originalIndex === currentQuestion.correct) {
                bgColor = '#4ECDC4';
            } else if (index === selectedAnswer) {
                bgColor = '#E94560';
            }
        } else if (index === selectedAnswer) {
            bgColor = '#F7DC6F';
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
        ctx.fillStyle = '#6B5B95';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CONFIRMAR 🧠', canvas.width/2, 643);
    }

    // Resultado
    if (showingResult) {
        ctx.fillStyle = resultCorrect ? '#4ECDC4' : '#E94560';
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
    drawLabBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏪 LOJA DO LAB', canvas.width/2, 100);

    ctx.fillStyle = '#E94560';
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

        ctx.fillStyle = '#1a1a2e';
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
        ctx.fillStyle = '#DDA0DD';
        ctx.fillText(item.description, x + 15, cardY + 50);

        ctx.fillStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`, x + 15, cardY + 72);

        // Botão comprar
        ctx.fillStyle = '#6B5B95';
        ctx.fillRect(x + 200, cardY + 50, 65, 28);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Comprar', x + 232, cardY + 69);
    });
}

// Desenhar casos
function drawCases() {
    drawLabBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📋 MEUS CASOS', canvas.width/2, 100);

    ctx.fillStyle = '#E94560';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    // Estatísticas
    ctx.fillStyle = 'rgba(15, 15, 35, 0.9)';
    ctx.fillRect(canvas.width/2 - 200, 150, 400, 200);
    ctx.strokeStyle = '#6B5B95';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 200, 150, 400, 200);

    ctx.fillStyle = '#DDA0DD';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';

    const stats = [
        `💡 Insights: ${playerData.insights}`,
        `📊 Casos Estudados: ${playerData.cases.length}`,
        `💕 Empatia: ${playerData.empathy}`,
        `🔬 Áreas Exploradas: ${playerData.unlockedAreas.length}`,
        `🧠 Nível Científico: ${level}`
    ];

    stats.forEach((stat, i) => {
        ctx.fillText(stat, canvas.width/2, 195 + i * 35);
    });

    // Dica psicológica
    ctx.fillStyle = 'rgba(107, 91, 149, 0.8)';
    ctx.fillRect(canvas.width/2 - 200, 380, 400, 100);
    ctx.strokeStyle = '#DDA0DD';
    ctx.strokeRect(canvas.width/2 - 200, 380, 400, 100);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('💭 Reflexão', canvas.width/2, 415);

    ctx.fillStyle = '#DDA0DD';
    ctx.font = '14px Arial';
    const tips = [
        'A mente é como um iceberg - só vemos a ponta.',
        'Comportamento é comunicação.',
        'Emoções são informações, não ordens.',
        'O cérebro muda com a experiência.'
    ];
    ctx.fillText(tips[Math.floor(Date.now() / 6000) % tips.length], canvas.width/2, 455);
}

// Desenhar conquistas
function drawAchievements() {
    drawLabBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CONQUISTAS', canvas.width/2, 100);

    ctx.fillStyle = '#E94560';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const achievements = [
        { name: 'Primeiro Insight', desc: 'Complete seu primeiro experimento', icon: '💡', unlocked: true },
        { name: 'Pesquisador', desc: 'Desbloqueie 3 áreas', icon: '🔬', unlocked: playerData.unlockedAreas.length >= 3 },
        { name: 'Empático', desc: 'Acumule 500 de empatia', icon: '💕', unlocked: playerData.empathy >= 500 },
        { name: 'Cientista', desc: 'Alcance nível 10', icon: '🧠', unlocked: level >= 10 },
        { name: 'Especialista', desc: 'Complete 5 áreas', icon: '📚', unlocked: Object.values(playerData.areaProgress).filter(p => p >= 50).length >= 5 },
        { name: 'Iluminado', desc: 'Acumule 1000 insights', icon: '✨', unlocked: playerData.insights >= 1000 },
        { name: 'Mestre da Mente', desc: 'Complete todas as áreas', icon: '👑', unlocked: false }
    ];

    achievements.forEach((ach, i) => {
        const y = 140 + i * 75;
        ctx.fillStyle = ach.unlocked ? '#6B5B95' : '#333';
        ctx.fillRect(canvas.width/2 - 200, y, 400, 65);

        if (ach.unlocked) {
            ctx.strokeStyle = '#DDA0DD';
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
        ctx.fillStyle = ach.unlocked ? '#DDA0DD' : '#666';
        ctx.fillText(ach.desc, canvas.width/2 - 130, y + 50);

        if (ach.unlocked) {
            ctx.fillStyle = '#4ECDC4';
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
        case 'areas': drawAreaSelect(); break;
        case 'experiments': drawExperimentSelect(); break;
        case 'question': drawQuestion(); break;
        case 'shop': drawShop(); break;
        case 'cases': drawCases(); break;
        case 'achievements': drawAchievements(); break;
    }
}

// Game loop
function gameLoop() {
    updateParticles();
    updateNeurons();
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
        playerData.insights += 10;
        playerData.empathy += 5;
        createParticles(canvas.width/2, 400, '#4ECDC4', 30);

        const progress = playerData.areaProgress[selectedArea] || 0;
        if (selectedExperiment === progress) {
            playerData.areaProgress[selectedArea] = progress + 1;
            playerData.cases.push(`Case_${Date.now()}`);
        }

        // Verificar level up
        const xpNeeded = level * 100;
        if (xp >= xpNeeded) {
            level++;
            xp -= xpNeeded;
            gems += 2;
            createParticles(canvas.width/2, 300, '#DDA0DD', 40);

            // Desbloquear áreas
            AREAS.forEach(area => {
                if (level >= area.unlockLevel && !playerData.unlockedAreas.includes(area.id)) {
                    playerData.unlockedAreas.push(area.id);
                }
            });
        }
    } else {
        createParticles(canvas.width/2, 400, '#E94560', 20);
    }

    saveGame();

    setTimeout(() => {
        currentQuestion = null;
        showingResult = false;
        selectedAnswer = null;
        if (resultCorrect) {
            currentScreen = 'experiments';
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
        if (y >= 260 && y <= 320) currentScreen = 'areas';
        else if (y >= 340 && y <= 400) currentScreen = 'shop';
        else if (y >= 420 && y <= 480) currentScreen = 'cases';
        else if (y >= 500 && y <= 560) currentScreen = 'achievements';
        scrollOffset = 0;
    }
    else if (currentScreen === 'areas') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
            return;
        }

        const startY = 140 - scrollOffset;
        AREAS.forEach((area, index) => {
            const cardY = startY + index * 105;
            if (y >= cardY && y <= cardY + 90 && x >= canvas.width/2 - 200 && x <= canvas.width/2 + 200) {
                const unlocked = level >= area.unlockLevel || playerData.unlockedAreas.includes(area.id);
                if (unlocked) {
                    selectedArea = index;
                    currentScreen = 'experiments';
                    scrollOffset = 0;
                }
            }
        });
    }
    else if (currentScreen === 'experiments') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'areas';
            scrollOffset = 0;
            return;
        }

        const area = AREAS[selectedArea];
        const progress = playerData.areaProgress[selectedArea] || 0;
        const cols = 5;
        const size = 70;
        const spacing = 15;
        const startX = (canvas.width - (cols * (size + spacing))) / 2;
        const startY = 150 - scrollOffset;

        for (let i = 0; i < area.experiments; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const expX = startX + col * (size + spacing);
            const expY = startY + row * (size + spacing);

            if (x >= expX && x <= expX + size && y >= expY && y <= expY + size) {
                if (i <= progress) {
                    selectedExperiment = i;
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

                    if (item.id === 'insight_pack') {
                        playerData.insights += 50;
                    } else if (item.id === 'case_study') {
                        playerData.cases.push(`Case_${Date.now()}`);
                    } else if (item.id === 'empathy_boost') {
                        playerData.empathy += 100;
                    }

                    createParticles(itemX + 140, itemY + 40, '#4ECDC4', 20);
                    saveGame();
                }
            }
        });
    }
    else if (currentScreen === 'cases' || currentScreen === 'achievements') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
        }
    }
});

// Scroll/Touch
canvas.addEventListener('wheel', (e) => {
    if (['areas', 'experiments'].includes(currentScreen)) {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + e.deltaY * 0.5));
        e.preventDefault();
    }
}, { passive: false });

let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (['areas', 'experiments'].includes(currentScreen)) {
        const deltaY = touchStartY - e.touches[0].clientY;
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + deltaY * 0.5));
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
}, { passive: false });

// Inicialização
loadGame();
gameLoop();
