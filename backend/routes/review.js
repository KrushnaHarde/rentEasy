// routes/review.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authentication'); // Assuming you have an auth middleware
const reviewController = require('../controllers/reviewController');


router.use(requireAuth("token"));
// Create a new review
router.post(
    '/',
    reviewController.uploadReviewImages,
    reviewController.createReview
);

// Get all reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Update a review
router.put(
    '/:reviewId',
    reviewController.uploadReviewImages,
    reviewController.updateReview
);

// Delete a review
router.delete('/:reviewId',reviewController.deleteReview);

// Get reviews by current user
router.get('/user', reviewController.getUserReviews);

module.exports = router;