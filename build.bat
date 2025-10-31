@echo off
title Build & Control Next.js Docker
setlocal

set "PROJECT_NAME=nextjs"
set "SERVER_URL=http://10.32.116.233:3000"

echo ======================================
echo Build and Deploy Script for %PROJECT_NAME%
echo ======================================
echo 1) Build lai (no cache)
echo 2) Build lai (dung cache)
echo 3) Stop container
echo 4) Xem logs
echo 5) Xoa container + image + cache
echo --------------------------------------
CHOICE /C 12345 /N /M ">> Chon [1-5]: "
set "opt=%ERRORLEVEL%"

if %opt%==1 goto build_nocache
if %opt%==2 goto build_cache
if %opt%==3 goto stop
if %opt%==4 goto logs
if %opt%==5 goto nuke
goto end

:build_nocache
echo [*] Build no cache...
docker compose down
docker compose build --no-cache
docker compose up -d
goto done

:build_cache
echo [*] Build dung cache...
docker compose down
docker compose build
docker compose up -d
goto done

:stop
echo [*] Dung container...
docker compose down
goto done

:logs
echo [*] Logs (Ctrl+C de thoat)...
docker compose logs -f %PROJECT_NAME%
goto end

:nuke
echo [*] Xoa tat ca container, image, cache...
docker compose down
docker system prune -af --volumes
goto done

:done
echo.
echo [OK] Hoan tat!
echo Mo trinh duyet: %SERVER_URL%
start "" "%SERVER_URL%"

:end
endlocal
