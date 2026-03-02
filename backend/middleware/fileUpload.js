const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up storage for uploaded files
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = "uploads/images";

		// Create directory if it doesn't exist
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		// Create unique filename with timestamp
		const uniqueSuffix = `${Date.now()}-${Math.round(
			Math.random() * 1e9
		)}`;
		const extension = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
	},
});

// Create file filter
const fileFilter = (req, file, cb) => {
	// Accept only specific file formats
	const allowedFileTypes = /jpeg|jpg|png|gif/;
	const mimeType = allowedFileTypes.test(file.mimetype);
	const extname = allowedFileTypes.test(
		path.extname(file.originalname).toLowerCase()
	);

	if (mimeType && extname) {
		return cb(null, true);
	}
	cb(
		new Error(
			"Invalid file format. Only JPEG, PNG, and GIF are allowed."
		)
	);
};

// Set up multer upload
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
});

module.exports = upload;
