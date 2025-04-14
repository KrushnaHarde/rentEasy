// controllers/adminController.js
const Product = require('../models/product');
const Review = require('../models/review');

// Recalculate all product ratings
const recalculateAllRatings = async (req, res) => {
    try {
        // Get all products
        const products = await Product.find({}, '_id name');
        const results = [];
        
        // Process each product
        for (const product of products) {
            const result = await recalculateProductRating(product._id);
            results.push({
                id: product._id,
                name: product.name,
                rating: result.rating,
                reviewCount: result.reviewCount
            });
        }
        
        res.json({
            message: "All product ratings recalculated successfully",
            productsProcessed: products.length,
            results: results
        });
    } catch (error) {
        console.error("Error recalculating ratings:", error);
        res.status(500).json({ error: "Failed to recalculate ratings" });
    }
};

// Helper function to recalculate product rating
async function recalculateProductRating(productId) {
    // Get all reviews for this product
    const allReviews = await Review.find({ product: productId });
    
    // If no reviews, set rating to 0
    if (allReviews.length === 0) {
        await Product.findByIdAndUpdate(productId, { 
            rating: 0,
            reviewCount: 0
        });
        return { rating: 0, reviewCount: 0 };
    }
    
    // Calculate average rating
    let totalRating = 0;
    for (const review of allReviews) {
        totalRating += review.rating;
    }
    
    const averageRating = totalRating / allReviews.length;
    const roundedRating = parseFloat(averageRating.toFixed(1));
    
    // Update product with average rating and review count
    await Product.findByIdAndUpdate(productId, { 
        rating: roundedRating,
        reviewCount: allReviews.length
    });
    
    return { rating: roundedRating, reviewCount: allReviews.length };
}

module.exports = {
    recalculateAllRatings
};