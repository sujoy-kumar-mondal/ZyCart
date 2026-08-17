import mongoose from "mongoose";

// --------------------------------------
// CHILD ORDER SCHEMA (Seller-Level)
// --------------------------------------
const childOrderSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        title: String,
        qty: Number,
        price: Number,
        subtotal: Number,
      },
    ],

    amount: {
      type: Number,
      required: true,
    },

    // Status: Pending → Confirmed → Packed → Shipped → Out for Delivery → Delivered → Cancelled
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    placedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    packedAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// --------------------------------------
// PARENT ORDER SCHEMA (User-Level)
// --------------------------------------
const parentOrderSchema = new mongoose.Schema(
  {
    parentOrderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // FIXED: Address should be an OBJECT, not string
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    childOrders: [childOrderSchema],

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Confirmed",
    },

    placedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    packedAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // Payment Information
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "wallet", "emi"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", parentOrderSchema);
export default Order;
