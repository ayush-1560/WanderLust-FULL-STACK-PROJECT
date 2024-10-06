const express=require("express");
const router=express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });

//index route
router.get("/",wrapAsync(listingController.index));

// new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//search route
router.get("/search",wrapAsync(listingController.search));

// show route
router.get("/:id",wrapAsync(listingController.showListing));
// create route
router.post("/", isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createNewListing));

// Edit route
router.get("/:id/edit", isLoggedIn,isOwner,listingController.editListing);

// Update route
router.put("/:id", isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing));

// Delete Route
router.delete("/:id", isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

module.exports=router;