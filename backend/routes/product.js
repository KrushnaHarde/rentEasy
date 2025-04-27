// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authentication');

// Debug middleware - add this to help diagnose upload issues
const debugRequest = (req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
  console.log('[DEBUG] Content-Type:', req.headers['content-type']);
  next();
};

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.recordProductView, productController.getProduct);

// Get categories, subcategories, and locations
router.get('/metadata/categories', productController.getCategories);  // Route for categories
router.get('/metadata/subcategories/:category', productController.getSubcategories);
router.get('/metadata/all-categories', productController.getCategoriesAndSubcategories);
router.get('/metadata/locations', productController.getLocations);

// Protected routes - require authentication
// Add debug middleware before upload handlers for POST/PUT requests
router.post('/',
    requireAuth('token'),
    debugRequest,  // Add debug middleware
    productController.uploadProductImages,
    productController.createProduct
);

// Update product
router.put('/:id',
    requireAuth('token'),
    debugRequest,  // Add debug middleware
    productController.uploadProductImages,
    productController.updateProduct
);

// To delete the product
router.delete('/:id',
    requireAuth('token'),
    productController.deleteProduct
);

// Can be used for myListing
router.get('/user/products',
    requireAuth('token'),
    productController.getUserProducts
);

// To get product by category
router.get('/category/:category',
    productController.getProductsByCategory
);

// To get Product by Subcategory
router.get('/category/:category/:subcategory',
    productController.getProductsBySubcategory
);

// New location-based route
router.get('/location/:city',
    productController.getProductsByLocation
);

router.get('/categories',
    productController.getCategoriesAndSubcategories
);

module.exports = router;