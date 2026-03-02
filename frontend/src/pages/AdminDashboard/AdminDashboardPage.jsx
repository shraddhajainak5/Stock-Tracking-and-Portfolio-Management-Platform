import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminNavbar from './../../components/admin/AdminNavbar';
import Loader from './../../components/common/Loader';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../components/common/ThemeProvider';
import axios from 'axios';
import Footer from '../../components/common/Footer';

// API URL
const API_URL = "http://localhost:3000";

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const { currentTheme } = useTheme();

  // Color configuration based on theme
  const getChartColors = () => {
    return currentTheme === 'dark' 
      ? ['#4dabf7', '#63e6be', '#ffd43b', '#ff6b6b', '#da77f2'] // Brighter colors for dark mode
      : ['#1E88E5', '#00ACC1', '#43A047', '#E53935', '#8E24AA']; // Original colors for light mode
  };
  
  // Add a function to get stat card styling based on theme
  const getStatCardStyle = (colorType) => {
    // Base styles for the card
    const baseStyle = {
      height: '100%',
      backgroundColor: currentTheme === 'dark' ? '#1e1e1e' : 'white',
      color: 'var(--textPrimary)'
    };
    
    // Color mapping for the number display
    const colorMap = {
      primary: 'var(--primary)',
      accent: 'var(--accent)',
      warning: 'var(--warning)',
      danger: 'var(--danger)'
    };
    
    return {
      card: baseStyle,
      number: { color: colorMap[colorType] }
    };
  };

  // Function to get badge color based on status
  const getStatusBadgeProps = (status) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'success',
          style: { backgroundColor: 'var(--accent)' }
        };
      case 'rejected':
        return {
          bg: 'danger',
          style: { backgroundColor: 'var(--danger)' }
        };
      case 'pending':
      default:
        return {
          bg: 'warning',
          style: { backgroundColor: 'var(--warning, #ffc107)' }
        };
    }
  };

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        // Fetch dashboard stats
        const statsResponse = await axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Dashboard stats response:', statsResponse.data);
        setStats(statsResponse.data);

        // Fetch recent users
        const recentUsersResponse = await axios.get(`${API_URL}/admin/recent-users?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Recent users response:', recentUsersResponse.data);
        setRecentUsers(recentUsersResponse.data.recentUsers || []);

        // Fetch pending users count
        const pendingUsersResponse = await axios.get(`${API_URL}/user/getAll`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Count users with verified === 'pending'
        const pendingUsers = (pendingUsersResponse.data.users || []).filter(
          user => user.verified === 'pending'
        );
        setPendingCount(pendingUsers.length);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data. Please try again.');
        setLoading(false);

        // Set fallback data for development/testing
        setFallbackData();
      }
    };

    fetchDashboardData();
  }, []);

  // Set fallback data if API calls fail
  const setFallbackData = () => {
    // Fallback statistics
    const fallbackStats = {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0,
      rejectedUsers: 0,
      weeklyRegistrations: [
        { day: 'Mon', count: 0 },
        { day: 'Tue', count: 0 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 0 },
        { day: 'Sat', count: 0 },
        { day: 'Sun', count: 0 }
      ],
      userStatuses: [
        { name: 'Approved', value: 0 },
        { name: 'Pending', value: 0 },
        { name: 'Rejected', value: 0 }
      ],
      userTypes: [
        { name: 'Regular User', value: 0 },
        { name: 'Admin', value: 0 }
      ],
      stockPerformance: [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 },
        { name: 'Apr', value: 0 },
        { name: 'May', value: 0 },
        { name: 'Jun', value: 0 },
        { name: 'Jul', value: 0 }
      ]
    };

    setStats(fallbackStats);
    setRecentUsers([]);
    setPendingCount(0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Process data for charts if needed
  const processChartData = () => {
    if (!stats) return null;

    // Create data for user status pie chart
    const userStatusData = [
      { name: 'Approved', value: stats.activeUsers },
      { name: 'Pending', value: stats.pendingUsers },
      { name: 'Rejected', value: stats.rejectedUsers }
    ];

    return {
      userStatusData
    };
  };

  const chartData = processChartData();

  if (loading) {
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
    <>
      <AdminNavbar />

      <Container className="py-4">
        <h2 className="mb-4">Admin Dashboard</h2>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {error}
          </Alert>
        )}

        {/* Alert for pending approvals */}
        {pendingCount > 0 && (
          <Alert variant="warning" className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <i className="bi bi-exclamation-triangle me-2"></i>
              You have <strong>{pendingCount}</strong> user registrations pending approval.
            </div>
            <Link to="/admin/verify-users">
              <Button variant="warning">Review Now</Button>
            </Link>
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="stockwise-card h-100" style={getStatCardStyle('primary').card}>
              <Card.Body className="text-center">
                <div className="display-4 fw-bold" style={getStatCardStyle('primary').number}>
                  {stats?.totalUsers || 0}
                </div>
                <p className="mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3 mb-md-0">
            <Card className="stockwise-card h-100" style={getStatCardStyle('accent').card}>
              <Card.Body className="text-center">
                <div className="display-4 fw-bold" style={getStatCardStyle('accent').number}>
                  {stats?.activeUsers || 0}
                </div>
                <p className="mb-0">Approved Users</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3 mb-md-0">
            <Card className="stockwise-card h-100" style={getStatCardStyle('warning').card}>
              <Card.Body className="text-center">
                <div className="display-4 fw-bold" style={getStatCardStyle('warning').number}>
                  {stats?.pendingUsers || 0}
                </div>
                <p className="mb-0">Pending Users</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3 mb-md-0">
            <Card className="stockwise-card h-100" style={getStatCardStyle('danger').card}>
              <Card.Body className="text-center">
                <div className="display-4 fw-bold" style={getStatCardStyle('danger').number}>
                  {stats?.rejectedUsers || 0}
                </div>
                <p className="mb-0">Rejected Users</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col lg={8} className="mb-4 mb-lg-0">
            <Card className="stockwise-card h-100">
              <Card.Body>
                <h5 className="mb-3">User Registrations (Last 7 Days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.weeklyRegistrations || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'dark' ? '#444' : '#eee'} />
                    <XAxis dataKey="day" stroke="var(--textSecondary)" />
                    <YAxis stroke="var(--textSecondary)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--border-radius-sm)',
                        color: 'var(--textPrimary)'
                      }}
                    />
                    <Bar dataKey="count" fill={currentTheme === 'dark' ? '#4dabf7' : 'var(--primary)'} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="stockwise-card h-100">
              <Card.Body>
                <h5 className="mb-3">User Status Distribution</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.userStatuses || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(stats?.userStatuses || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getChartColors()[index % getChartColors().length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} users`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--border-radius-sm)',
                        color: 'var(--textPrimary)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Users Table */}
        <Card className="stockwise-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Recently Registered Users</h5>
              <Link to="/admin/users" className="text-decoration-none" style={{ color: 'var(--primary)' }}>
                View All Users
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <Alert variant="info">
                No recent user registrations to display.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="table-themed">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => {
                      const badgeProps = getStatusBadgeProps(user.verified);
                      return (
                        <tr key={user._id}>
                          <td>{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>
                            <Badge bg={user.type === 'admin' ? 'danger' : 'primary'}>
                              {user.type}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={badgeProps.bg} style={badgeProps.style}>
                              {user.verified || 'Pending'}
                            </Badge>
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <Link to={`/admin/users?view=${user._id}`}>
                              <Button variant="outline-primary" size="sm">
                                <i className="bi bi-eye"></i>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      <Footer/>
    </>
  );
};

export default AdminDashboardPage;