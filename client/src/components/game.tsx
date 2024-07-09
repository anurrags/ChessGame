import React, { useState, useEffect, ReactHTMLElement } from "react";
import { Socket } from "socket.io-client";
import ChessBoard from "./chessboard/board";
import { Chess, Square } from "chess.js";
import Connection from "../Utils/connection";
import { move, chessSquare } from "../Utils/types";
import {
  CONNECTION_MESSAGE,
  DISCONNECTION,
  EXIT_GAME,
  GAME_NOT_STARTED,
  GAME_OVER,
  GAME_START,
  KING_CHECK,
  KING_CHECK_OVER,
  MOVE,
} from "../Utils/constants";

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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
      alert(GAME_NOT_STARTED);
      return;
    }
    if (chess.turn() !== color) {
      return;
    }
    try {
      let audio;

      if (chess.get(to as Square) && chess.get(to as Square).color !== color) {
        audio = new Audio("/sounds/capture.mp3");
      } else {
        audio = new Audio("/sounds/move.mp3");
      }
      const move = chess.move({ from, to, promotion });
      if (move) {
        audio.play();
        setBoard(chess.board());
        socket?.emit(MOVE, {
          from: from,
          to: to,
          promotion: promotion,
          roomId: roomId,
          user: socket.id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectToServer = () => {
    const newSocket = new Connection(serverUrl).socket;
    setSearching(true);
    newSocket.on(
      GAME_START,
      ({ color, roomId }: { color: string; roomId: string }) => {
        console.log(`Game started. You are ${color}`);
        setGameStarted(true);
        setSearching(false);
        setColor(color);
        setRoomId(roomId);
        setKingCheckSquare(null);
        setModalOpen(true);
        chess.reset();
        setBoard(chess.board());
      }
    );

    newSocket.on(GAME_OVER, (message: string) => {
      setGameStarted(false);
      setKingCheckSquare(null);
      alert(message);
      newSocket.disconnect();
    });

    newSocket.on(MOVE, (move: move) => {
      let audio;

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
        }
      } catch (error) {
        console.log(error);
      }
    });

    newSocket.on(KING_CHECK, (data: chessSquare) => {
      const audio = new Audio("/sounds/notify.mp3");
      audio.play();
      setKingCheckSquare(data);
    });

    newSocket.on(KING_CHECK_OVER, (data: string) => {
      setKingCheckSquare(null);
    });

    newSocket.on(CONNECTION_MESSAGE, (message: string) => {
      console.log(message);
    });

    newSocket.on(DISCONNECTION, () => {
      setGameStarted(false);
      setColor("");
      newSocket.emit(EXIT_GAME, roomId);
      alert(`Disconnected from room ${roomId} because opponent exited`);
    });
    setSocket(newSocket);
  };

  const disConnectToServer = () => {
    if (socket) {
      socket.emit(EXIT_GAME, roomId);
      socket.disconnect();
    }
  };

  const closeModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setModalOpen(false);
  };
  useEffect(() => {
    if (!gameStarted) {
      setKingCheckSquare(null);
    }
  }, [gameStarted]);

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
          gameStarted={gameStarted}
        />
        <div
          className={`game-start-modal-container ${
            modalOpen ? "modal-open" : "modal-close"
          }`}
        >
          <h2>Opponent Joined</h2>
          <h3>You are {color === "w" ? "White" : "Black"}</h3>
          <p>All the best!</p>
          <button onClick={closeModal}>Start</button>
        </div>
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
