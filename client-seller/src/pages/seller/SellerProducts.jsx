import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsProvider";
import { ChevronDown, Search, Filter, X, PlusCircle, Edit, Trash2, Eye, EyeOff, Package, Tag, Calendar, AlertCircle, Sparkles, CheckCircle2, ChevronRight, Layers } from "lucide-react";

const SellerProducts = () => {
  const { settings } = useSettings();
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

  // Smart Category & Product Type Search States
  const [allPathways, setAllPathways] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [categorySearchResults, setCategorySearchResults] = useState([]);
  const [showCategorySearchSuggestions, setShowCategorySearchSuggestions] = useState(false);

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
    } catch (error) { }
  };

  const fetchAllPathways = async () => {
    try {
      const res = await axios.get("/products/categories/all-pathways");
      if (res.data.success) {
        setAllPathways(res.data.results || []);
      }
    } catch (error) {
      console.error("Failed to fetch all category pathways:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllPathways();
  }, []);

  // Helper to extract clean words from text
  const getCleanWords = (text) => {
    if (!text) return [];
    const raw = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    const words = new Set(raw);

    // Add singular forms
    for (const w of raw) {
      if (w.endsWith("ies") && w.length > 4) words.add(w.slice(0, -3) + "y");
      else if (w.endsWith("es") && w.length > 4) words.add(w.slice(0, -2));
      else if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) words.add(w.slice(0, -1));
    }

    // Combine adjacent number + unit (e.g., '16' + 'gb' -> '16gb', '512' + 'gb' -> '512gb')
    for (let i = 0; i < raw.length - 1; i++) {
      if (/^\d+$/.test(raw[i]) && ["gb", "tb", "mb", "inch", "kg", "ghz", "hz"].includes(raw[i + 1])) {
        words.add(raw[i] + raw[i + 1]);
      }
    }

    return Array.from(words);
  };

  const scoreCategoryPathway = (pathway, queryWords, rawQueryLower) => {
    const subSubWords = getCleanWords(pathway.subSubCategory);
    const subWords = getCleanWords(pathway.subCategory);
    const mainWords = getCleanWords(pathway.mainCategory);
    const attributeWords = Array.isArray(pathway.attributeWords) ? pathway.attributeWords : [];

    let score = 0;
    const matchedWords = new Set();

    // Direct phrase containment on Product Type (subSubCategory)
    const subSubLower = (pathway.subSubCategory || "").toLowerCase();
    if (rawQueryLower.includes(subSubLower) && subSubLower.length > 2) {
      score += 500;
      subSubWords.forEach((w) => matchedWords.add(w));
    }

    for (const qWord of queryWords) {
      // Product Type match (100 pts)
      if (subSubWords.includes(qWord)) {
        score += 100;
        matchedWords.add(qWord);
      }
      // Sub Category match (40 pts)
      if (subWords.includes(qWord)) {
        score += 40;
        matchedWords.add(qWord);
      }
      // Attributes match (25 pts)
      if (attributeWords.includes(qWord)) {
        score += 25;
        matchedWords.add(qWord);
      }
      // Main Category match (5 pts)
      if (mainWords.includes(qWord)) {
        score += 5;
        matchedWords.add(qWord);
      }
    }

    if (matchedWords.size > 0) {
      return score * matchedWords.size;
    }
    return 0;
  };

  // Filter category pathways as user types in category search input with word decomposition & attribute matching
  useEffect(() => {
    if (!categorySearchQuery.trim()) {
      setCategorySearchResults([]);
      return;
    }

    const rawQuery = categorySearchQuery.trim();
    const queryWords = getCleanWords(rawQuery);
    const queryLower = rawQuery.toLowerCase();

    if (allPathways.length > 0) {
      const scored = allPathways
        .map((item) => ({
          ...item,
          score: scoreCategoryPathway(item, queryWords, queryLower),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 25);

      setCategorySearchResults(scored);
    } else {
      // Fallback to backend API search
      const timer = setTimeout(async () => {
        try {
          const res = await axios.get(`/products/categories/search?q=${encodeURIComponent(rawQuery)}`);
          if (res.data.success) {
            setCategorySearchResults(res.data.results || []);
          }
        } catch (e) {}
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [categorySearchQuery, allPathways]);

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

  const extractAttributeValuesFromText = (text, schema) => {
    if (!text || !schema) return {};
    const textLower = text.toLowerCase();

    // Extract raw words and adjacent joined tokens (e.g. "16" + "gb" -> "16gb")
    const rawWords = textLower.replace(/[^a-z0-9.\s]/g, " ").split(/\s+/).filter(Boolean);
    const tokenSet = new Set(rawWords);
    for (let i = 0; i < rawWords.length - 1; i++) {
      tokenSet.add(rawWords[i] + rawWords[i + 1]);
      tokenSet.add(rawWords[i] + " " + rawWords[i + 1]);
    }

    // Add spelling variants
    if (tokenSet.has("gray")) tokenSet.add("grey");
    if (tokenSet.has("grey")) tokenSet.add("gray");

    const detected = {};

    for (const [fieldName, field] of Object.entries(schema)) {
      if (field.options && Array.isArray(field.options) && field.options.length > 0) {
        let bestMatch = null;

        for (const opt of field.options) {
          const optStr = typeof opt === "string" ? opt : String(opt);
          let optLower = optStr.toLowerCase();
          if (optLower === "grey" && tokenSet.has("gray")) optLower = "gray";
          if (optLower === "gray" && tokenSet.has("grey")) optLower = "grey";

          const optWords = optLower.replace(/[^a-z0-9.\s]/g, " ").split(/\s+/).filter(Boolean);
          const optCompact = optWords.join("");
          const optPhrase = optWords.join(" ");

          if (optWords.length === 1) {
            if (tokenSet.has(optLower) || tokenSet.has(optCompact)) {
              if (!bestMatch || optStr.length > bestMatch.length) {
                bestMatch = optStr;
              }
            }
          } else {
            if (textLower.includes(optPhrase) || tokenSet.has(optPhrase) || tokenSet.has(optCompact)) {
              if (!bestMatch || optStr.length > bestMatch.length) {
                bestMatch = optStr;
              }
            }
          }
        }

        if (bestMatch) {
          detected[fieldName] = bestMatch;
        }
      } else if (field.dataType === "Text" || field.dataType === "Decimal" || field.dataType === "Integer") {
        // Auto-extract specific patterns like Weight (e.g. "1.8 kg"), Model Name (e.g. "NP760VJG")
        const fieldNameLower = fieldName.toLowerCase();
        if (fieldNameLower.includes("weight")) {
          const weightMatch = text.match(/(\d+(\.\d+)?\s*(kg|g|lbs|gm))/i);
          if (weightMatch) detected[fieldName] = weightMatch[0].trim();
        } else if (fieldNameLower.includes("model")) {
          const modelMatch = text.match(/\b([A-Z0-9]{5,}-[A-Z0-9-]+|[A-Z0-9]{6,})\b/);
          if (modelMatch) detected[fieldName] = modelMatch[0].trim();
        }
      }
    }

    return detected;
  };

  const handleSubSubCategoryChange = async (subSubCat) => {
    const { mainCategory, subCategory } = form;

    if (mainCategory && subCategory && subSubCat) {
      try {
        const url = `/products/categories/${encodeURIComponent(mainCategory)}/${encodeURIComponent(subCategory)}/${encodeURIComponent(subSubCat)}/attributes`;
        const res = await axios.get(url);
        const schema = res.data.attributes || {};
        setAttributesSchema(schema);

        const autoAttributes = extractAttributeValuesFromText(form.title || categorySearchQuery || "", schema);
        setForm((prev) => ({
          ...prev,
          subSubCategory: subSubCat,
          attributes: { ...autoAttributes },
        }));
      } catch (error) {
        setAttributesSchema({});
        setForm((prev) => ({ ...prev, subSubCategory: subSubCat, attributes: {} }));
      }
    } else {
      setAttributesSchema({});
      setForm((prev) => ({ ...prev, subSubCategory: subSubCat, attributes: {} }));
    }
  };

  const handleSelectCategoryPathway = async (pathway) => {
    const { mainCategory, subCategory, subSubCategory } = pathway;

    try {
      // 1. Fetch sub categories for mainCategory
      const subRes = await axios.get(`/products/categories/${encodeURIComponent(mainCategory)}`);
      setSubCategories(subRes.data.subCategories || []);

      // 2. Fetch subSubCategories for mainCategory & subCategory
      const subSubRes = await axios.get(
        `/products/categories/${encodeURIComponent(mainCategory)}/${encodeURIComponent(subCategory)}`
      );
      setSubSubCategories(subSubRes.data.subSubCategories || []);

      // 3. Fetch attributes schema
      const attrUrl = `/products/categories/${encodeURIComponent(mainCategory)}/${encodeURIComponent(subCategory)}/${encodeURIComponent(subSubCategory)}/attributes`;
      const attrRes = await axios.get(attrUrl);
      const schema = attrRes.data.attributes || {};
      setAttributesSchema(schema);

      // 4. Auto-detect attributes from search query or product title
      const searchText = categorySearchQuery || form.title || "";
      const autoAttributes = extractAttributeValuesFromText(searchText, schema);

      // 5. Update form state
      setForm((prev) => ({
        ...prev,
        mainCategory,
        subCategory,
        subSubCategory,
        title: prev.title || categorySearchQuery,
        attributes: {
          ...autoAttributes,
        },
      }));

      setCategorySearchQuery("");
      setShowCategorySearchSuggestions(false);
      const detectedCount = Object.keys(autoAttributes).length;
      if (detectedCount > 0) {
        toast.success(`Selected ${subSubCategory} & auto-filled ${detectedCount} attributes!`);
      } else {
        toast.success(`Selected: ${mainCategory} > ${subCategory} > ${subSubCategory}`);
      }
    } catch (error) {
      console.error("Error setting category pathway:", error);
      toast.error("Failed to load category attributes");
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
    setCategorySearchQuery("");
    setShowCategorySearchSuggestions(false);
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
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Listed Items</p>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Quota: {settings.maxProductsPerSeller || 50} max
              </span>
            </div>
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

              {/* Smart Category & Product Type Search / Selection */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-[#3F51F4]" /> Search Product Type / Category Pathway
                    </label>
                    <span className="text-[10px] font-extrabold text-[#3F51F4] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-500" /> Smart Auto-Suggest
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => {
                        setCategorySearchQuery(e.target.value);
                        setShowCategorySearchSuggestions(true);
                      }}
                      onFocus={() => setShowCategorySearchSuggestions(true)}
                      placeholder="Paste product title or search type (e.g. ANALOGUE Analog Watch - For Men, shoes, smartphone)..."
                      className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    />
                    {categorySearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategorySearchQuery("");
                          setShowCategorySearchSuggestions(false);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Auto-Suggestions Dropdown Popover */}
                  {showCategorySearchSuggestions && categorySearchQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-64 overflow-y-auto p-2 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                        <span>Suggested Category Pathways ({categorySearchResults.length})</span>
                        <span>Click to Select</span>
                      </div>

                      {categorySearchResults.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                          No matching product type found for "<span className="text-slate-700 font-bold">{categorySearchQuery}</span>". You can choose directly from the dropdowns below.
                        </div>
                      ) : (
                        categorySearchResults.map((pathway, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSelectCategoryPathway(pathway)}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs hover:bg-blue-50/80 transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-blue-100"
                          >
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-slate-900 group-hover:text-[#3F51F4] flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-[#3F51F4]" />
                                <span>{pathway.subSubCategory}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 flex-wrap">
                                <span className="text-slate-500">{pathway.mainCategory}</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 inline" />
                                <span className="text-slate-500">{pathway.subCategory}</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 inline" />
                                <span className="text-[#3F51F4] font-bold">{pathway.subSubCategory}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-[#3F51F4] group-hover:bg-[#3F51F4] group-hover:text-white transition">
                              Select &rarr;
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Selected Pathway Breadcrumb Confirmation */}
                  {form.mainCategory && form.subCategory && form.subSubCategory && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-slate-600">Selected Pathway:</span>
                        <span className="text-emerald-950 font-black">
                          {form.mainCategory} &gt; {form.subCategory} &gt; {form.subSubCategory}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-md">
                        Active
                      </span>
                    </div>
                  )}
                </div>

                {/* 3 Cascading Category Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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

                {/* Dynamic Category Attributes / Specifications */}
                {Object.keys(attributesSchema).length > 0 && (
                  <div className="mt-4 p-5 rounded-2xl bg-blue-50/30 border border-blue-100/80 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#3F51F4]" />
                          <span>{form.subSubCategory} Specifications & Attributes</span>
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500">
                          Provide specific catalog details
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-blue-100 text-[#3F51F4] rounded-lg border border-blue-200/60">
                        {Object.keys(attributesSchema).length} Attributes
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                      {Object.entries(attributesSchema).map(([fieldName, field]) => {
                        const isSelect = field.dataType === "Select" && Array.isArray(field.options) && field.options.length > 0;
                        const isMultiSelect = field.dataType === "Multi-Select" && Array.isArray(field.options) && field.options.length > 0;
                        const isBoolean = field.dataType === "Boolean";
                        const isNumber = field.dataType === "Integer" || field.dataType === "Decimal" || field.dataType === "Range";

                        return (
                          <div key={fieldName} className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span className="truncate pr-1">
                                {fieldName} {field.required && <span className="text-rose-500 font-black">*</span>}
                              </span>
                              {field.filterable && (
                                <span className="text-[9px] font-extrabold text-[#3F51F4] bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                  Filterable
                                </span>
                              )}
                            </label>

                            {isSelect ? (
                              <select
                                value={form.attributes[fieldName] || ""}
                                onChange={(e) => handleAttributeChange(fieldName, e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition cursor-pointer"
                              >
                                <option value="">Select {fieldName}</option>
                                {field.options.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : isMultiSelect ? (
                              <div className="space-y-1.5">
                                <select
                                  value=""
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    const current = Array.isArray(form.attributes[fieldName]) ? form.attributes[fieldName] : [];
                                    if (!current.includes(val)) {
                                      handleAttributeChange(fieldName, [...current, val]);
                                    }
                                  }}
                                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition cursor-pointer"
                                >
                                  <option value="">Add {fieldName}...</option>
                                  {field.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                {Array.isArray(form.attributes[fieldName]) && form.attributes[fieldName].length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {form.attributes[fieldName].map((item) => (
                                      <span
                                        key={item}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#3F51F4] border border-blue-200 rounded-lg text-[11px] font-bold"
                                      >
                                        {item}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = form.attributes[fieldName].filter((x) => x !== item);
                                            handleAttributeChange(fieldName, updated);
                                          }}
                                          className="text-blue-400 hover:text-rose-500 font-black text-xs transition cursor-pointer"
                                        >
                                          &times;
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : isBoolean ? (
                              <select
                                value={form.attributes[fieldName] === true ? "true" : form.attributes[fieldName] === false ? "false" : ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? "" : e.target.value === "true";
                                  handleAttributeChange(fieldName, val);
                                }}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition cursor-pointer"
                              >
                                <option value="">Select</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            ) : isNumber ? (
                              <input
                                type="number"
                                value={form.attributes[fieldName] || ""}
                                onChange={(e) => handleAttributeChange(fieldName, e.target.value)}
                                placeholder={field.placeholder || `Enter ${fieldName}...`}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                              />
                            ) : (
                              <input
                                type="text"
                                value={form.attributes[fieldName] || ""}
                                onChange={(e) => handleAttributeChange(fieldName, e.target.value)}
                                placeholder={field.placeholder || `Enter ${fieldName}...`}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                              />
                            )}

                            {field.helpText && (
                              <p className="text-[10px] text-slate-400 font-medium px-1">
                                {field.helpText}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                          className={`relative rounded-2xl overflow-hidden border-2 shadow-xs transition cursor-grab ${draggedIndex === idx ? "border-[#3F51F4] opacity-40" : "border-slate-200"
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
                          const isExpired = product.discountPeriod && new Date(product.discountPeriod) <= new Date();
                          const sellingPrice = (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price)
                            ? product.discountedPrice
                            : (product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price);

                          const discountPct = product.discount > 0
                            ? product.discount
                            : (product.discountedPrice && product.discountedPrice < product.price
                              ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
                              : 0);

                          const isDiscountActive = !isExpired && discountPct > 0 && sellingPrice < product.price;

                          if (isDiscountActive) {
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${product.stock > 0 ? "bg-slate-100 text-slate-800" : "bg-red-100 text-red-800"
                          }`}>
                          {product.stock} units
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${product.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
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
