// Statistics Detective - Detetive de Estatística
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
let selectedTopic = null;
let selectedCase = null;
let currentQuestion = null;
let selectedAnswer = null;
let showingResult = false;
let resultCorrect = false;
let scrollOffset = 0;
let maxScroll = 0;

// Animações
let particles = [];
let dataPoints = [];
let chartBars = [];

// Dados do jogador
let playerData = {
    unlockedTopics: [0],
    topicProgress: {},
    casesSolved: 0,
    accuracy: 100,
    evidence: []
};

// Tópicos de Estatística (10 mundos)
const TOPICS = [
    { id: 0, name: 'Estatística Básica', color: '#3498DB', icon: '📊', unlockLevel: 1, cases: 50 },
    { id: 1, name: 'Probabilidade', color: '#E74C3C', icon: '🎲', unlockLevel: 5, cases: 50 },
    { id: 2, name: 'Distribuições', color: '#9B59B6', icon: '📈', unlockLevel: 10, cases: 50 },
    { id: 3, name: 'Amostragem', color: '#1ABC9C', icon: '🔍', unlockLevel: 15, cases: 50 },
    { id: 4, name: 'Inferência', color: '#F39C12', icon: '🎯', unlockLevel: 20, cases: 50 },
    { id: 5, name: 'Regressão', color: '#2ECC71', icon: '📉', unlockLevel: 25, cases: 50 },
    { id: 6, name: 'Testes de Hipóteses', color: '#E91E63', icon: '⚖️', unlockLevel: 30, cases: 50 },
    { id: 7, name: 'ANOVA', color: '#00BCD4', icon: '🔬', unlockLevel: 35, cases: 50 },
    { id: 8, name: 'Correlação', color: '#FF5722', icon: '🔗', unlockLevel: 40, cases: 50 },
    { id: 9, name: 'Big Data Analytics', color: '#673AB7', icon: '💻', unlockLevel: 45, cases: 50 }
];

// Banco de questões por tópico
const QUESTIONS = {
    0: [ // Estatística Básica
        { q: 'O que é a média aritmética?', a: ['Soma dividida pela quantidade', 'Valor mais frequente', 'Valor central', 'Maior menos menor'], correct: 0 },
        { q: 'O que é a mediana?', a: ['Valor central ordenado', 'Soma dos valores', 'Valor mais comum', 'Diferença entre extremos'], correct: 0 },
        { q: 'O que é a moda?', a: ['Valor mais frequente', 'Valor do meio', 'Média dos valores', 'Menor valor'], correct: 0 },
        { q: 'O que mede o desvio padrão?', a: ['Dispersão dos dados', 'Valor central', 'Valor máximo', 'Soma total'], correct: 0 },
        { q: 'O que é variância?', a: ['Quadrado do desvio padrão', 'Média', 'Mediana', 'Moda'], correct: 0 },
        { q: 'O que é amplitude?', a: ['Máximo menos mínimo', 'Média', 'Mediana', 'Desvio padrão'], correct: 0 },
        { q: 'Para dados {2,4,4,6}, qual é a moda?', a: ['4', '2', '6', '4,5'], correct: 0 },
        { q: 'O que são quartis?', a: ['Divisões em 4 partes', 'Divisões em 2 partes', 'Média', 'Moda'], correct: 0 },
        { q: 'O que é um outlier?', a: ['Valor muito diferente', 'Valor normal', 'Média', 'Mediana'], correct: 0 },
        { q: 'O que é frequência relativa?', a: ['Frequência dividida pelo total', 'Frequência absoluta', 'Soma', 'Média'], correct: 0 }
    ],
    1: [ // Probabilidade
        { q: 'Qual é a probabilidade de sair cara em uma moeda?', a: ['50% ou 0,5', '25%', '75%', '100%'], correct: 0 },
        { q: 'O que é um evento certo?', a: ['Probabilidade = 1', 'Probabilidade = 0', 'Probabilidade = 0,5', 'Nunca acontece'], correct: 0 },
        { q: 'O que é espaço amostral?', a: ['Todos resultados possíveis', 'Apenas favoráveis', 'Apenas um resultado', 'Nenhum resultado'], correct: 0 },
        { q: 'O que são eventos mutuamente exclusivos?', a: ['Não podem ocorrer juntos', 'Ocorrem sempre juntos', 'São independentes', 'São dependentes'], correct: 0 },
        { q: 'P(A ou B) para exclusivos é?', a: ['P(A) + P(B)', 'P(A) × P(B)', 'P(A) - P(B)', 'P(A) / P(B)'], correct: 0 },
        { q: 'O que é probabilidade condicional?', a: ['P(A|B) dado que B ocorreu', 'P(A) + P(B)', 'P(A) × P(B)', 'P(A ou B)'], correct: 0 },
        { q: 'O que afirma o Teorema de Bayes?', a: ['Atualiza probabilidades', 'Soma probabilidades', 'Multiplica sempre', 'Divide sempre'], correct: 0 },
        { q: 'Em um dado, P(número par)?', a: ['1/2 ou 50%', '1/6', '1/3', '2/3'], correct: 0 },
        { q: 'O que são eventos independentes?', a: ['Um não afeta o outro', 'Um afeta o outro', 'São iguais', 'São opostos'], correct: 0 },
        { q: 'Qual é a soma de todas probabilidades?', a: ['1 ou 100%', '0', '0,5', 'Infinito'], correct: 0 }
    ],
    2: [ // Distribuições
        { q: 'O que é distribuição normal?', a: ['Curva em sino simétrica', 'Linha reta', 'Exponencial', 'Uniforme'], correct: 0 },
        { q: 'Na normal, qual % está em 1 desvio?', a: ['Cerca de 68%', '50%', '95%', '99%'], correct: 0 },
        { q: 'Na normal, qual % está em 2 desvios?', a: ['Cerca de 95%', '68%', '50%', '99%'], correct: 0 },
        { q: 'O que é distribuição binomial?', a: ['Sucesso/fracasso em n tentativas', 'Sempre normal', 'Sempre uniforme', 'Contínua'], correct: 0 },
        { q: 'O que caracteriza Poisson?', a: ['Eventos raros em intervalo', 'Eventos comuns', 'Sempre normal', 'Sempre uniforme'], correct: 0 },
        { q: 'O que é distribuição uniforme?', a: ['Mesma probabilidade para todos', 'Curva em sino', 'Exponencial', 'Assimétrica'], correct: 0 },
        { q: 'O que é assimetria?', a: ['Desvio da simetria', 'Perfeita simetria', 'Média = Mediana', 'Normal'], correct: 0 },
        { q: 'O que é curtose?', a: ['Grau de achatamento', 'Assimetria', 'Média', 'Variância'], correct: 0 },
        { q: 'Z-score mede o quê?', a: ['Desvios da média', 'Média', 'Moda', 'Variância'], correct: 0 },
        { q: 'Distribuição t é usada quando?', a: ['Amostras pequenas', 'Amostras grandes', 'Sempre', 'Nunca'], correct: 0 }
    ],
    3: [ // Amostragem
        { q: 'O que é população?', a: ['Conjunto total de interesse', 'Parte do conjunto', 'Média', 'Amostra'], correct: 0 },
        { q: 'O que é amostra?', a: ['Subconjunto da população', 'População inteira', 'Média', 'Variância'], correct: 0 },
        { q: 'O que é amostragem aleatória simples?', a: ['Todos têm mesma chance', 'Seleção conveniente', 'Primeiro encontrado', 'Maior valor'], correct: 0 },
        { q: 'O que é amostragem estratificada?', a: ['Divide em grupos e amostra', 'Totalmente aleatória', 'Por conveniência', 'Sistemática'], correct: 0 },
        { q: 'O que é erro amostral?', a: ['Diferença amostra-população', 'Zero erro', 'Erro de digitação', 'Erro de cálculo'], correct: 0 },
        { q: 'O que é viés de seleção?', a: ['Amostra não representativa', 'Amostra perfeita', 'Erro aleatório', 'Erro de cálculo'], correct: 0 },
        { q: 'Aumentar n faz o quê com o erro?', a: ['Diminui o erro', 'Aumenta o erro', 'Não muda', 'Elimina totalmente'], correct: 0 },
        { q: 'O que é amostragem por conglomerados?', a: ['Seleciona grupos inteiros', 'Individual', 'Estratificada', 'Sistemática'], correct: 0 },
        { q: 'O que é censo?', a: ['Pesquisa toda população', 'Apenas amostra', 'Estimativa', 'Previsão'], correct: 0 },
        { q: 'O que é parâmetro?', a: ['Característica da população', 'Característica da amostra', 'Estimativa', 'Erro'], correct: 0 }
    ],
    4: [ // Inferência
        { q: 'O que é inferência estatística?', a: ['Conclusões sobre população via amostra', 'Descrição de dados', 'Gráficos', 'Tabelas'], correct: 0 },
        { q: 'O que é estimador?', a: ['Estatística que estima parâmetro', 'Parâmetro exato', 'Erro', 'Viés'], correct: 0 },
        { q: 'O que é intervalo de confiança?', a: ['Faixa provável do parâmetro', 'Valor exato', 'Erro zero', 'Certeza absoluta'], correct: 0 },
        { q: 'IC 95% significa?', a: ['95% das vezes contém o parâmetro', '95% de certeza', '5% de erro', 'Exatamente 95%'], correct: 0 },
        { q: 'O que é nível de confiança?', a: ['Probabilidade do IC conter parâmetro', 'Erro', 'Variância', 'Média'], correct: 0 },
        { q: 'Aumentar confiança faz IC?', a: ['Ficar mais largo', 'Ficar mais estreito', 'Não mudar', 'Desaparecer'], correct: 0 },
        { q: 'O que é margem de erro?', a: ['Metade da largura do IC', 'IC inteiro', 'Média', 'Variância'], correct: 0 },
        { q: 'O que é estimador não-viesado?', a: ['Esperança igual ao parâmetro', 'Sempre errado', 'Viesado', 'Inconsistente'], correct: 0 },
        { q: 'O que Teorema Central do Limite diz?', a: ['Médias tendem à normal', 'Dados são normais', 'Variância é zero', 'Erro é infinito'], correct: 0 },
        { q: 'O que é grau de liberdade?', a: ['Valores livres para variar', 'Erro', 'Viés', 'Parâmetro'], correct: 0 }
    ],
    5: [ // Regressão
        { q: 'O que é regressão linear?', a: ['Relação linear entre variáveis', 'Sem relação', 'Curva', 'Dispersão total'], correct: 0 },
        { q: 'O que é variável dependente?', a: ['Y, que é explicada', 'X, que explica', 'Constante', 'Erro'], correct: 0 },
        { q: 'O que é variável independente?', a: ['X, que explica', 'Y, que é explicada', 'Constante', 'Erro'], correct: 0 },
        { q: 'O que R² mede?', a: ['Variação explicada pelo modelo', 'Média', 'Variância', 'Erro'], correct: 0 },
        { q: 'R² = 1 significa?', a: ['Ajuste perfeito', 'Nenhum ajuste', 'Metade explicada', 'Erro máximo'], correct: 0 },
        { q: 'O que é resíduo?', a: ['Diferença real-predito', 'Valor predito', 'Valor real', 'Média'], correct: 0 },
        { q: 'O que são mínimos quadrados?', a: ['Minimiza soma dos quadrados dos resíduos', 'Maximiza erros', 'Ignora erros', 'Soma resíduos'], correct: 0 },
        { q: 'O que é intercepto?', a: ['Valor de Y quando X=0', 'Inclinação', 'X quando Y=0', 'Erro'], correct: 0 },
        { q: 'O que é coeficiente angular?', a: ['Inclinação da reta', 'Intercepto', 'Erro', 'R²'], correct: 0 },
        { q: 'Regressão múltipla tem?', a: ['Várias variáveis independentes', 'Uma variável', 'Nenhuma variável', 'Só constante'], correct: 0 }
    ],
    6: [ // Testes de Hipóteses
        { q: 'O que é hipótese nula (H0)?', a: ['Afirmação a ser testada', 'Sempre verdadeira', 'Sempre falsa', 'Alternativa'], correct: 0 },
        { q: 'O que é hipótese alternativa (H1)?', a: ['Contradiz H0', 'Igual a H0', 'Sempre falsa', 'Não existe'], correct: 0 },
        { q: 'O que é p-valor?', a: ['Probabilidade de obter resultado sob H0', 'Probabilidade de H0', 'Sempre 0,05', 'Erro'], correct: 0 },
        { q: 'P-valor < α significa?', a: ['Rejeitar H0', 'Aceitar H0', 'Nada muda', 'Erro tipo II'], correct: 0 },
        { q: 'O que é erro tipo I?', a: ['Rejeitar H0 verdadeira', 'Aceitar H0 falsa', 'Nenhum erro', 'Erro de cálculo'], correct: 0 },
        { q: 'O que é erro tipo II?', a: ['Não rejeitar H0 falsa', 'Rejeitar H0 verdadeira', 'Nenhum erro', 'Erro de cálculo'], correct: 0 },
        { q: 'O que é nível de significância α?', a: ['Probabilidade máxima de erro tipo I', 'Erro tipo II', 'P-valor', 'Confiança'], correct: 0 },
        { q: 'Teste t é usado para?', a: ['Comparar médias', 'Comparar variâncias', 'Comparar proporções', 'Comparar modas'], correct: 0 },
        { q: 'Teste qui-quadrado é para?', a: ['Variáveis categóricas', 'Médias', 'Variâncias', 'Regressão'], correct: 0 },
        { q: 'O que é poder do teste?', a: ['1 - P(erro tipo II)', 'P(erro tipo I)', 'P-valor', 'α'], correct: 0 }
    ],
    7: [ // ANOVA
        { q: 'O que ANOVA significa?', a: ['Análise de Variância', 'Análise de Média', 'Análise de Moda', 'Análise de Desvio'], correct: 0 },
        { q: 'ANOVA compara?', a: ['Médias de 3+ grupos', 'Apenas 2 grupos', 'Variâncias', 'Proporções'], correct: 0 },
        { q: 'O que é variação entre grupos?', a: ['Diferença entre médias dos grupos', 'Dentro do grupo', 'Erro', 'Total'], correct: 0 },
        { q: 'O que é variação dentro dos grupos?', a: ['Variação dentro de cada grupo', 'Entre grupos', 'Total', 'Nenhuma'], correct: 0 },
        { q: 'O que é estatística F?', a: ['Razão de variâncias', 'Média', 'Desvio padrão', 'T-score'], correct: 0 },
        { q: 'ANOVA assume?', a: ['Normalidade e variâncias iguais', 'Nada', 'Assimetria', 'Variâncias diferentes'], correct: 0 },
        { q: 'O que é ANOVA de um fator?', a: ['Um fator independente', 'Dois fatores', 'Três fatores', 'Nenhum fator'], correct: 0 },
        { q: 'O que é ANOVA fatorial?', a: ['Dois ou mais fatores', 'Um fator', 'Nenhum fator', 'Regressão'], correct: 0 },
        { q: 'Após ANOVA significativa, fazer?', a: ['Testes post-hoc', 'Nada', 'Nova ANOVA', 'Ignorar'], correct: 0 },
        { q: 'O que é teste de Tukey?', a: ['Teste post-hoc', 'Teste inicial', 'ANOVA', 'Regressão'], correct: 0 }
    ],
    8: [ // Correlação
        { q: 'Correlação mede?', a: ['Força e direção da relação', 'Causalidade', 'Média', 'Variância'], correct: 0 },
        { q: 'Correlação de Pearson varia de?', a: ['-1 a +1', '0 a 1', '-∞ a +∞', '0 a 100'], correct: 0 },
        { q: 'r = +1 significa?', a: ['Correlação positiva perfeita', 'Correlação negativa', 'Sem correlação', 'Correlação média'], correct: 0 },
        { q: 'r = 0 significa?', a: ['Sem correlação linear', 'Correlação perfeita', 'Correlação negativa', 'Correlação positiva'], correct: 0 },
        { q: 'r = -1 significa?', a: ['Correlação negativa perfeita', 'Correlação positiva', 'Sem correlação', 'Erro'], correct: 0 },
        { q: 'Correlação implica causalidade?', a: ['Não necessariamente', 'Sempre', 'Nunca', 'Às vezes sim'], correct: 0 },
        { q: 'O que é correlação espúria?', a: ['Aparente mas sem sentido', 'Correlação real', 'Correlação perfeita', 'Sem correlação'], correct: 0 },
        { q: 'Correlação de Spearman é para?', a: ['Dados ordinais ou não-lineares', 'Apenas normais', 'Apenas contínuos', 'Apenas categóricos'], correct: 0 },
        { q: 'r² na correlação é?', a: ['Coeficiente de determinação', 'Correlação negativa', 'Erro', 'Variância'], correct: 0 },
        { q: 'O que é multicolinearidade?', a: ['Alta correlação entre preditores', 'Sem correlação', 'Correlação perfeita', 'Erro de medida'], correct: 0 }
    ],
    9: [ // Big Data Analytics
        { q: 'O que caracteriza Big Data?', a: ['Volume, Velocidade, Variedade', 'Apenas volume', 'Apenas velocidade', 'Apenas variedade'], correct: 0 },
        { q: 'O que é machine learning?', a: ['Aprendizado por máquinas', 'Programação manual', 'Estatística básica', 'Gráficos'], correct: 0 },
        { q: 'O que é overfitting?', a: ['Modelo decorou os dados', 'Modelo generaliza bem', 'Sem erro', 'Erro mínimo'], correct: 0 },
        { q: 'O que é data mining?', a: ['Descoberta de padrões em dados', 'Armazenamento', 'Backup', 'Limpeza'], correct: 0 },
        { q: 'O que é validação cruzada?', a: ['Avaliar modelo em diferentes partes', 'Treinar uma vez', 'Ignorar teste', 'Usar todos dados'], correct: 0 },
        { q: 'O que é clustering?', a: ['Agrupar dados similares', 'Classificar com rótulos', 'Prever valores', 'Ordenar dados'], correct: 0 },
        { q: 'O que é classificação?', a: ['Prever categorias', 'Agrupar sem rótulos', 'Prever valores contínuos', 'Ordenar'], correct: 0 },
        { q: 'O que é regressão em ML?', a: ['Prever valores contínuos', 'Classificar', 'Agrupar', 'Ordenar'], correct: 0 },
        { q: 'O que são redes neurais?', a: ['Modelos inspirados no cérebro', 'Redes de computadores', 'Internet', 'Banco de dados'], correct: 0 },
        { q: 'O que é deep learning?', a: ['Redes neurais profundas', 'Aprendizado superficial', 'Estatística básica', 'Gráficos'], correct: 0 }
    ]
};

// Loja
const SHOP_ITEMS = [
    { id: 'evidence_pack', name: 'Pacote de Evidências', price: 100, currency: 'coins', description: '+50 evidências' },
    { id: 'accuracy_boost', name: 'Boost de Precisão', price: 150, currency: 'coins', description: '+10% precisão' },
    { id: 'case_files', name: 'Arquivos de Casos', price: 200, currency: 'coins', description: '+5 casos' },
    { id: 'topic_unlock', name: 'Desbloquear Tópico', price: 5, currency: 'gems', description: 'Próximo tópico' },
    { id: 'double_xp', name: 'XP Dobrado', price: 3, currency: 'gems', description: '2x XP por 10 casos' },
    { id: 'detective_badge', name: 'Distintivo Especial', price: 10, currency: 'gems', description: 'Visual detetive' }
];

// Inicializar pontos de dados animados
function initDataPoints() {
    dataPoints = [];
    for (let i = 0; i < 30; i++) {
        dataPoints.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
        });
    }
}

// Inicializar barras de gráfico
function initChartBars() {
    chartBars = [];
    for (let i = 0; i < 8; i++) {
        chartBars.push({
            x: 50 + i * 40,
            targetHeight: Math.random() * 100 + 30,
            currentHeight: 0,
            color: `hsl(${i * 40 + 200}, 70%, 50%)`
        });
    }
}

// Carregar jogo
function loadGame() {
    const saved = localStorage.getItem('statisticsDetective');
    if (saved) {
        const data = JSON.parse(saved);
        coins = data.coins || 100;
        gems = data.gems || 5;
        xp = data.xp || 0;
        level = data.level || 1;
        playerData = data.playerData || playerData;
    }
    initDataPoints();
    initChartBars();
}

// Salvar jogo
function saveGame() {
    localStorage.setItem('statisticsDetective', JSON.stringify({
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

// Atualizar pontos de dados
function updateDataPoints() {
    dataPoints.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });
}

// Atualizar barras
function updateChartBars() {
    chartBars.forEach(bar => {
        if (bar.currentHeight < bar.targetHeight) {
            bar.currentHeight += 2;
        } else if (bar.currentHeight > bar.targetHeight) {
            bar.currentHeight -= 2;
        }

        if (Math.random() < 0.02) {
            bar.targetHeight = Math.random() * 100 + 30;
        }
    });
}

// Desenhar fundo estatístico
function drawStatBackground() {
    // Gradiente escuro
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid de fundo
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Pontos de dados flutuantes
    ctx.globalAlpha = 0.4;
    dataPoints.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Mini gráfico de barras no canto
    ctx.globalAlpha = 0.3;
    chartBars.forEach(bar => {
        ctx.fillStyle = bar.color;
        ctx.fillRect(bar.x, canvas.height - bar.currentHeight, 30, bar.currentHeight);
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

    ctx.fillStyle = '#9B59B6';
    ctx.fillText(`⭐ XP: ${xp}`, 220, 38);

    ctx.fillStyle = '#3498DB';
    ctx.fillText(`🔍 Nível ${level}`, 350, 38);

    ctx.fillStyle = '#2ECC71';
    ctx.textAlign = 'right';
    ctx.fillText(`📊 Casos: ${playerData.casesSolved}`, canvas.width - 20, 38);
}

// Desenhar menu principal
function drawMenu() {
    drawStatBackground();
    drawHUD();

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 4;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('🔍 STATISTICS DETECTIVE 📊', canvas.width/2, 140);
    ctx.fillText('🔍 STATISTICS DETECTIVE 📊', canvas.width/2, 140);

    ctx.font = '22px Arial';
    ctx.fillStyle = '#3498DB';
    ctx.fillText('Detetive de Estatística e Probabilidade', canvas.width/2, 180);

    // Botões
    const buttons = [
        { text: '📊 TÓPICOS ESTATÍSTICOS', y: 260, color: '#3498DB' },
        { text: '🏪 LOJA DO DETETIVE', y: 340, color: '#E74C3C' },
        { text: '📋 MEUS CASOS', y: 420, color: '#2ECC71' },
        { text: '🏆 CONQUISTAS', y: 500, color: '#F39C12' }
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

    // Estatísticas rápidas
    ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
    ctx.fillRect(canvas.width/2 - 150, 580, 300, 80);
    ctx.fillStyle = '#3498DB';
    ctx.font = '16px Arial';
    ctx.fillText(`🎯 Precisão: ${playerData.accuracy}%`, canvas.width/2, 610);
    ctx.fillText(`📑 Evidências: ${playerData.evidence.length}`, canvas.width/2, 640);
}

// Desenhar seleção de tópicos
function drawTopicSelect() {
    drawStatBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📊 TÓPICOS ESTATÍSTICOS', canvas.width/2, 100);

    // Botão voltar
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('← Voltar', 70, 107);

    const startY = 140 - scrollOffset;
    const cardHeight = 90;
    const visibleTop = 130;
    const visibleBottom = canvas.height - 20;

    TOPICS.forEach((topic, index) => {
        const y = startY + index * (cardHeight + 15);

        if (y + cardHeight < visibleTop || y > visibleBottom) return;

        const unlocked = level >= topic.unlockLevel || playerData.unlockedTopics.includes(topic.id);
        const progress = playerData.topicProgress[topic.id] || 0;

        ctx.fillStyle = unlocked ? topic.color : '#333';
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
        ctx.fillText(topic.icon, canvas.width/2 - 180, y + 50);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(topic.name, canvas.width/2 - 120, y + 35);

        if (unlocked) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#DDD';
            ctx.fillText(`Progresso: ${progress}/${topic.cases} casos`, canvas.width/2 - 120, y + 58);

            // Barra de progresso
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(canvas.width/2 - 120, y + 66, 200, 10);
            ctx.fillStyle = '#2ECC71';
            ctx.fillRect(canvas.width/2 - 120, y + 66, (progress/topic.cases) * 200, 10);
        } else {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(`🔒 Nível ${topic.unlockLevel} necessário`, canvas.width/2 - 120, y + 58);
        }
    });

    maxScroll = Math.max(0, TOPICS.length * (cardHeight + 15) - (canvas.height - 180));
}

// Desenhar seleção de caso
function drawCaseSelect() {
    const topic = TOPICS[selectedTopic];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, topic.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${topic.icon} ${topic.name}`, canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const progress = playerData.topicProgress[selectedTopic] || 0;
    const cols = 5;
    const size = 70;
    const spacing = 15;
    const startX = (canvas.width - (cols * (size + spacing))) / 2;
    const startY = 150 - scrollOffset;

    for (let i = 0; i < topic.cases; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (size + spacing);
        const y = startY + row * (size + spacing);

        if (y + size < 130 || y > canvas.height - 20) continue;

        const unlocked = i <= progress;
        const completed = i < progress;

        ctx.fillStyle = completed ? '#2ECC71' : (unlocked ? topic.color : '#333');
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

    maxScroll = Math.max(0, Math.ceil(topic.cases / cols) * (size + spacing) - (canvas.height - 200));
}

// Desenhar questão
function drawQuestion() {
    const topic = TOPICS[selectedTopic];

    // Fundo temático
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, topic.color);
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pontos de dados
    ctx.globalAlpha = 0.2;
    dataPoints.forEach(p => {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    drawHUD();

    // Título
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${topic.icon} ${topic.name} - Caso ${selectedCase + 1}`, canvas.width/2, 100);

    if (!currentQuestion) {
        const questions = QUESTIONS[selectedTopic];
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

    ctx.strokeStyle = topic.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 300, 130, 600, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    wrapText(currentQuestion.q, canvas.width/2, 180, 550, 28);

    // Respostas
    const shuffledAnswers = currentQuestion.shuffled || shuffleAnswers(currentQuestion);

    shuffledAnswers.forEach((answer, index) => {
        const y = 280 + index * 80;
        let bgColor = topic.color;

        if (showingResult) {
            if (answer.originalIndex === currentQuestion.correct) {
                bgColor = '#2ECC71';
            } else if (index === selectedAnswer) {
                bgColor = '#E74C3C';
            }
        } else if (index === selectedAnswer) {
            bgColor = '#F39C12';
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
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(canvas.width/2 - 100, 610, 200, 50);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('ANALISAR 🔍', canvas.width/2, 643);
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
    drawStatBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏪 LOJA DO DETETIVE', canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
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
        ctx.fillStyle = '#3498DB';
        ctx.fillText(item.description, x + 15, cardY + 50);

        ctx.fillStyle = item.currency === 'gems' ? '#00CED1' : '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`, x + 15, cardY + 72);

        // Botão comprar
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(x + 200, cardY + 50, 65, 28);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Comprar', x + 232, cardY + 69);
    });
}

// Desenhar casos resolvidos
function drawCasesResolved() {
    drawStatBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📋 MEUS CASOS', canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    // Estatísticas
    ctx.fillStyle = 'rgba(15, 15, 35, 0.9)';
    ctx.fillRect(canvas.width/2 - 200, 150, 400, 200);
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 200, 150, 400, 200);

    ctx.fillStyle = '#3498DB';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';

    const stats = [
        `📊 Casos Resolvidos: ${playerData.casesSolved}`,
        `🎯 Precisão: ${playerData.accuracy}%`,
        `📑 Evidências: ${playerData.evidence.length}`,
        `📚 Tópicos Estudados: ${playerData.unlockedTopics.length}`,
        `🔍 Nível Detetive: ${level}`
    ];

    stats.forEach((stat, i) => {
        ctx.fillText(stat, canvas.width/2, 195 + i * 35);
    });

    // Dica estatística
    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.fillRect(canvas.width/2 - 200, 380, 400, 100);
    ctx.strokeStyle = '#3498DB';
    ctx.strokeRect(canvas.width/2 - 200, 380, 400, 100);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('💡 Insight Estatístico', canvas.width/2, 415);

    ctx.fillStyle = '#3498DB';
    ctx.font = '14px Arial';
    const tips = [
        'Correlação não implica causalidade.',
        'A média pode enganar - veja a distribuição.',
        'Amostras maiores reduzem o erro.',
        'Sempre questione a fonte dos dados.'
    ];
    ctx.fillText(tips[Math.floor(Date.now() / 6000) % tips.length], canvas.width/2, 455);
}

// Desenhar conquistas
function drawAchievements() {
    drawStatBackground();
    drawHUD();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CONQUISTAS', canvas.width/2, 100);

    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(20, 80, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('← Voltar', 70, 107);

    const achievements = [
        { name: 'Primeiro Caso', desc: 'Resolva seu primeiro caso', icon: '🔍', unlocked: true },
        { name: 'Analista', desc: 'Desbloqueie 3 tópicos', icon: '📊', unlocked: playerData.unlockedTopics.length >= 3 },
        { name: 'Preciso', desc: 'Mantenha 90%+ de precisão', icon: '🎯', unlocked: playerData.accuracy >= 90 },
        { name: 'Detetive', desc: 'Resolva 50 casos', icon: '🕵️', unlocked: playerData.casesSolved >= 50 },
        { name: 'Estatístico', desc: 'Alcance nível 10', icon: '📈', unlocked: level >= 10 },
        { name: 'Expert', desc: 'Complete 5 tópicos', icon: '🏅', unlocked: Object.values(playerData.topicProgress).filter(p => p >= 50).length >= 5 },
        { name: 'Mestre dos Dados', desc: 'Complete todos os tópicos', icon: '👑', unlocked: false }
    ];

    achievements.forEach((ach, i) => {
        const y = 140 + i * 75;
        ctx.fillStyle = ach.unlocked ? '#3498DB' : '#333';
        ctx.fillRect(canvas.width/2 - 200, y, 400, 65);

        if (ach.unlocked) {
            ctx.strokeStyle = '#2ECC71';
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
        ctx.fillStyle = ach.unlocked ? '#2ECC71' : '#666';
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
        case 'topics': drawTopicSelect(); break;
        case 'cases': drawCaseSelect(); break;
        case 'question': drawQuestion(); break;
        case 'shop': drawShop(); break;
        case 'myCases': drawCasesResolved(); break;
        case 'achievements': drawAchievements(); break;
    }
}

// Game loop
function gameLoop() {
    updateParticles();
    updateDataPoints();
    updateChartBars();
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
        playerData.casesSolved++;
        playerData.evidence.push(`Evidence_${Date.now()}`);
        createParticles(canvas.width/2, 400, '#2ECC71', 30);

        const progress = playerData.topicProgress[selectedTopic] || 0;
        if (selectedCase === progress) {
            playerData.topicProgress[selectedTopic] = progress + 1;
        }

        // Verificar level up
        const xpNeeded = level * 100;
        if (xp >= xpNeeded) {
            level++;
            xp -= xpNeeded;
            gems += 2;
            createParticles(canvas.width/2, 300, '#9B59B6', 40);

            // Desbloquear tópicos
            TOPICS.forEach(topic => {
                if (level >= topic.unlockLevel && !playerData.unlockedTopics.includes(topic.id)) {
                    playerData.unlockedTopics.push(topic.id);
                }
            });
        }
    } else {
        createParticles(canvas.width/2, 400, '#E74C3C', 20);
        // Ajustar precisão
        if (playerData.casesSolved > 0) {
            playerData.accuracy = Math.max(0, playerData.accuracy - 1);
        }
    }

    saveGame();

    setTimeout(() => {
        currentQuestion = null;
        showingResult = false;
        selectedAnswer = null;
        if (resultCorrect) {
            currentScreen = 'cases';
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
        if (y >= 260 && y <= 320) currentScreen = 'topics';
        else if (y >= 340 && y <= 400) currentScreen = 'shop';
        else if (y >= 420 && y <= 480) currentScreen = 'myCases';
        else if (y >= 500 && y <= 560) currentScreen = 'achievements';
        scrollOffset = 0;
    }
    else if (currentScreen === 'topics') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
            return;
        }

        const startY = 140 - scrollOffset;
        TOPICS.forEach((topic, index) => {
            const cardY = startY + index * 105;
            if (y >= cardY && y <= cardY + 90 && x >= canvas.width/2 - 200 && x <= canvas.width/2 + 200) {
                const unlocked = level >= topic.unlockLevel || playerData.unlockedTopics.includes(topic.id);
                if (unlocked) {
                    selectedTopic = index;
                    currentScreen = 'cases';
                    scrollOffset = 0;
                }
            }
        });
    }
    else if (currentScreen === 'cases') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'topics';
            scrollOffset = 0;
            return;
        }

        const topic = TOPICS[selectedTopic];
        const progress = playerData.topicProgress[selectedTopic] || 0;
        const cols = 5;
        const size = 70;
        const spacing = 15;
        const startX = (canvas.width - (cols * (size + spacing))) / 2;
        const startY = 150 - scrollOffset;

        for (let i = 0; i < topic.cases; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const caseX = startX + col * (size + spacing);
            const caseY = startY + row * (size + spacing);

            if (x >= caseX && x <= caseX + size && y >= caseY && y <= caseY + size) {
                if (i <= progress) {
                    selectedCase = i;
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

                    if (item.id === 'evidence_pack') {
                        for (let i = 0; i < 50; i++) playerData.evidence.push(`Evidence_${Date.now()}_${i}`);
                    } else if (item.id === 'accuracy_boost') {
                        playerData.accuracy = Math.min(100, playerData.accuracy + 10);
                    } else if (item.id === 'case_files') {
                        playerData.casesSolved += 5;
                    }

                    createParticles(itemX + 140, itemY + 40, '#2ECC71', 20);
                    saveGame();
                }
            }
        });
    }
    else if (currentScreen === 'myCases' || currentScreen === 'achievements') {
        if (x >= 20 && x <= 120 && y >= 80 && y <= 120) {
            currentScreen = 'menu';
        }
    }
});

// Scroll/Touch
canvas.addEventListener('wheel', (e) => {
    if (['topics', 'cases'].includes(currentScreen)) {
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + e.deltaY * 0.5));
        e.preventDefault();
    }
}, { passive: false });

let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (['topics', 'cases'].includes(currentScreen)) {
        const deltaY = touchStartY - e.touches[0].clientY;
        scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset + deltaY * 0.5));
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
}, { passive: false });

// Inicialização
loadGame();
gameLoop();
