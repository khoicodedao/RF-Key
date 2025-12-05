#!/usr/bin/env bash

# ==== CONFIG ====
PROJECT_NAME="nextjs"                 # Tên service trong docker-compose.yml
SERVER_URL="http://10.32.116.233:3000"
NETWORK_NAME="appnet"                 # Tên external network
# =================

set -e

echo "======================================"
echo " Build and Deploy Script for ${PROJECT_NAME}"
echo "======================================"
echo " 1) Build lai (no cache)"
echo " 2) Build lai (dung cache)"
echo " 3) Stop container"
echo " 4) Xem logs"
echo " 5) Xoa container + image + cache"
echo "--------------------------------------"
read -rp ">> Chon [1-5]: " opt

ensure_network() {
  echo "[*] Kiem tra Docker network \"${NETWORK_NAME}\"..."
  if ! docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1; then
    echo "[*] Khong tim thay network \"${NETWORK_NAME}\", dang tao moi..."
    docker network create "${NETWORK_NAME}"
  fi
}

case "$opt" in
  1)
    echo "[*] Build (no cache)..."
    docker compose down
    ensure_network
    docker compose build --no-cache
    docker compose up -d
    ;;
  2)
    echo "[*] Build (dung cache)..."
    docker compose down
    ensure_network
    docker compose build
    docker compose up -d
    ;;
  3)
    echo "[*] Dung container..."
    docker compose down
    ;;
  4)
    echo "[*] Logs (Ctrl+C de thoat)..."
    docker compose logs -f "${PROJECT_NAME}"
    exit 0
    ;;
  5)
    echo "[*] Xoa tat ca container, image, cache lien quan..."
    docker compose down
    docker system prune -af --volumes
    ;;
  *)
    echo "[!] Lua chon khong hop le."
    exit 1
    ;;
esac

echo
echo "[OK] Hoan tat!"
echo "Mo trinh duyet: ${SERVER_URL}"

# Mo browser tu dong neu co the
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${SERVER_URL}" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
  open "${SERVER_URL}" >/dev/null 2>&1 &
fi
