# 10 — Fábrica de Jogos INEMA (conceito, 17/10/2026)

**Objetivo do Nei:** fazer o adolescente **querer criar o próprio jogo** para jogar com os amigos. A feira é só a porta de entrada. O sistema fica online depois e continua puxando a pessoa.

Público: ensino médio. Inspiração: a mecânica do "Roube um Ovo" (ovo → chocar → pet → roubar), sem usar a marca.

## A ideia em uma linha

**Você joga, gosta, e o próprio jogo te mostra como fazer o seu.** Todo jogo da Fábrica tem o botão **"Criar a minha versão"**.

## O caminho da pessoa (funil)

```
FEIRA  ovo de plástico com QR
  ↓
1. CHOCAR    abre o site → o ovo choca → ganha um pet robô (comum / raro / épico / lendário)
  ↓
2. JOGAR     "Roube o Ovo" no navegador, com o pet dela, contra robôs; placar e conquistas
  ↓
3. MUDAR     botão "Criar a minha versão": troca pet, cenário, velocidade, regras — sem código
  ↓
4. CRIAR     com IA: prompts prontos ("cole no ChatGPT/Gemini/Claude e peça: adicione um chefão")
  ↓
5. BAIXAR    o jogo vira UM arquivo .html → abre em qualquer lugar, manda no WhatsApp, publica grátis
  ↓
6. SUBIR DE NÍVEL   trilha INEMA.club: do HTML ao Roblox Studio ("faça o seu roube um ovo no Roblox com IA")
```

Cada etapa é uma **conquista**, igual a um jogo: 🥚 Chocou → 🎮 Jogou → 🛠️ Mudou → 🤖 Criou com IA → 📦 Publicou → 🏆 Roblox.

## Por que funciona com adolescente

- **Começa jogando, não estudando.** A vontade de criar nasce de "quero que o MEU jogo tenha isso".
- **Resultado em 2 minutos.** Já no passo 3 o jogo é "dele", com o pet e as regras que escolheu.
- **É para mostrar.** Um arquivo único que roda no celular do amigo. Quem recebe joga e vê o botão "Criar a minha versão": o jogo se espalha sozinho.
- **IA como ferramenta de criação**, não como mágica: os prompts ensinam a pedir, testar e corrigir.

## Como fica no ar (simples e barato)

| Peça | Como | Custo |
|---|---|---|
| Site, jogo e editor | Páginas estáticas no GitHub Pages (`inematds/mostratec`, repo **público**) | Zero |
| Pets | Banco de 40 a 60 pets pré-gerados (flux2-klein local) com raridade | Zero |
| Ovo chocado | O QR do ovo leva um código (`?ovo=LND-7F3A`). Sem ovo, a pessoa choca um aleatório | Zero |
| Salvar progresso | No próprio navegador (localStorage) + um **código do pet** para recuperar. Sem conta | Zero |
| IA para criar | A IA gratuita **da própria pessoa** (ChatGPT, Gemini, Claude). O site só entrega os prompts | Zero para o INEMA |
| Multiplayer | Só no estande (rede local). Online é contra robôs. Online multiplayer fica para depois (VPS) | — |

**Privacidade:** sem cadastro, sem nome, sem foto, sem e-mail. Nada de dado pessoal de menor sai do celular.

## O que o pacote "Criar a minha versão" contém

1. **Editor sem código:** escolher pet, cenário (floresta, espaço, cidade, laboratório), velocidade, quantidade de ovos, regra de roubo.
2. **10 prompts prontos para IA**, do fácil ao difícil: mudar cores → novo pet → power-up → chefão → modo 2 jogadores.
3. **Download** do jogo em um `.html` com o código legível e comentado em português.
4. **Guia Roblox**: o mesmo jogo explicado em Luau, passo a passo no Roblox Studio com o assistente de IA. Fica na trilha do INEMA.club. Não dá para testar Roblox Studio no Linux daqui, então o guia precisa ser validado num Windows ou Mac.

## Cronograma até 26/10

| Dias | Entrega |
|---|---|
| 17–19 | Jogo base "Roube o Ovo" (canvas, robôs, chocar, pets geram moedas) |
| 19–20 | Banco de pets + tela do ovo chocando + raridade |
| 20–22 | Editor "Criar a minha versão" + download em .html |
| 22–23 | 10 prompts de IA testados + página de conquistas |
| 23–24 | Landing do QR, arte dos ovos, cartão; teste com 3 a 5 adolescentes |
| 25–26 | Ajustes, congelar, imprimir QRs, montar os ovos |
| depois | Guia Roblox + trilha INEMA.club; multiplayer online |

## Decisões do Nei

- Tornar o repo público (necessário para o GitHub Pages).
- Nome: "Fábrica de Jogos INEMA"? "Choca & Cria"? Outro?
- Quantos ovos físicos (cápsulas de plástico + QR impresso).
- Domínio: `inematds.github.io/mostratec/` ou um subdomínio do inema.club.
