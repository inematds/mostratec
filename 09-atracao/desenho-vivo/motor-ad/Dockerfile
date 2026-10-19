# Motor "ad" do Desenho Vivo: Animated Drawings (Meta, MIT) em CPU, num contêiner só.
# - torchserve com os 2 modelos (detector de personagem + estimador de pose) em localhost:8080
# - worker.py (Flask) em :5000 com POST /animate, que roda o pipeline e devolve GIFs
#
# Baseado em torchserve/Dockerfile do repo original, com:
#   - commits pinados (AD b859684, xtcocoapi 17252e7)
#   - MAX_JOBS=4 na compilação do mmcv-full (sem wheel para aarch64; em x86_64 o mim pode achar
#     wheel pronta ou compilar — não testado em x86_64)
#   - movimentos curtos a ~25 quadros/s e "no lugar" (preparar_movimentos.py)
#   - 1 worker por modelo (sem isso o torchserve sobe 1 por núcleo e estoura a memória)
#   - OSMesa para renderizar sem tela (USE_MESA)
# A base original (continuumio/miniconda3:24.1.2-0, Debian 11) não constrói mais em out/2026:
# o debian-security do bullseye devolve 404. Usamos Python 3.8 oficial sobre Debian 12.
FROM python:3.8.20-slim-bookworm

ARG AD_COMMIT=b859684
ARG XTCOCO_COMMIT=17252e742ed4306a6323d74055f4c15c75cba6ad
ARG MAX_JOBS=4
ENV MAX_JOBS=${MAX_JOBS} \
    PYTHONUNBUFFERED=1 \
    PYOPENGL_PLATFORM=osmesa

RUN mkdir -p /usr/share/man/man1 && apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
      ca-certificates curl wget git gcc g++ build-essential default-jre-headless \
      libosmesa6 libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# torch CPU (há wheel para x86_64 e aarch64 no PyPI)
RUN pip install --no-cache-dir openmim torch==2.0.0 torchvision==0.15.1
RUN mim install mmcv-full==1.7.0
RUN pip install --no-cache-dir mmdet==2.27.0 torchserve==0.12.0

RUN git clone https://github.com/jin-s13/xtcocoapi.git /opt/xtcocoapi && \
    cd /opt/xtcocoapi && git checkout ${XTCOCO_COMMIT} && \
    pip install --no-cache-dir -r requirements.txt && python setup.py install
RUN pip install --no-cache-dir mmpose==0.29.0 && pip install --no-cache-dir numpy==1.24.4

# código do Animated Drawings (pinado) + dependências de render
RUN git clone https://github.com/facebookresearch/AnimatedDrawings.git /opt/AnimatedDrawings && \
    cd /opt/AnimatedDrawings && git checkout ${AD_COMMIT} && \
    pip install --no-cache-dir -e . && pip install --no-cache-dir numpy==1.24.4

# modelos (.mar) publicados no release v0.0.1 do repo
RUN mkdir -p /home/torchserve/model-store && \
    wget -q https://github.com/facebookresearch/AnimatedDrawings/releases/download/v0.0.1/drawn_humanoid_detector.mar -P /home/torchserve/model-store/ && \
    wget -q https://github.com/facebookresearch/AnimatedDrawings/releases/download/v0.0.1/drawn_humanoid_pose_estimator.mar -P /home/torchserve/model-store/

COPY config.properties /home/torchserve/config.properties
COPY preparar_movimentos.py /opt/worker/preparar_movimentos.py
RUN python /opt/worker/preparar_movimentos.py /opt/AnimatedDrawings /opt/movimentos
COPY worker.py /opt/worker/worker.py
COPY entrypoint.sh /opt/worker/entrypoint.sh
RUN chmod +x /opt/worker/entrypoint.sh

WORKDIR /opt/AnimatedDrawings
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s CMD curl -fs http://localhost:5000/health || exit 1
CMD ["/opt/worker/entrypoint.sh"]
