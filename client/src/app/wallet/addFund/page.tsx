'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddFunds: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const router = useRouter();

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method === 'card') {
      setShowCardDetails(true);
    } else {
      setShowCardDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      toast.error('Please fill in all card details');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const payload = {
        amount: parseFloat(amount),
        paymentMethod,
        ...(paymentMethod === 'card' && {
          cardDetails: {
            cardNumber,
            expiryDate,
            cvv
          }
        })
      };
      
      await axios.post('/api/wallet/fund', payload);
      
      toast.success('Funds added successfully');
      router.push('/wallet');
    } catch (error) {
      toast.error('Failed to add funds');
      console.error('Error adding funds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/wallet');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Payment Option</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Amount to Fund</label>
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
            <label className="block mb-2 text-sm font-medium">Select Payment Method</label>
            
            <div className="border border-gray-300 rounded-md mb-4">
              <div 
                className={`flex items-center p-4 cursor-pointer ${paymentMethod === 'bank' ? 'bg-gray-50' : ''}`}
                onClick={() => handlePaymentMethodChange('bank')}
              >
                <div className="flex-shrink-0 mr-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bank'}
                    onChange={() => handlePaymentMethodChange('bank')}
                    className="h-4 w-4 text-yellow-500"
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🏦</span>
                  <span>Bank Transfer</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-md mb-4">
              <div 
                className={`flex items-center p-4 cursor-pointer ${paymentMethod === 'card' ? 'bg-gray-50 border-2 border-yellow-500' : ''}`}
                onClick={() => handlePaymentMethodChange('card')}
              >
                <div className="flex-shrink-0 mr-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => handlePaymentMethodChange('card')}
                    className="h-4 w-4 text-yellow-500"
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💳</span>
                  <span>Add Debit/Credit Card</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-md">
              <div 
                className={`flex items-center p-4 cursor-pointer ${paymentMethod === 'other' ? 'bg-gray-50' : ''}`}
                onClick={() => handlePaymentMethodChange('other')}
              >
                <div className="flex-shrink-0 mr-4">
                  <span className="text-xl">+</span>
                </div>
                <span>Add Payment Method</span>
              </div>
            </div>
          </div>

          {showCardDetails && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Card Details</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="Card Number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    maxLength={16}
                    required={paymentMethod === 'card'}
                  />
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                    <div className="flex">
                      <span className="mx-1">💳</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setExpiryDate(value);
                    }}
                    placeholder="MM/YY"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    maxLength={5}
                    required={paymentMethod === 'card'}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="CVV"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    maxLength={3}
                    required={paymentMethod === 'card'}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-md font-medium"
          >
            {paymentMethod === 'card' ? 'Pay Now' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFunds;