import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { ChevronDown, Search, Filter, X, PlusCircle, Edit, Trash2, Eye, EyeOff, Package, Tag, Calendar } from "lucide-react";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStockStatus, setFilterStockStatus] = useState("all");

  // Form States
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    mainCategory: "",
    subCategory: "",
    subSubCategory: "",
    attributes: {},
    images: [],
    discountedPrice: "",
    discount: "",
    discountPeriod: "",
    maxQuantityPerPurchase: ""
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleRemoveImage = (indexToRemove) => {
    const newPreviews = imagePreviews.filter((_, idx) => idx !== indexToRemove);
    const newImages = (form.images || []).filter((_, idx) => idx !== indexToRemove);
    setImagePreviews(newPreviews);
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updatedPreviews = [...imagePreviews];
    const [draggedPreview] = updatedPreviews.splice(draggedIndex, 1);
    updatedPreviews.splice(dropIndex, 0, draggedPreview);
    setImagePreviews(updatedPreviews);

    const updatedImages = [...(form.images || [])];
    const [draggedImage] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(dropIndex, 0, draggedImage);
    setForm((prev) => ({ ...prev, images: updatedImages }));

    setDraggedIndex(null);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [attributesSchema, setAttributesSchema] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/seller/products");
      setProducts(res.data.products || []);
      setFilteredProducts(res.data.products || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/products/categories");
      setCategories(res.data.categories || []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((p) =>
        filterStatus === "available" ? p.isAvailable : !p.isAvailable
      );
    }

    if (filterStockStatus !== "all") {
      filtered = filtered.filter((p) =>
        filterStockStatus === "instock" ? p.stock > 0 : p.stock === 0
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return a.price - b.price;
        case "priceHigh":
          return b.price - a.price;
        case "stockHigh":
          return b.stock - a.stock;
        case "stockLow":
          return a.stock - b.stock;
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, sortBy, filterStatus, filterStockStatus]);

  const location = useLocation();

  useEffect(() => {
    if (products.length > 0 && location.state?.editProductId) {
      const prodToEdit = products.find((p) => p._id === location.state.editProductId);
      if (prodToEdit) {
        handleEdit(prodToEdit);
      }
    }
  }, [products, location.state]);

  const handleMainCategoryChange = async (mainCat) => {
    setForm({ ...form, mainCategory: mainCat, subCategory: "", subSubCategory: "", attributes: {} });
    setAttributesSchema({});

    if (mainCat) {
      try {
        const res = await axios.get(`/products/categories/${encodeURIComponent(mainCat)}`);
        setSubCategories(res.data.subCategories || []);
      } catch (error) {
        setSubCategories([]);
      }
    } else {
      setSubCategories([]);
    }
    setSubSubCategories([]);
  };

  const handleSubCategoryChange = async (subCat) => {
    const mainCat = form.mainCategory;
    setForm({ ...form, subCategory: subCat, subSubCategory: "", attributes: {} });
    setAttributesSchema({});

    if (mainCat && subCat) {
      try {
        const res = await axios.get(`/products/categories/${encodeURIComponent(mainCat)}/${encodeURIComponent(subCat)}`);
        setSubSubCategories(res.data.subSubCategories || []);
      } catch (error) {
        setSubSubCategories([]);
      }
    } else {
      setSubSubCategories([]);
    }
  };

  const handleSubSubCategoryChange = async (subSubCat) => {
    const { mainCategory, subCategory } = form;
    setForm({ ...form, subSubCategory: subSubCat, attributes: {} });

    if (mainCategory && subCategory && subSubCat) {
      try {
        const url = `/products/categories/${encodeURIComponent(mainCategory)}/${encodeURIComponent(subCategory)}/${encodeURIComponent(subSubCat)}/attributes`;
        const res = await axios.get(url);
        setAttributesSchema(res.data.attributes || {});
      } catch (error) {
        setAttributesSchema({});
      }
    } else {
      setAttributesSchema({});
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      const selectedFiles = Array.from(files);
      const currentImages = form.images || [];
      const combined = [...currentImages, ...selectedFiles].slice(0, 10);
      setForm((prev) => ({ ...prev, images: combined }));

      const previews = combined.map((file) => {
        if (typeof file === "string") return Promise.resolve(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
        });
      });

      Promise.all(previews).then(setImagePreviews);
    } else if (name === "discountedPrice" || name === "price" || name === "discount") {
      setForm((prev) => {
        const newForm = { ...prev, [name]: value };
        const priceNum = parseFloat(name === "price" ? value : prev.price);
        const discPriceNum = parseFloat(name === "discountedPrice" ? value : (name === "price" ? prev.discountedPrice : newForm.discountedPrice));
        const discNum = parseFloat(name === "discount" ? value : (name === "price" ? prev.discount : newForm.discount));

        if (name === "discountedPrice") {
          if (priceNum > 0 && discPriceNum > 0 && discPriceNum < priceNum) {
            const calcDiscount = Math.round(((priceNum - discPriceNum) / priceNum) * 100);
            newForm.discount = calcDiscount > 0 ? calcDiscount : "";
          } else if (!value) {
            newForm.discount = "";
          }
        } else if (name === "discount") {
          if (priceNum > 0 && discNum > 0 && discNum <= 100) {
            const calcDiscPrice = Math.floor(priceNum * (1 - discNum / 100));
            newForm.discountedPrice = calcDiscPrice > 0 ? calcDiscPrice : "";
          } else if (!value) {
            newForm.discountedPrice = "";
          }
        } else if (name === "price") {
          if (priceNum > 0 && discPriceNum > 0 && discPriceNum < priceNum) {
            const calcDiscount = Math.round(((priceNum - discPriceNum) / priceNum) * 100);
            newForm.discount = calcDiscount > 0 ? calcDiscount : "";
          } else if (priceNum > 0 && discNum > 0 && discNum <= 100) {
            const calcDiscPrice = Math.floor(priceNum * (1 - discNum / 100));
            newForm.discountedPrice = calcDiscPrice > 0 ? calcDiscPrice : "";
          }
        }

        return newForm;
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAttributeChange = (attrKey, value) => {
    setForm({ ...form, attributes: { ...form.attributes, [attrKey]: value } });
  };

  const handleAdd = async () => {
    if (!form.title || !form.price || !form.stock || !form.mainCategory || !form.subCategory || !form.subSubCategory) {
      toast.error("Title, price, stock, and all categories are required!");
      return;
    }

    const parsedStock = parseInt(form.stock);
    const parsedMaxQty = parseInt(form.maxQuantityPerPurchase);

    if (!form.maxQuantityPerPurchase || isNaN(parsedMaxQty) || parsedMaxQty < 1 || parsedMaxQty > 25) {
      toast.error("Max Quantity Per Purchase must be between 1 and 25!");
      return;
    }

    if (parsedMaxQty >= parsedStock) {
      toast.error("Max Quantity Per Purchase must be less than Stock Quantity!");
      return;
    }

    if (form.images.length < 2) {
      toast.error("At least 2 product images must be uploaded!");
      return;
    }

    if (form.images.length > 10) {
      toast.error("Maximum 10 product images allowed!");
      return;
    }

    const requiredAttributes = Object.entries(attributesSchema)
      .filter(([_, config]) => config.required)
      .map(([key, _]) => key);

    const missingRequired = requiredAttributes.filter(
      (attr) => !form.attributes[attr] || form.attributes[attr] === "" || (Array.isArray(form.attributes[attr]) && form.attributes[attr].length === 0)
    );

    if (missingRequired.length > 0) {
      toast.error(`Please fill required fields: ${missingRequired.join(", ")}`);
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("description", form.description);
    data.append("mainCategory", form.mainCategory);
    data.append("subCategory", form.subCategory);
    data.append("subSubCategory", form.subSubCategory);
    data.append("attributes", JSON.stringify(form.attributes));
    data.append("discountedPrice", form.discountedPrice || "");
    data.append("discount", form.discount || 0);
    data.append("discountPeriod", form.discountPeriod ? new Date(form.discountPeriod).toISOString() : "");
    data.append("maxQuantityPerPurchase", form.maxQuantityPerPurchase || "1");

    form.images.forEach((image) => {
      data.append("images", image);
    });

    try {
      setIsSubmitting(true);
      await axios.post("/seller/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product added successfully!");
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Add product failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product._id);

    let discountPeriodValue = "";
    if (product.discountPeriod) {
      const date = new Date(product.discountPeriod);
      discountPeriodValue = date.toISOString().slice(0, 16);
    }

    const initialDiscountedPrice = (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price)
      ? product.discountedPrice
      : ((product.discount > 0 && product.price > 0)
        ? Math.floor(product.price * (1 - product.discount / 100))
        : "");

    setForm({
      title: product.title,
      price: product.price,
      stock: product.stock,
      description: product.description,
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      subSubCategory: product.subSubCategory,
      attributes: product.attributes || {},
      images: product.images || [],
      discountedPrice: initialDiscountedPrice,
      discount: product.discount || "",
      discountPeriod: discountPeriodValue,
      maxQuantityPerPurchase: product.maxQuantityPerPurchase || "1",
    });
    setImagePreviews(product.images || []);
    setShowForm(true);

    if (product.mainCategory) {
      axios.get(`/products/categories/${encodeURIComponent(product.mainCategory)}`)
        .then((res) => setSubCategories(res.data.subCategories || []))
        .catch(() => setSubCategories([]));
    }
    if (product.mainCategory && product.subCategory) {
      axios.get(`/products/categories/${encodeURIComponent(product.mainCategory)}/${encodeURIComponent(product.subCategory)}`)
        .then((res) => setSubSubCategories(res.data.subSubCategories || []))
        .catch(() => setSubSubCategories([]));
    }
    if (product.mainCategory && product.subCategory && product.subSubCategory) {
      axios.get(`/products/categories/${encodeURIComponent(product.mainCategory)}/${encodeURIComponent(product.subCategory)}/${encodeURIComponent(product.subSubCategory)}/attributes`)
        .then((res) => setAttributesSchema(res.data.attributes || {}))
        .catch(() => setAttributesSchema({}));
    }
  };

  const handleUpdate = async () => {
    if (!form.title || !form.price || !form.stock || !form.mainCategory || !form.subCategory || !form.subSubCategory) {
      toast.error("Title, price, stock, and all categories are required!");
      return;
    }

    const parsedStock = parseInt(form.stock);
    const parsedMaxQty = parseInt(form.maxQuantityPerPurchase);

    if (!form.maxQuantityPerPurchase || isNaN(parsedMaxQty) || parsedMaxQty < 1 || parsedMaxQty > 25) {
      toast.error("Max Quantity Per Purchase must be between 1 and 25!");
      return;
    }

    if (parsedMaxQty >= parsedStock) {
      toast.error("Max Quantity Per Purchase must be less than Stock Quantity!");
      return;
    }

    if (form.images.length < 2 || form.images.length > 10) {
      toast.error("Product must have between 2 and 10 images!");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("description", form.description);
    data.append("mainCategory", form.mainCategory);
    data.append("subCategory", form.subCategory);
    data.append("subSubCategory", form.subSubCategory);
    data.append("attributes", JSON.stringify(form.attributes));
    data.append("discountedPrice", form.discountedPrice || "");
    data.append("discount", form.discount || 0);
    data.append("discountPeriod", form.discountPeriod ? new Date(form.discountPeriod).toISOString() : "");
    data.append("maxQuantityPerPurchase", form.maxQuantityPerPurchase || "1");

    const imageOrder = [];
    form.images.forEach((image) => {
      if (typeof image === "string") {
        data.append("existingImages", image);
        imageOrder.push(image);
      } else {
        data.append("images", image);
        imageOrder.push("NEW_FILE");
      }
    });
    data.append("imageOrder", JSON.stringify(imageOrder));

    try {
      setIsSubmitting(true);
      await axios.put(`/seller/products/${editId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully!");
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProduct = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`/seller/products/${id}`);
      toast.success("Product deleted successfully!");
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed!");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (product) => {
    try {
      if (product.isAvailable) {
        await axios.patch(`/seller/products/unavailable/${product._id}`);
        toast.success("Product marked hidden");
      } else {
        await axios.patch(`/seller/products/available/${product._id}`);
        toast.success("Product marked visible");
      }
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update product availability!");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      stock: "",
      description: "",
      mainCategory: "",
      subCategory: "",
      subSubCategory: "",
      attributes: {},
      images: [],
    });
    setImagePreviews([]);
    setIsEditing(false);
    setEditId(null);
    setSubCategories([]);
    setSubSubCategories([]);
    setAttributesSchema({});
  };

  useEffect(() => {
    document.title = "Products Catalog | ZyCart Merchant";
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.isAvailable).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
              Manage Product Listings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Add new catalog listings, configure pricing &amp; discounts, and update inventory.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 hover:opacity-95 transition transform active:scale-95 flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-5 h-5" /> Add New Product
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Listed Items</p>
            <p className="text-3xl font-black text-[#3F51F4]">{totalProducts}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Active Catalog Items</p>
            <p className="text-3xl font-black text-emerald-600">{availableProducts}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">Out of Stock Alerts</p>
            <p className="text-3xl font-black text-red-600">{outOfStock}</p>
          </div>
        </div>

        {/* Modal Form for Add/Edit */}
        {showForm && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-black text-[#1B2A41]">
                {isEditing ? "Edit Product Details" : "Create New Catalog Listing"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Fire-Boltt Ninja Smartwatch"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Original MRP (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 9999"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Warehouse Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Max Quantity Per Order (1 - 25) *
                  </label>
                  <input
                    type="number"
                    name="maxQuantityPerPurchase"
                    value={form.maxQuantityPerPurchase || ''}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="1"
                    max="25"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Discounted Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={form.discountedPrice || ''}
                    onChange={handleChange}
                    placeholder="e.g. 999"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={form.discount || ''}
                    onChange={handleChange}
                    placeholder="e.g. 90"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Discount Expiry Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    name="discountPeriod"
                    value={form.discountPeriod || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Detailed specs and key features of the product..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition resize-none"
                />
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Main Category *
                  </label>
                  <select
                    value={form.mainCategory}
                    onChange={(e) => handleMainCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition cursor-pointer"
                  >
                    <option value="">Select Main Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Sub Category *
                  </label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    disabled={!form.mainCategory}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Product Type *
                  </label>
                  <select
                    value={form.subSubCategory}
                    onChange={(e) => handleSubSubCategoryChange(e.target.value)}
                    disabled={!form.subCategory}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select Product Type</option>
                    {subSubCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images Drag and Drop Upload */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Product Image Gallery (Min 2, Max 10 images) *
                </label>

                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none transition cursor-pointer"
                />

                {imagePreviews.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-slate-500">
                      Previews ({imagePreviews.length}/10) — Drag thumbnails to reorder image order:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {imagePreviews.map((preview, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => setDraggedIndex(null)}
                          className={`relative rounded-2xl overflow-hidden border-2 shadow-xs transition cursor-grab ${
                            draggedIndex === idx ? "border-[#3F51F4] opacity-40" : "border-slate-200"
                          }`}
                        >
                          <img src={preview} alt={`Thumb ${idx + 1}`} className="w-full h-24 object-cover" />
                          <span className="absolute bottom-1.5 left-1.5 bg-[#3F51F4] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={isEditing ? handleUpdate : handleAdd}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl font-extrabold text-white text-sm bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Product..." : isEditing ? "Update Product" : "Publish Product"}
                </button>
                
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-8 py-4 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition text-sm"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Filter and Search controls */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search catalog products by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceHigh">Price: High → Low</option>
                <option value="priceLow">Price: Low → High</option>
                <option value="stockHigh">Stock: High → Low</option>
                <option value="stockLow">Stock: Low → High</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Catalog Statuses</option>
                <option value="available">Catalog Visible</option>
                <option value="unavailable">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <p className="text-4xl">🔍</p>
              <p className="text-lg font-bold text-[#1B2A41]">No matching products found</p>
              <p className="text-xs text-slate-500">Try clearing search filters or add a new product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 whitespace-nowrap">Product</th>
                    <th className="px-6 py-4 whitespace-nowrap">MRP Price</th>
                    <th className="px-6 py-4 whitespace-nowrap">Selling Price</th>
                    <th className="px-6 py-4 whitespace-nowrap">Stock</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {paginatedProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <Link to={`/seller/products/${product._id}`} className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || "https://placehold.co/400x400/e2e8f0/1e293b?text=Product"}
                            alt={product.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 hover:text-[#3F51F4] transition line-clamp-1">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">
                              {product.mainCategory} &gt; {product.subCategory}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 font-black whitespace-nowrap">
                        ₹{product.price?.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const sellingPrice = (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price)
                            ? product.discountedPrice
                            : (product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price);

                          const discountPct = product.discount > 0
                            ? product.discount
                            : (product.discountedPrice && product.discountedPrice < product.price
                              ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
                              : 0);

                          const isDiscounted = discountPct > 0 && sellingPrice < product.price;

                          if (isDiscounted) {
                            return (
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="font-black text-emerald-600 text-sm">
                                  ₹{sellingPrice.toLocaleString()}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 whitespace-nowrap shrink-0">
                                  {discountPct}% OFF
                                </span>
                              </div>
                            );
                          }
                          return (
                            <span className="font-black text-slate-900 text-sm">
                              ₹{product.price?.toLocaleString()}
                            </span>
                          );
                        })()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${
                          product.stock > 0 ? "bg-slate-100 text-slate-800" : "bg-red-100 text-red-800"
                        }`}>
                          {product.stock} units
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${
                          product.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {product.isAvailable ? "✓ Visible" : "✕ Hidden"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => toggleAvailability(product)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs transition"
                          >
                            {product.isAvailable ? "Hide" : "Show"}
                          </button>

                          <button
                            onClick={() => setProductToDelete(product)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
              <p>Page {currentPage} of {totalPages}</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-extrabold text-[#1B2A41]">
              Delete Catalog Product
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to permanently delete <span className="font-bold text-slate-900">"{productToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteProduct(productToDelete._id)}
                disabled={deletingId === productToDelete._id}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-xs font-extrabold shadow-md"
              >
                {deletingId === productToDelete._id ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerProducts;
