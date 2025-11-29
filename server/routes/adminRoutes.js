import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";

import {
  getAdminDashboard,
  getUsers,
  banUser,
  unbanUser,
  getSuppliers,
  approveSupplier,
  banSupplier,
  unbanSupplier,
  getAllOrders,
  updateParentOrderStatus,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getAdminDashboard);

// -------------------------
// USERS
// -------------------------
router.get(
  "/users",
  protect,
  authorize("admin"),
  getUsers
);

router.patch(
  "/users/ban/:id",
  protect,
  authorize("admin"),
  banUser
);

router.patch(
  "/users/unban/:id",
  protect,
  authorize("admin"),
  unbanUser
);

// -------------------------
// SUPPLIERS
// -------------------------
router.get(
  "/suppliers",
  protect,
  authorize("admin"),
  getSuppliers
);

router.patch(
  "/suppliers/approve/:id",
  protect,
  authorize("admin"),
  approveSupplier
);

router.patch(
  "/suppliers/ban/:id",
  protect,
  authorize("admin"),
  banSupplier
);

router.patch(
  "/suppliers/unban/:id",
  protect,
  authorize("admin"),
  unbanSupplier
);

// -------------------------
// ORDERS (Parent Orders)
// -------------------------
router.get(
  "/orders",
  protect,
  authorize("admin"),
  getAllOrders
);

router.patch(
  "/orders/status/:parentId",
  protect,
  authorize("admin"),
  updateParentOrderStatus
);

export default router;
