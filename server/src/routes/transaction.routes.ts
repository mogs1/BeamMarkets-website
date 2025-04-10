// src/routes/transaction.routes.ts
import express from 'express';
import transactionController, { transactionValidation } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all transaction routes
router.use(authMiddleware);

// Get user transactions
router.get('/', transactionValidation.getTransactions, transactionController.getUserTransactions);

// Get transaction by ID
router.get('/:id', transactionValidation.getTransaction, transactionController.getTransactionById);

export default router;