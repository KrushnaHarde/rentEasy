// controllers/recommendationController.js
const UserInteraction = require('../models/userInteraction');
const Product = require('../models/product');
const User = require('../models/user');

// Helper function to compute similarity between users
const computeUserSimilarity = (userInteractions1, userInteractions2) => {
  // Create dictionaries of product interactions for both users
  const user1Products = {};
  const user2Products = {};
  
  userInteractions1.forEach(interaction => {
    user1Products[interaction.productId.toString()] = interaction.interactionType;
  });
  
  userInteractions2.forEach(interaction => {
    user2Products[interaction.productId.toString()] = interaction.interactionType;
  });
  
  // Find common products
  const commonProducts = Object.keys(user1Products).filter(productId => 
    user2Products.hasOwnProperty(productId)
  );
  
  if (commonProducts.length === 0) return 0;
  
  // Calculate similarity score - higher weight for rentals, lower for views
  let similarityScore = 0;
  commonProducts.forEach(productId => {
    const interaction1 = user1Products[productId];
    const interaction2 = user2Products[productId];
    
    // Assign weights based on interaction type
    let weight = 0;
    if (interaction1 === 'RENT' && interaction2 === 'RENT') weight = 3;
    else if (interaction1 === 'WISHLIST' && interaction2 === 'WISHLIST') weight = 2;
    else if ((interaction1 === 'RENT' && interaction2 === 'WISHLIST') || 
             (interaction1 === 'WISHLIST' && interaction2 === 'RENT')) weight = 1.5;
    else if ((interaction1 === 'RENT' && interaction2 === 'VIEW') || 
             (interaction1 === 'VIEW' && interaction2 === 'RENT')) weight = 1;
    else weight = 0.5; // Both are views or other combinations
    
    similarityScore += weight;
  });
  
  // Normalize by maximum possible similarity
  return similarityScore / (Math.max(Object.keys(user1Products).length, Object.keys(user2Products).length) * 3);
};

// Get personalized recommendations for a user
const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    // Step 1: Get the current user's interactions
    const userInteractions = await UserInteraction.find({ userId })
      .populate('productId', 'category subcategory');
    
    if (userInteractions.length === 0) {
      // If no interactions, return popular products
      return getPopularRecommendations(req, res);
    }
    
    // Step 2: Find products this user has interacted with
    const interactedProductIds = userInteractions.map(interaction => 
      interaction.productId._id.toString()
    );
    
    // Step 3: Get category preferences from user's interactions
    const categoryPreferences = {};
    userInteractions.forEach(interaction => {
      const category = interaction.productId.category;
      if (!categoryPreferences[category]) {
        categoryPreferences[category] = 0;
      }
      
      // Weight by interaction type
      let weight = 1;
      if (interaction.interactionType === 'RENT') weight = 3;
      else if (interaction.interactionType === 'WISHLIST') weight = 2;
      
      categoryPreferences[category] += weight;
    });
    
    // Step 4: Find other users with similar interactions
    const allUsers = await User.find({ _id: { $ne: userId } }).select('_id');
    
    // Step 5: Calculate user similarity and get recommendations
    const userSimilarities = [];
    
    for (const user of allUsers) {
      const otherUserId = user._id;
      
      // Get other user's interactions
      const otherUserInteractions = await UserInteraction.find({ userId: otherUserId })
        .populate('productId', 'category subcategory');
      
      if (otherUserInteractions.length === 0) continue;
      
      // Calculate similarity score
      const similarity = computeUserSimilarity(userInteractions, otherUserInteractions);
      
      // Only consider users with some similarity
      if (similarity > 0.1) {
        userSimilarities.push({
          userId: otherUserId,
          similarity,
          interactions: otherUserInteractions
        });
      }
    }
    
    // Sort users by similarity (highest first)
    userSimilarities.sort((a, b) => b.similarity - a.similarity);
    
    // Step 6: Find products that similar users have interacted with but current user hasn't
    const recommendedProductScores = {};
    
    for (const similar of userSimilarities) {
      for (const interaction of similar.interactions) {
        const productId = interaction.productId._id.toString();
        
        // Skip if user already interacted with this product
        if (interactedProductIds.includes(productId)) continue;
        
        if (!recommendedProductScores[productId]) {
          recommendedProductScores[productId] = 0;
        }
        
        // Weight by interaction type and user similarity
        let weight = similar.similarity;
        if (interaction.interactionType === 'RENT') weight *= 3;
        else if (interaction.interactionType === 'WISHLIST') weight *= 2;
        
        // Boost weight if product is in user's preferred categories
        const productCategory = interaction.productId.category;
        if (categoryPreferences[productCategory]) {
          weight *= (1 + categoryPreferences[productCategory] / 
                    Math.max(...Object.values(categoryPreferences)));
        }
        
        recommendedProductScores[productId] += weight;
      }
    }
    
    // Step 7: If not enough recommendations, add content-based recommendations
    if (Object.keys(recommendedProductScores).length < limit) {
      // Find top categories and get similar products
      const sortedCategories = Object.entries(categoryPreferences)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
      
      if (sortedCategories.length > 0) {
        const categoryProducts = await Product.find({
          category: { $in: sortedCategories.slice(0, 3) },
          _id: { $nin: interactedProductIds }
        }).limit(limit * 2);
        
        // Add these products with a lower score
        categoryProducts.forEach(product => {
          const productId = product._id.toString();
          if (!recommendedProductScores[productId]) {
            const categoryIndex = sortedCategories.indexOf(product.category);
            const categoryWeight = 1 - (categoryIndex / sortedCategories.length);
            recommendedProductScores[productId] = categoryWeight * 0.5; // Lower weight than collaborative filtering
          }
        });
      }
    }
    
    // Step 8: Sort products by score and get top recommendations
    const recommendedProductIds = Object.entries(recommendedProductScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, Number(limit))
      .map(entry => entry[0]);
    
    // Step 9: Get full product details
    const recommendedProducts = await Product.find({
      _id: { $in: recommendedProductIds }
    }).populate('uploadedBy', 'fullName email');
    
    // Sort returned products by their score
    recommendedProducts.sort((a, b) => {
      const scoreA = recommendedProductScores[a._id.toString()];
      const scoreB = recommendedProductScores[b._id.toString()];
      return scoreB - scoreA;
    });
    
    res.json(recommendedProducts);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};

// Get popular recommendations (fallback for new users)
const getPopularRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // For new users with no history, recommend popular items
    // Popularity is based on view count, wishlist additions, and rentals
    
    // Get aggregated interaction counts per product
    const productInteractions = await UserInteraction.aggregate([
      {
        $group: {
          _id: "$productId",
          totalInteractions: { $sum: 1 },
          rentCount: {
            $sum: { $cond: [{ $eq: ["$interactionType", "RENT"] }, 3, 0] }
          },
          wishlistCount: {
            $sum: { $cond: [{ $eq: ["$interactionType", "WISHLIST"] }, 2, 0] }
          },
          viewCount: {
            $sum: { $cond: [{ $eq: ["$interactionType", "VIEW"] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          popularityScore: {
            $add: ["$rentCount", "$wishlistCount", "$viewCount"]
          }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: Number(limit) }
    ]);
    
    // Get full product details
    const productIds = productInteractions.map(item => item._id);
    
    const popularProducts = await Product.find({
      _id: { $in: productIds }
    }).populate('uploadedBy', 'fullName email');
    
    // Sort by popularity score
    popularProducts.sort((a, b) => {
      const scoreA = productInteractions.find(i => i._id.equals(a._id))?.popularityScore || 0;
      const scoreB = productInteractions.find(i => i._id.equals(b._id))?.popularityScore || 0;
      return scoreB - scoreA;
    });
    
    res.json(popularProducts);
  } catch (error) {
    console.error("Popular recommendations error:", error);
    res.status(500).json({ error: "Failed to get popular recommendations" });
  }
};

// Get similar products to a given product
const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;
    
    // Get the reference product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Find products in the same category and subcategory
    const similarProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category, subcategory: product.subcategory },
        { category: product.category, price: { $gte: product.price * 0.8, $lte: product.price * 1.2 } }
      ]
    })
      .populate('uploadedBy', 'fullName email')
      .limit(Number(limit));
    
    res.json(similarProducts);
  } catch (error) {
    console.error("Similar products error:", error);
    res.status(500).json({ error: "Failed to get similar products" });
  }
};

// Record user interaction
const recordUserInteraction = async (req, res) => {
  try {
    const { productId, interactionType, searchQuery, rentalDuration } = req.body;
    const userId = req.user.id;
    
    // Validate product exists
    if (interactionType !== 'SEARCH') {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
    }
    
    // Create interaction
    const interaction = await UserInteraction.create({
      userId,
      productId: interactionType === 'SEARCH' ? null : productId,
      interactionType,
      searchQuery: interactionType === 'SEARCH' ? searchQuery : undefined,
      rentalDuration: interactionType === 'RENT' ? rentalDuration : undefined
    });
    
    res.status(201).json({
      message: "Interaction recorded successfully",
      interaction
    });
  } catch (error) {
    console.error("Record interaction error:", error);
    res.status(500).json({ error: "Failed to record interaction" });
  }
};

// Get category recommendations based on user history
const getCategoryRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's interaction history
    const userInteractions = await UserInteraction.find({ userId })
      .populate('productId', 'category subcategory');
    
    if (userInteractions.length === 0) {
      // Return default categories if no history
      return res.json(Object.values(Product.CATEGORIES).slice(0, 5));
    }
    
    // Count interactions by category
    const categoryScores = {};
    
    userInteractions.forEach(interaction => {
      if (!interaction.productId || !interaction.productId.category) return;
      
      const category = interaction.productId.category;
      if (!categoryScores[category]) {
        categoryScores[category] = 0;
      }
      
      // Weight by interaction type
      let weight = 1;
      if (interaction.interactionType === 'RENT') weight = 3;
      else if (interaction.interactionType === 'WISHLIST') weight = 2;
      
      categoryScores[category] += weight;
    });
    
    // Sort categories by score
    const recommendedCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
    
    res.json(recommendedCategories);
  } catch (error) {
    console.error("Category recommendations error:", error);
    res.status(500).json({ error: "Failed to get category recommendations" });
  }
};

module.exports = {
  getUserRecommendations,
  getPopularRecommendations,
  getSimilarProducts,
  recordUserInteraction,
  getCategoryRecommendations
};