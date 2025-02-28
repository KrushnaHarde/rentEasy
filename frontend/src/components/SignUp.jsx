import React, { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Signup successful!");
      } else {
        alert(data.message || "Signup failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
      <div className="p-8 bg-[#1A1A1A] rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 mb-4 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BEB5AB]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 mb-4 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BEB5AB]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 mb-6 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BEB5AB]"
          />
          <button
            type="submit"
            className="w-full bg-[#BEB5AB] text-black p-3 rounded-md font-bold hover:bg-[#a89e94]"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-[#BEB5AB] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
