import express from "express";
import {
  getProfile,
  updateProfile,
  deleteAccount,
} from "../controllers/userController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user profile
router.get("/profile", protectUser, getProfile);

// Update user profile
router.put("/profile", protectUser, updateProfile);

// Delete account
router.delete("/delete", protectUser, deleteAccount);

export default router;
