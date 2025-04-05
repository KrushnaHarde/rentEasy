import React, { useState, useRef, useEffect } from "react";
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
import handshake from '../assets/handshake.png';
import stationary1 from "../assets/stationary1.png";
import gadget from "../assets/gadget.jpg";
import gym from "../assets/gym.jpg";
import home_makeover from "../assets/home_makeover.png";
import car from "../assets/car.jpg";


const categories = [
  { name: "Clothing", image: category4 },
  { name: "Books", image: category2 },
  { name: "Fashion accessories", image: category1 },
  { name: "Gym equipments", image: category11 },
  { name: "Electronics", image: category5 },
  { name: "Camera", image: category6 },
  { name: "Footwear", image: category7 },
  { name: "Furniture", image: category8 },
  { name: "Bicycle", image: category9 },
  { name: "Tools & machinery", image: category10 },
  { name: "Electronic equipments", image: category15 },
  { name: "Party supplies", image: category12 },
  { name: "Vehicles", image: category13 },
  { name: "Watches", image: category14 },
  { name: "Home appliances", image: category3 },
  { name: "Car", image: car },
];

function Home() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Promotional slides data
  // Updated promotions array with more descriptive subtitles
const promotions = [
  {
    title: "Summer Fitness Special",
    subtitle: "Save up to 30% on gym equipment rentals - perfect for your summer fitness goals without the commitment of buying",
    cta: "Rent Now",
    bgColor: "bg-[#4a5565]",
    image: gym
  },
  {
    title: "New Tech Arrivals",
    subtitle: "Discover the latest electronics with flexible rental periods - upgrade your gadgets without breaking the bank",
    cta: "Explore",
    bgColor: "bg-[#fb64b6]",
    image: gadget
  },
  {
    title: "Back-to-School Offer",
    subtitle: "Exclusive 15% student discount on books, stationery & study essentials - verified students only",
    cta: "Claim Offer",
    bgColor: "bg-[#00b1df]",
    image: stationary1
  },
  {
    title: "Weekend Adventure Pack",
    subtitle: "Special bundle deals on camping gear, bicycles & outdoor equipment - perfect for your next adventure",
    cta: "View Deals",
    bgColor: "bg-[#4e342e]",
    image: category9
  },
  {
    title: "Home Makeover Special",
    subtitle: "Rent premium furniture & appliances for your home at 20% off - minimum 3-month rental",
    cta: "Browse Items",
    bgColor: "bg-[#3d5afe]",
    image: home_makeover
  }
];


 // Auto-scroll functionality - updated version
// Auto-scroll functionality - updated with consistent timing
useEffect(() => {
  const carousel = carouselRef.current;
  let interval;
  let isHovered = false;
  let scrollTimeout;

  const scrollToSlide = (index) => {
    if (!carousel) return;
    
    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
    setCurrentSlide(index);
  };

  const startAutoScroll = () => {
    if (isHovered) return;
    
    // Clear any existing interval
    clearInterval(interval);
    
    // Calculate scroll duration based on CSS transition
    const scrollDuration = 500; // Should match your CSS transition duration
    
    interval = setInterval(() => {
      setCurrentSlide(prev => {
        const nextSlide = (prev + 1) % promotions.length;
        
        // Start scroll
        scrollToSlide(nextSlide);
        
        // Clear any pending timeout
        clearTimeout(scrollTimeout);
        
        // Set timeout for next slide that accounts for scroll duration
        scrollTimeout = setTimeout(() => {
          // This ensures we don't interrupt the smooth scroll
        }, scrollDuration);
        
        return nextSlide;
      });
    }, 4000); // 4 seconds between scroll START times (includes scroll duration)
  };

  // Pause on hover
  const handleMouseEnter = () => {
    isHovered = true;
    clearInterval(interval);
    clearTimeout(scrollTimeout);
  };

  const handleMouseLeave = () => {
    isHovered = false;
    startAutoScroll();
  };

  if (carousel) {
    carousel.addEventListener('mouseenter', handleMouseEnter);
    carousel.addEventListener('mouseleave', handleMouseLeave);
    startAutoScroll();
  }

  return () => {
    clearInterval(interval);
    clearTimeout(scrollTimeout);
    carousel?.removeEventListener('mouseenter', handleMouseEnter);
    carousel?.removeEventListener('mouseleave', handleMouseLeave);
  };
}, [promotions.length]);

  const getColumnSpan = (index) => {
    const pattern = [1, 1, 1, 1, 1, 1, 1, 1];
    return `span ${pattern[index % pattern.length]}`;
  };
  
  const getRowSpan = (size) => {
    return size === "tall" ? "span 2" : "span 1";
  };

  return (

    
    <div className="bg-[#fff] min-h-screen text-white pt-24">
        <h2 className="text-4xl py-7 font-serif italic mb-8 text-center text-[#202020]">"Rent Smarter, Live Better."</h2>

        

      {/* Promotional Carousel */}
      <div className="relative w-full overflow-hidden">
      <div 
      ref={carouselRef}
      className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
          {promotions.map((promo, index) => (
            <div 
              key={index}
              className={`flex-shrink-0 w-full snap-start ${promo.bgColor}`}
            >
              <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="md:w-1/2 space-y-6">
                  <h2 className="text-4xl font-bold text-[#000]">{promo.title}</h2>
                  <p className="text-xl text-white">{promo.subtitle}</p>
                  <button 
                    onClick={() => navigate("/categories")}
                    className="px-8 py-3 bg-[#BEB5AB] text-black font-bold rounded-lg hover:bg-[#a89e94] transition"
                  >
                    {promo.cta}
                  </button>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src={promo.image} 
                    alt={promo.title}
                    className="w-full h-64 md:h-80 object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {promotions.map((_, index) => (
            <button 
              key={index}
              onClick={() => {
                const slideWidth = carouselRef.current.offsetWidth;
                carouselRef.current.scrollTo({
                  left: index * slideWidth,
                  behavior: 'smooth'
                });
                setCurrentSlide(index);
              }}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? 'bg-[#BEB5AB]' : 'bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <h2 className="text-4xl py-7 font-serif italic mb-8 text-center text-[#4e342e]">Trending Product Categories</h2>


      <div className="px-10">

        {/* Uniform Square Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-9">
          {categories.map((category, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg group"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-70 transition-opacity duration-300 rounded-lg">
                <p className="text-lg font-semibold text-center px-2">{category.name}</p>
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
                background: #4e2a27;
                -webkit-background-clip: text;
                -webkit-text-stroke-color: transparent;
              }
            `}
          </style>
        </div>

        <div className="mt-32 flex flex-col items-center text-white relative py-20 px-6 bg-[#fff]">
          {/* About Us Heading */}
          <motion.h2
            className="text-6xl font-extrabold text-[#020618] mb-6 tracking-wide uppercase"
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
            className="text-xl text-center  text-[#020618] max-w-3xl px-6 leading-relaxed mb-6"
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
                className="flex items-center space-x-3 p-4 bg-[#00223b] rounded-lg shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <FaCheckCircle className="text-[#BEB5AB] text-2xl" />
                <span className="text-lg">{feature}</span>
              </motion.div>
            ))}
          </div>

{/* Add this section right before the closing </div> of the About Us section */}
        <div className="w-full mt-20 px-6">
          <h3 className="text-4xl font-extrabold text-[#020618] mb-12 text-center tracking-wide">
            What Our Users Say
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Review Card 1 */}
          <motion.div 
            className="bg-[#020618] p-8 rounded-xl shadow-lg border border-transparent transition-all duration-300 hover:border-[#BEB5AB] hover:shadow-xl"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-[#BEB5AB] flex items-center justify-center text-2xl font-bold text-[#1A1A1A] mr-4">S</div>
              <div>
                <h4 className="font-bold text-lg text-[#BEB5AB]">Sarah K.</h4>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        <p className="text-gray-300 italic">
        "RentEasy saved me hundreds on camera gear for my vacation. The process was seamless and the equipment was in perfect condition!"
        </p>
       </motion.div>

    {/* Review Card 2 */}
    <motion.div 
      className="bg-[#020618] p-8 rounded-xl shadow-lg border border-transparent transition-all duration-300 hover:border-[#BEB5AB] hover:shadow-xl"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-[#BEB5AB] flex items-center justify-center text-2xl font-bold text-[#1A1A1A] mr-4">A</div>
        <div>
          <h4 className="font-bold text-lg text-[#BEB5AB]">Alex M.</h4>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-300 italic">
        "As a student, the discounts on textbooks and electronics have been a game-changer. Highly recommend!"
      </p>
    </motion.div>

    {/* Review Card 3 */}
    <motion.div 
      className="bg-[#020618] p-8 rounded-xl shadow-lg border border-transparent transition-all duration-300 hover:border-[#BEB5AB] hover:shadow-xl"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-[#BEB5AB] flex items-center justify-center text-2xl font-bold text-[#1A1A1A] mr-4">R</div>
        <div>
          <h4 className="font-bold text-lg text-[#BEB5AB]">Raj P.</h4>
          <div className="flex text-yellow-400">
            {[...Array(4)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
            <svg className="w-5 h-5 fill-current text-gray-600" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
        </div>
      </div>
      <p className="text-gray-300 italic">
        "Furnished my entire apartment through RentEasy. The quality exceeded my expectations and saved me thousands."
      </p>
    </motion.div>

    {/* Review Card 4 */}
    <motion.div 
      className="bg-[#020618] p-8 rounded-xl shadow-lg border border-transparent transition-all duration-300 hover:border-[#BEB5AB] hover:shadow-xl"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-[#BEB5AB] flex items-center justify-center text-2xl font-bold text-[#1A1A1A] mr-4">M</div>
        <div>
          <h4 className="font-bold text-lg text-[#BEB5AB]">Maya S.</h4>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-300 italic">
        "The party supplies rental saved my daughter's birthday party! Everything arrived on time and in perfect condition."
      </p>
    </motion.div>

    {/* Review Card 5 */}
    <motion.div 
      className="bg-[#020618] p-8 rounded-xl shadow-lg border border-transparent transition-all duration-300 hover:border-[#BEB5AB] hover:shadow-xl"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-[#BEB5AB] flex items-center justify-center text-2xl font-bold text-[#1A1A1A] mr-4">J</div>
        <div>
          <h4 className="font-bold text-lg text-[#BEB5AB]">James L.</h4>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-300 italic">
        "Rented a high-end camera for my project. The process was so easy and the equipment was professional grade. Will use again!"
      </p>
    </motion.div>

    {/* Review Card 6 */}
    <motion.div 
      className="bg-[#020618] p-8 rounded-xl shadow-lg border border-transparent transition-all duration-300 hover:border-[#BEB5AB] hover:shadow-xl"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-[#BEB5AB] flex items-center justify-center text-2xl font-bold text-[#1A1A1A] mr-4">P</div>
        <div>
          <h4 className="font-bold text-lg text-[#BEB5AB]">Priya K.</h4>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-300 italic">
        "The home appliances rental helped me settle into my new place without the upfront costs. Excellent service and quality!"
      </p>
    </motion.div>
  </div>
</div>
          
          <div className="bg-[#fff] text-white pt-10 px-10">
            {/* Call to Action */}
            <motion.button
              onClick={() => navigate("/signup")}
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
            className="text-[#17095c] text-2xl mt-6 font-semibold"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            @hamchaar
          </motion.p>
        </div>
      </div>

      {/* Footer Section */}
  <footer className="bg-[#0B0B0B] text-[#BEB5AB] py-12 px-6 mt-9 border-t border-[#2E2E2E]">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Company Info */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-[#e9d4ff]">RentEasy</h3>
        <p className="text-gray-400">
          Making renting accessible and affordable for everyone.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="text-lg font-semibold text-[#e9d4ff] mb-4">Quick Links</h4>
        <ul className="space-y-2">
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">Home</a></li>
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">Categories</a></li>
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">How It Works</a></li>
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">Pricing</a></li>
        </ul>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-lg font-semibold text-[#e9d4ff] mb-4">Categories</h4>
        <ul className="space-y-2">
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">Electronics</a></li>
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">Furniture</a></li>
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">Vehicles</a></li>
          <li><a href="#" className="text-gray-400 hover:text-[#BEB5AB] transition">Fashion</a></li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="text-lg font-semibold text-[#e9d4ff] mb-4">Contact Us</h4>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            support@renteasy.com
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +1 (555) 123-4567
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            123 Rental St, Suite 100<br />San Francisco, CA 94107
          </li>
        </ul>
      </div>
    </div>

    {/* Copyright */}
    <div className="border-t border-[#2E2E2E] mt-8 pt-8 text-center text-gray-500 text-sm">
      <p>© {new Date().getFullYear()} RentEasy. All rights reserved.</p>
      <div className="mt-2 flex justify-center space-x-4">
        <a href="#" className="hover:text-[#BEB5AB] transition">Privacy Policy</a>
        <span>•</span>
        <a href="#" className="hover:text-[#BEB5AB] transition">Terms of Service</a>
        <span>•</span>
        <a href="#" className="hover:text-[#BEB5AB] transition">FAQ</a>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}

export default Home;