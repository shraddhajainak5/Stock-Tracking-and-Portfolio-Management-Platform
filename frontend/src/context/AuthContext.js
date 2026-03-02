import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext();

// API URL
const API_URL = "http://localhost:3000"; // Update this with your actual backend URL

// Provider component
export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const storedUser = localStorage.getItem('currentUser') 
    ? JSON.parse(localStorage.getItem('currentUser')) 
    : null;
    
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

	// Check if user is already logged in (on initial load)
	useEffect(() => {
		const checkLoggedIn = async () => {
			if (token) {
				try {
					// Set default auth header for all axios requests
					axios.defaults.headers.common[
						"Authorization"
					] = `Bearer ${token}`;

					// For now, we'll just set isAuthenticated to true if token exists
					// and ensure we have user data from localStorage
					if (currentUser) {
						setIsAuthenticated(true);
					} else {
						// If we have a token but no user, we could try to fetch the user data
						// or just clear the token as it might be invalid
						localStorage.removeItem(
							"token"
						);
						localStorage.removeItem(
							"currentUser"
						);
						setToken(null);
						setCurrentUser(null);
						setIsAuthenticated(false);
					}
					setLoading(false);
				} catch (error) {
					// If token is invalid or expired, clear everything
					console.error(
						"Auth check error:",
						error
					);
					localStorage.removeItem("token");
					localStorage.removeItem("currentUser");
					delete axios.defaults.headers.common[
						"Authorization"
					];
					setToken(null);
					setCurrentUser(null);
					setIsAuthenticated(false);
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		checkLoggedIn();
	}, [token, currentUser]);

	// Save user data to localStorage whenever it changes
	useEffect(() => {
		if (currentUser) {
			localStorage.setItem(
				"currentUser",
				JSON.stringify(currentUser)
			);
		} else {
			localStorage.removeItem("currentUser");
		}
	}, [currentUser]);

	// Register user
	const register = async (userData) => {
		setLoading(true);
		setError(null);

		try {
			const response = await axios.post(
				`${API_URL}/auth/register`,
				userData
			);

			// After registration, automatically log in the user
			if (response.data) {
				await login({
					email: userData.email,
					password: userData.password,
				});
			}

			return response.data;
		} catch (error) {
			setError(
				error.response?.data?.error ||
					"Registration failed. Please try again."
			);
			setLoading(false);
			throw error;
		}
	};

    // Register as broker 
    const registerAsBroker = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            // Add broker type to the user data
            const brokerData = {
                ...userData,
                type: 'broker'
            };

            const response = await axios.post(
                `${API_URL}/auth/register`,
                brokerData
            );

            // After registration, automatically log in the user
            if (response.data) {
                await login({
                    email: brokerData.email,
                    password: brokerData.password,
                });
            }

            return response.data;
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Broker registration failed. Please try again."
            );
            setLoading(false);
            throw error;
        }
    };

	// Login user
	const login = async (credentials) => {
		setLoading(true);
		setError(null);

		try {
			let response;

			// Check if this is a Google login (already has token)
			if (credentials.token) {
				response = {
					data: {
						token: credentials.token,
						user: credentials.user,
					},
				};
			} else {
				// Regular login
				response = await axios.post(
					`${API_URL}/auth/login`,
					credentials
				);
			}

			// Save token to localStorage
			localStorage.setItem("token", response.data.token);

			// Set token in state and axios headers
			setToken(response.data.token);
			axios.defaults.headers.common[
				"Authorization"
			] = `Bearer ${response.data.token}`;

			// Set current user and save to localStorage
			setCurrentUser(response.data.user);
			localStorage.setItem(
				"currentUser",
				JSON.stringify(response.data.user)
			);

			setIsAuthenticated(true);
			setLoading(false);

			console.log(
				"Login successful. User data:",
				response.data.user
			);

			return response.data;
		} catch (error) {
			console.error("Login error details:", error);

			// Get the specific error message from the response if available
			const errorMessage =
				error.response?.data?.error ||
				error.response?.data?.message ||
				"Login failed. Please check your credentials.";

			setError(errorMessage);
			setLoading(false);
			throw error;
		}
	};

	// Logout user
	const logout = () => {
		// Remove token from localStorage
		localStorage.removeItem("token");
		localStorage.removeItem("currentUser");

		// Remove auth header
		delete axios.defaults.headers.common["Authorization"];

		// Reset state
		setToken(null);
		setCurrentUser(null);
		setIsAuthenticated(false);

		console.log("User logged out successfully");
	};

	// Clear error state
	const clearError = () => setError(null);

	return (
		<AuthContext.Provider
			value={{
				currentUser,
				isAuthenticated,
				loading,
				error,
				register,
                registerAsBroker,
				login,
				logout,
				clearError,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
export default AuthContext;