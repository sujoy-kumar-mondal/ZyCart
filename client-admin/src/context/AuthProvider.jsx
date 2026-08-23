import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u && u !== "undefined" ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

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
    localStorage.removeItem("cart");
  };

  // ------------------------------------------------------
  // Refresh current user profile & permissions from DB
  // ------------------------------------------------------
  const refreshUser = useCallback(async () => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) return null;

    try {
      setLoading(true);
      const res = await axios.get("/admin/profile", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.data.success && res.data.admin) {
        const freshAdmin = res.data.admin;
        if (freshAdmin.isActive === false) {
          logout();
          return null;
        }
        setUser(freshAdmin);
        localStorage.setItem("user", JSON.stringify(freshAdmin));
        return freshAdmin;
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, [token]);

  // ------------------------------------------------------
  // Attach token to axios headers and fetch latest profile on mount
  // ------------------------------------------------------
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      refreshUser();
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token, refreshUser]);

  const value = {
    user,
    token,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
