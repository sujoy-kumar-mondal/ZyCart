import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u && u !== "undefined" ? JSON.parse(u) : null;
  });

  // ------------------------------------------------------
  // Save login data
  // ------------------------------------------------------
  const login = (data) => {
    const { token, user } = data;

    setToken(token);
    setUser(user);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // ------------------------------------------------------
  // Logout user
  // ------------------------------------------------------
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart")
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
