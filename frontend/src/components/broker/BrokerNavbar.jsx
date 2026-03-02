// src/components/broker/BrokerNavbar.jsx

import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './../../components/common/ThemeProvider'; // Corrected path if needed
// Removed: import useAuth from './../../hooks/useAuth'; // Removed old hook import

// --- Redux Imports ---
import { useDispatch } from 'react-redux'; // Import useDispatch
import { logoutUser } from '../../redux/features/authSlice'; // Import the logout action creator

// Styles (keep as is or adapt to theme)
const NavbarStyles = {
    darkBg: { backgroundColor: 'var(--neutralBg)', borderBottom: '1px solid var(--border)' },
    lightBg: { backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' },
    darkText: { color: 'var(--textPrimary)' },
    navLink: { color: 'var(--textSecondary)' },
    navLinkActive: { color: 'var(--primary)' },
    logoStyle: { color: 'var(--primary)', fontWeight: 'bold' }
};

const BrokerNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch(); // Get the dispatch function
    const { currentTheme, toggleTheme } = useTheme();

    const handleLogout = () => {
        console.log("BrokerNavbar: Dispatching logout action."); // Add log for debugging
        dispatch(logoutUser()); // <-- Dispatch the Redux logout action
        navigate('/'); // Redirect to home or login page after logout
    };

    // Active link check
    const isActive = (path) => {
        // Handle potential trailing slash differences
        const currentPath = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
        const targetPath = path.endsWith('/') ? path.slice(0, -1) : path;
        return currentPath === targetPath ? 'active' : '';
    };

    return (
        // Apply theme variant to Navbar
        <Navbar className="navbar-themed shadow-sm py-2 px-0" expand="lg" variant={currentTheme === 'dark' ? 'dark' : 'light'} style={currentTheme === 'dark' ? NavbarStyles.darkBg : NavbarStyles.lightBg}>
            <Container>
                {/* Navbar Brand */}
                <Navbar.Brand as={Link} to="/broker/dashboard" className="fw-bold d-flex align-items-center" style={NavbarStyles.logoStyle}>
                    <i className="bi bi-building me-2"></i>
                    <span>StockWise Broker</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="broker-navbar" />

                <Navbar.Collapse id="broker-navbar">
                    {/* Navigation Links */}
                    <Nav className="me-auto">
                        <Nav.Link
                            as={Link}
                            to="/broker/dashboard"
                            className={isActive('/broker/dashboard')}
                            style={isActive('/broker/dashboard') ? NavbarStyles.navLinkActive : NavbarStyles.navLink}
                        >
                            <i className="bi bi-speedometer2 me-1"></i> Dashboard
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/broker/clients"
                            className={isActive('/broker/clients')}
                            style={isActive('/broker/clients') ? NavbarStyles.navLinkActive : NavbarStyles.navLink}
                        >
                            <i className="bi bi-people me-1"></i> Clients
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/broker/transactions"
                            className={isActive('/broker/transactions')}
                            style={isActive('/broker/transactions') ? NavbarStyles.navLinkActive : NavbarStyles.navLink}
                        >
                            <i className="bi bi-currency-exchange me-1"></i> Transactions
                        </Nav.Link>
                        {/* Add more broker links if needed */}
                        {/* <Nav.Link
              as={Link}
              to="/broker/markets"
              className={isActive('/broker/markets')}
              style={isActive('/broker/markets') ? NavbarStyles.navLinkActive : NavbarStyles.navLink}
            >
              <i className="bi bi-graph-up me-1"></i> Markets
            </Nav.Link> */}
                    </Nav>

                    {/* Right side controls */}
                    <div className="d-flex align-items-center">
                        {/* Theme toggle */}
                        {/* <button
                            className="theme-toggle me-3 border-0 bg-transparent"
                            onClick={toggleTheme}
                            title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
                            style={{ color: 'var(--textSecondary)', fontSize: '1.25rem', padding: '0.5rem' }}
                        >
                            {currentTheme === 'light' ? (
                                <i className="bi bi-moon-stars-fill"></i>
                            ) : (
                                <i className="bi bi-sun-fill"></i>
                            )}
                        </button> */}

                        {/* Logout Button */}
                        <Button
                            variant={currentTheme === 'dark' ? 'outline-light' : 'outline-primary'} // Adjusted variant
                            onClick={handleLogout} // Ensure this calls the updated handler
                        >
                            <i className="bi bi-box-arrow-right me-1"></i> Logout
                        </Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default BrokerNavbar;