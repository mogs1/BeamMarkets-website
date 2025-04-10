export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  FREEZING = 'freezing',
  UNFREEZING = 'unfreezing',
  PND_AMOUNT = 'pnd_amount',
  PLACE_LIEN = 'place_lien',
  COLLATERAL = 'collateral',
  LIQUIDATION = 'liquidation',
  STOCK_INVESTMENT = 'stock_investment',
  AWAITING_APPROVAL = 'awaiting_approval'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  APPROVED = 'approved',
  LIQUIDATED = 'liquidated',
  AWAITING_APPROVAL = 'awaiting_approval'
}

export interface Transaction {
  _id: string;
  transactionId: string;
  user: string;
  wallet: string;
  recipient?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
  message: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  message: string;
}

export interface FundWalletRequest {
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
}

export interface TransferRequest {
  recipient: string;
  amount: number;
  description?: string;
}