@echo off
echo ============================================
echo Configuracion del MCP de Foundry
echo ============================================
echo.

set CONFIG_PATH=%APPDATA%\Claude\claude_desktop_config.json
set MCP_PATH=%~dp0dist\index.js

echo Tu ruta del MCP es:
echo %MCP_PATH%
echo.
echo Tu archivo de configuracion esta en:
echo %CONFIG_PATH%
echo.

if not exist "%APPDATA%\Claude" (
    echo ADVERTENCIA: La carpeta de Claude no existe.
    echo Asegurate de tener Claude Desktop instalado.
    pause
    exit /b
)

echo Contenido a agregar a tu claude_desktop_config.json:
echo.
echo {
echo   "mcpServers": {
echo     "foundry": {
echo       "command": "node",
echo       "args": [
echo         "%MCP_PATH:\=\\%"
echo       ]
echo     }
echo   }
echo }
echo.
echo ============================================
echo INSTRUCCIONES:
echo ============================================
echo.
echo 1. Abre el archivo: %CONFIG_PATH%
echo    (Usa Notepad o cualquier editor de texto)
echo.
echo 2. Si el archivo NO existe, crealo con el contenido de arriba
echo.
echo 3. Si el archivo YA existe y tiene otros MCPs, agrega solo:
echo      "foundry": {
echo        "command": "node",
echo        "args": ["%MCP_PATH:\=\\%"]
echo      }
echo    dentro de "mcpServers"
echo.
echo 4. Guarda el archivo
echo.
echo 5. Cierra completamente Claude Desktop
echo.
echo 6. Vuelve a abrir Claude Desktop
echo.
echo 7. Listo! El MCP estara disponible
echo.
echo ============================================
pause
