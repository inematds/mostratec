#!/usr/bin/env python3
"""Banco de imagens do quiz "Seu futuro em imagem" (MOSTRATEC 2026).
Motor: Codex pela ASSINATURA (codex exec + image_gen). Sem foto de ninguém, sem API paga.
Uso:
  python3 gerar-imagens.py                 # gera as que faltam
  python3 gerar-imagens.py espaco robos    # só estas (refaz)
Saída: img/<id>.jpg (1024x1536, retrato 2:3) e trabalho/<id>/ (bruto).
"""
import os, subprocess, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))

# Cada futuro: cena cinematográfica. A pessoa aparece DE COSTAS ou em silhueta, para quem joga se ver nela.
FUTUROS = {
    'espaco':   'a young explorer in a sleek white and yellow spacesuit standing on the edge of a crater on Mars at sunrise, '
                'a huge ringed planet and a launch tower with a rocket lifting off in the distance, dust glowing in the light',
    'robos':    'a young engineer in a high-tech robotics lab facing a tall sleek industrial humanoid robot (Tesla Optimus style, '
                'matte white and graphite panels, no face screen, no cute eyes) that is reaching out its hand, sparks of blue '
                'light from holographic schematics floating between them',
    'mundos':   'a young game creator standing inside a giant glowing virtual world that is being built around them: floating '
                'islands, waterfalls flowing upward, a city of light assembling block by block from their raised hands',
    'vida':     'a young scientist in a futuristic biotech lab, a gigantic glowing DNA double helix rising like a tower of light in '
                'front of them, plants and cells floating in transparent spheres, cool clean light with warm highlights',
    'planeta':  'a young guardian of the planet standing on a cliff over a vast ocean at golden hour, giant floating wind turbines '
                'and solar sails on the horizon, whales breaching below, a storm parting to reveal sunlight',
    'cidades':  'a young architect on a rooftop garden at dusk looking over a breathtaking future city of green towers covered in '
                'trees, sky bridges, quiet flying trams and glowing streets, a holographic city model at their side',
    'agentes':  'a young AI builder in a dark room surrounded by many floating translucent screens and streams of light, small '
                'glowing orbs (AI agents) flying out of their hands and working together across a holographic map of the world',
    'inventor': 'a young inventor in a huge maker workshop at night, a glowing flying machine prototype hovering above the '
                'workbench, 3D printers, drones and tools around, warm sparks flying, dramatic light from the invention',
}

def prompt(cena):
    return f'''Use sua ferramenta de geração de imagem (image_gen) para criar UMA imagem VERTICAL em retrato (proporção 2:3)
e salve o PNG como arte.png neste diretório. Não crie nem edite nenhum outro arquivo.
Cena: {cena}.
A pessoa jovem (adolescente) aparece de costas ou em três quartos de costas, sem rosto visível, pequena no quadro
diante da grandiosidade da cena: quem olha deve se imaginar no lugar dela. Roupa e corpo neutros.
Estilo: ilustração digital cinematográfica de altíssima qualidade, tipo pôster de filme / concept art, luz dramática,
profundidade, cores vivas com toque de amarelo dourado (#FACC15) como destaque, luz neutra (sem filtro amarelado geral).
Impactante, inspiradora, épica. NÃO cartoon infantil, NÃO mascote.
Se houver robô: humanoide industrial liso e realista, nunca fofo, sem rosto de tela, sem olhinhos.
SEM texto, SEM letras, SEM números, SEM logotipos, SEM marca d'água.
Responda só "ok" quando terminar.'''

def gera(fid):
    d = os.path.join(AQUI, 'trabalho', fid)
    os.makedirs(d, exist_ok=True)
    png = os.path.join(d, 'arte.png')
    if os.path.exists(png):
        os.remove(png)
    try:
        r = subprocess.run(['codex', 'exec', '--skip-git-repo-check', '--dangerously-bypass-approvals-and-sandbox',
                            '-o', os.path.join(d, 'resposta.txt'), '-'],
                           input=prompt(FUTUROS[fid]), cwd=d, capture_output=True, text=True, timeout=900)
    except subprocess.TimeoutExpired:
        return f'{fid}: FALHOU timeout 900 s'
    if not os.path.exists(png):
        return f'{fid}: FALHOU ' + (r.stderr or r.stdout)[-300:]
    out = os.path.join(AQUI, 'img', f'{fid}.jpg')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(png).convert('RGB')
    # corta para 2:3 e reduz para 1024x1536
    w, h = im.size; alvo = 2 / 3
    if w / h > alvo:
        nw = int(h * alvo); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / alvo); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.resize((1024, 1536), Image.LANCZOS).save(out, quality=84, optimize=True, progressive=True)
    return f'{fid}: OK -> {out}'

if __name__ == '__main__':
    pedidos = sys.argv[1:]
    for fid in pedidos or list(FUTUROS):
        if fid not in FUTUROS:
            sys.exit(f'futuro desconhecido: {fid} (opções: {", ".join(FUTUROS)})')
        if not pedidos and os.path.exists(os.path.join(AQUI, 'img', f'{fid}.jpg')):
            print(f'{fid}: já existe', flush=True); continue
        print(gera(fid), flush=True)  # sequencial: respeita o limite da assinatura
