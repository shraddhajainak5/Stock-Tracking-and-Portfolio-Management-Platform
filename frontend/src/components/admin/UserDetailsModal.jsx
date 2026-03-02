// src/components/admin/UserDetailsModal.jsx

import React, { useState } from 'react';
import { Modal, Button, Badge, Row, Col, Table, Form } from 'react-bootstrap';
import { useTheme } from '../common/ThemeProvider';

const UserDetailsModal = ({
    user,
    show,
    onHide,
    onApprove = null,
    onReject = null,
    onReverify = null
}) => {
  const { currentTheme } = useTheme();
  const [verificationNote, setVerificationNote] = useState('');
  
  React.useEffect(() => {
    // Reset verification note when modal opens/closes
    if (!show) {
      setVerificationNote('');
    }
  }, [show]);
  
  if (!user) return null;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Get badge properties based on verification status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'success',
          text: 'Approved',
          style: { backgroundColor: 'var(--accent)' }
        };
      case 'rejected':
        return {
          bg: 'danger',
          text: 'Rejected',
          style: { backgroundColor: 'var(--danger)' }
        };
      case 'pending':
      default:
        return {
          bg: 'warning',
          text: 'Pending',
          style: { backgroundColor: 'var(--warning, #ffc107)' }
        };
    }
  };
  
  const badge = getStatusBadge(user.verified);
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header 
        closeButton
        style={{ 
          backgroundColor: 'var(--card)', 
          color: 'var(--textPrimary)', 
          borderBottom: '1px solid var(--border)'
        }}
      >
        <Modal.Title style={{ color: 'var(--textPrimary)' }}>
          User Details
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body
        style={{ 
          backgroundColor: 'var(--card)', 
          color: 'var(--textPrimary)',
          padding: '1.5rem'
        }}
      >
        <Row>
          <Col md={3} className="text-center mb-4">
            {user.imagePath ? (
              <img 
                src={user.imagePath} 
                alt={user.fullName} 
                className="img-fluid rounded" 
                style={{ maxWidth: '120px' }}
              />
            ) : (
              <div 
                className="d-flex align-items-center justify-content-center mx-auto"
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  backgroundColor: 'green',
                  color: 'white',
                  fontSize: '3.5rem',
                  borderRadius: '4px'
                }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <h4 className="mt-3 mb-1" style={{ color: 'var(--textPrimary)' }}>{user.fullName}</h4>
            <Badge 
              pill
              bg={badge.bg}
              style={badge.style}
            >
              {badge.text}
            </Badge>
          </Col>
          
          <Col md={9}>
            <h5 style={{ color: 'var(--textPrimary)', marginBottom: '1.2rem' }}>Personal Information</h5>
            
            <Table bordered style={{ color: 'var(--textPrimary)' }}>
              <tbody>
                <tr>
                  <td width="30%" style={{ fontWeight: 'bold' }}>Email</td>
                  <td>{user.email}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Phone</td>
                  <td>{user.phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Address</td>
                  <td>{user.address || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Account Type</td>
                  <td>{user.type}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Registered On</td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Auth Provider</td>
                  <td>{user.authProvider || 'local'}</td>
                </tr>
                {user.dateOfBirth && (
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Date of Birth</td>
                    <td>{formatDate(user.dateOfBirth)}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
        
        {user.proof && (
  <div 
    className="mt-4 p-3 rounded"
    style={{
      backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
      border: '1px solid var(--border)'
    }}
  >
    <h5 style={{ color: 'var(--textPrimary)' }}>Verification Documents</h5>
    <Row>
      <Col md={4}>
        <p style={{ color: 'var(--textPrimary)', marginBottom: '0.5rem' }}>
          <strong>Document Type:</strong> {user.proofType === "driving license" ? "Driver's License" : 
                                        user.proofType === "passport" ? "Passport" : 
                                        user.proofType || 'Not specified'}
        </p>
      </Col>
      <Col md={4}>
        <p style={{ color: 'var(--textPrimary)', marginBottom: '0.5rem' }}>
          <strong>Upload Date:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
        </p>
      </Col>
      <Col md={4} className="text-end">
        <Button 
          variant="link" 
          style={{ color: 'var(--primary)' }}
          onClick={() => window.open(`http://localhost:3000/images/${user.proof}`, '_blank')}
        >
          <i className="bi bi-file-earmark-text me-1"></i>
          View Document
        </Button>
      </Col>
    </Row>
    {user.proof && (
      <div className="mt-3 text-center">
        <img 
          src={`http://localhost:3000/images/${user.proof}`}
          alt="Verification Document" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '300px', 
            objectFit: 'contain',
            border: '1px solid var(--border)',
            borderRadius: '4px'
          }}
          onError={(e) => {
            // If image fails to load (e.g. if it's a PDF)
            e.target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = `
              <div class="p-5 text-center" style="border: 1px solid var(--border); border-radius: 4px;">
                <i class="bi bi-file-earmark-pdf fs-1 text-danger"></i>
                <p class="mt-2">Document not viewable in preview. Click "View Document" to open.</p>
              </div>
            `;
            e.target.parentNode.appendChild(fallback);
          }}
        />
      </div>
    )}
  </div>
)}
        {/* Verification Actions Section - Only show for pending users */}
        {user.verified === 'pending' && (
          <>
            <h5 
              style={{ 
                color: 'var(--textPrimary)', 
                marginTop: '1.5rem', 
                marginBottom: '1rem', 
                borderTop: '1px solid var(--border)', 
                paddingTop: '1.5rem' 
              }}
            >
              Verification Actions
            </h5>
            
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'var(--textPrimary)' }}>Verification Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Add any notes about this verification decision..."
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                style={{ 
                  backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#fff',
                  color: 'var(--textPrimary)',
                  borderColor: 'var(--border)'
                }}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer
        style={{ 
          backgroundColor: 'var(--card)', 
          borderTop: '1px solid var(--border)' 
        }}
      >
        <Button 
          variant="secondary" 
          onClick={onHide}
          style={{ 
            backgroundColor: currentTheme === 'dark' ? '#4a4a4a' : '#6c757d',
            borderColor: currentTheme === 'dark' ? '#4a4a4a' : '#6c757d'
          }}
        >
          Close
        </Button>
        
        {/* Show approve/reject buttons only for pending users */}
        {user.verified === 'pending' && onApprove && (
          <Button 
            variant="success"
            onClick={() => onApprove(verificationNote)}
            style={{ 
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--accent)'
            }}
          >
            <i className="bi bi-check-circle me-1"></i>
            Approve User
          </Button>
        )}
        
        {user.verified === 'pending' && onReject && (
          <Button 
            variant="danger"
            onClick={() => onReject(verificationNote)}
            style={{ 
              backgroundColor: 'var(--danger)',
              borderColor: 'var(--danger)'
            }}
          >
            <i className="bi bi-x-circle me-1"></i>
            Reject User
          </Button>
        )}
        
        {/* Show reset button for non-pending users */}
        {user.verified !== 'pending' && onReverify && (
          <Button 
            variant="primary"
            onClick={onReverify}
            style={{ 
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)'
            }}
          >
            <i className="bi bi-arrow-repeat me-1"></i>
            Reset to Pending
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetailsModal;