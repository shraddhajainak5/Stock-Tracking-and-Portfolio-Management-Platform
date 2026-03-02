// frontend/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { registerSchema } from '../validations/schemas';
// Removed: import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import GoogleLoginButton from '../components/common/GoogleLoginButton'; // Ensure this uses Redux dispatch

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser, clearError, googleLoginHandler } from '../redux/features/authSlice'; // Import relevant actions/thunks

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- Select state from Redux store ---
    const { status, error, isAuthenticated, user } = useSelector(state => state.auth);
    const loading = status === 'loading';

    // --- Redirect Effect ---
    useEffect(() => {
        if (isAuthenticated) {
            if (user?.type === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/dashboard', { replace: true }); // Default dashboard after register/login
            }
        }
    }, [isAuthenticated, navigate, user]);

    // --- Clear Redux error on mount/unmount ---
    useEffect(() => {
        dispatch(clearError());
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // --- Form Submission Handler ---
    const handleSubmit = async (values, { setSubmitting }) => {
        console.log('Attempting registration with:', values);
        try {
            // Dispatch the registerUser async thunk
            const resultAction = await dispatch(registerUser({
                fullName: values.fullName,
                email: values.email,
                password: values.password
                // Note: type is usually handled by backend or defaults to 'user'
            })).unwrap(); // .unwrap() throws error on rejection, returns payload on success

            // If registration was successful (no error thrown by unwrap)
            console.log("Registration successful:", resultAction); // Log the success message from backend
            // Optionally, automatically log the user in
            console.log("Attempting auto-login after registration...");
            await dispatch(loginUser({ email: values.email, password: values.password })).unwrap();
            // Redirection will happen via the useEffect hook watching isAuthenticated

        } catch (rejectedValueOrSerializedError) {
            // Error is already set in Redux state by the rejected thunk
            console.error('Registration or auto-login failed:', rejectedValueOrSerializedError);
            // Optionally set a local error message if needed, but usually rely on Redux state 'error'
        } finally {
            setSubmitting(false);
        }
    };

    // --- Google Login Integration ---
    // Similar to LoginPage, ensure GoogleLoginButton dispatches googleLoginHandler
    // Or handle it via a callback temporarily
    const handleGoogleSuccess = (tokenResponse) => {
        dispatch(googleLoginHandler({ idToken: tokenResponse.access_token }));
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
                    <Col md={8} lg={6}>
                        <Card className="auth-card shadow-lg border-0">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">Create Your Account</h2>
                                    <p className="text-muted">Join StockWise Trading today</p>
                                </div>

                                {error && (
                                    <Alert variant="danger" dismissible onClose={handleAlertClose} className="d-flex align-items-center">
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
                                        terms: false
                                    }}
                                    validationSchema={registerSchema}
                                    onSubmit={handleSubmit}
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
                                        // Function to handle input changes and clear Redux error
                                        const handleInputChange = (e) => {
                                            handleChange(e);
                                            if (error) {
                                                dispatch(clearError());
                                            }
                                        };
                                        return (
                                            <Form noValidate onSubmit={formikSubmit}>
                                                {/* Full Name */}
                                                <Form.Group className="mb-3 position-relative" controlId="regFullName">
                                                    <Form.Label>Full Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="fullName"
                                                        placeholder="Enter your full name"
                                                        value={values.fullName}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.fullName && !!errors.fullName}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>
                                                        {errors.fullName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                {/* Email */}
                                                <Form.Group className="mb-3 position-relative" controlId="regEmail">
                                                    <Form.Label>Email address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        placeholder="name@example.com"
                                                        value={values.email}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.email && !!errors.email}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                {/* Password */}
                                                <Form.Group className="mb-3 position-relative" controlId="regPassword">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        placeholder="Create a password"
                                                        value={values.password}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.password && !!errors.password}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>
                                                        {errors.password}
                                                    </Form.Control.Feedback>
                                                    <PasswordStrengthMeter password={values.password} />
                                                    <Form.Text className="text-muted d-block mt-1">
                                                        Min 8 chars, incl. uppercase, lowercase, number, symbol.
                                                    </Form.Text>
                                                </Form.Group>

                                                {/* Confirm Password */}
                                                <Form.Group className="mb-3 position-relative" controlId="regConfirmPassword">
                                                    <Form.Label>Confirm Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="confirmPassword"
                                                        placeholder="Confirm your password"
                                                        value={values.confirmPassword}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>
                                                        {errors.confirmPassword}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                {/* Terms */}
                                                <Form.Group className="mb-4" controlId="regTerms">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="terms"
                                                        checked={values.terms}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.terms && !!errors.terms}
                                                        feedback={errors.terms}
                                                        feedbackType="invalid"
                                                        label={
                                                            <span className="small">
                                                                I agree to the{' '}
                                                                <Link to="/terms" target="_blank" className="text-decoration-none">
                                                                    Terms of Service
                                                                </Link>{' '}
                                                                and{' '}
                                                                <Link to="/privacy" target="_blank" className="text-decoration-none">
                                                                    Privacy Policy
                                                                </Link>
                                                            </span>
                                                        }
                                                    />
                                                </Form.Group>

                                                {/* Submit Button */}
                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant="primary"
                                                        type="submit"
                                                        disabled={loading || isSubmitting}
                                                        size="lg"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Creating Account...
                                                            </>
                                                        ) : (
                                                            'Create Account'
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        );
                                    }}
                                </Formik>

                                <div className="auth-divider my-4">
                                    <span>OR</span>
                                </div>

                                <div className="d-grid gap-2 mb-4">
                                    {/* Ensure GoogleLoginButton is updated or passes success/error back */}
                                    <GoogleLoginButton isRegistration={true} /* onSuccess={handleGoogleSuccess} onError={handleGoogleError} */ />
                                </div>

                                <div className="text-center">
                                    <p className="mb-0 text-muted">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-decoration-none fw-medium">
                                            Sign in
                                        </Link>
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

export default RegisterPage;