import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import "./WatchlistPreview.css";
import AppNavbar from "../../common/Navbar";
import { useNavigate } from 'react-router-dom';

const WatchlistPreview = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const navigate = useNavigate();


  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const handleViewDetails = (symbol) => {
    navigate(`/stock-analysis/${symbol}?symbol=${symbol}`);
  };

  const formatPercentChange = (percent) => {
    return percent > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const showToast = (message, type = 'success') => {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    const toastElement = document.createElement('div');
    toastElement.className = `toast-${type} show`;
    toastElement.innerHTML = `
      <div class="toast-icon"><i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i></div>
      <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.classList.add('toast-fade-out');
      setTimeout(() => {
        toastContainer.removeChild(toastElement);
      }, 300);
    }, 3000);
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!currentUser || !currentUser.id) {
        setWatchlist([]);
        return;
      }
      
      const response = await fetch(
        `http://localhost:3000/stocks/watchlist/${currentUser.id}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch watchlist");
      }
      
      const data = await response.json();
      setWatchlist(data.stockData || []);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
      showToast("Error loading watchlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!currentUser || !currentUser.id) {
        showToast("Please log in to manage your watchlist", "error");
        return;
      }
      
      const response = await fetch("http://localhost:3000/stocks/watchlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          symbol: symbol,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove from watchlist");
      }
      
      // Update the watchlist state
      setWatchlist(prevWatchlist => prevWatchlist.filter(stock => stock.symbol !== symbol));
      showToast(`Removed ${symbol} from watchlist`, "success");
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      showToast("Failed to remove from watchlist", "error");
    }
  };

  const handleBuyStock = (stock) => {
    setSelectedStock(stock);
    setQuantity(1);
    setShowBuyModal(true);
  };

  const handleSellStock = (stock) => {
    setSelectedStock(stock);
    setSellPrice(stock.data.c); // Initialize with current price
    setQuantity(1);
    setShowSellModal(true);
  };

  const handleConfirmBuy = async () => {
    try {
      setProcessingTransaction(true);
      // Logic to handle buy transaction
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      
      if (!currentUser || !currentUser.id) {
        showToast("Please log in to buy stocks", "error");
        setShowBuyModal(false);
        return;
      }
      
      const response = await fetch("http://localhost:3000/stocks/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          symbol: selectedStock.symbol,
          quantity: quantity,
          price: selectedStock.data.c,
          type: "BUY",
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Close modal and reset state
        setShowBuyModal(false);
        setSelectedStock(null);
        setQuantity(1);
        
        // Show success toast
        showToast(`Successfully purchased ${quantity} shares of ${selectedStock.symbol}`, 'success');
      } else {
        // Show error toast
        const errorData = await response.json();
        showToast(`Transaction failed: ${errorData.message || "Please try again."}`, 'error');
      }
    } catch (error) {
      console.error("Error processing buy transaction:", error);
      showToast("An error occurred. Please try again.", 'error');
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleConfirmSell = async () => {
    try {
      setProcessingTransaction(true);
      // Logic to handle sell transaction
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!currentUser || !currentUser.id) {
        showToast("Please log in to sell stocks", "error");
        setShowSellModal(false);
        return;
      }
      
      const response = await fetch("http://localhost:3000/stocks/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          symbol: selectedStock.symbol,
          quantity: quantity,
          price: sellPrice,
          type: "SELL",
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setShowSellModal(false);
        setSelectedStock(null);
        setQuantity(1);
        setSellPrice(0);
        
        showToast(`Successfully sold ${quantity} shares of ${selectedStock.symbol}`, 'success');
      } else {
        const errorData = await response.json();
        showToast(`Transaction failed: ${errorData.message || "Please try again."}`, 'error');
      }
    } catch (error) {
      console.error("Error processing sell transaction:", error);
      showToast("An error occurred. Please try again.", 'error');
    } finally {
      setProcessingTransaction(false);
    }
  };


  if (loading && watchlist.length === 0) return (
    <div className="loading-container">
      <div className="spinner-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="mt-3 font-inter">Loading your watchlist...</p>
    </div>
  );

  return (
    <>
      <AppNavbar />
      <div
        className="container-fluid p-3"
        style={{ backgroundColor: "var(--neutral-bg-light)" }}
      >
        <h1 className="text-start mb-4 font-poppins fw-bold text-primary-custom ps-5">
          Your Watchlist
        </h1>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-11">
            {watchlist.length > 0 ? (
              watchlist.map((stock, index) => {
                const isPositive = stock && stock.data && stock.data.d > 0;

                return (
                  <div className="custom-card card mb-3 hover-lift" key={stock.symbol}>
                    <div
                      className={`stock-item ${
                        index === watchlist.length - 1 ? "" : "mb-2"
                      }`}
                    >
                      <div className="row align-items-center">
                        <div className="col-12 col-md-2 mb-3 mb-md-0">
                          <div className="d-flex flex-column align-items-center">
                            <h2 className="fs-2 fw-bold mb-0 font-poppins text-primary-custom">
                              {stock.symbol}
                            </h2>
                            <span
                              className={`price-pill d-inline-flex align-items-center mt-2 ${
                                isPositive ? "positive-change" : "negative-change"
                              }`}
                            >
                              <i
                                className={`bi ${
                                  isPositive
                                    ? "bi-arrow-up-right"
                                    : "bi-arrow-down-right"
                                } me-1`}
                              ></i>
                              {formatPercentChange(stock.data.dp)}
                            </span>
                          </div>
                        </div>

                        <div className="col-6 col-md-1 mb-3 mb-md-0 text-center">
                          <div>
                            <p className="text-secondary-custom mb-1 font-inter">
                              <i className="bi bi-clock me-1"></i>
                              {formatDate(stock.data.t)}
                            </p>
                          </div>
                        </div>

                        <div className="col-6 col-md-2 mb-3 mb-md-0 text-center">
                          <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                            Current
                          </p>
                          <p className="fs-4 fw-bold font-inter mb-0 d-flex align-items-center justify-content-center">
                            <i className="bi bi-currency-dollar"></i>
                            {formatPrice(stock.data.c)}
                          </p>
                        </div>

                        <div className="col-4 col-md-1 mb-3 mb-md-0 text-center">
                          <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                            Previous
                          </p>
                          <p className="mb-0 font-inter text-primary-custom">
                            ${formatPrice(stock.data.pc)}
                          </p>
                        </div>

                        <div className="col-4 col-md-1 text-center">
                          <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                            Open
                          </p>
                          <p className="mb-0 fw-bold font-inter text-primary-custom">
                            ${formatPrice(stock.data.o)}
                          </p>
                        </div>
                        <div className="col-4 col-md-1 text-center">
                          <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                            High
                          </p>
                          <p className="mb-0 fw-bold font-inter text-success-custom">
                            ${formatPrice(stock.data.h)}
                          </p>
                        </div>
                        <div className="col-4 col-md-1 text-center">
                          <p className="text-secondary-custom text-uppercase small fw-bold mb-1 font-inter">
                            Low
                          </p>
                          <p className="mb-0 fw-bold font-inter text-danger-custom">
                            ${formatPrice(stock.data.l)}
                          </p>
                        </div>
                        <div className="col-12 col-md-3 mt-2 mt-md-0">
                          <div className="d-flex flex-column gap-2 action-buttons">
                            <button className="custom-btn-primary btn py-2 fw-medium font-inter w-100 rounded-pill" onClick={() => handleViewDetails(stock.symbol)}>
                              <i className="bi bi-eye me-1"></i> View Details
                            </button>
                            <div className="d-flex gap-2">
                              <button className="buy-btn btn py-2 fw-medium font-inter flex-grow-1 rounded-pill" onClick={() => handleBuyStock(stock)}>
                                <i className="bi bi-cart-plus me-1"></i> Buy
                              </button>
                              {/* <button className="sell-btn btn py-2 fw-medium font-inter flex-grow-1 rounded-pill" onClick={() => handleTransaction(stock, "SELL")}>
                                <i className="bi bi-cart-dash me-1"></i> Sell
                              </button> */}
                              <button 
                                className="btn btn-outline-secondary py-2 fw-medium font-inter rounded-pill" 
                                onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                                title="Remove from watchlist"
                              >
                                <i className="bi bi-x-circle"></i>
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
                  <i className="bi bi-bookmark-star fs-1 text-secondary-custom mb-3"></i>
                  <h3 className="font-poppins fs-5">Your watchlist is empty</h3>
                  <p className="font-inter text-secondary-custom mb-4">Add stocks to your watchlist to track their performance</p>
                  <button className="btn custom-btn-primary px-4 py-2 font-inter rounded-pill" onClick={() => navigate("/stocks")}>
                    <i className="bi bi-search me-2"></i>
                    Browse Stocks
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} centered>
        <Modal.Header closeButton className="bg-primary-custom text-white">
          <Modal.Title>
            <i className="bi bi-cart-plus me-2"></i>
            Buy {selectedStock?.symbol}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedStock && (
            <>
              <div className="mb-3">
                <h5 className="d-flex justify-content-between">
                  <span>{selectedStock.symbol}</span>
                  <span className={selectedStock.data.dp >= 0 ? "text-success" : "text-danger"}>
                    {selectedStock.data.dp >= 0 ? "+" : ""}
                    {selectedStock.data.dp.toFixed(2)}%
                  </span>
                </h5>
                <div className="fs-4 fw-bold mb-3">
                  ${selectedStock.data.c.toFixed(2)}
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
                
                <div className="d-flex justify-content-between mb-3">
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
                    className="me-1"
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
                  <span>${selectedStock.data.c.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Trading Fee:</span>
                  <span>$0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total Cost:</span>
                  <span>${(selectedStock.data.c * quantity).toFixed(2)}</span>
                </div>
              </div>
              
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                This will be added to your portfolio immediately.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuyModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleConfirmBuy}
            disabled={processingTransaction}
          >
            {processingTransaction ? (
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
      </Modal>
      
      {/* Sell Modal */}
      <Modal show={showSellModal} onHide={() => setShowSellModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-cart-dash me-2"></i>
            Sell {selectedStock?.symbol}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedStock && (
            <>
              <div className="mb-3">
                <h5 className="d-flex justify-content-between">
                  <span>{selectedStock.symbol}</span>
                  <span className={selectedStock.data.dp >= 0 ? "text-success" : "text-danger"}>
                    {selectedStock.data.dp >= 0 ? "+" : ""}
                    {selectedStock.data.dp.toFixed(2)}%
                  </span>
                </h5>
                
                <div className="stock-info-card mb-4 p-3 bg-light rounded-3">
                  <div className="row">
                    <div className="col-6 border-end">
                      <div className="text-center">
                        <span className="text-muted d-block mb-1">Current Price</span>
                        <span className="fw-bold fs-4 text-primary">
                          ${selectedStock.data.c.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <span className="text-muted d-block mb-1">Previous Close</span>
                        <span className="fw-bold fs-4 text-primary">
                          ${selectedStock.data.pc.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Sell Price</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </Form.Group>
                
                <div className="d-flex mb-3">
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => setSellPrice(selectedStock.data.c * 0.95)}
                  >
                    -5%
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => setSellPrice(selectedStock.data.c)}
                  >
                    Market
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSellPrice(selectedStock.data.c * 1.05)}
                  >
                    +5%
                  </Button>
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
                
                <div className="d-flex justify-content-between mb-3">
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
                    className="me-1"
                  >
                    50
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuantity(100)}
                  >
                    Max
                  </Button>
                </div>
                
                <div className="bg-light p-3 rounded mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Sell Price × Quantity:</span>
                    <span>${(sellPrice * quantity).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Trading Fee:</span>
                    <span>$0.00</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total Revenue:</span>
                    <span className="text-success">${(sellPrice * quantity).toFixed(2)}</span>
                  </div>
                </div>
                
                {sellPrice < selectedStock.data.c * 0.95 && (
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Your sell price is significantly below current market value.
                  </Alert>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSellModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmSell}
            disabled={processingTransaction}
          >
            {processingTransaction ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-cart-check me-2"></i>
                Sell Now
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast container and CSS */}
      <div id="toast-container" className="position-fixed bottom-0 end-0 p-3"></div>
      
      <style jsx>{`
        .toast-success,
        .toast-error {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          z-index: 1060;
          animation: toast-slide-in 0.3s ease forwards;
          color: white;
        }
        
        .toast-success {
          background-color: var(--accent, #43A047);
        }
        
        .toast-error {
          background-color: var(--danger, #E53935);
        }
        
        .toast-icon {
          margin-right: 12px;
          font-size: 1.5rem;
        }
        
        .toast-message {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
        }
        
        .toast-fade-out {
          animation: toast-fade-out 0.3s ease forwards;
        }
        
        @keyframes toast-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes toast-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default WatchlistPreview;