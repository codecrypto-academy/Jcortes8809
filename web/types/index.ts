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

export type Role = "Producer" | "Factory" | "Retailer" | "Consumer" | "Admin";

export interface User {
  id: bigint;
  userAddress: string;
  role: string; // Permitir cualquier string para roles del contrato
  status: UserStatus;
}

export interface Token {
  id: bigint;
  creator: string;
  name: string;
  totalSupply: bigint;
  features: string; // JSON string que parsearemos
  parentIds: bigint[];      // Array de IDs de tokens padre
  parentAmounts: bigint[];  // Array de cantidades consumidas
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

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any;
  }
}
