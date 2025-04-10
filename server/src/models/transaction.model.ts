// src/models/transaction.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IWallet } from './wallet.model';

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

export interface ITransaction extends Document {
  transactionId: string;
  user: IUser['_id'];
  wallet: IWallet['_id'];
  recipient?: IUser['_id'];
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING
    },
    description: {
      type: String,
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);