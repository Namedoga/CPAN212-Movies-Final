const express = require("express");
const path = require("path");
const mongoose = require("mongoose");



const app = express();
const PORT = 8000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://myuser:MyPass123@moviescluster.rclix8e.mongodb.net/moviesdb")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

require("dotenv").config();

app.get("/", (req, res) => {
  return res.render("home");
});

// Routes
const movieRoutes = require("./routes/movies");
app.use("/movies", movieRoutes);

app.listen(PORT, () => {
  console.log(`Running http://localhost:${PORT}`);
});
