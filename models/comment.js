const mongoose = require("mongoose");

commentSchema = new mongoose.Schema({
    text: String,
    dateAdded: { type: Date, default: Date.now() },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
}); 

module.exports = mongoose.model("Comment", commentSchema);