// Teste das páginas "Robôs para montar" (MOSTRATEC 2026).
// Uso: node 01-robo-que-anda/testa.cjs
// Confere em 390x844 e 1366x800: zero pageerror, sem rolagem lateral,
// links internos existem, âncoras existem e texto dos SVGs >= 12px no celular.
// Tira screenshots em 01-robo-que-anda/shots/.
const path = require('path');
const fs = require('fs');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');

const PASTA = __dirname;
const SHOTS = path.join(PASTA, 'shots');
const PAGINAS = ['index.html', 'robo-de-papel/index.html', 'assistente-de-voz/index.html', 'robo-vigia/index.html'];
const TELAS = [{ nome: 'cel', width: 390, height: 844 }, { nome: 'pc', width: 1366, height: 800 }];
// Páginas de outra equipe (11-solucoes-praticas). Se ainda não existirem, só avisa.
const ESPERADAS_DE_FORA = [/11-solucoes-praticas\/vigilancia\/?$/, /11-solucoes-praticas\/controle-casa\/?$/];

function existe(alvo) {
  if (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory()) return fs.existsSync(path.join(alvo, 'index.html'));
  return fs.existsSync(alvo);
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const nav = await chromium.launch();
  let falhas = 0, avisos = 0;
  for (const pag of PAGINAS) {
    const arq = path.join(PASTA, pag);
    if (!fs.existsSync(arq)) { console.log('FALHA', pag, 'não existe'); falhas++; continue; }
    const base = pag.replace(/\/?index\.html$/, '').replace(/\//g, '_') || 'mae';
    for (const t of TELAS) {
      const ctx = await nav.newContext({ viewport: { width: t.width, height: t.height }, deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      const erros = [];
      p.on('pageerror', e => erros.push(e.message));
      await p.goto('file://' + arq, { waitUntil: 'load' });
      await p.waitForTimeout(400);
      const r = await p.evaluate(() => {
        const sw = document.documentElement.scrollWidth;
        const refs = [...document.querySelectorAll('a[href],link[href],script[src],img[src]')].map(e => e.getAttribute('href') || e.getAttribute('src'));
        const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
        const pequenos = [];
        for (const tx of document.querySelectorAll('svg text')) {
          const m = tx.getScreenCTM(); if (!m) continue;
          const fsz = parseFloat(getComputedStyle(tx).fontSize) * Math.hypot(m.a, m.b);
          if (fsz < 11.5 && tx.textContent.trim()) pequenos.push(tx.textContent.trim().slice(0, 30) + ' (' + fsz.toFixed(1) + 'px)');
        }
        const largos = [...document.querySelectorAll('body *')].filter(e => {
          const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && !e.closest('pre,.tabela');
        }).slice(0, 5).map(e => e.tagName + '.' + e.className);
        return { sw, refs, ids: [...ids], pequenos, largos, titulo: document.title };
      });
      const tag = `${pag} @${t.width}`;
      if (erros.length) { console.log('FALHA', tag, 'pageerror:', erros); falhas++; }
      if (r.sw > t.width) { console.log('FALHA', tag, 'rolagem lateral', r.sw, r.largos); falhas++; }
      if (t.width === 390 && r.pequenos.length) { console.log('FALHA', tag, 'texto SVG < 12px:', r.pequenos.slice(0, 8)); falhas++; }
      if (t.width === 390) {
        for (const ref of r.refs) {
          if (/^(https?:|mailto:|data:)/.test(ref)) continue;
          if (ref.startsWith('#')) {
            if (ref.length > 1 && !r.ids.includes(ref.slice(1))) { console.log('FALHA', tag, 'âncora sem alvo', ref); falhas++; }
            continue;
          }
          const [semHash] = ref.split('#');
          const alvo = path.resolve(path.dirname(arq), semHash);
          if (!existe(alvo)) {
            if (ESPERADAS_DE_FORA.some(re => re.test(semHash))) { console.log('AVISO', tag, 'página de outra equipe ainda não existe:', ref); avisos++; }
            else { console.log('FALHA', tag, 'link interno quebrado', ref); falhas++; }
          }
        }
      }
      // screenshots: página inteira + 3 telas do celular para olhar de perto
      await p.screenshot({ path: path.join(SHOTS, `${base}-${t.nome}-inteira.png`), fullPage: true });
      if (t.width === 390) {
        const h = await p.evaluate(() => document.documentElement.scrollHeight);
        for (const [i, fr] of [0, 0.33, 0.66].entries()) {
          await p.evaluate(y => scrollTo(0, y), Math.floor(h * fr));
          await p.waitForTimeout(100);
          await p.screenshot({ path: path.join(SHOTS, `${base}-cel-${i + 1}.png`) });
        }
      }
      console.log('ok  ', tag, '·', r.titulo);
      await ctx.close();
    }
  }
  await nav.close();
  console.log(`\nResultado: ${falhas} falha(s), ${avisos} aviso(s).`);
  process.exit(falhas ? 1 : 0);
})();
