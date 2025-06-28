import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";
import { ATZENWIN_CONTRACT_ADDRESS, ATZENWIN_CONTRACT_ABI } from "../contracts/atzenwinContract";

export class BiconomyService {
  private smartAccount: BiconomySmartAccountV2 | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private contract: ethers.Contract | null = null;
  private bundler: Bundler | null = null;
  private paymaster: BiconomyPaymaster | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.contract = new ethers.Contract(
        ATZENWIN_CONTRACT_ADDRESS,
        ATZENWIN_CONTRACT_ABI,
        this.provider.getSigner()
      );
      
      this.bundler = new Bundler({
        bundlerUrl: import.meta.env.VITE_BUNDLER_URL,
        chainId: ChainId.POLYGON_MAINNET,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      });

      this.paymaster = new BiconomyPaymaster({
        paymasterUrl: import.meta.env.VITE_PAYMASTER_URL,
      });
    }
  }

  async initializeSmartAccount(userAddress: string): Promise<{ address: string; balance: { native: number; atzencoins: number; } }> {
    try {
      if (!this.provider || !this.bundler || !this.paymaster) {
        throw new Error('Services not initialized');
      }

      const biconomySmartAccount = await BiconomySmartAccountV2.create({
        signer: this.provider.getSigner(),
        chainId: ChainId.POLYGON_MAINNET,
        bundler: this.bundler,
        paymaster: this.paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      });

      this.smartAccount = biconomySmartAccount;
      const address = await biconomySmartAccount.getAccountAddress();
      
      // Get balances
      const nativeBalance = await this.provider.getBalance(address);
      const atzencoins = await this.getPoints(address);

      return {
        address,
        balance: {
          native: parseFloat(ethers.utils.formatEther(nativeBalance)),
          atzencoins
        }
      };
    } catch (error) {
      console.error('Failed to initialize Biconomy smart account:', error);
      throw error;
    }
  }

  async executeTransaction(transaction: any): Promise<ethers.providers.TransactionResponse> {
    if (!this.smartAccount) {
      throw new Error('Smart account not initialized');
    }

    try {
      const userOp = await this.smartAccount.buildUserOp([transaction]);
      const userOpResponse = await this.smartAccount.sendUserOp(userOp);
      const transactionDetail = await userOpResponse.wait();
      return transactionDetail;
    } catch (error) {
      console.error('Failed to execute transaction:', error);
      throw error;
    }
  }

  async getPoints(address: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const points = await this.contract.getPoints(address);
      return points.toNumber();
    } catch (error: any) {
      console.error('Failed to get points:', error);
      return 0; // Return 0 if contract call fails
    }
  }

  async addPoints(to: string, points: number): Promise<ethers.providers.TransactionResponse> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const transaction = await this.contract.populateTransaction.addPoints(to, points);
      return await this.executeTransaction(transaction);
    } catch (error: any) {
      throw new Error('Failed to add points: ' + (error.message || 'Unknown error'));
    }
  }

  async transferPoints(to: string, points: number): Promise<ethers.providers.TransactionResponse> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const transaction = await this.contract.populateTransaction.transferPoints(to, points);
      return await this.executeTransaction(transaction);
    } catch (error: any) {
      throw new Error('Failed to transfer points: ' + (error.message || 'Unknown error'));
    }
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0];
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  }

  async getTransactionHistory(address: string): Promise<any[]> {
    // Placeholder for transaction history
    // In production, you'd fetch from blockchain explorer API
    return [];
  }
}

// Export singleton instance
export const biconomyService = new BiconomyService();
