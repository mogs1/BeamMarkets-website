// src/routes/wallet.routes.ts
import express from 'express';
import walletController, { walletValidation } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all wallet routes
router.use(authMiddleware);

// Get wallet balance
router.get('/balance', walletController.getBalance);

// Get pending amount
router.get('/pending', walletController.getPendingAmount);

// Fund wallet
router.post('/fund', walletValidation.fundWallet, walletController.fundWallet);

// Withdraw from wallet
router.post('/withdraw', walletValidation.withdraw, walletController.withdraw);

// Transfer funds
router.post('/transfer', walletValidation.transfer, walletController.transfer);

// Freeze wallet
router.post('/freeze', walletController.freezeWallet);

// Unfreeze wallet
router.post('/unfreeze', walletController.unfreezeWallet);

export default router;