const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.get("/signup", userController.renderSignup);

router.post("/signup", wrapAsync(userController.signUp));

router.get("/login", userController.renderLogin);

router.post("/login", saveRedirectUrl,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/users/login",
    }),
    userController.Login
);

router.get("/logout", userController.logout);

// Google OAuth login route
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route

router.get('/auth/google/callback', 
    passport.authenticate('google', {
        failureRedirect: '/users/login', // Redirect if authentication fails
        failureFlash: true,
    }), 
    (req, res) => {
        // Successful authentication, redirect to listings
        req.flash("success", "Welcome Back to WanderLust!");
        res.redirect("/listings");
    }
);


module.exports = router;
