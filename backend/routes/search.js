// routes/search.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authentication'); // Optional authentication
const searchController = require('../controllers/searchController');
const searchSuggestionController = require('../controllers/searchSuggestionController');

// Main search endpoint with multiple filtering options
router.get('/', searchController.searchProducts);

// Search by name
router.get('/by-name', searchController.searchByName);

// Get featured products
router.get('/featured', searchController.getFeaturedProducts);

// Get products by price range
router.get('/price-range', searchController.getProductsByPriceRange);

// Get products by condition
router.get('/condition/:condition', searchController.getProductsByCondition);

// Get products available for specific rental duration
router.get('/duration/:days', searchController.getProductsByDuration);

// // Search products near a location (placeholder)
// router.get('/nearby', searchController.searchNearby);

// Get recently added products
router.get('/recent', searchController.getRecentProducts);

// Get search suggestions
router.get('/suggestions', searchSuggestionController.getSearchSuggestions);

// Get popular search terms
router.get('/popular-terms', searchSuggestionController.getPopularSearchTerms);

module.exports = router;