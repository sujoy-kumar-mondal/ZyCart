import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// UPLOAD REVIEW IMAGE
export const uploadReviewImage = async (req, res) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ success: false, message: "Image upload failed" });
    }

    // req.fileUrl contains the Cloudinary secure_url from uploadSingle middleware
    return res.status(200).json({
      success: true,
      imageUrl: req.fileUrl,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error uploading image", error: err.message });
  }
};

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Validate title and comment
    if (!title || !comment) {
      return res.status(400).json({ success: false, message: "Title and comment are required" });
    }

    // Validate images array
    if (images && images.length > 3) {
      return res.status(400).json({ success: false, message: "Maximum 3 images allowed" });
    }

    // Verify order belongs to user and is delivered
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: This order is not yours" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ success: false, message: "Can only review delivered orders" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product" });
    }

    // Create review
    const review = new Review({
      product: productId,
      user: userId,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
      verifiedPurchase: true,
    });

    await review.save();

    // Populate user info
    await review.populate({
      path: "user",
      select: "name avatar",
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating review", error: err.message });
  }
};

// GET REVIEWS FOR A PRODUCT
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 5, sort = "-createdAt" } = req.query;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const skip = (page - 1) * limit;

    // Get reviews
    const reviews = await Review.find({ product: productId })
      .populate({
        path: "user",
        select: "name avatar",
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Review.countDocuments({ product: productId });

    // Calculate average rating
    const ratingAgg = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    const stats = ratingAgg[0] || { avgRating: 0, totalReviews: 0, ratingDistribution: [] };

    // Calculate rating breakdown
    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.ratingDistribution.forEach((rating) => {
      ratingBreakdown[rating]++;
    });

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        avgRating: stats.avgRating ? stats.avgRating.toFixed(1) : 0,
        totalReviews: stats.totalReviews,
        ratingBreakdown,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching reviews", error: err.message });
  }
};

// GET SINGLE REVIEW
export const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate([
      {
        path: "user",
        select: "name avatar",
      },
      {
        path: "product",
        select: "title images",
      },
    ]);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching review", error: err.message });
  }
};

// UPDATE REVIEW
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Verify user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You cannot edit this review" });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }

    if (title) review.title = title;
    if (comment) review.comment = comment;

    if (images) {
      if (images.length > 3) {
        return res.status(400).json({ success: false, message: "Maximum 3 images allowed" });
      }
      review.images = images;
    }

    await review.save();

    await review.populate({
      path: "user",
      select: "name avatar",
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating review", error: err.message });
  }
};

// DELETE REVIEW
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Verify user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You cannot delete this review" });
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error deleting review", error: err.message });
  }
};

// MARK REVIEW AS HELPFUL
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Check if user already marked this as helpful
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Check if user is in helpfulBy array
    if (review.helpfulBy.includes(userId)) {
      return res.status(400).json({ success: false, message: "You already marked this as helpful" });
    }

    // Add user to helpfulBy array and increment helpful count
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        $inc: { helpful: 1 },
        $push: { helpfulBy: userId }
      },
      { new: true }
    ).populate({
      path: "user",
      select: "name avatar",
    });

    return res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      review: updatedReview,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating review", error: err.message });
  }
};
