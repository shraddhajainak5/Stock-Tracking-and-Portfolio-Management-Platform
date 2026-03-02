import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useNavigate } from 'react-router-dom';
import "./PortfolioSummary.css";
import AppNavbar from "../../common/Navbar";

const PortfolioSummary = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("holdings"); // holdings, transactions
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockPrices, setStockPrices] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hoveredStock, setHoveredStock] = useState(null);
  const [transactionType, setTransactionType] = useState("all"); // all, buy, sell
  const [timeRange, setTimeRange] = useState("all"); // all, week, month, year
  const [totalGain, setTotalGain] = useState(0.0);
  const [totalLoss, setTotalLoss] = useState(0.0);
  const [totalGainLoss, setTotalGainLoss] = useState(0.0)
  const navigate = useNavigate();


  // Generate consistent colors for stocks
  const COLORS = ['#1E88E5', '#00ACC1', '#43A047', '#E53935', '#FF9800', '#9C27B0', '#3F51B5', '#F44336'];

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const formatPercentChange = (percent) => {
    return percent > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
  };

  const handleBuyStock = () => {
    navigate("/stocks");
  };

  const handleStockDetailsNavigation = (symbol) => {
    navigate(`/stock-analysis/${symbol}?symbol=${symbol}`);
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const refreshPortfolio = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        // Get user from local storage
        const storedUser = localStorage.getItem("currentUser");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        if (!currentUser) {
          throw new Error("User not found. Please log in again.");
        }

        // Fetch portfolio data from API
        const response = await fetch(
          `http://localhost:3000/stocks/portfolio/${currentUser.id}`
        );

        // if (!response.ok) {
        //   throw new Error("Failed to fetch portfolio data");
        // }

        const data = await response.json();
        setPortfolioData(data);

        // Fetch stock prices for each holding
        if (data.stocks && data.stocks.length > 0) {
          const symbols = data.stocks.map(stock => stock.symbol).join(',');


          try {
            const pricesResponse = await fetch(
              `http://localhost:3000/stocks/prices?symbols=${symbols}`
            );

            if (pricesResponse.ok) {
              const pricesData = await pricesResponse.json();
              setStockPrices(pricesData);

              // Prepare data for pie chart
              const chartItems = data.stocks.map((stock, index) => {
                // Use current price if available, otherwise use average price
                const currentPrice = pricesData[stock.symbol] ? pricesData[stock.symbol].c : stock.averagePrice;
                const value = stock.quantity * currentPrice;

                return {
                  name: stock.symbol,
                  value: value,
                  color: COLORS[index % COLORS.length],
                  // Include additional data for tooltip
                  shares: stock.quantity,
                  price: currentPrice,
                  averagePrice: stock.averagePrice
                };
              });

              console.log("Chart data prepared:", chartItems);
              setChartData(chartItems);
            } else {
              console.error("Failed to fetch stock prices, using fallback");

              // Fallback to using average prices
              const fallbackChartData = data.stocks.map((stock, index) => ({
                name: stock.symbol,
                value: stock.quantity * stock.averagePrice,
                color: COLORS[index % COLORS.length],
                shares: stock.quantity,
                price: stock.averagePrice,
                averagePrice: stock.averagePrice
              }));

              setChartData(fallbackChartData);
            }
          } catch (pricesError) {
            console.error("Error fetching prices:", pricesError);

            // Fallback to using average prices
            const fallbackChartData = data.stocks.map((stock, index) => ({
              name: stock.symbol,
              value: stock.quantity * stock.averagePrice,
              color: COLORS[index % COLORS.length],
              shares: stock.quantity,
              price: stock.averagePrice,
              averagePrice: stock.averagePrice
            }));

            setChartData(fallbackChartData);
          }
        }

        // Fetch transaction history using the new API endpoint
        try {
          const transactionsResponse = await fetch(
            `http://localhost:3000/stocks/transactions/${currentUser.id}`
          );

          if (transactionsResponse.ok) {
            const transactionsData = await transactionsResponse.json();
            // Sort transactions by date (newest first)
            const sortedTransactions = transactionsData.sort((a, b) =>
              new Date(b.date) - new Date(a.date)
            );
            setTransactions(sortedTransactions || []);

            const sellTransactions = sortedTransactions.filter(txn => txn.type === "SELL");
            const totalGain = sellTransactions
              .filter(txn => txn.profitOrLoss > 0)
              .reduce((sum, txn) => sum + txn.profitOrLoss, 0);

            const totalLoss = sellTransactions
              .filter(txn => txn.profitOrLoss < 0)
              .reduce((sum, txn) => sum + Math.abs(txn.profitOrLoss), 0);


            setTotalGain(totalGain.toFixed(2))
            setTotalLoss(totalLoss.toFixed(2))

          } else {
            console.error("Failed to fetch transactions");
            setTransactions([]);
          }
        } catch (transactionError) {
          console.error("Error fetching transactions:", transactionError);
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [refreshTrigger]);

  // Filter transactions based on selected type and time range
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by transaction type
    if (transactionType !== "all" && transaction.type.toLowerCase() !== transactionType) {
      return false;
    }

    // Filter by time range
    if (timeRange !== "all") {
      const transactionDate = new Date(transaction.date);
      const currentDate = new Date();

      if (timeRange === "week") {
        // Past week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return transactionDate >= oneWeekAgo;
      } else if (timeRange === "month") {
        // Past month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return transactionDate >= oneMonthAgo;
      } else if (timeRange === "year") {
        // Past year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return transactionDate >= oneYearAgo;
      }
    }

    return true;
  });

  const handleTransaction = (stock, type) => {
    const stockPrice = stockPrices[stock.symbol] ? stockPrices[stock.symbol].c : stock.averagePrice;

    setSelectedStock({
      ...stock,
      currentPrice: stockPrice,
      previousClose: stockPrices[stock.symbol] ? stockPrices[stock.symbol].pc : stockPrice
    });

    if (type === "BUY") {
      setQuantity(1);
      setShowBuyModal(true);
    } else {
      setSellPrice(stockPrice);
      setSellQuantity(1);
      setShowSellModal(true);
    }
  };

  const handleConfirmBuy = async () => {
    try {
      // Show loading state
      setLoading(true);

      // Get user from local storage
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      // Calculate total cost
      const totalCost = selectedStock.currentPrice * quantity;

      // Check if user has enough funds
      if (totalCost > portfolioData.wallet) {
        alert(`Insufficient funds. Your wallet balance: ${formatCurrency(portfolioData.wallet)}`);
        setLoading(false);
        return;
      }

      // Send transaction to API
      const response = await fetch("http://localhost:3000/stocks/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          symbol: selectedStock.symbol,
          quantity: quantity,
          price: selectedStock.currentPrice,
          type: "BUY",
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Close modal and reset state
        setShowBuyModal(false);
        setSelectedStock(null);
        setQuantity(1);

        // Show success message
        const successToast = document.createElement('div');
        successToast.className = 'toast-success';
        successToast.innerHTML = `
          <div class="toast-icon"><i class="bi bi-check-circle-fill"></i></div>
          <div class="toast-message">Successfully purchased ${quantity} shares of ${selectedStock.symbol}</div>
        `;
        document.body.appendChild(successToast);

        // Remove toast after 3 seconds
        setTimeout(() => {
          successToast.classList.add('toast-fade-out');
          setTimeout(() => {
            document.body.removeChild(successToast);
          }, 300);
        }, 3000);

        // Refresh portfolio data
        refreshPortfolio();
      } else {
        const errorData = await response.json();
        alert(`Transaction failed: ${errorData.message || "Please try again."}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleConfirmSell = async () => {
    try {
      // Show loading state
      setLoading(true);

      // Get user from local storage
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      // Validate sell quantity
      if (sellQuantity > selectedStock.quantity) {
        alert(`You only have ${selectedStock.quantity} shares available to sell.`);
        setLoading(false);
        return;
      }

      // Send transaction to API
      const response = await fetch("http://localhost:3000/stocks/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          symbol: selectedStock.symbol,
          quantity: sellQuantity,
          price: sellPrice,
          type: "SELL",
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Close modal and reset state
        setShowSellModal(false);
        setSelectedStock(null);
        setSellQuantity(1);
        setSellPrice(0);

        // Show success message
        const successToast = document.createElement('div');
        successToast.className = 'toast-success';
        successToast.innerHTML = `
          <div class="toast-icon"><i class="bi bi-check-circle-fill"></i></div>
          <div class="toast-message">Successfully sold ${sellQuantity} shares of ${selectedStock.symbol}</div>
        `;
        document.body.appendChild(successToast);

        // Remove toast after 3 seconds
        setTimeout(() => {
          successToast.classList.add('toast-fade-out');
          setTimeout(() => {
            document.body.removeChild(successToast);
          }, 300);
        }, 3000);

        // Refresh portfolio data
        refreshPortfolio();
        calculatePortfolioStats();
      } else {
        const errorData = await response.json();
        alert(`Transaction failed: ${errorData.message || "Please try again."}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const calculatePortfolioStats = () => {
    console.log("calculatePortfolioStats", portfolioData)

    if (!portfolioData || !portfolioData.stocks || portfolioData.stocks.length === 0) {
      return {
        totalValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
        todayChange: 0,
        todayChangePercent: 0,
        // wallet: portfolioData.wallet
      };
    }
    console.log("comes here")
    let totalValue = 0;
    let previousDayValue = 0;

    portfolioData.stocks.forEach(stock => {
      const stockInfo = stockPrices[stock.symbol];
      if (stockInfo) {
        const currentValue = stock.quantity * stockInfo.c;
        const previousValue = stock.quantity * stockInfo.pc;

        totalValue += currentValue;
        previousDayValue += previousValue;
      } else {
        // Fallback to using average price if no current price
        totalValue += stock.quantity * stock.averagePrice;
        previousDayValue += stock.quantity * stock.averagePrice;
      }
    });

    const totalInvested = portfolioData.investmentFund;
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    const totalLoss = totalGain < 0 ? Math.abs(totalGain) : 0;
    const totalLossPercent = totalGain < 0 ? Math.abs(totalGainPercent) : 0;

    const todayChange = totalValue - previousDayValue;
    const todayChangePercent = previousDayValue > 0 ? (todayChange / previousDayValue) * 100 : 0;


    const grouped = {};

    let totalGainLoss = 0;
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const updatedTransactions = [];
    const usedBuys = {};


    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];

      if (tx.type === 'SELL') {
        let qtyToSell = tx.quantity;
        let gain = 0;

        for (let j = i + 1; j < transactions.length && qtyToSell > 0; j++) {
          const buyTx = transactions[j];

          if (buyTx.type === 'BUY' && buyTx.symbol === tx.symbol) {
            const buyKey = buyTx._id.toString();
            const usedQty = usedBuys[buyKey] || 0;
            const availableQty = buyTx.quantity - usedQty;

            if (availableQty <= 0) continue;

            const matchQty = Math.min(qtyToSell, availableQty);
            gain += matchQty * (tx.price - buyTx.price);

            usedBuys[buyKey] = usedQty + matchQty;
            qtyToSell -= matchQty;
          }
        }

        tx.profitOrLoss = parseFloat(gain.toFixed(2));
        totalGainLoss += gain;
      }

      updatedTransactions.push(tx);
    }

    totalGainLoss = parseFloat(totalGainLoss.toFixed(2)); // optional rounding


    return {
      totalValue,
      totalGain,
      totalGainPercent,
      todayChange,
      todayChangePercent,
      totalLoss,
      totalLossPercent,
      totalGainLoss,
      wallet: portfolioData.wallet || 0
    };
  };

  const portfolioStats = calculatePortfolioStats();

  // Custom pie chart tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label font-poppins fw-bold">{data.name}</p>
          <div className="tooltip-content">
            <p className="font-inter">Shares: {data.shares}</p>
            <p className="font-inter">Current Price: {formatCurrency(data.price)}</p>
            <p className="font-inter">Market Value: {formatCurrency(data.value)}</p>
            <p className="font-inter">Avg. Cost: {formatCurrency(data.averagePrice)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="mt-3 font-inter">Loading your portfolio...</p>
    </div>
  );

  if (errorMessage) return (
    <div className="error-container">
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {errorMessage}
      </div>
      <button className="btn custom-btn-primary mt-3" onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  );

  return (
    <>
      <AppNavbar />
      <div
        className="container-fluid py-4 px-3"
        style={{ backgroundColor: "var(--neutral-bg-light)" }}
      >
        <div className="row mb-4">
          <div className="col-md-6 d-flex justify-content-md-start">
            {/* <h1 className="text-start font-poppins fw-bold text-primary-custom ps-3 mb-0">
              Your Portfolio
            </h1> */}
            <p className="text-secondary-custom">
              Track and manage your investments
            </p>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end align-items-center">
            <button
              className="btn btn-outline-primary rounded-pill me-2"
              onClick={refreshPortfolio}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
            <button className="btn custom-btn-primary rounded-pill" onClick={handleBuyStock}>
              <i className="bi bi-plus-lg me-2"></i>
              Buy Stocks
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <div className="custom-card h-100 hover-lift">
              <h3 className="font-poppins text-primary-custom fs-5 mb-3">Total Value</h3>
              <p className="portfolio-value font-poppins fw-bold mb-0">
                {formatCurrency(portfolioStats.totalValue)}
              </p>
              <div className="summary-indicator">
                <i className="bi bi-wallet2-fill"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <div className="custom-card h-100 hover-lift">
              <h3 className="font-poppins text-primary-custom fs-5 mb-3">Total Gain/Loss</h3>
              <p className={`portfolio-value font-poppins fw-bold mb-0 ${totalGain >= 0 ? 'text-success-custom' : 'text-danger-custom'
                }`}>
                {!isNaN(portfolioStats.totalGainLoss) ? formatCurrency(portfolioStats.totalGainLoss) : formatCurrency(portfolioStats.totalGain)}              </p>
              <div className={`summary-indicator ${portfolioStats.totalGain >= 0 ? 'bg-success-soft' : 'bg-danger-soft'}`}>
                <i className={`bi ${portfolioStats.totalGain >= 0 ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'}`}></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <div className="custom-card h-100 hover-lift">
              <h3 className="font-poppins text-primary-custom fs-5 mb-3">Wallet Balance</h3>
              <p className="portfolio-value font-poppins fw-bold mb-0 text-primary-custom">
                {formatCurrency(portfolioStats.wallet) !== '$NaN' ? formatCurrency(portfolioStats.wallet) : '$25,000'}
              </p>
              <div className="summary-indicator bg-primary-soft">
                <i className="bi bi-cash-coin"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <div className="custom-card h-100 hover-lift d-flex flex-column">
              <h3 className="font-poppins text-primary-custom fs-5 mb-3">View Options</h3>
              <div className="btn-group view-toggle" role="group">
                <button
                  type="button"
                  className={`btn ${activeView === 'holdings' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveView('holdings')}
                >
                  <i className="bi bi-grid me-2"></i>
                  Holdings
                </button>
                <button
                  type="button"
                  className={`btn ${activeView === 'transactions' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveView('transactions')}
                >
                  <i className="bi bi-clock-history me-2"></i>
                  History
                </button>
              </div>
              <button className="btn btn-outline-primary mt-2">
                <i className="bi bi-download me-2"></i>
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Distribution */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-lg-10 col-xl-11">
            <div className="custom-card hover-lift">
              <h3 className="font-poppins text-primary-custom fs-5 mb-3">Portfolio Distribution</h3>
              <div className="row">
                <div className="col-md-5">
                  <div className="position-relative chart-container">
                    {chartData && chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={(data, index) => setHoveredStock(data.name)}
                            onMouseLeave={() => setHoveredStock(null)}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke={hoveredStock === entry.name ? "#fff" : "transparent"}
                                strokeWidth={2}
                                className={hoveredStock === entry.name ? "pie-segment-active" : ""}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="d-flex justify-content-center align-items-center h-100 empty-chart">
                        <div className="text-center">
                          <i className="bi bi-pie-chart fs-1 text-secondary-custom mb-3"></i>
                          <p className="text-secondary-custom">No holdings to display</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="distribution-header d-flex justify-content-between mb-2">
                    <span className="font-inter text-secondary-custom">Symbol</span>
                    <span className="font-inter text-secondary-custom">Allocation</span>
                  </div>
                  <div className="distribution-legend">
                    {chartData && chartData.length > 0 ? (
                      chartData.map((stock, index) => {
                        // Calculate total portfolio value for percentage calculation
                        const totalPortfolioValue = chartData.reduce((total, item) => total + item.value, 0);
                        const percentage = totalPortfolioValue > 0
                          ? ((stock.value / totalPortfolioValue) * 100).toFixed(1)
                          : 0;

                        return (
                          <div
                            key={index}
                            className={`legend-item d-flex align-items-center mb-2 p-2 ${hoveredStock === stock.name ? 'legend-item-active' : ''}`}
                            onMouseEnter={() => setHoveredStock(stock.name)}
                            onMouseLeave={() => setHoveredStock(null)}
                          >
                            <div
                              className="legend-color me-2"
                              style={{ backgroundColor: stock.color }}
                            ></div>
                            <div className="d-flex justify-content-between w-100">
                              <div className="stock-info">
                                <span className="font-inter fw-medium">{stock.name}</span>
                                <span className="font-inter d-block text-secondary-custom small">
                                  {stock.shares} shares
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="font-inter fw-medium">
                                  {formatCurrency(stock.value)}
                                </span>
                                <div className="percentage-bar-container">
                                  <div
                                    className="percentage-bar"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: stock.color
                                    }}
                                  ></div>
                                  <span className="percentage-text">{percentage}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center font-inter text-secondary-custom">
                        Add stocks to see your portfolio distribution
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'holdings' ? (
          // Portfolio Holdings
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-11">
              <h2 className="font-poppins fw-bold text-primary-custom ps-3 mb-3">Your Holdings</h2>

              {portfolioData.stocks && portfolioData.stocks.length > 0 ? (
                portfolioData.stocks.map((stock, index) => {
                  const stockInfo = stockPrices[stock.symbol] || { c: stock.averagePrice, pc: stock.averagePrice, d: 0, dp: 0 };
                  const currentValue = stock.quantity * stockInfo.c;
                  const investedValue = stock.quantity * stock.averagePrice;
                  const totalGain = currentValue - investedValue;
                  const gainPercent = investedValue > 0 ? (totalGain / investedValue) * 100 : 0;
                  const isPositive = stockInfo.d >= 0;

                  return (
                    <div className="custom-card card mb-3 hover-lift" key={index}>
                      <div className="stock-item">
                        <div className="row align-items-center">
                          <div className="col-12 col-md-2 mb-3 mb-md-0">
                            <div className="d-flex flex-column align-items-center">
                              <h2 className="fs-2 fw-bold mb-0 font-poppins text-primary-custom">
                                {stock.symbol}
                              </h2>
                              <span
                                className={`price-pill d-inline-flex align-items-center mt-2 ${isPositive ? "positive-change" : "negative-change"
                                  }`}
                              >
                                <i
                                  className={`bi ${isPositive
                                    ? "bi-arrow-up-right"
                                    : "bi-arrow-down-right"
                                    } me-1`}
                                ></i>
                                {formatPercentChange(stockInfo.dp)}
                              </span>
                            </div>
                          </div>

                          <div className="col-6 col-md-2 mb-3 mb-md-0 text-center">
                            <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                              Shares
                            </p>
                            <p className="fs-5 fw-bold font-inter mb-0">
                              {stock.quantity}
                            </p>
                            <p className="small font-inter text-secondary-custom mb-0">
                              Avg. Cost: ${formatPrice(stock.averagePrice)}
                            </p>
                          </div>

                          <div className="col-6 col-md-2 mb-3 mb-md-0 text-center">
                            <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                              Current Price
                            </p>
                            <p className="fs-5 fw-bold font-inter mb-0 d-flex align-items-center justify-content-center">
                              <i className="bi bi-currency-dollar"></i>
                              {formatPrice(stockInfo.c)}
                            </p>
                          </div>

                          <div className="col-6 col-md-2 mb-3 mb-md-0 text-center">
                            <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                              Market Value
                            </p>
                            <p className="fs-5 fw-bold font-inter mb-0">
                              {formatCurrency(currentValue)}
                            </p>
                          </div>

                          <div className="col-6 col-md-2 mb-3 mb-md-0 text-center">
                            <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                              Total Gain/Loss
                            </p>
                            <p className={`fs-5 fw-bold font-inter mb-0 ${totalGain >= 0 ? 'text-success-custom' : 'text-danger-custom'
                              }`}>
                              {formatCurrency(totalGain)}/ {formatCurrency(totalLoss)}
                            </p>
                            {/* <p className={`small font-inter mb-0 ${
                            gainPercent >= 0 ? 'text-success-custom' : 'text-danger-custom'
                          }`}>
                            {formatPercentChange(gainPercent)}
                          </p> */}
                          </div>

                          <div className="col-12 col-md-2 mt-3 mt-md-0">
                            <div className="d-flex flex-column gap-2 action-buttons">
                              <button className="custom-btn-primary btn py-2 fw-medium font-inter w-100 rounded-pill" onClick={() => handleStockDetailsNavigation(stock.symbol)}>
                                <i className="bi bi-eye me-1"></i> Details
                              </button>
                              <div className="d-flex gap-2">
                                <button className="sell-btn btn py-2 fw-medium font-inter w-100 rounded-pill" onClick={() => handleTransaction(stock, "SELL")}>
                                  <i className="bi bi-cart-dash me-1"></i> Sell
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="custom-card empty-state">
                  <div className="text-center p-4">
                    <i className="bi bi-wallet2 fs-1 text-secondary-custom mb-3"></i>
                    <h3 className="font-poppins fs-5">Your portfolio is empty</h3>
                    <p className="font-inter text-secondary-custom mb-4">Start adding stocks to your portfolio</p>
                    <button className="btn custom-btn-primary px-4 py-2 font-inter rounded-pill" onClick={handleBuyStock}>
                      Browse Stocks
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Transaction History View
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-11">
              <div className="custom-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="font-poppins text-primary-custom fs-5 mb-0">Transaction History</h3>
                  <div className="transaction-filters">
                    <select
                      className="form-select form-select-sm me-2 d-inline-block w-auto"
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                    >
                      <option value="all">All Transactions</option>
                      <option value="buy">Buy Only</option>
                      <option value="sell">Sell Only</option>
                    </select>
                    <select
                      className="form-select form-select-sm d-inline-block w-auto"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                      <option value="year">Past Year</option>
                    </select>
                  </div>
                </div>

                {filteredTransactions && filteredTransactions.length > 0 ? (
                  <div className="table-responsive transaction-table">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th className="font-inter">Date</th>
                          <th className="font-inter">Symbol</th>
                          <th className="font-inter">Type</th>
                          <th className="font-inter">Quantity</th>
                          <th className="font-inter">Price</th>
                          <th className="font-inter">Total</th>
                          <th className="font-inter">Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction, index) => (
                          <tr key={index} className="transaction-row">
                            <td className="font-inter">{formatDate(transaction.date)}</td>
                            <td className="font-inter fw-medium">{transaction.symbol}</td>
                            <td>
                              <span className={`transaction-badge ${transaction.type.toLowerCase()}`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td className="font-inter">{transaction.quantity}</td>
                            <td className="font-inter">{formatCurrency(transaction.price)}</td>
                            <td className="font-inter fw-medium">
                              {formatCurrency(transaction.price * transaction.quantity)}
                            </td>
                            <td className="font-inter">
                              {transaction.type === "SELL" && transaction.profitOrLoss !== undefined ? (
                                <span className={transaction.profitOrLoss >= 0 ? "text-success-custom" : "text-danger-custom"}>
                                  {formatCurrency(transaction.profitOrLoss)}
                                </span>
                              ) : (
                                <span className="text-secondary-custom">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4 empty-state">
                    <i className="bi bi-receipt fs-1 text-secondary-custom mb-3"></i>
                    <h3 className="font-poppins fs-5">No transactions found</h3>
                    <p className="font-inter text-secondary-custom">
                      {transactionType !== "all" || timeRange !== "all"
                        ? "Try changing your filters to see more transactions"
                        : "Your transaction history will appear here"}
                    </p>
                    <button className="btn custom-btn-primary rounded-pill mt-2" onClick={handleBuyStock}>
                      <i className="bi bi-cart-plus me-2"></i>
                      Make Your First Trade
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      <div className={`modal fade ${showBuyModal ? 'show' : ''}`} style={{ display: showBuyModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div className="modal-header bg-primary-custom text-white">
              <h5 className="modal-title font-poppins fw-bold">
                <i className="bi bi-cart-plus me-2"></i>
                Buy {selectedStock?.symbol}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowBuyModal(false)}></button>
            </div>
            <div className="modal-body p-4">
              <div className="stock-price-indicator mb-4">
                <div className="current-price text-center">
                  <span className="label font-inter text-secondary-custom">Current Price</span>
                  <span className="price font-poppins fw-bold fs-2 text-primary-custom d-block">
                    {selectedStock ? formatCurrency(selectedStock.currentPrice) : '$0.00'}
                  </span>
                </div>
              </div>

              <div className="wallet-status mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-inter">Wallet Balance</span>
                  <span className="font-inter fw-bold">{formatCurrency(portfolioData.wallet || 0)}</span>
                </div>
                <div className="progress mt-2" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{
                      width: selectedStock ? `${Math.min(100, (portfolioData.wallet / (selectedStock.currentPrice * quantity)) * 100)}%` : '100%'
                    }}
                    aria-valuenow={selectedStock ? Math.min(100, (portfolioData.wallet / (selectedStock.currentPrice * quantity)) * 100) : 100}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="form-label font-inter mb-2">Quantity</label>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn minus"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input
                    type="number"
                    className="form-control text-center"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button
                    className="quantity-btn plus"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>

                <div className="quantity-shortcuts mt-2">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setQuantity(5)}>5</button>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setQuantity(10)}>10</button>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setQuantity(25)}>25</button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      if (selectedStock && portfolioData.wallet) {
                        const maxAffordable = Math.floor(portfolioData.wallet / selectedStock.currentPrice);
                        setQuantity(Math.max(1, maxAffordable));
                      }
                    }}
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="order-summary p-3 bg-light rounded-3 mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="font-inter">Subtotal:</span>
                  <span className="font-inter">
                    {selectedStock ? formatCurrency(selectedStock.currentPrice * quantity) : '$0.00'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="font-inter">Trading Fee:</span>
                  <span className="font-inter">$0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="font-inter fw-bold">Total Cost:</span>
                  <span className="font-poppins fw-bold fs-5 text-primary-custom">
                    {selectedStock ? formatCurrency(selectedStock.currentPrice * quantity) : '$0.00'}
                  </span>
                </div>
              </div>

              {selectedStock && (selectedStock.currentPrice * quantity > portfolioData.wallet) && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Insufficient funds in your wallet.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary font-inter rounded-pill" onClick={() => setShowBuyModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary font-inter px-4 py-2 rounded-pill"
                onClick={handleConfirmBuy}
                disabled={selectedStock && (selectedStock.currentPrice * quantity > portfolioData.wallet)}
              >
                <i className="bi bi-check2-circle me-2"></i>Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sell Modal */}
      <div className={`modal fade ${showSellModal ? 'show' : ''}`} style={{ display: showSellModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div className="modal-header bg-danger-custom text-white">
              <h5 className="modal-title font-poppins fw-bold">
                <i className="bi bi-cart-dash me-2"></i>
                Sell {selectedStock?.symbol}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowSellModal(false)}></button>
            </div>
            <div className="modal-body p-4">
              <div className="stock-info-card mb-4 p-3 bg-light rounded-3">
                <div className="row">
                  <div className="col-6 border-end">
                    <div className="text-center">
                      <span className="font-inter text-secondary-custom d-block mb-1">Current Price</span>
                      <span className="font-poppins fw-bold fs-4 text-primary-custom">
                        {selectedStock ? formatCurrency(selectedStock.currentPrice) : '$0.00'}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <span className="font-inter text-secondary-custom d-block mb-1">Shares Owned</span>
                      <span className="font-poppins fw-bold fs-4 text-primary-custom">
                        {selectedStock ? selectedStock.quantity : 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between">
                    <span className="font-inter text-secondary-custom">Avg. Purchase Price:</span>
                    <span className="font-inter">${selectedStock ? formatPrice(selectedStock.averagePrice) : '0.00'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="font-inter text-secondary-custom">Total Investment:</span>
                    <span className="font-inter">{selectedStock ? formatCurrency(selectedStock.quantity * selectedStock.averagePrice) : '$0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="sellPrice" className="form-label font-inter mb-2">Sell Price</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    id="sellPrice"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <div className="price-shortcuts mt-2">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setSellPrice(selectedStock ? selectedStock.currentPrice * 0.95 : 0)}
                  >
                    -5%
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setSellPrice(selectedStock ? selectedStock.currentPrice : 0)}
                  >
                    Market
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSellPrice(selectedStock ? selectedStock.currentPrice * 1.05 : 0)}
                  >
                    +5%
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="sellQuantity" className="form-label font-inter mb-2">Quantity</label>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn minus"
                    onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input
                    type="number"
                    className="form-control text-center"
                    id="sellQuantity"
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={selectedStock?.quantity || 1}
                  />
                  <button
                    className="quantity-btn plus"
                    onClick={() => setSellQuantity(prev => Math.min((selectedStock?.quantity || 1), prev + 1))}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>

                <div className="quantity-slider mt-3">
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max={selectedStock?.quantity || 1}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(parseInt(e.target.value))}
                  />
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSellQuantity(1)}
                    >
                      Min
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSellQuantity(Math.floor((selectedStock?.quantity || 0) / 2))}
                    >
                      Half
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSellQuantity(selectedStock?.quantity || 0)}
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>

              <div className="order-summary p-3 bg-light rounded-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="font-inter">Sell Price × Quantity:</span>
                  <span className="font-inter">
                    {formatCurrency(sellPrice * sellQuantity)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="font-inter">Trading Fee:</span>
                  <span className="font-inter">$0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="font-inter fw-bold">Total Revenue:</span>
                  <span className="font-poppins fw-bold fs-5 text-success-custom">
                    {formatCurrency(sellPrice * sellQuantity)}
                  </span>
                </div>

                {selectedStock && (
                  <div className="profit-loss-indicator mt-2">
                    <div className="d-flex justify-content-between">
                      <span className="font-inter">Profit/Loss:</span>
                      <span className={`font-inter ${(sellPrice - selectedStock.averagePrice) * sellQuantity >= 0 ? 'text-success-custom' : 'text-danger-custom'}`}>
                        {formatCurrency((sellPrice - selectedStock.averagePrice) * sellQuantity)}
                        <span className="ms-1">
                          ({formatPercentChange(((sellPrice / selectedStock.averagePrice) - 1) * 100)})
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {selectedStock && sellPrice < selectedStock.currentPrice * 0.95 && (
                <div className="alert alert-warning" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Your sell price is significantly below current market value.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary font-inter rounded-pill" onClick={() => setShowSellModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger font-inter px-4 py-2 rounded-pill"
                onClick={handleConfirmSell}
                disabled={selectedStock && (sellQuantity > selectedStock.quantity)}
              >
                <i className="bi bi-check2-circle me-2"></i>Confirm Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {(showBuyModal || showSellModal) && (
        <div className="modal-backdrop fade show" style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)'
        }}></div>
      )}

      {/* Toast notifications container */}
      <div id="toast-container" className="position-fixed bottom-0 end-0 p-3"></div>
    </>
  );
};

export default PortfolioSummary;