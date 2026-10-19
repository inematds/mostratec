// Engineering Lab - Laboratório de Engenharia
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
let selectedField = null;
let selectedProject = null;
let currentQuestion = null;
let selectedAnswer = null;
let showingResult = false;
let resultCorrect = false;
let scrollOffset = 0;
let maxScroll = 0;

// Animações
let particles = [];
let gears = [];
let circuits = [];

// Dados do jogador
let playerData = {
    unlockedFields: [0],
    fieldProgress: {},
    blueprints: 0,
    patents: [],
    innovations: 0
};

// Campos da Engenharia (10 mundos)
const FIELDS = [
    { id: 0, name: 'Engenharia Civil', color: '#8B4513', icon: '🏗️', unlockLevel: 1, projects: 50 },
    { id: 1, name: 'Engenharia Mecânica', color: '#708090', icon: '⚙️', unlockLevel: 5, projects: 50 },
    { id: 2, name: 'Engenharia Elétrica', color: '#FFD700', icon: '⚡', unlockLevel: 10, projects: 50 },
    { id: 3, name: 'Engenharia Química', color: '#9932CC', icon: '🧪', unlockLevel: 15, projects: 50 },
    { id: 4, name: 'Engenharia de Software', color: '#00CED1', icon: '💻', unlockLevel: 20, projects: 50 },
    { id: 5, name: 'Engenharia Ambiental', color: '#228B22', icon: '🌱', unlockLevel: 25, projects: 50 },
    { id: 6, name: 'Engenharia Aeroespacial', color: '#4169E1', icon: '🚀', unlockLevel: 30, projects: 50 },
    { id: 7, name: 'Engenharia Biomédica', color: '#DC143C', icon: '🏥', unlockLevel: 35, projects: 50 },
    { id: 8, name: 'Engenharia de Materiais', color: '#CD853F', icon: '🔬', unlockLevel: 40, projects: 50 },
    { id: 9, name: 'Engenharia Robótica', color: '#FF4500', icon: '🤖', unlockLevel: 45, projects: 50 }
];

// Banco de questões por campo
const QUESTIONS = {
    0: [ // Engenharia Civil
        { q: 'O que é resistência dos materiais?', a: ['Estudo de tensões e deformações', 'Peso dos materiais', 'Cor dos materiais', 'Preço dos materiais'], correct: 0 },
        { q: 'O que é concreto armado?', a: ['Concreto com barras de aço', 'Concreto puro', 'Concreto com madeira', 'Concreto colorido'], correct: 0 },
        { q: 'O que é fundação?', a: ['Base que transmite cargas ao solo', 'Teto do prédio', 'Parede lateral', 'Janela'], correct: 0 },
        { q: 'O que é momento fletor?', a: ['Tendência de curvar uma viga', 'Peso da viga', 'Cor da viga', 'Preço da viga'], correct: 0 },
        { q: 'O que é tensão?', a: ['Força dividida pela área', 'Apenas força', 'Apenas área', 'Comprimento'], correct: 0 },
        { q: 'O que é deformação?', a: ['Mudança de forma sob carga', 'Cor do material', 'Peso', 'Altura'], correct: 0 },
        { q: 'O que é topografia?', a: ['Estudo do terreno', 'Estudo do clima', 'Estudo do mar', 'Estudo das plantas'], correct: 0 },
        { q: 'O que é cisalhamento?', a: ['Força que desliza camadas', 'Força de compressão', 'Força de tração', 'Força magnética'], correct: 0 },
        { q: 'O que é viga?', a: ['Elemento horizontal estrutural', 'Parede', 'Teto', 'Piso'], correct: 0 },
        { q: 'O que é pilar?', a: ['Elemento vertical estrutural', 'Janela', 'Porta', 'Telhado'], correct: 0 }
    ],
    1: [ // Engenharia Mecânica
        { q: 'O que é termodinâmica?', a: ['Estudo de calor e energia', 'Estudo de luz', 'Estudo de som', 'Estudo de cor'], correct: 0 },
        { q: 'O que é torque?', a: ['Momento de força rotacional', 'Velocidade', 'Aceleração', 'Massa'], correct: 0 },
        { q: 'O que é viscosidade?', a: ['Resistência ao escoamento', 'Temperatura', 'Pressão', 'Densidade'], correct: 0 },
        { q: 'O que é transmissão?', a: ['Sistema que transfere potência', 'Motor', 'Freio', 'Volante'], correct: 0 },
        { q: 'O que é CAD?', a: ['Desenho assistido por computador', 'Motor de carro', 'Tipo de metal', 'Ferramenta'], correct: 0 },
        { q: 'O que é refrigeração?', a: ['Transferência de calor', 'Aquecimento', 'Iluminação', 'Ventilação apenas'], correct: 0 },
        { q: 'O que é engrenagem?', a: ['Roda dentada para transmitir movimento', 'Tipo de parafuso', 'Tipo de porca', 'Motor'], correct: 0 },
        { q: 'O que é usinagem?', a: ['Processo de fabricação por remoção', 'Soldagem', 'Pintura', 'Montagem'], correct: 0 },
        { q: 'O que é atrito?', a: ['Resistência ao movimento entre superfícies', 'Velocidade', 'Aceleração', 'Força gravitacional'], correct: 0 },
        { q: 'O que é pneumática?', a: ['Sistema com ar comprimido', 'Sistema elétrico', 'Sistema hidráulico', 'Sistema solar'], correct: 0 }
    ],
    2: [ // Engenharia Elétrica
        { q: 'O que é corrente elétrica?', a: ['Fluxo de cargas elétricas', 'Tensão', 'Resistência', 'Potência'], correct: 0 },
        { q: 'Lei de Ohm relaciona?', a: ['V = R × I', 'F = m × a', 'E = m × c²', 'P = V × I'], correct: 0 },
        { q: 'O que é um capacitor?', a: ['Armazena energia elétrica', 'Gera energia', 'Consome energia', 'Transforma energia'], correct: 0 },
        { q: 'O que é indutor?', a: ['Armazena energia magnética', 'Armazena água', 'Armazena calor', 'Armazena luz'], correct: 0 },
        { q: 'O que é corrente alternada?', a: ['Muda de direção periodicamente', 'Sempre na mesma direção', 'Não existe', 'É constante'], correct: 0 },
        { q: 'O que é transformador?', a: ['Muda níveis de tensão', 'Gera eletricidade', 'Armazena eletricidade', 'Consome eletricidade'], correct: 0 },
        { q: 'O que é semicondutor?', a: ['Material entre condutor e isolante', 'Apenas condutor', 'Apenas isolante', 'Supercondutor'], correct: 0 },
        { q: 'O que é diodo?', a: ['Permite corrente em uma direção', 'Resiste à corrente', 'Amplifica corrente', 'Armazena corrente'], correct: 0 },
        { q: 'O que é transistor?', a: ['Amplifica ou chaveaм sinais', 'Armazena energia', 'Gera energia', 'Transforma energia'], correct: 0 },
        { q: 'O que é circuito integrado?', a: ['Muitos componentes em um chip', 'Um componente', 'Fio elétrico', 'Bateria'], correct: 0 }
    ],
    3: [ // Engenharia Química
        { q: 'O que é reator químico?', a: ['Equipamento onde ocorrem reações', 'Gerador de energia', 'Motor', 'Bomba'], correct: 0 },
        { q: 'O que é destilação?', a: ['Separação por ponto de ebulição', 'Mistura de substâncias', 'Reação química', 'Combustão'], correct: 0 },
        { q: 'O que é catalisador?', a: ['Acelera reação sem ser consumido', 'Reagente', 'Produto', 'Solvente'], correct: 0 },
        { q: 'O que é balanço de massa?', a: ['Entrada = Saída + Acúmulo', 'Peso total', 'Volume total', 'Temperatura'], correct: 0 },
        { q: 'O que é transferência de calor?', a: ['Energia térmica em movimento', 'Energia elétrica', 'Energia mecânica', 'Energia nuclear'], correct: 0 },
        { q: 'O que é polímero?', a: ['Molécula grande de unidades repetidas', 'Átomo simples', 'Íon', 'Elétron'], correct: 0 },
        { q: 'O que é extração?', a: ['Separação por solvente', 'Mistura', 'Reação', 'Combustão'], correct: 0 },
        { q: 'O que é fermentação?', a: ['Reação biológica', 'Reação nuclear', 'Reação elétrica', 'Reação mecânica'], correct: 0 },
        { q: 'O que é craqueamento?', a: ['Quebra de moléculas grandes', 'União de moléculas', 'Coloração', 'Purificação'], correct: 0 },
        { q: 'O que é PID em controle?', a: ['Proporcional-Integral-Derivativo', 'Programa de computador', 'Tipo de reator', 'Medidor'], correct: 0 }
    ],
    4: [ // Engenharia de Software
        { q: 'O que é algoritmo?', a: ['Sequência de passos para resolver problema', 'Linguagem', 'Hardware', 'Rede'], correct: 0 },
        { q: 'O que é debugging?', a: ['Encontrar e corrigir erros', 'Criar erros', 'Ignorar erros', 'Documentar erros'], correct: 0 },
        { q: 'O que é banco de dados?', a: ['Sistema organizado de dados', 'Programa', 'Hardware', 'Rede'], correct: 0 },
        { q: 'O que é API?', a: ['Interface de programação', 'Linguagem', 'Sistema operacional', 'Hardware'], correct: 0 },
        { q: 'O que é versionamento?', a: ['Controle de mudanças no código', 'Criar versões aleatórias', 'Deletar código', 'Copiar código'], correct: 0 },
        { q: 'O que é teste unitário?', a: ['Testa partes individuais', 'Testa tudo junto', 'Não testa nada', 'Testa hardware'], correct: 0 },
        { q: 'O que é OOP?', a: ['Programação orientada a objetos', 'Sistema operacional', 'Banco de dados', 'Rede'], correct: 0 },
        { q: 'O que é Agile?', a: ['Metodologia de desenvolvimento', 'Linguagem', 'Banco de dados', 'Hardware'], correct: 0 },
        { q: 'O que é cloud computing?', a: ['Computação em nuvem', 'Hardware local', 'CD-ROM', 'Disquete'], correct: 0 },
        { q: 'O que é DevOps?', a: ['Desenvolvimento + Operações', 'Só desenvolvimento', 'Só operações', 'Marketing'], correct: 0 }
    ],
    5: [ // Engenharia Ambiental
        { q: 'O que é EIA/RIMA?', a: ['Estudo de impacto ambiental', 'Tipo de poluição', 'Lei ambiental', 'Órgão público'], correct: 0 },
        { q: 'O que é tratamento de efluentes?', a: ['Limpeza de águas residuais', 'Poluição', 'Desmatamento', 'Queimada'], correct: 0 },
        { q: 'O que é aterro sanitário?', a: ['Disposição controlada de resíduos', 'Lixão', 'Rio', 'Floresta'], correct: 0 },
        { q: 'O que é DBO?', a: ['Demanda bioquímica de oxigênio', 'Tipo de poluente', 'Lei ambiental', 'Órgão'], correct: 0 },
        { q: 'O que é reciclagem?', a: ['Reprocessamento de materiais', 'Descarte', 'Queima', 'Enterro'], correct: 0 },
        { q: 'O que é licenciamento ambiental?', a: ['Autorização para atividades', 'Multa', 'Poluição', 'Desmatamento'], correct: 0 },
        { q: 'O que é energia renovável?', a: ['Energia de fontes inesgotáveis', 'Petróleo', 'Carvão', 'Gás natural'], correct: 0 },
        { q: 'O que é efeito estufa?', a: ['Aquecimento por gases na atmosfera', 'Resfriamento', 'Chuva', 'Vento'], correct: 0 },
        { q: 'O que é pegada de carbono?', a: ['Emissões de CO2', 'Pegada no chão', 'Rastro de animal', 'Marca'], correct: 0 },
        { q: 'O que é compostagem?', a: ['Decomposição de matéria orgânica', 'Queima', 'Enterro', 'Reciclagem de metal'], correct: 0 }
    ],
    6: [ // Engenharia Aeroespacial
        { q: 'O que é aerodinâmica?', a: ['Estudo do ar em movimento', 'Estudo da água', 'Estudo do fogo', 'Estudo da terra'], correct: 0 },
        { q: 'O que gera sustentação em uma asa?', a: ['Diferença de pressão', 'Cor da asa', 'Material da asa', 'Tamanho apenas'], correct: 0 },
        { q: 'O que é empuxo em foguetes?', a: ['Força de propulsão', 'Peso', 'Arrasto', 'Sustentação'], correct: 0 },
        { q: 'O que é número de Mach?', a: ['Velocidade / Velocidade do som', 'Velocidade apenas', 'Aceleração', 'Força'], correct: 0 },
        { q: 'O que é órbita geoestacionária?', a: ['Órbita que acompanha rotação da Terra', 'Órbita baixa', 'Órbita lunar', 'Órbita solar'], correct: 0 },
        { q: 'O que é arrasto aerodinâmico?', a: ['Resistência do ar ao movimento', 'Sustentação', 'Empuxo', 'Peso'], correct: 0 },
        { q: 'O que é combustível de foguete?', a: ['Propelente para gerar empuxo', 'Gasolina comum', 'Água', 'Ar'], correct: 0 },
        { q: 'O que é aviônica?', a: ['Eletrônica de aeronaves', 'Motor', 'Asa', 'Fuselagem'], correct: 0 },
        { q: 'O que é velocidade de escape?', a: ['Velocidade para sair da gravidade', 'Velocidade mínima', 'Velocidade média', 'Velocidade zero'], correct: 0 },
        { q: 'O que é telemetria?', a: ['Transmissão de dados à distância', 'Motor', 'Combustível', 'Estrutura'], correct: 0 }
    ],
    7: [ // Engenharia Biomédica
        { q: 'O que é prótese?', a: ['Dispositivo que substitui parte do corpo', 'Medicamento', 'Vacina', 'Exame'], correct: 0 },
        { q: 'O que é ECG?', a: ['Eletrocardiograma', 'Tipo de prótese', 'Medicamento', 'Cirurgia'], correct: 0 },
        { q: 'O que é biomaterial?', a: ['Material compatível com o corpo', 'Qualquer material', 'Só metal', 'Só plástico'], correct: 0 },
        { q: 'O que é biocompatibilidade?', a: ['Compatibilidade com tecidos vivos', 'Incompatibilidade', 'Rejeição', 'Alergia'], correct: 0 },
        { q: 'O que é ressonância magnética?', a: ['Exame com campos magnéticos', 'Raio-X', 'Ultrassom', 'Tomografia'], correct: 0 },
        { q: 'O que é marcapasso?', a: ['Regula batimentos cardíacos', 'Mede pressão', 'Mede temperatura', 'Mede glicose'], correct: 0 },
        { q: 'O que é engenharia de tecidos?', a: ['Criar tecidos biológicos', 'Fazer roupas', 'Construir prédios', 'Fazer móveis'], correct: 0 },
        { q: 'O que é biomecânica?', a: ['Mecânica aplicada ao corpo', 'Biologia apenas', 'Mecânica apenas', 'Química'], correct: 0 },
        { q: 'O que é stent?', a: ['Tubo que mantém artéria aberta', 'Medicamento', 'Vacina', 'Exame'], correct: 0 },
        { q: 'O que é eletroencefalograma?', a: ['Registra atividade cerebral', 'Registra coração', 'Registra músculos', 'Registra ossos'], correct: 0 }
    ],
    8: [ // Engenharia de Materiais
        { q: 'O que é metalurgia?', a: ['Ciência dos metais', 'Ciência das plantas', 'Ciência dos animais', 'Ciência do clima'], correct: 0 },
        { q: 'O que é liga metálica?', a: ['Mistura de metais', 'Metal puro', 'Plástico', 'Cerâmica'], correct: 0 },
        { q: 'O que é cerâmica?', a: ['Material inorgânico não-metálico', 'Metal', 'Plástico', 'Madeira'], correct: 0 },
        { q: 'O que é polímero?', a: ['Cadeia de moléculas repetidas', 'Átomo', 'Íon', 'Elétron'], correct: 0 },
        { q: 'O que é compósito?', a: ['Combinação de materiais', 'Material único', 'Metal puro', 'Plástico puro'], correct: 0 },
        { q: 'O que é nanomaterial?', a: ['Material em escala nanométrica', 'Material grande', 'Material colorido', 'Material pesado'], correct: 0 },
        { q: 'O que é corrosão?', a: ['Degradação por reação química', 'Fortalecimento', 'Crescimento', 'Melhoramento'], correct: 0 },
        { q: 'O que é tratamento térmico?', a: ['Alterar propriedades por calor', 'Pintura', 'Polimento', 'Corte'], correct: 0 },
        { q: 'O que é fadiga de material?', a: ['Falha por cargas repetidas', 'Fortalecimento', 'Crescimento', 'Recuperação'], correct: 0 },
        { q: 'O que é cristalografia?', a: ['Estudo de estruturas cristalinas', 'Estudo de líquidos', 'Estudo de gases', 'Estudo de plasma'], correct: 0 }
    ],
    9: [ // Engenharia Robótica
        { q: 'O que é robô?', a: ['Máquina programável para tarefas', 'Computador comum', 'Calculadora', 'Celular'], correct: 0 },
        { q: 'O que são sensores?', a: ['Dispositivos que detectam estímulos', 'Motores', 'Baterias', 'Telas'], correct: 0 },
        { q: 'O que são atuadores?', a: ['Dispositivos que produzem movimento', 'Sensores', 'Câmeras', 'Microfones'], correct: 0 },
        { q: 'O que é cinemática?', a: ['Estudo do movimento sem forças', 'Estudo das forças', 'Estudo da cor', 'Estudo do som'], correct: 0 },
        { q: 'O que é grau de liberdade em robótica?', a: ['Eixos de movimento independentes', 'Peso do robô', 'Cor do robô', 'Tamanho'], correct: 0 },
        { q: 'O que é visão computacional?', a: ['Máquinas interpretam imagens', 'Humanos veem', 'Animais veem', 'Plantas veem'], correct: 0 },
        { q: 'O que é ROS?', a: ['Sistema operacional de robôs', 'Tipo de motor', 'Tipo de sensor', 'Tipo de bateria'], correct: 0 },
        { q: 'O que é robô colaborativo?', a: ['Trabalha com humanos', 'Trabalha sozinho', 'Não funciona', 'É perigoso'], correct: 0 },
        { q: 'O que é SLAM?', a: ['Mapeamento e localização simultâneos', 'Tipo de motor', 'Tipo de sensor', 'Linguagem'], correct: 0 },
        { q: 'O que é controle PID em robótica?', a: ['Sistema de controle de feedback', 'Tipo de robô', 'Linguagem', 'Sensor'], correct: 0 }
    ]
};

// Loja
const SHOP_ITEMS = [
    { id: 'blueprint_pack', name: 'Pacote de Projetos', price: 100, currency: 'coins', description: '+50 projetos' },
    { id: 'patent_file', name: 'Arquivo de Patente', price: 150, currency: 'coins', description: '+1 patente' },
    { id: 'innovation_boost', name: 'Boost de Inovação', price: 200, currency: 'coins', description: '+100 inovações' },
    { id: 'field_unlock', name: 'Desbloquear Campo', price: 5, currency: 'gems', description: 'Próximo campo' },
    { id: 'double_xp', name: 'XP Dobrado', price: 3, currency: 'gems', description: '2x XP por 10 projetos' },
    { id: 'engineer_helmet', name: 'Capacete de Engenheiro', price: 10, currency: 'gems', description: 'Visual profissional' }
];

// Inicializar engrenagens animadas
function initGears() {
    gears = [];
    for (let i = 0; i < 5; i++) {
        gears.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 30 + 20,
            teeth: Math.floor(Math.random() * 6) + 8,
            rotation: Math.random() * Math.PI * 2,
            speed: (Math.random() - 0.5) * 0.02,
            color: `hsl(${Math.random() * 60 + 20}, 50%, 50%)`
        });
    }
}

// Inicializar circuitos
function initCircuits() {
    circuits = [];
    for (let i = 0; i < 15; i++) {
        circuits.push({
            x1: Math.random() * canvas.width,
            y1: Math.random() * canvas.height,
            x2: Math.random() * canvas.width,
            y2: Math.random() * canvas.height,
            pulse: Math.random(),
            speed: Math.random() * 0.02 + 0.01
        });
    }
}

// Carregar jogo
function loadGame() {
    const saved = localStorage.getItem('engineeringLab');
    if (saved) {
        const data = JSON.parse(saved);
        coins = data.coins || 100;
        gems = data.gems || 5;
        xp = data.xp || 0;
        level = data.level || 1;
        playerData = data.playerData || playerData;
    }
    initGears();
    initCircuits();
}

// Salvar jogo
function saveGame() {
    localStorage.setItem('engineeringLab', JSON.stringify({
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

// Atualizar engrenagens
function updateGears() {
    gears.forEach(g => {
        g.rotation += g.speed;
    });
}

// Atualizar circuitos
function updateCircuits() {
    circuits.forEach(c => {
        c.pulse += c.speed;
        if (c.pulse > 1) c.pulse = 0;
    });
}

// Desenhar engrenagem
function drawGear(x, y, radius, teeth, rotation, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
        const angle = (i * Math.PI) / teeth;
        const r = i % 2 === 0 ? radius : radius * 0.8;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Centro
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Desenhar fundo de engenharia
function drawEngineeringBackground() {
    // Gradiente industrial
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#2d3436');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid técnico
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Circuitos
    ctx.globalAlpha = 0.3;
    circuits.forEach(c => {
        const gradient = ctx.createLinearGradient(c.x1, c.y1, c.x2, c.y2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(c.pulse, '#FFD700');
        gradient.addColorStop(Math.min(c.pulse + 0.1, 1), 'transparent');
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Engrenagens
    ctx.globalAlpha = 0.2;
    gears.forEach(g => {
        drawGear(g.x, g.y, g.radius, g.teeth, g.rotation, g.color);
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

    ctx.fillStyle = '#FF6B6B';
    ctx.fillText(`⭐ XP: ${xp}`, 220, 38);

    ctx.fillStyle = '#FFD700';
    ctx.fillText(`⚙️ Nível ${level}`, 350, 38);

    ctx.fillStyle = '#4ECDC4';
    ctx.textAlign = 'right';
    ctx.fillText(`📐 Projetos: ${playerData.blueprints}`, canvas.width - 20, 38);
}

// Desenhar menu principal
function drawMenu() {
    drawEngineeringBackground();
    drawHUD();

    // Título
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('⚙️ ENGINEERING LAB 🔧', canvas.width/2, 140);
    ctx.fillText('⚙️ ENGINEERING LAB 🔧', canvas.width/2, 140);

    ctx.font = '22px Arial';
    ctx.fillStyle = '#E0E0E0';
    ctx.fillText('Laboratório de Engenharia', canvas.width/2, 180);

    // Botões
    const buttons = [
        { text: '🏗️ CAMPOS DA ENGENHARIA', y: 260, color: '#8B4513' },
        { text: '🏪 LOJA DO ENGENHEIRO', y: 340, color: '#708090' },
        { text: '📐 MEUS PROJETOS', y: 420, color: '#4169E1' },
        { text: '🏆 CONQUISTAS', y: 500, color: '#FFD700' }
    ];

    buttons.forEach(btn => {
        ctx.fillStyle = btn.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 15;
        ctx.fillRect(canvas.width/2 - 180, btn.y, 360, 60);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 180, btn.y, 360, 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(btn.text, canvas.width/2, btn.y + 40);
    });

    // Estatísticas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
    ctx.fillRect(canvas.width/2 - 150, 580, 300, 80);
    ctx.fillStyle = '#FFD700';
    ctx.font = '16px Arial';
    ctx.fillText(`📜 Patentes: ${playerData.patents.length}`, canvas.width/2, 610);
    ctx.fillText(`💡 Inovações: ${playerData.innovations}`, canvas.width/2, 640);
}

// Desenhar seleção de campos
function drawFieldSelect() {
    drawEngineeringBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏗️ CAMPOS DA ENGENHARIA', canvas.width/2, 100);

    // Botão voltar
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Voltar', 70, 107);

    const startY = 140 - scrollOffset;
    const cardHeight = 90;
    const visibleTop = 130;
    const visibleBottom = canvas.height - 20;

    FIELDS.forEach((field, index) => {
        const y = startY + index * (cardHeight + 15);

        if (y + cardHeight < visibleTop || y > visibleBottom) return;

        const unlocked = level >= field.unlockLevel || playerData.unlockedFields.includes(field.id);
        const progress = playerData.fieldProgress[field.id] || 0;

        ctx.fillStyle = unlocked ? field.color : '#333';
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
        ctx.fillText(field.icon, canvas.width/2 - 180, y + 50);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(field.name, canvas.width/2 - 120, y + 35);

        if (unlocked) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#DDD';
            ctx.fillText(`Progresso: ${progress}/${field.projects} projetos`, canvas.width/2 - 120, y + 58);

            // Barra de progresso
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(canvas.width/2 - 120, y + 66, 200, 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(canvas.width/2 - 120, y + 66, (progress/field.projects) * 200, 10);
        } else {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(`🔒 Nível ${field.unlockLevel} necessário`, canvas.width/2 - 120, y + 58);
        }
    });

    maxScroll = Math.max(0, FIELDS.length * (cardHeight + 15) - (canvas.height - 180));
}

// Desenhar seleção de projeto
function drawProjectSelect() {
    const field = FIELDS[selectedField];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, field.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${field.icon} ${field.name}`, canvas.width/2, 100);

    ctx.fillStyle = '#DC143C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const progress = playerData.fieldProgress[selectedField] || 0;
    const cols = 5;
    const size = 70;
    const spacing = 15;
    const startX = (canvas.width - (cols * (size + spacing))) / 2;
    const startY = 150 - scrollOffset;

    for (let i = 0; i < field.projects; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (size + spacing);
        const y = startY + row * (size + spacing);

        if (y + size < 130 || y > canvas.height - 20) continue;

        const unlocked = i <= progress;
        const completed = i < progress;

        ctx.fillStyle = completed ? '#FFD700' : (unlocked ? field.color : '#333');
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 5;
        ctx.fillRect(x, y, size, size);
        ctx.shadowBlur = 0;

        if (unlocked && !completed) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, size, size);
        }

        ctx.fillStyle = unlocked ? '#FFF' : '#666';
        ctx.font = completed ? '24px Arial' : 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(completed ? '✅' : (unlocked ? (i + 1) : '🔒'), x + size/2, y + size/2 + 8);
    }

    maxScroll = Math.max(0, Math.ceil(field.projects / cols) * (size + spacing) - (canvas.height - 200));
}

// Desenhar questão
function drawQuestion() {
    const field = FIELDS[selectedField];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, field.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Engrenagens de fundo
    ctx.globalAlpha = 0.1;
    gears.forEach(g => {
        drawGear(g.x, g.y, g.radius, g.teeth, g.rotation, '#FFD700');
    });
    ctx.globalAlpha = 1;

    drawHUD();

    // Título
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${field.icon} ${field.name} - Projeto ${selectedProject + 1}`, canvas.width/2, 100);

    if (!currentQuestion) {
        const questions = QUESTIONS[selectedField];
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        selectedAnswer = null;
        showingResult = false;
    }

    // Caixa da questão
    ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 15;
    ctx.fillRect(canvas.width/2 - 300, 130, 600, 120);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 300, 130, 600, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    wrapText(currentQuestion.q, canvas.width/2, 180, 550, 28);

    // Respostas
    const shuffledAnswers = currentQuestion.shuffled || shuffleAnswers(currentQuestion);

    shuffledAnswers.forEach((answer, index) => {
        const y = 280 + index * 80;
        let bgColor = field.color;

        if (showingResult) {
            if (answer.originalIndex === currentQuestion.correct) {
                bgColor = '#2ECC71';
            } else if (index === selectedAnswer) {
                bgColor = '#E74C3C';
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
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('PROJETAR ⚙️', canvas.width/2, 643);
    }

    // Resultado
    if (showingResult) {
        ctx.fillStyle = resultCorrect ? '#2ECC71' : '#E74C3C';
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
    drawEngineeringBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏪 LOJA DO ENGENHEIRO', canvas.width/2, 100);

    ctx.fillStyle = '#DC143C';
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
        ctx.fillStyle = '#FFD700';
        ctx.fillText(item.description, x + 15, cardY + 50);

        ctx.fillStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`, x + 15, cardY + 72);

        // Botão comprar
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 200, cardY + 50, 65, 28);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Comprar', x + 232, cardY + 69);
    });
}

// Desenhar projetos
function drawProjects() {
    drawEngineeringBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📐 MEUS PROJETOS', canvas.width/2, 100);

    ctx.fillStyle = '#DC143C';
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

    ctx.fillStyle = '#FFD700';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';

    const stats = [
        `📐 Projetos: ${playerData.blueprints}`,
        `📜 Patentes: ${playerData.patents.length}`,
        `💡 Inovações: ${playerData.innovations}`,
        `🏗️ Campos Explorados: ${playerData.unlockedFields.length}`,
        `⚙️ Nível Engenheiro: ${level}`
    ];

    stats.forEach((stat, i) => {
        ctx.fillText(stat, canvas.width/2, 195 + i * 35);
    });

    // Dica de engenharia
    ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
    ctx.fillRect(canvas.width/2 - 200, 380, 400, 100);
    ctx.strokeStyle = '#FFD700';
    ctx.strokeRect(canvas.width/2 - 200, 380, 400, 100);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('💡 Dica de Engenharia', canvas.width/2, 415);

    ctx.fillStyle = '#FFD700';
    ctx.font = '14px Arial';
    const tips = [
        'Sempre considere a segurança primeiro.',
        'Projete para facilitar a manutenção.',
        'Teste, teste, teste novamente.',
        'Documentação é parte do projeto.'
    ];
    ctx.fillText(tips[Math.floor(Date.now() / 6000) % tips.length], canvas.width/2, 455);
}

// Desenhar conquistas
function drawAchievements() {
    drawEngineeringBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CONQUISTAS', canvas.width/2, 100);

    ctx.fillStyle = '#DC143C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const achievements = [
        { name: 'Primeiro Projeto', desc: 'Complete seu primeiro projeto', icon: '📐', unlocked: true },
        { name: 'Explorador', desc: 'Desbloqueie 3 campos', icon: '🔍', unlocked: playerData.unlockedFields.length >= 3 },
        { name: 'Inventor', desc: 'Acumule 10 patentes', icon: '📜', unlocked: playerData.patents.length >= 10 },
        { name: 'Engenheiro', desc: 'Alcance nível 10', icon: '⚙️', unlocked: level >= 10 },
        { name: 'Inovador', desc: 'Acumule 500 inovações', icon: '💡', unlocked: playerData.innovations >= 500 },
        { name: 'Especialista', desc: 'Complete 5 campos', icon: '🏅', unlocked: Object.values(playerData.fieldProgress).filter(p => p >= 50).length >= 5 },
        { name: 'Mestre Engenheiro', desc: 'Complete todos os campos', icon: '👑', unlocked: false }
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
        ctx.font = 'bold 18px Arial';
        ctx.fillText(ach.name, canvas.width/2 - 130, y + 28);

        ctx.font = '14px Arial';
        ctx.fillStyle = ach.unlocked ? '#FFD700' : '#666';
        ctx.fillText(ach.desc, canvas.width/2 - 130, y + 50);

        if (ach.unlocked) {
            ctx.fillStyle = '#2ECC71';
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
        case 'fields': drawFieldSelect(); break;
        case 'projects': drawProjectSelect(); break;
        case 'question': drawQuestion(); break;
        case 'shop': drawShop(); break;
        case 'myProjects': drawProjects(); break;
        case 'achievements': drawAchievements(); break;
    }
}

// Game loop
function gameLoop() {
    updateParticles();
    updateGears();
    updateCircuits();
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
        playerData.blueprints++;
        playerData.innovations += 10;
        createParticles(canvas.width/2, 400, '#FFD700', 30);

        const progress = playerData.fieldProgress[selectedField] || 0;
        if (selectedProject === progress) {
            playerData.fieldProgress[selectedField] = progress + 1;
        }

        // Verificar level up
        const xpNeeded = level * 100;
        if (xp >= xpNeeded) {
            level++;
            xp -= xpNeeded;
            gems += 2;
            playerData.patents.push(`Patent_${Date.now()}`);
            createParticles(canvas.width/2, 300, '#4169E1', 40);

            // Desbloquear campos
            FIELDS.forEach(field => {
                if (level >= field.unlockLevel && !playerData.unlockedFields.includes(field.id)) {
                    playerData.unlockedFields.push(field.id);
                }
            });
        }
    } else {
        createParticles(canvas.width/2, 400, '#E74C3C', 20);
    }

    saveGame();

    setTimeout(() => {
        currentQuestion = null;
        showingResult = false;
        selectedAnswer = null;
        if (resultCorrect) {
            currentScreen = 'projects';
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
        if (y >= 260 && y <= 320) currentScreen = 'fields';
        else if (y >= 340 && y <= 400) currentScreen = 'shop';
        else if (y >= 420 && y <= 480) currentScreen = 'myProjects';
        else if (y >= 500 && y <= 560) currentScreen = 'achievements';
        scrollOffset = 0;
    }
    else if (currentScreen === 'fields') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
            return;
        }

        const startY = 140 - scrollOffset;
        FIELDS.forEach((field, index) => {
            const cardY = startY + index * 105;
            if (y >= cardY && y <= cardY + 90 && x >= canvas.width/2 - 200 && x <= canvas.width/2 + 200) {
                const unlocked = level >= field.unlockLevel || playerData.unlockedFields.includes(field.id);
                if (unlocked) {
                    selectedField = index;
                    currentScreen = 'projects';
                    scrollOffset = 0;
                }
            }
        });
    }
    else if (currentScreen === 'projects') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'fields';
            scrollOffset = 0;
            return;
        }

        const field = FIELDS[selectedField];
        const progress = playerData.fieldProgress[selectedField] || 0;
        const cols = 5;
        const size = 70;
        const spacing = 15;
        const startX = (canvas.width - (cols * (size + spacing))) / 2;
        const startY = 150 - scrollOffset;

        for (let i = 0; i < field.projects; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const projX = startX + col * (size + spacing);
            const projY = startY + row * (size + spacing);

            if (x >= projX && x <= projX + size && y >= projY && y <= projY + size) {
                if (i <= progress) {
                    selectedProject = i;
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

                    if (item.id === 'blueprint_pack') {
                        playerData.blueprints += 50;
                    } else if (item.id === 'patent_file') {
                        playerData.patents.push(`Patent_${Date.now()}`);
                    } else if (item.id === 'innovation_boost') {
                        playerData.innovations += 100;
                    }

                    createParticles(itemX + 140, itemY + 40, '#FFD700', 20);
                    saveGame();
                }
            }
        });
    }
    else if (currentScreen === 'myProjects' || currentScreen === 'achievements') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
        }
    }
});

// Scroll/Touch
canvas.addEventListener('wheel', (e) => {
    if (['fields', 'projects'].includes(currentScreen)) {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + e.deltaY * 0.5));
        e.preventDefault();
    }
}, { passive: false });

let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (['fields', 'projects'].includes(currentScreen)) {
        const deltaY = touchStartY - e.touches[0].clientY;
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + deltaY * 0.5));
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
}, { passive: false });

// Inicialização
loadGame();
gameLoop();
