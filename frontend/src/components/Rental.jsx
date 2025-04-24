import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import axios from "axios";

const BaseUrl = "http://localhost:5000";

const Rental = () => {
  const categories = {
    "Bikes": ["Scooty", "Motorcycle"],
    "Fashion Jewelry": ["Necklace sets", "Earrings", "Rings", "Watches"],
    "Electronics & Appliances": ["Laptops", "Sound Systems / Bluetooth Speakers", "DSLR / Mirrorless Cameras", "HeadPhones Earphones"],
    "Furniture": ["Beds", "Study/normal Tables chairs", "Cupboards", "Dressing tables", "Book Shelves", "Sofas"],
    "Home Appliances": ["Refrigerators", "Washing Machines", "Microwave ovens", "Water purifiers", "Air conditioners"],
    "Clothing Fashion": ["Shirts Tshirts", "Bottoms", "Fashion cloths", "Ethnic Wear"],
    "Books": ["Fiction", "Non-Fiction", "Academic", "Comics", "Magazines"],
    "Sports Equipments": []
  };

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", 
    "Chandigarh", "Other"
  ];

  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    "duration[days]": "1",
    "location[city]": "",
    "location[address]": "",
    productImage: null,
    additionalImages: [],
    productCondition: "Good"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [productId, setProductId] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category: category
    }));
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setFormData(prev => ({
      ...prev,
      subcategory: subcategory
    }));
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        productImage: file
      }));
    }
  };

  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...files]
    }));
  };

  const handleRemoveProductImage = () => {
    setFormData(prev => ({
      ...prev,
      productImage: null
    }));
  };

  const handleRemoveAdditionalImage = (index) => {
    const newImages = [...formData.additionalImages];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      additionalImages: newImages
    }));
  };

  const getAuthToken = () => localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrorDetails(null);

    if (!selectedCategory || (categories[selectedCategory].length > 0 && !selectedSubcategory)) {
      setError("Please select a category and subcategory (if applicable)");
      setIsSubmitting(false);
      return;
    }

    if (!formData.productImage) {
      setError("Please upload a main product image");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataForSubmit = new FormData();
      
      // Append all form fields
      formDataForSubmit.append("name", formData.name);
      formDataForSubmit.append("description", formData.description);
      formDataForSubmit.append("price", formData.price);
      formDataForSubmit.append("duration[days]", formData["duration[days]"]);
      formDataForSubmit.append("location[city]", formData["location[city]"]);
      formDataForSubmit.append("location[address]", formData["location[address]"]);
      formDataForSubmit.append("category", selectedCategory);
      formDataForSubmit.append("productCondition", formData.productCondition);
      
      if (selectedSubcategory) {
        formDataForSubmit.append("subcategory", selectedSubcategory);
      }

      // Append the main product image
      formDataForSubmit.append("productImage", formData.productImage);

      // Append additional images if any
      formData.additionalImages.forEach((img) => {
        formDataForSubmit.append("additionalImages", img);
      });

      const token = getAuthToken();
      if (!token) throw new Error("Authentication token not found. Please log in again.");

      const response = await axios.post(`${BaseUrl}/product`, formDataForSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
        withCredentials: true
      });

      setProductId(response.data.product?._id);
      setSuccess(true);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        "duration[days]": "1",
        "location[city]": "",
        "location[address]": "",
        productImage: null,
        additionalImages: [],
        productCondition: "Good"
      });
    } catch (err) {
      if (err.response) {
        setError(`Server error: ${err.response?.data?.error || err.response.status}`);
        setErrorDetails(JSON.stringify(err.response.data, null, 2));
      } else if (err.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#1399c6] mb-8 text-center">
          List Your Product on RentEasy
        </h1>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your item has been listed successfully.</span>
            <p className="mt-2">Product ID: {productId}</p>
            <div className="mt-4 flex space-x-4">
              <button onClick={() => setSuccess(false)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                List Another Item
              </button> 
              
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
                {errorDetails && (
                  <details className="mt-2 text-sm">
                    <summary>Technical details</summary>
                    <pre className="overflow-auto p-2 bg-red-50 rounded-lg mt-2">{errorDetails}</pre>
                  </details>
                )}
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#016D6D] mb-4">Select a Category*</h2>
              <div className="space-y-2">
                {Object.entries(categories).map(([category, subcategories]) => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className={`flex items-center p-3 cursor-pointer transition-colors ${expandedCategories[category] ? "bg-[#F0FAFC]" : "hover:bg-[#E0F7FF]"}`}
                      onClick={() => toggleCategory(category)}>
                      <span className="mr-3 text-[#2AB3E6]">
                        {expandedCategories[category] ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => handleCategorySelect(category)}
                        onClick={(e) => e.stopPropagation()}
                        className="form-radio h-5 w-5 text-[#016D6D]"
                      />
                      <span className="ml-3 text-gray-700">{category}</span>
                    </div>
                    {expandedCategories[category] && subcategories.length > 0 && (
                      <div className="pl-12 bg-[#F9FEFF]">
                        {subcategories.map(subcategory => (
                          <div key={subcategory} className="flex items-center p-3 border-t border-gray-200 hover:bg-[#F1FAFB] cursor-pointer"
                            onClick={() => {
                              handleCategorySelect(category);
                              handleSubcategorySelect(subcategory);
                            }}>
                            <input
                              type="radio"
                              name="subcategory"
                              checked={selectedCategory === category && selectedSubcategory === subcategory}
                              readOnly
                              className="form-radio h-5 w-5 text-[#016D6D]"
                            />
                            <span className="ml-3 text-gray-700">{subcategory}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product Name*</label>
                <input 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price (₹)*</label>
                <input 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent" 
                  type="number" 
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Duration (Days)*</label>
                <input 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent" 
                  type="number" 
                  value={formData["duration[days]"]} 
                  onChange={e => setFormData({ ...formData, "duration[days]": e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City*</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent" 
                  value={formData["location[city]"]} 
                  onChange={e => setFormData({ ...formData, "location[city]": e.target.value })}
                  required
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Address*</label>
                <input 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent" 
                  value={formData["location[address]"]} 
                  onChange={e => setFormData({ ...formData, "location[address]": e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product Condition*</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent" 
                  value={formData.productCondition} 
                  onChange={e => setFormData({ ...formData, productCondition: e.target.value })}
                  required
                >
                  <option value="Good">Good</option>
                  <option value="Like New">Like New</option>
                  <option value="Brand New">Brand New</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description*</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent" 
                  rows="4" 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  required 
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Main Product Image*</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProductImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1399c6] file:text-white hover:file:bg-[#117a9c]"
                />
                {formData.productImage && (
                  <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(formData.productImage)} 
                      alt="Main product" 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button" 
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs rounded-bl-lg" 
                      onClick={handleRemoveProductImage}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Additional Images</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleAdditionalImagesUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1399c6] file:text-white hover:file:bg-[#117a9c]"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.additionalImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt={`Additional ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button" 
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs rounded-bl-lg" 
                        onClick={() => handleRemoveAdditionalImage(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-[#1399c6] hover:bg-[#117a9c] text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Rental;
