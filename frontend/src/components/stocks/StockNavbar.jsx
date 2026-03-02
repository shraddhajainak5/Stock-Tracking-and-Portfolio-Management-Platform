// src/components/stocks/StockNavbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Row, Col, Card, Navbar, Nav, Button, Form, InputGroup, 
  Dropdown, OverlayTrigger, Tooltip, Spinner, Alert 
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Import our custom components
import StockCharts from './StockCharts';
import TechnicalIndicators from './TechnicalIndicators';
import MarketInsights from './MarketInsights';
import StockDashboard from './StockDashboard';

// List of popular stocks for quick selection
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' }
];

// Main StockNavbar component
const StockNavbar = () => {
  const [activeTab, setActiveTab] = useState('charts');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse symbol from URL if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const symbol = params.get('symbol');
    
    if (symbol) {
      setSelectedStock(symbol.toUpperCase());
    }
  }, [location]);
  
  // Fetch stock data when selected stock changes
  useEffect(() => {
    fetchStockData(selectedStock);
    fetchHistoricalData(selectedStock);
    checkWatchlistStatus(selectedStock);
    
    // Update URL with the selected stock
    navigate(`?symbol=${selectedStock}`, { replace: true });
  }, [selectedStock, navigate]);
  
  // Fetch basic stock data
  const fetchStockData = async (symbol) => {
    try {
      setLoading(true);
      setError(null);
      
      // In production, use actual API
      // const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      //   params: { symbol, token: process.env.REACT_APP_FINNHUB_API_KEY }
      // });
      // const profileResponse = await axios.get(`https://finnhub.io/api/v1/stock/profile2`, {
      //   params: { symbol, token: process.env.REACT_APP_FINNHUB_API_KEY }
      // });
      
      // For demo, use mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock data
      const mockData = generateMockStockData(symbol);
      
      setStockData(mockData);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(`Failed to fetch data for ${symbol}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch historical stock data
  const fetchHistoricalData = async (symbol) => {
    try {
      // In production, use actual API
      // const response = await axios.get(`https://finnhub.io/api/v1/stock/candle`, {
      //   params: {
      //     symbol,
      //     resolution: 'D',
      //     from: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 365, // 1 year ago
      //     to: Math.floor(Date.now() / 1000),
      //     token: process.env.REACT_APP_FINNHUB_API_KEY
      //   }
      // });
      
      // For demo, use mock data
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Generate mock historical data
      const mockHistoricalData = generateMockHistoricalData(symbol);
      
      setHistoricalData(mockHistoricalData);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(`Failed to fetch historical data for ${symbol}. Please try again later.`);
    }
  };
  
  // Check if stock is in watchlist
  const checkWatchlistStatus = (symbol) => {
    // In production, this would be an API call
    // For demo, simulate with localStorage
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    setIsWatchlisted(watchlist.includes(symbol));
  };
  
  // Toggle watchlist status
  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    
    if (isWatchlisted) {
      // Remove from watchlist
      const updatedWatchlist = watchlist.filter(item => item !== selectedStock);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setIsWatchlisted(false);
    } else {
      // Add to watchlist
      watchlist.push(selectedStock);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      setIsWatchlisted(true);
    }
  };
  
  // Search for stocks
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      
      // In production, use actual API
      // const response = await axios.get(`https://finnhub.io/api/v1/search`, {
      //   params: {
      //     q: searchQuery,
      //     token: process.env.REACT_APP_FINNHUB_API_KEY
      //   }
      // });
      
      // For demo, use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter POPULAR_STOCKS based on search query
      const mockResults = POPULAR_STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error('Error searching stocks:', err);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle stock selection from search results
  const selectStock = (symbol) => {
    setSelectedStock(symbol);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Mock data generators
  const generateMockStockData = (symbol) => {
    const basePrice = getBasePrice(symbol);
    const change = (Math.random() * 6) - 3; // Random change between -3% and +3%
    const changeAmount = basePrice * (change / 100);
    
    return {
      symbol,
      name: POPULAR_STOCKS.find(stock => stock.symbol === symbol)?.name || `${symbol} Inc.`,
      price: basePrice,
      change: changeAmount,
      changePercent: change,
      open: basePrice - (Math.random() * changeAmount),
      high: basePrice + (Math.random() * basePrice * 0.02),
      low: basePrice - (Math.random() * basePrice * 0.02),
      previousClose: basePrice - changeAmount,
      marketCap: basePrice * (Math.floor(Math.random() * 1000000) + 100000),
      peRatio: Math.floor(Math.random() * 50) + 10,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      avgVolume: Math.floor(Math.random() * 15000000) + 5000000,
      dividend: (Math.random() * 3).toFixed(2),
      dividendYield: (Math.random() * 5).toFixed(2),
      eps: (Math.random() * 10).toFixed(2),
      week52High: basePrice * 1.3,
      week52Low: basePrice * 0.7,
      timestamp: new Date().toISOString()
    };
  };
  
  const generateMockHistoricalData = (symbol) => {
    const basePrice = getBasePrice(symbol);
    const dataPoints = 365; // One year of daily data
    
    const data = [];
    let currentPrice = basePrice;
    const volatility = 0.01; // 1% daily volatility
    
    // Generate data starting from 1 year ago
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate random price movement
      const change = currentPrice * (Math.random() * volatility * 2 - volatility);
      currentPrice = Math.max(0, currentPrice + change);
      
      // Generate OHLC data
      const open = currentPrice - (Math.random() * volatility * currentPrice);
      const high = Math.max(currentPrice, open) + (Math.random() * volatility * currentPrice);
      const low = Math.min(currentPrice, open) - (Math.random() * volatility * currentPrice);
      const close = currentPrice;
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        price: parseFloat(close.toFixed(2)), // For non-OHLC charts
        volume
      });
    }
    
    return data;
  };
  
  const getBasePrice = (symbol) => {
    // Return realistic base prices for common symbols
    switch (symbol) {
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
      case 'TSLA':
        return 230;
      case 'NVDA':
        return 870;
      case 'JPM':
        return 195;
      default:
        return 100;
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
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
  
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'charts':
        return <StockCharts symbol={selectedStock} />;
      case 'technical':
        return <TechnicalIndicators symbol={selectedStock} stockData={historicalData} />;
      case 'market':
        return <MarketInsights />;
      case 'dashboard':
        return <StockDashboard symbol={selectedStock} />;
      default:
        return <StockCharts symbol={selectedStock} />;
    }
  };
  
  return (
    <div className="stock-navbar">
      {/* Top Navigation */}
      <Navbar bg="primary" variant="dark" expand="lg" className="py-2">
        <Container>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <i className="bi bi-graph-up-arrow me-2"></i>
            <span>       </span><span>           </span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="stock-navbar-nav" />
          
          <Navbar.Collapse id="stock-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                active={activeTab === 'charts'} 
                onClick={() => setActiveTab('charts')}
              >
                Charts
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'technical'} 
                onClick={() => setActiveTab('technical')}
              >
                Technical Analysis
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'market'} 
                onClick={() => setActiveTab('market')}
              >
                Market Overview
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </Nav.Link>
            </Nav>
            
            <div className="d-flex">
              {/* Stock Search */}
              <Form className="d-flex me-2" onSubmit={handleSearch} ref={searchRef}>
                <InputGroup>
                  <Form.Control
                    type="search"
                    placeholder="Search stocks..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search"
                    onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                  <Button variant="light" onClick={handleSearch}>
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((result) => (
                      <div 
                        key={result.symbol} 
                        className="search-result-item"
                        onClick={() => selectStock(result.symbol)}
                      >
                        <div className="symbol">{result.symbol}</div>
                        <div className="name">{result.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Form>
              
              {/* Popular Stocks Dropdown */}
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-popular-stocks">
                  Popular Stocks
                </Dropdown.Toggle>
                
                <Dropdown.Menu>
                  {POPULAR_STOCKS.map((stock) => (
                    <Dropdown.Item 
                      key={stock.symbol}
                      onClick={() => selectStock(stock.symbol)}
                      active={selectedStock === stock.symbol}
                    >
                      <span className="fw-bold">{stock.symbol}</span> - {stock.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Stock Info Bar */}
      {stockData && (
        <div className="stock-info-bar bg-light py-2 border-bottom">
          <Container>
            <Row className="align-items-center">
              <Col md={6}>
                <div className="d-flex align-items-center">
                  <h4 className="mb-0 me-2">{stockData.symbol}</h4>
                  <span className="text-secondary">{stockData.name}</span>
                </div>
                <div className="d-flex align-items-center">
                  <h3 className="mb-0 me-2">{formatCurrency(stockData.price)}</h3>
                  <span className={`fw-bold ${stockData.change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {stockData.change >= 0 ? '+' : ''}{formatCurrency(stockData.change)} ({formatPercent(stockData.changePercent)})
                  </span>
                </div>
              </Col>
              
              <Col md={6} className="text-md-end">
                <div className="d-flex justify-content-md-end align-items-center">
                  <div className="me-3">
                    <div className="small text-muted">Volume</div>
                    <div>{formatNumber(stockData.volume)}</div>
                  </div>
                  <div className="me-3">
                    <div className="small text-muted">P/E Ratio</div>
                    <div>{stockData.peRatio}</div>
                  </div>
                  <div className="me-3">
                    <div className="small text-muted">Market Cap</div>
                    <div>{formatNumber(stockData.marketCap)}</div>
                  </div>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>{isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}</Tooltip>}
                  >
                    <Button 
                      variant={isWatchlisted ? 'warning' : 'outline-warning'}
                      onClick={toggleWatchlist}
                    >
                      <i className={`bi bi-star${isWatchlisted ? '-fill' : ''}`}></i>
                    </Button>
                  </OverlayTrigger>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      )}
      
      {/* Main Content Area */}
      <Container className="py-4">
        {loading && !stockData ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading stock data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          renderContent()
        )}
      </Container>
      
      {/* Custom CSS */}
      <style jsx>{`
        .stock-navbar {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .search-input {
          min-width: 200px;
        }
        
        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .search-result-item {
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .search-result-item:hover {
          background-color: #f8f9fa;
        }
        
        .search-result-item .symbol {
          font-weight: bold;
        }
        
        .search-result-item .name {
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .stock-info-bar {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default StockNavbar;