// Teste rápido de todos os jogos EAI: abre cada um no tamanho de celular, toca na tela,
// aperta espaço e registra erros, pedidos de rede para fora e rolagem lateral.
// Uso: node testa-todos.cjs http://127.0.0.1:<porta>/12-jogos-eai/ [slug...]
// Saída: status.json (lido pela página) e prints em shots/<slug>.png
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");

const BASE = process.argv[2];
const so = new Set(process.argv.slice(3));
const meta = JSON.parse(fs.readFileSync(path.join(__dirname, "meta.json"), "utf8"));
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const arqStatus = path.join(__dirname, "status.json");
const status = fs.existsSync(arqStatus) ? JSON.parse(fs.readFileSync(arqStatus, "utf8")) : {};
const espera = ms => new Promise(r => setTimeout(r, ms));
const local = new URL(BASE).host;
// Fontes do Google são permitidas (só estilo); qualquer outro host externo é anotado.
const permitido = h => h === local || h === "fonts.googleapis.com" || h === "fonts.gstatic.com";

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const j of meta.lista) {
    if (so.size && !so.has(j.slug)) continue;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const erros = [], fora = new Set(), falhou = [];
    page.on("pageerror", e => erros.push(e.message.slice(0, 160)));
    page.on("console", m => { if (m.type() === "error") erros.push("console: " + m.text().slice(0, 160)); });
    page.on("request", r => { const h = new URL(r.url()).host; if (h && !permitido(h)) fora.add(h); });
    page.on("requestfailed", r => { if (new URL(r.url()).host === local) falhou.push(r.url().replace(BASE, "")); });
    const url = BASE + "jogos/" + j.arquivo;
    let carregou = true;
    try { await page.goto(url, { waitUntil: "load", timeout: 15000 }); } catch (e) { carregou = false; erros.push("load: " + e.message.slice(0, 100)); }
    await espera(1500);
    try { await page.mouse.click(195, 500); await page.keyboard.press("Space"); await page.keyboard.press("ArrowRight"); } catch (e) {}
    await espera(1500);
    let info = {};
    try {
      info = await page.evaluate(() => ({
        larg: document.documentElement.scrollWidth,
        texto: (document.body.innerText || "").trim().length,
        canvas: document.querySelectorAll("canvas").length,
        titulo: document.title,
      }));
    } catch (e) {}
    try { await page.screenshot({ path: path.join(SHOTS, j.slug + ".png") }); } catch (e) {}
    const problemas = [];
    if (!carregou) problemas.push("não carregou");
    if (erros.length) problemas.push(erros.length + " erro(s)");
    if (fora.size) problemas.push("rede: " + [...fora].join(","));
    if (falhou.length) problemas.push("arquivo faltando");
    if (info.larg > 392) problemas.push("rola de lado no celular (" + info.larg + "px)");
    if (!info.texto && !info.canvas) problemas.push("tela vazia");
    const anterior = status[j.slug] || {};
    status[j.slug] = {
      ...anterior,
      teste: problemas.length ? "atencao" : "ok",
      problemas, erros: erros.slice(0, 5), faltando: falhou.slice(0, 5),
      testadoEm: new Date().toISOString().slice(0, 16),
    };
    console.log((problemas.length ? "!! " : "ok ") + j.slug + (problemas.length ? " — " + problemas.join("; ") : ""));
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(arqStatus, JSON.stringify(status, null, 1));
  const n = Object.values(status).filter(s => s.teste === "ok").length;
  console.log(`\n${n}/${Object.keys(status).length} sem problema`);
})();
