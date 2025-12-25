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
} from "../controllers/productController.js";


const router = express.Router();

// Get all available products (homepage)
router.get("/", getAllProductsHome);

router.get("/products", getAllProducts);

// Get single product by ID
router.get("/:id", getSingleProduct);

// Check stock before adding to cart
router.post("/check-stock", checkStock);

router.post("/update-trend-purchase", updateTrendPurchase);

router.post("/update-trend-view", updateTrendView);

// Get top trends
router.get("/trends/top-purchase", getTopPurchaseTrends);
router.get("/trends/top-views", getTopViewTrends);

export default router;
