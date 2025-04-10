'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-toastify';
import TransactionHistory from './transactionHistory/page';
import sideMenu from '../../../public/assets/sideMenu.png'

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter()

  useEffect(() => {
    // Fetch wallet balance
    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        const balanceRes = await axios.get('/api/wallet/balance');
        setBalance(balanceRes.data.balance);
        
        const pendingRes = await axios.get('/api/wallet/pending');
        setPendingAmount(pendingRes.data.pendingAmount);
        
        const bankRes = await axios.get('/api/wallet/bank-details');
        setBankDetails(bankRes.data.bankDetails || 'Wema Bank 010 210 2020');
        
        const transactionsRes = await axios.get('/api/transactions');
        setTransactions(transactionsRes.data.transactions);
        
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Failed to fetch wallet data');
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchWalletData();
  }, []);

  const handleAddFunds = () => {
    router.push('/wallet/fund');
  };

  const handleWithdrawal = () => {
    router.push('/wallet/withdrawal');
  };

  const handleFreezeWallet = async () => {
    try {
      await axios.post('/api/wallet/freeze');
      toast.success('Wallet frozen successfully');
    } catch (error) {
      toast.error('Failed to freeze wallet');
      console.error('Error freezing wallet:', error);
    }
  };

  const handlePNDAmount = () => {
    router.push('/wallet/pnd-amount');
  };

  const handlePlaceLien = () => {
    router.push('/wallet/place-lien');
  };

  return (
    <div className='flex'>
    <Image 
      src={sideMenu}
      alt='side-menu-image'
      className='h-screen'
      />
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Wallet</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <p className="text-gray-600">Actual Balance</p>
            <h2 className="text-3xl font-bold">₦{balance.toLocaleString()}.00</h2>
            <div className="flex items-center mt-4">
              <div className="flex items-center">
                <span className="icon-bank mr-2">🏦</span>
                <span className="text-sm">{bankDetails}</span>
              </div>
              <button className="ml-2" title="Copy">
                <span className="icon-copy">📋</span>
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-gray-600">Pending Amount</p>
            <h2 className="text-3xl font-bold">₦{pendingAmount.toLocaleString()}.00</h2>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={handleAddFunds}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-md cursor-pointer font-medium w-full"
            >
              Add Funds
            </button>
            <button
              onClick={handleWithdrawal}
              className="bg-gray-200 hover:bg-gray-300 text-black py-2 px-4 rounded-md cursor-pointer font-medium w-full"
            >
              Withdrawal
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              onClick={handlePNDAmount}
              className="bg-white border border-gray-300 text-black py-2 px-2 rounded-md text-sm w-full"
            >
              PND Amount
            </button>
            <button
              onClick={handlePlaceLien}
              className="bg-white border border-gray-300 text-black py-2 px-2 rounded-md text-sm w-full"
            >
              Place Lien
            </button>
            <button
              onClick={handleFreezeWallet}
              className="bg-white border border-gray-300 text-black py-2 px-2 rounded-md text-sm w-full"
            >
              Freeze Wallet
            </button>
          </div>
        </div>
        
        <div className="col-span-2">
          <TransactionHistory />
        </div>
      </div>
    </div>
    </div>
  );
};

export default Wallet;