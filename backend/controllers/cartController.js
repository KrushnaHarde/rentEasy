const Cart = require('../models/cart');
const Product = require('../models/product');

// Get the user's cart or create a new one if it doesn't exist
exports.getCart = async (req, res) => {
try {
    // Ensure we're getting the user ID properly from your auth middleware
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
    return res.status(401).json({
        success: false,
        message: 'User not authenticated properly'
    });
    }
    
    // console.log("Looking for cart with user ID:", userId);
    
    // Find user's cart
    let cart = await Cart.findOne({ user: userId })
    .populate('items.product');

    if (!cart) {
    // Create new cart with explicit user ID
    cart = new Cart({ 
        user: userId,
        items: [] 
    });
    await cart.save();
    // console.log("Created new cart for user:", userId);
    }

    res.status(200).json({
    success: true,
    data: cart
    });
} catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message
    });
}
};

exports.addToCart = async (req, res) => {
try {
    const { productId, quantity = 1 } = req.body;
    // Ensure we're getting the user ID properly
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated properly'

        });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
    return res.status(404).json({
        success: false,
        message: 'Product not found'
    });
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
    cart = new Cart({ 
        user: userId, 
        items: [] 
    });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => 
    item.product.toString() === productId);

    if (itemIndex > -1) {
    // Product exists in cart, update quantity
    cart.items[itemIndex].quantity += quantity;
    } else {
    // Product not in cart, add new item
    cart.items.push({
        product: productId,
        quantity
    });
    }

    await cart.save();

    // Return populated cart
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
    success: true,
    data: cart
    });
} catch (error) {
    // console.error("Add to cart error:", error);
    res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message
    });
}
};

// Remove an item from cart
exports.removeCartItem = async (req, res) => {
try {
    const { productId } = req.params;
    // Ensure we're getting the user ID properly
    const userId = req.user._id || req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
    return res.status(404).json({
        success: false,
        message: 'Cart not found'
    });
    }

    // Filter out the item
    cart.items = cart.items.filter(item => 
    item.product.toString() !== productId);

    await cart.save();

    res.status(200).json({
    success: true,
    message: 'Item removed from cart'
    });
} catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message
    });
}
};

// Clear cart
exports.clearCart = async (req, res) => {
try {
    // Ensure we're getting the user ID properly
    const userId = req.user._id || req.user.id;
    
    // Find and update user's cart
    const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } },
    { new: true }
    );

    if (!cart) {
    return res.status(404).json({
        success: false,
        message: 'Cart not found'
    });
    }

    res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart
    });
} catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message
    });
}
};
