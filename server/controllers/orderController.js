import Order from "../models/Order.js";
import Product from "../models/Product.js";
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
    // STEP 2: Group Items By Seller
    // --------------------------------------------
    const sellerGroups = {};

    for (const item of items) {
      const product = productMap[item.productId];
      const sellerId = product.seller.toString();

      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = [];
      }

      sellerGroups[sellerId].push({
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

    for (const [sellerId, groupItems] of Object.entries(sellerGroups)) {
      const childTotal = groupItems.reduce((a, b) => a + b.subtotal, 0);
      totalAmount += childTotal;

      childOrders.push({
        seller: sellerId,
        items: groupItems,
        amount: childTotal,
        status: "Pending",
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
      status: "Pending",
    });

    // --------------------------------------------
    // STEP 6: Stock will be reduced after payment confirmation
    // (See updateOrder function for payment confirmation logic)
    // DO NOT reduce stock here - only after payment succeeds
    // ----

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
      seller: c.seller,
      sellerAmount: c.amount * 0.8, // Seller gets 80%
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
      .populate("childOrders.seller", "shopName");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------------------------------------
// UPDATE ORDER (PAYMENT INFO & CONFIRMATION)
// ------------------------------------------------------------
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this order",
      });
    }

    // Update payment info
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      
      // If payment is confirmed/completed, finalize the order
      if (paymentStatus === "completed" || paymentStatus === "pending") {
        // Mark order as confirmed
        order.status = "Confirmed";
        
        // Update child order statuses
        for (let i = 0; i < order.childOrders.length; i++) {
          order.childOrders[i].status = "Confirmed";
        }
        
        // NOW reduce stock for all items
        for (const childOrder of order.childOrders) {
          for (const item of childOrder.items) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: -item.qty },
            });
          }
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------------------------------------
// GET ORDER DETAILS BY ID
// ------------------------------------------------------------
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate("user", "name email mobile")
      .populate("childOrders.seller", "shopName");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns this order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
