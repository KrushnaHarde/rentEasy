// services/notificationScheduler.js
const cron = require('node-cron');
const Rental = require('../models/rental');
const { createNotification } = require('../controllers/notificationController.js');

// Initialize the scheduler
const initNotificationScheduler = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        await checkUpcomingRentals();
    });
};

// Check for rentals that are about to start or end
const checkUpcomingRentals = async () => {
    try {
        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        // Find rentals starting within the next 24 hours
        const startingRentals = await Rental.find({
            status: 'approved',
            startDate: { $gt: now, $lt: oneDayFromNow }
        }).populate('product', 'name').populate('renter', 'fullName').populate('owner', 'fullName');

        for (const rental of startingRentals) {
            // Notify renter
            await createNotification(
                rental.renter._id,
                'Rental Starting Soon',
                `Your rental of ${rental.product.name} will start in less than 24 hours.`,
                'rental_starting_soon',
                rental._id,
                rental.product._id
            );

            // Notify owner
            await createNotification(
                rental.owner._id,
                'Rental Starting Soon',
                `Your item ${rental.product.name} is due to be rented by ${rental.renter.fullName} in less than 24 hours.`,
                'rental_starting_soon',
                rental._id,
                rental.product._id
            );
        }

        // Find rentals ending within the next 24 hours
        const endingRentals = await Rental.find({
            status: 'approved',
            endDate: { $gt: now, $lt: oneDayFromNow }
        }).populate('product', 'name').populate('renter', 'fullName').populate('owner', 'fullName');

        for (const rental of endingRentals) {
            // Notify renter
            await createNotification(
                rental.renter._id,
                'Rental Ending Soon',
                `Your rental of ${rental.product.name} will end in less than 24 hours.`,
                'rental_ending_soon',
                rental._id,
                rental.product._id
            );

            // Notify owner
            await createNotification(
                rental.owner._id,
                'Rental Ending Soon',
                `Your item ${rental.product.name} rented by ${rental.renter.fullName} will be returned in less than 24 hours.`,
                'rental_ending_soon',
                rental._id,
                rental.product._id
            );
        }

        console.log("Notification scheduler completed successfully");
    } catch (error) {
        console.error("Error in notification scheduler:", error);
    }
};

module.exports = {
    initNotificationScheduler
};