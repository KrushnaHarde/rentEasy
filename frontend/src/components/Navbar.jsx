// //navbar
// import React, { useState, useEffect } from "react";
// import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { Search } from "lucide-react";
// import handshakeIcon from "../assets/handshakee.png";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     const user = localStorage.getItem("user");
//     setIsLoggedIn(!!user);
//   }, []);

//   return (
//     <nav className="bg-white py-4 px-6 shadow-md relative z-50 border-b border-[#8968CD]/10">
//       <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
//         {/* Left Side: Logo + RentEasy + Search */}
//         <div className="flex items-center gap-6 flex-shrink-0">
//           <div
//             className="flex items-center space-x-2 cursor-pointer"
//             onClick={() => navigate("/")}
//           >
//             <img src={handshakeIcon} alt="Logo" className="w-10 h-10" />
//             <span className="text-2xl font-bold bg-gradient-to-r from-[#096192] to-[#8968CD] text-transparent bg-clip-text">
//               RentEasy
//             </span>
//           </div>

//           <div className="relative max-w-md w-64">
//             <input
//               type="text"
//               placeholder="Search for items..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full px-4 py-3 pl-12 rounded-xl border border-[#8968CD]/20 focus:outline-none focus:ring-2 focus:ring-[#8968CD]/30 shadow-lg shadow-[#8968CD]/5 transition-all duration-200"
//             />
//             <Search className="absolute left-4 top-3 text-[#8968CD]" size={20} />
//           </div>
//         </div>

//         {/* Right Side: Categories + Cart + Profile/SignUp */}
//         <div className="flex items-center gap-6">
//           <button
//             onClick={() => navigate("/categories")}
//             className="text-[#096192] font-medium px-4 py-2 rounded-lg hover:bg-[#1399c6]/10 transition duration-200"
//           >
//             Categories
//           </button>

//           <div
//             className="relative cursor-pointer hover:text-[#1399c6] transition-all duration-200"
//             onClick={() => navigate("/cart")}
//           >
//             <FaShoppingCart size={20} />
//             <span className="absolute -top-2 -right-2 bg-[#24aae2] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
//               2
//             </span>
//           </div>

//           {isLoggedIn ? (
//             <FaUserCircle
//               className="text-3xl text-[#8968CD] cursor-pointer hover:text-[#24aae2] transition duration-200"
//               onClick={() => navigate("/profile")}
//             />
//           ) : (
//             <button
//               className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-500 hover:to-blue-600 transition-all"
//               onClick={() => navigate("/signup")}
//             >
//               Sign Up
//             </button>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


import React, { useState, useEffect } from "react";
import { Search, Menu, ChevronDown, ShoppingCart, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import handshakeIcon from "../assets/handshake.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch products data when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/product');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Filter products based on search query
    const filteredResults = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(filteredResults);
    setShowResults(true);
  };

  // Handle search form submission (when user presses Enter)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setQuery("");
  };

  // Close search results
  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showResults && !event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  return (
    <div className="bg-gradient-to-r from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] text-black">
      <nav className="bg-white/70 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
              <img src={handshakeIcon} alt="Handshake" className="w-10 h-10 mr-2" />
              <h1 className="text-2xl font-bold text-blue-600">RentEasy</h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8 search-container">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full bg-white/90 border border-blue-300 rounded-xl py-2 px-4 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 shadow-md"
                  value={query}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />
                {query && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {showResults && (
                  <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto z-50 border border-blue-100">
                    {isLoading ? (
                      <div className="px-4 py-3 text-center text-gray-500">
                        Loading...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <div
                          key={product._id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleProductClick(product._id)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 flex justify-between">
                            <span>{product.category}</span>
                            <span className="font-medium text-blue-600">₹{product.price}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Right Menu */}
            <div className="flex items-center gap-6">
              {/* Categories */}
              <div
                className="hidden md:flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-all duration-200 font-medium"
                onClick={() => navigate("/categories")}
              >
                <span>Categories</span>
                <ChevronDown size={16} />
              </div>

              {/* Cart */}
              <button className="relative hover:text-blue-600 transition-all duration-200">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  2
                </span>
              </button>

              {/* Auth Buttons */}
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("profile")}
                  className="hover:text-blue-600 transition-all duration-200"
                >
                  <User size={24} />
                </button>
              ) : (
                <button
                  className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-600 hover:to-blue-400 px-5 py-2 rounded-xl shadow-lg text-white font-semibold transition-transform transform hover:scale-105"
                  onClick={() => navigate("signup")}
                >
                  Sign Up
                </button>
              )}

              {/* Mobile Menu */}
              <button className="md:hidden text-blue-600 hover:text-blue-400 transition-all duration-200">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;