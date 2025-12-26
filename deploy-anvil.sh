#!/bin/bash
# deploy-anvil.sh - Script para desplegar el contrato en Anvil (Git Bash)
# Uso: ./deploy-anvil.sh

# Comentamos set -e para que no pare en warnings
# set -e

echo "🚀 Supply Chain Tracker - Deployment Script (Anvil)"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -d "sc" ]; then
    echo -e "${RED}❌ Error: Directorio 'sc' no encontrado${NC}"
    echo "Por favor ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar si Anvil está corriendo
echo -e "${BLUE}🔍 Verificando si Anvil está corriendo...${NC}"
if ! curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    http://localhost:8545 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Anvil no está corriendo${NC}"
    echo -e "${BLUE}📝 Para iniciar Anvil, ejecuta en otra terminal Git Bash:${NC}"
    echo "   anvil"
    echo ""
    echo "Presiona ENTER cuando Anvil esté corriendo..."
    read
else
    echo -e "${GREEN}✅ Anvil está corriendo${NC}"
fi

# Navegar al directorio del smart contract
cd sc

echo ""
echo -e "${BLUE}🔨 Compilando smart contract...${NC}"
forge build 2>&1 | tee /tmp/forge-build.log

BUILD_STATUS=${PIPESTATUS[0]}

if [ $BUILD_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Error compilando el contrato${NC}"
    exit 1
fi

# Verificar si hay warnings
if grep -i "warning" /tmp/forge-build.log > /dev/null; then
    echo -e "${YELLOW}⚠️  Hay advertencias en la compilación (pero no son críticas)${NC}"
fi

echo -e "${GREEN}✅ Contrato compilado exitosamente${NC}"

echo ""
echo -e "${BLUE}🧪 Ejecutando tests...${NC}"
forge test

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests fallaron${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tests pasaron correctamente${NC}"

echo ""
echo -e "${BLUE}🚀 Desplegando contrato en Anvil...${NC}"
echo ""

# Private key del primer account de Anvil (Admin)
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
RPC_URL="http://localhost:8545"

# Exportar para que el script lo tome
export PRIVATE_KEY

# Desplegar contrato con verbosidad aumentada
echo -e "${BLUE}Ejecutando: forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key [HIDDEN] --broadcast${NC}"
echo ""

DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast -vvv 2>&1)

DEPLOY_STATUS=$?

# Mostrar TODA la salida para debug
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 SALIDA COMPLETA DEL DEPLOYMENT:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "$DEPLOY_OUTPUT"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $DEPLOY_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Error desplegando el contrato (Exit code: $DEPLOY_STATUS)${NC}"
    echo ""
    echo -e "${YELLOW}🔍 Buscando detalles del error:${NC}"
    echo "$DEPLOY_OUTPUT" | grep -i "error\|failed\|revert" || echo "No se encontraron mensajes de error específicos"
    exit 1
fi

# Buscar la dirección del contrato en la salida del console.log
echo -e "${BLUE}🔍 Buscando dirección del contrato...${NC}"

# Método 1: Buscar "SupplyChain deployed at:"
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -i "SupplyChain deployed at:" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    # Método 2: Buscar en el broadcast
    echo -e "${YELLOW}Método 1 falló, intentando buscar en broadcast...${NC}"
    CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -A5 "contractAddress" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
    # Método 3: Buscar cualquier dirección de contrato
    echo -e "${YELLOW}Método 2 falló, buscando cualquier dirección 0x...${NC}"
    CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oE '0x[a-fA-F0-9]{40}' | tail -1)
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
    # Método 4: Buscar en el archivo de broadcast
    echo -e "${YELLOW}Buscando en archivo broadcast...${NC}"
    BROADCAST_FILE=$(find broadcast -name "*.json" -type f | sort -r | head -1)
    if [ -f "$BROADCAST_FILE" ]; then
        CONTRACT_ADDRESS=$(cat "$BROADCAST_FILE" | grep -oE '0x[a-fA-F0-9]{40}' | tail -1)
        echo -e "${GREEN}✅ Dirección encontrada en $BROADCAST_FILE${NC}"
    fi
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  No se pudo extraer la dirección del contrato automáticamente${NC}"
    echo -e "${YELLOW}Por favor, busca 'SupplyChain deployed at:' en la salida de arriba${NC}"
    echo -e "${YELLOW}O revisa el archivo broadcast más reciente${NC}"
    echo ""
    echo -e "${BLUE}Ingresa manualmente la dirección del contrato (0x...):${NC}"
    read CONTRACT_ADDRESS
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${RED}❌ No se proporcionó dirección del contrato${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dirección encontrada: $CONTRACT_ADDRESS${NC}"
fi

echo ""
echo -e "${GREEN}✅ Contrato desplegado exitosamente${NC}"
echo ""
echo -e "${YELLOW}📋 Información del Deployment:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Contract Address: ${GREEN}$CONTRACT_ADDRESS${NC}"
echo -e "Admin Address:    ${GREEN}0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266${NC}"
echo -e "Network:          ${GREEN}Anvil Local (Chain ID: 31337)${NC}"
echo -e "RPC URL:          ${GREEN}$RPC_URL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Guardar la dirección en un archivo temporal por si acaso
echo "$CONTRACT_ADDRESS" > .last-deployed-address
echo -e "${BLUE}💾 Dirección guardada en .last-deployed-address${NC}"

# Generar archivo de configuración para el frontend
echo ""
echo -e "${BLUE}📝 Generando configuración para el frontend...${NC}"

cd ..

# Crear .env.local para el frontend
cat > web/.env.local << EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NEXT_PUBLIC_RPC_URL=http://localhost:8545
EOF

echo -e "${GREEN}✅ Archivo web/.env.local actualizado${NC}"

# Exportar ABI actualizado
echo ""
echo -e "${BLUE}📦 Exportando ABI del contrato...${NC}"
cd sc
forge inspect SupplyChain abi --json > ../web/contracts/abi.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ABI exportado a web/contracts/abi.json${NC}"
else
    echo -e "${YELLOW}⚠️  Advertencia: No se pudo exportar el ABI${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment completado exitosamente!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo ""
echo "1. El contrato está desplegado en Anvil"
echo "2. El archivo .env.local ha sido actualizado con la nueva dirección"
echo "3. Para iniciar el frontend, ejecuta:"
echo ""
echo -e "   ${YELLOW}cd web${NC}"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "4. Abre tu navegador en: http://localhost:3000"
echo ""
echo -e "${BLUE}🔑 Cuentas de prueba de Anvil:${NC}"
echo ""
echo "Admin (ya configurado):"
echo "  Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "Account #1 (para Producer):"
echo "  Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
echo "  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
echo ""
echo "Account #2 (para Factory):"
echo "  Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
echo "  Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
echo ""
echo "Account #3 (para Retailer):"
echo "  Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906"
echo "  Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
echo ""
echo "Account #4 (para Consumer):"
echo "  Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
echo "  Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
echo ""
echo -e "${YELLOW}💡 Importa estas cuentas en MetaMask para probar la aplicación${NC}"
echo ""
