import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const ProtectedRoute = ({ roles, children }) => {
  const { user, token } = useAuth();

  // 1️⃣ Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Role mismatch → redirect home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3️⃣ Passed all conditions → render page
  return children;
};

export default ProtectedRoute;
