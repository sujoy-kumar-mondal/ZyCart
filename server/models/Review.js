import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Product being reviewed
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // User who gave the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order ID for verification (must be delivered)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Review description
    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // Images (up to 3, Cloudinary URLs)
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 3;
        },
        message: "Maximum 3 images allowed per review",
      },
    },

    // Helpful votes - track count and users who marked helpful
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // Verified purchase
    verifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, strictPopulate: false }
);

// Index for finding reviews by product
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // One review per user per product

const Review = mongoose.model("Review", reviewSchema);
export default Review;
