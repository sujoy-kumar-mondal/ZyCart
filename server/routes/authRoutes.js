import express from "express";
import {
  registerWithEmail,
  forgotPassword,
  verifyOtpAndRegister,
  verifyOtpAndReset,
  changePassword,
  login,
  registerAdmin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Registration (send OTP)
router.post("/send-otp", registerWithEmail);

router.post("/send-reset-otp", forgotPassword);

// Verify OTP & complete registration
router.post("/verify-otp", verifyOtpAndRegister);

router.post("/verify-reset-otp", verifyOtpAndReset);

router.post("/changepassword", protect, changePassword)

// Login (User, Supplier, Admin)
router.post("/login", login);

// Admin registration (POSTMAN only)
router.post("/register-admin", registerAdmin);

export default router;
