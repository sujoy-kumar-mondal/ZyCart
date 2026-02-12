import express from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";

import {
  getAdminDashboard,
  getUsers,
  banUser,
  unbanUser,
  deleteUser,
  getSellers,
  approveSeller,
  banSeller,
  unbanSeller,
  getAllOrders,
  getAdminOrderDetails,
  getAdminUserDetails,
  getAdminSellerDetails,
  updateParentOrderStatus,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protectAdmin, getAdminDashboard);

// -------------------------
// USERS
// -------------------------
router.get(
  "/users",
  protectAdmin,
  getUsers
);

router.get(
  "/users/:userId",
  protectAdmin,
  getAdminUserDetails
);

router.patch(
  "/users/ban/:id",
  protectAdmin,
  banUser
);

router.patch(
  "/users/unban/:id",
  protectAdmin,
  unbanUser
);

router.delete(
  "/users/:id",
  protectAdmin,
  deleteUser
);

// -------------------------
// SELLERS
// -------------------------
router.get(
  "/sellers",
  protectAdmin,
  getSellers
);

router.get(
  "/sellers/:sellerId",
  protectAdmin,
  getAdminSellerDetails
);

router.patch(
  "/sellers/approve/:id",
  protectAdmin,
  approveSeller
);

router.patch(
  "/sellers/ban/:id",
  protectAdmin,
  banSeller
);

router.patch(
  "/sellers/unban/:id",
  protectAdmin,
  unbanSeller
);

// -------------------------
// ORDERS (Parent Orders)
// -------------------------
router.get(
  "/orders",
  protectAdmin,
  getAllOrders
);

router.get(
  "/orders/:orderId",
  protectAdmin,
  getAdminOrderDetails
);

router.patch(
  "/orders/status/:parentId",
  protectAdmin,
  updateParentOrderStatus
);

// -------------------------
// ADMIN PROFILE
// -------------------------
router.get(
  "/profile",
  protectAdmin,
  getAdminProfile
);

router.put(
  "/profile",
  protectAdmin,
  updateAdminProfile
);

export default router;
