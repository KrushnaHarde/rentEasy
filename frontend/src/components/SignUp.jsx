


// // import React, { useState } from "react";
// // import axios from "axios";

// // const SignUp = () => {
// //   const [formData, setFormData] = useState({
// //     fullName: "",
// //     email: "",
// //     password: ""
// //   });

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const response = await axios.post("http://localhost:8000/user/signup", formData);
// //       alert(response.data.message);
// //     } catch (error) {
// //       alert(error.response?.data?.message || "Signup failed");
// //     }
// //   };

// //   return (
// //     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 via-white to-gray-100">
// //       <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
// //         <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>
        
// //         <form className="space-y-4" onSubmit={handleSubmit}>
// //           <input
// //             type="text"
// //             name="fullName"
// //             placeholder="Full Name"
// //             value={formData.fullName}
// //             onChange={handleChange}
// //             className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
// //           />
// //           <input
// //             type="email"
// //             name="email"
// //             placeholder="Email ID"
// //             value={formData.email}
// //             onChange={handleChange}
// //             className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
// //           />
// //           <input
// //             type="password"
// //             name="password"
// //             placeholder="Password"
// //             value={formData.password}
// //             onChange={handleChange}
// //             className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
// //           />
          
// //           <button
// //             type="submit"
// //             className="w-full p-3 text-white font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all"
// //           >
// //             Create Account
// //           </button>
// //         </form>
        
// //         <p className="mt-4 text-gray-600">
// //           Already have an account? 
// //           <a href="/login" className="text-indigo-500 font-medium hover:underline"> Log in</a>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SignUp;


// import React, { useState } from "react";
// import axios from "axios";

// const SignUp = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:5000/user/signup", formData,{
        

//       });
//       alert(response.data.message);
//     } catch (error) {
//       alert(error.response?.data?.message || "Signup failed");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 via-white to-gray-100">
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>
        
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <input
//             type="text"
//             name="fullName"
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
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
//             Create Account
//           </button>
//         </form>
        
//         <p className="mt-4 text-gray-600">
//           Already have an account? 
//           <a href="/login" className="text-indigo-500 font-medium hover:underline"> Log in</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignUp;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleBtnRef = useRef(null); // Reference for the Google button

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
      const res = await axios.post("http://localhost:5000/user/signup", formData);
      alert(res.data.message);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("loginStateChanged"));
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      const result = await axios.post("http://localhost:5000/user/google-auth", {
        token: response.credential,
      });
      alert(result.data.message);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      window.dispatchEvent(new Event("loginStateChanged"));
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Google authentication failed");
    }
  };

  const handleGoogleAuth = () => {
    const google = window.google;
    if (!google) {
      console.error("Google Identity Services not loaded");
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
    });

    google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      logo_alignment: "left",
    });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = handleGoogleAuth; // Ensure Google authentication setup after loading
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

        <div className="my-4 flex items-center justify-center">
          <div className="w-full h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Google Sign-In Button rendered here */}
        <div ref={googleBtnRef} className="w-full mb-4" />

        <p className="mt-4 text-gray-600">
          Already have an account?
          <a href="/login" className="text-[#1399c6] font-medium hover:underline"> Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
