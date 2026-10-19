/*  ============================================================
    Geopolitica Mundial - Quiz Educativo de Geopolitica
    Jogo completo em Canvas para 8o/9o ano - Geografia
    ============================================================ */

// ── Canvas & contexto ──────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ── Audio (Web Audio API) ──────────────────────────────────────
let audioCtx = null;
function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playTone(freq, dur, type, vol) {
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.value = vol || 0.15;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
}
function sfxCorrect() { playTone(523, 0.15, 'sine', 0.18); setTimeout(() => playTone(659, 0.15, 'sine', 0.18), 100); setTimeout(() => playTone(784, 0.25, 'sine', 0.18), 200); }
function sfxWrong() { playTone(200, 0.3, 'sawtooth', 0.12); setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.12), 150); }
function sfxClick() { playTone(880, 0.06, 'square', 0.08); }
function sfxRoundComplete() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.15), i*120)); }
function sfxGameOver() { [400,350,300,200].forEach((f,i) => setTimeout(() => playTone(f, 0.3, 'sawtooth', 0.1), i*200)); }
function sfxVictory() { [523,659,784,1047,784,1047,1318].forEach((f,i) => setTimeout(() => playTone(f, 0.25, 'sine', 0.15), i*140)); }

// ── Particulas ─────────────────────────────────────────────────
let particles = [];
class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.life = 1;
        this.decay = 0.015 + Math.random() * 0.02;
        this.size = 2 + Math.random() * 4;
        this.color = color;
    }
    update() { this.x += this.vx; this.y += this.vy; this.vy += 0.12; this.life -= this.decay; }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    }
}
function spawnParticles(x, y, color, n) {
    for (let i = 0; i < (n || 20); i++) particles.push(new Particle(x, y, color));
}

// ── Estrelas de fundo ──────────────────────────────────────────
const stars = [];
for (let i = 0; i < 120; i++) {
    stars.push({ x: Math.random(), y: Math.random(), s: Math.random() * 2 + 0.5, b: Math.random() });
}
function drawStars() {
    stars.forEach(s => {
        s.b += 0.005 * (Math.random() > 0.5 ? 1 : -1);
        s.b = Math.max(0.2, Math.min(1, s.b));
        ctx.globalAlpha = s.b * 0.6;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// ── Continentes (formas simplificadas para mapa) ───────────────
const continentPaths = {
    'America': (cx, cy, sc) => {
        ctx.beginPath();
        // America do Norte
        ctx.moveTo(cx - 40*sc, cy - 60*sc);
        ctx.lineTo(cx - 10*sc, cy - 80*sc);
        ctx.lineTo(cx + 20*sc, cy - 70*sc);
        ctx.lineTo(cx + 15*sc, cy - 40*sc);
        ctx.lineTo(cx + 5*sc, cy - 20*sc);
        // America Central
        ctx.lineTo(cx - 5*sc, cy - 10*sc);
        ctx.lineTo(cx - 10*sc, cy + 5*sc);
        // America do Sul
        ctx.lineTo(cx + 10*sc, cy + 20*sc);
        ctx.lineTo(cx + 15*sc, cy + 50*sc);
        ctx.lineTo(cx + 5*sc, cy + 70*sc);
        ctx.lineTo(cx - 10*sc, cy + 60*sc);
        ctx.lineTo(cx - 20*sc, cy + 30*sc);
        ctx.lineTo(cx - 25*sc, cy + 10*sc);
        ctx.lineTo(cx - 35*sc, cy - 10*sc);
        ctx.lineTo(cx - 45*sc, cy - 30*sc);
        ctx.closePath();
    },
    'Europa': (cx, cy, sc) => {
        ctx.beginPath();
        ctx.moveTo(cx - 20*sc, cy - 40*sc);
        ctx.lineTo(cx + 10*sc, cy - 45*sc);
        ctx.lineTo(cx + 30*sc, cy - 35*sc);
        ctx.lineTo(cx + 25*sc, cy - 15*sc);
        ctx.lineTo(cx + 30*sc, cy + 5*sc);
        ctx.lineTo(cx + 15*sc, cy + 15*sc);
        ctx.lineTo(cx - 5*sc, cy + 20*sc);
        ctx.lineTo(cx - 15*sc, cy + 10*sc);
        ctx.lineTo(cx - 25*sc, cy - 5*sc);
        ctx.lineTo(cx - 30*sc, cy - 20*sc);
        ctx.closePath();
    },
    'Asia': (cx, cy, sc) => {
        ctx.beginPath();
        ctx.moveTo(cx - 40*sc, cy - 50*sc);
        ctx.lineTo(cx + 10*sc, cy - 55*sc);
        ctx.lineTo(cx + 45*sc, cy - 40*sc);
        ctx.lineTo(cx + 50*sc, cy - 15*sc);
        ctx.lineTo(cx + 40*sc, cy + 10*sc);
        ctx.lineTo(cx + 20*sc, cy + 30*sc);
        ctx.lineTo(cx - 5*sc, cy + 35*sc);
        ctx.lineTo(cx - 25*sc, cy + 20*sc);
        ctx.lineTo(cx - 40*sc, cy + 5*sc);
        ctx.lineTo(cx - 45*sc, cy - 20*sc);
        ctx.closePath();
    },
    'Africa': (cx, cy, sc) => {
        ctx.beginPath();
        ctx.moveTo(cx - 15*sc, cy - 40*sc);
        ctx.lineTo(cx + 15*sc, cy - 35*sc);
        ctx.lineTo(cx + 25*sc, cy - 15*sc);
        ctx.lineTo(cx + 20*sc, cy + 15*sc);
        ctx.lineTo(cx + 10*sc, cy + 40*sc);
        ctx.lineTo(cx - 5*sc, cy + 45*sc);
        ctx.lineTo(cx - 15*sc, cy + 30*sc);
        ctx.lineTo(cx - 25*sc, cy + 5*sc);
        ctx.lineTo(cx - 20*sc, cy - 20*sc);
        ctx.closePath();
    },
    'Oceania': (cx, cy, sc) => {
        ctx.beginPath();
        ctx.moveTo(cx - 30*sc, cy - 15*sc);
        ctx.lineTo(cx + 5*sc, cy - 20*sc);
        ctx.lineTo(cx + 30*sc, cy - 10*sc);
        ctx.lineTo(cx + 25*sc, cy + 10*sc);
        ctx.lineTo(cx + 5*sc, cy + 20*sc);
        ctx.lineTo(cx - 20*sc, cy + 15*sc);
        ctx.lineTo(cx - 30*sc, cy + 5*sc);
        ctx.closePath();
    }
};

// posicoes dos continentes no minimapa
const continentMapPositions = {
    'America':  { rx: 0.22, ry: 0.45 },
    'Europa':   { rx: 0.48, ry: 0.30 },
    'Africa':   { rx: 0.48, ry: 0.58 },
    'Asia':     { rx: 0.68, ry: 0.35 },
    'Oceania':  { rx: 0.78, ry: 0.65 },
    'Global':   { rx: 0.50, ry: 0.50 }
};

const continentColors = {
    'America': '#22c55e',
    'Europa': '#3b82f6',
    'Asia': '#f59e0b',
    'Africa': '#ef4444',
    'Oceania': '#a855f7',
    'Global': '#06b6d4'
};

// ── Bandeiras simplificadas (desenho canvas) ───────────────────
function drawFlag(country, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    const s = h / 3; // stripe height
    switch(country) {
        case 'Brasil':
            ctx.fillStyle = '#009c3b'; ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#ffdf00';
            ctx.beginPath();
            ctx.moveTo(x + w*0.5, y + 2);
            ctx.lineTo(x + w - 4, y + h*0.5);
            ctx.lineTo(x + w*0.5, y + h - 2);
            ctx.lineTo(x + 4, y + h*0.5);
            ctx.fill();
            ctx.fillStyle = '#002776';
            ctx.beginPath(); ctx.arc(x+w*0.5, y+h*0.5, h*0.22, 0, Math.PI*2); ctx.fill();
            break;
        case 'Argentina':
            ctx.fillStyle = '#74acdf'; ctx.fillRect(x, y, w, s);
            ctx.fillStyle = '#fff'; ctx.fillRect(x, y+s, w, s);
            ctx.fillStyle = '#74acdf'; ctx.fillRect(x, y+2*s, w, s);
            ctx.fillStyle = '#f6b40e';
            ctx.beginPath(); ctx.arc(x+w*0.5, y+h*0.5, h*0.13, 0, Math.PI*2); ctx.fill();
            break;
        case 'EUA':
            for(let i=0;i<13;i++){
                ctx.fillStyle = i%2===0?'#b22234':'#fff';
                ctx.fillRect(x, y+i*(h/13), w, h/13);
            }
            ctx.fillStyle = '#3c3b6e'; ctx.fillRect(x, y, w*0.4, h*0.54);
            break;
        case 'Franca':
            ctx.fillStyle = '#002395'; ctx.fillRect(x, y, w/3, h);
            ctx.fillStyle = '#fff'; ctx.fillRect(x+w/3, y, w/3, h);
            ctx.fillStyle = '#ed2939'; ctx.fillRect(x+2*w/3, y, w/3, h);
            break;
        case 'Alemanha':
            ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, s);
            ctx.fillStyle = '#dd0000'; ctx.fillRect(x, y+s, w, s);
            ctx.fillStyle = '#ffce00'; ctx.fillRect(x, y+2*s, w, s);
            break;
        case 'Japao':
            ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#bc002d';
            ctx.beginPath(); ctx.arc(x+w*0.5, y+h*0.5, h*0.28, 0, Math.PI*2); ctx.fill();
            break;
        case 'China':
            ctx.fillStyle = '#de2910'; ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#ffde00';
            ctx.beginPath(); ctx.arc(x+w*0.22, y+h*0.3, h*0.15, 0, Math.PI*2); ctx.fill();
            break;
        case 'Russia':
            ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, s);
            ctx.fillStyle = '#0039a6'; ctx.fillRect(x, y+s, w, s);
            ctx.fillStyle = '#d52b1e'; ctx.fillRect(x, y+2*s, w, s);
            break;
        case 'Africa do Sul':
            ctx.fillStyle = '#007a4d'; ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#de3831'; ctx.fillRect(x, y, w, h*0.33);
            ctx.fillStyle = '#002395'; ctx.fillRect(x, y+h*0.67, w, h*0.33);
            ctx.fillStyle = '#ffb612';
            ctx.beginPath();
            ctx.moveTo(x, y); ctx.lineTo(x+w*0.35, y+h*0.5); ctx.lineTo(x, y+h);
            ctx.fill();
            break;
        case 'Australia':
            ctx.fillStyle = '#00008b'; ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x+w*0.2, y+h*0.3, h*0.12, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+w*0.7, y+h*0.6, h*0.07, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(x, y, w*0.45, h*0.03);
            ctx.fillRect(x+w*0.2, y, w*0.03, h*0.5);
            break;
        default:
            ctx.fillStyle = '#555'; ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#fff'; ctx.font = `${h*0.3}px sans-serif`; ctx.textAlign = 'center';
            ctx.fillText('?', x+w*0.5, y+h*0.6);
            break;
    }
    ctx.restore();
}

// ── Banco de Perguntas ─────────────────────────────────────────
const questionBank = {
    'America': [
        { q:'Qual e a capital dos Estados Unidos?', opts:['Washington D.C.','Nova York','Los Angeles','Chicago'], ans:0, info:'Washington D.C. e a capital federal desde 1790.' },
        { q:'Qual organizacao economica integra Brasil, Argentina, Uruguai e Paraguai?', opts:['NAFTA','MERCOSUL','ALCA','UNASUL'], ans:1, info:'O MERCOSUL foi fundado em 1991 pelo Tratado de Assuncao.' },
        { q:'Qual e o pais mais populoso da America do Sul?', opts:['Colombia','Argentina','Brasil','Peru'], ans:2, info:'O Brasil tem mais de 210 milhoes de habitantes.' },
        { q:'Qual e a capital do Mexico?', opts:['Guadalajara','Cancun','Cidade do Mexico','Monterrey'], ans:2, info:'A Cidade do Mexico e uma das maiores metropoles do mundo.' },
        { q:'Qual pais das Americas tem a maior economia (PIB)?', opts:['Canada','Brasil','Mexico','Estados Unidos'], ans:3, info:'Os EUA possuem o maior PIB nominal do mundo.' },
        { q:'Qual e a capital do Canada?', opts:['Toronto','Vancouver','Ottawa','Montreal'], ans:2, info:'Ottawa e a capital, nao Toronto como muitos pensam.' },
        { q:'O Canal do Panama conecta quais oceanos?', opts:['Atlantico e Pacifico','Atlantico e Indico','Pacifico e Artico','Indico e Pacifico'], ans:0, info:'O Canal do Panama foi inaugurado em 1914.' },
        { q:'Qual pais sul-americano nao tem saida para o mar?', opts:['Uruguai','Paraguai','Equador','Chile'], ans:1, info:'Bolivia e Paraguai sao os dois paises sem litoral na America do Sul.' },
        { q:'Qual e a moeda oficial da Argentina?', opts:['Real','Dolar','Peso argentino','Bolivar'], ans:2, info:'O peso argentino e a moeda nacional desde 1992.' },
        { q:'A bandeira abaixo pertence a qual pais?', opts:['Colombia','Brasil','Bolivia','Venezuela'], ans:1, flag:'Brasil', info:'A bandeira do Brasil traz o lema Ordem e Progresso.' },
    ],
    'Europa': [
        { q:'Qual e a capital da Franca?', opts:['Lyon','Marselha','Paris','Nice'], ans:2, info:'Paris e a Cidade Luz, capital desde a Idade Media.' },
        { q:'Quantos paises fazem parte da Uniao Europeia (aprox.)?', opts:['15','27','35','50'], ans:1, info:'A UE possui 27 membros apos a saida do Reino Unido (Brexit).' },
        { q:'Qual e a moeda oficial da zona do euro?', opts:['Libra','Franco','Euro','Marco'], ans:2, info:'O Euro entrou em circulacao em 2002.' },
        { q:'A OTAN (NATO) e uma organizacao de que tipo?', opts:['Economica','Cultural','Militar','Ambiental'], ans:2, info:'A OTAN e uma alianca militar criada em 1949.' },
        { q:'Qual pais europeu tem a maior populacao?', opts:['Franca','Alemanha','Italia','Espanha'], ans:1, info:'A Alemanha tem cerca de 84 milhoes de habitantes.' },
        { q:'De qual pais e esta bandeira?', opts:['Italia','Irlanda','Franca','Belgica'], ans:2, flag:'Franca', info:'A bandeira tricolor francesa e simbolo da Revolucao.' },
        { q:'Qual e a capital da Alemanha?', opts:['Munique','Berlim','Frankfurt','Hamburgo'], ans:1, info:'Berlim e capital e maior cidade da Alemanha.' },
        { q:'O Brexit foi a saida de qual pais da UE?', opts:['Irlanda','Escocia','Franca','Reino Unido'], ans:3, info:'O Brexit foi concretizado em 31 de janeiro de 2020.' },
        { q:'Qual pais europeu e o maior em area territorial?', opts:['Franca','Ucrania','Alemanha','Espanha'], ans:1, info:'A Ucrania e o maior pais inteiramente na Europa.' },
        { q:'De qual pais e esta bandeira?', opts:['Austria','Belgica','Alemanha','Holanda'], ans:2, flag:'Alemanha', info:'Preto, vermelho e dourado: cores da bandeira alema.' },
    ],
    'Asia': [
        { q:'Qual e o pais mais populoso do mundo?', opts:['India','China','Indonesia','Paquistao'], ans:0, info:'A India ultrapassou a China em populacao em 2023.' },
        { q:'Qual e a capital do Japao?', opts:['Osaka','Quioto','Toquio','Nagoia'], ans:2, info:'Toquio e a maior area metropolitana do planeta.' },
        { q:'Qual organizacao reune paises do Sudeste Asiatico?', opts:['OPEP','ASEAN','G7','BRICS'], ans:1, info:'A ASEAN foi fundada em 1967 com 10 membros atuais.' },
        { q:'Qual pais asiatico tem a segunda maior economia do mundo?', opts:['Japao','India','Coreia do Sul','China'], ans:3, info:'A China e a segunda maior economia em PIB nominal.' },
        { q:'De qual pais e esta bandeira com circulo vermelho?', opts:['Coreia do Sul','China','Japao','Vietnam'], ans:2, flag:'Japao', info:'A bandeira do Japao representa o sol nascente.' },
        { q:'Qual e a capital da Russia?', opts:['Sao Petersburgo','Moscou','Novosibirsk','Vladivostok'], ans:1, info:'Moscou e a maior cidade da Europa.' },
        { q:'De qual pais e esta bandeira vermelha com estrelas?', opts:['Vietnam','Coreia do Norte','China','Turquia'], ans:2, flag:'China', info:'A bandeira da China foi adotada em 1949.' },
        { q:'Qual pais asiatico e conhecido como a maior democracia do mundo?', opts:['Japao','Indonesia','India','Coreia do Sul'], ans:2, info:'A India tem mais de 1,4 bilhao de habitantes.' },
        { q:'O conflito Israel-Palestina ocorre em qual regiao?', opts:['Sul da Asia','Sudeste Asiatico','Oriente Medio','Asia Central'], ans:2, info:'O Oriente Medio e palco de diversos conflitos geopoliticos.' },
        { q:'De qual pais e esta bandeira?', opts:['Russia','Holanda','Luxemburgo','Franca'], ans:0, flag:'Russia', info:'Branco, azul e vermelho: a tricolor russa.' },
    ],
    'Africa': [
        { q:'Qual e o pais mais populoso da Africa?', opts:['Etiopia','Egito','Nigeria','Africa do Sul'], ans:2, info:'A Nigeria tem mais de 220 milhoes de habitantes.' },
        { q:'Qual e a capital da Africa do Sul (executiva)?', opts:['Joanesburgo','Pretoria','Cidade do Cabo','Durban'], ans:1, info:'A Africa do Sul tem 3 capitais; Pretoria e a executiva.' },
        { q:'Qual organizacao reune os paises africanos?', opts:['Liga Arabe','Uniao Africana','SADC','ECOWAS'], ans:1, info:'A Uniao Africana foi fundada em 2002, sucedendo a OUA.' },
        { q:'Qual recurso natural e a principal riqueza da Nigeria?', opts:['Ouro','Diamantes','Petroleo','Cobre'], ans:2, info:'A Nigeria e um dos maiores produtores de petroleo da Africa.' },
        { q:'Qual e o maior deserto do mundo, localizado na Africa?', opts:['Kalahari','Namibe','Saara','Gobi'], ans:2, info:'O Saara cobre cerca de 9 milhoes de km2.' },
        { q:'De qual pais e esta bandeira colorida?', opts:['Quenia','Nigeria','Africa do Sul','Gana'], ans:2, flag:'Africa do Sul', info:'A bandeira sul-africana tem 6 cores, simbolizando diversidade.' },
        { q:'O Apartheid foi um sistema de segregacao racial em qual pais?', opts:['Quenia','Congo','Nigeria','Africa do Sul'], ans:3, info:'O Apartheid durou de 1948 a 1994.' },
        { q:'Qual lago africano e o segundo maior lago de agua doce do mundo?', opts:['Lago Vitoria','Lago Tanganica','Lago Malawi','Lago Chade'], ans:0, info:'O Lago Vitoria e compartilhado por 3 paises.' },
        { q:'Qual rio africano e o mais longo do mundo?', opts:['Congo','Zambeze','Niger','Nilo'], ans:3, info:'O Nilo tem aproximadamente 6.650 km de extensao.' },
        { q:'Qual pais africano nunca foi colonizado por europeus?', opts:['Ghana','Etiopia','Congo','Nigeria'], ans:1, info:'A Etiopia resistiu a colonizacao europeia.' },
    ],
    'Oceania': [
        { q:'Qual e a capital da Australia?', opts:['Sydney','Melbourne','Camberra','Brisbane'], ans:2, info:'Camberra foi planejada para ser a capital em 1913.' },
        { q:'Qual e o menor pais da Oceania em populacao?', opts:['Tonga','Palau','Nauru','Tuvalu'], ans:3, info:'Tuvalu tem cerca de 11 mil habitantes.' },
        { q:'De qual pais e esta bandeira com fundo azul escuro?', opts:['Nova Zelandia','Fiji','Australia','Tonga'], ans:2, flag:'Australia', info:'A bandeira da Australia traz a Union Jack e estrelas.' },
        { q:'Qual e a capital da Nova Zelandia?', opts:['Auckland','Wellington','Christchurch','Hamilton'], ans:1, info:'Wellington e a capital, Auckland e a maior cidade.' },
        { q:'A Australia faz parte de qual grupo economico?', opts:['ASEAN','G20','OPEP','MERCOSUL'], ans:1, info:'A Australia e membro do G20 desde sua fundacao.' },
        { q:'Qual e o maior pais da Oceania em area?', opts:['Nova Zelandia','Papua Nova Guine','Australia','Fiji'], ans:2, info:'A Australia e um pais-continente com 7,7 milhoes de km2.' },
        { q:'Qual recurso natural e muito importante para a economia australiana?', opts:['Petroleo','Ferro e minerios','Prata','Cafe'], ans:1, info:'A Australia e grande exportadora de minerio de ferro e carvao.' },
        { q:'Qual oceano banha a Oceania?', opts:['Atlantico','Indico','Artico','Pacifico'], ans:3, info:'O Oceano Pacifico e o maior oceano do mundo.' },
        { q:'A Nova Zelandia e formada por quantas ilhas principais?', opts:['Uma','Duas','Tres','Quatro'], ans:1, info:'Ilha Norte e Ilha Sul sao as duas principais.' },
        { q:'Qual esporte e extremamente popular na Nova Zelandia?', opts:['Futebol','Beisebol','Rugby','Hoquei'], ans:2, info:'Os All Blacks sao a famosa selecao de rugby da Nova Zelandia.' },
    ],
    'Global': [
        { q:'Quantos paises-membros a ONU possui (aprox.)?', opts:['150','170','193','210'], ans:2, info:'A ONU foi fundada em 1945 com 193 membros atuais.' },
        { q:'Qual e o orgao maximo de seguranca da ONU?', opts:['Assembleia Geral','Conselho de Seguranca','Corte Internacional','UNESCO'], ans:1, info:'O Conselho de Seguranca tem 5 membros permanentes com poder de veto.' },
        { q:'Quais sao os 5 membros permanentes do Conselho de Seguranca da ONU?', opts:['EUA, Russia, China, Franca, Reino Unido','EUA, Alemanha, Japao, India, Brasil','EUA, Russia, China, India, Brasil','EUA, Franca, Alemanha, Italia, Japao'], ans:0, info:'Os P5 possuem poder de veto nas decisoes do Conselho.' },
        { q:'O que significa BRICS?', opts:['Brasil, Russia, Irlanda, China, Suecia','Brasil, Russia, India, China, Africa do Sul','Bolivia, Russia, India, Chile, Suica','Brasil, Romenia, Indonesia, Cuba, Senegal'], ans:1, info:'Os BRICS representam importantes economias emergentes.' },
        { q:'Qual e a organizacao que regula o comercio internacional?', opts:['FMI','Banco Mundial','OMC','OCDE'], ans:2, info:'A OMC (Organizacao Mundial do Comercio) tem sede em Genebra.' },
        { q:'O Protocolo de Quioto trata de qual tema?', opts:['Comercio','Direitos humanos','Mudancas climaticas','Seguranca nuclear'], ans:2, info:'O Protocolo de Quioto (1997) visa reduzir emissoes de gases.' },
        { q:'Qual conflito geopolitico envolveu a divisao de um pais em Norte e Sul?', opts:['Siria','Libia','Coreia','Iraque'], ans:2, info:'A Coreia esta dividida desde 1953 entre Norte e Sul.' },
        { q:'O que e a OPEP?', opts:['Organizacao de paises produtores de petroleo','Organizacao para paz europeia','Orgao de protecao ecologica','Ordem de paises emergentes'], ans:0, info:'A OPEP controla grande parte da producao mundial de petroleo.' },
        { q:'A Primavera Arabe (2011) ocorreu principalmente em qual regiao?', opts:['America Latina','Europa Oriental','Oriente Medio e Norte da Africa','Sudeste Asiatico'], ans:2, info:'A Primavera Arabe foi uma onda de protestos por democracia.' },
        { q:'Qual organizacao internacional cuida da saude global?', opts:['UNICEF','OMS','FAO','FMI'], ans:1, info:'A OMS (Organizacao Mundial da Saude) coordena respostas a pandemias.' },
    ]
};

const rounds = ['America', 'Europa', 'Asia', 'Africa', 'Oceania', 'Global'];
const QUESTIONS_PER_ROUND = 5;

// ── Estado do Jogo ─────────────────────────────────────────────
let state = 'menu'; // menu, playing, feedback, roundEnd, victory, gameover
let currentRound = 0;
let currentQuestion = 0;
let score = 0;
let lives = 3;
let streak = 0;
let bestStreak = 0;
let coins = 0;
let selectedAnswer = -1;
let feedbackTimer = 0;
let roundQuestions = [];
let roundScore = 0;
let animTimer = 0;
let hoverBtn = -1;
let shakeTimer = 0;
let shakeIntensity = 0;
let floatingTexts = [];
let globeAngle = 0;

// ── Botoes ─────────────────────────────────────────────────────
let buttons = [];

function makeOptionButtons() {
    buttons = [];
    const q = roundQuestions[currentQuestion];
    if (!q) return;
    const bw = Math.min(W * 0.85, 500);
    const bh = 50;
    const gap = 12;
    const startY = H * 0.52;
    const sx = (W - bw) / 2;
    q.opts.forEach((opt, i) => {
        buttons.push({ x: sx, y: startY + i * (bh + gap), w: bw, h: bh, text: opt, idx: i });
    });
}

function makeMenuButton() {
    const bw = 220; const bh = 55;
    buttons = [{ x: (W - bw) / 2, y: H * 0.65, w: bw, h: bh, text: 'INICIAR JOGO', idx: 'start' }];
}

function makeEndButtons() {
    const bw = 220; const bh = 50;
    buttons = [{ x: (W - bw) / 2, y: H * 0.72, w: bw, h: bh, text: 'JOGAR NOVAMENTE', idx: 'restart' }];
}

function makeContinueButton() {
    const bw = 200; const bh = 50;
    buttons = [{ x: (W - bw) / 2, y: H * 0.78, w: bw, h: bh, text: 'CONTINUAR', idx: 'continue' }];
}

// ── Preparar rodada ────────────────────────────────────────────
function prepareRound() {
    const bank = questionBank[rounds[currentRound]];
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    roundQuestions = shuffled.slice(0, QUESTIONS_PER_ROUND);
    currentQuestion = 0;
    roundScore = 0;
    selectedAnswer = -1;
    state = 'playing';
    makeOptionButtons();
}

function startGame() {
    currentRound = 0;
    score = 0;
    lives = 3;
    streak = 0;
    bestStreak = 0;
    coins = 0;
    prepareRound();
}

// ── Desenho do Mapa Mundi simplificado ─────────────────────────
function drawMiniMap(mapX, mapY, mapW, mapH, activeContinent) {
    // fundo do mapa
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    roundRect(mapX, mapY, mapW, mapH, 10, true, true);

    const sc = mapW / 320;
    Object.entries(continentPaths).forEach(([name, pathFn]) => {
        const pos = continentMapPositions[name];
        const cx = mapX + pos.rx * mapW;
        const cy = mapY + pos.ry * mapH;
        pathFn(cx, cy, sc);
        const isActive = name === activeContinent;
        ctx.fillStyle = isActive ? continentColors[name] : 'rgba(100,116,139,0.4)';
        ctx.fill();
        if (isActive) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // label
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${12 * sc}px sans-serif`;
    ctx.textAlign = 'center';
    const activePos = continentMapPositions[activeContinent];
    if (activeContinent !== 'Global' && activePos) {
        ctx.fillText(activeContinent, mapX + activePos.rx * mapW, mapY + activePos.ry * mapH - 25 * sc);
    }
}

// ── Utilidades de desenho ──────────────────────────────────────
function roundRect(x, y, w, h, r, fill, stroke) {
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
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function drawGlobe(cx, cy, r) {
    globeAngle += 0.008;
    // circulo
    const grad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, r*0.1, cx, cy, r);
    grad.addColorStop(0, '#1e40af');
    grad.addColorStop(0.6, '#1e3a8a');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    // linhas de longitude
    ctx.strokeStyle = 'rgba(59,130,246,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const angle = globeAngle + i * Math.PI / 3;
        const ew = Math.cos(angle) * r;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(ew), r, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    // linhas de latitude
    for (let i = -2; i <= 2; i++) {
        const ly = cy + i * r * 0.33;
        const lr = Math.sqrt(r*r - (i*r*0.33)*(i*r*0.33));
        ctx.beginPath();
        ctx.ellipse(cx, ly, lr, lr * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    // brilho
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.arc(cx - r*0.25, cy - r*0.25, r*0.55, 0, Math.PI*2); ctx.fill();
}

// ── Textos flutuantes ──────────────────────────────────────────
class FloatingText {
    constructor(x, y, text, color) {
        this.x = x; this.y = y; this.text = text; this.color = color;
        this.life = 1; this.vy = -1.5;
    }
    update() { this.y += this.vy; this.life -= 0.018; }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

// ── Desenho do HUD ─────────────────────────────────────────────
function drawHUD() {
    const pad = 15;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';

    // score
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Pontos: ${score}`, pad, 30);

    // coins
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Moedas: ${coins}`, pad, 55);

    // streak
    if (streak > 1) {
        ctx.fillStyle = '#f97316';
        ctx.fillText(`Sequencia: ${streak}x`, pad, 80);
    }

    // lives
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ef4444';
    for (let i = 0; i < lives; i++) {
        ctx.fillText('\u2764', W - pad - i * 28, 30);
    }

    // round info
    ctx.textAlign = 'center';
    ctx.fillStyle = continentColors[rounds[currentRound]];
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Rodada ${currentRound + 1}/6: ${rounds[currentRound]}`, W / 2, 25);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Pergunta ${currentQuestion + 1}/${QUESTIONS_PER_ROUND}`, W / 2, 45);

    // progress bar
    const pbW = Math.min(W * 0.5, 250);
    const pbH = 6;
    const pbX = (W - pbW) / 2;
    const pbY = 52;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(pbX, pbY, pbW, pbH, 3, true, false);
    const prog = ((currentRound * QUESTIONS_PER_ROUND + currentQuestion) / (6 * QUESTIONS_PER_ROUND));
    ctx.fillStyle = continentColors[rounds[currentRound]];
    roundRect(pbX, pbY, pbW * prog, pbH, 3, true, false);
}

// ── Tela de Menu ───────────────────────────────────────────────
function drawMenu() {
    drawStars();
    drawGlobe(W / 2, H * 0.32, Math.min(W, H) * 0.18);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#3b82f6';
    ctx.font = `bold ${Math.min(W*0.08, 36)}px sans-serif`;
    ctx.fillText('Geopolitica Mundial', W / 2, H * 0.12);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `${Math.min(W*0.04, 16)}px sans-serif`;
    ctx.fillText('Quiz educativo de geopolitica para 8o e 9o ano', W / 2, H * 0.17);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px sans-serif';
    ctx.fillText('6 rodadas  |  30 perguntas  |  Capitais, economia, conflitos', W / 2, H * 0.56);
    ctx.fillText('e organizacoes internacionais', W / 2, H * 0.59);

    // botao
    buttons.forEach((b, i) => {
        const hover = hoverBtn === i;
        ctx.fillStyle = hover ? '#2563eb' : '#1d4ed8';
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        roundRect(b.x, b.y, b.w, b.h, 12, true, true);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2 + 6);
    });
}

// ── Tela de Jogo ───────────────────────────────────────────────
function drawPlaying() {
    drawStars();
    drawHUD();

    const q = roundQuestions[currentQuestion];
    if (!q) return;

    // mini mapa
    const mapW = Math.min(W * 0.35, 180);
    const mapH = mapW * 0.6;
    drawMiniMap(W - mapW - 15, 70, mapW, mapH, rounds[currentRound]);

    // pergunta
    const qY = H * 0.18;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.min(W * 0.042, 18)}px sans-serif`;
    wrapText(q.q, W / 2, qY, W * 0.85, 24);

    // bandeira se houver
    if (q.flag) {
        const fw = 80; const fh = 50;
        drawFlag(q.flag, W / 2 - fw / 2, qY + 25, fw, fh);
    }

    // opcoes
    const shakeX = shakeTimer > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;
    buttons.forEach((b, i) => {
        let bg = 'rgba(30,41,59,0.85)';
        let border = 'rgba(100,116,139,0.5)';
        let textCol = '#e2e8f0';

        if (state === 'feedback') {
            if (i === q.ans) { bg = 'rgba(34,197,94,0.3)'; border = '#22c55e'; textCol = '#22c55e'; }
            else if (i === selectedAnswer && i !== q.ans) { bg = 'rgba(239,68,68,0.3)'; border = '#ef4444'; textCol = '#ef4444'; }
        } else if (hoverBtn === i) {
            bg = 'rgba(59,130,246,0.2)'; border = '#3b82f6';
        }

        const bx = b.x + (i === selectedAnswer && state === 'feedback' && selectedAnswer !== q.ans ? shakeX : 0);
        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        roundRect(bx, b.y, b.w, b.h, 10, true, true);

        // letra
        ctx.fillStyle = border;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(String.fromCharCode(65 + i) + ')', bx + 15, b.y + b.h / 2 + 5);

        // texto
        ctx.fillStyle = textCol;
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(b.text, bx + 40, b.y + b.h / 2 + 5);
    });

    // info de feedback
    if (state === 'feedback' && q.info) {
        const iy = buttons[buttons.length-1].y + buttons[buttons.length-1].h + 20;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        wrapText(q.info, W / 2, iy, W * 0.8, 18);
    }
}

// ── Tela de Fim de Rodada ──────────────────────────────────────
function drawRoundEnd() {
    drawStars();
    ctx.textAlign = 'center';

    const color = continentColors[rounds[currentRound]];
    ctx.fillStyle = color;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`Rodada ${currentRound + 1} Completa!`, W / 2, H * 0.18);

    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(rounds[currentRound], W / 2, H * 0.25);

    // mini mapa
    const mw = Math.min(W * 0.5, 220);
    drawMiniMap((W - mw) / 2, H * 0.30, mw, mw * 0.6, rounds[currentRound]);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`+${roundScore} pontos nesta rodada`, W / 2, H * 0.65);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Total: ${score} pontos  |  Vidas: ${lives}  |  Moedas: ${coins}`, W / 2, H * 0.70);

    buttons.forEach((b, i) => {
        const hover = hoverBtn === i;
        ctx.fillStyle = hover ? color : 'rgba(30,41,59,0.9)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        roundRect(b.x, b.y, b.w, b.h, 12, true, true);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2 + 6);
    });
}

// ── Tela de Vitoria ────────────────────────────────────────────
function drawVictory() {
    drawStars();
    animTimer += 0.02;

    // confetti particles
    if (Math.random() < 0.3) {
        const colors = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];
        spawnParticles(Math.random() * W, -10, colors[Math.floor(Math.random() * colors.length)], 1);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = `bold ${32 + Math.sin(animTimer * 3) * 3}px sans-serif`;
    ctx.fillText('PARABENS!', W / 2, H * 0.15);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Voce completou o quiz!', W / 2, H * 0.23);

    drawGlobe(W / 2, H * 0.40, Math.min(W, H) * 0.13);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${score} pontos`, W / 2, H * 0.56);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Melhor sequencia: ${bestStreak}  |  Moedas: ${coins}  |  Vidas: ${lives}`, W / 2, H * 0.62);

    // ranking
    let rank = 'Iniciante';
    if (score >= 250) rank = 'Especialista em Geopolitica';
    else if (score >= 200) rank = 'Diplomata';
    else if (score >= 150) rank = 'Analista Internacional';
    else if (score >= 100) rank = 'Estudante Avancado';
    else if (score >= 50) rank = 'Estudante';

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Titulo: ${rank}`, W / 2, H * 0.67);

    buttons.forEach((b, i) => {
        const hover = hoverBtn === i;
        ctx.fillStyle = hover ? '#16a34a' : '#15803d';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        roundRect(b.x, b.y, b.w, b.h, 12, true, true);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2 + 6);
    });
}

// ── Tela de Game Over ──────────────────────────────────────────
function drawGameOver() {
    drawStars();
    animTimer += 0.02;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('FIM DE JOGO', W / 2, H * 0.18);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '18px sans-serif';
    ctx.fillText('Suas vidas acabaram!', W / 2, H * 0.26);

    ctx.fillStyle = 'rgba(239,68,68,0.15)';
    ctx.beginPath(); ctx.arc(W/2, H*0.42, 60, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.font = '50px sans-serif';
    ctx.fillText('\u2764', W / 2, H * 0.44 + 16);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W/2 - 35, H*0.42 - 35);
    ctx.lineTo(W/2 + 35, H*0.42 + 35);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${score} pontos`, W / 2, H * 0.56);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Rodada ${currentRound + 1}/6  |  Melhor sequencia: ${bestStreak}  |  Moedas: ${coins}`, W / 2, H * 0.62);

    buttons.forEach((b, i) => {
        const hover = hoverBtn === i;
        ctx.fillStyle = hover ? '#dc2626' : '#991b1b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        roundRect(b.x, b.y, b.w, b.h, 12, true, true);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2 + 6);
    });
}

// ── Wrap Text ──────────────────────────────────────────────────
function wrapText(text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    let ly = y;
    words.forEach(word => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxW && line !== '') {
            ctx.fillText(line.trim(), x, ly);
            line = word + ' ';
            ly += lineH;
        } else {
            line = test;
        }
    });
    ctx.fillText(line.trim(), x, ly);
}

// ── Loop Principal ─────────────────────────────────────────────
function update() {
    if (shakeTimer > 0) { shakeTimer--; shakeIntensity *= 0.9; }
    if (state === 'feedback') {
        feedbackTimer--;
        if (feedbackTimer <= 0) {
            currentQuestion++;
            if (currentQuestion >= QUESTIONS_PER_ROUND) {
                // fim da rodada
                if (currentRound >= rounds.length - 1) {
                    state = 'victory';
                    sfxVictory();
                    makeEndButtons();
                } else {
                    state = 'roundEnd';
                    sfxRoundComplete();
                    makeContinueButton();
                }
            } else {
                state = 'playing';
                selectedAnswer = -1;
                makeOptionButtons();
            }
        }
    }
    // atualizar particulas
    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0);
    // atualizar textos flutuantes
    floatingTexts.forEach(t => t.update());
    floatingTexts = floatingTexts.filter(t => t.life > 0);
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    // fundo gradiente
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0d0d18');
    bgGrad.addColorStop(1, '#111827');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    switch (state) {
        case 'menu': drawMenu(); break;
        case 'playing': case 'feedback': drawPlaying(); break;
        case 'roundEnd': drawRoundEnd(); break;
        case 'victory': drawVictory(); break;
        case 'gameover': drawGameOver(); break;
    }

    // particulas e textos flutuantes por cima de tudo
    particles.forEach(p => p.draw());
    floatingTexts.forEach(t => t.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ── Input ──────────────────────────────────────────────────────
function getPointer(e) {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function hitTest(px, py) {
    for (let i = 0; i < buttons.length; i++) {
        const b = buttons[i];
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return i;
    }
    return -1;
}

function handleClick(px, py) {
    ensureAudio();
    const hit = hitTest(px, py);
    if (hit < 0) return;
    const b = buttons[hit];

    if (state === 'menu' && b.idx === 'start') {
        sfxClick();
        startGame();
        return;
    }
    if ((state === 'victory' || state === 'gameover') && b.idx === 'restart') {
        sfxClick();
        state = 'menu';
        makeMenuButton();
        return;
    }
    if (state === 'roundEnd' && b.idx === 'continue') {
        sfxClick();
        currentRound++;
        prepareRound();
        return;
    }
    if (state === 'playing' && typeof b.idx === 'number') {
        sfxClick();
        selectedAnswer = b.idx;
        const q = roundQuestions[currentQuestion];
        if (b.idx === q.ans) {
            // correto
            sfxCorrect();
            streak++;
            if (streak > bestStreak) bestStreak = streak;
            const pts = 10 + Math.min(streak - 1, 5) * 2;
            score += pts;
            roundScore += pts;
            coins += 1 + Math.floor(streak / 3);
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#22c55e', 25);
            floatingTexts.push(new FloatingText(b.x + b.w / 2, b.y, `+${pts}`, '#22c55e'));
            if (streak >= 3) {
                floatingTexts.push(new FloatingText(b.x + b.w / 2, b.y - 25, `${streak}x combo!`, '#f59e0b'));
            }
        } else {
            // errado
            sfxWrong();
            streak = 0;
            lives--;
            shakeTimer = 15;
            shakeIntensity = 12;
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ef4444', 20);
            floatingTexts.push(new FloatingText(b.x + b.w / 2, b.y, '-1 vida', '#ef4444'));
            if (lives <= 0) {
                state = 'feedback';
                feedbackTimer = 90;
                setTimeout(() => { state = 'gameover'; sfxGameOver(); makeEndButtons(); }, 1800);
                return;
            }
        }
        state = 'feedback';
        feedbackTimer = 90; // ~1.5s a 60fps
    }
}

function handleMove(px, py) {
    hoverBtn = hitTest(px, py);
    canvas.style.cursor = hoverBtn >= 0 ? 'pointer' : 'default';
}

canvas.addEventListener('mousedown', e => { const p = getPointer(e); handleClick(p.x, p.y); });
canvas.addEventListener('mousemove', e => { const p = getPointer(e); handleMove(p.x, p.y); });
canvas.addEventListener('touchstart', e => { e.preventDefault(); const p = getPointer(e); handleClick(p.x, p.y); }, { passive: false });
canvas.addEventListener('touchmove', e => { e.preventDefault(); const p = getPointer(e); handleMove(p.x, p.y); }, { passive: false });

// ── Inicializacao ──────────────────────────────────────────────
window.addEventListener('load', () => {
    document.getElementById('loading').style.display = 'none';
    makeMenuButton();
    gameLoop();
});
