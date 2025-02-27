// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes - require authentication
router.post('/', 
    requireAuth('token'),
    productController.uploadProductImages,
    productController.createProduct
);

router.put('/:id',
    requireAuth('token'),
    productController.uploadProductImages,
    productController.updateProduct
);

router.delete('/:id', 
    requireAuth('token'),
    productController.deleteProduct
);

router.get('/user/products', 
    requireAuth('token'),
    productController.getUserProducts
);

module.exports = router;