// frontend/src/components/admin/UsersManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Badge, Form, InputGroup, Button, Tabs, Tab, Spinner, Alert, Row, Col, Dropdown } from 'react-bootstrap'; // Added Dropdown
import AdminNavbar from './AdminNavbar';
import Loader from '../common/Loader';
import Error from '../common/Error';
import PaginationComponent from '../common/Pagination'; // Renamed import to avoid conflict
import UserDetailsModal from './UserDetailsModal';
import { useTheme } from '../common/ThemeProvider';
import Footer from '../common/Footer';

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchActiveUsers, clearActiveUsersError,
    fetchAllUsers, clearUsersError // Import actions for All Users
} from '../../redux/features/adminSlice';

const UsersManagementPage = () => {
    const dispatch = useDispatch();
    const { currentTheme } = useTheme();

    // --- Select state from Redux store ---
    // State for the main user list
    const { users, pagination, usersStatus, usersError } = useSelector(state => state.admin);
    // State for Active Users list
    const { activeUsers, activeUsersStatus, activeUsersError } = useSelector(state => state.admin);

    // --- Local State for UI controls ---
    const [activeTabKey, setActiveTabKey] = useState('allUsers');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Current page for 'All Users' tab
    const [filter, setFilter] = useState('all'); // Filter for 'All Users' tab (status)
    const [sortBy, setSortBy] = useState('createdAt'); // Sort field for 'All Users' tab
    const [sortOrder, setSortOrder] = useState('desc'); // Sort order for 'All Users' tab
    const [viewingUser, setViewingUser] = useState(null); // User data for the details modal
    const [showUserModal, setShowUserModal] = useState(false);

    const pageSize = 10; // Assuming backend uses a default or you can specify

    // --- Fetch Data Effect ---
    useEffect(() => {
        // Fetch data based on the active tab and local control states
        if (activeTabKey === 'allUsers') {
            console.log("Dispatching fetchAllUsers with params:", { page: currentPage, limit: pageSize, search: searchTerm, filter, sortBy, sortOrder });
            dispatch(fetchAllUsers({
                page: currentPage,
                limit: pageSize,
                search: searchTerm,
                filter: filter === 'all' ? '' : filter, // Send empty string if 'all'
                sortBy,
                sortOrder
            }));
            // Clear active users error when switching to this tab
            if (activeUsersError) dispatch(clearActiveUsersError());

        } else if (activeTabKey === 'activeUsers') {
            console.log("Dispatching fetchActiveUsers...");
            dispatch(fetchActiveUsers());
            // Clear all users error when switching to this tab
            if (usersError) dispatch(clearUsersError());
        }

        // Cleanup function - optional, can clear errors when component unmounts
        return () => {
            dispatch(clearUsersError());
            dispatch(clearActiveUsersError());
        };

    }, [dispatch, activeTabKey, currentPage, searchTerm, filter, sortBy, sortOrder]); // Dependencies trigger re-fetch


    // --- Handlers ---
    const handlePageChange = (page) => {
        setCurrentPage(page); // Update local state, useEffect will re-fetch
    };
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset page on new search
        if (usersStatus === 'failed') dispatch(clearUsersError()); // Clear error on interaction
    };
    const handleFilterChange = (newFilter) => { // Changed to take filter directly
        console.log("Setting filter to:", newFilter);
        setFilter(newFilter);
        setCurrentPage(1); // Reset page on new filter
        if (usersStatus === 'failed') dispatch(clearUsersError());
    };
    const handleSort = (field) => {
        const newSortOrder = (sortBy === field && sortOrder === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newSortOrder);
        setCurrentPage(1); // Reset page on new sort
    };

    // Handle viewing user details in the modal
    const handleViewUser = (user) => {
        console.log("Viewing user:", user);
        setViewingUser(user); // Set the state variable
        setShowUserModal(true); // Show the modal
    };

    // Function to get badge properties based on verification status
    const getVerificationBadgeProps = (status) => {
        switch (status) {
            case 'approved': return { bg: 'success', style: { backgroundColor: 'var(--accent)' }, text: 'Approved' };
            case 'rejected': return { bg: 'danger', style: { backgroundColor: 'var(--danger)' }, text: 'Rejected' };
            case 'pending': default: return { bg: 'warning', style: { backgroundColor: 'var(--warning, #ffc107)' }, text: 'Pending' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            console.warn("formatDate: Received empty or null dateString");
            return 'N/A'; // Return a placeholder if input is invalid
        }
        try {
            const date = new Date(dateString);
            // Check if the date object is valid after parsing
            if (isNaN(date.getTime())) {
                console.warn(`formatDate: Could not parse dateString: ${dateString}`);
                return 'Invalid Date'; // Return placeholder for invalid dates
            }
            // Format as desired, e.g., MM/DD/YYYY HH:MM:SS or Month D, YYYY
            // return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            return date.toLocaleDateString('en-US', { // Example using options
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error(`formatDate: Error formatting dateString: ${dateString}`, error);
            return 'Error'; // Return placeholder on unexpected errors
        }
    };

    // --- NEW: Active Users Table ---
    const renderActiveUsersTable = () => {
        // Use Redux state for loading, error, and data
        if (activeUsersStatus === 'loading') {
            return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
        }
        if (activeUsersStatus === 'failed' && activeUsersError) {
            // Clear error action passed to Error component
            return <Error message={activeUsersError} variant="danger" dismissible onClose={() => dispatch(clearActiveUsersError())} />;
        }
        if (!activeUsers || activeUsers.length === 0) { // Check both status and data length
            return <Alert variant="info">No users currently active.</Alert>;
        }

        return (
            <div className="table-responsive"> {/* Added responsive wrapper */}
                <Table hover responsive className="table-themed">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeUsers.map(user => (
                            <tr key={user._id || user.id}> {/* Use _id or id consistently */}
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td><Badge bg={user.type === 'admin' ? 'danger' : user.type === 'broker' ? 'info' : 'primary'}>{user.type}</Badge></td>
                                <td><Badge bg={user.verified === 'approved' ? 'success' : user.verified === 'pending' ? 'warning' : 'danger'}>{user.verified}</Badge></td> {/* Display verified status */}
                                <td>{formatDate(user.createdAt)}</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" onClick={() => handleViewUser(user)}> {/* Pass user to handler */}
                                        <i className="bi bi-eye"></i> View
                                    </Button>
                                    {/* Add other relevant actions */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    };


    // --- All Users Table ---
    const renderAllUsersTable = () => {
        // Use Redux state for loading, error, and data
        if (usersStatus === 'loading' && users.length === 0) { // Show spinner only if data is initially loading
            return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
        }
        if (usersStatus === 'failed' && usersError) {
            // Clear error action passed to Error component
            return <Error message={usersError} variant="danger" dismissible onClose={() => dispatch(clearUsersError())} />;
        }
        // Check if status is succeeded AND data is empty after loading/fetch
        if (usersStatus !== 'loading' && users.length === 0) {
            return <Alert variant="info">No users found matching your criteria.</Alert>;
        }


        return (
            <>
                {/* Filter/Search controls for 'All Users' tab */}
                <Row className="mb-3 gx-2 align-items-end"> {/* Adjusted alignment */}
                    <Col md={4} lg={3} className="mb-2 mb-md-0"> {/* Adjusted column size */}
                        <Form.Group controlId="userStatusFilter">
                            <Form.Label className="mb-1">Filter by Status</Form.Label> {/* Added label */}
                            <Form.Select value={filter} onChange={(e) => handleFilterChange(e.target.value)} size="sm">
                                <option value="all">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={8} lg={5} className="mb-2 mb-md-0"> {/* Adjusted column size */}
                        <Form.Group controlId="userSearch">
                            <Form.Label className="mb-1">Search Users</Form.Label> {/* Added label */}
                            <InputGroup size="sm">
                                <Form.Control
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <Button variant="outline-secondary" onClick={() => setSearchTerm('')} disabled={!searchTerm}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col lg={4} className="d-flex justify-content-lg-end mb-2 mb-lg-0"> {/* Added column for sorting & refresh */}
                        <Dropdown className="me-2"> {/* Sort By Dropdown */}
                            <Dropdown.Toggle variant="light" id="dropdown-sort-users" size="sm">
                                Sort By: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace('At', '')} {/* Simple formatting */}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleSort('fullName')} active={sortBy === 'fullName'}>Full Name</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSort('email')} active={sortBy === 'email'}>Email</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSort('type')} active={sortBy === 'type'}>Type</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSort('verified')} active={sortBy === 'verified'}>Status</Dropdown.Item> {/* Sort by verified status */}
                                <Dropdown.Item onClick={() => handleSort('createdAt')} active={sortBy === 'createdAt'}>Joined Date</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Button variant="outline-secondary" onClick={() => dispatch(fetchAllUsers({ page: currentPage, limit: pageSize, search: searchTerm, filter: filter === 'all' ? '' : filter, sortBy, sortOrder }))} disabled={usersStatus === 'loading'} size="sm"> {/* Manual Refresh Button */}
                            {usersStatus === 'loading' ? (
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            ) : (
                                <i className="bi bi-arrow-clockwise"></i>
                            )}
                            {usersStatus !== 'loading' && ' Refresh'}
                        </Button>
                    </Col>
                </Row>
                <div className="table-responsive">
                    <Table hover responsive className="table-themed">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('fullName')} style={{ cursor: 'pointer' }}>Name {sortBy === 'fullName' && <i className={`bi bi-caret-${sortOrder === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>}</th>
                                <th>Email</th>
                                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type {sortBy === 'type' && <i className={`bi bi-caret-${sortOrder === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>}</th>
                                <th onClick={() => handleSort('verified')} style={{ cursor: 'pointer' }}>Status {sortBy === 'verified' && <i className={`bi bi-caret-${sortOrder === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>}</th>
                                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Joined {sortBy === 'createdAt' && <i className={`bi bi-caret-${sortOrder === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>}</th>
                                {/* Add lastLogin if needed */}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map over 'users' state from Redux */}
                            {users.map(user => (
                                <tr key={user._id || user.id}> {/* Use _id or id consistently */}
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td><Badge bg={user.type === 'admin' ? 'danger' : user.type === 'broker' ? 'info' : 'primary'}>{user.type}</Badge></td>
                                    <td><Badge bg={user.verified === 'approved' ? 'success' : user.verified === 'pending' ? 'warning' : 'danger'}>{user.verified}</Badge></td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" onClick={() => handleViewUser(user)}>
                                            <i className="bi bi-eye"></i> View
                                        </Button>
                                        {/* Add other actions if needed */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                {/* Pagination for 'All Users' - Use Redux pagination state */}
                {pagination.totalPages > 1 && ( // Only show pagination if more than 1 page
                    <PaginationComponent
                        currentPage={pagination.currentPage}
                        totalItems={pagination.totalUsers} // Use totalUsers from pagination
                        pageSize={pageSize} // Pass pageSize used for fetch
                        onPageChange={handlePageChange}
                    />
                )}
            </>
        );
    };

    // --- Main Render ---
    return (
        <div style={{ backgroundColor: 'var(--neutralBg)', minHeight: '100vh' }}>
            <AdminNavbar />
            <Container className="py-4">
                <Card style={{ backgroundColor: 'var(--card)', color: 'var(--textPrimary)', border: '1px solid var(--border)' }}>
                    <Card.Body>
                        <h2 style={{ color: 'var(--textPrimary)' }}>User Management</h2>
                        <Tabs activeKey={activeTabKey} onSelect={(k) => setActiveTabKey(k)} className="mb-3" id="user-management-tabs">
                            {/* Use pagination.totalUsers for the count */}
                            <Tab eventKey="allUsers" title={`All Users (${pagination?.totalUsers || 0})`}>
                                {renderAllUsersTable()}
                            </Tab>
                            <Tab eventKey="activeUsers" title={`Active Now (${activeUsers?.length || 0})`}>
                                {renderActiveUsersTable()}
                            </Tab>
                        </Tabs>

                    </Card.Body>
                </Card>
            </Container>
            {/* User Details Modal (remains the same) */}
            <UserDetailsModal user={viewingUser} show={showUserModal} onHide={() => { setViewingUser(null); setShowUserModal(false); }} />
            <Footer />
        </div>
    );
};

export default UsersManagementPage;