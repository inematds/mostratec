// Grava em cada página o hash da resposta e a explicação cifrada (lidos do gabarito.cjs).
// Uso: node 03-desafios/gera.cjs   (rodar de novo é seguro: o resultado é sempre o mesmo)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const D = require('./desafio.js');
const gabarito = require('./gabarito.cjs');

(async () => {
  for (const g of gabarito) {
    const arq = path.join(__dirname, g.id, 'index.html');
    if (!fs.existsSync(arq)) { console.log('FALTA', arq); process.exitCode = 1; continue; }
    const resp = D.junta(g.resp, g.tipos);
    // IV fixo por desafio (uma mensagem por chave): o arquivo só muda se o gabarito mudar.
    const iv = crypto.createHash('sha256').update('iv:' + g.id).digest().subarray(0, 12);
    const cofre = { hash: await D.hashResposta(g.id, resp), iv: iv.toString('base64'), exp: await D.cifra(g.id, resp, g.exp.trim(), iv) };
    const html = fs.readFileSync(arq, 'utf8');
    const re = /(<script type="application\/json" id="cofre">)[\s\S]*?(<\/script>)/;
    if (!re.test(html)) { console.log('SEM COFRE', arq); process.exitCode = 1; continue; }
    fs.writeFileSync(arq, html.replace(re, `$1${JSON.stringify(cofre)}$2`));
    const campos = (html.match(/<input[^>]*data-tipo=/g) || []).length;
    if (campos !== g.resp.length) { console.log(`CAMPOS ${g.id}: página tem ${campos}, gabarito tem ${g.resp.length}`); process.exitCode = 1; }
    console.log('ok', g.id);
  }
})();
