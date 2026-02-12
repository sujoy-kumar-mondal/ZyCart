import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "./AuthProvider";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist on mount or when user changes
  useEffect(() => {
    if (user && user.role === "user") {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  // GET WISHLIST
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/wishlist");
      
      // Single source of truth: Extract products array from wishlist object
      let wishlistObj = res.data.wishlist;
      let products = [];
      
      // The backend returns { wishlist: { _id, user, products: [...] } }
      // Each product item is { product: { _id, title, images, price, stock... } }
      // We keep the structure as-is because components expect item.product
      if (wishlistObj && wishlistObj.products && Array.isArray(wishlistObj.products)) {
        products = wishlistObj.products;
      } else if (Array.isArray(wishlistObj)) {
        // If it's already an array
        products = wishlistObj;
      }
      setWishlist(products);
    } catch (error) {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // ADD TO WISHLIST
  const addToWishlist = async (product) => {
    try {
      const res = await axios.post("/wishlist/add", {
        productId: product._id,
      });
      
      // Extract products from wishlist object - same logic as fetch
      let wishlistObj = res.data.wishlist;
      let products = [];
      
      // The backend returns { wishlist: { _id, user, products: [...] } }
      // Each product item is { product: { _id, title, images, price, stock... } }
      // We keep the structure as-is because components expect item.product
      if (wishlistObj && wishlistObj.products && Array.isArray(wishlistObj.products)) {
        products = wishlistObj.products;
      } else if (Array.isArray(wishlistObj)) {
        products = wishlistObj;
      }
      setWishlist(products);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add to wishlist",
      };
    }
  };

  // REMOVE FROM WISHLIST
  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.post("/wishlist/remove", { productId });
      
      // Extract products from wishlist object - same logic as fetch
      let wishlistObj = res.data.wishlist;
      let products = [];
      
      // The backend returns { wishlist: { _id, user, products: [...] } }
      // Each product item is { product: { _id, title, images, price, stock... } }
      // We keep the structure as-is because components expect item.product
      if (wishlistObj && wishlistObj.products && Array.isArray(wishlistObj.products)) {
        products = wishlistObj.products;
      } else if (Array.isArray(wishlistObj)) {
        products = wishlistObj;
      }
      setWishlist(products);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to remove from wishlist" };
    }
  };

  // CHECK IF PRODUCT IN WISHLIST
  const isInWishlist = (productId) => {
    const idStr = productId?.toString() || "";
    return wishlist.some((item) => {
      const itemId = item.product?._id?.toString() || item.product?.toString?.() || "";
      return itemId === idStr;
    });
  };

  // CLEAR WISHLIST
  const clearWishlist = async () => {
    try {
      const res = await axios.post("/wishlist/clear");
      setWishlist([]);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
