import express from "express";
import {
  getAllProducts,
  getAllProductsHome,
  getSingleProduct,
  checkStock,
  updateTrendPurchase,
  updateTrendView,
  getTopPurchaseTrends,
  getTopViewTrends,
  getCategories,
  getSubCategoriesRoute,
  getSubSubCategoriesRoute,
  getAttributes,
} from "../controllers/productController.js";


const router = express.Router();

// Get all available products (homepage)
router.get("/", getAllProductsHome);

router.get("/products", getAllProducts);

// Check stock before adding to cart
router.post("/check-stock", checkStock);

router.post("/update-trend-purchase", updateTrendPurchase);

router.post("/update-trend-view", updateTrendView);

// Get top trends
router.get("/trends/top-purchase", getTopPurchaseTrends);
router.get("/trends/top-views", getTopViewTrends);

// Category routes (MUST come before /:id to avoid matching "categories" as an ID)
router.get("/categories", getCategories);
router.get("/categories/:main", getSubCategoriesRoute);
router.get("/categories/:main/:sub", getSubSubCategoriesRoute);
router.get("/categories/:main/:sub/:subsub/attributes", getAttributes);

// Get single product by ID (this should be LAST to avoid matching other routes)
router.get("/:id", getSingleProduct);

export default router;
