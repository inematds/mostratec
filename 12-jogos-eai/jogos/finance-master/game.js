// Finance Master - Mestre das Finanças
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let coins = 100;
let gems = 5;
let xp = 0;
let level = 1;
let currentScreen = 'menu';
let selectedTopic = null;
let selectedLesson = null;
let currentQuestion = null;
let selectedAnswer = null;
let showingResult = false;
let resultCorrect = false;
let scrollOffset = 0;
let maxScroll = 0;

let particles = [];
let floatingCoins = [];

let playerData = {
    unlockedTopics: [0],
    topicProgress: {},
    portfolio: 0,
    investments: [],
    netWorth: 1000
};

const TOPICS = [
    { id: 0, name: 'Finanças Pessoais', color: '#27AE60', icon: '💰', unlockLevel: 1, lessons: 50 },
    { id: 1, name: 'Orçamento', color: '#3498DB', icon: '📊', unlockLevel: 5, lessons: 50 },
    { id: 2, name: 'Investimentos', color: '#9B59B6', icon: '📈', unlockLevel: 10, lessons: 50 },
    { id: 3, name: 'Mercado de Ações', color: '#E74C3C', icon: '📉', unlockLevel: 15, lessons: 50 },
    { id: 4, name: 'Renda Fixa', color: '#1ABC9C', icon: '🏦', unlockLevel: 20, lessons: 50 },
    { id: 5, name: 'Fundos', color: '#F39C12', icon: '🎯', unlockLevel: 25, lessons: 50 },
    { id: 6, name: 'Criptomoedas', color: '#E67E22', icon: '₿', unlockLevel: 30, lessons: 50 },
    { id: 7, name: 'Economia', color: '#2C3E50', icon: '🌐', unlockLevel: 35, lessons: 50 },
    { id: 8, name: 'Impostos', color: '#7F8C8D', icon: '📋', unlockLevel: 40, lessons: 50 },
    { id: 9, name: 'Empreendedorismo', color: '#C0392B', icon: '🚀', unlockLevel: 45, lessons: 50 }
];

const QUESTIONS = {
    0: [
        { q: 'O que é reserva de emergência?', a: ['Dinheiro para imprevistos', 'Investimento', 'Dívida', 'Salário'], correct: 0 },
        { q: 'Quantos meses de despesas deve ter a reserva?', a: ['6-12 meses', '1 mês', '1 ano', '5 anos'], correct: 0 },
        { q: 'O que é educação financeira?', a: ['Aprender sobre dinheiro', 'Curso de economia', 'MBA', 'Contabilidade'], correct: 0 },
        { q: 'Qual é a regra 50-30-20?', a: ['Necessidades, desejos, poupança', 'Investir tudo', 'Gastar tudo', 'Poupar tudo'], correct: 0 },
        { q: 'O que são juros compostos?', a: ['Juros sobre juros', 'Juros simples', 'Sem juros', 'Taxa fixa'], correct: 0 },
        { q: 'O que é score de crédito?', a: ['Pontuação financeira', 'Nota escolar', 'Salário', 'Patrimônio'], correct: 0 },
        { q: 'O que é planejamento financeiro?', a: ['Organizar finanças', 'Gastar mais', 'Não planejar', 'Endividar'], correct: 0 },
        { q: 'O que é inflação?', a: ['Aumento geral de preços', 'Queda de preços', 'Estabilidade', 'Deflação'], correct: 0 },
        { q: 'O que significa pagar-se primeiro?', a: ['Poupar antes de gastar', 'Pagar dívidas', 'Gastar primeiro', 'Não poupar'], correct: 0 },
        { q: 'O que é meta SMART?', a: ['Específica, mensurável, atingível, relevante, temporal', 'Inteligente', 'Rápida', 'Fácil'], correct: 0 }
    ],
    1: [
        { q: 'O que é orçamento?', a: ['Plano de receitas e despesas', 'Lista de compras', 'Salário', 'Dívida'], correct: 0 },
        { q: 'O que são despesas fixas?', a: ['Gastos regulares iguais', 'Gastos variáveis', 'Investimentos', 'Receitas'], correct: 0 },
        { q: 'O que são despesas variáveis?', a: ['Gastos que mudam', 'Gastos fixos', 'Salário', 'Poupança'], correct: 0 },
        { q: 'O que é fluxo de caixa?', a: ['Entrada e saída de dinheiro', 'Conta bancária', 'Investimento', 'Dívida'], correct: 0 },
        { q: 'O que é saldo?', a: ['Diferença entre receitas e despesas', 'Apenas receitas', 'Apenas despesas', 'Dívida'], correct: 0 },
        { q: 'O que é receita líquida?', a: ['Receita após descontos', 'Receita bruta', 'Despesa', 'Lucro'], correct: 0 },
        { q: 'Por que fazer orçamento?', a: ['Controlar gastos', 'Gastar mais', 'Não é necessário', 'Complicar vida'], correct: 0 },
        { q: 'O que é déficit orçamentário?', a: ['Gastar mais que ganha', 'Poupar', 'Investir', 'Equilíbrio'], correct: 0 },
        { q: 'O que é superávit?', a: ['Sobra de dinheiro', 'Falta de dinheiro', 'Dívida', 'Empréstimo'], correct: 0 },
        { q: 'O que cortar primeiro no orçamento?', a: ['Supérfluos', 'Necessidades', 'Alimentação', 'Moradia'], correct: 0 }
    ],
    2: [
        { q: 'O que é diversificação?', a: ['Não colocar tudo em um lugar', 'Investir em um ativo', 'Não investir', 'Poupar apenas'], correct: 0 },
        { q: 'O que é risco?', a: ['Possibilidade de perda', 'Garantia de ganho', 'Sem perdas', 'Certeza'], correct: 0 },
        { q: 'O que é retorno?', a: ['Ganho do investimento', 'Perda', 'Risco', 'Capital'], correct: 0 },
        { q: 'O que é liquidez?', a: ['Facilidade de converter em dinheiro', 'Solidez', 'Risco', 'Rentabilidade'], correct: 0 },
        { q: 'O que é perfil de investidor?', a: ['Tolerância ao risco', 'Idade', 'Profissão', 'Salário'], correct: 0 },
        { q: 'O que é investidor conservador?', a: ['Evita riscos', 'Aceita riscos', 'Não investe', 'Especula'], correct: 0 },
        { q: 'O que é investidor arrojado?', a: ['Aceita mais riscos', 'Evita riscos', 'Não investe', 'Conservador'], correct: 0 },
        { q: 'O que é horizonte de investimento?', a: ['Tempo que pretende investir', 'Valor investido', 'Risco', 'Retorno'], correct: 0 },
        { q: 'O que é carteira de investimentos?', a: ['Conjunto de ativos', 'Conta bancária', 'Salário', 'Dívida'], correct: 0 },
        { q: 'O que é alocação de ativos?', a: ['Distribuição do investimento', 'Um único ativo', 'Não investir', 'Gastar'], correct: 0 }
    ],
    3: [
        { q: 'O que é ação?', a: ['Parte de uma empresa', 'Dívida', 'Empréstimo', 'Conta'], correct: 0 },
        { q: 'O que é bolsa de valores?', a: ['Mercado de ações', 'Banco', 'Loja', 'Governo'], correct: 0 },
        { q: 'O que é B3?', a: ['Bolsa brasileira', 'Banco', 'Empresa', 'Índice'], correct: 0 },
        { q: 'O que é Ibovespa?', a: ['Índice da bolsa brasileira', 'Ação', 'Empresa', 'Banco'], correct: 0 },
        { q: 'O que é dividendo?', a: ['Parte do lucro distribuída', 'Preço da ação', 'Taxa', 'Imposto'], correct: 0 },
        { q: 'O que é day trade?', a: ['Comprar e vender no mesmo dia', 'Investir longo prazo', 'Poupar', 'Não operar'], correct: 0 },
        { q: 'O que é swing trade?', a: ['Operações de dias/semanas', 'Day trade', 'Longo prazo', 'Não operar'], correct: 0 },
        { q: 'O que é análise fundamentalista?', a: ['Avaliar fundamentos da empresa', 'Gráficos', 'Sorte', 'Intuição'], correct: 0 },
        { q: 'O que é análise técnica?', a: ['Análise de gráficos', 'Fundamentos', 'Sorte', 'Intuição'], correct: 0 },
        { q: 'O que é IPO?', a: ['Oferta pública inicial', 'Venda de ações', 'Fechamento', 'Falência'], correct: 0 }
    ],
    4: [
        { q: 'O que é renda fixa?', a: ['Rentabilidade previsível', 'Renda variável', 'Sem rentabilidade', 'Ações'], correct: 0 },
        { q: 'O que é Tesouro Direto?', a: ['Títulos do governo', 'Ações', 'Fundos', 'Poupança'], correct: 0 },
        { q: 'O que é CDB?', a: ['Certificado de depósito bancário', 'Ação', 'Fundo', 'Criptomoeda'], correct: 0 },
        { q: 'O que é LCI?', a: ['Letra de crédito imobiliário', 'Ação', 'Fundo', 'Tesouro'], correct: 0 },
        { q: 'O que é LCA?', a: ['Letra de crédito agrícola', 'Ação', 'Fundo', 'Tesouro'], correct: 0 },
        { q: 'O que é Selic?', a: ['Taxa básica de juros', 'Índice de ações', 'Inflação', 'Câmbio'], correct: 0 },
        { q: 'O que é CDI?', a: ['Taxa de referência interbancária', 'Ação', 'Fundo', 'Título'], correct: 0 },
        { q: 'O que é IPCA?', a: ['Índice de inflação', 'Taxa de juros', 'Índice de ações', 'Câmbio'], correct: 0 },
        { q: 'O que é FGC?', a: ['Garantia de até R$250 mil', 'Taxa', 'Índice', 'Imposto'], correct: 0 },
        { q: 'O que é marcação a mercado?', a: ['Atualização do valor', 'Taxa fixa', 'Sem atualização', 'Desconto'], correct: 0 }
    ],
    5: [
        { q: 'O que é fundo de investimento?', a: ['Dinheiro de vários investidores', 'Conta individual', 'Ação única', 'Poupança'], correct: 0 },
        { q: 'O que é gestor de fundo?', a: ['Quem administra o fundo', 'Investidor', 'Banco', 'Corretora'], correct: 0 },
        { q: 'O que é taxa de administração?', a: ['Custo para gerir o fundo', 'Rentabilidade', 'Imposto', 'Saldo'], correct: 0 },
        { q: 'O que é cota?', a: ['Fração do fundo', 'Fundo inteiro', 'Taxa', 'Lucro'], correct: 0 },
        { q: 'O que é fundo multimercado?', a: ['Investe em vários ativos', 'Só ações', 'Só renda fixa', 'Só câmbio'], correct: 0 },
        { q: 'O que é FII?', a: ['Fundo imobiliário', 'Fundo de ações', 'Fundo cambial', 'Fundo de renda fixa'], correct: 0 },
        { q: 'O que é ETF?', a: ['Fundo de índice', 'Ação', 'CDB', 'Tesouro'], correct: 0 },
        { q: 'O que é come-cotas?', a: ['Antecipação de IR em fundos', 'Taxa', 'Cota', 'Lucro'], correct: 0 },
        { q: 'O que é benchmark?', a: ['Referência de desempenho', 'Taxa', 'Cota', 'Fundo'], correct: 0 },
        { q: 'O que é fundo DI?', a: ['Segue CDI/Selic', 'Fundo de ações', 'Fundo cambial', 'Multimercado'], correct: 0 }
    ],
    6: [
        { q: 'O que é Bitcoin?', a: ['Criptomoeda descentralizada', 'Moeda física', 'Banco', 'Ação'], correct: 0 },
        { q: 'O que é blockchain?', a: ['Tecnologia de registro', 'Moeda', 'Banco', 'Empresa'], correct: 0 },
        { q: 'O que é carteira digital?', a: ['Armazena criptomoedas', 'Carteira física', 'Banco', 'Corretora'], correct: 0 },
        { q: 'O que é mineração?', a: ['Processo de validação', 'Escavação', 'Investimento', 'Trading'], correct: 0 },
        { q: 'O que é Ethereum?', a: ['Plataforma de contratos inteligentes', 'Bitcoin', 'Banco', 'Ação'], correct: 0 },
        { q: 'O que é altcoin?', a: ['Criptomoedas alternativas', 'Bitcoin', 'Moeda física', 'Ação'], correct: 0 },
        { q: 'O que é stablecoin?', a: ['Cripto pareada a moeda fiat', 'Bitcoin', 'Altcoin volátil', 'Ação'], correct: 0 },
        { q: 'O que é DeFi?', a: ['Finanças descentralizadas', 'Banco tradicional', 'Ação', 'Fundo'], correct: 0 },
        { q: 'O que é NFT?', a: ['Token não fungível', 'Criptomoeda', 'Bitcoin', 'Ação'], correct: 0 },
        { q: 'O que é volatilidade em cripto?', a: ['Variação intensa de preço', 'Estabilidade', 'Garantia', 'Segurança'], correct: 0 }
    ],
    7: [
        { q: 'O que é PIB?', a: ['Produto Interno Bruto', 'Índice de ações', 'Taxa de juros', 'Inflação'], correct: 0 },
        { q: 'O que é recessão?', a: ['Queda da atividade econômica', 'Crescimento', 'Estabilidade', 'Inflação'], correct: 0 },
        { q: 'O que é política monetária?', a: ['Controle de moeda e juros', 'Impostos', 'Gastos do governo', 'Câmbio'], correct: 0 },
        { q: 'O que é política fiscal?', a: ['Impostos e gastos do governo', 'Juros', 'Moeda', 'Câmbio'], correct: 0 },
        { q: 'O que é taxa de câmbio?', a: ['Valor de uma moeda em relação a outra', 'Juros', 'Inflação', 'PIB'], correct: 0 },
        { q: 'O que é déficit público?', a: ['Governo gasta mais que arrecada', 'Superávit', 'Equilíbrio', 'Lucro'], correct: 0 },
        { q: 'O que é Banco Central?', a: ['Autoridade monetária', 'Banco comercial', 'Corretora', 'Empresa'], correct: 0 },
        { q: 'O que é taxa de desemprego?', a: ['% de pessoas sem trabalho', 'Salário', 'PIB', 'Inflação'], correct: 0 },
        { q: 'O que é balança comercial?', a: ['Exportações menos importações', 'PIB', 'Juros', 'Inflação'], correct: 0 },
        { q: 'O que é ciclo econômico?', a: ['Fases de expansão e contração', 'Crescimento constante', 'Recessão constante', 'Estabilidade'], correct: 0 }
    ],
    8: [
        { q: 'O que é IR?', a: ['Imposto de Renda', 'Índice de rentabilidade', 'Taxa', 'Investimento'], correct: 0 },
        { q: 'O que é IRPF?', a: ['IR Pessoa Física', 'IR Pessoa Jurídica', 'Taxa', 'Índice'], correct: 0 },
        { q: 'O que é dedução?', a: ['Redução na base de cálculo', 'Aumento', 'Imposto', 'Multa'], correct: 0 },
        { q: 'O que é IOF?', a: ['Imposto sobre operações financeiras', 'IR', 'IPTU', 'IPVA'], correct: 0 },
        { q: 'O que é declaração de IR?', a: ['Informar rendimentos à Receita', 'Pagar imposto', 'Receber restituição', 'Multa'], correct: 0 },
        { q: 'O que é restituição?', a: ['Devolução de imposto pago a mais', 'Pagamento', 'Multa', 'Taxa'], correct: 0 },
        { q: 'O que é alíquota?', a: ['Percentual do imposto', 'Valor fixo', 'Base de cálculo', 'Dedução'], correct: 0 },
        { q: 'O que é isenção fiscal?', a: ['Não pagar imposto em certas condições', 'Pagar mais', 'Multa', 'Taxa extra'], correct: 0 },
        { q: 'O que é planejamento tributário?', a: ['Reduzir impostos legalmente', 'Sonegar', 'Pagar mais', 'Não declarar'], correct: 0 },
        { q: 'O que é DARF?', a: ['Documento de arrecadação', 'Declaração', 'Multa', 'Taxa'], correct: 0 }
    ],
    9: [
        { q: 'O que é empreendedor?', a: ['Cria e gerencia negócios', 'Funcionário', 'Investidor apenas', 'Governo'], correct: 0 },
        { q: 'O que é startup?', a: ['Empresa em estágio inicial', 'Empresa grande', 'Governo', 'ONG'], correct: 0 },
        { q: 'O que é plano de negócios?', a: ['Documento que descreve o negócio', 'Contrato', 'Imposto', 'Licença'], correct: 0 },
        { q: 'O que é MVP?', a: ['Produto mínimo viável', 'Produto final', 'Marketing', 'Vendas'], correct: 0 },
        { q: 'O que é capital de giro?', a: ['Recursos para operação diária', 'Lucro', 'Investimento fixo', 'Patrimônio'], correct: 0 },
        { q: 'O que é ponto de equilíbrio?', a: ['Receita igual às despesas', 'Lucro máximo', 'Prejuízo', 'Falência'], correct: 0 },
        { q: 'O que é margem de lucro?', a: ['% do lucro sobre vendas', 'Prejuízo', 'Despesa', 'Imposto'], correct: 0 },
        { q: 'O que é pitch?', a: ['Apresentação rápida do negócio', 'Contrato', 'Plano longo', 'Relatório'], correct: 0 },
        { q: 'O que é investidor-anjo?', a: ['Investe em startups iniciais', 'Banco', 'Governo', 'ONG'], correct: 0 },
        { q: 'O que é MEI?', a: ['Microempreendedor Individual', 'Empresa grande', 'Banco', 'Investidor'], correct: 0 }
    ]
};

const SHOP_ITEMS = [
    { id: 'portfolio_boost', name: 'Boost de Portfólio', price: 100, currency: 'coins', description: '+500 portfólio' },
    { id: 'investment_pack', name: 'Pacote de Investimentos', price: 150, currency: 'coins', description: '+5 investimentos' },
    { id: 'networth_boost', name: 'Boost Patrimônio', price: 200, currency: 'coins', description: '+1000 patrimônio' },
    { id: 'topic_unlock', name: 'Desbloquear Tópico', price: 5, currency: 'gems', description: 'Próximo tópico' },
    { id: 'double_xp', name: 'XP Dobrado', price: 3, currency: 'gems', description: '2x XP' },
    { id: 'vip_badge', name: 'Distintivo VIP', price: 10, currency: 'gems', description: 'Status especial' }
];

function initFloatingCoins() {
    floatingCoins = [];
    for (let i = 0; i < 15; i++) {
        floatingCoins.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 15 + 10,
            speedY: Math.random() * 0.5 + 0.2,
            rotation: Math.random() * Math.PI * 2
        });
    }
}

function loadGame() {
    const saved = localStorage.getItem('financeMaster');
    if (saved) {
        const data = JSON.parse(saved);
        coins = data.coins || 100;
        gems = data.gems || 5;
        xp = data.xp || 0;
        level = data.level || 1;
        playerData = data.playerData || playerData;
    }
    initFloatingCoins();
}

function saveGame() {
    localStorage.setItem('financeMaster', JSON.stringify({ coins, gems, xp, level, playerData }));
}

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

function updateFloatingCoins() {
    floatingCoins.forEach(c => {
        c.y -= c.speedY;
        c.rotation += 0.02;
        if (c.y < -30) {
            c.y = canvas.height + 30;
            c.x = Math.random() * canvas.width;
        }
    });
}

function drawFinanceBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(39, 174, 96, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Floating coins
    ctx.globalAlpha = 0.3;
    floatingCoins.forEach(c => {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawHUD() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${coins}`, 20, 38);
    ctx.fillStyle = '#00CED1';
    ctx.fillText(`💎 ${gems}`, 120, 38);
    ctx.fillStyle = '#27AE60';
    ctx.fillText(`⭐ XP: ${xp}`, 220, 38);
    ctx.fillText(`💰 Nível ${level}`, 350, 38);
    ctx.textAlign = 'right';
    ctx.fillText(`📈 R$ ${playerData.netWorth}`, canvas.width - 20, 38);
}

function drawMenu() {
    drawFinanceBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#27AE60';
    ctx.lineWidth = 4;
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('💰 FINANCE MASTER 📈', canvas.width/2, 140);
    ctx.fillText('💰 FINANCE MASTER 📈', canvas.width/2, 140);

    ctx.font = '22px Arial';
    ctx.fillStyle = '#27AE60';
    ctx.fillText('Mestre das Finanças', canvas.width/2, 180);

    const buttons = [
        { text: '📚 TÓPICOS FINANCEIROS', y: 260, color: '#27AE60' },
        { text: '🏪 LOJA DE ATIVOS', y: 340, color: '#3498DB' },
        { text: '📊 MEU PORTFÓLIO', y: 420, color: '#9B59B6' },
        { text: '🏆 CONQUISTAS', y: 500, color: '#F39C12' }
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
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(btn.text, canvas.width/2, btn.y + 40);
    });

    ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
    ctx.fillRect(canvas.width/2 - 150, 580, 300, 80);
    ctx.fillStyle = '#27AE60';
    ctx.font = '16px Arial';
    ctx.fillText(`📈 Portfólio: R$ ${playerData.portfolio}`, canvas.width/2, 610);
    ctx.fillText(`💎 Investimentos: ${playerData.investments.length}`, canvas.width/2, 640);
}

function drawTopicSelect() {
    drawFinanceBackground();
    drawHUD();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📚 TÓPICOS FINANCEIROS', canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const startY = 140 - scrollOffset;
    const cardHeight = 90;

    TOPICS.forEach((topic, index) => {
        const y = startY + index * (cardHeight + 15);
        if (y + cardHeight < 130 || y > canvas.height - 20) return;

        const unlocked = level >= topic.unlockLevel || playerData.unlockedTopics.includes(topic.id);
        const progress = playerData.topicProgress[topic.id] || 0;

        ctx.fillStyle = unlocked ? topic.color : '#333';
        ctx.fillRect(canvas.width/2 - 200, y, 400, cardHeight);

        if (unlocked) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width/2 - 200, y, 400, cardHeight);
        }

        ctx.font = '36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(topic.icon, canvas.width/2 - 180, y + 50);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(topic.name, canvas.width/2 - 120, y + 35);

        if (unlocked) {
            ctx.font = '16px Arial';
            ctx.fillText(`Progresso: ${progress}/${topic.lessons}`, canvas.width/2 - 120, y + 58);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(canvas.width/2 - 120, y + 66, 200, 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(canvas.width/2 - 120, y + 66, (progress/topic.lessons) * 200, 10);
        } else {
            ctx.fillStyle = '#888';
            ctx.font = '16px Arial';
            ctx.fillText(`🔒 Nível ${topic.unlockLevel}`, canvas.width/2 - 120, y + 58);
        }
    });

    maxScroll = Math.max(0, TOPICS.length * (cardHeight + 15) - (canvas.height - 180));
}

function drawLessonSelect() {
    const topic = TOPICS[selectedTopic];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, topic.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawHUD();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${topic.icon} ${topic.name}`, canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const progress = playerData.topicProgress[selectedTopic] || 0;
    const cols = 5, size = 70, spacing = 15;
    const startX = (canvas.width - (cols * (size + spacing))) / 2;
    const startY = 150 - scrollOffset;

    for (let i = 0; i < topic.lessons; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (size + spacing);
        const y = startY + row * (size + spacing);
        if (y + size < 130 || y > canvas.height - 20) continue;

        const unlocked = i <= progress;
        const completed = i < progress;

        ctx.fillStyle = completed ? '#FFD700' : (unlocked ? topic.color : '#333');
        ctx.fillRect(x, y, size, size);

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

    maxScroll = Math.max(0, Math.ceil(topic.lessons / cols) * (size + spacing) - (canvas.height - 200));
}

function drawQuestion() {
    const topic = TOPICS[selectedTopic];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, topic.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawHUD();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${topic.icon} ${topic.name} - Lição ${selectedLesson + 1}`, canvas.width/2, 100);

    if (!currentQuestion) {
        const questions = QUESTIONS[selectedTopic];
        currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        selectedAnswer = null;
        showingResult = false;
    }

    ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
    ctx.fillRect(canvas.width/2 - 300, 130, 600, 120);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 300, 130, 600, 120);

    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    wrapText(currentQuestion.q, canvas.width/2, 180, 550, 28);

    const shuffledAnswers = currentQuestion.shuffled || shuffleAnswers(currentQuestion);

    shuffledAnswers.forEach((answer, index) => {
        const y = 280 + index * 80;
        let bgColor = topic.color;

        if (showingResult) {
            bgColor = answer.originalIndex === currentQuestion.correct ? '#27AE60' : (index === selectedAnswer ? '#E74C3C' : topic.color);
        } else if (index === selectedAnswer) {
            bgColor = '#FFD700';
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(canvas.width/2 - 280, y, 560, 60);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 280, y, 560, 60);

        ctx.fillStyle = '#FFF';
        ctx.font = '18px Arial';
        ctx.fillText(answer.text, canvas.width/2, y + 38);
    });

    if (selectedAnswer !== null && !showingResult) {
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('INVESTIR 💰', canvas.width/2, 643);
    }

    if (showingResult) {
        ctx.fillStyle = resultCorrect ? '#27AE60' : '#E74C3C';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(resultCorrect ? '✅ LUCRO!' : '❌ PREJUÍZO', canvas.width/2, 643);
    }

    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function shuffleAnswers(question) {
    const answers = question.a.map((text, index) => ({ text, originalIndex: index }));
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    question.shuffled = answers;
    return answers;
}

function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testY = y;
    for (let word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line !== '') {
            ctx.fillText(line, x, testY);
            line = word + ' ';
            testY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, testY);
}

function drawShop() {
    drawFinanceBackground();
    drawHUD();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏪 LOJA DE ATIVOS', canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    SHOP_ITEMS.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = col === 0 ? canvas.width/2 - 290 : canvas.width/2 + 10;
        const cardY = 140 + row * 100;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, cardY, 280, 85);
        ctx.strokeStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, cardY, 280, 85);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, x + 15, cardY + 28);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#27AE60';
        ctx.fillText(item.description, x + 15, cardY + 50);
        ctx.fillStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.fillText(`${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`, x + 15, cardY + 72);

        ctx.fillStyle = '#27AE60';
        ctx.fillRect(x + 200, cardY + 50, 65, 28);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Comprar', x + 232, cardY + 69);
    });
}

function drawPortfolio() {
    drawFinanceBackground();
    drawHUD();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📊 MEU PORTFÓLIO', canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(canvas.width/2 - 200, 150, 400, 200);
    ctx.strokeStyle = '#27AE60';
    ctx.strokeRect(canvas.width/2 - 200, 150, 400, 200);

    ctx.fillStyle = '#27AE60';
    ctx.font = '18px Arial';
    const stats = [
        `📈 Portfólio: R$ ${playerData.portfolio}`,
        `💎 Investimentos: ${playerData.investments.length}`,
        `💰 Patrimônio: R$ ${playerData.netWorth}`,
        `📚 Tópicos: ${playerData.unlockedTopics.length}`,
        `🎓 Nível: ${level}`
    ];
    stats.forEach((stat, i) => ctx.fillText(stat, canvas.width/2, 195 + i * 35));
}

function drawAchievements() {
    drawFinanceBackground();
    drawHUD();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CONQUISTAS', canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const achievements = [
        { name: 'Primeiro Investimento', desc: 'Complete sua primeira lição', icon: '💰', unlocked: true },
        { name: 'Diversificado', desc: 'Desbloqueie 3 tópicos', icon: '📊', unlocked: playerData.unlockedTopics.length >= 3 },
        { name: 'Investidor', desc: 'Alcance nível 10', icon: '📈', unlocked: level >= 10 },
        { name: 'Milionário', desc: 'R$ 10.000 de patrimônio', icon: '🤑', unlocked: playerData.netWorth >= 10000 },
        { name: 'Mestre Financeiro', desc: 'Complete todos os tópicos', icon: '👑', unlocked: false }
    ];

    achievements.forEach((ach, i) => {
        const y = 140 + i * 75;
        ctx.fillStyle = ach.unlocked ? '#27AE60' : '#333';
        ctx.fillRect(canvas.width/2 - 200, y, 400, 65);
        if (ach.unlocked) {
            ctx.strokeStyle = '#FFD700';
            ctx.strokeRect(canvas.width/2 - 200, y, 400, 65);
        }
        ctx.font = '30px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(ach.icon, canvas.width/2 - 180, y + 42);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(ach.name, canvas.width/2 - 130, y + 28);
        ctx.font = '14px Arial';
        ctx.fillStyle = ach.unlocked ? '#FFD700' : '#666';
        ctx.fillText(ach.desc, canvas.width/2 - 130, y + 50);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch(currentScreen) {
        case 'menu': drawMenu(); break;
        case 'topics': drawTopicSelect(); break;
        case 'lessons': drawLessonSelect(); break;
        case 'question': drawQuestion(); break;
        case 'shop': drawShop(); break;
        case 'portfolio': drawPortfolio(); break;
        case 'achievements': drawAchievements(); break;
    }
}

function gameLoop() {
    updateParticles();
    updateFloatingCoins();
    draw();
    requestAnimationFrame(gameLoop);
}

function processAnswer() {
    const shuffledAnswers = currentQuestion.shuffled;
    resultCorrect = shuffledAnswers[selectedAnswer].originalIndex === currentQuestion.correct;
    showingResult = true;

    if (resultCorrect) {
        coins += 15;
        xp += 25;
        playerData.portfolio += 100;
        playerData.netWorth += 50;
        createParticles(canvas.width/2, 400, '#FFD700', 30);

        const progress = playerData.topicProgress[selectedTopic] || 0;
        if (selectedLesson === progress) {
            playerData.topicProgress[selectedTopic] = progress + 1;
            playerData.investments.push(`Investment_${Date.now()}`);
        }

        if (xp >= level * 100) {
            level++;
            xp -= (level - 1) * 100;
            gems += 2;
            createParticles(canvas.width/2, 300, '#27AE60', 40);
            TOPICS.forEach(topic => {
                if (level >= topic.unlockLevel && !playerData.unlockedTopics.includes(topic.id)) {
                    playerData.unlockedTopics.push(topic.id);
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
            currentScreen = 'lessons';
            scrollOffset = 0;
        }
    }, 1500);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentScreen === 'menu') {
        if (y >= 260 && y <= 320) currentScreen = 'topics';
        else if (y >= 340 && y <= 400) currentScreen = 'shop';
        else if (y >= 420 && y <= 480) currentScreen = 'portfolio';
        else if (y >= 500 && y <= 560) currentScreen = 'achievements';
        scrollOffset = 0;
    }
    else if (currentScreen === 'topics') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) { currentScreen = 'menu'; return; }
        const startY = 140 - scrollOffset;
        TOPICS.forEach((topic, index) => {
            const cardY = startY + index * 105;
            if (y >= cardY && y <= cardY + 90 && x >= canvas.width/2 - 200 && x <= canvas.width/2 + 200) {
                if (level >= topic.unlockLevel || playerData.unlockedTopics.includes(topic.id)) {
                    selectedTopic = index;
                    currentScreen = 'lessons';
                    scrollOffset = 0;
                }
            }
        });
    }
    else if (currentScreen === 'lessons') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) { currentScreen = 'topics'; scrollOffset = 0; return; }
        const topic = TOPICS[selectedTopic];
        const progress = playerData.topicProgress[selectedTopic] || 0;
        const cols = 5, size = 70, spacing = 15;
        const startX = (canvas.width - (cols * (size + spacing))) / 2;
        const startY = 150 - scrollOffset;
        for (let i = 0; i < topic.lessons; i++) {
            const lessonX = startX + (i % cols) * (size + spacing);
            const lessonY = startY + Math.floor(i / cols) * (size + spacing);
            if (x >= lessonX && x <= lessonX + size && y >= lessonY && y <= lessonY + size && i <= progress) {
                selectedLesson = i;
                currentScreen = 'question';
                currentQuestion = null;
                break;
            }
        }
    }
    else if (currentScreen === 'question') {
        if (showingResult) return;
        for (let i = 0; i < 4; i++) {
            if (y >= 280 + i * 80 && y <= 340 + i * 80 && x >= canvas.width/2 - 280 && x <= canvas.width/2 + 280) {
                selectedAnswer = i;
            }
        }
        if (selectedAnswer !== null && y >= 610 && y <= 660 && x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100) {
            processAnswer();
        }
    }
    else if (currentScreen === 'shop') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) { currentScreen = 'menu'; return; }
        SHOP_ITEMS.forEach((item, index) => {
            const col = index % 2, row = Math.floor(index / 2);
            const itemX = col === 0 ? canvas.width/2 - 290 : canvas.width/2 + 10;
            const itemY = 140 + row * 100;
            if (x >= itemX + 200 && x <= itemX + 265 && y >= itemY + 50 && y <= itemY + 78) {
                const canAfford = item.currency === 'gems' ? gems >= item.price : coins >= item.price;
                if (canAfford) {
                    if (item.currency === 'gems') gems -= item.price; else coins -= item.price;
                    if (item.id === 'portfolio_boost') playerData.portfolio += 500;
                    else if (item.id === 'investment_pack') for(let i=0;i<5;i++) playerData.investments.push(`Inv_${Date.now()}_${i}`);
                    else if (item.id === 'networth_boost') playerData.netWorth += 1000;
                    createParticles(itemX + 140, itemY + 40, '#FFD700', 20);
                    saveGame();
                }
            }
        });
    }
    else if (['portfolio', 'achievements'].includes(currentScreen)) {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) currentScreen = 'menu';
    }
});

canvas.addEventListener('wheel', (e) => {
    if (['topics', 'lessons'].includes(currentScreen)) {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + e.deltaY * 0.5));
        e.preventDefault();
    }
}, { passive: false });

let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; });
canvas.addEventListener('touchmove', (e) => {
    if (['topics', 'lessons'].includes(currentScreen)) {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + (touchStartY - e.touches[0].clientY) * 0.5));
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
}, { passive: false });

loadGame();
gameLoop();
