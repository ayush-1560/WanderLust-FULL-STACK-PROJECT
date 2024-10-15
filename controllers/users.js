const User = require("../models/user.js");

// Render Signup Page
module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

// Handle Local Signup
module.exports.signUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/users/signup");
    }
};

// Render Login Page
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

// Handle Local Login
module.exports.Login = (req, res) => {
    req.flash("success", "Welcome Back to WanderLust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Handle Google OAuth Login/Signup
module.exports.googleOAuthCallback = async (req, res) => {
    req.flash("success", "Welcome Back to WanderLust (via Google)!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged Out Successfully!");
        res.redirect("/listings");
    });
};
