const Product = require('../models/product');
const Rental = require('../models/rental');
const User = require('../models/user');
const UserInteraction = require('../models/userInteraction'); // Added import for UserInteraction
const { createNotification } = require('./notificationController');

// Create a new rental request
const createRental = async (req, res) => {
    try {
        const { productId, startDate, endDate } = req.body;

        if (!productId || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing required rental information" });
        }

        // Ensure start date is before end date
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ error: "End date must be after start date" });
        }

        // Ensure start date is in the future
        if (new Date(startDate) < new Date()) {
            return res.status(400).json({ error: "Start date must be in the future" });
        }

        // Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if product is rentable
        if (product.uploadedBy.toString() === req.user.id.toString()) {
            return res.status(400).json({ error: "You cannot rent your own product" });
        }

        // Check if the product is currently booked (global booking flag)
        if (product.isBooked) {
            return res.status(400).json({ error: "This product is currently unavailable for booking" });
        }

        // Find all existing rentals for this product that are not cancelled
        const existingRentals = await Rental.find({
            product: productId,
            status: { $in: ['approved'] },
        });

        const requestedStartDate = new Date(startDate);
        const requestedEndDate = new Date(endDate);

        // Check for date conflicts with existing rentals
        const hasConflict = existingRentals.some(rental => {
            const rentalStartDate = new Date(rental.startDate);
            const rentalEndDate = new Date(rental.endDate);

            // Check for overlap
            return (
                (requestedStartDate >= rentalStartDate && requestedStartDate <= rentalEndDate) || // Start date within existing rental
                (requestedEndDate >= rentalStartDate && requestedEndDate <= rentalEndDate) || // End date within existing rental
                (requestedStartDate <= rentalStartDate && requestedEndDate >= rentalEndDate) // Completely encompasses existing rental
            );
        });

        if (hasConflict) {
            // Find the next available date
            let nextAvailableDate = null;
            if (existingRentals.length > 0) {
                // Sort rentals by end date
                const sortedRentals = [...existingRentals].sort((a, b) => 
                    new Date(a.endDate) - new Date(b.endDate)
                );
                
                // The next available date is the day after the latest end date
                const latestEndDate = new Date(sortedRentals[sortedRentals.length - 1].endDate);
                nextAvailableDate = new Date(latestEndDate);
                nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
            }
            
            return res.status(400).json({ 
                nextAvailableDate: nextAvailableDate,
                error: `This product already on rent for the selected dates. Kindly Try to book from ${nextAvailableDate}`});
        }

        // Calculate rental duration in days
        const rentalDurationDays = Math.ceil((requestedEndDate - requestedStartDate) / (1000 * 60 * 60 * 24));

        // Create the rental
        const rental = await Rental.create({
            product: productId,
            renter: req.user.id,
            owner: product.uploadedBy,
            startDate: requestedStartDate,
            endDate: requestedEndDate,
            totalPrice: calculateTotalPrice(product.price, startDate, endDate),
            status: 'pending'
        });

        

        // Record user interaction of type RENT
        await UserInteraction.create({
            userId: req.user.id,
            productId: productId,
            interactionType: 'RENT',
            rentalDuration: rentalDurationDays
        });

        // Find the owner and renter to get their names
        const owner = await User.findById(product.uploadedBy);
        const renter = await User.findById(req.user.id);

        // Create notification for the owner
        await createNotification(
            product.uploadedBy,
            'New Rental Request',
            `${renter.fullName} wants to rent your ${product.name}`,
            'rental_request',
            rental._id,
            productId
        );

        res.status(201).json({ 
            message: "Rental request created successfully",
            rental
        });
    } catch (error) {
        console.error("Error creating rental:", error);
        res.status(500).json({ error: "Failed to create rental request" });
    }
};

// Helper function to calculate total price
const calculateTotalPrice = (dailyPrice, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return dailyPrice * Math.max(1, days); // Minimum 1 day
};

// Get all rentals where user is the renter
const getUserRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ renter: req.user.id })
            .populate('product', 'name productImage price')
            .populate('owner', 'fullName email')
            .sort('-createdAt');

        res.json(rentals);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch rental history" });
    }
};

// Get all rentals for products owned by the user
const getOwnerRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ owner: req.user.id })
            .populate('product', 'name productImage price')
            .populate('renter', 'fullName email')
            .sort('-createdAt');

        res.json(rentals);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch rental requests" });
    }
};

// Approve a rental request
const approveRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate('product', 'name')
            .populate('renter', 'fullName');

        if (!rental) {
            return res.status(404).json({ error: "Rental not found" });
        }

        // Prevent approving an already approved rental
        if (rental.status !== 'pending') {
            return res.status(400).json({ error: "Only pending rentals can be approved" });
        }

        // Check if user is the owner
        if (rental.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Not authorized to approve this rental" });
        }

        // Check for conflicts with other approved rentals
        const existingRentals = await Rental.find({
            product: rental.product._id,
            status: 'approved',
            _id: { $ne: rental._id } // Exclude the current rental
        });

        const requestedStartDate = new Date(rental.startDate);
        const requestedEndDate = new Date(rental.endDate);

        // Check for date conflicts with existing approved rentals
        const hasConflict = existingRentals.some(existingRental => {
            const rentalStartDate = new Date(existingRental.startDate);
            const rentalEndDate = new Date(existingRental.endDate);

            // Check for overlap
            return (
                (requestedStartDate >= rentalStartDate && requestedStartDate <= rentalEndDate) || // Start date within existing rental
                (requestedEndDate >= rentalStartDate && requestedEndDate <= rentalEndDate) || // End date within existing rental
                (requestedStartDate <= rentalStartDate && requestedEndDate >= rentalEndDate) // Completely encompasses existing rental
            );
        });

        if (hasConflict) {
            return res.status(400).json({ error: "You already approved the rental for same product" });
        }

        // Update rental status
        rental.status = 'approved';
        await rental.save();

        // Update product's isBooked flag if the start date is today or earlier
        const today = new Date();
        const product = await Product.findById(rental.product._id);
        
        if (
            product &&
            requestedStartDate <= today
        ) {
            product.isBooked = true;
            await product.save();
        }

        // Create notification for the renter
        await createNotification(
            rental.renter._id,
            'Rental Request Approved',
            `Your request to rent ${rental.product.name} has been approved`,
            'rental_approved',
            rental._id,
            rental.product._id
        );

        res.json({ message: "Rental approved successfully" });
    } catch (error) {
        console.error("Error approving rental:", error);
        res.status(500).json({ error: "You already approved the rental for same product" });
    }
};

// Cancel a rental request
const cancelRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate('product', 'name')
            .populate('renter', 'fullName')
            .populate('owner', 'fullName');

        if (!rental) {
            return res.status(404).json({ error: "Rental not found" });
        }

        // Prevent cancellation if rental is already cancelled or completed
        if (rental.status === "completed" || rental.status === "cancelled") {
            return res.status(400).json({ error: "Rental cannot be cancelled" });
        }

        // Check if user is the renter or owner
        const isRenter = rental.renter.id.toString() === req.user.id.toString();
        const isOwner = rental.owner.id.toString() === req.user.id.toString();

        if (!isRenter && !isOwner) {
            return res.status(403).json({ error: "Not authorized to cancel this rental" });
        }

        // Update rental status
        rental.status = "cancelled";
        rental.cancelledBy = req.user.id;
        await rental.save();

        // Check if the product needs to be made available again
        const product = await Product.findById(rental.product.id);
        if (product && product.isBooked) {
            // Check if there are any other active rentals for this product
            const activeRentals = await Rental.find({
                product: rental.product.id,
                status: 'approved',
                _id: { $ne: rental._id }, // Exclude current rental
                startDate: { $lte: new Date() }, // Start date is today or earlier
                endDate: { $gte: new Date() }    // End date is today or later
            });

            // If there are no other active rentals, make the product available again
            if (activeRentals.length === 0) {
                product.isBooked = false;
                await product.save();
            }
        }

        // Create notification for the other party
        if (isRenter) {
            // Create notification for the owner
            await createNotification(
                rental.owner._id,
                'Rental Cancelled by Renter',
                `${rental.renter.fullName} has cancelled the rental request for ${rental.product.name}`,
                'rental_cancelled',
                rental._id,
                rental.product._id
            );
        } else {
            // Create notification for the renter
            await createNotification(
                rental.renter._id,
                'Rental Cancelled by Owner',
                `${rental.owner.fullName} has cancelled your rental request for ${rental.product.name}`,
                'rental_cancelled',
                rental._id,
                rental.product._id
            );
        }

        res.json({ message: "Rental cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling rental:", error);
        res.status(500).json({ error: "Failed to cancel rental" });
    }
};

// Complete a rental (return the item)
const completeRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate('product', 'name')
            .populate('renter', 'fullName');

        if (!rental) {
            return res.status(404).json({ error: "Rental not found" });
        }

        // Prevent completing an already completed rental
        if (rental.status === "completed") {
            return res.status(400).json({ error: "Rental is already completed" });
        }

        // Check if user is the owner
        if (rental.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Not authorized to complete this rental" });
        }

        // Check if rental is approved
        if (rental.status !== 'approved') {
            return res.status(400).json({ error: "Can only complete approved rentals" });
        }

        // Update rental status
        rental.status = 'completed';
        await rental.save();

        // Check if the product needs to be made available again
        const product = await Product.findById(rental.product.id);
        if (product) {
            // Check if there are any other active rentals for this product
            const activeRentals = await Rental.find({
                product: rental.product.id,
                status: 'approved',
                _id: { $ne: rental._id }, // Exclude current rental
                startDate: { $lte: new Date() }, // Start date is today or earlier
                endDate: { $gte: new Date() }    // End date is today or later
            });

            // If there are no other active rentals, make the product available again
            if (activeRentals.length === 0) {
                product.isBooked = false;
                await product.save();
            }
        }

        // Create notification for the renter
        await createNotification(
            rental.renter._id,
            'Rental Completed',
            `Your rental of ${rental.product.name} has been marked as completed`,
            'rental_completed',
            rental._id,
            rental.product._id
        );

        res.json({ message: "Rental completed successfully" });
    } catch (error) {
        console.error("Error completing rental:", error);
        res.status(500).json({ error: "Failed to complete rental" });
    }
};

// Get rental availability for a product
const getProductAvailability = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        // Get all future approved and pending rentals for this product
        const rentals = await Rental.find({
            product: productId,
            status: { $in: ['approved', 'pending'] },
            endDate: { $gte: new Date() } // Only include current and future rentals
        }).select('startDate endDate status');
        
        // Return the availability information
        res.json({
            productId,
            isAvailable: !product.isBooked,
            bookedDates: rentals.map(rental => ({
                startDate: rental.startDate,
                endDate: rental.endDate,
                status: rental.status
            }))
        });
    } catch (error) {
        console.error("Error fetching product availability:", error);
        res.status(500).json({ error: "Failed to fetch product availability" });
    }
};

// Get completed rentals for user (as renter)
const getUserCompletedRentals = async (req, res) => {
    try {
        const completedRentals = await Rental.find({ 
            renter: req.user.id,
            status: 'completed'
        })
            .populate('product', 'name productImage price category subcategory')
            .populate('owner', 'fullName email')
            .sort('-updatedAt'); // Sort by completion date (when status was changed to completed)

        res.json({
            count: completedRentals.length,
            completedRentals
        });
    } catch (error) {
        console.error("Error fetching completed rentals:", error);
        res.status(500).json({ error: "Failed to fetch completed rental history" });
    }
};

// Get completed rentals for user (as owner)
const getOwnerCompletedRentals = async (req, res) => {
    try {
        const completedRentals = await Rental.find({ 
            owner: req.user.id,
            status: 'completed'
        })
            .populate('product', 'name productImage price category subcategory')
            .populate('renter', 'fullName email')
            .sort('-updatedAt'); // Sort by completion date

        res.json({
            count: completedRentals.length,
            completedRentals
        });
    } catch (error) {
        console.error("Error fetching completed rentals:", error);
        res.status(500).json({ error: "Failed to fetch completed rental history" });
    }
};

// Get all rentals for products uploaded by the user (with all statuses)
const getAllProductRentals = async (req, res) => {
    try {
        // First, find all products uploaded by the user
        const userProducts = await Product.find({ uploadedBy: req.user.id }).select('_id name');
        
        if (userProducts.length === 0) {
            return res.json({
                message: "You haven't uploaded any products yet",
                rentals: []
            });
        }
        
        // Get product IDs array
        const productIds = userProducts.map(product => product._id);
        
        // Find all rentals for these products
        const rentals = await Rental.find({ product: { $in: productIds } })
            .populate('product', 'name productImage price category subcategory')
            .populate('renter', 'fullName email profileImage')
            .sort('-createdAt');
        
        // Group rentals by status for easier client-side handling
        const rentalsByStatus = {
            pending: rentals.filter(rental => rental.status === 'pending'),
            approved: rentals.filter(rental => rental.status === 'approved'),
            cancelled: rentals.filter(rental => rental.status === 'cancelled'),
            completed: rentals.filter(rental => rental.status === 'completed')
        };
        
        // Count total rentals by status
        const statusCounts = {
            pending: rentalsByStatus.pending.length,
            approved: rentalsByStatus.approved.length,
            cancelled: rentalsByStatus.cancelled.length,
            completed: rentalsByStatus.completed.length,
            total: rentals.length
        };
        
        res.json({
            message: "All product rentals retrieved successfully",
            statusCounts,
            rentals: {
                all: rentals,
                byStatus: rentalsByStatus
            }
        });
    } catch (error) {
        console.error("Error fetching product rentals:", error);
        res.status(500).json({ error: "Failed to fetch product rentals" });
    }
};

module.exports = {
    createRental,
    getUserRentals,
    getOwnerRentals,
    approveRental,
    cancelRental,
    completeRental,
    getProductAvailability,
    getUserCompletedRentals,
    getOwnerCompletedRentals,
    getAllProductRentals
};