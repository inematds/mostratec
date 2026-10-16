#!/usr/bin/env python3
"""Gera o molde A4 do "Oráculo do Futuro" (quem-quem / come-come INEMA).

Saída: oraculo-do-futuro.html e oraculo-do-futuro.pdf (via Chromium headless).
Uso:  ../.venv/bin/python gerar.py [--url https://...]

Geometria (quadrado normalizado 0..1, impresso com o lado da arte PARA BAIXO no passo 1):
- quadradinho de canto [0,.25]²       -> face de fora (bolsos): mascote
- resto do triângulo de canto          -> faces de dentro: números 1–8
- triângulos do quadrado interno       -> embaixo das abas: missões
- meias-faixas do losango              -> verso da aba: "inema.club"
"""
import argparse, math, subprocess, pathlib, html
import qrcode, qrcode.image.svg

AQUI = pathlib.Path(__file__).resolve().parent
S = 190.0            # lado do quadrado em mm
OX, OY = 10.0, 10.0  # posição do quadrado na folha A4
AMARELO, PRETO, TINTA = "#FACC15", "#0c0c10", "#2A2620"

MASCOTES = ["CIÊNCIA", "CÓDIGO", "DESIGN", "ROBÓTICA"]  # TL, TR, BR, BL (horário)
MISSOES = [  # público: ensino médio (expositores e visitantes da MOSTRATEC)
    "Peça à IA 3 falhas do seu projeto antes que a banca ache.",
    "Treine a apresentação com a IA fingindo ser o avaliador.",
    "Crie um app de uma tela conversando com a IA.",
    "Monte um agente que resuma 5 artigos do seu tema.",
    "Peça uma hipótese ousada à IA e tente derrubá-la com dados.",
    "Ache a fonte de uma resposta da IA. Sem fonte, desconfie.",
    "Descubra uma profissão que ainda não existe e o que estudar.",
    "Use a IA para transformar seus dados num gráfico claro.",
]

# ---- simetrias do quadrado (em torno do centro) ----
def rot(p, k):            # 90° no sentido horário (tela), k vezes
    x, y = p
    for _ in range(k % 4):
        x, y = 1 - y, x
    return (x, y)

def rotv(v, k):
    x, y = v
    for _ in range(k % 4):
        x, y = -y, x
    return (x, y)

def diag(p):  return (p[1], p[0])

def mm(p):    return (OX + p[0] * S, OY + p[1] * S)

def ang(u):   # rotação SVG que leva "para cima" (0,-1) até u
    return math.degrees(math.atan2(u[1], u[0])) + 90

# cópia base (número 1): faixa de cima, à esquerda do centro
BASE_NUM = (0.3125, 0.0625)    # centro do retângulo útil do triângulo do número
BASE_MSG = (0.4375, 0.3125)    # idem, triângulo interno (missão)
BASE_ABA = (0.4375, 0.1875)    # idem, verso da aba
UP = (0, -1)                   # "para cima" do texto = para a borda

def copias():
    """8 posições em ordem horária: (ponto->ponto, vetor->vetor)."""
    seq = []
    seq.append((lambda p: p, lambda v: v))
    for k in (1, 2, 3):
        seq.append((lambda p, k=k: rot(diag(p), k), lambda v, k=k: rotv(diag(v), k)))
        seq.append((lambda p, k=k: rot(p, k), lambda v, k=k: rotv(v, k)))
    seq.append((lambda p: diag(p), lambda v: diag(v)))
    return seq

def quebra(txt, n=15):
    linhas, atual = [], ""
    for w in txt.split():
        if len(atual) + len(w) + (1 if atual else 0) > n:
            linhas.append(atual); atual = w
        else:
            atual = f"{atual} {w}" if atual else w
    linhas.append(atual)
    return linhas

def texto_bloco(cx, cy, a, linhas, tam, peso=500, cor=TINTA, alt=1.18, fam="Inter"):
    h = tam * alt
    y0 = -h * (len(linhas) - 1) / 2
    ts = "".join(
        f'<tspan x="0" y="{y0 + i*h:.2f}">{html.escape(l)}</tspan>' for i, l in enumerate(linhas))
    return (f'<text transform="translate({cx:.2f},{cy:.2f}) rotate({a:.1f})" font-family="{fam}, Arial, Helvetica, sans-serif" '
            f'font-size="{tam}" font-weight="{peso}" fill="{cor}" text-anchor="middle" '
            f'dominant-baseline="middle">{ts}</text>')

# ---- mascote (robô) desenhado em ±20 mm, "cima" = -y ----
def mascote(tipo):
    s = [f'<line x1="0" y1="-11" x2="0" y2="-16.5" stroke="{PRETO}" stroke-width="0.9"/>',
         f'<circle cx="0" cy="-17.5" r="1.9" fill="{AMARELO}" stroke="{PRETO}" stroke-width="0.8"/>',
         f'<rect x="-15.5" y="-4" width="3" height="7" rx="1" fill="{PRETO}"/>',
         f'<rect x="12.5" y="-4" width="3" height="7" rx="1" fill="{PRETO}"/>',
         f'<rect x="-13" y="-11" width="26" height="21" rx="5" fill="{AMARELO}" stroke="{PRETO}" stroke-width="1"/>']
    olhos = "".join(
        f'<circle cx="{x}" cy="-2" r="3.1" fill="#fff" stroke="{PRETO}" stroke-width="0.8"/>'
        f'<circle cx="{x+0.6}" cy="-1.6" r="1.4" fill="{PRETO}"/>' for x in (-5, 5))
    boca = f'<path d="M-4.5 4.2 Q0 8 4.5 4.2" fill="none" stroke="{PRETO}" stroke-width="1" stroke-linecap="round"/>'
    extra = ""
    if tipo == "CIÊNCIA":   # óculos de laboratório + frasco
        extra = (f'<rect x="-13" y="-4" width="26" height="1.4" fill="{PRETO}"/>'
                 + "".join(f'<circle cx="{x}" cy="-2" r="4.3" fill="none" stroke="{PRETO}" stroke-width="1.2"/>' for x in (-5, 5))
                 + f'<path d="M15 6 h4 M16 6 v3 l-2.5 5 h7 l-2.5 -5 v-3" fill="#bdeaf5" stroke="{PRETO}" stroke-width="0.7"/>')
    elif tipo == "CÓDIGO":  # fone + </> na testa
        extra = (f'<path d="M-15 -1 Q-15 -16 0 -16 Q15 -16 15 -1" fill="none" stroke="{PRETO}" stroke-width="1.4"/>'
                 f'<path d="M-15 2 Q-13 8 -6 8" fill="none" stroke="{PRETO}" stroke-width="0.9"/>'
                 f'<circle cx="-6" cy="8" r="1" fill="{PRETO}"/>'
                 f'<text x="0" y="-7" font-family="JetBrains Mono, monospace" font-size="3.4" font-weight="700" text-anchor="middle" fill="{PRETO}">&lt;/&gt;</text>')
    elif tipo == "DESIGN":    # boina + pincel
        extra = (f'<ellipse cx="-3" cy="-11.5" rx="10" ry="3.2" fill="#e0736f" stroke="{PRETO}" stroke-width="0.8" transform="rotate(-10 -3 -11.5)"/>'
                 f'<circle cx="-3" cy="-14.5" r="1.1" fill="{PRETO}"/>'
                 f'<line x1="14" y1="13" x2="19" y2="4" stroke="{PRETO}" stroke-width="1.2"/>'
                 f'<path d="M19 4 l1.6 -3 l1 1.6 z" fill="#3b82f6" stroke="{PRETO}" stroke-width="0.5"/>'
                 f'<circle cx="-9" cy="5" r="1.3" fill="#e0736f"/><circle cx="9" cy="5" r="1.3" fill="#e0736f"/>')
    elif tipo == "ROBÓTICA":   # parafusos + engrenagem
        extra = ("".join(f'<circle cx="{x}" cy="{y}" r="1" fill="none" stroke="{PRETO}" stroke-width="0.6"/>'
                         for x, y in ((-10.5, -8.5), (10.5, -8.5), (-10.5, 7.5), (10.5, 7.5)))
                 + "".join(f'<rect x="-0.9" y="-9.3" width="1.8" height="2.2" fill="{PRETO}" transform="rotate({a} 0 -7)"/>'
                           for a in range(0, 360, 45))
                 + f'<circle cx="0" cy="-7" r="1.7" fill="{AMARELO}" stroke="{PRETO}" stroke-width="0.8"/>')
    rotulo = (f'<text x="0" y="16.5" font-family="Sora, sans-serif" font-size="3.6" font-weight="800" '
              f'text-anchor="middle" fill="{PRETO}" letter-spacing="0.3">{tipo}</text>')
    return "".join(s) + olhos + boca + extra + rotulo

def gerar_qr(url):
    img = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=1)
    svg = img.to_string(encoding="unicode")
    return svg

def montar(url):
    els = []
    q = lambda p: "{:.2f},{:.2f}".format(*mm(p))
    # fundo dos triângulos de canto (faces de fora + números)
    for k in range(4):
        tri = [rot(p, k) for p in ((0, 0), (0.5, 0), (0, 0.5))]
        els.append(f'<polygon points="{" ".join(q(p) for p in tri)}" fill="#FEF9C3"/>')
        sq = [rot(p, k) for p in ((0, 0), (0.25, 0), (0.25, 0.25), (0, 0.25))]
        els.append(f'<polygon points="{" ".join(q(p) for p in sq)}" fill="#ffffff"/>')
    # dobras (tracejado): losango, quadrado interno, diagonais, medianas
    linhas = [((0.5, 0), (1, 0.5)), ((1, 0.5), (0.5, 1)), ((0.5, 1), (0, 0.5)), ((0, 0.5), (0.5, 0)),
              ((0.25, 0.25), (0.75, 0.25)), ((0.75, 0.25), (0.75, 0.75)), ((0.75, 0.75), (0.25, 0.75)),
              ((0.25, 0.75), (0.25, 0.25)), ((0, 0), (1, 1)), ((1, 0), (0, 1)), ((0.5, 0), (0.5, 1)), ((0, 0.5), (1, 0.5))]
    for a, b in linhas:
        (x1, y1), (x2, y2) = mm(a), mm(b)
        els.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="#9a9a9a" stroke-width="0.3" stroke-dasharray="2 1.5"/>')
    # mascotes nos 4 cantos, cabeça apontando para o centro da folha
    for k, nome in enumerate(MASCOTES):
        cx, cy = mm(rot((0.125, 0.125), k))
        els.append(f'<g transform="translate({cx:.2f},{cy:.2f}) rotate({135 + 90*k}) scale(0.95)">{mascote(nome)}</g>')
    # números, missões e verso das abas
    for i, (fp, fv) in enumerate(copias()):
        up = fv(UP)
        a = ang(up)
        nx, ny = mm(fp(BASE_NUM))
        els.append(texto_bloco(nx, ny, a, [str(i + 1)], 13, peso=800, cor=PRETO, fam="Sora"))
        els.append(f'<line x1="{nx - 3.2:.2f}" y1="{ny:.2f}" x2="{nx + 3.2:.2f}" y2="{ny:.2f}" stroke="{AMARELO}" stroke-width="1.6" '
                   f'transform="rotate({a:.1f} {nx:.2f} {ny:.2f}) translate(0 6.2)"/>')
        mx, my = mm(fp(BASE_MSG))
        ux, uy = up
        els.append(texto_bloco(mx + 8.6*ux, my + 8.6*uy, a, ["MISSÃO " + str(i + 1)], 2.4, peso=800, cor="#854d0e", fam="Sora"))
        els.append(texto_bloco(mx - 1.8*ux, my - 1.8*uy, a, quebra(MISSOES[i], 16), 2.55, peso=500))
        ax, ay = mm(fp(BASE_ABA))
        els.append(texto_bloco(ax, ay, a, ["inema.club"], 2.4, peso=700, cor="#9a9a9a", fam="Sora"))
    # linha de corte
    els.append(f'<rect x="{OX}" y="{OY}" width="{S}" height="{S}" fill="none" stroke="{PRETO}" stroke-width="0.5"/>')
    qr = gerar_qr(url)
    return "\n".join(els), qr

PASSOS = [
    "Recorte o quadrado pela linha contínua.",
    "Vire a folha: o lado com desenhos fica para baixo. Dobre as 4 pontas até o centro.",
    "Vire de novo. Dobre as 4 novas pontas até o centro.",
    "Dobre ao meio nos dois sentidos e desdobre (vinque bem).",
    "Coloque polegares e indicadores embaixo dos 4 mascotes e junte as pontas.",
]
JOGO = ("Escolha um mascote e soletre o nome dele abrindo e fechando o oráculo. "
        "Escolha um dos números que aparecerem, levante a aba e leia a sua missão.")

def html_pagina(svg, qr, url):
    passos = "".join(f"<li>{html.escape(p)}</li>" for p in PASSOS)
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Oráculo do Futuro — INEMA.CLUB</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;800&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
@page {{ size: A4; margin: 0 }}
html,body {{ margin:0; padding:0; background:#fff; color:{TINTA}; font-family:Inter,sans-serif }}
.folha {{ width:210mm; height:297mm; position:relative; overflow:hidden }}
svg.molde {{ position:absolute; left:0; top:0; width:210mm; height:297mm }}
.rodape {{ position:absolute; left:10mm; right:10mm; top:203mm; bottom:8mm; display:flex; gap:6mm }}
.txt {{ flex:1; font-size:9.2pt; line-height:1.32 }}
h1 {{ font-family:Sora,sans-serif; font-size:17pt; margin:0 0 1mm; color:{PRETO} }}
h1 span {{ background:linear-gradient(transparent 55%, {AMARELO} 55%) }}
ol {{ margin:1.5mm 0 1.5mm 4.5mm; padding:0 }} li {{ margin:0.4mm 0 }}
.jogo {{ background:#FEF9C3; border-left:1.2mm solid #EAB308; padding:1.6mm 2.4mm; font-size:8.8pt }}
.lado {{ width:38mm; text-align:center; font-size:7.6pt }}
.lado svg {{ width:34mm; height:34mm }}
.marca {{ font-family:Sora,sans-serif; font-weight:800; font-size:10pt; color:{PRETO} }}
.aviso {{ font-size:7pt; color:#666; margin-top:1.2mm }}
</style></head><body><div class="folha">
<svg class="molde" viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">{svg}</svg>
<div class="rodape">
 <div class="txt">
  <h1>Oráculo do <span>Futuro</span></h1>
  <ol>{passos}</ol>
  <div class="jogo"><b>Como jogar:</b> {html.escape(JOGO)}</div>
  <div class="aviso">Imprima em 100% (sem "ajustar à página"). Linha contínua = cortar · tracejada = dobrar.</div>
 </div>
 <div class="lado">{qr}<div class="marca">INEMA.CLUB</div>Trilhas grátis de IA para o seu projeto.</div>
</div></div></body></html>"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="https://inema.club/?src=mostratec")
    a = ap.parse_args()
    svg, qr = montar(a.url)
    out_html = AQUI / "oraculo-do-futuro.html"
    out_html.write_text(html_pagina(svg, qr, a.url), encoding="utf-8")
    out_pdf = AQUI / "oraculo-do-futuro.pdf"
    subprocess.run(["chromium", "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    "--virtual-time-budget=8000", f"--print-to-pdf={out_pdf}", out_html.as_uri()],
                   check=True, timeout=120, capture_output=True)
    print(out_pdf)

if __name__ == "__main__":
    main()
