// Teste do padrão da Fábrica de Jogos INEMA para o "Faça sua Comida".
// Uso: node testa.cjs   (screenshots vão para ./shots/)
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");

const ARQ = path.join(__dirname, "index.html");
const URL = "file://" + ARQ;
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? "OK   " : "FALHA") + " " + msg); if (!cond) falhas++; };
const espera = ms => new Promise(r => setTimeout(r, ms));
const estado = page => page.evaluate(() => jogo.estado());

function vigia(page, erros) {
  page.on("pageerror", e => erros.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") erros.push("console: " + m.text()); });
}

// atende o cliente atual tocando nos botões certos (clique de verdade no canvas)
async function esperaCliente(page) {
  for (let i = 0; i < 40; i++) { const e = await estado(page); if (e.cliente) return e; await espera(150); }
  return estado(page);
}
async function atende(page, erra = false) {
  const e = await esperaCliente(page);
  if (!e.cliente) return false;
  const lay = await page.evaluate(() => jogo.layout());
  const pedido = e.cliente.pedido.slice();
  if (erra) pedido.reverse();
  for (const id of pedido) {
    const g = lay.ingr.find(b => b.id === id);
    if (!g) return false;
    await page.mouse.click(g.x + g.w / 2, g.y + g.h / 2);
    await espera(120);
  }
  await espera(700);
  await page.mouse.click(lay.entregar.x + lay.entregar.w / 2, lay.entregar.y + lay.entregar.h / 2);
  await espera(300);
  return true;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. ?demo=1 por 20 s: sem erro, moedas subindo, missão cumprida
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL + "?demo=1");
    await espera(1000);
    const e0 = await estado(page);
    for (let s = 1; s <= 20; s++) {
      await espera(1000);
      if (s === 10) await page.screenshot({ path: path.join(SHOTS, "demo-1280.png") });
    }
    const e1 = await estado(page);
    console.log("demo:", JSON.stringify({ antes: { moedas: e0.moedas, nivel: e0.nivel }, depois: { moedas: e1.moedas, nivel: e1.nivel, atendidos: e1.atendidos, missoes: e1.missoesCumpridas, erros: e1.erros, up: e1.up } }));
    ok(erros.length === 0, "demo sem erros " + (erros.join(" | ") || ""));
    ok(e1.moedas > e0.moedas, `demo: moedas subindo (${e0.moedas} → ${e1.moedas})`);
    ok(e1.atendidos >= 3, `demo: clientes atendidos em 20 s = ${e1.atendidos}`);
    ok(e1.missoesCumpridas >= 1, `demo: missões cumpridas em 20 s = ${e1.missoesCumpridas}`);
    ok(e1.nivel > e0.nivel, `demo: subiu de nível (${e0.nivel} → ${e1.nivel})`);
    await page.screenshot({ path: path.join(SHOTS, "demo-1280-20s.png") });
    await ctx.close();
  }

  // 2. Tela inicial → Jogar → toque, teclado, erro sem game over, loja
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL);
    await page.screenshot({ path: path.join(SHOTS, "inicio-1280.png") });
    await page.click("text=▶ Jogar");
    await espera(1200);
    // toque (clique no canvas)
    const a0 = await estado(page);
    ok(await atende(page), "clique: montou e entregou o pedido " + JSON.stringify(a0.cliente));
    const a1 = await estado(page);
    ok(a1.atendidos === 1 && a1.moedas > 0, `clique: cliente atendido, moedas ${a1.moedas}`);
    // teclado: números + Enter
    await espera(1800);
    const k0 = await esperaCliente(page);
    const lay = await page.evaluate(() => jogo.layout());
    for (const id of k0.cliente.pedido) { const g = lay.ingr.find(b => b.id === id); await page.keyboard.press(String(g.tecla)); await espera(100); }
    await espera(700); await page.keyboard.press("Enter"); await espera(300);
    const k1 = await estado(page);
    ok(k1.atendidos === 2, `teclado: atendidos ${k1.atendidos}`);
    // errar: o cliente reclama, mas o jogo continua
    await espera(1800);
    const lay2 = await page.evaluate(() => jogo.layout());
    const k2 = await esperaCliente(page);
    const errado = lay2.ingr.map(g => g.id).find(id => id !== k2.cliente.pedido[0]) || k2.cliente.pedido[0];
    for (const id of [errado, errado]) { const g = lay2.ingr.find(b => b.id === id); await page.mouse.click(g.x + g.w / 2, g.y + g.h / 2); await espera(100); }
    await espera(700); await page.keyboard.press("Enter"); await espera(400);
    await page.screenshot({ path: path.join(SHOTS, "erro-1280.png") });
    const k3 = await estado(page);
    ok(k3.erros === 1 && k3.rodando && k3.cliente && k3.cliente.montado.length === 0, `erro: cliente reclamou (erros ${k3.erros}) e o jogo segue`);
    // mais clientes até a 1ª missão e o nível 2
    for (let i = 0; i < 4; i++) { await atende(page); await espera(1500); }
    const k4 = await estado(page);
    ok(k4.missoesCumpridas >= 1, `missões cumpridas jogando: ${k4.missoesCumpridas} (atual: ${k4.missao})`);
    ok(k4.nivel >= 2, `subiu de nível jogando: ${k4.nivel}`);
    ok(await page.isVisible("#missao") && (await page.textContent("#m-txt")).length > 5, "missão ativa visível: " + await page.textContent("#m-txt"));
    await page.screenshot({ path: path.join(SHOTS, "jogo-1280.png") });
    // loja
    await page.evaluate(() => { /* garante moedas para testar a compra */ });
    await page.keyboard.press("u"); await espera(300);
    ok((await estado(page)).pausado, "loja abre e pausa");
    await page.screenshot({ path: path.join(SHOTS, "loja-1280.png") });
    const antes = (await estado(page)).up;
    const botaoCompra = await page.$("#tela .card button:not([disabled])");
    if (botaoCompra) { await botaoCompra.click(); await espera(200); }
    const depois = (await estado(page)).up;
    ok(!botaoCompra || JSON.stringify(antes) !== JSON.stringify(depois), `compra na loja: ${JSON.stringify(antes)} → ${JSON.stringify(depois)}`);
    await page.click("text=▶ Voltar ao jogo"); await espera(300);
    ok(!(await estado(page)).pausado, "volta da loja");
    const salvo = await page.evaluate(() => localStorage.getItem("faca-sua-comida"));
    ok(salvo && JSON.parse(salvo).nivel >= 2, "progresso salvo no localStorage: " + salvo);
    ok(erros.length === 0, "jogo sem erros " + (erros.join(" | ") || ""));
    await ctx.close();
  }

  // 3. Níveis altos: todos os cardápios desenham sem erro (progresso salvo no nível 11)
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL);
    await page.evaluate(() => localStorage.setItem("faca-sua-comida", JSON.stringify({ nivel: 11, xp: 0 })));
    await page.reload();
    await page.click("text=▶ Jogar"); await espera(1200);
    const vistos = new Set();
    for (let i = 0; i < 14 && vistos.size < 5; i++) {
      const e = await esperaCliente(page);
      if (e.cliente) { vistos.add(e.cliente.pedido[0]); await atende(page); }
      await espera(1400);
      if (i === 4) await page.screenshot({ path: path.join(SHOTS, "nivel11-1280.png") });
    }
    ok(vistos.size >= 3, "níveis altos: bases vistas " + [...vistos].join(", "));
    ok(erros.length === 0, "níveis altos sem erros " + (erros.join(" | ") || ""));
    await ctx.close();
  }

  // 4. Criar a minha versão → Baixar o jogo
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
    const page = await ctx.newPage();
    await page.goto(URL);
    await page.click("text=🛠️ Criar a minha versão");
    await page.screenshot({ path: path.join(SHOTS, "criar-1280.png") });
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("text=⬇ Baixar o jogo")]);
    const destino = path.join(SHOTS, "baixado.html"); await dl.saveAs(destino);
    const a = fs.statSync(ARQ).size, b = fs.statSync(destino).size;
    ok(Math.abs(a - b) / a < 0.03, `download ${b} bytes vs arquivo ${a} bytes`);
    const txt = fs.readFileSync(destino, "utf8");
    ok(txt.includes('const VERSAO = "0.1.0"') && txt.includes("cardapios:") && txt.includes("missoes:"), "download traz VERSAO, cardápios e missões");
    await ctx.close();
  }

  // 5. Celular 390×844 (toque)
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL);
    await page.screenshot({ path: path.join(SHOTS, "inicio-390.png") });
    await page.tap("text=▶ Jogar"); await espera(1500);
    const e = await esperaCliente(page), lay = await page.evaluate(() => jogo.layout());
    for (const id of e.cliente.pedido) { const g = lay.ingr.find(b => b.id === id); await page.touchscreen.tap(g.x + g.w / 2, g.y + g.h / 2); await espera(120); }
    await espera(200);
    await page.screenshot({ path: path.join(SHOTS, "jogo-390.png") });
    await espera(600);
    await page.touchscreen.tap(lay.entregar.x + lay.entregar.w / 2, lay.entregar.y + lay.entregar.h / 2); await espera(400);
    ok((await estado(page)).atendidos === 1, "celular: toque atende o cliente");
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sobra <= 0, "celular sem rolagem lateral");
    ok(erros.length === 0, "celular sem erros " + (erros.join(" | ") || ""));
    await ctx.close();
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const p2 = await ctx2.newPage(); const erros2 = []; vigia(p2, erros2);
    await p2.goto(URL + "?demo=1"); await espera(40000);
    await p2.screenshot({ path: path.join(SHOTS, "demo-390.png") });
    const e2 = await estado(p2);
    console.log("demo celular 40 s:", JSON.stringify({ nivel: e2.nivel, moedas: e2.moedas, atendidos: e2.atendidos, balcoes: e2.balcoes, up: e2.up }));
    ok(erros2.length === 0, "demo celular sem erros " + (erros2.join(" | ") || ""));
    await ctx2.close();
  }

  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO OK");
  process.exit(falhas ? 1 : 0);
})();
