import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderTree,
  Package,
  Sparkles,
  AlertTriangle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [mainCategoriesList, setMainCategoriesList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    mainCategoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCat, setSelectedMainCat] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    mainCategory: "",
    subCategory: "",
    subSubCategory: "",
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedMainCat !== "all") params.mainCategory = selectedMainCat;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const res = await axios.get("/admin/categories", { params });
      if (res.data.success) {
        setCategories(res.data.categories || []);
        setStats(res.data.stats || { total: 0, active: 0, inactive: 0, mainCategoriesCount: 0 });
        setMainCategoriesList(res.data.mainCategories || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Categories | ZyCart Admin";
    fetchCategories();
  }, [selectedMainCat, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleOpenAddModal = () => {
    setFormData({
      mainCategory: "",
      subCategory: "",
      subSubCategory: "",
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      mainCategory: cat.mainCategory,
      subCategory: cat.subCategory,
      subSubCategory: cat.subSubCategory,
      isActive: cat.isActive,
    });
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (cat) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mainCategory.trim() || !formData.subCategory.trim() || !formData.subSubCategory.trim()) {
      return toast.error("All category levels are required.");
    }

    setSubmitting(true);
    try {
      const res = await axios.post("/admin/categories", formData);
      if (res.data.success) {
        toast.success("Category created successfully!");
        setShowAddModal(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mainCategory.trim() || !formData.subCategory.trim() || !formData.subSubCategory.trim()) {
      return toast.error("All category levels are required.");
    }

    setSubmitting(true);
    try {
      const res = await axios.put(`/admin/categories/${selectedCategory._id}`, formData);
      if (res.data.success) {
        toast.success("Category updated successfully!");
        setShowEditModal(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const updatedStatus = !cat.isActive;
      const res = await axios.put(`/admin/categories/${cat._id}`, {
        isActive: updatedStatus,
      });
      if (res.data.success) {
        toast.success(`Category ${updatedStatus ? "Activated" : "Deactivated"}!`);
        setCategories((prev) =>
          prev.map((item) => (item._id === cat._id ? { ...item, isActive: updatedStatus } : item))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      const res = await axios.delete(`/admin/categories/${selectedCategory._id}`);
      if (res.data.success) {
        toast.success("Category deleted successfully!");
        setShowDeleteModal(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1B2A41] via-[#243B5A] to-[#3F51F4] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <FolderTree className="w-3.5 h-3.5 text-blue-300" /> Taxonomy & Catalog Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Manage Product Categories
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium">
              Create, organize, and moderate the 3-tier catalog taxonomy hierarchy used by merchants and customers across ZyCart.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-3 rounded-2xl bg-white text-[#1B2A41] font-black text-sm shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#3F51F4]" /> Add New Category
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Categories</span>
              <Layers className="w-4 h-4 text-[#3F51F4]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#1B2A41]">{stats.total}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Active catalog paths</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Main Departments</span>
              <FolderTree className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.mainCategoriesCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Top-level categories</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Status</span>
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-600">{stats.active}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Visible to merchants</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Inactive / Hidden</span>
              <XCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.inactive}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Archived pathways</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search category, subcategory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Department:</span>
              <select
                value={selectedMainCat}
                onChange={(e) => setSelectedMainCat(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {mainCategoriesList.map((main) => (
                  <option key={main} value={main}>
                    {main}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={fetchCategories}
              title="Refresh List"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-800">No categories found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No taxonomy paths match your active search filters. Try adjusting your query or click Add New Category.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Main Department</th>
                    <th className="py-4 px-6">Sub-Category</th>
                    <th className="py-4 px-6">Sub-Sub Category (Leaf)</th>
                    <th className="py-4 px-6 text-center">Linked Products</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50/60 transition-colors group">
                      
                      {/* Main Category */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-[#3F51F4] font-extrabold border border-blue-100/80">
                          <Layers className="w-3.5 h-3.5" />
                          {cat.mainCategory}
                        </span>
                      </td>

                      {/* Sub-Category */}
                      <td className="py-4 px-6 text-slate-700 font-bold">
                        <div className="flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          {cat.subCategory}
                        </div>
                      </td>

                      {/* Sub-Sub Category */}
                      <td className="py-4 px-6 text-slate-900 font-extrabold">
                        {cat.subSubCategory}
                      </td>

                      {/* Linked Products Count */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          <Package className="w-3 h-3 text-slate-400" />
                          {cat.productCount || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                            cat.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {cat.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-[#3F51F4] hover:border-blue-200 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDeleteModal(cat)}
                          title="Delete Category"
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* ADD CATEGORY MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3F51F4] flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1B2A41]">Add New Category</h3>
                    <p className="text-xs text-slate-500 font-semibold">Define a new 3-tier catalog branch</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Main Category (Department) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="mainCategoryList"
                    placeholder="e.g. Electronics, Fashion, Home & Kitchen"
                    value={formData.mainCategory}
                    onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                  <datalist id="mainCategoryList">
                    {mainCategoriesList.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Sub-Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mobiles & Accessories, Footwear"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Sub-Sub Category (Leaf Level) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smartphones, Casual Shoes, Smartwatches"
                    value={formData.subSubCategory}
                    onChange={(e) => setFormData({ ...formData, subSubCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#3F51F4] accent-[#3F51F4]"
                    />
                    <span className="text-xs font-bold text-slate-700">Make active immediately</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/3 py-3 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-3 rounded-2xl font-black text-white text-xs bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] shadow-md hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Save Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* EDIT CATEGORY MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3F51F4] flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1B2A41]">Edit Category</h3>
                    <p className="text-xs text-slate-500 font-semibold">Modify category details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Main Category (Department) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mainCategory}
                    onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Sub-Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Sub-Sub Category (Leaf Level) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subSubCategory}
                    onChange={(e) => setFormData({ ...formData, subSubCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#3F51F4] accent-[#3F51F4]"
                    />
                    <span className="text-xs font-bold text-slate-700">Category Active Status</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-1/3 py-3 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-3 rounded-2xl font-black text-white text-xs bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] shadow-md hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Updating..." : "Update Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showDeleteModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#1B2A41]">Delete Category Branch?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to permanently remove{" "}
                  <span className="font-bold text-slate-800">
                    "{selectedCategory.mainCategory} &gt; {selectedCategory.subCategory} &gt; {selectedCategory.subSubCategory}"
                  </span>
                  ?
                </p>

                {selectedCategory.productCount > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold text-left flex items-start gap-2 mt-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Warning: {selectedCategory.productCount} active product(s) are currently categorized under this pathway.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 py-3 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={submitting}
                  className="w-1/2 py-3 rounded-2xl font-black text-white text-xs bg-red-600 hover:bg-red-700 shadow-md hover:shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminCategories;
