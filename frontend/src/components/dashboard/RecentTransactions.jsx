// RecentTransactions.jsx
import React, { useState, useEffect } from 'react';

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch transaction data
    const fetchTransactions = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const mockTransactions = [
          { 
            id: 1, 
            type: 'buy', 
            symbol: 'AAPL', 
            name: 'Apple Inc.', 
            shares: 10, 
            price: 185.92, 
            total: 1859.20, 
            date: '2025-04-14T09:32:46Z',
            status: 'completed'
          },
          { 
            id: 2, 
            type: 'sell', 
            symbol: 'NFLX', 
            name: 'Netflix Inc.', 
            shares: 5, 
            price: 624.38, 
            total: 3121.90, 
            date: '2025-04-13T14:21:15Z',
            status: 'completed'
          },
          { 
            id: 3, 
            type: 'buy', 
            symbol: 'MSFT', 
            name: 'Microsoft Corp.', 
            shares: 8, 
            price: 416.75, 
            total: 3334.00, 
            date: '2025-04-12T10:45:33Z',
            status: 'completed'
          },
          { 
            id: 4, 
            type: 'buy', 
            symbol: 'NVDA', 
            name: 'NVIDIA Corp.', 
            shares: 3, 
            price: 931.26, 
            total: 2793.78, 
            date: '2025-04-10T11:17:52Z',
            status: 'completed'
          },
          { 
            id: 5, 
            type: 'sell', 
            symbol: 'AMZN', 
            name: 'Amazon.com Inc.', 
            shares: 12, 
            price: 176.32, 
            total: 2115.84, 
            date: '2025-04-08T15:38:22Z',
            status: 'completed'
          }
        ];
        
        setTransactions(mockTransactions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Recent Transactions</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No recent transactions found</p>
            </div>
          ) : (
            <div className="bg-white overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'buy' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'buy' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{transaction.symbol} - {transaction.name}</p>
                          <p className="text-xs text-gray-500">
                            {transaction.type === 'buy' ? 'Bought' : 'Sold'} {transaction.shares} {transaction.shares === 1 ? 'share' : 'shares'} @ ${transaction.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">${transaction.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t border-gray-100">
                <button className="w-full py-2 px-4 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  View All Transactions
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;