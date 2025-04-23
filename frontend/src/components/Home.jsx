import React, { useState, useEffect } from 'react';
// import LottieAnimation from './LottieAnimation';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Check, Shield, Clock, PiggyBank } from 'lucide-react';
import { Star } from 'lucide-react';
import { 
  Laptop, 
  Bike, 
  Shirt, 
  BookOpen, 
  Home as HomeIcon, 
  Camera, 
  Car, 
  PenTool, 
  Sofa,
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Gem,
  Dumbbell,Trophy,
  Fan,
  Boxes 
} from "lucide-react";

// Carousel Component
const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3",
      title: "Rent Anything, Anytime",
      description: "From electronics to furniture, find what you need without the commitment of ownership.",
      buttonText: "Browse Items",
    },
    {
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3",
      title: "Safe & Secure Rentals",
      description: "Every transaction is protected. Rent with confidence on our secure platform.",
      buttonText: "How It Works",
    },
    {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3",
      title: "Verified Listings",
      description: "All items are verified by our quality team to ensure you get exactly what you expect.",
      buttonText: "Learn More",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-[800px]">
  {slides.map((slide, index) => (
    <div 
      key={index}
      className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
        index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      <img 
        src={slide.image} 
        alt={slide.title} 
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
            <p className="text-xl mb-8">{slide.description}</p>
            <Button className="bg-[#2AB3E6] hover:bg-[#016D6D] text-white py-3 px-8 text-lg">
              {slide.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

      
      {/* Navigation Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8 text-white" /> 
      </button>
      
      {/* Indicator dots */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

// Categories Component
// import { useState } from 'react';
// import { Laptop, Bike, Shirt, PenTool, Sofa, Camera, Car, BookOpen, Home as HomeIcon, ChevronDown, ChevronUp } from 'lucide-react';

const categories = [
  {
    title: "Electronics & Appliance",
    icon: <Laptop size={40} />,
    color: "#1399c6",       // Light Blue
    hoverColor: "#1171ba",  // Blue
    subcategories: ["Laptops", "Smartphones", "Audio Equipment", "Gaming Consoles", "Cameras", "Drones", "Tablets", "Smart Watches"]
  },
  {
    title: "Bikes",
    icon: <Bike size={40} />,
    color: "#24aae2",
    hoverColor: "#1399c6",
    subcategories: ["Mountain Bikes", "Road Bikes", "Electric Bikes", "BMX", "Hybrid Bikes", "Cruisers", "Kids Bikes"]
  },
  {
    title: "Clothing Fashion",
    icon: <Shirt size={40} />,
    color: "#1171ba",
    hoverColor: "#0e8c7f",
    subcategories: ["Men's Clothing", "Women's Clothing", "Jewelry", "Watches", "Bags", "Accessories", "Shoes", "Formal Wear"]
  },
  {
    title: "Fashion jewelry",
    icon: <Gem size={40} />,
    color: "#0e8c7f",
    hoverColor: "#1399c6",
    subcategories: ["Notebooks", "Pens & Pencils", "Art Supplies", "Office Equipment", "Planners", "Desk Accessories"]
  },
  {
    title: "Furniture",
    icon: <Sofa size={40} />,
    color: "#096192",
    hoverColor: "#0e8c7f",
    subcategories: ["Sofas", "Beds", "Dining Tables", "Office Furniture", "Outdoor Furniture", "Chairs", "Storage Units"]
  },
  {
    title: "Books",
    icon: <BookOpen size={40} />,
    color: "#1399c6",
    hoverColor: "#1171ba",
    subcategories: ["DSLR", "Mirrorless", "Action Cameras", "Video Equipment", "Lenses", "Lighting", "Tripods"]
  },
  {
    title: "Home Appliances",
    icon: <HomeIcon size={40} />,
    color: "#1171ba",
    hoverColor: "#0e8c7f",
    subcategories: ["Cars", "Motorcycles", "Vans", "Trucks", "RVs", "Boats", "Scooters", "Luxury Vehicles"]
  },
  {
    title: "Sports Equipment",
    icon: <Dumbbell size={40} />,
    color: "#24aae2",
    hoverColor: "#1399c6",
    subcategories: ["Fiction", "Non-Fiction", "Academic", "Children's Books", "Comics", "Magazines", "Reference"]
  },
  {
    title: "General",
    icon: <Boxes size={40} />,
    color: "#0e8c7f",
    hoverColor: "#1399c6",
    subcategories: ["Apartments", "Houses", "Office Spaces", "Commercial Property", "Vacation Rentals", "Event Venues"]
  },
];

const CategoryCard = ({ title, icon, color, hoverColor, navigate}) => {
  return (
    <div className="relative group overflow-hidden h-48">
      <div
        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-gray-100 
                  hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1"
        style={{
          borderColor: 'transparent',
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/category/${encodeURIComponent(title.toLowerCase())}`)}
      >
        <div
          className="p-4 rounded-full mb-4 transition-colors duration-300"
          style={{
            backgroundColor: `${color}1A`, // ~10% opacity
            color: color,
          }}
        >
          <span className="group-hover:transition-colors">{icon}</span>
        </div>
        <h3
          className="text-lg font-semibold transition-colors duration-300 group-hover:text-black"
          style={{
            color: color,
          }}
        >
          {title}
        </h3>
        <div
          className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{
            backgroundColor: hoverColor,
          }}
        ></div>
      </div>
    </div>
  );
};



const Categories = () => {

const navigate = useNavigate();
// />
  return (
    <section id="categories" className="py-16 px-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Browse by <span style={{ color: '#1399c6' }}>Categories</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the perfect rental from our wide selection of categories. Whether you need it for a day or a month, we've got you covered.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
  <CategoryCard 
    key={index}
    {...category}
    navigate={navigate}
  />
))}

        </div>
      </div>      
    </section>
  );
};
// export default Categories;



// import React, { useState, useEffect } from 'react';

const Recommendations = () => {
  const navigate = useNavigate(); // Add this import at the top
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const navigate = useNavigate(); // Add this import at the top

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Use the correct endpoint with credentials
        const response = await fetch('http://localhost:5000/recommendations/popular', { 
          credentials: 'include' // This is better than withCredentials
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        console.log("Fetched recommendations:", data); // Debugging log
        setRecommendations(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Recommendation fetch error:', err);
      }
    };

    fetchRecommendations();
  }, []);

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (recommendations.length === 0) {
    return <div className="text-center py-8">No recommendations available.</div>;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8"><span style={{ color: '#1399c6' }}>Recommended</span> For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg w-96 shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
              onClick={() => handleProductClick(product._id)}
            >
              {product.productImage ? (
                <div className="h-48 bg-gray-200" >
                  <img
                    src={`http://localhost:5000${product.productImage}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Image failed to load:", product.productImage);
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-2xl mb-1 ">
                  {product.name}
                </h3>
                <div className="text-sm text-gray-500 mb-2">
                  {product.category}
                </div>
                <div className="text-blue-600 font-bold">
                  ₹{product.price}/day
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};




// BrandHighlight Component
const BrandHighlight = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
  <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#AEE9F7]"></div>
  <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#2AB3E6]"></div>
  <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-[#00B3A4]"></div>
</div>

<div className="container mx-auto px-6 relative">
  <div className="text-center max-w-4xl mx-auto">
    <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#AEE9F7] via-[#2AB3E6] to-[#016D6D] bg-clip-text text-transparent">
      RentEasy
    </h2>
    <div className="h-1 w-24 bg-gradient-to-r from-[#AEE9F7] via-[#2AB3E6] to-[#016D6D] mx-auto mb-6 rounded-full"></div>
    <p className="text-xl md:text-2xl text-gray-600 mb-8">
      Your Smart Rental Companion
    </p>
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      
      <div className="flex items-center bg-white shadow-md rounded-xl p-4 px-6">
        <div className="text-3xl font-bold text-[#1399c6] mr-3">10k+</div>
        <div className="text-sm text-gray-600">Active Listings</div>
      </div>
      
      <div className="flex items-center bg-white shadow-md rounded-xl p-4 px-6">
        <div className="text-3xl font-bold text-[#016D6D] mr-3">50+</div>
        <div className="text-sm text-gray-600">Cities Covered</div>
      </div>
      
      <div className="flex items-center bg-white shadow-md rounded-xl p-4 px-6">
        <div className="text-3xl font-bold text-[#00B3A4] mr-3">5k+</div>
        <div className="text-sm text-gray-600">Happy Renters</div>
      </div>
      
    </div>
  </div>
</div>

    </section>
  );
};

// AboutUs Component
const AboutUs = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3" 
                alt="People using RentEasy" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg animate-fade-in">
            <div className="flex space-x-2">
  <div className="w-2 h-2 rounded-full bg-[#1399c6]"></div>
  <div className="w-2 h-2 rounded-full bg-[#2AB3E6]"></div>
  <div className="w-2 h-2 rounded-full bg-[#016D6D]"></div>
</div>
              <p className="font-medium text-gray-700 mt-1">Trusted by thousands</p>
            </div>
          </div>
          
          {/* Text side */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              About <span style={{ color: '#1399c6' }}>RentEasy</span>
            </h2>
            <p className="text-gray-600 text-lg">
              RentEasy is revolutionizing the way people access the items they need. Our platform connects those who want to rent with those who have items to offer, creating a community of sharing that reduces waste and increases accessibility.
            </p>
            <p className="text-gray-600 text-lg">
              Founded in 2023, we've quickly grown to become the most trusted rental marketplace in the region, with a commitment to quality, security, and exceptional user experience.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
  <div className="flex items-start space-x-3">
    <div className="bg-[#2AB3E6]/10 p-2 rounded-lg">
      <Check className="text-[#2AB3E6] w-5 h-5" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">Verified Renters</h4>
      <p className="text-gray-600 text-sm">All users are ID verified</p>
    </div>
  </div>

  <div className="flex items-start space-x-3">
    <div className="bg-[#2AB3E6]/10 p-2 rounded-lg">
      <Shield className="text-[#2AB3E6] w-5 h-5" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">Secure Payments</h4>
      <p className="text-gray-600 text-sm">Protected transactions</p>
    </div>
  </div>

  <div className="flex items-start space-x-3">
    <div className="bg-[#00B3A4]/10 p-2 rounded-lg">
      <Clock className="text-[#00B3A4] w-5 h-5" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">Flexible Durations</h4>
      <p className="text-gray-600 text-sm">Rent for days or months</p>
    </div>
  </div>

  <div className="flex items-start space-x-3">
    <div className="bg-[#016D6D]/10 p-2 rounded-lg">
      <PiggyBank className="text-[#016D6D] w-5 h-5" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">Save Money</h4>
      <p className="text-gray-600 text-sm">More affordable than buying</p>
    </div>
  </div>
{/* </div> */}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Component
const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Photographer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "RentEasy helped me rent high-end camera equipment for my shoots without breaking the bank. The process was smooth, and the equipment was in perfect condition!"
  },
  {
    name: "Michael Chen",
    title: "Graduate Student",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "As a student, buying all the books I need would cost a fortune. RentEasy lets me rent textbooks for the semester at a fraction of the cost. Game changer!"
  },
  {
    name: "Priya Patel",
    title: "Event Planner",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 4,
    text: "I regularly rent decor items for events through RentEasy. The variety is impressive, and the rental process is hassle-free. Highly recommend!"
  }
];

const TestimonialCard = ({ name, title, image, rating, text }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full border-2 border-rent-light-blue object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-gray-500 text-sm">{title}</p>
        </div>
      </div>
      
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
      
      <p className="text-gray-600">"{text}"</p>
    </div>
  );
};

const Testimonials = () => {
  const scrollingTestimonials = [...testimonials, ...testimonials]; // Duplicate for seamless loop

  return (
    <section
      id="testimonials"
      className="py-16 px-6 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, white, #1399c610, white)",
      }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          What Our <span style={{ color: "#1399c6" }}>Users Say</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Don't just take our word for it. Hear from our community of renters and how RentEasy has helped them.
        </p>
      </div>

      {/* Scrolling container */}
      <div className="relative overflow-hidden">
        <div
          className="flex space-x-6"
          style={{
            animation: 'scrollLeft 30s linear infinite',
            width: 'max-content',
          }}
        >
          {scrollingTestimonials.map((testimonial, index) => (
            <div key={index} className="min-w-[300px] max-w-xs">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Add keyframes for animation */}
      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};


// HamchaarLogo Component
const HamchaarLogo = () => {
  return (
    <section className="py-16 bg-white">
<div className="container mx-auto px-6 text-center">
  <div className="max-w-xl mx-auto">
    <div className="bg-white shadow-md rounded-xl p-8 inline-block">
      <div className="flex flex-col items-center justify-center">
        
        <div className="bg-gradient-to-r from-[#AEE9F7] via-[#2AB3E6] to-[#016D6D] p-1 rounded-lg inline-block mb-4">
          <div className="bg-white p-2 rounded">
            <h3 className="text-[#1399c6] text-lg font-semibold">Hamchaar</h3>
          </div>
        </div>
        
        <p className="text-gray-600">
          In collaboration with Hamchaar
        </p>
        
      </div>
    </div>
  </div>
</div>

    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and About */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Rent<span style={{ color: '#1399c6' }}>Easy</span>
            </h2>
            <p className="text-gray-400">
              Simplifying rentals with technology and trust. Your one-stop platform for all rental needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#categories" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  Categories
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                  Rental Agreement
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-rent-light-blue shrink-0 mr-3 mt-1" />
                <span className="text-gray-400">
                  123 Rental Street, Suite 456<br />
                  Anytown, ST 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-rent-light-blue shrink-0 mr-3" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-rent-light-blue shrink-0 mr-3" />
                <span className="text-gray-400">support@renteasy.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <p className="text-gray-500 text-center text-sm">
            © {new Date().getFullYear()} RentEasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main Home Component
const Home = () => {
  return (
    <div className="min-h-screen">
      {/* <Navbar /> */}
      <Carousel />
      <Categories />
      <Recommendations />
      <BrandHighlight />
      <AboutUs />
      <Testimonials />
      <HamchaarLogo />
      <Footer />
    </div>
  );
};

export default Home;