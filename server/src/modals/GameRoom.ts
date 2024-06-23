import { Socket } from "socket.io";
import User from "./User";
import { Chess } from "chess.js";
import { move } from "../Utils/types";

class GameRoom {
  public roomId: string;
  public player1: User;
  public player2: User | null;
  private moves: move[];
  private chess: Chess;
  private Board: string;

  constructor(roomId: string, player1: User) {
    this.roomId = roomId;
    this.player1 = player1;
    this.player2 = null;
    this.moves = [];
    this.chess = new Chess();
    this.Board = this.chess.ascii();
  }
  addFirstPlayer(player: User) {
    this.player1 = player;
  }
  addSecondPlayer(player: User) {
    this.player2 = player;
  }

  startGame() {
    if (this.player2) {
      this.player1.socket.emit("game-start", {
        color: "w",
        roomId: this.roomId,
      });
      this.player2.socket.emit("game-start", {
        color: "b",
        roomId: this.roomId,
      });
    } else {
      console.log("Player 2 not connected");
    }
  }

  makeMove(move: move) {
    try {
      this.chess.move({ from: move.from, to: move.to });
      if (move.user === this.player1.socket.id && !(this.moves.length & 1)) {
        this.player2?.socket.emit("move", move);
      } else if (
        move.user === this.player2?.socket.id &&
        this.moves.length & 1
      ) {
        this.player1.socket.emit("move", move);
      } else {
        throw new Error("Invalid move");
      }
      this.moves.push(move);
      if (this.chess.isDraw()) {
        this.player1.socket.emit("game-over", "Game ended in a draw");
        this.player2?.socket.emit("game-over", "Game ended in a draw");
      } else if (this.chess.isStalemate()) {
        this.player1.socket.emit("game-over", "Game ended in a stalemate");
        this.player2?.socket.emit("game-over", "Game ended in a stalemate");
      } else if (this.chess.isInsufficientMaterial()) {
        this.player1.socket.emit("game-over", "Insufficient material");
        this.player2?.socket.emit("game-over", "Insufficient material");
      } else if (this.chess.isThreefoldRepetition()) {
        this.player1.socket.emit("game-over", "Threefold repetition draw");
        this.player2?.socket.emit("game-over", "Threefold repetition draw");
      } else if (this.chess.isGameOver()) {
        this.player1.socket.emit(
          "game-over",
          `Checkmate ${
            this.chess.turn() === "w" ? "black" : "white"
          } is the winner`
        );
        this.player2?.socket.emit(
          "game-over",
          `Checkmate ${
            this.chess.turn() === "w" ? "black" : "white"
          } is the winner`
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  endGame() {
    this.player1.socket.emit("game-end", "Game ended");
    this.player2?.socket.emit("game-end", "Game ended");
    this.player1.socket.disconnect(true);
    this.player2?.socket.disconnect(true);
  }

  exitGame(player: User) {
    this.player1.socket.emit(
      "exit-game-end",
      `Game ended because ${player.socket.id} exited unexpectedly`
    );
    this.player2?.socket.emit(
      "exit-game-end",
      `Game ended because ${player.socket.id} exited unexpectedly`
    );
    this.player1.socket.disconnect(true);
    this.player2?.socket.disconnect(true);
  }
}

export default GameRoom;
