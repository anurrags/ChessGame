import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import ChessBoard from "./chessboard/board";
import { Chess, Square } from "chess.js";
import Connection from "../Utils/connection";
import { move, chessSquare } from "../Utils/types";

const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:9000";

const Game: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [chess, setChess] = useState<Chess>(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [kingCheckSquare, setKingCheckSquare] = useState<chessSquare | null>(
    null
  );

  const makeMove = ({
    from,
    to,
    promotion,
  }: {
    from: string;
    to: string;
    promotion?: string;
  }) => {
    if (!gameStarted) {
      alert("Game is not started");
      return;
    }
    if (chess.turn() !== color) {
      console.log("Not your turn");
      return;
    }
    try {
      const move = chess.move({ from, to, promotion });
      if (move) {
        setBoard(chess.board());
        socket?.emit("move", {
          from: from,
          to: to,
          promotion: promotion,
          roomId: roomId,
          user: socket.id,
        });
      }
      console.log(`Move from ${from} to ${to}`);
    } catch (error) {
      console.log(error);
    }
  };

  const connectToServer = () => {
    const newSocket = new Connection(serverUrl).socket;
    setSearching(true);
    newSocket.on(
      "game-start",
      ({ color, roomId }: { color: string; roomId: string }) => {
        console.log(`Game started. You are ${color}`);
        setGameStarted(true);
        setSearching(false);
        setColor(color);
        setRoomId(roomId);
        chess.reset();
        setBoard(chess.board());
      }
    );

    newSocket.on("game-over", (message: string) => {
      setGameStarted(false);
      alert(message);
      newSocket.disconnect();
    });

    newSocket.on("move", (move: move) => {
      let audio;
      console.log(chess.get(move.to as Square));

      if (
        chess.get(move.to as Square) &&
        chess.get(move.to as Square).color !== color
      ) {
        audio = new Audio("/sounds/capture.mp3");
      } else {
        audio = new Audio("/sounds/move.mp3");
      }
      try {
        const moved = chess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        });
        if (moved) {
          audio.play();
          setBoard(chess.board());
          console.log(`Move ${move.from} to ${move.to}`);
        }
      } catch (error) {
        console.log(error);
      }
    });

    newSocket.on("king-check", (data: chessSquare) => {
      const audio = new Audio("/sounds/notify.mp3");
      audio.play();
      setKingCheckSquare(data);
    });

    newSocket.on("check-over", (data: string) => {
      setKingCheckSquare(null);
    });

    newSocket.on("connection-message", (message: string) => {
      console.log(message);
    });

    newSocket.on("disconnect", () => {
      setGameStarted(false);
      setColor("");
      newSocket.emit("exiting-from-game", roomId);
      alert(`Disconnected from room ${roomId} because opponent exited`);
    });
    setSocket(newSocket);
  };

  const disConnectToServer = () => {
    if (socket) {
      socket.emit("exiting-from-game", roomId);
      socket.disconnect();
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div>
      <h1 className="header-heading">Chess Game</h1>

      <div className="game-container">
        <ChessBoard
          board={board}
          makeMove={makeMove}
          chess={chess}
          color={color}
          socket={socket}
          kingCheckSquare={kingCheckSquare}
          roomId={roomId}
        />
        <div className="game-btn-div">
          {!gameStarted ? (
            <button
              className={`${searching ? "disabled-btn" : "game-btn"} `}
              onClick={connectToServer}
              disabled={searching}
            >
              {searching ? "Waiting for opponent" : "Play"}
            </button>
          ) : (
            <button className="game-btn" onClick={disConnectToServer}>
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
