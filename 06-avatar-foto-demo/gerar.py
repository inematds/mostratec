#!/usr/bin/env python3
"""DEMO ideia 6 (MOSTRATEC): foto de rosto -> 4 versões "do futuro" em ilustração amigável.

Motor: Codex pela ASSINATURA (codex exec + image_gen), foto anexada com -i. Nenhuma API paga.
Uso:
  python3 gerar.py                      # gera os 4 temas
  python3 gerar.py inventor cientista   # só os temas indicados
  python3 gerar.py --foto outra.jpg     # outra foto (somente com autorização do dono do rosto)
Saída: trabalho/<tema>/arte.png (bruto) e saida/<NN>-<tema>.png (1024x1024).
"""
import os, subprocess, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTO = os.path.join(AQUI, 'fonte', 'nei-rosto.jpg')
TEMAS = {
    'inventor': ('01', 'an inventor of the future in a bright workshop, wearing a tool belt and goggles pushed up on the '
                      'forehead, holding a glowing small invention, gears and blueprint sketches (without writing) around'),
    'cientista': ('02', 'a scientist of the future in a clean colorful lab coat, holding a glowing test tube, '
                       'friendly lab with plants and holographic molecules in the background'),
    'explorador-espacial': ('03', 'a space explorer of the future in a white and yellow spacesuit with the helmet off '
                                 '(held under the arm), standing on a moon base with planets and stars behind'),
    'criador-de-robos': ('04', 'a robot builder of the future, standing next to a cute friendly small robot he built, '
                              'with a screwdriver in hand, tidy maker space in the background'),
}


def prompt(cena):
    return f'''Use sua ferramenta de geração de imagem (image_gen) para criar UMA imagem quadrada 1:1 e salve o PNG
como arte.png neste diretório. Não crie nem edite nenhum outro arquivo.

Referência: a foto anexada é do próprio dono do projeto (autorizado). Use-a como referência do rosto:
mantenha os traços reconhecíveis — homem por volta de 60 anos, careca com pouco cabelo branco nas laterais,
barba curta branca, óculos retangulares de armação preta grossa, sorriso amigável.

Cena: retrato de meio corpo dele como {cena}.

Estilo OBRIGATÓRIO: ilustração cartoon 2D de livro infantil / desenho animado, contornos pretos marcados,
cores chapadas com sombreado simples (cel shading), proporções levemente caricatas (cabeça um pouco maior),
pele e roupa SEM textura de foto, fundo desenhado e simplificado. Deve ser óbvio à primeira vista que é um
desenho, nunca uma foto. NÃO fotorrealista, NÃO 3D realista, NÃO deepfake.
Luz neutra, cores vivas, amarelo #FACC15 como cor de destaque.
Uma única pessoa, rosto inteiro visível de frente, os dois olhos visíveis, mãos normais ou fora do quadro.
SEM texto, SEM letras, SEM números, SEM logotipos, SEM marca d'água.
Responda só "ok" quando terminar.'''


def gera(tema, foto):
    num, cena = TEMAS[tema]
    d = os.path.join(AQUI, 'trabalho', tema)
    os.makedirs(d, exist_ok=True)
    png = os.path.join(d, 'arte.png')
    if os.path.exists(png):
        os.remove(png)
    try:
        r = subprocess.run(['codex', 'exec', '--skip-git-repo-check', '--dangerously-bypass-approvals-and-sandbox',
                            '-i', foto, '-o', os.path.join(d, 'resposta.txt'), '-'],
                           input=prompt(cena), cwd=d, capture_output=True, text=True, timeout=900)
    except subprocess.TimeoutExpired:
        return f'{tema}: FALHOU timeout 900 s'
    if not os.path.exists(png):
        return f'{tema}: FALHOU ' + (r.stderr or r.stdout)[-300:]
    out = os.path.join(AQUI, 'saida', f'{num}-{tema}.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    Image.open(png).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(out)
    return f'{tema}: OK -> {out}'


if __name__ == '__main__':
    args = sys.argv[1:]
    foto = FOTO
    if '--foto' in args:
        i = args.index('--foto'); foto = os.path.abspath(args[i + 1]); del args[i:i + 2]
    temas = args or list(TEMAS)
    for t in temas:  # sequencial: evita estourar limite da assinatura
        if t not in TEMAS:
            sys.exit(f'tema desconhecido: {t} (opções: {", ".join(TEMAS)})')
        print(gera(t, foto), flush=True)
