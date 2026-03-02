// src/pages/BrokerDashboard/BrokerDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import BrokerNavbar from '../../components/broker/BrokerNavbar';
import Loader from '../../components/common/Loader';
import { useTheme } from '../../components/common/ThemeProvider';
import axios from 'axios';

const BrokerDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const { currentTheme } = useTheme();
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // This would be an actual API call in production
        // const response = await axios.get('/broker/stats', {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // setStats(response.data);
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        // Mock statistics
        const mockStats = {
          totalClients: 24,
          pendingTransactions: 5,
          recentTransactions: [
            {
              id: '1',
              userId: { fullName: 'John Doe', email: 'john@example.com' },
              type: 'buy',
              symbol: 'AAPL',
              quantity: 10,
              price: 185.92,
              amount: 1859.20,
              status: 'pending',
              createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
            },
            {
              id: '2',
              userId: { fullName: 'Jane Smith', email: 'jane@example.com' },
              type: 'sell',
              symbol: 'MSFT',
              quantity: 5,
              price: 415.50,
              amount: 2077.50,
              status: 'completed',
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
              id: '3',
              userId: { fullName: 'Robert Johnson', email: 'robert@example.com' },
              type: 'buy',
              symbol: 'TSLA',
              quantity: 3,
              price: 244.88,
              amount: 734.64,
              status: 'pending',
              createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
            }
          ],
          weeklyTransactions: [
            { day: 'Mon', count: 3, volume: 4500 },
            { day: 'Tue', count: 5, volume: 7200 },
            { day: 'Wed', count: 2, volume: 3100 },
            { day: 'Thu', count: 7, volume: 9500 },
            { day: 'Fri', count: 4, volume: 6200 },
            { day: 'Sat', count: 1, volume: 1800 },
            { day: 'Sun', count: 2, volume: 3400 }
          ]
        };
        
        // Mock pending transactions
        const mockPendingTransactions = mockStats.recentTransactions.filter(
          transaction => transaction.status === 'pending'
        );
        
        // Mock recent clients
        const mockRecentClients = [
          {
            id: '1',
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
            status: 'active',
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
          },
          {
            id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1 (555) 987-6543',
            status: 'active',
            createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
          },
          {
            id: '3',
            fullName: 'Robert Johnson',
            email: 'robert@example.com',
            phone: '+1 (555) 456-7890',
            status: 'active',
            createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
          }
        ];
        
        setStats(mockStats);
        setPendingTransactions(mockPendingTransactions);
        setRecentClients(mockRecentClients);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (loading) {
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
    <>
      <BrokerNavbar />
      
      <Container className="py-4">
        <h2 className="mb-4">Broker Dashboard</h2>
        
        {/* Alert for pending transactions */}
        {stats.pendingTransactions > 0 && (
          <Alert variant="warning" className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <i className="bi bi-exclamation-triangle me-2"></i>
              You have <strong>{stats.pendingTransactions}</strong> transaction requests pending approval.
            </div>
            <Link to="/broker/transactions">
              <Button variant="warning">Review Now</Button>
            </Link>
          </Alert>
        )}
        
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={4} className="mb-3 mb-md-0">
            <Card className="stockwise-card h-100">
              <Card.Body className="text-center">
                <div className="display-4 fw-bold" style={{ color: 'var(--primary)' }}>{stats.totalClients}</div>
                <p className="mb-0">Total Clients</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <Card className="stockwise-card h-100">
              <Card.Body className="text-center">
                <div className="display-4 fw-bold" style={{ color: 'var(--warning)' }}>{stats.pendingTransactions}</div>
                <p className="mb-0">Pending Transactions</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <Card className="stockwise-card h-100">
              <Card.Body className="text-center">
                <div className="display-4 fw-bold" style={{ color: 'var(--success)' }}>
                  ${stats.weeklyTransactions.reduce((sum, day) => sum + day.volume, 0).toLocaleString()}
                </div>
                <p className="mb-0">Weekly Volume</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Charts */}
        <Row className="mb-4">
          <Col lg={8} className="mb-4 mb-lg-0">
            <Card className="stockwise-card h-100">
              <Card.Body>
                <h5 className="mb-3">Transaction Volume (Last 7 Days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.weeklyTransactions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" stroke="var(--textSecondary)" />
                    <YAxis stroke="var(--textSecondary)" />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Volume']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--border-radius-sm)',
                        color: 'var(--textPrimary)'
                      }}
                    />
                    <Bar dataKey="volume" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="stockwise-card h-100">
              <Card.Body>
                <h5 className="mb-3">Transaction Count (Last 7 Days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.weeklyTransactions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" stroke="var(--textSecondary)" />
                    <YAxis stroke="var(--textSecondary)" />
                    <Tooltip
                      formatter={(value) => [value, 'Transactions']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--border-radius-sm)',
                        color: 'var(--textPrimary)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'var(--accent)' }}
                      activeDot={{ r: 6, fill: 'var(--accent)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Pending Transactions */}
        <Card className="stockwise-card mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Pending Transactions</h5>
              <Link to="/broker/transactions" className="text-decoration-none" style={{ color: 'var(--primary)' }}>
                View All
              </Link>
            </div>
            
            <div className="table-responsive">
              {pendingTransactions.length > 0 ? (
                <Table hover className="table-themed">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Stock</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>{transaction.userId.fullName}</td>
                        <td>
                          <Badge bg={transaction.type === 'buy' ? 'success' : 'danger'}>
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{transaction.symbol}</td>
                        <td>{transaction.quantity}</td>
                        <td>${transaction.price.toFixed(2)}</td>
                        <td>${transaction.amount.toFixed(2)}</td>
                        <td>{formatDate(transaction.createdAt)}</td>
                        <td>
                          <Link to={`/broker/transactions/${transaction.id}`}>
                            <Button variant="outline-primary" size="sm">
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3">
                  <p className="mb-0">No pending transactions</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
        
        {/* Recent Clients */}
        <Card className="stockwise-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Recent Clients</h5>
              <Link to="/broker/clients" className="text-decoration-none" style={{ color: 'var(--primary)' }}>
                View All Clients
              </Link>
            </div>
            
            <div className="table-responsive">
              <Table hover className="table-themed">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClients.map(client => (
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
                      <td>
                        <Link to={`/broker/clients/${client.id}`}>
                          <Button variant="outline-primary" size="sm">
                            <i className="bi bi-eye"></i>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default BrokerDashboardPage;