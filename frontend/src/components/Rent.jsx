import React, { useState } from "react";
import { FaChevronDown, FaChevronRight, FaUpload } from "react-icons/fa";

const Rent = () => {
  // Category data structure
  const categories = {
    "Cars": [],
    "Properties": ["Apartments", "Houses", "Commercial"],
    "Mobiles": ["Smartphones", "Tablets", "Accessories"],
    "Jobs": [],
    "Bikes": ["Motorcycles", "Scooters", "Bicycles"],
    "Electronics & Appliances": ["TVs", "Refrigerators", "Washing Machines"],
    "Commercial Vehicles & Spares": [],
    "Furniture": ["Sofa & Dining", "Beds & Wardrobes", "Home Decor & Garden"],
    "Fashion": ["Men", "Women", "Kids"],
    "Books, Sports & Hobbies": [],
    "Pets": ["Dogs", "Cats", "Birds"]
  };

  // State management
  const [selectedCategories, setSelectedCategories] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    images: [],
    contactNumber: ""
  });

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle category selection
  const handleCategorySelect = (category, subcategory = null) => {
    const key = subcategory ? `${category}-${subcategory}` : category;
    setSelectedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      selectedCategories,
      ...formData
    });
    // Add your form submission logic here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">POST YOUR AD</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">CHOOSE A CATEGORY</h2>
          <div className="space-y-2">
            {Object.entries(categories).map(([category, subcategories]) => (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Main Category */}
                <div 
                  className={`flex items-center p-3 cursor-pointer transition-colors ${
                    expandedCategories[category] ? "bg-gray-50" : "hover:bg-[#FC94AF]"
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  <span className="mr-3">
                    {expandedCategories[category] ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!selectedCategories[category]}
                    onChange={() => handleCategorySelect(category)}
                    onClick={(e) => e.stopPropagation()}
                    className="form-checkbox h-5 w-5 text-[#BEB5AB] rounded focus:ring-[#BEB5AB]"
                  />
                  <span className="ml-3 text-gray-700">{category}</span>
                </div>

                {/* Subcategories (shown when expanded) */}
                {expandedCategories[category] && subcategories.length > 0 && (
                  <div className="pl-12 bg-gray-50">
                    {subcategories.map(subcategory => (
                      <div 
                        key={subcategory} 
                        className="flex items-center p-3 border-t border-gray-200 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCategorySelect(category, subcategory)}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedCategories[`${category}-${subcategory}`]}
                          onChange={() => {}}
                          className="form-checkbox h-5 w-5 text-[#BEB5AB] rounded focus:ring-[#BEB5AB]"
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

        {/* Item Details Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">ITEM DETAILS</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Title*</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#BEB5AB] focus:border-[#BEB5AB]"
                placeholder="e.g. Comfortable 3-seater sofa for rent"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Description*</label>
              <textarea
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#BEB5AB] focus:border-[#BEB5AB]"
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Price per month (₹)*</label>
                <input
                  type="number"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#BEB5AB] focus:border-[#BEB5AB]"
                  placeholder="e.g. 2000"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Location*</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#BEB5AB] focus:border-[#BEB5AB]"
                  placeholder="e.g. Mumbai, Andheri West"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">UPLOAD PHOTOS</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <label className="cursor-pointer">
              <div className="flex flex-col items-center justify-center">
                <FaUpload className="text-4xl text-[#BEB5AB] mb-2" />
                <p className="text-gray-700">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">JPEG, PNG (Max 5MB each)</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          {formData.images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">CONTACT INFORMATION</h2>
          <div>
            <label className="block text-gray-700 mb-1">Phone Number*</label>
            <input
              type="tel"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#BEB5AB] focus:border-[#BEB5AB]"
              placeholder="e.g. 9876543210"
              value={formData.contactNumber}
              onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-[#FC94AF] hover:bg-[#FE7F9C] text-Black font-bold rounded-lg transition-colors"
        >
          POST NOW
        </button>
      </form>
    </div>
  );
};

export default Rent;