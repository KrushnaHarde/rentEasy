import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ShoppingCart,
  User,
  X,
  Bell,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Global variable to track scroll target
let pendingScrollTo = null;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState(0);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };
    checkLoginStatus();

    window.addEventListener("storage", checkLoginStatus);
    window.addEventListener("loginStateChanged", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("loginStateChanged", checkLoginStatus);
    };
  }, [location]);

  // Load products + cart count
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/product");
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart.length);
  }, []);

  // Smooth scroll to section (global scroll fix)
  useEffect(() => {
    if (location.pathname === "/" && pendingScrollTo) {
      const id = pendingScrollTo;
      pendingScrollTo = null;
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const results = products.filter((p) =>
      p.name.toLowerCase().includes(val.toLowerCase())
    );
    setSearchResults(results);
    setShowResults(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    setShowResults(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showResults && !event.target.closest(".search-container")) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showResults]);

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      pendingScrollTo = id;
      navigate("/");
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              className="text-blue-600 font-bold text-2xl cursor-pointer"
            >
              RentEasy
            </a>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 search-container">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full bg-white border border-blue-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
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
                          <span className="font-medium text-blue-600">
                            ₹{product.price}
                          </span>
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

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </a>
            <div
              className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer"
              onClick={() => navigate("/categories")}
            >
              <span>Categories</span>
              <ChevronDown size={16} className="ml-1" />
            </div>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("about-section");
              }}
              className="text-gray-600 hover:text-blue-600"
            >
              About
            </a>
            <a
              href="#testimonials"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("testimonials-section");
              }}
              className="text-gray-600 hover:text-blue-600"
            >
              Testimonials
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <button
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-200"
              onClick={() => navigate("/notifications")}
            >
              <Bell size={20} />
            </button>

            {/* Cart Icon */}
            <button
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-200"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart size={20} />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </button>

            <button
              className="text-gray-700 border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-md transition-all"
              onClick={() => navigate("/rent")}
            >
              Rent
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => navigate("/profile")}
                className="text-gray-700 hover:text-blue-600 transition-all duration-200"
              >
                <User size={22} />
              </button>
            ) : (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
