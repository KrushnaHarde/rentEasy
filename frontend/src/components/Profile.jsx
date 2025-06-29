import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Edit,
  Package,
  Bell,
  LogOut,
  ClipboardList,
  Image,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

function App() {
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage:
      "https://img.freepik.com/premium-psd/contact-icon-illustration-isolated_23-2151903357.jpg",
  });

  const [newName, setNewName] = useState(profile.name);
  const [newEmail, setNewEmail] = useState(profile.email);
  // const [newAvatar, setNewAvatar] = useState(profile.avatar);
  const [newAvatarFile, setNewAvatarFile] = useState(null); // file
  const [avatarPreview, setAvatarPreview] = useState(""); // preview image
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentAlertId, setCurrentAlertId] = useState(""); // will store a alert ID. 
  const [newPhone, setNewPhone] = useState(profile.phone);

  useEffect(() => {
    setNewName(profile.name);
    setNewEmail(profile.email);
     setNewPhone(profile.phone);
    setAvatarPreview(profile.avatar); // show current pic as preview
  }, [profile]);

  const [userProducts, setUserProducts] = useState([]);
  const [rentalProducts, setRentalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const baseURL = "http://localhost:5000";

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/user/profile", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        setProfile({
          name: response.data.fullName || response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          avatar: response.data.profileImage || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please login again.");
        setLoading(false);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          navigate("/login");
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    fetchUserProducts();
  }, [activeSection]);

  // Fetch products or rentals or alerts when activeSection changes
  useEffect(() => {
    if (activeSection === "listings") {
      fetchUserProducts();
    } else if (activeSection === "booked") {
      fetchRentalRequests();
    } else if (activeSection === "alerts") {
      fetchAlerts();
    }
  }, [activeSection]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/user/profile`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        setProfile({
          name: response.data.fullName || response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          profileImage: response.data.profileImage || profile.avatar,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please login again.");
        setLoading(false);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          navigate("/login");
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Function to fetch user's alerts (rental requests)
  const fetchAlerts = async () => {
    if (activeSection === "alerts") {
      try {
        setAlertsLoading(true);
        const response = await axios.get(`${baseURL}/notifications`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // console.log("on line 143 in fetch alert", response.data);

        // Filter only rental request notifications
        const rentalAlerts = response.data.filter(
          (alert) => alert.type === "rental_request" && alert.isRead === false
        );
        // console.log("Rental Alerts:", rentalAlerts);
        setAlerts(rentalAlerts);
        setAlertsLoading(false);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
        setAlertsLoading(false);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          navigate("/login");
        }
      }
    }
  };

  const markAlertAsRead = async (alertId) => {
    try {
      // console.log("Marking alert as read:", alertId);
      await axios.put(
        `${baseURL}/notifications/${alertId}/read`,
        {}, // Empty request body
        {
          // Configuration object as third parameter
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${baseURL}/product/${productId}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Remove product from state
        setUserProducts(
          userProducts.filter((product) => product._id !== productId)
        );
        alert("Product deleted successfully!");
      } catch (err) {
        console.error("Failed to delete product:", err);
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Failed to delete the product. Please try again.");
        }
      }
    }
  };

  const handleApproveRental = async (rentalId) => {
    try {
      await axios.patch(
        `${baseURL}/rental/${rentalId}/approve`,
        {status: "approved"},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // yk
      // await markAlertAsRead(alertId);

      // Refresh alerts after approval
      fetchAlerts();
      // Clear selected rental
      setSelectedRental(null);
      setCurrentAlertId(null);

      alert("Rental request approved successfully!");
      return true;
    } catch (err) {
      console.error("Failed to approve rental:", err);
      alert("Failed to approve rental request. Please try again.");
      return false;
    }
  };

  const handleRejectRental = async (rentalId) => {
    try {
      await axios.patch(
        `${baseURL}/rental/${rentalId}/cancel`,
        {status: "rejected"},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // await markAlertAsRead(alertId);

      // Refresh alerts after rejection
      fetchAlerts();
      // Clear selected rental
      setSelectedRental(null);
      setCurrentAlertId(null);

      alert("Rental request rejected successfully!");
      return true;
    } catch (err) {
      console.error("Failed to reject rental:", err);
      console.log("Error details:", err.response?.data || err.message);
      alert("Failed to reject rental request. Please try again.");
      return false;
    }
  };

  // Function to fetch user's products
  const fetchUserProducts = async () => {
    if (activeSection === "listings") {
      try {
        setProductsLoading(true);
        const response = await axios.get(`${baseURL}/product/user/products`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        // console.log("User Products:", response.data);
        setUserProducts(response.data);
        setProductsLoading(false);
      } catch (err) {
        console.error("Failed to fetch user products:", err);
        setProductsLoading(false);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          navigate("/login");
        }
      }
    }
  };

  // Function to fetch user's rental requests
  const fetchRentalRequests = async () => {
    if (activeSection === "booked") {
      try {
        setRentalsLoading(true);
        const response = await axios.get(`${baseURL}/rental/user`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        // console.log("User Rental Requests:", response.data);
        setRentalProducts(response.data);
        setRentalsLoading(false);
      } catch (err) {
        console.error("Failed to fetch rental requests:", err);
        setRentalsLoading(false);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          navigate("/login");
        }
      }
    }
  };

  const fetchRentalDetails = async (rentalId) => {
    try {
      // Get all rentals
      const response = await axios.get(`${baseURL}/rental/owner`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Rental Details Response:", response);
      // Find the specific rental that matches the ID from the notification
      const rental = response.data.find((rental) => rental._id === rentalId);

      console.log("Found rental details:", rental);
      if (rental) {
        setSelectedRental(rental);
        console.log("Selected Rental id:", rentalId);
        // await markAlertAsRead(rental._id);    // ig it not working properly  - cause _id is rental's id ! i need notification id
      } else {
        console.error("Rental not found in user rentals");
        alert("Unable to find rental details. It may have been removed.");
      }
    } catch (err) {
      console.error("Failed to fetch rental details:", err);
      alert("Unable to load rental details. Please try again.");
    }
  };

  // Fetch products or rentals when activeSection changes
  useEffect(() => {
    if (activeSection === "listings") {
      fetchUserProducts();
    } else if (activeSection === "booked") {
      fetchRentalRequests();
    }
  }, [activeSection]);

  const handleRentProductClick = () => {
    navigate("/rental");
  };

  const handleViewProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${baseURL}/user/logout`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Logout failed");
    }
  };

  // Group rental requests by status
  const groupRentalsByStatus = () => {
    const groups = {
      pending: [],
      approved: [],
      cancelled: [],
      completed: [],
    };

    rentalProducts.forEach((rental) => {
      if (groups[rental.status]) {
        groups[rental.status].push(rental);
      }
    });

    return groups;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderRentalProductCard = (rental) => {
    const product = rental.product;
    if (!product) return null;

    return (
      <div
        key={rental._id}
        className="bg-white/60 rounded-xl p-4 shadow-sm backdrop-blur-sm border border-white/20 transition-all hover:shadow-md cursor-pointer"
        onClick={() => handleViewProductDetails(product._id)}
      >
        <div className="flex items-start">
          {product.productImage ? (
            <img
              src={product.productImage}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg mr-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/api/placeholder/96/96";
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-[#096192] text-lg">
                {product.name}
              </h3>
              <div className="flex items-center">
                {renderStatusIcon(rental.status)}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {product.description?.substring(0, 60)}
              {product.description?.length > 60 ? "..." : ""}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <span>From: {formatDate(rental.startDate)}</span>
              <span className="mx-2">•</span>
              <span>To: {formatDate(rental.endDate)}</span>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[#0e8c7f] font-medium">
                ₹{rental.totalPrice?.toFixed(2)}
              </span>
              <div className="flex items-center">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    rental.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : rental.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : rental.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {rental.status.charAt(0).toUpperCase() +
                    rental.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMyListings = () => {
    if (productsLoading) {
      return (
        <div className="flex justify-center mt-8">
          <div className="text-[#096192] flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
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
          <h3 className="mt-4 text-lg font-medium text-gray-700">
            No listings yet
          </h3>
          <p className="mt-2 text-gray-500">
            You haven't listed any products for rent.
          </p>
          <button
            onClick={handleRentProductClick}
            className="mt-4 px-4 py-2 bg-[#1399c6] text-white rounded-lg hover:bg-[#074e75] transition-colors"
          >
            List a Product
          </button>
        </div>
      );
    }

    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {userProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white/60 rounded-xl p-4 shadow-sm backdrop-blur-sm border border-white/20 transition-all hover:shadow-md cursor-pointer"
            onClick={() => handleViewProductDetails(product._id)}
          >
            <div className="flex items-start">
              {product.productImage ? (
                <img
                  src={product.productImage}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/96/96";
                    e.target.alt = "Image not available";
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 cursor-pointer">
                <h3 className="font-medium text-[#096192] text-lg">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {product.description?.substring(0, 60)}
                  {product.description?.length > 60 ? "..." : ""}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-[#0e8c7f] font-medium">
                    ₹{product.price}/day
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product._id);
                    }}
                    className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRentalsByStatus = () => {
    if (rentalsLoading) {
      return (
        <div className="flex justify-center mt-8">
          <div className="text-[#096192] flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading your rental requests...
          </div>
        </div>
      );
    }

    if (rentalProducts.length === 0) {
      return (
        <div className="mt-8 text-center p-6 bg-white/60 rounded-xl shadow-sm backdrop-blur-sm">
          <Package className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">
            No rentals yet
          </h3>
          <p className="mt-2 text-gray-500">
            You haven't rented any products yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-[#1399c6] text-white rounded-lg hover:bg-[#074e75] transition-colors"
          >
            Browse Products
          </button>
        </div>
      );
    }

    const groupedRentals = groupRentalsByStatus();
    const statuses = [
      {
        key: "pending",
        label: "Pending Requests",
        icon: Clock,
        color: "yellow",
      },
      {
        key: "approved",
        label: "Approved Rentals",
        icon: CheckCircle,
        color: "green",
      },
      {
        key: "completed",
        label: "Completed Rentals",
        icon: CheckCircle,
        color: "blue",
      },
      {
        key: "cancelled",
        label: "Cancelled Rentals",
        icon: XCircle,
        color: "red",
      },
    ];

    return (
      <div className="space-y-8 mt-6">
        {statuses.map((status) => {
          if (groupedRentals[status.key].length === 0) return null;

          const StatusIcon = status.icon;

          return (
            <div key={status.key} className="space-y-4">
              <div className="flex items-center">
                <StatusIcon
                  className={`w-5 h-5 mr-2 text-${status.color}-500`}
                />
                <h3 className="text-lg font-medium text-[#096192]">
                  {status.label}
                </h3>
                <span className="ml-2 text-sm bg-[#096192]/10 text-[#096192] px-2 py-0.5 rounded-full">
                  {groupedRentals[status.key].length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedRentals[status.key].map((rental) =>
                  renderRentalProductCard(rental)
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // added..................................
  // Move all useState hooks outside of any functions or conditions
  // const [newName, setNewName] = useState(profile?.name || '');
  // const [newEmail, setNewEmail] = useState(profile?.email || '');
  // const [newAvatarFile, setNewAvatarFile] = useState(null);
  // const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || '');
  // const [oldPassword, setOldPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();

      formData.append("fullName", newName);
      formData.append("email", newEmail);
      formData.append("phone", newPhone);

      if (oldPassword) {
        formData.append("currentPassword", oldPassword);
      }

      if (newPassword) {
        formData.append("password", newPassword);
      }

      if (newAvatarFile) {
        formData.append("profileImage", newAvatarFile);
      }

      const response = await axios.post(`${baseURL}/user/update`, formData, {
        withCredentials: true,
      });

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert(
        "Failed to update profile: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  // This function now just returns JSX without defining any hooks
  // const renderEditProfileForm = () => {
  //   return (
  //     <div className="space-y-6">
  //       <h2 className="text-3xl font-bold text-[#1399c6]">Edit Profile</h2>
  //       <p className="text-gray-600">
  //         Update your personal and security details.
  //       </p>
  //       <div className="space-y-4">
          
  //         {/* Name & Email */}
  //         <div>
  //           <label className="text-sm text-gray-600">Full Name</label>
  //           <input
  //             type="text"
  //             value={newName}
  //             onChange={(e) => setNewName(e.target.value)}
  //             className="w-full p-2 border rounded"
  //           />
  //         </div>
  //         <div>
  //           <label className="text-sm text-gray-600">Email</label>
  //           <input
  //             type="email"
  //             value={newEmail}
  //             onChange={(e) => setNewEmail(e.target.value)}
  //             className="w-full p-2 border rounded"
  //           />
  //         </div>

  //         {/* Change Password */}
  //         <div>
  //           <h4 className="text-lg font-semibold mt-6 text-[#1399c6]">
  //             Change Password
  //           </h4>
  //           <label className="text-sm text-gray-600">Old Password</label>
  //           <input
  //             type="password"
  //             value={oldPassword}
  //             onChange={(e) => setOldPassword(e.target.value)}
  //             className="w-full p-2 border rounded mb-2"
  //           />
  //           <label className="text-sm text-gray-600">New Password</label>
  //           <input
  //             type="password"
  //             value={newPassword}
  //             onChange={(e) => setNewPassword(e.target.value)}
  //             className="w-full p-2 border rounded"
  //           />
  //         </div>

  //         {/* Save Button */}
  //         <button
  //           onClick={handleSaveChanges}
  //           className="mt-4 px-4 py-2 bg-[#1399c6] text-white rounded-lg hover:bg-[#074e75]"
  //         >
  //           Save Changes
  //         </button>
  //       </div>
  //     </div>
  //   );
  // };

  // ////////////////////////////////////
const renderEditProfileForm = () => {
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#1399c6]">Edit Profile</h2>
      <p className="text-gray-600">
        Update your personal and security details.
      </p>

      {/* Profile Picture Upload - Centered at top */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-[#1399c6]/20 overflow-hidden bg-gray-100">
            <img
              src={profile.profileImage || profile.avatar}
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute bottom-2 right-2 bg-[#1399c6] text-white p-2 rounded-full cursor-pointer hover:bg-[#074e75] transition-colors">
            <Edit className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent"
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-[#1399c6] mb-4">
              Change Password
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1399c6] focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
            </div>
          </div>

          {/* Save Button - Right aligned */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveChanges}
              className="px-6 py-3 bg-[#1399c6] text-white rounded-lg hover:bg-[#074e75] transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




  const renderContent = () => {
    switch (activeSection) {
      case "booked":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-[#1399c6]">My Rentals</h2>
              <p className="text-gray-600">Products you've booked for rent.</p>
            </div>
            {renderRentalsByStatus()}
          </div>
        );
      case "listings":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#1399c6]">
                  My Listings
                </h2>
                <p className="text-gray-600">
                  Products you've listed for rent.
                </p>
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
      case "alerts":
        console.log("Alerts:", alerts.length);
        return (
          <div>
            <h2 className="text-3xl font-bold text-[#1399c6]">Alerts</h2>
            <p className="text-gray-600">
              Review and respond to rental requests for your listings.
            </p>

            {alertsLoading ? (
              <div className="flex justify-center mt-8">
                <div className="text-[#096192] flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading your alerts...
                </div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="mt-8 text-center p-6 bg-white/60 rounded-xl shadow-sm backdrop-blur-sm">
                <Bell className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">
                  No alerts
                </h3>
                <p className="mt-2 text-gray-500">
                  You don't have any rental requests at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 mt-6">
                {selectedRental
                  ? (console.log("Selected Rental:", selectedRental),
                    (
                      <div className="bg-white/60 rounded-xl p-6 shadow-sm backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-[#096192]">
                            Rental Request Details
                          </h3>
                          <button
                            onClick={() => setSelectedRental(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            &times; Close
                          </button>
                        </div>

                        <div className="flex items-start mb-6">
                          {selectedRental.product?.productImage ? (
                            <img
                              src={`${selectedRental.product.productImage}`}
                              alt={selectedRental.product.name}
                              className="w-32 h-32 object-cover rounded-lg mr-6"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/128/128";
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded-lg mr-6 flex items-center justify-center">
                              <Image className="w-12 h-12 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-[#096192]">
                              {selectedRental.product?.name}
                            </h4>
                            <p className="text-gray-500 mt-1">
                              {selectedRental.product?.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-gray-500">Price</p>
                                <p className="font-medium text-[#0e8c7f]">
                                  ₹{selectedRental.product?.price}/day
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Total Price
                                </p>
                                <p className="font-medium text-[#0e8c7f]">
                                  ₹{selectedRental.totalPrice?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">From</p>
                                <p className="font-medium">
                                  {formatDate(selectedRental.startDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">To</p>
                                <p className="font-medium">
                                  {formatDate(selectedRental.endDate)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 flex gap-4">
                              <button
                                onClick={async () =>{
                                    // console.log(selectedRental._id + " -- " + selectedRental.alertId);
                                    // handleApproveRental(selectedRental._id);
                                    const success = await handleApproveRental(selectedRental._id);
                                    if (success && currentAlertId) {
                                      await markAlertAsRead(currentAlertId);
                                    }
                                  }
                                }
                                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1 flex items-center justify-center"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </button>
                              <button
                                onClick={async () =>{
                                    console.log(selectedRental._id + " -- " + currentAlertId);
                                    // handleRejectRental(selectedRental._id);
                                    const success = await handleRejectRental(selectedRental._id);
                                    if (success && currentAlertId) {
                                      await markAlertAsRead(currentAlertId);
                                    }
                                  }
                                }
                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-1 flex items-center justify-center"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : alerts.map((alert) => {
                      console.log("Alert: k", alert._id);
                      return (
                        <div
                          key={alert._id}
                          className="bg-white/60 rounded-xl p-4 shadow-sm backdrop-blur-sm border border-white/20 transition-all hover:shadow-md cursor-pointer"
                          onClick={async () => {
                            await fetchRentalDetails(alert.rentalId);
                            setCurrentAlertId(alert._id); 
                            // await markAlertAsRead(alert._id);
                            // console.log("wtf " + alert._id)
                          }}
                        >
                          <div className="flex items-center">
                            <div className="bg-[#096192]/10 p-3 rounded-full mr-4">
                              <Bell className="w-5 h-5 text-[#096192]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-[#096192]">
                                {alert.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {alert.message}
                              </p>
                            </div>
                            <div className="ml-4">
                              <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                New
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            )}
          </div>
        );
      case "edit-profile":
        return renderEditProfileForm();

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#1399c6]">
              Profile Information
            </h2>
            <p className="text-gray-600">
              View your profile information and security settings.
            </p>

            <div className="bg-white/60 rounded-xl p-6 shadow-sm backdrop-blur-sm mt-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Full Name
                  </h3>
                  <p className="mt-1 text-lg font-medium text-[#1399c6]">
                    {profile.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Email Address
                  </h3>
                  <p className="mt-1 text-lg font-medium text-[#1399c6]">
                    {profile.email}
                  </p>
                </div>
                {profile.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Phone Number
                    </h3>
                    <p className="mt-1 text-lg font-medium text-[#1399c6]">
                      {profile.phone}
                    </p>
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
        <div className="text-[#1399c6] text-xl">Loading profile...</div>
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
    <div className="h-screen overflow-hidden bg-white geometric-background flex justify-center items-start pt-12 relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#8968CD]/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#24aae2]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0e8c7f]/10 rounded-full blur-3xl" />

      <div className="w-full h-[90vh] max-w-7xl px-6 py-10 z-10">
        <div className="bg-white/40 rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.1),0_-4px_20px_0_rgba(0,0,0,0.05)]
 overflow-hidden relative backdrop-blur-sm border border-white/20">
          <div className="flex flex-col md:flex-row">
            {/* Left Section */}
            <div className="w-full md:w-1/3 bg-gradient-to-br p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                     {/*console.log("📷 Left Sidebar Image:", profile.profileImage)*/} 

                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-full mx-auto border-4 border-white/80 transition-transform hover:scale-105 shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#096192]/10 to-transparent"></div>
                  </div>
                  {/* <div className="mt-4 space-y-2">
                    <h3 className="text-xl font-semibold text-[#1399c6]">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-[#1399c6]">{profile.email}</p>
                  </div> */}

                  {/* ////// */}
                  <div className="mt-4 space-y-2">
  <h3 className="text-xl font-semibold text-[#1399c6]">
    {profile.name}
  </h3>
  <p className="text-sm text-[#1399c6]">{profile.email}</p>
  <button
    onClick={() => setActiveSection("edit-profile")}
    className={`w-full px-3 py-1.5 mt-2 rounded-lg flex items-center justify-center transition-all border border-[#1399c6]/10 backdrop-blur-sm text-[#1399c6] text-sm ${
      activeSection === "edit-profile"
        ? "bg-[#096192]/10"
        : "hover:bg-[#096192]/5"
    }`}
  >
    <Edit className="w-3 h-3 mr-2" />
    Edit Profile
  </button>
</div>
                </div>

                {/*<button
                  className="w-full px-4 py-2 bg-[#0e8c7f]/10 rounded-lg hover:bg-[#0e8c7f]/20 transition-colors backdrop-blur-sm border border-[#0e8c7f]/20 flex items-center justify-center text-[#0e8c7f]"
                  onClick={handleRentProductClick}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Rent a Product
                </button>*/}

                <nav className="space-y-2">
                  {[
                    {
                      icon: ClipboardList,
                      label: "Booked Products",
                      id: "booked",
                    },
                    { icon: Package, label: "My Listings", id: "listings" },
                    { icon: Bell, label: "Alerts", id: "alerts" },
                    // { icon: Edit, label: "Edit Profile", id: "edit-profile" },
                    { icon: LogOut, label: "Logout", id: "logout" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        item.id === "logout"
                          ? handleLogout()
                          : setActiveSection(item.id)
                      }
                      className={`w-full px-4 py-2 rounded-lg flex items-center transition-all border border-[#1399c6]/10 backdrop-blur-sm text-[#1399c6] ${
                        activeSection === item.id
                          ? "bg-[#096192]/10"
                          : "hover:bg-[#096192]/5"
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
