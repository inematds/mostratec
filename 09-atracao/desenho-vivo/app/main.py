"""Desenho Vivo — servidor da atração "Desenho que ganha vida" (INEMA na MOSTRATEC 2026).

Fluxo: celular envia a foto do desenho -> servidor higieniza e anima (motor leve ou
Animated Drawings) -> operador aprova -> aparece na TV e no celular da pessoa.
Nada de dado pessoal: só um apelido opcional. Tudo é apagado em até 24 h.

Variáveis de ambiente: ver README.md (seção "Configuração").
"""
from __future__ import annotations

import asyncio
import hashlib
import io
import json
import logging
import os
import re
import secrets
import shutil
import time
import unicodedata
import zipfile
from datetime import datetime
from pathlib import Path

import httpx
import qrcode
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from PIL import Image

import motor_leve
from recorte import FotoInvalida, higienizar, jpeg_limpo, recortar

log = logging.getLogger("desenho-vivo")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

AQUI = Path(__file__).parent
DADOS = Path(os.environ.get("DADOS", "/dados"))
MOTOR = os.environ.get("MOTOR", "leve")  # leve | ad
MOTOR_AD_URL = os.environ.get("MOTOR_AD_URL", "http://motor-ad:5000")
MOTOR_AD_TIMEOUT = float(os.environ.get("MOTOR_AD_TIMEOUT", "90"))  # medido: 10-28 s; acima disso cai no leve
URL_PUBLICA = os.environ.get("URL_PUBLICA", "http://localhost:8000").rstrip("/")
RETENCAO_HORAS = float(os.environ.get("RETENCAO_HORAS", "24"))
APAGAR_TUDO_AS = os.environ.get("APAGAR_TUDO_AS", "").strip()  # "HH:MM" (fuso do contêiner) ou vazio
MAX_MB = float(os.environ.get("MAX_MB", "10"))
FILA_MAX = int(os.environ.get("FILA_MAX", "60"))
TV_MAX = int(os.environ.get("TV_MAX", "30"))
ARTE = os.environ.get("ARTE", "1") not in ("0", "", "nao", "false")  # arte por IA (serviço artista, fora do contêiner)
ARTE_TIMEOUT = float(os.environ.get("ARTE_TIMEOUT", "300"))  # artista sumiu no meio: oferece de novo
SENHA = os.environ.get("OPERADOR_SENHA", "")
if not SENHA:
    SENHA = secrets.token_urlsafe(12)
    log.warning("OPERADOR_SENHA não definida. Senha gerada para esta execução: %s", SENHA)

DADOS.mkdir(parents=True, exist_ok=True)
RE_ID = re.compile(r"^[A-Za-z0-9_-]{8,40}$")
ARQS_PUBLICOS = {"andar.gif", "pular.gif", "dancar.gif", "acenar.gif", "arte.jpg"}
MOVS = ["andar", "pular", "dancar"]

app = FastAPI(title="Desenho Vivo", docs_url=None, redoc_url=None, openapi_url=None)
app.mount("/static", StaticFiles(directory=AQUI / "static"), name="static")
basic = HTTPBasic(realm="operador")
artista_visto = 0.0  # última vez que o serviço artista pediu trabalho
fila: asyncio.Queue[str] = asyncio.Queue()
trava_meta = asyncio.Lock()


# ---------- armazenamento ----------
def pasta(i: str) -> Path:
    if not RE_ID.match(i):
        raise HTTPException(404)
    return DADOS / i


def ler_meta(i: str) -> dict | None:
    try:
        return json.loads((pasta(i) / "meta.json").read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def gravar_meta(i: str, meta: dict) -> None:
    p = pasta(i) / "meta.json"
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(meta, ensure_ascii=False))
    tmp.replace(p)


def todos() -> list[dict]:
    out = []
    for d in DADOS.iterdir():
        if d.is_dir() and RE_ID.match(d.name):
            m = ler_meta(d.name)
            if m:
                out.append(m)
    return sorted(out, key=lambda m: m["criado"])


async def mudar(i: str, **campos) -> dict | None:
    async with trava_meta:
        m = ler_meta(i)
        if m is None:
            return None
        m.update(campos)
        gravar_meta(i, m)
        return m


def limpar_apelido(s: str) -> str:
    s = unicodedata.normalize("NFC", s or "").strip()
    s = "".join(ch for ch in s if ch.isalnum() or ch in " -_.")
    return re.sub(r"\s+", " ", s)[:20].strip()


# ---------- motores ----------
def processar_leve(foto: Path, destino: Path) -> None:
    img = Image.open(foto)
    rec = recortar(img)
    rec.save(destino / "recorte.png")
    for nome, gif in motor_leve.animar(rec).items():
        (destino / f"{nome}.gif").write_bytes(gif)


def processar_ad(foto: Path, destino: Path) -> dict:
    with httpx.Client(timeout=MOTOR_AD_TIMEOUT) as c:
        r = c.post(f"{MOTOR_AD_URL}/animate", files={"imagem": ("foto.jpg", foto.read_bytes(), "image/jpeg")},
                   data={"movimentos": ",".join(MOVS)})
    if r.status_code != 200:
        raise RuntimeError(f"motor ad respondeu {r.status_code}: {r.text[:200]}")
    tempos = {}
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        nomes = set(z.namelist())
        if "tempos.json" in nomes:
            tempos = json.loads(z.read("tempos.json"))
        gifs = [n for n in nomes if n in ARQS_PUBLICOS]
        if not gifs:
            raise RuntimeError(f"motor ad não gerou GIF: {tempos}")
        for n in gifs:
            (destino / n).write_bytes(z.read(n))
    return tempos


def motor_ad_ok() -> bool:
    try:
        return httpx.get(f"{MOTOR_AD_URL}/health", timeout=3).status_code == 200
    except Exception:  # noqa: BLE001
        return False


async def trabalhador() -> None:
    while True:
        i = await fila.get()
        try:
            d = pasta(i)
            foto = d / "foto.jpg"
            t0 = time.time()
            motor_usado, tempos_ad, aviso = "leve", None, None
            if MOTOR == "ad":
                try:
                    tempos_ad = await asyncio.to_thread(processar_ad, foto, d)
                    motor_usado = "ad"
                except Exception as e:  # noqa: BLE001
                    aviso = f"motor ad falhou, usei o leve: {str(e)[:160]}"
                    log.warning("%s: %s", i, aviso)
            if motor_usado == "leve":
                await asyncio.to_thread(processar_leve, foto, d)
            dur = round(time.time() - t0, 2)
            await mudar(i, estado="aguardando", motor=motor_usado, tempo_s=dur, tempos_ad=tempos_ad, aviso=aviso,
                        movimentos=[m for m in MOVS if (d / f"{m}.gif").exists()])
            log.info("desenho %s pronto em %.2fs (motor %s)", i, dur, motor_usado)
        except FotoInvalida as e:
            await mudar(i, estado="erro", erro=str(e))
            log.info("desenho %s sem personagem: %s", i, e)
        except Exception as e:  # noqa: BLE001
            await mudar(i, estado="erro", erro="falha ao processar")
            log.exception("desenho %s falhou: %s", i, e)
        finally:
            fila.task_done()


# ---------- limpeza ----------
def apagar(i: str) -> None:
    shutil.rmtree(DADOS / i, ignore_errors=True)


def limpar_velhos(agora: float | None = None) -> int:
    agora = agora or time.time()
    n = 0
    for d in list(DADOS.iterdir()):
        if not d.is_dir():
            continue
        m = ler_meta(d.name) if RE_ID.match(d.name) else None
        criado = m["criado"] if m else d.stat().st_mtime
        if agora - criado > RETENCAO_HORAS * 3600:
            shutil.rmtree(d, ignore_errors=True)
            n += 1
    return n


def apagar_tudo() -> int:
    n = 0
    for d in list(DADOS.iterdir()):
        if d.is_dir():
            shutil.rmtree(d, ignore_errors=True)
            n += 1
    return n


async def faxineiro() -> None:
    marca = DADOS / ".ultima_limpeza_diaria"
    while True:
        try:
            n = limpar_velhos()
            if n:
                log.info("limpeza: %d desenhos com mais de %.0f h apagados", n, RETENCAO_HORAS)
            if APAGAR_TUDO_AS:
                agora = datetime.now()
                hoje = agora.strftime("%Y-%m-%d")
                feito = marca.read_text().strip() if marca.exists() else ""
                if agora.strftime("%H:%M") >= APAGAR_TUDO_AS and feito != hoje:
                    n = apagar_tudo()
                    marca.write_text(hoje)
                    log.info("limpeza do fim do dia (%s): %d desenhos apagados", APAGAR_TUDO_AS, n)
        except Exception:  # noqa: BLE001
            log.exception("erro na limpeza")
        await asyncio.sleep(300)


@app.on_event("startup")
async def iniciar() -> None:
    limpar_velhos()
    for m in todos():  # retoma o que estava no meio quando o serviço caiu
        if m["estado"] == "processando":
            fila.put_nowait(m["id"])
    asyncio.create_task(trabalhador())
    asyncio.create_task(faxineiro())
    log.info("Desenho Vivo no ar: motor=%s, dados=%s, url=%s", MOTOR, DADOS, URL_PUBLICA)


# ---------- páginas ----------
def pagina(nome: str) -> FileResponse:
    return FileResponse(AQUI / "static" / nome, headers={"Cache-Control": "no-cache"})


@app.get("/")
def p_enviar():
    return pagina("enviar.html")


@app.get("/d/{i}")
def p_acompanhar(i: str):
    pasta(i)
    return pagina("acompanhar.html")


@app.get("/galeria")
def p_galeria():
    return pagina("galeria.html")


@app.get("/tv")
def p_tv():
    return pagina("tv.html")


def operador(cred: HTTPBasicCredentials = Depends(basic)) -> None:
    if not secrets.compare_digest(cred.password.encode(), SENHA.encode()):
        raise HTTPException(401, headers={"WWW-Authenticate": 'Basic realm="operador"'})


@app.get("/operador", dependencies=[Depends(operador)])
def p_operador():
    return pagina("operador.html")


@app.get("/qr.png")
def qr():
    img = qrcode.make(URL_PUBLICA + "/", box_size=12, border=2)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return Response(buf.getvalue(), media_type="image/png", headers={"Cache-Control": "max-age=300"})


# ---------- API pública ----------
@app.post("/api/enviar")
async def enviar(request: Request, foto: UploadFile = File(...), apelido: str = Form(""), aceite: str = Form("")):
    if aceite not in ("1", "on", "sim", "true"):
        raise HTTPException(400, "Marque que você entendeu o aviso da TV.")
    limite = int(MAX_MB * 1024 * 1024)
    cl = request.headers.get("content-length")
    if cl and cl.isdigit() and int(cl) > limite + 64 * 1024:
        raise HTTPException(413, f"Foto grande demais (máximo {MAX_MB:.0f} MB).")
    dados = await foto.read(limite + 1)
    if len(dados) > limite:
        raise HTTPException(413, f"Foto grande demais (máximo {MAX_MB:.0f} MB).")
    ativos = [m for m in todos() if m["estado"] in ("processando", "aguardando")]
    if len(ativos) >= FILA_MAX:
        raise HTTPException(503, "A fila está cheia. Tente de novo em um minuto.")
    try:
        img = await asyncio.to_thread(higienizar, dados)
    except FotoInvalida as e:
        raise HTTPException(415, f"Não consegui abrir essa imagem ({e}). Envie uma foto JPG ou PNG.") from e
    i = secrets.token_urlsafe(12)
    d = DADOS / i
    d.mkdir()
    (d / "foto.jpg").write_bytes(jpeg_limpo(img))
    meta = {"id": i, "criado": time.time(), "estado": "processando", "apelido": limpar_apelido(apelido)}
    if ARTE:  # a arte (serviço artista) começa junto com a animação
        meta["arte"] = {"estado": "pendente"}
    gravar_meta(i, meta)
    await fila.put(i)
    return {"id": i, "url": f"/d/{i}"}


def publico(m: dict) -> dict:
    out = {"id": m["id"], "estado": m["estado"], "apelido": m.get("apelido", ""),
           "curtidas": len(m.get("curtidores", []))}
    if m["estado"] == "aprovado":
        out["gifs"] = {mv: f"/arquivos/{m['id']}/{mv}.gif?v={int(m.get('aprovado_em', 0))}"
                       for mv in m.get("movimentos", [])}
        arte = m.get("arte") or {}
        if arte.get("estado") == "pronta":
            out["arte"] = f"/arquivos/{m['id']}/arte.jpg?v={int(arte.get('pronta_em', 0))}"
    if m["estado"] in ("processando", "aguardando", "aprovado") and (m.get("arte") or {}).get("estado") in ("pendente", "gerando"):
        out["arte_gerando"] = True
    if m["estado"] == "erro":
        out["erro"] = m.get("erro", "")
    return out


@app.get("/api/d/{i}")
def status(i: str):
    m = ler_meta(i)
    if m is None:
        raise HTTPException(404, "Não encontrado (pode já ter sido apagado).")
    out = publico(m)
    if m["estado"] in ("processando", "aguardando"):
        fila_op = [x["id"] for x in todos() if x["estado"] in ("processando", "aguardando")]
        out["posicao"] = fila_op.index(i) + 1 if i in fila_op else None
    return out


@app.get("/arquivos/{i}/{nome}")
def arquivo(i: str, nome: str):
    m = ler_meta(i)
    if m is None or m["estado"] != "aprovado" or nome not in ARQS_PUBLICOS:
        raise HTTPException(404)
    p = pasta(i) / nome
    if not p.exists():
        raise HTTPException(404)
    tipo = "image/jpeg" if nome.endswith(".jpg") else "image/gif"
    return FileResponse(p, media_type=tipo, headers={"Cache-Control": "max-age=3600"})


@app.get("/api/tv")
def tv():
    aprovados = [m for m in todos() if m["estado"] == "aprovado"]
    aprovados.sort(key=lambda m: m.get("aprovado_em", 0), reverse=True)
    return {"itens": [publico(m) for m in aprovados[:TV_MAX]], "url": URL_PUBLICA + "/"}


RE_APARELHO = re.compile(r"^[A-Za-z0-9_-]{16,64}$")
GALERIA_MAX = int(os.environ.get("GALERIA_MAX", "60"))


@app.get("/api/galeria")
def galeria(ordem: str = "ultimos"):
    """Desenhos aprovados. ordem=ultimos (aprovados mais recentes) ou curtidos (mais curtidas)."""
    aprovados = [m for m in todos() if m["estado"] == "aprovado"]
    aprovados.sort(key=lambda m: m.get("aprovado_em", 0), reverse=True)
    if ordem == "curtidos":
        aprovados.sort(key=lambda m: len(m.get("curtidores", [])), reverse=True)  # estável: empate = mais recente
    return {"itens": [publico(m) for m in aprovados[:GALERIA_MAX]]}


@app.post("/api/d/{i}/curtir")
async def curtir(i: str, request: Request):
    """Uma curtida por aparelho (código aleatório guardado no celular, sem dado pessoal). Chamar de novo desfaz."""
    try:
        corpo = await request.json()
    except Exception:  # noqa: BLE001
        corpo = {}
    aparelho = str(corpo.get("aparelho", ""))
    if not RE_APARELHO.match(aparelho):
        raise HTTPException(400, "Código do aparelho inválido.")
    marca = hashlib.sha256(aparelho.encode()).hexdigest()[:16]
    async with trava_meta:
        m = ler_meta(i)
        if m is None or m["estado"] != "aprovado":
            raise HTTPException(404, "Desenho não encontrado.")
        cur = m.setdefault("curtidores", [])
        curtiu = marca not in cur
        if curtiu:
            cur.append(marca)
        else:
            cur.remove(marca)
        gravar_meta(i, m)
    return {"curtiu": curtiu, "curtidas": len(cur)}


@app.get("/saude")
def saude():
    return {"ok": True, "motor": MOTOR, "motor_ad_ok": motor_ad_ok() if MOTOR == "ad" else None,
            "fila": fila.qsize(), "arte": ARTE, "artista_ok": time.time() - artista_visto < 60}


# ---------- API do operador ----------
@app.get("/api/operador/fila", dependencies=[Depends(operador)])
def op_fila():
    itens = []
    for m in reversed(todos()):
        x = dict(m)
        x["gifs"] = {mv: f"/operador/arquivo/{m['id']}/{mv}.gif" for mv in m.get("movimentos", [])}
        x["foto"] = f"/operador/arquivo/{m['id']}/foto.jpg"
        if (m.get("arte") or {}).get("estado") == "pronta":
            x["arte_url"] = f"/operador/arquivo/{m['id']}/arte.jpg?v={int(m['arte'].get('pronta_em', 0))}"
        itens.append(x)
    return {"itens": itens, "motor": MOTOR, "retencao_horas": RETENCAO_HORAS, "apagar_tudo_as": APAGAR_TUDO_AS,
            "arte": ARTE, "artista_ok": time.time() - artista_visto < 60}


@app.get("/operador/arquivo/{i}/{nome}", dependencies=[Depends(operador)])
def op_arquivo(i: str, nome: str):
    if nome not in ARQS_PUBLICOS | {"foto.jpg", "recorte.png"}:
        raise HTTPException(404)
    p = pasta(i) / nome
    if not p.exists():
        raise HTTPException(404)
    return FileResponse(p, headers={"Cache-Control": "no-store"})


@app.post("/api/operador/{i}/{acao}", dependencies=[Depends(operador)])
async def op_acao(i: str, acao: str):
    m = ler_meta(i)
    if m is None:
        raise HTTPException(404)
    if acao == "aprovar":
        if m["estado"] not in ("aguardando", "retirado", "recusado"):
            raise HTTPException(409, f"Não dá para aprovar no estado {m['estado']}.")
        m = await mudar(i, estado="aprovado", aprovado_em=time.time())
    elif acao == "recusar":
        m = await mudar(i, estado="recusado")
    elif acao == "retirar":
        m = await mudar(i, estado="retirado")
    elif acao == "leve":  # refaz com o motor leve (ex.: o AD perdeu a cabeça de um desenho)
        d = pasta(i)
        for mv in MOVS:
            (d / f"{mv}.gif").unlink(missing_ok=True)
        t0 = time.time()
        try:
            await asyncio.to_thread(processar_leve, d / "foto.jpg", d)
        except FotoInvalida as e:
            await mudar(i, estado="erro", erro=f"motor leve não achou o desenho ({e})", movimentos=[])
            raise HTTPException(422, f"O motor leve também não achou o desenho ({e}).") from e
        m = await mudar(i, estado="aguardando", motor="leve", tempo_s=round(time.time() - t0, 2),
                        aviso="refeito no motor leve pelo operador",
                        movimentos=[mv for mv in MOVS if (d / f"{mv}.gif").exists()])
    elif acao == "tirar-arte":
        (pasta(i) / "arte.jpg").unlink(missing_ok=True)
        m = await mudar(i, arte={"estado": "retirada"})
    elif acao == "refazer-arte":
        if m["estado"] in ("processando", "erro"):
            raise HTTPException(409, f"Não dá para gerar arte no estado {m['estado']}.")
        (pasta(i) / "arte.jpg").unlink(missing_ok=True)
        m = await mudar(i, arte={"estado": "pendente"})
    elif acao == "apagar":
        apagar(i)
        return {"ok": True}
    else:
        raise HTTPException(400)
    return {"ok": True, "estado": m["estado"]}


# ---------- API do serviço artista (arte por IA: Agnes ou Codex, roda fora do contêiner) ----------
@app.get("/api/artista/proximo", dependencies=[Depends(operador)])
async def artista_proximo():
    """Entrega o desenho mais antigo com arte pendente (ou travada há mais de ARTE_TIMEOUT) e marca 'gerando'."""
    global artista_visto
    artista_visto = time.time()
    if not ARTE:
        return Response(status_code=204)
    async with trava_meta:
        for m in todos():
            a = m.get("arte") or {}
            if m["estado"] not in ("processando", "aguardando", "aprovado"):
                continue
            travada = a.get("estado") == "gerando" and time.time() - a.get("inicio", 0) > ARTE_TIMEOUT
            if a.get("estado") == "pendente" or travada:
                m["arte"] = {"estado": "gerando", "inicio": time.time(), "tentativas": a.get("tentativas", 0) + 1}
                gravar_meta(m["id"], m)
                return {"id": m["id"], "foto": f"/operador/arquivo/{m['id']}/foto.jpg"}
    return Response(status_code=204)


@app.post("/api/artista/{i}/arte", dependencies=[Depends(operador)])
async def artista_arte(i: str, arte: UploadFile = File(...), gerador: str = Form(""), tempo_s: str = Form("")):
    m = ler_meta(i)
    if m is None:
        raise HTTPException(404)
    if (m.get("arte") or {}).get("estado") != "gerando":
        raise HTTPException(409, "esta arte não está mais esperando (retirada ou refeita)")
    dados = await arte.read(int(MAX_MB * 1024 * 1024 * 3) + 1)
    try:
        img = Image.open(io.BytesIO(dados)).convert("RGB")
    except Exception as e:  # noqa: BLE001
        raise HTTPException(415, "arte não é imagem") from e
    img.thumbnail((1024, 1024))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=88)
    (pasta(i) / "arte.jpg").write_bytes(buf.getvalue())
    try:
        t = round(float(tempo_s), 1)
    except ValueError:
        t = None
    await mudar(i, arte={"estado": "pronta", "pronta_em": time.time(), "gerador": gerador[:20], "tempo_s": t})
    log.info("arte de %s pronta (%s, %s s)", i, gerador, t)
    return {"ok": True}


@app.post("/api/artista/{i}/falhou", dependencies=[Depends(operador)])
async def artista_falhou(i: str, motivo: str = Form("")):
    m = ler_meta(i)
    if m is None:
        raise HTTPException(404)
    await mudar(i, arte={"estado": "falhou", "motivo": motivo[:200]})
    log.warning("arte de %s falhou: %s", i, motivo[:200])
    return {"ok": True}


@app.post("/api/operador/apagar-tudo", dependencies=[Depends(operador)])
def op_apagar_tudo():
    return {"ok": True, "apagados": apagar_tudo()}


@app.exception_handler(HTTPException)
async def erro_http(request: Request, exc: HTTPException):
    headers = getattr(exc, "headers", None)
    return JSONResponse({"erro": exc.detail}, status_code=exc.status_code, headers=headers)
