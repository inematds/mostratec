# 02 — Origami: Oráculo do Futuro (mascote de origami)

Um quem-quem (também chamado de "come-come") da INEMA. Por fora tem 4 mascotes robô (CIÊNCIA, CÓDIGO, ARTE, ROBÔS). Por dentro ficam os números de 1 a 8 e, embaixo de cada aba, uma **missão de criador do futuro**. No rodapé da folha há um QR Code para o INEMA.club.

- Molde A4: [oraculo-do-futuro.pdf](oraculo-do-futuro.pdf). Página de origem: `oraculo-do-futuro.html`.
- Para gerar de novo (por exemplo, com outra URL no QR): `../.venv/bin/python gerar.py --url https://...`
- Para trocar mascotes ou missões, edite as listas `MASCOTES` e `MISSOES` no `gerar.py`.

## Como a folha é dividida

O quadrado tem 19 cm e é dobrado com o lado impresso **para baixo** no primeiro passo.

| Região do papel | Onde aparece depois de dobrado |
|---|---|
| Quadradinhos dos 4 cantos | Fora, nos bolsos dos dedos: mascotes |
| Resto dos triângulos de canto | Dentro: números de 1 a 8 |
| Triângulos do quadrado central | Embaixo das abas: missões |
| Faixas do losango | Verso das abas: "inema.club" |

Essa divisão foi calculada pela geometria das dobras. **Ainda falta dobrar uma folha impressa para conferir:**

- se cada número cai sobre a missão de mesmo número;
- se os mascotes ficam de pé no bolso;
- se o texto das missões (2,5 mm) dá para ler no papel.

## Pendências

- [ ] Imprimir em 100% (papel A4 de 90 g e de 120 g) e dobrar.
- [ ] Medir o tempo de dobra com alunos do ensino médio (público da feira).
- [ ] Definir a URL final do QR (hoje é `https://inema.club/?src=mostratec`).
- [ ] Revisar o texto das 8 missões com o Nei.
