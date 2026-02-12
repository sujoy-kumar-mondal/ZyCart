import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  placeOrder,
  getUserOrders,
  updateOrder,
  getOrderDetails,
} from "../controllers/orderController.js";

const router = express.Router();

// PLACE ORDER (User or Seller)
router.post("/place", protect, placeOrder);

// GET MY ORDERS (User or Seller)
router.get("/my-orders", protect, getUserOrders);

// GET ORDERS (User or Seller)
router.get("/", protect, getUserOrders);

// GET ORDER DETAILS BY ID (Must be after /my-orders route)
router.get("/:orderId", protect, getOrderDetails);

// UPDATE ORDER (User only - Payment Info)
router.patch("/:orderId", protect, updateOrder);

export default router;
