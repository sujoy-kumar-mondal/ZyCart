import express from "express";
import {
  getProfile,
  updateProfile,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user profile
router.get("/profile", protect, getProfile);

// Update user profile
router.put("/profile", protect, updateProfile);

// Delete account (user = permanent, supplier = deactivate)
router.delete("/delete", protect, deleteAccount);

export default router;
