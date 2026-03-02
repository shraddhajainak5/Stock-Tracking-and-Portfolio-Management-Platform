// src/components/common/StockTicker.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StockTicker = () => {
  const [tickerData, setTickerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        // Replace with your actual API key
        const FINNHUB_API_KEY = 'd0023phr01qud9qlbgt0d0023phr01qud9qlbgtg';
        
        // Symbols to display in the ticker
        const symbols = ['BTC-USD', 'ETH-USD', 'EUR/USD', 'GBP/USD', 'AAPL', 'MSFT', 'AMZN'];
        
        const responses = await Promise.all(
          symbols.map(symbol => 
            axios.get(`https://finnhub.io/api/v1/quote`, {
              params: { symbol, token: FINNHUB_API_KEY }
            })
          )
        );
        
        const formattedData = symbols.map((symbol, index) => {
          const quote = responses[index].data;
          return {
            symbol,
            price: quote.c,
            change: quote.c - quote.pc,
            percentChange: ((quote.c - quote.pc) / quote.pc) * 100
          };
        });
        
        setTickerData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
        
        // Fallback mock data based on the screenshot
        const mockData = [
          { symbol: 'BTC-USD', price: 84492.52, change: 862.74, percentChange: 1.03 },
          { symbol: 'ETH-USD', price: 1588.08, change: -1, percentChange: -0.04 },
          { symbol: 'EUR/USD', price: 1.1399, change: 0.012, percentChange: 1.04 },
          { symbol: 'GBP/USD', price: 1.3247, change: 0.0015, percentChange: 0.11 },
          { symbol: 'AAPL', price: 194.85, change: -7.29, percentChange: -3.61 },
          { symbol: 'MSFT', price: 371.95, change: -13.78, percentChange: -3.57 },
          { symbol: 'AMZN', price: 174.00, change: -5.18, percentChange: -2.88 }
        ];
        
        setTickerData(mockData);
        setLoading(false);
      }
    };
    
    fetchTickerData();
    
    // Set up interval to refresh data every minute
    const intervalId = setInterval(fetchTickerData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (loading) {
    return <div className="stock-ticker-placeholder"></div>;
  }
  
  return (
    <div className="stock-ticker-container bg-dark text-white py-2">
      <div className="ticker-wrap">
        <div className="ticker">
          {tickerData.map((item, index) => (
            <div key={index} className="ticker-item d-inline-block mx-4">
              <span className="ticker-symbol me-2">{item.symbol}</span>
              <span className="ticker-price me-2">{item.price.toFixed(2)}</span>
              <span className={`ticker-change ${item.percentChange >= 0 ? 'text-success' : 'text-danger'}`}>
                <i className={`bi bi-arrow-${item.percentChange >= 0 ? 'up' : 'down'} me-1`}></i>
                {item.percentChange >= 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                ({item.change >= 0 ? '+' : ''}{Math.abs(item.change).toFixed(item.change < 1 ? 3 : 2)})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockTicker;