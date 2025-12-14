// pages/ProductsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "../utils/axiosInstance.js";
import ProductList from "../components/ProductList";
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(50000);

  useEffect(() => {
    document.title = "Products | ZyCart";
  }, []);

  // -------------------------
  // Fetch Products
  // -------------------------
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
        console.error(err);
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

    // SEARCH
    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
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
  }, [products, debouncedSearch, priceRange, sort]);

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
    setPage(1);
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto px-14 bg-linear-to-br from-gray-50 to-gray-100">
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

        {/* FILTER BAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            bg-white/70 backdrop-blur-lg border border-gray-200
            p-6 rounded-2xl shadow-md mb-10
          "
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* SEARCH */}
            <div>
              <label className="text-sm text-gray-700 font-medium">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  mt-2 w-full px-4 py-2 rounded-lg border 
                  focus:ring-2 focus:ring-blue-400 shadow-sm
                "
              />
            </div>

            {/* PRICE RANGE */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Price Range
              </label>

              <p className="mt-1 font-semibold text-[#1B2A41]">
                ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
              </p>

              {/* SLIDER */}
              <div className="relative w-full mt-5 pb-3">
                {/* Base track */}
                <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full bg-gray-300 rounded"></div>

                {/* Active Track */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded"
                  style={{
                    left: `${(priceRange[0] / maxPriceLimit) * 100}%`,
                    width: `${((priceRange[1] - priceRange[0]) / maxPriceLimit) * 100}%`,
                  }}
                />

                {/* Ranges */}
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]);
                  }}
                  className="thumb thumb-left absolute w-full bg-transparent pointer-events-none appearance-none"
                />

                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= priceRange[0]) setPriceRange([priceRange[0], v]);
                  }}
                  className="thumb thumb-right absolute w-full bg-transparent pointer-events-none appearance-none"
                />
              </div>
            </div>

            {/* SORT */}
            <div>
              <label className="text-sm text-gray-700 font-medium">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="
                  mt-2 w-full px-4 py-2 rounded-lg border shadow-sm
                  bg-white focus:ring-2 focus:ring-indigo-400
                "
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RESET BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              onClick={resetFilters}
              className="
                text-sm font-semibold text-indigo-600 hover:underline 
                transition
              "
            >
              Reset Filters
            </button>
          </div>
        </motion.div>

        {/* PRODUCT LIST */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold mb-6 text-[#1B2A41]"
          >
            Products
          </motion.h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : (
            <ProductList products={visibleProducts} />
          )}
        </section>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-12">
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
      </div>
    </div>
  );
};

export default ProductsPage;
