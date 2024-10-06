if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const MONGO_URL = "mongodb://127.0.0.1:27017/WanderLust";
const db_url=process.env.DB_url;
const ejsMate = require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session =require("express-session");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const MongoStore = require('connect-mongo');

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(db_url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

const store=MongoStore.create({
    mongoUrl: db_url,
    crypto: {
        secret: "mysecretcode",
    },
    touchAfter: 24*3600,
});
store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});
const sessionOptions={
    store,
    secret:"mysecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 3*24*60*60*1000,
        maxAge: 3*24*60*60*1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/users",userRouter);
app.all("*",(req,res,next)=>{
    next (new ExpressError(404,"Page not Found"));
});
// Error-handling middleware
app.use((err, req, res, next) => {
    let{statusCode=500,message="Something went Wrong!"}=err;
    res.status(statusCode).render("listings/error.ejs",{message});
});

// Start the server
app.listen(8080, () => {
    console.log("app is listening on port 8080");
});
