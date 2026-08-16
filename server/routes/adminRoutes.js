import express from "express";
import { protectAdmin, requirePermission, requireSuperAdmin } from "../middleware/authMiddleware.js";

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
  getAllAdmins,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protectAdmin, getAdminDashboard);

// -------------------------
// USERS MANAGEMENT
// -------------------------
router.get(
  "/users",
  protectAdmin,
  requirePermission("manage_users"),
  getUsers
);

router.get(
  "/users/:userId",
  protectAdmin,
  requirePermission("manage_users"),
  getAdminUserDetails
);

router.patch(
  "/users/ban/:id",
  protectAdmin,
  requirePermission("manage_users"),
  banUser
);

router.patch(
  "/users/unban/:id",
  protectAdmin,
  requirePermission("manage_users"),
  unbanUser
);

router.delete(
  "/users/:id",
  protectAdmin,
  requirePermission("manage_users"),
  deleteUser
);

// -------------------------
// SELLERS MANAGEMENT
// -------------------------
router.get(
  "/sellers",
  protectAdmin,
  requirePermission("manage_sellers"),
  getSellers
);

router.get(
  "/sellers/:sellerId",
  protectAdmin,
  requirePermission("manage_sellers"),
  getAdminSellerDetails
);

router.patch(
  "/sellers/approve/:id",
  protectAdmin,
  requirePermission("manage_sellers"),
  approveSeller
);

router.patch(
  "/sellers/ban/:id",
  protectAdmin,
  requirePermission("manage_sellers"),
  banSeller
);

router.patch(
  "/sellers/unban/:id",
  protectAdmin,
  requirePermission("manage_sellers"),
  unbanSeller
);

// -------------------------
// ORDERS (Parent Orders)
// -------------------------
router.get(
  "/orders",
  protectAdmin,
  requirePermission("manage_orders"),
  getAllOrders
);

router.get(
  "/orders/:orderId",
  protectAdmin,
  requirePermission("manage_orders"),
  getAdminOrderDetails
);

router.patch(
  "/orders/status/:parentId",
  protectAdmin,
  requirePermission("manage_orders"),
  updateParentOrderStatus
);

// -------------------------
// SUPER ADMIN: ADMIN MANAGEMENT
// -------------------------
router.get(
  "/admins",
  protectAdmin,
  requireSuperAdmin,
  getAllAdmins
);

router.post(
  "/admins",
  protectAdmin,
  requireSuperAdmin,
  createAdminAccount
);

router.put(
  "/admins/:id",
  protectAdmin,
  requireSuperAdmin,
  updateAdminAccount
);

router.delete(
  "/admins/:id",
  protectAdmin,
  requireSuperAdmin,
  deleteAdminAccount
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
