import api from './api';
import { 
  WalletResponse, 
  WalletBalanceResponse, 
  WalletPendingResponse,
  WalletTransactionsResponse
} from '../types/wallet';
import { 
  FundWalletRequest, 
  WithdrawRequest, 
  TransferRequest,
  TransactionResponse
} from '../types/transaction';

export const walletService = {
  // Get wallet balance
  getBalance: async (): Promise<WalletBalanceResponse> => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  // Get pending amount
  getPendingAmount: async (): Promise<WalletPendingResponse> => {
    const response = await api.get('/wallet/pending');
    return response.data;
  },

  // Fund wallet
  fundWallet: async (data: FundWalletRequest): Promise<TransactionResponse> => {
    const response = await api.post('/wallet/fund', data);
    return response.data;
  },

  // Withdraw from wallet
  withdraw: async (data: WithdrawRequest): Promise<TransactionResponse> => {
    const response = await api.post('/wallet/withdraw', data);
    return response.data;
  },

  // Transfer funds to another user
  transfer: async (data: TransferRequest): Promise<TransactionResponse> => {
    const response = await api.post('/wallet/transfer', data);
    return response.data;
  },

  // Freeze wallet
  freezeWallet: async (): Promise<WalletResponse> => {
    const response = await api.post('/wallet/freeze');
    return response.data;
  },

  // Unfreeze wallet
  unfreezeWallet: async (): Promise<WalletResponse> => {
    const response = await api.post('/wallet/unfreeze');
    return response.data;
  }
};

export default walletService;