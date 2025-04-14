//navbar
import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import handshakeIcon from "../assets/handshakee.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  return (
    <nav className="bg-white py-4 px-6 shadow-md relative z-50 border-b border-[#8968CD]/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Left Side: Logo + RentEasy + Search */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={handshakeIcon} alt="Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#096192] to-[#8968CD] text-transparent bg-clip-text">
              RentEasy
            </span>
          </div>

          <div className="relative max-w-md w-64">
            <input
              type="text"
              placeholder="Search for items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-xl border border-[#8968CD]/20 focus:outline-none focus:ring-2 focus:ring-[#8968CD]/30 shadow-lg shadow-[#8968CD]/5 transition-all duration-200"
            />
            <Search className="absolute left-4 top-3 text-[#8968CD]" size={20} />
          </div>
        </div>

        {/* Right Side: Categories + Cart + Profile/SignUp */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/categories")}
            className="text-[#096192] font-medium px-4 py-2 rounded-lg hover:bg-[#1399c6]/10 transition duration-200"
          >
            Categories
          </button>

          <div
            className="relative cursor-pointer hover:text-[#1399c6] transition-all duration-200"
            onClick={() => navigate("/cart")}
          >
            <FaShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-[#24aae2] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
              2
            </span>
          </div>

          {isLoggedIn ? (
            <FaUserCircle
              className="text-3xl text-[#8968CD] cursor-pointer hover:text-[#24aae2] transition duration-200"
              onClick={() => navigate("/profile")}
            />
          ) : (
            <button
              className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-500 hover:to-blue-600 transition-all"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
