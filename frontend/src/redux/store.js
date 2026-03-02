// frontend/src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";

// Import slice reducers here as you create them
import authReducer from './features/authSlice';
import adminReducer from './features/adminSlice';

export const store = configureStore({
	reducer: {
		// Add your slice reducers here:
		auth: authReducer,
		admin: adminReducer, // or adminUsers, adminStocks etc.
	},
	// Redux Toolkit includes redux-thunk middleware by default, which is good for async actions.
	// DevTools Extension integration is also enabled by default in development mode.
});
