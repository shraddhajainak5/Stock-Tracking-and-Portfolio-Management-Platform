// src/pages/StockListingPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, Form, 
  InputGroup, Button, Dropdown, Pagination, Spinner, Alert, Modal
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import axios from 'axios';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const STOCK_CATEGORIES = [
  { value: 'all', label: 'All Sectors' },
  { value: 'technology', label: 'Technology' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'consumer', label: 'Consumer Goods' },
  { value: 'energy', label: 'Energy' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'telecom', label: 'Telecommunications' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'materials', label: 'Materials' },
  { value: 'realestate', label: 'Real Estate' }
];

const StockListingPage = () => {
  const navigate = useNavigate(); // Add useNavigate hook
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [tooltipStates, setTooltipStates] = useState({});
  
  // Buy modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buySuccess, setBuySuccess] = useState(false);

  // Fetch stock data on component mount
  useEffect(() => {
    fetchStocks();
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser?.id;
  
    if (!userId) return;
  
    try {
      const res = await fetch(`http://localhost:3000/stocks/watchlist/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      const data = await res.json();
      setWatchlist(data.watchlist || []); // Use empty array fallback
    } catch (error) {
      console.error("Watchlist fetch error:", error);
      // Silent error - don't show to user
    }
  };

  // Filter and sort stocks when dependencies change
  useEffect(() => {
    filterAndSortStocks();
  }, [stocks, searchQuery, selectedCategory, sortBy, sortDirection]);

  // Fetch stocks data from API
  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      // For development, use mock data instead of API calls
      const mockStocks = generateMockStocks();
      setStocks(mockStocks);
      
    } catch (err) {
      console.error('Error fetching stocks:', err);

      setError('Failed to load stocks. Please try again.');
      
      // Use mock data as a fallback

      // Don't show error to user - use mock data instead

      const mockStocks = generateMockStocks();
      setStocks(mockStocks);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate mock data for development or fallback
  const generateMockStocks = () => {
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 187.68, change: 1.24, percentChange: 0.67, sector: 'Technology', marketCap: 2950, volume: 24561200 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 371.95, change: -13.78, percentChange: -3.57, sector: 'Technology', marketCap: 2780, volume: 31256100 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.32, change: 0.56, percentChange: 0.40, sector: 'Technology', marketCap: 1890, volume: 18764500 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 174.00, change: -5.18, percentChange: -2.88, sector: 'Consumer', marketCap: 1720, volume: 42156900 },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.58, change: 10.35, percentChange: 2.18, sector: 'Technology', marketCap: 1240, volume: 15782400 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.92, change: -4.76, percentChange: -1.88, sector: 'Consumer', marketCap: 780, volume: 60452100 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 877.35, change: 12.89, percentChange: 1.49, sector: 'Technology', marketCap: 2160, volume: 36745200 },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.44, change: 1.12, percentChange: 0.58, sector: 'Financial', marketCap: 560, volume: 9876500 },
      { symbol: 'JNJ', name: 'Johnson & Johnson', price: 152.34, change: -0.87, percentChange: -0.57, sector: 'Healthcare', marketCap: 398, volume: 7651200 },
      { symbol: 'WMT', name: 'Walmart Inc.', price: 68.75, change: 0.35, percentChange: 0.51, sector: 'Consumer', marketCap: 578, volume: 8765400 },
      { symbol: 'V', name: 'Visa Inc.', price: 276.83, change: 3.76, percentChange: 1.38, sector: 'Financial', marketCap: 575, volume: 6754300 },
      { symbol: 'PG', name: 'Procter & Gamble Co.', price: 165.27, change: -0.34, percentChange: -0.21, sector: 'Consumer', marketCap: 389, volume: 5463200 },
      { symbol: 'MA', name: 'Mastercard Inc.', price: 454.12, change: 5.62, percentChange: 1.25, sector: 'Financial', marketCap: 420, volume: 4352100 },
      { symbol: 'HD', name: 'The Home Depot Inc.', price: 342.56, change: 2.13, percentChange: 0.63, sector: 'Consumer', marketCap: 342, volume: 3241000 },
      { symbol: 'BAC', name: 'Bank of America Corp.', price: 37.28, change: -0.47, percentChange: -1.25, sector: 'Financial', marketCap: 295, volume: 43215600 },
      { symbol: 'PFE', name: 'Pfizer Inc.', price: 27.14, change: 0.23, percentChange: 0.86, sector: 'Healthcare', marketCap: 154, volume: 33214500 },
      { symbol: 'CSCO', name: 'Cisco Systems Inc.', price: 48.85, change: -0.32, percentChange: -0.65, sector: 'Technology', marketCap: 198, volume: 19876500 },
      { symbol: 'DIS', name: 'The Walt Disney Co.', price: 115.87, change: 1.45, percentChange: 1.27, sector: 'Consumer', marketCap: 212, volume: 9876500 },
      { symbol: 'INTC', name: 'Intel Corporation', price: 34.82, change: -2.13, percentChange: -5.76, sector: 'Technology', marketCap: 146, volume: 52341600 },
      { symbol: 'VZ', name: 'Verizon Communications Inc.', price: 41.23, change: 0.19, percentChange: 0.46, sector: 'Telecom', marketCap: 173, volume: 14523600 }
    ];

    // Add more mock stocks to have at least 50 items
    const sectors = ['Technology', 'Financial', 'Healthcare', 'Consumer', 'Energy', 'Industrial', 'Telecom', 'Utilities', 'Materials', 'Real Estate'];
    
    for (let i = 1; i <= 30; i++) {
      const symbol = `MOCK${i}`;
      const price = Math.floor(Math.random() * 500) + 10;
      const change = (Math.random() * 10) - 5;
      const percentChange = (change / price) * 100;
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const marketCap = Math.floor(Math.random() * 200) + 50;
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      mockStocks.push({
        symbol,
        name: `Mock Company ${i} Inc.`,
        price,
        change,
        percentChange,
        sector,
        marketCap,
        volume
      });
    }

    return mockStocks;
  };

  // Filter and sort stocks based on user selections
  const filterAndSortStocks = () => {
    let filtered = [...stocks];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(stock => {
        return stock.sector.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(stock => {
        return stock.symbol.toLowerCase().includes(query) || 
               stock.name.toLowerCase().includes(query);
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle string comparison for symbol and name
      if (sortBy === 'symbol' || sortBy === 'name' || sortBy === 'sector') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setFilteredStocks(filtered);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStocks();
  };
  
  // Handle sort header click
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Handle stock detail navigation - direct navigation function
  const handleStockNavigation = (symbol) => {
    navigate(`/stock-analysis/${symbol}?symbol=${symbol}`);
  };
  
  // Open buy modal
  const handleBuyClick = (stock) => {
    setSelectedStock(stock);
    setQuantity(1);
    setBuySuccess(false);
    setShowBuyModal(true);
  };

  // Execute buy transaction
  const handleBuyStock = async () => {
    if (!selectedStock) return;
    
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser?.id;
    
    if (!userId) {
      alert("Please log in to buy stocks");
      setShowBuyModal(false);
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare transaction data
      const transactionData = {
        userId: userId,
        symbol: selectedStock.symbol,
        quantity: quantity,
        price: selectedStock.price,
        type: "BUY"
      };
      
      // Send transaction to the backend API
      const response = await fetch("http://localhost:3000/stocks/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Transaction failed");
      }
      
      // Transaction successful
      setBuySuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        setShowBuyModal(false);
        setSelectedStock(null);
        setQuantity(1);
        setBuySuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Buy transaction error:", error);
      alert(error.message || "Failed to complete transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format currency with appropriate suffixes
  const formatCurrency = (value) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // Format volume with appropriate suffixes
  const formatVolume = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else {
      return value.toString();
    }
  };

  // Calculate pagination
  const indexOfLastStock = currentPage * itemsPerPage;
  const indexOfFirstStock = indexOfLastStock - itemsPerPage;
  const currentStocks = filteredStocks.slice(indexOfFirstStock, indexOfLastStock);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Create pagination items
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // First page
      i === totalPages || // Last page
      (i >= currentPage - 1 && i <= currentPage + 1) // Current page and neighbors
    ) {
      paginationItems.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => paginate(i)}
        >
          {i}
        </Pagination.Item>
      );
    } else if (
      (i === currentPage - 2 && currentPage > 3) || 
      (i === currentPage + 2 && currentPage < totalPages - 2)
    ) {
      paginationItems.push(<Pagination.Ellipsis key={`ellipsis-${i}`} />);
    }
  }

  const handleAddWatchlist = async (symbol) => {
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

  return (
    <div className="stock-listing-page">
      <Navbar />

      <Container className="py-4">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1>Stock Listings</h1>
            <p className="text-muted">Browse and analyze available stocks</p>
          </Col>
        </Row>

        {/* Hide error messages */}
        {/* {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <Alert.Heading>Error!</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )} */}

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="mb-3">
              <Col lg={6} className="mb-3 mb-lg-0">
                <InputGroup>
                  <Form.Control
                    placeholder="Search by symbol or company name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchQuery("")}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                  <Button variant="outline-primary">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Col>

              <Col lg={3} md={6} className="mb-3 mb-md-0">
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {STOCK_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={3} md={6} className="d-flex justify-content-md-end">
                <Button
                  variant="primary"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="w-100 w-md-auto"
                >
                  {refreshing ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh
                    </>
                  )}
                </Button>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    Showing {indexOfFirstStock + 1} -{" "}
                    {Math.min(indexOfLastStock, filteredStocks.length)} of{" "}
                    {filteredStocks.length} stocks
                  </div>
                  <div>
                    <Dropdown className="d-inline-block">
                      <Dropdown.Toggle
                        variant="light"
                        id="dropdown-sort-by"
                        size="sm"
                      >
                        Sort By:{" "}
                        {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => setSortBy("symbol")}
                          active={sortBy === "symbol"}
                        >
                          Symbol
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setSortBy("name")}
                          active={sortBy === "name"}
                        >
                          Company Name
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setSortBy("price")}
                          active={sortBy === "price"}
                        >
                          Price
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setSortBy("percentChange")}
                          active={sortBy === "percentChange"}
                        >
                          % Change
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setSortBy("marketCap")}
                          active={sortBy === "marketCap"}
                        >
                          Market Cap
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setSortBy("volume")}
                          active={sortBy === "volume"}
                        >
                          Volume
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                    <Button
                      variant="light"
                      size="sm"
                      onClick={() =>
                        setSortDirection(
                          sortDirection === "asc" ? "desc" : "asc"
                        )
                      }
                      className="ms-2"
                    >
                      {sortDirection === "asc" ? (
                        <i className="bi bi-sort-up"></i>
                      ) : (
                        <i className="bi bi-sort-down"></i>
                      )}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>

            {loading && !refreshing ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading stocks...</p>
              </div>
            ) : currentStocks.length > 0 ? (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("symbol")}
                      >
                        Symbol{" "}
                        {sortBy === "symbol" && (
                          <i
                            className={`bi bi-caret-${
                              sortDirection === "asc" ? "up" : "down"
                            }-fill ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Name{" "}
                        {sortBy === "name" && (
                          <i
                            className={`bi bi-caret-${
                              sortDirection === "asc" ? "up" : "down"
                            }-fill ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="cursor-pointer text-end"
                        onClick={() => handleSort("price")}
                      >
                        Price{" "}
                        {sortBy === "price" && (
                          <i
                            className={`bi bi-caret-${
                              sortDirection === "asc" ? "up" : "down"
                            }-fill ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="cursor-pointer text-end"
                        onClick={() => handleSort("percentChange")}
                      >
                        Change{" "}
                        {sortBy === "percentChange" && (
                          <i
                            className={`bi bi-caret-${
                              sortDirection === "asc" ? "up" : "down"
                            }-fill ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("sector")}
                      >
                        Sector{" "}
                        {sortBy === "sector" && (
                          <i
                            className={`bi bi-caret-${
                              sortDirection === "asc" ? "up" : "down"
                            }-fill ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="cursor-pointer text-end"
                        onClick={() => handleSort("marketCap")}
                      >
                        Market Cap{" "}
                        {sortBy === "marketCap" && (
                          <i
                            className={`bi bi-caret-${
                              sortDirection === "asc" ? "up" : "down"
                            }-fill ms-1`}
                          ></i>
                        )}
                      </th>
                      <th
                        className="cursor-pointer text-end"
                        onClick={() => handleSort("volume")}
                      >
                        Volume{" "}
                        {sortBy === "volume" && (
                          <i
                            className={`bi bi-caret-${
                              sortDirection === "asc" ? "up" : "down"
                            }-fill ms-1`}
                          ></i>
                        )}
                      </th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStocks.map((stock) => (
                      <tr key={stock.symbol}>
                        {/* Make entire symbol cell clickable */}
                        <td
                          onClick={() => handleStockNavigation(stock.symbol)}
                          style={{cursor: 'pointer'}}
                          className="fw-bold"
                        >
                          {stock.symbol}
                        </td>
                        {/* Make name clickable too */}
                        <td
                          onClick={() => handleStockNavigation(stock.symbol)}
                          style={{cursor: 'pointer'}}
                        >
                          {stock.name}
                        </td>
                        <td className="text-end">${stock.price.toFixed(2)}</td>
                        <td
                          className={`text-end ${
                            stock.percentChange >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {stock.percentChange >= 0 ? "+" : ""}
                          {stock.percentChange.toFixed(2)}%
                        </td>
                        <td>
                          <Badge bg="light" text="dark">
                            {stock.sector}
                          </Badge>
                        </td>
                        <td className="text-end">
                          {formatCurrency(stock.marketCap * 1000000)}
                        </td>
                        <td className="text-end">
                          {formatVolume(stock.volume)}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center">
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleStockNavigation(stock.symbol)}
                              title="View charts"
                            >
                              <i className="bi bi-graph-up"></i>
                            </Button>
                            
                            {/* Buy button */}
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleBuyClick(stock)}
                              title="Buy stock"
                            >
                              <i className="bi bi-cart-plus"></i>
                            </Button>
                            
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                tooltipStates[stock.symbol] ? (
                                  <Tooltip id={`tooltip-${stock.symbol}`}>
                                    {tooltipStates[stock.symbol]}
                                  </Tooltip>
                                ) : <></>
                              }
                            >
                              <Button
                                variant={watchlist.includes(stock.symbol) ? "warning" : "outline-secondary"}
                                size="sm"
                                onClick={() => handleAddWatchlist(stock.symbol)}
                                title={watchlist.includes(stock.symbol) ? "Remove from watchlist" : "Add to watchlist"}
                              >
                                <i className={`bi ${watchlist.includes(stock.symbol) ? "bi-star-fill" : "bi-star"}`}></i>
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-search fs-1 text-muted mb-3"></i>
                <p className="mb-0">No stocks match your search criteria.</p>
                <p className="text-muted">Try adjusting your search or filter settings.</p>
                <Button 
                  variant="outline-primary" 
                  className="mt-3"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Reset Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && currentStocks.length > 0 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {paginationItems}
                  <Pagination.Next
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="market-overview mb-4">
          <Row>
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>Market Movers</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">
                    Top gainers and losers today
                  </Card.Subtitle>
                  <div className="mt-3">
                    <h6>Top Gainers</h6>
                    <Table size="sm">
                      <tbody>
                        {stocks
                          .filter((stock) => stock.percentChange > 0)
                          .sort((a, b) => b.percentChange - a.percentChange)
                          .slice(0, 5)
                          .map((stock) => (
                            <tr 
                              key={`gainer-${stock.symbol}`}
                              onClick={() => handleStockNavigation(stock.symbol)}
                              style={{cursor: 'pointer'}}
                              className="hover-row"
                            >
                              <td width="15%">{stock.symbol}</td>
                              <td>{stock.name}</td>
                              <td className="text-end text-success">
                                +{stock.percentChange.toFixed(2)}%
                              </td>
                              <td className="text-end">
                                ${stock.price.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                  <div className="mt-3">
                    <h6>Top Losers</h6>
                    <Table size="sm">
                      <tbody>
                        {stocks
                          .filter((stock) => stock.percentChange < 0)
                          .sort((a, b) => a.percentChange - b.percentChange)
                          .slice(0, 5)
                          .map((stock) => (
                            <tr 
                              key={`loser-${stock.symbol}`}
                              onClick={() => handleStockNavigation(stock.symbol)}
                              style={{cursor: 'pointer'}}
                              className="hover-row"
                            >
                              <td width="15%">{stock.symbol}</td>
                              <td>{stock.name}</td>
                              <td className="text-end text-danger">
                                {stock.percentChange.toFixed(2)}%
                              </td>
                              <td className="text-end">
                                ${stock.price.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>Market Sectors</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">
                    Performance by sector
                  </Card.Subtitle>

                  <div className="mt-3">
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th>Sector</th>
                          <th className="text-end">Average Change</th>
                          <th className="text-end">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STOCK_CATEGORIES.slice(1).map((category) => {
                          const sectorStocks = stocks.filter((stock) =>
                            stock.sector
                              .toLowerCase()
                              .includes(category.value.toLowerCase())
                          );

                          if (sectorStocks.length === 0) return null;

                          const avgChange =
                            sectorStocks.reduce(
                              (sum, stock) => sum + stock.percentChange,
                              0
                            ) / sectorStocks.length;
                          const totalMarketCap = sectorStocks.reduce(
                            (sum, stock) => sum + stock.marketCap,
                            0
                          );

                          return (
                            <tr 
                              key={category.value} 
                              onClick={() => setSelectedCategory(category.value)}
                              style={{cursor: 'pointer'}}
                              className="hover-row"
                            >
                              <td>{category.label}</td>
                              <td
                                className={`text-end ${
                                  avgChange >= 0
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {avgChange >= 0 ? "+" : ""}
                                {avgChange.toFixed(2)}%
                              </td>
                              <td className="text-end">
                                {formatCurrency(totalMarketCap * 1000000)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <Button 
            variant="primary" 
            onClick={() => navigate('/stock-analysis')}
            size="lg"
          >
            <i className="bi bi-graph-up-arrow me-2"></i>
            Advanced Stock Analysis
          </Button>
        </div>
      </Container>

      {/* Buy Stock Modal */}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {buySuccess ? "Purchase Successful!" : `Buy ${selectedStock?.symbol}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {buySuccess ? (
            <div className="text-center">
              <div className="mb-3">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4>Transaction Completed!</h4>
              <p>You've successfully purchased {quantity} shares of {selectedStock?.symbol} at ${selectedStock?.price.toFixed(2)} per share.</p>
              <p className="fw-bold">Total: ${(selectedStock?.price * quantity).toFixed(2)}</p>
              <p className="small text-muted mt-3">You can view this transaction in your portfolio.</p>
            </div>
          ) : (
            <>
              {selectedStock && (
                <>
                  <div className="mb-3">
                    <h5 className="d-flex justify-content-between">
                      <span>{selectedStock.name} ({selectedStock.symbol})</span>
                      <span className={selectedStock.percentChange >= 0 ? "text-success" : "text-danger"}>
                        {selectedStock.percentChange >= 0 ? "+" : ""}
                        {selectedStock.percentChange.toFixed(2)}%
                      </span>
                    </h5>
                    <div className="fs-4 fw-bold mb-3">
                      ${selectedStock.price.toFixed(2)}
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <div className="d-flex align-items-center">
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <i className="bi bi-dash"></i>
                        </Button>
                        <Form.Control
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                          className="mx-2 text-center"
                          min="1"
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <i className="bi bi-plus"></i>
                        </Button>
                      </div>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-between">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setQuantity(5)}
                        className="me-1"
                      >
                        5
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setQuantity(10)}
                        className="me-1"
                      >
                        10
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setQuantity(25)}
                        className="me-1"
                      >
                        25
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setQuantity(50)}
                      >
                        50
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setQuantity(100)}
                      >
                        100
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-light p-3 rounded mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Current Price:</span>
                      <span>${selectedStock.price.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Quantity:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total Cost:</span>
                      <span>${(selectedStock.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    This will be added to your portfolio immediately.
                  </Alert>
                </>
              )}
            </>
          )}
        </Modal.Body>
        {!buySuccess && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBuyModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleBuyStock}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-cart-check me-2"></i>
                  Buy Now
                </>
              )}
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      <Footer />

      {/* Custom CSS */}
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .cursor-pointer:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        .hover-row:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
      `}</style>
    </div>
  );
};

export default StockListingPage;