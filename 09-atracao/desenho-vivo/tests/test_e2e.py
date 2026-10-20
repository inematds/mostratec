"""Teste de ponta a ponta do Desenho Vivo.

Sobe o servidor de verdade (uvicorn) numa porta livre com uma pasta de dados
temporária, gera uma foto de desenho, envia, confere que nada vai para a TV antes da
aprovação, aprova como operador e confere que os GIFs animados saem.

Uso:
  python tests/test_e2e.py                 # motor leve
  MOTOR=ad MOTOR_AD_URL=http://127.0.0.1:5000 python tests/test_e2e.py
  URL_BASE=http://127.0.0.1:8000 OPERADOR_SENHA=... python tests/test_e2e.py  # contra um serviço já no ar (ex.: docker compose)
Também roda com pytest.
"""
from __future__ import annotations

import io
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import httpx
from PIL import Image

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
sys.path.insert(0, str(AQUI))
from gerar_desenho import salvar  # noqa: E402


def porta_livre() -> int:
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def esperar(cond, segundos, passo=0.5, msg="tempo esgotado"):
    fim = time.time() + segundos
    while time.time() < fim:
        v = cond()
        if v:
            return v
        time.sleep(passo)
    raise AssertionError(msg)


def rodar(base: str, senha: str, dados: Path | None, motor: str) -> dict:
    ESPERA = float(os.environ.get("ESPERA_S", 400 if motor == "ad" else 60))  # máquina carregada: aumente
    tmp = Path(tempfile.mkdtemp())
    foto = tmp / "desenho.jpg"
    salvar(str(foto))
    c = httpx.Client(base_url=base, timeout=30)
    op = httpx.BasicAuth("operador", senha)
    res = {}

    # páginas públicas e proteção do operador
    for p in ("/", "/tv", "/galeria", "/qr.png", "/saude"):
        assert c.get(p).status_code == 200, p
    assert c.get("/operador").status_code == 401
    assert c.get("/api/operador/fila", auth=httpx.BasicAuth("operador", "errada")).status_code == 401

    # rejeições
    r = c.post("/api/enviar", files={"foto": ("x.jpg", b"isto nao e imagem", "image/jpeg")}, data={"aceite": "1"})
    assert r.status_code == 415, r.text
    r = c.post("/api/enviar", files={"foto": ("x.jpg", foto.read_bytes(), "image/jpeg")})
    assert r.status_code == 400, "sem aceite deveria recusar"
    grande = b"\xff\xd8" + os.urandom(11 * 1024 * 1024)
    r = c.post("/api/enviar", files={"foto": ("g.jpg", grande, "image/jpeg")}, data={"aceite": "1"})
    assert r.status_code == 413, r.status_code

    # envio
    t0 = time.time()
    r = c.post("/api/enviar", files={"foto": ("desenho.jpg", foto.read_bytes(), "image/jpeg")},
               data={"aceite": "1", "apelido": "Robô <b>Trovão</b> com nome muito comprido"})
    assert r.status_code == 200, r.text
    i = r.json()["id"]
    st = esperar(lambda: (lambda j: j if j["estado"] != "processando" else None)(c.get(f"/api/d/{i}").json()),
                 ESPERA, msg="processamento não terminou")
    res["tempo_processamento_s"] = round(time.time() - t0, 2)
    assert st["estado"] == "aguardando", st
    assert "gifs" not in st

    # antes de aprovar: nada público
    assert c.get("/api/tv").json()["itens"] == []
    assert c.get("/api/galeria").json()["itens"] == []
    assert c.post(f"/api/d/{i}/curtir", json={"aparelho": "a" * 24}).status_code == 404, "curtiu antes de aprovar"
    assert c.get(f"/arquivos/{i}/andar.gif").status_code == 404

    fila = c.get("/api/operador/fila", auth=op).json()
    item = next(x for x in fila["itens"] if x["id"] == i)
    res["motor_usado"] = item["motor"]
    res["tempo_servidor_s"] = item["tempo_s"]
    res["tempos_ad"] = item.get("tempos_ad")
    res["aviso"] = item.get("aviso")
    assert "<" not in item["apelido"] and 0 < len(item["apelido"]) <= 20, item["apelido"]
    if motor == "ad":
        assert item["motor"] == "ad", f"esperava motor ad, veio {item['motor']} ({item.get('aviso')})"

    # foto guardada sem EXIF (o original tinha GPS)
    fj = c.get(f"/operador/arquivo/{i}/foto.jpg", auth=op)
    assert fj.status_code == 200
    assert len(Image.open(io.BytesIO(fj.content)).getexif()) == 0, "EXIF/GPS não foi removido"

    # arte por IA (serviço artista): com ARTISTA_REAL=1 espera o serviço de verdade; senão faz o papel dele
    artista_real = os.environ.get("ARTISTA_REAL") == "1"
    if not artista_real:  # com o artista real a arte pode ficar pronta antes da animação
        assert st.get("arte_gerando") is True, st
        assert c.get("/api/artista/proximo").status_code == 401, "artista sem senha"
        job = c.get("/api/artista/proximo", auth=op)
        assert job.status_code == 200 and job.json()["id"] == i, job.text
        assert c.get("/api/artista/proximo", auth=op).status_code == 204, "entregou o mesmo desenho duas vezes"
        assert c.get(job.json()["foto"], auth=op).status_code == 200
        png = io.BytesIO()
        Image.new("RGB", (1300, 1300), (30, 120, 200)).save(png, "PNG")
        r = c.post(f"/api/artista/{i}/arte", auth=op, files={"arte": ("arte.png", png.getvalue(), "image/png")},
                   data={"gerador": "falso", "tempo_s": "1.5"})
        assert r.status_code == 200, r.text
        assert c.post(f"/api/artista/{i}/arte", auth=op, files={"arte": ("a.png", png.getvalue(), "image/png")}
                      ).status_code == 409, "aceitou arte que não estava esperando"
    assert c.get(f"/arquivos/{i}/arte.jpg").status_code == 404, "arte pública antes de aprovar"

    # aprova
    assert c.post(f"/api/operador/{i}/aprovar", auth=op).status_code == 200
    if artista_real:
        t1 = time.time()
        esperar(lambda: c.get(f"/api/d/{i}").json().get("arte"), 300, passo=3, msg="artista real não entregou a arte")
        res["arte_real_s"] = round(time.time() - t1, 1)
    st = c.get(f"/api/d/{i}").json()
    assert st.get("arte") and not st.get("arte_gerando"), st
    a = c.get(st["arte"])
    assert a.status_code == 200 and a.headers["content-type"] == "image/jpeg", a.status_code
    res["arte"] = {"bytes": len(a.content), "tamanho": Image.open(io.BytesIO(a.content)).size}
    assert max(res["arte"]["tamanho"]) <= 1024, res["arte"]
    if not artista_real:
        assert c.post(f"/api/operador/{i}/tirar-arte", auth=op).status_code == 200
        assert "arte" not in c.get(f"/api/d/{i}").json() and c.get(st["arte"]).status_code == 404
        assert c.post(f"/api/operador/{i}/refazer-arte", auth=op).status_code == 200
        assert c.get(f"/api/d/{i}").json().get("arte_gerando") is True
        assert c.get("/api/artista/proximo", auth=op).json()["id"] == i
        assert c.post(f"/api/artista/{i}/falhou", auth=op, data={"motivo": "teste"}).status_code == 200
        st3 = c.get(f"/api/d/{i}").json()
        assert "arte" not in st3 and not st3.get("arte_gerando"), st3
        assert c.get("/api/operador/fila", auth=op).json()["itens"][0]["arte"]["estado"] == "falhou"
    res["arte_fluxo"] = "ok"
    st = c.get(f"/api/d/{i}").json()
    assert st["estado"] == "aprovado" and st["gifs"], st
    tv = c.get("/api/tv").json()
    assert [x["id"] for x in tv["itens"]] == [i]
    res["gifs"] = {}
    for mv, url in st["gifs"].items():
        g = c.get(url)
        assert g.status_code == 200 and g.headers["content-type"] == "image/gif", (mv, g.status_code)
        im = Image.open(io.BytesIO(g.content))
        assert im.n_frames >= 10, f"{mv}: só {im.n_frames} quadros"
        assert len(g.content) > 20_000, f"{mv}: GIF pequeno demais"
        res["gifs"][mv] = {"bytes": len(g.content), "quadros": im.n_frames, "tamanho": im.size}
    assert {"andar", "pular", "dancar"} <= set(res["gifs"]), res["gifs"].keys()

    # galeria e curtidas: uma por aparelho, chamar de novo desfaz
    gal = c.get("/api/galeria").json()["itens"]
    assert [x["id"] for x in gal] == [i] and gal[0]["curtidas"] == 0, gal
    assert c.post(f"/api/d/{i}/curtir", json={"aparelho": "curto"}).status_code == 400
    assert c.post(f"/api/d/{i}/curtir", json={}).status_code == 400
    r1 = c.post(f"/api/d/{i}/curtir", json={"aparelho": "A" * 24}).json()
    r2 = c.post(f"/api/d/{i}/curtir", json={"aparelho": "B" * 24}).json()
    assert r1 == {"curtiu": True, "curtidas": 1} and r2["curtidas"] == 2, (r1, r2)
    r3 = c.post(f"/api/d/{i}/curtir", json={"aparelho": "A" * 24}).json()
    assert r3 == {"curtiu": False, "curtidas": 1}, r3
    assert c.get("/api/galeria?ordem=curtidos").json()["itens"][0]["curtidas"] == 1
    assert "curtidores" not in json.dumps(c.get("/api/galeria").json()), "lista de aparelhos vazou"
    res["curtidas"] = "ok"

    # tirar da TV
    assert c.post(f"/api/operador/{i}/retirar", auth=op).status_code == 200
    assert c.get("/api/tv").json()["itens"] == []
    assert c.get(f"/arquivos/{i}/andar.gif").status_code == 404
    assert c.get("/api/galeria").json()["itens"] == [], "retirado continuou na galeria"

    # papel em branco: deve dar "erro" (sem personagem), não travar
    branco = io.BytesIO()
    Image.new("RGB", (900, 1200), (240, 240, 235)).save(branco, "JPEG")
    r = c.post("/api/enviar", files={"foto": ("b.jpg", branco.getvalue(), "image/jpeg")}, data={"aceite": "1"})
    j2 = r.json()["id"]
    st2 = esperar(lambda: (lambda j: j if j["estado"] != "processando" else None)(c.get(f"/api/d/{j2}").json()),
                  ESPERA)
    assert st2["estado"] == "erro", st2

    # limpeza (só quando a pasta de dados é local)
    if dados is not None:
        meta = dados / i / "meta.json"
        m = json.loads(meta.read_text())
        m["criado"] -= 25 * 3600
        meta.write_text(json.dumps(m))
        sys.path.insert(0, str(RAIZ / "app"))
        os.environ["DADOS"] = str(dados)
        os.environ.setdefault("OPERADOR_SENHA", senha)
        import main  # noqa: PLC0415
        assert main.limpar_velhos() >= 1
        assert not (dados / i).exists(), "limpeza de 24 h não apagou"
        assert (dados / j2).exists(), "limpeza apagou desenho novo"
        res["limpeza_24h"] = "ok"
    return res


def test_e2e():
    base = os.environ.get("URL_BASE")
    motor = os.environ.get("MOTOR", "leve")
    if base:
        print(json.dumps(rodar(base, os.environ["OPERADOR_SENHA"], None, motor), ensure_ascii=False, indent=1))
        return
    dados = Path(tempfile.mkdtemp(prefix="dv-dados-"))
    porta = porta_livre()
    senha = "teste-" + str(porta)
    env = dict(os.environ, DADOS=str(dados), OPERADOR_SENHA=senha, MOTOR=motor,
               URL_PUBLICA=f"http://127.0.0.1:{porta}")
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(porta),
                             "--no-access-log"], cwd=RAIZ / "app", env=env)
    try:
        base = f"http://127.0.0.1:{porta}"
        esperar(lambda: _ok(base), 30, msg="servidor não subiu")
        res = rodar(base, senha, dados, motor)
        print(json.dumps(res, ensure_ascii=False, indent=1))
    finally:
        proc.terminate()
        proc.wait(10)


def _ok(base):
    try:
        return httpx.get(base + "/saude", timeout=2).status_code == 200
    except httpx.HTTPError:
        return False


if __name__ == "__main__":
    test_e2e()
    print("OK: teste de ponta a ponta passou")
