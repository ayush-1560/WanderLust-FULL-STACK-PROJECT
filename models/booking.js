const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing', // Reference to the Listing model
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model (if applicable)
    },
    name: String,
    email: String,
    phone: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'], // Track payment status
        default: 'pending' // Default status is pending
    },
    paymentIntentId: String, // Store the Stripe PaymentIntent ID
    amountPaid: Number // Store the amount paid
}, { timestamps: true }); // Automatically add createdAt and updatedAt timestamps

module.exports = mongoose.model('Booking', bookingSchema);
