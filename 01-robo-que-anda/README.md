# 01 — Robôs para montar (antes: "Robô de papel que anda")

## Páginas publicadas (17/10/2026)

- [`index.html`](index.html) — página-mãe "Robôs para montar": os 3 robôs, método monte → teste → melhore (ciclo em SVG), modelo do caderno de testes e cursos do INEMA.CLUB (robot, HG1, vla, robotica-so101 — o braço SO-101 é a demonstração física do estande).
- [`robo-de-papel/`](robo-de-papel/index.html) — robô de papel que anda: protótipos A (rampa), B (mesa vibratória) e C (rolador com moeda), com física, molde SVG em cm (papel 180 g), passo a passo, variáveis, erros prováveis e regras de campeonato na escola.
- [`assistente-de-voz/`](assistente-de-voz/index.html) — assistente da casa tipo Alexa: microfone → transcrição (Whisper) → IA (OpenAI, Claude, Gemini ou Ollama local) → voz (Piper) → alto-falante. Versão ESP32-S3 (INMP441 + MAX98357A + servidor Python) e versão Raspberry Pi tudo em um (openWakeWord). Privacidade, custo e chave só no `.env` do servidor. Liga com o controle da casa (S7).
- [`robo-vigia/`](robo-vigia/index.html) — robô vigia: seguidor de linha com marcos, máquina de estados (patrulha → imprevisto → desvio → volta à rota; alerta), ESP32 + TB6612FNG + IR + HC-SR04 (com divisor), câmera ESP32-CAM/celular, YOLO local no PC, autorização por crachá ArUco ou horário (sem reconhecimento facial, LGPD). Liga com a vigilância (S4).
- [`testa.cjs`](testa.cjs) — `node 01-robo-que-anda/testa.cjs`: Playwright 390×844 e 1366×800, pageerror, rolagem lateral, links internos, texto SVG ≥ 12 px; screenshots em `shots/`. Links para `11-solucoes-praticas/vigilancia/` e `controle-casa/` (outra equipe) saem como AVISO enquanto não existirem.

## Decisão do Nei (17/10/2026)

- Os robôs são **protótipos teóricos**. O INEMA mostra como fazer; **o aluno monta, testa e registra/atualiza** o que não deu certo (versão 1 → teste → versão 2). **Não vamos construir nada físico** para esta seção.
- A seção ganhou mais dois robôs além do de papel: **assistente de voz** com IA e **robô vigia**.

---

## Notas de origem (robô de papel)

Três mecanismos, do mais vistoso ao mais garantido.

## A. Andarilho de rampa (gravidade)
- Princípio conhecido: corpo de cartolina com pés **arredondados como cadeira de balanço**. Na rampa, ele balança de um lado para o outro e "dá passos" descendo. Referências: [Make: paper walking robot dog](https://makercamp.make.co/projects/make-a-paper-walking-robot-dog/), [Ontario Science Centre: dinosaur ramp walker](https://www.ontariosciencecentre.ca/media/1697/dinosaurrampwalker.pdf), [Instructables: gravity-powered robot walker](https://instructables.com/Gravity-Powered-Robot-Walker).
- Versão INEMA: molde próprio, feito do zero sem copiar os moldes (corpo geométrico, sem cara de mascote — regra V12 do DESIGN.md).
- Rampa: tábua com cortiça ou EVA, inclinação de 5 a 10°.
- Risco: ajuste fino. Uma cartolina mais mole ou um pé mal cortado já impedem que ele ande.

## B. Corrida na mesa vibratória (recomendado para o estande)
- Robô de papel com **pernas inclinadas para trás**. Quando a superfície vibra, ele anda para a frente (o mesmo princípio do bristlebot).
- Pista: uma tábua sobre uma caixa de som com grave, ou batidas na mesa. Cabem várias pistas lado a lado.
- No estande vira **corrida**: a pessoa monta em 5 min, compete e o tempo vai para um placar. É isso que forma fila.
- O movimento é quase garantido. Variar o ângulo das pernas vira uma aula de física.

## C. Rolador com moeda (reserva)
- Prisma de papel com uma moeda colada fora do centro. Ele desce a rampa aos trancos e "cambaleia".
- Movimento 100% garantido, zero risco de protótipo. É menos "robô".

## Próximos passos
- [x] Desenhar os moldes A, B e C (em `robo-de-papel/`, 17/10/2026).
- ~~Imprimir, montar e filmar o teste; escolher o mecanismo final até 22/10.~~ Cancelado pela decisão de 17/10: protótipos teóricos, quem monta e testa é o aluno.
