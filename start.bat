@echo off
echo Iniciando VOLTANEX Demo 1...

REM Verifica se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js não encontrado. Por favor, instale o Node.js para executar a Demo 1.
    exit /b 1
)

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependências...
    npm install
)

REM Inicia a aplicação
echo Iniciando servidor VOLTANEX na porta 3000...
node src/app.js
