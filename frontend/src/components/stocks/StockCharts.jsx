// src/components/stocks/StockCharts.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

// Chart periods constants
const CHART_PERIODS = {
  DAY: '1D',
  WEEK: '1W',
  MONTH: '1M',
  THREE_MONTHS: '3M',
  YEAR: '1Y',
  MAX: 'ALL'
};

// Chart types constants
const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  CANDLE: 'candle',
  BAR: 'bar'
};

const StockCharts = ({ symbol = 'AAPL' }) => {
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState(CHART_PERIODS.MONTH);
  const [chartType, setChartType] = useState(CHART_TYPES.AREA);
  
  // For demo purposes, using a sample API key. In production, this should be stored securely in environment variables
  const FINNHUB_API_KEY = 'YOUR_FINNHUB_API_KEY';
  
  // Fetch stock quote data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In production, you would use the actual Finnhub API
        // const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
        //   params: { symbol, token: FINNHUB_API_KEY }
        // });
        
        // For demo, using mock data
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock response based on symbol
        const mockResponse = getMockQuoteData(symbol);
        
        setStockData(mockResponse);
        
        // After getting the quote, fetch historical data
        await fetchHistoricalData();
        
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setError('Failed to fetch stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [symbol]);
  
  // Fetch historical price data based on selected period
  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      let startDate = new Date();
      
      switch (chartPeriod) {
        case CHART_PERIODS.DAY:
          // 1 day - get intraday data
          startDate.setDate(startDate.getDate() - 1);
          break;
        case CHART_PERIODS.WEEK:
          startDate.setDate(startDate.getDate() - 7);
          break;
        case CHART_PERIODS.MONTH:
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case CHART_PERIODS.THREE_MONTHS:
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case CHART_PERIODS.YEAR:
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case CHART_PERIODS.MAX:
          startDate.setFullYear(startDate.getFullYear() - 10);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }
      
      // In production, you would use the actual Yahoo Finance API or similar
      // const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      //   params: {
      //     period1: Math.floor(startDate.getTime() / 1000),
      //     period2: Math.floor(endDate.getTime() / 1000),
      //     interval: chartPeriod === CHART_PERIODS.DAY ? '15m' : '1d',
      //     events: 'history',
      //     includePrePost: false
      //   }
      // });
      
      // For demo, using mock data
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Generate mock historical data
      const mockHistoricalData = generateMockHistoricalData(chartPeriod, symbol);
      
      setHistoricalData(mockHistoricalData);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to fetch historical price data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Effect hook to refetch historical data when period changes
  useEffect(() => {
    if (stockData) {
      fetchHistoricalData();
    }
  }, [chartPeriod]);
  
  // Mock data generators
  const getMockQuoteData = (stockSymbol) => {
    const basePrice = getBasePrice(stockSymbol);
    const changePercent = (Math.random() * 6) - 3; // Random change between -3% and +3%
    const change = (basePrice * changePercent / 100).toFixed(2);
    const price = (parseFloat(basePrice) + parseFloat(change)).toFixed(2);
    
    return {
      symbol: stockSymbol,
      price: parseFloat(price),
      change: parseFloat(change),
      percentChange: parseFloat(changePercent.toFixed(2)),
      high: (parseFloat(price) * 1.02).toFixed(2),
      low: (parseFloat(price) * 0.98).toFixed(2),
      open: (parseFloat(price) - (parseFloat(change) / 2)).toFixed(2),
      previousClose: (parseFloat(price) - parseFloat(change)).toFixed(2),
      timestamp: new Date().toLocaleString()
    };
  };
  
  const getBasePrice = (stockSymbol) => {
    // Generate somewhat realistic base prices based on the stock symbol
    switch(stockSymbol) {
      case 'AAPL':
        return 190;
      case 'MSFT':
        return 370;
      case 'AMZN':
        return 170;
      case 'GOOGL':
        return 140;
      case 'META':
        return 480;
      case 'TSLA':
        return 230;
      default:
        return 100;
    }
  };
  
  const generateMockHistoricalData = (period, stockSymbol) => {
    const dataPoints = getDataPointsForPeriod(period);
    const basePrice = getBasePrice(stockSymbol);
    const volatility = 0.02; // 2% daily volatility
    
    let price = basePrice;
    const today = new Date();
    let data = [];
    
    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date(today);
      
      switch (period) {
        case CHART_PERIODS.DAY:
          // For intraday, we use hours
          date.setHours(date.getHours() - i);
          break;
        case CHART_PERIODS.WEEK:
          date.setDate(date.getDate() - i);
          break;
        case CHART_PERIODS.MONTH:
          date.setDate(date.getDate() - i);
          break;
        case CHART_PERIODS.THREE_MONTHS:
          // For 3 months, we can use days with larger steps
          date.setDate(date.getDate() - (i * 3));
          break;
        case CHART_PERIODS.YEAR:
          // For 1 year, we can use weeks
          date.setDate(date.getDate() - (i * 7));
          break;
        case CHART_PERIODS.MAX:
          // For MAX, we can use months
          date.setMonth(date.getMonth() - (i * 2));
          break;
        default:
          date.setDate(date.getDate() - i);
      }
      
      // Generate random price movement
      const change = price * (Math.random() * volatility * 2 - volatility);
      price = Math.max(0, price + change);
      
      // Generate OHLC data
      const open = price;
      const high = price * (1 + Math.random() * 0.01);
      const low = price * (1 - Math.random() * 0.01);
      const close = price * (1 + (Math.random() * 0.02 - 0.01));
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateTime: date.toISOString(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        price: parseFloat(close.toFixed(2)), // For simple charts
        volume
      });
    }
    
    // Adjust the last data point to match the current stock price if available
    if (stockData) {
      data[data.length - 1].price = stockData.price;
      data[data.length - 1].close = stockData.price;
    }
    
    return data;
  };
  
  const getDataPointsForPeriod = (period) => {
    switch (period) {
      case CHART_PERIODS.DAY:
        return 24; // 1 data point per hour
      case CHART_PERIODS.WEEK:
        return 7; // 1 data point per day
      case CHART_PERIODS.MONTH:
        return 30; // 1 data point per day
      case CHART_PERIODS.THREE_MONTHS:
        return 30; // 1 data point every 3 days (90/3=30)
      case CHART_PERIODS.YEAR:
        return 52; // 1 data point per week
      case CHART_PERIODS.MAX:
        return 60; // 1 data point every 2 months (10 years = 120 months / 2 = 60)
      default:
        return 30;
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Render the chart based on selected type
  const renderChart = () => {
    if (loading || !historicalData || historicalData.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    switch (chartType) {
      case CHART_TYPES.LINE:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(tick) => {
                  if (chartPeriod === CHART_PERIODS.DAY) {
                    // For intraday, show hours
                    return new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (chartPeriod === CHART_PERIODS.WEEK || chartPeriod === CHART_PERIODS.MONTH) {
                    // For week/month, show day/month
                    return new Date(tick).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  } else {
                    // For longer periods, show month/year
                    return new Date(tick).toLocaleDateString([], { month: 'short', year: '2-digit' });
                  }
                }}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']} 
                fontSize={12}
                tickFormatter={(tick) => `$${tick.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Price']}
                labelFormatter={(label) => {
                  return new Date(label).toLocaleDateString([], { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#0d6efd" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case CHART_TYPES.AREA:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(tick) => {
                  if (chartPeriod === CHART_PERIODS.DAY) {
                    return new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (chartPeriod === CHART_PERIODS.WEEK || chartPeriod === CHART_PERIODS.MONTH) {
                    return new Date(tick).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  } else {
                    return new Date(tick).toLocaleDateString([], { month: 'short', year: '2-digit' });
                  }
                }}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']} 
                fontSize={12}
                tickFormatter={(tick) => `$${tick.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Price']}
                labelFormatter={(label) => {
                  return new Date(label).toLocaleDateString([], { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#0d6efd" 
                fill="#0d6efd" 
                fillOpacity={0.2}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case CHART_TYPES.BAR:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(tick) => {
                  if (chartPeriod === CHART_PERIODS.DAY) {
                    return new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (chartPeriod === CHART_PERIODS.WEEK || chartPeriod === CHART_PERIODS.MONTH) {
                    return new Date(tick).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  } else {
                    return new Date(tick).toLocaleDateString([], { month: 'short', year: '2-digit' });
                  }
                }}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']} 
                fontSize={12}
                tickFormatter={(tick) => `$${tick.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Price']}
                labelFormatter={(label) => {
                  return new Date(label).toLocaleDateString([], { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
              />
              <Legend />
              <Bar 
                dataKey="volume" 
                fill="#6c757d" 
                name="Volume" 
                yAxisId={1}
                hide={true} // Hide volume bars by default
              />
              <Bar 
                dataKey="price" 
                fill="#0d6efd" 
                name="Price"
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case CHART_TYPES.CANDLE:
        // For candlestick chart, we need a special component or use a different library
        // Here, we'll create a simplified version with bar and line
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(tick) => {
                  if (chartPeriod === CHART_PERIODS.DAY) {
                    return new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (chartPeriod === CHART_PERIODS.WEEK || chartPeriod === CHART_PERIODS.MONTH) {
                    return new Date(tick).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  } else {
                    return new Date(tick).toLocaleDateString([], { month: 'short', year: '2-digit' });
                  }
                }}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']} 
                fontSize={12}
                tickFormatter={(tick) => `$${tick.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Price']}
                labelFormatter={(label) => {
                  return new Date(label).toLocaleDateString([], { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
              />
              <Legend />
              <Bar 
                dataKey="volume" 
                barSize={10}
                fill="#6c757d" 
                name="Volume" 
                yAxisId={1}
                hide={true} // Hide volume bars
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#198754" 
                dot={false}
                name="High"
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#dc3545" 
                dot={false}
                name="Low"
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#0d6efd" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="Close"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(tick) => {
                  if (chartPeriod === CHART_PERIODS.DAY) {
                    return new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (chartPeriod === CHART_PERIODS.WEEK || chartPeriod === CHART_PERIODS.MONTH) {
                    return new Date(tick).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  } else {
                    return new Date(tick).toLocaleDateString([], { month: 'short', year: '2-digit' });
                  }
                }}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']} 
                fontSize={12}
                tickFormatter={(tick) => `$${tick.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Price']}
                labelFormatter={(label) => {
                  return new Date(label).toLocaleDateString([], { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#0d6efd" 
                fill="#0d6efd" 
                fillOpacity={0.2}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  // Stock color based on price change
  const stockColor = stockData && stockData.change >= 0 ? "success" : "danger";
  
  return (
    <Container fluid className="px-0">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          {/* Stock Price Summary */}
          <Row className="mb-3">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0">{symbol}</h2>
                  {stockData && (
                    <h4 className="mb-0">
                      {formatCurrency(stockData.price)}
                      <span className={`ms-2 text-${stockColor}`}>
                        {stockData.change > 0 ? '+' : ''}{stockData.change} ({stockData.percentChange > 0 ? '+' : ''}{stockData.percentChange}%)
                      </span>
                    </h4>
                  )}
                  <small className="text-muted">
                    {stockData ? `Last updated: ${stockData.timestamp}` : 'Loading...'}
                  </small>
                </div>
              </div>
            </Col>
            
            <Col md={6} className="text-md-end">
              {/* Chart Type Selector */}
              <div className="d-flex justify-content-md-end">
                <div className="btn-group me-2">
                  <Button 
                    variant={chartType === CHART_TYPES.AREA ? "primary" : "outline-primary"}
                    onClick={() => setChartType(CHART_TYPES.AREA)}
                    size="sm"
                  >
                    Area
                  </Button>
                  <Button 
                    variant={chartType === CHART_TYPES.LINE ? "primary" : "outline-primary"}
                    onClick={() => setChartType(CHART_TYPES.LINE)}
                    size="sm"
                  >
                    Line
                  </Button>
                  <Button 
                    variant={chartType === CHART_TYPES.CANDLE ? "primary" : "outline-primary"}
                    onClick={() => setChartType(CHART_TYPES.CANDLE)}
                    size="sm"
                  >
                    OHLC
                  </Button>
                  <Button 
                    variant={chartType === CHART_TYPES.BAR ? "primary" : "outline-primary"}
                    onClick={() => setChartType(CHART_TYPES.BAR)}
                    size="sm"
                  >
                    Bar
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
          
          {/* Chart */}
          <div className="mb-3">
            {renderChart()}
          </div>
          
          {/* Time Period Selector */}
          <div className="d-flex justify-content-center">
            <Nav className="chart-period-nav">
              {Object.entries(CHART_PERIODS).map(([key, value]) => (
                <Nav.Item key={key}>
                  <Button
                    variant={chartPeriod === value ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setChartPeriod(value)}
                    className="mx-1"
                  >
                    {value}
                  </Button>
                </Nav.Item>
              ))}
            </Nav>
          </div>
          
          {/* Trading Information */}
          {stockData && (
            <Row className="mt-4">
              <Col sm={6} md={3} className="mb-2">
                <div className="text-muted small">Open</div>
                <div>{formatCurrency(stockData.open)}</div>
              </Col>
              <Col sm={6} md={3} className="mb-2">
                <div className="text-muted small">Previous Close</div>
                <div>{formatCurrency(stockData.previousClose)}</div>
              </Col>
              <Col sm={6} md={3} className="mb-2">
                <div className="text-muted small">Day High</div>
                <div>{formatCurrency(stockData.high)}</div>
              </Col>
              <Col sm={6} md={3} className="mb-2">
                <div className="text-muted small">Day Low</div>
                <div>{formatCurrency(stockData.low)}</div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StockCharts;