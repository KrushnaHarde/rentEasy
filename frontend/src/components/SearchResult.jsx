import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/product");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched products:", data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on query parameter
  useEffect(() => {
    if (!query) {
      setFilteredProducts([]);
      return;
    }

    const results = products.filter(product => {
      // Check if the product has a name property, otherwise use title
      const productName = product.name || product.title || "";
      return productName.toLowerCase().includes(query.toLowerCase());
    });
    
    setFilteredProducts(results);
  }, [products, query]);

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle image errors
  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg'; // Path to your placeholder image
    e.target.onerror = null; // Prevents infinite loop if placeholder also fails
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600 text-xl">Loading results...</div>
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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"} found
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <Search size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-700">No results found</h2>
          <p className="text-gray-500 mt-2">
            Try adjusting your search term or browse our categories.
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
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
              onClick={() => handleProductClick(product._id)}
            >
              {product.productImage ? (
                <div className="h-48 bg-gray-200">
                  <img
                    src={product.productImage} // Use the full Cloudinary URL directly
                    alt={product.name || product.title}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-800">
                  {product.name || product.title}
                </h3>
                <div className="text-sm text-gray-500 mb-2">
                  {product.category}
                </div>
                <div className="text-blue-600 font-bold">
                  ₹{product.price || product.rentPrice}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResult;