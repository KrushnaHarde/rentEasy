


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
//       const response = await axios.post("http://localhost:8000/user/signup", formData);
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


import React, { useState } from "react";
import axios from "axios";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/user/signup", formData,{
        

      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 via-white to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          
          <button
            type="submit"
            className="w-full p-3 text-white font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Create Account
          </button>
        </form>
        
        <p className="mt-4 text-gray-600">
          Already have an account? 
          <a href="/login" className="text-indigo-500 font-medium hover:underline"> Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;