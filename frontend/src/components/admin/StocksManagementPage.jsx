// src/pages/admin/StocksManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Loader from '../../components/common/Loader';
import Error from '../../components/common/Error';
import Pagination from '../../components/common/Pagination';
import { useTheme } from '../common/ThemeProvider';

const StocksManagementPage = () => {
  const [stocks, setStocks] = useState([]);
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStocks, setTotalStocks] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockForm, setStockForm] = useState({
    symbol: '',
    name: '',
    price: '',
    sector: '',
    isActive: true
  });
  
  const pageSize = 10;
  
  // Fetch stocks data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        const mockStocks = Array.from({ length: 25 }, (_, index) => ({
          id: index + 1,
          symbol: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'][index % 5] + (Math.floor(index / 5) || ''),
          name: [
            'Apple Inc.', 
            'Microsoft Corporation', 
            'Alphabet Inc.', 
            'Amazon.com Inc.', 
            'Meta Platforms Inc.'
          ][index % 5] + (Math.floor(index / 5) ? ` Class ${Math.floor(index / 5)}` : ''),
          price: (100 + Math.random() * 900).toFixed(2),
          change: (Math.random() * 10 - 5).toFixed(2),
          percentChange: (Math.random() * 6 - 3).toFixed(2),
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: `$${(Math.random() * 2000 + 200).toFixed(0)}B`,
          sector: ['Technology', 'Finance', 'Healthcare', 'Consumer Goods', 'Energy'][index % 5],
          isActive: Math.random() > 0.2
        }));
        
        // Apply search filter if needed
        let filteredStocks = [...mockStocks];
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredStocks = filteredStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(term) || 
            stock.name.toLowerCase().includes(term) ||
            stock.sector.toLowerCase().includes(term)
          );
        }
        
        setTotalStocks(filteredStocks.length);
        
        // Paginate
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedStocks = filteredStocks.slice(startIndex, startIndex + pageSize);
        
        setStocks(paginatedStocks);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stocks:', err);
        setError('Failed to fetch stocks. Please try again.');
        setLoading(false);
      }
    };
    
    fetchStocks();
  }, [currentPage, searchTerm]);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Open add stock modal
  const openAddModal = () => {
    setStockForm({
      symbol: '',
      name: '',
      price: '',
      sector: '',
      isActive: true
    });
    setShowAddModal(true);
  };
  
  // Open edit stock modal
  const openEditModal = (stock) => {
    setSelectedStock(stock);
    setStockForm({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      sector: stock.sector,
      isActive: stock.isActive
    });
    setShowEditModal(true);
  };
  
  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStockForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle stock form submission
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!stockForm.symbol || !stockForm.name || !stockForm.price || !stockForm.sector) {
      setError('All fields are required.');
      return;
    }
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      if (showAddModal) {
        // Add new stock
        const newStock = {
          id: stocks.length + 1,
          ...stockForm,
          change: '0.00',
          percentChange: '0.00',
          volume: Math.floor(Math.random() * 1000000),
          marketCap: `$${(parseFloat(stockForm.price) * 10).toFixed(0)}B`
        };
        
        setStocks(prev => [...prev, newStock]);
        setTotalStocks(prev => prev + 1);
        setShowAddModal(false);
        alert('Stock added successfully!');
      } else {
        // Update existing stock
        setStocks(prev => 
          prev.map(stock => 
            stock.id === selectedStock.id ? { ...stock, ...stockForm } : stock
          )
        );
        setShowEditModal(false);
        alert('Stock updated successfully!');
      }
    } catch (err) {
      console.error('Error saving stock:', err);
      setError('Failed to save stock. Please try again.');
    }
  };
  
  // Toggle stock active status
  const toggleStockStatus = async (stockId) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
      
      setStocks(prev => 
        prev.map(stock => 
          stock.id === stockId ? { ...stock, isActive: !stock.isActive } : stock
        )
      );
    } catch (err) {
      console.error('Error toggling stock status:', err);
      setError('Failed to update stock status. Please try again.');
    }
  };
  
  if (loading && stocks.length === 0) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-4">
          <Loader />
        </Container>
      </>
    );
  }
  
  return (
    <div style={{ backgroundColor: 'var(--neutralBg)', minHeight: '100vh' }}>
      <AdminNavbar />
      
      <Container className="py-4">
        <Card style={{ 
          backgroundColor: 'var(--card)', 
          color: 'var(--textPrimary)', 
          border: '1px solid var(--border)' 
        }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ color: 'var(--textPrimary)' }}>Stocks Management</h2>
              <Button 
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  borderColor: 'var(--primary)' 
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Stock
              </Button>
            </div>
            
            {/* Stock search/filter controls */}
            <div className="mb-3">
              <InputGroup>
                <Form.Control 
                  style={{ 
                    backgroundColor: 'var(--card)', 
                    color: 'var(--textPrimary)', 
                    border: '1px solid var(--border)' 
                  }}
                  placeholder="Search stocks..." 
                />
                <Button variant="outline-primary">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </div>
            
            {/* Stocks table */}
            <Table 
              hover 
              style={{ 
                color: 'var(--textPrimary)', 
                '--bs-table-hover-bg': currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
              }}
            >
              {/* Table content */}
            </Table>
          </Card.Body>
        </Card>
      </Container>
      
      {/* Add Stock Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleStockSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Symbol</Form.Label>
              <Form.Control
                type="text"
                name="symbol"
                value={stockForm.symbol}
                onChange={handleFormChange}
                placeholder="e.g. AAPL"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={stockForm.name}
                onChange={handleFormChange}
                placeholder="e.g. Apple Inc."
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={stockForm.price}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  required
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sector</Form.Label>
              <Form.Select
                name="sector"
                value={stockForm.sector}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Sector</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Consumer Goods">Consumer Goods</option>
                <option value="Energy">Energy</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                checked={stockForm.isActive}
                onChange={handleFormChange}
                label="Stock is active"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Stock
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Edit Stock Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleStockSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Symbol</Form.Label>
              <Form.Control
                type="text"
                name="symbol"
                value={stockForm.symbol}
                onChange={handleFormChange}
                placeholder="e.g. AAPL"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={stockForm.name}
                onChange={handleFormChange}
                placeholder="e.g. Apple Inc."
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={stockForm.price}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  required
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sector</Form.Label>
              <Form.Select
                name="sector"
                value={stockForm.sector}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Sector</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Consumer Goods">Consumer Goods</option>
                <option value="Energy">Energy</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                checked={stockForm.isActive}
                onChange={handleFormChange}
                label="Stock is active"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Stock
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
   </div>
  );
};

export default StocksManagementPage;