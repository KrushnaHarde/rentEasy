const User = require("../models/user");
const { generateToken } = require("../services/authentication");

// Signup Controller
// just added return statement.....................................
const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const newUser=await User.create({ fullName, email, password });
    console.log("New user created ", newUser)
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error : ", error);
    return res.status(400).json({ error: "Failed to create user" });
  }
};

// Signin Controller
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie("token", token, { httpOnly: true, secure: true }).json({ 
      message: "Login successful",
      token: token // Add token in response
  });
  
  } catch (error) {
    res.status(401).json({ error: "Incorrect Email or Password" });
  }
};

// Logout Controller
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// Profile Controller (Protected)
// const profile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// };
const profile = async (req, res) => {
    try {
      console.log("Extracted User ID from Token:", req.user?.id); // Debugging
  
      if (!req.user?.id) {
        return res.status(400).json({ error: "Invalid token data. No user ID found." });
      }
  
      const user = await User.findById(req.user.id).select("-password");
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(user);
    } catch (error) {
      console.error("Error in /profile:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
  
module.exports = { signup, signin, logout, profile };
