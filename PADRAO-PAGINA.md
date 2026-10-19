# Padrão das páginas de orientação (MOSTRATEC 2026)

Vale para `11-solucoes-praticas/`, `01-robo-que-anda/` e qualquer página nova de orientação neste repo.
Os jogos têm padrão próprio (`10-fabrica-de-jogos/PADRAO-JOGO.md`).

## Público e tom
- Adolescentes do ensino médio na feira, abrindo pelo QR no celular. Depois continuam em casa ou na escola.
- "Você", voz ativa, verbo concreto ("Ligue o fio vermelho no 3V3"). Sem hype, sem "!!", sem infantilizar.
- Promessa verificável antes do conceito. Analogia do mundo real quando ajudar.
- Nada é montado pelo INEMA: a página ensina, a pessoa monta, testa e melhora.

## Técnica
- HTML puro, um `index.html` por página, sem build. Funciona no GitHub Pages e em `file://`.
- Estilo: `<link rel="stylesheet" href="<caminho relativo>/assets/pagina.css">` (na raiz do repo). Use as classes de lá
  (`topo`, `wrap`, `hero`, `chip`, `lead`, `btn pri`, `grade`, `card`, `fig`, `passos`, `tabela`, `dica`, `alerta`, `teste`).
  CSS extra só pontual, num `<style>` curto, e só com as variáveis (`var(--amb)` etc.), nunca hex solto.
- Diagramas (circuito, mecanismo, rota, fluxo): **SVG inline desenhado no código**, traço fino estilo Lucide, `currentColor`/variáveis, rótulos em texto de verdade (legível no celular, ≥ 12px no tamanho exibido).
- Ícones: SVG de traço fino. **Sem emoji no texto corrido** (emoji só, se for, no título de cartão).
- Fontes: Sora (título), Inter (corpo), JetBrains Mono (código) — já vêm no CSS.
- Celular primeiro (390 px sem rolagem lateral); também bonito em 1366 px.
- `<title>` curto, `<meta name="description">`, `lang="pt-BR"`.
- Robô em imagem gerada segue V12 (humanoide industrial/realista, nunca mascote). Nestas páginas, prefira diagrama SVG em vez de imagem gerada.
- Datas do INEMA na feira: 27 a 29 de outubro de 2026, FENAC, Novo Hamburgo/RS (a Mostratec vai até 30, o INEMA não).
- Rodapé: "INEMA na MOSTRATEC 2026 · cursos abertos e gratuitos no INEMA.CLUB" com link https://inema.club/?src=mostratec e link para a página-mãe da seção.

## Estrutura de uma página de orientação
1. Topo (marca INEMA + navegação da seção).
2. Hero: chip, título, lead de 2–3 frases ("o que você vai construir e para quem serve"), botões.
3. "Como funciona": diagrama SVG + 3–5 frases.
4. "Peças": tabela com peça, para que serve, preço aproximado (out/2026, "a conferir").
5. "Ligação": diagrama do circuito com os pinos.
6. "Passo a passo": `ol.passos`.
7. "Código": bloco curto e comentado em português, pronto para copiar (Arduino IDE / MicroPython / Python).
8. "Teste e melhore": checklist do que conferir, os erros mais comuns e como registrar o que não deu certo (versão 1 → versão 2). Sugestão: anotar num caderno de testes com data, o que mudou, resultado.
9. Segurança (`alerta`) quando houver tomada, água, bateria, motor ou câmera.
10. Para ir além: IA no projeto + ligação com cursos do INEMA.CLUB (ex.: https://inematds.github.io/robot/ , https://inematds.github.io/HG1/ , https://inematds.github.io/vla/ , https://inematds.github.io/ia-do-zero-curso/ , https://inematds.github.io/oswork-quick/).
11. Rodapé.

## Teste antes de entregar
- Playwright global (`require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')`): abrir cada página em 390×844 e 1366×800, zero `pageerror`, `scrollWidth` = largura, todos os links internos existem.
- Tirar screenshots e **olhar** (Read). Corrigir o que estiver cortado, apertado ou ilegível.

## Não fazer
- Commit/push (o agente principal faz). API, chave, serviço externo, formulário que envia dados.
