// frontend/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService"; // Adjust path if necessary
import axios from "axios"; // Needed to set auth header

// --- Initial State ---
// Attempt to load user and token from localStorage
const user = JSON.parse(localStorage.getItem("currentUser"));
const token = localStorage.getItem("token");

const initialState = {
	user: user ? user : null,
	token: token ? token : null,
	isAuthenticated: token ? true : false,
	status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
	error: null,
	passwordResetStatus: "idle", // 'idle' | 'sending_otp' | 'otp_sent' | 'resetting' | 'reset_success' | 'reset_failed'
	passwordResetError: null,
	profileUpdateStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
	profileUpdateError: null,
	passwordChangeStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
	passwordChangeError: null,
	documentUploadStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
	documentUploadError: null,
};

// --- Async Thunks ---

// Register User Thunk
export const registerUser = createAsyncThunk(
	"auth/registerUser",
	async (userData, { rejectWithValue }) => {
		try {
			// We only register here. Login will be dispatched separately if needed.
			const response = await authService.register(userData);
			// We don't automatically log in here, just return the success message.
			// The component can decide to dispatch loginUser afterwards.
			return response; // Should return { message: 'User created successfully.' }
		} catch (error) {
			// authService should throw an error with a message
			return rejectWithValue(
				error.message || "Registration failed"
			);
		}
	}
);

// Login User Thunk
export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (credentials, { rejectWithValue }) => {
		try {
			const data = await authService.login(credentials);
			// The service now handles setting the token in localStorage and axios headers
			return data; // Expected: { user: {...}, token: '...' }
		} catch (error) {
			return rejectWithValue(error.message || "Login failed");
		}
	}
);

// Google Login Thunk
export const googleLoginHandler = createAsyncThunk(
	"auth/googleLogin",
	async (tokenData, { rejectWithValue }) => {
		// Assuming tokenData is { idToken: '...' }
		try {
			// This backend call should return { user: {...}, token: '...' } on success
			const response = await axios.post(
				`${
					authService.API_URL ||
					"http://localhost:3000"
				}/auth/google`,
				tokenData
			);

			// Manually handle setting token and user like in login service
			if (response.data.token) {
				localStorage.setItem(
					"token",
					response.data.token
				);
				authService.setAuthToken(response.data.token); // Ensure axios header is set
			}
			if (response.data.user) {
				localStorage.setItem(
					"currentUser",
					JSON.stringify(response.data.user)
				);
			}
			return response.data; // Expected: { user: {...}, token: '...' }
		} catch (error) {
			const message =
				error.response?.data?.error ||
				error.message ||
				"Google Login failed";
			return rejectWithValue(message);
		}
	}
);

export const registerBroker = createAsyncThunk(
	"auth/registerBroker",
	async (brokerData, { rejectWithValue }) => {
		// brokerData expected: { fullName, email, password, phone, company, licenseNumber, experience }
		console.log(
			"AuthSlice: Dispatching registerBroker thunk with data:",
			brokerData
		);
		try {
			// Ensure your authService has a function for this or call axios directly
			// Example using axios directly:
			const response = await axios.post(
				`${
					authService.API_URL ||
					"http://localhost:3000"
				}/auth/broker-register`,
				brokerData
				// No Authorization header needed for registration
			);
			console.log(
				"AuthSlice: Broker registration backend response:",
				response.data
			);
			// Expected backend response: { message: 'Broker registered successfully...' }
			return response.data; // Return success message or relevant data
		} catch (error) {
			const message =
				error.response?.data?.error ||
				error.message ||
				"Broker registration failed";
			console.error(
				"AuthSlice: Broker registration failed:",
				message
			);
			return rejectWithValue(message);
		}
	}
);

// Thunk to verify token / fetch user data on app load
export const verifyAuth = createAsyncThunk(
	"auth/verifyAuth",
	async (_, { getState, rejectWithValue }) => {
		const { token } = getState().auth; // Get token from existing state
		if (!token) {
			return rejectWithValue("No token found"); // Not logged in
		}
		try {
			// Option 1: Call a dedicated backend endpoint like /auth/me or /auth/verify
			// console.log("AuthSlice: Verifying token via /auth/me");
			// authService.setAuthToken(token); // Ensure header is set for the request
			// const response = await axios.get(
			// 	`${
			// 		authService.API_URL ||
			// 		"http://localhost:3000"
			// 	}/auth/me`
			// ); // Replace with your actual endpoint
			// console.log(
			// 	"AuthSlice: /auth/me response:",
			// 	response.data
			// );
			// // Backend should return the user object if token is valid
			// if (response.data && response.data.user) {
			// 	// Update localStorage just in case data was refreshed
			// 	localStorage.setItem(
			// 		"currentUser",
			// 		JSON.stringify(response.data.user)
			// 	);
			// 	return { user: response.data.user }; // Return payload for fulfilled case
			// } else {
			// 	throw new Error(
			// 		"Invalid user data received from verification endpoint."
			// 	);
			// }

			//Option 2: If no backend endpoint, just assume token is valid if it exists
			//This is less secure as the token could be expired/invalidated on the backend
			console.log(
				"AuthSlice: Assuming token is valid (no backend check)"
			);
			const userFromStorage =
				authService.getCurrentUserFromStorage();
			if (userFromStorage) {
				return { user: userFromStorage };
			} else {
				throw new Error(
					"Token exists but no user data in storage."
				);
			}
		} catch (error) {
			console.error("Auth verification failed:", error);
			// Clear invalid token/user data if verification fails
			localStorage.removeItem("token");
			localStorage.removeItem("currentUser");
			authService.setAuthToken(null);
			return rejectWithValue(
				error.message || "Token verification failed"
			);
		}
	}
);

// --- Request Password Reset OTP Thunk ---
export const requestPasswordReset = createAsyncThunk(
	"auth/requestPasswordReset",
	async (email, { rejectWithValue }) => {
		console.log(
			"AuthSlice: Dispatching requestPasswordReset thunk for email:",
			email
		);
		try {
			// Example using axios directly:
			const response = await axios.post(
				`${
					authService.API_URL ||
					"http://localhost:3000"
				}/auth/forgot-password`,
				{ email } // Send email in the request body
			);
			console.log(
				"AuthSlice: Forgot password backend response:",
				response.data
			);
			// Expected backend response: { message: 'If an account exists...' }
			// Return the success message to potentially display in the component
			return response.data.message;
		} catch (error) {
			const message =
				error.response?.data?.error ||
				error.message ||
				"Failed to request password reset OTP.";
			console.error(
				"AuthSlice: Request password reset failed:",
				message
			);
			// Even on backend error, often we want to show the generic frontend message
			// But we can still capture the real error here for logging or specific handling
			return rejectWithValue(message);
		}
	}
);

// --- Reset Password with OTP Thunk ---
export const resetPasswordWithOtp = createAsyncThunk(
	"auth/resetPasswordWithOtp",
	async (credentials, { rejectWithValue }) => {
		// credentials expected: { email, otp, password, confirmPassword }
		console.log(
			"AuthSlice: Dispatching resetPasswordWithOtp thunk for email:",
			credentials.email
		);
		try {
			// Example using axios directly:
			const response = await axios.post(
				`${
					authService.API_URL ||
					"http://localhost:3000"
				}/auth/reset-password-otp`,
				credentials // Send all necessary data
			);
			console.log(
				"AuthSlice: Reset password with OTP backend response:",
				response.data
			);
			// Expected backend response: { message: 'Password has been reset successfully.' }
			return response.data.message; // Return success message
		} catch (error) {
			const message =
				error.response?.data?.error ||
				error.message ||
				"Failed to reset password.";
			console.error(
				"AuthSlice: Reset password with OTP failed:",
				message
			);
			return rejectWithValue(message);
		}
	}
);

// --- NEW: Update User Profile Thunk ---
export const updateUserProfile = createAsyncThunk(
	"auth/updateUserProfile",
	async (profileData, { getState, rejectWithValue }) => {
		// profileData should contain fields to update, e.g., { _id, fullName, email, phone, address }
		console.log(
			"AuthSlice: Dispatching updateUserProfile thunk with data:",
			profileData
		);
		const { token } = getState().auth; // Get token for auth header
		if (!token) return rejectWithValue("Authentication required.");
		if (!profileData._id)
			return rejectWithValue(
				"User ID missing for profile update."
			);

		try {
			// Assuming backend expects PATCH /user/update-profile (adjust if needed)
			// The service function should be created or use axios directly
			// Example using axios directly:
			const response = await axios.patch(
				`${
					authService.API_URL ||
					"http://localhost:3000"
				}/user/update-profile`, // Ensure endpoint matches backend
				profileData, // Send updated data
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log(
				"AuthSlice: Update profile backend response:",
				response.data
			);
			// Expected backend response: { message: '...', user: { updated user data } }

			// --- IMPORTANT: Update localStorage with the NEW user data ---
			if (response.data && response.data.user) {
				localStorage.setItem(
					"currentUser",
					JSON.stringify(response.data.user)
				);
			}
			// ---

			return response.data; // Return { message, user }
		} catch (error) {
			const message =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.message ||
				"Failed to update profile.";
			console.error(
				"AuthSlice: Update profile failed:",
				message
			);
			return rejectWithValue(message);
		}
	}
);

// --- NEW: Change User Password (from Profile) Thunk ---
export const changeUserPassword = createAsyncThunk(
	"auth/changeUserPassword",
	async (passwordData, { getState, rejectWithValue }) => {
		// passwordData expected: { currentPassword, newPassword, confirmPassword }
		console.log("AuthSlice: Dispatching changeUserPassword thunk");
		const { token, user } = getState().auth; // Get token and user ID
		console.log("inside thunk user is: ", user);

		if (!token) return rejectWithValue("Authentication required.");
		if (!user || !user._id)
			return rejectWithValue("User ID not found.");

		try {
			// Example using axios directly:
			const response = await axios.patch(
				// Using PATCH, adjust if backend uses POST
				`${
					authService.API_URL ||
					"http://localhost:3000"
				}/auth/change-password/${user._id}`, // Endpoint requires user ID
				passwordData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log(
				"AuthSlice: Change password backend response:",
				response.data
			);
			// Expected backend response: { message: 'Password changed successfully' }
			return response.data.message; // Return success message
		} catch (error) {
			const message =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.message ||
				"Failed to change password.";
			console.error(
				"AuthSlice: Change password failed:",
				message
			);
			return rejectWithValue(message);
		}
	}
);

// --- NEW: Upload Proof Document Thunk ---
export const uploadProofDocument = createAsyncThunk(
	"auth/uploadProofDocument",
	async ({ formData }, { getState, rejectWithValue }) => {
		// Pass formData directly
		// formData expected to contain: proof (file), userId, proofType
		console.log("AuthSlice: Dispatching uploadProofDocument thunk");
		const { token } = getState().auth;
		if (!token) return rejectWithValue("Authentication required.");

		try {
			// Example using axios directly:
			const response = await axios.post(
				`${
					authService.API_URL ||
					"http://localhost:3000"
				}/user/uploadProof`,
				formData, // Send formData directly
				{
					headers: {
						"Content-Type":
							"multipart/form-data", // Important for file uploads
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log(
				"AuthSlice: Upload proof backend response:",
				response.data
			);
			// Expected backend response: { message, proof, proofType }

			// --- IMPORTANT: Update localStorage with the NEW user data ---
			// Fetch the updated user data or merge the proof info
			const updatedUser = {
				...getState().auth.user,
				proof: response.data.proof,
				proofType: response.data.proofType,
			};
			localStorage.setItem(
				"currentUser",
				JSON.stringify(updatedUser)
			);
			// ---

			return response.data; // Return { message, proof, proofType }
		} catch (error) {
			const message =
				error.response?.data?.error ||
				error.message ||
				"Failed to upload document.";
			console.error(
				"AuthSlice: Upload proof failed:",
				message
			);
			return rejectWithValue(message);
		}
	}
);

// --- NEW: Logout User Thunk ---
export const logoutUser = createAsyncThunk(
	"auth/logoutUser",
	async (_, { dispatch, rejectWithValue }) => {
		console.log("AuthSlice: Dispatching logoutUser thunk");
		try {
			await authService.logoutUserBackend(); // Call the specific backend logout service
			console.log(
				"AuthSlice: Backend logout call attempted."
			);
			return { success: true }; // Indicate successful frontend logout procedure
		} catch (error) {
			// Even if backend call fails, attempt frontend logout
			console.error(
				"AuthSlice: Error during backend logout call, proceeding with frontend logout",
				error
			);
			return rejectWithValue(
				"Logout failed but local cleanup attempted."
			); // Still indicate success for clearing state
		} finally {
			// --- This cleanup ALWAYS happens in fulfilled/rejected ---
			console.log(
				"AuthSlice: Clearing local storage and Axios header in thunk finally/reducer."
			);
			localStorage.removeItem("token");
			localStorage.removeItem("currentUser");
			authService.setAuthToken(null);
		}
	}
);

// --- Slice Definition ---
const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// Synchronous action to log out
		// logout: (state) => {
		// 	console.log("AuthSlice: Executing logout reducer.");
		// 	console.log(
		// 		"AuthSlice: State BEFORE logout:",
		// 		JSON.stringify(state)
		// 	);

		// 	// Clear local storage
		// 	localStorage.removeItem("token");
		// 	localStorage.removeItem("currentUser");
		// 	// Clear Axios header
		// 	authService.setAuthToken(null); // Call the service function to clear header

		// 	// Reset Redux state
		// 	state.user = null;
		// 	state.token = null;
		// 	state.isAuthenticated = false;
		// 	state.status = "idle"; // Reset status to idle
		// 	state.error = null; // Clear any existing errors
		// 	// Reset profile statuses on logout
		// 	state.profileUpdateStatus = "idle";
		// 	state.profileUpdateError = null;
		// 	state.passwordChangeStatus = "idle";
		// 	state.passwordChangeError = null;
		// 	state.documentUploadStatus = "idle";
		// 	state.documentUploadError = null;
		// 	state.passwordResetStatus = "idle";
		// 	state.passwordResetError = null;

		// 	console.log(
		// 		"AuthSlice: State AFTER logout:",
		// 		JSON.stringify(state)
		// 	);
		// },
		clearError: (state) => {
			state.error = null;
			state.profileUpdateError = null;
			state.passwordChangeError = null;
			state.documentUploadError = null;
		},
		clearPasswordResetStatus: (state) => {
			state.passwordResetStatus = "idle";
			state.passwordResetError = null;
		},
		clearProfileStatus: (state) => {
			state.profileUpdateStatus = "idle";
			state.profileUpdateError = null;
			state.passwordChangeStatus = "idle";
			state.passwordChangeError = null;
			state.documentUploadStatus = "idle";
			state.documentUploadError = null;
		},
		// Potentially add reducers to update user profile info synchronously if needed
	},
	extraReducers: (builder) => {
		builder
			// --- Register User ---
			.addCase(registerUser.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.status = "succeeded";
				// Registration successful, but not logged in yet.
				// Optionally show a success message from action.payload.message
				console.log(
					"Registration succeeded:",
					action.payload.message
				);
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload; // Error message from rejectWithValue
			})

			// --- Login User ---
			.addCase(loginUser.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				console.log(
					"AuthSlice: loginUser.fulfilled -- START"
				);
				console.log(
					"AuthSlice: Received Payload:",
					JSON.stringify(action.payload, null, 2)
				); // Log the full payload clearly

				if (
					action.payload &&
					action.payload.user &&
					action.payload.token
				) {
					console.log(
						"AuthSlice: Payload is valid. Updating state..."
					);
					console.log(
						"AuthSlice: state.user BEFORE:",
						state.user
					);

					state.user = action.payload.user; // THE CRITICAL LINE
					state.token = action.payload.token;
					state.isAuthenticated = true;
					state.status = "succeeded";
					state.error = null; // Clear error on success

					console.log(
						"AuthSlice: state.user AFTER:",
						state.user
					); // Check immediately after setting
					console.log(
						"AuthSlice: Full state AFTER update:",
						JSON.stringify(state, null, 2)
					); // Log the entire slice state

					// Handle localStorage/Axios header consistency (ensure it matches the state)
					try {
						localStorage.setItem(
							"currentUser",
							JSON.stringify(
								action.payload
									.user
							)
						);
						localStorage.setItem(
							"token",
							action.payload.token
						);
						authService.setAuthToken(
							action.payload.token
						);
						console.log(
							"AuthSlice: Updated localStorage and Axios header."
						);
					} catch (e) {
						console.error(
							"AuthSlice: Error updating localStorage",
							e
						);
						// Decide how to handle this - maybe revert state?
					}
				} else {
					console.error(
						"AuthSlice ERROR: Fulfilled payload missing user or token!",
						action.payload
					);
					state.status = "failed";
					state.error =
						"Login response missing user data or token.";
					state.isAuthenticated = false;
					state.user = null;
					state.token = null;
					localStorage.removeItem("token");
					localStorage.removeItem("currentUser");
					authService.setAuthToken(null);
				}
				console.log(
					"AuthSlice: loginUser.fulfilled -- END"
				);
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload;
				state.isAuthenticated = false;
				state.user = null;
				state.token = null;
			})

			// --- Google Login ---
			.addCase(googleLoginHandler.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				googleLoginHandler.fulfilled,
				(state, action) => {
					state.status = "succeeded";
					state.user = action.payload.user;
					state.token = action.payload.token;
					state.isAuthenticated = true;
					// LocalStorage/Header setting handled within the thunk
				}
			)
			.addCase(
				googleLoginHandler.rejected,
				(state, action) => {
					state.status = "failed";
					state.error = action.payload;
					state.isAuthenticated = false;
					state.user = null;
					state.token = null;
				}
			)
			.addCase(verifyAuth.pending, (state) => {
				// If already idle, go to loading, otherwise might keep existing status
				if (state.status === "idle") {
					state.status = "loading";
				}
				state.error = null;
			})
			.addCase(verifyAuth.fulfilled, (state, action) => {
				// Verification successful, ensure state reflects logged-in status
				state.status = "succeeded";
				state.isAuthenticated = true;
				state.user = action.payload.user; // Update user data potentially refreshed from backend
				state.error = null;
			})
			.addCase(verifyAuth.rejected, (state, action) => {
				// Verification failed (invalid token, expired, network error etc.)
				state.status = "failed";
				state.error = action.payload; // Error message
				state.isAuthenticated = false;
				state.user = null;
				state.token = null;
				// localStorage/header cleared within the thunk's catch block
			})
			.addCase(registerBroker.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(registerBroker.fulfilled, (state, action) => {
				state.status = "succeeded";
				// Registration successful. User is NOT logged in yet.
				// Status is 'succeeded' but isAuthenticated remains false.
				// Component should likely show the success message and maybe redirect to login.
				console.log(
					"Broker registration succeeded:",
					action.payload?.message
				);
				// We might want to store the success message in state temporarily?
				// state.successMessage = action.payload?.message; // Example
			})
			.addCase(registerBroker.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload; // Error message from rejectWithValue
			})
			// Request OTP
			.addCase(requestPasswordReset.pending, (state) => {
				state.passwordResetStatus = "sending_otp";
				state.passwordResetError = null;
				state.error = null; // Clear general error
			})
			.addCase(
				requestPasswordReset.fulfilled,
				(state, action) => {
					state.passwordResetStatus = "otp_sent";
					// Success message is returned in action.payload, handle display in component
				}
			)
			.addCase(
				requestPasswordReset.rejected,
				(state, action) => {
					state.passwordResetStatus =
						"reset_failed"; // Use a general failed state
					state.passwordResetError =
						action.payload;
				}
			)

			// Reset with OTP
			.addCase(resetPasswordWithOtp.pending, (state) => {
				state.passwordResetStatus = "resetting";
				state.passwordResetError = null;
				state.error = null;
			})
			.addCase(
				resetPasswordWithOtp.fulfilled,
				(state, action) => {
					state.passwordResetStatus =
						"reset_success";
					// Password reset was successful. User needs to log in again.
					// State remains unauthenticated. Success message in action.payload.
				}
			)
			.addCase(
				resetPasswordWithOtp.rejected,
				(state, action) => {
					state.passwordResetStatus =
						"reset_failed";
					state.passwordResetError =
						action.payload;
				}
			)
			// Update User Profile
			.addCase(updateUserProfile.pending, (state) => {
				state.profileUpdateStatus = "loading";
				state.profileUpdateError = null;
			})
			.addCase(
				updateUserProfile.fulfilled,
				(state, action) => {
					state.profileUpdateStatus = "succeeded";
					// --- IMPORTANT: Update user state with data from backend ---
					if (
						action.payload &&
						action.payload.user
					) {
						state.user = {
							...state.user,
							...action.payload.user,
						}; // Merge updates
					}
					state.profileUpdateError = null;
					// localStorage updated in thunk
				}
			)
			.addCase(
				updateUserProfile.rejected,
				(state, action) => {
					state.profileUpdateStatus = "failed";
					state.profileUpdateError =
						action.payload;
				}
			)

			// Change User Password
			.addCase(changeUserPassword.pending, (state) => {
				state.passwordChangeStatus = "loading";
				state.passwordChangeError = null;
			})
			.addCase(
				changeUserPassword.fulfilled,
				(state, action) => {
					state.passwordChangeStatus =
						"succeeded";
					state.passwordChangeError = null;
					// Optionally store success message: state.passwordChangeSuccess = action.payload;
				}
			)
			.addCase(
				changeUserPassword.rejected,
				(state, action) => {
					state.passwordChangeStatus = "failed";
					state.passwordChangeError =
						action.payload;
				}
			)

			// Upload Proof Document
			.addCase(uploadProofDocument.pending, (state) => {
				state.documentUploadStatus = "loading";
				state.documentUploadError = null;
			})
			.addCase(
				uploadProofDocument.fulfilled,
				(state, action) => {
					state.documentUploadStatus =
						"succeeded";
					// --- IMPORTANT: Update user state with new proof info ---
					if (state.user && action.payload) {
						state.user.proof =
							action.payload.proof;
						state.user.proofType =
							action.payload.proofType;
						state.user.verified = "pending"; // Assume upload requires re-verification
					}
					state.documentUploadError = null;
					// localStorage updated in thunk
				}
			)
			.addCase(
				uploadProofDocument.rejected,
				(state, action) => {
					state.documentUploadStatus = "failed";
					state.documentUploadError =
						action.payload;
				}
			)
			// --- NEW: Handle logoutUser Thunk ---
			.addCase(logoutUser.pending, (state) => {
				// Optional: Set a specific logout status if needed
				state.status = "loading"; // Reuse general status or add logoutStatus
			})
			.addCase(logoutUser.fulfilled, (state) => {
				// Clear the state regardless of backend success (handled in finally block now)
				console.log(
					"AuthSlice: logoutUser.fulfilled - Clearing state."
				);
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
				state.status = "idle";
				state.error = null;
				// Reset other statuses
				state.profileUpdateStatus = "idle";
				state.profileUpdateError = null;
				state.passwordChangeStatus = "idle";
				state.passwordChangeError = null;
				state.documentUploadStatus = "idle";
				state.documentUploadError = null;
				state.passwordResetStatus = "idle";
				state.passwordResetError = null;
			})
			.addCase(logoutUser.rejected, (state, action) => {
				// Still clear the state even if backend call failed
				console.warn(
					"AuthSlice: logoutUser.rejected - Clearing state despite error:",
					action.payload
				);
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
				state.status = "idle"; // Set to idle, maybe set general error?
				state.error =
					action.payload || "Logout failed."; // Store potential error message
				// Reset other statuses
				state.profileUpdateStatus = "idle";
				state.profileUpdateError = null;
				state.passwordChangeStatus = "idle";
				state.passwordChangeError = null;
				state.documentUploadStatus = "idle";
				state.documentUploadError = null;
				state.passwordResetStatus = "idle";
				state.passwordResetError = null;
			});
	},
});

// --- Exports ---
export const {
	clearError,
	clearPasswordResetStatus,
	clearProfileStatus,
} = authSlice.actions;

export default authSlice.reducer;