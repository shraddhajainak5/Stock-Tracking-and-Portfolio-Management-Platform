// backend/utils/otpUtils.js

/**
 * Generates a random numeric OTP (One-Time Password) of a specified length.
 * @param {number} length The desired length of the OTP (default is 6).
 * @returns {string} The generated OTP as a string.
 */
const generateOtp = (length = 6) => {
	if (length <= 0) {
		throw new Error("OTP length must be a positive number.");
	}

	// Calculate the minimum and maximum values for the given length
	const min = Math.pow(10, length - 1);
	const max = Math.pow(10, length) - 1;

	// Generate a random number within the range
	const otpValue = Math.floor(Math.random() * (max - min + 1)) + min;

	// Convert to string and return
	return otpValue.toString();
};

module.exports = {
	generateOtp,
};
