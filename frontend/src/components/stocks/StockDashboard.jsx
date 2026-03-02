// src/components/stocks/StockDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import StockCharts from './StockCharts';

const StockDashboard = ({ symbol = 'AAPL' }) => {
  const [stockInfo, setStockInfo] = useState(null);
  const [sectorData, setSectorData] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For demo purposes, using a sample API key. In production, this should be stored securely in environment variables
  const FINNHUB_API_KEY = 'YOUR_FINNHUB_API_KEY';
  
  // Fetch stock information
  useEffect(() => {
    const fetchStockInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In production, you would use actual API endpoints
        // const profileResponse = await axios.get(`https://finnhub.io/api/v1/stock/profile2`, {
        //   params: { symbol, token: FINNHUB_API_KEY }
        // });
        
        // For demo, using mock data
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock response based on symbol
        const mockProfileResponse = getMockCompanyProfile(symbol);
        setStockInfo(mockProfileResponse);
        
        // Fetch sector performance data
        await fetchSectorData();
        
        // Fetch competitor data
        await fetchCompetitors();
        
        // Fetch financial data
        await fetchFinancials();
        
      } catch (error) {
        console.error('Error fetching stock info:', error);
        setError('Failed to fetch stock information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockInfo();
  }, [symbol]);
  
  // Fetch sector performance data
  const fetchSectorData = async () => {
    try {
      // In production, you would use actual API endpoints
      // const response = await axios.get(`https://api.example.com/sector-performance`);
      
      // For demo, using mock data
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock sector performance data
      const mockSectorData = [
        { name: 'Technology', value: 12.4 },
        { name: 'Healthcare', value: 8.6 },
        { name: 'Consumer Cyclical', value: 5.3 },
        { name: 'Financial Services', value: -2.1 },
        { name: 'Energy', value: -4.8 },
        { name: 'Utilities', value: 3.2 },
        { name: 'Communication Services', value: 9.7 },
        { name: 'Industrial', value: 1.5 },
        { name: 'Basic Materials', value: -1.3 },
        { name: 'Real Estate', value: -3.6 }
      ];
      
      setSectorData(mockSectorData);
      
    } catch (error) {
      console.error('Error fetching sector data:', error);
      setError('Failed to fetch sector performance data.');
    }
  };
  
  // Fetch competitor data
  const fetchCompetitors = async () => {
    try {
      // In production, you would use actual API endpoints
      // const response = await axios.get(`https://api.example.com/competitors?symbol=${symbol}`);
      
      // For demo, using mock data
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock competitor data based on symbol
      const mockCompetitorData = getMockCompetitors(symbol);
      setCompetitors(mockCompetitorData);
      
    } catch (error) {
      console.error('Error fetching competitor data:', error);
      setError('Failed to fetch competitor data.');
    }
  };
  
  // Fetch financial data
  const fetchFinancials = async () => {
    try {
      // In production, you would use actual API endpoints
      // const response = await axios.get(`https://finnhub.io/api/v1/stock/financials-reported`, {
      //   params: { symbol, token: FINNHUB_API_KEY }
      // });
      
      // For demo, using mock data
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock financial data based on symbol
      const mockFinancialData = getMockFinancials(symbol);
      setFinancials(mockFinancialData);
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to fetch financial data.');
    }
  };
  
  // Mock data generators
  const getMockCompanyProfile = (stockSymbol) => {
    // Generate company profile based on symbol
    switch(stockSymbol) {
      case 'AAPL':
        return {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          exchange: 'NASDAQ',
          industry: 'Consumer Electronics',
          sector: 'Technology',
          marketCap: 2850000000000,
          employees: 164000,
          website: 'https://www.apple.com',
          description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
          ceo: 'Tim Cook',
          country: 'US',
          ipo: '1980-12-12'
        };
      case 'MSFT':
        return {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          exchange: 'NASDAQ',
          industry: 'Software—Infrastructure',
          sector: 'Technology',
          marketCap: 2780000000000,
          employees: 181000,
          website: 'https://www.microsoft.com',
          description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
          ceo: 'Satya Nadella',
          country: 'US',
          ipo: '1986-03-13'
        };
      case 'AMZN':
        return {
          symbol: 'AMZN',
          name: 'Amazon.com, Inc.',
          exchange: 'NASDAQ',
          industry: 'Internet Retail',
          sector: 'Consumer Cyclical',
          marketCap: 1720000000000,
          employees: 1540000,
          website: 'https://www.amazon.com',
          description: 'Amazon.com, Inc. engages in the retail sale of consumer products, advertising, and subscription services through online and physical stores worldwide.',
          ceo: 'Andy Jassy',
          country: 'US',
          ipo: '1997-05-15'
        };
      default:
        return {
          symbol: stockSymbol,
          name: `${stockSymbol} Inc.`,
          exchange: 'NASDAQ',
          industry: 'Technology',
          sector: 'Technology',
          marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
          employees: Math.floor(Math.random() * 100000) + 1000,
          website: `https://www.${stockSymbol.toLowerCase()}.com`,
          description: `${stockSymbol} Inc. is a technology company that develops various products and services.`,
          ceo: 'John Doe',
          country: 'US',
          ipo: '2000-01-01'
        };
    }
  };
  
  const getMockCompetitors = (stockSymbol) => {
    // Generate competitor data based on symbol
    switch(stockSymbol) {
      case 'AAPL':
        return [
          { symbol: 'MSFT', name: 'Microsoft Corporation', price: 372.45, change: 1.2 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.32, change: -0.8 },
          { symbol: 'SSNLF', name: 'Samsung Electronics Co., Ltd.', price: 52.25, change: -1.5 },
          { symbol: 'SONY', name: 'Sony Group Corporation', price: 86.42, change: 0.7 }
        ];
      case 'MSFT':
        return [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 187.68, change: 0.5 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.32, change: -0.8 },
          { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 172.34, change: 1.5 },
          { symbol: 'ORCL', name: 'Oracle Corporation', price: 114.82, change: -0.3 }
        ];
      case 'AMZN':
        return [
          { symbol: 'WMT', name: 'Walmart Inc.', price: 68.75, change: 0.2 },
          { symbol: 'BABA', name: 'Alibaba Group Holding Ltd.', price: 85.63, change: -2.1 },
          { symbol: 'EBAY', name: 'eBay Inc.', price: 42.36, change: -0.5 },
          { symbol: 'TGT', name: 'Target Corporation', price: 157.82, change: 1.1 }
        ];
      default:
        return [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 187.68, change: 0.5 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', price: 372.45, change: 1.2 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.32, change: -0.8 },
          { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 172.34, change: 1.5 }
        ];
    }
  };
  
  const getMockFinancials = (stockSymbol) => {
    // Generate mock financial data
    const baseRevenue = getBaseRevenue(stockSymbol);
    
    // Quarterly revenue data (last 4 quarters)
    const revenueQuarterly = [
      { quarter: 'Q1', value: baseRevenue * (0.9 + Math.random() * 0.2) },
      { quarter: 'Q2', value: baseRevenue * (0.9 + Math.random() * 0.2) },
      { quarter: 'Q3', value: baseRevenue * (0.9 + Math.random() * 0.2) },
      { quarter: 'Q4', value: baseRevenue * (0.9 + Math.random() * 0.2) }
    ];
    
    // EPS data (last 4 quarters)
    const eps = baseRevenue / 1000; // Just a simple calculation for mock data
    const epsQuarterly = [
      { quarter: 'Q1', value: eps * (0.9 + Math.random() * 0.2) },
      { quarter: 'Q2', value: eps * (0.9 + Math.random() * 0.2) },
      { quarter: 'Q3', value: eps * (0.9 + Math.random() * 0.2) },
      { quarter: 'Q4', value: eps * (0.9 + Math.random() * 0.2) }
    ];
    
    return {
      revenueQuarterly,
      epsQuarterly,
      summary: {
        revenueTTM: (baseRevenue * 4).toFixed(2),
        revenueGrowth: (Math.random() * 20 - 5).toFixed(2),
        grossProfitTTM: (baseRevenue * 4 * 0.4).toFixed(2),
        grossMargin: (40 + Math.random() * 10).toFixed(2),
        netIncomeTTM: (baseRevenue * 4 * 0.2).toFixed(2),
        profitMargin: (20 + Math.random() * 10).toFixed(2),
        peRatio: (15 + Math.random() * 10).toFixed(2),
        epsTTM: (eps * 4).toFixed(2)
      }
    };
  };
  
  const getBaseRevenue = (stockSymbol) => {
    // Base quarterly revenue in millions
    switch(stockSymbol) {
      case 'AAPL':
        return 90000;
      case 'MSFT':
        return 50000;
      case 'AMZN':
        return 120000;
      case 'GOOGL':
        return 70000;
      case 'META':
        return 30000;
      case 'TSLA':
        return 25000;
      default:
        return 10000;
    }
  };
  
  // Format currency
  const formatCurrency = (value, compact = false) => {
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
    return `${value > 0 ? '+' : ''}${value}%`;
  };
  
  // Format large numbers
  const formatNumber = (value, compact = true) => {
    if (compact) {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Render the sector performance chart
  const renderSectorChart = () => {
    if (!sectorData || sectorData.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    // Sort sectors by performance
    const sortedSectors = [...sectorData].sort((a, b) => b.value - a.value);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#431c53', '#6b486b'];
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={sortedSectors}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            tickFormatter={(tick) => `${tick}%`}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Performance']}
          />
          <Bar dataKey="value">
            {sortedSectors.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value >= 0 ? '#198754' : '#dc3545'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render the competitor comparison chart
  const renderCompetitorChart = () => {
    if (!competitors || competitors.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={competitors}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="symbol" />
          <YAxis 
            dataKey="price" 
            tickFormatter={(tick) => `$${tick}`}
          />
          <Tooltip 
            formatter={(value, name) => [formatCurrency(value), name === 'price' ? 'Stock Price' : 'Price Change']}
          />
          <Legend />
          <Bar dataKey="price" fill="#0d6efd" name="Stock Price" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render the quarterly revenue chart
  const renderRevenueChart = () => {
    if (!financials || !financials.revenueQuarterly) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={financials.revenueQuarterly}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="quarter" />
          <YAxis 
            tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}B`}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value, true), 'Revenue']}
          />
          <Bar dataKey="value" fill="#0d6efd" name="Quarterly Revenue" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render the EPS chart
  const renderEpsChart = () => {
    if (!financials || !financials.epsQuarterly) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={financials.epsQuarterly}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="quarter" />
          <YAxis 
            tickFormatter={(tick) => `$${tick.toFixed(2)}`}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value), 'EPS']}
          />
          <Line type="monotone" dataKey="value" stroke="#0d6efd" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  if (loading && !stockInfo) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {/* Price Chart */}
      <StockCharts symbol={symbol} />
      
      {/* Tabs for additional information */}
      <Tabs defaultActiveKey="company" className="mb-4">
        {/* Company Information Tab */}
        <Tab eventKey="company" title="Company Information">
          {stockInfo && (
            <Row className="mt-3">
              <Col md={6}>
                <Card className="mb-4 shadow-sm h-100">
                  <Card.Body>
                    <Card.Title>About {stockInfo.name}</Card.Title>
                    <hr />
                    <p>{stockInfo.description}</p>
                    <Table striped bordered hover>
                      <tbody>
                        <tr>
                          <td width="30%"><strong>CEO</strong></td>
                          <td>{stockInfo.ceo}</td>
                        </tr>
                        <tr>
                          <td><strong>Sector</strong></td>
                          <td>{stockInfo.sector}</td>
                        </tr>
                        <tr>
                          <td><strong>Industry</strong></td>
                          <td>{stockInfo.industry}</td>
                        </tr>
                        <tr>
                          <td><strong>Exchange</strong></td>
                          <td>{stockInfo.exchange}</td>
                        </tr>
                        <tr>
                          <td><strong>Employees</strong></td>
                          <td>{formatNumber(stockInfo.employees)}</td>
                        </tr>
                        <tr>
                          <td><strong>IPO Date</strong></td>
                          <td>{formatDate(stockInfo.ipo)}</td>
                        </tr>
                        <tr>
                          <td><strong>Website</strong></td>
                          <td>
                            <a href={stockInfo.website} target="_blank" rel="noopener noreferrer">
                              {stockInfo.website}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="mb-4 shadow-sm h-100">
                  <Card.Body>
                    <Card.Title>Sector Performance</Card.Title>
                    <hr />
                    {renderSectorChart()}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>
        
        {/* Competitors Tab */}
        <Tab eventKey="competitors" title="Competitors">
          <Row className="mt-3">
            <Col md={12}>
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <Card.Title>Competitor Comparison</Card.Title>
                  <hr />
                  {renderCompetitorChart()}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Competitor Details</Card.Title>
                  <hr />
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Change %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map((comp) => (
                        <tr key={comp.symbol}>
                          <td><strong>{comp.symbol}</strong></td>
                          <td>{comp.name}</td>
                          <td>{formatCurrency(comp.price)}</td>
                          <td>
                            <span className={comp.change >= 0 ? 'text-success' : 'text-danger'}>
                              {comp.change >= 0 ? '+' : ''}{comp.change}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        {/* Financials Tab */}
        <Tab eventKey="financials" title="Financials">
          {financials && (
            <Row className="mt-3">
              <Col md={6}>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <Card.Title>Quarterly Revenue</Card.Title>
                    <hr />
                    {renderRevenueChart()}
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <Card.Title>Earnings Per Share (EPS)</Card.Title>
                    <hr />
                    {renderEpsChart()}
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={12}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <Card.Title>Financial Highlights</Card.Title>
                    <hr />
                    <Row>
                      <Col md={6}>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Income Statement</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Revenue (TTM)</td>
                              <td>{formatCurrency(financials.summary.revenueTTM * 1000000, true)}</td>
                            </tr>
                            <tr>
                              <td>Revenue Growth (YoY)</td>
                              <td 
                                className={financials.summary.revenueGrowth >= 0 ? 'text-success' : 'text-danger'}
                              >
                                {formatPercent(financials.summary.revenueGrowth)}
                              </td>
                            </tr>
                            <tr>
                              <td>Gross Profit (TTM)</td>
                              <td>{formatCurrency(financials.summary.grossProfitTTM * 1000000, true)}</td>
                            </tr>
                            <tr>
                              <td>Gross Margin</td>
                              <td>{financials.summary.grossMargin}%</td>
                            </tr>
                            <tr>
                              <td>Net Income (TTM)</td>
                              <td>{formatCurrency(financials.summary.netIncomeTTM * 1000000, true)}</td>
                            </tr>
                            <tr>
                              <td>Profit Margin</td>
                              <td>{financials.summary.profitMargin}%</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                      
                      <Col md={6}>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Key Metrics</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Market Cap</td>
                              <td>{formatCurrency(stockInfo?.marketCap || 0, true)}</td>
                            </tr>
                            <tr>
                              <td>P/E Ratio</td>
                              <td>{financials.summary.peRatio}</td>
                            </tr>
                            <tr>
                              <td>EPS (TTM)</td>
                              <td>{formatCurrency(financials.summary.epsTTM)}</td>
                            </tr>
                            <tr>
                              <td>Employees</td>
                              <td>{formatNumber(stockInfo?.employees || 0)}</td>
                            </tr>
                            <tr>
                              <td>Sector</td>
                              <td>{stockInfo?.sector || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Industry</td>
                              <td>{stockInfo?.industry || 'N/A'}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default StockDashboard;