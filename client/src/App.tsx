import React from "react";
import "./App.css";
import Game from "./components/game";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="header-heading heading-gradient">Grandmaster</h1>
      </header>
      <main>
        <Game />
      </main>
    </div>
  );
}

export default App;
