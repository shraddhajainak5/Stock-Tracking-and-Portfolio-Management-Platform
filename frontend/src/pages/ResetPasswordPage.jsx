// frontend/src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
// Removed API_URL import if direct axios calls are removed

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordWithOtp, clearPasswordResetStatus, clearError } from '../redux/features/authSlice'; // Import thunk and clear action

// Validation Schema
const resetPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'), // Keep email in schema
    otp: Yup.string()
        .required('OTP is required')
        .matches(/^[0-9]{6}$/, 'OTP must be exactly 6 digits'),
    password: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain an uppercase letter')
        .matches(/[a-z]/, 'Password must contain a lowercase letter')
        .matches(/[0-9]/, 'Password must contain a number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character'),
    confirmPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // --- Select state from Redux store ---
    const { passwordResetStatus, passwordResetError } = useSelector(state => state.auth);
    const loading = passwordResetStatus === 'resetting'; // Check specific status

    // Get email from navigation state, default to empty string
    const initialEmail = location.state?.email || '';

    // --- Clear Redux error/status on mount/unmount ---
    useEffect(() => {
        dispatch(clearPasswordResetStatus());
        return () => {
            dispatch(clearPasswordResetStatus());
        };
    }, [dispatch]);

    // --- Form Submission Handler ---
    const handleSubmit = async (values, { setSubmitting }) => {
        console.log('Attempting password reset with OTP:', values.email);
        dispatch(clearPasswordResetStatus()); // Clear previous errors/status

        try {
            // Dispatch the resetPasswordWithOtp async thunk
            const resultAction = await dispatch(resetPasswordWithOtp({
                email: values.email,
                otp: values.otp,
                password: values.password,
                confirmPassword: values.confirmPassword // Send confirm for backend double-check if needed
            })).unwrap(); // Use unwrap to catch rejection

            // On success (fulfilled)
            console.log("Password reset successful:", resultAction);

            // Redirect to login page with a success message
            navigate('/login', {
                state: { message: resultAction || 'Password reset successful! Please log in.' }, // Use message from backend
                replace: true // Prevent going back
            });

        } catch (rejectedValueOrSerializedError) {
            // Error state is set by the rejected thunk in Redux
            console.error('Reset password failed:', rejectedValueOrSerializedError);
            // No need to set local error state
        } finally {
            setSubmitting(loading);
        }
    };

    // --- Alert Close Handler ---
    const handleAlertClose = () => {
        dispatch(clearPasswordResetStatus());
    };

    return (
        <>
            <Navbar />
            <Container className="py-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="auth-card shadow-lg border-0">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">Reset Your Password</h2>
                                    <p className="text-muted">Enter the OTP sent to <strong>{initialEmail || 'your email'}</strong> and set a new password.</p>
                                </div>

                                {/* Display Error from Redux state */}
                                {passwordResetError && (
                                    <Alert variant="danger" dismissible onClose={handleAlertClose}>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {passwordResetError}
                                    </Alert>
                                )}

                                <Formik
                                    initialValues={{
                                        email: initialEmail, // Pre-fill email
                                        otp: '',
                                        password: '',
                                        confirmPassword: ''
                                    }}
                                    validationSchema={resetPasswordSchema}
                                    onSubmit={handleSubmit}
                                    enableReinitialize // Allows initialValues to update if email changes
                                >
                                    {({
                                        values,
                                        errors,
                                        touched,
                                        handleChange,
                                        handleBlur,
                                        handleSubmit: formikSubmit,
                                        isSubmitting,
                                    }) => {
                                        // Handle input change and clear error
                                        const handleInputChange = (e) => {
                                            handleChange(e);
                                            if (passwordResetError) dispatch(clearPasswordResetStatus());
                                        };

                                        return (
                                            <Form noValidate onSubmit={formikSubmit}>
                                                {/* Email (mostly hidden or read-only, but needed for submission) */}
                                                <Form.Group className="mb-3 position-relative visually-hidden" controlId="resetEmailHidden">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control type="email" name="email" value={values.email} readOnly />
                                                </Form.Group>

                                                {/* OTP Input */}
                                                <Form.Group className="mb-3 position-relative" controlId="resetOtp">
                                                    <Form.Label>One-Time Password (OTP)</Form.Label>
                                                    <Form.Control
                                                        type="text" placeholder="Enter the 6-digit code"
                                                        name="otp" value={values.otp} onChange={handleInputChange} onBlur={handleBlur}
                                                        isInvalid={touched.otp && !!errors.otp} maxLength={6} disabled={loading}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>{errors.otp}</Form.Control.Feedback>
                                                </Form.Group>

                                                {/* New Password */}
                                                <Form.Group className="mb-3 position-relative" controlId="resetPassword">
                                                    <Form.Label>New Password</Form.Label>
                                                    <Form.Control
                                                        type="password" placeholder="Enter new password"
                                                        name="password" value={values.password} onChange={handleInputChange} onBlur={handleBlur}
                                                        isInvalid={touched.password && !!errors.password} disabled={loading}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>{errors.password}</Form.Control.Feedback>
                                                    <PasswordStrengthMeter password={values.password} />
                                                </Form.Group>

                                                {/* Confirm New Password */}
                                                <Form.Group className="mb-4 position-relative" controlId="resetConfirmPassword">
                                                    <Form.Label>Confirm New Password</Form.Label>
                                                    <Form.Control
                                                        type="password" placeholder="Confirm new password"
                                                        name="confirmPassword" value={values.confirmPassword} onChange={handleInputChange} onBlur={handleBlur}
                                                        isInvalid={touched.confirmPassword && !!errors.confirmPassword} disabled={loading}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>{errors.confirmPassword}</Form.Control.Feedback>
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
                                                                Resetting Password...
                                                            </>
                                                        ) : (
                                                            'Reset Password'
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                                <div className="text-center mt-4">
                                    <Link to="/login" className="text-decoration-none">
                                        <i className="bi bi-arrow-left me-1"></i>
                                        Back to Login
                                    </Link>
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

export default ResetPasswordPage;