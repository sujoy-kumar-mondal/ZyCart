import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "./AuthProvider";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    const u = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!u || u === "undefined") return [];
    const data = localStorage.getItem("cart") || sessionStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  });

  const getEffectivePrice = (product) => {
    if (!product) return 0;
    const hasDiscount =
      product.discount > 0 &&
      (!product.discountPeriod || new Date(product.discountPeriod) > new Date());
    if (!hasDiscount) return Number(product.price);
    if (product.discountedPrice && product.discountedPrice > 0) {
      return Number(product.discountedPrice);
    }
    return Math.round(product.price * (1 - product.discount / 100));
  };

  // =====================================================
  // 1) SYNC CART FROM DATABASE AFTER LOGIN
  // =====================================================
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cart");
      return;
    }

    const fetchUserCart = async () => {
      try {
        const res = await axios.get("/cart");

        const formatted = res.data.cart.map((item) => ({
          productId: item.product._id,
          title: item.product.title,
          price: getEffectivePrice(item.product),
          originalPrice: Number(item.product.price),
          discount: item.product.discount || 0,
          stock: Number(item.product.stock),
          maxQuantityPerPurchase: item.product.maxQuantityPerPurchase || item.product.stock,
          qty: Number(item.qty),
          image: item.product.images?.[0] || "",
        }));

        setCartItems(formatted);
        if (localStorage.getItem("user")) {
          localStorage.setItem("cart", JSON.stringify(formatted));
        } else {
          sessionStorage.setItem("cart", JSON.stringify(formatted));
        }
      } catch (err) {
      }
    };

    fetchUserCart();
  }, [user]);


  // =====================================================
  // 2) SAVE CART TO STORAGE
  // =====================================================
  useEffect(() => {
    if (user) {
      if (localStorage.getItem("user")) {
        localStorage.setItem("cart", JSON.stringify(cartItems));
        sessionStorage.removeItem("cart");
      } else {
        sessionStorage.setItem("cart", JSON.stringify(cartItems));
        localStorage.removeItem("cart");
      }
    } else {
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cart");
    }
  }, [cartItems, user]);

  // =====================================================
  // 3) ADD ITEM TO CART + Sync DB if logged in
  // =====================================================
  const addToCart = async (product, qty = 1) => {
    if (!user) {
      return { success: false, requireLogin: true };
    }

    const maxAllowed = product.maxQuantityPerPurchase
      ? Math.min(product.stock, product.maxQuantityPerPurchase)
      : product.stock;

    let canProceed = true;
    const effectivePrice = getEffectivePrice(product);

    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);

      if (existing) {
        const newQty = existing.qty + qty;
        if (newQty > maxAllowed) {
          canProceed = false;
          return prev;
        }

        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: newQty, price: effectivePrice, maxQuantityPerPurchase: maxAllowed } : i
        );
      }

      if (qty > maxAllowed) {
        canProceed = false;
        return prev;
      }

      return [
        ...prev,
        {
          productId: product._id,
          title: product.title,
          price: effectivePrice,
          originalPrice: Number(product.price),
          discount: product.discount || 0,
          stock: product.stock,
          maxQuantityPerPurchase: maxAllowed,
          qty,
          image: product.images?.[0] || "",
        },
      ];
    });

    if (!canProceed) return { success: false, message: `Maximum ${maxAllowed} allowed` };

    // ---- Sync with DB ----
    try {
      await axios.post("/cart/add", {
        productId: product._id,
        qty,
      });
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update cart in database.");
      return { success: false };
    }
  };

  // =====================================================
  // 4) REMOVE ITEM
  // =====================================================
  const removeFromCart = async (productId) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));

    if (user) {
      try {
        await axios.delete(`/cart/remove/${productId}`);
      } catch (err) {
      }
    }
  };

  // =====================================================
  // 5) UPDATE QUANTITY
  // =====================================================
  const updateQty = async (productId, qty) => {
    let finalQty = qty;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const maxAllowed = Math.min(item.stock, item.maxQuantityPerPurchase || item.stock);
          if (qty > maxAllowed) {
            finalQty = maxAllowed;
            return { ...item, qty: maxAllowed };
          }
          return { ...item, qty: Math.max(1, qty) };
        }
        return item;
      })
    );

    if (user) {
      try {
        await axios.patch(`/cart/update/${productId}`, { qty: finalQty });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update quantity.");
      }
    }
  };

  // =====================================================
  // 6) CLEAR CART
  // =====================================================
  const clearCart = async () => {
    setCartItems([]);

    if (user) {
      try {
        await axios.delete("/cart/clear");
      } catch (err) {
      }
    }
  };

  // =====================================================
  // 7) SUMMARY VALUES
  // =====================================================
  const totalItems = cartItems.length; // Number of unique products
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0); // Total quantity
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalQuantity,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
