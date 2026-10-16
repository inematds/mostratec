# Ideia 6: "Seu avatar do futuro (com foto)", DEMONSTRAÇÃO

**Isto é uma DEMO interna, não um produto para o público.** Mostra como uma foto de rosto vira 4 versões "do futuro" em ilustração cartoon amigável (não é fotorrealista nem deepfake): inventor, cientista, explorador espacial e criador de robôs. Base: ideia 6 de `../docs/ideias-original.md`.

## O que tem aqui

| Pasta/arquivo | Conteúdo |
|---|---|
| `fonte/nei-rosto.jpg` | Recorte 600×600 do rosto (sem EXIF) |
| `saida/01-inventor.png` … `04-criador-de-robos.png` | As 4 versões finais, 1024×1024 |
| `gerar.py` | Script que gera tudo de novo |
| `trabalho/<tema>/` | Arquivo bruto de cada geração (`arte.png`, `resposta.txt`) |

## De onde veio a foto

Usamos **só a foto do próprio Nei Maldaner, dono do projeto**: `~/projetos/explicavideos/guia/assets/nei.jpg`, um quadro do vídeo do avatar dele, de 1280×720. É o mesmo arquivo que está em `congelou/ref/nei.jpg`. Recortamos só o rosto para que as telas do fundo, que têm texto, não entrassem na arte. Nenhuma foto de outra pessoa foi usada.

## Como rodar

```bash
cd ~/projetos/mostratec/06-avatar-foto-demo
python3 gerar.py                       # os 4 temas, um de cada vez
python3 gerar.py cientista             # um tema só
python3 gerar.py --foto outra.jpg      # outra foto (só com autorização de quem aparece nela)
```

Motor: **Codex pela assinatura** (`codex exec -i <foto>` com image_gen), sem nenhuma API paga. Cada imagem leva de 2 a 4 minutos, e o script tem timeout de 900 s por imagem. Precisa do `codex` logado e de Python com Pillow.

Rodada de 16/10/2026: foram 5 gerações. A 1ª (inventor) ficou quase fotorrealista e foi descartada. O estilo foi endurecido para cartoon 2D com contorno e cel shading, e as 4 seguintes foram aprovadas na conferência visual (rosto reconhecível, sem texto e sem deformação).

## Antes de usar com público

Esta demo **não** cumpre os requisitos abaixo, que vêm da seção de privacidade de `../docs/ideias-original.md`:

- [ ] **Sem foto como padrão.** A versão com foto é opcional. O visitante precisa poder participar sem enviar foto, escolhendo cabelo, roupa, acessórios e missão.
- [ ] **Fotos de menores.** Definir um fluxo específico para crianças e adolescentes, seguindo a LGPD e o ECA (melhor interesse), com análise jurídica das bases legais.
- [ ] **Autorização dos responsáveis.** Para tratar a imagem de menores, ter autorização dos responsáveis. A autorização para divulgar a imagem é separada da autorização para gerar o avatar.
- [ ] **Aviso claro.** Dizer para que a foto será usada, para quem ela vai e quando será apagada.
- [ ] **Exclusão comprovada.** Apagar a foto original e os arquivos temporários com prazo definido e controle técnico. Também é preciso testar e comprovar o comportamento da infraestrutura, porque não basta dizer "apagamos". Hoje o Codex/OpenAI recebe a foto, e a demo guarda os arquivos em `trabalho/`.
- [ ] **Fornecedor de IA.** Verificar os termos do serviço, a região onde a foto é processada, o tempo de retenção e se os dados são usados para treinar modelos. Ativar as opções que limitam retenção e reuso.
- [ ] **Sem publicação automática.** Nenhum avatar de visitante vai para telão, redes sociais ou publicidade sem autorização específica.
- [ ] **Sem reconhecimento facial.** Não identificar pessoas, não comparar rostos e não montar banco de rostos.
- [ ] **Segurança.** Link de download não público e com prazo de validade, EXIF removido e nenhuma galeria coletiva por padrão.
- [ ] **Revisão jurídica e técnica** do aviso de privacidade, do fluxo para menores e do processo de exclusão antes do evento (27 a 30/10/2026).
