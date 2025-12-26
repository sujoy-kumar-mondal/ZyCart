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
      setWishlist(res.data.wishlist.products || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
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

      setWishlist(res.data.wishlist.products || []);
      return { success: true };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
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
      setWishlist(res.data.wishlist.products || []);
      return { success: true };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return { success: false };
    }
  };

  // CHECK IF PRODUCT IN WISHLIST
  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) => item.product?._id === productId || item.product === productId
    );
  };

  // CLEAR WISHLIST
  const clearWishlist = async () => {
    try {
      const res = await axios.post("/wishlist/clear");
      setWishlist([]);
      return { success: true };
    } catch (error) {
      console.error("Error clearing wishlist:", error);
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
