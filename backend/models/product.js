// const {createHmac, randomBytes} = require('crypto');
const { Schema, model } = require("mongoose");
// const { createTokenForUser,validateToken } = require('../services/authentication');

const productSchema = new Schema(
  {
    uploadedBy:{ 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: { 
        type: String,
        required: true
    },
    category: { 
        type: String, 
        default: "general"
    },
    description: { 
        type: String, 
        required: true 
    },
    productImage: { 
        type: String,
        required: true
    },
    additionalImages: {
        type: [String],
        default: []
    },
    productCondition: { 
        type: String, 
        required: true
    },
    review:{
        type: String
    },
    rating:{
        type: Number, 
        min:0,
        max:5,
        default: 1 
    },
    price: { 
        type: Number, 
        required: true 
    },
    duration: {
        days: {
            // this is the number of hours 
            type: Number,
            default: 0,
            min: 0
        },
    }   
    
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
module.exports = Product;
 