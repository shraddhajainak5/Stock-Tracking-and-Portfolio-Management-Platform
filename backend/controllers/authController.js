const User = require("../models/userModel");
const {
	comparePassword,
	hashPassword,
} = require("../middleware/authmiddleware");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const { generateOtp } = require("../utils/otpUtils"); // Import OTP generator
const { sendOtpEmail } = require("../controllers/mailController"); // Import OTP email sender
const { getRedisClient, isRedisReady } = require("../config/redisClient"); // Import Redis client getter
const { validatePassword } = require("../middleware/validateUser"); 
const JWT_EXPIRATION_SECONDS = 3600; // 1 hour

// User login
const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate input
		if (!email) {
			return res.status(400).json({
				error: "Email is required.",
			});
		}

		// Validate input
		if (!password) {
			return res.status(400).json({
				error: "Password is required.",
			});
		}

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(401)
				.json({ error: "User does not exist!" });
		}

		// Verify password
		const isPasswordValid = await comparePassword(
			password,
			user.password
		);
		if (!isPasswordValid) {
			return res
				.status(401)
				.json({ error: "Invalid credentials." });
		}

		// Generate JWT token
		const token = jwt.sign(
			{ id: user._id, email: user.email, type: user.type },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// --- Store active status in Redis ---
		try {
			const redisClient = getRedisClient();
			if (redisClient && isRedisReady()) {
				const redisKey = `active_user:${user._id}`;
				// Store a simple value like '1' or 'active' with the same expiration as the JWT
				await redisClient.set(redisKey, "active", {
					EX: JWT_EXPIRATION_SECONDS,
				});
				console.log(
					`✅ Stored active status for user ${user._id} in Redis. Key: ${redisKey}`
				);
			} else {
				console.warn(
					`⚠️ Redis client not ready during login for user ${user._id}. Active status not stored.`
				);
			}
		} catch (redisError) {
			console.error(
				`❌ Redis SET error during login for user ${user._id}:`,
				redisError
			);
			// Continue with login even if Redis fails, but log the error
		}

		// Return user info and token
		return res.status(200).json({
			message: "Login successful.",
			user: {
				// Essential fields for auth/routing
				id: user._id, // Use 'id' or '_id' consistently (frontend expects 'id' based on logs)
				_id: user._id, // Include _id as well if needed
				fullName: user.fullName,
				email: user.email,
				type: user.type,
				// Additional fields needed for profile page display/edit form initialization
				imagePath: user.imagePath,
				address: user.address,
				phone: user.phone,
				dateOfBirth: user.dateOfBirth,
				proof: user.proof,
				proofType: user.proofType,
				verified: user.verified, // Include verification status
				createdAt: user.createdAt, // May be useful
				updatedAt: user.updatedAt, // May be useful
				// Include broker-specific fields if relevant for broker login
				company: user.company,
				licenseNumber: user.licenseNumber,
				licenseExpiry: user.licenseExpiry,
				specialization: user.specialization,
				yearsOfExperience: user.yearsOfExperience,
				brokerStatus: user.brokerStatus,
				commission: user.commission,
				// Exclude sensitive fields like password hash
			},
			token,
		});
	} catch (error) {
		console.error("Error logging in:", error);
		return res.status(500).json({
			error: "Server error. Failed to login.",
		});
	}
};

// Create a new user
const registerUser = async (req, res) => {
	try {
		const { fullName, email, password, type } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				error: "User with this email already exists.",
			});
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create new user
		const user = new User({
			fullName,
			email,
			password: hashedPassword,
			type,
		});

		await user.save();

		return res
			.status(201)
			.json({ message: "User created successfully." });
	} catch (error) {
		console.error("Error creating user:", error);
		return res.status(500).json({
			error: "Server error. Failed to create user.",
		});
	}
};

const registerBroker = async (req, res) => {
	try {
		console.log("Broker registration request received:", req.body);
		const { fullName, email, password, phone, company } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				error: "User with this email already exists.",
			});
		}
		console.log(company);

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create a more complete broker user object
		const brokerUser = {
			fullName,
			email,
			password: hashedPassword,
			phone,
			company,
			type: "broker",
			verified: "pending",
			// Add default values for potentially required broker fields
			licenseNumber: "PENDING-" + Date.now(),
			licenseExpiry: new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			), // 30 days from now
			specialization: "general",
			yearsOfExperience: 0,
			commission: 0.0,
		};

		console.log("Creating broker with data:", brokerUser);

		// Create new broker user
		const user = new User(brokerUser);

		// Save with error handling
		const savedUser = await user.save();
		console.log("Broker saved successfully:", savedUser._id);

		return res.status(201).json({
			message: "Broker registered successfully. Your account is pending approval.",
		});
	} catch (error) {
		console.error("Error creating broker:", error);
		// Return the specific validation error if available
		if (error.name === "ValidationError") {
			const errorMessages = Object.values(error.errors).map(
				(err) => err.message
			);
			return res.status(400).json({
				error: `Validation error: ${errorMessages.join(
					", "
				)}`,
			});
		}
		return res.status(500).json({
			error: "Broker registration failed. Please try again.",
		});
	}
};

// Initialize the Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google login handler
const googleLogin = async (req, res) => {
	try {
		const { idToken } = req.body;

		// Use the access token to get user info from Google
		const googleUserInfo = await axios.get(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: {
					Authorization: `Bearer ${idToken}`,
				},
			}
		);

		// Extract user data from Google's response
		const {
			sub: googleId,
			email,
			name: fullName,
			picture: profilePicture,
		} = googleUserInfo.data;

		// Check if user exists
		let user = await User.findOne({ email });

		if (!user) {
			// Create a new user if not exists
			const randomPassword = Math.random()
				.toString(36)
				.slice(-8);
			const hashedPassword = await hashPassword(
				randomPassword
			);

			user = new User({
				fullName,
				email,
				password: hashedPassword,
				googleId,
				authProvider: "google",
				type: "user",
				imagePath: profilePicture || null,
			});

			await user.save();
		} else if (!user.googleId) {
			// If user exists but doesn't have googleId, update it
			user.googleId = googleId;
			user.authProvider = "google";

			// Update profile picture if not set
			if (!user.imagePath && profilePicture) {
				user.imagePath = profilePicture;
			}

			await user.save();
		}

		// Generate JWT token
		const token = jwt.sign(
			{ id: user._id, email: user.email, type: user.type },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// --- Store active status in Redis ---
		try {
			const redisClient = getRedisClient();
			if (redisClient && isRedisReady()) {
				const redisKey = `active_user:${user._id}`;
				await redisClient.set(redisKey, "active", {
					EX: JWT_EXPIRATION_SECONDS,
				});
				console.log(
					`✅ Stored active status for user ${user._id} via Google Login in Redis. Key: ${redisKey}`
				);
			} else {
				console.warn(
					`⚠️ Redis client not ready during Google login for user ${user._id}. Active status not stored.`
				);
			}
		} catch (redisError) {
			console.error(
				`❌ Redis SET error during Google login for user ${user._id}:`,
				redisError
			);
		}

		// Return user info and token
		return res.status(200).json({
			message: "Google login successful.",
			user: {
				// Essential fields
				id: user._id,
				fullName: user.fullName,
				email: user.email,
				type: user.type,
				// Additional fields
				imagePath: user.imagePath,
				address: user.address,
				phone: user.phone,
				dateOfBirth: user.dateOfBirth,
				proof: user.proof,
				proofType: user.proofType,
				verified: user.verified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				company: user.company,
				licenseNumber: user.licenseNumber,
				licenseExpiry: user.licenseExpiry,
				specialization: user.specialization,
				yearsOfExperience: user.yearsOfExperience,
				brokerStatus: user.brokerStatus,
				commission: user.commission,
				// Exclude sensitive fields
			},
			token,
		});
	} catch (error) {
		console.error("Error with Google login:", error);
		return res.status(500).json({
			error: "Server error. Failed to authenticate with Google.",
		});
	}
};

const resetPassword = async (req, res) => {
	const { currentPassword, newPassword, confirmPassword } = req.body;

	try {
		const user = await User.findById(req.params.id);

		if (!user)
			return res
				.status(404)
				.json({ message: "User not found" });

		console.log(req.body);
		if (!currentPassword || !user.password) {
			return res
				.status(400)
				.json({ message: "Missing password data" });
		}

		const isMatch = await bcrypt.compare(
			currentPassword,
			user.password
		);
		if (!isMatch) {
			return res.status(401).json({
				message: "Incorrect current password",
			});
		}

		if (newPassword !== confirmPassword) {
			return res.status(400).json({
				message: "New passwords do not match",
			});
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();

		res.status(200).json({
			message: "Password changed successfully",
		});
	} catch (err) {
		console.error("Password change error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// --- Request Password Reset OTP ---
const requestPasswordResetOtp = async (req, res) => {
	const { email } = req.body;
	const otpExpireTimeSeconds = 600; // 10 minutes - Consider making this an env variable

	if (!email) {
		return res
			.status(400)
			.json({ error: "Email address is required." });
	}

	try {
		// 1. Find user by email
		const user = await User.findOne({ email });

		// 2. SECURITY: Always send a generic success response, even if user not found
		// This prevents attackers from discovering registered emails.
		if (!user) {
			console.log(
				`Password reset request for non-existent email: ${email}`
			);
			return res.status(200).json({
				message: "If an account with that email exists, a password reset OTP has been sent.",
			});
		}

		// 3. Check if Redis is ready
		if (!isRedisReady()) {
			console.error(
				"Redis client not ready during password reset request."
			);
			// Send generic success, but log the internal error
			return res.status(200).json({
				message: "Password reset request received. Please check your email.",
			});
			// Or optionally return 503: return res.status(503).json({ error: "OTP service temporarily unavailable." });
		}
		const redisClient = getRedisClient();

		// 4. Generate OTP
		const otp = generateOtp(6); // Generate a 6-digit OTP
		const redisKey = `otp:${email}`;

		// 5. Store OTP in Redis with expiration
		await redisClient.set(redisKey, otp, {
			EX: otpExpireTimeSeconds, // Set expiration in seconds
			NX: false, // Allow overwriting if an OTP request was just made
		});
		console.log(
			`Stored OTP for ${email} in Redis. Key: ${redisKey}`
		);

		// 6. Send OTP email (don't await if you want faster response to user, but handle potential errors)
		sendOtpEmail(email, otp)
			.then((result) => {
				if (!result.success) {
					console.error(
						`Failed to send OTP email to ${email}: ${result.error}`
					);
					// Log this error, but don't expose failure details to the frontend here
				}
			})
			.catch((err) => {
				console.error(
					`Unhandled error sending OTP email to ${email}: ${err.message}`
				);
			});

		// 7. Send generic success response
		console.log(
			`Sent password reset OTP request success response for ${email}`
		);
		return res.status(200).json({
			message: "If an account with that email exists, a password reset OTP has been sent.",
		});
	} catch (error) {
		console.error("Error in requestPasswordResetOtp:", error);
		// Send generic success response even on internal errors during the process
		return res.status(200).json({
			message: "Password reset request received. Please check your email.",
		});
		// Or for debugging: return res.status(500).json({ error: "Server error during password reset request." });
	}
};

// --- Reset Password using OTP ---
const resetPasswordWithOtp = async (req, res) => {
	const { email, otp, password, confirmPassword } = req.body;

	// 1. Basic Validation
	if (!email || !otp || !password || !confirmPassword) {
		return res.status(400).json({
			error: "Email, OTP, new password, and confirmation are required.",
		});
	}

	if (password !== confirmPassword) {
		return res
			.status(400)
			.json({ error: "New passwords do not match." });
	}

	// 2. Password Strength Validation (Reuse existing logic if available)
	// Example: Assuming validatePassword checks strength and returns true/false
	const isPasswordStrong = validatePassword(password); // Use your actual validation function
	if (!isPasswordStrong) {
		return res.status(400).json({
			error: "Password does not meet strength requirements (min 8 chars, upper, lower, number, symbol).",
		});
	}

	try {
		// 3. Check Redis Readiness
		if (!isRedisReady()) {
			console.error(
				"Redis client not ready during password reset attempt."
			);
			return res.status(503).json({
				error: "Verification service temporarily unavailable. Please try again later.",
			});
		}
		const redisClient = getRedisClient();
		const redisKey = `otp:${email}`;

		// 4. Retrieve OTP from Redis
		const storedOtp = await redisClient.get(redisKey);

		// 5. Verify OTP
		if (!storedOtp || storedOtp !== otp) {
			console.log(
				`Invalid or expired OTP attempt for email: ${email}. Provided: ${otp}, Stored: ${storedOtp}`
			);
			return res
				.status(400)
				.json({ error: "Invalid or expired OTP." });
		}

		// 6. OTP is valid, find user in MongoDB
		const user = await User.findOne({ email });
		if (!user) {
			// Should ideally not happen if OTP was valid, but check anyway
			console.error(
				`User not found for email ${email} after OTP verification.`
			);
			return res
				.status(400)
				.json({ error: "Invalid request." }); // Generic error
		}

		// 7. Hash the new password
		const hashedPassword = await hashPassword(password);

		// 8. Update user's password in MongoDB
		user.password = hashedPassword;
		await user.save();

		// 9. Delete OTP from Redis (important!)
		await redisClient.del(redisKey);
		console.log(
			`Successfully reset password for ${email} and deleted OTP.`
		);

		// 10. Send success response
		return res.status(200).json({
			message: "Password has been reset successfully.",
		});
	} catch (error) {
		console.error("Error in resetPasswordWithOtp:", error);
		return res
			.status(500)
			.json({ error: "Server error during password reset." });
	}
};

// --- Add new logoutUser function ---
const logoutUser = async (req, res) => {
	// Get user ID from the authenticated request (set by authenticateUser middleware)
	const userId = req.user?.id;

	if (!userId) {
		// Should not happen if authenticateUser middleware is used
		console.warn(
			"⚠️ Logout attempt without authenticated user ID."
		);
		return res.status(400).json({ error: "User not identified." });
	}

	console.log(`Attempting logout for user ID: ${userId}`);
	try {
		const redisClient = getRedisClient();
		if (redisClient && isRedisReady()) {
			const redisKey = `active_user:${userId}`;
			const result = await redisClient.del(redisKey);
			if (result === 1) {
				console.log(
					`✅ Removed active status key from Redis for user ${userId}. Key: ${redisKey}`
				);
			} else {
				console.log(
					`ℹ️ No active status key found in Redis for user ${userId} to remove. Key: ${redisKey}`
				);
			}
		} else {
			console.warn(
				`⚠️ Redis client not ready during logout for user ${userId}. Key not removed.`
			);
		}

		// Regardless of Redis success/failure, send success response to frontend
		return res.status(200).json({ message: "Logout processed." });
	} catch (redisError) {
		console.error(
			`❌ Redis DEL error during logout for user ${userId}:`,
			redisError
		);
		// Still send success to frontend, but log the error
		return res
			.status(200)
			.json({
				message: "Logout processed, Redis cleanup may have failed.",
			});
	}
};

module.exports = {
	loginUser,
	registerUser,
	googleLogin,
	resetPassword,
	requestPasswordResetOtp, // Add new function
	resetPasswordWithOtp,
	registerBroker,
    logoutUser
};
