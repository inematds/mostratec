// Teste das páginas de "Soluções que vendem" (MOSTRATEC 2026).
// Uso: node testa.cjs   (Playwright global; gera screenshots em shots/)
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const raiz = __dirname;
const paginas = ['index.html', 'pet-automatico', 'irrigacao', 'nutrientes', 'vigilancia', 'energia', 'agua', 'controle-casa']
  .map(p => p.endsWith('.html') ? p : p + '/index.html')
  .filter(p => fs.existsSync(path.join(raiz, p)));
const larguras = [[390, 844], [1366, 800]];
const shots = path.join(raiz, 'shots');
fs.mkdirSync(shots, { recursive: true });

let falhas = 0;
const falha = (m) => { falhas++; console.log('  FALHA ' + m); };

(async () => {
  const nav = await chromium.launch();
  for (const pag of paginas) {
    const arq = path.join(raiz, pag);
    const html = fs.readFileSync(arq, 'utf8');
    console.log(pag);

    // pinos: GPIO citados no diagrama (SVG) = GPIO citados no código (pre)
    const svgs = (html.match(/<svg[\s\S]*?<\/svg>/g) || []).join(' ');
    const pres = (html.match(/<pre[\s\S]*?<\/pre>/g) || []).join(' ');
    const pinos = (t) => new Set([...t.matchAll(/GPIO\s?(\d+)/g)].map(m => +m[1]));
    const ps = pinos(svgs), pc = pinos(pres);
    if (pc.size) {
      const so1 = [...ps].filter(x => !pc.has(x)), so2 = [...pc].filter(x => !ps.has(x));
      if (so1.length || so2.length) falha(`pinos diferentes: só no diagrama [${so1}] só no código [${so2}]`);
      else console.log(`  pinos ok: ${[...ps].sort((a, b) => a - b).join(', ')}`);
    }
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html)) falha('emoji no HTML');

    for (const [w, h] of larguras) {
      const ctx = await nav.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      const erros = [];
      p.on('pageerror', e => erros.push(e.message));
      await p.goto('file://' + arq, { waitUntil: 'load' });
      await p.waitForTimeout(300);
      if (erros.length) falha(`${w}px pageerror: ${erros.join(' | ')}`);
      const r = await p.evaluate(() => {
        const sw = document.documentElement.scrollWidth, iw = window.innerWidth;
        const css = getComputedStyle(document.body).backgroundColor === 'rgb(12, 12, 16)' && !!document.querySelector('.topo') && getComputedStyle(document.querySelector('.topo')).position === 'sticky';
        const refs = [...document.querySelectorAll('a[href],link[href]')].map(a => a.getAttribute('href'));
        const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
        // texto de SVG: tamanho exibido
        const peq = [...document.querySelectorAll('svg text')].map(t => t.getBoundingClientRect().height).filter(x => x > 0 && x < 11).length;
        return { sw, iw, css, refs, ids, peq };
      });
      if (r.sw > r.iw) falha(`${w}px rolagem lateral: ${r.sw} > ${r.iw}`);
      if (!r.css) falha(`${w}px pagina.css não carregou`);
      if (r.peq) falha(`${w}px ${r.peq} rótulos de SVG com menos de 11px de altura`);
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
  await nav.close();
  console.log(falhas ? `\n${falhas} falha(s)` : `\nOK: ${paginas.length} páginas, sem falhas`);
  process.exit(falhas ? 1 : 0);
})();
