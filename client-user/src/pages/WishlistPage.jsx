import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useWishlist } from "../context/WishlistProvider";
import { useCart } from "../context/CartProvider";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    document.title = "My Wishlist | ZyCart";
    fetchWishlist();
  }, []);

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    toast.success("Moved to cart!");
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
    toast.success("Removed from wishlist!");
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 py-8 md:py-16">
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] bg-clip-text text-transparent">
            My Wishlist
          </h1>
          <p className="text-gray-600 text-lg">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </motion.div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center space-y-6"
          >
            <div className="text-6xl">💔</div>
            <div>
              <h2 className="text-2xl font-bold text-[#1B2A41] mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Start adding items to your wishlist to save them for later!
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item, idx) => {
                const product = item.product;
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition group"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 h-64 md:h-72">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 md:p-6 space-y-3">
                      <Link
                        to={`/product/${product._id}`}
                        className="hover:text-[#3F51F4] transition"
                      >
                        <h3 className="text-lg font-semibold text-[#1B2A41] line-clamp-2 hover:text-[#3F51F4]">
                          {product.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price & Stock */}
                      <div className="flex justify-between items-center py-2 border-t border-gray-200">
                        <div>
                          <p className="text-2xl font-bold text-[#3F51F4]">
                            ₹{product.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Stock</p>
                          <p
                            className={`font-semibold ${
                              product.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {product.stock > 0 ? `${product.stock} left` : "Out"}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMoveToCart(product)}
                          disabled={product.stock === 0 || !product.isAvailable}
                          className={`py-2.5 rounded-lg font-semibold transition text-sm ${
                            product.stock === 0 || !product.isAvailable
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-white hover:shadow-lg"
                          }`}
                        >
                          🛒 Add to Cart
                        </motion.button>
                        <Link
                          to={`/product/${product._id}`}
                          className="py-2.5 rounded-lg font-semibold border-2 border-[#3F51F4] text-[#3F51F4] hover:bg-blue-50 transition text-sm text-center"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-8"
            >
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-white border-2 border-[#3F51F4] text-[#3F51F4] rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                ← Continue Shopping
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
