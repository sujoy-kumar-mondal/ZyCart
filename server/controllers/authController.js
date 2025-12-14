import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTP, resetOTP } from "../utils/sendOtp.js";

// ----------------------------------------------------------
// GENERATE JWT TOKEN
// ----------------------------------------------------------
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ----------------------------------------------------------
// 1. SEND OTP TO EMAIL
// ----------------------------------------------------------
export const registerWithEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    let user = await User.findOne({ email });

    // If user exists but NOT verified → overwrite OTP
    // If user exists AND has password → already registered
    if (user && user.password) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    const otp = generateOTP();

    if (!user) {
      user = await User.create({ email, otp, otpExpires: Date.now() + 5 * 60 * 1000 });
    } else {
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();
    }

    const mailSent = await sendOTP(email, otp);

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    let user = await User.findOne({ email });
    
    const otp = generateOTP();
    
    if (!user) {
      return res
      .status(400)
      .json({ success: false, message: "Account not found!" });
    } else {
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();
    }
    
    const mailSent = await resetOTP(email, otp);
    
    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again.",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// 2. VERIFY OTP + COMPLETE REGISTRATION
// ----------------------------------------------------------
export const verifyOtpAndRegister = async (req, res) => {
  try {
    const { email, otp, name, mobile, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // Save user info
    user.name = name;
    user.mobile = mobile;
    user.password = password; // hashed by pre('save')
    user.otp = "";
    user.otpExpires = null;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful!",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const verifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // Save user info
    user.password = password; // hashed by pre('save')
    user.otp = "";
    user.otpExpires = null;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Password reset successful!",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// 3. LOGIN (USER / SUPPLIER / ADMIN)
// ----------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("supplierId");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.isBanned)
      return res.status(403).json({
        success: false,
        message: "Your account has been banned.",
      });

    if (!user.password)
      return res.status(400).json({
        success: false,
        message: "Complete registration before logging in.",
      });

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Incorrect password.",
      });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// 4. ADMIN REGISTRATION (POSTMAN ONLY)
// ----------------------------------------------------------
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password, address } = req.body;

    let admin = await User.findOne({ email });

    if (admin)
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });

    admin = await User.create({
      name,
      email,
      mobile,
      password,
      role: "admin",
      address,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
