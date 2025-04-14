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
    fetchProduct();
  }, [id]);

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
      
    //   Check for non-JSON responses first
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
      
      {/* Reviews Section */}
      <div className="bg-gray-50 p-6">
        <h2 className="text-xl font-bold mb-6">Ratings & Reviews</h2>
        
        {product.review ? (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full mr-2">
                  {product.rating} ★
                </div>
                <span className="font-medium">Verified Customer</span>
              </div>
            </div>
            <p className="mt-3 text-gray-700">{product.review}</p>
          </div>
        ) : (
          <div className="text-center bg-white p-6 rounded-lg">
            <p className="text-gray-500">No reviews yet for this product.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;