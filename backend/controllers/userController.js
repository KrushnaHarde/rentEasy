const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const { OAuth2Client } = require('google-auth-library');
const {createHmac} = require('crypto');

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

// Update User Details
const updateUser = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const { fullName, email, password, currentPassword } = req.body;
    
    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle email update if provided and different from current
    if (email && email !== user.email) {
      // Check if email already exists for another user
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }
    
    // Update fullName if provided
    if (fullName) {
      user.fullName = fullName;
    }
    
    // Handle password update if provided
    if (password) {
      // For security, require current password verification before changing password
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password required to update password" });
      }
      
      // Verify current password
      const salt = user.salt;
      const hashedCurrentPassword = createHmac('sha256', salt).update(currentPassword).digest('hex');
      
      if (user.password !== hashedCurrentPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      // Set the new password - the pre-save hook will handle hashing
      user.password = password;
    }
    
    // If nothing was updated
    if (!email && !fullName && !password) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    
    // Save the user - this will trigger the pre-save hook for password hashing
    await user.save();
    
    // Generate a new token with updated user data
    const newToken = createTokenForUser(user);
    
    // Return success response with updated user and new token
    res.cookie("token", newToken, { httpOnly: true, secure: true }).json({
      message: "User updated successfully",
      token: newToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

module.exports = { signup, signin, logout, profile, googleAuth, updateUser };