const   express     = require("express"),
        router      = express.Router(),
        middleware  = require("../routes/middleware.js"),
        Comment     = require("../models/comment.js");

router.post("/", middleware.isLoggedIn, function(req, res) {
    if (req.body.text !== '') {
        Comment.create({
            text: req.body.text,
            user: { 
                id: req.user._id, 
                username: req.user.username 
            }
        }, function(err, comment) {
            if (err) {
                console.log(err);
                req.redirect("/home");
            } else {
                res.redirect("back");
            }
        });
    } else {
        res.back();
    }
});

// edit route
router.put("/:comment_id", middleware.isLoggedIn, (req, res) => {
    console.log("Reached put route");
    Comment.findByIdAndUpdate(req.params.comment_id, { text: req.body.text, user: req.user }, (err, comment) => {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("back");
        }
    });
});

router.delete("/:comment_id", middleware.isLoggedIn, (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, (err) => {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("back");
        }
    });
});

module.exports = router;