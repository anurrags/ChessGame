import { Socket } from "socket.io";
import GameRoom from "./GameRoom";
import User from "./User";
import { randomUUID } from "crypto";
import { move } from "../Utils/types";
import { CONNECTION_MESSAGE } from "../Utils/constants";

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
    user.emit(CONNECTION_MESSAGE, "Connected to the server");
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

  kingCheck(data: { row: string; col: string; roomId: string }) {
    const gameRoom = this.games.get(data.roomId);
    if (gameRoom) {
      gameRoom.kingCheck(data.row, data.col);
    }
  }

  checkOver(data: { row: string; col: string; roomId: string }) {
    const gameRoom = this.games.get(data.roomId);
    if (gameRoom) {
      gameRoom.checkOver();
    }
  }

  removeUser(roomId: string) {
    const finishedGame = this.games.get(roomId);
    if (finishedGame) {
      finishedGame.endGame();

      this.users.delete(finishedGame.player1.socket.id);
      if (finishedGame.player2) {
        this.users.delete(finishedGame.player2.socket.id);
      } else this.pendingRoomId = null;

      console.log(`Game Room ${roomId} removed`);
      this.games.delete(roomId);
    }
  }

  gameExited(socket: Socket) {
    const roomId = this.users.get(socket.id);

    if (roomId) {
      this.removeUser(roomId);
    }
  }
}

export default GameManager;
