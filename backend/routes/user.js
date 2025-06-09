const multer = require('multer');
const upload = multer(); 

const { Router } = require("express");
const { 
  sendOTP, 
  verifyOTPAndSignup, 
  resendOTP,
  signin, 
  logout, 
  profile, 
  googleAuth, 
  updateUser 
} = require('../controllers/userController');
const { requireAuth } = require("../middleware/authentication");

const router = Router();

router.post("/google-auth", googleAuth);

// Public Routes
// Authentication routes (Public)
router.post('/send-otp', sendOTP);                    // Step 1: Send OTP to email
router.post('/verify-otp-signup', verifyOTPAndSignup); // Step 2: Verify OTP and create account
router.post('/resend-otp', resendOTP);                // Resend OTP if needed

router.post("/signin", signin);
router.get("/logout", logout);

// Protected Routes
router.get("/profile", requireAuth("token"), profile);
router.post("/update",requireAuth("token"), upload.none(), updateUser);
module.exports = router;
