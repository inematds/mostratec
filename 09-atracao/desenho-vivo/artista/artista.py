#!/usr/bin/env python3
"""Serviço artista do Desenho Vivo: transforma o desenho da pessoa numa arte "versão filme".

Roda na própria VPS, fora do contêiner (o Codex precisa do login da assinatura no host).
Pede trabalho ao app (/api/artista/proximo), baixa a foto do desenho, gera a arte com
os geradores da lista ARTE_GERADORES (padrão: agnes, depois codex) e devolve ao app.
Se todos falharem, avisa o app: a pessoa fica só com os GIFs, como antes.

Só biblioteca padrão. Configuração por variáveis de ambiente (o systemd lê o .env do app):
  DV_URL            endereço do app (padrão http://127.0.0.1:8000)
  OPERADOR_SENHA    senha do operador (a mesma do app)
  AGNES_API_KEY     chave da Agnes AI (agnes-image-2.1-flash, US$ 0)
  ARTE_GERADORES    ordem dos geradores, ex. "agnes,codex" ou "codex"
  CODEX_BIN         caminho do codex (padrão: "codex" no PATH)
  ARTE_PAUSA        segundos entre pedidos quando a fila está vazia (padrão 3)

Uso: python3 artista.py            (laço infinito, para o systemd)
     python3 artista.py --teste F  (gera a arte de um arquivo local e sai; não fala com o app)
"""
from __future__ import annotations

import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid

DV_URL = os.environ.get("DV_URL", "http://127.0.0.1:8000").rstrip("/")
SENHA = os.environ.get("OPERADOR_SENHA", "")
GERADORES = [g.strip() for g in os.environ.get("ARTE_GERADORES", "agnes,codex").split(",") if g.strip()]
CODEX_BIN = os.environ.get("CODEX_BIN", "codex")
PAUSA = float(os.environ.get("ARTE_PAUSA", "3"))
AGNES_API = "https://apihub.agnes-ai.com/v1/images/generations"

# Medido em 20/10/2026: a Agnes em img2img respeita a forma e as cores do desenho com este texto.
# Prompt em INGLÊS: em português o filtro de conteúdo da Agnes recusa pedido legítimo (HTTP 400).
PROMPT_EN = (
    "This photo is a hand-drawn character made by a student at a science fair. Turn THIS exact character "
    "into a polished 3D animated movie style illustration (Pixar-like), staying faithful to the drawing: "
    "same head and body shapes, same colors, same number of arms and legs, same expression. The character "
    "stands in a bright friendly city of the future, neutral light, vivid colors. Exactly one character, "
    "full body in frame. No text, no letters, no logos."
)
PROMPT_CODEX = """Use sua ferramenta de geração de imagem (image_gen) para criar UMA imagem quadrada 1:1 e salve o PNG
como arte.png neste diretório. Não crie nem edite nenhum outro arquivo.

A foto anexada é um desenho feito à mão por um estudante numa feira de ciências. Transforme ESTE personagem
numa ilustração caprichada de animação 3D estilo filme (Pixar), mantendo fielmente o que a pessoa desenhou:
mesmo formato de cabeça e corpo, mesmas cores, mesmo número de braços e pernas, mesma expressão.
Cena: o personagem em pé numa cidade do futuro clara e amigável, luz neutra, cores vivas.
Um único personagem, inteiro no quadro. SEM texto, SEM letras, SEM números, SEM logotipos.
Responda só "ok" quando terminar."""


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ---------- conversa com o app ----------
def _auth() -> str:
    return "Basic " + base64.b64encode(f"operador:{SENHA}".encode()).decode()


def app_get(caminho: str, timeout: float = 20):
    r = urllib.request.Request(DV_URL + caminho, headers={"Authorization": _auth()})
    with urllib.request.urlopen(r, timeout=timeout) as resp:
        return resp.status, resp.read()


def app_post(caminho: str, campos: dict, arquivo: tuple[str, bytes, str] | None = None):
    limite = uuid.uuid4().hex
    partes = []
    for k, v in campos.items():
        partes.append(f'--{limite}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    if arquivo:
        nome, dados, tipo = arquivo
        partes.append(f'--{limite}\r\nContent-Disposition: form-data; name="arte"; filename="{nome}"\r\n'
                      f"Content-Type: {tipo}\r\n\r\n".encode() + dados + b"\r\n")
    partes.append(f"--{limite}--\r\n".encode())
    r = urllib.request.Request(DV_URL + caminho, data=b"".join(partes), method="POST",
                               headers={"Authorization": _auth(),
                                        "Content-Type": f"multipart/form-data; boundary={limite}"})
    with urllib.request.urlopen(r, timeout=60) as resp:
        return resp.status


# ---------- geradores ----------
def agnes(foto: bytes, tent: int = 5) -> bytes:
    chave = os.environ.get("AGNES_API_KEY", "")
    if not chave:
        raise RuntimeError("AGNES_API_KEY não definida")
    corpo = {"model": "agnes-image-2.1-flash", "prompt": PROMPT_EN, "size": "1024x1024",
             "extra_body": {"response_format": "url",
                            "image": ["data:image/jpeg;base64," + base64.b64encode(foto).decode()]}}
    ultimo = ""
    for t in range(1, tent + 1):
        req = urllib.request.Request(AGNES_API, data=json.dumps(corpo).encode(),
                                     headers={"Authorization": "Bearer " + chave, "Content-Type": "application/json"})
        try:
            d = json.loads(urllib.request.urlopen(req, timeout=240).read())
            url = d["data"][0]["url"]
            return urllib.request.urlopen(url, timeout=120).read()  # a URL da Agnes é temporária: baixar na hora
        except urllib.error.HTTPError as e:
            ultimo = f"HTTP {e.code} {e.read()[:120].decode(errors='ignore')}"
            if e.code == 400:  # filtro de conteúdo: repetir não adianta
                break
        except Exception as e:  # noqa: BLE001
            ultimo = str(e)[:150]
        log(f"  agnes tentativa {t}: {ultimo}")
        time.sleep(4 * t)  # ~1/3 das chamadas dá 503; o retry recupera quase sempre
    raise RuntimeError(f"agnes falhou: {ultimo}")


def codex(foto: bytes) -> bytes:
    if not shutil.which(CODEX_BIN):
        raise RuntimeError("codex não instalado")
    with tempfile.TemporaryDirectory(prefix="dv-arte-") as d:
        fp = os.path.join(d, "desenho.jpg")
        open(fp, "wb").write(foto)
        try:
            r = subprocess.run([CODEX_BIN, "exec", "--skip-git-repo-check", "--dangerously-bypass-approvals-and-sandbox",
                                "-i", fp, "-o", os.path.join(d, "resposta.txt"), "-"],
                               input=PROMPT_CODEX, cwd=d, capture_output=True, text=True, timeout=420)
        except subprocess.TimeoutExpired as e:
            raise RuntimeError("codex: tempo esgotado (420 s)") from e
        png = os.path.join(d, "arte.png")
        if not os.path.exists(png):
            saida = (r.stderr or r.stdout or "").strip().splitlines()
            erro = next((l for l in reversed(saida) if "ERROR" in l), saida[-1] if saida else "sem saída")
            raise RuntimeError(f"codex não gerou arte.png: {erro[:160]}")
        return open(png, "rb").read()


GERA = {"agnes": agnes, "codex": codex}


def gerar(foto: bytes) -> tuple[bytes, str, float]:
    erros = []
    for g in GERADORES:
        if g not in GERA:
            continue
        t0 = time.time()
        try:
            img = GERA[g](foto)
            if len(img) < 1000:
                raise RuntimeError("imagem vazia")
            return img, g, time.time() - t0
        except Exception as e:  # noqa: BLE001
            erros.append(f"{g}: {e}")
            log(f"  {g} falhou: {e}")
    raise RuntimeError(" | ".join(erros) or "nenhum gerador configurado")


# ---------- laço ----------
def uma_vez() -> bool:
    """Processa um desenho. Devolve True se havia trabalho."""
    st, corpo = app_get("/api/artista/proximo")
    if st == 204 or not corpo:
        return False
    job = json.loads(corpo)
    i = job["id"]
    log(f"desenho {i}: gerando arte ({', '.join(GERADORES)})")
    _, foto = app_get(job["foto"], timeout=60)
    try:
        img, g, dur = gerar(foto)
    except Exception as e:  # noqa: BLE001
        app_post(f"/api/artista/{i}/falhou", {"motivo": str(e)[:200]})
        return True
    tipo = "image/png" if img[:4] == b"\x89PNG" else "image/jpeg"
    try:
        app_post(f"/api/artista/{i}/arte", {"gerador": g, "tempo_s": f"{dur:.1f}"}, ("arte", img, tipo))
        log(f"desenho {i}: arte pronta por {g} em {dur:.0f} s")
    except urllib.error.HTTPError as e:
        log(f"desenho {i}: app recusou a arte ({e.code}), segue")
    return True


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--teste":
        img, g, dur = gerar(open(sys.argv[2], "rb").read())
        saida = os.path.splitext(sys.argv[2])[0] + f"-arte-{g}.png"
        open(saida, "wb").write(img)
        print(f"ok: {saida} ({g}, {dur:.0f} s)")
        return
    if not SENHA:
        sys.exit("OPERADOR_SENHA não definida")
    log(f"artista no ar: app {DV_URL}, geradores {GERADORES}")
    while True:
        try:
            if not uma_vez():
                time.sleep(PAUSA)
        except Exception as e:  # noqa: BLE001  (app reiniciando, rede etc.: espera e tenta de novo)
            log(f"erro: {str(e)[:200]}")
            time.sleep(10)


if __name__ == "__main__":
    main()
