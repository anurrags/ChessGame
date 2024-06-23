import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import ChessBoard from "./chessboard/board";
import { Chess } from "chess.js";
import Connection from "../Utils/connection";
import { move } from "../Utils/types";

const Game: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [chess, setChess] = useState<Chess>(new Chess());
  const [board, setBoard] = useState(chess.board());

  const makeMove = ({ from, to }: { from: string; to: string }) => {
    if (chess.turn() !== color) {
      console.log("Not your turn");
      return;
    }
    try {
      const move = chess.move({ from, to });
      if (move) {
        setBoard(chess.board());
        socket?.emit("move", {
          from: from,
          to: to,
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
    const newSocket = new Connection("http://localhost:9000").socket;

    newSocket.on(
      "game-start",
      ({ color, roomId }: { color: string; roomId: string }) => {
        console.log(`Game started. You are ${color}`);
        setColor(color);
        setRoomId(roomId);
        chess.reset();
        setBoard(chess.board());
      }
    );

    newSocket.on("game-over", (message: string) => {
      alert(message);
      newSocket.disconnect();
    });
    newSocket.on("move", (move: move) => {
      try {
        const moved = chess.move({ from: move.from, to: move.to });
        if (moved) {
          setBoard(chess.board());

          console.log(`Move ${move.from} to ${move.to}`);
        }
      } catch (error) {
        console.log(error);
      }
    });

    newSocket.on("connection-message", (message: string) => {
      console.log(message);
    });

    newSocket.on("disconnect", () => {
      newSocket.emit("exiting-from-game", roomId);
      console.log(`Disconnected from room ${roomId}`);
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
      <h1>Chess Game</h1>

      <button onClick={connectToServer}>Connect</button>
      <button onClick={disConnectToServer}>Disconnect</button>

      <ChessBoard board={board} makeMove={makeMove} />
    </div>
  );
};

export default Game;
