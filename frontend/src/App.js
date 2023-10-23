import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Plot from "./Plot";
import Mood from "./Mood";
import Home from "./Home";
import { Div, Text, Button, Container, Row, Col } from "atomize";
import "./App.css";

function App() {
  const [state, setState] = useState({
    s: "sherlock",
    results: [],
    selected: {},
  });

  const apiurl = "https://www.omdbapi.com/?apikey=5426c86e";

  return (
    <Router>
      <Div bg="gray200" minH="100vh">
        <Container>
          <Row>
            <Col>
              <Text tag="h1" textSize="display2" m={{ y: "1rem" }} textAlign="center">
                Movie Streamer
              </Text>
            </Col>
          </Row>
          <Row>
            <Col size={4}>
              <Button
                tag="a"
                href="/home"
                textColor="white"
                hoverTextColor="black"
                bg="info700"
                hoverBg="info300"
                rounded="circle"
                p={{ r: "1.5rem", l: "1.5rem" }}
              >
                Home
              </Button>
            </Col>
            <Col size={4}>
              <Button
                tag="a"
                href="/plot"
                textColor="white"
                hoverTextColor="black"
                bg="info700"
                hoverBg="info300"
                rounded="circle"
                p={{ r: "1.5rem", l: "1.5rem" }}
              >
                Plot
              </Button>
            </Col>
            <Col size={4}>
              <Button
                tag="a"
                href="/mood"
                textColor="white"
                hoverTextColor="black"
                bg="info700"
                hoverBg="info300"
                rounded="circle"
                p={{ r: "1.5rem", l: "1.5rem" }}
              >
                Mood
              </Button>
            </Col>
          </Row>
        </Container>

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