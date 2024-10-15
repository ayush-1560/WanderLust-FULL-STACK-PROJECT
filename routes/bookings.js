// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const { isLoggedIn } = require('../middleware');

router.get('/', isLoggedIn, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('listing');
        res.render('bookings/index', { bookings }); // Render bookings page
    } catch (error) {
        console.error(error);
        req.flash('error', 'Unable to fetch bookings.');
        res.redirect('/'); // Redirect to home or another page
    }
});

router.delete('/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    try {
        await Booking.findByIdAndDelete(id); // Delete the booking
        req.flash('success', 'Booking deleted successfully.');
        res.redirect('/bookings'); // Redirect to the bookings page
    } catch (error) {
        console.error(error);
        req.flash('error', 'Unable to delete booking.');
        res.redirect('/bookings'); // Redirect to bookings page
    }
});
module.exports = router;
