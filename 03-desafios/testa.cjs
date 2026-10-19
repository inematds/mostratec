// Teste dos "Desafios para quem é bom" (MOSTRATEC 2026).
// Uso: node 03-desafios/testa.cjs   (Playwright global; screenshots em 03-desafios/shots/)
// Confere:
//  - as contas do gabarito (fórmula refeita aqui, e a busca de todas as sequências do pega-e-solta);
//  - em 390x844 e 1366x800: zero pageerror, sem rolagem lateral, pagina.css carregado,
//    links internos e âncoras existem, texto dos SVGs legível, sem emoji;
//  - a resposta e a explicação NÃO aparecem em texto no HTML;
//  - em cada desafio: resposta errada não marca acerto; resposta certa (escrita de outro jeito) marca,
//    abre a explicação e entra no placar da página inicial.
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const D = require('./desafio.js');
const gabarito = require('./gabarito.cjs');

const raiz = __dirname;
const shots = path.join(raiz, 'shots');
fs.mkdirSync(shots, { recursive: true });
const paginas = ['index.html', ...gabarito.map(g => g.id + '/index.html')];
const larguras = [[390, 844], [1366, 800]];

// Jeitos diferentes de escrever a resposta certa e uma resposta errada (a pegadinha de cada um).
const VARIANTES = {
  'indice-traicoeiro': { certa: [' 31 '], errada: ['24'] },
  'frase-provavel': { certa: ['20,0', '24%'], errada: ['20', '20'] },
  'sensor-solo': { certa: ['50', '- 10', '0'], errada: ['50', '-11', '0'] },
  'graus-de-liberdade': { certa: ['5', '3', '1'], errada: ['6', '3', '0'] },
  'cinematica': { certa: ['18.0', '11'], errada: ['18', '-1'] },
  'pega-e-solta': { certa: ['C, A, E, B, F, D, E, A, F'], errada: ['ACEBFDEAF'] },
  'dados-de-treino': { certa: ['4.800', '240 000'], errada: ['4000', '200000'] },
  'no-estande': { certa: ['2', '4', '5'], errada: ['2', '5', '4'] },
};

let falhas = 0;
const falha = (m) => { falhas++; console.log('  FALHA ' + m); };

// Todas as sequências válidas mais curtas do pega-e-solta (as 4 regras da página).
function sequenciasPegaSolta() {
  const passo = (s, k) => {
    s = { ...s };
    if (k === 'A') { if (s.pan === 'frente') return null; if (s.cubo === 'garra') { if (s.alto) return null; s.cubo = s.pan === 'bandeja' ? 'bandeja' : 'mesa'; } s.aberta = true; }
    if (k === 'B') { if (!s.alto && s.pan === 'cubo' && s.cubo === 'mesa' && s.aberta) s.cubo = 'garra'; s.aberta = false; }
    if (k === 'C' || k === 'D') { if (!s.alto) return null; s.pan = k === 'C' ? 'cubo' : 'bandeja'; }
    if (k === 'E') { if (s.pan === 'cubo' && s.cubo === 'mesa' && !s.aberta) return null; s.alto = false; }
    if (k === 'F') s.alto = true;
    return s;
  };
  const sols = [];
  const vai = (s, seq) => {
    if (seq.length > 10) return;
    if (s.cubo === 'bandeja' && s.alto) { sols.push(seq); return; }
    for (const k of 'ABCDEF') { const n = passo(s, k); if (n) vai(n, seq + k); }
  };
  vai({ pan: 'frente', alto: true, aberta: false, cubo: 'mesa' }, '');
  const min = Math.min(...sols.map(x => x.length));
  return sols.filter(x => x.length === min).map(x => x.toLowerCase());
}

(async () => {
  console.log('gabarito');
  if (gabarito.length < 6 || gabarito.length > 8) falha(`${gabarito.length} desafios (pedido: 6 a 8)`);
  for (const g of gabarito) {
    if (g.confere) {
      const calc = g.confere().map(String);
      if (calc.join(';') !== g.resp.join(';')) falha(`${g.id}: conta refeita dá ${calc} e o gabarito diz ${g.resp}`);
    }
  }
  const seqs = sequenciasPegaSolta();
  const pega = gabarito.find(g => g.id === 'pega-e-solta');
  if (seqs.length !== 1 || seqs[0] !== D.junta(pega.resp, pega.tipos)) falha(`pega-e-solta: sequências mínimas válidas = ${seqs}`);
  else console.log('  contas ok; pega-e-solta tem uma única sequência mínima');

  const nav = await chromium.launch();

  // 1) layout em duas larguras
  for (const pag of paginas) {
    const arq = path.join(raiz, pag);
    if (!fs.existsSync(arq)) { falha(`${pag} não existe`); continue; }
    const html = fs.readFileSync(arq, 'utf8');
    console.log(pag);
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(html.replace(/★/g, ''))) falha('emoji no HTML');
    const g = gabarito.find(x => pag.startsWith(x.id + '/'));
    if (g) {
      // a explicação não pode estar legível: pega trechos de texto dela e procura no HTML
      const trechos = g.exp.replace(/<[^>]+>/g, ' ').split(/[.:]\s/).map(t => t.replace(/\s+/g, ' ').trim()).filter(t => t.length > 30);
      const vazou = trechos.filter(t => html.includes(t.slice(0, 30)));
      if (vazou.length) falha(`explicação legível no HTML: "${vazou[0].slice(0, 40)}..."`);
      const cofre = JSON.parse((html.match(/id="cofre">([\s\S]*?)<\/script>/) || [, '{}'])[1]);
      if (!cofre.hash || !cofre.exp) falha('cofre vazio (rode node 03-desafios/gera.cjs)');
      else if (cofre.hash !== await D.hashResposta(g.id, D.junta(g.resp, g.tipos))) falha('hash da página diferente do gabarito (rode gera.cjs)');
      if (g.id === 'pega-e-solta' && /caebfdeaf/i.test(html.replace(/[^a-z]/gi, ''))) falha('sequência certa legível no HTML');
    }
    for (const [w, h] of larguras) {
      const ctx = await nav.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      const erros = [];
      p.on('pageerror', e => erros.push(e.message));
      await p.goto('file://' + arq, { waitUntil: 'load' });
      await p.waitForTimeout(300);
      if (erros.length) falha(`${w}px pageerror: ${erros.join(' | ')}`);
      const r = await p.evaluate(() => {
        const css = getComputedStyle(document.body).backgroundColor === 'rgb(12, 12, 16)' && getComputedStyle(document.querySelector('.topo')).position === 'sticky';
        const refs = [...document.querySelectorAll('a[href],link[href],script[src],img[src]')].map(a => a.getAttribute('href') || a.getAttribute('src'));
        const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
        const peq = [...document.querySelectorAll('svg text')].map(t => t.getBoundingClientRect().height).filter(x => x > 0 && x < 11).length;
        // conteúdo de SVG saindo da caixa
        const fora = [...document.querySelectorAll('svg.dg')].filter(s => { const b = s.getBoundingClientRect(); return [...s.querySelectorAll('text')].some(t => { const r = t.getBoundingClientRect(); return r.width && (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1); }); }).length;
        return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, css, refs, ids, peq, fora };
      });
      if (r.sw > r.iw) falha(`${w}px rolagem lateral: ${r.sw} > ${r.iw}`);
      if (!r.css) falha(`${w}px pagina.css não carregou`);
      if (r.peq) falha(`${w}px ${r.peq} rótulos de SVG com menos de 11px de altura`);
      if (r.fora) falha(`${w}px texto saindo do desenho SVG`);
      if (w === 390) {
        for (const ref of r.refs) {
          if (/^(https?:|mailto:)/.test(ref)) continue;
          if (ref.startsWith('#')) { if (ref.length > 1 && !r.ids.includes(ref.slice(1))) falha(`âncora inexistente ${ref}`); continue; }
          let alvo = path.resolve(path.dirname(arq), ref.split('#')[0]);
          if (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory()) alvo = path.join(alvo, 'index.html');
          if (!fs.existsSync(alvo)) falha(`link quebrado ${ref}`);
        }
      }
      const nome = (pag === 'index.html' ? 'index' : pag.split('/')[0]) + `-${w}.png`;
      await p.screenshot({ path: path.join(shots, nome), fullPage: true });
      await ctx.close();
    }
  }

  // 2) resolver todos num mesmo contexto (mesmo localStorage) e conferir o placar
  console.log('respostas');
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  const preenche = async (vals) => {
    const campos = p.locator('form.resolver input');
    const n = await campos.count();
    if (n !== vals.length) { falha(`campos: página ${n}, teste ${vals.length}`); return; }
    for (let i = 0; i < n; i++) await campos.nth(i).fill(vals[i]);
    await p.click('form.resolver button[type=submit]');
  };
  for (const g of gabarito) {
    const v = VARIANTES[g.id];
    if (!v) { falha(`${g.id} sem variantes no teste`); continue; }
    if (D.junta(v.certa, g.tipos) !== D.junta(g.resp, g.tipos)) falha(`${g.id}: a variante "${v.certa}" não normaliza para a resposta`);
    await p.goto('file://' + path.join(raiz, g.id, 'index.html'), { waitUntil: 'load' });
    // dicas abrem uma de cada vez
    const nd = await p.locator('.dicas li').count();
    await p.click('.mais-dica');
    const vis = await p.locator('.dicas li:not([hidden])').count();
    if (vis !== 1) falha(`${g.id}: depois de 1 clique, ${vis} dicas visíveis de ${nd}`);
    // errada
    await preenche(v.errada);
    await p.waitForFunction(() => /erro/.test(document.querySelector('.retorno').className), null, { timeout: 3000 }).catch(() => falha(`${g.id}: resposta errada não deu retorno de erro`));
    if (await p.locator('form.acertou').count()) falha(`${g.id}: resposta errada marcou acerto`);
    if (!(await p.locator('#explicacao').isHidden())) falha(`${g.id}: explicação apareceu com resposta errada`);
    // certa
    await preenche(v.certa);
    const ok = await p.waitForSelector('form.acertou', { timeout: 3000 }).then(() => true).catch(() => false);
    if (!ok) { falha(`${g.id}: resposta certa não marcou acerto`); continue; }
    await p.waitForFunction(() => !document.getElementById('explicacao').hidden && document.querySelector('.exp').textContent.length > 100, null, { timeout: 3000 })
      .catch(() => falha(`${g.id}: explicação não abriu`));
    await p.screenshot({ path: path.join(shots, `${g.id}-acertou-390.png`), fullPage: true });
    console.log(`  ${g.id}: errada recusada, certa aceita, explicação aberta`);
  }
  await p.goto('file://' + path.join(raiz, 'index.html'), { waitUntil: 'load' });
  await p.waitForTimeout(200);
  const placar = await p.textContent('#placar .num');
  const feitos = await p.locator('.card.feito').count();
  if (placar.trim() !== `${gabarito.length} de ${gabarito.length}` || feitos !== gabarito.length) falha(`placar "${placar}", ${feitos} cartões marcados`);
  else console.log(`  placar: ${placar}`);
  await p.screenshot({ path: path.join(shots, 'index-placar-390.png'), fullPage: true });
  await p.click('#zerar');
  await p.waitForTimeout(300);
  if ((await p.textContent('#placar .num')).trim() !== `0 de ${gabarito.length}`) falha('zerar placar não zerou');
  if (erros.length) falha(`pageerror nas respostas: ${erros.join(' | ')}`);
  await ctx.close();

  await nav.close();
  console.log(falhas ? `\n${falhas} falha(s)` : `\nOK: ${paginas.length} páginas, ${gabarito.length} desafios, sem falhas`);
  process.exit(falhas ? 1 : 0);
})();
