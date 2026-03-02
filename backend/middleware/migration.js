// migration.js - Place this file in your project's root directory (same level as server.js)

// Import required modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment variables
const MONGO_URI = process.env.MONGO_URI;

// Hardcoded URI as fallback (only if needed)
// const MONGO_URI = "mongodb+srv://FinalProjUsers:xKZyaaW8k4JhvCSC@cluster0.v3zguon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not defined!');
  console.error('Make sure you have a .env file with MONGO_URI defined');
  process.exit(1);
}

// Define User model directly in this file to prevent circular dependencies
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  imagePath: String,
  type: String,
  googleId: String,
  authProvider: String,
  address: String,
  phone: String,
  dateOfBirth: Date,
  proof: String,
  proofType: String,
  verified: {
    type: mongoose.Schema.Types.Mixed, // This allows us to handle both boolean and string values
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected');
  migrateVerificationStatus();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

const migrateVerificationStatus = async () => {
  try {
    console.log('Starting verification status migration...');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);
    
    let updated = 0;
    let skipped = 0;
    
    // Process each user
    for (const user of users) {
      // Check the current verified field type and value
      console.log(`Processing user ${user._id} (${user.email}): Current verified value: ${user.verified}, type: ${typeof user.verified}`);
      
      // Skip users that already have the correct string values
      if (typeof user.verified === 'string' && 
          ['pending', 'approved', 'rejected'].includes(user.verified)) {
        console.log(`  Skipping - already has valid string value: ${user.verified}`);
        skipped++;
        continue;
      }
      
      // Convert boolean/null to string status
      let newStatus;
      if (user.verified === true) {
        newStatus = 'approved';
      } else if (user.verified === false) {
        newStatus = 'rejected';
      } else {
        newStatus = 'pending';
      }
      
      // Update the user directly using updateOne to bypass validation
      await User.updateOne(
        { _id: user._id },
        { $set: { verified: newStatus } }
      );
      
      console.log(`  Updated to: ${newStatus}`);
      updated++;
    }
    
    console.log(`Migration complete: ${updated} users updated, ${skipped} users skipped`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};