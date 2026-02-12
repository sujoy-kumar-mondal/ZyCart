import express from "express";
import { protectUser } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protectUser, getCart);
router.post("/add", protectUser, addToCart);
router.patch("/update/:productId", protectUser, updateCartItem);
router.delete("/remove/:productId", protectUser, removeCartItem);
router.delete("/clear", protectUser, clearCart);

export default router;
