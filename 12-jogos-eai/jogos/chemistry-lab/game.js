/**
 * Chemistry Lab Pro - Simulador de Química
 * Aprenda química através de experimentos virtuais
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==================== DADOS DO JOGO ====================
const GameData = {
  // Elementos da tabela periódica
  elements: [
    { symbol: 'H', name: 'Hidrogênio', number: 1, mass: 1.008, category: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'He', name: 'Hélio', number: 2, mass: 4.003, category: 'noble', color: '#ffd93d' },
    { symbol: 'Li', name: 'Lítio', number: 3, mass: 6.94, category: 'alkali', color: '#ff9f43' },
    { symbol: 'Be', name: 'Berílio', number: 4, mass: 9.012, category: 'alkaline', color: '#a29bfe' },
    { symbol: 'B', name: 'Boro', number: 5, mass: 10.81, category: 'metalloid', color: '#74b9ff' },
    { symbol: 'C', name: 'Carbono', number: 6, mass: 12.01, category: 'nonmetal', color: '#636e72' },
    { symbol: 'N', name: 'Nitrogênio', number: 7, mass: 14.01, category: 'nonmetal', color: '#0984e3' },
    { symbol: 'O', name: 'Oxigênio', number: 8, mass: 16.00, category: 'nonmetal', color: '#e17055' },
    { symbol: 'F', name: 'Flúor', number: 9, mass: 19.00, category: 'halogen', color: '#00b894' },
    { symbol: 'Ne', name: 'Neônio', number: 10, mass: 20.18, category: 'noble', color: '#fd79a8' },
    { symbol: 'Na', name: 'Sódio', number: 11, mass: 22.99, category: 'alkali', color: '#ff7675' },
    { symbol: 'Mg', name: 'Magnésio', number: 12, mass: 24.31, category: 'alkaline', color: '#55efc4' },
    { symbol: 'Al', name: 'Alumínio', number: 13, mass: 26.98, category: 'metal', color: '#b2bec3' },
    { symbol: 'Si', name: 'Silício', number: 14, mass: 28.09, category: 'metalloid', color: '#636e72' },
    { symbol: 'P', name: 'Fósforo', number: 15, mass: 30.97, category: 'nonmetal', color: '#fdcb6e' },
    { symbol: 'S', name: 'Enxofre', number: 16, mass: 32.07, category: 'nonmetal', color: '#ffeaa7' },
    { symbol: 'Cl', name: 'Cloro', number: 17, mass: 35.45, category: 'halogen', color: '#00cec9' },
    { symbol: 'Ar', name: 'Argônio', number: 18, mass: 39.95, category: 'noble', color: '#dfe6e9' },
    { symbol: 'K', name: 'Potássio', number: 19, mass: 39.10, category: 'alkali', color: '#e84393' },
    { symbol: 'Ca', name: 'Cálcio', number: 20, mass: 40.08, category: 'alkaline', color: '#81ecec' },
    { symbol: 'Fe', name: 'Ferro', number: 26, mass: 55.85, category: 'transition', color: '#d63031' },
    { symbol: 'Cu', name: 'Cobre', number: 29, mass: 63.55, category: 'transition', color: '#e17055' },
    { symbol: 'Zn', name: 'Zinco', number: 30, mass: 65.38, category: 'transition', color: '#74b9ff' },
    { symbol: 'Ag', name: 'Prata', number: 47, mass: 107.87, category: 'transition', color: '#dfe6e9' },
    { symbol: 'Au', name: 'Ouro', number: 79, mass: 196.97, category: 'transition', color: '#ffd700' }
  ],

  // Laboratórios (mundos)
  labs: [
    {
      id: 'intro',
      name: 'Introdução à Química',
      icon: '📚',
      color: '#4CAF50',
      levels: 50,
      unlockLevel: 0,
      topics: ['Átomos', 'Moléculas', 'Tabela Periódica', 'Estados da Matéria']
    },
    {
      id: 'reactions',
      name: 'Reações Químicas',
      icon: '💥',
      color: '#FF9800',
      levels: 50,
      unlockLevel: 10,
      topics: ['Síntese', 'Decomposição', 'Troca Simples', 'Troca Dupla']
    },
    {
      id: 'acids',
      name: 'Ácidos e Bases',
      icon: '🧫',
      color: '#9C27B0',
      levels: 50,
      unlockLevel: 20,
      topics: ['pH', 'Indicadores', 'Neutralização', 'Titulação']
    },
    {
      id: 'organic',
      name: 'Química Orgânica',
      icon: '🔬',
      color: '#2196F3',
      levels: 50,
      unlockLevel: 35,
      topics: ['Hidrocarbonetos', 'Álcoois', 'Aldeídos', 'Ácidos Carboxílicos']
    },
    {
      id: 'solutions',
      name: 'Soluções',
      icon: '💧',
      color: '#00BCD4',
      levels: 50,
      unlockLevel: 50,
      topics: ['Concentração', 'Diluição', 'Solubilidade', 'Coloides']
    },
    {
      id: 'thermo',
      name: 'Termoquímica',
      icon: '🔥',
      color: '#f44336',
      levels: 50,
      unlockLevel: 65,
      topics: ['Entalpia', 'Entropia', 'Energia Livre', 'Lei de Hess']
    },
    {
      id: 'electro',
      name: 'Eletroquímica',
      icon: '⚡',
      color: '#FFEB3B',
      levels: 50,
      unlockLevel: 80,
      topics: ['Oxidação', 'Redução', 'Pilhas', 'Eletrólise']
    },
    {
      id: 'nuclear',
      name: 'Química Nuclear',
      icon: '☢️',
      color: '#673AB7',
      levels: 50,
      unlockLevel: 100,
      topics: ['Radioatividade', 'Fissão', 'Fusão', 'Meia-vida']
    }
  ],

  // Reações químicas
  reactions: [
    { reactants: ['H', 'H', 'O'], products: ['H2O'], name: 'Formação da Água', type: 'synthesis' },
    { reactants: ['Na', 'Cl'], products: ['NaCl'], name: 'Formação do Sal', type: 'synthesis' },
    { reactants: ['C', 'O', 'O'], products: ['CO2'], name: 'Dióxido de Carbono', type: 'synthesis' },
    { reactants: ['Fe', 'O', 'O'], products: ['FeO2'], name: 'Ferrugem', type: 'oxidation' },
    { reactants: ['H', 'Cl'], products: ['HCl'], name: 'Ácido Clorídrico', type: 'synthesis' },
    { reactants: ['Na', 'O', 'H'], products: ['NaOH'], name: 'Soda Cáustica', type: 'synthesis' },
    { reactants: ['C', 'H', 'H', 'H', 'H'], products: ['CH4'], name: 'Metano', type: 'organic' },
    { reactants: ['N', 'H', 'H', 'H'], products: ['NH3'], name: 'Amônia', type: 'synthesis' }
  ],

  // Equipamentos de laboratório
  equipment: [
    { id: 'beaker', name: 'Béquer', icon: '🧪', price: 0 },
    { id: 'flask', name: 'Erlenmeyer', icon: '⚗️', price: 100 },
    { id: 'bunsen', name: 'Bico de Bunsen', icon: '🔥', price: 200 },
    { id: 'microscope', name: 'Microscópio', icon: '🔬', price: 500 },
    { id: 'centrifuge', name: 'Centrífuga', icon: '🌀', price: 1000 },
    { id: 'spectrometer', name: 'Espectrômetro', icon: '🌈', price: 2000 }
  ],

  // Conquistas
  achievements: [
    { id: 'first_exp', name: 'Primeiro Experimento', desc: 'Complete seu primeiro experimento', icon: '🧪', reward: 50 },
    { id: 'elements_10', name: 'Conhecedor', desc: 'Aprenda 10 elementos', icon: '📚', reward: 100 },
    { id: 'elements_25', name: 'Químico', desc: 'Aprenda 25 elementos', icon: '🔬', reward: 300 },
    { id: 'reactions_10', name: 'Reativo', desc: 'Complete 10 reações', icon: '💥', reward: 200 },
    { id: 'perfect_lab', name: 'Laboratório Perfeito', desc: '10 experimentos sem erros', icon: '✨', reward: 500 },
    { id: 'speed_chemist', name: 'Químico Veloz', desc: 'Complete em menos de 5s', icon: '⚡', reward: 150 },
    { id: 'level_50', name: 'Cientista', desc: 'Alcance nível 50', icon: '👨‍🔬', reward: 1000 }
  ],

  // Jaleco/skins
  labCoats: [
    { id: 'white', name: 'Jaleco Branco', icon: '🥼', color: '#ffffff', price: 0 },
    { id: 'blue', name: 'Jaleco Azul', icon: '🥼', color: '#2196F3', price: 300 },
    { id: 'green', name: 'Jaleco Verde', icon: '🥼', color: '#4CAF50', price: 300 },
    { id: 'purple', name: 'Jaleco Roxo', icon: '🥼', color: '#9C27B0', price: 500 },
    { id: 'gold', name: 'Jaleco Dourado', icon: '🥼', color: '#FFD700', price: 2000 }
  ]
};

// ==================== GERADOR DE PROBLEMAS ====================
const ChemistryProblems = {
  generate(labId, level) {
    const difficulty = Math.min(10, Math.floor(level / 5) + 1);

    switch(labId) {
      case 'intro': return this.introProblems(difficulty);
      case 'reactions': return this.reactionProblems(difficulty);
      case 'acids': return this.acidBaseProblems(difficulty);
      case 'organic': return this.organicProblems(difficulty);
      case 'solutions': return this.solutionProblems(difficulty);
      case 'thermo': return this.thermoProblems(difficulty);
      case 'electro': return this.electroProblems(difficulty);
      case 'nuclear': return this.nuclearProblems(difficulty);
      default: return this.introProblems(difficulty);
    }
  },

  introProblems(diff) {
    const types = ['element_symbol', 'element_number', 'element_category', 'molecule', 'state'];
    const type = types[Math.floor(Math.random() * Math.min(diff, types.length))];

    const elements = GameData.elements.slice(0, Math.min(10 + diff * 2, GameData.elements.length));
    const element = elements[Math.floor(Math.random() * elements.length)];

    let question, answer, options;

    switch(type) {
      case 'element_symbol':
        question = `Qual o símbolo do elemento ${element.name}?`;
        answer = element.symbol;
        options = [element.symbol];
        while (options.length < 4) {
          const rand = elements[Math.floor(Math.random() * elements.length)];
          if (!options.includes(rand.symbol)) options.push(rand.symbol);
        }
        break;

      case 'element_number':
        question = `Qual o número atômico do ${element.name}?`;
        answer = element.number;
        options = [element.number];
        while (options.length < 4) {
          const wrong = element.number + Math.floor(Math.random() * 10) - 5;
          if (wrong > 0 && !options.includes(wrong)) options.push(wrong);
        }
        break;

      case 'element_category':
        const categories = {
          'nonmetal': 'Não-metal',
          'noble': 'Gás Nobre',
          'alkali': 'Metal Alcalino',
          'alkaline': 'Metal Alcalino Terroso',
          'metalloid': 'Metaloide',
          'metal': 'Metal',
          'halogen': 'Halogênio',
          'transition': 'Metal de Transição'
        };
        question = `O ${element.name} é classificado como:`;
        answer = categories[element.category];
        options = [answer];
        const allCats = Object.values(categories);
        while (options.length < 4) {
          const rand = allCats[Math.floor(Math.random() * allCats.length)];
          if (!options.includes(rand)) options.push(rand);
        }
        break;

      case 'molecule':
        const molecules = [
          { formula: 'H₂O', name: 'Água' },
          { formula: 'CO₂', name: 'Dióxido de Carbono' },
          { formula: 'O₂', name: 'Oxigênio' },
          { formula: 'N₂', name: 'Nitrogênio' },
          { formula: 'NaCl', name: 'Sal de Cozinha' },
          { formula: 'CH₄', name: 'Metano' }
        ];
        const mol = molecules[Math.floor(Math.random() * molecules.length)];
        question = `Qual a fórmula da molécula: ${mol.name}?`;
        answer = mol.formula;
        options = [mol.formula];
        while (options.length < 4) {
          const rand = molecules[Math.floor(Math.random() * molecules.length)];
          if (!options.includes(rand.formula)) options.push(rand.formula);
        }
        break;

      case 'state':
        const states = [
          { element: 'Oxigênio', state: 'Gasoso' },
          { element: 'Ferro', state: 'Sólido' },
          { element: 'Mercúrio', state: 'Líquido' },
          { element: 'Hélio', state: 'Gasoso' },
          { element: 'Ouro', state: 'Sólido' }
        ];
        const st = states[Math.floor(Math.random() * states.length)];
        question = `Em temperatura ambiente, o ${st.element} está no estado:`;
        answer = st.state;
        options = ['Sólido', 'Líquido', 'Gasoso', 'Plasma'];
        break;
    }

    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  },

  reactionProblems(diff) {
    const types = ['balance', 'product', 'type', 'reagent'];
    const type = types[Math.floor(Math.random() * Math.min(diff/2 + 1, types.length))];

    let question, answer, options;

    switch(type) {
      case 'balance':
        const equations = [
          { eq: 'H₂ + O₂ → H₂O', balanced: '2H₂ + O₂ → 2H₂O' },
          { eq: 'N₂ + H₂ → NH₃', balanced: 'N₂ + 3H₂ → 2NH₃' },
          { eq: 'Fe + O₂ → Fe₂O₃', balanced: '4Fe + 3O₂ → 2Fe₂O₃' }
        ];
        const eq = equations[Math.floor(Math.random() * equations.length)];
        question = `Balanceie: ${eq.eq}\nQual o coeficiente do primeiro reagente?`;
        const coef = parseInt(eq.balanced.charAt(0)) || 1;
        answer = coef;
        options = [1, 2, 3, 4];
        break;

      case 'product':
        question = 'Na reação: Na + Cl₂ →\nQual o produto formado?';
        answer = 'NaCl';
        options = ['NaCl', 'NaCl₂', 'Na₂Cl', 'Na₂Cl₂'];
        break;

      case 'type':
        const reactions = [
          { eq: 'A + B → AB', type: 'Síntese' },
          { eq: 'AB → A + B', type: 'Decomposição' },
          { eq: 'A + BC → AC + B', type: 'Troca Simples' },
          { eq: 'AB + CD → AD + CB', type: 'Troca Dupla' }
        ];
        const r = reactions[Math.floor(Math.random() * reactions.length)];
        question = `Que tipo de reação é:\n${r.eq}`;
        answer = r.type;
        options = ['Síntese', 'Decomposição', 'Troca Simples', 'Troca Dupla'];
        break;

      case 'reagent':
        question = 'Para formar água (H₂O), precisamos de:';
        answer = 'Hidrogênio e Oxigênio';
        options = ['Hidrogênio e Oxigênio', 'Hidrogênio e Nitrogênio', 'Carbono e Oxigênio', 'Sódio e Cloro'];
        break;
    }

    if (!options.includes(answer)) options[0] = answer;
    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  },

  acidBaseProblems(diff) {
    const types = ['ph_scale', 'indicator', 'acid_base', 'neutralization'];
    const type = types[Math.floor(Math.random() * Math.min(diff/2 + 1, types.length))];

    let question, answer, options;

    switch(type) {
      case 'ph_scale':
        const ph = Math.floor(Math.random() * 14) + 1;
        question = `Uma solução com pH ${ph} é:`;
        if (ph < 7) answer = 'Ácida';
        else if (ph > 7) answer = 'Básica';
        else answer = 'Neutra';
        options = ['Ácida', 'Básica', 'Neutra', 'Anfótera'];
        break;

      case 'indicator':
        const indicators = [
          { name: 'Fenolftaleína', acidColor: 'Incolor', baseColor: 'Rosa' },
          { name: 'Tornassol', acidColor: 'Vermelho', baseColor: 'Azul' },
          { name: 'Azul de Bromotimol', acidColor: 'Amarelo', baseColor: 'Azul' }
        ];
        const ind = indicators[Math.floor(Math.random() * indicators.length)];
        const isAcid = Math.random() > 0.5;
        question = `Cor da ${ind.name} em meio ${isAcid ? 'ácido' : 'básico'}:`;
        answer = isAcid ? ind.acidColor : ind.baseColor;
        options = ['Incolor', 'Rosa', 'Vermelho', 'Azul', 'Amarelo'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
        if (!options.includes(answer)) options[0] = answer;
        break;

      case 'acid_base':
        const substances = [
          { name: 'HCl', type: 'Ácido' },
          { name: 'NaOH', type: 'Base' },
          { name: 'H₂SO₄', type: 'Ácido' },
          { name: 'KOH', type: 'Base' },
          { name: 'HNO₃', type: 'Ácido' },
          { name: 'Ca(OH)₂', type: 'Base' }
        ];
        const sub = substances[Math.floor(Math.random() * substances.length)];
        question = `${sub.name} é um:`;
        answer = sub.type;
        options = ['Ácido', 'Base', 'Sal', 'Óxido'];
        break;

      case 'neutralization':
        question = 'Ácido + Base produz:';
        answer = 'Sal + Água';
        options = ['Sal + Água', 'Apenas Sal', 'Apenas Água', 'Gás + Sal'];
        break;
    }

    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  },

  organicProblems(diff) {
    const compounds = [
      { name: 'Metano', formula: 'CH₄', type: 'Alcano', carbons: 1 },
      { name: 'Etano', formula: 'C₂H₆', type: 'Alcano', carbons: 2 },
      { name: 'Eteno', formula: 'C₂H₄', type: 'Alceno', carbons: 2 },
      { name: 'Etanol', formula: 'C₂H₅OH', type: 'Álcool', carbons: 2 },
      { name: 'Metanol', formula: 'CH₃OH', type: 'Álcool', carbons: 1 },
      { name: 'Ácido Acético', formula: 'CH₃COOH', type: 'Ácido Carboxílico', carbons: 2 }
    ];

    const comp = compounds[Math.floor(Math.random() * compounds.length)];
    const questionType = Math.floor(Math.random() * 3);

    let question, answer, options;

    switch(questionType) {
      case 0:
        question = `Qual a fórmula do ${comp.name}?`;
        answer = comp.formula;
        options = [comp.formula];
        compounds.forEach(c => { if (!options.includes(c.formula) && options.length < 4) options.push(c.formula); });
        break;
      case 1:
        question = `${comp.name} pertence à classe dos:`;
        answer = comp.type + 's';
        options = ['Alcanos', 'Alcenos', 'Álcoois', 'Ácidos Carboxílicos'];
        break;
      case 2:
        question = `Quantos carbonos tem o ${comp.name}?`;
        answer = comp.carbons;
        options = [1, 2, 3, 4];
        break;
    }

    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  },

  solutionProblems(diff) {
    const types = ['concentration', 'dilution', 'solubility'];
    const type = types[Math.floor(Math.random() * types.length)];

    let question, answer, options;

    switch(type) {
      case 'concentration':
        const mass = (Math.floor(Math.random() * 5) + 1) * 10;
        const volume = Math.floor(Math.random() * 5) + 1;
        const conc = mass / volume;
        question = `Concentração: ${mass}g de soluto em ${volume}L de solução. C = ?`;
        answer = conc + ' g/L';
        options = [conc + ' g/L', (conc * 2) + ' g/L', (conc / 2) + ' g/L', (conc + 10) + ' g/L'];
        break;

      case 'dilution':
        question = 'Ao diluir uma solução, a concentração:';
        answer = 'Diminui';
        options = ['Aumenta', 'Diminui', 'Não muda', 'Depende'];
        break;

      case 'solubility':
        question = 'A solubilidade geralmente aumenta com:';
        answer = 'Aumento da temperatura';
        options = ['Aumento da temperatura', 'Diminuição da temperatura', 'Pressão', 'Luz'];
        break;
    }

    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  },

  thermoProblems(diff) {
    const types = ['endo_exo', 'enthalpy', 'hess'];
    const type = types[Math.floor(Math.random() * types.length)];

    let question, answer, options;

    switch(type) {
      case 'endo_exo':
        const reactions = [
          { name: 'Combustão', type: 'Exotérmica' },
          { name: 'Fotossíntese', type: 'Endotérmica' },
          { name: 'Dissolução de NaOH', type: 'Exotérmica' },
          { name: 'Fusão do gelo', type: 'Endotérmica' }
        ];
        const r = reactions[Math.floor(Math.random() * reactions.length)];
        question = `A ${r.name} é uma reação:`;
        answer = r.type;
        options = ['Exotérmica', 'Endotérmica', 'Isotérmica', 'Adiabática'];
        break;

      case 'enthalpy':
        question = 'Se ΔH < 0, a reação é:';
        answer = 'Exotérmica';
        options = ['Exotérmica', 'Endotérmica', 'Espontânea', 'Não-espontânea'];
        break;

      case 'hess':
        question = 'A Lei de Hess afirma que a entalpia:';
        answer = 'Depende apenas dos estados inicial e final';
        options = ['Depende apenas dos estados inicial e final', 'Depende do caminho', 'É sempre positiva', 'É sempre negativa'];
        break;
    }

    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  },

  electroProblems(diff) {
    const types = ['oxidation', 'reduction', 'cell'];
    const type = types[Math.floor(Math.random() * types.length)];

    let question, answer, options;

    switch(type) {
      case 'oxidation':
        question = 'Na oxidação, o elemento:';
        answer = 'Perde elétrons';
        options = ['Perde elétrons', 'Ganha elétrons', 'Perde prótons', 'Ganha prótons'];
        break;

      case 'reduction':
        question = 'Na redução, o NOX:';
        answer = 'Diminui';
        options = ['Aumenta', 'Diminui', 'Não muda', 'Zera'];
        break;

      case 'cell':
        question = 'Em uma pilha, o cátodo é o eletrodo:';
        answer = 'Positivo (redução)';
        options = ['Positivo (redução)', 'Negativo (redução)', 'Positivo (oxidação)', 'Negativo (oxidação)'];
        break;
    }

    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  },

  nuclearProblems(diff) {
    const types = ['decay', 'half_life', 'fission_fusion'];
    const type = types[Math.floor(Math.random() * types.length)];

    let question, answer, options;

    switch(type) {
      case 'decay':
        question = 'A emissão de partículas alfa consiste em:';
        answer = '2 prótons + 2 nêutrons';
        options = ['2 prótons + 2 nêutrons', '1 elétron', '1 pósitron', '2 elétrons'];
        break;

      case 'half_life':
        const t = [10, 20, 30][Math.floor(Math.random() * 3)];
        const initial = 100;
        question = `Massa inicial: ${initial}g, meia-vida: ${t} anos.\nApós ${t} anos, restam:`;
        answer = '50g';
        options = ['25g', '50g', '75g', '100g'];
        break;

      case 'fission_fusion':
        const isFission = Math.random() > 0.5;
        question = isFission
          ? 'Na fissão nuclear, um núcleo pesado:'
          : 'Na fusão nuclear, núcleos leves:';
        answer = isFission ? 'Se divide em menores' : 'Se unem formando maior';
        options = ['Se divide em menores', 'Se unem formando maior', 'Permanece estável', 'Emite luz'];
        break;
    }

    options.sort(() => Math.random() - 0.5);
    return { question, options, correctIndex: options.indexOf(answer), answer };
  }
};

// ==================== ESTADO DO JOGO ====================
let gameState = {
  screen: 'title',
  player: null,
  currentLab: null,
  currentLevel: 1,
  experiment: null,
  particles: [],
  bubbles: [],
  clickAreas: []
};

function loadPlayer() {
  const saved = localStorage.getItem('chemlab_player');
  return saved ? JSON.parse(saved) : null;
}

function savePlayer() {
  localStorage.setItem('chemlab_player', JSON.stringify(gameState.player));
}

function createNewPlayer(name) {
  return {
    name,
    level: 1,
    xp: 0,
    xpToNext: 100,
    coins: 50,
    gems: 5,

    stats: {
      experiments: 0,
      perfect: 0,
      elementsLearned: [],
      reactionsCompleted: 0,
      streak: 0,
      bestStreak: 0
    },

    progress: {},
    equipment: ['beaker'],
    labCoat: 'white',
    unlockedCoats: ['white'],
    achievements: []
  };
}

// ==================== RENDERIZAÇÃO ====================
function render() {
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  switch(gameState.screen) {
    case 'title': renderTitle(); break;
    case 'menu': renderMenu(); break;
    case 'labs': renderLabs(); break;
    case 'levels': renderLevels(); break;
    case 'experiment': renderExperiment(); break;
    case 'periodic': renderPeriodicTable(); break;
    case 'shop': renderShop(); break;
    case 'profile': renderProfile(); break;
  }

  renderBubbles();
  renderParticles();
}

function renderTitle() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Background com efeito químico
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
  grad.addColorStop(0, '#1a4a5c');
  grad.addColorStop(1, '#0a1628');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bolhas decorativas
  if (Math.random() < 0.1) {
    gameState.bubbles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 2 + 1,
      color: ['#00ff88', '#00ccff', '#ff88ff'][Math.floor(Math.random() * 3)]
    });
  }

  // Logo
  const bounce = Math.sin(Date.now() / 400) * 15;
  ctx.font = '80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🧪', cx, cy - 100 + bounce);

  ctx.font = 'bold 42px Arial Black';
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 20;
  ctx.fillText('CHEMISTRY LAB', cx, cy - 10);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#00ccff';
  ctx.fillText('PRO', cx, cy + 25);

  ctx.font = '14px Arial';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Experimentos virtuais de química', cx, cy + 55);

  // Botões
  const hasPlayer = loadPlayer() !== null;

  drawButton(cx, cy + 120, 200, 50, hasPlayer ? 'CONTINUAR' : 'NOVO JOGO', '#00ff88', () => {
    if (hasPlayer) {
      gameState.player = loadPlayer();
      gameState.screen = 'menu';
    } else {
      gameState.player = createNewPlayer('Cientista');
      savePlayer();
      gameState.screen = 'menu';
    }
  });

  if (hasPlayer) {
    drawButton(cx, cy + 180, 150, 35, 'Novo Jogo', '#ff6b6b', () => {
      if (confirm('Apagar progresso?')) {
        localStorage.removeItem('chemlab_player');
        gameState.player = createNewPlayer('Cientista');
        savePlayer();
        gameState.screen = 'menu';
      }
    });
  }
}

function renderMenu() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1a3a5c');
  grad.addColorStop(1, '#0a1628');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, canvas.width, 100);

  ctx.font = '40px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('👨‍🔬', 20, 60);

  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(player.name, 80, 45);

  ctx.font = '14px Arial';
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`Nível ${player.level}`, 80, 65);

  // XP bar
  ctx.fillStyle = '#333';
  roundRect(80, 75, 120, 10, 5);
  ctx.fill();

  ctx.fillStyle = '#00ff88';
  roundRect(80, 75, 120 * (player.xp / player.xpToNext), 10, 5);
  ctx.fill();

  // Moedas
  ctx.textAlign = 'right';
  ctx.font = '16px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`💰 ${player.coins}`, canvas.width - 20, 50);
  ctx.fillStyle = '#00ffcc';
  ctx.fillText(`💎 ${player.gems}`, canvas.width - 20, 75);

  // Menu cards
  const menuItems = [
    { icon: '🧪', label: 'LABORATÓRIOS', color: '#00ff88', action: () => gameState.screen = 'labs' },
    { icon: '📊', label: 'TABELA PERIÓDICA', color: '#00ccff', action: () => gameState.screen = 'periodic' },
    { icon: '🛒', label: 'LOJA', color: '#FF9800', action: () => gameState.screen = 'shop' },
    { icon: '📈', label: 'PERFIL', color: '#9C27B0', action: () => gameState.screen = 'profile' }
  ];

  menuItems.forEach((item, i) => {
    const x = cx - 80 + (i % 2) * 160;
    const y = 140 + Math.floor(i / 2) * 110;

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

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = item.color;
    ctx.fillText(item.label, x, y + 70);

    gameState.clickAreas.push({
      x: x - 65, y, w: 130, h: 90,
      action: item.action
    });
  });

  // Stats rápidos
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(20, canvas.height - 100, canvas.width - 40, 80, 15);
  ctx.fill();

  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`${player.stats.experiments} experimentos | ${player.stats.elementsLearned.length} elementos | ${player.stats.reactionsCompleted} reações`, cx, canvas.height - 55);
}

function renderLabs() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => gameState.screen = 'menu');

  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('🧪 LABORATÓRIOS', cx, 40);

  // Lista de labs
  const startY = 80;
  GameData.labs.forEach((lab, i) => {
    const y = startY + i * 85 - (gameState.labScroll || 0);
    if (y < 50 || y > canvas.height) return;

    const unlocked = player.level >= lab.unlockLevel;
    const progress = player.progress[lab.id] || { completed: 0 };

    ctx.fillStyle = unlocked ? lab.color + '30' : '#1a1a2e';
    roundRect(20, y, canvas.width - 40, 75, 12);
    ctx.fill();

    if (unlocked) {
      ctx.strokeStyle = lab.color;
      ctx.lineWidth = 2;
      roundRect(20, y, canvas.width - 40, 75, 12);
      ctx.stroke();
    }

    ctx.font = '35px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = unlocked ? '#fff' : '#555';
    ctx.fillText(lab.icon, 35, y + 45);

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = unlocked ? '#fff' : '#666';
    ctx.fillText(lab.name, 85, y + 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = unlocked ? '#aaa' : '#555';
    ctx.fillText(lab.topics.slice(0, 3).join(' • '), 85, y + 50);

    if (unlocked) {
      ctx.fillStyle = '#333';
      roundRect(85, y + 55, 100, 8, 4);
      ctx.fill();

      ctx.fillStyle = lab.color;
      roundRect(85, y + 55, 100 * (progress.completed / lab.levels), 8, 4);
      ctx.fill();

      ctx.font = '10px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${progress.completed}/${lab.levels}`, 195, y + 62);

      gameState.clickAreas.push({
        x: 20, y, w: canvas.width - 40, h: 75,
        action: () => {
          gameState.currentLab = lab;
          gameState.screen = 'levels';
        }
      });
    } else {
      ctx.font = '11px Arial';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText(`🔒 Nível ${lab.unlockLevel}`, 85, y + 65);
    }
  });
}

function renderLevels() {
  const cx = canvas.width / 2;
  const lab = gameState.currentLab;
  const player = gameState.player;
  const progress = player.progress[lab.id] || { completed: 0, stars: {} };

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, lab.color + '40');
  grad.addColorStop(1, '#0a1628');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 70);

  drawButton(50, 35, 80, 30, '← Voltar', '#666', () => gameState.screen = 'labs');

  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(lab.icon, cx, 35);

  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(lab.name, cx, 58);

  // Grid de níveis
  const cols = 5;
  const cellSize = Math.min((canvas.width - 60) / cols, 65);
  const startX = (canvas.width - cols * cellSize) / 2;
  const startY = 90;

  for (let i = 0; i < lab.levels; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * cellSize + cellSize / 2;
    const y = startY + row * cellSize - (gameState.levelScroll || 0);

    if (y < 70 || y > canvas.height) continue;

    const levelNum = i + 1;
    const unlocked = levelNum <= progress.completed + 1;
    const completed = levelNum <= progress.completed;
    const stars = progress.stars?.[levelNum] || 0;
    const isBoss = levelNum % 10 === 0;

    ctx.beginPath();
    ctx.arc(x, y, cellSize / 2 - 6, 0, Math.PI * 2);

    if (completed) ctx.fillStyle = lab.color;
    else if (unlocked) ctx.fillStyle = lab.color + '60';
    else ctx.fillStyle = '#2a2a4e';
    ctx.fill();

    if (isBoss) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.font = isBoss ? '18px Arial' : 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = unlocked ? '#fff' : '#555';
    ctx.fillText(isBoss ? '⚗️' : levelNum, x, y + 5);

    if (completed && stars > 0) {
      ctx.font = '8px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('⭐'.repeat(stars), x, y + 18);
    }

    if (unlocked) {
      gameState.clickAreas.push({
        x: x - cellSize/2, y: y - cellSize/2, w: cellSize, h: cellSize,
        action: () => startExperiment(levelNum)
      });
    }
  }
}

function startExperiment(level) {
  const lab = gameState.currentLab;

  gameState.experiment = {
    level,
    problem: ChemistryProblems.generate(lab.id, level),
    selectedOption: null,
    result: null,
    startTime: Date.now(),
    streak: 0
  };

  gameState.currentLevel = level;
  gameState.screen = 'experiment';
}

function renderExperiment() {
  const cx = canvas.width / 2;
  const exp = gameState.experiment;
  const lab = gameState.currentLab;

  // Background do laboratório
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1a3a4a');
  grad.addColorStop(1, '#0a1628');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mesa do laboratório
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(0, canvas.height - 200, canvas.width, 10);

  // Equipamentos decorativos
  ctx.font = '60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🧪', cx - 100, canvas.height - 120);
  ctx.fillText('⚗️', cx + 100, canvas.height - 110);
  ctx.fillText('🔬', cx, canvas.height - 100);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, 50);

  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${lab.name} - Nível ${exp.level}`, cx, 32);

  // Área do problema
  if (exp.result === null) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    roundRect(20, 70, canvas.width - 40, 200, 15);
    ctx.fill();

    ctx.strokeStyle = lab.color;
    ctx.lineWidth = 2;
    roundRect(20, 70, canvas.width - 40, 200, 15);
    ctx.stroke();

    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';

    const lines = exp.problem.question.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, cx, 110 + i * 25);
    });

    // Opções
    const optY = 180;
    exp.problem.options.forEach((opt, i) => {
      const x = cx - 80 + (i % 2) * 160;
      const y = optY + Math.floor(i / 2) * 45;

      const selected = exp.selectedOption === i;

      ctx.fillStyle = selected ? lab.color : '#2a2a5e';
      roundRect(x - 75, y - 15, 150, 35, 8);
      ctx.fill();

      if (selected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        roundRect(x - 75, y - 15, 150, 35, 8);
        ctx.stroke();
      }

      ctx.font = '14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(String(opt), x, y + 5);

      gameState.clickAreas.push({
        x: x - 75, y: y - 15, w: 150, h: 35,
        action: () => selectAnswer(i)
      });
    });
  } else {
    // Resultado
    ctx.fillStyle = exp.result === 'correct' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(255, 107, 107, 0.9)';
    roundRect(20, 70, canvas.width - 40, 200, 15);
    ctx.fill();

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(exp.result === 'correct' ? '✅' : '❌', cx, 150);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(exp.result === 'correct' ? 'CORRETO!' : 'ERRADO!', cx, 200);

    if (exp.result === 'wrong') {
      ctx.font = '14px Arial';
      ctx.fillText(`Resposta: ${exp.problem.answer}`, cx, 235);
    }
  }
}

function selectAnswer(index) {
  const exp = gameState.experiment;
  if (exp.result !== null) return;

  exp.selectedOption = index;
  const correct = index === exp.problem.correctIndex;

  if (correct) {
    exp.result = 'correct';
    exp.streak++;
    createParticles(canvas.width / 2, 150, '#00ff88', 15);

    // Recompensas
    const player = gameState.player;
    const xpGain = 20 + gameState.currentLevel * 2;
    const coinGain = 5 + Math.floor(gameState.currentLevel / 5);

    player.xp += xpGain;
    player.coins += coinGain;
    player.stats.experiments++;

    if (exp.streak >= 5) player.stats.perfect++;

    // Level up
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.floor(player.xpToNext * 1.15);
    }

    // Progresso
    const lab = gameState.currentLab;
    if (!player.progress[lab.id]) {
      player.progress[lab.id] = { completed: 0, stars: {} };
    }
    if (gameState.currentLevel > player.progress[lab.id].completed) {
      player.progress[lab.id].completed = gameState.currentLevel;
    }

    savePlayer();

    setTimeout(() => {
      if (gameState.currentLevel < gameState.currentLab.levels) {
        startExperiment(gameState.currentLevel + 1);
      } else {
        gameState.screen = 'labs';
      }
    }, 1500);
  } else {
    exp.result = 'wrong';
    exp.streak = 0;
    createParticles(canvas.width / 2, 150, '#ff6b6b', 10);

    setTimeout(() => {
      exp.result = null;
      exp.selectedOption = null;
      exp.problem = ChemistryProblems.generate(gameState.currentLab.id, gameState.currentLevel);
    }, 2000);
  }
}

function renderPeriodicTable() {
  const cx = canvas.width / 2;

  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => gameState.screen = 'menu');

  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('📊 TABELA PERIÓDICA', cx, 40);

  // Elementos em grid simplificado
  const cellSize = Math.min((canvas.width - 40) / 10, 40);
  const startX = (canvas.width - 10 * cellSize) / 2;
  const startY = 80;

  GameData.elements.forEach((el, i) => {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = startX + col * cellSize;
    const y = startY + row * cellSize;

    const learned = gameState.player.stats.elementsLearned.includes(el.symbol);

    ctx.fillStyle = learned ? el.color : '#2a2a4e';
    roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 5);
    ctx.fill();

    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = learned ? '#fff' : '#555';
    ctx.fillText(el.symbol, x + cellSize/2, y + cellSize/2 + 5);

    gameState.clickAreas.push({
      x, y, w: cellSize, h: cellSize,
      action: () => showElementInfo(el)
    });
  });

  // Legenda
  const categories = [
    { name: 'Não-metal', color: '#ff6b6b' },
    { name: 'Metal Alcalino', color: '#ff9f43' },
    { name: 'Gás Nobre', color: '#ffd93d' },
    { name: 'Halogênio', color: '#00b894' },
    { name: 'Metal de Transição', color: '#d63031' }
  ];

  ctx.font = '10px Arial';
  categories.forEach((cat, i) => {
    const x = 20 + (i % 3) * 120;
    const y = canvas.height - 60 + Math.floor(i / 3) * 20;

    ctx.fillStyle = cat.color;
    ctx.fillRect(x, y, 12, 12);

    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText(cat.name, x + 18, y + 10);
  });
}

function showElementInfo(element) {
  const player = gameState.player;
  if (!player.stats.elementsLearned.includes(element.symbol)) {
    player.stats.elementsLearned.push(element.symbol);
    savePlayer();
  }

  alert(`${element.name} (${element.symbol})\nNúmero Atômico: ${element.number}\nMassa Atômica: ${element.mass}\nCategoria: ${element.category}`);
}

function renderShop() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => gameState.screen = 'menu');

  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('🛒 LOJA', cx, 40);

  ctx.textAlign = 'right';
  ctx.font = '16px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`💰 ${player.coins}`, canvas.width - 20, 40);

  // Items
  const items = [...GameData.equipment, ...GameData.labCoats];
  const startY = 80;

  items.forEach((item, i) => {
    const y = startY + i * 65;
    if (y > canvas.height - 50) return;

    const owned = player.equipment?.includes(item.id) || player.unlockedCoats?.includes(item.id);

    ctx.fillStyle = owned ? '#00ff8830' : '#2a2a4e';
    roundRect(20, y, canvas.width - 40, 55, 10);
    ctx.fill();

    ctx.font = '28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.icon, 35, y + 38);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(item.name, 80, y + 30);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText(item.color ? 'Jaleco' : 'Equipamento', 80, y + 45);

    ctx.textAlign = 'right';
    if (owned) {
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('ADQUIRIDO', canvas.width - 40, y + 35);
    } else if (item.price > 0) {
      drawButton(canvas.width - 70, y + 28, 60, 25, `💰${item.price}`,
        player.coins >= item.price ? '#FF9800' : '#666',
        () => {
          if (player.coins >= item.price) {
            player.coins -= item.price;
            if (item.color) {
              player.unlockedCoats.push(item.id);
            } else {
              player.equipment.push(item.id);
            }
            savePlayer();
          }
        });
    }
  });
}

function renderProfile() {
  const cx = canvas.width / 2;
  const player = gameState.player;

  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, 60);

  drawButton(50, 30, 80, 35, '← Menu', '#666', () => gameState.screen = 'menu');

  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('📈 PERFIL', cx, 40);

  // Avatar
  ctx.font = '80px Arial';
  ctx.fillText('👨‍🔬', cx, 140);

  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(player.name, cx, 180);

  ctx.font = '16px Arial';
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`Nível ${player.level}`, cx, 205);

  // Stats
  const stats = [
    { label: 'Experimentos', value: player.stats.experiments, icon: '🧪' },
    { label: 'Perfeitos', value: player.stats.perfect, icon: '✨' },
    { label: 'Elementos', value: player.stats.elementsLearned.length, icon: '📊' },
    { label: 'Reações', value: player.stats.reactionsCompleted, icon: '💥' }
  ];

  stats.forEach((stat, i) => {
    const x = 30 + (i % 2) * (canvas.width / 2 - 20);
    const y = 240 + Math.floor(i / 2) * 60;

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(x, y, canvas.width / 2 - 40, 50, 10);
    ctx.fill();

    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(stat.icon, x + 15, y + 35);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText(stat.label, x + 55, y + 22);

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(String(stat.value), x + 55, y + 42);
  });
}

// ==================== FUNÇÕES AUXILIARES ====================
function drawButton(x, y, w, h, text, color, action) {
  ctx.fillStyle = color;
  roundRect(x - w/2, y - h/2, w, h, h/4);
  ctx.fill();

  ctx.font = `bold ${Math.min(h * 0.45, 14)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(text, x, y + 4);

  gameState.clickAreas.push({ x: x - w/2, y: y - h/2, w, h, action });
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

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    gameState.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      color,
      size: Math.random() * 6 + 2
    });
  }
}

function renderParticles() {
  gameState.particles = gameState.particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= 0.025;

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

function renderBubbles() {
  gameState.bubbles = gameState.bubbles.filter(b => {
    b.y -= b.speed;
    b.x += Math.sin(b.y / 30) * 0.5;

    if (b.y < -30) return false;

    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    return true;
  });
}

// ==================== INPUT ====================
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (const area of gameState.clickAreas) {
    if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) {
      area.action();
      break;
    }
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  for (const area of gameState.clickAreas) {
    if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) {
      area.action();
      break;
    }
  }
});

// Scroll
canvas.addEventListener('wheel', (e) => {
  if (gameState.screen === 'labs') {
    gameState.labScroll = Math.max(0, (gameState.labScroll || 0) + e.deltaY);
  } else if (gameState.screen === 'levels') {
    gameState.levelScroll = Math.max(0, (gameState.levelScroll || 0) + e.deltaY);
  }
});

// ==================== GAME LOOP ====================
function gameLoop() {
  gameState.clickAreas = [];
  render();
  requestAnimationFrame(gameLoop);
}

// Iniciar
setTimeout(() => {
  document.getElementById('loading').classList.add('hidden');
  gameLoop();
}, 1500);
