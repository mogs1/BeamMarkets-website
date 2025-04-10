'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { walletService } from '../services/wallet.service';
import { Wallet } from '../types/wallet';

// Define action types
export enum WalletActionTypes {
  FETCH_WALLET_START = 'FETCH_WALLET_START',
  FETCH_WALLET_SUCCESS = 'FETCH_WALLET_SUCCESS',
  FETCH_WALLET_ERROR = 'FETCH_WALLET_ERROR',
  FUND_WALLET_START = 'FUND_WALLET_START',
  FUND_WALLET_SUCCESS = 'FUND_WALLET_SUCCESS',
  FUND_WALLET_ERROR = 'FUND_WALLET_ERROR',
  WITHDRAW_START = 'WITHDRAW_START',
  WITHDRAW_SUCCESS = 'WITHDRAW_SUCCESS',
  WITHDRAW_ERROR = 'WITHDRAW_ERROR',
  TRANSFER_START = 'TRANSFER_START',
  TRANSFER_SUCCESS = 'TRANSFER_SUCCESS',
  TRANSFER_ERROR = 'TRANSFER_ERROR',
  FREEZE_WALLET_START = 'FREEZE_WALLET_START',
  FREEZE_WALLET_SUCCESS = 'FREEZE_WALLET_SUCCESS',
  FREEZE_WALLET_ERROR = 'FREEZE_WALLET_ERROR',
  UNFREEZE_WALLET_START = 'UNFREEZE_WALLET_START',
  UNFREEZE_WALLET_SUCCESS = 'UNFREEZE_WALLET_SUCCESS',
  UNFREEZE_WALLET_ERROR = 'UNFREEZE_WALLET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR'
}

// Define action interfaces
interface WalletAction {
  type: WalletActionTypes;
  payload?: any;
}

// Define state interface
interface WalletState {
  wallet: Wallet | null;
  balance: number;
  pendingAmount: number;
  isFrozen: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: WalletState = {
  wallet: null,
  balance: 0,
  pendingAmount: 0,
  isFrozen: false,
  isLoading: false,
  error: null
};

// Reducer function
const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case WalletActionTypes.FETCH_WALLET_START:
    case WalletActionTypes.FUND_WALLET_START:
    case WalletActionTypes.WITHDRAW_START:
    case WalletActionTypes.TRANSFER_START:
    case WalletActionTypes.FREEZE_WALLET_START:
    case WalletActionTypes.UNFREEZE_WALLET_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case WalletActionTypes.FETCH_WALLET_SUCCESS:
      return {
        ...state,
        balance: action.payload.balance,
        pendingAmount: action.payload.pendingAmount,
        isFrozen: action.payload.isFrozen,
        isLoading: false
      };

    case WalletActionTypes.FUND_WALLET_SUCCESS:
    case WalletActionTypes.WITHDRAW_SUCCESS:
    case WalletActionTypes.TRANSFER_SUCCESS:
      return {
        ...state,
        balance: action.payload.balance,
        isLoading: false
      };

    case WalletActionTypes.FREEZE_WALLET_SUCCESS:
      return {
        ...state,
        isFrozen: true,
        isLoading: false
      };

    case WalletActionTypes.UNFREEZE_WALLET_SUCCESS:
      return {
        ...state,
        isFrozen: false,
        isLoading: false
      };

    case WalletActionTypes.FETCH_WALLET_ERROR:
    case WalletActionTypes.FUND_WALLET_ERROR:
    case WalletActionTypes.WITHDRAW_ERROR:
    case WalletActionTypes.TRANSFER_ERROR:
    case WalletActionTypes.FREEZE_WALLET_ERROR:
    case WalletActionTypes.UNFREEZE_WALLET_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case WalletActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Context type
interface WalletContextType {
  state: WalletState;
  dispatch: React.Dispatch<WalletAction>;
  refreshWallet: () => Promise<void>;
  fundWallet: (amount: number, description?: string) => Promise<boolean>;
  withdraw: (amount: number, description?: string) => Promise<boolean>;
  transfer: (recipient: string, amount: number, description?: string) => Promise<boolean>;
  freezeWallet: () => Promise<boolean>;
  unfreezeWallet: () => Promise<boolean>;
  clearError: () => void;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Provider component
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Action creators
  const refreshWallet = async () => {
    try {
      dispatch({ type: WalletActionTypes.FETCH_WALLET_START });
      
      // Get wallet balance
      const balanceResponse = await walletService.getBalance();
      const balance = balanceResponse.data.balance;
      
      // Get pending amount
      const pendingResponse = await walletService.getPendingAmount();
      const pendingAmount = pendingResponse.data.pendingAmount;
      
      dispatch({ 
        type: WalletActionTypes.FETCH_WALLET_SUCCESS, 
        payload: { 
          balance,
          pendingAmount,
          isFrozen: state.isFrozen // We don't have a direct endpoint to check frozen status
        }
      });
    } catch (err: any) {
      dispatch({ 
        type: WalletActionTypes.FETCH_WALLET_ERROR, 
        payload: err.response?.data?.message || 'Failed to load wallet information'
      });
    }
  };

  const fundWallet = async (amount: number, description?: string): Promise<boolean> => {
    try {
      dispatch({ type: WalletActionTypes.FUND_WALLET_START });
      
      await walletService.fundWallet({ 
        amount, 
        description: description || `Deposit of $${amount}`
      });
      
      // Refresh wallet to get updated balance
      const balanceResponse = await walletService.getBalance();
      
      dispatch({ 
        type: WalletActionTypes.FUND_WALLET_SUCCESS, 
        payload: { balance: balanceResponse.data.balance }
      });
      
      return true;
    } catch (err: any) {
      dispatch({ 
        type: WalletActionTypes.FUND_WALLET_ERROR, 
        payload: err.response?.data?.message || 'Failed to fund wallet'
      });
      return false;
    }
  };

  const withdraw = async (amount: number, description?: string): Promise<boolean> => {
    try {
      dispatch({ type: WalletActionTypes.WITHDRAW_START });
      
      await walletService.withdraw({ 
        amount, 
        description: description || `Withdrawal of $${amount}`
      });
      
      // Refresh wallet to get updated balance
      const balanceResponse = await walletService.getBalance();
      
      dispatch({ 
        type: WalletActionTypes.WITHDRAW_SUCCESS, 
        payload: { balance: balanceResponse.data.balance }
      });
      
      return true;
    } catch (err: any) {
      dispatch({ 
        type: WalletActionTypes.WITHDRAW_ERROR, 
        payload: err.response?.data?.message || 'Failed to withdraw from wallet'
      });
      return false;
    }
  };

  const transfer = async (recipient: string, amount: number, description?: string): Promise<boolean> => {
    try {
      dispatch({ type: WalletActionTypes.TRANSFER_START });
      
      await walletService.transfer({ 
        recipient, 
        amount, 
        description: description || `Transfer of $${amount}`
      });
      
      // Refresh wallet to get updated balance
      const balanceResponse = await walletService.getBalance();
      
      dispatch({ 
        type: WalletActionTypes.TRANSFER_SUCCESS, 
        payload: { balance: balanceResponse.data.balance }
      });
      
      return true;
    } catch (err: any) {
      dispatch({ 
        type: WalletActionTypes.TRANSFER_ERROR, 
        payload: err.response?.data?.message || 'Failed to transfer funds'
      });
      return false;
    }
  };

  const freezeWallet = async (): Promise<boolean> => {
    try {
      dispatch({ type: WalletActionTypes.FREEZE_WALLET_START });
      
      await walletService.freezeWallet();
      
      dispatch({ type: WalletActionTypes.FREEZE_WALLET_SUCCESS });
      
      return true;
    } catch (err: any) {
      dispatch({ 
        type: WalletActionTypes.FREEZE_WALLET_ERROR, 
        payload: err.response?.data?.message || 'Failed to freeze wallet'
      });
      return false;
    }
  };

  const unfreezeWallet = async (): Promise<boolean> => {
    try {
      dispatch({ type: WalletActionTypes.UNFREEZE_WALLET_START });
      
      await walletService.unfreezeWallet();
      
      dispatch({ type: WalletActionTypes.UNFREEZE_WALLET_SUCCESS });
      
      return true;
    } catch (err: any) {
      dispatch({ 
        type: WalletActionTypes.UNFREEZE_WALLET_ERROR, 
        payload: err.response?.data?.message || 'Failed to unfreeze wallet'
      });
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: WalletActionTypes.CLEAR_ERROR });
  };

  // Initialize wallet on mount
  useEffect(() => {
    refreshWallet();
  }, []);

  const value = {
    state,
    dispatch,
    refreshWallet,
    fundWallet,
    withdraw,
    transfer,
    freezeWallet,
    unfreezeWallet,
    clearError
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};