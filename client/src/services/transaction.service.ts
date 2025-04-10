
import api from './api';
import { 
  Transaction,
  TransactionResponse,
  TransactionsResponse
} from '../types/transaction';

export const transactionService = {
  // Get all transactions for the current user
  getTransactions: async (): Promise<TransactionsResponse> => {
    const response = await api.get('/transactions');
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (id: string): Promise<TransactionResponse> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Get transactions by type
  getTransactionsByType: async (type: string): Promise<TransactionsResponse> => {
    const response = await api.get(`/transactions/type/${type}`);
    return response.data;
  },

  // Get transactions by status
  getTransactionsByStatus: async (status: string): Promise<TransactionsResponse> => {
    const response = await api.get(`/transactions/status/${status}`);
    return response.data;
  }
};

export default transactionService;