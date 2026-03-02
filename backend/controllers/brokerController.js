// backend/controllers/brokerController.js

const User = require("../models/userModel");
const Transaction = require("../models/transactionModel"); // We'll need to create this

// Get broker dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total clients count
    const totalClients = await User.countDocuments({ 
      broker: req.user.id, 
      type: "user" 
    });
    
    // Get pending transactions count
    const pendingTransactions = await Transaction.countDocuments({ 
      status: "pending", 
      brokerId: req.user.id 
    });
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ 
      brokerId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'fullName email');
    
    // Get transactions for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyTransactions = await Transaction.aggregate([
      {
        $match: {
          brokerId: mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          volume: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format the weekly transactions for the frontend
    const formattedWeeklyTransactions = weeklyTransactions.map(item => ({
      day: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      count: item.count,
      volume: item.volume
    }));
    
    return res.status(200).json({
      totalClients,
      pendingTransactions,
      recentTransactions,
      weeklyTransactions: formattedWeeklyTransactions
    });
  } catch (error) {
    console.error("Error getting broker dashboard stats:", error);
    return res.status(500).json({
      error: "Server error. Failed to get broker dashboard statistics."
    });
  }
};

// Get all clients for this broker
const getClients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      sortBy = "createdAt", 
      sortOrder = "desc" 
    } = req.query;
    
    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter query
    let filterQuery = {
      broker: req.user.id,
      type: "user"
    };
    
    // Apply search if provided
    if (search) {
      filterQuery.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    // Build sort object
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    // Get clients with pagination
    const clients = await User.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .select("fullName email phone status createdAt lastLogin");
    
    // Get total count for pagination
    const totalClients = await User.countDocuments(filterQuery);
    
    return res.status(200).json({
      clients,
      totalClients,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalClients / parseInt(limit))
    });
  } catch (error) {
    console.error("Error getting clients:", error);
    return res.status(500).json({
      error: "Server error. Failed to get clients."
    });
  }
};

// Get pending transactions
const getPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get pending transactions with pagination
    const pendingTransactions = await Transaction.find({ 
      brokerId: req.user.id,
      status: "pending"
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'fullName email');
    
    // Get total count for pagination
    const totalPendingTransactions = await Transaction.countDocuments({ 
      brokerId: req.user.id,
      status: "pending"
    });
    
    return res.status(200).json({
      pendingTransactions,
      totalPendingTransactions,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPendingTransactions / parseInt(limit))
    });
  } catch (error) {
    console.error("Error getting pending transactions:", error);
    return res.status(500).json({
      error: "Server error. Failed to get pending transactions."
    });
  }
};

// Approve or reject a transaction
const processTransaction = async (req, res) => {
  try {
    const { transactionId, action, note } = req.body;
    
    if (!transactionId || !action) {
      return res.status(400).json({
        error: "Transaction ID and action are required."
      });
    }
    
    if (action !== "approve" && action !== "reject") {
      return res.status(400).json({
        error: "Invalid action. Must be 'approve' or 'reject'."
      });
    }
    
    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        error: "Transaction not found."
      });
    }
    
    // Verify that this broker is assigned to this transaction
    if (transaction.brokerId.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Unauthorized: This transaction is not assigned to you."
      });
    }
    
    // Update transaction status based on action
    transaction.status = action === "approve" ? "completed" : "rejected";
    
    // Add note if provided
    if (note) {
      transaction.note = note;
    }
    
    // Add processing details
    transaction.processedBy = req.user.id;
    transaction.processedAt = new Date();
    
    await transaction.save();
    
    return res.status(200).json({
      message: `Transaction has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        symbol: transaction.symbol,
        amount: transaction.amount,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return res.status(500).json({
      error: "Server error. Failed to process transaction."
    });
  }
};

// Add a client to broker's list
const addClient = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: "User ID is required."
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: "User not found."
      });
    }
    
    // Check if user is already assigned to a broker
    if (user.broker) {
      return res.status(400).json({
        error: "User is already assigned to a broker."
      });
    }
    
    // Update user with broker ID
    user.broker = req.user.id;
    await user.save();
    
    return res.status(200).json({
      message: "Client added successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error adding client:", error);
    return res.status(500).json({
      error: "Server error. Failed to add client."
    });
  }
};

// Remove a client from broker's list
const removeClient = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: "User ID is required."
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: "User not found."
      });
    }
    
    // Check if user is assigned to this broker
    if (!user.broker || user.broker.toString() !== req.user.id) {
      return res.status(400).json({
        error: "This user is not your client."
      });
    }
    
    // Remove broker assignment
    user.broker = null;
    await user.save();
    
    return res.status(200).json({
      message: "Client removed successfully."
    });
  } catch (error) {
    console.error("Error removing client:", error);
    return res.status(500).json({
      error: "Server error. Failed to remove client."
    });
  }
};

module.exports = {
  getDashboardStats,
  getClients,
  getPendingTransactions,
  processTransaction,
  addClient,
  removeClient
};