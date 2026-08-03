import express from "express";
import {
  getAttributesByCategory,
  getFilterableAttributes,
  getRequiredAttributes,
  getAllCategoriesWithAttributes,
  getAttributeStats,
  validateProductAttributes,
} from "../controllers/attributeController.js";

const router = express.Router();

// ----------------------------------------------------------
// GET ATTRIBUTES FOR CATEGORIES
// ----------------------------------------------------------

// GET attributes for a specific category
// GET /api/attributes/category/:mainCategory/:subCategory/:subSubCategory
router.get(
  "/category/:mainCategory/:subCategory/:subSubCategory",
  getAttributesByCategory
);

// GET only filterable attributes
// GET /api/attributes/filterable/:mainCategory/:subCategory/:subSubCategory
router.get(
  "/filterable/:mainCategory/:subCategory/:subSubCategory",
  getFilterableAttributes
);

// GET only required attributes
// GET /api/attributes/required/:mainCategory/:subCategory/:subSubCategory
router.get(
  "/required/:mainCategory/:subCategory/:subSubCategory",
  getRequiredAttributes
);

// GET all categories with attribute counts
// GET /api/attributes/all
router.get("/all", getAllCategoriesWithAttributes);

// GET attribute statistics
// GET /api/attributes/stats
router.get("/stats", getAttributeStats);

// POST validate product attributes
// POST /api/attributes/validate
router.post("/validate", validateProductAttributes);

// ============================================================
// ADMIN ONLY ROUTES (Keep for future reference)
// ============================================================

// Note: Additional admin routes for creating/updating/deleting
// attributes can be added here in the future

export default router;
