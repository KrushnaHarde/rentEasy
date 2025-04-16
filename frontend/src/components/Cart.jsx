// import React, { useEffect, useState } from 'react';
// import axios from "axios";
// import { Trash2, ShoppingCart, Minus, Plus, Star } from 'lucide-react';

// const Cart = () => {

// const [cartItems, setCartItems] = useState([]);
// const [loading, setLoading] = useState(true);


// useEffect(() => {
//   // Extract token from cookies instead of localStorage
//   const getCookieValue = (name) => {
//     const match = document.cookie.match(name);
//     console.log(match);
//     return match ? match[2] : null;
//   };
  
//   const token = getCookieValue('token');
//   console.log(token);
  
//   // Check if token exists before making the request
//   if (!token) {
//     console.log('No authentication token found in cookies');
//     setLoading(false);
//     // You might want to redirect to login page here
//     return;

//   }


//   axios.get("http://localhost:5000/cart")
//   .then((res) => {
//     setCartItems(res.data.items);
//     setLoading(false);
//   })
//   .catch((err) => {
//     if (err.response && err.response.status === 401) {
//       console.error('Authentication failed: Token may be expired or invalid');
//       // You might want to redirect to login page here
//     } else {
//       console.error('Error fetching cart items:', err);
//     }
//     setLoading(false);
//   });
// }, []);




// const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
// if (loading) {
//     return <div className="text-center text-gray-500 mt-20">Loading cart items...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-white relative overflow-hidden text-gray-900 font-sans">
//       {/* Decorative Background Blurs */}
//       <div className="absolute top-0 left-0 w-64 h-64 bg-[#8968CD]/10 rounded-full blur-3xl" />
//       <div className="absolute top-20 right-0 w-96 h-96 bg-[#24aae2]/10 rounded-full blur-3xl" />
//       <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0e8c7f]/10 rounded-full blur-3xl" />

//       {/* Main Content */}
//       <div className="relative max-w-6xl mx-auto px-6 py-16 z-10">
//         <div className="flex items-center justify-between mb-10">
//           <h1 className="text-4xl font-semibold">Shopping Cart</h1>
//           <div className="flex items-center gap-2 text-gray-600">
//             <ShoppingCart className="w-6 h-6" />
//             <span>{cartItems.length} items</span>
//           </div>
//         </div>

//         {/* Cart Items List */}
//         <div className="grid gap-6">
//           {cartItems.map((item) => (
//             <div key={item._id} className="flex flex-col md:flex-row items-start md:items-center bg-white border border-gray-100 rounded-2xl p-5 shadow hover:shadow-md transition-all">
//               <img src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-lg shadow-sm" />
//               <div className="md:ml-6 flex-1 mt-4 md:mt-0">
//                 <h3 className="text-lg font-semibold">{item.name}</h3>
//                 <p className="text-sm text-gray-500">{item.category}</p>

//                 {/* Rating & Delivery */}
//                 <div className="flex items-center text-sm mt-1 text-yellow-500">
//                   <Star className="w-4 h-4 mr-1 fill-yellow-400" />
//                   <span className="text-gray-600">{item.rating} stars</span>
//                 </div>
//                 <p className="text-sm text-green-600 mt-1">{item.delivery}</p>

//                 {/* Quantity & Price */}
//                 <div className="flex items-center justify-between mt-4">
//                   <div className="flex items-center gap-2">
//                     <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
//                       <Minus className="w-4 h-4" />
//                     </button>
//                     <span className="px-3">{item.quantity}</span>
//                     <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
//                       <Plus className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <p className="text-lg font-medium text-blue-700">${(item.price * item.quantity).toFixed(2)}</p>
//                 </div>
//               </div>

//               {/* Delete Button */}
//               <button className="mt-4 md:mt-0 md:ml-4 p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition">
//                 <Trash2 className="w-5 h-5" />
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Cart Summary */}
//         <div className="mt-10 border-t pt-8">
//           <div className="flex justify-between items-center text-lg mb-6">
//             <span className="text-gray-700">Total Amount</span>
//             <span className="text-2xl font-bold text-blue-900">${total.toFixed(2)}</span>
//           </div>
//           <button className="w-70 py-4 rounded-xl text-white font-medium text-lg transition hover:shadow-lg"
//             style={{
//               background: 'linear-gradient(135deg, #096192, #1399c6)',
//               boxShadow: '0 4px 10px rgba(9, 97, 146, 0.2)'
//             }}
//           >
//             Proceed to Checkout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;


import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Trash2, ShoppingCart, Minus, Plus, Star } from 'lucide-react';

const Cart = () => {

const [cartItems, setCartItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    axios.get('http://localhost:5000/cart', { withCredentials: true })
    .then((res) => {
        console.log(res.data);
      const items = res.data.data.items.map((item) => ({
        ...item.product,
        quantity: item.quantity,
        rating: item.product.rating || 4.5,
        delivery: 'Delivery within 3 days'
      }));
      setCartItems(items);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Error fetching cart items:', err);
      setLoading(false);
    });
}, []);


const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
if (loading) {
    return <div className="text-center text-gray-500 mt-20">Loading cart items...</div>;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-gray-900 font-sans">
      {/* Decorative Background Blurs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#8968CD]/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#24aae2]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0e8c7f]/10 rounded-full blur-3xl" />

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
              <img src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-lg shadow-sm" />
              <div className="md:ml-6 flex-1 mt-4 md:mt-0">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>

                {/* Rating & Delivery */}
                <div className="flex items-center text-sm mt-1 text-yellow-500">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400" />
                  <span className="text-gray-600">{item.rating} stars</span>
                </div>
                <p className="text-sm text-green-600 mt-1">{item.delivery}</p>

                {/* Quantity & Price */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-lg font-medium text-blue-700">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>

              {/* Delete Button */}
              <button className="mt-4 md:mt-0 md:ml-4 p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-10 border-t pt-8">
          <div className="flex justify-between items-center text-lg mb-6">
            <span className="text-gray-700">Total Amount</span>
            <span className="text-2xl font-bold text-blue-900">${total.toFixed(2)}</span>
          </div>
          <button className="w-70 py-4 rounded-xl text-white font-medium text-lg transition hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #096192, #1399c6)',
              boxShadow: '0 4px 10px rgba(9, 97, 146, 0.2)'
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;