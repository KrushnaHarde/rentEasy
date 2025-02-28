// models/rental.js
const { Schema, model } = require("mongoose");

const rentalSchema = new Schema(
  {
    product: { 
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    renter: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'cancelled', 'completed'],
        default: 'pending'
    },
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    } /*,
    reviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Review'
    } */
  },
  { timestamps: true }
);

const Rental = model("Rental", rentalSchema);
module.exports = Rental;