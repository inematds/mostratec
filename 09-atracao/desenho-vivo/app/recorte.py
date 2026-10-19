"""Entrada segura da foto e recorte do desenho (sem IA).

- higienizar(): valida pelo conteúdo, corrige a rotação do celular (EXIF), reduz e
  regrava em JPEG SEM metadados (a foto de celular traz GPS: é dado pessoal).
- recortar(): acha o papel, separa o traço do fundo por limiar adaptativo (aguenta
  sombra e papel acinzentado), preenche o interior do personagem e devolve um PNG
  com transparência, recortado com margem.
"""
from __future__ import annotations

import io

import cv2
import numpy as np
from PIL import Image, ImageOps

LADO_MAX = 1600
Image.MAX_IMAGE_PIXELS = 40_000_000  # recusa "bombas" de descompressão


class FotoInvalida(ValueError):
    pass


def higienizar(dados: bytes) -> Image.Image:
    try:
        with Image.open(io.BytesIO(dados)) as teste:
            teste.verify()
        img = Image.open(io.BytesIO(dados))
        if img.format not in ("JPEG", "PNG", "WEBP", "MPO"):
            raise FotoInvalida(f"formato {img.format} não aceito")
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")  # descarta alfa, paleta e todos os metadados
    except FotoInvalida:
        raise
    except Exception as e:  # noqa: BLE001
        raise FotoInvalida("arquivo não é uma imagem válida") from e
    img.thumbnail((LADO_MAX, LADO_MAX))
    if min(img.size) < 200:
        raise FotoInvalida("imagem pequena demais")
    return img


def jpeg_limpo(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=88, optimize=True)  # sem exif=, sai sem metadados
    return buf.getvalue()


def _area_do_papel(cinza: np.ndarray) -> tuple[int, int, int, int]:
    """Caixa do maior pedaço claro (a folha). Se não achar, a imagem toda."""
    h, w = cinza.shape
    borrada = cv2.GaussianBlur(cinza, (0, 0), 5)
    _, claro = cv2.threshold(borrada, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    claro = cv2.morphologyEx(claro, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, rot, est, _ = cv2.connectedComponentsWithStats(claro)
    if n <= 1:
        return 0, 0, w, h
    i = 1 + int(np.argmax(est[1:, cv2.CC_STAT_AREA]))
    x, y, cw, ch, area = est[i]
    if area < 0.2 * w * h:
        return 0, 0, w, h
    m = int(0.02 * max(cw, ch))  # afasta a borda da folha
    return x + m, y + m, max(1, cw - 2 * m), max(1, ch - 2 * m)


def recortar(img: Image.Image) -> Image.Image:
    rgb = np.array(img)
    cinza = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    x0, y0, pw, ph = _area_do_papel(cinza)
    rgb = rgb[y0:y0 + ph, x0:x0 + pw]
    cinza = cinza[y0:y0 + ph, x0:x0 + pw]
    h, w = cinza.shape

    bloco = max(15, (min(h, w) // 20) | 1)
    tinta = cv2.adaptiveThreshold(cv2.GaussianBlur(cinza, (5, 5), 0), 255,
                                  cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, bloco, 10)
    # cor forte (canetinha clara) também conta como tinta
    sat = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)[:, :, 1]
    tinta |= ((sat > 70).astype(np.uint8) * 255)
    tinta = cv2.morphologyEx(tinta, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    tinta = cv2.morphologyEx(tinta, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))

    n, rot, est, _ = cv2.connectedComponentsWithStats(tinta)
    if n <= 1:
        raise FotoInvalida("não achei desenho na foto")
    areas = est[1:, cv2.CC_STAT_AREA]
    maior = int(areas.max())
    if maior < 0.002 * h * w:
        raise FotoInvalida("não achei desenho na foto")
    i_maior = 1 + int(np.argmax(areas))
    bx, by, bw, bh = est[i_maior, :4]
    folga = int(0.25 * max(bw, bh))
    manter = np.zeros_like(tinta)
    for i in range(1, n):
        x, y, cw, ch, a = est[i]
        if a < max(30, 0.01 * maior):
            continue  # poeira, ruído
        perto = (x < bx + bw + folga and x + cw > bx - folga and y < by + bh + folga and y + ch > by - folga)
        if perto:
            manter[rot == i] = 255

    # preenche o interior (o branco dentro do contorno faz parte do personagem)
    contornos, _ = cv2.findContours(manter, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cheio = np.zeros_like(manter)
    cv2.drawContours(cheio, contornos, -1, 255, thickness=cv2.FILLED)
    cheio = cv2.dilate(cheio, np.ones((3, 3), np.uint8))

    ys, xs = np.nonzero(cheio)
    m = 6
    t, b = max(0, ys.min() - m), min(h, ys.max() + m + 1)
    l, r = max(0, xs.min() - m), min(w, xs.max() + m + 1)
    alfa = cv2.GaussianBlur(cheio[t:b, l:r], (3, 3), 0)
    # clareia o papel dentro do personagem (tira a sombra do celular): divide pelo fundo estimado
    fundo = cv2.medianBlur(cv2.dilate(cinza, np.ones((9, 9), np.uint8)), 31).astype(np.float32)
    fator = np.clip(242.0 / np.maximum(fundo, 1), 1.0, 2.2)[:, :, None]
    rgb = np.clip(rgb.astype(np.float32) * fator, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb[t:b, l:r], alfa])
    out = Image.fromarray(rgba, "RGBA")
    out.thumbnail((700, 700))
    return out
