import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "./AuthProvider";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  });

  // =====================================================
  // 1) SYNC CART FROM DATABASE AFTER LOGIN
  // =====================================================
  useEffect(() => {
    if (!user || user.role !== "user") return;  // ⛔ block for admin/seller

    const fetchUserCart = async () => {
      try {
        const res = await axios.get("/cart");

        const formatted = res.data.cart.map((item) => ({
          productId: item.product._id,
          title: item.product.title,
          price: Number(item.product.price),
          stock: Number(item.product.stock),
          qty: Number(item.qty),
          image: item.product.images?.[0] || "",
        }));

        setCartItems(formatted);
        localStorage.setItem("cart", JSON.stringify(formatted));
      } catch (err) {
      }
    };

    fetchUserCart();
  }, [user]);


  // =====================================================
  // 2) SAVE CART TO LOCAL STORAGE
  // =====================================================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // =====================================================
  // 3) ADD ITEM TO CART + Sync DB if logged in
  // =====================================================
  const addToCart = async (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);

      if (existing) {
        const newQty = existing.qty + qty;
        if (newQty > product.stock) {
          alert(`Only ${product.stock} left!`);
          return prev;
        }

        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: newQty } : i
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          stock: product.stock,
          qty,
          image: product.images?.[0] || "",
        },
      ];
    });

    // ---- Sync with DB if logged in ----
    if (user) {
      try {
        await axios.post("/cart/add", {
          productId: product._id,
          qty,
        });
      } catch (err) {
      }
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
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.min(qty, item.stock) }
          : item
      )
    );

    if (user) {
      try {
        await axios.patch(`/cart/update/${productId}`, { qty });
      } catch (err) {
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
