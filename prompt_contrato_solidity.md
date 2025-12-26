# Prompt para IA: Contrato Inteligente SupplyChain - Supply Chain Tracker

## 🎯 Objetivo del Proyecto

Desarrollar un contrato inteligente en Solidity optimizado para gas que gestione una cadena de suministro trazable con tokenización de productos, sistema de roles con aprobación administrativa, y transferencias controladas entre actores específicos.

---

## 📋 Especificaciones del Contrato

### Información General
- **Nombre del Contrato**: `SupplyChain`
- **Versión Solidity**: `^0.8.19` o superior
- **Licencia**: MIT
- **Optimización**: Máxima optimización de gas (considerar uso de Yul en secciones críticas)

---

## 🏗️ Arquitectura del Sistema

### Actores y Roles

El sistema debe gestionar 5 roles diferenciados:

1. **Admin** (Administrador)
   - Rol único asignado al creador del contrato
   - Aprueba/rechaza solicitudes de registro
   - Supervisa el sistema
   - NO puede transferir tokens

2. **Producer** (Productor)
   - Crea tokens de materias primas (parentId = 0)
   - Puede transferir SOLO a Factory
   - Ejemplos: granjas, minas, productores agrícolas

3. **Factory** (Fábrica)
   - Recibe tokens de Producer
   - Crea tokens de productos terminados (con parentId > 0)
   - Puede transferir SOLO a Retailer

4. **Retailer** (Minorista)
   - Recibe tokens de Factory
   - Puede crear productos derivados
   - Puede transferir SOLO a Consumer

5. **Consumer** (Consumidor)
   - Recibe tokens de Retailer
   - Puede consultar trazabilidad completa
   - NO puede transferir tokens (punto final de la cadena)

---

## 📊 Estructuras de Datos

### Enums

```solidity
enum UserStatus {
    Pending,    // Usuario registrado esperando aprobación
    Approved,   // Usuario aprobado para operar
    Rejected,   // Solicitud rechazada por admin
    Canceled    // Usuario cancelado por el sistema
}

enum TransferStatus {
    Pending,    // Transferencia iniciada, esperando aceptación
    Accepted,   // Transferencia aceptada y completada
    Rejected    // Transferencia rechazada por el destinatario
}
```

### Structs

```solidity
struct User {
    uint256 id;              // ID único del usuario
    address userAddress;     // Dirección wallet del usuario
    string role;             // Rol: "Producer", "Factory", "Retailer", "Consumer"
    UserStatus status;       // Estado actual del usuario
}

struct Token {
    uint256 id;              // ID único del token
    address creator;         // Creador del token
    string name;             // Nombre del producto/materia prima
    uint256 totalSupply;     // Cantidad total creada
    string features;         // Metadatos JSON con características
    uint256 parentId;        // ID del token padre (0 si es materia prima)
    uint256 dateCreated;     // Timestamp de creación
    mapping(address => uint256) balance;  // Balance por usuario
}

struct Transfer {
    uint256 id;              // ID único de transferencia
    address from;            // Remitente
    address to;              // Destinatario
    uint256 tokenId;         // Token a transferir
    uint256 dateCreated;     // Timestamp de creación
    uint256 amount;          // Cantidad a transferir
    TransferStatus status;   // Estado de la transferencia
}
```

---

## 🔧 Variables de Estado

```solidity
// Admin del sistema
address public admin;

// Contadores para IDs autoincrementales
uint256 public nextTokenId = 1;
uint256 public nextTransferId = 1;
uint256 public nextUserId = 1;

// Mappings principales
mapping(uint256 => Token) public tokens;
mapping(uint256 => Transfer) public transfers;
mapping(uint256 => User) public users;
mapping(address => uint256) public addressToUserId;

// IMPORTANTE: Como Token tiene un mapping interno (balance),
// necesitarás arrays auxiliares para tracking:
uint256[] private allTokenIds;
mapping(address => uint256[]) private userTokenIds;
mapping(address => uint256[]) private userTransferIds;
```

---

## 📢 Eventos

```solidity
event TokenCreated(
    uint256 indexed tokenId,
    address indexed creator,
    string name,
    uint256 totalSupply
);

event TransferRequested(
    uint256 indexed transferId,
    address indexed from,
    address indexed to,
    uint256 tokenId,
    uint256 amount
);

event TransferAccepted(uint256 indexed transferId);

event TransferRejected(uint256 indexed transferId);

event UserRoleRequested(
    address indexed user,
    string role
);

event UserStatusChanged(
    address indexed user,
    UserStatus status
);
```

---

## 🎯 Funciones a Implementar

### 1. Constructor

```solidity
constructor() {
    // Inicializar admin como msg.sender
    // Registrar admin como usuario con status Approved
}
```

### 2. Modificadores

```solidity
modifier onlyAdmin() {
    // Verificar que msg.sender sea el admin
}

modifier onlyApproved() {
    // Verificar que msg.sender esté registrado y aprobado
}

modifier validRole(string memory role) {
    // Verificar que el rol sea: Producer, Factory, Retailer o Consumer
}
```

### 3. Gestión de Usuarios

```solidity
function requestUserRole(string memory role) public validRole(role) {
    // Registrar nuevo usuario con status Pending
    // Emitir evento UserRoleRequested
    // VALIDACIONES:
    // - Usuario no debe estar ya registrado
    // - Rol debe ser válido
}

function changeStatusUser(address userAddress, UserStatus newStatus) public onlyAdmin {
    // Cambiar estado de un usuario
    // Emitir evento UserStatusChanged
    // VALIDACIONES:
    // - Usuario debe existir
    // - No cambiar estado de admin
}

function getUserInfo(address userAddress) public view returns (User memory) {
    // Retornar información completa del usuario
    // NOTA: Como User no tiene mapping, puede retornarse directamente
}

function isAdmin(address userAddress) public view returns (bool) {
    // Verificar si una dirección es el admin
}
```

### 4. Gestión de Tokens

```solidity
function createToken(
    string memory name,
    uint256 totalSupply,
    string memory features,
    uint256 parentId
) public onlyApproved {
    // Crear nuevo token
    // Asignar totalSupply al creator
    // Emitir evento TokenCreated
    // VALIDACIONES:
    // - totalSupply > 0
    // - Si parentId > 0, verificar que existe y que el creador tenga balance > 0
    // - Producer solo puede crear tokens con parentId = 0
    // - Factory y Retailer deben especificar parentId válido
    // - Consumer no puede crear tokens
    // OPTIMIZACIÓN: Considerar Yul para asignación de balance inicial
}

function getToken(uint256 tokenId) public view returns (
    uint256 id,
    address creator,
    string memory name,
    uint256 totalSupply,
    string memory features,
    uint256 parentId,
    uint256 dateCreated
) {
    // Retornar información del token SIN el mapping de balances
    // NOTA: No se puede retornar struct completo por el mapping interno
}

function getTokenBalance(uint256 tokenId, address userAddress) public view returns (uint256) {
    // Retornar balance de un usuario para un token específico
}

function getUserTokens(address userAddress) public view returns (uint256[] memory) {
    // Retornar array de IDs de tokens donde el usuario tiene balance > 0
    // OPTIMIZACIÓN: Mantener array auxiliar actualizado en createToken y transfer
}
```

### 5. Gestión de Transferencias

```solidity
function transfer(address to, uint256 tokenId, uint256 amount) public onlyApproved {
    // Iniciar transferencia
    // Crear registro de Transfer con status Pending
    // Emitir evento TransferRequested
    // VALIDACIONES:
    // - Verificar balance suficiente del remitente
    // - Validar flujo según roles:
    //   * Producer -> Factory
    //   * Factory -> Retailer
    //   * Retailer -> Consumer
    //   * Consumer NO puede transferir
    // - No transferir a sí mismo
    // - Destinatario debe estar aprobado
    // - amount > 0
}

function acceptTransfer(uint256 transferId) public onlyApproved {
    // Aceptar transferencia pendiente
    // Actualizar balances
    // Cambiar status a Accepted
    // Emitir evento TransferAccepted
    // VALIDACIONES:
    // - Solo el destinatario puede aceptar
    // - Transfer debe existir y estar en status Pending
    // OPTIMIZACIÓN: Considerar Yul para actualización de balances
}

function rejectTransfer(uint256 transferId) public onlyApproved {
    // Rechazar transferencia pendiente
    // Cambiar status a Rejected
    // Emitir evento TransferRejected
    // VALIDACIONES:
    // - Solo el destinatario puede rechazar
    // - Transfer debe existir y estar en status Pending
}

function getTransfer(uint256 transferId) public view returns (Transfer memory) {
    // Retornar información completa de transferencia
}

function getUserTransfers(address userAddress) public view returns (uint256[] memory) {
    // Retornar array de IDs de transferencias donde el usuario es from o to
    // OPTIMIZACIÓN: Mantener array auxiliar actualizado
}
```

---

## ⚡ Optimizaciones de Gas Requeridas

### 1. Uso de Yul (Assembly)

**Secciones críticas para optimizar con Yul:**

```solidity
// Ejemplo de optimización de balance update en acceptTransfer
function acceptTransfer(uint256 transferId) public onlyApproved {
    Transfer storage t = transfers[transferId];
    
    // Validaciones normales...
    
    // Actualización de balances con Yul
    assembly {
        // Cargar storage slots
        let tokenSlot := add(tokens.slot, mul(t.tokenId, 0x20))
        let balanceMapSlot := add(tokenSlot, 6) // offset del mapping balance
        
        // Calcular slots de balances
        mstore(0x00, t.from)
        mstore(0x20, balanceMapSlot)
        let fromBalanceSlot := keccak256(0x00, 0x40)
        
        mstore(0x00, t.to)
        let toBalanceSlot := keccak256(0x00, 0x40)
        
        // Cargar y actualizar balances
        let fromBalance := sload(fromBalanceSlot)
        let toBalance := sload(toBalanceSlot)
        
        sstore(fromBalanceSlot, sub(fromBalance, t.amount))
        sstore(toBalanceSlot, add(toBalance, t.amount))
    }
    
    // Continuar con lógica normal...
}
```

### 2. Optimizaciones Generales

- **Packed Storage**: Agrupar variables pequeñas en un mismo slot
- **Short-circuit**: Validaciones más probables primero
- **Unchecked**: Usar `unchecked` en incrementos de contadores
- **Memory vs Storage**: Usar memory para reads, storage solo para writes
- **String vs bytes32**: Considerar bytes32 para roles en vez de string
- **Custom Errors**: Usar custom errors en vez de require strings

```solidity
// Custom Errors (más económicos que require con strings)
error Unauthorized();
error InvalidRole();
error InsufficientBalance();
error InvalidTransferFlow();
error TransferAlreadyProcessed();
```

### 3. Estrategias de Almacenamiento

```solidity
// Considerar estructuras optimizadas
struct UserCompact {
    address userAddress;    // 20 bytes
    uint32 id;              // 4 bytes  } Packed en
    uint8 roleId;           // 1 byte   } un solo
    UserStatus status;      // 1 byte   } slot (32 bytes)
}

// Enum para roles (más eficiente que string)
enum Role { None, Producer, Factory, Retailer, Consumer }
```

---

## ✅ Validaciones Requeridas

### Validaciones de Registro
- Usuario no puede registrarse dos veces
- Rol debe ser válido
- Admin no puede cambiar su propio status

### Validaciones de Creación de Token
- totalSupply > 0
- Nombres no vacíos
- Producer: parentId debe ser 0
- Factory/Retailer: parentId > 0 y debe existir
- Consumer: no puede crear tokens
- Verificar balance del token padre si aplica

### Validaciones de Transferencia
- Balance suficiente
- amount > 0
- Flujo de roles correcto:
  - Producer → Factory
  - Factory → Retailer
  - Retailer → Consumer
  - Consumer no puede transferir
- No transferir a sí mismo
- Destinatario debe estar aprobado

### Validaciones de Aceptación/Rechazo
- Solo destinatario puede aceptar/rechazar
- Transfer debe existir
- Transfer debe estar en status Pending
- No procesar dos veces la misma transferencia

---

## 🧪 Casos Edge a Considerar

1. **Usuario intenta registrarse múltiples veces**
2. **Admin intenta cambiar su propio estado**
3. **Crear token con parentId inexistente**
4. **Transferir más cantidad de la que se tiene**
5. **Transferir a rol incorrecto en el flujo**
6. **Aceptar/rechazar transferencia dos veces**
7. **Usuario no aprobado intenta operar**
8. **Transferir cantidad 0**
9. **Token con totalSupply = 0**
10. **Transferir a dirección 0x0**

---

## 📝 Buenas Prácticas Requeridas

### Seguridad
- Usar OpenZeppelin si es necesario (Ownable, ReentrancyGuard)
- Checks-Effects-Interactions pattern
- Protección contra reentrancy en transferencias
- Validar todas las entradas de usuario

### Código Limpio
- Comentarios NatSpec en todas las funciones públicas
- Variables con nombres descriptivos
- Funciones modulares y reutilizables
- Separar validaciones en funciones privadas

### Testing
- El contrato debe pasar TODOS los tests del archivo `SupplyChain.t.sol`
- Considerar casos edge en el diseño

### Gas Efficiency
- Minimizar operaciones de storage
- Usar events en vez de storage cuando sea posible
- Packed storage para variables relacionadas
- Yul en loops y operaciones críticas
- Custom errors en vez de require strings

---

## 🎯 Estructura del Código Esperada

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChain
 * @author [Tu Nombre]
 * @notice Contrato para gestión de trazabilidad en cadena de suministro
 * @dev Implementa sistema de roles, tokenización y transferencias controladas
 */
contract SupplyChain {
    // ========== CUSTOM ERRORS ==========
    
    // ========== ENUMS ==========
    
    // ========== STRUCTS ==========
    
    // ========== STATE VARIABLES ==========
    
    // ========== EVENTS ==========
    
    // ========== MODIFIERS ==========
    
    // ========== CONSTRUCTOR ==========
    
    // ========== EXTERNAL FUNCTIONS ==========
    
    // ========== PUBLIC FUNCTIONS ==========
    
    // ========== INTERNAL FUNCTIONS ==========
    
    // ========== PRIVATE FUNCTIONS ==========
    
    // ========== VIEW FUNCTIONS ==========
}
```

---

## 📊 Métricas de Éxito

El contrato será evaluado por:
1. ✅ Todos los tests pasan sin errores
2. ⚡ Consumo de gas optimizado (comparar con implementación básica)
3. 🔒 Sin vulnerabilidades de seguridad
4. 📝 Código bien documentado con NatSpec
5. 🎯 Cumple todas las validaciones especificadas
6. 🏗️ Arquitectura clara y mantenible

---

## 🚀 Entregables

1. **Archivo `SupplyChain.sol`** con el contrato completo
2. **Comentarios NatSpec** en todas las funciones públicas
3. **Documentación inline** explicando secciones de Yul
4. **Gas Report** mostrando consumo por función
5. **Notas de diseño** explicando decisiones de optimización

---

## ⚠️ Restricciones Importantes

1. **NO usar**:
   - Librerías externas innecesarias
   - Operaciones prohibidas en roles específicos
   - Transferencias directas de ETH

2. **SÍ usar**:
   - Solidity ^0.8.19 o superior
   - Custom errors para gas efficiency
   - Yul en secciones críticas (opcional pero recomendado)
   - Pattern Checks-Effects-Interactions

3. **Considerar**:
   - El contrato será desplegado en testnet
   - Usuarios reales interactuarán con él
   - El frontend consumirá todas las funciones view
   - Los tests deben pasar al 100%

---

## 📚 Referencias Útiles

- [Solidity Docs](https://docs.soliditylang.org/)
- [Yul Documentation](https://docs.soliditylang.org/en/latest/yul.html)
- [Gas Optimization Tips](https://github.com/iskdrews/awesome-solidity-gas-optimization)
- [Smart Contract Security](https://github.com/sigp/solidity-security-blog)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## 🎓 Preguntas para el Desarrollo

Antes de comenzar, considera:
1. ¿Debo usar bytes32 en vez de string para roles?
2. ¿Qué operaciones son las más costosas en gas?
3. ¿Cómo puedo reducir lecturas de storage?
4. ¿Dónde aplicar Yul sería más beneficioso?
5. ¿Qué patrones de seguridad son esenciales aquí?

---

## ✨ Ejemplo de Uso Esperado

```solidity
// 1. Usuario se registra
supplyChain.requestUserRole("Producer");

// 2. Admin aprueba
supplyChain.changeStatusUser(producerAddress, UserStatus.Approved);

// 3. Producer crea materia prima
supplyChain.createToken("Wheat", 1000, '{"origin":"Farm A"}', 0);

// 4. Producer transfiere a Factory
supplyChain.transfer(factoryAddress, 1, 500);

// 5. Factory acepta transferencia
supplyChain.acceptTransfer(1);

// 6. Factory crea producto derivado
supplyChain.createToken("Flour", 400, '{"processed":"Mill B"}', 1);

// 7. Continúa el flujo hasta Consumer...
```

---

¡Buena suerte con la implementación! 🚀

Recuerda: **Primero que funcione, luego que sea eficiente, finalmente que sea elegante.**
