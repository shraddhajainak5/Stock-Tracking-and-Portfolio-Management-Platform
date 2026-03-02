// frontend/src/services/authService.js
import axios from "axios";

// API URL - Ensure this is correctly pointing to your backend
const API_URL = "http://localhost:3000";

// --- Axios Default Header Setup ---
// This function should ideally be called ONCE when the token changes,
// typically within the Redux slice/thunk after a successful login/token refresh.
// Keeping it here might be okay, but centralizing in the slice is often cleaner.
const setAuthToken = (token) => {
	if (token) {
		axios.defaults.headers.common[
			"Authorization"
		] = `Bearer ${token}`;
		console.log("Axios header set with token.");
	} else {
		delete axios.defaults.headers.common["Authorization"];
		console.log("Axios header cleared.");
	}
};

// --- API Error Handling ---
// Centralized error handling for API calls from this service
const handleApiError = (error, context = "API Call") => {
	console.error(
		`${context} Error:`,
		error.response || error.message || error
	);
	// If the error has a response from the server
	if (error.response) {
		// Extract the error message, prioritize 'error' field, then 'message'
		const serverError =
			error.response.data?.error ||
			error.response.data?.message ||
			error.response.statusText || // Fallback to status text
			"An unexpected server error occurred.";
		// Return an Error object with the server message
		return new Error(serverError);
	} else if (error.request) {
		// Network error (no response received)
		return new Error(
			"Network error. Could not reach server. Please check connection."
		);
	} else {
		// Other errors (e.g., setup error)
		return new Error(
			error.message || "An unexpected error occurred."
		);
	}
};

// --- Service Functions ---

// Register a new user
const register = async (userData) => {
	try {
		console.log(
			"AuthService: Calling POST /auth/register",
			userData
		);
		// Only make the API call and return the data (or throw error)
		const response = await axios.post(
			`${API_URL}/auth/register`,
			userData
		);
		console.log(
			"AuthService: Registration Response:",
			response.data
		);
		// Expected backend response: { message: 'User created successfully.' }
		return response.data;
	} catch (error) {
		throw handleApiError(error, "Registration");
	}
};

// Login user
const login = async (credentials) => {
	try {
		console.log(
			"AuthService: Calling POST /auth/login",
			credentials
		);
		const response = await axios.post(
			`${API_URL}/auth/login`,
			credentials
		);
		console.log("AuthService: Login Response:", response.data);

		// --- Token/User Handling (Could be moved entirely to slice/thunk) ---
		// It's okay here, but ensures consistency if handled where state is managed.
		// If kept here, ensure the slice doesn't duplicate this logic.
		if (response.data && response.data.token) {
			localStorage.setItem("token", response.data.token);
			setAuthToken(response.data.token); // Set header immediately
		} else {
			console.warn(
				"AuthService: Token missing in login response."
			);
			localStorage.removeItem("token"); // Clear potentially stale token
			setAuthToken(null);
		}
		if (response.data && response.data.user) {
			localStorage.setItem(
				"currentUser",
				JSON.stringify(response.data.user)
			);
		} else {
			console.warn(
				"AuthService: User object missing in login response."
			);
			localStorage.removeItem("currentUser"); // Clear potentially stale user
		}
		// --- End Token/User Handling ---

		// Return the full payload for the Redux slice
		// Expected backend response: { message: '...', user: {...}, token: '...' }
		console.log(
			"AuthService: Login Response Data Received:",
			response.data
		);
		return response.data;
	} catch (error) {
		// Clear tokens/user on login failure before throwing
		localStorage.removeItem("token");
		localStorage.removeItem("currentUser");
		setAuthToken(null);
		throw handleApiError(error, "Login");
	}
};

// Google Login - Backend Call
// Note: The `googleLoginHandler` thunk in authSlice now calls this directly via axios.
// This function might become redundant unless called from elsewhere.
// If keeping it, it should just make the API call.
const googleLogin = async (tokenData) => {
	try {
		console.log(
			"AuthService: Calling POST /auth/google",
			tokenData
		);
		const response = await axios.post(
			`${API_URL}/auth/google`,
			tokenData
		);
		console.log(
			"AuthService: Google Login Response:",
			response.data
		);
		// Token/User handling should ideally happen in the thunk after this call returns successfully
		return response.data; // Expected: { user: {...}, token: '...' }
	} catch (error) {
		throw handleApiError(error, "Google Login");
	}
};

// --- NEW: Backend Logout Call ---
// This function specifically calls the backend endpoint.
// The Redux thunk will handle clearing local storage etc.
const logoutUserBackend = async () => {
	console.log("AuthService: Calling POST /auth/logout");
	const token = localStorage.getItem("token");
	// If no token, we can't tell backend to log out, but frontend logout should proceed
	if (!token) {
		console.warn(
			"AuthService: No token found, skipping backend logout call."
		);
		return { message: "No active session on frontend." }; // Return a success-like message
	}
	try {
		// Using POST, change to axios.delete if you used DELETE route in backend
		const response = await axios.post(
			`${API_URL}/auth/logout`,
			{},
			{
				// Send empty body if needed
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		console.log(
			"AuthService: Backend Logout Response:",
			response.data
		);
		return response.data; // Expected: { message: 'Logout processed.' }
	} catch (error) {
		// Don't throw error here ideally, logout should proceed on frontend. Log it instead.
		console.error(
			"AuthService: Backend logout call failed:",
			error.response || error.message || error
		);
		// Return a specific object or message indicating backend call failure but allowing frontend logout
		return {
			message: "Backend logout call failed, proceeding with frontend logout.",
			error: true,
		};
	}
};

// Logout user (clears local state)
const logout = () => {
	console.log(
		"AuthService: Clearing local storage and Axios header for logout."
	);
	localStorage.removeItem("token");
	localStorage.removeItem("currentUser");
	setAuthToken(null);
	// Note: Redux state clearing happens in the slice reducer.
};

// Check if user is logged in (based on local storage)
const isAuthenticated = () => {
	const token = localStorage.getItem("token");
	// Maybe add token expiration check here in the future
	return !!token;
};

// Get current user token from local storage
const getToken = () => {
	return localStorage.getItem("token");
};

// Get current user from local storage (simple version)
// A version calling the backend `/auth/me` might be needed for validation/fresh data
const getCurrentUserFromStorage = () => {
	const userStr = localStorage.getItem("currentUser");
	try {
		return userStr ? JSON.parse(userStr) : null;
	} catch (e) {
		console.error(
			"Failed to parse currentUser from localStorage",
			e
		);
		localStorage.removeItem("currentUser"); // Clear corrupted data
		return null;
	}
};

// Export functions that are needed by the thunks or components
const authService = {
	register,
	login,
	// googleLogin, // The thunk calls axios directly now, this might be unused
	logout, // The slice calls this, or handles the logic directly
    logoutUserBackend,
	isAuthenticated, // Useful for initial checks maybe? Redux state is primary source
	getToken, // Useful for initial header setup maybe? Redux state is primary source
	getCurrentUserFromStorage, // Might be useful for initial state hydration
	setAuthToken, // Export if called directly from slice/thunk (recommended)
	API_URL, // Export API_URL if needed elsewhere (e.g., in googleLoginHandler thunk)
};

export default authService;