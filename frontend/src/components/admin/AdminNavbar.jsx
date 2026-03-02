// 
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../common/ThemeProvider';
import useAuth from './../../hooks/useAuth';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { logoutUser } from '../../redux/features/authSlice';

const navbarStyles = {
    container: {
        maxWidth: '100%',
        padding: '0 15px'
    },
    brand: {
        display: 'flex',
        alignItems: 'center'
    }
};

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    //const { logout } = useAuth();

    const handleLogout = () => {
        // console.log("AdminNavbar: Dispatching logout action."); // Add log
        dispatch(logoutUser());
        //logout();
        navigate('/');
    };

    return (
        <Navbar
            bg="white"
            variant="light"
            expand="lg"
            sticky="top"
            className="shadow-sm py-2 px-0"
        >
            <div style={navbarStyles.container} className="d-flex w-100 justify-content-between">
                {/* Brand */}
                <Navbar.Brand as={Link} to="/admin/dashboard" style={navbarStyles.brand}>
                    <img
                        src="/logo.png"
                        width="30"
                        height="30"
                        className="d-inline-block align-top me-2"
                        alt="StockWise Logo"
                    />
                    <span className="fw-bold text-primary">StockWise</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="admin-navbar-nav" />

                <Navbar.Collapse id="admin-navbar-nav">
                    {/* Main Nav Links */}
                    <Nav className="me-auto">
                        <Nav.Link
                            as={Link}
                            to="/admin/dashboard"
                            className={location.pathname === '/admin/dashboard' ? 'active' : ''}
                        >
                            <i className="bi bi-speedometer2 me-1"></i> Dashboard
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/admin/users"
                            className={location.pathname === '/admin/users' ? 'active' : ''}
                        >
                            <i className="bi bi-people me-1"></i> Users
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/admin/verify-users"
                            className={location.pathname === '/admin/verify-users' ? 'active' : ''}
                        >
                            <i className="bi bi-check-circle me-1"></i> Verify Users
                        </Nav.Link>
                    </Nav>

                    {/* Logout Button only (no theme toggle) */}
                    <div className="d-flex align-items-center">
                        <Button
                            variant="outline-primary"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-1"></i> Logout
                        </Button>
                    </div>
                </Navbar.Collapse>
            </div>
        </Navbar>
    );
};

export default AdminNavbar;