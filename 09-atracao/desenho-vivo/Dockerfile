# App do Desenho Vivo (páginas + API + motor leve). Imagem pequena, roda em x86_64 e arm64.
FROM python:3.12.8-slim-bookworm
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 TZ=America/Sao_Paulo
RUN apt-get update && apt-get install -y --no-install-recommends tzdata curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
RUN useradd -r -u 10001 -m app && mkdir -p /dados && chown app /dados
COPY app /srv/app
WORKDIR /srv/app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -fs http://localhost:8000/saude || exit 1
# 1 processo: a fila e o faxineiro vivem dentro dele. Sem log de acesso (não guardamos IP).
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log", "--proxy-headers"]
