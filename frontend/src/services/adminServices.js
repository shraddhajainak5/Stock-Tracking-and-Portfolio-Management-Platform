// Create file: frontend/src/services/adminService.js
// Or add to existing admin service file

import axios from "axios";
import { API_URL } from "../config/constants"; // Use your constant

// Centralized error handler (copy or import from authService if suitable)
const handleApiError = (error, context = "Admin Service") => {
	console.error(
		`${context} Error:`,
		error.response || error.message || error
	);
	if (error.response) {
		const serverError =
			error.response.data?.error ||
			error.response.data?.message ||
			error.response.statusText ||
			"Server error";
		return new Error(serverError);
	} else if (error.request) {
		return new Error("Network error. Could not reach server.");
	} else {
		return new Error(
			error.message || "An unexpected error occurred."
		);
	}
};

// --- NEW: Fetch Active Users ---
const getActiveUsers = async () => {
	console.log("AdminService: Calling GET /admin/active-users");
	const token = localStorage.getItem("token"); // Assumes token is needed and stored
	if (!token) {
		throw new Error("Authentication token not found.");
	}
	try {
		const response = await axios.get(
			`${API_URL}/admin/active-users`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		console.log(
			"AdminService: Active Users Response:",
			response.data
		);
		// Expects backend to return { activeUsers: [...] }
		return response.data.activeUsers || []; // Return the array or empty array
	} catch (error) {
		throw handleApiError(error, "Get Active Users");
	}
};

// --- NEW: Fetch All Users ---
const getAllUsers = async (params = {}) => {
	// params = { page, limit, search, filter, sortBy, sortOrder }
	console.log(
		"AdminService: Calling GET /admin/users with params:",
		params
	);
	const token = localStorage.getItem("token");
	if (!token) throw new Error("Authentication token not found.");

	try {
		const response = await axios.get(`${API_URL}/admin/users`, {
			headers: { Authorization: `Bearer ${token}` },
			params: params, // Pass query parameters
		});
		console.log("AdminService: All Users Response:", response.data);
		// Expects backend to return { users: [...], totalUsers: #, currentPage: #, totalPages: # }
		return response.data;
	} catch (error) {
		throw handleApiError(error, "Get All Users");
	}
};

const adminService = {
	getActiveUsers,
    getAllUsers, 
};

export default adminService;
