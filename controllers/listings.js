const Listing = require("../models/listings");
const Booking = require("../models/booking"); // Import the Booking model
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { query } = require("express");
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken: mapToken});
module.exports.index = async (req, res) => {
    const { category } = req.query; // Get category from query parameters
    let allListings;

    if (category) {
        allListings = await Listing.find({ category }); // Filter by category
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm=(req, res) => {
    return res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createNewListing=async (req, res, next) => {
        let response=await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
          })
            .send()
        let url=req.file.path;
        let filename=req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner=req.user._id;
        newListing.image={url,filename};
        newListing.geometry=response.body.features[0].geometry;    
        let savedListing=await newListing.save();
        console.log(savedListing);
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
    
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    let modifiedImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, modifiedImageUrl });
};


module.exports.updateListing=async (req, res, next) => {
        let { id } = req.params;
        let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        if(typeof req.file!=="undefined"){
            let url=req.file.path;
            let filename=req.file.filename;
            listing.image={url,filename};
            await listing.save();
        }
        req.flash("success","Listing Updated!");
        res.redirect(`/listings/${id}`);

};

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedData = await Listing.findByIdAndDelete(id);
    console.log(deletedData);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
};

module.exports.search = async (req, res) => {
    try {
        // Extract and trim the search query, ensure it's a string
        const input = req.query.q ? req.query.q.trim() : '';
        console.log("Received Query:", input); // Debug: Check the received query

        if (!input || typeof input !== 'string') {
            req.flash("error", "Search value cannot be empty or invalid!");
            return res.redirect("/listings");
        }

        // Capitalize the first letter of each word
        const formattedInput = input
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        console.log("Formatted Query:", formattedInput); // Debug: Check the formatted query

        // Perform the search across multiple fields (title, description, category)
        const allListing = await Listing.find({
            $or: [
                { title: { $regex: formattedInput, $options: "i" } }, // Search by title
                { description: { $regex: formattedInput, $options: "i" } }, // Search by description
                { category: { $regex: formattedInput, $options: "i" } } // Search by category
            ]
        }).sort({ _id: -1 });

        console.log("Listings Found:", allListing); // Debug: Check if listings are returned

        if (allListing.length === 0) {
            req.flash("error", "No listings found with the given search!");
            return res.redirect("/listings");
        }

        res.locals.success = "Listings found";
        res.render("listings/index.ejs", { allListings: allListing });
    } catch (error) {
        console.error("Search Error:", error.message); // More detailed error logging
        req.flash("error", "An error occurred while searching!");
        res.redirect("/listings");
    }
};

module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    res.render("listings/book.ejs", { listing }); // Render the book.ejs with listing details
};

module.exports.bookListing = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests, name, email, phone } = req.body;

    // Basic input validation
    if (!checkIn || !checkOut || !guests) {
        return res.redirect(`/listings/${id}/book`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
        req.flash("error", "Check-out date must be after check-in date.");
        return res.redirect(`/listings/${id}/book`);
    }

    if (guests < 1) {
        req.flash("error", "Number of guests must be at least 1.");
        return res.redirect(`/listings/${id}/book`);
    }

    // Check for overlapping bookings
    const existingBookings = await Booking.find({
        listing: id,
        $or: [
            { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } } // Overlap condition
        ]
    });

    if (existingBookings.length > 0) {
        req.flash("error", "The listing is not available for the selected dates.");
        return res.redirect(`/listings/${id}/book`);
    }

    // Validate guest count against listing capacity
    const listing = await Listing.findById(id);
    if (guests > listing.capacity) { // Assume `capacity` is a field in your Listing model
        req.flash("error", `The number of guests cannot exceed the maximum capacity of ${listing.capacity}.`);
        return res.redirect(`/listings/${id}/book`);
    }

    // Create a booking object
    const booking = new Booking({
        listing: id,
        checkIn,
        checkOut,
        guests,
        user: req.user ? req.user._id : null, // If logged in, associate the user
        name: req.user ? null : name, // Use the name from the form if not logged in
        email: req.user ? null : email, // Use the email from the form if not logged in
        phone: req.user ? null : phone // Use the phone from the form if not logged in
    });

    // Save the booking (this should ideally happen after payment confirmation)
    await booking.save();

    req.flash("success", "Booking confirmed!");
    res.redirect(`/listings/${id}`);
};

