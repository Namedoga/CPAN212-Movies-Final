const express = require("express");
const router = express.Router();


// temp data
let movies = [
    { id: "1", name: "Inception", year: 2010, rating: 9 },
    { id: "2", name: "The Dark Knight", year: 2008, rating: 9 },

]

//list all movies
router.get("/movies", (req, res) => {
    return res.render("movies.ejs", { movies: movies });
});



//show add movie form
router.get("/movies/add", (req, res) => {
    return res.render("addMovie.ejs");
});


//validate + save
router.post("/movies", express.urlencoded({ extended: true }), (req, res) => {
    const { name, year, rating, description, genre } = req.body;
    if (!name || !year || !rating || !description || !genre) {
        return res.status(400).send("All fields are required");
    }
    const newMovie = { id: String(Date.now()), name, year, rating, description, genre };
    movies.push(newMovie);
    return res.redirect("/movies");

});


//show movie details
router.get("/movies/:id", (req, res) => {
    const movie = movies.find(m => m.id === req.params.id);
    if (!movie) {
        return res.status(404).send("Movie not found");
    }
    return res.render("movieDetails.ejs", { movie: movie });

});


//show edit movie form
router.get("/movies/:id/edit", express.urlencoded({ extended: true }), (req, res) => {
    const movie = movies.find(m => m.id === req.params.id);
    if (!movie) {
        return res.status(404).send("Movie not found");
    }
    return res.render("editMovie.ejs", { movie: movie });

});


//validate + update
router.post("/movies/:id/edit", express.urlencoded({ extended: true }), (req, res) => {
    const movie = movies.find(m => m.id === req.params.id);
    if (!movie) {
        return res.status(404).send("Movie not found");
    }
    const { name, year, rating, description, genre } = req.body;
    if (!name || !year || !rating || !description || !genre) {
        return res.status(400).send("All fields are required");
    }
    movie.name = name;
    movie.year = Number(year);
    movie.rating = Number(rating);
    movie.description = description;
    movie.genre = genre;
    return res.redirect(`/movies/${movie.id}`);

});


//delete    
router.post("/movies/:id/delete", express.urlencoded({ extended: true }), (req, res) => {
    const movie = movies.find(m => m.id === req.params.id);
    if (!movie) {
        return res.status(404).send("Movie not found");
    }
    movies = movies.filter(m => m.id !== req.params.id);
    return res.redirect("/movies");
});

module.exports = router;
