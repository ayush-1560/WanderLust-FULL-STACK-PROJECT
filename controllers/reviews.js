const Listing = require("../models/listings");
const Review=require("../models/review.js");

module.exports.createReview=async (req,res)=>{
    let listing=await Listing.findById(req.params.id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        res.redirect("/listings");
    }
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview.author);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("review saved");
    req.flash("success","Review Added!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
};