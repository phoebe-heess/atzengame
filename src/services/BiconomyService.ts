import { createMeeClient } from '@biconomy/abstractjs';
import { ethers } from 'ethers';
import { ATZENWIN_CONTRACT_ADDRESS, ATZENWIN_CONTRACT_ABI } from '../contracts/atzenwinContract';

export class BiconomyService {
  private meeClient: any = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private contract: ethers.Contract | null = null;
  private account: any = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.contract = new ethers.Contract(
        ATZENWIN_CONTRACT_ADDRESS,
        ATZENWIN_CONTRACT_ABI,
        this.provider.getSigner()
      );
    }
  }

  async initializeMeeClient(userAddress: string): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      console.log('🚀 Initializing MEE client...');

      // Create a simple account for MEE
      const signer = this.provider.getSigner();
      const address = await signer.getAddress();
      
      // Create account object for MEE
      this.account = {
        address,
        deployments: [
          {
            chain: { id: 137 } // Polygon Mainnet
          }
        ]
      };

      // Initialize MEE client
      this.meeClient = await createMeeClient({
        account: this.account,
        pollingInterval: 1000
      });

      console.log('✅ MEE client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MEE client:', error);
      throw error;
    }
  }

  async executeSponsoredTransaction(transaction: any): Promise<any> {
    if (!this.meeClient) {
      throw new Error('MEE client not initialized');
    }

    try {
      console.log('🚀 Executing sponsored transaction with MEE...');
      
      // Get quote for sponsored transaction
      const quote = await this.meeClient.getQuote({
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0x0',
        chainId: 137, // Polygon Mainnet
        sponsorship: true // Enable sponsorship
      });

      console.log('Quote received:', quote);

      // Sign the quote
      const signedQuote = await this.meeClient.signQuote({
        quote,
        signer: this.provider!.getSigner()
      });

      console.log('Quote signed successfully');

      // Execute the signed quote
      const result = await this.meeClient.executeSignedQuote({
        signedQuote
      });

      console.log('✅ MEE sponsored transaction successful:', result);
      return result;
    } catch (error) {
      console.error('Failed to execute sponsored transaction:', error);
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

  async addPoints(to: string, points: number): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Initialize MEE client if not already done
      if (!this.meeClient) {
        await this.initializeMeeClient(to);
      }

      const transaction = await this.contract.populateTransaction.addPoints(to, points);
      return await this.executeSponsoredTransaction(transaction);
    } catch (error: any) {
      throw new Error('Failed to add points: ' + (error.message || 'Unknown error'));
    }
  }

  async transferPoints(to: string, points: number): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Initialize MEE client if not already done
      if (!this.meeClient) {
        await this.initializeMeeClient(to);
      }

      const transaction = await this.contract.populateTransaction.transferPoints(to, points);
      return await this.executeSponsoredTransaction(transaction);
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
