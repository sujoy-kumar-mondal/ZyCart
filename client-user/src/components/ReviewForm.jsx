import React, { useState } from 'react';
import { Star, X, Upload } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, orderId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        // Upload through backend
        const response = await axiosInstance.post('/reviews/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          uploadedUrls.push(response.data.imageUrl);
        }
      }

      setImages([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a review title');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/reviews', {
        productId,
        orderId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        onSuccess(response.data.review);
        // Reset form
        setRating(0);
        setTitle('');
        setComment('');
        setImages([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  (hoveredRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="text-sm text-gray-600 mt-2">{rating} out of 5 stars</p>}
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your detailed experience with this product..."
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
      </div>

      {/* Images */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Add Images ({images.length}/3)
        </label>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Review ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 3 && (
          <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <Upload size={20} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload image'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || images.length >= 3}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting || uploading}
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
