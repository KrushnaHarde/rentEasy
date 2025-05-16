// routes/rentalRoutes.j
const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { requireAuth } = require('../middleware/authentication');

// All rental routes require authentication
router.use(requireAuth('token'));

// Create a rental request
router.post('/', rentalController.createRental);

// Get rentals where user is the renter
// can be used for my bookings or my rentals
router.get('/user', rentalController.getUserRentals);

// Get rentals for products owned by the user
router.get('/owner', rentalController.getOwnerRentals);

// Approve a rental request
router.patch('/:id/approve', rentalController.approveRental);

// Cancel / Reject a rental request
router.patch('/:id/cancel', rentalController.cancelRental);

// Complete a rental (return the item)
router.patch('/:id/complete', rentalController.completeRental);

// Get completed rentals where user is the renter
router.get('/user/completed', rentalController.getUserCompletedRentals);

// Get completed rentals for products owned by the user
router.get('/owner/completed', rentalController.getOwnerCompletedRentals);

// Get all rentals of user(products uploaded by ) and status of all rentals 
router.get('/rentals/my-product-rentals',rentalController.getAllProductRentals);

module.exports = router;