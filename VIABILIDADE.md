# Viabilidade — MOSTRATEC 2026 × INEMA.club

Análise de 16/10/2026 sobre o documento [docs/ideias-original.md](docs/ideias-original.md).

## Resumo

**Dá para fazer, mas só o MVP sem foto e com moldes prontos.** O que limita é o calendário: a MOSTRATEC costuma ser na segunda quinzena de outubro (em 2024 foi de 21 a 24/10, na Fenac, em Novo Hamburgo). A data de 2026 ainda não foi confirmada. Se ela se repetir, faltam de **1 a 2 semanas**. Isso dá tempo para a página e o PDF. Não dá tempo para testar com segurança um molde mecânico nem para a revisão jurídica do fluxo com foto.

> Primeira ação: confirmar com a Fundação Liberato a data e se pode distribuir material no estande ou na circulação.

## Nota por ideia

| # | Ideia | Viabilidade (prazo de 2 semanas) | Motivo |
|---|-------|------------------------------|--------|
| 4 | Suporte de celular recortável | **Alta** | Uma peça plana. Testa em 1 dia. Útil e barato |
| 9 | Carta "Que criador você é?" | **Alta** | Só HTML + regras. Sem IA em tempo real, sem dado pessoal |
| 10 | Agente de IA em papel (card + missão) | **Alta** | Ponte natural para a trilha de agentes do INEMA.club |
| 2 | Origami robótico | **Alta** | O molde já existe em domínio público. O trabalho é a arte |
| 7/8 | Paper toy personalizado **sem foto** (por escolhas) | **Média-alta** | Viável se a arte vier de **combinações pré-geradas** (cabelo × roupa × acessório × missão) sobre 1 molde base testado |
| 5 | Flipbook | Média | Exige corte preciso e encadernação. Rende mais como brinde impresso pronto do que como PDF |
| 3 | Mini autômato (aba/manivela) | Baixa | Exige vários protótipos físicos. Fica para 2027 ou para o kit do professor |
| 1 | Robô que anda em rampa | Baixa | O próprio documento diz que não pode ser prometido sem protótipo. Tempo curto demais |
| 6 | Avatar com foto | **Não fazer agora** | LGPD/ECA com menores, revisão jurídica, retenção no fornecedor de IA. Risco alto e pouco ganho na feira |

## Pacotes do documento

- **MVP (sem foto): viável.** Página estática (GitHub Pages) + gerador de PDF A4 **no próprio navegador** (pdf-lib/jsPDF). Nada sai do celular e não há servidor nem coleta de dados. A conformidade com a LGPD fica simples, porque nenhum dado pessoal é tratado.
- **Intermediário (IA generativa): viável só com arte pré-gerada.** Gerar a arte com IA em tempo real, ao vivo, para centenas de pessoas cria custo por uso, dependência de API e de rede (o 4G da Fenac costuma ficar saturado) e risco de imagem imprópria. A alternativa segura: gerar antes um banco de 50 a 200 variações (flux2-klein local, sem custo), revisar à mão e deixar o visitante **combinar** as peças. Para quem usa, parece personalizado. Para o projeto, é previsível.
- **Avançado (com foto): inviável no prazo.** Depende de um parecer jurídico sobre o tratamento de imagem de menores, de um fluxo de autorização dos responsáveis e de provar que a foto é apagada. Melhor deixar para uma edição futura.

## Riscos práticos

1. **Rede na feira:** a página precisa funcionar leve e offline depois do 1º acesso (PWA/cache). O PDF é gerado no aparelho.
2. **Impressão:** o visitante não imprime na feira. O ideal é levar **moldes já impressos** (A4 em papel 180 g) para montar ali, e usar o QR para a versão personalizada em casa.
3. **Montagem:** testar o tempo de montagem com crianças de 10 a 12 anos e com o público do ensino médio. Meta: até 10 min, só tesoura e cola. Nada de peça pequena nem de mola.
4. **Medição:** usar um contador sem cookie e sem identificação (`?src=mostratec` + contador agregado) para ter os números do "Critérios de sucesso" sem tratar dado pessoal.
5. **Custos:** gráfica para os cartões A6 e os moldes impressos. É o único gasto em dinheiro do MVP.

## Plano mínimo (cabe em ~10 dias)

| Dia | Entrega |
|-----|---------|
| 1 | Confirmar data/regras do evento. Escolher 1 molde base (paper toy cúbico + suporte de celular) |
| 2–3 | Imprimir e testar o molde base em P&B e colorido. Medir o tempo de montagem |
| 2–4 | Gerar e revisar o banco de artes (flux2-klein, design INEMA) |
| 4–6 | Página mobile: escolha de trilha (estudante/professor/cientista) → quiz de 3 perguntas → combinação → prévia → PDF |
| 6–7 | Tutorial curto (vídeo 9:16 + passo a passo ilustrado) e o kit do professor em PDF |
| 7 | Arte do cartão A6 com QR e envio para a gráfica |
| 8–9 | Teste com 5 a 10 pessoas reais e ajustes |
| 10 | Congelar a versão. Material impresso em mãos |

## Decisões que ficam com o Nei

- Data confirmada e o que a organização permite (estande próprio? só distribuição?).
- Quantidade de cartões e moldes impressos (orçamento da gráfica).
- Qual personagem/molde base vira o carro-chefe.
- Domínio da página (`inematds.github.io/mostratec/` ou um subdomínio do inema.club).
- Confirmar que a opção com foto fica fora de 2026.
