const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const { sendOTPEmail } = require("../services/emailService");
const { OAuth2Client } = require('google-auth-library');
const {createHmac} = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Step 1: Send OTP for email verification
const sendOTP = async (req, res) => {
  const { fullName, email, mobileNumber, password } = req.body;
  
  if (!fullName || !email || !mobileNumber || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if verified user already exists
    const existingUser = await User.findOne({ email, isTemporary: false });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Find or create temporary user
    let tempUser = await User.findOne({ email, isTemporary: true });
    
    if (tempUser) {
      // Update existing temporary user
      tempUser.fullName = fullName;
      tempUser.mobileNumber = mobileNumber;
      tempUser.password = password;
    } else {
      // Create new temporary user
      tempUser = new User({
        fullName,
        email,
        mobileNumber,
        password,
        isTemporary: true,
        isEmailVerified: false
      });
    }

    // Generate and save OTP
    const otp = tempUser.generateOTP();
    await tempUser.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp, fullName);
    
    res.json({
      message: "OTP sent successfully to your email address",
      email: email
    });
    
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

// Step 2: Verify OTP and activate account
const verifyOTPAndSignup = async (req, res) => {
  const { email, otp } = req.body;

  console.log("🔍 Incoming verify request", email, otp);

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const tempUser = await User.findOne({ email, isTemporary: true });

    if (!tempUser) {
      console.log("❌ No temporary user found");
      return res.status(400).json({ error: "No pending verification found for this email" });
    }

    console.log("✅ Temporary user found:", tempUser.email);
    console.log("Stored OTP:", tempUser.otp, " | Expires:", tempUser.otpExpires);
    console.log("User input OTP:", otp);

    const isValidOTP = tempUser.verifyOTP(otp);

    if (!isValidOTP) {
      console.log("❌ OTP invalid or expired");
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    console.log("✅ OTP verified");

    tempUser.isTemporary = false;
    tempUser.isEmailVerified = true;
    tempUser.clearOTP();
    
    console.log("➡️ OTP cleared, saving user");

    await tempUser.save();
    console.log("➡️ User saved, generating token");
    const token = createTokenForUser(tempUser);

    return res.cookie("token", token, { httpOnly: true, secure: true }).json({
      message: "Account created and verified successfully",
      token,
      user: {
        id: tempUser._id,
        fullName: tempUser.fullName,
        email: tempUser.email,
        mobileNumber: tempUser.mobileNumber,
        isEmailVerified: tempUser.isEmailVerified
      }
    });

  } catch (error) {
    console.error("🔥 Verify OTP and signup error:", error);
    return res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};


// Resend OTP
const resendOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find temporary user
    const tempUser = await User.findOne({ 
      email, 
      isTemporary: true 
    });

    if (!tempUser) {
      return res.status(400).json({ error: "No pending verification found for this email" });
    }

    // Generate new OTP
    const otp = tempUser.generateOTP();
    await tempUser.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp, tempUser.fullName);
    
    res.json({
      message: "OTP resent successfully to your email address"
    });
    
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
};

// Google OAuth
const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Google token is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture, phone_number } = payload;

    // Check if user already exists (including temporary users)
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user with Google profile data
      const userData = {
        fullName: name,
        email,
        password: "GOOGLE_AUTH", // dummy password for Google auth users
        profileImage: picture,
        isEmailVerified: true, // Google emails are considered verified
        isTemporary: false,
        isGoogleAuth: true // Flag to identify Google auth users
      };

      // Only add mobileNumber if it exists and is valid, otherwise skip it
      if (phone_number && /^[6-9]\d{9}$/.test(phone_number)) {
        userData.mobileNumber = phone_number;
      }

      user = await User.create(userData);
      isNewUser = true;
    } else {
      // User exists - handle different scenarios
      if (user.isTemporary) {
        // Convert temporary user to Google auth user
        user.isTemporary = false;
        user.isGoogleAuth = true;
        user.isEmailVerified = true;
        user.password = "GOOGLE_AUTH";
        
        if (picture && !user.profileImage) {
          user.profileImage = picture;
        }
        
        if (name && !user.fullName) {
          user.fullName = name;
        }
        
        if (phone_number && /^[6-9]\d{9}$/.test(phone_number) && !user.mobileNumber) {
          user.mobileNumber = phone_number;
        }
        
        await user.save();
        isNewUser = true; // Treat as new user since they're completing registration
      } else {
        // Existing verified user - update profile if needed
        const updateFields = {};
        
        if (!user.profileImage && picture) {
          updateFields.profileImage = picture;
        }
        
        if (!user.mobileNumber && phone_number && /^[6-9]\d{9}$/.test(phone_number)) {
          updateFields.mobileNumber = phone_number;
        }
        
        if (!user.fullName && name) {
          updateFields.fullName = name;
        }

        // Mark as Google auth user if not already
        if (!user.isGoogleAuth) {
          updateFields.isGoogleAuth = true;
        }

        // Update user if there are fields to update
        if (Object.keys(updateFields).length > 0) {
          user = await User.findByIdAndUpdate(user._id, updateFields, { new: true });
        }
      }
    }

    const jwtToken = createTokenForUser(user);
    
    res.cookie("token", jwtToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }).json({
      message: isNewUser ? "Signup Successful" : "Login Successful",
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified
      },
      isNewUser
    });

  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(401).json({ error: "Google Authentication Failed" });
  }
};

// Signin
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const user = await User.findOne({ email, isTemporary: false }).select("-password -salt -otp -otpExpires");
    
    res.cookie("token", token, { httpOnly: true, secure: true }).json({
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    console.error("Signin error:", error);
    
    if (error.message === 'Email not verified') {
      res.status(401).json({ error: "Please verify your email before logging in" });
    } else {
      res.status(401).json({ error: "Incorrect Email or Password" });
    }
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

    const user = await User.findById(req.user.id).select("-password -salt -otp -otpExpires");

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
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const { fullName, email, mobileNumber, password, currentPassword } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle email update
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId }, isTemporary: false });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
      user.isEmailVerified = false; // Require re-verification for new email
    }
    
    // Update fullName if provided
    if (fullName) {
      user.fullName = fullName;
    }
    
    // Update mobile number if provided
    if (mobileNumber) {
      user.mobileNumber = mobileNumber;
    }
    
    // Handle password update
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password required to update password" });
      }
      
      const salt = user.salt;
      const hashedCurrentPassword = createHmac('sha256', salt).update(currentPassword).digest('hex');
      
      if (user.password !== hashedCurrentPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      user.password = password;
    }
    
    if (!email && !fullName && !mobileNumber && !password) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    
    await user.save();
    
    const newToken = createTokenForUser(user);
    
    res.cookie("token", newToken, { httpOnly: true, secure: true }).json({
      message: "User updated successfully",
      token: newToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
    
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Regular signup (Deprecated - redirect to OTP flow)
const signup = async (req, res) => {
  res.status(400).json({ 
    error: "Please use email verification process. Call /send-otp first, then /verify-otp-signup" 
  });
};

module.exports = { 
  sendOTP, 
  verifyOTPAndSignup, 
  resendOTP,
  signup, 
  signin, 
  logout, 
  profile, 
  googleAuth, 
  updateUser 
};