const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync =require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");
//Post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

router.delete("/:reviewId",isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;