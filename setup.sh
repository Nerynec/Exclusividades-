#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] Docker no está instalado o no está en PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm no está instalado o no está en PATH."
  exit 1
fi

echo "[1/6] Levantando MySQL con Docker Compose..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d mysql

echo "[2/6] Esperando que MySQL esté listo..."
for i in {1..45}; do
  if docker exec tienda_mysql mysqladmin ping -h 127.0.0.1 -uroot -proot123 --silent >/dev/null 2>&1; then
    echo "MySQL listo."
    break
  fi
  if [[ "$i" -eq 45 ]]; then
    echo "[ERROR] MySQL no respondió a tiempo."
    exit 1
  fi
  sleep 2
done

echo "[3/6] Preparando variables del backend..."
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo "Archivo backend/.env creado desde .env.example"
fi

echo "[4/6] Instalando dependencias del backend..."
( cd "$BACKEND_DIR" && npm install )

echo "[5/6] Instalando dependencias del frontend..."
( cd "$FRONTEND_DIR" && npm install )

echo "[6/6] Iniciando backend y frontend..."
(
  cd "$BACKEND_DIR"
  npm run dev
) &
BACK_PID=$!

(
  cd "$FRONTEND_DIR"
  npm run dev -- --host 0.0.0.0
) &
FRONT_PID=$!

cleanup() {
  echo "\nDeteniendo procesos..."
  kill "$BACK_PID" "$FRONT_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo ""
echo "✅ Sistema levantado"
echo "- Backend: http://localhost:4000/health"
echo "- Frontend: http://localhost:5173"
echo "- Login: admin@tienda.com / admin123"
echo ""
echo "Presiona Ctrl+C para cerrar backend y frontend."

wait "$BACK_PID" "$FRONT_PID"
