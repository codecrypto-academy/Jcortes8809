@echo off
echo ============================================
echo Diagnostico del MCP Foundry
echo ============================================
echo.

echo 1. Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)
echo OK: Node.js instalado
echo.

echo 2. Verificando Foundry...
forge --version
if errorlevel 1 (
    echo ADVERTENCIA: Foundry no esta instalado
    echo El MCP funcionara pero no podras ejecutar comandos de Foundry
) else (
    echo OK: Foundry instalado
)
echo.

echo 3. Verificando archivo compilado...
if exist "dist\index.js" (
    echo OK: dist\index.js existe
) else (
    echo ERROR: dist\index.js NO existe
    echo Ejecuta: npm run build
    pause
    exit /b 1
)
echo.

echo 4. Probando ejecucion del MCP (presiona Ctrl+C para salir)...
echo.
node dist\index.js
