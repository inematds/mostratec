// Teste automático do "Desenho ou Oof!" (Playwright + Chromium headless)
// Uso: node testa.cjs
const path = require("path"), fs = require("fs");
const { chromium } = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");

const ARQ = path.join(__dirname, "index.html");
const URL = "file://" + ARQ;
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? "OK   " : "FALHA ") + msg); if (!cond) falhas++; };
const espera = ms => new Promise(r => setTimeout(r, ms));
const est = p => p.evaluate(() => window.estadoDoJogo());
const esperaTela = (p, tela, ms = 8000) => p.waitForFunction(t => window.estadoDoJogo().tela === t, tela, { timeout: ms }).then(() => true, () => false);

(async () => {
  const browser = await chromium.launch();
  const erros = [];
  const novaPagina = async (opts) => {
    const ctx = await browser.newContext({ acceptDownloads: true, ...opts });
    const p = await ctx.newPage();
    p.on("pageerror", e => erros.push("pageerror: " + e.message));
    p.on("console", m => { if (m.type() === "error") erros.push("console: " + m.text()); });
    return p;
  };
  const celular = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };

  // 1) demo joga sozinho ~25 s
  const d = await novaPagina({ viewport: { width: 1280, height: 800 } });
  await d.goto(URL + "?demo=1");
  await espera(4500);
  const e0 = await est(d);
  await d.screenshot({ path: path.join(SHOTS, "demo-desenho-1280.png") });
  await espera(20500);
  const e1 = await est(d);
  console.log("demo 4 s:", JSON.stringify({ tela: e0.tela, rodada: e0.rodada, px: e0.pixelsPintados }));
  console.log("demo 25 s:", JSON.stringify({ tela: e1.tela, rodada: e1.rodada, concl: e1.rodadasConcluidas, elim: e1.eliminados }));
  ok(e0.tela === "desenho" && e0.pixelsPintados > 5, `demo: a "pessoa" desenha sozinha (${e0.pixelsPintados}% pintado)`);
  ok(e1.rodadasConcluidas >= 1, `demo: rodada concluída (${e1.rodadasConcluidas})`);
  ok(e1.eliminados.length >= 1, `demo: alguém foi eliminado (${e1.eliminados.join(", ")})`);
  // segue até o campeão para fotografar o pódio
  const chegou = await d.waitForFunction(() => window.estadoDoJogo().tela === "final", null, { timeout: 70000 }).then(() => true, () => false);
  ok(chegou, "demo: chegou ao campeão (pódio)");
  await espera(1200);
  await d.screenshot({ path: path.join(SHOTS, "demo-final-1280.png") });
  const recomeca = await d.waitForFunction(() => window.estadoDoJogo().tela !== "final", null, { timeout: 12000 }).then(() => true, () => false);
  ok(recomeca, "demo: recomeça sozinho depois do pódio");

  // demo no celular
  const dm = await novaPagina(celular);
  await dm.goto(URL + "?demo=1");
  await espera(4500);
  await dm.screenshot({ path: path.join(SHOTS, "demo-desenho-celular.png") });
  await esperaTela(dm, "galeria", 15000);
  await espera(1800);
  await dm.screenshot({ path: path.join(SHOTS, "demo-galeria-celular.png") });

  // 2) tela inicial → Jogar contra os robôs → desenhar, balde, desfazer → tempo → votar → eliminação
  const p = await novaPagina({ viewport: { width: 1280, height: 800 } });
  await p.goto(URL);
  await espera(500);
  await p.screenshot({ path: path.join(SHOTS, "inicio-1280.png") });
  await p.click("#i-jogar");
  await p.click("text=🎨 Começar");
  ok(await esperaTela(p, "desenho"), "Jogar → tela de desenho");
  const r = await p.locator("#cv").boundingBox();
  const px0 = (await est(p)).pixelsPintados;
  await p.mouse.move(r.x + r.width * .2, r.y + r.height * .2); await p.mouse.down();
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2; await p.mouse.move(r.x + r.width * (.5 + .28 * Math.cos(a)), r.y + r.height * (.5 + .28 * Math.sin(a)), { steps: 2 }); }
  await p.mouse.up();
  const s1 = await est(p);
  ok(s1.pixelsPintados > px0 + 1 && s1.tracos === 1, `mouse desenha (${px0}% → ${s1.pixelsPintados}%, ${s1.tracos} traço)`);
  await p.click("#cor-6"); await p.click("#b-fer-balde");
  await p.mouse.click(r.x + r.width * .5, r.y + r.height * .5);
  const s2 = await est(p);
  ok(s2.pixelsPintados > s1.pixelsPintados + 10 && s2.baldes === 1, `balde pinta a área (${s1.pixelsPintados}% → ${s2.pixelsPintados}%)`);
  await p.screenshot({ path: path.join(SHOTS, "desenho-1280.png") });
  await p.click("#b-desfazer");
  const s3 = await est(p);
  ok(Math.abs(s3.pixelsPintados - s1.pixelsPintados) < 0.5, `desfazer volta o balde (${s2.pixelsPintados}% → ${s3.pixelsPintados}%)`);
  await p.click("#b-fer-balde");
  await p.mouse.click(r.x + r.width * .5, r.y + r.height * .5);
  await p.keyboard.press("2");
  await p.evaluate(() => teste.acabaTempo());
  ok(await esperaTela(p, "galeria"), "tempo acabou → galeria de votação");
  const nCartas = await p.locator("#g-grade .carta").count();
  ok(nCartas === 6, `galeria com 6 desenhos (${nCartas})`);
  const ids = await p.$$eval("#g-grade .ve", bs => bs.map(b => b.dataset.id));
  ok(!ids.includes("voce"), "não dá para votar no próprio desenho");
  await p.click(`.ve[data-id="${ids[0]}"]`); await p.click(`.vo[data-id="${ids[1]}"]`);
  await p.screenshot({ path: path.join(SHOTS, "votacao-1280.png") });
  await p.click("#b-confirma");
  await p.waitForFunction(() => window.estadoDoJogo().eliminados.length > 0, null, { timeout: 15000 }).catch(() => {});
  await espera(2200);
  const s4 = await est(p);
  ok(s4.eliminados.length === 2 && s4.ativos === 4, `revelação: caíram ${s4.eliminados.join(" e ")} (ficaram ${s4.ativos})`);
  ok(!s4.eliminados.includes("Você"), "escudo de iniciante: você não cai na 1ª rodada");
  ok(s4.moedas > 0 && s4.xp > 0, `ganhou moedas e XP (🪙 ${s4.moedas}, ${s4.xp} XP, nível ${s4.nivel})`);
  await p.screenshot({ path: path.join(SHOTS, "revelacao-1280.png") });
  await p.click("#b-seguir");
  await espera(300);
  const s5 = await est(p);
  ok(s5.rodada === 2, `próxima rodada começa (rodada ${s5.rodada})`);

  // 3) Criar a minha versão → Baixar
  await p.evaluate(() => telaCriar());
  await espera(300);
  await p.screenshot({ path: path.join(SHOTS, "criar-1280.png") });
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#c-baixar")]);
  const tmp = path.join(SHOTS, "_download.html");
  await dl.saveAs(tmp);
  const tamDl = fs.statSync(tmp).size, tamArq = fs.statSync(ARQ).size;
  fs.unlinkSync(tmp);
  ok(Math.abs(tamDl - tamArq) / tamArq < 0.02, `download ${tamDl} bytes ≈ arquivo ${tamArq} bytes`);
  await p.evaluate(() => telaMeus());
  await espera(300);
  const nMeus = await p.locator(".grade-meus button").count();
  ok(nMeus >= 1, `"Meus desenhos" guardou ${nMeus} desenho(s)`);

  // 4) celular: modo amigos com 3 nomes, desenho com TOQUE de verdade
  const m = await novaPagina(celular);
  await m.goto(URL);
  await espera(500);
  await m.screenshot({ path: path.join(SHOTS, "inicio-celular.png") });
  await m.tap("#i-amigos");
  await m.fill("#nome-0", "Ana"); await m.fill("#nome-1", "Beto"); await m.fill("#nome-2", "Caio");
  await m.screenshot({ path: path.join(SHOTS, "amigos-celular.png") });
  await m.tap("#a-comecar");
  const cdp = await m.context().newCDPSession(m);
  const toque = async (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  for (let k = 0; k < 3; k++) {
    const txt = await m.locator("#msg-cx .nome-grande").textContent();
    ok(txt === ["Ana", "Beto", "Caio"][k], `passe o celular para ${txt}`);
    if (k === 0) await m.screenshot({ path: path.join(SHOTS, "passe-celular.png") });
    await m.tap("#msg-b0");
    await esperaTela(m, "desenho");
    const b = await m.locator("#cv").boundingBox();
    const a0 = (await est(m)).pixelsPintados;
    await toque("touchStart", b.x + 60, b.y + 60);
    for (let i = 1; i <= 10; i++) { await toque("touchMove", b.x + 60 + i * 20, b.y + 60 + i * 15 + (k * 10)); await espera(16); }
    await toque("touchEnd");
    await espera(100);
    const a1 = await est(m), y = await m.evaluate(() => scrollY);
    ok(a1.pixelsPintados > a0 + 0.5 && y === 0, `${txt}: toque desenha (${a0}% → ${a1.pixelsPintados}%), página parada (scrollY ${y})`);
    if (k === 0) await m.screenshot({ path: path.join(SHOTS, "desenho-celular.png") });
    await m.evaluate(() => teste.acabaTempo());
    await espera(300);
  }
  ok((await est(m)).tela === "msg", "depois dos 3 desenhos: passa o celular para votar");
  for (let k = 0; k < 3; k++) {
    await m.tap("#msg-b0");
    await esperaTela(m, "galeria");
    const ids2 = await m.$$eval("#g-grade .ve", bs => bs.map(b => b.dataset.id));
    ok(ids2.length === 2, `eleitor ${k + 1}: vota em 2 desenhos (o seu fica de fora)`);
    if (k === 0) await m.screenshot({ path: path.join(SHOTS, "votacao-celular.png") });
    await m.tap(`.ve[data-id="${ids2[0]}"]`); await m.tap(`.vo[data-id="${ids2[1]}"]`);
    await m.tap("#b-confirma");
    await espera(300);
  }
  await m.waitForFunction(() => window.estadoDoJogo().eliminados.length > 0, null, { timeout: 15000 }).catch(() => {});
  await espera(2000);
  const am = await est(m);
  ok(am.eliminados.length === 1 && am.ativos === 2, `amigos: ${am.eliminados.join(", ")} caiu fora (ficaram ${am.ativos})`);
  await m.screenshot({ path: path.join(SHOTS, "revelacao-celular.png") });
  // rodada final: os 2 que ficaram desenham, e quem caiu vira jurado (só vota ⭐)
  await m.tap("#b-seguir");
  for (let k = 0; k < 2; k++) {
    await m.tap("#msg-b0"); await esperaTela(m, "desenho");
    const b = await m.locator("#cv").boundingBox();
    await toque("touchStart", b.x + 100, b.y + 100); for (let i = 1; i <= 8; i++) { await toque("touchMove", b.x + 100 + i * 15, b.y + 100 + i * 15); await espera(16); } await toque("touchEnd"); await espera(100);
    await m.evaluate(() => teste.acabaTempo()); await espera(300);
  }
  const jur = await m.locator("#msg-cx .nome-grande").textContent();
  ok(jur === am.eliminados[0], `final: quem caiu (${jur}) é o jurado`);
  await m.tap("#msg-b0"); await esperaTela(m, "galeria");
  const nVo = await m.locator("#g-grade .vo").count(), idsF = await m.$$eval("#g-grade .ve", bs => bs.map(b => b.dataset.id));
  ok(idsF.length === 2 && nVo === 0, "final: jurado vota só no melhor ⭐ entre os 2");
  await m.tap(`.ve[data-id="${idsF[0]}"]`); await m.tap("#b-confirma");
  await m.evaluate(() => teste.pulaRevelacao());
  await m.waitForSelector("#b-seguir", { timeout: 8000 }); await m.tap("#b-seguir");
  ok(await esperaTela(m, "final"), `amigos: campeão = ${(await est(m)).campeao}`);
  await espera(800);
  await m.screenshot({ path: path.join(SHOTS, "final-celular.png") });

  // 5) faixa INEMA.CLUB + painel com QR
  const faixa = await m.evaluate(() => { const r = document.getElementById("puxador").getBoundingClientRect();
    const el = document.elementFromPoint(innerWidth / 2, innerHeight - 20);
    const j = document.getElementById("jogo").getBoundingClientRect();
    return { bottom: r.bottom, h: r.height, vh: innerHeight, emCima: el && el.id, jogoBot: j.bottom }; });
  ok(faixa.h === 46 && Math.abs(faixa.bottom - faixa.vh) <= 1 && faixa.emCima === "puxador" && faixa.jogoBot <= faixa.vh - 46 + 1,
     `faixa amarela embaixo, jogo acima dela (jogo até ${faixa.jogoBot}, faixa em #${faixa.emCima})`);
  await m.tap("#puxador");
  await espera(1200);
  const pain = await m.evaluate(() => { const q = document.querySelector("#qr-painel svg"); const r = q && q.getBoundingClientRect();
    return { y: scrollY, qr: !!q, qrTop: r && r.top, qrBot: r && r.bottom, qrW: r && r.width, vh: innerHeight }; });
  ok(pain.qr && pain.y > 300 && pain.qrTop >= 0 && pain.qrBot <= pain.vh && pain.qrW > 150, `puxador mostra o painel com QR (scrollY ${pain.y}, QR ${pain.qrW && pain.qrW.toFixed(0)} px)`);
  await m.screenshot({ path: path.join(SHOTS, "painel-celular.png") });
  await m.tap("#p-voltar");
  await espera(1200);
  ok(await m.evaluate(() => scrollY) === 0, '"Voltar ao jogo" volta ao topo');
  await m.evaluate(() => telaCriar());
  await espera(300);
  await m.screenshot({ path: path.join(SHOTS, "criar-celular.png") });

  ok(erros.length === 0, "sem erros de página/console" + (erros.length ? ":\n  " + erros.join("\n  ") : ""));
  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO OK");
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
