// Teste do "Evolua a Capivara" (Playwright + Chromium headless).
// Uso: node testa.cjs   → screenshots em ./screens/
const { chromium } = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");

const ARQ = path.join(__dirname, "index.html");
const URL = "file://" + ARQ;
const SAIDA = path.join(__dirname, "screens");
fs.mkdirSync(SAIDA, { recursive: true });

const erros = [];
const ok = (cond, msg) => { console.log((cond ? "OK   " : "FALHA") + "  " + msg); if (!cond) erros.push(msg); };
const espia = (page, nome) => {
  page.on("pageerror", e => erros.push(`[${nome}] pageerror: ${e.message}`));
  page.on("console", m => { if (m.type() === "error") erros.push(`[${nome}] console: ${m.text()}`); });
};
const estado = page => page.evaluate(() => ({
  moedas: E.moedas, nivel: E.nivel, maior: E.maior, fusoes: E.fusoes, missaoIdx: E.missaoIdx, compras: E.compras,
  capys: E.vagas.filter(Boolean).length, celebra: !!celebra,
}));

(async () => {
  const browser = await chromium.launch();

  // 1) demo: 20 s jogando sozinho
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); espia(page, "demo");
    await page.goto(URL + "?demo=1");
    await page.waitForTimeout(1500);
    const a = await estado(page);
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(SAIDA, "demo-1280.png") });
    await page.waitForTimeout(12500);
    const b = await estado(page);
    console.log("demo inicio:", JSON.stringify(a)); console.log("demo 20s:   ", JSON.stringify(b));
    ok(b.fusoes > a.fusoes, "demo: fundiu sozinho (" + b.fusoes + " fusões)");
    ok(b.missaoIdx >= 1, "demo: cumpriu missão (" + b.missaoIdx + ")");
    ok(b.maior >= 2, "demo: chegou ao estágio " + (b.maior + 1));
    ok(b.nivel >= 2, "demo: subiu de nível (" + b.nivel + ")");
    await page.screenshot({ path: path.join(SAIDA, "demo-1280-20s.png") });
    await ctx.close();
  }

  // 2) celular: tela inicial, jogar, arrastar, tocar, teclado
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, acceptDownloads: true });
    const page = await ctx.newPage(); espia(page, "celular");
    await page.goto(URL);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SAIDA, "inicio-390.png") });
    await page.click("text=▶ Jogar");
    await page.waitForTimeout(600);
    const a = await estado(page);
    // arrastar uma capivara sobre outra igual
    const par = await page.evaluate(() => { const p = achaPar(); return p ? [vagaPos[p[0]], vagaPos[p[1]]] : null; });
    ok(!!par, "celular: há um par para fundir");
    if (par) {
      await page.mouse.move(par[0].x, par[0].y); await page.mouse.down();
      for (let i = 1; i <= 10; i++) await page.mouse.move(par[0].x + (par[1].x - par[0].x) * i / 10, par[0].y + (par[1].y - par[0].y) * i / 10);
      await page.mouse.up();
    }
    await page.waitForTimeout(400);
    const b = await estado(page);
    ok(b.fusoes === a.fusoes + 1, "celular: arrastar funde (fusões " + a.fusoes + "→" + b.fusoes + ")");
    ok(b.celebra, "celular: apareceu NOVA EVOLUÇÃO!");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SAIDA, "nova-evolucao-390.png") });
    await page.mouse.click(195, 400);               // fecha a celebração
    await page.waitForTimeout(300);
    // tocar numa capivara dá moedas
    const pos = await page.evaluate(() => { const i = E.vagas.findIndex(Boolean); return vagaPos[i]; });
    const m0 = (await estado(page)).moedas;
    await page.mouse.click(pos.x, pos.y);
    const m1 = (await estado(page)).moedas;
    ok(m1 > m0 + 0.9, "celular: tocar dá moedas (" + m0.toFixed(1) + "→" + m1.toFixed(1) + ")");
    // teclado: C compra
    const c0 = (await estado(page)).compras;
    await page.keyboard.press("c");
    await page.waitForTimeout(200);
    ok((await estado(page)).compras === c0 + 1, "teclado: C compra uma capivara");
    // F funde
    await page.waitForTimeout(600);
    const f0 = (await estado(page)).fusoes;
    await page.keyboard.press("f");
    await page.waitForTimeout(100);
    if (await page.evaluate(() => !!celebra)) { await page.mouse.click(195, 400); }
    const f1 = (await estado(page)).fusoes;
    ok(f1 >= f0 + 1 || !(await page.evaluate(() => !!achaPar())), "teclado: F funde um par");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SAIDA, "jogo-390.png") });
    // progresso salvo
    const salvo = await page.evaluate(() => { salvar(); return !!localStorage.getItem("evolua-a-capivara-v1"); });
    ok(salvo, "progresso salvo no localStorage");

    // 3) criar a minha versão → baixar
    await page.click("#b-menu");
    await page.click("text=Criar a minha versão");
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SAIDA, "criar-390.png") });
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("text=Baixar o jogo")]);
    const destino = path.join(SAIDA, "baixado.html");
    await dl.saveAs(destino);
    const t1 = fs.statSync(destino).size, t0 = fs.statSync(ARQ).size;
    ok(Math.abs(t1 - t0) / t0 < 0.02, `download com o tamanho do arquivo (${t1} vs ${t0} bytes)`);
    ok(fs.readFileSync(destino, "utf8").includes("const CONFIG"), "download contém o CONFIG");
    fs.unlinkSync(destino);
    await ctx.close();
  }

  // 4) PC 1280×800 jogando
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); espia(page, "pc");
    await page.goto(URL);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SAIDA, "inicio-1280.png") });
    await page.click("text=▶ Jogar");
    for (let i = 0; i < 4; i++) { await page.keyboard.press("c"); await page.waitForTimeout(150); }
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(SAIDA, "jogo-1280.png") });
    await ctx.close();
  }

  // 5) demo no celular (telão vertical)
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); espia(page, "demo-celular");
    await page.goto(URL + "?demo=1");
    await page.waitForTimeout(14000);
    await page.screenshot({ path: path.join(SAIDA, "demo-390.png") });
    await ctx.close();
  }

  await browser.close();
  console.log("\nErros:", erros.length ? "\n - " + erros.join("\n - ") : "nenhum");
  process.exit(erros.length ? 1 : 0);
})();
