//profile
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  User,
  Mail,
  Phone,
  Lock,
  Edit,
  Package,
  ShoppingCart,
  Bell,
  LogOut,
  ClipboardList,
} from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    password: '********',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  });

  const validateEmail = (email) => email.includes('@') && email.includes('.');
  const validatePhone = (phone) => phone.length === 10 && /^\d+$/.test(phone);

  const navigate = useNavigate();

const handleRentProductClick = () => {
  navigate('/rent_product'); // or your route path
};

  const handleProfileUpdate = (field, value) => {
    if (field === 'email' && !validateEmail(value)) {
      alert('Please enter a valid email address');
      return;
    }
    if (field === 'phone' && !validatePhone(value)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setProfile({ ...profile, [field]: value });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'booked':
        return <h2 className="text-3xl font-bold text-[#096192]">Booked Products</h2>;
      case 'listings':
        return <h2 className="text-3xl font-bold text-[#096192]">My Listings</h2>;
      // case 'cart':
        // return <h2 className="text-3xl font-bold text-[#096192]">My Cart</h2>;
      case 'notifications':
        return <h2 className="text-3xl font-bold text-[#096192]">Notifications</h2>;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#096192]">Profile Information</h2>
            <p className="text-gray-600">Manage your profile information and security settings.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white geometric-background flex items-center justify-center">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#8968CD]/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#24aae2]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0e8c7f]/10 rounded-full blur-3xl" />
      <div className="w-full max-w-6xl mx-auto px-4 py-8 z-10">
        <div className="bg-white/40 rounded-xl shadow-lg overflow-hidden relative backdrop-blur-sm border border-white/20">
          <div className="flex">
            {/* Left Section */}
            <div className="w-1/3 bg-gradient-to-br from-[#096192]/10 via-[#1399c6]/5 to-transparent p-6">
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
                  {!isEditing ? (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xl font-semibold text-[#096192]">{profile.name}</h3>
                      <p className="text-sm text-[#1399c6]">{profile.email}</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileUpdate('name', e.target.value)}
                        className="w-full px-3 py-2 rounded bg-white/80 text-[#096192] backdrop-blur-sm border border-[#1399c6]/20"
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="w-full px-3 py-2 rounded bg-white/80 text-[#096192] backdrop-blur-sm border border-[#1399c6]/20"
                        placeholder="Email"
                      />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                        className="w-full px-3 py-2 rounded bg-white/80 text-[#096192] backdrop-blur-sm border border-[#1399c6]/20"
                        placeholder="Phone"
                        maxLength={10}
                      />
                      <input
                        type="password"
                        onChange={(e) => handleProfileUpdate('password', e.target.value)}
                        className="w-full px-3 py-2 rounded bg-white/80 text-[#096192] backdrop-blur-sm border border-[#1399c6]/20"
                        placeholder="New Password"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-[#096192]/10 rounded-lg hover:bg-[#096192]/20 transition-colors backdrop-blur-sm border border-[#1399c6]/20 text-[#096192]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Save Profile' : 'Edit Profile'}
                  </button>
                </div>

                <button className="w-full px-4 py-2 bg-[#0e8c7f]/10 rounded-lg hover:bg-[#0e8c7f]/20 transition-colors backdrop-blur-sm border border-[#0e8c7f]/20 flex items-center justify-center text-[#0e8c7f] " onClick={handleRentProductClick}>
                  <Package className="w-4 h-4 mr-2" />
                  Rent a Product
                </button>

                <nav className="space-y-2">
                  {[
                    { icon: ClipboardList, label: 'Booked Products', id: 'booked' },
                    { icon: Package, label: 'My Listings', id: 'listings' },
                    // { icon: ShoppingCart, label: 'My Cart', id: 'cart' },
                    { icon: Bell, label: 'Notifications', id: 'notifications' },
                    { icon: LogOut, label: 'Logout', id: 'logout' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full px-4 py-2 rounded-lg flex items-center transition-all border border-[#1399c6]/10 backdrop-blur-sm text-[#096192]
                        ${activeSection === item.id ? 'bg-[#096192]/10' : 'hover:bg-[#096192]/5'}`}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right Section */}
            <div className="w-2/3 p-8 bg-gradient-to-br from-[#1399c6]/5 via-transparent to-[#0e8c7f]/5">
              <div className="animate-fadeIn">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
