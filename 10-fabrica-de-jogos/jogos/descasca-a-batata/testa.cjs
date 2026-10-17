// Teste automático do "Descasca a Batata" (Playwright + Chromium headless)
// Rodar: node testa.cjs   → screenshots em ./shots/
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const ARQ = path.join(__dirname, 'index.html');
const URL = 'file://' + ARQ;
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const erros = [];
  const pega = (nome, page) => {
    page.on('pageerror', e => erros.push(`[${nome}] pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') erros.push(`[${nome}] console: ${m.text()}`); });
  };
  let ok = true; const falha = msg => { ok = false; console.log('FALHA:', msg); };

  // 1) demo: 20 s jogando sozinho
  const ctxD = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const demo = await ctxD.newPage(); pega('demo', demo);
  await demo.goto(URL + '?demo=1');
  await demo.waitForTimeout(6000);
  await demo.screenshot({ path: path.join(SHOTS, 'demo-6s-1280.png') });
  await demo.waitForTimeout(14000);
  const eD = await demo.evaluate(() => estadoJogo());
  console.log('demo após 20 s:', JSON.stringify(eD));
  if (eD.total < 2) falha('demo descascou menos de 2 legumes');
  if (eD.missoesFeitas < 1) falha('demo não cumpriu missão');
  if (eD.moedas <= 0 && eD.ferramenta === 0) falha('demo sem moedas');
  await demo.screenshot({ path: path.join(SHOTS, 'demo-20s-1280.png') });

  // demo no celular
  const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const dm = await ctxM.newPage(); pega('demo-cel', dm);
  await dm.goto(URL + '?demo=1');
  await dm.waitForTimeout(9000);
  await dm.screenshot({ path: path.join(SHOTS, 'demo-celular-390.png') });

  // 2) jogo normal: tela inicial → Jogar → arrastar e teclado
  const ctxJ = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
  const pg = await ctxJ.newPage(); pega('jogo', pg);
  await pg.goto(URL);
  await pg.screenshot({ path: path.join(SHOTS, 'inicio-1280.png') });
  await pg.click('#tela >> text=▶ Jogar');
  await pg.waitForTimeout(800);
  const e0 = await pg.evaluate(() => estadoJogo());
  // arraste em zigue-zague sobre o legume
  const cx = 640, cy = 800 * 0.5;
  await pg.mouse.move(cx - 150, cy - 90); await pg.mouse.down();
  for (let k = 0; k < 14; k++) await pg.mouse.move(cx + (k % 2 ? 150 : -150), cy - 90 + k * 13, { steps: 12 });
  await pg.mouse.up();
  const e1 = await pg.evaluate(() => estadoJogo());
  console.log('arraste: pct', e0.pct.toFixed(2), '→', e1.pct.toFixed(2), 'moedas', e0.moedas, '→', e1.moedas, 'total', e1.total);
  if (!(e1.pct > e0.pct || e1.total > e0.total)) falha('arraste não descascou');
  await pg.screenshot({ path: path.join(SHOTS, 'jogando-arraste-1280.png') });
  // teclado
  const e2 = await pg.evaluate(() => estadoJogo());
  await pg.keyboard.down('ArrowLeft'); await pg.waitForTimeout(500); await pg.keyboard.up('ArrowLeft');
  await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(400); await pg.keyboard.up('ArrowDown');
  await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(700); await pg.keyboard.up('ArrowRight');
  const e3 = await pg.evaluate(() => estadoJogo());
  console.log('teclado: pct', e2.pct.toFixed(2), '→', e3.pct.toFixed(2), 'total', e2.total, '→', e3.total);
  if (!(e3.pct !== e2.pct || e3.total > e2.total)) falha('teclado não descascou');

  // 3) Criar a minha versão → Baixar
  await pg.evaluate(() => telaCriar());
  await pg.screenshot({ path: path.join(SHOTS, 'criar-1280.png') });
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#tela >> text=⬇ Baixar o jogo')]);
  const destino = path.join(SHOTS, 'baixado.html'); await dl.saveAs(destino);
  const tamB = fs.statSync(destino).size, tamA = fs.statSync(ARQ).size;
  console.log('download:', dl.suggestedFilename(), tamB, 'bytes; arquivo original', tamA, 'bytes; diferença', ((tamB - tamA) / tamA * 100).toFixed(2) + '%');
  if (Math.abs(tamB - tamA) / tamA > 0.03) falha('download com tamanho muito diferente');
  fs.unlinkSync(destino);

  // 4) celular: tela inicial e jogando com toque
  const cel = await ctxM.newPage(); pega('celular', cel);
  await cel.goto(URL);
  await cel.screenshot({ path: path.join(SHOTS, 'inicio-celular-390.png') });
  await cel.tap('#tela >> text=▶ Jogar');
  await cel.waitForTimeout(700);
  // arraste por toque (via eventos de ponteiro)
  await cel.evaluate(async () => {
    const c = document.getElementById('c');
    const ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, pointerId: 7, pointerType: 'touch', bubbles: true }));
    ev('pointerdown', 100, 330);
    for (let k = 0; k < 60; k++) { ev('pointermove', 80 + (k % 10) * 25, 300 + Math.floor(k / 10) * 25); await new Promise(r => setTimeout(r, 16)); }
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7 }));
  });
  const ec = await cel.evaluate(() => estadoJogo());
  console.log('celular após toque:', JSON.stringify(ec));
  if (!(ec.pct > 0 || ec.total > 0)) falha('toque no celular não descascou');
  await cel.waitForTimeout(300);
  await cel.screenshot({ path: path.join(SHOTS, 'jogando-celular-390.png') });

  // 5) faixa INEMA.CLUB + painel com QR (celular 390×844)
  const fx = await cel.evaluate(() => {
    const r = document.getElementById('puxador').getBoundingClientRect();
    const l = document.getElementById('loja').getBoundingClientRect();
    const el = document.elementFromPoint(195, r.top + r.height / 2);
    return { top: r.top, bottom: r.bottom, h: r.height, lojaBottom: l.bottom, noTopo: el && el.id, sy: scrollY, ih: innerHeight };
  });
  console.log('faixa:', JSON.stringify(fx));
  if (!(Math.abs(fx.bottom - fx.ih) < 2 && Math.abs(fx.h - 46) < 2)) falha('faixa amarela não está colada embaixo com 46 px');
  if (fx.noTopo !== 'puxador') falha('faixa coberta por outro elemento: ' + fx.noTopo);
  if (fx.lojaBottom > fx.top) falha('loja fica embaixo da faixa');
  await cel.tap('#puxador');
  await cel.waitForTimeout(1200);
  const pn = await cel.evaluate(() => {
    const q = document.querySelector('#qr-painel svg').getBoundingClientRect();
    return { sy: scrollY, alvo: Math.min(document.getElementById('painel').offsetTop, document.documentElement.scrollHeight - innerHeight), qrTop: q.top, qrBottom: q.bottom, qrW: q.width, ih: innerHeight,
             estado: estadoJogo() };
  });
  console.log('painel:', JSON.stringify({ sy: pn.sy, alvo: pn.alvo, qrTop: pn.qrTop, qrBottom: pn.qrBottom, qrW: pn.qrW }));
  if (Math.abs(pn.sy - pn.alvo) > 4) falha('puxador não rolou até o painel');
  if (!(pn.qrW > 150 && pn.qrTop >= 0 && pn.qrBottom <= pn.ih)) falha('QR não está inteiro na tela');
  await cel.screenshot({ path: path.join(SHOTS, 'painel-celular-390.png') });
  await cel.tap('text=⬆ Voltar ao jogo');
  await cel.waitForTimeout(1200);
  const sy0 = await cel.evaluate(() => scrollY);
  console.log('voltar ao jogo: scrollY', sy0);
  if (sy0 !== 0) falha('"Voltar ao jogo" não voltou ao topo');
  // arraste com toque de verdade (CDP) depois de voltar: tem que descascar e não rolar a página
  const cdp = await ctxM.newCDPSession(cel);
  const toque = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 1 })) });
  const ea = await cel.evaluate(() => estadoJogo());
  // zigue-zague cobrindo o legume inteiro (o meio já foi raspado no passo 4)
  await toque('touchStart', [[60, 190]]);
  for (let k = 0; k < 120; k++) { await toque('touchMove', [[60 + (k % 12) * 25, 190 + Math.floor(k / 12) * 30]]); await cel.waitForTimeout(16); }
  await toque('touchEnd', []);
  await cel.waitForTimeout(200);
  const eb = await cel.evaluate(() => ({ ...estadoJogo(), sy: scrollY }));
  console.log('arraste (toque CDP) depois de voltar: pct', ea.pct.toFixed(2), '→', eb.pct.toFixed(2), 'total', ea.total, '→', eb.total, 'scrollY', eb.sy);
  if (!(eb.pct > ea.pct || eb.total > ea.total)) falha('arraste não descascou depois de voltar do painel');
  if (eb.sy !== 0) falha('arraste no canvas rolou a página');
  await cel.screenshot({ path: path.join(SHOTS, 'jogando-depois-painel-390.png') });
  // deslizar o dedo para cima na faixa abre o painel
  await toque('touchStart', [[195, 820]]);
  for (let k = 1; k <= 12; k++) { await toque('touchMove', [[195, 820 - k * 40]]); await cel.waitForTimeout(16); }
  await toque('touchEnd', []);
  await cel.waitForTimeout(900);
  const syS = await cel.evaluate(() => scrollY);
  console.log('deslizar para cima na faixa: scrollY', syS);
  if (!(syS > 100)) falha('deslizar para cima na faixa não rolou a página');

  await browser.close();
  console.log('erros de página/console:', erros.length ? '\n  ' + erros.join('\n  ') : 'nenhum');
  if (erros.length) ok = false;
  console.log(ok ? 'RESULTADO: OK' : 'RESULTADO: FALHOU');
  process.exit(ok ? 0 : 1);
})();
