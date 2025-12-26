import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// GET USER WISHLIST
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products.product"
    );

    if (!wishlist) {
      return res.status(200).json({ wishlist: { products: [] } });
    }

    res.status(200).json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error });
  }
};

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        user: userId,
        products: [{ product: productId }],
      });
    } else {
      // Check if product already in wishlist
      const existingProduct = wishlist.products.find(
        (item) => item.product.toString() === productId
      );

      if (existingProduct) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      // Add product to wishlist
      wishlist.products.push({ product: productId });
    }

    await wishlist.save();
    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist", error });
  }
};

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();
    res
      .status(200)
      .json({ message: "Product removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist", error });
  }
};

// CHECK IF PRODUCT IN WISHLIST
export const isProductInWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(200).json({ inWishlist: false });
    }

    const isInWishlist = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    res.status(200).json({ inWishlist: isInWishlist });
  } catch (error) {
    res.status(500).json({ message: "Error checking wishlist", error });
  }
};

// CLEAR WISHLIST
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({ message: "Wishlist cleared", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error clearing wishlist", error });
  }
};
