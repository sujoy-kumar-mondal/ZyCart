import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { ChevronDown, Search, Filter, X } from "lucide-react";

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
    discount: "",
    discountPeriod: "",
    maxQuantityPerPurchase: ""
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [attributesSchema, setAttributesSchema] = useState({});

  // FETCH PRODUCTS
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

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/products/categories");
      setCategories(res.data.categories || []);
    } catch (error) {

    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // APPLY FILTERS AND SORTING
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Availability filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((p) =>
        filterStatus === "available" ? p.isAvailable : !p.isAvailable
      );
    }

    // Stock status filter
    if (filterStockStatus !== "all") {
      filtered = filtered.filter((p) =>
        filterStockStatus === "instock" ? p.stock > 0 : p.stock === 0
      );
    }

    // Sorting
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

  // HANDLE MAIN CATEGORY CHANGE
  const handleMainCategoryChange = async (mainCat) => {
    setForm({ ...form, mainCategory: mainCat, subCategory: "", subSubCategory: "", attributes: {} });
    
    if (mainCat) {
      try {
        const res = await axios.get(`/products/categories/${mainCat}`);
        setSubCategories(res.data.subCategories || []);
      } catch (error) {
  
      }
    } else {
      setSubCategories([]);
    }
    setSubSubCategories([]);
  };

  // HANDLE SUB CATEGORY CHANGE
  const handleSubCategoryChange = async (subCat) => {
    const mainCat = form.mainCategory;
    setForm({ ...form, subCategory: subCat, subSubCategory: "", attributes: {} });
    
    if (mainCat && subCat) {
      try {
        const res = await axios.get(`/products/categories/${mainCat}/${subCat}`);
        setSubSubCategories(res.data.subSubCategories || []);
      } catch (error) {
  
      }
    } else {
      setSubSubCategories([]);
    }
  };

  const handleSubSubCategoryChange = async (subSubCat) => {
    const { mainCategory, subCategory } = form;
    setForm({ ...form, subSubCategory: subSubCat });
    
    if (mainCategory && subCategory && subSubCat) {
      try {
        const url = `/products/categories/${mainCategory}/${subCategory}/${subSubCat}/attributes`;
        const res = await axios.get(url);
        setAttributesSchema(res.data.attributes || {});
      } catch (error) {
        setAttributesSchema({});
      }
    } else {
      setAttributesSchema({});
    }
  };

  // INPUT HANDLER
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      const selectedFiles = Array.from(files).slice(0, 5);
      setForm({ ...form, images: selectedFiles });

      const previews = selectedFiles.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
        });
      });

      Promise.all(previews).then(setImagePreviews);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // HANDLE ATTRIBUTE CHANGE
  const handleAttributeChange = (attrKey, value) => {
    setForm({ ...form, attributes: { ...form.attributes, [attrKey]: value } });
  };

  // ADD PRODUCT
  const handleAdd = async () => {
    if (!form.title || !form.price || !form.stock || !form.mainCategory || !form.subCategory || !form.subSubCategory) {
      toast.error("Title, price, stock, and all categories are required!");
      return;
    }

    // Validate required attributes
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
    data.append("discount", form.discount || 0);
    data.append("discountPeriod", form.discountPeriod ? new Date(form.discountPeriod).toISOString() : "");
    data.append("maxQuantityPerPurchase", form.maxQuantityPerPurchase || "");

    form.images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await axios.post("/seller/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product added successfully!");
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Add product failed!");
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product._id);
    
    // Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
    let discountPeriodValue = "";
    if (product.discountPeriod) {
      const date = new Date(product.discountPeriod);
      discountPeriodValue = date.toISOString().slice(0, 16);
    }
    
    setForm({
      title: product.title,
      price: product.price,
      stock: product.stock,
      description: product.description,
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      subSubCategory: product.subSubCategory,
      attributes: product.attributes || {},
      images: [],
      discount: product.discount || "",
      discountPeriod: discountPeriodValue,
      maxQuantityPerPurchase: product.maxQuantityPerPurchase || "",
    });
    setImagePreviews(product.images || []);
    setShowForm(true);

    // Load subcategories
    if (product.mainCategory) {
      setSubCategories(Object.keys(categories[product.mainCategory] || {}));
    }
    if (product.mainCategory && product.subCategory) {
      setSubSubCategories(Object.keys(categories[product.mainCategory]?.[product.subCategory] || {}));
    }
    if (product.mainCategory && product.subCategory && product.subSubCategory) {
      const schema = categories[product.mainCategory]?.[product.subCategory]?.[product.subSubCategory] || {};
      setAttributesSchema(schema);
    }
  };

  // UPDATE PRODUCT
  const handleUpdate = async () => {
    if (!form.title || !form.price || !form.stock || !form.mainCategory || !form.subCategory || !form.subSubCategory) {
      toast.error("Title, price, stock, and all categories are required!");
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
    data.append("discount", form.discount || 0);
    data.append("discountPeriod", form.discountPeriod ? new Date(form.discountPeriod).toISOString() : "");
    data.append("maxQuantityPerPurchase", form.maxQuantityPerPurchase || "");

    form.images.forEach((image) => {
      if (typeof image === "string") return; // Skip existing images
      data.append("images", image);
    });

    try {
      await axios.put(`/seller/products/${editId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully!");
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed!");
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeletingId(id);
      await axios.delete(`/seller/products/${id}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed!");
    } finally {
      setDeletingId(null);
    }
  };

  // MARK UNAVAILABLE
  const toggleAvailability = async (product) => {
    try {
      if (product.isAvailable) {
        await axios.patch(`/seller/products/unavailable/${product._id}`);
        toast.success("Product marked unavailable");
      } else {
        await axios.patch(`/seller/products/available/${product._id}`);
        toast.success("Product marked available");
      }
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update product availability!");
    }
  };

  // RESET FORM
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
    document.title = "Products | ZyCart";
  }, []);

  if (loading) return <Loader />;

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.isAvailable).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Manage Products
            </h1>
            <p className="text-gray-600">View, edit, and manage all your products</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105"
          >
            + Add New Product
          </button>
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Products</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{totalProducts}</p>
            <p className="text-xs text-gray-500 mt-2">All products listed</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Available</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{availableProducts}</p>
            <p className="text-xs text-gray-500 mt-2">Ready for sale</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Out of Stock</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{outOfStock}</p>
            <p className="text-xs text-gray-500 mt-2">No stock available</p>
          </div>
        </div>

        {/* ADD/EDIT PRODUCT FORM */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* BASIC INFO */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter product title"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      value={form.discount || ''}
                      onChange={handleChange}
                      placeholder="Discount (%)"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Expiry Date</label>
                    <input
                      type="datetime-local"
                      name="discountPeriod"
                      value={form.discountPeriod || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Quantity Per Purchase</label>
                    <input
                      type="number"
                      name="maxQuantityPerPurchase"
                      value={form.maxQuantityPerPurchase || ''}
                      onChange={handleChange}
                      placeholder="Max Quantity Per Purchase"
                      min="1"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter product description"
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* CATEGORIES */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Category *</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Main Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Category</label>
                    <select
                      value={form.mainCategory}
                      onChange={(e) => handleMainCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                    >
                      <option value="">Select Main Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                    <select
                      value={form.subCategory}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      disabled={!form.mainCategory}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Select Sub Category</option>
                      {subCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Sub Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                    <select
                      value={form.subSubCategory}
                      onChange={(e) => handleSubSubCategoryChange(e.target.value)}
                      disabled={!form.subCategory}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Select Product Type</option>
                      {subSubCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ATTRIBUTES */}
              {Object.keys(attributesSchema).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {Object.entries(attributesSchema)
                      .sort(([, a], [, b]) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map(([key, config]) => {
                        const isRequired = config.required;
                        const dataType = config.dataType;

                        return (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {config.fieldName || key} {isRequired && <span className="text-red-600">*</span>}
                            </label>

                            {/* SELECT (Single) */}
                            {dataType === "Select" && (
                              <select
                                value={form.attributes[key] || ""}
                                onChange={(e) => handleAttributeChange(key, e.target.value)}
                                required={isRequired}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                              >
                                <option value="">Select {config.fieldName || key}</option>
                                {config.options && config.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* MULTI-SELECT */}
                            {dataType === "Multi-Select" && (
                              <div className="border border-gray-300 rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                                {config.options && config.options.length > 0 ? (
                                  config.options.map((opt) => (
                                    <label key={opt} className="flex items-center gap-2 mb-2">
                                      <input
                                        type="checkbox"
                                        value={opt}
                                        checked={(form.attributes[key] || []).includes(opt)}
                                        onChange={(e) => {
                                          const currentValues = Array.isArray(form.attributes[key]) ? form.attributes[key] : [];
                                          if (e.target.checked) {
                                            handleAttributeChange(key, [...currentValues, opt]);
                                          } else {
                                            handleAttributeChange(key, currentValues.filter((v) => v !== opt));
                                          }
                                        }}
                                        className="w-4 h-4 rounded border-gray-300"
                                      />
                                      <span className="text-sm text-gray-700">{opt}</span>
                                    </label>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500">No options available</p>
                                )}
                              </div>
                            )}

                            {/* TEXT INPUT */}
                            {dataType === "Text" && (
                              <input
                                type="text"
                                value={form.attributes[key] || ""}
                                onChange={(e) => handleAttributeChange(key, e.target.value)}
                                required={isRequired}
                                placeholder={config.placeholder || `Enter ${config.fieldName || key}`}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                              />
                            )}

                            {/* INTEGER INPUT */}
                            {dataType === "Integer" && (
                              <input
                                type="number"
                                step="1"
                                value={form.attributes[key] || ""}
                                onChange={(e) => handleAttributeChange(key, e.target.value)}
                                required={isRequired}
                                placeholder={config.placeholder || `e.g., 3000, 4500, 5000`}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                              />
                            )}

                            {/* DECIMAL INPUT */}
                            {dataType === "Decimal" && (
                              <input
                                type="number"
                                step="0.1"
                                value={form.attributes[key] || ""}
                                onChange={(e) => handleAttributeChange(key, e.target.value)}
                                required={isRequired}
                                placeholder={config.placeholder || `e.g., 6.1, 6.7, 5.5`}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                              />
                            )}

                            {/* BOOLEAN (Yes/No) */}
                            {dataType === "Boolean" && (
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={key}
                                    value="Yes"
                                    checked={form.attributes[key] === "Yes"}
                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-gray-700">Yes</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={key}
                                    value="No"
                                    checked={form.attributes[key] === "No"}
                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-gray-700">No</span>
                                </label>
                              </div>
                            )}

                            {/* HELP TEXT */}
                            {config.helpText && (
                              <p className="text-xs text-gray-500 mt-1">{config.helpText}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* IMAGES */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="block w-full text-sm text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 5 images. Supported formats: JPG, PNG, GIF
                  </p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview ({imagePreviews.length}/5)</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                          <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                          <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={isEditing ? handleUpdate : handleAdd}
                  className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
                >
                  {isEditing ? "Update Product" : "Add Product"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FILTERS AND SEARCH */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none transition bg-white text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="stockHigh">Stock: High to Low</option>
                  <option value="stockLow">Stock: Low to High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none transition bg-white text-sm"
                >
                  <option value="all">All Products</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                <select
                  value={filterStockStatus}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none transition bg-white text-sm"
                >
                  <option value="all">All Items</option>
                  <option value="instock">In Stock</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                <div className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                  {filteredProducts.length} products
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-gray-400 mb-3">
                <Filter size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No products found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters or add a new product</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-300">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {paginatedProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-blue-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={product.images?.[0] || "https://via.placeholder.com/50"}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-200"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-xs">
                                {product.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.mainCategory} • {product.subCategory}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              product.stock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              product.isAvailable
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.isAvailable ? "✓ Available" : "✕ Unavailable"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => toggleAvailability(product)}
                              className={`font-semibold text-sm transition ${
                                product.isAvailable
                                  ? "text-orange-600 hover:text-orange-800"
                                  : "text-green-600 hover:text-green-800"
                              }`}
                            >
                              {product.isAvailable ? "Hide" : "Show"}
                            </button>

                            <button
                              onClick={() => handleDelete(product._id)}
                              disabled={deletingId === product._id}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm transition disabled:opacity-50"
                            >
                              {deletingId === product._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-semibold">
                      {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                    </span>{" "}
                    of <span className="font-semibold">{filteredProducts.length}</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            currentPage === idx + 1
                              ? "bg-linear-to-r from-blue-600 to-blue-700 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProducts;
