import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTP, resetOTP } from "../utils/sendOtp.js";

// ===========================================================
// GENERATE JWT TOKEN (with role)
// ===========================================================
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ===========================================================
// USER REGISTRATION & LOGIN
// ===========================================================

// 1. SEND OTP TO EMAIL (USER)
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. VERIFY OTP + COMPLETE USER REGISTRATION
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. USER LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

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

    const token = generateToken(user._id, "user");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
      role: "user",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// SELLER REGISTRATION & LOGIN
// ===========================================================

// 4. SEND OTP TO EMAIL (SELLER)
export const sellerSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    let seller = await Seller.findOne({ email });

    // If seller exists with password → already registered
    if (seller && seller.password) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered as seller." });
    }

    const otp = generateOTP();

    if (!seller) {
      seller = await Seller.create({ 
        email, 
        otp, 
        otpExpires: Date.now() + 5 * 60 * 1000,
        registrationStatus: "step1"
      });
    } else {
      seller.otp = otp;
      seller.otpExpires = Date.now() + 5 * 60 * 1000;
      seller.registrationStatus = "step1";
      await seller.save();
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5. VERIFY OTP + STEP 2 SELLER REGISTRATION
export const verifySellerOtpAndRegister = async (req, res) => {
  try {
    const { email, otp, name, mobile, password } = req.body;

    if (!email || !otp || !name || !mobile || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const seller = await Seller.findOne({ email });

    if (!seller)
      return res.status(404).json({ success: false, message: "Seller not found" });

    if (seller.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (seller.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // Save basic info from Step 2
    seller.name = name;
    seller.mobile = mobile;
    seller.password = password; // hashed by pre('save')
    seller.otp = "";
    seller.otpExpires = null;
    seller.registrationStatus = "step2";

    await seller.save();

    res.status(201).json({
      success: true,
      message: "Step 2 completed. Proceed to seller details.",
      sellerId: seller._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 6. STEP 3: SUBMIT SELLER BUSINESS DETAILS
export const submitSellerDetails = async (req, res) => {
  try {
    const { sellerId, shopName, shopType, pan, aadhar, bankAccount, gst, address } = req.body;

    // Validate sellerId
    if (!sellerId) {
      return res.status(400).json({ success: false, message: "Seller ID is required" });
    }

    // Validate all required business fields (trim to handle FormData empty strings)
    const missingFields = [];
    
    if (!shopName || shopName.trim() === "") missingFields.push("Shop Name");
    if (!shopType || shopType.trim() === "") missingFields.push("Shop Type");
    if (!pan || pan.trim() === "") missingFields.push("PAN");
    if (!aadhar || aadhar.trim() === "") missingFields.push("Aadhar");
    if (!bankAccount || bankAccount.trim() === "") missingFields.push("Bank Account");
    if (!gst || gst.trim() === "") missingFields.push("GST");

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Please fill all required fields: ${missingFields.join(", ")}` 
      });
    }

    let seller = await Seller.findById(sellerId);

    if (!seller)
      return res.status(404).json({ success: false, message: "Seller not found" });

    // Check if seller is in correct registration step
    if (seller.registrationStatus !== "step2") {
      return res.status(400).json({ 
        success: false, 
        message: "Please complete previous steps first (OTP verification and basic details)" 
      });
    }

    // Add seller business details (trim whitespace)
    seller.shopName = shopName.trim();
    seller.shopType = shopType.trim();
    seller.pan = pan.trim();
    seller.aadhar = aadhar.trim();
    seller.bankAccount = bankAccount.trim();
    seller.gst = gst.trim();
    seller.registrationStatus = "completed";
    
    if (address) seller.address = address;

    try {
      await seller.save();
    } catch (saveError) {
      // Handle duplicate key errors for unique fields
      if (saveError.code === 11000) {
        const field = Object.keys(saveError.keyPattern)[0];
        return res.status(400).json({ 
          success: false, 
          message: `This ${field} is already registered. Please use a different ${field}.` 
        });
      }
      throw saveError;
    }

    res.status(201).json({
      success: true,
      message: "Seller details submitted successfully. Awaiting admin approval.",
      seller,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 7. SELLER LOGIN
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller)
      return res.status(404).json({ success: false, message: "Seller not found" });

    if (seller.isBanned)
      return res.status(403).json({
        success: false,
        message: "Your seller account has been banned.",
      });

    if (!seller.isApproved)
      return res.status(403).json({
        success: false,
        message: "Your seller account is pending approval.",
      });

    if (!seller.password)
      return res.status(400).json({
        success: false,
        message: "Complete registration before logging in.",
      });

    const isMatch = await seller.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Incorrect password.",
      });

    seller.lastLogin = new Date();
    await seller.save();

    const token = generateToken(seller._id, "seller");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      seller,
      role: "seller",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// ADMIN REGISTRATION & LOGIN
// ===========================================================

// 8. ADMIN REGISTRATION (POSTMAN ONLY)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password, address, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password required" });
    }

    let admin = await Admin.findOne({ email });

    if (admin)
      return res
        .status(400)
        .json({ success: false, message: "Admin with this email already exists" });

    admin = await Admin.create({
      name,
      email,
      mobile,
      password,
      address,
      permissions: permissions || ["manage_users", "manage_sellers"],
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 9. ADMIN LOGIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    if (!admin.isActive)
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive.",
      });

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account locked due to multiple login attempts. Try again later.",
      });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (admin.loginAttempts >= 5) {
        admin.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await admin.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id, "admin");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin,
      role: "admin",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// SHARED UTILITIES
// ===========================================================

// 10. FORGET PASSWORD (ALL ROLES)
export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role)
      return res.status(400).json({ success: false, message: "Email and role required" });

    // Determine which model to use
    let model = role === "seller" ? Seller : role === "admin" ? Admin : User;
    let user = await model.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Account not found!" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 11. VERIFY OTP & RESET PASSWORD (ALL ROLES)
export const verifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, password, role } = req.body;

    if (!email || !otp || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, OTP, password, and role required" });
    }

    // Determine which model to use
    let model = role === "seller" ? Seller : role === "admin" ? Admin : User;
    let user = await model.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // Save new password
    user.password = password; // hashed by pre('save')
    user.otp = "";
    user.otpExpires = null;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Password reset successful!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 12. CHANGE PASSWORD (ALL ROLES)
export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId, role } = req.user; // Set by updated middleware

    // Determine which model to use
    let model = role === "seller" ? Seller : role === "admin" ? Admin : User;
    let user = await model.findById(userId);

    if (!user) {
      return res.status(400).json({ success: false, message: "Account not found!" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Password incorrect!" });
    }

    user.password = password; // hashed by pre('save')
    await user.save();

    res.status(201).json({
      success: true,
      message: "Password changed successfully!",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 13. LEGACY - UNIFIED LOGIN (BACKWARD COMPATIBILITY)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find in User collection
    let user = await User.findOne({ email });
    if (user && user.password) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        const token = generateToken(user._id, "user");
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user,
          role: "user",
        });
      }
    }

    // Try to find in Seller collection
    let seller = await Seller.findOne({ email });
    if (seller && seller.password && seller.isApproved) {
      const isMatch = await seller.matchPassword(password);
      if (isMatch) {
        seller.lastLogin = new Date();
        await seller.save();
        const token = generateToken(seller._id, "seller");
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          seller,
          role: "seller",
        });
      }
    }

    // Try to find in Admin collection
    let admin = await Admin.findOne({ email });
    if (admin && admin.password && admin.isActive) {
      const isMatch = await admin.matchPassword(password);
      if (isMatch) {
        admin.lastLogin = new Date();
        await admin.save();
        const token = generateToken(admin._id, "admin");
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          admin,
          role: "admin",
        });
      }
    }

    return res.status(404).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
