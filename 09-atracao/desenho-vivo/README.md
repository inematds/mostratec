# Desenho Vivo — "Desenho que ganha vida"

Atração do estande INEMA na MOSTRATEC 2026 (27 a 29/10, FENAC, Novo Hamburgo/RS).

A pessoa desenha um personagem no papel, aponta o celular para o QR da mesa, fotografa
o desenho e envia. Em segundos o personagem aparece **andando, pulando e dançando** no
celular dela e, depois que a equipe aprova, na **TV do estande**.

- Sem nome, e-mail ou telefone. No máximo um apelido opcional (até 20 caracteres, só letras, números, espaço e `-_.`).
- A foto é regravada sem metadados (o EXIF de celular traz GPS).
- Nada vai para a TV sem aprovação do operador.
- Tudo é apagado sozinho: o que tiver mais de 24 h e, além disso, tudo todo dia às 23:30 (configurável).
- Os dois motores de animação rodam no próprio servidor. A **versão filme** (arte por IA) usa a Agnes AI e, de reserva, o Codex (assinatura): só a foto do papel, já sem EXIF, sai do servidor. Isso está escrito no aviso da página de envio.

## Páginas

| Endereço | Para quem | O que faz |
|---|---|---|
| `/` | visitante (QR da mesa) | foto do desenho + apelido opcional + aviso de que vai para a TV |
| `/galeria` | visitante | lista dos aprovados em duas abas, **Últimos** e **Mais curtidos**, com curtir (uma curtida por celular, por um código aleatório guardado no aparelho; tocar de novo desfaz). Depois de enviar, a pessoa vê "Desenho enviado!" e volta para cá, com um cartão do andamento do próprio desenho no topo |
| `/d/<id>` | visitante | acompanha: processando → aguardando aprovação → animação com botão "baixar" |
| `/tv` | TV do estande (tela cheia) | carrossel dos aprovados (andando, pulando, dançando), fila de miniaturas e QR "mande o seu" |
| `/operador` | equipe (senha) | aprovar, recusar, tirar da TV, apagar um ou apagar tudo |
| `/saude` | monitoramento | `{"ok":true,"motor":...,"motor_ad_ok":...}` |

O QR da TV aponta para `URL_PUBLICA`. Para a mesa, imprima o mesmo QR (abra `/qr.png` e salve).

## Versão filme (arte por IA)

Além dos 3 GIFs, cada desenho ganha uma **versão filme**: o mesmo personagem em ilustração 3D numa cidade do futuro.
Ela começa junto com a animação, assim que a foto chega, e só aparece em público (celular, TV, galeria) depois da aprovação.

- Quem faz é o serviço **artista** (`artista/artista.py`, só biblioteca padrão do Python), que roda **no host da VPS**, fora do contêiner, porque o Codex precisa do login da assinatura em `/root/.codex`.
- Ordem dos geradores em `ARTE_GERADORES` (padrão `agnes,codex`). Medido em 20/10/2026: Agnes `agnes-image-2.1-flash` img2img = **23–33 s**, US$ 0, fiel ao desenho (forma, cores, número de braços e pernas). Codex `image_gen` = 1–3 min e depende do saldo da assinatura (estava sem saldo nesse dia).
- Prompt da Agnes em **inglês** (em português o filtro dela recusa pedido legítimo). Cerca de 1/3 das chamadas dá 503; o artista tenta de novo até 5 vezes.
- Se todos falharem, a arte fica como `falhou` e a pessoa recebe só os GIFs. Painel do operador: ver a arte, **Tirar arte** e **Refazer arte**. O resumo do topo mostra se o artista está ligado.
- O app oferece cada desenho a um artista por vez; se o artista sumir no meio, o desenho volta para a fila depois de `ARTE_TIMEOUT` (300 s).
- Testar o gerador sem o app: `python3 artista/artista.py --teste foto.jpg` (grava `foto-arte-<gerador>.png`).
- Notas medidas da Agnes (parâmetros, defeitos conhecidos, vídeo): `/opt/agnes` na VPS (cópia de `videos-agnes`, `imagens-agnes` e `NOTAS-API.md`).

## Motores de animação (plugáveis)

| Motor | Como funciona | Qualidade | Custo |
|---|---|---|---|
| `leve` (padrão) | Recorta o desenho do papel por limiar adaptativo (OpenCV), corta em tronco + 2 pernas e anima por geometria: pernas em contrafase, balanço, *squash and stretch*. Gera 3 GIFs. | Boneco "de papel" que anda, pula e dança. Funciona com qualquer desenho, inclusive sem braços e pernas. | ~1,5 s por desenho, 100 MB de RAM |
| `ad` | [Animated Drawings](https://github.com/facebookresearch/AnimatedDrawings) (Meta, licença MIT): detecta o personagem, segmenta, acha 16 articulações e aplica capturas de movimento (zumbi andando, pulo, dança). | Esqueleto de verdade: braços e pernas dobram. Precisa de figura humanoide. | ver "Medições" abaixo |

`MOTOR=ad` tenta o Animated Drawings e, se ele falhar (fora do ar, tempo esgotado ou "não achei personagem"), **cai sozinho no leve** e registra o aviso no painel do operador. Um papel em branco ou foto sem desenho vira estado `erro` e a página do visitante pede para tentar de novo.

Para trocar ou acrescentar motor: `app/main.py`, funções `processar_leve` / `processar_ad`. O contrato é simples: receber `foto.jpg` e gravar `andar.gif`, `pular.gif`, `dancar.gif` na pasta do desenho.

## Estrutura

```
desenho-vivo/
  app/main.py            API, fila, aprovação, limpeza automática
  app/recorte.py         higieniza a foto (EXIF, tamanho, tipo) e recorta o desenho
  app/motor_leve.py      animação 2D sem IA
  app/static/            páginas (pagina.css é cópia de ../../assets/pagina.css)
  motor-ad/              contêiner do Animated Drawings (torchserve + worker HTTP :5000)
  tests/test_e2e.py      teste de ponta a ponta
  tests/gerar_desenho.py gera uma foto de desenho de exemplo (com GPS falso no EXIF)
  Dockerfile, docker-compose.yml, Caddyfile.exemplo
```

## Configuração (variáveis de ambiente)

| Variável | Padrão | Para quê |
|---|---|---|
| `OPERADOR_SENHA` | obrigatória no compose | senha do `/operador` (usuário qualquer, ex.: `operador`). Fora do compose, sem ela o app gera uma e mostra no log |
| `URL_PUBLICA` | `http://localhost:8000` | endereço que vai no QR (ex.: `https://desenho.inema.pro`) |
| `MOTOR` | `leve` | `leve` ou `ad` |
| `MOTOR_AD_URL` | `http://motor-ad:5000` | onde está o worker do Animated Drawings |
| `MOTOR_AD_CPUS`, `MOTOR_AD_MEM` | `4`, `6g` | limites do contêiner `motor-ad` (compose) |
| `RENDER_PARALELO` | `3` | renders simultâneos no `motor-ad` (1 = menos memória) |
| `MOTOR_AD_TIMEOUT` | `90` | segundos até desistir do `ad` e usar o leve |
| `RETENCAO_HORAS` | `24` | apaga desenhos mais velhos que isso (checa a cada 5 min) |
| `APAGAR_TUDO_AS` | `23:30` no compose | apaga tudo uma vez por dia nesse horário (fuso `America/Sao_Paulo`). Vazio desliga |
| `MAX_MB` | `10` | tamanho máximo da foto |
| `FILA_MAX` | `60` | máximo de desenhos processando + aguardando; acima disso pede para tentar em 1 minuto |
| `TV_MAX` | `30` | quantos aprovados a TV mostra |
| `ARTE` | `1` | `0` desliga a versão filme |
| `ARTE_TIMEOUT` | `300` | segundos até devolver à fila um desenho que o artista pegou e não entregou |
| `AGNES_API_KEY` | — | chave da Agnes, lida só pelo serviço artista (no `.env`, fora do git) |
| `ARTE_GERADORES` | `agnes,codex` | ordem dos geradores do artista |

## Rodar e testar no computador

```bash
cd 09-atracao/desenho-vivo
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python tests/test_e2e.py          # sobe o app, envia, aprova, confere os GIFs
cd app && OPERADOR_SENHA=teste DADOS=/tmp/dv ../.venv/bin/uvicorn main:app --port 8000
```

Com Docker:

```bash
OPERADOR_SENHA=teste PORTA=8790 URL_PUBLICA=http://127.0.0.1:8790 docker compose up -d --build app
URL_BASE=http://127.0.0.1:8790 OPERADOR_SENHA=teste .venv/bin/python tests/test_e2e.py
```

O teste confere: páginas no ar; operador exige senha; recusa arquivo que não é imagem (415), envio sem aceite (400) e foto acima de 10 MB (413); nada aparece na TV nem nos links públicos antes da aprovação; a foto guardada perdeu o EXIF/GPS; depois de aprovar saem 3 GIFs com ≥ 10 quadros; "tirar da TV" esconde de novo; papel em branco vira `erro`; a limpeza de 24 h apaga o velho e mantém o novo.

## Deploy na VPS (passo a passo)

A VPS ainda não foi escolhida. Sugestão de domínio: `desenho.inema.pro` (só sugestão).

1. **Servidor**: Ubuntu 24.04, Docker e Caddy.
   ```bash
   apt update && apt install -y docker.io docker-compose-v2 caddy
   ```
2. **DNS**: registro `A` de `desenho.inema.pro` para o IP da VPS (no Cloudflare, com a nuvem cinza, "DNS only", para o Caddy emitir o certificado).
3. **Código**: copie a pasta `09-atracao/desenho-vivo/` para `/opt/desenho-vivo` (`git clone` do repo ou `rsync`).
4. **Segredo**: crie `/opt/desenho-vivo/.env` (fora do git):
   ```
   OPERADOR_SENHA=<senha forte, ex.: openssl rand -base64 18>
   URL_PUBLICA=https://desenho.inema.pro
   MOTOR=leve
   ```
5. **Subir**:
   ```bash
   cd /opt/desenho-vivo
   docker compose up -d --build app                 # só o motor leve
   # ou, com o Animated Drawings (VPS maior, ver requisitos):
   MOTOR=ad docker compose --profile ad up -d --build   # e MOTOR=ad no .env
   ```
   Em VPS com 4 GB, compile com menos paralelismo para não faltar memória no build do mmcv:
   `MAX_JOBS=2 docker compose --profile ad build`.
   O app escuta só em `127.0.0.1:8000`; quem fala com a internet é o Caddy.
6. **HTTPS**: copie `Caddyfile.exemplo` para `/etc/caddy/Caddyfile`, troque o domínio e `systemctl reload caddy`. O Caddy pega o certificado sozinho.
7. **Conferir**: `URL_BASE=https://desenho.inema.pro OPERADOR_SENHA=... python tests/test_e2e.py` (de qualquer máquina com as dependências). Depois abra `/tv` na TV do estande em tela cheia (F11) e `/operador` no celular ou notebook da equipe.
8. **Firewall**: libere só 22, 80 e 443 (`ufw allow 22,80,443/tcp && ufw enable`).
9. **Artista (versão filme)**: `AGNES_API_KEY=...` e `ARTE_GERADORES=agnes,codex` no `.env`; para o Codex, `npm i -g @openai/codex` e `codex login --device-auth` (uma vez, com a conta da assinatura). Depois:
   ```bash
   cp artista/desenho-artista.service /etc/systemd/system/ && systemctl daemon-reload
   systemctl enable --now desenho-artista && journalctl -u desenho-artista -f
   ```
10. **Depois da feira**: `docker compose down -v` apaga o volume com os desenhos.

### Arquitetura: esta máquina é ARM64, a VPS provavelmente é x86_64

O protótipo foi construído e testado no spark-922b (NVIDIA GB10, **aarch64**). As imagens
Docker geradas aqui são arm64 e não servem numa VPS x86_64 (Hetzner CX/CPX/CCX). Não copie
imagem: rode `docker compose build` **na própria VPS**. O app (`python:3.12-slim`) e o motor
`ad` (`python:3.8-slim`) têm base multiarquitetura; o `mmcv-full` 1.7.0 é compilado no build
no build (aqui levou cerca de 6 min com `MAX_JOBS=4`; em x86_64 ainda não testado). Hetzner também vende ARM
(CAX), onde a imagem se comporta como aqui.

### Requisitos mínimos de VPS

Medido em 19/10/2026 no spark-922b (aarch64), **só CPU** (a VPS não terá GPU), com o teste de ponta a ponta e com `examples/drawings/garlic.png` do próprio AD:

| Motor | Limite do contêiner | Tempo por desenho (3 GIFs) | Memória |
|---|---|---|---|
| leve | 2 vCPU / 1 GB | **1,5 a 2,2 s** | app ~100–130 MB |
| ad | 4 vCPU / 6 GB | **7 a 12 s** (detecção + pose ~3 s, render dos 3 movimentos em paralelo 4–9 s) | 1,3 GB parado, pico 2,3–3,2 GB |
| ad | 2 vCPU / 3 GB | **10 a 18 s** (detecção + pose 3,5–4,4 s) | pico encostou em 3 GB: use `RENDER_PARALELO=1` ou mais memória |

Antes dos ajustes do `motor-ad/` o mesmo desenho levava **135 a 240 s**: os BVH de exemplo vêm a 100–120 quadros/s (até 1000 quadros por GIF) e o PyTorch/OpenBLAS abria 20 threads (os núcleos da máquina) dentro de uma cota de 4 CPUs. Os ajustes: movimentos cortados e a ~25 quadros/s (`preparar_movimentos.py`), 1 thread de BLAS por render, threads do torchserve = CPUs do contêiner (`TS_THREADS`), 3 renders em paralelo, raiz "no lugar" (sem isso o pulo sai do quadro).

O motor `ad` atende um desenho por vez: ~5 a 8 desenhos por minuto com 4 vCPU. O leve faz dezenas por minuto.

| Cenário | vCPU | RAM | Disco | Observação |
|---|---|---|---|---|
| Só motor leve | 1–2 | 2 GB | 20 GB | qualquer VPS pequena (ex.: Hetzner CX22 x86 ou CAX11 ARM) |
| Leve + Animated Drawings (mínimo) | 2 | 4 GB | 40 GB | ~15–25 s por desenho; `MOTOR_AD_CPUS=2 MOTOR_AD_MEM=3g RENDER_PARALELO=1`, build com `MAX_JOBS=2` |
| Leve + Animated Drawings (recomendado para a feira) | 4 | 8 GB | 40 GB | ~7–12 s por desenho, configuração padrão do compose |

Disco: imagem do app 330 MB, imagem do `motor-ad` 3,5 GB (+ ~3 GB de cache durante o build), cerca de 2 MB por desenho (3 GIFs + foto). Mil desenhos num dia ≈ 2 GB, apagados no fim do dia. O build do `motor-ad` levou ~10 min aqui (o `mmcv-full` compila em ~6 min); faça o build na VPS dias antes da feira, não no dia.

## Moderação e privacidade (resumo para a equipe)

- O visitante marca que entendeu: o desenho vai para a TV e é apagado no fim do dia.
- O operador vê a foto original e a animação antes de aprovar. Recuse foto de pessoa, nome escrito, palavrão, qualquer coisa fora de lugar. Na dúvida, recuse.
- O servidor não guarda IP (sem log de acesso), não pede dado pessoal e regrava a foto sem EXIF.
- A foto do papel (sem EXIF) vai para a Agnes AI (ou o Codex) para fazer a versão filme. A arte passa pela mesma aprovação; o operador pode tirá-la.
- Links `/d/<id>` são aleatórios (16 caracteres) e morrem com a limpeza.
- Botão "Apagar tudo agora" no painel para encerrar o dia mais cedo.

## Pendências

- **Testar o build em x86_64.** Tudo foi construído e medido em aarch64. Esta máquina não tem emulação amd64; o primeiro `docker compose --profile ad build` na VPS é o teste. Se o `mim install mmcv-full==1.7.0` falhar lá, a alternativa é `pip install mmcv-full==1.7.0 -f https://download.openmmlab.com/mmcv/dist/cpu/torch2.0/index.html`.
- **Teste com desenhos reais.** Só foram testados o desenho gerado (`tests/gerar_desenho.py`) e o `garlic.png` (foto de celular real, do repo do AD). Vale fotografar 10–20 desenhos de verdade, com canetinha e lápis, antes do dia 27.
- **Limitação do Animated Drawings:** ele guarda só o maior pedaço do desenho. No desenho de teste, a cabeça (separada do corpo por 1 cm) sumiu. Por isso a dica "tudo ligado" na página e o botão **Refazer no leve** no painel. Personagem que não é humanoide (bicho de 4 patas, carro) não é detectado e cai no leve sozinho.
- **Base do Dockerfile original do AD não constrói mais** (Debian 11, o `debian-security` devolve 404 em out/2026). O `motor-ad/Dockerfile` usa `python:3.8.20-slim-bookworm`.
- Pesos `.mar` vêm do release v0.0.1 do repo da Meta (MIT). Conferir se a equipe quer guardar uma cópia, caso o release saia do ar.
- No ar desde 19/10/2026 na VPS6 (Hostinger, `desenho.inema.pro`). Falta imprimir o QR da mesa (`/qr.png`) e testar `/tv` na TV real em tela cheia (sem descanso de tela).
- Não há limite por IP (na feira todo mundo sai pelo mesmo IP do Wi-Fi); o controle é o teto global da fila (`FILA_MAX`) e a aprovação manual.
