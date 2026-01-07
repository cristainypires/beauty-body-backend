@echo off

git diff --cached --name-only | findstr /R /C:"node_modules" /C:".env" >nul

if %errorlevel%==0 (
  echo ❌ ERRO: Nao e permitido commitar node_modules ou .env
  exit /b 1
)
