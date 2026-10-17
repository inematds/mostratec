// Teste automático do "Vida na Fazenda" (Playwright + Chromium headless)
// Uso: node testa.cjs [pasta-dos-screenshots]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const ARQ = path.join(__dirname, 'index.html');
const URL = 'file://' + ARQ;
const SAIDA = process.argv[2] || path.join(__dirname, 'shots');
fs.mkdirSync(SAIDA, { recursive: true });
const ESPERA_DEMO = +(process.env.ESPERA_DEMO || 20000);

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALHA') + ' ' + msg); if (!cond) falhas++; };

async function pagina(browser, vw, vh, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, acceptDownloads: true, hasTouch: !!extra.toque, isMobile: !!extra.toque });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
  return { ctx, page, erros };
}

(async () => {
  const browser = await chromium.launch();

  // 1) demo 20 s no telão
  {
    const { ctx, page, erros } = await pagina(browser, 1280, 800);
    await page.goto(URL + '?demo=1');
    await page.waitForTimeout(500);
    const a = await page.evaluate(() => window.__fazenda());
    await page.waitForTimeout(ESPERA_DEMO);
    const b = await page.evaluate(() => window.__fazenda());
    await page.screenshot({ path: path.join(SAIDA, 'demo-1280x800.png') });
    console.log('demo: ' + JSON.stringify(b));
    ok(erros.length === 0, 'demo sem erros ' + erros.slice(0, 3).join(' | '));
    ok(b.xp > a.xp && b.colheitas > 0, `demo avançou (xp ${a.xp} → ${b.xp}, colheitas ${b.colheitas})`);
    ok(b.missoesFeitas >= 1, `demo cumpriu missões (${b.missoesFeitas})`);
    await ctx.close();
  }
  // 1b) demo no celular
  {
    const { ctx, page, erros } = await pagina(browser, 390, 844, { toque: true });
    await page.goto(URL + '?demo=1');
    await page.waitForTimeout(14000);
    await page.screenshot({ path: path.join(SAIDA, 'demo-celular-390x844.png') });
    const b = await page.evaluate(() => window.__fazenda());
    console.log('demo celular: ' + JSON.stringify(b));
    ok(erros.length === 0, 'demo celular sem erros ' + erros.slice(0, 3).join(' | '));
    await ctx.close();
  }
  // 2) jogar de verdade: toque, arrastar e teclado
  {
    const { ctx, page, erros } = await pagina(browser, 390, 844, { toque: true });
    await page.goto(URL);
    await page.screenshot({ path: path.join(SAIDA, 'inicio-celular-390x844.png') });
    await page.getByText('▶ Jogar').click();
    const s = await page.evaluate(() => window.__slots());
    const cant = s.filter(x => x.tipo === 'canteiro').slice(0, 4);
    const m0 = (await page.evaluate(() => window.__fazenda())).moedas;
    for (const c of cant) await page.mouse.click(c.x + c.w / 2, c.y + c.h / 2);
    const e1 = await page.evaluate(() => window.__fazenda());
    ok(e1.plantados === 4 && e1.moedas !== m0, `toque plantou 4 cenouras (moedas ${m0} → ${e1.moedas})`);
    await page.waitForTimeout(3300);
    // colher arrastando o dedo por cima dos 4 canteiros
    await page.mouse.move(cant[0].x + cant[0].w / 2, cant[0].y + cant[0].h / 2); await page.mouse.down();
    for (const c of cant.slice(1)) await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2, { steps: 4 });
    await page.mouse.up();
    const e2 = await page.evaluate(() => window.__fazenda());
    ok(e2.colheitas === 4, `arrastar colheu 4 (colheitas ${e2.colheitas}, missões ${e2.missoesFeitas})`);
    // teclado: V vende, setas + espaço plantam
    await page.keyboard.press('v');
    const e3 = await page.evaluate(() => window.__fazenda());
    ok(e3.moedas > e2.moedas, `tecla V vendeu (moedas ${e2.moedas} → ${e3.moedas})`);
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('Space');
    const e4 = await page.evaluate(() => window.__fazenda());
    ok(e4.plantados >= 1, `teclado plantou (plantados ${e4.plantados})`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SAIDA, 'jogando-celular-390x844.png') });
    ok(erros.length === 0, 'jogo sem erros ' + erros.slice(0, 3).join(' | '));
    // menu volta para a tela inicial com "continuar"
    await page.click('#b-menu');
    ok(await page.getByText('continuar no nível').isVisible(), 'menu ☰ mostra "continuar"');
    await ctx.close();
  }
  // 3) criar a minha versão → baixar
  {
    const { ctx, page, erros } = await pagina(browser, 1280, 800);
    await page.goto(URL);
    await page.screenshot({ path: path.join(SAIDA, 'inicio-1280x800.png') });
    await page.getByText('🛠️ Criar a minha versão').click();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#tela').getByText('⬇ Baixar o jogo').click()]);
    const p = await dl.path(), tam = fs.statSync(p).size, orig = fs.statSync(ARQ).size;
    const txt = fs.readFileSync(p, 'utf8');
    ok(Math.abs(tam - orig) / orig < 0.05 && txt.includes('const CONFIG'), `download ${dl.suggestedFilename()} ${tam} B vs arquivo ${orig} B`);
    await page.screenshot({ path: path.join(SAIDA, 'criar-1280x800.png') });
    ok(erros.length === 0, 'criar sem erros ' + erros.slice(0, 3).join(' | '));
    await ctx.close();
  }
  // 4) faixa INEMA.CLUB + painel com QR (celular)
  {
    const { ctx, page, erros } = await pagina(browser, 390, 844, { toque: true });
    await page.goto(URL);
    await page.getByText('▶ Jogar').click();
    await page.waitForTimeout(300);
    const fx = await page.locator('#puxador').boundingBox();
    ok(fx && Math.abs(fx.y + fx.height - 844) <= 1 && Math.round(fx.height) === 46, `faixa amarela embaixo (y ${fx && fx.y}, altura ${fx && fx.height})`);
    const sb = await page.locator('#sementes').boundingBox(), rb = await page.locator('#rodape').boundingBox();
    ok(sb.y + sb.height <= fx.y && rb.y + rb.height <= fx.y, `sementes (${Math.round(sb.y + sb.height)}) e rodapé (${Math.round(rb.y + rb.height)}) acima da faixa (${fx.y})`);
    const cam = (await page.evaluate(() => window.__slots())).find(x => x.tipo === 'caminhao');
    ok(cam.y + cam.h <= fx.y, `caminhão acima da faixa (${Math.round(cam.y + cam.h)})`);
    await page.screenshot({ path: path.join(SAIDA, 'faixa-celular-390x844.png') });
    await page.locator('#puxador').tap();
    await page.waitForTimeout(1500);
    const sy = await page.evaluate(() => scrollY);
    const qr = await page.locator('#qr-painel svg').boundingBox();
    ok(sy > 0 && qr && qr.y >= 0 && qr.y + qr.height <= 844, `puxador rolou até o painel (scrollY ${sy}, QR y ${qr && Math.round(qr.y)}–${qr && Math.round(qr.y + qr.height)})`);
    await page.screenshot({ path: path.join(SAIDA, 'painel-celular-390x844.png') });
    await page.getByRole('button', { name: '⬆ Voltar ao jogo' }).tap();
    await page.waitForTimeout(1500);
    const sy2 = await page.evaluate(() => scrollY);
    ok(sy2 === 0, `"Voltar ao jogo" voltou ao topo (scrollY ${sy2})`);
    const cant = (await page.evaluate(() => window.__slots())).filter(x => x.tipo === 'canteiro').slice(0, 2);
    const p0 = (await page.evaluate(() => window.__fazenda())).plantados;
    await page.touchscreen.tap(cant[0].x + cant[0].w / 2, cant[0].y + cant[0].h / 2);
    await page.mouse.click(cant[1].x + cant[1].w / 2, cant[1].y + cant[1].h / 2);
    const p1 = (await page.evaluate(() => window.__fazenda())).plantados;
    ok(p1 === p0 + 2 && (await page.evaluate(() => scrollY)) === 0, `depois do painel ainda planta (plantados ${p0} → ${p1})`);
    ok(erros.length === 0, 'painel sem erros ' + erros.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await browser.close();
  console.log(falhas ? `RESULTADO: ${falhas} falha(s)` : 'RESULTADO: tudo OK');
  console.log('screenshots em ' + SAIDA);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error('ERRO NO TESTE', e); process.exit(2); });
