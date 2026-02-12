import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isProductInWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication (user only)
router.use(protect);

// Get user's wishlist
router.get("/", getWishlist);

// Add product to wishlist
router.post("/add", addToWishlist);

// Remove product from wishlist
router.post("/remove", removeFromWishlist);

// Check if product in wishlist
router.get("/check", isProductInWishlist);

// Clear entire wishlist
router.post("/clear", clearWishlist);

export default router;
