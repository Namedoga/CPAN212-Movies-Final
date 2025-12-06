const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const movies = [
  { name: "Inception", year: 2010, rating: 9 },
  { name: "The Dark Knight", year: 2008, rating: 9 },
  { name: "Interstellar", year: 2014, rating: 8 },
  { name: "Dune", year: 2021, rating: 8 },
  { name: "Joker", year: 2019, rating: 8 }
];

app.get("/", (req, res) => {
  return res.render("home.ejs");
});

app.get("/movies", (req, res) => {
  return res.render("movies.ejs", { movies: movies });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
