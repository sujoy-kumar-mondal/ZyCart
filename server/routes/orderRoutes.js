import express from "express";
import { protectUser } from "../middleware/authMiddleware.js";
import {
  placeOrder,
  getUserOrders,
  updateOrder,
  getOrderDetails,
} from "../controllers/orderController.js";

const router = express.Router();

// PLACE ORDER (User only)
router.post("/place", protectUser, placeOrder);

// GET MY ORDERS (User only)
router.get("/my-orders", protectUser, getUserOrders);

// GET ORDERS (User only)
router.get("/", protectUser, getUserOrders);

// GET ORDER DETAILS BY ID (Must be after /my-orders route)
router.get("/:orderId", protectUser, getOrderDetails);

// UPDATE ORDER (User only - Payment Info)
router.patch("/:orderId", protectUser, updateOrder);

export default router;
