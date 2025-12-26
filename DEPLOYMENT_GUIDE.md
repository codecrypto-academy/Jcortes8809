# 🚀 Supply Chain Tracker - Guía de Deployment Completa

Esta guía te llevará paso a paso para desplegar y ejecutar la aplicación completa.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

### Obligatorios:
- ✅ **Node.js** >= 18.x ([Descargar](https://nodejs.org/))
- ✅ **Git** ([Descargar](https://git-scm.com/))
- ✅ **Foundry** (Forge, Anvil, Cast) ([Instalar](https://book.getfoundry.sh/getting-started/installation))
- ✅ **MetaMask** extensión de navegador ([Instalar](https://metamask.io/))

### Verificar instalación:
```bash
# En Git Bash
node --version    # Debe mostrar v18.x o superior
git --version     # Debe mostrar versión de Git
forge --version   # Debe mostrar versión de Foundry
anvil --version   # Debe mostrar versión de Anvil
```

---

## 🎯 Deployment Rápido (3 Pasos)

### **Paso 1: Iniciar Anvil (Git Bash)**

Abre **Git Bash** y ejecuta:

```bash
# Opción 1: Usar el script
./start-anvil.sh

# Opción 2: Comando directo
anvil
```

**✨ Deja esta terminal abierta** - Anvil debe estar corriendo mientras usas la aplicación.

**Verificación:** Deberías ver:
```
Listening on 127.0.0.1:8545
```

---

### **Paso 2: Desplegar Smart Contract (Git Bash)**

En una **nueva terminal Git Bash**, ejecuta:

```bash
./deploy-anvil.sh
```

Este script automáticamente:
- ✅ Compila el smart contract
- ✅ Ejecuta los tests (35 tests)
- ✅ Despliega el contrato en Anvil
- ✅ Actualiza el archivo `.env.local` del frontend
- ✅ Exporta el ABI actualizado

**Al finalizar**, verás la **Contract Address** - ¡guárdala!

---

### **Paso 3: Iniciar Frontend**

Puedes usar **CMD**, **PowerShell** o **Git Bash**:

#### Opción A: CMD (Windows)
```cmd
start-frontend.bat
```

#### Opción B: PowerShell
```powershell
.\start-frontend.ps1
```

#### Opción C: Git Bash
```bash
cd web
npm run dev
```

**✨ Abre tu navegador en:** http://localhost:3000

---

## 🔧 Deployment Manual (Paso a Paso)

Si prefieres ejecutar los comandos manualmente:

### 1️⃣ Iniciar Anvil

```bash
# Git Bash
anvil
```

### 2️⃣ Compilar y Testear Contrato

```bash
# Git Bash - Nueva terminal
cd sc
forge build
forge test
```

### 3️⃣ Desplegar Contrato

```bash
# Git Bash
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### 4️⃣ Extraer ABI

```bash
# Git Bash
forge inspect SupplyChain abi --json > ../web/contracts/abi.json
```

### 5️⃣ Actualizar .env.local

```bash
# Edita web/.env.local y actualiza:
NEXT_PUBLIC_CONTRACT_ADDRESS=<TU_CONTRACT_ADDRESS_AQUI>
```

### 6️⃣ Instalar Dependencias del Frontend

```bash
# CMD, PowerShell o Git Bash
cd web
npm install
```

### 7️⃣ Iniciar Frontend

```bash
# CMD, PowerShell o Git Bash
npm run dev
```

---

## 🔑 Configurar MetaMask

### 1. Agregar Red Anvil Local

En MetaMask:
1. Click en el selector de red
2. "Add Network" → "Add a network manually"
3. Ingresa:
   - **Network Name:** Anvil Local
   - **RPC URL:** http://localhost:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

### 2. Importar Cuentas de Prueba

Usa estas cuentas de Anvil para probar la aplicación:

#### **Admin** (Pre-configurado en el contrato)
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### **Account #1** (Sugerido: Producer)
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

#### **Account #2** (Sugerido: Factory)
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

#### **Account #3** (Sugerido: Retailer)
```
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

#### **Account #4** (Sugerido: Consumer)
```
Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

**Para importar:**
1. Click en el icono de cuenta en MetaMask
2. "Import Account"
3. Pega la Private Key
4. Click "Import"

---

## 🎮 Testing del Flujo Completo

Sigue este flujo para probar todas las funcionalidades:

### 1. **Setup Inicial (Admin)**

1. Conecta MetaMask con la cuenta **Admin**
2. Abre http://localhost:3000
3. Verifica que eres reconocido como Admin automáticamente

### 2. **Registrar Producer**

1. Cambia a **Account #1** en MetaMask
2. Recarga la página
3. Selecciona rol: **Producer**
4. Click "Register"
5. Confirma transacción en MetaMask

### 3. **Aprobar Producer (Admin)**

1. Cambia a cuenta **Admin** en MetaMask
2. Ve a **Admin → Users**
3. Pega la address del Producer
4. Click "Approve"
5. Confirma transacción

### 4. **Crear Materia Prima (Producer)**

1. Cambia a **Account #1** (Producer)
2. Ve a **Dashboard → Create Raw Material**
3. Rellena el formulario:
   - Name: "Organic Wheat"
   - Total Supply: 1000
   - Description: "Premium organic wheat from farm A"
   - Origin: "Farm A, Region X"
   - Certifications: "Organic, Fair Trade"
4. Click "Create Token"
5. Confirma transacción

### 5. **Registrar y Aprobar Factory**

Repite pasos 2-3 con **Account #2** (Factory)

### 6. **Transferir a Factory (Producer)**

1. Como Producer, ve a **Tokens**
2. Click en "Organic Wheat"
3. Click "Transfer"
4. Pega address de Factory
5. Amount: 500
6. Click "Transfer"

### 7. **Aceptar Transferencia (Factory)**

1. Cambia a **Account #2** (Factory)
2. Ve a **Transfers → Pending**
3. Click "Accept"
4. Confirma transacción

### 8. **Crear Producto (Factory)**

1. Como Factory, ve a **Create Product**
2. Select parent: "Organic Wheat"
3. Rellena:
   - Name: "Premium Flour"
   - Total Supply: 400
   - Description: "Milled from organic wheat"
4. Click "Create Token"

### 9. **Continuar el Flujo**

Repite el proceso:
- Factory → Retailer (Account #3)
- Retailer → Consumer (Account #4)

### 10. **Ver Trazabilidad (Consumer)**

1. Como Consumer, ve a **Tokens**
2. Click en el producto recibido
3. Scroll a "Supply Chain Traceability"
4. ✨ **Ver el árbol completo:** Consumer → Retailer → Factory → Producer

---

## 🛠️ Scripts Disponibles

| Script | Descripción | Terminal |
|--------|-------------|----------|
| `start-anvil.sh` | Inicia Anvil con configuración | Git Bash |
| `deploy-anvil.sh` | Despliega contrato completo | Git Bash |
| `start-frontend.bat` | Inicia frontend (Windows CMD) | CMD |
| `start-frontend.ps1` | Inicia frontend (PowerShell) | PowerShell |

---

## 🐛 Troubleshooting

### ❌ "Anvil no responde"
**Solución:**
```bash
# Verifica que Anvil esté corriendo
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

### ❌ "Contract not deployed"
**Solución:** Ejecuta nuevamente `./deploy-anvil.sh`

### ❌ "MetaMask wrong network"
**Solución:** Cambia a "Anvil Local" (Chain ID: 31337)

### ❌ "Transaction rejected"
**Solución:** Verifica que tienes ETH en tu cuenta (Anvil da 10,000 ETH por defecto)

### ❌ "User not approved"
**Solución:** Usa la cuenta Admin para aprobar usuarios en Admin → Users

### ❌ "npm install fails"
**Solución:**
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Estructura de Archivos de Deployment

```
.
├── start-anvil.sh          # Inicia Anvil (Git Bash)
├── deploy-anvil.sh         # Deploy completo (Git Bash)
├── start-frontend.bat      # Inicia frontend (CMD)
├── start-frontend.ps1      # Inicia frontend (PowerShell)
├── sc/                     # Smart Contract
│   ├── src/
│   ├── script/Deploy.s.sol
│   └── test/
└── web/                    # Frontend
    ├── .env.local          # Config (auto-generado)
    ├── contracts/abi.json  # ABI (auto-generado)
    └── app/
```

---

## 🔄 Reiniciar Desde Cero

Si necesitas empezar de nuevo:

### 1. Detener Servicios
```bash
# Ctrl+C en las terminales de Anvil y Frontend
```

### 2. Limpiar Datos
```bash
# Git Bash
cd sc
forge clean

cd ../web
rm -rf .next
rm -rf node_modules  # Opcional
```

### 3. Re-Deployment
```bash
# Ejecuta nuevamente los 3 pasos del Deployment Rápido
./start-anvil.sh        # Terminal 1
./deploy-anvil.sh       # Terminal 2
./start-frontend.bat    # Terminal 3
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** en las terminales
2. **Verifica prerrequisitos** están instalados
3. **Consulta el README** del smart contract (sc/README.md)
4. **Consulta el README** del frontend (web/README.md)

---

## ✅ Checklist Pre-Deployment

Antes de desplegar, verifica:

- [ ] Node.js >= 18.x instalado
- [ ] Foundry (forge, anvil) instalado
- [ ] MetaMask instalado en navegador
- [ ] Git Bash disponible (Windows)
- [ ] Puerto 8545 disponible (Anvil)
- [ ] Puerto 3000 disponible (Frontend)

---

## 🎉 ¡Listo!

Ahora tienes una DApp completa de Supply Chain Tracker corriendo localmente.

**URLs Útiles:**
- 📱 Frontend: http://localhost:3000
- 🔗 Anvil RPC: http://localhost:8545
- 📊 Network: Anvil Local (Chain ID: 31337)

---

**Desarrollado con ❤️ usando Next.js, TypeScript y Ethereum**
