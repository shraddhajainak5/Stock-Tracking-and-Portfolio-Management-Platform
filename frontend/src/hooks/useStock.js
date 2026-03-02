// src/hooks/useStock.js
import { useState, useCallback,useEffect } from 'react';
import axios from 'axios';

const useStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketSummary, setMarketSummary] = useState(null);
  const [topStocks, setTopStocks] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [canRefresh, setCanRefresh] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  // API configuration
  const FINNHUB_API_KEY = 'd0023phr01qud9qlbgt0d0023phr01qud9qlbgtg'; // Replace with your actual API key
  const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

 // Update in useStock.js - fetchMarketSummary function
//  const fetchMarketSummary = useCallback(async () => {
//   setLoading(true);
//   setError(null);
  
//   try {
//     console.log('Fetching market summary data...');
    
//     // Fetch data for major indices - S&P 500 (^GSPC), NASDAQ (^IXIC), and Dow Jones (^DJI)
//     let sp500Response, nasdaqResponse, dowResponse;
    
//     try {
//       sp500Response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
//         params: { symbol: '^GSPC', token: FINNHUB_API_KEY }
//       });
//       console.log('S&P 500 data:', sp500Response.data);
//     } catch (error) {
//       console.error('Error fetching S&P 500 data:', error);
//       throw new Error(`S&P 500 data fetch failed: ${error.message}`);
//     }
    
//     try {
//       nasdaqResponse = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
//         params: { symbol: '^IXIC', token: FINNHUB_API_KEY }
//       });
//       console.log('NASDAQ data:', nasdaqResponse.data);
//     } catch (error) {
//       console.error('Error fetching NASDAQ data:', error);
//       throw new Error(`NASDAQ data fetch failed: ${error.message}`);
//     }
    
//     try {
//       dowResponse = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
//         params: { symbol: '^DJI', token: FINNHUB_API_KEY }
//       });
//       console.log('Dow Jones data:', dowResponse.data);
//     } catch (error) {
//       console.error('Error fetching Dow Jones data:', error);
//       throw new Error(`Dow Jones data fetch failed: ${error.message}`);
//     }
    
//     // Generate chart data for the last 5 days (simplified mock for this example)
//     const chartData = [
//       { name: 'Mon', SP500: 5200, NASDAQ: 16300, DOW: 39000 },
//       { name: 'Tue', SP500: 5180, NASDAQ: 16200, DOW: 38900 },
//       { name: 'Wed', SP500: 5210, NASDAQ: 16350, DOW: 38950 },
//       { name: 'Thu', SP500: 5220, NASDAQ: 16380, DOW: 38930 },
//       { name: 'Fri', SP500: sp500Response.data.c, NASDAQ: nasdaqResponse.data.c, DOW: dowResponse.data.c }
//     ];
    
//     // Format the data
//     const formattedSummary = {
//       indices: {
//         SP500: { 
//           price: sp500Response.data.c, 
//           change: sp500Response.data.c - sp500Response.data.pc,
//           percentChange: ((sp500Response.data.c - sp500Response.data.pc) / sp500Response.data.pc) * 100
//         },
//         NASDAQ: { 
//           price: nasdaqResponse.data.c, 
//           change: nasdaqResponse.data.c - nasdaqResponse.data.pc,
//           percentChange: ((nasdaqResponse.data.c - nasdaqResponse.data.pc) / nasdaqResponse.data.pc) * 100
//         },
//         DOW: { 
//           price: dowResponse.data.c, 
//           change: dowResponse.data.c - dowResponse.data.pc,
//           percentChange: ((dowResponse.data.c - dowResponse.data.pc) / dowResponse.data.pc) * 100
//         }
//       },
//       chartData,
//       lastUpdated: new Date().toLocaleString()
//     };
    
//     console.log('Market summary formatted:', formattedSummary);
//     setMarketSummary(formattedSummary);
//     setLastUpdated(new Date()); // Add this state variable with useState
//     setLoading(false);
//     return formattedSummary;
//   } catch (error) {
//     console.error('Error fetching market summary:', error);
//     setError('Failed to fetch market summary: ' + error.message + '. Using fallback data.');
    
//     // Use fallback data for development/testing
//     const fallbackData = {
//       indices: {
//         SP500: { price: 5235.48, change: 15.23, percentChange: 0.29 },
//         NASDAQ: { price: 16421.28, change: 85.42, percentChange: 0.52 },
//         DOW: { price: 38976.08, change: -32.45, percentChange: -0.08 }
//       },
//       chartData: [
//         { name: 'Mon', SP500: 5200, NASDAQ: 16300, DOW: 39000 },
//         { name: 'Tue', SP500: 5180, NASDAQ: 16200, DOW: 38900 },
//         { name: 'Wed', SP500: 5210, NASDAQ: 16350, DOW: 38950 },
//         { name: 'Thu', SP500: 5220, NASDAQ: 16380, DOW: 38930 },
//         { name: 'Fri', SP500: 5235.48, NASDAQ: 16421.28, DOW: 38976.08 }
//       ],
//       lastUpdated: new Date().toLocaleString()
//     };
    
//     console.log('Using fallback market summary data');
//     setMarketSummary(fallbackData);
//     setLastUpdated(new Date()); // Add this state variable with useState
//     setLoading(false);
//     return fallbackData;
//   }
// }, [FINNHUB_API_KEY]);// Updated fetchTopStocks function in useStock.js
// First, update your fetchMarketSummary function to bypass the API calls
const fetchMarketSummary = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching market summary data...');
    
    // For development, skip API calls due to CORS issues
    console.log('Using mock data to avoid CORS issues');
    
    // Use fallback data
    const fallbackData = {
      indices: {
        SP500: { price: 5235.48, change: 15.23, percentChange: 0.29 },
        NASDAQ: { price: 16421.28, change: 85.42, percentChange: 0.52 },
        DOW: { price: 38976.08, change: -32.45, percentChange: -0.08 }
      },
      chartData: [
        { name: 'Mon', SP500: 5200, NASDAQ: 16300, DOW: 39000 },
        { name: 'Tue', SP500: 5180, NASDAQ: 16200, DOW: 38900 },
        { name: 'Wed', SP500: 5210, NASDAQ: 16350, DOW: 38950 },
        { name: 'Thu', SP500: 5220, NASDAQ: 16380, DOW: 38930 },
        { name: 'Fri', SP500: 5235.48, NASDAQ: 16421.28, DOW: 38976.08 }
      ],
      lastUpdated: new Date().toLocaleString()
    };
    
    console.log('Market summary formatted:', fallbackData);
    setMarketSummary(fallbackData);
    setLastUpdated(new Date());
    setLoading(false);
    return fallbackData;
  } catch (error) {
    console.error('Error in fetchMarketSummary:', error);
    setError('Failed to fetch market summary: ' + error.message);
    setLoading(false);
    return null;
  }
}, []);

// Add this useEffect after your existing useEffect hooks
useEffect(() => {
  // Initial fetch when component mounts
  fetchMarketSummary();
  
  // Set up timer for fetching every 5 minutes (300000 milliseconds)
  const fetchInterval = setInterval(() => {
    console.log("Scheduled 5-minute refresh triggered");
    fetchMarketSummary();
  }, 5 * 60 * 1000);
  
  // Clean up interval on component unmount
  return () => clearInterval(fetchInterval);
}, [fetchMarketSummary]);

// Add this useEffect after the 5-minute interval useEffect
useEffect(() => {
  if (!canRefresh) {
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const nextRefresh = new Date(lastUpdated.getTime() + 5 * 60 * 1000);
      const diff = Math.max(0, nextRefresh - now);
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      
      if (diff <= 0) {
        setCanRefresh(true);
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }
}, [canRefresh, lastUpdated]);
const fetchTopStocks = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching top stocks data...');
    
    // List of popular stock symbols to fetch
    const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'];
    
    // Create array of promises for quote data
    const quotePromises = symbols.map(symbol => 
      axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: { symbol, token: FINNHUB_API_KEY }
      })
      .catch(error => {
        console.error(`Error fetching quote for ${symbol}:`, error);
        // Return a resolved promise with error info to prevent Promise.all from failing
        return { data: null, error, symbol };
      })
    );
    
    // Create array of promises for company profile data
    const profilePromises = symbols.map(symbol => 
      axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
        params: { symbol, token: FINNHUB_API_KEY }
      })
      .catch(error => {
        console.error(`Error fetching profile for ${symbol}:`, error);
        // Return a resolved promise with error info to prevent Promise.all from failing
        return { data: null, error, symbol };
      })
    );
    
    // Await all requests
    const [quoteResponses, profileResponses] = await Promise.all([
      Promise.all(quotePromises),
      Promise.all(profilePromises)
    ]);
    
    console.log('Quote responses:', quoteResponses);
    console.log('Profile responses:', profileResponses);
    
    // Format the data, handling any failures for individual stocks
    const formattedStocks = symbols.map((symbol, index) => {
      const quoteResponse = quoteResponses[index];
      const profileResponse = profileResponses[index];
      
      // Handle case where either request failed
      if (quoteResponse.error || !quoteResponse.data || profileResponse.error || !profileResponse.data) {
        console.log(`Using fallback data for ${symbol} due to API error`);
        
        // Fallback data for this specific stock
        return {
          id: index + 1,
          symbol,
          name: `${symbol} Inc.`,
          price: getRandomPrice(symbol),
          change: getRandomChange(),
          percentChange: getRandomPercentChange()
        };
      }
      
      const quote = quoteResponse.data;
      const profile = profileResponse.data;
      
      return {
        id: index + 1,
        symbol,
        name: profile.name || `${symbol} Inc.`,
        price: quote.c,
        change: quote.c - quote.pc,
        percentChange: ((quote.c - quote.pc) / quote.pc) * 100
      };
    });
    
    console.log('Formatted top stocks:', formattedStocks);
    setTopStocks(formattedStocks);
    setLoading(false);
    return formattedStocks;
  } catch (error) {
    console.error('Error fetching top stocks:', error);
    setError('Failed to fetch top stocks. Using fallback data.');
    
    // Return mock data as fallback
    const mockTopStocks = [
      { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 194.85, change: -7.29, percentChange: -3.61 },
      { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', price: 371.95, change: -13.78, percentChange: -3.57 },
      { id: 3, symbol: 'AMZN', name: 'Amazon.com Inc.', price: 174.00, change: -5.18, percentChange: -2.88 },
      { id: 4, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.20, change: 1.75, percentChange: 1.25 },
      { id: 5, symbol: 'META', name: 'Meta Platforms Inc.', price: 485.58, change: 10.35, percentChange: 2.18 },
      { id: 6, symbol: 'TSLA', name: 'Tesla Inc.', price: 235.87, change: -3.21, percentChange: -1.35 }
    ];
    
    console.log('Using fallback top stocks data');
    setTopStocks(mockTopStocks);
    setLoading(false);
    return mockTopStocks;
  }
}, [FINNHUB_API_KEY]);

// Helper functions for generating random stock data when API fails
const getRandomPrice = (symbol) => {
  // Generate somewhat realistic prices based on the stock symbol
  const basePrices = {
    'AAPL': 190,
    'MSFT': 370,
    'AMZN': 170,
    'GOOGL': 140,
    'META': 480,
    'TSLA': 230,
    'default': 100
  };
  
  const basePrice = basePrices[symbol] || basePrices.default;
  return basePrice + (Math.random() * 10 - 5); // Add random variation of ±5
};

const getRandomChange = () => {
  return (Math.random() * 20 - 10); // Random change between -10 and +10
};

const getRandomPercentChange = () => {
  return (Math.random() * 6 - 3); // Random percent between -3% and +3%
};

  // Fetch market news
  const fetchMarketNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get general market news
      const response = await axios.get(`${FINNHUB_BASE_URL}/news`, {
        params: { category: 'general', token: FINNHUB_API_KEY }
      });
      
      // Format and limit the news items
      const formattedNews = response.data.slice(0, 6).map((item, index) => ({
        id: item.id || index + 1,
        title: item.headline,
        source: item.source,
        summary: item.summary,
        url: item.url,
        publishedAt: new Date(item.datetime * 1000).toLocaleDateString()
      }));
      
      setMarketNews(formattedNews);
      setLoading(false);
      return formattedNews;
    } catch (error) {
      console.error('Error fetching market news:', error);
      //setError('Failed to fetch market news. Please try again later.');
      setLoading(false);
      
      // Return mock data as fallback
      const mockMarketNews = [
        {
          id: 1,
          title: 'Fed Announces Interest Rate Decision',
          source: 'Financial Times',
          summary: 'The Federal Reserve announced today that it will maintain current interest rates.',
          url: 'https://www.example.com/news/1',
          publishedAt: new Date().toLocaleDateString()
        },
        {
          id: 2,
          title: 'Tech Stocks Rally Amid Positive Earnings',
          source: 'CNBC',
          summary: 'Major technology companies posted better-than-expected quarterly results.',
          url: 'https://www.example.com/news/2',
          publishedAt: new Date().toLocaleDateString()
        },
        {
          id: 3,
          title: 'Oil Prices Surge on Supply Concerns',
          source: 'Reuters',
          summary: 'Global oil prices jumped over 3% today as geopolitical tensions rise.',
          url: 'https://www.example.com/news/3',
          publishedAt: new Date().toLocaleDateString()
        }
      ];
      
      setMarketNews(mockMarketNews);
      return mockMarketNews;
    }
  }, [FINNHUB_API_KEY]);
// Add this with your other functions (before the return statement)
const handleManualRefresh = () => {
  if (canRefresh) {
    console.log("Manual refresh triggered");
    fetchMarketSummary();
    setCanRefresh(false);
    setTimeout(() => setCanRefresh(true), 5 * 60 * 1000);
  }
};
  return {
    loading,
    error,
    marketSummary,
    topStocks,
    marketNews,
    fetchMarketSummary,
    fetchTopStocks,
    fetchMarketNews,
    clearError,
    handleManualRefresh,
    canRefresh,
    timeRemaining,
    lastUpdated
  
  };
};

export default useStock;