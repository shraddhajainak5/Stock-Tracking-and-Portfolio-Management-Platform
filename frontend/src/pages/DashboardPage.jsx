import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Loader from "../components/common/Loader";
import Error from "../components/common/Error";
import StockCard from "../components/common/StockCard";

import useStock from "../hooks/useStock";

const customStyles = {
  container: { maxWidth: "100%", padding: "0 15px" },
  fullWidthContainer: {
    width: "100%",
    maxWidth: "100%",
    paddingLeft: "15px",
    paddingRight: "15px",
    margin: "0 auto",
  },
  pageWrapper: { minHeight: "calc(100vh - 200px)" },
};

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [watchlist, setWatchlist] = useState([]);
  const [transaction, setTransactions] = useState([]);
  const [totalGainLoss, setTotalGainLoss] = useState(0);
  const [totalValue, setTotalvalue] = useState(0);
  const navigate = useNavigate();

  const {
    portfolio,
    topStocks,
    loading,
    error,
    fetchPortfolio,
    fetchTopStocks,
    fetchTransactions,
    clearError,
  } = useStock();

  const [portfolioPerformance, setPortfolioPerformance] = useState([]);

  useEffect(() => {
    const mockPerformanceData = [
      { date: "Jan", value: 10000 },
      { date: "Feb", value: 10800 },
      { date: "Mar", value: 10600 },
      { date: "Apr", value: 11200 },
      { date: "May", value: 12000 },
      { date: "Jun", value: 11800 },
      { date: "Jul", value: 12500 },
    ];
    setPortfolioPerformance(mockPerformanceData);
    clearError();
  }, [fetchPortfolio, fetchTopStocks, fetchTransactions, clearError]);

  useEffect(() => {
    fetchWatchlist();
    fetchTransactionData();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (!currentUser?.id) return;

      const response = await fetch(
        `http://localhost:3000/stocks/watchlist/${currentUser.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch watchlist");

      const data = await response.json();
      setWatchlist(data.stockData || []);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    }
  };

  const fetchTransactionData = async () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      if (!currentUser?.id) return;

      const response = await fetch(
        `http://localhost:3000/stocks/transactions/${currentUser.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const transactionsData = await response.json();
      const transactions = transactionsData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const usedBuys = {};
      let totalGain = 0;

      const enriched = transactions.map((tx, i) => {
        if (tx.type === "SELL") {
          let qtyToSell = tx.quantity;
          let gain = 0;

          for (let j = i + 1; j < transactions.length && qtyToSell > 0; j++) {
            const buyTx = transactions[j];
            if (buyTx.type === "BUY" && buyTx.symbol === tx.symbol) {
              const buyKey = buyTx._id;
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
          totalGain += gain;
        }
        return tx;
      });

      setTransactions(enriched.slice(0, 5));
      setTotalGainLoss(parseFloat(totalGain.toFixed(2)));

      try {
        const resp = await fetch(`http://localhost:3000/stocks/portfolio/${currentUser.id}`);
        
        if (!resp.ok) {
          throw new Error("Failed to fetch portfolio");
        }
      
        const portfolio = await resp.json();
        console.log("portfolio", portfolio);
        setTotalvalue(portfolio.investmentFund)
        // If you want to set total value from response
        // setTotalValue(portfolio.investmentFund); 
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }

    } catch (error) {
      console.error("Error fetching transactions:", error.message);
    }
  };

  const totalPortfolioValue =
    portfolio?.reduce(
      (total, item) => total + item.quantity * item.currentPrice,
      0
    ) || 0;
  const totalUnrealizedGainLoss =
    portfolio?.reduce(
      (total, item) =>
        total + item.quantity * (item.currentPrice - item.averagePrice),
      0
    ) || 0;

  const gainLossPercentage =
    totalPortfolioValue > 0
      ? (totalUnrealizedGainLoss /
          (totalPortfolioValue - totalUnrealizedGainLoss)) *
        100
      : 0;

  const formatCurrency = (val) => `$${val.toFixed(2)}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  if (loading && (!portfolio || !watchlist)) {
    return (
      <>
        <Navbar />
        <div style={customStyles.pageWrapper}>
          <Loader fullScreen />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={customStyles.fullWidthContainer}>
        {error && <Error message={error} dismissible onClose={clearError} />}

        <div className="mb-4">
          <h1 className="mb-0">Welcome, {user?.fullName || "Trader"}</h1>
          <p className="text-muted">Here's a summary of your investments</p>
        </div>

        {/* Portfolio Summary */}
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <Card className="h-100 dashboard-panel">
              <Card.Body>
                <h5 className="dashboard-panel-title">Portfolio Value</h5>
                <h2 className="mb-2">${totalValue.toFixed(2)}</h2>
                {/* <div
                  className={
                    totalUnrealizedGainLoss >= 0
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  <span className="me-2">
                    <i
                      className={
                        totalUnrealizedGainLoss >= 0
                          ? "bi bi-arrow-up"
                          : "bi bi-arrow-down"
                      }
                    ></i>
                    ${Math.abs(totalUnrealizedGainLoss).toFixed(2)}
                  </span>
                  <span>
                    ({totalUnrealizedGainLoss >= 0 ? "+" : ""}
                    {gainLossPercentage.toFixed(2)}%)
                  </span>
                </div> */}
                <div className="mt-2">
                  <span className="text-muted">Realized Gain/Loss:</span>
                  <span
                    className={`ms-2 fw-semibold ${
                      totalGainLoss >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatCurrency(totalGainLoss)}
                  </span>
                </div>
                <div className="mt-4">
                  <Link to="/portfolio" className="btn btn-primary">
                    View Portfolio
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8} md={6}>
            <Card className="h-100 dashboard-panel">
              <Card.Body>
                <h5 className="dashboard-panel-title">Portfolio Performance</h5>
                {/* <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={portfolioPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => ["$" + value, "Value"]} />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#0d6efd"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer> */}
                `{" "}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolioPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => ["$" + value.toFixed(2), "Value"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0d6efd"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Watchlist */}
          <Col lg={6} className="mb-4">
            <Card className="dashboard-panel">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="dashboard-panel-title mb-0">Watchlist</h5>
                  <Link to="/watchlist" className="text-decoration-none">
                    View All
                  </Link>
                </div>

                {watchlist && watchlist.length > 0 ? (
                  watchlist.slice(0, 3).map((stock) => (
                    <Card key={stock.symbol} className="mb-3 stock-card">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <h6 className="mb-0 stock-symbol">
                              {stock.symbol}
                            </h6>
                            <div className="text-muted small">{stock.name}</div>
                          </div>
                          <div className="stock-price text-end">
                            <h6 className="mb-0 fw-bold">
                              ${stock.data.c.toFixed(2)}
                            </h6>
                            <div
                              className={
                                stock.percentChange >= 0
                                  ? "text-success small"
                                  : "text-danger small"
                              }
                            >
                              {stock.percentChange >= 0 ? "+" : ""}
                              {(stock.percentChange || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        <div className="stock-details p-2 rounded bg-light">
                          <div className="row g-2">
                            <div className="col-6">
                              <div className="text-muted small">
                                Current Value
                              </div>
                              <div className="fw-bold">
                                ${stock.data.c.toFixed(2)}
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="text-muted small">
                                Market Value
                              </div>
                              <div className="fw-bold">
                                $
                                {(stock.data.c * (stock.shares || 1)).toFixed(
                                  2
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-end mt-2">
                          <Link
                            to={`/stocks/${stock.symbol}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Details
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-3">Your watchlist is empty</p>
                    <Link to="/stocks" className="btn btn-outline-primary">
                      Browse Stocks
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Transactions */}
          <Col lg={6} className="mb-4">
            <Card className="dashboard-panel">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="dashboard-panel-title mb-0">
                    Recent Transactions
                  </h5>
                  <Link to="/transactions" className="text-decoration-none">
                    View All
                  </Link>
                </div>

                {transaction && transaction.length > 0 ? (
                  <div className="table-responsive transaction-table">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Symbol</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                          <th>Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transaction.map((tx, index) => (
                          <tr key={index}>
                            <td>{formatDate(tx.date)}</td>
                            <td>{tx.symbol}</td>
                            <td>
                              <span
                                className={`transaction-badge ${tx.type.toLowerCase()}`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td>{tx.quantity}</td>
                            <td>{formatCurrency(tx.price)}</td>
                            <td>{formatCurrency(tx.price * tx.quantity)}</td>
                            <td>
                              {tx.type === "SELL" &&
                              tx.profitOrLoss !== undefined ? (
                                <span
                                  className={
                                    tx.profitOrLoss >= 0
                                      ? "text-success"
                                      : "text-danger"
                                  }
                                >
                                  {formatCurrency(tx.profitOrLoss)}
                                </span>
                              ) : (
                                <span className="text-secondary">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p>No recent transactions</p>
                    <Link to="/stocks" className="btn btn-outline-primary">
                      Start Trading
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6} lg={3} className="mb-4">
            <Card className="text-center h-100 hover-effect">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <div className="feature-icon bg-primary mb-3">
                  <i className="bi bi-cash-coin"></i>
                </div>
                <h5>Deposit Funds</h5>
                <p className="small text-muted">Add money to your account</p>
                <Button variant="outline-primary" className="mt-2">
                  Deposit
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="text-center h-100 hover-effect">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <div className="feature-icon bg-success mb-3">
                  <i className="bi bi-cart-plus"></i>
                </div>
                <h5>Buy Stocks</h5>
                <p className="small text-muted">Invest in new stocks</p>
                <Link to="/stocks" className="btn btn-outline-success mt-2">
                  Browse
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="text-center h-100 hover-effect">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <div className="feature-icon bg-info mb-3">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <h5>Market Analysis</h5>
                <p className="small text-muted">View market insights</p>
                <Link to="/news" className="btn btn-outline-info mt-2">
                  Analyze
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="text-center h-100 hover-effect">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <div className="feature-icon bg-secondary mb-3">
                  <i className="bi bi-gear"></i>
                </div>
                <h5>Account Settings</h5>
                <p className="small text-muted">Manage your profile</p>
                <Link to="/profile" className="btn btn-outline-secondary mt-2">
                  Settings
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
