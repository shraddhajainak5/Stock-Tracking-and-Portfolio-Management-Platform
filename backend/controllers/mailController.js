// backend/controllers/mailController.js

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Retrieve email credentials from environment variables
// Use placeholders or default values if not set, but log a warning.
const senderEmail = "sujaysn46alt@gmail.com";
const appPassword = "seiaiyuikzrfeaqx"; // Ensure this is the App Password, not your regular Gmail password

let transporter;

// Validate essential environment variables
if (!senderEmail || !appPassword) {
	console.warn(
		"----------------------------------------------------------------------\n" +
			"WARNING: EMAIL_USERNAME or EMAIL_PASSWORD environment variables not set.\n" +
			"Email functionality (like password reset) will not work.\n" +
			"Please set them in your backend/.env file.\n" +
			"----------------------------------------------------------------------"
	);
}

try {
	// Create transporter using Gmail service and App Password
	transporter = nodemailer.createTransport({
		service: "gmail", // Use the 'gmail' service shortcut
		auth: {
			user: senderEmail, // Your full Gmail address
			pass: appPassword, // The App Password you generated
		},
	});

	// Optional: Verify transporter config (useful for debugging)
	// Run verification only if credentials are provided
	if (senderEmail && appPassword) {
		transporter.verify(function (error, success) {
			if (error) {
				console.error(
					"Transporter verification failed:",
					error.message // Log only the message for brevity
				);
				console.error(
					"Possible reasons: Invalid EMAIL_USERNAME/EMAIL_PASSWORD, Less Secure App Access disabled, 2FA issues, Gmail blocking."
				);
				// Mark transporter as invalid or handle error appropriately
				transporter = null; // Indicate transporter is not ready
			} else {
				console.log(
					"✅ Mail server is ready to take messages (using Gmail)."
				);
			}
		});
	}
} catch (error) {
	console.error("❌ Error creating Nodemailer transporter:", error);
	// Handle transporter creation error appropriately
	transporter = null; // Ensure transporter is null if creation failed
}

// --- EXISTING FUNCTION: Send verification status email ---
const sendVerificationEmail = async (req, res) => {
	if (!transporter) {
		console.error(
			"Attempted to send verification email, but transporter is not ready."
		);
		return res
			.status(503)
			.json({
				success: false,
				error: "Email service is temporarily unavailable.",
			});
	}
	try {
		console.log("Verification email request received:", req.body);

		const { email, fullName, status, note } = req.body;

		// Validate input
		if (!email || !fullName || !status) {
			console.log("Missing required fields:", {
				email,
				fullName,
				status,
			});
			return res
				.status(400)
				.json({
					error: "Email, full name, and status are required.",
				});
		}

		if (status !== "approve" && status !== "reject") {
			return res
				.status(400)
				.json({
					error: "Invalid status. Must be 'approve' or 'reject'.",
				});
		}

		console.log("Preparing verification email for:", email);
		const isApproved = status === "approve";
		const subject = isApproved
			? "Your StockWise Account Has Been Approved!"
			: "StockWise Account Verification Update";

		// Create HTML content (keep your existing HTML template)
		let htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1E88E5; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">StockWise</h1>
            </div>
            <div style="padding: 20px; background-color: #ffffff; border-left: 1px solid #E0E0E0; border-right: 1px solid #E0E0E0;">
              <h2 style="color: #1E293B; margin-top: 0; font-size: 20px;">Account Verification Update</h2>
              <p style="color: #4B5563; font-size: 16px;">Hello ${fullName},</p>
              <p style="color: #4B5563; font-size: 16px;">Your account verification request has been reviewed by our admin team. Your request has been:</p>
        `;

		if (isApproved) {
			htmlContent += `
            <div style="background-color: #10B981; color: white; padding: 12px 24px; text-align: center; margin: 20px 0; border-radius: 6px; font-weight: 600; font-size: 18px;">
              APPROVED
            </div>
            <p style="color: #4B5563; font-size: 16px;">Congratulations! You now have full access to your StockWise account. You can now log in and start trading.</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${
			process.env.FRONTEND_URL || "http://localhost:5173"
		}/login" style="background-color: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Log In Now
              </a>
            </div>
          `;
		} else {
			htmlContent += `
            <div style="background-color: #EF4444; color: white; padding: 12px 24px; text-align: center; margin: 20px 0; border-radius: 6px; font-weight: 600; font-size: 18px;">
              REJECTED
            </div>
            <p style="color: #4B5563; font-size: 16px;">We're sorry, but we couldn't verify your account at this time.</p>
          `;

			if (note) {
				htmlContent += `
              <div style="background-color: #F5F7FA; border-left: 4px solid #1E88E5; padding: 16px; margin: 20px 0; text-align: left;">
                <strong>Reason for rejection:</strong><br>
                ${note}
              </div>
            `;
			}

			htmlContent += `
            <p style="color: #4B5563; font-size: 16px;">If you have any questions or would like to submit additional verification documents, please contact our support team.</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${
			process.env.FRONTEND_URL || "http://localhost:5173"
		}/contact" style="background-color: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Contact Support
              </a>
            </div>
          `;
		}

		htmlContent += `
            </div>
            <div style="background-color: #F5F7FA; padding: 16px; text-align: center; font-size: 12px; color: #6B7280; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;">
              <p style="margin-bottom: 8px;">© ${new Date().getFullYear()} StockWise Trading. All rights reserved.</p>
              <p style="margin-bottom: 8px;">123 Trading Street, Financial District, New York, NY 10001</p>
              <p style="margin-bottom: 8px;">If you have questions, please contact <a href="mailto:support@stockwise.com" style="color: #1E88E5;">support@stockwise.com</a></p>
            </div>
          </div>
        `;

		// Configure email options
		const mailOptions = {
			from: `StockWise <${senderEmail}>`,
			to: email,
			subject: subject,
			html: htmlContent,
		};

		// Send email
		const info = await transporter.sendMail(mailOptions);
		console.log(
			"✅ Verification email sent successfully:",
			info.messageId
		);

		return res.status(200).json({
			success: true,
			message: `Verification ${
				isApproved ? "approval" : "rejection"
			} email sent to ${email}`,
			messageId: info.messageId,
		});
	} catch (error) {
		console.error("❌ Error sending verification email:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to send verification email.",
			details: error.message,
		});
	}
};

// --- EXISTING FUNCTION: Send welcome email to new users ---
const sendWelcomeEmail = async (req, res) => {
	if (!transporter) {
		console.error(
			"Attempted to send welcome email, but transporter is not ready."
		);
		return res
			.status(503)
			.json({
				success: false,
				error: "Email service is temporarily unavailable.",
			});
	}
	try {
		const { email, fullName } = req.body;

		if (!email || !fullName) {
			return res
				.status(400)
				.json({
					error: "Email and full name are required.",
				});
		}

		// Use the same HTML template structure as verification email for consistency
		const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1E88E5; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">StockWise</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #1E293B; margin-top: 0; font-size: 20px;">Welcome to StockWise!</h2>
              <p style="color: #4B5563; font-size: 16px;">Hello ${fullName},</p>
              <p style="color: #4B5563; font-size: 16px;">Thank you for joining StockWise! We're excited to have you on board.</p>
              <p style="color: #4B5563; font-size: 16px;">Your account has been created successfully. If verification is required, our team will review your information shortly, and you'll receive another email once it's complete.</p>
              <div style="text-align: center; margin-top: 25px;">
                 <a href="${
				process.env.FRONTEND_URL ||
				"http://localhost:5173"
			}/login" style="background-color: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                   Go to Dashboard
                 </a>
              </div>
            </div>
            <div style="background-color: #F5F7FA; padding: 16px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #e0e0e0;">
              <p style="margin-bottom: 8px;">© ${new Date().getFullYear()} StockWise Trading. All rights reserved.</p>
              <p style="margin-bottom: 0;">If you have questions, please contact <a href="mailto:support@stockwise.com" style="color: #1E88E5; text-decoration: none;">support@stockwise.com</a></p>
            </div>
          </div>
        `;

		const mailOptions = {
			from: `StockWise <${senderEmail}>`,
			to: email,
			subject: "Welcome to StockWise!",
			html: htmlContent,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Welcome email sent:", info.messageId);

		// This function is often called internally, so returning success might be more useful than sending a response
		// return { success: true, messageId: info.messageId };
		// If called directly via API route:
		return res.status(200).json({
			success: true,
			message: `Welcome email sent to ${email}`,
			messageId: info.messageId,
		});
	} catch (error) {
		console.error("❌ Error sending welcome email:", error);
		// return { success: false, error: error.message };
		// If called directly via API route:
		return res.status(500).json({
			success: false,
			error: "Failed to send welcome email.",
			details: error.message,
		});
	}
};

// --- NEW FUNCTION: Send OTP email for password reset ---
const sendOtpEmail = async (to, otp) => {
	if (!transporter) {
		console.error(
			"Attempted to send OTP email, but transporter is not ready."
		);
		return {
			success: false,
			error: "Email service is temporarily unavailable.",
		};
	}

	const subject = "Your StockWise Password Reset Code";
	const expirationMinutes = 10; // TODO: Make this configurable via environment variable

	const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1E88E5; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">StockWise</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #1E293B; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            You requested a password reset for your StockWise account associated with this email address.
          </p>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Enter the following One-Time Password (OTP) to reset your password:
          </p>
          <div style="background-color: #F5F7FA; border: 1px dashed #1E88E5; color: #1E293B; padding: 15px 20px; text-align: center; margin: 25px 0; border-radius: 6px;">
            <strong style="font-size: 24px; letter-spacing: 4px; display: block;">${otp}</strong>
          </div>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            This code will expire in <strong>${expirationMinutes} minutes</strong>. If you did not request a password reset, please ignore this email.
          </p>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            For security reasons, do not share this code with anyone.
          </p>
        </div>
        <div style="background-color: #F5F7FA; padding: 16px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #e0e0e0;">
          <p style="margin-bottom: 8px;">© ${new Date().getFullYear()} StockWise Trading. All rights reserved.</p>
          <p style="margin-bottom: 0;">If you have questions, please contact <a href="mailto:support@stockwise.com" style="color: #1E88E5; text-decoration: none;">support@stockwise.com</a></p>
        </div>
      </div>
    `;

	const mailOptions = {
		from: `StockWise <${senderEmail}>`,
		to: to,
		subject: subject,
		html: htmlContent,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log(
			`✅ OTP email sent successfully to ${to}:`,
			info.messageId
		);
		// This function is called internally, so return success status
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error(`❌ Error sending OTP email to ${to}:`, error);
		return { success: false, error: error.message };
	}
};
// --- END NEW FUNCTION ---

// --- EXISTING FUNCTION: Generic email sending function ---
const sendEmail = async (to, subject, htmlContent) => {
	if (!transporter) {
		console.error(
			"Attempted to send generic email, but transporter is not ready."
		);
		return {
			success: false,
			error: "Email service is temporarily unavailable.",
		};
	}
	try {
		const mailOptions = {
			from: `StockWise <${senderEmail}>`,
			to,
			subject,
			html: htmlContent,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log(
			"✅ Generic email sent successfully:",
			info.messageId
		);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("❌ Error sending generic email:", error);
		return { success: false, error: error.message };
	}
};

module.exports = {
	sendVerificationEmail,
	sendWelcomeEmail,
	sendEmail,
	sendOtpEmail, // <-- Export the new function
};
