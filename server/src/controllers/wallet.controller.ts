// src/controllers/wallet.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import walletService from '../services/wallet.service';
import transactionService from '../services/transaction.service';
import { body, validationResult } from 'express-validator';

export const walletValidation = {
  fundWallet: [
    body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required')
  ],
  withdraw: [
    body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
    body('bankAccountId').notEmpty().withMessage('Bank account ID is required')
  ],
  transfer: [
    body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
    body('recipientEmail').isEmail().withMessage('Valid recipient email is required'),
    body('note').optional()
  ]
};

export class WalletController {
  // Get wallet balance
  async getBalance(req: AuthRequest, res: Response) {
    try {
      const userId = (req.user as { id: string }).id;
      const balance = await walletService.getWalletBalance(userId);
      
      res.status(200).json({
        success: true,
        balance
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while fetching balance'
      });
    }
  }

  // Get pending amount
  async getPendingAmount(req: AuthRequest, res: Response) {
    try {
      const userId = (req.user as { id: string }).id;
      const pendingAmount = await walletService.getPendingAmount(userId);
      
      res.status(200).json({
        success: true,
        pendingAmount
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while fetching pending amount'
      });
    }
  }

  // Fund wallet
  async fundWallet(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    try {
      const userId = (req.user as { id: string }).id;
      const { amount, paymentMethod } = req.body;
      
      const transaction = await walletService.fundWallet(userId, parseFloat(amount), paymentMethod);
      
      res.status(200).json({
        success: true,
        message: 'Wallet funded successfully',
        transaction
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while funding wallet'
      });
    }
  }

  // Withdraw from wallet
  async withdraw(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    try {
      const userId = (req.user as { id: string }).id;
      const { amount, bankAccountId } = req.body;
      
      const transaction = await walletService.withdrawFromWallet(userId, parseFloat(amount), bankAccountId);
      
      res.status(200).json({
        success: true,
        message: 'Withdrawal initiated successfully',
        transaction
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while processing withdrawal'
      });
    }
  }

  // Transfer funds
  async transfer(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    try {
      const userId = (req.user as { id: string }).id;
      const { amount, recipientEmail, note } = req.body;
      
      const transaction = await walletService.transferFunds(
        userId,
        recipientEmail,
        parseFloat(amount),
        note || ''
      );
      
      res.status(200).json({
        success: true,
        message: 'Transfer completed successfully',
        transaction
      });
      return
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while processing transfer'
      });
      return
    }
  }

  // Freeze wallet
  async freezeWallet(req: AuthRequest, res: Response) {
    try {
      const userId = (req.user as { id: string }).id;
      const wallet = await walletService.freezeWallet(userId);
      
      res.status(200).json({
        success: true,
        message: 'Wallet frozen successfully',
        wallet
      });
      return
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while freezing wallet'
      });
      return
    }
  }

  // Unfreeze wallet
  async unfreezeWallet(req: AuthRequest, res: Response) {
    try {
      const userId = (req.user as { id: string }).id;
      const wallet = await walletService.unfreezeWallet(userId);
      
      res.status(200).json({
        success: true,
        message: 'Wallet unfrozen successfully',
        wallet
      });
      return
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while unfreezing wallet'
      });
      return
    }
  }
}

export default new WalletController();