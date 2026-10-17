// Teste automático do "Rancho dos Cavalos" (Playwright + Chromium headless)
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
const CEL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };
const PC = { viewport: { width: 1280, height: 800 } };

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
  const est = p => p.evaluate(() => window.estadoDoJogo());

  // 1) demo joga sozinho (PC e celular ao mesmo tempo); print de cada lugar que a demo visita
  const rodaDemo = async (opts, sufixo, segundos) => {
    const d = await novaPagina(opts);
    await d.goto(URL + "?demo=1");
    await espera(3000);
    const e0 = await est(d);
    const vistos = {}; let e20 = null, eFim = null, etapas = new Set();
    for (let t = 3; t < segundos; t += 0.5) {
      await espera(500);
      const e = await est(d);
      etapas.add(e.modo);
      if (!e20 && t >= 20) e20 = e;
      const chave = e.modo + (e.modo === "trilha" ? "-" + e.demoEtapa : "");
      if (!vistos[chave]) vistos[chave] = t;
      else if (vistos[chave] !== true && t - vistos[chave] >= 2.5) { vistos[chave] = true; await d.screenshot({ path: path.join(SHOTS, `demo-${chave}-${sufixo}.png`) }); }
      eFim = e;
      if (e.corridas >= 1 && e.bailes >= 1 && e.modo === "mapa") break;
    }
    return { e0, e20, eFim, etapas: [...etapas] };
  };
  const [dPC, dCel] = await Promise.all([rodaDemo(PC, "1280", 130), rodaDemo(CEL, "celular", 130)]);
  console.log("demo 3 s :", JSON.stringify({ ...dPC.e0, curral: undefined, lugares: undefined, estabulo: undefined }));
  console.log("demo 20 s:", JSON.stringify({ ...dPC.e20, curral: undefined, lugares: undefined, estabulo: undefined }));
  ok(dPC.e20.moedas > dPC.e0.moedas && dPC.e20.xp > dPC.e0.xp, `demo 20 s: moedas ${dPC.e0.moedas}→${dPC.e20.moedas}, XP ${dPC.e0.xp}→${dPC.e20.xp}`);
  ok(dPC.e20.lacados >= 1, `demo 20 s: laçou ${dPC.e20.lacados} cavalo(s)`);
  ok(dPC.e20.missoesFeitas >= 1, `demo 20 s: cumpriu ${dPC.e20.missoesFeitas} missão(ões)`);
  for (const [nome, d] of [["PC", dPC], ["celular", dCel]]) {
    const f = d.eFim;
    ok(f.aulas >= 1 && f.corridas >= 1 && f.aventuras >= 1 && f.acalmados >= 1 && f.pulos >= 1,
       `demo ${nome}: aventura ${f.aventuras}, pulos ${f.pulos}, acalmou ${f.acalmados}, aula ${f.aulas}, corrida ${f.corridas}, baile ${f.bailes}, troféus ${f.trofeus}`);
    ok(["curral", "estabulo", "trilha", "baile", "cidade"].every(m => d.etapas.includes(m)), `demo ${nome} passou por: ${d.etapas.join(", ")}`);
  }

  // 2) tela inicial → escolher personagem → Jogar → laçar, cuidar, cavalgar
  const p = await novaPagina(PC);
  await p.goto(URL);
  await espera(600);
  await p.screenshot({ path: path.join(SHOTS, "inicio-1280.png") });
  await p.click('.pers[data-tipo="menino"]');
  await p.click('.cor[data-cor="#22c55e"]');
  await p.fill("#nome-cavalo", "Raio");
  await p.click("text=▶ Jogar");
  await espera(500);
  let a = await est(p);
  ok(a.modo === "mapa" && a.personagem === "menino" && a.nomeCavalo === "Raio", `Jogar: modo ${a.modo}, personagem ${a.personagem}, cavalo "${a.nomeCavalo}"`);
  await p.screenshot({ path: path.join(SHOTS, "mapa-1280.png") });
  const faz = a.lugares[0];
  await p.mouse.click(faz.x + faz.w / 2, faz.y + faz.h / 2);
  await espera(400);
  a = await est(p);
  ok(a.modo === "curral", `toque na Fazenda abre o curral (${a.modo})`);
  // laçar com o mouse: segura em cima do cavalo, espera a barra ficar verde, solta
  for (let i = 0; i < 8 && (await est(p)).cavalos < 1; i++) {
    let e = await est(p); const h = e.curral[0];
    await p.mouse.move(h.x, h.y); await p.mouse.down();
    await espera(420);
    e = await est(p); const h2 = e.curral[0];
    await p.mouse.move(h2.x, h2.y);
    if (i === 0) await p.screenshot({ path: path.join(SHOTS, "curral-1280.png") });
    await p.mouse.up();
    await espera(2200);
  }
  a = await est(p);
  ok(a.cavalos >= 1 && a.lacados >= 1, `laçou com o mouse (${a.cavalos} cavalo no estábulo)`);
  ok(a.missoesFeitas >= 1, `missão 1 cumprida (${a.missoesFeitas}); agora: "${a.missao}"`);
  // estábulo
  await p.evaluate(() => irPara("estabulo"));
  await espera(500);
  a = await est(p);
  const L = a.estabulo, cx = L.corpo.x + L.corpo.w / 2, cy = L.corpo.y + L.corpo.h / 2;
  await p.mouse.move(cx - 40, cy); await p.mouse.down();
  for (let i = 0; i < 16; i++) await p.mouse.move(cx + (i % 2 ? 50 : -50), cy + (i % 3) * 8, { steps: 4 });
  await p.mouse.up();
  let b = await est(p);
  ok(b.limpeza > a.limpeza + 5, `escovar arrastando: limpeza ${a.limpeza.toFixed(0)} → ${b.limpeza.toFixed(0)}`);
  await p.click("#f-feno"); await espera(300);
  const c1 = await est(p);
  ok(c1.fome > b.fome, `feno: fome ${b.fome.toFixed(0)} → ${c1.fome.toFixed(0)}`);
  const pile = await p.evaluate(() => posMonte(0, cavaloAtivo().sujeira)), car = c1.estabulo.carrinho;
  await p.mouse.move(pile.x, pile.y); await p.mouse.down(); await p.mouse.move(car.x + car.w / 2, car.y + car.h / 2, { steps: 8 }); await p.mouse.up();
  await espera(300);
  const c2 = await est(p);
  ok(c2.sujeira === c1.sujeira - 1, `arrastar sujeira ao carrinho: ${c1.sujeira} → ${c2.sujeira}`);
  await p.screenshot({ path: path.join(SHOTS, "estabulo-1280.png") });
  // cavalgar: Campo → aventura
  await p.evaluate(() => irPara("campo"));
  await espera(300);
  await p.screenshot({ path: path.join(SHOTS, "menu-campo-1280.png") });
  await p.click("text=Passeio na trilha");
  await espera(300);
  await p.evaluate(() => { R.objs = []; });   // pista livre para medir as andaduras sem tronco no caminho
  await p.keyboard.press("2"); await espera(1500);
  a = await est(p);
  ok(a.modo === "trilha" && a.andadura === 2 && a.velocidade > 120, `tecla 2 = trote (andadura ${a.andadura}, ${a.velocidade.toFixed(0)} px/s)`);
  await p.keyboard.press("3"); await espera(1200);
  b = await est(p);
  ok(b.andadura === 3 && b.velocidade > a.velocidade + 50 && b.energia < 100, `tecla 3 = galope (${b.velocidade.toFixed(0)} px/s, energia ${b.energia.toFixed(0)})`);
  await p.screenshot({ path: path.join(SHOTS, "trilha-galope-1280.png") });
  await p.click("#g1"); await espera(1000);
  a = await est(p);
  ok(a.andadura === 1 && a.velocidade < 130, `botão Passo (${a.andadura}, ${a.velocidade.toFixed(0)} px/s)`);
  // susto: empina; segurar A acalma
  await p.evaluate(() => assusta("cobra")); await espera(700);
  a = await est(p);
  ok(a.assustado && a.empinando, `susto: cavalo empinou (medo ${a.medo.toFixed(0)})`);
  await p.screenshot({ path: path.join(SHOTS, "trilha-susto-1280.png") });
  await p.keyboard.down("a"); await espera(2500); await p.keyboard.up("a");
  b = await est(p);
  ok(!b.assustado && b.acalmados > a.acalmados, `segurar A acalma (acalmados ${a.acalmados} → ${b.acalmados})`);
  // botão Acalmar (segurar com o mouse)
  await p.evaluate(() => assusta("passaro")); await espera(400);
  const ba = await p.locator("#b-acalmar").boundingBox();
  await p.mouse.move(ba.x + ba.width / 2, ba.y + ba.height / 2); await p.mouse.down(); await espera(2500); await p.mouse.up();
  a = await est(p);
  ok(!a.assustado && a.acalmados > b.acalmados, `segurar o botão Acalmar (acalmados ${b.acalmados} → ${a.acalmados})`);

  // 3) Criar a minha versão → Baixar
  await p.evaluate(() => telaCriar());
  await espera(300);
  await p.screenshot({ path: path.join(SHOTS, "criar-1280.png") });
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#tela >> text=⬇ Baixar o jogo")]);
  const tmp = path.join(SHOTS, "_download.html");
  await dl.saveAs(tmp);
  const tamDl = fs.statSync(tmp).size, tamArq = fs.statSync(ARQ).size;
  fs.unlinkSync(tmp);
  ok(Math.abs(tamDl - tamArq) / tamArq < 0.02, `download ${tamDl} bytes ≈ arquivo ${tamArq} bytes`);

  // 4) celular: início, jogo, telas e lugares
  const m = await novaPagina(CEL);
  await m.goto(URL);
  await espera(600);
  await m.screenshot({ path: path.join(SHOTS, "inicio-celular.png") });
  const cx2 = await m.evaluate(() => { const r = document.querySelector("#tela .caixa"); return { sh: r.scrollHeight, ch: r.clientHeight }; });
  ok(cx2.sh <= cx2.ch + 2, `tela inicial cabe sem rolar no celular (${cx2.sh} ≤ ${cx2.ch})`);
  await m.tap('.pers[data-tipo="menina"]');
  await m.tap("text=▶ Jogar");
  await espera(500);
  await m.screenshot({ path: path.join(SHOTS, "mapa-celular.png") });
  await m.evaluate(() => irPara("fazenda")); await espera(1500);
  await m.screenshot({ path: path.join(SHOTS, "curral-celular.png") });
  // laça com o botão "Girar e soltar" (mira automática)
  for (let i = 0; i < 6 && (await est(m)).cavalos < 1; i++) {
    const bb = await m.locator("#b-lancar").boundingBox();
    await m.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await m.mouse.down(); await espera(450); await m.mouse.up(); await espera(2300);
  }
  ok((await est(m)).cavalos >= 1, "celular: laçou com o botão Girar e soltar");

  // 5) faixa INEMA.CLUB + painel com QR (regra 17/10)
  await m.evaluate(() => irPara("estabulo")); await espera(400);
  const faixa = await m.evaluate(() => { const r = document.getElementById("puxador").getBoundingClientRect();
    const el = document.elementFromPoint(innerWidth / 2, innerHeight - 20);
    return { top: r.top, bottom: r.bottom, h: r.height, vh: innerHeight, emCima: el && el.id, ctr: document.getElementById("controles").getBoundingClientRect().bottom };
  });
  ok(faixa.h === 46 && Math.abs(faixa.bottom - faixa.vh) <= 1 && faixa.emCima === "puxador",
     `faixa amarela visível embaixo (${faixa.top}–${faixa.bottom} de ${faixa.vh}, toque cai em #${faixa.emCima})`);
  ok(faixa.ctr <= faixa.vh - 46, `botões acima da faixa (${faixa.ctr.toFixed(0)} ≤ ${faixa.vh - 46})`);
  await m.screenshot({ path: path.join(SHOTS, "estabulo-celular.png") });
  await m.tap("#puxador");
  await espera(1200);
  const pain = await m.evaluate(() => { const q = document.querySelector("#qr-painel svg"); const r = q && q.getBoundingClientRect();
    return { y: scrollY, alvo: Math.min(document.getElementById("painel").offsetTop, document.documentElement.scrollHeight - innerHeight), qr: !!q, qrTop: r && r.top, qrBot: r && r.bottom, qrW: r && r.width, vh: innerHeight }; });
  ok(pain.qr && pain.y > 300 && Math.abs(pain.y - pain.alvo) <= 2 && pain.qrTop >= 0 && pain.qrBot <= pain.vh && pain.qrW > 150,
     `puxador rola até o painel (scrollY ${pain.y}, QR ${pain.qrW && pain.qrW.toFixed(0)} px em ${pain.qrTop && pain.qrTop.toFixed(0)}–${pain.qrBot && pain.qrBot.toFixed(0)})`);
  await m.screenshot({ path: path.join(SHOTS, "painel-celular.png") });
  await m.tap("text=⬆ Voltar ao jogo");
  await espera(1200);
  ok((await m.evaluate(() => scrollY)) === 0, "\"Voltar ao jogo\" volta ao topo");
  // toque de verdade (CDP) no canvas: escovar o cavalo
  const cdp = await m.context().newCDPSession(m);
  const toque = async (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  const t0 = await est(m), C = t0.estabulo.corpo, tx = C.x + C.w / 2, ty = C.y + C.h / 2;
  await toque("touchStart", tx - 30, ty);
  for (let i = 1; i <= 14; i++) { await toque("touchMove", tx + (i % 2 ? 40 : -40), ty + (i % 3) * 5); await espera(25); }
  await toque("touchEnd"); await espera(100);
  const t1 = await est(m), y2 = await m.evaluate(() => scrollY);
  ok(t1.limpeza > t0.limpeza + 3 && y2 === 0, `toque no canvas escova o cavalo (${t0.limpeza.toFixed(0)} → ${t1.limpeza.toFixed(0)}), página parada (scrollY ${y2})`);
  // cavalgada no celular, com toque nos botões
  await m.evaluate(() => iniciaAventura(0)); await espera(300);
  await m.tap("#g3"); await espera(1500);
  ok((await est(m)).andadura === 3, "celular: botão Galope");
  await m.screenshot({ path: path.join(SHOTS, "trilha-celular.png") });
  await m.evaluate(() => assusta("barulho")); await espera(800);
  await m.screenshot({ path: path.join(SHOTS, "trilha-susto-celular.png") });
  // pula para nível alto: todos os lugares abertos; prints dos menus e lugares
  await m.evaluate(() => { ganhaXP(700); E.moedas += 300; irPara("mapa"); });
  await espera(2500);
  await m.screenshot({ path: path.join(SHOTS, "mapa-nivel-alto-celular.png") });
  ok((await est(m)).nivel >= 7, "nível alto sem erro");
  await m.evaluate(() => iniciaAula(1)); await espera(1500);
  await m.screenshot({ path: path.join(SHOTS, "aula-celular.png") });
  await m.evaluate(() => iniciaCampeonato("corrida")); await m.tap("#g3"); await espera(2500);
  await m.screenshot({ path: path.join(SHOTS, "corrida-celular.png") });
  await m.evaluate(() => iniciaProva("tambor")); await espera(1500);
  await m.screenshot({ path: path.join(SHOTS, "prova-tambor-celular.png") });
  for (const [nome, js] of [["menu-escola", "menuEscola()"], ["menu-arena", "menuArena()"], ["loja", "telaLoja()"], ["estante", "telaEstante()"], ["quiz", "telaQuiz()"], ["criar", "telaCriar()"]]) {
    await m.evaluate(js); await espera(300);
    await m.screenshot({ path: path.join(SHOTS, nome + "-celular.png") });
  }
  await m.evaluate(() => comprar("chapeu-palha"));
  await m.evaluate(() => comprar("redea-arco"));
  await m.evaluate(() => irPara("cidade")); await espera(500);
  await m.screenshot({ path: path.join(SHOTS, "cidade-celular.png") });
  ok((await est(m)).itens >= 2, "comprou itens na loja");
  await m.evaluate(() => irPara("baile")); await espera(3500);
  await m.tap("#b-danca");
  await m.screenshot({ path: path.join(SHOTS, "baile-celular.png") });
  await m.evaluate(() => iniciaAventura(3)); await m.tap("#g2"); await espera(5000);
  await m.screenshot({ path: path.join(SHOTS, "rio-celular.png") });

  ok(erros.length === 0, "sem erros de página/console" + (erros.length ? ":\n  " + [...new Set(erros)].join("\n  ") : ""));
  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO OK");
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
