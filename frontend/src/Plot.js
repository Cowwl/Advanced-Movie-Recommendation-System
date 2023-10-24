import axios from "axios";
import { Div, Button, Input, Text, Image, Container, Row, Col } from "atomize";
import { useEffect, useState } from "react";
import { BiMicrophone } from "react-icons/bi";

function Plot() {
  const [movieDetails, setMovieDetails] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.continuous = true;
  recognition.interimResults = true;

  let silenceTimer = null;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");

    setSearchInput(transcript);

    clearTimeout(silenceTimer);

    silenceTimer = setTimeout(() => {
      recognition.stop();
    }, 2000);
  };

  const handleSearch = () => {
    axios
      .post("http://localhost:8000/plot/search-plot?user_input=" + searchInput)
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  useEffect(() => {
    // Fetch recommendations when the component mounts
    axios
      .get("http://localhost:8000/plot/recommend-movies-plot")
      .then((response) => {
        const imdbIDs = response.data.map((movie) => movie.imdb_id);
        fetchMovieDetails(imdbIDs);
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
      });
  }, []);

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
            placeholder="Enter the plot of a movie you want to watch."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                // Handle the search when Enter key is pressed
                handleSearch();
              }
            }}
            m={{ r: "0.5rem" }}
            w="40rem"
          />
          <Button
            onClick={handleSearch} // Trigger search when the button is clicked
            m={{ r: "0.5rem" }}
            bg="#b3623a"
            textColor="white"
            fontFamily="Raleway"
          >
            Search
          </Button>
          <Button
            onClick={startListening}
            bg="#b3623a"
            textColor="white"
            fontFamily="Raleway"
          >
            <BiMicrophone />
          </Button>
        </Div>
        {loading ? (
          <Text
            tag="h2"
            textSize="title"
            m={{ y: "0.5rem" }}
            textColor="#f99e15"
            fontFamily="Raleway"
            textAlign="center"
          >
            Loading...
          </Text>
        ) : (
          movieDetails.length > 0 && (
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
                    <Text
                      tag="h2"
                      textSize="title"
                      m={{ y: "0.5rem" }}
                      fontFamily="Raleway"
                      textColor="#f99e15"
                    >
                      {movie.Title}
                    </Text>
                    <Text
                      textSize="body"
                      textWeight="500"
                      fontFamily="Ubuntu"
                      textColor="gray200"
                    >
                      {movie.Plot}
                    </Text>
                  </Div>
                </Col>
              ))}
            </Row>
          )
        )}
      </Div>
    </Container>
  );
}

export default Plot;
