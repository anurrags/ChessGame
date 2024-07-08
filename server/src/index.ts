import env from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { move } from "./Utils/types";
import GameManager from "./modals/GameManager";

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

io.on("connection", (socket: Socket) => {
  console.log(`New user connected: ${socket.id}`);
  gameManager.addUser(socket);

  socket.on("message", (message: string) => {
    console.log(`Message from ${socket.id}: ${message}`);
    io.emit("message", message);
  });

  socket.on("move", (message: move) => {
    gameManager.makeMove(message);
  });

  socket.on(
    "king-check",
    (data: { row: string; col: string; roomId: string }) => {
      gameManager.kingCheck(data);
    }
  );

  socket.on(
    "check-over",
    (data: { row: string; col: string; roomId: string }) => {
      gameManager.checkOver(data);
    }
  );
  // When user disconnects by clicking button
  socket.on("exiting-from-game", (roomId: string) => {
    gameManager.removeUser(roomId);
  });

  // when user disconnects by closing window or due to any other unexpected events
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    gameManager.gameExited(socket);
  });
});
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
