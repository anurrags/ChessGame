import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { gameRoom, move } from "./Utils/types";
import GameManager from "./modals/GameManager";

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

  // When user disconnects by clicking button
  socket.on("exiting-from-game", (roomId: string) => {
    gameManager.removeUser(roomId);
  });

  // when user disconnects by closing window or due to any other unexpected events
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    gameManager.gameExited(socket);
    //   try {
    //     console.log(`User disconnected: ${socket.id}`);
    //     const indexGameRoomToClose = findOneRoom(socket);
    //     if (indexGameRoomToClose !== -1) {
    //       const playerExited =
    //         gameRoom[indexGameRoomToClose].player1 === socket
    //           ? gameRoom[indexGameRoomToClose].player2
    //           : gameRoom[indexGameRoomToClose].player1;
    //       console.log(`Room ${indexGameRoomToClose} is closed`);
    //       if (indexGameRoomToClose === gameRoom.length - 1)
    //         isRoomAvailable = false;
    //       if (playerExited)
    //         socket
    //           .to(playerExited.id)
    //           .emit(
    //             "room-closed",
    //             `Room ${indexGameRoomToClose} closed because ${socket.id} exited}`
    //           );
    //       gameRoom.splice(indexGameRoomToClose, 1);
    //       playerExited?.disconnect(true);
    //     }
    //   } catch (error) {
    //     console.log(`Error: ${error}`);
    //   }
    // });
  });

  // const findOneRoom = (socket: Socket) => {
  //   return gameRoom.findIndex(
  //     (room) => room.player1 === socket || room.player2 === socket
  //   );
  // };
});
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
