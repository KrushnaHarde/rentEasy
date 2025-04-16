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
    salt: { 
        type: String 
    },
    password: { 
        type: String, 
        required: true,
        minlength:8
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
  },
  { timestamps: true }
);

userSchema.pre('save', function(next) {
    const user = this;
    if(!user.isModified('password'))
        return;
    // /hex.....................................................
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

userSchema.static('matchPasswordAndGenerateToken', async function(email, password){
    const user = await this.findOne({email});
    if(!user)   throw new Error('User not found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHashedPassword = createHmac('sha256', salt).update(password).digest('hex');
    
    if(hashedPassword !== userProvidedHashedPassword)
        throw new Error('Invalid password');

    const token = createTokenForUser(user);
    return token;
    // return user;
});

const User = model("User", userSchema);
module.exports = User;
 