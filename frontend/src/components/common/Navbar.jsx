
// import React, { useState, useEffect } from 'react';
// import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
// import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../../redux/features/authSlice';

// const AppNavbar = () => {
//     const [expanded, setExpanded] = useState(false);
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const { isAuthenticated, user } = useSelector(state => state.auth);

//     // Check user types
//     const isAdmin = user?.type === 'admin';
//     const isBroker = user?.type === 'broker';
//     const displayName = user?.fullName || "My Account";

//     const handleLogout = () => {
//         dispatch(logout());
//         navigate('/');
//         setExpanded(false);
//     };

//     // Close navbar when route changes
//     useEffect(() => {
//         return () => setExpanded(false);
//     }, [navigate]);

//     return (
//         <Navbar 
//             bg="white" 
//             expand="lg" 
//             sticky="top" 
//             className="shadow-sm py-2" 
//             expanded={expanded}
//             onToggle={(expanded) => setExpanded(expanded)}
//         >
//             <Container>
//                 <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
//                     <img
//                         src="/logo.png"
//                         width="30"
//                         height="30"
//                         className="d-inline-block align-top me-2"
//                         alt="StockWise Logo"
//                     />
//                     <span className="fw-bold text-primary">StockWise</span>
//                 </Navbar.Brand>

//                 <Navbar.Toggle 
//                     aria-controls="responsive-navbar" 
//                     className="border-0 focus-ring focus-ring-light"
//                 />

//                 <Navbar.Collapse id="responsive-navbar">
//                     <Nav className="me-auto">
//                         <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Home</Nav.Link>
//                         <Nav.Link as={Link} to="/stocks" onClick={() => setExpanded(false)}>Stocks</Nav.Link>
//                         <Nav.Link as={Link} to="/news" onClick={() => setExpanded(false)}>Market News</Nav.Link>
//                         <Nav.Link as={Link} to="/about" onClick={() => setExpanded(false)}>About</Nav.Link>
//                         <Nav.Link as={Link} to="/contact" onClick={() => setExpanded(false)}>Contact</Nav.Link>
//                     </Nav>

//                     {/* Auth Links / User Dropdown */}
//                     <Nav>
//                         {isAuthenticated ? (
//                             <NavDropdown 
//                                 title={
//                                     <span>
//                                         <i className="bi bi-person-circle me-2"></i>
//                                         {displayName}
//                                     </span>
//                                 } 
//                                 id="user-nav-dropdown" 
//                                 align="end"
//                             >
//                                 {/* Regular User Links */}
//                                 {!isAdmin && !isBroker && (
//                                     <>
//                                         <NavDropdown.Item as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-speedometer2 me-2"></i>Dashboard
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/portfolio" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-briefcase me-2"></i>Portfolio
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/watchlist" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-star me-2"></i>Watchlist
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/transactions" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-arrow-left-right me-2"></i>Transactions
//                                         </NavDropdown.Item>
//                                     </>
//                                 )}
                                
//                                 {/* Broker Links */}
//                                 {isBroker && (
//                                     <>
//                                         <NavDropdown.Item as={Link} to="/broker/dashboard" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-speedometer2 me-2"></i>Broker Dashboard
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/broker/clients" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-people me-2"></i>Manage Clients
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/broker/transactions" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-arrow-left-right me-2"></i>Transactions
//                                         </NavDropdown.Item>
//                                     </>
//                                 )}
                                
//                                 {/* Admin Links */}
//                                 {isAdmin && (
//                                     <>
//                                         <NavDropdown.Item as={Link} to="/admin/dashboard" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/admin/users" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-people me-2"></i>Manage Users
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/admin/stocks" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-graph-up me-2"></i>Manage Stocks
//                                         </NavDropdown.Item>
//                                         <NavDropdown.Item as={Link} to="/admin/verify-users" onClick={() => setExpanded(false)}>
//                                             <i className="bi bi-check-circle me-2"></i>Verify Users
//                                         </NavDropdown.Item>
//                                     </>
//                                 )}
                                
//                                 <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
//                                     <i className="bi bi-person me-2"></i>Profile
//                                 </NavDropdown.Item>
//                                 <NavDropdown.Divider />
//                                 <NavDropdown.Item onClick={handleLogout}>
//                                     <i className="bi bi-box-arrow-right me-2"></i>Logout
//                                 </NavDropdown.Item>
//                             </NavDropdown>
//                         ) : (
//                             <div className="d-flex flex-column flex-lg-row">
//                                 <Link to="/login" className="me-lg-2 mb-2 mb-lg-0" onClick={() => setExpanded(false)}>
//                                     <Button variant="outline-primary" className="w-100">Log In</Button>
//                                 </Link>
//                                 <NavDropdown title={<span>Register</span>} id="register-dropdown" align="end">
//                                     <NavDropdown.Item as={Link} to="/register" onClick={() => setExpanded(false)}>
//                                         <i className="bi bi-person-plus me-2"></i>
//                                         User Account
//                                     </NavDropdown.Item>
//                                     <NavDropdown.Item as={Link} to="/broker-register" onClick={() => setExpanded(false)}>
//                                         <i className="bi bi-building me-2"></i>
//                                         Broker Account
//                                     </NavDropdown.Item>
//                                 </NavDropdown>
//                             </div>
//                         )}
//                     </Nav>
//                 </Navbar.Collapse>
//             </Container>
//         </Navbar>
//     );
// };

// export default AppNavbar;
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/features/authSlice';

const AppNavbar = () => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);

    // Check user types
    const isAdmin = user?.type === 'admin';
    const isBroker = user?.type === 'broker';
    const isApproved = user?.verified === "approved" || user?.verified === true;
    const displayName = user?.fullName || "My Account";

    useEffect(() => {
        // Log verification status for debugging
        console.log("Navbar - User verification status:", user?.verified);
        console.log("Navbar - Is user approved:", isApproved);
    }, [user, isApproved]);
    

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
        setExpanded(false);
    };

    // Handle verification required for non-approved users
    const handleVerificationRequired = (e) => {
        e.preventDefault();
        setExpanded(false);
        
        if (user?.verified === 'rejected') {
            alert("Your account verification was rejected. Please contact support for assistance.");
        } else {
            alert("Your account is pending verification. This feature will be available once your account is approved.");
        }
        navigate('/profile');
    };

    // Close navbar when route changes
    useEffect(() => {
        return () => setExpanded(false);
    }, [navigate]);

    return (
        <Navbar 
            bg="white" 
            expand="lg" 
            sticky="top" 
            className="shadow-sm py-2" 
            expanded={expanded}
            onToggle={(expanded) => setExpanded(expanded)}
        >
            <Container>
                <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
                    <img
                        src="/logo.png"
                        width="30"
                        height="30"
                        className="d-inline-block align-top me-2"
                        alt="StockWise Logo"
                    />
                    <span className="fw-bold text-primary">StockWise</span>
                </Navbar.Brand>

                <Navbar.Toggle 
                    aria-controls="responsive-navbar" 
                    className="border-0"
                />

                <Navbar.Collapse id="responsive-navbar">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Home</Nav.Link>
                        <Nav.Link as={Link} to="/stocks" onClick={() => setExpanded(false)}>Stocks</Nav.Link>
                        <Nav.Link as={Link} to="/news" onClick={() => setExpanded(false)}>Market News</Nav.Link>
                        <Nav.Link as={Link} to="/about" onClick={() => setExpanded(false)}>About</Nav.Link>
                        <Nav.Link as={Link} to="/contact" onClick={() => setExpanded(false)}>Contact</Nav.Link>
                    </Nav>

                    {/* Auth Links / User Dropdown */}
                    <Nav>
                        {isAuthenticated ? (
                            <NavDropdown 
                                title={
                                    <span>
                                        <i className="bi bi-person-circle me-2"></i>
                                        {displayName}
                                    </span>
                                } 
                                id="user-nav-dropdown" 
                                align="end"
                            >
                                {/* Regular User Links */}
                                {!isAdmin && !isBroker && (
                                    <>
                                        <NavDropdown.Item as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                        </NavDropdown.Item>
                                        
                                        {/* Portfolio - only for approved users */}
                                        {isApproved ? (
                                            <NavDropdown.Item as={Link} to="/portfolio" onClick={() => setExpanded(false)}>
                                                <i className="bi bi-briefcase me-2"></i>Portfolio
                                            </NavDropdown.Item>
                                        ) : (
                                            <NavDropdown.Item 
                                                style={{color: '#adb5bd'}}
                                                onClick={handleVerificationRequired}
                                            >
                                                <i className="bi bi-briefcase me-2"></i>
                                                Portfolio <i className="bi bi-lock-fill ms-2 small"></i>
                                            </NavDropdown.Item>
                                        )}
                                        
                                        {/* Watchlist - only for approved users */}
                                        {isApproved ? (
                                            <NavDropdown.Item as={Link} to="/watchlist" onClick={() => setExpanded(false)}>
                                                <i className="bi bi-star me-2"></i>Watchlist
                                            </NavDropdown.Item>
                                        ) : (
                                            <NavDropdown.Item 
                                                style={{color: '#adb5bd'}}
                                                onClick={handleVerificationRequired}
                                            >
                                                <i className="bi bi-star me-2"></i>
                                                Watchlist <i className="bi bi-lock-fill ms-2 small"></i>
                                            </NavDropdown.Item>
                                        )}
                                        
                                        <NavDropdown.Item as={Link} to="/transactions" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-arrow-left-right me-2"></i>Transactions
                                        </NavDropdown.Item>
                                    </>
                                )}
                                
                                {/* Broker Links */}
                                {isBroker && (
                                    <>
                                        <NavDropdown.Item as={Link} to="/broker/dashboard" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-speedometer2 me-2"></i>Broker Dashboard
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/broker/clients" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-people me-2"></i>Manage Clients
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/broker/transactions" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-arrow-left-right me-2"></i>Transactions
                                        </NavDropdown.Item>
                                    </>
                                )}
                                
                                {/* Admin Links */}
                                {isAdmin && (
                                    <>
                                        <NavDropdown.Item as={Link} to="/admin/dashboard" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/users" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-people me-2"></i>Manage Users
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/stocks" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-graph-up me-2"></i>Manage Stocks
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/verify-users" onClick={() => setExpanded(false)}>
                                            <i className="bi bi-check-circle me-2"></i>Verify Users
                                        </NavDropdown.Item>
                                    </>
                                )}
                                
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                                    <i className="bi bi-person me-2"></i>Profile
                                </NavDropdown.Item>
                                
                                {!isApproved && !isAdmin && !isBroker && (
                                    <NavDropdown.Item 
                                        as={Link} 
                                        to="/profile" 
                                        onClick={() => setExpanded(false)}
                                        className="text-warning"
                                    >
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        Complete Verification
                                    </NavDropdown.Item>
                                )}
                                
                                <NavDropdown.Item onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <div className="d-flex flex-column flex-lg-row">
                                <Link to="/login" className="me-lg-2 mb-2 mb-lg-0" onClick={() => setExpanded(false)}>
                                    <Button variant="outline-primary" className="w-100">Log In</Button>
                                </Link>
                                <NavDropdown title={<span>Register</span>} id="register-dropdown" align="end">
                                    <NavDropdown.Item as={Link} to="/register" onClick={() => setExpanded(false)}>
                                        <i className="bi bi-person-plus me-2"></i>
                                        User Account
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/broker-register" onClick={() => setExpanded(false)}>
                                        <i className="bi bi-building me-2"></i>
                                        Broker Account
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;