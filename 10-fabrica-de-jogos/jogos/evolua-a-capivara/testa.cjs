// Teste do "Evolua a Capivara" v0.2.0 (Playwright + Chromium headless).
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
const foto = (page, nome) => page.screenshot({ path: path.join(SAIDA, nome) });
// faixa INEMA.CLUB inteira dentro da tela (sem rolar) e QR com pelo menos 180 px
const confereFaixaQR = async (page, onde) => {
  const r = await page.evaluate(() => {
    const f = document.getElementById("faixa").getBoundingClientRect();
    const q = document.querySelector("#tela .qr svg");
    const qr = q ? q.getBoundingClientRect() : null;
    return { f: { top: f.top, bottom: f.bottom, h: f.height, vis: !document.getElementById("faixa").classList.contains("hidden") },
             txt: document.getElementById("faixa").textContent, qr: qr && { w: qr.width, h: qr.height }, H: innerHeight,
             qrTxt: document.querySelector("#tela .qr") ? document.querySelector("#tela .qr").textContent : "" };
  });
  ok(r.f.vis && r.f.top >= 0 && r.f.bottom <= r.H && r.f.h > 40, `${onde}: faixa INEMA.CLUB visível sem rolar (${Math.round(r.f.top)}–${Math.round(r.f.bottom)} de ${r.H})`);
  ok(r.txt.includes("Aprenda a criar jogos com IA") && r.txt.includes("de graça") && r.txt.includes("INEMA.CLUB"), `${onde}: texto da faixa`);
  ok(r.qr && r.qr.w >= 180 && r.qr.h >= 180, `${onde}: QR com ${r.qr ? Math.round(r.qr.w) : 0} px`);
  ok(r.qrTxt.includes("Jogue no seu celular"), `${onde}: "Jogue no seu celular"`);
};
// cria uma Capivara Lendária na hora (duas robôs juntas) e fecha a festa
const fazLendaria = async (page, larg, alt) => {
  await page.evaluate(() => {
    E.vagas = E.vagas.map(() => null); E.vagas[0] = novaCapy(5); E.vagas[1] = novaCapy(5); E.maior = Math.max(E.maior, 5);
    fundeAutomatico();
  });
  await page.waitForTimeout(900);
  await page.mouse.click(larg / 2, alt / 2);
  await page.waitForTimeout(400);
};
const chavesSalvas = page => page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith("evolua")));

(async () => {
  const browser = await chromium.launch();

  // 1) demo: 20 s jogando sozinho, sem gravar nada; depois a tela de fim aparece no telão
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); espia(page, "demo");
    await page.goto(URL + "?demo=1");
    await page.waitForTimeout(1500);
    const a = await estado(page);
    await page.waitForTimeout(6000);
    await foto(page, "demo-1280.png");
    await page.waitForTimeout(12500);
    const b = await estado(page);
    console.log("demo inicio:", JSON.stringify(a)); console.log("demo 20s:   ", JSON.stringify(b));
    ok(b.fusoes > a.fusoes, "demo: fundiu sozinho (" + b.fusoes + " fusões)");
    ok(b.missaoIdx >= 1, "demo: cumpriu missão (" + b.missaoIdx + ")");
    ok(b.maior >= 2, "demo: chegou ao estágio " + (b.maior + 1));
    ok(b.nivel >= 2, "demo: subiu de nível (" + b.nivel + ")");
    await foto(page, "demo-1280-20s.png");
    // força a Lendária: a demo mostra a tela de fim (faixa + QR) e recomeça sozinha
    await page.evaluate(() => { E.vagas = E.vagas.map(() => null); E.vagas[0] = novaCapy(5); E.vagas[1] = novaCapy(5); E.maior = 5; demo.mov = null; arrasto = null; demo.espera = 0; });
    await page.waitForTimeout(4500);
    const fim = await page.evaluate(() => !document.getElementById("tela").classList.contains("hidden") && document.getElementById("tela-conteudo").textContent.includes("LENDÁRIA"));
    ok(fim, "demo: tela de fim apareceu depois da Lendária");
    await foto(page, "demo-fim-1280.png");
    if (fim) await confereFaixaQR(page, "demo fim 1280");
    await page.evaluate(() => { demoReinicia = 0.2; });
    await page.waitForTimeout(800);
    ok(await page.evaluate(() => rodando && E.maior === 0 && document.getElementById("tela").classList.contains("hidden")), "demo: recomeçou sozinha depois da tela de fim");
    ok((await chavesSalvas(page)).length === 0, "demo: não gravou nada no aparelho (" + (await chavesSalvas(page)).join(",") + ")");
    await ctx.close();
  }

  // 2) celular: tela inicial, jogar, arrastar, tocar, teclado, ajuda, loja, fim, Top 10, renascer
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, acceptDownloads: true });
    const page = await ctx.newPage(); espia(page, "celular");
    await page.goto(URL);
    await page.waitForTimeout(800);
    await foto(page, "inicio-390.png");
    await confereFaixaQR(page, "início 390");
    await page.click("text=▶ Jogar");
    await page.waitForTimeout(600);
    const a = await estado(page);
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
    await foto(page, "nova-evolucao-390.png");
    await page.mouse.click(195, 400);
    await page.waitForTimeout(300);
    const pos = await page.evaluate(() => { const i = E.vagas.findIndex(Boolean); return vagaPos[i]; });
    const m0 = (await estado(page)).moedas;
    await page.mouse.click(pos.x, pos.y);
    const m1 = (await estado(page)).moedas;
    ok(m1 > m0 + 0.9, "celular: tocar dá moedas (" + m0.toFixed(1) + "→" + m1.toFixed(1) + ")");
    const c0 = (await estado(page)).compras;
    await page.keyboard.press("c");
    await page.waitForTimeout(200);
    ok((await estado(page)).compras === c0 + 1, "teclado: C compra uma capivara");
    await page.waitForTimeout(600);
    const f0 = (await estado(page)).fusoes;
    await page.keyboard.press("f");
    await page.waitForTimeout(100);
    if (await page.evaluate(() => !!celebra)) { await page.mouse.click(195, 400); }
    const f1 = (await estado(page)).fusoes;
    ok(f1 >= f0 + 1 || !(await page.evaluate(() => !!achaPar())), "teclado: F funde um par");
    await page.waitForTimeout(3000);
    await foto(page, "jogo-390.png");
    const salvo = await page.evaluate(() => { salvar(); return !!localStorage.getItem("evolua-a-capivara-v2"); });
    ok(salvo, "progresso salvo no localStorage (v2)");

    // AJUDA: 7 evoluções desenhadas
    await page.click("#b-ajuda");
    await page.waitForTimeout(500);
    const evos = await page.evaluate(() => [...document.querySelectorAll("#tela .evos canvas")].filter(c => c.width > 0).length);
    ok(evos === 7, "ajuda: 7 evoluções desenhadas (" + evos + ")");
    ok(await page.evaluate(() => /Renascer/.test(document.getElementById("tela-conteudo").textContent) && /Teclas/.test(document.getElementById("tela-conteudo").textContent)), "ajuda: explica renascer e teclas");
    await foto(page, "ajuda-390.png");
    await page.click("text=Entendi!");
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => rodando), "ajuda: Entendi! volta ao jogo");

    // LOJA: prévias, comprar com moedas, equipar
    await page.evaluate(() => { E.moedas = 2000; });
    await page.click("#b-loja");
    await page.waitForTimeout(500);
    const previas = await page.evaluate(() => document.querySelectorAll("#tela .item canvas").length);
    ok(previas >= 6, "loja: " + previas + " skins com prévia");
    await page.locator(".item", { hasText: "Chapéu de palha" }).locator("button").click();
    await page.waitForTimeout(300);
    let meta = await page.evaluate(() => ({ ...META, moedas: E.moedas, salvo: JSON.parse(localStorage.getItem("evolua-a-capivara-meta") || "{}") }));
    ok(meta.skins.includes("palha") && meta.skin === "palha" && Math.abs(meta.moedas - 1850) < 15, "loja: comprou e equipou o chapéu de palha (🪙 2000→" + Math.round(meta.moedas) + ")");
    ok(meta.salvo.skin === "palha", "loja: skin salva no aparelho");
    await page.locator(".item", { hasText: "Capivara pixel" }).locator("button").click();
    await page.waitForTimeout(200);
    ok(!(await page.evaluate(() => META.skins.includes("pixel"))), "loja: sem sementes não compra a skin pixel");
    await foto(page, "loja-390.png");
    await page.click("#tela >> text=Voltar");
    await page.waitForTimeout(1500);
    await foto(page, "jogo-skin-390.png");

    // FIM: Capivara Lendária → tela de fim com faixa, QR e apelido
    await page.evaluate(() => { E.tempo = 151; });
    await fazLendaria(page, 390, 844);
    const fimOk = await page.evaluate(() => !document.getElementById("tela").classList.contains("hidden") && document.getElementById("tela-conteudo").textContent.includes("LENDÁRIA"));
    ok(fimOk, "fim: tela de fim depois da Lendária");
    await foto(page, "fim-390.png");
    await confereFaixaQR(page, "fim 390");
    // palavrão é recusado
    await page.fill("#apelido", "p0rr4");
    await page.click("text=💾 Salvar");
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => /palavrão/.test(document.getElementById("erro-apelido").textContent)), "top 10: palavrão recusado");
    await page.fill("#apelido", "Capi Rocha 99");
    ok((await page.inputValue("#apelido")).length <= 10, "top 10: apelido limitado a 10 letras");
    await page.click("text=💾 Salvar");
    await page.waitForTimeout(400);
    const top = await page.evaluate(() => ({ novo: document.querySelectorAll("#tela tr.novo").length, txt: document.querySelector("#tela tr.novo") ? document.querySelector("#tela tr.novo").textContent : "",
      dados: JSON.parse(localStorage.getItem("evolua-a-capivara-top10") || "{}") }));
    ok(top.novo === 1, "top 10: linha recém-entrada destacada (" + top.txt + ")");
    ok(top.dados.pontos && top.dados.pontos.length === 1 && top.dados.tempo && top.dados.tempo.length === 1, "top 10: entrou nas duas abas (pontuação e tempo)");
    await foto(page, "top10-390.png");
    await page.click("text=🪙 Pontuação");
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => document.querySelectorAll("#tela tr.novo").length === 1 && /Mais moedas/.test(document.getElementById("tela-conteudo").textContent)), "top 10: aba Pontuação com destaque");
    await page.click("#tela >> text=Voltar");
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => /Salvo no Top 10/.test(document.getElementById("tela-conteudo").textContent)), "top 10: Voltar leva à tela de fim já salva");

    // RENASCER: confirmação, zera, ganha sementes e bônus
    ok(await page.evaluate(() => !!E && E.maior === 6), "renascer: tem Capivara Lendária");
    const antes = await page.evaluate(() => ({ r: rendaDe(0), m: META.renascimentos, s: META.sementes }));
    await page.click("#tela-conteudo >> text=🌱 Renascer");
    await page.waitForTimeout(300);
    await foto(page, "renascer-390.png");
    ok(await page.evaluate(() => /Renascer\?/.test(document.getElementById("tela-conteudo").textContent)), "renascer: pede confirmação");
    await page.click("text=🌱 Renascer agora");
    await page.waitForTimeout(500);
    const depois = await page.evaluate(() => ({ r: rendaDe(0), m: META.renascimentos, s: META.sementes, maior: E.maior, moedas: E.moedas, capys: E.vagas.filter(Boolean).length,
      ren: document.getElementById("h-ren").classList.contains("hidden") ? "" : document.getElementById("h-ren").textContent, botao: !document.getElementById("b-renascer").classList.contains("hidden") }));
    console.log("renascer:", JSON.stringify(antes), "→", JSON.stringify(depois));
    ok(depois.m === antes.m + 1 && depois.s === antes.s + 5, "renascer: +1 renascimento e +5 sementes");
    ok(Math.abs(depois.r / antes.r - 1.25) < 1e-9, "renascer: renda +25% (" + antes.r + "→" + depois.r + ")");
    ok(depois.maior === 0 && depois.moedas <= 40 && depois.capys === 3, "renascer: tabuleiro e moedas zerados");
    ok(depois.ren.includes("1") && depois.ren.includes("🌱"), "renascer: contador visível no topo (" + depois.ren + ")");
    ok(!depois.botao, "renascer: botão some até a próxima Lendária");
    // com sementes, compra a skin arco-íris
    await page.keyboard.press("l");
    await page.waitForTimeout(300);
    await page.locator(".item", { hasText: "arco-íris" }).locator("button").click();
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => META.skin === "arcoiris" && META.sementes === 2), "loja: comprou arco-íris com 🌱 sementes");
    await page.click("#tela >> text=Voltar");
    await page.waitForTimeout(2600);
    await foto(page, "renasceu-390.png");

    // 3) criar a minha versão → baixar
    await page.click("#b-menu");
    await page.waitForTimeout(300);
    await foto(page, "menu-390.png");
    await page.click("text=Criar a minha versão");
    await page.waitForTimeout(300);
    await foto(page, "criar-390.png");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#tela-conteudo .linha >> text=Baixar o jogo")]);
    const destino = path.join(SAIDA, "baixado.html");
    await dl.saveAs(destino);
    const t1 = fs.statSync(destino).size, t0 = fs.statSync(ARQ).size;
    ok(Math.abs(t1 - t0) / t0 < 0.02, `download com o tamanho do arquivo (${t1} vs ${t0} bytes)`);
    const baixado = fs.readFileSync(destino, "utf8");
    ok(baixado.includes("const CONFIG") && baixado.includes('<template id="tpl-qr"><svg'), "download contém o CONFIG e o QR");
    fs.unlinkSync(destino);
    await ctx.close();
  }

  // 4) PC 1280×800
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); espia(page, "pc");
    await page.goto(URL);
    await page.waitForTimeout(500);
    await foto(page, "inicio-1280.png");
    await confereFaixaQR(page, "início 1280");
    await page.click("text=▶ Jogar");
    for (let i = 0; i < 4; i++) { await page.keyboard.press("c"); await page.waitForTimeout(150); }
    await page.waitForTimeout(2500);
    await foto(page, "jogo-1280.png");
    await page.evaluate(() => { E.moedas = 5000; META.sementes = 30; });
    await page.keyboard.press("l");
    await page.waitForTimeout(400);
    await foto(page, "loja-1280.png");
    await page.locator(".item", { hasText: "Capivara pixel" }).locator("button").click();
    await page.waitForTimeout(200);
    await page.click("#tela >> text=Voltar");
    await page.keyboard.press("h");
    await page.waitForTimeout(400);
    await foto(page, "ajuda-1280.png");
    await page.click("text=Entendi!");
    await page.waitForTimeout(1200);
    await foto(page, "jogo-pixel-1280.png");
    await fazLendaria(page, 1280, 800);
    await foto(page, "fim-1280.png");
    await confereFaixaQR(page, "fim 1280");
    ok(await page.evaluate(() => !!document.getElementById("apelido")), "fim 1280: pede apelido para o Top 10");
    await ctx.close();
  }

  // 5) save antigo (v0.1.0) é migrado sem perder progresso
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(); espia(page, "migra");
    await page.goto(URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("evolua-a-capivara-v1", JSON.stringify({ moedas: 777, xp: 5, nivel: 4, compras: 9, maior: 4, fusoes: 20, toques: 3, ganho: 5000,
        missaoIdx: 6, missao: null, presente: 3, vagas: [4, 3, -1, 2, -1, -1, 0, -1, -1, -1, -1, 1] }));
    });
    await page.reload();
    await page.waitForTimeout(500);
    const mig = await page.evaluate(() => ({ moedas: E.moedas, nivel: E.nivel, maior: E.maior, capys: E.vagas.filter(Boolean).length, total: E.total,
      v2: !!localStorage.getItem("evolua-a-capivara-v2"), v1: !!localStorage.getItem("evolua-a-capivara-v1") }));
    console.log("migração:", JSON.stringify(mig));
    ok(mig.moedas === 777 && mig.nivel === 4 && mig.maior === 4 && mig.capys === 5 && mig.total === 5000, "migração: save da v0.1.0 carregado sem perder progresso");
    ok(mig.v2 && mig.v1, "migração: gravou no formato novo (v2) e manteve o antigo");
    await ctx.close();
  }

  // 6) demo no celular (telão vertical)
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); espia(page, "demo-celular");
    await page.goto(URL + "?demo=1");
    await page.waitForTimeout(14000);
    await foto(page, "demo-390.png");
    await ctx.close();
  }

  await browser.close();
  console.log("\nErros:", erros.length ? "\n - " + erros.join("\n - ") : "nenhum");
  process.exit(erros.length ? 1 : 0);
})();
