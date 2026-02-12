import express from "express";
import {
  createReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  markHelpful,
  uploadReviewImage,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload, { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

// UPLOAD REVIEW IMAGE (Protected)
router.post("/upload-image", protect, upload.single("file"), uploadSingle("review_images"), uploadReviewImage);

// CREATE REVIEW (Protected)
router.post("/", protect, createReview);

// GET REVIEWS FOR A PRODUCT (Public)
router.get("/product/:productId", getProductReviews);

// GET SINGLE REVIEW (Public)
router.get("/:reviewId", getReview);

// UPDATE REVIEW (Protected)
router.put("/:reviewId", protect, updateReview);

// DELETE REVIEW (Protected)
router.delete("/:reviewId", protect, deleteReview);

// MARK AS HELPFUL (Protected)
router.post("/:reviewId/helpful", protect, markHelpful);

export default router;
