import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// ----------------------------------------------------------
// SUPPLIER APPLY (Become a Partner)
// ----------------------------------------------------------
export const applySupplier = async (req, res) => {
  try {
    const {
      shopName,
      shopType,
      pan,
      aadhar,
      bankAccount,
      gst,
    } = req.body;

    if (
      !shopName ||
      !shopType ||
      !pan ||
      !aadhar ||
      !bankAccount ||
      !gst
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const licenseUrl = req.fileUrl || "";

    const supplier = await Supplier.create({
      shopName,
      shopType,
      pan,
      aadhar,
      bankAccount,
      gst,
      license: licenseUrl,
      owner: req.user._id,
      isApproved: false,
      isBanned: false,
    });

    // Update user role to pending-supplier (still "user" until admin approves)
    const user = await User.findById(req.user._id);
    user.supplierId = supplier._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Application submitted. Wait for admin approval.",
      supplier,
    });
  } catch (error) {
    console.error("Apply supplier error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// SUPPLIER DASHBOARD
// ----------------------------------------------------------
export const supplierDashboard = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;

    const totalProducts = await Product.countDocuments({ supplier: supplierId });

    const totalOrders = await Order.countDocuments({
      "childOrders.supplier": supplierId,
    });

    const pendingShipments = await Order.countDocuments({
      "childOrders.supplier": supplierId,
      "childOrders.status": { $ne: "Shipped" },
    });

    res.status(200).json({
      success: true,
      supplier: await Supplier.findById(supplierId),
      totalProducts,
      totalOrders,
      pendingShipments,
    });
  } catch (error) {
    console.error("Supplier dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// ADD PRODUCT
// ----------------------------------------------------------
export const addProduct = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;

    const { title, price, stock, description } = req.body;
    const imageUrl = req.fileUrl;

    if (!title || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "Title, price and stock are required.",
      });
    }

    const product = await Product.create({
      title,
      price,
      stock,
      description,
      images: imageUrl ? [imageUrl] : [],
      supplier: supplierId,
    });

    // Increase supplier product count
    await Supplier.findByIdAndUpdate(supplierId, { $inc: { totalProducts: 1 } });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE PRODUCT
// ----------------------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;
    const { id } = req.params;

    const { title, price, stock, description } = req.body;
    const newImage = req.fileUrl;

    const product = await Product.findOne({ _id: id, supplier: supplierId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.title = title || product.title;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.description = description || product.description;

    if (newImage) {
      product.images = [newImage]; // replace image
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// MARK PRODUCT AS UNAVAILABLE
// ----------------------------------------------------------
export const markUnavailable = async (req, res) => {
  try {
    const { id } = req.params;
    const supplierId = req.user.supplierId;

    const product = await Product.findOneAndUpdate(
      { _id: id, supplier: supplierId },
      { isAvailable: false },
      { new: true }
    );

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });

    res.status(200).json({
      success: true,
      message: "Product marked unavailable.",
    });
  } catch (error) {
    console.error("Unavailable error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET SUPPLIER PRODUCTS
// ----------------------------------------------------------
export const getSupplierProducts = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;

    const products = await Product.find({ supplier: supplierId });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET SUPPLIER CHILD ORDERS
// ----------------------------------------------------------
export const getSupplierOrders = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;

    const orders = await Order.find({
      "childOrders.supplier": supplierId,
    }).select("parentOrderNumber childOrders");

    // Filter only this supplier's child orders
    const filtered = [];

    orders.forEach((order) => {
      order.childOrders.forEach((child) => {
        if (child.supplier.toString() === supplierId.toString()) {
          filtered.push({
            _id: child._id,
            parentOrderId: order,
            items: child.items,
            amount: child.amount,
            status: child.status,
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      orders: filtered,
    });
  } catch (error) {
    console.error("Supplier orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE SUPPLIER CHILD ORDER STATUS
// ----------------------------------------------------------
export const updateChildOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // child order ID
    const { status } = req.body;
    const supplierId = req.user.supplierId;

    const order = await Order.findOne({
      "childOrders._id": id,
      "childOrders.supplier": supplierId,
    });

    if (!order)
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });

    // Update child order status
    const child = order.childOrders.id(id);
    child.status = status;

    await order.save();

    // After saving, check if all child orders shipped
    const allShipped = order.childOrders.every((c) => c.status === "Shipped");

    if (allShipped) {
      order.status = "Shipped";
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Update child order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
