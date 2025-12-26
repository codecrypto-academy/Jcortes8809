"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { Web3State, User, UserStatus } from "@/types";
import { Web3Service } from "@/lib/web3";
import { NETWORK_CONFIG } from "@/contracts/config";
import { toast } from "@/components/ui/use-toast";

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

  // Inicialización: Leer localStorage y reconectar automáticamente
  useEffect(() => {
    const init = async () => {
      const savedAccount = localStorage.getItem(STORAGE_KEY);
      if (savedAccount && typeof window.ethereum !== "undefined") {
        try {
          await connectWithAccount(savedAccount);
        } catch (error) {
          console.error("Auto-reconnect failed:", error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    init();
  }, []);

  // Listener de cambio de cuenta en MetaMask
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const connectWithAccount = async (account: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Crear provider y service
      const provider = new BrowserProvider(window.ethereum);
      const service = new Web3Service(provider);
      await service.init();

      // Obtener información del usuario
      let userInfo: User | null = null;
      let isAdmin = false;

      try {
        userInfo = await service.getUserInfo(account);
        isAdmin = await service.isAdmin(account);
      } catch (error) {
        console.log("User not registered yet");
      }

      setWeb3Service(service);
      setState({
        account,
        isConnected: true,
        isLoading: false,
        userInfo,
        isAdmin,
      });
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  };

  const connect = async () => {
    try {
      // Verificar window.ethereum existe
      if (typeof window.ethereum === "undefined") {
        toast({
          variant: "destructive",
          title: "MetaMask not found",
          description: "Please install MetaMask to use this application",
        });
        return;
      }

      setState(prev => ({ ...prev, isLoading: true }));

      // Solicitar cuentas
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const account = accounts[0];

      // Verificar/cambiar a red correcta
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        // Si la red no existe, agregarla
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORK_CONFIG],
          });
        } else {
          throw switchError;
        }
      }

      await connectWithAccount(account);

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEY, account);

      toast({
        variant: "success",
        title: "Connected successfully",
        description: `Wallet connected: ${account.slice(0, 6)}...${account.slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Connect error:", error);
      setState(prev => ({ ...prev, isLoading: false }));

      if (error.code === 4001) {
        toast({
          variant: "destructive",
          title: "Connection rejected",
          description: "You rejected the connection request",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: error.message || "Failed to connect wallet",
        });
      }
    }
  };

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setWeb3Service(null);
    setState({
      account: null,
      isConnected: false,
      isLoading: false,
      userInfo: null,
      isAdmin: false,
    });

    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  }, []);

  const refreshUserInfo = async () => {
    if (!state.account || !web3Service) return;

    try {
      const userInfo = await web3Service.getUserInfo(state.account);
      const isAdmin = await web3Service.isAdmin(state.account);

      setState(prev => ({
        ...prev,
        userInfo,
        isAdmin,
      }));
    } catch (error) {
      console.error("Error refreshing user info:", error);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== state.account) {
      try {
        await connectWithAccount(accounts[0]);
        localStorage.setItem(STORAGE_KEY, accounts[0]);
      } catch (error) {
        console.error("Account change failed:", error);
        disconnect();
      }
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
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
