const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {sendVerificationEmail}=require("../services/emailService");



// REGISTER


const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;

    // Check required fields
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Clean input
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Validate name
    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        message: "Full name must be between 2 and 100 characters",
      });
    }

    // Validate email
    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Validate Kenyan phone number
    const kenyanPhoneRegex = /^(?:254|\+254|0)?7\d{8}$/;

    if (!kenyanPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please provide a valid Kenyan phone number",
      });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Strong password
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // Check duplicate phone
    const existingPhone = await User.findOne({
      phone: cleanPhone,
    });

    if (existingPhone) {
      return res.status(409).json({
        message: "An account with this phone number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create email verification token
    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Hash verification token before storing it
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Token expires after 24 hours
    const verificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // Create user
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,

      emailVerified: false,

      emailVerificationToken: hashedVerificationToken,

      emailVerificationExpires: verificationExpires,
    });

    await senderVerificationEmail(
        user.Email,
        user.name,
        verificationToken
    )

    return res.status(201).json({
      message:
        "Account created successfully. Please check your email to verify your account.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Something went wrong while creating your account",
    });
  }
};



// LOGIN


const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    // Do not reveal whether email exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
  return res.status(403).json({
    message: "Please verify your email before logging in",
  });
}

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check whether account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been disabled",
      });
    }

    // For now, we will keep JWT login working.
    // Later we will move this token into a secure HTTP-only cookie.

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// VERIFY EMAIL


const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    // Check that both values exist
    if (!token || !email || typeof token !== "string" || typeof email !== "string") {
      return res.status(400).json({
        success:false,
        message: "Invalid verification link",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Hash the token received from the URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the user
    const user = await User.findOne({
      email: cleanEmail,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: {
        $gt: new Date(),
      },
    });

    // Token does not exist or has expired
    if (!user) {
      return res.status(400).json({
        success:false,
        message: "Verification link is invalid or has expired",
      });
    }

    // Mark email as verified
    user.emailVerified = true;

    // Remove the verification token
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      success:false,
      message: "Something went wrong while verifying your email",
    });

  }
}


//EXPORT


module.exports = {
  register,
  login,
  verifyEmail,
};