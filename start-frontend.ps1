# start-frontend.ps1 - Script PowerShell para iniciar el frontend
# Ejecutar: .\start-frontend.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Supply Chain Tracker - Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el directorio web
if (-not (Test-Path "web")) {
    Write-Host "[ERROR] Directorio 'web' no encontrado" -ForegroundColor Red
    Write-Host "Por favor ejecuta este script desde el directorio raíz del proyecto" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Set-Location web

# Verificar que existe package.json
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json no encontrado" -ForegroundColor Red
    Write-Host "El proyecto no está correctamente configurado" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Falló la instalación de dependencias" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# Verificar que existe .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "[WARNING] Archivo .env.local no encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creando .env.local con valores por defecto..." -ForegroundColor Cyan
    Write-Host ""

    @"
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NEXT_PUBLIC_RPC_URL=http://localhost:8545
"@ | Out-File -FilePath ".env.local" -Encoding utf8

    Write-Host "[INFO] Archivo .env.local creado" -ForegroundColor Green
    Write-Host ""
    Write-Host "[IMPORTANT] Asegúrate de actualizar NEXT_PUBLIC_CONTRACT_ADDRESS" -ForegroundColor Yellow
    Write-Host "            con la dirección real del contrato desplegado" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "[INFO] Iniciando servidor de desarrollo..." -ForegroundColor Cyan
Write-Host ""
Write-Host " Frontend URL: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host " Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar servidor de desarrollo
npm run dev
