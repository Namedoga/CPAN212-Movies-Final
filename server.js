const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();



const Movie = require("./models/movie");
const User = require("./models/user");

const app = express();
const PORT = 8000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // because home.ejs is in root

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "supersecret", // change in real app
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId;
  res.locals.currentUsername = req.session.username;
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}



app.get("/", (req, res) => {
  return res.render("home");
});

app.get("/movies", async (req, res) => {
  const movies = await Movie.find().lean();
  return res.render("movies", {
    movielist: movies
  });
});

//authentication routes

app.get("/register", (req, res) => {
  res.render("auth/register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.redirect("/register");
  }

  const hash = await bcrypt.hash(password, 10);
  await User.create({ username: username, passwordHash: hash });

  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username });
  if (!user) {
    return res.redirect("/login");
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.redirect("/login");
  }

  req.session.userId = user._id.toString();
  req.session.username = user.username;

  res.redirect("/movies");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

//protected crud routes

app.get("/movies/new", requireLogin, (req, res) => {
  res.render("movies/new");
});

app.post("/movies", requireLogin, async (req, res) => {
  const { name, description, year, genres, rating, imageUrl } = req.body;

  const genreArray = genres
    .split(",")
    .map(g => g.trim())
    .filter(g => g.length > 0);

  await Movie.create({
    name,
    description,
    year,
    genres: genreArray,
    rating,
    imageUrl,
    owner: req.session.userId
  });

  res.redirect("/movies");
});

app.get("/movies/:id/edit", requireLogin, async (req, res) => {
  const movie = await Movie.findById(req.params.id).lean();
  if (!movie) {
    return res.redirect("/movies");
  }

  if (movie.owner.toString() !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  res.render("movies/edit", { movie });
});

app.post("/movies/:id/edit", requireLogin, async (req, res) => {
  const { name, description, year, genres, rating, imageUrl } = req.body;
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return res.redirect("/movies");
  }

  if (movie.owner.toString() !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  const genreArray = genres
    .split(",")
    .map(g => g.trim())
    .filter(g => g.length > 0);

  movie.name = name;
  movie.description = description;
  movie.year = year;
  movie.genres = genreArray;
  movie.rating = rating;
  movie.imageUrl = imageUrl;

  await movie.save();

  res.redirect("/movies");
});

app.post("/movies/:id/delete", requireLogin, async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return res.redirect("/movies");
  }

  if (movie.owner.toString() !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  await Movie.findByIdAndDelete(req.params.id);

  res.redirect("/movies");
});
// Routes
// const movieRoutes = require("./routes/movies");
// app.use("/movies", movieRoutes);

app.listen(PORT, () => {
  console.log(`Running http://localhost:${PORT}`);
});
