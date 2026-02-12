import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
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
      required: true,
    },

    // Address
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },

    // Admin Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Permissions / Roles
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_sellers",
          "manage_orders",
          "manage_products",
          "manage_categories",
          "view_analytics",
          "system_settings",
        ],
        default: "manage_users",
      },
    ],

    // Audit Trail
    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// -----------------------------------------------
// Password Hashing Before Save
// -----------------------------------------------
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// -----------------------------------------------
// Compare Password
// -----------------------------------------------
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
