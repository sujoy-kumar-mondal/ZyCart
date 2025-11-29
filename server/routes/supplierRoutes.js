import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload, { uploadSingle } from "../middleware/upload.js";

import {
  applySupplier,
  supplierDashboard,
  addProduct,
  updateProduct,
  markUnavailable,
  getSupplierProducts,
  getSupplierOrders,
  updateChildOrderStatus,
} from "../controllers/supplierController.js";

const router = express.Router();

// ----------------------------------------------
// SUPPLIER APPLICATION (USER → SUPPLIER REQUEST)
// ----------------------------------------------
router.post(
  "/apply",
  protect,
  upload.single("license"),
  uploadSingle("supplier_licenses"),
  applySupplier
);

// ----------------------------------------------
// SUPPLIER DASHBOARD
// ----------------------------------------------
router.get("/dashboard", protect, authorize("supplier"), supplierDashboard);

// ----------------------------------------------
// ADD PRODUCT
// ----------------------------------------------
router.post(
  "/products",
  protect,
  authorize("supplier"),
  upload.single("image"),
  uploadSingle("products"),   // ✅ FIXED
  addProduct
);

// ----------------------------------------------
// UPDATE PRODUCT
// ----------------------------------------------
router.put(
  "/products/:id",
  protect,
  authorize("supplier"),
  upload.single("image"),
  uploadSingle("products"),   // ✅ FIXED
  updateProduct
);

// ----------------------------------------------
// MARK PRODUCT UNAVAILABLE
// ----------------------------------------------
router.patch(
  "/products/unavailable/:id",
  protect,
  authorize("supplier"),
  markUnavailable
);

// ----------------------------------------------
// GET SUPPLIER PRODUCTS
// ----------------------------------------------
router.get(
  "/products",
  protect,
  authorize("supplier"),
  getSupplierProducts
);

// ----------------------------------------------
// GET SUPPLIER ORDERS
// ----------------------------------------------
router.get(
  "/orders",
  protect,
  authorize("supplier"),
  getSupplierOrders
);

// ----------------------------------------------
// UPDATE CHILD ORDER STATUS
// ----------------------------------------------
router.patch(
  "/orders/status/:id",
  protect,
  authorize("supplier"),
  updateChildOrderStatus
);

export default router;
