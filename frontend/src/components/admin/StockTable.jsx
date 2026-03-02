import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Badge, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const StockTable = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stockToDelete, setStockToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStock, setEditStock] = useState({
    id: '',
    symbol: '',
    name: '',
    price: '',
    sector: '',
    active: true
  });

  // Fetch stocks on component mount
  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      
      // This is a mock implementation - replace with actual API call
      // In a real app, you would fetch from your API
      // const response = await axios.get(`${API_URL}/api/stocks`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockStocks = [
        { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 187.54, change: 1.24, sector: 'Technology', active: true },
        { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.32, change: -2.18, sector: 'Technology', active: true },
        { id: '3', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 175.98, change: 3.42, sector: 'Consumer Cyclical', active: true },
        { id: '4', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 162.78, change: 0.34, sector: 'Communication Services', active: true },
        { id: '5', symbol: 'TSLA', name: 'Tesla Inc.', price: 248.92, change: -4.76, sector: 'Consumer Cyclical', active: true },
        { id: '6', symbol: 'META', name: 'Meta Platforms Inc.', price: 472.11, change: 5.23, sector: 'Communication Services', active: true },
        { id: '7', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 877.35, change: 12.87, sector: 'Technology', active: true },
        { id: '8', symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 404.24, change: -0.56, sector: 'Financial Services', active: true },
        { id: '9', symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.44, change: 1.12, sector: 'Financial Services', active: true },
        { id: '10', symbol: 'V', name: 'Visa Inc.', price: 281.57, change: 0.89, sector: 'Financial Services', active: true },
      ];
      
      setStocks(mockStocks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Failed to load stocks. Please try again.');
      setLoading(false);
    }
  };

  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle stock deletion
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      // This is a mock implementation - replace with actual API call
      // await axios.delete(`${API_URL}/api/stocks/${stockToDelete.id}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove stock from state
      setStocks(prevStocks => prevStocks.filter(stock => stock.id !== stockToDelete.id));
      setShowDeleteModal(false);
      setStockToDelete(null);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting stock:', err);
      setError('Failed to delete stock. Please try again.');
      setLoading(false);
    }
  };

  // Handle stock edit
  const handleEdit = async () => {
    try {
      setLoading(true);
      
      // This is a mock implementation - replace with actual API call
      // await axios.put(`${API_URL}/api/stocks/${editStock.id}`, editStock, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update stock in state
      setStocks(prevStocks => 
        prevStocks.map(stock => 
          stock.id === editStock.id ? {...stock, ...editStock} : stock
        )
      );
      
      setShowEditModal(false);
      setEditStock({
        id: '',
        symbol: '',
        name: '',
        price: '',
        sector: '',
        active: true
      });
      setLoading(false);
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock. Please try again.');
      setLoading(false);
    }
  };

  // Handle stock addition
  const handleAdd = async () => {
    try {
      setLoading(true);
      
      // This is a mock implementation - replace with actual API call
      // const response = await axios.post(`${API_URL}/api/stocks`, editStock, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create a new stock with a generated ID
      const newStock = {
        ...editStock,
        id: Date.now().toString(),
        change: 0.00
      };
      
      // Add new stock to state
      setStocks(prevStocks => [...prevStocks, newStock]);
      
      setShowAddModal(false);
      setEditStock({
        id: '',
        symbol: '',
        name: '',
        price: '',
        sector: '',
        active: true
      });
      setLoading(false);
    } catch (err) {
      console.error('Error adding stock:', err);
      setError('Failed to add stock. Please try again.');
      setLoading(false);
    }
  };

  // Open edit modal with stock data
  const openEditModal = (stock) => {
    setEditStock({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      sector: stock.sector,
      active: stock.active
    });
    setShowEditModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditStock({
      id: '',
      symbol: '',
      name: '',
      price: '',
      sector: '',
      active: true
    });
    setShowAddModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (stock) => {
    setStockToDelete(stock);
    setShowDeleteModal(true);
  };

  if (loading && stocks.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading stocks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p className="mb-0">{error}</p>
        <Button 
          variant="outline-danger" 
          size="sm" 
          className="mt-2"
          onClick={() => {
            setError(null);
            fetchStocks();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <InputGroup style={{ maxWidth: '400px' }}>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search stocks by symbol, name, or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchTerm('')}
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </InputGroup>
        
        <div>
          <Button variant="outline-primary" className="me-2" onClick={fetchStocks}>
            <i className="bi bi-arrow-repeat me-1"></i> Refresh
          </Button>
          <Button variant="primary" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-1"></i> Add Stock
          </Button>
        </div>
      </div>
      
      {filteredStocks.length === 0 ? (
        <div className="alert alert-info">
          No stocks found matching "{searchTerm}".
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Change</th>
                <th>Sector</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map(stock => (
                <tr key={stock.id}>
                  <td>{stock.symbol}</td>
                  <td>{stock.name}</td>
                  <td>${stock.price.toFixed(2)}</td>
                  <td className={stock.change >= 0 ? 'text-success' : 'text-danger'}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </td>
                  <td>{stock.sector}</td>
                  <td>
                    <Badge bg={stock.active ? 'success' : 'secondary'}>
                      {stock.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => openEditModal(stock)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => openDeleteModal(stock)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <div className="text-muted">
            Showing {filteredStocks.length} of {stocks.length} stocks
          </div>
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the stock <strong>{stockToDelete?.symbol}</strong> ({stockToDelete?.name})?
          <div className="alert alert-warning mt-3">
            This action cannot be undone.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Stock'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Stock Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Symbol</Form.Label>
              <Form.Control
                type="text"
                value={editStock.symbol}
                onChange={(e) => setEditStock({...editStock, symbol: e.target.value.toUpperCase()})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editStock.name}
                onChange={(e) => setEditStock({...editStock, name: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={editStock.price}
                onChange={(e) => setEditStock({...editStock, price: parseFloat(e.target.value)})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sector</Form.Label>
              <Form.Select
                value={editStock.sector}
                onChange={(e) => setEditStock({...editStock, sector: e.target.value})}
              >
                <option value="">Select Sector</option>
                <option value="Technology">Technology</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Consumer Cyclical">Consumer Cyclical</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Communication Services">Communication Services</option>
                <option value="Energy">Energy</option>
                <option value="Utilities">Utilities</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Industrials">Industrials</option>
                <option value="Basic Materials">Basic Materials</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="stock-active-switch"
                label="Active"
                checked={editStock.active}
                onChange={(e) => setEditStock({...editStock, active: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEdit}
            disabled={loading || !editStock.symbol || !editStock.name || !editStock.price || !editStock.sector}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Add Stock Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Symbol</Form.Label>
              <Form.Control
                type="text"
                value={editStock.symbol}
                onChange={(e) => setEditStock({...editStock, symbol: e.target.value.toUpperCase()})}
                placeholder="e.g., AAPL"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editStock.name}
                onChange={(e) => setEditStock({...editStock, name: e.target.value})}
                placeholder="e.g., Apple Inc."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={editStock.price}
                onChange={(e) => setEditStock({...editStock, price: parseFloat(e.target.value)})}
                placeholder="e.g., 150.00"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sector</Form.Label>
              <Form.Select
                value={editStock.sector}
                onChange={(e) => setEditStock({...editStock, sector: e.target.value})}
              >
                <option value="">Select Sector</option>
                <option value="Technology">Technology</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Consumer Cyclical">Consumer Cyclical</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Communication Services">Communication Services</option>
                <option value="Energy">Energy</option>
                <option value="Utilities">Utilities</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Industrials">Industrials</option>
                <option value="Basic Materials">Basic Materials</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="stock-active-switch"
                label="Active"
                checked={editStock.active}
                onChange={(e) => setEditStock({...editStock, active: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleAdd}
            disabled={loading || !editStock.symbol || !editStock.name || !editStock.price || !editStock.sector}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              'Add Stock'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockTable;