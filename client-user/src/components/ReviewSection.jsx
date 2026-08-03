import React, { useState, useEffect } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import axios from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import Loader from './Loader';
import { useAuth } from '../context/AuthProvider';

const ReviewSection = ({ productId, userOrders = [] }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sort, setSort] = useState('-createdAt');

  // Get delivered orders for this product
  const deliveredOrders = userOrders.filter(order => {
    if (order.status !== 'Delivered') return false;
    return order.childOrders?.some(child =>
      child.items?.some(item => item.productId === productId)
    );
  });

  const canReview = user && deliveredOrders.length > 0;
  
  // Check if current user has already written a review
  const hasUserReviewed = reviews.some(review => review.user._id === user?._id);

  useEffect(() => {
    fetchReviews();
  }, [productId, sort]);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      const response = await axios.get(`/reviews/product/${productId}`, {
        params: {
          page: pageNum,
          limit: 5,
          sort,
        },
      });

      if (response.data.success) {
        if (pageNum === 1) {
          setReviews(response.data.reviews);
        } else {
          setReviews([...reviews, ...response.data.reviews]);
        }
        setStats(response.data.stats);
        setHasMore(pageNum < response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = (newReview) => {
    setReviews([newReview, ...reviews]);
    setShowForm(false);
    setSelectedOrder(null);
    // Refetch stats
    fetchReviews(1);
  };

  const handleReviewDelete = (reviewId) => {
    setReviews(reviews.filter(r => r._id !== reviewId));
    // Refetch stats
    fetchReviews(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Stats Section */}
      {stats && stats.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">{stats.avgRating}</span>
              <span className="text-gray-500">/5</span>
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(stats.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{stats.totalReviews} reviews</p>
          </div>

          {/* Rating Breakdown */}
          <div className="col-span-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingBreakdown[rating];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {canReview && !showForm && !hasUserReviewed && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-8 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            orderId={selectedOrder || deliveredOrders[0]._id}
            onSuccess={handleReviewSuccess}
            onCancel={() => {
              setShowForm(false);
              setSelectedOrder(null);
            }}
          />
        </div>
      )}

      {/* Sort & Filter */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">
            {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
          </h3>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-rating">Highest Rating</option>
            <option value="rating">Lowest Rating</option>
            <option value="-helpful">Most Helpful</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewItem
                key={review._id}
                review={review}
                onDelete={handleReviewDelete}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <button
              onClick={() => fetchReviews(page + 1)}
              className="w-full mt-8 py-3 text-gray-600 hover:text-orange-500 font-semibold transition-colors border-t border-gray-200 pt-6"
            >
              Load More Reviews
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No reviews yet</p>
          {canReview ? (
            <p className="text-gray-500">Be the first to review this product!</p>
          ) : (
            <p className="text-gray-500">You need to purchase and receive this product to leave a review</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
