// controllers/searchSuggestionController.js
const Product = require('../models/product');

// Get search suggestions based on partial input
const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.json([]);
        }
        
        // Get product name suggestions
        const productNameSuggestions = await Product.aggregate([
            {
                $match: {
                    name: { $regex: query, $options: 'i' }
                }
            },
            {
                $group: {
                    _id: null,
                    names: { $addToSet: '$name' }
                }
            },
            { $limit: 1 }
        ]);
        
        // Get category suggestions
        const categorySuggestions = await Product.aggregate([
            {
                $match: {
                    category: { $regex: query, $options: 'i' }
                }
            },
            {
                $group: {
                    _id: null,
                    categories: { $addToSet: '$category' }
                }
            },
            { $limit: 1 }
        ]);
        
        // Get subcategory suggestions
        const subcategorySuggestions = await Product.aggregate([
            {
                $match: {
                    subcategory: { $regex: query, $options: 'i' }
                }
            },
            {
                $group: {
                    _id: null,
                    subcategories: { $addToSet: '$subcategory' }
                }
            },
            { $limit: 1 }
        ]);
        
        // Combine all suggestions
        const suggestions = {
            products: productNameSuggestions.length > 0 ? productNameSuggestions[0].names.slice(0, 5) : [],
            categories: categorySuggestions.length > 0 ? categorySuggestions[0].categories : [],
            subcategories: subcategorySuggestions.length > 0 ? subcategorySuggestions[0].subcategories : []
        };
        
        res.json(suggestions);
    } catch (error) {
        console.error("Error getting search suggestions:", error);
        res.status(500).json({ error: "Failed to get search suggestions" });
    }
};

// Get popular search terms (could be based on analytics in a real system)
const getPopularSearchTerms = async (req, res) => {
    try {
        // This would ideally be based on analytics data
        // For now, just return the most common categories
        const popularCategories = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, term: '$_id', count: 1 } }
        ]);
        
        res.json(popularCategories);
    } catch (error) {
        console.error("Error getting popular search terms:", error);
        res.status(500).json({ error: "Failed to get popular search terms" });
    }
};

module.exports = {
    getSearchSuggestions,
    getPopularSearchTerms
};