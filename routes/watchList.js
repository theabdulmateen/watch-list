const   express     = require("express"),
        router      = express.Router(),
        jikanjs     = require("jikanjs"),
        Watchlist   = require("../models/watchList");

// index route
router.get("/", isLoggedIn, (req, res) => {
    // get all items from database and render
    Watchlist.find({user: {id: req.user._id, username: req.user.username}}, (err, movies) => {
        res.render("index", { movies: movies });
    });
});

// create route
router.post("/", isLoggedIn, (req, res) => {
    // create new item 
    req.body.movie.synopsis = req.sanitize(req.body.movie.synopsis);
    Watchlist.create(req.body.movie,  (err, movie) => {
        if (err) {
            res.redirect("/new");   
        } else {
            movie.user.id = req.user._id;
            movie.user.username = req.user.username;
            movie.save();
            res.redirect("/watchlist");
        }
    });
});

// add new item
router.get("/new", isLoggedIn, (req, res) => {
    res.render("new");
});

// show route
router.get("/:id", isLoggedIn, (req, res) => {
    Watchlist.findById(req.params.id, (err, movie) => {
        if (err) {
            console.log(err);
            res.redirect("/watchlist");
        } else {
            res.render("show", {movie: movie});
        }
    });
});

// edit route
router.get("/:id/edit", isLoggedIn, (req, res) => {
    Watchlist.findById(req.params.id, (err, movie) => {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("edit", {movie: movie});
        }
    });
});

// update PUT Route
router.put("/:id", isLoggedIn, (req, res) => {
    req.body.movie.synopsis = req.sanitize(req.body.movie.synopsis);
    Watchlist.findByIdAndUpdate(req.params.id, req.body.movie, (err, movie) => {
        if (err) {
            console.log(err)
            res.redirect("back");
        } else {
            res.redirect("/watchlist/" + req.params.id);
        }
    });
});

// DELETE
router.delete("/:id", isLoggedIn, (req, res) => {
    Watchlist.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            console.log(err);
            console.log("Sdkjsd;")
            res.redirect("/watchlist/" +  req.params.id);
        } else {
            res.redirect("/watchlist");
        }
    });
});

// middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

module.exports = router;