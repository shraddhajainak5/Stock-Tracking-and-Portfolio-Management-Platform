import React, { useEffect, useState } from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import { calculatePasswordStrength, getPasswordStrengthLabel } from '../../validations/schemas';

/**
 * Component for displaying password strength
 * 
 * @param {Object} props - Component props
 * @param {string} props.password - The password to evaluate
 */
const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [strengthInfo, setStrengthInfo] = useState({ label: '', color: '' });

  useEffect(() => {
    // Calculate password strength when password changes
    const calculatedStrength = calculatePasswordStrength(password);
    setStrength(calculatedStrength);
    setStrengthInfo(getPasswordStrengthLabel(calculatedStrength));
    
    console.log('Password strength calculated:', calculatedStrength, getPasswordStrengthLabel(calculatedStrength));
  }, [password]);

  // Don't render anything if no password
  if (!password) return null;

  return (
    <div className="mt-1 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Form.Text>Password Strength</Form.Text>
        <Form.Text className={`text-${strengthInfo.color}`}>
          {strengthInfo.label}
        </Form.Text>
      </div>
      <ProgressBar 
        now={strength} 
        variant={strengthInfo.color} 
        style={{ height: '8px' }} 
      />
    </div>
  );
};

export default PasswordStrengthMeter;