// backend/config/redisClient.js
const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Redis Cloud Connection Configuration from environment variables
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;
const redisUsername = process.env.REDIS_USERNAME || "default";

let redisClient = null; // Initialize client as null

const connectRedis = async () => {
	// Prevent multiple connection attempts if already connected or connecting
	if (redisClient && (redisClient.isReady || redisClient.isOpen)) {
		console.log("Redis client already connected or connecting.");
		return redisClient;
	}

	// Check if necessary environment variables are set
	if (!redisHost || !redisPort || !redisPassword) {
		console.error(
			"Redis connection details missing in environment variables (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD). Cannot connect."
		);
		return null; // Return null if config is missing
	}

	console.log(
		`Attempting to connect to Redis Cloud at ${redisHost}:${redisPort}...`
	);

	try {
		// Create client instance
		const client = redis.createClient({
			username: redisUsername,
			password: redisPassword,
			socket: {
				host: redisHost,
				port: parseInt(redisPort, 10),
				// tls: true, // Add if required by your Redis Cloud instance
			},
		});

		// --- Event Listeners ---
		client.on("error", (err) =>
			console.error("Redis Client Error:", err)
		);
		client.on("connect", () =>
			console.log("Connecting to Redis Cloud...")
		); // 'connect' is emitted before 'ready'
		client.on("ready", () =>
			console.log("✅ Redis client is ready!")
		); // Use 'ready' to confirm connection is usable
		client.on("reconnecting", () =>
			console.log("Reconnecting to Redis Cloud...")
		);
		client.on("end", () => {
			console.log("Redis Cloud connection closed.");
			redisClient = null; // Reset client variable on disconnection
		});
		// --- End Event Listeners ---

		// Connect the client
		await client.connect();

		// Store the connected client instance globally in this module
		redisClient = client;

		return redisClient; // Return the connected client
	} catch (err) {
		console.error("❌ Failed to connect to Redis:", err);
		redisClient = null; // Ensure client is null on failure
		return null; // Return null on connection failure
	}
};

// Export functions to connect and get the client instance
module.exports = {
	connectRedis, // Function to initiate connection
	getRedisClient: () => redisClient, // Function to get the currently stored client instance
	isRedisReady: () => redisClient && redisClient.isReady, // Check if the stored client is ready
};
