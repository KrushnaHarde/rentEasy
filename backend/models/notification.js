// models/notification.js
const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    recipient: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: { 
        type: String,
        required: true
    },
    message: { 
        type: String, 
        required: true 
    },
    rentalId: { 
        type: Schema.Types.ObjectId,
        ref: 'Rental'
    },
    productId: { 
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    type: { 
        type: String, 
        enum: ['rental_request', 'rental_approved', 'rental_rejected', 'rental_cancelled', 
               'rental_starting_soon', 'rental_ending_soon', 'rental_completed'],
        required: true
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);
module.exports = Notification;