const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authentication');
const recommendationController = require('../controllers/recommendationController');

// Get personalized recommendations
router.get('/user', requireAuth("token"), recommendationController.getUserRecommendations);

// Get popular recommendations (for new users or public views)
router.get('/popular', recommendationController.getPopularRecommendations);

// Get similar products
router.get('/similar/:productId', recommendationController.getSimilarProducts);

// Record user interaction (view, rent, wishlist)
router.post('/interaction', requireAuth("token"), recommendationController.recordUserInteraction);

// Get category recommendations
router.get('/categories', requireAuth("token"), recommendationController.getCategoryRecommendations);

module.exports = router;