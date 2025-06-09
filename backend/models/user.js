const {createHmac, randomBytes} = require('crypto');
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema(
  {
    fullName:{ 
      type: String, 
      required: true 
    },
    email: { 
        type: String,
        required: true, 
        unique: true 
    },
    mobileNumber: {
        type: String,
        required: function() {
            // Only require mobile number for non-Google auth users
            return !this.isGoogleAuth;
        },
        validate: {
            validator: function(v) {
                // Skip validation if it's a Google auth user and no mobile number provided
                if (this.isGoogleAuth && !v) {
                    return true;
                }
                // Validate Indian mobile number format if provided
                return v ? /^[6-9]\d{9}$/.test(v) : true;
            },
            message: 'Invalid mobile number format'
        }
    },
    isGoogleAuth: {
        type: Boolean,
        default: false
    },
    salt: { 
        type: String 
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    profileImage: { 
        type: String, 
        default: '/images/avatar.png'
    },
    role: { 
        type: String, 
        enum: ['USER', 'ADMIN'],
        default: 'USER' 
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    // OTP fields - temporary storage (just temp storage we will clean later)
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    // Temporary user data before verification
    isTemporary: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

userSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword;

    next();
});


userSchema.static('matchPasswordAndGenerateToken', async function(email, password){
    const user = await this.findOne({email, isTemporary: false});
    if(!user) throw new Error('User not found');
    
    if(!user.isEmailVerified) throw new Error('Email not verified');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHashedPassword = createHmac('sha256', salt).update(password).digest('hex');
    
    if(hashedPassword !== userProvidedHashedPassword)
        throw new Error('Invalid password');

    const token = createTokenForUser(user);
    return token;
});

// Method to generate and save OTP
userSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(inputOTP) {
    if (!this.otp || !this.otpExpires) {
        return false;
    }
    
    if (new Date() > this.otpExpires) {
        return false; // OTP expired
    }
    
    return this.otp === inputOTP;
};

// Method to clear OTP data
userSchema.methods.clearOTP = function() {
    this.otp = null;
    this.otpExpires = null;
};

const User = model("User", userSchema);
module.exports = User;