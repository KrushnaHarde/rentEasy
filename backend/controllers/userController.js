const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth
const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        password: "GOOGLE_AUTH", // dummy password
        profileImage: picture,
      });
      isNewUser = true;
    }

    const jwtToken = createTokenForUser(user);
    res.cookie("token", jwtToken, { httpOnly: true, secure: true }).json({
      message: isNewUser ? "Signup Successful" : "Login Successful",
      token: jwtToken,
      user,
    });

  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(401).json({ error: "Google Authentication Failed" });
  }
};

// Signup
const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const newUser = await User.create({ fullName, email, password });
    // console.log("New user created:", newUser);
    
    const token = createTokenForUser(newUser);
    res.cookie("token", token, { httpOnly: true, secure: true }).json({ 
      message: "User created and logged in successfully",
      token,
      user: { 
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email
      }
    });
    // res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ error: "Failed to create user" });
  }
};

// Signin
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie("token", token, { httpOnly: true, secure: true }).json({ 
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(401).json({ error: "Incorrect Email or Password" });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ message: "Logged out successfully" });
};

// Protected Profile
const profile = async (req, res) => {
  try {
    console.log("Extracted User ID from Token:", req.user?.id);

    if (!req.user?.id) {
      return res.status(400).json({ error: "Invalid token data. No user ID found." });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { signup, signin, logout, profile, googleAuth };
