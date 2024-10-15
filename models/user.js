const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    googleId: {
        type: String,  // Field to store Google OAuth ID
        unique: true,  // Ensure Google IDs are unique
    },
});

// Use passport-local-mongoose to manage username and password
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
