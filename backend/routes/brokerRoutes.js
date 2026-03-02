// backend/routes/brokerRoutes.js

const express = require("express");
const router = express.Router();
const brokerController = require("../controllers/brokerController");
const { 
  authenticateUser, 
  authorizeBroker 
} = require("../middleware/authmiddleware");

// Apply authentication and broker authorization to all routes
// Make sure both middleware functions exist before using them
// router.use(authenticateUser);
// router.use(authorizeBroker);

// Dashboard stats
router.get("/stats", brokerController.getDashboardStats);

// Client management
router.get("/clients", brokerController.getClients);
router.post("/clients/add", brokerController.addClient);
router.post("/clients/remove", brokerController.removeClient);

// Transaction management
router.get("/transactions/pending", brokerController.getPendingTransactions);
router.post("/transactions/process", brokerController.processTransaction);

module.exports = router;