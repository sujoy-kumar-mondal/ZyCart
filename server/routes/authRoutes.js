import express from "express";
import {
  registerWithEmail,
  verifyOtpAndRegister,
  login,
  registerAdmin,
} from "../controllers/authController.js";

const router = express.Router();

// User Registration (send OTP)
router.post("/send-otp", registerWithEmail);

// Verify OTP & complete registration
router.post("/verify-otp", verifyOtpAndRegister);

// Login (User, Supplier, Admin)
router.post("/login", login);

// Admin registration (POSTMAN only)
router.post("/register-admin", registerAdmin);

export default router;
