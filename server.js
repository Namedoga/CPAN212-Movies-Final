const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Movie = require("./models/Movie");


const app = express();
const PORT = 8000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb+srv://myuser:<db_password>@moviescluster.rclix8e.mongodb.net/?appName=MoviesCluster")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  return res.render("home.ejs");
});

app.get("/movies", async (req, res) => {
  const movies = await Movie.find().lean();
  return res.render("movies.ejs", { movielist: movies });
});

app.listen(PORT, () => {
  console.log(`Running http://localhost:${PORT}`);
});
