export interface PlusOne {
  id: number;
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlumeWallet {
  address: string;
  privateKey: string;
  publicKey: string;
  balance: {
    native: number;
    atzencoins: number;
  };
  transactions: Transaction[];
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'transfer' | 'reward' | 'purchase';
}

export interface AtzencoinToken {
  name: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
  communityRewards: number;
  developmentEcosystem: number;
  teamAdvisors: number;
  marketingPartnerships: number;
  liquidityPool: number;
}
