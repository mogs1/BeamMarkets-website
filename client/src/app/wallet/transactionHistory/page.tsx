'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions');
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'approved') return transaction.status === 'Approved';
    if (filter === 'pending') return transaction.status === 'Pending';
    if (filter === 'liquidated') return transaction.status === 'Liquidated';
    return true; // 'all' filter
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-md text-sm ${filter === 'all' ? 'bg-gray-200' : 'bg-white border border-gray-300'}`}
          >
            3 years
          </button>
          <button 
            onClick={() => handleFilterChange('approved')}
            className={`px-4 py-2 rounded-md text-sm ${filter === 'approved' ? 'bg-gray-200' : 'bg-white border border-gray-300'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => handleFilterChange('pending')}
            className={`px-4 py-2 rounded-md text-sm ${filter === 'pending' ? 'bg-gray-200' : 'bg-white border border-gray-300'}`}
          >
            Pending
          </button>
          <button 
            className="px-4 py-2 rounded-md text-sm bg-white border border-gray-300"
          >
            History
          </button>
        </div>
        <div className="flex items-center">
          <span className="mr-2">Filter by</span>
          <select className="border border-gray-300 rounded-md p-2">
            <option>Spot</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left">Transaction ID</th>
              <th className="py-3 text-left">Transaction Type</th>
              <th className="py-3 text-left">Amount (₦)</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-left">Date</th>
              <th className="py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b">
                <td className="py-4">{transaction.id}</td>
                <td className="py-4">{transaction.type}</td>
                <td className="py-4">₦{transaction.amount.toLocaleString()}.00</td>
                <td className="py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'Liquidated' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status === 'Approved' && <span className="w-2 h-2 mr-1 rounded-full bg-green-500"></span>}
                    {transaction.status === 'Liquidated' && <span className="w-2 h-2 mr-1 rounded-full bg-yellow-500"></span>}
                    {transaction.status === 'Pending' && <span className="w-2 h-2 mr-1 rounded-full bg-gray-500"></span>}
                    {transaction.status}
                  </span>
                </td>
                <td className="py-4">{transaction.date}</td>
                <td className="py-4">
                  <button className="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <span>Page {currentPage} of {totalPages || 1}</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            const pagesToShow = 5;
            const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
            const page = startPage + i;
            if (page > totalPages) return null;
            
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-yellow-500 text-white' : 'border'}`}
              >
                {page}
              </button>
            );
          })}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;