import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import ProductList from "../components/ProductList";
import ProductFilter from "../components/ProductFilter";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Filter, SlidersHorizontal, ArrowUpDown, X, Grid, List } from "lucide-react";

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SORT_OPTIONS = [
  { value: "", label: "Default Relevance" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "oldest", label: "Oldest First" },
  { value: "title-asc", label: "Title: A → Z" },
  { value: "title-desc", label: "Title: Z → A" },
];

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(search);

  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(50000);

  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subSubCategory, setSubSubCategory] = useState("");
  const [attributeFilters, setAttributeFilters] = useState({});

  useEffect(() => {
    document.title = "Catalog & Products | ZyCart";
  }, []);

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

  const filtered = useMemo(() => {
    let list = [...products];

    if (mainCategory) {
      list = list.filter((p) => p.mainCategory === mainCategory);
    }

    if (subCategory) {
      list = list.filter((p) => p.subCategory === subCategory);
    }

    if (subSubCategory) {
      list = list.filter((p) => p.subSubCategory === subSubCategory);
    }

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

    if (debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        
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
        
        const categoryMatch = p.mainCategory?.toLowerCase().includes(q);
        const subCategoryMatch = p.subCategory?.toLowerCase().includes(q);
        
        const priceQuery = parseFloat(q);
        const priceMatch = !isNaN(priceQuery) && Number(p.price) === priceQuery;
        
        return titleMatch || descMatch || attrMatch || categoryMatch || subCategoryMatch || priceMatch;
      });
    }

    list = list.filter((p) => {
      const price = Number(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

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
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handleFiltersChange = (newFilters) => {
    setMainCategory(newFilters.mainCategory || "");
    setSubCategory(newFilters.subCategory || "");
    setSubSubCategory(newFilters.subSubCategory || "");
    setAttributeFilters(newFilters.attributeFilters || {});
    setPriceRange([newFilters.priceMin || 0, newFilters.priceMax || maxPriceLimit]);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Explore Product Catalog
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Discover verified products with smart filters, price ranges, and sorting.
            </p>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Filter className="w-4 h-4" /> Filters &amp; Categories ({total})
          </button>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <ProductFilter 
              onFilterChange={handleFiltersChange}
              onPriceChange={setPriceRange}
              productCount={total}
            />
          </div>

          {/* Main Products Grid Column */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Sorting & Result Count Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-700">
                Showing <span className="text-blue-600 font-black">{total}</span> matching products
              </span>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort by:</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product List */}
            {loading ? (
              <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-slate-200/80">
                <Loader />
              </div>
            ) : visibleProducts.length > 0 ? (
              <ProductList products={visibleProducts} />
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                <p className="text-4xl">🔍</p>
                <p className="text-lg font-bold text-slate-900">No products found</p>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Try adjusting your search query, price ranges, or clearing specific category filters.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {visibleProducts.length > 0 && totalPages > 1 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-500">
                  Page {page} of {totalPages} ({total} items)
                </p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handlePageClick(1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    «
                  </button>

                  <button
                    onClick={() => handlePageClick(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    Prev
                  </button>

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
                          className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer ${
                            p === page
                              ? "bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-md shadow-blue-500/20"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === page - 3 || p === page + 3) {
                      return <span key={p} className="text-xs text-slate-400">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageClick(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageClick(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                  >
                    »
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end lg:hidden">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900">Filters &amp; Categories</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProductFilter 
              onFilterChange={(newFilters) => {
                handleFiltersChange(newFilters);
                setMobileFilterOpen(false);
              }}
              onPriceChange={setPriceRange}
              productCount={total}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsPage;
