import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import SystemSetting from "../models/SystemSetting.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTP, resetOTP } from "../utils/sendOtp.js";

// ===========================================================
// GENERATE JWT TOKEN
// ===========================================================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Helper functions to strip sensitive fields from payloads
const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

const sanitizeSeller = (seller) => {
  if (!seller) return null;
  const obj = seller.toObject ? seller.toObject() : { ...seller };
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

const sanitizeAdmin = (admin) => {
  if (!admin) return null;
  const obj = admin.toObject ? admin.toObject() : { ...admin };
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

// ===========================================================
// USER REGISTRATION & LOGIN
// ===========================================================

// 1. SEND OTP TO EMAIL (USER REGISTRATION)
export const registerWithEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();

    // If fully registered user exists with password → reject
    const existingUser = await User.findOne({ email: cleanEmail, password: { $exists: true, $ne: "" } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered. Please sign in." });
    }

    // Clean up any legacy unverified dummy records
    await User.deleteMany({ email: cleanEmail, $or: [{ password: "" }, { password: null }, { password: { $exists: false } }] });

    const otp = generateOTP();

    // Store OTP in temporary Otp collection (auto-expires in 5 mins)
    await Otp.deleteMany({ email: cleanEmail, purpose: "user_registration" });
    await Otp.create({
      email: cleanEmail,
      otp,
      purpose: "user_registration",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const mailSent = await sendOTP(cleanEmail, otp);

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("registerWithEmail error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. VERIFY OTP + CREATE USER ACCOUNT (ONLY CREATED ON SUCCESSFUL VERIFICATION)
export const verifyOtpAndRegister = async (req, res) => {
  try {
    const { email, otp, name, mobile, password } = req.body;

    if (!email || !otp || !name || !mobile || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find and validate OTP from Otp collection
    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: "user_registration" });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired or not found. Please request a new code.",
      });
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await Otp.deleteMany({ email: cleanEmail, purpose: "user_registration" });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    if (otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again.",
      });
    }

    if (!/^[0-9]{10}$/.test(String(mobile).trim())) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be a valid 10-digit number.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
      });
    }

    // Double check email uniqueness before creating
    const existing = await User.findOne({ email: cleanEmail, password: { $exists: true, $ne: "" } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please sign in.",
      });
    }

    // Clean up any stray dummy record
    await User.deleteMany({ email: cleanEmail });

    // ONLY NOW create the user in the database
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      mobile: String(mobile).trim(),
      password, // hashed automatically by UserSchema pre('save') hook
    });

    // Delete the consumed OTP
    await Otp.deleteMany({ email: cleanEmail, purpose: "user_registration" });

    res.status(201).json({
      success: true,
      message: "Registration successful! You can now sign in.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("verifyOtpAndRegister error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. USER LOGIN (STEP 1: PASSWORD -> OTP)
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

    // Check system 2FA configuration
    const settings = await SystemSetting.findOne();
    const enable2FA = settings?.enableCustomer2FA !== false;

    if (!enable2FA) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        requireOtp: false,
        token,
        user: sanitizeUser(user),
        message: "Login successful",
      });
    }

    // Generate 6-digit OTP for 2FA login
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      requireOtp: true,
      email: user.email,
      message: "Password verified! 2FA OTP has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3B. VERIFY USER LOGIN OTP (STEP 2: OTP -> JWT TOKEN)
export const verifyLoginOtpUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please log in again." });
    }

    // Clear OTP fields
    user.otp = "";
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// SELLER REGISTRATION & LOGIN
// ===========================================================

// 4. SEND OTP TO EMAIL (SELLER REGISTRATION)
export const sellerSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();

    // If seller exists with password → already registered
    const existingSeller = await Seller.findOne({ email: cleanEmail, password: { $exists: true, $ne: "" } });
    if (existingSeller) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered as merchant. Please sign in." });
    }

    // Clean up any legacy unverified dummy seller records
    await Seller.deleteMany({ email: cleanEmail, $or: [{ password: "" }, { password: null }, { password: { $exists: false } }] });

    const otp = generateOTP();

    // Store OTP in Otp collection (auto-expires in 5 mins)
    await Otp.deleteMany({ email: cleanEmail, purpose: "seller_registration" });
    await Otp.create({
      email: cleanEmail,
      otp,
      purpose: "seller_registration",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const mailSent = await sendOTP(cleanEmail, otp);

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to merchant email.",
    });
  } catch (error) {
    console.error("sellerSendOtp error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const isStrongPassword = (pwd) => {
  if (!pwd || pwd.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  return hasUpper && hasLower && hasNumber && hasSymbol;
};

// 5. VERIFY OTP + STEP 2 SELLER REGISTRATION
export const verifySellerOtpAndRegister = async (req, res) => {
  try {
    const { email, otp, name, mobile, password } = req.body;

    if (!email || !otp || !name || !mobile || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Validate OTP from Otp collection
    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: "seller_registration" });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired or not found. Please request a new code.",
      });
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await Otp.deleteMany({ email: cleanEmail, purpose: "seller_registration" });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    if (otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again.",
      });
    }

    if (!/^[0-9]{10}$/.test(String(mobile).trim())) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be a valid 10-digit number.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email: cleanEmail, password: { $exists: true, $ne: "" } });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email already registered as merchant. Please sign in.",
      });
    }

    // Clean up any stray dummy seller record
    await Seller.deleteMany({ email: cleanEmail });

    // ONLY NOW create the seller document in database
    const newSeller = await Seller.create({
      name: name.trim(),
      email: cleanEmail,
      mobile: String(mobile).trim(),
      password, // hashed automatically by SellerSchema pre('save')
      registrationStatus: "step2",
    });

    // Delete the consumed OTP
    await Otp.deleteMany({ email: cleanEmail, purpose: "seller_registration" });

    res.status(201).json({
      success: true,
      message: "Step 2 completed. Proceed to seller details.",
      sellerId: newSeller._id,
    });
  } catch (error) {
    console.error("verifySellerOtpAndRegister error:", error);
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

    // Check system settings for GST requirement
    const settings = await SystemSetting.findOne();
    const isGstRequired = settings?.requireGstin !== false;

    // Validate all required business fields (trim to handle FormData empty strings)
    const missingFields = [];
    
    if (!shopName || shopName.trim() === "") missingFields.push("Shop Name");
    if (!shopType || shopType.trim() === "") missingFields.push("Shop Type");
    if (!pan || pan.trim() === "") missingFields.push("PAN");
    if (!aadhar || aadhar.trim() === "") missingFields.push("Aadhar");
    if (!bankAccount || bankAccount.trim() === "") missingFields.push("Bank Account");
    if (isGstRequired && (!gst || gst.trim() === "")) missingFields.push("GST");

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Please fill all required fields: ${missingFields.join(", ")}` 
      });
    }

    const cleanPan = pan.trim().toUpperCase();
    const cleanAadhar = aadhar.replace(/\s+/g, "");
    const cleanBank = bankAccount.trim();
    const cleanGst = gst.trim().toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN card format (Must be 10 characters: e.g. ABCDE1234F).",
      });
    }

    if (!/^\d{12}$/.test(cleanAadhar)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number format (Must be 12 digits).",
      });
    }

    if (!/^\d{9,18}$/.test(cleanBank)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bank Account number (Must be 9 to 18 digits).",
      });
    }

    if (gst && gst.trim()) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGst)) {
        return res.status(400).json({
          success: false,
          message: "Invalid GSTIN format (Must be 15 characters, e.g. 22AAAAA0000A1Z5).",
        });
      }
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

    // Handle Auto-Approve Seller system setting
    if (settings?.autoApproveSellers) {
      seller.isApproved = true;
      seller.approvalDate = new Date();
    }

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
      message: seller.isApproved
        ? "Seller account approved and activated successfully!"
        : "Seller details submitted successfully. Awaiting admin approval.",
      seller: sanitizeSeller(seller),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 7. SELLER LOGIN (STEP 1: PASSWORD -> OTP)
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

    // Check system 2FA configuration
    const settings = await SystemSetting.findOne();
    const enable2FA = settings?.enableSeller2FA !== false;

    if (!enable2FA) {
      seller.lastLogin = new Date();
      await seller.save();
      const token = generateToken(seller._id);
      return res.status(200).json({
        success: true,
        requireOtp: false,
        token,
        seller: sanitizeSeller(seller),
        message: "Login successful",
      });
    }

    // Generate 6-digit OTP for 2FA login
    const otp = generateOTP();
    seller.otp = otp;
    seller.otpExpires = Date.now() + 5 * 60 * 1000;
    await seller.save();

    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      requireOtp: true,
      email: seller.email,
      message: "Password verified! 2FA OTP has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 7B. VERIFY SELLER LOGIN OTP (STEP 2: OTP -> JWT TOKEN)
export const verifyLoginOtpSeller = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    if (seller.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (seller.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please log in again." });
    }

    // Clear OTP fields
    seller.otp = "";
    seller.otpExpires = null;
    seller.lastLogin = new Date();
    await seller.save();

    const token = generateToken(seller._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      seller: sanitizeSeller(seller),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// ADMIN REGISTRATION & LOGIN
// ===========================================================

// 8. ADMIN REGISTRATION (BOOTSTRAP ONLY)
export const registerAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: "Direct admin registration is disabled. Please create administrators via the Admin Management portal.",
      });
    }

    const { name, email, mobile, password, address, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password required" });
    }

    let admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (admin)
      return res
        .status(400)
        .json({ success: false, message: "Admin with this email already exists" });

    admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: String(mobile || "").trim(),
      password,
      address,
      permissions: permissions || ["manage_users", "manage_sellers"],
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 9. ADMIN LOGIN (STEP 1: PASSWORD -> OTP)
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

    // Check system 2FA configuration
    const settings = await SystemSetting.findOne();
    const enable2FA = settings?.enableAdmin2FA !== false;

    if (!enable2FA) {
      admin.loginAttempts = 0;
      admin.lockedUntil = null;
      admin.lastLogin = new Date();
      await admin.save();
      const token = generateToken(admin._id);
      return res.status(200).json({
        success: true,
        requireOtp: false,
        token,
        admin: sanitizeAdmin(admin),
        message: "Admin login successful",
      });
    }

    // Generate 6-digit OTP for 2FA login
    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpires = Date.now() + 5 * 60 * 1000;
    await admin.save();

    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      requireOtp: true,
      email: admin.email,
      message: "Password verified! 2FA OTP has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 9B. VERIFY ADMIN LOGIN OTP (STEP 2: OTP -> JWT TOKEN)
export const verifyLoginOtpAdmin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (admin.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (admin.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please log in again." });
    }

    // Clear OTP fields & reset login attempts
    admin.otp = "";
    admin.otpExpires = null;
    admin.loginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// SHARED UTILITIES (DOMAIN-SPECIFIC)
// ===========================================================

// ---------------------------------------------------------------
// FORGOT PASSWORD - USER
// ---------------------------------------------------------------
export const forgotPasswordUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });

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

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------------
// FORGOT PASSWORD - SELLER
// ---------------------------------------------------------------
export const forgotPasswordSeller = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(400).json({ success: false, message: "Account not found!" });
    }

    const otp = generateOTP();
    seller.otp = otp;
    seller.otpExpires = Date.now() + 5 * 60 * 1000;
    await seller.save();

    const mailSent = await resetOTP(email, otp);

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again.",
      });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------------
// FORGOT PASSWORD - ADMIN
// ---------------------------------------------------------------
export const forgotPasswordAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ success: false, message: "Account not found!" });
    }

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpires = Date.now() + 5 * 60 * 1000;
    await admin.save();

    const mailSent = await resetOTP(email, otp);

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again.",
      });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------------
// VERIFY OTP & RESET PASSWORD - USER
// ---------------------------------------------------------------
export const verifyOtpAndResetUser = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: "Email, OTP, and password are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
      });
    }

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.password = password;
    user.otp = "";
    user.otpExpires = null;
    await user.save();

    res.status(201).json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------------
// VERIFY OTP & RESET PASSWORD - SELLER
// ---------------------------------------------------------------
export const verifyOtpAndResetSeller = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: "Email, OTP, and password are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
      });
    }

    const seller = await Seller.findOne({ email });

    if (!seller)
      return res.status(404).json({ success: false, message: "Seller not found" });

    if (seller.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (seller.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    seller.password = password;
    seller.otp = "";
    seller.otpExpires = null;
    await seller.save();

    res.status(201).json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------------
// VERIFY OTP & RESET PASSWORD - ADMIN
// ---------------------------------------------------------------
export const verifyOtpAndResetAdmin = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: "Email, OTP, and password are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    if (admin.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (admin.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    admin.password = password;
    admin.otp = "";
    admin.otpExpires = null;
    await admin.save();

    res.status(201).json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------------
// CHANGE PASSWORD - USER (called via protectUser middleware)
// ---------------------------------------------------------------
export const changePasswordUser = async (req, res) => {
  try {
    const { password, nPassword, newPassword } = req.body;
    const targetNewPassword = nPassword || newPassword;
    const user = req.user.userDoc;

    if (!user) {
      return res.status(400).json({ success: false, message: "Account not found!" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Password incorrect!" });
    }

    if (targetNewPassword) {
      if (!isStrongPassword(targetNewPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
        });
      }
      user.password = targetNewPassword;
    }

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

// ---------------------------------------------------------------
// CHANGE PASSWORD - SELLER (called via protectSeller middleware)
// ---------------------------------------------------------------
export const changePasswordSeller = async (req, res) => {
  try {
    const { password, nPassword, newPassword } = req.body;
    const targetNewPassword = nPassword || newPassword;
    const seller = req.user.userDoc;

    if (!seller) {
      return res.status(400).json({ success: false, message: "Account not found!" });
    }

    const isMatch = await seller.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Password incorrect!" });
    }

    if (targetNewPassword) {
      if (!isStrongPassword(targetNewPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
        });
      }
      seller.password = targetNewPassword;
    }

    await seller.save();

    res.status(201).json({
      success: true,
      message: "Password changed successfully!",
      user: seller,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------------------------------
// CHANGE PASSWORD - ADMIN (called via protectAdmin middleware)
// ---------------------------------------------------------------
export const changePasswordAdmin = async (req, res) => {
  try {
    const { password, nPassword, newPassword } = req.body;
    const targetNewPassword = nPassword || newPassword;
    const admin = req.user.userDoc;

    if (!admin) {
      return res.status(400).json({ success: false, message: "Account not found!" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Password incorrect!" });
    }

    if (targetNewPassword) {
      if (!isStrongPassword(targetNewPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
        });
      }
      admin.password = targetNewPassword;
    }

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Password changed successfully!",
      user: admin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 13. LEGACY - UNIFIED LOGIN (BACKWARD COMPATIBILITY)
// Kept for backward compatibility only - prefer domain-specific login endpoints
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find in User collection
    let user = await User.findOne({ email });
    if (user && user.password) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user,
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
        const token = generateToken(seller._id);
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          seller,
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
        const token = generateToken(admin._id);
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          admin,
        });
      }
    }

    return res.status(404).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
