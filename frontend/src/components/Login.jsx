// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:5000/user/signin", formData,
//         {
//           withCredentials:true,
//           headers:{
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       alert(response.data.message);
      
//       // Store user info in localStorage
//       localStorage.setItem("user", JSON.stringify(response.data.user));
      
//       // Dispatch a custom event to notify other components (like Navbar) about login
//       window.dispatchEvent(new Event('loginStateChanged'));
      
//       // Redirect to home page on successful login
//       navigate("/");
//     } catch (error) {
//       alert(error.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 via-white to-gray-100">
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>
        
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email ID"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
          
//           <button
//             type="submit"
//             className="w-full p-3 text-white font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all"
//           >
//             Login
//           </button>
//         </form>
        
//         <p className="mt-4 text-gray-600">
//           Don't have an account? 
//           <a href="/signup" className="text-indigo-500 font-medium hover:underline"> Sign up</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google && clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        {
          theme: "outline",
          size: "large",
          width: "300"
        }
      );
    }
  }, [clientId]);

  const handleGoogleCallback = async (response) => {
    try {
      const result = await axios.post("http://localhost:5000/user/google-auth", {
        token: response.credential
      });

      alert(result.data.message);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      window.dispatchEvent(new Event("loginStateChanged"));
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Google authentication failed");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/user/signin",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      alert(response.data.message);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("loginStateChanged"));
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-white overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-60px] left-[-60px] w-60 h-60 bg-[#1399c6] opacity-20 rounded-full z-0"></div>
      <div className="absolute bottom-[-60px] right-[-50px] w-72 h-72 bg-[#2AB3E6] opacity-20 rounded-full z-0"></div>
      <div className="absolute top-[220px] left-[-70px] w-40 h-40 bg-[#016D6D] opacity-20 rounded-full z-0"></div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center z-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />

          <button
            type="submit"
            className="w-full p-3 text-white font-semibold rounded-lg bg-gradient-to-r from-[#1399c6] to-[#2AB3E6] hover:from-[#0e7fa3] hover:to-[#1a9acc] transition-all"
          >
            Login
          </button>
        </form>

        <div className="my-4 flex items-center justify-center">
          <div className="w-full h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Google Sign In Button Container */}
        <div id="googleSignInDiv" className="flex justify-center"></div>

        <p className="mt-4 text-gray-600">
          Don&apos;t have an account?
          <a href="/signup" className="text-[#1399c6] font-medium hover:underline"> Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const navigate = useNavigate();
//   const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//   const googleBtnRef = useRef(null);

//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:5000/user/signin", formData);
//       alert(res.data.message);
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//       window.dispatchEvent(new Event("loginStateChanged"));
//       navigate("/");
//     } catch (err) {
//       alert(err.response?.data?.message || "Login failed");
//     }
//   };

//   const handleGoogleCallback = async (response) => {
//     try {
//       const result = await axios.post("http://localhost:5000/user/google-auth", {
//         token: response.credential,
//       }, { withCredentials: true });
  
//       alert(result.data.message);
      
//       // Store user and token securely in localStorage
//       localStorage.setItem("user", JSON.stringify(result.data.user));
//       localStorage.setItem("token", result.data.token);  // Don't forget to store token as well
  
//       // Fire login state change event
//       window.dispatchEvent(new Event("loginStateChanged"));
  
//       // Navigate to profile page
//       navigate("/");
//     } catch (error) {
//       console.error("Google Auth Error", error);
//       alert(error.response?.data?.message || "Google authentication failed");
//     }
//   };

//   const initializeGoogleLogin = () => {
//     const google = window.google;
//     if (!google) {
//       console.error("Google Identity Services not loaded");
//       return;
//     }

//     google.accounts.id.initialize({
//       client_id: clientId,
//       callback: handleGoogleCallback,
//     });

//     google.accounts.id.renderButton(googleBtnRef.current, {
//       theme: "outline",
//       size: "large",
//       shape: "pill",
//       logo_alignment: "left",
//     });
//   };

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://accounts.google.com/gsi/client";
//     script.async = true;
//     script.defer = true;
//     script.onload = initializeGoogleLogin;
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return (
//     <div className="relative flex justify-center items-center min-h-screen bg-white overflow-hidden">
//       {/* Decorative Circles */}
//       <div className="absolute top-[-50px] left-[-50px] w-60 h-60 bg-[#1399c6] opacity-20 rounded-full z-0"></div>
//       <div className="absolute bottom-[-60px] right-[-40px] w-72 h-72 bg-[#2AB3E6] opacity-20 rounded-full z-0"></div>
//       <div className="absolute top-[200px] left-[-80px] w-40 h-40 bg-[#016D6D] opacity-20 rounded-full z-0"></div>

//       <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center z-10">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email ID"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
//           />

//           <button
//             type="submit"
//             className="w-full p-3 text-white font-semibold rounded-lg bg-gradient-to-r from-[#1399c6] to-[#2AB3E6] hover:from-[#0e7fa3] hover:to-[#1a9acc] transition-all"
//           >
//             Login
//           </button>
//         </form>

//         <div className="my-4" ref={googleBtnRef}></div>

//         <p className="mt-4 text-gray-600">
//           Don’t have an account?{" "}
//           <a href="/signup" className="text-indigo-500 font-medium hover:underline">
//             Sign up
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
