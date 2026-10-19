"""Gera versões curtas e a ~25 quadros/s dos movimentos do Animated Drawings.

O renderizador do AD desenha 1 quadro de vídeo por quadro do BVH. Os BVH de exemplo
vêm a 100–120 quadros/s e duram até 26 s, o que deixa o render em CPU lento (até
1000 quadros por GIF). Aqui cada BVH é "dizimado" (fica 1 a cada N quadros, com o
Frame Time multiplicado por N) e cortado num trecho curto. Não altera o código do AD:
grava BVH + YAML novos em /opt/movimentos.

Uso (no build): python preparar_movimentos.py /opt/AnimatedDrawings /opt/movimentos
"""
import sys
from pathlib import Path

import yaml

# nome: (yaml de origem, passo N, primeiro quadro original, último quadro original)
PLANO = {
    "andar": ("zombie.yaml", 1, 0, 150),        # 30 q/s -> 30 q/s, 5 s
    "pular": ("jumping.yaml", 5, 150, 654),     # 120 q/s -> 24 q/s, ~4,2 s
    "dancar": ("jesse_dance.yaml", 4, 0, 600),  # 100 q/s -> 25 q/s, 6 s
    "acenar": ("wave_hello.yaml", 5, 0, 839),   # 120 q/s -> 24 q/s
}


def dizimar(origem: Path, destino: Path, passo: int, ini: int, fim: int, up: str) -> int:
    linhas = origem.read_text().splitlines()
    i = next(k for k, l in enumerate(linhas) if l.strip().upper() == "MOTION")
    frame_time = float(linhas[i + 2].split(":")[1])
    quadros = linhas[i + 3:]
    quadros = [q for q in quadros if q.strip()][ini:fim:passo]
    # movimento "no lugar": congela a translação horizontal da raiz (canais X/Y/Z position,
    # menos o eixo "up"). Sem isso o pulo e a dança saem do quadro; quem faz o boneco
    # atravessar a tela é a página da TV.
    eixo_up = "xyz".index(up.strip()[-1].lower())
    base = quadros[0].split()
    fixos = []
    for q in quadros:
        v = q.split()
        for k in range(3):
            if k != eixo_up:
                v[k] = base[k]
        fixos.append(" ".join(v))
    quadros = fixos
    saida = linhas[:i + 1] + [f"Frames: {len(quadros)}", f"Frame Time: {frame_time * passo:.6f}"] + quadros
    destino.write_text("\n".join(saida) + "\n")
    return len(quadros)


def main(ad: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for nome, (cfg_nome, passo, ini, fim) in PLANO.items():
        cfg = yaml.safe_load((ad / "examples/config/motion" / cfg_nome).read_text())
        bvh_src = ad / cfg["filepath"]
        bvh_dst = out / f"{nome}.bvh"
        n = dizimar(bvh_src, bvh_dst, passo, ini, fim, cfg["up"])
        cfg["filepath"] = str(bvh_dst)
        cfg["start_frame_idx"] = 0
        cfg["end_frame_idx"] = n
        (out / f"{nome}.yaml").write_text(yaml.dump(cfg))
        print(f"{nome}: {n} quadros (passo {passo}) de {bvh_src.name}")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
