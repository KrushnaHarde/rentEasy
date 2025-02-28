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
router.get('/user', rentalController.getUserRentals);

// Get rentals for products owned by the user
router.get('/owner', rentalController.getOwnerRentals);

// Approve a rental request
router.patch('/:id/approve', rentalController.approveRental);

// Cancel a rental request
router.patch('/:id/cancel', rentalController.cancelRental);

// Complete a rental (return the item)
router.patch('/:id/complete', rentalController.completeRental);

module.exports = router;