const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    category: { // New field for category
        type: String,
        enum: [
            'Trending',
            'Rooms',
            'Iconic Cities',
            'Lakes',
            'Castles',
            'Beaches',
            'Camping',
            'Farms',
            'Arctic',
            'Domes',
            'Boats',
        ],
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    capacity: { // Add capacity attribute
        type: Number,
        // required: true, // Ensure capacity is required
        min: 1 // Minimum value for capacity
      },
    geometry:{
        type:{
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    }      
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
