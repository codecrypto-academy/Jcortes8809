@echo off
REM start-frontend.bat - Script para iniciar el frontend en Windows
REM Ejecutar en CMD o PowerShell

echo.
echo ========================================
echo  Supply Chain Tracker - Frontend
echo ========================================
echo.

REM Verificar que existe el directorio web
if not exist "web" (
    echo [ERROR] Directorio 'web' no encontrado
    echo Por favor ejecuta este script desde el directorio raiz del proyecto
    pause
    exit /b 1
)

cd web

REM Verificar que existe package.json
if not exist "package.json" (
    echo [ERROR] package.json no encontrado
    echo El proyecto no esta correctamente configurado
    pause
    exit /b 1
)

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
)

REM Verificar que existe .env.local
if not exist ".env.local" (
    echo [WARNING] Archivo .env.local no encontrado
    echo.
    echo Creando .env.local con valores por defecto...
    echo.
    (
        echo NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
        echo NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        echo NEXT_PUBLIC_RPC_URL=http://localhost:8545
    ) > .env.local
    echo [INFO] Archivo .env.local creado
    echo.
    echo [IMPORTANT] Asegurate de actualizar NEXT_PUBLIC_CONTRACT_ADDRESS
    echo             con la direccion real del contrato desplegado
    echo.
)

echo.
echo [INFO] Iniciando servidor de desarrollo...
echo.
echo  Frontend URL: http://localhost:3000
echo.
echo  Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

REM Iniciar servidor de desarrollo
call npm run dev
