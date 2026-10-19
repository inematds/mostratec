// Junta meta.json (catálogo original do EAI), status.json (teste automático) e
// avaliacao.json (o que o Nei decidiu) em dados.js, que a página lê.
// dados.js é um <script> e não um fetch, para a página funcionar também em file://.
// Uso: node monta.cjs
const fs = require("fs"), path = require("path");
const ler = (a, padrao) => { const p = path.join(__dirname, a); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : padrao; };
const meta = ler("meta.json", { lista: [] });
const status = ler("status.json", {});
const aval = ler("avaliacao.json", {});
const jogos = meta.lista.map((j, i) => ({
  n: i + 1,
  slug: j.slug, titulo: j.titulo, descricao: j.descricao,
  area: j.area === "ARCADE" ? "Arcade" : "Educacional",
  categoria: j.categoria, idade: j.idade, serie: j.serie,
  arquivo: "jogos/" + j.arquivo,
  capa: "capas/" + j.slug + ".jpg",
  teste: (status[j.slug] || {}).teste || "sem teste",
  problemas: (status[j.slug] || {}).problemas || [],
  avaliacao: (aval[j.slug] || {}).situacao || "a avaliar",
  obs: (aval[j.slug] || {}).obs || "",
  revisao: (aval[j.slug] || {}).revisao || "",
}));
const saida = "// Gerado por monta.cjs — não editar à mão.\nwindow.JOGOS = " + JSON.stringify(jogos) + ";\n";
fs.writeFileSync(path.join(__dirname, "dados.js"), saida);
console.log(jogos.length, "jogos em dados.js");
