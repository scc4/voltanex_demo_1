@echo off
echo Executando testes da Demo 1 do VOLTANEX...

REM Verifica se o servidor está rodando
curl -s http://localhost:3000/ >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Servidor não está rodando. Iniciando servidor...
    start /b cmd /c "node src/app.js"
    timeout /t 5 /nobreak >nul
)

REM Testes do simulador
echo.
echo === Testando Simulador ===
echo Iniciando simulador residencial pequeno...
for /f "tokens=*" %%a in ('curl -s -X POST http://localhost:3000/api/simulator/start -H "Content-Type: application/json" -d "{\"profileType\": \"RESIDENTIAL_SMALL\"}" ^| findstr /C:"simulatorId"') do set RESIDENTIAL_RESPONSE=%%a
for /f "tokens=2 delims=:," %%a in ("%RESIDENTIAL_RESPONSE%") do set RESIDENTIAL_ID=%%a
set RESIDENTIAL_ID=%RESIDENTIAL_ID:"=%
echo Simulador iniciado com ID: %RESIDENTIAL_ID%

echo Iniciando simulador comercial...
for /f "tokens=*" %%a in ('curl -s -X POST http://localhost:3000/api/simulator/start -H "Content-Type: application/json" -d "{\"profileType\": \"COMMERCIAL_SMALL\"}" ^| findstr /C:"simulatorId"') do set COMMERCIAL_RESPONSE=%%a
for /f "tokens=2 delims=:," %%a in ("%COMMERCIAL_RESPONSE%") do set COMMERCIAL_ID=%%a
set COMMERCIAL_ID=%COMMERCIAL_ID:"=%
echo Simulador iniciado com ID: %COMMERCIAL_ID%

echo Listando simuladores ativos...
curl -s http://localhost:3000/api/simulator/list

REM Aguarda alguns segundos para gerar leituras
echo Aguardando geração de leituras...
timeout /t 10 /nobreak >nul

REM Testes do ledger
echo.
echo === Testando Ledger ===
echo Verificando registros no ledger...
curl -s http://localhost:3000/api/ledger/entries

echo Verificando integridade do ledger...
curl -s http://localhost:3000/api/ledger/verify

echo Obtendo estatísticas do ledger...
curl -s http://localhost:3000/api/ledger/stats

REM Testes do conversor
echo.
echo === Testando Conversor ===
echo Obtendo estatísticas de conversão...
curl -s http://localhost:3000/api/converter/stats

REM Testes das APIs externas
echo.
echo === Testando APIs Externas ===
echo Consultando intensidade de carbono para São Paulo...
curl -s "http://localhost:3000/api/external/electricity-map/carbon-intensity?lat=-23.5505&lng=-46.6333"

echo Consultando região WattTime para São Paulo...
curl -s "http://localhost:3000/api/external/watttime/region?lat=-23.5505&lng=-46.6333"

REM Parando os simuladores
echo.
echo === Finalizando Testes ===
echo Parando simuladores...
curl -s -X POST http://localhost:3000/api/simulator/%RESIDENTIAL_ID%/stop
curl -s -X POST http://localhost:3000/api/simulator/%COMMERCIAL_ID%/stop

echo.
echo Testes concluídos com sucesso!
