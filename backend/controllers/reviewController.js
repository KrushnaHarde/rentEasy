// controllers/reviewController.js
const Review = require('../models/review');
const Product = require('../models/product');
const multer = require('multer');
const path = require('path');

// Configure multer storage for review images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/reviews');
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
const uploadReviewImages = upload.array('reviewImages', 3); // Allow up to 3 images per review

// Create a new review
const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(400).json({ error: "You have already reviewed this product" });
        }

        // Create review data
        const reviewData = {
            product: productId,
            user: userId,
            rating: parseInt(rating),
            comment
        };

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            reviewData.images = req.files.map(file => `/uploads/reviews/${file.filename}`);
        }

        // Create the review
        const review = await Review.create(reviewData);

        // Update the product's average rating
        await updateProductRating(productId);

        res.status(201).json({
            message: "Review submitted successfully",
            review
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(400).json({ error: error.message || "Failed to submit review" });
    }
};

// Get all reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const reviews = await Review.find({ product: productId })
            .populate('user', 'fullName email profilePicture')
            .sort('-createdAt');
        
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Find the review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Check if user is the author of the review
        if (review.user.toString() !== userId) {
            return res.status(403).json({ error: "Not authorized to update this review" });
        }

        // Update review data
        const updateData = {
            rating: parseInt(rating) || review.rating,
            comment: comment || review.comment
        };

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => `/uploads/reviews/${file.filename}`);
        }

        // Update the review
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            updateData,
            { new: true, runValidators: true }
        );

        // Update the product's average rating
        await updateProductRating(review.product);

        res.json({
            message: "Review updated successfully",
            review: updatedReview
        });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(400).json({ error: error.message || "Failed to update review" });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Find the review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Check if user is the author of the review
        if (review.user.toString() !== userId) {
            return res.status(403).json({ error: "Not authorized to delete this review" });
        }

        // Store product ID for later use
        const productId = review.product;

        // Delete the review
        await Review.findByIdAndDelete(reviewId);

        // Update the product's average rating
        await updateProductRating(productId);

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Failed to delete review" });
    }
};

// Get reviews by user
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const reviews = await Review.find({ user: userId })
            .populate('product', 'name productImage')
            .sort('-createdAt');
        
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ error: "Failed to fetch user reviews" });
    }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
    try {
        // Get all reviews for this product
        const reviews = await Review.find({ product: productId });
        
        if (reviews.length === 0) {
            // No reviews, reset rating to default
            await Product.findByIdAndUpdate(productId, { rating: 0 });
            return;
        }
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Update product rating
        await Product.findByIdAndUpdate(productId, { 
            rating: parseFloat(averageRating.toFixed(1)) 
        });
    } catch (error) {
        console.error("Error updating product rating:", error);
    }
};

module.exports = {
    uploadReviewImages,
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getUserReviews
};