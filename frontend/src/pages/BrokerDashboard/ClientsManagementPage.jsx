// src/pages/BrokerDashboard/ClientsManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BrokerNavbar from '../../components/broker/BrokerNavbar';
import Loader from '../../components/common/Loader';
import Error from '../../components/common/Error';
import Pagination from '../../components/common/Pagination';
import axios from 'axios';
import { useTheme } from '../../components/common/ThemeProvider';

const ClientsManagementPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTheme } = useTheme();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientEmail, setNewClientEmail] = useState('');
  
  const pageSize = 10;
  
  // Fetch clients data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        
        // This would be an actual API call in production
        // const response = await axios.get('/broker/clients', {
        //   params: { page: currentPage, limit: pageSize, search: searchTerm, sortBy, sortOrder },
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // const { clients, totalClients } = response.data;
        // setClients(clients);
        // setTotalClients(totalClients);
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        const mockClients = Array.from({ length: 24 }, (_, index) => ({
          id: index + 1,
          fullName: `Client ${index + 1}`,
          email: `client${index + 1}@example.com`,
          phone: `+1 (555) ${100 + index}-${4000 + index}`,
          status: index % 5 === 0 ? 'pending' : 'active',
          createdAt: new Date(Date.now() - (index * 86400000 * 3)).toISOString(),
          lastLogin: index % 4 !== 0 ? new Date(Date.now() - (index * 3600000)).toISOString() : null,
          transactions: Math.floor(Math.random() * 20),
          totalValue: Math.floor(Math.random() * 50000 + 1000)
        }));
        
        // Apply search filter
        let filteredClients = [...mockClients];
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredClients = filteredClients.filter(client => 
            client.fullName.toLowerCase().includes(term) || 
            client.email.toLowerCase().includes(term) ||
            client.phone.includes(term)
          );
        }
        
        // Apply sorting
        filteredClients.sort((a, b) => {
          if (sortBy === 'createdAt') {
            return sortOrder === 'asc' 
              ? new Date(a.createdAt) - new Date(b.createdAt)
              : new Date(b.createdAt) - new Date(a.createdAt);
          } else if (sortBy === 'fullName') {
            return sortOrder === 'asc'
              ? a.fullName.localeCompare(b.fullName)
              : b.fullName.localeCompare(a.fullName);
          } else if (sortBy === 'transactions') {
            return sortOrder === 'asc'
              ? a.transactions - b.transactions
              : b.transactions - a.transactions;
          } else if (sortBy === 'totalValue') {
            return sortOrder === 'asc'
              ? a.totalValue - b.totalValue
              : b.totalValue - a.totalValue;
          }
          return 0;
        });
        
        setTotalClients(filteredClients.length);
        
        // Paginate
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedClients = filteredClients.slice(startIndex, startIndex + pageSize);
        
        setClients(paginatedClients);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to fetch clients. Please try again.');
        setLoading(false);
      }
    };
    
    fetchClients();
  }, [currentPage, searchTerm, sortBy, sortOrder]);
  
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
  
  // View client details
  const viewClientDetails = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };
  
  // Add new client
  const handleAddClient = async () => {
    if (!newClientEmail.trim()) {
      setError('Email is required.');
      return;
    }
    
    try {
      setLoading(true);
      
      // This would be an actual API call in production
      // await axios.post('/broker/clients/add', { email: newClientEmail }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      setShowAddModal(false);
      setNewClientEmail('');
      
      // Add new client to the list
      const newClient = {
        id: clients.length + 1,
        fullName: `New Client`,
        email: newClientEmail,
        phone: `+1 (555) 123-4567`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        transactions: 0,
        totalValue: 0
      };
      
      setClients(prevClients => [newClient, ...prevClients]);
      setTotalClients(prevTotal => prevTotal + 1);
      
      setLoading(false);
      alert('Client invitation sent successfully!');
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client. Please try again.');
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (loading && clients.length === 0) {
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ color: 'var(--textPrimary)' }}>Client Management</h2>
              <Button 
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Client
              </Button>
            </div>
            
            {error && (
              <Error message={error} dismissible onClose={() => setError(null)} className="mb-4" />
            )}
            
            {/* Search and filter controls */}
            <div className="mb-3">
              <InputGroup>
                <Form.Control 
                  style={{ 
                    backgroundColor: 'var(--card)', 
                    color: 'var(--textPrimary)', 
                    border: '1px solid var(--border)' 
                  }}
                  placeholder="Search clients..." 
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
            </div>
            
            {/* Clients table */}
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
                    <th 
                      style={{ color: 'var(--textSecondary)', cursor: 'pointer' }} 
                      onClick={() => handleSort('fullName')}
                    >
                      Name
                      {sortBy === 'fullName' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th style={{ color: 'var(--textSecondary)' }}>Email</th>
                    <th style={{ color: 'var(--textSecondary)' }}>Phone</th>
                    <th style={{ color: 'var(--textSecondary)' }}>Status</th>
                    <th 
                      style={{ color: 'var(--textSecondary)', cursor: 'pointer' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      Joined Date
                      {sortBy === 'createdAt' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      style={{ color: 'var(--textSecondary)', cursor: 'pointer' }}
                      onClick={() => handleSort('transactions')}
                    >
                      Transactions
                      {sortBy === 'transactions' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      style={{ color: 'var(--textSecondary)', cursor: 'pointer' }}
                      onClick={() => handleSort('totalValue')}
                    >
                      Portfolio Value
                      {sortBy === 'totalValue' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th style={{ color: 'var(--textSecondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td>{client.fullName}</td>
                      <td>{client.email}</td>
                      <td>{client.phone}</td>
                      <td>
                        <Badge bg={
                          client.status === 'active' ? 'success' : 
                          client.status === 'pending' ? 'warning' :
                          'danger'
                        }>
                          {client.status}
                        </Badge>
                      </td>
                      <td>{formatDate(client.createdAt)}</td>
                      <td>{client.transactions}</td>
                      <td>${client.totalValue.toLocaleString()}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="me-2"
                          onClick={() => viewClientDetails(client)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Link to={`/broker/clients/${client.id}`}>
                          <Button variant="outline-secondary" size="sm">
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalClients > pageSize && (
              <div className="mt-3">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={totalClients}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
      
      {/* Add Client Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)}
        contentClassName={currentTheme === 'dark' ? 'bg-dark text-light' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter the email address of the client you'd like to add:</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="client@example.com"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                style={currentTheme === 'dark' ? { backgroundColor: '#333', color: '#fff' } : {}}
              />
              <Form.Text className="text-muted">
                An invitation will be sent to this email address.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddClient}>
            Send Invitation
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* View Client Modal */}
      <Modal 
        show={showViewModal} 
        onHide={() => setShowViewModal(false)}
        size="lg"
        contentClassName={currentTheme === 'dark' ? 'bg-dark text-light' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>Client Details</Modal.Title>
        </Modal.Header>
        {selectedClient && (
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h5>{selectedClient.fullName}</h5>
                <p>
                  <i className="bi bi-envelope me-2"></i>
                  {selectedClient.email}
                </p>
                <p>
                  <i className="bi bi-telephone me-2"></i>
                  {selectedClient.phone}
                </p>
                <p>
                  <i className="bi bi-calendar-check me-2"></i>
                  Joined: {formatDate(selectedClient.createdAt)}
                </p>
                <p>
                  <i className="bi bi-clock-history me-2"></i>
                  Last Login: {selectedClient.lastLogin ? formatDate(selectedClient.lastLogin) : 'Never'}
                </p>
                <div className="mb-3">
                  <Badge bg={
                    selectedClient.status === 'active' ? 'success' : 
                    selectedClient.status === 'pending' ? 'warning' :
                    'danger'
                  }>
                    {selectedClient.status}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <Card 
                  style={{ 
                    backgroundColor: currentTheme === 'dark' ? '#2c2c2c' : '#f8f9fa',
                    border: currentTheme === 'dark' ? '1px solid #444' : '1px solid #dee2e6'
                  }}
                >
                  <Card.Body>
                    <h6>Portfolio Summary</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Value:</span>
                      <span className="fw-bold">${selectedClient.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Transactions:</span>
                      <span className="fw-bold">{selectedClient.transactions}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Last Transaction:</span>
                      <span>{selectedClient.transactions > 0 ? '3 days ago' : 'N/A'}</span>
                    </div>
                  </Card.Body>
                </Card>
                
                <div className="mt-3 d-grid gap-2">
                  <Link to={`/broker/clients/${selectedClient.id}`}>
                    <Button variant="primary" className="w-100">
                      <i className="bi bi-pencil me-2"></i>
                      Edit Client
                    </Button>
                  </Link>
                  <Link to={`/broker/clients/${selectedClient.id}/transactions`}>
                    <Button variant="outline-primary" className="w-100">
                      <i className="bi bi-currency-exchange me-2"></i>
                      View Transactions
                    </Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientsManagementPage;