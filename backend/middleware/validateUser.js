// Validate email format
const validateEmail = (email) => {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return emailRegex.test(email);
  };
  
  // Validate full name (minimum 3 characters, only alphabetic characters and spaces)
  const validateFullName = (name) => {
	if (!name || name.trim().length < 3) return false;
	const nameRegex = /^[A-Za-z\s]+$/;
	return nameRegex.test(name);
  };
  
  // Validate password strength
  const validatePassword = (password) => {
	// At least 8 characters, one uppercase, one lowercase, one digit, one special character
	const passwordRegex =
	  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
	return passwordRegex.test(password);
  };
  
  // Validate phone number
  const validatePhone = (phone) => {
	// Basic validation for phone number - at least 10 digits
	const phoneRegex = /^[0-9]{10,15}$/;
	return phoneRegex.test(phone);
  };
  
  // Validate user type
  const validateUserType = (type) => {
	return type === "admin" || type === "user" || type === "broker";
  };
  
  // Middleware for validating user creation
  const validateUserCreate = (req, res, next) => {
	const { fullName, email, password, type, phone, company } = req.body;
  
	// Check if all required fields are present
	if (!fullName || !email || !password) {
	  return res.status(400).json({ error: "All fields are required." });
	}
  
	// Validate full name
	if (!validateFullName(fullName)) {
	  return res.status(400).json({
		error: "Full name must contain at least 3 alphabetic characters.",
	  });
	}
  
	// Validate email
	if (!validateEmail(email)) {
	  return res.status(400).json({ error: "Invalid email format." });
	}
  
	// Validate password
	if (!validatePassword(password)) {
	  return res.status(400).json({
		error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
	  });
	}
  
	// Additional validations for broker type
	if (type === "broker") {
	  // Validate phone number for brokers
	  if (!phone) {
		return res.status(400).json({
		  error: "Phone number is required for broker registration.",
		});
	  }
	  
	  if (phone && !validatePhone(phone)) {
		return res.status(400).json({
		  error: "Invalid phone number format. Please enter a valid phone number.",
		});
	  }
  
	  // Validate company name for brokers
	  if (!company) {
		return res.status(400).json({
		  error: "Company or organization name is required for broker registration.",
		});
	  }
	}
  
	// Validate type if provided
	if (type && !validateUserType(type)) {
	  return res.status(400).json({
		error: "User type must be either 'admin', 'user', or 'broker'.",
	  });
	}
  
	next();
  };
  
  // Middleware for validating user updates
  const validateUserUpdate = (req, res, next) => {
	const { fullName, password, type, phone, company } = req.body;
  
	// Validate full name if provided
	if (fullName && !validateFullName(fullName)) {
	  return res.status(400).json({
		error: "Full name must contain at least 3 alphabetic characters.",
	  });
	}
  
	// Validate password if provided
	if (password && !validatePassword(password)) {
	  return res.status(400).json({
		error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
	  });
	}
  
	// Validate type if provided
	if (type && !validateUserType(type)) {
	  return res.status(400).json({
		error: "User type must be either 'admin', 'user', or 'broker'.",
	  });
	}
  
	// Validate phone if provided
	if (phone && !validatePhone(phone)) {
	  return res.status(400).json({
		error: "Invalid phone number format. Please enter a valid phone number.",
	  });
	}
  
	next();
  };
  
  // Export validation functions
  module.exports = {
	validateUserCreate,
	validateUserUpdate,
	validateUserType,
    validatePassword,
	validateEmail,
	validateFullName,
	validatePassword,
	validatePhone
  };