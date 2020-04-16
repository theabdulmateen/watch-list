// personal watchlist 
// RESTful structural design

// future additions??
//      Authentication <done>
//      Categorising into movies, shows, anime etc
//      Add MAL/imdb score

// import packages
const   bodyParser          = require("body-parser"),
        mongoose            = require("mongoose"),
        methodOverride      = require("method-override"),
        expressSanitizer    = require("express-sanitizer"),
        User                = require("./models/user"),
        Watchlist           = require("./models/watchList"),
        Comment             = require("./models/comment.js"),
        passport            = require("passport"),
        localStrategy       = require("passport-local"),
        express             = require("express"),
        app                 = express();

// routes
const   watchlistRoutes = require("./routes/watchList.js"),
        indexRoutes     = require("./routes/index.js"),
        commentsRoutes  = require("./routes/comments.js");

// app config
mongoose.connect("mongodb://localhost/watch_list", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);    // to make mongoose use findOneAndUpdate() we set this to false (deprecation thing)
app.set("view engine", "ejs");

// app set up
app.use(require("express-session")({
    secret: "widepeepoHappy ",
    resave: false,
    saveUninitialized: false
}));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());


// passport config
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware
app.use(function(req, res, next) {
    Comment.find({}, function(err, comments) {
        app.locals.comments = comments;                         
    });                                                          // req.locals is not reliable in case of page redirect
    app.locals.currentUser = req.user;                          // app.locals works throughout 
    next();
});

// Using the routes
app.use("/watchlist", watchlistRoutes);
app.use("/", indexRoutes);
app.use("/comments", commentsRoutes);


app.listen("3000", () => {
    console.log("listening on 3000");
});