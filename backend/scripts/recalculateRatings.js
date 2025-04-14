// scripts/recalculateRatings.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const Review = require('../models/review');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Function to recalculate ratings for a single product
async function recalculateProductRating(productId) {
  try {
    // Get all reviews for this product
    const allReviews = await Review.find({ product: productId });
    
    // If no reviews, set rating to 0
    if (allReviews.length === 0) {
      await Product.findByIdAndUpdate(productId, { 
        rating: 0,
        reviewCount: 0
      });
      return { productId, rating: 0, reviewCount: 0 };
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
    
    return { 
      productId, 
      rating: roundedRating, 
      reviewCount: allReviews.length 
    };
  } catch (error) {
    console.error(`Error recalculating rating for product ${productId}:`, error);
    return { productId, error: error.message };
  }
}

// Main function to recalculate all product ratings
async function recalculateAllRatings() {
  try {
    console.log('Starting rating recalculation for all products...');
    
    // Get all products
    const products = await Product.find({}, '_id name');
    console.log(`Found ${products.length} products to process`);
    
    // Process each product
    const results = [];
    for (const product of products) {
      console.log(`Processing product: ${product._id} (${product.name})`);
      const result = await recalculateProductRating(product._id);
      results.push(result);
      console.log(`Updated product ${product._id}: Rating = ${result.rating}, Reviews = ${result.reviewCount}`);
    }
    
    console.log('\nRecalculation complete!');
    console.log(`Processed ${results.length} products`);
    
    // Summary statistics
    const withReviews = results.filter(r => r.reviewCount > 0);
    console.log(`Products with reviews: ${withReviews.length}`);
    console.log(`Products without reviews: ${results.length - withReviews.length}`);
    
    if (withReviews.length > 0) {
      const avgRating = withReviews.reduce((sum, p) => sum + p.rating, 0) / withReviews.length;
      console.log(`Average rating across all products: ${avgRating.toFixed(2)}`);
    }
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error in recalculation process:', error);
  }
}

// Run the recalculation
recalculateAllRatings();