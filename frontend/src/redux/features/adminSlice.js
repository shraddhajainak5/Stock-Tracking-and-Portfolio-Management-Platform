// frontend/src/redux/features/adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "../../services/adminServices"; // Adjust path

const initialState = {
	// State for the main user list
	users: [],
	pagination: {
		currentPage: 1,
		totalPages: 1,
		totalUsers: 0,
		limit: 10, // Store limit if needed
	},
	usersStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
	usersError: null,

	// State for Active Users list
	activeUsers: [],
	activeUsersStatus: "idle",
	activeUsersError: null,
};

// --- Async Thunks ---

// Thunk to fetch the list of ALL users (keep existing if you have one)
// export const fetchAllUsers = createAsyncThunk(...)

// --- NEW: Thunk to Fetch Active Users ---
export const fetchActiveUsers = createAsyncThunk(
	"admin/fetchActiveUsers",
	async (_, { rejectWithValue }) => {
		console.log("AdminSlice: Dispatching fetchActiveUsers thunk");
		try {
			const data = await adminService.getActiveUsers(); // Call the service
			return data; // Expects an array of user objects
		} catch (error) {
			return rejectWithValue(
				error.message || "Failed to fetch active users"
			);
		}
	}
);

// --- NEW: Fetch All Users Thunk ---
export const fetchAllUsers = createAsyncThunk(
	"admin/fetchAllUsers",
	async (params = {}, { rejectWithValue }) => {
		// params = { page, limit, search, filter, sortBy, sortOrder }
		console.log(
			"AdminSlice: Dispatching fetchAllUsers thunk with params:",
			params
		);
		try {
			const data = await adminService.getAllUsers(params);
			// Return the full response including pagination data
			return data; // Expects { users, totalUsers, currentPage, totalPages }
		} catch (error) {
			return rejectWithValue(
				error.message || "Failed to fetch users"
			);
		}
	}
);

// --- Slice Definition ---
const adminSlice = createSlice({
	name: "admin",
	initialState,
	reducers: {
		// Reducer to clear active users error
		clearActiveUsersError: (state) => {
			state.activeUsersError = null;
			state.activeUsersStatus = "idle"; // Reset status too if desired
		},
		clearUsersError: (state) => {
			state.usersError = null;
			state.usersStatus = "idle"; // Optionally reset status
		},
		// Add other reducers for managing users, stats etc.
	},
	extraReducers: (builder) => {
		builder
			// --- NEW: Handle fetchActiveUsers Thunk ---
			.addCase(fetchActiveUsers.pending, (state) => {
				state.activeUsersStatus = "loading";
				state.activeUsersError = null;
			})
			.addCase(
				fetchActiveUsers.fulfilled,
				(state, action) => {
					state.activeUsersStatus = "succeeded";
					state.activeUsers = action.payload; // Store the array of active users
				}
			)
			.addCase(fetchActiveUsers.rejected, (state, action) => {
				state.activeUsersStatus = "failed";
				state.activeUsersError = action.payload;
				state.activeUsers = []; // Clear data on error
			})
			// --- NEW: Handle fetchAllUsers Thunk ---
			.addCase(fetchAllUsers.pending, (state) => {
				state.usersStatus = "loading";
				state.usersError = null; // Clear previous errors
			})
			.addCase(fetchAllUsers.fulfilled, (state, action) => {
				state.usersStatus = "succeeded";
				state.users = action.payload.users; // Update user list
				// Update pagination info
				state.pagination.totalUsers =
					action.payload.totalUsers;
				state.pagination.currentPage =
					action.payload.currentPage;
				state.pagination.totalPages =
					action.payload.totalPages;
				// state.pagination.limit = action.meta.arg.limit || 10; // Store limit if needed
			})
			.addCase(fetchAllUsers.rejected, (state, action) => {
				state.usersStatus = "failed";
				state.usersError = action.payload;
				state.users = []; // Clear data on error
				state.pagination = {
					currentPage: 1,
					totalPages: 1,
					totalUsers: 0,
					limit: 10,
				}; // Reset pagination
			});

		// Add cases for fetchAllUsers etc. here later
	},
});

// --- Exports ---
export const { clearActiveUsersError, clearUsersError } = adminSlice.actions;
export default adminSlice.reducer;
