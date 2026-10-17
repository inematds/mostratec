// Teste do padrão da Fábrica de Jogos INEMA para o "Roube o Ovo".
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

function vigia(page, erros) {
  page.on("pageerror", e => erros.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") erros.push("console: " + m.text()); });
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. ?demo=1 por 20 s: sem erro, pontos subindo, missão cumprida
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL + "?demo=1");
    await espera(1000);
    const e0 = await page.evaluate(() => jogo.estado());
    let primeiraMissao = null;
    for (let s = 1; s <= 20; s++) {
      await espera(1000);
      const e = await page.evaluate(() => jogo.estado());
      if (primeiraMissao === null && e.missoesCumpridas > 0) primeiraMissao = s;
      if (s === 10) await page.screenshot({ path: path.join(SHOTS, "demo-1280.png") });
    }
    const e1 = await page.evaluate(() => jogo.estado());
    console.log("demo:", JSON.stringify({ antes: e0, depois: e1, primeiraMissaoEm: primeiraMissao }));
    ok(erros.length === 0, "demo sem erros " + (erros.join(" | ") || ""));
    ok(e1.moedas > e0.moedas, `demo: moedas subindo (${e0.moedas.toFixed(1)} → ${e1.moedas.toFixed(1)})`);
    ok(e1.missoesCumpridas >= 1, `demo: missões cumpridas em 20 s = ${e1.missoesCumpridas}`);
    ok(e1.xp > 0, `demo: XP subindo (${e1.xp}, nível ${e1.nivel})`);
    ok(e0.velRobo < 0.7, `demo nível 1: robôs lentos no 1º minuto (fator ${e0.velRobo})`);
    await page.screenshot({ path: path.join(SHOTS, "demo-1280-20s.png") });
    await ctx.close();
  }

  // 2. Tela inicial → Jogar → teclado e toque; nível salvo em localStorage
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL);
    await page.screenshot({ path: path.join(SHOTS, "inicio-1280.png") });
    await page.click("#tela >> text=▶ Jogar");
    await espera(300);
    const p0 = (await page.evaluate(() => jogo.estado())).jogador;
    await page.keyboard.down("ArrowRight"); await espera(600); await page.keyboard.up("ArrowRight");
    const p1 = (await page.evaluate(() => jogo.estado())).jogador;
    ok(p1.x > p0.x + 50, `teclado move o jogador (${p0.x.toFixed(0)} → ${p1.x.toFixed(0)})`);
    await page.mouse.move(640, 600); await page.mouse.down(); await page.mouse.move(640, 450, { steps: 5 });
    await espera(500); await page.mouse.up();
    const p2 = (await page.evaluate(() => jogo.estado())).jogador;
    ok(p2.y < p1.y - 40, `arrastar move o jogador (${p1.y.toFixed(0)} → ${p2.y.toFixed(0)})`);
    await page.keyboard.press(" ");
    ok((await page.evaluate(() => jogo.estado())).trancada, "espaço tranca a base");
    const missaoVisivel = await page.isVisible("#missao") && (await page.textContent("#m-txt")).length > 3;
    ok(missaoVisivel, "missão ativa visível: " + await page.textContent("#m-txt"));
    ok(await page.isVisible("#nivel .barra"), "barra de XP visível: " + await page.textContent("#nv-txt"));
    await page.screenshot({ path: path.join(SHOTS, "jogo-1280.png") });
    ok(erros.length === 0, "jogo sem erros " + (erros.join(" | ") || ""));
    await ctx.close();
  }

  // 3. Progresso salvo: começa no nível 5 (Neve) com XP vindo do localStorage
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL);
    await page.evaluate(() => localStorage.setItem("roube-ovo-progresso", JSON.stringify({ xp: 545 })));
    await page.reload();
    const e = await page.evaluate(() => jogo.estado());
    ok(e.nivel === 5 && e.cenario === "Neve", `progresso salvo: nível ${e.nivel}, ${e.cenario}`);
    await page.click("#tela >> text=▶ Jogar"); await espera(4000);
    const e2 = await page.evaluate(() => jogo.estado());
    ok(e2.pedestais === 8 && e2.velRobo > 0.9, `nível 5: ${e2.pedestais} pedestais, robôs fator ${e2.velRobo.toFixed(2)}`);
    await page.screenshot({ path: path.join(SHOTS, "nivel5-neve-1280.png") });
    // nível 7: cenário Espaço e 10 pedestais
    await page.evaluate(() => localStorage.setItem("roube-ovo-progresso", JSON.stringify({ xp: 760 })));
    await page.reload(); await page.click("#tela >> text=▶ Jogar"); await espera(4000);
    const e3 = await page.evaluate(() => jogo.estado());
    ok(e3.nivel === 7 && e3.cenario === "Espaço" && e3.pedestais === 10, `nível 7 com 760 XP: ${e3.cenario}, ${e3.pedestais} pedestais`);
    await page.screenshot({ path: path.join(SHOTS, "nivel7-espaco-1280.png") });
    ok(erros.length === 0, "níveis sem erros " + (erros.join(" | ") || ""));
    await ctx.close();
  }

  // 4. Criar a minha versão → Baixar o jogo
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
    const page = await ctx.newPage();
    await page.goto(URL);
    await page.click("#tela >> text=🛠️ Criar a minha versão");
    await page.screenshot({ path: path.join(SHOTS, "criar-1280.png") });
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#tela >> text=⬇ Baixar o jogo")]);
    const destino = path.join(SHOTS, "baixado.html"); await dl.saveAs(destino);
    const a = fs.statSync(ARQ).size, b = fs.statSync(destino).size;
    ok(Math.abs(a - b) / a < 0.03, `download ${b} bytes vs arquivo ${a} bytes`);
    const txt = fs.readFileSync(destino, "utf8");
    ok(txt.includes('const VERSAO = "0.3.0"') && txt.includes("missoes:") && txt.includes("niveis:"), "download traz VERSAO 0.3.0, missões e níveis");
    await ctx.close();
  }

  // 5. Celular 390×844 (toque)
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); const erros = []; vigia(page, erros);
    await page.goto(URL);
    await page.screenshot({ path: path.join(SHOTS, "inicio-390.png") });
    await page.tap("#tela >> text=▶ Jogar"); await espera(6000);
    await page.screenshot({ path: path.join(SHOTS, "jogo-390.png") });
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sobra <= 0, "celular sem rolagem lateral");

    // 5b. Faixa INEMA.CLUB + painel com QR (regra do Nei 17/10)
    const cdp = await ctx.newCDPSession(page);
    const arrasta = async (x, y0, y1) => {           // dedo de verdade (eventos de toque) arrastando no canvas
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
      for (let i = 1; i <= 6; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 + (y1 - y0) * i / 6 }] }); await espera(30); }
      await espera(500);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    const fx = await page.evaluate(() => { const r = document.getElementById("puxador").getBoundingClientRect();
      const b = document.getElementById("botoes").getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, h: innerHeight, botoes: b.bottom, txt: document.getElementById("puxador").textContent }; });
    ok(Math.abs(fx.bottom - fx.h) < 2 && Math.abs(fx.bottom - fx.top - 46) < 2, `faixa amarela fixa embaixo (${fx.top.toFixed(0)}–${fx.bottom.toFixed(0)} de ${fx.h}): "${fx.txt}"`);
    ok(fx.botoes <= fx.top, `botões acima da faixa (fundo dos botões ${fx.botoes.toFixed(0)} ≤ ${fx.top.toFixed(0)})`);
    const ta = await page.evaluate(() => getComputedStyle(document.getElementById("c")).touchAction);
    ok(ta === "none", "canvas com touch-action:none (" + ta + ")");
    const j0 = (await page.evaluate(() => jogo.estado())).jogador;
    await arrasta(195, 600, 450);
    const j1 = (await page.evaluate(() => jogo.estado())).jogador;
    ok(j1.y < j0.y - 20 && await page.evaluate(() => scrollY) === 0, `toque move o jogador sem rolar a página (${j0.y.toFixed(0)} → ${j1.y.toFixed(0)})`);
    await page.tap("#puxador"); await espera(1500);
    const pn = await page.evaluate(() => { const q = document.querySelector("#qr-painel svg").getBoundingClientRect();
      return { y: scrollY, qTop: q.top, qBot: q.bottom, qW: q.width, h: innerHeight }; });
    ok(pn.y > 400 && pn.qW > 150 && pn.qTop >= 0 && pn.qBot <= pn.h, `puxador rola até o painel (scrollY ${pn.y.toFixed(0)}), QR visível ${pn.qW.toFixed(0)}px em ${pn.qTop.toFixed(0)}–${pn.qBot.toFixed(0)}`);
    await page.screenshot({ path: path.join(SHOTS, "painel-390.png") });
    await page.tap("#painel >> text=⬆ Voltar ao jogo"); await espera(1500);
    const yv = await page.evaluate(() => scrollY);
    ok(yv === 0, `"Voltar ao jogo" volta ao topo (scrollY ${yv})`);
    await page.screenshot({ path: path.join(SHOTS, "jogo-390-depois-painel.png") });
    const j2 = (await page.evaluate(() => jogo.estado())).jogador;
    await arrasta(195, 450, 650);
    const j3 = (await page.evaluate(() => jogo.estado())).jogador;
    ok(j3.y > j2.y + 20, `depois do painel o toque ainda move o jogador (${j2.y.toFixed(0)} → ${j3.y.toFixed(0)})`);
    await page.tap("#b-tranca"); await espera(200);
    ok((await page.evaluate(() => jogo.estado())).trancada, "botão Trancar responde ao toque");
    ok(erros.length === 0, "celular sem erros " + (erros.join(" | ") || ""));
    await ctx.close();
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const p2 = await ctx2.newPage(); await p2.goto(URL + "?demo=1"); await espera(15000);
    await p2.screenshot({ path: path.join(SHOTS, "demo-390.png") });
    await ctx2.close();
  }

  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO OK");
  process.exit(falhas ? 1 : 0);
})();
