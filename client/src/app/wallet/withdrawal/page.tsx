'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const Withdrawal: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's bank accounts
        const accountsRes = await axios.get('/api/bank-accounts');
        setBankAccounts(accountsRes.data.bankAccounts);
        
        if (accountsRes.data.bankAccounts.length > 0) {
          setSelectedBankId(accountsRes.data.bankAccounts[0].id);
        }
        
        // Fetch wallet balance
        const balanceRes = await axios.get('/api/wallet/balance');
        setBalance(balanceRes.data.balance);
        
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!selectedBankId) {
      toast.error('Please select a bank account');
      return;
    }
    
    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > balance) {
      toast.error('Insufficient funds');
      return;
    }
    
    try {
      setIsLoading(true);
      
      await axios.post('/api/wallet/withdraw', {
        amount: withdrawalAmount,
        bankAccountId: selectedBankId
      });
      
      toast.success('Withdrawal initiated successfully');
      router.push('/wallet');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process withdrawal');
      console.error('Error processing withdrawal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankAccount = () => {
    router.push('/wallet/add-bank-account');
  };

  const handleClose = () => {
    router.push('/wallet');
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Withdraw Funds</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleWithdraw}>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Available Balance</label>
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-xl font-semibold">₦{balance.toLocaleString()}.00</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Amount to Withdraw</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Select Bank Account</label>
            {bankAccounts.length > 0 ? (
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div 
                    key={account.id}
                    className={`border rounded-md p-4 cursor-pointer ${selectedBankId === account.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}`}
                    onClick={() => setSelectedBankId(account.id)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{account.bankName}</p>
                        <p className="text-sm text-gray-600">{account.accountNumber}</p>
                        <p className="text-sm text-gray-600">{account.accountName}</p>
                      </div>
                      <input
                        type="radio"
                        name="bankAccount"
                        checked={selectedBankId === account.id}
                        onChange={() => setSelectedBankId(account.id)}
                        className="h-4 w-4 text-yellow-500 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-md">
                <p className="mb-2">No bank accounts found</p>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleAddBankAccount}
              className="mt-4 w-full border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
            >
              + Add New Bank Account
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedBankId || !amount}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-md font-medium disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdrawal;