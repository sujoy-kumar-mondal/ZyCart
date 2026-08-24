import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";

const ProtectedRoute = ({ children, permission }) => {
  const { user, token } = useAuth();

  // Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role & permission
  const isSuperAdmin = user?.role === "super_admin";
  const hasPermission = !permission || isSuperAdmin || (Array.isArray(user?.permissions) && user.permissions.includes(permission));

  if (!hasPermission) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 text-center space-y-5 animate-in fade-in zoom-in duration-150">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Your administrator account does not possess the required <span className="font-bold text-red-600 px-2 py-0.5 rounded-lg bg-red-50 border border-red-100">'{permission}'</span> permission flag to access this operational module.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F87171] via-[#EF4444] to-[#E11D48] hover:from-[#EF4444] hover:to-[#BE123C] text-white text-xs font-black shadow-lg shadow-red-500/20 transition active:scale-95 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Passed all conditions → render page
  return children;
};

export default ProtectedRoute;
