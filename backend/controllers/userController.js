const User = require("../models/userModel");
const { hashPassword } = require("../middleware/authmiddleware");

// Update user details
const updateUser = async (req, res) => {
	try {
		const { email, fullName, password } = req.body;

		// Email is required to find the user
		if (!email) {
			return res.status(400).json({
				error: "Email is required to identify the user.",
			});
		}

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(404)
				.json({ error: "User not found." });
		}

		// Update fields if provided
		if (fullName) {
			user.fullName = fullName;
		}

		// Update and hash password if provided
		if (password) {
			user.password = await hashPassword(password);
		}

		await user.save();

		return res
			.status(200)
			.json({ message: "User updated successfully." });
	} catch (error) {
		console.error("Error updating user:", error);
		return res.status(500).json({
			error: "Server error. Failed to update user.",
		});
	}
};

// Delete user
const deleteUser = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				error: "Email is required to identify the user.",
			});
		}

		// Find and delete the user
		const user = await User.findOneAndDelete({ email });

		if (!user) {
			return res
				.status(404)
				.json({ error: "User not found." });
		}

		return res
			.status(200)
			.json({ message: "User deleted successfully." });
	} catch (error) {
		console.error("Error deleting user:", error);
		return res.status(500).json({
			error: "Server error. Failed to delete user.",
		});
	}
};

// Get all users
const getAllUsers = async (req, res) => {
	try {
		// Update the select method to exclude the password field by using "-password"
		const users = await User.find({}).select(
			"fullName email type imagePath address phone dateOfBirth proof proofType verified createdAt updatedAt"
		);

		return res.status(200).json({ users });
	} catch (error) {
		console.error("Error retrieving users:", error);
		return res.status(500).json({
			error: "Server error. Failed to retrieve users.",
		});
	}
};

const getUserDetails = async (req, res) => {
	console.log("getUserDetails inside")
	try {
		const userId = req.params.id;
		const user = await User.findById(userId).select("-password"); // exclude password
	
		if (!user) {
		  return res.status(404).json({ message: "User not found" });
		}
	
		res.status(200).json(user);
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({ message: "Server error" });
	}
};


// backend/controllers/userController.js - Update the updateUserDetails function
const updateUserDetails = async(req, res) => {
	// Enhanced logging
	console.log("=====================================================");
	console.log("🔍 updateUserDetails called with req.body:", JSON.stringify(req.body, null, 2));
	console.log("=====================================================");
	
	const { fullName, email, phone, address, _id, verified } = req.body;
  
	try {
	  // Find the user
	  const user = await User.findById(_id);
	  if (!user) {
		console.log("❌ User not found with ID:", _id);
		return res.status(404).json({ message: "User not found" });
	  }
	  
	  console.log("✅ Found user:", user.fullName, "Current verification status:", user.verified);
  
	  // Update fields
	  let updates = [];
	  
	  if (fullName !== undefined && fullName !== user.fullName) {
		user.fullName = fullName;
		updates.push(`fullName: ${user.fullName}`);
	  }
	  
	  if (email !== undefined && email !== user.email) {
		// Check if email is already in use
		const existingUser = await User.findOne({ email });
		if (existingUser && existingUser._id.toString() !== user._id.toString()) {
		  console.log("❌ Email already in use:", email);
		  return res.status(400).json({ message: "Email already in use" });
		}
		user.email = email;
		updates.push(`email: ${user.email}`);
	  }
	  
	  if (phone !== undefined && phone !== user.phone) {
		user.phone = phone;
		updates.push(`phone: ${user.phone}`);
	  }
	  
	  if (address !== undefined && address !== user.address) {
		user.address = address;
		updates.push(`address: ${user.address}`);
	  }
	  
	  // Handle verification status update - now using string values
	  if (verified !== undefined && verified !== user.verified) {
		// Make sure verified is one of the allowed values
		if (["pending", "approved", "rejected"].includes(verified)) {
		  console.log(`🔄 Updating verification status from ${user.verified} to ${verified}`);
		  user.verified = verified;
		  updates.push(`verified: ${user.verified}`);
		} else {
		  console.log(`❌ Invalid verification status: ${verified}`);
		  return res.status(400).json({ 
			message: "Invalid verification status. Must be 'pending', 'approved', or 'rejected'." 
		  });
		}
	  }
	  
	  if (updates.length === 0) {
		console.log("⚠️ No changes detected");
	  } else {
		console.log(`🔄 Updates to be applied:`, updates.join(', '));
	  }
  
	  // Save user changes
	  const savedUser = await user.save();
	  console.log("✅ User saved successfully. New verification status:", savedUser.verified);
  
	  // Send response
	  res.status(200).json({
		message: "Profile updated successfully",
		user: {
		  _id: savedUser._id,
		  fullName: savedUser.fullName,
		  email: savedUser.email,
		  phone: savedUser.phone,
		  address: savedUser.address,
		  verified: savedUser.verified,
		  updatedAt: savedUser.updatedAt,
		},
	  });
	} catch (error) {
	  console.error("❌ Error updating profile:", error);
	  res.status(500).json({ message: "Internal server error" });
	}
  }

  const uploadProofDocument = async (req, res) => {
	try {
	  // Get user ID from the request
	  const { userId, proofType } = req.body;
  
	  if (!userId || !proofType) {
		return res.status(400).json({ 
		  error: "User ID and document type are required." 
		});
	  }
  
	  // Valid proof types
	  const validProofTypes = ["driving license", "passport"];
	  if (!validProofTypes.includes(proofType)) {
		return res.status(400).json({ 
		  error: "Invalid document type. Must be 'driving license' or 'passport'." 
		});
	  }
  
	  // Check if user exists
	  const user = await User.findById(userId);
	  if (!user) {
		return res.status(404).json({ error: "User not found." });
	  }
  
	  // Make sure file was uploaded
	  if (!req.file) {
		return res.status(400).json({ error: "No document file provided." });
	  }
  
	  // Update user with document path
	  const filePath = `/images/${req.file.filename}`;
	  user.proof = req.file.filename;
	  user.proofType = proofType;
  
	  await user.save();
  
	  return res.status(201).json({
		message: "Document uploaded successfully.",
		proof: user.proof,
		proofType: user.proofType
	  });
	} catch (error) {
	  console.error("Error uploading document:", error);
	  return res.status(500).json({
		error: "Server error. Failed to upload document."
	  });
	}
  };
  
module.exports = {
	updateUser,
	deleteUser,
	getAllUsers,
	getUserDetails,
	updateUserDetails,
	uploadProofDocument
};
