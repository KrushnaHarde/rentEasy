// controllers/productController.js
const Product = require('../models/product');
const multer = require('multer');
const path = require('path');

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
            uploadedBy: req.user.id, // Use consistent user ID field
        };

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

        // Create new product using create method
        await Product.create(productData);
        
        res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
        res.status(400).json({ error: "Failed to create product" });
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
        
        res.json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(400).json({ error: "Failed to update product" });
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
        const products = await Product.find({ uploadedBy: req.user.id });
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user products" });
    }
};

module.exports = { 
    uploadProductImages,
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getUserProducts
};