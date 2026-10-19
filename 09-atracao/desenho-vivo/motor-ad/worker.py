"""Worker HTTP do motor "ad" (Animated Drawings) do Desenho Vivo.

POST /animate  (multipart: imagem=<png/jpg>, movimentos=andar,pular,dancar)
  -> application/zip com <movimento>.gif + texture.png, ou JSON {"erro": ...}
GET  /health   -> {"ok": true} quando o torchserve responde

Não altera o código do Animated Drawings: usa examples/image_to_annotations.py e
animated_drawings.render.start, cada render num subprocesso (o contexto OSMesa é
global e não convém reaproveitar entre renders).
"""
import io
import json
import os
from concurrent.futures import ThreadPoolExecutor
import subprocess
import sys
import tempfile
import threading
import time
import zipfile
from pathlib import Path

import requests
import yaml
from flask import Flask, Response, request

AD = Path("/opt/AnimatedDrawings")
sys.path.insert(0, str(AD / "examples"))

MOV_DIR = Path(os.environ.get("MOVIMENTOS_DIR", "/opt/movimentos"))  # gerado por preparar_movimentos.py
PARALELO = int(os.environ.get("RENDER_PARALELO", "3"))  # renders simultâneos (1 por movimento)
# movimento -> (motion cfg, retarget cfg)
MOVIMENTOS = {
    "andar": (MOV_DIR / "andar.yaml", "examples/config/retarget/fair1_ppf.yaml"),
    "pular": (MOV_DIR / "pular.yaml", "examples/config/retarget/fair1_ppf.yaml"),
    "dancar": (MOV_DIR / "dancar.yaml", "examples/config/retarget/mixamo_fff.yaml"),
    "acenar": (MOV_DIR / "acenar.yaml", "examples/config/retarget/fair1_ppf.yaml"),
}

RENDER_PY = r"""
import sys, animated_drawings.render
animated_drawings.render.start(sys.argv[1])
"""

app = Flask(__name__)
trava = threading.Lock()  # um desenho por vez: CPU e memória previsíveis


def ts_ok() -> bool:
    try:
        r = requests.get("http://127.0.0.1:8080/ping", timeout=2)
        if r.status_code != 200:
            return False
        m = requests.get("http://127.0.0.1:8081/models", timeout=2).json()
        return len(m.get("models", [])) >= 2
    except Exception:
        return False


@app.get("/health")
def health():
    ok = ts_ok()
    return Response(json.dumps({"ok": ok}), status=200 if ok else 503, mimetype="application/json")


def render(char_dir: Path, mov: str) -> Path:
    motion, retarget = MOVIMENTOS[mov]
    saida = char_dir / f"{mov}.gif"
    cfg = {
        "scene": {"ANIMATED_CHARACTERS": [{
            "character_cfg": str(char_dir / "char_cfg.yaml"),
            "motion_cfg": str(AD / motion),
            "retarget_cfg": str(AD / retarget),
        }]},
        "view": {"USE_MESA": True, "WINDOW_DIMENSIONS": [400, 400]},
        "controller": {"MODE": "video_render", "OUTPUT_VIDEO_PATH": str(saida)},
    }
    cfg_fn = char_dir / f"mvc_{mov}.yaml"
    cfg_fn.write_text(yaml.dump(cfg))
    # 1 thread de BLAS por render: com cota de CPU (docker --cpus) o OpenBLAS abre 1 thread por
    # núcleo da máquina e o render fica 3-4x mais lento (medido: 26-38 s -> 9 s por movimento)
    env = dict(os.environ, OMP_NUM_THREADS="1", OPENBLAS_NUM_THREADS="1", MKL_NUM_THREADS="1")
    subprocess.run([sys.executable, "-c", RENDER_PY, str(cfg_fn)], cwd=str(AD), env=env,
                   check=True, timeout=240, capture_output=True)
    return saida


@app.post("/animate")
def animate():
    f = request.files.get("imagem")
    if f is None:
        return Response(json.dumps({"erro": "falta o campo imagem"}), 400, mimetype="application/json")
    movs = [m for m in request.form.get("movimentos", "andar,pular,dancar").split(",") if m in MOVIMENTOS]
    with trava, tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        img = tmp / "entrada.png"
        f.save(str(img))
        char_dir = tmp / "char"
        tempos = {}
        t0 = time.time()
        try:
            from image_to_annotations import image_to_annotations
            image_to_annotations(str(img), str(char_dir))
        except AssertionError as e:
            return Response(json.dumps({"erro": "sem_personagem", "detalhe": str(e)[:300]}), 422,
                            mimetype="application/json")
        tempos["deteccao_pose_s"] = round(time.time() - t0, 2)
        t1 = time.time()

        def um(mov):
            try:
                return mov, render(char_dir, mov), None
            except subprocess.SubprocessError as e:
                return mov, None, (getattr(e, "stderr", None) or b"")[-300:].decode("utf-8", "replace") or str(e)

        with ThreadPoolExecutor(max_workers=max(1, PARALELO)) as ex:
            resultados = list(ex.map(um, movs))
        tempos["render_s"] = round(time.time() - t1, 2)
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_STORED) as z:
            for mov, gif, erro in resultados:
                if gif is not None:
                    z.write(gif, f"{mov}.gif")
                else:
                    tempos[f"erro_{mov}"] = erro
            z.write(char_dir / "texture.png", "texture.png")
            tempos["total_s"] = round(time.time() - t0, 2)
            z.writestr("tempos.json", json.dumps(tempos))
        return Response(buf.getvalue(), mimetype="application/zip")


if __name__ == "__main__":
    # espera o torchserve carregar os modelos (até ~3 min em CPU fraca)
    for _ in range(90):
        if ts_ok():
            break
        time.sleep(2)
    app.run(host="0.0.0.0", port=5000, threaded=True)
