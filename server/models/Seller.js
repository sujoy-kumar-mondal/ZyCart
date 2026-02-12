import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const sellerSchema = new mongoose.Schema(
  {
    // -----------------------------------------------
    // Authentication & Account Details
    // -----------------------------------------------
    name: {
      type: String,
      default: "",
      // Required only when registrationStatus is 'completed'
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    mobile: {
      type: String,
      default: "",
      // Required only when registrationStatus is 'completed'
    },

    password: {
      type: String,
      default: "",
      // Required only when registrationStatus is 'completed'
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
    // Registration Status (track multi-step process)
    // -----------------------------------------------
    registrationStatus: {
      type: String,
      enum: ["step1", "step2", "completed"],
      default: "step1",
      // step1: Email OTP sent, awaiting verification
      // step2: Basic info (name, mobile, password) filled
      // completed: All business details submitted and verified
    },

    // -----------------------------------------------
    // Shop Information
    // -----------------------------------------------
    shopName: {
      type: String,
      default: "",
      // Required only when registrationStatus is 'completed'
    },

    shopType: {
      type: String,
      enum: [
        "",
        "Electronics & Accessories",
        "Fashion and Beauty",
        "Home and Kitchen",
        "Health and Fitness",
        "Books",
      ],
      default: "",
      // Required only when registrationStatus is 'completed'
    },

    shopBanner: {
      type: String, // Cloudinary URL
      default: "",
    },

    // -----------------------------------------------
    // Business & Legal Information
    // -----------------------------------------------
    pan: {
      type: String,
      default: "",
      sparse: true, // Allows multiple empty values before completion
      // Required only when registrationStatus is 'completed'
    },

    aadhar: {
      type: String,
      default: "",
      sparse: true,
      // Required only when registrationStatus is 'completed'
    },

    bankAccount: {
      type: String,
      default: "",
      // Required only when registrationStatus is 'completed'
    },

    gst: {
      type: String,
      default: "",
      sparse: true,
      // Required only when registrationStatus is 'completed'
    },

    license: {
      type: String, // Cloudinary URL
      default: "",
    },

    // -----------------------------------------------
    // Seller Address
    // -----------------------------------------------
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },

    // -----------------------------------------------
    // Approval & Status
    // -----------------------------------------------
    isApproved: {
      type: Boolean,
      default: false,
    },

    approvalDate: {
      type: Date,
      default: null,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Reason if rejected/banned
    rejectionReason: {
      type: String,
      default: "",
    },

    // -----------------------------------------------
    // Dashboard Stats
    // -----------------------------------------------
    totalProducts: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // -----------------------------------------------
    // Analytics & Tracking
    // -----------------------------------------------
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// -----------------------------------------------
// Custom Validation: Ensure required fields when completed
// -----------------------------------------------
sellerSchema.pre("save", function (next) {
  // Only validate when registration is completed
  if (this.registrationStatus === "completed") {
    const missingFields = [];
    
    // Step 2 fields (filled in verifySellerOtpAndRegister)
    if (!this.name) missingFields.push("name");
    if (!this.mobile) missingFields.push("mobile");
    if (!this.password) missingFields.push("password");
    
    // Step 3 fields (filled in submitSellerDetails)
    if (!this.shopName) missingFields.push("shopName");
    if (!this.shopType) missingFields.push("shopType");
    if (!this.pan) missingFields.push("pan");
    if (!this.aadhar) missingFields.push("aadhar");
    if (!this.bankAccount) missingFields.push("bankAccount");
    if (!this.gst) missingFields.push("gst");
    
    if (missingFields.length > 0) {
      return next(new Error(`Cannot complete registration: missing required fields: ${missingFields.join(", ")}`));
    }
  }
  
  next();
});

// -----------------------------------------------
// Password Hashing Before Save
// -----------------------------------------------
sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// -----------------------------------------------
// Compare Password
// -----------------------------------------------
sellerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
