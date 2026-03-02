// src/components/common/GoogleLoginButton.jsx
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Spinner } from 'react-bootstrap'; // Added Spinner
import axios from 'axios'; // Keep axios if the thunk doesn't handle the direct call (though it should)
import { API_URL } from '../../config/constants';
// Removed: import useAuth from '../../hooks/useAuth';

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { googleLoginHandler, clearError } from '../../redux/features/authSlice';

const GoogleLoginButton = ({ isRegistration = false, // Keep isRegistration prop if needed for button text
    onSuccessCallback, // Optional callback prop if parent needs notification
    onErrorCallback    // Optional callback prop
}) => {

    const dispatch = useDispatch();
    // Optionally select loading/error state if you want to disable button or show specific feedback
    const { status, error } = useSelector(state => state.auth);
    const loading = status === 'loading';

    const handleGoogleLoginSuccess = async (tokenResponse) => {
        console.log('Google Raw Token Response:', tokenResponse);
        dispatch(clearError()); // Clear previous errors
        try {
            // Dispatch the async thunk with the access token
            await dispatch(googleLoginHandler({ idToken: tokenResponse.access_token })).unwrap();
            console.log('Google login thunk dispatched successfully.');
            if (onSuccessCallback) onSuccessCallback();
            // Navigation is handled by useEffect in LoginPage/RegisterPage watching isAuthenticated
        } catch (rejectedValueOrSerializedError) {
            console.error('Google Login Thunk Failed:', rejectedValueOrSerializedError);
            if (onErrorCallback) onErrorCallback(rejectedValueOrSerializedError);
            // Error state is set by the rejected thunk in Redux
        }
    };

    const handleGoogleLoginError = (error) => {
        console.error('Google OAuth Flow Failed:', error);
        // You might want to dispatch an action here to set a generic error,
        // or display a local message, or rely on the thunk's potential failure.
        if (onErrorCallback) onErrorCallback(error);
    };

    // Configure Google Login hook
    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: handleGoogleLoginError,
        // flow: 'auth-code', // Use 'implicit' (default) for access token, 'auth-code' for authorization code
    });

    return (
        <Button
            variant="outline-primary" // Or customize as needed
            onClick={() => googleLogin()} // Trigger the Google login flow
            className="w-100 d-flex align-items-center justify-content-center"
            disabled={loading} // Disable button while auth state is loading
        >
            {loading && status === 'loading' ? ( // Check specifically if *this* action is causing loading if needed
                <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                </>
            ) : (
                <>
                    <i className="bi bi-google me-2"></i>
                    {isRegistration ? 'Sign up with Google' : 'Sign in with Google'}
                </>
            )}
        </Button>
    );
};

export default GoogleLoginButton;