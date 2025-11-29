import express from "express";
import {
  getAllProducts,
  getAllProductsHome,
  getSingleProduct,
  checkStock,
} from "../controllers/productController.js";

const router = express.Router();

// Get all available products (homepage)
router.get("/", getAllProductsHome);

router.get("/products", getAllProducts);

// Get single product by ID
router.get("/:id", getSingleProduct);

// Check stock before adding to cart
router.post("/check-stock", checkStock);

export default router;
