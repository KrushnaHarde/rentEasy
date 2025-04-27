  const { Schema, model } = require("mongoose");

  // Define category and subcategory constants
  const CATEGORIES = {
    BIKES: "Bikes",
    FASHION_JEWELRY: "Fashion Jewelry",
    ELECTRONICS: "Electronics & Appliance",
    FURNITURE: "Furniture",
    HOME_APPLIANCES: "Home Appliances",
    CLOTHING: "Clothing Fashion",
    BOOKS: "Books",
    SPORTS: "Sports Equipment",
    GENERAL: "General"
  };

// Define subcategory enums for each category
const SUBCATEGORIES = {
  [CATEGORIES.BIKES]: ["Scooty", "Motorcycle"],
  [CATEGORIES.FASHION_JEWELRY]: ["Necklace sets", "Earrings", "Jhumkas", "Rings", "Watches"],
  [CATEGORIES.ELECTRONICS]: ["Laptops", "Sound Systems", "Bluetooth Speakers", "DSLR", "Mirrorless Cameras", "GoPro", "HeadPhones", "Earphones"],
  [CATEGORIES.FURNITURE]: ["Beds", "Study Tables", "Chairs", "Cupboards", "Dressing tables", "Book Shelves", "Sofas"],
  [CATEGORIES.HOME_APPLIANCES]: ["Refrigerators", "Washing Machines", "Microwave ovens", "Water purifiers", "Air conditioners"],
  [CATEGORIES.CLOTHING]: ["Shirts", "T-shirts", "Bottoms", "Jeans", "Trousers", "Shorts", "Fashion cloths", "Cosplay", "Ethnic Wear"],
  [CATEGORIES.BOOKS]: ["Fiction", "Non-fiction", "Academic", "Self-help", "Biography", "Comics", "Magazines", "Religious", "Children's books"],
  [CATEGORIES.SPORTS]: [], // No subcategories
  [CATEGORIES.GENERAL]: []  // No subcategories
};

// Define location constants
const LOCATIONS = {
  MUMBAI: "Mumbai",
  DELHI_NCR: "Delhi-NCR",
  BENGALURU: "Bengaluru",
  HYDERABAD: "Hyderabad",
  CHANDIGARH: "Chandigarh",
  AHMEDABAD: "Ahmedabad",
  CHENNAI: "Chennai",
  PUNE: "Pune",
  KOLKATA: "Kolkata",
  KOCHI: "Kochi",
  OTHER: "Other"
};

  // Get all subcategories in a flat array (for enum validation)
  const getAllSubcategories = () => {
    return Object.values(SUBCATEGORIES).flat();
  };

const productSchema = new Schema(
  {
    uploadedBy:{ 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: { 
        type: String,
        required: true
    },
    category: { 
        type: String, 
        enum: Object.values(CATEGORIES),
        required: true,
        default: CATEGORIES.GENERAL
    },
    subcategory: {
        type: String,
        enum: getAllSubcategories(),
        required: function() {
            return this.category !== CATEGORIES.SPORTS && this.category !== CATEGORIES.GENERAL;
        },
        validate: {
          validator: function(value) {
            // Skip validation if category is Sports Equipment or General
            if (this.category === CATEGORIES.SPORTS || this.category === CATEGORIES.GENERAL) {
              return true;
            }
            
            // Ensure the subcategory belongs to the selected category
            return SUBCATEGORIES[this.category].includes(value);
          },
          message: props => `${props.value} is not a valid subcategory for the selected category!`
        }
    },
    location: {
        city: {
            type: String,
            enum: Object.values(LOCATIONS),
            required: true,
            default: LOCATIONS.OTHER
        },
        address: {
            type: String,
            required: true
        }
    },
    description: { 
        type: String, 
        required: true 
    },
    productImage: { 
        type: String,
        required: true
    },
    additionalImages: {
        type: [String],
        default: []
    },
    productCondition: { 
        type: String, 
        required: true
    },
    rating: {
        type: Number, 
        min: 0,
        max: 5,
        default: 0 
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    price: { 
        type: Number, 
        required: true 
    },
    duration: {
        days: {
            type: Number,
            default: 0,
            min: 0
        },
    } ,
    isBooked:{
      type : Boolean,
      default:false
    }  
  },
  { timestamps: true }
);

// Export the constants as well for use in the controller
productSchema.statics.CATEGORIES = CATEGORIES;
productSchema.statics.SUBCATEGORIES = SUBCATEGORIES;
productSchema.statics.LOCATIONS = LOCATIONS;

  const Product = model("Product", productSchema);
  module.exports = Product;