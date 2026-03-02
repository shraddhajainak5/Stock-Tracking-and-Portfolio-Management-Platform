const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    imagePath: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      required: [true, "User type is required"],
      default: "user",
      enum: ["admin", "user", "broker"], // Including broker type
      trim: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    address: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    proof: {  
      type: String,
      default: null,
    },
    proofType: {
      type: String,
      default: null,
      enum: ["driving license", "passport", null],
    },
    verified: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    // Broker-specific fields
    company: {
      type: String,
      default: null,
      required: false // Changed from true
    },
    // In userModel.js, update these fields:
    licenseNumber: {
      type: String,
      default: null,
      required: false // Changed from true
    },
    licenseExpiry: {
      type: Date,
      default: null,
      required: false // Changed from true
    },
    specialization: {
      type: String,
      default: null,
      enum: ["stocks", "bonds", "mutual funds", "forex", "commodities", "options", "general", null],
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    brokerStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "suspended", "inactive"],
    },
    clients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    commission: {
      type: Number,
      default: 0.00,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;