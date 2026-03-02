// src/components/common/Loader.jsx

import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * Loader component for displaying loading states
 * 
 * @param {string} size - Size of the spinner: 'sm', 'md', or 'lg'
 * @param {string} variant - Bootstrap color variant: 'primary', 'secondary', etc.
 * @param {boolean} fullScreen - Whether to display the loader full screen with overlay
 * @param {string} text - Optional text to display below the spinner
 * @param {string} className - Additional CSS classes
 */
const Loader = ({ 
  size = 'md', 
  variant = 'primary', 
  fullScreen = false,
  text = null,
  className = ''
}) => {
  // Style for full screen loader
  const fullScreenStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999
  };

  // Style for inline loader
  const inlineStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 0'
  };

  const containerStyle = fullScreen ? fullScreenStyle : inlineStyle;

  return (
    <div style={containerStyle} className={className}>
      <Spinner 
        animation="border" 
        role="status" 
        variant={variant}
        size={size}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      
      {text && (
        <div className="mt-3 text-center">
          <span className={`text-${variant}`}>{text}</span>
        </div>
      )}
    </div>
  );
};

export default Loader;