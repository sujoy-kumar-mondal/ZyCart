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

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const user = await User.findById(req.user._id);

    const existing = user.cart.find((item) => item.product.toString() === productId);

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, product.stock);
    } else {
      user.cart.push({
        product: productId,
        qty: Math.min(qty, product.stock),
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

    const product = await Product.findById(productId);
    const user = await User.findById(req.user._id);

    const item = user.cart.find((i) => i.product.toString() === productId);

    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });

    item.qty = Math.min(qty, product.stock);

    await user.save();

    res.json({ success: true, message: "Updated", cart: user.cart });
  } catch {
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
