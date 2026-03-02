const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Function to hash password
const hashPassword = async (password) => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
};

// Function to compare password
const comparePassword = async (plainPassword, hashedPassword) => {
	return await bcrypt.compare(plainPassword, hashedPassword);
};

// Add this to your existing backend/middleware/authmiddleware.js file

// Middleware to authorize broker users
const authorizeBroker = async (req, res, next) => {
	try {
	  // First make sure the user is authenticated
	  if (!req.user) {
		return res
		  .status(401)
		  .json({ error: "Authentication required." });
	  }
  
	  // Get the user ID from the token
	  const userId = req.user.id;
  
	  // Find the user in the database to get their type
	  const user = await User.findById(userId);
  
	  if (!user) {
		return res
		  .status(404)
		  .json({ error: "User not found." });
	  }
  
	  // Check if the user is a broker
	  if (user.type !== "broker") {
		return res.status(403).json({
		  error: "Access denied. Broker privileges required.",
		});
	  }
  
	  // User is authenticated and authorized as broker
	  next();
	} catch (error) {
	  console.error("Error authorizing broker:", error);
	  return res
		.status(500)
		.json({ error: "Server error during authorization." });
	}
  };
  
  // Add this to the module.exports
  module.exports = {
	// ... existing exports
	authorizeBroker,
  };

// Add authentication middleware to verify JWT token
const authenticateUser = (req, res, next) => {
	try {
		// Get token from Authorization header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				error: "Access denied. No token provided.",
			});
		}

		const token = authHeader.split(" ")[1];

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Add user data to request
		req.user = decoded;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				error: "Token expired. Please login again.",
			});
		}

		return res.status(401).json({ error: "Invalid token." });
	}
};

// In backend/middleware/authmiddleware.js (update the authorizeAdmin function)

// Middleware to authorize admin users
const authorizeAdmin = async (req, res, next) => {
	try {
	  // First make sure the user is authenticated
	  if (!req.user) {
		return res
		  .status(401)
		  .json({ error: "Authentication required." });
	  }
  
	  // Get the user ID from the token
	  const userId = req.user.id;
  
	  // Find the user in the database to get their type
	  const user = await User.findById(userId);
  
	  if (!user) {
		return res
		  .status(404)
		  .json({ error: "User not found." });
	  }
  
	  // Check if the user is an admin
	  if (user.type !== "admin") {
		return res.status(403).json({
		  error: "Access denied. Admin privileges required.",
		});
	  }
  
	  // User is authenticated and authorized as admin
	  next();
	} catch (error) {
	  console.error("Error authorizing admin:", error);
	  return res
		.status(500)
		.json({ error: "Server error during authorization." });
	}
  };

// Middleware to authorize employee users
const authorizeEmployee = async (req, res, next) => {
	try {
		// First make sure the user is authenticated
		if (!req.user) {
			return res
				.status(401)
				.json({ error: "Authentication required." });
		}

		// Get the user ID from the token
		const userId = req.user.id;

		// Find the user in the database to get their type
		const user = await User.findById(userId);

		if (!user) {
			return res
				.status(404)
				.json({ error: "User not found." });
		}

		// Check if the user is an employee
		if (user.type !== "employee") {
			return res.status(403).json({
				error: "Access denied. Employee privileges required.",
			});
		}

		// User is authenticated and authorized as employee
		next();
	} catch (error) {
		console.error("Error authorizing employee:", error);
		return res
			.status(500)
			.json({ error: "Server error during authorization." });
	}
};

module.exports = {
	hashPassword,
	comparePassword,
	authenticateUser,
	authorizeAdmin,
	authorizeEmployee,
};
