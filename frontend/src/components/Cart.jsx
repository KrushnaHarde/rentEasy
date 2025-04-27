import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Trash2, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = "http://localhost:5000";

  const fetchCartItems = () => {
    axios.get(`${baseURL}/cart`, { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        const items = res.data.data.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          rating: item.product.rating || 4.5,
          // delivery: 'Delivery within 3 days'
        }));
        setCartItems(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching cart items:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Function to remove item from cart
  const removeFromCart = (id) => {
    axios.delete(`${baseURL}/cart/remove/${id}`, { withCredentials: true })
      .then(() => {
        // Refresh cart items after successful removal
        fetchCartItems();
      })
      .catch((err) => {
        console.error('Error removing item from cart:', err);
      });
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  if (loading) {
    return <div className="text-center text-gray-500 mt-20">Loading cart items...</div>;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-gray-900 font-sans">
      {/* Decorative Background Blurs */}
      <div className="absolute top-[-50px] left-[-50px] w-60 h-60 bg-[#1399c6] opacity-20 rounded-full z-0"></div>
      <div className="absolute bottom-[-60px] right-[-40px] w-72 h-72 bg-[#2AB3E6] opacity-20 rounded-full z-0"></div>
      <div className="absolute top-[200px] left-[-80px] w-40 h-40 bg-[#016D6D] opacity-20 rounded-full z-0"></div>


      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-16 z-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-semibold">Shopping Cart</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <ShoppingCart className="w-6 h-6" />
            <span>{cartItems.length} items</span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="grid gap-6">
          {cartItems.map((item) => (
            <div key={item._id} className="flex flex-col md:flex-row items-start md:items-center bg-white border border-gray-100 rounded-2xl p-5 shadow hover:shadow-md transition-all">
              <Link to={`/product/${item._id}`}>
                {item.productImage && (
                  <img 
                    src={`${item.productImage}`}
                    alt={item.name} 
                    className="w-28 h-28 object-cover rounded-lg shadow-sm" 
                    onError={(e) => {
                      e.target.src = '/api/placeholder/112/112';
                      e.target.alt = 'Image not available';
                    }}
                  />
                )}
                {!item.productImage && (
                  <div className="w-28 h-28 bg-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
              </Link>
              <div className="md:ml-6 flex-1 mt-4 md:mt-0">
                <Link to={`/product/${item._id}`} className="hover:text-blue-600">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                </Link>
                <p className="text-sm text-gray-500">{item.category}</p>

                {/* Rating & Delivery */}
                <div className="flex items-center text-sm mt-1 text-yellow-500">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400" />
                  <span className="text-gray-600">{item.rating} stars</span>
                </div>
                <p className="text-sm text-green-600 mt-1">{item.delivery}</p>

                {/* Price & Quantity */}
                <div className="flex flex-wrap items-center justify-between mt-3">
                  <span className="text-lg font-semibold text-blue-900">₹{item.price?.toFixed(2)}</span>
                  <div className="flex items-center mt-2 md:mt-0">
                    <span className="text-gray-500 mx-2">Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button 
                className="mt-4 md:mt-0 md:ml-4 p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition"
                onClick={() => removeFromCart(item._id)}
                aria-label="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Empty Cart Message */}
        {cartItems.length === 0 && (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500">Looks like you haven't added any products to your cart yet.</p>
            <Link to="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Continue Shopping
            </Link>
          </div>
        )}

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="mt-10 border-t pt-8">
            <div className="flex justify-between items-center text-lg mb-6">
              <span className="text-gray-700">Total Amount</span>
              <span className="text-2xl font-bold text-blue-900">₹{total.toFixed(2)}</span>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;