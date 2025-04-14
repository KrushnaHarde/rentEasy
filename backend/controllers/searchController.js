// controllers/searchController.js
const Product = require('../models/product');

// Base search function with multiple filtering options
const searchProducts = async (req, res) => {
    try {
        const {
            query,            // Text search query
            category,         // Category filter
            subcategory,      // Subcategory filter
            minPrice,         // Minimum price
            maxPrice,         // Maximum price
            minRating,        // Minimum rating
            condition,        // Product condition
            sortBy,           // Sort field
            sortOrder,        // Sort direction (asc/desc)
            page = 1,         // Pagination page
            limit = 10        // Items per page
        } = req.query;

        // Build the query object
        const searchQuery = {};

        // Text search across multiple fields
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            searchQuery.category = category;
        }

        // Subcategory filter
        if (subcategory) {
            searchQuery.subcategory = subcategory;
        }

        // Price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            searchQuery.price = {};
            
            if (minPrice !== undefined) {
                searchQuery.price.$gte = Number(minPrice);
            }
            
            if (maxPrice !== undefined) {
                searchQuery.price.$lte = Number(maxPrice);
            }
        }

        // Rating filter
        if (minRating !== undefined) {
            searchQuery.rating = { $gte: Number(minRating) };
        }

        // Product condition filter
        if (condition) {
            searchQuery.productCondition = condition;
        }

        // Build sort options
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default sort by createdAt date desc
            sortOptions.createdAt = -1;
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        
        // Execute query with pagination
        const products = await Product.find(searchQuery)
            .populate('uploadedBy', 'fullName email')
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(searchQuery);
        
        res.json({
            products,
            pagination: {
                total: totalProducts,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(totalProducts / Number(limit))
            }
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Failed to search products" });
    }
};

// Search products by name
const searchByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: "Search term is required" });
        }

        const products = await Product.find({
            name: { $regex: name, $options: 'i' }
        })
            .populate('uploadedBy', 'fullName email')
            .sort('-createdAt');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to search products" });
    }
};

// Get featured or trending products
const getFeaturedProducts = async (req, res) => {
    try {
        // Featured products could be those with highest ratings
        const products = await Product.find({
            rating: { $gte: 4 }  // Products with rating 4 or higher
        })
            .populate('uploadedBy', 'fullName email')
            .sort('-rating -createdAt')
            .limit(10);
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch featured products" });
    }
};

// Get products by price range
const getProductsByPriceRange = async (req, res) => {
    try {
        const { min, max } = req.query;
        
        const query = {};
        if (min) query.price = { $gte: Number(min) };
        if (max) {
            if (query.price) {
                query.price.$lte = Number(max);
            } else {
                query.price = { $lte: Number(max) };
            }
        }
        
        const products = await Product.find(query)
            .populate('uploadedBy', 'fullName email')
            .sort('price');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products by price range" });
    }
};

// Get products by condition
const getProductsByCondition = async (req, res) => {
    try {
        const { condition } = req.params;
        
        const products = await Product.find({ productCondition: condition })
            .populate('uploadedBy', 'fullName email')
            .sort('-createdAt');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products by condition" });
    }
};

// Get products available for specific rental duration
const getProductsByDuration = async (req, res) => {
    try {
        const { days } = req.params;
        
        const products = await Product.find({
            'duration.days': { $gte: Number(days) }
        })
            .populate('uploadedBy', 'fullName email')
            .sort('-createdAt');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products by duration" });
    }
};

// Search products near a location
// This is a placeholder - to implement fully, you'd need geospatial data
// const searchNearby = async (req, res) => {
//     try {
//         // This would be implemented with geospatial queries if your schema had location data
//         res.status(501).json({ message: "Nearby search not implemented yet" });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to search nearby products" });
//     }
// };

// Get recently added products
const getRecentProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const products = await Product.find()
            .populate('uploadedBy', 'fullName email')
            .sort('-createdAt')
            .limit(Number(limit));
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recent products" });
    }
};

module.exports = {
    searchProducts,
    searchByName,
    getFeaturedProducts,
    getProductsByPriceRange,
    getProductsByCondition,
    getProductsByDuration,
    getRecentProducts
};