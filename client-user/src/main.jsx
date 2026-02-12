import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";

// Context Providers
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";
import { WishlistProvider } from "./context/WishlistProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
