// controllers/productController.js
const Product = require('../models/product');
const multer = require('multer');
const path = require('path');
const UserInteraction = require('../models/userInteraction')
// Get category constants from the Product model
const CATEGORIES = Product.CATEGORIES;
const SUBCATEGORIES = Product.SUBCATEGORIES;
const LOCATIONS = Product.LOCATIONS;

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Configure file filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize multer upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload middleware
const uploadProductImages = upload.fields([
    { name: 'productImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]);

// Create new product listing for rent
const createProduct = async (req, res) => {
    try {
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
            if (req.files.productImage) {
                productData.productImage = `/uploads/products/${req.files.productImage[0].filename}`;
            }
            
            if (req.files.additionalImages) {
                productData.additionalImages = req.files.additionalImages.map(
                    file => `/uploads/products/${file.filename}`
                );
            }
        }

        // Create new product
        const product = await Product.create(productData);
        
        res.status(201).json({ 
            message: "Product created successfully",
            product: product
        });
    } catch (error) {
        console.log("Error creating product:", error);
        res.status(400).json({ error: error.message || "Failed to create product" });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('uploadedBy', 'fullName email')
            .sort('-createdAt');
        
        res.json(products);
    } catch (error) {
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
        const product = await Product.findById(req.params.id)
            .populate('uploadedBy', 'fullName email');
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
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
        
        if (req.files) {
            if (req.files.productImage) {
                updateData.productImage = `/uploads/products/${req.files.productImage[0].filename}`;
            }
            
            if (req.files.additionalImages) {
                updateData.additionalImages = req.files.additionalImages.map(
                    file => `/uploads/products/${file.filename}`
                );
            }
        }
        
        // Update product
        product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.json({ 
            message: "Product updated successfully",
            product: product
        });
    } catch (error) {
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
            return res.status(403).json({ error: "Not authorized to delete this product" });
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
        const products = await Product.find({ uploadedBy: req.user.id })
            
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user products" });
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category })
            .populate('uploadedBy', 'fullName email')
            .sort('-createdAt');
        
        res.json(products);
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
        
        res.json(products);
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
        
        res.json(products);
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
        
        // Return subcategories for the specified category
        res.json(SUBCATEGORIES[CATEGORIES[categoryKey]] || []);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch subcategories" });
    }
};

module.exports = { 
    uploadProductImages,
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