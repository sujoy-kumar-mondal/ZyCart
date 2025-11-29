import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    mobile: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      default: "",
    },

    // --------------------------------------
    // ROLE: user | supplier | admin
    // --------------------------------------
    role: {
      type: String,
      enum: ["user", "supplier", "admin"],
      default: "user",
    },

    // --------------------------------------
    // OTP System
    // --------------------------------------
    otp: {
      type: String,
      default: "",
    },
    otpExpires: {
      type: Date,
    },

    // --------------------------------------
    // ADDRESS (added when first order)
    // --------------------------------------
    address: {
      type: String,
      default: "",
    },

    // --------------------------------------
    // BAN SYSTEM
    // --------------------------------------
    isBanned: {
      type: Boolean,
      default: false,
    },

    // --------------------------------------
    // Supplier reference (if user becomes supplier)
    // --------------------------------------
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

// --------------------------------------
// Password Hashing Before Save
// --------------------------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// --------------------------------------
// Compare Password
// --------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
