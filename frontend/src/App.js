import React, { useState } from "react";
import "./App.css";
import { FaSearch, FaMicrophone } from "react-icons/fa";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <img
          src="https://your-image-link.com/your-image.jpg"
          alt="Movie Streamer Logo"
          className="img-fluid rounded-circle"
        />
        <h1 className="mt-3 text-primary">Welcome to Movie Streamer</h1>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">
          Movie Streamer
        </a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <input
                className="form-control mr-2"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </li>
            <li className="nav-item">
              <button className="btn btn-primary">
                <FaSearch className="search-icon" />
              </button>
            </li>
            <li className="nav-item">
              <button className="btn btn-primary">
                <FaMicrophone className="voice-icon" />
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="row mt-4">
        <div className="col-md-6">
          <h2 className="mb-3 text-secondary">Mood</h2>
          <div className="movie-box p-3 rounded shadow bg-white mb-4">
            <img
              src="https://your-image-link.com/mood-image1.jpg"
              alt="Mood Title 1"
              className="img-fluid rounded-top"
            />
            <h3>Mood Title 1</h3>
            <p>Mood Description 1</p>
          </div>
          <div className="movie-box p-3 rounded shadow bg-white">
            <img
              src="https://your-image-link.com/mood-image2.jpg"
              alt="Mood Title 2"
              className="img-fluid rounded-top"
            />
            <h3>Mood Title 2</h3>
            <p>Mood Description 2</p>
          </div>
        </div>

        <div className="col-md-6">
          <h2 className="mb-3 text-secondary">Plot</h2>
          <div className="movie-box p-3 rounded shadow bg-white mb-4">
            <img
              src="https://your-image-link.com/plot-image1.jpg"
              alt="Plot Title 1"
              className="img-fluid rounded-top"
            />
            <h3>Plot Title 1</h3>
            <p>Plot Description 1</p>
          </div>
          <div className="movie-box p-3 rounded shadow bg-white">
            <img
              src="https://your-image-link.com/plot-image2.jpg"
              alt="Plot Title 2"
              className="img-fluid rounded-top"
            />
            <h3>Plot Title 2</h3>
            <p>Plot Description 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
