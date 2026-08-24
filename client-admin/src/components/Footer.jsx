import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Cpu, Lock, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const userUrl = import.meta.env.VITE_USER_URL || "http://localhost:5173";
  const sellerUrl = import.meta.env.VITE_SELLER_URL || "http://localhost:5174";

  return (
    <footer className="bg-black text-slate-400 py-16 mt-20 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* System Operations Status Bar */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-500 border border-red-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">Platform Health: Operational</p>
              <p className="text-xs text-slate-400 font-semibold">256-bit encrypted administrative channel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={userUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-extrabold transition flex items-center gap-1.5"
            >
              Shopper Portal <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
            </a>

            <a
              href={sellerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-extrabold transition flex items-center gap-1.5"
            >
              Merchant Portal <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>
        </div>

        {/* Multi-column Nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-6 h-6 text-red-500" />
              <span className="text-xl font-black tracking-tight">ZyCart Admin</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Enterprise management suite for multi-seller operations, merchant approvals, customer support, and financial order auditing.
            </p>
          </div>

          {/* Core Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Core Operations</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition">Executive Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/sellers" className="hover:text-white transition">Merchant Verification &amp; Approval</Link>
              </li>
              <li>
                <Link to="/admin/users" className="hover:text-white transition">Customer Accounts &amp; Ban Control</Link>
              </li>
              <li>
                <Link to="/admin/orders" className="hover:text-white transition">Global Order Audits</Link>
              </li>
            </ul>
          </div>

          {/* Sub-Admin Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Role &amp; Permissions</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/admin/admins" className="hover:text-white transition">Sub-Admin Directory</Link>
              </li>
              <li>
                <Link to="/admin/profile" className="hover:text-white transition">Admin Profile &amp; Role</Link>
              </li>
              <li>
                <Link to="/changepassword" className="hover:text-white transition">Security Credentials</Link>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Security &amp; Audit</h4>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Lock className="w-3.5 h-3.5 text-blue-400" /> Granular Access Control
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Sub-admin actions are audited and subject to role-based permission checks.
              </p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8 text-center text-xs font-semibold text-slate-500">
          © {new Date().getFullYear()} ZyCart Operations Central. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
