const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
let db = null;
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// API 1
// get the list of all the movies in the database (movies table)

const ConvertMovieDbAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `SELECT movie_name FROM movie;`;
  const getMoviesListQueryResponse = await db.all(getMoviesListQuery);
  response.send(
    getMoviesListQueryResponse.map((eachMovie) => ConvertMovieDbAPI1(eachMovie))
  );
});

// API 2
// Create a new movie in the Movie Table

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},"${movieName}","${leadActor}")`;
  const creteMovieQueryResponse = db.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

//API 3
// Return a movie based on the movie ID
const convertMovieDBAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie
    WHERE movie_id = ${movieId}`;
  const getMovieQueryResponse = await db.get(getMovieQuery);
  response.send(convertMovieDBAPI3(getMovieQueryResponse));
});

//API 4
// Updates the details of a movie in the movie table based on the Movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `UPDATE movie
    SET director_id = ${directorId}, movie_name = "${movieName}", lead_actor = "${leadActor}"
    WHERE movie_id = ${movieId}`;
  const updateQueryResponse = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//API 5
// Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  const deleteMovieQueryResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
// Returns a list of all director in the director table

const convertDirectorDBAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director`;
  const getDirectorQueryResponse = await db.all(getDirectorQuery);
  response.send(
    getDirectorQueryResponse.map((eachItem) => convertDirectorDBAPI6(eachItem))
  );
});

// API 7
// Return a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieByDirectorQuery = `SELECT movie_name as movieName FROM movie
    WHERE director_id = ${directorId}`;
  const getMovieByDirectorResponse = await db.all(getMovieByDirectorQuery);
  response.send(getMovieByDirectorResponse);
});

module.exports = app;
