const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { isLoggedIn } = require("../middleware.js");
const Listing = require("../models/listings");
const Booking = require("../models/booking"); // Import the Booking model

router.post("/create-checkout-session", isLoggedIn, async (req, res) => {
    const { listingId, guests, checkIn, checkOut, name, email, phone } = req.body;

    // Retrieve the listing from the database
    const listing = await Listing.findById(listingId);

    if (!listing) {
        console.log("Listing not found");
        req.flash("error", "Listing not found.");
        return res.redirect(`/listings/${listingId}`);
    }

    const totalAmount = listing.price * guests; // Calculate the total amount

    try {
        // Create a new checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: listing.title,
                        description: `Booking for ${guests} guests from ${checkIn} to ${checkOut}`,
                    },
                    unit_amount: totalAmount * 100, // Convert INR to paise
                },
                quantity: 1,
            }],
            mode: "payment",
            success_url: `${process.env.BASE_URL}/payments/bookings/success?session_id={CHECKOUT_SESSION_ID}`, // Pass the session ID to the success URL
            cancel_url: `${process.env.BASE_URL}/payments/bookings/cancel`,  // Cancel URL
        });

        // Create a booking entry in the database
        const booking = new Booking({
            listing: listingId,
            checkIn,
            checkOut,
            guests,
            user: req.user ? req.user._id : null, // Associate with the logged-in user
            name: req.user ? null : name,
            email: req.user ? null : email,
            phone: req.user ? null : phone,
            paymentStatus: 'pending', // Set the initial payment status to pending
            paymentIntentId: session.id, // Save the Stripe session ID
            amountPaid: totalAmount // Store the amount paid
        });

        await booking.save(); // Save the booking to the database

        console.log("Stripe session created:", session.url); // Debugging: Log the session URL
        res.redirect(303, session.url); // Redirects the user to the Stripe checkout page

    } catch (error) {
        console.error("Error creating checkout session:", error);
        req.flash("error", "There was an issue processing your payment.");
        res.redirect(`/listings/${listingId}`);
    }
});

// Success Route
router.get("/bookings/success", async (req, res) => {
    const session_id = req.query.session_id; // Get the session ID from the URL
    // Here you could retrieve the booking based on the session_id if needed
    res.render('bookings/success.ejs'); // Render the success page
});

// Cancel Route
router.get("/bookings/cancel", (req, res) => {
    req.flash("error", "Payment was canceled. Please try again.");
    res.redirect("/listings"); // Redirect to the listings page or wherever you prefer
});

module.exports = router;
