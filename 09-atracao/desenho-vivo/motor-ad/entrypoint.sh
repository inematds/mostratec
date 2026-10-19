#!/bin/sh
# Sobe o torchserve (modelos) e depois o worker HTTP do Desenho Vivo.
set -e
# threads do PyTorch = CPUs do contêiner (TS_THREADS); sem isso herda 1 por núcleo do host
export OMP_NUM_THREADS="${TS_THREADS:-4}" MKL_NUM_THREADS="${TS_THREADS:-4}"
torchserve --start --disable-token-auth --ncs \
  --ts-config /home/torchserve/config.properties
exec python /opt/worker/worker.py
