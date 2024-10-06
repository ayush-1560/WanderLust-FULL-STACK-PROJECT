const express=require("express");
const wrapAsync = require("../utils/wrapAsync");
const router=express.Router();
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/users.js");
router.get("/signup",userController.renderSignup);

router.post("/signup",wrapAsync(userController.signUp));

router.get("/login",userController.renderLogin);

router.post("/login",saveRedirectUrl,
    passport.authenticate("local",
        {
            failureFlash:true,
            failureRedirect: "/users/login",
        }),
        userController.Login
);

router.get("/logout",userController.logout);
module.exports=router;