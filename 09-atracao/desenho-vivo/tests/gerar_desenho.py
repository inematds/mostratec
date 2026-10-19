"""Gera uma "foto de celular" de um desenho de exemplo, reprodutível e sem baixar nada.

Personagem de canetinha numa folha branca, a folha sobre uma mesa cinza, sombra em
degradê, ruído de câmera e um EXIF com GPS falso (para o teste conferir que o
servidor remove os metadados).

Uso: python gerar_desenho.py saida.jpg
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def desenho() -> Image.Image:
    W, H = 1200, 1600
    img = Image.new("RGB", (W, H), (120, 116, 110))  # mesa
    folha = Image.new("RGB", (900, 1250), (245, 244, 238))
    d = ImageDraw.Draw(folha)
    tinta, cor = (25, 25, 35), (230, 80, 60)
    cx = 450
    d.ellipse((cx - 110, 170, cx + 110, 390), outline=tinta, width=9, fill=(250, 210, 90))  # cabeça
    d.ellipse((cx - 50, 250, cx - 25, 275), fill=tinta)
    d.ellipse((cx + 25, 250, cx + 50, 275), fill=tinta)
    d.arc((cx - 50, 280, cx + 50, 345), 20, 160, fill=tinta, width=7)
    d.rounded_rectangle((cx - 120, 400, cx + 120, 720), 30, outline=tinta, width=9, fill=cor)  # corpo
    d.line((cx - 120, 450, cx - 260, 610), fill=tinta, width=16)  # braços
    d.line((cx + 120, 450, cx + 260, 610), fill=tinta, width=16)
    d.line((cx - 60, 720, cx - 90, 1000), fill=tinta, width=18)  # pernas
    d.line((cx + 60, 720, cx + 90, 1000), fill=tinta, width=18)
    d.line((cx - 90, 1000, cx - 160, 1010), fill=tinta, width=18)
    d.line((cx + 90, 1000, cx + 160, 1010), fill=tinta, width=18)
    img.paste(folha, (150, 170))
    # sombra em degradê (celular por cima da folha)
    a = np.array(img).astype(np.float32)
    grad = np.linspace(0.78, 1.0, W)[None, :, None] * np.linspace(0.85, 1.0, H)[:, None, None]
    a = a * grad + np.random.default_rng(7).normal(0, 4, a.shape)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    return img


def salvar(caminho: str) -> None:
    img = desenho()
    exif = Image.Exif()
    exif[0x010F] = "CelularTeste"  # Make
    gps = {1: "S", 2: (29.0, 41.0, 0.0), 3: "W", 4: (51.0, 7.0, 0.0)}  # Novo Hamburgo, falso
    exif[0x8825] = gps
    img.save(caminho, "JPEG", quality=90, exif=exif)


if __name__ == "__main__":
    salvar(sys.argv[1] if len(sys.argv) > 1 else "desenho-exemplo.jpg")
