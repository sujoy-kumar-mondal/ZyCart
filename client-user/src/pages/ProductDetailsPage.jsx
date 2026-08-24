import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Check, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewSection from '../components/ReviewSection';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { useWishlist } from '../context/WishlistProvider';
import { useSettings } from '../context/SettingsProvider';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist: checkIsInWishlist } = useWishlist();
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [seller, setSeller] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [discountCountdown, setDiscountCountdown] = useState('');
  const [showCountdownBanner, setShowCountdownBanner] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Check if product is in wishlist using context function or direct check
  const isInWishlist = checkIsInWishlist(id) || wishlist.some(item => 
    item._id === id || item.product?._id === id || item.product === id
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/products/${id}`);
        if (response.data.success) {
          const productData = response.data.product;
          setProduct(productData);
          
          // Fetch seller info
          if (productData.seller) {
            try {
              const sellerId = typeof productData.seller === 'string' ? productData.seller : productData.seller._id;
              const sellerRes = await axiosInstance.get(`/seller/${sellerId}`);
              if (sellerRes.data.success) {
                setSeller(sellerRes.data.seller);
              }
            } catch (err) {
              console.error("Seller fetch error:", err);
            }
          }
          
          // Track view
          await axiosInstance.post('/products/update-trend-view', { productId: id });
        } else {
          setError(response.data.message || 'Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    // Fetch user orders
    const fetchUserOrders = async () => {
      if (user) {
        try {
          const response = await axiosInstance.get('/orders/my-orders');
          if (response.data.success) {
            setUserOrders(response.data.orders || []);
          }
        } catch (err) {
          console.error("User orders error:", err);
        }
      }
    };

    fetchProduct();
    fetchUserOrders();
  }, [id, user]);

  // Clamp quantity if it exceeds available stock or max purchase limit
  useEffect(() => {
    if (product && product.stock > 0) {
      const maxAllowed = Math.min(product.stock, product.maxQuantityPerPurchase || product.stock);
      if (quantity > maxAllowed) {
        setQuantity(Math.max(1, maxAllowed));
      }
    }
  }, [product]);

  // Countdown timer for discount (only show if remaining time < 24h)
  useEffect(() => {
    if (!product || !product.discountPeriod || product.discount <= 0) {
      setShowCountdownBanner(false);
      return;
    }

    const calculateCountdown = () => {
      const expiryTime = new Date(product.discountPeriod).getTime();
      const currentTime = new Date().getTime();
      const difference = expiryTime - currentTime;

      if (difference <= 0) {
        setDiscountCountdown('Expired');
        setShowCountdownBanner(false);
        return;
      }

      // Show countdown banner ONLY if remaining time < 24 hours
      const isUnder24Hours = difference < 24 * 60 * 60 * 1000;
      setShowCountdownBanner(isUnder24Hours);

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let countdownText = '';
      if (hours > 0) {
        countdownText = `${hours}h ${minutes}m ${seconds}s left`;
      } else if (minutes > 0) {
        countdownText = `${minutes}m ${seconds}s left`;
      } else {
        countdownText = `${seconds}s left`;
      }
      
      setDiscountCountdown(countdownText);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [product]);

  // Fetch related products ("You might also like")
  useEffect(() => {
    if (!product) return;

    const fetchRelatedProducts = async () => {
      try {
        setRelatedLoading(true);
        const response = await axiosInstance.get(`/products?mainCategory=${encodeURIComponent(product.mainCategory)}`);
        if (response.data.success) {
          const list = response.data.products || response.data.allProducts || [];
          let filtered = list.filter((p) => p._id !== product._id && p.isAvailable);

          if (filtered.length < 4) {
            const allRes = await axiosInstance.get('/products');
            if (allRes.data.success) {
              const allList = allRes.data.products || allRes.data.allProducts || [];
              const extra = allList.filter(
                (p) => p._id !== product._id && p.isAvailable && !filtered.some((f) => f._id === p._id)
              );
              filtered = [...filtered, ...extra];
            }
          }

          setRelatedProducts(filtered.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (!product) return;
    try {
      const res = await addToCart(product, quantity);
      if (res && res.requireLogin) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }
      toast.success('Added to cart!');
      try {
        await axiosInstance.post('/products/update-trend-purchase', { 
          productId: id,
          quantity: quantity 
        });
      } catch (err) {
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to buy items');
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      await addToCart(product, quantity);
      toast.success('Added to cart! Redirecting to checkout...');
      try {
        await axiosInstance.post('/products/update-trend-purchase', { 
          productId: id,
          quantity: quantity 
        });
      } catch (err) {
      }
      navigate('/checkout');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process order');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (!product) {
      toast.error('Product not loaded');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        const result = await removeFromWishlist(id);
        if (result.success) {
          toast.success('Removed from wishlist');
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await addToWishlist({ _id: product._id });
        if (result.success) {
          toast.success('Added to wishlist!');
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3F51F4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-2">Product Error</h2>
          <p>{error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  const isExpired = product.discountPeriod && new Date(product.discountPeriod) <= new Date();
  const hasActiveDiscount = !isExpired && (product.discount > 0 || (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price));

  const discountedPrice = hasActiveDiscount
    ? (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price
        ? product.discountedPrice
        : Math.round(product.price * (1 - (product.discount || 0) / 100)))
    : product.price;

  const discountPct = product.discount > 0
    ? product.discount
    : (product.discountedPrice && product.discountedPrice < product.price ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumbs Navigation Header */}
        <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <Breadcrumb 
            mainCategory={product.mainCategory}
            subCategory={product.subCategory}
            subSubCategory={product.subSubCategory}
            productTitle={product.title}
          />
        </div>

        {/* Primary Product Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Gallery Showcase */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
            <div className="relative bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 group">
              
              {/* Main Image View */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                <img
                  src={product.images?.[selectedImage] || 'https://placehold.co/600x600?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating Wishlist Heart */}
                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-md hover:shadow-lg transition transform active:scale-90 border border-slate-200/60 z-10 disabled:opacity-50"
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isInWishlist ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-red-500"
                    }`}
                  />
                </button>

                {/* Left/Right Carousel Controls */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md hover:bg-white transition text-slate-700 hover:scale-110 active:scale-95"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md hover:bg-white transition text-slate-700 hover:scale-110 active:scale-95"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Selector Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        selectedImage === idx
                          ? "border-[#3F51F4] ring-2 ring-[#3F51F4]/20 shadow-md scale-105"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            
            {/* Category & Seller Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {product.mainCategory} • {product.subCategory}
              </span>

              {seller && (
                <span className="text-xs font-semibold text-slate-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Sold by <span className="font-extrabold text-blue-900">{seller.storeName || seller.fullName}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2A41] leading-tight">
              {product.title}
            </h1>

            {/* Pricing Section */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/60 space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                {hasActiveDiscount ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                      {currency}{discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-slate-400 line-through font-semibold">
                      {currency}{product.price.toLocaleString()}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-extrabold text-green-700 bg-green-100 border border-green-200 rounded-lg">
                      {discountPct}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-[#1B2A41]">
                    {currency}{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium">Inclusive of all taxes</p>

              {/* 24h Expiry Urgency Countdown Banner */}
              {product.discount > 0 && product.discountPeriod && showCountdownBanner && discountCountdown !== 'Expired' && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-amber-600 fill-amber-500 animate-bounce" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Special Offer Ending Soon!</p>
                    <p className="text-sm font-extrabold text-amber-950">
                      Discount expires in <span className="text-red-600">{discountCountdown}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Scarcity Status */}
            <div className="flex items-center gap-3">
              {product.isAvailable && product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-bold">
                    {product.stock < 5 ? (
                      <span className="text-red-600 font-extrabold">Only {product.stock} left in stock!</span>
                    ) : product.stock < 10 ? (
                      <span className="text-amber-600 font-extrabold">Only few left</span>
                    ) : (
                      <span className="text-emerald-700">In Stock &amp; Ready to Ship</span>
                    )}
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  ✕ Out of Stock / Unavailable
                </span>
              )}
            </div>

            {/* Quantity Selector & Purchase Actions */}
            {product.isAvailable && product.stock > 0 && (
              <div className="space-y-5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold text-slate-700">Quantity:</label>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-base font-extrabold text-slate-900 min-w-[2.5rem] text-center select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        const maxAllowed = Math.min(product.stock, product.maxQuantityPerPurchase || product.stock);
                        if (quantity < maxAllowed) {
                          setQuantity(quantity + 1);
                        }
                      }}
                      disabled={quantity >= Math.min(product.stock, product.maxQuantityPerPurchase || product.stock)}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 px-6 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-lg shadow-blue-500/20 transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 px-6 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-95 shadow-lg shadow-orange-500/20 transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    ⚡ Buy Now
                  </button>
                </div>
              </div>
            )}

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Truck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">Fast Delivery</p>
                <p className="text-[10px] text-slate-500">{settings.estimatedDeliveryDays || "Doorstep shipping"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">100% Genuine</p>
                <p className="text-[10px] text-slate-500">Verified seller</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <RefreshCw className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">Easy Returns</p>
                <p className="text-[10px] text-slate-500">Hassle-free policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Description & Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Description Card (FIRST) */}
          <div className={`${product.attributes && Object.keys(product.attributes).length > 0 ? "lg:col-span-6" : "lg:col-span-12"} flex flex-col bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4`}>
            <h2 className="text-xl font-extrabold text-[#1B2A41] flex items-center gap-2 border-b border-slate-100 pb-4">
              <span>📝</span> Product Description
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line grow">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* Specifications Card (SECOND) */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="lg:col-span-6 flex flex-col bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-xl font-extrabold text-[#1B2A41] flex items-center gap-2 border-b border-slate-100 pb-4">
                <span>📋</span> Product Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 grow">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 flex flex-col justify-center">
                    <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {key}
                    </dt>
                    <dd className="text-sm font-extrabold text-slate-900">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* "You Might Also Like" Recommendation Section */}
        <div className="pt-4 space-y-6">
          <h2 className="text-2xl font-extrabold text-[#1B2A41]">You might also like</h2>

          {relatedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-200 h-80 rounded-2xl animate-pulse"></div>
              <div className="bg-slate-200 h-80 rounded-2xl animate-pulse"></div>
              <div className="bg-slate-200 h-80 rounded-2xl animate-pulse"></div>
              <div className="bg-slate-200 h-80 rounded-2xl animate-pulse"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">No related products found.</p>
          )}
        </div>

        {/* Reviews Section */}
        <div className="pt-4">
          <ReviewSection productId={id} userOrders={userOrders} />
        </div>

      </div>
    </div>
  );
};

export default ProductDetailsPage;
