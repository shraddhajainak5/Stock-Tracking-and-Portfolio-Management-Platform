// src/pages/BrokerDashboard/TransactionsPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button, Modal, Tabs, Tab } from 'react-bootstrap';
import BrokerNavbar from '../../components/broker/BrokerNavbar';
import Loader from '../../components/common/Loader';
import Error from '../../components/common/Error';
import Pagination from '../../components/common/Pagination';
import axios from 'axios';
import { useTheme } from '../../components/common/ThemeProvider';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTheme } = useTheme();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Transaction detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');
  
  const pageSize = 10;
  
  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        // This would be an actual API call in production
        // const response = await axios.get('/broker/transactions', {
        //   params: { 
        //     page: currentPage, 
        //     limit: pageSize, 
        //     search: searchTerm,
        //     sortBy,
        //     sortOrder,
        //     status: filterStatus !== 'all' ? filterStatus : undefined,
        //     type: filterType !== 'all' ? filterType : undefined
        //   },
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // const { transactions, totalTransactions } = response.data;
        // setTransactions(transactions);
        // setTotalTransactions(totalTransactions);
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        const mockTransactions = Array.from({ length: 35 }, (_, index) => ({
          id: `txn${index + 1}`,
          userId: {
            id: `user${Math.floor(index / 3) + 1}`,
            fullName: `Client ${Math.floor(index / 3) + 1}`
          },
          type: index % 2 === 0 ? 'buy' : 'sell',
          symbol: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'][index % 5],
          quantity: Math.floor(Math.random() * 50) + 1,
          price: (Math.random() * 500 + 50).toFixed(2),
          status: index % 5 === 0 ? 'pending' : 
                 index % 5 === 1 ? 'completed' : 
                 index % 5 === 2 ? 'rejected' : 
                 index % 5 === 3 ? 'cancelled' : 'pending',
          createdAt: new Date(Date.now() - (index * 86400000)).toISOString(),
          note: index % 5 === 2 ? 'Insufficient funds' : null
        }));
        
        // Calculate amount for each transaction
        mockTransactions.forEach(txn => {
          txn.amount = (parseFloat(txn.price) * txn.quantity).toFixed(2);
        });
        
        // Apply filters
        let filteredTransactions = [...mockTransactions];
        
        // Apply status filter
        if (filterStatus !== 'all') {
          filteredTransactions = filteredTransactions.filter(txn => txn.status === filterStatus);
        }
        
        // Apply type filter
        if (filterType !== 'all') {
          filteredTransactions = filteredTransactions.filter(txn => txn.type === filterType);
        }
        
        // Apply search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredTransactions = filteredTransactions.filter(txn => 
            txn.userId.fullName.toLowerCase().includes(term) || 
            txn.symbol.toLowerCase().includes(term) ||
            txn.id.toLowerCase().includes(term)
          );
        }
        
        // Apply sorting
        filteredTransactions.sort((a, b) => {
          if (sortBy === 'createdAt') {
            return sortOrder === 'asc' 
              ? new Date(a.createdAt) - new Date(b.createdAt)
              : new Date(b.createdAt) - new Date(a.createdAt);
          } else if (sortBy === 'amount') {
            return sortOrder === 'asc'
              ? parseFloat(a.amount) - parseFloat(b.amount)
              : parseFloat(b.amount) - parseFloat(a.amount);
          } else if (sortBy === 'symbol') {
            return sortOrder === 'asc'
              ? a.symbol.localeCompare(b.symbol)
              : b.symbol.localeCompare(a.symbol);
          }
          return 0;
        });
        
        setTotalTransactions(filteredTransactions.length);
        
        // Paginate
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);
        
        setTransactions(paginatedTransactions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transactions. Please try again.');
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentPage, searchTerm, sortBy, sortOrder, filterStatus, filterType]);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };
  
  // Handle filter change
  const handleFilterChange = (filter, value) => {
    if (filter === 'status') {
      setFilterStatus(value);
    } else if (filter === 'type') {
      setFilterType(value);
    }
    setCurrentPage(1);
  };
  
  // View transaction details
  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setRejectionNote('');
    setShowDetailModal(true);
  };
  
  // Process transaction (approve or reject)
  const processTransaction = async (action) => {
    if (action === 'reject' && !rejectionNote.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    try {
      setLoading(true);
      
      // This would be an actual API call in production
      // await axios.post('/broker/transactions/process', {
      //   transactionId: selectedTransaction.id,
      //   action,
      //   note: rejectionNote.trim() || undefined
      // }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Update the transaction in the list
      setTransactions(prevTransactions => 
        prevTransactions.map(txn => 
          txn.id === selectedTransaction.id
            ? { 
                ...txn, 
                status: action === 'approve' ? 'completed' : 'rejected',
                note: action === 'reject' ? rejectionNote : txn.note
              }
            : txn
        )
      );
      
      setShowDetailModal(false);
      setLoading(false);
      alert(`Transaction successfully ${action === 'approve' ? 'approved' : 'rejected'}.`);
    } catch (err) {
      console.error(`Error ${action}ing transaction:`, err);
      setError(`Failed to ${action} transaction. Please try again.`);
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (loading && transactions.length === 0) {
    return (
      <>
        <BrokerNavbar />
        <Container className="py-4">
          <Loader />
        </Container>
      </>
    );
  }
  
  return (
    <div style={{ backgroundColor: 'var(--neutralBg)', minHeight: '100vh' }}>
      <BrokerNavbar />
      
      <Container className="py-4">
        <Card style={{ 
          backgroundColor: 'var(--card)', 
          color: 'var(--textPrimary)', 
          border: '1px solid var(--border)' 
        }}>
          <Card.Body>
            <h2 style={{ color: 'var(--textPrimary)', marginBottom: '1.5rem' }}>Transactions</h2>
            
            {error && (
              <Error message={error} dismissible onClose={() => setError(null)} className="mb-4" />
            )}
            
            {/* Filters */}
            <div className="mb-4">
              <Row>
                <Col md={6} lg={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      style={{ 
                        backgroundColor: 'var(--card)', 
                        color: 'var(--textPrimary)', 
                        border: '1px solid var(--border)' 
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      value={filterType}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      style={{ 
                        backgroundColor: 'var(--card)', 
                        color: 'var(--textPrimary)', 
                        border: '1px solid var(--border)' 
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={12} lg={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <InputGroup>
                      <Form.Control 
                        style={{ 
                          backgroundColor: 'var(--card)', 
                          color: 'var(--textPrimary)', 
                          border: '1px solid var(--border)' 
                        }}
                        placeholder="Search by client, stock symbol, or ID..." 
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                      <Button 
                        variant="outline-primary"
                        onClick={() => setSearchTerm('')}
                        disabled={!searchTerm}
                      >
                        <i className="bi bi-x-lg"></i>
                      </Button>
                      <Button variant="outline-primary">
                        <i className="bi bi-search"></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </div>
            
            {/* Transactions table */}
            <div className="table-responsive">
              <Table 
                hover 
                style={{ 
                  color: 'var(--textPrimary)', 
                  '--bs-table-hover-bg': currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <thead>
                  <tr style={{ borderBottomColor: 'var(--border)' }}>
                    <th style={{ color: 'var(--textSecondary)' }}>ID</th>
                    <th style={{ color: 'var(--textSecondary)' }}>Client</th>
                    <th style={{ color: 'var(--textSecondary)' }}>Type</th>
                    <th 
                      style={{ color: 'var(--textSecondary)', cursor: 'pointer' }}
                      onClick={() => handleSort('symbol')}
                    >
                      Symbol
                      {sortBy === 'symbol' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th style={{ color: 'var(--textSecondary)' }}>Quantity</th>
                    <th style={{ color: 'var(--textSecondary)' }}>Price</th>
                    <th 
                      style={{ color: 'var(--textSecondary)', cursor: 'pointer' }}
                      onClick={() => handleSort('amount')}
                    >
                      Total
                      {sortBy === 'amount' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th style={{ color: 'var(--textSecondary)' }}>Status</th>
                    <th 
                      style={{ color: 'var(--textSecondary)', cursor: 'pointer' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      Date
                      {sortBy === 'createdAt' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th style={{ color: 'var(--textSecondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td>{transaction.userId.fullName}</td>
                      <td>
                        <Badge bg={transaction.type === 'buy' ? 'success' : 'danger'}>
                          {transaction.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td>{transaction.symbol}</td>
                      <td>{transaction.quantity}</td>
                      <td>${transaction.price}</td>
                      <td>${transaction.amount}</td>
                      <td>
                        <Badge bg={
                          transaction.status === 'pending' ? 'warning' :
                          transaction.status === 'completed' ? 'success' :
                          transaction.status === 'rejected' ? 'danger' :
                          'secondary'
                        }>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => viewTransactionDetails(transaction)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalTransactions > pageSize && (
              <div className="mt-3">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={totalTransactions}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
      
      {/* Transaction Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        size="lg"
        contentClassName={currentTheme === 'dark' ? 'bg-dark text-light' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        {selectedTransaction && (
          <Modal.Body>
            <Row className="mb-4">
              <Col md={6}>
                <h5>Transaction Information</h5>
                <Table bordered responsive size="sm" style={{ color: 'var(--textPrimary)' }}>
                  <tbody>
                    <tr>
                      <td width="40%"><strong>Transaction ID</strong></td>
                      <td>{selectedTransaction.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Client</strong></td>
                      <td>{selectedTransaction.userId.fullName}</td>
                    </tr>
                    <tr>
                      <td><strong>Type</strong></td>
                      <td>
                        <Badge bg={selectedTransaction.type === 'buy' ? 'success' : 'danger'}>
                          {selectedTransaction.type.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Status</strong></td>
                      <td>
                        <Badge bg={
                          selectedTransaction.status === 'pending' ? 'warning' :
                          selectedTransaction.status === 'completed' ? 'success' :
                          selectedTransaction.status === 'rejected' ? 'danger' :
                          'secondary'
                        }>
                          {selectedTransaction.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Date</strong></td>
                      <td>{formatDate(selectedTransaction.createdAt)}</td>
                    </tr>
                    {selectedTransaction.note && (
                      <tr>
                        <td><strong>Note</strong></td>
                        <td>{selectedTransaction.note}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h5>Stock Information</h5>
                <Table bordered responsive size="sm" style={{ color: 'var(--textPrimary)' }}>
                  <tbody>
                    <tr>
                      <td width="40%"><strong>Symbol</strong></td>
                      <td>{selectedTransaction.symbol}</td>
                    </tr>
                    <tr>
                      <td><strong>Quantity</strong></td>
                      <td>{selectedTransaction.quantity}</td>
                    </tr>
                    <tr>
                      <td><strong>Price</strong></td>
                      <td>${selectedTransaction.price}</td>
                    </tr>
                    <tr>
                      <td><strong>Total Amount</strong></td>
                      <td className="fw-bold">${selectedTransaction.amount}</td>
                    </tr>
                    <tr>
                      <td><strong>Current Price</strong></td>
                      <td>
                        ${(parseFloat(selectedTransaction.price) * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2)}
                        {' '}
                        <Badge bg="info">Market Price</Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            
            {selectedTransaction.status === 'pending' && (
              <>
                <hr />
                <h5>Process Transaction</h5>
                <p>Please approve or reject this transaction request:</p>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Rejection Note (required for rejection)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3}
                      placeholder="Enter reason for rejection..."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      style={currentTheme === 'dark' ? { backgroundColor: '#333', color: '#fff' } : {}}
                    />
                  </Form.Group>
                </Form>
                
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="danger" 
                    onClick={() => processTransaction('reject')}
                    disabled={loading}
                  >
                    Reject Transaction
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => processTransaction('approve')}
                    disabled={loading}
                  >
                    Approve Transaction
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransactionsPage;