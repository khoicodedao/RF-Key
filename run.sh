#!/bin/bash
# =======================================
# Run & Manage Next.js Container
# Author: Tony DevOps
# =======================================

PROJECT_NAME="nextjs"
SERVER_URL="0.0.0.0:3000"

echo "======================================="
echo "▶️ Run Script for $PROJECT_NAME"
echo "======================================="
echo "Chọn tác vụ:"
echo "1) Start container"
echo "2) Restart container"
echo "3) Stop container"
echo "4) Xem trạng thái container"
echo "5) Xem logs"
echo "---------------------------------------"

read -p "👉 Nhập lựa chọn [1-5]: " choice

case $choice in
  1)
    echo "🚀 Khởi động container..."
    docker compose up -d
    ;;
  2)
    echo "🔁 Restart container..."
    docker compose restart
    ;;
  3)
    echo "🛑 Dừng container..."
    docker compose down
    ;;
  4)
    echo "📦 Danh sách container:"
    docker ps | grep $PROJECT_NAME
    ;;
  5)
    echo "📜 Logs container:"
    docker compose logs -f $PROJECT_NAME
    ;;
  *)
    echo "❌ Lựa chọn không hợp lệ!"
    exit 1
    ;;
esac

echo ""
echo "✅ Hoàn tất!"
echo "🌐 Truy cập ứng dụng tại: $SERVER_URL"
