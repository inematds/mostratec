# Padrão de todo jogo da Fábrica de Jogos INEMA

Modelo de referência: `jogos/roube-o-ovo/index.html`. Leia esse arquivo antes de começar.

## Público e objetivo
- Adolescentes do ensino médio, além das crianças que passam no estande da MOSTRATEC (27 a 30/10/2026).
- Objetivo: a pessoa joga, gosta e quer **criar a própria versão**. Todo jogo tem o botão "🛠️ Criar a minha versão".

## Regra do Nei (17/10): missões rápidas, níveis fáceis, crescer rápido
- **Missões rápidas:** sempre 1 missão ativa na tela, que se cumpre em 10 a 40 s ("Descasque 3 batatas", "Apague 2 incêndios"). Ao cumprir: comemoração (pop, partículas, som opcional), recompensa e a próxima missão na hora.
- **Níveis fáceis:** o nível 1 não tem como perder. A dificuldade sobe devagar. Nada de game over nos primeiros 2 minutos.
- **Crescer rápido:** a cada 30 a 60 s a pessoa ganha algo visível: novo nível, item, evolução, área nova, upgrade. Números grandes subindo (moedas e pontos) e barra de XP/nível sempre à vista.
- Uma sessão completa e satisfatória cabe em 3 a 5 minutos (fila da feira).

## Técnica (obrigatório)
- **UM arquivo `index.html`**, HTML + CSS + JS puro, sem biblioteca, sem CDN, sem imagens externas. Funciona offline e em `file://`.
- Gráficos desenhados em canvas ou SVG pelo próprio código, em estilo cartoon simples e colorido, com contorno escuro.
- **Celular primeiro:** toque/arraste funcionam, botões grandes, sem rolagem da página. Também funciona com mouse e teclado no PC.
- No topo do `<script>`, um objeto **`CONFIG`** comentado em português, com tudo o que dá para mudar sem programar: títulos, nomes, cores, velocidades, missões, níveis, preços, textos. Abaixo, o comentário `/* ===== daqui para baixo é o motor ===== */`.
- Constante `VERSAO = "0.1.0"` no código.
- `?demo=1` → o jogo joga sozinho (vitrine do telão no estande).
- Tela inicial: título, como jogar em 2 linhas, botões "▶ Jogar" e "🛠️ Criar a minha versão".
- Tela "Criar a minha versão": botão **Baixar o jogo** (Blob com o HTML original, igual ao modelo) + 3 passos (baixar, mudar o CONFIG, pedir a uma IA) + **um exemplo de prompt específico desse jogo**.
- Recorde e progresso salvos em `localStorage` com try/catch. Sem conta, sem dado pessoal, sem rede.
- Rodapé discreto: "Fábrica de Jogos INEMA · v0.1.0".
- Textos em português do Brasil, sem erro de acentuação.
- Código legível e comentado em português: ele vai ser lido por adolescentes que querem mudar o jogo.
- Não usar marca nem nome de jogos de terceiros (Roblox etc.).

## Teste obrigatório antes de entregar
Rodar um teste com Playwright (instalado globalmente: `require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')`), com Chromium headless:
1. Abrir `?demo=1`, esperar 20 s, sem nenhum `pageerror` ou erro de console, e com o estado avançando (pontos subindo, missão cumprida).
2. Abrir a tela inicial, clicar em Jogar, simular toque/clique e teclado, e conferir que algo muda.
3. Clicar em "Criar a minha versão" → "Baixar o jogo" e conferir que o download tem o tamanho do arquivo.
4. Tirar screenshots (1280×800 e celular 390×844) e **olhar** (Read) para conferir se está bonito e legível no celular.

O script de teste fica em `testa.cjs`, ao lado do `index.html`.

## Não fazer
- Commit nem push (o agente principal faz).
- Usar API, chave, serviço externo ou gerar imagem por IA.

## Regra do Nei (17/10): INEMA.CLUB + QR em todo jogo
- Embaixo do jogo, uma **faixa amarela fixa** ("⬆ INEMA.CLUB · Jogue no seu celular", 46 px). Os controles de baixo sobem para caber.
- Ao tocar nela, ou ao **deslizar a tela para cima** no celular, aparece o **painel**: banner grande "Aprenda a criar jogos com IA — de graça — INEMA.CLUB", o **QR do jogo** (`qr-jogo.svg`, embutido no HTML), "⬇ Baixar o jogo", "⬆ Voltar ao jogo" e links para a Fábrica (`../../`) e para o inema.club.
- O jogo continua fixo atrás: a página rola, mas só o canvas trava o gesto (`touch-action:none` no canvas, `pan-y` na página). Coordenadas de toque não mudam.
- Implementação de referência: `jogos/evolua-a-capivara/index.html` (v0.3.0). Procure por `#rolagem`, `#painel`, `#puxador`.
