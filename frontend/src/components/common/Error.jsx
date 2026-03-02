// src/components/common/Error.jsx

import React from 'react';
import { Alert } from 'react-bootstrap';

/**
 * Error component for displaying error messages
 * 
 * @param {string} message - The error message to display
 * @param {string} variant - Bootstrap color variant: 'danger', 'warning', 'info', etc.
 * @param {boolean} dismissible - Whether the alert can be dismissed
 * @param {function} onClose - Function to call when dismiss button is clicked
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Optional children to render inside the alert
 * @param {boolean} showIcon - Whether to show an icon based on the variant
 */
const Error = ({ 
  message = 'An error occurred. Please try again.',
  variant = 'danger',
  dismissible = false,
  onClose = null,
  className = '',
  children = null,
  showIcon = true
}) => {
  // Icon mapping based on variant
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <i className="bi bi-exclamation-triangle-fill me-2"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-circle-fill me-2"></i>;
      case 'info':
        return <i className="bi bi-info-circle-fill me-2"></i>;
      case 'success':
        return <i className="bi bi-check-circle-fill me-2"></i>;
      default:
        return null;
    }
  };

  return (
    <Alert 
      variant={variant} 
      dismissible={dismissible} 
      onClose={onClose}
      className={className}
    >
      <div className="d-flex align-items-center">
        {showIcon && getIcon()}
        <div>
          {message}
          {children}
        </div>
      </div>
    </Alert>
  );
};

export default Error;