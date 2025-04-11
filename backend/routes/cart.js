const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authentication'); // Adjust to your auth middleware

const {
  getCart,
  addToCart,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(requireAuth('token'));

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:productId', removeCartItem);
router.delete('/clear', clearCart);

module.exports = router;