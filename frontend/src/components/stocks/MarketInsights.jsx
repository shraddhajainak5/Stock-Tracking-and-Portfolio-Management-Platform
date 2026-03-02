// src/components/stocks/MarketInsights.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Spinner } from 'react-bootstrap';
import { 
  ComposedChart, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

// Constants
const DEFAULT_SYMBOLS = ['SPY', 'QQQ', 'DIA']; // ETFs tracking S&P 500, NASDAQ, and Dow Jones
const TECH_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
const CRYPTO_SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD'];

const MarketInsights = () => {
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('market');
  const [historicalData, setHistoricalData] = useState({});
  const [timeframe, setTimeframe] = useState('1mo'); // 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y

  // Fetch market data on component mount
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        
        // Generate mock data immediately
        const marketIndicesData = generateMockStockData(DEFAULT_SYMBOLS);
        const techStocksData = generateMockStockData(TECH_SYMBOLS);
        const cryptoData = generateMockStockData(CRYPTO_SYMBOLS);
        
        // Combine all data
        setMarketData({
          indices: marketIndicesData,
          tech: techStocksData,
          crypto: cryptoData
        });
        
        // Generate historical data for the first index (S&P 500 ETF)
        const mockHistorical = generateMockHistoricalData(DEFAULT_SYMBOLS[0], timeframe);
        setHistoricalData({ [DEFAULT_SYMBOLS[0]]: mockHistorical });
        
      } catch (err) {
        console.error('Error fetching market data:', err);
        // No need to show errors to users - silently use backup data
        provideFallbackData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);
  
  // Provide fallback data if main data fetch fails
  const provideFallbackData = () => {
    const fallbackIndices = generateMockStockData(DEFAULT_SYMBOLS);
    const fallbackTech = generateMockStockData(TECH_SYMBOLS);
    const fallbackCrypto = generateMockStockData(CRYPTO_SYMBOLS);
    
    setMarketData({
      indices: fallbackIndices,
      tech: fallbackTech,
      crypto: fallbackCrypto
    });
    
    const fallbackHistorical = generateMockHistoricalData(DEFAULT_SYMBOLS[0], '1mo');
    setHistoricalData({ [DEFAULT_SYMBOLS[0]]: fallbackHistorical });
  };
  
  // Update historical data when timeframe changes
  useEffect(() => {
    if (Object.keys(marketData).length > 0) {
      const symbol = DEFAULT_SYMBOLS[0]; // Use S&P 500 ETF as default
      try {
        const newHistoricalData = generateMockHistoricalData(symbol, timeframe);
        setHistoricalData(prevData => ({
          ...prevData,
          [symbol]: newHistoricalData
        }));
      } catch (err) {
        console.error(`Error generating historical data for ${symbol}:`, err);
        // No need to show error to user
      }
    }
  }, [timeframe, marketData]);
  
  // Generate mock stock data
  const generateMockStockData = (symbols) => {
    const result = {};
    
    symbols.forEach(symbol => {
      const basePrice = getBasePrice(symbol);
      const change = (Math.random() * 6) - 3; // Random change between -3% and +3%
      const changeAmount = basePrice * (change / 100);
      
      result[symbol] = {
        symbol,
        price: basePrice,
        change: changeAmount,
        changePercent: change,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: basePrice * (Math.floor(Math.random() * 1000000) + 100000),
        timestamp: new Date().toISOString()
      };
    });
    
    return result;
  };
  
  // Generate mock historical data based on symbol and timeframe
  const generateMockHistoricalData = (symbol, period) => {
    const basePrice = getBasePrice(symbol);
    let dataPoints;
    let startDate = new Date();
    
    // Determine number of data points and start date based on period
    switch (period) {
      case '1d':
        dataPoints = 24; // Hourly data for 1 day
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '1w':
        dataPoints = 7; // Daily data for 1 week
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1mo':
        dataPoints = 30; // Daily data for 1 month
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3mo':
        dataPoints = 90; // Daily data for 3 months
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6mo':
        dataPoints = 180; // Daily data for 6 months
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1y':
        dataPoints = 365; // Daily data for 1 year
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '5y':
        dataPoints = 5 * 52; // Weekly data for 5 years
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      default:
        dataPoints = 30; // Default to 1 month
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Generate data points
    const data = [];
    let currentPrice = basePrice;
    const volatility = getVolatility(symbol, period);
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(startDate);
      
      if (period === '1d') {
        // For 1-day data, increment by hours
        date.setHours(date.getHours() + i);
      } else if (period === '1w') {
        // For 1-week data, increment by days
        date.setDate(date.getDate() + i);
      } else if (period === '5y') {
        // For 5-year data, increment by weeks
        date.setDate(date.getDate() + (i * 7));
      } else {
        // For other periods, increment by days
        date.setDate(date.getDate() + i);
      }
      
      // Generate random price movement
      const change = currentPrice * (Math.random() * volatility * 2 - volatility);
      currentPrice = Math.max(0, currentPrice + change);
      
      data.push({
        date: date.toISOString(),
        price: parseFloat(currentPrice.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return data;
  };
  
  // Helper function to get base price for a symbol
  const getBasePrice = (symbol) => {
    // Return realistic base prices for common symbols
    switch (symbol) {
      case 'SPY':
        return 470;
      case 'QQQ':
        return 420;
      case 'DIA':
        return 380;
      case 'AAPL':
        return 190;
      case 'MSFT':
        return 370;
      case 'GOOGL':
        return 140;
      case 'AMZN':
        return 170;
      case 'META':
        return 480;
      case 'BTC-USD':
        return 70000;
      case 'ETH-USD':
        return 3500;
      case 'SOL-USD':
        return 150;
      case 'DOGE-USD':
        return 0.15;
      default:
        return 100;
    }
  };
  
  // Helper function to get volatility factor based on symbol and period
  const getVolatility = (symbol, period) => {
    // Base volatility
    let volatility = 0.01; // 1% daily volatility for most stocks
    
    // Adjust volatility by symbol type
    if (symbol.includes('-USD')) {
      // Crypto is more volatile
      volatility *= 3;
    } else if (['SPY', 'QQQ', 'DIA'].includes(symbol)) {
      // Indices are less volatile
      volatility *= 0.7;
    }
    
    // Adjust volatility by timeframe
    if (period === '1d' || period === '1w') {
      // Intraday data has lower volatility
      volatility *= 0.5;
    } else if (period === '5y') {
      // Long-term data has higher cumulative volatility
      volatility *= 1.5;
    }
    
    return volatility;
  };
  
  // Format currency with proper symbols
  const formatCurrency = (value, compact = false) => {
    // For cryptocurrencies, we need special handling for smaller values like DOGE
    if (value < 1) {
      return `${value.toFixed(4)}`;
    }
    
    const options = {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    };
    
    if (compact && value >= 1e9) {
      return new Intl.NumberFormat('en-US', {
        ...options,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-US', options).format(value);
  };
  
  // Format percentage
  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Format large numbers
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };
  
  // Format date/time based on timeframe
  const formatDateTime = (dateString, period) => {
    const date = new Date(dateString);
    
    if (period === '1d') {
      // For 1-day data, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (period === '1w') {
      // For 1-week data, show day
      return date.toLocaleDateString([], { weekday: 'short' });
    } else if (['1mo', '3mo', '6mo'].includes(period)) {
      // For monthly data, show month and day
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      // For yearly data, show month and year
      return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    }
  };
  
  // Render the market overview chart
  const renderMarketChart = () => {
    const symbol = DEFAULT_SYMBOLS[0]; // Default to S&P 500 ETF (SPY)
    const data = historicalData[symbol];
    
    if (!data || data.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    // Determine if overall trend is positive or negative
    const startPrice = data[0].price;
    const endPrice = data[data.length - 1].price;
    const isPositive = endPrice >= startPrice;
    const strokeColor = isPositive ? '#198754' : '#dc3545';
    const fillColor = isPositive ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)';
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => formatDateTime(tick, timeframe)}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            dataKey="price"
            domain={['auto', 'auto']}
            tickFormatter={(tick) => `${tick}`}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip 
            formatter={(value, name) => [formatCurrency(value), name === 'price' ? 'Price' : 'Volume']}
            labelFormatter={(label) => {
              return new Date(label).toLocaleDateString([], { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: timeframe === '1d' ? 'numeric' : undefined,
                minute: timeframe === '1d' ? 'numeric' : undefined
              });
            }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor} 
            fillOpacity={1}
            fill={fillColor}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  // Render the market indices section
  const renderMarketIndices = () => {
    if (!marketData.indices || Object.keys(marketData.indices).length === 0) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    return (
      <Row>
        {DEFAULT_SYMBOLS.map(symbol => {
          const data = marketData.indices[symbol];
          if (!data) return null;
          
          const isPositive = data.changePercent >= 0;
          
          return (
            <Col md={4} key={symbol} className="mb-3">
              <Card className="h-100 shadow-sm hover-effect">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">{symbol}</h5>
                    <span className={`badge bg-${isPositive ? 'success' : 'danger'}`}>
                      {formatPercent(data.changePercent)}
                    </span>
                  </div>
                  <h3 className="mb-3">{formatCurrency(data.price)}</h3>
                  <div className="text-muted small">
                    <div>Volume: {formatNumber(data.volume)}</div>
                    <div>Market Cap: {formatCurrency(data.marketCap, true)}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };
  
  // Render the tech stocks section
  const renderTechStocks = () => {
    if (!marketData.tech || Object.keys(marketData.tech).length === 0) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    return (
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
              <th>Change %</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {TECH_SYMBOLS.map(symbol => {
              const data = marketData.tech[symbol];
              if (!data) return null;
              
              const isPositive = data.changePercent >= 0;
              
              return (
                <tr key={symbol}>
                  <td className="fw-bold">{symbol}</td>
                  <td>{formatCurrency(data.price)}</td>
                  <td className={`text-${isPositive ? 'success' : 'danger'}`}>
                    {formatCurrency(data.change)}
                  </td>
                  <td className={`text-${isPositive ? 'success' : 'danger'}`}>
                    {formatPercent(data.changePercent)}
                  </td>
                  <td>{formatNumber(data.volume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render the crypto section
  const renderCrypto = () => {
    if (!marketData.crypto || Object.keys(marketData.crypto).length === 0) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    return (
      <Row>
        {CRYPTO_SYMBOLS.map(symbol => {
          const data = marketData.crypto[symbol];
          if (!data) return null;
          
          const isPositive = data.changePercent >= 0;
          const shortSymbol = symbol.split('-')[0]; // Strip '-USD' part
          
          return (
            <Col md={3} key={symbol} className="mb-3">
              <Card className="h-100 shadow-sm hover-effect">
                <Card.Body className="text-center">
                  <h5 className="mb-2">{shortSymbol}</h5>
                  <h3 className="mb-2">{formatCurrency(data.price)}</h3>
                  <div className={`text-${isPositive ? 'success' : 'danger'} mb-2`}>
                    {formatPercent(data.changePercent)}
                  </div>
                  <div className="text-muted small">
                    Volume: {formatNumber(data.volume)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };
  
  // Main render with improved layout and no error messages
  return (
    <Container className="py-4">
      {/* Custom header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Market Overview</h2>
        <div className="d-flex align-items-center">
          <span className="text-muted me-3">
            <i className="bi bi-clock me-1"></i>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-repeat me-1"></i>
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Market Chart Card */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Market Performance</h4>
            <div className="btn-group">
              {['1d', '1w', '1mo', '3mo', '6mo', '1y', '5y'].map(period => (
                <Button
                  key={period}
                  variant={timeframe === period ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
          
          {renderMarketChart()}
          
          <div className="text-muted text-end mt-2 small">
            <em>Sample market data visualization</em>
          </div>
        </Card.Body>
      </Card>
      
      {/* Tabs for different market data */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        fill
      >
        <Tab eventKey="market" title="Market Indices">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Major Market Indices</Card.Title>
              <hr />
              {renderMarketIndices()}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="tech" title="Tech Stocks">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Technology Sector Performance</Card.Title>
              <hr />
              {renderTechStocks()}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="crypto" title="Cryptocurrencies">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Cryptocurrency Market</Card.Title>
              <hr />
              {renderCrypto()}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Bottom section with market summary */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-3">Market Summary</h4>
          <p>
            Markets are showing mixed performance today with technology stocks leading gains
            while some sectors experience profit-taking. Investors remain focused on upcoming
            economic data releases and corporate earnings reports.
          </p>
          <div className="d-flex justify-content-between text-muted small">
            <span>Data source: Sample market data</span>
            <span>
              <i className="bi bi-info-circle me-1"></i>
              All values shown are for demonstration purposes
            </span>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MarketInsights;