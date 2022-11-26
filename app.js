const express = require("express");
const cors = require("cors");
const ejs = require("ejs");
const app = express();
require("./config/database");
require("./config/passport");
require("dotenv").config();
const User = require("./models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { nextTick } = require("process");

app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
    }),
    //cookie: { secure: true }
  })
);

app.use(passport.initialize());
app.use(passport.session());

//base url
app.get("/", (req, res) => {
  res.render("index");
});

//register : get
app.get("/register", (req, res) => {
  res.render("register");
});

//register : post
// app.post("/register", async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (user) return res.status(400).send("User already exist");
//     bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
//       const newUser = new User({
//         username: req.body.username,
//         password: hash,
//       });
//       await newUser.save();
//     });
//     res.status(201).redirect("/login");
//   } catch (error) {
//     res.status(500).send("registered isn't success");
//   }
// });

const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  next();
};

//login: get
app.get("/login", checkLoggedIn, (req, res) => {
  res.render("login");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/profile",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

//login : post
// app.post(
//   "/login",
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     successRedirect: "/profile",
//   })
// );

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("login");
};
//profile protected route
app.get("/profile", checkAuthenticated, (req, res) => {
  res.render("profile", { username: req.user.username });
});

//logout
app.get("/logout", (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = app;
