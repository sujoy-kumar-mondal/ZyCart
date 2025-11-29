import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    // --------------------------------------
    // Shop Details
    // --------------------------------------
    shopName: {
      type: String,
      required: true,
    },

    shopType: {
      type: String,
      enum: [
        "Electronics & Accessories",
        "Fashion and Beauty",
        "Home and Kitchen",
        "Health and Fitness",
        "Books",
      ],
      required: true,
    },

    // --------------------------------------
    // KYC / Legal Info
    // --------------------------------------
    pan: {
      type: String,
      required: true,
    },

    aadhar: {
      type: String,
      required: true,
    },

    bankAccount: {
      type: String,
      required: true,
    },

    gst: {
      type: String,
      required: true,
    },

    license: {
      type: String, // Cloudinary URL
      default: "",
    },

    // --------------------------------------
    // Owner (User Reference)
    // --------------------------------------
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --------------------------------------
    // Status
    // --------------------------------------
    isApproved: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    // For dashboard (Total products)
    totalProducts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
