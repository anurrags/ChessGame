import User from "./User";
import { BLACK, Chess } from "chess.js";
import { move } from "../Utils/types";
import {
  GAME_DRAW_MESSAGE,
  GAME_OVER,
  GAME_STALEMATE_MESSAGE,
  GAME_START,
  GAME_THREEFOLD_DRAW_MESSAGE,
  INSUFFICIENT_MATERIAL_MESSAGE,
  KING_CHECK,
  KING_CHECK_OVER,
  MOVE,
  WHITE,
} from "../Utils/constants";

class GameRoom {
  public roomId: string;
  public player1: User;
  public player2: User | null;
  private moves: move[];
  private chess: Chess;

  constructor(roomId: string, player1: User) {
    this.roomId = roomId;
    this.player1 = player1;
    this.player2 = null;
    this.moves = [];
    this.chess = new Chess();
  }
  addFirstPlayer(player: User) {
    this.player1 = player;
  }
  addSecondPlayer(player: User) {
    this.player2 = player;
  }

  startGame() {
    if (this.player2) {
      this.player1.socket.emit(GAME_START, {
        color: "w",
        roomId: this.roomId,
      });
      this.player2.socket.emit(GAME_START, {
        color: "b",
        roomId: this.roomId,
      });
    } else {
      console.log("Player 2 not connected");
    }
  }

  makeMove(move: move) {
    try {
      this.chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      if (move.user === this.player1.socket.id && !(this.moves.length & 1)) {
        this.player2?.socket.emit(MOVE, move);
      } else if (
        move.user === this.player2?.socket.id &&
        this.moves.length & 1
      ) {
        this.player1.socket.emit(MOVE, move);
      } else {
        throw new Error("Invalid move");
      }
      this.moves.push(move);
      if (this.chess.isDraw()) {
        this.player1.socket.emit(GAME_OVER, GAME_DRAW_MESSAGE);
        this.player2?.socket.emit(GAME_OVER, GAME_DRAW_MESSAGE);
      } else if (this.chess.isStalemate()) {
        this.player1.socket.emit(GAME_OVER, GAME_STALEMATE_MESSAGE);
        this.player2?.socket.emit(GAME_OVER, GAME_STALEMATE_MESSAGE);
      } else if (this.chess.isInsufficientMaterial()) {
        this.player1.socket.emit(GAME_OVER, INSUFFICIENT_MATERIAL_MESSAGE);
        this.player2?.socket.emit(GAME_OVER, INSUFFICIENT_MATERIAL_MESSAGE);
      } else if (this.chess.isThreefoldRepetition()) {
        this.player1.socket.emit(GAME_OVER, GAME_THREEFOLD_DRAW_MESSAGE);
        this.player2?.socket.emit(GAME_OVER, GAME_THREEFOLD_DRAW_MESSAGE);
      } else if (this.chess.isGameOver()) {
        this.player1.socket.emit(
          GAME_OVER,
          `Checkmate ${this.chess.turn() === "w" ? BLACK : WHITE} is the winner`
        );
        this.player2?.socket.emit(
          GAME_OVER,
          `Checkmate ${this.chess.turn() === "w" ? BLACK : WHITE} is the winner`
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  kingCheck(row: string, col: string) {
    this.player1.socket.emit(KING_CHECK, { row: row, col: col });
    this.player2?.socket.emit(KING_CHECK, { row: row, col: col });
  }

  checkOver() {
    this.player1.socket.emit(KING_CHECK_OVER, "Check is over");
    this.player2?.socket.emit(KING_CHECK_OVER, "Check is over");
  }

  endGame() {
    this.player1.socket.disconnect(true);
    this.player2?.socket.disconnect(true);
  }
}

export default GameRoom;
