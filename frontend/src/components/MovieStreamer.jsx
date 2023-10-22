// MovieStreamer.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Input, Icon, Button } from "atomize";
import axios from "axios";

// A custom component for displaying a movie card
const MovieCard = ({ movie, onClick }) => {
  return (
    <Col size={{ xs: 6, md: 4, lg: 3 }} p="0.5rem">
      <Button
        h="20rem"
        bgImg={movie.Poster}
        bgSize="cover"
        bgPos="center"
        hoverBg="black"
        hoverShadow="4"
        rounded="md"
        onClick={() => onClick(movie.imdbID)}
      >
        <Icon
          name="Play"
          size="40px"
          color="white"
          m={{ b: "0.5rem" }}
          hoverColor="warning700"
        />
      </Button>
    </Col>
  );
};

// A custom component for displaying a movie detail modal
const MovieDetail = ({ movie, onClose }) => {
  return (
    <Container
      pos="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.8)"
      d="flex"
      align="center"
      justify="center"
      overflow="auto"
      onClick={onClose}
    >
      <Container
        w={{ xs: "90%", md: "60%", lg: "40%" }}
        maxW="36rem"
        bg="white"
        shadow="4"
        rounded="md"
        p="1.5rem"
        onClick={(e) => e.stopPropagation()}
      >
        <Row>
          <Col size={{ xs: 12, md: 6 }} d="flex" align="center" justify="center">
            <img src={movie.Poster} alt={movie.Title} width="100%" />
          </Col>
          <Col size={{ xs: 12, md: 6 }} p={{ x: { md: "1rem" } }}>
            <h1>{movie.Title}</h1>
            <p>{movie.Plot}</p>
            <p>
              <strong>Genre:</strong> {movie.Genre}
            </p>
            <p>
              <strong>Director:</strong> {movie.Director}
            </p>
            <p>
              <strong>Actors:</strong> {movie.Actors}
            </p>
            <p>
              <strong>IMDB Rating:</strong> {movie.imdbRating}
            </p>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

// The main component for the movie streaming website
const MovieStreamer = () => {
  // The state variables for the app
  const [query, setQuery] = useState(""); // The search query
  const [results, setResults] = useState([]); // The search results
  const [selected, setSelected] = useState(null); // The selected movie
  const [loading, setLoading] = useState(false); // The loading indicator
  const [error, setError] = useState(null); // The error message

  // The API key and URL for the OMDB API
  const apiKey = "a2526df0";
  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}`;

  // A function to handle the input change event
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // A function to handle the voice input event
  const handleVoiceInput = () => {
    // TODO: Implement the voice input logic using Web Speech API or other libraries
    alert("Voice input is not implemented yet");
  };

  // A function to handle the search event
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      setError(null);
      axios
        .get(`${apiUrl}&s=${query}`)
        .then(({ data }) => {
          if (data.Response === "True") {
            setResults(data.Search);
          } else {
            setError(data.Error);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  };

  // A function to handle the movie click event
  const handleMovieClick = (id) => {
    setLoading(true);
    setError(null);
    axios
      .get(`${apiUrl}&i=${id}`)
      .then(({ data }) => {
        setSelected(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // A function to handle the movie close event
  const handleMovieClose = () => {
    setSelected(null);
  };

  // A useEffect hook to fetch the movies by mood and plot when the component mounts
  useEffect(() => {
    // TODO: Implement the logic to fetch the movies by mood and plot using some API or data source
    // For now, we will use some dummy data for demonstration purposes
    const dummyData = [
      {
        Title: "The Shawshank Redemption",
        Year: "1994",
        imdbID: "tt0111161",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/I/51zUbui+gNL._AC_.jpg",
      },
      {
        Title: "The Godfather",
        Year: "1972",
        imdbID: "tt0068646",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/I/51v5ZpFyaFL._AC_.jpg",
      },
      {
        Title: "The Dark Knight",
        Year: "2008",
        imdbID: "tt0468569",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/I/71qG253LDSL._AC_SY679_.jpg",
      },
      {
        Title: "The Lord of the Rings: The Return of the King",
        Year: "2003",
        imdbID: "tt0167260",
        Type: "movie",
        Poster: "https://m.media-amazon.com/images/I/51Qvs9i5aL._AC_.jpg",
      },
    ];
    setResults(dummyData);
  }, []);

  return (
    <Container>
      <Row p="1rem" align="center">
        <Col size={{ xs: 10, md: 11 }}>
          <Input
            placeholder="Search for a movie..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleSearch}
            suffix={
              <Icon
                name="Search"
                size="20px"
                cursor="pointer"
                onClick={handleSearch}
                pos="absolute"
                top="50%"
                right="1rem"
                transform="translateY(-50%)"
              />
            }
          />
        </Col>
        <Col size={{ xs: 2, md: 1 }}>
          <Icon
            name="Microphone"
            size="20px"
            cursor="pointer"
            onClick={handleVoiceInput}
          />
        </Col>
      </Row>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {results.length > 0 && (
        <>
          <h2>By Mood</h2>
          <Row className="results">
            {results.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onClick={handleMovieClick}
              />
            ))}
          </Row>
          <h2>By Plot</h2>
          <Row className="results">
            {results.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onClick={handleMovieClick}
              />
            ))}
          </Row>
        </>
      )}
      {selected && (
        <MovieDetail movie={selected} onClose={handleMovieClose} />
      )}
    </Container>
  );
};

export default MovieStreamer;
