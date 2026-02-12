import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // --------------------------------------
    // Product Info
    // --------------------------------------
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    // --------------------------------------
    // Image (Cloudinary URL)
    // --------------------------------------
    images: {
      type: [String],
      default: [],
    },

    // --------------------------------------
    // Seller Link
    // --------------------------------------
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    // --------------------------------------
    // Availability (used when seller banned)
    // --------------------------------------
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // --------------------------------------
    // Categories
    // --------------------------------------
    mainCategory: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    subSubCategory: {
      type: String,
      required: true,
    },

    // --------------------------------------
    // Attributes (flexible object based on category)
    // --------------------------------------
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // --------------------------------------
    // Discount Information
    // --------------------------------------
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountPeriod: {
      type: Date,
      default: null,
    },

    // --------------------------------------
    // Purchase Limit
    // --------------------------------------
    maxQuantityPerPurchase: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
