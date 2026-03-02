// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateUserCreate } = require("../middleware/validateUser");
const { authenticateUser } = require("../middleware/authmiddleware");

// Add validation middleware to register route
router.post("/register", validateUserCreate, authController.registerUser);
router.post("/login", authController.loginUser);
// Add Google authentication route
router.post("/google", authController.googleLogin);

router.patch("/change-password/:id", authController.resetPassword);
// Route to request a password reset OTP (sends email)
router.post("/forgot-password", authController.requestPasswordResetOtp);

// Route to reset password using the OTP received via email
router.post("/reset-password-otp", authController.resetPasswordWithOtp);
// In backend/routes/authRoutes.js - Add a new route for broker registration
// router.post("/broker-register", validateUserCreate, authController.registerBroker);
router.post("/broker-register", authController.registerBroker);

router.post("/logout", authenticateUser, authController.logoutUser);


module.exports = router;
