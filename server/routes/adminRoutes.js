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
  cancelAdminOrder,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminCategoryAttributes,
  saveAdminCategoryAttributes,
  getAdminProducts,
  getAdminProductDetails,
  toggleAdminProductAvailability,
  deleteAdminProduct,
  getSystemSettings,
  updateSystemSettings,
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
  "/users/:id/ban",
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
router.patch(
  "/users/:id/unban",
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
  "/sellers/:id/approve",
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
  "/sellers/:id/ban",
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
router.patch(
  "/sellers/:id/unban",
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

router.post(
  "/orders/cancel/:orderId",
  protectAdmin,
  requirePermission("manage_orders"),
  cancelAdminOrder
);

// -------------------------
// CATEGORIES MANAGEMENT
// -------------------------
router.get(
  "/categories",
  protectAdmin,
  requirePermission("manage_categories"),
  getAdminCategories
);

router.post(
  "/categories",
  protectAdmin,
  requirePermission("manage_categories"),
  createAdminCategory
);

router.put(
  "/categories/:id",
  protectAdmin,
  requirePermission("manage_categories"),
  updateAdminCategory
);

router.delete(
  "/categories/:id",
  protectAdmin,
  requirePermission("manage_categories"),
  deleteAdminCategory
);

router.get(
  "/categories/:id/attributes",
  protectAdmin,
  requirePermission("manage_categories"),
  getAdminCategoryAttributes
);

router.put(
  "/categories/:id/attributes",
  protectAdmin,
  requirePermission("manage_categories"),
  saveAdminCategoryAttributes
);

// -------------------------
// PRODUCTS MANAGEMENT
// -------------------------
router.get(
  "/products",
  protectAdmin,
  requirePermission("manage_products"),
  getAdminProducts
);

router.get(
  "/products/:productId",
  protectAdmin,
  requirePermission("manage_products"),
  getAdminProductDetails
);

router.patch(
  "/products/status/:id",
  protectAdmin,
  requirePermission("manage_products"),
  toggleAdminProductAvailability
);

router.delete(
  "/products/:id",
  protectAdmin,
  requirePermission("manage_products"),
  deleteAdminProduct
);

// -------------------------
// ADMIN / SUB-ADMIN MANAGEMENT
// -------------------------
router.get(
  "/admins",
  protectAdmin,
  requirePermission("manage_admins"),
  getAllAdmins
);

router.post(
  "/admins",
  protectAdmin,
  requirePermission("manage_admins"),
  createAdminAccount
);

router.put(
  "/admins/:id",
  protectAdmin,
  requirePermission("manage_admins"),
  updateAdminAccount
);

router.delete(
  "/admins/:id",
  protectAdmin,
  requirePermission("manage_admins"),
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

// -------------------------
// SYSTEM SETTINGS
// -------------------------
router.get(
  "/settings",
  protectAdmin,
  requirePermission("system_settings"),
  getSystemSettings
);

router.put(
  "/settings",
  protectAdmin,
  requirePermission("system_settings"),
  updateSystemSettings
);

export default router;
