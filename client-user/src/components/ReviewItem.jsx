import React, { useState } from 'react';
import { Star, ThumbsUp, Trash2 } from 'lucide-react';
import axios from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthProvider';

const ReviewItem = ({ review, onDelete }) => {
  const { user } = useAuth();
  const [helpful, setHelpful] = useState(review.helpful);
  const [deleting, setDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(
    review.helpfulBy?.includes(user?._id) || false
  );

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) {
      toast.info('You already marked this as helpful');
      return;
    }

    try {
      const response = await axios.post(`/reviews/${review._id}/helpful`);
      if (response.data.success) {
        setHelpful(helpful + 1);
        setHasMarkedHelpful(true);
        toast.success('Marked as helpful');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as helpful');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setDeleting(true);
    try {
      await axios.delete(`/reviews/${review._id}`);
      toast.success('Review deleted');
      onDelete(review._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % review.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + review.images.length) % review.images.length);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {/* User Info */}
          <div className="flex items-center gap-3 mb-2">
            {review.user.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {review.user.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{review.user.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{review.rating}.0</span>
          </div>
        </div>

        {/* Delete Button */}
        {user && user._id === review.user._id && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-700 disabled:text-gray-400 transition-colors"
            title="Delete review"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Title & Comment */}
      <div className="mb-4">
        <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64 flex items-center justify-center">
            {review.images[currentImageIndex] ? (
              <img
                src={review.images[currentImageIndex]}
                alt={`Review image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
            ) : (
              <p className="text-gray-400">Image not available</p>
            )}

            {review.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  ❮
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  ❯
                </button>
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1}/{review.images.length}
                </div>
              </>
            )}
          </div>

          {/* Image Thumbnails */}
          {review.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === currentImageIndex
                      ? 'border-orange-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumb ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50x50?text=X';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verified Badge & Helpful */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {review.verifiedPurchase && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
            ✓ Verified Purchase
          </span>
        )}

        {user && user._id === review.user._id ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <ThumbsUp size={16} />
            <span>Helpful ({helpful})</span>
          </div>
        ) : (
          <button
            onClick={handleMarkHelpful}
            disabled={hasMarkedHelpful}
            className={`flex items-center gap-2 transition-colors text-sm ${
              hasMarkedHelpful
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-orange-500'
            }`}
            title={hasMarkedHelpful ? 'You already marked this as helpful' : 'Mark as helpful'}
          >
            <ThumbsUp size={16} />
            <span>Helpful ({helpful})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
