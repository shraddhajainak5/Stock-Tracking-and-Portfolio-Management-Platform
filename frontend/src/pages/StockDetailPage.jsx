import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Nav, Tab, Alert } from 'react-bootstrap';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import Error from '../components/common/Error';

import useAuth from '../hooks/useAuth';
import useStock from '../hooks/useStock';
import { CHART_PERIODS } from '../config/constants';

const StockDetailPage = () => {
  const { symbol } = useParams();
  const { isAuthenticated } = useAuth();
  const { 
    loading, 
    error, 
    fetchStockDetails, 
    addToWatchlist, 
    removeFromWatchlist, 
    watchlist,
    clearError 
  } = useStock();
  
  const [stock, setStock] = useState(null);
  const [chartPeriod, setChartPeriod] = useState(CHART_PERIODS.DAY);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  useEffect(() => {
    const getStockDetails = async () => {
      try {
        const data = await fetchStockDetails(symbol);
        setStock(data);
      } catch (err) {
        console.error('Error fetching stock details:', err);
      }
    };
    
    getStockDetails();
    
    return () => {
      clearError();
    };
  }, [symbol, fetchStockDetails, clearError]);
  
  // Check if stock is in watchlist
  useEffect(() => {
    if (watchlist && watchlist.length > 0) {
      const found = watchlist.some(item => item.symbol === symbol);
      setIsInWatchlist(found);
    }
  }, [watchlist, symbol]);
  
  const handleAddToWatchlist = async (symbol) => {
    console.log("handleAddToWatchlist")
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser?.id;
    if (!userId) return;
  
    const isAlreadyInWatchlist = watchlist.includes(symbol);
  
    try {
      const url = isAlreadyInWatchlist
        ? "http://localhost:3000/stocks/watchlist/remove"
        : "http://localhost:3000/stocks/watchlist/add";
  
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, symbol }),
      });
  
      if (!response.ok) throw new Error("Failed to update watchlist");
  
      setWatchlist((prev) =>
        isAlreadyInWatchlist
          ? prev.filter((item) => item !== symbol)
          : [...prev, symbol]
      );
  
      setTooltipStates((prev) => ({
        ...prev,
        [symbol]: isAlreadyInWatchlist ? "Removed from watchlist" : "Added to watchlist",
      }));
  
      setTimeout(() => {
        setTooltipStates((prev) => ({ ...prev, [symbol]: null }));
      }, 2000);
    } catch (error) {
      console.error("Watchlist update error:", error);
    }
  };
  
  const handleRemoveFromWatchlist = async () => {
    try {
      await removeFromWatchlist(symbol);
      setIsInWatchlist(false);
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };
  
  if (loading || !stock) {
    return (
      <>
        <Navbar />
        <Container className="py-5">
          <Loader fullScreen />
        </Container>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <Container className="py-5">
          <Error message={error} />
          <div className="text-center mt-4">
            <Link to="/stocks" className="btn btn-primary">
              Back to Stocks
            </Link>
          </div>
        </Container>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      
      <Container className="py-5">
        {/* Stock Header */}
        <div className="stock-detail-header mb-4">
          <Row className="align-items-center">
            <Col md={7}>
              <div className="d-flex align-items-center mb-2">
                <h1 className="mb-0">{stock.symbol}</h1>
                <span className="badge bg-light text-dark ms-3">{stock.exchange}</span>
              </div>
              <p className="mb-3 fs-5">{stock.name}</p>
              <div className="d-flex align-items-center">
                <div className="stock-detail-price me-3">${stock.price.toFixed(2)}</div>
                <div 
                  className={`stock-detail-change ${stock.percentChange >= 0 ? 'text-success' : 'text-danger'}`}
                >
                  {stock.percentChange >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
                </div>
              </div>
              <div className="text-muted mt-1">
                Last updated: {stock.lastUpdated}
              </div>
            </Col>
            
            <Col md={5} className="text-md-end mt-4 mt-md-0">
              {isAuthenticated && (
                <div className="d-flex justify-content-md-end">
                  {isInWatchlist ? (
                    <Button 
                      variant="outline-danger" 
                      className="me-2"
                      onClick={() => handleAddToWatchlist(stock.symbol)}
                    >
                      <i className="bi bi-star-fill me-2"></i>
                      Remove from Watchlist
                    </Button>
                  ) : (
                    <Button 
                      variant="outline-primary" 
                      className="me-2"
                      onClick={() => handleAddToWatchlist(stock.symbol)}
                    >
                      <i className="bi bi-star me-2"></i>
                      Add to Watchlist
                    </Button>
                  )}
                  
                  <Link to={`/trade/${symbol}`} className="btn btn-primary">
                    <i className="bi bi-graph-up me-2"></i>
                    Trade
                  </Link>
                </div>
              )}
            </Col>
          </Row>
        </div>
        
        {/* Chart Section */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Price Chart</h5>
              <div className="btn-group">
                {Object.entries(CHART_PERIODS).map(([key, value]) => (
                  <Button
                    key={key}
                    variant={chartPeriod === value ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setChartPeriod(value)}
                  >
                    {key.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="chart-container">
              {stock.chartData && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stock.chartData[chartPeriod]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin', 'dataMax']} />
                    <Tooltip formatter={(value) => ["$" + value.toFixed(2), "Price"]} />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#0d6efd" 
                      fill="#0d6efd" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card.Body>
        </Card>
        
        {/* Stock Details Tabs */}
        <Tab.Container id="stock-tabs" activeKey={activeTab} onSelect={setActiveTab}>
          <Card>
            <Card.Header>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="overview">Overview</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="financials">Financials</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="news">News</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="analysis">Analysis</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body>
              <Tab.Content>
                {/* Overview Tab */}
                <Tab.Pane eventKey="overview">
                  <Row>
                    <Col md={8}>
                      <h5 className="mb-3">Company Profile</h5>
                      <p>{stock.description}</p>
                      
                      <Row className="mt-4">
                        <Col sm={6} className="mb-4">
                          <Card>
                            <Card.Body>
                              <h6 className="mb-3">Performance</h6>
                              <Table size="sm" borderless>
                                <tbody>
                                  <tr>
                                    <td>Today</td>
                                    <td className={stock.performance.day >= 0 ? 'text-success' : 'text-danger'}>
                                      {stock.performance.day >= 0 ? '+' : ''}{stock.performance.day.toFixed(2)}%
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>1 Week</td>
                                    <td className={stock.performance.week >= 0 ? 'text-success' : 'text-danger'}>
                                      {stock.performance.week >= 0 ? '+' : ''}{stock.performance.week.toFixed(2)}%
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>1 Month</td>
                                    <td className={stock.performance.month >= 0 ? 'text-success' : 'text-danger'}>
                                      {stock.performance.month >= 0 ? '+' : ''}{stock.performance.month.toFixed(2)}%
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>1 Year</td>
                                    <td className={stock.performance.year >= 0 ? 'text-success' : 'text-danger'}>
                                      {stock.performance.year >= 0 ? '+' : ''}{stock.performance.year.toFixed(2)}%
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col sm={6} className="mb-4">
                          <Card>
                            <Card.Body>
                              <h6 className="mb-3">Key Statistics</h6>
                              <Table size="sm" borderless>
                                <tbody>
                                  <tr>
                                    <td>Market Cap</td>
                                    <td>${stock.stats.marketCap}</td>
                                  </tr>
                                  <tr>
                                    <td>P/E Ratio</td>
                                    <td>{stock.stats.peRatio}</td>
                                  </tr>
                                  <tr>
                                    <td>EPS</td>
                                    <td>${stock.stats.eps}</td>
                                  </tr>
                                  <tr>
                                    <td>Dividend Yield</td>
                                    <td>{stock.stats.dividendYield}%</td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Col>
                    
                    <Col md={4}>
                      <Card className="mb-4">
                        <Card.Body>
                          <h6 className="mb-3">About {stock.name}</h6>
                          <Table size="sm" borderless>
                            <tbody>
                              <tr>
                                <td>Sector</td>
                                <td>{stock.sector}</td>
                              </tr>
                              <tr>
                                <td>Industry</td>
                                <td>{stock.industry}</td>
                              </tr>
                              <tr>
                                <td>CEO</td>
                                <td>{stock.ceo}</td>
                              </tr>
                              <tr>
                                <td>Employees</td>
                                <td>{stock.employees}</td>
                              </tr>
                              <tr>
                                <td>Founded</td>
                                <td>{stock.founded}</td>
                              </tr>
                              <tr>
                                <td>Headquarters</td>
                                <td>{stock.headquarters}</td>
                              </tr>
                              <tr>
                                <td>Website</td>
                                <td>
                                  <a href={stock.website} target="_blank" rel="noopener noreferrer">
                                    {stock.website.replace('https://', '')}
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                      
                      <Card>
                        <Card.Body>
                          <h6 className="mb-3">Trading Information</h6>
                          <Table size="sm" borderless>
                            <tbody>
                              <tr>
                                <td>Open</td>
                                <td>${stock.trading.open.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td>Previous Close</td>
                                <td>${stock.trading.previousClose.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td>Day Range</td>
                                <td>${stock.trading.dayLow.toFixed(2)} - ${stock.trading.dayHigh.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td>52 Week Range</td>
                                <td>${stock.trading.yearLow.toFixed(2)} - ${stock.trading.yearHigh.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td>Volume</td>
                                <td>{stock.trading.volume.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td>Avg. Volume</td>
                                <td>{stock.trading.avgVolume.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>
                
                {/* Financials Tab */}
                <Tab.Pane eventKey="financials">
                  <h5 className="mb-4">Financial Performance</h5>
                  
                  <div className="mb-4">
                    <h6 className="mb-3">Revenue (Quarterly, in million $)</h6>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stock.financials.revenueQuarterly}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip formatter={(value) => ["$" + value.toFixed(2) + "M", "Revenue"]} />
                          <Bar dataKey="value" fill="#0d6efd" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="mb-3">Earnings Per Share (Quarterly)</h6>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stock.financials.epsQuarterly}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip formatter={(value) => ["$" + value.toFixed(2), "EPS"]} />
                          <Line type="monotone" dataKey="value" stroke="#0d6efd" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="mb-3">Financial Highlights</h6>
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
                              <td>${stock.financials.revenueTTM}M</td>
                            </tr>
                            <tr>
                              <td>Revenue Growth (YoY)</td>
                              <td>{stock.financials.revenueGrowth}%</td>
                            </tr>
                            <tr>
                              <td>Gross Profit (TTM)</td>
                              <td>${stock.financials.grossProfitTTM}M</td>
                            </tr>
                            <tr>
                              <td>Gross Margin</td>
                              <td>{stock.financials.grossMargin}%</td>
                            </tr>
                            <tr>
                              <td>Net Income (TTM)</td>
                              <td>${stock.financials.netIncomeTTM}M</td>
                            </tr>
                            <tr>
                              <td>Profit Margin</td>
                              <td>{stock.financials.profitMargin}%</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                      
                      <Col md={6}>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Balance Sheet</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Cash & Equivalents</td>
                              <td>${stock.financials.cash}M</td>
                            </tr>
                            <tr>
                              <td>Total Assets</td>
                              <td>${stock.financials.totalAssets}M</td>
                            </tr>
                            <tr>
                              <td>Total Debt</td>
                              <td>${stock.financials.totalDebt}M</td>
                            </tr>
                            <tr>
                              <td>Debt to Equity</td>
                              <td>{stock.financials.debtToEquity}</td>
                            </tr>
                            <tr>
                              <td>Current Ratio</td>
                              <td>{stock.financials.currentRatio}</td>
                            </tr>
                            <tr>
                              <td>Book Value Per Share</td>
                              <td>${stock.financials.bookValuePerShare}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </div>
                </Tab.Pane>
                
                {/* News Tab */}
                <Tab.Pane eventKey="news">
                  <h5 className="mb-4">Latest News</h5>
                  
                  {stock.news && stock.news.length > 0 ? (
                    stock.news.map(item => (
                      <Card key={item.id} className="mb-3">
                        <Card.Body>
                          <Card.Title>{item.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">
                            {item.source} - {item.date}
                          </Card.Subtitle>
                          <Card.Text>{item.summary}</Card.Text>
                          <Card.Link href={item.url} target="_blank" rel="noopener noreferrer">
                            Read more
                          </Card.Link>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <Alert variant="info">No recent news found for {stock.symbol}.</Alert>
                  )}
                </Tab.Pane>
                
                {/* Analysis Tab */}
                <Tab.Pane eventKey="analysis">
                  <h5 className="mb-4">Analyst Recommendations</h5>
                  
                  <Row>
                    <Col md={6} className="mb-4">
                      <Card>
                        <Card.Body>
                          <h6 className="mb-3">Recommendation Summary</h6>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="text-center">
                              <div className="fs-1 fw-bold">{stock.analysis.recommendationRating}</div>
                              <div>{stock.analysis.recommendationText}</div>
                            </div>
                            <div style={{ width: '70%' }}>
                              <div className="d-flex justify-content-between mb-2">
                                <small>Buy</small>
                                <small className="text-end">{stock.analysis.recommendations.buy}</small>
                              </div>
                              <div className="progress mb-3" style={{ height: '10px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${stock.analysis.recommendations.buy}%` }}></div>
                              </div>
                              
                              <div className="d-flex justify-content-between mb-2">
                                <small>Hold</small>
                                <small className="text-end">{stock.analysis.recommendations.hold}</small>
                              </div>
                              <div className="progress mb-3" style={{ height: '10px' }}>
                                <div className="progress-bar bg-warning" style={{ width: `${stock.analysis.recommendations.hold}%` }}></div>
                              </div>
                              
                              <div className="d-flex justify-content-between mb-2">
                                <small>Sell</small>
                                <small className="text-end">{stock.analysis.recommendations.sell}</small>
                              </div>
                              <div className="progress mb-3" style={{ height: '10px' }}>
                                <div className="progress-bar bg-danger" style={{ width: `${stock.analysis.recommendations.sell}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6} className="mb-4">
                      <Card>
                        <Card.Body>
                          <h6 className="mb-3">Price Targets</h6>
                          <div className="text-center mb-4">
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="small text-muted">Low</div>
                                <div className="fs-5 fw-bold">${stock.analysis.priceTargets.low}</div>
                              </div>
                              <div>
                                <div className="small text-muted">Average</div>
                                <div className="fs-5 fw-bold">${stock.analysis.priceTargets.average}</div>
                              </div>
                              <div>
                                <div className="small text-muted">High</div>
                                <div className="fs-5 fw-bold">${stock.analysis.priceTargets.high}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="d-flex justify-content-between mb-2">
                              <div>Current Price: <strong>${stock.price.toFixed(2)}</strong></div>
                              <div>
                                <strong>
                                  {((stock.analysis.priceTargets.average - stock.price) / stock.price * 100).toFixed(2)}%
                                </strong> to target
                              </div>
                            </div>
                            <div className="progress" style={{ height: '20px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                style={{ 
                                  width: `${(stock.price - stock.analysis.priceTargets.low) / 
                                  (stock.analysis.priceTargets.high - stock.analysis.priceTargets.low) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <div>${stock.analysis.priceTargets.low}</div>
                              <div>${stock.analysis.priceTargets.high}</div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Card>
                    <Card.Body>
                      <h6 className="mb-3">Analyst Comments</h6>
                      {stock.analysis.analystComments && stock.analysis.analystComments.length > 0 ? (
                        stock.analysis.analystComments.map((comment, index) => (
                          <div key={index} className="mb-3 pb-3 border-bottom">
                            <div className="d-flex justify-content-between">
                              <div>
                                <strong>{comment.analyst}</strong>
                                <span className="text-muted"> - {comment.firm}</span>
                              </div>
                              <Badge bg={
                                comment.rating === 'Buy' ? 'success' : 
                                comment.rating === 'Hold' ? 'warning' : 
                                comment.rating === 'Sell' ? 'danger' : 'secondary'
                              }>
                                {comment.rating}
                              </Badge>
                            </div>
                            <div className="mt-2">{comment.comment}</div>
                            <div className="small text-muted mt-1">{comment.date}</div>
                          </div>
                        ))
                      ) : (
                        <Alert variant="info">No analyst comments available.</Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
        
        {/* Similar Stocks */}
        <div className="mt-5">
          <h4 className="mb-4">Similar Stocks</h4>
          <Row>
            {stock.similarStocks && stock.similarStocks.length > 0 ? (
              stock.similarStocks.map(similarStock => (
                <Col key={similarStock.symbol} lg={3} md={6} className="mb-4">
                  <Card className="h-100 hover-effect">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Link to={`/stocks/${similarStock.symbol}`} className="text-decoration-none">
                          <h5 className="mb-0 stock-symbol">{similarStock.symbol}</h5>
                        </Link>
                        <Badge bg={similarStock.percentChange >= 0 ? 'success' : 'danger'}>
                          {similarStock.percentChange >= 0 ? '+' : ''}{similarStock.percentChange.toFixed(2)}%
                        </Badge>
                      </div>
                      <Card.Subtitle className="mb-3 text-muted small">{similarStock.name}</Card.Subtitle>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-bold">${similarStock.price.toFixed(2)}</div>
                        <Link to={`/stocks/${similarStock.symbol}`} className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Alert variant="info">No similar stocks found.</Alert>
              </Col>
            )}
          </Row>
        </div>
      </Container>
      
      <Footer />
    </>
  );
};

export default StockDetailPage;