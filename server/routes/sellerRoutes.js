import express from "express";
import { protectSeller } from "../middleware/authMiddleware.js";
import upload, { uploadSingle, uploadMultiple } from "../middleware/upload.js";

import {
  sellerDashboard,
  addProduct,
  updateProduct,
  markUnavailable,
  markAvailable,
  deleteProduct,
  getSellerProducts,
  getSellerOrders,
  getSellerOrderDetails,
  updateChildOrderStatus,
  getSeller,
  getSellerProfile,
  updateSellerProfile,
} from "../controllers/sellerController.js";

const router = express.Router();

// ==================================================
// SELLER DASHBOARD
// ==================================================
router.get("/dashboard", protectSeller, sellerDashboard);

// ----------------------------------------------
// ADD PRODUCT
// ----------------------------------------------
router.post(
  "/products",
  protectSeller,
  upload.array("images", 5),
  uploadMultiple("products", 5),
  addProduct
);

// ----------------------------------------------
// UPDATE PRODUCT
// ----------------------------------------------
router.put(
  "/products/:id",
  protectSeller,
  upload.array("images", 5),
  uploadMultiple("products", 5),
  updateProduct
);

// ----------------------------------------------
// MARK PRODUCT UNAVAILABLE
// ----------------------------------------------
router.patch(
  "/products/unavailable/:id",
  protectSeller,
  markUnavailable
);

// ----------------------------------------------
// MARK PRODUCT AVAILABLE
// ----------------------------------------------
router.patch(
  "/products/available/:id",
  protectSeller,
  markAvailable
);

// ----------------------------------------------
// DELETE PRODUCT
// ----------------------------------------------
router.delete(
  "/products/:id",
  protectSeller,
  deleteProduct
);

// ----------------------------------------------
// GET SELLER PRODUCTS
// ----------------------------------------------
router.get(
  "/products",
  protectSeller,
  getSellerProducts
);

// ----------------------------------------------
// GET SELLER ORDERS
// ----------------------------------------------
router.get(
  "/orders",
  protectSeller,
  getSellerOrders
);

// ----------------------------------------------
// GET SELLER ORDER DETAILS BY ID
// ----------------------------------------------
router.get(
  "/orders/:orderId",
  protectSeller,
  getSellerOrderDetails
);

// ----------------------------------------------
// UPDATE CHILD ORDER STATUS
// ----------------------------------------------
router.patch(
  "/orders/status/:id",
  protectSeller,
  updateChildOrderStatus
);

// ----------------------------------------------
// GET SELLER PROFILE
// ----------------------------------------------
router.get(
  "/profile",
  protectSeller,
  getSellerProfile
);

// ----------------------------------------------
// UPDATE SELLER PROFILE
// ----------------------------------------------
router.put(
  "/profile",
  protectSeller,
  updateSellerProfile
);

// ----------------------------------------------
// GET SELLER BY ID (Public) - Must be LAST!
// ----------------------------------------------
router.get("/:id", getSeller);

export default router;
