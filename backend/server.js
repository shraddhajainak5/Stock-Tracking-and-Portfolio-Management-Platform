const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const marketRoutes = require("./routes/marketRoutes");
const brokerRoutes = require("./routes/brokerRoutes");
const mailRoutes = require('./routes/mailRoutes');
const adminRoutes = require("./routes/adminRoutes");
const { connectRedis, getRedisClient } = require('./config/redisClient'); 

const chatbotRoutes = require("./routes/chatbotRoutes");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const stockRoutes = require("./routes/stockRoutes");
const paymentRoutes = require('./routes/paymentRoutes');	
//const swaggerDocument = YAML.load("./swagger/swagger.yaml");

// Load environment variables
dotenv.config();
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();
connectRedis();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make the uploads folder accessible
app.use("/images", express.static("uploads/images"));

// Swagger documentation route
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/summary", chatbotRoutes);
app.use("/market", marketRoutes);
app.use("/stocks", stockRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/broker", brokerRoutes);
app.use('/mail', mailRoutes);
app.use("/admin", adminRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("Hello from the server...!");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
        `Swagger documentation available at http://localhost:${PORT}/api-docs`
    );
});

module.exports = app;