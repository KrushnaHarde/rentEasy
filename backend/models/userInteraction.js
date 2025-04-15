const { Schema, model } = require("mongoose");

const userInteractionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    productId: {
      type: Schema.Types.ObjectId, 
      ref: 'Product',
      required: true,
      index: true
    },
    interactionType: {
      type: String,
      enum: ['VIEW', 'RENT', 'WISHLIST', 'SEARCH'],
      required: true
    },
    // For search interactions, we store the search query
    searchQuery: {
      type: String,
      required: function() {
        return this.interactionType === 'SEARCH';
      }
    },
    // For rental interactions, we store the rental duration
    rentalDuration: {
      type: Number,
      required: function() {
        return this.interactionType === 'RENT';
      }
    },
    interactionTime: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create a compound index for faster queries both User and Product
userInteractionSchema.index({ userId: 1, interactionType: 1 });
userInteractionSchema.index({ productId: 1, interactionType: 1 });

const UserInteraction = model("UserInteraction", userInteractionSchema);
module.exports = UserInteraction;