// schedulers/rentalScheduler.js
const cron = require('node-cron');
const Rental = require('../models/rental');
const Product = require('../models/product');
const { createNotification } = require('../controllers/notificationController');

/**
 * Auto-complete rentals that have passed their end date
 * This function will run at 10:00 AM IST for testing
 */
const scheduleRentalCompletions = () => {
    // Schedule the job to run at 10:00 AM IST for testing
    cron.schedule('0 10 * * *', async () => {
        try {
            console.log('Running rental auto-completion job...');
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
            
            // Find approved rentals where end date has passed
            const expiredRentals = await Rental.find({
                status: 'approved',
                endDate: { $lt: today } // End date is in the past
            }).populate('product')
              .populate('renter')
              .populate('owner');
            
            console.log(`Found ${expiredRentals.length} rentals to auto-complete`);
            
            // Process each expired rental
            for (const rental of expiredRentals) {
                try {
                    // Skip if any required reference is missing
                    if (!rental.product || !rental.renter || !rental.owner) {
                        console.log(`Skipping rental ID ${rental._id} - Missing required references`);
                        if (!rental.product) console.log(`- Missing product reference`);
                        if (!rental.renter) console.log(`- Missing renter reference`);
                        if (!rental.owner) console.log(`- Missing owner reference`);
                        continue;
                    }

                    // Update rental status
                    rental.status = 'completed';
                    await rental.save();
                    
                    // Check if the product needs to be made available again
                    const product = await Product.findById(rental.product._id);
                    if (product) {
                        // Check if there are any other active rentals for this product
                        const activeRentals = await Rental.find({
                            product: rental.product._id,
                            status: 'approved',
                            _id: { $ne: rental._id }, // Exclude current rental
                        });
                        
                        // If there are no other active rentals, make the product available again
                        if (activeRentals.length === 0) {
                            product.isBooked = false;
                            await product.save();
                            console.log(`Product ${product._id} marked as available again`);
                        }
                    }
                    
                    // Create notification for both owner and renter
                    try {
                        await createNotification(
                            rental.renter._id,
                            'Rental Automatically Completed',
                            `Your rental of ${rental.product.name || 'this product'} has been automatically completed as the rental period has ended`,
                            'rental_completed',
                            rental._id,
                            rental.product._id
                        );
                    } catch (notifyErr) {
                        console.error(`Error creating renter notification for rental ${rental._id}:`, notifyErr);
                    }
                    
                    try {
                        await createNotification(
                            rental.owner._id,
                            'Rental Automatically Completed',
                            `The rental of ${rental.product.name || 'this product'} to ${rental.renter.fullName || 'the renter'} has been automatically completed as the rental period has ended`,
                            'rental_completed',
                            rental._id,
                            rental.product._id
                        );
                    } catch (notifyErr) {
                        console.error(`Error creating owner notification for rental ${rental._id}:`, notifyErr);
                    }
                    
                    console.log(`Auto-completed rental ID: ${rental._id}`);
                } catch (err) {
                    console.error(`Error processing rental ID ${rental._id}:`, err);
                }
            }
            console.log('Rental auto-completion job completed');
        } catch (error) {
            console.error('Error in rental auto-completion job:', error);
        }
    });
    
    console.log('Rental auto-completion scheduler initialized');
};

/**
 * Check for upcoming rental end dates and send reminders
 * This runs at 10:05 AM IST for testing
 */
const scheduleRentalReminders = () => {
    // Schedule the job to run at 10:05 AM IST for testing
    cron.schedule('5 10 * * *', async () => {
        try {
            console.log('Running rental reminder job...');
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            
            // Find rentals ending tomorrow
            const endingSoonRentals = await Rental.find({
                status: 'approved',
                endDate: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                }
            }).populate('product')
              .populate('renter')
              .populate('owner');
            
            console.log(`Found ${endingSoonRentals.length} rentals ending soon`);
            
            // Send reminders for each rental
            for (const rental of endingSoonRentals) {
                try {
                    // Skip if any required reference is missing
                    if (!rental.product || !rental.renter || !rental.owner) {
                        console.log(`Skipping reminder for rental ID ${rental._id} - Missing required references`);
                        if (!rental.product) console.log(`- Missing product reference`);
                        if (!rental.renter) console.log(`- Missing renter reference`);
                        if (!rental.owner) console.log(`- Missing owner reference`);
                        continue;
                    }
                    
                    // Send reminder to renter
                    try {
                        await createNotification(
                            rental.renter._id,
                            'Rental Ending Soon',
                            `Your rental of ${rental.product.name || 'this product'} will end tomorrow. Please prepare to return the item.`,
                            'rental_reminder',
                            rental._id,
                            rental.product._id
                        );
                    } catch (notifyErr) {
                        console.error(`Error creating renter reminder for rental ${rental._id}:`, notifyErr);
                    }
                    
                    // Send reminder to owner
                    try {
                        await createNotification(
                            rental.owner._id,
                            'Rental Ending Soon',
                            `Your rental of ${rental.product.name || 'this product'} to ${rental.renter.fullName || 'the renter'} will end tomorrow.`,
                            'rental_reminder',
                            rental._id,
                            rental.product._id
                        );
                    } catch (notifyErr) {
                        console.error(`Error creating owner reminder for rental ${rental._id}:`, notifyErr);
                    }
                    
                    console.log(`Sent reminders for rental ID: ${rental._id}`);
                } catch (err) {
                    console.error(`Error sending reminder for rental ID ${rental._id}:`, err);
                }
            }
            console.log('Rental reminder job completed');
        } catch (error) {
            console.error('Error in rental reminder job:', error);
        }
    });
    
    console.log('Rental reminder scheduler initialized');
};

/**
 * Initialize all schedulers
 */
const initializeSchedulers = () => {
    scheduleRentalCompletions();
    scheduleRentalReminders();
    console.log('All rental schedulers initialized successfully');
};

module.exports = {
    scheduleRentalCompletions,
    scheduleRentalReminders,
    initializeSchedulers
};