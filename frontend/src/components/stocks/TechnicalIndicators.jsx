// src/components/stocks/TechnicalIndicators.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { 
  ComposedChart, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import axios from 'axios';

// Define technical indicators
const INDICATORS = [
  { value: 'sma', label: 'Simple Moving Average (SMA)' },
  { value: 'ema', label: 'Exponential Moving Average (EMA)' },
  { value: 'rsi', label: 'Relative Strength Index (RSI)' },
  { value: 'macd', label: 'Moving Average Convergence Divergence (MACD)' },
  { value: 'bollinger', label: 'Bollinger Bands' },
  { value: 'stochastic', label: 'Stochastic Oscillator' }
];

// Technical indicator periods
const PERIODS = [
  { value: 5, label: '5 Days' },
  { value: 10, label: '10 Days' },
  { value: 20, label: '20 Days' },
  { value: 50, label: '50 Days' },
  { value: 100, label: '100 Days' },
  { value: 200, label: '200 Days' }
];

const TechnicalIndicators = ({ symbol = 'AAPL', stockData = [] }) => {
  const [selectedIndicator, setSelectedIndicator] = useState('sma');
  const [period, setPeriod] = useState(20);
  const [indicatorData, setIndicatorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interpretation, setInterpretation] = useState('');
  const [internalStockData, setInternalStockData] = useState(stockData);
  
  // If stockData is not provided, fetch it from the API
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (internalStockData?.length > 0) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Get current time and time from a year ago (in seconds)
        const to = Math.floor(Date.now() / 1000);
        const from = to - 60 * 60 * 24 * 365; // One year ago
        
        // Fetch data from Finnhub
        const response = await axios.get(`https://finnhub.io/api/v1/stock/candle`, {
          params: {
            symbol,
            resolution: 'D', // Daily data
            from,
            to,
            token: import.meta.env.VITE_FINNHUB_API_KEY
          }
        });
        
        // Check if we have valid data
        if (response.data.s === 'no_data') {
          setError(`No data available for ${symbol}`);
          setLoading(false);
          return;
        }
        
        // Format the data for calculations
        const formattedData = [];
        for (let i = 0; i < response.data.t.length; i++) {
          formattedData.push({
            date: new Date(response.data.t[i] * 1000).toISOString().split('T')[0],
            open: response.data.o[i],
            high: response.data.h[i],
            low: response.data.l[i],
            close: response.data.c[i],
            price: response.data.c[i], // Use close as price
            volume: response.data.v[i]
          });
        }
        
        setInternalStockData(formattedData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(`Failed to fetch historical data for ${symbol}. Please try again later.`);
        setInternalStockData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [symbol, stockData, internalStockData]);
  
  // Calculate indicator data when indicator, period, or stockData changes
  useEffect(() => {
    if (internalStockData && internalStockData.length > 0) {
      calculateIndicator(selectedIndicator, period);
    }
  }, [selectedIndicator, period, internalStockData]);
  
  // Calculate technical indicator
  const calculateIndicator = (indicator, periodValue) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure we have enough data
      if (internalStockData.length < periodValue) {
        setError(`Not enough data for ${periodValue} period calculation. Need at least ${periodValue} data points.`);
        setLoading(false);
        return;
      }
      
      // Create a deep copy of the data we'll work with
      const data = JSON.parse(JSON.stringify(internalStockData));
      
      // Calculate the indicator
      switch (indicator) {
        case 'sma':
          calculateSMA(data, periodValue);
          setInterpretation(getSMAInterpretation(data, periodValue));
          break;
        case 'ema':
          calculateEMA(data, periodValue);
          setInterpretation(getEMAInterpretation(data, periodValue));
          break;
        case 'rsi':
          calculateRSI(data, periodValue);
          setInterpretation(getRSIInterpretation(data));
          break;
        case 'macd':
          calculateMACD(data);
          setInterpretation(getMACDInterpretation(data));
          break;
        case 'bollinger':
          calculateBollingerBands(data, periodValue);
          setInterpretation(getBollingerInterpretation(data));
          break;
        case 'stochastic':
          calculateStochastic(data, periodValue);
          setInterpretation(getStochasticInterpretation(data));
          break;
        default:
          calculateSMA(data, periodValue);
          setInterpretation(getSMAInterpretation(data, periodValue));
      }
      
      setIndicatorData(data);
    } catch (err) {
      console.error('Error calculating indicator:', err);
      setError(`Failed to calculate ${indicator}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Simple Moving Average calculation
  const calculateSMA = (data, periodValue) => {
    for (let i = 0; i < data.length; i++) {
      if (i >= periodValue - 1) {
        let sum = 0;
        for (let j = 0; j < periodValue; j++) {
          sum += data[i - j].price;
        }
        data[i].sma = parseFloat((sum / periodValue).toFixed(2));
      } else {
        data[i].sma = null;
      }
    }
  };
  
  // Exponential Moving Average calculation
  const calculateEMA = (data, periodValue) => {
    // First, calculate SMA for the initial EMA value
    let sum = 0;
    for (let i = 0; i < periodValue; i++) {
      sum += data[i].price;
    }
    const multiplier = 2 / (periodValue + 1);
    let previousEMA = sum / periodValue;
    
    for (let i = 0; i < data.length; i++) {
      if (i < periodValue - 1) {
        data[i].ema = null;
      } else if (i === periodValue - 1) {
        data[i].ema = parseFloat(previousEMA.toFixed(2));
      } else {
        // EMA = (Current price * multiplier) + (Previous EMA * (1 - multiplier))
        const currentEMA = (data[i].price * multiplier) + (previousEMA * (1 - multiplier));
        data[i].ema = parseFloat(currentEMA.toFixed(2));
        previousEMA = currentEMA;
      }
    }
  };
  
  // Relative Strength Index calculation
  const calculateRSI = (data, periodValue) => {
    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      data[i].priceChange = data[i].price - data[i - 1].price;
    }
    
    // Calculate average gains and losses over the period
    for (let i = 0; i < data.length; i++) {
      if (i < periodValue) {
        data[i].rsi = null;
      } else {
        let gains = 0;
        let losses = 0;
        
        for (let j = i - periodValue + 1; j <= i; j++) {
          const change = data[j].priceChange || 0;
          if (change > 0) {
            gains += change;
          } else {
            losses += Math.abs(change);
          }
        }
        
        const avgGain = gains / periodValue;
        const avgLoss = losses / periodValue;
        
        if (avgLoss === 0) {
          data[i].rsi = 100;
        } else {
          const rs = avgGain / avgLoss;
          data[i].rsi = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
        }
      }
    }
  };
  
  // Moving Average Convergence Divergence calculation
  const calculateMACD = (data) => {
    // Calculate 12-day EMA
    calculateEMA(data, 12);
    
    // Save 12-day EMA
    for (let i = 0; i < data.length; i++) {
      data[i].ema12 = data[i].ema;
    }
    
    // Calculate 26-day EMA
    calculateEMA(data, 26);
    
    // Save 26-day EMA and calculate MACD line
    for (let i = 0; i < data.length; i++) {
      data[i].ema26 = data[i].ema;
      data[i].macdLine = data[i].ema12 !== null && data[i].ema26 !== null 
        ? parseFloat((data[i].ema12 - data[i].ema26).toFixed(2))
        : null;
    }
    
    // Calculate 9-day EMA of MACD line (signal line)
    const macdData = data.map(item => ({
      price: item.macdLine !== null ? item.macdLine : 0
    }));
    
    calculateEMA(macdData, 9);
    
    // Save signal line and calculate histogram
    for (let i = 0; i < data.length; i++) {
      data[i].signalLine = macdData[i].ema !== null ? parseFloat(macdData[i].ema.toFixed(2)) : null;
      data[i].macdHistogram = data[i].macdLine !== null && data[i].signalLine !== null
        ? parseFloat((data[i].macdLine - data[i].signalLine).toFixed(2))
        : null;
    }
    
    // Clean up temporary properties
    for (let i = 0; i < data.length; i++) {
      delete data[i].ema;
    }
  };
  
  // Bollinger Bands calculation
  const calculateBollingerBands = (data, periodValue) => {
    // Calculate SMA
    calculateSMA(data, periodValue);
    
    // Calculate standard deviation and bands
    for (let i = 0; i < data.length; i++) {
      if (i >= periodValue - 1) {
        let sum = 0;
        for (let j = 0; j < periodValue; j++) {
          sum += Math.pow(data[i - j].price - data[i].sma, 2);
        }
        const stdDev = Math.sqrt(sum / periodValue);
        
        data[i].upperBand = parseFloat((data[i].sma + (stdDev * 2)).toFixed(2));
        data[i].lowerBand = parseFloat((data[i].sma - (stdDev * 2)).toFixed(2));
      } else {
        data[i].upperBand = null;
        data[i].lowerBand = null;
      }
    }
  };
  
  // Stochastic Oscillator calculation
  const calculateStochastic = (data, periodValue) => {
    for (let i = 0; i < data.length; i++) {
      if (i >= periodValue - 1) {
        // Find highest high and lowest low over the period
        let highestHigh = -Infinity;
        let lowestLow = Infinity;
        
        for (let j = i - periodValue + 1; j <= i; j++) {
          // Assuming we have high and low prices
          // If we don't, we'll use close price as an approximation
          const high = data[j].high || data[j].price;
          const low = data[j].low || data[j].price;
          
          highestHigh = Math.max(highestHigh, high);
          lowestLow = Math.min(lowestLow, low);
        }
        
        // Calculate %K
        data[i].stochasticK = parseFloat((((data[i].price - lowestLow) / (highestHigh - lowestLow)) * 100).toFixed(2));
      } else {
        data[i].stochasticK = null;
      }
    }
    
    // Calculate %D (3-day SMA of %K)
    for (let i = 0; i < data.length; i++) {
      if (i >= periodValue + 1) {
        let sum = 0;
        for (let j = 0; j < 3; j++) {
          sum += data[i - j].stochasticK;
        }
        data[i].stochasticD = parseFloat((sum / 3).toFixed(2));
      } else {
        data[i].stochasticD = null;
      }
    }
  };
  
  // Interpretation functions
  const getSMAInterpretation = (data, periodValue) => {
    if (data.length < 2) return '';
    
    const currentPrice = data[data.length - 1].price;
    const currentSMA = data[data.length - 1].sma;
    
    if (currentPrice > currentSMA) {
      return `The current price ($${currentPrice.toFixed(2)}) is above the ${periodValue}-day SMA ($${currentSMA.toFixed(2)}), which may indicate a bullish trend.`;
    } else if (currentPrice < currentSMA) {
      return `The current price ($${currentPrice.toFixed(2)}) is below the ${periodValue}-day SMA ($${currentSMA.toFixed(2)}), which may indicate a bearish trend.`;
    } else {
      return `The current price ($${currentPrice.toFixed(2)}) is at the ${periodValue}-day SMA ($${currentSMA.toFixed(2)}), which may indicate a potential trend change or consolidation.`;
    }
  };
  
  const getEMAInterpretation = (data, periodValue) => {
    if (data.length < 2) return '';
    
    const currentPrice = data[data.length - 1].price;
    const currentEMA = data[data.length - 1].ema;
    
    if (currentPrice > currentEMA) {
      return `The current price ($${currentPrice.toFixed(2)}) is above the ${periodValue}-day EMA ($${currentEMA.toFixed(2)}), which may indicate a bullish trend.`;
    } else if (currentPrice < currentEMA) {
      return `The current price ($${currentPrice.toFixed(2)}) is below the ${periodValue}-day EMA ($${currentEMA.toFixed(2)}), which may indicate a bearish trend.`;
    } else {
      return `The current price ($${currentPrice.toFixed(2)}) is at the ${periodValue}-day EMA ($${currentEMA.toFixed(2)}), which may indicate a potential trend change or consolidation.`;
    }
  };
  
  const getRSIInterpretation = (data) => {
    if (data.length < 2) return '';
    
    const currentRSI = data[data.length - 1].rsi;
    
    if (currentRSI > 70) {
      return `The current RSI (${currentRSI.toFixed(2)}) is above 70, suggesting that the stock may be overbought and could be due for a pullback.`;
    } else if (currentRSI < 30) {
      return `The current RSI (${currentRSI.toFixed(2)}) is below 30, suggesting that the stock may be oversold and could be due for a rebound.`;
    } else {
      return `The current RSI (${currentRSI.toFixed(2)}) is in the neutral zone (between 30 and 70), suggesting neither overbought nor oversold conditions.`;
    }
  };
  
  const getMACDInterpretation = (data) => {
    if (data.length < 35) return 'Not enough data for MACD interpretation.';
    
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (current.macdLine > current.signalLine && previous.macdLine <= previous.signalLine) {
      return `The MACD line (${current.macdLine.toFixed(2)}) has just crossed above the signal line (${current.signalLine.toFixed(2)}), generating a bullish signal.`;
    } else if (current.macdLine < current.signalLine && previous.macdLine >= previous.signalLine) {
      return `The MACD line (${current.macdLine.toFixed(2)}) has just crossed below the signal line (${current.signalLine.toFixed(2)}), generating a bearish signal.`;
    } else if (current.macdLine > current.signalLine) {
      return `The MACD line (${current.macdLine.toFixed(2)}) is above the signal line (${current.signalLine.toFixed(2)}), indicating bullish momentum.`;
    } else if (current.macdLine < current.signalLine) {
      return `The MACD line (${current.macdLine.toFixed(2)}) is below the signal line (${current.signalLine.toFixed(2)}), indicating bearish momentum.`;
    } else {
      return `The MACD line (${current.macdLine.toFixed(2)}) and signal line (${current.signalLine.toFixed(2)}) are converging, suggesting a potential trend change.`;
    }
  };
  
  const getBollingerInterpretation = (data) => {
    if (data.length < 2) return '';
    
    const current = data[data.length - 1];
    
    if (current.price > current.upperBand) {
      return `The current price ($${current.price.toFixed(2)}) is above the upper Bollinger Band ($${current.upperBand.toFixed(2)}), suggesting the stock may be overbought.`;
    } else if (current.price < current.lowerBand) {
      return `The current price ($${current.price.toFixed(2)}) is below the lower Bollinger Band ($${current.lowerBand.toFixed(2)}), suggesting the stock may be oversold.`;
    } else if (current.price > current.sma) {
      return `The current price ($${current.price.toFixed(2)}) is between the SMA ($${current.sma.toFixed(2)}) and the upper band ($${current.upperBand.toFixed(2)}), suggesting a potential uptrend.`;
    } else {
      return `The current price ($${current.price.toFixed(2)}) is between the SMA ($${current.sma.toFixed(2)}) and the lower band ($${current.lowerBand.toFixed(2)}), suggesting a potential downtrend.`;
    }
  };
  
  const getStochasticInterpretation = (data) => {
    if (data.length < 2) return '';
    
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (current.stochasticK > 80 && current.stochasticD > 80) {
      return `The current Stochastic Oscillator %K (${current.stochasticK.toFixed(2)}) and %D (${current.stochasticD.toFixed(2)}) are above 80, suggesting overbought conditions.`;
    } else if (current.stochasticK < 20 && current.stochasticD < 20) {
      return `The current Stochastic Oscillator %K (${current.stochasticK.toFixed(2)}) and %D (${current.stochasticD.toFixed(2)}) are below 20, suggesting oversold conditions.`;
    } else if (current.stochasticK > current.stochasticD && previous.stochasticK <= previous.stochasticD) {
      return `The Stochastic %K line (${current.stochasticK.toFixed(2)}) has crossed above the %D line (${current.stochasticD.toFixed(2)}), generating a bullish signal.`;
    } else if (current.stochasticK < current.stochasticD && previous.stochasticK >= previous.stochasticD) {
      return `The Stochastic %K line (${current.stochasticK.toFixed(2)}) has crossed below the %D line (${current.stochasticD.toFixed(2)}), generating a bearish signal.`;
    } else {
      return `The Stochastic Oscillator %K (${current.stochasticK.toFixed(2)}) and %D (${current.stochasticD.toFixed(2)}) are in the neutral zone, suggesting no strong overbought or oversold conditions.`;
    }
  };
  
  // Render chart based on selected indicator
  const renderChart = () => {
    if (loading || indicatorData.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    // Only show the most recent 100 data points or less for clarity
    const displayData = indicatorData.slice(-Math.min(100, indicatorData.length));
    
    switch (selectedIndicator) {
      case 'sma':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" name="Price" stroke="#0d6efd" dot={false} />
              <Line type="monotone" dataKey="sma" name={`SMA (${period})`} stroke="#dc3545" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'ema':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" name="Price" stroke="#0d6efd" dot={false} />
              <Line type="monotone" dataKey="ema" name={`EMA (${period})`} stroke="#dc3545" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'rsi':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="price" name="Price" stroke="#0d6efd" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="rsi" name="RSI" stroke="#dc3545" dot={false} strokeWidth={2} />
              {/* Reference lines for overbought/oversold */}
              <ReferenceLine yAxisId="right" y={70} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine yAxisId="right" y={30} stroke="green" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case 'macd':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="price" name="Price" stroke="#0d6efd" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="macdLine" name="MACD Line" stroke="#dc3545" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="signalLine" name="Signal Line" stroke="#198754" dot={false} />
              <Bar yAxisId="right" dataKey="macdHistogram" name="Histogram" fill="#6c757d" />
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case 'bollinger':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" name="Price" stroke="#0d6efd" dot={false} />
              <Line type="monotone" dataKey="sma" name={`SMA (${period})`} stroke="#6c757d" dot={false} strokeWidth={1} />
              <Line type="monotone" dataKey="upperBand" name="Upper Band" stroke="#dc3545" dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="lowerBand" name="Lower Band" stroke="#198754" dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'stochastic':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="price" name="Price" stroke="#0d6efd" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="stochasticK" name="%K" stroke="#dc3545" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="stochasticD" name="%D" stroke="#198754" dot={false} />
              {/* Reference lines for overbought/oversold */}
              <ReferenceLine yAxisId="right" y={80} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine yAxisId="right" y={20} stroke="green" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" name="Price" stroke="#0d6efd" dot={false} />
              <Line type="monotone" dataKey="sma" name={`SMA (${period})`} stroke="#dc3545" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  // Render indicator values table
  const renderIndicatorValues = () => {
    if (loading || indicatorData.length === 0) {
      return null;
    }
    
    // Get the most recent data point
    const latest = indicatorData[indicatorData.length - 1];
    
    switch (selectedIndicator) {
      case 'sma':
        return (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Current Price</td>
                <td>${latest.price.toFixed(2)}</td>
              </tr>
              <tr>
                <td>{`SMA (${period})`}</td>
                <td>${latest.sma ? latest.sma.toFixed(2) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Difference</td>
                <td className={latest.price > latest.sma ? 'text-success' : 'text-danger'}>
                  {latest.sma ? `${((latest.price - latest.sma) / latest.sma * 100).toFixed(2)}%` : 'N/A'}
                </td>
              </tr>
            </tbody>
          </Table>
        );
        
      case 'ema':
        return (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Current Price</td>
                <td>${latest.price.toFixed(2)}</td>
              </tr>
              <tr>
                <td>{`EMA (${period})`}</td>
                <td>${latest.ema ? latest.ema.toFixed(2) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Difference</td>
                <td className={latest.price > latest.ema ? 'text-success' : 'text-danger'}>
                  {latest.ema ? `${((latest.price - latest.ema) / latest.ema * 100).toFixed(2)}%` : 'N/A'}
                </td>
              </tr>
            </tbody>
          </Table>
        );
        
      case 'rsi':
        return (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Current Price</td>
                <td>${latest.price.toFixed(2)}</td>
                <td rowSpan="2">
                  {latest.rsi > 70 ? 'Overbought' : latest.rsi < 30 ? 'Oversold' : 'Neutral'}
                </td>
              </tr>
              <tr>
                <td>RSI</td>
                <td className={latest.rsi > 70 ? 'text-danger' : latest.rsi < 30 ? 'text-success' : ''}>
                  {latest.rsi ? latest.rsi.toFixed(2) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </Table>
        );
        
      case 'macd':
        return (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MACD Line</td>
                <td>{latest.macdLine ? latest.macdLine.toFixed(2) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Signal Line</td>
                <td>{latest.signalLine ? latest.signalLine.toFixed(2) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Histogram</td>
                <td className={latest.macdHistogram > 0 ? 'text-success' : 'text-danger'}>
                  {latest.macdHistogram ? latest.macdHistogram.toFixed(2) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td>Signal</td>
                <td className={latest.macdLine > latest.signalLine ? 'text-success' : 'text-danger'}>
                  {latest.macdLine && latest.signalLine 
                    ? (latest.macdLine > latest.signalLine ? 'Bullish' : 'Bearish') 
                    : 'N/A'}
                </td>
              </tr>
            </tbody>
          </Table>
        );
        
      case 'bollinger':
        return (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Current Price</td>
                <td>${latest.price.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Upper Band</td>
                <td>${latest.upperBand ? latest.upperBand.toFixed(2) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Middle Band (SMA)</td>
                <td>${latest.sma ? latest.sma.toFixed(2) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Lower Band</td>
                <td>${latest.lowerBand ? latest.lowerBand.toFixed(2) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Position</td>
                <td>
                  {latest.upperBand && latest.lowerBand ? (
                    latest.price > latest.upperBand 
                      ? 'Above Upper Band (Overbought)' 
                      : latest.price < latest.lowerBand 
                        ? 'Below Lower Band (Oversold)' 
                        : 'Within Bands'
                  ) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </Table>
        );
        
      case 'stochastic':
        return (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>%K</td>
                <td className={
                  latest.stochasticK > 80 
                    ? 'text-danger' 
                    : latest.stochasticK < 20 
                      ? 'text-success' 
                      : ''
                }>
                  {latest.stochasticK ? latest.stochasticK.toFixed(2) : 'N/A'}
                </td>
                <td rowSpan="2">
                  {latest.stochasticK && latest.stochasticD ? (
                    latest.stochasticK > 80 && latest.stochasticD > 80
                      ? 'Overbought'
                      : latest.stochasticK < 20 && latest.stochasticD < 20
                        ? 'Oversold'
                        : latest.stochasticK > latest.stochasticD
                          ? 'Bullish Momentum'
                          : 'Bearish Momentum'
                  ) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td>%D</td>
                <td className={
                  latest.stochasticD > 80 
                    ? 'text-danger' 
                    : latest.stochasticD < 20 
                      ? 'text-success' 
                      : ''
                }>
                  {latest.stochasticD ? latest.stochasticD.toFixed(2) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </Table>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-4">Technical Analysis: {symbol}</Card.Title>
        
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Technical Indicator</Form.Label>
              <Form.Select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
              >
                {INDICATORS.map((indicator) => (
                  <option key={indicator.value} value={indicator.value}>
                    {indicator.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Period</Form.Label>
              <Form.Select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                disabled={selectedIndicator === 'macd'} // MACD uses fixed periods
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <div className="mb-4">
          {renderChart()}
        </div>
        
        <Row>
          <Col md={6}>
            {renderIndicatorValues()}
          </Col>
          
          <Col md={6}>
            <Card className="bg-light">
              <Card.Body>
                <Card.Title className="h6">Interpretation</Card.Title>
                <Card.Text>{interpretation}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TechnicalIndicators;