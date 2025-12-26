import { BrowserProvider, Contract, ContractTransactionResponse } from "ethers";
import { CONTRACT_CONFIG } from "@/contracts/config";
import SupplyChainABI from "@/contracts/abi.json";
import { User, Token, Transfer, UserStatus, TransferStatus } from "@/types";

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

    // Verificar que el contrato existe en la dirección especificada
    try {
      const code = await this.provider.getCode(CONTRACT_CONFIG.address);
      if (code === "0x") {
        throw new Error(
          `No contract found at address ${CONTRACT_CONFIG.address}. Please ensure the contract is deployed and the address is correct.`
        );
      }
    } catch (error: any) {
      console.error("Contract verification failed:", error);
      throw error;
    }
  }

  // === GESTIÓN DE USUARIOS ===

  async requestUserRole(role: string): Promise<void> {
    try {
      const tx: ContractTransactionResponse = await this.contract.requestUserRole(role);
      await tx.wait();
    } catch (error: any) {
      throw this.handleError(error, "Error requesting user role");
    }
  }

  async getUserInfo(address: string): Promise<User | null> {
    try {
      const userInfo = await this.contract.getUserInfo(address);

      return {
        id: BigInt(userInfo[0].toString()),
        userAddress: userInfo[1],
        role: userInfo[2],
        // convert status (coming from the contract) to a JS number so comparisons
        // like `userInfo.status === UserStatus.Approved` work (enum is a number)
        status: Number(userInfo[3]) as UserStatus,
      };
    } catch (error: any) {
      // Si el error es UserNotFound o BAD_DATA (usuario no registrado), retornar null
      if (
        error.message?.includes("UserNotFound") ||
        error.code === "BAD_DATA" ||
        error.message?.includes("could not decode")
      ) {
        return null;
      }
      throw this.handleError(error, "Error getting user info");
    }
  }

  async isAdmin(address: string): Promise<boolean> {
    try {
      return await this.contract.isAdmin(address);
    } catch (error: any) {
      // Si hay error de decodificación, asumir que no es admin
      if (
        error.code === "BAD_DATA" ||
        error.message?.includes("could not decode")
      ) {
        return false;
      }
      throw this.handleError(error, "Error checking admin status");
    }
  }

  async changeUserStatus(userAddress: string, newStatus: UserStatus): Promise<void> {
    try {
      const tx: ContractTransactionResponse = await this.contract.changeStatusUser(
        userAddress,
        newStatus
      );
      await tx.wait();
    } catch (error: any) {
      throw this.handleError(error, "Error changing user status");
    }
  }

  async getAllUserIds(): Promise<bigint[]> {
    try {
      const userIds = await this.contract.getAllUserIds();
      return userIds.map((id: any) => BigInt(id.toString()));
    } catch (error: any) {
      throw this.handleError(error, "Error getting all user IDs");
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const userIds = await this.getAllUserIds();
      if (userIds.length === 0) return [];

      const usersData = await this.contract.getUsersByIds(userIds);

      return usersData.map((userData: any) => ({
        id: BigInt(userData[0].toString()),
        userAddress: userData[1],
        role: userData[2],
        status: Number(userData[3]) as UserStatus,
      }));
    } catch (error: any) {
      throw this.handleError(error, "Error getting all users");
    }
  }

  // === GESTIÓN DE TOKENS ===

  async createToken(
    name: string,
    totalSupply: bigint,
    features: string,
    parentIds: bigint[],
    parentAmounts: bigint[]
  ): Promise<void> {
    try {
      const tx: ContractTransactionResponse = await this.contract.createToken(
        name,
        totalSupply,
        features,
        parentIds,
        parentAmounts
      );
      await tx.wait();
    } catch (error: any) {
      throw this.handleError(error, "Error creating token");
    }
  }

  async getToken(tokenId: bigint): Promise<Token> {
    try {
      const tokenData = await this.contract.getToken(tokenId);

      return {
        id: tokenData[0],
        creator: tokenData[1],
        name: tokenData[2],
        totalSupply: tokenData[3],
        features: tokenData[4],
        parentIds: tokenData[5].map((id: any) => BigInt(id.toString())),
        parentAmounts: tokenData[6].map((amount: any) => BigInt(amount.toString())),
        dateCreated: tokenData[7],
      };
    } catch (error: any) {
      throw this.handleError(error, "Error getting token");
    }
  }

  async getTokenBalance(tokenId: bigint, userAddress: string): Promise<bigint> {
    try {
      return await this.contract.getTokenBalance(tokenId, userAddress);
    } catch (error: any) {
      throw this.handleError(error, "Error getting token balance");
    }
  }

  async getUserTokens(userAddress: string): Promise<bigint[]> {
    try {
      const tokens = await this.contract.getUserTokens(userAddress);
      return tokens.map((t: any) => BigInt(t.toString()));
    } catch (error: any) {
      throw this.handleError(error, "Error getting user tokens");
    }
  }

  // === GESTIÓN DE TRANSFERENCIAS ===

  async transfer(to: string, tokenId: bigint, amount: bigint): Promise<void> {
    try {
      const tx: ContractTransactionResponse = await this.contract.transfer(
        to,
        tokenId,
        amount
      );
      await tx.wait();
    } catch (error: any) {
      throw this.handleError(error, "Error creating transfer");
    }
  }

  async acceptTransfer(transferId: bigint): Promise<void> {
    try {
      const tx: ContractTransactionResponse = await this.contract.acceptTransfer(
        transferId
      );
      await tx.wait();
    } catch (error: any) {
      throw this.handleError(error, "Error accepting transfer");
    }
  }

  async rejectTransfer(transferId: bigint): Promise<void> {
    try {
      const tx: ContractTransactionResponse = await this.contract.rejectTransfer(
        transferId
      );
      await tx.wait();
    } catch (error: any) {
      throw this.handleError(error, "Error rejecting transfer");
    }
  }

  async getTransfer(transferId: bigint): Promise<Transfer> {
    try {
      const transferData = await this.contract.getTransfer(transferId);

      return {
        id: transferData[0],
        from: transferData[1],
        to: transferData[2],
        tokenId: transferData[3],
        dateCreated: transferData[4],
        amount: transferData[5],
        status: Number(transferData[6]) as TransferStatus,
      };
    } catch (error: any) {
      throw this.handleError(error, "Error getting transfer");
    }
  }

  async getUserTransfers(userAddress: string): Promise<bigint[]> {
    try {
      const transfers = await this.contract.getUserTransfers(userAddress);
      return transfers.map((t: any) => BigInt(t.toString()));
    } catch (error: any) {
      throw this.handleError(error, "Error getting user transfers");
    }
  }

  // === UTILIDADES ===

  async waitForTransaction(txHash: string) {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      return receipt;
    } catch (error: any) {
      throw this.handleError(error, "Error waiting for transaction");
    }
  }

  private handleError(error: any, defaultMessage: string): Error {
    console.error(defaultMessage, error);

    if (error.code === "ACTION_REJECTED") {
      return new Error("Transaction rejected by user");
    }

    if (error.message?.includes("insufficient balance")) {
      return new Error("Insufficient balance");
    }

    if (error.message?.includes("Unauthorized")) {
      return new Error("Unauthorized action");
    }

    if (error.message?.includes("InvalidRole")) {
      return new Error("Invalid role for this action");
    }

    if (error.message?.includes("UserNotApproved")) {
      return new Error("Your account is not approved yet");
    }

    if (error.message?.includes("InsufficientBalance")) {
      return new Error("Insufficient token balance");
    }

    if (error.message?.includes("InvalidTransferFlow")) {
      return new Error("Invalid transfer recipient role");
    }

    return new Error(error.message || defaultMessage);
  }
}
