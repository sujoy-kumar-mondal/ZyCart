import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Trend from "../models/Trend.js";
import Category from "../models/Category.js";
import { getMainCategories, getSubCategories, getSubSubCategories, getAttributesForCategory } from "../utils/categories.js";

// ----------------------------------------------------------
// GET ALL PRODUCTS (Homepage)
// ----------------------------------------------------------
// Only show products where:
// 1. isAvailable = true
// 2. Seller is approved AND NOT banned
// ----------------------------------------------------------
export const getAllProductsHome = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "isApproved isBanned shopName");

    // Filter: hide products of banned/unapproved sellers
    const filtered = products.filter(
      (p) => p.seller?.isApproved && !p.seller?.isBanned
    );

    res.status(200).json({
      success: true,
      products: filtered,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const {
      search = "",
      mainCategory = "",
      subCategory = "",
      subSubCategory = "",
      brand = "",
      sort = "",
      page = 1,
      limit = 12,
      min = 0,
      max = 9999999,
      filters = {},
    } = req.query;

    const query = {
      price: { $gte: Number(min), $lte: Number(max) }
    };

    if (search) query.title = { $regex: search, $options: "i" };
    if (mainCategory) query.mainCategory = mainCategory;
    if (subCategory) query.subCategory = subCategory;
    if (subSubCategory) query.subSubCategory = subSubCategory;
    if (brand) query.brand = { $regex: brand, $options: "i" };

    // Handle dynamic attribute filters
    if (filters && typeof filters === 'object') {
      Object.keys(filters).forEach(key => {
        if (Array.isArray(filters[key]) && filters[key].length > 0) {
          query[`attributes.${key}`] = { $in: filters[key] };
        }
      });
    }
    if (brand) query.brand = { $regex: brand, $options: "i" };

    let sortQuery = {};

    if (sort === "low-high") sortQuery.price = 1;
    if (sort === "high-low") sortQuery.price = -1;
    if (sort === "newest") sortQuery.createdAt = -1;
    if (sort === "oldest") sortQuery.createdAt = 1;
    if (sort === "name-asc") sortQuery.title = 1;
    if (sort === "name-desc") sortQuery.title = -1;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ----------------------------------------------------------
// GET SINGLE PRODUCT BY ID
// ----------------------------------------------------------
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "shopName isApproved isBanned"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    // Hide products from banned/unapproved sellers
    if (!product.seller.isApproved || product.seller.isBanned) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get single product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// STOCK VALIDATION FOR CART
// ----------------------------------------------------------
// Checks before adding to cart:
// If stock = 6 → user cannot add > 6
// ----------------------------------------------------------
export const checkStock = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    const product = await Product.findById(productId);

    if (!product || !product.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Product unavailable",
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock valid",
    });
  } catch (error) {
    console.error("Stock check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateTrendPurchase = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const trend = await Trend.findOneAndUpdate(
      { product: productId },
      { $inc: { noOfPurchase: quantity } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Purchase count updated",
      trend,
    });

  } catch (error) {
    console.error("updateTrendPurchase error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update purchase trend",
    });
  }
};

export const updateTrendView = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?._id; // Get user ID from auth

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if user has already viewed this product
    const trend = await Trend.findOne({ product: productId });
    
    let shouldIncrement = false;
    if (!trend) {
      // First view ever
      shouldIncrement = true;
    } else if (userId && !trend.viewers.includes(userId)) {
      // User hasn't viewed this product before
      shouldIncrement = true;
    }

    // Update trend with new view count and add user to viewers
    const updateData = shouldIncrement 
      ? { $inc: { noOfViews: 1 } }
      : {};
    
    if (userId && shouldIncrement) {
      updateData.$addToSet = { viewers: userId };
    } else if (userId && !shouldIncrement) {
      // User has already viewed, but still ensure they're in the viewers array
      updateData.$addToSet = { viewers: userId };
    }

    const updatedTrend = await Trend.findOneAndUpdate(
      { product: productId },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "View count updated",
      trend: updatedTrend,
    });

  } catch (error) {
    console.error("updateTrendView error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update view trend",
    });
  }
};

export const getTopPurchaseTrends = async (req, res) => {
  try {
    const trends = await Trend.find()
      .populate({
        path: "product",
        populate: { path: "seller", select: "isApproved isBanned shopName" },
      })
      .sort({ noOfPurchase: -1 })
      .limit(10);

    const filtered = trends.filter(
      (t) => t.product?.isAvailable && t.product?.seller?.isApproved && !t.product?.seller?.isBanned
    );

    res.status(200).json({
      success: true,
      trends: filtered,
    });
  } catch (error) {
    console.error("Get top purchase trends error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTopViewTrends = async (req, res) => {
  try {
    const trends = await Trend.find()
      .populate({
        path: "product",
        populate: { path: "seller", select: "isApproved isBanned shopName" },
      })
      .sort({ noOfViews: -1 })
      .limit(10);

    const filtered = trends.filter(
      (t) => t.product?.isAvailable && t.product?.seller?.isApproved && !t.product?.seller?.isBanned
    );

    res.status(200).json({
      success: true,
      trends: filtered,
    });
  } catch (error) {
    console.error("Get top view trends error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// CATEGORY FUNCTIONS
// ----------------------------------------------------------
export const getCategories = async (req, res) => {
  try {
    const mainCategories = getMainCategories();
    res.status(200).json({
      success: true,
      categories: mainCategories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubCategoriesRoute = async (req, res) => {
  try {
    const { main } = req.params;
    const subCategories = getSubCategories(main);
    res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.error("Get sub categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubSubCategoriesRoute = async (req, res) => {
  try {
    const { main, sub } = req.params;
    const subSubCategories = getSubSubCategories(main, sub);
    res.status(200).json({
      success: true,
      subSubCategories,
    });
  } catch (error) {
    console.error("Get sub sub categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAttributes = async (req, res) => {
  try {
    const { main, sub, subsub } = req.params;
    console.log("🔍 Attributes request:", { main, sub, subsub });
    const attributes = await getAttributesForCategory(main, sub, subsub);
    console.log("📋 Returned attributes:", attributes);
    res.status(200).json({
      success: true,
      attributes,
    });
  } catch (error) {
    console.error("Get attributes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper for tokenizing and cleaning title / search query
const extractMeaningfulTokens = (text) => {
  if (!text) return [];
  const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, " ").toLowerCase();
  const rawTokens = cleaned.split(/\s+/).filter((t) => t.length > 1);

  const stopWords = new Set([
    "for", "and", "the", "with", "in", "of", "to", "a", "an", "by", "on", "at",
    "pack", "combo", "set", "piece", "pieces", "black", "white", "blue", "red", "green", "color",
    "new", "latest", "best", "top", "premium", "original", "gen", "pro", "max", "plus", "ultra"
  ]);

  const meaningful = [];
  for (const token of rawTokens) {
    if (!stopWords.has(token) && !/^\d+$/.test(token)) {
      meaningful.push(token);
    }
  }

  for (const token of rawTokens) {
    if (["men", "women", "kids", "boys", "girls"].includes(token)) {
      meaningful.push(token);
    }
  }

  return Array.from(new Set(meaningful));
};

const SYNONYMS = {
  watch: ["watch", "watches", "timepiece", "analog", "analogue", "dial", "smartwatch", "wrist"],
  watches: ["watch", "watches", "timepiece", "analog", "analogue", "dial", "smartwatch", "wrist"],
  analog: ["analog", "analogue", "dial", "wrist", "watch", "watches"],
  analogue: ["analog", "analogue", "dial", "wrist", "watch", "watches"],
  smartwatch: ["smartwatch", "smart", "watch", "wearable", "band"],
  phone: ["phone", "mobile", "smartphone", "cellphone"],
  mobile: ["mobile", "phone", "smartphone", "cellphone"],
  smartphone: ["smartphone", "mobile", "phone"],
  iphone: ["iphone", "mobile", "smartphone", "apple"],
  shoe: ["shoe", "shoes", "footwear", "sneaker", "sneakers", "boots", "sandals", "slippers"],
  shoes: ["shoe", "shoes", "footwear", "sneaker", "sneakers", "boots", "sandals", "slippers"],
  sneaker: ["sneaker", "sneakers", "shoe", "shoes", "footwear"],
  sneakers: ["sneaker", "sneakers", "shoe", "shoes", "footwear"],
  shirt: ["shirt", "shirts", "tshirt", "t-shirt", "topwear", "clothing", "apparel"],
  tshirt: ["tshirt", "t-shirt", "shirt", "topwear", "clothing"],
  tshirts: ["tshirt", "t-shirt", "shirt", "topwear", "clothing"],
  laptop: ["laptop", "laptops", "notebook", "computer", "pc"],
  earphone: ["earphone", "earphones", "earbuds", "headphone", "headphones", "headset", "audio"],
  earbuds: ["earbuds", "earphone", "earphones", "headphone", "headphones", "headset", "audio", "tws"],
  headphone: ["headphone", "headphones", "headset", "earphone", "audio"],
  dress: ["dress", "dresses", "gown", "clothing", "women"],
  jeans: ["jeans", "denim", "pants", "trousers", "bottomwear"],
  pant: ["pant", "pants", "trousers", "bottomwear", "jeans"],
  bag: ["bag", "bags", "backpack", "handbag", "luggage", "wallet"],
  wallet: ["wallet", "wallets", "purse", "accessories", "leather"],
  perfume: ["perfume", "fragrance", "deodorant", "cologne", "body mist", "beauty"],
  camera: ["camera", "cameras", "dslr", "lens", "photography"],
  television: ["television", "tv", "smart tv", "led tv", "display"],
  tv: ["tv", "television", "smart tv", "led tv"],
};

const scorePathway = (cat, queryStr, tokens) => {
  let score = 0;
  const mainLower = (cat.mainCategory || "").toLowerCase();
  const subLower = (cat.subCategory || "").toLowerCase();
  const subSubLower = (cat.subSubCategory || "").toLowerCase();

  const queryLower = queryStr.toLowerCase();

  // 1. Direct whole phrase or substring match
  if (queryLower.includes(subSubLower)) score += 100;
  if (subSubLower.includes(queryLower)) score += 80;
  if (queryLower.includes(subLower)) score += 50;
  if (subLower.includes(queryLower)) score += 40;

  // 2. Token matches with synonym expansion
  tokens.forEach((token) => {
    const related = new Set([token]);
    if (token.endsWith("es")) related.add(token.slice(0, -2));
    if (token.endsWith("s")) related.add(token.slice(0, -1));
    if (SYNONYMS[token]) SYNONYMS[token].forEach((syn) => related.add(syn));

    related.forEach((term) => {
      // SubSubCategory (Product Type)
      if (subSubLower === term) {
        score += 60;
      } else if (subSubLower.split(/\s+/).includes(term)) {
        score += 45;
      } else if (subSubLower.includes(term)) {
        score += 30;
      }

      // SubCategory
      if (subLower === term) {
        score += 35;
      } else if (subLower.split(/\s+/).includes(term)) {
        score += 25;
      } else if (subLower.includes(term)) {
        score += 15;
      }

      // MainCategory
      if (mainLower.includes(term)) {
        score += 10;
      }
    });
  });

  return score;
};

// Search category pathways across 3 tiers with title pasted NLP ranking
export const searchCategoryPathways = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, count: 0, results: [] });
    }

    const rawQuery = q.trim();
    const tokens = extractMeaningfulTokens(rawQuery);

    const categories = await Category.find({ isActive: true });

    const scored = categories
      .map((cat) => {
        const score = scorePathway(cat, rawQuery, tokens);
        return {
          _id: cat._id,
          mainCategory: cat.mainCategory,
          subCategory: cat.subCategory,
          subSubCategory: cat.subSubCategory,
          path: `${cat.mainCategory} > ${cat.subCategory} > ${cat.subSubCategory}`,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);

    res.status(200).json({
      success: true,
      count: scored.length,
      results: scored,
    });
  } catch (error) {
    console.error("Search category pathways error:", error);
    res.status(500).json({ success: false, message: "Server error searching categories" });
  }
};

// Get all category pathways
export const getAllCategoryPathways = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      mainCategory: 1,
      subCategory: 1,
      subSubCategory: 1,
    });

    const results = categories.map((cat) => ({
      _id: cat._id,
      mainCategory: cat.mainCategory,
      subCategory: cat.subCategory,
      subSubCategory: cat.subSubCategory,
      path: `${cat.mainCategory} > ${cat.subCategory} > ${cat.subSubCategory}`,
    }));

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Get all category pathways error:", error);
    res.status(500).json({ success: false, message: "Server error fetching category pathways" });
  }
};