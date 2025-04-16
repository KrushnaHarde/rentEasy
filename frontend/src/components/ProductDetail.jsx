import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartStatus, setCartStatus] = useState({ loading: false, success: false, error: null });
  const [rentalDates, setRentalDates] = useState({
    startDate: "",
    endDate: ""
  });
  const [rentalStatus, setRentalStatus] = useState({ loading: false, success: false, error: null });
  const [showRentalForm, setShowRentalForm] = useState(false);
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    images: []
  });
  const [reviewStatus, setReviewStatus] = useState({ loading: false, success: false, error: null });
  // For file preview
  const [previewImages, setPreviewImages] = useState([]);
  
  // Get tomorrow's date as a default start date
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Calculate default end date (tomorrow + 3 days)
  const getDefaultEndDate = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 4);
    return endDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    // Set default dates
    setRentalDates({
      startDate: getTomorrow(),
      endDate: getDefaultEndDate()
    });
    
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/product/${id}`);
        const data = await res.json();
        setProduct(data);
        setSelectedImage(0);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await fetch(`http://localhost:5000/review/product/${id}`);
        console.log("id: ", id);
        console.log("Reviews response:", res);
        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  // Reset the review form when closing
  useEffect(() => {
    if (!showReviewForm) {
      setReviewForm({
        rating: 5,
        comment: "",
        images: []
      });
      setPreviewImages([]);
    }
  }, [showReviewForm]);

  // Function to handle adding to cart
  const handleAddToCart = async () => {
    setCartStatus({ loading: true, success: false, error: null });
    
    try {
      console.log("Adding to cart:", id);
      const response = await fetch('http://localhost:5000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, quantity: 1 }),
        credentials: 'include', // Include cookies for auth
      });
      console.log("Add to cart response:", response);
      
      // Check for non-JSON responses first
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 50)}...`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }
      
      setCartStatus({ loading: false, success: true, error: null });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCartStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      console.error('Add to cart error:', error);
      setCartStatus({ loading: false, success: false, error: error.message });
    }
  };

  // Function to handle the rental process
  const handleRentNow = async (e) => {
    e.preventDefault();
    setRentalStatus({ loading: true, success: false, error: null });
    
    try {
      const response = await fetch('http://localhost:5000/rental/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: id,
          startDate: rentalDates.startDate,
          endDate: rentalDates.endDate
        }),
        credentials: 'include', // Include cookies for auth
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rent product');
      }
      
      setRentalStatus({ loading: false, success: true, error: null });
      setShowRentalForm(false);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setRentalStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      console.error('Rental error:', error);
      setRentalStatus({ loading: false, success: false, error: error.message });
    }
  };

  // Handle review form input changes
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewImages.length > 3) {
      alert("You can upload a maximum of 3 images");
      return;
    }

    // Create new array with preview URLs
    const newPreviewImages = [...previewImages];
    files.forEach(file => {
      newPreviewImages.push(URL.createObjectURL(file));
    });
    setPreviewImages(newPreviewImages);
    
    // Update form state with all selected files
    setReviewForm(prevForm => ({
      ...prevForm,
      images: [...prevForm.images, ...files]
    }));
  };

  // Remove preview image
  const removeImage = (index) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setReviewForm(prevForm => ({
      ...prevForm,
      images: prevForm.images.filter((_, i) => i !== index)
    }));
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewStatus({ loading: true, success: false, error: null });

    try {
      // Create FormData for multipart form submission (for images)
      const formData = new FormData();

      if (!id) {
        throw new Error('Product ID is missing');
      }

      formData.append('productId', id);
      formData.append('rating', reviewForm.rating);
      formData.append('comment', reviewForm.comment);
      
      // Append each image file
      if (reviewForm.images.length > 0) {
        reviewForm.images.forEach(image => {
          formData.append('reviewImages', image);
        });
      }

      console.log("FormData:", formData);
      
      const response = await fetch('http://localhost:5000/review', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for auth
      });
        console.log("Review response:", response);

      const data = await response.json();
      
      if (!response.ok) {
        
        throw new Error(data.error || 'Failed to submit review');
      }
      
      // Success! Close the form and refresh reviews
      setReviewStatus({ loading: false, success: true, error: null });
      
      // Close the form and refresh reviews after showing success message
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewStatus(prev => ({ ...prev, success: false }));
        
        // Fetch updated reviews
        const fetchReviews = async () => {
          try {
            setReviewsLoading(true);
            const res = await fetch(`http://localhost:5000/review/product/${id}`);
            const data = await res.json();
            setReviews(data);
          } catch (err) {
            console.error("Failed to fetch reviews:", err);
          } finally {
            setReviewsLoading(false);
          }
        };
        fetchReviews();
      }, 2000);
    } catch (error) {
      console.error('Review submission error:', error);
      setReviewStatus({ loading: false, success: false, error: error.message });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-lg ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Render selectable stars for review form
  const renderSelectableStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setReviewForm({...reviewForm, rating: i})}
          className={`text-2xl focus:outline-none ${i <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!product) return <div className="text-center mt-10">Product not found</div>;
  
  // Prepare all images array for navigation
  const baseURL = "http://localhost:5000";
  const allImages = [
    baseURL + product.productImage,
    ...(product.additionalImages || []).map(img => baseURL + img)
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left: Image Gallery Section */}
        <div className="md:w-1/2 p-6">
          {/* Main large image */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 h-96 flex items-center justify-center">
            <img
              src={allImages[selectedImage]}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          {/* Thumbnail images row */}
          <div className="flex gap-3 overflow-x-auto py-2">
            {allImages.map((img, i) => (
              <div 
                key={i}
                className={`cursor-pointer rounded-md overflow-hidden h-20 w-20 ${
                  selectedImage === i ? 'ring-2 ring-blue-500' : 'hover:opacity-80'
                }`}
                onClick={() => setSelectedImage(i)}
              >
                <img
                  src={img}
                  alt={`view-${i+1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Right: Product Info Section */}
        <div className="md:w-1/2 p-6 bg-white">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            
            {/* Description immediately after title */}
            <p className="text-gray-600 mt-2">{product.description}</p>
          </div>
          
          {/* Eye-catching price */}
          <div className="mb-6 mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-blue-600">₹{product.price}</span>
              <span className="ml-2 text-gray-600 font-medium">per day</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">max Duration: {product.duration?.days} days</p>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-gray-500 text-sm block">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-gray-500 text-sm block">Condition</span>
                <span className="font-medium">{product.productCondition}</span>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                <span className="text-yellow-500 text-lg mr-1">★</span>
                <span className="font-bold">{product.rating}</span>
                <span className="text-gray-500 text-sm ml-1">/5</span>
              </div>
            </div>
          </div>
          
          {/* Status messages */}
          {cartStatus.success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
              Product has been successfully added to your cart!
            </div>
          )}
          
          {cartStatus.error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              Cart Error: {cartStatus.error}
            </div>
          )}
          
          {rentalStatus.success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
              Rental request created successfully!
            </div>
          )}
          
          {rentalStatus.error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              Rental Error: {rentalStatus.error}
            </div>
          )}
          
          {/* Rental Form */}
          {showRentalForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3">Select Rental Dates</h3>
              <form onSubmit={handleRentNow}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      min={getTomorrow()}
                      value={rentalDates.startDate}
                      onChange={(e) => setRentalDates({...rentalDates, startDate: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      min={rentalDates.startDate}
                      value={rentalDates.endDate}
                      onChange={(e) => setRentalDates({...rentalDates, endDate: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowRentalForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rentalStatus.loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-70"
                  >
                    {rentalStatus.loading ? 'Processing...' : 'Confirm Rental'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Button section */}
          <div className="flex justify-start gap-4 mt-8">
            <button 
              className={`bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 ${cartStatus.loading ? 'opacity-75' : ''}`}
              onClick={handleAddToCart}
              disabled={cartStatus.loading}
            >
              {cartStatus.loading ? 'ADDING...' : 'ADD TO CART'}
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              onClick={() => setShowRentalForm(true)}
              disabled={showRentalForm}
            >
              RENT NOW
            </button>
          </div>
        </div>
      </div>
      
      {/* Reviews Section - Enhanced with actual reviews */}
      <div className="bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Ratings & Reviews</h2>
          <button 
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Write a Review
          </button>
        </div>
        
        {reviewsLoading ? (
          <div className="text-center p-6">
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
                // im here
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm"> 
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className="font-medium">{review.user.fullName || "User"}</span>
                      {review.isVerifiedRent && (
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          Verified Rent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                
                <p className="mt-3 text-gray-700">{review.comment}</p>
                
                {/* Display review images if any */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="h-20 w-20 rounded overflow-hidden">
                        <img 
                          src={baseURL + img} 
                          alt={`Review image ${idx+1}`} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-6 rounded-lg">
            <p className="text-gray-500">No reviews yet for this product.</p>
            <p className="text-gray-500 mt-2">Be the first one to review!</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Write a Review</h3>
                <button 
                  onClick={() => setShowReviewForm(false)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              {reviewStatus.success ? (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                  <p className="font-medium">Review submitted successfully!</p>
                  <p className="mt-2">Thank you for your feedback.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex">
                      {renderSelectableStars()}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewInputChange}
                      rows="4"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Share your thoughts about this product..."
                      required
                    ></textarea>
                  </div>

                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Photos (Optional, max 3)
                    </label>
                    
                    {/* Image preview */}
                    {previewImages.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {previewImages.map((url, index) => (
                          <div key={index} className="relative h-20 w-20">
                            <img 
                              src={url} 
                              alt={`Preview ${index+1}`} 
                              className="h-full w-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {previewImages.length < 3 && (
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="text-sm"
                          multiple={true}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max 3 images, 5MB per image
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Error message */}
                  {reviewStatus.error && (
                    <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
                      Error: {reviewStatus.error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={reviewStatus.loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-70"
                    >
                      {reviewStatus.loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;