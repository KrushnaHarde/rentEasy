import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleBtnRef = useRef(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add withCredentials to ensure cookies are sent/received
      const res = await axios.post("http://localhost:5000/user/signup", formData, {
        withCredentials: true
      });
      
      console.log("Regular signup response:", res.data);
      alert(res.data.message);
      
      // Store user info
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Make sure to store the token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        console.log("Token stored successfully:", res.data.token);
      } else {
        console.warn("No token received from signup API");
      }
      
      window.dispatchEvent(new Event("loginStateChanged"));
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      console.log("Google response received:", response);
      
      const result = await axios.post("http://localhost:5000/user/google-auth", {
        token: response.credential,
      }, { withCredentials: true }); // Enable credentials to allow cookies
      
      console.log("Server response:", result.data);
      alert(result.data.message);
      
      // Store user and token securely in localStorage
      localStorage.setItem("user", JSON.stringify(result.data.user));
      
      // Make sure to store the token
      if (result.data.token) {
        localStorage.setItem("token", result.data.token);
        console.log("Token stored successfully:", result.data.token);
      } else {
        console.warn("No token received from Google auth API");
      }
      
      // Fire login state change event
      window.dispatchEvent(new Event("loginStateChanged"));
      
      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert(error.response?.data?.message || "Google authentication failed");
    }
  };

  const initializeGoogleLogin = () => {
    if (!window.google || !googleBtnRef.current) {
      console.error("Google Identity Services not loaded or button ref not available");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signup_with",
        shape: "pill",
        logo_alignment: "center",
        width: 280
      });
      
      // Also display the One Tap prompt
      window.google.accounts.id.prompt();
      
      console.log("Google button initialized");
    } catch (error) {
      console.error("Failed to initialize Google button:", error);
    }
  };

  useEffect(() => {
    // Check if client ID is available
    if (!clientId) {
      console.error("Google Client ID is missing. Please check your environment variables.");
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Identity Services script loaded");
      setGoogleScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Google Identity Services script");
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId]);

  // Initialize Google Sign-In after the script is loaded
  useEffect(() => {
    if (googleScriptLoaded) {
      initializeGoogleLogin();
    }
  }, [googleScriptLoaded]);

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-white overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-50px] left-[-50px] w-60 h-60 bg-[#1399c6] opacity-20 rounded-full z-0"></div>
      <div className="absolute bottom-[-60px] right-[-40px] w-72 h-72 bg-[#2AB3E6] opacity-20 rounded-full z-0"></div>
      <div className="absolute top-[200px] left-[-80px] w-40 h-40 bg-[#016D6D] opacity-20 rounded-full z-0"></div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center z-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />

          <button
            type="submit"
            className="w-full p-3 text-white font-semibold rounded-lg bg-gradient-to-r from-[#1399c6] to-[#2AB3E6] hover:from-[#0e7fa3] hover:to-[#1a9acc] transition-all"
          >
            Create Account
          </button>
        </form>

        <div className="my-6 flex justify-center items-center">
          <div className="border-t border-gray-300 flex-grow"></div>
          <div className="mx-4 text-gray-500">or</div>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        <div className="flex justify-center my-4">
          <div 
            id="googleSignInButton" 
            ref={googleBtnRef} 
            className="w-full flex justify-center"
          ></div>
        </div>

        {!googleScriptLoaded && (
          <p className="text-sm text-gray-500">Loading Google Sign-Up...</p>
        )}

        <p className="mt-4 text-gray-600">
          Already have an account?
          <a href="/login" className="text-[#1399c6] font-medium hover:underline"> Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;