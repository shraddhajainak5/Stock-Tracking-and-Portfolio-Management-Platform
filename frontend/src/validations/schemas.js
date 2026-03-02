import * as Yup from 'yup';

// Password regex patterns
const passwordHasUppercase = /[A-Z]/;
const passwordHasLowercase = /[a-z]/;
const passwordHasNumber = /[0-9]/;
const passwordHasSymbol = /[!@#$%^&*(),.?":{}|<>]/;

// Login schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Registration schema
export const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
    .min(2, 'Name is too short')
    .max(50, 'Name is too long'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(passwordHasUppercase, 'Password must contain at least one uppercase letter')
    .matches(passwordHasLowercase, 'Password must contain at least one lowercase letter')
    .matches(passwordHasNumber, 'Password must contain at least one number')
    .matches(passwordHasSymbol, 'Password must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  terms: Yup.boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions'),
});

// Password strength calculation
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  
  // Character type checks
  if (passwordHasUppercase.test(password)) strength += 20;
  if (passwordHasLowercase.test(password)) strength += 20;
  if (passwordHasNumber.test(password)) strength += 20;
  if (passwordHasSymbol.test(password)) strength += 20;
  
  // Cap at 100
  return Math.min(100, strength);
};

// Get password strength label
export const getPasswordStrengthLabel = (strength) => {
  if (strength < 20) return { label: 'Very Weak', color: 'danger' };
  if (strength < 40) return { label: 'Weak', color: 'danger' };
  if (strength < 60) return { label: 'Moderate', color: 'warning' };
  if (strength < 80) return { label: 'Strong', color: 'info' };
  return { label: 'Very Strong', color: 'success' };
};