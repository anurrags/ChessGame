import { Socket } from "socket.io";
import GameRoom from "./GameRoom";
import User from "./User";
import { randomUUID } from "crypto";
import { move } from "../Utils/types";

class GameManager {
  public games: Map<string, GameRoom>;
  private users: Map<string, string>;
  private pendingRoomId: string | null;

  constructor() {
    this.games = new Map<string, GameRoom>();
    this.users = new Map<string, string>();
    this.pendingRoomId = null;
    console.log("Started Game Manager");
  }

  addUser(user: Socket) {
    const player = new User(user);
    user.emit("connection-message", "Connected to the server");
    if (this.pendingRoomId === null) {
      this.pendingRoomId = randomUUID();
      this.users.set(player.socket.id, this.pendingRoomId);
      const gameRoom = new GameRoom(this.pendingRoomId, player);
      this.games.set(this.pendingRoomId, gameRoom);
      console.log(`New Game Room created: ${this.pendingRoomId}`);
      console.log(`Player 1: ${user.id} joined room: ${this.pendingRoomId}`);
    } else {
      const gameRoom = this.games.get(this.pendingRoomId);
      if (gameRoom) {
        this.users.set(player.socket.id, this.pendingRoomId);
        gameRoom.addSecondPlayer(player);
        console.log(`Player 2: ${user.id} joined room: ${this.pendingRoomId}`);
        gameRoom.startGame();
        this.pendingRoomId = null;
      }
    }
  }

  makeMove(move: move) {
    const gameRoom = this.games.get(move.roomId);
    if (gameRoom) {
      gameRoom.makeMove(move);
    }
  }
  removeUser(roomId: string) {
    const finishedGame = this.games.get(roomId);
    if (finishedGame) {
      finishedGame.endGame();
      this.games.delete(roomId);
      console.log(`Game Room ${roomId} removed`);
    }
  }

  gameExited(socket: Socket) {
    const roomId = this.users.get(socket.id);

    if (roomId) {
      const gameRoom = this.games.get(roomId);
      if (gameRoom) {
        console.log(`Game Room ${roomId} closed`);
        gameRoom.exitGame(new User(socket));
        this.users.delete(gameRoom.player1.socket.id);
        if (gameRoom.player2) this.users.delete(gameRoom.player2.socket.id);
      }
      this.games.delete(roomId);
    }
  }
}

export default GameManager;
