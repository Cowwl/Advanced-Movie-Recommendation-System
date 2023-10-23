import React, { useState } from "react";
import axios from "axios";
import Search from "./components/Search";
import Results from "./components/Results";
import Detail from "./components/Detail";
import { BrowserRouter as Router, Route, Routes, Link, Outlet } from "react-router-dom"; // Import Link and Outlet
import Plot from "./Plot"; // Import the Plot component
import Mood from "./Mood"; // Import the Mood component
import "./App.css";

function App() {
  const [state, setState] = useState({
    s: "sherlock",
    results: [],
    selected: {}
  });

  const apiurl = "https://www.omdbapi.com/?apikey=5426c86e";

  const searchInput = (e) => {
    let s = e.target.value;

    setState((prevState) => {
      return { ...prevState, s: s };
    });
  };

  const search = (e) => {
    if (e.key === "Enter") {
      axios(apiurl + "&s=" + state.s).then(({ data }) => {
        let results = data.Search;

        setState((prevState) => {
          return { ...prevState, results: results };
        });
      });
    }
  };

  const openDetail = (id) => {
    axios(apiurl + "&i=" + id).then(({ data }) => {
      let result = data;

      setState((prevState) => {
        return { ...prevState, selected: result };
      });
    });
  };

  const closeDetail = () => {
    setState((prevState) => {
      return { ...prevState, selected: {} };
    });
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Movie Streamer</h1>
        </header>
        <nav>
          <Link to="/" className="button">
            Home
          </Link>{"  "}
          <Link to="/plot" className="button">
            Plot
          </Link>{"  "}
          <Link to="/mood" className="button">
            Mood
          </Link>
        </nav>
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <Search searchInput={searchInput} search={search} />
                  <Results results={state.results} openDetail={openDetail} />
                  {typeof state.selected.Title !== "undefined" ? (
                    <Detail selected={state.selected} closeDetail={closeDetail} />
                  ) : (
                    false
                  )}
                </div>
              }
            />
            <Route path="/plot" element={<Plot results={state.results} />} />
            <Route path="/mood" element={<Mood results={state.results} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
