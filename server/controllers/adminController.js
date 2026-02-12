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
    const products = await Product.find({ seller: sellerId }).select("title price stock");

    res.status(200).json({
      success: true,
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        mobile: seller.mobile,
        shopName: seller.shopName,
        shopType: seller.shopType,
        pan: seller.pan,
        aadhar: seller.aadhar,
        gst: seller.gst,
        isApproved: seller.isApproved,
        isBanned: seller.isBanned,
        createdAt: seller.createdAt,
        products,
        totalProducts: products.length,
      },
    });
  } catch (error) {
    console.error("Get admin seller details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
