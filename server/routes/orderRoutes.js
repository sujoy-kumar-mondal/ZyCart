import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  placeOrder,
  getUserOrders,
} from "../controllers/orderController.js";

const router = express.Router();

// PLACE ORDER
router.post("/place", protect, authorize("user", "supplier"), placeOrder);

// GET USER ORDERS
router.get("/", protect, authorize("user", "supplier"), getUserOrders);

// 👉 IMPORTANT: Add this so frontend works
router.get("/my-orders", protect, authorize("user", "supplier"), getUserOrders);

export default router;
