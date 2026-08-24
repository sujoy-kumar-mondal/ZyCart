import React from "react";
import { Wrench, AlertTriangle, RefreshCw, Mail, Phone, ShieldAlert, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const MaintenanceMode = ({ settings, onRefresh }) => {
  const platformName = settings?.platformName || "ZyCart";
  const message =
    settings?.maintenanceMode?.message ||
    "ZyCart is currently undergoing scheduled platform maintenance and system upgrades. We will be back online shortly!";
  const supportEmail = settings?.supportEmail || "support@zycart.com";
  const supportPhone = settings?.supportPhone || "+91 98765 43210";

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Background Animated Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl shadow-black/80 space-y-8 relative z-10 text-center"
      >
        
        {/* Animated Maintenance Icon Badge */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-xl shadow-orange-500/20 flex items-center justify-center mx-auto">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <Wrench className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Header Texts */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Scheduled System Maintenance
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {platformName} is Under Maintenance
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Live Status Info Box */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-left space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Platform Upgrades in Progress
            </span>
            <span className="text-slate-400 font-mono">Status: Offline</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Our engineering team is actively upgrading marketplace infrastructure to enhance your shopping experience. All existing orders and transactions are safely stored.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => {
              if (onRefresh) onRefresh();
              window.location.reload();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Check System Status
          </button>
        </div>

        {/* Support Channels Footer */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>{supportEmail}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{supportPhone}</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default MaintenanceMode;
