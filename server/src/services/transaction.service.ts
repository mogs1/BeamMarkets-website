// src/services/transaction.service.ts
import mongoose from 'mongoose';
import Transaction, { ITransaction, TransactionStatus } from '../models/transaction.model';
import { Wallet } from '../models/wallet.model';

export class TransactionService {
  // Get all transactions for a user
  async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: TransactionStatus
  ): Promise<{ transactions: ITransaction[], total: number, pages: number }> {
    try {
      const query: any = { user: userId };
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('recipient', 'fullName email');
      
      const total = await Transaction.countDocuments(query);
      const pages = Math.ceil(total / limit);
      
      return { transactions, total, pages };
    } catch (error) {
      throw error;
    }
  }

  // Get transaction by ID
  async getTransactionById(transactionId: string): Promise<ITransaction | null> {
    try {
      return await Transaction.findOne({ transactionId })
        .populate('user', 'fullName email')
        .populate('recipient', 'fullName email');
    } catch (error) {
      throw error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus
  ): Promise<ITransaction | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = await Transaction.findOne({ transactionId }).session(session);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      const previousStatus = transaction.status;
      transaction.status = status;
      await transaction.save({ session });
      
      // Handle balance updates based on status change
      if (status === TransactionStatus.COMPLETED && previousStatus === TransactionStatus.PENDING) {
        if (transaction.type === 'withdrawal') {
          // Confirm withdrawal - move from pending to completed
          const wallet = await Wallet.findById(transaction.wallet).session(session);
          if (wallet) {
            wallet.pendingAmount -= transaction.amount;
            await wallet.save({ session });
          }
        }
      } else if (status === TransactionStatus.FAILED && previousStatus === TransactionStatus.PENDING) {
        if (transaction.type === 'withdrawal') {
          // Failed withdrawal - refund the amount back to balance
          const wallet = await Wallet.findById(transaction.wallet).session(session);
          if (wallet) {
            wallet.pendingAmount -= transaction.amount;
            wallet.balance += transaction.amount;
            await wallet.save({ session });
          }
        }
      }
      
      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new TransactionService();