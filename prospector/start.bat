@echo off
setlocal
cd /d "%~dp0"

echo ================================
echo   PROSPECTOR - Iniciando...
echo ================================

if not exist "venv\Scripts\python.exe" (
    echo [1/4] Criando ambiente Python pela primeira vez...
    python -m venv venv
    if errorlevel 1 (
        echo ERRO: Python nao encontrado. Instale o Python 3.11+ em https://python.org e tente novamente.
        pause
        exit /b 1
    )
)

echo [2/4] Verificando dependencias Python...
venv\Scripts\python.exe -m pip install --quiet --upgrade pip
venv\Scripts\python.exe -m pip install --quiet -r requirements.txt

if not exist ".env" (
    copy .env.example .env >nul
)

if not exist "frontend\dist\index.html" (
    echo [3/4] Construindo interface pela primeira vez ^(pode levar alguns minutos^)...
    where npm >nul 2>nul
    if errorlevel 1 (
        echo ERRO: Node.js/npm nao encontrado. Instale em https://nodejs.org e tente novamente.
        pause
        exit /b 1
    )
    pushd frontend
    call npm install
    call npm run build
    popd
) else (
    echo [3/4] Interface ja construida.
)

echo [4/4] Iniciando servidor local...
start "PROSPECTOR - Servidor" /min cmd /c "venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8517"

timeout /t 3 /nobreak >nul
start "" http://127.0.0.1:8517

echo.
echo PROSPECTOR esta rodando em http://127.0.0.1:8517
echo Feche esta janela para encerrar o servidor.
echo.
pause
