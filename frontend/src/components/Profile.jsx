import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Package, Bell, LogOut, ClipboardList, Image } from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  });
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/user/profile", {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        setProfile({
          name: response.data.fullName || response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          avatar: response.data.avatar || profile.avatar
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please login again.");
        setLoading(false);

        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Function to fetch user's products
  const fetchUserProducts = async () => {
    if (activeSection === 'listings') {
      try {
        setProductsLoading(true);
        const response = await axios.get("http://localhost:5000/product/user/products", {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("User Products:", response.data);
        setUserProducts(response.data);
        setProductsLoading(false);
      } catch (err) {
        console.error("Failed to fetch user products:", err);
        setProductsLoading(false);
        
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        }
      }
    }
  };

  // Fetch products when activeSection changes to 'listings'
  useEffect(() => {
    fetchUserProducts();
  }, [activeSection]);

  const handleRentProductClick = () => {
    navigate('/rent');
  };

  const handleViewProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/user/logout", {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Logout failed");
    }
  };

  const renderMyListings = () => {
    if (productsLoading) {
      return (
        <div className="flex justify-center mt-8">
          <div className="text-[#096192] flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading your listings...
          </div>
        </div>
      );
    }

    if (userProducts.length === 0) {
      return (
        <div className="mt-8 text-center p-6 bg-white/60 rounded-xl shadow-sm backdrop-blur-sm">
          <Package className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">No listings yet</h3>
          <p className="mt-2 text-gray-500">You haven't listed any products for rent.</p>
          <button
            onClick={handleRentProductClick}
            className="mt-4 px-4 py-2 bg-[#096192] text-white rounded-lg hover:bg-[#074e75] transition-colors"
          >
            List a Product
          </button>
        </div>
      );
    }

    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {userProducts.map(product => (
          <div 
            key={product._id} 
            className="bg-white/60 rounded-xl p-4 shadow-sm backdrop-blur-sm border border-white/20 transition-all hover:shadow-md cursor-pointer"
            onClick={() => handleViewProductDetails(product._id)}
          >
            <div className="flex items-start">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ""; // Set to empty to show the fallback div
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="hidden w-24 h-24 bg-gray-200 rounded-lg mr-4 items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#096192] text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.description?.substring(0, 60)}{product.description?.length > 60 ? '...' : ''}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-[#0e8c7f] font-medium">${product.price}/day</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProductDetails(product._id);
                    }}
                    className="text-xs px-3 py-1 bg-[#096192]/10 text-[#096192] rounded-full hover:bg-[#096192]/20"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'booked':
        return <h2 className="text-3xl font-bold text-[#096192]">Booked Products</h2>;
      case 'listings':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#096192]">My Listings</h2>
                <p className="text-gray-600">Products you've listed for rent.</p>
              </div>
              <button
                onClick={handleRentProductClick}
                className="px-4 py-2 bg-[#0e8c7f] text-white rounded-lg hover:bg-[#086b5e] transition-colors flex items-center"
              >
                <Package className="w-4 h-4 mr-2" />
                Add New Listing
              </button>
            </div>
            {renderMyListings()}
          </div>
        );
      case 'notifications':
        return <h2 className="text-3xl font-bold text-[#096192]">Notifications</h2>;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#096192]">Profile Information</h2>
            <p className="text-gray-600">View your profile information and security settings.</p>

            <div className="bg-white/60 rounded-xl p-6 shadow-sm backdrop-blur-sm mt-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p className="mt-1 text-lg font-medium text-[#096192]">{profile.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                  <p className="mt-1 text-lg font-medium text-[#096192]">{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1 text-lg font-medium text-[#096192]">{profile.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#096192] text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white geometric-background flex items-center justify-center">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#8968CD]/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#24aae2]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0e8c7f]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-6xl mx-auto px-4 py-8 z-10">
        <div className="bg-white/40 rounded-xl shadow-lg overflow-hidden relative backdrop-blur-sm border border-white/20">
          <div className="flex flex-col md:flex-row">
            
            {/* Left Section */}
            <div className="w-full md:w-1/3 bg-gradient-to-br from-[#096192]/10 via-[#1399c6]/5 to-transparent p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mx-auto border-4 border-white/80 transition-transform hover:scale-105 shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#096192]/10 to-transparent"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-xl font-semibold text-[#096192]">{profile.name}</h3>
                    <p className="text-sm text-[#1399c6]">{profile.email}</p>
                  </div>
                </div>

                <button
                  className="w-full px-4 py-2 bg-[#0e8c7f]/10 rounded-lg hover:bg-[#0e8c7f]/20 transition-colors backdrop-blur-sm border border-[#0e8c7f]/20 flex items-center justify-center text-[#0e8c7f]"
                  onClick={handleRentProductClick}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Rent a Product
                </button>

                <nav className="space-y-2">
                  {[
                    { icon: ClipboardList, label: 'Booked Products', id: 'booked' },
                    { icon: Package, label: 'My Listings', id: 'listings' },
                    { icon: Bell, label: 'Notifications', id: 'notifications' },
                    { icon: LogOut, label: 'Logout', id: 'logout' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.id === 'logout' ? handleLogout() : setActiveSection(item.id)}
                      className={`w-full px-4 py-2 rounded-lg flex items-center transition-all border border-[#1399c6]/10 backdrop-blur-sm text-[#096192] ${
                        activeSection === item.id ? 'bg-[#096192]/10' : 'hover:bg-[#096192]/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right Section */}
            <div className="w-full md:w-2/3 p-8 bg-gradient-to-br from-[#1399c6]/5 via-transparent to-[#0e8c7f]/5">
              <div className="animate-fadeIn">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;