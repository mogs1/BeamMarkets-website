// src/services/wallet.service.ts
import mongoose from 'mongoose';
import  { IWallet, Wallet } from '../models/wallet.model';
import Transaction, { ITransaction, TransactionStatus, TransactionType } from '../models/transaction.model';
import { generateTransactionId } from '../utils/transactionUtils';

export class WalletService {
  // Get wallet by user ID
  async getWalletByUserId(userId: string): Promise<IWallet | null> {
    try {
      return await Wallet.findOne({ user: userId });
    } catch (error) {
      throw error;
    }
  }

  // Create wallet for a user
  async createWallet(userId: string): Promise<IWallet> {
    try {
      const newWallet = new Wallet({
        user: userId,
        balance: 0,
        pendingAmount: 0,
        isFrozen: false
      });
      
      return await newWallet.save();
    } catch (error) {
      throw error;
    }
  }

  // Get wallet balance
  async getWalletBalance(userId: string): Promise<number> {
    try {
      const wallet = await this.getWalletByUserId(userId);
      return wallet ? wallet.balance : 0;
    } catch (error) {
      throw error;
    }
  }

  // Get pending amount
  async getPendingAmount(userId: string): Promise<number> {
    try {
      const wallet = await this.getWalletByUserId(userId);
      return wallet ? wallet.pendingAmount : 0;
    } catch (error) {
      throw error;
    }
  }

  // Fund wallet
  async fundWallet(userId: string, amount: number, paymentMethod: string): Promise<ITransaction> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ user: userId }).session(session);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      if (wallet.isFrozen) {
        throw new Error('Wallet is frozen');
      }

      // Create a transaction record
      const transaction = new Transaction({
        transactionId: generateTransactionId(),
        user: userId,
        wallet: wallet._id,
        amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.APPROVED, // Assuming direct approval for simplicity
        description: `Wallet funded via ${paymentMethod}`,
        metadata: { paymentMethod }
      });

      await transaction.save({ session });

      // Update wallet balance
      wallet.balance += amount;
      await wallet.save({ session });

      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Withdraw from wallet
  async withdrawFromWallet(userId: string, amount: number, bankAccountId: string): Promise<ITransaction> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ user: userId }).session(session);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      if (wallet.isFrozen) {
        throw new Error('Wallet is frozen');
      }
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Create a transaction record
      const transaction = new Transaction({
        transactionId: generateTransactionId(),
        user: userId,
        wallet: wallet._id,
        amount,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING, // Usually pending until processed by payment provider
        description: 'Withdrawal to bank account',
        metadata: { bankAccountId }
      });

      await transaction.save({ session });

      // Update wallet balance
      wallet.balance -= amount;
      wallet.pendingAmount += amount; // Move to pending until confirmed
      await wallet.save({ session });

      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Transfer to another user
  async transferFunds(
    senderId: string, 
    recipientEmail: string, 
    amount: number, 
    note: string
  ): Promise<ITransaction> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get sender's wallet
      const senderWallet = await Wallet.findOne({ user: senderId }).session(session);
      
      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }
      
      if (senderWallet.isFrozen) {
        throw new Error('Sender wallet is frozen');
      }
      
      if (senderWallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Find recipient by email
      const User = mongoose.model('User');
      const recipient = await User.findOne({ email: recipientEmail });
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }
      
      // Get or create recipient's wallet
      let recipientWallet = await Wallet.findOne({ user: recipient._id }).session(session);
      
      if (!recipientWallet) {
        recipientWallet = new Wallet({
          user: recipient._id,
          balance: 0,
          pendingAmount: 0,
          isFrozen: false
        });
      }
      
      if (recipientWallet.isFrozen) {
        throw new Error('Recipient wallet is frozen');
      }

      // Create a transaction record
      const transaction = new Transaction({
        transactionId: generateTransactionId(),
        user: senderId,
        wallet: senderWallet._id,
        recipient: recipient._id,
        amount,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        description: note || 'Transfer to another user',
        metadata: { recipientEmail }
      });

      await transaction.save({ session });

      // Update sender's wallet balance
      senderWallet.balance -= amount;
      await senderWallet.save({ session });

      // Update recipient's wallet balance
      recipientWallet.balance += amount;
      await recipientWallet.save({ session });

      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Freeze wallet
  async freezeWallet(userId: string): Promise<IWallet> {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      wallet.isFrozen = true;
      await wallet.save();
      
      // Create a transaction record for the freeze
      await Transaction.create({
        transactionId: generateTransactionId(),
        user: userId,
        wallet: wallet._id,
        amount: 0,
        type: TransactionType.FREEZING,
        status: TransactionStatus.COMPLETED,
        description: 'Wallet frozen'
      });
      
      return wallet;
    } catch (error) {
      throw error;
    }
  }

  // Unfreeze wallet
  async unfreezeWallet(userId: string): Promise<IWallet> {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      wallet.isFrozen = false;
      await wallet.save();
      
      // Create a transaction record for the unfreeze
      await Transaction.create({
        transactionId: generateTransactionId(),
        user: userId,
        wallet: wallet._id,
        amount: 0,
        type: TransactionType.UNFREEZING,
        status: TransactionStatus.COMPLETED,
        description: 'Wallet unfrozen'
      });
      
      return wallet;
    } catch (error) {
      throw error;
    }
  }
}

export default new WalletService();