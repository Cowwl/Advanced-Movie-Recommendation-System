import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Results from "./components/Results";
import axios from "axios";

function Plot({ results }) {
  const [movieDetails, setMovieDetails] = useState([]);
  const [searchInput, setSearchInput] = useState(""); // State to store the user's input

  const handleSearch = () => {
    // Send a POST request to the backend
    axios
      .post("http://localhost:8000/search-plot/", { user_input: searchInput })
      .then((response) => {
        // Handle the response data here
        const movieDetailsData = response.data;
        setMovieDetails(movieDetailsData);
      })
      .catch((error) => {
        // Handle errors here
        console.error("Error fetching movie details:", error);
      });
  };

  useEffect(() => {
    // Fetch movie details for the initial results
    const fetchMovieDetails = async () => {
      try {
        const movieDetailsPromises = results.map((result) => {
          const imdb_id = result.imdb_id;
          return axios.get(`https://www.omdbapi.com/?i=${imdb_id}&apikey=5426c86e`);
        });

        const movieDetailsResponses = await Promise.all(movieDetailsPromises);
        const movieDetailsData = movieDetailsResponses.map((response) => response.data);
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
        <Search
          results={results}
          onSearch={(input) => {
            setSearchInput(input);
          }}
          onSearchSubmit={handleSearch} // Handle the search on submit
        />
        <Results results={results} />
        {movieDetails.map((movie, index) => (
          <div key={index}>
            <h2>{movie.Title}</h2>
            <p>Plot: {movie.Plot}</p>
            {/* Add more movie details as needed */}
          </div>
        ))}
      </main>
    </div>
  );
}

export default Plot;
