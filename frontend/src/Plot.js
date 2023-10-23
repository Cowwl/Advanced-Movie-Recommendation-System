import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Results from "./components/Results";
import { Link } from "react-router-dom";
import axios from "axios";

function Plot({ results }) {
  const [movieDetails, setMovieDetails] = useState([]);
  
  useEffect(() => {
    // Fetch movie details for each imdb_id
    const fetchMovieDetails = async () => {
      try {
        const movieDetailsPromises = results.map((result) => {
          const imdb_id = result.imdb_id;
          return axios.get(`https://www.omdbapi.com/?apikey=5426c86e`);
        });
        
        const movieDetailsResponses = await Promise.all(movieDetailsPromises);
        const movieDetailsData = movieDetailsResponses.map(response => response.data);
        setMovieDetails(movieDetailsData);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    
    fetchMovieDetails();
  }, [results]);

  return (
    <div className="App">
      <header className="App-header">
        {/* <h1>Movie Streamer</h1> */}
      </header>
      <main>
        <Search results={results} />
        <Results results={results} />
        {/* Render movie details */}
        {movieDetails.map((movie, index) => (
          <div key={index}>
            <h2>{movie.Title}</h2>
            <p>Plot: {movie.Plot}</p>
            {/* Add more movie details as needed */}
          </div>
        ))}
        {/* <Link to="/mood">Go to Mood</Link> */}
      </main>
    </div>
  );
}

export default Plot;
