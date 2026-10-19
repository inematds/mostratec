Páginas publicadas: index.html + 7 guias (17/10/2026)
- `index.html` — página promocional "Soluções que vendem"
- `pet-automatico/index.html` — S1 Pet automático
- `irrigacao/index.html` — S2 Irrigação inteligente
- `nutrientes/index.html` — S3 Nutrientes da planta / hidroponia
- `vigilancia/index.html` — S4 Vigilância com câmera
- `energia/index.html` — S5 Painel de energia
- `agua/index.html` — S6 Painel de água
- `controle-casa/index.html` — S7 Controle da casa/sala
- `testa.cjs` — teste Playwright (390 e 1366 px); screenshots em `shots/`

# 11 — Soluções práticas para vender (linha 2 da MOSTRATEC)

Proposta de 17/10/2026. Projetos de automação de verdade que um aluno do ensino médio **monta, apresenta na feira e consegue vender** para vizinhos, escolas, pet shops e pequenos produtores. A IA entra para **entender os dados** e **conversar** com o sistema, não só para ligar e desligar.

Base comum de todas as soluções:
- placa **ESP32** (Wi-Fi), sensores baratos, um relé ou servo;
- **painel web** com gráficos e alertas no celular;
- uma camada de IA: "pergunte ao sistema" ("quanto gastei de água esta semana?"), aviso quando algo foge do normal e visão computacional nas câmeras.

> Preços aproximados de loja online brasileira (out/2026), a conferir antes da compra.

## O catálogo

| # | Solução | O que faz | Peças principais | Custo do kit* | IA |
|---|---|---|---|---|---|
| S1 | **Pet automático** | Comida na hora certa, água sempre cheia, aviso se o pet não comeu | ESP32, servo, célula de carga (HX711) no pote, boia/nível de água, câmera opcional | R$ 120–200 | Aviso de "não comeu hoje"; câmera reconhece se o pet veio comer |
| S2 | **Irrigação inteligente** | Rega só quando a terra pede, mede luz e temperatura | ESP32, sensor de umidade de solo **capacitivo**, mini bomba 5 V + relé, BH1750 (luz), DHT22 | R$ 100–160 | Decide regar olhando umidade + previsão do tempo (Open-Meteo, grátis); foto da folha → "parece falta de água/doença" |
| S3 | **Nutrientes da planta / hidroponia** | Mede quantos sais tem na água (EC/TDS) e o pH | ESP32, sensor TDS/EC, sensor de pH (calibração!) | R$ 150–300 | Explica em português o que corrigir. Obs.: sensor NPK de solo de verdade custa R$ 300+ e é impreciso; EC/pH é mais honesto para a feira |
| S4 | **Vigilância com câmera** | Detecta **pessoa** (não gato, não árvore balançando) e manda alerta com foto | ESP32-CAM ou câmera USB/IP + PC/mini PC rodando detecção local (YOLO) | R$ 60–150 por câmera | Detecção de pessoa local, sem nuvem; zonas proibidas; resumo do dia |
| S5 | **Painel de energia** | Consumo da casa em tempo real e em R$ | ESP32 + **sensor de garra SCT-013** (não corta fio) ou medidor PZEM-004T | R$ 80–150 | "Qual aparelho mais gasta?", alerta de consumo fora do normal, previsão da conta |
| S6 | **Painel de água** | Consumo, vazamento e nível da caixa d'água | ESP32, sensor de vazão YF-S201, sensor ultrassônico na caixa | R$ 80–140 | Detecta vazamento (fluxo de madrugada), avisa caixa baixa |
| S7 | **Controle geral (casa/sala de aula)** | Liga/desliga luzes, ventilador, portão, por horário ou presença | ESP32, módulo de relés, sensor PIR | R$ 70–120 | Comando por voz/texto ("desliga tudo da sala") |

\* Só o kit eletrônico; não inclui câmera IP, PC nem caixa de acabamento.

## Para vender (o lado de negócio que o aluno apresenta)

Cada solução vem com uma **ficha de negócio** de 1 página:
- quem compra (dono de pet que viaja, horta escolar, pequeno produtor, condomínio, loja);
- custo do kit × preço sugerido × mão de obra de instalação;
- assinatura opcional (painel + alertas por mês);
- argumento de economia medido ("o painel de água achou um vazamento de X litros/dia").

## No estande: a "Casa Inteligente em miniatura"

Uma maquete com S1, S2, S4, S5 e S6 funcionando, e o **painel ao vivo no telão**. É outra atração que forma fila:
- o visitante **"invade" a maquete** e recebe o alerta com a foto dele no celular, por um QR com link temporário que não guarda nada (ou só no telão, se for menor de idade);
- pergunta ao painel "quanto de energia a casa gastou?" e a IA responde.

## Segurança (obrigatório)

- **Energia de tomada (127/220 V) mata.** No kit do aluno, só **sensor de garra (SCT-013)**, que não mexe em fio. O PZEM e qualquer relé ligado à tomada **só com adulto/professor** e caixa fechada. Na maquete, tudo em 5–12 V.
- Câmeras: avisar que há câmera, nada de gravar ou publicar rosto de visitante, e as imagens apagadas no fim do dia.
- Água + eletrônica: bomba e sensores em 5 V, circuito longe da água.

## O que dá para entregar até 27/10

- Até lá cabe **1 maquete** com S2 (irrigação), S4 (câmera com alerta) e S5 (energia) + o painel, se as peças chegarem em 2 ou 3 dias. Comprar já.
- O resto entra como **guia + trilha INEMA.club** ("monte e venda o seu"), com lista de compras, esquema de ligação, código e ficha de negócio.

## Decisões do Nei

- Montamos a maquete física para o estande? (Compra de peças hoje/amanhã.)
- Quais 3 soluções entram na maquete?
- Painel: Home Assistant (pronto, robusto) ou painel próprio INEMA (mais didático, mais trabalho)?
