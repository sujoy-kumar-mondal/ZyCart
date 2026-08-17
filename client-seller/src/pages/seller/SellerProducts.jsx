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
    discountedPrice: "",
    discount: "",
    discountPeriod: "",
    maxQuantityPerPurchase: ""
  });

  const [imagePreviews, setImagePreviews] = useState([]);
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

  // HANDLE SUB CATEGORY CHANGE
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

  // INPUT HANDLER
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      const selectedFiles = Array.from(files).slice(0, 5);
      setForm((prev) => ({ ...prev, images: selectedFiles }));

      const previews = selectedFiles.map((file) => {
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

    if (form.images.length > 5) {
      toast.error("Maximum 5 product images allowed!");
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

    const initialDiscountedPrice = (product.discount > 0 && product.price > 0)
      ? Math.floor(product.price * (1 - product.discount / 100))
      : "";

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
      discountedPrice: initialDiscountedPrice,
      discount: product.discount || "",
      discountPeriod: discountPeriodValue,
      maxQuantityPerPurchase: product.maxQuantityPerPurchase || "1",
    });
    setImagePreviews(product.images || []);
    setShowForm(true);

    // Load subcategories, sub-subcategories, and attributes schema via API
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

  // UPDATE PRODUCT
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

    // Check image count (existing imagePreviews or newly selected form.images)
    const newFilesCount = form.images.filter(i => typeof i !== "string").length;
    if (newFilesCount > 0 && newFilesCount < 2) {
      toast.error("At least 2 product images must be uploaded!");
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
      if (typeof image === "string") return; // Skip existing images
      data.append("images", image);
    });

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

  // DELETE PRODUCT
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title <span className="text-red-600">*</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) <span className="text-red-600">*</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity <span className="text-red-600">*</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price (₹)</label>
                    <input
                      type="number"
                      name="discountedPrice"
                      value={form.discountedPrice || ''}
                      onChange={handleChange}
                      placeholder="Discounted Price (₹)"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                    {parseInt(form.discount) > 0 && (
                      <p className="text-xs font-semibold text-green-600 mt-1">
                        Auto Calculated Discount: {form.discount}% OFF
                      </p>
                    )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      name="discountPeriod"
                      value={form.discountPeriod || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional. Leave blank for permanent discount (all time).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Quantity Per Purchase <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxQuantityPerPurchase"
                      value={form.maxQuantityPerPurchase || ''}
                      onChange={handleChange}
                      placeholder="Max Quantity Per Purchase (1 - 25)"
                      min="1"
                      max="25"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be between 1 and 25, and less than Stock Quantity.
                    </p>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Product Category <span className="text-red-600">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Main Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Category <span className="text-red-600">*</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category <span className="text-red-600">*</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type <span className="text-red-600">*</span>
                    </label>
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

                            {/* DATE INPUT */}
                            {dataType === "Date" && (
                              <div>
                                <input
                                  type="date"
                                  value={form.attributes[key] || ""}
                                  onChange={(e) => handleAttributeChange(key, e.target.value)}
                                  required={isRequired}
                                  placeholder={config.placeholder || `Enter ${config.fieldName || key}`}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                />
                                <p className="mt-1 text-sm text-gray-500">{config.note || "Enter the date"}</p>
                              </div>
                            )}

                            {/* RANGE INPUT */}
                            {dataType === "Range" && (
                              <input
                                type="text"
                                value={form.attributes[key] || ""}
                                onChange={(e) => handleAttributeChange(key, e.target.value)}
                                required={isRequired}
                                placeholder={
                                  config.placeholder ||
                                  (typeof config.options === "string" ? config.options : `e.g., 1-4 players, 2-8 players`)
                                }
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Product Images (Min 2, Max 5) <span className="text-red-600">*</span>
                </h3>
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
                    Upload at least 2 and up to 5 images. Supported formats: JPG, PNG, WEBP, GIF
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
                  disabled={isSubmitting}
                  className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {isEditing ? "Updating Product..." : "Adding Product..."}
                    </>
                  ) : (
                    isEditing ? "Update Product" : "Add Product"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition disabled:opacity-50"
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Discounted Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {paginatedProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-blue-50/50 transition">
                        <td className="px-6 py-4">
                          <a
                            href={`${import.meta.env.VITE_USER_URL || "http://localhost:5173"}/product/${product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 group cursor-pointer"
                            title="Click to view product on storefront"
                          >
                            <img
                              src={product.images?.[0] || "https://via.placeholder.com/50"}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-200 group-hover:scale-105 transition"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-xs group-hover:text-blue-600 group-hover:underline transition">
                                {product.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.mainCategory} • {product.subCategory}
                              </p>
                            </div>
                          </a>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
                        </td>

                        <td className="px-6 py-4">
                          {product.discount > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-green-600">
                                ₹{(product.discountedPrice && product.discountedPrice > 0
                                  ? product.discountedPrice
                                  : Math.round(product.price * (1 - product.discount / 100))
                                ).toLocaleString()}
                              </span>
                              <span className="text-xs font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                                {product.discount}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.isAvailable
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
                              className={`font-semibold text-sm transition ${product.isAvailable
                                  ? "text-orange-600 hover:text-orange-800"
                                  : "text-green-600 hover:text-green-800"
                                }`}
                            >
                              {product.isAvailable ? "Hide" : "Show"}
                            </button>

                            <button
                              onClick={() => setProductToDelete(product)}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm transition"
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
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${currentPage === idx + 1
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

      {/* DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🗑️ Delete Product
              </h3>
              <button
                onClick={() => setProductToDelete(null)}
                disabled={deletingId === productToDelete._id}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{productToDelete.title}"</span>?
              This action cannot be undone and will permanently remove the product and its images.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={deletingId === productToDelete._id}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteProduct(productToDelete._id)}
                disabled={deletingId === productToDelete._id}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId === productToDelete._id ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
