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
