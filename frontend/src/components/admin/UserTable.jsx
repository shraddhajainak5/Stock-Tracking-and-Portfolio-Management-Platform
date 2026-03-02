import React, { useState } from 'react';
import { Table, Button, Badge, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { format } from 'date-fns';

const UserTable = ({ users, onDelete, onUpdateType, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Filter users by search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.type.toLowerCase().includes(searchLower)
    );
  });
  
  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (sortField === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Handle sort click
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div>
      <div className="mb-3">
        <InputGroup>
          <Form.Control
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
            variant="outline-secondary"
            onClick={() => setSearchTerm('')}
            disabled={!searchTerm}
          >
            Clear
          </Button>
        </InputGroup>
      </div>
      
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => handleSort('fullName')} style={{ cursor: 'pointer' }}>
                Name
                {sortField === 'fullName' && (
                  <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>
                )}
              </th>
              <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                Email
                {sortField === 'email' && (
                  <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>
                )}
              </th>
              <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                Type
                {sortField === 'type' && (
                  <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>
                )}
              </th>
              <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                Created
                {sortField === 'createdAt' && (
                  <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill ms-1`}></i>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={user.type === 'admin' ? 'danger' : 'primary'}>
                    {user.type}
                  </Badge>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {user.type === 'user' ? (
                        <Dropdown.Item 
                          onClick={() => onUpdateType(user._id, 'admin')}
                        >
                          <i className="bi bi-arrow-up-circle me-2"></i>
                          Promote to Admin
                        </Dropdown.Item>
                      ) : (
                        <Dropdown.Item 
                          onClick={() => onUpdateType(user._id, 'user')}
                          disabled={user._id === currentUserId}
                        >
                          <i className="bi bi-arrow-down-circle me-2"></i>
                          Demote to User
                        </Dropdown.Item>
                      )}
                      <Dropdown.Divider />
                      <Dropdown.Item 
                        className="text-danger"
                        onClick={() => onDelete(user._id)}
                        disabled={user._id === currentUserId}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Delete User
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      <div className="text-muted mt-2">
        Showing {sortedUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default UserTable;