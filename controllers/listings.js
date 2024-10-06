const Listing = require("../models/listings");
const opencage = require('opencage-api-client');
module.exports.index=async (req, res) => {
    let allListings = await Listing.find({});
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
        let url=req.file.path;
        let filename=req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner=req.user._id;
        newListing.image={url,filename};    
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

        // Perform the search using a valid string in the $regex query
        const allListing = await Listing.find({
            title: { $regex: formattedInput, $options: "i" } // Case-insensitive search
        }).sort({ _id: -1 });
        console.log("Listings Found:", allListing); // Debug: Check if listings are returned

        if (allListing.length === 0) {
            req.flash("error", "No listings found with the given title!");
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

