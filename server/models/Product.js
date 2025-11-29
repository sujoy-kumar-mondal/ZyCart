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
    // Supplier Link
    // --------------------------------------
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    // --------------------------------------
    // Availability (used when supplier banned)
    // --------------------------------------
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
