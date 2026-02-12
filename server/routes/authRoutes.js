import express from "express";
import multer from "multer";
import {
  // User Auth
  registerWithEmail,
  verifyOtpAndRegister,
  loginUser,
  
  // Seller Auth
  sellerSendOtp,
  verifySellerOtpAndRegister,
  submitSellerDetails,
  loginSeller,
  
  // Admin Auth
  registerAdmin,
  loginAdmin,
  
  // Shared
  forgotPassword,
  verifyOtpAndReset,
  changePassword,
  
  // Legacy (backward compatibility)
  login,
} from "../controllers/authController.js";
import { protect, authorize, protectUser, protectSeller, protectAdmin } from "../middleware/authMiddleware.js";

// Configure multer for FormData parsing (no file storage, just parse fields)
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// ===========================================================
// USER AUTHENTICATION ROUTES
// ===========================================================

// User Registration - Step 1: Send OTP
router.post("/user/send-otp", registerWithEmail);

// User Registration - Step 2: Verify OTP
router.post("/user/verify-otp", verifyOtpAndRegister);

// User Login
router.post("/user/login", loginUser);

// ===========================================================
// SELLER AUTHENTICATION ROUTES
// ===========================================================

// Seller Registration - Step 1: Send OTP
router.post("/seller/send-otp", sellerSendOtp);

// Seller Registration - Step 2: Verify OTP & Register (Step 1 of 2-step process)
router.post("/seller/verify-otp", verifySellerOtpAndRegister);

// Seller Registration - Step 3: Submit Shop Details (Step 2 of 2-step process)
// Using multer to parse FormData fields and optional file upload
router.post("/seller/submit-details", upload.single("license"), submitSellerDetails);

// Seller Login
router.post("/seller/login", loginSeller);

// ===========================================================
// ADMIN AUTHENTICATION ROUTES
// ===========================================================

// Admin Registration (POSTMAN ONLY)
router.post("/admin/register", registerAdmin);

// Admin Login
router.post("/admin/login", loginAdmin);

// ===========================================================
// SHARED ROUTES (for all roles)
// ===========================================================

// Forgot Password (requires role specification)
router.post("/forgot-password", forgotPassword);

// Reset Password (requires role specification)
router.post("/reset-password", verifyOtpAndReset);

// Change Password (requires authentication)
router.post("/change-password", protect, changePassword);

// ===========================================================
// LEGACY ROUTES (backward compatibility)
// ===========================================================

// Old unified login endpoint (tries all three)
router.post("/login", login);

// Old OTP endpoint (User only)
router.post("/send-otp", registerWithEmail);
router.post("/verify-otp", verifyOtpAndRegister);

// Old forgot password
router.post("/send-reset-otp", forgotPassword);
router.post("/verify-reset-otp", verifyOtpAndReset);

// Old change password
router.post("/changepassword", protect, changePassword);

// ===========================================================
// REGISTRATION (LEGACY - User only)
// ===========================================================
router.post("/register-admin", registerAdmin);

export default router;
