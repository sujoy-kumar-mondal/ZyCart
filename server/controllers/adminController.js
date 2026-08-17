import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Admin from "../models/Admin.js";

// ------------------------------------------------------------
// ADMIN DASHBOARD
// ------------------------------------------------------------
export const getAdminDashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const sellers = await Seller.countDocuments();
    const orders = await Order.countDocuments();
    const pendingDeliveries = await Order.countDocuments({
      status: { $ne: "Delivered" }
    });

    res.status(200).json({
      success: true,
      users,
      sellers,
      orders,
      pendingDeliveries
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ----------------------------------------------------------
// GET ALL USERS
// ----------------------------------------------------------
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// BAN USER
// ----------------------------------------------------------
export const banUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBanned: true });

    res.status(200).json({
      success: true,
      message: "User banned successfully",
    });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UNBAN USER
// ----------------------------------------------------------
export const unbanUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBanned: false });

    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
    });
  } catch (error) {
    console.error("Unban user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ALL SELLERS
// ----------------------------------------------------------
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password -otp");

    res.status(200).json({
      success: true,
      sellers,
    });
  } catch (error) {
    console.error("Get sellers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// APPROVE SELLER
// ----------------------------------------------------------
export const approveSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });

    seller.isApproved = true;
    seller.isBanned = false;
    seller.approvalDate = new Date();

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller approved successfully",
      seller,
    });
  } catch (error) {
    console.error("Approve seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// BAN SELLER + Mark products unavailable
// ----------------------------------------------------------
export const banSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });

    seller.isBanned = true;
    seller.isApproved = false;

    await seller.save();

    // Mark all products unavailable
    await Product.updateMany(
      { seller: sellerId },
      { isAvailable: false }
    );

    res.status(200).json({
      success: true,
      message: "Seller banned & products marked unavailable",
    });
  } catch (error) {
    console.error("Ban seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UNBAN SELLER (needs re-approval)
// ----------------------------------------------------------
export const unbanSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller)
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });

    seller.isBanned = false;
    // Still admin must APPROVE manually
    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller unbanned. Must be approved again.",
    });
  } catch (error) {
    console.error("Unban seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ALL PARENT ORDERS (Admin Dashboard)
// ----------------------------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("childOrders.seller", "shopName")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE PARENT ORDER STATUS
// Only Admin controls:
// Shipped → Out for Delivery → Delivered
// ----------------------------------------------------------
export const updateParentOrderStatus = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(parentId);

    if (!order)
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });

    order.status = status;
    const now = new Date();
    if (status === "Confirmed" && !order.confirmedAt) order.confirmedAt = now;
    if (status === "Packed" && !order.packedAt) order.packedAt = now;
    if (status === "Shipped" && !order.shippedAt) order.shippedAt = now;
    if (status === "Out for Delivery" && !order.outForDeliveryAt) order.outForDeliveryAt = now;
    if (status === "Delivered") {
      if (!order.deliveredAt) order.deliveredAt = now;
      order.paymentStatus = "completed";
    }
    if (status === "Cancelled" && !order.cancelledAt) order.cancelledAt = now;

    // Also update all child orders if parent status changed
    order.childOrders.forEach((child) => {
      child.status = status;
      if (status === "Confirmed" && !child.confirmedAt) child.confirmedAt = now;
      if (status === "Packed" && !child.packedAt) child.packedAt = now;
      if (status === "Shipped" && !child.shippedAt) child.shippedAt = now;
      if (status === "Out for Delivery" && !child.outForDeliveryAt) child.outForDeliveryAt = now;
      if (status === "Delivered" && !child.deliveredAt) child.deliveredAt = now;
      if (status === "Cancelled" && !child.cancelledAt) child.cancelledAt = now;
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN PROFILE
// ----------------------------------------------------------
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.userId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE ADMIN PROFILE
// ----------------------------------------------------------
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, mobile, address } = req.body;

    const updated = await Admin.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        mobile,
        ...(address && { address }),
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      admin: updated,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN ORDER DETAILS BY ID
// ----------------------------------------------------------
export const getAdminOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email mobile")
      .populate("childOrders.seller", "shopName email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get admin order details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN USER DETAILS BY ID
// ----------------------------------------------------------
export const getAdminUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -otp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user orders
    const orders = await Order.find({ user: userId })
      .select("parentOrderNumber status totalAmount createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        addresses: user.addresses,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        orders,
      },
    });
  } catch (error) {
    console.error("Get admin user details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN SELLER DETAILS BY ID
// ----------------------------------------------------------
export const getAdminSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId).select("-password -otp");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Get seller products
    const products = await Product.find({ seller: sellerId }).select("title price stock discount discountedPrice discountPeriod images description mainCategory subCategory subSubCategory attributes maxQuantityPerPurchase");

    const sellerObj = seller.toObject();

    res.status(200).json({
      success: true,
      seller: {
        ...sellerObj,
        products,
        totalProducts: products.length,
      },
    });
  } catch (error) {
    console.error("Get admin seller details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// DELETE USER
// ----------------------------------------------------------
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// SUPER ADMIN MANAGEMENT CONTROLLERS
// ============================================================

// 1. GET ALL ADMINS (Super Admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const isStrongPassword = (pwd) => {
  if (!pwd || pwd.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  return hasUpper && hasLower && hasNumber && hasSymbol;
};

// 2. CREATE NEW ADMIN ACCOUNT (Super Admin only)
export const createAdminAccount = async (req, res) => {
  try {
    const { name, email, password, mobile, role, permissions } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and mobile number are required.",
      });
    }

    if (!/^[0-9]{10}$/.test(String(mobile).trim())) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be a valid 10-digit number.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
      });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An admin account with this email already exists.",
      });
    }

    const adminRole = role === "super_admin" ? "super_admin" : "admin";

    const newAdmin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password,
      mobile: String(mobile).trim(),
      role: adminRole,
      permissions: permissions || ["manage_users", "manage_sellers"],
      isActive: true,
    });

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. UPDATE ADMIN ACCOUNT (Super Admin only)
export const updateAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role, permissions, isActive, password } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (mobile !== undefined) {
      if (!mobile || !/^[0-9]{10}$/.test(String(mobile).trim())) {
        return res.status(400).json({
          success: false,
          message: "Mobile number must be a valid 10-digit number.",
        });
      }
      admin.mobile = String(mobile).trim();
    }

    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
        });
      }
      admin.password = password; // pre('save') will hash it automatically
    }

    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (role && ["super_admin", "admin"].includes(role)) admin.role = role;
    if (Array.isArray(permissions)) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. DELETE ADMIN ACCOUNT (Super Admin only)
export const deleteAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Admin account deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
