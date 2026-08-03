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

  // Forgot Password (domain-specific)
  forgotPasswordUser,
  forgotPasswordSeller,
  forgotPasswordAdmin,

  // Reset Password (domain-specific)
  verifyOtpAndResetUser,
  verifyOtpAndResetSeller,
  verifyOtpAndResetAdmin,

  // Change Password (domain-specific)
  changePasswordUser,
  changePasswordSeller,
  changePasswordAdmin,

  // Legacy (backward compatibility)
  login,
} from "../controllers/authController.js";
import { protectUser, protectSeller, protectAdmin } from "../middleware/authMiddleware.js";

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

// User Forgot Password
router.post("/user/send-reset-otp", forgotPasswordUser);

// User Reset Password
router.post("/user/verify-reset-otp", verifyOtpAndResetUser);

// User Change Password
router.post("/user/change-password", protectUser, changePasswordUser);

// ===========================================================
// SELLER AUTHENTICATION ROUTES
// ===========================================================

// Seller Registration - Step 1: Send OTP
router.post("/seller/send-otp", sellerSendOtp);

// Seller Registration - Step 2: Verify OTP & Register (Step 1 of 2-step process)
router.post("/seller/verify-otp", verifySellerOtpAndRegister);

// Seller Registration - Step 3: Submit Shop Details (Step 2 of 2-step process)
router.post("/seller/submit-details", upload.single("license"), submitSellerDetails);

// Seller Login
router.post("/seller/login", loginSeller);

// Seller Forgot Password
router.post("/seller/send-reset-otp", forgotPasswordSeller);

// Seller Reset Password
router.post("/seller/verify-reset-otp", verifyOtpAndResetSeller);

// Seller Change Password
router.post("/seller/change-password", protectSeller, changePasswordSeller);

// ===========================================================
// ADMIN AUTHENTICATION ROUTES
// ===========================================================

// Admin Registration (POSTMAN ONLY)
router.post("/admin/register", registerAdmin);

// Admin Login
router.post("/admin/login", loginAdmin);

// Admin Forgot Password
router.post("/admin/send-reset-otp", forgotPasswordAdmin);

// Admin Reset Password
router.post("/admin/verify-reset-otp", verifyOtpAndResetAdmin);

// Admin Change Password
router.post("/admin/change-password", protectAdmin, changePasswordAdmin);

// ===========================================================
// LEGACY ROUTES (backward compatibility)
// ===========================================================

// Old unified login endpoint (tries all three)
router.post("/login", login);

// Old OTP endpoint (User only)
router.post("/send-otp", registerWithEmail);
router.post("/verify-otp", verifyOtpAndRegister);

// Old forgot password (user)
router.post("/send-reset-otp", forgotPasswordUser);
router.post("/verify-reset-otp", verifyOtpAndResetUser);

// Old change password (user)
router.post("/changepassword", protectUser, changePasswordUser);

// Old forgot/reset (shared - redirects to user handler for backward compat)
router.post("/forgot-password", forgotPasswordUser);
router.post("/reset-password", verifyOtpAndResetUser);
router.post("/change-password", protectUser, changePasswordUser);

// ===========================================================
// REGISTRATION (LEGACY - Admin only)
// ===========================================================
router.post("/register-admin", registerAdmin);

export default router;
