const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const imageController = require("../controllers/imageController");
const { validateUserUpdate } = require("../middleware/validateUser");
const {
	authenticateUser,
	authorizeAdmin,
} = require("../middleware/authmiddleware");
const upload = require("../middleware/fileUpload");

// Make sure validateUserUpdate is properly imported and defined
console.log("validateUserUpdate:", validateUserUpdate); // Debug line

// Update user - authenticated users can update themselves
router.put(
	"/edit",
	authenticateUser,
	validateUserUpdate, // This is likely the undefined value
	userController.updateUser
);

// Delete user - admin only
router.delete(
	"/delete",
	authenticateUser,
	authorizeAdmin,
	userController.deleteUser
);

// Get all users - admin only
router.get(
	"/getAll",
	authenticateUser,
	authorizeAdmin,
	userController.getAllUsers
);

router.get("/:id", userController.getUserDetails);
router.patch("/update-profile", userController.updateUserDetails)

// Upload image - any authenticated user
router.post(
	"/uploadImage",
	authenticateUser,
	(req, res, next) => {
		upload.single("image")(req, res, (err) => {
			if (err) {
				return res
					.status(400)
					.json({ error: err.message });
			}
			next();
		});
	},
	imageController.uploadImage
);
router.post(
	"/uploadProof",
	authenticateUser,
	(req, res, next) => {
	  upload.single("proof")(req, res, (err) => {
		if (err) {
		  return res.status(400).json({ error: err.message });
		}
		next();
	  });
	},
	userController.uploadProofDocument
  );

module.exports = router;