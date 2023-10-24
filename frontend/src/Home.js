import React, { useEffect, useState } from "react";
import axios from "axios";
import { Div, Button, Input, Text, Image, Container, Row, Col } from "atomize";

function Home({ results }) {
  const [movieDetails, setMovieDetails] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)(); // Initialize the Web Speech API recognition object

  // Initialize the recognition settings
  recognition.continuous = true;
  recognition.interimResults = true;

  let silenceTimer = null;

  recognition.onresult = (event) => {
    // Handle speech recognition results
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");

    // Update the searchInput state as you speak
    setSearchInput(transcript);

    // Clear the silence timer
    clearTimeout(silenceTimer);

    // Set a new silence timer
    silenceTimer = setTimeout(() => {
      recognition.stop();
      // Automatically press the search button
      handleSearch(searchInput);
    }, 2000); // Stop listening after 3 seconds of silence
  };

  const handleSearch = (input) => {
    axios
      .post("http://localhost:8000/plot/search-plot?user_input=" + input)
      .then((response) => {
        const imdbIDs = response.data.map((movie) => movie.imdb_id);
        fetchMovieDetails(imdbIDs);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };

  const fetchMovieDetails = async (imdbIDs) => {
    try {
      const movieDetailsPromises = imdbIDs.map((id) => {
        return axios.get(`https://www.omdbapi.com/?i=${id}&apikey=5426c86e`);
      });

      const movieDetailsResponses = await Promise.all(movieDetailsPromises);
      const movieDetailsData = movieDetailsResponses.map(
        (response) => response.data
      );
      setMovieDetails(movieDetailsData);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  useEffect(() => {
    const imdbIDs = results.map((result) => result.imdb_id);
    fetchMovieDetails(imdbIDs);
  }, [results]);

  const startListening = () => {
    recognition.start();
  };

  return (
    <Container className="App">
      <Div>
        <Div
          d="flex"
          justify="center"
          w="auto"
          m={{ b: "1rem", t: "1rem" }}
          align="center"
        >
          <Input
            placeholder="Search for a movie by its name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleSearch(searchInput);
              }
            }}
            m={{ r: "0.5rem" }}
            w="40rem"
          />
          <Button
            onClick={() => handleSearch(searchInput)}
            m={{ r: "0.5rem" }}
            bg="#e62360"
            textColor="white"
          >
            Search
          </Button>
          <Button onClick={startListening} bg="#e62360" textColor="white">
            Voice
          </Button>
        </Div>
        {movieDetails.length > 0 && (
          <Row>
            {movieDetails.map((movie) => (
              <Col size={{ xs: 12, md: 6, lg: 4 }} key={movie.imdbID}>
                <Div
                  className="card"
                  p="1rem"
                  m={{ b: "1rem" }}
                  shadow="3"
                  rounded="lg"
                >
                  <Image
                    src={movie.Poster}
                    alt={movie.Title}
                    h="30rem"
                    w="100%"
                    rounded="md"
                  />
                  <Text tag="h2" textSize="title" m={{ y: "0.5rem" }}>
                    {movie.Title}
                  </Text>
                  <Text textSize="body" textWeight="500">
                    Plot: {movie.Plot}
                  </Text>
                </Div>
              </Col>
            ))}
          </Row>
        )}
      </Div>
    </Container>
  );
}

export default Home;
