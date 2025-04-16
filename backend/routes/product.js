// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authentication');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.recordProductView,productController.getProduct);


// Get categories, subcategories, and locations
router.get('/metadata/categories', productController.getCategoriesAndSubcategories);
router.get('/metadata/locations', productController.getLocations);

// Protected routes - require authentication
router.post('/', 
    requireAuth('token'),
    productController.uploadProductImages,
    productController.createProduct
);

// update product
router.put('/:id',
    requireAuth('token'),
    productController.uploadProductImages,
    productController.updateProduct
);

router.delete('/:id', 
    requireAuth('token'),
    productController.deleteProduct
);

// can be used for myListing 
router.get('/user/products', 
    requireAuth('token'),
    productController.getUserProducts
);

router.get('/category/:category',
    requireAuth('token'),
    productController.getProductsByCategory
);

router.get('/category/:category/:subcategory',
    requireAuth('token'),
    productController.getProductsBySubcategory
);

// New location-based route
router.get('/location/:city',
    requireAuth('token'),
    productController.getProductsByLocation
);


module.exports = router;