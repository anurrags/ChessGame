import env from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { move } from "./Utils/types";
import GameManager from "./modals/GameManager";
import {
  CONNECTION,
  DISCONNECTION,
  EXIT_GAME,
  KING_CHECK,
  KING_CHECK_OVER,
  MOVE,
} from "./Utils/constants";

env.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

const gameManager = new GameManager();

io.on(CONNECTION, (socket: Socket) => {
  console.log(`New user connected: ${socket.id}`);
  gameManager.addUser(socket);

  socket.on(MOVE, (message: move) => {
    gameManager.makeMove(message);
  });

  socket.on(
    KING_CHECK,
    (data: { row: string; col: string; roomId: string }) => {
      gameManager.kingCheck(data);
    }
  );

  socket.on(
    KING_CHECK_OVER,
    (data: { row: string; col: string; roomId: string }) => {
      gameManager.checkOver(data);
    }
  );
  // When user disconnects by clicking button
  socket.on(EXIT_GAME, (roomId: string) => {
    gameManager.removeUser(roomId);
  });

  // when user disconnects by closing window or due to any other unexpected events
  socket.on(DISCONNECTION, () => {
    console.log(`User disconnected: ${socket.id}`);
    gameManager.gameExited(socket);
  });
});
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
