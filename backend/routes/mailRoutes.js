// mailRoutes.js

const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController');
const { authenticateUser, authorizeAdmin } = require('../middleware/authmiddleware');

// Only admins can send verification emails
router.post('/verification', authenticateUser, authorizeAdmin, mailController.sendVerificationEmail);

// This endpoint might be used during registration
router.post('/welcome', mailController.sendWelcomeEmail);

module.exports = router;