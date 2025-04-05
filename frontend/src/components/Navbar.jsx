// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Menu, Search } from 'lucide-react';
// import handshakeLogo from '../assets/handshake.png'; // Ensure the correct path

// function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);

//   // Categories list
//   const categories = [
//     "Clothing", "Fashion Accessories", "Books", "Electronics", 
//     "Footwear", "Furniture"
//   ];
//   const navigate = useNavigate();

//   return (
//     <nav className="fixed top-0 w-full bg-[#0B0B0B] p-4 flex items-center text-white z-50 shadow-md">
//       {/* Left: Hamburger Menu, Brand Name & Search Box */}
//       <div className="flex items-center gap-4 flex-1">
//         <Menu 
//           size={28} 
//           className="text-[#949494] cursor-pointer" 
//           onClick={() => setMenuOpen(!menuOpen)} 
//         />


// {/* Dropdown Menu */}
// {menuOpen && (
//           <div className="absolute top-12 left-0 bg-[#1a1a1a] w-64 shadow-lg rounded-lg p-4 z-50">
//             <ul className="space-y-2">
//               {categories.map((category, index) => (
//                 <li 
//                   key={index} 
//                   className="px-4 py-2 hover:bg-gray-700 rounded-md cursor-pointer"
//                 >
//                   {category}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}


//         <h1 className="text-3xl font-bold animate-shine bg-gradient-to-r from-gray-400 via-white to-gray-300 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')} >
//   RentEasy
// </h1>
        
//         {/* Search Box next to RentEasy */}
//         <div className="bg-[#333333] p-2 rounded-3xl flex items-center ml-4">
//           <Search size={20} className="text-white" />
//           <input 
//             type="text" 
//             placeholder="Search..." 
//             className="bg-transparent outline-none px-2 text-white placeholder-gray-400"
//           />
//         </div>
//       </div>

//       {/* Center: Animated Handshake Logo */}
//       <div className="flex-1 flex justify-center">
//         <img src={handshakeLogo} alt="Logo" className="w-10 h-10 animate-shine" />
//       </div>

//       {/* Right: Buttons */}
//       <div className="flex gap-4 flex-1 justify-end">
//         <button className="border-white px-4 py-1.5 rounded-4xl hover:bg-white hover:text-black transition duration-300" onClick={() => navigate('/signup')}>
//           Sign Up
//         </button>
//         <button className="border-white px-4 py-1.5 rounded-4xl hover:bg-white hover:text-black transition duration-300" onClick={() => navigate('/signup')}>
//           Rent
//         </button>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;















import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import handshakeIcon from "../assets/handshake.png"; // Import the image

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user"); // Assuming user data is stored after login
    setIsLoggedIn(!!user); // Convert to boolean
  }, []);

  return (
    <nav className="bg-[#080838] p-4 shadow-md flex items-center justify-between">
      {/* Logo with Image (clicking redirects to Home) */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => navigate("/home")}
      >
        <img src={handshakeIcon} alt="Handshake" className="w-10 h-10" />
        <span className="text-white text-2xl font-bold">RentEasy</span>
      </div>

      {/* Search Bar */}
      <div className="flex-grow mx-4">
        <input
          type="text"
          placeholder="Search for items..."
          className="w-150 p-1 px-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Categories Dropdown */}
      <div className="text-white font-medium cursor-pointer hover:underline">
        Categories
      </div>

      {/* Cart Icon */}
      <div className="text-white text-xl mx-4 cursor-pointer">
        <FaShoppingCart />
      </div>

      {/* Toggle between Profile Icon and Sign Up Button */}
      {isLoggedIn ? (
        <FaUserCircle
          className="text-3xl text-white cursor-pointer hover:text-indigo-500"
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
    </nav>
  );
};

export default Navbar;
