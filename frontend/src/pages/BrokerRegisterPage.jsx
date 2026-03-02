// src/pages/BrokerRegisterPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
// Removed: import useAuth from '../hooks/useAuth'; // Remove old hook

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { registerBroker, clearError /*, loginUser */ } from '../redux/features/authSlice'; // Import registerBroker thunk

// Validation Schema (ensure this matches your requirements)
const brokerRegisterSchema = Yup.object().shape({
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
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    phone: Yup.string()
        .required('Phone number is required')
        .matches(/^[0-9+\-\s()]{10,}$/, 'Invalid phone number format (at least 10 digits)'), // Adjusted regex
    company: Yup.string()
        .required('Company name is required')
        .min(2, 'Company name is too short')
        .max(50, 'Company name is too long'),
    licenseNumber: Yup.string()
      .required('License number is required')
      .min(5, 'License number is too short'),
    experience: Yup.number()
      .required('Years of experience is required')
      .min(0, 'Experience cannot be negative')
      .max(100, 'Experience seems too high'),
    terms: Yup.boolean()
        .required('You must accept the terms and conditions')
        .oneOf([true], 'You must accept the terms and conditions'),
});

const BrokerRegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- Select Redux State ---
    // Note: We primarily care about loading/error during registration itself.
    // isAuthenticated check might not be strictly necessary here unless you prevent access.
    const { status, error } = useSelector(state => state.auth);
    const loading = status === 'loading'; // Use status for loading state

    // --- Clear Redux error on mount/unmount ---
    useEffect(() => {
        dispatch(clearError());
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // --- Form Submission Handler ---
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        console.log('Attempting broker registration with:', values);
        dispatch(clearError()); // Clear previous errors

        // Prepare data for the thunk (match backend expectations)
        const brokerData = {
            fullName: values.fullName,
            email: values.email,
            password: values.password,
            phone: values.phone,
            company: values.company,
            licenseNumber: values.licenseNumber,
            experience: values.experience
        };

        try {
            // Dispatch the registerBroker async thunk
            const resultAction = await dispatch(registerBroker(brokerData)).unwrap();

            console.log("Broker registration successful:", resultAction); // Log the success message

            // Redirect to login page with a success message after successful registration
            resetForm(); // Clear the form
            navigate('/login', {
                state: { message: resultAction.message || 'Broker registration successful! Your account is pending approval. Please log in.' },
                replace: true
            });
            // NOTE: Brokers likely won't auto-login as they need admin approval first.

        } catch (rejectedValueOrSerializedError) {
            // Error is already set in Redux state by the rejected thunk
            console.error('Broker registration failed:', rejectedValueOrSerializedError);
            // No need to set local error message, rely on Redux 'error' state
        } finally {
            // Formik's setSubmitting(false) might not be needed if relying solely on Redux status for button state
            setSubmitting(loading); // Keep Formik state synced with Redux loading state
        }
    };

    // --- Error Alert Close Handler ---
    const handleAlertClose = () => {
        dispatch(clearError());
    };

    return (
        <>
            <Navbar />

            <Container className="py-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Row className="justify-content-center">
                    <Col lg={8} md={10}>
                        <Card className="auth-card shadow-lg border-0">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">Broker Registration</h2>
                                    <p className="text-muted">Join StockWise as a licensed broker</p>
                                </div>

                                {/* Display Error from Redux state */}
                                {error && (
                                    <Alert variant="danger" dismissible onClose={handleAlertClose}>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {error}
                                    </Alert>
                                )}

                                <Formik
                                    initialValues={{
                                        fullName: '',
                                        email: '',
                                        password: '',
                                        confirmPassword: '',
                                        phone: '',
                                        company: '',
                                        licenseNumber: '', // Keep if needed by backend
                                        experience: '',   // Keep if needed by backend
                                        terms: false
                                    }}
                                    validationSchema={brokerRegisterSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({
                                        values,
                                        errors,
                                        touched,
                                        handleChange,
                                        handleBlur,
                                        handleSubmit: formikSubmit, // Renamed to avoid conflict
                                        isSubmitting,
                                    }) => {
                                        // Handle input change and clear error
                                        const handleInputChange = (e) => {
                                            handleChange(e);
                                            if (error) dispatch(clearError());
                                        };

                                        return (
                                            <Form noValidate onSubmit={formikSubmit}>
                                                {/* Form Fields */}
                                                <Row>
                                                    {/* Full Name */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerFullName">
                                                            <Form.Label>Full Name</Form.Label>
                                                            <Form.Control
                                                                type="text" name="fullName" placeholder="Enter your full name"
                                                                value={values.fullName} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.fullName && !!errors.fullName} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.fullName}</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    {/* Email */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerEmail">
                                                            <Form.Label>Email address</Form.Label>
                                                            <Form.Control
                                                                type="email" name="email" placeholder="name@example.com"
                                                                value={values.email} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.email && !!errors.email} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.email}</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    {/* Password */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerPassword">
                                                            <Form.Label>Password</Form.Label>
                                                            <Form.Control
                                                                type="password" name="password" placeholder="Create a password"
                                                                value={values.password} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.password && !!errors.password} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.password}</Form.Control.Feedback>
                                                            <PasswordStrengthMeter password={values.password} />
                                                        </Form.Group>
                                                    </Col>
                                                    {/* Confirm Password */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerConfirmPassword">
                                                            <Form.Label>Confirm Password</Form.Label>
                                                            <Form.Control
                                                                type="password" name="confirmPassword" placeholder="Confirm your password"
                                                                value={values.confirmPassword} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.confirmPassword && !!errors.confirmPassword} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.confirmPassword}</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    {/* Phone */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerPhone">
                                                            <Form.Label>Phone Number</Form.Label>
                                                            <Form.Control
                                                                type="tel" name="phone" placeholder="Enter your phone number"
                                                                value={values.phone} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.phone && !!errors.phone} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.phone}</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    {/* Company */}
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerCompany">
                                                            <Form.Label>Company or Organization</Form.Label>
                                                            <Form.Control
                                                                type="text" name="company" placeholder="Enter your company name"
                                                                value={values.company} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.company && !!errors.company} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.company}</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerLicenseNumber">
                                                            <Form.Label>Broker License Number</Form.Label>
                                                            <Form.Control
                                                                type="text" name="licenseNumber" placeholder="Enter your license number"
                                                                value={values.licenseNumber} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.licenseNumber && !!errors.licenseNumber} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.licenseNumber}</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3 position-relative" controlId="brokerExperience">
                                                            <Form.Label>Years of Experience</Form.Label>
                                                            <Form.Control
                                                                type="number" name="experience" placeholder="Years of experience"
                                                                value={values.experience} onChange={handleInputChange} onBlur={handleBlur}
                                                                isInvalid={touched.experience && !!errors.experience} disabled={loading}
                                                            />
                                                            <Form.Control.Feedback type="invalid" tooltip>{errors.experience}</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>


                                                {/* Terms */}
                                                <Form.Group className="mb-4" controlId="brokerTerms">
                                                    <Form.Check
                                                        type="checkbox" name="terms"
                                                        checked={values.terms} onChange={handleInputChange} onBlur={handleBlur}
                                                        isInvalid={touched.terms && !!errors.terms}
                                                        feedback={errors.terms} feedbackType="invalid" disabled={loading}
                                                        label={
                                                            <span className="small">
                                                                I agree to the{' '}
                                                                <Link to="/terms" target="_blank" className="text-decoration-none">Terms of Service</Link>{' '}
                                                                and{' '}
                                                                <Link to="/privacy" target="_blank" className="text-decoration-none">Privacy Policy</Link>{' '}
                                                                and I confirm that I am a licensed broker.
                                                            </span>
                                                        }
                                                    />
                                                </Form.Group>

                                                {/* Submit Button */}
                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant="primary" type="submit" size="lg"
                                                        disabled={loading || isSubmitting}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Submitting Registration...
                                                            </>
                                                        ) : (
                                                            'Register as Broker'
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        );
                                    }}
                                </Formik>

                                {/* Links */}
                                <div className="text-center mt-4">
                                    <p className="mb-1 text-muted">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-decoration-none fw-medium">Sign in</Link>
                                    </p>
                                    <p className="mt-1 text-muted">
                                        Want to register as a user?{' '}
                                        <Link to="/register" className="text-decoration-none fw-medium">User Registration</Link>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Footer />
        </>
    );
};

export default BrokerRegisterPage;