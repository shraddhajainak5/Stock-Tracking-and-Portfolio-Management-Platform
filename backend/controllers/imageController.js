const User = require("../models/userModel");

// Upload user image
const uploadImage = async (req, res) => {
	try {
		// Email is sent as a form field
		const { email } = req.body;

		if (!email) {
			return res
				.status(400)
				.json({ error: "Email is required." });
		}

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(404)
				.json({ error: "User not found." });
		}

		// Check if user already has an image
		if (user.imagePath) {
			return res.status(400).json({
				error: "Image already exists for this user.",
			});
		}

		// Make sure file was uploaded
		if (!req.file) {
			return res
				.status(400)
				.json({ error: "No image file provided." });
		}

		// Update user with image path
		const filePath = `/images/${req.file.filename}`;
		user.imagePath = filePath;

		await user.save();

		return res.status(201).json({
			message: "Image uploaded successfully.",
			filePath,
		});
	} catch (error) {
		console.error("Error uploading image:", error);
		return res.status(500).json({
			error: "Server error. Failed to upload image.",
		});
	}
};

module.exports = {
	uploadImage,
};
