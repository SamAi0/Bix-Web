import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constant";
import { toast } from "react-toastify";

const ProductReviews = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/product/${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }

    try {
      const reviewData = {
        productId,
        rating: parseInt(rating),
        comment
      };

      if (editingReview) {
        // Update existing review
        await axios.put(`${API_URL}/api/reviews/${editingReview._id}`, reviewData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Review updated successfully");
        setEditingReview(null);
      } else {
        // Create new review
        await axios.post(`${API_URL}/api/reviews`, reviewData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Review submitted successfully");
      }

      // Reset form
      setRating(5);
      setComment("");
      setShowReviewForm(false);
      
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting review");
    }
  };

  const getUserReview = () => {
    const username = localStorage.getItem("username");
    return reviews.find(review => review.username === username);
  };

  const userReview = getUserReview();

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          <i className="fas fa-star text-warning me-2"></i>
          Customer Reviews
        </h4>
        {!userReview && !showReviewForm && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowReviewForm(true)}
          >
            <i className="fas fa-plus me-1"></i>Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {(showReviewForm || editingReview) && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editingReview ? "Edit Your Review" : "Write a Review"}</h5>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="form-label">Rating</label>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`fas fa-star fs-4 me-1 cursor-pointer ${
                        star <= rating ? "text-warning" : "text-muted"
                      }`}
                      onClick={() => setRating(star)}
                    ></span>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Review</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  required
                ></textarea>
              </div>
              
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingReview ? "Update Review" : "Submit Review"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setRating(5);
                    setComment("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User's Review (if exists and not editing) */}
      {userReview && !editingReview && (
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5>Your Review</h5>
                <div className="mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`fas fa-star ${i < userReview.rating ? 'text-warning' : 'text-muted'}`}
                    ></span>
                  ))}
                  <small className="text-muted ms-2">
                    {new Date(userReview.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <p className="mb-2">{userReview.comment}</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEditReview(userReview)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteReview(userReview._id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-comment-slash text-muted fa-2x mb-3"></i>
          <h5>No reviews yet</h5>
          <p className="text-muted">Be the first to review this product!</p>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <span className="badge bg-primary fs-6">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
          
          {reviews
            .filter(review => !userReview || review._id !== userReview._id)
            .map((review) => (
            <div key={review._id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{review.username}</h6>
                    <div className="mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`fas fa-star ${i < review.rating ? 'text-warning' : 'text-muted'}`}
                        ></span>
                      ))}
                      <small className="text-muted ms-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="mb-0">{review.comment}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;