const   mongoose    = require("mongoose"),
        User        = require("../models/user.js");

const watchlistSchema = new mongoose.Schema({
    title: String,
    genre: String,
    status: {type: String, default: "plan to watch"},
    synopsis: {type: String, default: "Synopsis"},
    dateAdded: {type: Date, default: Date.now},
    image_url: {type: String, default: "imageDefault.png"},
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Watchlist", watchlistSchema);