import React, { useState, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import category1 from "../assets/category1.jpg";
import category2 from "../assets/category2.jpg";
import category3 from "../assets/category3.jpg";
import category4 from "../assets/category4.jpg";
import category5 from "../assets/category5.jpg";
import category6 from "../assets/category6.jpg";
import category7 from "../assets/category7.jpg";
import category8 from "../assets/category8.jpg";
import category9 from "../assets/category9.jpg";
import category10 from "../assets/category10.jpg";
import category11 from "../assets/category11.jpg";
import category12 from "../assets/category12.jpg";
import category13 from "../assets/category13.jpg";
import category14 from "../assets/category14.jpg";
import category15 from "../assets/category15.jpg";
import handshake from '../assets/handshake.png'

const categories = [
  { name: "Clothing", image: category4, size: "tall" },
  { name: "Books", image: category2, size: "square" },
  { name: "Fashion accessories", image: category1, size: "tall" },
  { name: "Gym equipments", image: category11, size: "square" },
  { name: "Electronics", image: category5, size: "tall" },
  { name: "Camera", image: category6, size: "square" },
  { name: "Footwear", image: category7, size: "tall" },
  { name: "Furniture", image: category8, size: "square" },
  { name: "Bicycle", image: category9, size: "tall" },
  { name: "Tools & machinery", image: category10, size: "square" },
  { name: "Electronic equipments", image: category15, size: "tall" },
  { name: "Party supplies", image: category12, size: "square" },
  { name: "Vehicles", image: category13, size: "tall" },
  { name: "Watches", image: category14, size: "square" },
  { name: "Home appliances", image: category3, size: "tall" },
  // musical instruments, sport equ, party supplies, gaming, pet supplies, home decor
];

function Home() {

  // const navigate = useNavigate();

  // const [menuOpen, setMenuOpen] = useState(false);
  // const categories = [
  //   "Clothing", "Fashion Accessories", "Books", "Electronics", 
  //   "Footwear", "Furniture", "Watches", "Home Appliances"
  // ];


  return (
    <div className="bg-[#0B0B0B] min-h-screen text-white pt-24 px-10">


      <h2 className="text-4xl py-7 font-serif italic mb-8 text-center text-[#BEB5AB]">"Rent Smarter, Live Better."</h2>

      {/* Masonry Grid Layout (Only Vertical & Square) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-15 auto-rows-[200px]">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-lg group 
              ${category.size === "tall" ? "row-span-2" : ""} h-full`}
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-70 transition-opacity duration-300 rounded-lg">
              <p className="text-lg font-semibold">{category.name}</p>
            </div>
          </div>
        ))}
      </div>


      <div className="flex justify-center mt-16">
      <h1 className="text-8xl font-extrabold uppercase tracking-wide stroke-text linear-gradient(90deg, #e66465, #9198e5)">
        {"R e n t E a s y"}
      </h1>

      <style>
           {`
      .stroke-text {
            color: transparent;
            -webkit-text-stroke: 2px transparent;
            -webkit-text-fill-color: transparent;
            background: #BEB5AB;
            -webkit-background-clip: text;
            -webkit-text-stroke-color: transparent;
          }
        `}
      </style>
    </div>



    <div className="mt-32 flex flex-col items-center text-white relative py-20 px-6 bg-[#0B0B0B]">
      {/* About Us Heading */}
      <motion.h2
        className="text-6xl font-extrabold text-[#BEB5AB] mb-6 tracking-wide uppercase"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        About Us
      </motion.h2>
      
      {/* Handshake Logo Animation */}
      <motion.img
        src={handshake}
        alt="Handshake Logo"
        className="w-24 h-24 mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Mission Statement */}
      <motion.p
        className="text-xl text-center max-w-3xl px-6 leading-relaxed mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        At RentEasy, we believe in making renting more accessible and affordable.
        Our platform connects people with the things they need, whether it's furniture, vehicles, 
        or equipment, without the burden of ownership.
      </motion.p>
      
      {/* Key Features */}
      <div className="max-w-2xl w-full grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
        {["Affordable Prices - Rent at budget-friendly rates", 
          "Wide Range of Products - Find everything from electronics to vehicles", 
          "Secure Transactions - Safe and verified rentals", 
          "Seamless Experience - Simple, fast, and reliable service"].map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-3 p-4 bg-[#1A1A1A] rounded-lg shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 * index }}
          >
            <FaCheckCircle className="text-[#BEB5AB] text-2xl" />
            <span className="text-lg">{feature}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-[#0B0B0B] text-white pt-24 px-10">
      {/* Other content remains the same */}
      
      {/* Call to Action */}
      <motion.button
        onClick={() => navigate("/signup")} // Navigate to signup form
        className="mt-8 px-6 py-3 text-lg font-bold bg-[#BEB5AB] text-black rounded-full shadow-lg hover:bg-[#a89e94] transition"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        Start Renting Today!
      </motion.button>
    </div>
      
      {/* Tag with Glow Effect */}
      <motion.p
        className="text-[#BEB5AB] text-2xl mt-6 font-semibold"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        @hamchaar
      </motion.p>
    </div>


    </div>
  );
}

export default Home;
