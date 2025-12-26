import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import { updateAddressOnOrder } from "./userController.js";

// ------------------------------------------------------------
// PLACE ORDER (MAIN FUNCTION)
// ------------------------------------------------------------
export const placeOrder = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order.",
      });
    }

    // --------------------------------------------
    // STEP 1: Validate Stock & Prepare Items
    // --------------------------------------------
    const productMap = {};
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isAvailable)
        return res.status(400).json({
          success: false,
          message: "Some products are unavailable.",
        });

      if (item.qty > product.stock)
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} available for ${product.title}`,
        });

      productMap[item.productId] = product;
    }

    // --------------------------------------------
    // STEP 2: Group Items By Supplier
    // --------------------------------------------
    const supplierGroups = {};

    for (const item of items) {
      const product = productMap[item.productId];
      const supplierId = product.supplier.toString();

      if (!supplierGroups[supplierId]) {
        supplierGroups[supplierId] = [];
      }

      supplierGroups[supplierId].push({
        productId: product._id,
        title: product.title,
        price: product.price,
        qty: item.qty,
        subtotal: product.price * item.qty,
      });
    }

    // --------------------------------------------
    // STEP 3: Build Child Orders
    // --------------------------------------------
    const childOrders = [];

    let totalAmount = 0;

    for (const [supplierId, groupItems] of Object.entries(supplierGroups)) {
      const childTotal = groupItems.reduce((a, b) => a + b.subtotal, 0);
      totalAmount += childTotal;

      childOrders.push({
        supplier: supplierId,
        items: groupItems,
        amount: childTotal,
        status: "Confirmed",
      });
    }

    // --------------------------------------------
    // STEP 4: Generate Unique Parent Order Number
    // --------------------------------------------
    const parentOrderNumber =
      "ZYCART-" + Date.now() + "-" + Math.floor(Math.random() * 9999);

    // --------------------------------------------
    // STEP 5: Create Parent Order
    // --------------------------------------------
    const order = await Order.create({
      parentOrderNumber,
      user: userId,
      address,
      totalAmount,
      childOrders,
      status: "Confirmed",
    });

    // --------------------------------------------
    // STEP 6: Reduce Stock
    // --------------------------------------------
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty },
      });
    }

    // --------------------------------------------
    // STEP 7: Save Address to User if First Time
    // --------------------------------------------
    const userHasAddress = req.user.address?.line1;
    if (!userHasAddress && address) {
      await updateAddressOnOrder(userId, address);
    }

    // --------------------------------------------
    // STEP 8: Profit Sharing (4 : 1)
    // --------------------------------------------
    const profitDetails = childOrders.map((c) => ({
      supplier: c.supplier,
      supplierAmount: c.amount * 0.8, // Supplier gets 80%
      platformAmount: c.amount * 0.2, // Platform gets 20%
    }));

    // You can store profitDetails in DB if needed.

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      profitDetails,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------------------------------------
// GET USER ORDERS
// ------------------------------------------------------------
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("childOrders.supplier", "shopName");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("User orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
