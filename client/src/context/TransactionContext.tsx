"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { transactionService } from '../services/transaction.service';
import { Transaction, TransactionType, TransactionStatus } from '../types/transaction';

// Define action types
export enum TransactionActionTypes {
  FETCH_TRANSACTIONS_START = 'FETCH_TRANSACTIONS_START',
  FETCH_TRANSACTIONS_SUCCESS = 'FETCH_TRANSACTIONS_SUCCESS',
  FETCH_TRANSACTIONS_ERROR = 'FETCH_TRANSACTIONS_ERROR',
  FETCH_TRANSACTION_BY_ID_START = 'FETCH_TRANSACTION_BY_ID_START',
  FETCH_TRANSACTION_BY_ID_SUCCESS = 'FETCH_TRANSACTION_BY_ID_SUCCESS',
  FETCH_TRANSACTION_BY_ID_ERROR = 'FETCH_TRANSACTION_BY_ID_ERROR',
  FETCH_TRANSACTIONS_BY_TYPE_START = 'FETCH_TRANSACTIONS_BY_TYPE_START',
  FETCH_TRANSACTIONS_BY_TYPE_SUCCESS = 'FETCH_TRANSACTIONS_BY_TYPE_SUCCESS',
  FETCH_TRANSACTIONS_BY_TYPE_ERROR = 'FETCH_TRANSACTIONS_BY_TYPE_ERROR',
  FETCH_TRANSACTIONS_BY_STATUS_START = 'FETCH_TRANSACTIONS_BY_STATUS_START',
  FETCH_TRANSACTIONS_BY_STATUS_SUCCESS = 'FETCH_TRANSACTIONS_BY_STATUS_SUCCESS',
  FETCH_TRANSACTIONS_BY_STATUS_ERROR = 'FETCH_TRANSACTIONS_BY_STATUS_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR'
}

// Define action interface
interface TransactionAction {
  type: TransactionActionTypes;
  payload?: any;
}

// Define state interface
interface TransactionState {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  currentTransaction: Transaction | null;
  filteredTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: TransactionState = {
  transactions: [],
  recentTransactions: [],
  currentTransaction: null,
  filteredTransactions: [],
  isLoading: false,
  error: null
};

// Reducer function
const transactionReducer = (state: TransactionState, action: TransactionAction): TransactionState => {
  switch (action.type) {
    case TransactionActionTypes.FETCH_TRANSACTIONS_START:
    case TransactionActionTypes.FETCH_TRANSACTION_BY_ID_START:
    case TransactionActionTypes.FETCH_TRANSACTIONS_BY_TYPE_START:
    case TransactionActionTypes.FETCH_TRANSACTIONS_BY_STATUS_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

      // case TransactionActionTypes.FETCH_TRANSACTIONS_SUCCESS: {
      //   const transactions = action.payload as Transaction[];
      
      //   const sortedTransactions = [...transactions].sort(
      //     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      //   );
       
      //   return {
      //     ...state,
      //     transactions: sortedTransactions,
      //     recentTransactions: sortedTransactions.slice(0, 5),
      //     isLoading: false
      //   };
      // }
      

    case TransactionActionTypes.FETCH_TRANSACTION_BY_ID_SUCCESS:
      return {
        ...state,
        currentTransaction: action.payload,
        isLoading: false
      };

    case TransactionActionTypes.FETCH_TRANSACTIONS_BY_TYPE_SUCCESS:
    case TransactionActionTypes.FETCH_TRANSACTIONS_BY_STATUS_SUCCESS:
      return {
        ...state,
        filteredTransactions: action.payload,
        isLoading: false
      };

    case TransactionActionTypes.FETCH_TRANSACTIONS_ERROR:
    case TransactionActionTypes.FETCH_TRANSACTION_BY_ID_ERROR:
    case TransactionActionTypes.FETCH_TRANSACTIONS_BY_TYPE_ERROR:
    case TransactionActionTypes.FETCH_TRANSACTIONS_BY_STATUS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case TransactionActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Context type
interface TransactionContextType {
  state: TransactionState;
  dispatch: React.Dispatch<TransactionAction>;
  fetchTransactions: () => Promise<void>;
  fetchTransactionById: (id: string) => Promise<Transaction | null>;
  fetchTransactionsByType: (type: TransactionType) => Promise<Transaction[]>;
  fetchTransactionsByStatus: (status: TransactionStatus) => Promise<Transaction[]>;
  clearError: () => void;
}

// Create context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Hook to use the transaction context
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

// Provider component
interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Action creators
  const fetchTransactions = async () => {
    try {
      dispatch({ type: TransactionActionTypes.FETCH_TRANSACTIONS_START });
      
      const response = await transactionService.getTransactions();
      
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTIONS_SUCCESS,
        payload: response.data
      });
    } catch (err: any) {
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTIONS_ERROR,
        payload: err.response?.data?.message || 'Failed to load transactions'
      });
    }
  };

  const fetchTransactionById = async (id: string): Promise<Transaction | null> => {
    try {
      dispatch({ type: TransactionActionTypes.FETCH_TRANSACTION_BY_ID_START });
      
      const response = await transactionService.getTransactionById(id);
      
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTION_BY_ID_SUCCESS,
        payload: response.data
      });
      
      return response.data;
    } catch (err: any) {
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTION_BY_ID_ERROR,
        payload: err.response?.data?.message || 'Failed to load transaction'
      });
      
      return null;
    }
  };

  const fetchTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
    try {
      dispatch({ type: TransactionActionTypes.FETCH_TRANSACTIONS_BY_TYPE_START });
      
      const response = await transactionService.getTransactionsByType(type);
      
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTIONS_BY_TYPE_SUCCESS,
        payload: response.data
      });
      
      return response.data;
    } catch (err: any) {
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTIONS_BY_TYPE_ERROR,
        payload: err.response?.data?.message || 'Failed to load transactions by type'
      });
      
      return [];
    }
  };

  const fetchTransactionsByStatus = async (status: TransactionStatus): Promise<Transaction[]> => {
    try {
      dispatch({ type: TransactionActionTypes.FETCH_TRANSACTIONS_BY_STATUS_START });
      
      const response = await transactionService.getTransactionsByStatus(status);
      
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTIONS_BY_STATUS_SUCCESS,
        payload: response.data
      });
      
      return response.data;
    } catch (err: any) {
      dispatch({
        type: TransactionActionTypes.FETCH_TRANSACTIONS_BY_STATUS_ERROR,
        payload: err.response?.data?.message || 'Failed to load transactions by status'
      });
      
      return [];
    }
  };

  const clearError = () => {
    dispatch({ type: TransactionActionTypes.CLEAR_ERROR });
  };

  // Initialize transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const value = {
    state,
    dispatch,
    fetchTransactions,
    fetchTransactionById,
    fetchTransactionsByType,
    fetchTransactionsByStatus,
    clearError
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};