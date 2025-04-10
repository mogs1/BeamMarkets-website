import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IWallet extends Document {
  user: IUser['_id'];
  balance: number;
  pendingAmount: number;
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    isFrozen: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Wallet =  mongoose.model<IWallet>('Wallet', WalletSchema);