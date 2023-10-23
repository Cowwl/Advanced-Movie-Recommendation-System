import React from "react";
import Search from "./components/Search";
import Results from "./components/Results";
import { Link } from "react-router-dom";

function Mood({ results }) {
  return (
    <div className="App">
      <header className="App-header">
        {/* <h1>Movie Streamer</h1> */}
      </header>
      <main>
        <Search results={results} /> {/* Include the Search component */}
        <Results results={results} />
        {/* <Link to="/plot">Go to Plot</Link> Add a button to navigate to the Plot route */}
      </main>
    </div>
  );
}

export default Mood;
