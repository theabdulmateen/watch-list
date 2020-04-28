const express     = require("express"),
      router      = express.Router(),
      passport    = require("passport"),
      // jikanjs   = require("jikanjs"),
      User        = require("../models/user.js");

router.get("/", function(req, res) { 
      res.redirect("/watchlist");
});

router.get("/register", function(req, res) {
      res.render("register");
});

router.post("/register", function(req, res) {
      User.register(new User({ username: req.body.username }), req.body.password, function(err, User) {
            if (err) {
                  console.log(err);
                  return res.render("register");
            }
            passport.authenticate("local")(req, res, function() {
                  res.redirect("/watchlist");
            });
      });
});

router.get("/login", function(req, res) {
      res.render("login");
});

router.post("/login", passport.authenticate("local", {
      successRedirect: "/watchlist",
      failureRedirect: "/login"
}), function(req, res) {
      // callback
});

router.get("/logout", function(req, res) {
      req.logout();
      res.redirect("/login");
});

module.exports = router;