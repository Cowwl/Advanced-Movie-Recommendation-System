import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Plot from "./Plot";
import Mood from "./Mood";
import Home from "./Home";
import { Div, Text, Button } from "atomize";

function App() {
  const [state, setState] = useState({
    s: "sherlock",
    results: [],
    selected: {},
  });

  const apiurl = "https://www.omdbapi.com/?apikey=5426c86e";

  return (
    <Router>
      <Div bg="#07142d" minH="100vh" d="flex" flexDir="column" align="center">
        <Div
          bg="#f99e15"
          d="flex"
          flexDir="row"
          align="center"
          justify="space-between"
          w="100%"
          p={{ x: "1rem" }}
          h="6rem"
          shadow="3"
        >
          <Div>
            <Text
              tag="h1"
              textSize="display2"
              m={{ x: "1rem", y: "1rem" }}
              textAlign="center"
              textColor="#572f2e"
              fontFamily="Ubuntu"
            >
              Movie Streamer
            </Text>
          </Div>
          <Div d="flex" justify="space-around" align="center" w="20rem">
            <Button
              tag="a"
              href="/home"
              textColor="#f9f2d0"
              textSize="subheader"
              bg="#b3623a"
              hoverShadow="4"
              border="1px solid"
              borderColor="white"
              fontFamily="Raleway"
              rounded="circle"
              p={{ r: "1.5rem", l: "1.5rem" }}
            >
              Home
            </Button>
            <Button
              tag="a"
              href="/plot"
              textColor="#f9f2d0"
              bg="#b3623a"
              textSize="subheader"
              fontFamily="Raleway"
              hoverShadow="4"
              border="1px solid"
              borderColor="white"
              rounded="circle"
              p={{ r: "1.5rem", l: "1.5rem" }}
            >
              Plot
            </Button>
            <Button
              tag="a"
              href="/mood"
              textColor="#f9f2d0"
              fontFamily="Raleway"
              border="1px solid"
              borderColor="white"
              textSize="subheader"
              hoverShadow="4"
              bg="#b3623a"
              rounded="circle"
              p={{ r: "1.5rem", l: "1.5rem" }}
            >
              Mood
            </Button>
          </Div>
        </Div>
        <Routes>
          <Route path="/home" element={<Home results={state.results} />} />
          <Route path="/plot" element={<Plot results={state.results} />} />
          <Route path="/mood" element={<Mood results={state.results} />} />
        </Routes>
      </Div>
    </Router>
  );
}

export default App;
