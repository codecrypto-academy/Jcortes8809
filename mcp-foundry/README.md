# 🔨 Foundry MCP Server

MCP (Model Context Protocol) server que envuelve las herramientas CLI de Foundry: **anvil**, **cast**, y **forge**.

Este servidor permite interactuar con Foundry de manera programática a través del protocolo MCP, facilitando la automatización de tareas de desarrollo blockchain.

## 🎯 Características

### 🔧 Anvil Tools
- **anvil_start** - Iniciar un nodo Ethereum local
- **anvil_get_accounts** - Obtener lista de cuentas disponibles

### 🎨 Cast Tools
- **cast_call** - Realizar llamadas a contratos (solo lectura)
- **cast_send** - Enviar transacciones firmadas
- **cast_balance** - Obtener balance de una cuenta
- **cast_block_number** - Obtener número de bloque actual
- **cast_chain_id** - Obtener Chain ID

### ⚒️ Forge Tools
- **forge_build** - Compilar contratos inteligentes
- **forge_test** - Ejecutar tests
- **forge_create** - Desplegar contratos
- **forge_script** - Ejecutar scripts de deployment
- **forge_verify_contract** - Verificar contratos en Etherscan
- **forge_inspect** - Inspeccionar metadata de contratos
- **forge_clean** - Limpiar artifacts de compilación

### 📁 Project Tools
- **get_contract_abi** - Obtener ABI de un contrato compilado
- **get_deployment_info** - Obtener información de deployments

## 📦 Instalación

### Prerequisitos

1. **Foundry** debe estar instalado:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Node.js** (v18 o superior)

### Instalación del MCP

```bash
cd mcp-foundry
npm install
npm run build
```

## 🚀 Uso

### Ejecutar el servidor

```bash
npm start
```

### Configuración en Claude Desktop

Agrega esto a tu archivo de configuración de Claude Desktop:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "foundry": {
      "command": "node",
      "args": [
        "C:\\Users\\DEVELOP\\Documents\\Nerv Corp\\Codecrypto\\proyectos_ETH\\PFM\\98_pfm_traza_2025\\mcp-foundry\\dist\\index.js"
      ]
    }
  }
}
```

## 📖 Ejemplos de Uso

### 1. Iniciar Anvil

```typescript
// Solicitud a través del MCP
{
  "tool": "anvil_start",
  "arguments": {
    "port": 8545,
    "chain_id": 31337,
    "accounts": 10
  }
}
```

**Respuesta:**
```json
{
  "message": "Anvil start command (run in background)",
  "command": "anvil --port 8545 --chain-id 31337 --accounts 10",
  "note": "Run this command in a separate terminal: anvil --port 8545 --chain-id 31337 --accounts 10"
}
```

### 2. Compilar Contratos

```typescript
{
  "tool": "forge_build",
  "arguments": {
    "project_path": "../sc",
    "optimizer_runs": 200
  }
}
```

### 3. Ejecutar Tests

```typescript
{
  "tool": "forge_test",
  "arguments": {
    "project_path": "../sc",
    "verbosity": "-vv",
    "gas_report": true
  }
}
```

### 4. Desplegar un Contrato

```typescript
{
  "tool": "forge_create",
  "arguments": {
    "contract_path": "src/SupplyChain.sol:SupplyChain",
    "constructor_args": [],
    "private_key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "rpc_url": "http://localhost:8545"
  }
}
```

### 5. Ejecutar Script de Deployment

```typescript
{
  "tool": "forge_script",
  "arguments": {
    "script_path": "script/Deploy.s.sol",
    "signature": "run()",
    "rpc_url": "http://localhost:8545",
    "private_key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "broadcast": true
  }
}
```

### 6. Llamar a una Función de Contrato

```typescript
{
  "tool": "cast_call",
  "arguments": {
    "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "function_signature": "getToken(uint256)",
    "args": ["1"],
    "rpc_url": "http://localhost:8545"
  }
}
```

### 7. Enviar una Transacción

```typescript
{
  "tool": "cast_send",
  "arguments": {
    "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "function_signature": "requestUserRole(string)",
    "args": ["Producer"],
    "private_key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "rpc_url": "http://localhost:8545"
  }
}
```

### 8. Obtener Balance

```typescript
{
  "tool": "cast_balance",
  "arguments": {
    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "rpc_url": "http://localhost:8545",
    "ether": true
  }
}
```

### 9. Obtener ABI de Contrato

```typescript
{
  "tool": "get_contract_abi",
  "arguments": {
    "contract_name": "SupplyChain",
    "project_path": "../sc"
  }
}
```

### 10. Obtener Información de Deployment

```typescript
{
  "tool": "get_deployment_info",
  "arguments": {
    "script_name": "Deploy.s.sol",
    "chain_id": "31337",
    "project_path": "../sc"
  }
}
```

## 🔑 Herramientas Disponibles

### Anvil Tools

#### `anvil_start`
Inicia un nodo Ethereum local usando Anvil.

**Parámetros:**
- `port` (number, opcional): Puerto (default: 8545)
- `chain_id` (number, opcional): Chain ID (default: 31337)
- `fork_url` (string, opcional): URL de RPC para hacer fork
- `accounts` (number, opcional): Número de cuentas de desarrollo (default: 10)

#### `anvil_get_accounts`
Obtiene la lista de cuentas disponibles en Anvil.

**Parámetros:**
- `rpc_url` (string, opcional): URL del RPC (default: http://localhost:8545)

---

### Cast Tools

#### `cast_call`
Realiza una llamada de solo lectura a un contrato inteligente.

**Parámetros:**
- `contract_address` (string, requerido): Dirección del contrato
- `function_signature` (string, requerido): Firma de la función
- `args` (array, opcional): Argumentos de la función
- `rpc_url` (string, opcional): URL del RPC

#### `cast_send`
Firma y envía una transacción al blockchain.

**Parámetros:**
- `contract_address` (string, requerido): Dirección del contrato
- `function_signature` (string, requerido): Firma de la función
- `args` (array, opcional): Argumentos de la función
- `private_key` (string, requerido): Clave privada para firmar
- `rpc_url` (string, opcional): URL del RPC

#### `cast_balance`
Obtiene el balance de una cuenta.

**Parámetros:**
- `address` (string, requerido): Dirección a consultar
- `rpc_url` (string, opcional): URL del RPC
- `ether` (boolean, opcional): Mostrar en ether en vez de wei

#### `cast_block_number`
Obtiene el número de bloque actual.

**Parámetros:**
- `rpc_url` (string, opcional): URL del RPC

#### `cast_chain_id`
Obtiene el Chain ID.

**Parámetros:**
- `rpc_url` (string, opcional): URL del RPC

---

### Forge Tools

#### `forge_build`
Compila los contratos inteligentes del proyecto.

**Parámetros:**
- `project_path` (string, opcional): Path al proyecto Foundry
- `optimizer_runs` (number, opcional): Número de runs del optimizador

#### `forge_test`
Ejecuta los tests de los contratos.

**Parámetros:**
- `project_path` (string, opcional): Path al proyecto Foundry
- `test_pattern` (string, opcional): Patrón para filtrar tests
- `verbosity` (string, opcional): Nivel de verbosidad (-v, -vv, -vvv, -vvvv)
- `gas_report` (boolean, opcional): Mostrar reporte de gas

#### `forge_create`
Despliega un contrato inteligente.

**Parámetros:**
- `contract_path` (string, requerido): Path al contrato
- `constructor_args` (array, opcional): Argumentos del constructor
- `private_key` (string, requerido): Clave privada para desplegar
- `rpc_url` (string, opcional): URL del RPC
- `verify` (boolean, opcional): Verificar en Etherscan

#### `forge_script`
Ejecuta un script Forge para deployment o interacción.

**Parámetros:**
- `script_path` (string, requerido): Path al script
- `signature` (string, opcional): Firma de función a llamar (default: run())
- `rpc_url` (string, opcional): URL del RPC
- `private_key` (string, opcional): Clave privada para broadcast
- `broadcast` (boolean, opcional): Broadcast de transacciones

#### `forge_verify_contract`
Verifica un contrato desplegado en Etherscan.

**Parámetros:**
- `contract_address` (string, requerido): Dirección del contrato
- `contract_path` (string, requerido): Path al código fuente
- `etherscan_api_key` (string, requerido): API key de Etherscan
- `chain` (string, opcional): Nombre de la chain
- `constructor_args` (array, opcional): Argumentos del constructor

#### `forge_inspect`
Inspecciona metadata de contratos compilados.

**Parámetros:**
- `contract_path` (string, requerido): Path al contrato
- `field` (string, requerido): Campo a inspeccionar (abi, bytecode, etc.)
- `project_path` (string, opcional): Path al proyecto

#### `forge_clean`
Limpia artifacts de compilación y directorios de caché.

**Parámetros:**
- `project_path` (string, opcional): Path al proyecto

---

### Project Tools

#### `get_contract_abi`
Obtiene el ABI de un contrato compilado desde los artifacts del proyecto.

**Parámetros:**
- `contract_name` (string, requerido): Nombre del contrato
- `project_path` (string, opcional): Path al proyecto

#### `get_deployment_info`
Obtiene información de deployment desde archivos broadcast.

**Parámetros:**
- `script_name` (string, requerido): Nombre del script de deployment
- `chain_id` (string, opcional): Chain ID (default: 31337)
- `project_path` (string, opcional): Path al proyecto

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- Nunca uses claves privadas de cuentas reales en los ejemplos
- Las claves privadas mostradas son de cuentas de desarrollo de Anvil
- Para producción, usa variables de entorno o gestores de secretos

## 🛠️ Desarrollo

### Estructura del Proyecto

```
mcp-foundry/
├── src/
│   └── index.ts          # Servidor MCP principal
├── dist/                 # Código compilado
├── package.json
├── tsconfig.json
└── README.md
```

### Compilar

```bash
npm run build
```

### Modo Desarrollo (watch)

```bash
npm run dev
```

## 🤝 Integración con el Proyecto Supply Chain

Este MCP está diseñado para trabajar con el proyecto Supply Chain Tracker:

```bash
# Estructura recomendada
98_pfm_traza_2025/
├── sc/                   # Proyecto Foundry
├── web/                  # Frontend Next.js
└── mcp-foundry/         # MCP Server
```

### Flujo de Trabajo Típico

1. **Iniciar Anvil:**
```bash
# A través del MCP o directamente
anvil
```

2. **Compilar contratos:**
```typescript
// Usar MCP tool: forge_build
{
  "tool": "forge_build",
  "arguments": { "project_path": "../sc" }
}
```

3. **Ejecutar tests:**
```typescript
// Usar MCP tool: forge_test
{
  "tool": "forge_test",
  "arguments": {
    "project_path": "../sc",
    "verbosity": "-vv"
  }
}
```

4. **Desplegar con script:**
```typescript
// Usar MCP tool: forge_script
{
  "tool": "forge_script",
  "arguments": {
    "script_path": "script/Deploy.s.sol",
    "rpc_url": "http://localhost:8545",
    "private_key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "broadcast": true
  }
}
```

5. **Obtener información de deployment:**
```typescript
// Usar MCP tool: get_deployment_info
{
  "tool": "get_deployment_info",
  "arguments": {
    "script_name": "Deploy.s.sol",
    "chain_id": "31337",
    "project_path": "../sc"
  }
}
```

## 📚 Referencias

- [Foundry Book](https://book.getfoundry.sh/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Anvil Documentation](https://book.getfoundry.sh/anvil/)
- [Cast Documentation](https://book.getfoundry.sh/cast/)
- [Forge Documentation](https://book.getfoundry.sh/forge/)

## 📝 Licencia

MIT

## 👥 Autor

Nerv Corp - 2025

---

**Versión:** 1.0.0
**Última actualización:** 24 de diciembre de 2025
