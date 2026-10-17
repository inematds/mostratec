// Teste automático do "Seja um Bombeiro" (Playwright + Chromium headless)
// Uso: node testa.cjs
const path = require("path"), fs = require("fs");
const { chromium } = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");

const ARQ = path.join(__dirname, "index.html");
const URL = "file://" + ARQ;
const SHOTS = path.join(__dirname, "screenshots");
fs.mkdirSync(SHOTS, { recursive: true });
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? "OK   " : "FALHA ") + msg); if (!cond) falhas++; };
const espera = ms => new Promise(r => setTimeout(r, ms));

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

  // 1) demo joga sozinho por 20 s
  const d = await novaPagina({ viewport: { width: 1280, height: 800 } });
  await d.goto(URL + "?demo=1");
  await espera(3000);
  const e0 = await d.evaluate(() => window.estadoDoJogo());
  await espera(17000);
  const e1 = await d.evaluate(() => window.estadoDoJogo());
  console.log("demo 3 s:", JSON.stringify(e0));
  console.log("demo 20 s:", JSON.stringify(e1));
  ok(e1.pontos > e0.pontos, "demo: pontos subiram");
  ok(e1.apagados >= 1, "demo: apagou incêndio");
  ok(e1.missoesFeitas >= 1, "demo: cumpriu missão");
  await d.screenshot({ path: path.join(SHOTS, "demo-1280.png") });

  // demo no celular (para ver o jogo em ação no retrato)
  const dm = await novaPagina({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await dm.goto(URL + "?demo=1");
  await espera(9000);
  await dm.screenshot({ path: path.join(SHOTS, "demo-celular.png") });

  // 2) tela inicial → Jogar → teclado e toque
  const p = await novaPagina({ viewport: { width: 1280, height: 800 } });
  await p.goto(URL);
  await espera(500);
  await p.screenshot({ path: path.join(SHOTS, "inicio-1280.png") });
  await p.click("text=▶ Jogar");
  await espera(300);
  const a0 = await p.evaluate(() => window.estadoDoJogo());
  await p.keyboard.down("ArrowRight"); await espera(800); await p.keyboard.up("ArrowRight");
  const a1 = await p.evaluate(() => window.estadoDoJogo());
  ok(a1.x > a0.x + 50, `teclado move o bombeiro (${a0.x.toFixed(0)} → ${a1.x.toFixed(0)})`);
  await p.mouse.move(640, 400); await p.mouse.down(); await p.mouse.move(640, 520, { steps: 5 }); await espera(800); await p.mouse.up();
  const a2 = await p.evaluate(() => window.estadoDoJogo());
  ok(a2.y > a1.y + 50, `arraste (joystick) move o bombeiro (${a1.y.toFixed(0)} → ${a2.y.toFixed(0)})`);
  // segurar a água gasta o tanque
  await p.keyboard.down(" "); await espera(700); await p.keyboard.up(" ");
  const a3 = await p.evaluate(() => window.estadoDoJogo());
  ok(a3.agua < a2.agua, `espaço solta água (${a2.agua.toFixed(0)} → ${a3.agua.toFixed(0)} L)`);
  await p.screenshot({ path: path.join(SHOTS, "jogo-1280.png") });
  // pula para um nível alto (helicóptero e bairro novo) e confere que nada quebra
  await p.evaluate(() => ganhaXP(1500));
  await espera(4000);
  const a4 = await p.evaluate(() => window.estadoDoJogo());
  ok(a4.nivel >= 7 && a4.veiculo === "helicoptero", `nível alto: nível ${a4.nivel}, veículo ${a4.veiculo}`);
  await p.keyboard.down("ArrowDown"); await espera(600); await p.keyboard.up("ArrowDown");
  await p.screenshot({ path: path.join(SHOTS, "nivel-alto-1280.png") });

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

  // 4) celular: início e jogo com toque
  const m = await novaPagina({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await m.goto(URL);
  await espera(500);
  await m.screenshot({ path: path.join(SHOTS, "inicio-celular.png") });
  await m.tap("text=▶ Jogar");
  await espera(400);
  const c0 = await m.evaluate(() => window.estadoDoJogo());
  await m.mouse.move(200, 500); await m.mouse.down(); await m.mouse.move(200, 380, { steps: 5 }); await espera(700); await m.mouse.up();
  const c1 = await m.evaluate(() => window.estadoDoJogo());
  ok(c1.y < c0.y - 30 || c1.x !== c0.x, `celular: arraste move (${c0.y.toFixed(0)} → ${c1.y.toFixed(0)})`);
  await m.screenshot({ path: path.join(SHOTS, "jogo-celular.png") });

  // 5) faixa INEMA.CLUB + painel com QR (regra 17/10)
  const faixa = await m.evaluate(() => { const r = document.getElementById("puxador").getBoundingClientRect();
    const el = document.elementFromPoint(innerWidth / 2, innerHeight - 20);
    return { top: r.top, bottom: r.bottom, h: r.height, vh: innerHeight, emCima: el && el.id };
  });
  ok(faixa.h === 46 && Math.abs(faixa.bottom - faixa.vh) <= 1 && faixa.emCima === "puxador",
     `faixa amarela visível embaixo (${faixa.top}–${faixa.bottom} de ${faixa.vh}, toque cai em #${faixa.emCima})`);
  const sobe = await m.evaluate(() => { const v = n => document.getElementById(n).getBoundingClientRect().bottom;
    return { tanque: v("tanque"), botoes: v("botoes"), limite: innerHeight - 46 }; });
  ok(sobe.tanque <= sobe.limite && sobe.botoes <= sobe.limite, `tanque e botões acima da faixa (${sobe.tanque.toFixed(0)}, ${sobe.botoes.toFixed(0)} ≤ ${sobe.limite})`);
  await m.tap("#puxador");
  await espera(1200);
  const pain = await m.evaluate(() => { const q = document.querySelector("#qr-painel svg"); const r = q && q.getBoundingClientRect();
    return { y: scrollY, alvo: Math.min(document.getElementById("painel").offsetTop, document.documentElement.scrollHeight - innerHeight), qr: !!q, qrTop: r && r.top, qrBot: r && r.bottom, qrW: r && r.width, vh: innerHeight }; });
  ok(pain.qr && pain.y > 300 && Math.abs(pain.y - pain.alvo) <= 2 && pain.qrTop >= 0 && pain.qrBot <= pain.vh && pain.qrW > 150,
     `puxador rola até o painel (scrollY ${pain.y}, QR ${pain.qrW && pain.qrW.toFixed(0)} px em ${pain.qrTop && pain.qrTop.toFixed(0)}–${pain.qrBot && pain.qrBot.toFixed(0)})`);
  await m.screenshot({ path: path.join(SHOTS, "painel-celular.png") });
  await m.tap("text=⬆ Voltar ao jogo");
  await espera(1200);
  const yv = await m.evaluate(() => scrollY);
  ok(yv === 0, `"Voltar ao jogo" volta ao topo (scrollY ${yv})`);
  // toque de verdade (eventos de touch) no canvas ainda move o bombeiro (para baixo: o arraste anterior levou o bombeiro ao topo do bairro)
  const cdp = await m.context().newCDPSession(m);
  const toque = async (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  const t0 = await m.evaluate(() => window.estadoDoJogo());
  await toque("touchStart", 200, 450);
  for (let i = 1; i <= 6; i++) { await toque("touchMove", 200, 450 + i * 20); await espera(30); }
  await espera(700);
  await toque("touchEnd");
  await espera(100);
  const t1 = await m.evaluate(() => window.estadoDoJogo());
  const y2 = await m.evaluate(() => scrollY);
  ok(t1.y > t0.y + 30 && y2 === 0, `toque no canvas move o bombeiro depois do painel (${t0.y.toFixed(0)} → ${t1.y.toFixed(0)}), página parada (scrollY ${y2})`);
  await m.screenshot({ path: path.join(SHOTS, "jogo-celular-depois.png") });
  await m.evaluate(() => telaCriar());
  await espera(300);
  await m.screenshot({ path: path.join(SHOTS, "criar-celular.png") });

  ok(erros.length === 0, "sem erros de página/console" + (erros.length ? ":\n  " + erros.join("\n  ") : ""));
  await browser.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO OK");
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
