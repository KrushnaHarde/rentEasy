import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layers, Archive } from "lucide-react";

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  
  // Format the category name to PascalCase for API requests and properly encode spaces
  const formattedCategoryName = categoryName
    ? categoryName.split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : "";
  
  // URL encoded version for API requests
  const encodedCategoryName = encodeURIComponent(formattedCategoryName);
  
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryProducts, setSubcategoryProducts] = useState({});
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noSubcategories, setNoSubcategories] = useState(false);

  // Fetch subcategories for the selected category
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/product/metadata/subcategories/${encodedCategoryName}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setSubcategories(data);
        
        // If no subcategories found, set flag to fetch products directly by category
        if (data.length === 0) {
          setNoSubcategories(true);
        } else {
          // Create empty product arrays for each subcategory
          const productMap = {};
          data.forEach(subcategory => {
            productMap[subcategory] = [];
          });
          setSubcategoryProducts(productMap);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setError("Failed to load subcategories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubcategories();
  }, [encodedCategoryName]);

  // Fetch products directly by category if no subcategories exist
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(
          `http://localhost:5000/product/category/${encodedCategoryName}`,
          {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products for category ${categoryName}`);
        }
        
        const data = await response.json();
        setCategoryProducts(data);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (noSubcategories) {
      fetchProductsByCategory();
    }
  }, [noSubcategories, encodedCategoryName, categoryName]);

  // Fetch products for each subcategory
  useEffect(() => {
    const fetchProductsForSubcategories = async () => {
      try {
        const updatedProductMap = { ...subcategoryProducts };
        
        // Fetch products for each subcategory
        for (const subcategory of subcategories) {
          const encodedSubcategory = encodeURIComponent(subcategory);
          
          const response = await fetch(
            `http://localhost:5000/product/category/${encodedCategoryName}/${encodedSubcategory}`,
            {
              credentials: 'include',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to fetch products for ${subcategory}`);
          }
          
          const data = await response.json();
          updatedProductMap[subcategory] = data;
        }
        
        setSubcategoryProducts(updatedProductMap);
      } catch (error) {
        console.error("Error fetching subcategory products:", error);
        setError("Failed to load products. Please try again later.");
      }
    };

    if (subcategories.length > 0) {
      fetchProductsForSubcategories();
    }
  }, [subcategories, encodedCategoryName]);

  // Helper function to handle image URLs properly
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a complete URL (from Cloudinary), use it directly
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Otherwise, append to the local server URL
    return `http://localhost:5000${imageUrl}`;
  };

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (isLoading && subcategories.length === 0 && categoryProducts.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600 text-xl">Loading category information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  // Display products directly if no subcategories found
  if (noSubcategories) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 capitalize">
            {categoryName}
          </h1>
          <p className="text-gray-600">
            {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
            <Archive size={48} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700">No products found</h2>
            <p className="text-gray-500 mt-2">
              There are no products available in this category.
            </p>
            <button 
              onClick={() => navigate("/categories")}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                onClick={() => handleProductClick(product._id)}
              >
                {product.productImage ? (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={getImageUrl(product.productImage)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 text-gray-800">
                    {product.name}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    {product.subcategory || categoryName}
                  </div>
                  <div className="text-blue-600 font-bold">
                    ₹{product.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Count total products across all subcategories
  const totalProducts = Object.values(subcategoryProducts)
    .reduce((total, products) => total + products.length, 0);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 capitalize">
          {categoryName}
        </h1>
        <p className="text-gray-600">
          {subcategories.length} {subcategories.length === 1 ? "subcategory" : "subcategories"} with {totalProducts} {totalProducts === 1 ? "product" : "products"}
        </p>
      </div>

      {subcategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <Layers size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-700">No subcategories found</h2>
          <p className="text-gray-500 mt-2">
            Please check back later or browse other categories.
          </p>
          <button 
            onClick={() => navigate("/categories")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Categories
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {subcategories.map((subcategory) => {
            const products = subcategoryProducts[subcategory] || [];
            
            return (
              <div key={subcategory} className="space-y-6">
                <div className="border-b pb-2">
                  <h2 className="text-xl font-semibold capitalize">
                    {subcategory}
                  </h2>
                  <p className="text-gray-600">
                    {products.length} {products.length === 1 ? "product" : "products"}
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">Don't have product yet...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                        onClick={() => handleProductClick(product._id)}
                      >
                        {product.productImage ? (
                          <div className="h-48 bg-gray-200">
                            <img
                              src={getImageUrl(product.productImage)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image available</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-1 text-gray-800">
                            {product.name}
                          </h3>
                          <div className="text-sm text-gray-500 mb-2">
                            {product.subcategory}
                          </div>
                          <div className="text-blue-600 font-bold">
                            ₹{product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;