#!/bin/sh
set -eu
cd "$(dirname "$0")"
if [ ! -f .env ]; then
  echo "FEHLER: .env fehlt. Kopiere .env.example nach .env und trage die Discord-Daten ein."
  exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "FEHLER: Docker fehlt."
  exit 1
fi
docker compose config --quiet
docker compose build
docker compose up -d --no-deps
echo "Warte auf Discord-Login und HTTP-Start..."
i=0
until docker compose exec -T novalab-control node -e "fetch('http://127.0.0.1:3100/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; do
  i=$((i+1))
  if [ "$i" -ge 30 ]; then
    docker compose logs --tail=60
    echo "FEHLER: Healthcheck nach 60 Sekunden nicht erfolgreich."
    exit 1
  fi
  sleep 2
done
docker compose ps
docker compose logs --tail=20
echo "NovaLab Control erreichbar unter http://127.0.0.1:3100 (lokal)."
