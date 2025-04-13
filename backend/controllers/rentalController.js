const Product = require('../models/product');
const Rental = require('../models/rental');

const User = require('../models/user');
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

        // Create the rental
        const rental = await Rental.create({
            product: productId,
            renter: req.user.id,
            owner: product.uploadedBy,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalPrice: calculateTotalPrice(product.price, startDate, endDate),
            status: 'pending'
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

        // Update rental status
        rental.status = 'approved';
        await rental.save();


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
        res.status(500).json({ error: "Failed to approve rental" });
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

        // Make product available again
        const product = await Product.findById(rental.product.id);
        if (product) {
            product.isAvailable = true;
            await product.save();
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

        // Make product available again
        const product = await Product.findById(rental.product.id);
        if (product) {
            product.isAvailable = true;
            await product.save();
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

module.exports = {
    createRental,
    getUserRentals,
    getOwnerRentals,
    approveRental,
    cancelRental,
    completeRental
};