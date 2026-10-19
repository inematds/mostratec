"""Motor "leve": anima o recorte do desenho sem IA, só com geometria 2D.

Fatia o personagem em tronco (parte de cima) e duas pernas (metade esquerda e direita
da parte de baixo), gira as pernas em contrafase, balança o tronco e aplica
"squash and stretch". Gera três GIFs: andar, pular, dançar. Roda em ~1 s de CPU.
"""
from __future__ import annotations

import io
import math

from PIL import Image, ImageDraw

LADO = 400
FUNDO = (246, 241, 227)  # papel
SOMBRA = (220, 212, 190)
QUADROS = 24
MS = 70
CORTE_PERNAS = 0.64  # fração da altura onde começam as "pernas"


def _preparar(rec: Image.Image) -> Image.Image:
    rec = rec.convert("RGBA")
    alvo_h = int(LADO * 0.68)
    esc = min(alvo_h / rec.height, (LADO * 0.8) / rec.width)
    return rec.resize((max(1, int(rec.width * esc)), max(1, int(rec.height * esc))), Image.LANCZOS)


def _camada(peca: Image.Image, pos: tuple[int, int], angulo: float, pivo: tuple[float, float]) -> Image.Image:
    cam = Image.new("RGBA", (LADO, LADO), (0, 0, 0, 0))
    cam.alpha_composite(peca, pos)
    if angulo:
        cam = cam.rotate(angulo, resample=Image.BICUBIC, center=pivo)
    return cam


def _pecas(rec: Image.Image):
    w, h = rec.size
    c = int(h * CORTE_PERNAS)
    tronco = rec.crop((0, 0, w, c + 4))  # sobrepõe 4 px para não abrir fresta
    perna_e = rec.crop((0, c, w // 2, h))
    perna_d = rec.crop((w // 2, c, w, h))
    return tronco, perna_e, perna_d, c


def _quadro(rec, dx=0.0, dy=0.0, sx=1.0, sy=1.0, giro=0.0, giro_tronco=0.0, pe=0.0, pd=0.0, sombra=1.0):
    """Monta um quadro. dx/dy em px; sx/sy escala; giros em graus; pe/pd giro de cada perna."""
    r = rec.resize((max(1, int(rec.width * sx)), max(1, int(rec.height * sy))), Image.BICUBIC)
    tronco, perna_e, perna_d, c = _pecas(r)
    w, h = r.size
    chao = int(LADO * 0.9)
    x0 = int((LADO - w) / 2 + dx)
    y0 = int(chao - h + dy)
    quadro = Image.new("RGBA", (LADO, LADO), FUNDO + (255,))
    d = ImageDraw.Draw(quadro)
    sw = w * 0.42 * sombra
    d.ellipse((LADO / 2 + dx - sw, chao - 7, LADO / 2 + dx + sw, chao + 7), fill=SOMBRA + (255,))
    quadril_e = (x0 + w * 0.25, y0 + c)
    quadril_d = (x0 + w * 0.75, y0 + c)
    corpo = Image.new("RGBA", (LADO, LADO), (0, 0, 0, 0))
    corpo.alpha_composite(_camada(perna_e, (x0, y0 + c), pe, quadril_e))
    corpo.alpha_composite(_camada(perna_d, (x0 + w // 2, y0 + c), pd, quadril_d))
    corpo.alpha_composite(_camada(tronco, (x0, y0), giro_tronco, (x0 + w / 2, y0 + c)))
    if giro:
        corpo = corpo.rotate(giro, resample=Image.BICUBIC, center=(LADO / 2 + dx, chao))
    quadro.alpha_composite(corpo)
    return quadro.convert("RGB")


def _andar(rec):
    for i in range(QUADROS):
        f = 2 * math.pi * i / QUADROS
        yield _quadro(rec, dy=-abs(math.sin(f)) * 10, sy=1 - 0.03 * math.cos(2 * f), sx=1 + 0.02 * math.cos(2 * f),
                      giro_tronco=3 * math.sin(f), pe=16 * math.sin(f), pd=-16 * math.sin(f))


def _pular(rec):
    for i in range(QUADROS):
        t = i / QUADROS
        if t < 0.2:  # agacha
            k = math.sin(t / 0.2 * math.pi)
            yield _quadro(rec, sy=1 - 0.15 * k, sx=1 + 0.1 * k)
        elif t < 0.75:  # no ar
            u = (t - 0.2) / 0.55
            alt = math.sin(u * math.pi)
            yield _quadro(rec, dy=-alt * 75, sy=1 + 0.1 * (1 - alt), sx=1 - 0.05 * (1 - alt),
                          pe=-10 * alt, pd=10 * alt, sombra=1 - 0.5 * alt)
        else:  # aterrissa
            k = math.sin((t - 0.75) / 0.25 * math.pi)
            yield _quadro(rec, sy=1 - 0.12 * k, sx=1 + 0.08 * k)


def _dancar(rec):
    for i in range(QUADROS):
        f = 2 * math.pi * i / QUADROS
        yield _quadro(rec, dx=18 * math.sin(f), dy=-abs(math.sin(2 * f)) * 14, giro=9 * math.sin(f),
                      giro_tronco=-8 * math.sin(2 * f), pe=14 * max(0, math.sin(2 * f)),
                      pd=-14 * max(0, -math.sin(2 * f)), sy=1 + 0.04 * math.sin(2 * f))


MOVIMENTOS = {"andar": _andar, "pular": _pular, "dancar": _dancar}


def animar(recorte: Image.Image) -> dict[str, bytes]:
    rec = _preparar(recorte)
    saida = {}
    for nome, gerar in MOVIMENTOS.items():
        quadros = list(gerar(rec))
        buf = io.BytesIO()
        quadros[0].save(buf, "GIF", save_all=True, append_images=quadros[1:], duration=MS, loop=0,
                        optimize=False, disposal=1)
        saida[nome] = buf.getvalue()
    return saida
