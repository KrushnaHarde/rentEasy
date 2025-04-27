// controllers/productController.js
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Product = require("../models/product");
const multer = require("multer");
const path = require("path");
const UserInteraction = require("../models/userInteraction");

// Get category constants from the Product model
const CATEGORIES = Product.CATEGORIES;
const SUBCATEGORIES = Product.SUBCATEGORIES;
const LOCATIONS = Product.LOCATIONS;

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name';

// Configure cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'RentEasy',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
});

// Configure file filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Raw upload middleware
const uploadProductImages = upload.fields([
  { name: "productImage", maxCount: 1 },
  { name: "additionalImages", maxCount: 5 },
]);

// Helper function to ensure complete Cloudinary URLs
const ensureCompleteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  // If the URL is from Cloudinary but doesn't have the full URL
  if (url.includes('RentEasy/')) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${url}`;
  }
  
  return url;
};

// Transform product images URLs
const transformProductImages = (product) => {
  const productObj = product.toObject ? product.toObject() : {...product};
  
  // Transform main product image URL
  if (productObj.productImage) {
    productObj.productImage = ensureCompleteUrl(productObj.productImage);
  }
  
  // Transform additional images URLs
  if (productObj.additionalImages && productObj.additionalImages.length > 0) {
    productObj.additionalImages = productObj.additionalImages.map(img => ensureCompleteUrl(img));
  }
  
  return productObj;
};

// Error handling wrapper for multer upload
const handleProductImageUpload = (req, res, next) => {
  uploadProductImages(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error("Multer error:", err);
      return res.status(400).json({ error: `Image upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      console.error("Unknown upload error:", err);
      return res.status(500).json({ error: `Upload failed: ${err.message}` });
    }
    
    // Log successful uploads for debugging
    if (req.files) {
      console.log("Files uploaded successfully:", 
        Object.keys(req.files).map(key => `${key}: ${req.files[key].length} file(s)`));
      
      // Log the actual URLs being stored
      if (req.files.productImage && req.files.productImage[0]) {
        console.log("Main image URL:", req.files.productImage[0].path);
      }
      
      if (req.files.additionalImages) {
        console.log("Additional image URLs:", req.files.additionalImages.map(f => f.path));
      }
    }
    
    // Upload successful, proceed to next middleware
    next();
  });
};

// Debug middleware to log request information
const debugUploadRequest = (req, res, next) => {
  console.log("Upload request received");
  console.log("Headers:", req.headers['content-type']);
  console.log("Body keys:", Object.keys(req.body));
  next();
};

// Create new product listing for rent
const createProduct = async (req, res) => {
  try {
    console.log("Creating product with data:", req.body);
    console.log("Files received:", req.files);
    
    // Create product object from request body
    const productData = {
      ...req.body,
      uploadedBy: req.user.id,
    };

    // Ensure location data is properly structured
    if (req.body.city || req.body.address) {
      productData.location = {
        city: req.body.city || LOCATIONS.OTHER,
        address: req.body.address || ''
      };
      
      // Remove the individual fields to avoid duplication
      delete productData.city;
      delete productData.address;
    }

    // Handle uploaded images
    if (req.files) {
      if (req.files.productImage && req.files.productImage[0]) {
        productData.productImage = req.files.productImage[0].path;
        console.log("Main product image saved:", productData.productImage);
      } else {
        console.log("No main product image found in request");
        return res.status(400).json({ error: "Product main image is required" });
      }
    
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        productData.additionalImages = req.files.additionalImages.map(file => file.path);
        console.log("Additional images saved:", productData.additionalImages);
      }
    } else {
      console.log("No files found in request");
      return res.status(400).json({ error: "Product images are required" });
    }

    // Create new product
    const product = await Product.create(productData);
    console.log("Product created successfully:", product._id);

    // Transform the product to include full image URLs
    const transformedProduct = transformProductImages(product);

    res.status(201).json({
      message: "Product created successfully",
      product: transformedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: error.message || "Failed to create product" });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("uploadedBy", "fullName email")
      .sort("-createdAt");
    
    // Transform products to include full image URLs
    const transformedProducts = products.map(product => transformProductImages(product));

    res.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get categories and subcategories
const getCategoriesAndSubcategories = async (req, res) => {
  try {
    res.json(SUBCATEGORIES);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get locations
const getLocations = async (req, res) => {
  try {
    res.json(LOCATIONS);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
};

// Get single product by ID
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "uploadedBy",
      "fullName email"
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Transform product to include full image URLs
    const transformedProduct = transformProductImages(product);

    res.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    console.log("Updating product with ID:", req.params.id);
    console.log("Update data:", req.body);
    console.log("Files for update:", req.files);
    
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Check if user is the owner
    if (product.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this product" });
    }
    
    // Update image fields if files are uploaded
    const updateData = { ...req.body };
    
    // Handle location data
    if (req.body.city || req.body.address) {
      updateData.location = product.location || {}; // Start with existing location data
      
      if (req.body.city) updateData.location.city = req.body.city;
      if (req.body.address) updateData.location.address = req.body.address;
      
      // Remove the individual fields
      delete updateData.city;
      delete updateData.address;
    }
    
    // Handle file uploads
    if (req.files) {
      if (req.files.productImage && req.files.productImage[0]) {
        updateData.productImage = req.files.productImage[0].path;
        console.log("Updated main product image:", updateData.productImage);
      }
    
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        updateData.additionalImages = req.files.additionalImages.map(file => file.path);
        console.log("Updated additional images:", updateData.additionalImages);
      }
    }
    
    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log("Product updated successfully:", product._id);
    
    // Transform the product to include full image URLs
    const transformedProduct = transformProductImages(product);
    
    res.json({ 
      message: "Product updated successfully",
      product: transformedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ error: error.message || "Failed to update product" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user is the owner
    if (product.uploadedBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// Get products by user
const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ uploadedBy: req.user.id });
    
    // Transform products to include full image URLs
    const transformedProducts = products.map(product => transformProductImages(product));

    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user products" });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category })
      .populate("uploadedBy", "fullName email")
      .sort("-createdAt");
    
    // Transform products to include full image URLs
    const transformedProducts = products.map(product => transformProductImages(product));

    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};

// Get products by subcategory
const getProductsBySubcategory = async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category,
      subcategory: req.params.subcategory 
    })
      .populate('uploadedBy', 'fullName email')
      .sort('-createdAt');
    
    // Transform products to include full image URLs
    const transformedProducts = products.map(product => transformProductImages(product));
    
    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products by subcategory" });
  }
};

// Get products by location/city
const getProductsByLocation = async (req, res) => {
  try {
    const products = await Product.find({ 
      'location.city': req.params.city 
    })
      .populate('uploadedBy', 'fullName email')
      .sort('-createdAt');
    
    // Transform products to include full image URLs
    const transformedProducts = products.map(product => transformProductImages(product));
    
    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products by location" });
  }
};

const recordProductView = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log("No authenticated user found, skipping view recording");
      return next();
    }
    
    const productId = req.params.id;
    
    // Create interaction object with minimum required fields
    const interactionData = {
      userId: req.user.id,
      productId,
      interactionType: 'VIEW'
    };
    
    // Record this view as an interaction
    const interaction = await UserInteraction.create(interactionData);
    
    // Continue to the actual product detail controller
    next();
  } catch (error) {
    // Log the error in detail but don't interrupt the flow
    console.error("Error recording product view:", error);
    next();
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    res.json(Object.values(CATEGORIES));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get subcategories for a specific category
const getSubcategories = async (req, res) => {
  try {
    const category = req.params.category;
    
    // Check if the category exists
    if (!CATEGORIES[category] && !Object.values(CATEGORIES).includes(category)) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Find the category key if the value was provided
    let categoryKey = category;
    if (!CATEGORIES[category]) {
      categoryKey = Object.keys(CATEGORIES).find(key => CATEGORIES[key] === category);
    }
    
    // Return subcategories for the matched category
    res.json(SUBCATEGORIES[CATEGORIES[categoryKey]] || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
};

module.exports = {
  uploadProductImages: handleProductImageUpload,
  debugUploadRequest,
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getCategoriesAndSubcategories,
  getLocations,
  getCategories,
  getSubcategories,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByLocation,
  recordProductView
};