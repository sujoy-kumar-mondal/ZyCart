import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ChevronDown, Search, X } from 'lucide-react';

const ProductFilter = ({ onFilterChange, onPriceChange, productCount = 0 }) => {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [attributeSearches, setAttributeSearches] = useState({});
  const [showMoreAttributes, setShowMoreAttributes] = useState({});
  
  const [filters, setFilters] = useState({
    mainCategory: '',
    subCategory: '',
    subSubCategory: '',
    attributeFilters: {},
    priceMin: 0,
    priceMax: 999999,
  });

  // Fetch main categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/products/categories');
        if (response.data.success) {
          setMainCategories(response.data.categories);
        }
      } catch (err) {
      }
    };
    fetchCategories();
  }, []);

  // Fetch sub categories
  useEffect(() => {
    if (filters.mainCategory) {
      const fetchSubCategories = async () => {
        try {
          const response = await axiosInstance.get(`/products/categories/${filters.mainCategory}`);
          if (response.data.success) {
            setSubCategories(response.data.subCategories);
            setFilters(prev => ({ ...prev, subCategory: '', subSubCategory: '', attributeFilters: {} }));
            setAttributes({});
            setExpandedSections(prev => ({ ...prev, subCategory: true }));
          }
        } catch (err) {
        }
      };
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [filters.mainCategory]);

  // Fetch sub-sub categories
  useEffect(() => {
    if (filters.mainCategory && filters.subCategory) {
      const fetchSubSubCategories = async () => {
        try {
          const response = await axiosInstance.get(
            `/products/categories/${filters.mainCategory}/${filters.subCategory}`
          );
          if (response.data.success) {
            setSubSubCategories(response.data.subSubCategories);
            setFilters(prev => ({ ...prev, subSubCategory: '', attributeFilters: {} }));
            setAttributes({});
            setExpandedSections(prev => ({ ...prev, subSubCategory: true }));
          }
        } catch (err) {
        }
      };
      fetchSubSubCategories();
    } else {
      setSubSubCategories([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  // Fetch attributes
  useEffect(() => {
    if (filters.mainCategory && filters.subCategory && filters.subSubCategory) {
      const fetchAttributes = async () => {
        try {
          const response = await axiosInstance.get(
            `/products/categories/${filters.mainCategory}/${filters.subCategory}/${filters.subSubCategory}/attributes`
          );
          if (response.data.success) {
            const filterable = {};
            Object.entries(response.data.attributes).forEach(([key, config]) => {
              if (config.filterable && config.options && config.options.length > 0) {
                filterable[key] = config;
              }
            });
            setAttributes(filterable);
            // Auto-expand attributes section if there are attributes
            setExpandedSections(prev => ({ ...prev, attributes: Object.keys(filterable).length > 0 }));
          }
        } catch (err) {
        }
      };
      fetchAttributes();
    } else {
      setAttributes({});
    }
  }, [filters.mainCategory, filters.subCategory, filters.subSubCategory]);

  const handleCategoryChange = (e) => {
    setFilters(prev => ({
      ...prev,
      mainCategory: e.target.value,
      subCategory: '',
      subSubCategory: '',
      attributeFilters: {}
    }));
  };

  const handleSubCategoryChange = (e) => {
    setFilters(prev => ({
      ...prev,
      subCategory: e.target.value,
      subSubCategory: '',
      attributeFilters: {}
    }));
  };

  const handleSubSubCategoryChange = (e) => {
    setFilters(prev => ({
      ...prev,
      subSubCategory: e.target.value,
      attributeFilters: {}
    }));
  };

  const handlePriceChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceMin: min,
      priceMax: max
    }));
    if (onPriceChange) {
      onPriceChange([min, max]);
    }
  };

  const handleAttributeChange = (key, option) => {
    setFilters(prev => {
      const current = prev.attributeFilters[key] || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return {
        ...prev,
        attributeFilters: {
          ...prev.attributeFilters,
          [key]: updated
        }
      };
    });
  };

  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      });
    }
  };

  const clearFilters = () => {
    const cleared = {
      mainCategory: '',
      subCategory: '',
      subSubCategory: '',
      attributeFilters: {},
      priceMin: 0,
      priceMax: 999999,
    };
    setFilters(cleared);
    setAttributeSearches({});
    setShowMoreAttributes({});
    if (onFilterChange) {
      onFilterChange(cleared);
    }
    if (onPriceChange) {
      onPriceChange([0, 999999]);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get popular attribute options (first 5)
  const getPopularOptions = (options) => {
    return options?.slice(0, 5) || [];
  };

  // Get remaining attribute options
  const getRemainingOptions = (options) => {
    return options?.slice(5) || [];
  };

  // Filter options by search
  const getFilteredOptions = (options, searchTerm) => {
    if (!searchTerm) return options;
    return options?.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-4">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Filters</h3>
        {productCount > 0 && (
          <p className="text-sm text-gray-500">{productCount.toLocaleString()} products found</p>
        )}
      </div>

      {/* Main Category */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('mainCategory')}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm font-semibold text-gray-800">Category</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${
              expandedSections.mainCategory ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.mainCategory && (
          <div className="mt-3 space-y-2">
            <select
              value={filters.mainCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {mainCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sub Category */}
      {filters.mainCategory && subCategories.length > 0 && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          <button
            onClick={() => toggleSection('subCategory')}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-semibold text-gray-800">Sub Category</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                expandedSections.subCategory ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.subCategory && (
            <div className="mt-3 space-y-2">
              <select
                value={filters.subCategory}
                onChange={handleSubCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sub Categories</option>
                {subCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Sub Sub Category */}
      {filters.mainCategory && filters.subCategory && subSubCategories.length > 0 && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          <button
            onClick={() => toggleSection('subSubCategory')}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-semibold text-gray-800">Type</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                expandedSections.subSubCategory ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.subSubCategory && (
            <div className="mt-3 space-y-2">
              <select
                value={filters.subSubCategory}
                onChange={handleSubSubCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {subSubCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm font-semibold text-gray-800">Price</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.price && (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => handlePriceChange(parseInt(e.target.value) || 0, filters.priceMax)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => handlePriceChange(filters.priceMin, parseInt(e.target.value) || 999999)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Dynamic Attributes */}
      {Object.keys(attributes).length > 0 && (
        Object.entries(attributes).map(([key, config]) => {
          const searchTerm = attributeSearches[key] || '';
          const allOptions = config.options || [];
          const filteredOptions = getFilteredOptions(allOptions, searchTerm);
          const popularOptions = getPopularOptions(filteredOptions);
          const remainingOptions = getRemainingOptions(filteredOptions);
          const hasMoreOptions = remainingOptions.length > 0;

          return (
            <div key={key} className="border-b border-gray-200 pb-4 mb-4">
              <button
                onClick={() => toggleSection(key)}
                className="flex items-center justify-between w-full"
              >
                <span className="text-sm font-semibold text-gray-800">{key}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    expandedSections[key] ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSections[key] && (
                <div className="mt-3 space-y-3">
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${key}`}
                      value={searchTerm}
                      onChange={(e) => setAttributeSearches(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Popular Filters Section */}
                  {!searchTerm && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Popular Filters</p>
                      <div className="space-y-2">
                        {popularOptions.map(option => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.attributeFilters[key]?.includes(option) || false}
                              onChange={() => handleAttributeChange(key, option)}
                              className="w-4 h-4 border-gray-300 text-orange-500 focus:ring-orange-500 rounded"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View More */}
                  {hasMoreOptions && !searchTerm && (
                    <button
                      onClick={() => setShowMoreAttributes(prev => ({ ...prev, [key]: !prev[key] }))}
                      className="text-blue-600 text-sm hover:text-blue-700 font-medium"
                    >
                      {showMoreAttributes[key] ? 'View Less' : 'View More'}
                    </button>
                  )}

                  {/* Show Remaining Options when View More is clicked */}
                  {showMoreAttributes[key] && !searchTerm && (
                    <div className="space-y-2">
                      {remainingOptions.map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.attributeFilters[key]?.includes(option) || false}
                            onChange={() => handleAttributeChange(key, option)}
                            className="w-4 h-4 border-gray-300 text-orange-500 focus:ring-orange-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Show All Filtered Options when searching */}
                  {searchTerm && (
                    <div className="space-y-2">
                      {filteredOptions.map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.attributeFilters[key]?.includes(option) || false}
                            onChange={() => handleAttributeChange(key, option)}
                            className="w-4 h-4 border-gray-300 text-orange-500 focus:ring-orange-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition-colors mt-6"
      >
        Apply
      </button>

      {/* Clear Button */}
      <button
        onClick={clearFilters}
        className="w-full mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};

export default ProductFilter;
