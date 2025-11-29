import User from "../models/User.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ------------------------------------------------------------
// ADMIN DASHBOARD
// ------------------------------------------------------------
export const getAdminDashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const suppliers = await Supplier.countDocuments();
    const orders = await Order.countDocuments();
    const pendingDeliveries = await Order.countDocuments({
      status: { $ne: "Delivered" }
    });

    res.status(200).json({
      success: true,
      users,
      suppliers,
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
// GET ALL SUPPLIERS
// ----------------------------------------------------------
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().populate("owner", "name email");

    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// APPROVE SUPPLIER
// ----------------------------------------------------------
export const approveSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findById(supplierId);

    if (!supplier)
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });

    supplier.isApproved = true;
    supplier.isBanned = false;

    await supplier.save();

    // Update user role → supplier
    await User.findByIdAndUpdate(supplier.owner, {
      role: "supplier",
      supplierId: supplier._id,
    });

    res.status(200).json({
      success: true,
      message: "Supplier approved successfully",
    });
  } catch (error) {
    console.error("Approve supplier error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// BAN SUPPLIER + Mark products unavailable
// ----------------------------------------------------------
export const banSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findById(supplierId);

    if (!supplier)
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });

    supplier.isBanned = true;
    supplier.isApproved = false;

    await supplier.save();

    // Mark all products unavailable
    await Product.updateMany(
      { supplier: supplierId },
      { isAvailable: false }
    );

    res.status(200).json({
      success: true,
      message: "Supplier banned & products marked unavailable",
    });
  } catch (error) {
    console.error("Ban supplier error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UNBAN SUPPLIER (needs re-approval)
// ----------------------------------------------------------
export const unbanSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier)
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });

    supplier.isBanned = false;
    // Still admin must APPROVE manually
    await supplier.save();

    res.status(200).json({
      success: true,
      message: "Supplier unbanned. Must be approved again.",
    });
  } catch (error) {
    console.error("Unban supplier error:", error);
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
      .populate("childOrders.supplier", "shopName")
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
