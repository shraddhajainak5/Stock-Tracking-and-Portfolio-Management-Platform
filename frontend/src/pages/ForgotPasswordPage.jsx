// frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Link, useNavigate } from 'react-router-dom';

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, clearPasswordResetStatus, clearError } from '../redux/features/authSlice'; // Import thunk and clear action

// Validation Schema
const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
});

const ForgotPasswordPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- Select state from Redux store ---
    // Use the specific password reset status and error fields
    const { passwordResetStatus, passwordResetError } = useSelector(state => state.auth);
    const loading = passwordResetStatus === 'sending_otp'; // Check specific status for loading

    // --- Local State (Optional: for displaying success message if not storing in Redux) ---
    const [successMessage, setSuccessMessage] = useState('');

    // --- Clear Redux error/status on mount/unmount ---
    useEffect(() => {
        dispatch(clearPasswordResetStatus()); // Clear password reset specific state
        // Or use dispatch(clearError()); if it also clears passwordResetError
        return () => {
            dispatch(clearPasswordResetStatus());
        };
    }, [dispatch]);

    // --- Form Submission Handler ---
    const handleSubmit = async (values, { setSubmitting }) => {
        console.log('Requesting password reset OTP for:', values.email);
        setSuccessMessage(''); // Clear previous success message
        dispatch(clearPasswordResetStatus()); // Clear previous errors/status

        try {
            // Dispatch the requestPasswordReset async thunk
            const resultAction = await dispatch(requestPasswordReset(values.email)).unwrap();

            // On success (even if user doesn't exist, backend sends generic message)
            console.log("OTP request successful:", resultAction);
            setSuccessMessage(resultAction || "If an account with that email exists, an OTP has been sent."); // Use message from backend

            // --- Navigation on Success ---
            // Wait a bit for user to see the message, then navigate
            setTimeout(() => {
                navigate('/reset-password', { state: { email: values.email } });
            }, 2000); // 2-second delay

        } catch (rejectedValueOrSerializedError) {
            // Error state is set by the rejected thunk in Redux
            console.error('Request password reset failed:', rejectedValueOrSerializedError);
            // No need to set local error, rely on passwordResetError from Redux
        } finally {
            // We rely on Redux status for loading, setSubmitting might not be needed
            setSubmitting(loading);
        }
    };

    // --- Alert Close Handler ---
    const handleAlertClose = () => {
        dispatch(clearPasswordResetStatus()); // Clear Redux state
        setSuccessMessage(''); // Clear local success message
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
                                    <h2 className="fw-bold">Forgot Your Password?</h2>
                                    <p className="text-muted">
                                        Enter your email address below. If an account exists, we'll send an OTP to reset your password.
                                    </p>
                                </div>

                                {/* Display Success Message (Local State) */}
                                {successMessage && !passwordResetError && (
                                    <Alert variant="success" dismissible onClose={handleAlertClose}>
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        {successMessage}
                                    </Alert>
                                )}

                                {/* Display Error from Redux state */}
                                {passwordResetError && !successMessage && (
                                    <Alert variant="danger" dismissible onClose={handleAlertClose}>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {passwordResetError}
                                    </Alert>
                                )}

                                <Formik
                                    initialValues={{ email: '' }}
                                    validationSchema={forgotPasswordSchema}
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
                                        // Handle input change and clear messages/errors
                                        const handleInputChange = (e) => {
                                            handleChange(e);
                                            if (passwordResetError) dispatch(clearPasswordResetStatus());
                                            if (successMessage) setSuccessMessage('');
                                        };

                                        return (
                                            <Form noValidate onSubmit={formikSubmit}>
                                                <Form.Group className="mb-4 position-relative" controlId="forgotPassEmail">
                                                    <Form.Label>Email address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Enter your registered email"
                                                        name="email"
                                                        value={values.email}
                                                        onChange={handleInputChange} // Use wrapped handler
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.email && !!errors.email}
                                                        // Disable field after successful OTP request
                                                        disabled={loading || !!successMessage}
                                                    />
                                                    <Form.Control.Feedback type="invalid" tooltip>
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant="primary"
                                                        type="submit"
                                                        disabled={loading || isSubmitting || !!successMessage} // Disable if loading or success
                                                        size="lg"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Sending OTP...
                                                            </>
                                                        ) : (
                                                            'Send Reset OTP'
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

export default ForgotPasswordPage;