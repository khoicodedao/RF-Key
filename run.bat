@echo off
title Run Next.js Container
setlocal

set "PROJECT_NAME=nextjs"
set "SERVER_URL=http://10.32.116.233:3000"

echo ======================================
echo Run Script for %PROJECT_NAME%
echo ======================================
echo 1) Start container
echo 2) Restart container
echo 3) Stop container
echo 4) Trang thai container
echo 5) Xem logs
echo --------------------------------------
CHOICE /C 12345 /N /M ">> Chon [1-5]: "
set "opt=%ERRORLEVEL%"

if %opt%==1 goto start
if %opt%==2 goto restart
if %opt%==3 goto stop
if %opt%==4 goto status
if %opt%==5 goto logs
goto end

:start
echo [*] Start container...
docker compose up -d
goto done

:restart
echo [*] Restart container...
docker compose restart
goto done

:stop
echo [*] Stop container...
docker compose down
goto done

:status
echo [*] Trang thai container (lọc theo ten):
docker ps | findstr /I "%PROJECT_NAME%"
goto end

:logs
echo [*] Logs (Ctrl+C de thoat)...
docker compose logs -f %PROJECT_NAME%
goto end

:done
echo.
echo [OK] Hoan tat!
echo Mo trinh duyet: %SERVER_URL%
start "" "%SERVER_URL%"

:end
endlocal
