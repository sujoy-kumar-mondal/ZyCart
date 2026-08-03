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
import { protectUser } from "../middleware/authMiddleware.js";
import upload, { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

// UPLOAD REVIEW IMAGE (Protected)
router.post("/upload-image", protectUser, upload.single("file"), uploadSingle("review_images"), uploadReviewImage);

// CREATE REVIEW (Protected)
router.post("/", protectUser, createReview);

// GET REVIEWS FOR A PRODUCT (Public)
router.get("/product/:productId", getProductReviews);

// GET SINGLE REVIEW (Public)
router.get("/:reviewId", getReview);

// UPDATE REVIEW (Protected)
router.put("/:reviewId", protectUser, updateReview);

// DELETE REVIEW (Protected)
router.delete("/:reviewId", protectUser, deleteReview);

// MARK AS HELPFUL (Protected)
router.post("/:reviewId/helpful", protectUser, markHelpful);

export default router;
