import * as React from "react";
import { useState } from "react";
import { ChevronRight, ChevronDown, Search, SlidersHorizontal, ArrowRight } from "lucide-react";

// Utility function
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// Button Component
const buttonVariants = (options) => {
  const { variant = "default", size = "default", className = "" } = options || {};
  
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  
  return cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );
};

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Input Component
const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-2 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Select Components
const Select = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

const SelectTrigger = ({ className, children, ...props }) => {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

const SelectValue = ({ children, ...props }) => {
  return <span {...props}>{children}</span>;
};

const SelectContent = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-input bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};

const SelectItem = ({ className, children, ...props }) => {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// CategoryCard Component
const CategoryCard = ({
  name,
  image,
  description,
  subcategories = [],
  color = "#1399c6"
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const gradientBorder = {
    boxShadow: isHovering ? `0 4px 20px rgba(${color.replace('#', '').match(/.{1,2}/g)?.map(val => parseInt(val, 16)).join(',')}, 0.25)` : 'none',
    borderColor: isHovering ? color : 'transparent'
  };
  
  return (
    <div 
      className={cn(
        "rounded-xl overflow-hidden bg-white transition-all duration-300 border-2 border-transparent",
        isHovering ? "transform -translate-y-1" : "",
        expanded ? "shadow-lg" : "shadow-md hover:shadow-lg"
      )}
      style={gradientBorder}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative overflow-hidden h-56">
        <img
          src={image}
          alt={name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300",
            isHovering ? "scale-105" : "scale-100"
          )}
        />
        <div className={cn(
          "absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300",
          isHovering ? "opacity-100" : ""
        )}>
          <Button 
            className="self-end bg-white/90 hover:bg-white text-[#1171ba] hover:text-[#24aae2]"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        {description && <p className="mt-2 text-gray-600 text-sm">{description}</p>}
      </div>
      
      {subcategories.length > 0 && (
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300",
            expanded ? "max-h-60" : "max-h-0"
          )}
        >
          <div className="p-4 pt-0">
            <div className="bg-[#f5f9fc] rounded-lg">
              <div className="p-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm text-gray-700">Subcategories</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(false)}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-1">
                  {subcategories.map((sub, index) => (
                    <li key={index} className="text-sm">
                      <a 
                        href="#" 
                        className="block hover:bg-white rounded-md p-2 transition-colors text-gray-600 hover:text-[#1171ba]"
                      >
                        {sub}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hero Component
const Hero = () => {
  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 relative inline-block">
        Browse by Category
        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#1171ba] to-[#24aae2]"></span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Discover a wide variety of products available for rent – from gadgets to gear.
      </p>
    </section>
  );
};

// FilterBar Component
const FilterBar = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm px-4 py-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Input
              className="pl-10 pr-4 py-2 rounded-full border-gray-200 focus-visible:ring-[#1399c6]"
              placeholder="Search categories..."
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto w-full flex items-center gap-2 border-gray-200 hover:bg-gray-50"
          >
            <SlidersHorizontal size={18} />
            Filters
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-york">New York</SelectItem>
                <SelectItem value="los-angeles">Los Angeles</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
                <SelectItem value="boston">Boston</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">$0 - $50</SelectItem>
                <SelectItem value="medium">$51 - $100</SelectItem>
                <SelectItem value="high">$101+</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ & up</SelectItem>
                <SelectItem value="3">⭐⭐⭐ & up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

// CategoryGrid Component
const categories = [
  {
    id: "electronics",
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800&auto=format&fit=crop",
    description: "Latest gadgets and tech for your projects and activities",
    subcategories: ["Laptops", "Cameras", "Audio Equipment", "Gaming Consoles", "Drones"],
    color: "#1171ba"
  },
  {
    id: "bikes",
    name: "Bikes",
    image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?q=80&w=800&auto=format&fit=crop",
    description: "Two-wheel rides for adventures and commuting",
    subcategories: ["Mountain Bikes", "Road Bikes", "Electric Bikes", "Scooters", "Accessories"],
    color: "#096192"
  },
  {
    id: "fashion",
    name: "Fashion Jewelry",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=800&auto=format&fit=crop",
    description: "Elegant accessories for special occasions",
    subcategories: ["Earrings", "Necklaces", "Rings", "Bracelets", "Watches"],
    color: "#24aae2"
  },
  {
    id: "stationery",
    name: "Stationery",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    description: "Office and art supplies for every need",
    subcategories: ["Notebooks", "Pens & Markers", "Art Supplies", "Office Equipment"],
    color: "#1399c6"
  },
  {
    id: "kitchen",
    name: "Kitchen",
    image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?q=80&w=800&auto=format&fit=crop",
    description: "Cookware and appliances for your culinary adventures",
    subcategories: ["Appliances", "Cookware Sets", "Special Occasion", "Bakeware"],
    color: "#0e8c7f"
  },
  {
    id: "home-decor",
    name: "Home Decor",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=800&auto=format&fit=crop", 
    description: "Spruce up your space with trendy decor items",
    subcategories: ["Furniture", "Lighting", "Wall Decor", "Plants", "Party Decor"],
    color: "#096192"
  },
];

const CategoryGrid = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {categories.map((category) => (
          <CategoryCard key={category.id} {...category} />
        ))}
      </div>
    </section>
  );
};

// CTABanner Component
const CTABanner = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f4f9fc] to-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#096192] to-[#24aae2] bg-clip-text text-transparent">
          Have something to rent?
        </h2>
        <p className="text-lg text-gray-600 mb-8 md:px-12">
          Join RentEasy and start earning today. Turn your underutilized items into a profitable income stream.
        </p>
        
        <Button 
          className="group transition-all duration-300 bg-gradient-to-r from-[#1171ba] to-[#24aae2] hover:from-[#096192] hover:to-[#1399c6] text-white font-medium px-8 py-6 h-auto text-lg rounded-full"
          onClick={() => {}}
        >
          List Your Product
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
};

// Main Categories Component
const Categories = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero />
      <FilterBar />
      <CategoryGrid />
      <CTABanner />
    </div>
  );
};

export default Categories;