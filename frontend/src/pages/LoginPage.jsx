// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
// Import Link and useLocation for navigation and state reading
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import { loginSchema } from '../validations/schemas'; // Ensure this schema is correct

// Common Components
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import GoogleLoginButton from '../components/common/GoogleLoginButton';

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/features/authSlice'; // Adjust path if needed

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access location object

    // --- Select state from Redux store ---
    const { status, error, isAuthenticated, user } = useSelector(state => state.auth);
    const loading = status === 'loading'; // Derive loading state from status

    // --- State for success message from navigation ---
    const [successMessage, setSuccessMessage] = useState('');

    // Determine where to redirect after login
    const from = location.state?.from?.pathname || '/dashboard';

    // --- Redirect Effect ---
    // Redirects user if already authenticated, handles admin/user roles
    useEffect(() => {
        if (isAuthenticated) {
            const targetPath = user?.type === 'admin' ? '/admin/dashboard' : from;
            console.log(`Login Page: Authenticated (${user?.type || 'user'}), redirecting to ${targetPath}`);
            navigate(targetPath, { replace: true });
        }
    }, [isAuthenticated, navigate, from, user]);

    // --- Clear Redux error ---
    // Clears any previous error when the component mounts or the location changes
    useEffect(() => {
        dispatch(clearError());
        // Optional: Clear error when component unmounts as well
        return () => {
            dispatch(clearError());
        };
    }, [dispatch, location.key]); // Use location.key to trigger on navigation changes

    // --- Effect to check for success message from navigation state ---
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the state from location history after displaying
            // Use navigate with replace: true and empty state
            window.history.replaceState({}, document.title) // Simpler way to clear state without causing re-render loop
            // navigate(location.pathname, { replace: true, state: {} }); // Alternative method
        }
        // Clear success message if a Redux error occurs later
        if (error) {
            setSuccessMessage('');
        }
    }, [location.state, navigate, location.pathname, error]); // Add error to dependencies

    // --- Form Submission Handler ---
    const handleSubmit = (values, { setSubmitting }) => {
        console.log('Attempting login with credentials:', values);
        // Clear previous messages on new submission attempt
        setSuccessMessage('');
        dispatch(clearError());

        dispatch(loginUser({ email: values.email, password: values.password }))
            .unwrap()
            .catch((err) => {
                console.error("Login dispatch rejected:", err);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    // --- Error Alert Close Handler ---
    const handleAlertClose = () => {
        dispatch(clearError());
    };

    // --- Success Alert Close Handler ---
    const handleSuccessAlertClose = () => {
        setSuccessMessage('');
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
                                    <h2 className="fw-bold">Welcome Back</h2>
                                    <p className="text-muted">Sign in to access your StockWise account</p>
                                </div>

                                {/* Display Success Message (only if no error) */}
                                {successMessage && !error && (
                                    <Alert variant="success" dismissible onClose={handleSuccessAlertClose}>
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        {successMessage}
                                    </Alert>
                                )}

                                {/* Display Error Message (only if no success message) */}
                                {error && !successMessage && (
                                    <Alert variant="danger" dismissible onClose={handleAlertClose} className="d-flex align-items-center">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {error}
                                    </Alert>
                                )}

                                <Formik
                                    initialValues={{ email: '', password: '' }}
                                    validationSchema={loginSchema}
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
                                        // Function to handle input changes and clear messages
                                        const handleInputChange = (e) => {
                                            handleChange(e); // Call original Formik handler
                                            if (error) dispatch(clearError()); // Clear Redux error
                                            if (successMessage) setSuccessMessage(''); // Clear success message
                                        };

                                        return (
                                            <Form noValidate onSubmit={formikSubmit}>
                                                {/* Email Input */}
                                                <Form.Group className="mb-3 position-relative" controlId="loginEmail">
                                                    <Form.Label>Email address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        name="email"
                                                        value={values.email}
                                                        onChange={handleInputChange} // Use wrapped handler
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.email && !!errors.email}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                {/* Password Input */}
                                                <Form.Group className="mb-3 position-relative" controlId="loginPassword">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Enter your password"
                                                        name="password"
                                                        value={values.password}
                                                        onChange={handleInputChange} // Use wrapped handler
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.password && !!errors.password}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>
                                                        {errors.password}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                {/* Remember Me & Forgot Password Link */}
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <Form.Check
                                                        type="checkbox"
                                                        id="rememberMe"
                                                        label="Remember me"
                                                        name="rememberMe" // Added name for potential future use
                                                    />
                                                    {/* Forgot Password Link */}
                                                    <Link to="/forgot-password" className="text-decoration-none small">
                                                        Forgot Password?
                                                    </Link>
                                                </div>

                                                {/* Submit Button */}
                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant="primary"
                                                        type="submit"
                                                        disabled={loading || isSubmitting} // Disable if Redux is loading OR Formik is submitting
                                                        size="lg"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Signing In...
                                                            </>
                                                        ) : (
                                                            'Sign In'
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        );
                                    }}
                                </Formik>

                                {/* Divider */}
                                <div className="auth-divider my-4">
                                    <span>OR</span>
                                </div>

                                {/* Google Login Button */}
                                <div className="d-grid gap-2 mb-4">
                                    <GoogleLoginButton />
                                </div>

                                {/* Sign Up Link */}
                                <div className="text-center">
                                    <p className="mb-0 text-muted">
                                        Don't have an account?{' '}
                                        <Link to="/register" className="text-decoration-none fw-medium">
                                            Sign up now
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

export default LoginPage;