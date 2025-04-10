import { Transaction } from './transaction';

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  pendingAmount: number;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  success: boolean;
  data: Wallet;
  message: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  data: {
    balance: number;
  };
  message: string;
}

export interface WalletPendingResponse {
  success: boolean;
  data: {
    pendingAmount: number;
  };
  message: string;
}

export interface WalletTransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
  };
  message: string;
}