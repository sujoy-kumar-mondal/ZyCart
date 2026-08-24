import User from "../models/User.js";
import Product from "../models/Product.js";

/**
 * GET USER CART
 */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");

    res.json({
      success: true,
      cart: user.cart,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ADD TO CART
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const validQty = Math.max(1, parseInt(qty, 10) || 1);

    const product = await Product.findById(productId);
    if (!product || !product.isAvailable)
      return res.status(404).json({ success: false, message: "Product not available" });

    const maxAllowed = product.maxQuantityPerPurchase
      ? Math.min(product.stock, product.maxQuantityPerPurchase)
      : product.stock;

    const user = await User.findById(req.user._id);

    const existing = user.cart.find(
      (item) => item.product && (item.product._id?.toString() || item.product.toString()) === productId
    );

    if (existing) {
      const newQty = existing.qty + validQty;
      if (newQty > maxAllowed) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxAllowed} unit(s) allowed per purchase for this product.`,
        });
      }
      existing.qty = newQty;
    } else {
      if (validQty > maxAllowed) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxAllowed} unit(s) allowed per purchase for this product.`,
        });
      }
      user.cart.push({
        product: productId,
        qty: validQty,
      });
    }

    await user.save();

    res.json({
      success: true,
      message: "Added to cart",
      cart: user.cart,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * UPDATE CART ITEM
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const validQty = Math.max(1, parseInt(qty, 10) || 1);

    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      return res.status(404).json({ success: false, message: "Product not available" });
    }

    const maxAllowed = product.maxQuantityPerPurchase
      ? Math.min(product.stock, product.maxQuantityPerPurchase)
      : product.stock;

    if (validQty > maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxAllowed} unit(s) allowed per purchase for this product.`,
      });
    }

    const user = await User.findById(req.user._id);

    const item = user.cart.find(
      (i) => i.product && (i.product._id?.toString() || i.product.toString()) === productId
    );

    if (!item)
      return res.status(404).json({ success: false, message: "Item not found in cart" });

    item.qty = validQty;

    await user.save();

    res.json({ success: true, message: "Updated", cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * REMOVE ITEM
 */
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter((i) => i.product.toString() !== productId);

    await user.save();

    res.json({ success: true, message: "Item removed", cart: user.cart });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * CLEAR CART
 */
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ success: true, message: "Cart cleared" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
