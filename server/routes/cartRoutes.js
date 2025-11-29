import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, authorize("user"), getCart);
router.post("/add", protect, authorize("user"), addToCart);
router.patch("/update/:productId", protect, authorize("user"), updateCartItem);
router.delete("/remove/:productId", protect, authorize("user"), removeCartItem);
router.delete("/clear", protect, authorize("user"), clearCart);

export default router;
