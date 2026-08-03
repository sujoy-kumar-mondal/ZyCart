// pages/ProductsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import ProductList from "../components/ProductList";
import ProductFilter from "../components/ProductFilter";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

// Debounce Hook
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title-asc", label: "Title: A → Z" },
  { value: "title-desc", label: "Title: Z → A" },
];

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(search);

  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(50000);

  // FILTER STATE from ProductFilter
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subSubCategory, setSubSubCategory] = useState("");
  const [attributeFilters, setAttributeFilters] = useState({});

  useEffect(() => {
    document.title = "Products | ZyCart";
  }, []);

  // Update search state when URL search parameter changes
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/products");

        const list = Array.isArray(res.data.products)
          ? res.data.products
          : res.data;

        setProducts(list);

        if (list.length > 0) {
          const maxP = Math.max(...list.map((p) => Number(p.price)));
          setMaxPriceLimit(maxP);
          setPriceRange([0, maxP]);
        }
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // -------------------------
  // Filter + Sort
  // -------------------------
  const filtered = useMemo(() => {
    let list = [...products];

    // FILTER BY MAIN CATEGORY
    if (mainCategory) {
      list = list.filter((p) => p.mainCategory === mainCategory);
    }

    // FILTER BY SUB CATEGORY
    if (subCategory) {
      list = list.filter((p) => p.subCategory === subCategory);
    }

    // FILTER BY SUB-SUB CATEGORY
    if (subSubCategory) {
      list = list.filter((p) => p.subSubCategory === subSubCategory);
    }

    // FILTER BY ATTRIBUTES
    if (Object.keys(attributeFilters).length > 0) {
      list = list.filter((p) => {
        return Object.entries(attributeFilters).every(([key, selectedOptions]) => {
          if (!selectedOptions || selectedOptions.length === 0) return true;
          const productAttrValue = p.attributes?.[key];
          if (!productAttrValue) return false;
          const productValues = Array.isArray(productAttrValue) ? productAttrValue : [productAttrValue];
          return selectedOptions.some(option => productValues.includes(option));
        });
      });
    }

    // ADVANCED SEARCH - Search across title, description, specs, etc.
    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => {
        // Search in title
        const titleMatch = p.title?.toLowerCase().includes(q);
        
        // Search in description
        const descMatch = p.description?.toLowerCase().includes(q);
        
        // Search in attributes (specifications)
        let attrMatch = false;
        if (p.attributes && typeof p.attributes === 'object') {
          attrMatch = Object.entries(p.attributes).some(([key, value]) => {
            const keyMatch = key.toLowerCase().includes(q);
            const valueMatch = Array.isArray(value)
              ? value.some(v => String(v).toLowerCase().includes(q))
              : String(value).toLowerCase().includes(q);
            return keyMatch || valueMatch;
          });
        }
        
        // Search in main category
        const categoryMatch = p.mainCategory?.toLowerCase().includes(q);
        const subCategoryMatch = p.subCategory?.toLowerCase().includes(q);
        
        // Search by price if query is a number
        const priceQuery = parseFloat(q);
        const priceMatch = !isNaN(priceQuery) && Number(p.price) === priceQuery;
        
        return titleMatch || descMatch || attrMatch || categoryMatch || subCategoryMatch || priceMatch;
      });
    }

    // PRICE RANGE
    list = list.filter((p) => {
      const price = Number(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // SORTING
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt) -
            new Date(a.createdAt || a.updatedAt)
        );
        break;
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.createdAt || a.updatedAt) -
            new Date(b.createdAt || b.updatedAt)
        );
        break;
      case "title-asc":
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-desc":
        list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      default:
        break;
    }

    return list;
  }, [products, debouncedSearch, priceRange, sort, mainCategory, subCategory, subSubCategory, attributeFilters]);

  // -------------------------
  // Pagination
  // -------------------------
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, priceRange]);

  const visibleProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handlePageClick = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSearch("");
    setSort("");
    setPriceRange([0, maxPriceLimit]);
    setMainCategory("");
    setSubCategory("");
    setSubSubCategory("");
    setAttributeFilters({});
    setPage(1);
  };

  // HANDLE FILTER CHANGES FROM ProductFilter
  const handleFiltersChange = (newFilters) => {
    setMainCategory(newFilters.mainCategory || "");
    setSubCategory(newFilters.subCategory || "");
    setSubSubCategory(newFilters.subSubCategory || "");
    setAttributeFilters(newFilters.attributeFilters || {});
    setPriceRange([newFilters.priceMin || 0, newFilters.priceMax || maxPriceLimit]);
    setPage(1);
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto px-4 md:px-14 bg-linear-to-br from-gray-50 to-gray-100">
      <div className="container-main py-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1B2A41]">
            Browse Products
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Use search, filters, and sorting to find exactly what you need.
          </p>
        </motion.div>

        {/* MAIN LAYOUT - Filter (Left Sticky) + Products (Right) */}
        <div className="flex gap-6">
          {/* LEFT SIDE - STICKY FILTER */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 shrink-0"
          >
            <ProductFilter 
              onFilterChange={handleFiltersChange}
              onPriceChange={setPriceRange}
              productCount={total}
            />
          </motion.div>

          {/* RIGHT SIDE - PRODUCTS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            {/* SORT BAR */}
            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <span className="text-gray-700 font-medium">
                Showing <span className="font-bold">{total}</span> products
              </span>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-medium">Sort by:</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2 rounded-lg border shadow-sm bg-white focus:ring-2 focus:ring-indigo-400"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PRODUCT LIST */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader />
              </div>
            ) : visibleProducts.length > 0 ? (
              <>
                <ProductList products={visibleProducts} />
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg">
                <p className="text-gray-600 text-lg font-medium">No products found</p>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}

            {/* PAGINATION */}
            {visibleProducts.length > 0 && (
              <div className="flex items-center justify-between mt-12 mb-6">
                <p className="text-gray-600 text-sm">
                  Showing{" "}
                  <span className="font-semibold">
                    {(page - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(page * pageSize, total)}
                  </span>{" "}
                  of <span className="font-semibold">{total}</span>
                </p>

                <div className="flex items-center gap-2">
                  {/* FIRST */}
                  <button
                    onClick={() => handlePageClick(1)}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    {"<<"}
                  </button>

                  {/* PREV */}
                  <button
                    onClick={() => handlePageClick(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    Prev
                  </button>

                  {/* NUMBER BUTTONS */}
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const p = idx + 1;
                    if (
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 2 && p <= page + 2)
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageClick(p)}
                          className={`pagination-number ${p === page
                            ? "pagination-number-active"
                            : "pagination-number-idle"
                            }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === page - 3 || p === page + 3)
                      return (
                        <span key={p} className="px-2 text-gray-500">
                          ...
                        </span>
                      );

                    return null;
                  })}

                  {/* NEXT */}
                  <button
                    onClick={() => handlePageClick(page + 1)}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>

                  {/* LAST */}
                  <button
                    onClick={() => handlePageClick(totalPages)}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
