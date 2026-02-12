import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
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

    // -----------------------------------------------
    // OTP System (for registration & password reset)
    // -----------------------------------------------
    otp: {
      type: String,
      default: "",
    },
    otpExpires: {
      type: Date,
    },

    // -----------------------------------------------
    // Address (for orders & shipping)
    // -----------------------------------------------
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },

    // -----------------------------------------------
    // Account Status
    // -----------------------------------------------
    isBanned: {
      type: Boolean,
      default: false,
    },

    // -----------------------------------------------
    // Shopping Cart
    // -----------------------------------------------
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
