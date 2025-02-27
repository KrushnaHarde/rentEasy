import React from "react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
      <div className="p-8 bg-[#1A1A1A] rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        <form>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BEB5AB]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BEB5AB]"
          />
          <button
            type="submit"
            className="w-full bg-[#BEB5AB] text-black p-3 rounded-md font-bold hover:bg-[#a89e94]"
          >
            Login
          </button>
        </form>

        {/* Don't have an account? Redirect to Signup */}
        <p className="text-center mt-4 text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#BEB5AB] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
