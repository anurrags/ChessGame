import React from "react";
import "./App.css";
import Game from "./components/game";
import ChatWidget from "./components/chatwidget";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="header-heading heading-gradient">Grandmaster</h1>
      </header>
      <main>
        <Game />
      </main>
      <ChatWidget />
    </div>
  );
}

export default App;
