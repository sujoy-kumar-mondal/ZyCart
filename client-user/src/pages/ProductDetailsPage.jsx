import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewSection from '../components/ReviewSection';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { useWishlist } from '../context/WishlistProvider';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist: checkIsInWishlist, fetchWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [seller, setSeller] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [discountCountdown, setDiscountCountdown] = useState('');

  // Check if product is in wishlist using context function or direct check
  const isInWishlist = checkIsInWishlist(id) || wishlist.some(item => 
    item._id === id || item.product?._id === id || item.product === id
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/products/${id}`);
        if (response.data.success) {
          const productData = response.data.product;
          setProduct(productData);
          
          // Fetch seller info
          if (productData.seller) {
            try {
              // Handle both ID string and populated object
              const sellerId = typeof productData.seller === 'string' ? productData.seller : productData.seller._id;
              const sellerRes = await axiosInstance.get(`/seller/${sellerId}`);
              if (sellerRes.data.success) {
                setSeller(sellerRes.data.seller);
              }
            } catch (err) {
            }
          }
          
          // Track view
          await axiosInstance.post('/products/update-trend-view', { productId: id });
        } else {
          setError(response.data.message);
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
        }
      }
    };

    fetchProduct();
    fetchUserOrders();
  }, [id, user]);

  // Countdown timer for discount
  useEffect(() => {
    if (!product || !product.discountPeriod || product.discount <= 0) {
      return;
    }

    const calculateCountdown = () => {
      const expiryTime = new Date(product.discountPeriod).getTime();
      const currentTime = new Date().getTime();
      const difference = expiryTime - currentTime;

      if (difference <= 0) {
        setDiscountCountdown('Expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let countdownText = '';
      if (days > 0) {
        countdownText = `${days}d ${hours}h ${minutes}m ${seconds}s left`;
      } else if (hours > 0) {
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

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      // Use CartProvider's addToCart which syncs with DB
      await addToCart(product, quantity);
      toast.success('Added to cart!');
      // Track purchase trend
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
      toast.error('Please login to continue');
      return;
    }

    if (!product) return;

    try {
      // Add to cart first using CartProvider
      await addToCart(product, quantity);
      toast.success('Added to cart! Redirecting to checkout...');
      // Track purchase trend
      try {
        await axiosInstance.post('/products/update-trend-purchase', { 
          productId: id,
          quantity: quantity 
        });
      } catch (err) {
      }
      // Redirect to checkout
      window.location.href = '/checkout';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process order');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (!product) {
      toast.error('Product not loaded');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const result = await removeFromWishlist(id);
        if (result.success) {
          toast.success('Removed from wishlist');
        } else {
          toast.error(result.message);
        }
      } else {
        // Add to wishlist - pass the product object with _id
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
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-6 py-4 rounded-lg">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        {product && (
          <Breadcrumb 
            mainCategory={product.mainCategory}
            subCategory={product.subCategory}
            subSubCategory={product.subSubCategory}
            productTitle={product.title}
          />
        )}

        {/* Main Layout - Sticky Left Images + Scrollable Right Info */}
        <div className="flex gap-8 lg:h-screen">
          
          {/* LEFT SIDE - STICKY Images */}
          <div className="lg:w-1/3 shrink-0 sticky top-0 h-screen overflow-y-auto lg:overflow-y-hidden">
            {/* Thumbnails - Vertical Stack on Far Left */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mb-4">
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-3 transition-all shrink-0 ${
                        selectedImage === idx
                          ? 'border-blue-600 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-1 relative">
                  <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 h-96 flex items-center justify-center">
                    <img
                      src={product.images[selectedImage]}
                      alt={product.title}
                      className="w-full h-full object-contain p-4"
                    />

                    {/* Wishlist Button - Top Right Corner */}
                    <button 
                      onClick={handleWishlist}
                      disabled={wishlistLoading}
                      className={`absolute top-3 right-3 p-3 rounded-full shadow-lg transition-all z-20 ${
                        isInWishlist
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-white hover:bg-gray-100 border-2 border-red-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart 
                        className={`w-6 h-6 ${isInWishlist ? 'fill-white text-white' : 'text-red-500'}`}
                      />
                    </button>
                    
                    {/* Image Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg z-10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg z-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* If only one image */}
            {product.images.length === 1 && (
              <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 h-96 flex items-center justify-center mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
              </div>
            )}

            {/* Action Buttons Below Images */}
            {product.stock > 0 && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  ⚡ BUY NOW
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - Scrollable Product Information */}
          <div className="lg:w-2/3 space-y-6 overflow-y-auto lg:h-screen pr-4">
            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
                  <div className="flex items-center gap-3 mb-4">
                    {product.rating && (
                      <>
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">
                          ⭐ {product.rating}
                        </span>
                        <span className="text-gray-600 text-sm">28 ratings • 5 reviews</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 lg:mt-0 mt-2"
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-6 h-6 transition-all ${
                      isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Price Section */}
            <div className="border-y border-gray-200 py-6 space-y-3">
              <div className="flex items-baseline gap-3">
                {product.discount > 0 && discountCountdown !== 'Expired' ? (
                  <>
                    <span className="text-4xl font-bold text-gray-900">₹{Math.floor(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}</span>
                    <span className="text-lg text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                    <span className="text-green-600 font-bold text-lg">{product.discount}% off</span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                )}
              </div>
              
              {/* Discount Expiry Date */}
              {product.discount > 0 && product.discountPeriod && discountCountdown !== 'Expired' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600">Discount expires in</p>
                  <p className="text-lg font-bold text-green-700">
                    {discountCountdown}
                  </p>
                </div>
              )}
              
              {/* Discount Expired */}
              {product.discount > 0 && discountCountdown === 'Expired' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-semibold">Discount has expired</p>
                </div>
              )}
            </div>

            {/* Stock Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Available Stock</p>
                <p className="text-2xl font-bold text-green-600">{product.stock} units</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-bold text-green-600">✓ Available</p>
              </div>
            </div>

            {/* Seller Info */}
            {seller && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Sold by</p>
                <p className="font-semibold text-gray-900">{seller.shopName || 'Seller'}</p>
                <p className="text-xs text-gray-500 mt-1">Trusted Seller</p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 font-medium min-w-fit">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.maxQuantityPerPurchase || product.stock}
                      value={quantity}
                      onChange={(e) => {
                        const maxQty = product.maxQuantityPerPurchase || product.stock;
                        setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)));
                      }}
                      className="w-20 text-center border-none outline-none text-lg font-bold"
                    />
                    <button
                      onClick={() => {
                        const maxQty = product.maxQuantityPerPurchase || product.stock;
                        setQuantity(Math.min(maxQty, quantity + 1));
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                {product.maxQuantityPerPurchase && product.maxQuantityPerPurchase < product.stock && (
                  <p className="text-sm text-orange-600 mt-3">
                    ⚠️ Maximum {product.maxQuantityPerPurchase} unit(s) allowed per purchase
                  </p>
                )}
              </div>
            )}

            {/* Product Specifications */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                
                <div className="space-y-4">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {key}
                      </dt>
                      <dd className="text-base text-gray-900 font-medium">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewSection productId={id} userOrders={userOrders} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
