import { Square, PieceSymbol, Color, Chess } from "chess.js";
import "./board.css";
import { useState } from "react";
import { chessSquare, possibleMoves } from "../../Utils/types";
import { getAttackingSquares } from "../../Utils/getAttackingSquare";
import { convertToChessNotation } from "../../Utils/getChessNotation";

const ChessBoard = ({
  board,
  makeMove,
  chess,
  color,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  makeMove: ({ from, to }: { from: string; to: string }) => void;
  chess: Chess;
  color: string;
}) => {
  const [from, setFrom] = useState<string>("");
  const [movableSquare, setMovableSquare] = useState<chessSquare[] | null>(
    null
  );
  const [attackSquare, setAttackerSquare] = useState<chessSquare[] | null>(
    null
  );

  const handleOnSquareClick = (
    i: number,
    j: number,
    el: {
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null
  ) => {
    if (chess.turn() !== color) return;
    const square = convertToChessNotation(i, j) as Square;

    if (from === "" && board[i][j]?.square == null) {
      console.log("Select valid from square");
      return;
    }
    if (from === "" && el) {
      if (el.color !== (color as Color)) return;
      const possibleMoves: possibleMoves = getAttackingSquares(
        {
          piece: el.type,
          color: el.color,
          position: { row: i, col: j },
        },
        chess
      );
      setMovableSquare(possibleMoves.movableSquare);
      setAttackerSquare(possibleMoves.attackingSquares);
      setFrom(square);
    } else {
      setFrom("");
      setMovableSquare(null);
      setAttackerSquare(null);
      const to = square;
      makeMove({ from, to });
    }
  };

  return (
    <div className="chessboard-container">
      <div className="chessboard-inner-container">
        {board.map((row, i) => {
          return (
            <div key={i} className="chessboard-row">
              {row.map((el, j) => {
                return (
                  <div
                    key={j}
                    className={`chessboard-square ${
                      (i + j) & 1 ? "light" : "dark"
                    }-square ${
                      movableSquare?.some((sq) => sq.row === i && sq.col === j)
                        ? "moveable-square"
                        : null
                    } ${
                      from === convertToChessNotation(i, j)
                        ? "active-square"
                        : null
                    } ${
                      attackSquare?.some((sq) => sq.row === i && sq.col === j)
                        ? "attack-square"
                        : null
                    }`}
                    onClick={(e) => handleOnSquareClick(i, j, el)}
                  >
                    {el?.type && (
                      <img
                        className="chess-piece"
                        src={`/chessPiece/${el.color === "w" ? "w" : "b"}${
                          el.type
                        }.png`}
                        alt={el.type}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoard;
