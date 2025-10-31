#!/bin/bash
# =======================================
# Build & Control Next.js Docker Container
# Author: Tony DevOps
# =======================================

PROJECT_NAME="nextjs"
SERVER_URL="http://10.32.116.233:3000"

echo "======================================="
echo "🚀 Build & Deploy Script for $PROJECT_NAME"
echo "======================================="
echo "Chọn tác vụ:"
echo "1) Build mới (no cache)"
echo "2) Build thường (giữ cache)"
echo "3) Stop container"
echo "4) Xem logs"
echo "5) Xóa toàn bộ container + image liên quan"
echo "---------------------------------------"

read -p "👉 Nhập lựa chọn [1-5]: " choice

case $choice in
  1)
    echo "🔧 Build lại image (no cache)..."
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    ;;
  2)
    echo "🔧 Build lại image (dùng cache)..."
    docker compose down
    docker compose build
    docker compose up -d
    ;;
  3)
    echo "🛑 Dừng container..."
    docker compose down
    ;;
  4)
    echo "📜 Hiển thị logs container..."
    docker compose logs -f $PROJECT_NAME
    ;;
  5)
    echo "💣 Xóa toàn bộ container, image và cache..."
    docker compose down
    docker system prune -af --volumes
    ;;
  *)
    echo "❌ Lựa chọn không hợp lệ!"
    exit 1
    ;;
esac

echo ""
echo "✅ Hoàn tất!"
echo "🌐 Truy cập ứng dụng tại: $SERVER_URL"
