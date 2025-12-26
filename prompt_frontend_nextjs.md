# Prompt para IA: Frontend DApp Supply Chain Tracker - Next.js 15 + TypeScript

## 🎯 Objetivo del Proyecto

Desarrollar una aplicación web completa (DApp) en Next.js 15 con TypeScript que se integre con el contrato inteligente SupplyChain desplegado en blockchain, proporcionando una interfaz de usuario moderna, responsive e intuitiva para gestionar la trazabilidad de una cadena de suministro tokenizada.

---

## 📋 Contexto del Proyecto

### Información del Smart Contract

Ya existe un contrato inteligente `SupplyChain.sol` desplegado con las siguientes características:

#### Funciones del Contrato Disponibles:
```solidity
// Gestión de Usuarios
function requestUserRole(string memory role) public
function changeStatusUser(address userAddress, UserStatus newStatus) public
function getUserInfo(address userAddress) public view returns (User memory)
function isAdmin(address userAddress) public view returns (bool)

// Gestión de Tokens
function createToken(string memory name, uint totalSupply, string memory features, uint parentId) public
function getToken(uint tokenId) public view returns (...)
function getTokenBalance(uint tokenId, address userAddress) public view returns (uint)
function getUserTokens(address userAddress) public view returns (uint[] memory)

// Gestión de Transferencias
function transfer(address to, uint tokenId, uint amount) public
function acceptTransfer(uint transferId) public
function rejectTransfer(uint transferId) public
function getTransfer(uint transferId) public view returns (Transfer memory)
function getUserTransfers(address userAddress) public view returns (uint[] memory)
```

#### Estructuras de Datos:
```typescript
enum UserStatus { Pending, Approved, Rejected, Canceled }
enum TransferStatus { Pending, Accepted, Rejected }

interface User {
  id: bigint;
  userAddress: string;
  role: string; // "Producer" | "Factory" | "Retailer" | "Consumer"
  status: UserStatus;
}

interface Token {
  id: bigint;
  creator: string;
  name: string;
  totalSupply: bigint;
  features: string; // JSON string
  parentId: bigint;
  dateCreated: bigint;
  // balance es un mapping, se obtiene con getTokenBalance
}

interface Transfer {
  id: bigint;
  from: string;
  to: string;
  tokenId: bigint;
  dateCreated: bigint;
  amount: bigint;
  status: TransferStatus;
}
```

#### Eventos del Contrato:
```solidity
event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply)
event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount)
event TransferAccepted(uint256 indexed transferId)
event TransferRejected(uint256 indexed transferId)
event UserRoleRequested(address indexed user, string role)
event UserStatusChanged(address indexed user, UserStatus status)
```

---

## 🏗️ Stack Tecnológico Requerido

### Tecnologías Core
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Blockchain**: Ethers.js v6
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI)
- **State Management**: React Context + localStorage

### Dependencias Requeridas

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "ethers": "^6.13.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-label": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-toast": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "^15"
  }
}
```

---

## 📁 Estructura del Proyecto

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Layout principal con providers
│   │   ├── page.tsx                        # Landing page (login/register)
│   │   ├── dashboard/
│   │   │   └── page.tsx                    # Dashboard según rol
│   │   ├── tokens/
│   │   │   ├── page.tsx                    # Lista de tokens del usuario
│   │   │   ├── create/
│   │   │   │   └── page.tsx                # Crear nuevo token
│   │   │   └── [id]/
│   │   │       ├── page.tsx                # Detalles del token
│   │   │       └── transfer/
│   │   │           └── page.tsx            # Transferir token
│   │   ├── transfers/
│   │   │   └── page.tsx                    # Gestión de transferencias
│   │   ├── admin/
│   │   │   ├── page.tsx                    # Panel admin (opcional)
│   │   │   └── users/
│   │   │       └── page.tsx                # Gestión de usuarios
│   │   ├── profile/
│   │   │   └── page.tsx                    # Perfil del usuario
│   │   └── globals.css                     # Estilos globales Tailwind
│   ├── components/
│   │   ├── ui/                             # Componentes Shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── select.tsx
│   │   │   ├── label.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── toast.tsx
│   │   ├── Header.tsx                      # Navegación principal
│   │   ├── ConnectButton.tsx               # Botón conectar wallet
│   │   ├── TokenCard.tsx                   # Card para mostrar token
│   │   ├── TransferCard.tsx                # Card para transferencia
│   │   ├── UserStatusBadge.tsx             # Badge de estado usuario
│   │   ├── RoleBasedRoute.tsx              # Protección de rutas
│   │   └── LoadingSpinner.tsx              # Spinner de carga
│   ├── contexts/
│   │   └── Web3Context.tsx                 # Provider global Web3
│   ├── hooks/
│   │   ├── useWallet.ts                    # Hook para wallet connection
│   │   ├── useContract.ts                  # Hook para interacción contrato
│   │   └── useLocalStorage.ts              # Hook para persistencia
│   ├── lib/
│   │   ├── web3.ts                         # Web3Service class
│   │   ├── utils.ts                        # Utilidades (formatAddress, etc)
│   │   └── constants.ts                    # Constantes globales
│   ├── contracts/
│   │   ├── abi.json                        # ABI del contrato
│   │   └── config.ts                       # Configuración del contrato
│   └── types/
│       └── index.ts                        # TypeScript types/interfaces
├── public/
│   └── (imágenes si es necesario)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── .env.local                              # Variables de entorno
```

---

## 🔧 Configuración Inicial

### 1. Configuración del Contrato (`src/contracts/config.ts`)

```typescript
export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  adminAddress: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  networkId: 31337, // Anvil local
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545",
} as const;

export const NETWORK_CONFIG = {
  chainId: "0x7A69", // 31337 en hexadecimal
  chainName: "Anvil Local",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["http://localhost:8545"],
  blockExplorerUrls: [],
};

// Roles válidos
export const ROLES = ["Producer", "Factory", "Retailer", "Consumer"] as const;
export type Role = typeof ROLES[number];

// Mapeo de flujo de transferencias
export const TRANSFER_FLOW: Record<Role, Role[]> = {
  Producer: ["Factory"],
  Factory: ["Retailer"],
  Retailer: ["Consumer"],
  Consumer: [],
};
```

### 2. Variables de Entorno (`.env.local`)

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

### 3. TypeScript Types (`src/types/index.ts`)

```typescript
export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3,
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export type Role = "Producer" | "Factory" | "Retailer" | "Consumer";

export interface User {
  id: bigint;
  userAddress: string;
  role: Role;
  status: UserStatus;
}

export interface Token {
  id: bigint;
  creator: string;
  name: string;
  totalSupply: bigint;
  features: string; // JSON string que parsearemos
  parentId: bigint;
  dateCreated: bigint;
}

export interface TokenWithBalance extends Token {
  balance: bigint;
}

export interface Transfer {
  id: bigint;
  from: string;
  to: string;
  tokenId: bigint;
  dateCreated: bigint;
  amount: bigint;
  status: TransferStatus;
}

export interface TokenFeatures {
  description?: string;
  origin?: string;
  certifications?: string[];
  [key: string]: any;
}

// Estado de la conexión Web3
export interface Web3State {
  account: string | null;
  isConnected: boolean;
  isLoading: boolean;
  userInfo: User | null;
  isAdmin: boolean;
}
```

---

## 🎨 Implementación del Web3Context

### `src/contexts/Web3Context.tsx`

Este es el componente más crítico. Debe implementar:

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserProvider } from "ethers";
import { Web3State, User } from "@/types";
import { Web3Service } from "@/lib/web3";

interface Web3ContextType extends Web3State {
  connect: () => Promise<void>;
  disconnect: () => void;
  web3Service: Web3Service | null;
  refreshUserInfo: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const STORAGE_KEY = "supply-chain-wallet";

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Web3State>({
    account: null,
    isConnected: false,
    isLoading: true,
    userInfo: null,
    isAdmin: false,
  });
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null);

  // Funcionalidades a implementar:
  
  // 1. Inicialización: Leer localStorage y reconectar automáticamente
  useEffect(() => {
    const savedAccount = localStorage.getItem(STORAGE_KEY);
    if (savedAccount) {
      // Intentar reconectar automáticamente
      connect();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 2. Listener de cambio de cuenta en MetaMask
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }
    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const connect = async () => {
    // IMPLEMENTAR:
    // - Verificar window.ethereum existe
    // - Solicitar cuentas con eth_requestAccounts
    // - Verificar/cambiar a red correcta (chainId 31337)
    // - Crear BrowserProvider y Web3Service
    // - Obtener información del usuario del contrato
    // - Verificar si es admin
    // - Guardar account en localStorage
    // - Actualizar estado
  };

  const disconnect = () => {
    // IMPLEMENTAR:
    // - Limpiar localStorage
    // - Resetear estado
    // - Limpiar web3Service
  };

  const refreshUserInfo = async () => {
    // IMPLEMENTAR:
    // - Volver a obtener getUserInfo del contrato
    // - Actualizar estado
  };

  const handleAccountsChanged = (accounts: string[]) => {
    // IMPLEMENTAR:
    // - Si hay cuenta, reconectar
    // - Si no hay cuenta, desconectar
  };

  const handleChainChanged = () => {
    // IMPLEMENTAR:
    // - Recargar página o reconectar
  };

  return (
    <Web3Context.Provider
      value={{
        ...state,
        connect,
        disconnect,
        web3Service,
        refreshUserInfo,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
```

**Requisitos críticos del Web3Context:**
- ✅ Persistencia en localStorage con key `supply-chain-wallet`
- ✅ Reconexión automática al cargar la página
- ✅ Detección de cambio de cuenta en MetaMask
- ✅ Detección de cambio de red
- ✅ Manejo de errores y estados de carga
- ✅ Actualización del userInfo cuando sea necesario

---

## 🔌 Servicio Web3

### `src/lib/web3.ts`

```typescript
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import { CONTRACT_CONFIG } from "@/contracts/config";
import SupplyChainABI from "@/contracts/abi.json";
import { User, Token, Transfer, UserStatus } from "@/types";

export class Web3Service {
  private provider: BrowserProvider;
  private contract: Contract;
  private signer: any;

  constructor(provider: BrowserProvider) {
    this.provider = provider;
    this.signer = null;
    this.contract = new Contract(
      CONTRACT_CONFIG.address,
      SupplyChainABI,
      provider
    );
  }

  async init() {
    this.signer = await this.provider.getSigner();
    this.contract = new Contract(
      CONTRACT_CONFIG.address,
      SupplyChainABI,
      this.signer
    );
  }

  // Métodos a implementar:

  // === GESTIÓN DE USUARIOS ===
  async requestUserRole(role: string): Promise<void> {
    // Llamar a contract.requestUserRole(role)
    // Esperar confirmación de transacción
    // Manejar errores
  }

  async getUserInfo(address: string): Promise<User> {
    // Llamar a contract.getUserInfo(address)
    // Convertir BigInt a formato adecuado
    // Retornar User
  }

  async isAdmin(address: string): Promise<boolean> {
    // Llamar a contract.isAdmin(address)
  }

  async changeUserStatus(userAddress: string, newStatus: UserStatus): Promise<void> {
    // Solo para admin
    // Llamar a contract.changeStatusUser(userAddress, newStatus)
  }

  // === GESTIÓN DE TOKENS ===
  async createToken(
    name: string,
    totalSupply: bigint,
    features: string,
    parentId: bigint
  ): Promise<void> {
    // Llamar a contract.createToken(name, totalSupply, features, parentId)
    // Esperar confirmación
  }

  async getToken(tokenId: bigint): Promise<Token> {
    // Llamar a contract.getToken(tokenId)
    // Procesar respuesta (viene como tupla)
    // Retornar Token
  }

  async getTokenBalance(tokenId: bigint, userAddress: string): Promise<bigint> {
    // Llamar a contract.getTokenBalance(tokenId, userAddress)
  }

  async getUserTokens(userAddress: string): Promise<bigint[]> {
    // Llamar a contract.getUserTokens(userAddress)
  }

  // === GESTIÓN DE TRANSFERENCIAS ===
  async transfer(to: string, tokenId: bigint, amount: bigint): Promise<void> {
    // Llamar a contract.transfer(to, tokenId, amount)
  }

  async acceptTransfer(transferId: bigint): Promise<void> {
    // Llamar a contract.acceptTransfer(transferId)
  }

  async rejectTransfer(transferId: bigint): Promise<void> {
    // Llamar a contract.rejectTransfer(transferId)
  }

  async getTransfer(transferId: bigint): Promise<Transfer> {
    // Llamar a contract.getTransfer(transferId)
  }

  async getUserTransfers(userAddress: string): Promise<bigint[]> {
    // Llamar a contract.getUserTransfers(userAddress)
  }

  // === UTILIDADES ===
  async waitForTransaction(txHash: string) {
    // Esperar confirmación de transacción
    // Retornar receipt
  }
}
```

**Notas importantes:**
- Todos los números del contrato vienen como BigInt
- Usar `parseEther` para convertir strings a wei
- Usar `formatEther` para mostrar valores legibles
- Manejar errores con try-catch y mensajes descriptivos
- Emitir eventos cuando sea apropiado

---

## 📄 Implementación de Páginas

### 1. Landing Page (`app/page.tsx`)

**Estados a manejar:**
- Usuario no conectado → Mostrar botón "Connect Wallet"
- Usuario conectado pero no registrado → Mostrar formulario de registro
- Usuario registrado con status Pending → Mostrar mensaje de espera
- Usuario registrado con status Rejected → Mostrar mensaje de rechazo
- Usuario registrado con status Approved → Redirigir a /dashboard

**Componentes:**
```typescript
// IMPLEMENTAR:
// 1. Botón conectar wallet prominente
// 2. Formulario de registro con selector de roles
// 3. Estados visuales claros para cada caso
// 4. Diseño atractivo y profesional
```

### 2. Dashboard (`app/dashboard/page.tsx`)

**Debe ser dinámico según el rol:**

```typescript
// Producer Dashboard:
// - Total de materias primas creadas
// - Transferencias enviadas
// - Botón: Crear Nueva Materia Prima

// Factory Dashboard:
// - Transferencias recibidas pendientes
// - Productos creados
// - Botón: Crear Producto

// Retailer Dashboard:
// - Transferencias recibidas pendientes
// - Productos distribuidos
// - Botón: Ver Inventario

// Consumer Dashboard:
// - Productos recibidos
// - Trazabilidad completa de productos
// - Botón: Ver Productos

// Admin Dashboard:
// - Usuarios pendientes de aprobación
// - Estadísticas generales del sistema
// - Botón: Gestionar Usuarios
```

### 3. Crear Token (`app/tokens/create/page.tsx`)

**Formulario dinámico según rol:**

```typescript
// Producer: parentId = 0 (automático, hidden)
// Factory/Retailer: Selector de parentId (tokens que posee con balance > 0)

// Campos del formulario:
// - Nombre del producto/materia prima (string)
// - Cantidad inicial (number)
// - Características (objeto JSON):
//   * description (textarea)
//   * origin (input)
//   * certifications (array de strings)
//   * Campos personalizados

// Validaciones:
// - Nombre no vacío
// - Cantidad > 0
// - Si requiere parent, verificar que exista y tenga balance
```

### 4. Detalle de Token (`app/tokens/[id]/page.tsx`)

**CRÍTICO - Manejo de Params en Next.js 15:**

```typescript
import { use } from 'react';

export default function TokenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  // Continuar con lógica normal usando id
}
```

**Información a mostrar:**
- Datos básicos del token
- Balance del usuario actual
- Historial de creador
- Si tiene parentId > 0, mostrar información del token padre
- Trazabilidad completa (árbol de parentesco)
- Botón: Transferir (si tiene balance > 0 y rol permite)

### 5. Transferir Token (`app/tokens/[id]/transfer/page.tsx`)

**Formulario de transferencia:**
```typescript
// Campos:
// - Destinatario (address input)
// - Cantidad (number input, max = balance actual)

// Validaciones:
// - Address válida y en checksum format
// - Destinatario debe estar registrado y aprobado
// - Destinatario debe tener rol correcto según flujo
//   * Producer → Factory
//   * Factory → Retailer
//   * Retailer → Consumer
// - Cantidad > 0 y <= balance
// - No transferir a uno mismo

// Feedback:
// - Mostrar rol del destinatario si es válido
// - Advertencias si no cumple flujo
```

### 6. Gestión de Transferencias (`app/transfers/page.tsx`)

**Dos secciones:**

```typescript
// 1. Transferencias Pendientes de Aceptación (donde usuario es "to")
// - Card por cada transferencia
// - Información del token
// - Remitente
// - Cantidad
// - Botones: Aceptar / Rechazar

// 2. Historial Completo
// - Tabs: Enviadas | Recibidas | Todas
// - Filtros por estado
// - Búsqueda por token
```

### 7. Gestión de Usuarios - Admin (`app/admin/users/page.tsx`)

**Solo accesible por Admin:**

```typescript
// Protección de ruta:
// - Verificar isAdmin
// - Si no es admin, redirigir a /dashboard

// Tabla de usuarios:
// - Address (formato corto con copy button)
// - Rol solicitado
// - Estado actual
// - Acciones:
//   * Si Pending → Aprobar / Rechazar
//   * Si Approved → Revocar (cambiar a Canceled)
//   * Si Rejected → Dar segunda oportunidad (cambiar a Pending)

// Filtros:
// - Por rol
// - Por estado
// - Búsqueda por address
```

### 8. Perfil (`app/profile/page.tsx`)

```typescript
// Información del usuario:
// - Address completa
// - Rol
// - Estado
// - Fecha de registro (si está disponible)

// Portfolio:
// - Lista de tokens con balance > 0
// - Total de tokens creados
// - Total de transferencias realizadas

// Estadísticas:
// - Según rol, mostrar métricas relevantes
```

---

## 🎨 Componentes UI

### Header Component (`components/Header.tsx`)

```typescript
// Navegación principal:
// - Logo / Nombre de la app
// - Links según rol:
//   * Dashboard
//   * Tokens
//   * Transfers
//   * Admin (solo si isAdmin)
//   * Profile
// - ConnectButton (derecha)
// - Indicador de rol y estado

// Responsive:
// - Desktop: Barra horizontal
// - Mobile: Menú hamburguesa
```

### TokenCard Component (`components/TokenCard.tsx`)

```typescript
interface TokenCardProps {
  token: Token;
  balance?: bigint;
  showActions?: boolean;
  onTransfer?: () => void;
}

// Diseño:
// - Nombre del token (destacado)
// - Total Supply
// - Balance del usuario (si está disponible)
// - Características resumidas
// - Fecha de creación
// - Indicador de token padre (si existe)
// - Botones de acción (si showActions=true)
```

### TransferCard Component (`components/TransferCard.tsx`)

```typescript
interface TransferCardProps {
  transfer: Transfer;
  onAccept?: () => void;
  onReject?: () => void;
}

// Mostrar:
// - Token name (obtener del contrato)
// - From → To (con formateo de address)
// - Cantidad
// - Estado (badge con color)
// - Fecha
// - Acciones (si transfer.status === Pending y el usuario es "to")
```

### UserStatusBadge Component (`components/UserStatusBadge.tsx`)

```typescript
interface UserStatusBadgeProps {
  status: UserStatus;
}

// Colores:
// - Pending: yellow/amber
// - Approved: green
// - Rejected: red
// - Canceled: gray
```

### RoleBasedRoute Component (`components/RoleBasedRoute.tsx`)

```typescript
interface RoleBasedRouteProps {
  allowedRoles?: Role[];
  requireAdmin?: boolean;
  children: ReactNode;
}

// Protección de rutas:
// - Verificar si usuario está conectado y aprobado
// - Verificar si el rol está en allowedRoles
// - Verificar isAdmin si requireAdmin=true
// - Si no cumple, redirigir o mostrar mensaje
```

---

## 🛠️ Utilidades y Helpers

### `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear address
export function formatAddress(address: string, start = 6, end = 4): string {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Convertir BigInt a string para JSON
export function bigIntToString(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// Parsear features JSON
export function parseTokenFeatures(features: string): any {
  try {
    return JSON.parse(features);
  } catch {
    return {};
  }
}

// Validar address Ethereum
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Formatear fecha desde timestamp
export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

// Copiar al portapapeles
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
```

### `lib/constants.ts`

```typescript
export const USER_STATUS_LABELS = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Canceled",
} as const;

export const TRANSFER_STATUS_LABELS = {
  0: "Pending",
  1: "Accepted",
  2: "Rejected",
} as const;

export const ROLE_EMOJIS = {
  Producer: "👨‍🌾",
  Factory: "🏭",
  Retailer: "🏪",
  Consumer: "🛒",
  Admin: "👑",
} as const;

export const ROLE_DESCRIPTIONS = {
  Producer: "Create raw materials and transfer to Factory",
  Factory: "Receive materials, create products, transfer to Retailer",
  Retailer: "Receive products, distribute to Consumers",
  Consumer: "Final destination, can view full traceability",
} as const;
```

---

## ⚠️ Manejo de Errores

### Errores Comunes a Manejar

```typescript
// 1. MetaMask no instalado
if (typeof window.ethereum === 'undefined') {
  throw new Error('Please install MetaMask to use this application');
}

// 2. Usuario rechazó conexión
catch (error: any) {
  if (error.code === 4001) {
    // Usuario rechazó
    toast.error('Connection rejected by user');
  }
}

// 3. Red incorrecta
if (chainId !== '0x7A69') {
  // Solicitar cambio de red
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x7A69' }],
  });
}

// 4. Transacción revertida
catch (error: any) {
  if (error.code === 'ACTION_REJECTED') {
    toast.error('Transaction rejected');
  } else if (error.message.includes('insufficient balance')) {
    toast.error('Insufficient balance');
  } else {
    toast.error('Transaction failed: ' + error.message);
  }
}

// 5. Usuario no autorizado
if (userInfo.status !== UserStatus.Approved) {
  throw new Error('Your account is not approved yet');
}
```

---

## 🎨 Diseño y UX

### Principios de Diseño

1. **Claridad de Estado**
   - Siempre mostrar estado de conexión
   - Feedback visual inmediato en acciones
   - Loading states en todas las operaciones async

2. **Jerarquía Visual**
   - Acciones primarias destacadas
   - Información crítica visible
   - Flujo de navegación intuitivo

3. **Responsive Design**
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px)
   - Navegación adaptativa

4. **Accesibilidad**
   - Contraste adecuado (WCAG AA)
   - Textos descriptivos en botones
   - Keyboard navigation

### Color Palette Sugerida

```typescript
// Tailwind classes recomendadas:
// - Primary: blue-600
// - Success: green-600
// - Warning: yellow-500
// - Danger: red-600
// - Info: purple-600

// Status colors:
// - Pending: amber-500
// - Approved: green-500
// - Rejected: red-500
// - Canceled: gray-500
```

---

## 🔒 Seguridad y Validaciones

### Validaciones Frontend

```typescript
// 1. Antes de conectar wallet
- Verificar que window.ethereum existe
- Verificar que la red es la correcta

// 2. Antes de registrar usuario
- Validar que el rol es válido
- Verificar que no está ya registrado

// 3. Antes de crear token
- Validar nombre no vacío
- Validar totalSupply > 0
- Si requiere parent, verificar que existe y tiene balance

// 4. Antes de transferir
- Validar address destino (formato)
- Validar que destino está aprobado
- Validar que destino tiene rol correcto para el flujo
- Validar amount > 0 y <= balance
- Validar que no es transfer a uno mismo

// 5. En operaciones de admin
- Doble verificación de isAdmin
- Confirmación antes de cambiar estados críticos
```

### Protección de Rutas

```typescript
// Implementar en layout.tsx o en cada página:
useEffect(() => {
  if (!isConnected) {
    router.push('/');
  }
  if (userInfo && userInfo.status !== UserStatus.Approved) {
    router.push('/');
  }
}, [isConnected, userInfo]);

// Para rutas de admin:
if (!isAdmin) {
  router.push('/dashboard');
}
```

---

## 🚀 Optimizaciones

### 1. Caching de Datos

```typescript
// Usar React Query o SWR para:
- Cachear getUserInfo
- Cachear getUserTokens
- Cachear getUserTransfers
- Revalidar en eventos del contrato
```

### 2. Lazy Loading

```typescript
// Next.js dynamic imports:
const TokenCard = dynamic(() => import('@/components/TokenCard'));
const TransferCard = dynamic(() => import('@/components/TransferCard'));
```

### 3. Optimistic Updates

```typescript
// Al aceptar/rechazar transfer:
- Actualizar UI inmediatamente
- Revertir si la transacción falla
```

### 4. Evitar Re-renders Innecesarios

```typescript
// Usar useMemo y useCallback:
const tokenList = useMemo(() => {
  return tokens.filter(t => t.balance > 0);
}, [tokens]);
```

---

## 📊 Testing Recomendado

### Tests Sugeridos (Opcional)

```typescript
// 1. Web3Context
- Conexión exitosa con MetaMask
- Reconexión automática desde localStorage
- Detección de cambio de cuenta
- Desconexión limpia

// 2. Web3Service
- Llamadas al contrato correctas
- Manejo de errores
- Conversión de tipos BigInt

// 3. Componentes
- Renderizado correcto según props
- Interacciones de usuario
- Estados de loading y error
```

---

## 🎯 Checklist de Implementación

### Configuración Inicial
- [ ] Inicializar proyecto Next.js 15 con TypeScript
- [ ] Instalar todas las dependencias
- [ ] Configurar Tailwind CSS
- [ ] Instalar Shadcn/ui components
- [ ] Crear estructura de carpetas
- [ ] Configurar variables de entorno

### Core Functionality
- [ ] Implementar Web3Context con persistencia
- [ ] Crear Web3Service con todos los métodos
- [ ] Implementar hooks personalizados
- [ ] Crear utilidades y helpers

### Páginas
- [ ] Landing page con estados dinámicos
- [ ] Dashboard personalizado por rol
- [ ] Crear token con validaciones
- [ ] Detalle de token con trazabilidad
- [ ] Transferir token con validaciones de flujo
- [ ] Gestión de transferencias
- [ ] Panel de admin
- [ ] Perfil de usuario

### Componentes
- [ ] Header con navegación
- [ ] ConnectButton
- [ ] TokenCard
- [ ] TransferCard
- [ ] UserStatusBadge
- [ ] RoleBasedRoute
- [ ] LoadingSpinner

### Integración
- [ ] Conectar MetaMask exitosamente
- [ ] Persistencia en localStorage funcionando
- [ ] Reconexión automática operativa
- [ ] Todas las funciones del contrato llamándose correctamente
- [ ] Manejo de errores robusto
- [ ] Feedback visual en todas las acciones

### UX/UI
- [ ] Design responsive completo
- [ ] Estados de loading implementados
- [ ] Mensajes de error descriptivos
- [ ] Transiciones y animaciones suaves
- [ ] Navegación intuitiva

### Testing Manual
- [ ] Flujo completo Producer → Factory → Retailer → Consumer
- [ ] Registro y aprobación de usuarios
- [ ] Creación de tokens con parentId
- [ ] Transferencias con validación de flujo
- [ ] Aceptar/rechazar transferencias
- [ ] Panel de admin funcional
- [ ] Cambio de cuenta en MetaMask

---

## ⚡ Tips de Desarrollo

### 1. Debugging

```typescript
// Usar console.log estratégicamente:
console.log('Account:', account);
console.log('UserInfo:', userInfo);
console.log('Token:', token);

// En transacciones, loggear hashes:
console.log('Transaction hash:', tx.hash);
await tx.wait();
console.log('Transaction confirmed');
```

### 2. Manejo de BigInt

```typescript
// ⚠️ CRÍTICO: BigInt no se serializa en JSON
// Siempre convertir antes de guardar en localStorage o enviar a componentes

const tokenData = {
  ...token,
  id: token.id.toString(),
  totalSupply: token.totalSupply.toString(),
};
```

### 3. Next.js 15 Params

```typescript
// ⚠️ CRÍTICO: En Next.js 15, params es una Promise
// SIEMPRE usar el hook use() de React:

import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // ...
}
```

### 4. Eventos del Contrato

```typescript
// Escuchar eventos para actualizar UI:
contract.on('TokenCreated', (tokenId, creator, name, totalSupply) => {
  console.log('New token created:', tokenId);
  refreshData();
});

// Limpiar listeners:
return () => {
  contract.removeAllListeners();
};
```

---

## 📚 Referencias Útiles

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MetaMask Docs](https://docs.metamask.io/)

---

## 🎓 Criterios de Éxito

La aplicación será evaluada por:

1. ✅ **Funcionalidad Completa**: Todos los flujos operativos
2. 🎨 **UI/UX de Calidad**: Diseño profesional y responsive
3. 🔗 **Integración Web3**: Conexión robusta con blockchain
4. 🔒 **Seguridad**: Validaciones y protección de rutas
5. ⚡ **Performance**: Carga rápida y optimizada
6. 📱 **Responsive**: Funciona en mobile y desktop
7. 🐛 **Manejo de Errores**: Feedback claro al usuario
8. 📝 **Código Limpio**: Organizado y bien comentado

---

## 🚀 Entregables

1. **Código completo** de la aplicación Next.js
2. **README.md** con instrucciones de instalación y ejecución
3. **Variables de entorno** ejemplo (.env.example)
4. **Screenshots** o GIFs de la aplicación funcionando
5. **Notas de implementación** con decisiones técnicas

---

## ✨ Ejemplo de Flujo Completo

### Usuario Producer:

1. Conecta MetaMask
2. Se registra como Producer
3. Admin aprueba
4. Crea token "Wheat" (1000 unidades)
5. Transfiere 500 unidades a Factory
6. Factory acepta transferencia

### Usuario Factory:

1. Conecta MetaMask
2. Se registra como Factory
3. Admin aprueba
4. Recibe transferencia de 500 Wheat
5. Crea token "Flour" (400 unidades) con parentId = Wheat
6. Transfiere 200 Flour a Retailer

### Usuario Retailer:

1. Conecta MetaMask
2. Se registra como Retailer
3. Admin aprueba
4. Recibe 200 Flour
5. Transfiere 100 Flour a Consumer

### Usuario Consumer:

1. Conecta MetaMask
2. Se registra como Consumer
3. Admin aprueba
4. Recibe 100 Flour
5. Consulta trazabilidad: Flour → Wheat → Producer

---

¡Buena suerte con el desarrollo! 🎉

**Recuerda**: Primero haz que funcione, luego hazlo bonito, finalmente optimiza. ⚡
