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
  
  // Function to ensure image URLs are complete
  const getCompleteImageUrl = (url) => {
    // If URL is null or undefined
    if (!url) return '';
    
    // If URL is already absolute (starts with http or https), return as is
    if (url.startsWith('http')) return url;
    
    // If it's a Cloudinary path (contains 'RentEasy/')
    if (url.includes('RentEasy/')) {
      // Make sure to use the correct cloud name from your environment
      return `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${url}`;
    }
    
    // Fallback for local development or other relative paths
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
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
        console.log("Fetching product with ID:", id);
        const res = await fetch(`http://localhost:5000/product/${id}`, {withCredentials: true});
        const data = await res.json();
        console.log("Product data received:", data);
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
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} hover:cursor-[pointer]`}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
      </svg>
    ));
  };

  // Render selectable stars for review form
  const renderSelectableStars = () => {
    return Array(5).fill(0).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setReviewForm({...reviewForm, rating: i + 1})}
        className="focus:outline-none mr-1"
        aria-label={`Rate ${i + 1} stars`}
      >
        <svg 
          className={`w-8 h-8 transition-colors duration-200 ${i < reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      </button>
    ));
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!product) return <div className="text-center mt-10">Product not found</div>;
  
  // Prepare all images array for navigation - properly handle both absolute and relative URLs
  const allImages = [
    getCompleteImageUrl(product.productImage),
    ...(product.additionalImages || []).map(img => getCompleteImageUrl(img))
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
              onError={(e) => {
                console.error("Image failed to load:", allImages[selectedImage]);
                e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
              }}
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
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/100?text=Image";
                  }}
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
              <span className="text-3xl font-bold text-[#1399c6]">₹{product.price}</span>
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
                    className="bg-[#1399c6] hover:bg-[#0f85ad] text-white font-medium py-2 px-4 rounded-lg disabled:opacity-70"
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
              className="bg-[#1399c6] hover:bg-[#0f85ad] cursor-pointer text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              onClick={() => setShowRentalForm(true)}
              disabled={showRentalForm}
            >
              RENT NOW
            </button>
          </div>
        </div>
      </div>
      
      {/* Reviews Section - Enhanced with actual reviews */}
      <div 
        className="relative p-6" 
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Ratings & Reviews</h2>
          <button 
            onClick={() => setShowReviewForm(true)}
            className="bg-[#1399c6] hover:bg-[#0f85ad] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-md"
          >
            Write a Review
          </button>
        </div>
        
        {reviewsLoading ? (
          <div className="text-center p-6 bg-white rounded-lg shadow-md border border-[#1399c6]/20">
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-[#1399c6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-3 text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white p-5 rounded-lg shadow-md border border-[#1399c6]/30"
                style={{
                  boxShadow: '0 4px 12px rgba(19, 153, 198, 0.1)'
                }}
              > 
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className="font-medium text-gray-800">{review.user.fullName || "User"}</span>
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
                      <div key={idx} className="h-20 w-20 rounded-lg overflow-hidden shadow-sm">
                        <img 
                          src={getCompleteImageUrl(img)}
                          alt={`Review image ${idx+1}`} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100?text=Review";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="text-center bg-white p-8 rounded-lg border border-[#1399c6]/30"
            style={{
              boxShadow: '0 4px 12px rgba(19, 153, 198, 0.1)'
            }}
          >
            <div className="mb-4 text-[#1399c6]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">No reviews yet for this product.</p>
            <p className="text-gray-500 mt-2">Be the first one to share your experience!</p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-#fff bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div 
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: '0 10px 25px rgba(19, 153, 198, 0.2)',
              border: '1px solid rgba(19, 153, 198, 0.3)'
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Write a Review</h3>
                <button 
                  onClick={() => setShowReviewForm(false)} 
                  className="text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {reviewStatus.success ? (
                <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center border border-green-200">
                  <div className="flex justify-center mb-3 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg">Thank You!</h4>
                  <p>Your review has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center">
                      {renderSelectableStars()}
                    </div>
                  </div>
                  
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewInputChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 focus:border-[#1399c6] focus:ring focus:ring-[#1399c6]/20 rounded-lg transition"
                      placeholder="Share your thoughts about this product..."
                      required
                    ></textarea>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Photos (Optional, max 3)
                    </label>
                    
                    {/* Image preview */}
                    {previewImages.length > 0 && (
                      <div className="flex gap-3 mb-4">
                        {previewImages.map((url, index) => (
                          <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                            <img 
                              src={url} 
                              alt={`Preview ${index+1}`} 
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {previewImages.length < 3 && (
                      <div className="mt-2">
                        <div className="relative">
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                            multiple={previewImages.length < 2}
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {previewImages.length === 0 ? "Choose Photos" : "Add More Photos"}
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Max 3 images, 5MB per image. Supported formats: JPG, PNG
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Error message */}
                  {reviewStatus.error && (
                    <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200">
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Error: {reviewStatus.error}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="mr-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewStatus.loading || reviewForm.rating === 0}
                      className="bg-[#1399c6] hover:bg-[#0f85ad] text-white px-5 py-2 rounded-lg font-medium text-sm shadow-md transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {reviewStatus.loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : 'Submit Review'}
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