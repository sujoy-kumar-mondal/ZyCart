import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  });
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user") || sessionStorage.getItem("user");
    return u && u !== "undefined" ? JSON.parse(u) : null;
  });

  // ------------------------------------------------------
  // Save login data
  // ------------------------------------------------------
  const login = (data, rememberMe = true) => {
    const { token, user } = data;

    setToken(token);
    setUser(user);

    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // ------------------------------------------------------
  // Logout user
  // ------------------------------------------------------
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("cart");
  };

  // ------------------------------------------------------
  // Attach token to axios headers
  // ------------------------------------------------------
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
