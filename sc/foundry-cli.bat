@echo off
REM Script helper para ejecutar comandos de Foundry fácilmente
REM Uso: foundry-cli.bat [comando]

setlocal enabledelayedexpansion

if "%1"=="" (
    echo Uso: foundry-cli.bat [comando]
    echo.
    echo Comandos disponibles:
    echo   build         - Compilar contratos
    echo   test          - Ejecutar tests
    echo   test-gas      - Tests con reporte de gas
    echo   deploy        - Desplegar a Anvil local
    echo   clean         - Limpiar artifacts
    echo   anvil         - Iniciar Anvil
    echo   info          - Info del ultimo deployment
    exit /b 1
)

set COMMAND=%1

if "%COMMAND%"=="build" (
    echo Compilando contratos...
    forge build
    exit /b %ERRORLEVEL%
)

if "%COMMAND%"=="test" (
    echo Ejecutando tests...
    forge test -vv
    exit /b %ERRORLEVEL%
)

if "%COMMAND%"=="test-gas" (
    echo Ejecutando tests con reporte de gas...
    forge test -vv --gas-report
    exit /b %ERRORLEVEL%
)

if "%COMMAND%"=="deploy" (
    echo Desplegando a Anvil local...
    forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
    exit /b %ERRORLEVEL%
)

if "%COMMAND%"=="clean" (
    echo Limpiando artifacts...
    forge clean
    exit /b %ERRORLEVEL%
)

if "%COMMAND%"=="anvil" (
    echo Iniciando Anvil...
    echo Presiona Ctrl+C para detener
    anvil
    exit /b %ERRORLEVEL%
)

if "%COMMAND%"=="info" (
    echo Info del deployment:
    if exist "broadcast\Deploy.s.sol\31337\run-latest.json" (
        type broadcast\Deploy.s.sol\31337\run-latest.json
    ) else (
        echo No se encontro deployment info. Despliega primero con: foundry-cli.bat deploy
    )
    exit /b 0
)

echo Comando desconocido: %COMMAND%
echo Usa: foundry-cli.bat para ver comandos disponibles
exit /b 1
