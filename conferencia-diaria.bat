@echo off
cd /d "C:\Users\Administrador.LAURAFERREIRA\Downloads\Claude (Host)"

set LOG_FILE=C:\Users\Administrador.LAURAFERREIRA\Downloads\Claude (Host)\logs\conferencia-%date:~-4,4%%date:~-7,2%%date:~0,2%.txt

if not exist "C:\Users\Administrador.LAURAFERREIRA\Downloads\Claude (Host)\logs" mkdir "C:\Users\Administrador.LAURAFERREIRA\Downloads\Claude (Host)\logs"

echo [%date% %time%] Iniciando Conferencia de Ofertas >> "%LOG_FILE%"

"C:\Users\Administrador.LAURAFERREIRA\.local\bin\claude.exe" --dangerously-skip-permissions -p "Execute a Conferencia de Ofertas para AMBAS as planilhas automaticamente. Nao pergunte qual planilha - execute para as duas: Acompanhamento Ofertas e Radar de Ofertas. Siga os passos: 1) Rode read_sheet.js e read_radar.js para identificar pendentes de hoje. 2) Cruze as listas e evite trabalho duplicado (mesmo link = coletar uma vez). 3) Para cada link pendente, abra no Playwright, pressione Escape para fechar popup, leia o numero de resultados no topo da pagina. 4) Grave os valores nas duas planilhas com write_results.js." >> "%LOG_FILE%" 2>&1

echo [%date% %time%] Conferencia finalizada >> "%LOG_FILE%"
