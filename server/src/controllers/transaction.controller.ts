// src/controllers/transaction.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import transactionService from '../services/transaction.service';
import { query, param } from 'express-validator';

export const transactionValidation = {
  getTransactions: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isString().withMessage('Status must be a string')
  ],
  getTransaction: [
    param('id').notEmpty().withMessage('Transaction ID is required')
  ]
};

export class TransactionController {
  // Get user transactions
  async getUserTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = (req.user as { id: string }).id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as any;
      
      const result = await transactionService.getUserTransactions(userId, page, limit, status);
      
       res.status(200).json({
        success: true,
        ...result
      });
      return
    } catch (error: any) {
       res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while fetching transactions'
      });
      return
    }
  }

  // Get transaction by ID
  async getTransactionById(req: AuthRequest, res: Response) {
    try {
      const userId = (req.user as { id: string }).id;
      const transactionId = req.params.id;
      
      const transaction = await transactionService.getTransactionById(transactionId);
      
      if (!transaction) {
         res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return;
      }
      
      // Check if the transaction belongs to the user
      if (transaction.user !== userId && transaction.recipient?.toString() !== userId) {
         res.status(403).json({
          success: false,
          message: 'Unauthorized to access this transaction'
        });
        return;
      }
      
       res.status(200).json({
        success: true,
        transaction
      });
      return
    } catch (error: any) {
       res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while fetching transaction'
      });
      return
    }
  }
}

export default new TransactionController();